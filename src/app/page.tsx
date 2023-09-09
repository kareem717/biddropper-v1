import CreateJobDialog from "@/components/forms/create-job";
import { buttonVariants } from "@/components/ui/button";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
export default async function Home() {
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
