ALTER TABLE "addresses" RENAME COLUMN "y-coordinate" TO "latitude";--> statement-breakpoint
ALTER TABLE "addresses" RENAME COLUMN "x-coordinate" TO "longitude";--> statement-breakpoint
ALTER TABLE "account" DROP CONSTRAINT "account_userId_user_id_fk";
--> statement-breakpoint
ALTER TABLE "session" DROP CONSTRAINT "session_userId_user_id_fk";
--> statement-breakpoint
ALTER TABLE "companies" DROP CONSTRAINT "companies_address_id_addresses_id_fk";
--> statement-breakpoint
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_author_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "bids_relationships" DROP CONSTRAINT "bids_relationships_contract_id_companies_id_fk";
--> statement-breakpoint
ALTER TABLE "bids_relationships" DROP CONSTRAINT "bids_relationships_bid_id_bids_id_fk";
--> statement-breakpoint
ALTER TABLE "industries_to_companies" DROP CONSTRAINT "industries_to_companies_industry_id_industries_id_fk";
--> statement-breakpoint
ALTER TABLE "industries_to_jobs" DROP CONSTRAINT "industries_to_jobs_industry_id_industries_id_fk";
--> statement-breakpoint
ALTER TABLE "jobs_relationships" DROP CONSTRAINT "jobs_relationships_contract_id_companies_id_fk";
--> statement-breakpoint
ALTER TABLE "jobs_relationships" DROP CONSTRAINT "jobs_relationships_job_id_jobs_id_fk";
--> statement-breakpoint
ALTER TABLE "media_relationships" DROP CONSTRAINT "media_relationships_media_id_media_id_fk";
--> statement-breakpoint
ALTER TABLE "contracts" ALTER COLUMN "price" SET DATA TYPE numeric(10, 2);--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "winning_bid_id" varchar(50);--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "companies" ADD CONSTRAINT "companies_address_id_addresses_id_fk" FOREIGN KEY ("address_id") REFERENCES "addresses"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "jobs" ADD CONSTRAINT "jobs_winning_bid_id_bids_id_fk" FOREIGN KEY ("winning_bid_id") REFERENCES "bids"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reviews" ADD CONSTRAINT "reviews_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "user"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bids_relationships" ADD CONSTRAINT "bids_relationships_contract_id_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "contracts"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bids_relationships" ADD CONSTRAINT "bids_relationships_bid_id_bids_id_fk" FOREIGN KEY ("bid_id") REFERENCES "bids"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "industries_to_companies" ADD CONSTRAINT "industries_to_companies_industry_id_industries_id_fk" FOREIGN KEY ("industry_id") REFERENCES "industries"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "industries_to_jobs" ADD CONSTRAINT "industries_to_jobs_industry_id_industries_id_fk" FOREIGN KEY ("industry_id") REFERENCES "industries"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "jobs_relationships" ADD CONSTRAINT "jobs_relationships_contract_id_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "contracts"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "jobs_relationships" ADD CONSTRAINT "jobs_relationships_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "media_relationships" ADD CONSTRAINT "media_relationships_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
