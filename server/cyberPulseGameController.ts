import { Request, Response } from "express";
import { openAIService } from "./services/openai";
import { ChatCompletionRequestMessage } from "@shared/schema";
import { v4 as uuidv4 } from "uuid";

// Type d'erreur pour le typage strict
interface ApiError {
  message: string;
}

/**
 * Interface pour les sessions de jeu CyberPULSE
 * Représente une session de chatbot immersive avec fonctionnalités ludiques
 */
interface CyberPulseSession {
  sessionId: string;
  userId: string;
  playerName?: string;
  playerLevel: 'débutant' | 'intermédiaire' | 'avancé';
  messages: Array<ChatCompletionRequestMessage>;
  gameState: {
    active: boolean;
    currentGameType?: 'quiz' | 'challenge' | 'scenario' | 'story' | 'simulation';
    score: number;
    streak: number;
    lastInteractionTime: number;
    gameProgress: number;
    challengesCompleted: number;
    nextAction?: string;
  };
  preferences: {
    visualStyle: 'futuristic' | 'neon' | 'minimal' | 'classic';
    pace: 'slow' | 'medium' | 'fast';
    complexity: 'simple' | 'moderate' | 'complex';
    focusArea?: string[];
  }
}

// Map pour stocker les sessions actives des joueurs
export const cyberPulseSessions = new Map<string, CyberPulseSession>();

// Intervalles d'inactivité en millisecondes
const INACTIVITY_REMINDER_THRESHOLD = 30000; // 30 secondes - demande si l'utilisateur est toujours là
const INACTIVITY_CLOSE_THRESHOLD = 180000; // 3 minutes - ferme la session

/**
 * Initialise une nouvelle session CyberPULSE
 * Cette fonction crée une session interactive et ludique avec un style visuel captivant
 */
export async function initCyberPulseSession(req: Request, res: Response) {
  try {
    // Générer un ID unique pour l'utilisateur et la session
    const userId = req.body.userId || uuidv4();
    const sessionId = uuidv4();
    
    // Options de personnalisation du jeu
    const visualStyle = req.body.visualStyle || 'futuristic';
    const playerName = req.body.playerName;
    const focusArea = req.body.focusArea;
    
    // Créer une nouvelle session
    const session: CyberPulseSession = {
      sessionId,
      userId,
      playerName,
      playerLevel: 'débutant', // Niveau par défaut
      messages: [],
      gameState: {
        active: true,
        score: 0,
        streak: 0,
        lastInteractionTime: Date.now(),
        gameProgress: 0,
        challengesCompleted: 0,
      },
      preferences: {
        visualStyle: visualStyle as any,
        pace: 'medium',
        complexity: 'moderate',
        focusArea: focusArea ? [focusArea] : undefined
      }
    };
    
    // Construire le prompt système pour CyberPULSE
    const systemMessage: ChatCompletionRequestMessage = {
      role: "system",
      content: getCyberPulseSystemPrompt(session)
    };
    
    // Message d'accueil dynamique et engageant
    const welcomePrompt = `Crée un message d'accueil captivant pour CyberPULSE, un chatbot cyber ultra-interactif qui ne lâche jamais l'utilisateur. 
    Ce message doit:
    1. Être visuellement frappant avec une mise en page structurée
    2. Avoir un ton énergétique et engageant
    3. Se présenter comme une IA de cybersécurité prête à initier des jeux et défis
    4. Proposer immédiatement 3 activités intéressantes
    5. Inclure une question directe à la fin pour engager l'utilisateur
    6. Utiliser quelques emojis pertinents mais sans excès
    7. Être adapté au style visuel ${session.preferences.visualStyle}
    8. Proposer au moins un mini-défi rapide
    ${session.playerName ? `Le joueur s'appelle ${session.playerName}.` : ''}
    ${session.preferences.focusArea ? `Le joueur est intéressé par: ${session.preferences.focusArea.join(', ')}.` : ''}`;
    
    // Générer un message d'accueil personnalisé via l'IA
    const welcomeContent = await openAIService.getChatCompletion(
      [
        systemMessage,
        { role: "user", content: welcomePrompt }
      ],
      true, // Utiliser le modèle GPT-4o-mini pour une réponse rapide
      0.8, // Température plus élevée pour la créativité
      1000 // Longueur maximale raisonnable
    );
    
    const welcomeMessage: ChatCompletionRequestMessage = {
      role: "assistant",
      content: welcomeContent
    };
    
    // Ajouter les messages à la session
    session.messages.push(systemMessage);
    session.messages.push(welcomeMessage);
    
    // Stocker la session
    cyberPulseSessions.set(sessionId, session);
    
    return res.status(200).json({
      success: true,
      sessionId,
      userId,
      message: welcomeMessage.content,
      visualStyle: session.preferences.visualStyle,
      gameActive: true
    });
  } catch (error) {
    console.error("Erreur lors de l'initialisation de la session CyberPULSE:", error);
    return res.status(500).json({ error: "Erreur lors de l'initialisation de la session CyberPULSE" });
  }
}

/**
 * Traite un message envoyé au chatbot CyberPULSE
 * Maintient l'engagement constant avec l'utilisateur via des relances automatiques
 */
export async function processCyberPulseMessage(req: Request, res: Response) {
  try {
    const { sessionId, message } = req.body;
    
    if (!sessionId || !message) {
      return res.status(400).json({ error: "ID de session ou message manquant" });
    }
    
    // Récupérer la session existante
    const session = cyberPulseSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session non trouvée. Veuillez initialiser une nouvelle session." });
    }
    
    // Mettre à jour le timestamp de dernière interaction
    session.gameState.lastInteractionTime = Date.now();
    
    // Ajouter le message de l'utilisateur
    session.messages.push({
      role: "user",
      content: message
    });
    
    // Construire le prompt pour générer la réponse
    const responsePrompt = `L'utilisateur a dit: "${message}"

Réponds en suivant ces règles strictes pour créer une expérience ludique et immersive:

1. Ta réponse doit être structurée en 3 parties distinctes:
   - Une réponse directe à ce que l'utilisateur a dit (brève et pertinente)
   - Un élément d'apprentissage cybersécurité concret et utile
   - Une relance sous forme de question, défi, ou jeu pour maintenir l'engagement

2. Ton style doit être:
   - Visuel (utilise la mise en forme pour créer une interface attrayante)
   - Dynamique (énergique et rythmé, jamais ennuyeux)
   - Adaptable (le niveau de complexité doit correspondre à ${session.playerLevel})
   - Interactif (propose toujours une action à l'utilisateur)

3. IMPORTANT - Tu dois toujours terminer par une question ou un défi qui demande une réponse
   - Jamais de fin ouverte ou passive
   - Inclure des choix clairs quand c'est pertinent
   - Utiliser une formulation qui incite à répondre

4. Format:
   - Structure claire avec des titres, listes et espaces visuels
   - Quelques emojis pertinents pour dynamiser (mais sans excès)
   - Mise en forme adaptée à une interface moderne de jeu
   
Ton objectif: que l'utilisateur ne puisse pas s'arrêter d'interagir avec toi car tu proposes toujours quelque chose d'intéressant à faire.`;
    
    // Générer une réponse via l'IA
    const aiResponse = await openAIService.getChatCompletion(
      [
        { role: "system", content: getCyberPulseSystemPrompt(session) },
        ...session.messages.slice(-6), // Inclure les 6 derniers messages pour le contexte
        { role: "user", content: responsePrompt }
      ],
      true, // Utiliser le modèle GPT-4o-mini pour une réponse rapide
      0.8, // Température plus élevée pour la créativité
      1200 // Longueur maximale raisonnable
    );
    
    // Traiter la réponse pour détecter le type de jeu ou défi proposé
    const gameDetectionPrompt = `Analyse cette réponse de CyberPULSE et identifie:

1. Le type de jeu/défi proposé: "quiz", "challenge", "scenario", "story", "simulation", ou "conversation"
2. Le sujet principal de cybersécurité abordé
3. Une action suggerée pour la prochaine interaction
4. Le niveau de difficulté estimé (débutant, intermédiaire, avancé)

Réponds exclusivement au format JSON comme ceci:
{
  "gameType": "quiz",
  "topic": "phishing",
  "nextAction": "ask_question",
  "difficulty": "débutant"
}

Réponse à analyser: "${aiResponse}"`;

    // Obtenir l'analyse au format JSON
    let gameAnalysis;
    try {
      const analysisResponse = await openAIService.getChatCompletion(
        [
          { role: "system", content: "Tu es un analyseur de contenu qui répond uniquement au format JSON." },
          { role: "user", content: gameDetectionPrompt }
        ],
        true,
        0.1, // Température très basse pour obtenir une réponse structurée
        500,
        { responseFormat: 'json_object' } // Demander un format JSON
      );
      
      gameAnalysis = JSON.parse(analysisResponse);
      
      // Mettre à jour l'état du jeu avec les informations détectées
      if (gameAnalysis.gameType) {
        session.gameState.currentGameType = gameAnalysis.gameType as any;
      }
      if (gameAnalysis.nextAction) {
        session.gameState.nextAction = gameAnalysis.nextAction;
      }
      if (gameAnalysis.difficulty === 'intermédiaire' || gameAnalysis.difficulty === 'avancé') {
        // Augmenter progressivement le niveau du joueur s'il répond bien à des questions plus difficiles
        session.playerLevel = gameAnalysis.difficulty;
      }
    } catch (error) {
      console.error("Erreur lors de l'analyse du jeu:", error);
      // En cas d'erreur d'analyse, continuer sans mettre à jour l'état du jeu
    }
    
    // Ajouter la réponse du système
    session.messages.push({
      role: "assistant",
      content: aiResponse
    });
    
    // Mettre à jour la session
    cyberPulseSessions.set(sessionId, session);
    
    // Renvoyer la réponse avec des informations supplémentaires sur le jeu
    return res.status(200).json({
      success: true,
      message: aiResponse,
      gameState: {
        active: session.gameState.active,
        currentGameType: session.gameState.currentGameType,
        score: session.gameState.score,
        nextAction: session.gameState.nextAction || 'respond',
        playerLevel: session.playerLevel,
        gameAnalysis: gameAnalysis || null
      },
      visualStyle: session.preferences.visualStyle
    });
    
  } catch (error) {
    console.error("Erreur lors du traitement du message CyberPULSE:", error);
    return res.status(500).json({ error: "Erreur lors du traitement du message" });
  }
}

/**
 * Génère un nouveau défi ou question cyber aléatoire 
 * Utile pour relancer l'engagement après une période d'inactivité
 * La nouvelle version inclut des options pour les boutons-réponses cliquables
 */
export async function generateCyberChallenge(req: Request, res: Response) {
  try {
    const { sessionId, challengeType } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: "ID de session manquant" });
    }
    
    // Récupérer la session existante
    const session = cyberPulseSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session non trouvée. Veuillez initialiser une nouvelle session." });
    }
    
    // Ajouter +10 points si c'est une bonne réponse à un quiz précédent
    const isCorrectAnswer = req.body.answer === "correct" || req.body.isCorrect === true;
    if (isCorrectAnswer && session.gameState.currentGameType === 'quiz') {
      session.gameState.score += 10;
      session.gameState.streak += 1;
    }
    
    // Types de défis disponibles
    const challengeTypes = ['quiz', 'scenario', 'simulation', 'assessment', 'game'];
    const selectedType = challengeType || challengeTypes[Math.floor(Math.random() * challengeTypes.length)];
    
    // Déterminer le domaine d'intérêt en fonction de l'historique ou des préférences
    let focusArea = "cybersécurité générale";
    if (session.preferences.focusArea && session.preferences.focusArea.length > 0) {
      focusArea = session.preferences.focusArea[0];
    }
    
    // Construire le prompt pour générer le défi
    const challengePrompt = `Génère un défi de cybersécurité interactif et ludique de type "${selectedType}" sur le thème "${focusArea}" adapté à un niveau "${session.playerLevel}".

Le défi doit:
1. Être visuellement attrayant (mise en forme claire et spacieuse)
2. Être immédiatement engageant (aucune longue introduction)
3. Contenir une partie éducative (apprentissage concret)
4. Se terminer par des choix clairs ou une question directe
5. Avoir un format adapté pour une interface de jeu interactive
6. Utiliser un ton dynamique et encourageant
7. Incorporer des éléments ludiques (points, récompenses conceptuelles, progression)

Assure-toi que le défi soit:
- Réaliste mais simplifié pour être accessible
- Orienté vers une action immédiate de l'utilisateur
- Visuellement structuré (titres, sections, listes)
- Adapté au style ${session.preferences.visualStyle}

IMPORTANT: Commence directement par le défi, sans introduction ni explication préalable.`;
    
    // Générer le défi via l'IA
    const challengeResponse = await openAIService.getChatCompletion(
      [
        { role: "system", content: getCyberPulseSystemPrompt(session) },
        { role: "user", content: challengePrompt }
      ],
      session.playerLevel === 'avancé', // Utiliser GPT-4o complet pour les niveaux avancés
      0.8, // Température plus élevée pour la créativité
      1200 // Longueur maximale raisonnable
    );
    
    // Mettre à jour l'état du jeu
    session.gameState.currentGameType = selectedType as any;
    session.gameState.lastInteractionTime = Date.now();
    session.gameState.challengesCompleted += 1;
    
    // Ajouter le défi aux messages
    session.messages.push({
      role: "assistant",
      content: challengeResponse
    });
    
    // Mettre à jour la session
    cyberPulseSessions.set(sessionId, session);
    
    return res.status(200).json({
      success: true,
      challenge: challengeResponse,
      challengeType: selectedType,
      gameState: {
        active: session.gameState.active,
        currentGameType: session.gameState.currentGameType,
        score: session.gameState.score,
        challengesCompleted: session.gameState.challengesCompleted,
        playerLevel: session.playerLevel
      },
      visualStyle: session.preferences.visualStyle
    });
    
  } catch (error) {
    console.error("Erreur lors de la génération du défi CyberPULSE:", error);
    return res.status(500).json({ error: "Erreur lors de la génération du défi" });
  }
}

/**
 * Vérifie l'inactivité de l'utilisateur et génère une relance si nécessaire
 * Cette fonction permet au chatbot d'initier la conversation de manière proactive
 */
export async function checkInactivity(req: Request, res: Response) {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: "ID de session manquant" });
    }
    
    // Récupérer la session existante
    const session = cyberPulseSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session non trouvée. Veuillez initialiser une nouvelle session." });
    }
    
    const currentTime = Date.now();
    const inactiveTime = currentTime - session.gameState.lastInteractionTime;
    
    // Si l'utilisateur est inactif depuis 3 minutes ou plus: fermer la session
    if (inactiveTime >= INACTIVITY_CLOSE_THRESHOLD) {
      // Message de fermeture automatique de session
      const closeSessionMessage = "Votre session a été automatiquement fermée après 3 minutes d'inactivité. Actualisez la page si vous souhaitez reprendre.";
      
      return res.status(200).json({
        success: true,
        inactivity: true,
        action: "close",
        message: closeSessionMessage,
        gameState: {
          active: false,
          score: session.gameState.score
        },
        visualStyle: session.preferences.visualStyle
      });
    } 
    // Si l'utilisateur est inactif depuis 30 secondes: simplement demander s'il est toujours là
    else if (inactiveTime >= INACTIVITY_REMINDER_THRESHOLD) {
      // Message simple de vérification de présence
      const reminderMessage = "Êtes-vous toujours là? Je suis prêt à continuer notre session de cybersécurité quand vous l'êtes.";
      
      // Ajouter le message de rappel
      session.messages.push({
        role: "assistant",
        content: reminderMessage
      });
      
      // Ne pas mettre à jour le timestamp de dernière interaction pour permettre la détection à 3 minutes
      // si l'utilisateur ne répond pas
      
      // Mettre à jour la session
      cyberPulseSessions.set(sessionId, session);
      
      return res.status(200).json({
        success: true,
        inactivity: true,
        action: "remind",
        message: reminderMessage,
        gameState: {
          active: session.gameState.active,
          currentGameType: session.gameState.currentGameType,
          score: session.gameState.score
        },
        visualStyle: session.preferences.visualStyle
      });
    } else {
      // L'utilisateur n'est pas considéré comme inactif
      return res.status(200).json({
        success: true,
        inactivity: false,
        inactiveTime: inactiveTime,
        reminderThreshold: INACTIVITY_REMINDER_THRESHOLD,
        closeThreshold: INACTIVITY_CLOSE_THRESHOLD
      });
    }
    
  } catch (error) {
    console.error("Erreur lors de la vérification d'inactivité:", error);
    return res.status(500).json({ error: "Erreur lors de la vérification d'inactivité" });
  }
}

/**
 * Met à jour les préférences de l'utilisateur pour la session CyberPULSE
 */
export async function updateCyberPulsePreferences(req: Request, res: Response) {
  try {
    const { sessionId, preferences } = req.body;
    
    if (!sessionId || !preferences) {
      return res.status(400).json({ error: "ID de session ou préférences manquants" });
    }
    
    // Récupérer la session existante
    const session = cyberPulseSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session non trouvée. Veuillez initialiser une nouvelle session." });
    }
    
    // Mettre à jour les préférences
    session.preferences = {
      ...session.preferences,
      ...preferences
    };
    
    // Mettre à jour la session
    cyberPulseSessions.set(sessionId, session);
    
    return res.status(200).json({
      success: true,
      preferences: session.preferences
    });
    
  } catch (error) {
    console.error("Erreur lors de la mise à jour des préférences:", error);
    return res.status(500).json({ error: "Erreur lors de la mise à jour des préférences" });
  }
}

/**
 * Met à jour le score du joueur en fonction de ses interactions
 */
export async function updatePlayerScore(req: Request, res: Response) {
  try {
    const { sessionId, scoreChange, correctAnswer } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: "ID de session manquant" });
    }
    
    // Récupérer la session existante
    const session = cyberPulseSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session non trouvée. Veuillez initialiser une nouvelle session." });
    }
    
    // Mise à jour du score
    if (scoreChange) {
      session.gameState.score += scoreChange;
    }
    
    // Mise à jour de la streak pour les bonnes réponses consécutives
    if (correctAnswer === true) {
      session.gameState.streak += 1;
      
      // Bonus de score pour les streaks
      if (session.gameState.streak >= 3) {
        const streakBonus = Math.min(Math.floor(session.gameState.streak / 3), 5); // Maximum 5 points de bonus
        session.gameState.score += streakBonus;
      }
    } else if (correctAnswer === false) {
      session.gameState.streak = 0;
    }
    
    // Mise à jour de la progression globale (0-100)
    session.gameState.gameProgress = Math.min(100, Math.max(0, 
      Math.floor(session.gameState.score / 3) + 
      session.gameState.challengesCompleted * 5
    ));
    
    // Mise à jour du niveau du joueur en fonction de la progression
    if (session.gameState.gameProgress > 70) {
      session.playerLevel = 'avancé';
    } else if (session.gameState.gameProgress > 30) {
      session.playerLevel = 'intermédiaire';
    }
    
    // Mettre à jour la session
    cyberPulseSessions.set(sessionId, session);
    
    return res.status(200).json({
      success: true,
      gameState: {
        score: session.gameState.score,
        streak: session.gameState.streak,
        gameProgress: session.gameState.gameProgress,
        playerLevel: session.playerLevel
      }
    });
    
  } catch (error) {
    console.error("Erreur lors de la mise à jour du score:", error);
    return res.status(500).json({ error: "Erreur lors de la mise à jour du score" });
  }
}

/**
 * Construit le prompt système pour CyberPULSE en fonction de la session
 * Version améliorée : réponses plus courtes, renforcement du système de score
 */
function getCyberPulseSystemPrompt(session: CyberPulseSession): string {
  return `Tu es CyberPULSE, un chatbot de cybersécurité direct et concis qui crée une expérience ludique d'apprentissage.

## PRINCIPES CLÉS:
- Être EXTRÊMEMENT CONCIS: maximum 2-3 phrases par section
- Réponses COURTES et directes, toujours sous forme de paragraphes courts
- Difficulté: ${session.playerLevel}
- Style: ${session.preferences.visualStyle}
- Toujours inclure des boutons de réponse pour les quiz

## INTERACTION ET ENGAGEMENT:
- Proposer des défis simples (quiz à choix multiples, questions oui/non)
- Attribuer clairement des points après chaque bonne réponse (+10, +20, etc.)
- Féliciter explicitement pour les bonnes réponses
- Proposer fréquemment de terminer la session et voir un résumé

## STRUCTURE DE MESSAGE (stricte):
1. Une réponse courte et directe (1-2 phrases maximum)
2. Une information cyber utile (1 phrase)
3. Une question directe ou proposition d'action (1 phrase)

## FORMAT:
- Structure simple et épurée
- Phrases courtes, jamais plus de 15 mots
- Style ${session.preferences.visualStyle}: ${getVisualStyleGuide(session.preferences.visualStyle)}
- Maximum 1-2 emojis par message

## RÈGLES STRICTES:
- LIMITER la longueur totale à 100 mots maximum
- SYSTÉMATIQUEMENT afficher le score quand il change: "Score: X points"
- AJOUTER 10 points pour chaque bonne réponse (avec message explicite)
- OFFRIR des boutons cliquables [Oui] [Non] pour les quiz simples
- PROPOSER régulièrement un bouton [Terminer la session] pour obtenir un résumé

CRUCIAL: Tourne-toi vers l'essentiel. Évite toute verbosité. Sois précis et concis.`;
}

/**
 * Renvoie un guide de style visuel spécifique en fonction du style choisi
 */
function getVisualStyleGuide(style: string): string {
  switch (style) {
    case 'futuristic':
      return "interface de cockpit high-tech, codes couleur cyan/bleu, éléments holographiques";
    case 'neon':
      return "ambiance cyberpunk, contrastes forts, effet néon, teintes rose/violet/bleu";
    case 'minimal':
      return "design épuré, espaces blancs, typographie claire, mise en page aérée";
    case 'classic':
    default:
      return "interface professionnelle, organisation claire, structure traditionnelle";
  }
}