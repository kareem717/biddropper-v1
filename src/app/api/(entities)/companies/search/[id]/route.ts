import { db } from "@/db/client";
import { inArray, eq, and, gte, sql } from "drizzle-orm";
import { queryParamSchema } from "@/lib/validations/api/(entities)/companies/search/[id]/request";
import {
	addresses,
	companies,
	industries,
	media,
} from "@/db/schema/tables/content";
import { industriesToCompanies } from "@/db/schema/tables/relations/content";
import { NextRequest } from "next/server";
import { parse } from "url";

export async function GET(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	if (!params.id) {
		return new Response("Missing company id.", { status: 400 });
	}

	const { query } = parse(req.url, true);

	const attemptQueryParse = queryParamSchema.GET.safeParse(query);

	if (!attemptQueryParse.success) {
		console.log(attemptQueryParse.error);
		return new Response(
			JSON.stringify({ error: attemptQueryParse.error.issues[0]?.message }),
			{ status: 400 }
		);
	}

	const { fetchType } = attemptQueryParse.data;

	const querySelectsBase = {
		id: companies.id,
		name: companies.name,
		imageUrl: media.url,
		phoneNumber: companies.phoneNumber,
		websiteUrl: companies.websiteUrl,
		email: companies.emailAddress,
		isVerified: companies.isVerified,
		isActive: companies.isActive,
	};

	const querySelectsDeep = {
		...querySelectsBase,
		dateEstablished: companies.dateEstablished,
		serviceArea: companies.serviceArea,
		address: addresses,
		products: companies.products,
		specialties: companies.specialties,
		services: companies.services,
		createdAt: companies.createdAt,
	};

	const querySelectsShallow = {
		...querySelectsBase,
		longitude: addresses.longitude,
		latitude: addresses.latitude,
		region: addresses.region,
		city: addresses.city,
		postalCode: addresses.postalCode,
	};

	const querySelects =
		fetchType === "deep" ? querySelectsDeep : querySelectsShallow;
	try {
		// Execute the query
		const [res] = await db
			.select({
				...querySelects,
				industries: sql`array_agg(${industries.value})`,
			})
			.from(companies)
			.innerJoin(addresses, eq(companies.addressId, addresses.id))
			.innerJoin(media, eq(companies.imageId, media.id))
			.innerJoin(
				industriesToCompanies,
				eq(companies.id, industriesToCompanies.companyId)
			)
			.innerJoin(
				industries,
				eq(industries.id, industriesToCompanies.industryId)
			)
			.where(eq(companies.id, params.id))
			.groupBy(
				...Object.values(querySelects),
				...(fetchType === "deep" ? [addresses.id] : [])
			)
			.orderBy(companies.id)
			.limit(1);

		return new Response(
			JSON.stringify({
				...res,
			}),
			{ status: 200 }
		);
	} catch (err) {
		console.log(err);
		return new Response(
			JSON.stringify({
				error: "An error occured whilst fetching the companies",
			}),
			{
				status: 500,
			}
		);
	}
}
