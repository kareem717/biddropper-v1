-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `contracts` (
	`id` serial AUTO_INCREMENT PRIMARY KEY NOT NULL,
	`user_id` varchar(191) NOT NULL DEFAULT '',
	`title` varchar(191) NOT NULL DEFAULT '',
	`price` decimal(9,2) NOT NULL,
	`description` varchar(750) DEFAULT '',
	`features` json,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `emails` (
	`json` json,
	`id` varchar(191) PRIMARY KEY NOT NULL,
	`email_address` varchar(320),
	`verification` varchar(25)
);
--> statement-breakpoint
CREATE TABLE `external_accounts` (
	`json` json,
	`id` varchar(191) PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`json` json NOT NULL,
	`id` varchar(191) PRIMARY KEY NOT NULL,
	`created_at` bigint,
	`updated_at` bigint,
	`first_name` varchar(255),
	`last_name` varchar(255),
	`private_metadata` json,
	`public_metadata` json,
	`primary_email_address_id` varchar(191),
	`image_url` text
);
--> statement-breakpoint
CREATE INDEX `user_id` ON `contracts` (`user_id`);--> statement-breakpoint
CREATE INDEX `email_address` ON `emails` (`email_address`);
*/