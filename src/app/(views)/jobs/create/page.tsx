import CreateJobForm from "@/components/forms/job-forms/create-job-form";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function CreateJobPage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");

  return <CreateJobForm session={session} />;
}
