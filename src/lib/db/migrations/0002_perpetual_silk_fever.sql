ALTER TABLE "contracts" DROP CONSTRAINT "contracts_winning_bid_id_bids_id_fk";
--> statement-breakpoint
ALTER TABLE "jobs" DROP CONSTRAINT "jobs_winning_bid_id_bids_id_fk";
--> statement-breakpoint
ALTER TABLE "jobs" DROP CONSTRAINT "jobs_address_id_addresses_id_fk";
--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "userId" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "userId" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "addresses" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "bids" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "bids" ALTER COLUMN "company_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "companies" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "companies" ALTER COLUMN "owner_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "companies" ALTER COLUMN "address_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "companies" ALTER COLUMN "image_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "contracts" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "industries" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "jobs" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "jobs" ALTER COLUMN "address_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "media" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "company_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "reviews" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "reviews" ALTER COLUMN "author_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "reviews" ALTER COLUMN "company_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "bids_relationships" ALTER COLUMN "bid_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "bids_relationships" ALTER COLUMN "job_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "bids_relationships" ALTER COLUMN "contract_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "industries_to_companies" ALTER COLUMN "industry_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "industries_to_companies" ALTER COLUMN "company_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "industries_to_jobs" ALTER COLUMN "industry_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "industries_to_jobs" ALTER COLUMN "job_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "jobs_relationships" ALTER COLUMN "job_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "jobs_relationships" ALTER COLUMN "user_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "jobs_relationships" ALTER COLUMN "company_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "jobs_relationships" ALTER COLUMN "contract_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "media_relationships" ALTER COLUMN "media_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "media_relationships" ALTER COLUMN "job_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "media_relationships" ALTER COLUMN "project_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "media_relationships" ALTER COLUMN "review_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "contracts" ADD COLUMN "company_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "bids_relationships" ADD COLUMN "is_winner" boolean DEFAULT false NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "companies" ADD CONSTRAINT "companies_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "user"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "contracts" ADD CONSTRAINT "contracts_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "jobs" ADD CONSTRAINT "jobs_address_id_addresses_id_fk" FOREIGN KEY ("address_id") REFERENCES "addresses"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "contracts" DROP COLUMN IF EXISTS "winning_bid_id";--> statement-breakpoint
ALTER TABLE "jobs" DROP COLUMN IF EXISTS "winning_bid_id";