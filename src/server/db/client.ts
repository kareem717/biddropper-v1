import { env } from "@/env.mjs";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as content from "./schema/tables/content";
import * as auth from "./schema/tables/auth";
import * as relations from "./schema/tables/relations/content";

export const db = drizzle(postgres(env["SUPABASE_DATABASE_URL"], { prepare: false }), {
  schema: {
    ...content,
    ...auth,
    ...relations,
  },
});
export type DBClient = typeof db;
