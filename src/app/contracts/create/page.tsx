"use client";
import CreateContractForm from "@/components/forms/create-contract";
import SelectAdd from "@/components/select-add";
import SelectTrade from "@/components/select-trade";
import { Button } from "@/components/ui/button";
import * as React from "react";
import { useRef } from "react";
export default function ContractPage() {
	const selectAddRef = useRef<{ getTrade: () => string } | null>(null);

	const handleGetValue = () => {
		const trade = selectAddRef.current?.getTrade();
		console.log("Current value of trade:", trade);
		// Do whatever you want with the value of trade
	};

	return (
		<main>
			<div className="flex flex-col items-center justify-center">
				<h1 className="text-4xl ">My Contracts</h1>

				<CreateContractForm />
				<SelectAdd ref={selectAddRef} />
				<Button onClick={handleGetValue}>Get Value</Button>
			</div>
		</main>
	);
}
