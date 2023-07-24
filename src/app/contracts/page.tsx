"use client";
import { buttonVariants } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import CreateContractForm from "@/components/forms/create-contract";
("pscale_tkn_rSREbDgnpfEBM-haMyEzYb7035oLU771W3JuNBAr7qM");
export default function ContractPage() {
	return (
		<main>
			<div className="flex flex-col items-center justify-center">
				<h1 className="text-4xl ">My Contracts</h1>

				<CreateContractForm />
			</div>
		</main>
	);
}
