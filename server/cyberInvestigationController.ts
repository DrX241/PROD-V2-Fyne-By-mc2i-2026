import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { openAIService } from "./services/openai";

// Les concepts potentiels de cybersécurité (large éventail pour plus de variété)
const CYBER_CONCEPTS = [
  "ransomware", 
  "phishing", 
  "attaque DDoS", 
  "ver informatique", 
  "APT (Advanced Persistent Threat)", 
  "social engineering",
  "attaque par force brute",
  "zero-day",
  "man-in-the-middle",
  "rootkit",
  "backdoor",
  "spyware",
  "cryptojacking",
  "attaque de la chaîne d'approvisionnement",
  "rogue access point",
  "attaque par rejeu",
  "ingénierie sociale par téléphone (vishing)",
  "whaling",
  "watering hole attack",
  "typosquatting"
];

// Les styles narratifs possibles pour l'IA (plus de variété)
const NARRATIVE_STYLES = [
  "expert cybersécurité formel",
  "détective privé noir",
  "mentor pédagogue",
  "enquêteur high-tech",
  "agent secret",
  "analyste forensique"
];

// Niveaux de difficulté possibles
const DIFFICULTY_LEVELS = ["débutant", "intermédiaire", "avancé"];

// Interface pour la session d'enquête
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

// Map pour stocker les sessions actives
const activeSessions = new Map<string, InvestigationSession>();

// Prompt système de base
const getBaseSystemPrompt = (style: string, concept: string, difficulty: string, userName: string) => {
  return `Tu es I AM CYBER, un agent conversationnel spécialisé en cybersécurité qui anime un jeu d'enquête interactif. Tu adoptes le style d'un ${style}.

CONCEPT À EXPLORER: ${concept} (TRÈS IMPORTANT: Ne jamais mentionner explicitement ce concept avant la phase de révélation)

NIVEAU DE DIFFICULTÉ: ${difficulty}

MISSION:
Guide ${userName} à travers une enquête ludique, interactive et éducative sur ce concept de cybersécurité, sans jamais le nommer avant la fin.

PRINCIPES CLÉS:
1. DYNAMISME: Chaque message doit être unique, personnalisé et adapté au contexte.
2. CRÉATIVITÉ: Invente des scénarios originaux et réalistes liés au concept.
3. ADAPTABILITÉ: Ajuste-toi aux réponses de l'utilisateur, corrige si nécessaire, valide quand c'est pertinent.
4. RECADRAGE: Si l'utilisateur s'éloigne trop du sujet, ramène-le subtilement vers l'enquête sur le concept.
5. PRÉCISION TECHNIQUE: Toutes les informations doivent être exactes et à jour.

STRUCTURE DE L'INTERACTION:
1. MESSAGE D'ACCUEIL:
   - Accueille l'utilisateur dans un scénario d'enquête cybersécurité captivant
   - Présente un incident réaliste lié au concept (sans le nommer)
   - Propose un premier indice et une question à choix multiples pour lancer l'enquête

2. SÉRIE DE QUESTIONS (6 minimum):
   - Pose des questions progressives qui couvrent différents aspects du concept
   - Varie les formats: choix multiples, questions ouvertes, mises en situation
   - Les questions doivent couvrir: signaux d'alerte, mécanismes techniques, impacts, contre-mesures, vulnérabilités exploitées, cas réels

3. RÉVÉLATION DU CONCEPT:
   - Dévoile enfin le nom du concept cybersécurité étudié
   - Explique sa définition, son fonctionnement et ses variantes
   - Félicite l'utilisateur pour son enquête

4. ENRICHISSEMENT:
   - Partage une anecdote historique réelle et marquante liée à ce concept
   - Présente 3-5 bonnes pratiques détaillées pour s'en protéger
   - Cite 2-3 références sérieuses (ANSSI, CERT, NIST, etc.) pour approfondir

IMPORTANT:
- Reste toujours en français, avec un vocabulaire clair mais précis
- Adapte-toi au niveau de difficulté indiqué
- N'oublie jamais que tu dois rester dans ton rôle de ${style}
- Maintiens un équilibre entre rigueur technique et accessibilité
- Ne donne jamais toutes les réponses d'emblée, guide l'utilisateur vers la découverte

DÉBUT DE SESSION:
Lance directement le scénario d'enquête avec créativité et dynamisme.`;
};

/**
 * Démarre une nouvelle session d'enquête sur un concept cyber
 * Totalement dynamique et personnalisée
 */
export async function startInvestigation(req: Request, res: Response) {
  try {
    const { userId, userName } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'ID utilisateur requis'
      });
    }
    
    // Sélection aléatoire du concept, style narratif et niveau de difficulté
    const randomConcept = CYBER_CONCEPTS[Math.floor(Math.random() * CYBER_CONCEPTS.length)];
    const randomStyle = NARRATIVE_STYLES[Math.floor(Math.random() * NARRATIVE_STYLES.length)];
    const randomDifficulty = DIFFICULTY_LEVELS[Math.floor(Math.random() * DIFFICULTY_LEVELS.length)];
    
    console.log(`Démarrage d'une enquête sur: ${randomConcept} (Style: ${randomStyle}, Difficulté: ${randomDifficulty})`);
    
    // Créer une nouvelle session
    const sessionId = uuidv4();
    const newSession: InvestigationSession = {
      id: sessionId,
      userId,
      userName: userName || "Détective",
      currentStage: 0,
      selectedConcept: randomConcept,
      narrativeStyle: randomStyle,
      difficultyLevel: randomDifficulty,
      messages: [],
      startTime: Date.now(),
      lastUpdateTime: Date.now(),
      questionCount: 0,
      conceptRevealed: false
    };
    
    // Générer le prompt système personnalisé
    const systemPrompt = getBaseSystemPrompt(
      randomStyle, 
      randomConcept, 
      randomDifficulty,
      userName || "Détective"
    );
    
    // Générer le message d'accueil via GPT-4o
    const initialPrompt = `Crée un message d'accueil pour une enquête interactive sur le concept: ${randomConcept}. 
N'identifie PAS le concept directement. 
Présente un scénario réaliste impliquant ce concept, un premier indice et une question à choix multiples A à D.
Formate ta réponse en Markdown pour une meilleure lisibilité.
Adopte le style d'un ${randomStyle} et adapte la complexité au niveau ${randomDifficulty}.`;
    
    try {
      const welcomeMessage = await openAIService.getChatCompletionWithCache(
        [
          { role: "system", content: systemPrompt },
          { role: "user", content: initialPrompt }
        ],
        0.9, // Température élevée pour plus de créativité
        1000  // Nombre maximum de tokens
      );
      
      // Ajouter ce message à l'historique de la session
      newSession.messages.push({
        id: uuidv4(),
        role: "assistant",
        content: welcomeMessage,
        timestamp: Date.now()
      });
      
      // Stocker la session
      activeSessions.set(sessionId, newSession);
      
      // Répondre avec les informations de la session
      return res.json({
        success: true,
        message: 'Session d\'enquête cybersécurité initialisée',
        sessionId,
        welcomeMessage
      });
    } catch (error) {
      console.error("Erreur lors de l'appel à l'API OpenAI:", error);
      return res.status(500).json({
        success: false,
        error: "Erreur lors de la génération du message d'accueil"
      });
    }
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la session d\'enquête:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de l\'initialisation de la session'
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
    
    // Récupérer la session
    const session = activeSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session non trouvée'
      });
    }
    
    // Mettre à jour la session
    session.lastUpdateTime = Date.now();
    
    // Ajouter le message utilisateur à l'historique
    session.messages.push({
      id: uuidv4(),
      role: "user",
      content: message,
      timestamp: Date.now()
    });
    
    // Déterminer où nous en sommes dans la progression
    let promptContent = "";
    let shouldIncrementQuestionCount = false;
    
    // Si le concept n'a pas encore été révélé
    if (!session.conceptRevealed) {
      // Si nous avons déjà posé au moins 6 questions, c'est le moment de révéler
      if (session.questionCount >= 6) {
        session.conceptRevealed = true;
        promptContent = `L'utilisateur a répondu: "${message}". 
C'était la dernière question de notre enquête. 
Maintenant, il est temps de révéler que le concept étudié était "${session.selectedConcept}".
Donne une définition claire et précise du concept, ses caractéristiques principales et son importance en cybersécurité.
Utilise ton style de ${session.narrativeStyle} et garde un niveau adapté à ${session.difficultyLevel}.`;
      } else {
        // Sinon, poser la prochaine question
        shouldIncrementQuestionCount = true;
        promptContent = `L'utilisateur a répondu: "${message}". 
Nous sommes à la question ${session.questionCount + 1}/6 de notre enquête sur le concept ${session.selectedConcept} (ne nomme PAS le concept). 
Commente sa réponse de façon personnalisée, puis pose la prochaine question qui explore un nouvel aspect du concept.
Si l'utilisateur s'éloigne du sujet, ramène-le subtilement à l'enquête.
Varie le format des questions pour maintenir l'engagement.
Utilise ton style de ${session.narrativeStyle} et garde un niveau adapté à ${session.difficultyLevel}.`;
      }
    } 
    // Si le concept a été révélé mais nous n'avons pas encore donné l'anecdote
    else if (session.currentStage === 0) {
      session.currentStage = 1;
      promptContent = `L'utilisateur a répondu: "${message}" après la révélation du concept ${session.selectedConcept}. 
Partage maintenant une anecdote historique réelle et marquante sur ${session.selectedConcept}.
Puis présente 3-5 bonnes pratiques détaillées pour s'en protéger.
Termine par 2-3 références sérieuses (ANSSI, CERT, NIST, etc.) pour approfondir.
Utilise ton style de ${session.narrativeStyle} et garde un niveau adapté à ${session.difficultyLevel}.`;
    } 
    // Phase de conclusion
    else {
      promptContent = `L'utilisateur a répondu: "${message}" après l'anecdote et les bonnes pratiques sur ${session.selectedConcept}.
La session d'enquête est maintenant terminée.
Fais un bref résumé des points clés à retenir sur ${session.selectedConcept}.
Remercie l'utilisateur pour sa participation et suggère qu'il peut démarrer une nouvelle enquête sur un autre concept s'il le souhaite.
Utilise ton style de ${session.narrativeStyle} et garde un niveau adapté à ${session.difficultyLevel}.`;
    }
    
    // Construire l'historique des messages pour le contexte
    const messageHistory = session.messages.map(msg => ({
      role: msg.role === "assistant" ? "assistant" : "user",
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
          { role: "system", content: systemPrompt },
          ...messageHistory.slice(-10), // Les 10 derniers messages pour le contexte
          { role: "user", content: promptContent }
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