import {
	pgTable,
	timestamp,
	index,
	varchar,
	numeric,
	boolean,
	foreignKey,
} from "drizzle-orm/pg-core";
import { customId } from "@/lib/utils";
import { enumBidStatus, enumPropertyType, enumStartDateFlag } from "./enums";
import { user } from "./auth";

export const addresses = pgTable("addresses", {
	id: varchar("id", { length: 50 })
		.notNull()
		.$defaultFn(() => customId("addr"))
		.primaryKey()
		.unique(),
	latitude: numeric("latitude").notNull(),
	longitude: numeric("longitude").notNull(),
	addressLine1: varchar("address_line_1", { length: 70 }),
	addressLine2: varchar("address_line_2", { length: 70 }),
	city: varchar("city", { length: 50 }),
	region: varchar("region", { length: 50 }),
	postalCode: varchar("postal_code", { length: 10 }).notNull(),
	country: varchar("country", { length: 60 }).notNull(),
	createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
});

export const bids = pgTable(
	"bids",
	{
		id: varchar("id", { length: 50 })
			.$defaultFn(() => customId("bid"))
			.primaryKey()
			.unique()
			.notNull(),
		price: numeric("price", { precision: 10, scale: 2 }).notNull(),
		createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
		updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
		companyId: varchar("company_id", { length: 50 })
			.notNull()
			.references(() => companies.id, {
				onDelete: "cascade",
				onUpdate: "cascade",
			}),
		isActive: boolean("is_active").default(true).notNull(),
		status: enumBidStatus("status").default("pending").notNull(),
	},
	(table) => {
		return {
			companyId: index("company_id").on(table.companyId),
		};
	}
);

export const companies = pgTable("companies", {
	id: varchar("id", { length: 50 })
		.$defaultFn(() => customId("comp"))
		.primaryKey()
		.unique()
		.notNull(),
	name: varchar("name", { length: 50 }).notNull(),
	ownerId: varchar("owner_id", { length: 50 }).notNull(),
	addressId: varchar("address_id", { length: 50 }).references(
		() => addresses.id,
		{
			onDelete: "set null",
			onUpdate: "cascade",
		}
	),
	serviceArea: numeric("service_area", { precision: 7, scale: 3 }),
	emailAddress: varchar("email_address", { length: 320 }).notNull(),
	phoneNumber: varchar("phone_number", { length: 20 }).notNull(),
	websiteUrl: varchar("website_url", { length: 2048 }),
	products: varchar("products", { length: 300 }),
	isVerified: boolean("is_verified").default(false).notNull(),
	specialties: varchar("specialties", { length: 400 }),
	services: varchar("services", { length: 400 }),
	dateEstablished: timestamp("date_established", { mode: "date" }).notNull(),
	imageId: varchar("image_id", { length: 50 }).references(() => media.id, {
		onDelete: "set null",
		onUpdate: "cascade",
	}),
	createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
	isActive: boolean("is_active").default(true).notNull(),
});

export const industries = pgTable(
	"industries",
	{
		id: varchar("id", { length: 50 })
			.notNull()
			.$defaultFn(() => customId("indst"))
			.primaryKey()
			.unique(),
		label: varchar("label", { length: 100 }).notNull().unique(),
		value: varchar("value", { length: 100 }).notNull().unique(),
	},
	(table) => {
		return {
			value: index("value").on(table.value),
		};
	}
);

export const jobs = pgTable("jobs", {
	id: varchar("id", { length: 50 })
		.notNull()
		.$defaultFn(() => customId("job"))
		.primaryKey()
		.unique(),
	industry: varchar("industry", { length: 255 }).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	isCommercialProperty: boolean("is_commercial_property")
		.default(false)
		.notNull(),
	description: varchar("description", { length: 3000 }).notNull(),
	addressId: varchar("address_id", { length: 50 }).references(
		() => addresses.id
	),
	createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: "date" }).notNull(),
	startDate: timestamp("start_date", { mode: "date" }),
	startDateFlag: enumStartDateFlag("start_date_flag").default("none").notNull(),
	propertyType: enumPropertyType("property_type").notNull(),
	winningBidId: varchar("winning_bid_id", { length: 50 }).references(
		() => bids.id
	),
});

export const media = pgTable("media", {
	id: varchar("id", { length: 50 })
		.notNull()
		.$defaultFn(() => customId("media"))
		.primaryKey()
		.unique(),
	url: varchar("url", { length: 2083 }).notNull(),
});

export const projects = pgTable("projects", {
	id: varchar("id", { length: 50 })
		.notNull()
		.$defaultFn(() => customId("proj"))
		.primaryKey()
		.unique(),
	title: varchar("title", { length: 255 }).notNull(),
	description: varchar("description", { length: 3000 }).notNull(),
	createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
	companyId: varchar("company_id", { length: 50 })
		.notNull()
		.references(() => companies.id, {
			onDelete: "cascade",
			onUpdate: "cascade",
		}),
	isActive: boolean("is_active").default(true),
});

export const reviews = pgTable("reviews", {
	id: varchar("id", { length: 50 })
		.notNull()
		.notNull()
		.primaryKey()
		.unique()
		.$defaultFn(() => customId("rev")),
	authorId: varchar("author_id", { length: 50 })
		.references(() => user.id, {
			onDelete: "cascade",
			onUpdate: "cascade",
		})
		.notNull(),
	rating: numeric("rating", { precision: 2, scale: 1 }).notNull(),
	createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
	description: varchar("description", { length: 1500 }).notNull(),
	title: varchar("title", { length: 255 }).notNull(),
	companyId: varchar("company_id", { length: 50 })
		.notNull()
		.references(() => companies.id, {
			onDelete: "cascade",
			onUpdate: "cascade",
		}),
});

export const contracts = pgTable("contracts", {
	id: varchar("id", { length: 50 })
		.notNull()
		.$defaultFn(() => customId("cntr"))
		.primaryKey()
		.unique(),
	isActive: boolean("is_active").default(true),
	title: varchar("title", { length: 100 }).notNull(),
	description: varchar("description", { length: 3000 }).notNull(),
	price: numeric("price", { precision: 10, scale: 2 }).notNull(),
	createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
	endDate: timestamp("end_date", { mode: "date" }),
	winningBidId: varchar("winning_bid_id", { length: 50 }).references(
		() => bids.id
	),
});
