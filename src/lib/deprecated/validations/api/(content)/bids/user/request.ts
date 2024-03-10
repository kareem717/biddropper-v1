import * as z from "zod";
import { enumBidStatus } from "@/lib/db/schema/tables/enums";

const getQueryParams = z.object({
  id: z
    .string({
      required_error: "Missing identifier.",
    })
    .uuid(),
  isActive: z
    .preprocess(
      (input) => (typeof input === "string" ? input.split(",") : input),
      z.array(z.enum(["true", "false"])).max(2),
    )
    .optional()
    .default(["true"]),
  status: z
    .preprocess(
      (input) => (typeof input === "string" ? input.split(",") : input),
      z
        .array(z.enum(enumBidStatus.enumValues))
        .max(enumBidStatus.enumValues.length),
    )
    .optional()
    .default(["pending"]),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  limit: z.coerce
    .number()
    .max(50, {
      message: "Limit is too large.",
    })
    .optional()
    .default(15),
  cursor: z.string().uuid().optional(),
  minCreatedAt: z.coerce
    .number()
    .transform((num) => new Date(num * 1000))
    .optional(),
  maxCreatedAt: z.coerce
    .number()
    .transform((num) => new Date(num * 1000))
    .optional(),
});

export const queryParamSchema = { GET: getQueryParams };
export type APIGetUserBidsParams = z.infer<typeof getQueryParams>;
