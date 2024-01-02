import { projects } from "@/db/schema/tables/content";
import { base64Regex } from "@/lib/utils";
import { createInsertSchema } from "drizzle-zod";
import * as z from "zod";

const postBodyParams = createInsertSchema(projects, {
	companyId: z.string().uuid(),
	description: z.string().min(1).max(3000),
	title: z.string().min(1).max(100),
})
	.omit({
		id: true,
		createdAt: true,
		updatedAt: true,
	})
	.extend({
		imageBase64: z
			.array(
				z.string().refine((str) => base64Regex.test(str), {
					message: "Invalid base64 image format",
				})
			)
			.max(5)
			.optional(),
	});

export const bodyParamSchema = {
	POST: postBodyParams,
};
