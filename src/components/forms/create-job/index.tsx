"use client";

import { useState } from "react";
import ComboBox from "@/components/combo-box";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { industries } from "@/config/industries";
import { Shell } from "@/components/shells";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button";
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
import { Checkbox } from "@/components/ui/checkbox";

import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

interface Step {
	fieldName: string;
	title?: string;
	description?: string;
	component: React.ReactNode;
}
const formSchema = z.object({
	industry: z.string().min(2).max(50),
	propertyType: z.string().min(2).max(50),
	startDate: z.number().min(2).max(50).nullable(),
	details: z.string().min(2).max(3000),
});

export default function CreateJobForm() {
  const userId = useSession().data?.user?.id
	const [formStep, setFormStep] = useState(0);
	const [startDateType, setStartDateType] = useState<
		"weeks" | "months" | "years"
	>("weeks");
	const [timeFlexible, setTimeFlexible] = useState(false);
	const totalSteps = 4;

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			industry: "lawn-maintenance",
			propertyType: "apartment",
			startDate: undefined,
			details: "",
		},
	});
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
						form.setValue("industry", value, {
							shouldValidate: true,
						});
					}}
				/>
			),
		},
		{
			fieldName: "propertyType",
			title: "What type of property do you have?",
			component: (
				<RadioGroup
					defaultValue={form.getValues("propertyType")}
					onValueChange={(value) => {
						form.setValue("propertyType", value);
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
						<RadioGroupItem value="townhouse" id="townhouse" />
						<Label htmlFor="townhouse">Townhouse</Label>
					</div>
				</RadioGroup>
			),
		},
		{
			fieldName: "startDate",
			title: "When do you want to start this project?",
			component: (
				<>
					<div className="flex items-center space-x-2">
						<Input
							type="number"
							onChange={(value) => {
								form.setValue("startDate", Number(value.target.value));
							}}
							disabled={timeFlexible}
						/>
						<Select
							defaultValue="weeks"
							value={startDateType}
							disabled={timeFlexible}
							onValueChange={(value) => {
								if (
									value === "weeks" ||
									value === "months" ||
									value === "years"
								) {
									setStartDateType(value);
								}
							}}
						>
							<SelectTrigger className="w-1/3 truncate">
								<SelectValue placeholder="Select a currency" />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectItem value="weeks">Weeks</SelectItem>
									<SelectItem value="months">Months</SelectItem>
									<SelectItem value="years">Years</SelectItem>
								</SelectGroup>
							</SelectContent>
						</Select>
					</div>
					<div className="items-top flex space-x-2">
						<Checkbox
							id="time-flexible"
							checked={timeFlexible}
							onCheckedChange={(value) => {
								setTimeFlexible(!timeFlexible);
								form.setValue("startDate", null);
							}}
						/>
						<div className="grid gap-1.5 leading-none">
							<label
								htmlFor="time-flexible"
								className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
							>
								I&#39;m flexible with the start date
							</label>
						</div>
					</div>
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
					onChange={(value) => {
						form.setValue("details", value.target.value);
					}}
				/>
			),
		},
	];

	const fields = Object.keys(form.getValues());

	const handleNextStep = () => {
		console.log(form.getValues());
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
    const res = await fetch("/api/posts/jobs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        ...values,
      }),
    });

    const body = await res.json()
    console.log(body);
	}

	return (
		<div>
			<Shell>
				{`${form.getValues("propertyType")}`}
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
						<FormField
							control={form.control}
							name={fields[formStep] as any}
							render={({ field }) => (
								<FormItem className="transition duration-300">
									{steps[formStep]?.title && (
										<FormLabel>{steps[formStep]?.title}</FormLabel>
									)}

									{steps[formStep]?.description && (
										<FormDescription>
											{steps[formStep]?.description}
										</FormDescription>
									)}
									<FormControl>{steps[formStep]?.component}</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						{formStep === totalSteps - 1 && (
							<div className="flex w-full gap-2">
								<Button type="submit" className="w-full">
									Submit
								</Button>
							</div>
						)}
					</form>
				</Form>
				{formStep < totalSteps - 1 && (
					<div className="flex w-full gap-2">
						{formStep > 0 && (
							<Button onClick={handlePreviousStep} className="w-full">
								Back
							</Button>
						)}
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
					</div>
				)}
			</Shell>
		</div>
	);
}
