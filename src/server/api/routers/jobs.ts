import {
  createTRPCRouter,
  authenticatedProcedure,
  companyOwnerProcedure,
} from "@/server/api/trpc";
import {
  bids,
  jobs,
  contracts,
  industries,
  addresses,
  media,
  companies,
} from "@/server/db/schema/tables/content";
import {
  bidsRelationships,
  jobsRelationships,
  mediaRelationships,
} from "@/server/db/schema/tables/relations/content";
import {
  eq,
  sql,
  avg,
  and,
  max,
  min,
  gte,
  inArray,
  lte,
  asc,
  desc,
  or,
  ne,
} from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { v4 as uuidv4 } from "uuid";
import { createSelectSchema } from "drizzle-zod";
import {
  updateJobInput,
  createJobInput,
  deleteJobInput,
  getJobsByIdsInput,
  getJobAndRelatedByIdInput,
  getCompanyJobsInput,
  getUserJobsInput,
} from "../validations/jobs";
import getSupabaseClient from "@/lib/supabase/getSupabaseClient";
import { env } from "@/env.mjs";
import { generateCursor } from "@/lib/utils/api";
import { user } from "@/server/db/schema/tables/auth";

export const jobRouter = createTRPCRouter({
  createJob: authenticatedProcedure
    .input(createJobInput)
    .mutation(async ({ ctx, input: data }) => {
      const {
        companyId,
        userId,
        address: addressData,
        base64Images: jobImages,
        ...jobData
      } = data;

      try {
        // Get valid industry values
        const industryValues = await ctx.db
          .select({ value: industries.value })
          .from(industries);

        // Validate industry value
        if (
          !industryValues.findIndex((value) => value.value === jobData.industry)
        ) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid industry value.",
          });
        }
      } catch (err) {
        if (err instanceof TRPCError) {
          throw err;
        } else {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to validate industry value.",
          });
        }
      }

      const insertedJob = await ctx.db.transaction(async (tx) => {
        // Insert address
        const [newAddress] = await tx
          .insert(addresses)
          .values(addressData)
          .returning({ id: addresses.id });

        if (!newAddress) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Error inserting address.",
          });
        }

        const [newJob] = await tx
          .insert(jobs)
          .values({
            ...jobData,
            addressId: newAddress.id,
          })
          .returning({
            id: jobs.id,
            title: jobs.title,
            industry: jobs.industry,
            isCommercialProperty: jobs.isCommercialProperty,
            description: jobs.description,
            isActive: jobs.isActive,
            createdAt: jobs.createdAt,
            updatedAt: jobs.updatedAt,
            startDate: jobs.startDate,
            startDateFlag: jobs.startDateFlag,
            propertyType: jobs.propertyType,
            addressId: jobs.addressId,
            tags: jobs.tags,
          });

        if (!newJob) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Error inserting job.",
          });
        }

        // Link jobs to company or user
        if (companyId) {
          if (
            !ctx.session.user.ownedCompanies.some((c) => c.id === companyId)
          ) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "You do not own this company.",
            });
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
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Invalid image format.",
              });
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
              throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Error uploading image.",
              });
            }

            // Save url in db
            try {
              const url = new URL(env.SUPABASE_ENDPOINT);

              await tx.insert(media).values({
                id: newImageId,
                url: `https://${url.hostname}/storage/v1/object/public/images/${data?.path}`,
              });
            } catch (err) {
              throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Error saving image url.",
              });
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

          return newJob;
        }
      });

      return insertedJob;
    }),
  updateJob: authenticatedProcedure
    .input(updateJobInput)
    .mutation(async ({ ctx, input: data }) => {
      const {
        id,
        addedBase64Images: newJobImages,
        removedMediaUrls: removedJobImages,
        address,
        ...updateValues
      } = data;

      // Make sure user owns the job
      try {
        const [job] = await ctx.db
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
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Job not found.",
          });
        }

        if (
          !ctx.session.user.ownedCompanies.some(
            (company) => company.id === job.companyId,
          ) &&
          job.userId !== ctx.session.user.id
        ) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "The user does not own this job.",
          });
        }
      } catch (err) {
        if (err instanceof TRPCError) {
          throw err;
        } else {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Error finding the job.",
          });
        }
      }

      try {
        await ctx.db.transaction(async (tx) => {
          // Update job
          let jobAddressId: string;

          if (Object.values(updateValues).length) {
            try {
              console.log(updateValues);
              const [job] = await tx
                .update(jobs)
                .set(updateValues)
                .where(eq(jobs.id, id))
                .returning({
                  addressId: jobs.addressId,
                });

              if (!job) {
                throw new TRPCError({
                  code: "INTERNAL_SERVER_ERROR",
                  message: "Error returning the job on update.",
                });
              }

              jobAddressId = job.addressId;
            } catch (err) {
              console.log(err);
              throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Error updating the job.",
              });
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
                  throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Error deleting images from cloud.",
                  });
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
              if (err instanceof TRPCError) {
                throw err;
              } else {
                throw new TRPCError({
                  code: "INTERNAL_SERVER_ERROR",
                  message: "Error deleting job media.",
                });
              }
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
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Job media limit exceeded.",
              });
            }

            // Assume base64Images is an array of base64 image URLs
            const newMediaIds = newJobImages.map(() => uuidv4());
            const uploadPromises = newJobImages.map(
              async (imageBase64, index) => {
                const newImageId = newMediaIds[index];
                const fileType = imageBase64.split(";")[0]?.split("/")[1];

                if (!fileType || !["png", "jpeg", "jpg"].includes(fileType)) {
                  throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Invalid image format.",
                  });
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
                  throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Error uploading image.",
                  });
                }

                // Save url in db
                try {
                  const url = new URL(env.SUPABASE_ENDPOINT);

                  await tx.insert(media).values({
                    id: newImageId,
                    url: `https://${url.hostname}/storage/v1/object/public/images/${data?.path}`,
                  });
                } catch (err) {
                  throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Error saving image in DB.",
                  });
                }
              },
            );

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
        console.log(err);
        if (err instanceof TRPCError) {
          throw err;
        } else {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Error updating the job.",
          });
        }
      }

      return {
        jobId: id,
      };
    }),
  deleteJob: authenticatedProcedure
    .input(deleteJobInput)
    .mutation(async ({ ctx, input: data }) => {
      const jobId = data.id;

      try {
        const [job] = await ctx.db
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
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Job not found.",
          });
        }

        const companyOwnsJob = ctx.session.user.ownedCompanies.some(
          (company) => company.id === job.companyId,
        );
        const userOwnsJob = job.userId === ctx.session.user.id;

        if (!companyOwnsJob && !userOwnsJob) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "The user does not own this job.",
          });
        }
      } catch (err) {
        if (err instanceof TRPCError) {
          throw err;
        } else {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Error finding the job.",
          });
        }
      }

      try {
        await ctx.db.transaction(async (tx) => {
          // Delete images from supabase
          const deletedMedia = await tx
            .select({ id: media.id, url: media.url })
            .from(media)
            .innerJoin(
              mediaRelationships,
              eq(media.id, mediaRelationships.mediaId),
            )
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
              throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Error deleting images from cloud.",
              });
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
                ctx.db
                  .select({ addressId: jobs.addressId })
                  .from(jobs)
                  .where(eq(jobs.id, jobId)),
              ),
            );
        });
      } catch (err) {
        if (err instanceof TRPCError) {
          throw err;
        } else {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Error deleting the job.",
          });
        }
      }

      return {
        jobId,
      };
    }),
  getJobsByIds: companyOwnerProcedure
    .input(getJobsByIdsInput)
    .query(async ({ ctx, input }) => {
      const {
        orderBy,
        shortDescription,
        cursor,
        limit,
        locationFilter,
        ...data
      } = input;

      const { columnName: orderByColumn, order: orderByOrder } = orderBy;
      const filterConditions = () => {
        const conditions = [inArray(jobs.isActive, data.isActive)];

        const addCondition = (
          conditionFn: Function,
          field: any,
          value: any,
        ) => {
          if (value) {
            conditions.push(conditionFn(field, value));
          }
        };

        addCondition(inArray, jobs.id, data.ids);
        addCondition(inArray, jobs.propertyType, data.propertyTypes);
        addCondition(inArray, jobs.startDateFlag, data.startDateFlags);
        addCondition(gte, jobs.createdAt, data.minCreatedAt);
        addCondition(lte, jobs.createdAt, data.maxCreatedAt);
        addCondition(gte, jobs.startDate, data.minStartDate);
        addCondition(lte, jobs.startDate, data.maxStartDate);

        return conditions;
      };

      try {
        const res = await ctx.db
          .select({
            id: jobs.id,
            title: jobs.title,
            tags: jobs.tags,
            propertyType: jobs.propertyType,
            startDate: jobs.startDate,
            startDateFlag: jobs.startDateFlag,
            createdAt: jobs.createdAt,
            updatedAt: jobs.updatedAt,
            description: shortDescription
              ? sql`SUBSTRING(${jobs.description} FROM 0 FOR 150)`.as(
                  "description",
                )
              : jobs.description,
            isCommercialProperty: jobs.isCommercialProperty,
            isActive: jobs.isActive,
            industry: jobs.industry,
          })
          .from(jobs)
          .where(
            and(
              ...filterConditions(),
              locationFilter
                ? sql`ST_DWithin( 
                ST_MakePoint(${addresses.longitude}, ${addresses.latitude})::geography,
                ST_MakePoint(${locationFilter.lng}, ${locationFilter.lat})::geography,
                ${locationFilter.radius} * 1000
              )`
                : undefined,
              cursor
                ? cursor.order === "gte"
                  ? // @ts-expect-error
                    gte(jobs[cursor.columnName], cursor.value)
                  : // @ts-expect-error
                    lte(jobs[cursor.columnName], cursor.value)
                : undefined,
            ),
          )
          .limit(limit + 1)
          .orderBy(
            orderByOrder === "asc"
              ? // @ts-expect-error
                asc(jobs[orderByColumn])
              : // @ts-expect-error
                desc(jobs[orderByColumn]),
          );

        const lastItem = res.length > limit ? res.pop() : null;
        return {
          cursor: lastItem ? generateCursor(lastItem, orderBy, cursor) : null,
          data: res.slice(0, limit),
        };
      } catch (err) {
        console.error(err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error fetching jobs.",
        });
      }
    }),
  getJobAndRelatedById: authenticatedProcedure
    .input(getJobAndRelatedByIdInput)
    .query(async ({ ctx, input }) => {
      const { id } = input;

      //Verify user owns the job if they are not a company owner
      if (!ctx.session.user.ownedCompanies.length) {
        try {
          const [job] = await ctx.db
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
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Job not found.",
            });
          }

          if (job.userId !== ctx.session.user.id) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "The user does not own this job.",
            });
          }
        } catch (err) {
          if (err instanceof TRPCError) {
            throw err;
          } else {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Error finding the job.",
            });
          }
        }
      }

      try {
        const jobQuery = await ctx.db
          .select({
            id: jobs.id,
            title: jobs.title,
            description: jobs.description,
            createdAt: jobs.createdAt,
            updatedAt: jobs.updatedAt,
            startDate: jobs.startDate,
            startDateFlag: jobs.startDateFlag,
            propertyType: jobs.propertyType,
            isCommercialProperty: jobs.isCommercialProperty,
            isActive: jobs.isActive,
            industry: jobs.industry,
            tags: jobs.tags,
            address: {
              latitude: addresses.latitude,
              longitude: addresses.longitude,
              city: addresses.city,
              postalCode: addresses.postalCode,
              region: addresses.region,
            },
            company: {
              id: companies.id,
              name: companies.name,
            },
            user: {
              id: user.id,
              name: user.name,
            },
            media: {
              id: media.id,
              url: media.url,
            },
          })
          .from(jobs)
          .innerJoin(addresses, eq(jobs.addressId, addresses.id))
          .innerJoin(jobsRelationships, eq(jobs.id, jobsRelationships.jobId))
          .leftJoin(companies, eq(jobsRelationships.companyId, companies.id))
          .leftJoin(user, eq(jobsRelationships.userId, user.id))
          .leftJoin(mediaRelationships, eq(jobs.id, mediaRelationships.jobId))
          .leftJoin(media, eq(media.id, mediaRelationships.mediaId))
          .where(eq(jobs.id, id));

        if (!jobQuery.length) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Job not found.",
          });
        }

        const job = {
          ...jobQuery[0],
          media: jobQuery.map((j) => ({
            id: j?.media?.id,
            url: j?.media?.url,
          })),
        };
        return job;
      } catch (err) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error fetching job.",
        });
      }
    }),
  getCompanyJobs: companyOwnerProcedure
    .input(getCompanyJobsInput)
    .query(async ({ ctx, input }) => {
      const {
        companyId,
        orderBy,
        shortDescription,
        cursor,
        limit,
        locationFilter,
        ...data
      } = input;

      const { columnName: orderByColumn, order: orderByOrder } = orderBy;
      const filterConditions = () => {
        const conditions = [inArray(jobs.isActive, data.isActive)];

        const addCondition = (
          conditionFn: Function,
          field: any,
          value: any,
        ) => {
          if (value) {
            conditions.push(conditionFn(field, value));
          }
        };

        addCondition(inArray, jobs.id, data.ids);
        addCondition(inArray, jobs.propertyType, data.propertyTypes);
        addCondition(inArray, jobs.startDateFlag, data.startDateFlags);
        addCondition(gte, jobs.createdAt, data.minCreatedAt);
        addCondition(lte, jobs.createdAt, data.maxCreatedAt);
        addCondition(gte, jobs.startDate, data.minStartDate);
        addCondition(lte, jobs.startDate, data.maxStartDate);

        return conditions;
      };

      try {
        const res = await ctx.db
          .select({
            id: jobs.id,
            title: jobs.title,
            tags: jobs.tags,
            propertyType: jobs.propertyType,
            startDate: jobs.startDate,
            startDateFlag: jobs.startDateFlag,
            createdAt: jobs.createdAt,
            updatedAt: jobs.updatedAt,
            description: shortDescription
              ? sql`SUBSTRING(${jobs.description} FROM 0 FOR 150)`.as(
                  "description",
                )
              : jobs.description,
            isCommercialProperty: jobs.isCommercialProperty,
            isActive: jobs.isActive,
            industry: jobs.industry,
          })
          .from(jobs)
          .innerJoin(jobsRelationships, eq(jobs.id, jobsRelationships.jobId))
          .where(
            and(
              ...filterConditions(),
              eq(jobsRelationships.companyId, companyId),
              locationFilter
                ? sql`ST_DWithin( 
                ST_MakePoint(${addresses.longitude}, ${addresses.latitude})::geography,
                ST_MakePoint(${locationFilter.lng}, ${locationFilter.lat})::geography,
                ${locationFilter.radius} * 1000
              )`
                : undefined,
              cursor
                ? cursor.order === "gte"
                  ? // @ts-expect-error
                    gte(jobs[cursor.columnName], cursor.value)
                  : // @ts-expect-error
                    lte(jobs[cursor.columnName], cursor.value)
                : undefined,
            ),
          )
          .limit(limit + 1)
          .orderBy(
            orderByOrder === "asc"
              ? // @ts-expect-error
                asc(jobs[orderByColumn])
              : // @ts-expect-error
                desc(jobs[orderByColumn]),
          );

        const lastItem = res.length > limit ? res.pop() : null;
        return {
          cursor: lastItem ? generateCursor(lastItem, orderBy, cursor) : null,
          data: res.slice(0, limit),
        };
      } catch (err) {
        console.error(err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error fetching jobs.",
        });
      }
    }),
  getUserJobs: authenticatedProcedure
    .input(getUserJobsInput)
    .query(async ({ ctx, input }) => {
      const {
        userId,
        orderBy,
        shortDescription,
        cursor,
        limit,
        locationFilter,
        ...data
      } = input;


      // Validate the user is either a company owner or is the user being queried
      if (ctx.session.user.id !== userId) {
        if (!ctx.session.user.ownedCompanies.length) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have permission to view this user's jobs.",
          });
        }
      }
      
      const { columnName: orderByColumn, order: orderByOrder } = orderBy;
      const filterConditions = () => {
        const conditions = [inArray(jobs.isActive, data.isActive)];

        const addCondition = (
          conditionFn: Function,
          field: any,
          value: any,
        ) => {
          if (value) {
            conditions.push(conditionFn(field, value));
          }
        };

        addCondition(inArray, jobs.id, data.ids);
        addCondition(inArray, jobs.propertyType, data.propertyTypes);
        addCondition(inArray, jobs.startDateFlag, data.startDateFlags);
        addCondition(gte, jobs.createdAt, data.minCreatedAt);
        addCondition(lte, jobs.createdAt, data.maxCreatedAt);
        addCondition(gte, jobs.startDate, data.minStartDate);
        addCondition(lte, jobs.startDate, data.maxStartDate);

        return conditions;
      };

      try {
        const res = await ctx.db
          .select({
            id: jobs.id,
            title: jobs.title,
            tags: jobs.tags,
            propertyType: jobs.propertyType,
            startDate: jobs.startDate,
            startDateFlag: jobs.startDateFlag,
            createdAt: jobs.createdAt,
            updatedAt: jobs.updatedAt,
            description: shortDescription
              ? sql`SUBSTRING(${jobs.description} FROM 0 FOR 150)`.as(
                  "description",
                )
              : jobs.description,
            isCommercialProperty: jobs.isCommercialProperty,
            isActive: jobs.isActive,
            industry: jobs.industry,
          })
          .from(jobs)
          .innerJoin(jobsRelationships, eq(jobs.id, jobsRelationships.jobId))
          .where(
            and(
              ...filterConditions(),
              eq(jobsRelationships.userId, userId),
              locationFilter
                ? sql`ST_DWithin( 
                  ST_MakePoint(${addresses.longitude}, ${addresses.latitude})::geography,
                  ST_MakePoint(${locationFilter.lng}, ${locationFilter.lat})::geography,
                  ${locationFilter.radius} * 1000
                )`
                : undefined,
              cursor
                ? cursor.order === "gte"
                  ? // @ts-expect-error
                    gte(jobs[cursor.columnName], cursor.value)
                  : // @ts-expect-error
                    lte(jobs[cursor.columnName], cursor.value)
                : undefined,
            ),
          )
          .limit(limit + 1)
          .orderBy(
            orderByOrder === "asc"
              ? // @ts-expect-error
                asc(jobs[orderByColumn])
              : // @ts-expect-error
                desc(jobs[orderByColumn]),
          );

        const lastItem = res.length > limit ? res.pop() : null;
        return {
          cursor: lastItem ? generateCursor(lastItem, orderBy, cursor) : null,
          data: res.slice(0, limit),
        };
      } catch (err) {
        console.error(err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error fetching jobs.",
        });
      }
    }),
});
