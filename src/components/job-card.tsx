import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import React from "react";
import { Button } from "./ui/button";
import { Icons } from "./icons";
import BidButton from "./bid-button";

interface JobCardProps {
  id: string;
	title: string;
	summary: string;
	date: string;
	budgetRange?: string;
	industry: string;
	propertyType: string;
}

const JobCard: React.FC<JobCardProps> = ({
	title,
	summary,
	date,
	propertyType,
	industry,
	budgetRange = "Undisclosed",
	id
}) => {
	return (
		<Card>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				<CardDescription>{summary}</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-x-2">
					<span className="inline-flex items-center rounded-md bg-green-100 px-2.5 py-0.5 text-sm font-medium capitalize text-green-800">
						${budgetRange}
					</span>
					<span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-0.5 text-sm font-medium capitalize text-gray-800">
						{propertyType}
					</span>
					<span className="inline-flex items-center rounded-md bg-purple-100 px-2.5 py-0.5 text-sm font-medium capitalize text-purple-800">
						{date}
					</span>
					<span className="inline-flex items-center rounded-md bg-yellow-100 px-2.5 py-0.5 text-sm font-medium capitalize text-yellow-800">
						{industry}
					</span>
				</div>
			</CardContent>
			<CardFooter>
				<BidButton className="w-full" jobId={id}/>
			</CardFooter>
		</Card>
	);
};

export default JobCard;
