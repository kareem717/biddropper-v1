import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { companies } from "@/db/migrations/schema";
import * as z from "zod";
import { selectJobSchema } from "./posts/jobs";
import validator from "validator";
export const insertCompanySchema = createInsertSchema(companies, {
	id: z
		.string()
		.max(50, {
			message: "ID must be at most 50 characters long",
		})
		.regex(/^comp_[A-Za-z0-9\-]+$/, {
			message: "ID must be in the format of comp_[A-Za-z0-9-]+",
		}),
	dateEstablished: z.date().superRefine((val, ctx) => {
		if (val > new Date()) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Date cannot be in the future",
			});
		}
	}),
	emailAddress: z
		.string()
		.email({
			message: "Email address must be a valid email address",
		})
		.max(320, {
			message: "Email address must be at most 320 characters long",
		}),
	websiteUrl: z
		.string()
		.max(2083, {
			message: "Website URL must be at most 2083 characters long",
		})
		.refine((val) => validator.isURL(val), {
			message: "Website URL must be a valid URL",
		}),
	phoneNumber: z
		.string()
		.max(20, {
			message: "Phone number must be at most 20 characters long",
		})
		.refine((val) => validator.isMobilePhone(val), {
			message: "Phone number must be a valid phone number",
		}),
});

export const selectCompanySchema = createSelectSchema(companies, {
	createdAt: z.coerce.date(),
	dateEstablished: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

//TODO: This is not working how i want because im pulling industries from the db now
export const selectCompananyJobsSchema = z.record(
	z.object({
		...selectCompanySchema.shape,
		jobs: z.array(selectJobSchema),
	})
);

export type SelectedCompanyJobs = z.infer<typeof selectCompananyJobsSchema>;
