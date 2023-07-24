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
import { useToast } from "@/components/ui/use-toast";
import { useUser } from "@clerk/nextjs";
import { newContractSchema } from "@/lib/validations/contracts";

const formSchema = newContractSchema.omit({ userId: true });

const CreateContractForm = () => {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			title: "",
			price: undefined,
			description: "",
			features: [{ name: "Sprinkler heads needed", value: "45" }],
		},
		mode: "all",
	});
	const { toast } = useToast();
	const { register } = form;
	const { user } = useUser();

	const { fields, append } = useFieldArray({
		name: "features",
		control: form.control,
	});

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		if (!user || !user.id) {
			toast({
				variant: "destructive",
				title: "Stranger danger!.",
				description: "You must be signed in to create a contract.",
			});

			return;
		}
		
		const response = await fetch("/api/contracts", {
			method: "POST",
			body: JSON.stringify({
				userId: user.id,
				...values,
			}),
		});
		console.log(response);
		if (response.ok) {
			toast({
				title: "Success!",
				description: "Your contract has been created.",
			});
		} else {
			toast({
				variant: "destructive",
				title: "Uh oh! Something went wrong.",
				description: "There was a problem creating your contract.",
			});
		}
	};

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
					name="price"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Price (CAD)</FormLabel>
							<FormControl>
								<Input placeholder="$6000" {...field} />
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
							<FormLabel>Description</FormLabel>
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
							name={`features.${index}.name`}
							render={({ field }) => (
								<FormItem>
									<FormLabel className={cn(index !== 0 && "sr-only")}>
										Features
									</FormLabel>
									<FormDescription className={cn(index !== 0 && "sr-only")}>
										Add features to your contract that describe the job.
									</FormDescription>
									<div className="flex flex-row gap-2">
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormControl>
											<Input {...register(`features.${index}.value`)} />
										</FormControl>
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
						onClick={() => append({ name: "", value: "" })}
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
