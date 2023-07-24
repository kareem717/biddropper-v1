import * as dotenv from "dotenv";
import type { Config } from "drizzle-kit";

dotenv.config({ path: ".env.local" });

export default {
	schema: "./drizzle/schema.ts",
	driver: "mysql2",
	out: "./drizzle",
	dbCredentials: {
		connectionString: process.env.PLANETSCALE_DATABASE_URL ?? "",
	},
} satisfies Config;