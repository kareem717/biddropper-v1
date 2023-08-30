import CreateJobForm from "@/components/forms/create-job-form";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function CreateJob() {
	const session = await getServerSession(authOptions);

	if (!session) {
		redirect("/sign-in");
	}

	return (
		<div className="w-full h-screen bg-[url('/images/wave.svg')] bg-cover relative xl:bg-bottom">
			{/* TODO: add suspense state */}
			<CreateJobForm className="sm:w-[min(80vw,1000px)] w-[95vw] bg-background absolute right-1/2 top-1/4 translate-x-1/2 -translate-y-1/4" />
		</div>
	);
}
