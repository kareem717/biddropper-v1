import { authenticatedProcedure, createTRPCRouter } from "@/lib/server/trpc";

import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { companies } from "@/lib/db/schema/tables/content";

export const companyRouter = createTRPCRouter({
  getOwnedCompanies: authenticatedProcedure.query(async ({ ctx }) => {
    const ownedCompanies = await db
      .select()
      .from(companies)
      .where(eq(companies.ownerId, ctx.user.id));

    if (!ownedCompanies) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Companies not found",
      });
    }

    return ownedCompanies;
  }),
});
