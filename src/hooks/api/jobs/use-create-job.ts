import { APIPatchCreateJobParams } from "@/lib/validations/api/(content)/jobs/request";
import { useMutation } from "react-query";

export const useCreateJob = () => {
  return useMutation(async (job: APIPatchCreateJobParams) => {
    const res = await fetch("/api/jobs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(job),
    });

    return res.json();
  });
};
