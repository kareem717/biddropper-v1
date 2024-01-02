import {
	boolean,
	foreignKey,
	index,
	pgTable,
	primaryKey,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
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
import { relations } from "drizzle-orm";
import { user } from "../auth";
import { v4 as uuidv4 } from "uuid";

// Industry to Jobs
export const industriesToJobs = pgTable(
	"industries_to_jobs",
	{
		industryId: uuid("industry_id")
			.notNull()
			.references(() => industries.id, {
				onDelete: "restrict",
				onUpdate: "cascade",
			}),
		jobId: uuid("job_id")
			.notNull()
			.references(() => jobs.id, {
				onDelete: "cascade",
				onUpdate: "cascade",
			}),
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
		industryId: uuid("industry_id")
			.notNull()
			.references(() => industries.id, {
				onDelete: "restrict",
				onUpdate: "cascade",
			}),
		companyId: uuid("company_id")
			.notNull()
			.references(() => companies.id, {
				onDelete: "cascade",
				onUpdate: "cascade",
			}),
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
		bidId: uuid("bid_id")
			.notNull()
			.primaryKey()
			.unique()
			.references(() => bids.id, {
				onDelete: "cascade",
				onUpdate: "cascade",
			}),
		jobId: uuid("job_id").references(() => jobs.id, {
			onDelete: "cascade",
			onUpdate: "cascade",
		}),
		contractId: uuid("contract_id").references(
			() => contracts.id,
			{ onDelete: "cascade", onUpdate: "cascade" }
		),
		isWinner: boolean("is_winner").default(false).notNull(),
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
	contract: one(contracts, {
		fields: [bidsRelationships.contractId],
		references: [contracts.id],
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
		mediaId: uuid("media_id")
			.notNull()
			.primaryKey()
			.unique()
			.references(() => media.id, {
				onDelete: "cascade",
				onUpdate: "cascade",
			}),
		jobId: uuid("job_id").references(() => jobs.id, {
			onDelete: "set null",
			onUpdate: "cascade",
		}),
		projectId: uuid("project_id").references(
			() => projects.id,
			{
				onDelete: "set null",
				onUpdate: "cascade",
			}
		),
		reviewId: uuid("review_id").references(
			() => reviews.id,
			{
				onDelete: "set null",
				onUpdate: "cascade",
			}
		),
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
		jobId: uuid("job_id")
			.notNull()
			.primaryKey()
			.unique()
			.references(() => jobs.id, {
				onDelete: "cascade",
				onUpdate: "cascade",
			}),
		userId: uuid("user_id").references(() => user.id, {
			onDelete: "set null",
			onUpdate: "cascade",
		}),
		companyId: uuid("company_id").references(
			() => companies.id,
			{
				onDelete: "set null",
				onUpdate: "cascade",
			}
		),
		contractId: uuid("contract_id").references(
			() => contracts.id,
			{
				onDelete: "set null",
				onUpdate: "cascade",
			}
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
