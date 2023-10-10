import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { projects } from "@/db/migrations/schema";
import * as z from "zod";

export const insertProjectSchema = createInsertSchema(projects, {
	id: z
		.string()
		.max(50, {
			message: "ID must be at most 50 characters long",
		})
		.regex(/^proj_[A-Za-z0-9\-]+$/, {
			message: "ID must be in the format of project_[A-Za-z0-9-]+",
		}),
	title: z
		.string()
		.min(3, {
			message: "Title must be at least 3 characters long",
		})
		.max(255, {
			message: "Title must be at most 255 characters long",
		}),
	details: z
		.string()
		.min(10, {
			message: "Details must be at least 10 characters long",
		})
		.max(3000, {
			message: "Details must be at most 3000 characters long",
		}),
});
