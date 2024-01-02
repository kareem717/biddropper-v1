import * as z from "zod";
import { enumBidStatus } from "@/db/schema/tables/enums";

const getQueryParams = z.object({
	id: z
		.string({
			required_error: "Missing identifier.",
		})
		.uuid(),
	bidTarget: z.enum(["jobs", "contracts"]).optional(),
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
	limit: z.coerce
		.number()
		.max(50, {
			message: "Limit is too large.",
		})
		.optional()
		.default(15),
	cursor: z.string().uuid().optional(),
	minCreatedAt: z.coerce
		.number()
		.transform((num) => new Date(num * 1000))
		.optional(),
	maxCreatedAt: z.coerce
		.number()
		.transform((num) => new Date(num * 1000))
		.optional(),
});

export const queryParamSchema = { GET: getQueryParams };
