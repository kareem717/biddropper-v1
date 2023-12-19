import {
	foreignKey,
	index,
	pgTable,
	primaryKey,
	varchar,
} from "drizzle-orm/pg-core";
import {
	bids,
	companies,
	industries,
	jobs,
	media,
	projects,
	reviews,
} from "../content";
import { relations } from "drizzle-orm";
import { user } from "../auth";
import { customId } from "@/lib/utils";

// Industry to Jobs
export const industriesToJobs = pgTable(
	"industries_to_jobs",
	{
		industryId: varchar("industry_id", { length: 50 })
			.notNull()
			.references(() => industries.id),
		jobId: varchar("job_id", { length: 50 })
			.notNull()
			.references(() => jobs.id),
	},
	(table) => ({
		pk: primaryKey({
			columns: [table.industryId, table.jobId],
		}),
	})
);

export const industriesToJobsRelations = relations(
	industriesToJobs,
	({ one }) => ({
		industry: one(industries, {
			fields: [industriesToJobs.industryId],
			references: [industries.id],
		}),
		job: one(jobs, {
			fields: [industriesToJobs.jobId],
			references: [jobs.id],
		}),
	})
);

// Industry to Companies
export const industriesToCompanies = pgTable(
	"industries_to_companies",
	{
		industryId: varchar("industry_id", { length: 50 })
			.notNull()
			.references(() => industries.id),
		companyId: varchar("company_id", { length: 50 })
			.notNull()
			.references(() => companies.id),
	},
	(table) => ({
		pk: primaryKey({
			columns: [table.industryId, table.companyId],
		}),
	})
);

export const industriesToCompaniesRelations = relations(
	industriesToCompanies,
	({ one }) => ({
		industry: one(industries, {
			fields: [industriesToCompanies.industryId],
			references: [industries.id],
		}),
		company: one(companies, {
			fields: [industriesToCompanies.companyId],
			references: [companies.id],
		}),
	})
);

// Bids Ownership
export const bidsRelationships = pgTable(
	"bids_relationships",
	{
		bidId: varchar("bid_id", { length: 50 })
			.notNull()
			.primaryKey()
			.unique()
			.references(() => bids.id),
		jobId: varchar("job_id", { length: 50 }).references(() => jobs.id),
		contractId: varchar("contract_id", { length: 50 }).references(
			() => companies.id
		),
	},
	(table) => ({
		index: {
			jobBids: index("job_bids").on(table.jobId, table.bidId),
			contractBids: index("contract_bids").on(table.contractId, table.bidId),
		},
	})
);

export const bidsToOwnerRelations = relations(bidsRelationships, ({ one }) => ({
  bid: one(bids, {
    fields: [bidsRelationships.bidId],
    references: [bids.id],
  }),
  contract: one(companies, {
    fields: [bidsRelationships.contractId],
    references: [companies.id],
  }),
  job: one(jobs, {
    fields: [bidsRelationships.jobId],
    references: [jobs.id],
  }),
}));

// Media Ownership
export const mediaRelationships = pgTable(
	"media_relationships",
	{
		mediaId: varchar("media_id", { length: 50 })
			.notNull()
			.primaryKey()
			.unique()
			.references(() => media.id),
		jobId: varchar("job_id", { length: 50 }).references(() => jobs.id),
		projectId: varchar("project_id", { length: 50 }).references(
			() => projects.id
		),
		reviewId: varchar("review_id", { length: 50 }).references(() => reviews.id),
	},
	(table) => ({
		index: {
			jobMedia: index("job_media").on(table.jobId, table.mediaId),
			projectMedia: index("project_media").on(table.projectId, table.mediaId),
			reviewMedia: index("review_media").on(table.reviewId, table.mediaId),
		},
	})
);

export const mediaToOwnerRelations = relations(
	mediaRelationships,
	({ one }) => ({
		media: one(media, {
			fields: [mediaRelationships.mediaId],
			references: [media.id],
		}),
		job: one(jobs, {
			fields: [mediaRelationships.jobId],
			references: [jobs.id],
		}),
		project: one(projects, {
			fields: [mediaRelationships.projectId],
			references: [projects.id],
		}),
		review: one(reviews, {
			fields: [mediaRelationships.reviewId],
			references: [reviews.id],
		}),
	})
);

// Job Ownership
export const jobsRelationships = pgTable(
	"jobs_relationships",
	{
		jobId: varchar("job_id", { length: 50 })
			.notNull()
			.primaryKey()
			.unique()
			.references(() => jobs.id),
		userId: varchar("user_id", { length: 50 }).references(() => user.id),
		companyId: varchar("company_id", { length: 50 }).references(
			() => companies.id
		),
		contractId: varchar("contract_id", { length: 50 }).references(
			() => companies.id
		),
	},
	(table) => ({
		index: {
			userJobs: index("user_jobs").on(table.jobId, table.userId),
			companyJobs: index("company_jobs").on(table.jobId, table.companyId),
			contractJobs: index("contract_jobs").on(table.jobId, table.contractId),
		},
	})
);

export const jobsToOwnerRelations = relations(jobsRelationships, ({ one }) => ({
	job: one(jobs, {
		fields: [jobsRelationships.jobId],
		references: [jobs.id],
	}),
	contract: one(companies, {
		fields: [jobsRelationships.contractId],
		references: [companies.id],
	}),
	company: one(companies, {
		fields: [jobsRelationships.contractId],
		references: [companies.id],
	}),
	user: one(user, {
		fields: [jobsRelationships.userId],
		references: [user.id],
	}),
}));
