import * as z from "zod";
import { enumBidStatus } from "@/server/db/schema/tables/enums";

export const getJobBidStatsInput = z
  .object({
    jobId: z
      .string({
        required_error: "Job identifier is required.",
        invalid_type_error: "Job identifier must be a string.",
      })
      .uuid({
        message: "Job identifier must be a valid UUID.",
      }),
    status: z
      .array(z.enum(enumBidStatus.enumValues), {
        required_error: "Status is required.",
        invalid_type_error: "Status must be an array of valid bid statuses.",
      })
      .optional()
      .default(["pending"]),
    minPrice: z
      .number({
        required_error: "Minimum price is required.",
        invalid_type_error: "Minimum price must be a number.",
      })
      .multipleOf(0.01, {
        message: "Minimum price must have no more than two decimal places.",
      })
      .positive({
        message: "Minimum price must be positive.",
      })
      .optional(),
    maxPrice: z
      .number({
        required_error: "Maximum price is required.",
        invalid_type_error: "Maximum price must be a number.",
      })
      .multipleOf(0.01, {
        message: "Maximum price must have no more than two decimal places.",
      })
      .positive({
        message: "Maximum price must be positive.",
      })
      .optional(),
    limit: z
      .number({
        required_error: "Limit is required.",
        invalid_type_error: "Limit must be a number.",
      })
      .max(50, {
        message: "Limit cannot exceed 50.",
      })
      .optional()
      .default(15),
    minCreatedAt: z
      .date({
        required_error: "Minimum creation date is required.",
        invalid_type_error: "Minimum creation date must be a valid date.",
      })
      .optional(),
    maxCreatedAt: z
      .date({
        required_error: "Maximum creation date is required.",
        invalid_type_error: "Maximum creation date must be a valid date.",
      })
      .optional(),
    isActive: z
      .array(z.boolean(), {
        required_error: "Valid activity is required.",
        invalid_type_error: "Valid activity must be an array of booleans.",
      })
      .max(2, {
        message: "Valid activity array cannot contain more than 2 items.",
      })
      .optional()
      .default([true]),
  })
  .strict({
    message: "No additional properties are allowed in the object.",
  });

export const getContractBidStatsInput = z
  .object({
    contractId: z
      .string({
        required_error: "Contract identifier is required.",
        invalid_type_error: "Contract identifier must be a string.",
      })
      .uuid({
        message: "Contract identifier must be a valid UUID.",
      }),
    status: z
      .array(z.enum(enumBidStatus.enumValues), {
        required_error: "Status is required.",
        invalid_type_error: "Status must be an array of valid bid statuses.",
      })
      .optional()
      .default(["pending"]),
    minPrice: z
      .number({
        required_error: "Minimum price is required.",
        invalid_type_error: "Minimum price must be a number.",
      })
      .multipleOf(0.01, {
        message: "Minimum price must have no more than two decimal places.",
      })
      .positive({
        message: "Minimum price must be positive.",
      })
      .optional(),
    maxPrice: z
      .number({
        required_error: "Maximum price is required.",
        invalid_type_error: "Maximum price must be a number.",
      })
      .multipleOf(0.01, {
        message: "Maximum price must have no more than two decimal places.",
      })
      .positive({
        message: "Maximum price must be positive.",
      })
      .optional(),
    limit: z
      .number({
        required_error: "Limit is required.",
        invalid_type_error: "Limit must be a number.",
      })
      .max(50, {
        message: "Limit cannot exceed 50.",
      })
      .optional()
      .default(15),
    minCreatedAt: z
      .date({
        required_error: "Minimum creation date is required.",
        invalid_type_error: "Minimum creation date must be a valid date.",
      })
      .optional(),
    maxCreatedAt: z
      .date({
        required_error: "Maximum creation date is required.",
        invalid_type_error: "Maximum creation date must be a valid date.",
      })
      .optional(),
    isActive: z
      .array(z.boolean(), {
        required_error: "Valid activity is required.",
        invalid_type_error: "Valid activity must be an array of booleans.",
      })
      .max(2, {
        message: "Valid activity array cannot contain more than 2 items.",
      })
      .optional()
      .default([true]),
  })
  .strict({
    message: "No additional properties are allowed in the object.",
  });

export const getBidStatsOutput = z.object({
  stats: z.array(
    z
      .object({
        medianPrice: z.number(),
        averagePrice: z.string().transform((val) => +Number(val).toFixed(2)),
        count: z.string().transform((val) => +Number(val).toFixed(2)),
        max: z.string().transform((val) => +Number(val).toFixed(2)),
        min: z.string().transform((val) => +Number(val).toFixed(2)),
      })
      .optional(),
  ),
  dailyAverages: z.array(
    z
      .object({
        day: z.date(),
        averagePrice: z.string().transform((val) => +Number(val).toFixed(2)),
      })
      .optional(),
  ),
});

// const postQueryParams = z.object({
//   jobId: z
//     .string({
//       required_error: "Missing identifier.",
//     })
//     .uuid()
//     .optional(),
//   contractId: z
//     .string({
//       required_error: "Missing identifier.",
//     })
//     .uuid()
//     .optional(),
//   companyId: z
//     .string({
//       required_error: "Missing identifier.",
//     })
//     .uuid(),
//   note: z
//     .string()
//     .max(300, {
//       message: "Note is too long.",
//     })
//     .optional(),
//   price: z.coerce
//     .number({
//       required_error: "Missing price.",
//     })
//     .nonnegative({
//       message: "Invalid price.",
//     })
//     .transform((val) => String(val)),
// });

// const patchQueryParams = postQueryParams
//   .partial()
//   .extend({
//     bidId: z
//       .string({
//         required_error: "Missing identifier.",
//       })
//       .uuid(),
//     status: z.enum(enumBidStatus.enumValues).optional(),
//   })
//   .omit({ jobId: true, contractId: true, companyId: true });

// const deleteQueryParams = z.object({
//   bidId: z
//     .string({
//       required_error: "Missing identifier.",
//     })
//     .uuid(),
// });

// export const queryParamSchema = {
//   GET: getQueryParams,
//   POST: postQueryParams.refine(
//     (data) => Boolean(data.jobId) !== Boolean(data.contractId),
//     {
//       message: "At least one, and only one, identifier should be provided.",
//     },
//   ),
//   PATCH: patchQueryParams,
//   DELETE: deleteQueryParams,
// };
