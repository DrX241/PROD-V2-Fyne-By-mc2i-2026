import { Request, Response } from 'express';
import { 
  AmoaScenario, 
  AmoaMessage, 
  AmoaDecision, 
  Stakeholder, 
  AmoaPhase,
  DecisionOption
} from '../shared/types/amoa';
import { v4 as uuidv4 } from 'uuid';
import { ChatCompletionRequestMessage } from '../shared/schema';
import { OpenAI } from 'openai';
import { OPENAI_API_KEY } from './env';

// Configurations pour Azure OpenAI
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY || '',
  baseURL: 'https://mc2i-openai.openai.azure.com/openai/deployments',
  defaultQuery: { 'api-version': '2023-12-01-preview' },
  defaultHeaders: { 'api-key': OPENAI_API_KEY || '' },
});

interface AmoaChatRequest {
  userMessage: string;
  scenarioId: string;
  scenarioContext: AmoaScenario;
  currentPhase: AmoaPhase;
  previousMessages: AmoaMessage[];
  targetStakeholder?: string;
  temperature?: number;
  maxTokens?: number;
}

interface AmoaEvaluateDecisionRequest {
  scenarioId: string;
  scenarioContext: AmoaScenario;
  decisionId: string;
  choiceId: string;
  currentPhase: AmoaPhase;
  userRole: string;
}

interface AmoaChatResponse {
  response: string;
  sender: string;
  senderRole: string;
  additionalResponse?: {
    response: string;
    sender: string;
    senderRole: string;
  };
  decision?: AmoaDecision;
}

interface AmoaEvaluationResponse {
  evaluation: string;
  evaluator: string;
  evaluatorRole: string;
  impact: {
    positive: string[];
    negative: string[];
  };
  score: number;
  updatedScenario: AmoaScenario;
}

const DEFAULT_MAX_TOKENS = 500;
const DEFAULT_TEMPERATURE = 0.7;

// Mappage des compétences par phase
const phaseSkillsMapping: Record<AmoaPhase, string[]> = {
  initialisation: ['Gestion des parties prenantes', 'Analyse contextuelle', 'Planification de projet'],
  recueil_besoins: ['Analyse des besoins', 'Techniques d\'interview', 'Documentation des exigences'],
  analyse: ['Analyse fonctionnelle', 'Modélisation', 'Priorisation des besoins'],
  conception: ['Rédaction de spécifications', 'Architecture de solution', 'Prototypage'],
  developpement: ['Gestion des développements', 'Revue de code', 'Intégration technique'],
  tests: ['Conception de tests', 'Gestion des anomalies', 'Validation des exigences'],
  deploiement: ['Conduite du changement', 'Formation', 'Communication projet']
};

/**
 * Gérer les requêtes de chat AMOA
 */
export async function handleAmoaChat(req: Request, res: Response) {
  try {
    const {
      userMessage,
      scenarioId,
      scenarioContext,
      currentPhase,
      previousMessages,
      targetStakeholder,
      temperature = DEFAULT_TEMPERATURE,
      maxTokens = DEFAULT_MAX_TOKENS
    }: AmoaChatRequest = req.body;

    // Sélectionner une partie prenante appropriée pour répondre
    let stakeholder = targetStakeholder
      ? findStakeholderByName(scenarioContext.stakeholders, targetStakeholder)
      : selectAppropriateStakeholder(scenarioContext.stakeholders, userMessage, currentPhase);

    if (!stakeholder) {
      // Fallback à la première partie prenante si aucune n'a été trouvée
      stakeholder = scenarioContext.stakeholders[0];
    }

    // Générer le prompt système
    const systemPrompt = generateAmoaSystemPrompt({
      scenario: scenarioContext,
      currentPhase,
      stakeholder,
      previousMessages
    });

    // Préparer les messages pour l'IA
    const messages: ChatCompletionRequestMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ];

    // Faire la requête à l'IA
    const response = await openai.chat.completions.create({
      model: 'Eddy-deploy-20-02-2025-gpt-4o',
      max_tokens: maxTokens,
      temperature: temperature,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ]
    });

    // Générer éventuellement une réponse supplémentaire d'une autre partie prenante
    let additionalResponse = null;
    const shouldAddSecondResponse = Math.random() > 0.65; // 35% de chance d'avoir une seconde réponse
    
    if (shouldAddSecondResponse) {
      const secondStakeholder = selectDifferentStakeholder(scenarioContext.stakeholders, stakeholder.name);
      
      if (secondStakeholder) {
        const additionalContent = generateAdditionalResponse(
          userMessage, 
          response.choices[0].message.content || "", 
          secondStakeholder
        );
        
        additionalResponse = {
          response: additionalContent,
          sender: secondStakeholder.name,
          senderRole: secondStakeholder.role
        };
      }
    }

    // Déterminer si une décision doit être présentée
    let decision = undefined;
    if (checkIfDecisionNeeded(userMessage, currentPhase, scenarioContext)) {
      decision = selectRelevantDecision(scenarioContext, currentPhase);
    }

    // Construire la réponse
    const result: AmoaChatResponse = {
      response: response.choices[0].message.content || "Désolé, je n'ai pas pu générer une réponse appropriée.",
      sender: stakeholder.name,
      senderRole: stakeholder.role,
      additionalResponse: additionalResponse || undefined,
      decision
    };

    res.json(result);
  } catch (error) {
    console.error('Error in handleAmoaChat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Évaluer une décision prise par l'utilisateur
 */
export async function evaluateAmoaDecision(req: Request, res: Response) {
  try {
    const {
      scenarioId,
      scenarioContext,
      decisionId,
      choiceId,
      currentPhase,
      userRole
    }: AmoaEvaluateDecisionRequest = req.body;

    // Trouver la décision concernée
    const decision = scenarioContext.decisions?.find(d => d.id === decisionId);
    if (!decision) {
      return res.status(404).json({ error: 'Decision not found' });
    }
    
    // Trouver l'option choisie
    const chosenOption = decision.options.find(o => o.id === choiceId);
    if (!chosenOption) {
      return res.status(404).json({ error: 'Option not found' });
    }

    // Sélectionner un évaluateur approprié
    const evaluator = selectAppropriateEvaluator(scenarioContext.stakeholders, currentPhase);

    // Générer le prompt d'évaluation
    const evaluationPrompt = generateEvaluationSystemPrompt({
      scenario: scenarioContext,
      decision,
      chosenOption,
      evaluator,
      userRole
    });

    // Demander à l'IA d'évaluer la décision
    const response = await openai.chat.completions.create({
      model: 'Eddy-deploy-20-02-2025-gpt-4o',
      max_tokens: 800,
      temperature: 0.7,
      messages: [
        { role: 'system', content: evaluationPrompt },
        { role: 'user', content: `Évalue ma décision: ${chosenOption.text}` }
      ]
    });

    // Analyser la réponse pour extraire l'évaluation et les impacts
    const evaluation = response.choices[0].message.content || "Évaluation non disponible.";
    
    // Mettre à jour le scénario avec la décision prise
    const updatedScenario = { ...scenarioContext };
    
    // Mettre à jour la décision avec l'option choisie
    if (updatedScenario.decisions) {
      const decisionIndex = updatedScenario.decisions.findIndex(d => d.id === decisionId);
      if (decisionIndex !== -1) {
        updatedScenario.decisions[decisionIndex] = {
          ...updatedScenario.decisions[decisionIndex],
          selectedOption: choiceId,
          madeAt: new Date().toISOString(),
          evaluation: evaluation
        };
      }
    }
    
    // Progresser dans le scénario si applicable
    if (Math.random() > 0.5) { // 50% de chance d'avancer dans le scénario
      const phaseOrder: AmoaPhase[] = [
        'initialisation', 
        'recueil_besoins', 
        'analyse', 
        'conception', 
        'developpement', 
        'tests', 
        'deploiement'
      ];
      
      const currentPhaseIndex = phaseOrder.indexOf(updatedScenario.currentPhase);
      if (currentPhaseIndex >= 0 && currentPhaseIndex < phaseOrder.length - 1) {
        updatedScenario.currentPhase = phaseOrder[currentPhaseIndex + 1];
      }
    }
    
    // Mettre à jour la progression
    const completedObjectives = updatedScenario.objectives.filter(obj => obj.completed).length;
    const randomObjective = updatedScenario.objectives.find(obj => !obj.completed);
    
    if (randomObjective) {
      const objectiveIndex = updatedScenario.objectives.findIndex(obj => obj.id === randomObjective.id);
      if (objectiveIndex !== -1) {
        updatedScenario.objectives[objectiveIndex] = {
          ...randomObjective,
          completed: true,
          completedAt: new Date().toISOString()
        };
      }
    }
    
    // Recalculer la progression
    const newCompletedObjectives = updatedScenario.objectives.filter(obj => obj.completed).length;
    const totalObjectives = updatedScenario.objectives.length;
    const newProgress = Math.round((newCompletedObjectives / totalObjectives) * 100);
    updatedScenario.progress = newProgress;
    
    // Améliorer une compétence aléatoire liée à la phase actuelle
    if (updatedScenario.skillsProgress) {
      const phaseSkills = phaseSkillsMapping[currentPhase] || [];
      const relevantSkills = updatedScenario.skillsProgress.filter(skill => 
        phaseSkills.some(phaseSkill => skill.name.includes(phaseSkill))
      );
      
      const skillToImprove = relevantSkills.length > 0 
        ? relevantSkills[Math.floor(Math.random() * relevantSkills.length)]
        : updatedScenario.skillsProgress[Math.floor(Math.random() * updatedScenario.skillsProgress.length)];
      
      if (skillToImprove) {
        const skillIndex = updatedScenario.skillsProgress.findIndex(s => s.id === skillToImprove.id);
        if (skillIndex !== -1) {
          // Gain de points basé sur la qualité de la décision (simulée ici de manière aléatoire)
          const skillGain = Math.floor(Math.random() * 5) + 3; // Gain entre 3 et 8 points
          
          updatedScenario.skillsProgress[skillIndex] = {
            ...updatedScenario.skillsProgress[skillIndex],
            level: Math.min(100, updatedScenario.skillsProgress[skillIndex].level + skillGain)
          };
        }
      }
    }

    // Extraire les impacts positifs et négatifs (simulés ici)
    const positiveImpacts = [
      "Meilleure compréhension des besoins des parties prenantes",
      "Amélioration de l'engagement des utilisateurs",
      "Gain d'expérience en prise de décision stratégique"
    ];
    
    const negativeImpacts = [
      "Nécessite une attention particulière aux détails de mise en œuvre",
      "Pourrait créer des attentes élevées qu'il faudra satisfaire"
    ];

    // Construire la réponse
    const result: AmoaEvaluationResponse = {
      evaluation: evaluation,
      evaluator: evaluator.name,
      evaluatorRole: evaluator.role,
      impact: {
        positive: positiveImpacts,
        negative: negativeImpacts
      },
      score: 7, // Score fictif sur 10
      updatedScenario
    };

    res.json(result);
  } catch (error) {
    console.error('Error in evaluateAmoaDecision:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Fonctions utilitaires

function findStakeholderByName(stakeholders: Stakeholder[], name: string): Stakeholder {
  const stakeholder = stakeholders.find(s => s.name === name);
  return stakeholder || stakeholders[0];
}

function selectAppropriateStakeholder(stakeholders: Stakeholder[], message: string, phase: AmoaPhase): Stakeholder {
  // Logique simplifiée pour la sélection d'une partie prenante basée sur le message et la phase
  
  // Priorité aux parties prenantes avec haute disponibilité
  const availableStakeholders = stakeholders.filter(s => s.availabilityLevel === 'haute');
  
  if (availableStakeholders.length > 0) {
    return availableStakeholders[Math.floor(Math.random() * availableStakeholders.length)];
  }
  
  // Sinon, sélection aléatoire
  return stakeholders[Math.floor(Math.random() * stakeholders.length)];
}

function selectAppropriateEvaluator(stakeholders: Stakeholder[], phase: AmoaPhase): Stakeholder {
  // Pour l'évaluation, prioriser les parties prenantes avec personnalité analytique ou directive
  const potentialEvaluators = stakeholders.filter(
    s => s.personality === 'analytique' || s.personality === 'directif'
  );
  
  if (potentialEvaluators.length > 0) {
    return potentialEvaluators[Math.floor(Math.random() * potentialEvaluators.length)];
  }
  
  // Sinon, sélection aléatoire
  return stakeholders[Math.floor(Math.random() * stakeholders.length)];
}

function selectDifferentStakeholder(stakeholders: Stakeholder[], excludeName: string): Stakeholder | undefined {
  const filteredStakeholders = stakeholders.filter(s => s.name !== excludeName);
  
  if (filteredStakeholders.length === 0) {
    return undefined;
  }
  
  return filteredStakeholders[Math.floor(Math.random() * filteredStakeholders.length)];
}

function generateAdditionalResponse(userMessage: string, mainResponse: string, stakeholder: Stakeholder): string {
  // Logique simplifiée pour générer une réponse complémentaire
  // Dans un système réel, cela pourrait également utiliser une IA
  
  const responseTemplates = [
    `En complément de ce qui a été dit, je voudrais ajouter que du point de vue ${stakeholder.department}, il est important de considérer...`,
    `Je suis d'accord avec ce qui précède, mais j'aimerais insister sur l'aspect ${stakeholder.priorities[0]} qui est crucial pour notre réussite.`,
    `Si je peux me permettre d'intervenir, en tant que ${stakeholder.role}, je pense que nous devrions également prendre en compte...`,
    `Je souhaite apporter une précision concernant ${userMessage.substring(0, 20)}... Du point de vue ${stakeholder.department}, cela implique...`
  ];
  
  const selectedTemplate = responseTemplates[Math.floor(Math.random() * responseTemplates.length)];
  
  // Personnaliser la réponse en fonction du type de personnalité
  let personalityStyle = "";
  
  switch (stakeholder.personality) {
    case 'analytique':
      personalityStyle = "En analysant les données disponibles, je pense que nous devrions considérer tous les aspects avant de prendre une décision.";
      break;
    case 'directif':
      personalityStyle = "Je suggère que nous avancions rapidement sur ce point pour ne pas perdre de temps.";
      break;
    case 'expressif':
      personalityStyle = "C'est une excellente opportunité pour innover et sortir des sentiers battus!";
      break;
    case 'aimable':
      personalityStyle = "Je pense qu'il est important de prendre en compte l'avis de chacun pour avancer ensemble.";
      break;
  }
  
  return `${selectedTemplate} ${personalityStyle}`;
}

function checkIfDecisionNeeded(userMessage: string, phase: AmoaPhase, scenario: AmoaScenario): boolean {
  // Vérifier si une décision doit être présentée
  // Logique simplifiée: présenter une décision après certains mots-clés ou aléatoirement
  
  const decisionKeywords = [
    'décider', 'choisir', 'option', 'alternative', 'préférence',
    'recommandation', 'conseil', 'avis', 'approche', 'stratégie'
  ];
  
  // Vérifier si le message contient des mots-clés de décision
  const containsDecisionKeyword = decisionKeywords.some(keyword => 
    userMessage.toLowerCase().includes(keyword)
  );
  
  // Vérifier s'il reste des décisions non prises
  const hasUnmadeDecisions = scenario.decisions?.some(d => !d.selectedOption) || false;
  
  // Présenter une décision si des mots-clés sont présents ou aléatoirement (10% de chance)
  return hasUnmadeDecisions && (containsDecisionKeyword || Math.random() < 0.1);
}

function selectRelevantDecision(scenario: AmoaScenario, phase: AmoaPhase): AmoaDecision | undefined {
  // Sélectionner une décision pertinente non encore prise
  const unmadeDecisions = scenario.decisions?.filter(d => !d.selectedOption) || [];
  
  if (unmadeDecisions.length === 0) {
    return undefined;
  }
  
  return unmadeDecisions[0]; // Simplification: prendre la première décision disponible
}

function generateAmoaSystemPrompt(config: {
  scenario: AmoaScenario;
  currentPhase: AmoaPhase;
  stakeholder: Stakeholder;
  previousMessages: AmoaMessage[];
}): string {
  const { scenario, currentPhase, stakeholder, previousMessages } = config;
  
  // Contexte du scenario
  const context = `
# Contexte du Scénario
${scenario.context}

# Phase actuelle du projet
${currentPhase.replace('_', ' ')}

# Objectifs du projet
${scenario.objectives.map(obj => `- ${obj.text} ${obj.completed ? '(Complété)' : '(En cours)'}`).join('\n')}
`;

  // Informations sur la partie prenante qui répond
  const stakeholderInfo = `
# Votre rôle
Vous êtes ${stakeholder.name}, ${stakeholder.role} dans le département ${stakeholder.department}.

# Votre personnalité
Vous avez une personnalité de type "${stakeholder.personality}".

# Vos priorités
${stakeholder.priorities.map(p => `- ${p}`).join('\n')}

# Votre expertise
${stakeholder.expertise.map(e => `- ${e}`).join('\n')}
`;

  // Instructions de comportement
  const behaviorInstructions = `
# Instructions de comportement
1. Répondez toujours en tant que ${stakeholder.name}, en utilisant le "je" et en restant fidèle à votre personnalité et à vos priorités.
2. Votre expertise est limitée à vos domaines de compétence indiqués ci-dessus.
3. Votre disponibilité est ${stakeholder.availabilityLevel}, ce qui signifie que ${
    stakeholder.availabilityLevel === 'haute' 
      ? "vous êtes très impliqué dans le projet et répondez de manière détaillée."
      : stakeholder.availabilityLevel === 'moyenne'
      ? "vous êtes impliqué mais pouvez parfois être bref ou demander de reporter certaines discussions."
      : "vous êtes peu disponible et préférez des discussions courtes et allant à l'essentiel."
  }
4. Adaptez votre ton et style à votre personnalité:
   - Analytique: factuel, détaillé, basé sur des données, pose des questions pour comprendre
   - Directif: décisif, orienté résultats, va à l'essentiel, peut sembler autoritaire
   - Expressif: enthousiaste, créatif, aime partager des idées nouvelles, peut être verbeux
   - Aimable: collaboratif, diplomate, cherche le consensus, évite les conflits

5. N'inventez pas d'information factuelle qui ne serait pas présente dans le contexte.
6. Faites des réponses de 2 à 4 paragraphes, adaptées à votre niveau de disponibilité.
7. Si pertinent, n'hésitez pas à faire référence aux documents du projet.
`;

  // Phase spécifique
  const phaseSpecificInstructions: Record<AmoaPhase, string[]> = {
    initialisation: [
      "Vous êtes en phase d'initialisation du projet.",
      "Concentrez-vous sur la compréhension du contexte, l'identification des parties prenantes et la définition du périmètre.",
      "Discutez des objectifs généraux et des contraintes principales."
    ],
    recueil_besoins: [
      "Vous êtes en phase de recueil des besoins.",
      "Concentrez-vous sur l'identification et la formalisation des exigences fonctionnelles et non-fonctionnelles.",
      "Discutez des utilisateurs, des cas d'usage et des contraintes métier."
    ],
    analyse: [
      "Vous êtes en phase d'analyse.",
      "Concentrez-vous sur l'étude approfondie des besoins recueillis et leur priorisation.",
      "Discutez des dépendances, des risques et des solutions possibles."
    ],
    conception: [
      "Vous êtes en phase de conception.",
      "Concentrez-vous sur la définition de l'architecture de la solution et des spécifications détaillées.",
      "Discutez des choix techniques, des interfaces et des flux de données."
    ],
    developpement: [
      "Vous êtes en phase de développement.",
      "Concentrez-vous sur le suivi de l'avancement et la gestion des problèmes techniques.",
      "Discutez des adaptations nécessaires et de la qualité du code."
    ],
    tests: [
      "Vous êtes en phase de tests.",
      "Concentrez-vous sur la vérification de la qualité et de la conformité de la solution.",
      "Discutez des anomalies, des corrections et des critères d'acceptation."
    ],
    deploiement: [
      "Vous êtes en phase de déploiement.",
      "Concentrez-vous sur la mise en production et l'accompagnement des utilisateurs.",
      "Discutez de la formation, de la documentation et du support."
    ]
  };
  
  const phaseInstructions = `
# Instructions spécifiques à la phase actuelle
${phaseSpecificInstructions[currentPhase].join('\n')}
`;

  // Historique de conversation (si disponible)
  let conversationHistory = "";
  if (previousMessages && previousMessages.length > 0) {
    conversationHistory = `
# Historique récent de la conversation
${previousMessages.map(msg => 
  `${msg.role === 'user' ? 'Utilisateur' : msg.sender || 'Assistant'}: ${msg.content.substring(0, 100)}${msg.content.length > 100 ? '...' : ''}`
).join('\n')}
`;
  }

  // Assemblage du prompt complet
  return `
Tu es un assistant virtuel simulant une partie prenante dans un projet informatique, dans le contexte d'une formation pour les Assistants à Maîtrise d'Ouvrage (AMOA).
${context}
${stakeholderInfo}
${behaviorInstructions}
${phaseInstructions}
${conversationHistory}
`;
}

function generateEvaluationSystemPrompt(config: {
  scenario: AmoaScenario;
  decision: AmoaDecision;
  chosenOption: DecisionOption;
  evaluator: Stakeholder;
  userRole: string;
}): string {
  const { scenario, decision, chosenOption, evaluator, userRole } = config;
  
  return `
Tu es un assistant virtuel qui évalue les décisions prises par un apprenant dans une simulation de projet informatique pour la formation des Assistants à Maîtrise d'Ouvrage (AMOA).

# Contexte du scénario
${scenario.context}

# Décision à évaluer
${decision.description}
${decision.context}

# Option choisie par l'utilisateur
${chosenOption.text}

# Informations sur l'évaluateur
Tu dois répondre en tant que ${evaluator.name}, ${evaluator.role} dans le département ${evaluator.department}.
Personnalité: ${evaluator.personality}
Priorités: ${evaluator.priorities.join(', ')}

# Instructions d'évaluation
1. Vous devez évaluer la décision de l'apprenant (${userRole}) de manière constructive.
2. Commencez par une appréciation générale de la décision.
3. Analysez les points forts et les implications positives de cette décision.
4. Analysez les points d'attention et les risques potentiels.
5. Proposez des conseils pour maximiser les bénéfices et minimiser les risques de cette décision.
6. Concluez par un encouragement positif.
7. Utilisez le "je" et adaptez votre ton à votre personnalité (analytique, directif, expressif ou aimable).
8. Votre réponse doit faire environ 3-4 paragraphes.

# Format de réponse attendu
Rédigez une évaluation constructive et formatrice qui aidera l'apprenant à progresser dans sa compréhension du rôle d'AMOA.
`;
}