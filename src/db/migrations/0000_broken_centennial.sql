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
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `accounts_provider_providerAccountId` PRIMARY KEY(`provider`,`providerAccountId`)
);
--> statement-breakpoint
CREATE TABLE `addresses` (
	`id` varchar(50) NOT NULL,
	`address_line_1` varchar(70),
	`address_line_2` varchar(70),
	`city` varchar(50),
	`region` varchar(50),
	`postal_code` varchar(10) NOT NULL,
	`country` varchar(60) NOT NULL,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`x-coordinate` double NOT NULL,
	`y-coordinate` double NOT NULL,
	CONSTRAINT `addresses_provider_providerAccountId` PRIMARY KEY(`provider`,`providerAccountId`)
);
--> statement-breakpoint
CREATE TABLE `bids` (
	`id` varchar(50) NOT NULL,
	`price` decimal(10,2) NOT NULL,
	`status` enum('pending','accepted','declined') NOT NULL DEFAULT 'pending',
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`company_id` varchar(50) NOT NULL,
	CONSTRAINT `bids_provider_providerAccountId` PRIMARY KEY(`provider`,`providerAccountId`)
);
--> statement-breakpoint
CREATE TABLE `companies` (
	`id` varchar(50) NOT NULL,
	`name` varchar(50) NOT NULL,
	`owner_id` varchar(50) NOT NULL,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`address_id` varchar(50),
	`service_area` decimal(7,3),
	`email_address` varchar(320) NOT NULL,
	`phone_number` varchar(20) NOT NULL,
	`website_url` varchar(2048),
	`products` varchar(300),
	`is_verified` tinyint DEFAULT 0,
	`specialties` varchar(400),
	`services` varchar(400),
	`image_id` varchar(50),
	`date_established` timestamp NOT NULL,
	CONSTRAINT `companies_provider_providerAccountId` PRIMARY KEY(`provider`,`providerAccountId`)
);
--> statement-breakpoint
CREATE TABLE `company_industries` (
	`company_id` varchar(50) NOT NULL,
	`industry_id` varchar(50) NOT NULL,
	CONSTRAINT `company_industries_provider_providerAccountId` PRIMARY KEY(`provider`,`providerAccountId`)
);
--> statement-breakpoint
CREATE TABLE `company_jobs` (
	`company_id` varchar(50) NOT NULL,
	`job_id` varchar(50) NOT NULL,
	CONSTRAINT `company_jobs_provider_providerAccountId` PRIMARY KEY(`provider`,`providerAccountId`)
);
--> statement-breakpoint
CREATE TABLE `company_projects` (
	`company_id` varchar(50) NOT NULL,
	`project_id` varchar(50) NOT NULL,
	CONSTRAINT `company_projects_provider_providerAccountId` PRIMARY KEY(`provider`,`providerAccountId`)
);
--> statement-breakpoint
CREATE TABLE `company_reviews` (
	`company_id` varchar(50) NOT NULL,
	`review_id` varchar(50) NOT NULL,
	CONSTRAINT `company_reviews_provider_providerAccountId` PRIMARY KEY(`provider`,`providerAccountId`)
);
--> statement-breakpoint
CREATE TABLE `contract_bids` (
	`bid_id` varchar(50) NOT NULL,
	`contract_id` varchar(50) NOT NULL,
	CONSTRAINT `contract_bids_provider_providerAccountId` PRIMARY KEY(`provider`,`providerAccountId`)
);
--> statement-breakpoint
CREATE TABLE `contract_jobs` (
	`contract_id` varchar(50) NOT NULL,
	`job_id` varchar(50) NOT NULL,
	CONSTRAINT `contract_jobs_provider_providerAccountId` PRIMARY KEY(`provider`,`providerAccountId`)
);
--> statement-breakpoint
CREATE TABLE `contracts` (
	`id` varchar(50) NOT NULL,
	`is_active` tinyint DEFAULT 1,
	`title` varchar(100) NOT NULL,
	`description` varchar(3000) NOT NULL,
	`price` decimal(13,4) NOT NULL,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`end_date` timestamp,
	CONSTRAINT `contracts_provider_providerAccountId` PRIMARY KEY(`provider`,`providerAccountId`),
	CONSTRAINT `id` UNIQUE(`id`)
);
--> statement-breakpoint
CREATE TABLE `industries` (
	`id` varchar(50) NOT NULL,
	`label` varchar(100) NOT NULL,
	`value` varchar(100) NOT NULL,
	CONSTRAINT `industries_provider_providerAccountId` PRIMARY KEY(`provider`,`providerAccountId`),
	CONSTRAINT `label` UNIQUE(`label`),
	CONSTRAINT `value_2` UNIQUE(`value`)
);
--> statement-breakpoint
CREATE TABLE `job_bids` (
	`bid_id` varchar(50) NOT NULL,
	`job_id` varchar(50) NOT NULL,
	CONSTRAINT `job_bids_provider_providerAccountId` PRIMARY KEY(`provider`,`providerAccountId`)
);
--> statement-breakpoint
CREATE TABLE `job_media` (
	`media_id` varchar(50) NOT NULL,
	`job_id` varchar(50) NOT NULL,
	CONSTRAINT `job_media_provider_providerAccountId` PRIMARY KEY(`provider`,`providerAccountId`)
);
--> statement-breakpoint
CREATE TABLE `jobs` (
	`id` varchar(50) NOT NULL,
	`industry` varchar(255) NOT NULL,
	`is_active` tinyint DEFAULT 1,
	`is_commercial_property` tinyint NOT NULL DEFAULT 0,
	`details` varchar(3000) NOT NULL,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`time_horizon` enum('asap','one-week','two-weeks','one-month','flexible') NOT NULL,
	`property_type` enum('detached','apartment','semi-detached','town-house') NOT NULL,
	CONSTRAINT `jobs_provider_providerAccountId` PRIMARY KEY(`provider`,`providerAccountId`)
);
--> statement-breakpoint
CREATE TABLE `media` (
	`id` varchar(50) NOT NULL,
	`file_url` varchar(2083) NOT NULL,
	`file_key` varchar(191) NOT NULL,
	CONSTRAINT `media_provider_providerAccountId` PRIMARY KEY(`provider`,`providerAccountId`)
);
--> statement-breakpoint
CREATE TABLE `project_media` (
	`project_id` varchar(50) NOT NULL,
	`media_id` varchar(50) NOT NULL,
	CONSTRAINT `project_media_provider_providerAccountId` PRIMARY KEY(`provider`,`providerAccountId`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` varchar(50) NOT NULL,
	`title` varchar(255) NOT NULL,
	`details` varchar(3000) NOT NULL,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_provider_providerAccountId` PRIMARY KEY(`provider`,`providerAccountId`)
);
--> statement-breakpoint
CREATE TABLE `review_media` (
	`review_id` varchar(50) NOT NULL,
	`media_id` varchar(50) NOT NULL,
	CONSTRAINT `review_media_provider_providerAccountId` PRIMARY KEY(`provider`,`providerAccountId`)
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` varchar(50) NOT NULL,
	`author_id` varchar(50) NOT NULL,
	`rating` decimal(2,1) NOT NULL,
	`created_at` timestamp DEFAULT now(),
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`details` varchar(1500) NOT NULL,
	`title` varchar(255) NOT NULL,
	CONSTRAINT `reviews_provider_providerAccountId` PRIMARY KEY(`provider`,`providerAccountId`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`sessionToken` varchar(255) NOT NULL,
	`userId` varchar(255) NOT NULL,
	`expires` timestamp NOT NULL,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sessions_provider_providerAccountId` PRIMARY KEY(`provider`,`providerAccountId`)
);
--> statement-breakpoint
CREATE TABLE `user_jobs` (
	`job_id` varchar(50) NOT NULL,
	`user_id` varchar(50) NOT NULL,
	CONSTRAINT `user_jobs_provider_providerAccountId` PRIMARY KEY(`provider`,`providerAccountId`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(255) NOT NULL,
	`name` varchar(255),
	`email` varchar(255) NOT NULL,
	`emailVerified` timestamp,
	`image` varchar(255),
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_provider_providerAccountId` PRIMARY KEY(`provider`,`providerAccountId`)
);
--> statement-breakpoint
CREATE TABLE `verificationTokens` (
	`identifier` varchar(255) NOT NULL,
	`token` varchar(255) NOT NULL,
	`expires` timestamp NOT NULL,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `verificationTokens_provider_providerAccountId` PRIMARY KEY(`provider`,`providerAccountId`)
);
--> statement-breakpoint
CREATE INDEX `company_id` ON `bids` (`company_id`);--> statement-breakpoint
CREATE INDEX `value` ON `industries` (`value`);
*/