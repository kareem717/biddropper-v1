"use client";
import { FC, useRef, useState } from "react";
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
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { insertProjectSchema } from "@/lib/validations/projects";
import ImageUploader, { ImageUploaderRef } from "@/components/image-uploader";
import { insertMediaSchema } from "@/lib/validations/posts";
import { insertCompanySchema } from "@/lib/validations/companies";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
interface CreateProjectFormProps {
	userId: string;
}

const formSchema = z.object({
	id: insertProjectSchema.shape.id,
	title: insertProjectSchema.shape.title,
	details: insertProjectSchema.shape.details,
	companyId: insertCompanySchema.shape.id,
});

const CreateProjectForm: FC<CreateProjectFormProps> = ({ userId }) => {
	const imageUploaderRef = useRef<ImageUploaderRef>(null);
	const [formStep, setFormStep] = useState(0);
	const [isFetching, setIsFetching] = useState(false);
	const totalSteps = 3;

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			id: userId,
			title: "",
			details: "",
			companyId: "",
		},
	});

	const handleNextStep = () => {
		setFormStep((prevStep) => {
			if (prevStep < totalSteps - 1) {
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

	function onSubmit(values: z.infer<typeof formSchema>) {
		console.log(values);
	}

	return (
		<div>
			<Card>
				<CardHeader>
					<CardTitle>Create Project</CardTitle>
					<CardDescription>
						Showcase one of your companies recent projects
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
							<FormField
								control={form.control}
								name="title"
                
								render={({ field }) => (
									<FormItem className={cn(formStep === 0 && "hidden")}>
										<FormLabel>Username</FormLabel>
										<FormControl>
											<Input placeholder="shadcn" {...field} />
										</FormControl>
										<FormDescription>
											This is your public display name.
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
					</Form>
				</CardContent>
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
									// await form.trigger(fields[formStep] as any);
									// const fieldInvalid = form.getFieldState(
									// 	fields[formStep] as any
									// ).invalid;
									// if (!fieldInvalid) {
									// 	handleNextStep();
									// }
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
		</div>
	);
};

export default CreateProjectForm;
