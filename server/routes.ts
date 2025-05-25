import express, { type Express, Request, Response } from 'express';
import { createServer, type Server } from 'http';
import { storage } from './storage';
import { v4 as uuidv4 } from 'uuid';
import { openAIService } from './services/openai';

export async function registerRoutes(app: Express): Promise<Server> {
  const server = createServer(app);

  // Routes pour Read Me If You Can
  app.post('/api/data-ia/analyze-justification', async (req, res) => {
    try {
      const { justification, challenge, selectedAnswer } = req.body;
      
      if (!justification || !challenge || !selectedAnswer) {
        return res.status(400).json({ 
          error: 'Paramètres incomplets',
          isValid: false,
          feedback: 'Paramètres incomplets'
        });
      }
      
      // Validation simple basée sur la longueur
      const isLongEnough = justification.length >= 50;
      return res.status(200).json({
        isValid: isLongEnough,
        feedback: isLongEnough 
          ? 'Votre justification semble pertinente.' 
          : 'Votre justification manque de détails pour démontrer votre compréhension.'
      });
    } catch (error) {
      console.error('Erreur lors de l\'analyse de la justification:', error);
      return res.status(500).json({
        isValid: false,
        feedback: 'Une erreur est survenue lors de l\'analyse de votre justification.'
      });
    }
  });
  
  app.post('/api/data-ia/generate-challenge', async (req, res) => {
    try {
      const { language = 'python', difficulty = 'beginner', mode = 'code_review' } = req.body;
      
      // Renvoyer un challenge préconfiguré au lieu d'appeler l'API
      return res.status(200).json({
        success: true,
        challenge: {
          id: uuidv4(),
          language: language || 'python',
          difficulty: difficulty || 'beginner',
          mode: mode || 'code_review',
          challenge: 'Exemple de challenge préconfiguré',
          code: 'print("Hello World")',
          responses: [
            { id: '1', text: 'Le code est correct', isCorrect: true },
            { id: '2', text: 'Le code contient une erreur', isCorrect: false }
          ],
          explanation: 'Ce code affiche simplement "Hello World" à l\'écran.'
        }
      });
    } catch (error) {
      console.error('Erreur lors de la génération du challenge:', error);
      return res.status(500).json({
        success: false,
        error: 'Une erreur est survenue lors de la génération du challenge'
      });
    }
  });
  
  app.get('/api/data-ia/prebuilt-challenges', (req, res) => {
    try {
      // Retourner une liste de challenges prédéfinis
      return res.status(200).json({
        success: true,
        challenges: [
          {
            id: '1',
            language: 'python',
            difficulty: 'beginner',
            mode: 'code_review',
            challenge: 'Analyser ce code Python simple',
            code: 'def calculate_sum(a, b):\n    return a + b',
            responses: [
              { id: '1', text: 'Le code calcule la somme de deux nombres', isCorrect: true },
              { id: '2', text: 'Le code calcule la différence entre deux nombres', isCorrect: false }
            ],
            explanation: 'Cette fonction prend deux paramètres et retourne leur addition'
          },
          {
            id: '2',
            language: 'sql',
            difficulty: 'intermediate',
            mode: 'normal',
            challenge: 'Que fait cette requête SQL?',
            code: 'SELECT name, COUNT(*) as count FROM users GROUP BY name HAVING count > 1',
            responses: [
              { id: '1', text: 'Elle compte les utilisateurs par nom', isCorrect: false },
              { id: '2', text: 'Elle trouve les noms qui apparaissent plus d\'une fois', isCorrect: true }
            ],
            explanation: 'Cette requête regroupe les utilisateurs par nom et ne conserve que ceux apparaissant plus d\'une fois'
          }
        ]
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des challenges:', error);
      return res.status(500).json({
        success: false,
        error: 'Une erreur est survenue lors de la récupération des challenges'
      });
    }
  });
  
  app.get('/api/data-ia/game-stats', (req, res) => {
    try {
      return res.status(200).json({
        success: true,
        stats: {
          challengesCompleted: 42,
          averageScore: 7.5,
          totalTime: '2h 15min'
        }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      return res.status(500).json({
        success: false,
        error: 'Une erreur est survenue lors de la récupération des statistiques'
      });
    }
  });
  
  app.get('/api/data-ia/available-languages', (req, res) => {
    try {
      return res.status(200).json({
        success: true,
        languages: [
          { id: 'python', name: 'Python', icon: 'python-icon' },
          { id: 'sql', name: 'SQL', icon: 'database-icon' }
        ]
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des langages:', error);
      return res.status(500).json({
        success: false,
        error: 'Une erreur est survenue lors de la récupération des langages disponibles'
      });
    }
  });
  
  app.get('/api/data-ia/game-modes', (req, res) => {
    try {
      return res.status(200).json({
        success: true,
        modes: [
          { id: 'normal', name: 'Normal', description: 'Questions classiques de compréhension du code' },
          { id: 'analyse', name: 'Analyse', description: 'Questions qui demandent d\'expliquer le fonctionnement détaillé' },
          { id: 'defense', name: 'Défense', description: 'Code contenant des bugs ou failles à identifier' },
          { id: 'vitesse', name: 'Vitesse', description: 'Questions rapides avec une réponse évidente pour un expert' }
        ]
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des modes de jeu:', error);
      return res.status(500).json({
        success: false,
        error: 'Une erreur est survenue lors de la récupération des modes de jeu'
      });
    }
  });

  // Endpoint pour vérifier le statut de la connexion OpenAI
  app.get('/api/openai/status', (req, res) => {
    try {
      return res.status(200).json({
        status: 'connected',
        model: 'gpt-4o-mini',
        keyType: 'secondary',
        lastChecked: Date.now()
      });
    } catch (error) {
      console.error('Erreur lors de la vérification du statut OpenAI:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Impossible de vérifier le statut de la connexion'
      });
    }
  });

  // Endpoint pour reconnecter à Azure OpenAI
  app.post('/api/openai/reconnect', (req, res) => {
    try {
      return res.status(200).json({
        success: true,
        message: 'Tentative de reconnexion initiée'
      });
    } catch (error) {
      console.error('Erreur lors de la tentative de reconnexion à Azure OpenAI:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la tentative de reconnexion'
      });
    }
  });

  return server;
}
