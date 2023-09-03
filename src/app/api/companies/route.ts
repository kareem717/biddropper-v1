import { db } from "@/db";
import { companies } from "@/db/migrations/schema";
import { insertCompanySchema } from "@/lib/validations/companies";

export async function POST(req: Request) {
	const body = await req.json();

	const data = insertCompanySchema.safeParse(body);

	if (!data.success) {
		return new Response(JSON.stringify(data.error), {
			headers: {
				"content-type": "application/json",
			},
			status: 400,
		});
	}

	try {
		await db.insert(companies).values(data.data);
	} catch (err) {
		console.log(err);
		return new Response(JSON.stringify(err), {
			headers: {
				"content-type": "application/json",
			},
			status: 500,
		});
	}

	return new Response("Company created", { status: 201 });
}
