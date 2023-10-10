import { APIAcceptBidQuerySchema } from "@/lib/validations/api/api-bid";
import { useMutation } from "react-query";

export const useAcceptBid = () => {
	return useMutation(
		({ bidId, jobId, contractId }: APIAcceptBidQuerySchema) => {
			if (!jobId && !contractId) {
				throw new Error("Either 'jobId' or 'contractId' must be provided");
			}
			if (jobId && contractId) {
				throw new Error("Only one of 'jobId' or 'contractId' can be provided");
			}

			const queryParam = jobId ? `jobId=${jobId}` : `contractId=${contractId}`;
			return fetch(`/api/bids/${bidId}?accept=true&${queryParam}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
			});
		}
	);
};
