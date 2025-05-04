import { db } from '../db';
import { pgTable, serial, text, timestamp, integer, jsonb } from 'drizzle-orm/pg-core';
import * as schema from '@shared/schema';
import { customAssistants } from '@shared/schema';
import { eq, desc, and } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

// Table pour sauvegarder l'historique des prompts système
export const promptBackups = pgTable('prompt_backups', {
  id: serial('id').primaryKey(),
  assistantId: integer('assistant_id').notNull(),
  version: integer('version').notNull(),
  prompt: text('prompt').notNull(),
  parameters: jsonb('parameters').default({}),
  created_at: timestamp('created_at').defaultNow(),
  notes: text('notes')
});

// Interface pour les paramètres du prompt
interface PromptParameters {
  name: string;
  description?: string;
  domain: string;
  personality: string;
  expertise: string;
  gamificationLevel: string;
  responseStyle?: string;
  additionalInfo?: string;
}

/**
 * Sauvegarde un prompt système avec ses paramètres
 */
export async function backupPrompt(
  assistantId: number, 
  prompt: string, 
  parameters: PromptParameters,
  notes?: string
): Promise<void> {
  try {
    // Récupérer la dernière version du prompt pour cet assistant
    const latestVersions = await db.select({ version: promptBackups.version })
      .from(promptBackups)
      .where(eq(promptBackups.assistantId, assistantId))
      .orderBy(desc(promptBackups.version))
      .limit(1);
    
    const newVersion = latestVersions.length > 0 ? latestVersions[0].version + 1 : 1;
    
    // Sauvegarder dans la base de données
    await db.insert(promptBackups).values([{
      assistantId,
      version: newVersion,
      prompt,
      parameters,
      notes
    }]);
    
    // Également sauvegarder dans un fichier pour plus de sécurité
    try {
      const backupDir = path.join(process.cwd(), 'backup', 'prompts');
      
      // Créer le répertoire s'il n'existe pas
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }
      
      const backupFileName = `assistant_${assistantId}_v${newVersion}_${Date.now()}.json`;
      const backupData = {
        assistantId,
        version: newVersion,
        prompt,
        parameters,
        timestamp: new Date().toISOString(),
        notes
      };
      
      fs.writeFileSync(
        path.join(backupDir, backupFileName),
        JSON.stringify(backupData, null, 2),
        'utf8'
      );
      
      console.info(`Prompt de l'assistant #${assistantId} sauvegardé avec succès (version ${newVersion})`);
    } catch (fileError) {
      // Si l'écriture du fichier échoue, on continue quand même car nous avons la sauvegarde en base de données
      console.warn(`Échec de la sauvegarde fichier du prompt pour l'assistant #${assistantId}:`, fileError);
    }
  } catch (error) {
    console.error(`Erreur lors de la sauvegarde du prompt pour l'assistant #${assistantId}:`, error);
    throw new Error(`Impossible de sauvegarder le prompt: ${(error as Error).message}`);
  }
}

/**
 * Récupère toutes les versions du prompt d'un assistant
 */
export async function getPromptHistory(assistantId: number): Promise<any[]> {
  return db.select().from(promptBackups)
    .where(eq(promptBackups.assistantId, assistantId))
    .orderBy({ version: 'desc' });
}

/**
 * Récupère une version spécifique du prompt d'un assistant
 */
export async function getPromptVersion(assistantId: number, version: number): Promise<any> {
  const [promptVersion] = await db.select().from(promptBackups)
    .where(eq(promptBackups.assistantId, assistantId))
    .where(eq(promptBackups.version, version))
    .limit(1);
  
  return promptVersion;
}

/**
 * Restaure une version antérieure d'un prompt
 */
export async function restorePromptVersion(assistantId: number, version: number): Promise<boolean> {
  try {
    // Récupérer la version du prompt à restaurer
    const [promptToRestore] = await db.select().from(promptBackups)
      .where(eq(promptBackups.assistantId, assistantId))
      .where(eq(promptBackups.version, version))
      .limit(1);
    
    if (!promptToRestore) {
      throw new Error(`Version ${version} du prompt pour l'assistant #${assistantId} introuvable`);
    }
    
    // Mettre à jour l'assistant avec l'ancien prompt
    await db.update(customAssistants)
      .set({
        systemPrompt: promptToRestore.prompt,
        updatedAt: new Date()
      })
      .where(eq(customAssistants.id, assistantId));
    
    // Créer une nouvelle version qui est une copie de l'ancienne
    await backupPrompt(
      assistantId, 
      promptToRestore.prompt, 
      promptToRestore.parameters, 
      `Restauration de la version ${version}`
    );
    
    return true;
  } catch (error) {
    console.error(`Erreur lors de la restauration du prompt v${version} pour l'assistant #${assistantId}:`, error);
    return false;
  }
}

/**
 * Exporte toutes les sauvegardes de prompts dans un fichier
 */
export async function exportAllPromptBackups(): Promise<string> {
  try {
    const allBackups = await db.select().from(promptBackups);
    
    const backupDir = path.join(process.cwd(), 'backup');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    const exportFileName = `prompt_backups_export_${Date.now()}.json`;
    const exportPath = path.join(backupDir, exportFileName);
    
    fs.writeFileSync(
      exportPath,
      JSON.stringify(allBackups, null, 2),
      'utf8'
    );
    
    return exportPath;
  } catch (error) {
    console.error('Erreur lors de l\'exportation des sauvegardes de prompts:', error);
    throw new Error(`Exportation échouée: ${(error as Error).message}`);
  }
}