import { Request, Response } from 'express';
import { openAIService } from './services/openai';

// Types
type GameRole = 'DSI' | 'RSSI' | 'DG' | 'Juriste' | 'Communication' | 'Expert Forensic';

interface PlayerInfo {
  id: string;
  name: string;
  role: GameRole;
  isAI: boolean;
}

interface GameChoice {
  id: string;
  text: string;
  targetRole?: GameRole;
}

interface GameMessage {
  id: string;
  sender: string;
  senderRole: GameRole | 'System';
  content: string;
  timestamp: number;
  isAI: boolean;
  isSystem: boolean;
  isChoice?: boolean;
  choices?: GameChoice[];
  selectedChoice?: string;
}

interface GameState {
  id: string;
  status: 'setup' | 'playing' | 'completed';
  currentTurn: number;
  totalTurns: number;
  messages: GameMessage[];
  players: PlayerInfo[];
  metrics: {
    integrity: number;
    availability: number;
    compliance: number;
    cost: number;
    trust: number;
  };
  waitingForPlayer?: string;
  timestamp: number;
  startTime?: number;
}

// Map pour stocker les sessions de jeu en cours
const gameSessions = new Map<string, GameState>();

/**
 * Initialise une nouvelle session de jeu CryptoLock
 */
export async function initCryptoLockGame(req: Request, res: Response) {
  try {
    const { players } = req.body;
    
    if (!players || !Array.isArray(players) || players.length === 0) {
      return res.status(400).json({ error: 'La configuration des joueurs est invalide' });
    }
    
    // Générer un ID unique pour la session
    const gameId = Math.random().toString(36).substring(2, 15);
    
    // Créer la nouvelle session
    const newGame: GameState = {
      id: gameId,
      status: 'setup',
      currentTurn: 0,
      totalTurns: 6,
      messages: [],
      players,
      metrics: {
        integrity: 100,
        availability: 100,
        compliance: 100,
        cost: 100,
        trust: 100
      },
      timestamp: Date.now()
    };
    
    // Stocker la session
    gameSessions.set(gameId, newGame);
    
    // Renvoyer l'état initial
    res.status(201).json({ 
      success: true, 
      gameId,
      gameState: newGame 
    });
    
  } catch (error) {
    console.error('Erreur lors de l\'initialisation du jeu CryptoLock:', error);
    res.status(500).json({ error: 'Erreur serveur lors de l\'initialisation du jeu' });
  }
}

/**
 * Démarre une session de jeu CryptoLock (après la configuration)
 */
export async function startCryptoLockGame(req: Request, res: Response) {
  try {
    const { gameId } = req.params;
    
    // Vérifier si la session existe
    const gameState = gameSessions.get(gameId);
    if (!gameState) {
      return res.status(404).json({ error: 'Session de jeu non trouvée' });
    }
    
    // Mettre à jour l'état du jeu
    gameState.status = 'playing';
    gameState.startTime = Date.now();
    
    // Créer le message d'introduction
    const introMessage: GameMessage = {
      id: Math.random().toString(36).substring(2, 11),
      sender: 'Système',
      senderRole: 'System',
      content: "🎮 **CryptoLock - 72H de Tension** 🎮\\n\\nLundi, 7h58.\\n\\nLes premiers employés ouvrent leurs ordinateurs. Quelques secondes plus tard, les premiers appels tombent.\\n\\n\"Je n'arrive plus à accéder à mes fichiers...\"\\n\\nUne fenêtre rouge s'ouvre sur les écrans : 🔒 \"Vos fichiers ont été chiffrés. Payez 3 bitcoins dans les 72h. Chaque heure compte.\"\\n\\nLe réseau ralentit. Les sauvegardes sont inaccessibles.\\n\\nLa panique monte. Vous êtes la cellule de crise. Chaque décision comptera.",
      timestamp: Date.now(),
      isAI: false,
      isSystem: true
    };
    
    gameState.messages.push(introMessage);
    
    // Mise à jour de la session stockée
    gameSessions.set(gameId, gameState);
    
    res.json({ 
      success: true,
      gameState
    });
    
  } catch (error) {
    console.error('Erreur lors du démarrage du jeu CryptoLock:', error);
    res.status(500).json({ error: 'Erreur serveur lors du démarrage du jeu' });
  }
}

/**
 * Gère les messages envoyés par les joueurs et génère les réponses du MJ (IA)
 */
export async function sendMessage(req: Request, res: Response) {
  try {
    const { gameId } = req.params;
    const { message, playerId } = req.body;
    
    if (!message || !playerId) {
      return res.status(400).json({ error: 'Message ou ID joueur manquant' });
    }
    
    // Vérifier si la session existe
    const gameState = gameSessions.get(gameId);
    if (!gameState) {
      return res.status(404).json({ error: 'Session de jeu non trouvée' });
    }
    
    // Vérifier si le joueur existe
    const player = gameState.players.find(p => p.id === playerId);
    if (!player) {
      return res.status(404).json({ error: 'Joueur non trouvé' });
    }
    
    // Créer le message du joueur
    const playerMessage: GameMessage = {
      id: Math.random().toString(36).substring(2, 11),
      sender: player.name,
      senderRole: player.role,
      content: message,
      timestamp: Date.now(),
      isAI: false,
      isSystem: false
    };
    
    // Ajouter le message à la conversation
    gameState.messages.push(playerMessage);
    
    // Générer la réponse de l'IA (MJ)
    try {
      const systemPrompt = `Tu es le Maître du Jeu (MJ) d'une simulation de gestion de crise cyber suite à une attaque ransomware.

Ton rôle est de :
- Gérer une simulation en 6 tours représentant une crise réelle.
- Incarner les personnages non-joués par les humains.
- Poser des situations précises et évaluer les décisions.
- Simuler les conséquences réalistes de ces décisions.
- Gérer les indicateurs : Intégrité, Disponibilité, Conformité, Coût, Confiance.

Tu te trouves actuellement au tour ${gameState.currentTurn} sur 6 de la simulation.
Voici l'état actuel des métriques :
- Intégrité des données: ${gameState.metrics.integrity}%
- Disponibilité des systèmes: ${gameState.metrics.availability}%
- Conformité légale: ${gameState.metrics.compliance}%
- Coût: ${gameState.metrics.cost}%
- Confiance des utilisateurs: ${gameState.metrics.trust}%

Les joueurs humains sont: ${gameState.players.filter(p => !p.isAI).map(p => `${p.name} (${p.role})`).join(', ')}.
Les rôles joués par l'IA sont: ${gameState.players.filter(p => p.isAI).map(p => `${p.name} (${p.role})`).join(', ')}.

Le message vient de: ${player.name} (${player.role}): "${message}"

Réponds en tant que Maître du Jeu en générant une réponse narrative et engageante qui:
1. Donne la réaction appropriée d'un ou plusieurs personnages IA selon le contexte 
2. Fait progresser le scénario en fonction de ce que le joueur a dit
3. Présente un nouveau défi ou dilemme
4. Reste sous 250 mots

Ton format de réponse doit être JSON avec cette structure:
{
  "narrativeResponse": "Texte détaillant les conséquences et la progression narrative",
  "aiResponses": [
    {"role": "DG", "name": "IA-DG", "message": "Message du DG en réaction"},
    {"role": "Expert Forensic", "name": "IA-Expert Forensic", "message": "Analyse technique de l'expert"}
  ],
  "metricChanges": {
    "integrity": 0,
    "availability": 0,
    "compliance": 0,
    "cost": 0,
    "trust": 0
  },
  "shouldAdvanceTurn": false,
  "choices": [
    {"id": "option1", "text": "Option de choix 1", "targetRole": "RSSI"},
    {"id": "option2", "text": "Option de choix 2", "targetRole": "DSI"}
  ]
}

Les aiResponses doivent être des réponses des personnages IA pertinents pour la situation.
Les metricChanges sont des ajustements entre -20 et +20 pour chaque métrique.
Fixe shouldAdvanceTurn à true si le tour doit avancer suite à cette interaction.
Les choices sont optionnels - n'en mets que si un choix critique doit être fait.`;

      // Préparer le contexte de la conversation
      const conversationContext = gameState.messages.map(msg => {
        return {
          role: msg.isSystem ? 'system' as const : msg.isAI ? 'assistant' as const : 'user' as const,
          content: msg.content,
          name: !msg.isSystem ? msg.senderRole.toLowerCase().replace(/\s+/g, '_') : undefined
        };
      });

      // Envoyer la requête à l'API Azure OpenAI
      const aiResponse = await openAIService.getChatCompletion(
        [
          { role: 'system' as const, content: systemPrompt },
          ...conversationContext.slice(-10) // Limiter le contexte aux 10 derniers messages pour éviter un contexte trop long
        ],
        true, // useSecondaryModel - utilise le modèle économique pour les réponses rapides 
        0.7,  // temperature - un peu de créativité
        2000, // maxTokens 
        { responseFormat: 'json_object' } // format JSON
      );

      let parsedResponse;
      try {
        parsedResponse = JSON.parse(aiResponse);
      } catch (e) {
        console.error('Erreur lors du parsing de la réponse JSON:', e);
        console.log('Réponse brute:', aiResponse);
        
        // Fallback en cas d'erreur de parsing
        parsedResponse = {
          narrativeResponse: "Le système a rencontré une difficulté à interpréter la situation. La cellule de crise continue son travail.",
          aiResponses: [],
          metricChanges: { integrity: 0, availability: 0, compliance: 0, cost: 0, trust: 0 },
          shouldAdvanceTurn: false
        };
      }

      // Ajouter le message narratif du MJ
      if (parsedResponse.narrativeResponse) {
        const narrativeMessage: GameMessage = {
          id: Math.random().toString(36).substring(2, 11),
          sender: 'Système',
          senderRole: 'System',
          content: parsedResponse.narrativeResponse,
          timestamp: Date.now(),
          isAI: false,
          isSystem: true,
          isChoice: parsedResponse.choices && parsedResponse.choices.length > 0,
          choices: parsedResponse.choices || []
        };
        
        gameState.messages.push(narrativeMessage);
      }

      // Ajouter les réponses des personnages IA
      if (parsedResponse.aiResponses && Array.isArray(parsedResponse.aiResponses)) {
        for (const aiResp of parsedResponse.aiResponses) {
          if (aiResp.role && aiResp.message) {
            const aiMessage: GameMessage = {
              id: Math.random().toString(36).substring(2, 11),
              sender: aiResp.name || `IA-${aiResp.role}`,
              senderRole: aiResp.role as GameRole,
              content: aiResp.message,
              timestamp: Date.now(),
              isAI: true,
              isSystem: false
            };
            
            gameState.messages.push(aiMessage);
          }
        }
      }

      // Mettre à jour les métriques
      if (parsedResponse.metricChanges) {
        const metrics = gameState.metrics;
        
        // Appliquer les changements en respectant les limites (0-100)
        metrics.integrity = Math.max(0, Math.min(100, metrics.integrity + (parsedResponse.metricChanges.integrity || 0)));
        metrics.availability = Math.max(0, Math.min(100, metrics.availability + (parsedResponse.metricChanges.availability || 0)));
        metrics.compliance = Math.max(0, Math.min(100, metrics.compliance + (parsedResponse.metricChanges.compliance || 0)));
        metrics.cost = Math.max(0, Math.min(100, metrics.cost + (parsedResponse.metricChanges.cost || 0)));
        metrics.trust = Math.max(0, Math.min(100, metrics.trust + (parsedResponse.metricChanges.trust || 0)));
      }

      // Avancer au tour suivant si nécessaire
      if (parsedResponse.shouldAdvanceTurn && gameState.currentTurn < gameState.totalTurns) {
        gameState.currentTurn += 1;
        
        // Si c'est le dernier tour, marquer le jeu comme terminé
        if (gameState.currentTurn >= gameState.totalTurns) {
          gameState.status = 'completed';
        }
      }

      // Mise à jour de la session stockée
      gameSessions.set(gameId, gameState);
      
      // Renvoyer l'état mis à jour
      res.json({
        success: true,
        gameState
      });
      
    } catch (error) {
      console.error('Erreur lors de la génération de la réponse de l\'IA:', error);
      
      // En cas d'erreur, ajouter un message d'erreur système
      const errorMessage: GameMessage = {
        id: Math.random().toString(36).substring(2, 11),
        sender: 'Système',
        senderRole: 'System',
        content: "Une erreur est survenue dans la simulation. L'équipe technique travaille sur le problème.",
        timestamp: Date.now(),
        isAI: false,
        isSystem: true
      };
      
      gameState.messages.push(errorMessage);
      gameSessions.set(gameId, gameState);
      
      // Renvoyer l'état avec le message d'erreur
      res.json({
        success: true,
        gameState,
        error: 'Erreur lors de la génération de la réponse IA'
      });
    }
    
  } catch (error) {
    console.error('Erreur lors du traitement du message CryptoLock:', error);
    res.status(500).json({ error: 'Erreur serveur lors du traitement du message' });
  }
}

/**
 * Gère la sélection d'un choix par un joueur
 */
export async function makeChoice(req: Request, res: Response) {
  try {
    const { gameId } = req.params;
    const { choiceId, messageId, playerId } = req.body;
    
    if (!choiceId || !messageId || !playerId) {
      return res.status(400).json({ error: 'Paramètres manquants' });
    }
    
    // Vérifier si la session existe
    const gameState = gameSessions.get(gameId);
    if (!gameState) {
      return res.status(404).json({ error: 'Session de jeu non trouvée' });
    }
    
    // Vérifier si le joueur existe
    const player = gameState.players.find(p => p.id === playerId);
    if (!player) {
      return res.status(404).json({ error: 'Joueur non trouvé' });
    }
    
    // Trouver le message de choix
    const choiceMessage = gameState.messages.find(m => m.id === messageId && m.isChoice);
    if (!choiceMessage) {
      return res.status(404).json({ error: 'Message de choix non trouvé' });
    }
    
    // Vérifier si le choix existe
    const choice = choiceMessage.choices?.find(c => c.id === choiceId);
    if (!choice) {
      return res.status(404).json({ error: 'Choix non trouvé' });
    }
    
    // Vérifier si le choix est destiné à un rôle spécifique
    if (choice.targetRole && choice.targetRole !== player.role) {
      return res.status(403).json({ 
        error: 'Ce choix doit être fait par un autre rôle',
        targetRole: choice.targetRole
      });
    }
    
    // Marquer le choix comme sélectionné
    choiceMessage.selectedChoice = choiceId;
    
    // Ajouter un message du joueur indiquant son choix
    const playerChoiceMessage: GameMessage = {
      id: Math.random().toString(36).substring(2, 11),
      sender: player.name,
      senderRole: player.role,
      content: `J'ai décidé de : ${choice.text}`,
      timestamp: Date.now(),
      isAI: false,
      isSystem: false
    };
    
    gameState.messages.push(playerChoiceMessage);
    
    // Générer la réponse de l'IA suite au choix
    // (Similaire à la fonction sendMessage)
    try {
      const systemPrompt = `Tu es le Maître du Jeu (MJ) d'une simulation de gestion de crise cyber suite à une attaque ransomware.

Le joueur ${player.name} (${player.role}) vient de prendre une décision importante : "${choice.text}".

Ton rôle est de :
- Décrire les conséquences directes de ce choix
- Faire progresser le scénario en fonction de cette décision
- Mettre à jour les indicateurs en fonction de l'impact du choix
- Gérer le timing de la simulation et le passage au tour suivant si nécessaire

Tu te trouves actuellement au tour ${gameState.currentTurn} sur 6 de la simulation.
Voici l'état actuel des métriques :
- Intégrité des données: ${gameState.metrics.integrity}%
- Disponibilité des systèmes: ${gameState.metrics.availability}%
- Conformité légale: ${gameState.metrics.compliance}%
- Coût: ${gameState.metrics.cost}%
- Confiance des utilisateurs: ${gameState.metrics.trust}%

Réponds en tant que Maître du Jeu en générant une réponse qui décrit les conséquences du choix ${choiceId}: "${choice.text}"

Ton format de réponse doit être JSON avec cette structure:
{
  "narrativeResponse": "Texte détaillant les conséquences du choix",
  "aiResponses": [
    {"role": "DG", "name": "IA-DG", "message": "Réaction du DG à cette décision"}
  ],
  "metricChanges": {
    "integrity": 0,
    "availability": 0,
    "compliance": 0,
    "cost": 0,
    "trust": 0
  },
  "shouldAdvanceTurn": true
}

Les metricChanges sont des ajustements entre -20 et +20 pour chaque métrique.
shouldAdvanceTurn doit être true pour ce type de décision majeure.`;

      // Envoyer la requête à l'API Azure OpenAI
      const aiResponse = await openAIService.getChatCompletion(
        [{ role: 'system', content: systemPrompt }],
        true, // useSecondaryModel
        0.7,  // temperature
        true  // formatAsJson
      );

      let parsedResponse;
      try {
        parsedResponse = JSON.parse(aiResponse);
      } catch (e) {
        console.error('Erreur lors du parsing de la réponse JSON:', e);
        
        // Fallback en cas d'erreur de parsing
        parsedResponse = {
          narrativeResponse: "Les conséquences de votre choix se manifestent dans le système. La cellule de crise continue son travail.",
          aiResponses: [],
          metricChanges: { integrity: 0, availability: 0, compliance: 0, cost: 0, trust: 0 },
          shouldAdvanceTurn: true
        };
      }

      // Ajouter le message narratif du MJ
      if (parsedResponse.narrativeResponse) {
        const narrativeMessage: GameMessage = {
          id: Math.random().toString(36).substring(2, 11),
          sender: 'Système',
          senderRole: 'System',
          content: parsedResponse.narrativeResponse,
          timestamp: Date.now(),
          isAI: false,
          isSystem: true
        };
        
        gameState.messages.push(narrativeMessage);
      }

      // Ajouter les réponses des personnages IA
      if (parsedResponse.aiResponses && Array.isArray(parsedResponse.aiResponses)) {
        for (const aiResp of parsedResponse.aiResponses) {
          if (aiResp.role && aiResp.message) {
            const aiMessage: GameMessage = {
              id: Math.random().toString(36).substring(2, 11),
              sender: aiResp.name || `IA-${aiResp.role}`,
              senderRole: aiResp.role as GameRole,
              content: aiResp.message,
              timestamp: Date.now(),
              isAI: true,
              isSystem: false
            };
            
            gameState.messages.push(aiMessage);
          }
        }
      }

      // Mettre à jour les métriques
      if (parsedResponse.metricChanges) {
        const metrics = gameState.metrics;
        
        // Appliquer les changements en respectant les limites
        metrics.integrity = Math.max(0, Math.min(100, metrics.integrity + (parsedResponse.metricChanges.integrity || 0)));
        metrics.availability = Math.max(0, Math.min(100, metrics.availability + (parsedResponse.metricChanges.availability || 0)));
        metrics.compliance = Math.max(0, Math.min(100, metrics.compliance + (parsedResponse.metricChanges.compliance || 0)));
        metrics.cost = Math.max(0, Math.min(100, metrics.cost + (parsedResponse.metricChanges.cost || 0)));
        metrics.trust = Math.max(0, Math.min(100, metrics.trust + (parsedResponse.metricChanges.trust || 0)));
      }

      // Avancer au tour suivant si nécessaire
      if (parsedResponse.shouldAdvanceTurn && gameState.currentTurn < gameState.totalTurns) {
        gameState.currentTurn += 1;
        
        // Si c'est le dernier tour, marquer le jeu comme terminé
        if (gameState.currentTurn >= gameState.totalTurns) {
          gameState.status = 'completed';
        }
      }

      // Mise à jour de la session stockée
      gameSessions.set(gameId, gameState);
      
      // Renvoyer l'état mis à jour
      res.json({
        success: true,
        gameState
      });
      
    } catch (error) {
      console.error('Erreur lors de la génération de la réponse de l\'IA:', error);
      
      // En cas d'erreur, ajouter un message d'erreur système
      const errorMessage: GameMessage = {
        id: Math.random().toString(36).substring(2, 11),
        sender: 'Système',
        senderRole: 'System',
        content: "Une erreur est survenue dans la simulation. L'équipe technique travaille sur le problème.",
        timestamp: Date.now(),
        isAI: false,
        isSystem: true
      };
      
      gameState.messages.push(errorMessage);
      gameSessions.set(gameId, gameState);
      
      // Renvoyer l'état avec le message d'erreur
      res.json({
        success: true,
        gameState,
        error: 'Erreur lors de la génération de la réponse IA'
      });
    }
    
  } catch (error) {
    console.error('Erreur lors du traitement du choix CryptoLock:', error);
    res.status(500).json({ error: 'Erreur serveur lors du traitement du choix' });
  }
}

/**
 * Récupère l'état actuel d'une session de jeu
 */
export async function getGameState(req: Request, res: Response) {
  try {
    const { gameId } = req.params;
    
    // Vérifier si la session existe
    const gameState = gameSessions.get(gameId);
    if (!gameState) {
      return res.status(404).json({ error: 'Session de jeu non trouvée' });
    }
    
    // Renvoyer l'état du jeu
    res.json({
      success: true,
      gameState
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'état du jeu CryptoLock:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération de l\'état du jeu' });
  }
}

/**
 * Obtient un résumé final à la fin du jeu
 */
export async function getFinalSummary(req: Request, res: Response) {
  try {
    const { gameId } = req.params;
    
    // Vérifier si la session existe
    const gameState = gameSessions.get(gameId);
    if (!gameState) {
      return res.status(404).json({ error: 'Session de jeu non trouvée' });
    }
    
    // Vérifier si le jeu est terminé
    if (gameState.status !== 'completed') {
      return res.status(400).json({ error: 'Le jeu n\'est pas encore terminé' });
    }
    
    // Générer le résumé final via l'IA
    try {
      const systemPrompt = `Tu es le Maître du Jeu (MJ) d'une simulation de gestion de crise cyber qui vient de se terminer.
Tu dois maintenant générer un rapport final détaillé sur la gestion de crise.

Voici l'état final des métriques :
- Intégrité des données: ${gameState.metrics.integrity}%
- Disponibilité des systèmes: ${gameState.metrics.availability}%
- Conformité légale: ${gameState.metrics.compliance}%
- Coût: ${gameState.metrics.cost}%
- Confiance des utilisateurs: ${gameState.metrics.trust}%

Les joueurs étaient: ${gameState.players.map(p => `${p.name} (${p.role}${p.isAI ? ', IA' : ''})`).join(', ')}.

Analyse les décisions prises au cours des ${gameState.totalTurns} tours de simulation.
La simulation a duré ${Math.floor((Date.now() - (gameState.startTime || 0)) / 1000 / 60)} minutes en temps réel.

Ton format de réponse doit être JSON avec cette structure:
{
  "summary": "Résumé global de la gestion de crise et de son issue",
  "keyDecisions": [
    {"turn": 1, "decision": "Description de la décision clé", "impact": "Impact positif/négatif"},
    {"turn": 2, "decision": "Description de la décision clé", "impact": "Impact positif/négatif"}
  ],
  "playerPerformance": [
    {"player": "Nom", "role": "Rôle", "strengths": "Points forts", "areas_to_improve": "Points à améliorer"}
  ],
  "lessonLearned": "Leçon principale à retenir de cette simulation",
  "overallScore": 85
}

L'overallScore doit être un nombre entre 0 et 100 calculé en fonction des métriques finales.`;

      // Envoyer la requête à l'API OpenAI
      const aiResponse = await openAIService.getChatCompletion(
        [{ role: 'system', content: systemPrompt }],
        false, // Utiliser le modèle principal pour générer un résumé détaillé
        0.7,   // temperature
        true   // formatAsJson
      );

      let parsedResponse;
      try {
        parsedResponse = JSON.parse(aiResponse);
      } catch (e) {
        console.error('Erreur lors du parsing de la réponse JSON:', e);
        
        // Fallback en cas d'erreur de parsing
        parsedResponse = {
          summary: "La simulation est maintenant terminée. Les indicateurs finaux montrent le résultat de vos décisions collectives.",
          keyDecisions: [],
          playerPerformance: [],
          lessonLearned: "La gestion d'une crise cyber nécessite une coordination entre tous les aspects : techniques, communication, légal et management.",
          overallScore: Math.floor((gameState.metrics.integrity + gameState.metrics.availability + gameState.metrics.compliance + gameState.metrics.cost + gameState.metrics.trust) / 5)
        };
      }
      
      // Renvoyer le résumé
      res.json({
        success: true,
        summary: parsedResponse
      });
      
    } catch (error) {
      console.error('Erreur lors de la génération du résumé final:', error);
      res.status(500).json({ error: 'Erreur serveur lors de la génération du résumé final' });
    }
    
  } catch (error) {
    console.error('Erreur lors de la récupération du résumé final CryptoLock:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération du résumé final' });
  }
}

/**
 * Nettoie les sessions de jeu inactives (maintenance de la mémoire)
 * Cette fonction devrait être appelée périodiquement par un job cron
 */
export function cleanupInactiveSessions() {
  const now = Date.now();
  const TWO_HOURS = 2 * 60 * 60 * 1000; // 2 heures en ms
  
  // Parcourir toutes les sessions
  for (const [gameId, gameState] of gameSessions.entries()) {
    // Supprimer les sessions inactives depuis plus de 2 heures
    if (now - gameState.timestamp > TWO_HOURS) {
      gameSessions.delete(gameId);
      console.log(`Session de jeu ${gameId} supprimée pour inactivité`);
    }
  }
}