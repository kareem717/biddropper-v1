import { buttonVariants } from "@/components/shadcn/ui/button";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import CreateProjectForm from "@/components/forms/legacy/create-project";
import { api } from "@/trpc/server";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { AppRouter } from "@/server/api/root";
import { bids } from "@/server/db/schema/tables/content";
import { getTableColumns } from "drizzle-orm";

type RouterOutput = inferRouterOutputs<AppRouter>;
export default async function Home() {
  const session = await getServerSession(authOptions);
  console.log(session?.user.ownedCompanies);
  // const test = await api.bid.deleteBid.mutate({
  //   // price: 1000023,
  //   // note: "test 23",
  //   bidId: "1df98a6b-4687-4b11-a5fa-a4bc8e48e418",
  // });
  // console.log(getUserBidsInput.safeParse({userId: "1"}))
  const columnsMap = getTableColumns(bids);
  const columnNames = Object.keys(getTableColumns(bids));
  console.log(columnsMap, columnNames);
  const test = await api.bid.getUserBids.query({
    id: "66afe62a-176a-4886-9606-038e1dfa4896",
    isActive: [true, false],
    status: ["pending", "accepted", "declined", "retracted"],
    orderBy: [
      {
        columnName: "price",
        order: "asc",
      },
      {
        columnName: "note",
        order: "desc",
      },
    ],
    // cursor: [
    //   {
    //     columnName: "id",
    //     value: 'fce03c73-45fe-4fca-997f-cada1b63c3a1',
    //   },
    // ],
  });

  //TODO: cursor not woring
  console.log(test);
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
