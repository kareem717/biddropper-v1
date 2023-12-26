import * as z from "zod";
import { createInsertSchema } from "drizzle-zod";
import { companies } from "@/db/schema/tables/content";
import validator from "validator";
import { bodyParamSchema as addressPostSchema } from "../addresses/request";

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
		}),
	dateEstablished: z.date().refine((val) => {
		const now = new Date();
		return val <= now;
	}),
})
	.extend({
		address: addressPostSchema.POST,
		imageUrl: z.string().url().optional(),
		industryValues: z.array(z.string()).optional(),
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
