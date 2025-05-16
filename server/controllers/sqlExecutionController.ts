import { Request, Response } from 'express';
import { pool } from '../db';

/**
 * Exécute une requête SQL et renvoie les résultats
 * @param req La requête HTTP avec un paramètre 'query' contenant la requête SQL
 * @param res La réponse HTTP
 */
export async function executeSQL(req: Request, res: Response) {
  const { query } = req.body;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Une requête SQL valide est requise' });
  }

  try {
    // Vérifications de sécurité de base pour éviter les requêtes destructrices
    const lowerQuery = query.toLowerCase();
    
    // Bloquer les requêtes qui modifient la structure de la base de données
    if (
      lowerQuery.includes('drop database') ||
      lowerQuery.includes('drop schema') ||
      lowerQuery.includes('truncate database') ||
      lowerQuery.includes('alter database')
    ) {
      return res.status(403).json({ 
        error: 'Les opérations sur la base de données ne sont pas autorisées dans l\'environnement d\'apprentissage' 
      });
    }

    // Limiter les opérations d'écriture pour des raisons de sécurité dans l'environnement d'apprentissage
    const isWriteOperation = 
      lowerQuery.includes('insert into') || 
      lowerQuery.includes('update ') || 
      lowerQuery.includes('delete from') ||
      lowerQuery.includes('drop table') ||
      lowerQuery.includes('alter table') ||
      lowerQuery.includes('create table');

    // Pour les opérations d'écriture, mettre en place des mesures de sécurité supplémentaires
    if (isWriteOperation) {
      // Option 1: Bloquer complètement ces opérations (décommenter pour activer)
      // return res.status(403).json({ 
      //   error: 'Les opérations d\'écriture ne sont pas autorisées dans l\'environnement d\'apprentissage' 
      // });
      
      // Option 2: Limiter à des tables test_ spécifiques
      const isTargetingSafeTable = 
        lowerQuery.includes('test_') || 
        lowerQuery.includes('temp_') || 
        lowerQuery.includes('exercice_');
      
      if (!isTargetingSafeTable) {
        return res.status(403).json({ 
          error: 'Les opérations d\'écriture ne sont autorisées que sur les tables préfixées par test_, temp_ ou exercice_' 
        });
      }
    }

    // Exécuter la requête
    const result = await pool.query(query);
    
    // Adapter la réponse en fonction du type de requête
    if (result.command === 'SELECT') {
      return res.status(200).json({
        columns: result.fields.map(field => field.name),
        rows: result.rows,
        rowCount: result.rowCount
      });
    } else {
      // Pour les autres types de requêtes (INSERT, UPDATE, etc.)
      return res.status(200).json({
        message: `Opération réussie: ${result.command} (${result.rowCount} lignes affectées)`,
        command: result.command,
        rowCount: result.rowCount
      });
    }
  } catch (error: any) {
    console.error('Erreur SQL:', error);
    return res.status(400).json({ 
      error: `Erreur lors de l'exécution de la requête SQL: ${error.message}` 
    });
  }
}