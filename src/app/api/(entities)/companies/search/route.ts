import { db } from "@/db/client";
import { inArray, eq, and, gte, sql } from "drizzle-orm";
import { bodyParamSchema } from "@/lib/validations/api/(entities)/companies/search/request";
import {
	addresses,
	companies,
	industries,
	media,
} from "@/db/schema/tables/content";
import { industriesToCompanies } from "@/db/schema/tables/relations/content";

export async function POST(req: Request) {
	const isGetOverideReq = req.headers.get("X-HTTP-Method-Override");

	if (isGetOverideReq !== "GET") {
		return new Response("Invalid method, need override.", { status: 501 });
	}

	let reqBody;

	try {
		reqBody = await req.json();
	} catch (error) {
		return new Response(
			JSON.stringify({ error: "Invalid JSON in request body." }),
			{ status: 400 }
		);
	}

	const attemptBodyParse = bodyParamSchema.POST.safeParse(reqBody);

	if (!attemptBodyParse.success) {
		return new Response(
			JSON.stringify({ error: attemptBodyParse.error.issues[0]?.message }),
			{ status: 400 }
		);
	}

	const {
		companyIds,
		includeInactive,
		includeUnverified,
		industryValues,
		serviceAreaFilter,
		limit,
		cursor,
	} = attemptBodyParse.data;

	let qb = db
		.select({
			id: companies.id,
			name: companies.name,
			imageUrl: media.url,
			phoneNumber: companies.phoneNumber,
			websiteUrl: companies.websiteUrl,
			email: companies.emailAddress,
			longitude: addresses.longitude,
			latitude: addresses.latitude,
			region: addresses.region,
			city: addresses.city,
			postalCode: addresses.postalCode,
			isVerified: companies.isVerified,
			isActive: companies.isActive,
			industries: sql`array_agg(${industries.value})`,
		})
		.from(companies)
		.innerJoin(addresses, eq(companies.addressId, addresses.id))
		.innerJoin(media, eq(companies.imageId, media.id))
		.innerJoin(
			industriesToCompanies,
			eq(companies.id, industriesToCompanies.companyId)
		)
		.innerJoin(industries, eq(industries.id, industriesToCompanies.industryId))
		.groupBy(
			companies.id,
			companies.name,
			media.url,
			companies.phoneNumber,
			companies.websiteUrl,
			companies.emailAddress,
			addresses.longitude,
			addresses.latitude,
			addresses.region,
			addresses.city,
			addresses.postalCode,
			companies.isVerified,
			companies.isActive
		)
		.orderBy(companies.id)
		.limit(limit + 1)
		.$dynamic();

	try {
		let conditions = [
			inArray(companies.isActive, includeInactive),
			inArray(companies.isVerified, includeUnverified),
		];

		// Add additional conditions if they exist
		if (cursor) {
			conditions.push(gte(companies.id, cursor));
		}

		if (companyIds) {
			conditions.push(inArray(companies.id, companyIds));
		}

		if (industryValues) {
			conditions.push(inArray(industries.value, industryValues));
		}

		if (serviceAreaFilter) {
			conditions.push(sql`ST_DWithin(
        ST_MakePoint(${addresses.longitude}, ${addresses.latitude})::geography,
        ST_MakePoint(${serviceAreaFilter.lng}, ${serviceAreaFilter.lat})::geography,
        ${companies.serviceArea} * 1000
      )`);
		}

		// Apply all conditions
		const filteredQuery = qb.where(and(...conditions));

		// Execute the query
		const res = await filteredQuery;

		return new Response(
			JSON.stringify({
				cursor: res.length > limit ? res[res.length - 1]?.id : null,
				data: res.slice(0, limit),
			}),
			{ status: 200 }
		);
	} catch (err) {
		console.error(err);
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
