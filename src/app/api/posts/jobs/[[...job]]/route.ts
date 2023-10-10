import { db } from "@/db";
import {
	companyJobs,
	jobMedia,
	jobs,
	userJobs,
	media,
	companies,
	users,
} from "@/db/migrations/schema";
import { insertJobSchema } from "@/lib/validations/posts/posts";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import * as z from "zod";

export async function POST(req: Request) {
	const body = await req.json();
	const creatorType = headers().get("Job-Creator-Type");
	const newId = `job_${crypto.randomUUID()}`;

	const parseSchema = insertJobSchema.extend({
		userId: z
			.string()
			.max(50, {
				message: "User ID must be at most 50 characters long",
			})
			.regex(/^user_[A-Za-z0-9\-]+$/, {
				message: "User ID must be in the format of user_[A-Za-z0-9-]+",
			}),
		companyId: z
			.string()
			.max(50, {
				message: "Company ID must be at most 50 characters long",
			})
			.regex(/^comp_[A-Za-z0-9\-]+$/, {
				message: "Company ID must be in the format of comp_[A-Za-z0-9-]+",
			})
			.nullable(),
	});

	const parsedJob = parseSchema.safeParse({
		id: newId,
		...body,
	});

	if (!parsedJob.success) {
		return new Response(JSON.stringify(parsedJob.error), {
			headers: {
				"content-type": "application/json",
			},
			status: 400,
		});
	}

	const data = parsedJob.data;

	try {
		await db.transaction(async (tx) => {
			const { companyId, userId, ...jobData } = data;
			await tx.insert(jobs).values(jobData);

			if (companyId) {
				await tx.insert(companyJobs).values({
					companyId,
					jobId: newId,
				});
			} else {
				await tx.insert(userJobs).values({
					userId,
					jobId: newId,
				});
			}
		});
	} catch (err) {
		console.log(err);
		return new Response(JSON.stringify(err), {
			headers: {
				"content-type": "application/json",
			},
			status: 500,
		});
	}

	return new Response(JSON.stringify({ id: newId }), {
		headers: {
			"content-type": "application/json",
		},
		status: 201,
	});
}

export async function GET(req: Request) {
	console.log(req);
	const headersList = headers();
	const id = headersList.get("Job-ID");
	const ownerId = headersList.get("Owner-ID");
	const jobId = insertJobSchema.pick({ id: true }).safeParse({ id });

	if (id) {
		if (!jobId.success) {
			return new Response(JSON.stringify(jobId.error), {
				headers: {
					"content-type": "application/json",
				},
				status: 400,
			});
		}

		const data = jobId.data;

		// TODO: Is this the best way to do this?
		const query = await db
			.select()
			.from(jobs)
			.where(eq(jobs.id, data.id))
			.leftJoin(jobMedia, eq(jobs.id, jobMedia.jobId))
			.leftJoin(media, eq(jobMedia.mediaId, media.id));

		//TODO: implement when job media uploads are implemented
		// const job = query.reduce((acc, curr) => {
		// 	return {
		// 		...acc,
		// 		...curr,
		// 	};
		// })

		return new Response(JSON.stringify(query), {
			headers: {
				"content-type": "application/json",
			},
			status: 200,
		});
	} else if (ownerId) {
		const query = await db
			.select()
			.from(companies)
			.where(eq(companies.ownerId, ownerId))
			.innerJoin(companyJobs, eq(companies.id, companyJobs.companyId))
			.innerJoin(jobs, eq(companyJobs.jobId, jobs.id));

		const res = query.reduce((final, item) => {
			const currentCompany = item.companies.name;

			if (!final[currentCompany]) {
				final[currentCompany] = {
					...item.companies,
					jobs: [item.jobs],
				};
			} else {
				final[currentCompany].jobs.push(item.jobs);
			}
			return final;
		}, {} as Record<string, any>);

		console.log(res);
		return new Response(JSON.stringify(res), {
			headers: {
				"content-type": "application/json",
			},
			status: 200,
		});
	} else {
		return new Response(JSON.stringify({ error: "No job ID provided" }), {
			headers: {
				"content-type": "application/json",
			},
			status: 400,
		});
	}
}
