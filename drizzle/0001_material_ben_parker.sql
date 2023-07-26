CREATE TABLE `organizations` (
	`id` varchar(191) PRIMARY KEY NOT NULL,
	`json` json NOT NULL,
	`created_at` bigint,
	`created_by` varchar(191),
	`image_url` text,
	`name` varchar(255),
	`slug` varchar(365),
	`public_metadata` json,
	`updated_at` bigint
);
--> statement-breakpoint
CREATE TABLE `organizations_archive` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`json` json NOT NULL,
	`deleted_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
DROP INDEX `user_id` ON `emails`;--> statement-breakpoint
DROP INDEX `user_id` ON `external_accounts`;--> statement-breakpoint
CREATE INDEX `created_by` ON `organizations` (`created_by`);