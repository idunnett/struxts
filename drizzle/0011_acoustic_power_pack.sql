ALTER TABLE "h_links" DROP CONSTRAINT "h_links_left_id_right_id";--> statement-breakpoint
ALTER TABLE "h_links" ADD COLUMN "struxtId" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "h_links" ADD CONSTRAINT "h_links_struxtId_struxts_id_fk" FOREIGN KEY ("struxtId") REFERENCES "struxts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "h_links" ADD CONSTRAINT "h_links_left_id_right_id_struxtId" PRIMARY KEY("left_id","right_id","struxtId");