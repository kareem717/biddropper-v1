import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { addresses, companies } from "@/db/migrations/schema";
import * as z from "zod";

export const insertCompanySchema = createInsertSchema(companies)
export const selectCompanySchema = createSelectSchema(companies);
