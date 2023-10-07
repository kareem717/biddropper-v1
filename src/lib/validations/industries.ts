import * as z from "zod";
import { createInsertSchema } from "drizzle-zod";
import { industries } from "@/db/migrations/schema";

export const insertIndustrySchema = createInsertSchema(industries, {
	label: z.string().max(100, {
		message: "Label must be at most 100 characters long",
	}),
	value: z.string().max(100, {
		message: "Value must be at most 100 characters long",
	}),
});
