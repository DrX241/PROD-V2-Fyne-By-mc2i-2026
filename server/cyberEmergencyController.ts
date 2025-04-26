import { Request, Response } from 'express';
import { openAIService } from "./services/openai";

// Types d'urgences cyber disponibles
export enum CyberEmergencyType {
  FORMATION = "Formation et sensibilisation à la cybersécurité",
  OSINT = "L'OSINT",
  CONFORMITE = "La conformité cyber en entreprise",
  STRATEGIE = "Définir une stratégie cyber et sa feuille de route",
  CRISE = "Gestion de crise cyber",
  SUPPLY_CHAIN = "La sécurité de la supply chain",
  IAM = "L'IAM",
  CLOUD = "La cybersécurité dans le cloud",
  DONNEES = "Sécurisation des données personnelles",
  VULNERABILITES = "Analyse des vulnérabilités et tests de pénétration",
  INCIDENTS = "Gestion des incidents de sécurité",
  FORENSICS = "Forensics"
}

// Interface d'un PNJ (Personnage Non-Joueur)
interface CyberNPC {
  id: string;
  name: string;
  role: string;
  personality: string;
  expertise: string[];
}

// Interface d'un scénario d'urgence cyber
interface CyberEmergencyScenario {
  id: string;
  type: CyberEmergencyType;
  title: string;
  description: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  context: string;
  objectives: string[];
  npcs: CyberNPC[];
  initialPrompt: string;
}

// Interface pour les données de session d'urgence
interface EmergencySessionData {
  sessionId: string;
  scenarioId: string;
  messages: Array<any>;
  context: {
    currentStage: number;
    userActions: string[];
    systemNotes: string[];
    detectedKeywords: string[];
    performanceScore: number;
    completedObjectives: string[];
  };
  startTime: number;
}

// Catalogue des scénarios d'urgence
const emergencyScenarios: CyberEmergencyScenario[] = [
  {
    id: "crise-ransomware-1",
    type: CyberEmergencyType.CRISE,
    title: "Attaque par ransomware en cours",
    description: "Une attaque par ransomware paralyse les systèmes critiques de l'organisation",
    urgencyLevel: 'critical',
    context: "Une entreprise française du secteur de la santé fait face à une attaque par ransomware qui a chiffré plusieurs serveurs critiques, y compris des dossiers médicaux",
    objectives: [
      "Identifier l'étendue de l'infection",
      "Isoler les systèmes compromis",
      "Établir un plan de communication de crise",
      "Décider de la stratégie de réponse (paiement ou non de la rançon)"
    ],
    npcs: [
      {
        id: "ciso",
        name: "Martine Dubois",
        role: "RSSI (Responsable de la Sécurité des Systèmes d'Information)",
        personality: "Méthodique, calme sous pression, parfois trop technique pour les non-initiés",
        expertise: ["Gestion de crise", "Architecture de sécurité", "Analyse de risques"]
      },
      {
        id: "ceo",
        name: "Philippe Martin",
        role: "Directeur Général",
        personality: "Orienté business, préoccupé par l'image de l'entreprise et les aspects financiers",
        expertise: ["Leadership", "Communication d'entreprise", "Gestion d'entreprise"]
      },
      {
        id: "tech-lead",
        name: "Sophie Laurent",
        role: "Responsable Technique",
        personality: "Analytique, directe, passionnée par la technologie",
        expertise: ["Infrastructure IT", "Forensics", "Réponse aux incidents"]
      }
    ],
    initialPrompt: "Nos systèmes de santé sont paralysés par un ransomware. Des vies sont potentiellement en danger. Comment procédons-nous?"
  },
  {
    id: "fuite-donnees-1",
    type: CyberEmergencyType.DONNEES,
    title: "Fuite massive de données personnelles",
    description: "Une fuite de données clients a été découverte, potentiellement liée à une intrusion",
    urgencyLevel: 'high',
    context: "Une grande banque européenne vient de découvrir qu'une base de données contenant les informations personnelles et bancaires de plus de 100 000 clients a été compromise",
    objectives: [
      "Évaluer l'ampleur de la fuite",
      "Identifier le vecteur d'attaque",
      "Préparer la notification aux autorités (CNIL) et aux clients affectés",
      "Mettre en place des mesures de mitigation"
    ],
    npcs: [
      {
        id: "dpo",
        name: "Claire Bernard",
        role: "Déléguée à la Protection des Données",
        personality: "Précise, soucieuse du détail, très axée sur la conformité réglementaire",
        expertise: ["RGPD", "Gouvernance des données", "Gestion de la vie privée"]
      },
      {
        id: "comm-director",
        name: "Jean Leroy",
        role: "Directeur de la Communication",
        personality: "Eloquent, orienté image de marque, parfois trop optimiste",
        expertise: ["Communication de crise", "Relations publiques", "Gestion de réputation"]
      },
      {
        id: "security-analyst",
        name: "Karim Benali",
        role: "Analyste en Sécurité",
        personality: "Méticuleux, curieux, parfois pessimiste",
        expertise: ["Analyse de vulnérabilités", "Détection d'intrusion", "Analyse forensique"]
      }
    ],
    initialPrompt: "Nous venons de confirmer qu'une base de données clients a été compromise. Les premières estimations parlent de 100 000 clients potentiellement affectés. Quelles sont nos priorités immédiates?"
  },
  {
    id: "phishing-formation-1",
    type: CyberEmergencyType.FORMATION,
    title: "Campagne de phishing ciblée",
    description: "Une campagne de phishing sophistiquée cible les cadres supérieurs de l'organisation",
    urgencyLevel: 'medium',
    context: "Une entreprise du CAC 40 fait face à une série d'attaques de phishing très ciblées visant spécifiquement les membres du comité exécutif",
    objectives: [
      "Analyser les techniques de phishing utilisées",
      "Développer un programme de sensibilisation d'urgence",
      "Mettre en place des contrôles techniques supplémentaires",
      "Créer des procédures de signalement efficaces"
    ],
    npcs: [
      {
        id: "hr-director",
        name: "Nathalie Petit",
        role: "Directrice des Ressources Humaines",
        personality: "Empathique, diplomate, axée sur les personnes plutôt que la technologie",
        expertise: ["Formation du personnel", "Gestion du changement", "Communication interne"]
      },
      {
        id: "it-manager",
        name: "Thomas Durand",
        role: "Responsable IT",
        personality: "Pragmatique, orienté solutions, parfois impatient",
        expertise: ["Infrastructure email", "Sécurité des postes de travail", "Contrôles d'accès"]
      },
      {
        id: "exec-assistant",
        name: "Léa Moreau",
        role: "Assistante de Direction",
        personality: "Organisée, attentive, bonne communicatrice",
        expertise: ["Workflows exécutifs", "Gestion documentaire", "Coordination d'équipe"]
      }
    ],
    initialPrompt: "Trois de nos dirigeants ont reçu des emails de phishing extrêmement convaincants. L'un d'eux a presque compromis ses identifiants. Comment pouvons-nous rapidement sensibiliser l'ensemble du comité exécutif?"
  }
];

// Générer la date actuelle au format français
function getCurrentDateTimeString(): string {
  const now = new Date();
  const date = now.toLocaleDateString('fr-FR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });
  const time = now.toLocaleTimeString('fr-FR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  return `${time} le ${date}`;
}

// Sessions actives d'urgence (en mémoire pour cet exemple)
const activeSessions: Map<string, EmergencySessionData> = new Map();

/**
 * Récupère la liste des scénarios d'urgence disponibles
 */
export async function getEmergencyScenarios(req: Request, res: Response) {
  try {
    // Récupérer les types et les scénarios disponibles
    const scenarioTypes = Object.values(CyberEmergencyType);
    
    // Organiser les scénarios par catégorie
    const scenariosByCategory: { [key: string]: any[] } = {};
    
    // Initialiser chaque catégorie avec un tableau vide
    scenarioTypes.forEach(type => {
      scenariosByCategory[type] = [];
    });
    
    // Remplir les catégories avec les scénarios correspondants
    emergencyScenarios.forEach(scenario => {
      if (scenariosByCategory[scenario.type]) {
        scenariosByCategory[scenario.type].push({
          id: scenario.id,
          title: scenario.title,
          urgency: scenario.urgencyLevel,
          expertise: 'intermediate', // Par défaut
          description: scenario.description
        });
      }
    });
    
    res.json({
      success: true,
      scenarioTypes,
      scenariosByCategory,
      currentDateTime: getCurrentDateTimeString()
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des scénarios d\'urgence:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la récupération des scénarios'
    });
  }
}

/**
 * Démarre une nouvelle session d'urgence cyber
 */
export async function startEmergencySession(req: Request, res: Response) {
  try {
    const { emergencyType } = req.body;
    
    if (!emergencyType || !Object.values(CyberEmergencyType).includes(emergencyType)) {
      return res.status(400).json({
        success: false,
        error: 'Type d\'urgence invalide ou manquant'
      });
    }
    
    // Trouver un scénario correspondant au type d'urgence
    const matchingScenarios = emergencyScenarios.filter(s => s.type === emergencyType);
    
    if (matchingScenarios.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Aucun scénario disponible pour ce type d\'urgence'
      });
    }
    
    // Sélectionner un scénario aléatoirement parmi ceux disponibles
    const selectedScenario = matchingScenarios[Math.floor(Math.random() * matchingScenarios.length)];
    
    // Créer un ID de session unique
    const sessionId = `emergency-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Créer un message initial basé sur l'heure actuelle
    const initialMessage = {
      id: `msg-${Date.now()}`,
      type: 'system',
      content: `Bonjour, il est ${getCurrentDateTimeString()}. Nous avons urgemment besoin de votre expertise concernant: "${selectedScenario.type}". ${selectedScenario.initialPrompt}`,
      timestamp: Date.now()
    };
    
    // Données de la nouvelle session
    const sessionData: EmergencySessionData = {
      sessionId,
      scenarioId: selectedScenario.id,
      messages: [initialMessage],
      context: {
        currentStage: 1,
        userActions: [],
        systemNotes: [],
        detectedKeywords: [],
        performanceScore: 0,
        completedObjectives: []
      },
      startTime: Date.now()
    };
    
    // Stocker la session
    activeSessions.set(sessionId, sessionData);
    
    res.json({
      success: true,
      message: 'Session d\'urgence cyber démarrée',
      sessionId,
      scenario: {
        id: selectedScenario.id,
        title: selectedScenario.title,
        description: selectedScenario.description,
        urgencyLevel: selectedScenario.urgencyLevel,
        type: selectedScenario.type
      },
      initialMessage
    });
  } catch (error) {
    console.error('Erreur lors du démarrage de la session d\'urgence:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur lors du démarrage de la session d\'urgence'
    });
  }
}

/**
 * Traite un message dans une session d'urgence cyber en cours
 */
export async function processEmergencyMessage(req: Request, res: Response) {
  try {
    const { sessionId, message } = req.body;
    
    if (!sessionId || !message) {
      return res.status(400).json({
        success: false,
        error: 'Paramètres manquants: sessionId ou message'
      });
    }
    
    // Récupérer la session en cours
    const session = activeSessions.get(sessionId);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session non trouvée'
      });
    }
    
    // Trouver le scénario correspondant
    const scenario = emergencyScenarios.find(s => s.id === session.scenarioId);
    
    if (!scenario) {
      return res.status(500).json({
        success: false,
        error: 'Scénario introuvable'
      });
    }
    
    // Ajouter le message de l'utilisateur à l'historique
    const userMessage = {
      id: `msg-${Date.now()}-user`,
      type: 'user',
      content: message,
      timestamp: Date.now()
    };
    
    session.messages.push(userMessage);
    
    // Analyser le message pour détecter des mots-clés et intentions
    const keywordAnalysisPrompt = `
    En tant qu'analyste de cybersécurité, examine le message suivant de l'utilisateur dans le contexte d'une urgence de type "${scenario.type}".

    Message de l'utilisateur: "${message}"
    
    Contexte du scénario: "${scenario.context}"
    
    Objectifs à atteindre:
    ${scenario.objectives.map(obj => `- ${obj}`).join('\n')}
    
    Historique récent des messages:
    ${session.messages.slice(-5).map(m => `[${m.type}]: ${m.content}`).join('\n')}
    
    Réponds en JSON avec exactement cette structure:
    {
      "detectedKeywords": ["mot-clé1", "mot-clé2", ...], // Liste des termes techniques ou pertinents détectés
      "userIntent": "description de l'intention principale de l'utilisateur",
      "relevantObjectives": ["objectif1", ...], // Liste des objectifs du scénario que ce message pourrait aider à atteindre
      "suggestedNPC": "id-du-npc", // Quel personnage devrait répondre selon le contenu du message
      "sentimentAnalysis": "positif|neutre|négatif|urgent" // L'état émotionnel apparent de l'utilisateur
    }
    
    Ne réponds qu'avec ce JSON, rien d'autre.`;
    
    // Obtenir l'analyse via l'IA
    let keywordAnalysis;
    try {
      const analysisResponse = await openAIService.getChatCompletion(
        [{ role: 'user', content: keywordAnalysisPrompt }],
        0.3,
        1000
      );
      
      keywordAnalysis = JSON.parse(analysisResponse);
    } catch (error) {
      console.error('Erreur lors de l\'analyse des mots-clés:', error);
      keywordAnalysis = {
        detectedKeywords: [],
        userIntent: "Intention non détectée",
        relevantObjectives: [],
        suggestedNPC: scenario.npcs[0].id, // Utiliser le premier PNJ par défaut
        sentimentAnalysis: "neutre"
      };
    }
    
    // Mettre à jour le contexte de la session
    session.context.detectedKeywords = [...session.context.detectedKeywords, ...keywordAnalysis.detectedKeywords];
    session.context.userActions.push(keywordAnalysis.userIntent);
    
    // Sélectionner le PNJ qui va répondre
    const respondingNPC = scenario.npcs.find(npc => npc.id === keywordAnalysis.suggestedNPC) || scenario.npcs[0];
    
    // Générer la réponse du PNJ
    const npcResponsePrompt = `
    Tu es ${respondingNPC.name}, ${respondingNPC.role}, dans une situation d'urgence cyber.
    
    Ta personnalité: ${respondingNPC.personality}
    Ton expertise: ${respondingNPC.expertise.join(', ')}
    
    Contexte de l'urgence: 
    Type: ${scenario.type}
    Description: ${scenario.description}
    Situation actuelle: ${scenario.context}
    
    L'utilisateur est un consultant en cybersécurité appelé en urgence. Voici sa dernière interaction:
    "${message}"
    
    Ton analyse montre que l'utilisateur:
    - Intention: ${keywordAnalysis.userIntent}
    - Sentiment: ${keywordAnalysis.sentimentAnalysis}
    - Mots-clés détectés: ${keywordAnalysis.detectedKeywords.join(', ')}
    
    Les objectifs actuels sont:
    ${scenario.objectives.map(obj => `- ${obj}`).join('\n')}
    
    Historique récent des messages:
    ${session.messages.slice(-5).map(m => `[${m.type === 'system' ? 'système' : m.type}]: ${m.content}`).join('\n')}

    Réponds de manière concise (2-3 paragraphes maximum) en tant que ${respondingNPC.name}, avec ta personnalité spécifique. Adapte ta réponse au contexte de l'urgence et aux intentions détectées de l'utilisateur. Évite les formules génériques et sois spécifique à la situation. Ne mentionne pas ton "rôle" explicitement - réagis simplement comme le ferait ce personnage.
    
    Rappelle-toi:
    - Garde un ton d'urgence approprié
    - Reste dans ton personnage et ton expertise
    - Fais progresser la situation vers les objectifs si possible
    - Réagis aux éléments concrets mentionnés par l'utilisateur
    `;
    
    let npcResponse;
    try {
      npcResponse = await openAIService.getChatCompletion(
        [{ role: 'user', content: npcResponsePrompt }],
        0.7,
        800
      );
    } catch (error) {
      console.error('Erreur lors de la génération de la réponse du PNJ:', error);
      npcResponse = `Je comprends la situation. Continuons à travailler sur ce problème de ${scenario.type}. Quelles actions spécifiques proposez-vous?`;
    }
    
    // Créer le message de réponse du PNJ
    const botMessage = {
      id: `msg-${Date.now()}-npc`,
      type: 'bot',
      content: npcResponse,
      contactName: respondingNPC.name,
      contactRole: respondingNPC.role,
      timestamp: Date.now()
    };
    
    // Ajouter la réponse à l'historique
    session.messages.push(botMessage);
    
    // Mettre à jour le score de performance basé sur la progression vers les objectifs
    if (keywordAnalysis.relevantObjectives.length > 0) {
      session.context.performanceScore += keywordAnalysis.relevantObjectives.length * 5;
      
      // Marquer les objectifs comme complétés si approprié
      keywordAnalysis.relevantObjectives.forEach((objective: string) => {
        if (!session.context.completedObjectives.includes(objective)) {
          session.context.completedObjectives.push(objective);
        }
      });
      
      // Progression du scénario si nécessaire
      if (session.context.completedObjectives.length / scenario.objectives.length > 0.5 && 
          session.context.currentStage === 1) {
        session.context.currentStage = 2;
      } else if (session.context.completedObjectives.length === scenario.objectives.length) {
        session.context.currentStage = 3; // Scénario complété
      }
    }
    
    // Mettre à jour la session dans la collection
    activeSessions.set(sessionId, session);
    
    res.json({
      success: true,
      message: botMessage,
      progressUpdate: {
        currentStage: session.context.currentStage,
        completedObjectives: session.context.completedObjectives,
        performanceScore: session.context.performanceScore
      }
    });
  } catch (error) {
    console.error('Erreur lors du traitement du message d\'urgence:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur lors du traitement du message'
    });
  }
}

/**
 * Termine une session d'urgence cyber et génère un débriefing
 */
export async function completeEmergencySession(req: Request, res: Response) {
  try {
    const { sessionId, userEmail, userName } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'SessionId manquant'
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
    
    // Trouver le scénario correspondant
    const scenario = emergencyScenarios.find(s => s.id === session.scenarioId);
    
    if (!scenario) {
      return res.status(500).json({
        success: false,
        error: 'Scénario introuvable'
      });
    }
    
    // Calculer la durée de la session
    const duration = Date.now() - session.startTime;
    
    // Générer le débriefing
    const debriefingPrompt = `
    Génère un débriefing d'intervention d'urgence cyber pour un scénario de type "${scenario.type}".
    
    Détails du scénario:
    - Titre: ${scenario.title}
    - Description: ${scenario.description}
    - Contexte: ${scenario.context}
    - Niveau d'urgence: ${scenario.urgencyLevel}
    
    Objectifs du scénario:
    ${scenario.objectives.map(obj => `- ${obj}`).join('\n')}
    
    Objectifs complétés par l'utilisateur:
    ${session.context.completedObjectives.map(obj => `- ${obj}`).join('\n')}
    
    Performance de l'utilisateur:
    - Score: ${session.context.performanceScore}
    - Mots-clés pertinents utilisés: ${session.context.detectedKeywords.join(', ')}
    - Actions entreprises: ${session.context.userActions.join(', ')}
    - Durée de l'intervention: ${Math.round(duration / 60000)} minutes
    
    Génère un débriefing professionnel, structuré et détaillé au format HTML avec les sections suivantes:
    1. Résumé de l'intervention
    2. Analyse des décisions prises
    3. Points forts et axes d'amélioration
    4. Recommandations pour des situations similaires futures
    5. Ressources complémentaires à consulter
    
    Utilise un style professionnel et factuel. Le débriefing doit être utile pour améliorer les compétences en gestion de crise cyber.
    `;
    
    let debriefingHtml;
    try {
      debriefingHtml = await openAIService.getChatCompletion(
        [{ role: 'user', content: debriefingPrompt }],
        0.7,
        1500
      );
    } catch (error) {
      console.error('Erreur lors de la génération du débriefing:', error);
      debriefingHtml = `
      <h1>Débriefing de la session d'urgence cyber</h1>
      <p>Session portant sur: ${scenario.type}</p>
      <p>Durée: ${Math.round(duration / 60000)} minutes</p>
      <p>Une erreur s'est produite lors de la génération du débriefing complet.</p>
      `;
    }
    
    // Si des informations de contact sont fournies, envoyer par email (pas implémenté ici)
    // Cette partie serait similaire à la fonction completeAgentSession
    
    // Supprimer la session
    activeSessions.delete(sessionId);
    
    res.json({
      success: true,
      debriefingHtml,
      performanceStats: {
        duration: Math.round(duration / 60000),
        score: session.context.performanceScore,
        completedObjectives: session.context.completedObjectives.length,
        totalObjectives: scenario.objectives.length
      }
    });
  } catch (error) {
    console.error('Erreur lors de la finalisation de la session d\'urgence:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la finalisation de la session'
    });
  }
}