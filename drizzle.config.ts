import * as dotenv from "dotenv";
import type { Config } from "drizzle-kit";

dotenv.config({ path: ".env.local" });

export default {
  schema: "./src/server/db/schema/**/*.ts",
  driver: "pg",
  out: "./src/server/db/migrations/",
  dbCredentials: {
    connectionString: process.env.SUPABASE_DATABASE_URL!,
  },
} satisfies Config;
