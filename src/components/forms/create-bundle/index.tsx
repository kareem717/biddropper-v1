"use client";

import React from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { createContractSchema } from "@/types/contract";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import StepOne from "./step-one";
import StepTwo from "./step-two";
import { useMultistepForm } from "@/hooks/use-multistep-form";

const formSchema = createContractSchema.omit({
	jobs: true,
});
type Inputs = z.infer<typeof formSchema>;

export default function CreateContractForm() {
	const { step } = useMultistepForm();
	const { userId } = useAuth();

	if (!userId) redirect("/sign-in");

	const form = useForm<Inputs>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			userId,
			title: "",
			description: "",
		},
	});

	const formIsSubmitting = form.formState.isSubmitting;

	return (
		<Card className="w-[75vw] lg:w-[min(85vw,950px)]">
			<CardHeader>
				<CardTitle>Create a new bundle</CardTitle>
				<CardDescription>
					Wrap up some jobs together to post as a bundle
				</CardDescription>
			</CardHeader>
			<CardContent>{step === 1 ? <StepOne /> : <StepTwo />}</CardContent>
		</Card>
	);
}
