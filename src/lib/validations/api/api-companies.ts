import { insertCompanySchema } from "../entities/companies";
import { insertAddressSchema } from "../references/address";
import { insertIndustrySchema } from "../references/industries";
import { insertMediaSchema } from "../references/media";
import * as z from "zod";
import { fetchBidsSchema } from "./api-bid";
import { insertJobSchema, selectJobSchema } from "../posts/jobs";
import { insertProjectSchema } from "../posts/projects";
import { insertReviewSchema } from "../posts/reviews";
import { createJobSchema } from "./api-job";
import { createReviewSchema } from "./api-review";
import { createProjectSchema } from "./api-project";

export const createCompanySchema = insertCompanySchema
	.omit({
		createdAt: true,
		updatedAt: true,
		addressId: true,
		isVerified: true,
		imageId: true,
		id: true,
	})
	.extend({
		address: insertAddressSchema.omit({
			id: true,
			createdAt: true,
			updatedAt: true,
		}),
		industries: insertIndustrySchema.omit({ id: true, label: true }).array(),
		image: insertMediaSchema
			.omit({
				id: true,
			})
			.optional(),
		dateEstablished: z.coerce.date(),
	});

export const fetchCompanyQuerySchema = z.object({
	companyId: insertCompanySchema.shape.id.optional(),
	limit: fetchBidsSchema.shape.limit,
	fetchType: z
		.string()
		.optional()
		.default("simple")
		.refine((value) => ["deep", "simple", "minimal"].includes(value), {
			message:
				"The 'fetchType' parameter must be either 'deep', 'simple', 'minimal",
		}),
});

export const updateCompanySchema = insertCompanySchema
	.omit({
		createdAt: true,
		updatedAt: true,
		ownerId: true,
		isVerified: true,
		addressId: true,
		imageId: true,
	})
	.extend({
		addedJobs: createJobSchema.optional(),
		addedIndustries: insertIndustrySchema.shape.id.array().optional(),
		addedProjects: createProjectSchema.optional(),
		addedReviews: createReviewSchema.optional(),
		removedJobs: insertJobSchema.shape.id.array().optional(),
		removedIndustries: insertIndustrySchema.shape.id.array().optional(),
		removedProjects: insertProjectSchema.shape.id.array().optional(),
		removedReviews: insertReviewSchema.shape.id.array().optional(),
		newAddress: insertAddressSchema
			.omit({
				id: true,
				createdAt: true,
				updatedAt: true,
			})
			.optional(),
		newImage: insertMediaSchema
			.omit({
				id: true,
			})
			.optional(),
	});

export const deleteCompanySchema = z.object({
	companyId: insertCompanySchema.shape.id,
});
