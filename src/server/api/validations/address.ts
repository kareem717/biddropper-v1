import { addresses } from "@/server/db/schema/tables/content";
import { createInsertSchema } from "drizzle-zod";

export const createAddressInput = createInsertSchema(addresses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
