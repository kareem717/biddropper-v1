import { mysqlTable, mysqlSchema, AnyMySqlColumn, index, serial, varchar, decimal, json, timestamp, bigint, text } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"


export const contracts = mysqlTable("contracts", {
	id: serial("id").primaryKey().notNull(),
	userId: varchar("user_id", { length: 191 }).default('').notNull(),
	title: varchar("title", { length: 191 }).default('').notNull(),
	price: decimal("price", { precision: 9, scale: 2 }).notNull(),
	description: varchar("description", { length: 750 }).default(sql`''`),
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
	id: varchar("id", { length: 191 }).primaryKey().notNull(),
	emailAddress: varchar("email_address", { length: 320 }),
	verification: varchar("verification", { length: 25 }),
},
(table) => {
	return {
		emailAddress: index("email_address").on(table.emailAddress),
	}
});

export const externalAccounts = mysqlTable("external_accounts", {
	json: json("json"),
	id: varchar("id", { length: 191 }).primaryKey().notNull(),
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