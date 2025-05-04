/**
 * Middleware pour appliquer la limitation de débit (rate limiting) aux routes
 */

import { Request, Response, NextFunction } from 'express';
import { rateLimiter } from '../services/rateLimiterService';

interface RateLimiterOptions {
  keyGenerator?: (req: Request) => string;
  getAssistantType?: (req: Request) => string | undefined;
  errorHandler?: (req: Request, res: Response) => void;
  skipIfAdmin?: boolean;
}

/**
 * Middleware de limitation de débit
 * 
 * @param options Options de configuration
 * @returns Middleware Express
 */
export const rateLimiterMiddleware = (options: RateLimiterOptions = {}) => {
  // Fonction par défaut pour générer la clé de limitation
  const defaultKeyGenerator = (req: Request): string => {
    // Utiliser en priorité l'utilisateur si disponible
    if (req.headers['x-user-id']) {
      return `user:${req.headers['x-user-id']}`;
    }
    
    // Nous n'utilisons pas les sessions express dans cette application
    // Mais nous pourrions les utiliser à l'avenir
    
    // Sinon, utiliser l'IP
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    return `ip:${ip}`;
  };
  
  // Fonction par défaut pour récupérer le type d'assistant
  const defaultGetAssistantType = (req: Request): string | undefined => {
    // Essayer de récupérer le type d'assistant depuis les paramètres
    if (req.params.assistantType) {
      return req.params.assistantType;
    }
    
    // Essayer de récupérer le domaine depuis le corps de la requête
    if (req.body && req.body.domain) {
      return req.body.domain;
    }
    
    // Essayer de récupérer le domaine depuis la query string
    if (req.query.domain) {
      return req.query.domain as string;
    }
    
    return undefined;
  };
  
  // Fonction par défaut pour gérer les erreurs de limitation
  const defaultErrorHandler = (_req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: 'Trop de requêtes, veuillez réessayer plus tard.',
      code: 'RATE_LIMIT_EXCEEDED'
    });
  };
  
  return async (req: Request, res: Response, next: NextFunction) => {
    const keyGenerator = options.keyGenerator || defaultKeyGenerator;
    const getAssistantType = options.getAssistantType || defaultGetAssistantType;
    const errorHandler = options.errorHandler || defaultErrorHandler;
    
    // Ignorer la limitation pour les administrateurs si requis
    if (options.skipIfAdmin && req.headers['x-user-role'] === 'admin') {
      return next();
    }
    
    // Générer la clé et récupérer le type d'assistant
    const key = keyGenerator(req);
    const assistantType = getAssistantType(req);
    
    try {
      // Vérifier la limitation de débit
      const canProceed = await rateLimiter.checkRateLimit(key, assistantType);
      
      if (!canProceed) {
        // Appliquer le gestionnaire d'erreur personnalisé
        return errorHandler(req, res);
      }
      
      // Intercepter la fonction d'envoi pour libérer le rate limiter en cas d'erreur interne
      const originalSend = res.send;
      res.send = function(this: Response, body: any) {
        // Vérifier si la réponse indique une erreur
        let isError = false;
        
        try {
          // Si le corps est un objet JSON
          if (typeof body === 'string' && body.startsWith('{')) {
            const parsed = JSON.parse(body);
            isError = parsed.success === false || parsed.error;
          } else if (typeof body === 'object') {
            // Si c'est déjà un objet
            isError = body.success === false || body.error;
          }
        } catch (e) {
          // Ignorer les erreurs de parsing
        }
        
        // Si c'est une erreur, libérer un jeton
        if (res.statusCode >= 500 || isError) {
          rateLimiter.releaseLimit(key);
        }
        
        // Appeler la fonction originale
        return originalSend.call(this, body);
      };
      
      // Continuer avec la requête
      next();
    } catch (error) {
      // Erreur de timeout ou autre
      res.status(429).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erreur de limitation de débit',
        code: 'RATE_LIMIT_ERROR'
      });
    }
  };
};