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
import { Label } from "recharts";
import PieChart from "../pie-chart";

interface ContractCardProps extends ComponentPropsWithoutRef<typeof Card> {
	id: string;
	title: string;
	description: string;
	paymentType: string;
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
	paymentType,
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
	return (
		<Card {...props}>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
			</CardHeader>

			<CardContent>
				<ScrollArea>
					{/* //className="flex flex-col md:flex-row h-[70vh] w-full items-center justify-between md:space-x-6" */}
					<CardContent>
						<div className="h-full md:w-[50%] rounded-md grid gap-4 grid-rows-1">
							<div className="flex flex-col gap-2">
								<Label>Job Details</Label>
								<ScrollArea
									className="rounded-md border p-4 h-full"
									id="job-details"
								>
									{description}
								</ScrollArea>
							</div>
							<PieChart data={companyStakes} />
						</div>
						<div>{paymentType}</div>
						<div>{price}</div>
						<div>{`${createdAt}`}</div>
						{endDate && <div>{`${endDate}`}</div>}
						<div>{totalBids}</div>
						<div>{totalJobs}</div>
						<div>{JSON.stringify(companyStakes)}</div>
					</CardContent>
				</ScrollArea>
			</CardContent>

			<CardFooter>
				<BidButton className="w-full" contractId={id} companies={companies} />
				<Button
					className="w-full"
					onClick={(e) => {
						toast.error("This feature is not yet implemented");
					}}
				>
					Request More Info
				</Button>
			</CardFooter>
		</Card>
	);
};

export default ContractCard;
