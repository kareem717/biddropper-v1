"use server";

import { env } from "@/env.mjs";
import { Clerk } from "@clerk/backend";
import { type CreateCompanySchema } from "@/lib/validations/company";

export default async function CreateClerkOrg(
	organization: CreateCompanySchema
) {
	console.log("Creating company");
	const clerk = Clerk({ apiKey: env["CLERK_SECRET_KEY"] });

	const createdCompany = await clerk.organizations.createOrganization({
		name: organization.name,
		slug: organization.slug,
		maxAllowedMemberships: organization.max_allowed_memberships,
		createdBy: organization.created_by,
		privateMetadata: organization.private_metadata,
		publicMetadata: {
			...organization.public_metadata,
			services: organization.services,
			tagline: organization.tagline,
		},
	});

	if (organization.invitees && organization.invitees.length > 0) {
		organization.invitees.forEach(async (invitee) => {
			await clerk.organizations.createOrganizationInvitation({
				organizationId: createdCompany.id,
				emailAddress: invitee.email,
				inviterUserId: organization.created_by,
				role: "basic_member",
			});
		});
	}

	return createdCompany;
}
