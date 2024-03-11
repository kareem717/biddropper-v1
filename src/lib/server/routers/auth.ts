import { authenticatedProcedure, createTRPCRouter } from "@/lib/server/trpc";

import { TRPCError } from "@trpc/server";
import { users } from "@/lib/db/schema/tables/auth";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";

export const authRouter = createTRPCRouter({
  getFullUser: authenticatedProcedure.query(async ({ ctx }) => {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, ctx.user.id))
      .limit(1);

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    return user;
  }),
});
