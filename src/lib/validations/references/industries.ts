import * as z from "zod";
import { createInsertSchema } from "drizzle-zod";
import { industries } from "@/db/migrations/schema";

export const insertIndustrySchema = createInsertSchema(industries, {
	id: z
		.string()
		.max(50, {
			message: "ID must be at most 50 characters long",
		})
		.regex(/^ind_[A-Za-z0-9\-]+$/, {
			message: "ID must be in the format of inds_[A-Za-z0-9-]+",
		}),
	label: z.string().max(100, {
		message: "Label must be at most 100 characters long",
	}),
	value: z.string().max(100, {
		message: "Value must be at most 100 characters long",
	}),
});

