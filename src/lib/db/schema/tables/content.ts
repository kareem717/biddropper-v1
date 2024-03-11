import {
  pgTable,
  timestamp,
  index,
  varchar,
  numeric,
  boolean,
  uuid,
  jsonb,
  unique,
} from "drizzle-orm/pg-core";
import {
  enumBidStatus,
  enumJobsPropertyType,
  enumStartDateFlag,
} from "./enums";
import { users } from "./auth";
import { sql } from "drizzle-orm";
import { InferSelectModel, InferInsertModel } from "drizzle-orm";

export const industries = pgTable(
  "industries",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    label: varchar("label", { length: 100 }).notNull(),
    value: varchar("value", { length: 100 }).notNull(),
  },
  (table) => {
    return {
      value: index("value").on(table.value),
      industriesLabelUnique: unique("industries_label_unique").on(table.label),
      industriesValueUnique: unique("industries_value_unique").on(table.value),
    };
  },
);

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
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "date",
  }).default(sql`clock_timestamp()`),
  updatedAt: timestamp("updated_at", {
    withTimezone: true,
    mode: "date",
  }).default(sql`clock_timestamp()`),
});

export const contracts = pgTable("contracts", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  title: varchar("title", { length: 100 }).notNull(),
  description: varchar("description", { length: 3000 }).notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "date",
  }).default(sql`clock_timestamp()`),
  updatedAt: timestamp("updated_at", {
    withTimezone: true,
    mode: "date",
  }).default(sql`clock_timestamp()`),
  endDate: timestamp("end_date", { withTimezone: true, mode: "date" }),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id)
    .references(() => companies.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
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
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "date",
  }).default(sql`clock_timestamp()`),
  updatedAt: timestamp("updated_at", {
    withTimezone: true,
    mode: "date",
  }).default(sql`clock_timestamp()`),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id)
    .references(() => companies.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  isActive: boolean("is_active").default(true),
});

export const jobs = pgTable("jobs", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  industry: varchar("industry", { length: 100 }).references(
    () => industries.value,
    { onDelete: "set null", onUpdate: "cascade" },
  ),
  isActive: boolean("is_active").default(true).notNull(),
  isCommercialProperty: boolean("is_commercial_property")
    .default(false)
    .notNull(),
  description: varchar("description", { length: 3000 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .default(sql`clock_timestamp()`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
    .default(sql`clock_timestamp()`)
    .notNull(),
  startDate: timestamp("start_date", { withTimezone: true, mode: "date" }),
  startDateFlag: enumStartDateFlag("start_date_flag").default("none").notNull(),
  propertyType: enumJobsPropertyType("property_type").notNull(),
  addressId: uuid("address_id")
    .notNull()
    .references(() => addresses.id, {
      onDelete: "restrict",
      onUpdate: "cascade",
    }),
  title: varchar("title", { length: 100 }).notNull(),
  tags: jsonb("tags").default([]).notNull(),
});

export const reviews = pgTable("reviews", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  authorId: uuid("author_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
  rating: numeric("rating", { precision: 2, scale: 1 }).notNull(),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "date",
  }).default(sql`clock_timestamp()`),
  updatedAt: timestamp("updated_at", {
    withTimezone: true,
    mode: "date",
  }).default(sql`clock_timestamp()`),
  description: varchar("description", { length: 1500 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id)
    .references(() => companies.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  isActive: boolean("is_active").default(true).notNull(),
});

export const bids = pgTable(
  "bids",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    }).default(sql`clock_timestamp()`),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "date",
    }).default(sql`clock_timestamp()`),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id)
      .references(() => companies.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    isActive: boolean("is_active").default(true).notNull(),
    status: enumBidStatus("status").default("pending").notNull(),
    note: varchar("note", { length: 300 }),
  },
  (table) => {
    return {
      companyId: index("company_id").on(table.companyId),
    };
  },
);

export const companies = pgTable("companies", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  name: varchar("name", { length: 50 }).notNull(),
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
  addressId: uuid("address_id").references(() => addresses.id, {
    onDelete: "set null",
    onUpdate: "cascade",
  }),
  serviceArea: numeric("service_area", { precision: 7, scale: 3 }),
  emailAddress: varchar("email_address", { length: 320 }).notNull(),
  phoneNumber: varchar("phone_number", { length: 20 }).notNull(),
  websiteUrl: varchar("website_url", { length: 2048 }),
  isVerified: boolean("is_verified").default(false).notNull(),
  features: jsonb("features").default({
    products: [],
    services: [],
    specialties: [],
  }),
  dateEstablished: timestamp("date_established", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
  imageId: uuid("image_id").references(() => media.id, {
    onDelete: "set null",
    onUpdate: "cascade",
  }),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "date",
  }).default(sql`clock_timestamp()`),
  updatedAt: timestamp("updated_at", {
    withTimezone: true,
    mode: "date",
  }).default(sql`clock_timestamp()`),
  isActive: boolean("is_active").default(true).notNull(),
});

export type Address = InferSelectModel<typeof addresses>;
export type NewAddress = InferInsertModel<typeof addresses>;

export type Contract = InferSelectModel<typeof contracts>;
export type NewContract = InferInsertModel<typeof contracts>;

export type Media = InferSelectModel<typeof media>;
export type NewMedia = InferInsertModel<typeof media>;

export type Project = InferSelectModel<typeof projects>;
export type NewProject = InferInsertModel<typeof projects>;

export type Job = InferSelectModel<typeof jobs>;
export type NewJob = InferInsertModel<typeof jobs>;

export type Review = InferSelectModel<typeof reviews>;
export type NewReview = InferInsertModel<typeof reviews>;

export type Bid = InferSelectModel<typeof bids>;
export type NewBid = InferInsertModel<typeof bids>;

export type Company = InferSelectModel<typeof companies>;
export type NewCompany = InferInsertModel<typeof companies>;

export type Industry = InferSelectModel<typeof industries>;
export type NewIndustry = InferInsertModel<typeof industries>;
