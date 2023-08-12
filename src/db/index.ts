import { drizzle } from "drizzle-orm/planetscale-serverless";
import { connect } from "@planetscale/database";
import { env } from "@/env.mjs";

export const connection = connect({
  host: env["PLANETSCALE_HOST_NAME"],
  username: env["PLANETSCALE_USERNAME"],
  password: env["PLANETSCALE_PASSWORD"],
});
 
export const db = drizzle(connection);
export type DBClient = typeof db
