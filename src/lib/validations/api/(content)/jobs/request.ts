import { jobs } from "@/db/schema/tables/content";
import { enumPropertyType, enumStartDateFlag } from "@/db/schema/tables/enums";
import { createInsertSchema } from "drizzle-zod";
import { bodyParamSchema as addressSchema } from "../../(references)/addresses/request";
import * as z from "zod";
import { base64Regex } from "@/lib/utils";

const postBodyParams = createInsertSchema(jobs, {
  industry: z.string().max(100).optional(),
  isCommercialProperty: z.boolean().optional().default(false),
  startDate: z.coerce.date().optional(),
  startDateFlag: z
    .enum(enumStartDateFlag.enumValues)
    .optional()
    .default("none"),
  propertyType: z.enum(enumPropertyType.enumValues),
})
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    isActive: true,
    addressId: true,
  })
  .extend({
    address: addressSchema.POST,
    companyId: z.string().uuid().optional(),
    userId: z.string().uuid().optional(),
    base64Images: z
      .array(
        z.string().refine((str) => base64Regex.test(str), {
          message: "Invalid base64 image format",
        }),
      )
      .max(8)
      .optional(),
  })
  .refine(
    (data) => {
      if (!data.userId && !data.companyId) {
        return false;
      }

      if (data.userId && data.companyId) {
        return false;
      }

      return true;
    },
    { message: "Either userId or companyId must be provided, but not both!" },
  );

const patchBodyParams = createInsertSchema(jobs, {
  industry: z.string().max(100).optional(),
  isCommercialProperty: z.boolean().optional(),
  description: z.string().max(3000).optional(),
  startDate: z.coerce.number().transform((num) => new Date(num * 1000)),
  startDateFlag: z.enum(enumStartDateFlag.enumValues).optional(),
  propertyType: z.enum(enumPropertyType.enumValues).optional(),
})
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    addressId: true,
  })
  .extend({
    id: z.string().uuid(),
    address: addressSchema.POST,
    addedBase64Images: z
      .array(
        z.string().refine((str) => base64Regex.test(str), {
          message: "Invalid base64 image format",
        }),
      )
      .max(8)
      .optional(),
    removedMediaUrls: z.array(z.string().url()).optional(),
  });

const deleteQueryParams = z.object({
  id: z.string().uuid(),
});

const getQueryParams = z.object({
  ids: z.array(z.string().uuid()).optional(),
  includeInactive: z.preprocess(
    (val) => (typeof val === "string" ? val.toLowerCase() === "true" : false),
    z.boolean(),
  ),
  limit: z.coerce
    .number()
    .max(25, {
      message: "Limit is too large.",
    })
    .optional()
    .default(15),
  minCreatedAt: z.coerce
    .number()
    .transform((num) => new Date(num * 1000))
    .optional(),
  maxCreatedAt: z.coerce
    .number()
    .transform((num) => new Date(num * 1000))
    .optional(),
  minStartDate: z.coerce
    .number()
    .transform((num) => new Date(num * 1000))
    .optional(),
  maxStartDate: z.coerce
    .number()
    .transform((num) => new Date(num * 1000))
    .optional(),
  cursor: z.string().uuid().optional(),
  propertyTypes: z.enum(enumPropertyType.enumValues).optional(),
  startDateFlags: z.enum(enumStartDateFlag.enumValues).optional(),
  locationFilter: z
    .object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
      kmDistance: z.number().min(0).max(9999).multipleOf(0.001),
    })
    .optional(),
});


export const bodyParamSchema = { POST: postBodyParams, PATCH: patchBodyParams };
export const queryParamSchema = { DELETE: deleteQueryParams };
export type APIPatchCreateJobParams = z.infer<typeof postBodyParams>;
export type PatchBodyParams = z.infer<typeof patchBodyParams>;