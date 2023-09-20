"use client";
import AuthSessionProvider from "@/components/auth-session-provider";
import CreateProjectForm from "@/components/forms/create-project";

export default function CreateProject() {
	return (
		<AuthSessionProvider>
			<div className="w-full h-screen bg-[url('/images/wave.svg')] bg-cover relative xl:bg-bottom">
				<CreateProjectForm className="sm:w-[min(80vw,1000px)] w-[95vw] bg-background absolute right-1/2 top-1/4 translate-x-1/2 -translate-y-1/4" />
			</div>
		</AuthSessionProvider>
	);
}

// export default CreateProject;
