CREATE TABLE IF NOT EXISTS "site_settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" text DEFAULT '' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "coupons" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL UNIQUE,
	"type" text NOT NULL,
	"value" integer NOT NULL,
	"min_order_amount" integer DEFAULT 0 NOT NULL,
	"max_uses" integer,
	"used_count" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "auth_throttle" (
	"key" text PRIMARY KEY NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"locked_until" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "customer_notes" text;
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "coupon_code" text;
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "discount_amount" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "tracking_url" text;
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "accepted_at" timestamp;
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "shipped_at" timestamp;
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "terms_accepted_at" timestamp;
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "terms_version" text;
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "custom_waiver_accepted_at" timestamp;
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "delay_notified_at" timestamp;
