import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import mapEnvironmentVariables from "./config/env-mapping";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Middleware pour forcer le Content-Type JSON pour les routes API
app.use('/api', (req, res, next) => {
  // S'assurer que toutes les réponses API sont en JSON
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Mapper les variables d'environnement
  mapEnvironmentVariables();

  // Migration auto: créer les tables si elles n'existent pas
  try {
    const { pool } = await import('./db');
    await pool.query(`
      DO $$ BEGIN CREATE TYPE difficulty_level AS ENUM('beginner','intermediate','advanced'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
      DO $$ BEGIN CREATE TYPE gamification_level AS ENUM('aucun','leger','modere','eleve','intense'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
      DO $$ BEGIN CREATE TYPE learning_style AS ENUM('reading','interactive','mixed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
      CREATE TABLE IF NOT EXISTS custom_modules (
        id serial PRIMARY KEY,
        user_id varchar(255) NOT NULL,
        user_name varchar(255) NOT NULL,
        name varchar(255) NOT NULL,
        domain varchar(100) NOT NULL,
        description text NOT NULL,
        iam_name varchar(255) NOT NULL,
        display_order integer DEFAULT 100,
        difficulty difficulty_level DEFAULT 'intermediate',
        topics text[] NOT NULL DEFAULT '{}',
        gamification_level gamification_level DEFAULT 'leger',
        learning_style learning_style DEFAULT 'mixed',
        include_trainer_module boolean DEFAULT true,
        include_ops_module boolean DEFAULT true,
        include_test_module boolean DEFAULT true,
        include_ascension_module boolean DEFAULT true,
        module_data jsonb NOT NULL,
        icon_path text DEFAULT '/assets/icons/default-module.svg',
        is_active boolean DEFAULT true,
        created_at timestamp DEFAULT now(),
        updated_at timestamp DEFAULT now()
      );
      ALTER TABLE custom_modules ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT FALSE;
      CREATE TABLE IF NOT EXISTS module_company_assignments (
        id SERIAL PRIMARY KEY,
        module_id INTEGER NOT NULL REFERENCES custom_modules(id) ON DELETE CASCADE,
        company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        assigned_by INTEGER REFERENCES users(id),
        assigned_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(module_id, company_id)
      );
    `);
    console.log('[boot] custom_modules table ready');
  } catch (e: any) {
    console.error('[boot] migration warning:', e.message);
  }

  const server = await registerRoutes(app);


  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error('Server error:', err);
    res.status(status).json({ message });
    // Ne pas relancer l'erreur après avoir envoyé la réponse
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || '5000');
  const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1';
  server.listen({ port, host }, () => {
    log(`serving on port ${port} at http://${host}:${port}`);
  });
})();
