DROP TABLE "industries_to_jobs";--> statement-breakpoint
ALTER TABLE "contracts" ALTER COLUMN "is_active" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "jobs" ADD CONSTRAINT "jobs_industry_industries_value_fk" FOREIGN KEY ("industry") REFERENCES "industries"("value") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
