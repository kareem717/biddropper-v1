"use client";

import CreateJobForm from "@/components/forms/create-job";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { toast } from "sonner";
import { QueryClient, QueryClientProvider } from "react-query";
import AuthSessionProvider from "@/components/providers/auth-session-provider";
export default function CreateJob() {
	const queryClient = new QueryClient();

	return (
		<AuthSessionProvider>
			<QueryClientProvider client={queryClient}>
				{/* Your component JSX */}
				<div className="w-full h-screen bg-[url('/images/wave.svg')] bg-cover relative xl:bg-bottom">
					{/* TODO: add suspense state */}
					<CreateJobForm className="sm:w-[min(80vw,1000px)] w-[95vw] bg-background absolute right-1/2 top-1/4 translate-x-1/2 -translate-y-1/4" />
				</div>
			</QueryClientProvider>
		</AuthSessionProvider>
	);
}
