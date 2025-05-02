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
  // Si le message est court et contient simplement un chiffre (1, 2 ou 3)
  if (/^[123]$/.test(message.trim())) {
    session.currentStage = 'questioning';
    
    if (message.trim() === "1") {
      return "Vous souhaitez résoudre un problème précis, une approche pragmatique que j'apprécie. Pour vous accompagner efficacement, j'aurais besoin de quelques précisions. Pourriez-vous me détailler la nature exacte du problème rencontré, son contexte d'apparition, et votre rôle dans l'organisation? Ces informations me permettront d'élaborer une réponse parfaitement adaptée à votre situation professionnelle.";
    } else if (message.trim() === "2") {
      return "Explorer une problématique métier révèle une vision stratégique de la cybersécurité. Pour personnaliser notre échange, pourriez-vous me préciser votre secteur d'activité et ses spécificités? J'aimerais également comprendre les enjeux cyber particuliers qui vous préoccupent dans ce contexte, ainsi que les objectifs que vous souhaitez atteindre à travers notre échange.";
    } else if (message.trim() === "3") {
      return "L'apprentissage par une approche différente démontre votre ouverture d'esprit. Pour calibrer parfaitement mon niveau d'expertise, pourriez-vous m'indiquer votre niveau actuel en cybersécurité (Débutant / Intermédiaire / Avancé)? Quel concept spécifique souhaitez-vous explorer, et avez-vous déjà tenté de l'appréhender par d'autres moyens? Votre expérience professionnelle pourrait également enrichir notre approche pédagogique.";
    }
  }
  
  // Si l'utilisateur a répondu avec du texte au lieu d'un chiffre
  const prompt = `
    L'utilisateur a répondu: "${message}"
    
    ANALYSE COGNITIVE:
    Analyse en profondeur sa réponse pour déterminer:
    1. La nature exacte de son besoin (résolution de problème, exploration conceptuelle, apprentissage)
    2. Son niveau probable en cybersécurité (indices linguistiques, terminologie utilisée, complexité des concepts)
    3. Son contexte professionnel et secteur d'activité si mentionné
    4. Les motivations implicites derrière sa demande (conformité, crise, montée en compétence, curiosité)
    
    INTELLIGENCE ADAPTATIVE:
    En fonction de ton analyse, formule une réponse qui:
    - Manifeste une compréhension sophistiquée de son besoin réel, même s'il est implicite
    - Pose 2-3 questions stratégiques pour préciser exactement ses attentes et son contexte
    - Démontre subtilement ton expertise en reformulant certains éléments avec une terminologie plus précise
    - Établit un rapport de confiance par une approche professionnelle et empathique
    
    Ta réponse doit être élégante, directe, et démontrer une intelligence supérieure dans la compréhension des besoins en cybersécurité.
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
    return "Je n'ai pas bien cerné avec précision la nature de votre besoin. Pour vous offrir une expertise parfaitement adaptée, pourriez-vous préciser si vous souhaitez plutôt:\n\n1️⃣ Résoudre un problème précis de cybersécurité\n2️⃣ Explorer une problématique cyber dans votre contexte professionnel\n3️⃣ Approfondir un concept cyber avec une approche pédagogique personnalisée";
  }
}

/**
 * Gère l'étape de questionnement pour préciser le besoin
 */
async function handleQuestioningStage(session: CyberExpertSession, message: string): Promise<string> {
  // Collecter plus d'informations pour identifier le besoin précis avec une analyse cognitive avancée
  const prompt = `
    L'utilisateur a écrit: "${message}"
    
    ANALYSE COGNITIVE APPROFONDIE:
    En utilisant une intelligence supérieure d'analyse du discours:
    1. Identifie avec précision le besoin fondamental exprimé et les besoins implicites sous-jacents
    2. Analyse les indicateurs linguistiques de niveau d'expertise (terminologie, complexité syntaxique, références techniques)
    3. Détecte les marqueurs sectoriels et contextuels pour identifier l'environnement professionnel
    4. Évalue les enjeux stratégiques, opérationnels et réglementaires implicites dans sa demande
    5. Identifie les préoccupations et motivations sous-jacentes (conformité, sécurité, optimisation, innovation)
    
    SYNTHÈSE INTELLIGENTE:
    À partir de cette analyse multi-dimensionnelle et en intégrant nos échanges précédents:
    - Détermine avec précision le besoin réel, au-delà de la demande exprimée
    - Calibre le niveau d'expertise à adopter (débutant/intermédiaire/avancé)
    - Identifie le cadre réglementaire pertinent à intégrer dans ta réponse
    - Prépare une reformulation sophistiquée qui montre une compréhension profonde
    
    FORMULATION ÉLÉGANTE:
    Compose une reformulation qui:
    - Débute par une phrase d'appréciation personnalisée (valorisant la pertinence de sa demande)
    - Enchaîne avec: "Si je synthétise avec précision votre besoin, vous cherchez à [besoin précis et reformulé avec expertise]."
    - Ajoute éventuellement une courte phrase qui enrichit sa perspective
    - Termine par: "Est-ce bien là l'essence de votre demande?" ou formulation équivalente
    
    Ta réponse doit démontrer une intelligence remarquable dans l'analyse et la reformulation, tout en restant concise et élégante.
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
  // Analyse cognitive profonde et réponse adaptée dans le contexte du sujet identifié
  const prompt = `
    L'utilisateur poursuit son exploration sur: "${session.topic}"
    Dans un contexte professionnel: ${session.userDomain || 'entreprise'}
    Avec un niveau d'expertise: ${session.userLevel || 'intermédiaire'}
    
    Son message actuel: "${message}"
    
    ANALYSE COGNITIVE MULTIDIMENSIONNELLE:
    1. Identifie précisément la question ou le point d'intérêt spécifique dans le message
    2. Analyse le niveau de compréhension démontré et ajuste ton niveau d'expertise en conséquence
    3. Détecte toute confusion conceptuelle potentielle à clarifier avec tact
    4. Identifie les concepts adjacents pertinents à introduire pour enrichir l'apprentissage
    5. Repère les implications pratiques, stratégiques et réglementaires de la question
    
    ARCHITECTURE DE RÉPONSE INTELLIGENTE:
    Élabore une réponse structurée qui intègre harmonieusement:
    
    MISE EN CONTEXTE STRATÉGIQUE - Une brève mise en perspective qui relie la question aux enjeux cyber actuels (2024-2025)
    
    CONNAISSANCE EXPERTE - Un développement substantiel qui apporte des connaissances précises, récentes (moins d'un an) et vérifiables, avec références spécifiques aux publications des autorités reconnues (ANSSI, CNIL, ENISA) quand pertinent
    
    ÉCLAIRAGE RÉGLEMENTAIRE - Une explication claire des aspects légaux et normatifs français et européens applicables (RGPD, NIS2, LPM, certifications pertinentes)
    
    ILLUSTRATION CONCRÈTE - Un exemple ou cas d'étude réel et documenté, idéalement adapté au secteur d'activité de l'utilisateur (${session.userDomain || 'entreprise'})
    
    ANALOGIE PÉDAGOGIQUE - Une métaphore ou analogie sophistiquée qui simplifie un concept complexe sans le dénaturer
    
    CONSEIL ACTIONNABLE - Des recommandations stratégiques et opérationnelles immédiatement applicables, avec gradation (court, moyen, long terme)
    
    OUVERTURE COGNITIVE - Une question finale perspicace qui encourage l'approfondissement ou l'exploration d'un aspect complémentaire important
    
    EXIGENCES STYLISTIQUES:
    - Format élégant avec paragraphes structurés (aucun markdown ou formatage technique)
    - Langage professionnel de haut niveau adapté dynamiquement au niveau perçu de l'utilisateur
    - Ton à la fois expert, pédagogue et engageant qui crée une relation de confiance
    - Valorisation subtile des bonnes intuitions de l'utilisateur quand pertinent
    - Correction tactile et constructive des potentielles confusions
    - Transitions fluides entre les concepts pour une lecture organique
    - Concision maîtrisée: dense en information mais accessible
    
    Ta réponse doit démontrer une intelligence supérieure dans l'analyse de la question et la structuration d'une réponse qui combine expertise technique, profondeur pédagogique et élégance communicationnelle.
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
    
    MISSION: Créer une expérience d'apprentissage transformative de niveau expert sur ce sujet cybersécurité.
    
    INTELLIGENCE PÉDAGOGIQUE SUPÉRIEURE:
    1. Analyse profondément le besoin confirmé pour en extraire les dimensions explicites et implicites
    2. Identifie le cadre conceptuel optimal pour présenter ce sujet (historique, technique, stratégique, réglementaire)
    3. Détermine les connaissances préalables nécessaires et les points potentiels de confusion
    4. Cartographie les connexions avec d'autres domaines de la cybersécurité pertinents
    5. Intègre les développements les plus récents (2024-2025) dans ce domaine spécifique
    
    ARCHITECTURE COGNITIVE SOPHISTIQUÉE:
    Développe une réponse expertement structurée qui intègre:
    
    INTRODUCTION IMMERSIVE - Mise en situation narrative d'une problématique cyber française réelle (entreprise, organisation publique) qui contextualise parfaitement le sujet dans un cadre professionnel authentique
    
    CADRE CONCEPTUEL - Définition précise et nuancée des termes clés, avec une perspective historique brève si pertinente, et positionnement du sujet dans l'écosystème cyber contemporain
    
    DIMENSIONS TECHNIQUES - Exploration sophistiquée des aspects techniques avec une profondeur calibrée au niveau ${session.userLevel || 'intermédiaire'} de l'utilisateur, illustrée par des exemples concrets
    
    PARADIGME RÉGLEMENTAIRE - Analyse approfondie du cadre législatif et normatif français et européen (RGPD, NIS2, LPM, DORA, Cyber Resilience Act) avec précision des obligations spécifiques et dates d'application
    
    CAS D'ÉTUDE DOCUMENTÉ - Exemple réel et détaillé d'incident ou d'implémentation pertinent, idéalement de 2024, avec référence précise et vérifiable à des sources officielles (ANSSI, CNIL, CERT-FR)
    
    MÉTAPHORE CONCEPTUELLE - Analogie sophistiquée qui rend accessible un concept complexe sans le simplifier excessivement, adaptée au contexte professionnel de l'utilisateur
    
    STRATÉGIE D'IMPLÉMENTATION - Recommandations actionnables à trois niveaux: tactique (immédiat), opérationnel (3-6 mois) et stratégique (long terme), avec considérations budgétaires et organisationnelles
    
    PERSPECTIVES CRITIQUES - Analyse des limitations, controverses ou défis émergents liés au sujet, démontrant une pensée nuancée et prospective
    
    OUVERTURE COGNITIVE - Question finale soigneusement formulée qui oriente vers un approfondissement spécifique et stimule la réflexion critique
    
    EXIGENCES RHÉTORIQUES ET STYLISTIQUES:
    - Structure organique avec transitions élégantes entre les concepts, sans aucun formatage technique
    - Langage sophistiqué mais accessible, adapté dynamiquement à l'interlocuteur sans condescendance
    - Ton à la fois expert, pédagogue et conversationnel, établissant une relation intellectuelle de confiance
    - Précision lexicale et terminologique irréprochable, avec définitions contextualisées des termes spécialisés
    - Densité informative optimale: substantiel mais digestible intellectuellement
    - Références précises aux autorités et organisations pertinentes (ANSSI, CNIL, ENISA, etc.)
    - Présentation équilibrée entre théorie et applications pratiques
    
    Ta réponse doit incarner le summum de l'expertise cybersécurité, combinant profondeur intellectuelle, précision technique, perspective stratégique et clarté pédagogique, le tout dans un format conversationnel élégant qui valorise l'intelligence de l'utilisateur.
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