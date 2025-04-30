import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { OpenAIService } from "../services/openAiService";

// Instancier le service OpenAI
const openAIService = new OpenAIService();
import { 
  PlayerRole, 
  ScenarioType, 
  EventType,
  NpcRole,
  GameStatus
} from "@shared/types/challenge";

// Stockage en mémoire pour les jeux
interface Game {
  id: number;
  gameId: string;
  status: string;
  startedAt: Date;
  endedAt: Date | null;
  playerCount: number;
  scenarioData: any;
  currentPlayerIndex: number;
  isGameOver: boolean;
}

interface Player {
  id: number;
  playerId: string;
  gameId: string;
  name: string;
  role: string;
  score: number;
  active: boolean;
}

interface NPC {
  id: number;
  npcId: string;
  gameId: string;
  name: string;
  role: string;
  personality: string;
  description: string;
  attitude: string;
  avatarUrl?: string;
}

interface GameEvent {
  id: number;
  eventId: string;
  gameId: string;
  playerId?: string;
  npcId?: string;
  type: string;
  content: string;
  timestamp: Date;
  metadata?: any;
}

// Stockage en mémoire
const games: Game[] = [];
const players: Player[] = [];
const npcs: NPC[] = [];
const events: GameEvent[] = [];

// IDs auto-incrémentés
let nextGameId = 1;
let nextPlayerId = 1;
let nextNpcId = 1;
let nextEventId = 1;

/**
 * Crée un nouveau jeu de gestion de crise
 */
export async function createGame(req: Request, res: Response) {
  try {
    const { playerCount } = req.body;
    
    if (!playerCount || typeof playerCount !== 'number' || playerCount < 1) {
      return res.status(400).json({ 
        error: "Nombre de joueurs invalide" 
      });
    }
    
    const gameId = uuidv4();
    
    const newGame: Game = {
      id: nextGameId++,
      gameId,
      status: GameStatus.CONFIGURING,
      startedAt: new Date(),
      endedAt: null,
      playerCount,
      scenarioData: {},
      currentPlayerIndex: 0,
      isGameOver: false
    };
    
    games.push(newGame);
    
    // Ajouter un événement système pour la création du jeu
    const event: GameEvent = {
      id: nextEventId++,
      eventId: uuidv4(),
      gameId,
      type: EventType.SYSTEM_EVENT,
      content: "Nouvelle cellule de crise cybersécurité créée.",
      timestamp: new Date()
    };
    
    events.push(event);
    
    res.status(201).json({
      success: true,
      gameId,
      game: newGame
    });
  } catch (error) {
    console.error("Erreur lors de la création du jeu:", error);
    res.status(500).json({
      error: "Erreur lors de la création du jeu",
      details: error instanceof Error ? error.message : "Erreur inconnue"
    });
  }
}

/**
 * Ajoute un joueur à un jeu existant
 */
export async function addPlayer(req: Request, res: Response) {
  try {
    const { gameId } = req.params;
    const { name, role } = req.body;
    
    if (!name || !role) {
      return res.status(400).json({ 
        error: "Nom ou rôle du joueur manquant" 
      });
    }
    
    const game = games.find(g => g.gameId === gameId);
    
    if (!game) {
      return res.status(404).json({ 
        error: "Jeu non trouvé" 
      });
    }
    
    if (game.status !== GameStatus.CONFIGURING) {
      return res.status(400).json({ 
        error: "Impossible d'ajouter un joueur : le jeu n'est plus en phase de configuration" 
      });
    }
    
    const playerId = uuidv4();
    
    const newPlayer: Player = {
      id: nextPlayerId++,
      playerId,
      gameId,
      name,
      role,
      score: 0,
      active: true
    };
    
    players.push(newPlayer);
    
    // Ajouter un événement système pour l'ajout du joueur
    const event: GameEvent = {
      id: nextEventId++,
      eventId: uuidv4(),
      gameId,
      playerId,
      type: EventType.SYSTEM_EVENT,
      content: `${name} a rejoint l'équipe en tant que ${role}.`,
      timestamp: new Date()
    };
    
    events.push(event);
    
    res.status(201).json({
      success: true,
      player: newPlayer
    });
  } catch (error) {
    console.error("Erreur lors de l'ajout du joueur:", error);
    res.status(500).json({
      error: "Erreur lors de l'ajout du joueur",
      details: error instanceof Error ? error.message : "Erreur inconnue"
    });
  }
}

/**
 * Configure le scénario du jeu
 */
export async function configureScenario(req: Request, res: Response) {
  try {
    const { gameId } = req.params;
    const { difficultyLevel, scenarioType } = req.body;
    
    if (!difficultyLevel || !scenarioType) {
      return res.status(400).json({ 
        error: "Niveau de difficulté ou type de scénario manquant" 
      });
    }
    
    const game = games.find(g => g.gameId === gameId);
    
    if (!game) {
      return res.status(404).json({ 
        error: "Jeu non trouvé" 
      });
    }
    
    if (game.status !== GameStatus.CONFIGURING) {
      return res.status(400).json({ 
        error: "Le jeu n'est plus en phase de configuration" 
      });
    }
    
    // Générer le scénario
    const scenarioData = await generateScenario(difficultyLevel, scenarioType);
    
    // Mettre à jour le jeu avec le scénario
    game.scenarioData = scenarioData;
    game.status = GameStatus.READY;
    
    // Créer les PNJ basés sur le scénario
    await createNpcs(gameId, [
      {
        name: "Jean Nosing",
        role: NpcRole.CEO,
        personality: "Directif et orienté business, s'inquiète principalement de l'impact financier et sur l'image de l'entreprise",
        description: "PDG de l'entreprise avec 15 ans d'expérience, priorité à la continuité d'activité",
        attitude: "neutral"
      },
      {
        name: "Neil Offman",
        role: NpcRole.CTO,
        personality: "Technique, méthodique, privilégie les solutions complètes même si elles prennent plus de temps",
        description: "Directeur technique avec une expertise en architecture informatique, défend les investissements IT",
        attitude: "positive"
      },
      {
        name: "Edouard Finance",
        role: NpcRole.CFO,
        personality: "Prudent, attentif aux coûts, cherche le meilleur rapport coût/efficacité",
        description: "Directeur financier conservateur, réticent aux dépenses importantes sans ROI clair",
        attitude: "negative"
      },
      {
        name: "Yanis Analyze",
        role: NpcRole.SOC_ANALYST,
        personality: "Analytique, factuel, orienté détection et réponse aux incidents",
        description: "Analyste SOC expérimenté, expert en investigation numérique et détection des menaces",
        attitude: "positive"
      }
    ]);
    
    // Ajouter un événement système pour la configuration du scénario
    const event: GameEvent = {
      id: nextEventId++,
      eventId: uuidv4(),
      gameId,
      type: EventType.SYSTEM_EVENT,
      content: `Scénario '${scenarioData.title}' configuré. Difficulté: ${difficultyLevel}. Type: ${scenarioType}.`,
      timestamp: new Date()
    };
    
    events.push(event);
    
    res.json({
      success: true,
      scenario: scenarioData,
      game
    });
  } catch (error) {
    console.error("Erreur lors de la configuration du scénario:", error);
    res.status(500).json({
      error: "Erreur lors de la configuration du scénario",
      details: error instanceof Error ? error.message : "Erreur inconnue"
    });
  }
}

/**
 * Démarre le jeu
 */
export async function startGame(req: Request, res: Response) {
  try {
    const { gameId } = req.params;
    
    const game = games.find(g => g.gameId === gameId);
    
    if (!game) {
      return res.status(404).json({ 
        error: "Jeu non trouvé" 
      });
    }
    
    if (game.status !== GameStatus.READY) {
      return res.status(400).json({ 
        error: "Le jeu n'est pas prêt à démarrer" 
      });
    }
    
    // Mettre à jour le statut du jeu
    game.status = GameStatus.IN_PROGRESS;
    
    // Ajouter un événement système pour le début du jeu
    const event: GameEvent = {
      id: nextEventId++,
      eventId: uuidv4(),
      gameId,
      type: EventType.SYSTEM_EVENT,
      content: "La cellule de crise est maintenant active. L'incident est en cours.",
      timestamp: new Date()
    };
    
    events.push(event);
    
    // Générer le premier point de décision
    const decisionPoint: GameEvent = {
      id: nextEventId++,
      eventId: uuidv4(),
      gameId,
      type: EventType.DECISION_POINT,
      content: `${game.scenarioData.description}\n\nQuelle est votre première action en tant qu'équipe de gestion de crise ?`,
      timestamp: new Date()
    };
    
    events.push(decisionPoint);
    
    res.json({
      success: true,
      game,
      events: events.filter(e => e.gameId === gameId)
    });
  } catch (error) {
    console.error("Erreur lors du démarrage du jeu:", error);
    res.status(500).json({
      error: "Erreur lors du démarrage du jeu",
      details: error instanceof Error ? error.message : "Erreur inconnue"
    });
  }
}

/**
 * Soumet une action de joueur
 */
export async function submitPlayerAction(req: Request, res: Response) {
  try {
    const { gameId } = req.params;
    const { playerId, action, targetNpcId } = req.body;
    
    if (!playerId || !action) {
      return res.status(400).json({ 
        error: "ID du joueur ou action manquante" 
      });
    }
    
    const game = games.find(g => g.gameId === gameId);
    
    if (!game) {
      return res.status(404).json({ 
        error: "Jeu non trouvé" 
      });
    }
    
    if (game.status !== GameStatus.IN_PROGRESS) {
      return res.status(400).json({ 
        error: "Le jeu n'est pas en cours" 
      });
    }
    
    const player = players.find(p => p.playerId === playerId && p.gameId === gameId);
    
    if (!player) {
      return res.status(404).json({ 
        error: "Joueur non trouvé dans ce jeu" 
      });
    }
    
    // Enregistrer l'action du joueur
    const actionEvent: GameEvent = {
      id: nextEventId++,
      eventId: uuidv4(),
      gameId,
      playerId,
      npcId: targetNpcId,
      type: EventType.PLAYER_ACTION,
      content: action,
      timestamp: new Date()
    };
    
    events.push(actionEvent);
    
    // Évaluer l'action et générer une réponse
    const { evaluation, response, isGameOver } = await evaluatePlayerAction(gameId, playerId, action, targetNpcId);
    
    // Mettre à jour le score du joueur
    if (evaluation.points) {
      player.score += evaluation.points;
    }
    
    // Mettre à jour le budget du scénario
    if (evaluation.cost && game.scenarioData.remainingBudget) {
      game.scenarioData.remainingBudget = Math.max(0, game.scenarioData.remainingBudget - evaluation.cost);
    }
    
    // Ajouter la réponse comme événement
    const responseEvent: GameEvent = {
      id: nextEventId++,
      eventId: uuidv4(),
      gameId,
      npcId: targetNpcId || (response.npcId ? response.npcId : undefined),
      type: response.type || EventType.NPC_RESPONSE,
      content: response.content,
      timestamp: new Date(),
      metadata: {
        points: evaluation.points,
        cost: evaluation.cost,
        remainingBudget: game.scenarioData.remainingBudget
      }
    };
    
    events.push(responseEvent);
    
    // Vérifier si le jeu est terminé
    if (isGameOver) {
      game.isGameOver = true;
      game.endedAt = new Date();
      game.status = GameStatus.COMPLETED;
      
      // Générer un résumé de fin de jeu
      const summary = await generateGameSummary(gameId, "completed", players.filter(p => p.gameId === gameId));
      
      // Mettre à jour le scénario avec le résumé
      game.scenarioData.summary = summary;
      
      // Ajouter un événement de fin de jeu
      const endEvent: GameEvent = {
        id: nextEventId++,
        eventId: uuidv4(),
        gameId,
        type: EventType.SYSTEM_EVENT,
        content: "La situation de crise est maintenant sous contrôle. La cellule de crise est dissoute.",
        timestamp: new Date()
      };
      
      events.push(endEvent);
    } else {
      // Passer au joueur suivant
      const gamePlayers = players.filter(p => p.gameId === gameId && p.active);
      
      if (gamePlayers.length > 0) {
        game.currentPlayerIndex = (game.currentPlayerIndex + 1) % gamePlayers.length;
      }
    }
    
    res.json({
      success: true,
      event: actionEvent,
      response: responseEvent,
      evaluation,
      isGameOver,
      currentPlayerIndex: game.currentPlayerIndex
    });
  } catch (error) {
    console.error("Erreur lors de la soumission de l'action:", error);
    res.status(500).json({
      error: "Erreur lors de la soumission de l'action",
      details: error instanceof Error ? error.message : "Erreur inconnue"
    });
  }
}

/**
 * Termine le jeu
 */
export async function endGame(gameId: string, reason: string = 'completed') {
  const game = games.find(g => g.gameId === gameId);
  
  if (!game) {
    throw new Error("Jeu non trouvé");
  }
  
  game.isGameOver = true;
  game.endedAt = new Date();
  game.status = GameStatus.COMPLETED;
  
  // Générer un résumé de fin de jeu
  const gamePlayers = players.filter(p => p.gameId === gameId);
  const summary = await generateGameSummary(gameId, reason, gamePlayers);
  
  // Mettre à jour le scénario avec le résumé
  game.scenarioData.summary = summary;
  
  // Ajouter un événement de fin de jeu
  const endEvent: GameEvent = {
    id: nextEventId++,
    eventId: uuidv4(),
    gameId,
    type: EventType.SYSTEM_EVENT,
    content: "La situation de crise est maintenant terminée. " + 
             (reason === 'completed' ? "La cellule de crise est dissoute avec succès." : 
              "La cellule de crise a été dissoute prématurément."),
    timestamp: new Date()
  };
  
  events.push(endEvent);
  
  return game;
}

/**
 * Récupère l'état actuel du jeu
 */
export async function getGameState(req: Request, res: Response) {
  try {
    const { gameId } = req.params;
    
    const game = games.find(g => g.gameId === gameId);
    
    if (!game) {
      return res.status(404).json({ 
        error: "Jeu non trouvé" 
      });
    }
    
    const gamePlayers = players.filter(p => p.gameId === gameId);
    const gameNpcs = npcs.filter(n => n.gameId === gameId);
    const gameEvents = events.filter(e => e.gameId === gameId);
    
    res.json({
      game,
      players: gamePlayers,
      npcs: gameNpcs,
      events: gameEvents
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'état du jeu:", error);
    res.status(500).json({
      error: "Erreur lors de la récupération de l'état du jeu",
      details: error instanceof Error ? error.message : "Erreur inconnue"
    });
  }
}

/**
 * Crée les PNJ pour un jeu
 */
async function createNpcs(gameId: string, npcConfigs: any[]) {
  for (const config of npcConfigs) {
    const npcId = uuidv4();
    
    const newNpc: NPC = {
      id: nextNpcId++,
      npcId,
      gameId,
      name: config.name,
      role: config.role,
      personality: config.personality,
      description: config.description,
      attitude: config.attitude,
      avatarUrl: config.avatarUrl
    };
    
    npcs.push(newNpc);
  }
}

/**
 * Génère un scénario de jeu
 */
async function generateScenario(difficultyLevel: string, scenarioType: string) {
  // Choisir le type de scénario en fonction de l'entrée
  let type = ScenarioType.RANSOMWARE;
  
  if (scenarioType === 'data_breach') {
    type = ScenarioType.DATA_BREACH;
  } else if (scenarioType === 'phishing') {
    type = ScenarioType.PHISHING;
  } else if (scenarioType === 'malware') {
    type = ScenarioType.MALWARE;
  } else if (scenarioType === 'insider_threat') {
    type = ScenarioType.INSIDER_THREAT;
  } else if (scenarioType === 'supply_chain') {
    type = ScenarioType.SUPPLY_CHAIN;
  }
  
  // Générer un titre et une description de base en fonction du type
  let title = "";
  let description = "";
  
  switch (type) {
    case ScenarioType.RANSOMWARE:
      title = "Attaque par ransomware sur les systèmes de production";
      description = "L'entreprise EcoSolutions, spécialisée dans les solutions énergétiques, est victime d'une attaque de ransomware qui a chiffré plusieurs serveurs critiques. Des messages de demande de rançon sont apparus sur les écrans des employés.";
      break;
    case ScenarioType.DATA_BREACH:
      title = "Fuite de données clients sensibles";
      description = "La banque RegioBank a détecté un accès non autorisé à sa base de données clients contenant des informations personnelles et financières de plus de 50 000 clients. Certaines données ont déjà été publiées sur le dark web.";
      break;
    case ScenarioType.PHISHING:
      title = "Campagne de phishing ciblant les cadres";
      description = "L'entreprise TechInnovation fait face à une campagne sophistiquée de phishing visant spécifiquement les cadres dirigeants. Plusieurs comptes email ont potentiellement été compromis, dont celui du Directeur Financier.";
      break;
    case ScenarioType.MALWARE:
      title = "Infection par malware sur le réseau industriel";
      description = "L'usine principale de FabriTech a détecté une activité suspecte sur son réseau industriel. Un malware a été identifié et semble collecter des informations sur les systèmes SCADA de l'usine.";
      break;
    case ScenarioType.INSIDER_THREAT:
      title = "Menace interne et vol de propriété intellectuelle";
      description = "L'entreprise pharmaceutique MediLab a des raisons de croire qu'un employé a exfiltré des données de recherche confidentielles sur un nouveau médicament en développement avant de quitter l'entreprise récemment.";
      break;
    case ScenarioType.SUPPLY_CHAIN:
      title = "Compromission de la chaîne d'approvisionnement";
      description = "RetailGiant a été informé que l'un de ses fournisseurs de logiciel a été compromis. Le fournisseur a confirmé qu'une mise à jour malveillante a été distribuée à tous ses clients, y compris RetailGiant.";
      break;
  }
  
  // Ajuster la difficulté
  let initialBudget = 400000; // Budget par défaut
  let maxTurns = 10; // Nombre de tours par défaut
  
  if (difficultyLevel === 'easy') {
    initialBudget = 500000;
    maxTurns = 12;
  } else if (difficultyLevel === 'hard') {
    initialBudget = 300000;
    maxTurns = 8;
  }
  
  // Générer des objectifs en fonction du type de scénario
  const objectives = generateObjectives(type, difficultyLevel);
  
  // Générer une liste d'actifs à protéger
  const assets = generateAssets(type);
  
  // Construire le scénario complet
  return {
    title,
    description,
    type,
    difficultyLevel,
    initialBudget,
    remainingBudget: initialBudget,
    maxTurns,
    objectives,
    assets,
    // Ajouter une timeline fictive de l'incident
    timeline: [
      { time: "J-2, 23:45", event: "Première détection d'activité suspecte par le SIEM" },
      { time: "J-1, 08:30", event: "Intensification de l'activité anormale sur le réseau" },
      { time: "J-1, 22:15", event: "Premiers signes de compromission des systèmes" },
      { time: "J0, 04:30", event: "Déclenchement des alertes critiques" },
      { time: "J0, 07:00", event: "Signalement de l'incident et constitution de la cellule de crise" }
    ],
    // Ajouter des parties prenantes concernées
    stakeholders: [
      { name: "Direction Générale", interest: "Minimiser l'impact financier et sur la réputation" },
      { name: "Clients", interest: "Protection de leurs données et continuité de service" },
      { name: "Autorités de régulation", interest: "Conformité aux obligations légales de notification" },
      { name: "Employés", interest: "Continuité de leur activité et sécurité de l'emploi" },
      { name: "Partenaires commerciaux", interest: "Évaluation de leur propre exposition au risque" }
    ],
    companyName: getCompanyNameForScenario(type),
    // Paramètres de simulation
    currentStage: 0,
    maxStages: 4,
    urgencyLevel: "modéré",
    simulatedDate: new Date().toISOString()
  };
}

/**
 * Génère une liste d'objectifs en fonction du type de scénario
 */
function generateObjectives(scenarioType: ScenarioType, difficultyLevel: string) {
  const baseObjectives = [
    "Évaluer l'étendue de la compromission",
    "Contenir l'incident pour limiter sa propagation",
    "Identifier le vecteur d'attaque initial",
    "Communiquer de manière appropriée avec les parties prenantes"
  ];
  
  const additionalObjectives: Record<ScenarioType, string[]> = {
    [ScenarioType.RANSOMWARE]: [
      "Restaurer les systèmes critiques à partir des sauvegardes",
      "Décider de la stratégie face à la demande de rançon",
      "Mettre en place des mesures pour prévenir de futures attaques de ransomware"
    ],
    [ScenarioType.DATA_BREACH]: [
      "Déterminer quelles données ont été compromises",
      "Notifier les individus affectés conformément au RGPD",
      "Renforcer la sécurité des bases de données"
    ],
    [ScenarioType.PHISHING]: [
      "Analyser les emails malveillants pour comprendre la campagne",
      "Vérifier les comptes potentiellement compromis",
      "Mettre en place une formation de sensibilisation au phishing"
    ],
    [ScenarioType.MALWARE]: [
      "Isoler les systèmes infectés du réseau",
      "Analyser le malware pour comprendre ses capacités",
      "Mettre à jour les solutions anti-malware"
    ],
    [ScenarioType.INSIDER_THREAT]: [
      "Analyser les logs d'accès et d'activité de l'employé suspect",
      "Évaluer l'impact potentiel de la fuite d'informations",
      "Renforcer les contrôles d'accès et de surveillance"
    ],
    [ScenarioType.SUPPLY_CHAIN]: [
      "Évaluer l'impact de la compromission du fournisseur",
      "Isoler les systèmes potentiellement affectés",
      "Revoir le processus d'évaluation de sécurité des fournisseurs"
    ]
  };
  
  // Combiner les objectifs de base avec ceux spécifiques au type de scénario
  let objectives = [...baseObjectives, ...additionalObjectives[scenarioType]];
  
  // Ajuster en fonction de la difficulté
  if (difficultyLevel === 'hard') {
    // Ajouter des objectifs plus complexes pour les scénarios difficiles
    objectives.push("Préparer un rapport d'analyse forensique détaillé");
    objectives.push("Coordonner les actions avec les autorités compétentes");
  }
  
  return objectives;
}

/**
 * Génère une liste d'actifs en fonction du type de scénario
 */
function generateAssets(scenarioType: ScenarioType) {
  const commonAssets = [
    "Infrastructure réseau",
    "Serveurs de messagerie",
    "Postes de travail des employés",
    "Serveurs de stockage de fichiers"
  ];
  
  const specificAssets: Record<ScenarioType, string[]> = {
    [ScenarioType.RANSOMWARE]: [
      "Serveurs de production",
      "Systèmes de sauvegarde",
      "Serveurs de bases de données clients"
    ],
    [ScenarioType.DATA_BREACH]: [
      "Base de données clients",
      "Systèmes de gestion des identités",
      "Données financières sensibles"
    ],
    [ScenarioType.PHISHING]: [
      "Comptes email des dirigeants",
      "Système d'authentification",
      "Données d'accès aux systèmes critiques"
    ],
    [ScenarioType.MALWARE]: [
      "Systèmes SCADA",
      "Équipements industriels connectés",
      "Systèmes de contrôle de la production"
    ],
    [ScenarioType.INSIDER_THREAT]: [
      "Propriété intellectuelle",
      "Documents de recherche et développement",
      "Stratégies commerciales confidentielles"
    ],
    [ScenarioType.SUPPLY_CHAIN]: [
      "Applications fournies par des tiers",
      "Portail fournisseurs",
      "Systèmes de gestion de la chaîne logistique"
    ]
  };
  
  return [...commonAssets, ...specificAssets[scenarioType]];
}

/**
 * Retourne un nom d'entreprise fictif adapté au type de scénario
 */
function getCompanyNameForScenario(scenarioType: ScenarioType) {
  switch (scenarioType) {
    case ScenarioType.RANSOMWARE:
      return "EcoSolutions";
    case ScenarioType.DATA_BREACH:
      return "RegioBank";
    case ScenarioType.PHISHING:
      return "TechInnovation";
    case ScenarioType.MALWARE:
      return "FabriTech";
    case ScenarioType.INSIDER_THREAT:
      return "MediLab";
    case ScenarioType.SUPPLY_CHAIN:
      return "RetailGiant";
    default:
      return "Entreprise";
  }
}

/**
 * Évalue une action de joueur et génère une réponse
 */
async function evaluatePlayerAction(gameId: string, playerId: string, action: string, targetNpcId?: string) {
  // Récupérer les informations du jeu
  const game = games.find(g => g.gameId === gameId);
  const player = players.find(p => p.playerId === playerId);
  const targetNpc = targetNpcId ? npcs.find(n => n.npcId === targetNpcId) : null;
  
  if (!game || !player) {
    throw new Error("Jeu ou joueur non trouvé");
  }
  
  // Construire le contexte pour l'évaluation
  const scenarioType = game.scenarioData.type;
  const difficultyLevel = game.scenarioData.difficultyLevel;
  const playerRole = player.role;
  
  // Informations supplémentaires pour l'IA
  const previousActions = events
    .filter(e => e.gameId === gameId && e.type === EventType.PLAYER_ACTION)
    .map(e => ({
      playerId: e.playerId,
      playerName: players.find(p => p.playerId === e.playerId)?.name || "Unknown",
      playerRole: players.find(p => p.playerId === e.playerId)?.role || "Unknown",
      action: e.content,
      timestamp: e.timestamp
    }));
  
  // Construire le prompt pour l'évaluation
  const evaluationPrompt = `
Tu es un évaluateur expert en cybersécurité spécialisé dans la gestion de crise. Évalue l'action suivante d'un joueur dans une simulation de gestion de crise cybersécurité.

CONTEXTE DU SCÉNARIO:
- Type d'incident: ${scenarioType}
- Difficulté: ${difficultyLevel}
- Description: ${game.scenarioData.description}
- Objectifs: ${game.scenarioData.objectives.join(", ")}
- Actifs critiques à protéger: ${game.scenarioData.assets.join(", ")}

INFORMATIONS SUR LE JOUEUR:
- Rôle: ${playerRole}
- Nom: ${player.name}

ACTION DU JOUEUR:
"${action}"

${targetNpc ? `Cette action est dirigée vers ${targetNpc.name}, ${targetNpc.role}.\nPersonnalité de ${targetNpc.name}: ${targetNpc.personality}` : ""}

ACTIONS PRÉCÉDENTES:
${previousActions.length > 0 ? previousActions.map(a => `- ${a.playerName} (${a.playerRole}): "${a.action}"`).join("\n") : "Aucune action précédente."}

Évalue cette action et fournis une réponse au format JSON avec les champs suivants:
1. "points": valeur numérique entre -5 et 10 représentant l'efficacité de l'action pour résoudre la crise
2. "cost": coût estimé en euros de cette action (0-50000)
3. "feedback": explication brève de ton évaluation
4. "isPositive": booléen indiquant si l'action est globalement positive
5. "response": objet contenant:
   - "content": réponse narrative à l'action du joueur
   - "type": type de réponse (NPC_RESPONSE, SYSTEM_EVENT, etc.)
   - "npcId": ID du PNJ qui répond (si applicable)
6. "isGameOver": booléen indiquant si le jeu devrait se terminer suite à cette action

Réponds uniquement avec un objet JSON valide.`;

  // Appeler l'API OpenAI pour l'évaluation
  const evaluationResponse = await openAIService.generateJSONResponse(evaluationPrompt);
  
  // Extraire les données de la réponse
  const points = evaluationResponse.points || 0;
  const cost = evaluationResponse.cost || 0;
  const feedback = evaluationResponse.feedback || "Pas de feedback disponible";
  const isPositive = evaluationResponse.isPositive === true;
  const response = evaluationResponse.response || {
    content: "Pas de réponse disponible",
    type: EventType.NPC_RESPONSE,
    npcId: targetNpcId
  };
  const isGameOver = evaluationResponse.isGameOver === true;
  
  return {
    evaluation: {
      points,
      cost,
      feedback,
      isPositive
    },
    response,
    isGameOver
  };
}

/**
 * Génère un résumé de fin de jeu
 */
async function generateGameSummary(gameId: string, reason: string, players: Player[]) {
  // Récupérer les informations du jeu
  const game = games.find(g => g.gameId === gameId);
  
  if (!game) {
    throw new Error("Jeu non trouvé");
  }
  
  // Récupérer toutes les actions des joueurs
  const playerActions = events
    .filter(e => e.gameId === gameId && e.type === EventType.PLAYER_ACTION)
    .map(e => ({
      playerName: players.find(p => p.playerId === e.playerId)?.name || "Joueur inconnu",
      playerRole: players.find(p => p.playerId === e.playerId)?.role || "Rôle inconnu",
      action: e.content,
      timestamp: e.timestamp
    }));
  
  // Calculer les statistiques
  const totalScore = players.reduce((total, player) => total + player.score, 0);
  const remainingBudget = game.scenarioData.remainingBudget;
  const initialBudget = game.scenarioData.initialBudget;
  const budgetUsed = initialBudget - remainingBudget;
  const budgetPercentage = Math.round((remainingBudget / initialBudget) * 100);
  
  // Déterminer l'efficacité globale
  let outcome = "mitigée";
  if (totalScore > players.length * 5) {
    outcome = "excellente";
  } else if (totalScore > 0) {
    outcome = "satisfaisante";
  } else if (totalScore < players.length * -2) {
    outcome = "catastrophique";
  } else if (totalScore < 0) {
    outcome = "insuffisante";
  }
  
  // Construire le prompt pour le résumé
  const summaryPrompt = `
Tu es un expert en cybersécurité spécialisé dans l'analyse post-incident. Génère un rapport de synthèse complet pour cette simulation de gestion de crise cybersécurité.

CONTEXTE DU SCÉNARIO:
- Type d'incident: ${game.scenarioData.type}
- Description: ${game.scenarioData.description}
- Objectifs: ${game.scenarioData.objectives.join(", ")}

PARTICIPANTS:
${players.map(p => `- ${p.name} (${p.role}): ${p.score} points`).join("\n")}

ACTIONS CLÉS:
${playerActions.map(a => `- ${a.playerName} (${a.playerRole}): "${a.action}"`).join("\n")}

STATISTIQUES:
- Score total: ${totalScore} points
- Budget initial: ${initialBudget} €
- Budget restant: ${remainingBudget} € (${budgetPercentage}% préservé)
- Budget utilisé: ${budgetUsed} €
- Issue globale: ${outcome}

Génère un rapport de synthèse complet incluant:
1. Un résumé exécutif de la gestion de crise
2. Les décisions clés prises par l'équipe et leur impact
3. Les forces et faiblesses de la réponse à l'incident
4. Les recommandations pour améliorer la réponse aux incidents futurs
5. Une notation globale de la performance de l'équipe

Ton rapport doit être professionnel, factuel et formaté en sections claires.`;

  // Appeler l'API OpenAI pour générer le résumé
  const summaryResponse = await openAIService.generateCompletion(summaryPrompt);
  
  return summaryResponse;
}