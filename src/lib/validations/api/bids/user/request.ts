import * as z from "zod";
import { enumBidStatus } from "@/db/schema/tables/enums";

const getQueryParams = z
	.object({
		id: z
			.string({
				required_error: "Missing identifier.",
			})
			.max(50, {
				message: "Invalid identifier.",
			})
			.refine((id) => /^user_[a-zA-Z0-9\-]{1,36}$/.test(id), {
				message: "Invalid identifier.",
			}),
		bidTarget: z.enum(["jobs", "contracts"]).optional(),
		includeCompanies: z.coerce.boolean().optional().default(false),
		outgoing: z.coerce.boolean().optional().default(false),
		includeInactive: z
			.string()
			.optional()
			.transform((val) => val?.toLowerCase() === "true")
			.transform((bool) => (bool ? [true, false] : [true])),
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
		cursor: z
			.string()
			.max(50, {
				message: "Invalid cursor.",
			})
			.refine((id) => /^bid_[a-zA-Z0-9\-]{1,36}$/.test(id), {
				message: "Invalid identifier.",
			})
			.optional(),
		minCreatedAt: z.coerce
			.number()
			.transform((num) => new Date(num * 1000))
			.optional(),
		maxCreatedAt: z.coerce
			.number()
			.transform((num) => new Date(num * 1000))
			.optional(),
	})
	.refine(
		(data) => !(data.includeCompanies === true && data.outgoing === true),
		{
			message: "Conflicting parameters.",
			path: ["includeCompanies", "outgoing"],
		}
	);

export const queryParamSchema = { GET: getQueryParams };
