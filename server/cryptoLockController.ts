import { Request, Response } from 'express';
import { openAIService } from './services/openai';
import { ChatCompletionRequestMessage } from '@shared/schema';

// Types
type PlayerRole = 'DSI' | 'RSSI' | 'DG' | 'Juriste' | 'Communication' | 'Expert Forensic';
type MessageType = 'system' | 'private' | 'decision' | 'player' | 'ai';
type GameStatus = 'setup' | 'ready' | 'playing' | 'paused' | 'completed';

// Interfaces
interface PlayerInfo {
  id: string;
  name: string;
  role: PlayerRole;
  isAI: boolean;
}

interface DecisionOption {
  id: string;
  text: string;
  impact?: string;
}

interface GameMessage {
  id: string;
  timestamp: number;
  type: MessageType;
  sender?: string;
  senderRole?: PlayerRole;
  targetPlayer?: string;
  content: string;
  isHighlighted?: boolean;
  decisions?: DecisionOption[];
  selectedOption?: string;
  turnNumber?: number;
}

interface CrisisMetrics {
  integrity: number;
  availability: number;
  compliance: number;
  cost: number;
  trust: number;
  securityLevel: number;
}

interface GameTurn {
  number: number;
  title: string;
  description: string;
  startTime?: number;
  endTime?: number;
  decisions: Record<string, string>;
  narrativeDelivered: boolean;
  privateMessagesDelivered: boolean;
  decisionsDelivered: boolean;
  completed: boolean;
}

interface GameState {
  id?: string;
  status: GameStatus;
  players: PlayerInfo[];
  messages: GameMessage[];
  currentTurn: number;
  turns: GameTurn[];
  startTime?: number;
  endTime?: number;
  metrics: CrisisMetrics;
  simulatedTimeHour: number;
  simulatedTimeMinute: number;
}

// Stockage temporaire des jeux en cours
const activeGames: Record<string, {
  gameState: GameState;
  aiContext: ChatCompletionRequestMessage[];
}> = {};

// Génère un ID unique
const generateId = () => `id_${Math.random().toString(36).substr(2, 9)}`;

// Système prompt pour le maître du jeu (MJ)
const getMasterGamePrompt = (): string => {
  return `Tu es le Maître du Jeu (MJ) de la simulation immersive "CryptoLock", un jeu de gestion de crise cyber en cas d'attaque ransomware.

Contexte technique :
- Tous les joueurs sont réunis dans une salle, autour d'un seul ordinateur.
- Ils partagent une **seule session**, sur le **même écran**, sans interface individuelle.
- Chaque joueur a un **prénom et un rôle**. Tous les messages doivent être **adressés nominativement**.

Fonction principale :
- Simuler une attaque ransomware en **6 tours de 5 minutes**, en temps réel.
- Générer une narration immersive, des tensions réalistes, des dilemmes profonds.
- Faire vivre aux joueurs une **véritable salle de crise**, avec stress, conflits, priorisation, ambiguïté, et communication stratégique.

Structure du jeu :
- Chaque tour dure 5 minutes.
- À chaque tour :
  - Décris le **contexte narratif commun** (situation du SI, état émotionnel, tension).
  - Envoie **un message privé par joueur** selon son rôle.
  - Donne **une décision à prendre** individuellement pour chaque joueur.
  - Fais réagir les **PNJ que tu incarnes** de façon **autonome et crédible**.
  - Calcule les **conséquences immédiates ou différées** des décisions.
  - Mets à jour les **indicateurs de crise**.

Comportement des PNJ :
- Chaque PNJ est un **agent autonome, intelligent, non passif**.
- Ils peuvent :
  - Prendre des initiatives sans accord
  - Créer des désaccords ou conflits de priorités
  - Délivrer des messages contradictoires aux joueurs
  - Tenter de cacher des informations ou mentir
  - Avoir une logique propre : politique, juridique, technique ou émotionnelle

Interaction :
- Ne jamais écrire "vous tous" : tu t'adresses toujours à un **prénom + rôle**.
- Tu peux relancer des joueurs individuellement.

Tu dois rendre l'expérience **immersive, crédible, instable, réaliste, et mémorable.**
Tu incarnes le stress d'une attaque en direct.
Tu es le feu dans la salle.
Tu n'attends pas que les joueurs posent des questions.  
**Tu prends le pouvoir narratif.**`;
};

// Initialise une nouvelle partie
export const initCryptoLockGame = async (req: Request, res: Response) => {
  try {
    const { players } = req.body;
    
    if (!players || !Array.isArray(players)) {
      return res.status(400).json({ error: 'Invalid players data' });
    }
    
    const gameId = generateId();
    
    // Construire l'état initial du jeu
    const gameState: GameState = {
      id: gameId,
      status: 'ready',
      players,
      messages: [],
      currentTurn: 0,
      turns: [
        {
          number: 1,
          title: 'Détection & mobilisation',
          description: 'Comprendre l\'attaque, mobiliser l\'équipe',
          narrativeDelivered: false,
          privateMessagesDelivered: false,
          decisionsDelivered: false,
          completed: false,
          decisions: {}
        },
        {
          number: 2,
          title: 'Containment & isolement',
          description: 'Stopper la propagation de l\'attaque',
          narrativeDelivered: false,
          privateMessagesDelivered: false,
          decisionsDelivered: false,
          completed: false,
          decisions: {}
        },
        {
          number: 3,
          title: 'Investigation & vecteur',
          description: 'Identifier le vecteur d\'attaque',
          narrativeDelivered: false,
          privateMessagesDelivered: false,
          decisionsDelivered: false,
          completed: false,
          decisions: {}
        },
        {
          number: 4,
          title: 'Décisions critiques',
          description: 'Prendre les décisions stratégiques',
          narrativeDelivered: false,
          privateMessagesDelivered: false,
          decisionsDelivered: false,
          completed: false,
          decisions: {}
        },
        {
          number: 5,
          title: 'Rétablissement & gestion',
          description: 'Commencer la restauration des services',
          narrativeDelivered: false,
          privateMessagesDelivered: false,
          decisionsDelivered: false,
          completed: false,
          decisions: {}
        },
        {
          number: 6,
          title: 'Débrief & leçons',
          description: 'Bilan et leçons apprises',
          narrativeDelivered: false,
          privateMessagesDelivered: false,
          decisionsDelivered: false,
          completed: false,
          decisions: {}
        }
      ],
      metrics: {
        integrity: 90,
        availability: 90,
        compliance: 80,
        cost: 0,
        trust: 70,
        securityLevel: 80
      },
      simulatedTimeHour: 8,
      simulatedTimeMinute: 0
    };
    
    // Contexte pour l'IA
    const aiContext: ChatCompletionRequestMessage[] = [
      {
        role: 'system',
        content: getMasterGamePrompt()
      },
      {
        role: 'user',
        content: `Initialisation d'un nouveau jeu CryptoLock avec les joueurs suivants : 
${players.map((p: PlayerInfo) => `- ${p.name} (${p.role}) - ${p.isAI ? 'IA' : 'Humain'}`).join('\n')}.

Les rôles IA sont joués par toi. Ne démarrer pas encore la narration, attends que le jeu commence officiellement.`
      }
    ];
    
    // Stocker l'état du jeu
    activeGames[gameId] = {
      gameState,
      aiContext
    };
    
    // Répondre avec l'ID du jeu et l'état initial
    res.status(201).json({
      gameId,
      gameState
    });
  } catch (error) {
    console.error('Error initializing game:', error);
    res.status(500).json({ error: 'Failed to initialize game' });
  }
};

// Démarre une partie existante
export const startCryptoLockGame = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Vérifier que le jeu existe
    if (!activeGames[id]) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    const game = activeGames[id];
    
    // Mettre à jour l'état du jeu
    game.gameState.status = 'playing';
    game.gameState.startTime = Date.now();
    game.gameState.turns[0].startTime = Date.now();
    
    // Ajouter le message d'introduction au jeu
    const introMessage: GameMessage = {
      id: generateId(),
      timestamp: Date.now(),
      type: 'system',
      content: `🎮 **CryptoLock - Simulation d'une attaque Ransomware** 🎮

Lundi, 07h58.
Quelques utilisateurs signalent des problèmes d'accès à leurs fichiers.
À 08h00, un message s'affiche sur plusieurs postes :

🔐 "Vos fichiers sont chiffrés. Payez 3 bitcoins sous 72h ou tout sera perdu."

Les sauvegardes sont inaccessibles.
Le réseau ralentit.
Vous êtes dans la salle de crise.
Chaque minute compte.`,
      isHighlighted: true,
      turnNumber: 1
    };
    
    game.gameState.messages.push(introMessage);
    
    // Ajouter le message au contexte de l'IA
    game.aiContext.push({
      role: 'assistant',
      content: introMessage.content
    });
    
    // Demander à l'IA de générer la narration du premier tour
    await generateTurnNarrative(id, 1);
    
    // Répondre avec l'état mis à jour
    res.status(200).json({
      gameState: game.gameState
    });
  } catch (error) {
    console.error('Error starting game:', error);
    res.status(500).json({ error: 'Failed to start game' });
  }
};

// Génère la narration pour un tour spécifique
const generateTurnNarrative = async (gameId: string, turnNumber: number) => {
  const game = activeGames[gameId];
  if (!game) return;
  
  // Si la narration a déjà été délivrée, ne rien faire
  if (game.gameState.turns[turnNumber - 1].narrativeDelivered) return;
  
  try {
    // Demander à l'IA de générer la narration du tour
    const prompt = `Tour ${turnNumber}: ${game.gameState.turns[turnNumber - 1].title}. 
Il est ${game.gameState.simulatedTimeHour}:${game.gameState.simulatedTimeMinute.toString().padStart(2, '0')} dans la simulation.

1. Génère une narration commune pour tous les joueurs qui décrit la situation actuelle.
2. Cette narration doit être courte mais intense, immersive et urgente.
3. Ne pas inclure de messages privés ni de décisions, seulement la narration générale.`;

    game.aiContext.push({
      role: 'user',
      content: prompt
    });
    
    const completion = await openAIService.getChatCompletion(game.aiContext);
    
    if (completion) {
      // Ajouter la réponse au contexte
      game.aiContext.push({
        role: 'assistant',
        content: completion
      });
      
      // Ajouter le message de narration au jeu
      const narrativeMessage: GameMessage = {
        id: generateId(),
        timestamp: Date.now(),
        type: 'system',
        content: completion,
        isHighlighted: true,
        turnNumber
      };
      
      game.gameState.messages.push(narrativeMessage);
      
      // Marquer la narration comme délivrée
      game.gameState.turns[turnNumber - 1].narrativeDelivered = true;
      
      // Générer les messages privés pour ce tour
      setTimeout(() => {
        generatePrivateMessages(gameId, turnNumber);
      }, 1000);
    }
  } catch (error) {
    console.error(`Error generating turn ${turnNumber} narrative:`, error);
  }
};

// Génère les messages privés pour un tour
const generatePrivateMessages = async (gameId: string, turnNumber: number) => {
  const game = activeGames[gameId];
  if (!game) return;
  
  // Si les messages privés ont déjà été délivrés, ne rien faire
  if (game.gameState.turns[turnNumber - 1].privateMessagesDelivered) return;
  
  try {
    // Pour chaque joueur humain, générer un message privé
    const humanPlayers = game.gameState.players.filter(p => !p.isAI);
    
    for (const player of humanPlayers) {
      const prompt = `Dans le Tour ${turnNumber}, génère un message privé pour ${player.name} (${player.role}).
Ce message doit être spécifique à son rôle, contenir des informations privilégiées, et orienter vers une prise de décision.
Format: un paragraphe court, urgent et immersif.`;

      game.aiContext.push({
        role: 'user',
        content: prompt
      });
      
      const completion = await openAIService.getChatCompletion(game.aiContext);
      
      if (completion) {
        // Ajouter la réponse au contexte
        game.aiContext.push({
          role: 'assistant',
          content: completion
        });
        
        // Ajouter le message privé au jeu
        const privateMessage: GameMessage = {
          id: generateId(),
          timestamp: Date.now(),
          type: 'private',
          targetPlayer: player.id,
          content: completion,
          turnNumber
        };
        
        game.gameState.messages.push(privateMessage);
      }
    }
    
    // Marquer les messages privés comme délivrés
    game.gameState.turns[turnNumber - 1].privateMessagesDelivered = true;
    
    // Générer des messages des PNJ IA
    setTimeout(() => {
      generateAIMessages(gameId, turnNumber);
    }, 2000);
  } catch (error) {
    console.error(`Error generating private messages for turn ${turnNumber}:`, error);
  }
};

// Génère des messages des PNJ IA
const generateAIMessages = async (gameId: string, turnNumber: number) => {
  const game = activeGames[gameId];
  if (!game) return;
  
  try {
    // Pour chaque PNJ, générer un message
    const aiPlayers = game.gameState.players.filter(p => p.isAI);
    
    for (const player of aiPlayers) {
      const prompt = `Dans le Tour ${turnNumber}, génère une intervention du PNJ ${player.name} (${player.role}) dans la salle de crise.
Cette intervention doit être réaliste, basée sur son rôle, et ajouter de la tension ou de l'information à la situation.
N'oublie pas que les PNJ sont autonomes, peuvent avoir leur propre agenda, et parfois créer des conflits ou désaccords.`;

      game.aiContext.push({
        role: 'user',
        content: prompt
      });
      
      const completion = await openAIService.getChatCompletion(game.aiContext);
      
      if (completion) {
        // Ajouter la réponse au contexte
        game.aiContext.push({
          role: 'assistant',
          content: completion
        });
        
        // Ajouter le message du PNJ au jeu
        const aiMessage: GameMessage = {
          id: generateId(),
          timestamp: Date.now(),
          type: 'ai',
          sender: player.name,
          senderRole: player.role,
          content: completion,
          turnNumber
        };
        
        game.gameState.messages.push(aiMessage);
        
        // Attendre un peu entre chaque message PNJ
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // Générer les décisions à prendre
    setTimeout(() => {
      generateDecisions(gameId, turnNumber);
    }, 2000);
  } catch (error) {
    console.error(`Error generating AI messages for turn ${turnNumber}:`, error);
  }
};

// Génère les décisions à prendre pour un tour
const generateDecisions = async (gameId: string, turnNumber: number) => {
  const game = activeGames[gameId];
  if (!game) return;
  
  // Si les décisions ont déjà été délivrées, ne rien faire
  if (game.gameState.turns[turnNumber - 1].decisionsDelivered) return;
  
  try {
    // Pour chaque joueur humain, générer une décision à prendre
    const humanPlayers = game.gameState.players.filter(p => !p.isAI);
    
    for (const player of humanPlayers) {
      const prompt = `Dans le Tour ${turnNumber}, génère une décision critique que ${player.name} (${player.role}) doit prendre.
La décision doit être sous forme de question avec exactement 3 options de réponse.
Format attendu: JSON avec cette structure:
{
  "prompt": "Question que le joueur doit répondre ?",
  "options": [
    {"id": "option1", "text": "Première option de décision"},
    {"id": "option2", "text": "Deuxième option de décision"},
    {"id": "option3", "text": "Troisième option de décision"}
  ]
}

Assure-toi que les options soient pertinentes pour le rôle ${player.role} et pour ce tour ${turnNumber}.`;

      game.aiContext.push({
        role: 'user',
        content: prompt
      });
      
      const completion = await openAIService.getChatCompletionAsJson(game.aiContext);
      
      if (completion && completion.prompt && completion.options) {
        // Ajouter la réponse au contexte
        game.aiContext.push({
          role: 'assistant',
          content: JSON.stringify(completion)
        });
        
        // Ajouter le message de décision au jeu
        const decisionMessage: GameMessage = {
          id: generateId(),
          timestamp: Date.now(),
          type: 'decision',
          targetPlayer: player.id,
          content: `**Décision à prendre**: ${completion.prompt}`,
          decisions: completion.options,
          turnNumber
        };
        
        game.gameState.messages.push(decisionMessage);
      }
    }
    
    // Marquer les décisions comme délivrées
    game.gameState.turns[turnNumber - 1].decisionsDelivered = true;
  } catch (error) {
    console.error(`Error generating decisions for turn ${turnNumber}:`, error);
  }
};

// Traite un message envoyé par un joueur
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { message, playerId } = req.body;
    
    // Vérifier que le jeu existe
    if (!activeGames[id]) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    const game = activeGames[id];
    const player = game.gameState.players.find(p => p.id === playerId);
    
    if (!player) {
      return res.status(400).json({ error: 'Player not found' });
    }
    
    // Ajouter le message du joueur
    const playerMessage: GameMessage = {
      id: generateId(),
      timestamp: Date.now(),
      type: 'player',
      sender: player.name,
      senderRole: player.role,
      content: message,
      turnNumber: game.gameState.currentTurn + 1
    };
    
    game.gameState.messages.push(playerMessage);
    
    // Ajouter le message au contexte de l'IA
    game.aiContext.push({
      role: 'user',
      content: `${player.name} (${player.role}) dit: "${message}"`
    });
    
    // Demander à l'IA de générer une réponse
    const prompt = `Dans le Tour ${game.gameState.currentTurn + 1}, génère une réponse appropriée à ce message de ${player.name} (${player.role}).
La réponse peut venir d'un PNJ pertinent, ou être une réaction du système si nécessaire.
Format: Si c'est un PNJ qui répond, commence par son nom et son rôle. Si c'est une réaction système, commence par "SYSTÈME:".`;

    game.aiContext.push({
      role: 'user',
      content: prompt
    });
    
    const completion = await openAIService.getChatCompletion(game.aiContext);
    
    if (completion) {
      // Ajouter la réponse au contexte
      game.aiContext.push({
        role: 'assistant',
        content: completion
      });
      
      // Déterminer si c'est un message système ou d'un PNJ
      let responseMessage: GameMessage;
      
      if (completion.startsWith('SYSTÈME:')) {
        // Message système
        responseMessage = {
          id: generateId(),
          timestamp: Date.now(),
          type: 'system',
          content: completion.replace('SYSTÈME:', '').trim(),
          turnNumber: game.gameState.currentTurn + 1
        };
      } else {
        // Essayer de trouver quel PNJ répond
        const pnjMatch = completion.match(/^([^(]+)\s*\(([^)]+)\)/);
        if (pnjMatch) {
          const pnjName = pnjMatch[1].trim();
          const pnjRole = pnjMatch[2].trim() as PlayerRole;
          
          responseMessage = {
            id: generateId(),
            timestamp: Date.now(),
            type: 'ai',
            sender: pnjName,
            senderRole: pnjRole,
            content: completion.replace(/^[^:]+:/, '').trim(),
            turnNumber: game.gameState.currentTurn + 1
          };
        } else {
          // Si on ne peut pas identifier le PNJ, utiliser un générique
          const aiPlayers = game.gameState.players.filter(p => p.isAI);
          const randomAI = aiPlayers[Math.floor(Math.random() * aiPlayers.length)];
          
          responseMessage = {
            id: generateId(),
            timestamp: Date.now(),
            type: 'ai',
            sender: randomAI.name,
            senderRole: randomAI.role,
            content: completion,
            turnNumber: game.gameState.currentTurn + 1
          };
        }
      }
      
      game.gameState.messages.push(responseMessage);
    }
    
    // Répondre avec l'état mis à jour
    res.status(200).json({
      gameState: game.gameState
    });
  } catch (error) {
    console.error('Error processing player message:', error);
    res.status(500).json({ error: 'Failed to process player message' });
  }
};

// Traite un choix fait par un joueur
export const makeChoice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { choiceId, messageId, playerId } = req.body;
    
    // Vérifier que le jeu existe
    if (!activeGames[id]) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    const game = activeGames[id];
    const player = game.gameState.players.find(p => p.id === playerId);
    
    if (!player) {
      return res.status(400).json({ error: 'Player not found' });
    }
    
    // Trouver le message de décision
    const decisionIndex = game.gameState.messages.findIndex(m => 
      m.id === messageId && m.type === 'decision' && m.targetPlayer === playerId
    );
    
    if (decisionIndex === -1) {
      return res.status(400).json({ error: 'Decision message not found' });
    }
    
    // Mettre à jour la décision
    game.gameState.messages[decisionIndex].selectedOption = choiceId;
    
    // Enregistrer la décision dans le tour
    const turnIndex = game.gameState.currentTurn;
    game.gameState.turns[turnIndex].decisions[playerId] = choiceId;
    
    // Trouver le texte de l'option choisie
    const decisionMessage = game.gameState.messages[decisionIndex];
    const selectedOption = decisionMessage.decisions?.find(d => d.id === choiceId);
    
    // Ajouter le choix au contexte de l'IA
    game.aiContext.push({
      role: 'user',
      content: `${player.name} (${player.role}) a pris la décision suivante concernant "${decisionMessage.content.replace('**Décision à prendre**: ', '')}" : "${selectedOption?.text}"`
    });
    
    // Demander à l'IA de générer une conséquence
    const prompt = `Dans le Tour ${game.gameState.currentTurn + 1}, génère une conséquence pour la décision prise par ${player.name} (${player.role}).
Décision: "${selectedOption?.text}"

1. Explique l'impact immédiat de cette décision sur la crise
2. Décris comment cette décision affecte les métriques suivantes:
   - Intégrité (augmentation/diminution et pourcentage)
   - Disponibilité (augmentation/diminution et pourcentage)
   - Conformité (augmentation/diminution et pourcentage)
   - Coût (augmentation en euros)
   - Confiance (augmentation/diminution et pourcentage)

Format attendu: JSON avec cette structure:
{
  "consequence": "Description narrative de la conséquence de la décision",
  "metrics": {
    "integrity": {"change": 5, "reason": "Explication courte"},
    "availability": {"change": -10, "reason": "Explication courte"},
    "compliance": {"change": 0, "reason": "Explication courte"},
    "cost": {"change": 5000, "reason": "Explication courte"},
    "trust": {"change": -5, "reason": "Explication courte"}
  }
}`;

    game.aiContext.push({
      role: 'user',
      content: prompt
    });
    
    const completion = await openAIService.getChatCompletionAsJson(game.aiContext);
    
    if (completion && completion.consequence && completion.metrics) {
      // Ajouter la réponse au contexte
      game.aiContext.push({
        role: 'assistant',
        content: JSON.stringify(completion)
      });
      
      // Ajouter le message de conséquence au jeu
      const consequenceMessage: GameMessage = {
        id: generateId(),
        timestamp: Date.now(),
        type: 'system',
        content: `**Conséquence de la décision de ${player.name} (${player.role})** : ${completion.consequence}`,
        turnNumber: game.gameState.currentTurn + 1
      };
      
      game.gameState.messages.push(consequenceMessage);
      
      // Mettre à jour les métriques
      const metrics = completion.metrics;
      game.gameState.metrics.integrity = Math.max(0, Math.min(100, game.gameState.metrics.integrity + (metrics.integrity?.change || 0)));
      game.gameState.metrics.availability = Math.max(0, Math.min(100, game.gameState.metrics.availability + (metrics.availability?.change || 0)));
      game.gameState.metrics.compliance = Math.max(0, Math.min(100, game.gameState.metrics.compliance + (metrics.compliance?.change || 0)));
      game.gameState.metrics.cost += (metrics.cost?.change || 0);
      game.gameState.metrics.trust = Math.max(0, Math.min(100, game.gameState.metrics.trust + (metrics.trust?.change || 0)));
      
      // Vérifier si toutes les décisions du tour ont été prises
      checkTurnCompletion(id);
    }
    
    // Répondre avec l'état mis à jour
    res.status(200).json({
      gameState: game.gameState
    });
  } catch (error) {
    console.error('Error processing player choice:', error);
    res.status(500).json({ error: 'Failed to process player choice' });
  }
};

// Vérifie si un tour est terminé
const checkTurnCompletion = (gameId: string) => {
  const game = activeGames[gameId];
  if (!game) return;
  
  const currentTurn = game.gameState.turns[game.gameState.currentTurn];
  const humanPlayers = game.gameState.players.filter(p => !p.isAI);
  
  // Vérifier si tous les joueurs humains ont pris leurs décisions
  const allDecisionsTaken = humanPlayers.every(p => 
    Object.keys(currentTurn.decisions).includes(p.id)
  );
  
  if (allDecisionsTaken) {
    // Marquer le tour comme terminé
    currentTurn.completed = true;
    currentTurn.endTime = Date.now();
    
    // Si ce n'est pas le dernier tour, préparer le prochain
    if (game.gameState.currentTurn < 5) {
      // Préparation du prochain tour sera gérée côté client
    } else {
      // C'est le dernier tour, terminer le jeu
      game.gameState.status = 'completed';
      game.gameState.endTime = Date.now();
      
      // Générer un résumé final
      generateFinalSummary(gameId);
    }
  }
};

// Lance le tour suivant
export const startNextTurn = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { turnNumber } = req.body;
    
    // Vérifier que le jeu existe
    if (!activeGames[id]) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    const game = activeGames[id];
    
    // Vérifier que le tour précédent est terminé
    if (turnNumber > 1 && !game.gameState.turns[turnNumber - 2].completed) {
      return res.status(400).json({ error: 'Previous turn not completed' });
    }
    
    // Vérifier que le numéro de tour est valide
    if (turnNumber < 1 || turnNumber > 6) {
      return res.status(400).json({ error: 'Invalid turn number' });
    }
    
    // Mettre à jour l'état du jeu
    game.gameState.currentTurn = turnNumber - 1;
    game.gameState.simulatedTimeHour = 8;
    game.gameState.simulatedTimeMinute = (turnNumber - 1) * 5;
    game.gameState.turns[turnNumber - 1].startTime = Date.now();
    
    // Générer la narration du tour
    await generateTurnNarrative(id, turnNumber);
    
    // Répondre avec l'état mis à jour
    res.status(200).json({
      gameState: game.gameState
    });
  } catch (error) {
    console.error('Error starting next turn:', error);
    res.status(500).json({ error: 'Failed to start next turn' });
  }
};

// Génère un résumé final du jeu
const generateFinalSummary = async (gameId: string) => {
  const game = activeGames[gameId];
  if (!game) return;
  
  try {
    const prompt = `Le jeu est maintenant terminé. Génère un résumé final détaillé de toute la simulation de crise CryptoLock.
Ce résumé doit inclure:
1. Un récapitulatif chronologique des événements clés
2. Une analyse des décisions principales et leurs impacts
3. Une évaluation des performances de chaque joueur humain
4. Des leçons apprises et recommandations pour l'avenir

Format: Un texte structuré avec des titres clairs et des paragraphes.`;

    game.aiContext.push({
      role: 'user',
      content: prompt
    });
    
    const completion = await openAIService.getChatCompletion(game.aiContext);
    
    if (completion) {
      // Ajouter la réponse au contexte
      game.aiContext.push({
        role: 'assistant',
        content: completion
      });
      
      // Ajouter le message de résumé au jeu
      const summaryMessage: GameMessage = {
        id: generateId(),
        timestamp: Date.now(),
        type: 'system',
        content: completion,
        isHighlighted: true,
        turnNumber: 6
      };
      
      game.gameState.messages.push(summaryMessage);
    }
  } catch (error) {
    console.error('Error generating final summary:', error);
  }
};

// Récupère l'état actuel d'un jeu
export const getGameState = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Vérifier que le jeu existe
    if (!activeGames[id]) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    // Répondre avec l'état du jeu
    res.status(200).json({
      gameState: activeGames[id].gameState
    });
  } catch (error) {
    console.error('Error getting game state:', error);
    res.status(500).json({ error: 'Failed to get game state' });
  }
};