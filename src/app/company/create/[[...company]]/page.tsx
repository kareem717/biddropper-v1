import { type Metadata } from "next";
import { env } from "@/env.mjs";
import AuthSessionProvider from "@/components/auth-session-provider";

import CreateCompanyForm from "@/components/forms/create-company";

export const metadata: Metadata = {
	metadataBase: new URL(env["NEXT_PUBLIC_APP_URL"]),
	title: "Create a Company",
	description: "Register your company on our platform",
};

export default async function CreateCompanyPage() {
	return (
		<AuthSessionProvider>
			<div className="w-full h-screen bg-[url('/images/wave.svg')] bg-cover relative xl:bg-bottom">
				<CreateCompanyForm className="sm:w-[min(80vw,1000px)] w-[95vw] bg-background absolute right-1/2 top-1/4 translate-x-1/2 -translate-y-1/4" />
			</div>
		</AuthSessionProvider>
	);
}
