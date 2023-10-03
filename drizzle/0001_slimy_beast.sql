ALTER TABLE "nodes" ALTER COLUMN "x" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "nodes" ALTER COLUMN "y" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "nodes" ALTER COLUMN "title" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "nodes" ADD COLUMN "parentId" integer;