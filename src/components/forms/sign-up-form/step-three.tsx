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
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useMultistepFormContext } from "@/hooks/use-multistep-form";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { catchClerkError, cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Icons } from "@/components/icons";
import { toast } from "sonner";

const formSchema = userSchema.pick({ birthDate: true, gender: true });
type Inputs = z.infer<typeof formSchema>;

export function StepThreeForm() {
	const { setFormValues, data, step, setStep, addProgress, clerkSignUp } =
		useMultistepFormContext();
	const { isLoaded, signUp } = clerkSignUp;

	const eighteenYearsAgo = new Date(
		new Date().setFullYear(new Date().getFullYear() - 18)
	);

	const form = useForm<Inputs>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			birthDate: data.birthDate,
			gender: data.gender,
		},
		mode: "onBlur",
	});
	const formIsSubmitting = form.formState.isSubmitting;

	async function onSubmit(formDetails: Inputs) {
		if (form.formState.submitCount > 0) return;
		if (!isLoaded) return;
		try {
			await signUp.update({
				unsafeMetadata: {
					birthDate: formDetails.birthDate,
					gender: formDetails.gender,
				},
			});

			await signUp.prepareEmailAddressVerification();

			addProgress(25);
			setStep(step + 1);

			toast.message("Check your email", {
				description: "We sent you a 6-digit verification code.",
			});
		} catch (err) {
			catchClerkError(err);
		}
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
					name="birthDate"
					render={({ field }) => (
						<FormItem className="flex flex-col gap-1">
							<FormLabel>Date of birth</FormLabel>
							<FormControl>
								<Popover>
									<PopoverTrigger asChild>
										<FormControl>
											<Button
												variant={"outline"}
												className={cn(
													"w-[240px] pl-3 text-left font-normal",
													!field.value && "text-muted-foreground"
												)}
											>
												{field.value ? (
													format(field.value, "PPP")
												) : (
													<span>Pick a date</span>
												)}
												<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
											</Button>
										</FormControl>
									</PopoverTrigger>
									<PopoverContent className="w-auto p-0" align="start">
										<Calendar
											defaultMonth={eighteenYearsAgo}
											mode="single"
											selected={field.value}
											onSelect={field.onChange}
											disabled={(date) =>
												date > eighteenYearsAgo || date < new Date("1900-01-01")
											}
											initialFocus
										/>
									</PopoverContent>
								</Popover>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="gender"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Gender</FormLabel>
							<FormControl>
								<Select
									onValueChange={field.onChange}
									defaultValue={field.value}
								>
									<SelectTrigger className="w-[180px]">
										<SelectValue placeholder="Select your gender" />
									</SelectTrigger>
									<SelectContent>
										<SelectGroup>
											<SelectItem value="male">Male</SelectItem>
											<SelectItem value="female">Female</SelectItem>
											<SelectItem value="other">Other</SelectItem>
										</SelectGroup>
									</SelectContent>
								</Select>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				{formIsSubmitting ? (
					<Button disabled={true} type={"button"}>
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
							<span className="sr-only">
								Continue to email verification page
							</span>
						</Button>
					</div>
				)}
			</form>
		</Form>
	);
}
