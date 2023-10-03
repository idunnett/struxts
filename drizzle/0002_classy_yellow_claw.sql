DO $$ BEGIN
 CREATE TYPE "node_type" AS ENUM('node', 'group');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "nodes" ADD COLUMN "type" "node_type" NOT NULL;