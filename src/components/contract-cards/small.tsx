import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FC } from "react";
import BadgeTooltip from "../badge-tooltip";
import Link from "next/link";

interface ContractCardProps {
	id: string;
	isActive: boolean;
	createdAt: Date;
	title: string;
	price: string;
	endDate: Date | null;
	totalJobs: number;
	totalBids: number;
	companiesInContract: number;
}

const ContractCard: FC<ContractCardProps> = async ({
	id,
	title,
	isActive,
	price,
	endDate,
	totalJobs,
	totalBids,
	createdAt,
	companiesInContract,
}) => {
	const formattedPrice = Number(price).toLocaleString(undefined, {
		minimumFractionDigits: 0,
		maximumFractionDigits: 4,
	});

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
		<Card className="group hover:bg-gray-700 hover:bg-opacity-10 ease-in-out w-full">
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-base font-bold hover:opacity-80 duration-200 ease-in-out cursor-pointer ">
					<Link href={`/contracts/${id}`} className="capitalize">
						{title}
					</Link>
				</CardTitle>
			</CardHeader>
			<CardContent
				className="mt-4 flex justify-between min-h-[80px]
			"
			>
				<div className="flex flex-wrap gap-2">
					<BadgeTooltip
						className="hover:-translate-y-0.5 duration-300"
						tooltipProps={{
							delayDuration: 300,
						}}
						label={isActive ? "Active" : "Inactive"}
						tooltipContent={
							<p>
								{isActive
									? "This listing is active"
									: "This listing is no longer active"}
							</p>
						}
					/>

					<BadgeTooltip
						className="hover:-translate-y-0.5 duration-300"
						tooltipProps={{
							delayDuration: 300,
						}}
						label={`$${formattedPrice}`}
						tooltipContent={
							<p>
								{`This listing has a minimum bid price of $${formattedPrice}`}
							</p>
						}
					/>

					<BadgeTooltip
						className="hover:-translate-y-0.5 duration-300"
						tooltipProps={{
							delayDuration: 300,
						}}
						label={`${formattedContractAge(createdAt)} ago`}
						tooltipContent={
							<p>
								This listing was created {formattedContractAge(createdAt)} ago
							</p>
						}
					/>

					{endDate && (
						<BadgeTooltip
							className="hover:-translate-y-0.5 duration-300"
							tooltipProps={{
								delayDuration: 300,
							}}
							label={`Ends in ${formattedContractAge(endDate)}`}
							tooltipContent={
								<p>
									This listing will expire in {formattedContractAge(endDate)}
								</p>
							}
						/>
					)}

					<BadgeTooltip
						className="hover:-translate-y-0.5 duration-300"
						tooltipProps={{
							delayDuration: 300,
						}}
						label={`${totalJobs} Job${totalJobs > 1 ? "s" : ""}`}
						tooltipContent={
							<p>
								This listing includes {totalJobs} job{totalJobs > 1 ? "s" : ""}
							</p>
						}
					/>

					{totalBids > 0 && (
						<BadgeTooltip
							className="hover:-translate-y-0.5 duration-300"
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

					{companiesInContract > 1 && (
						<BadgeTooltip
							className="hover:-translate-y-0.5 duration-300"
							tooltipProps={{
								delayDuration: 300,
							}}
							label={`${companiesInContract} Companies`}
							tooltipContent={
								<p>This listing involves {companiesInContract} companies</p>
							}
						/>
					)}
				</div>
			</CardContent>
		</Card>
	);
};

export default ContractCard;
