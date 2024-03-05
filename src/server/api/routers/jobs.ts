import {
  createTRPCRouter,
  authenticatedProcedure,
  companyOwnerProcedure,
} from "@/server/api/trpc";
import {
  jobs,
  bids,
  contracts,
  industries,
  addresses,
  media,
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
import {
  getJobBidStatsInput,
  getBidStatsOutput,
  getContractBidStatsInput,
  createJobBidInput,
  createContractBidInput,
  updateBidInput,
  deleteBidInput,
  getUserBidsInput,
  getCompanyBidsInput,
} from "../validations/bids";
import { v4 as uuidv4 } from "uuid";
import { createSelectSchema } from "drizzle-zod";
import { createJobInput } from "../validations/jobs";
import getSupabaseClient from "@/lib/supabase/getSupabaseClient";
import { env } from "@/env.mjs";

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
});
