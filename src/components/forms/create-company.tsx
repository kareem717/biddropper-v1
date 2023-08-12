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
import { createCompanySchema } from "@/lib/validations/company";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useAuth } from "@clerk/nextjs";
import CreateClerkOrg from "@/app/_actions/create-clerk-org";
import { catchClerkError, cn } from "@/lib/utils";
import { redirect, useRouter } from "next/navigation";
import { Icons } from "../icons";
import { serviceCategories } from "@/config/services";
import { toast } from "sonner";
import { Textarea } from "../ui/textarea";

const formSchema = createCompanySchema.omit({ slug: true });
type Inputs = z.infer<typeof formSchema>;

export function CreateCompanyForm() {
	const router = useRouter();
	const { userId } = useAuth();

	if (!userId) redirect("/sign-in");

	const [values, setValues] = React.useState<string[]>([]);
	const toggleValue = (value: string) => {
		setValues((currentValues) =>
			currentValues.includes(value)
				? currentValues.filter((currentValue) => currentValue !== value)
				: [...currentValues, value]
		);
	};

	const createSlug = (str: string) => {
		return str
			.toLowerCase()
			.replace(/'/g, "")
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-+|-+$/g, "");
	};

	const form = useForm<Inputs>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			max_allowed_memberships: 3,
			created_by: userId,
			services: undefined,
			private_metadata: {},
			public_metadata: {},
			invitees: [],
			tagline: "",
		},
	});
	const formIsSubmitting = form.formState.isSubmitting;

	const { fields, append, remove } = useFieldArray({
		name: "invitees",
		control: form.control,
	});

	const onSubmit = async (data: Inputs) => {
		if (form.formState.submitCount > 0) return;

		if (!data.services || data.services.length < 1) {
			form.setError("services", {
				type: "manual",
				message: "Please select at least one service",
			});

			return;
		}

		try {
			router.prefetch("/");

			await CreateClerkOrg({
				name: data.name,
				slug: createSlug(data.name),
				max_allowed_memberships: 3,
				created_by: userId,
				private_metadata: {},
				public_metadata: {},
				services: data.services,
				invitees: data.invitees,
				tagline: data.tagline,
			});

			toast.message("Organization created successfully");
			form.reset();
			router.push("/");
		} catch (err) {
			catchClerkError(err);
			console.log(err);
		}
	};

	return (
		<Form {...form}>
			<form
				className="grid gap-4"
				onSubmit={(...args) => void form.handleSubmit(onSubmit)(...args)}
			>
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
					name="services"
					render={({ field }) => (
						<FormItem className="flex flex-col">
							<FormLabel>Offered Services</FormLabel>
							<Popover>
								<PopoverTrigger asChild>
									<FormControl>
										<Button
											variant="outline"
											role="combobox"
											className={cn(
												" justify-between",
												!field.value && "text-muted-foreground"
											)}
										>
											{values.length > 0
												? `${values.length} service(s) selected`
												: "Select industry"}
											<Icons.chevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
										</Button>
									</FormControl>
								</PopoverTrigger>
								<PopoverContent className="w-full p-0">
									<Command>
										<CommandInput placeholder="Search industry..." />
										<CommandEmpty>No industry found.</CommandEmpty>
										<CommandGroup>
											{serviceCategories.map((category) => (
												<CommandItem
													value={category.label}
													key={category.value}
													onSelect={() => {
														toggleValue(category.value);
														form.setValue(
															"services",
															values.includes(category.value)
																? values.filter(
																		(currentValue) =>
																			currentValue !== category.value
																  )
																: [...values, category.value]
														);
													}}
												>
													<Icons.check
														className={cn(
															"mr-2 h-4 w-4",
															values.includes(category.value)
																? "opacity-100"
																: "opacity-0"
														)}
													/>
													{category.label}
												</CommandItem>
											))}
										</CommandGroup>
									</Command>
								</PopoverContent>
							</Popover>
							<FormDescription>
								These are the services you offer to your customers.
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="tagline"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Company Tagline</FormLabel>
							<FormControl>
								<Textarea {...field} />
							</FormControl>
							<FormDescription>
								Use your tagline to briefly describe what your organization
								does.
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				<div>
					{fields.map((field, index) => (
						<FormField
							control={form.control}
							key={field.id}
							name={`invitees.${index}.email`}
							render={({ field }) => (
								<FormItem>
									<FormLabel className={cn(index !== 0 && "sr-only")}>
										Company Members
									</FormLabel>
									<FormDescription className={cn(index !== 0 && "sr-only")}>
										Enter the email addresses of the people you want to invite
										to your company.
									</FormDescription>
									<FormControl>
										<div className="grid grid-cols-8 gap-2">
											<Input
												{...field}
												className="col-span-7"
												placeholder="abc@example.com"
												type="email"
												id={`invitees.${index}.email`}
											/>
											<Button type="button" onClick={() => remove(index)}>
												<Icons.close className="h-full w-full" />
											</Button>
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					))}
					<Button
						type="button"
						variant="outline"
						size="sm"
						className="mt-2 w-full"
						onClick={() => {
							if (fields.length >= 2) {
								form.setError(`invitees.1.email`, {
									type: "manual",
									message: "You can only invite up to 2 members",
								});
							} else {
								append({ email: "" });
							}
						}}
					>
						<Icons.add className="mr-2 h-4 w-4" />
						Add Member
					</Button>
				</div>

				<Button disabled={formIsSubmitting}>
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
			</form>
		</Form>
	);
}
