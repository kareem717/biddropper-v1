"use client";

import React from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import BasicDetailsForm from "./basic-details";
import AddImagesForm from "./add-images";
import { useMultistepForm } from "@/hooks/use-multistep-form";
import AddJobsForm from "./add-jobs";
import AddAddressForm from "./add-address";

export default function CreateContractForm() {
	const { step } = useMultistepForm();
	const { userId } = useAuth();
	const { formData } = useMultistepForm();
	const forms = [
		<BasicDetailsForm key="step-one" />,
		<AddImagesForm key="step-two" />,
		<AddJobsForm key="step-three" />,
		<AddAddressForm key="step-four" />,
	];

	if (!userId) redirect("/sign-in");
	console.log(formData);
	return (
		<Card className="w-[75vw] lg:w-[min(85vw,950px)]">
			<CardHeader>
				<CardTitle>Create a new bundle</CardTitle>
				<CardDescription>
					Wrap up some jobs together to post as a bundle
				</CardDescription>
			</CardHeader>
			<CardContent>{forms[2]}</CardContent>
		</Card>
	);
}
