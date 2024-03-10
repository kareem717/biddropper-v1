import { db } from "@/lib/db/client";
import { companies, media, reviews } from "@/lib/db/schema/tables/content";
import { authOptions } from "@/lib/auth";
import { and, eq, gte, lte, sql } from "drizzle-orm";
import { getServerSession } from "next-auth";
import {
  bodyParamSchema,
  queryParamsSchema,
} from "@/lib/deprecated/validations/api/(content)/reviews/[companyId]/request";
import { CustomError } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";
import getSupabaseClient from "@/lib/supabase/getSupabaseClient";
import { env } from "@/lib/env.mjs";
import { mediaRelationships } from "@/lib/db/schema/tables/relations/content";
import { parse } from "url";

export async function POST(
  req: Request,
  { params }: { params: { companyId: string } },
) {
  if (!params.companyId) {
    return new Response("Missing company ID.", { status: 400 });
  }

  const session = await getServerSession(authOptions);

  if (!session || !session.user.ownedCompanies.length) {
    return new Response(
      JSON.stringify({
        error: "Unauthorized",
      }),
      { status: 401 },
    );
  }

  const reqBody = await req.json();

  const attemptBodyParse = bodyParamSchema.POST.safeParse({
    ...reqBody,
    authorId: session.user.id,
    companyId: params.companyId,
  });

  if (!attemptBodyParse.success) {
    return new Response(
      JSON.stringify({ error: attemptBodyParse.error.issues[0]?.message }),
      { status: 400 },
    );
  }
  const { imageBase64: reviewImages, ...review } = attemptBodyParse.data;

  if (
    session.user.ownedCompanies.some(
      (company) => company.id === params.companyId,
    )
  ) {
    return new Response(
      JSON.stringify({
        error: "Cannot review your own company.",
      }),
      { status: 401 },
    );
  }

  try {
    await db.transaction(async (tx) => {
      // Make sure the company exists
      const [companyExists] = await tx
        .select({ id: companies.id })
        .from(companies)
        .where(
          and(eq(companies.id, params.companyId), eq(companies.isActive, true)),
        )
        .limit(1);

      if (!companyExists) {
        throw new CustomError("Company does not exist.", 404);
      }

      // Make sure the user has not already reviewed the company
      const [hasReviewed] = await tx
        .select({ id: reviews.id })
        .from(reviews)
        .where(
          and(
            eq(reviews.companyId, params.companyId),
            eq(reviews.authorId, session.user.id),
          ),
        )
        .limit(1);

      if (hasReviewed) {
        throw new CustomError("User has already reviewed this company.", 400);
      }

      // Insert review
      const [newRev] = await tx
        .insert(reviews)
        .values({
          ...review,
          companyId: params.companyId,
        })
        .returning({
          id: reviews.id,
        });

      if (!newRev) {
        throw new CustomError("Error creating review.", 500);
      }

      // Insert images
      if (reviewImages?.length) {
        // Assume base64Images is an array of base64 image URLs
        const newMediaIds = reviewImages.map(() => uuidv4());
        const uploadPromises = reviewImages.map(async (imageBase64, index) => {
          const newImageId = newMediaIds[index];
          const fileType = imageBase64.split(";")[0]?.split("/")[1];

          if (!fileType || !["png", "jpeg", "jpg"].includes(fileType)) {
            throw new CustomError("Invalid image format.", 400);
          }

          const fileName = `${newImageId}.${fileType}`;

          // Convert base64 to Blob
          const base64Response = await fetch(imageBase64);
          const blob = await base64Response.blob();
          const { data, error } = await getSupabaseClient()
            .storage.from("images")
            .upload(fileName, blob, {
              contentType: `image/${fileType}`,
            });

          if (error) {
            throw new CustomError("Error uploading image.", 500);
          }

          // Save url in db
          try {
            const url = new URL(env.SUPABASE_ENDPOINT);

            await tx.insert(media).values({
              id: newImageId,
              url: `https://${url.hostname}/storage/v1/object/public/images/${data?.path}`,
            });
          } catch (err) {
            throw new CustomError("Error inserting image.", 500);
          }
        });

        // Wait for all uploads to complete
        await Promise.all(uploadPromises);

        // Relate images to review
        await tx.insert(mediaRelationships).values(
          newMediaIds.map((id) => ({
            mediaId: id,
            reviewId: newRev.id,
          })),
        );
      }
    });

    return new Response(JSON.stringify({ message: "Review created." }), {
      status: 201,
    });
  } catch (err) {
    console.log(err);
    const message =
      err instanceof CustomError
        ? (err as Error).message
        : "Error creating review.";
    return new Response(
      JSON.stringify({
        error: message,
      }),
      { status: err instanceof CustomError ? err.status : 500 },
    );
  }
}

export async function GET(
  req: Request,
  { params }: { params: { companyId: string } },
) {
  if (!params.companyId) {
    return new Response("Missing company ID.", { status: 400 });
  }

  const { query } = parse(req.url, true);

  const attemptQueryParamsParse = queryParamsSchema.GET.safeParse({
    companyId: params.companyId,
    ...query,
  });

  if (!attemptQueryParamsParse.success) {
    return new Response(
      JSON.stringify({
        error: attemptQueryParamsParse.error.issues[0]?.message,
      }),
      { status: 400 },
    );
  }

  const queryParams = attemptQueryParamsParse.data;

  try {
    const filters = and(
      eq(reviews.companyId, queryParams.companyId),
      queryParams.authorId
        ? eq(reviews.authorId, queryParams.authorId)
        : undefined,
      queryParams.minRating
        ? gte(reviews.rating, queryParams.minRating)
        : undefined,
      queryParams.maxRating
        ? lte(reviews.rating, queryParams.maxRating)
        : undefined,
      queryParams.minCreatedAt
        ? gte(reviews.createdAt, queryParams.minCreatedAt)
        : undefined,
      queryParams.maxCreatedAt
        ? lte(reviews.createdAt, queryParams.maxCreatedAt)
        : undefined,
      queryParams.cursor ? gte(reviews.id, queryParams.cursor) : undefined,
      queryParams.includeInactive ? undefined : eq(reviews.isActive, true),
    );

    const res = await db
      .select({
        id: reviews.id,
        authorId: reviews.authorId,
        rating: reviews.rating,
        createdAt: reviews.createdAt,
        updatedAt: reviews.updatedAt,
        description: reviews.description,
        title: reviews.title,
        companyId: reviews.companyId,
        media: sql`ARRAY_AGG(${media.url})`,
      })
      .from(reviews)
      .leftJoin(mediaRelationships, eq(reviews.id, mediaRelationships.reviewId))
      .leftJoin(media, eq(mediaRelationships.mediaId, media.id))
      .where(filters)
      .limit(queryParams.limit + 1)
      .groupBy(reviews.id)
      .orderBy(reviews.id);

    return new Response(
      JSON.stringify({
        cursor: res.length > queryParams.limit ? res[res.length - 1]?.id : null,
        data: res.slice(0, queryParams.limit),
      }),
      { status: 200 },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: "Error retrieving reviews.",
      }),
      { status: 500 },
    );
  }
}
