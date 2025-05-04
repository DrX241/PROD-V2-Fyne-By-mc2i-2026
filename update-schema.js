import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Configuration pour Neon PostgreSQL
neonConfig.webSocketConstructor = ws;
const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error("DATABASE_URL environment variable is not set");
  process.exit(1);
}

async function main() {
  console.log('Updating database schema...');
  
  // Connexion à la base de données
  const pool = new Pool({ connectionString: dbUrl });
  
  try {
    // Créer l'énumération share_access si elle n'existe pas
    await pool.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'share_access') THEN
          CREATE TYPE share_access AS ENUM ('private', 'readOnly', 'editable');
        END IF;
      END $$;
    `);
    
    console.log('share_access enum created successfully');
    
    // Ajouter les nouvelles colonnes à la table custom_assistants
    await pool.query(`
      DO $$ 
      BEGIN
        -- Vérifier et ajouter la colonne share_access
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'custom_assistants' AND column_name = 'share_access') THEN
          ALTER TABLE custom_assistants ADD COLUMN share_access share_access DEFAULT 'private';
        END IF;
        
        -- Vérifier et ajouter la colonne share_link
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'custom_assistants' AND column_name = 'share_link') THEN
          ALTER TABLE custom_assistants ADD COLUMN share_link TEXT;
        END IF;
        
        -- Vérifier et ajouter la colonne share_link_expiration
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'custom_assistants' AND column_name = 'share_link_expiration') THEN
          ALTER TABLE custom_assistants ADD COLUMN share_link_expiration TIMESTAMP;
        END IF;
        
        -- Vérifier et ajouter la colonne owner_display_name
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'custom_assistants' AND column_name = 'owner_display_name') THEN
          ALTER TABLE custom_assistants ADD COLUMN owner_display_name TEXT;
        END IF;
        
        -- Vérifier et ajouter la colonne is_template
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'custom_assistants' AND column_name = 'is_template') THEN
          ALTER TABLE custom_assistants ADD COLUMN is_template BOOLEAN DEFAULT FALSE;
        END IF;
        
        -- Vérifier et ajouter la colonne branding_settings
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'custom_assistants' AND column_name = 'branding_settings') THEN
          ALTER TABLE custom_assistants ADD COLUMN branding_settings JSONB DEFAULT '{"primaryColor": "#3b82f6", "logoUrl": null, "fontFamily": null, "customCss": null}';
        END IF;
      END $$;
    `);
    
    console.log('Custom assistants table updated successfully');
    
    // Mettre à jour la table assistant_operation_logs si elle existe
    await pool.query(`
      DO $$ 
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'assistant_operation_logs') THEN
          -- Ajouter une colonne template_id si elle n'existe pas déjà
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                        WHERE table_name = 'assistant_operation_logs' AND column_name = 'template_id') THEN
            ALTER TABLE assistant_operation_logs ADD COLUMN template_id INTEGER;
          END IF;
        ELSE
          -- Créer la table assistant_operation_logs si elle n'existe pas
          CREATE TABLE assistant_operation_logs (
            id SERIAL PRIMARY KEY,
            assistant_id INTEGER,
            template_id INTEGER,
            user_id INTEGER NOT NULL,
            operation TEXT NOT NULL,
            status TEXT NOT NULL,
            details JSONB DEFAULT '{}',
            error_message TEXT,
            timestamp TIMESTAMP DEFAULT NOW()
          );
        END IF;
      END $$;
    `);
    
    console.log('Logger table updated successfully');
    
  } catch (err) {
    console.error('Error updating schema:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
  
  console.log('Schema update completed successfully');
}

main().catch(console.error);