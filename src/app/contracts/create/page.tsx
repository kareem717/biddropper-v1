"use client";
import CreateContractForm from "@/components/forms/create-contract";

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
