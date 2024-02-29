import { bidRouter } from "@/server/api/routers/bids";
import { createTRPCRouter } from "@/server/api/trpc";
import { jobRouter } from "./routers/jobs";
import { industryRouter } from "./routers/industries";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  bid: bidRouter,
  job: jobRouter,
  industry: industryRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
