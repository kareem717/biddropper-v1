import { mysqlTable, mysqlSchema, AnyMySqlColumn, primaryKey, varchar, int, text, timestamp, index, decimal, mysqlEnum, unique, tinyint } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"
import type { AdapterAccount } from "next-auth/adapters";

export const accounts = mysqlTable(
	"accounts",
	{
		userId: varchar("userId", { length: 255 }).notNull(),
		type: varchar("type", { length: 255 })
			.$type<AdapterAccount["type"]>()
			.notNull(),
		provider: varchar("provider", { length: 255 }).notNull(),
		providerAccountId: varchar("providerAccountId", { length: 255 }).notNull(),
		refresh_token: varchar("refresh_token", { length: 255 }),
		refresh_token_expires_in: int("refresh_token_expires_in"),
		access_token: varchar("access_token", { length: 255 }),
		expires_at: int("expires_at"),
		token_type: varchar("token_type", { length: 255 }),
		scope: varchar("scope", { length: 255 }),
		id_token: text("id_token"),
		session_state: text("session_state"),
		createdAt: timestamp("created_at", { mode: "date" }).default(
			sql`CURRENT_TIMESTAMP`
		),
		updatedAt: timestamp("updated_at", { mode: "date" })
			.default(sql`CURRENT_TIMESTAMP`)
			.onUpdateNow(),
	},
	(table) => {
		return {
			accountsProviderProviderAccountId: primaryKey(
				table.provider,
				table.providerAccountId
			),
		};
	}
);

export const addresses = mysqlTable("addresses", {
	id: varchar("id", { length: 50 }).notNull(),
	addressLine1: varchar("address_line_1", { length: 70 }).notNull(),
	addressLine2: varchar("address_line_2", { length: 70 }),
	city: varchar("city", { length: 50 }).notNull(),
	region: varchar("region", { length: 50 }).notNull(),
	postalCode: varchar("postal_code", { length: 10 }).notNull(),
	country: varchar("country", { length: 60 }).notNull(),
	createdAt: timestamp("created_at", { mode: "date" }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: "date" }).default(sql`CURRENT_TIMESTAMP`).onUpdateNow(),
},
(table) => {
	return {
		addressesId: primaryKey(table.id)
	}
});

export const bids = mysqlTable("bids", {
	id: varchar("id", { length: 50 }).notNull(),
	jobId: varchar("job_id", { length: 50 }).notNull(),
	price: decimal("price", { precision: 10, scale: 2 }).notNull(),
	status: mysqlEnum("status", ['pending','accepted','declined']).default('pending').notNull(),
	createdAt: timestamp("created_at", { mode: "date" }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: "date" }).default(sql`CURRENT_TIMESTAMP`).onUpdateNow(),
	companyId: varchar("company_id", { length: 50 }).notNull(),
},
(table) => {
	return {
		companyId: index("company_id").on(table.companyId),
		jobId: index("job_id").on(table.jobId),
		bidsId: primaryKey(table.id)
	}
});

export const bundles = mysqlTable("bundles", {
	id: varchar("id", { length: 50 }).notNull(),
	isActive: tinyint("is_active").default(1),
	userId: varchar("user_id", { length: 50 }).default('').notNull(),
	title: varchar("title", { length: 100 }).default('').notNull(),
	description: varchar("description", { length: 750 }).default(''),
	createdAt: timestamp("created_at", { mode: "date" }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: "date" }).default(sql`CURRENT_TIMESTAMP`).onUpdateNow(),
	bundleType: mysqlEnum("bundle_type", ['sub-contract','contractor-wanted']).default('contractor-wanted').notNull(),
	posterType: mysqlEnum("poster_type", ['business-owner','property-owner']).default('property-owner').notNull(),
	addressId: varchar("address_id", { length: 50 }).notNull(),
	showExactLocation: tinyint("show_exact_location").default(0).notNull(),
},
(table) => {
	return {
		userId: index("user_id").on(table.userId),
		id: unique("id").on(table.id),
		bundlesId: primaryKey(table.id)
	}
});

export const companies = mysqlTable("companies", {
	id: varchar("id", { length: 50 }).notNull(),
	name: varchar("name", { length: 50 }).notNull(),
	ownerId: varchar("owner_id", { length: 50 }).notNull(),
},
(table) => {
	return {
		companiesId: primaryKey(table.id)
	}
});

export const companyJobs = mysqlTable("company_jobs", {
	companyId: varchar("company_id", { length: 50 }).notNull(),
	jobId: varchar("job_id", { length: 50 }).notNull(),
},
(table) => {
	return {
		companyJobsCompanyIdJobId: primaryKey(table.companyId, table.jobId)
	}
});

export const jobMedia = mysqlTable("job_media", {
	mediaId: varchar("media_id", { length: 50 }).notNull(),
	jobId: varchar("job_id", { length: 50 }).notNull(),
},
(table) => {
	return {
		jobMediaJobIdMediaId: primaryKey(table.jobId, table.mediaId)
	}
});

export const jobs = mysqlTable("jobs", {
	id: varchar("id", { length: 50 }).notNull(),
	industry: varchar("industry", { length: 255 }).notNull(),
	isActive: tinyint("is_active").default(1),
	isCommercialProperty: tinyint("is_commercial_property").default(0).notNull(),
	details: varchar("details", { length: 3000 }).notNull(),
	createdAt: timestamp("created_at", { mode: "date" }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: "date" }).default(sql`CURRENT_TIMESTAMP`).onUpdateNow(),
	timeHorizon: mysqlEnum("time_horizon", ['asap','one-week','two-weeks','one-month','flexible']).notNull(),
	propertyType: mysqlEnum("property_type", ['detached','apartment','semi-detached','town-house']).notNull(),
},
(table) => {
	return {
		jobsId: primaryKey(table.id)
	}
});

export const media = mysqlTable("media", {
	id: varchar("id", { length: 50 }).notNull(),
	fileUrl: varchar("file_url", { length: 2083 }).notNull(),
	fileKey: varchar("file_key", { length: 191 }).notNull(),
},
(table) => {
	return {
		mediaId: primaryKey(table.id)
	}
});

export const sessions = mysqlTable("sessions", {
	sessionToken: varchar("sessionToken", { length: 255 }).notNull(),
	userId: varchar("userId", { length: 255 }).notNull(),
	expires: timestamp("expires", { mode: "date" }).notNull(),
	createdAt: timestamp("created_at", { mode: "date" }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: "date" }).default(sql`CURRENT_TIMESTAMP`).onUpdateNow(),
},
(table) => {
	return {
		sessionsSessionToken: primaryKey(table.sessionToken)
	}
});

export const userJobs = mysqlTable("user_jobs", {
	jobId: varchar("job_id", { length: 50 }).notNull(),
	userId: varchar("user_id", { length: 50 }).notNull(),
},
(table) => {
	return {
		userJobsJobIdUserId: primaryKey(table.jobId, table.userId)
	}
});

export const users = mysqlTable("users", {
	id: varchar("id", { length: 255 }).notNull(),
	name: varchar("name", { length: 255 }),
	email: varchar("email", { length: 255 }).notNull(),
	emailVerified: timestamp("emailVerified", { mode: "date" }),
	image: varchar("image", { length: 255 }),
	createdAt: timestamp("created_at", { mode: "date" }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: "date" }).default(sql`CURRENT_TIMESTAMP`).onUpdateNow(),
},
(table) => {
	return {
		usersId: primaryKey(table.id)
	}
});

export const verificationTokens = mysqlTable("verificationTokens", {
	identifier: varchar("identifier", { length: 255 }).notNull(),
	token: varchar("token", { length: 255 }).notNull(),
	expires: timestamp("expires", { mode: "date" }).notNull(),
	createdAt: timestamp("created_at", { mode: "date" }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: "date" }).default(sql`CURRENT_TIMESTAMP`).onUpdateNow(),
},
(table) => {
	return {
		verificationTokensIdentifierToken: primaryKey(table.identifier, table.token)
	}
});