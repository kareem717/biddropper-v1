import {
	pgTable,
	text,
	timestamp,
	primaryKey,
	integer,
} from "drizzle-orm/pg-core";
import { customId } from "@/lib/utils";

export const account = pgTable(
	"account",
	{
		userId: text("userId")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		type: text("type").notNull(),
		provider: text("provider").notNull(),
		providerAccountId: text("providerAccountId").notNull(),
		refreshToken: text("refresh_token"),
		accessToken: text("access_token"),
		expiresAt: integer("expires_at"),
		tokenType: text("token_type"),
		scope: text("scope"),
		idToken: text("id_token"),
		sessionState: text("session_state"),
	},
	(table) => {
		return {
			accountProviderProviderAccountIdPk: primaryKey({
				columns: [table.provider, table.providerAccountId],
				name: "account_provider_providerAccountId_pk",
			}),
		};
	}
);

export const session = pgTable("session", {
	sessionToken: text("sessionToken").primaryKey().notNull(),
	userId: text("userId")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const user = pgTable("user", {
	id: text("id")
		.$defaultFn(() => customId("user"))
		.primaryKey()
		.unique()
		.notNull(),
	name: text("name"),
	email: text("email").notNull(),
	emailVerified: timestamp("emailVerified", { mode: "date" }),
	image: text("image"),
	createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
});

export const verificationToken = pgTable(
	"verificationToken",
	{
		identifier: text("identifier").notNull(),
		token: text("token").notNull(),
		expires: timestamp("expires", { mode: "date" }).notNull(),
	},
	(table) => {
		return {
			verificationTokenIdentifierTokenPk: primaryKey({
				columns: [table.identifier, table.token],
				name: "verificationToken_identifier_token_pk",
			}),
		};
	}
);
