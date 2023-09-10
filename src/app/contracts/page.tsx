import * as React from "react";
import { db } from "@/db";
import {
	contractJobs,
	contracts,
	companies,
	companyJobs,
	jobs,
} from "@/db/migrations/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import BidButton from "@/components/bid-button";
//TODO: can thus be cone with zustand/react-query?
export default async function ContractPage() {
	const session = await getServerSession(authOptions);

	if (!session || !session.user.ownedCompanies) {
		redirect("/");
	}
	// Select the companies that the user owns
	// Select the jobs that belong to those companies
	// Select the contracts include those jobs
	const data = await db
		.select({
			contracts,
			jobs,
		})
		.from(companies)
		.where(eq(companies.ownerId, session.user.id))
		.innerJoin(companyJobs, eq(companyJobs.companyId, companies.id))
		.innerJoin(jobs, eq(jobs.id, companyJobs.jobId))
		.innerJoin(contractJobs, eq(contractJobs.jobId, jobs.id))
		.innerJoin(contracts, eq(contracts.id, contractJobs.contractId));

	//Keep this view
	const cleanContracts = data.reduce((final, current) => {
		const currentContract = current.contracts;
		const currentJob = current.jobs;
		if (!final[currentContract.id]) {
			final[currentContract.id] = {
				...currentContract,
				jobs: [
					{
						...currentJob,
					},
				],
			};
		} else {
			final[currentContract.id].jobs.push({
				...currentJob,
			});
		}
		return final;
	}, {} as Record<string, any>);

	console.log(cleanContracts);

	return (
		<main>
			<div className="flex grow">
				<div className="mx-auto flex max-w-7xl grow flex-col bg-white py-6 text-black">
					<div className="flex grow flex-col">
						{/* <ul className="flex  w-full flex-col items-center justify-center gap-5 overflow-y-auto p-6 md:grid md:grid-cols-2 lg:grid-cols-3"></ul> */}
						<BidButton
							jobId={"job_5e2102b5-c3ba-4d97-ad4e-e1ac54e16c7e"}
							companyId={"comp_64b989bc-aeea-4670-a27f-e044e86f8da6"}
						/>
						<BidButton
							contractId={"cntr_7289948b-69b4-4def-970f-36999ffd3456"}
							companyId={"comp_64b989bc-aeea-4670-a27f-e044e86f8da6"}
						/>
					</div>
				</div>
			</div>
		</main>
	);
}
