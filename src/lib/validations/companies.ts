import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { addresses, companies } from "@/db/migrations/schema";
import * as z from "zod";
import { selectJobSchema } from "./posts";

export const insertCompanySchema = createInsertSchema(companies, {
	id: z.string().max(50, {	
		message: "ID must be at most 50 characters long",
	}).regex(/^comp_[A-Za-z0-9\-]+$/, {
		message: "ID must be in the format of comp_[A-Za-z0-9-]+",
	}),
});

export const selectCompanySchema = createSelectSchema(companies);

export const selectCompananyJobsSchema = z.record(
	z.object({
		...selectCompanySchema.shape,
		jobs: z.array(selectJobSchema),
	})
);

export type SelectedCompanyJobs = z.infer<typeof selectCompananyJobsSchema>;
