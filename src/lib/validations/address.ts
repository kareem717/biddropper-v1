import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { addresses } from "@/db/migrations/schema";
import * as z from "zod";

export const insertAddressSchema = createInsertSchema(addresses, {
	addressLine1: z
		.string()
		.min(3, {
			message: "Address Line 1 must be at least 3 characters long",
		})
		.max(70, {
			message: "Address Line 1 must be at most 70 characters long",
		})
		.regex(/^[a-zA-Z0-9\s\.]+$/, {
			message:
				"Address Line 1 may only contain alphanumeric characters, spaces, and periods",
		})
		.transform((value) => {
			return value.trim();
		}),
	addressLine2: z
		.string()
		.min(3, {
			message: "Address Line 2 must be at least 3 characters long",
		})
		.max(70, {
			message: "Address Line 2 must be at most 70 characters long",
		})
		.regex(/^[a-zA-Z0-9\s\.\#]+$/, {
			message:
				"Address Line 2 may only contain alphanumeric characters, spaces, periods, and pounds",
		})
		.transform((value) => {
			return value.trim();
		})
		.optional(),
	city: z
		.string()
		.min(3, {
			message: "City must be at least 3 characters long",
		})
		.max(50, {
			message: "City must be at most 50 characters long",
		})
		.regex(/^[a-zA-Z\s]+$/, {
			message: "City may only contain letters and spaces",
		})
		.transform((value) => {
			return value.trim();
		}),
	region: z
		.string()
		.min(3, {
			message: "Region must be at least 3 characters long",
		})
		.max(50, {
			message: "Region must be at most 50 characters long",
		})
		.regex(/^[a-zA-Z\s]+$/, {
			message: "Region may only contain letters and spaces",
		})
		.transform((value) => {
			return value.trim();
		}),
	postalCode: z
		.string()
		.min(3, {
			message: "Postal Code must be at least 3 characters long",
		})
		.max(10, {
			message: "Postal Code must be at most 10 characters long",
		})
		.regex(/^[a-zA-Z0-9\s]+$/, {
			message:
				"Postal Code may only contain alphanumeric characters and spaces",
		})
		.transform((value) => {
			return value.trim();
		}),
	country: z
		.string()
		.min(3, {
			message: "Country must be at least 3 characters long",
		})
		.max(60, {
			message: "Country must be at most 60 characters long",
		})
		.regex(/^[a-zA-Z\s]+$/, {
			message: "Country may only contain letters and spaces",
		})
		.transform((value) => {
			return value.trim();
		}),
});

export const selectAddressSchema = createSelectSchema(addresses);
