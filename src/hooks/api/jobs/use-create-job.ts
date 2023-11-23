import { APICreateJobSchema } from "@/lib/validations/api/api-job";
import { useMutation } from "react-query";

export const useCreateBid = () => {
	return useMutation((job: APICreateJobSchema) => {
		return fetch("/api/jobs", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(job),
		});
	});
};
