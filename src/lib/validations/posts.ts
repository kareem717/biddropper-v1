import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { media, contracts, jobs, bids } from "@/db/migrations/schema";
import * as z from "zod";
import { industryValues } from "@/config/industries";

export const insertContractSchema = createInsertSchema(contracts)
export const selectContractSchema = createSelectSchema(contracts);

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

export type SelectedJob = z.infer<typeof selectJobSchema>;
export const selectContractMediaSchema = createSelectSchema(media);

export const insertBidsSchema = createInsertSchema(bids);
export const selectBidsSchema = createSelectSchema(bids);

export const insertMediaSchema = createInsertSchema(media);
export const selectMediaSchema = createSelectSchema(media);
