import { db } from "@/db/client";
import { randomUUID } from "crypto";
import { inArray, eq, and, exists } from "drizzle-orm";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { bodyParamSchema } from "@/lib/validations/api/companies/request";
import { createClient } from "@supabase/supabase-js";
import { pipeline } from "stream";
import { promisify } from "util";
import { createWriteStream } from "fs";
import {
	addresses,
	companies,
	industries,
	media,
} from "@/db/schema/tables/content";
import getSupabaseClient from "@/lib/supabase/getSupabaseClient";
import { CustomError, customId } from "@/lib/utils";
import { industriesToCompanies } from "@/db/schema/tables/relations/content";
import { env } from "@/env.mjs";

export async function POST(req: Request) {
	const session = await getServerSession(authOptions);
	if (!session) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

	const reqBody = await req.json();

	const attemptBodyParse = await bodyParamSchema.POST.safeParseAsync(reqBody);

	if (!attemptBodyParse.success) {
		console.log(attemptBodyParse.error);
		return new Response(
			JSON.stringify({ error: attemptBodyParse.error.issues[0]?.message }),
			{ status: 400 }
		);
	}

	const { address, imageBase64, industryValues, ...companyData } =
		attemptBodyParse.data;

	// Make sure company name dosen't already exist
	try {
		const [contractNameExists] = await db
			.select({ name: companies.name })
			.from(companies)
			.where(eq(companies.name, companyData.name))
			.limit(1);

		if (contractNameExists) {
			return new Response(
				JSON.stringify({ error: "Contract name is taken." }),
				{ status: 400 }
			);
		}
	} catch (err) {
		return new Response(
			JSON.stringify({ error: "An error occured veryfing the contract name." }),
			{ status: 500 }
		);
	}

	try {
		await db.transaction(async (tx) => {
			const newAddressId = `addr_${randomUUID()}`;
			try {
				// insert address
				await tx.insert(addresses).values({
					id: newAddressId,
					...address,
				});
			} catch (err) {
				throw new CustomError("Error inserting address.", 500);
			}

			// Upload image to Supabase
			const newImageId = customId("media");
			const fileType = imageBase64.split(";")[0]?.split("/")[1];

			if (!fileType || !["png", "jpeg", "jpg"].includes(fileType)) {
				throw new CustomError("Invalid image format.", 400);
			}

			const fileName = `${newImageId}.${fileType}`;

			// Convert base64 to Blob
			const base64Response = await fetch(imageBase64);
			const blob = await base64Response.blob();
			const { data, error } = await getSupabaseClient()
				.storage.from("images")
				.upload(fileName, blob, {
					contentType: `image/${fileType}`,
				});

			if (error) {
				throw new CustomError("Error uploading image.", 500);
			}

			// Save url in db
			try {
				const url = new URL(env.SUPABASE_ENDPOINT);

				await tx.insert(media).values({
					id: newImageId,
					url: `https://${url.hostname}/storage/v1/object/public/images/${data?.path}`,
				});
			} catch (err) {
				throw new CustomError("Error inserting image.", 500);
			}

			// insert company
			const newCompanyId = `comp_${randomUUID()}`;
			try {
				await tx.insert(companies).values({
					id: newCompanyId,
					// ownerId: session.user.id,
					...companyData,
					addressId: newAddressId,
					imageId: newImageId,
				});
			} catch (error) {
				throw new CustomError("Error inserting company.", 500);
			}

			// Insert industry relations
			try {
				const industryIds = await db
					.select({ id: industries.id })
					.from(industries)
					.where(inArray(industries.value, industryValues))
					.limit(industryValues.length);

				if (industryIds.length !== industryValues.length) {
					throw new CustomError("Invalid industry values.", 400);
				}

				await tx.insert(industriesToCompanies).values(
					industryIds.map((industry) => ({
						companyId: newCompanyId,
						industryId: industry.id,
					}))
				);
			} catch (err) {
				throw new CustomError("Error inserting industry relations.", 500);
			}
		});
	} catch (err) {
		const message =
			err instanceof CustomError
				? (err as Error).message
				: "Error creating bid.";
		return new Response(
			JSON.stringify({
				error: message,
			}),
			{ status: err instanceof CustomError ? err.status : 500 }
		);
	}

	return new Response(
		JSON.stringify({
			message: "Company successfully created.",
		}),
		{ status: 201 }
	);
}

// export async function GET(req: Request) {
// 	const { query } = parse(req.url, true);

// 	const attemptBodyParse = fetchCompanyQuerySchema.safeParse(query);

// 	if (!attemptBodyParse.success) {
// 		console.log("GET /api/companies Error:", attemptBodyParse.error);
// 		return new Response("Error parsing request body.", { status: 400 });
// 	}

// 	const { companyId, fetchType, limit } = attemptBodyParse.data;

// 	let queryBuilder;

// 	switch (fetchType) {
// 		// Simple fetch obly gets the contract data
// 		case "simple":
// 			queryBuilder = db.select({ companies }).from(companies);
// 			break;

// 		// Deep fetch gets the contract data, job data, and media data
// 		case "deep":
// 			queryBuilder = db
// 				.select()
// 				.from(companies)
// 				.innerJoin(media, eq(media.id, companies.imageId))
// 				.innerJoin(addresses, eq(addresses.id, companies.addressId));

// 			break;

// 		// Minimal fetch only gets the data provided by the view
// 		case "minimal":
// 			queryBuilder = db
// 				.select({
// 					id: companies.id,
// 					imageId: companies.imageId,
// 					addressId: companies.addressId,
// 				})
// 				.from(companies);
// 			break;
// 	}

// 	if (!queryBuilder) {
// 		return new Response("Invalid 'fetchType'.", { status: 400 });
// 	}

// 	if (companyId) {
// 		queryBuilder = queryBuilder.where(eq(companies.id, companyId));
// 	}

// 	try {
// 		// Limit the number of results (defaults to 25)
// 		const res = await queryBuilder.limit(companyId ? 1 : limit);

// 		return new Response(JSON.stringify(res), { status: 200 });
// 	} catch (err) {
// 		console.log("GET /api/companies Error:", err);
// 		return new Response("An error occured fetching the company/companies", {
// 			status: 500,
// 		});
// 	}
// }

// export async function PATCH(req: Request) {
// 	const session = await getServerSession(authOptions);
// 	if (!session || session.user.ownedCompanies.length < 1) {
// 		return new Response("Unauthorized", { status: 401 });
// 	}

// 	const reqBody = await req.json();
// 	const { query } = parse(req.url, true);

// 	const attemptBodyParse = updateCompanySchema.safeParse({
// 		...reqBody,
// 		id: query.companyId,
// 	});

// 	if (!attemptBodyParse.success) {
// 		console.log("PATCH /api/companies Error:", attemptBodyParse.error);
// 		return new Response("Error parsing request body.", { status: 400 });
// 	}

// 	const {
// 		removedJobs,
// 		addedJobs,
// 		removedIndustries,
// 		addedIndustries,
// 		removedProjects,
// 		addedProjects,
// 		addedReviews,
// 		removedReviews,
// 		newAddress,
// 		newImage,
// 		id: companyId,
// 		...newCompanyDetails
// 	} = attemptBodyParse.data;

// 	const userOwnsCompany = session.user.ownedCompanies.some(
// 		(company) => company.id === companyId
// 	);

// 	if (!userOwnsCompany) {
// 		return new Response("Unauthorized", { status: 401 });
// 	}

// 	try {
// 		await db.transaction(async (tx) => {
// 			//update company details
// 			if (newCompanyDetails) {
// 				await tx
// 					.update(companies)
// 					.set(newCompanyDetails)
// 					.where(eq(companies.id, companyId));
// 			}

// 			//update company jobs
// 			if (removedJobs) {
// 				await tx
// 					.delete(companyJobs)
// 					.where(eq(companyJobs.companyId, companyId));
// 			}

// 			if (addedJobs) {
// 				const res = await fetch(
// 					`${process.env.NEXT_PUBLIC_API_URL}/api/jobs?companyId=${companyId}`,
// 					{
// 						method: "POST",
// 						headers: {
// 							"Content-Type": "application/json",
// 						},
// 						body: JSON.stringify({
// 							jobs: addedJobs.jobs,
// 						}),
// 					}
// 				);

// 				if (!res.ok) {
// 					tx.rollback();
// 					throw new Error("Error adding jobs");
// 				}
// 			}

// 			//update company projects
// 			if (removedProjects) {
// 				await tx.delete(projects).where(eq(projects.companyId, companyId));
// 			}

// 			if (addedProjects) {
// 				const res = await fetch(
// 					`${process.env.NEXT_PUBLIC_API_URL}/api/projects?companyId=${companyId}`,
// 					{
// 						method: "POST",
// 						headers: {
// 							"Content-Type": "application/json",
// 						},
// 						body: JSON.stringify({
// 							...addedProjects,
// 						}),
// 					}
// 				);

// 				if (!res.ok) {
// 					tx.rollback();
// 					throw new Error("Error adding projects");
// 				}
// 			}

// 			//update company reviews
// 			if (removedReviews) {
// 				await tx
// 					.delete(companyReviews)
// 					.where(eq(companyReviews.companyId, companyId));
// 			}

// 			if (addedReviews) {
// 				const res = await fetch(
// 					`${process.env.NEXT_PUBLIC_API_URL}/api/reviews?companyId=${companyId}`,
// 					{
// 						method: "POST",
// 						headers: {
// 							"Content-Type": "application/json",
// 						},
// 						body: JSON.stringify({
// 							...addedReviews,
// 						}),
// 					}
// 				);

// 				if (!res.ok) {
// 					tx.rollback();
// 					throw new Error("Error adding reviews");
// 				}
// 			}
// 		});
// 	} catch (err) {
// 		console.log("PATCH /api/companies Error:", err);
// 		return new Response("An error occured updating the company.", {
// 			status: 500,
// 		});
// 	}
// }

// export async function DELETE(req: Request) {
// 	const { query } = parse(req.url, true);

// 	const session = await getServerSession(authOptions);
// 	if (!session) {
// 		return new Response("Unauthorized", { status: 401 });
// 	}

// 	const attemptQueryParse = deleteCompanySchema.safeParse(query);

// 	if (!attemptQueryParse.success) {
// 		console.log("DELETE /api/companies Error:", attemptQueryParse.error);
// 		return new Response("Error parsing query parameters.", { status: 400 });
// 	}

// 	const { companyId } = attemptQueryParse.data;

// 	// Make sure user owns the company

// 	try {
// 		const userOwnsCompany = await db
// 			.select({
// 				id: companies.id,
// 			})
// 			.from(companies)
// 			.where(
// 				and(eq(companies.id, companyId), eq(companies.ownerId, session.user.id))
// 			)
// 			.limit(1);

// 		if (userOwnsCompany.length < 1) {
// 			return new Response("User does not own the company.", { status: 401 });
// 		}
// 	} catch (err) {
// 		console.log("DELETE /api/companies Error:", err);
// 		return new Response("An error occured while checking company ownership.", {
// 			status: 500,
// 		});
// 	}

// 	try {
// 		await db
// 			.update(companies)
// 			.set({ isActive: 0 })
// 			.where(eq(companies.id, companyId));
// 	} catch (err) {
// 		console.log("DELETE /api/companies Error:", err);
// 		return new Response("An error occured while deleting the company.", {
// 			status: 500,
// 		});
// 	}

// 	return new Response("Company deleted", { status: 200 });
// }
