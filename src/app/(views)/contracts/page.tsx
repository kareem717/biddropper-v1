"use client";
import * as React from "react";
import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";
import { useFetchContracts } from "@/hooks/api/contracts/use-fetch-contracts";
import ContractCard from "@/components/cards/contract-cards/small";
import createContractListStore from "@/hooks/use-contract-list";

export const ContractPage = () => {
	const session = useSession();
	const [contractId, setContractId] = React.useState("");

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

	React.useEffect(() => {
		if (contracts?.pages[0]?.data[0]?.id) {
			setContractId(contracts.pages[0].data[0].id);
		}
	}, [contracts]);

	const useContractListStore = createContractListStore(contractId);
	const {selected, select} = useContractListStore();

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (isError) {
		return <div>Error</div>;
	}
	console.log(selected, select)

	return (
		<div>
			{contracts?.pages.map((page, _index) => {
				return page.data.map((contract) => {
					console.log(contract.createdAt);
					return (
						<div key={contract.id}>
							<ContractCard
								id={contract.id}
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
	);
};

export default ContractPage;
