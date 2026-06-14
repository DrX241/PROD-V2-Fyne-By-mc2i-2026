CREATE TYPE "public"."assistant_domain" AS ENUM('cybersecurite', 'gestion_projet', 'amoa', 'developpement', 'data_ia', 'conseil', 'general');--> statement-breakpoint
CREATE TYPE "public"."assistant_personality" AS ENUM('professionnel', 'amical', 'direct', 'expert', 'pédagogique', 'mentor');--> statement-breakpoint
CREATE TYPE "public"."difficulty_level" AS ENUM('beginner', 'intermediate', 'advanced');--> statement-breakpoint
CREATE TYPE "public"."gamification_level" AS ENUM('aucun', 'leger', 'modere', 'eleve', 'intense');--> statement-breakpoint
CREATE TYPE "public"."learning_style" AS ENUM('reading', 'interactive', 'mixed');--> statement-breakpoint
CREATE TYPE "public"."share_access" AS ENUM('private', 'readOnly', 'editable');--> statement-breakpoint
CREATE TABLE "assistant_conversations" (
	"id" serial PRIMARY KEY NOT NULL,
	"assistant_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"title" varchar(255) DEFAULT 'Nouvelle conversation',
	"messages" jsonb DEFAULT '[]'::jsonb,
	"settings" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"last_message_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "assistant_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"category" varchar(100) NOT NULL,
	"system_prompt" text NOT NULL,
	"personality" "assistant_personality" NOT NULL,
	"domain" "assistant_domain" NOT NULL,
	"expertise" text[],
	"avatar_style" varchar(100) DEFAULT 'robot',
	"avatar_color" varchar(50) DEFAULT 'violet',
	"gamification_level" "gamification_level" DEFAULT 'leger',
	"custom_instructions" jsonb DEFAULT '{}'::jsonb,
	"is_official" boolean DEFAULT true,
	"display_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "client_companies" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "client_companies_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "client_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"first_name" varchar(255),
	"last_name" varchar(255),
	"role" varchar(20) DEFAULT 'user' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"exercices_realises" integer DEFAULT 0 NOT NULL,
	"taux_reussite" integer DEFAULT 0 NOT NULL,
	"niveau" varchar(50) DEFAULT 'Novice' NOT NULL,
	"badges" integer DEFAULT 0 NOT NULL,
	"last_login" timestamp,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "client_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "custom_assistants" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"system_prompt" text NOT NULL,
	"personality" "assistant_personality" NOT NULL,
	"domain" "assistant_domain" NOT NULL,
	"expertise" text[],
	"avatar_style" varchar(100) DEFAULT 'robot',
	"avatar_color" varchar(50) DEFAULT 'violet',
	"gamification_level" "gamification_level" DEFAULT 'leger',
	"custom_instructions" jsonb DEFAULT '{}'::jsonb,
	"is_public" boolean DEFAULT false,
	"is_verified" boolean DEFAULT false,
	"usage_count" integer DEFAULT 0,
	"rating" integer DEFAULT 0,
	"share_access" "share_access" DEFAULT 'private',
	"share_link" text,
	"share_link_expiration" timestamp,
	"owner_display_name" text,
	"is_template" boolean DEFAULT false,
	"branding_settings" jsonb DEFAULT '{"primaryColor":"#3b82f6","logoUrl":null,"fontFamily":null,"customCss":null}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "custom_modules" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"user_name" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"domain" varchar(100) NOT NULL,
	"description" text NOT NULL,
	"iam_name" varchar(255) NOT NULL,
	"display_order" integer DEFAULT 100,
	"difficulty" "difficulty_level" DEFAULT 'intermediate',
	"topics" text[] NOT NULL,
	"gamification_level" "gamification_level" DEFAULT 'leger',
	"learning_style" "learning_style" DEFAULT 'mixed',
	"include_trainer_module" boolean DEFAULT true,
	"include_ops_module" boolean DEFAULT true,
	"include_test_module" boolean DEFAULT true,
	"include_ascension_module" boolean DEFAULT true,
	"module_data" jsonb NOT NULL,
	"icon_path" text DEFAULT '/assets/icons/default-module.svg',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "generated_trainings" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"tagline" text,
	"source" varchar(32) DEFAULT 'prompt' NOT NULL,
	"source_info" jsonb DEFAULT '{}'::jsonb,
	"audience" varchar(64) DEFAULT 'grand_public' NOT NULL,
	"gamification_level" varchar(16) DEFAULT 'medium' NOT NULL,
	"content" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "investigation_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"user_name" varchar(255) NOT NULL,
	"game_id" varchar(255) NOT NULL,
	"current_level" varchar(100) DEFAULT 'Débutant' NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"best_score" integer DEFAULT 0 NOT NULL,
	"completed_scenarios" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"last_feedback" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"last_updated" timestamp DEFAULT now() NOT NULL,
	"session_id" varchar(255) NOT NULL,
	"notes" text DEFAULT '',
	"evaluation_data" jsonb DEFAULT 'null'::jsonb,
	"last_played" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "llm_cache" (
	"id" serial PRIMARY KEY NOT NULL,
	"cache_key" varchar(64) NOT NULL,
	"domain" varchar(100) NOT NULL,
	"prompt" text NOT NULL,
	"response" text NOT NULL,
	"hits" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp,
	CONSTRAINT "llm_cache_cache_key_unique" UNIQUE("cache_key")
);
--> statement-breakpoint
CREATE TABLE "llm_usage" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"username" varchar(255) NOT NULL,
	"model" varchar(100) NOT NULL,
	"feature" varchar(100) NOT NULL,
	"prompt_tokens" integer DEFAULT 0 NOT NULL,
	"completion_tokens" integer DEFAULT 0 NOT NULL,
	"total_tokens" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sso_config" (
	"id" serial PRIMARY KEY NOT NULL,
	"provider" varchar(50) DEFAULT 'azure' NOT NULL,
	"client_id" varchar(255) NOT NULL,
	"client_secret" varchar(512) NOT NULL,
	"tenant_id" varchar(255),
	"discovery_url" varchar(512),
	"callback_url" varchar(512) NOT NULL,
	"is_enabled" boolean DEFAULT false NOT NULL,
	"allowed_domains" text[] DEFAULT '{}' NOT NULL,
	"auto_create_users" boolean DEFAULT true NOT NULL,
	"default_role" varchar(50) DEFAULT 'user' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_learning_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"user_name" varchar(255) NOT NULL,
	"module_id" varchar(255) NOT NULL,
	"xp" integer DEFAULT 0 NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"completed_levels" text[] DEFAULT '{}' NOT NULL,
	"badges" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"stats" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"rank" varchar(100) DEFAULT 'Débutant' NOT NULL,
	"last_updated" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"display_name" varchar(255),
	"email" varchar(255),
	"avatar_url" text,
	"role" varchar(100) DEFAULT 'utilisateur',
	"job_title" varchar(255),
	"department" varchar(255),
	"preferences" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(255) NOT NULL,
	"password" varchar(255),
	"email" varchar(255),
	"first_name" varchar(255),
	"last_name" varchar(255),
	"bio" text,
	"profile_image_url" varchar(255),
	"role" varchar(50) DEFAULT 'user' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login" timestamp,
	"modules_enabled" jsonb DEFAULT '["cyber","data","amoa","formation-data","evaluation","playground"]'::jsonb,
	"token_quota" integer DEFAULT 100000,
	"token_used_month" integer DEFAULT 0,
	"token_reset_at" timestamp,
	"subscription_label" varchar(100) DEFAULT 'Gratuit',
	"subscription_expires_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "assistant_conversations" ADD CONSTRAINT "assistant_conversations_assistant_id_custom_assistants_id_fk" FOREIGN KEY ("assistant_id") REFERENCES "public"."custom_assistants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assistant_conversations" ADD CONSTRAINT "assistant_conversations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_companies" ADD CONSTRAINT "client_companies_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_users" ADD CONSTRAINT "client_users_company_id_client_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."client_companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_users" ADD CONSTRAINT "client_users_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_assistants" ADD CONSTRAINT "custom_assistants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "IDX_llm_cache_key" ON "llm_cache" USING btree ("cache_key");--> statement-breakpoint
CREATE INDEX "IDX_llm_usage_user" ON "llm_usage" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "IDX_llm_usage_date" ON "llm_usage" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");