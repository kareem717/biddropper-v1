import { db } from "@/db/client";
import { media, projects } from "@/db/schema/tables/content";
import { mediaRelationships } from "@/db/schema/tables/relations/content";
import {
  queryParamsSchema,
  bodyParamsSchema,
} from "@/lib/validations/api/(content)/projects/request";
import { and, eq, gte, inArray, lte, sql } from "drizzle-orm";
import { parse } from "url";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import getSupabaseClient from "@/lib/supabase/getSupabaseClient";
import { CustomError } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";
import { env } from "@/env.mjs";

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
      queryParams.projectId
        ? eq(projects.id, queryParams.projectId)
        : undefined,
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

export async function PATCH(req: Request) {
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

  // Make sure user owns the project
  try {
    const [project] = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, id)))
      .limit(1);

    if (!project) {
      return new Response(
        JSON.stringify({
          error: "Project not found.",
        }),
        { status: 404 },
      );
    }

    if (
      !session.user.ownedCompanies.some(
        (company) => company.id === project.companyId,
      )
    ) {
      return new Response(
        JSON.stringify({
          error: "User does not own the project.",
        }),
        { status: 401 },
      );
    }
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: "Error finding the project.",
      }),
      { status: 404 },
    );
  }

  try {
    await db.transaction(async (tx) => {
      // Update project
      if (Object.values(updateValues).length) {
        try {
          await tx
            .update(projects)
            .set(updateValues)
            .where(eq(projects.id, id));
        } catch (err) {
          throw new CustomError("Error updating the project.", 500);
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
                eq(mediaRelationships.projectId, id),
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
              : "Error deleting project.";

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
          .where(eq(mediaRelationships.projectId, id));

        if (
          mediaCount[0] &&
          Number(mediaCount[0].count) + addedImageBase64.length > 5
        ) {
          throw new CustomError("Project cannot have more than 5 images.", 400);
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

        // Relate images to project
        await tx.insert(mediaRelationships).values(
          newMediaIds.map((mediaId) => ({
            mediaId: mediaId,
            projectId: id,
          })),
        );
      }
    });
  } catch (err) {
    const message =
      err instanceof CustomError
        ? (err as Error).message
        : "Error deleting project.";

    return new Response(
      JSON.stringify({
        error: message,
      }),
      { status: err instanceof CustomError ? err.status : 500 },
    );
  }

  return new Response(JSON.stringify({ message: "Project updated." }), {
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

  // Validate that the project exists and that the user owns it
  try {
    const [project] = await db
      .select({ companyId: projects.companyId })
      .from(projects)
      .where(eq(projects.id, id));

    if (!project) {
      return new Response(JSON.stringify({ error: "Project not found." }), {
        status: 404,
      });
    }

    if (
      !session.user.ownedCompanies.some(
        (company) => company.id === project.companyId,
      )
    ) {
      return new Response(
        JSON.stringify({ error: "User does not own the project." }),
        { status: 401 },
      );
    }
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: "Error retrieving the project.",
      }),
      { status: 500 },
    );
  }

  // Delete project
  try {
    await db.transaction(async (tx) => {
      // Delete Images From Supabase
      const projectMediaUrls = await tx
        .select({ id: media.id, url: media.url })
        .from(media)
        .innerJoin(mediaRelationships, eq(media.id, mediaRelationships.mediaId))
        .where(eq(mediaRelationships.projectId, id));

      const { error } = await getSupabaseClient()
        .storage.from("images")
        .remove(projectMediaUrls.map((media) => media.url));

      if (error) {
        throw new CustomError("Error deleting images from cloud.", 500);
      }

      // Delete project
      await tx.delete(projects).where(eq(projects.id, id));

      // Delete images from db
      await tx.delete(media).where(
        inArray(
          media.id,
          projectMediaUrls.map((mediaObj) => mediaObj.id),
        ),
      );
    });
  } catch (err) {
    const message =
      err instanceof CustomError
        ? (err as Error).message
        : "Error deleting project.";

    return new Response(
      JSON.stringify({
        error: message,
      }),
      { status: err instanceof CustomError ? err.status : 500 },
    );
  }

  return new Response(JSON.stringify({ message: "Project deleted." }), {
    status: 200,
  });
}
