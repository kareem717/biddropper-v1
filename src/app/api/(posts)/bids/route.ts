import { db } from "@/db/client";
import {
	bids,
	companyJobs,
	contracts,
	jobBids,
	jobs,
} from "@/db/migrations/schema";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { contractBids } from "@/db/migrations/last_working_schema";
import { and, eq, exists, inArray, ne } from "drizzle-orm";
import { parse } from "url";
import {
	fetchBidsSchema,
	createBidSchema,
	updateBidSchema,
	acceptBidQuerySchema,
	deleteBidQuerySchema,
} from "@/lib/validations/api/api-bid";
import companyContractsView from "@/db/views/company-contracts";

//TODO: maybe re-write this and the dynamic route into a single endpoint
export async function POST(req: Request) {
	const session = await getServerSession(authOptions);

	if (!session || !session.user.ownedCompanies)
		return new Response("Unauthorized", { status: 401 });

	const ownedCompanyIds = session.user.ownedCompanies.map(
		(company) => company.id
	);

	const body = await req.json();
	let safeParseResult = createBidSchema.safeParse(body);

	if (!safeParseResult.success) {
		return new Response(safeParseResult.error.message, { status: 400 });
	}

	const data = safeParseResult.data;
	const newId = `bid_${crypto.randomUUID()}`;

	let targetTable: any, targetId: string;

	if (data.jobId) {
		targetTable = companyJobs;
		targetId = data.jobId;
	} else if (data.contractId) {
		targetTable = companyContractsView;
		targetId = data.contractId;
	} else {
		return new Response("Neither 'jobId' nor 'contractId' provided", {
			status: 400,
		});
	}

	let userOwnsPostingQuery = db
		.select()
		.from(targetTable)
		.where(
			and(
				eq(
					targetTable === companyJobs
						? targetTable.jobId
						: targetTable.contractId,
					targetId
				),
				inArray(targetTable.companyId, ownedCompanyIds)
			)
		)
		.limit(1);

	let userOwnsPosting = await userOwnsPostingQuery;

	if (userOwnsPosting.length > 0) {
		return new Response("User cannot bid on their own job or contract.", {
			status: 400,
		});
	}

	try {
		await db.transaction(async (tx) => {
			await tx.insert(bids).values({
				id: newId,
				price: data.price,
				companyId: data.companyId,
			});

			let bidInsertionTable = data.jobId ? jobBids : contractBids;
			let bidInsertionData = {
				bidId: newId,
				[data.jobId ? "jobId" : "contractId"]: targetId,
			};

			await tx.insert(bidInsertionTable).values(bidInsertionData);
		});

		return new Response("Bid created.", { status: 201 });
	} catch (err) {
		console.log("POST /api/bids Error:", err);
		return new Response("Error creating bid.", { status: 500 });
	}
}

export async function GET(req: Request) {
	const { query } = parse(req.url, true);
	const validParameters = fetchBidsSchema.safeParse(query);

	if (!validParameters.success) {
		console.log("GET /api/bids Error:", validParameters.error);
		return new Response("Invalid query parameters.", { status: 400 });
	}

	let queryBuilder;

	if (query.bidType === "job") {
		queryBuilder = db
			.select({
				id: bids.id,
				price: bids.price,
				status: bids.status,
				companyId: bids.companyId,
				createdAt: bids.createdAt,
				updatedAt: bids.updatedAt,
			})
			.from(bids)
			.innerJoin(jobBids, eq(jobBids.bidId, bids.id));
	} else if (query.bidType === "contract") {
		queryBuilder = db
			.select({
				id: bids.id,
				price: bids.price,
				status: bids.status,
				companyId: bids.companyId,
				createdAt: bids.createdAt,
				updatedAt: bids.updatedAt,
			})
			.from(bids)
			.innerJoin(contractBids, eq(contractBids.bidId, bids.id));
	} else {
		queryBuilder = db.select().from(bids);
	}

	if (!validParameters.data.getInactive) {
		queryBuilder = queryBuilder.where(ne(bids.status, "pending"));
	}

	if (validParameters.data.companyId) {
		queryBuilder = queryBuilder.where(
			eq(bids.companyId, validParameters.data.companyId)
		);
	}

	if (validParameters.data.contractId) {
		queryBuilder = queryBuilder.innerJoin(
			contractBids,
			eq(contractBids.contractId, validParameters.data.contractId)
		);
	}

	if (validParameters.data.jobId) {
		queryBuilder = queryBuilder.innerJoin(
			jobBids,
			eq(jobBids.jobId, validParameters.data.jobId)
		);
	}

	if (validParameters.data.bidId) {
		queryBuilder = queryBuilder.where(eq(bids.id, validParameters.data.bidId));
	}

	try {
		const queryResult = await queryBuilder.limit(validParameters.data.limit);

		if (!queryResult.length)
			return new Response("No bids found.", { status: 404 });

		return new Response(JSON.stringify(queryResult), { status: 200 });
	} catch (err) {
		console.log("GET /api/bids Error:", err);
		return new Response("Error getting bids.", { status: 500 });
	}
}

export async function PATCH(req: Request) {
	const { query } = parse(req.url, true);

	const session = await getServerSession(authOptions);

	if (!session || !session.user.ownedCompanies)
		return new Response("Unauthorized", { status: 401 });

	let reqBody = await req.json();

	const attemptBodyParse = updateBidSchema.safeParse({
		...reqBody,
		id: query.bidId,
	});

	if (!attemptBodyParse.success) {
		console.log("PATCH /api/bids/ Error:", attemptBodyParse.error);
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
			.where(eq(bids.id, reqBody.id))
			.limit(1);

		if (!bidExists.length)
			return new Response("Bid does not exist.", { status: 404 });

		await db.update(bids).set(reqBody).where(eq(bids.id, reqBody.id));
	} catch (err) {
		console.log("PATCH /api/bids/ Error:", err);
		return new Response("Error updating bid.", { status: 500 });
	}

	return new Response("Updated Bid.", { status: 200 });
}

export async function PUT(req: Request) {
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
		bidId: query.bidId,
		contractId: query.contractId,
		jobId: query.jobId,
	});

	if (!attemptBodyParse.success) {
		console.log("PUT /api/bids/ Error:", attemptBodyParse.error);
		return new Response("Error parsing request body.", { status: 400 });
	}

	const reqBody = attemptBodyParse.data;

	try {
		const allContractJobs = await db
			.select()
			.from(companyContractsView)
			.where(inArray(companyContractsView.companyId, ownedCompanyIds))
			.limit(1);

		if (allContractJobs.length === 0) {
			return new Response("Unauthorized", { status: 401 });
		}
	} catch (err) {
		console.log("PUT /api/bids/ Error:", err);
		return new Response("Error fetching contract jobs.", { status: 500 });
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

export async function DELETE(req: Request) {
	const session = await getServerSession(authOptions);

	if (!session || !session.user.ownedCompanies)
		return new Response("Unauthorized", { status: 401 });

	const { query } = parse(req.url, true);
	const validQuery = deleteBidQuerySchema.safeParse(query);

	if (!validQuery.success) {
		console.log("DELETE /api/bids/ Error:", validQuery.error);
		return new Response("Invalid query parameters.", { status: 400 });
	}

	const bidId = validQuery.data.bidId;

	// Check if the user owns the company that owns the bids
	try {
		const userOwnsBid = await db
			.select()
			.from(bids)
			.where(
				and(
					inArray(
						bids.companyId,
						session.user.ownedCompanies.map((company) => company.id)
					),
					eq(bids.id, bidId)
				)
			)
			.limit(1);

		if (!userOwnsBid.length) {
			return new Response("Unauthorized", { status: 401 });
		}
	} catch (err) {
		console.log("DELETE /api/bids/ Error:", err);
		return new Response("An error occurred while checking bid ownership.", {
			status: 500,
		});
	}

	try {
		const bidExists = await db
			.select()
			.from(bids)
			.where(eq(bids.id, bidId))
			.limit(1);

		if (!bidExists.length)
			return new Response("Bid does not exist.", { status: 404 });

		await db.update(bids).set({ isActive: 0 }).where(eq(bids.id, bidId));
	} catch (err) {
		console.log("DELETE /api/bids/ Error:", err);
		return new Response("Error deleting bid.", { status: 500 });
	}

	return new Response("Deleted Bid.", { status: 200 });
}
