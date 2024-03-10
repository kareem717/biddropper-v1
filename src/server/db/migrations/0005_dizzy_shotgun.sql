ALTER TABLE "jobs" DROP CONSTRAINT "jobs_industry_industries_value_fk";
--> statement-breakpoint
ALTER TABLE "jobs" ALTER COLUMN "industry" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "jobs" ALTER COLUMN "industry" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "jobs" ALTER COLUMN "address_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "jobs" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "jobs" ADD CONSTRAINT "jobs_industry_industries_value_fk" FOREIGN KEY ("industry") REFERENCES "industries"("value") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
