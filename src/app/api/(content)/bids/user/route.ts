import { db } from "@/server/db/client";
import { bids, jobs } from "@/server/db/schema/tables/content";
import { and, eq, inArray } from "drizzle-orm";
import { parse } from "url";
import {
  bidsRelationships,
  jobsRelationships,
} from "@/server/db/schema/tables/relations/content";
import { queryParamSchema } from "@/lib/validations/api/(content)/bids/user/request";
import { createFilterConditions } from "@/lib/utils";
import { authOptions } from "@/server/auth";
import { getServerSession } from "next-auth/next";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response(
      JSON.stringify({
        error: "Unauthorized",
      }),
      { status: 401 },
    );
  }

  const { query } = parse(req.url, true);

  const params = queryParamSchema.GET.safeParse(query);

  if (!params.success) {
    return new Response(
      JSON.stringify({ error: params.error.issues[0]?.message }),
      { status: 400 },
    );
  }

  const { data } = params;

  console.log(data);

  if (data.id !== session.user.id) {
    return new Response(
      JSON.stringify({
        error: "Unauthorized",
      }),
      { status: 401 },
    );
  }

  // Create query conditions based on filters from the query params
  const filterConditions = (params: any, bids: any) => {
    const conditions = createFilterConditions(params, bids);

    const jobOwnedByUser = db
      .select({ jobId: jobsRelationships.jobId })
      .from(jobsRelationships)
      .where(eq(jobsRelationships.userId, data.id));

    conditions.push(inArray(bidsRelationships.jobId, jobOwnedByUser));

    return conditions;
  };

  try {
    const res = await db
      .select({
        id: bids.id,
        price: bids.price,
        createdAt: bids.createdAt,
        companyId: bids.companyId,
        isActive: bids.isActive,
        status: bids.status,
        note: bids.note,
        job: {
          id: jobs.id,
          title: jobs.title,
        },
      })
      .from(bidsRelationships)
      .innerJoin(bids, eq(bids.id, bidsRelationships.bidId))
      .where(and(...filterConditions(params, bids)))
      .limit(params.data.limit + 1)
      .orderBy(bids.id)
      .innerJoin(jobs, eq(jobs.id, bidsRelationships.jobId));

    return new Response(
      JSON.stringify({
        // If there are more results than the limit, return the last result's ID as the cursor
        cursor:
          res && res.length > params.data.limit
            ? res[res.length - 1]?.id
            : null,
        data: res.slice(0, params.data.limit),
      }),
      { status: 200 },
    );
  } catch (err) {
    console.log(err);
    return new Response(
      JSON.stringify({
        error: "Error fetching data.",
      }),
      { status: 500 },
    );
  }
}
