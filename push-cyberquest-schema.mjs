import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Configuration pour NeonDB avec WebSockets
neonConfig.webSocketConstructor = ws;
const dbUrl = process.env.DATABASE_URL;

async function main() {
  console.log('Creating CyberQuest schema...');
  
  // Connexion à la base de données
  const pool = new Pool({ connectionString: dbUrl });
  
  try {
    // Création des énumérations pour CyberQuest
    await pool.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'mission_type') THEN
          CREATE TYPE mission_type AS ENUM ('main_story', 'side_quest', 'daily', 'investigation', 'emergency', 'training');
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'mission_difficulty') THEN
          CREATE TYPE mission_difficulty AS ENUM ('trainee', 'junior', 'intermediate', 'senior', 'expert', 'master');
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'environment_type') THEN
          CREATE TYPE environment_type AS ENUM ('headquarters', 'city', 'corporate', 'datacenter', 'blackmarket', 'darkweb');
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'item_type') THEN
          CREATE TYPE item_type AS ENUM ('tool', 'software', 'hardware', 'consumable', 'key', 'document');
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'skill_category') THEN
          CREATE TYPE skill_category AS ENUM ('technical', 'social', 'investigation', 'hacking', 'defense', 'analysis');
        END IF;
      END $$;
    `);
    
    console.log('CyberQuest enums created successfully');
    
    // Création de la table cyber_quest_players
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cyber_quest_players (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        user_name TEXT NOT NULL,
        character_name TEXT,
        level INTEGER NOT NULL DEFAULT 1,
        experience INTEGER NOT NULL DEFAULT 0,
        credits INTEGER NOT NULL DEFAULT 500,
        reputation INTEGER NOT NULL DEFAULT 0,
        intelligence INTEGER NOT NULL DEFAULT 5,
        perception INTEGER NOT NULL DEFAULT 5,
        charisma INTEGER NOT NULL DEFAULT 5,
        technical_knowledge INTEGER NOT NULL DEFAULT 5,
        attribute_points INTEGER NOT NULL DEFAULT 0,
        skill_points INTEGER NOT NULL DEFAULT 0,
        missions_completed INTEGER NOT NULL DEFAULT 0,
        challenges_completed INTEGER NOT NULL DEFAULT 0,
        play_time INTEGER NOT NULL DEFAULT 0,
        unlocked_environments JSONB DEFAULT '[1]',
        inventory JSONB DEFAULT '[]',
        last_saved TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    
    // Création de la table cyber_quest_environments
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cyber_quest_environments (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        type environment_type NOT NULL,
        required_level INTEGER DEFAULT 1,
        required_reputation INTEGER DEFAULT 0,
        required_missions JSONB,
        background_image TEXT,
        is_active BOOLEAN DEFAULT true,
        connections JSONB,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    
    // Création de la table cyber_quest_missions
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cyber_quest_missions (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        type mission_type NOT NULL,
        difficulty mission_difficulty NOT NULL,
        required_level INTEGER,
        experience_reward INTEGER NOT NULL,
        credit_reward INTEGER NOT NULL,
        reputation_reward INTEGER NOT NULL,
        item_rewards JSONB,
        objectives JSONB NOT NULL,
        time_limit INTEGER,
        is_story BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        prerequisite_missions JSONB,
        environment_id INTEGER NOT NULL,
        npc_id INTEGER,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    
    // Création de la table cyber_quest_npcs
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cyber_quest_npcs (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        description TEXT NOT NULL,
        environment_id INTEGER NOT NULL REFERENCES cyber_quest_environments(id),
        avatar_image TEXT,
        dialogues JSONB NOT NULL,
        shop JSONB,
        missions JSONB,
        relationship_level INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    
    // Création de la table cyber_quest_skills
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cyber_quest_skills (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        category skill_category NOT NULL,
        required_level INTEGER DEFAULT 1,
        cost INTEGER NOT NULL,
        max_level INTEGER NOT NULL DEFAULT 5,
        effects JSONB NOT NULL,
        icon TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    
    // Création de la table cyber_quest_items
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cyber_quest_items (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        type item_type NOT NULL,
        value INTEGER NOT NULL,
        effects JSONB,
        required_level INTEGER DEFAULT 1,
        required_skill INTEGER,
        icon TEXT,
        is_consumable BOOLEAN DEFAULT false,
        max_quantity INTEGER DEFAULT 1,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    
    // Création de la table cyber_quest_player_missions
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cyber_quest_player_missions (
        id SERIAL PRIMARY KEY,
        player_id INTEGER NOT NULL REFERENCES cyber_quest_players(id),
        mission_id INTEGER NOT NULL REFERENCES cyber_quest_missions(id),
        status TEXT NOT NULL DEFAULT 'active',
        started_at TIMESTAMP DEFAULT NOW() NOT NULL,
        completed_at TIMESTAMP,
        completed_objectives JSONB NOT NULL DEFAULT '[]',
        attempts INTEGER NOT NULL DEFAULT 1,
        time_spent INTEGER NOT NULL DEFAULT 0
      );
    `);
    
    // Création de la table cyber_quest_player_skills
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cyber_quest_player_skills (
        id SERIAL PRIMARY KEY,
        player_id INTEGER NOT NULL REFERENCES cyber_quest_players(id),
        skill_id INTEGER NOT NULL REFERENCES cyber_quest_skills(id),
        level INTEGER NOT NULL DEFAULT 1,
        experience INTEGER NOT NULL DEFAULT 0,
        usage_count INTEGER NOT NULL DEFAULT 0,
        purchased_at TIMESTAMP DEFAULT NOW() NOT NULL,
        last_upgraded TIMESTAMP
      );
    `);
    
    // Création de la table cyber_quest_player_inventory
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cyber_quest_player_inventory (
        id SERIAL PRIMARY KEY,
        player_id INTEGER NOT NULL REFERENCES cyber_quest_players(id),
        item_id INTEGER NOT NULL REFERENCES cyber_quest_items(id),
        quantity INTEGER NOT NULL DEFAULT 1,
        equipped BOOLEAN DEFAULT false,
        purchased_at TIMESTAMP DEFAULT NOW() NOT NULL,
        used_count INTEGER DEFAULT 0
      );
    `);
    
    // Création de la table cyber_quest_player_journal
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cyber_quest_player_journal (
        id SERIAL PRIMARY KEY,
        player_id INTEGER NOT NULL REFERENCES cyber_quest_players(id),
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'info',
        related_mission_id INTEGER,
        related_environment_id INTEGER,
        discovered BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    
    // Insertion de données initiales - Environnement QG
    await pool.query(`
      INSERT INTO cyber_quest_environments (
        id, name, description, type, required_level, connections
      ) VALUES (
        1, 
        'Quartier Général de la Cyber-Agence', 
        'Le centre d''opérations de la Cyber-Agence où les agents reçoivent leurs briefings, s''entraînent et préparent leurs missions.',
        'headquarters',
        1,
        '[{"name": "Centre-Ville", "environmentId": 2, "locked": true, "requiredLevel": 3}]'::jsonb
      )
      ON CONFLICT (id) DO NOTHING;
    `);
    
    console.log('CyberQuest tables and initial data created successfully');
    
  } catch (err) {
    console.error('Error creating CyberQuest schema:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
  
  console.log('CyberQuest schema creation completed');
}

main().catch(console.error);