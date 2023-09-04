"use client";
import "mapbox-gl/dist/mapbox-gl.css";
import React from "react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";
import useSWR from "swr";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import BidButton from "@/components/bid-button";
import { selectJobSchema, selectMediaSchema } from "@/lib/validations/posts";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import BadgeTooltip from "@/components/badge-tooltip";
import { timeHorizons } from "@/config/time-horizons";
import { propertyTypes } from "@/config/property-types";
import { industries } from "@/config/industries";
import { toast } from "sonner";

const fetcher = (url: string, id: string) =>
	fetch(url, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			"Job-ID": id,
		},
	}).then((res) => res.json());

const ImageSlider = dynamic(() => import("@/components/image-slider"), {
	loading: () => <Skeleton className="rounded-md border overflow-hidden" />,
	ssr: false,
});

const JobMap = dynamic(() => import("@/components/job-map"), {
	loading: () => (
		<Skeleton className="w-full h-[30vh] md:h-full rounded-md border" />
	),
	ssr: false,
});

export default function JobView({ params }: { params: { id: string } }) {
	const { data, error } = useSWR(["/api/posts/jobs", params.id[0]], fetcher);

	const images = [
		"https://images.unsplash.com/photo-1590004953392-5aba2e72269a?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&h=500&w=800&q=80",
		"https://images.unsplash.com/photo-1590004845575-cc18b13d1d0a?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&h=500&w=800&q=80",
		"https://images.unsplash.com/photo-1590004987778-bece5c9adab6?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&h=500&w=800&q=80",
		"https://images.unsplash.com/photo-1590005176489-db2e714711fc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&h=500&w=800&q=80",
	];

	if (error) return <div>failed to load</div>;
	if (!data) return <div>loading...</div>;

	const jobSchema = selectJobSchema.extend({
		media: z.array(selectMediaSchema).nullable(),
	});

	const job = jobSchema.parse({ ...data[0].jobs, media: data[0].media });

	const jobHasPhotos = true; //job.media && job.media.length > 0;
	const timeFrame = timeHorizons.find((time) => time.value === job.timeHorizon);
	const propertyType = propertyTypes.find(
		(property) => property.value === job.propertyType
	);

	return (
		<div className="w-full h-screen bg-[url('/images/blob-scene.svg')] bg-cover relative xl:bg-bottom">
			<Card className="sm:w-[min(80vw,1250px)] w-[95vw]  bg-background absolute right-1/2 top-1/4 translate-x-1/2 -translate-y-1/4">
				<CardHeader>
					<CardTitle>
						{
							industries.find((industry) => industry.value === job.industry)
								?.label
						}
					</CardTitle>
				</CardHeader>
				<ScrollArea className="max-h-[70vh]">
					<CardContent className="flex flex-col md:flex-row h-[70vh] w-full items-center justify-between md:space-x-6 ">
						<div
							className={cn(
								"h-full md:w-[50%] rounded-md grid gap-4",
								jobHasPhotos ? "grid-rows-2" : "grid-rows-1"
							)}
						>
							{jobHasPhotos && (
								<ImageSlider
									images={images}
									className="rounded-md border overflow-hidden"
									swiperProps={{
										className: "w-full h-full",
									}}
								/>
							)}
							<div className="flex flex-col gap-2">
								<Label htmlFor="job-details">
									<span>Job Details</span>
								</Label>
								<ScrollArea
									className="rounded-md border p-4 h-full"
									id="job-details"
								>
									{job.details}
								</ScrollArea>
							</div>
						</div>
						<Separator orientation="vertical" className="hidden md:block" />
						<Separator className="my-4 md:hidden" />
						<div className="h-full md:w-[50%] w-full rounded-md  flex flex-col">
							{
								<JobMap
									className="w-full rounded-md border h-[30vh] md:h-full"
									zoom={15}
									lng={-79.1536063}
									lat={44.0433684}
								/>
							}

							<div className="mt-4 flex flex-wrap md:flex-row gap-2 ">
								{job.isCommercialProperty ? (
									<BadgeTooltip
										label="Commercial"
										tooltipContent={<p>This is a commercial property</p>}
									/>
								) : (
									<BadgeTooltip
										label="Residential"
										tooltipContent={<p>This is a residential property</p>}
									/>
								)}
								{job.isActive ? (
									<BadgeTooltip
										label="Active"
										tooltipContent={<p>This listing is active</p>}
									/>
								) : (
									<BadgeTooltip
										label="Inactive"
										tooltipContent={<p>This listing is no longer active</p>}
									/>
								)}
								{timeFrame && (
									<BadgeTooltip
										label={timeFrame.label}
										variant="secondary"
										tooltipContent={<p>{timeFrame.description}</p>}
									/>
								)}
								{propertyType && (
									<BadgeTooltip
										label={propertyType.label}
										variant="secondary"
										tooltipContent={<p>{propertyType.description}</p>}
									/>
								)}
							</div>
							<Separator className="my-4 hidden md:block" />
							<div className="flex flex-row gap-2 mt-4 md:mt-0">
								<BidButton
									jobId="job_58556711-6f83-4bf1-8607-b8284cdfa862"
									className="w-full"
								/>
								<Button
									className="w-full"
									onClick={(e) => {
										toast.error("This feature is not yet implemented");
									}}
								>
									Request More Info
								</Button>
							</div>
						</div>
					</CardContent>
				</ScrollArea>
			</Card>
		</div>
	);
}
