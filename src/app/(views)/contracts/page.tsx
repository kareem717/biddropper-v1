"use client";

import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";
import { useFetchContracts } from "@/hooks/api/contracts/use-fetch-contracts";
import SmallContractCard from "@/components/cards/contract-cards/small";
import BigContractCard from "@/components/cards/contract-cards/big";
import { useEffect, useState } from "react";

export const ContractPage = () => {
	const session = useSession();
	const [selectedContractId, selectContractId] = useState("");

	if (!session) {
		redirect("/");
	}

	const companyOptions = session.data?.user.ownedCompanies.map((company) => {
		return {
			id: company.id,
			name: company.name,
		};
	});

	const contractData = useFetchContracts({
		limit: 25,
		fetchType: "simple",
	});

	const {
		data: contracts,
		isLoading,
		isError,
		fetchNextPage,
		isFetchingNextPage,
		hasNextPage,
	} = contractData;

	useEffect(() => {
		if (contracts?.pages[0]?.data[0]?.id) {
			selectContractId(contracts.pages[0].data[0].id);
		}
	}, [contracts]);

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (isError) {
		return <div>Error</div>;
	}

	return (
		<div className="grid grid-rows-1 grid-cols-2">
			<div>
				{contracts?.pages.map((page, _index) => {
					return page.data.map((contract) => {
						console.log(contract);
						return (
							<div key={contract.id}>
								<SmallContractCard
									id={contract.id}
									details={contract.description}
									title={contract.title}
									isActive={contract.isActive}
									price={contract.price}
									endDate={contract.endDate}
									createdAt={new Date(Date.parse(contract.createdAt))}
									totalJobs={contract.jobCount}
									totalBids={contract.bidCount}
									companiesInContract={contract.companyCount}
								/>
							</div>
						);
					});
				})}
				<button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
					{isFetchingNextPage
						? "Loading more..."
						: hasNextPage
						? "Load More"
						: "Nothing to load"}
				</button>
			</div>
			<div>
				<BigContractCard 
					id={selectedContractId}
				/>
			</div>
		</div>
	);
};

export default ContractPage;
