import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Configuration pour NeonDB avec WebSockets
neonConfig.webSocketConstructor = ws;
const dbUrl = process.env.DATABASE_URL;

async function main() {
  console.log('Creating system configuration tables...');
  
  // Connexion à la base de données
  const pool = new Pool({ connectionString: dbUrl });
  
  try {
    // Création de la table system_configuration
    await pool.query(`
      CREATE TABLE IF NOT EXISTS system_configuration (
        id SERIAL PRIMARY KEY,
        super_admin_username VARCHAR(255) NOT NULL UNIQUE,
        super_admin_password_hash TEXT NOT NULL,
        setup_complete BOOLEAN DEFAULT false,
        allow_external_users BOOLEAN DEFAULT true,
        security_settings JSONB DEFAULT '{"passwordMinLength": 8, "requireMFA": false, "sessionTimeoutMinutes": 60, "maxLoginAttempts": 5}',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // Vérifier si un super admin existe déjà
    const superAdminResult = await pool.query(`
      SELECT * FROM system_configuration LIMIT 1;
    `);
    
    // Si aucun super admin n'existe, créer celui par défaut
    if (superAdminResult.rows.length === 0) {
      // EMIFYNE / EMYFYNE52842580
      await pool.query(`
        INSERT INTO system_configuration (
          super_admin_username, 
          super_admin_password_hash, 
          setup_complete
        ) VALUES (
          'EMIFYNE', 
          '$2b$10$pUv.YksQ3sKT7TnxzYXGvO.DlKXh3GQS5B7AQvOCw5H7v8SWQCDIm', 
          true
        );
      `);
      console.log('Default super admin created');
    } else {
      console.log('Super admin already exists');
    }
    
    // Création des tables d'analytique
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usage_stats (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        user_name VARCHAR(255) NOT NULL,
        module_id VARCHAR(255) NOT NULL,
        module_name VARCHAR(255) NOT NULL,
        session_id VARCHAR(255) NOT NULL,
        session_start TIMESTAMP NOT NULL,
        session_end TIMESTAMP,
        duration_seconds INTEGER,
        actions JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS token_usage (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        user_name VARCHAR(255) NOT NULL,
        module_id VARCHAR(255) NOT NULL,
        model VARCHAR(100) NOT NULL,
        prompt_tokens INTEGER NOT NULL,
        completion_tokens INTEGER NOT NULL,
        total_tokens INTEGER NOT NULL,
        request_type VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // Création des tables pour les modules d'application et les accès temporaires
    await pool.query(`
      CREATE TABLE IF NOT EXISTS application_modules (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        display_name VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100) NOT NULL,
        path VARCHAR(255) NOT NULL UNIQUE,
        icon VARCHAR(100),
        is_public BOOLEAN DEFAULT false,
        required_role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS temporary_accesses (
        id SERIAL PRIMARY KEY,
        invitation_code UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
        email VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'tester',
        status VARCHAR(50) DEFAULT 'active',
        created_by INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        expires_at TIMESTAMP NOT NULL,
        last_login TIMESTAMP,
        access_count INTEGER DEFAULT 0,
        notes TEXT
      );
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS temporary_access_modules (
        id SERIAL PRIMARY KEY,
        temporary_access_id INTEGER NOT NULL,
        module_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (temporary_access_id) REFERENCES temporary_accesses(id),
        FOREIGN KEY (module_id) REFERENCES application_modules(id)
      );
    `);
    
    console.log('System configuration tables created successfully');
    
  } catch (err) {
    console.error('Error creating system configuration tables:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
  
  console.log('System configuration setup completed');
}

main().catch(console.error);