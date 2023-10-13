import { db } from "@/db";
import { insertContractSchema } from "@/lib/validations/posts/contracts";
import {
	createContractSchema,
	deleteContractQuerySchema,
	fetchContractsQuerySchema,
	updateContractSchema,
} from "@/lib/validations/api/api-contract";
import { authOptions } from "@/lib/auth";
import {
	bids,
	companies,
	contractBids,
	contractJobs,
	contracts,
	jobMedia,
	jobs,
	media,
} from "@/db/migrations/schema";
import { and, eq, inArray, exists, sql } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { parse } from "url";
import fullContractView from "@/db/views/full-contract";
import companyContractsView from "@/db/views/company-contracts";

// TODO: Test all endpoints
export async function POST(req: Request) {
	const session = await getServerSession(authOptions);
	if (!session || session.user.ownedCompanies.length < 1) {
		return new Response("Unauthorized", { status: 401 });
	}

	let reqBody = await req.json();

	const attemptBodyParse = createContractSchema.safeParse(reqBody);

	if (!attemptBodyParse.success) {
		console.log("POST /api/contracts Error:", attemptBodyParse.error);
		return new Response("Error parsing request body.", { status: 400 });
	}

	reqBody = attemptBodyParse.data;

	const newID = `cntr_${crypto.randomUUID()}`;
	const { reqJobs, ...reqContract } = reqBody;

	const contractValueParse = insertContractSchema.safeParse({
		id: newID,
		...reqContract,
	});

	if (!contractValueParse.success) {
		console.log("POST /api/contracts Error:", contractValueParse.error);
		return new Response("An error occureed while parsing the request body.", {
			status: 400,
		});
	}

	const contractValues = contractValueParse.data;

	const contractJobValues = reqJobs.map((job: any) => {
		return {
			contractId: newID,
			jobId: job.id,
		};
	});

	try {
		await db.transaction(async (tx) => {
			// insert Contract
			await tx.insert(contracts).values({
				...contractValues,
				id: newID,
			});

			// Insert contract jobs
			await tx.insert(contractJobs).values(contractJobValues);
		});
	} catch (err) {
		console.log("POST /api/contracts Error:", err);
		return new Response("An error occured creating the contract.", {
			status: 500,
		});
	}

	return new Response("Contract created successfully.", {
		status: 201,
	});
}

export async function GET(req: Request) {
	const { query } = parse(req.url, true);

	const attemptBodyParse = fetchContractsQuerySchema.safeParse(query);

	if (!attemptBodyParse.success) {
		console.log("GET /api/contracts Error:", attemptBodyParse.error);
		return new Response("Error parsing request body.", { status: 400 });
	}

	const { companyId, contractId, fetchType, getInactive, limit } =
		attemptBodyParse.data;

	let queryBuilder;

	switch (fetchType) {
		// Simple fetch obly gets the contract data
		case "simple":
			queryBuilder = db
				.select({ contracts })
				.from(fullContractView)
				.innerJoin(contracts, eq(contracts.id, fullContractView.contractId));

			break;

		// Deep fetch gets the contract data, job data, and media data
		case "deep":
			queryBuilder = db
				.select()
				.from(fullContractView)
				.innerJoin(contracts, eq(contracts.id, fullContractView.contractId))
				.innerJoin(jobs, eq(jobs.id, fullContractView.jobId))
				.leftJoin(media, eq(media.id, fullContractView.mediaId));

			break;

		// Minimal fetch only gets the data provided by the view
		case "minimal":
			queryBuilder = db.select().from(fullContractView);
			break;
	}

	if (!queryBuilder) {
		return new Response("Invalid 'fetchType'.", { status: 400 });
	}

	// Apply filtering to query if needed
	if (fetchType !== "minimal") {
		if (!getInactive) {
			queryBuilder = queryBuilder.where(eq(contracts.isActive, 1));
		}

		if (contractId) {
			queryBuilder = queryBuilder.where(eq(contracts.id, contractId));
		}
	}

	if (companyId) {
		queryBuilder = queryBuilder.where(
			exists(
				db
					.select()
					.from(companyContractsView)
					.where(
						and(
							eq(companyContractsView.companyId, companyId),
							eq(
								companyContractsView.contractId,
								sql`full_contract_view.contract_id`
							) // Weird work around to to make this query work
						)
					)
			)
		);
	}

	try {
		// Limit the number of results (defaults to 25)
		const res = await queryBuilder.limit(contractId ? 1 : limit);

		return new Response(JSON.stringify(res), { status: 200 });
	} catch (err) {
		console.log("GET /api/contracts Error:", err);
		return new Response("An error occured fetching the contract(s)", {
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

	const attemptBodyParse = updateContractSchema.safeParse({
		id: query.id,
		...reqBody,
	});

	if (!attemptBodyParse.success) {
		console.log("PATCH /api/contracts Error:", attemptBodyParse.error);
		return new Response("Error parsing request body or query parameters.", {
			status: 400,
		});
	}

	const { id, removedJobs, newJobs, ...updateValues } = attemptBodyParse.data;

	//Make sure user owns the contract
	try {
		const userOwnsContract = await db
			.select()
			.from(companyContractsView)
			.where(eq(contracts.id, id))
			.innerJoin(companies, eq(companies.ownerId, session.user.id))
			.limit(1);

		if (userOwnsContract.length < 1) {
			return new Response("User does not own the contract.", { status: 401 });
		}
	} catch (err) {
		console.log("PATCH /api/contracts Error:", err);
		return new Response("Error verifying contract ownership.", { status: 500 });
	}

	// Delete jobs
	if (removedJobs) {
		try {
			await db
				.delete(contractJobs)
				.where(
					and(
						eq(contractJobs.contractId, id),
						inArray(contractJobs.jobId, removedJobs)
					)
				);
		} catch (err) {
			console.log("PATCH /api/contracts Error:", err);
			return new Response("Error deleting jobs.", { status: 500 });
		}
	}

	// Insert jobs
	if (newJobs) {
		try {
			// Link new jobs to contract
			await db.insert(contractJobs).values(
				newJobs.map((jobId) => ({
					contractId: id,
					jobId,
				}))
			);


		} catch (err) {
			console.log("PATCH /api/contracts Error:", err);
			return new Response("An error occured while inserting new jobs.", {
				status: 400,
			});
		}
	}

	// Update contract
	try {
		await db.update(contracts).set(updateValues).where(eq(contracts.id, id));
	} catch (err) {
		console.log("PATCH /api/contracts Error:", err);
		return new Response("Error updating contract.", { status: 500 });
	}

	return new Response("Contract updated successfully.", { status: 200 });
}

export async function DELETE(req: Request) {
	const { query } = parse(req.url, true);
	const validParameters = deleteContractQuerySchema.safeParse(query);

	if (!validParameters.success) {
		console.log("DELETE /api/contracts Error:", validParameters.error);
		return new Response("Invalid query parameters.", { status: 400 });
	}

	const { contractId } = validParameters.data;

	try {
		// Start a transaction
		await db.update(contracts).set({ isActive: 0 }).where(eq(contracts.id, contractId));
	} catch (err) {
		console.log("DELETE /api/contracts Error:", err);
		return new Response("Error deleting contract.", { status: 500 });
	}

	return new Response("Contract deleted successfully.", { status: 200 });
}
