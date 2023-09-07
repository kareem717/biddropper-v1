"use client";
import "mapbox-gl/dist/mapbox-gl.css";
import React from "react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";
import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BidButton from "@/components/job-bid-button";
import { selectJobSchema, selectMediaSchema } from "@/lib/validations/posts";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import BadgeTooltip from "@/components/badge-tooltip";
import { timeHorizons } from "@/config/time-horizons";
import { propertyTypes } from "@/config/property-types";
import { industries } from "@/config/industries";
import { toast } from "sonner";
import BigJobCard from "@/components/job-cards/big";
const fetcher = (url: string, id: string) =>
	fetch(url, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			"Job-ID": id,
		},
	}).then((res) => res.json());

export default function JobView({ params }: { params: { id: string } }) {
	const { data, error } = useSWR(["/api/posts/jobs", params.id[0]], fetcher);
	// TODO: Implement real image fetching, implement location fetching
	const images = [
		"https://images.unsplash.com/photo-1590004953392-5aba2e72269a?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&h=500&w=800&q=80",
		"https://images.unsplash.com/photo-1590004845575-cc18b13d1d0a?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&h=500&w=800&q=80",
		"https://images.unsplash.com/photo-1590004987778-bece5c9adab6?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&h=500&w=800&q=80",
		"https://images.unsplash.com/photo-1590005176489-db2e714711fc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&h=500&w=800&q=80",
	];

	if (error) return <div>failed to load</div>;
	if (!data)
		return (
			<div className="w-full h-screen  bg-cover relative xl:bg-bottom">
				<Skeleton className="sm:w-[min(80vw,1250px)] w-[95vw] h-[80vh] absolute right-1/2 top-1/4 translate-x-1/2 -translate-y-1/4" />
			</div>
		);

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
		<div className="w-full h-screen  bg-cover relative xl:bg-bottom">
			<BigJobCard
				title={industries.find((i) => i.value === job.industry)?.label as any}
				details={job.details}
				lat={12}
				images={images}
				lng={12}
				timeHorizon={timeFrame as any}
				propertyType={propertyType as any}
				isCommercialProperty={job.isCommercialProperty}
				isActive={job.isActive}
				className="sm:w-[min(80vw,1250px)] w-[95vw]  bg-background absolute right-1/2 top-1/4 translate-x-1/2 -translate-y-1/4"
				scrollAreaProps={{
					className: "max-h-[70vh]",
				}}
				cardContentProps={{
					className:
						"flex flex-col md:flex-row h-[70vh] w-full items-center justify-between md:space-x-6",
				}}
			/>
		</div>
	);
}
