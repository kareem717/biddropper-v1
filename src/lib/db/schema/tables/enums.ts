import { pgEnum } from "drizzle-orm/pg-core";

export const enumBidStatus = pgEnum("bid_status", [
  "retracted",
  "declined",
  "accepted",
  "pending",
]);
export const enumPropertyType = pgEnum("enum_jobs_property_type", [
  "semi-detached",
  "apartment",
  "detached",
]);
export const enumStartDateFlag = pgEnum("start_date_flag", [
  "urgent",
  "flexible",
  "none",
]);
