import {
	APIFetchBidsSchema,
} from "@/lib/validations/api/api-bids";
import { useMutation } from "react-query";

export const useFetchBids = () => {
	return useMutation((options: APIFetchBidsSchema) => {
		return fetch(`/api/bids`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(options),
		});
	});
};
