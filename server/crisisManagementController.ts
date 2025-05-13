import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { openAIService } from "./services/openai";
import { ChatCompletionRequestMessage } from "@shared/schema";

// Interface pour les sessions de gestion de crise
interface CrisisSession {
  sessionId: string;
  userId: string;
  scenario: CrisisScenario;
  currentStage: number;
  timeline: TimelineEvent[];
  decisions: DecisionRecord[];
  resources: ResourceAllocation;
  metrics: CrisisMetrics;
  messages: ChatCompletionRequestMessage[];
  status: 'active' | 'paused' | 'completed';
  startTime: number;
  elapsedTime: number;
  pausedAt?: number;
}

// Interface pour un scénario de crise
interface CrisisScenario {
  id: string;
  title: string;
  category: 'ransomware' | 'data_breach' | 'ddos' | 'insider_threat' | 'supply_chain';
  difficulty: 'débutant' | 'intermédiaire' | 'avancé' | 'expert';
  description: string;
  initialSituation: string;
  objectives: string[];
  totalStages: number;
  timeLimit: number; // en minutes
  stakeholders: Stakeholder[];
  potentialOutcomes: Outcome[];
}

// Interface pour les parties prenantes
interface Stakeholder {
  id: string;
  role: string;
  name: string;
  department: string;
  expertise: string[];
  attitude: 'helpful' | 'neutral' | 'resistant';
  availability: number; // 0-10, 10 étant toujours disponible
}

// Interface pour un événement de la timeline
interface TimelineEvent {
  id: string;
  timestamp: number;
  type: 'incident' | 'decision' | 'update' | 'communication' | 'escalation';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  relatedStakeholders?: string[]; // IDs des stakeholders concernés
  impact?: string;
}

// Interface pour une décision prise
interface DecisionRecord {
  id: string;
  timestamp: number;
  stage: number;
  decisionPoint: string;
  options: DecisionOption[];
  selectedOption: string; // ID de l'option sélectionnée
  justification?: string;
  impact: {
    technical: number; // -10 à 10
    communication: number; // -10 à 10
    business: number; // -10 à 10
    legal: number; // -10 à 10
  };
}

// Interface pour une option de décision
interface DecisionOption {
  id: string;
  text: string;
  consequences?: string;
}

// Interface pour l'allocation des ressources
interface ResourceAllocation {
  technical: number; // 0-100%
  communication: number; // 0-100%
  legal: number; // 0-100%
  management: number; // 0-100%
  financial: number; // 0-100%
}

// Interface pour les metrics de crise
interface CrisisMetrics {
  technicalResponse: number; // 0-100
  communicationEffectiveness: number; // 0-100
  businessContinuity: number; // 0-100
  legalCompliance: number; // 0-100
  overallEffectiveness: number; // 0-100
  timeEfficiency: number; // 0-100
  reputationProtection: number; // 0-100
}

// Interface pour les résultats potentiels
interface Outcome {
  id: string;
  title: string;
  description: string;
  conditions: {
    technicalResponse: number; // Minimum requis
    communicationEffectiveness: number; // Minimum requis
    businessContinuity: number; // Minimum requis
    legalCompliance: number; // Minimum requis
  };
}

// Map pour stocker les sessions actives
const activeCrisisSessions = new Map<string, CrisisSession>();

// Scénarios pré-configurés
const predefinedScenarios: CrisisScenario[] = [
  {
    id: "ransomware-hospital",
    title: "Ransomware à l'Hôpital Central",
    category: "ransomware",
    difficulty: "intermédiaire",
    description: "Un ransomware a chiffré les systèmes critiques d'un hôpital, affectant l'accès aux dossiers médicaux et certains équipements.",
    initialSituation: "Vous êtes le RSSI de l'Hôpital Central, un établissement régional de 500 lits. À 3h du matin, vous êtes contacté en urgence par l'équipe informatique de garde qui signale que plusieurs systèmes critiques sont inaccessibles. Les écrans des postes de travail dans plusieurs services affichent une demande de rançon. Les dossiers patients électroniques sont inaccessibles et certains équipements médicaux connectés au réseau semblent affectés. Le service des urgences est particulièrement touché et les médecins sont contraints de revenir à des procédures papier.",
    objectives: [
      "Maintenir les services critiques de l'hôpital",
      "Protéger la vie des patients",
      "Évaluer l'étendue de l'attaque",
      "Décider de la stratégie de réponse à la demande de rançon",
      "Communiquer efficacement avec les parties prenantes",
      "Satisfaire aux obligations réglementaires (RGPD, NIS2)"
    ],
    totalStages: 5,
    timeLimit: 60,
    stakeholders: [
      {
        id: "director",
        role: "Directeur de l'hôpital",
        name: "Dr. Philippe Moreau",
        department: "Direction",
        expertise: ["gestion", "santé publique"],
        attitude: "neutral",
        availability: 7
      },
      {
        id: "it-manager",
        role: "Responsable IT",
        name: "Sophie Durand",
        department: "IT",
        expertise: ["infrastructure", "réseaux", "sécurité informatique"],
        attitude: "helpful",
        availability: 9
      },
      {
        id: "emergency-chief",
        role: "Chef du service des urgences",
        name: "Dr. Marc Lambert",
        department: "Urgences",
        expertise: ["médecine d'urgence"],
        attitude: "resistant",
        availability: 5
      },
      {
        id: "legal-counsel",
        role: "Conseiller juridique",
        name: "Maître Claire Bertrand",
        department: "Juridique",
        expertise: ["droit de la santé", "RGPD"],
        attitude: "helpful",
        availability: 6
      },
      {
        id: "comm-director",
        role: "Directeur de la communication",
        name: "Thomas Leroy",
        department: "Communication",
        expertise: ["relations presse", "communication de crise"],
        attitude: "neutral",
        availability: 8
      }
    ],
    potentialOutcomes: [
      {
        id: "outcome-1",
        title: "Résolution exemplaire",
        description: "Vous avez géré la crise de manière exemplaire. Les systèmes ont été restaurés rapidement, la communication a été transparente et efficace, et l'incident n'a eu qu'un impact minimal sur les soins aux patients.",
        conditions: {
          technicalResponse: 80,
          communicationEffectiveness: 80,
          businessContinuity: 80,
          legalCompliance: 80
        }
      },
      {
        id: "outcome-2",
        title: "Gestion adéquate",
        description: "Votre gestion de crise a été généralement efficace. Quelques aspects auraient pu être améliorés, mais vous avez réussi à limiter l'impact et à restaurer les opérations sans conséquences majeures.",
        conditions: {
          technicalResponse: 60,
          communicationEffectiveness: 60,
          businessContinuity: 60,
          legalCompliance: 60
        }
      },
      {
        id: "outcome-3",
        title: "Difficultés significatives",
        description: "La gestion de crise a présenté des lacunes importantes. Les systèmes ont été restaurés, mais l'incident a causé des perturbations significatives et pourrait avoir des conséquences à long terme.",
        conditions: {
          technicalResponse: 40,
          communicationEffectiveness: 40,
          businessContinuity: 40,
          legalCompliance: 40
        }
      },
      {
        id: "outcome-4",
        title: "Échec critique",
        description: "La gestion de crise a échoué sur plusieurs fronts critiques. L'incident a eu des conséquences graves, avec des dommages durables à la réputation de l'institution et potentiellement aux soins des patients.",
        conditions: {
          technicalResponse: 20,
          communicationEffectiveness: 20,
          businessContinuity: 20,
          legalCompliance: 20
        }
      }
    ]
  },
  {
    id: "data-breach-financial",
    title: "Fuite de données bancaires",
    category: "data_breach",
    difficulty: "avancé",
    description: "Une banque découvre une exfiltration massive de données client, y compris des informations financières sensibles.",
    initialSituation: "En tant que RSSI de la Banque Nationale de Finance, vous recevez une alerte inquiétante : votre équipe de sécurité a détecté un trafic réseau anormal suggérant une exfiltration de données. Une analyse préliminaire indique que des données clients sensibles, incluant des informations d'identification personnelle et potentiellement des données de comptes, ont été compromises. L'étendue exacte de la brèche n'est pas encore déterminée, mais pourrait concerner plus de 200 000 clients. Des données de transactions datant des 30 derniers jours semblent également avoir été extraites.",
    objectives: [
      "Identifier l'étendue précise de la fuite de données",
      "Contenir la brèche et sécuriser les systèmes",
      "Satisfaire aux obligations réglementaires (notification CNIL, RGPD)",
      "Communiquer efficacement avec les clients affectés",
      "Minimiser l'impact sur la réputation de la banque",
      "Mettre en place des mesures de protection pour les clients"
    ],
    totalStages: 6,
    timeLimit: 90,
    stakeholders: [
      {
        id: "ceo",
        role: "PDG",
        name: "Charles Mercier",
        department: "Direction Générale",
        expertise: ["finance", "management"],
        attitude: "neutral",
        availability: 6
      },
      {
        id: "sec-team-lead",
        role: "Responsable Équipe Sécurité",
        name: "Amina Benali",
        department: "Sécurité IT",
        expertise: ["cybersécurité", "forensics", "gestion des incidents"],
        attitude: "helpful",
        availability: 10
      },
      {
        id: "dpo",
        role: "Délégué à la Protection des Données",
        name: "Jean-Marc Dupont",
        department: "Conformité",
        expertise: ["RGPD", "réglementation bancaire"],
        attitude: "helpful",
        availability: 8
      },
      {
        id: "card-director",
        role: "Directeur des Opérations Carte Bancaire",
        name: "Sylvie Moreau",
        department: "Opérations",
        expertise: ["systèmes de paiement", "gestion des risques"],
        attitude: "resistant",
        availability: 7
      },
      {
        id: "marketing-head",
        role: "Directeur Marketing",
        name: "François Lebrun",
        department: "Marketing",
        expertise: ["gestion de marque", "communication client"],
        attitude: "resistant",
        availability: 5
      },
      {
        id: "regulator-contact",
        role: "Contact Autorité de Régulation Bancaire",
        name: "Dr. Hélène Rousseau",
        department: "Externe",
        expertise: ["régulation bancaire", "gestion de crise"],
        attitude: "neutral",
        availability: 4
      }
    ],
    potentialOutcomes: [
      {
        id: "outcome-1",
        title: "Gestion exemplaire de la crise",
        description: "Vous avez géré la fuite de données de manière exemplaire. La brèche a été contenue rapidement, la communication avec les autorités et les clients a été transparente et proactive, et vous avez mis en place des mesures efficaces pour protéger les clients affectés.",
        conditions: {
          technicalResponse: 85,
          communicationEffectiveness: 85,
          businessContinuity: 80,
          legalCompliance: 90
        }
      },
      {
        id: "outcome-2",
        title: "Réponse efficace avec quelques lacunes",
        description: "Votre gestion de la crise a été généralement efficace. Vous avez réussi à contenir la brèche et à respecter les obligations réglementaires, mais certains aspects de la communication ou de la protection des clients auraient pu être améliorés.",
        conditions: {
          technicalResponse: 70,
          communicationEffectiveness: 65,
          businessContinuity: 70,
          legalCompliance: 75
        }
      },
      {
        id: "outcome-3",
        title: "Gestion problématique avec conséquences",
        description: "La gestion de la crise a présenté des problèmes significatifs. Des retards dans la réponse, une communication peu transparente ou des mesures de protection insuffisantes ont entamé la confiance des clients et attiré l'attention négative des régulateurs.",
        conditions: {
          technicalResponse: 50,
          communicationEffectiveness: 45,
          businessContinuity: 50,
          legalCompliance: 50
        }
      },
      {
        id: "outcome-4",
        title: "Échec majeur de gestion de crise",
        description: "La gestion de la crise a échoué sur plusieurs plans critiques. La réponse technique a été inefficace, la communication a manqué de transparence, et les obligations réglementaires n'ont pas été respectées. La banque fait face à des sanctions potentiellement sévères et à une perte de confiance majeure des clients.",
        conditions: {
          technicalResponse: 30,
          communicationEffectiveness: 25,
          businessContinuity: 30,
          legalCompliance: 25
        }
      }
    ]
  },
  {
    id: "supply-chain-attack",
    title: "Compromission de la chaîne d'approvisionnement",
    category: "supply_chain",
    difficulty: "expert",
    description: "Une entreprise industrielle découvre qu'un de ses fournisseurs de logiciels critiques a été compromis, affectant potentiellement sa propre infrastructure.",
    initialSituation: "En tant que RSSI de TechnoIndustrie, un leader des équipements industriels connectés, vous recevez une alerte critique : une mise à jour du logiciel de contrôle industriel fourni par votre partenaire SoftControl aurait été compromise. Le CERT-FR vient d'émettre une alerte concernant une backdoor sophistiquée insérée dans cette mise à jour, que vous avez déployée il y a 72 heures sur plus de 60% de vos systèmes de production. Certains clients signalent déjà des comportements anormaux sur leurs équipements. Les premiers indices suggèrent qu'il pourrait s'agir d'une attaque d'un groupe APT sponsorisé par un état, ciblant spécifiquement le secteur industriel.",
    objectives: [
      "Évaluer précisément l'étendue de la compromission interne",
      "Contenir la menace et isoler les systèmes critiques",
      "Décider d'une stratégie de remédiation (rollback, application de correctifs, etc.)",
      "Coordonner avec le fournisseur et les autorités cybersécurité",
      "Gérer la communication avec les clients et partenaires affectés",
      "Minimiser l'impact sur la production et les livraisons"
    ],
    totalStages: 7,
    timeLimit: 120,
    stakeholders: [
      {
        id: "coo",
        role: "Directeur des Opérations",
        name: "Paul Deschamps",
        department: "Opérations",
        expertise: ["production industrielle", "gestion de crise"],
        attitude: "resistant",
        availability: 8
      },
      {
        id: "sec-officer",
        role: "Responsable Sécurité OT",
        name: "Isabelle Laurent",
        department: "Sécurité Industrielle",
        expertise: ["cybersécurité OT", "SCADA", "systèmes industriels"],
        attitude: "helpful",
        availability: 9
      },
      {
        id: "vendor-contact",
        role: "Contact Principal SoftControl",
        name: "Eric Morel",
        department: "Externe",
        expertise: ["développement logiciel", "systèmes de contrôle"],
        attitude: "neutral",
        availability: 5
      },
      {
        id: "cert-fr-liaison",
        role: "Correspondant CERT-FR",
        name: "Dr. Marie Lemaire",
        department: "Externe",
        expertise: ["réponse aux incidents", "threat intelligence"],
        attitude: "helpful",
        availability: 6
      },
      {
        id: "client-service-head",
        role: "Directeur Service Client",
        name: "Antoine Bernard",
        department: "Service Client",
        expertise: ["support technique", "relation client"],
        attitude: "resistant",
        availability: 7
      },
      {
        id: "prod-manager",
        role: "Responsable Production",
        name: "Julie Gauthier",
        department: "Production",
        expertise: ["processus industriels", "maintenance"],
        attitude: "resistant",
        availability: 8
      },
      {
        id: "legal-director",
        role: "Directeur Juridique",
        name: "Maître Robert Petit",
        department: "Juridique",
        expertise: ["contrats commerciaux", "responsabilité produit"],
        attitude: "neutral",
        availability: 6
      }
    ],
    potentialOutcomes: [
      {
        id: "outcome-1",
        title: "Maîtrise exceptionnelle de la crise",
        description: "Votre gestion de la crise a été exemplaire. La menace a été contenue rapidement, les systèmes critiques ont été protégés, et vous avez maintenu une coordination efficace avec toutes les parties prenantes. L'impact sur la production a été minimal et la confiance des clients a été préservée.",
        conditions: {
          technicalResponse: 90,
          communicationEffectiveness: 85,
          businessContinuity: 85,
          legalCompliance: 85
        }
      },
      {
        id: "outcome-2",
        title: "Gestion efficace avec impact limité",
        description: "Votre réponse à la crise a été globalement efficace. La menace a été contenue, bien que certains systèmes aient subi des interruptions. La communication a été adéquate et l'impact sur les opérations a été gérable.",
        conditions: {
          technicalResponse: 75,
          communicationEffectiveness: 70,
          businessContinuity: 70,
          legalCompliance: 75
        }
      },
      {
        id: "outcome-3",
        title: "Difficultés significatives avec conséquences",
        description: "La gestion de la crise a présenté des lacunes importantes. La compromission n'a pas été entièrement contenue, certains clients ont subi des impacts significatifs, et la coordination avec les parties prenantes a été insuffisante.",
        conditions: {
          technicalResponse: 55,
          communicationEffectiveness: 50,
          businessContinuity: 50,
          legalCompliance: 60
        }
      },
      {
        id: "outcome-4",
        title: "Échec critique de la gestion de crise",
        description: "La réponse à cette attaque de la chaîne d'approvisionnement a échoué sur plusieurs fronts. La compromission s'est propagée, causant des dommages étendus aux systèmes internes et clients. La confiance des clients et des partenaires a été gravement entamée, avec des conséquences potentiellement durables pour l'entreprise.",
        conditions: {
          technicalResponse: 35,
          communicationEffectiveness: 30,
          businessContinuity: 30,
          legalCompliance: 40
        }
      }
    ]
  }
];

/**
 * Récupère la liste des scénarios disponibles
 */
export async function getAvailableScenarios(req: Request, res: Response) {
  try {
    // Retourner une version simplifiée des scénarios pour l'affichage
    const scenariosOverview = predefinedScenarios.map(scenario => ({
      id: scenario.id,
      title: scenario.title,
      category: scenario.category,
      difficulty: scenario.difficulty,
      description: scenario.description,
      timeEstimate: scenario.timeLimit,
      stagesCount: scenario.totalStages
    }));
    
    return res.status(200).json({
      success: true,
      scenarios: scenariosOverview
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des scénarios:", error);
    return res.status(500).json({ error: "Erreur lors de la récupération des scénarios" });
  }
}

/**
 * Démarre une nouvelle session de gestion de crise
 */
export async function startCrisisSession(req: Request, res: Response) {
  try {
    const { userId, scenarioId } = req.body;
    
    if (!userId || !scenarioId) {
      return res.status(400).json({ error: "ID utilisateur et ID scénario requis" });
    }
    
    // Trouver le scénario demandé
    const scenario = predefinedScenarios.find(s => s.id === scenarioId);
    if (!scenario) {
      return res.status(404).json({ error: "Scénario non trouvé" });
    }
    
    // Créer un ID unique pour la session
    const sessionId = uuidv4();
    
    // Initialiser les métriques
    const initialMetrics: CrisisMetrics = {
      technicalResponse: 50,
      communicationEffectiveness: 50,
      businessContinuity: 50,
      legalCompliance: 50,
      overallEffectiveness: 50,
      timeEfficiency: 50,
      reputationProtection: 50
    };
    
    // Initialiser l'allocation des ressources
    const initialResources: ResourceAllocation = {
      technical: 20,
      communication: 20,
      legal: 20,
      management: 20,
      financial: 20
    };

    // Créer la session
    const session: CrisisSession = {
      sessionId,
      userId,
      scenario,
      currentStage: 0,
      timeline: [
        {
          id: uuidv4(),
          timestamp: Date.now(),
          type: 'incident',
          title: 'Début de la crise',
          description: scenario.initialSituation,
          severity: 'high'
        }
      ],
      decisions: [],
      resources: initialResources,
      metrics: initialMetrics,
      messages: [
        {
          role: "system",
          content: getCrisisSystemPrompt(scenario)
        },
        {
          role: "assistant",
          content: `# Bienvenue dans la simulation de gestion de crise : ${scenario.title}

${scenario.initialSituation}

## Vos objectifs
${scenario.objectives.map(obj => `- ${obj}`).join('\n')}

## Situation actuelle
Vous venez d'être informé de la situation et devez prendre les premières mesures. Le temps est compté et vos décisions auront un impact direct sur l'évolution de la crise.

## Que souhaitez-vous faire en premier ?
- Réunir la cellule de crise
- Évaluer l'étendue des dégâts
- Contacter les parties prenantes clés
- Autre action`
        }
      ],
      status: 'active',
      startTime: Date.now(),
      elapsedTime: 0
    };
    
    // Stocker la session
    activeCrisisSessions.set(sessionId, session);
    
    return res.status(200).json({
      success: true,
      sessionId,
      scenario: {
        id: scenario.id,
        title: scenario.title,
        description: scenario.description,
        difficulty: scenario.difficulty,
        totalStages: scenario.totalStages,
        timeLimit: scenario.timeLimit
      },
      initialSituation: scenario.initialSituation,
      objectives: scenario.objectives,
      stakeholders: scenario.stakeholders,
      timeline: session.timeline,
      resources: session.resources,
      metrics: session.metrics,
      welcomeMessage: session.messages[1].content
    });
  } catch (error) {
    console.error("Erreur lors du démarrage de la session de crise:", error);
    return res.status(500).json({ error: "Erreur lors du démarrage de la session" });
  }
}

/**
 * Obtient un message système pour le modèle d'IA en fonction du scénario
 */
function getCrisisSystemPrompt(scenario: CrisisScenario): string {
  return `Tu es un simulateur de crise cybersécurité avancé qui présente un scénario de ${scenario.title} à un RSSI. 

CONTEXTE DU SCÉNARIO:
${scenario.description}
${scenario.initialSituation}

RÔLE:
- Tu dois agir comme un simulateur réaliste, présentant les développements de la crise de manière dynamique
- Adapte la situation en fonction des décisions de l'utilisateur
- Fournis des feedbacks réalistes sur les conséquences des actions
- Présente de nouveaux défis et complications comme dans une vraie crise

DIRECTIVES IMPORTANTES:
1. Reste toujours dans le contexte du scénario "${scenario.title}"
2. Présente les informations dans un format structuré et facile à lire
3. Les réponses doivent être concises mais complètes, avec des sections clairement définies
4. Inclus toujours des options d'action ou des décisions à prendre à la fin de chaque réponse
5. Adapte le niveau de difficulté en fonction de la classification "${scenario.difficulty}"
6. N'invente pas de résolution facile, les crises cyber sont complexes et comportent toujours des compromis

COMPORTEMENT:
- Ne brise jamais ton rôle de simulateur de crise
- Ne fournis pas de solutions évidentes ou de "chemins parfaits"
- Introduis des complications réalistes basées sur les décisions précédentes
- Sois dynamique et réactif aux choix de l'utilisateur
- Maintiens une pression temporelle réaliste
- Simule les réactions des différentes parties prenantes internes et externes`;
}

/**
 * Envoie un message dans le cadre d'une session de gestion de crise
 */
export async function sendCrisisMessage(req: Request, res: Response) {
  try {
    const { sessionId, message } = req.body;
    
    if (!sessionId || !message) {
      return res.status(400).json({ error: "ID de session et message requis" });
    }
    
    // Récupérer la session
    const session = activeCrisisSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session non trouvée" });
    }
    
    // Ajouter le message de l'utilisateur
    session.messages.push({
      role: "user",
      content: message
    });
    
    // Mettre à jour le temps écoulé
    if (session.status === 'active') {
      const currentTime = Date.now();
      if (session.pausedAt) {
        // Si la session était en pause, ne compte pas le temps de pause
        session.elapsedTime += session.pausedAt - session.startTime;
        session.startTime = currentTime;
        session.pausedAt = undefined;
      } else {
        session.elapsedTime = session.elapsedTime + (currentTime - session.startTime);
        session.startTime = currentTime;
      }
    }
    
    // Générer une réponse avec l'IA
    const response = await openAIService.getChatCompletion(session.messages);
    
    // Ajouter la réponse à la session
    session.messages.push({
      role: "assistant",
      content: response
    });
    
    // Mettre à jour la timeline avec un nouvel événement si pertinent
    // Ceci est simplifié - dans une implémentation réelle, on analyserait
    // la réponse pour déterminer s'il faut ajouter un événement
    if (session.messages.length % 4 === 0) {
      session.timeline.push({
        id: uuidv4(),
        timestamp: Date.now(),
        type: 'update',
        title: `Développement de la crise - Étape ${session.currentStage + 1}`,
        description: `La situation évolue suite à vos actions. ${response.substring(0, 100)}...`,
        severity: 'medium'
      });
    }
    
    // Mettre à jour les métriques (simulation)
    // Dans une implémentation réelle, l'analyse serait plus sophistiquée
    simulateMetricsUpdate(session, message, response);
    
    // Stocker la session mise à jour
    activeCrisisSessions.set(sessionId, session);
    
    // Vérifier si on passe à l'étape suivante
    if (shouldAdvanceStage(session, message, response)) {
      session.currentStage += 1;
      
      // Si on a atteint la fin du scénario
      if (session.currentStage >= session.scenario.totalStages) {
        session.status = 'completed';
        return res.status(200).json({
          success: true,
          message: response,
          timeline: session.timeline,
          metrics: session.metrics,
          resources: session.resources,
          status: session.status,
          elapsedTime: session.elapsedTime,
          isCompleted: true,
          outcome: determineOutcome(session)
        });
      }
    }
    
    return res.status(200).json({
      success: true,
      message: response,
      timeline: session.timeline,
      metrics: session.metrics,
      resources: session.resources,
      currentStage: session.currentStage,
      elapsedTime: session.elapsedTime,
      status: session.status,
      isCompleted: false
    });
  } catch (error) {
    console.error("Erreur lors de l'envoi du message:", error);
    return res.status(500).json({ error: "Erreur lors du traitement du message" });
  }
}

/**
 * Simule la mise à jour des métriques basée sur les interactions
 */
function simulateMetricsUpdate(session: CrisisSession, userMessage: string, aiResponse: string) {
  // Cette fonction est simplifiée - une implémentation réelle analyserait le contenu des messages
  // pour déterminer l'impact sur les différentes métriques
  
  // Simuler des changements basés sur des mots-clés dans le message utilisateur
  const lowerUserMsg = userMessage.toLowerCase();
  
  // Simuler l'impact sur la réponse technique
  if (lowerUserMsg.includes('isoler') || lowerUserMsg.includes('contenir') || 
      lowerUserMsg.includes('sécuriser') || lowerUserMsg.includes('patch')) {
    session.metrics.technicalResponse = Math.min(100, session.metrics.technicalResponse + 5);
  }
  
  // Simuler l'impact sur l'efficacité de la communication
  if (lowerUserMsg.includes('communiquer') || lowerUserMsg.includes('informer') || 
      lowerUserMsg.includes('notification') || lowerUserMsg.includes('transparence')) {
    session.metrics.communicationEffectiveness = Math.min(100, session.metrics.communicationEffectiveness + 5);
  }
  
  // Simuler l'impact sur la continuité des activités
  if (lowerUserMsg.includes('continuité') || lowerUserMsg.includes('reprise') || 
      lowerUserMsg.includes('backup') || lowerUserMsg.includes('alternative')) {
    session.metrics.businessContinuity = Math.min(100, session.metrics.businessContinuity + 5);
  }
  
  // Simuler l'impact sur la conformité légale
  if (lowerUserMsg.includes('rgpd') || lowerUserMsg.includes('légal') || 
      lowerUserMsg.includes('réglementaire') || lowerUserMsg.includes('notification')) {
    session.metrics.legalCompliance = Math.min(100, session.metrics.legalCompliance + 5);
  }
  
  // Simuler des pénalités pour certains mots-clés
  if (lowerUserMsg.includes('attendre') || lowerUserMsg.includes('reporter') || 
      lowerUserMsg.includes('ignorer') || lowerUserMsg.includes('dissimuler')) {
    session.metrics.technicalResponse = Math.max(0, session.metrics.technicalResponse - 5);
    session.metrics.communicationEffectiveness = Math.max(0, session.metrics.communicationEffectiveness - 5);
    session.metrics.businessContinuity = Math.max(0, session.metrics.businessContinuity - 3);
    session.metrics.legalCompliance = Math.max(0, session.metrics.legalCompliance - 7);
  }
  
  // Calculer l'efficacité globale comme une moyenne pondérée
  session.metrics.overallEffectiveness = Math.round(
    (session.metrics.technicalResponse * 0.3) +
    (session.metrics.communicationEffectiveness * 0.25) +
    (session.metrics.businessContinuity * 0.25) +
    (session.metrics.legalCompliance * 0.2)
  );
  
  // Simuler l'efficacité temporelle basée sur le temps écoulé par rapport à la limite
  const timePercentUsed = (session.elapsedTime / 60000) / session.scenario.timeLimit;
  const stageProgressPercent = session.currentStage / session.scenario.totalStages;
  
  if (stageProgressPercent > timePercentUsed) {
    // En avance sur le temps
    session.metrics.timeEfficiency = Math.min(100, session.metrics.timeEfficiency + 2);
  } else {
    // En retard sur le temps
    session.metrics.timeEfficiency = Math.max(0, session.metrics.timeEfficiency - 2);
  }
  
  // Simuler l'impact sur la protection de la réputation
  session.metrics.reputationProtection = Math.round(
    (session.metrics.communicationEffectiveness * 0.5) +
    (session.metrics.legalCompliance * 0.3) +
    (session.metrics.technicalResponse * 0.2)
  );
}

/**
 * Détermine si on doit passer à l'étape suivante du scénario
 */
function shouldAdvanceStage(session: CrisisSession, userMessage: string, aiResponse: string): boolean {
  // Cette fonction est simplifiée - une implémentation réelle analyserait le contenu des messages
  // pour déterminer si on doit passer à l'étape suivante
  
  // Vérifier si certains mots clés sont présents dans la réponse de l'IA
  const keywordsForProgression = [
    "nouvelle phase", "prochaine étape", "situation évolue", "passons à", "phase suivante"
  ];
  
  // Compter le nombre de messages échangés à l'étape actuelle
  const messagesInCurrentStage = session.messages.length - (session.currentStage * 6);
  
  // Si on a échangé suffisamment de messages et que la réponse contient un mot clé de progression
  return (messagesInCurrentStage >= 6 && 
          keywordsForProgression.some(keyword => aiResponse.toLowerCase().includes(keyword)));
}

/**
 * Détermine le résultat final de la session
 */
function determineOutcome(session: CrisisSession): { id: string, title: string, description: string } {
  // Trouver le résultat le plus favorable dont les conditions sont remplies
  for (const outcome of session.scenario.potentialOutcomes) {
    if (session.metrics.technicalResponse >= outcome.conditions.technicalResponse &&
        session.metrics.communicationEffectiveness >= outcome.conditions.communicationEffectiveness &&
        session.metrics.businessContinuity >= outcome.conditions.businessContinuity &&
        session.metrics.legalCompliance >= outcome.conditions.legalCompliance) {
      return {
        id: outcome.id,
        title: outcome.title,
        description: outcome.description
      };
    }
  }
  
  // Par défaut, renvoyer le résultat le moins favorable
  const defaultOutcome = session.scenario.potentialOutcomes[session.scenario.potentialOutcomes.length - 1];
  return {
    id: defaultOutcome.id,
    title: defaultOutcome.title,
    description: defaultOutcome.description
  };
}

/**
 * Met en pause une session de gestion de crise
 */
export async function pauseCrisisSession(req: Request, res: Response) {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: "ID de session requis" });
    }
    
    // Récupérer la session
    const session = activeCrisisSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session non trouvée" });
    }
    
    // Mettre à jour le statut et le temps de pause
    session.status = 'paused';
    session.pausedAt = Date.now();
    
    // Stocker la session mise à jour
    activeCrisisSessions.set(sessionId, session);
    
    return res.status(200).json({
      success: true,
      message: "Session mise en pause",
      elapsedTime: session.elapsedTime + (session.pausedAt - session.startTime)
    });
  } catch (error) {
    console.error("Erreur lors de la mise en pause de la session:", error);
    return res.status(500).json({ error: "Erreur lors de la mise en pause" });
  }
}

/**
 * Reprend une session de gestion de crise mise en pause
 */
export async function resumeCrisisSession(req: Request, res: Response) {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: "ID de session requis" });
    }
    
    // Récupérer la session
    const session = activeCrisisSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session non trouvée" });
    }
    
    // Vérifier que la session est bien en pause
    if (session.status !== 'paused') {
      return res.status(400).json({ error: "La session n'est pas en pause" });
    }
    
    // Mettre à jour le statut et le temps de démarrage
    session.status = 'active';
    
    // Si pausedAt est défini, calculer le temps écoulé
    if (session.pausedAt) {
      session.elapsedTime += session.pausedAt - session.startTime;
    }
    
    session.startTime = Date.now();
    session.pausedAt = undefined;
    
    // Stocker la session mise à jour
    activeCrisisSessions.set(sessionId, session);
    
    return res.status(200).json({
      success: true,
      message: "Session reprise",
      status: session.status,
      elapsedTime: session.elapsedTime
    });
  } catch (error) {
    console.error("Erreur lors de la reprise de la session:", error);
    return res.status(500).json({ error: "Erreur lors de la reprise" });
  }
}

/**
 * Termine une session de gestion de crise et génère un rapport final
 */
export async function endCrisisSession(req: Request, res: Response) {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: "ID de session requis" });
    }
    
    // Récupérer la session
    const session = activeCrisisSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session non trouvée" });
    }
    
    // Mettre à jour le statut et calculer le temps total
    session.status = 'completed';
    
    if (session.status === 'active') {
      session.elapsedTime += Date.now() - session.startTime;
    } else if (session.status === 'paused' && session.pausedAt) {
      session.elapsedTime += session.pausedAt - session.startTime;
    }
    
    // Générer un résumé de la session
    const outcome = determineOutcome(session);
    
    // Requête pour générer un rapport détaillé
    const reportPrompt = `
    Génère un rapport détaillé de retour d'expérience pour la session de gestion de crise "${session.scenario.title}".
    
    Informations sur le scénario:
    - Titre: ${session.scenario.title}
    - Difficulté: ${session.scenario.difficulty}
    - Description: ${session.scenario.description}
    
    Résultats obtenus:
    - Réponse technique: ${session.metrics.technicalResponse}/100
    - Efficacité de la communication: ${session.metrics.communicationEffectiveness}/100
    - Continuité des activités: ${session.metrics.businessContinuity}/100
    - Conformité légale: ${session.metrics.legalCompliance}/100
    - Efficacité globale: ${session.metrics.overallEffectiveness}/100
    - Efficacité temporelle: ${session.metrics.timeEfficiency}/100
    - Protection de la réputation: ${session.metrics.reputationProtection}/100
    
    Résultat final: ${outcome.title} - ${outcome.description}
    
    Format ton rapport avec les sections suivantes:
    1. Résumé exécutif
    2. Points forts de la gestion de crise
    3. Axes d'amélioration
    4. Leçons apprises et recommandations
    5. Conclusion
    
    Assure-toi que le rapport est factuel, constructif et utile pour améliorer les compétences de gestion de crise.
    `;
    
    const reportMessages: ChatCompletionRequestMessage[] = [
      {
        role: "system",
        content: "Tu es un conseiller expert en cybersécurité spécialisé dans l'analyse post-crise. Tu dois produire un rapport de retour d'expérience détaillé, professionnel et éducatif qui aide le RSSI à comprendre ses points forts et ses axes d'amélioration. Ton rapport doit être factuel, spécifique et actionnable."
      },
      {
        role: "user",
        content: reportPrompt
      }
    ];
    
    const reportContent = await openAIService.getChatCompletion(reportMessages);
    
    return res.status(200).json({
      success: true,
      message: "Session terminée",
      status: session.status,
      elapsedTime: session.elapsedTime,
      outcome,
      report: {
        title: `Rapport de crise : ${session.scenario.title}`,
        content: reportContent,
        metrics: session.metrics,
        timeline: session.timeline,
        decisions: session.decisions
      }
    });
  } catch (error) {
    console.error("Erreur lors de la fin de la session:", error);
    return res.status(500).json({ error: "Erreur lors de la fin de session" });
  }
}

/**
 * Récupère les détails d'une session de gestion de crise
 */
export async function getCrisisSessionDetails(req: Request, res: Response) {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      return res.status(400).json({ error: "ID de session requis" });
    }
    
    // Récupérer la session
    const session = activeCrisisSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session non trouvée" });
    }
    
    // Mettre à jour le temps écoulé si la session est active
    if (session.status === 'active') {
      session.elapsedTime = session.elapsedTime + (Date.now() - session.startTime);
      session.startTime = Date.now();
    }
    
    return res.status(200).json({
      success: true,
      scenario: {
        id: session.scenario.id,
        title: session.scenario.title,
        description: session.scenario.description,
        difficulty: session.scenario.difficulty,
        totalStages: session.scenario.totalStages,
        timeLimit: session.scenario.timeLimit,
        currentStage: session.currentStage
      },
      timeline: session.timeline,
      resources: session.resources,
      metrics: session.metrics,
      status: session.status,
      elapsedTime: session.elapsedTime,
      stakeholders: session.scenario.stakeholders,
      messages: session.messages.filter(m => m.role !== "system") // Ne pas exposer le prompt système
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des détails de la session:", error);
    return res.status(500).json({ error: "Erreur lors de la récupération des détails" });
  }
}

/**
 * Met à jour l'allocation des ressources pour une session de gestion de crise
 */
export async function updateResourceAllocation(req: Request, res: Response) {
  try {
    const { sessionId, resources } = req.body;
    
    if (!sessionId || !resources) {
      return res.status(400).json({ error: "ID de session et ressources requis" });
    }
    
    // Récupérer la session
    const session = activeCrisisSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session non trouvée" });
    }
    
    // Vérifier que les ressources totalisent 100%
    const total = resources.technical + resources.communication + resources.legal + resources.management + resources.financial;
    if (Math.abs(total - 100) > 0.01) {
      return res.status(400).json({ error: "L'allocation totale des ressources doit être de 100%" });
    }
    
    // Mettre à jour les ressources
    session.resources = resources;
    
    // Simuler l'impact sur les métriques
    session.metrics.technicalResponse = Math.min(100, session.metrics.technicalResponse + (resources.technical - session.resources.technical) / 10);
    session.metrics.communicationEffectiveness = Math.min(100, session.metrics.communicationEffectiveness + (resources.communication - session.resources.communication) / 10);
    session.metrics.legalCompliance = Math.min(100, session.metrics.legalCompliance + (resources.legal - session.resources.legal) / 10);
    session.metrics.businessContinuity = Math.min(100, session.metrics.businessContinuity + (resources.management - session.resources.management) / 10);
    
    // Mettre à jour l'efficacité globale
    session.metrics.overallEffectiveness = Math.round(
      (session.metrics.technicalResponse * 0.3) +
      (session.metrics.communicationEffectiveness * 0.25) +
      (session.metrics.businessContinuity * 0.25) +
      (session.metrics.legalCompliance * 0.2)
    );
    
    // Stocker la session mise à jour
    activeCrisisSessions.set(sessionId, session);
    
    return res.status(200).json({
      success: true,
      resources: session.resources,
      metrics: session.metrics
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour des ressources:", error);
    return res.status(500).json({ error: "Erreur lors de la mise à jour des ressources" });
  }
}

/**
 * Enregistre une décision prise durant la gestion de crise
 */
export async function recordDecision(req: Request, res: Response) {
  try {
    const { sessionId, decisionPoint, selectedOption, justification } = req.body;
    
    if (!sessionId || !decisionPoint || !selectedOption) {
      return res.status(400).json({ error: "ID de session, point de décision et option sélectionnée requis" });
    }
    
    // Récupérer la session
    const session = activeCrisisSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session non trouvée" });
    }
    
    // Créer l'enregistrement de décision
    const decision: DecisionRecord = {
      id: uuidv4(),
      timestamp: Date.now(),
      stage: session.currentStage,
      decisionPoint,
      options: req.body.options || [],
      selectedOption,
      justification,
      impact: {
        technical: Math.floor(Math.random() * 21) - 10, // -10 à 10
        communication: Math.floor(Math.random() * 21) - 10,
        business: Math.floor(Math.random() * 21) - 10,
        legal: Math.floor(Math.random() * 21) - 10
      }
    };
    
    // Ajouter la décision à la session
    session.decisions.push(decision);
    
    // Ajouter un événement à la timeline
    session.timeline.push({
      id: uuidv4(),
      timestamp: Date.now(),
      type: 'decision',
      title: `Décision: ${decisionPoint}`,
      description: `Option choisie: ${selectedOption}${justification ? ` - Justification: ${justification}` : ''}`,
      severity: 'medium'
    });
    
    // Simuler l'impact sur les métriques
    session.metrics.technicalResponse = Math.max(0, Math.min(100, session.metrics.technicalResponse + decision.impact.technical));
    session.metrics.communicationEffectiveness = Math.max(0, Math.min(100, session.metrics.communicationEffectiveness + decision.impact.communication));
    session.metrics.businessContinuity = Math.max(0, Math.min(100, session.metrics.businessContinuity + decision.impact.business));
    session.metrics.legalCompliance = Math.max(0, Math.min(100, session.metrics.legalCompliance + decision.impact.legal));
    
    // Mettre à jour l'efficacité globale
    session.metrics.overallEffectiveness = Math.round(
      (session.metrics.technicalResponse * 0.3) +
      (session.metrics.communicationEffectiveness * 0.25) +
      (session.metrics.businessContinuity * 0.25) +
      (session.metrics.legalCompliance * 0.2)
    );
    
    // Stocker la session mise à jour
    activeCrisisSessions.set(sessionId, session);
    
    return res.status(200).json({
      success: true,
      decision,
      timeline: session.timeline,
      metrics: session.metrics
    });
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de la décision:", error);
    return res.status(500).json({ error: "Erreur lors de l'enregistrement de la décision" });
  }
}