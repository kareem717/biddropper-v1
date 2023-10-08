import { db } from "@/db";
import { bids, companyJobs, jobBids } from "@/db/migrations/schema";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { contractBids } from "@/db/migrations/last_working_schema";
import { and, eq, inArray, ne } from "drizzle-orm";
import { parse } from "url";
import {
	fetchBidsSchema,
	createBidSchema,
} from "@/lib/validations/api/api-bids";
import { companyContractsView } from "@/db/views/company-contracts";

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
		console.log("/api/bids Error:", validParameters.error);
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
