import { mysqlView, QueryBuilder } from "drizzle-orm/mysql-core";
import { reviews, reviewMedia } from "@/db/migrations/schema";
import { eq, sql } from "drizzle-orm";

const qb = new QueryBuilder();

const fullReviewView = mysqlView("full_review_view").as(
	qb
		.select({
			reviewId: sql`review_id`.as("review_id"),
			authorId: sql`author_id`.as("author_id"),
			companyId: sql`company_id`.as("company_id"),
			mediaId: sql`media_id`.as("media_id"),
		})
		.from(reviews)
		.leftJoin(reviewMedia, eq(reviews.id, reviewMedia.reviewId))
);

export default fullReviewView;