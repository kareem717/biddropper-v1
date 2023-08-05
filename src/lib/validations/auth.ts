import * as z from "zod";
const MB_BYTES = 1000000; // Number of bytes in a megabyte.

// This is the list of mime types you will accept with the schema
const ACCEPTED_MIME_TYPES = ["image/gif", "image/jpeg", "image/png"];
export const userSchema = z.object({
	firstName: z
		.string()
		.min(2, {
			message: "First name must be at least 2 characters long",
		})
		.max(50, {
			message: "First name must be at most 50 characters long",
		})
		.refine((data) => /^[a-zA-Z()]+$/.test(data), {
			message: "First name must only contain letters",
		}),
	lastName: z
		.string()
		.min(2, {
			message: "Last name must be at least 2 characters long",
		})
		.max(50, {
			message: "Last name must be at most 50 characters long",
		})
		.refine((data) => /^[a-zA-Z()]+$/.test(data), {
			message: "Last name must only contain letters",
		}),
	email: z.string().email({
		message: "Please enter a valid email address",
	}),
	password: z
		.string()
		.min(8, {
			message: "Password must be at least 8 characters long",
		})
		.max(100)
		.regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/, {
			message:
				"Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character",
		}),
	birthDate: z.date().superRefine((data, ctx) => {
		const YEAR_IN_MILISECONDS = 3.154e10;
		if (data.getTime() > Date.now()) {
			ctx.addIssue({
				code: z.ZodIssueCode.invalid_date,
				message: "You're not born yet?",
			});
		} else if (Date.now() - data.getTime() < 18 * YEAR_IN_MILISECONDS) {
			ctx.addIssue({
				code: z.ZodIssueCode.invalid_date,
				message: "You must be at least 18 years old to register",
			});
		} else if (data.getTime() < new Date("1900-01-01").getTime()) {
			const age = Math.floor(
				(Date.now() - data.getTime()) / YEAR_IN_MILISECONDS
			);
			ctx.addIssue({
				code: z.ZodIssueCode.invalid_date,
				message: `Bro if you're ${age} years old, email us plz`,
			});
		}
	}),
	gender: z.enum(["male", "female", "other"]),
});

export const verfifyEmailSchema = z.object({
	code: z
		.string()
		.min(6, {
			message: "Verification code must be 6 characters long",
		})
		.max(6),
});

export const checkEmailSchema = z.object({
	email: userSchema.shape.email,
});

export const resetPasswordSchema = z
	.object({
		password: userSchema.shape.password,
		confirmPassword: userSchema.shape.password,
		code: verfifyEmailSchema.shape.code,
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});
