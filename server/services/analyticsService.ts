import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';
import * as schema from '@shared/schema';
import { eq, and, like, count, desc, sql, gt, lt, between, SQL } from 'drizzle-orm';

/**
 * Service responsable de l'enregistrement et de la récupération des statistiques d'utilisation
 */
export class AnalyticsService {
  
  // Sessions actives (userId -> sessionId)
  private activeSessions = new Map<string, string>();
  
  // Horodatages de début de session (sessionId -> timestamp)
  private sessionStartTimes = new Map<string, number>();
  
  /**
   * Démarrer une session utilisateur
   * @param userId Identifiant de l'utilisateur
   * @param userName Nom de l'utilisateur 
   * @param moduleId Identifiant du module
   * @param moduleName Nom du module
   * @param deviceInfo Informations sur l'appareil
   * @returns ID de session
   */
  startSession(
    userId: string,
    userName: string,
    moduleId: string,
    moduleName: string,
    deviceInfo: Record<string, any> = {}
  ): string {
    // Générer un ID de session unique
    const sessionId = uuidv4();
    
    // Enregistrer le début de la session
    this.sessionStartTimes.set(sessionId, Date.now());
    
    // Associer l'utilisateur à cette session
    this.activeSessions.set(userId, sessionId);
    
    // Créer un enregistrement initial dans la base de données
    this.createSessionRecord(userId, userName, moduleId, moduleName, sessionId, deviceInfo)
      .catch(err => console.error('Erreur lors de la création de l\'enregistrement de session:', err));
    
    return sessionId;
  }
  
  /**
   * Terminer une session utilisateur
   * @param userId Identifiant de l'utilisateur
   */
  async endSession(userId: string): Promise<void> {
    const sessionId = this.activeSessions.get(userId);
    if (!sessionId) {
      return;
    }
    
    // Calculer la durée de la session
    const startTime = this.sessionStartTimes.get(sessionId);
    if (!startTime) {
      return;
    }
    
    const sessionDuration = Math.floor((Date.now() - startTime) / 1000); // Durée en secondes
    
    // Mettre à jour l'enregistrement de session dans la base de données
    try {
      await db
        .update(schema.usageStats)
        .set({ sessionDuration })
        .where(eq(schema.usageStats.sessionId, sessionId));
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la durée de session:', err);
    }
    
    // Nettoyer les maps
    this.activeSessions.delete(userId);
    this.sessionStartTimes.delete(sessionId);
  }
  
  /**
   * Enregistrer l'utilisation de tokens
   */
  async recordTokenUsage(
    userId: string,
    userName: string,
    moduleId: string,
    moduleName: string,
    requestType: string,
    model: string,
    promptTokens: number,
    completionTokens: number,
    responseTime: number,
    success: boolean = true,
    errorCode?: string
  ): Promise<void> {
    const sessionId = this.activeSessions.get(userId) || 'no-session';
    
    try {
      // Créer un nouvel enregistrement d'utilisation de token
      await db.insert(schema.tokenUsage).values({
        userId,
        userName,
        moduleId,
        moduleName,
        requestId: uuidv4(),
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
        model,
        requestType,
        responseTime,
        success,
        errorCode
      });
      
      // Mettre à jour le nombre total de tokens pour la session
      if (sessionId !== 'no-session') {
        await db
          .update(schema.usageStats)
          .set({ 
            tokensConsumed: sql`${schema.usageStats.tokensConsumed} + ${promptTokens + completionTokens}`,
            requestCount: sql`${schema.usageStats.requestCount} + 1`
          })
          .where(eq(schema.usageStats.sessionId, sessionId));
      }
    } catch (err) {
      console.error('Erreur lors de l\'enregistrement de l\'utilisation de tokens:', err);
    }
  }
  
  /**
   * Créer un enregistrement de session dans la base de données
   */
  private async createSessionRecord(
    userId: string,
    userName: string,
    moduleId: string,
    moduleName: string,
    sessionId: string,
    deviceInfo: Record<string, any>
  ): Promise<void> {
    try {
      await db.insert(schema.usageStats).values({
        userId,
        userName,
        moduleId,
        moduleName,
        sessionId,
        deviceInfo,
        tokensConsumed: 0,
        requestCount: 0
      });
    } catch (err) {
      console.error('Erreur lors de la création de l\'enregistrement de session:', err);
    }
  }
  
  /**
   * Obtenir les statistiques d'utilisation par module
   */
  async getModuleStats(
    startDate?: Date,
    endDate?: Date
  ) {
    try {
      let dateFilter: SQL<unknown> | undefined;
      
      if (startDate && endDate) {
        dateFilter = between(schema.usageStats.date, startDate, endDate);
      } else if (startDate) {
        dateFilter = gt(schema.usageStats.date, startDate);
      } else if (endDate) {
        dateFilter = lt(schema.usageStats.date, endDate);
      }
      
      const query = db
        .select({
          moduleId: schema.usageStats.moduleId,
          moduleName: schema.usageStats.moduleName,
          totalSessions: count(schema.usageStats.id),
          totalTokens: sql<number>`sum(${schema.usageStats.tokensConsumed})`,
          totalRequests: sql<number>`sum(${schema.usageStats.requestCount})`,
          avgSessionDuration: sql<number>`avg(${schema.usageStats.sessionDuration})`
        })
        .from(schema.usageStats)
        .groupBy(schema.usageStats.moduleId, schema.usageStats.moduleName)
        .orderBy(desc(sql<number>`sum(${schema.usageStats.tokensConsumed})`));
      
      if (dateFilter) {
        return await query.where(dateFilter);
      }
      
      return await query;
    } catch (err) {
      console.error('Erreur lors de la récupération des statistiques par module:', err);
      return [];
    }
  }
  
  /**
   * Obtenir les statistiques d'utilisation par utilisateur
   */
  async getUserStats(
    startDate?: Date,
    endDate?: Date
  ) {
    try {
      let dateFilter: SQL<unknown> | undefined;
      
      if (startDate && endDate) {
        dateFilter = between(schema.usageStats.date, startDate, endDate);
      } else if (startDate) {
        dateFilter = gt(schema.usageStats.date, startDate);
      } else if (endDate) {
        dateFilter = lt(schema.usageStats.date, endDate);
      }
      
      const query = db
        .select({
          userId: schema.usageStats.userId,
          userName: schema.usageStats.userName,
          totalSessions: count(schema.usageStats.id),
          totalTokens: sql<number>`sum(${schema.usageStats.tokensConsumed})`,
          totalRequests: sql<number>`sum(${schema.usageStats.requestCount})`,
          avgSessionDuration: sql<number>`avg(${schema.usageStats.sessionDuration})`
        })
        .from(schema.usageStats)
        .groupBy(schema.usageStats.userId, schema.usageStats.userName)
        .orderBy(desc(sql<number>`sum(${schema.usageStats.tokensConsumed})`));
      
      if (dateFilter) {
        return await query.where(dateFilter);
      }
      
      return await query;
    } catch (err) {
      console.error('Erreur lors de la récupération des statistiques par utilisateur:', err);
      return [];
    }
  }
  
  /**
   * Obtenir les détails de l'utilisation des tokens
   */
  async getTokenUsageDetails(
    startDate?: Date,
    endDate?: Date,
    userId?: string,
    moduleId?: string,
    model?: string
  ) {
    try {
      const conditions: SQL<unknown>[] = [];
      
      if (startDate && endDate) {
        conditions.push(between(schema.tokenUsage.date, startDate, endDate));
      } else if (startDate) {
        conditions.push(gt(schema.tokenUsage.date, startDate));
      } else if (endDate) {
        conditions.push(lt(schema.tokenUsage.date, endDate));
      }
      
      if (userId) {
        conditions.push(eq(schema.tokenUsage.userId, userId));
      }
      
      if (moduleId) {
        conditions.push(eq(schema.tokenUsage.moduleId, moduleId));
      }
      
      if (model) {
        conditions.push(like(schema.tokenUsage.model, `%${model}%`));
      }
      
      let query = db
        .select()
        .from(schema.tokenUsage)
        .orderBy(desc(schema.tokenUsage.date))
        .limit(100);
      
      if (conditions.length > 0) {
        const whereCondition = conditions.reduce((acc, condition, index) => 
          index === 0 ? condition : and(acc, condition)
        );
        query = query.where(whereCondition);
      }
      
      return await query;
    } catch (err) {
      console.error('Erreur lors de la récupération des détails d\'utilisation des tokens:', err);
      return [];
    }
  }
  
  /**
   * Obtenir les statistiques globales d'utilisation
   */
  async getGlobalStats(
    startDate?: Date,
    endDate?: Date
  ) {
    try {
      let dateFilter: SQL<unknown> | undefined;
      
      if (startDate && endDate) {
        dateFilter = between(schema.usageStats.date, startDate, endDate);
      } else if (startDate) {
        dateFilter = gt(schema.usageStats.date, startDate);
      } else if (endDate) {
        dateFilter = lt(schema.usageStats.date, endDate);
      }
      
      const usageStatsQuery = db
        .select({
          totalSessions: count(schema.usageStats.id),
          totalTokens: sql<number>`sum(${schema.usageStats.tokensConsumed})`,
          totalRequests: sql<number>`sum(${schema.usageStats.requestCount})`,
          avgSessionDuration: sql<number>`avg(${schema.usageStats.sessionDuration})`
        })
        .from(schema.usageStats);
      
      if (dateFilter) {
        usageStatsQuery.where(dateFilter);
      }
      
      const usageStats = await usageStatsQuery;
      
      // Requête pour obtenir le nombre d'utilisateurs uniques
      const userStatsQuery = db
        .select({
          uniqueUsers: sql<number>`count(distinct ${schema.usageStats.userId})`
        })
        .from(schema.usageStats);
      
      if (dateFilter) {
        userStatsQuery.where(dateFilter);
      }
      
      const userStats = await userStatsQuery;
      
      // Requête pour obtenir les statistiques par modèle
      const modelStatsQuery = db
        .select({
          model: schema.tokenUsage.model,
          totalTokens: sql<number>`sum(${schema.tokenUsage.totalTokens})`,
          totalPromptTokens: sql<number>`sum(${schema.tokenUsage.promptTokens})`,
          totalCompletionTokens: sql<number>`sum(${schema.tokenUsage.completionTokens})`,
          totalRequests: count(schema.tokenUsage.id)
        })
        .from(schema.tokenUsage)
        .groupBy(schema.tokenUsage.model);
      
      if (dateFilter) {
        modelStatsQuery.where(dateFilter);
      }
      
      const modelStats = await modelStatsQuery;
      
      return {
        ...usageStats[0],
        uniqueUsers: userStats[0]?.uniqueUsers || 0,
        modelStats
      };
    } catch (err) {
      console.error('Erreur lors de la récupération des statistiques globales:', err);
      return {
        totalSessions: 0,
        totalTokens: 0,
        totalRequests: 0,
        avgSessionDuration: 0,
        uniqueUsers: 0,
        modelStats: []
      };
    }
  }
}

// Exporter une instance singleton du service
export const analyticsService = new AnalyticsService();