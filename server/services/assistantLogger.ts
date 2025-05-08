import { db } from '../db';
import { pgTable, serial, integer, text, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

/**
 * Table pour stocker les journaux d'opérations sur les assistants
 */
export const assistantOperationLogs = pgTable('assistant_operation_logs', {
  id: serial('id').primaryKey(),
  assistantId: integer('assistant_id'),
  templateId: integer('template_id'),
  userId: text('user_id').notNull(),  // Changé de integer à text pour Replit Auth
  operation: text('operation').notNull(),
  status: text('status').notNull(),
  details: jsonb('details').default({}),
  errorMessage: text('error_message'),
  timestamp: timestamp('timestamp').defaultNow()
});

/**
 * Enum pour les types d'opérations sur les assistants
 */
export enum AssistantOperation {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  DELETE_TEMPLATE = 'DELETE_TEMPLATE',
  PROMPT_GENERATION = 'PROMPT_GENERATION',
  CONVERSATION_START = 'CONVERSATION_START',
  CONVERSATION_END = 'CONVERSATION_END',
  MESSAGE_SENT = 'MESSAGE_SENT',
  VALIDATION_FAILURE = 'VALIDATION_FAILURE',
  USER_AUTO_CREATION = 'USER_AUTO_CREATION',
  SHARE_ACCESS_CHANGE = 'SHARE_ACCESS_CHANGE',
  DUPLICATE_DETECTION = 'DUPLICATE_DETECTION'
}

/**
 * Enum pour les statuts des opérations
 */
export enum LogStatus {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
  WARNING = 'WARNING'
}

/**
 * Interface pour les données de journalisation
 */
export interface AssistantLog {
  assistantId?: number;
  templateId?: number;
  userId: string; // Changé de number à string pour Replit Auth
  operation: AssistantOperation;
  status: LogStatus;
  details?: Record<string, any>;
  errorMessage?: string;
}

/**
 * Journalise une opération sur un assistant
 */
export async function logAssistantOperation(logData: AssistantLog): Promise<void> {
  try {
    await db.insert(assistantOperationLogs).values({
      assistantId: logData.assistantId,
      templateId: logData.templateId,
      userId: logData.userId,
      operation: logData.operation,
      status: logData.status,
      details: logData.details ? JSON.stringify(logData.details) : null,
      errorMessage: logData.errorMessage,
      timestamp: new Date()
    });
  } catch (error) {
    // En cas d'erreur, on ne bloque pas l'opération principale, on log en console
    console.error('Erreur lors de la journalisation de l\'opération:', error);
  }
}

/**
 * Récupère les logs d'opérations pour un assistant spécifique
 */
export async function getAssistantLogs(assistantId: number): Promise<any[]> {
  return db.select()
    .from(assistantOperationLogs)
    .where(sql`assistant_id = ${assistantId}`)
    .orderBy(sql`timestamp DESC`)
    .limit(100);
}

/**
 * Récupère les logs d'opérations pour un utilisateur spécifique
 */
export async function getUserAssistantLogs(userId: string): Promise<any[]> {
  return db.select()
    .from(assistantOperationLogs)
    .where(sql`user_id = ${userId}`)
    .orderBy(sql`timestamp DESC`)
    .limit(100);
}

/**
 * Récupère les erreurs récurrentes pour identifier des problèmes potentiels
 */
export async function getRecurringErrors(): Promise<any> {
  const recentErrorLogs = await db.select({
    errorMessage: assistantOperationLogs.errorMessage,
    operation: assistantOperationLogs.operation,
    count: sql<number>`count(*)`.as('count')
  })
  .from(assistantOperationLogs)
  .where(sql`status = 'FAILURE' AND timestamp > NOW() - INTERVAL '24 hours'`)
  .groupBy(assistantOperationLogs.errorMessage, assistantOperationLogs.operation)
  .having(sql`count(*) > 5`)
  .orderBy(sql`count DESC`);
  
  return {
    recentErrorLogs,
    totalErrorCount: recentErrorLogs.reduce((sum, log) => sum + log.count, 0)
  };
}