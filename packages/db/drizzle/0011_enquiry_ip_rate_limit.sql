ALTER TABLE "enquiries" ADD COLUMN IF NOT EXISTS "ip_address" varchar(45);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "enquiries_ip_created_at_idx" ON "enquiries" USING btree ("ip_address","created_at");
