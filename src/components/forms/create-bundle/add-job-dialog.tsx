import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { DateRange } from "react-day-picker";
import { Input } from "@/components/ui/input";
import React from "react";
import { Icons } from "@/components/icons";
import { Textarea } from "@/components/ui/textarea";
import { industries } from "@/config/industries";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { insertJobSchema } from "@/lib/validations/posts/posts";
import CurrencyInput from "@/components/currency-input";
import useMultistepForm from "@/hooks/use-multistep-form";
import { toast } from "sonner";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
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
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
} from "@/components/ui/command";

const formSchema = insertJobSchema
	.extend({
		dateRange: z.object({
			dateFrom: insertJobSchema.shape.dateFrom,
			dateTo: insertJobSchema.shape.dateTo,
		}),
	})
	.omit({
		id: true,
		userId: true,
		isActive: true,
		bundleId: true,
		createdAt: true,
		updatedAt: true,
		dateFrom: true,
		dateTo: true,
	});

type Inputs = z.infer<typeof formSchema>;

// TODO: Need to shorten this component somehow
const AddJobDialog = () => {
	const today = new Date();
	const tomorrow = new Date(today);
	tomorrow.setDate(tomorrow.getDate() + 1);

	const currencyTypes = [
		{ currency: "USD", icon: Icons.dollarSign },
		{ currency: "EUR", icon: Icons.euro },
		{ currency: "CAD", icon: Icons.dollarSign },
	];

	const [currency, setCurrency] = React.useState<"usd" | "cad" | "eur">("usd");
	const [open, setOpen] = React.useState(false);
	const [date, setDate] = React.useState<DateRange | undefined>({
		from: tomorrow,
		to: undefined,
	});

	const { addFormData, formData } = useMultistepForm();

	const form = useForm<Inputs>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			industry: undefined,
			summary: "",
			budget: undefined,
			dateRange: {
				dateFrom: tomorrow,
				dateTo: undefined,
			},
			currencyType: "usd",
			propertyType: "residential",
		},
		mode: "onBlur",
	});

	const formIsSubmitting = form.formState.isSubmitting;

	const onSubmit = async (data: Inputs) => {
		data.currencyType = currency;

		const jobs = formData.jobs || [];

		if (jobs.some((job) => job.title === data.title)) {
			toast.error("You already have a job with that title");
			return;
		}

		if (jobs.length === 0) {
			addFormData({ jobs: [data] });
		} else {
			addFormData({ jobs: [...jobs, data] });
		}

		setOpen(false);
		setDate({ from: tomorrow, to: undefined });
		setCurrency("usd");
		form.reset();
	};

	return (
		<Dialog
			open={open}
			onOpenChange={() => {
				setOpen(!open);
				form.reset();
			}}
		>
			<DialogTrigger asChild>
				<Button variant="outline" className="w-full mt-6">
					Add Job
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add a job</DialogTitle>
					<DialogDescription>
						Describe a piece of work you need done to complete your renovation
						plan.
					</DialogDescription>
				</DialogHeader>
				<div className="h-[40vh] lg:h-[55vh] overflow-auto">
					<Form {...form}>
						<form
							className="felx flex-col space-y-8 mx-1"
							onSubmit={(...args) => void form.handleSubmit(onSubmit)(...args)}
						>
							{/* Title */}
							<FormField
								control={form.control}
								name={`title`}
								render={({ field }) => (
									<FormItem className="col-span-5">
										<FormLabel>Title</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormDescription>Give this job a title</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
							{/* Summary */}
							<FormField
								control={form.control}
								name={`summary`}
								render={({ field }) => (
									<FormItem className="col-span-5">
										<FormLabel>Summary</FormLabel>
										<FormControl>
											<Textarea {...field} />
										</FormControl>
										<FormDescription>
											Give a brief explanation of this job that describes the
											work you need
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
							{/* Industry Select */}
							<FormField
								control={form.control}
								name={"industry"}
								render={({ field }) => (
									<FormItem className="flex flex-col space-y-2">
										<FormLabel>Industry</FormLabel>
										<FormControl>
											<Popover>
												<PopoverTrigger asChild>
													<FormControl>
														<Button
															variant="outline"
															role="combobox"
															className={cn(
																"justify-between",
																!field.value && "text-muted-foreground"
															)}
														>
															<span className="truncate">
																{field.value
																	? industries.find(
																			(category) =>
																				category.value === field.value
																	  )?.label
																	: "Select industry"}
															</span>
															<Icons.chevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
														</Button>
													</FormControl>
												</PopoverTrigger>
												<PopoverContent className="w-4/5 p-0" align="end">
													<Command>
														<CommandInput placeholder="Search industry..." />
														<CommandEmpty>No industry found.</CommandEmpty>
														<ScrollArea className="h-[max(80px,20vh)]">
															<CommandGroup>
																{industries.map((category) => (
																	<CommandItem
																		{...field}
																		value={category.label}
																		key={category.value}
																		onSelect={() => {
																			form.setValue("industry", category.value);
																		}}
																		className="truncate w-full"
																	>
																		<Icons.check
																			className={cn(
																				"mr-2 h-4 w-4",
																				category.value === field.value
																					? "opacity-100"
																					: "opacity-0"
																			)}
																		/>
																		{category.label}
																	</CommandItem>
																))}
															</CommandGroup>
														</ScrollArea>
													</Command>
												</PopoverContent>
											</Popover>
										</FormControl>
										<FormDescription>
											Select the trade industry that this job belongs to
										</FormDescription>

										<FormMessage />
									</FormItem>
								)}
							/>
							{/* Budget */}
							<FormField
								control={form.control}
								name={`budget`}
								render={({ field }) => (
									<FormItem className="flex flex-col space-y-2 ">
										<FormLabel>Budget</FormLabel>
										<FormControl>
											<div className="relative">
												<CurrencyInput
													onChange={(budget) => {
														field.onChange(`${budget}`);
													}}
													onCurrencyChange={(currency) => {
														if (
															currency === "usd" ||
															currency === "cad" ||
															currency === "eur"
														) {
															setCurrency(currency);
															form.setValue("currencyType", currency);
														}
													}}
													min={20}
													max={2500000}
													currencies={currencyTypes}
													currencyValue="USD"
													required
												/>
											</div>
										</FormControl>
										<FormDescription>
											How much are you willing to pay for this job?
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
							{/* Date Picker */}
							<FormField
								control={form.control}
								name={`dateRange`}
								render={({ field }) => (
									<FormItem className="flex flex-col gap-1 w-full">
										<FormLabel>When do you need it done?</FormLabel>
										<FormControl>
											<Popover>
												<PopoverTrigger asChild>
													<FormControl>
														<Button
															variant={"outline"}
															className={cn(
																"w-full pl-3 text-left font-normal",
																!date && "text-muted-foreground"
															)}
														>
															<Icons.calendar className="mr-2 h-4 w-4" />
															{date?.from ? (
																date.to ? (
																	<>
																		{format(date.from, "LLL dd, y")} -{" "}
																		{format(date.to, "LLL dd, y")}
																	</>
																) : (
																	format(date.from, "LLL dd, y")
																)
															) : (
																<span>Pick a date</span>
															)}
														</Button>
													</FormControl>
												</PopoverTrigger>
												<PopoverContent className="w-auto p-0" align="start">
													<Calendar
														initialFocus
														mode="range"
														defaultMonth={date?.from}
														selected={date}
														onSelect={(date) => {
															if (date && date.from !== undefined) {
																setDate(date);
																form.setValue("dateRange.dateFrom", date.from);
																form.setValue("dateRange.dateTo", date?.to);
															}
														}}
														disabled={(date) => date && date < new Date()}
													/>
												</PopoverContent>
											</Popover>
										</FormControl>
										<FormDescription>
											Select the date or range that you need this job done
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
							{/* Property Type */}
							<FormField
								control={form.control}
								name={`propertyType`}
								render={({ field }) => (
									<FormItem className="w-[200px]">
										<FormLabel>Property Type</FormLabel>
										<FormControl>
											<RadioGroup
												onValueChange={field.onChange}
												defaultValue={field.value}
											>
												<FormItem className="flex items-center space-x-3 space-y-0">
													<FormControl>
														<RadioGroupItem value="residential" />
													</FormControl>
													<FormLabel className="font-normal">
														Residential
													</FormLabel>
												</FormItem>
												<FormItem className="flex items-center space-x-3 space-y-0">
													<FormControl>
														<RadioGroupItem value="commercial" />
													</FormControl>
													<FormLabel className="font-normal">
														Commercial
													</FormLabel>
												</FormItem>
											</RadioGroup>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</form>
					</Form>
				</div>

				<DialogFooter>
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
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default AddJobDialog;
