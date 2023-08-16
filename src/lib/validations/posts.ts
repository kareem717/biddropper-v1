import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { bundles } from "@/db/schema/posts";
import * as z from "zod";

export const insertBundleSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters long",
  }).max(100, {
    message: "Title must be at most 100 characters long",
  }),
  isActive: z.boolean(),
  userId: z.string().max(50, {
    message: "User ID must be at most 50 characters long",
  }),
  description: z.string().min(3, {
    message: "Description must be at least 3 characters long",
  }).max(750, {
    message: "Description must be at most 750 characters long",
  }),
  bundleType: z.enum(["sub-contract", "contractor-wanted"], {
    errorMap: (issue, ctx) => {
      return {message: 'Please select a valid option'};
    },
  }),
  posterType: z.enum(['business-owner', 'property-owner'], {
    errorMap: (issue, ctx) => {
      return {message: 'Please select a valid option'};
    }
  }),
  addressId: z.string().max(50, {
    message: "Address ID must be at most 50 characters long",
  }),
  showExactLocation: z.boolean(),
})
export const selectBundleSchema = createSelectSchema(bundles);
