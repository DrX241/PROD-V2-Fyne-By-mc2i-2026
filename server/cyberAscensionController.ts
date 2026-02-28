import { Request, Response } from 'express';
import { openAIService } from './services/openai';

const openai = {
  chat: {
    completions: {
      create: async (params: any) => {
        const messages = params.messages || [];
        const temperature = params.temperature || 0.7;
        const maxTokens = params.max_tokens || 2000;
        const content = await openAIService.getChatCompletion(messages, temperature, maxTokens);
        return { choices: [{ message: { content } }] };
      }
    }
  }
};

/**
 * Interface pour les niveaux d'CYBERASCENSION
 */
interface AscensionLevel {
  id: number;
  title: string;
  theme: string;
  systemPrompt: string;
}

/**
 * Interface pour les requêtes d'analyse de réponse utilisateur
 */
interface UserResponseAnalysisRequest {
  levelId: number;
  stepId: number;
  userResponse: string;
  context?: any;
}

/**
 * Les niveaux d'CYBERASCENSION avec leurs prompts système
 */
const ascensionLevels: AscensionLevel[] = [
  {
    id: 1,
    title: "Sensibilisation à la cybersécurité",
    theme: "Formation et sensibilisation",
    systemPrompt: "Tu es un expert en formation et sensibilisation à la cybersécurité. Tu dois évaluer les réponses d'un apprenant qui crée un programme de sensibilisation en entreprise. Analyse ses propositions en termes de pertinence, exhaustivité et efficacité pédagogique. Fournis un feedback constructif et des conseils d'amélioration basés sur les meilleures pratiques actuelles."
  },
  {
    id: 2,
    title: "Maîtrise de l'OSINT",
    theme: "L'OSINT",
    systemPrompt: "Tu es un expert en OSINT (Open Source Intelligence). Tu dois évaluer les méthodes d'investigation en sources ouvertes d'un apprenant qui recherche des informations sur une entreprise. Analyse ses techniques en termes d'efficacité, de légalité et d'exhaustivité. Fournis un feedback constructif qui souligne les bonnes pratiques et suggère des outils ou approches complémentaires."
  },
  {
    id: 3,
    title: "Conformité cyber en entreprise",
    theme: "La conformité cyber en entreprise",
    systemPrompt: "Tu es un expert en conformité cybersécurité. Tu dois évaluer les analyses et plans d'un apprenant concernant la mise en conformité d'une entreprise avec les réglementations (RGPD, NIS2, etc.). Analyse ses propositions en termes d'exactitude réglementaire, de méthodologie et de priorisation. Fournis un feedback constructif qui identifie les forces et faiblesses de son approche."
  },
  {
    id: 4,
    title: "Stratégie cybersécurité",
    theme: "Définir une stratégie cyber et sa feuille de route",
    systemPrompt: "Tu es un RSSI stratégique expérimenté. Tu dois évaluer la stratégie de cybersécurité proposée par un apprenant pour une entreprise. Analyse son plan en termes de vision, d'alignement avec les objectifs business, de priorisation et de réalisme. Fournis un feedback constructif qui met en évidence les forces de sa stratégie et les éléments à affiner."
  },
  {
    id: 5,
    title: "Gestion de crise cyber",
    theme: "Gestion de crise cyber",
    systemPrompt: "Tu es un expert en gestion de crise cybersécurité. Tu dois évaluer les décisions et actions d'un apprenant face à une simulation de cyberattaque. Analyse ses réponses en termes de rapidité, pertinence, coordination et communication. Fournis un feedback détaillé, précis et éducatif qui souligne les bonnes décisions et identifie les axes d'amélioration selon les frameworks reconnus (NIST, etc.)."
  },
  {
    id: 6,
    title: "Sécurité de la supply chain",
    theme: "La sécurité de la supply chain",
    systemPrompt: "Tu es un expert en sécurité de la chaîne d'approvisionnement informatique. Tu dois évaluer l'approche d'un apprenant pour sécuriser l'écosystème des fournisseurs d'une entreprise. Analyse ses propositions en termes d'évaluation des risques, de mesures techniques et contractuelles, et de monitoring continu. Fournis un feedback constructif qui met en lumière les bonnes pratiques identifiées et les aspects à renforcer."
  },
  {
    id: 7,
    title: "Identity & Access Management",
    theme: "L'IAM",
    systemPrompt: "Tu es un architecte IAM (Identity & Access Management) senior. Tu dois évaluer la conception IAM proposée par un apprenant pour une entreprise. Analyse son architecture en termes de sécurité, scalabilité, conformité au principe du moindre privilège et facilité d'administration. Fournis un feedback technique et précis qui reconnaît les bonnes pratiques et suggère des améliorations concrètes."
  },
  {
    id: 8,
    title: "Cybersécurité dans le cloud",
    theme: "La cybersécurité dans le cloud",
    systemPrompt: "Tu es un expert en sécurité cloud multi-environnements. Tu dois évaluer l'architecture cloud sécurisée proposée par un apprenant. Analyse sa conception en termes de défense en profondeur, segmentation, gestion des identités et détection des menaces. Fournis un feedback technique et détaillé qui identifie les forces de la solution et les vulnérabilités potentielles à corriger."
  },
  {
    id: 9,
    title: "Protection des données personnelles",
    theme: "Sécurisation des données personnelles",
    systemPrompt: "Tu es un expert en protection des données personnelles et RGPD. Tu dois évaluer le système de protection des données conçu par un apprenant pour un nouveau projet. Analyse sa solution en termes de conformité légale, mesures techniques de protection, gouvernance et processus de réponse aux incidents. Fournis un feedback détaillé qui valide les approches conformes et suggère des améliorations précises."
  },
  {
    id: 10,
    title: "Tests de pénétration et forensic",
    theme: "Analyse des vulnérabilités et tests de pénétration",
    systemPrompt: "Tu es un pentester senior spécialisé en red team et analyse forensique. Tu dois évaluer l'approche de test d'intrusion et d'investigation numérique d'un apprenant. Analyse sa méthodologie en termes de rigueur technique, couverture des vecteurs d'attaque, préservation des preuves et documentation. Fournis un feedback technique pointu qui reconnaît les bonnes pratiques et identifie les techniques avancées qu'il pourrait intégrer."
  }
];

/**
 * Étapes spécifiques pour le niveau 5 (Gestion de crise)
 */
const crisisManagementSteps = [
  {
    id: 1,
    title: "Détection de l'incident",
    prompt: "Tu es un expert en gestion de crise de cybersécurité. Analyse la réponse de l'utilisateur à la situation suivante : une attaque par ransomware vient d'être détectée un vendredi à 17h. Plusieurs systèmes critiques sont touchés. L'utilisateur propose l'action suivante comme première réponse : {{userResponse}}. Évalue cette réponse en considérant : 1) La pertinence face à l'urgence, 2) L'efficacité pour contenir la menace, 3) La conformité aux bonnes pratiques de gestion de crise cyber. Fournis un feedback constructif avec des points forts, des points d'amélioration, et une note sur 10. Ton analyse doit être éducative et précise."
  },
  {
    id: 2,
    title: "Activation de la cellule de crise",
    prompt: "Tu es un expert en gestion de crise de cybersécurité. Analyse la composition de l'équipe de crise proposée par l'utilisateur pour gérer une attaque par ransomware en cours. L'utilisateur a proposé : {{userResponse}}. Évalue cette réponse en considérant : 1) La pertinence des profils sélectionnés, 2) La couverture des compétences nécessaires (technique, communication, juridique, etc.), 3) La structure de commandement proposée, 4) La définition des objectifs immédiats. Fournis un feedback détaillé avec des points forts, des points d'amélioration et des recommandations spécifiques. Ton analyse doit être éducative et souligner l'importance d'une approche pluridisciplinaire dans la gestion de crise cyber."
  },
  {
    id: 3, 
    title: "Analyse et confinement",
    prompt: "Tu es un expert en cybersécurité spécialisé dans la réponse aux incidents. Analyse la stratégie de confinement et d'analyse forensique proposée par l'utilisateur face à une attaque de ransomware provenant d'un accès VPN compromis. L'utilisateur a proposé : {{userResponse}}. Évalue cette réponse en considérant : 1) L'efficacité des mesures de confinement, 2) Le respect des principes d'analyse forensique et de préservation des preuves, 3) L'équilibre entre isolement des systèmes et continuité des opérations, 4) La méthodologie d'investigation pour comprendre l'étendue de la compromission. Fournis un feedback détaillé avec des points forts, des points d'amélioration, et des conseils pratiques spécifiques. Intègre des éléments techniques précis tout en restant pédagogique."
  },
  {
    id: 4,
    title: "Communication et notification",
    prompt: "Tu es un expert en communication de crise cybersécurité. Analyse le plan de communication proposé par l'utilisateur suite à une attaque par ransomware avec probable exfiltration de données clients. L'utilisateur a proposé : {{userResponse}}. Évalue cette stratégie en considérant : 1) L'identification exhaustive des parties prenantes à informer, 2) Le timing et la priorisation des communications, 3) Le contenu et le ton des messages pour chaque audience, 4) La conformité aux obligations réglementaires (RGPD, etc.), 5) La gestion de la réputation et la transparence. Fournis un feedback détaillé avec des points forts, des points d'amélioration, et des exemples concrets de formulations adaptées. Souligne l'importance de l'équilibre entre transparence et maîtrise de l'information dans un contexte de crise."
  },
  {
    id: 5,
    title: "Décision critique : la rançon",
    prompt: "Tu es un expert en éthique et stratégie de cybersécurité. Analyse la position de l'utilisateur concernant le paiement d'une rançon de 2 millions d'euros suite à une attaque par ransomware avec menace de publication de données sensibles. L'utilisateur recommande : {{userResponse}}. Évalue cette recommandation en considérant : 1) Les implications éthiques et légales, 2) Les conséquences pratiques sur la restauration et la confidentialité des données, 3) Les précédents et statistiques concernant l'efficacité du paiement, 4) Les alternatives proposées et leur faisabilité. Fournis une analyse nuancée qui présente les arguments en faveur et contre cette position, sans jugement tranché, car il n'existe pas de réponse parfaite à ce dilemme. Souligne les facteurs contextuels qui peuvent influencer cette décision et les mesures complémentaires à prendre quelle que soit l'option choisie."
  },
  {
    id: 6,
    title: "Plan de reprise d'activité",
    prompt: "Tu es un expert en continuité d'activité et reprise après sinistre informatique. Analyse le plan de reprise proposé par l'utilisateur suite à une attaque par ransomware ayant touché des systèmes critiques. L'utilisateur a élaboré le plan suivant : {{userResponse}}. Évalue ce plan en considérant : 1) La méthodologie de priorisation des systèmes (critères business vs techniques), 2) Le réalisme des délais estimés, 3) L'identification et l'allocation des ressources nécessaires, 4) La gestion des dépendances entre systèmes, 5) Les mesures de validation/sécurisation des systèmes restaurés. Fournis un feedback constructif avec des points forts, des suggestions d'amélioration, et des recommandations concrètes basées sur les meilleures pratiques du domaine (NIST, ISO 27001, etc.). Ton analyse doit être à la fois technique et orientée business pour refléter les enjeux multidimensionnels de la reprise d'activité."
  },
  {
    id: 7,
    title: "Leçons apprises et amélioration",
    prompt: "Tu es un consultant senior en cybersécurité spécialisé dans l'analyse post-incident. Analyse le rapport d'amélioration proposé par l'utilisateur suite à une attaque par ransomware ayant exploité un accès VPN compromis. L'utilisateur a identifié les failles suivantes et proposé ces améliorations : {{userResponse}}. Évalue cette analyse en considérant : 1) La pertinence des failles identifiées (cause racine vs symptômes), 2) L'exhaustivité de l'analyse technique et organisationnelle, 3) Le réalisme et la priorisation des mesures proposées, 4) L'alignement avec les standards de l'industrie (NIST, CIS, etc.), 5) La prise en compte de la dimension humaine et des processus. Fournis un feedback détaillé avec une évaluation des points forts, des angles morts potentiels, et des recommandations complémentaires. Ton analyse doit être stratégique tout en incluant des mesures concrètes et techniquement précises, organisées en actions à court, moyen et long terme."
  }
];

/**
 * Construire un prompt dynamique basé sur le niveau et l'étape
 */
function buildPrompt(levelId: number, stepId: number, userResponse: string): string {
  // Cas spécial pour le niveau 5 (Gestion de crise)
  if (levelId === 5 && stepId >= 1 && stepId <= crisisManagementSteps.length) {
    const stepPrompt = crisisManagementSteps[stepId - 1].prompt;
    return stepPrompt.replace('{{userResponse}}', userResponse);
  }
  
  // Pour les autres niveaux, utiliser le prompt système général du niveau
  const level = ascensionLevels.find(l => l.id === levelId);
  if (!level) {
    return "Évalue la réponse suivante de manière constructive et éducative : " + userResponse;
  }
  
  return `${level.systemPrompt}\n\nLa réponse de l'apprenant est : "${userResponse}"\n\nFournis une analyse détaillée avec points forts, points d'amélioration et recommandations.`;
}

/**
 * Analyser la réponse d'un utilisateur avec Azure OpenAI
 */
export async function analyzeUserResponse(req: Request, res: Response) {
  try {
    const { levelId, stepId, userResponse, context } = req.body as UserResponseAnalysisRequest;
    
    if (!userResponse || !levelId) {
      return res.status(400).json({
        success: false,
        message: "La réponse utilisateur et l'ID du niveau sont requis"
      });
    }
    
    // Construire le prompt approprié
    const systemPrompt = buildPrompt(levelId, stepId || 1, userResponse);
    
    // Appel à Azure OpenAI
    const result = await openai.chat.completions.create({
      model: deploymentName,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userResponse }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });
    
    if (!result.choices || result.choices.length === 0) {
      return res.status(500).json({
        success: false,
        message: "Aucune réponse générée par l'IA"
      });
    }
    
    // Récupérer la réponse
    const aiResponse = result.choices[0].message?.content || "";
    
    return res.status(200).json({
      success: true,
      analysis: aiResponse,
      levelId,
      stepId: stepId || 1
    });
    
  } catch (error: any) {
    console.error("Erreur lors de l'analyse de la réponse utilisateur:", error);
    return res.status(500).json({
      success: false,
      message: "Une erreur est survenue lors de l'analyse de la réponse",
      error: error.message
    });
  }
}

/**
 * Récupérer les informations d'un niveau
 */
export async function getLevelInfo(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const levelId = parseInt(id);
    
    if (isNaN(levelId)) {
      return res.status(400).json({
        success: false,
        message: "ID de niveau invalide"
      });
    }
    
    const level = ascensionLevels.find(l => l.id === levelId);
    
    if (!level) {
      return res.status(404).json({
        success: false,
        message: "Niveau non trouvé"
      });
    }
    
    // Si c'est le niveau 5, ajouter les étapes spécifiques
    let steps: Array<{id: number, title: string}> = [];
    if (levelId === 5) {
      steps = crisisManagementSteps.map(step => ({
        id: step.id,
        title: step.title
      }));
    }
    
    return res.status(200).json({
      success: true,
      level: {
        id: level.id,
        title: level.title,
        theme: level.theme,
        steps: steps
      }
    });
    
  } catch (error: any) {
    console.error("Erreur lors de la récupération des informations du niveau:", error);
    return res.status(500).json({
      success: false,
      message: "Une erreur est survenue lors de la récupération des informations du niveau",
      error: error.message
    });
  }
}

/**
 * Générer un scénario dynamique pour un niveau
 */
export async function generateScenario(req: Request, res: Response) {
  try {
    const { levelId, difficulty } = req.body;
    
    if (!levelId) {
      return res.status(400).json({
        success: false,
        message: "L'ID du niveau est requis"
      });
    }
    
    const level = ascensionLevels.find(l => l.id === levelId);
    
    if (!level) {
      return res.status(404).json({
        success: false,
        message: "Niveau non trouvé"
      });
    }
    
    // Construire le prompt pour générer un scénario
    const systemPrompt = `Tu es un créateur de scénarios de formation en cybersécurité spécialisé en ${level.theme}. 
    Crée un scénario d'apprentissage réaliste, immersif et détaillé pour une simulation interactive.
    
    Le scénario doit inclure:
    1. Contexte d'entreprise réaliste (nom, secteur, taille)
    2. Situation initiale et défi à relever
    3. Ressources disponibles pour l'apprenant
    4. Contraintes et difficultés spécifiques
    5. Objectifs pédagogiques clairs
    
    La difficulté doit être de niveau: ${difficulty || 'intermédiaire'}.
    
    Réponds au format JSON structuré comme suit:
    {
      "title": "Titre du scénario",
      "context": {
        "companyName": "Nom de l'entreprise fictive",
        "sector": "Secteur d'activité",
        "size": "Taille (PME, grande entreprise, etc.)",
        "background": "Contexte détaillé de la situation"
      },
      "challenge": {
        "description": "Description du défi à relever",
        "initialSituation": "Situation de départ",
        "objectives": ["Objectif 1", "Objectif 2", "etc."]
      },
      "resources": ["Ressource 1", "Ressource 2", "etc."],
      "constraints": ["Contrainte 1", "Contrainte 2", "etc."],
      "learningObjectives": ["Objectif pédagogique 1", "Objectif pédagogique 2", "etc."]
    }`;
    
    // Appel à Azure OpenAI
    const result = await openai.chat.completions.create({
      model: deploymentName,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Génère un scénario de formation en ${level.theme} de difficulté ${difficulty || 'intermédiaire'}.` }
      ],
      temperature: 0.8,
      max_tokens: 1500,
      response_format: { type: "json_object" }
    });
    
    if (!result.choices || result.choices.length === 0) {
      return res.status(500).json({
        success: false,
        message: "Aucun scénario généré par l'IA"
      });
    }
    
    // Récupérer la réponse et la parser en JSON
    const scenarioString = result.choices[0].message?.content || "{}";
    const scenario = JSON.parse(scenarioString);
    
    return res.status(200).json({
      success: true,
      scenario,
      levelId
    });
    
  } catch (error: any) {
    console.error("Erreur lors de la génération du scénario:", error);
    return res.status(500).json({
      success: false,
      message: "Une erreur est survenue lors de la génération du scénario",
      error: error.message
    });
  }
}

/**
 * Évaluer la performance globale d'un utilisateur sur un niveau
 */
export async function evaluatePerformance(req: Request, res: Response) {
  try {
    const { levelId, userResponses } = req.body;
    
    if (!levelId || !userResponses || !Array.isArray(userResponses)) {
      return res.status(400).json({
        success: false,
        message: "L'ID du niveau et les réponses utilisateur (tableau) sont requis"
      });
    }
    
    const level = ascensionLevels.find(l => l.id === levelId);
    
    if (!level) {
      return res.status(404).json({
        success: false,
        message: "Niveau non trouvé"
      });
    }
    
    // Construire le prompt pour l'évaluation globale
    const systemPrompt = `Tu es un expert en évaluation de compétences en cybersécurité, spécialisé en ${level.theme}.
    Évalue la performance globale d'un apprenant sur la base de ses réponses à différentes étapes d'un scénario.
    
    Les réponses de l'apprenant sont les suivantes:
    ${userResponses.map((r, i) => `Étape ${i+1}: "${r}"`).join('\n\n')}
    
    Fournis une évaluation détaillée au format JSON structuré comme suit:
    {
      "overallScore": 85, // Note globale sur 100
      "strengthAreas": ["Point fort 1", "Point fort 2", "etc."],
      "improvementAreas": ["Axe d'amélioration 1", "Axe d'amélioration 2", "etc."],
      "skillsGained": {
        "competence1": 25, // Points gagnés dans cette compétence
        "competence2": 15,
        "etc": 10
      },
      "feedback": "Feedback global détaillé qui résume les forces et axes d'amélioration",
      "recommendedResources": ["Ressource 1", "Ressource 2", "etc."]
    }`;
    
    // Appel à Azure OpenAI
    const result = await openai.chat.completions.create({
      model: deploymentName,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Évalue mes performances dans le scénario de ${level.theme}.` }
      ],
      temperature: 0.7,
      max_tokens: 1500,
      response_format: { type: "json_object" }
    });
    
    if (!result.choices || result.choices.length === 0) {
      return res.status(500).json({
        success: false,
        message: "Aucune évaluation générée par l'IA"
      });
    }
    
    // Récupérer la réponse et la parser en JSON
    const evaluationString = result.choices[0].message?.content || "{}";
    const evaluation = JSON.parse(evaluationString);
    
    return res.status(200).json({
      success: true,
      evaluation,
      levelId
    });
    
  } catch (error: any) {
    console.error("Erreur lors de l'évaluation de la performance:", error);
    return res.status(500).json({
      success: false,
      message: "Une erreur est survenue lors de l'évaluation de la performance",
      error: error.message
    });
  }
}

/**
 * Générer une recommendation personnalisée de ressources d'apprentissage
 */
export async function generateLearningRecommendations(req: Request, res: Response) {
  try {
    const { userId, skillAreas } = req.body;
    
    if (!userId || !skillAreas || !Array.isArray(skillAreas)) {
      return res.status(400).json({
        success: false,
        message: "L'ID utilisateur et les domaines de compétences (tableau) sont requis"
      });
    }
    
    // Construire le prompt pour les recommandations
    const systemPrompt = `Tu es un coach expert en cybersécurité et formation professionnelle.
    Crée un plan d'apprentissage personnalisé pour un apprenant qui souhaite renforcer ses compétences dans les domaines suivants: ${skillAreas.join(', ')}.
    
    Fournis des recommandations détaillées au format JSON structuré comme suit:
    {
      "learningPath": {
        "title": "Titre du parcours personnalisé",
        "description": "Description du parcours",
        "duration": "Durée estimée (ex: 3 mois)"
      },
      "recommendedResources": [
        {
          "title": "Titre de la ressource",
          "type": "Type (livre, cours en ligne, atelier, certification, etc.)",
          "description": "Description courte",
          "difficulty": "Niveau de difficulté",
          "estimatedTimeToComplete": "Temps estimé",
          "keyBenefits": ["Bénéfice 1", "Bénéfice 2"]
        },
        // Autres ressources...
      ],
      "suggestedSchedule": {
        "week1": "Activités recommandées semaine 1",
        "week2": "Activités recommandées semaine 2",
        // etc.
      },
      "milestones": [
        {
          "title": "Titre du jalon",
          "description": "Description",
          "evaluationMethod": "Méthode d'évaluation"
        },
        // Autres jalons...
      ]
    }`;
    
    // Appel à Azure OpenAI
    const result = await openai.chat.completions.create({
      model: deploymentName,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Je souhaite améliorer mes compétences en ${skillAreas.join(', ')}. Quelles ressources me recommandes-tu?` }
      ],
      temperature: 0.7,
      max_tokens: 1500,
      response_format: { type: "json_object" }
    });
    
    if (!result.choices || result.choices.length === 0) {
      return res.status(500).json({
        success: false,
        message: "Aucune recommandation générée par l'IA"
      });
    }
    
    // Récupérer la réponse et la parser en JSON
    const recommendationsString = result.choices[0].message?.content || "{}";
    const recommendations = JSON.parse(recommendationsString);
    
    return res.status(200).json({
      success: true,
      recommendations,
      userId
    });
    
  } catch (error: any) {
    console.error("Erreur lors de la génération des recommandations:", error);
    return res.status(500).json({
      success: false,
      message: "Une erreur est survenue lors de la génération des recommandations",
      error: error.message
    });
  }
}