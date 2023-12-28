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

const patchBodyParams = createInsertSchema(companies, {
	emailAddress: z
		.string({
			required_error: "Missing email address.",
		})
		.email({
			message: "Invalid email address.",
		})
		.optional(),
	phoneNumber: z
		.string({
			required_error: "Missing phone number.",
		})
		.refine((val) => validator.isMobilePhone(val), {
			message: "Invalid phone number.",
		})
		.transform((val) => {
			return val.replace(/\D/g, "");
		})
		.optional(),
	dateEstablished: z
		.string()
		.transform((val) => new Date(val))
		.refine((val) => {
			const now = new Date();
			return val <= now;
		})
		.optional(),
	isVerified: z.boolean().optional(),
})
	.extend({
		id: z
			.string({
				required_error: "Missing identifier.",
			})
			.max(50, {
				message: "Invalid identifier.",
			})
			.refine((id) => /^comp_[a-zA-Z0-9\-]{1,36}$/.test(id), {
				message: "Invalid identifier.",
			}),
		address: addressPostSchema.POST.optional(),
		imageBase64: z.string().or(z.undefined()).optional(),
		deletedIndustryValues: z
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
			)
			.optional(),
		addedIndustryValues: z
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
			)
			.optional(),
	})
	.omit({
		createdAt: true,
		updatedAt: true,
		isVerified: true,
		imageId: true,
		addressId: true,
		isActive: true,
		ownerId: true,
	})
	.refine(
		(data) => {
			if (
				data.deletedIndustryValues === undefined ||
				data.addedIndustryValues === undefined
			) {
				return true;
			}
			// Check if deletedIndustryValues and addedIndustryValues overlap
			const deletedSet = new Set(data.deletedIndustryValues);
			const addedSet = new Set(data.addedIndustryValues);
			const intersection = [...deletedSet].filter((x) => addedSet.has(x));
			return intersection.length === 0;
		},
		{
			message:
				"deletedIndustryValues and addedIndustryValues must not overlap.",
			path: ["deletedIndustryValues", "addedIndustryValues"],
		}
	);

export const bodyParamSchema = { POST: postBodyParams, PATCH: patchBodyParams };
