import { type Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { env } from "@/env.mjs";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { OAuthSignIn } from "@/components/auth/oauth-login";
import { Shell } from "@/components/shells";
import RegisterForm from "@/components/forms/credential-register";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Suspense } from "react";

export const metadata: Metadata = {
	metadataBase: new URL(env["NEXT_PUBLIC_APP_URL"]),
	title: "Sign Up",
	description: "Sign up for an account",
};
export default async function SignUpPage() {
	const session = await getServerSession(authOptions);
	if (session) redirect("/");
	return (
		<Shell className="max-w-lg">
			<Card>
				<CardHeader className="space-y-1">
					<CardTitle className="text-2xl">Sign up</CardTitle>
					<CardDescription>
						Choose your preferred sign up method
					</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-4">
					<OAuthSignIn />
					<div className="relative">
						<div className="absolute inset-0 flex items-center">
							<span className="w-full border-t" />
						</div>
						<div className="relative flex justify-center text-xs uppercase">
							<span className="bg-background px-2 text-muted-foreground">
								Or continue with
							</span>
						</div>
					</div>
					{/* //TODO: Make a better loading state */}
					<Suspense fallback={<div>Loading...</div>}>
						<RegisterForm />
					</Suspense>
				</CardContent>
				<CardFooter>
					<div className="text-sm text-muted-foreground">
						Already have an account?{" "}
						<Link
							aria-label="Sign in"
							href="/sign-in"
							className="text-primary underline-offset-4 transition-colors hover:underline"
						>
							Sign in
						</Link>
					</div>
				</CardFooter>
			</Card>
		</Shell>
	);
}
