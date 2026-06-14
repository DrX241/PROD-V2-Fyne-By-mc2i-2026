// Migration: Studio Formation tables
// Run: DATABASE_URL='...' node migrations/studio_formation.cjs

const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS training_paths (
        id SERIAL PRIMARY KEY,
        company_id INTEGER NOT NULL REFERENCES client_companies(id) ON DELETE CASCADE,
        created_by INTEGER REFERENCES client_users(id),
        title TEXT NOT NULL,
        description TEXT,
        cover_color TEXT DEFAULT '#246f9f',
        cover_emoji TEXT DEFAULT '🎓',
        status TEXT NOT NULL DEFAULT 'draft',
        is_mandatory BOOLEAN NOT NULL DEFAULT false,
        certification_min_score INTEGER NOT NULL DEFAULT 70,
        estimated_minutes INTEGER DEFAULT 30,
        tags TEXT[] DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS training_modules (
        id SERIAL PRIMARY KEY,
        path_id INTEGER NOT NULL REFERENCES training_paths(id) ON DELETE CASCADE,
        position INTEGER NOT NULL DEFAULT 0,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        content JSONB NOT NULL DEFAULT '{}',
        is_certification BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS training_assignments (
        id SERIAL PRIMARY KEY,
        path_id INTEGER NOT NULL REFERENCES training_paths(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES client_users(id) ON DELETE CASCADE,
        assigned_by INTEGER REFERENCES client_users(id),
        due_date DATE,
        is_mandatory BOOLEAN NOT NULL DEFAULT false,
        assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(path_id, user_id)
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS training_progress (
        id SERIAL PRIMARY KEY,
        path_id INTEGER NOT NULL REFERENCES training_paths(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES client_users(id) ON DELETE CASCADE,
        module_id INTEGER REFERENCES training_modules(id) ON DELETE SET NULL,
        status TEXT NOT NULL DEFAULT 'not_started',
        score INTEGER,
        answers JSONB,
        started_at TIMESTAMPTZ,
        completed_at TIMESTAMPTZ,
        UNIQUE(path_id, user_id, module_id)
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS training_certifications (
        id SERIAL PRIMARY KEY,
        path_id INTEGER NOT NULL REFERENCES training_paths(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES client_users(id) ON DELETE CASCADE,
        score INTEGER NOT NULL,
        passed BOOLEAN NOT NULL,
        answers JSONB,
        certified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(path_id, user_id)
      );
    `);

    await client.query('COMMIT');
    console.log('✅ Studio Formation tables created');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
