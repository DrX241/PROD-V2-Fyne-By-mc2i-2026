import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { 
  GameState, 
  Player, 
  NPC, 
  Scenario, 
  GameEvent,
  PlayerRole,
  NpcRole,
  EventType,
  ScenarioType,
  UrgencyLevel
} from '@shared/types/challenge';
// Import du service OpenAI correctement configuré avec les secrets d'environnement
import { openAIService } from '../services/openAiService';

// Stockage temporaire en mémoire pour les jeux
const games: GameState[] = [];

// Créer un nouveau jeu
export async function createGame(req: Request, res: Response) {
  try {
    const { playerCount = 1 } = req.body;
    
    const gameId = uuidv4();
    
    const newGame: GameState = {
      id: gameId,
      players: [],
      npcs: [],
      gameEvents: [],
      scenario: {
        title: '',
        description: '',
        type: ScenarioType.RANSOMWARE,
        difficultyLevel: 'medium',
        initialBudget: 400000,
        remainingBudget: 400000,
        maxTurns: 10,
        objectives: [],
        assets: [],
        currentStage: 0,
        maxStages: 5,
        urgencyLevel: UrgencyLevel.MEDIUM,
        companyName: 'TechSecure',
        simulatedDate: new Date().toISOString()
      },
      currentPlayerIndex: 0,
      isGameOver: false,
      startedAt: Date.now()
    };
    
    // Ajouter des PNJ par défaut
    const defaultNpcs: NPC[] = [
      {
        id: uuidv4(),
        name: 'Nosing Doeuk',
        role: NpcRole.CEO,
        personality: 'Autoritaire et direct, oriente vers les résultats',
        description: 'PDG exigeant qui se soucie de la réputation de l\'entreprise et de minimiser les perturbations opérationnelles.',
        attitude: 'neutral',
        avatarUrl: ''
      },
      {
        id: uuidv4(),
        name: 'Neil Desai',
        role: NpcRole.CTO,
        personality: 'Analytique et technique, préoccupé par les détails',
        description: 'Directeur technique qui comprend les implications techniques profondes et peut fournir un contexte détaillé.',
        attitude: 'neutral',
        avatarUrl: ''
      },
      {
        id: uuidv4(),
        name: 'Edouard Idembi',
        role: NpcRole.CFO,
        personality: 'Prudent avec les budgets, oriente vers l\'efficacité des coûts',
        description: 'Directeur financier qui s\'inquiète de l\'impact économique et des implications budgétaires de chaque décision.',
        attitude: 'negative',
        avatarUrl: ''
      },
      {
        id: uuidv4(),
        name: 'Yanis Hamzaoui',
        role: NpcRole.SOC_ANALYST,
        personality: 'Pragmatique et calme sous pression',
        description: 'Analyste de SOC expérimenté qui possède une connaissance approfondie des tendances et indicateurs des menaces.',
        attitude: 'positive',
        avatarUrl: ''
      }
    ];
    
    newGame.npcs = defaultNpcs;
    games.push(newGame);
    
    // Événement système pour démarrer le jeu
    const initialEvent: GameEvent = {
      id: uuidv4(),
      timestamp: Date.now(),
      type: EventType.SYSTEM_EVENT,
      content: 'Bienvenue dans la simulation de crise cybersécurité. Configurez votre scénario pour commencer.',
    };
    
    newGame.gameEvents.push(initialEvent);
    
    res.status(201).json({ success: true, gameId });
  } catch (error) {
    console.error('Erreur lors de la création du jeu:', error);
    res.status(500).json({ error: "Erreur lors de la création du jeu", details: error.message });
  }
}

// Ajouter un joueur au jeu
export async function addPlayer(req: Request, res: Response) {
  try {
    const { gameId } = req.params;
    const { name, role } = req.body;
    
    const game = games.find(g => g.id === gameId);
    
    if (!game) {
      return res.status(404).json({ error: "Jeu non trouvé" });
    }
    
    const playerId = uuidv4();
    
    const newPlayer: Player = {
      id: playerId,
      name,
      role,
      score: 0,
      isActive: true
    };
    
    game.players.push(newPlayer);
    
    // Événement système pour annoncer l'arrivée du joueur
    const playerJoinedEvent: GameEvent = {
      id: uuidv4(),
      timestamp: Date.now(),
      type: EventType.SYSTEM_EVENT,
      content: `${name} a rejoint la simulation en tant que ${role}.`,
    };
    
    game.gameEvents.push(playerJoinedEvent);
    
    res.status(201).json({ success: true, player: newPlayer });
  } catch (error) {
    console.error('Erreur lors de l\'ajout du joueur:', error);
    res.status(500).json({ error: "Erreur lors de l'ajout du joueur", details: error.message });
  }
}

// Configurer le scénario du jeu
export async function configureScenario(req: Request, res: Response) {
  try {
    const { gameId } = req.params;
    const { difficultyLevel, scenarioType } = req.body;
    
    const game = games.find(g => g.id === gameId);
    
    if (!game) {
      return res.status(404).json({ error: "Jeu non trouvé" });
    }
    
    // Générer un scénario avec GPT-4o
    try {
      const prompt = `Génère un scénario de crise cybersécurité réaliste avec les caractéristiques suivantes :
      - Type d'incident : ${scenarioType}
      - Niveau de difficulté : ${difficultyLevel}
      - Entreprise fictive : TechSecure, une entreprise technologique de taille moyenne
      
      Le scénario doit inclure:
      1. Un titre concis et percutant
      2. Une description détaillée de la situation (1-2 paragraphes)
      3. 5 objectifs clairs à atteindre
      4. Une liste de 5 actifs critiques menacés par l'incident
      5. Un niveau d'urgence (low, medium, high, critical)
      
      Réponds uniquement au format JSON valide avec cette structure:
      {
        "title": "Titre du scénario",
        "description": "Description de la situation...",
        "objectives": ["Objectif 1", "Objectif 2", ...],
        "assets": ["Actif 1", "Actif 2", ...],
        "urgencyLevel": "medium"
      }`;
      
      // Utiliser l'API OpenAI pour générer le scénario
      const completion = await openAIService.generateCompletion({
        promptText: prompt,
        maxTokens: 1000,
        temperature: 0.7,
        system: "Tu es un expert en cybersécurité qui génère des scénarios réalistes de crise informatique pour une simulation."
      });
      
      let scenarioData;
      
      try {
        scenarioData = JSON.parse(completion.text);
      } catch (parseError) {
        console.error('Erreur de parsing JSON:', parseError);
        
        // Fallback - créer un scénario par défaut
        scenarioData = {
          title: `Crise de ${scenarioType}`,
          description: `Un incident grave de cybersécurité de type ${scenarioType} affecte les systèmes critiques.`,
          objectives: [
            "Identifier la source de l'incident",
            "Contenir la propagation de l'attaque",
            "Récupérer les systèmes affectés",
            "Communiquer avec les parties prenantes",
            "Documenter l'incident pour analyse post-mortem"
          ],
          assets: [
            "Base de données clients",
            "Système ERP",
            "Infrastructure réseau",
            "Serveurs de production",
            "Postes de travail des employés"
          ],
          urgencyLevel: difficultyLevel === "easy" ? "low" : difficultyLevel === "hard" ? "high" : "medium"
        };
      }
      
      // Mettre à jour le scénario du jeu
      game.scenario = {
        ...game.scenario,
        title: scenarioData.title,
        description: scenarioData.description,
        type: scenarioType as ScenarioType,
        difficultyLevel,
        objectives: scenarioData.objectives,
        assets: scenarioData.assets,
        urgencyLevel: scenarioData.urgencyLevel as UrgencyLevel,
        // Maintenir les valeurs existantes ou par défaut pour le reste
        initialBudget: 400000,
        remainingBudget: 400000,
        maxTurns: difficultyLevel === "easy" ? 12 : difficultyLevel === "hard" ? 8 : 10,
        maxStages: difficultyLevel === "easy" ? 3 : difficultyLevel === "hard" ? 7 : 5,
        currentStage: 1,
        companyName: 'TechSecure',
        simulatedDate: new Date().toISOString()
      };
      
      // Événement système pour annoncer la configuration du scénario
      const scenarioConfiguredEvent: GameEvent = {
        id: uuidv4(),
        timestamp: Date.now(),
        type: EventType.SYSTEM_EVENT,
        content: `Scénario configuré : ${scenarioData.title}`,
      };
      
      game.gameEvents.push(scenarioConfiguredEvent);
      
      res.json({ success: true, scenario: game.scenario });
    } catch (aiError) {
      console.error('Erreur lors de la génération du scénario avec l\'IA:', aiError);
      
      // Fallback si l'IA échoue
      game.scenario = {
        ...game.scenario,
        title: `Incident de ${scenarioType}`,
        description: `Un incident grave de cybersécurité affecte les systèmes critiques de l'entreprise.`,
        type: scenarioType as ScenarioType,
        difficultyLevel,
        objectives: [
          "Identifier l'origine de l'attaque",
          "Limiter les dégâts",
          "Restaurer les systèmes",
          "Informer les parties prenantes",
          "Préparer un rapport d'incident"
        ],
        assets: [
          "Données clients",
          "Infrastructure IT",
          "Propriété intellectuelle",
          "Systèmes de paiement",
          "Réputation de l'entreprise"
        ],
        urgencyLevel: difficultyLevel === "easy" ? UrgencyLevel.LOW : 
                    difficultyLevel === "hard" ? UrgencyLevel.HIGH : 
                    UrgencyLevel.MEDIUM,
        initialBudget: 400000,
        remainingBudget: 400000,
        maxTurns: 10,
        currentStage: 1,
        maxStages: 5,
        companyName: 'TechSecure',
        simulatedDate: new Date().toISOString()
      };
      
      res.json({ success: true, scenario: game.scenario });
    }
  } catch (error) {
    console.error('Erreur lors de la configuration du scénario:', error);
    res.status(500).json({ error: "Erreur lors de la configuration du scénario", details: error.message });
  }
}

// Démarrer le jeu
export async function startGame(req: Request, res: Response) {
  try {
    const { gameId } = req.params;
    
    const game = games.find(g => g.id === gameId);
    
    if (!game) {
      return res.status(404).json({ error: "Jeu non trouvé" });
    }
    
    // Événement système pour le début du jeu
    const gameStartEvent: GameEvent = {
      id: uuidv4(),
      timestamp: Date.now(),
      type: EventType.SYSTEM_EVENT,
      content: `Début de la simulation de crise "${game.scenario.title}". Bonne chance!`,
    };
    
    game.gameEvents.push(gameStartEvent);
    
    // Événement d'introduction par le PDG
    const ceoNpc = game.npcs.find(npc => npc.role === NpcRole.CEO);
    if (ceoNpc) {
      const ceoIntroEvent: GameEvent = {
        id: uuidv4(),
        timestamp: Date.now() + 1000,
        type: EventType.NPC_RESPONSE,
        npcId: ceoNpc.id,
        content: `Bonjour à tous, nous avons une situation critique. ${game.scenario.description.substring(0, 150)}... J'attends vos recommandations immédiates.`,
      };
      game.gameEvents.push(ceoIntroEvent);
    }
    
    // Événement d'introduction par le CTO
    const ctoNpc = game.npcs.find(npc => npc.role === NpcRole.CTO);
    if (ctoNpc) {
      const ctoIntroEvent: GameEvent = {
        id: uuidv4(),
        timestamp: Date.now() + 2000,
        type: EventType.NPC_RESPONSE,
        npcId: ctoNpc.id,
        content: `Nos équipes techniques sont en alerte. Nos actifs clés menacés sont : ${game.scenario.assets.slice(0, 3).join(', ')}... Nous avons besoin d'un plan d'action clair.`,
      };
      game.gameEvents.push(ctoIntroEvent);
    }
    
    // Événement d'introduction par le point de décision
    const decisionPoint: GameEvent = {
      id: uuidv4(),
      timestamp: Date.now() + 3000,
      type: EventType.DECISION_POINT,
      content: `Quelle est votre première action pour faire face à cette crise? Vous disposez d'un budget initial de ${game.scenario.initialBudget.toLocaleString()} €.`,
    };
    game.gameEvents.push(decisionPoint);
    
    res.json({ success: true, game });
  } catch (error) {
    console.error('Erreur lors du démarrage du jeu:', error);
    res.status(500).json({ error: "Erreur lors du démarrage du jeu", details: error.message });
  }
}

// Traiter une action d'un joueur
export async function submitPlayerAction(req: Request, res: Response) {
  try {
    const { gameId } = req.params;
    const { action, targetNpcId } = req.body;
    
    const game = games.find(g => g.id === gameId);
    
    if (!game) {
      return res.status(404).json({ error: "Jeu non trouvé" });
    }
    
    const activePlayer = game.players[game.currentPlayerIndex];
    
    if (!activePlayer) {
      return res.status(400).json({ error: "Joueur actif non trouvé" });
    }
    
    // Enregistrer l'action du joueur comme événement
    const playerActionEvent: GameEvent = {
      id: uuidv4(),
      timestamp: Date.now(),
      type: EventType.PLAYER_ACTION,
      playerId: activePlayer.id,
      content: action,
    };
    
    game.gameEvents.push(playerActionEvent);
    
    try {
      // Utiliser l'API OpenAI pour évaluer l'action et générer une réponse
      const prompt = `Contexte : Simulation de crise cybersécurité
      - Type d'incident : ${game.scenario.type}
      - Niveau d'urgence : ${game.scenario.urgencyLevel}
      - Étape actuelle : ${game.scenario.currentStage}/${game.scenario.maxStages}
      - Budget restant : ${game.scenario.remainingBudget} €
      - Joueur : ${activePlayer.name}, rôle : ${activePlayer.role}
      - Scénario : ${game.scenario.description}
      
      Action du joueur : "${action}"
      
      Évalue l'action du joueur et génère une réponse appropriée. Si l'action est dirigée vers un PNJ spécifique, adopte son point de vue et sa personnalité dans ta réponse.
      
      ${targetNpcId ? `L'action est dirigée vers ${game.npcs.find(npc => npc.id === targetNpcId)?.name}, ${game.npcs.find(npc => npc.id === targetNpcId)?.role}.
      Personnalité du PNJ : ${game.npcs.find(npc => npc.id === targetNpcId)?.personality}` : ''}
      
      Réponds au format JSON suivant:
      {
        "response": "Texte de la réponse...",
        "points": Number (entre -5 et 10),
        "budgetChange": Number (avec signe négatif si coût, positif si économie),
        "feedback": "Brève explication de l'évaluation",
        "isPositive": Boolean
      }`;
      
      const completion = await openAIService.generateCompletion({
        promptText: prompt,
        maxTokens: 1000,
        temperature: 0.7,
        system: "Tu es un expert en cybersécurité qui évalue les décisions prises pendant une crise informatique et génère des réponses réalistes."
      });
      
      let responseData;
      
      try {
        responseData = JSON.parse(completion.text);
      } catch (parseError) {
        console.error('Erreur de parsing JSON:', parseError);
        
        // Fallback - créer une réponse par défaut
        responseData = {
          response: "Je comprends votre approche, mais nous devons examiner plus en détail les implications de cette action.",
          points: 0,
          budgetChange: -5000,
          feedback: "Action neutre avec impact budgétaire mineur",
          isPositive: true
        };
      }
      
      // Mettre à jour le score du joueur
      activePlayer.score += responseData.points;
      
      // Mettre à jour le budget
      game.scenario.remainingBudget += responseData.budgetChange;
      
      // Créer un événement pour la réponse
      let responseEvent: GameEvent;
      
      if (targetNpcId) {
        // Réponse d'un PNJ spécifique
        responseEvent = {
          id: uuidv4(),
          timestamp: Date.now() + 500,
          type: EventType.NPC_RESPONSE,
          npcId: targetNpcId,
          content: responseData.response,
          metadata: {
            points: responseData.points,
            budgetChange: responseData.budgetChange,
            remainingBudget: game.scenario.remainingBudget
          }
        };
      } else {
        // Réponse système
        responseEvent = {
          id: uuidv4(),
          timestamp: Date.now() + 500,
          type: EventType.SYSTEM_EVENT,
          content: responseData.response,
          metadata: {
            points: responseData.points,
            budgetChange: responseData.budgetChange,
            remainingBudget: game.scenario.remainingBudget
          }
        };
      }
      
      game.gameEvents.push(responseEvent);
      
      // Progression de l'étape après certaines actions
      const shouldProgressStage = Math.random() > 0.7; // 30% de chance de progression
      
      if (shouldProgressStage && game.scenario.currentStage < game.scenario.maxStages) {
        game.scenario.currentStage += 1;
        
        // Événement de progression
        const progressionEvent: GameEvent = {
          id: uuidv4(),
          timestamp: Date.now() + 1000,
          type: EventType.SYSTEM_EVENT,
          content: `La situation évolue. Vous passez à l'étape ${game.scenario.currentStage}/${game.scenario.maxStages}.`,
        };
        
        game.gameEvents.push(progressionEvent);
        
        // Nouveau point de décision
        const decisionPointEvent: GameEvent = {
          id: uuidv4(),
          timestamp: Date.now() + 1500,
          type: EventType.DECISION_POINT,
          content: `Quelle est votre prochaine action? Budget restant: ${game.scenario.remainingBudget.toLocaleString()} €.`,
        };
        
        game.gameEvents.push(decisionPointEvent);
      }
      
      // Vérifier si le jeu est terminé
      if (game.scenario.currentStage >= game.scenario.maxStages) {
        // Fin du jeu par complétion des étapes
        return endGame(gameId, "Toutes les étapes sont complétées")
          .then(updatedGame => {
            res.json({ success: true, game: updatedGame });
          });
      }
      
      res.json({ success: true, game });
    } catch (aiError) {
      console.error('Erreur lors de l\'évaluation de l\'action avec l\'IA:', aiError);
      
      // Fallback si l'IA échoue
      const fallbackResponseEvent: GameEvent = {
        id: uuidv4(),
        timestamp: Date.now() + 500,
        type: EventType.SYSTEM_EVENT,
        content: "Votre action a été enregistrée, mais nous rencontrons des difficultés pour l'évaluer. Veuillez continuer.",
      };
      
      game.gameEvents.push(fallbackResponseEvent);
      
      res.json({ success: true, game });
    }
  } catch (error) {
    console.error('Erreur lors du traitement de l\'action:', error);
    res.status(500).json({ error: "Erreur lors du traitement de l'action", details: error.message });
  }
}

// Obtenir les détails d'un jeu
export async function getGameState(req: Request, res: Response) {
  try {
    const { gameId } = req.params;
    
    const game = games.find(g => g.id === gameId);
    
    if (!game) {
      return res.status(404).json({ error: "Jeu non trouvé" });
    }
    
    res.json({ game });
  } catch (error) {
    console.error('Erreur lors de la récupération des détails du jeu:', error);
    res.status(500).json({ error: "Erreur lors de la récupération des détails du jeu", details: error.message });
  }
}

// Terminer un jeu
export async function endGame(gameId: string, reason?: string): Promise<GameState> {
  return new Promise((resolve, reject) => {
    try {
      const game = games.find(g => g.id === gameId);
      
      if (!game) {
        reject(new Error("Jeu non trouvé"));
        return;
      }
      
      game.isGameOver = true;
      game.endedAt = Date.now();
      
      // Événement de fin de jeu
      const endGameEvent: GameEvent = {
        id: uuidv4(),
        timestamp: Date.now(),
        type: EventType.SYSTEM_EVENT,
        content: `Simulation terminée. ${reason || 'Merci d\'avoir participé.'}`,
      };
      
      game.gameEvents.push(endGameEvent);
      
      // Générer un résumé de la performance
      const activePlayer = game.players.find(p => p.isActive);
      
      if (activePlayer) {
        const summaryEvent: GameEvent = {
          id: uuidv4(),
          timestamp: Date.now() + 500,
          type: EventType.SYSTEM_EVENT,
          content: `Récapitulatif: Vous avez obtenu ${activePlayer.score} points et utilisé ${game.scenario.initialBudget - game.scenario.remainingBudget} € du budget.`,
        };
        
        game.gameEvents.push(summaryEvent);
      }
      
      resolve(game);
    } catch (error) {
      reject(error);
    }
  });
}