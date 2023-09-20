import { db } from "@/db";
import {
	companyProjects,
	companyReviews,
	media,
	projectMedia,
	projects,
	reviewMedia,
	reviews,
} from "@/db/migrations/schema";
import { authOptions } from "@/lib/auth";
import { insertCompanySchema } from "@/lib/validations/companies";
import { insertMediaSchema } from "@/lib/validations/posts";
import { insertProjectSchema } from "@/lib/validations/projects";
import { insertReviewSchema } from "@/lib/validations/reviews";
import { randomUUID } from "crypto";
import { getServerSession } from "next-auth";
import * as z from "zod";

//TODO: test this route
export async function POST(req: Request) {
	const session = await getServerSession(authOptions);

	if (!session) {
		return new Response("Unauthorized", { status: 401 });
	}

	const body = insertReviewSchema
		.extend({
			companyId: insertCompanySchema.shape.id,
			reviewMedia: z.array(insertMediaSchema.omit({ id: true })),
		})
		.omit({ id: true, authorId: true })
		.safeParse(await req.json());

	if (!body.success) {
		return new Response(JSON.stringify(body.error), { status: 400 });
	}

	const { reviewMedia: reqMedia, companyId, ...review } = body.data;

	try {
		const newReviewId = `rev_${randomUUID()}`;

		const reviewPhotos = reqMedia.map((photo) => ({
			id: `media_${randomUUID()}`,
			...photo,
		}));

		const mediaLink = reviewPhotos.map((photo) => ({
			mediaId: photo.id,
			reviewId: newReviewId,
		}));

		await db.transaction(async (tx) => {
			await tx.insert(reviews).values({
				id: newReviewId,
				authorId: session.user.id,
				...review,
			});

			await tx.insert(media).values(reviewPhotos);

			await tx.insert(reviewMedia).values(mediaLink);

			await tx.insert(companyReviews).values({
				companyId,
				reviewId: newReviewId,
			});
		});

		return new Response(JSON.stringify({ id: newReviewId }), { status: 200 });
	} catch (err) {
		return new Response(JSON.stringify(err), { status: 500 });
	}
}

export async function GET(req: Request) {
	const payload = await db.select().from(reviews);

	return new Response(JSON.stringify(payload), { status: 200 });
}
