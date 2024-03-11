import { pgTable, pgEnum, uuid, varchar, timestamp, text, foreignKey, integer, index, unique, numeric, boolean, jsonb, primaryKey } from "drizzle-orm/pg-core"
  import { sql } from "drizzle-orm"

export const keyStatus = pgEnum("key_status", ['default', 'valid', 'invalid', 'expired'])
export const keyType = pgEnum("key_type", ['aead-ietf', 'aead-det', 'hmacsha512', 'hmacsha256', 'auth', 'shorthash', 'generichash', 'kdf', 'secretbox', 'secretstream', 'stream_xchacha20'])
export const factorType = pgEnum("factor_type", ['totp', 'webauthn'])
export const factorStatus = pgEnum("factor_status", ['unverified', 'verified'])
export const aalLevel = pgEnum("aal_level", ['aal1', 'aal2', 'aal3'])
export const codeChallengeMethod = pgEnum("code_challenge_method", ['s256', 'plain'])
export const enumUsersRole = pgEnum("enum_users_role", ['admin', 'user'])
export const enumJobsPropertyType = pgEnum("enum_jobs_property_type", ['detached', 'apartment', 'semi-detached'])
export const enumJobsStatus = pgEnum("enum_jobs_status", ['active', 'inactive', 'removed'])
export const enumBidStatus = pgEnum("enum_bid_status", ['pending', 'accepted', 'declined', 'retracted'])
export const enumStartDateFlag = pgEnum("enum_start_date_flag", ['urgent', 'flexible', 'none'])
export const operation = pgEnum("operation", ['INSERT', 'UPDATE', 'DELETE', 'TRUNCATE'])
export const pgTleFeatures = pgEnum("pg_tle_features", ['passcheck'])
export const passwordTypes = pgEnum("password_types", ['PASSWORD_TYPE_PLAINTEXT', 'PASSWORD_TYPE_MD5', 'PASSWORD_TYPE_SCRAM_SHA_256'])


export const users = pgTable("users", {
	id: uuid("id").primaryKey().notNull(),
	firstName: varchar("first_name", { length: 60 }).notNull(),
	email: varchar("email", { length: 320 }).notNull(),
	emailVerified: timestamp("email_verified", { withTimezone: true, mode: 'date' }),
	image: text("image"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }).default(sql`clock_timestamp()`).notNull(),
	lastName: varchar("last_name", { length: 60 }).notNull(),
});

export const sessions = pgTable("sessions", {
	id: uuid("id").primaryKey().notNull(),
	userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" } ),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'date' }).notNull(),
});

export const verificationTokens = pgTable("verification_tokens", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull().references(() => users.id),
	token: varchar("token", { length: 8 }).notNull(),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'date' }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).default(sql`clock_timestamp()`).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }).default(sql`clock_timestamp()`).notNull(),
});



export const industries = pgTable("industries", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	label: varchar("label", { length: 100 }).notNull(),
	value: varchar("value", { length: 100 }).notNull(),
},
(table) => {
	return {
		value: index("value").on(table.value),
		industriesLabelUnique: unique("industries_label_unique").on(table.label),
		industriesValueUnique: unique("industries_value_unique").on(table.value),
	}
});

export const addresses = pgTable("addresses", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	longitude: numeric("longitude").notNull(),
	latitude: numeric("latitude").notNull(),
	addressLine1: varchar("address_line_1", { length: 70 }),
	addressLine2: varchar("address_line_2", { length: 70 }),
	city: varchar("city", { length: 50 }),
	region: varchar("region", { length: 50 }),
	postalCode: varchar("postal_code", { length: 10 }).notNull(),
	country: varchar("country", { length: 60 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).default(sql`clock_timestamp()`),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }).default(sql`clock_timestamp()`),
});

export const contracts = pgTable("contracts", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	title: varchar("title", { length: 100 }).notNull(),
	description: varchar("description", { length: 3000 }).notNull(),
	price: numeric("price", { precision: 10, scale:  2 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).default(sql`clock_timestamp()`),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }).default(sql`clock_timestamp()`),
	endDate: timestamp("end_date", { withTimezone: true, mode: 'date' }),
	companyId: uuid("company_id").notNull().references(() => companies.id).references(() => companies.id, { onDelete: "cascade", onUpdate: "cascade" } ),
	tags: jsonb("tags").default([]).notNull(),
});

export const media = pgTable("media", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	url: varchar("url", { length: 2083 }).notNull(),
});

export const projects = pgTable("projects", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	title: varchar("title", { length: 255 }).notNull(),
	description: varchar("description", { length: 3000 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).default(sql`clock_timestamp()`),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }).default(sql`clock_timestamp()`),
	companyId: uuid("company_id").notNull().references(() => companies.id).references(() => companies.id, { onDelete: "cascade", onUpdate: "cascade" } ),
	isActive: boolean("is_active").default(true),
});

export const jobs = pgTable("jobs", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	industry: varchar("industry", { length: 100 }).references(() => industries.value, { onDelete: "set null", onUpdate: "cascade" } ),
	isActive: boolean("is_active").default(true).notNull(),
	isCommercialProperty: boolean("is_commercial_property").default(false).notNull(),
	description: varchar("description", { length: 3000 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).default(sql`clock_timestamp()`).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }).default(sql`clock_timestamp()`).notNull(),
	startDate: timestamp("start_date", { withTimezone: true, mode: 'date' }),
	startDateFlag: enumStartDateFlag("start_date_flag").default('none').notNull(),
	propertyType: enumJobsPropertyType("property_type").notNull(),
	addressId: uuid("address_id").notNull().references(() => addresses.id, { onDelete: "restrict", onUpdate: "cascade" } ),
	title: varchar("title", { length: 100 }).notNull(),
	tags: jsonb("tags").default([]).notNull(),
});

export const reviews = pgTable("reviews", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	authorId: uuid("author_id").notNull().references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" } ),
	rating: numeric("rating", { precision: 2, scale:  1 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).default(sql`clock_timestamp()`),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }).default(sql`clock_timestamp()`),
	description: varchar("description", { length: 1500 }).notNull(),
	title: varchar("title", { length: 255 }).notNull(),
	companyId: uuid("company_id").notNull().references(() => companies.id).references(() => companies.id, { onDelete: "cascade", onUpdate: "cascade" } ),
	isActive: boolean("is_active").default(true).notNull(),
});

export const bids = pgTable("bids", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	price: numeric("price", { precision: 10, scale:  2 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).default(sql`clock_timestamp()`),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }).default(sql`clock_timestamp()`),
	companyId: uuid("company_id").notNull().references(() => companies.id).references(() => companies.id, { onDelete: "cascade", onUpdate: "cascade" } ),
	isActive: boolean("is_active").default(true).notNull(),
	status: enumBidStatus("status").default('pending').notNull(),
	note: varchar("note", { length: 300 }),
},
(table) => {
	return {
		companyId: index("company_id").on(table.companyId),
	}
});

export const jobsRelationships = pgTable("jobs_relationships", {
	jobId: uuid("job_id").primaryKey().notNull().references(() => jobs.id, { onDelete: "cascade", onUpdate: "cascade" } ),
	userId: uuid("user_id").references(() => users.id, { onDelete: "set null", onUpdate: "cascade" } ),
	companyId: uuid("company_id").references(() => companies.id).references(() => companies.id, { onDelete: "set null", onUpdate: "cascade" } ),
	contractId: uuid("contract_id").references(() => contracts.id, { onDelete: "set null", onUpdate: "cascade" } ),
});

export const mediaRelationships = pgTable("media_relationships", {
	mediaId: uuid("media_id").primaryKey().notNull().references(() => media.id, { onDelete: "cascade", onUpdate: "cascade" } ),
	jobId: uuid("job_id").references(() => jobs.id, { onDelete: "set null", onUpdate: "cascade" } ),
	projectId: uuid("project_id").references(() => projects.id, { onDelete: "set null", onUpdate: "cascade" } ),
	reviewId: uuid("review_id").references(() => reviews.id, { onDelete: "set null", onUpdate: "cascade" } ),
});

export const companies = pgTable("companies", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	name: varchar("name", { length: 50 }).notNull(),
	ownerId: uuid("owner_id").notNull().references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" } ),
	addressId: uuid("address_id").references(() => addresses.id, { onDelete: "set null", onUpdate: "cascade" } ),
	serviceArea: numeric("service_area", { precision: 7, scale:  3 }),
	emailAddress: varchar("email_address", { length: 320 }).notNull(),
	phoneNumber: varchar("phone_number", { length: 20 }).notNull(),
	websiteUrl: varchar("website_url", { length: 2048 }),
	isVerified: boolean("is_verified").default(false).notNull(),
	features: jsonb("features").default({"products":[],"services":[],"specialties":[]}),
	dateEstablished: timestamp("date_established", { withTimezone: true, mode: 'date' }).notNull(),
	imageId: uuid("image_id").references(() => media.id, { onDelete: "set null", onUpdate: "cascade" } ),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).default(sql`clock_timestamp()`),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }).default(sql`clock_timestamp()`),
	isActive: boolean("is_active").default(true).notNull(),
});

export const bidsRelationships = pgTable("bids_relationships", {
	bidId: uuid("bid_id").primaryKey().notNull().references(() => bids.id, { onDelete: "cascade", onUpdate: "cascade" } ),
	jobId: uuid("job_id").references(() => jobs.id, { onDelete: "cascade", onUpdate: "cascade" } ),
	contractId: uuid("contract_id").references(() => contracts.id, { onDelete: "cascade", onUpdate: "cascade" } ),
	isWinner: boolean("is_winner").default(false).notNull(),
});

export const industriesToCompanies = pgTable("industries_to_companies", {
	industryId: uuid("industry_id").notNull().references(() => industries.id, { onDelete: "restrict", onUpdate: "cascade" } ),
	companyId: uuid("company_id").notNull().references(() => companies.id).references(() => companies.id, { onDelete: "cascade", onUpdate: "cascade" } ),
},
(table) => {
	return {
		industriesToCompaniesIndustryIdCompanyIdPk: primaryKey({ columns: [table.industryId, table.companyId], name: "industries_to_companies_industry_id_company_id_pk"})
	}
});

export const accounts = pgTable("accounts", {
	userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" } ),
	provider: varchar("provider", { length: 255 }).notNull(),
	providerId: varchar("provider_id", { length: 255 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).default(sql`clock_timestamp()`).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }).default(sql`clock_timestamp()`).notNull(),
},
(table) => {
	return {
		accountsProviderProviderIdPk: primaryKey({ columns: [table.provider, table.providerId], name: "accounts_provider_provider_id_pk"})
	}
});