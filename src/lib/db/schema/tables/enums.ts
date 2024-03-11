import { pgEnum } from "drizzle-orm/pg-core";

export const keyStatus = pgEnum("key_status", [
  "default",
  "valid",
  "invalid",
  "expired",
]);
export const keyType = pgEnum("key_type", [
  "aead-ietf",
  "aead-det",
  "hmacsha512",
  "hmacsha256",
  "auth",
  "shorthash",
  "generichash",
  "kdf",
  "secretbox",
  "secretstream",
  "stream_xchacha20",
]);
export const factorType = pgEnum("factor_type", ["totp", "webauthn"]);
export const factorStatus = pgEnum("factor_status", ["unverified", "verified"]);
export const aalLevel = pgEnum("aal_level", ["aal1", "aal2", "aal3"]);
export const codeChallengeMethod = pgEnum("code_challenge_method", [
  "s256",
  "plain",
]);
export const enumUsersRole = pgEnum("enum_users_role", ["admin", "user"]);
export const enumJobsPropertyType = pgEnum("enum_jobs_property_type", [
  "detached",
  "apartment",
  "semi-detached",
]);
export const enumJobsStatus = pgEnum("enum_jobs_status", [
  "active",
  "inactive",
  "removed",
]);
export const enumBidStatus = pgEnum("enum_bid_status", [
  "pending",
  "accepted",
  "declined",
  "retracted",
]);
export const enumStartDateFlag = pgEnum("enum_start_date_flag", [
  "urgent",
  "flexible",
  "none",
]);
export const operation = pgEnum("operation", [
  "INSERT",
  "UPDATE",
  "DELETE",
  "TRUNCATE",
]);
export const pgTleFeatures = pgEnum("pg_tle_features", ["passcheck"]);
export const passwordTypes = pgEnum("password_types", [
  "PASSWORD_TYPE_PLAINTEXT",
  "PASSWORD_TYPE_MD5",
  "PASSWORD_TYPE_SCRAM_SHA_256",
]);
