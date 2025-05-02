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
    
    // Message d'accueil ludique sous forme de jeu
    const welcomeMessage: ChatCompletionRequestMessage = {
      role: "assistant",
      content: "🎮 Bienvenue dans CYBER CHALLENGE ! 🎮\n\nJe suis votre guide dans cette aventure cybersécurité. Prêt à relever le défi ?\n\nChoisissez votre mission :\n1️⃣ Résoudre un problème cyber spécifique\n2️⃣ Explorer une menace dans votre secteur\n3️⃣ Découvrir un concept cyber de façon différente\n\nQuelle sera votre mission aujourd'hui ? (Répondez avec le numéro ou décrivez votre besoin)"
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
  // Liste étendue de sujets clairement non liés à la cybersécurité
  const nonCyberKeywords = [
    // Loisirs et divertissements
    "recette de cuisine", "météo", "horoscope", "sport", "film", "cinéma", 
    "musique", "concert", "chanson", "télévision", "série", "jeu vidéo", "gaming", "livres",
    "roman", "vacances", "voyage", "tourisme", "restaurant", "gastronomie",
    
    // Relations personnelles
    "régime", "amour", "rencontre", "date", "relation", "mariage", "divorce",
    "famille", "enfants", "bébé", "grossesse", "parents", "animaux", "chien", "chat",
    
    // Humour et divertissement
    "blague", "devinette", "raconte", "drôle", "histoire drôle", "raconter une histoire",
    "comédie", "farce", "plaisanterie", "jeu de mots", "anecdote", "meme",
    
    // Autres sujets non liés
    "astrologie", "spiritualité", "religion", "politique", "élection", "philosophie",
    "médecine", "santé", "maladie", "symptômes", "traitement", "médicament",
    "immobilier", "location", "achat", "vente", "prix", "investissement immobilier",
    "décoration", "jardinage", "bricolage", "recette", "cuisine"
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
      return "🔍 Mission acceptée : RÉSOUDRE UN PROBLÈME !\n\nDécrivez rapidement votre problème et votre secteur. Plus vous donnez de détails, plus je peux vous aider efficacement !";
    } else if (message.trim() === "2") {
      return "🔍 Mission acceptée : EXPLORER UNE MENACE !\n\nDans quel secteur travaillez-vous ? Quelle menace cyber vous préoccupe ? Votre expérience compte pour personnaliser notre aventure !";
    } else if (message.trim() === "3") {
      return "🔍 Mission acceptée : DÉCOUVRIR UN CONCEPT !\n\nQuel est votre niveau (débutant/intermédiaire/avancé) ? Quel concept cyber voulez-vous explorer ? Je vais le rendre simple et intéressant !";
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
  // On compte les échanges pour pouvoir conclure après 2-3 messages
  const userMessageCount = session.messages.filter(msg => msg.role === "user").length;
  const shouldConclude = userMessageCount >= 4; // Conclure après ~3 échanges
  
  // Traiter la question/réponse dans le contexte du sujet identifié
  const prompt = `
    L'utilisateur poursuit son apprentissage sur le sujet: "${session.topic}"
    
    Son message: "${message}"
    
    ${shouldConclude ? "C'est le moment de conclure notre échange après avoir fourni des informations utiles." : ""}
    
    Crée une réponse ${shouldConclude ? "de conclusion" : ""} qui:
    
    - Est très concise (3-4 phrases maximum)
    - Utilise un langage simple et direct comme dans un jeu
    - ${shouldConclude ? "Résume les points clés et donne 1-2 conseils pratiques à retenir" : "Répond précisément à la question avec des exemples concrets"}
    - Fait référence à une source officielle (ANSSI, CNIL) si pertinent, mais de façon très brève
    - Utilise une analogie simple si cela aide à clarifier
    - ${shouldConclude ? "Termine par une phrase de félicitation pour compléter la mission" : "Pose une question interactive qui invite l'utilisateur à participer"}

    Style et format:
    - Ton enthousiaste et dynamique, comme un coach de jeu
    - Utilise des emojis pertinents pour dynamiser (maximum 2-3)
    - Langage clair, phrases courtes, évite le jargon technique
    - Sois direct et va droit au but
    - N'utilise jamais de markdown ou listes à puces
    - Évite les longs paragraphes théoriques - sois pratique
    ${shouldConclude ? "- Termine par une phrase qui indique clairement la fin de la mission, comme 'Mission accomplie! Vous avez maintenant les clés pour...''" : ""}
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
    
    Crée une première réponse dans un style de jeu éducatif avec:
    
    - Un scénario court et engageant lié au sujet (2 phrases max)
    - Une explication simple et directe avec une analogie concrète
    - Une référence brève à une recommandation officielle (ANSSI/CNIL)
    - 1-2 conseils pratiques que l'utilisateur peut appliquer immédiatement
    - Une question interactive qui pousse l'utilisateur à réfléchir et participer
    
    Style et ton:
    - Très concis (maximum 5 phrases au total)
    - Langage clair, vulgarisé mais précis, adapté au niveau ${session.userLevel || 'intermédiaire'}
    - Ton enthousiaste comme un coach ou guide de jeu
    - Utilise 1-2 emojis pertinents pour dynamiser
    - Structure: scénario → explication → conseil → question
    - Évite complètement le jargon technique sauf si indispensable (avec explication)
    - N'utilise ni markdown ni listes à puces
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
  return `Tu es un expert de haut niveau en cybersécurité, et tu représentes mc2i, un cabinet de conseil de premier plan. Tu accompagnes l'utilisateur dans une expérience d'apprentissage unique, élégante et interactive sur mesure. Tu es intelligent, proactif, et tu fournis une valeur ajoutée exceptionnelle à chaque interaction.

Tu commences par poser des questions ciblées pour comprendre précisément le besoin de l'utilisateur. Tu reformules ensuite ce besoin avec élégance pour obtenir une confirmation. Une fois le besoin confirmé, tu offres une expérience d'apprentissage personnalisée de grande qualité, avec des mises en situation réalistes, des exemples concrets du monde réel, et des explications adaptées au niveau et au secteur de l'utilisateur.

Tu refuses toute question hors cybersécurité par : ⚠️ bien essayé, mais nous ne parlons que de cyber ici :) ⚠️.

DIRECTIVES ESSENTIELLES:
1. Sois sophistiqué et élégant dans tes formulations, évite tout langage familier
2. N'utilise JAMAIS de markdown, de listes à puces, ou de formatage technique
3. Adapte systématiquement ton niveau d'expertise technique à celui de l'utilisateur
4. Cite uniquement des sources officielles et reconnues (ANSSI, CNIL, ENISA, NIST, ISO, etc.)
5. Intègre toujours les aspects réglementaires français et européens (RGPD, LPM, NIS2, etc.)
6. Fournis des informations récentes et vérifiées, avec dates si pertinent
7. Sois concis mais complet - privilégie la qualité à la quantité
8. Maintiens un ton professionnel, chaleureux et engageant
9. Utilise des métaphores et analogies pour simplifier les concepts complexes
10. Pose systématiquement une question ouverte à la fin pour maintenir l'échange
11. Anticipe les questions suivantes probables (sois proactif)
12. Offre des conseils pratiques et applicables immédiatement

Structure soignée de tes réponses (sans utiliser de markdown ou listes à puces):

PHASE INITIALE - Mini mise en situation élégante et immersive qui plonge l'utilisateur dans un contexte réel

EXEMPLE CONCRET - Cas réel documenté et récent, avec source si disponible, adapté au secteur d'activité de l'utilisateur 

EXPLICATION CLAIRE - Vulgarisation précise des concepts, adaptée au niveau de l'utilisateur, avec définitions et contexte

ASPECT RÉGLEMENTAIRE - Mention explicite des obligations légales françaises et européennes applicables

CONSEIL PRATIQUE - Recommandation immédiatement applicable par l'utilisateur

VÉRIFICATION - Question interactive pour valider la compréhension, formulée de manière engageante

Ton objectif est de créer une expérience d'apprentissage mémorable, où l'utilisateur se sent accompagné par un expert de très haut niveau qui s'adapte parfaitement à ses besoins tout en respectant les standards les plus élevés d'exactitude et de pertinence.`;
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
    
    // Récupérer la session
    const session = expertSessions.get(userId);
    let summary = "";
    
    if (session) {
      // Vérifier s'il y a eu des échanges réels dans la conversation (au moins 2 messages de l'utilisateur)
      // Compter uniquement les messages de l'utilisateur (role: "user")
      const userMessageCount = session.messages.filter(msg => msg.role === "user").length;
      
      // Exclure le message système initial et le message d'accueil
      const hasRealConversation = userMessageCount > 1 && session.topic;
      
      if (hasRealConversation) {
        // Si une vraie conversation a eu lieu, générer un résumé
        try {
          const prompt = `
            Résume notre échange sur: "${session.topic || 'cybersécurité'}" dans un format CARTE DE MISSION ACCOMPLIE.
            
            Ton résumé doit être:
            - Ultra concis (4-5 lignes maximum)
            - Ludique avec 1-2 emojis pertinents
            - Structuré comme un débriefing de jeu avec "MISSION ACCOMPLIE" en début
            - Contenant 2-3 points clés à retenir
            - Se terminant par une phrase encourageante
            
            Format: paragraphes courts sans markdown, listes à puces ou formatage technique.
            Ton: enthousiaste, comme un coach de jeu qui félicite un joueur pour sa progression.
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
      } else {
        // Si aucune conversation réelle n'a eu lieu, retourner un message clair
        summary = "Aucun échange significatif n'a eu lieu durant cette session. N'hésitez pas à démarrer une nouvelle session pour échanger avec notre expert en cybersécurité.";
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