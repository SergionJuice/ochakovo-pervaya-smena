CREATE TABLE `applications` (
	`id` text PRIMARY KEY NOT NULL,
	`submission_key` text NOT NULL,
	`payload_hash` text NOT NULL,
	`created_at` text NOT NULL,
	`name` text NOT NULL,
	`contact` text NOT NULL,
	`dob` text NOT NULL,
	`job` text NOT NULL,
	`readiness` text NOT NULL,
	`education` text NOT NULL,
	`source` text NOT NULL,
	`entry` text NOT NULL,
	`consent_version` text NOT NULL,
	`consent_text` text NOT NULL,
	`recipient` text NOT NULL,
	`status` text DEFAULT 'Новая' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `applications_submission_key_unique` ON `applications` (`submission_key`);--> statement-breakpoint
CREATE INDEX `applications_created_idx` ON `applications` (`created_at`);--> statement-breakpoint
CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`event` text NOT NULL,
	`source` text NOT NULL,
	`entry` text NOT NULL,
	`stage` text NOT NULL,
	`outcome` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `events_created_idx` ON `events` (`created_at`);--> statement-breakpoint
CREATE TABLE `intake_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`expires_at` integer NOT NULL
);
