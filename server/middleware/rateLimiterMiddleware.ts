/**
 * Middleware pour la limitation de débit (rate limiting)
 * Ce middleware protège les routes d'API contre les abus
 */

import { Request, Response, NextFunction } from 'express';
import { rateLimiterService } from '../services/rateLimiterService';

interface RateLimiterOptions {
  // Utiliser l'ID utilisateur si disponible, sinon l'IP
  useUserId?: boolean;
  // Domaine spécifique pour les limites
  domain?: string;
  // Message d'erreur personnalisé
  message?: string;
  // Code d'état HTTP en cas de limite dépassée
  statusCode?: number;
}

/**
 * Middleware de limitation de débit
 * @param options Options du middleware
 */
export function rateLimiter(options: RateLimiterOptions = {}) {
  const {
    useUserId = true,
    domain,
    message = 'Rate limit exceeded. Please try again later.',
    statusCode = 429 // Too Many Requests
  } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Déterminer la clé à utiliser pour le rate limiting
      let key: string;

      if (useUserId && req.user && (req.user as any).id) {
        // Utiliser l'ID utilisateur si disponible
        key = `user:${(req.user as any).id}`;
      } else if (useUserId && req.headers['x-user-id']) {
        // Utiliser l'en-tête x-user-id si disponible
        key = `user:${req.headers['x-user-id']}`;
      } else {
        // Utiliser l'IP comme fallback
        const ip = req.ip || req.socket.remoteAddress || 'unknown';
        key = `ip:${ip}`;
      }

      // Vérifier les limites de débit
      const isAllowed = await rateLimiterService.check(key, domain);

      if (isAllowed) {
        // La requête est autorisée
        next();
      } else {
        // La requête est refusée
        res.status(statusCode).json({
          success: false,
          error: message
        });
      }
    } catch (error) {
      console.error('Rate limiter error:', error);
      next(error);
    }
  };
}