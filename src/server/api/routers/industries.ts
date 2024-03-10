import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { industries as dbIndustries } from "@/server/db/schema/tables/content";
import { TRPCError } from "@trpc/server";

export const industryRouter = createTRPCRouter({
  getIndustries: publicProcedure.query(async ({ ctx }) => {
    try {
      const industries = await ctx.db
        .select({
          label: dbIndustries.label,
          value: dbIndustries.value,
        })
        .from(dbIndustries);

      return industries;
    } catch (err) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Error fetching industries",
      });
    }
  }),
});
