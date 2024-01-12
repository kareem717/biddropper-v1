import { db } from "@/db/client";
import { authOptions } from "@/lib/auth";
import { addresses, industries, jobs, media } from "@/db/schema/tables/content";
import { getServerSession } from "next-auth";
import {
  bodyParamSchema,
  queryParamSchema,
} from "@/lib/validations/api/(content)/jobs/request";
import {
  jobsRelationships,
  mediaRelationships,
} from "@/db/schema/tables/relations/content";
import { CustomError } from "@/lib/utils";
import getSupabaseClient from "@/lib/supabase/getSupabaseClient";
import { env } from "@/env.mjs";
import { v4 as uuidv4 } from "uuid";
import { and, eq, inArray, sql } from "drizzle-orm";
import { parse } from "url";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  let reqBody = await req.json();

  const attemptBodyParse = bodyParamSchema.POST.safeParse(reqBody);

  if (!attemptBodyParse.success) {
    return new Response(
      JSON.stringify({
        error: attemptBodyParse.error.issues[0]?.message,
      }),
      { status: 400 },
    );
  }

  const {
    companyId,
    userId,
    address: addressData,
    base64Images: jobImages,
    ...jobData
  } = attemptBodyParse.data;

  try {
    // Get valid industry values
    const industryValues = await db
      .select({ value: industries.value })
      .from(industries);

    // Validate industry value
    if (
      !industryValues.findIndex((value) => value.value === jobData.industry)
    ) {
      return new Response(
        JSON.stringify({ error: "Invalid industry value." }),
        { status: 400 },
      );
    }
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Error fetching industry values." }),
      { status: 500 },
    );
  }

  try {
    await db.transaction(async (tx) => {
      // Insert address
      const [newAddress] = await tx
        .insert(addresses)
        .values(addressData)
        .returning({ id: addresses.id });

      if (!newAddress) {
        throw new CustomError("Error inserting address.");
      }

      const [newJob] = await tx
        .insert(jobs)
        .values({
          ...jobData,
          addressId: newAddress.id,
        })
        .returning({
          id: jobs.id,
        });

      if (!newJob) {
        throw new CustomError("Error inserting job.");
      }

      // Link jobs to company or user
      if (companyId) {
        if (!session.user.ownedCompanies.some((c) => c.id === companyId)) {
          throw new CustomError(
            "User cannot create a job for a company they don't own.",
            401,
          );
        }

        await tx.insert(jobsRelationships).values({
          companyId,
          jobId: newJob.id,
        });
      } else if (userId) {
        await tx.insert(jobsRelationships).values({
          userId,
          jobId: newJob.id,
        });
      }

      // Insert images
      if (jobImages && jobImages.length > 0) {
        // Assume base64Images is an array of base64 image URLs
        const newMediaIds = jobImages.map(() => uuidv4());
        const uploadPromises = jobImages.map(async (imageBase64, index) => {
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
          newMediaIds.map((mediaId) => ({
            mediaId: mediaId,
            jobId: newJob.id,
          })),
        );
      }
    });
  } catch (err) {
    const message =
      err instanceof CustomError
        ? (err as Error).message
        : "Error creating job.";

    return new Response(
      JSON.stringify({
        error: message,
      }),
      { status: err instanceof CustomError ? err.status : 500 },
    );
  }

  return new Response(
    JSON.stringify({
      message: "Job created.",
    }),
    { status: 201 },
  );
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  try {
    const res = await db.select().from(jobs).limit(15);

    return new Response(JSON.stringify({ jobs: res }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Error fetching jobs." }), {
      status: 500,
    });
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

  const attemptBodyParse = bodyParamSchema.PATCH.safeParse(reqBody);

  if (!attemptBodyParse.success) {
    return new Response(
      JSON.stringify({
        error: attemptBodyParse.error.issues[0]?.message,
      }),
      { status: 400 },
    );
  }

  const {
    id,
    addedBase64Images: newJobImages,
    removedMediaUrls: removedJobImages,
    address,
    ...updateValues
  } = attemptBodyParse.data;

  // Make sure user owns the job
  try {
    const [job] = await db
      .select({
        id: jobs.id,
        companyId: jobsRelationships.companyId,
        userId: jobsRelationships.userId,
      })
      .from(jobs)
      .innerJoin(jobsRelationships, eq(jobs.id, jobsRelationships.jobId))
      .where(and(eq(jobs.id, id)))
      .limit(1);

    if (!job) {
      return new Response(
        JSON.stringify({
          error: "Job not found.",
        }),
        { status: 404 },
      );
    }

    if (
      !session.user.ownedCompanies.some(
        (company) => company.id === job.companyId,
      ) &&
      job.userId !== session.user.id
    ) {
      return new Response(
        JSON.stringify({
          error: "The user, nor their companies own this job.",
        }),
        { status: 401 },
      );
    }
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: "Error finding the job.",
      }),
      { status: 404 },
    );
  }

  try {
    await db.transaction(async (tx) => {
      // Update job
      let jobAddressId: string;

      if (Object.values(updateValues).length) {
        try {
          const [job] = await tx
            .update(jobs)
            .set(updateValues)
            .where(eq(jobs.id, id))
            .returning({
              addressId: jobs.addressId,
            });

          if (!job) {
            throw new CustomError("Error updating the job.", 500);
          }

          jobAddressId = job.addressId;
        } catch (err) {
          throw new CustomError("Error updating the job.", 500);
        }
      }

      // Update address
      if (address) {
        try {
          await tx.transaction(async (tx) => {
            await tx
              .update(addresses)
              .set(address)
              .where(eq(addresses.id, jobAddressId));
          });
        } catch (err) {
          return new Response(
            JSON.stringify({
              error: "An error updating the job's address.",
            }),
            { status: 500 },
          );
        }
      }

      // Remove images
      if (removedJobImages?.length) {
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
                eq(mediaRelationships.jobId, id),
                inArray(media.url, removedJobImages),
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
              : "Error deleting job.";

          throw new CustomError(
            message,
            err instanceof CustomError ? err.status : 500,
          );
        }
      }

      // Add images
      if (newJobImages?.length) {
        const mediaCount = await tx
          .select({ count: sql`COUNT(*)` })
          .from(mediaRelationships)
          .where(eq(mediaRelationships.jobId, id));

        if (
          mediaCount[0] &&
          Number(mediaCount[0].count) + newJobImages.length > 8
        ) {
          throw new CustomError("job cannot have more than 8 images.", 400);
        }

        // Assume base64Images is an array of base64 image URLs
        const newMediaIds = newJobImages.map(() => uuidv4());
        const uploadPromises = newJobImages.map(async (imageBase64, index) => {
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

        // Relate images to job
        await tx.insert(mediaRelationships).values(
          newMediaIds.map((mediaId) => ({
            mediaId: mediaId,
            jobId: id,
          })),
        );
      }
    });
  } catch (err) {
    const message =
      err instanceof CustomError
        ? (err as Error).message
        : "Error deleting job.";

    return new Response(
      JSON.stringify({
        error: message,
      }),
      { status: err instanceof CustomError ? err.status : 500 },
    );
  }

  return new Response(JSON.stringify({ message: "Job updated." }), {
    status: 200,
  });
}

export async function DELETE(req: Request) {
  const { query } = parse(req.url, true);

  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const validParams = queryParamSchema.DELETE.safeParse(query);
  if (!validParams.success) {
    return new Response(JSON.stringify({ error: "Invalid query params." }), {
      status: 400,
    });
  }

  const jobId = validParams.data.id;

  try {
    const [job] = await db
      .select({
        id: jobs.id,
        companyId: jobsRelationships.companyId,
        userId: jobsRelationships.userId,
      })
      .from(jobs)
      .innerJoin(jobsRelationships, eq(jobs.id, jobsRelationships.jobId))
      .where(and(eq(jobs.id, jobId)))
      .limit(1);

    if (!job) {
      throw new CustomError("Job not found.", 404);
    }

    const companyOwnsJob = session.user.ownedCompanies.some(
      (company) => company.id === job.companyId,
    );
    const userOwnsJob = job.userId === session.user.id;

    if (!companyOwnsJob && !userOwnsJob) {
      throw new CustomError("The user, nor their companies own this job.", 401);
    }
  } catch (err) {
    const message =
      err instanceof CustomError
        ? (err as Error).message
        : "Error creating job.";

    return new Response(
      JSON.stringify({
        error: message,
      }),
      { status: err instanceof CustomError ? err.status : 500 },
    );
  }

  try {
    await db.transaction(async (tx) => {
      // Delete images from supabase
      const deletedMedia = await tx
        .select({ id: media.id, url: media.url })
        .from(media)
        .innerJoin(mediaRelationships, eq(media.id, mediaRelationships.mediaId))
        .where(eq(mediaRelationships.jobId, jobId));

      if (deletedMedia.length) {
        const { error } = await getSupabaseClient()
          .storage.from("images")
          .remove(
            deletedMedia
              .map((mediaObj) => mediaObj.url.split("/").pop())
              .filter((url): url is string => url !== undefined),
          );

        if (error) {
          console.log(error);
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

      // Delete job
      await tx.delete(jobs).where(eq(jobs.id, jobId));

      // Delete address
      await tx
        .delete(addresses)
        .where(
          eq(
            addresses.id,
            db
              .select({ addressId: jobs.addressId })
              .from(jobs)
              .where(eq(jobs.id, jobId)),
          ),
        );
    });
  } catch (err) {
    const message =
      err instanceof CustomError
        ? (err as Error).message
        : "Error deleting job.";

    return new Response(
      JSON.stringify({
        error: message,
      }),
      { status: err instanceof CustomError ? err.status : 500 },
    );
  }

  return new Response(JSON.stringify({ message: "Job deleted." }), {
    status: 200,
  });
}
