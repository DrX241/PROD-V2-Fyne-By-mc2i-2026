import { Request, Response } from "express";
import { openAIService } from "./services/openai";
import { ChatCompletionRequestMessage } from "@shared/schema";
import { v4 as uuidv4 } from "uuid";

// Interface pour les sessions du chatbot expert en cybersécurité
interface CyberExpertSession {
  userId: string;
  userName?: string;
  userLevel?: 'Débutant' | 'Intermédiaire' | 'Avancé';
  userDomain?: string;
  messages: Array<ChatCompletionRequestMessage>;
  needIdentified: boolean;
  needConfirmed: boolean;
  currentStage: 'initial' | 'questioning' | 'confirmation' | 'learning';
  topic?: string;
}

// Map pour stocker les sessions actives des utilisateurs
const expertSessions = new Map<string, CyberExpertSession>();

/**
 * Initialise une session avec le chatbot expert en cybersécurité
 */
export async function initCyberExpertSession(req: Request, res: Response) {
  try {
    // Générer un ID unique pour l'utilisateur
    const userId = uuidv4();
    
    // Créer une nouvelle session
    const session: CyberExpertSession = {
      userId,
      messages: [],
      needIdentified: false,
      needConfirmed: false,
      currentStage: 'initial'
    };
    
    // Message d'accueil du système
    const systemMessage: ChatCompletionRequestMessage = {
      role: "system",
      content: getCyberExpertSystemPrompt()
    };
    
    // Message d'accueil pour l'utilisateur
    const welcomeMessage: ChatCompletionRequestMessage = {
      role: "assistant",
      content: "Bonjour! Je suis votre expert en cybersécurité. Je suis là pour vous aider à résoudre un problème, explorer un sujet cyber ou apprendre un concept différemment.\n\nSouhaitez-vous :\n\n1️⃣ Résoudre un problème précis ?\n2️⃣ Explorer une problématique métier ?\n3️⃣ Apprendre un concept cyber différemment ?"
    };
    
    // Ajouter les messages à la session
    session.messages.push(systemMessage);
    session.messages.push(welcomeMessage);
    
    // Stocker la session
    expertSessions.set(userId, session);
    
    return res.status(200).json({
      success: true,
      userId,
      message: welcomeMessage.content
    });
  } catch (error) {
    console.error("Erreur lors de l'initialisation de la session expert cyber:", error);
    return res.status(500).json({ error: "Erreur lors de l'initialisation de la session" });
  }
}

/**
 * Traite un message envoyé au chatbot expert en cybersécurité
 */
export async function processCyberExpertMessage(req: Request, res: Response) {
  try {
    const { userId, message } = req.body;
    
    if (!userId || !message) {
      return res.status(400).json({ error: "ID utilisateur ou message manquant" });
    }
    
    // Récupérer la session existante
    const session = expertSessions.get(userId);
    if (!session) {
      return res.status(404).json({ error: "Session non trouvée. Veuillez initialiser une nouvelle session." });
    }
    
    // Ajouter le message de l'utilisateur
    session.messages.push({
      role: "user",
      content: message
    });
    
    // Traiter le message en fonction de l'étape actuelle
    let response: string;
    
    // Si le message contient une question hors sujet (non cyber), la refuser
    if (isNonCyberQuestion(message)) {
      response = "⚠️ Bien essayé, mais nous ne parlons que de cyber ici :) ⚠️";
    } else {
      switch (session.currentStage) {
        case 'initial':
          // Première interaction: identifier le type de besoin
          response = await handleInitialStage(session, message);
          break;
        
        case 'questioning':
          // Phase de questions pour préciser le besoin
          response = await handleQuestioningStage(session, message);
          break;
        
        case 'confirmation':
          // Confirmation du besoin identifié
          response = await handleConfirmationStage(session, message);
          break;
        
        case 'learning':
          // Phase d'apprentissage et d'échange
          response = await handleLearningStage(session, message);
          break;
        
        default:
          // Cas imprévu
          response = "Je ne comprends pas votre demande. Pouvez-vous reformuler?";
      }
    }
    
    // Ajouter la réponse du système
    session.messages.push({
      role: "assistant",
      content: response
    });
    
    // Mettre à jour la session
    expertSessions.set(userId, session);
    
    return res.status(200).json({
      success: true,
      message: response,
      sessionStatus: {
        currentStage: session.currentStage,
        needIdentified: session.needIdentified,
        needConfirmed: session.needConfirmed,
        topic: session.topic
      }
    });
    
  } catch (error) {
    console.error("Erreur lors du traitement du message expert cyber:", error);
    return res.status(500).json({ error: "Erreur lors du traitement du message" });
  }
}

/**
 * Vérifie si une question est hors sujet (non liée à la cybersécurité)
 */
function isNonCyberQuestion(message: string): boolean {
  // Liste de sujets clairement non liés à la cybersécurité
  const nonCyberKeywords = [
    "recette de cuisine", "météo", "horoscope", "sport", "film", "cinéma", 
    "musique", "concert", "chanson", "régime", "amour", "rencontre", 
    "date", "blague", "devinette", "raconte", "drôle", "histoire drôle",
    "raconter une histoire"
  ];
  
  const lowercaseMessage = message.toLowerCase();
  
  // Vérifier si le message contient un sujet non-cyber
  for (const keyword of nonCyberKeywords) {
    if (lowercaseMessage.includes(keyword)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Gère la première étape de l'interaction (identification du type de besoin)
 */
async function handleInitialStage(session: CyberExpertSession, message: string): Promise<string> {
  // Si le message est court et contient simplement un chiffre (1, 2 ou 3)
  if (/^[123]$/.test(message.trim())) {
    session.currentStage = 'questioning';
    
    if (message.trim() === "1") {
      return "Vous souhaitez résoudre un problème précis. Pouvez-vous me décrire le problème que vous rencontrez? Quel est votre rôle ou domaine d'activité?";
    } else if (message.trim() === "2") {
      return "Vous souhaitez explorer une problématique métier. Dans quel secteur d'activité travaillez-vous? Et quelle est la problématique qui vous intéresse?";
    } else if (message.trim() === "3") {
      return "Vous souhaitez apprendre un concept cyber différemment. Quel est votre niveau en cybersécurité (Débutant / Intermédiaire / Avancé)? Quel concept souhaitez-vous explorer?";
    }
  }
  
  // Si l'utilisateur a répondu avec du texte au lieu d'un chiffre
  const prompt = `
    L'utilisateur a répondu "${message}" à ma question initiale où je lui proposais:
    1. Résoudre un problème précis
    2. Explorer une problématique métier
    3. Apprendre un concept cyber différemment
    
    Identifie lequel des trois choix correspond le mieux à sa réponse. Si ce n'est pas clair, pose 1-2 questions pour mieux comprendre son besoin. Ta réponse doit être directe, claire et sans introduction.
  `;
  
  session.currentStage = 'questioning';
  
  try {
    const messages: ChatCompletionRequestMessage[] = [
      { role: "system", content: getCyberExpertSystemPrompt() },
      { role: "user", content: prompt }
    ];
    
    return await openAIService.getChatCompletion(messages, 0.7);
  } catch (error) {
    console.error("Erreur lors de l'analyse du message initial:", error);
    return "Je n'ai pas bien compris votre demande. Pourriez-vous préciser si vous souhaitez:\n\n1️⃣ Résoudre un problème précis\n2️⃣ Explorer une problématique métier\n3️⃣ Apprendre un concept cyber différemment";
  }
}

/**
 * Gère l'étape de questionnement pour préciser le besoin
 */
async function handleQuestioningStage(session: CyberExpertSession, message: string): Promise<string> {
  // Collecter plus d'informations pour identifier le besoin précis
  const prompt = `
    L'utilisateur a écrit: "${message}"
    
    Basé sur cette réponse et nos échanges précédents:
    1. Identifie précisément le besoin/sujet/concept cyber de l'utilisateur
    2. Détermine son niveau d'expertise approximatif (débutant/intermédiaire/avancé)
    3. Identifie son contexte professionnel si possible
    
    Ensuite, reformule clairement ce que tu as compris de son besoin sous la forme: "Si je comprends bien, vous cherchez à [besoin précis]. Est-ce exact?" 
    
    Ta réponse doit être concise, centrée sur la reformulation du besoin et se terminer par une demande de confirmation.
  `;
  
  try {
    const messages: ChatCompletionRequestMessage[] = [
      { role: "system", content: getCyberExpertSystemPrompt() },
      ...session.messages.slice(0, -1), // Exclure le dernier message (la demande actuelle)
      { role: "user", content: prompt }
    ];
    
    const response = await openAIService.getChatCompletion(messages, 0.7);
    
    // Passer à l'étape de confirmation
    session.currentStage = 'confirmation';
    session.needIdentified = true;
    
    // Extraire le sujet/besoin identifié pour le stocker dans la session
    const needMatch = response.match(/vous cherchez à (.+?)\./i);
    if (needMatch && needMatch[1]) {
      session.topic = needMatch[1].trim();
    }
    
    return response;
  } catch (error) {
    console.error("Erreur lors de l'analyse du besoin:", error);
    return "Je n'ai pas bien compris votre besoin. Pourriez-vous le reformuler de manière plus précise?";
  }
}

/**
 * Gère l'étape de confirmation du besoin identifié
 */
async function handleConfirmationStage(session: CyberExpertSession, message: string): Promise<string> {
  // Analyser si l'utilisateur confirme ou non
  const lowercaseMessage = message.toLowerCase();
  const isConfirming = lowercaseMessage.includes("oui") || 
                      lowercaseMessage.includes("exact") || 
                      lowercaseMessage.includes("correct") ||
                      lowercaseMessage.includes("c'est ça") ||
                      lowercaseMessage.includes("tout à fait") ||
                      lowercaseMessage.includes("effectivement");

  const isDenying = lowercaseMessage.includes("non") || 
                   lowercaseMessage.includes("pas vraiment") ||
                   lowercaseMessage.includes("pas tout à fait") ||
                   lowercaseMessage.includes("pas exactement") ||
                   lowercaseMessage.includes("incorrect");
  
  if (isConfirming) {
    // L'utilisateur confirme, passer à l'étape d'apprentissage
    session.currentStage = 'learning';
    session.needConfirmed = true;
    
    // Générer une séquence d'apprentissage personnalisée
    return await generateLearningSequence(session);
  } else if (isDenying) {
    // L'utilisateur ne confirme pas, retourner à l'étape de questionnement
    session.currentStage = 'questioning';
    session.needIdentified = false;
    
    return "Je vous prie de m'excuser pour cette incompréhension. Pouvez-vous reformuler votre besoin pour que je puisse mieux vous aider?";
  } else {
    // Message ambigu, demander une confirmation claire
    return "Je n'ai pas bien compris votre réponse. Pouvez-vous me confirmer si j'ai bien cerné votre besoin par un simple 'oui' ou 'non'?";
  }
}

/**
 * Gère l'étape d'apprentissage et d'échange sur le sujet
 */
async function handleLearningStage(session: CyberExpertSession, message: string): Promise<string> {
  // Traiter la question/réponse dans le contexte du sujet identifié
  const prompt = `
    L'utilisateur poursuit son apprentissage sur le sujet: "${session.topic}"
    
    Il vient de dire: "${message}"
    
    Réponds de manière éducative en:
    1. Apportant des connaissances précises et à jour
    2. Adaptant ton discours à son niveau d'expertise
    3. Utilisant des exemples réels ou des analogies
    4. Fournissant une information bien structurée
    5. Posant une question ouverte en fin de réponse pour maintenir l'échange

    Si sa question montre qu'il a compris un concept, félicite-le brièvement.
    Si sa question révèle une confusion, corrige-la sans condescendance.
  `;
  
  try {
    const messages: ChatCompletionRequestMessage[] = [
      { role: "system", content: getCyberExpertSystemPrompt() },
      ...session.messages.slice(0, -1), // Exclure le dernier message (la demande actuelle)
      { role: "user", content: prompt }
    ];
    
    return await openAIService.getChatCompletion(messages, 0.7);
  } catch (error) {
    console.error("Erreur lors de la génération de la réponse d'apprentissage:", error);
    return "Je rencontre des difficultés à traiter votre question. Pourriez-vous la reformuler différemment?";
  }
}

/**
 * Génère une séquence d'apprentissage personnalisée basée sur le besoin confirmé
 */
async function generateLearningSequence(session: CyberExpertSession): Promise<string> {
  const prompt = `
    Le besoin suivant de l'utilisateur a été confirmé: "${session.topic}"
    
    Génère une séquence d'apprentissage personnalisée qui contient:
    
    1. Une mini mise en situation réaliste (3-4 lignes) liée directement au sujet
    2. Un exemple concret du monde réel pour illustrer le concept/problème
    3. Une explication vulgarisée du concept/problème, adaptée à un niveau ${session.userLevel || 'intermédiaire'}
    4. Un ou deux conseils pratiques que l'utilisateur peut appliquer immédiatement
    5. Une question ouverte pour encourager l'utilisateur à continuer l'échange
    
    Format ta réponse de manière claire avec des sauts de ligne entre les sections et utilise des emojis appropriés (🔍, 🧰, 🗺️, etc.) pour structurer ta réponse.
  `;
  
  try {
    const messages: ChatCompletionRequestMessage[] = [
      { role: "system", content: getCyberExpertSystemPrompt() },
      ...session.messages, // Inclure tous les messages pour le contexte
      { role: "user", content: prompt }
    ];
    
    return await openAIService.getChatCompletion(messages, 0.7);
  } catch (error) {
    console.error("Erreur lors de la génération de la séquence d'apprentissage:", error);
    return "Je rencontre des difficultés à générer votre parcours d'apprentissage. Pouvons-nous reformuler votre besoin?";
  }
}

/**
 * Fournit le prompt système pour le chatbot expert en cybersécurité
 */
function getCyberExpertSystemPrompt(): string {
  return `Tu es un expert en cybersécurité. Tu accompagnes l'utilisateur dans la résolution d'un problème ou l'exploration d'un sujet cyber. Tu poses d'abord quelques questions pour comprendre son besoin. Tu reformules ensuite ce besoin pour obtenir une confirmation. Puis tu proposes des mises en situation concrètes, des exemples métiers, des explications simples, et des mini-tests pour vérifier la compréhension. Tu adaptes ton discours au niveau et au secteur de l'utilisateur. Tu refuses toute question hors cybersécurité par : ⚠️ bien essayé, mais nous ne parlons que de cyber ici :) ⚠️.

Principes à respecter:
1. Sois direct et concis dans tes réponses
2. Adapte le niveau technique à l'expertise perçue de l'utilisateur
3. Utilise des exemples concrets et récents
4. Reste factuel et précis dans tes informations
5. Garde un ton professionnel mais accessible
6. Évite le jargon excessif pour les débutants
7. Structure clairement tes réponses avec des paragraphes courts
8. Inclus toujours une question ouverte à la fin pour maintenir l'échange
9. N'invente pas de faits ou de statistiques
10. Cite tes sources quand c'est pertinent

Quand tu proposes un parcours d'apprentissage, structure-le ainsi:
- 🔎 Mini mise en situation réaliste
- 🧰 Exemple réel pour illustrer
- 🗺️ Adaptation au contexte métier de l'utilisateur
- 🔤 Vulgarisation des concepts
- 🧪 Mini test interactif
- ✅ Feedback immédiat et constructif`;
}

/**
 * Termine une session et nettoie les ressources
 */
export async function terminateCyberExpertSession(req: Request, res: Response) {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: "ID utilisateur manquant" });
    }
    
    // Vérifier si la session existe
    if (!expertSessions.has(userId)) {
      return res.status(404).json({ error: "Session non trouvée" });
    }
    
    // Générer un résumé de la session
    const session = expertSessions.get(userId);
    let summary = "";
    
    if (session) {
      try {
        const prompt = `
          Génère un résumé concis (maximum 5 points) de la conversation sur le sujet: "${session.topic || 'cybersécurité'}"
          
          Mentionne:
          - Les principaux concepts abordés
          - Les conseils pratiques fournis
          - Les questions qui restent à explorer
          
          Format: liste à puces courtes et directes
        `;
        
        const messages: ChatCompletionRequestMessage[] = [
          { role: "system", content: getCyberExpertSystemPrompt() },
          ...session.messages.slice(0, -1),
          { role: "user", content: prompt }
        ];
        
        summary = await openAIService.getChatCompletion(messages, 0.7);
      } catch (error) {
        console.error("Erreur lors de la génération du résumé de session:", error);
        summary = "Résumé non disponible en raison d'une erreur technique.";
      }
      
      // Nettoyer la session
      expertSessions.delete(userId);
    }
    
    return res.status(200).json({
      success: true,
      message: "Session terminée avec succès",
      summary
    });
  } catch (error) {
    console.error("Erreur lors de la terminaison de la session expert cyber:", error);
    return res.status(500).json({ error: "Erreur lors de la terminaison de la session" });
  }
}