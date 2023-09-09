import { redirect } from "next/navigation";
import CreateContractForm from "@/components/forms/create-contract";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { env } from "@/env.mjs";
import { selectJobSchema } from "@/lib/validations/posts";
import { z } from "zod";
import { selectCompananyJobsSchema } from "@/lib/validations/companies";

export default async function CreateContractPage() {
	const session = await getServerSession(authOptions);

	if (!session) {
		redirect("/sign-in");
	}

	const userId = session.user.id;
	console.log(userId)
	const companyIds = session.user.ownedCompanies.map((company) => {
		return {
			id: company.id,
			name: company.name,
		};
	});

	const res = await fetch(`${env.NEXT_PUBLIC_APP_URL}/api/posts/jobs/`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			"Owner-Id": userId,
		},
	});

	const jobs = await res.json();
console.log(jobs)

const parsedJobs = selectCompananyJobsSchema.parse(jobs);
console.log(parsedJobs)
	return (
		<div className="w-full h-screen bg-[url('/images/wave.svg')] bg-cover relative xl:bg-bottom">
			<CreateContractForm jobs={jobs} userId={userId} className="sm:w-[min(80vw,1000px)] w-[95vw] bg-background absolute right-1/2 top-1/4 translate-x-1/2 -translate-y-1/4" />
		</div>
	);
}
