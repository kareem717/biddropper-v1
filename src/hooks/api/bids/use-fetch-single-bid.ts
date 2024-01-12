import { useMutation } from "react-query";

export const useFetchSingleBid = () => {
  return useMutation((id: string) => {
    return fetch(`/api/bids/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
  });
};
