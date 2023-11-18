import * as React from "react";
import { db } from "@/db";

import { eq, sql, and } from "drizzle-orm";

import {
	contractJobs,
	contracts,
	companies,
	companyJobs,
	jobs,
	contractBids,
	bids,
} from "@/db/migrations/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ContractCard from "@/components/cards/contract-cards/big";

//todo: idk if this is the best way to do this, but i think it is
export const revalidate = 5;

export default async function ContractPage({
	params,
}: {
	params: { id: string };
}) {
	const session = await getServerSession(authOptions);

	if (!session || !session.user.ownedCompanies) {
		redirect("/");
	}
	const data = await db
		.select({
			contracts,
			jobs,
			companies,
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
		.innerJoin(
			contracts,
			and(
				eq(contracts.id, contractJobs.contractId),
				eq(contracts.id, params.id)
			)
		)
		.groupBy(contracts.id, jobs.id, companies.id);

	console.log(data);

	const cleanData = data.reduce((output, currRow) => {
		const currentContract = currRow.contracts;

		if (!output[currentContract.id]) {
			output[currentContract.id] = {
				...currentContract,
				jobs: [
					{
						...currRow.jobs,
					},
				],
				totalJobs: Number(currRow.jobs_per_contract),
				totalBids: Number(currRow.bids_per_contract),
				companyStakes: [{ name: currRow.companies.name, value: 1 }],
			};
		} else {
			output[currentContract.id].jobs.push({
				...currRow.jobs,
			});

			// If the company is already in the company stakes array, add one share to it
			const companyIndex = output[currentContract.id].companyStakes.findIndex(
				(company: { name: string }) => company.name === currRow.companies.name
			);

			if (companyIndex !== -1) {
				output[currentContract.id].companyStakes[companyIndex].value += 1;
			}

			// If the company is not in the company stakes array, add it
			if (companyIndex === -1) {
				output[currentContract.id].companyStakes.push({
					name: currRow.companies.name,
					value: 1,
				});
			}
		}

		return output;
	}, {} as Record<string, any>);

	console.log(cleanData);

	const allContractBids = await db
		.select({
			bids,
		})
		.from(contractBids)
		.where(eq(contractBids.contractId, params.id))
		.innerJoin(bids, eq(bids.id, contractBids.bidId));

	console.log(allContractBids);

	return (
		<div className="w-full h-screen bg-[url('/images/wave.svg')] bg-cover relative xl:bg-bottom">
			{cleanData &&
				Object.values(cleanData).map((contract: any) => (
					<ContractCard
						companies={session.user.ownedCompanies}
						key={contract.id}
						id={contract.id}
						description={contract.description}
						title={contract.title}
						price={contract.price}
						endDate={contract.endDate}
						totalJobs={contract.totalJobs}
						totalBids={contract.totalBids}
						createdAt={contract.createdAt}
						companyStakes={contract.companyStakes}
						jobs={contract.jobs}
						className="sm:w-[min(80vw,1000px)] w-[95vw] bg-background absolute right-1/2 top-1/4 translate-x-1/2 -translate-y-1/4"
					/>
				))}
		</div>
	);
}
