import * as z from "zod";
import { enumBidStatus } from "@/db/schema/tables/enums";

const getQueryParams = z
	.object({
		jobId: z
			.string({
				required_error: "Missing identifier.",
			})
			.uuid()
			.optional(),
		contractId: z
			.string({
				required_error: "Missing identifier.",
			})
			.uuid()
			.optional(),
		status: z
			.preprocess(
				(input) => (typeof input === "string" ? JSON.parse(input) : input),
				z.array(z.enum(enumBidStatus.enumValues))
			)
			.optional()
			.default(["pending"]),
		minPrice: z.string().optional(),
		maxPrice: z.string().optional(),
		limit: z.coerce
			.number()
			.max(50, {
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
		includeInactive: z
			.string()
			.optional()
			.transform((val) => val?.toLowerCase() === "true")
			.transform((bool) => (bool ? [true, false] : [true])),
	})
	.refine(
		(data) =>
			!(data.jobId && data.contractId) && (data.jobId || data.contractId),
		{
			message: "At least one, and only one, identifier should be provided.",
		}
	);

const postQueryParams = z.object({
	jobId: z
		.string({
			required_error: "Missing identifier.",
		})
		.uuid()
		.optional(),
	contractId: z
		.string({
			required_error: "Missing identifier.",
		})
		.uuid()
		.optional(),
	companyId: z
		.string({
			required_error: "Missing identifier.",
		})
		.uuid(),
	note: z
		.string()
		.max(300, {
			message: "Note is too long.",
		})
		.optional(),
	price: z.coerce
		.number({
			required_error: "Missing price.",
		})
		.nonnegative({
			message: "Invalid price.",
		})
		.transform((val) => String(val)),
});

const patchQueryParams = postQueryParams
	.partial()
	.extend({
		bidId: z
			.string({
				required_error: "Missing identifier.",
			})
			.uuid(),
		status: z.enum(enumBidStatus.enumValues).optional(),
	})
	.omit({ jobId: true, contractId: true, companyId: true });

const deleteQueryParams = z.object({
	bidId: z
		.string({
			required_error: "Missing identifier.",
		})
		.uuid()
});

export const queryParamSchema = {
	GET: getQueryParams,
	POST: postQueryParams.refine(
		(data) => Boolean(data.jobId) !== Boolean(data.contractId),
		{
			message: "At least one, and only one, identifier should be provided.",
		}
	),
	PATCH: patchQueryParams,
	DELETE: deleteQueryParams,
};
