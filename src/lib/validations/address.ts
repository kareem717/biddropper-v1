import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { addresses } from "@/db/migrations/schema";
import * as z from "zod";
import type { AddressAutofillRetrieveResponse } from "@mapbox/search-js-core";

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
		})
		.optional(),
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
		})
		.optional(),
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
		})
		.optional(),
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
	xCoordinate: z
		.number()
		.min(-180, {
			message: "X Coordinate must be at least -180",
		})
		.max(180, {
			message: "X Coordinate must be at most 180",
		}),
	yCoordinate: z
		.number()
		.min(-90, {
			message: "Y Coordinate must be at least -90",
		})
		.max(90, {
			message: "Y Coordinate must be at most 90",
		}),
});

export const selectAddressSchema = createSelectSchema(addresses);

export type DBAddress = z.infer<typeof insertAddressSchema>;

export const mapResponseToAddress = (
	res: AddressAutofillRetrieveResponse | undefined
): Omit<DBAddress, "id" | "createdAt" | "updatedAt"> | void => {
	if (!res) return;
	const feature = res.features[0];
	if (!feature) return;
	const coordinates = feature.geometry.coordinates;
	if (!coordinates) return;

	const properties = feature.properties;

	return {
		addressLine1: properties.address_line1,
		addressLine2: properties.address_line2 || undefined, // if address_line2 is not present, set it as undefined
		city: properties.address_level2,
		region: properties.address_level1,
		postalCode: properties.postcode || "",
		country: properties.country || "",
		xCoordinate: feature.geometry.coordinates[0] as number,
		yCoordinate: feature.geometry.coordinates[1] as number,
	};
};
