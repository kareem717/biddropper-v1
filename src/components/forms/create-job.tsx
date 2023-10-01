"use client";

import { useState, FC, ComponentPropsWithoutRef } from "react";
import ComboBox from "@/components/combo-box/basic";
import { industries } from "@/config/industries";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { insertJobSchema } from "@/lib/validations/posts";
import { Icons } from "@/components/icons";
import { toast } from "sonner";
import CustomRadioButtons from "@/components/custom-radio-buttons";
import { useRouter } from "next/navigation";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
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
import CompanySelect from "../select-company";

interface CreateJobFormProps extends ComponentPropsWithoutRef<typeof Card> {
	companies?: {
		name: string;
		id: string;
	}[];
	userId: string;
	onSuccessRedirect?: string;
}

const CreateJobForm: FC<CreateJobFormProps> = ({
	companies,
	userId,
	onSuccessRedirect,
	...props
}) => {
	const totalSteps = 4;
	const router = useRouter();

	const [formStep, setFormStep] = useState<number>(0);
	const [company, setCompany] = useState<string | undefined>(undefined);
	const [isCommercial, setIsCommercial] = useState<boolean>(false);
	const [isFetching, setIsFetching] = useState<boolean>(false);

	const formSchema = insertJobSchema.pick({
		industry: true,
		propertyType: true,
		timeHorizon: true,
		details: true,
	});

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			industry: "lawn-maintenance",
			propertyType: undefined,
			timeHorizon: undefined,
			details: "",
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
			fieldName: "industry",
			title: "What do you need done?",
			description:
				"Choose a task that best describes the work you need done on your home.",
			component: (
				<ComboBox
					buttonClassName="w-full"
					contentClassName="w-full max-h-[max(200px,25vh)] overflow-auto"
					defaultValue={form.getValues("industry")}
					options={industries}
					emptyText="Select An Industry"
					notFoundText="No Industry Found"
					onSelect={(value) => {
						form.setValue("industry", value);
					}}
				/>
			),
		},
		{
			fieldName: "propertyType",
			title: "What type of property do you have?",
			description: "Select the type of property you need work done on.",
			component: (
				<div className="space-y-8">
					<CustomRadioButtons
						className="w-1/2 h-1/2 mx-auto"
						onValueChange={(value) => {
							form.setValue("propertyType", value as any);
						}}
						buttons={[
							{
								icon: Icons.home as any,
								label: "Detached",
								value: "detached",
							},
							{
								icon: Icons.building as any,
								label: "Apartment",
								value: "apartment",
							},
							{
								icon: Icons.building2 as any,
								label: "Semi-Detached",
								value: "semi-detached",
							},
							{
								icon: Icons.attachedBuilding as any,
								label: "Townhouse",
								value: "town-house",
							},
						]}
					/>
					<div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
						<Checkbox
							checked={isCommercial}
							onCheckedChange={(value) => setIsCommercial(!isCommercial)}
						/>
						<div className="space-y-1 leading-none">
							<label
								htmlFor="terms1"
								className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
							>
								Commercial Property
							</label>
							<p className="text-sm text-muted-foreground">
								Select this option if a business operates out of this property
								or you are a commercial manager.
							</p>
						</div>
					</div>
				</div>
			),
		},
		{
			fieldName: "timeHorizon",
			title: "When do you want to start this project?",
			component: (
				<Select
					onValueChange={(value) => form.setValue("timeHorizon", value as any)}
					defaultValue={form.getValues("timeHorizon" as any)}
				>
					<SelectTrigger className="w-full">
						<SelectValue placeholder="Select a time frame" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="asap">As soon as possible</SelectItem>
						<SelectItem value="one-week">Within a week</SelectItem>
						<SelectItem value="two-weeks">Within two weeks</SelectItem>
						<SelectItem value="one-month">Within a month</SelectItem>
						<SelectItem value="flexible">
							The time schedule is flexible
						</SelectItem>
					</SelectContent>
				</Select>
			),
		},
		{
			fieldName: "details",
			title: "Final details",
			description: companies
				? "Provide any useful details about your project, and select the company you'd like to post this job for or leave empty if you'd like to post it on your personal account."
				: "Provide any useful details about your project.",
			component: (
				<div>
					<Textarea
						className="max-h-[30vh] min-h-[15vh] overflow-auto"
						{...form.register("details")}
					/>
					{/* //TODO: ptolly a better wawy to do this. Test as i did not */}
					<CompanySelect
						value={company}
						companies={companies}
						onValueChange={setCompany}
					/>
				</div>
			),
		},
	];

	const fields = Object.keys(form.getValues());

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

	async function onSubmit(values: z.infer<typeof formSchema>) {
		setIsFetching(true);

		const res = await fetch("/api/posts/jobs", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Job-Creator-Type": company ? "company" : "user",
			},
			body: JSON.stringify({
				userId,
				companyId: company || null,
				industry: values.industry,
				propertyType: values.propertyType,
				timeHorizon: values.timeHorizon,
				details: values.details,
				isCommercialProperty: isCommercial,
			}),
		});

		const body = await res.json();
		if (res.status === 201) {
			toast.success("Job created successfully");
			router.replace(onSuccessRedirect || "/");
		} else {
			toast.error("Failed to create job");

			setIsFetching(false);
		}
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

export default CreateJobForm;
