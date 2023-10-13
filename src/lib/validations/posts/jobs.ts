import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { jobs } from "@/db/migrations/schema";
import * as z from "zod";
import { insertIndustrySchema } from "../references/industries";

export const insertJobSchema = createInsertSchema(jobs, {
	id: z
		.string()
		.max(50, {
			message: "ID must be at most 50 characters long",
		})
		.regex(/^job_[A-Za-z0-9\-]+$/, {
			message: "ID must be in the format of job_[A-Za-z0-9-]+",
		}),
	industry: insertIndustrySchema.shape.value,
	details: z
		.string()
		.min(10, {
			message: "Details must be at least 10 characters long",
		})
		.max(3000, {
			message: "Details must be at most 3000 characters long",
		}),
});
export const selectJobSchema = createSelectSchema(jobs, {
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

export type InsertJob = z.infer<typeof insertJobSchema>;
export type SelectedJob = z.infer<typeof selectJobSchema>;
