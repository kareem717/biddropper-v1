import { db } from "@/db/client";
import { authOptions } from "@/lib/auth";
import { addresses, companies, jobs } from "@/db/schema/tables/content";
import { getServerSession } from "next-auth";
import { bodyParamSchema } from "@/lib/validations/api/(content)/jobs/search/company/request";
import { jobsRelationships } from "@/db/schema/tables/relations/content";
import { and, eq, gte, inArray, lte, sql } from "drizzle-orm";
import { user } from "@/db/schema/tables/auth";

export async function POST(req: Request) {
	const session = await getServerSession(authOptions);
	if (!session || !session.user.ownedCompanies.length) {
		return new Response(JSON.stringify({ error: "Unauthorized" }), {
			status: 401,
		});
	}

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
		includeInactive,
		limit,
		cursor,
		propertyTypes,
		startDateFlags,
		locationFilter,
		ids,
		minCreatedAt,
		maxCreatedAt,
		minStartDate,
		maxStartDate,
		companyId,
	} = attemptBodyParse.data;

	try {
		const conditions = [
			eq(jobsRelationships.companyId, companyId),
			ids ? inArray(jobs.id, ids) : undefined,
			minCreatedAt ? gte(jobs.createdAt, minCreatedAt) : undefined,
			maxCreatedAt ? lte(jobs.createdAt, maxCreatedAt) : undefined,
			minStartDate ? gte(jobs.startDate, minStartDate) : undefined,
			maxStartDate ? lte(jobs.startDate, maxStartDate) : undefined,
			propertyTypes ? inArray(jobs.propertyType, propertyTypes) : undefined,
			startDateFlags ? inArray(jobs.startDateFlag, startDateFlags) : undefined,
			locationFilter
				? sql`ST_DWithin(
        ST_MakePoint(${addresses.longitude}, ${addresses.latitude})::geography,
        ST_MakePoint(${locationFilter.lng}, ${locationFilter.lat})::geography,
        ${locationFilter.kmDistance} * 1000
      )`
				: undefined,
			cursor ? gte(jobs.id, cursor) : undefined,
			includeInactive !== true ? eq(jobs.isActive, true) : undefined,
		];

		const res = await db
			.select({
				id: jobs.id,
				title: jobs.title,
				description: sql`SUBSTRING(${jobs.description} FROM 0 FOR 150)`.as(
					"description"
				),
				createdAt: jobs.createdAt,
				idustry: jobs.industry,
				startDate: jobs.startDate,
				startDateFlag: jobs.startDateFlag,
				propertyType: jobs.propertyType,
				isCommercialProperty: jobs.isCommercialProperty,
				isActive: jobs.isActive,
				address: {
					latitude: addresses.latitude,
					longitude: addresses.longitude,
					city: addresses.city,
					postalCode: addresses.postalCode,
					region: addresses.region,
				},
			})
			.from(jobs)
			.innerJoin(addresses, eq(addresses.id, jobs.addressId))
			.innerJoin(jobsRelationships, eq(jobsRelationships.jobId, jobs.id))
			.where(and(...conditions))
			.limit(limit + 1);

		return new Response(
			JSON.stringify({
				cursor: res.length > limit ? res[res.length - 1]?.id : null,
				data: res.slice(0, limit),
			}),
			{
				status: 200,
			}
		);
	} catch (error) {
		return new Response(JSON.stringify({ error: "Error fetching jobs." }), {
			status: 500,
		});
	}
}
