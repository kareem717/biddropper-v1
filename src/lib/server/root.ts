import { bidRouter } from "@/lib/server/routers/bids";
import { createTRPCRouter } from "@/lib/server/trpc";
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
