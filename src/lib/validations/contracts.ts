import * as z from "zod";

export const newContractSchema = z.object({
	userId: z.string().min(1).max(191),
	title: z.string().min(2).max(191),
	price: z.string().superRefine((val, ctx) => {
		if (isNaN(Number(val))) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Price must be a number",
				path: [],
			});
		}

		if (Number(val) < 0) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Price must be a positive number",
				path: [],
			});
		}

		if (Number(val) > 9999999) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Price must be less than 9,999,999",
				path: [],
			});
		}

		return true;
	}),
	description: z.string().max(750),
	features: z.array(
		z
			.object({
				name: z
					.string()
					.min(2, { message: "Name must be 2 or more characters" })
					.max(191, { message: "Name must be less than 191 characters" }),
				value: z
					.string()
					.min(2, { message: "Value must be 2 or more characters" })
					.max(255, { message: "Value must be less than 255 characters" }),
			})
			.optional()
	),
});
