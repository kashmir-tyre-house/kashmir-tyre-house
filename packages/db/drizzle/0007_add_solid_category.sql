ALTER TABLE "tyre_products" DROP CONSTRAINT IF EXISTS "tyre_products_category_check";--> statement-breakpoint
ALTER TABLE "tyre_products" ADD CONSTRAINT "tyre_products_category_check" CHECK ("tyre_products"."category" in ('Radial', 'Bais', 'Solid'));
