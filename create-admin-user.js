import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Configuration pour NeonDB avec WebSockets
neonConfig.webSocketConstructor = ws;
const dbUrl = process.env.DATABASE_URL;

async function main() {
  console.log('Creating admin user...');
  
  // Connexion à la base de données
  const pool = new Pool({ connectionString: dbUrl });
  
  try {
    // Récupérer la configuration système pour obtenir le nom d'utilisateur admin
    const configResult = await pool.query(`
      SELECT * FROM system_configuration LIMIT 1;
    `);
    
    if (configResult.rows.length === 0) {
      console.error('Aucune configuration trouvée!');
      process.exit(1);
    }
    
    const config = configResult.rows[0];
    const adminUsername = config.super_admin_username;
    
    // Vérifier si l'utilisateur existe déjà
    const userResult = await pool.query(`
      SELECT * FROM users WHERE username = $1;
    `, [adminUsername]);
    
    if (userResult.rows.length > 0) {
      console.log(`L'utilisateur administrateur ${adminUsername} existe déjà.`);
    } else {
      // Créer l'utilisateur
      const newUserResult = await pool.query(`
        INSERT INTO users (username, password) 
        VALUES ($1, $2) 
        RETURNING id;
      `, [adminUsername, config.super_admin_password_hash]);
      
      const userId = newUserResult.rows[0].id;
      
      // Créer le profil utilisateur avec le rôle superadmin
      await pool.query(`
        INSERT INTO user_profiles (
          user_id, 
          display_name, 
          role
        ) VALUES (
          $1, 
          $2, 
          'superadmin'
        );
      `, [userId, 'Super Administrateur']);
      
      console.log(`Utilisateur super admin créé avec l'ID ${userId}`);
    }
    
    console.log('Configuration de l\'utilisateur admin terminée');
    
  } catch (err) {
    console.error('Erreur lors de la création de l\'utilisateur admin:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
  
  console.log('Création de l\'utilisateur admin terminée');
}

main().catch(console.error);