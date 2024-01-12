"use client";
import AuthSessionProvider from "@/components/providers/auth-session-provider";
import CreateProjectForm from "@/components/forms/create-project";

export default function CreateProject() {
  return (
    <AuthSessionProvider>
      <div className="relative h-screen w-full bg-[url('/images/wave.svg')] bg-cover xl:bg-bottom">
        <CreateProjectForm className="absolute right-1/2 top-1/4 w-[95vw] -translate-y-1/4 translate-x-1/2 bg-background sm:w-[min(80vw,1000px)]" />
      </div>
    </AuthSessionProvider>
  );
}

// export default CreateProject;
