"use client";

import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	insertCompanySchema,
	insertCompanyProfileSchema,
} from "@/lib/validations/companies";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Icons } from "../icons";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { Calendar } from "../ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { env } from "@/env.mjs";
import { AddressAutofill } from "@mapbox/search-js-react";
import type { AddressAutofillRetrieveResponse } from "@mapbox/search-js-core";
import { insertAddressSchema } from "@/lib/validations/address";
import RadiusAddress from "../maps/radius-address-map";
// import { createMultistepFormStore } from "@/hooks/use-multistep-form";
const formSchema = z.object({
	id: insertCompanySchema.shape.id,
	name: insertCompanySchema.shape.name,
	yearEstablished: insertCompanyProfileSchema.shape.yearEstablished,
	emailAddress: insertCompanyProfileSchema.shape.emailAddress,
	websiteUrl: insertCompanyProfileSchema.shape.websiteUrl,
	phoneNumber: insertCompanyProfileSchema.shape.phoneNumber,
	address: insertAddressSchema.omit({
		id: true,
		createdAt: true,
		updatedAt: true,
	}),
});
type Inputs = z.infer<typeof formSchema>;

export function CreateCompanyForm() {
	const router = useRouter();
	const session = useSession();
	if (!session) {
		router.replace("/sign-in");
	}
	const userId = session.data?.user?.id;
	const [isFetching, setIsFetching] = useState<boolean>(false);
	const totalSteps = 3;
	const form = useForm<Inputs>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			id: `comp_${crypto.randomUUID()}`,
			name: undefined,
			yearEstablished: new Date(),
			emailAddress: undefined,
			websiteUrl: undefined,
			phoneNumber: undefined,
			address: undefined,
		},
	});
	const [formStep, setFormStep] = useState<number>(2);

	// todo: maybe abstract this into a hook atp cause ur using it in multiple places
	const handleNextStep = () => {
		setFormStep((prevStep) => {
			if (prevStep < totalSteps - 1) {
				return prevStep + 1;
			} else {
				return prevStep;
			}
		});
	};

	const handlePreviousStep = () => {
		setFormStep((prevStep) => {
			if (prevStep > 0) {
				return prevStep - 1;
			} else {
				return prevStep;
			}
		});
	};
	// const useMultistepForm = createMultistepFormStore(2);
	// const { prevStep, nextStep, step, ...multistepForm } = useMultistepForm();

	// console.log(step, multistepForm.totalSteps);
	const onSubmit = async (data: Inputs) => {
		setIsFetching(true);

		const res = await fetch("/api/companies", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				ownerId: userId,
				...data,
			}),
		});

		if (!res.ok) {
			setIsFetching(false);
			toast.error("Something went wrong", {
				description: "Please try again later",
			});
		} else {
			toast.success("Success", {
				description: "Your company has been created",
			});
			router.replace("/");
		}
	};
	console.log(form.getValues());
	return (
		<Card className="absolute right-1/2 top-1/4 translate-x-1/2 -translate-y-1/4">
			<CardHeader className="space-y-1">
				<CardTitle className="text-2xl">Create your company</CardTitle>
				<CardDescription>
					Register your company to find future leadsdf
				</CardDescription>
			</CardHeader>
			<CardContent className="grid gap-4">
				<Form {...form}>
					<form
						id="company-form"
						className="grid gap-4"
						onSubmit={(...args) => void form.handleSubmit(onSubmit)(...args)}
					>
						{/* Step 1 */}
						{formStep === 0 && (
							<>
								<FormField
									control={form.control}
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Company Name</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="yearEstablished"
									render={({ field }) => (
										<FormItem className="flex flex-col gap-1">
											<FormLabel>Year Established</FormLabel>
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
																<Icons.calendar className="ml-auto h-4 w-4 opacity-50" />
															</Button>
														</FormControl>
													</PopoverTrigger>
													<PopoverContent className="w-auto p-0" align="start">
														<Calendar
															mode="single"
															selected={field.value}
															onSelect={field.onChange}
															disabled={(date) =>
																date > new Date() ||
																date < new Date("1900-01-01")
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
							</>
						)}

						{/* Step 2 */}
						{formStep === 1 && (
							<>
								<FormField
									control={form.control}
									name="emailAddress"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Company Email</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="phoneNumber"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Company Phone Number</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="websiteUrl"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Company Website </FormLabel>
											<FormControl>
												{/* {//todo: fix as any} */}
												<Input {...(field as any)} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</>
						)}

						{/* Step 3 */}
						{formStep === 2 && (
							<>
								<FormField
									control={form.control}
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Company Name</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="address"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Company Address</FormLabel>
											<FormControl>
												<RadiusAddress />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</>
						)}
					</form>
				</Form>
			</CardContent>
			<CardFooter>
				<div className="flex w-full gap-2">
					{formStep > 0 && !isFetching && (
						<Button
							onClick={handlePreviousStep}
							className="w-full"
							variant={"secondary"}
						>
							Back
						</Button>
					)}
					{formStep < totalSteps - 1 && (
						<Button
							onClick={
								handleNextStep
								// 	async () => {
								// 	//TODO: handle
								// 	// const currentField = fields[formStep];

								// 	// await form.trigger(currentField as any);

								// 	// const currentStepInvalid = Object.keys(
								// 	// 	form.formState.errors
								// 	// ).some((field) => field === currentField);

								// 	// if (!currentStepInvalid) {
								// 	nextStep();
								// 	// }
								// }
							}
							className="w-full"
						>
							Next
						</Button>
					)}
					{formStep === totalSteps - 1 &&
						(isFetching ? (
							<Button disabled={true} type={"button"} className="w-full">
								<Icons.spinner
									className="mr-2 h-4 w-4 animate-spin"
									aria-hidden="true"
								/>
								<span className="sr-only">Loading</span>
							</Button>
						) : (
							<Button type="submit" form="company-form" className="w-full">
								<span className="hidden sm:block">Finish and Create</span>
								<span className="sm:hidden">Done</span>
							</Button>
						))}
				</div>
			</CardFooter>
		</Card>
	);
}
