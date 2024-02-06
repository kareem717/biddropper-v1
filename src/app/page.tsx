import { buttonVariants } from "@/components/ui/button";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import CreateProjectForm from "@/components/forms/create-project";
import { api } from "@/trpc/server";

export default async function Home() {
  const res = await api.post.getSecretMessage.query({});

  console.log(res);
  const session = await getServerSession(authOptions);
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
