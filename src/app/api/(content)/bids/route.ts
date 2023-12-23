import { db } from "@/db/client";
import { bids } from "@/db/schema/tables/content";
import { and, eq } from "drizzle-orm";
import { parse } from "url";
import { avg, max, min, sql } from "drizzle-orm";
import { bidsRelationships } from "@/db/schema/tables/relations/content";
import { createFilterConditions } from "@/lib/utils";

import { queryParamSchema } from "@/lib/validations/api/bids/request";
// import {
// 	createBidSchema,
// 	updateBidSchema,
// 	acceptBidQuerySchema,
// 	deleteBidQuerySchema,
// } from "@/lib/validations/api/api-bid";

export async function GET(req: Request) {
	const { query } = parse(req.url, true);

	// Input validation
	const params = queryParamSchema.GET.safeParse(query);

	if (!params.success) {
		return new Response(
			JSON.stringify({ error: params.error.issues[0]?.message }),
			{ status: 400 }
		);
	}

	// Create query conditions based on filters from the query params
	const filterConditions = (params: any, bids: any) => {
		const { data } = params;

		// Differentiate between job and contract bids
		const idCondition: any = data.jobId
			? eq(bidsRelationships.jobId, data.jobId as string)
			: eq(bidsRelationships.contractId, data.contractId as string);

		const conditions = createFilterConditions(params, bids);

		conditions.push(idCondition);

		return conditions;
	};

	let stats, dailyAverages;

	try {
		stats = db
			.select({
				medianPrice: sql<number>`percentile_cont(0.5) within group (order by ${bids.price})`,
				averagePrice: sql<number>`${avg(bids.price)}`,
				count: sql`count(*)`.as("count"),
				maxPrice: sql<number>`${max(bids.price)}`,
				minPrice: sql<number>`${min(bids.price)}`,
			})
			.from(bidsRelationships)
			.innerJoin(bids, eq(bids.id, bidsRelationships.bidId))
			.where(and(...filterConditions(params, bids)));

		stats = await db.execute(stats);
	} catch (err) {
		console.error("Error fetching stats:", err);
		return new Response(
			JSON.stringify({ error: "Error fetching statistics." }),
			{ status: 500 }
		);
	}

	try {
		dailyAverages = await db
			.select({
				day: sql`DATE(${bids.createdAt})`,
				averagePrice: sql<number>`avg(${bids.price})`,
			})
			.from(bids)
			.innerJoin(bidsRelationships, eq(bids.id, bidsRelationships.bidId))
			.where(and(...filterConditions(params, bids)))
			.orderBy(sql`DATE(${bids.createdAt})`)
			.groupBy(sql`DATE(${bids.createdAt})`)
			.limit(30);
	} catch (err) {
		console.error("Error fetching daily averages:", err);
		return new Response(
			JSON.stringify({ error: "Error fetching daily averages." }),
			{ status: 500 }
		);
	}

	return new Response(
		JSON.stringify({
			stats,
			dailyAverages,
		}),
		{ status: 200 }
	);
}
// export async function POST(req: Request) {
// 	const session = await getServerSession(authOptions);

// 	if (!session || !session.user.ownedCompanies)
// 		return new Response("Unauthorized", { status: 401 });

// 	const ownedCompanyIds = session.user.ownedCompanies.map(
// 		(company) => company.id
// 	);

// 	const body = await req.json();
// 	let safeParseResult = createBidSchema.safeParse(body);

// 	if (!safeParseResult.success) {
// 		return new Response(safeParseResult.error.message, { status: 400 });
// 	}

// 	const data = safeParseResult.data;
// 	const newId = `bid_${crypto.randomUUID()}`;

// 	let targetTable: any, targetId: string;

// 	if (data.jobId) {
// 		targetTable = companyJobs;
// 		targetId = data.jobId;
// 	} else if (data.contractId) {
// 		targetTable = companyContractsView;
// 		targetId = data.contractId;
// 	} else {
// 		return new Response("Neither 'jobId' nor 'contractId' provided", {
// 			status: 400,
// 		});
// 	}

// 	let userOwnsPostingQuery = db
// 		.select()
// 		.from(targetTable)
// 		.where(
// 			and(
// 				eq(
// 					targetTable === companyJobs
// 						? targetTable.jobId
// 						: targetTable.contractId,
// 					targetId
// 				),
// 				inArray(targetTable.companyId, ownedCompanyIds)
// 			)
// 		)
// 		.limit(1);

// 	let userOwnsPosting = await userOwnsPostingQuery;

// 	if (userOwnsPosting.length > 0) {
// 		return new Response("User cannot bid on their own job or contract.", {
// 			status: 400,
// 		});
// 	}

// 	try {
// 		await db.transaction(async (tx) => {
// 			await tx.insert(bids).values({
// 				id: newId,
// 				price: data.price,
// 				companyId: data.companyId,
// 			});

// 			let bidInsertionTable = data.jobId ? jobBids : contractBids;
// 			let bidInsertionData = {
// 				bidId: newId,
// 				[data.jobId ? "jobId" : "contractId"]: targetId,
// 			};

// 			await tx.insert(bidInsertionTable).values(bidInsertionData);
// 		});

// 		return new Response("Bid created.", { status: 201 });
// 	} catch (err) {
// 		console.log("POST /api/bids Error:", err);
// 		return new Response("Error creating bid.", { status: 500 });
// 	}
// }
// export async function PATCH(req: Request) {
// 	const { query } = parse(req.url, true);

// 	const session = await getServerSession(authOptions);

// 	if (!session || !session.user.ownedCompanies)
// 		return new Response("Unauthorized", { status: 401 });

// 	let reqBody = await req.json();

// 	const attemptBodyParse = updateBidSchema.safeParse({
// 		...reqBody,
// 		id: query.bidId,
// 	});

// 	if (!attemptBodyParse.success) {
// 		console.log("PATCH /api/bids/ Error:", attemptBodyParse.error);
// 		return new Response("Error parsing request body.", { status: 400 });
// 	}

// 	reqBody = attemptBodyParse.data;

// 	if (Object.keys(reqBody).length === 1) {
// 		return new Response("No fields to update.", { status: 400 });
// 	}

// 	try {
// 		const bidExists = await db
// 			.select()
// 			.from(bids)
// 			.where(eq(bids.id, reqBody.id))
// 			.limit(1);

// 		if (!bidExists.length)
// 			return new Response("Bid does not exist.", { status: 404 });

// 		await db.update(bids).set(reqBody).where(eq(bids.id, reqBody.id));
// 	} catch (err) {
// 		console.log("PATCH /api/bids/ Error:", err);
// 		return new Response("Error updating bid.", { status: 500 });
// 	}

// 	return new Response("Updated Bid.", { status: 200 });
// }

// export async function PUT(req: Request) {
// 	const session = await getServerSession(authOptions);

// 	if (!session || !session.user.ownedCompanies)
// 		return new Response("Unauthorized", { status: 401 });

// 	const { query } = parse(req.url, true);
// 	const acceptBid = query.acceptBid === "true";

// 	// Make sure the user wants to accept the bid
// 	if (!acceptBid) {
// 		return new Response("Bid was not accepted", { status: 400 });
// 	}

// 	const ownedCompanyIds = session.user.ownedCompanies.map(
// 		(company) => company.id
// 	);

// 	const attemptBodyParse = acceptBidQuerySchema.safeParse({
// 		bidId: query.bidId,
// 		contractId: query.contractId,
// 		jobId: query.jobId,
// 	});

// 	if (!attemptBodyParse.success) {
// 		console.log("PUT /api/bids/ Error:", attemptBodyParse.error);
// 		return new Response("Error parsing request body.", { status: 400 });
// 	}

// 	const reqBody = attemptBodyParse.data;

// 	try {
// 		const allContractJobs = await db
// 			.select()
// 			.from(companyContractsView)
// 			.where(inArray(companyContractsView.companyId, ownedCompanyIds))
// 			.limit(1);

// 		if (allContractJobs.length === 0) {
// 			return new Response("Unauthorized", { status: 401 });
// 		}
// 	} catch (err) {
// 		console.log("PUT /api/bids/ Error:", err);
// 		return new Response("Error fetching contract jobs.", { status: 500 });
// 	}

// 	try {
// 		//TODO: is there a way to get arpund this without using type any?
// 		let targetTable: any, targetId: string;

// 		if (reqBody.jobId && !reqBody.contractId) {
// 			targetTable = jobBids;
// 			targetId = reqBody.jobId;
// 		} else if (!reqBody.jobId && reqBody.contractId) {
// 			targetTable = contractBids;
// 			targetId = reqBody.contractId;
// 		} else {
// 			return new Response(
// 				"Either both 'jobId' and 'contractId' were provided or neither were provided.",
// 				{ status: 400 }
// 			);
// 		}

// 		await db.transaction(async (tx) => {
// 			await tx
// 				.update(bids)
// 				.set({ status: "accepted" })
// 				.where(eq(bids.id, reqBody.bidId));

// 			// Set all the target's bids to rejected
// 			let rejectBidsQuery = db
// 				.update(bids)
// 				.set({ status: "declined" })
// 				.where(
// 					and(
// 						ne(bids.id, targetId),
// 						exists(
// 							db
// 								.select()
// 								.from(targetTable)
// 								.where(eq(targetTable.bidId, bids.id))
// 						)
// 					)
// 				);
// 			await tx.execute(rejectBidsQuery);

// 			// Set target to inactive
// 			let deactivateTargetQuery = db
// 				.update(targetTable === jobBids ? jobs : contracts)
// 				.set({ isActive: 0 })
// 				.where(eq(targetTable === jobBids ? jobs.id : contracts.id, targetId));
// 			await tx.execute(deactivateTargetQuery);
// 		});
// 	} catch (err) {
// 		console.log("PUT /api/bid/[bidId] Error:", err);
// 		return new Response("An error occured while accepting the bid", {
// 			status: 500,
// 		});
// 	}

// 	return new Response("If the bid exists, it was accepted", { status: 200 });
// }

// export async function DELETE(req: Request) {
// 	const session = await getServerSession(authOptions);

// 	if (!session || !session.user.ownedCompanies)
// 		return new Response("Unauthorized", { status: 401 });

// 	const { query } = parse(req.url, true);
// 	const validQuery = deleteBidQuerySchema.safeParse(query);

// 	if (!validQuery.success) {
// 		console.log("DELETE /api/bids/ Error:", validQuery.error);
// 		return new Response("Invalid query parameters.", { status: 400 });
// 	}

// 	const bidId = validQuery.data.bidId;

// 	// Check if the user owns the company that owns the bids
// 	try {
// 		const userOwnsBid = await db
// 			.select()
// 			.from(bids)
// 			.where(
// 				and(
// 					inArray(
// 						bids.companyId,
// 						session.user.ownedCompanies.map((company) => company.id)
// 					),
// 					eq(bids.id, bidId)
// 				)
// 			)
// 			.limit(1);

// 		if (!userOwnsBid.length) {
// 			return new Response("Unauthorized", { status: 401 });
// 		}
// 	} catch (err) {
// 		console.log("DELETE /api/bids/ Error:", err);
// 		return new Response("An error occurred while checking bid ownership.", {
// 			status: 500,
// 		});
// 	}

// 	try {
// 		const bidExists = await db
// 			.select()
// 			.from(bids)
// 			.where(eq(bids.id, bidId))
// 			.limit(1);

// 		if (!bidExists.length)
// 			return new Response("Bid does not exist.", { status: 404 });

// 		await db.update(bids).set({ isActive: 0 }).where(eq(bids.id, bidId));
// 	} catch (err) {
// 		console.log("DELETE /api/bids/ Error:", err);
// 		return new Response("Error deleting bid.", { status: 500 });
// 	}

// 	return new Response("Deleted Bid.", { status: 200 });
// }
