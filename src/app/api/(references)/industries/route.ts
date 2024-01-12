import { db } from "@/db/client";
import { industries as dbIndustries } from "@/db/schema/tables/content";

export async function GET(_req: Request) {
  console.log("GET /api/industries");
  const industries = await db
    .select({
      label: dbIndustries.label,
      value: dbIndustries.value,
    })
    .from(dbIndustries);

  return new Response(JSON.stringify(industries), {
    headers: {
      "content-type": "application/json",
    },
    status: 200,
  });
}
