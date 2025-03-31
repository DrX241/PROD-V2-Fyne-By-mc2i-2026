import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "../shared/schema";

// Créer une pool de connexions à la base de données
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

// Créer une instance Drizzle avec le schéma
export const db = drizzle(pool, { schema });