"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSignUp } from "@clerk/nextjs";
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
import { useTransition } from "react";
import { useMultistepFormContext } from "@/hooks/use-multistep-form";

type Inputs = z.infer<typeof verfifyEmailSchema>;

export function StepFourForm() {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const { setFormValues, data, step, setStep, addProgress, clerkSignUp } =
		useMultistepFormContext();
	const { isLoaded, signUp, setActive } = clerkSignUp;
	const form = useForm<Inputs>({
		resolver: zodResolver(verfifyEmailSchema),
		defaultValues: {
			code: "",
		},
	});

	function onSubmit(formDetails: Inputs) {
		if (!isLoaded) return;

		startTransition(async () => {
			try {
				const completeSignUp = await signUp.attemptEmailAddressVerification({
					code: formDetails.code,
				});
				if (completeSignUp.status !== "complete") {
					console.log(JSON.stringify(completeSignUp, null, 2));
				}
				if (completeSignUp.status === "complete") {
					setFormValues(formDetails);
					addProgress(25);

					await setActive({ session: completeSignUp.createdSessionId });

					router.push(`${window.location.origin}/`);
				}
			} catch (err) {
				catchClerkError(err);
			}
		});
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
				{isPending ? (
					<Button disabled={isPending}>
						<Icons.spinner
							className="mr-2 h-4 w-4 animate-spin"
							aria-hidden="true"
						/>
						<span className="sr-only">Loading</span>
					</Button>
				) : (
					<div className="grid grid-cols-2 gap-4">
						<Button type="button" onClick={prevStep} variant={"outline"}>
							Back
							<span className="sr-only">Go back</span>
						</Button>
						<Button type="submit">
							Finish
							<span className="sr-only">Complete registration and sign in</span>
						</Button>
					</div>
				)}
			</form>
		</Form>
	);
}
