import { db } from "@/lib/db";
import { media, projects } from "@/lib/db/schema/tables/content";
import { mediaRelationships } from "@/lib/db/schema/tables/relations/content";
import { authOptions } from "@/lib/auth";
import {
  bodyParamSchema,
  queryParamsSchema,
} from "@/lib/deprecated/validations/api/(content)/projects/[companyId]/request";
import { CustomError } from "@/lib/utils";
import getSupabaseClient from "@/lib/supabase/getSupabaseClient";
import { getServerSession } from "next-auth";
import { v4 as uuidv4 } from "uuid";
import { env } from "@/lib/env.mjs";
import { parse } from "url";
import { and, eq, gte, lte, sql } from "drizzle-orm";

export async function POST(
  req: Request,
  { params }: { params: { companyId: string } },
) {
  if (!params.companyId) {
    return new Response("Missing company ID.", { status: 400 });
  }

  const session = await getServerSession(authOptions);

  if (!session || !session.user.ownedCompanies) {
    return new Response(
      JSON.stringify({ error: "Unauthorized to create project." }),
      { status: 401 },
    );
  }

  const reqBody = await req.json();

  const attemptBodyParse = bodyParamSchema.POST.safeParse({
    companyId: params.companyId,
    ...reqBody,
  });

  if (!attemptBodyParse.success) {
    return new Response(
      JSON.stringify({ error: attemptBodyParse.error.issues[0]?.message }),
      { status: 400 },
    );
  }

  const {
    imageBase64: projImages,
    companyId,
    ...project
  } = attemptBodyParse.data;

  if (
    !session.user.ownedCompanies
      .map((company) => company.id)
      .includes(companyId)
  ) {
    return new Response(
      JSON.stringify({
        error: "Unauthorized to create a project for this company.",
      }),
      { status: 401 },
    );
  }

  try {
    await db.transaction(async (tx) => {
      const newProjectId = uuidv4();

      await tx.insert(projects).values({
        id: newProjectId,
        companyId,
        ...project,
      });

      // Upload images
      if (projImages) {
        // Assume base64Images is an array of base64 image URLs
        const newMediaIds = projImages.map(() => uuidv4());
        const uploadPromises = projImages.map(async (imageBase64, index) => {
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
            throw new CustomError("Error uploading images.", 500);
          }

          // Save url in db
          try {
            const url = new URL(env.SUPABASE_ENDPOINT);

            await tx.insert(media).values({
              id: newImageId,
              url: `https://${url.hostname}/storage/v1/object/public/images/${data?.path}`,
            });
          } catch (err) {
            throw new CustomError("Error inserting images.", 500);
          }
        });

        // Wait for all uploads to complete
        await Promise.all(uploadPromises);

        // Relate images to review
        await tx.insert(mediaRelationships).values(
          newMediaIds.map((id) => ({
            mediaId: id,
            projectId: newProjectId,
          })),
        );
      }
    });
  } catch (err) {
    console.log(err);
    const message =
      err instanceof CustomError
        ? (err as Error).message
        : "Error creating project.";

    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }

  return new Response(JSON.stringify({ message: "Project created." }), {
    status: 201,
  });
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
      eq(projects.companyId, queryParams.companyId),
      queryParams.minCreatedAt
        ? gte(projects.createdAt, queryParams.minCreatedAt)
        : undefined,
      queryParams.maxCreatedAt
        ? lte(projects.createdAt, queryParams.maxCreatedAt)
        : undefined,
      queryParams.cursor ? gte(projects.id, queryParams.cursor) : undefined,
      queryParams.includeInactive ? undefined : eq(projects.isActive, true),
    );

    const res = await db
      .select({
        id: projects.id,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
        description: projects.description,
        title: projects.title,
        companyId: projects.companyId,
        media: sql`ARRAY_AGG(${media.url})`,
      })
      .from(projects)
      .leftJoin(
        mediaRelationships,
        eq(projects.id, mediaRelationships.projectId),
      )
      .leftJoin(media, eq(mediaRelationships.mediaId, media.id))
      .where(filters)
      .limit(queryParams.limit + 1)
      .groupBy(projects.id)
      .orderBy(projects.id);

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
        error: "Error retrieving projects.",
      }),
      { status: 500 },
    );
  }
}
