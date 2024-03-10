"use client";
import "mapbox-gl/dist/mapbox-gl.css";
import React, { ComponentPropsWithoutRef, FC } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/ui/card";
import BidButton from "@/components/ui/bid-buttons";
import * as z from "zod";
import { SelectedJob, selectJobSchema } from "@/lib/validations/posts/jobs";
import { Button } from "../../shadcn/ui/button";
import { toast } from "sonner";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Label } from "../../shadcn/ui/label";
import PieChart from "../../pie-chart";
import { format } from "date-fns";
import JobCard from "../job-cards/small";
import BadgeTooltip from "../../badge-tooltip";
import { Badge } from "@/components/shadcn/ui/badge";
import { useFetchContracts } from "@/hooks/api/contracts/use-fetch-contracts";
import { formatDate } from "@/lib/utils";
import { useSession } from "next-auth/react";
import ImageSlider from "@/components/image-slider";
//TODO: idk why scroll areas dont work, implement and get rid of the overflow-auto scroll bars!!
interface ContractCardProps extends ComponentPropsWithoutRef<typeof Card> {
  id: string;
}

// Todo: times are not being fetched properly

const ContractCard: FC<ContractCardProps> = ({ id, ...props }) => {
  const contractData = useFetchContracts({
    limit: 1,
    fetchType: "deep",
    contractId: id,
  });

  const session = useSession();
  const { data, isLoading, isError } = contractData;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const contract = data?.pages[0]?.data[0];
  if (isError || !contract) {
    return <div>Error</div>;
  }
  const formattedContractAge = (createdAt: Date) => {
    const contractAgeHours = Math.floor(
      (new Date().getTime() - new Date(createdAt).getTime()) / 1000 / 60 / 60,
    );
    const contractAge = Math.floor(contractAgeHours / 24);

    switch (true) {
      case contractAge < 1:
        return contractAgeHours < 1
          ? "less than an hour"
          : `${contractAgeHours} hour${contractAgeHours > 1 ? "s" : ""}`;
      case contractAge < 7:
        var suffix = contractAge > 1 ? "s" : "";
        return `${contractAge} day${suffix}`;
      case contractAge < 30:
        const weeks = Math.floor(contractAge / 7);
        var suffix = weeks > 1 ? "s" : "";

        return `${weeks} week${suffix}`;
      case contractAge < 365:
        const months = Math.floor(contractAge / 30);
        var suffix = months > 1 ? "s" : "";

        return `${months} month${suffix}`;
      default:
        const years = Math.floor(contractAge / 365);
        var suffix = years > 1 ? "s" : "";

        return `${years} year${suffix}`;
    }
  };

  const companies =
    (session.data?.user?.ownedCompanies || []).length > 1
      ? (session.data?.user?.ownedCompanies || []).map((company) => ({
          id: company.id,
          name: company.name,
        }))
      : session.data?.user?.ownedCompanies?.[0]?.id;

  const contractPrice = Number(contract.price)
    .toLocaleString(undefined, {
      style: "currency",
      minimumFractionDigits: 0,
      maximumFractionDigits: 4,
      currency: "CAD",
    })
    .replace(/,/g, " ");

  return (
    <Card key="1">
      <CardHeader className="flex items-center justify-between">
        <CardTitle>{contract.title}</CardTitle>
        <div className="flex gap-2">
          <Badge>
            {contract.endDate
              ? `Expiration Date: ${format(
                  new Date(contract.endDate),
                  "MM/dd/yyyy",
                )}`
              : "No expiry date"}
          </Badge>
          <Badge>Total jobs: {contract.jobs.length}</Badge>
          <Badge>
            Contract Age: {formattedContractAge(contract.createdAt)}
          </Badge>
          <Badge>Total bids: {contract.bids.length}</Badge>
          <Badge>Minimum Bid: {contractPrice}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {contract.media.length > 0 && (
          <ImageSlider images={contract.media.map((img) => img.fileUrl)} />
        )}
        <div>
          <p className="text-sm">{contract.description}</p>
        </div>
        <div
          className="scrollbar-thin scrollbar-thumb-zinc-400 scrollbar-track-zinc-100 dark:scrollbar-thumb-zinc-600 dark:scrollbar-track-zinc-800 overflow-y-auto"
          style={{
            maxHeight: "200px",
          }}
        >
          {Object.values(contract.jobs).map(
            (job: SelectedJob, index: number) => {
              return (
                <>
                  <div key={index} className="my-2 flex items-center gap-4">
                    <JobCard
                      id={job.id}
                      industry={job.industry}
                      propertyType={job.propertyType}
                      timeHorizon={job.timeHorizon}
                    />
                  </div>
                </>
              );
            },
          )}
        </div>
      </CardContent>

      <CardFooter className="flex w-full flex-col gap-4">
        <div className="flex w-full flex-row gap-2">
          {contract.isActive && (
            <BidButton
              className="w-full"
              contractId={id}
              companies={companies || []}
              minimumBid={Number(contractPrice)}
            />
          )}
          <Button
            className="w-full"
            onClick={(e) => {
              toast.error("This feature is not yet implemented");
            }}
          >
            Request More Info
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ContractCard;
