import { type Metadata } from "next";
import Link from "next/link";
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
import { OAuthSignIn } from "@/components/auth/oauth-signin";
import { SignInForm } from "@/components/forms/sign-in";
import { Shell } from "@/components/shells
";
import { CreateCompanyForm } from "@/components/forms/create-company";

export const metadata: Metadata = {
	metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
	title: "Create a Company",
	description: "Register your company on our platform",
};

export default async function SignInPage() {
	const user = await currentUser();
	if (!user) redirect("/");

	return (
		<Shell className="max-w-lg">
			<Card>
				<CardHeader className="space-y-1">
					<CardTitle className="text-2xl">Create your company</CardTitle>
					<CardDescription>
						Register your company to find future leads
					</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-4">
					<CreateCompanyForm />
				</CardContent>
				<CardFooter className="flex flex-wrap items-center justify-between gap-2"></CardFooter>
			</Card>
		</Shell>
	);
}
