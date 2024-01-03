import { projects } from "@/db/schema/tables/content";
import { base64Regex } from "@/lib/utils";
import { createInsertSchema } from "drizzle-zod";
import * as z from "zod";

const postBodyParams = createInsertSchema(projects, {
	companyId: z.string().uuid(),
	description: z.string().min(1).max(3000),
	title: z.string().min(1).max(255),
})
	.omit({
		id: true,
		createdAt: true,
		updatedAt: true,
		isActive: true,
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

const getQueryParams = z.object({
	companyId: z
		.string({
			required_error: "Missing identifier.",
		})
		.uuid(),
	limit: z.coerce
		.number()
		.max(20, {
			message: "Limit is too large.",
		})
		.optional()
		.default(5),
	minCreatedAt: z.coerce
		.number()
		.transform((num) => new Date(num * 1000))
		.optional(),
	maxCreatedAt: z.coerce
		.number()
		.transform((num) => new Date(num * 1000))
		.optional(),
	cursor: z.string().uuid().optional(),
	includeInactive: z.preprocess(
		(val) => (typeof val === "string" ? val.toLowerCase() === "true" : false),
		z.boolean()
	)
});

export const bodyParamSchema = {
	POST: postBodyParams,
};

export const queryParamsSchema = {
	GET: getQueryParams,
};
