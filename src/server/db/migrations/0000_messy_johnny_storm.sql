DO $$ BEGIN
 CREATE TYPE "bid_status" AS ENUM('retracted', 'declined', 'accepted', 'pending');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "enum_jobs_status" AS ENUM('removed', 'inactive', 'active');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "enum_jobs_property_type" AS ENUM('semi-detached', 'apartment', 'detached');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "start_date_flag" AS ENUM('urgent', 'flexible', 'none');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "account" (
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT account_provider_providerAccountId_pk PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "session" (
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"emailVerified" timestamp,
	"image" text,
	CONSTRAINT "user_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "verificationToken" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT verificationToken_identifier_token_pk PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "addresses" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"x-coordinate" numeric NOT NULL,
	"y-coordinate" numeric NOT NULL,
	"address_line_1" varchar(70),
	"address_line_2" varchar(70),
	"city" varchar(50),
	"region" varchar(50),
	"postal_code" varchar(10) NOT NULL,
	"country" varchar(60) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "addresses_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bids" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"company_id" varchar(50) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"status" "bid_status" DEFAULT 'pending' NOT NULL,
	CONSTRAINT "bids_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "companies" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"owner_id" varchar(50) NOT NULL,
	"address_id" varchar(50),
	"service_area" numeric(7, 3),
	"email_address" varchar(320) NOT NULL,
	"phone_number" varchar(20) NOT NULL,
	"website_url" varchar(2048),
	"products" varchar(300),
	"is_verified" boolean DEFAULT false NOT NULL,
	"specialties" varchar(400),
	"services" varchar(400),
	"date_established" timestamp NOT NULL,
	"image_id" varchar(50),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "companies_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "contracts" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"is_active" boolean DEFAULT true,
	"title" varchar(100) NOT NULL,
	"description" varchar(3000) NOT NULL,
	"price" numeric(13, 4) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"end_date" timestamp,
	"winning_bid_id" varchar(50),
	CONSTRAINT "contracts_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "industries" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"label" varchar(100) NOT NULL,
	"value" varchar(100) NOT NULL,
	CONSTRAINT "industries_id_unique" UNIQUE("id"),
	CONSTRAINT "industries_label_unique" UNIQUE("label"),
	CONSTRAINT "industries_value_unique" UNIQUE("value")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "jobs" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"industry" varchar(255) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_commercial_property" boolean DEFAULT false NOT NULL,
	"description" varchar(3000) NOT NULL,
	"address_id" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"start_date" timestamp,
	"start_date_flag" "start_date_flag" DEFAULT 'none' NOT NULL,
	"property_type" "enum_jobs_property_type" NOT NULL,
	CONSTRAINT "jobs_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "media" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"url" varchar(2083) NOT NULL,
	CONSTRAINT "media_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "projects" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" varchar(3000) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"company_id" varchar(50) NOT NULL,
	"is_active" boolean DEFAULT true,
	CONSTRAINT "projects_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "reviews" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"author_id" varchar(50) NOT NULL,
	"rating" numeric(2, 1) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"description" varchar(1500) NOT NULL,
	"title" varchar(255) NOT NULL,
	"company_id" varchar(50) NOT NULL,
	CONSTRAINT "reviews_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bids_relationships" (
	"bid_id" varchar(50) PRIMARY KEY NOT NULL,
	"job_id" varchar(50),
	"contract_id" varchar(50),
	CONSTRAINT "bids_relationships_bid_id_unique" UNIQUE("bid_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "industries_to_companies" (
	"industry_id" varchar(50) NOT NULL,
	"company_id" varchar(50) NOT NULL,
	CONSTRAINT industries_to_companies_industry_id_company_id_pk PRIMARY KEY("industry_id","company_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "industries_to_jobs" (
	"industry_id" varchar(50) NOT NULL,
	"job_id" varchar(50) NOT NULL,
	CONSTRAINT industries_to_jobs_industry_id_job_id_pk PRIMARY KEY("industry_id","job_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "jobs_relationships" (
	"job_id" varchar(50) PRIMARY KEY NOT NULL,
	"user_id" varchar(50),
	"company_id" varchar(50),
	"contract_id" varchar(50),
	CONSTRAINT "jobs_relationships_job_id_unique" UNIQUE("job_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "media_relationships" (
	"media_id" varchar(50) PRIMARY KEY NOT NULL,
	"job_id" varchar(50),
	"project_id" varchar(50),
	"review_id" varchar(50),
	CONSTRAINT "media_relationships_media_id_unique" UNIQUE("media_id")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "company_id" ON "bids" ("company_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "value" ON "industries" ("value");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bids" ADD CONSTRAINT "bids_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "companies" ADD CONSTRAINT "companies_address_id_addresses_id_fk" FOREIGN KEY ("address_id") REFERENCES "addresses"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "companies" ADD CONSTRAINT "companies_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "media"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "contracts" ADD CONSTRAINT "contracts_winning_bid_id_bids_id_fk" FOREIGN KEY ("winning_bid_id") REFERENCES "bids"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "jobs" ADD CONSTRAINT "jobs_address_id_addresses_id_fk" FOREIGN KEY ("address_id") REFERENCES "addresses"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "projects" ADD CONSTRAINT "projects_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reviews" ADD CONSTRAINT "reviews_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reviews" ADD CONSTRAINT "reviews_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bids_relationships" ADD CONSTRAINT "bids_relationships_bid_id_bids_id_fk" FOREIGN KEY ("bid_id") REFERENCES "bids"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bids_relationships" ADD CONSTRAINT "bids_relationships_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bids_relationships" ADD CONSTRAINT "bids_relationships_contract_id_companies_id_fk" FOREIGN KEY ("contract_id") REFERENCES "companies"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "industries_to_companies" ADD CONSTRAINT "industries_to_companies_industry_id_industries_id_fk" FOREIGN KEY ("industry_id") REFERENCES "industries"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "industries_to_companies" ADD CONSTRAINT "industries_to_companies_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "industries_to_jobs" ADD CONSTRAINT "industries_to_jobs_industry_id_industries_id_fk" FOREIGN KEY ("industry_id") REFERENCES "industries"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "industries_to_jobs" ADD CONSTRAINT "industries_to_jobs_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "jobs_relationships" ADD CONSTRAINT "jobs_relationships_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "jobs_relationships" ADD CONSTRAINT "jobs_relationships_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "jobs_relationships" ADD CONSTRAINT "jobs_relationships_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "jobs_relationships" ADD CONSTRAINT "jobs_relationships_contract_id_companies_id_fk" FOREIGN KEY ("contract_id") REFERENCES "companies"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "media_relationships" ADD CONSTRAINT "media_relationships_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "media_relationships" ADD CONSTRAINT "media_relationships_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "media_relationships" ADD CONSTRAINT "media_relationships_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "media_relationships" ADD CONSTRAINT "media_relationships_review_id_reviews_id_fk" FOREIGN KEY ("review_id") REFERENCES "reviews"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
