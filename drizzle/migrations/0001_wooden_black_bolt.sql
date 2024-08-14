CREATE TABLE IF NOT EXISTS "edge_labels" (
	"id" serial PRIMARY KEY NOT NULL,
	"edgeId" integer NOT NULL,
	"label" text NOT NULL,
	"offset" integer DEFAULT 50 NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "edge_labels" ADD CONSTRAINT "edge_labels_edgeId_edges_id_fk" FOREIGN KEY ("edgeId") REFERENCES "public"."edges"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "edges" DROP COLUMN IF EXISTS "startLabel";--> statement-breakpoint
ALTER TABLE "edges" DROP COLUMN IF EXISTS "label";--> statement-breakpoint
ALTER TABLE "edges" DROP COLUMN IF EXISTS "endLabel";