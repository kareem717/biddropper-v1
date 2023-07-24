import * as z from "zod";
import { newContractSchema } from "@/lib/validations/contracts";
import { db } from "@/db";
import { contracts } from "drizzle/schema";
export async function POST(req: Request) {
	const input = newContractSchema.parse(await req.json());

	try {
		const query = await db.insert(contracts).values(input);
		console.log(query);
		
		if (query.rowsAffected !== 1) {
			return new Response("Something went wrong.", { status: 500 });
		}

		return new Response("Successfully created your contract.", { status: 200 });
	} catch (error) {

		if (error instanceof z.ZodError) {
			return new Response(error.message, { status: 422 });
		}

		if (error instanceof Error) {
			return new Response(error.message, { status: 500 });
		}

		return new Response("Something went wrong.", { status: 500 });
	}
}
