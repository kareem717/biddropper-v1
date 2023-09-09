import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { addresses, companies } from "@/db/migrations/schema";
import * as z from "zod";
import { selectJobSchema } from "./posts";

export const insertCompanySchema = createInsertSchema(companies);
export const selectCompanySchema = createSelectSchema(companies);

export const selectCompananyJobsSchema = z.record(
	z.object({
		...selectCompanySchema.shape,
		jobs: z.array(selectJobSchema),
	})
);

export type SelectedCompanyJobs = z.infer<typeof selectCompananyJobsSchema>;
