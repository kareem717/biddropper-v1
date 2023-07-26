import { mysqlTable, mysqlSchema, AnyMySqlColumn, index, serial, tinyint, varchar, decimal, json, timestamp, bigint, mysqlEnum, text } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"


export const contracts = mysqlTable("contracts", {
	id: serial("id").primaryKey().notNull(),
	isDeleted: tinyint("is_deleted").default(0).notNull(),
	userId: varchar("user_id", { length: 191 }).default('').notNull(),
	title: varchar("title", { length: 191 }).default('').notNull(),
	price: decimal("price", { precision: 9, scale: 2 }).notNull(),
	description: varchar("description", { length: 750 }).default(''),
	features: json("features"),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).onUpdateNow().notNull(),
},
(table) => {
	return {
		userId: index("user_id").on(table.userId),
	}
});

export const emails = mysqlTable("emails", {
	json: json("json"),
	userId: varchar("user_id", { length: 191 }).notNull(),
	id: varchar("id", { length: 191 }).primaryKey().notNull(),
	emailAddress: varchar("email_address", { length: 320 }),
	verification: varchar("verification", { length: 25 }),
});

export const externalAccounts = mysqlTable("external_accounts", {
	json: json("json"),
	userId: varchar("user_id", { length: 191 }).notNull(),
	id: varchar("id", { length: 191 }).primaryKey().notNull(),
});

export const organizationInvitations = mysqlTable("organization_invitations", {
	id: varchar("id", { length: 191 }).primaryKey().notNull(),
	json: json("json").notNull(),
	createdAt: bigint("created_at", { mode: "number" }),
	status: mysqlEnum("status", ['revoked','accepted','pending']),
	updatedAt: bigint("updated_at", { mode: "number" }),
	organizationId: varchar("organization_id", { length: 191 }),
	emailAddress: varchar("email_address", { length: 320 }),
	role: varchar("role", { length: 25 }),
});

export const organizationMemberships = mysqlTable("organization_memberships", {
	json: json("json").notNull(),
	id: varchar("id", { length: 191 }).primaryKey().notNull(),
	createdAt: bigint("created_at", { mode: "number" }),
	updatedAt: bigint("updated_at", { mode: "number" }),
	userId: varchar("user_id", { length: 191 }),
	role: varchar("role", { length: 25 }),
	organizationId: varchar("organization_id", { length: 191 }),
},
(table) => {
	return {
		userId: index("user_id").on(table.userId),
		organizationId: index("organization_id").on(table.organizationId),
	}
});

export const organizationMembershipsArchive = mysqlTable("organization_memberships_archive", {
	id: serial("id").primaryKey().notNull(),
	json: json("json").notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const organizations = mysqlTable("organizations", {
	id: varchar("id", { length: 191 }).primaryKey().notNull(),
	json: json("json").notNull(),
	createdAt: bigint("created_at", { mode: "number" }),
	createdBy: varchar("created_by", { length: 191 }),
	imageUrl: text("image_url"),
	name: varchar("name", { length: 255 }),
	publicMetadata: json("public_metadata"),
	updatedAt: bigint("updated_at", { mode: "number" }),
	slug: varchar("slug", { length: 365 }),
},
(table) => {
	return {
		createdBy: index("created_by").on(table.createdBy),
	}
});

export const organizationsArchive = mysqlTable("organizations_archive", {
	id: serial("id").notNull(),
	json: json("json").notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const users = mysqlTable("users", {
	json: json("json").notNull(),
	id: varchar("id", { length: 191 }).primaryKey().notNull(),
	createdAt: bigint("created_at", { mode: "number" }),
	updatedAt: bigint("updated_at", { mode: "number" }),
	firstName: varchar("first_name", { length: 255 }),
	lastName: varchar("last_name", { length: 255 }),
	privateMetadata: json("private_metadata"),
	publicMetadata: json("public_metadata"),
	primaryEmailAddressId: varchar("primary_email_address_id", { length: 191 }),
	imageUrl: text("image_url"),
});

export const usersArchive = mysqlTable("users_archive", {
	id: serial("id").primaryKey().notNull(),
	json: json("json"),
	deletedAt: timestamp("deleted_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});