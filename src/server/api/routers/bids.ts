import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  authenticatedProcedure,
  companyOwnerProcedure,
} from "@/server/api/trpc";
import { createFilterConditions } from "@/lib/utils";
import { jobs, bids } from "@/server/db/schema/tables/content";
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
} from "../validations/bids";

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
});
