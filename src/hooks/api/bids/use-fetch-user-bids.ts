import { APIGetUserBidsParams } from "@/lib/validations/api/(content)/bids/user/request";
import { useInfiniteQuery } from "react-query";

export const useFetchUserBids = (options: APIGetUserBidsParams) => {
  return useInfiniteQuery(
    ["bids", options],
    async ({
      pageParam = options,
    }) => {
      console.log(options);
      const params = new URLSearchParams(pageParam as any);
      console.log(params);
      console.log(`/api/bids/user?${params.toString()}`);
      const res = await fetch(`/api/bids/user?${params.toString()}`, {
        method: "GET",
      });

      console.log(res);

      if (!res.ok) {
        throw new Error("Error fetching user bids.");
      }

      return await res.json();
    },
    {
      keepPreviousData: true,
      getNextPageParam: (lastPage, _pages) => {
        if (lastPage.cursor) {
          return {
            ...options,
            cursor: lastPage.cursor,
          };
        }
      },
    },
  );
};
