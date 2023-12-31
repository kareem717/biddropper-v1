import { db } from "@/db/client";
import { companies, media, reviews } from "@/db/schema/tables/content";
import { authOptions } from "@/lib/auth";
import { randomUUID } from "crypto";
import { and, eq, exists, gte, inArray, lte, ne, sql } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { headers } from "next/headers";
import {
	createReviewSchema,
	deleteReviewSchema,
	fetchReviewQuerySchema,
	updateReviewSchema,
} from "@/lib/validations/api/api-review";
import { parse } from "url";
import {
	bodyParamsSchema,
	queryParamsSchema,
} from "@/lib/validations/api/(content)/reviews/request";
import { mediaRelationships } from "@/db/schema/tables/relations/content";
import { CustomError } from "@/lib/utils";
import getSupabaseClient from "@/lib/supabase/getSupabaseClient";

export async function GET(req: Request) {
	const session = await getServerSession(authOptions);

	const { query } = parse(req.url, true);

	if (!session) {
		return new Response(
			JSON.stringify({
				error: "Unauthorized",
			}),
			{ status: 401 }
		);
	}

	const attemptQueryParamsParse = queryParamsSchema.GET.safeParse({
		...query,
	});

	if (!attemptQueryParamsParse.success) {
		return new Response(
			JSON.stringify({
				error: attemptQueryParamsParse.error.issues[0]?.message,
			}),
			{ status: 400 }
		);
	}

	const queryParams = attemptQueryParamsParse.data;

	try {
		const filters = and(
			queryParams.reviewId ? eq(reviews.id, queryParams.reviewId) : undefined,
			queryParams.authorId
				? eq(reviews.authorId, queryParams.authorId)
				: undefined,
			queryParams.minRating
				? gte(reviews.rating, queryParams.minRating)
				: undefined,
			queryParams.maxRating
				? lte(reviews.rating, queryParams.maxRating)
				: undefined,
			queryParams.minCreatedAt
				? gte(reviews.createdAt, queryParams.minCreatedAt)
				: undefined,
			queryParams.maxCreatedAt
				? lte(reviews.createdAt, queryParams.maxCreatedAt)
				: undefined,
			queryParams.cursor ? gte(reviews.id, queryParams.cursor) : undefined
		);

		const res = await db
			.select({
				id: reviews.id,
				authorId: reviews.authorId,
				rating: reviews.rating,
				createdAt: reviews.createdAt,
				updatedAt: reviews.updatedAt,
				description: reviews.description,
				title: reviews.title,
				companyId: reviews.companyId,
				media: sql`ARRAY_AGG(${media.url})`,
			})
			.from(reviews)
			.leftJoin(mediaRelationships, eq(reviews.id, mediaRelationships.reviewId))
			.leftJoin(media, eq(mediaRelationships.mediaId, media.id))
			.where(filters)
			.limit(queryParams.limit + 1)
			.groupBy(reviews.id)
			.orderBy(reviews.id);

		return new Response(
			JSON.stringify({
				cursor: res.length > queryParams.limit ? res[res.length - 1]?.id : null,
				data: res.slice(0, queryParams.limit),
			}),
			{ status: 200 }
		);
	} catch (err) {
		return new Response(
			JSON.stringify({
				error: "Error retrieving reviews.",
			}),
			{ status: 500 }
		);
	}
}

// export async function PATCH(req: Request) {
// 	const session = await getServerSession(authOptions);

// 	if (!session) {
// 		return new Response(
// 			JSON.stringify({
// 				error: "Unauthorized",
// 			}),
// 			{ status: 401 }
// 		);
// 	}

// 	const reqBody = await req.json();

// 	const attemptBodyParse = bodyParamsSchema.PATCH.safeParse(reqBody);

// 	if (!attemptBodyParse.success) {
// 		return new Response(
// 			JSON.stringify({
// 				error: attemptBodyParse.error.issues[0]?.message,
// 			}),
// 			{ status: 400 }
// 		);
// 	}

// 	const { id, addedImageBase64, removedMediaUrls, ...updateValues } =
// 		attemptBodyParse.data;

// 	// Make sure user owns the review
// 	try {
// 		const [review] = await db
// 			.select()
// 			.from(reviews)
// 			.where(and(eq(reviews.id, id)))
// 			.limit(1);

// 		if (!review) {
// 			return new Response(
// 				JSON.stringify({
// 					error: "Review not found.",
// 				}),
// 				{ status: 404 }
// 			);
// 		}

// 		if (review.authorId !== session.user.id) {
// 			return new Response(
// 				JSON.stringify({
// 					error: "User does not own the review.",
// 				}),
// 				{ status: 401 }
// 			);
// 		}
// 	} catch (err) {
// 		return new Response(
// 			JSON.stringify({
// 				error: "Error finding the review.",
// 			}),
// 			{ status: 404 }
// 		);
// 	}

// 	try {
// 		await db.transaction(async (tx) => {
// 			// Update review
// 			if (Object.keys(updateValues).length) {
// 				try {
// 					await tx.update(reviews).set(updateValues).where(eq(reviews.id, id));
// 				} catch (err) {
// 					throw new CustomError("Error updating the review.", 500);
// 				}
// 			}

// 			// Remove images
// 			if (removedMediaUrls?.length) {
// 				try {
// 					const deletedMediaIds = await tx
// 						.delete(media)
// 						.where(
// 							and(
// 								exists(
// 									tx
// 										.select()
// 										.from(mediaRelationships)
// 										.where(
// 											and(
// 												eq(mediaRelationships.mediaId, media.id),
// 												inArray(
// 													mediaRelationships.reviewId,
// 													tx
// 														.select({ id: reviews.id })
// 														.from(reviews)
// 														.where(eq(reviews.id, id))
// 												)
// 											)
// 										)
// 								),
// 								inArray(media.url, removedMediaUrls)
// 							)
// 						)
// 						.returning({ id: media.id });

// 					// Delete images from supabase
// 					const { error } = await getSupabaseClient()
// 						.storage.from("images")
// 						.remove(
// 							reviewMediaUrls.map((mediaObj) => mediaObj.url.split("/")[-1])
// 						);

// 					if (error) {
// 						throw new CustomError("Error deleting images from cloud.", 500);
// 					}
// 				} catch (err) {
// 					throw new CustomError("Error removing images.", 500);
// 				}
// 			}

// 			// Add images
// 			if (addedImageBase64?.length) {
// 				try {
// 					const mediaIds = await Promise.all(
// 						addedImageBase64.map(async (base64) => {
// 							const id = randomUUID();

// 							await trx.insert(media, {
// 								id,
// 								url: base64,
// 							});

// 							return id;
// 						})
// 					);

// 					await tx.insert(
// 						mediaRelationships,
// 						mediaIds.map((mediaId) => ({
// 							mediaId,
// 							reviewId: id,
// 						}))
// 					);
// 				} catch (err) {
// 					throw new CustomError("Error adding images.", 500);
// 				}
// 			}
// 		});
// 	} catch (err) {
// 		const message =
// 			err instanceof CustomError
// 				? (err as Error).message
// 				: "Error deleting review.";

// 		return new Response(
// 			JSON.stringify({
// 				error: message,
// 			}),
// 			{ status: err instanceof CustomError ? err.status : 500 }
// 		);
// 	}
// }

// TODO: Retest image delete
export async function DELETE(req: Request) {
	const session = await getServerSession(authOptions);

	if (!session) {
		return new Response("Unauthorized", { status: 401 });
	}

	const { query } = parse(req.url, true);

	const attemptQueryParamsParse = queryParamsSchema.DELETE.safeParse(query);

	if (!attemptQueryParamsParse.success) {
		return new Response(
			JSON.stringify({
				error: attemptQueryParamsParse.error.issues[0]?.message,
			}),
			{ status: 400 }
		);
	}

	const { id } = attemptQueryParamsParse.data;

	// Validate that the review exists and that the user owns it
	try {
		const [review] = await db
			.select({ authorId: reviews.authorId })
			.from(reviews)
			.where(eq(reviews.id, id));

		if (!review) {
			return new Response(JSON.stringify({ error: "Review not found." }), {
				status: 404,
			});
		}

		if (review.authorId !== session.user.id) {
			return new Response(
				JSON.stringify({ error: "User does not own the review." }),
				{ status: 401 }
			);
		}
	} catch (err) {
		return new Response(
			JSON.stringify({
				error: "Error retrieving the review.",
			}),
			{ status: 500 }
		);
	}

	// Delete review
	try {
		await db.transaction(async (tx) => {
			// Delete Images From Supabase
			const reviewMediaUrls = await tx
				.select({ url: media.url })
				.from(media)
				.innerJoin(mediaRelationships, eq(media.id, mediaRelationships.mediaId))
				.where(eq(mediaRelationships.reviewId, id));

			const { error } = await getSupabaseClient()
				.storage.from("images")
				.remove(reviewMediaUrls.map((url) => url.url));

			if (error) {
				throw new CustomError("Error deleting images from cloud.", 500);
			}

			// Delete review
			await tx.delete(reviews).where(eq(reviews.id, id));
		});
	} catch (err) {
		const message =
			err instanceof CustomError
				? (err as Error).message
				: "Error deleting review.";

		return new Response(
			JSON.stringify({
				error: message,
			}),
			{ status: err instanceof CustomError ? err.status : 500 }
		);
	}

	return new Response(JSON.stringify({ message: "Review deleted." }), {
		status: 200,
	});
}
