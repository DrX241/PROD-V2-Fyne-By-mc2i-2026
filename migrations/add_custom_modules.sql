-- Création des enums si non existants
DO $$ BEGIN
  CREATE TYPE "difficulty_level" AS ENUM('beginner', 'intermediate', 'advanced');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "gamification_level" AS ENUM('aucun', 'leger', 'modere', 'eleve', 'intense');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "learning_style" AS ENUM('reading', 'interactive', 'mixed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Création de la table custom_modules si non existante
CREATE TABLE IF NOT EXISTS "custom_modules" (
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
