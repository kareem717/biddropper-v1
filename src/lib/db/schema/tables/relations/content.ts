import { boolean, pgTable, primaryKey, uuid } from "drizzle-orm/pg-core";
import {
  bids,
  companies,
  contracts,
  industries,
  jobs,
  media,
  projects,
  reviews,
} from "../content";
import { users } from "../auth";
import { InferSelectModel, InferInsertModel } from "drizzle-orm";

export const jobsRelationships = pgTable("jobs_relationships", {
  jobId: uuid("job_id")
    .primaryKey()
    .notNull()
    .references(() => jobs.id, { onDelete: "cascade", onUpdate: "cascade" }),
  userId: uuid("user_id").references(() => users.id, {
    onDelete: "set null",
    onUpdate: "cascade",
  }),
  companyId: uuid("company_id")
    .references(() => companies.id)
    .references(() => companies.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
  contractId: uuid("contract_id").references(() => contracts.id, {
    onDelete: "set null",
    onUpdate: "cascade",
  }),
});

export const mediaRelationships = pgTable("media_relationships", {
  mediaId: uuid("media_id")
    .primaryKey()
    .notNull()
    .references(() => media.id, { onDelete: "cascade", onUpdate: "cascade" }),
  jobId: uuid("job_id").references(() => jobs.id, {
    onDelete: "set null",
    onUpdate: "cascade",
  }),
  projectId: uuid("project_id").references(() => projects.id, {
    onDelete: "set null",
    onUpdate: "cascade",
  }),
  reviewId: uuid("review_id").references(() => reviews.id, {
    onDelete: "set null",
    onUpdate: "cascade",
  }),
});

export const bidsRelationships = pgTable("bids_relationships", {
  bidId: uuid("bid_id")
    .primaryKey()
    .notNull()
    .references(() => bids.id, { onDelete: "cascade", onUpdate: "cascade" }),
  jobId: uuid("job_id").references(() => jobs.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  contractId: uuid("contract_id").references(() => contracts.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  isWinner: boolean("is_winner").default(false).notNull(),
});

export const industriesToCompanies = pgTable(
  "industries_to_companies",
  {
    industryId: uuid("industry_id")
      .notNull()
      .references(() => industries.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id)
      .references(() => companies.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
  },
  (table) => {
    return {
      industriesToCompaniesIndustryIdCompanyIdPk: primaryKey({
        columns: [table.industryId, table.companyId],
        name: "industries_to_companies_industry_id_company_id_pk",
      }),
    };
  },
);

export type JobsRelationship = InferSelectModel<typeof jobsRelationships>;
export type NewJobsRelationship = InferInsertModel<typeof jobsRelationships>;

export type MediaRelationship = InferSelectModel<typeof mediaRelationships>;
export type NewMediaRelationship = InferInsertModel<typeof mediaRelationships>;

export type BidsRelationship = InferSelectModel<typeof bidsRelationships>;
export type NewBidsRelationship = InferInsertModel<typeof bidsRelationships>;

export type IndustriesToCompany = InferSelectModel<
  typeof industriesToCompanies
>;
export type NewIndustriesToCompany = InferInsertModel<
  typeof industriesToCompanies
>;
