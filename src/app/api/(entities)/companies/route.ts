import { db } from "@/db/client";
import {
	companies,
	addresses,
	media,
	industries,
	companyIndustries,
	companyJobs,
	projects,
} from "@/db/migrations/schema";
import { randomUUID } from "crypto";
import { inArray, eq, and, exists } from "drizzle-orm";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import {
	createCompanySchema,
	deleteCompanySchema,
	fetchCompanyQuerySchema,
	updateCompanySchema,
} from "@/lib/validations/api/api-companies";
import { parse } from "url";
import { companyReviews } from "@/db/migrations/last_working_schema";

export async function POST(req: Request) {
	const session = await getServerSession(authOptions);
	if (!session) return new Response("Unauthorized", { status: 401 });

	const reqBody = await req.json();

	const attemptBodyParse = createCompanySchema.safeParse(reqBody);

	if (!attemptBodyParse.success) {
		console.log("POST /api/companies Error:", attemptBodyParse.error);
		return new Response("Error parsing request body or query parameters.", {
			status: 400,
		});
	}

	const {
		address,
		image,
		industries: newCompanyIndustries,
		...companyData
	} = attemptBodyParse.data;

	// Make sure company name dosen't already exist
	try {
		const res = await db
			.select({ name: companies.name })
			.from(companies)
			.where(eq(companies.name, companyData.name))
			.limit(1);

		if (res.length > 0) {
			return new Response("Company name already exists", { status: 400 });
		}
	} catch (err) {
		console.log("POST /api/companies Error:", err);
		return new Response("Error checking if company name already exists", {
			status: 500,
		});
	}

	try {
		await db.transaction(async (tx) => {
			const newAddressId = `addr_${randomUUID()}`;
			// insert address
			await tx.insert(addresses).values({
				id: newAddressId,
				...address,
			});

			// insert image
			const companyImageId = image && `media_${randomUUID()}`;
			if (image && companyImageId) {
				await tx.insert(media).values({
					id: companyImageId,
					...image,
				});
			}

			// insert company
			const newCompanyId = `comp_${randomUUID()}`;
			await tx.insert(companies).values({
				id: newCompanyId,
				...companyData,
				addressId: newAddressId,
				imageId: companyImageId,
			});

			// insert industries
			const industryIds = await tx
				.select({
					industryId: industries.id,
				})
				.from(industries)
				.where(
					inArray(
						industries.value,
						newCompanyIndustries.map((industry) => industry.value)
					)
				)
				.then((rows) =>
					rows.map((row) => ({ ...row, companyId: newCompanyId }))
				);

			// insert company industries
			if (industryIds) {
				await tx.insert(companyIndustries).values(industryIds);
			}
		});
	} catch (err) {
		console.log("POST /api/companies Error:", err);
		return new Response("An error occured while creating the company.", {
			status: 500,
		});
	}

	return new Response("Company created", { status: 201 });
}

export async function GET(req: Request) {
	const { query } = parse(req.url, true);

	const attemptBodyParse = fetchCompanyQuerySchema.safeParse(query);

	if (!attemptBodyParse.success) {
		console.log("GET /api/companies Error:", attemptBodyParse.error);
		return new Response("Error parsing request body.", { status: 400 });
	}

	const { companyId, fetchType, limit } = attemptBodyParse.data;

	let queryBuilder;

	switch (fetchType) {
		// Simple fetch obly gets the contract data
		case "simple":
			queryBuilder = db.select({ companies }).from(companies);
			break;

		// Deep fetch gets the contract data, job data, and media data
		case "deep":
			queryBuilder = db
				.select()
				.from(companies)
				.innerJoin(media, eq(media.id, companies.imageId))
				.innerJoin(addresses, eq(addresses.id, companies.addressId));

			break;

		// Minimal fetch only gets the data provided by the view
		case "minimal":
			queryBuilder = db
				.select({
					id: companies.id,
					imageId: companies.imageId,
					addressId: companies.addressId,
				})
				.from(companies);
			break;
	}

	if (!queryBuilder) {
		return new Response("Invalid 'fetchType'.", { status: 400 });
	}

	if (companyId) {
		queryBuilder = queryBuilder.where(eq(companies.id, companyId));
	}

	try {
		// Limit the number of results (defaults to 25)
		const res = await queryBuilder.limit(companyId ? 1 : limit);

		return new Response(JSON.stringify(res), { status: 200 });
	} catch (err) {
		console.log("GET /api/companies Error:", err);
		return new Response("An error occured fetching the company/companies", {
			status: 500,
		});
	}
}

export async function PATCH(req: Request) {
	const session = await getServerSession(authOptions);
	if (!session || session.user.ownedCompanies.length < 1) {
		return new Response("Unauthorized", { status: 401 });
	}

	const reqBody = await req.json();
	const { query } = parse(req.url, true);

	const attemptBodyParse = updateCompanySchema.safeParse({
		...reqBody,
		id: query.companyId,
	});

	if (!attemptBodyParse.success) {
		console.log("PATCH /api/companies Error:", attemptBodyParse.error);
		return new Response("Error parsing request body.", { status: 400 });
	}

	const {
		removedJobs,
		addedJobs,
		removedIndustries,
		addedIndustries,
		removedProjects,
		addedProjects,
		addedReviews,
		removedReviews,
		newAddress,
		newImage,
		id: companyId,
		...newCompanyDetails
	} = attemptBodyParse.data;

	const userOwnsCompany = session.user.ownedCompanies.some(
		(company) => company.id === companyId
	);

	if (!userOwnsCompany) {
		return new Response("Unauthorized", { status: 401 });
	}

	try {
		await db.transaction(async (tx) => {
			//update company details
			if (newCompanyDetails) {
				await tx
					.update(companies)
					.set(newCompanyDetails)
					.where(eq(companies.id, companyId));
			}

			//update company jobs
			if (removedJobs) {
				await tx
					.delete(companyJobs)
					.where(eq(companyJobs.companyId, companyId));
			}

			if (addedJobs) {
				const res = await fetch(
					`${process.env.NEXT_PUBLIC_API_URL}/api/jobs?companyId=${companyId}`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							jobs: addedJobs.jobs,
						}),
					}
				);

				if (!res.ok) {
					tx.rollback();
					throw new Error("Error adding jobs");
				}
			}

			//update company projects
			if (removedProjects) {
				await tx.delete(projects).where(eq(projects.companyId, companyId));
			}

			if (addedProjects) {
				const res = await fetch(
					`${process.env.NEXT_PUBLIC_API_URL}/api/projects?companyId=${companyId}`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							...addedProjects,
						}),
					}
				);

				if (!res.ok) {
					tx.rollback();
					throw new Error("Error adding projects");
				}
			}

			//update company reviews
			if (removedReviews) {
				await tx
					.delete(companyReviews)
					.where(eq(companyReviews.companyId, companyId));
			}

			if (addedReviews) {
				const res = await fetch(
					`${process.env.NEXT_PUBLIC_API_URL}/api/reviews?companyId=${companyId}`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							...addedReviews,
						}),
					}
				);

				if (!res.ok) {
					tx.rollback();
					throw new Error("Error adding reviews");
				}
			}
		});
	} catch (err) {
		console.log("PATCH /api/companies Error:", err);
		return new Response("An error occured updating the company.", {
			status: 500,
		});
	}
}

export async function DELETE(req: Request) {
	const { query } = parse(req.url, true);

	const session = await getServerSession(authOptions);
	if (!session) {
		return new Response("Unauthorized", { status: 401 });
	}

	const attemptQueryParse = deleteCompanySchema.safeParse(query);

	if (!attemptQueryParse.success) {
		console.log("DELETE /api/companies Error:", attemptQueryParse.error);
		return new Response("Error parsing query parameters.", { status: 400 });
	}

	const { companyId } = attemptQueryParse.data;

	// Make sure user owns the company

	try {
		const userOwnsCompany = await db
			.select({
				id: companies.id,
			})
			.from(companies)
			.where(
				and(eq(companies.id, companyId), eq(companies.ownerId, session.user.id))
			)
			.limit(1);

		if (userOwnsCompany.length < 1) {
			return new Response("User does not own the company.", { status: 401 });
		}
	} catch (err) {
		console.log("DELETE /api/companies Error:", err);
		return new Response("An error occured while checking company ownership.", {
			status: 500,
		});
	}

	try {
		await db
			.update(companies)
			.set({ isActive: 0 })
			.where(eq(companies.id, companyId));
	} catch (err) {
		console.log("DELETE /api/companies Error:", err);
		return new Response("An error occured while deleting the company.", {
			status: 500,
		});
	}

	return new Response("Company deleted", { status: 200 });
}
