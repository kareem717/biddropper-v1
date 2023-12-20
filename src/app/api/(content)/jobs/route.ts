import { db } from "@/db/client";
import { authOptions } from "@/lib/auth";
import {
	bids,
	companyJobs,
	contractJobs,
	jobBids,
	jobMedia,
	jobs,
	media,
	userJobs,
} from "@/db/migrations/schema";
import { getServerSession } from "next-auth";
import { parse } from "url";
import {
	createJobSchema,
	deleteJobQuerySchema,
	fetchJobsQuerySchema,
	updateJobSchema,
} from "@/lib/validations/api/api-job";
import { industries } from "@/db/migrations/schema";
import { InsertJob } from "@/lib/validations/posts/jobs";
import { InsertMedia } from "@/lib/validations/references/media";
import fullJobView from "@/db/views/full-job";
import { eq, and, sql, exists, or, inArray } from "drizzle-orm";

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
		jobs: reqBody.jobData,
	});

	if (!attemptBodyParse.success) {
		console.log("POST /api/jobs Error:", attemptBodyParse.error);
		return new Response("Error parsing request body or quert parameters.", {
			status: 400,
		});
	}

	const { companyId, jobs: jobData } = attemptBodyParse.data;

	let industryValues: { value: string }[];
	let newJobIds: string[] = [];
	let newJobs: InsertJob[] = [];
	let newMedia: Record<string, InsertMedia[]> = {};

	try {
		// Get valid industry values
		industryValues = await db
			.select({ value: industries.value })
			.from(industries);
	} catch (err) {
		console.log("POST /api/jobs Error:", err);
		return new Response("Error fetching industry values.", { status: 500 });
	}

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
			const newId = `job_${crypto.randomUUID()}`;

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

	switch (fetchType) {
		// Simple fetch only gets the job data
		case "simple":
			queryBuilder = db
				.select()
				.from(fullJobView)
				.innerJoin(jobs, eq(jobs.id, fullJobView.jobId));

			break;

		// Deep fetch gets the job data, and media data
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
		queryBuilder = queryBuilder.where(eq(fullJobView.jobId, jobId));
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

export async function PATCH(req: Request) {
	const { query } = parse(req.url, true);

	const session = await getServerSession(authOptions);
	if (!session) {
		return new Response("Unauthorized", { status: 401 });
	}

	const reqBody = await req.json();

	const attemptBodyParse = updateJobSchema.safeParse({
		id: query.id,
		...reqBody,
	});

	if (!attemptBodyParse.success) {
		console.log("PATCH /api/jobs Error:", attemptBodyParse.error);
		return new Response("Error parsing request body or query parameters.", {
			status: 400,
		});
	}

	const { id, removedMedia, newMedia, ...updateValues } = attemptBodyParse.data;

	//Make sure user or company owns the contract
	//TODO test this
	try {
		const userOwnsJob = await db
			.select()
			.from(jobs)
			.where(
				or(
					exists(
						db
							.select()
							.from(userJobs)
							.where(
								and(
									eq(userJobs.userId, session.user.id),
									eq(userJobs.jobId, id)
								)
							)
					),
					exists(
						db
							.select()
							.from(companyJobs)
							.where(
								and(
									inArray(
										companyJobs.companyId,
										session.user.ownedCompanies.map((company) => company.id)
									),
									eq(companyJobs.jobId, id)
								)
							)
					)
				)
			)
			.limit(1);

		if (userOwnsJob.length < 1) {
			return new Response(
				"The user or their companies don't not own the job.",
				{
					status: 401,
				}
			);
		}
	} catch (err) {
		console.log("PATCH /api/jobs Error:", err);
		return new Response("An error occured while checking job ownership.", {
			status: 500,
		});
	}

	// Delete media
	if (removedMedia) {
		try {
			await db.transaction(async (tx) => {
				tx.delete(jobMedia).where(inArray(jobMedia.mediaId, removedMedia));
			});
		} catch (err) {
			console.log("PATCH /api/jobs Error:", err);
			return new Response("Error deleting job media.", { status: 500 });
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
				tx.insert(jobMedia).values(
					newMediaIds.map((mediaId) => ({
						jobId: id,
						mediaId,
					}))
				);
			});
		} catch (err) {
			console.log("PATCH /api/jobs Error:", err);
			return new Response("An error occured while inserting new media.", {
				status: 400,
			});
		}
	}

	// Update contract
	try {
		await db.update(jobs).set(updateValues).where(eq(jobs.id, id));
	} catch (err) {
		console.log("PATCH /api/jobs Error:", err);
		return new Response("Error updating job.", { status: 500 });
	}

	return new Response("Job updated successfully.", { status: 200 });
}

export async function DELETE(req: Request) {
	const { query } = parse(req.url, true);

	const session = await getServerSession(authOptions);
	if (!session) {
		return new Response("Unauthorized", { status: 401 });
	}

	const validParams = deleteJobQuerySchema.safeParse(query);
	if (!validParams.success) {
		return new Response("Invalid parameters.", { status: 400 });
	}

	const jobId = validParams.data.jobId;

	try {
		const userOwnsJob = await db
			.select()
			.from(userJobs)
			.where(eq(userJobs.jobId, jobId));
		const companyOwnsJob = await db
			.select()
			.from(companyJobs)
			.where(eq(companyJobs.jobId, jobId));

		if (!userOwnsJob.length && !companyOwnsJob.length) {
			return new Response("Unauthorized", { status: 400 });
		}
	} catch (err) {
		console.log("DELETE /api/jobs Error:", err);
		return new Response("Error fetching job ownership.", { status: 500 });
	}

	try {
		await db.update(jobs).set({ isActive: 0 }).where(eq(jobs.id, jobId));
	} catch (err) {
		console.log("DELETE /api/jobs Error:", err);
		return new Response("Error deleting job.", { status: 500 });
	}

	return new Response("Job deleted successfully.", { status: 200 });
}
