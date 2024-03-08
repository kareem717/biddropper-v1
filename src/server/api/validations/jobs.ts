import { jobs } from "@/server/db/schema/tables/content";
import {
  enumPropertyType,
  enumStartDateFlag,
} from "@/server/db/schema/tables/enums";
import { createInsertSchema } from "drizzle-zod";
import * as z from "zod";
import { createAddressInput } from "./address";
import { base64Regex } from "@/lib/utils/api";
import { getTableColumns } from "drizzle-orm";

const jobTableColumns = Object.keys(getTableColumns(jobs));

export const createJobInput = createInsertSchema(jobs, {
  title: z
    .string({
      invalid_type_error: "Title must be a string",
      required_error: "Title is required",
    })
    .max(100, {
      message: "Title must be less than 100 characters",
    }),
  description: z
    .string({
      invalid_type_error: "Description must be a string",
      required_error: "Description is required",
    })
    .max(3000, {
      message: "Description must be less than 3000 characters",
    }),
  industry: z
    .string({
      invalid_type_error: "Industry must be a string",
    })
    .max(100, {
      message: "Industry must be less than 100 characters",
    })
    .optional(),
  isCommercialProperty: z
    .boolean({
      invalid_type_error: "isCommercialProperty must be a boolean",
    })
    .optional()
    .default(false),
  startDate: z.coerce
    .date({
      invalid_type_error: "startDate must be a date",
    })
    .optional(),
  startDateFlag: z
    .enum(enumStartDateFlag.enumValues, {
      invalid_type_error: "startDateFlag must be a valid enum value",
    })
    .optional()
    .default("none"),
  propertyType: z.enum(enumPropertyType.enumValues, {
    required_error: "propertyType is required",
    invalid_type_error: "propertyType must be a valid enum value",
  }),
})
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    isActive: true,
    addressId: true,
  })
  .extend({
    address: createAddressInput,
    companyId: z
      .string({
        required_error: "companyId is required",
        invalid_type_error: "companyId must be a string",
      })
      .uuid({
        message: "companyId must be a valid UUID",
      })
      .optional(),
    userId: z
      .string({
        required_error: "userId is required",
        invalid_type_error: "userId must be a string",
      })
      .uuid({
        message: "userId must be a valid UUID",
      })
      .optional(),
    base64Images: z
      .array(
        z
          .string({
            invalid_type_error:
              "Image must be a base64 string representation of a image",
            required_error: "Image is required",
          })
          .refine((str) => base64Regex.test(str), {
            message: "Invalid base64 image format",
          }),
        {
          invalid_type_error: "Images must be an array",
          required_error: "Images cannot be null or empty",
        },
      )
      .max(8, {
        message: "You can only provide up to 8 images",
      })
      .optional(),
    tags: z
      .array(
        z.string({
          invalid_type_error: "Tag must be a string",
          required_error: "Tag cannot be null or empty",
        }),
        {
          invalid_type_error: "Tags must be an array",
          required_error: "Tags cannot be null or empty",
        },
      )
      .max(20, {
        message: "You can only provide up to 20 tags",
      })
      .optional(),
  })
  .strict({
    message: "No additional properties are allowed in the object.",
  })
  .superRefine((data, ctx) => {
    if (!data.userId && !data.companyId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "You must provide either a user ID or company ID.",
      });
    }

    if (data.userId && data.companyId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "You cannot provide both a user ID and company ID.",
      });
    }

    return true;
  });

export type createJobInputType = z.infer<typeof createJobInput>;

export const updateJobInput = createInsertSchema(jobs, {
  title: z
    .string({
      invalid_type_error: "Title must be a string",
      required_error: "Title is required",
    })
    .max(100, {
      message: "Title must be less than 100 characters",
    })
    .optional(),
  description: z
    .string({
      invalid_type_error: "Description must be a string",
      required_error: "Description is required",
    })
    .max(3000, {
      message: "Description must be less than 3000 characters",
    })
    .optional(),
  industry: z
    .string({
      invalid_type_error: "Industry must be a string",
    })
    .max(100, {
      message: "Industry must be less than 100 characters",
    })
    .optional(),
  isCommercialProperty: z
    .boolean({
      invalid_type_error: "isCommercialProperty must be a boolean",
    })
    .optional(),
  startDate: z.coerce
    .date({
      invalid_type_error: "startDate must be a date",
    })
    .optional(),
  startDateFlag: z
    .enum(enumStartDateFlag.enumValues, {
      invalid_type_error: "startDateFlag must be a valid enum value",
    })
    .optional(),
  propertyType: z
    .enum(enumPropertyType.enumValues, {
      required_error: "propertyType is required",
      invalid_type_error: "propertyType must be a valid enum value",
    })
    .optional(),
})
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    isActive: true,
    addressId: true,
  })
  .extend({
    id: z
      .string({
        required_error: "Job ID is required",
        invalid_type_error: "Job ID must be a string",
      })
      .uuid({
        message: "Job ID must be a valid UUID",
      }),
    address: createAddressInput.optional(),
    addedBase64Images: z
      .array(
        z
          .string({
            invalid_type_error:
              "Image must be a base64 string representation of a image",
            required_error: "Image is required",
          })
          .refine((str) => base64Regex.test(str), {
            message: "Invalid base64 image format",
          }),
      )
      .max(8, {
        message: "You can only provide up to 8 images",
      })
      .optional(),
    removedMediaUrls: z
      .array(
        z
          .string({
            invalid_type_error: "Media URL must be a string",
            required_error: "Media URL is required",
          })
          .url({
            message: "Media URL must be a valid URL",
          }),
      )
      .max(8, {
        message: "You can only provide up to 8 media URLs",
      })
      .optional(),
    tags: z
      .array(
        z
          .string({
            invalid_type_error: "Tag must be a string",
            required_error: "Tag cannot be null or empty",
          })
          .max(30, {
            message: "Tag must be less than 30 characters",
          }),
        {
          invalid_type_error: "Tags must be an array",
          required_error: "Tags cannot be null or empty",
        },
      )
      .max(15, {
        message: "You can only provide up to 20 tags",
      })
      .optional(),
    isActive: z
      .boolean({
        required_error: "isActive is required",
        invalid_type_error: "isActive must be a boolean",
      })
      .optional(),
  })
  .strict({
    message: "No additional properties are allowed in the object.",
  });

export const deleteJobInput = z.object({
  id: z
    .string({
      required_error: "Job ID is required",
      invalid_type_error: "Job ID must be a string",
    })
    .uuid({
      message: "Job ID must be a valid UUID",
    }),
});

export const getJobsByIdsInput = z
  .object({
    ids: z
      .array(
        z
          .string({
            required_error: "Job ID cannot be empty if provided",
            invalid_type_error: "Job ID must be a string",
          })
          .uuid({
            message: "Job ID must be a valid UUID",
          }),
      )
      .refine((ids) => ids?.length === new Set(ids).size, {
        message: "You cannot provide duplicate IDs",
      })
      .optional(),
    minCreatedAt: z
      .date({
        invalid_type_error: "The min creation date must be a date",
        required_error: "The min creation date cannot be empty if provided",
      })
      .max(new Date(), {
        message: "The min creation date cannot be in the future",
      })
      .optional(),
    maxCreatedAt: z
      .date({
        invalid_type_error: "The max creation date must be a date",
        required_error: "The max creation date cannot be empty if provided",
      })
      .max(new Date(), {
        message: "The max creation date cannot be in the future",
      })
      .optional(),
    minStartDate: z
      .date({
        invalid_type_error: "The min start date must be a date",
        required_error: "The min start date cannot be empty if provided",
      })
      .optional(),
    maxStartDate: z
      .date({
        invalid_type_error: "The max start date must be a date",
        required_error: "The max start date cannot be empty if provided",
      })
      .optional(),
    propertyTypes: z
      .array(
        z.enum(enumPropertyType.enumValues, {
          invalid_type_error: "Property types must be a valid enum value",
          required_error: "Property types cannot be empty if provided",
        }),
      )
      .max(enumPropertyType.enumValues.length, {
        message: `You cannot provide more than ${enumPropertyType.enumValues.length} property types`,
      })
      .optional(),
    startDateFlags: z
      .array(
        z.enum(enumStartDateFlag.enumValues, {
          invalid_type_error: "Start date flags must be a valid enum value",
          required_error: "Start date flags cannot be empty if provided",
        }),
      )
      .max(enumStartDateFlag.enumValues.length, {
        message: `You cannot provide more than ${enumStartDateFlag.enumValues.length} start date flags`,
      })
      .optional(),
    locationFilter: z
      .object(
        {
          lat: z.number({
            invalid_type_error: "Latitude must be a number",
            required_error: "Latitude is required",
          }),
          lng: z.number({
            invalid_type_error: "Longitude must be a number",
            required_error: "Longitude is required",
          }),
          radius: z.number({
            invalid_type_error: "Radius must be a number",
            required_error: "Radius is required",
          }),
        },
        {
          required_error: "Location filter cannot be empty if provided",
          invalid_type_error: "Location filter must be an object",
        },
      )
      .optional(),
    shortDescription: z
      .boolean({
        invalid_type_error: "Short description must be a boolean",
      })
      .optional()
      .default(false),
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
    orderBy: z
      .object({
        columnName: z.enum(
          // @ts-ignore
          jobTableColumns,
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
      })
      .strict({
        message: "No additional properties are allowed in the order object.",
      })
      .optional()
      .default({
        columnName: "id",
        order: "asc",
      }),
    cursor: z
      .object({
        columnName: z.enum(
          // @ts-ignore
          jobTableColumns,
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
      })
      .strict()
      .optional(),
  })
  .strict({
    message: "No additional properties are allowed in the object.",
  });

export const getJobAndRelatedByIdInput = z
  .object({
    id: z
      .string({
        required_error: "Job ID is required",
        invalid_type_error: "Job ID must be a string",
      })
      .uuid({
        message: "Job ID must be a valid UUID",
      }),
  })
  .strict({
    message: "No additional properties are allowed in the object.",
  });

export const getCompanyJobsInput = getJobsByIdsInput.extend({
  companyId: z
    .string({
      required_error: "Company ID is required",
      invalid_type_error: "Company ID must be a string",
    })
    .uuid({
      message: "Company ID must be a valid UUID",
    }),
});

export const getUserJobsInput = getJobsByIdsInput.extend({
  userId: z
    .string({
      required_error: "User ID is required",
      invalid_type_error: "User ID must be a string",
    })
    .uuid({
      message: "User ID must be a valid UUID",
    }),
});
