import { buttonVariants } from "@/components/ui/button";
import {  validateRequest } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { api } from "@/lib/trpc/server";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { AppRouter } from "@/lib/server/root";
import { bids } from "@/lib/db/schema/tables/content";
import { getTableColumns } from "drizzle-orm";

type RouterOutput = inferRouterOutputs<AppRouter>;
export default async function Home() {
  const session = await validateRequest();

  const user = await api.auth.getFullUser.query();

  return (
    <main>
      <div className="flex flex-row gap-4 pt-[60px]">
        <a href="/contracts" className={buttonVariants()}>
          Contracts
        </a>

        <a href="/company" className={buttonVariants()}>
          Company
        </a>

        <a href="/create-job" className={buttonVariants()}>
          Create Job
        </a>
        <a href="/job-view" className={buttonVariants()}>
          job view
        </a>
      </div>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </main>
  );
}
