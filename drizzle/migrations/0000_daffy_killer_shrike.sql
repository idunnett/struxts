DO $$ BEGIN
 CREATE TYPE "public"."users_structures_role" AS ENUM('Guest', 'Admin', 'Owner');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "edges" (
	"id" serial PRIMARY KEY NOT NULL,
	"source" serial NOT NULL,
	"target" serial NOT NULL,
	"startLabel" text,
	"label" text,
	"endLabel" text,
	"color" text DEFAULT '#000000' NOT NULL,
	"structureId" serial NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "files" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"url" text,
	"key" text,
	"nodeId" serial NOT NULL,
	"parentId" integer,
	"isFolder" boolean DEFAULT false NOT NULL,
	"structureId" serial NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nodes" (
	"id" serial PRIMARY KEY NOT NULL,
	"x" real NOT NULL,
	"y" real NOT NULL,
	"w" integer NOT NULL,
	"h" integer NOT NULL,
	"label" text,
	"info" text,
	"border_color" text DEFAULT '#000000' NOT NULL,
	"bg_color" text DEFAULT '#ffffff' NOT NULL,
	"structureId" serial NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "structures" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"createdById" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "temp_files" (
	"key" text PRIMARY KEY NOT NULL,
	"structureId" serial NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_structure_invites" (
	"invitedBy" text NOT NULL,
	"userId" text NOT NULL,
	"structureId" serial NOT NULL,
	CONSTRAINT "user_structure_invites_invitedBy_userId_structureId_pk" PRIMARY KEY("invitedBy","userId","structureId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users_structures" (
	"userId" text NOT NULL,
	"structureId" serial NOT NULL,
	"role" "users_structures_role" DEFAULT 'Guest' NOT NULL,
	CONSTRAINT "users_structures_userId_structureId_pk" PRIMARY KEY("userId","structureId")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "edges" ADD CONSTRAINT "edges_source_nodes_id_fk" FOREIGN KEY ("source") REFERENCES "public"."nodes"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "edges" ADD CONSTRAINT "edges_target_nodes_id_fk" FOREIGN KEY ("target") REFERENCES "public"."nodes"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "edges" ADD CONSTRAINT "edges_structureId_structures_id_fk" FOREIGN KEY ("structureId") REFERENCES "public"."structures"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "files" ADD CONSTRAINT "files_nodeId_nodes_id_fk" FOREIGN KEY ("nodeId") REFERENCES "public"."nodes"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "files" ADD CONSTRAINT "files_parentId_files_id_fk" FOREIGN KEY ("parentId") REFERENCES "public"."files"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "files" ADD CONSTRAINT "files_structureId_structures_id_fk" FOREIGN KEY ("structureId") REFERENCES "public"."structures"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nodes" ADD CONSTRAINT "nodes_structureId_structures_id_fk" FOREIGN KEY ("structureId") REFERENCES "public"."structures"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "temp_files" ADD CONSTRAINT "temp_files_structureId_structures_id_fk" FOREIGN KEY ("structureId") REFERENCES "public"."structures"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_structure_invites" ADD CONSTRAINT "user_structure_invites_structureId_structures_id_fk" FOREIGN KEY ("structureId") REFERENCES "public"."structures"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users_structures" ADD CONSTRAINT "users_structures_structureId_structures_id_fk" FOREIGN KEY ("structureId") REFERENCES "public"."structures"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
