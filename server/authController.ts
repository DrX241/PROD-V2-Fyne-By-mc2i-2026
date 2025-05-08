import { Request, Response, NextFunction } from 'express';

// Middleware placeholders - pas de véritable authentification
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  // Toujours autoriser car pas d'authentification
  return next();
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  // Toujours autoriser car pas d'authentification
  return next();
};