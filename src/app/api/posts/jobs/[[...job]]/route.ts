import { db } from "@/db";
import { jobs } from "@/db/migrations/schema";
import { insertJobSchema } from "@/lib/validations/posts";

export async function POST(req: Request) {
	const body = await req.json();

	const newId = `job_${crypto.randomUUID()}`;

	const parsedJob = insertJobSchema.safeParse({
		id: newId,
		...body,
	});

	let data;

	if (!parsedJob.success) {
		return new Response(JSON.stringify(parsedJob.error), {
			headers: {
				"content-type": "application/json",
			},
			status: 400,
		});
	} else {
		data = parsedJob.data;
	}

	try {
		await db.insert(jobs).values(data);
	} catch (err) {
		console.error(err);
		return new Response(JSON.stringify(err), {
			headers: {
				"content-type": "application/json",
			},
			status: 500,
		});
	}
  
	return new Response(JSON.stringify({ id: newId }), {
		headers: {
			"content-type": "application/json",
		},
		status: 201,
	});
}
