"use client";
import { useTheme } from "next-themes";
import { Bar, BarChart, Line, LineChart, ResponsiveContainer } from "recharts";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/ui/card";
import { FC } from "react";
import BadgeTooltip from "../../badge-tooltip";
import { timeHorizons } from "@/config/time-horizons";
import { propertyTypes } from "@/config/property-types";
import Link from "next/link";
import { api } from "@/trpc/react";

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
    (property) => property.value === propertyType,
  );

  const {
    data: industries,
    isLoading,
    isError,
  } = api.industry.getIndustries.useQuery();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error loading industries</div>;
  }
  return (
    <Card className="group w-full ease-in-out hover:bg-gray-700 hover:bg-opacity-10">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="cursor-pointer text-base font-bold duration-200 ease-in-out hover:opacity-80 ">
          <Link href={`/job-view/${id}`}>
            {industries.find((i) => i.value === industry)?.label}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="mt-4 flex  justify-between">
        <div className="flex flex-wrap gap-2 ">
          {isCommercialProperty ? (
            <BadgeTooltip
              className="duration-300 hover:-translate-y-0.5"
              tooltipProps={{
                delayDuration: 300,
              }}
              label="Commercial"
              tooltipContent={<p>This is a commercial property</p>}
            />
          ) : (
            <BadgeTooltip
              className="duration-300 hover:-translate-y-0.5"
              tooltipProps={{
                delayDuration: 300,
              }}
              label="Residential"
              tooltipContent={<p>This is a residential property</p>}
            />
          )}
          {isActive ? (
            <BadgeTooltip
              className="duration-300 hover:-translate-y-0.5"
              tooltipProps={{
                delayDuration: 300,
              }}
              label="Active"
              tooltipContent={<p>This listing is active</p>}
            />
          ) : (
            <BadgeTooltip
              className="duration-300 hover:-translate-y-0.5"
              label="Inactive"
              tooltipProps={{
                delayDuration: 300,
              }}
              tooltipContent={<p>This listing is no longer active</p>}
            />
          )}
          {timeFrame && (
            <BadgeTooltip
              className="duration-300 hover:-translate-y-0.5"
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
              className="duration-300 hover:-translate-y-0.5"
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
