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
	insertContractSchema,
	insertJobSchema,
	selectJobSchema,
} from "@/lib/validations/posts";
import { Icons } from "@/components/icons";
import { useRouter } from "next/navigation";
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
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "../ui/input";
import { useFieldArray } from "react-hook-form";
import ComboBox from "../combo-box";
import { industries } from "@/config/industries";
import type { SelectedCompanyJobs } from "@/lib/validations/companies";
import JobCard from "../job-cards/small";
import { Checkbox } from "../ui/checkbox";
import { ScrollArea } from "../ui/scroll-area";

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
	const totalSteps = 2;
	const router = useRouter();

	const [formStep, setFormStep] = useState<number>(1);
	const [isFetching, setIsFetching] = useState<boolean>(false);

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

	const formSchema = insertContractSchema
		.pick({
			title: true,
			description: true,
		})
		.extend({
			jobs: selectJobSchema.array(),
		});

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			title: undefined,
			description: undefined,
			jobs: [],
		},
	});

	const {
		fields: fieldArrayFields,
		append,
		remove,
	} = useFieldArray({
		control: form.control,
		name: "jobs",
	});

	interface Step {
		fieldName: string;
		title?: string;
		description?: string;
		component: React.ReactNode;
	}
	const steps: Step[] = [
		{
			fieldName: "details",
			title: "Basic Details",
			description:
				"Explain the ins and outs of the contract you want to create",
			component: (
				<div className="space-y-8">
					<Input
						placeholder="ABC Inc. Plumbing Contract"
						{...form.register("title")}
					/>
					<Textarea
						className="max-h-[30vh] min-h-[15vh] overflow-auto"
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
													checked={
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
															// If the job is already in the array, remove it
															const updatedJobs = currentJobs.filter(
																(j) => j.id !== job.id
															);
															form.setValue("jobs", updatedJobs);
														} else {
															// If the job is not in the array, add it
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
	];

	const fields = Object.keys(form.getValues());

	async function onSubmit(values: z.infer<typeof formSchema>) {
		setIsFetching(true);
		console.log(values);
		setIsFetching(false);
	}

	return (
		<Card {...props}>
			<CardHeader>
				<div className="mb-8">
					<Progress value={((formStep + 1) / totalSteps) * 100} />
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
					{formStep < totalSteps - 1 && (
						<Button
							onClick={async () => {
								await form.trigger(fields[formStep] as any);

								const fieldInvalid = form.getFieldState(
									fields[formStep] as any
								).invalid;

								if (!fieldInvalid) {
									handleNextStep();
								}
							}}
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
