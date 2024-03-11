import * as z from "zod";
import { createInsertSchema } from "drizzle-zod";
import { companies, industries } from "@/lib/db/schema/tables/content";
import validator from "validator";
import { bodyParamSchema as addressPostSchema } from "../../(references)/addresses/request";
import { db } from "@/lib/db";
import { inArray, sql } from "drizzle-orm";
import { user } from "@/lib/db/schema/tables/auth";

const patchBodyParams = createInsertSchema(user, {
  id: z
    .string({
      required_error: "Missing identifier.",
    })
    .uuid(),
  email: z
    .string()
    .email({
      message: "Invalid email address.",
    })
    .optional(),
  name: z.string().optional(),
  image: z.string().url().optional(),
}).omit({
  createdAt: true,
  updatedAt: true,
  emailVerified: true,
});

export const deleteQuerySchema = z.object({
  id: z
    .string({
      required_error: "Missing identifier.",
    })
    .uuid(),
});

export const getQuerySchema = z.object({
  id: z
    .string({
      required_error: "Missing identifier.",
    })
    .uuid(),
});

export const bodyParamSchema = {
  PATCH: patchBodyParams,
};

export const queryParamSchema = {
  DELETE: deleteQuerySchema,
  GET: getQuerySchema,
};
