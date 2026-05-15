ALTER TABLE "tyre_products" ALTER COLUMN "vehicle_type" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "tyre_products" ADD COLUMN "tyre_weight" numeric(10, 2);--> statement-breakpoint
CREATE INDEX "tyre_products_tyre_weight_idx" ON "tyre_products" USING btree ("tyre_weight");--> statement-breakpoint
UPDATE "tyre_products" SET "category" = NULL WHERE "category" IS NOT NULL AND "category" NOT IN ('Radial', 'Bais');--> statement-breakpoint
ALTER TABLE "tyre_products" ADD CONSTRAINT "tyre_products_category_check" CHECK ("tyre_products"."category" in ('Radial', 'Bais'));--> statement-breakpoint
ALTER TABLE "tyre_products" ADD CONSTRAINT "tyre_products_tyre_weight_check" CHECK ("tyre_products"."tyre_weight" is null or "tyre_products"."tyre_weight" > 0);
