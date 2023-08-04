"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { isClerkAPIResponseError, useSignUp } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { catchClerkError } from "@/lib/utils";
import { verfifyEmailSchema } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/icons";
import { useMultistepFormContext } from "@/hooks/use-multistep-form";

type Inputs = z.infer<typeof verfifyEmailSchema>;

export function StepFourForm() {
	const router = useRouter();
	const { setFormValues, step, setStep, addProgress, clerkSignUp } =
		useMultistepFormContext();
	const { isLoaded, signUp, setActive } = clerkSignUp;

	const form = useForm<Inputs>({
		resolver: zodResolver(verfifyEmailSchema),
		defaultValues: {
			code: "",
		},
	});

	async function onSubmit(formDetails: Inputs) {
		if (!isLoaded) return;

		try {
			const completeSignUp = await signUp.attemptEmailAddressVerification({
				code: formDetails.code,
			});
			if (completeSignUp.status !== "complete") {
				console.log(JSON.stringify(completeSignUp, null, 2));

				form.setError("code", {
					type: "manual",
					message: "Something went wrong. Please try again.",
				});
			}
			if (completeSignUp.status === "complete") {
				setFormValues(formDetails);
				addProgress(25);

				await setActive({ session: completeSignUp.createdSessionId });

				router.push(`${window.location.origin}/`);
			}
		} catch (err) {
			if (isClerkAPIResponseError(err) && err.status === 422) {
				form.setError("code", {
					type: "manual",
					message: "Invalid code",
				});
			} else {
				catchClerkError(err);
			}
		}
	}

	function prevStep() {
		setFormValues(form.getValues());
		setStep(step - 1);
		addProgress(-25);
	}

	return (
		<Form {...form}>
			<form
				className="grid gap-4"
				onSubmit={(...args) => void form.handleSubmit(onSubmit)(...args)}
			>
				{form.formState.isSubmitting || form.formState.isSubmitSuccessful ? (
					<div className="w-full flex flex-row items-center justify-center py-10">
						<Icons.spinner
							className="mr-2 h-16 w-16 animate-spin place-self-auto opacity-60"
							aria-hidden="true"
						/>
					</div>
				) : (
					<>
						<FormField
							control={form.control}
							name="code"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Verification Code</FormLabel>
									<FormControl>
										<Input
											placeholder="XXXXXX"
											{...field}
											onChange={(e) => {
												e.target.value = e.target.value.trim();
												field.onChange(e);
											}}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<div className="grid grid-cols-2 gap-4">
							<Button type="button" onClick={prevStep} variant={"outline"}>
								Back
								<span className="sr-only">Go back</span>
							</Button>
							<Button type="submit">
								Finish
								<span className="sr-only">
									Complete registration and sign in
								</span>
							</Button>
						</div>
					</>
				)}
			</form>
		</Form>
	);
}
