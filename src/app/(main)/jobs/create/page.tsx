"use client";

import CreateJobForm from "@/components/app/forms/job-forms/create-job-form";
import FormShell from "@/components/app/shells/form";
import { useSession } from "next-auth/react";
import FormShellSkeleton from "@/components/app/shells/form/skeleton";
import { useRouter } from "next/navigation";
import { Session } from "next-auth";
import { useAuthSession } from "@/components/app/providers/use-auth-session";
import { api } from "@/lib/trpc/react";

const CreateJobPage = () => {
  const router = useRouter();
  const { user, session } = useAuthSession();

  if (session === null || user === null) router.push("/login");

  return <FormShell>{user && <CreateJobForm user={user} />}</FormShell>;
};

export default CreateJobPage;
