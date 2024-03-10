import * as z from "zod";
import { enumBidStatus } from "@/server/db/schema/tables/enums";
import { createInsertSchema } from "drizzle-zod";
import { addresses, companies } from "@/server/db/schema/tables/content";
import validator from "validator";

const postBodyParams = createInsertSchema(addresses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const bodyParamSchema = { POST: postBodyParams };
