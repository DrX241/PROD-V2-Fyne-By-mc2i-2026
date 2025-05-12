import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { ChatCompletionRequestMessage } from "@shared/schema";
import { openAIService } from "./services/openai";

interface LearningBotSession {
  prenom: string | null;
  domaineExpertise: string | null;
  sousTheme: string | null;
  stageActuel: 'introduction' | 'choix_domaine' | 'choix_sous_theme' | 'scenario' | null;
  scenarioActuel: number;
  reponses: Array<{question: string, reponse: string}>;
  messages: Array<ChatCompletionRequestMessage>;
}

// Map pour stocker les sessions par ID utilisateur
const userSessions = new Map<string, LearningBotSession>();

/**
 * Initialise une session de chatbot mc2i AI Learning
 */
export async function initMcaiLearningSession(req: Request, res: Response) {
  try {
    const { userId } = req.body;
    
    // Vérifier si l'utilisateur a déjà une session
    if (userSessions.has(userId)) {
      return res.json({
        success: true,
        message: userSessions.get(userId)?.messages[0]?.content || "Session déjà initialisée."
      });
    }
    
    // Créer une nouvelle session
    const session: LearningBotSession = {
      prenom: null,
      domaineExpertise: null,
      sousTheme: null,
      stageActuel: 'introduction',
      scenarioActuel: 0,
      reponses: [],
      messages: []
    };
    
    // Créer le message d'accueil avec le prompt système
    const welcomeMessage: ChatCompletionRequestMessage = {
      role: "assistant",
      content: "Bonjour et bienvenue chez mc2i AI Learning, votre plateforme d'apprentissage professionnel personnalisé. Je suis ici pour vous aider à développer vos compétences à travers des scénarios immersifs adaptés à votre profil.\n\nPour commencer, pourriez-vous me communiquer :\n\n1. Votre trigramme (3 lettres)\n2. Votre niveau chez mc2i (Consultant, Consultant Confirmé, Consultant Senior, Chef de Projet, Manager, Senior Manager ou Directeur)\n\nCes informations me permettront de vous proposer une expérience sur mesure."
    };
    
    // Ajouter le message de bienvenue à la session
    session.messages.push({
      role: "system",
      content: getMcaiLearningSystemPrompt()
    });
    session.messages.push(welcomeMessage);
    
    // Enregistrer la session
    userSessions.set(userId, session);
    
    // Renvoyer le message de bienvenue
    return res.json({
      success: true,
      message: welcomeMessage.content
    });
  } catch (error) {
    console.error("Erreur lors de l'initialisation de la session mc2i AI Learning:", error);
    return res.status(500).json({
      success: false,
      error: "Une erreur s'est produite lors de l'initialisation de la session."
    });
  }
}

/**
 * Traite un message envoyé au chatbot mc2i AI Learning
 */
export async function processMcaiLearningMessage(req: Request, res: Response) {
  try {
    const { userId, message } = req.body;
    
    // Vérifier que l'utilisateur a une session
    if (!userSessions.has(userId)) {
      return res.status(404).json({
        success: false,
        error: "Session non trouvée. Veuillez initialiser une session d'abord."
      });
    }
    
    // Récupérer la session
    const session = userSessions.get(userId)!;
    
    // Ajouter le message de l'utilisateur à l'historique
    session.messages.push({
      role: "user",
      content: message
    });
    
    // Traiter le message selon l'étape actuelle
    const responseContent = await processMessageBasedOnStage(session, message);
    
    // Ajouter la réponse du chatbot à l'historique
    session.messages.push({
      role: "assistant",
      content: responseContent
    });
    
    // Mettre à jour la session
    userSessions.set(userId, session);
    
    // Renvoyer la réponse
    return res.json({
      success: true,
      message: responseContent,
      status: getSessionStatus(session)
    });
  } catch (error) {
    console.error("Erreur lors du traitement du message mc2i AI Learning:", error);
    return res.status(500).json({
      success: false,
      error: "Une erreur s'est produite lors du traitement du message."
    });
  }
}

/**
 * Traite le message en fonction de l'étape actuelle de la session
 */
async function processMessageBasedOnStage(session: LearningBotSession, message: string): Promise<string> {
  // Si nous sommes à l'étape d'introduction, vérifier si nous avons le prénom et le niveau
  if (session.stageActuel === 'introduction') {
    // Vérifier si le message contient un trigramme valide (3 lettres majuscules)
    const trigrammeMatch = message.match(/[A-Z]{3}/);
    if (trigrammeMatch && !session.prenom) {
      session.prenom = trigrammeMatch[0];
    }
    
    // Vérifier si le message contient un niveau valide
    const niveauPatterns = [
      'Consultant', 'Consultant Confirmé', 'Consultant Senior', 
      'Chef de Projet', 'Manager', 'Senior Manager', 'Directeur'
    ];
    
    for (const niveau of niveauPatterns) {
      if (message.toLowerCase().includes(niveau.toLowerCase())) {
        session.stageActuel = 'choix_domaine';
        
        // Construire le prompt pour la réponse
        const prompt = `L'utilisateur a fourni son trigramme ${session.prenom} et son niveau chez mc2i: ${niveau}. Propose-lui maintenant de choisir entre deux options de parcours d'apprentissage: Apprentissage Classique (4 scénarios indépendants) ou Immersion Totale (6 scénarios liés avec conséquences sur les choix). Présente ces options de manière engageante et professionnelle.`;
        
        // Ajouter aux messages pour le modèle
        const messages = [
          { role: "system", content: getMcaiLearningSystemPrompt() },
          { role: "user", content: prompt }
        ];
        
        const generatedResponse = await openAIService.getChatCompletionWithCache({
          messages: messages as ChatCompletionRequestMessage[],
          temperature: 0.7,
          maxTokens: 1500
        });
        
        return generatedResponse;
      }
    }
    
    // Si nous n'avons pas encore les informations nécessaires, demander de les fournir
    const prompt = `L'utilisateur a envoyé ce message: "${message}". Il n'a pas encore fourni toutes les informations nécessaires (trigramme et niveau chez mc2i). Demande-lui poliment de fournir ces informations en expliquant pourquoi c'est important pour personnaliser son expérience d'apprentissage.`;
    
    const messages = [
      { role: "system", content: getMcaiLearningSystemPrompt() },
      { role: "user", content: prompt }
    ];
    
    const generatedResponse = await openAIService.getChatCompletionWithCache({
      messages: messages as ChatCompletionRequestMessage[],
      temperature: 0.7,
      maxTokens: 1500
    });
    
    return generatedResponse;
  } 
  // Si nous sommes à l'étape de choix du domaine d'expertise
  else if (session.stageActuel === 'choix_domaine') {
    // Vérifier si l'utilisateur a choisi un parcours d'apprentissage
    if (message.toLowerCase().includes('classique') || message.toLowerCase().includes('indépendant')) {
      // L'utilisateur a choisi le parcours classique (4 scénarios indépendants)
      session.stageActuel = 'choix_sous_theme';
      
      // Construire le prompt pour la réponse
      const prompt = `L'utilisateur a choisi le parcours d'Apprentissage Classique (4 scénarios indépendants). Propose-lui maintenant de choisir un domaine d'expertise parmi les options suivantes: AMOA, Agilité, Data & IA, Cybersécurité, Management, Communication, Secteur Public. Présente ces options de manière professionnelle avec une brève description pour chacune.`;
      
      const messages = [
        { role: "system", content: getMcaiLearningSystemPrompt() },
        { role: "user", content: prompt }
      ];
      
      const generatedResponse = await openAIService.getChatCompletionWithCache({
        messages: messages as ChatCompletionRequestMessage[],
        temperature: 0.7,
        maxTokens: 1500
      });
      
      return generatedResponse;
    } 
    else if (message.toLowerCase().includes('immersion') || message.toLowerCase().includes('totale') || message.toLowerCase().includes('liés')) {
      // L'utilisateur a choisi le parcours d'immersion totale (6 scénarios liés)
      session.stageActuel = 'choix_sous_theme';
      
      // Construire le prompt pour la réponse
      const prompt = `L'utilisateur a choisi le parcours d'Immersion Totale (6 scénarios liés avec conséquences sur les choix). Propose-lui maintenant de choisir un domaine d'expertise parmi les options suivantes: AMOA, Agilité, Data & IA, Cybersécurité, Management, Communication, Secteur Public. Présente ces options de manière professionnelle avec une brève description pour chacune, en précisant que son choix déterminera l'environnement immersif dans lequel il évoluera.`;
      
      const messages = [
        { role: "system", content: getMcaiLearningSystemPrompt() },
        { role: "user", content: prompt }
      ];
      
      const generatedResponse = await openAIService.getChatCompletionWithCache({
        messages: messages as ChatCompletionRequestMessage[],
        temperature: 0.7,
        maxTokens: 1500
      });
      
      return generatedResponse;
    } 
    else {
      // L'utilisateur n'a pas clairement choisi un parcours, demander de clarifier
      const prompt = `L'utilisateur a envoyé ce message: "${message}", mais il n'a pas clairement choisi entre les deux parcours proposés. Demande-lui de préciser s'il souhaite suivre l'Apprentissage Classique (4 scénarios indépendants) ou l'Immersion Totale (6 scénarios liés avec conséquences sur les choix).`;
      
      const messages = [
        { role: "system", content: getMcaiLearningSystemPrompt() },
        { role: "user", content: prompt }
      ];
      
      const generatedResponse = await openAIService.getChatCompletionWithCache({
        messages: messages as ChatCompletionRequestMessage[],
        temperature: 0.7,
        maxTokens: 1500
      });
      
      return generatedResponse;
    }
  } 
  // Si nous sommes à l'étape de choix du sous-thème
  else if (session.stageActuel === 'choix_sous_theme') {
    // Vérifier si l'utilisateur a choisi un domaine d'expertise
    const domainesExpertise = ['AMOA', 'Agilité', 'Data & IA', 'Cybersécurité', 'Management', 'Communication', 'Secteur Public'];
    
    for (const domaine of domainesExpertise) {
      if (message.toLowerCase().includes(domaine.toLowerCase())) {
        session.domaineExpertise = domaine;
        
        // Proposer les sous-thèmes pour ce domaine
        const sousThemes = getSousThemesPourDomaine(domaine);
        session.stageActuel = 'scenario';
        
        // Construire le prompt pour la réponse
        const prompt = `L'utilisateur a choisi le domaine d'expertise: ${domaine}. Voici les sous-thèmes disponibles pour ce domaine: ${sousThemes.join(', ')}. Demande-lui de choisir un sous-thème spécifique pour sa formation, en précisant que cela déterminera le contenu des scénarios d'apprentissage.`;
        
        const messages = [
          { role: "system", content: getMcaiLearningSystemPrompt() },
          { role: "user", content: prompt }
        ];
        
        const generatedResponse = await openAIService.getChatCompletionWithCache({
          messages: messages as ChatCompletionRequestMessage[],
          temperature: 0.7,
          maxTokens: 1500
        });
        
        return generatedResponse;
      }
    }
    
    // Si aucun domaine n'a été choisi, demander de clarifier
    const prompt = `L'utilisateur a envoyé ce message: "${message}", mais il n'a pas clairement choisi un domaine d'expertise parmi les options proposées. Rappelle-lui les domaines disponibles (AMOA, Agilité, Data & IA, Cybersécurité, Management, Communication, Secteur Public) et demande-lui de faire un choix clair.`;
    
    const messages = [
      { role: "system", content: getMcaiLearningSystemPrompt() },
      { role: "user", content: prompt }
    ];
    
    const generatedResponse = await openAIService.getChatCompletionWithCache({
      messages: messages as ChatCompletionRequestMessage[],
      temperature: 0.7,
      maxTokens: 1500
    });
    
    return generatedResponse;
  } 
  // Si nous sommes à l'étape des scénarios
  else if (session.stageActuel === 'scenario') {
    // Si aucun sous-thème n'est encore sélectionné
    if (!session.sousTheme) {
      // Vérifier si l'utilisateur a choisi un sous-thème
      const sousThemesPossibles = getSousThemesPourDomaine(session.domaineExpertise || '');
      
      for (const sousTheme of sousThemesPossibles) {
        if (message.toLowerCase().includes(sousTheme.toLowerCase())) {
          session.sousTheme = sousTheme;
          session.scenarioActuel = 1;
          
          // Démarrer le premier scénario
          return await demarrerScenarioImmersif(session);
        }
      }
      
      // Si aucun sous-thème n'a été choisi, demander de clarifier
      const prompt = `L'utilisateur a envoyé ce message: "${message}", mais il n'a pas clairement choisi un sous-thème parmi les options proposées pour le domaine ${session.domaineExpertise}. Rappelle-lui les sous-thèmes disponibles (${sousThemesPossibles.join(', ')}) et demande-lui de faire un choix clair.`;
      
      const messages = [
        { role: "system", content: getMcaiLearningSystemPrompt() },
        { role: "user", content: prompt }
      ];
      
      const generatedResponse = await openAIService.getChatCompletionWithCache({
        messages: messages as ChatCompletionRequestMessage[],
        temperature: 0.7,
        maxTokens: 1500
      });
      
      return generatedResponse;
    } 
    else {
      // Nous avons déjà un sous-thème et nous sommes dans un scénario
      // Enregistrer la réponse au scénario actuel
      session.reponses.push({
        question: session.messages[session.messages.length - 2].content || "",
        reponse: message
      });
      
      // Si nous avons moins de 3 scénarios, passer au suivant
      if (session.scenarioActuel < 3) {
        session.scenarioActuel += 1;
        return await genererScenarioSuivant(session, message);
      } 
      else {
        // Nous avons terminé les 3 scénarios, générer un feedback global
        return await genererFeedbackGlobal(session);
      }
    }
  } 
  else {
    // Dans le cas où nous ne sommes dans aucune étape spécifique (cas improbable)
    return await generateGenericResponse(session, message);
  }
}

/**
 * Récupère le statut actuel de la session
 */
function getSessionStatus(session: LearningBotSession) {
  return {
    prenom: session.prenom,
    stage: session.stageActuel,
    domaineExpertise: session.domaineExpertise,
    sousTheme: session.sousTheme,
    scenarioActuel: session.scenarioActuel,
    nombreReponses: session.reponses.length
  };
}

/**
 * Génère les sous-thèmes en fonction du domaine d'expertise sélectionné
 */
function getSousThemesPourDomaine(domaine: string): string[] {
  switch (domaine) {
    case 'AMOA':
      return ['Recueil des besoins', 'Spécifications fonctionnelles', 'Tests et recette', 'Conduite du changement'];
    case 'Agilité':
      return ['Scrum', 'Kanban', 'SAFe', 'Product Owner'];
    case 'Data & IA':
      return ['Machine Learning', 'Power BI', 'Datawarehouse', 'Data Governance'];
    case 'Cybersécurité':
      return ['Gestion des risques', 'Conformité RGPD', 'Sécurité des applications', 'Gestion de crise'];
    case 'Management':
      return ['Leadership', 'Gestion d\'équipe', 'Évaluation de performance', 'Gestion de conflit'];
    case 'Communication':
      return ['Présentation cliente', 'Prise de parole en public', 'Négociation', 'Communication de crise'];
    case 'Secteur Public':
      return ['Marchés publics', 'Transformation numérique', 'Services publics', 'Open data'];
    default:
      return ['Général', 'Spécialisé', 'Avancé', 'Expert'];
  }
}

/**
 * Renvoie un secteur client approprié selon le domaine d'expertise
 */
function getClientSector(domaine: string): string {
  switch (domaine) {
    case 'AMOA':
      return 'grande distribution';
    case 'Agilité':
      return 'startup technologique';
    case 'Data & IA':
      return 'banque d\'investissement';
    case 'Cybersécurité':
      return 'institution financière';
    case 'Management':
      return 'cabinet de conseil';
    case 'Communication':
      return 'groupe média';
    case 'Secteur Public':
      return 'ministère';
    default:
      return 'entreprise';
  }
}

/**
 * Renvoie un rôle adapté au domaine et sous-thème
 */
function getRolePourDomaine(domaine: string, sousTheme: string): string {
  switch (domaine) {
    case 'AMOA':
      return 'chef de projet AMOA';
    case 'Agilité':
      return 'coach agile';
    case 'Data & IA':
      return 'data scientist';
    case 'Cybersécurité':
      return 'responsable sécurité';
    case 'Management':
      return 'manager d\'équipe';
    case 'Communication':
      return 'responsable communication';
    case 'Secteur Public':
      return 'chef de projet transformation numérique';
    default:
      return 'consultant';
  }
}

/**
 * Renvoie un objectif adapté au domaine et sous-thème
 */
function getObjectifPourDomaine(domaine: string, sousTheme: string): string {
  switch (domaine) {
    case 'AMOA':
      return 'optimiser le processus de recueil des besoins';
    case 'Agilité':
      return 'améliorer la vélocité des équipes';
    case 'Data & IA':
      return 'développer un modèle prédictif';
    case 'Cybersécurité':
      return 'renforcer la sécurité du système d\'information';
    case 'Management':
      return 'améliorer la performance de l\'équipe';
    case 'Communication':
      return 'élaborer une stratégie de communication efficace';
    case 'Secteur Public':
      return 'digitaliser un service public';
    default:
      return 'atteindre les objectifs du projet';
  }
}

/**
 * Génère un titre pour le scénario en fonction du domaine, sous-thème et numéro
 */
function getTitreScenario(domaine: string, sousTheme: string, numero: number): string {
  const titres = {
    'AMOA': ['Kick-off projet', 'Atelier de cadrage', 'Spécifications détaillées'],
    'Agilité': ['Sprint Planning', 'Daily Scrum en crise', 'Revue de Sprint'],
    'Data & IA': ['Analyse des besoins data', 'Modélisation prédictive', 'Présentation des résultats'],
    'Cybersécurité': ['Audit de sécurité', 'Gestion d\'incident', 'Plan de remédiation'],
    'Management': ['Réunion d\'équipe', 'Entretien d\'évaluation', 'Résolution de conflit'],
    'Communication': ['Présentation client', 'Atelier de co-construction', 'Communication de crise'],
    'Secteur Public': ['Réunion interministérielle', 'Consultation publique', 'Présentation aux élus']
  };
  
  const domaineKey = domaine as keyof typeof titres;
  return titres[domaineKey]?.[numero - 1] || `Scénario ${numero}`;
}

/**
 * Renvoie une instruction pour le scénario
 */
function getInstructionScenario(domaine: string, sousTheme: string, numero: number): string {
  switch (numero) {
    case 1:
      return "répondre à cette situation en adoptant une approche structurée et professionnelle";
    case 2:
      return "formuler une réponse précise et argumentée qui démontre votre expertise";
    case 3:
      return "proposer une solution complète et détaillée à ce défi";
    default:
      return "formuler une réponse professionnelle adaptée à la situation";
  }
}

/**
 * Démarre le premier scénario immersif basé sur le domaine et le sous-thème choisis
 */
async function demarrerScenarioImmersif(session: LearningBotSession): Promise<string> {
  try {
    const domaine = session.domaineExpertise || '';
    const sousTheme = session.sousTheme || '';
    const scenarioNum = session.scenarioActuel;
    
    const titre = getTitreScenario(domaine, sousTheme, scenarioNum);
    const secteurClient = getClientSector(domaine);
    const role = getRolePourDomaine(domaine, sousTheme);
    const objectif = getObjectifPourDomaine(domaine, sousTheme);
    const instruction = getInstructionScenario(domaine, sousTheme, scenarioNum);
    
    const prompt = `
      Génère le premier scénario immersif pour un consultant mc2i. Voici les détails :
      - Domaine d'expertise : ${domaine}
      - Sous-thème : ${sousTheme}
      - Titre du scénario : ${titre}
      - Contexte : Le consultant intervient chez un client du secteur ${secteurClient} en tant que ${role}.
      - Objectif : ${objectif}
      
      Crée un message professionnel réaliste (email, compte-rendu de réunion, etc.) qui présente une situation problématique que le consultant doit résoudre.
      Termine par une consigne claire demandant à l'utilisateur de ${instruction}.
      Fais en sorte que le niveau de difficulté corresponde à un poste de ${session.prenom || 'consultant'}.
      
      N'utilisez pas de formule comme "Voici votre premier scénario", mais plongez directement l'utilisateur dans la situation professionnelle.
    `;
    
    const systemMessage: ChatCompletionRequestMessage = {
      role: "system",
      content: getMcaiLearningSystemPrompt() + `\nRéponds à l'utilisateur en fonction du contexte de la conversation et de son stade actuel dans le processus d'apprentissage.`
    };
    
    const contextMessages = session.messages.slice(-4);
    const messages = [
      systemMessage,
      ...contextMessages
    ];
    
    const generatedResponse = await openAIService.getChatCompletion(messages, false, 0.7, 1500);
    return generatedResponse;
  } catch (error) {
    console.error("Erreur lors de la génération de la réponse:", error);
    return "Désolé, je n'ai pas pu traiter votre message. Pourriez-vous reformuler ou choisir l'une des options proposées ?";
  }
}

/**
 * Génère le scénario suivant dans la séquence immersive
 */
async function genererScenarioSuivant(session: LearningBotSession, dernierMessage: string): Promise<string> {
  try {
    const domaine = session.domaineExpertise || '';
    const sousTheme = session.sousTheme || '';
    const scenarioNum = session.scenarioActuel;
    
    const titre = getTitreScenario(domaine, sousTheme, scenarioNum);
    const secteurClient = getClientSector(domaine);
    const role = getRolePourDomaine(domaine, sousTheme);
    const objectif = getObjectifPourDomaine(domaine, sousTheme);
    const instruction = getInstructionScenario(domaine, sousTheme, scenarioNum);
    
    const dernierMessageUser = dernierMessage;
    
    const prompt = `
      D'abord, analyse la réponse du consultant au scénario précédent et fournis un feedback constructif avec:
      - ✅ Points forts: ce qui a été bien traité dans la réponse
      - ❗ Points à améliorer: ce qui aurait pu être mieux abordé
      - 🛠️ Conseils personnalisés: suggestions précises pour progresser
      
      Ensuite, génère le scénario suivant (numéro ${scenarioNum}) avec:
      - Domaine d'expertise: ${domaine}
      - Sous-thème: ${sousTheme}
      - Titre: ${titre}
      - Contexte: Suite de la mission chez le client du secteur ${secteurClient} en tant que ${role}
      - Objectif: ${objectif}
      
      Crée un message professionnel réaliste qui présente une nouvelle situation complexe liée au scénario précédent.
      Termine par une consigne claire demandant à l'utilisateur de ${instruction}.
      
      Structure ton message avec "FEEDBACK SUR VOTRE RÉPONSE" suivi de l'analyse, puis "NOUVEAU SCÉNARIO: ${titre}" suivi du scénario.
    `;
    
    const systemMessage: ChatCompletionRequestMessage = {
      role: "system",
      content: getMcaiLearningSystemPrompt()
    };
    
    const contextMessages = session.messages.slice(-6);
    const messages = [
      systemMessage,
      ...contextMessages,
      { role: "user", content: prompt }
    ];
    
    const generatedResponse = await openAIService.getChatCompletionWithCache({
      messages: messages as ChatCompletionRequestMessage[],
      temperature: 0.7,
      maxTokens: 1500
    });
    
    return generatedResponse;
  } catch (error) {
    console.error("Erreur lors de la génération du scénario suivant:", error);
    return "Désolé, je n'ai pas pu générer le scénario suivant. Pourriez-vous résumer votre approche précédente pour que nous puissions continuer ?";
  }
}

/**
 * Génère un feedback global à la fin des scénarios
 */
async function genererFeedbackGlobal(session: LearningBotSession): Promise<string> {
  try {
    const prompt = `
      Génère une synthèse professionnelle complète des performances du consultant dans tous les scénarios traités.
      
      Format de la synthèse (format email):
      
      Objet: Synthèse de votre performance - Formation ${session.domaineExpertise} / ${session.sousTheme}
      
      Bonjour [Trigramme],
      
      Après avoir complété l'ensemble des scénarios de formation, voici une évaluation globale de vos performances:
      
      1. Compétences démontrées:
      [Liste des 3-4 compétences principales où le consultant a excellé]
      
      2. Analyse détaillée par scénario:
      [Une analyse concise de chaque scénario avec points forts/à améliorer]
      
      3. Axes de progression prioritaires:
      [2-3 recommandations concrètes pour améliorer ses compétences]
      
      4. Ressources recommandées:
      [2-3 ressources fictives pertinentes pour continuer sa formation]
      
      5. Prochaines étapes suggérées:
      [Conseils sur la suite du parcours de formation]
      
      Cette évaluation est basée sur les critères standards mc2i pour le niveau [niveau du consultant].
      
      Cordialement,
      L'équipe mc2i Academy
    `;
    
    const systemMessage: ChatCompletionRequestMessage = {
      role: "system",
      content: getMcaiLearningSystemPrompt()
    };
    
    const contextMessages = session.messages.slice(-10);
    const messages = [
      systemMessage,
      ...contextMessages,
      { role: "user", content: prompt }
    ];
    
    const generatedResponse = await openAIService.getChatCompletionWithCache({
      messages: messages as ChatCompletionRequestMessage[],
      temperature: 0.7,
      maxTokens: 1500
    });
    
    return generatedResponse;
  } catch (error) {
    console.error("Erreur lors de la génération du feedback global:", error);
    return "Désolé, je n'ai pas pu générer le feedback global. Votre parcours est néanmoins terminé. Vous pouvez réinitialiser la session pour commencer un nouveau parcours.";
  }
}

/**
 * Génère une réponse générique pour les messages qui ne correspondent à aucun stade spécifique
 */
async function generateGenericResponse(session: LearningBotSession, message: string): Promise<string> {
  try {
    const prompt = `L'utilisateur a envoyé ce message: "${message}". Il est dans un parcours d'apprentissage mc2i AI Learning, mais nous ne sommes pas sûrs de l'étape actuelle. Réponds de manière professionnelle et bienveillante, en demandant des précisions sur ce qu'il souhaite faire.`;
    
    const systemMessage: ChatCompletionRequestMessage = {
      role: "system",
      content: getMcaiLearningSystemPrompt()
    };
    
    const messages = [
      systemMessage,
      { role: "user", content: prompt }
    ];
    
    const generatedResponse = await openAIService.getChatCompletionWithCache({
      messages: messages as ChatCompletionRequestMessage[],
      temperature: 0.7,
      maxTokens: 1500
    });
    
    return generatedResponse;
  } catch (error) {
    console.error("Erreur lors de la génération de la réponse:", error);
    return "Désolé, je n'ai pas pu traiter votre message. Pourriez-vous reformuler ou choisir l'une des options proposées ?";
  }
}

/**
 * Génère un prompt système pour le chatbot mc2i AI Learning
 */
function getMcaiLearningSystemPrompt(): string {
  return `
Tu es mc2i AI Learning, un agent conversationnel expert conçu pour simuler des situations professionnelles et évaluer les compétences des consultants mc2i de manière immersive, interactive et personnalisée. Ton objectif est d'accompagner l'apprenant en recréant des scénarios réalistes selon son métier, son niveau d'expérience et sa formation suivie. Tu guides l'utilisateur étape par étape, en respectant strictement les règles de validation, de confidentialité, de langue et de feedback professionnel.

🎯 Objectifs principaux
Créer et adapter des scénarios professionnels selon le niveau de poste mc2i.

Fournir un feedback détaillé, constructif et strictement bienveillant.

Immerger l'apprenant dans une simulation réaliste par emails, messages, documents et interactions dynamiques.

🛠️ Déroulé et règles d'interaction
1. Accueil et identification
Dès le 1er message, tu :

Te présentes brièvement.

Demandes deux infos obligatoires :

Trigramme (3 lettres, alphabet uniquement).

Métier chez mc2i : Consultant, Consultant Confirmé, Consultant Senior, Chef de Projet, Manager, Senior Manager, Directeur.

Si une donnée est invalide, tu envoies un message clair d'erreur, et tu attends une réponse correcte avant de poursuivre.

2. Choix du parcours d'apprentissage
Propose deux options :

Apprentissage Classique (4 scénarios indépendants)

Immersion Totale (6 scénarios liés avec conséquences sur les choix)

Attends impérativement la réponse.

3. Sélection de la formation
Propose à l'utilisateur :

D'envoyer un fichier PDF ou Word (formation personnelle).

Ou de choisir un domaine dans une liste (AMOA, Agilité, Data & IA, etc.).

Ensuite, s'il choisit un domaine, affiche les sous-thèmes disponibles. Ex. pour "Data & IA" : Machine Learning, Power BI, etc.

4. Construction des scénarios
Tu génères les scénarios selon :

Le poste (ex. Directeur = stratégie, Consultant = application terrain).

Le thème choisi.

Chaque scénario prend la forme d'un message professionnel : email, message instantané, réunion, rapport, etc.

La consigne est claire et attend une réponse de minimum 30 caractères. Sinon, tu demandes une reformulation.

5. Feedback et progression
Après chaque réponse, tu formules un feedback structuré :

✅ Points forts

❗ Points à améliorer

🛠️ Conseils personnalisés

À la fin de la session, tu rédiges un email de synthèse professionnelle avec bilan global et recommandations.

📐 Règles de style et de présentation
Toujours une majuscule en début de phrase, un point à la fin.

Une seule majuscule par phrase sauf acronymes.

Langage professionnel, clair, sans abréviation ni familiarité.

Mise en page structurée avec des titres, des gras, des emojis discrets si besoin.

Respect absolu de la confidentialité des documents fournis.

🤖 Comportement du chatbot
Tu attends toujours la réponse de l'utilisateur avant de passer à l'étape suivante.

Tu ne poursuis jamais en cas d'erreur ou d'incomplétude.

Tu es strict dans la validation, bienveillant dans le ton, exigeant dans les retours.

Tu guides, encourages, et valorises la progression continue.
`;
}