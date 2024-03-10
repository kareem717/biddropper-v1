import { reviews } from "@/server/db/schema/tables/content";
import { base64Regex } from "@/lib/utils";
import { createInsertSchema } from "drizzle-zod";
import * as z from "zod";

const postBodyParams = createInsertSchema(reviews, {
  description: z.string().min(1).max(1500),
  title: z.string().min(1).max(255),
  rating: z
    .number()
    .min(0)
    .max(5)
    .multipleOf(0.5)
    .transform((num) => String(num)),
  companyId: z
    .string({
      required_error: "Missing identifier.",
    })
    .uuid(),
  authorId: z
    .string({
      required_error: "Missing identifier.",
    })
    .uuid(),
})
  .omit({
    createdAt: true,
    updatedAt: true,
    companyId: true,
    id: true,
  })
  .extend({
    imageBase64: z
      .array(
        z.string().refine((str) => base64Regex.test(str), {
          message: "Invalid base64 image format",
        }),
      )
      .max(3)
      .optional(),
  });

const getQueryParams = z.object({
  companyId: z
    .string({
      required_error: "Missing identifier.",
    })
    .uuid(),
  authorId: z
    .string({
      required_error: "Missing identifier.",
    })
    .uuid()
    .optional(),
  includeInactive: z.preprocess(
    (val) => (typeof val === "string" ? val.toLowerCase() === "true" : false),
    z.boolean(),
  ),
  minRating: z.coerce
    .number()
    .min(0)
    .max(5)
    .multipleOf(0.5)
    .transform((num) => String(num))
    .optional(),
  maxRating: z.coerce
    .number()
    .min(0)
    .max(5)
    .multipleOf(0.5)
    .transform((num) => String(num))
    .optional(),
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
  cursor: z.string().uuid().optional(),
});

export const queryParamsSchema = {
  GET: getQueryParams,
};

export const bodyParamSchema = {
  POST: postBodyParams,
};
