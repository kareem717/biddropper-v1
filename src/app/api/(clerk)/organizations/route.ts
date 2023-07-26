import { db } from "@/db";
import { env } from "@/env.mjs";
import { verifySvixSignature } from "@/lib/server-helpers";
import { type ClerkWebhookEvent } from "@/types";
import { eq, sql } from "drizzle-orm";
import {
	organizationMemberships,
	organizations,
	organizationsArchive,
	organizationMembershipsArchive,
} from "drizzle/schema";
export async function POST(req: Request) {
	let event: ClerkWebhookEvent;

	try {
		event = await verifySvixSignature(
			req,
			env["CLERK_ORGANIZATION_WEBHOOK_SECRET"]
		);
	} catch (err) {
		console.error("Webhook validation error:", err);
		return new Response("Invalid webhook.", { status: 401 });
	}

	const data = JSON.stringify(event.data);

	switch (event.type) {
		case "organization.created":
		case "organization.updated":
			try {
				await db.execute(
					sql`INSERT INTO organizations (json) VALUES (${data}) ON DUPLICATE KEY UPDATE json = ${data}`
				);
			} catch (err) {
				console.log(err);

				return new Response("Error inserting organization into database.", {
					status: 500,
				});
			}

			return new Response(
				"Organization and related data have been inserted or updated in the database.",
				{ status: 200 }
			);

		case "organization.deleted":
			const organizationId = event.data.id as string;

			try {
				await db.transaction(async (tx) => {
					const organization = await tx
						.select({ json: organizations.json })
						.from(organizations)
						.where(eq(organizations.id, organizationId))
						.limit(1);

					if (!organization[0]) {
						throw new ReferenceError("User not found.");
					}

					await tx.insert(organizationsArchive).values(organization);
					await tx
						.delete(organizations)
						.where(eq(organizations.id, organizationId));
				});
			} catch (err) {
				console.log(err);

				return new Response("Error inserting organization into database.", {
					status: 500,
				});
			}

			return new Response(
				"Organization has been archived and deleted from the database.",
				{ status: 200 }
			);

		case "organizationMembership.created":
		case "organizationMembership.updated":
			try {
				await db.execute(
					sql`INSERT INTO organization_memberships (json) VALUES (${data}) ON DUPLICATE KEY UPDATE json = ${data}`
				);
			} catch (err) {
				console.log(err);

				return new Response(
					"Error inserting organization membership into database.",
					{
						status: 500,
					}
				);
			}

			return new Response(
				"Organization membership and related data have been inserted or updated in the database.",
				{ status: 200 }
			);

		case "organizationMembership.deleted":
			const organizationMembershipId = event.data.id as string;

			try {
				await db.transaction(async (tx) => {
					const organizationMembership = await tx
						.select({ json: organizationMemberships.json })
						.from(organizationMemberships)
						.where(eq(organizationMemberships.id, organizationMembershipId))
						.limit(1);

					if (!organizationMembership[0]) {
						throw new ReferenceError("Organization membership not found.");
					}

					await tx
						.insert(organizationMembershipsArchive)
						.values(organizationMembership);
					await tx
						.delete(organizationMemberships)
						.where(eq(organizationMemberships.id, organizationMembershipId));
				});
			} catch (err) {
				console.log(err);

				if (err instanceof ReferenceError) {
					return new Response(err.message, { status: 404 });
				}

				return new Response(
					"Error inserting organization membership into database.",
					{
						status: 500,
					}
				);
			}

			return new Response(
				"Organization membership has been archived and deleted from the database.",
				{ status: 200 }
			);

		case "organizationInvitation.created":
		case "organizationInvitation.accepted":
		case "organizationInvitation.revoked":
			try {
				await db.execute(
					sql`INSERT INTO organization_invitations (json) VALUES (${data}) ON DUPLICATE KEY UPDATE json = ${data}`
				);
			} catch (err) {
				console.log(err);

				return new Response(
					"Error inserting organization invitation into database.",
					{
						status: 500,
					}
				);
			}

			return new Response(
				"Organization invitation and related data have been inserted or updated in the database.",
				{ status: 200 }
			);

		default:
			return new Response("Unhandled webhook type.", { status: 501 });
	}
}
