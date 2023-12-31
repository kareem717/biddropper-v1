import { reviews } from "@/db/schema/tables/content";
import { base64Regex } from "@/lib/utils";
import { createInsertSchema } from "drizzle-zod";
import * as z from "zod";

const postBodyParams = createInsertSchema(reviews, {
	description: z.string().min(1).max(1500),
	title: z.string().min(1).max(255),
	rating: z
		.number()
		.min(1)
		.max(5)
		.multipleOf(0.5)
		.transform((num) => String(num)),
	companyId: z
		.string({
			required_error: "Missing identifier.",
		})
		.max(50, {
			message: "Invalid identifier.",
		})
		.refine((id) => /^comp_[a-zA-Z0-9\-]{1,36}$/.test(id), {
			message: "Invalid identifier.",
		}),
	authorId: z
		.string({
			required_error: "Missing identifier.",
		})
		.max(50, {
			message: "Invalid identifier.",
		})
		.refine((id) => /^user_[a-zA-Z0-9\-]{1,36}$/.test(id), {
			message: "Invalid identifier.",
		}),
})
	.omit({
		createdAt: true,
		updatedAt: true,
		companyId: true,
		id: true,
	})
	.extend({
		imageBase64: z
			.array(
				z.string().refine((str) => base64Regex.test(str), {
					message: "Invalid base64 image format",
				})
			)
			.max(3)
			.optional(),
	});

const getQueryParams = z.object({
	companyId: z
		.string({
			required_error: "Missing identifier.",
		})
		.max(50, {
			message: "Invalid identifier.",
		})
		.refine((id) => /^comp_[a-zA-Z0-9\-]{1,36}$/.test(id), {
			message: "Invalid identifier.",
		}),
	authorId: z
		.string({
			required_error: "Missing identifier.",
		})
		.max(50, {
			message: "Invalid identifier.",
		})
		.refine((id) => /^user_[a-zA-Z0-9\-]{1,36}$/.test(id), {
			message: "Invalid identifier.",
		})
		.optional(),
	minRating: z.coerce
		.number()
		.min(1)
		.max(5)
		.multipleOf(0.5)
		.transform((num) => String(num))
		.optional(),
	maxRating: z.coerce
		.number()
		.min(1)
		.max(5)
		.multipleOf(0.5)
		.transform((num) => String(num))
		.optional(),
	limit: z.coerce.number().optional().default(15),
	minCreatedAt: z.coerce
		.number()
		.transform((num) => new Date(num * 1000))
		.optional(),
	maxCreatedAt: z.coerce
		.number()
		.transform((num) => new Date(num * 1000))
		.optional(),
	cursor: z
		.string()
		.max(50)
		.refine((str) => /^rev_[a-zA-Z0-9\-]{1,36}$/.test(str))
		.optional(),
});

export const queryParamsSchema = {
	GET: getQueryParams,
};

export const bodyParamSchema = {
	POST: postBodyParams,
};
