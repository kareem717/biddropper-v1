import * as z from "zod";
import { insertJobSchema } from "../posts/jobs";
import { insertCompanySchema } from "@/lib/validations/entities/companies";
import { insertMediaSchema } from "../references/media";
import { fetchBidsSchema } from "./api-bid";
import { insertUserSchema } from "../entities/user";

export const createJobSchema = z.object({
	companyId: insertCompanySchema.shape.id.optional(),
	jobs: z.array(
		z.object({
			jobData: insertJobSchema.omit({ id: true }),
			media: z.array(insertMediaSchema.omit({ id: true })).optional(),
		})
	),
});

export const fetchJobsQuerySchema = z
	.object({
		limit: fetchBidsSchema.shape.limit,
		jobId: insertJobSchema.shape.id.optional(),
		companyId: insertCompanySchema.shape.id.optional(),
		userId: insertUserSchema.shape.id.optional(),
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
	.superRefine((data, ctx) => {
		console.log(data.fetchType, data.getInactive);
		if (data.fetchType === "minimal" && data.getInactive === true) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message:
					"'getInactive' can only be included if 'fetchType' is either 'deep' or 'simple'",
			});
		}

		if (data.companyId !== undefined && data.userId !== undefined) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message:
					"Only either 'companyId' or 'userId' can be passed, but not both",
			});
		}
	});

export const updateJobSchema = insertJobSchema
	.omit({ createdAt: true, updatedAt: true })
	.extend({
		newMedia: z.array(insertMediaSchema.omit({ id: true })).optional(),
		removedMedia: z.array(z.string()).optional(),
	});

export const deleteJobQuerySchema = z.object({
	jobId: insertJobSchema.shape.id,
});

export type APICreateJobSchema = z.infer<typeof createJobSchema>;
