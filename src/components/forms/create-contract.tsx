"use client";

import { useState, FC, ComponentPropsWithoutRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import {
	createContractSchema,
	insertContractSchema,
	selectJobSchema,
} from "@/lib/validations/posts";
import { Icons } from "@/components/icons";
import { redirect, useRouter } from "next/navigation";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from "@/components/ui/form";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { Input } from "../ui/input";
import type { SelectedCompanyJobs } from "@/lib/validations/companies";
import JobCard from "../job-cards/small";
import { Checkbox } from "../ui/checkbox";
import { ScrollArea } from "../ui/scroll-area";
import { Calendar } from "../ui/calendar";
import { env } from "@/env.mjs";

interface CreateContractFormProps
	extends ComponentPropsWithoutRef<typeof Card> {
	userId: string;
	jobs: SelectedCompanyJobs;
}

const CreateContractForm: FC<CreateContractFormProps> = ({
	userId,
	jobs,
	...props
}) => {
	// todo: might have bugs as i removed commision and didnt test it
	const router = useRouter();
	const [date, setDate] = useState<Date>();
	const [formStep, setFormStep] = useState<number>(0);
	const [isFetching, setIsFetching] = useState<boolean>(false);

	// todo: maybe abstract this into a hook atp cause ur using it in multiple places
	const handleNextStep = () => {
		setFormStep((prevStep) => {
			if (prevStep < fields.length - 1) {
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

	const formSchema = createContractSchema;

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			title: undefined,
			description: undefined,
			jobs: [],
			price: undefined,
			endDate: null,
		},
	});
	interface Step {
		fieldName: string;
		title?: string;
		description?: string;
		component: React.ReactNode;
	}
	const steps: Step[] = [
		{
			fieldName: "title",
			title: "Contract Title",
			description: "Give your contract a title",
			component: (
				<div className="space-y-8">
					<Input
						placeholder="ABC Inc. Plumbing Contract"
						{...form.register("title")}
						/>
				</div>
			),
		},
		{
			fieldName: "description",
			title: "Basic Details",
			description:
			"Explain the ins and outs of the contract you want to create",
			component: (
				<div className="space-y-8">
					<Textarea
						className="max-h-[25vh]"
						{...form.register("description")}
					/>
				</div>
			),
		},
		{
			fieldName: "jobs",
			title: "Select Jobs",
			description:
				"Select the jobs you want to include in this contract or create new ones",
				component: (
					<ScrollArea className="flex flex-col max-h-[50vh]">
					{Object.values(jobs).map((company, index) => {
						return (
							<div key={index} className="mb-8">
								<h1 className="mb- capitalize">{company.name}</h1>
								<ScrollArea className="flex flex-col gap-4 max-h-[25vh] mx-4 ">
									{company.jobs.map((job, index) => {
										return (
											<div key={index} className="flex items-center gap-4 my-2">
												<Checkbox
													defaultChecked={
														form.getValues("jobs").find((j) => j.id === job.id)
														? true
														: false
													}
													onCheckedChange={() => {
														const currentJobs = form.getValues("jobs");
														const isInArray = currentJobs.find(
															(j) => j.id === job.id
															);
															if (isInArray) {
																const updatedJobs = currentJobs.filter(
																	(j) => j.id !== job.id
																	);
																	form.setValue("jobs", updatedJobs);
														} else {
															const updatedJobs = [...currentJobs, job];
															form.setValue("jobs", updatedJobs);
														}
													}}
													/>
												<JobCard
													id={job.id}
													industry={job.industry}
													propertyType={job.propertyType}
													timeHorizon={job.timeHorizon}
													/>
											</div>
										);
									})}
								</ScrollArea>
							</div>
						);
					})}
				</ScrollArea>
			),
		},
		{
			fieldName: "payment",
			title: "Payment",
			description:
			"Set the minimum bidding price for your contract",
			component: (
				<div>
					{/* <Card>
						<CardHeader>
						<CardTitle>Fixed Price</CardTitle>
						<CardDescription>
						Set the fixed minimum price for this contract. Entered price
						will be rounded to the nearest cent.
						</CardDescription>
						</CardHeader>
					<CardContent className="space-y-2"> */}
							{/* //TODO: Maybe implement currency-input? */}
							<div className="space-y-1">
								{/* <Label htmlFor="price">Price</Label> */}
								<div className="flex items-center gap-2">
									<Icons.dollarSign />
									<Input
										id="price"
										type="number"
										className="w-1/2"
										onChange={(val) => {
											form.setValue(
												"price",
												Number(parseFloat(val.target.value).toFixed(2))
												);
											}}
											/>
								</div>
							</div>
						{/* </CardContent>
					</Card>*/}
				</div> 
			),
		},
		{
			fieldName: "endDate",
			title: "End Date",
			description:
			"Set the date when this contract will no longer be active for trading",
			component: (
				<div>
					<Popover>
						<div className="flex justify-center w-full">
							<PopoverTrigger asChild>
								<Button
									variant={"outline"}
									className={cn(
										"w-full justify-start font-normal",
										!date && "text-muted-foreground"
										)}
										>
									<div className="flex justify-center w-full">
										<Icons.calendar className="mr-2 h-4 w-4" />
										{date ? format(date, "PPP") : <span>Pick a date</span>}
									</div>
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-auto p-0" align="center">
								<Calendar
									mode="single"
									selected={date}
									onSelect={(date) => {
										setDate(date);
										form.setValue("endDate", date as any);
									}}
									disabled={(date) => date < new Date()}
									initialFocus
									/>
							</PopoverContent>
						</div>
					</Popover>
				</div>
			),
		},
	];
	
	const fields = Object.keys(form.getValues());
	console.log(formStep, fields.length - 1)

	async function onSubmit(values: z.infer<typeof formSchema>) {
		setIsFetching(true);
		console.log(JSON.stringify(values));

		const res = await fetch(`${env.NEXT_PUBLIC_APP_URL}/api/posts/bundles`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Owner-Id": userId,
			},
			body: JSON.stringify(values),
		});
		const data = await res.json();
		console.log(data, res.status);

		router.replace(`/contracts/${data.id}`);
		setIsFetching(false);
	}

	console.log(form.getValues());
	return (
		<Card {...props}>
			<CardHeader>
				<div className="mb-8">
					<Progress value={((formStep + 1) / fields.length) * 100} />
				</div>

				<CardTitle>{steps[formStep]?.title}</CardTitle>
				<CardDescription>{steps[formStep]?.description}</CardDescription>
			</CardHeader>
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="space-y-8"
					id="job-form"
				>
					<CardContent>
						{steps.map((step, index) => (
							<FormField
								key={index}
								control={form.control}
								name={step.fieldName as any}
								render={({ field }) => (
									<FormItem
										className={cn(
											"transition duration-300",
											index !== formStep && "hidden"
										)}
									>
										<FormControl>{step.component}</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						))}
					</CardContent>
				</form>
			</Form>
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
					{formStep < fields.length - 1 && (
						<Button
							onClick={async () => {
								const currentField = fields[formStep];

								await form.trigger(currentField as any);

								const currentStepInvalid = Object.keys(
									form.formState.errors
								).some((field) => field === currentField);

								if (!currentStepInvalid) {
									handleNextStep();
								}
							}}
							className="w-full"
						>
							Next
						</Button>
					)}
					{formStep === fields.length -1 &&
						(isFetching ? (
							<Button disabled={true} type={"button"} className="w-full">
								<Icons.spinner
									className="mr-2 h-4 w-4 animate-spin"
									aria-hidden="true"
								/>
								<span className="sr-only">Loading</span>
							</Button>
						) : (
							<Button type="submit" form="job-form" className="w-full">
								<span className="hidden sm:block">Finish and Create</span>
								<span className="sm:hidden">Done</span>
							</Button>
						))}
				</div>
			</CardFooter>
		</Card>
	);
};

export default CreateContractForm;
