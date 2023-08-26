-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `accounts` (
	`userId` varchar(255) NOT NULL,
	`type` varchar(255) NOT NULL,
	`provider` varchar(255) NOT NULL,
	`providerAccountId` varchar(255) NOT NULL,
	`refresh_token` varchar(255),
	`refresh_token_expires_in` int,
	`access_token` varchar(255),
	`expires_at` int,
	`token_type` varchar(255),
	`scope` varchar(255),
	`id_token` text,
	`session_state` text,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `accounts_provider_providerAccountId` PRIMARY KEY(`provider`,`providerAccountId`)
);
--> statement-breakpoint
CREATE TABLE `addresses` (
	`id` varchar(50) NOT NULL,
	`address_line_1` varchar(70) NOT NULL,
	`address_line_2` varchar(70),
	`city` varchar(50) NOT NULL,
	`region` varchar(50) NOT NULL,
	`postal_code` varchar(10) NOT NULL,
	`country` varchar(60) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `addresses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bids` (
	`id` varchar(50) NOT NULL,
	`job_id` varchar(50) NOT NULL,
	`price` decimal(10,2) NOT NULL,
	`status` enum('pending','accepted','declined') NOT NULL DEFAULT 'pending',
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`company_id` varchar(50) NOT NULL,
	CONSTRAINT `bids_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bundle_media` (
	`id` varchar(50) NOT NULL,
	`bundle_id` varchar(50) NOT NULL,
	`media_url` varchar(500) NOT NULL,
	`file_key` varchar(191) NOT NULL,
	CONSTRAINT `bundle_media_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bundles` (
	`id` varchar(50) NOT NULL,
	`is_active` tinyint DEFAULT 1,
	`user_id` varchar(50) NOT NULL DEFAULT '',
	`title` varchar(100) NOT NULL DEFAULT '',
	`description` varchar(750) DEFAULT '',
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`bundle_type` enum('sub-contract','contractor-wanted') NOT NULL DEFAULT 'contractor-wanted',
	`poster_type` enum('business-owner','property-owner') NOT NULL DEFAULT 'property-owner',
	`address_id` varchar(50) NOT NULL,
	`show_exact_location` tinyint NOT NULL DEFAULT 0,
	CONSTRAINT `bundles_id` PRIMARY KEY(`id`),
	CONSTRAINT `id` UNIQUE(`id`)
);
--> statement-breakpoint
CREATE TABLE `jobs` (
	`id` varchar(50) NOT NULL,
	`user_id` varchar(50) NOT NULL,
	`is_active` tinyint DEFAULT 1,
	`bundle_id` varchar(50) NOT NULL,
	`industry` varchar(255) NOT NULL,
	`title` varchar(50) NOT NULL,
	`summary` varchar(400) NOT NULL,
	`budget` decimal(9,2) NOT NULL,
	`currency_type` enum('usd','cad','eur'),
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`date_from` timestamp NOT NULL,
	`date_to` timestamp,
	`property_type` enum('residential','commercial') NOT NULL DEFAULT 'residential',
	CONSTRAINT `jobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`sessionToken` varchar(255) NOT NULL,
	`userId` varchar(255) NOT NULL,
	`expires` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sessions_sessionToken` PRIMARY KEY(`sessionToken`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(255) NOT NULL,
	`name` varchar(255),
	`email` varchar(255) NOT NULL,
	`emailVerified` timestamp,
	`image` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `verificationToken` (
	`identifier` varchar(255) NOT NULL,
	`token` varchar(255) NOT NULL,
	`expires` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `verificationToken_identifier_token` PRIMARY KEY(`identifier`,`token`)
);
--> statement-breakpoint
CREATE INDEX `company_id` ON `bids` (`company_id`);--> statement-breakpoint
CREATE INDEX `job_id` ON `bids` (`job_id`);--> statement-breakpoint
CREATE INDEX `user_id` ON `bundles` (`user_id`);
*/