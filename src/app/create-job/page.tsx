import CreateJobForm from "@/components/forms/create-job";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import React from "react"

export default async function CreateJob() {
	const session = await  getServerSession(authOptions);

	if (!session) {
		redirect("/sign-in");
	}
	return (
		<div>
			<div>CreateJob</div>
			<CreateJobForm />
		</div>
	);
}
