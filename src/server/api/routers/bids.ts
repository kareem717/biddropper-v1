import {
  createTRPCRouter,
  authenticatedProcedure,
  companyOwnerProcedure,
} from "@/server/api/trpc";
import { jobs, bids, contracts } from "@/server/db/schema/tables/content";
import {
  bidsRelationships,
  jobsRelationships,
} from "@/server/db/schema/tables/relations/content";
import { eq, sql, avg, and, max, min, gte, inArray, lte } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import {
  getJobBidStatsInput,
  getBidStatsOutput,
  getContractBidStatsInput,
  createJobBidInput,
  createContractBidInput,
} from "../validations/bids";
import { v4 as uuidv4 } from "uuid";

export const bidRouter = createTRPCRouter({
  getJobBidStats: authenticatedProcedure
    .input(getJobBidStatsInput)
    .output(getBidStatsOutput)
    .query(async ({ ctx, input: data }) => {
      // Make sure user either owns a company or owns the job or contract
      if (!ctx.session.user.ownedCompanies) {
        try {
          const [job] = await ctx.db
            .select({
              userId: jobsRelationships.userId,
            })
            .from(jobs)
            .innerJoin(jobsRelationships, eq(jobs.id, jobsRelationships.jobId))
            .where(eq(jobs.id, data.jobId))
            .limit(1);

          if (!job) {
            throw new TRPCError({
              message: "Not authenticated to view this job data.",
              code: "UNAUTHORIZED",
            });
          }
        } catch (err) {
          throw new TRPCError({
            message: "An error occured whilst fetching the job data.",
            code: "INTERNAL_SERVER_ERROR",
          });
        }
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
        stats = ctx.db
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
          .where(and(...filterConditions(data, bids)));

        console.log(stats.toSQL());

        stats = await ctx.db.execute(stats);
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
          .where(and(...filterConditions(data, bids)))
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
        stats = await ctx.db
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
          .where(and(...filterConditions(data, bids)));
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
          .where(and(...filterConditions(data, bids)))
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
  createJobBid: companyOwnerProcedure
    .input(createJobBidInput)
    .mutation(async ({ ctx, input: data }) => {
      const ownedCompanyIds = ctx.session.user.ownedCompanies.map(
        (company) => company.id,
      );

      const newId = uuidv4();

      await ctx.db.transaction(async (tx) => {
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
          jobId: data.jobId 
        });
      });
    }),
  createContractBid: companyOwnerProcedure
    .input(createContractBidInput)
    .mutation(async ({ ctx, input: data }) => {
      const ownedCompanyIds = ctx.session.user.ownedCompanies.map(
        (company) => company.id,
      );

      const newId = uuidv4();

      await ctx.db.transaction(async (tx) => {
        let id = data.contractId;

        // Make sure the job or contract exists, is active and the user has not already bid on it with the same company
        const targetExists = await tx
          .select()
          .from( contracts)
          .where(
            and(
              eq(contracts.id, id),
              eq(contracts.isActive, true),
            ),
          )
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
              eq(
                  bidsRelationships.contractId,
                id,
              ),
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

        await tx
          .insert(bids)
          .values({
            id: newId,
            price: data.price,
            companyId: data.companyId,
            note: data.note,
          })

        await tx.insert(bidsRelationships).values({
          bidId: newId,
          contractId: data.contractId,
        });
      });
    }),
});
