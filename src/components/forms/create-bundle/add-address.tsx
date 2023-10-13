import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import React from "react";
import { useMultistepForm } from "@/hooks/use-multistep-form";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
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
import { insertAddressSchema } from "@/lib/validations/references/address";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Icons } from "@/components/icons";
//TODO: need to remove photos is dosen't go thorugh, remove form data if user goes back
const formSchema = insertAddressSchema
	.omit({
		id: true,
		createdAt: true,
		updatedAt: true,
	})
	.extend({
		showExactLocation: z.boolean(),
	});
type Inputs = z.infer<typeof formSchema>;

function AddAddressForm() {
	const router = useRouter();

	const { addFormData, formData } = useMultistepForm();
	const [fetching, setIsFetching] = React.useState(false);

	const form = useForm<Inputs>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			addressLine1: "",
			addressLine2: undefined,
			city: "",
			region: "",
			postalCode: "",
			country: "",
			showExactLocation: false,
		},
	});

	async function onSubmit(data: Inputs) {
		try {
			//TODO: push to create bundle page
			// router.prefetch(`/contracts`);

			const address = {
				addressLine1: data.addressLine1,
				addressLine2: data.addressLine2,
				city: data.city,
				region: data.region,
				postalCode: data.postalCode,
				country: data.country,
			};
			const res = await fetch("/api/posts/bundles", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					address,
					showExactLocation: data.showExactLocation,
					...formData,
				}),
			});

			// const responseBody = await res.json();
			console.log(res.status);
			if (res.status === 200) {
				toast.success("Success!", {
					description: "Your bundle has been created",
				});

				router.replace(`/contracts`);
			}
		} catch (err) {
			console.error(err);
			toast.error("There was an error creating your bundle", {
				description: "Please try again later",
			});
		}
	}

	return (
		<div className="h-[45vh] lg:h-[70vh] overflow-auto">
			<Form {...form}>
				<form
					className="felx flex-col space-y-8 mx-1"
					onSubmit={(...args) => void form.handleSubmit(onSubmit)(...args)}
				>
					<FormField
						control={form.control}
						name="addressLine1"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Line 1</FormLabel>
								<FormControl>
									<Input
										placeholder="123 Sesame St."
										{...field}
										maxLength={70}
									/>
								</FormControl>
								<FormDescription>Address line 1</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="addressLine2"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Line 2</FormLabel>
								<FormControl>
									<Input
										placeholder="Unit #12"
										value={field.value ?? ""}
										onChange={field.onChange}
										onBlur={field.onBlur}
										name={field.name}
										ref={field.ref}
										maxLength={70}
									/>
								</FormControl>
								<FormDescription>Address line 2</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
					<div className="grid grid-cols-2 gap-4">
						<FormField
							control={form.control}
							name="city"
							render={({ field }) => (
								<FormItem>
									<FormLabel>City</FormLabel>
									<FormControl>
										<Input placeholder="Toronto" {...field} maxLength={50} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="region"
							render={({ field }) => (
								<FormItem>
									<FormLabel>State/Province</FormLabel>
									<FormControl>
										<Input placeholder="Ontario" {...field} maxLength={50} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
					<div className="grid grid-cols-2 gap-4">
						<FormField
							control={form.control}
							name="postalCode"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Postal Code</FormLabel>
									<FormControl>
										<Input placeholder="A1B 2C3" {...field} maxLength={10} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="country"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Country</FormLabel>
									<FormControl>
										<Input placeholder="Germany" {...field} maxLength={60} />
									</FormControl>

									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
					<FormField
						control={form.control}
						name="showExactLocation"
						render={({ field }) => (
							<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
								<FormControl>
									<Checkbox
										checked={field.value}
										onCheckedChange={field.onChange}
									/>
								</FormControl>
								<div className="space-y-1 leading-none">
									<FormLabel>Show exact location</FormLabel>
									<FormDescription>
										If enabled, your exact location will be shown on the
										posting. Otherwise, only the postal code will be shown.
									</FormDescription>
								</div>
							</FormItem>
						)}
					/>
					{fetching ? (
						<Button disabled={true} type={"button"}>
							<Icons.spinner
								className="mr-2 h-4 w-4 animate-spin"
								aria-hidden="true"
							/>
							<span className="sr-only">Loading</span>
						</Button>
					) : (
						<Button type="submit" className="w-full">
							Finish and Create
						</Button>
					)}
				</form>
			</Form>
		</div>
	);
}

export default AddAddressForm;
