import { db } from "@/db";
import { jobs } from "@/db/migrations/schema";
import { headers } from "next/headers";

export async function GET(req: Request) {
	console.log(req);
	const headersList = headers();
	const fetchType = headersList.get("Fetch-Type");

	switch (fetchType) {
		case "all":
			const allJobs = await db.select().from(jobs);
			return new Response(JSON.stringify(allJobs), {
				headers: {
					"content-type": "application/json",
				},
				status: 200,
			});

		case "card":
			const cardJobs = await db
				.select({
					id: jobs.id,
					industry: jobs.industry,
					isActive: jobs.isActive,
					timeHorizon: jobs.timeHorizon,
					propertyType: jobs.propertyType,
					isCommercialProperty: jobs.isCommercialProperty,
				})
				.from(jobs);

			return new Response(JSON.stringify(cardJobs), {
				headers: {
					"content-type": "application/json",
				},
				status: 200,
			});

		case "":
			return new Response(JSON.stringify({ error: "No fetch type provided" }), {
				headers: {
					"content-type": "application/json",
				},
				status: 400,
			});

		default:
			return new Response(
				JSON.stringify({ error: "Unimplemented fetch type" }),
				{
					headers: {
						"content-type": "application/json",
					},
					status: 501,
				}
			);
	}
}
