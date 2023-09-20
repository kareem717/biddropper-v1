import { db } from "@/db";
import {
	companyProjects,
	media,
	projectMedia,
	projects,
} from "@/db/migrations/schema";
import { authOptions } from "@/lib/auth";
import { insertMediaSchema } from "@/lib/validations/posts";
import { insertProjectSchema } from "@/lib/validations/projects";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import * as z from "zod";

export async function POST(req: Request) {
	const session = await getServerSession(authOptions);

	if (!session || !session.user.ownedCompanies) {
		return new Response("Unauthorized", { status: 401 });
	}

	const body = insertProjectSchema
		.extend({
			companyId: z.string().refine((id) => {
				return session.user.ownedCompanies.some((company) => company.id === id);
			}, "User does not own this company"),
			projectPhotos: z.array(insertMediaSchema.omit({ id: true })),
		})
		.omit({ id: true })
		.safeParse(await req.json());

	if (!body.success) {
		return new Response(JSON.stringify(body.error), { status: 400 });
	}

	const { projectPhotos: reqMedia, companyId, ...project } = body.data;

	try {
		const newProjectId = `proj_${randomUUID()}`;

		const projectPhotos = reqMedia.map((photo) => ({
			id: `media_${randomUUID()}`,
			...photo,
		}));

		const projectPhotosLink = projectPhotos.map((photo) => ({
			mediaId: photo.id,
			projectId: newProjectId,
		}));

		await db.transaction(async (tx) => {
			await tx.insert(projects).values({
				id: newProjectId,
				...project,
			});

			await tx.insert(media).values(projectPhotos);

			await tx.insert(projectMedia).values(projectPhotosLink);

			await tx.insert(companyProjects).values({
				companyId,
				projectId: newProjectId,
			});
		});

		return new Response(JSON.stringify({ id: newProjectId }), { status: 200 });
	} catch (err) {
		return new Response(JSON.stringify(err), { status: 500 });
	}
}

export async function GET(req: Request) {
	const body = await req.json();

	if (!body.companyId) {
		return new Response("Missing company ID", { status: 400 });
	}

	const { companyId } = body;

	const query = await db
		.select({
			projects,
			media,
		})
		.from(companyProjects)
		.innerJoin(projects, eq(projects.id, companyProjects.projectId))
		.leftJoin(projectMedia, eq(projectMedia.projectId, projects.id))
		.leftJoin(media, eq(media.id, projectMedia.mediaId))
		.where(eq(companyProjects.companyId, companyId));

	const res = query.reduce((out, curr) => {
		const { projects, media } = curr;

		const project = out[projects.id];

		if (!project) {
			out[projects.id] = {
				...projects,
				media: media ? [media] : [],
			};
		} else {
			out[projects.id] = {
				...project,
				media: media ? [...project.media, media] : project.media,
			};
		}

		return out;
	}, {} as Record<string, any>);

	return new Response(JSON.stringify({ res }), { status: 200 });
}
