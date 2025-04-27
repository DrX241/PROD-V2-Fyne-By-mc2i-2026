import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import OpenAI from 'openai';
import { openAIService } from "./services/openai";
import { ChatCompletionRequestMessage } from "@shared/schema";
import { evaluateDecision } from "./cyberDefenseEvaluator";

export async function registerRoutes(app: Express): Promise<Server> {
  // API route for checking status
  app.get('/api/cyber/status', async (req: Request, res: Response) => {
    try {
      const connectionStatus = await openAIService.checkConnection();
      const currentModel = openAIService.getCurrentConfig().modelName;
      res.json({ 
        status: connectionStatus ? 'connected' : 'disconnected',
        model: currentModel
      });
    } catch (error: any) {
      console.error('Error checking API status:', error);
      res.status(500).json({ 
        error: error.message || 'Error checking API status'
      });
    }
  });

  // API route for simple chat
  app.post('/api/cyber/simple-chat', async (req: Request, res: Response) => {
    try {
      const { message, context } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: 'Message requis' });
      }
      
      // Générer une réponse avec OpenAI
      const messages: ChatCompletionRequestMessage[] = [
        { role: "system", content: context || "Tu es un assistant en cybersécurité professionnel et pédagogique." },
        { role: "user", content: message }
      ];
      
      const response = await openAIService.getChatCompletionWithCache(
        messages,
        0.7,
        800
      );
      
      res.json({ 
        response,
        userId: uuidv4()
      });
      
    } catch (error: any) {
      console.error('Error generating chat response:', error);
      
      if (error.status === 401) {
        res.status(401).json({ error: 'Erreur d\'authentification API OpenAI. Vérifiez votre clé API.' });
      } else if (error.status === 429) {
        res.status(429).json({ error: 'Limite de requêtes atteinte. Veuillez réessayer plus tard.' });
      } else {
        res.status(500).json({ 
          error: 'Erreur de génération de réponse',
          details: error.message || 'Erreur inconnue'
        });
      }
    }
  });

  // API route for switching API key
  app.post('/api/cyber/switch-api-key', (req: Request, res: Response) => {
    try {
      const { api_type } = req.body;
      
      if (!api_type || (api_type !== 'primary' && api_type !== 'secondary')) {
        return res.status(400).json({ message: 'Valid API type required (primary or secondary)' });
      }
      
      openAIService.switchApiKey(api_type);
      
      res.json({ 
        success: true, 
        message: `API key switched to ${api_type}`,
        model: openAIService.getCurrentConfig().modelName
      });
    } catch (error: any) {
      console.error('Error switching API key:', error);
      res.status(500).json({ 
        error: 'Error switching API key',
        details: error.message || 'Unknown error'
      });
    }
  });

  // Return the HTTP server
  const httpServer = createServer(app);
  return httpServer;
}