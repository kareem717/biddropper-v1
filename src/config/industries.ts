import { db } from "@/db";
import { industries as dbIndustries } from "@/db/migrations/schema";
export const industries = await db.select(
	{
		label: dbIndustries.label,
		value: dbIndustries.value,
	}
).from(dbIndustries)

export const industryValues = industries.map((category) => category.value);
