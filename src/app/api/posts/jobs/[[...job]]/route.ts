import { db } from "@/db";
import { companyJobs, jobs, userJobs } from "@/db/migrations/schema";
import { insertJobSchema } from "@/lib/validations/posts";
import { headers } from "next/headers";
import * as z from "zod";

export async function POST(req: Request) {
	const body = await req.json();
	const creatorType = headers().get("Job-Creator-Type");
	const newId = `job_${crypto.randomUUID()}`;
	let parseSchema;

	switch (creatorType) {
		case "contractor":
			parseSchema = insertJobSchema.extend({
				companyId: z
					.string()
					.max(50, {
						message: "Company ID must be at most 50 characters long",
					})
					.regex(/^comp_[A-Za-z0-9\-]+$/, {
						message: "Company ID must be in the format of comp_[A-Za-z0-9-]+",
					}),
			});
			break;
		case "user":
			parseSchema = insertJobSchema.extend({
				userId: z
					.string()
					.max(50, {
						message: "User ID must be at most 50 characters long",
					})
					.regex(/^user_[A-Za-z0-9\-]+$/, {
						message: "User ID must be in the format of user_[A-Za-z0-9-]+",
					}),
			});
			break;
		default:
			parseSchema = insertJobSchema;
			break;
	}

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
			if (creatorType === "contractor") {
				// @ts-ignore
				const { companyId, ...jobData } = data;
				await tx.insert(jobs).values(jobData);
				await tx.insert(companyJobs).values({
					companyId,
					jobId: newId,
				});
			} else if (creatorType === "user") {
				// @ts-ignore
				const { userId, ...jobData } = data;
				await tx.insert(jobs).values(jobData);
				await tx.insert(userJobs).values({
					userId,
					jobId: newId,
				});
			} else {
				await tx.insert(jobs).values(data);
			}
		});
	} catch (err) {
		console.error(err);
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
