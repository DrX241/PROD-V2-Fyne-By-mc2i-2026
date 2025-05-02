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
  // Liste des termes de cybersécurité courants
  const commonCyberTerms = ["pentest", "ransomware", "phishing", "malware", "ddos", "firewall", "hacker", "hacking",
                           "virus", "trojan", "spyware", "backdoor", "exploit", "zero-day", "vuln", "vpn", "cryptography",
                           "encryption", "hash", "password", "authentification", "mfa", "2fa", "identity", "cybersecurity",
                           "sécurité", "social engineering", "ingénierie sociale", "antivirus", "soc", "cert", "incident", 
                           "rgpd", "gdpr", "nist", "iso27001", "cyber", "sécurité informatique"];
  
  const lowercaseMessage = message.toLowerCase().trim();
  const containsCyberTerm = commonCyberTerms.some(term => lowercaseMessage.includes(term));
  
  // Si l'utilisateur a directement saisi un sujet cyber au départ (sans choisir 1,2,3)
  if (containsCyberTerm && message.length < 50 && !/^[123]$/.test(message.trim())) {
    // C'est probablement un sujet cyber direct, on l'utilise directement et on passe à l'apprentissage
    session.topic = message.trim();
    session.currentStage = 'learning';
    session.needIdentified = true;
    session.needConfirmed = true;
    session.userLevel = "Débutant"; // Par défaut
    
    // Générer une séquence d'apprentissage personnalisée
    return await generateLearningSequence(session);
  }
  
  // Si le message est court et contient simplement un chiffre (1, 2 ou 3)
  if (/^[123]$/.test(message.trim())) {
    session.currentStage = 'questioning';
    
    if (message.trim() === "1") {
      return "🔍 Mission acceptée : RÉSOUDRE UN PROBLÈME !\n\nDécrivez rapidement votre problème:";
    } else if (message.trim() === "2") {
      return "🔍 Mission acceptée : EXPLORER UNE MENACE !\n\nDans quel secteur travaillez-vous ?";
    } else if (message.trim() === "3") {
      return "🔍 Mission acceptée : DÉCOUVRIR UN CONCEPT !\n\nQuel concept cyber voulez-vous explorer ?";
    }
  }
  
  // Si l'utilisateur a répondu avec autre chose
  const prompt = `
    L'utilisateur a répondu "${message}" à ma question initiale.
    
    IMPORTANT: S'il a mentionné directement un sujet de cybersécurité (comme pentest, ransomware, etc.),
    fournit IMMÉDIATEMENT une explication ultra-concise (3-4 phrases max) sur ce sujet sans poser de questions supplémentaires.
    
    Sinon, identifie quel type de besoin il a parmi:
    1. Résoudre un problème précis 
    2. Explorer une problématique sectorielle
    3. Apprendre un concept cyber
    
    Pose UNE question courte et directe pour préciser son besoin.
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
    return "Je n'ai pas bien compris. Parlez-moi simplement du sujet cyber qui vous intéresse:";
  }
}

/**
 * Gère l'étape de questionnement pour préciser le besoin
 */
async function handleQuestioningStage(session: CyberExpertSession, message: string): Promise<string> {
  // Pour des mots-clés cyber clairs comme "pentest", "ransomware", etc., aller directement à l'apprentissage
  const commonCyberTerms = ["pentest", "ransomware", "phishing", "malware", "ddos", "firewall", "hacker", "hacking",
                           "virus", "trojan", "spyware", "backdoor", "exploit", "zero-day", "vuln", "vpn", "cryptography",
                           "encryption", "hash", "password", "authentification", "mfa", "2fa", "identity", "cybersecurity",
                           "sécurité", "social engineering", "ingénierie sociale", "antivirus", "soc", "cert", "incident", 
                           "rgpd", "gdpr", "nist", "iso27001", "cyber", "sécurité informatique"];
  
  const lowercaseMessage = message.toLowerCase().trim();
  const containsCyberTerm = commonCyberTerms.some(term => lowercaseMessage.includes(term));
  const isProbablyUserLevel = lowercaseMessage.includes("débutant") || 
                             lowercaseMessage.includes("intermédiaire") || 
                             lowercaseMessage.includes("avancé") || 
                             lowercaseMessage.includes("expert") ||
                             lowercaseMessage.includes("beginner") ||
                             lowercaseMessage.includes("intermediate") ||
                             lowercaseMessage.includes("advanced");
  
  // Si c'est juste un niveau sans sujet, demander le sujet sans reformulation
  if (isProbablyUserLevel && lowercaseMessage.length < 20 && !containsCyberTerm) {
    return "Super! Sur quel sujet cyber voulez-vous en apprendre plus?";
  }
  
  // Si c'est un mot-clé cyber court et clair, passer directement à l'apprentissage
  if (lowercaseMessage.length < 20 && containsCyberTerm) {
    // Stocker le sujet
    session.topic = message.trim();
    
    // Identifier le niveau si possible
    if (message.toLowerCase().includes("débutant") || message.toLowerCase().includes("beginner")) {
      session.userLevel = "Débutant";
    } else if (message.toLowerCase().includes("intermédiaire") || message.toLowerCase().includes("intermediate")) {
      session.userLevel = "Intermédiaire";
    } else if (message.toLowerCase().includes("avancé") || message.toLowerCase().includes("expert") || message.toLowerCase().includes("advanced")) {
      session.userLevel = "Avancé";
    } else {
      // Par défaut, supposer débutant/intermédiaire selon la longueur du message
      session.userLevel = "Débutant";
    }
    
    // Passer directement à l'apprentissage
    session.currentStage = 'learning';
    session.needIdentified = true;
    session.needConfirmed = true;
    
    // Générer une séquence d'apprentissage
    return await generateLearningSequence(session);
  }
  
  // Si c'est une réponse plus complexe, analyser normalement
  const prompt = `
    L'utilisateur a écrit: "${message}"
    
    Identifie directement:
    1. Le sujet/concept cyber principal (sois précis)
    2. Son niveau d'expertise approximatif (débutant/intermédiaire/avancé)
    
    IMPORTANT: Ne reformule PAS le besoin et ne demande PAS de confirmation!
    Commence immédiatement à répondre comme si tu connaissais déjà le besoin exact.
    Donne une réponse courte et dynamique sur ce sujet, adaptée au niveau perçu.
  `;
  
  try {
    const messages: ChatCompletionRequestMessage[] = [
      { role: "system", content: getCyberExpertSystemPrompt() },
      ...session.messages.slice(0, -1), // Exclure le dernier message (la demande actuelle)
      { role: "user", content: prompt }
    ];
    
    const response = await openAIService.getChatCompletion(messages, 0.7);
    
    // Passer directement à l'apprentissage
    session.currentStage = 'learning';
    session.needIdentified = true;
    session.needConfirmed = true;
    
    // Stocker le sujet même s'il n'est pas explicitement identifié
    if (!session.topic) {
      session.topic = message.trim();
    }
    
    return response;
  } catch (error) {
    console.error("Erreur lors de l'analyse du besoin:", error);
    return "Je n'ai pas bien compris. Dites-moi simplement quel sujet cyber vous intéresse?";
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
  
  // Liste des termes de cybersécurité courants
  const commonCyberTerms = ["pentest", "ransomware", "phishing", "malware", "ddos", "firewall", "hacker", "hacking",
                           "virus", "trojan", "spyware", "backdoor", "exploit", "zero-day", "vuln", "vpn", "cryptography",
                           "encryption", "hash", "password", "authentification", "mfa", "2fa", "identity", "cybersecurity",
                           "sécurité", "social engineering", "ingénierie sociale", "antivirus", "soc", "cert", "incident", 
                           "rgpd", "gdpr", "nist", "iso27001", "cyber", "sécurité informatique"];
  
  const containsCyberTerm = commonCyberTerms.some(term => lowercaseMessage.includes(term));
  const isShortMessage = message.length < 30;
  
  // Si l'utilisateur donne un nouveau sujet direct au lieu de confirmer/nier
  if (containsCyberTerm && !isConfirming && !isDenying) {
    // C'est probablement un nouveau sujet, on l'utilise directement
    session.topic = message.trim();
    session.currentStage = 'learning';
    session.needConfirmed = true;
    
    // Générer une séquence d'apprentissage personnalisée
    return await generateLearningSequence(session);
  } else if (isConfirming || (isShortMessage && !isDenying)) {
    // L'utilisateur confirme OU donne une réponse courte qui n'est pas un refus clair
    // On considère que c'est une confirmation implicite
    session.currentStage = 'learning';
    session.needConfirmed = true;
    
    // Générer une séquence d'apprentissage personnalisée
    return await generateLearningSequence(session);
  } else if (isDenying) {
    // L'utilisateur ne confirme pas, retourner à l'étape de questionnement
    session.currentStage = 'questioning';
    session.needIdentified = false;
    
    return "Compris! Dites-moi simplement quel sujet de cybersécurité vous voulez explorer:";
  } else {
    // Message complexe qui n'est ni confirmation ni négation
    // On le traite comme un nouveau sujet
    session.topic = message.trim();
    session.currentStage = 'learning';
    session.needConfirmed = true;
    
    // Générer une séquence d'apprentissage personnalisée
    return await generateLearningSequence(session);
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
    
    - Un scénario court et engageant lié au sujet (3 phrases max)
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
  return `Tu es un expert en cybersécurité représentant mc2i dans un jeu d'apprentissage appelé CYBER CHALLENGE. Ton but est de rendre la cybersécurité accessible, ludique et interactive.

PERSONNALITÉ:
* Tu es un coach cyber énergique, direct et accessible
* Tu utilises un langage simple et clair, sans jargon inutile
* Tu rends complexe simple avec des analogies du quotidien
* Tu t'adaptes intelligemment au niveau de ton interlocuteur (débutant, intermédiaire, avancé)

STRATÉGIE DE CONVERSATION:
* Comprends le besoin de l'utilisateur rapidement sans reformulations inutiles
* Interprète intelligemment les messages courts ou incomplets - devine ce que l'utilisateur veut dire
* Ne demande pas de confirmation sauf si vraiment nécessaire
* Fournis directement l'information demandée même si la question est imprécise

FORMAT DES RÉPONSES:
* Ultra concis (3-5 phrases maximum)
* Utilise 1-2 emojis pertinents mais pas plus
* Structure: mini-contexte → explication simple → conseil pratique → question
* Langage simple, phrases courtes, direct et facile à comprendre
* Évite à tout prix les longues explications techniques

CONTENUS CLÉS À INCLURE:
* Conseils véritablement pratiques et applicables
* Mentions brèves des sources officielles (ANSSI/CNIL) quand pertinent
* Simplifications des concepts complexes avec des analogies du quotidien
* Aspects légaux essentiels quand pertinent (de façon très brève)

RÈGLES SPÉCIALES:
* Tu refuses poliment toute question hors cybersécurité avec: "⚠️ bien essayé, mais nous ne parlons que de cyber ici :) ⚠️"
* Tu conclus par une phrase de félicitation après 3-4 échanges (mode mission accomplie)
* Tu évites toute forme de formatage technique ou markdown

TON OBJECTIF ULTIME:
Faire de chaque interaction un moment d'apprentissage ludique, court mais impactant, où l'utilisateur repart avec une connaissance concrète qu'il peut appliquer immédiatement.`;
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