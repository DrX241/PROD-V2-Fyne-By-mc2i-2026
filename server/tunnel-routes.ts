import type { Express, Request, Response } from "express";
import { v4 as uuidv4 } from 'uuid';
import { tunnelAIService } from "../EFFET_TUNNEL/services/tunnel-ai";
import { 
  TunnelScenario, 
  TunnelSituation, 
  ExpertiseLevel, 
  ProfessionalRole, 
  BusinessSector,
  DecisionOption,
  TunnelSessionState,
  TunnelExpert
} from "../EFFET_TUNNEL/types";

// Map pour stocker les sessions des utilisateurs (en mémoire pour l'instant)
const userSessions = new Map<string, TunnelSessionState>();

// Liste des scénarios prédéfinis (pourrait être remplacée par une base de données)
const scenarioTypes = [
  { id: "ransomware", name: "Gestion de crise ransomware" },
  { id: "data-breach", name: "Fuite de données" },
  { id: "supply-chain", name: "Attaque de la supply chain" },
  { id: "investigation", name: "Investigation post-incident" }
];

export function registerTunnelRoutes(app: Express) {
  console.log('Registering Tunnel API routes');

  // Endpoint pour récupérer les types de scénarios disponibles
  app.get('/api/tunnel/scenario-types', (req: Request, res: Response) => {
    res.json({ scenarioTypes });
  });

  // Endpoint pour initialiser une session
  app.post('/api/tunnel/initialize', async (req: Request, res: Response) => {
    try {
      const { role, level, sector, scenarioType } = req.body;

      if (!role || !level || !sector || !scenarioType) {
        return res.status(400).json({ 
          message: 'Missing required parameters. Role, level, sector, and scenarioType are required.' 
        });
      }

      // Vérifier que les valeurs sont valides
      const validRoles: ProfessionalRole[] = [
        'RSSI', 'DSI', 'Administrateur Systèmes', 'Administrateur Réseau',
        'Analyste SOC', 'Chef de Projet IT', 'DPO', 'Juriste',
        'Directeur Communication', 'Responsable RH'
      ];

      const validLevels: ExpertiseLevel[] = ['Débutant', 'Intermédiaire', 'Expert'];

      const validSectors: BusinessSector[] = [
        'Banque/Finance', 'Santé', 'Industrie', 'Administration Publique',
        'Energie', 'Retail/E-commerce', 'Transport/Logistique', 'Education',
        'Services', 'Télécommunication'
      ];

      if (!validRoles.includes(role as ProfessionalRole)) {
        return res.status(400).json({ message: 'Invalid role' });
      }

      if (!validLevels.includes(level as ExpertiseLevel)) {
        return res.status(400).json({ message: 'Invalid expertise level' });
      }

      if (!validSectors.includes(sector as BusinessSector)) {
        return res.status(400).json({ message: 'Invalid business sector' });
      }

      // Générer un scénario initial
      const scenario = await tunnelAIService.generateInitialScenario(
        role as ProfessionalRole,
        level as ExpertiseLevel,
        sector as BusinessSector,
        scenarioType
      );

      // Créer une nouvelle session
      const sessionId = uuidv4();
      const initialSituation = scenario.situations.find(s => s.id === scenario.initialSituationId);

      if (!initialSituation) {
        return res.status(500).json({ message: 'Invalid scenario structure: initial situation not found' });
      }

      const session: TunnelSessionState = {
        selectedRole: role as ProfessionalRole,
        selectedLevel: level as ExpertiseLevel,
        selectedSector: sector as BusinessSector,
        currentScenario: scenario,
        currentSituation: initialSituation,
        decisionPath: [initialSituation.id],
        decisionsMade: {}
      };

      // Stocker la session
      userSessions.set(sessionId, session);

      // Renvoyer les informations initiales
      res.json({
        sessionId,
        scenario,
        initialSituation
      });
    } catch (error: any) {
      console.error('Error initializing tunnel session:', error);
      res.status(500).json({ 
        message: 'Failed to initialize tunnel session', 
        error: error.message 
      });
    }
  });

  // Endpoint pour récupérer une situation suivante basée sur un choix
  app.post('/api/tunnel/make-decision', async (req: Request, res: Response) => {
    try {
      const { sessionId, optionId } = req.body;

      if (!sessionId || !optionId) {
        return res.status(400).json({ message: 'Session ID and option ID are required' });
      }

      // Récupérer la session utilisateur
      const session = userSessions.get(sessionId);
      if (!session) {
        return res.status(404).json({ message: 'Session not found' });
      }

      // Vérifier que la situation actuelle existe
      if (!session.currentSituation) {
        return res.status(400).json({ message: 'No active situation in current session' });
      }

      // Vérifier que l'option choisie existe
      const chosenOption = session.currentSituation.options.find(opt => opt.id === optionId);
      if (!chosenOption) {
        return res.status(400).json({ message: 'Invalid option ID' });
      }

      // Enregistrer la décision
      session.decisionsMade[session.currentSituation.id] = optionId;

      // Vérifier si c'est une situation finale
      if (session.currentSituation.isFinal) {
        // Générer le debriefing final
        const debriefing = await tunnelAIService.generateDebriefing(session);
        
        return res.json({
          isFinal: true,
          debriefing,
          decisionPath: session.decisionPath,
          decisionsMade: session.decisionsMade
        });
      }

      // Générer la nouvelle situation basée sur le choix
      const nextSituation = await tunnelAIService.generateNextSituation(
        session,
        session.currentSituation,
        optionId
      );

      // Mettre à jour le chemin de décision
      session.decisionPath.push(nextSituation.id);

      // Mettre à jour la situation courante
      session.currentSituation = nextSituation;

      // Si la situation n'a pas déjà un contenu pédagogique, le générer
      if (!nextSituation.tutorialContent) {
        nextSituation.tutorialContent = await tunnelAIService.generateTutorialContent(
          nextSituation,
          session
        );
      }

      // Mettre à jour la session stockée
      userSessions.set(sessionId, session);

      // Renvoyer la nouvelle situation
      res.json({
        situation: nextSituation,
        decisionPath: session.decisionPath,
        isFinal: nextSituation.isFinal || false
      });
    } catch (error: any) {
      console.error('Error processing decision:', error);
      res.status(500).json({ 
        message: 'Failed to process decision', 
        error: error.message 
      });
    }
  });

  // Endpoint pour réinitialiser un scénario
  app.post('/api/tunnel/reset-scenario', (req: Request, res: Response) => {
    try {
      const { sessionId } = req.body;

      if (!sessionId) {
        return res.status(400).json({ message: 'Session ID is required' });
      }

      // Récupérer la session utilisateur
      const session = userSessions.get(sessionId);
      if (!session || !session.currentScenario) {
        return res.status(404).json({ message: 'Session or scenario not found' });
      }

      // Récupérer la situation initiale
      const initialSituation = session.currentScenario.situations.find(
        s => s.id === session.currentScenario?.initialSituationId
      );

      if (!initialSituation) {
        return res.status(500).json({ message: 'Initial situation not found in scenario' });
      }

      // Réinitialiser le chemin de décision et la situation courante
      session.decisionPath = [initialSituation.id];
      session.decisionsMade = {};
      session.currentSituation = initialSituation;

      // Mettre à jour la session stockée
      userSessions.set(sessionId, session);

      // Renvoyer la situation initiale
      res.json({
        situation: initialSituation,
        decisionPath: session.decisionPath
      });
    } catch (error: any) {
      console.error('Error resetting scenario:', error);
      res.status(500).json({ 
        message: 'Failed to reset scenario', 
        error: error.message 
      });
    }
  });

  // Endpoint pour récupérer l'état actuel d'une session
  app.get('/api/tunnel/session/:sessionId', (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;

      if (!sessionId) {
        return res.status(400).json({ message: 'Session ID is required' });
      }

      // Récupérer la session utilisateur
      const session = userSessions.get(sessionId);
      if (!session) {
        return res.status(404).json({ message: 'Session not found' });
      }

      // Renvoyer l'état actuel de la session
      res.json({
        role: session.selectedRole,
        level: session.selectedLevel,
        sector: session.selectedSector,
        scenario: session.currentScenario,
        currentSituation: session.currentSituation,
        decisionPath: session.decisionPath,
        decisionsMade: session.decisionsMade
      });
    } catch (error: any) {
      console.error('Error fetching session:', error);
      res.status(500).json({ 
        message: 'Failed to fetch session', 
        error: error.message 
      });
    }
  });

  // Endpoint pour récupérer les experts disponibles pour une session
  app.get('/api/tunnel/experts/:sessionId', (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;

      if (!sessionId) {
        return res.status(400).json({ message: 'Session ID is required' });
      }

      // Récupérer la session utilisateur
      const session = userSessions.get(sessionId);
      if (!session) {
        return res.status(404).json({ message: 'Session not found' });
      }

      // Récupérer les experts disponibles pour la situation actuelle
      let availableExperts: TunnelExpert[] = [];

      // Priorité aux experts de la situation actuelle
      if (session.currentSituation?.experts?.length) {
        availableExperts = [...session.currentSituation.experts];
      }
      // Sinon, utiliser les experts du scénario
      else if (session.currentScenario?.experts?.length) {
        availableExperts = [...session.currentScenario.experts];
      }
      // Fallback: créer un expert par défaut si aucun expert n'est défini
      else {
        // Utiliser l'expert présentant la situation actuelle
        if (session.currentSituation) {
          availableExperts = [{
            name: session.currentSituation.expertName,
            role: session.currentSituation.expertRole,
            expertise: "Expert en cybersécurité"
          }];
        }
      }

      res.json({ experts: availableExperts });
    } catch (error: any) {
      console.error('Error fetching experts:', error);
      res.status(500).json({ 
        message: 'Failed to fetch experts', 
        error: error.message 
      });
    }
  });

  // Endpoint pour le chat avec un expert
  app.post('/api/tunnel/chat', async (req: Request, res: Response) => {
    try {
      const { sessionId, message, expertName } = req.body;

      if (!sessionId || !message || !expertName) {
        return res.status(400).json({ 
          message: 'Session ID, message content, and expert name are required' 
        });
      }

      // Récupérer la session utilisateur
      const session = userSessions.get(sessionId);
      if (!session) {
        return res.status(404).json({ message: 'Session not found' });
      }

      // Trouver l'expert demandé
      let expert: TunnelExpert | undefined;
      
      // Chercher d'abord dans les experts de la situation actuelle
      if (session.currentSituation?.experts) {
        expert = session.currentSituation.experts.find(e => e.name === expertName);
      }
      
      // Sinon chercher dans les experts du scénario
      if (!expert && session.currentScenario?.experts) {
        expert = session.currentScenario.experts.find(e => e.name === expertName);
      }
      
      // Si toujours pas trouvé, utiliser l'expert présentant la situation actuelle
      if (!expert && session.currentSituation) {
        expert = {
          name: session.currentSituation.expertName,
          role: session.currentSituation.expertRole,
          expertise: "Expert en cybersécurité"
        };
      }

      if (!expert) {
        return res.status(404).json({ message: 'Expert not found' });
      }

      // Générer une réponse de l'expert via l'IA
      const expertResponse = await tunnelAIService.generateExpertResponse(
        message,
        expert,
        session
      );

      res.json({
        expertName: expert.name,
        expertRole: expert.role,
        response: expertResponse
      });
    } catch (error: any) {
      console.error('Error generating expert response:', error);
      res.status(500).json({ 
        message: 'Failed to generate expert response', 
        error: error.message 
      });
    }
  });
}