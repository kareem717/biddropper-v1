import { insertContractSchema } from "../posts/contracts";
import * as z from "zod";
import { fetchBidsSchema } from "./api-bid";
import { selectJobSchema } from "../posts/jobs";
import { insertJobSchema } from "../posts/jobs";
import { insertCompanySchema } from "@/lib/validations/entities/companies";

export const createContractSchema = z.object({
	title: insertContractSchema.shape.title,
	description: insertContractSchema.shape.description,
	jobs: selectJobSchema.shape.id.array().min(1, {
		message: "You must select at least one job",
	}),
	price: z
		.number()
		.positive({
			message: "Price must be greater than 0",
		})
		.max(100000000, {
			message: "Price must be less than 100,000,000",
		})
		.multipleOf(0.01, {
			message: "Price must be rounded to the nearest cent",
		})
		.transform((value) => String(value)),
	endDate: z
		.string()
		.refine(
			(value) => {
				const dateValue = Date.parse(value);
				const now = new Date();
				return !isNaN(dateValue) && new Date(value) > now;
			},
			{
				message:
					"endDate must be a valid date string representing a date in the future",
			}
		)
		.transform((value) => new Date(value))
		.nullable(),
});

export const fetchContractsQuerySchema = z
	.object({
		limit: fetchBidsSchema.shape.limit,
		contractId: insertContractSchema.shape.id.optional(),
		companyId: insertCompanySchema.shape.id.optional(),
		fetchType: z
			.string()
			.optional()
			.default("simple")
			.refine((value) => ["deep", "simple", "minimal"].includes(value), {
				message:
					"The 'fetchType' parameter must be either 'deep', 'simple', 'minimal",
			}),
		getInactive: fetchBidsSchema.shape.getInactive.optional(),
	})
	.refine((data) => data.fetchType === "minimal" && data.getInactive === true, {
		message:
			"'getInactive' can only be included if 'fetchType' is either 'deep' or 'simple'",
	});

export const updateContractSchema = z.object({
	id: insertContractSchema.shape.id,
	removedJobs: z.array(insertJobSchema.shape.id).optional(),
	newJobs: z.array(selectJobSchema.shape.id).optional(),
	price: createContractSchema.shape.price.optional(),
	endDate: createContractSchema.shape.endDate.optional(),
	isActive: insertContractSchema.shape.isActive.optional(),
	title: createContractSchema.shape.title.optional(),
	description: createContractSchema.shape.description.optional(),
});

export const deleteContractQuerySchema = z.object({
	contractId: insertContractSchema.shape.id,
});

export type APICreateContract = z.infer<typeof createContractSchema>;
export type APIFetchContractsQuery = z.infer<typeof fetchContractsQuerySchema>;

