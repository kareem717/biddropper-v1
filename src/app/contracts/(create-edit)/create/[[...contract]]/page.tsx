import { type Metadata } from "next";
import { redirect } from "next/navigation";
import { env } from "@/env.mjs";
import { currentUser } from "@clerk/nextjs";

import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Shell } from "@/components/shells";
import  CreateContractForm from "@/components/forms/create-contract-form";
import { ScrollArea } from "@/components/ui/scroll-area";

export const metadata: Metadata = {
	metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
	title: "Create a Contract",
	description: "Find the right people to work with",
};

export default async function CreateContractPage() {
	const user = await currentUser();
	if (!user) redirect("/");

	return (
		<Shell className="max-w-lg" variant={"centered"}>
			<Card className="w-[75vw] lg:w-[min(85vw,950px)]">
				<CardHeader className="space-y-1">
					<CardTitle className="text-2xl">Create your company</CardTitle>
					<CardDescription>
						Register your company to find future leads
					</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-4">
					<CreateContractForm />
				</CardContent>
				<CardFooter className="flex flex-wrap items-center justify-between gap-2"></CardFooter>
			</Card>
		</Shell>
	);
}
