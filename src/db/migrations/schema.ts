import {
	mysqlTable,
	mysqlSchema,
	AnyMySqlColumn,
	primaryKey,
	varchar,
	int,
	text,
	timestamp,
	index,
	decimal,
	mysqlEnum,
	tinyint,
	smallint,
	unique,
	date,
	double,
	mysqlView,
	QueryBuilder,
} from "drizzle-orm/mysql-core";
import { eq, sql } from "drizzle-orm";
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

export const addresses = mysqlTable(
	"addresses",
	{
		id: varchar("id", { length: 50 }).notNull(),
		xCoordinate: double("x-coordinate").notNull(),
		yCoordinate: double("y-coordinate").notNull(),
		addressLine1: varchar("address_line_1", { length: 70 }),
		addressLine2: varchar("address_line_2", { length: 70 }),
		city: varchar("city", { length: 50 }),
		region: varchar("region", { length: 50 }),
		postalCode: varchar("postal_code", { length: 10 }).notNull(),
		country: varchar("country", { length: 60 }).notNull(),
		createdAt: timestamp("created_at", { mode: "string" }).default(
			sql`CURRENT_TIMESTAMP`
		),
		updatedAt: timestamp("updated_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.onUpdateNow(),
	},
	(table) => {
		return {
			addressesId: primaryKey(table.id),
		};
	}
);

export const bids = mysqlTable(
	"bids",
	{
		id: varchar("id", { length: 50 }).notNull(),
		price: decimal("price", { precision: 10, scale: 2 }).notNull(),
		status: mysqlEnum("status", [
			"pending",
			"accepted",
			"declined",
			"retracted",
		])
			.default("pending")
			.notNull(),
		createdAt: timestamp("created_at", { mode: "date" }).default(
			sql`CURRENT_TIMESTAMP`
		),
		updatedAt: timestamp("updated_at", { mode: "date" })
			.default(sql`CURRENT_TIMESTAMP`)
			.onUpdateNow(),
		companyId: varchar("company_id", { length: 50 }).notNull(),
		isActive: tinyint("is_active").default(1),
	},
	(table) => {
		return {
			companyId: index("company_id").on(table.companyId),
			bidsId: primaryKey(table.id),
		};
	}
);

export const companies = mysqlTable(
	"companies",
	{
		id: varchar("id", { length: 50 }).notNull(),
		name: varchar("name", { length: 50 }).notNull(),
		ownerId: varchar("owner_id", { length: 50 }).notNull(),
		addressId: varchar("address_id", { length: 50 }),
		serviceArea: decimal("service_area", { precision: 7, scale: 3 }),
		emailAddress: varchar("email_address", { length: 320 }).notNull(),
		phoneNumber: varchar("phone_number", { length: 20 }).notNull(),
		websiteUrl: varchar("website_url", { length: 2048 }),
		products: varchar("products", { length: 300 }),
		isVerified: tinyint("is_verified").default(0),
		specialties: varchar("specialties", { length: 400 }),
		services: varchar("services", { length: 400 }),
		dateEstablished: timestamp("date_established", { mode: "date" }).notNull(),
		imageId: varchar("image_id", { length: 50 }),
		createdAt: timestamp("created_at", { mode: "date" }).default(
			sql`CURRENT_TIMESTAMP`
		),
		updatedAt: timestamp("updated_at", { mode: "date" })
			.default(sql`CURRENT_TIMESTAMP`)
			.onUpdateNow(),
		isActive: tinyint("is_active").default(1),
	},
	(table) => {
		return {
			companiesId: primaryKey(table.id),
		};
	}
);

export const companyIndustries = mysqlTable(
	"company_industries",
	{
		companyId: varchar("company_id", { length: 50 }).notNull(),
		industryId: varchar("industry_id", { length: 50 }).notNull(),
	},
	(table) => {
		return {
			companyIndustriesCompanyIdIndustryId: primaryKey(
				table.companyId,
				table.industryId
			),
		};
	}
);

export const companyJobs = mysqlTable(
	"company_jobs",
	{
		companyId: varchar("company_id", { length: 50 }).notNull(),
		jobId: varchar("job_id", { length: 50 }).notNull(),
	},
	(table) => {
		return {
			companyJobsCompanyIdJobId: primaryKey(table.companyId, table.jobId),
		};
	}
);

export const contractBids = mysqlTable(
	"contract_bids",
	{
		bidId: varchar("bid_id", { length: 50 }).notNull(),
		contractId: varchar("contract_id", { length: 50 }).notNull(),
	},
	(table) => {
		return {
			contractBidsBidIdContractId: primaryKey(table.bidId, table.contractId),
		};
	}
);

export const contractJobs = mysqlTable(
	"contract_jobs",
	{
		contractId: varchar("contract_id", { length: 50 }).notNull(),
		jobId: varchar("job_id", { length: 50 }).notNull(),
	},
	(table) => {
		return {
			contractJobsContractIdJobId: primaryKey(table.contractId, table.jobId),
		};
	}
);

export const contracts = mysqlTable(
	"contracts",
	{
		id: varchar("id", { length: 50 }).notNull(),
		isActive: tinyint("is_active").default(1),
		title: varchar("title", { length: 100 }).notNull(),
		description: varchar("description", { length: 3000 }).notNull(),
		price: decimal("price", { precision: 13, scale: 4 }).notNull(),
		createdAt: timestamp("created_at", { mode: "date" }).default(
			sql`CURRENT_TIMESTAMP`
		),
		updatedAt: timestamp("updated_at", { mode: "date" })
			.default(sql`CURRENT_TIMESTAMP`)
			.onUpdateNow(),
		endDate: timestamp("end_date", { mode: "date" }),
	},
	(table) => {
		return {
			id: unique("id").on(table.id),
			contractsId: primaryKey(table.id),
		};
	}
);

export const industries = mysqlTable(
	"industries",
	{
		id: varchar("id", { length: 50 }).notNull(),
		label: varchar("label", { length: 100 }).notNull(),
		value: varchar("value", { length: 100 }).notNull(),
	},
	(table) => {
		return {
			value: index("value").on(table.value),
			label: unique("label").on(table.label),
			value2: unique("value_2").on(table.value),
			industriesId: primaryKey(table.id),
		};
	}
);

export const jobBids = mysqlTable(
	"job_bids",
	{
		bidId: varchar("bid_id", { length: 50 }).notNull(),
		jobId: varchar("job_id", { length: 50 }).notNull(),
	},
	(table) => {
		return {
			jobBidsBidIdJobId: primaryKey(table.bidId, table.jobId),
		};
	}
);

export const jobMedia = mysqlTable(
	"job_media",
	{
		mediaId: varchar("media_id", { length: 50 }).notNull(),
		jobId: varchar("job_id", { length: 50 }).notNull(),
	},
	(table) => {
		return {
			jobMediaJobIdMediaId: primaryKey(table.jobId, table.mediaId),
		};
	}
);

export const jobs = mysqlTable(
	"jobs",
	{
		id: varchar("id", { length: 50 }).notNull(),
		industry: varchar("industry", { length: 255 }).notNull(),
		isActive: tinyint("is_active").default(1),
		isCommercialProperty: tinyint("is_commercial_property")
			.default(0)
			.notNull(),
		details: varchar("details", { length: 3000 }).notNull(),
		createdAt: timestamp("created_at", { mode: "date" }).default(
			sql`CURRENT_TIMESTAMP`
		),
		updatedAt: timestamp("updated_at", { mode: "date" })
			.default(sql`CURRENT_TIMESTAMP`)
			.onUpdateNow(),
		timeHorizon: mysqlEnum("time_horizon", [
			"asap",
			"one-week",
			"two-weeks",
			"one-month",
			"flexible",
		]).notNull(),
		propertyType: mysqlEnum("property_type", [
			"detached",
			"apartment",
			"semi-detached",
			"town-house",
		]).notNull(),
	},
	(table) => {
		return {
			jobsId: primaryKey(table.id),
		};
	}
);

export const media = mysqlTable(
	"media",
	{
		id: varchar("id", { length: 50 }).notNull(),
		fileUrl: varchar("file_url", { length: 2083 }).notNull(),
		fileKey: varchar("file_key", { length: 191 }).notNull(),
	},
	(table) => {
		return {
			mediaId: primaryKey(table.id),
		};
	}
);

export const projectMedia = mysqlTable(
	"project_media",
	{
		projectId: varchar("project_id", { length: 50 }).notNull(),
		mediaId: varchar("media_id", { length: 50 }).notNull(),
	},
	(table) => {
		return {
			projectMediaMediaIdProjectId: primaryKey(table.mediaId, table.projectId),
		};
	}
);

export const projects = mysqlTable(
	"projects",
	{
		id: varchar("id", { length: 50 }).notNull(),
		title: varchar("title", { length: 255 }).notNull(),
		details: varchar("details", { length: 3000 }).notNull(),
		createdAt: timestamp("created_at", { mode: "date" }).default(
			sql`CURRENT_TIMESTAMP`
		),
		updatedAt: timestamp("updated_at", { mode: "date" })
			.default(sql`CURRENT_TIMESTAMP`)
			.onUpdateNow(),
		companyId: varchar("company_id", { length: 50 }).notNull(),
		isActive: tinyint("is_active").default(1),
	},
	(table) => {
		return {
			projectsId: primaryKey(table.id),
		};
	}
);

export const reviewMedia = mysqlTable(
	"review_media",
	{
		reviewId: varchar("review_id", { length: 50 }).notNull(),
		mediaId: varchar("media_id", { length: 50 }).notNull(),
	},
	(table) => {
		return {
			reviewMediaMediaIdReviewId: primaryKey(table.mediaId, table.reviewId),
		};
	}
);

export const reviews = mysqlTable(
	"reviews",
	{
		id: varchar("id", { length: 50 }).notNull(),
		authorId: varchar("author_id", { length: 50 }).notNull(),
		rating: decimal("rating", { precision: 2, scale: 1 }).notNull(),
		createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
		updatedAt: timestamp("updated_at", { mode: "date" })
			.default(sql`CURRENT_TIMESTAMP`)
			.onUpdateNow(),
		details: varchar("details", { length: 1500 }).notNull(),
		title: varchar("title", { length: 255 }).notNull(),
		companyId: varchar("company_id", { length: 50 }).notNull(),
	},
	(table) => {
		return {
			reviewsId: primaryKey(table.id),
		};
	}
);

export const sessions = mysqlTable(
	"sessions",
	{
		sessionToken: varchar("sessionToken", { length: 255 }).notNull(),
		userId: varchar("userId", { length: 255 }).notNull(),
		expires: timestamp("expires", { mode: "date" }).notNull(),
		createdAt: timestamp("created_at", { mode: "date" }).default(
			sql`CURRENT_TIMESTAMP`
		),
		updatedAt: timestamp("updated_at", { mode: "date" })
			.default(sql`CURRENT_TIMESTAMP`)
			.onUpdateNow(),
	},
	(table) => {
		return {
			sessionsSessionToken: primaryKey(table.sessionToken),
		};
	}
);

export const userJobs = mysqlTable(
	"user_jobs",
	{
		jobId: varchar("job_id", { length: 50 }).notNull(),
		userId: varchar("user_id", { length: 50 }).notNull(),
	},
	(table) => {
		return {
			userJobsJobIdUserId: primaryKey(table.jobId, table.userId),
		};
	}
);

export const users = mysqlTable(
	"users",
	{
		id: varchar("id", { length: 255 }).notNull(),
		name: varchar("name", { length: 255 }),
		email: varchar("email", { length: 255 }).notNull(),
		emailVerified: timestamp("emailVerified", { mode: "date" }),
		image: varchar("image", { length: 255 }),
		createdAt: timestamp("created_at", { mode: "date" }).default(
			sql`CURRENT_TIMESTAMP`
		),
		updatedAt: timestamp("updated_at", { mode: "date" })
			.default(sql`CURRENT_TIMESTAMP`)
			.onUpdateNow(),
	},
	(table) => {
		return {
			usersId: primaryKey(table.id),
		};
	}
);

export const verificationTokens = mysqlTable(
	"verificationTokens",
	{
		identifier: varchar("identifier", { length: 255 }).notNull(),
		token: varchar("token", { length: 255 }).notNull(),
		expires: timestamp("expires", { mode: "date" }).notNull(),
		createdAt: timestamp("created_at", { mode: "date" }).default(
			sql`CURRENT_TIMESTAMP`
		),
		updatedAt: timestamp("updated_at", { mode: "date" })
			.default(sql`CURRENT_TIMESTAMP`)
			.onUpdateNow(),
	},
	(table) => {
		return {
			verificationTokensIdentifierToken: primaryKey(
				table.identifier,
				table.token
			),
		};
	}
);
