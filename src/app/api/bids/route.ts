import { db } from "@/db";
import {
	bids,
	jobBids,
} from "@/db/migrations/schema";
import * as z from "zod";
import { insertBidsSchema } from "@/lib/validations/posts";
import { headers } from "next/headers";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { contractBids } from "@/db/migrations/last_working_schema";

export async function POST(req: Request) {
	const session = await getServerSession(authOptions);

	if (!session || !session.user.ownedCompanies)
		return new Response("Unauthorized", { status: 401 });

	const body = await req.json();
	const bidType = headers().get("Bid-Type");

	const safeParse =
		bidType === "contract"
			? insertBidsSchema
					.omit({ id: true })
					.extend({
						companyId: z
							.string()
							.max(50, {
								message: "Company ID must be at most 50 characters long",
							})
							.regex(/^comp_[A-Za-z0-9\-]+$/, {
								message:
									"Company ID must be in the format of comp_[A-Za-z0-9-]+",
							}),
						contractId: z
							.string()
							.max(50, {
								message: "Contract ID must be at most 50 characters long",
							})
							.regex(/^cntr_[A-Za-z0-9\-]+$/, {
								message:
									"Contract ID must be in the format of cntr_[A-Za-z0-9-]+",
							}),
					})
					.safeParse(body)
			: insertBidsSchema
					.omit({ id: true })
					.extend({
						companyId: z
							.string()
							.max(50, {
								message: "Company ID must be at most 50 characters long",
							})
							.regex(/^comp_[A-Za-z0-9\-]+$/, {
								message:
									"Company ID must be in the format of comp_[A-Za-z0-9-]+",
							}),

						jobId: z
							.string()
							.max(50, {
								message: "Job ID must be at most 50 characters long",
							})
							.regex(/^job_[A-Za-z0-9\-]+$/, {
								message: "Job ID must be in the format of job_[A-Za-z0-9-]+",
							}),
					})
					.safeParse(body);

	if (!safeParse.success) {
		return new Response(safeParse.error.message, { status: 400 });
	}

	const data = safeParse.data;

	const newId = `bid_${crypto.randomUUID()}`;
	// TODO: price should not be optional
	const query = await db.transaction(async (tx) => {
		await tx.insert(bids).values({
			id: newId,
			price: data.price,
			companyId: data.companyId,
		});

		if (bidType === "contract") {
			await tx.insert(contractBids).values({
				bidId: newId,
				// @ts-ignore
				contractId: data.contractId,
			});
		}

		if (bidType === "job") {
			await tx.insert(jobBids).values({
				bidId: newId,
				// @ts-ignore
				jobId: data.jobId,
			});
		}
	});

	return new Response("Bid created", { status: 201 });
}