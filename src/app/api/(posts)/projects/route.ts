import { db } from "@/db/client";
import { media, projectMedia, projects } from "@/db/migrations/schema";
import fullProjectView from "@/db/views/full-project";
import { authOptions } from "@/lib/auth";
import {
	createProjectSchema,
	deleteProjectSchema,
	fetchProjectQuerySchema,
	updateProjectSchema,
} from "@/lib/validations/api/api-project";
import { randomUUID } from "crypto";
import { eq, exists, and, sql, inArray } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { parse } from "url";

//TODO: test all routes
export async function POST(req: Request) {
	const { query } = parse(req.url, true);

	const session = await getServerSession(authOptions);

	if (!session || !session.user.ownedCompanies) {
		return new Response("Unauthorized", { status: 401 });
	}

	const reqBody = await req.json();
	const attemptBodyParse = createProjectSchema.safeParse({
		companyId: query.companyId,
		...reqBody,
	});

	if (!attemptBodyParse.success) {
		console.log("POST /api/projects Error:", attemptBodyParse.error);
		return new Response("Error parsing request body.", { status: 400 });
	}

	const {
		projectMedia: reqMedia,
		companyId,
		...project
	} = attemptBodyParse.data;

	try {
		await db.transaction(async (tx) => {
			const newProjectId = `proj_${randomUUID()}`;

			await tx.insert(projects).values({
				id: newProjectId,
				companyId,
				...project,
			});

			if (reqMedia) {
				const projectPhotos = reqMedia.map((photo) => ({
					id: `media_${randomUUID()}`,
					...photo,
				}));

				const projectPhotosLink = projectPhotos.map((photo) => ({
					mediaId: photo.id,
					projectId: newProjectId,
				}));

				await tx.insert(media).values(projectPhotos);

				await tx.insert(projectMedia).values(projectPhotosLink);
			}
		});

		return new Response("Project created.", { status: 200 });
	} catch (err) {
		console.log("POST /api/projects Error:", err);
		return new Response("An error occured inserting the project.", {
			status: 500,
		});
	}
}

export async function GET(req: Request) {
	const { query } = parse(req.url, true);

	const attemptQueryParse = fetchProjectQuerySchema.safeParse(query);

	if (!attemptQueryParse.success) {
		console.log("GET /api/projects Error:", attemptQueryParse.error);
		return new Response("Error parsing query parameters.", { status: 400 });
	}

	const { projectId, companyId, limit, fetchType } = attemptQueryParse.data;

	let queryBuilder;

	switch (fetchType) {
		// Simple fetch only gets the project data
		case "simple":
			queryBuilder = db
				.select()
				.from(fullProjectView)
				.innerJoin(projects, eq(projects.id, fullProjectView.projectId));

			break;

		// Deep fetch gets the project data, and media data
		case "deep":
			queryBuilder = db
				.select()
				.from(fullProjectView)
				.innerJoin(projects, eq(projects.id, fullProjectView.projectId))
				.leftJoin(media, eq(media.id, fullProjectView.mediaId));

			break;

		// Minimal fetch only gets the data provided by the view
		case "minimal":
			queryBuilder = db.select().from(fullProjectView);

			break;
	}

	if (!queryBuilder) {
		return new Response("Invalid 'fetchType'.", { status: 400 });
	}

	if (companyId) {
		queryBuilder = queryBuilder.where(eq(projects.companyId, companyId));
	}

	if (projectId) {
		queryBuilder = queryBuilder.where(eq(fullProjectView.projectId, projectId));
	}

	try {
		// Limit the number of results (defaults to 25)
		const res = await queryBuilder.limit(projectId ? 1 : limit);

		return new Response(JSON.stringify(res), { status: 200 });
	} catch (err) {
		console.log("GET /api/projects Error:", err);
		return new Response("An error occured fetching the project(s).", {
			status: 500,
		});
	}
}

export async function PATCH(req: Request) {
	const { query } = parse(req.url, true);

	const session = await getServerSession(authOptions);
	if (!session) {
		return new Response("Unauthorized", { status: 401 });
	}

	const reqBody = await req.json();

	const attemptBodyParse = updateProjectSchema.safeParse({
		id: query.id,
		...reqBody,
	});

	if (!attemptBodyParse.success) {
		console.log("PATCH /api/projects Error:", attemptBodyParse.error);
		return new Response("Error parsing request body or query parameters.", {
			status: 400,
		});
	}

	const { id, removedMedia, newMedia, ...updateValues } = attemptBodyParse.data;

	// Make sure user owns the contract
	try {
		const userOwnsProject = await db
			.select({
				id: projects.id,
			})
			.from(projects)
			.where(
				inArray(
					projects.companyId,
					session.user.ownedCompanies.map((company) => company.id)
				)
			)
			.limit(1);

		if (userOwnsProject.length < 1) {
			return new Response("User does not own the project.", { status: 401 });
		}
	} catch (err) {
		console.log("PATCH /api/projects Error:", err);
		return new Response("An error occured while checking project ownership.", {
			status: 500,
		});
	}

	// Delete media
	if (removedMedia) {
		try {
			await db.transaction(async (tx) => {
				tx.delete(projectMedia).where(
					inArray(projectMedia.mediaId, removedMedia)
				);
			});
		} catch (err) {
			console.log("PATCH /api/projects Error:", err);
			return new Response("Error deleting project media.", { status: 500 });
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
				tx.insert(projectMedia).values(
					newMediaIds.map((mediaId) => ({
						projectId: id,
						mediaId,
					}))
				);
			});
		} catch (err) {
			console.log("PATCH /api/projects Error:", err);
			return new Response("An error occured while inserting new media.", {
				status: 400,
			});
		}
	}

	try {
		await db.update(projects).set(updateValues).where(eq(projects.id, id));
	} catch (err) {
		console.log("PATCH /api/projects Error:", err);
		return new Response("Error updating project.", { status: 500 });
	}

	return new Response("Project updated successfully.", { status: 200 });
}

export async function DELETE(req: Request) {
	const { query } = parse(req.url, true);

	const session = await getServerSession(authOptions);
	if (!session) {
		return new Response("Unauthorized", { status: 401 });
	}

	const attemptQueryParse = deleteProjectSchema.safeParse(query);

	if (!attemptQueryParse.success) {
		console.log("DELETE /api/projects Error:", attemptQueryParse.error);
		return new Response("Error parsing query parameters.", { status: 400 });
	}

	const { projectId } = attemptQueryParse.data;

	// Make sure user owns the company who owns the contract
	try {
		const userOwnsProject = await db
			.select({
				id: projects.id,
			})
			.from(projects)
			.where(
				inArray(
					projects.companyId,
					session.user.ownedCompanies.map((company) => company.id)
				)
			)
			.limit(1);

		if (userOwnsProject.length < 1) {
			return new Response("User does not own the project.", { status: 401 });
		}
	} catch (err) {
		console.log("DELETE /api/projects Error:", err);
		return new Response("An error occured while checking project ownership.", {
			status: 500,
		});
	}

	try {
		await db
			.update(projects)
			.set({ isActive: 0 })
			.where(eq(projects.id, projectId));
	} catch (err) {
		console.log("DELETE /api/projects Error:", err);
		return new Response("Error deleting project.", { status: 500 });
	}

	return new Response("Project deleted successfully.", { status: 200 });
}
