"use client";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardFooter,
} from "@/components/ui/card";
import { FC } from "react";
import Link from "next/link";
import { useFetchContracts } from "@/hooks/api/contracts/use-fetch-contracts";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface ContractCardProps {
	id: string;
	details: string;
	isActive: boolean;
	createdAt: Date;
	title: string;
	price: string;
	endDate: Date | null;
	totalJobs: number;
	totalBids: number;
	companiesInContract: number;
}

const ContractCard: FC<ContractCardProps> = ({
	id,
	title,
	isActive,
	price,
	details,
	endDate,
	totalJobs,
	totalBids,
	createdAt,
}) => {
	const formattedPrice = Number(price)
		.toLocaleString(undefined, {
			style: "currency",
			minimumFractionDigits: 0,
			maximumFractionDigits: 4,
			currency: "CAD",

		})
		.replace(/,/g, " ");

	const contractQuery = useFetchContracts({
		limit: 3,
		fetchType: "simple",
	});

	const formattedContractAge = (createdAt: Date) => {
		const contractAgeHours = Math.floor(
			(new Date().getTime() - new Date(createdAt).getTime()) / 1000 / 60 / 60
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

	return (
		<div className="flex flex-col md:flex-row justify-center items-center">
			<Card className="w-full max-w-md mx-2 md:mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-md border-2 border-gray-200 hover:border-gray-400 hover:shadow-lg transition-all duration-500 ease-in-out">
				<CardHeader className="m-4">
					<CardTitle className="text-xl font-semibold">
						<Link href={`/contracts/${id}`} className="capitalize">
							{title}
						</Link>
					</CardTitle>
				</CardHeader>
				<CardContent className="m-4">
					<p className="text-sm text-gray-500 overflow-ellipsis overflow-hidden">
						{details}
					</p>
					<div className="flex items-center mt-2 text-sm text-gray-500">
						<Icons.calendar className="h-5 w-5 mr-2 text-gray-400" />
						<p>Created {formattedContractAge(createdAt)} ago</p>
					</div>

					{endDate && (
						<div className="flex items-center mt-2 text-sm text-gray-500">
							<Icons.calendarX className="h-5 w-5 mr-2 text-gray-400" />
							<p>Expires on {format(new Date(endDate), 'MM/dd/yyyy')}</p>
						</div>
					)}

					<div className="flex items-center mt-2 text-sm text-gray-500">
						<Icons.briefcase className="h-5 w-5 mr-2 text-gray-400" />
						<p>Job count: {totalJobs}</p>
					</div>

					<div className="flex items-center mt-2 text-sm text-gray-500">
						<Icons.gavel className="h-5 w-5 mr-2 text-gray-400" />
						<p>Job bids: {totalBids}</p>
					</div>

					<div className="flex items-center mt-2 text-sm text-gray-500">
						<Icons.bankNote className="h-5 w-5 mr-2 text-gray-400" />
						<p>Minimum Bid Price: {formattedPrice}</p>
					</div>

					<div className="flex items-center mt-2 text-sm text-gray-500">
						<Icons.checkCircle
							className={cn(
								"h-5 w-5 mr-2",
								isActive ? "text-green-600" : "text-red-600"
							)}
						/>
						<p>Contract Active Status: {isActive ? "Active" : "Inactive"}</p>
					</div>
				</CardContent>
				<CardFooter className="m-4">
					<Button className="w-full" variant="secondary">
						View Contract
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
};

export default ContractCard;
