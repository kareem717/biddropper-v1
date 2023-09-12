import { db } from "@/db";
import {
	bids,
	companies,
	companyJobs,
	contractJobs,
	contracts,
	jobBids,
	jobs,
} from "@/db/migrations/schema";
import * as z from "zod";
import { insertBidsSchema } from "@/lib/validations/posts";
import { headers } from "next/headers";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { contractBids } from "@/db/migrations/last_working_schema";
import { eq, and, inArray, sql } from "drizzle-orm";

export async function POST(req: Request) {
	const session = await getServerSession(authOptions);

	if (!session || !session.user.ownedCompanies)
		return new Response("Unauthorized", { status: 401 });

	const body = await req.json();
	const bidType = headers().get("Bid-Type");

	const safeParse =
		bidType === "contract"
			? insertBidsSchema
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

export async function PUT(req: Request) {
	const session = await getServerSession(authOptions);

	if (!session || !session.user.ownedCompanies)
		return new Response("Unauthorized", { status: 401 });

	const ownedCompanyIds = session.user.ownedCompanies.map((c) => c.id);

	const body = await req.json();

	const acceptedBidSchema = z.object({
		acceptedBidId: z
			.string()
			.max(50, {
				message: "Bid ID must be at most 50 characters long",
			})
			.regex(/^bid_[A-Za-z0-9\-]+$/, {
				message: "Bid ID must be in the format of bid_[A-Za-z0-9-]+",
			}),
		contractId: z
			.string()
			.max(50, {
				message: "Contract ID must be at most 50 characters long",
			})
			.regex(/^cntr_[A-Za-z0-9\-]+$/, {
				message: "Contract ID must be in the format of cntr_[A-Za-z0-9-]+",
			}),
	});

	const safeParse = acceptedBidSchema.safeParse(body);

	if (!safeParse.success) {
		return new Response(safeParse.error.message, { status: 400 });
	}

	const data = safeParse.data;

	//validate the user owns the contract

	const allContractJobs = await db
		.select({ contracts })
		.from(jobs)
		.innerJoin(contractJobs, eq(contractJobs.jobId, jobs.id))
		.innerJoin(
			contracts,
			and(
				eq(contracts.id, contractJobs.contractId),
				eq(contracts.id, data.contractId)
			)
		)
		.innerJoin(companyJobs, eq(companyJobs.jobId, jobs.id))
		.innerJoin(
			companies,
			and(
				eq(companies.id, companyJobs.companyId),
				inArray(companies.id, ownedCompanyIds)
			)
		)
		.limit(1);

	if (allContractJobs.length === 0) {
		return new Response("Unauthorized", { status: 401 });
	}

	try {
		const query = await db.transaction(async (tx) => {
			// set all the contract's bids to rejected
			await tx.execute(sql`update ${bids}
			inner join ${contractBids}
			on ${contractBids.contractId} = ${data.contractId}
			set ${bids.status} = 'declined'
			where ${bids.id} = ${contractBids.bidId}`);

			// set the accepted bid to accepted
			await tx
				.update(bids)
				.set({
					status: "accepted",
				})
				.where(eq(bids.id, data.acceptedBidId));

			await tx.update(contracts).set({
				isActive: 0,
			});
		});

		return new Response("Bid accepted", { status: 200 });
	} catch (err) {
		return new Response(err, { status: 400 });
	}
}
