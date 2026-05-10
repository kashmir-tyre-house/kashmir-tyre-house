CREATE TYPE "public"."admin_role" AS ENUM('admin', 'manager', 'viewer');--> statement-breakpoint
CREATE TYPE "public"."enquiry_status" AS ENUM('new', 'contacted', 'closed');--> statement-breakpoint
CREATE TYPE "public"."tyre_image_type" AS ENUM('hero', 'gallery');--> statement-breakpoint
CREATE TABLE "about_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"url" text NOT NULL,
	"alt" varchar(180) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "brands" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(120) NOT NULL,
	"logo_url" text,
	"website_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "enquiries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_name" varchar(120) NOT NULL,
	"phone" varchar(24) NOT NULL,
	"email" varchar(160),
	"company_name" varchar(160),
	"message" text,
	"status" "enquiry_status" DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "enquiry_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"enquiry_id" uuid NOT NULL,
	"tyre_product_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tyre_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tyre_product_id" uuid NOT NULL,
	"image_url" text NOT NULL,
	"image_type" "tyre_image_type" DEFAULT 'gallery' NOT NULL,
	"is_primary_image" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tyre_products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brand_id" uuid NOT NULL,
	"name" varchar(140) NOT NULL,
	"description" text,
	"category" varchar(80),
	"pattern" varchar(80) NOT NULL,
	"tyre_size" varchar(40) NOT NULL,
	"application" varchar(80) NOT NULL,
	"vehicle_type" varchar(120) NOT NULL,
	"tyre_type" varchar(80),
	"star_rating" varchar(20),
	"ply_rating" varchar(40),
	"load_index" varchar(80),
	"tyre_features" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(120) NOT NULL,
	"email" varchar(160) NOT NULL,
	"role" "admin_role" DEFAULT 'viewer' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "enquiry_items" ADD CONSTRAINT "enquiry_items_enquiry_id_enquiries_id_fk" FOREIGN KEY ("enquiry_id") REFERENCES "public"."enquiries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enquiry_items" ADD CONSTRAINT "enquiry_items_tyre_product_id_tyre_products_id_fk" FOREIGN KEY ("tyre_product_id") REFERENCES "public"."tyre_products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tyre_images" ADD CONSTRAINT "tyre_images_tyre_product_id_tyre_products_id_fk" FOREIGN KEY ("tyre_product_id") REFERENCES "public"."tyre_products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tyre_products" ADD CONSTRAINT "tyre_products_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "brands_name_unique" ON "brands" USING btree ("name");--> statement-breakpoint
CREATE INDEX "brands_is_active_idx" ON "brands" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "enquiry_items_enquiry_id_idx" ON "enquiry_items" USING btree ("enquiry_id");--> statement-breakpoint
CREATE INDEX "enquiry_items_tyre_product_id_idx" ON "enquiry_items" USING btree ("tyre_product_id");--> statement-breakpoint
CREATE INDEX "tyre_images_tyre_product_id_idx" ON "tyre_images" USING btree ("tyre_product_id");--> statement-breakpoint
CREATE INDEX "tyre_images_image_type_idx" ON "tyre_images" USING btree ("image_type");--> statement-breakpoint
CREATE INDEX "tyre_images_is_primary_image_idx" ON "tyre_images" USING btree ("is_primary_image");--> statement-breakpoint
CREATE INDEX "tyre_products_brand_id_idx" ON "tyre_products" USING btree ("brand_id");--> statement-breakpoint
CREATE INDEX "tyre_products_is_active_idx" ON "tyre_products" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "tyre_products_category_idx" ON "tyre_products" USING btree ("category");--> statement-breakpoint
CREATE INDEX "tyre_products_pattern_idx" ON "tyre_products" USING btree ("pattern");--> statement-breakpoint
CREATE INDEX "tyre_products_tyre_size_idx" ON "tyre_products" USING btree ("tyre_size");--> statement-breakpoint
CREATE INDEX "tyre_products_application_idx" ON "tyre_products" USING btree ("application");--> statement-breakpoint
CREATE INDEX "tyre_products_vehicle_type_idx" ON "tyre_products" USING btree ("vehicle_type");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "users_is_active_idx" ON "users" USING btree ("is_active");