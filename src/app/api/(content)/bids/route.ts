import { db } from "@/db/client";
import { bids, contracts, jobs } from "@/db/schema/tables/content";
import { and, eq, inArray, isNotNull } from "drizzle-orm";
import { parse } from "url";
import { avg, max, min, sql } from "drizzle-orm";
import {
  bidsRelationships,
  jobsRelationships,
} from "@/db/schema/tables/relations/content";
import { createFilterConditions } from "@/lib/utils";
import { queryParamSchema } from "@/lib/validations/api/(content)/bids/request";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { CustomError } from "@/lib/utils";
import { unionAll } from "drizzle-orm/pg-core";
import { v4 as uuidv4 } from "uuid";

export async function GET(req: Request) {
  const { query } = parse(req.url, true);

  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response(
      JSON.stringify({
        error: "Unauthorized",
      }),
      { status: 401 },
    );
  }

  // Input validation
  const params = queryParamSchema.GET.safeParse(query);

  if (!params.success) {
    return new Response(
      JSON.stringify({ error: params.error.issues[0]?.message }),
      { status: 400 },
    );
  }

  const { data } = params;

  // Differentiate between job and contract bids
  const idCondition: any = data.jobId
    ? eq(bidsRelationships.jobId, data.jobId as string)
    : eq(bidsRelationships.contractId, data.contractId as string);

  // Make sure user either owns a company or owns the job or contract
  if (!session.user.ownedCompanies) {
    if (data.contractId) {
      return new Response(
        JSON.stringify({
          error:
            "User is not authorized to view the bid data for this contract.",
        }),
        { status: 401 },
      );
    } else if (!data.jobId) {
      return new Response(
        JSON.stringify({
          error: "Job ID is not provided.",
        }),
        { status: 400 },
      );
    }

    try {
      const [job] = await db
        .select({
          userId: jobsRelationships.userId,
        })
        .from(jobs)
        .innerJoin(jobsRelationships, eq(jobs.id, jobsRelationships.jobId))
        .where(eq(jobs.id, data.jobId))
        .limit(1);

      if (!job) {
        return new Response(
          JSON.stringify({
            error: "User is not authorized to view the bid data for this job.",
          }),
          { status: 401 },
        );
      }
    } catch (err) {
      return new Response(
        JSON.stringify({
          error: "Error finding job.",
        }),
        { status: 404 },
      );
    }
  }

  // Create query conditions based on filters from the query params
  const filterConditions = (params: any, bids: any) => {
    const conditions = createFilterConditions(params, bids);

    conditions.push(idCondition);

    return conditions;
  };

  let stats, dailyAverages;

  try {
    stats = db
      .select({
        medianPrice:
          sql<number>`percentile_cont(0.5) within group (order by ${bids.price})`.as(
            "medianPrice",
          ),
        averagePrice: sql<number>`${avg(bids.price)}`.as("averagePrice"),
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
      { status: 500 },
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
    return new Response(
      JSON.stringify({ error: "Error fetching daily averages." }),
      { status: 500 },
    );
  }

  return new Response(
    JSON.stringify({
      stats,
      dailyAverages,
    }),
    { status: 200 },
  );
}

export async function POST(req: Request) {
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

  let params = queryParamSchema.POST.safeParse(query);

  if (!params.success) {
    return new Response(
      JSON.stringify({ error: params.error.issues[0]?.message }),
      { status: 400 },
    );
  }

  const { data } = params;
  const newId = uuidv4();
  const targetCondition: any = data.jobId
    ? eq(jobsRelationships.jobId, data.jobId)
    : eq(jobsRelationships.contractId, data.contractId!);

  try {
    await db.transaction(async (tx) => {
      let id = data.jobId ? data.jobId : data.contractId;
      if (!id) {
        throw new CustomError("Identifier must be defined", 400);
      }

      // Make sure the job or contract exists, is active and the user has not already bid on it with the same company
      const targetExists = await tx
        .select()
        .from(data.jobId ? jobs : contracts)
        .where(
          and(
            eq(data.jobId ? jobs.id : contracts.id, id),
            eq(data.jobId ? jobs.isActive : contracts.isActive, true),
          ),
        )
        .limit(1);

      if (!targetExists.length) {
        throw new CustomError(
          "Job or contract does not exist or is inactive.",
          404,
        );
      }

      const userHasBid = await tx
        .select({ bidId: bids.id })
        .from(bidsRelationships)
        .innerJoin(bids, eq(bids.id, bidsRelationships.bidId))
        .where(
          and(
            eq(
              data.jobId
                ? bidsRelationships.jobId
                : bidsRelationships.contractId,
              id,
            ),
            eq(bids.companyId, data.companyId),
            eq(bids.isActive, true),
          ),
        )
        .limit(1);

      if (userHasBid.length) {
        throw new CustomError(
          "User has already bid on this job or contract with this company.",
          400,
        );
      }

      // Check if the user is trying to bid on their own company's job or contract
      const usersCompaniesOwnPosting = await tx
        .select()
        .from(jobsRelationships)
        .where(
          and(
            targetCondition,
            inArray(jobsRelationships.companyId, ownedCompanyIds),
          ),
        )
        .limit(1);

      if (usersCompaniesOwnPosting.length) {
        throw new CustomError(
          "User cannot bid on their own companies jobs or contracts.",
          400,
        );
      }

      // Make sure the bid price is higher than the minimum bid price
      if (data.contractId) {
        const minPrice = await tx
          .select({ price: contracts.price })
          .from(contracts)
          .where(eq(contracts.id, data.contractId))
          .limit(1);

        if (minPrice[0] && Number(minPrice[0].price) > Number(data.price)) {
          throw new CustomError(
            "Bid price cannot be lower than the contract's minimum bid price.",
            400,
          );
        }
      }

      await tx
        .insert(bids)
        .values({
          id: newId,
          price: data.price,
          companyId: data.companyId,
          note: data.note,
        })
        .returning({ insertedId: bids.id });

      await tx.insert(bidsRelationships).values({
        bidId: newId,
        [data.jobId ? "jobId" : "contractId"]: data.jobId || data.contractId,
      });
    });

    return new Response(
      JSON.stringify({
        message: "Bid created.",
      }),
      { status: 201 },
    );
  } catch (err) {
    console.error(err);
    const message =
      err instanceof CustomError
        ? (err as Error).message
        : "Error creating bid.";
    return new Response(
      JSON.stringify({
        error: message,
      }),
      { status: err instanceof CustomError ? err.status : 500 },
    );
  }
}

export async function PATCH(req: Request) {
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

  let params = queryParamSchema.PATCH.safeParse(query);

  if (!params.success) {
    return new Response(
      JSON.stringify({ error: params.error.issues[0]?.message }),
      { status: 400 },
    );
  }

  const { data } = params;

  try {
    await db.transaction(async (tx) => {
      const [bidExists] = await tx
        .select({
          id: bids.id,
          companyId: bids.companyId,
          status: bids.status,
          isActive: bids.isActive,
          jobId: bidsRelationships.jobId,
          contractId: bidsRelationships.contractId,
        })
        .from(bids)
        .innerJoin(bidsRelationships, eq(bids.id, bidsRelationships.bidId))
        .where(eq(bids.id, data.bidId))
        .limit(1);

      if (!bidExists) throw new CustomError("Bid does not exist.", 404);

      if (!ownedCompanyIds.includes(bidExists.companyId))
        throw new CustomError("Not authorized to update this bid.", 401);

      // Check if bid and updated status' are valid
      if (
        data.status === "accepted" ||
        data.status === "declined" ||
        bidExists.status === "accepted" ||
        bidExists.status === "declined"
      ) {
        throw new CustomError("Bid is not able to be updated.", 400);
      }

      // Determine the target ID
      const targetId = bidExists.jobId || bidExists.contractId;
      if (!targetId) {
        throw new Error("Job ID or Contract ID was not properly fetched.");
      }

      // Define the condition to target the correct job or contract
      const targetCondition: any = bidExists.jobId
        ? eq(jobsRelationships.jobId, targetId)
        : eq(jobsRelationships.contractId, targetId);

      const [targetIsActive] = await tx
        .select({
          count: sql`count(*)`,
        })
        .from(bidExists.jobId ? jobs : contracts)
        .innerJoin(jobsRelationships, targetCondition)
        .where(
          and(eq(bidExists.jobId ? jobs.isActive : contracts.isActive, true)),
        )
        .limit(1);

      if (!targetIsActive)
        throw new CustomError(
          "Job or contract does not exist or is inactive.",
          404,
        );

      const { price, status, bidId, note } = data;

      await tx
        .update(bids)
        .set({
          price,
          status,
          note,
          isActive: status && status !== "pending" ? false : true,
        })
        .where(eq(bids.id, bidId));
    });
  } catch (err) {
    const message =
      err instanceof CustomError
        ? (err as Error).message
        : "Error creating bid.";
    return new Response(
      JSON.stringify({
        error: message,
      }),
      { status: err instanceof CustomError ? err.status : 500 },
    );
  }

  return new Response(
    JSON.stringify({
      message: "Bid updated.",
    }),
    { status: 200 },
  );
}

export async function DELETE(req: Request) {
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

  let params = queryParamSchema.DELETE.safeParse(query);

  if (!params.success) {
    return new Response(
      JSON.stringify({ error: params.error.issues[0]?.message }),
      { status: 400 },
    );
  }

  const { data } = params;

  try {
    const [bidToDelete] = await db
      .select()
      .from(bids)
      .where(eq(bids.id, data.bidId))
      .limit(1);

    if (!bidToDelete) throw new CustomError("Bid not found.", 404);

    if (!ownedCompanyIds.includes(bidToDelete.companyId)) {
      throw new CustomError("Not authorized to delete this bid.", 401);
    }

    await db.delete(bids).where(eq(bids.id, bidToDelete.id));

    return new Response(
      JSON.stringify({
        message: `Bid deleted.`,
      }),
      { status: 200 },
    );
  } catch (err) {
    const message =
      err instanceof CustomError
        ? (err as Error).message
        : "Error deleting bid.";

    return new Response(
      JSON.stringify({
        error: message,
      }),
      { status: err instanceof CustomError ? err.status : 500 },
    );
  }
}
