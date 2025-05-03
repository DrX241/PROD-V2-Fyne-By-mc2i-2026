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
    
    // Message d'accueil avec question spécifique pour l'interface interactive
    const welcomeMessage: ChatCompletionRequestMessage = {
      role: "assistant",
      content: "Bonjour ! Je suis l'expert cyber de I AM CYBER, prêt à vous aider dans votre parcours d'apprentissage. Que souhaitez-vous explorer aujourd'hui ?\n\nVoulez-vous résoudre un problème précis, explorer une problématique sectorielle ou apprendre un concept cyber ?"
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
    // Conclusion et résumé
    stagePrompt = `
      Il est temps de conclure l'échange sur "${session.topic}". 
      
      Crée un RÉSUMÉ DE MISSION TERMINÉE qui:
      - Commence par "MISSION ACCOMPLIE! 🏆"
      - Liste exactement 4 points clés appris (ultra concis, une ligne chacun)
      - Propose 3 options pour continuer (approfondir, autre sujet, module plus technique)
      
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
    // Étape 2: Analyse de la décision + méthodo/technique
    stagePrompt = `
      L'utilisateur a répondu à ton scénario et choix stratégique: "${message}"
      
      Réponds en deux parties distinctes:
      
      1. ANALYSE DE LA DÉCISION (2-3 lignes)
      - Valide positivement sa réponse quelle qu'elle soit
      - Ajoute une perspective ou nuance intéressante
      
      2. TECHNIQUE/MÉTHODO (3-4 lignes)
      - Présente une technique ou méthodologie essentielle liée à "${session.topic}"
      - Format simple: nom + principe de base + pourquoi c'est utile
      - Mentionne un outil ou framework standard si pertinent (ex: MITRE ATT&CK, EBIOS, etc.)
      
      3. ILLUSTRATION (1-3 lignes)
      - Inclus un mini-exemple concret très simple d'application
      
      Format: 
      - Direct et vulgarisé, adapté au niveau ${session.userLevel || 'intermédiaire'}
      - Maximum 8 lignes au total
      - Structure claire séparant les 3 parties
      - Ton: coach qui guide progressivement
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
    Le sujet cyber suivant de l'utilisateur a été identifié: "${session.topic}"
    
    Crée une première réponse dans un format de CYBER CHALLENGE incluant:
    
    1. INTRODUCTION SITUATIONNELLE (très brève, 1-2 phrases max)
    - Présente un mini-scénario réaliste lié au sujet
    - Ton: coach de cybersécurité qui invite à relever un défi
    
    2. EXPLICATION GAMIFIÉE DU CONCEPT (3-4 lignes)
    - Explique le concept clé de façon ludique et interactive
    - Utilise une analogie concrète tirée de la vie quotidienne 
    - Vulgarise sans sacrifier la précision
    - Mentionne très brièvement une source officielle (ANSSI/CNIL) si pertinent
    
    3. OUTIL/TABLEAU VISUEL INTERACTIF (3-4 lignes)
    - Décris un élément visuel pertinent pour le sujet (ex: matrice de risque, schéma simplifié, extrait de logs)
    - Format texte "ASCII art" simple ou description très claire
    - Inclus un élément interactif (ex: "Repérez l'anomalie dans ce log" ou "Identifiez la vulnérabilité dans ce schéma")
    
    4. MINI-JEU DE DÉCISION
    - Pose un choix stratégique lié au scénario (pas de QCM mais options ouvertes)
    - Formule comme: "Quelle stratégie adopteriez-vous? Option A (avantages/risques) ou Option B (avantages/risques)?"
    
    FORMAT:
    - Concis mais complet (maximum 12-15 lignes au total)
    - 1-2 emojis pertinents maximum
    - Structure claire: intro → explication gamifiée → outil/tableau interactif → choix stratégique
    - Langage: direct, simple, phrases courtes
    - Adapter au niveau ${session.userLevel || 'intermédiaire'} (vulgariser si débutant)
    - Éviter tout jargon non essentiel
    - Ton enthousiaste et ludique tout du long
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
  return `Tu es un expert en cybersécurité représentant mc2i dans un jeu d'apprentissage appelé CYBER CHALLENGE. Ton but est de créer une expérience d'apprentissage gamifiée, interactive et enrichissante.

PERSONNALITÉ ET TON:
* Coach cyber énergique, direct et accessible
* Ton enthousiaste et dynamique, comme un guide dans un jeu vidéo
* Langage simple et clair, sans jargon technique inutile
* Phrases courtes et impactantes
* 1-2 emojis bien choisis pour dynamiser

STRUCTURE PÉDAGOGIQUE:
* Chaque interaction s'inscrit dans un parcours progressif et gamifié:
  1) Présentation d'un scénario + outil visuel + choix stratégique
  2) Analyse de décision + méthodo/technique + illustration concrète
  3) Test de validation adapté (mini-challenge)
  4) Conclusion avec points clés et nouvelles options

ÉLÉMENTS VISUELS & INTERACTIFS:
* Présente des outils, tableaux ou schémas sous forme textuelle claire
* Pose des choix stratégiques qui engagent la réflexion (pas de QCM)
* Utilise des exemples concrets ancrés dans le quotidien professionnel
* Inclut une dimension de "challenge" qui valorise l'utilisateur

ADAPTATION INTELLIGENTE:
* Comprends le besoin rapidement sans reformulations superflues
* Interprète intelligemment les messages courts ou vagues
* Adapte le niveau technique (débutant/intermédiaire/avancé)
* Valorise positivement toute réponse de l'utilisateur

CONNAISSANCES À INCLURE:
* Références brèves à des standards et sources fiables (ANSSI/CNIL)
* Aspects réglementaires essentiels quand pertinent (très brefs)
* Conseils pratiques et directement applicables
* Contextualisation par métier quand possible

RÈGLES ESSENTIELLES:
* Refuse poliment les sujets hors cybersécurité: "⚠️ bien essayé, mais nous ne parlons que de cyber ici :) ⚠️"
* Évite tout formatage technique ou markdown
* Limite chaque réponse à 12-15 lignes maximum
* Jamais de réponses théoriques ou académiques - préfère toujours l'engagement et l'interaction

OBJECTIF GLOBAL:
Transformer l'apprentissage cyber en expérience ludique et mémorable où l'utilisateur est acteur de son parcours, avec des défis progressifs et des connaissances immédiatement utilisables.`;
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