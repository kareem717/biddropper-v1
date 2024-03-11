import {
  createTRPCRouter,
  authenticatedProcedure,
  companyOwnerProcedure,
} from "@/lib/server/trpc";
import {
  jobs,
  bids,
  contracts,
  companies,
} from "@/lib/db/schema/tables/content";
import {
  bidsRelationships,
  jobsRelationships,
} from "@/lib/db/schema/tables/relations/content";
import {
  eq,
  sql,
  avg,
  and,
  max,
  min,
  gte,
  inArray,
  lte,
  asc,
  desc,
  or,
  ne,
} from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import {
  getJobBidStatsInput,
  getBidStatsOutput,
  getContractBidStatsInput,
  createJobBidInput,
  createContractBidInput,
  updateBidInput,
  deleteBidInput,
  getUserBidsInput,
  getCompanyBidsInput,
  getJobBidsInput,
  getContractBidsInput,
} from "../../validations/server/bids";
import { v4 as uuidv4 } from "uuid";
import { createSelectSchema } from "drizzle-zod";
import { generateCursor } from "@/lib/utils";

export const bidRouter = createTRPCRouter({
  createJobBid: companyOwnerProcedure
    .input(createJobBidInput)
    .output(createSelectSchema(bids))
    .mutation(async ({ ctx, input: data }) => {
      const ownedCompanyIds = ctx.ownedCompanies.map((company) => company.id);

      const newId = uuidv4();

      const res = await ctx.db.transaction(async (tx) => {
        // Make sure the job or contract exists, is active and the user has not already bid on it with the same company
        const targetExists = await tx
          .select()
          .from(jobs)
          .where(and(eq(jobs.id, data.jobId), eq(jobs.isActive, true)))
          .limit(1);

        if (!targetExists.length) {
          throw new TRPCError({
            message: "Listing does not exist or is not active.",
            code: "BAD_REQUEST",
          });
        }

        const userHasBid = await tx
          .select({ bidId: bids.id })
          .from(bidsRelationships)
          .innerJoin(bids, eq(bids.id, bidsRelationships.bidId))
          .where(
            and(
              eq(bidsRelationships.jobId, data.jobId),
              eq(bids.companyId, data.companyId),
              eq(bids.isActive, true),
            ),
          )
          .limit(1);

        if (userHasBid.length) {
          throw new TRPCError({
            message: "Company has already bid on this listing.",
            code: "BAD_REQUEST",
          });
        }

        // Check if the user is trying to bid on their own company's job or contract
        const usersCompaniesOwnPosting = await tx
          .select()
          .from(jobsRelationships)
          .where(
            and(
              eq(jobsRelationships.jobId, data.jobId),
              inArray(jobsRelationships.companyId, ownedCompanyIds),
            ),
          )
          .limit(1);

        console.log(usersCompaniesOwnPosting);

        if (usersCompaniesOwnPosting.length) {
          throw new TRPCError({
            message: "Cannot bid on your own company's listing.",
            code: "BAD_REQUEST",
          });
        }

        try {
          const insertedBid = await tx
            .insert(bids)
            .values({
              id: newId,
              price: data.price,
              companyId: data.companyId,
              note: data.note,
            })
            .returning({
              id: bids.id,
              price: bids.price,
              createdAt: bids.createdAt,
              updatedAt: bids.updatedAt,
              companyId: bids.companyId,
              note: bids.note,
              isActive: bids.isActive,
              status: bids.status,
            });

          await tx.insert(bidsRelationships).values({
            bidId: newId,
            jobId: data.jobId,
          });

          if (!insertedBid[0]) {
            throw new TRPCError({
              message: "Error creating bid.",
              code: "INTERNAL_SERVER_ERROR",
            });
          }

          return insertedBid[0];
        } catch (err) {
          throw new TRPCError({
            message: "Error creating bid.",
            code: "INTERNAL_SERVER_ERROR",
          });
        }
      });

      return res;
    }),
  createContractBid: companyOwnerProcedure
    .input(createContractBidInput)
    .output(createSelectSchema(bids))
    .mutation(async ({ ctx, input: data }) => {
      const ownedCompanyIds = ctx.ownedCompanies.map((company) => company.id);

      const newId = uuidv4();

      const res = await ctx.db.transaction(async (tx) => {
        let id = data.contractId;

        // Make sure the job or contract exists, is active and the user has not already bid on it with the same company
        const targetExists = await tx
          .select()
          .from(contracts)
          .where(and(eq(contracts.id, id), eq(contracts.isActive, true)))
          .limit(1);

        if (!targetExists.length) {
          throw new TRPCError({
            message: "Listing does not exist or is not active.",
            code: "BAD_REQUEST",
          });
        }

        const userHasBid = await tx
          .select({ bidId: bids.id })
          .from(bidsRelationships)
          .innerJoin(bids, eq(bids.id, bidsRelationships.bidId))
          .where(
            and(
              eq(bidsRelationships.contractId, id),
              eq(bids.companyId, data.companyId),
              eq(bids.isActive, true),
            ),
          )
          .limit(1);

        if (userHasBid.length) {
          throw new TRPCError({
            message: "Company has already bid on this listing.",
            code: "BAD_REQUEST",
          });
        }

        // Check if the user is trying to bid on their own company's job or contract
        const usersCompaniesOwnPosting = await tx
          .select()
          .from(contracts)
          .where(
            and(
              eq(contracts.id, id),
              inArray(contracts.companyId, ownedCompanyIds),
            ),
          )
          .limit(1);

        if (usersCompaniesOwnPosting.length) {
          throw new TRPCError({
            message: "Cannot bid on your own company's listing.",
            code: "BAD_REQUEST",
          });
        }

        // Make sure the bid price is higher than the minimum bid price
        if (data.contractId) {
          const minPrice = await tx
            .select({ price: contracts.price })
            .from(contracts)
            .where(eq(contracts.id, data.contractId))
            .limit(1);

          if (minPrice[0] && Number(minPrice[0].price) > Number(data.price)) {
            throw new TRPCError({
              message: "Bid price is lower than the minimum bid price.",
              code: "BAD_REQUEST",
            });
          }
        }

        try {
          const insertedBid = await tx
            .insert(bids)
            .values({
              id: newId,
              price: data.price,
              companyId: data.companyId,
              note: data.note,
            })
            .returning({
              id: bids.id,
              price: bids.price,
              createdAt: bids.createdAt,
              updatedAt: bids.updatedAt,
              companyId: bids.companyId,
              note: bids.note,
              isActive: bids.isActive,
              status: bids.status,
            });

          await tx.insert(bidsRelationships).values({
            bidId: newId,
            contractId: data.contractId,
          });

          if (!insertedBid[0]) {
            throw new TRPCError({
              message: "Error creating bid.",
              code: "INTERNAL_SERVER_ERROR",
            });
          }

          return insertedBid[0];
        } catch (err) {
          throw new TRPCError({
            message: "Error creating bid.",
            code: "INTERNAL_SERVER_ERROR",
          });
        }
      });

      return res;
    }),
  updateBidAsSender: companyOwnerProcedure
    .input(updateBidInput)
    .output(createSelectSchema(bids))
    .mutation(async ({ ctx, input: data }) => {
      const ownedCompanyIds = ctx.ownedCompanies.map((company) => company.id);

      const res = await ctx.db.transaction(async (tx) => {
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

        if (!bidExists)
          throw new TRPCError({
            message: "Bid does not exist.",
            code: "NOT_FOUND",
          });

        if (!ownedCompanyIds.includes(bidExists.companyId))
          throw new TRPCError({
            message: "Company does not own this bid.",
            code: "FORBIDDEN",
          });

        if (
          // Do not allow update if user is attempting to accept/decline their own outgoing bid
          data.status === "accepted" ||
          data.status === "declined" ||
          // Do not allow update if bid is already accepted or declined
          bidExists.status === "accepted" ||
          bidExists.status === "declined"
        ) {
          throw new TRPCError({
            message: "Cannot accept or decline this bid.",
            code: "FORBIDDEN",
          });
        }

        // Determine the target ID
        const targetId = bidExists.jobId || bidExists.contractId;
        if (!targetId) {
          throw new TRPCError({
            message: "Fetched bid has malformed data.",
            code: "UNPROCESSABLE_CONTENT",
          });
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
          throw new TRPCError({
            message:
              "The listing this bid was placed on does not exist or is not active.",
            code: "BAD_REQUEST",
          });

        const { price, status, bidId, note } = data;

        const updatedBid = await tx
          .update(bids)
          .set({
            price,
            status,
            note,
            isActive: status && status !== "pending" ? false : true,
          })
          .where(eq(bids.id, bidId))
          .returning({
            id: bids.id,
            price: bids.price,
            createdAt: bids.createdAt,
            updatedAt: bids.updatedAt,
            companyId: bids.companyId,
            note: bids.note,
            isActive: bids.isActive,
            status: bids.status,
          });

        if (!updatedBid?.[0]) {
          throw new TRPCError({
            message: "Error updating bid.",
            code: "INTERNAL_SERVER_ERROR",
          });
        }

        return updatedBid[0];
      });

      return res;
    }),
  acceptOrDeclineBid: authenticatedProcedure
    .input(updateBidInput)
    .mutation(async ({ ctx, input: data }) => {
      // Retrieve the list of companies owned by the user
      let usersOwnedCompanyIds: { id: string }[] | [];
      try {
        usersOwnedCompanyIds = await ctx.db
          .select({ id: companies.id })
          .from(companies)
          .where(eq(companies.ownerId, ctx.user.id));
      } catch (err) {
        throw new TRPCError({
          message: "Error whilst fetching owned companies.",
          code: "INTERNAL_SERVER_ERROR",
        });
      }

      // Execute database transaction
      const res = await ctx.db.transaction(async (tx) => {
        let bidToUpdate;
        try {
          // Fetch the bid to update based on the provided bid ID
          [bidToUpdate] = await tx
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
        } catch (err) {
          // Handle error if bid fetching fails
          throw new TRPCError({
            message: "Error whilst fetching bid.",
            code: "NOT_FOUND",
          });
        }

        // Validate if the bid exists
        if (!bidToUpdate)
          throw new TRPCError({
            message: "Bid does not exist.",
            code: "NOT_FOUND",
          });

        // Validate if the bid status is either not 'accepted' or 'declined' and if it is active
        if (
          (data.status !== "accepted" && data.status !== "declined") ||
          bidToUpdate.isActive !== true
        ) {
          throw new TRPCError({
            message:
              "Bid is not able to be updated, as it has already been accepted or declined.",
            code: "BAD_REQUEST",
          });
        }

        // Check if the bid is related to a contract
        if (bidToUpdate.contractId) {
          // Validate if the user owns any companies
          if (!usersOwnedCompanyIds.length) {
            throw new TRPCError({
              message: "Unauthorized to accept or decline this bid.",
              code: "FORBIDDEN",
            });
          }

          let contract;
          try {
            // Fetch the related contract based on the contract ID
            [contract] = await tx
              .select()
              .from(contracts)
              .where(
                and(
                  eq(contracts.id, bidToUpdate.contractId),
                  inArray(
                    contracts.companyId,
                    usersOwnedCompanyIds.map((company) => company.id),
                  ),
                ),
              )
              .limit(1);
          } catch (err) {
            // Handle error if contract fetching fails
            throw new TRPCError({
              message: "Error whilst fetching bid's related contract data.",
              code: "NOT_FOUND",
            });
          }

          // Validate if the contract exists and if the user is authorized
          if (!contract) {
            throw new TRPCError({
              message: "Unauthorized to accept or decline this bid.",
              code: "FORBIDDEN",
            });
          }

          // Check if the contract is active
          if (!contract.isActive) {
            throw new TRPCError({
              message: "Contract is not active.",
              code: "BAD_REQUEST",
            });
          }
        } else if (bidToUpdate.jobId) {
          // Fetch related job data if the bid is related to a job
          const [jobRel] = await tx
            .select()
            .from(jobsRelationships)
            .where(eq(jobsRelationships.jobId, bidToUpdate.jobId))
            .limit(1);

          // Handle error if job data fetching fails
          if (!jobRel) {
            throw new TRPCError({
              message: "Error whilst fetching bids related job data.",
              code: "NOT_FOUND",
            });
          }

          const { userId, companyId } = jobRel;

          // Validate if the user is authorized to accept or decline the bid
          if (
            (companyId &&
              !usersOwnedCompanyIds
                .map((company) => company.id)
                .includes(companyId)) ||
            (userId && userId !== ctx.user.id)
          ) {
            throw new TRPCError({
              message: "Unauthorized to accept or decline this bid.",
              code: "FORBIDDEN",
            });
          }
        } else {
          // Handle malformed bid data
          throw new TRPCError({
            message: "Fetched bid has malformed data.",
            code: "UNPROCESSABLE_CONTENT",
          });
        }

        const { jobId, contractId } = bidToUpdate;

        // Update the bid status and activity based on the input data
        const [updatedBid] = await tx
          .update(bids)
          .set({
            status: data.status,
            isActive: false,
          })
          .where(eq(bids.id, data.bidId))
          .returning({
            id: bids.id,
            price: bids.price,
            createdAt: bids.createdAt,
            updatedAt: bids.updatedAt,
            companyId: bids.companyId,
            note: bids.note,
            isActive: bids.isActive,
            status: bids.status,
          });

        // Handle error if bid update fails
        if (!updatedBid) {
          throw new TRPCError({
            message: "Error updating bid.",
            code: "INTERNAL_SERVER_ERROR",
          });
        }

        // Additional logic to handle accepted bids
        if (data.status === "accepted") {
          const targetId = contractId || jobId;
          const targetTable = contractId ? contracts : jobs;
          const targetField = contractId ? contracts.id : jobs.id;
          const targetRelationships = contractId
            ? bidsRelationships.contractId
            : bidsRelationships.jobId;

          // Validate target data integrity
          if (
            !targetId ||
            !targetTable ||
            !targetField ||
            !targetRelationships
          ) {
            throw new TRPCError({
              message: "Fetched bid has malformed data.",
              code: "UNPROCESSABLE_CONTENT",
            });
          }

          // Decline all other bids related to the target
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

          // Mark the accepted bid as the winner
          await tx
            .update(bidsRelationships)
            .set({ isWinner: true })
            .where(and(eq(bidsRelationships.bidId, data.bidId)));

          // Set the target (job or contract) to inactive and update the winning bid ID
          await tx
            .update(targetTable)
            .set({ isActive: false })
            .where(eq(targetField, targetId));

          // If the target is a contract, update related jobs to inactive
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

        return updatedBid;
      });

      return res;
    }),
  deleteBid: companyOwnerProcedure
    .input(deleteBidInput)
    .output(createSelectSchema(bids))
    .mutation(async ({ ctx, input: data }) => {
      const ownedCompanyIds = ctx.ownedCompanies.map((company) => company.id);

      const deletedBid = await ctx.db.transaction(async (tx) => {
        const [bidToDelete] = await tx
          .select()
          .from(bids)
          .where(eq(bids.id, data.bidId))
          .limit(1);

        if (!bidToDelete)
          throw new TRPCError({
            message: "Bid does not exist.",
            code: "NOT_FOUND",
          });

        if (!ownedCompanyIds.includes(bidToDelete.companyId)) {
          throw new TRPCError({
            message: "Company does not own this bid.",
            code: "FORBIDDEN",
          });
        }

        const deletedBid = await tx
          .delete(bids)
          .where(eq(bids.id, bidToDelete.id))
          .returning({
            id: bids.id,
            price: bids.price,
            createdAt: bids.createdAt,
            updatedAt: bids.updatedAt,
            companyId: bids.companyId,
            note: bids.note,
            isActive: bids.isActive,
            status: bids.status,
          });

        if (!deletedBid?.[0]) {
          throw new TRPCError({
            message: "Error deleting bid.",
            code: "INTERNAL_SERVER_ERROR",
          });
        }

        return deletedBid[0];
      });

      return deletedBid;
    }),
  getUserBids: authenticatedProcedure
    .input(getUserBidsInput)
    .query(async ({ ctx, input }) => {
      const { orderBy, cursor, limit, ...data } = input;
      const { columnName: orderByColumn, order: orderByOrder } = orderBy;

      // Create query conditions based on filters from the query params
      const filterConditions = () => {
        const conditions = [
          inArray(bids.status, data.status),
          inArray(bids.isActive, data.isActive),
        ];

        const addCondition = (
          conditionFn: Function,
          field: any,
          value: any,
        ) => {
          if (value) {
            conditions.push(conditionFn(field, value));
          }
        };

        addCondition(gte, bids.price, data.minPrice);
        addCondition(lte, bids.price, data.maxPrice);
        addCondition(gte, bids.createdAt, data.minCreatedAt);
        addCondition(lte, bids.createdAt, data.maxCreatedAt);

        return conditions;
      };

      try {
        const res = await ctx.db
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
          .innerJoin(jobs, eq(jobs.id, bidsRelationships.jobId))
          .innerJoin(jobsRelationships, eq(jobs.id, jobsRelationships.jobId))
          .where(
            and(
              ...filterConditions(),
              eq(jobsRelationships.userId, data.id),
              cursor
                ? cursor.order === "gte"
                  ? // @ts-expect-error
                    gte(jobs[cursor.columnName], cursor.value)
                  : // @ts-expect-error
                    lte(jobs[cursor.columnName], cursor.value)
                : undefined,
            ),
          )
          .limit(limit + 1)
          .orderBy(
            orderByOrder === "asc"
              ? // @ts-expect-error
                asc(jobs[orderByColumn])
              : // @ts-expect-error
                desc(jobs[orderByColumn]),
          );

        const lastItem = res.length > limit ? res.pop() : null;
        return {
          cursor: lastItem ? generateCursor(lastItem, orderBy, cursor) : null,
          data: res.slice(0, limit),
        };
      } catch (err) {
        throw new TRPCError({
          message: "Error fetching data.",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    }),
  getCompanyBids: authenticatedProcedure
    .input(getCompanyBidsInput)
    .query(async ({ ctx, input }) => {
      const { orderBy, cursor, limit, ...data } = input;
      const { columnName: orderByColumn, order: orderByOrder } = orderBy;

      // Create query conditions based on filters from the query params
      const filterConditions = () => {
        const conditions = [
          inArray(bids.status, data.status),
          inArray(bids.isActive, data.isActive),
        ];

        const addCondition = (
          conditionFn: Function,
          field: any,
          value: any,
        ) => {
          if (value) {
            conditions.push(conditionFn(field, value));
          }
        };

        addCondition(gte, bids.price, data.minPrice);
        addCondition(lte, bids.price, data.maxPrice);
        addCondition(gte, bids.createdAt, data.minCreatedAt);
        addCondition(lte, bids.createdAt, data.maxCreatedAt);

        if (data.outgoing) {
          conditions.push(eq(bids.companyId, data.id));
        } else {
          // All jobs and contracts ownded by the company
          try {
            const jobsOwnedByCompany = ctx.db
              .select({ jobId: jobsRelationships.jobId })
              .from(jobsRelationships)
              .where(eq(jobsRelationships.companyId, data.id));

            const contractsOwnedByCompany = ctx.db
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
          } catch (err) {
            throw new TRPCError({
              message: "Error fetching related listing data.",
              code: "INTERNAL_SERVER_ERROR",
            });
          }
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
          job: {
            id: jobs.id,
            title: jobs.title,
          },
          contract: {
            id: contracts.id,
            title: contracts.title,
          },
        };

        let baseQuery = ctx.db
          .select(selectObject)
          .from(bidsRelationships)
          .innerJoin(bids, eq(bids.id, bidsRelationships.bidId))
          .where(
            and(
              ...filterConditions(),
              cursor
                ? cursor.order === "gte"
                  ? // @ts-expect-error
                    gte(jobs[cursor.columnName], cursor.value)
                  : // @ts-expect-error
                    lte(jobs[cursor.columnName], cursor.value)
                : undefined,
            ),
          )
          .limit(limit + 1)
          .orderBy(
            orderByOrder === "asc"
              ? // @ts-expect-error
                asc(jobs[orderByColumn])
              : // @ts-expect-error
                desc(jobs[orderByColumn]),
          )
          .$dynamic();

        let query;
        if (
          data.targetType.includes("jobs") &&
          !data.targetType.includes("contracts")
        ) {
          selectObject["job"] = { id: jobs.id, title: jobs.title };
          // If we're only looking for job bids, inner join jobs
          query = baseQuery.innerJoin(
            jobs,
            eq(jobs.id, bidsRelationships.jobId),
          );
        } else if (
          !data.targetType.includes("jobs") &&
          data.targetType.includes("contracts")
        ) {
          // If we're only looking for contract bids, inner join contracts
          query = baseQuery.innerJoin(
            contracts,
            eq(contracts.id, bidsRelationships.contractId),
          );
        } else {
          selectObject["contract"] = {
            id: contracts.id,
            title: contracts.title,
          };
          selectObject["job"] = { id: jobs.id, title: jobs.title };

          // If we're looking for both contract and job bids, left join both
          query = baseQuery
            .leftJoin(jobs, eq(jobs.id, bidsRelationships.jobId))
            .leftJoin(
              contracts,
              eq(contracts.id, bidsRelationships.contractId),
            );
        }

        const res = await query;

        const lastItem = res.length > limit ? res.pop() : null;
        return {
          cursor: lastItem ? generateCursor(lastItem, orderBy, cursor) : null,
          data: res.slice(0, limit),
        };
      } catch (err) {
        throw new TRPCError({
          message: "Error fetching data.",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    }),
  getJobBids: authenticatedProcedure
    .input(getJobBidsInput)
    .query(async ({ ctx, input }) => {
      const { jobId, orderBy, cursor, limit, ...data } = input;
      const { columnName: orderByColumn, order: orderByOrder } = orderBy;

      //Verify the user owns the job or the company that owns the job
      const [jobRelationData] = await ctx.db
        .select({
          companyId: jobsRelationships.companyId,
          userId: jobsRelationships.userId,
        })
        .from(jobsRelationships)
        .where(and(eq(jobsRelationships.jobId, jobId)))
        .limit(1);

      if (!jobRelationData) {
        throw new TRPCError({
          message: "Error fetching data.",
          code: "NOT_FOUND",
        });
      }

      if (!jobRelationData.companyId && !jobRelationData.userId) {
        throw new TRPCError({
          message: "The fetched data was malformed.",
          code: "UNPROCESSABLE_CONTENT",
        });
      }

      if (jobRelationData.companyId) {
        try {
          const ownedCompanies = await ctx.db
            .select({
              id: companies.id,
            })
            .from(companies)
            .where(eq(companies.id, jobRelationData.companyId));

          if (!ownedCompanies.length) {
            throw new TRPCError({
              message: "Unauthorized to access this data.",
              code: "FORBIDDEN",
            });
          }
        } catch (err) {
          throw new TRPCError({
            message: "Error fetching job's related company data.",
            code: "INTERNAL_SERVER_ERROR",
          });
        }
      } else if (
        jobRelationData.userId &&
        jobRelationData.userId !== ctx.user.id
      ) {
        throw new TRPCError({
          message: "Unauthorized to access this data.",
          code: "FORBIDDEN",
        });
      }

      // Create query conditions based on filters from the query params
      const filterConditions = () => {
        const conditions = [
          inArray(bids.status, data.status),
          inArray(bids.isActive, data.isActive),
        ];

        const addCondition = (
          conditionFn: Function,
          field: any,
          value: any,
        ) => {
          if (value) {
            conditions.push(conditionFn(field, value));
          }
        };

        addCondition(gte, bids.price, data.minPrice);
        addCondition(lte, bids.price, data.maxPrice);
        addCondition(gte, bids.createdAt, data.minCreatedAt);
        addCondition(lte, bids.createdAt, data.maxCreatedAt);

        return conditions;
      };

      try {
        const res = await ctx.db
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
          .innerJoin(jobs, eq(jobs.id, bidsRelationships.jobId))
          .where(
            and(
              ...filterConditions(),
              eq(jobs.id, jobId),
              cursor
                ? cursor.order === "gte"
                  ? // @ts-expect-error
                    gte(jobs[cursor.columnName], cursor.value)
                  : // @ts-expect-error
                    lte(jobs[cursor.columnName], cursor.value)
                : undefined,
            ),
          )
          .limit(limit + 1)
          .orderBy(
            orderByOrder === "asc"
              ? // @ts-expect-error
                asc(jobs[orderByColumn])
              : // @ts-expect-error
                desc(jobs[orderByColumn]),
          );

        const lastItem = res.length > limit ? res.pop() : null;
        return {
          cursor: lastItem ? generateCursor(lastItem, orderBy, cursor) : null,
          data: res.slice(0, limit),
        };
      } catch (err) {
        throw new TRPCError({
          message: "Error fetching data.",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    }),
  getContractBids: companyOwnerProcedure
    .input(getContractBidsInput)
    .query(async ({ ctx, input }) => {
      const { contractId, orderBy, cursor, limit, ...data } = input;
      const { columnName: orderByColumn, order: orderByOrder } = orderBy;

      //Verify the user owns the job or the company that owns the job
      const [contractRelationData] = await ctx.db
        .select({
          companyId: contracts.companyId,
        })
        .from(contracts)
        .where(eq(contracts.id, contractId))
        .limit(1);

      if (!contractRelationData) {
        throw new TRPCError({
          message: "Error fetching data.",
          code: "NOT_FOUND",
        });
      }

      if (
        !ctx.ownedCompanies
          .map((company) => company.id)
          .includes(contractRelationData.companyId)
      ) {
        throw new TRPCError({
          message: "Unauthorized to access this data.",
          code: "FORBIDDEN",
        });
      }

      // Create query conditions based on filters from the query params
      const filterConditions = () => {
        const conditions = [
          inArray(bids.status, data.status),
          inArray(bids.isActive, data.isActive),
        ];

        const addCondition = (
          conditionFn: Function,
          field: any,
          value: any,
        ) => {
          if (value) {
            conditions.push(conditionFn(field, value));
          }
        };

        addCondition(gte, bids.price, data.minPrice);
        addCondition(lte, bids.price, data.maxPrice);
        addCondition(gte, bids.createdAt, data.minCreatedAt);
        addCondition(lte, bids.createdAt, data.maxCreatedAt);

        return conditions;
      };

      try {
        const res = await ctx.db
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
          .innerJoin(contracts, eq(contracts.id, bidsRelationships.contractId))
          .where(
            and(
              ...filterConditions(),
              eq(contracts.id, contractId),
              cursor
                ? cursor.order === "gte"
                  ? // @ts-expect-error
                    gte(jobs[cursor.columnName], cursor.value)
                  : // @ts-expect-error
                    lte(jobs[cursor.columnName], cursor.value)
                : undefined,
            ),
          )
          .limit(limit + 1)
          .orderBy(
            orderByOrder === "asc"
              ? // @ts-expect-error
                asc(jobs[orderByColumn])
              : // @ts-expect-error
                desc(jobs[orderByColumn]),
          );

        const lastItem = res.length > limit ? res.pop() : null;
        return {
          cursor: lastItem ? generateCursor(lastItem, orderBy, cursor) : null,
          data: res.slice(0, limit),
        };
      } catch (err) {
        throw new TRPCError({
          message: "Error fetching data.",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    }),
  getJobBidStats: authenticatedProcedure
    .input(getJobBidStatsInput)
    .output(getBidStatsOutput)
    .query(async ({ ctx, input: data }) => {
      // Make sure user either owns a company or owns the job or contract

      try {
        const ownedCompanies = await ctx.db
          .select({
            id: companies.id,
          })
          .from(companies)
          .where(eq(companies.ownerId, ctx.user.id));

        if (!ownedCompanies) {
          try {
            const [job] = await ctx.db
              .select({
                userId: jobsRelationships.userId,
              })
              .from(jobs)
              .innerJoin(
                jobsRelationships,
                eq(jobs.id, jobsRelationships.jobId),
              )
              .where(eq(jobs.id, data.jobId))
              .limit(1);

            if (!job) {
              throw new TRPCError({
                message: "Not authenticated to view this job data.",
                code: "FORBIDDEN",
              });
            }
          } catch (err) {
            throw new TRPCError({
              message: "An error occured whilst fetching the job data.",
              code: "INTERNAL_SERVER_ERROR",
            });
          }
        }
      } catch (err) {
        throw new TRPCError({
          message: "An error occured whilst fetching the company data.",
          code: "INTERNAL_SERVER_ERROR",
        });
      }

      // Create query conditions based on filters from the query params
      const filterConditions = (params: any, bids: any) => {
        const conditions = [
          inArray(bids.status, data.status),
          inArray(bids.isActive, data.isActive),
        ];

        const addCondition = (
          conditionFn: Function,
          field: any,
          value: any,
        ) => {
          if (value) {
            conditions.push(conditionFn(field, value));
          }
        };

        addCondition(gte, bids.price, data.minPrice);
        addCondition(lte, bids.price, data.maxPrice);
        addCondition(gte, bids.createdAt, data.minCreatedAt);
        addCondition(lte, bids.createdAt, data.maxCreatedAt);

        return conditions;
      };

      let stats, dailyAverages;

      try {
        [stats] = await ctx.db
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
          .where(
            and(
              ...filterConditions(data, bids),
              eq(bidsRelationships.jobId, data.jobId),
            ),
          );
      } catch (err) {
        console.log(err);
        throw new TRPCError({
          message:
            "An error occured whilst fetching the listing's bid statsitcs.",
          code: "INTERNAL_SERVER_ERROR",
        });
      }

      try {
        dailyAverages = await ctx.db
          .select({
            day: sql`DATE(${bids.createdAt})`,
            averagePrice: sql<number>`avg(${bids.price})`,
          })
          .from(bids)
          .innerJoin(bidsRelationships, eq(bids.id, bidsRelationships.bidId))
          .where(
            and(
              ...filterConditions(data, bids),
              eq(bidsRelationships.jobId, data.jobId),
            ),
          )
          .orderBy(sql`DATE(${bids.createdAt})`)
          .groupBy(sql`DATE(${bids.createdAt})`)
          .limit(30);
      } catch (err) {
        console.log(err);

        throw new TRPCError({
          message: "An error occured whilst fetching the bid time series data.",
          code: "INTERNAL_SERVER_ERROR",
        });
      }

      return {
        stats,
        dailyAverages,
      } as any;
    }),
  getContractBidStats: companyOwnerProcedure
    .input(getContractBidStatsInput)
    .output(getBidStatsOutput)
    .query(async ({ ctx, input: data }) => {
      // Create query conditions based on filters from the query params
      const filterConditions = (params: any, bids: any) => {
        const conditions = [
          inArray(bids.status, data.status),
          inArray(bids.isActive, data.isActive),
        ];

        const addCondition = (
          conditionFn: Function,
          field: any,
          value: any,
        ) => {
          if (value) {
            conditions.push(conditionFn(field, value));
          }
        };

        addCondition(gte, bids.price, data.minPrice);
        addCondition(lte, bids.price, data.maxPrice);
        addCondition(gte, bids.createdAt, data.minCreatedAt);
        addCondition(lte, bids.createdAt, data.maxCreatedAt);

        return conditions;
      };

      let stats, dailyAverages;

      try {
        [stats] = await ctx.db
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
          .where(
            and(
              ...filterConditions(data, bids),
              eq(bidsRelationships.contractId, data.contractId),
            ),
          );
      } catch (err) {
        throw new TRPCError({
          message:
            "An error occured whilst fetching the listing's bid statsitcs.",
          code: "INTERNAL_SERVER_ERROR",
        });
      }

      try {
        dailyAverages = await ctx.db
          .select({
            day: sql`DATE(${bids.createdAt})`,
            averagePrice: sql<number>`avg(${bids.price})`,
          })
          .from(bids)
          .innerJoin(bidsRelationships, eq(bids.id, bidsRelationships.bidId))
          .where(
            and(
              ...filterConditions(data, bids),
              eq(bidsRelationships.contractId, data.contractId),
            ),
          )
          .orderBy(sql`DATE(${bids.createdAt})`)
          .groupBy(sql`DATE(${bids.createdAt})`)
          .limit(30);
      } catch (err) {
        throw new TRPCError({
          message: "An error occured whilst fetching the bid time series data.",
          code: "INTERNAL_SERVER_ERROR",
        });
      }

      return {
        stats,
        dailyAverages,
      } as any;
    }),
});
