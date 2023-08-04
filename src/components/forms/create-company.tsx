"use client";

import React from "react";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { userSchema } from "@/lib/validations/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

type Inputs = z.infer<typeof userSchema>;

export function CreateCompanyForm() {
	const form = useForm<Inputs>({
		resolver: zodResolver(userSchema),
		defaultValues: {
			password: "",
		},
	});

	function onSubmit(data: Inputs) {}

	return (
		<Form {...form}>
			<form
				className="grid gap-4"
				onSubmit={(...args) => void form.handleSubmit(onSubmit)(...args)}
			>
				<FormField
					control={form.control}
					name="password"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Confirm Password</FormLabel>
							<FormControl>
								<Input placeholder="*********" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button>button fr</Button>
			</form>
		</Form>
	);
}
