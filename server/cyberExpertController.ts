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
    
    // Message d'accueil élégant et sophistiqué pour l'utilisateur
    const welcomeMessage: ChatCompletionRequestMessage = {
      role: "assistant",
      content: "Bonjour et bienvenue dans notre espace d'apprentissage personnalisé. Je suis votre expert en cybersécurité, représentant mc2i, cabinet de conseil de premier plan dans ce domaine. Je suis à votre disposition pour vous accompagner dans une expérience d'apprentissage sur mesure.\n\nPouvez-vous me préciser la nature de votre intérêt aujourd'hui? Souhaitez-vous approfondir un sujet spécifique de cybersécurité, résoudre une problématique particulière, ou explorer un concept avec une approche différente? Je suis impatient d'adapter mon expertise à vos besoins précis."
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
  // Si c'est juste une salutation simple
  const simpleGreetings = ["bonjour", "salut", "hello", "coucou", "hey", "hi", "bonsoir", "yo"];
  if (simpleGreetings.includes(message.trim().toLowerCase())) {
    // On passe tout de suite au stade de questionnement sans long discours
    session.currentStage = 'questioning';
    return "Bonjour ! Je suis votre expert en cybersécurité. Que puis-je faire pour vous aujourd'hui ?";
  }
  
  // Si le message est court et contient simplement un chiffre (1, 2 ou 3)
  if (/^[123]$/.test(message.trim())) {
    session.currentStage = 'questioning';
    
    if (message.trim() === "1") {
      return "Vous souhaitez résoudre un problème précis. Pourriez-vous me décrire ce problème et votre contexte professionnel ?";
    } else if (message.trim() === "2") {
      return "Vous souhaitez explorer une problématique métier. Dans quel secteur d'activité travaillez-vous et quel est l'enjeu cyber qui vous intéresse ?";
    } else if (message.trim() === "3") {
      return "Vous souhaitez apprendre un concept différemment. Quel est votre niveau en cybersécurité (Débutant / Intermédiaire / Avancé) et quel concept vous intéresse ?";
    }
  }
  
  // Si le message est très court (moins de 10 caractères) mais pas une salutation ni un chiffre
  if (message.trim().length < 10 && !/\?/.test(message)) {
    session.currentStage = 'questioning';
    return "Pourriez-vous m'en dire un peu plus sur ce qui vous amène ? Je suis spécialisé en cybersécurité et prêt à vous aider sur tout sujet relatif à ce domaine.";
  }
  
  // Si l'utilisateur a formulé une demande plus élaborée
  const prompt = `
    L'utilisateur a écrit: "${message}"
    
    DIRECTIVES:
    1. Si c'est une question simple ou une salutation, réponds de façon directe et naturelle en 1-2 phrases maximum.
    2. Si c'est une demande spécifique liée à la cybersécurité, identifie son besoin précis et pose 1-2 questions pertinentes.
    3. Si le message est ambigu, demande des clarifications de manière simple et directe.
    
    PRINCIPES CLÉS:
    - CONCISION : Ta réponse ne doit pas dépasser 3-4 phrases.
    - NATUREL : Utilise un ton convivial mais professionnel, sans excès de formalisme.
    - PERTINENCE : Reste concentré sur le sujet cyber mentionné ou pose des questions pour l'identifier.
    
    IMPORTANT: Ne fais pas de long monologue d'introduction. Va droit au but de façon humaine et conversationnelle.
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
    return "Pourriez-vous préciser ce que vous recherchez ? Je peux vous aider sur des problèmes concrets de cybersécurité, explorer des sujets liés à votre métier, ou vous expliquer des concepts cyber.";
  }
}

/**
 * Gère l'étape de questionnement pour préciser le besoin
 */
async function handleQuestioningStage(session: CyberExpertSession, message: string): Promise<string> {
  // Détecter les salutations simples ou messages très courts
  const simpleGreetings = ["bonjour", "salut", "hello", "coucou", "hey", "hi", "bonsoir", "yo"];
  if (simpleGreetings.includes(message.trim().toLowerCase())) {
    return "Bonjour ! Comment puis-je vous aider dans le domaine de la cybersécurité ?";
  }
  
  // Si le message est très court (moins de 10 caractères)
  if (message.trim().length < 10 && !/\?/.test(message)) {
    return "Pourriez-vous préciser votre question ou le sujet cyber qui vous intéresse ?";
  }
  
  // Collecter plus d'informations pour identifier le besoin de façon plus concise
  const prompt = `
    L'utilisateur a écrit: "${message}"
    
    DIRECTIVES:
    1. Identifie clairement le besoin ou la question cyber de l'utilisateur
    2. Reformule ce besoin de manière concise (1-2 phrases maximum)
    3. Vérifie si c'est bien ce que l'utilisateur cherche à savoir
    
    CONSIGNES IMPORTANTES:
    - Utilise une formulation directe et naturelle: "Si je comprends bien, vous souhaitez..."
    - Limite ta réponse à 3-4 phrases au total
    - Évite les longs monologues ou paragraphes
    - Adapte le niveau de technicité au langage utilisé par l'utilisateur
    
    IMPORTANT: Ta réponse doit être courte et vérifier simplement si tu as bien compris le besoin. Ne fais pas une réponse longue ou académique.
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
    const needMatch = response.match(/vous cherchez à (.+?)\./i) || 
                     response.match(/votre besoin(.+?)\./i) ||
                     response.match(/consiste à (.+?)\./i) ||
                     response.match(/souhaitez (.+?)\./i);
                     
    if (needMatch && needMatch[1]) {
      session.topic = needMatch[1].trim();
    } else {
      // Recherche de fallback plus large si les patterns précis échouent
      const fallbackMatch = response.match(/(?:besoin|cherchez|souhaitez|voulez).*?([^.]{10,100})\./i);
      if (fallbackMatch && fallbackMatch[1]) {
        session.topic = fallbackMatch[1].trim();
      }
    }
    
    // Tenter d'identifier le niveau de l'utilisateur
    const levelMatch = response.match(/niveau.*?(débutant|intermédiaire|avancé)/i);
    if (levelMatch && levelMatch[1]) {
      const level = levelMatch[1].toLowerCase();
      if (level.includes('débutant')) {
        session.userLevel = 'Débutant';
      } else if (level.includes('intermédiaire')) {
        session.userLevel = 'Intermédiaire';
      } else if (level.includes('avancé')) {
        session.userLevel = 'Avancé';
      }
    }
    
    // Tenter d'identifier le domaine/secteur d'activité
    const domainMatch = response.match(/(?:secteur|domaine|industrie).*?([^.]{5,50})\./i);
    if (domainMatch && domainMatch[1]) {
      session.userDomain = domainMatch[1].trim();
    }
    
    return response;
  } catch (error) {
    console.error("Erreur lors de l'analyse du besoin:", error);
    return "Je n'ai pas saisi avec toute la précision nécessaire la nature de votre besoin. Pourriez-vous le reformuler, idéalement en précisant votre contexte professionnel et l'objectif exact que vous souhaitez atteindre?";
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
  // Détecter si le message est une salutation ou très court
  const simpleGreetings = ["bonjour", "salut", "hello", "coucou", "hey", "hi", "bonsoir", "yo", "merci"];
  if (simpleGreetings.includes(message.trim().toLowerCase())) {
    return "Bonjour ! Avez-vous d'autres questions sur le sujet que nous explorons ?";
  }
  
  // Si le message est très court (moins de 5 caractères)
  if (message.trim().length < 5) {
    return "Avez-vous une question spécifique sur ce sujet ? Je suis là pour vous aider.";
  }
  
  // Analyse et réponse adaptée dans le contexte du sujet identifié
  const prompt = `
    CONTEXTE:
    - Sujet: "${session.topic}"
    - Secteur professionnel: ${session.userDomain || 'entreprise'}
    - Niveau d'expertise: ${session.userLevel || 'intermédiaire'}
    - Question: "${message}"
    
    DIRECTIVES:
    1. Identifie précisément la question et réponds-y directement
    2. Donne une information à valeur ajoutée (référence ANSSI/CNIL, cas pratique récent, ou conseil actionnable)
    3. Sois concis et précis: maximum 2-3 paragraphes
    4. Termine par une question simple pour poursuivre l'échange
    
    FORMAT:
    - Paragraphes courts et structurés (sans formatage technique)
    - Langage adapté au niveau ${session.userLevel || 'intermédiaire'} de l'utilisateur
    - Ton expert mais conversationnel
    
    IMPORTANT: Évite absolument les longs exposés. La réponse idéale ne dépasse pas 5-6 phrases au total.
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
    return "Je rencontre actuellement une difficulté technique dans l'élaboration de ma réponse. Pourriez-vous reformuler votre question sous un angle légèrement différent afin que je puisse vous apporter l'éclairage expert que vous recherchez?";
  }
}

/**
 * Génère une séquence d'apprentissage personnalisée basée sur le besoin confirmé
 */
async function generateLearningSequence(session: CyberExpertSession): Promise<string> {
  const prompt = `
    BESOIN CONFIRMÉ: "${session.topic}"
    NIVEAU UTILISATEUR: ${session.userLevel || 'intermédiaire'}
    CONTEXTE PROFESSIONNEL: ${session.userDomain || 'entreprise'}
    
    DIRECTIVES CLAIRES:
    - La première réponse doit être concise et directe (maximum 3-4 paragraphes courts)
    - Évite absolument les longs monologues académiques
    - Commence par une phrase d'introduction directe et accessible
    - Termine par une question ouverte simple
    
    STRUCTURE DE RÉPONSE:
    1. INTRODUCTION (1-2 phrases) - Présentation claire et concise du sujet
    
    2. EXPLICATION PRINCIPALE (1-2 paragraphes courts) - Présentation des concepts clés avec:
       - Une référence pertinente à une source officielle (ANSSI, CNIL, ENISA)
       - Un exemple concret ou une analogie simple
       - Si pertinent, mention brève du cadre réglementaire applicable
    
    3. RECOMMANDATION PRATIQUE (1 paragraphe court) - Un ou deux conseils concrets et applicables
    
    4. QUESTION D'INTERACTION (1 phrase) - Une question simple pour encourager l'échange
    
    IMPÉRATIFS STYLISTIQUES:
    - TON : Professionnel mais conversationnel, pas académique
    - LANGAGE : Clair et adapté au niveau de l'utilisateur (${session.userLevel || 'intermédiaire'})
    - FORMAT : Paragraphes courts et aérés, sans formatage technique
    - LONGUEUR : Réponse concise qui tient en une demi-page maximum
    
    IMPORTANT: Pour cette première réponse, réduis considérablement la complexité et la longueur du message. L'utilisateur doit pouvoir lire ta réponse en moins de 30 secondes.
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
    return "Je rencontre actuellement un défi technique dans l'élaboration de votre parcours d'apprentissage personnalisé. Pourriez-vous préciser un aspect particulier de ce sujet qui vous intéresse davantage, afin que je puisse recentrer mon analyse et vous offrir une réponse parfaitement adaptée?";
  }
}

/**
 * Fournit le prompt système pour le chatbot expert en cybersécurité
 */
function getCyberExpertSystemPrompt(): string {
  return `Tu es un expert de haut niveau en cybersécurité de mc2i, un cabinet de conseil de premier plan. Tu offres une expérience d'apprentissage interactive sophistiquée, personnalisée et de grande valeur. Tu es extrêmement intelligent, proactif et analytique, capable d'extraire l'essence des besoins même implicites de l'utilisateur.

CAPACITÉS COGNITIVES AVANCÉES:
Tu possèdes une intelligence artificielle supérieure te permettant d'adapter ton approche en temps réel. Tu appliques une compréhension profonde des nuances psychologiques pour mieux cerner les besoins réels derrière les questions. Tu utilises des techniques de questionnement socratique pour guider l'utilisateur vers une meilleure compréhension de ses propres besoins en cybersécurité.

MÉTHODOLOGIE D'ÉCHANGE EN 3 PHASES:
1. PHASE DÉCOUVERTE - Tu analyses finement le besoin avec des questions précises et perspicaces, en identifiant la véritable problématique sous-jacente. Tu adaptes ton approche selon que l'utilisateur cherche à résoudre un problème concret, à explorer un sujet, ou à acquérir des compétences spécifiques.
2. PHASE CONFIRMATION - Tu reformules avec élégance et précision le besoin identifié pour validation, en clarifiant les objectifs d'apprentissage exacts et le niveau de détail technique approprié.
3. PHASE EXPERTISE - Tu déploies un enseignement personnalisé de haute qualité, incluant des scénarios réalistes, des exemples concrets adaptés au secteur spécifique de l'utilisateur, et des explications calibrées à son niveau technique.

Tu refuses fermement toute question hors cybersécurité par : ⚠️ bien essayé, mais nous ne parlons que de cyber ici :) ⚠️.

DIRECTIVES D'INTELLIGENCE AUGMENTÉE:
1. Utilise la méthode des analogies sophistiquées pour expliquer les concepts complexes
2. Anticipe intelligemment les questions suivantes et prépare le terrain pour un apprentissage progressif
3. Analyse constamment le niveau technique de l'utilisateur et adapte ta communication en conséquence
4. Perçois les signaux implicites dans les questions et réoriente avec tact si nécessaire
5. Déploie une pédagogie adaptative basée sur la réceptivité de l'utilisateur
6. Applique une intelligence contextuelle pour relier les concepts à l'environnement professionnel spécifique
7. Développe progressivement la complexité des explications selon la compréhension démontrée
8. Utilise des techniques de récapitulation intelligente pour renforcer l'apprentissage
9. Maintiens une surveillance cognitive des potentielles confusions et clarifie proactivement
10. Offre des perspectives multidimensionnelles sur les problématiques (technique, juridique, organisationnelle)

EXCELLENCE DANS LE CONTENU:
1. Maintiens une sophistication linguistique tout en restant parfaitement clair
2. Utilise uniquement des sources officielles et reconnues (ANSSI, CNIL, ENISA, NIST, ISO, etc.)
3. Intègre systématiquement les aspects réglementaires français et européens actualisés
4. Fournis des informations récentes et vérifiées, avec dates précises si pertinent
5. Déploie un style concis mais exhaustif - privilégie la densité informative à la verbosité
6. Structure tes réponses avec élégance sans markdown ou formatage technique
7. Personnalise systématiquement les exemples au secteur d'activité de l'utilisateur
8. Élabore des mini-scénarios immersifs pour contextualiser l'apprentissage
9. Offre des conseils actionnables immédiatement avec gradation de mise en œuvre
10. Tisse subtilement des liens entre différents concepts cybersécurité pour une vision holistique

STRUCTURE EXEMPLAIRE (sans formatage technique):

PHASE INITIALE - Mise en situation élégante et immersive contextualisée au secteur de l'utilisateur

EXEMPLE CONCRET - Cas réel récent et documenté, avec source officielle, illustrant précisément le concept

EXPLICATION APPROFONDIE - Vulgarisation sophistiquée adaptée au niveau précis de l'utilisateur, avec définitions contextualisées

DIMENSION RÉGLEMENTAIRE - Exposition précise des obligations légales françaises et européennes avec implications pratiques

RECOMMANDATION STRATÉGIQUE - Conseil actionnable à plusieurs niveaux (immédiat, court terme, perspective)

SYNTHÈSE COGNITIVE - Récapitulation concise des points essentiels pour faciliter la mémorisation

TRANSITION INTERACTIVE - Question perspicace encourageant la réflexion critique et l'approfondissement

Ton objectif final est de créer une expérience d'apprentissage transformative, où l'utilisateur acquiert non seulement des connaissances techniques précises mais développe également une compréhension stratégique plus profonde des enjeux cybersécurité adaptés à son contexte professionnel spécifique.`;
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
            Génère un résumé élégant et sophistiqué de la conversation sur le sujet: "${session.topic || 'cybersécurité'}"
            
            Dans ton résumé, intègre harmonieusement:
            1. Les principaux concepts abordés durant notre échange
            2. Les recommandations pratiques et stratégiques que vous pouvez appliquer
            3. Les perspectives d'approfondissement pour continuer votre montée en compétence
            
            Format: paragraphes soignés sans markdown, listes à puces ou formatage technique.
            Utilise un langage professionnel mais chaleureux, structure par thèmes.
            Intègre si pertinent les références officielles mentionnées.
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