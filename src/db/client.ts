import { env } from "@/env.mjs";
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

const client = postgres(env["SUPABASE_DATABASE_URL"])

export const db = drizzle(client);
export type DBClient = typeof db;
