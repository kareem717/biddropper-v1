import { headers } from "next/headers";
import { Webhook, WebhookRequiredHeaders } from "svix";
import { IncomingHttpHeaders } from "http";
import { type ClerkWebhookEvent } from "@/types";

export async function verifySvixSignature(
	req: Request,
	webhookSecret: string
): Promise<ClerkWebhookEvent> {
	const body = await req.json();
	const headerList = headers();
	const wh = new Webhook(webhookSecret);
	const verificationHeaders = {
		"svix-id": headerList.get("svix-id"),
		"svix-signature": headerList.get("svix-signature"),
		"svix-timestamp": headerList.get("svix-timestamp"),
	};

	try {
		const event = wh.verify(
			JSON.stringify(body),
			verificationHeaders as IncomingHttpHeaders & WebhookRequiredHeaders
		) as ClerkWebhookEvent;

		return event;
	} catch (err) {
		console.error((err as Error).message);
		throw new Error("Invalid webhook.");
	}
}
