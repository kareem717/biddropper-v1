"use client";
import { useTheme } from "next-themes";
import { Bar, BarChart, Line, LineChart, ResponsiveContainer } from "recharts";

import { useConfig } from "@/hooks/use-config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { themes } from "@/components/themes";
import { FC } from "react";
// import { industries } from "@/config/industries";
import BadgeTooltip from "../badge-tooltip";
import { timeHorizons } from "@/config/time-horizons";
import { propertyTypes } from "@/config/property-types";
import { Icons } from "../icons";
import Link from "next/link";
import useIndustries from "@/hooks/use-industries";

interface JobCardProps {
	id: string;
	industry: string;
	propertyType: string;
	timeHorizon: string;
	isActive?: boolean;
	isCommercialProperty?: boolean;
}

const JobCard: FC<JobCardProps> = ({
	id,
	industry,
	propertyType,
	timeHorizon,
	isActive,
	isCommercialProperty,
}) => {
	const timeFrame = timeHorizons.find((time) => time.value === timeHorizon);
	const propertyTypeLabel = propertyTypes.find(
		(property) => property.value === propertyType
	);

	const { industries, isLoading, isError } = useIndustries();
	
	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (isError) {
		return <div>Error loading industries</div>;
	}
	return (
		<Card className="group hover:bg-gray-700 hover:bg-opacity-10 ease-in-out w-full">
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-base font-bold hover:opacity-80 duration-200 ease-in-out cursor-pointer ">
					<Link href={`/job-view/${id}`}>
						{industries.find((i) => i.value === industry)?.label}
					</Link>
				</CardTitle>
			</CardHeader>
			<CardContent className="mt-4 flex  justify-between">
				<div className="flex flex-wrap gap-2 ">
					{isCommercialProperty ? (
						<BadgeTooltip
							className="hover:-translate-y-0.5 duration-300"
							tooltipProps={{
								delayDuration: 300,
							}}
							label="Commercial"
							tooltipContent={<p>This is a commercial property</p>}
						/>
					) : (
						<BadgeTooltip
							className="hover:-translate-y-0.5 duration-300"
							tooltipProps={{
								delayDuration: 300,
							}}
							label="Residential"
							tooltipContent={<p>This is a residential property</p>}
						/>
					)}
					{isActive ? (
						<BadgeTooltip
							className="hover:-translate-y-0.5 duration-300"
							tooltipProps={{
								delayDuration: 300,
							}}
							label="Active"
							tooltipContent={<p>This listing is active</p>}
						/>
					) : (
						<BadgeTooltip
							className="hover:-translate-y-0.5 duration-300"
							label="Inactive"
							tooltipProps={{
								delayDuration: 300,
							}}
							tooltipContent={<p>This listing is no longer active</p>}
						/>
					)}
					{timeFrame && (
						<BadgeTooltip
							className="hover:-translate-y-0.5 duration-300"
							tooltipProps={{
								delayDuration: 300,
							}}
							label={timeFrame.label}
							variant="secondary"
							tooltipContent={<p>{timeFrame.description}</p>}
						/>
					)}
					{propertyTypeLabel && (
						<BadgeTooltip
							className="hover:-translate-y-0.5 duration-300"
							tooltipProps={{
								delayDuration: 300,
							}}
							label={propertyTypeLabel.label}
							variant="secondary"
							tooltipContent={<p>{propertyTypeLabel.description}</p>}
						/>
					)}
				</div>
			</CardContent>
		</Card>
	);
};

export default JobCard;
