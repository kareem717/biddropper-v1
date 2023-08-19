import {
	mysqlTable,
	index,
	primaryKey,
	varchar,
	decimal,
	mysqlEnum,
	timestamp,
	serial,
	tinyint,
	int,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

export const bids = mysqlTable(
	"bids",
	{
		id: varchar("id", { length: 50 }).notNull(),
		jobId: varchar("job_id", { length: 50 }).notNull(),
		price: decimal("price", { precision: 10, scale: 2 }).notNull(),
		status: mysqlEnum("status", ["pending", "accepted", "declined"])
			.default("pending")
			.notNull(),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: timestamp("updated_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		companyId: varchar("company_id", { length: 50 }).notNull(),
	},
	(table) => {
		return {
			companyId: index("company_id").on(table.companyId),
			jobId: index("job_id").on(table.jobId),
			bidsId: primaryKey(table.id),
		};
	}
);

export const bundleMedia = mysqlTable(
	"bundle_media",
	{
		id: varchar("id", { length: 50 }).notNull(),
		bundleId: varchar("bundle_id", { length: 50 }).notNull(),
		mediaUrl: varchar("media_url", { length: 500 }).notNull(),
		fileKey: varchar("file_key", { length: 191 }).notNull(),
	},
	(table) => {
		return {
			bundleMediaId: primaryKey(table.id),
		};
	}
);

export const bundles = mysqlTable(
	"bundles",
	{
		id: serial("id").notNull(),
		isActive: tinyint("is_active").default(1).notNull(),
		userId: varchar("user_id", { length: 50 }).default("").notNull(),
		title: varchar("title", { length: 100 }).default("").notNull(),
		description: varchar("description", { length: 750 }).default(""),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: timestamp("updated_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.onUpdateNow()
			.notNull(),
		bundleType: mysqlEnum("bundle_type", ["sub-contract", "contractor-wanted"])
			.default("contractor-wanted")
			.notNull(),
		posterType: mysqlEnum("poster_type", ["business-owner", "property-owner"])
			.default("property-owner")
			.notNull(),
		addressId: varchar("address_id", { length: 50 }).notNull(),
		showExactLocation: tinyint("show_exact_location").default(0).notNull(),
	},
	(table) => {
		return {
			userId: index("user_id").on(table.userId),
			bundlesId: primaryKey(table.id),
		};
	}
);

export const jobs = mysqlTable(
	"jobs",
	{
		id: varchar("id", { length: 50 }).notNull(),
		userId: varchar("user_id", { length: 50 }).notNull(),
		isActive: tinyint("is_active").default(1).notNull(),
		bundleId: varchar("bundle_id", { length: 50 }).notNull(),
		industry: varchar("industry", { length: 255 }).notNull(),
		title: varchar("title", { length: 50 }).notNull(),
		summary: varchar("summary", { length: 400 }).notNull(),
		budget: decimal("budget", { precision: 9, scale: 2 }).notNull(),
		currencyType: mysqlEnum("currency_type", ["usd", "cad", "eur"]),
		createdAt: timestamp("created_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: timestamp("updated_at", { mode: "string" })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		dateFrom: timestamp("date_from", { mode: "string" }).notNull(),
		dateTo: timestamp("date_to", { mode: "string" }),
		propertyType: mysqlEnum("property_type", ["residential", "commercial"])
			.default("residential")
			.notNull(),
	},
	(table) => {
		return {
			jobsId: primaryKey(table.id),
		};
	}
);
