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
import { selectJobSchema } from "@/lib/validations/posts";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Label } from "../ui/label";
import PieChart from "../pie-chart";
import BidPrice from "../bid-price";
import { format } from "date-fns";
import JobCard from "../job-cards/small";
import { Badge } from "../ui/badge";
import BadgeTooltip from "../badge-tooltip";
//TODO: idk why scroll areas dont worlk
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
	return (
		<Card
			{...props}
			className="sm:w-[min(80vw,1250px)] w-[95vw]  bg-background absolute right-1/2 top-1/4 translate-x-1/2 -translate-y-1/4"
		>
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
									This listing already has {totalBids} bid
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
								This listing already has {totalJobs} bid
								{totalJobs > 1 ? "s" : ""}
							</p>
						}
					/>
				</div>
			</CardHeader>

			<CardContent className="">
				<div className="flex flex-grow mb-4 flex-shrink flex-wrap h-[50vh] justify-between flex-grow-1 overflow-auto">
					{companyStakes.length > 1 && (
						<PieChart
							data={companyStakes}
							width="100%"
							height="70%"
							className="hidden sm:block"
						/>
					)}
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
									<div key={index} className="flex items-center gap-4 my-2">
										<JobCard
											id={job.id}
											industry={job.industry}
											propertyType={job.propertyType}
											timeHorizon={job.timeHorizon}
										/>
									</div>
									<div key={index} className="flex items-center gap-4 my-2">
										<JobCard
											id={job.id}
											industry={job.industry}
											propertyType={job.propertyType}
											timeHorizon={job.timeHorizon}
										/>
									</div>
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
				<Label htmlFor="description">Description</Label>
				<div
					className="rounded-md border p-4 h-[20vh] overflow-auto mt-2"
					id="contract-description"
				>
					Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed vitae
					ligula pulvinar velit lacinia gravida vitae quis orci. Vestibulum
					sollicitudin, felis eget dignissim mollis, ex sapien suscipit nunc,
					feugiat auctor nulla libero sit amet massa. Sed at nunc et tortor
					iaculis ornare quis vitae sapien. Sed vel pharetra enim. In vel
					tincidunt lorem. Mauris vel magna id arcu congue finibus. Proin
					pellentesque, lacus at pharetra luctus, tortor odio accumsan massa,
					vitae dictum dui ex sit amet mauris. Curabitur justo dui, volutpat
					vitae risus ultrices, eleifend varius turpis. Sed laoreet dolor vel ex
					posuere aliquam. Nulla facilisi. Quisque pulvinar imperdiet tellus at
					sagittis. Ut mattis aliquam lacus. In at accumsan augue, ut efficitur
					turpis. Fusce pharetra blandit quam sit amet interdum. Nunc porttitor
					sem quis tortor sollicitudin condimentum. Quisque aliquam nisi eros,
					ac blandit lectus congue sed. Nulla elementum molestie purus, vel
					rutrum nulla auctor quis. Aliquam dolor dolor, laoreet vel tortor in,
					consequat tempor urna. Nullam eget magna hendrerit, fermentum erat
					vel, consectetur eros. Donec a consectetur velit. Proin non diam
					efficitur, bibendum orci ac, accumsan massa. Quisque accumsan purus
					ipsum, in lacinia velit pellentesque vitae. In fermentum orci nec enim
					venenatis vulputate. Vestibulum finibus scelerisque urna, imperdiet
					feugiat tellus hendrerit vel. Nulla nec tristique turpis, id laoreet
					elit. Sed vehicula odio eu sapien ullamcorper, ac sagittis ipsum
					dignissim. Mauris ac lacus sed sapien vehicula efficitur. In maximus,
					felis quis euismod sollicitudin, felis dolor rhoncus nibh, a tempor
					augue nulla sed libero. Suspendisse lorem sapien, lacinia sit amet
					egestas vitae, porttitor nec lacus. In et felis egestas, rutrum nulla
					ut, ullamcorper turpis. Ut ex ligula, blandit at tristique quis,
					efficitur eu magna. Phasellus sit amet tellus ut urna condimentum
					mattis. Morbi ullamcorper et odio eget dignissim. Pellentesque
					habitant morbi tristique senectus et netus et malesuada fames ac
					turpis egestas. Vivamus vel aliquam ligula, quis pretium quam.
					Curabitur egestas nulla neque, ut viverra risus venenatis et. Praesent
					est turpis, fermentum eu fermentum vel, mattis in metus. Quisque
					facilisis ultricies nibh, at lobortis arcu porttitor feugiat. Nullam
					venenatis, ex sed hendrerit ultricies, magna libero sagittis felis, a
					eleifend massa libero et nibh. Donec nunc ipsum, maximus accumsan sem
					in, placerat ultricies turpis. Vivamus a lorem lectus. Donec a quam ac
					nunc malesuada semper quis quis mi. Curabitur convallis sagittis eros,
					id lobortis massa eleifend sed. Nulla ultrices fermentum est, vitae
					laoreet tellus tincidunt a. Donec porttitor porta ultricies. Sed
					laoreet diam vel nunc maximus pellentesque. Vivamus nec nisl in ex
					vulputate rutrum sed eu felis. Proin in tortor justo. Sed ac erat
					scelerisque, venenatis dui non, maximus turpis. Proin eu finibus
					risus, vel venenatis odio. Maecenas dignissim fermentum rhoncus. Donec
					vehicula auctor orci aliquam.
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
