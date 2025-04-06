import { Router, Request, Response } from 'express';
import { immersiveScenarioService } from '../../I_AM_CYBER/services/immersive-scenario-service';
import { immersiveScenarios } from '../../I_AM_CYBER/data/immersive-scenarios';
import { UserRole } from '../../shared/types/immersive-cyber';

// Création d'un router Express pour les routes spécifiques aux simulations immersives
const router = Router();

/**
 * Route GET pour obtenir tous les scénarios disponibles
 */
router.get('/scenarios', async (req: Request, res: Response) => {
  try {
    const scenarios = await immersiveScenarioService.getAvailableScenarios();
    return res.json({ success: true, scenarios });
  } catch (error) {
    console.error('Erreur lors de la récupération des scénarios:', error);
    return res.status(500).json({ success: false, message: 'Erreur lors de la récupération des scénarios' });
  }
});

/**
 * Route GET pour obtenir un scénario spécifique par ID
 */
router.get('/scenarios/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // Pour l'instant, utilisons notre liste importée
    const scenario = immersiveScenarios.find(s => s.id === id);
    
    if (!scenario) {
      return res.status(404).json({ success: false, message: 'Scénario non trouvé' });
    }
    
    return res.json({ success: true, scenario });
  } catch (error) {
    console.error('Erreur lors de la récupération du scénario:', error);
    return res.status(500).json({ success: false, message: 'Erreur lors de la récupération du scénario' });
  }
});

/**
 * Route POST pour démarrer une nouvelle session de simulation
 */
router.post('/sessions', async (req: Request, res: Response) => {
  try {
    const { scenarioId, userId, selectedRole } = req.body;
    
    if (!scenarioId || !userId || !selectedRole) {
      return res.status(400).json({ success: false, message: 'Paramètres manquants' });
    }
    
    const session = await immersiveScenarioService.startSession(
      scenarioId,
      userId,
      selectedRole as UserRole
    );
    
    return res.json({ success: true, session });
  } catch (error) {
    console.error('Erreur lors du démarrage de la session:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur lors du démarrage de la session',
      error: (error as Error).message
    });
  }
});

/**
 * Route GET pour obtenir l'état actuel d'une session
 */
router.get('/sessions/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const session = immersiveScenarioService.getSession(id);
    
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session non trouvée' });
    }
    
    return res.json({ success: true, session });
  } catch (error) {
    console.error('Erreur lors de la récupération de la session:', error);
    return res.status(500).json({ success: false, message: 'Erreur lors de la récupération de la session' });
  }
});

/**
 * Route POST pour prendre une décision dans une session
 */
router.post('/sessions/:id/decisions', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { decisionPointId, optionId } = req.body;
    
    if (!decisionPointId || !optionId) {
      return res.status(400).json({ success: false, message: 'Paramètres de décision manquants' });
    }
    
    const result = await immersiveScenarioService.processDecision(id, decisionPointId, optionId);
    
    return res.json({ 
      success: true, 
      consequences: result.consequences,
      feedback: result.feedback,
      session: result.updatedSession
    });
  } catch (error) {
    console.error('Erreur lors du traitement de la décision:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur lors du traitement de la décision',
      error: (error as Error).message
    });
  }
});

/**
 * Route POST pour démarrer une conversation avec un PNJ
 */
router.post('/sessions/:id/conversations', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { characterId } = req.body;
    
    if (!characterId) {
      return res.status(400).json({ success: false, message: 'ID du personnage manquant' });
    }
    
    const conversation = await immersiveScenarioService.startConversation(id, characterId);
    
    return res.json({ success: true, conversation });
  } catch (error) {
    console.error('Erreur lors du démarrage de la conversation:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur lors du démarrage de la conversation',
      error: (error as Error).message
    });
  }
});

/**
 * Route POST pour envoyer un message à un PNJ dans une conversation
 */
router.post('/conversations/:id/messages', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message manquant' });
    }
    
    const result = await immersiveScenarioService.sendMessageToNPC(id, message);
    
    return res.json({ 
      success: true, 
      response: result.response,
      emotion: result.emotion,
      conversation: result.updatedConversation
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de l\'envoi du message',
      error: (error as Error).message
    });
  }
});

/**
 * Route GET pour obtenir les personnages disponibles dans une session
 */
router.get('/sessions/:id/characters', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const session = immersiveScenarioService.getSession(id);
    
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session non trouvée' });
    }
    
    // Récupérer le scénario pour obtenir les personnages
    const scenario = immersiveScenarios.find(s => s.id === session.scenarioId);
    
    if (!scenario) {
      return res.status(404).json({ success: false, message: 'Scénario non trouvé' });
    }
    
    // Filtrer et enrichir les personnages avec leurs relations avec le joueur
    const charactersWithRelationships = scenario.characters.map(character => {
      return {
        ...character,
        relationshipLevel: session.characterRelationships[character.id] || 0
      };
    });
    
    return res.json({ success: true, characters: charactersWithRelationships });
  } catch (error) {
    console.error('Erreur lors de la récupération des personnages:', error);
    return res.status(500).json({ success: false, message: 'Erreur lors de la récupération des personnages' });
  }
});

/**
 * Route GET pour obtenir les actions disponibles dans la phase actuelle
 */
router.get('/sessions/:id/available-actions', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const session = immersiveScenarioService.getSession(id);
    
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session non trouvée' });
    }
    
    // Récupérer le scénario pour obtenir les actions de la phase actuelle
    const scenario = immersiveScenarios.find(s => s.id === session.scenarioId);
    
    if (!scenario) {
      return res.status(404).json({ success: false, message: 'Scénario non trouvé' });
    }
    
    // Trouver la phase actuelle
    let currentPhase;
    for (const arc of scenario.narrativeArcs) {
      const phase = arc.phases.find(p => p.id === session.currentPhase);
      if (phase) {
        currentPhase = phase;
        break;
      }
    }
    
    if (!currentPhase) {
      return res.status(404).json({ success: false, message: 'Phase actuelle non trouvée' });
    }
    
    // Filtrer les actions en fonction du rôle de l'utilisateur
    const availableActions = currentPhase.availableActions.filter(action => 
      !action.requiredRole || action.requiredRole.includes(session.selectedRole)
    );
    
    return res.json({ success: true, actions: availableActions });
  } catch (error) {
    console.error('Erreur lors de la récupération des actions disponibles:', error);
    return res.status(500).json({ success: false, message: 'Erreur lors de la récupération des actions disponibles' });
  }
});

/**
 * Route POST pour exécuter une action
 */
router.post('/sessions/:id/execute-action', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { actionId } = req.body;
    
    if (!actionId) {
      return res.status(400).json({ success: false, message: 'ID de l\'action manquant' });
    }
    
    // Cette fonctionnalité sera implémentée plus tard, pour l'instant nous retournons un message temporaire
    return res.json({ 
      success: true, 
      message: 'Action exécutée avec succès (simulation)',
      consequences: ['Conséquence 1 de l\'action', 'Conséquence 2 de l\'action']
    });
  } catch (error) {
    console.error('Erreur lors de l\'exécution de l\'action:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de l\'exécution de l\'action',
      error: (error as Error).message
    });
  }
});

/**
 * Route GET pour obtenir le tableau de bord des métriques de la session
 */
router.get('/sessions/:id/metrics', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const session = immersiveScenarioService.getSession(id);
    
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session non trouvée' });
    }
    
    // Récupérer le scénario pour obtenir les définitions des métriques
    const scenario = immersiveScenarios.find(s => s.id === session.scenarioId);
    
    if (!scenario) {
      return res.status(404).json({ success: false, message: 'Scénario non trouvé' });
    }
    
    // Filtrer les métriques visibles pour le rôle sélectionné
    const visibleMetrics: Record<string, any> = {};
    
    scenario.metrics.categories.forEach(category => {
      const visibleCategoryMetrics = category.metrics.filter(metric => 
        metric.visibleToRoles.includes(session.selectedRole)
      ).map(metric => ({
        id: metric.id,
        name: metric.name,
        description: metric.description,
        value: session.currentMetrics[metric.id] || metric.initialValue,
        min: metric.min,
        max: metric.max,
        threshold: metric.thresholds.find(t => 
          (session.currentMetrics[metric.id] || metric.initialValue) <= t.value
        )
      }));
      
      if (visibleCategoryMetrics.length > 0) {
        visibleMetrics[category.id] = {
          name: category.name,
          description: category.description,
          metrics: visibleCategoryMetrics
        };
      }
    });
    
    return res.json({ success: true, metrics: visibleMetrics });
  } catch (error) {
    console.error('Erreur lors de la récupération des métriques:', error);
    return res.status(500).json({ success: false, message: 'Erreur lors de la récupération des métriques' });
  }
});

/**
 * Route GET pour obtenir l'historique des événements de la session
 */
router.get('/sessions/:id/event-log', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const session = immersiveScenarioService.getSession(id);
    
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session non trouvée' });
    }
    
    return res.json({ success: true, events: session.sessionLog });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique des événements:', error);
    return res.status(500).json({ success: false, message: 'Erreur lors de la récupération de l\'historique des événements' });
  }
});

export default router;