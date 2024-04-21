CREATE TABLE `struxts_account` (
	`userId` text(255) NOT NULL,
	`type` text(255) NOT NULL,
	`provider` text(255) NOT NULL,
	`providerAccountId` text(255) NOT NULL,
	`refresh_token` text,
	`access_token` text,
	`expires_at` integer,
	`token_type` text(255),
	`scope` text(255),
	`id_token` text,
	`session_state` text(255),
	PRIMARY KEY(`provider`, `providerAccountId`),
	FOREIGN KEY (`userId`) REFERENCES `struxts_user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `struxts_nodes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`x` integer NOT NULL,
	`y` integer NOT NULL,
	`w` integer NOT NULL,
	`h` integer NOT NULL,
	`title` text(255) DEFAULT '',
	`description` text(255) DEFAULT '',
	`parentId` integer,
	`structureId` integer NOT NULL,
	FOREIGN KEY (`structureId`) REFERENCES `struxts_structures`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `struxts_session` (
	`sessionToken` text(255) PRIMARY KEY NOT NULL,
	`userId` text(255) NOT NULL,
	`expires` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `struxts_user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `struxts_structures` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text(255),
	`createdById` text(255) NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` integer,
	FOREIGN KEY (`createdById`) REFERENCES `struxts_user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `struxts_user` (
	`id` text(255) PRIMARY KEY NOT NULL,
	`name` text(255),
	`email` text(255) NOT NULL,
	`emailVerified` integer DEFAULT CURRENT_TIMESTAMP,
	`image` text(255)
);
--> statement-breakpoint
CREATE TABLE `struxts_usersStructures` (
	`userId` text(255) PRIMARY KEY NOT NULL,
	`structureId` integer PRIMARY KEY NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `struxts_user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`structureId`) REFERENCES `struxts_structures`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `struxts_verificationToken` (
	`identifier` text(255) NOT NULL,
	`token` text(255) NOT NULL,
	`expires` integer NOT NULL,
	PRIMARY KEY(`identifier`, `token`)
);
--> statement-breakpoint
CREATE INDEX `account_userId_idx` ON `struxts_account` (`userId`);--> statement-breakpoint
CREATE INDEX `session_userId_idx` ON `struxts_session` (`userId`);