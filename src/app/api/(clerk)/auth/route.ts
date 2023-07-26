import { type ClerkWebhookEvent } from "@/types";
import { db } from "@/db";
import { eq, sql } from "drizzle-orm";
import {
	contracts,
	emails,
	externalAccounts,
	users,
	usersArchive,
} from "drizzle/schema";
import { verifySvixSignature } from "@/lib/server-helpers";
import { env } from "@/env.mjs";

export async function POST(req: Request) {
	let event: ClerkWebhookEvent;

	try {
		event = await verifySvixSignature(req, env["CLERK_USER_WEBHOOK_SECRET"]);
	} catch (err) {
		console.error("Webhook validation error:", err);
		return new Response("Invalid webhook.", { status: 401 });
	}

	const userId = event.data.id as string;

	switch (event.type) {
		case "user.created":
		case "user.updated":
			const user = JSON.stringify(event.data);
			const userEmails = event.data.email_addresses as JSON[];
			const externalUserAccounts = event.data.external_accounts as JSON[];

			try {
				await db.transaction(async (tx) => {
					await tx.execute(
						sql`INSERT INTO users (json) VALUES (${user}) ON DUPLICATE KEY UPDATE json = ${user}`
					);

					userEmails.map(async (email: JSON) => {
						await tx.execute(
							sql`INSERT INTO emails (json, user_id) VALUES (${JSON.stringify(
								email
							)}, ${userId}) ON DUPLICATE KEY UPDATE json = ${JSON.stringify(
								emails
							)}`
						);
					});

					externalUserAccounts.map(async (external: JSON) => {
						await tx.execute(
							sql`INSERT INTO external_accounts (json, user_id) VALUES (${JSON.stringify(
								external
							)}, ${userId}) ON DUPLICATE KEY UPDATE json = ${JSON.stringify(
								external
							)}`
						);
					});
				});
			} catch (err) {
				console.log(err);

				return new Response("Error inserting user into database.", {
					status: 500,
				});
			}
			return new Response(
				"User and related data have been inserted or updated in the database.",
				{ status: 200 }
			);

		case "user.deleted":
			try {
				await db.transaction(async (tx) => {
					const userData = await tx
						.select({ json: users.json })
						.from(users)
						.where(eq(users.id, userId))
						.limit(1);

					if (!userData[0]) {
						throw new ReferenceError("User not found.");
					}

					await tx.insert(usersArchive).values(userData);
					await tx.delete(users).where(eq(users.id, userId));

					await tx
						.delete(externalAccounts)
						.where(eq(externalAccounts.userId, userId));

					await tx.delete(emails).where(eq(emails.userId, userId));

					const userContracts = await tx
						.update(contracts)
						.set({ isDeleted: 1 })
						.where(eq(contracts.userId, userId));
				});
			} catch (err) {
				console.log(err);

				if (err instanceof ReferenceError) {
					return new Response(err.message, { status: 404 });
				}

				return new Response("Error archiving user in database.", {
					status: 500,
				});
			}

			return new Response("User and related data have been archived.", {
				status: 200,
			});

		default:
			return new Response("Unhandled webhook type.", { status: 501 });
	}
}
