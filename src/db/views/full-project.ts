import { mysqlView, QueryBuilder } from "drizzle-orm/mysql-core";
import { projects, media, projectMedia } from "@/db/migrations/schema";
import { eq, sql } from "drizzle-orm";

const qb = new QueryBuilder();

const fullProjectView = mysqlView("full_project_view").as(
	qb
		.select({
			projectId: sql`project_id`.as("project_id"),
			mediaId: sql`media_id`.as("media_id"),
		})
		.from(projects)
		.leftJoin(projectMedia, eq(projects.id, projectMedia.projectId))
		.leftJoin(media, eq(projectMedia.mediaId, media.id))
);

export default fullProjectView;
