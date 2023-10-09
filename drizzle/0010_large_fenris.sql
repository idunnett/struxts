CREATE TABLE IF NOT EXISTS "h_links" (
	"left_id" integer NOT NULL,
	"right_id" integer NOT NULL,
	CONSTRAINT h_links_left_id_right_id PRIMARY KEY("left_id","right_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "h_links" ADD CONSTRAINT "h_links_left_id_nodes_id_fk" FOREIGN KEY ("left_id") REFERENCES "nodes"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "h_links" ADD CONSTRAINT "h_links_right_id_nodes_id_fk" FOREIGN KEY ("right_id") REFERENCES "nodes"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
