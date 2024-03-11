import { bidRouter } from "@/lib/server/routers/bids";
import { createTRPCRouter } from "@/lib/server/trpc";
import { jobRouter } from "./routers/jobs";
import { industryRouter } from "./routers/industries";
import { authRouter } from "./routers/auth";
import { companyRouter } from "./routers/companies";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  bid: bidRouter,
  job: jobRouter,
  industry: industryRouter,
  auth: authRouter,
  company: companyRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
