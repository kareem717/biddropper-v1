import BidCard from "@/components/bid-cards";
import { db } from "@/db";
import {
	companies,
	companyJobs,
	contractBids,
	contractJobs,
	contracts,
	bids,
} from "@/db/migrations/schema";
import { authOptions } from "@/lib/auth";
import { eq, inArray } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function Dashboard() {
	const session = await getServerSession(authOptions);
	if (!session) {
		redirect("/");
	}
	const companyIds = session.user.ownedCompanies.map((company) => company.id);

	// get all companies,
	// where id = companyId,
	// get all the jobs that belong to the company
	// get all the contracts that include those jobs,
	// get all the bids that belong to those contracts
	const companyBids = await db
		.select({ companies, contracts, contractBids, bids })
		.from(companies)
		.where(inArray(companies.id, companyIds))
		.innerJoin(companyJobs, eq(companyJobs.companyId, companies.id))
		.innerJoin(contractJobs, eq(contractJobs.jobId, companyJobs.jobId))
		.innerJoin(contracts, eq(contracts.id, contractJobs.contractId))
		.innerJoin(contractBids, eq(contractBids.contractId, contracts.id))
		.innerJoin(bids, eq(bids.id, contractBids.bidId));

	const contractBidsClean = companyBids.reduce((output, currRow) => {
		const company = currRow.companies;
		const contract = currRow.contracts;
		const bid = currRow.bids;
		if (!output[company.id]) {
			output[company.id] = {
				...company,
				contracts: [
					{
						...contract,
						bids: [
							{
								...bid,
							},
						],
					},
				],
			};
		} else {
			const existingContract = output[company.id].contracts.find(
				(contract: { id: string }) => contract.id === currRow.contracts.id
			);
			if (!existingContract) {
				output[company.id].contracts.push({
					...contract,
					bids: [
						{
							...bid,
						},
					],
				});
			} else {
				existingContract.bids.push({
					...bid,
				});
			}
		}

		return output;
	}, {} as Record<string, any>);

	// console.log(Object.values(contractBidsClean));

	const allContracts = Object.values(contractBidsClean).map((company) => {
		// console.log(company.contracts);
		company.contracts.map((contract: any) => {
      console.log(contract.bids);
		});
	});
	console.log(allContracts);
	return (
		<>

			sdsd
		</>
	);
}
