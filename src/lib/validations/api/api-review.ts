import { insertReviewSchema } from "@/lib/validations/posts/reviews";
import { insertCompanySchema } from "@/lib/validations/entities/companies";
import { insertMediaSchema } from "../references/media";
import * as z from "zod";
import { fetchBidsSchema } from "./api-bid";
import { insertUserSchema } from "../entities/user";

export const createReviewSchema = insertReviewSchema
	.extend({
		companyId: insertCompanySchema.shape.id,
		reviewMedia: z.array(insertMediaSchema.omit({ id: true })),
	})
	.omit({ id: true, authorId: true });


export const fetchReviewQuerySchema = z.object({
	limit: fetchBidsSchema.shape.limit,
	companyId: insertCompanySchema.shape.id.optional(),
	authorId: insertUserSchema.shape.id.optional(),
	reviewId: insertReviewSchema.shape.id.optional(),
	fetchType: z
		.string()
		.optional()
		.default("simple")
		.refine((value) => ["deep", "simple", "minimal"].includes(value), {
			message:
				"The 'fetchType' parameter must be either 'deep', 'simple', 'minimal",
		}),
});

export const updateReviewSchema = insertReviewSchema
	.omit({ createdAt: true, updatedAt: true, authorId: true })
	.extend({
		newMedia: z.array(insertMediaSchema.omit({ id: true })).optional(),
		removedMedia: z.array(z.string()).optional(),
	});

export const deleteReviewSchema = insertReviewSchema.pick({ id: true });
