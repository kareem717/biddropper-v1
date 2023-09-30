"use client";
import "mapbox-gl/dist/mapbox-gl.css";
import React, { ComponentPropsWithoutRef, FC } from "react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BidButton from "@/components/bid-button";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import BadgeTooltip from "@/components/badge-tooltip";
import { timeHorizons } from "@/config/time-horizons";
import { propertyTypes } from "@/config/property-types";
import { toast } from "sonner";

const ImageSlider = dynamic(() => import("@/components/image-slider"), {
	loading: () => <Skeleton className="rounded-md border overflow-hidden" />,
	ssr: false,
});
//todO: bid button is hard coded atm
const JobMap = dynamic(() => import("@/components/maps/job-map"), {
	loading: () => (
		<Skeleton className="w-full h-[30vh] md:h-full rounded-md border" />
	),
	ssr: false,
});

interface JobCardProps extends ComponentPropsWithoutRef<typeof Card> {
	id: string;
	companies:
		| {
				id: string;
				name: string;
		  }[]
		| string;
	title: string;
	details: string;
	lng: number;
	lat: number;
	images?: string[];
	zoom?: number;
	isCommercialProperty?: boolean;
	isActive?: boolean;
	timeHorizon?: {
		label: string;
		value: string;
		description: string;
	};
	propertyType?: {
		label: string;
		value: string;
		description: string;
	};
	scrollAreaProps?: ComponentPropsWithoutRef<typeof ScrollArea>;
	cardContentProps?: ComponentPropsWithoutRef<typeof CardContent>;
}

const JobCard: FC<JobCardProps> = ({
	id,
	companies,
	title,
	images,
	timeHorizon,
	details,
	isCommercialProperty,
	isActive,
	propertyType,
	lng,
	lat,
	zoom,
	scrollAreaProps,
	cardContentProps,
	...props
}) => {
	return (
		// <div className="w-full h-screen  bg-cover relative xl:bg-bottom">
		//className="sm:w-[min(80vw,1250px)] w-[95vw]  bg-background absolute right-1/2 top-1/4 translate-x-1/2 -translate-y-1/4"
		<Card {...props}>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				{/* className="max-h-[70vh]"b  */}
			</CardHeader>

			<ScrollArea {...scrollAreaProps}>
				{/* //className="flex flex-col md:flex-row h-[70vh] w-full items-center justify-between md:space-x-6" */}
				<CardContent {...cardContentProps}>
					<div
						className={cn(
							"h-full md:w-[50%] rounded-md grid gap-4",
							images ? "grid-rows-2" : "grid-rows-1"
						)}
					>
						{images && (
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
								{details}
							</ScrollArea>
						</div>
					</div>
					<Separator orientation="vertical" className="hidden md:block" />
					<Separator className="my-4 md:hidden" />
					<div className="h-full md:w-[50%] w-full rounded-md  flex flex-col">
						{
							<JobMap
								className="w-full rounded-md border h-[30vh] md:h-full"
								zoom={zoom || 15}
								lng={lng}
								lat={lat}
							/>
						}

						<div className="mt-4 flex flex-wrap gap-2 ">
							{isCommercialProperty ? (
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
							{isActive ? (
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
							{timeHorizon && (
								<BadgeTooltip
									label={timeHorizon.label}
									variant="secondary"
									tooltipContent={<p>{timeHorizon.description}</p>}
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
							<BidButton jobId={id} companies={companies} className="w-full" />
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
		// </div>
	);
};

export default JobCard;
