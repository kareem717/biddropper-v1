import { APIUpdateBidSchema } from "@/lib/validations/api/api-bids";
import { useMutation } from "react-query";

export const useFetchSingleBid = () => {
	return useMutation(({ id, bid }: { id: string; bid: APIUpdateBidSchema }) => {
		return fetch(`/api/bids/${id}`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(bid),
		});
	});
};