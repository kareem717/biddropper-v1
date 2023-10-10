"use client";
import { ComponentPropsWithoutRef, FC, useRef, useState } from "react";
import StarRating from "react-stars";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import ImageUploader, { ImageUploaderRef } from "../image-uploader";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { insertReviewSchema } from "@/lib/validations/posts/reviews";
import { insertCompanySchema } from "@/lib/validations/companies";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { redirect, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
interface CreateReviewFormProps extends ComponentPropsWithoutRef<typeof Card> {}

const formSchema = z.object({
	title: insertReviewSchema.shape.title,
	details: insertReviewSchema.shape.details,
	rating: insertReviewSchema.shape.rating,
});

const CreateReview: FC<CreateReviewFormProps> = ({ ...props }) => {
	const session = useSession();
	const params = useParams();

	if (!session) {
		redirect("/");
	}

	if (!params.companyId) {
		redirect("/");
	}

	const companyId = params.companyId;
	const imageUploaderRef = useRef<ImageUploaderRef>(null);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			title: "",
			details: "",
			rating: "",
		},
	});

	async function onSubmit(values: z.infer<typeof formSchema>) {
		const files = await imageUploaderRef.current?.upload();

		const res = await fetch("/api/reviews", {
			method: "POST",
			body: JSON.stringify({
				...values,
				companyId: companyId[0],
				reviewMedia: files,
			}),
		});
	}

	console.log(form.getValues());
	return (
		<Form {...form}>
			<Card {...props}>
				<CardHeader>
					<CardTitle>Create Review</CardTitle>
					<CardDescription>
						Leave a review of your experience with this company.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						<FormField
							control={form.control}
							name={"rating"}
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										How satisfied were you with your experience?
									</FormLabel>
									<FormControl>
										<StarRating
											className="space-x-4 mx-auto"
											color1="black"
											count={5}
											value={Number(field.value)}
											onChange={(number) => field.onChange(String(number))}
											size={35}
											color2={"#16a34a"}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name={"title"}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Title</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormDescription />
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name={"details"}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Details</FormLabel>
									<FormDescription>
										Write about your encounter with this company.
									</FormDescription>
									<FormControl>
										<Textarea {...field} className="max-h-[15vh]" />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Accordion type="single" collapsible>
							<AccordionItem value="item-1">
								<AccordionTrigger>Upload Images</AccordionTrigger>
								<AccordionContent className="max-h-[20vh] overflow-auto">
									<ImageUploader
										maxFiles={3}
										ref={imageUploaderRef}
										onClientUploadComplete={() => {
											console.log("client upload complete");
										}}
										onUploadError={(error) => {
											console.log(error);
										}}
										className="overflow-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
									/>
								</AccordionContent>
							</AccordionItem>
						</Accordion>
					</form>
				</CardContent>
				<CardFooter>
					<Button className="w-full" onClick={form.handleSubmit(onSubmit)}>
						Create
					</Button>
				</CardFooter>
			</Card>
		</Form>
	);
};

export default CreateReview;
