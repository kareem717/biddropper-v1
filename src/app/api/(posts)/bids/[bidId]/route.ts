import { db } from "@/db";
import { bids, jobBids, jobs } from "@/db/migrations/schema";
import { authOptions } from "@/lib/auth";
import {
	acceptBidQuerySchema,
	updateBidSchema,
} from "@/lib/validations/api/api-bid";
import { and, eq, exists, ne } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { contracts } from "@/db/migrations/schema";
import { contractBids } from "@/db/migrations/last_working_schema";
import { inArray } from "drizzle-orm";
import { parse } from "url";
import companyContractsView from "@/db/views/company-contracts";

export async function GET(
	_req: Request,
	{ params }: { params: { bidId: string } }
) {
	const session = await getServerSession(authOptions);

	if (!session) return new Response("Unauthorized", { status: 401 });

	try {
		const queryResult = await db
			.select()
			.from(bids)
			.where(eq(bids.id, params.bidId))
			.limit(1);

		if (!queryResult.length)
			return new Response("Bid does not exist.", { status: 404 });

		return new Response(JSON.stringify(queryResult[0]), { status: 200 });
	} catch (err) {
		console.log("GET /api/bids/[bidId] Error:", err);
		return new Response("Error getting bid.", { status: 500 });
	}
}

export async function PATCH(
	req: Request,
	{ params }: { params: { bidId: string } }
) {
	const session = await getServerSession(authOptions);

	if (!session || !session.user.ownedCompanies)
		return new Response("Unauthorized", { status: 401 });

	let reqBody = await req.json();

	const attemptBodyParse = updateBidSchema.safeParse({
		...reqBody,
		id: params.bidId,
	});

	if (!attemptBodyParse.success) {
		console.log("PATCH /api/bids/[bidId] Error:", attemptBodyParse.error);
		return new Response("Error parsing request body.", { status: 400 });
	}

	reqBody = attemptBodyParse.data;

	if (Object.keys(reqBody).length === 1) {
		return new Response("No fields to update.", { status: 400 });
	}

	try {
		const bidExists = await db
			.select()
			.from(bids)
			.where(eq(bids.id, params.bidId))
			.limit(1);

		if (!bidExists.length)
			return new Response("Bid does not exist.", { status: 404 });

		await db.update(bids).set(reqBody).where(eq(bids.id, params.bidId));
	} catch (err) {
		console.log("PATCH /api/bids/[bidId] Error:", err);
		return new Response("Error updating bid.", { status: 500 });
	}

	return new Response("Updated Bid.", { status: 200 });
}

export async function PUT(
	req: Request,
	{ params }: { params: { bidId: string } }
) {
	const session = await getServerSession(authOptions);

	if (!session || !session.user.ownedCompanies)
		return new Response("Unauthorized", { status: 401 });

	const { query } = parse(req.url, true);
	const acceptBid = query.acceptBid === "true";

	// Make sure the user wants to accept the bid
	if (!acceptBid) {
		return new Response("Bid was not accepted", { status: 400 });
	}

	const ownedCompanyIds = session.user.ownedCompanies.map(
		(company) => company.id
	);

	const attemptBodyParse = acceptBidQuerySchema.safeParse({
		bidId: params.bidId,
		contractId: query.contractId,
		jobId: query.jobId,
	});

	if (!attemptBodyParse.success) {
		console.log("PUT /api/bids/[bidId] Error:", attemptBodyParse.error);
		return new Response("Error parsing request body.", { status: 400 });
	}

	const reqBody = attemptBodyParse.data;

	const allContractJobs = await db
		.select()
		.from(companyContractsView)
		.where(inArray(companyContractsView.companyId, ownedCompanyIds))
		.limit(1);

	if (allContractJobs.length === 0) {
		return new Response("Unauthorized", { status: 401 });
	}

	try {
		//TODO: is there a way to get arpund this without using type any?
		let targetTable: any, targetId: string;

		if (reqBody.jobId && !reqBody.contractId) {
			targetTable = jobBids;
			targetId = reqBody.jobId;
		} else if (!reqBody.jobId && reqBody.contractId) {
			targetTable = contractBids;
			targetId = reqBody.contractId;
		} else {
			return new Response(
				"Either both 'jobId' and 'contractId' were provided or neither were provided.",
				{ status: 400 }
			);
		}

		await db.transaction(async (tx) => {
			await tx
				.update(bids)
				.set({ status: "accepted" })
				.where(eq(bids.id, reqBody.bidId));

			// Set all the target's bids to rejected
			let rejectBidsQuery = db
				.update(bids)
				.set({ status: "declined" })
				.where(
					and(
						ne(bids.id, targetId),
						exists(
							db
								.select()
								.from(targetTable)
								.where(eq(targetTable.bidId, bids.id))
						)
					)
				);
			await tx.execute(rejectBidsQuery);

			// Set target to inactive
			let deactivateTargetQuery = db
				.update(targetTable === jobBids ? jobs : contracts)
				.set({ isActive: 0 })
				.where(eq(targetTable === jobBids ? jobs.id : contracts.id, targetId));
			await tx.execute(deactivateTargetQuery);
		});
	} catch (err) {
		console.log("PUT /api/bid/[bidId] Error:", err);
		return new Response("An error occured while accepting the bid", {
			status: 500,
		});
	}

	return new Response("If the bid exists, it was accepted", { status: 200 });
}
