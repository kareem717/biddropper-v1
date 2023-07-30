import * as z from "zod";

export const newContractSchema = z.object({
	userId: z.string().min(1).max(191),
	title: z.string().min(2).max(191),
	description: z.string().max(750),
	jobs: z.array(
		z
			.object({
				type: z
					.string()
					.min(2, { message: "Job type must be 2 or more characters" })
					.max(100, { message: "Job type must be 100 or less characters" }),
				description: z
					.string()
					.min(2, { message: "Job description must be 2 or more characters" })
					.max(255, { message: "Job description must be less than 500 characters" }),
			})
			.optional()
	),
});
