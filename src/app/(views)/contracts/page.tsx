import * as React from "react";
import { db } from "@/db";
import {
	contractJobs,
	contracts,
	companies,
	companyJobs,
	jobs,
	contractBids,
} from "@/db/migrations/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import BidButton from "@/components/bid-button";
import ContractCard from "@/components/contract-cards/small";
//TODO: can thus be cone with zustand/react-query?
export default async function ContractPage() {
	const session = await getServerSession(authOptions);

	if (!session || !session.user.ownedCompanies) {
		redirect("/");
	}

	const companyOptions = session.user.ownedCompanies.map((company) => {
		return {
			id: company.id,
			name: company.name,
		};
	});

	//* Boy oh boy what a W query
	const data = await db
		.select({
			contracts,
			//! bruh i just realized this isnt nessesary cause im reducing it anyways bruh
			jobs_per_contract: sql`(
				SELECT COUNT(*)
				FROM ${contractJobs}
				WHERE ${contractJobs.contractId} = ${contracts.id}
			)`,
			bids_per_contract: sql`(
				SELECT COUNT(*)
				FROM ${contractBids}
				WHERE ${contractBids.contractId} = ${contracts.id}
			)`,
			companies_in_contract: sql`(
				(SELECT count(DISTINCT ${companies.id}))
			)`,
		})
		.from(companies)
		.where(eq(companies.ownerId, session.user.id))
		.innerJoin(companyJobs, eq(companyJobs.companyId, companies.id))
		.innerJoin(jobs, eq(jobs.id, companyJobs.jobId))
		.innerJoin(contractJobs, eq(contractJobs.jobId, jobs.id))
		.innerJoin(contracts, eq(contracts.id, contractJobs.contractId))
		.groupBy(contracts.id, jobs.id, companies.id);

	console.log(data);

	const cleanData = data.reduce((output, currRow) => {
		const currentContract = currRow.contracts;

		if (!output[currentContract.id]) {
			output[currentContract.id] = {
				...currentContract,
				totalJobs: Number(currRow.jobs_per_contract),
				totalBids: Number(currRow.bids_per_contract),
			};
		}

		return output;
	}, {} as Record<string, any>);

	return (
		<main>
			<div className="flex grow">
				<div className="mx-auto flex max-w-7xl grow flex-col bg-white py-6 text-black">
					<div className="flex grow flex-col">
						{/* //TODO: make this a lazy loaded component */}
						<ul className="flex  w-full flex-col items-center justify-center gap-5 overflow-y-auto p-6 md:grid md:grid-cols-2 lg:grid-cols-3">
							{Object.values(cleanData).map((contract) => {
								return (
									<li
										key={contract.id}
										className="w-full flex flex-col items-center justify-center gap-2"
									>
										<ContractCard
											id={contract.id}
											title={contract.title}
											isActive={contract.isActive}
											price={contract.price}
											companiesInContract={contract.companies_in_contract}
											endDate={contract.endDate}
											totalJobs={contract.totalJobs}
											totalBids={contract.totalBids}
											createdAt={contract.createdAt}
										/>
									</li>
								);
							})}
						</ul>
						{/* <BidButton
							jobId={"job_5e2102b5-c3ba-4d97-ad4e-e1ac54e16c7e"}
							companies={companyOptions}
						/>
						<BidButton
							contractId={"cntr_7289948b-69b4-4def-970f-36999ffd3456"}
							companies={companyOptions}
						/> */}
					</div>
				</div>
			</div>
		</main>
	);
}
