ALTER TABLE "enquiry_items" DROP CONSTRAINT IF EXISTS "enquiry_items_tyre_product_id_tyre_products_id_fk";--> statement-breakpoint
ALTER TABLE "enquiry_items" ALTER COLUMN "tyre_product_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "enquiry_items" ADD CONSTRAINT "enquiry_items_tyre_product_id_tyre_products_id_fk" FOREIGN KEY ("tyre_product_id") REFERENCES "public"."tyre_products"("id") ON DELETE set null ON UPDATE no action;
