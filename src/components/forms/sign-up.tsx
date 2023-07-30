"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSignUp } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { catchClerkError } from "@/lib/utils";
import { authSchema } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/icons";
import { PasswordInput } from "@/components/password-input";

type Inputs = z.infer<typeof authSchema>;

export function SignUpForm() {
	const router = useRouter();
	const { isLoaded, signUp } = useSignUp();
	const [isPending, startTransition] = React.useTransition();

	// react-hook-form
	const form = useForm<Inputs>({
		resolver: zodResolver(authSchema),
		defaultValues: {
			firstName: "",
			lastName: "",
			email: "",
			password: "",
		},
		mode: "onBlur",
	});

	function onSubmit(data: Inputs) {
		if (!isLoaded) return;
		console.log(data);
		startTransition(async () => {
			try {
				await signUp.create({
					firstName: data.firstName,
					lastName: data.lastName,
					emailAddress: data.email,
					password: data.password,
				});

				await signUp.prepareEmailAddressVerification({
					strategy: "email_code",
				});

				router.push("/sign-up/verify-email");
				toast.message("Check your email", {
					description: "We sent you a 6-digit verification code.",
				});
			} catch (err) {
				console.log(err);
				catchClerkError(err);
			}
		});
	}

	return (
		<Form {...form}>
			<form
				className="grid gap-4"
				onSubmit={(...args) => void form.handleSubmit(onSubmit)(...args)}
			>
				<FormField
					control={form.control}
					name="firstName"
					render={({ field }) => (
						<FormItem>
							<FormLabel>First Name</FormLabel>
							<FormControl>
								<Input placeholder="John" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="lastName"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Last Name</FormLabel>
							<FormControl>
								<Input placeholder="Doe" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Email</FormLabel>
							<FormControl>
								<Input placeholder="rodneymullen180@gmail.com" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="password"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Password</FormLabel>
							<FormControl>
								<PasswordInput placeholder="**********" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button disabled={isPending}>
					{isPending && (
						<Icons.spinner
							className="mr-2 h-4 w-4 animate-spin"
							aria-hidden="true"
						/>
					)}
					Continue
					<span className="sr-only">Continue to email verification page</span>
				</Button>
			</form>
		</Form>
	);
}
