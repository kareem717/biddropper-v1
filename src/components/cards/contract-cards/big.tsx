"use client";
import "mapbox-gl/dist/mapbox-gl.css";
import React, { ComponentPropsWithoutRef, FC } from "react";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import BidButton from "@/components/bid-buttons";
import * as z from "zod";
import { selectJobSchema } from "@/lib/validations/posts/jobs";
import { Button } from "../../ui/button";
import { toast } from "sonner";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Label } from "../../ui/label";
import PieChart from "../../pie-chart";
import { format } from "date-fns";
import JobCard from "../job-cards/small";
import BadgeTooltip from "../../badge-tooltip";
import { useFetchContracts } from "@/hooks/api/contracts/use-fetch-contracts";
import { formatDate } from "@/lib/utils";
import { useSession } from "next-auth/react";
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

	const companies =
		(session.data?.user?.ownedCompanies || []).length > 1
			? (session.data?.user?.ownedCompanies || []).map((company) => ({
					id: company.id,
					name: company.name,
			  }))
			: session.data?.user?.ownedCompanies?.[0]?.id;

	const contractPrice = Number(contract.price).toLocaleString(undefined, {
		minimumFractionDigits: 0,
		maximumFractionDigits: 4,
	});
	console.log(contract);
	return (
		<Card {...props}>
			<CardHeader>
				<CardTitle>{contract.title}</CardTitle>
				<div className="flex flex-wrap gap-2">
					<BadgeTooltip
						className="bg-[#16a34a] hover:bg-[#16a34a]/80"
						label={`$${contractPrice}`}
						tooltipProps={{
							delayDuration: 300,
						}}
						tooltipContent={
							<p>{`This contract has a minimum bid price of $${Number(
								contract.price
							).toLocaleString(undefined, {
								minimumFractionDigits: 0,
								maximumFractionDigits: 4,
							})}`}</p>
						}
					/>

					{contract.endDate && (
						<BadgeTooltip
							label={`Expires in ${formatDate(contract.endDate)}`}
							tooltipProps={{
								delayDuration: 300,
							}}
							tooltipContent={
								<p>{`This contract was expires on ${format(
									new Date(contract.endDate),

									"PPPP 'at' p"
								)}`}</p>
							}
						/>
					)}
					<BadgeTooltip
						label={`Created ${formatDate(contract.createdAt)} ago`}
						tooltipProps={{
							delayDuration: 300,
						}}
						tooltipContent={
							<p>{`This contract was created on ${format(
								new Date(contract.createdAt),
								"PPPP 'at' p"
							)}`}</p>
						}
					/>
					{contract.totalBids > 0 && (
						<BadgeTooltip
							tooltipProps={{
								delayDuration: 300,
							}}
							label={`${contract.totalBids} Bid${
								contract.totalBids > 1 ? "s" : ""
							}`}
							tooltipContent={
								<p>
									This contract already has {contract.totalBids} bid
									{contract.totalBids > 1 ? "s" : ""}
								</p>
							}
						/>
					)}

					<BadgeTooltip
						tooltipProps={{
							delayDuration: 300,
						}}
						label={`${contract.totalJobs} Job${
							contract.totalJobs > 1 ? "s" : ""
						}`}
						tooltipContent={
							<p>
								This contract includes {contract.totalJobs}
								{contract.totalJobs > 1 ? "s" : ""}
							</p>
						}
					/>
				</div>
			</CardHeader>
			
			<CardContent className="">
				<div className="flex flex-grow mb-4 flex-shrink flex-wrap max-h-[50vh] justify-between flex-grow-1 overflow-auto">
					{contract.companyStakes.length > 1 && (
						<div className="w-full h-[min(400px,30vh)] hidden sm:block">
							<PieChart data={contract.companyStakes} width="100%" height="100%" />
						</div>
					)}
					<div className="w-full">
						<Label htmlFor="jobs">Jobs</Label>
						<div
							className="flex flex-col max-h-[50vh] overflow-auto w-full mt-2"
							id="jobs"
						>
							{Object.values(jobs).map((job, index) => {
								return (
									<>
										<div key={index} className="flex items-center gap-4 my-2">
											<JobCard
												id={job.id}
												industry={job.industry}
												propertyType={job.propertyType}
												timeHorizon={job.timeHorizon}
											/>
										</div>
									</>
								);
							})}
						</div>
					</div>
				</div>
				<Label htmlFor="description">Description</Label>
				<div
					className="rounded-md border p-4 h-[20vh] overflow-auto mt-2"
					id="contract-description"
				>
					{description}
				</div>
			</CardContent>

			<CardFooter className="flex flex-col w-full gap-4">
				<div className="w-full flex flex-row gap-2">
					<BidButton
						className="w-full"
						contractId={id}
						companies={companies || []}
						minimumBid={Number(contractPrice)}
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
			</CardFooter>
		</Card>
	);
};

export default ContractCard;
