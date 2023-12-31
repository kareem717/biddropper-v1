import { base64Regex } from "@/lib/utils";
import * as z from "zod";

const getQueryParams = z.object({
	reviewId: z
		.string({
			required_error: "Missing identifier.",
		})
		.max(50, {
			message: "Invalid identifier.",
		})
		.refine((id) => /^rev_[a-zA-Z0-9\-]{1,36}$/.test(id), {
			message: "Invalid identifier.",
		})
		.optional(),
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

const deleteQueryParams = z.object({
	id: z
		.string({
			required_error: "Missing identifier.",
		})
		.max(50, {
			message: "Invalid identifier.",
		})
		.refine((id) => /^rev_[a-zA-Z0-9\-]{1,36}$/.test(id), {
			message: "Invalid identifier.",
		}),
});

const patchBodyParams = z.object({
	id: z
		.string({
			required_error: "Missing identifier.",
		})
		.max(50, {
			message: "Invalid identifier.",
		})
		.refine((id) => /^rev_[a-zA-Z0-9\-]{1,36}$/.test(id), {
			message: "Invalid identifier.",
		}),
	description: z.string().max(1500).optional(),
	title: z.string().max(255).optional(),
	rating: z.coerce
		.number()
		.min(1)
		.max(5)
		.multipleOf(0.5)
		.transform((num) => String(num))
		.optional(),
	addedImageBase64: z
		.array(
			z.string().refine((str) => base64Regex.test(str), {
				message: "Invalid base64 image format",
			})
		)
		.max(3)
		.optional(),
	removedMediaUrls: z
		.array(
			z
				.string()
				.max(50, {
					message: "Invalid identifier.",
				})
				.refine((id) => /^media_[a-zA-Z0-9\-]{1,36}$/.test(id), {
					message: "Invalid identifier.",
				})
		)
		.optional(),
});

export const queryParamsSchema = {
	GET: getQueryParams,
	DELETE: deleteQueryParams,
};

export const bodyParamsSchema = {
	PATCH: patchBodyParams,
};
