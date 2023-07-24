import { headers } from "next/headers";
import { Webhook, WebhookRequiredHeaders } from "svix";
import { IncomingHttpHeaders } from "http";
import { env } from "@/env.mjs";
import { type Event } from "@/types";
import { db } from "@/db";
import { eq, sql } from "drizzle-orm";
import { emails, externalAccounts, users, usersArchive } from "drizzle/schema";
import { json } from "stream/consumers";

async function verifySvixSignature(req: Request): Promise<Event> {
	const body = await req.json();
	const headerList = headers();
	const wh = new Webhook(env["CLERK_WEBHOOK_SECRET"]);
	const verificationHeaders = {
		"svix-id": headerList.get("svix-id"),
		"svix-signature": headerList.get("svix-signature"),
		"svix-timestamp": headerList.get("svix-timestamp"),
	};

	try {
		const event = wh.verify(
			JSON.stringify(body),
			verificationHeaders as IncomingHttpHeaders & WebhookRequiredHeaders
		) as Event;
		return event;
	} catch (err) {
		console.error((err as Error).message);
		throw new Error("Invalid webhook.");
	}
}

export async function POST(req: Request) {
	let event: Event;

	try {
		event = await verifySvixSignature(req);
	} catch (err) {
		console.error("Webhook validation error:", err);
		return new Response("Invalid webhook.", { status: 401 });
	}
	const userId = event.data.id as string;
	if (event.type === "user.created" || event.type === "user.updated") {
		const user = JSON.stringify(event.data);
		const emails = event.data.email_addresses as JSON[];
		const externalAccounts = event.data.external_accounts as JSON[];
		console.log(externalAccounts);

		try {
			const transaction: boolean = await db.transaction(async (tx) => {
				await tx.execute(
					sql`INSERT INTO users (json) VALUES (${user}) ON DUPLICATE KEY UPDATE json = ${user}`
				);

				emails.map(async (email: JSON) => {
					await tx.execute(
						sql`INSERT INTO emails (json, user_id) VALUES (${JSON.stringify(
							email
						)}, ${userId}) ON DUPLICATE KEY UPDATE json = ${JSON.stringify(
							emails
						)}`
					);
				});

				externalAccounts.map(async (external: JSON) => {
					console.log(external);
					await tx.execute(
						sql`INSERT INTO external_accounts (json, user_id) VALUES (${JSON.stringify(
							external
						)}, ${userId}) ON DUPLICATE KEY UPDATE json = ${JSON.stringify(
							external
						)}`
					);
				});

				return true;
			});

			if (transaction !== true) {
				return new Response("Error inserting user into database.", {
					status: 500,
				});
			}

			return new Response(
				"User and related data have been inserted or updated in the database.",
				{ status: 200 }
			);
		} catch (err) {
			console.log(err);

			return new Response("Error inserting user into database.", {
				status: 500,
			});
		}
	} else if (event.type === "user.deleted") {
		const transaction = db.transaction(async (tx) => {
			const userData = await tx
				.select({ json: users.json })
				.from(users)
				.where(eq(users.id, userId))
				.limit(1);
			await tx.insert(usersArchive).values(userData);
			await tx.delete(users).where(eq(users.id, userId));
			await tx
				.delete(externalAccounts)
				.where(eq(externalAccounts.userId, userId));
			await tx.delete(emails).where(eq(emails.userId, userId));
		});

		return new Response("User and related data have been archived.", {
			status: 200,
		});
	}

	return new Response("Unhandled webhook type.", { status: 501 });
}
