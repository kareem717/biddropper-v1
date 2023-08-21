import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { bundleMedia, bundles, jobs, bids } from "@/db/schema/posts";
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
	title: z
		.string()
		.min(3, {
			message: "Title must be at least 3 characters long",
		})
		.max(50, {
			message: "Title must be at most 50 characters long",
		}),
	summary: z
		.string()
		.min(3, {
			message: "Summary must be at least 3 characters long",
		})
		.max(400, {
			message: "Summary must be at most 400 characters long",
		}),
	industry: z.string().refine((value) => {
		return industryValues.includes(value);
	}, "Please select a valid option"),
	budget: z
		.string()
		.regex(/^\d+(\.\d{1,2})?$/gm, {
			message: "Please enter a valid number",
		})
		.transform((val) => {
			return parseFloat(val);
		}),
	dateFrom: z.date().refine((value) => {
		const tomorrow = new Date();
		const fiftyYearsFromNow = new Date();
		fiftyYearsFromNow.setFullYear(tomorrow.getFullYear() + 15);
		return value >= tomorrow && value <= fiftyYearsFromNow;
	}, "Date must be between tomorrow and 15 years in the future"),
	dateTo: z.optional(
		z.date().refine((value) => {
			const tomorrow = new Date();
			tomorrow.setDate(tomorrow.getDate() + 1);
			const fiftyYearsFromNow = new Date();
			fiftyYearsFromNow.setFullYear(tomorrow.getFullYear() + 55);
			return value >= tomorrow && value <= fiftyYearsFromNow;
		}, "Date must be in at least 2 days time and 15 years in the future")
	),
});
export const selectJobSchema = createSelectSchema(jobs);

export const insertBundleMediaSchema = createInsertSchema(bundleMedia, {
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
export const selectBundleMediaSchema = createSelectSchema(bundleMedia);

export const insertBidsSchema = createInsertSchema(bids);
export const selectBidsSchema = createSelectSchema(bids);
