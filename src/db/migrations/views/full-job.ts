import { mysqlView, QueryBuilder } from "drizzle-orm/mysql-core";
import {
	jobs,
	jobMedia,
	media,
} from "@/db/migrations/schema";
import { eq, sql } from "drizzle-orm";

const qb = new QueryBuilder();

const fullJobView = mysqlView("full_job_view").as(
	qb
		.select({
			jobId: sql`job_id`.as("job_id"),
			mediaId: sql`media_id`.as("media_id"),
		})
		.from(jobs)
		.leftJoin(jobMedia, eq(jobs.id, jobMedia.jobId))
		.leftJoin(media, eq(jobMedia.mediaId, media.id))
);

export default fullJobView;