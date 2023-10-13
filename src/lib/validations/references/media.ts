import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { media } from "@/db/migrations/schema";
import * as z from "zod";

export const insertMediaSchema = createInsertSchema(media, {
	id: z
		.string()
		.max(50, {
			message: "ID must be at most 50 characters long",
		})
		.regex(/^media_[A-Za-z0-9\-]+$/, {
			message: "ID must be in the format of media_[A-Za-z0-9-]+",
		}),
	fileUrl: z.string().url({
		message: "File URL must be a valid URL",
	}),
	fileKey: z.string(),
});
export const selectMediaSchema = createSelectSchema(media);

export type InsertMedia = z.infer<typeof insertMediaSchema>;