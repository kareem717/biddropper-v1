import { APIFetchContractsQuery } from "@/lib/validations/api/api-contract";
import { useInfiniteQuery } from "react-query";

export const useFetchContracts = (options: APIFetchContractsQuery) => {
	return useInfiniteQuery(
		["contracts", options],
		async ({ pageParam = options }) => {
			const params = new URLSearchParams(pageParam as any);
			const res = await fetch(`/api/contracts?${params.toString()}`, {
				method: "GET",
			});

			if (!res.ok) {
				throw new Error("Error fetching contracts.");
			}

			return await res.json();
		},
		{
			keepPreviousData: true,
			getNextPageParam: (lastPage, _pages) => {
				if (lastPage.nextCursor) {
					return {
						...options,
						cursor: lastPage.nextCursor,
					};
				}
			},
		}
	);
};
