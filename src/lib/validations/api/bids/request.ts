import * as z from "zod";
import { enumBidStatus } from "@/db/schema/tables/enums";

const getQueryParams = z
	.object({
		jobId: z
			.string({
				required_error: "Missing identifier.",
			})
			.max(50, {
				message: "Invalid identifier.",
			})
			.refine((id) => /^job_[a-zA-Z0-9\-]{1,36}$/.test(id), {
				message: "Invalid identifier.",
			})
			.optional(),
		contractId: z
			.string({
				required_error: "Missing identifier.",
			})
			.max(50, {
				message: "Invalid identifier.",
			})
			.refine((id) => /^cntr_[a-zA-Z0-9\-]{1,36}$/.test(id), {
				message: "Invalid identifier.",
			})
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
		limit: z.coerce.number().optional().default(15),
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

const postQueryParams = z
	.object({
		jobId: z
			.string({
				required_error: "Missing identifier.",
			})
			.max(50, {
				message: "Invalid identifier.",
			})
			.refine((id) => /^job_[a-zA-Z0-9\-]{1,36}$/.test(id), {
				message: "Invalid identifier.",
			})
			.optional(),
		contractId: z
			.string({
				required_error: "Missing identifier.",
			})
			.max(50, {
				message: "Invalid identifier.",
			})
			.refine((id) => /^cntr_[a-zA-Z0-9\-]{1,36}$/.test(id), {
				message: "Invalid identifier.",
			})
			.optional(),
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
		price: z.coerce
			.number({
				required_error: "Missing price.",
			})
			.nonnegative({
				message: "Invalid price.",
			})
			.transform((val) => String(val)),
	})
	.refine((data) => Boolean(data.jobId) !== Boolean(data.contractId), {
		message: "At least one, and only one, identifier should be provided.",
	});
export const queryParamSchema = { GET: getQueryParams, POST: postQueryParams };
