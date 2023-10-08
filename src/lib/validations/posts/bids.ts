import { createInsertSchema } from "drizzle-zod";
import { bids } from "@/db/migrations/schema";
import { insertCompanySchema } from "../companies";
import * as z from "zod";

export const insertBidsSchema = createInsertSchema(bids, {
	id: z
		.string()
		.max(50, {
			message: "Bid ID must be at most 50 characters long",
		})
		.regex(/^bid_[A-Za-z0-9\-]+$/, {
			message: "Bid ID must be in the format of bid_[A-Za-z0-9-]+",
		}),
	status: z
		.string()
		.optional()
		.default("pending")
		.refine(
			(value) =>
				["pending", "accepted", "rejected", "retracted"].includes(value),
			{
				message: "Status must be either pending, accepted, or rejected",
			}
		),
	price: z
		.number()
		.positive({
			message: "Price must be greater than 0",
		})
		.max(30000000.0, {
			message: "Price must be less than 30,000,000.00",
		})
		.multipleOf(0.01, {
			message: "Price must be rounded to the nearest cent",
		})
		.transform((value) => value.toFixed(2)),
	companyId: insertCompanySchema.shape.id,
});
