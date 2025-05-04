/**
 * Contrôleur d'investigation cybersécurité I AM CYBER
 * Permet aux utilisateurs de découvrir des concepts de cybersécurité à travers
 * une enquête interactive et immersive générée dynamiquement par l'IA.
 */

import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { openAIService } from './services/openai';

// Garder les sessions actives en mémoire
const activeSessions = new Map<string, InvestigationSession>();

// Structure pour une session d'investigation
interface InvestigationSession {
  id: string;
  userId: string;
  userName: string;
  currentStage: number;
  selectedConcept: string;
  narrativeStyle: string;
  difficultyLevel: string;
  messages: Array<any>;
  startTime: number;
  lastUpdateTime: number;
  questionCount: number;
  conceptRevealed: boolean;
}

// Liste des concepts de cybersécurité principaux qui peuvent être explorés
const CYBER_CONCEPTS = [
  'phishing',
  'ransomware',
  'malware',
  'ddos',
  'social engineering',
  'zero-day vulnerabilities',
  'backdoor',
  'botnet',
  'man-in-the-middle attack',
  'keylogger',
  'trojan horse',
  'worm',
  'spoofing',
  'cryptojacking',
  'sql injection',
  'credential stuffing',
  'cross-site scripting',
  'brute force attack'
];

// Styles narratifs disponibles pour l'enquête
const NARRATIVE_STYLES = [
  'détective noir', 
  'science-fiction', 
  'thriller technique', 
  'enquête journalistique',
  'simulation réaliste'
];

// Niveaux de difficulté disponibles
const DIFFICULTY_LEVELS = [
  'débutant',
  'intermédiaire',
  'expert'
];

/**
 * Démarre une nouvelle session d'enquête sur un concept cyber
 * Totalement dynamique et personnalisée
 */
export async function startInvestigation(req: Request, res: Response) {
  try {
    const { userId, userName = 'Détective' } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'ID utilisateur requis'
      });
    }
    
    // Sélection aléatoire d'un concept, d'un style narratif et d'un niveau de difficulté
    const selectedConcept = CYBER_CONCEPTS[Math.floor(Math.random() * CYBER_CONCEPTS.length)];
    const narrativeStyle = NARRATIVE_STYLES[Math.floor(Math.random() * NARRATIVE_STYLES.length)];
    const difficultyLevel = DIFFICULTY_LEVELS[Math.floor(Math.random() * DIFFICULTY_LEVELS.length)];
    
    // Génération d'un ID de session unique
    const sessionId = uuidv4();
    
    // Création de la nouvelle session
    const newSession: InvestigationSession = {
      id: sessionId,
      userId,
      userName,
      currentStage: 0, // 0: Introduction, 1: Questions, 2: Révélation, 3: Enrichissement
      selectedConcept,
      narrativeStyle,
      difficultyLevel,
      messages: [],
      startTime: Date.now(),
      lastUpdateTime: Date.now(),
      questionCount: 0,
      conceptRevealed: false
    };
    
    // Enregistrement de la session
    activeSessions.set(sessionId, newSession);
    
    // Génération du message d'accueil pour démarrer l'enquête
    const systemPrompt = getBaseSystemPrompt(
      narrativeStyle,
      selectedConcept, 
      difficultyLevel,
      userName
    );
    
    const welcomePrompt = `Tu es I AM CYBER, un agent conversationnel de cybersécurité immersif. 
Commence une nouvelle enquête cybersécurité interactive sur le concept de ${selectedConcept}.
Adopte un style de ${narrativeStyle} et adapte-toi au niveau ${difficultyLevel}.
N'indique pas directement quel est le concept que l'utilisateur doit découvrir.
Présente un court message d'introduction avec quelques lignes sur l'investigation à venir.`;
    
    // Utilisation du service OpenAI existant
    const welcomeMessage = await openAIService.getChatCompletionWithCache(
      [
        { role: "system" as const, content: systemPrompt },
        { role: "user" as const, content: welcomePrompt }
      ],
      0.8, // Température élevée pour favoriser la variété
      1000 // Tokens suffisants pour une réponse riche
    );
    
    // Stockage du message dans l'historique
    newSession.messages.push({
      id: uuidv4(),
      role: "assistant",
      content: welcomeMessage,
      timestamp: Date.now()
    });
    
    // Retour de la session et du message d'accueil
    return res.json({
      success: true,
      sessionId,
      welcomeMessage,
      conceptRevealed: false,
      questionCount: 0,
      currentStage: 0
    });
    
  } catch (error) {
    console.error('Erreur lors du démarrage de l\'investigation:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur lors du démarrage de l\'investigation'
    });
  }
}

/**
 * Traite une réponse de l'utilisateur dans l'enquête
 * Garantit une conversation dynamique et adaptative
 */
export async function processInvestigationMessage(req: Request, res: Response) {
  try {
    const { sessionId, message } = req.body;
    
    if (!sessionId || !message) {
      return res.status(400).json({
        success: false,
        error: 'ID de session et message requis'
      });
    }
    
    // Récupération de la session
    const session = activeSessions.get(sessionId);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session non trouvée'
      });
    }
    
    // Mise à jour du timestamp de dernière activité
    session.lastUpdateTime = Date.now();
    
    // Enregistrement du message utilisateur
    session.messages.push({
      id: uuidv4(),
      role: "user",
      content: message,
      timestamp: Date.now()
    });
    
    // Déterminer l'étape actuelle et générer un prompt approprié
    let promptContent = "";
    let shouldIncrementQuestionCount = false;
    
    // Vérifier si l'utilisateur a trouvé le concept
    const userMessageLower = message.toLowerCase();
    const conceptFound = userMessageLower.includes(session.selectedConcept.toLowerCase());
    
    if (conceptFound && !session.conceptRevealed) {
      // L'utilisateur a trouvé le concept!
      session.conceptRevealed = true;
      session.currentStage = 2; // Passer à l'étape de révélation
      
      promptContent = `L'utilisateur vient de découvrir que le concept est "${session.selectedConcept}"!
Félicite-le chaleureusement pour sa déduction. Explique alors en détail ce qu'est ${session.selectedConcept} 
et pourquoi c'est un sujet important en cybersécurité. Donne quelques exemples concrets d'attaques ou 
d'incidents célèbres impliquant ce concept. Maintiens ton style de ${session.narrativeStyle}.`;
    }
    else if (session.conceptRevealed && session.currentStage === 2) {
      // Après la révélation, passer à l'enrichissement
      session.currentStage = 3;
      
      promptContent = `L'utilisateur continue la conversation après la révélation du concept "${session.selectedConcept}".
Fournis maintenant des informations pratiques sur la protection contre ${session.selectedConcept}:
- Des mesures préventives que les entreprises et particuliers peuvent prendre
- Des actions à entreprendre en cas d'attaque ${session.selectedConcept}
- Des tendances actuelles concernant ce type de menace
- Des formations ou ressources pour en apprendre plus sur ce sujet
Utilise ton style de ${session.narrativeStyle} et garde un niveau adapté à ${session.difficultyLevel}.`;
    }
    else if (session.conceptRevealed && session.currentStage === 3) {
      // Phase finale - conclusion
      promptContent = `L'utilisateur continue d'explorer le sujet de "${session.selectedConcept}" après les explications détaillées.
Conclus cette enquête en résumant les principaux points abordés concernant ${session.selectedConcept}.
Synthétise les enseignements clés, en rappelant l'importance de ce concept dans la cybersécurité moderne.
Remercie l'utilisateur pour sa participation et suggère qu'il peut démarrer une nouvelle enquête sur un autre concept s'il le souhaite.
Utilise ton style de ${session.narrativeStyle} et garde un niveau adapté à ${session.difficultyLevel}.`;
    }
    else if (session.questionCount >= 6 && !session.conceptRevealed) {
      // Si l'utilisateur a posé 6 questions sans trouver, lui révéler le concept
      session.conceptRevealed = true;
      session.currentStage = 2;
      
      promptContent = `L'utilisateur a posé plusieurs questions mais n'a pas encore identifié que le concept est "${session.selectedConcept}".
Révèle maintenant que le concept central de cette enquête est ${session.selectedConcept}.
Explique ce qu'est ${session.selectedConcept} et pourquoi c'est un concept important en cybersécurité.
Donne quelques exemples d'attaques ou d'incidents réels qui impliquent ce concept.
Maintiens ton style de ${session.narrativeStyle} et ton niveau de ${session.difficultyLevel}.`;
    }
    else {
      // Phase de questions normales
      shouldIncrementQuestionCount = true;
      
      promptContent = `L'utilisateur a envoyé: "${message}".
C'est sa question/réponse ${session.questionCount + 1} dans cette enquête sur "${session.selectedConcept}".

Réponds de manière engageante et immersive, dans ton style de ${session.narrativeStyle}.
Adapte ton explication au niveau ${session.difficultyLevel}.

Conseils:
- Maintiens le mystère, ne révèle pas explicitement que le concept est "${session.selectedConcept}"
- Fournis des indices sur ${session.selectedConcept} à travers ta réponse
- Si l'utilisateur s'approche du concept, encourage-le subtilement
- Reste centré sur le sujet de la cybersécurité
- Garde tes réponses intéressantes et informatives, mais pas trop longues

Si l'utilisateur semble désintéressé ou bloqué, oriente-le vers la bonne direction avec un indice subtil.`;
    }
    
    // Construire l'historique des messages pour le contexte
    const messageHistory = session.messages.map(msg => ({
      role: msg.role === "assistant" ? "assistant" as const : "user" as const,
      content: msg.content
    }));
    
    try {
      // Générer le prompt système dynamique et personnalisé
      const systemPrompt = getBaseSystemPrompt(
        session.narrativeStyle,
        session.selectedConcept,
        session.difficultyLevel,
        session.userName
      );
      
      // Appel à GPT-4o pour générer la réponse via le service existant
      const responseContent = await openAIService.getChatCompletionWithCache(
        [
          { role: "system" as const, content: systemPrompt },
          ...messageHistory.slice(-10), // Les 10 derniers messages pour le contexte
          { role: "user" as const, content: promptContent }
        ],
        0.8, // Température élevée pour favoriser la variété
        1200 // Plus de tokens pour des réponses plus riches
      );
      
      // Incrémenter le compteur de questions si nécessaire
      if (shouldIncrementQuestionCount) {
        session.questionCount += 1;
      }
      
      // Ajouter la réponse à l'historique
      const responseMessage = {
        id: uuidv4(),
        role: "assistant",
        content: responseContent,
        timestamp: Date.now()
      };
      
      session.messages.push(responseMessage);
      
      // Répondre avec le message généré
      return res.json({
        success: true,
        message: responseMessage,
        currentStage: session.currentStage,
        questionCount: session.questionCount,
        conceptRevealed: session.conceptRevealed
      });
    } catch (error) {
      console.error("Erreur lors de l'appel à l'API OpenAI:", error);
      return res.status(500).json({
        success: false,
        error: "Erreur lors de la génération de la réponse"
      });
    }
  } catch (error) {
    console.error('Erreur lors du traitement du message:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur lors du traitement du message'
    });
  }
}

/**
 * Supprime une session inactive pour libérer de la mémoire
 */
export async function cleanupInvestigationSession(req: Request, res: Response) {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'ID de session requis'
      });
    }
    
    // Suppression de la session
    const wasDeleted = activeSessions.delete(sessionId);
    
    if (wasDeleted) {
      return res.json({
        success: true,
        message: 'Session supprimée avec succès'
      });
    } else {
      return res.status(404).json({
        success: false,
        error: 'Session non trouvée'
      });
    }
  } catch (error) {
    console.error('Erreur lors de la suppression de la session:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la suppression de la session'
    });
  }
}

// Nettoyage automatique des sessions inactives (à exécuter périodiquement)
export function cleanupInactiveSessions() {
  const now = Date.now();
  const MAX_INACTIVE_TIME = 3 * 60 * 60 * 1000; // 3 heures
  
  activeSessions.forEach((session, sessionId) => {
    if (now - session.lastUpdateTime > MAX_INACTIVE_TIME) {
      activeSessions.delete(sessionId);
      console.log(`Session inactive supprimée: ${sessionId}`);
    }
  });
}

/**
 * Génère le prompt système de base pour l'agent I AM CYBER
 */
function getBaseSystemPrompt(
  narrativeStyle: string,
  concept: string,
  difficulty: string,
  userName: string
): string {
  return `# I AM CYBER - AGENT CONVERSATIONNEL D'ENQUÊTE CYBERSÉCURITÉ

## Ton rôle
Tu es I AM CYBER, un agent conversationnel spécialisé dans les enquêtes immersives sur les concepts de cybersécurité.
Ta mission est de créer une expérience d'apprentissage interactive où l'utilisateur découvre le concept de "${concept}" 
à travers une enquête narrative et engageante.

## Style narratif
Tu dois adopter un style de "${narrativeStyle}" pour toute l'enquête.
- Style détective noir: langage mystérieux, ambiance sombre, références au monde de la détection
- Style science-fiction: références futuristes, technologies avancées, menaces cyber évoluées
- Style thriller technique: précision technique, tension progressive, explications détaillées 
- Style enquête journalistique: ton factuel, approche méthodique, références à des cas réels
- Style simulation réaliste: scénario d'entreprise réaliste, langage professionnel, situations concrètes

## Niveau de difficulté: ${difficulty}
- Débutant: explications simples, concepts de base, analogies accessibles
- Intermédiaire: terminologie spécifique, contexte plus approfondi, détails techniques modérés
- Expert: discussions techniques détaillées, nuances avancées, exemples complexes

## Personnalisation
Adresse-toi à l'utilisateur par son nom: ${userName}

## Structure de l'enquête
1. Introduction: présentation mystérieuse sans révéler le concept
2. Questions (6 max): réponses qui donnent progressivement des indices sur ${concept}
3. Révélation: explication complète du concept une fois découvert (ou après 6 questions)
4. Enrichissement: informations pratiques, conseils de protection, ressources d'apprentissage

## Règles importantes
- Reste toujours dans ton rôle d'agent d'enquête cyber
- Ne révèle jamais directement que le concept est "${concept}" avant que l'utilisateur ne le devine
- Sois toujours informatif et pédagogique, même dans ton style narratif spécifique
- Adapte la complexité technique au niveau de difficulté défini
- Fournis toujours des informations exactes sur la cybersécurité
- Si l'utilisateur s'éloigne trop du sujet, ramène-le subtilement vers l'enquête
- Ne dépasse jamais ton rôle: tu es un outil éducatif, pas un outil de piratage

## Format d'interaction
- Messages courts à moyens (pas plus de 2-3 paragraphes)
- Informations précises et factuelles sur la cybersécurité
- Ton adapté au style narratif choisi
- Pédagogie progressive pour guider vers la découverte`;
}