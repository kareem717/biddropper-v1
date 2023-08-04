"use client";
import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { userSchema } from "@/lib/validations/auth";
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
import { PasswordInput } from "@/components/password-input";
import { useMultistepFormContext } from "@/hooks/use-multistep-form";
import { useTransition } from "react";
import { Icons } from "@/components/icons";
import { catchClerkError } from "@/lib/utils";

const formSchema = userSchema.pick({ email: true, password: true });
type Inputs = z.infer<typeof formSchema>;

export function StepTwoForm() {
	const { setFormValues, data, step, setStep, addProgress, clerkSignUp } =
		useMultistepFormContext();
	const [isPending, startTransition] = useTransition();
	const {isLoaded, signUp} = clerkSignUp;

	const form = useForm<Inputs>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: data.email,
			password: data.password,
		},
		mode: "onBlur",
	});

	function onSubmit(formDetails: Inputs) {
		if (!isLoaded) return;

		startTransition(async () => {
			try {
				await signUp.update({
					emailAddress: formDetails.email,
					password: formDetails.password,
				});

				setFormValues(formDetails);
				addProgress(25);
				setStep(step + 1);
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

	console.log(data);

	return (
		<Form {...form}>
			<form
				className="grid gap-4"
				onSubmit={(...args) => void form.handleSubmit(onSubmit)(...args)}
			>
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>First Name</FormLabel>
							<FormControl>
								<Input placeholder="best-email@example.com" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="password"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Last Name</FormLabel>
							<FormControl>
								<PasswordInput placeholder="*********" {...field} />
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
							Next
							<span className="sr-only">Continue to next page</span>
						</Button>
					</div>
				)}
			</form>
		</Form>
	);
}
