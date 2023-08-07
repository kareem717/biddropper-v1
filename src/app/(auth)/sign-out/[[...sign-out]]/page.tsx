import { LogOutButtons } from "@/components/auth/logout-buttons";
import { Header } from "@/components/header";
import { Shell } from "@/components/shells";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

// Running out of edge function execution units on vercel free plan
// export const runtime = "edge"

export default async function SignOutPage() {
	const user = await currentUser();
	if (!user) redirect("/");

	return (
		<Shell className="max-w-xs">
			<Header
				title="Sign out"
				description="Are you sure you want to sign out?"
				size="sm"
				className="text-center"
			/>
			<LogOutButtons />
		</Shell>
	);
}
