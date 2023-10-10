import { db } from "@/db";
import { authOptions } from "@/lib/auth";
import {
	companyJobs,
	jobMedia,
	jobs,
	media,
	userJobs,
} from "@/db/migrations/schema";
import { getServerSession } from "next-auth";
import { parse } from "url";
import {
	createJobSchema,
	fetchJobsQuerySchema,
} from "@/lib/validations/api/api-job";
import { industries } from "@/db/migrations/schema";
import { InsertJob } from "@/lib/validations/posts/jobs";
import { InsertMedia } from "@/lib/validations/posts/media";
import fullJobView from "@/db/views/full-job";
import { eq, and, sql, exists } from "drizzle-orm";

// TODO: Test all endpoints
export async function POST(req: Request) {
	const session = await getServerSession(authOptions);
	if (!session) {
		return new Response("Unauthorized", { status: 401 });
	}

	const { query } = parse(req.url, true);
	let reqBody = await req.json();
	const attemptBodyParse = createJobSchema.safeParse({
		companyId: query.companyId,
		jobs: reqBody.jobs,
	});

	if (!attemptBodyParse.success) {
		console.log("POST /api/jobs Error:", attemptBodyParse.error);
		return new Response("Error parsing request body or quert parameters.", {
			status: 400,
		});
	}

	const { companyId, jobs: jobData } = attemptBodyParse.data;

	// Get valid industry values
	const industryValues = await db
		.select({ value: industries.value })
		.from(industries);

	let newJobIds: string[] = [];
	let newJobs: InsertJob[] = [];
	let newMedia: Record<string, InsertMedia[]> = {};

	try {
		const validIndustryValues = new Set(
			industryValues.map((industry) => industry.value)
		);

		// Validate industry values
		for (const job of jobData) {
			if (!validIndustryValues.has(job.jobData.industry)) {
				throw new Error("Invalid industry value");
			}
		}

		newJobs = jobData.map((job) => {
			var newId = `job_${crypto.randomUUID()}`;

			newJobIds.push(newId);

			if (job.media) {
				newMedia[newId] = job.media.map((media) => {
					return {
						...media,
						id: `media_${crypto.randomUUID()}`,
					};
				});
			}

			return {
				...job.jobData,
				id: newId,
			};
		});
	} catch (err) {
		if (err instanceof Error) {
			console.log("POST /api/jobs Error:", err.message);
			return new Response(err.message, { status: 400 });
		}
	}

	try {
		await db.transaction(async (tx) => {
			await tx.insert(jobs).values(newJobs);

			// Link jobs to company if provided
			if (companyId) {
				await tx
					.insert(companyJobs)
					.values(newJobIds.map((id) => ({ jobId: id, companyId })));
			}

			// Handle media if provided
			if (Object.keys(newMedia).length > 0) {
				// Insert media
				await tx.insert(media).values(Object.values(newMedia).flat());

				// Link media to jobs
				await tx.insert(jobMedia).values(
					Object.entries(newMedia)
						.map(([jobId, media]) => {
							return media.map((media) => ({
								jobId,
								mediaId: media.id,
							}));
						})
						.flat()
				);
			}
		});
	} catch (err) {
		console.log("POST /api/posts/jobs Error:", err);
		return new Response("Error inserting job.", { status: 500 });
	}

	return new Response("Job inserted.", { status: 200 });
}

export async function GET(req: Request) {
	const session = await getServerSession(authOptions);
	if (!session) {
		return new Response("Unauthorized", { status: 401 });
	}

	const { query } = parse(req.url, true);

	const attemptBodyParse = fetchJobsQuerySchema.safeParse(query);

	if (!attemptBodyParse.success) {
		console.log("GET /api/jobs Error:", attemptBodyParse.error);
		return new Response("Error parsing request body.", { status: 400 });
	}

	const { userId, companyId, jobId, fetchType, getInactive, limit } =
		attemptBodyParse.data;

	let queryBuilder;

	//TODO: implemnt job and company filteration
	switch (fetchType) {
		// Simple fetch obly gets the job data
		case "simple":
			queryBuilder = db
				.select()
				.from(fullJobView)
				.innerJoin(jobs, eq(jobs.id, fullJobView.jobId));

			break;

		// Deep fetch gets the  job data, and media data
		case "deep":
			queryBuilder = db
				.select()
				.from(fullJobView)
				.innerJoin(jobs, eq(jobs.id, fullJobView.jobId))
				.leftJoin(media, eq(media.id, fullJobView.mediaId));

			break;

		// Minimal fetch only gets the data provided by the view
		case "minimal":
			queryBuilder = db.select().from(fullJobView);

			break;
	}

	if (!queryBuilder) {
		return new Response("Invalid 'fetchType'.", { status: 400 });
	}

	// Apply filtering to query if needed
	if (fetchType !== "minimal") {
		if (!getInactive) {
			queryBuilder = queryBuilder.where(eq(jobs.isActive, 1));
		}

	}

	if (companyId && !userId) {
		queryBuilder = queryBuilder.where(
			exists(
				db
					.select()
					.from(companyJobs)
					.where(
						and(
							eq(companyJobs.companyId, companyId),
							eq(companyJobs.jobId, sql`full_job_view.job_id`) // Weird work around to to make this query work
						)
					)
			)
		);
	} else if (userId && !companyId) {
		// Make sure user is either a company owner or the job owner
		if (
			userId !== session.user.id ||
			session.user.ownedCompanies.length === 0
		) {
			return new Response("User must be a company owner of the job owner", {
				status: 401,
			});
		}

		queryBuilder = queryBuilder.where(
			exists(
				db
					.select()
					.from(userJobs)
					.where(
						and(
							eq(userJobs.userId, userId),
							eq(userJobs.jobId, sql`full_job_view.job_id`) // Weird work around to to make this query work
						)
					)
			)
		);
	} else if (userId && companyId) {
		return new Response(
			"Only either 'companyId' or 'userId' can be passed, but not both",
			{ status: 400 }
		);
	}

	if (jobId) {
		queryBuilder = queryBuilder.where(eq(jobs.id, jobId));
	}

	try {
		// Limit the number of results (defaults to 25)
		const res = await queryBuilder.limit(jobId ? 1 : limit);

		return new Response(JSON.stringify(res), { status: 200 });
	} catch (err) {
		console.log("GET /api/jobs Error:", err);
		return new Response("An error occured fetching the job(s).", {
			status: 500,
		});
	}
}
