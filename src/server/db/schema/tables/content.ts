import {
  pgTable,
  timestamp,
  index,
  varchar,
  numeric,
  boolean,
  foreignKey,
  uuid,
} from "drizzle-orm/pg-core";
import { enumBidStatus, enumPropertyType, enumStartDateFlag } from "./enums";
import { user } from "./auth";
import { v4 as uuidv4 } from "uuid";

export const addresses = pgTable("addresses", {
  id: uuid("id").$defaultFn(uuidv4).primaryKey().unique().notNull(),
  latitude: numeric("latitude").notNull(),
  longitude: numeric("longitude").notNull(),
  addressLine1: varchar("address_line_1", { length: 70 }),
  addressLine2: varchar("address_line_2", { length: 70 }),
  city: varchar("city", { length: 50 }),
  region: varchar("region", { length: 50 }),
  postalCode: varchar("postal_code", { length: 10 }).notNull(),
  country: varchar("country", { length: 60 }).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
});

export const bids = pgTable(
  "bids",
  {
    id: uuid("id").$defaultFn(uuidv4).primaryKey().unique().notNull(),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    note: varchar("note", { length: 300 }),
    isActive: boolean("is_active").default(true).notNull(),
    status: enumBidStatus("status").default("pending").notNull(),
  },
  (table) => {
    return {
      companyId: index("company_id").on(table.companyId),
    };
  },
);

export const companies = pgTable("companies", {
  id: uuid("id").$defaultFn(uuidv4).primaryKey().unique().notNull(),
  name: varchar("name", { length: 50 }).notNull(),
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => user.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  addressId: uuid("address_id").references(() => addresses.id, {
    onDelete: "set null",
    onUpdate: "cascade",
  }),
  serviceArea: numeric("service_area", { precision: 7, scale: 3 }),
  emailAddress: varchar("email_address", { length: 320 }).notNull(),
  phoneNumber: varchar("phone_number", { length: 20 }).notNull(),
  websiteUrl: varchar("website_url", { length: 2048 }),
  products: varchar("products", { length: 300 }),
  isVerified: boolean("is_verified").default(false).notNull(),
  specialties: varchar("specialties", { length: 400 }),
  services: varchar("services", { length: 400 }),
  dateEstablished: timestamp("date_established", { mode: "date" }).notNull(),
  imageId: uuid("image_id").references(() => media.id, {
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
    id: uuid("id").$defaultFn(uuidv4).primaryKey().unique().notNull(),
    label: varchar("label", { length: 100 }).notNull().unique(),
    value: varchar("value", { length: 100 }).notNull().unique(),
  },
  (table) => {
    return {
      value: index("value").on(table.value),
    };
  },
);

export const jobs = pgTable("jobs", {
  id: uuid("id").$defaultFn(uuidv4).primaryKey().unique().notNull(),
  title: varchar("title", { length: 100 }).notNull(),
  industry: varchar("industry", { length: 100 }).references(
    () => industries.value,
    {
      onDelete: "set null",
      onUpdate: "cascade",
    },
  ),
  isActive: boolean("is_active").default(true).notNull(),
  isCommercialProperty: boolean("is_commercial_property")
    .default(false)
    .notNull(),
  description: varchar("description", { length: 3000 }).notNull(),
  addressId: uuid("address_id")
    .references(() => addresses.id, {
      onDelete: "restrict",
      onUpdate: "cascade",
    })
    .notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  startDate: timestamp("start_date", { mode: "date" }),
  startDateFlag: enumStartDateFlag("start_date_flag").default("none").notNull(),
  propertyType: enumPropertyType("property_type").notNull(),
});

export const media = pgTable("media", {
  id: uuid("id").$defaultFn(uuidv4).primaryKey().unique().notNull(),
  url: varchar("url", { length: 2083 }).notNull(),
});

export const projects = pgTable("projects", {
  id: uuid("id").$defaultFn(uuidv4).primaryKey().unique().notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: varchar("description", { length: 3000 }).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  isActive: boolean("is_active").default(true),
});

export const reviews = pgTable("reviews", {
  id: uuid("id").$defaultFn(uuidv4).primaryKey().unique().notNull(),
  authorId: uuid("author_id")
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
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  isActive: boolean("is_active").notNull().default(true),
});

export const contracts = pgTable("contracts", {
  id: uuid("id").$defaultFn(uuidv4).primaryKey().unique().notNull(),
  isActive: boolean("is_active").notNull().default(true),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  title: varchar("title", { length: 100 }).notNull(),
  description: varchar("description", { length: 3000 }).notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
  endDate: timestamp("end_date", { mode: "date" }),
});
