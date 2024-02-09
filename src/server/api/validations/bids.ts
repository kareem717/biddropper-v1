import * as z from "zod";
import { enumBidStatus } from "@/server/db/schema/tables/enums";
import { createInsertSchema } from "drizzle-zod";
import { bids } from "@/server/db/schema/tables/content";
import { PgColumn } from "drizzle-orm/pg-core";
import { getTableColumns } from "drizzle-orm";

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

export const getContractBidStatsInput = getJobBidStatsInput
  .omit({ jobId: true })
  .extend({
    contractId: z
      .string({
        required_error: "Contract identifier is required.",
        invalid_type_error: "Contract identifier must be a string.",
      })
      .uuid({
        message: "Contract identifier must be a valid UUID.",
      }),
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

export const createJobBidInput = z
  .object({
    jobId: z
      .string({
        required_error: "Job ID is required but missing.",
        invalid_type_error: "Job ID must be a string.",
      })
      .uuid({
        message: "Job ID must be a valid UUID.",
      }),
    companyId: z
      .string({
        required_error: "Company ID is required.",
        invalid_type_error: "Company ID must be a string.",
      })
      .uuid({
        message: "Company ID must be a valid UUID.",
      }),
    note: z
      .string({
        required_error: "Note is required but missing.",
        invalid_type_error: "Note must be a string.",
      })
      .max(300, {
        message: "Note exceeds the maximum length of 300 characters.",
      })
      .optional(),
    price: z
      .number({
        required_error: "Price is required.",
        invalid_type_error: "Price must be a number.",
      })
      .multipleOf(0.01, {
        message: "Price must have no more than two decimal places.",
      })
      .max(12000000.0, {
        message: "Price cannot exceed $12,000,000.00.",
      })
      .positive({
        message: "Price must be a positive number.",
      })
      .transform((val) => String(val)),
  })
  .strict({
    message: "No additional properties are allowed in the object.",
  });

export const createContractBidInput = createJobBidInput
  .omit({ jobId: true })
  .extend({
    contractId: z
      .string({
        required_error: "Contract ID is required.",
        invalid_type_error: "Contract ID must be a string.",
      })
      .uuid({
        message: "Contract ID must be a valid UUID.",
      }),
  })
  .strict({
    message: "No additional properties are allowed in the object.",
  });

export const updateBidInput = createJobBidInput
  .omit({ jobId: true, companyId: true })
  .partial()
  .extend({
    bidId: z
      .string({
        required_error: "Bid ID is required but missing.",
        invalid_type_error: "Bid ID must be a string.",
      })
      .uuid({
        message: "Bid ID must be a valid UUID.",
      }),
    status: z
      .enum(enumBidStatus.enumValues, {
        required_error: "Status is required but missing.",
        invalid_type_error: "Status must be a valid bid status.",
      })
      .optional(),
  })
  .strict({
    message: "No additional properties are allowed in the object.",
  });

export const deleteBidInput = z.object({
  bidId: z
    .string({
      required_error: "Bid ID is required but missing.",
      invalid_type_error: "Bid ID must be a string.",
    })
    .uuid({
      message: "Bid ID must be a valid UUID.",
    }),
});

export const getUserBidsInput = getContractBidStatsInput
  .omit({ contractId: true })
  .extend({
    id: z
      .string({
        required_error: "ID is required.",
        invalid_type_error: "ID must be a string.",
      })
      .uuid({
        message: "ID must be a valid UUID.",
      }),
    orderBy: z
      .array(
        z.object({
          columnName: z.enum(
            // @ts-ignore
            Object.keys(getTableColumns(bids)),
            {
              required_error: "Order by field is required.",
              invalid_type_error: "Order by field must be a valid column name.",
            },
          ),
          order: z
            .enum(["asc", "desc"], {
              required_error: "Order by direction is required.",
              invalid_type_error:
                "Order by direction must be either 'asc' or 'desc'.",
            })
            .optional()
            .default("asc"),
        }),
      )
      .max(Object.keys(getTableColumns(bids)).length, {
        message: "Order by array cannot have repeated values.",
      })
      .refine(
        (data) => {
          const unique = new Set(data.map((item) => item.columnName));
          return unique.size === data.length;
        },
        {
          message: "`orderBy` array cannot have duplicate column names.",
        },
      )
      .optional()
      .default([
        {
          columnName: "id",
          order: "desc",
        },
      ]),
    cursor: z
      .array(
        z.object({
          columnName: z.enum(
            // @ts-ignore
            Object.keys(getTableColumns(bids)),
            {
              required_error: "Cursor column name field is required.",
              invalid_type_error:
                "Cursor column name field must be a valid column name.",
            },
          ),
          value: z.union(
            [z.string(), z.number(), z.date(), z.boolean(), z.null()],
            {
              required_error: "Cursor value field is required.",
              invalid_type_error: "Cursor value field must be a valid value.",
            },
          ),
          order: z
            .enum(["gte", "lte"], {
              required_error: "Cursor order field is required.",
              invalid_type_error:
                "Cursor order field must be either 'lte' or 'gte'.",
            })
            .optional()
            .default("lte"),
        }),
      )
      .max(Object.keys(getTableColumns(bids)).length, {
        message: "Order by array cannot have repeated values.",
      })
      .refine(
        (data) => {
          const unique = new Set(data.map((item) => item.columnName));
          return unique.size === data.length;
        },
        {
          message: "`orderBy` array cannot have duplicate column names.",
        },
      )
      .optional()
      .default([]),
  })
  .strict({
    message: "No additional properties are allowed in the object.",
  });

export const getCompanyBidsInput = getUserBidsInput
  .extend({
    targetType: z
      .array(
        z.enum(["jobs", "contracts"], {
          required_error: "Target type is required.",
          invalid_type_error: "Target type must be either 'job' or 'contract'.",
        }),
      )
      .max(2, {
        message: "Target type array cannot have more than 2 values.",
      })
      .optional()
      .default(["jobs"]),
    outgoing: z
      .boolean({
        required_error: "`outgoing` is required.",
        invalid_type_error: "`outgoing` must be a boolean.",
      })
      .optional()
      .default(false),
  })
  .strict({
    message: "No additional properties are allowed in the object.",
  });
