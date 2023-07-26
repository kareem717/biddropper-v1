import { db } from "@/db";
import { env } from "@/env.mjs";
import { verifySvixSignature } from "@/lib/server-helpers";
import { type ClerkWebhookEvent } from "@/types";
import { sql } from "drizzle-orm";
export async function POST(req: Request) {
	let event: ClerkWebhookEvent;
  console.log(env["CLERK_SESSION_WEBHOOK_SECRET"]);
  
	try {
		event = await verifySvixSignature(
			req,
			env["CLERK_SESSION_WEBHOOK_SECRET"]
		);
	} catch (err) {
		console.error("Webhook validation error:", err);
		return new Response("Invalid webhook.", { status: 401 });
	}

	const data = JSON.stringify(event.data);

	switch (event.type) {
		case "session.created":
    case "session.ended":
    case "session.removed":
    case "session.revoked":

			try {
				await db.execute(
					sql`INSERT INTO sessions (json) VALUES (${data}) ON DUPLICATE KEY UPDATE json = ${data}`
				);
			} catch (err) {
				console.log(err);

				return new Response("Error inserting session into database.", {
					status: 500,
				});
			}

			return new Response(
				"Session data has been inserted or updated in the database.",
				{ status: 200 }
			);

		
		default:
			return new Response("Unhandled webhook type.", { status: 501 });
	}
}
