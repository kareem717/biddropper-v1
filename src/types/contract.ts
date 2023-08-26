import * as z from "zod";
import { industries } from "@/db/config/industries";

const serviceValues = industries.map((category) => category.value) as [
	string,
	...string[]
];

export const contractJobSchema = z.object({
	title: z.string().min(2).max(50),
	serviceCategory: z.enum(serviceValues, {
		errorMap: (issue, ctx) => {
			return { message: "Please select a service category" };
		},
	}),
	summary: z
		.string()
		.min(2, { message: "Job description must be 2 or more characters" })
		.max(400, {
			message: "Job description must be less than 200 characters",
		}),
	propertyType: z.enum(["residential", "commercial"], {
		errorMap: (issue, ctx) => {
			return { message: "Please select a property type" };
		},
	}),
	budget: z
		.preprocess(
			(input) => {
				const processed = z.string().transform(Number).safeParse(input);
				return processed.success ? processed.data : input;
			},
			z
				.number({
					invalid_type_error: "Budget must be a valid number",
				})
				.min(1, { message: "Budget must be at least $1" })
				.max(3000000.01, {
					message: "Wrong place to spend more than $3,000,000 buddy",
				})
				.positive()
				.multipleOf(0.01, {
					message: "Budget must be rounded to the nearest cent",
				})
		)
		.optional(),
	dateRange: z.object({
		from: z.date().min(new Date(), {
			message: "Start date must be in the future",
		}),
		to: z
			.date()
			.min(new Date(), {
				message: "End date must be in the future",
			})
			.optional(),
	}),
});

export type ContractJob = z.infer<typeof contractJobSchema>;

export const createContractSchema = z.object({
	userId: z.string().min(1).max(191),
	title: z.string().min(2).max(100),
	description: z.string().min(2).max(750),
	jobs: z.array(contractJobSchema.optional()),
});

export type CreateContract = z.infer<typeof createContractSchema>;
