import { db } from "@/db";
import { env } from "@/env.mjs";
import { verifySvixSignature } from "@/lib/server-helpers";
import { type ClerkWebhookEvent } from "@/types";
import { sql } from "drizzle-orm";
export async function POST(req: Request) {
	let event: ClerkWebhookEvent;

	try {
		event = await verifySvixSignature(
			req,
			env["CLERK_COMMUNICATION_WEBHOOK_SECRET"]
		);
	} catch (err) {
		console.error("Webhook validation error:", err);
		return new Response("Invalid webhook.", { status: 401 });
	}

	const data = JSON.stringify(event.data);

	switch (event.type) {
		case "sms.created":
			try {
				await db.execute(
					sql`INSERT INTO communication_sms (json) VALUES (${data}) ON DUPLICATE KEY UPDATE json = ${data}`
				);
			} catch (err) {
				console.log(err);

				return new Response("Error inserting SMS into database.", {
					status: 500,
				});
			}

			return new Response(
				"SMS data has been inserted or updated in the database.",
				{ status: 200 }
			);

		case "email.created":
			try {
				await db.execute(
					sql`INSERT INTO communication_emails (json) VALUES (${data}) ON DUPLICATE KEY UPDATE json = ${data}`
				);
			} catch (err) {
				console.log(err);

				return new Response("Error inserting email into database.", {
					status: 500,
				});
			}

			return new Response(
				"Email data has been inserted or updated in the database.",
				{ status: 200 }
			);

		default:
			return new Response("Unhandled webhook type.", { status: 501 });
	}
}
