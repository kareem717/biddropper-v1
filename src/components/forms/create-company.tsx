"use client";

import {
	Form,
	FormControl,
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
	insertCompanySchema,
	insertCompanyProfileSchema,
} from "@/lib/validations/companies";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Icons } from "../icons";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { Calendar } from "../ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
const formSchema = z.object({
	id: insertCompanySchema.shape.id,
	name: insertCompanySchema.shape.name,
	yearEstablished: insertCompanyProfileSchema.shape.yearEstablished,
});
type Inputs = z.infer<typeof formSchema>;

export function CreateCompanyForm() {
	const router = useRouter();
	const session = useSession();
	if (!session) {
		router.replace("/sign-in");
	}
	const userId = session.data?.user?.id;
	const [isFetching, setIsFetching] = useState<boolean>(false);
	
	const form = useForm<Inputs>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			id: `comp_${crypto.randomUUID()}`,
			name: "",
			yearEstablished: new Date(),
		},
	});
	
	console.log(form.getValues())
	const onSubmit = async (data: Inputs) => {
		setIsFetching(true);

		const res = await fetch("/api/companies", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				ownerId: userId,
				...data,
			}),
		});

		if (!res.ok) {
			setIsFetching(false);
			toast.error("Something went wrong", {
				description: "Please try again later",
			});
		} else {
			toast.success("Success", {
				description: "Your company has been created",
			});
			router.replace("/");
		}
	};

	return (
		<>
			<Form {...form}>
				<form
					id="company-form"
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
						name="yearEstablished"
						render={({ field }) => (
							<FormItem className="flex flex-col gap-1">
								<FormLabel>Year Established</FormLabel>
								<FormControl>
									<Popover>
										<PopoverTrigger asChild>
											<FormControl>
												<Button
													variant={"outline"}
													className={cn(
														"w-[240px] pl-3 text-left font-normal",
														!field.value && "text-muted-foreground"
													)}
												>
													{field.value ? (
														format(field.value, "PPP")
													) : (
														<span>Pick a date</span>
													)}
													<Icons.calendar className="ml-auto h-4 w-4 opacity-50" />
												</Button>
											</FormControl>
										</PopoverTrigger>
										<PopoverContent className="w-auto p-0" align="start">
											<Calendar
												mode="single"
												selected={field.value}
												onSelect={field.onChange}
												disabled={(date) =>
													date > new Date() || date < new Date("1900-01-01")
												}
												initialFocus
											/>
										</PopoverContent>
									</Popover>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</form>
			</Form>
			{isFetching ? (
				<Button disabled={true} type={"button"} className="w-full">
					<Icons.spinner
						className="mr-2 h-4 w-4 animate-spin"
						aria-hidden="true"
					/>
					<span className="sr-only">Loading</span>
				</Button>
			) : (
				<Button type="submit" form="company-form" className="w-full">
					<span className="hidden sm:block">Create</span>
				</Button>
			)}
		</>
	);
}
