import * as z from "zod";
import { createInsertSchema } from "drizzle-zod";
import { companies, industries } from "@/db/schema/tables/content";
import validator from "validator";
import { bodyParamSchema as addressPostSchema } from "../addresses/request";
import { db } from "@/db/client";
import { inArray, sql } from "drizzle-orm";

const postBodyParams = createInsertSchema(companies, {
	ownerId: z
		.string({
			required_error: "Missing identifier.",
		})
		.max(50, {
			message: "Invalid identifier.",
		})
		.refine((id) => /^user_[a-zA-Z0-9\-]{1,36}$/.test(id), {
			message: "Invalid identifier.",
		}),
	emailAddress: z
		.string({
			required_error: "Missing email address.",
		})
		.email({
			message: "Invalid email address.",
		}),
	phoneNumber: z
		.string({
			required_error: "Missing phone number.",
		})
		.refine((val) => validator.isMobilePhone(val), {
			message: "Invalid phone number.",
		})
		.transform((val) => {
			return val.replace(/\D/g, "");
		}),
	dateEstablished: z
		.string()
		.transform((val) => new Date(val))
		.refine((val) => {
			const now = new Date();
			return val <= now;
		}),
})
	.extend({
		address: addressPostSchema.POST,
		imageBase64: z.string(),
		industryValues: z
			.array(z.string())
			.min(1, {
				message: "Array must contain at least one value.",
			})
			.refine(
				(val) => {
					// Check if all values are unique
					return val.length === new Set(val).size;
				},
				{
					message: "Array must only contain unique values.",
				}
			),
	})
	.omit({
		id: true,
		createdAt: true,
		updatedAt: true,
		isVerified: true,
		imageId: true,
		addressId: true,
		isActive: true,
	});

export const bodyParamSchema = { POST: postBodyParams };
