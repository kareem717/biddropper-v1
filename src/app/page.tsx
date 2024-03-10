import { buttonVariants } from "@/components/ui/button";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import CreateProjectForm from "@/components/app/deprecated/legacy/create-project";
import { api } from "@/lib/trpc/server";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { AppRouter } from "@/lib/server/root";
import { bids } from "@/lib/db/schema/tables/content";
import { getTableColumns } from "drizzle-orm";

type RouterOutput = inferRouterOutputs<AppRouter>;
export default async function Home() {
  const session = await getServerSession(authOptions);
  console.log(session?.user.ownedCompanies);

  const columnsMap = getTableColumns(bids);
  const columnNames = Object.keys(getTableColumns(bids));
  console.log(columnsMap, columnNames);

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
      <pre>{JSON.stringify(session, null, 2)}</pre>
    </main>
  );
}
