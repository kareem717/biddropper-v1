import { db } from "@/db";
import { env } from "@/env.mjs";
import { verifySvixSignature } from "@/lib/server-helpers";
import { type ClerkWebhookEvent } from "@/types";
import { eq, sql } from "drizzle-orm";
import { organizations, organizationsArchive } from "drizzle/schema";
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

	if (
		event.type === "organization.created" ||
		event.type === "organization.updated"
	) {
		console.log("1");
		const data = JSON.stringify(event.data);
		try {
			console.log("2");
			await db.execute(
				sql`INSERT INTO organizations (json) VALUES (${data}) ON DUPLICATE KEY UPDATE json = ${data}`
			);
			console.log("3");
		} catch (err) {
			console.log("4");
			console.log(err);

			return new Response("Error inserting organization into database.", {
				status: 500,
			});
		}

		return new Response(
			"Organization and related data have been inserted or updated in the database.",
			{ status: 200 }
		);
	} else if (event.type === "organization.deleted") {
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

			return new Response(
				"Organization has been archived and deleted from the database.",
				{ status: 200 }
			);
		} catch (err) {
			console.log(err);

			return new Response("Error inserting organization into database.", {
				status: 500,
			});
		}
	} else {
		return new Response("Unhandled webhook type.", { status: 501 });
	}
}
