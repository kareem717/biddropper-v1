import { db } from "@/db";
import fullContractView from "@/db/views/full-contract";
import fullJobView from "@/db/views/full-job";

export async function GET(
	_req: Request,
	{ params }: { params: { tag: string } }
) {
	const res = await db.select().from(fullContractView);
	return new Response(JSON.stringify(res), { status: 200 });
}
