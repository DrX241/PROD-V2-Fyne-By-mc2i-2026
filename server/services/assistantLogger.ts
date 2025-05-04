import { db } from '../db';
import { pgTable, serial, text, timestamp, integer, jsonb } from 'drizzle-orm/pg-core';
import * as schema from '@shared/schema';
import { eq, desc } from 'drizzle-orm';

// Table pour stocker les journaux des opérations liées aux assistants
export const assistantOperationLogs = pgTable('assistant_operation_logs', {
  id: serial('id').primaryKey(),
  assistantId: integer('assistant_id'),
  userId: integer('user_id').notNull(),
  operation: text('operation').notNull(), // CREATE, UPDATE, DELETE, PROMPT_GENERATION, CONVERSATION_START, etc.
  status: text('status').notNull(), // SUCCESS, FAILURE, WARNING
  details: jsonb('details').default({}),
  errorMessage: text('error_message'),
  timestamp: timestamp('timestamp').defaultNow()
});

// Types d'opérations disponibles pour le journal
export enum AssistantOperation {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  PROMPT_GENERATION = 'PROMPT_GENERATION',
  CONVERSATION_START = 'CONVERSATION_START',
  CONVERSATION_END = 'CONVERSATION_END',
  MESSAGE_SENT = 'MESSAGE_SENT',
  VALIDATION_FAILURE = 'VALIDATION_FAILURE',
  USER_AUTO_CREATION = 'USER_AUTO_CREATION'
}

// Statuts possibles pour les entrées du journal
export enum LogStatus {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
  WARNING = 'WARNING'
}

// Interface pour l'objet de log
export interface AssistantLog {
  assistantId?: number;
  userId: number;
  operation: AssistantOperation;
  status: LogStatus;
  details?: Record<string, any>;
  errorMessage?: string;
}

// Fonction pour ajouter une entrée au journal
export async function logAssistantOperation(logData: AssistantLog): Promise<void> {
  try {
    const insertData = {
      assistantId: logData.assistantId,
      userId: logData.userId,
      operation: logData.operation,
      status: logData.status,
      details: logData.details || {},
      errorMessage: logData.errorMessage
    };
    
    await db.insert(assistantOperationLogs).values([insertData]);
    
    // Journalisation console pour déboggage
    const logLevel = logData.status === LogStatus.SUCCESS ? 'info' : 
                    logData.status === LogStatus.WARNING ? 'warn' : 'error';
    
    const message = `[${logData.operation}] - ${logData.status}${logData.assistantId ? ` - Assistant #${logData.assistantId}` : ''} - User #${logData.userId}`;
    
    if (logLevel === 'info') {
      console.info(message, logData.details);
    } else if (logLevel === 'warn') {
      console.warn(message, logData.details, logData.errorMessage);
    } else {
      console.error(message, logData.details, logData.errorMessage);
    }
  } catch (error) {
    // Même si la journalisation échoue, nous ne voulons pas que cela perturbe le flux principal
    console.error('Erreur lors de la journalisation d\'une opération d\'assistant:', error);
  }
}

// Fonction pour obtenir l'historique des actions d'un assistant
export async function getAssistantLogs(assistantId: number): Promise<any[]> {
  return db.select().from(assistantOperationLogs)
    .where(eq(assistantOperationLogs.assistantId, assistantId))
    .orderBy(desc(assistantOperationLogs.timestamp))
    .limit(100);
}

// Fonction pour obtenir l'historique des actions d'un utilisateur
export async function getUserAssistantLogs(userId: number): Promise<any[]> {
  return db.select().from(assistantOperationLogs)
    .where(eq(assistantOperationLogs.userId, userId))
    .orderBy(desc(assistantOperationLogs.timestamp))
    .limit(100);
}

// Fonction pour analyser les erreurs récurrentes
export async function getRecurringErrors(): Promise<any> {
  // Solution simplifiée sans groupBy et count pour contourner les erreurs de typage
  const logs = await db.select({
    errorMessage: assistantOperationLogs.errorMessage
  })
  .from(assistantOperationLogs)
  .where(eq(assistantOperationLogs.status, LogStatus.FAILURE))
  .limit(100);
  
  // Faire l'agrégation manuellement
  const errorCounts: Record<string, number> = {};
  logs.forEach(log => {
    if (log.errorMessage) {
      errorCounts[log.errorMessage] = (errorCounts[log.errorMessage] || 0) + 1;
    }
  });
  
  // Convertir en tableau et trier
  const result = Object.entries(errorCounts)
    .map(([errorMessage, count]) => ({ errorMessage, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  
  return result;
}