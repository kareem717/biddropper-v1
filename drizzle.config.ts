import * as dotenv from "dotenv";
import type { Config } from "drizzle-kit";

dotenv.config({ path: ".env.local" });

export default {
	schema: "./src/db/schema/",
	driver: "mysql2",
	out: "./src/db/schema/",
	dbCredentials: {
		connectionString: process.env.PLANETSCALE_DATABASE_URL ?? "",
	},
} satisfies Config;