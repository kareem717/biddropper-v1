import { env } from "@/env.mjs";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as content from "./schema/tables/content";
import * as auth from "./schema/tables/auth";
import * as relations from "./schema/tables/relations/content";

const client = postgres(env["SUPABASE_DATABASE_URL"]);

export const db = drizzle(client, {
  schema: {
    ...content,
    ...auth,
    ...relations,
  },
});
export type DBClient = typeof db;
