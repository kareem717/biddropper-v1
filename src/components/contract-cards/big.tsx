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
import BidButton from "@/components/bid-button";
import * as z from "zod";
import { selectJobSchema } from "@/lib/validations/posts/posts";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Label } from "../ui/label";
import PieChart from "../pie-chart";
import { format } from "date-fns";
import JobCard from "../job-cards/small";
import BadgeTooltip from "../badge-tooltip";

//TODO: idk why scroll areas dont work, implement and get rid of the overflow-auto scroll bars!!
interface ContractCardProps extends ComponentPropsWithoutRef<typeof Card> {
	id: string;
	title: string;
	description: string;
	price: string;
	createdAt: Date;
	endDate: Date | null;
	jobs: z.infer<typeof selectJobSchema>[];
	totalBids: number;
	totalJobs: number;
	companyStakes: {
		name: string;
		value: number;
	}[];
	companies:
		| {
				id: string;
				name: string;
		  }[]
		| string;
}

// Todo: times are not being fetched properly

const ContractCard: FC<ContractCardProps> = ({
	id,
	title,
	description,
	price,
	createdAt,
	endDate,
	jobs,
	totalBids,
	totalJobs,
	companyStakes,
	companies,
	...props
}) => {
	const formattedContractAge = (createdAt: Date) => {
		const contractAge = Math.floor(
			(new Date().getTime() - new Date(createdAt).getTime()) /
				1000 /
				60 /
				60 /
				24
		);
		const suffix = contractAge > 1 ? "s" : "";
		if (contractAge < 1) {
			return "<1 day";
		} else if (contractAge < 7) {
			return `${contractAge} day${suffix}`;
		} else if (contractAge < 30) {
			const weeks = Math.floor(contractAge / 7);
			return `${weeks} week${suffix}`;
		} else if (contractAge < 365) {
			const months = Math.floor(contractAge / 30);
			return `${months} month${suffix}`;
		} else {
			const years = Math.floor(contractAge / 365);
			return `${years} year${suffix}`;
		}
	};

	console.log(id);
	return (
		<Card {...props}>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				<div className="flex flex-wrap gap-2">
					<BadgeTooltip
						className="bg-[#16a34a] hover:bg-[#16a34a]/80"
						label={`$${Number(price).toLocaleString(undefined, {
							minimumFractionDigits: 0,
							maximumFractionDigits: 4,
						})}`}
						tooltipProps={{
							delayDuration: 300,
						}}
						tooltipContent={
							<p>{`This contract has a minimum bid price of $${Number(
								price
							).toLocaleString(undefined, {
								minimumFractionDigits: 0,
								maximumFractionDigits: 4,
							})}`}</p>
						}
					/>

					{endDate && (
						<BadgeTooltip
							label={`Expires in ${formattedContractAge(createdAt)}`}
							tooltipProps={{
								delayDuration: 300,
							}}
							tooltipContent={
								<p>{`This contract was expires on ${format(
									createdAt,
									"PPPP 'at' p"
								)}`}</p>
							}
						/>
					)}
					<BadgeTooltip
						label={`Created ${formattedContractAge(createdAt)} ago`}
						tooltipProps={{
							delayDuration: 300,
						}}
						tooltipContent={
							<p>{`This contract was created on ${format(
								createdAt,
								"PPPP 'at' p"
							)}`}</p>
						}
					/>
					{totalBids > 0 && (
						<BadgeTooltip
							tooltipProps={{
								delayDuration: 300,
							}}
							label={`${totalBids} Bid${totalBids > 1 ? "s" : ""}`}
							tooltipContent={
								<p>
									This contract already has {totalBids} bid
									{totalBids > 1 ? "s" : ""}
								</p>
							}
						/>
					)}

					<BadgeTooltip
						tooltipProps={{
							delayDuration: 300,
						}}
						label={`${totalJobs} Job${totalJobs > 1 ? "s" : ""}`}
						tooltipContent={
							<p>
								This contract includes {totalJobs}
								{totalJobs > 1 ? "s" : ""}
							</p>
						}
					/>
				</div>
			</CardHeader>

			<CardContent className="">
				<div className="flex flex-grow mb-4 flex-shrink flex-wrap max-h-[50vh] justify-between flex-grow-1 overflow-auto">
					{companyStakes.length > 1 && (
						<div className="w-full h-[min(400px,30vh)] hidden sm:block">
							<PieChart data={companyStakes} width="100%" height="100%" />
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
						companies={companies}
						minimumBid={Number(price)}
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
