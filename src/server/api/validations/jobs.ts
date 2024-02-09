import { jobs } from "@/server/db/schema/tables/content";
import {
  enumPropertyType,
  enumStartDateFlag,
} from "@/server/db/schema/tables/enums";
import { createInsertSchema } from "drizzle-zod";
import * as z from "zod";
import { createAddressInput } from "./address";
import { base64Regex } from "@/lib/utils";

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
      )
      .max(8, {
        message: "You can only provide up to 8 images",
      })
      .optional(),
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
