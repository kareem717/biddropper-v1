import { buttonVariants } from "@/components/ui/button";
import { CreateOrganization, OrganizationProfile } from "@clerk/nextjs";

export default function CreateCompany() {
	return (
		<main>
				<h1 className="text-4xl">
          Create Company
        </h1>

        <CreateOrganization />
        {/* <OrganizationProfile /> */}


		</main>
	);
}
