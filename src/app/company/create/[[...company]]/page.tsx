import { type Metadata } from "next";
import { redirect } from "next/navigation";
import { env } from "@/env.mjs";
import AuthSessionProvider from "@/components/auth-session-provider";


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
			<AuthSessionProvider>
				<CreateCompanyForm />
			</AuthSessionProvider>
		</div>
	);
}
