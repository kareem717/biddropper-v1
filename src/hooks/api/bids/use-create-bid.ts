import { APICreateBidSchema } from "@/lib/validations/api/api-bid";
import { useMutation } from "react-query";

export const useCreateBid = () => {
	return useMutation((bid: APICreateBidSchema) => {
		return fetch("/api/bids", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(bid),
		});
	});
};
