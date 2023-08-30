import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { media, bundles, jobs, bids } from "@/db/migrations/schema";
import * as z from "zod";
import { industryValues } from "@/config/industries";

export const insertBundleSchema = z.object({
	title: z
		.string()
		.min(3, {
			message: "Title must be at least 3 characters long",
		})
		.max(100, {
			message: "Title must be at most 100 characters long",
		}),
	isActive: z.boolean(),
	userId: z.string().max(50, {
		message: "User ID must be at most 50 characters long",
	}),
	description: z
		.string()
		.min(3, {
			message: "Description must be at least 3 characters long",
		})
		.max(750, {
			message: "Description must be at most 750 characters long",
		}),
	bundleType: z.enum(["sub-contract", "contractor-wanted"], {
		errorMap: (issue, ctx) => {
			return { message: "Please select a valid option" };
		},
	}),
	posterType: z.enum(["business-owner", "property-owner"], {
		errorMap: (issue, ctx) => {
			return { message: "Please select a valid option" };
		},
	}),
	addressId: z.string().max(50, {
		message: "Address ID must be at most 50 characters long",
	}),
	showExactLocation: z.boolean(),
});
export const selectBundleSchema = createSelectSchema(bundles);

export const insertJobSchema = createInsertSchema(jobs, {
	id: z
		.string()
		.max(50, {
			message: "ID must be at most 50 characters long",
		})
		.regex(/^job_[A-Za-z0-9\-]+$/, {
			message: "ID must be in the format of job_[A-Za-z0-9-]+",
		}),
	industry: z.string().refine((value) => {
		return industryValues.includes(value);
	}, "Please select a valid option"),
	details: z
		.string()
		.min(10, {
			message: "Details must be at least 10 characters long",
		})
		.max(3000, {
			message: "Details must be at most 3000 characters long",
		}),
});

export const selectJobSchema = createSelectSchema(jobs);

export const insertBundleMediaSchema = createInsertSchema(media, {
	bundleId: z.string().max(50, {
		message: "Bundle ID must be at most 50 characters long",
	}),
	mediaUrl: z.string().url({
		message: "Please enter a valid URL",
	}),
	fileKey: z.string().max(191, {
		message: "File key must be at most 191 characters long",
	}),
});
export const selectBundleMediaSchema = createSelectSchema(media);

export const insertBidsSchema = createInsertSchema(bids);
export const selectBidsSchema = createSelectSchema(bids);
