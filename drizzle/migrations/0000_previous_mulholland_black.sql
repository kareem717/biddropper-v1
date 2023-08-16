-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `bundle` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`is_active` tinyint NOT NULL DEFAULT 0,
	`user_id` varchar(191) NOT NULL DEFAULT '',
	`title` varchar(100) NOT NULL DEFAULT '',
	`description` varchar(750) DEFAULT '',
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bundle_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `communication_emails` (
	`json` json NOT NULL,
	`id` varchar(191) NOT NULL,
	`body` text,
	`body_plain` text,
	`user_id` varchar(191),
	`email_address_id` varchar(191),
	`to_email_address` varchar(320),
	CONSTRAINT `communication_emails_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `communication_sms` (
	`json` json NOT NULL,
	`id` varchar(191) NOT NULL,
	`from_phone_number` varchar(30),
	`user_id` varchar(191),
	`phone_number_id` varchar(191),
	`to_phone_number` varchar(320),
	`message` text,
	CONSTRAINT `communication_sms_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `emails` (
	`json` json,
	`user_id` varchar(191) NOT NULL,
	`id` varchar(191) NOT NULL,
	`email_address` varchar(320),
	`verification` varchar(25),
	CONSTRAINT `emails_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `external_accounts` (
	`json` json,
	`user_id` varchar(191) NOT NULL,
	`id` varchar(191) NOT NULL,
	CONSTRAINT `external_accounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `job` (
	`id` serial AUTO_INCREMENT NOT NULL,
	CONSTRAINT `job_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `organization_invitations` (
	`id` varchar(191) NOT NULL,
	`json` json NOT NULL,
	`created_at` bigint,
	`status` enum('revoked','accepted','pending'),
	`updated_at` bigint,
	`organization_id` varchar(191),
	`email_address` varchar(320),
	`role` varchar(25),
	CONSTRAINT `organization_invitations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `organization_memberships` (
	`json` json NOT NULL,
	`id` varchar(191) NOT NULL,
	`created_at` bigint,
	`updated_at` bigint,
	`user_id` varchar(191),
	`role` varchar(25),
	`organization_id` varchar(191),
	CONSTRAINT `organization_memberships_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `organization_memberships_archive` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`json` json NOT NULL,
	`deleted_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `organization_memberships_archive_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `organizations` (
	`id` varchar(191) NOT NULL,
	`json` json NOT NULL,
	`created_at` bigint,
	`created_by` varchar(191),
	`image_url` text,
	`name` varchar(255),
	`public_metadata` json,
	`updated_at` bigint,
	`slug` varchar(365),
	CONSTRAINT `organizations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `organizations_archive` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`json` json NOT NULL,
	`deleted_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`json` json NOT NULL,
	`id` varchar(191) NOT NULL,
	`client_id` varchar(191),
	`user_id` varchar(191),
	`abandon_at` bigint,
	`created_at` bigint,
	`updated_at` bigint,
	`last_active_at` bigint,
	`expire_at` bigint,
	`status` enum('active','removed','ended','revoked'),
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`json` json NOT NULL,
	`id` varchar(191) NOT NULL,
	`created_at` bigint,
	`updated_at` bigint,
	`first_name` varchar(255),
	`last_name` varchar(255),
	`private_metadata` json,
	`public_metadata` json,
	`primary_email_address_id` varchar(191),
	`image_url` text,
	`unsafe_metadata` json,
	CONSTRAINT `users_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users_archive` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`json` json,
	`deleted_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `users_archive_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `user_id` ON `bundle` (`user_id`);--> statement-breakpoint
CREATE INDEX `user_id` ON `communication_emails` (`user_id`);--> statement-breakpoint
CREATE INDEX `user_id` ON `communication_sms` (`user_id`);--> statement-breakpoint
CREATE INDEX `user_id` ON `organization_memberships` (`user_id`);--> statement-breakpoint
CREATE INDEX `organization_id` ON `organization_memberships` (`organization_id`);--> statement-breakpoint
CREATE INDEX `created_by` ON `organizations` (`created_by`);--> statement-breakpoint
CREATE INDEX `user_id` ON `sessions` (`user_id`);
*/