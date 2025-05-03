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
    
    // Message d'accueil avec question spécifique conformément au prompt CyberSensei
    const welcomeMessage: ChatCompletionRequestMessage = {
      role: "assistant",
      content: "Bonjour ! Je suis CyberSensei, votre expert en cybersécurité. 🧭\n\nQue souhaitez-vous explorer aujourd'hui ?\n\n1. Résoudre un problème cyber que vous rencontrez ? \n   Ex : comment améliorer la gestion des accès dans mon entreprise ?\n\n2. Comprendre un concept en cybersécurité ? \n   Ex : qu'est-ce que l'authentification multifacteur (MFA) ?\n\n3. Découvrir un sujet cyber intéressant ? \n   Idéal si vous débutez et souhaitez explorer un domaine de la cybersécurité."
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
  
  // Si le message est court et contient simplement un chiffre (1, 2 ou 3) conformément au prompt CyberSensei
  if (/^[123]$/.test(message.trim())) {
    session.currentStage = 'questioning';
    
    if (message.trim() === "1") {
      return "🔧 Très bien, vous souhaitez résoudre un problème cyber.\n\nPouvez-vous me décrire ce problème précisément ? Je vais vous aider à trouver une solution adaptée.";
    } else if (message.trim() === "2") {
      return "📘 Parfait, vous souhaitez comprendre un concept en cybersécurité.\n\nQuel concept spécifique vous intéresse ? Je vais vous l'expliquer de manière claire et accessible.";
    } else if (message.trim() === "3") {
      session.currentStage = 'learning';
      session.needIdentified = true;
      session.needConfirmed = true;
      session.userLevel = "Débutant";
      session.topic = "cybersécurité";
      
      // Générer une séquence d'apprentissage pour découvrir un sujet cyber intéressant
      return await generateLearningSequence(session);
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
  // On compte les échanges pour déterminer quelle étape du parcours d'apprentissage nous sommes
  const userMessageCount = session.messages.filter(msg => msg.role === "user").length;
  
  // Déterminer si nous sommes dans un contexte d'explication de concept, de résolution de problème ou de découverte
  const isConceptExplanation = session.messages.some(msg => 
    msg.role === "user" && 
    (msg.content === "2" || 
     msg.content.toLowerCase().includes("concept") || 
     msg.content.toLowerCase().includes("comprendre") ||
     msg.content.toLowerCase().includes("apprendre"))
  );
  
  const isDiscoveryMode = session.messages.some(msg => 
    msg.role === "user" && 
    (msg.content === "3" || 
     msg.content.toLowerCase().includes("découvrir") || 
     msg.content.toLowerCase().includes("débutant") ||
     msg.content.toLowerCase().includes("intéressant") ||
     msg.content.toLowerCase().includes("aléatoire"))
  );
  
  // Déterminer l'étape en fonction du nombre de messages
  const shouldQuiz = userMessageCount >= 5 && userMessageCount < 7; // QCM après 5 échanges
  const shouldConclude = userMessageCount >= 7; // Conclure après 7 échanges
  const isNewSession = message.toLowerCase() === 'nouvelle session';

  // Si l'utilisateur demande une nouvelle session, on réinitialise
  if (isNewSession) {
    // On vide la session sauf l'ID utilisateur et les informations de niveau
    session.messages = [];
    session.needIdentified = false;
    session.needConfirmed = false;
    session.currentStage = 'initial';
    session.topic = undefined;
    
    return "Très bien, démarrons une nouvelle session ! Que souhaitez-vous explorer aujourd'hui ?\n\n1. Résoudre un problème cyber\n2. Comprendre un concept en cybersécurité\n3. Découvrir un sujet cyber intéressant";
  }

  // Déterminer le prompt en fonction de l'étape
  let stagePrompt = "";
  
  if (shouldConclude) {
    // 6. Conclusion finale
    stagePrompt = `
      Nous arrivons à la fin de notre échange sur "${session.topic}".
      
      Suivez exactement ce format pour conclure:
      
      1. RÉCAPITULATIF FINAL
      - Résumez en exactement 3 à 5 points ce qui a été abordé
      - Chaque point doit être très concis et instructif
      
      2. DERNIÈRES ACTIONS POSSIBLES
      - Formulez clairement les deux options suivantes:
        > "Avez-vous une dernière question avant de terminer notre session ?"
        > "Pour démarrer un tout nouveau sujet, tapez 'nouvelle session'"
      
      Format: présentez les points de façon structurée, utilisez des puces, soyez concis,
      intégrez 1-2 emojis pertinents, référencez des sources fiables si nécessaire.
      Ton: chaleureux et encourageant pour valoriser le parcours d'apprentissage effectué.
    `;
  } else if (shouldQuiz) {
    // 5. Quiz d'évaluation
    stagePrompt = `
      L'utilisateur a suffisamment progressé sur le sujet "${session.topic}" pour évaluer ses connaissances.
      
      Créez un QUIZ CYBERSÉCURITÉ qui suit exactement ce format:
      
      1. INTRODUCTION
      - Annoncez un mini-quiz de 5 questions pour tester les connaissances acquises sur ${session.topic}
      - Encouragez l'utilisateur à y participer de façon ludique
      
      2. QUIZ (5 QUESTIONS)
      - Rédigez exactement 5 questions à choix multiples, numérotées de 1 à 5
      - Chaque question doit avoir 3 ou 4 options de réponse (a, b, c, d)
      - Les questions doivent couvrir les principaux aspects discutés
      - Variez la difficulté: 2 faciles, 2 moyennes, 1 difficile
      
      3. INSTRUCTIONS
      - Demandez à l'utilisateur de répondre en donnant simplement les numéros et lettres (ex: "1a, 2c, 3b, 4d, 5a")
      
      Format: présentez clairement chaque question et ses options, utilisez une mise en forme soignée,
      gardez un ton ludique et encourageant. La présentation doit être impeccable.
    `;
  } else if (isDiscoveryMode) {
    // Réponse pour le mode découverte
    stagePrompt = `
      L'utilisateur a répondu: "${message}" après votre présentation sur "${session.topic}".
      
      Poursuivez la découverte en vous basant sur sa réponse:
      
      1. APPROFONDISSEMENT CIBLÉ
      - Répondez directement aux questions ou intérêts spécifiques mentionnés
      - Si aucun intérêt spécifique n'est mentionné, choisissez un aspect fascinant à approfondir
      - Mentionnez une tendance émergente ou une évolution future de ce domaine
      
      2. ACTEURS ET OUTILS IMPORTANTS
      - Présentez 1-2 acteurs clés de ce domaine (entreprises, chercheurs, organismes)
      - Mentionnez 1-2 outils ou technologies essentiels liés à ce sujet
      - Expliquez pourquoi ces acteurs/outils sont incontournables pour les débutants
      
      3. RESSOURCES D'APPRENTISSAGE
      - Suggérez une ressource officielle gratuite pour approfondir (guide ANSSI, MOOC, etc.)
      - Proposez un moyen simple pour pratiquer ou s'initier à ce domaine
      
      4. MISE EN PERSPECTIVE
      - Reliez ce sujet à un autre domaine de la cybersécurité
      - Posez une nouvelle question ouverte qui permet d'explorer une autre dimension du sujet
      
      Terminez par: "Qu'est-ce qui vous surprend le plus dans ce domaine ? Y a-t-il un autre aspect que vous aimeriez découvrir ?"
      
      Format: concis (max 15 lignes), ton enthousiaste et accessible pour débutant,
      structurez clairement chaque partie, utilisez 1-2 emojis pertinents.
    `;
  } else if (isConceptExplanation) {
    // Réponse pour un concept en cours d'explication
    stagePrompt = `
      L'utilisateur a répondu: "${message}" à propos du concept de "${session.topic}".
      
      Continuez l'explication du concept en vous basant sur sa réponse:
      
      1. APPROFONDISSEMENT
      - Validez d'abord sa compréhension et répondez à ses questions spécifiques
      - Ajoutez une dimension ou un angle qu'il n'a peut-être pas encore considéré
      - Mentionnez une tendance récente ou évolution pertinente liée à ce concept
      
      2. ASPECT PRATIQUE
      - Partagez un conseil pratique ou une bonne pratique directement applicable
      - Indiquez comment ce concept s'intègre dans un cadre plus large
      - Référencez une source officielle (ANSSI, CNIL, ENISA) pour approfondir
      
      3. NOUVELLE SITUATION
      - Proposez une nouvelle situation légèrement plus complexe pour tester sa compréhension
      - Formulez une question ouverte qui demande une application du concept
      
      Terminez par: "Est-ce clair ? Souhaitez-vous que je précise un point avant qu'on continue ?"
      
      Format: concis (max 15 lignes), adapté au niveau ${session.userLevel || "Débutant"},
      utilisez titres clairs, points clés bien structurés, 1-2 emojis maximum.
    `;
  } else {
    // Réponse pour un problème à résoudre
    stagePrompt = `
      L'utilisateur a répondu: "${message}" concernant le problème de "${session.topic}".
      
      Continuez la résolution du problème en vous basant sur sa réponse:
      
      1. ANALYSE DE SA RÉPONSE
      - Validez les éléments pertinents de sa proposition
      - Suggérez des améliorations ou alternatives si approprié
      - Identifiez les risques ou points d'attention qu'il pourrait avoir manqués
      
      2. COMPLÉMENT D'INFORMATION
      - Ajoutez une technique ou outil complémentaire très concret 
      - Expliquez comment cette technique s'intègre dans la méthodologie globale
      - Mentionnez si nécessaire un aspect réglementaire ou normatif important (RGPD, NIS2, etc.)
      
      3. NOUVELLE MISE EN SITUATION
      - Proposez un scénario de suivi qui permet d'approfondir un aspect du problème
      - Posez une question précise qui demande une réflexion ou décision
      
      Terminez par: "Souhaitez-vous que je clarifie un point avant qu'on poursuive ?"
      
      Format: concis (max 15 lignes), tone professionnel mais accessible,
      utilisez titres clairs, points clés bien structurés, 1-2 emojis maximum.
    `;
  }
  
  try {
    const messages: ChatCompletionRequestMessage[] = [
      { role: "system", content: getCyberExpertSystemPrompt() },
      ...session.messages.slice(0, -1), // Exclure le dernier message (la demande actuelle)
      { role: "user", content: stagePrompt }
    ];
    
    return await openAIService.getChatCompletion(messages, 0.7);
  } catch (error) {
    console.error("Erreur lors de la génération de la réponse d'apprentissage:", error);
    return "Je rencontre des difficultés à traiter votre réponse. Pourriez-vous reformuler ou me donner plus de détails?";
  }
}

/**
 * Génère une séquence d'apprentissage personnalisée basée sur le besoin confirmé
 */
async function generateLearningSequence(session: CyberExpertSession): Promise<string> {
  if (!session.topic) {
    return "Pour proposer un parcours adapté, j'ai besoin de connaître le sujet qui vous intéresse. Pourriez-vous me préciser quel aspect de la cybersécurité vous voulez explorer?";
  }
  
  // Déterminer si nous traitons un concept, un problème à résoudre ou une découverte
  const isConceptExplanation = session.messages.some(msg => 
    msg.role === "user" && 
    (msg.content === "2" || 
     msg.content.toLowerCase().includes("concept") || 
     msg.content.toLowerCase().includes("comprendre") ||
     msg.content.toLowerCase().includes("apprendre"))
  );
  
  const isDiscoveryMode = session.messages.some(msg => 
    msg.role === "user" && 
    (msg.content === "3" || 
     msg.content.toLowerCase().includes("découvrir") || 
     msg.content.toLowerCase().includes("débutant") ||
     msg.content.toLowerCase().includes("intéressant") ||
     msg.content.toLowerCase().includes("aléatoire"))
  );
  
  let prompt = "";
  
  if (isDiscoveryMode) {
    // Prompt pour découvrir un sujet cyber (option 3 du prompt CyberSensei)
    // Si un sujet précis est mentionné, on l'utilise, sinon on propose un sujet aléatoire
    const topicString = session.topic !== "cybersécurité" ? session.topic : "un sujet de cybersécurité intéressant pour débutant"; 
    
    prompt = `
      L'utilisateur souhaite découvrir "${topicString}".
      
      Suivez exactement cette structure pour créer une découverte captivante:
      
      1. Présentez brièvement ce sujet cyber:
         - Pourquoi ce sujet est important
         - Son évolution dans le temps
         - Son impact actuel sur la sécurité informatique
      
      2. Donnez 3 faits fascinants ou anecdotes historiques sur ce sujet:
         - Un fait marquant ou étonnant
         - Une statistique impressionnante
         - Une évolution récente importante
      
      3. Vulgarisez le concept pour un débutant:
         - Utilisez une analogie avec la vie quotidienne
         - Expliquez les principes de base sans jargon technique
         - Montrez pourquoi c'est pertinent même pour les non-experts
      
      4. Proposez un petit "test de connaissances":
         - Posez une question simple mais stimulante sur le sujet
         - Formulez-la comme une invitation à réfléchir, pas comme un examen
      
      Terminez par: "Qu'est-ce qui vous intéresse le plus dans ce sujet ? Souhaitez-vous explorer un aspect particulier ?"
      
      Format: respectez la structure en 4 points, utilisez des titres clairs, soyez concis (max 15 lignes),
      intégrez 1-2 emojis maximum, avec un ton enthousiaste et accessible.
    `;
  } else if (isConceptExplanation) {
    // Prompt pour expliquer un concept (option 2 du prompt CyberSensei)
    prompt = `
      L'utilisateur souhaite comprendre le concept de "${session.topic}".
      
      Suivez exactement cette structure pour expliquer ce concept:
      
      1. Reformulez et validez le concept à expliquer avec une brève introduction.
      
      2. Donnez 2 exemples concrets tirés de cas connus ou réalistes qui illustrent ce concept:
         - Un exemple récent ou marquant
         - Un exemple plus courant ou quotidien
      
      3. Fournissez:
         - Une définition officielle (citez une source reconnue comme ANSSI, CNIL ou ENISA)
         - Une explication simplifiée accessible à tous
         - Un exemple du quotidien qui rend le concept accessible
      
      4. Proposez une petite mise en situation appliquée pour tester la compréhension:
         - Contexte fictif mais réaliste
         - Question ouverte qui permet d'appliquer le concept
      
      Terminez par: "Est-ce clair ? Souhaitez-vous que je précise un point avant qu'on continue ?"
      
      Format: respectez la structure en 4 points, utilisez des titres clairs, soyez concis (max 15 lignes),
      intégrez 1-2 emojis maximum, adaptez au niveau ${session.userLevel || "Débutant"}.
    `;
  } else {
    // Prompt pour résoudre un problème (option 1 du prompt CyberSensei)
    prompt = `
      L'utilisateur souhaite résoudre un problème concernant "${session.topic}".
      
      Suivez exactement cette structure pour l'aider:
      
      1. Donnez 2 faits historiques ou cas d'école en lien avec ce sujet:
         - Ce qui s'est passé (incident/situation)
         - Durée approximative de résolution
         - Coût estimé (financier ou autre)
         - Impacts sur l'organisation
      
      2. Analysez le besoin avec:
         - Une méthodologie recommandée
         - Des outils pertinents
         - Des techniques essentielles
         - Une explication vulgarisée adaptée au niveau ${session.userLevel || "Débutant"}
      
      3. Créez une mini mise en situation:
         - Un contexte fictif mais crédible lié au problème
         - Des personnes fictives impliquées (rôles professionnels)
         - 2-3 données clés à prendre en compte
         - Une décision à prendre par l'utilisateur
      
      Terminez par: "Quelle décision prendriez-vous dans cette situation ?"
      
      Format: respectez la structure en points, utilisez des titres clairs, soyez concis (max 15 lignes),
      intégrez 1-2 emojis pertinents, référencez des sources fiables (ANSSI, CNIL, etc.).
    `;
  }
  
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
  return `Tu es "CyberSensei", un agent conversationnel expert en cybersécurité. Tu es conçu pour apprendre en échangeant avec les utilisateurs. Ton objectif est d'expliquer, illustrer, vulgariser et tester les concepts cyber à travers des discussions structurées, claires et engageantes.

Règles de fonctionnement :
- Tu ne réponds qu'à des sujets en lien avec la cybersécurité.
- Si une question sort du domaine cyber, tu réponds simplement : ⚠️ Bien essayé, mais nous ne parlons que de cyber ici :) ⚠️
- Tu utilises un ton clair, professionnel, pédagogue et bienveillant, toujours en français.
- Tu ne mentionnes jamais que tu es une IA.

Déroulé de l'échange :

🧭 1. Identification du besoin  
Commence toujours par cette question :
> "Souhaitez-vous :  
> 1. Résoudre un problème cyber que vous rencontrez ?  
> 2. Comprendre un concept en cybersécurité ?  
> 3. Découvrir un sujet cyber intéressant ?"

- Donne un exemple pour chaque option, généré dynamiquement :
  - Problème : Ex : comment améliorer la gestion des accès dans mon entreprise ?
  - Concept : Ex : qu'est-ce que l'authentification multifacteur (MFA) ?
  - Découverte : Ex : je débute en cybersécurité et je cherche des sujets passionnants

- Si le besoin est flou, pose 2 ou 3 questions ciblées, en expliquant pourquoi :
  - "Je vous pose ces questions pour mieux contextualiser votre demande et vous fournir une réponse précise."

🧠 2. Reformulation et confirmation  
Reformule le besoin exprimé et demande à l'utilisateur de confirmer :
> "Si je comprends bien, vous souhaitez [...]. Est-ce bien cela ?"

---

🔧 3A. Si l'utilisateur souhaite résoudre un problème :

- Donne 2 faits historiques ou cas d'école en lien avec le sujet :
  - Ce qui s'est passé
  - La durée de résolution
  - Le coût
  - Les impacts

- Ensuite, analyse le besoin de l'utilisateur :
  - Méthodologie à adopter
  - Outils possibles
  - Techniques à envisager
  - Vulgarise si nécessaire

- Vérifie la compréhension :
> "Souhaitez-vous que je clarifie un point avant qu'on poursuive ?"

- Puis crée une mini mise en situation :
  - Contexte fictif mais crédible
  - Personnes fictives impliquées
  - Données clés à prendre en compte

- Propose une décision à prendre à l'utilisateur et observe sa réponse.

---

📘 3B. Si l'utilisateur souhaite comprendre un concept :

- Reformule et valide le concept à expliquer.
- Explique avec :
  - 2 exemples concrets tirés de cas connus ou réalistes
  - Une définition officielle
  - Une explication simplifiée
  - Un exemple du quotidien qui rend le concept accessible

- Propose ensuite une petite mise en situation appliquée pour tester la compréhension.

---

🔁 4. À chaque étape :

- Termine chaque bloc par :
> "Est-ce clair ? Souhaitez-vous que je précise un point avant qu'on continue ?"

---

🧮 5. Quiz et évaluation:

- Propose un QCM de 5 questions rapides sur le sujet discuté
- Chaque question doit avoir 3 à 4 options de réponse
- Après les réponses de l'utilisateur, fournis un score et une brève explication
- Structure: "QUIZ CYBERSÉCURITÉ" suivi des questions numérotées et options lettrées

🧩 6. Conclusion :

- Résume en 3 à 5 points ce qui a été abordé
- Demande explicitement si l'utilisateur souhaite :
  - Poser une dernière question précise sur le sujet
  - Terminer complètement la session
  
> "Avez-vous une dernière question avant de terminer notre session ?"
> Si non, propose: "Tapez 'nouvelle session' pour démarrer un nouveau sujet"

FORMAT DES MESSAGES:
* Présentation soignée: titres en MAJUSCULES, points clés en puces
* Utilisation de symboles pour structurer (▶️, 🔒, ✅)
* Messages courts et concis (12-15 lignes max)
* Toujours inclure des éléments visuels (liste, tableau, comparaison)
* PAS de code markdown, utilise des symboles ASCII pour la mise en forme

RÈGLES IMPORTANTES:
* Toujours donner des références professionnelles (ANSSI, CNIL, ENISA)
* Valoriser la progression de l'apprenant
* Fournir des ressources officielles pour approfondir`;
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