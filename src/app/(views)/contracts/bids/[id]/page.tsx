import * as React from "react";
import { db } from "@/db";

import { eq, sql, and, inArray } from "drizzle-orm";

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
import ContractCard from "@/components/cards/contract-cards/big-contract-card";
import BidCard from "@/components/cards/bid-cards/bid-cards";

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

	const ownedCompanyIds = session.user.ownedCompanies.map(
		(company) => company.id
	);

	// If the user owns a company that has a job that is in a contract, then they can see the contract
	const allContractJobs = await db
		.select({ contracts })
		.from(jobs)
		.innerJoin(contractJobs, eq(contractJobs.jobId, jobs.id))
		.innerJoin(
			contracts,
			and(
				eq(contracts.id, contractJobs.contractId),
				eq(contracts.id, params.id)
			)
		)
		.innerJoin(companyJobs, eq(companyJobs.jobId, jobs.id))
		.innerJoin(
			companies,
			and(
				eq(companies.id, companyJobs.companyId),
				inArray(companies.id, ownedCompanyIds)
			)
		)
		.limit(1);

	if (allContractJobs.length === 0) {
		redirect("/");
	}

	// //TODO: save this as a userJobs view somehow
	// const userJobs = await db
	// 	.select({ jobs })
	// 	.from(companies)
	// 	.where(inArray(companies.id, ownedCompanyIds)) // sub out for user id if u want
	// 	.innerJoin(companyJobs, eq(companyJobs.companyId, companies.id))
	// 	.innerJoin(jobs, eq(jobs.id, companyJobs.jobId));

	// console.log("this======", allContractJobs);
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
			{allContractBids.map((bidObj) => {
				const bid = bidObj.bids;
				return (
					<BidCard
						key={bid.id}
						id={bid.id}
						price={bid.price}
						status={bid.status}
						createdAt={bid.createdAt as any}
						biddingCompanyId={bid.companyId}
						contractId={params.id}
					/>
				);
			})}
		</div>
	);
}
