import { reviews } from "@/db/migrations/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import * as z from "zod";
import { insertUserSchema } from "../entities/user";

export const insertReviewSchema = createInsertSchema(reviews, {
	id: z
		.string()
		.max(50, {
			message: "ID must be at most 50 characters long",
		})
		.regex(/^rev_[A-Za-z0-9\-]+$/, {
			message: "ID must be in the format of rev_[A-Za-z0-9-]+",
		}),
	authorId: insertUserSchema.shape.id,
});

export const selectReviewSchema = createSelectSchema(reviews);

export type InsertReview = z.infer<typeof insertReviewSchema>;
export type SelectReview = z.infer<typeof selectReviewSchema>;
