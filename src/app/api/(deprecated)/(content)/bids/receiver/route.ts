import { db } from "@/lib/db";
import { bids, contracts, jobs } from "@/lib/db/schema/tables/content";
import { and, eq, inArray, ne, or } from "drizzle-orm";
import { parse } from "url";
import {
  bidsRelationships,
  jobsRelationships,
} from "@/lib/db/schema/tables/relations/content";
import { queryParamSchema } from "@/lib/deprecated/validations/api/(content)/bids/request";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { CustomError } from "@/lib/utils";

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
      const [bidToUpdate] = await tx
        .select({
          id: bids.id,
          status: bids.status,
          isActive: bids.isActive,
          jobId: bidsRelationships.jobId,
          contractId: bidsRelationships.contractId,
        })
        .from(bids)
        .innerJoin(bidsRelationships, eq(bids.id, bidsRelationships.bidId))
        .where(eq(bids.id, data.bidId))
        .limit(1);

      if (!bidToUpdate)
        throw new CustomError("Error whilst fetching bid.", 404);
      // If bid is not active or has been retracted, throw error
      if (
        (data.status !== "accepted" && data.status !== "declined") ||
        bidToUpdate.isActive !== true
      ) {
        throw new CustomError(
          "Bid is not able to be updated with that status.",
          400,
        );
      }

      const [jobRel] = await tx
        .select()
        .from(jobsRelationships)
        .where(
          or(
            bidToUpdate.jobId
              ? eq(jobsRelationships.jobId, bidToUpdate.jobId)
              : undefined,
            bidToUpdate.contractId
              ? eq(jobsRelationships.contractId, bidToUpdate.contractId)
              : undefined,
          ),
        )
        .limit(1);

      if (!jobRel)
        throw new CustomError("Error whilst fetching related bid data.", 404);

      const { userId, companyId, jobId, contractId } = jobRel;

      // Check if user is authorized
      if (
        (companyId && !ownedCompanyIds.includes(companyId)) ||
        (userId && userId !== session?.user.id)
      ) {
        throw new CustomError(
          "Unauthorized to accept or decline this bid.",
          401,
        );
      }

      // Check if job or contract is active
      if (contractId) {
        const [contract] = await tx
          .select()
          .from(contracts)
          .where(eq(contracts.id, contractId))
          .limit(1);
        if (!(contract && contract.isActive)) {
          throw new CustomError("Contract is not active.", 400);
        }
      } else if (jobId) {
        const [job] = await tx
          .select()
          .from(jobs)
          .where(eq(jobs.id, jobId))
          .limit(1);

        if (!(job && job.isActive)) {
          throw new CustomError("Job is not active.", 400);
        }
      }

      // Update bid
      await tx
        .update(bids)
        .set({
          status: data.status,
          isActive: false,
        })
        .where(eq(bids.id, data.bidId));

      // Update other bids
      if (data.status === "accepted") {
        console.log(2);

        const targetId = contractId || jobId;
        const targetTable = contractId ? contracts : jobs;
        const targetField = contractId ? contracts.id : jobs.id;
        const targetRelationships = contractId
          ? bidsRelationships.contractId
          : bidsRelationships.jobId;
        console.log(2);

        // Set all other bids to declined
        await tx
          .update(bids)
          .set({ status: "declined", isActive: false })
          .where(
            inArray(
              bids.id,
              tx
                .select({ id: bids.id })
                .from(bids)
                .innerJoin(
                  bidsRelationships,
                  eq(bids.id, bidsRelationships.bidId),
                )
                .where(
                  and(
                    eq(targetRelationships, targetId),
                    ne(bids.id, data.bidId),
                  ),
                ),
            ),
          );

        // Set winner flag on accepted bid
        await tx
          .update(bidsRelationships)
          .set({ isWinner: true })
          .where(and(eq(bidsRelationships.bidId, data.bidId)));

        // Set job or contract to inactive and set winning bid id
        await tx
          .update(targetTable)
          .set({ isActive: false })
          .where(eq(targetField, targetId));

        // If target is a contract, we need to update the jobs in the contract
        if (contractId) {
          await tx
            .update(jobs)
            .set({ isActive: false })
            .where(
              inArray(
                jobs.id,
                tx
                  .select({ id: jobs.id })
                  .from(jobs)
                  .innerJoin(
                    jobsRelationships,
                    eq(jobs.id, jobsRelationships.jobId),
                  )
                  .where(and(eq(jobsRelationships.contractId, contractId))),
              ),
            );
        }
      }
    });

    return new Response(
      JSON.stringify({
        message: `Bid ${data.status === "accepted" ? "accepted" : "declined"}.`,
      }),
      { status: 200 },
    );
  } catch (err) {
    console.error(err);

    const message =
      err instanceof CustomError
        ? (err as Error).message
        : "Error updating bid.";
    return new Response(
      JSON.stringify({
        error: message,
      }),
      { status: err instanceof CustomError ? err.status : 500 },
    );
  }
}
