import { type Metadata } from "next";
import { redirect } from "next/navigation";
import { env } from "@/env.mjs";
import AuthSessionProvider from "@/components/auth-session-provider";

import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Shell } from "@/components/shells";
import { CreateCompanyForm } from "@/components/forms/create-company";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
export const metadata: Metadata = {
	metadataBase: new URL(env["NEXT_PUBLIC_APP_URL"]),
	title: "Create a Company",
	description: "Register your company on our platform",
};

export default async function CreateCompanyPage() {

	return (
		<div className="w-full h-screen bg-[url('/images/circles.svg')] bg-cover relative">
			<Card className="absolute right-1/2 top-1/4 translate-x-1/2 -translate-y-1/4">
				<CardHeader className="space-y-1">
					<CardTitle className="text-2xl">Create your company</CardTitle>
					<CardDescription>
						Register your company to find future leadsdf
					</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-4">
					<AuthSessionProvider>
						<CreateCompanyForm />
					</AuthSessionProvider>
				</CardContent>
				<CardFooter className="flex flex-wrap items-center justify-between gap-2"></CardFooter>
			</Card>
	</div>
		
	);
}
