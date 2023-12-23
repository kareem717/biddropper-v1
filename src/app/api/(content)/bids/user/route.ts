import { db } from "@/db/client";
import { bids, companies, contracts, jobs } from "@/db/schema/tables/content";
import { and, eq,  inArray,  } from "drizzle-orm";
import { parse } from "url";
import {
	bidsRelationships,
	jobsRelationships,
} from "@/db/schema/tables/relations/content";
import { queryParamSchema } from "@/lib/validations/api/bids/user/request";
import { createFilterConditions } from "@/lib/utils";

//TODO: add next-auth to this
export async function GET(req: Request) {
	const { query } = parse(req.url, true);

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
		const conditions = createFilterConditions(params, bids);

		const companyOwnedByUser = db
			.select({ companyId: companies.id })
			.from(companies)
			.where(eq(companies.ownerId, data.id));

		if (data.outgoing) {
			conditions.push(eq(bids.companyId, companyOwnedByUser));
		} else {
			const jobOwnedByUser = db
				.select({ jobId: jobsRelationships.jobId })
				.from(jobsRelationships)
				.where(
					data.includeCompanies
						? inArray(jobsRelationships.companyId, companyOwnedByUser)
						: eq(jobsRelationships.userId, data.id)
				);

			conditions.push(inArray(bidsRelationships.jobId, jobOwnedByUser));
		}

		return conditions;
	};

	try {
		let selectObject: { [key: string]: any } = {
			id: bids.id,
			price: bids.price,
			createdAt: bids.createdAt,
			companyId: bids.companyId,
			isActive: bids.isActive,
			status: bids.status,
		};

		// If bidTarget is not contracts, add job to select object
		if (params.data.bidTarget !== "contracts") {
			selectObject["job"] = { id: jobs.id };
		}

		// If bidTarget is not jobs, add contract to select object
		if (params.data.bidTarget !== "jobs") {
			selectObject["contract"] = { id: contracts.id, title: contracts.title };
		}

		let baseQuery = db
			.select(selectObject)
			.from(bidsRelationships)
			.innerJoin(bids, eq(bids.id, bidsRelationships.bidId))
			.where(and(...filterConditions(params, bids)))
			.limit(params.data.limit + 1)
			.orderBy(bids.id)
			.$dynamic();

		let query;

		if (params.data.bidTarget === "jobs") {
			// If we're only looking for job bids, inner join jobs
			query = baseQuery.innerJoin(jobs, eq(jobs.id, bidsRelationships.jobId));
		} else if (params.data.bidTarget === "contracts") {
			// If we're only looking for contract bids, inner join contracts
			query = baseQuery.innerJoin(
				contracts,
				eq(contracts.id, bidsRelationships.contractId)
			);
		} else {
			// If we're looking for both contract and job bids, left join both
			query = baseQuery
				.leftJoin(jobs, eq(jobs.id, bidsRelationships.jobId))
				.leftJoin(contracts, eq(contracts.id, bidsRelationships.contractId));
		}

		const res = await query;

		// Format response and shorten to requested limit
		const formattedResponse: { [key: string]: any } = {};
		if (res) {
			for (const row of res.slice(0, params.data.limit)) {
				const { id, ...rest } = row;
				formattedResponse[id] = rest;
			}
		}

		return new Response(
			JSON.stringify({
				// If there are more results than the limit, return the last result's ID as the cursor
				cursor:
					res && res.length > params.data.limit
						? res[res.length - 1]?.id
						: null,
				data: {
					...formattedResponse,
				},
			}),
			{ status: 200 }
		);
	} catch (err) {
		console.error(err);
		return new Response(
			JSON.stringify({
				error: "Error fetching data.",
			}),
			{ status: 500 }
		);
	}
}
