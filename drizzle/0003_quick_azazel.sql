CREATE TABLE IF NOT EXISTS "struxts" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "nodes" ADD COLUMN "struxtId" integer NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nodes" ADD CONSTRAINT "nodes_struxtId_struxts_id_fk" FOREIGN KEY ("struxtId") REFERENCES "struxts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
