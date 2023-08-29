"use client";

import { useState } from "react";
import ComboBox from "@/components/combo-box";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { industries } from "@/config/industries";
import { Shell } from "@/components/shells";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { insertJobSchema } from "@/lib/validations/posts";
import { Icons } from "@/components/icons";
import { toast } from "sonner";
import {
	Form,
	FormControl,
	FormDescription,
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

export default function CreateJobForm() {
	const userId = useSession().data?.user?.id;
	const totalSteps = 4;

	const [formStep, setFormStep] = useState<number>(0);
	const [isCommercial, setIsCommercial] = useState<boolean>(false);
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
	console.log(form.getValues());
	const steps: Step[] = [
		{
			fieldName: "industry",
			title: "What do you need done?",
			description:
				"Choose a task that best describes the work you need done on your home",
			component: (
				<ComboBox
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
			component: (
				<>
					<RadioGroup
						defaultValue={form.getValues("propertyType")}
						onValueChange={(value) => {
							form.setValue("propertyType", value as any);
						}}
					>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="detached" id="detached" />
							<Label htmlFor="detached">Detached</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="apartment" id="apartment" />
							<Label htmlFor="apartment">Apartment</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="semi-detached" id="semi-detached" />
							<Label htmlFor="semi-detached">Semi-Detached</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="town-house" id="town-house" />
							<Label htmlFor="town-house">Town House</Label>
						</div>
					</RadioGroup>
					<div className="items-top flex space-x-2">
						<Checkbox
							id="commercial-property"
							checked={isCommercial}
							onCheckedChange={(value) => {
								setIsCommercial(!isCommercial);
							}}
						/>
						<div className="grid gap-1.5 leading-none">
							<label
								htmlFor="commercial-property"
								className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
							>
								This is a commercial property
							</label>
						</div>
					</div>
				</>
			),
		},
		{
			fieldName: "timeHorizon",
			title: "When do you want to start this project?",
			component: (
				<>
					<RadioGroup
						defaultValue={form.getValues("propertyType")}
						onValueChange={(value) => {
							form.setValue("timeHorizon", value as any);
						}}
					>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="asap" id="asap" />
							<Label htmlFor="asap">ASAP</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="one-week" id="one-week" />
							<Label htmlFor="one-week">Within a week</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="two-weeks" id="two-weeks" />
							<Label htmlFor="two-weeks">Within two weeks</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="one-month" id="one-month" />
							<Label htmlFor="one-month">Within a month</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="flexible" id="flexible" />
							<Label htmlFor="flexible">Time is flexible</Label>
						</div>
					</RadioGroup>
				</>
			),
		},
		{
			fieldName: "details",
			title: "Details",
			description: "Provide some details about your project",
			component: (
				<Textarea
					className="max-h-[15vh] overflow-auto"
					{...form.register("details")}
				/>
			),
		},
	];

	const fields = Object.keys(form.getValues());

	async function onSubmit(values: z.infer<typeof formSchema>) {
		setIsFetching(true);

		const res = await fetch("/api/posts/jobs", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				userId,
				industry: values.industry,
				propertyType: values.propertyType,
				timeHorizon: values.timeHorizon,
				details: values.details,
				isCommercialProperty: isCommercial,
			}),
		});

		const body = await res.json();

		if (res.status === 200) {
			toast.success("Success!", {
				description: "Your job has been created",
			});
		}

		console.log(body);
		setIsFetching(false);
	}

	return (
		<div>
			<Shell>
				{`formStep: ${formStep === totalSteps - 1}`}
				{`${form.getValues("propertyType")}`}
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-8"
						id="job-form"
					>
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
										{step.title && <FormLabel>{step.title}</FormLabel>}

										{step.description && (
											<FormDescription>{step.description}</FormDescription>
										)}
										<FormControl>{step.component}</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						))}
					</form>
				</Form>
				<div className="flex w-full gap-2">
					{formStep > 0 && !isFetching && (
						<Button onClick={handlePreviousStep} className="w-full">
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
								Finish and Create
							</Button>
						))}
				</div>
			</Shell>
		</div>
	);
}
