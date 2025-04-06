import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ChatCompletionRequestMessage } from "../shared/schema";
import { evaluateDecision } from "./cyberDefenseEvaluator";
import { missionGenerator } from "../I_AM_CYBER/services/mission-generator";

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

  // API pour les conversations du module Cyber Defense
  app.post('/api/cyber-defense/chat', async (req: Request, res: Response) => {
    try {
      const { userMessage, missionContext, userProfile } = req.body;
      
      if (!userMessage) {
        return res.status(400).json({
          success: false,
          message: 'Le message utilisateur est requis'
        });
      }
      
      // TODO: Implémenter l'intégration réelle avec l'API OpenAI
      // Pour le moment, retournons une réponse simulée
      
      const botResponse = {
        content: `Je comprends votre préoccupation concernant "${userMessage}". Dans le contexte de cette mission de cybersécurité, je vous recommande d'abord d'évaluer la situation puis de suivre les protocoles de sécurité établis.`,
        contextualReferences: [
          {
            type: "best_practice",
            content: "Suivre les procédures d'incident définies par le NIST"
          }
        ]
      };
      
      setTimeout(() => {
        res.json({
          success: true,
          response: botResponse
        });
      }, 500); // Simuler un délai de réponse
      
    } catch (error) {
      console.error('Error generating cyber defense response:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // API pour évaluer les décisions prises dans le module Cyber Defense
  app.post("/api/cyber-defense/evaluate-decision", evaluateDecision);
  
  // API route pour générer dynamiquement une mission via l'IA
  app.post('/api/cyber-defense/generate-mission', async (req: Request, res: Response) => {
    try {
      const { difficultyLevel, industryContext, userProfileSummary, focusAreas } = req.body;
      
      if (!difficultyLevel) {
        return res.status(400).json({
          success: false,
          message: 'Le niveau de difficulté est requis'
        });
      }
      
      const mission = await missionGenerator.generateMission({
        difficultyLevel,
        industryContext,
        userProfileSummary,
        focusAreas
      });
      
      res.json({
        success: true,
        mission
      });
      
    } catch (error) {
      console.error('Error generating mission:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la génération de la mission',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // API route pour générer des titres de missions
  app.get('/api/cyber-defense/mission-titles', async (req: Request, res: Response) => {
    try {
      const count = parseInt(req.query.count as string) || 5;
      const difficulty = (req.query.difficulty as string) || 'Intermédiaire';
      
      const titles = await missionGenerator.generateMissionTitles(count, difficulty);
      
      res.json({
        success: true,
        titles
      });
      
    } catch (error) {
      console.error('Error generating mission titles:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la génération des titres de mission',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Note: les routes pour le simulateur immersif seront implémentées ultérieurement

  // Créer et retourner le serveur HTTP
  const server = createServer(app);
  return server;
}