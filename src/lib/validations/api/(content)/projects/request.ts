import { base64Regex } from "@/lib/utils";
import * as z from "zod";

const getQueryParams = z.object({
	projectId: z
		.string({
			required_error: "Missing project identifier.",
		})
		.uuid()
		.optional(),
	includeInactive: z.preprocess(
		(val) => (typeof val === "string" ? val.toLowerCase() === "true" : false),
		z.boolean()
	),
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
			required_error: "Missing project identifier.",
		})
		.uuid(),
	description: z.string().max(3000).optional(),
	title: z.string().max(255).optional(),
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