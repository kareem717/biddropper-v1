import { type Metadata } from "next";
import { env } from "@/env.mjs";
import AuthSessionProvider from "@/components/providers/auth-session-provider";

import CreateCompanyForm from "@/components/forms/company-forms/create";

export default async function CreateCompanyPage() {
  return (
    <AuthSessionProvider>
      <CreateCompanyForm />
    </AuthSessionProvider>
  );
}
