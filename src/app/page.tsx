import { buttonVariants } from "@/components/ui/button";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import CreateProjectForm from "@/components/forms/create-project";
import { api } from "@/trpc/server";

export default async function Home() {
  const session = await getServerSession(authOptions);
  const test = await api.bid.createJobBid.mutate({
    price: 100000,
    note: "test",
    jobId: "63f14ebc-ce35-4bb6-b657-616fbd4df863",
    companyId: "1a50b6f5-cc08-4b0a-9e3f-d3f0b39a11dd",
  });

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
