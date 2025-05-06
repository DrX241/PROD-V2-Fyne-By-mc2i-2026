import { Request, Response } from 'express';
import { analyticsService } from './services/analyticsService';
import { checkSuperAdminAccess } from './adminController';

/**
 * Démarrer une session utilisateur pour le suivi des statistiques
 */
export async function startUserSession(req: Request, res: Response) {
  try {
    const { userId, userName, moduleId, moduleName, deviceInfo } = req.body;
    
    if (!userId || !userName || !moduleId || !moduleName) {
      return res.status(400).json({
        success: false,
        message: 'Les paramètres userId, userName, moduleId et moduleName sont requis'
      });
    }
    
    const sessionId = analyticsService.startSession(
      userId,
      userName,
      moduleId,
      moduleName,
      deviceInfo || {}
    );
    
    res.status(200).json({ success: true, sessionId });
  } catch (err) {
    console.error('Erreur lors du démarrage de la session:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du démarrage de la session'
    });
  }
}

/**
 * Terminer une session utilisateur
 */
export async function endUserSession(req: Request, res: Response) {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Le paramètre userId est requis'
      });
    }
    
    await analyticsService.endSession(userId);
    
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Erreur lors de la fin de la session:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la fin de la session'
    });
  }
}

/**
 * Enregistrer l'utilisation de tokens
 */
export async function recordTokenUsage(req: Request, res: Response) {
  try {
    const {
      userId,
      userName,
      moduleId,
      moduleName,
      requestType,
      model,
      promptTokens,
      completionTokens,
      responseTime,
      success,
      errorCode
    } = req.body;
    
    if (!userId || !userName || !moduleId || !moduleName || !requestType || !model) {
      return res.status(400).json({
        success: false,
        message: 'Paramètres manquants'
      });
    }
    
    await analyticsService.recordTokenUsage(
      userId,
      userName,
      moduleId,
      moduleName,
      requestType,
      model,
      promptTokens || 0,
      completionTokens || 0,
      responseTime || 0,
      success !== undefined ? success : true,
      errorCode
    );
    
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Erreur lors de l\'enregistrement de l\'utilisation de tokens:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'enregistrement de l\'utilisation de tokens'
    });
  }
}

/**
 * Obtenir les statistiques d'utilisation par module
 */
export async function getModuleStats(req: Request, res: Response) {
  try {
    // Vérifier l'accès admin
    const adminMiddleware = checkSuperAdminAccess;
    await new Promise((resolve, reject) => {
      adminMiddleware(req, res, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
    
    // Extraire les paramètres de date de la requête
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    
    const stats = await analyticsService.getModuleStats(startDate, endDate);
    
    res.status(200).json({ success: true, data: stats });
  } catch (err) {
    console.error('Erreur lors de la récupération des statistiques par module:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques par module'
    });
  }
}

/**
 * Obtenir les statistiques d'utilisation par utilisateur
 */
export async function getUserStats(req: Request, res: Response) {
  try {
    // Vérifier l'accès admin
    const adminMiddleware = checkSuperAdminAccess;
    await new Promise((resolve, reject) => {
      adminMiddleware(req, res, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
    
    // Extraire les paramètres de date de la requête
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    
    const stats = await analyticsService.getUserStats(startDate, endDate);
    
    res.status(200).json({ success: true, data: stats });
  } catch (err) {
    console.error('Erreur lors de la récupération des statistiques par utilisateur:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques par utilisateur'
    });
  }
}

/**
 * Obtenir les détails de l'utilisation des tokens
 */
export async function getTokenUsageDetails(req: Request, res: Response) {
  try {
    // Vérifier l'accès admin
    const adminMiddleware = checkSuperAdminAccess;
    await new Promise((resolve, reject) => {
      adminMiddleware(req, res, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
    
    // Extraire les paramètres de la requête
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    const userId = req.query.userId as string | undefined;
    const moduleId = req.query.moduleId as string | undefined;
    const model = req.query.model as string | undefined;
    
    const details = await analyticsService.getTokenUsageDetails(
      startDate,
      endDate,
      userId,
      moduleId,
      model
    );
    
    res.status(200).json({ success: true, data: details });
  } catch (err) {
    console.error('Erreur lors de la récupération des détails d\'utilisation des tokens:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des détails d\'utilisation des tokens'
    });
  }
}

/**
 * Obtenir les statistiques globales d'utilisation
 */
export async function getGlobalStats(req: Request, res: Response) {
  try {
    // Vérifier l'accès admin
    const adminMiddleware = checkSuperAdminAccess;
    await new Promise((resolve, reject) => {
      adminMiddleware(req, res, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
    
    // Extraire les paramètres de date de la requête
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    
    const stats = await analyticsService.getGlobalStats(startDate, endDate);
    
    res.status(200).json({ success: true, data: stats });
  } catch (err) {
    console.error('Erreur lors de la récupération des statistiques globales:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques globales'
    });
  }
}