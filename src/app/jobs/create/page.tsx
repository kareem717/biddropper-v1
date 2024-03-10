"use client";

import CreateJobForm from "@/components/forms/job-forms/create-job-form";
import FormShell from "@/components/shells/form";
import { useSession } from "next-auth/react";
import FormShellSkeleton from "@/components/shells/form/skeleton";
import { useRouter } from "next/navigation";
import { Session } from "next-auth";

const CreateJobPage = () => {
  const router = useRouter();
  const session = useSession();

  if (session.status === "loading") return <FormShellSkeleton />;

  if (session.status === "unauthenticated" || !session.data)
    router.push("/login");

  return (
    <FormShell>
      <CreateJobForm session={session.data as Session} />
    </FormShell>
  );
};

export default CreateJobPage;