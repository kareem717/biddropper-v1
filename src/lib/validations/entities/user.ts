import { users } from "@/db/migrations/schema";
import { createInsertSchema } from "drizzle-zod";
import * as z from "zod";

export const insertUserSchema = createInsertSchema(users, {
  id: z.string().max(50, {
    message: "ID must be at most 50 characters long"
  }).regex(/^user_[A-Za-z0-9\-]+$/, {
    message: "ID must be in the format of user_[A-Za-z0-9-]+"
  }),
});