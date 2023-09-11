"use client";
import JobCard from "@/components/job-cards/small";
import { selectJobSchema } from "@/lib/validations/posts";
import React from "react";
import useSWR from "swr";
import { TypeOf } from "zod";

const fetcher = (url: string, fetchType: string) =>
	fetch(url, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			"Fetch-Type": fetchType,
		},
	}).then((res) => res.json());

export default function JobView() {
	const { data, error } = useSWR(["/api/posts/jobs/single", "card"], fetcher);

	if (error) return <div>failed to load</div>;
	if (!data) return <div>loading...</div>;

	const dataSchema = selectJobSchema.omit({
		createdAt: true,
		updatedAt: true,
		details: true,
	});

	const parsedData = data.map((job: any) => {
		const parse = dataSchema.safeParse(job);
		if (parse.success) {
			return parse.data;
		}
	});

	type Job = TypeOf<typeof dataSchema>;

	return (
		<div className="flex justify-center items-center w-screen my-12">
			<div className="flex flex-col gap-2">
				{data.map((job: Job) => (
					<JobCard key={job.id} {...job} />
				))}
			</div>
		</div>
	);
}
