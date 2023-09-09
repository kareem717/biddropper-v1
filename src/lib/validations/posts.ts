import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { media, contracts, jobs, bids } from "@/db/migrations/schema";
import * as z from "zod";
import { industryValues } from "@/config/industries";
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

export const insertContractSchema = createInsertSchema(contracts, {
	title: z
		.string()
		.min(3, {
			message: "Title must be at least 3 characters long",
		})
		.max(100, {
			message: "Title must be at most 100 characters long",
		})
		.regex(/^[A-Za-z0-9\-!, \/\\.'"()]+$/, {
			message:
				"Title must only contain letters, spaces, numbers, and the following symbols: [-!, /\\.'\"()]",
		}),
	description: z
		.string()
		.min(10, {
			message: "Description must be at least 10 characters long",
		})
		.max(3000, {
			message: "Description must be at most 3000 characters long",
		}),
});
export const selectContractSchema = createSelectSchema(contracts);
export const createContractSchema = z.object({
	title: insertContractSchema.shape.title,
	description: insertContractSchema.shape.description,
	jobs: selectJobSchema.array().min(1, {
		message: "You must select at least one job",
	}),
	payment: z.union([
		z.object({
			type: z.literal("commission"),
			value: z
				.number()
				.positive({
					message: "Commission must be greater than 0%",
				})
				.max(100, {
					message: "Commission must be less than 100%",
				})
				.multipleOf(0.0001, {
					message: "Commission must be rounded to the nearest 0.0001%",
				}),
		}),
		z.object({
			type: z.literal("fixed"),
			value: z
				.number()
				.positive({
					message: "Price must be greater than 0",
				})
				.max(100000000, {
					message: "Price must be less than 100,000,000",
				})
				.multipleOf(0.01, {
					message: "Price must be rounded to the nearest cent",
				}),
		}),
	]),
	endDate: z
  .string()
  .refine(
    (value) => {
      const dateValue = Date.parse(value);
      const now = new Date();
      return !isNaN(dateValue) && new Date(value) > now;
    },
    {
      message: "endDate must be a valid date string representing a date in the future",
    }
  )
  .transform((value) => {
    return new Date(value);
  })
  .or(
    z.date().refine(
      (value) => {
        const now = new Date();
        return value > now;
      },
      {
        message: "endDate must be a date in the future",
      }
    )
  )
  .nullable(),
});


export const selectContractMediaSchema = createSelectSchema(media);

export const insertBidsSchema = createInsertSchema(bids);
export const selectBidsSchema = createSelectSchema(bids);

export const insertMediaSchema = createInsertSchema(media);
export const selectMediaSchema = createSelectSchema(media);
