CREATE TABLE "admin_password_reset_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_user_id" uuid NOT NULL,
	"code_hash" text NOT NULL,
	"reset_token_hash" text,
	"attempts" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"verified_at" timestamp with time zone,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "admin_password_reset_tokens" ADD CONSTRAINT "admin_password_reset_tokens_admin_user_id_admin_users_id_fk" FOREIGN KEY ("admin_user_id") REFERENCES "public"."admin_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "admin_password_reset_tokens_admin_user_id_idx" ON "admin_password_reset_tokens" USING btree ("admin_user_id");--> statement-breakpoint
CREATE INDEX "admin_password_reset_tokens_expires_at_idx" ON "admin_password_reset_tokens" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "admin_password_reset_tokens_reset_token_hash_idx" ON "admin_password_reset_tokens" USING btree ("reset_token_hash");