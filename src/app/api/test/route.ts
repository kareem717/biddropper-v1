import { db } from "@/db/client";
import fullContractView from "@/db/views/full-contract";
import fullJobView from "@/db/views/full-job";
import fullReviewView from "@/db/views/full-review";

export async function GET(
	_req: Request,
	{ params }: { params: { tag: string } }
) {
	const res = await db.select().from(fullReviewView);
	return new Response(JSON.stringify(res), { status: 200 });
}
