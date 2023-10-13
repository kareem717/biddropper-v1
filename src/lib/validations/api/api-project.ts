import { insertCompanySchema } from "@/lib/validations/entities/companies";
import { insertMediaSchema } from "../references/media";
import { insertProjectSchema } from "../posts/projects";
import * as z from "zod";
import { fetchBidsSchema } from "./api-bid";

export const createProjectSchema = insertProjectSchema
	.extend({
		companyId: insertCompanySchema.shape.id,
		projectMedia: z.array(insertMediaSchema.omit({ id: true })).optional(),
	})
	.omit({ id: true });

export const fetchProjectQuerySchema = z.object({
	limit: fetchBidsSchema.shape.limit,
	companyId: insertCompanySchema.shape.id.optional(),
	projectId: insertProjectSchema.shape.id.optional(),
	fetchType: z
		.string()
		.optional()
		.default("simple")
		.refine((value) => ["deep", "simple", "minimal"].includes(value), {
			message:
				"The 'fetchType' parameter must be either 'deep', 'simple', 'minimal",
		}),
});

export const updateProjectSchema = insertProjectSchema
	.omit({ createdAt: true, updatedAt: true })
	.extend({
		newMedia: z.array(insertMediaSchema.omit({ id: true })).optional(),
		removedMedia: z.array(z.string()).optional(),
	});

export const deleteProjectSchema = z.object({
	projectId: insertProjectSchema.shape.id,
});
