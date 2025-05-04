const { exec } = require('child_process');
const { Pool } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Configuration
const dbUrl = process.env.DATABASE_URL;

async function main() {
  console.log('Creating schema...');
  
  // Connexion à la base de données
  const pool = new Pool({ connectionString: dbUrl });
  
  try {
    // Création des énumérations
    await pool.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'assistant_personality') THEN
          CREATE TYPE assistant_personality AS ENUM ('professionnel', 'amical', 'direct', 'expert', 'pédagogique', 'mentor');
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'assistant_domain') THEN
          CREATE TYPE assistant_domain AS ENUM ('cybersecurite', 'gestion_projet', 'amoa', 'developpement', 'data_ia', 'conseil', 'general');
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gamification_level') THEN
          CREATE TYPE gamification_level AS ENUM ('aucun', 'leger', 'modere', 'eleve', 'intense');
        END IF;
      END $$;
    `);
    
    console.log('Enums created successfully');
    
    // Création de la table users si elle n'existe pas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      );
    `);
    
    // Création de la table user_profiles
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        display_name VARCHAR(255),
        email VARCHAR(255),
        avatar_url TEXT,
        role VARCHAR(100) DEFAULT 'utilisateur',
        job_title VARCHAR(255),
        department VARCHAR(255),
        preferences JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // Création de la table custom_assistants
    await pool.query(`
      CREATE TABLE IF NOT EXISTS custom_assistants (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        system_prompt TEXT NOT NULL,
        personality assistant_personality NOT NULL,
        domain assistant_domain NOT NULL,
        expertise TEXT[],
        avatar_style VARCHAR(100) DEFAULT 'robot',
        avatar_color VARCHAR(50) DEFAULT 'violet',
        gamification_level gamification_level DEFAULT 'leger',
        custom_instructions JSONB DEFAULT '{}',
        is_public BOOLEAN DEFAULT false,
        is_verified BOOLEAN DEFAULT false,
        usage_count INTEGER DEFAULT 0,
        rating INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // Création de la table assistant_conversations
    await pool.query(`
      CREATE TABLE IF NOT EXISTS assistant_conversations (
        id SERIAL PRIMARY KEY,
        assistant_id INTEGER NOT NULL REFERENCES custom_assistants(id),
        user_id INTEGER NOT NULL REFERENCES users(id),
        title VARCHAR(255) DEFAULT 'Nouvelle conversation',
        messages JSONB DEFAULT '[]',
        settings JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        last_message_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // Création de la table assistant_templates
    await pool.query(`
      CREATE TABLE IF NOT EXISTS assistant_templates (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100) NOT NULL,
        system_prompt TEXT NOT NULL,
        personality assistant_personality NOT NULL,
        domain assistant_domain NOT NULL,
        expertise TEXT[],
        avatar_style VARCHAR(100) DEFAULT 'robot',
        avatar_color VARCHAR(50) DEFAULT 'violet',
        gamification_level gamification_level DEFAULT 'leger',
        custom_instructions JSONB DEFAULT '{}',
        is_official BOOLEAN DEFAULT true,
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // Création de la table user_learning_progress
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_learning_progress (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        user_name VARCHAR(255) NOT NULL,
        module_id VARCHAR(255) NOT NULL,
        xp INTEGER NOT NULL DEFAULT 0,
        level INTEGER NOT NULL DEFAULT 1,
        completed_levels TEXT[] NOT NULL DEFAULT '{}',
        badges JSONB NOT NULL DEFAULT '[]',
        stats JSONB NOT NULL DEFAULT '[]',
        rank VARCHAR(100) NOT NULL DEFAULT 'Débutant',
        last_updated TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    
    // Création de la table investigation_progress
    await pool.query(`
      CREATE TABLE IF NOT EXISTS investigation_progress (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        user_name VARCHAR(255) NOT NULL,
        game_id VARCHAR(255) NOT NULL,
        current_level VARCHAR(100) NOT NULL DEFAULT 'Débutant',
        score INTEGER NOT NULL DEFAULT 0,
        best_score INTEGER NOT NULL DEFAULT 0,
        completed_scenarios JSONB NOT NULL DEFAULT '[]',
        attempts INTEGER NOT NULL DEFAULT 0,
        last_feedback JSONB NOT NULL DEFAULT '{}',
        last_updated TIMESTAMP NOT NULL DEFAULT NOW(),
        session_id VARCHAR(255) NOT NULL,
        notes TEXT DEFAULT '',
        evaluation_data JSONB DEFAULT NULL,
        last_played TIMESTAMP DEFAULT NOW()
      );
    `);
    
    console.log('Tables created successfully');
    
    // Insertion de données initiales pour les modèles d'assistants
    await pool.query(`
      INSERT INTO assistant_templates (
        name, description, category, system_prompt, personality, domain, expertise, 
        avatar_style, avatar_color, gamification_level, is_official, display_order
      ) VALUES 
      (
        'Expert Cybersécurité', 
        'Un assistant spécialisé en cybersécurité pour vous aider à comprendre les menaces et protéger vos systèmes.',
        'Sécurité',
        'Vous êtes un expert en cybersécurité avec une connaissance approfondie des menaces, vulnérabilités et bonnes pratiques de sécurité. Votre objectif est d''aider l''utilisateur à comprendre les risques cybernétiques et à mettre en place des mesures de protection adaptées. Vous donnez des conseils précis et actualisés, avec des exemples concrets. Vous pouvez également proposer des mini-jeux ou des défis pour tester les connaissances de l''utilisateur.',
        'expert',
        'cybersecurite',
        ARRAY['pentest', 'analyse de vulnérabilités', 'sécurité des réseaux', 'gouvernance'],
        'cyborg',
        'blue',
        'modere',
        true,
        10
      ),
      (
        'Coach AMOA', 
        'Un assistant qui vous accompagne dans vos missions d''assistance à maîtrise d''ouvrage avec conseils pratiques et méthodologies.',
        'Métiers',
        'Vous êtes un coach spécialisé en Assistance à Maîtrise d''Ouvrage (AMOA) avec une solide expérience dans la gestion de projets informatiques. Votre objectif est d''aider l''utilisateur à améliorer ses compétences en AMOA, à comprendre son rôle d''interface entre métiers et techniques, et à utiliser les meilleures méthodologies. Vous proposez des conseils concrets, des exemples de livrables, et des approches adaptées au contexte de l''utilisateur.',
        'mentor',
        'amoa',
        ARRAY['analyse des besoins', 'gestion d''exigences', 'cahier des charges', 'recette fonctionnelle'],
        'professional',
        'purple',
        'leger',
        true,
        20
      ),
      (
        'Tuteur JavaScript', 
        'Un assistant dédié à l''apprentissage du JavaScript avec des explications pédagogiques et des exercices pratiques.',
        'Tech',
        'Vous êtes un tuteur spécialisé en JavaScript et technologies web modernes. Votre mission est d''aider l''utilisateur à progresser dans sa maîtrise du JavaScript, de ses frameworks et bibliothèques. Vous fournissez des explications pédagogiques adaptées au niveau de l''utilisateur, des exemples de code, des exercices pratiques et des défis à réaliser. Vous encouragez la pratique et proposez des activités ludiques pour renforcer l''apprentissage.',
        'pédagogique',
        'developpement',
        ARRAY['JavaScript', 'React', 'Node.js', 'TypeScript'],
        'teacher',
        'yellow',
        'eleve',
        true,
        30
      ),
      (
        'Assistant de Projet', 
        'Un assistant qui vous aide à planifier, exécuter et suivre vos projets avec méthode et efficacité.',
        'Métiers',
        'Vous êtes un assistant spécialisé en gestion de projet, familier avec les méthodologies agiles et traditionnelles. Votre objectif est d''aider l''utilisateur à planifier, exécuter et suivre ses projets avec efficacité. Vous proposez des conseils sur la gestion d''équipe, la planification, la gestion des risques et la communication. Vous adaptez vos recommandations au contexte spécifique du projet de l''utilisateur.',
        'professionnel',
        'gestion_projet',
        ARRAY['méthodologies agiles', 'planification', 'gestion d''équipe', 'gestion des risques'],
        'professional',
        'green',
        'modere',
        true,
        40
      ),
      (
        'Coach Data Science', 
        'Un assistant pour vous guider dans vos projets de data science et d''intelligence artificielle.',
        'Tech',
        'Vous êtes un coach spécialisé en Data Science et Intelligence Artificielle. Votre mission est d''aider l''utilisateur à comprendre et appliquer les concepts et techniques d''analyse de données, de machine learning et d''IA. Vous fournissez des explications claires sur les algorithmes, les méthodologies et les outils. Vous guidez l''utilisateur dans ses projets de data en proposant des approches structurées et des bonnes pratiques.',
        'expert',
        'data_ia',
        ARRAY['machine learning', 'analyse de données', 'visualisation', 'deep learning'],
        'scientist',
        'blue',
        'modere',
        true,
        50
      )
      ON CONFLICT DO NOTHING;
    `);
    
    console.log('Initial data inserted successfully');
    
  } catch (err) {
    console.error('Error creating schema:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
  
  console.log('Schema creation completed');
}

main().catch(console.error);