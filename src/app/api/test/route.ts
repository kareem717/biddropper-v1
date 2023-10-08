import { db } from "@/db";
import { companyContractsView } from "@/db/views/company-contracts";
import { useSearchParams } from "next/navigation";

export async function GET(
	_req: Request,
	{ params }: { params: { tag: string } }
) {
const res = await db.select().from(companyContractsView);
	return new Response(JSON.stringify(res), { status: 200 });
}
