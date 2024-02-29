"use client";

import FormShell from "@/components/shells/form";
import { useSession } from "next-auth/react";
import FormShellSkeleton from "@/components/shells/form/skeleton";
import { useRouter } from "next/navigation";
import { Session } from "next-auth";
import CreateCompanyForm from "@/components/forms/company-forms/create-company-form";

const CreateCompanyPage = () => {
  const router = useRouter();
  const session = useSession();

  if (session.status === "loading") return <FormShellSkeleton />;

  if (session.status === "unauthenticated" || !session.data)
    router.push("/login");

  return (
    <FormShell>
      <CreateCompanyForm session={session.data as Session} />
    </FormShell>
  );
};

export default CreateCompanyPage;
