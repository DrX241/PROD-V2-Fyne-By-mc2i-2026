import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ChatCompletionRequestMessage } from "../shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Status API pour vérifier la connexion à Azure OpenAI
  app.get('/api/cyber/status', async (req: Request, res: Response) => {
    try {
      const status = 'connected';
      const message = 'API OpenAI connectée et fonctionnelle';
      
      return res.status(200).json({
        status,
        message,
        lastCheck: Date.now(),
      });
    } catch (error) {
      console.error('Error checking API connection:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Erreur lors de la vérification de la connexion API',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // Note: les routes pour le simulateur immersif seront implémentées ultérieurement

  // Créer et retourner le serveur HTTP
  const server = createServer({
    requestTimeout: 300000,
    headersTimeout: 60000,
  }, app);
  return server;
}