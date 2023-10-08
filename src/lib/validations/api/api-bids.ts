import * as z from "zod";
import { insertBidsSchema } from "@/lib/validations/posts/bids";
import { insertContractSchema, insertJobSchema } from "../posts";

export const updateBidSchema = z.object({
	id: insertBidsSchema.shape.id,
	price: insertBidsSchema.shape.price.optional(),
	status: insertBidsSchema.shape.status.optional(),
	companyId: insertBidsSchema.shape.companyId.optional(),
});

export const acceptBidQuerySchema = z
	.object({
		bidId: insertBidsSchema.shape.id,
		jobId: insertJobSchema.shape.id.optional(),
		contractId: insertContractSchema.shape.id.optional(),
	})
	.refine(
		(data) => {
			return (data.jobId == null) !== (data.contractId == null);
		},
		{
			message: "Either 'jobId' or 'contractId' must be provided, but not both",
			path: ["jobId", "contractId"],
		}
	);

export const fetchBidsSchema = z.object({
	limit: z.coerce
		.number({
			invalid_type_error: "The 'limit' pararmeter must be an number",
		})
		.positive({
			message: "The 'limit' pararmeter must be greater than 0",
		})
		.max(250, {
			message: "The 'limit' pararmeter must be less than 250",
		})
		.multipleOf(1, {
			message: "The 'limit' pararmeter must be a positive integer",
		})
		.optional()
		.default(25),
	bidType: z.coerce
		.string({
			invalid_type_error: "The 'bidType' parameter must be a string",
		})
		.optional()
		.default("job")
		.refine(
			(value) => {
				return ["job", "contract", "all"].includes(value);
			},
			{
				message:
					"The 'bidType' parameter must be either 'job', 'contract', or 'all'",
			}
		),
	getInactive: z
		.string()
		.optional()
		.default("false")
		.refine((value) => ["true", "false"].includes(value), {
			message: "The 'getInactive' parameter must be a boolean",
		})
		.transform((value) => value === "true"),
});

export const createBidSchema = insertBidsSchema
	.omit({ id: true })
	.extend({
		jobId: insertJobSchema.shape.id.optional(),
		contractId: insertContractSchema.shape.id.optional(),
	})
	.refine(
		(data) => {
			// Ensure that either jobId or contractId is provided, but not both
			return (data.jobId == null) !== (data.contractId == null);
		},
		{
			message: "Either 'jobId' or 'contractId' must be provided, but not both",
			path: ["jobId", "contractId"], // specify the path to the fields in the data object
		}
	);

export type APIUpdateBidSchema = z.infer<typeof updateBidSchema>;
export type APIAcceptBidQuerySchema = z.infer<typeof acceptBidQuerySchema>;
export type APIFetchBidsSchema = z.infer<typeof fetchBidsSchema>;
export type APICreateBidSchema = z.infer<typeof createBidSchema>;
