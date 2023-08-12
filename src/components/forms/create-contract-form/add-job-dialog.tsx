import { contractJobSchema } from "@/lib/validations/contract";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import React from "react";
import { Icons } from "@/components/icons";
import { Textarea } from "@/components/ui/textarea";
import { serviceCategories } from "@/config/services";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
} from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { catchClerkError, cn } from "@/lib/utils";
import { useAddJobDialog } from "@/hooks/use-add-job-dialog";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
type Inputs = z.infer<typeof contractJobSchema>;

const AddJobDialog = React.forwardRef(({}, ref) => {
	const today = new Date();
	const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
	const [open, setOpen] = React.useState(false);
	const { formData, addFormData } = useAddJobDialog();

	const form = useForm<Inputs>({
		resolver: zodResolver(contractJobSchema),
		defaultValues: {
			serviceCategory: "",
			summary: "",
			budget: undefined,
			dateRange: {
				from: tomorrow,
				to: undefined,
			},
			propertyType: "residential",
		},
	});
	const formIsSubmitting = form.formState.isSubmitting;

	console.log(form.getValues());
	const onSubmit = async (data: Inputs) => {
		setOpen(false);
		// if (form.formState.submitCount > 0) {
		// 	toast.error("Stop clicking so fast!", {
		// 		description: "Job has alredy been added.",
		// 	});
		// 	return;
		// }

		try {
			addFormData(form.getValues());
			form.reset();
		} catch (err) {
			catchClerkError(err);
			console.log(err);
		}
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
				<Button variant="outline">Add a job</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add a job</DialogTitle>
					<DialogDescription>
						Describe a piece of work you need done to complete your renovation
						plan.
					</DialogDescription>
				</DialogHeader>
				<ScrollArea className="h-[40vh] lg:h-[55vh]">
					<Form {...form}>
						<form
							className="felx flex-col space-y-8 mx-1"
							onSubmit={(...args) => void form.handleSubmit(onSubmit)(...args)}
						>
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
							<FormField
								control={form.control}
								name={`serviceCategory`}
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
																"w-[200px] justify-between",
																!field.value && "text-muted-foreground"
															)}
														>
															{field.value
																? serviceCategories.find(
																		(category) => category.value === field.value
																  )?.label
																: "Select industry"}
															<Icons.chevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
														</Button>
													</FormControl>
												</PopoverTrigger>
												<PopoverContent className="w-4/5 p-0">
													<Command>
														<CommandInput placeholder="Search industry..." />
														<CommandEmpty>No industry found.</CommandEmpty>
														<ScrollArea className="h-[max(80px,20vh)]">
															<CommandGroup>
																{serviceCategories.map((category) => (
																	<CommandItem
																		{...field}
																		value={category.label}
																		key={category.value}
																		onSelect={() => {
																			form.setValue(
																				"serviceCategory",
																				category.value
																			);
																		}}
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
							<FormField
								control={form.control}
								name={`budget`}
								render={({ field }) => (
									<FormItem className="w-[200px]">
										<FormLabel>Budget</FormLabel>
										<FormControl>
											<Input {...field} placeholder="" inputMode="numeric" />
										</FormControl>
										<FormDescription>
											How much are you willing to pay for this job?
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name={`dateRange`}
								render={({ field }) => (
									<FormItem className="flex flex-col gap-1">
										<FormLabel>When do you need it done?</FormLabel>
										<FormControl>
											<Popover>
												<PopoverTrigger asChild>
													<FormControl>
														<Button
															variant={"outline"}
															className={cn(
																"w-[240px] pl-3 text-left font-normal",
																!field.value?.from && "text-muted-foreground"
															)}
														>
															<Icons.calendar className="mr-2 h-4 w-4" />
															{field.value?.from ? (
																field.value.to ? (
																	<>
																		{format(field.value.from, "LLL dd, y")} -{" "}
																		{format(field.value.to, "LLL dd, y")}
																	</>
																) : (
																	format(field.value.from, "LLL dd, y")
																)
															) : (
																<span>Pick a date</span>
															)}
														</Button>
													</FormControl>
												</PopoverTrigger>
												<PopoverContent className="w-auto p-0" align="start">
													<Calendar
														mode="range"
														defaultMonth={new Date()}
														selected={field.value}
														onSelect={field.onChange}
														disabled={(date) => date < new Date()}
														initialFocus
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
														commercial
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
				</ScrollArea>

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
});

AddJobDialog.displayName = "AddJobDialog";

export default AddJobDialog;
