import { db } from "@/db";
import {
	companies,
	media,
	reviewMedia,
	reviews,
	users,
} from "@/db/migrations/schema";
import { authOptions } from "@/lib/auth";
import { randomUUID } from "crypto";
import { and, eq, inArray, ne } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { headers } from "next/headers";
import {
	createReviewSchema,
	deleteReviewSchema,
	fetchReviewQuerySchema,
	updateReviewSchema,
} from "@/lib/validations/api/api-review";
import { parse } from "url";
import fullReviewView from "@/db/views/full-review";

//TODO: test this route
export async function POST(req: Request) {
	const { query } = parse(req.url, true);
	const session = await getServerSession(authOptions);

	if (!session) {
		return new Response("Unauthorized", { status: 401 });
	}

	const reqBody = await req.json();

	const attemptBodyParse = createReviewSchema.safeParse({
		reqBody,
		companyId: query.companyId,
	});

	if (!attemptBodyParse.success) {
		console.log("GET /api/reviews Error:", attemptBodyParse.error);
		return new Response("Error parsing request body or query parameters.", {
			status: 400,
		});
	}

	const { reviewMedia: reqMedia, companyId, ...review } = attemptBodyParse.data;

	try {
		const userOwnsCompany = await db
			.select()
			.from(companies)
			.where(
				and(eq(companies.id, companyId), ne(companies.ownerId, session.user.id))
			);

		if (!userOwnsCompany) {
			return new Response("Company not found, or user owns company", {
				status: 400,
			});
		}
	} catch (err) {
		console.log("GET /api/reviews Error:", err);
		return new Response("Error checking if user owns company", { status: 500 });
	}

	try {
		const newReviewId = `rev_${randomUUID()}`;

		await db.transaction(async (tx) => {
			await tx.insert(reviews).values({
				companyId,
				id: newReviewId,
				authorId: session.user.id,
				...review,
			});

			// Moved these variables inside the transaction to not create
			// them if the transaction fails
			const reviewPhotos = reqMedia.map((photo) => ({
				id: `media_${randomUUID()}`,
				...photo,
			}));

			await tx.insert(media).values(reviewPhotos);

			const mediaLink = reviewPhotos.map((photo) => ({
				mediaId: photo.id,
				reviewId: newReviewId,
			}));

			await tx.insert(reviewMedia).values(mediaLink);
		});

		return new Response("Review created.", { status: 200 });
	} catch (err) {
		console.log("GET /api/reviews Error:", err);
		return new Response("An error occurred while creating the review.", {
			status: 500,
		});
	}
}

export async function GET(req: Request) {
	const { query } = parse(req.url, true);

	const attemptQueryParse = fetchReviewQuerySchema.safeParse(query);

	if (!attemptQueryParse.success) {
		console.log("GET /api/reviews Error:", attemptQueryParse.error);
		return new Response("Error parsing query parameters.", { status: 400 });
	}

	const { companyId, reviewId, limit, fetchType, authorId } =
		attemptQueryParse.data;

	let queryBuilder;

	switch (fetchType) {
		// Simple fetch obly gets the review data
		case "simple":
			queryBuilder = db
				.select({ reviews })
				.from(fullReviewView)
				.innerJoin(reviews, eq(reviews.id, fullReviewView.reviewId));

			break;

		// Deep fetch gets the review data, and media data,
		case "deep":
			queryBuilder = db
				.select()
				.from(fullReviewView)
				.leftJoin(media, eq(media.id, fullReviewView.mediaId));

			break;

		// Minimal fetch only gets the data provided by the view
		case "minimal":
			queryBuilder = db.select().from(fullReviewView);

			break;
	}

	if (!queryBuilder) {
		return new Response("Invalid 'fetchType'.", { status: 400 });
	}

	if (companyId) {
		queryBuilder.where(eq(fullReviewView.companyId, companyId));
	}

	if (reviewId) {
		queryBuilder.where(eq(fullReviewView.reviewId, reviewId));
	}

	if (authorId) {
		queryBuilder.where(eq(fullReviewView.authorId, authorId));
	}

	try {
		// Limit the number of results (defaults to 25)
		const res = await queryBuilder.limit(authorId ? 1 : limit);

		return new Response(JSON.stringify(res), { status: 200 });
	} catch (err) {
		console.log("GET /api/reviews Error:", err);
		return new Response("An error occured fetching the review(s)", {
			status: 500,
		});
	}
}

export async function PATCH(req: Request) {
	const session = await getServerSession(authOptions);
	if (!session) {
		return new Response("Unauthorized", { status: 401 });
	}

	const { query } = parse(req.url, true);

	const reqBody = await req.json();

	const attemptBodyParse = updateReviewSchema.safeParse({
		id: query.id,
		...reqBody,
	});

	if (!attemptBodyParse.success) {
		console.log("PATCH /api/reviews Error:", attemptBodyParse.error);
		return new Response("Error parsing request body or query parameters.", {
			status: 400,
		});
	}

	const { id, removedMedia, newMedia, ...updateValues } = attemptBodyParse.data;

	//Make sure user owns the review
	try {
		const userOwnsReview = await db
			.select()
			.from(fullReviewView)
			.where(eq(reviews.id, id))
			.innerJoin(users, eq(reviews.authorId, session.user.id))
			.limit(1);

		if (userOwnsReview.length < 1) {
			return new Response("User does not own the review.", { status: 401 });
		}
	} catch (err) {
		console.log("PATCH /api/reviews Error:", err);
		return new Response("Error verifying review ownership.", { status: 500 });
	}

	// Delete jobs
	if (removedMedia) {
		try {
			await db
				.delete(reviewMedia)
				.where(
					and(
						eq(reviewMedia.reviewId, id),
						inArray(reviewMedia.mediaId, removedMedia)
					)
				);
		} catch (err) {
			console.log("PATCH /api/reviews Error:", err);
			return new Response("Error deleting media.", { status: 500 });
		}
	}

	// Insert media
	if (newMedia) {
		try {
			let newMediaIds: string[];

			await db.transaction(async (tx) => {
				// insert new media
				tx.insert(media).values(
					newMedia.map((media) => {
						const newId = `media_${crypto.randomUUID()}`;

						newMediaIds.push(newId);

						return {
							...media,
							id: newId,
						};
					})
				);

				// Link  new media to job
				tx.insert(reviewMedia).values(
					newMediaIds.map((mediaId) => ({
						reviewId: id,
						mediaId,
					}))
				);
			});
		} catch (err) {
			console.log("PATCH /api/reviews Error:", err);
			return new Response("An error occured while inserting new media.", {
				status: 400,
			});
		}
	}

	// Update review
	try {
		await db.update(reviews).set(updateValues).where(eq(reviews.id, id));
	} catch (err) {
		console.log("PATCH /api/reviews Error:", err);
		return new Response("Error updating review.", { status: 500 });
	}

	return new Response("Review updated successfully.", { status: 200 });
}

export async function DELETE(req: Request) {
	const session = await getServerSession(authOptions);
	if (!session) {
		return new Response("Unauthorized", { status: 401 });
	}

	const { query } = parse(req.url, true);

	const attemptBodyParse = deleteReviewSchema.safeParse({
		id: query.id,
	});

	if (!attemptBodyParse.success) {
		console.log("DELETE /api/reviews Error:", attemptBodyParse.error);
		return new Response("Error parsing request body or query parameters.", {
			status: 400,
		});
	}

	const { id } = attemptBodyParse.data;

	//Make sure user owns the review
	try {
		const userOwnsReview = await db
			.select()
			.from(fullReviewView)
			.where(eq(reviews.id, id))
			.innerJoin(users, eq(reviews.authorId, session.user.id))
			.limit(1);

		if (userOwnsReview.length < 1) {
			return new Response("User does not own the review.", { status: 401 });
		}
	} catch (err) {
		console.log("PATCH /api/reviews Error:", err);
		return new Response("Error verifying review ownership.", { status: 500 });
	}

	try {
		await db.update(reviews).set({ isActive: 0 }).where(eq(reviews.id, id));
	} catch (err) {
		console.log("DELETE /api/reviews Error:", err);
		return new Response("Error deleting review.", { status: 500 });
	}

	return new Response("Review deleted successfully.", { status: 200 });
}
