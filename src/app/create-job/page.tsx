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
        <div className="relative h-screen w-full bg-[url('/images/wave.svg')] bg-cover xl:bg-bottom">
          {/* TODO: add suspense state */}
          <CreateJobForm className="absolute right-1/2 top-1/4 w-[95vw] -translate-y-1/4 translate-x-1/2 bg-background sm:w-[min(80vw,1000px)]" />
        </div>
      </QueryClientProvider>
    </AuthSessionProvider>
  );
}
