/**
 * Middleware pour appliquer la limitation de débit (rate limiting) aux routes
 */

import { Request, Response, NextFunction } from 'express';
import { rateLimiter } from '../services/rateLimiterService';

// Interface pour les options du middleware
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
  // Fonction par défaut pour générer la clé (basée sur l'utilisateur ou l'IP)
  const defaultKeyGenerator = (req: Request): string => {
    if (req.session?.user?.id) {
      return `user:${req.session.user.id}`;
    }
    // Utiliser l'ID dans le body si disponible
    if (req.body?.userId) {
      return `user:${req.body.userId}`;
    }
    // Utiliser l'IP comme fallback
    const ip = req.ip || 
               req.connection.remoteAddress || 
               req.headers['x-forwarded-for'] || 
               'unknown';
    return `ip:${ip}`;
  };
  
  // Fonction par défaut pour obtenir le type d'assistant
  const defaultGetAssistantType = (req: Request): string | undefined => {
    // Essayer d'obtenir le type depuis le corps de la requête
    if (req.body?.assistantType || req.body?.domain) {
      return req.body.assistantType || req.body.domain;
    }
    
    // Essayer d'obtenir depuis les paramètres de requête
    if (req.query?.type || req.query?.domain) {
      return req.query.type as string || req.query.domain as string;
    }
    
    // Essayer d'obtenir depuis les paramètres d'URL
    if (req.params?.type || req.params?.domain) {
      return req.params.type || req.params.domain;
    }
    
    return undefined;
  };
  
  // Gestionnaire d'erreur par défaut
  const defaultErrorHandler = (_req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: 'Trop de requêtes, veuillez réessayer plus tard',
      retryAfter: 60 // Suggérer de réessayer après 60 secondes
    });
  };
  
  // Extraire les options avec des valeurs par défaut
  const keyGenerator = options.keyGenerator || defaultKeyGenerator;
  const getAssistantType = options.getAssistantType || defaultGetAssistantType;
  const errorHandler = options.errorHandler || defaultErrorHandler;
  const skipIfAdmin = options.skipIfAdmin || false;
  
  // Retourner le middleware
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Vérifier si c'est un administrateur et si on doit ignorer la limite dans ce cas
      if (skipIfAdmin && req.headers['x-user-role'] === 'admin') {
        return next();
      }
      
      // Générer la clé et obtenir le type d'assistant
      const key = keyGenerator(req);
      const assistantType = getAssistantType(req);
      
      // Vérifier si la requête peut être traitée
      const canProceed = await rateLimiter.checkRateLimit(key, assistantType);
      
      if (canProceed) {
        // Ajouter un hook pour libérer la limite en cas d'erreur
        // afin de ne pas pénaliser l'utilisateur pour les échecs côté serveur
        const originalEnd = res.end;
        res.end = function(...args: any[]) {
          const statusCode = res.statusCode;
          if (statusCode >= 500) {
            // Libérer la limite pour les erreurs serveur
            rateLimiter.releaseLimit(key);
          }
          return originalEnd.apply(res, args);
        };
        
        // Continuer le traitement de la requête
        next();
      } else {
        // Appliquer le gestionnaire d'erreur
        errorHandler(req, res);
      }
    } catch (error) {
      // En cas d'erreur dans la vérification du rate limit, continuer quand même
      console.error('Erreur lors de la vérification du rate limit:', error);
      next();
    }
  };
};