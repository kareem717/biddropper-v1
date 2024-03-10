import { db } from "@/lib/db/client";
import { eq, sql } from "drizzle-orm";
import { queryParamsSchema } from "@/lib/deprecated/validations/api/(content)/jobs/search/[id]/request";
import {
  addresses,
  companies,
  jobs,
  media,
} from "@/lib/db/schema/tables/content";
import {
  jobsRelationships,
  mediaRelationships,
} from "@/lib/db/schema/tables/relations/content";
import { parse } from "url";
import { user } from "@/lib/db/schema/tables/auth";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  if (!params.id) {
    return new Response("Missing company ID.", { status: 400 });
  }

  const { query } = parse(req.url, true);

  const attemptQueryParse = queryParamsSchema.GET.safeParse({
    jobId: params.id,
    ...query,
  });

  if (!attemptQueryParse.success) {
    console.log(attemptQueryParse.error);
    return new Response(
      JSON.stringify({ error: attemptQueryParse.error.issues[0]?.message }),
      { status: 400 },
    );
  }

  const { jobId, fetchType } = attemptQueryParse.data;
  // If the user is not the owner of a company, they can only view their own jobs
  if (!session.user.ownedCompanies.length) {
    try {
      const [jobRel] = await db
        .select({
          userId: jobsRelationships.userId,
        })
        .from(jobsRelationships)
        .where(eq(jobsRelationships.jobId, jobId));

      if (!jobRel) {
        return new Response(JSON.stringify({ error: "Job not found" }), {
          status: 404,
        });
      }

      if (session.user.id !== jobRel.userId) {
        return new Response(
          JSON.stringify({ error: "Unauthorized to view this job" }),
          {
            status: 401,
          },
        );
      }
    } catch (err) {
      return new Response(
        JSON.stringify({
          error: "An error occured whilst fetching the job",
        }),
        {
          status: 500,
        },
      );
    }
  }

  const querySelectsBase = {
    id: jobs.id,
    title: jobs.title,
    createdAt: jobs.createdAt,
    idustry: jobs.industry,
    startDate: jobs.startDate,
    startDateFlag: jobs.startDateFlag,
    propertyType: jobs.propertyType,
    isCommercialProperty: jobs.isCommercialProperty,
    isActive: jobs.isActive,
    company: {
      id: companies.id,
      name: companies.name,
    },
    user: {
      id: user.id,
      name: user.name,
    },
  };

  const querySelectsDeep = {
    ...querySelectsBase,
    images: sql`ARRAY_AGG(${media.url})`,
    address: addresses,
    description: jobs.description,
  };

  const querySelectsShallow = {
    ...querySelectsBase,
    description: sql`SUBSTRING(${jobs.description} FROM 0 FOR 150)`.as(
      "description",
    ),
    address: {
      latitude: addresses.latitude,
      longitude: addresses.longitude,
      city: addresses.city,
      postalCode: addresses.postalCode,
      region: addresses.region,
    },
  };

  console.log(fetchType);
  const querySelects =
    fetchType === "deep" ? querySelectsDeep : querySelectsShallow;
  try {
    // Execute the query
    let baseQB = db
      .select({
        ...querySelects,
      })
      .from(jobs)
      .innerJoin(addresses, eq(addresses.id, jobs.addressId))
      .innerJoin(jobsRelationships, eq(jobsRelationships.jobId, jobs.id))
      .leftJoin(companies, eq(jobsRelationships.companyId, companies.id))
      .leftJoin(user, eq(jobsRelationships.userId, user.id));

    if (fetchType === "deep") {
      baseQB = baseQB
        .leftJoin(mediaRelationships, eq(mediaRelationships.jobId, jobs.id))
        .leftJoin(media, eq(media.id, mediaRelationships.mediaId));
    }

    const res = await baseQB
      .where(eq(jobs.id, jobId))
      .groupBy(jobs.id, companies.id, user.id, addresses.id);

    if (!res.length) {
      return new Response(JSON.stringify({ error: "Job not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(res[0]), { status: 200 });
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: "An error occured whilst fetching the job",
      }),
      {
        status: 500,
      },
    );
  }
}
