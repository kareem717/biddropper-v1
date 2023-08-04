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
import { useMultistepFormContext } from "@/hooks/use-multistep-form";
import { catchClerkError } from "@/lib/utils";
import { Icons } from "@/components/icons";

const formSchema = userSchema.pick({ firstName: true, lastName: true });
type Inputs = z.infer<typeof formSchema>;

export function StepOneForm() {
	const { setFormValues, data, step, setStep, addProgress, clerkSignUp } =
		useMultistepFormContext();
	const { isLoaded, signUp } = clerkSignUp;
	const form = useForm<Inputs>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			firstName: data.firstName,
			lastName: data.lastName,
		},
		mode: "onBlur",
	});
	const formIsSubmitting = form.formState.isSubmitting;

	async function onSubmit(formDetails: Inputs) {
		if (form.formState.submitCount > 0) return;

		if (!isLoaded) return;

		try {
			if (!signUp.firstName && !signUp.lastName) {
				await signUp.create({
					firstName: formDetails.firstName,
					lastName: formDetails.lastName,
				});
			} else {
				console.log("update");

				await signUp.update({
					firstName: formDetails.firstName,
					lastName: formDetails.lastName,
				});
			}

			setFormValues(formDetails);
			addProgress(25);
			setStep(step + 1);
		} catch (err) {
			console.log(err);

			catchClerkError(err);
		}
	}

	return (
		<Form {...form}>
			<form
				className="grid gap-4"
				onSubmit={(...args) => void form.handleSubmit(onSubmit)(...args)}
			>
				<FormField
					control={form.control}
					name="firstName"
					render={({ field }) => (
						<FormItem>
							<FormLabel>First Name</FormLabel>
							<FormControl>
								<Input placeholder="John" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="lastName"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Last Name</FormLabel>
							<FormControl>
								<Input placeholder="Doe" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button disabled={formIsSubmitting}>
					{formIsSubmitting ? (
						<Icons.spinner
							className="mr-2 h-4 w-4 animate-spin"
							aria-hidden="true"
						/>
					) : (
						"Next"
					)}
					<span className="sr-only">Continue to next page</span>
				</Button>
			</form>
		</Form>
	);
}
