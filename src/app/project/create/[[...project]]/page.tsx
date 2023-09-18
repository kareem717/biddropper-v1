import CreateProjectForm from "@/components/forms/create-project";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

async function CreateProject() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/")
  }

  const userId = session.user.id

	return (
		<div>
			<CreateProjectForm userId={userId} />
		</div>
	);
}

export default CreateProject;
