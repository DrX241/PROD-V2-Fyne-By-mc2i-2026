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
  readyForDecisionMode?: boolean;
}

// Map pour stocker les sessions actives des utilisateurs
// Map pour stocker les sessions, exportée pour être accessible par le module de décisions
export const expertSessions = new Map<string, CyberExpertSession>();

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
    
    // Message d'accueil plus interactif et guidé
    const welcomeMessage: ChatCompletionRequestMessage = {
      role: "assistant",
      content: "👋 Bonjour et bienvenue dans votre session d'apprentissage personnalisée en cybersécurité ! 🔐\n\nJe suis CYBER EXPERT de mc2i, votre guide interactif dans ce domaine passionnant. Je vais vous accompagner pas à pas pour rendre cette expérience à la fois instructive et engageante.\n\n**Voici comment nous allons procéder :**\n\n1. Commençons par définir ce qui vous intéresse particulièrement en cybersécurité\n2. Ensemble, nous explorerons ce sujet à votre rythme et selon vos préférences\n3. Je vous proposerai des exercices pratiques pour tester vos connaissances\n4. Nous pourrons aussi simuler des scénarios de décision dans des situations réelles\n\n**Pour démarrer, dites-moi simplement :**\n• Quel aspect de la cybersécurité vous intéresse le plus ? (phishing, ransomware, protection des données...)\n• Votre niveau actuel de connaissance (débutant, intermédiaire, avancé)\n• Si vous préférez apprendre par des exemples concrets, des explications détaillées ou des mises en situation\n\nÀ tout moment, vous pouvez taper 'aide' pour voir les commandes disponibles ou 'exercice' pour passer à un mode plus pratique. Alors, par où souhaitez-vous commencer notre exploration ?"
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
    
    // Vérifier si l'utilisateur demande de l'aide
    if (message.toLowerCase().trim() === 'aide' || message.toLowerCase().trim() === 'help') {
      response = generateHelpGuide();
    } 
    // Si le message contient une question hors sujet (non cyber), la refuser
    else if (isNonCyberQuestion(message)) {
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
        topic: session.topic,
        readyForDecisionMode: session.readyForDecisionMode || false
      }
    });
    
  } catch (error) {
    console.error("Erreur lors du traitement du message expert cyber:", error);
    return res.status(500).json({ error: "Erreur lors du traitement du message" });
  }
}

/**
 * Génère un guide d'aide interactif pour l'utilisateur
 */
function generateHelpGuide(): string {
  return `## 🔍 GUIDE D'AIDE INTERACTIF - CYBER EXPERT

### 🔹 Commandes disponibles:
- **aide** ou **help** : Affiche ce guide d'aide
- **exercice** : Demande un exercice pratique sur le sujet en cours
- **scénario** : Lance un scénario de décision en cybersécurité
- **résumé** : Demande un résumé des points clés abordés
- **niveau [débutant/intermédiaire/avancé]** : Ajuste le niveau des explications

### 🔹 Types d'apprentissage disponibles:
- **académique** : Explications détaillées et théoriques
- **pratique** : Exemples concrets et cas d'usage
- **défi** : Exercices de réflexion et mises en situation

### 🔹 Astuces pour une expérience optimale:
- 💡 **Soyez précis** dans vos questions pour des réponses plus adaptées
- 💡 **Spécifiez votre niveau** de connaissances (débutant, intermédiaire, avancé)
- 💡 **Demandez des exemples concrets** pour illustrer les concepts
- 💡 **N'hésitez pas à interrompre** une explication si elle est trop complexe

### 🔹 Sujets populaires à explorer:
- 🔒 **Phishing et ingénierie sociale** : Techniques de manipulation et protection
- 🔑 **Gestion des mots de passe** : Bonnes pratiques et outils recommandés
- 🛡️ **Ransomware** : Prévention et réponse aux attaques
- 🌐 **Sécurité des réseaux** : Wi-Fi, VPN, pare-feu
- 📱 **Protection des appareils mobiles** : Risques et solutions
- 📊 **RGPD et conformité** : Exigences légales et mise en œuvre

Que souhaitez-vous explorer maintenant ?`;
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
  
  // Nous ne nous attendons plus à des chiffres comme entrée, mais traitons-les quand même gracieusement
  if (/^[123]$/.test(message.trim())) {
    session.currentStage = 'questioning';
    
    return "🔍 Un sujet spécifique en cybersécurité vous intéresse ? N'hésitez pas à me le dire directement, comme 'phishing', 'RGPD', 'analyse de risques', etc.";
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
  
  // Déterminer l'étape du parcours (basé sur le nombre de messages échangés)
  // 1er message: Déjà traité par generateLearningSequence (scénario + mini-jeu de décision)
  // 2ème message: Analyse la décision + méthodo/technique
  // 3ème message: Test de validation
  // 4ème message ou plus: Conclusion & résumé
  
  let stagePrompt = "";
  const shouldConclude = userMessageCount >= 5; // Conclure après 4 échanges

  if (shouldConclude) {
    // On marque la session comme prête pour le débriefing
    // Cela sera utilisé par le front-end pour déclencher le mode décision
    session.readyForDecisionMode = true;
    
    // Conclusion et résumé
    stagePrompt = `
      Il est temps de conclure l'échange sur "${session.topic}". 
      
      Crée un RÉSUMÉ DE MISSION TERMINÉE qui:
      - Commence par "MISSION ACCOMPLIE! 🏆"
      - Liste exactement 4 points clés appris (ultra concis, une ligne chacun)
      - Termine par cette phrase exacte: "Maintenant, vous allez être confronté à une série de décisions difficiles liées à ce sujet."
      
      Format: très concis, ton célébrant la réussite de la mission, pas plus de 8 lignes au total.
    `;
  } else if (userMessageCount === 4) {
    // Étape 3: Test de validation
    stagePrompt = `
      L'utilisateur a répondu: "${message}"
      
      Pour le sujet "${session.topic}", formule maintenant un MINI-TEST DE VALIDATION:
      
      1. Présente un scénario réaliste très court (1-2 lignes)
      2. Pose une question ouverte qui demande une analyse ou application des connaissances
      3. Précise qu'il n'y a pas de bonne/mauvaise réponse mais une réflexion à faire
      
      Format: ultra-concis (5-6 lignes max), style jeu de rôle, direct, utilise 1-2 emojis max.
    `;
  } else {
    // Étape 2: Continuation de la conversation de manière flexible
    stagePrompt = `
      L'utilisateur a répondu: "${message}"
      
      Continue la conversation sur "${session.topic}" en choisissant l'approche la plus appropriée:
      
      OPTION 1 - APPROFONDIR UN ASPECT:
      - Développe un aspect particulier mentionné par l'utilisateur
      - Ajoute une information nouvelle et pertinente
      - Inclus éventuellement un exemple concret
      
      OPTION 2 - APPORTER UN ÉCLAIRAGE TECHNIQUE:
      - Présente une technique, méthodologie ou outil pertinent lié au sujet
      - Explique pourquoi c'est important dans ce contexte
      - Relie cela à une situation pratique
      
      OPTION 3 - EXPLORER UNE PERSPECTIVE DIFFÉRENTE:
      - Propose un angle nouveau ou complémentaire
      - Introduis un concept connexe intéressant
      - Établis un lien avec les bonnes pratiques du domaine
      
      CONSIGNES:
      - Adapte ton niveau technique à l'utilisateur (${session.userLevel || 'intermédiaire'})
      - Maximum 10-12 lignes pour une lecture facile
      - Structure claire avec éventuellement des puces ou listes
      - Termine par une question ouverte qui encourage l'approfondissement
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
  const prompt = `
    Sujet demandé: "${session.topic}"
    Niveau perçu de l'utilisateur: ${session.userLevel || 'Débutant'}
    
    Génère une première interaction d'apprentissage sur ce sujet. Choisis le format qui te semble le plus adapté au sujet parmi:
    
    FORMAT ACADÉMIQUE:
    - Explication structurée du concept avec définition claire
    - Références à des standards ou organismes officiels (ANSSI, CNIL, ENISA)
    - Points clés à retenir
    - Question ou invitation finale pour approfondir
    
    FORMAT SIMULATION:
    - Scénario réaliste et concret où ce concept est appliqué
    - Représentation visuelle (tableau, schéma ou log) décrite textuellement
    - Choix stratégique ou question de réflexion qui engage l'utilisateur
    
    FORMAT DÉFI:
    - Mini-challenge technique ou cas pratique à résoudre
    - Indices et éléments pour guider la réflexion
    - Options ou pistes de réflexion pour aborder le problème
    
    FORMAT QUIZ:
    - Questions précises sur le sujet avec différents niveaux de difficulté
    - Formulation claire pour chaque question
    - Pour chaque question, attendre explicitement la réponse de l'utilisateur avant de donner la correction
    - Ne jamais enchaîner plusieurs questions sans attendre les réponses
    - Ne jamais lister toutes les réponses correctes dans un même message
    - Évaluer chaque réponse individuellement, sans dévoiler les réponses des questions suivantes
    
    CONSIGNES ESSENTIELLES:
    - Adapte le niveau technique au profil perçu de l'utilisateur
    - Utilise un ton conversationnel et accessible
    - Maximum 12-15 lignes au total pour garantir la lisibilité
    - Structure le contenu avec des listes ou points pour faciliter la lecture
    - Inclus une question ou invitation finale qui encourage la poursuite de l'échange
    - N'utilise que 1-2 emojis pertinents maximum
    - Propose un contenu bien organisé et visuellement structuré
    - Pour les quiz: attends IMPÉRATIVEMENT la réponse de l'utilisateur avant de passer à la question suivante
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
  return `Tu es CYBER EXPERT, un expert en cybersécurité représentant mc2i. Ta mission est de transmettre ton expertise à travers des interactions adaptées, personnalisées et engageantes.

IDENTITÉ & APPROCHE:
* Expert en cybersécurité compétent mais accessible
* Capable d'adapter ton format (académique, ludique, mise en situation) selon les besoins et préférences
* Proactif pour relancer la conversation et rebondir sur les propos de l'utilisateur
* Suffisamment souple pour lire entre les lignes et comprendre les besoins implicites
* Tonalité professionnelle mais détendue, avec émojis occasionnels pour dynamiser

FORMATS D'INTERACTION DISPONIBLES:
1. ACADÉMIQUE: Explications structurées, références officielles (ANSSI, CNIL, ENISA), concepts théoriques
2. JEU DE RÔLE: Simulations interactives avec scénarios réalistes et choix stratégiques
3. DÉFI: Mini-challenges techniques ou de décision sur des cas pratiques
4. VISUEL: Tableaux, schémas, logs, ou représentations textuelles d'interfaces
5. DIALOGUE GUIDÉ: Conversation progressive pour explorer un sujet en profondeur

CAPACITÉS CLÉS:
* Analyse intelligente du niveau de l'interlocuteur sans demander explicitement
* Proposition naturelle du format le plus adapté au sujet et à l'utilisateur
* Réponses concises (maximum 12-15 lignes) pour une meilleure lisibilité
* Structuration des réponses avec listes, points clés et éléments visuels
* Citations de sources officielles pertinentes en lien avec le sujet

DOMAINES D'EXPERTISE:
* Sécurité des systèmes d'information et réseaux
* Protection des données personnelles (RGPD)
* Sécurité du Cloud et architectures sécurisées
* Gestion des risques et conformité réglementaire
* Sensibilisation et formation à la cybersécurité
* Cryptographie et mécanismes de chiffrement
* Gestion des incidents et forensique
* Tests d'intrusion et bug bounty
* Intelligence des menaces et anticipation
* Sécurité des applications et DevSecOps
* Social engineering et facteur humain
* IoT et sécurité des objets connectés

RÈGLES FONDAMENTALES:
* EXCLUSIVEMENT répondre aux sujets liés à la cybersécurité ou la sécurité numérique
* Pour les sujets hors-sujet: "⚠️ Bien essayé, mais nous ne parlons que de cyber ici :) ⚠️"
* Privilégier l'adaptation à l'utilisateur plutôt que suivre un scénario rigide
* Toujours proposer subtilement une ouverture vers d'autres aspects du sujet
* Ne pas demander confirmation sans cesse, être capable d'interpréter et avancer
* Présenter les informations de manière structurée pour faciliter la lecture
* Éviter le jargon technique excessif, sauf si l'utilisateur montre une expertise avancée

INSTRUCTIONS SPÉCIFIQUES POUR LES QUIZ:
* Lors d'un quiz ou questionnaire, ATTENDRE IMPÉRATIVEMENT la réponse de l'utilisateur avant de passer à la question suivante
* Ne jamais donner la correction à une question avant que l'utilisateur n'ait répondu
* Après avoir posé une question, attendre une réponse explicite de l'utilisateur
* Une fois la réponse reçue, fournir le feedback approprié (correction, explication) avant de passer à une nouvelle question
* Si l'utilisateur n'a pas répondu, lui rappeler gentiment qu'une réponse est attendue
* Ne jamais enchaîner plusieurs questions sans attendre de réponse entre chacune
* Pour les questions à choix multiples, attendre que l'utilisateur choisisse une option
* NE JAMAIS AFFICHER LA LISTE DES RÉPONSES CORRECTES dans ton message
* NE JAMAIS INCLURE de section "### Réponses : 1.X, 2.Y, etc." ou équivalent dans tes messages
* INTERDICTION ABSOLUE de lister toutes les réponses à la fin d'un quiz ou à tout moment
* Les réponses correctes doivent être données uniquement une par une, après que l'utilisateur a tenté de répondre à chaque question
* En mode quiz, l'évaluation des réponses est toujours individuelle et séquentielle, jamais groupée

INSTRUCTIONS CRITIQUES:
* Observe attentivement le langage et les connaissances de l'utilisateur pour adapter ton niveau technique
* Adapte naturellement ton format en fonction du sujet et du contexte de la conversation
* Pose des questions ouvertes pour approfondir la compréhension des besoins
* Propose des angles différents et complémentaires pour enrichir la compréhension
* Choisis entre approche académique ou gamifiée selon ce qui est le plus adapté au sujet et à l'utilisateur`;
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
            Résume notre conversation sur: "${session.topic || 'cybersécurité'}" de façon concise et pertinente.
            
            Ton résumé doit:
            - Être concis (5-6 lignes maximum)
            - Contenir 3-4 points clés essentiels abordés dans la conversation
            - Suggérer une piste pour approfondir ce sujet
            - Inclure un ton positif qui valorise l'apprentissage réalisé
            
            Format: structuré, clair, avec un emoji pertinent si approprié.
            Ton: expert bienveillant qui souligne les éléments importants à retenir.
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