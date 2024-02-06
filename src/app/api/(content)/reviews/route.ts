import { db } from "@/server/db/client";
import { media, reviews } from "@/server/db/schema/tables/content";
import { authOptions } from "@/lib/auth";
import { and, eq, gte, inArray, lte, sql } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { parse } from "url";
import {
  bodyParamsSchema,
  queryParamsSchema,
} from "@/lib/validations/api/(content)/reviews/request";
import { mediaRelationships } from "@/server/db/schema/tables/relations/content";
import { CustomError } from "@/lib/utils";
import getSupabaseClient from "@/lib/supabase/getSupabaseClient";
import { env } from "@/env.mjs";
import { v4 as uuidv4 } from "uuid";

export async function GET(req: Request) {
  const { query } = parse(req.url, true);

  const attemptQueryParamsParse = queryParamsSchema.GET.safeParse({
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
      queryParams.reviewId ? eq(reviews.id, queryParams.reviewId) : undefined,
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

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response(
      JSON.stringify({
        error: "Unauthorized",
      }),
      { status: 401 },
    );
  }

  const reqBody = await req.json();

  const attemptBodyParse = bodyParamsSchema.PATCH.safeParse(reqBody);

  if (!attemptBodyParse.success) {
    return new Response(
      JSON.stringify({
        error: attemptBodyParse.error.issues[0]?.message,
      }),
      { status: 400 },
    );
  }

  const { id, addedImageBase64, removedMediaUrls, ...updateValues } =
    attemptBodyParse.data;

  // Make sure user owns the review
  try {
    const [review] = await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.id, id)))
      .limit(1);

    if (!review) {
      return new Response(
        JSON.stringify({
          error: "Review not found.",
        }),
        { status: 404 },
      );
    }

    if (review.authorId !== session.user.id) {
      return new Response(
        JSON.stringify({
          error: "User does not own the review.",
        }),
        { status: 401 },
      );
    }
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: "Error finding the review.",
      }),
      { status: 404 },
    );
  }

  try {
    await db.transaction(async (tx) => {
      // Update review
      if (Object.values(updateValues).length) {
        try {
          await tx.update(reviews).set(updateValues).where(eq(reviews.id, id));
        } catch (err) {
          throw new CustomError("Error updating the review.", 500);
        }
      }

      // Remove images
      if (removedMediaUrls?.length) {
        try {
          const deletedMedia = await tx
            .select({ id: media.id, url: media.url })
            .from(media)
            .innerJoin(
              mediaRelationships,
              eq(media.id, mediaRelationships.mediaId),
            )
            .where(
              and(
                eq(mediaRelationships.reviewId, id),
                inArray(media.url, removedMediaUrls),
              ),
            );

          if (deletedMedia.length) {
            // Delete images from supabase
            const { error } = await getSupabaseClient()
              .storage.from("images")
              .remove(
                deletedMedia
                  .map((mediaObj) => mediaObj.url.split("/").pop())
                  .filter((url): url is string => url !== undefined),
              );

            if (error) {
              throw new CustomError("Error deleting images from cloud.", 500);
            }

            // Delete images from db
            await tx.delete(media).where(
              inArray(
                media.id,
                deletedMedia.map((mediaObj) => mediaObj.id),
              ),
            );
          }
        } catch (err) {
          const message =
            err instanceof CustomError
              ? (err as Error).message
              : "Error deleting review.";

          throw new CustomError(
            message,
            err instanceof CustomError ? err.status : 500,
          );
        }
      }

      // Add images
      if (addedImageBase64?.length) {
        const mediaCount = await tx
          .select({ count: sql`COUNT(*)` })
          .from(mediaRelationships)
          .where(eq(mediaRelationships.reviewId, id));

        if (
          mediaCount[0] &&
          Number(mediaCount[0].count) + addedImageBase64.length > 3
        ) {
          throw new CustomError("Review cannot have more than 3 images.", 400);
        }

        // Assume base64Images is an array of base64 image URLs
        const newMediaIds = addedImageBase64.map(() => uuidv4());
        const uploadPromises = addedImageBase64.map(
          async (imageBase64, index) => {
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
          },
        );

        // Wait for all uploads to complete
        await Promise.all(uploadPromises);

        // Relate images to review
        await tx.insert(mediaRelationships).values(
          newMediaIds.map((mediaId) => ({
            mediaId: mediaId,
            reviewId: id,
          })),
        );
      }
    });
  } catch (err) {
    const message =
      err instanceof CustomError
        ? (err as Error).message
        : "Error deleting review.";

    return new Response(
      JSON.stringify({
        error: message,
      }),
      { status: err instanceof CustomError ? err.status : 500 },
    );
  }

  return new Response(JSON.stringify({ message: "Review updated." }), {
    status: 200,
  });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { query } = parse(req.url, true);

  const attemptQueryParamsParse = queryParamsSchema.DELETE.safeParse(query);

  if (!attemptQueryParamsParse.success) {
    return new Response(
      JSON.stringify({
        error: attemptQueryParamsParse.error.issues[0]?.message,
      }),
      { status: 400 },
    );
  }

  const { id } = attemptQueryParamsParse.data;

  // Validate that the review exists and that the user owns it
  try {
    const [review] = await db
      .select({ authorId: reviews.authorId })
      .from(reviews)
      .where(eq(reviews.id, id));

    if (!review) {
      return new Response(JSON.stringify({ error: "Review not found." }), {
        status: 404,
      });
    }

    if (review.authorId !== session.user.id) {
      return new Response(
        JSON.stringify({ error: "User does not own the review." }),
        { status: 401 },
      );
    }
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: "Error retrieving the review.",
      }),
      { status: 500 },
    );
  }

  // Delete review
  try {
    await db.transaction(async (tx) => {
      // Delete Images From Supabase
      const reviewMediaUrls = await tx
        .select({ id: media.id, url: media.url })
        .from(media)
        .innerJoin(mediaRelationships, eq(media.id, mediaRelationships.mediaId))
        .where(eq(mediaRelationships.reviewId, id));

      const { error } = await getSupabaseClient()
        .storage.from("images")
        .remove(reviewMediaUrls.map((media) => media.url));

      if (error) {
        throw new CustomError("Error deleting images from cloud.", 500);
      }

      // Delete review
      await tx.delete(reviews).where(eq(reviews.id, id));

      // Delete images from db
      await tx.delete(media).where(
        inArray(
          media.id,
          reviewMediaUrls.map((mediaObj) => mediaObj.id),
        ),
      );
    });
  } catch (err) {
    const message =
      err instanceof CustomError
        ? (err as Error).message
        : "Error deleting review.";

    return new Response(
      JSON.stringify({
        error: message,
      }),
      { status: err instanceof CustomError ? err.status : 500 },
    );
  }

  return new Response(JSON.stringify({ message: "Review deleted." }), {
    status: 200,
  });
}
