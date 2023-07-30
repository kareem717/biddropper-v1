"use client";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
// import { useToast } from "@/components/ui/use-toast";
import { useUser } from "@clerk/nextjs";
import { newContractSchema } from "@/lib/validations/contracts";
import { CrossCircledIcon } from "@radix-ui/react-icons";
import SelectTrade from "../select-trade";

import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import SelectAdd from "../select-add";
const formSchema = newContractSchema.omit({ userId: true });
const groups = [
	{
		label: "Industry",
		items: [
			{
				label: "Lighting",
				value: "lighting",
			},
			{
				label: "Electrical",
				value: "electrical",
			},
			{
				label: "Irrigation",
				value: "irrigation",
			},
			{
				label: "HVAC",
				value: "hvac",
			},
			{
				label: "Plumbing",
				value: "plumbing",
			},
		],
	},
];
const CreateContractForm = () => {
	// const { toast } = useToast();
	const { user } = useUser();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			title: "",
			description: "",
			jobs: [{ type: "", description: "" }],
		},
		mode: "onChange",
	});

	const { fields, append, remove } = useFieldArray({
		name: "jobs",
		control: form.control,
	});

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		if (!user || !user.id) {
			// toast({
			// 	variant: "destructive",
			// 	title: "Stranger danger!.",
			// 	description: "You must be signed in to create a contract.",
			// });

			return;
		}

		console.log(values);

		// const response = await fetch("/api/contracts", {
		// 	method: "POST",
		// 	body: JSON.stringify({
		// 		userId: user.id,
		// 		...values,
		// 	}),
		// });
		// console.log(response);
		// if (response.ok) {
		// 	toast({
		// 		title: "Success!",
		// 		description: "Your contract has been created.",
		// 	});
		// } else {
		// 	toast({
		// 		variant: "destructive",
		// 		title: "Uh oh! Something went wrong.",
		// 		description: "There was a problem creating your contract.",
		// 	});
		// }
	};
	let a = "";
	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="w-2/5">
				<FormField
					control={form.control}
					name="title"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Title</FormLabel>
							<FormControl>
								<Input placeholder="John's Irrigation System" {...field} />
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
									placeholder="Needs 25 rotor heads and 200ft of pipe."
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<div>
					{fields.map((field, index) => (
						<FormField
							control={form.control}
							key={field.id}
							name={`jobs.${index}.type`}
							render={({ field }) => (
								<FormItem>
									<FormLabel className={cn(index !== 0 && "sr-only")}>
										Features
									</FormLabel>
									<FormDescription className={cn(index !== 0 && "sr-only")}>
										Add features to your contract that describe the job.
									</FormDescription>
									<div className="flex flex-row gap-2">
										<FormControl onChange={() => {
											a = field.value;
											console.log(a);
										}}>
											<SelectAdd {...form.register(`jobs.${index}.type`)} />
										</FormControl>
										<FormControl onChange={() => {
											a = field.value;
											console.log(a);
										}}>
											<Input
												{...form.register(`jobs.${index}.description`)}
												placeholder="Value"
											/>
										</FormControl>
										<Button
											variant={"ghost"}
											type="button"
											size="sm"
											onClick={() => remove(index)}
										>
											<CrossCircledIcon className="h-5 w-5" />
										</Button>
									</div>
									<FormMessage />
								</FormItem>
							)}
						/>
					))}

					<Button
						type="button"
						variant="outline"
						size="sm"
						className="mt-2"
						onClick={() => append({ type: "", description: "" })}
					>
						Add Feature
					</Button>
				</div>
				<Button type="submit">Submit</Button>
			</form>
		</Form>
	);
};

export default CreateContractForm;
