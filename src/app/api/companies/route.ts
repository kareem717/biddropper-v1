import { db } from "@/db";
import {
	companies,
	addresses,
	media,
	industries,
	companyIndustries,
} from "@/db/migrations/schema";
import { insertCompanySchema } from "@/lib/validations/companies";
import { z } from "zod";
import { insertIndustrySchema } from "@/lib/validations/misc/industries";
import { insertMediaSchema } from "@/lib/validations/posts/posts";
import { randomUUID } from "crypto";
import { inArray, eq } from "drizzle-orm";
import { insertAddressSchema } from "@/lib/validations/misc/address";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { headers } from "next/headers";
export async function POST(req: Request) {
	const session = getServerSession(authOptions);
	if (!session) return new Response("Unauthorized", { status: 401 });

	const body = await req.json();

	console.log({ body, dateEstablished: new Date(body.dateEstablished) });
	const data = insertCompanySchema
		.omit({
			createdAt: true,
			updatedAt: true,
			addressId: true,
			isVerified: true,
			imageId: true,
		})
		.extend({
			address: insertAddressSchema.omit({
				id: true,
				createdAt: true,
				updatedAt: true,
			}),
			industries: insertIndustrySchema.omit({ id: true }).array(),
			image: insertMediaSchema
				.omit({
					id: true,
				})
				.optional(),
		})
		.safeParse({ ...body, dateEstablished: new Date(body.dateEstablished) });

	if (!data.success) {
		return new Response(JSON.stringify(data.error), {
			headers: {
				"content-type": "application/json",
			},
			status: 400,
		});
	}

	const {
		industries: newCompanyIndustries,
		image,
		address,
		...companyData
	} = data.data;
	console.log(newCompanyIndustries, image, address, companyData);
	try {
		const newAddressId = `addr_${randomUUID()}`;
		const companyImageId = image && `media_${randomUUID()}`;
		await db.transaction(async (tx) => {
			console.log("inserting");
			// insert address
			await tx.insert(addresses).values({
				id: newAddressId,
				...address,
			});

			// insert image
			if (image && companyImageId) {
				await tx.insert(media).values({
					id: companyImageId,
					...image,
				});
			}

			// insert company
			await tx.insert(companies).values({
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
					rows.map((row) => ({ ...row, companyId: companyData.id }))
				);

			// insert company industries
			if (industryIds) {
				await tx.insert(companyIndustries).values(industryIds);
			}

			return new Response("Company created", { status: 201 });
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

	return new Response("Company created", { status: 201 });
}

export async function GET(req: Request) {
	const headerList = headers();
	const companyId = headerList.get("Company-ID");

	if (!companyId) {
		return new Response("Company ID not provided", { status: 400 });
	}

	const company = await db
		.select()
		.from(companies)
		.where(eq(companies.id, companyId))
		.innerJoin(addresses, eq(companies.addressId, addresses.id))
		.innerJoin(media, eq(companies.imageId, media.id))
		.innerJoin(companyIndustries, eq(companies.id, companyIndustries.companyId))
		.leftJoin(industries, eq(companyIndustries.industryId, industries.id))
		.limit(1);

	if (!company) {
		return new Response("Company not found", { status: 404 });
	}

	return new Response(JSON.stringify(company), {
		headers: {
			"content-type": "application/json",
		},
		status: 200,
	});
}
