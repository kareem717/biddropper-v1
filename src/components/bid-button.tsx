"use client";
import { ComponentPropsWithoutRef, useState } from "react";
import { Button, buttonVariants } from "./ui/button";
import { cn } from "@/lib/utils";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Icons } from "./icons";
import { toast } from "sonner";
import { env } from "@/env.mjs";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
interface JobProps extends ComponentPropsWithoutRef<typeof DialogTrigger> {
	jobId: string;
	contractId?: never;
	companies:
		| {
				id: string;
				name: string;
		  }[]
		| string;
}
interface ContractProps extends ComponentPropsWithoutRef<typeof DialogTrigger> {
	jobId?: never;
	contractId: string;
	companies:
		| {
				id: string;
				name: string;
		  }[]
		| string;
}

type BidButtonProps = JobProps | ContractProps;

const BidButton: React.FC<BidButtonProps> = ({
	jobId,
	contractId,
	companies,
	...props
}) => {
	const [inputValue, setInputValue] = useState("");
	const [fetching, setFetching] = useState(false);
	const [open, setOpen] = useState(false);
	const [biddingCompany, setBiddingCompany] = useState<string>("");
	const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const value = event.target.value;
		const isValid = /^\d{0,10}(\.\d{0,2})?$/.test(value);

		if (isValid) {
			setInputValue(value);
		}
	};

	const enterBid = async () => {
		console.log(biddingCompany);
		const res = jobId
			? await fetch(`${env.NEXT_PUBLIC_APP_URL}/api/posts/bids`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"Bid-Type": "job",
					},
					body: JSON.stringify({
						price: inputValue,
						jobId,
						companyId: biddingCompany,
					}),
			  })
			: await fetch(`/api/posts/bids`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"Bid-Type": "contract",
					},
					body: JSON.stringify({
						price: inputValue,
						contractId,

						companyId: biddingCompany,
					}),
			  });

		if (!res.ok) {
			toast.error("Error entering bid");
			setFetching(false);

			return;
		}

		toast.success("Bid entered successfully");

		setFetching(false);
		setOpen(false);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger
				className={cn(buttonVariants(), { ...props })}
				role="button"
				{...props}
			>
				Bid
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>How much?</DialogTitle>
					<DialogDescription>
						Ennter the amount you want to bid
					</DialogDescription>
				</DialogHeader>
				<div className="flex flex-col items-center space-x-6 w-full">
					<div className="flex items-center w-full space-x-2">
						<Icons.dollarSign />
						<Input
							type="number"
							value={inputValue}
							onChange={handleInputChange}
							step="0.01"
							min="0"
							max="9999999999.99"
						/>
					</div>
					{companies instanceof Array && (
						<div className="w-full mt-6">
							<Select
								onValueChange={(val) => {
									setBiddingCompany(companies[Number(val)]?.id as any);
								}}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Select the company you'd like to bid from" />
								</SelectTrigger>
								<SelectContent>
									{companies.map((company, index) => (
										<SelectItem key={index} value={`${index}`}>
											{company.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					)}
				</div>

				{fetching ? (
					<Button disabled={true} type={"button"}>
						<Icons.spinner
							className="mr-2 h-4 w-4 animate-spin"
							aria-hidden="true"
						/>
						<span className="sr-only">Loading</span>
					</Button>
				) : (
					<Button
						type="submit"
						onClick={() => {
							setFetching(true);
							enterBid();
						}}
					>
						Enter Bid
					</Button>
				)}
			</DialogContent>
		</Dialog>
	);
};

export default BidButton;
