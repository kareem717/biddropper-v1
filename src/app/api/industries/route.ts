import { db } from "@/db";
import { industries as dbIndustries } from "@/db/migrations/schema";

export async function GET(req: Request) {
	console.log("GET /api/industries");
	const industries = await db
		.select({
			label: dbIndustries.label,
			value: dbIndustries.value,
		})
		.from(dbIndustries);

	return new Response(JSON.stringify(industries), {
		headers: {
			"content-type": "application/json",
		},
		status: 200,
	});
}
