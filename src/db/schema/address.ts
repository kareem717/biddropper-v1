import {
	mysqlTable,
	primaryKey,
	varchar,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

export const addresses = mysqlTable(
	"addresses",
	{
		id: varchar("id", { length: 50 }).notNull(),
		addressLine1: varchar("address_line_1", { length: 70 }).notNull(),
		addressLine2: varchar("address_line_2", { length: 70 }),
		city: varchar("city", { length: 50 }).notNull(),
		region: varchar("region", { length: 50 }).notNull(),
		postalCode: varchar("postal_code", { length: 10 }).notNull(),
		country: varchar("country", { length: 60 }).notNull(),
	},
	(table) => {
		return {
			addressesId: primaryKey(table.id),
		};
	}
);
