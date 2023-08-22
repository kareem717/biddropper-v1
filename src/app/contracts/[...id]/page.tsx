import * as React from "react";
import * as z from "zod";
import { env } from "@/env.mjs";
import {
	selectBundleSchema,
	selectJobSchema,
	selectBidsSchema,
	selectBundleMediaSchema,
} from "@/lib/validations/posts";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { selectAddressSchema } from "@/lib/validations/address";
import ImageCarousel from "@/components/image-carousel";

import { industries } from "@/config/industries";
import JobCard from "@/components/job-card";

//todo: idk if this is the best way to do this, but i think it is
export const revalidate = 5;

export default async function ContractPage({
	params,
}: {
	params: { id: string };
}) {
	const res = await fetch(`${env["NEXT_PUBLIC_APP_URL"]}/api/posts/bundles`, {
		method: "GET",
		headers: {
			"Contract-ID": params.id,
		},
	});

	const contractSchema = z.object({
		bundles: selectBundleSchema,
		jobs: z.array(selectJobSchema),
		addresses: selectAddressSchema,
		bundleMedia: z.array(selectBundleMediaSchema).optional(),
		bids: z.array(selectBidsSchema).optional(),
	});

	console.log("Response:", res);
	// cons
	const bundleParse = await contractSchema.safeParseAsync(
		(
			await res.json()
		)[params.id]
	);

	if (!bundleParse.success) {
		console.log("Error:", bundleParse.error);
		return <div>Error</div>;
	}

	const bundle = bundleParse.data;
	const imageUrls = bundle.bundleMedia?.map((media) => media.mediaUrl) ?? [];

	const totalBudget = bundle.jobs.reduce(
		(acc, job) => acc + Number(job.budget),
		0
	);

	function getPriceRange(num: number) {
		return num < 1000
			? "<1K"
			: num < 10000
			? "1K - 10K"
			: num < 100000
			? "10K - 100K"
			: num < 1000000
			? "100K - 1M"
			: "1M+";
	}
	const budgetRange = getPriceRange(totalBudget);

	return (
		<main className="flex">
			<div className="flex-1">
				{/* TODO: need to let loding version stay until component is fully ready, because teh transition dosen't go into affect until u wait like 5 seconds or so */}
				{/* TODO add a map for address and a contact button */}
				<ImageCarousel slides={imageUrls} className="mx-2" />
				<div className="mx-2">
					<div className="space-y-2">
						<h1 className="capitalize text-sm sm:text-xl lg:text-2xl mt-2">
							{bundle.bundles.title}
						</h1>
						<div className="space-x-2">
							<span className="inline-flex items-center rounded-md bg-green-100 px-2.5 py-0.5 text-sm font-medium capitalize text-green-800">
								${budgetRange}
							</span>
							{bundle.bundles.bundleType === "contractor-wanted" ? (
								<span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-0.5 text-sm font-medium capitalize text-gray-800">
									Contractor Wanted
								</span>
							) : (
								<span className="inline-flex items-center rounded-md bg-purple-100 px-2.5 py-0.5 text-sm font-medium capitalize text-purple-800">
									Subcontractors Needed
								</span>
							)}
							{bundle.bundles.posterType === "business-owner" ? (
								<span className="inline-flex items-center rounded-md bg-orange-100 px-2.5 py-0.5 text-sm font-medium capitalize text-orange-800">
									Business Owner
								</span>
							) : (
								<span className="inline-flex items-center rounded-md bg-yellow-100 px-2.5 py-0.5 text-sm font-medium capitalize text-yellow-800">
									Individual Owner
								</span>
							)}
						</div>
					</div>
					<Separator className="my-4" />
					<p>
						{bundle.bundles.description}
					</p>
				</div>
			</div>
			<div className="flex-1 h-[100vh] overflow-auto relative px-2 pb-2">
				<div className="fixed bg-background h-12 bg-cover w-[50vw] flex items-center justify-center">
					<h1 className="text-[max(4vh,30px)] font-semibold ">
						Avaliable Jobs
					</h1>
				</div>
				<div className=" mt-14">
					<ul className="space-y-2">
						{bundle.jobs.map((job) => {
							if (job.isActive) {
								let dateRange;
								if (job.dateTo) {
									dateRange = `${format(
										new Date(job.dateFrom),
										"MMM d"
									)} - ${format(new Date(job.dateTo), "MMM d")}`;
								} else {
									//format to mmm d year
									dateRange = `${format(new Date(job.dateFrom), "MMM do, Y")}`;
								}
								return (
									<li key={job.id}>
										<JobCard
											id={job.id}
											title={job.title}
											summary={job.summary}
											date={dateRange}
											propertyType={job.propertyType}
											industry={
												industries.find(
													(industry) => industry.value === job.industry
												)?.label || "N/A"
											}
											budgetRange={getPriceRange(Number(job.budget))}
										/>
									</li>
								);
							}
						})}
					</ul>
				</div>
			</div>
		</main>
	);
}
