import { db } from "@/db/client";
import { users } from "@/db/migrations/schema";
import { authOptions } from "@/lib/auth";
import { updateUserSchema } from "@/lib/validations/api/api-user";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { parse } from "url";

export async function PATCH(req: Request) {
	const { query } = parse(req.url, true);

	const session = await getServerSession(authOptions);
	if (!session) {
		return new Response("Unauthorized", { status: 401 });
	}

	const reqBody = await req.json();

	const attemptBodyParse = updateUserSchema.safeParse({
		id: query.id,
		...reqBody,
	});

	if (!attemptBodyParse.success) {
		console.log("PATCH /api/users Error:", attemptBodyParse.error);
		return new Response("Error parsing request body or query parameters.", {
			status: 400,
		});
	}

	const { id, ...updateValues } = attemptBodyParse.data;

	// Make sure user is updating their own profile
	try {
		const userOwnsProfile = await db
			.select()
			.from(users)
			.where(eq(users.id, id))
			.limit(1);

		if (userOwnsProfile.length < 1) {
			return new Response("User does not own the profile.", { status: 401 });
		}
	} catch (err) {
		console.log("PATCH /api/users Error:", err);
		return new Response("Error verifying profile ownership.", { status: 500 });
	}

	// Update user profile
	try {
		await db.update(users).set(updateValues).where(eq(users.id, id));
	} catch (err) {
		console.log("PATCH /api/users Error:", err);
		return new Response("Error updating profile.", { status: 500 });
	}

	return new Response("Profile updated.", { status: 200 });
}
