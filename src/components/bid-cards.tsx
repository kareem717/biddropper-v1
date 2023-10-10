"use client";
import { selectBidsSchema } from "@/lib/validations/posts/posts";
import { InferModel } from "drizzle-orm";
import { FC } from "react";
import useSWR from "swr";
import * as z from "zod";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";
import BadgeTooltip from "@/components/badge-tooltip";
import { Button, buttonVariants } from "./ui/button";
import Link from "next/link";
import { toast } from "sonner";
interface BidCardProps {
	id: string;
	price: string;
	status: string;
	createdAt: Date;
	biddingCompanyId: string;
	contractId: string;
}

const BidCard: FC<BidCardProps> = ({
	id,
	price,
	status,
	createdAt,
	biddingCompanyId,
	contractId,
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
	console.log({
		acceptedBidId: id,
		contractId,
	});
	const handleAcceptedBid = async () => {
		const res = await fetch("/api/posts/bids/accept", {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				acceptedBidId: id,
				contractId,
			}),
		});

		if (!res.ok) {
			toast.error("Something went wrong");
			return;
		}

		toast.success("Bid accepted!");
	};

	return (
		<Card>
			<CardHeader className="flex flex-row flex-wrap gap-2">
				<BadgeTooltip
					//todo: title case and maybe some colour
					label={`${price}`}
					tooltipProps={{
						delayDuration: 300,
					}}
					tooltipContent={<p>{`This bid is offering $${price}`}</p>}
				/>
				<BadgeTooltip
					//todo: title case and maybe some colour
					label={status}
					tooltipProps={{
						delayDuration: 300,
					}}
					tooltipContent={<p>{`This bid was is currently ${status}`}</p>}
				/>
				<BadgeTooltip
					label={`${formattedContractAge(createdAt)} old`}
					tooltipProps={{
						delayDuration: 300,
					}}
					tooltipContent={
						<p>{`This bid was placed on ${format(
							createdAt,
							"PPPP 'at' p"
						)}`}</p>
					}
				/>
			</CardHeader>
			<CardContent>
				<Link
					className={buttonVariants()}
					href={`/company/${biddingCompanyId}`}
				>
					See Offering Company
				</Link>
			</CardContent>
			<CardFooter>
				<Button onClick={handleAcceptedBid}>Accept Bid</Button>
			</CardFooter>
		</Card>
	);
};

export default BidCard;
