"use client";

import React from "react";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
} from "@/components/ui/command";
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
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { createContractSchema } from "@/lib/validations/contract";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@clerk/nextjs";
import CreateClerkOrg from "@/app/_actions/create-clerk-org";
import { catchClerkError, cn } from "@/lib/utils";
import { redirect, useRouter } from "next/navigation";
import { serviceCategories } from "@/config/services";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import AddJobDialog from "./add-job-dialog";
import { useAddJobDialog } from "@/hooks/use-add-job-dialog";
import { Label } from "@/components/ui/label";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { usePlacesWidget } from "react-google-autocomplete";
import AutoComplete from "react-google-autocomplete";
const formSchema = createContractSchema.omit({
	jobs: true,
});
type Inputs = z.infer<typeof formSchema>;

export default function CreateContractForm() {
	const router = useRouter();
	const { userId } = useAuth();
	const { formData } = useAddJobDialog();
	if (!userId) redirect("/sign-in");

	const form = useForm<Inputs>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			userId,
			title: "",
			description: "",
		},
	});

	const formIsSubmitting = form.formState.isSubmitting;

	const onSubmit = async (data: Inputs) => {
		if (!formData?.length) {
			toast.error("Please add at least one job to the contract");
			return;
		}

		console.log(formData);

		try {
			toast.message("Contract created successfully");
		} catch (err) {
			catchClerkError(err);
			console.log(err);
		}
	};

	return (
		<>
			<ScrollArea className="h-[40vh] lg:h-[55vh]">
				<Form {...form}>
					<form
						className="grid gap-4 mx-1"
						onSubmit={(...args) => void form.handleSubmit(onSubmit)(...args)}
					>
						<FormField
							control={form.control}
							name="title"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Contract Title</FormLabel>
									<FormControl>
										<Input {...field} placeholder="Full Garage Renovation" />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Contract Description</FormLabel>
									<FormControl>
										<Textarea
											{...field}
											placeholder="We are looking to renovate our entire garage..."
										/>
									</FormControl>
									<FormDescription>
										Explain the the contract in it&#39;s entirety.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<Label>Jobs</Label>

						<Table>
							<TableCaption>A list of the jobs in this contract.</TableCaption>
							<TableHeader>
								<TableRow>
									<TableHead className="w-[150px]">Job</TableHead>
									<TableHead>Description</TableHead>
									<TableHead className="w-[150px]">Industry</TableHead>
									<TableHead className="w-[150px]">Date</TableHead>
									{/* <TableHead className="text-right">Budget</TableHead> */}
								</TableRow>
							</TableHeader>
							<TableBody>
								{formData?.map((job, index) => {
									return (
										<TableRow key={index}>
											<TableCell className="font-medium">{job.title}</TableCell>
											<TableCell>{job.summary}</TableCell>
											<TableCell>
												{
													serviceCategories.find(
														(category) => category.value === job.serviceCategory
													)?.label
												}
											</TableCell>
											<TableCell>
												{job.dateRange && job.dateRange.from ? (
													job.dateRange.to ? (
														<>
															{format(job.dateRange.from, "LLL dd, y")} -{" "}
															{format(job.dateRange.to, "LLL dd, y")}
														</>
													) : (
														format(job.dateRange.from, "LLL dd, y")
													)
												) : (
													<span>Unspecified</span>
												)}
											</TableCell>
											{/* <TableCell className="text-right">{job.budget}</TableCell> */}
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
						<AddJobDialog />
					</form>
				</Form>
			</ScrollArea>
			<Button
				disabled={formIsSubmitting}
				type="button"
				onClick={() => {
					form.handleSubmit(onSubmit)();
				}}
			>
				{formIsSubmitting ? (
					<Icons.spinner
						className="mr-2 h-4 w-4 animate-spin"
						aria-hidden="true"
					/>
				) : (
					"Create"
				)}
				<span className="sr-only">Create company</span>
			</Button>
		</>
	);
}
