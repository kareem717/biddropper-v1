import { db } from "@/db";
import { bids } from "@/db/migrations/schema";

import { insertBidsSchema } from "@/lib/validations/posts";

export async function POST(req: Request) {
	const body = await req.json();

	const data = insertBidsSchema.parse(body);

	const bidId = `bid_${crypto.randomUUID()}`;
	console.log(bidId);
	// TODO: price should not be optional
	const query = db.insert(bids).values({
		id: bidId,
		jobId: data.jobId,
		companyId: data.companyId,
		price: data.price || 0,
	});

	await query.execute();

	return new Response("Bid created", { status: 201 });
}
