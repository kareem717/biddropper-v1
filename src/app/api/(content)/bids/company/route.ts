import { db } from "@/server/db/client";
import { bids, contracts, jobs } from "@/server/db/schema/tables/content";
import { and, eq, inArray, or } from "drizzle-orm";
import { parse } from "url";
import {
  bidsRelationships,
  jobsRelationships,
} from "@/server/db/schema/tables/relations/content";
import { queryParamSchema } from "@/lib/validations/api/(content)/bids/company/request";
import { createFilterConditions } from "@/lib/utils";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user.ownedCompanies) {
    return new Response(
      JSON.stringify({
        error: "Unauthorized",
      }),
      { status: 401 },
    );
  }

  const ownedCompanyIds = session.user.ownedCompanies.map(
    (company) => company.id,
  );

  const { query } = parse(req.url, true);

  const params = queryParamSchema.GET.safeParse(query);

  if (!params.success) {
    return new Response(
      JSON.stringify({ error: params.error.issues[0]?.message }),
      { status: 400 },
    );
  }

  const { data } = params;

  if (!ownedCompanyIds.includes(data.id)) {
    return new Response(
      JSON.stringify({
        error: "Unauthorized to see bids for this company.",
      }),
      { status: 401 },
    );
  }

  // Create query conditions based on filters from the query params
  const filterConditions = (params: any, bids: any) => {
    const conditions = createFilterConditions(params, bids);

    if (data.outgoing) {
      conditions.push(eq(bids.companyId, data.id));
    } else {
      // All jobs and contracts ownded by the company
      const jobsOwnedByCompany = db
        .select({ jobId: jobsRelationships.jobId })
        .from(jobsRelationships)
        .where(eq(jobsRelationships.companyId, data.id));

      const contractsOwnedByCompany = db
        .select({ contractId: contracts.id })
        .from(contracts)
        .where(eq(contracts.companyId, data.id));

      conditions.push(
        //@ts-ignore
        or(
          inArray(bidsRelationships.jobId, jobsOwnedByCompany),
          inArray(bidsRelationships.contractId, contractsOwnedByCompany),
        ),
      );
    }

    return conditions;
  };

  try {
    let selectObject: { [key: string]: any } = {
      id: bids.id,
      price: bids.price,
      createdAt: bids.createdAt,
      note: bids.note,
      companyId: bids.companyId,
      isActive: bids.isActive,
      status: bids.status,
    };

    // If bidTarget is not contracts, add job to select object
    if (params.data.bidTarget !== "contracts") {
      selectObject["job"] = { id: jobs.id, title: jobs.title };
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
        eq(contracts.id, bidsRelationships.contractId),
      );
    } else {
      // If we're looking for both contract and job bids, left join both
      query = baseQuery
        .leftJoin(jobs, eq(jobs.id, bidsRelationships.jobId))
        .leftJoin(contracts, eq(contracts.id, bidsRelationships.contractId));
    }

    const res = await query;

    return new Response(
      JSON.stringify({
        // If there are more results than the limit, return the last result's ID as the cursor
        cursor:
          res && res.length > params.data.limit
            ? res[res.length - 1]?.id
            : null,
        data: res,
      }),
      { status: 200 },
    );
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({
        error: "Error fetching data.",
      }),
      { status: 500 },
    );
  }
}
