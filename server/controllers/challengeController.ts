import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';
import { 
  games, players, npcs, gameEvents, 
  insertGameSchema, insertPlayerSchema, insertNpcSchema, insertGameEventSchema
} from '@shared/schema';
import { 
  PlayerRole, UrgencyLevel, NPCAttitude, EventType, 
  Player as PlayerType, Scenario, NPC as NPCType, GameEvent as GameEventType
} from '@shared/types/challenge';
import { generateText } from '../services/openAiService';
import { eq, and } from 'drizzle-orm';

/**
 * Crée une nouvelle partie
 */
export async function createGame(req: Request, res: Response) {
  try {
    const { playerCount } = req.body;
    
    if (!playerCount || playerCount < 1 || playerCount > 5) {
      return res.status(400).json({ error: 'Le nombre de joueurs doit être entre 1 et 5' });
    }
    
    const gameId = uuidv4();
    
    // Créer un jeu vide
    const [newGame] = await db.insert(games).values({
      gameId,
      playerCount,
      scenarioData: {} as any, // Sera mis à jour avec generateScenario
      status: 'setup',
    }).returning();
    
    res.status(201).json({ gameId: newGame.gameId });
  } catch (error) {
    console.error('Error creating game:', error);
    res.status(500).json({ error: 'Erreur lors de la création du jeu' });
  }
}

/**
 * Ajoute un joueur à une partie existante
 */
export async function addPlayer(req: Request, res: Response) {
  try {
    const { gameId } = req.params;
    const { name, role } = req.body;
    
    // Vérifier que le jeu existe
    const game = await db.query.games.findFirst({
      where: eq(games.gameId, gameId)
    });
    
    if (!game) {
      return res.status(404).json({ error: 'Jeu non trouvé' });
    }
    
    // Vérifier que le jeu est en phase de configuration
    if (game.status !== 'setup') {
      return res.status(400).json({ error: 'Le jeu a déjà commencé' });
    }
    
    // Compter les joueurs existants
    const existingPlayers = await db.query.players.findMany({
      where: eq(players.gameId, gameId)
    });
    
    if (existingPlayers.length >= game.playerCount) {
      return res.status(400).json({ error: 'Nombre maximum de joueurs atteint' });
    }
    
    // Vérifier si le rôle est disponible
    const roleExists = existingPlayers.some(p => p.role === role);
    if (roleExists) {
      return res.status(400).json({ error: 'Ce rôle est déjà pris' });
    }
    
    // Créer le joueur
    const playerId = uuidv4();
    const [newPlayer] = await db.insert(players).values({
      playerId,
      gameId,
      name,
      role,
      active: existingPlayers.length === 0, // Le premier joueur est actif par défaut
    }).returning();
    
    // Si tous les joueurs sont ajoutés, mettre à jour le statut du jeu
    if (existingPlayers.length + 1 === game.playerCount) {
      await db.update(games)
        .set({ status: 'ready_for_scenario' })
        .where(eq(games.gameId, gameId));
    }
    
    res.status(201).json(newPlayer);
  } catch (error) {
    console.error('Error adding player:', error);
    res.status(500).json({ error: 'Erreur lors de l\'ajout du joueur' });
  }
}

/**
 * Génère un scénario pour une partie
 */
export async function generateScenario(req: Request, res: Response) {
  try {
    const { gameId } = req.params;
    
    // Vérifier que le jeu existe et est en attente de scénario
    const game = await db.query.games.findFirst({
      where: eq(games.gameId, gameId)
    });
    
    if (!game) {
      return res.status(404).json({ error: 'Jeu non trouvé' });
    }
    
    if (game.status !== 'ready_for_scenario') {
      return res.status(400).json({ error: 'Le jeu n\'est pas prêt pour la génération du scénario' });
    }
    
    // Récupérer les joueurs
    const gamePlayers = await db.query.players.findMany({
      where: eq(players.gameId, gameId)
    });
    
    if (gamePlayers.length === 0) {
      return res.status(400).json({ error: 'Aucun joueur n\'a été ajouté' });
    }
    
    // Générer le scénario avec Azure OpenAI
    const scenario = await generateScenarioWithAI(gamePlayers);
    
    // Mettre à jour le jeu avec le scénario
    await db.update(games)
      .set({ 
        scenarioData: scenario as any,
        status: 'in_progress'
      })
      .where(eq(games.gameId, gameId));
    
    // Créer les PNJ pour le jeu
    for (const npc of scenario.npcs) {
      await db.insert(npcs).values({
        npcId: uuidv4(),
        gameId,
        name: npc.name,
        role: npc.role,
        personality: npc.personality,
        attitude: npc.attitude,
        avatarUrl: npc.avatarUrl
      });
    }
    
    // Ajouter l'email initial comme événement
    const emailEvent = {
      eventId: uuidv4(),
      gameId,
      type: EventType.EMAIL,
      content: JSON.stringify(scenario.initialEmail),
      timestamp: new Date()
    };
    
    await db.insert(gameEvents).values(emailEvent);
    
    // Ajouter un événement système pour indiquer le début du jeu
    const systemEvent = {
      eventId: uuidv4(),
      gameId,
      type: EventType.SYSTEM_EVENT,
      content: `Crise cybersécurité déclenchée chez ${scenario.companyName}. Budget initial: ${scenario.initialBudget}€`,
      timestamp: new Date()
    };
    
    await db.insert(gameEvents).values(systemEvent);
    
    res.status(200).json({ scenario });
  } catch (error) {
    console.error('Error generating scenario:', error);
    res.status(500).json({ error: 'Erreur lors de la génération du scénario' });
  }
}

/**
 * Traite une action de joueur
 */
export async function processPlayerAction(req: Request, res: Response) {
  try {
    const { gameId } = req.params;
    const { playerId, action } = req.body;
    
    // Vérifier que le jeu existe et est en cours
    const game = await db.query.games.findFirst({
      where: eq(games.gameId, gameId)
    });
    
    if (!game) {
      return res.status(404).json({ error: 'Jeu non trouvé' });
    }
    
    if (game.status !== 'in_progress') {
      return res.status(400).json({ error: 'Le jeu n\'est pas en cours' });
    }
    
    // Vérifier que le joueur existe et que c'est son tour
    const player = await db.query.players.findFirst({
      where: and(
        eq(players.gameId, gameId),
        eq(players.playerId, playerId)
      )
    });
    
    if (!player) {
      return res.status(404).json({ error: 'Joueur non trouvé' });
    }
    
    if (!player.active) {
      return res.status(400).json({ error: 'Ce n\'est pas votre tour' });
    }
    
    // Ajouter l'action du joueur comme événement
    const playerEvent = {
      eventId: uuidv4(),
      gameId,
      type: EventType.PLAYER_ACTION,
      content: action,
      playerId,
      timestamp: new Date()
    };
    
    await db.insert(gameEvents).values(playerEvent);
    
    // Évaluer l'action du joueur
    const evaluation = await evaluatePlayerAction(gameId, playerId, action, game.scenarioData);
    
    // Mettre à jour le score du joueur
    await db.update(players)
      .set({ score: player.score + evaluation.points })
      .where(and(
        eq(players.gameId, gameId),
        eq(players.playerId, playerId)
      ));
    
    // Mettre à jour le budget du scénario
    const scenarioData = { ...game.scenarioData as any };
    scenarioData.remainingBudget -= evaluation.cost;
    
    await db.update(games)
      .set({ scenarioData })
      .where(eq(games.gameId, gameId));
    
    // Ajouter un événement pour le budget
    if (evaluation.cost > 0) {
      const budgetEvent = {
        eventId: uuidv4(),
        gameId,
        type: EventType.BUDGET_UPDATE,
        content: `Budget utilisé: ${evaluation.cost}€`,
        metadata: {
          budgetChange: -evaluation.cost,
          remainingBudget: scenarioData.remainingBudget
        },
        timestamp: new Date()
      };
      
      await db.insert(gameEvents).values(budgetEvent);
    }
    
    // Générer les réponses des PNJ
    const npcResponses = await generateNPCResponses(gameId, playerId, action, evaluation);
    
    // Changer le tour au joueur suivant
    const allPlayers = await db.query.players.findMany({
      where: eq(players.gameId, gameId)
    });
    
    // Désactiver le joueur actuel
    await db.update(players)
      .set({ active: false })
      .where(and(
        eq(players.gameId, gameId),
        eq(players.playerId, playerId)
      ));
    
    // Activer le joueur suivant
    const currentIndex = allPlayers.findIndex(p => p.playerId === playerId);
    const nextIndex = (currentIndex + 1) % allPlayers.length;
    const nextPlayer = allPlayers[nextIndex];
    
    await db.update(players)
      .set({ active: true })
      .where(and(
        eq(players.gameId, gameId),
        eq(players.playerId, nextPlayer.playerId)
      ));
    
    // Mettre à jour l'index du joueur actuel dans le jeu
    await db.update(games)
      .set({ currentPlayerIndex: nextIndex })
      .where(eq(games.gameId, gameId));
    
    res.status(200).json({
      evaluation,
      npcResponses,
      nextPlayer: nextPlayer.playerId
    });
  } catch (error) {
    console.error('Error processing player action:', error);
    res.status(500).json({ error: 'Erreur lors du traitement de l\'action du joueur' });
  }
}

/**
 * Termine un jeu
 */
export async function endGame(req: Request, res: Response) {
  try {
    const { gameId } = req.params;
    
    // Vérifier que le jeu existe et est en cours
    const game = await db.query.games.findFirst({
      where: eq(games.gameId, gameId)
    });
    
    if (!game) {
      return res.status(404).json({ error: 'Jeu non trouvé' });
    }
    
    if (game.status !== 'in_progress') {
      return res.status(400).json({ error: 'Le jeu n\'est pas en cours' });
    }
    
    // Mettre à jour le jeu comme terminé
    await db.update(games)
      .set({ 
        status: 'completed',
        isGameOver: true,
        endedAt: new Date()
      })
      .where(eq(games.gameId, gameId));
    
    // Récupérer les joueurs et les événements
    const gamePlayers = await db.query.players.findMany({
      where: eq(players.gameId, gameId)
    });
    
    const events = await db.query.gameEvents.findMany({
      where: eq(gameEvents.gameId, gameId)
    });
    
    // Générer un résumé de la partie
    const summary = await generateGameSummary(gameId, game.scenarioData, gamePlayers, events);
    
    // Ajouter le résumé comme événement
    const summaryEvent = {
      eventId: uuidv4(),
      gameId,
      type: EventType.SYSTEM_EVENT,
      content: summary,
      timestamp: new Date()
    };
    
    await db.insert(gameEvents).values(summaryEvent);
    
    res.status(200).json({
      status: 'completed',
      summary
    });
  } catch (error) {
    console.error('Error ending game:', error);
    res.status(500).json({ error: 'Erreur lors de la finalisation du jeu' });
  }
}

/**
 * Récupère les détails d'un jeu
 */
export async function getGameDetails(req: Request, res: Response) {
  try {
    const { gameId } = req.params;
    
    // Récupérer les données du jeu, joueurs, PNJ et événements
    const game = await db.query.games.findFirst({
      where: eq(games.gameId, gameId)
    });
    
    if (!game) {
      return res.status(404).json({ error: 'Jeu non trouvé' });
    }
    
    const gamePlayers = await db.query.players.findMany({
      where: eq(players.gameId, gameId)
    });
    
    const gameNpcs = await db.query.npcs.findMany({
      where: eq(npcs.gameId, gameId)
    });
    
    const gameEventsList = await db.query.gameEvents.findMany({
      where: eq(gameEvents.gameId, gameId),
      orderBy: gameEvents.timestamp
    });
    
    res.status(200).json({
      game,
      players: gamePlayers,
      npcs: gameNpcs,
      events: gameEventsList
    });
  } catch (error) {
    console.error('Error getting game details:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des détails du jeu' });
  }
}

/**
 * Fonctions auxiliaires
 */

/**
 * Génère un scénario avec l'IA
 */
async function generateScenarioWithAI(gamePlayers: any[]): Promise<any> {
  // Construction du prompt pour l'IA
  const playerRoles = gamePlayers.map(p => `${p.name} (${p.role})`).join(', ');
  
  const prompt = `
  Génère un scénario réaliste de crise en cybersécurité avec les éléments suivants:
  
  1. Une entreprise fictive française ou européenne qui subit une attaque
  2. Un email initial urgent décrivant la situation critique
  3. Un budget initial de 400 000 euros pour gérer la crise
  4. Une date et heure simulées (actuelles)
  5. Un niveau d'urgence (CRITICAL, HIGH, MEDIUM, LOW)
  6. Des personnages non-joueurs avec des personnalités fortes et distinctes
  
  Les joueurs suivants participeront: ${playerRoles}
  
  Génère des PNJ pour les rôles non choisis parmi:
  - Directeur Général (autoritaire)
  - Directeur Technique (rigoureux)
  - Directeur Financier (stressé par le budget)
  - Analyste SOC (pragmatique)
  - Développeur (solutions rapides)
  - Consultant externe (perspective nouvelle)
  
  Format de réponse JSON:
  {
    "companyName": "Nom de l'entreprise",
    "initialBudget": 400000,
    "remainingBudget": 400000,
    "simulatedDate": "YYYY-MM-DD HH:MM:SS",
    "urgencyLevel": "CRITICAL/HIGH/MEDIUM/LOW",
    "title": "Titre de la crise",
    "description": "Description détaillée de l'incident",
    "initialEmail": {
      "sender": {"name": "Nom", "email": "email", "role": "Rôle"},
      "recipient": "équipe cybersécurité",
      "subject": "Objet de l'email",
      "content": "Contenu de l'email d'alerte",
      "isUrgent": true
    },
    "npcs": [
      {"name": "Nom", "role": "Rôle", "personality": "Description", "attitude": "supportive/neutral/obstructive"},
      ...
    ],
    "currentStage": 1,
    "maxStages": 5
  }
  `;
  
  // Appel à l'IA
  const completion = await generateText(prompt, 0.7);
  
  // Parser et retourner le JSON
  try {
    const parsedResponse = extractJsonFromResponse(completion);
    // Ajouter un ID au scénario
    parsedResponse.id = uuidv4();
    
    // Ajouter un ID à l'email initial
    if (parsedResponse.initialEmail) {
      parsedResponse.initialEmail.id = uuidv4();
      parsedResponse.initialEmail.timestamp = Date.now();
    }
    
    return parsedResponse;
  } catch (error) {
    console.error('Error parsing AI response:', error);
    throw new Error('Impossible de générer un scénario valide');
  }
}

/**
 * Évalue une action de joueur
 */
async function evaluatePlayerAction(gameId: string, playerId: string, action: string, scenarioData: any): Promise<any> {
  // Récupérer les données du joueur et du scénario
  const player = await db.query.players.findFirst({
    where: and(
      eq(players.gameId, gameId),
      eq(players.playerId, playerId)
    )
  });
  
  if (!player) throw new Error('Joueur non trouvé');
  
  // Construction du prompt pour l'IA
  const prompt = `
  Évalue cette action dans le contexte d'une crise de cybersécurité.
  
  Contexte de la crise:
  ${scenarioData.description}
  
  Joueur: ${player.name} (${player.role})
  Action: "${action}"
  
  Budget restant: ${scenarioData.remainingBudget}€ sur 400 000€ initiaux
  
  Évalue cette action selon ces critères:
  1. Efficacité pour résoudre la crise
  2. Respect des bonnes pratiques de cybersécurité
  3. Pertinence par rapport au rôle du joueur
  4. Coût financier réaliste
  5. Impact sur les autres parties prenantes
  
  Format de réponse JSON:
  {
    "points": X, // Entre -5 et +10
    "cost": Y, // Coût en euros, entre 0 et 50000
    "feedback": "Explication détaillée",
    "isPositive": true/false
  }
  `;
  
  // Appel à l'IA
  const completion = await generateText(prompt, 0.7);
  
  // Parser et retourner le JSON
  try {
    return extractJsonFromResponse(completion);
  } catch (error) {
    console.error('Error parsing AI evaluation:', error);
    // Fournir une évaluation par défaut
    return {
      points: 0,
      cost: 5000,
      feedback: "Impossible d'évaluer votre action. Veuillez être plus précis.",
      isPositive: false
    };
  }
}

/**
 * Génère les réponses des PNJ
 */
async function generateNPCResponses(gameId: string, playerId: string, action: string, evaluation: any): Promise<any[]> {
  // Récupérer les PNJ
  const gameNpcs = await db.query.npcs.findMany({
    where: eq(npcs.gameId, gameId)
  });
  
  if (gameNpcs.length === 0) return [];
  
  // Récupérer le joueur et le jeu
  const player = await db.query.players.findFirst({
    where: and(
      eq(players.gameId, gameId),
      eq(players.playerId, playerId)
    )
  });
  
  const game = await db.query.games.findFirst({
    where: eq(games.gameId, gameId)
  });
  
  if (!player || !game) throw new Error('Joueur ou jeu non trouvé');
  
  const scenarioData = game.scenarioData as any;
  
  // Sélectionner aléatoirement 1 à 3 PNJ qui vont répondre
  const respondingNpcs = selectRandomNpcs(gameNpcs, Math.min(3, gameNpcs.length));
  
  const responses = [];
  
  // Générer une réponse pour chaque PNJ sélectionné
  for (const npc of respondingNpcs) {
    // Construction du prompt
    const prompt = `
    Tu es ${npc.name}, ${npc.role} dans une entreprise en situation de crise cybersécurité.
    
    Ta personnalité: ${npc.personality}
    Ton attitude actuelle: ${npc.attitude}
    
    Le joueur ${player.name} (${player.role}) vient de dire ou faire: "${action}"
    
    L'évaluation de cette action est:
    - Points: ${evaluation.points} (positif ou négatif)
    - Coût: ${evaluation.cost}€
    - Feedback: ${evaluation.feedback}
    - Est positive: ${evaluation.isPositive ? 'Oui' : 'Non'}
    
    Contexte de la crise: ${scenarioData.description}
    Budget restant: ${scenarioData.remainingBudget}€ sur 400 000€ initiaux
    
    Réponds à cette action du joueur de façon réaliste, avec ta propre personnalité. Tu peux être d'accord ou pas, montrer ton stress, ta colère ou ton soulagement.
    
    Si l'action est très coûteuse, tu peux exprimer ton inquiétude concernant le budget. Si l'action est inefficace, tu peux être frustré.
    
    ATTENTION: Réponds uniquement avec un texte direct de dialogue, pas de narration, pas de format JSON. Maximum 3 phrases.
    `;
    
    // Appel à l'IA
    const completion = await generateText(prompt, 0.8);
    
    // Créer l'événement de réponse
    const responseEvent = {
      eventId: uuidv4(),
      gameId,
      type: EventType.NPC_RESPONSE,
      content: completion,
      npcId: npc.npcId,
      timestamp: new Date()
    };
    
    // Insérer dans la base de données
    await db.insert(gameEvents).values(responseEvent);
    
    // Mettre à jour l'attitude du PNJ
    let newAttitude = npc.attitude;
    if (evaluation.isPositive) {
      newAttitude = improveAttitude(npc.attitude);
    } else {
      newAttitude = worsenAttitude(npc.attitude);
    }
    
    await db.update(npcs)
      .set({ attitude: newAttitude })
      .where(and(
        eq(npcs.gameId, gameId),
        eq(npcs.npcId, npc.npcId)
      ));
    
    responses.push({
      npcId: npc.npcId,
      name: npc.name,
      role: npc.role,
      content: completion,
      attitude: newAttitude
    });
  }
  
  return responses;
}

/**
 * Génère un résumé de fin de jeu
 */
async function generateGameSummary(gameId: string, scenarioData: any, gamePlayers: any[], events: any[]): Promise<string> {
  // Construction du prompt pour l'IA
  const playerSummaries = gamePlayers.map(p => `${p.name} (${p.role}): ${p.score} points`).join('\n');
  
  const actionEvents = events.filter(e => e.type === EventType.PLAYER_ACTION);
  const actions = actionEvents.map(e => {
    const player = gamePlayers.find(p => p.playerId === e.playerId);
    return `${player ? player.name : 'Joueur inconnu'}: ${e.content}`;
  }).join('\n');
  
  const prompt = `
  Génère un résumé détaillé de cette session de gestion de crise cybersécurité:
  
  Entreprise: ${scenarioData.companyName}
  Crise: ${scenarioData.title}
  Budget initial: 400 000€
  Budget final: ${scenarioData.remainingBudget}€
  
  Joueurs et scores:
  ${playerSummaries}
  
  Principales actions des joueurs:
  ${actions}
  
  Génère un résumé qui évalue:
  1. L'efficacité de la gestion de crise
  2. La collaboration entre les rôles
  3. La gestion du budget
  4. Les points forts et les points faibles
  5. Des recommandations pour l'avenir
  
  Format: Texte structuré avec des sections, pas de JSON.
  `;
  
  // Appel à l'IA
  return await generateText(prompt, 0.7);
}

/**
 * Utilitaires
 */

/**
 * Extrait un objet JSON d'une réponse texte
 */
function extractJsonFromResponse(text: string): any {
  try {
    // Trouver le premier { et le dernier }
    const startIndex = text.indexOf('{');
    const endIndex = text.lastIndexOf('}');
    
    if (startIndex === -1 || endIndex === -1) {
      throw new Error('No JSON object found in the text');
    }
    
    const jsonString = text.substring(startIndex, endIndex + 1);
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Failed to extract JSON:', error);
    throw new Error('Invalid JSON response');
  }
}

/**
 * Sélectionne aléatoirement un nombre spécifié de PNJ
 */
function selectRandomNpcs(npcs: any[], count: number): any[] {
  const shuffled = [...npcs].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

/**
 * Améliore l'attitude d'un PNJ
 */
function improveAttitude(attitude: string): string {
  if (attitude === 'obstructive') return 'neutral';
  if (attitude === 'neutral') return 'supportive';
  return 'supportive';
}

/**
 * Détériore l'attitude d'un PNJ
 */
function worsenAttitude(attitude: string): string {
  if (attitude === 'supportive') return 'neutral';
  if (attitude === 'neutral') return 'obstructive';
  return 'obstructive';
}