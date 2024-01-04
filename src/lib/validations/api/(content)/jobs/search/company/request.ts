import { jobs } from "@/db/schema/tables/content";
import { enumPropertyType, enumStartDateFlag } from "@/db/schema/tables/enums";
import { createInsertSchema } from "drizzle-zod";
import * as z from "zod";
import { base64Regex } from "@/lib/utils";

const postBodyParams = z.object({
	ids: z.array(z.string().uuid()).optional(),
	includeInactive: z.preprocess(
		(val) => (typeof val === "string" ? val.toLowerCase() === "true" : false),
		z.boolean()
	),
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
	minStartDate: z.coerce
		.number()
		.transform((num) => new Date(num * 1000))
		.optional(),
	maxStartDate: z.coerce
		.number()
		.transform((num) => new Date(num * 1000))
		.optional(),
	cursor: z.string().uuid().optional(),
	propertyTypes: z.array(z.enum(enumPropertyType.enumValues)).optional(),
	startDateFlags: z.array(z.enum(enumStartDateFlag.enumValues)).optional(),
	locationFilter: z
		.object({
			lat: z.number().min(-90).max(90),
			lng: z.number().min(-180).max(180),
			kmDistance: z.number().min(0).max(9999).multipleOf(0.001),
		})
		.optional(),
	companyId: z.string({
		required_error: "Company ID is required.",
	}).uuid(),
});

export const bodyParamSchema = { POST: postBodyParams };
