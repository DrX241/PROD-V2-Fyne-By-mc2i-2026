import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { openAIService } from './services/openAIService';
import { getRandomAnecdote, getDifficultyText, getSecteurActivite, getCompanyName, getRelevantContacts } from './anecdoteGenerator';

// Constantes pour le scénario
const predefinedScenarios = [
  {
    id: "cybersecurite-fondamentaux",
    title: "Fondamentaux de la cybersécurité en entreprise",
    difficulty: "Débutant",
    domain: "Stratégie et gouvernance",
    description: "Introduction aux concepts de base de la cybersécurité et aux bonnes pratiques pour les entreprises.",
    objectives: [
      "Comprendre les principes fondamentaux de la cybersécurité",
      "Identifier les menaces communes pour les entreprises",
      "Connaître les premières mesures de protection à mettre en place"
    ]
  },
  {
    id: "gestion-incidents",
    title: "Gestion d'incidents de sécurité",
    difficulty: "Intermédiaire",
    domain: "Gestion des incidents",
    description: "Préparation et réponse aux incidents de cybersécurité dans un contexte professionnel.",
    objectives: [
      "Élaborer un plan de réponse aux incidents",
      "Appliquer les procédures d'investigation et de remédiation",
      "Mettre en place une communication de crise efficace"
    ]
  },
  {
    id: "conformite-rgpd",
    title: "Conformité RGPD et protection des données",
    difficulty: "Intermédiaire",
    domain: "RGPD",
    description: "Mise en conformité avec le Règlement Général sur la Protection des Données et sécurisation des données personnelles.",
    objectives: [
      "Comprendre les obligations légales du RGPD",
      "Mettre en place les mesures techniques et organisationnelles requises",
      "Gérer les droits des personnes concernées et les violations de données"
    ]
  },
  {
    id: "securite-supply-chain",
    title: "Sécurité de la chaîne d'approvisionnement informatique",
    difficulty: "Expert",
    domain: "Sécurité de la chaîne d'approvisionnement",
    description: "Évaluation et renforcement de la sécurité tout au long de la chaîne d'approvisionnement technologique.",
    objectives: [
      "Identifier les risques liés aux fournisseurs et partenaires",
      "Établir un cadre d'évaluation de la sécurité des tiers",
      "Implémenter des contrôles contractuels et techniques efficaces"
    ]
  },
  {
    id: "phishing-defense",
    title: "Défense contre le phishing et l'ingénierie sociale",
    difficulty: "Débutant",
    domain: "Ingénierie sociale/phishing",
    description: "Stratégies pour détecter et prévenir les attaques d'ingénierie sociale dans un contexte professionnel.",
    objectives: [
      "Reconnaître les différentes formes d'attaques de phishing",
      "Développer un programme de sensibilisation efficace",
      "Mettre en place des mesures techniques de protection"
    ]
  }
];

/**
 * Gère la requête de démarrage d'un scénario cyber
 */
export async function handleStartScenario(req: Request, res: Response) {
  try {
    const { userId, displayName, scenarioId, difficulty, profile } = req.body;
    
    if (!userId || !displayName) {
      return res.status(400).json({ 
        success: false, 
        message: "Informations utilisateur manquantes" 
      });
    }

    // Identifier les informations du scénario
    const scenarioInfo = predefinedScenarios.find(s => s.id === scenarioId);
    
    if (!scenarioInfo && !scenarioId) {
      return res.status(400).json({ 
        success: false, 
        message: "ID de scénario requis" 
      });
    }
    
    // En mode dynamique, générer un scénario avec OpenAI
    if (scenarioId === 'dynamique' || !scenarioInfo) {
      return handleDynamicScenario(req, res);
    }
    
    // Récupérer un domaine formaté pour le scénario prédéfini
    const domainInfo = scenarioInfo.domain;
    
    // Préparer les données de session
    const sessionId = uuidv4();
    const sessionData = {
      sessionId,
      userId,
      displayName,
      scenarioId: scenarioInfo.id,
      title: scenarioInfo.title,
      difficulty: scenarioInfo.difficulty || difficulty || "Intermédiaire",
      domain: domainInfo,
      profile: profile || "Généraliste",
      startTime: Date.now(),
      messages: [],
      context: {},
      completed: false
    };
    
    // Générer une anecdote spécifique au domaine
    const anecdote = getRandomAnecdote(domainInfo);
    
    // Générer un nom de compagnie fictif basé sur le secteur
    const secteurActivite = getSecteurActivite(displayName);
    const companyName = getCompanyName(secteurActivite);
    
    // Sélectionner des contacts pertinents pour le domaine
    const primaryContact = { name: displayName, role: `Responsable ${domainInfo}` };
    const additionalContacts = getRelevantContacts(domainInfo, primaryContact);
    
    // Obtenir une description de la difficulté
    const difficultyText = getDifficultyText(scenarioInfo.difficulty || difficulty || "Intermédiaire");
    
    // Générer un prompt initial pour OpenAI
    const initialPrompt = await generateInitialPrompt(
      displayName,
      domainInfo,
      scenarioInfo.title,
      scenarioInfo.difficulty || difficulty || "Intermédiaire",
      profile || "Généraliste",
      anecdote,
      companyName,
      secteurActivite,
      additionalContacts
    );
    
    // Retourner les informations de session
    return res.json({
      success: true,
      sessionId,
      scenario: {
        id: scenarioInfo.id,
        title: scenarioInfo.title,
        difficulty: scenarioInfo.difficulty || difficulty || "Intermédiaire",
        difficultyText,
        domain: domainInfo,
        description: scenarioInfo.description,
        objectives: scenarioInfo.objectives,
        anecdote
      },
      context: {
        companyName,
        secteurActivite,
        primaryContact,
        additionalContacts
      },
      initialPrompt
    });
  } catch (error) {
    console.error('Erreur lors du démarrage du scénario:', error);
    return res.status(500).json({ 
      success: false, 
      message: "Erreur lors du traitement de la demande" 
    });
  }
}

/**
 * Gère la génération d'un scénario dynamique
 */
async function handleDynamicScenario(req: Request, res: Response) {
  try {
    const { userId, displayName, difficulty, domain, profile } = req.body;
    
    // Vérifier les paramètres nécessaires pour la génération dynamique
    if (!difficulty || !domain) {
      return res.status(400).json({ 
        success: false, 
        message: "Paramètres manquants pour la génération dynamique (difficulté, domaine)" 
      });
    }
    
    // Générer un ID de session unique
    const sessionId = uuidv4();
    const scenarioId = `dynamic-${uuidv4().slice(0, 8)}`;
    
    // Générer une anecdote pertinente
    const anecdote = getRandomAnecdote(domain);
    
    // Générer un nom de compagnie fictif basé sur le secteur
    const secteurActivite = getSecteurActivite(displayName);
    const companyName = getCompanyName(secteurActivite);
    
    // Sélectionner des contacts pertinents pour le domaine
    const primaryContact = { name: displayName, role: `Responsable ${domain}` };
    const additionalContacts = getRelevantContacts(domain, primaryContact);
    
    // Obtenir une description de la difficulté
    const difficultyText = getDifficultyText(difficulty);
    
    // Générer un prompt pour créer un scénario dynamique
    const systemPrompt = `Tu es un expert en cybersécurité spécialisé dans la création de scénarios de formation. 
    Crée un scénario réaliste dans le domaine "${domain}" avec un niveau de difficulté "${difficulty}" pour un profil "${profile || 'Généraliste'}".
    
    Le scénario doit inclure:
    - Un titre accrocheur et professionnel
    - Une description détaillée mais concise (3-4 phrases)
    - 3 objectifs d'apprentissage clairs
    
    Format attendu (JSON uniquement):
    {
      "title": "Titre du scénario",
      "description": "Description détaillée du scénario...",
      "objectives": ["Objectif 1", "Objectif 2", "Objectif 3"]
    }
    
    Assure-toi que le scénario est réaliste, situé en France ou en Europe, et adapté au niveau de difficulté demandé.`;
    
    // Appel à l'API OpenAI pour générer le scénario
    try {
      const response = await openAIService.getChatCompletionWithCache(
        [{ role: 'system', content: systemPrompt }],
        0.7,
        800
      );
      
      // Extraire le JSON de la réponse
      let scenarioData;
      try {
        // Essayer de parser la réponse JSON
        scenarioData = JSON.parse(response);
      } catch (jsonError) {
        console.error('Erreur de parsing JSON:', jsonError);
        console.log('Réponse brute:', response);
        
        // Créer un scénario de secours si le parsing échoue
        scenarioData = {
          title: `Scénario ${domain} - Niveau ${difficulty}`,
          description: `Un scénario de formation en ${domain} adapté au niveau ${difficulty}.`,
          objectives: [
            "Comprendre les principes fondamentaux du domaine",
            "Identifier les risques et menaces associés",
            "Mettre en place des mesures de protection adaptées"
          ]
        };
      }
      
      // Générer un prompt initial pour l'interaction
      const initialPrompt = await generateInitialPrompt(
        displayName,
        domain,
        scenarioData.title,
        difficulty,
        profile || "Généraliste",
        anecdote,
        companyName,
        secteurActivite,
        additionalContacts
      );
      
      // Retourner les informations de session
      return res.json({
        success: true,
        sessionId,
        scenario: {
          id: scenarioId,
          title: scenarioData.title,
          difficulty,
          difficultyText,
          domain,
          description: scenarioData.description,
          objectives: scenarioData.objectives,
          anecdote
        },
        context: {
          companyName,
          secteurActivite,
          primaryContact,
          additionalContacts
        },
        initialPrompt
      });
    } catch (error) {
      console.error('Erreur lors de la génération du scénario dynamique:', error);
      return res.status(500).json({ 
        success: false, 
        message: "Erreur lors de la génération du scénario" 
      });
    }
  } catch (error) {
    console.error('Erreur globale dans handleDynamicScenario:', error);
    return res.status(500).json({ 
      success: false, 
      message: "Erreur serveur lors du traitement de la demande" 
    });
  }
}

/**
 * Génère un prompt initial pour démarrer la conversation
 */
async function generateInitialPrompt(
  displayName: string,
  domain: string,
  scenarioTitle: string,
  difficulty: string,
  profile: string,
  anecdote: string,
  companyName: string,
  secteurActivite: string,
  additionalContacts: Array<{ name: string, role: string }>
): Promise<string> {
  // Construire un message de bienvenue personnalisé
  const greeting = `Bonjour ${displayName},`;
  
  // Présentation du contexte
  const context = `Je suis I AM CYBER, votre assistant virtuel spécialisé en cybersécurité, et je vais vous accompagner pour ce scénario "${scenarioTitle}" dans le domaine de "${domain}".`;
  
  // Explication du scénario
  const scenarioIntro = `Nous allons travailler ensemble sur une mise en situation professionnelle adaptée à votre niveau (${difficulty}) et à votre profil (${profile}).`;
  
  // Présentation du contexte fictif
  const companyContext = `Pour ce scénario, vous travaillez chez ${companyName}, une entreprise du secteur ${secteurActivite}. Vous occupez le poste de Responsable ${domain}.`;
  
  // Présentation des autres interlocuteurs
  let contactsText = '';
  if (additionalContacts && additionalContacts.length > 0) {
    contactsText = 'Vous pourrez être amené à interagir avec les personnes suivantes :\n';
    additionalContacts.forEach(contact => {
      contactsText += `- ${contact.name}, ${contact.role}\n`;
    });
  }
  
  // Ajout de l'anecdote comme élément de contexte
  const anecdoteText = `\nUne information qui pourrait vous être utile : ${anecdote}`;
  
  // Incitation à démarrer la discussion
  const callToAction = `\nPour commencer, pourriez-vous me préciser quelles sont vos priorités ou questions concernant ce scénario ? Je suis là pour vous guider tout au long de cette mise en situation.`;
  
  // Assembler le prompt complet
  return `${greeting}\n\n${context}\n\n${scenarioIntro}\n\n${companyContext}\n\n${contactsText}${anecdoteText}\n\n${callToAction}`;
}