import { base64Regex } from "@/lib/utils";
import * as z from "zod";

const getQueryParams = z.object({
	reviewId: z
		.string({
			required_error: "Missing identifier.",
		})
		.uuid()
		.optional(),
	authorId: z
		.string({
			required_error: "Missing identifier.",
		})
		.uuid()
		.optional(),
	includeInactive: z.preprocess(
		(val) => (typeof val === "string" ? val.toLowerCase() === "true" : false),
		z.boolean()
	),
	minRating: z.coerce
		.number()
		.min(0)
		.max(5)
		.multipleOf(0.5)
		.transform((num) => String(num))
		.optional(),
	maxRating: z.coerce
		.number()
		.min(0)
		.max(5)
		.multipleOf(0.5)
		.transform((num) => String(num))
		.optional(),
	limit: z.coerce
		.number()
		.max(25, {
			message: "Limit is too large.",
		})
		.optional()
		.default(15),
	minCreatedAt: z.coerce
		.number()
		.transform((num) => new Date(num * 1000))
		.optional(),
	maxCreatedAt: z.coerce
		.number()
		.transform((num) => new Date(num * 1000))
		.optional(),
	cursor: z.string().uuid().optional(),
});

const deleteQueryParams = z.object({
	id: z
		.string({
			required_error: "Missing identifier.",
		})
		.uuid(),
});

const patchBodyParams = z.object({
	id: z
		.string({
			required_error: "Missing identifier.",
		})
		.uuid(),
	description: z.string().max(1500).optional(),
	title: z.string().max(255).optional(),
	rating: z.coerce
		.number()
		.min(0)
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
	removedMediaUrls: z.array(z.string().url()).optional(),
});

export const queryParamsSchema = {
	GET: getQueryParams,
	DELETE: deleteQueryParams,
};

export const bodyParamsSchema = {
	PATCH: patchBodyParams,
};
