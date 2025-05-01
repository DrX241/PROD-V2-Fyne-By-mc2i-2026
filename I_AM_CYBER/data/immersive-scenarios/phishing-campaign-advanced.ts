import { 
  ImmersiveScenario, 
  NPCCharacter, 
  NarrativeArc,
  ScenarioPhase,
  DecisionPoint,
  ScenarioEvent,
  ScenarioMetrics,
  UserRole
} from '../../../shared/types/immersive-cyber';
import { v4 as uuidv4 } from 'uuid';

// Définition des personnages non-joueurs

const ciso: NPCCharacter = {
  id: uuidv4(),
  name: "Nosing Doeuk",
  role: "Directeur de la Cybersécurité",
  avatar: "/assets/characters/nosing-doeuk.jpg",
  expertise: ["Cybersécurité", "Gestion des risques", "Conformité"],
  personality: "Rigoureux, méthodique et stratégique",
  traits: {
    leadership: 8,
    technical: 9,
    communication: 7,
    riskAversion: 8
  },
  behaviorPatterns: {
    underPressure: "Devient plus directif et exige des mises à jour fréquentes",
    whenTeaching: "Utilise des analogies concrètes et pose des questions guidées",
    duringCrisis: "Reste calme et décompose les problèmes en étapes gérables"
  },
  interactionStyle: (context) => {
    if (context.urgency === "high") return "direct et factuel";
    if (context.userExpertise === "beginner") return "pédagogique et patient";
    return "collaboratif et stratégique";
  },
  communicationStyle: "Direct et factuel avec un vocabulaire technique précis. Sait vulgariser quand nécessaire. N'hésite pas à souligner les risques de non-conformité.",
  knowledgeAreas: ["Framework NIST", "ISO 27001", "Analyse de risques", "Forensic", "Threat Intelligence"],
  memoryOfInteractions: []
};

const cto: NPCCharacter = {
  id: uuidv4(),
  name: "Julien Grimault",
  role: "Directeur Technique",
  avatar: "/assets/characters/julien-grimault.jpg",
  expertise: ["Architecture IT", "Développement", "Infrastructure"],
  personality: "Pragmatique et orienté solutions. Voit souvent les contraintes sécurité comme des freins à l'innovation, mais comprend leur importance.",
  backstory: "A grandi avec l'entreprise depuis 8 ans, d'abord comme architecte puis comme DSI. Très apprécié des équipes techniques qui le voient comme un mentor.",
  communicationStyle: "Informel mais précis. Utilise souvent des analogies concrètes pour expliquer des concepts complexes. Pose beaucoup de questions pratiques.",
  knowledgeAreas: ["Cloud Computing", "DevOps", "Microservices", "Automatisation", "API"],
  memoryOfInteractions: []
};

const commsManager: NPCCharacter = {
  id: uuidv4(),
  name: "Marion Lopez",
  role: "Directrice Communication",
  avatar: "/assets/characters/marion-lopez.jpg",
  expertise: ["Communication de crise", "Relations médias", "Communication interne"],
  personality: "Diplomate et attentive aux perceptions. Très sensible à l'image de l'entreprise et aux impacts médiatiques potentiels des incidents.",
  backstory: "Ancienne journaliste, Marion a une compréhension fine des enjeux médiatiques et des réactions du public face aux incidents de sécurité.",
  communicationStyle: "Éloquente et structurée. Privilégie les messages clairs et les expressions positives. Évite le jargon technique.",
  knowledgeAreas: ["Gestion de crise", "Relations presse", "Communication corporate", "Médias sociaux"],
  memoryOfInteractions: []
};

const hrManager: NPCCharacter = {
  id: uuidv4(),
  name: "Isabelle Dubacq",
  role: "Directrice des Ressources Humaines",
  avatar: "/assets/characters/isabelle-dubacq.jpg",
  expertise: ["Gestion du personnel", "Formation", "Relations sociales"],
  personality: "Empathique et orientée solutions humaines. Voit les employés comme des alliés plutôt que des risques.",
  backstory: "Avec plus de 15 ans d'expérience en RH, Isabelle a géré plusieurs restructurations et comprend la dimension humaine des crises d'entreprise.",
  communicationStyle: "Bienveillante et inclusive. Utilise un langage accessible et met l'accent sur le bien-être des employés.",
  knowledgeAreas: ["Droit du travail", "Formation adulte", "Gestion des talents", "Communication interne"],
  memoryOfInteractions: []
};

const securityAnalyst: NPCCharacter = {
  id: uuidv4(),
  name: "Sophie Lambert",
  role: "Analyste SOC Senior",
  avatar: "/assets/characters/security-analyst.jpg",
  expertise: ["Surveillance", "Détection", "Analyse des menaces"],
  personality: "Méthodique et détaillée. Très analytique, peut parfois se perdre dans les détails techniques mais excellente pour repérer les anomalies.",
  backstory: "Ancienne militaire spécialisée dans le renseignement, Sophie a apporté une rigueur exceptionnelle au SOC depuis son arrivée il y a 4 ans.",
  communicationStyle: "Factuelle et précise. Utilise beaucoup de termes techniques. Préfère les données aux opinions.",
  knowledgeAreas: ["SIEM", "EDR", "Threat Hunting", "Malware Analysis", "Indicateurs de compromission"],
  memoryOfInteractions: []
};

const legalAdvisor: NPCCharacter = {
  id: uuidv4(),
  name: "Thomas Mercier",
  role: "Responsable Juridique",
  avatar: "/assets/characters/thomas-mercier.jpg",
  expertise: ["RGPD", "Contrats", "Conformité légale"],
  personality: "Prudent et méticuleux. Privilégie toujours l'approche qui minimise les risques juridiques pour l'entreprise.",
  backstory: "Juriste spécialisé en droit numérique et protection des données depuis plus de 10 ans, Thomas a une connaissance approfondie de toutes les réglementations.",
  communicationStyle: "Formel et précis. S'exprime avec des tournures conditionnelles et pesées. Évite les affirmations trop catégoriques.",
  knowledgeAreas: ["RGPD", "Notification des violations", "Responsabilité des entreprises", "Sécurité des données personnelles"],
  memoryOfInteractions: []
};

const ceo: NPCCharacter = {
  id: uuidv4(),
  name: "Arnaud Gauthier",
  role: "Président",
  avatar: "/assets/characters/arnaud-gauthier.jpg",
  expertise: ["Stratégie d'entreprise", "Management", "Relations clients"],
  personality: "Visionnaire et orienté business. Comprend l'importance de la sécurité mais veut des solutions pragmatiques qui n'entravent pas l'activité.",
  backstory: "Fondateur de l'entreprise, Arnaud a une vision claire de sa mission et de son positionnement. Très respecté dans l'industrie.",
  communicationStyle: "Direct et orienté résultats. Pose des questions stratégiques. S'intéresse aux impacts business avant tout.",
  knowledgeAreas: ["Leadership", "Stratégie", "Finance", "Management de crise"],
  memoryOfInteractions: []
};

// Définition des phases du scénario

// Phase 1: Détection et évaluation initiale
const phase1: ScenarioPhase = {
  id: uuidv4(),
  name: "Détection et évaluation initiale",
  description: "Une campagne de phishing sophistiquée vient d'être détectée ciblant votre entreprise. Plusieurs employés ont déjà cliqué sur des liens malveillants. Vous devez évaluer rapidement la situation et prendre les premières mesures.",
  duration: 15, // minutes
  availableActions: [
    {
      id: uuidv4(),
      name: "Analyser les emails de phishing",
      description: "Examiner les emails signalés pour identifier les caractéristiques de l'attaque",
      requiredRole: ["RSSI", "TechnicalLead"],
      requiredResources: ["SOC Access"],
      timeToComplete: 5,
      consequences: [
        {
          type: "direct",
          metrics: [{ metricId: "situationalAwareness", change: 2 }],
          narrative: "Vous identifiez que les emails proviennent apparemment du service RH et contiennent un lien vers un faux portail de connexion aux services de l'entreprise.",
          triggers: []
        }
      ]
    },
    {
      id: uuidv4(),
      name: "Consulter les logs de connexion",
      description: "Vérifier les journaux d'authentification pour détecter des accès non autorisés",
      requiredRole: ["RSSI", "TechnicalLead"],
      requiredResources: ["Admin Access"],
      timeToComplete: 7,
      consequences: [
        {
          type: "direct",
          metrics: [{ metricId: "situationalAwareness", change: 3 }],
          narrative: "Les logs révèlent plusieurs tentatives de connexion inhabituelles depuis des adresses IP externes sur des comptes dont les identifiants ont été compromis.",
          triggers: []
        }
      ]
    },
    {
      id: uuidv4(),
      name: "Contacter l'équipe de sécurité",
      description: "Organiser une conférence call d'urgence avec l'équipe de sécurité",
      requiredRole: ["RSSI", "CrisisManager", "BusinessContinuityManager"],
      requiredResources: [],
      timeToComplete: 10,
      consequences: [
        {
          type: "direct",
          metrics: [
            { metricId: "teamCoordination", change: 2 },
            { metricId: "responseTime", change: -3 }
          ],
          narrative: "L'équipe de sécurité se mobilise rapidement et commence à coordonner les actions de réponse.",
          triggers: []
        }
      ]
    },
    {
      id: uuidv4(),
      name: "Informer la direction",
      description: "Préparer une note d'information préliminaire pour la direction",
      requiredRole: ["RSSI", "CommunicationManager", "CrisisManager"],
      requiredResources: [],
      timeToComplete: 8,
      consequences: [
        {
          type: "direct",
          metrics: [
            { metricId: "managementSupport", change: 2 },
            { metricId: "organizationalReputation", change: 1 }
          ],
          narrative: "La direction est informée de la situation et vous assure de son soutien pour la gestion de crise.",
          triggers: []
        }
      ]
    }
  ],
  events: [
    {
      id: uuidv4(),
      name: "Alerte du SOC",
      description: "L'équipe du SOC signale une augmentation soudaine des alertes liées à un domaine suspect.",
      triggerCondition: {
        type: "time",
        parameters: { delay: 5 },
        description: "Se déclenche 5 minutes après le début de la phase"
      },
      visibleToRoles: ["RSSI", "TechnicalLead", "CrisisManager"],
      impact: [
        { metricId: "situationalAwareness", change: 1 }
      ],
      relatedCharacters: [securityAnalyst.id],
      narrative: "Sophie Lambert vous contacte: 'Je viens de remarquer une série d'alertes concernant des connexions à un domaine qui imite notre portail RH. Plusieurs postes utilisateurs sont concernés.'"
    },
    {
      id: uuidv4(),
      name: "Signalement d'un employé",
      description: "Un employé vigilant signale avoir reçu un email suspect demandant ses identifiants.",
      triggerCondition: {
        type: "time",
        parameters: { delay: 8 },
        description: "Se déclenche 8 minutes après le début de la phase"
      },
      visibleToRoles: ["RSSI", "CommunicationManager", "HumanResourcesManager"],
      impact: [
        { metricId: "employeeAwareness", change: 1 }
      ],
      relatedCharacters: [hrManager.id],
      narrative: "Isabelle Dubacq vous transfère un message: 'Un employé du service comptabilité vient de me signaler un email suspect qui semble provenir des RH mais qui lui demande de vérifier ses identifiants sur un lien externe.'"
    }
  ],
  notifications: [
    {
      id: uuidv4(),
      title: "Alerte de sécurité",
      content: "Plusieurs emails de phishing détectés ciblant les employés de l'entreprise.",
      type: "warning",
      visibleToRoles: ["RSSI", "CrisisManager", "TechnicalLead"],
      triggerCondition: {
        type: "time",
        parameters: { delay: 0 },
        description: "Se déclenche au début de la phase"
      }
    }
  ],
  decisionPoints: [
    {
      id: uuidv4(),
      title: "Réponse immédiate à l'incident",
      description: "Comment souhaitez-vous répondre immédiatement à cet incident de phishing?",
      context: "Plusieurs emails malveillants ont été identifiés et certains utilisateurs ont déjà cliqué sur les liens. Le temps est un facteur critique.",
      timeLimit: 10,
      options: [
        {
          id: uuidv4(),
          text: "Bloquer immédiatement tous les domaines suspects et réinitialiser les mots de passe de tous les utilisateurs",
          requiredRole: ["RSSI", "TechnicalLead"],
          consequences: [
            {
              type: "direct",
              metrics: [
                { metricId: "securityPosture", change: 3 },
                { metricId: "businessContinuity", change: -4 },
                { metricId: "userSatisfaction", change: -3 }
              ],
              narrative: "Les domaines malveillants sont bloqués rapidement, mais la réinitialisation massive des mots de passe provoque une surcharge du support IT et perturbe l'activité.",
              triggers: []
            }
          ],
          feedback: {
            immediate: "Vous avez opté pour une approche radicale qui sécurise rapidement le système mais au prix d'une perturbation significative des opérations.",
            delayed: "Cette décision a effectivement limité l'exposition, mais a aussi généré une vague de tickets au support IT et des frustrations chez les utilisateurs."
          },
          expertise: [
            { domain: "security_operations", level: 7 },
            { domain: "business_impact", level: 3 }
          ]
        },
        {
          id: uuidv4(),
          text: "Bloquer les domaines suspects et réinitialiser uniquement les mots de passe des utilisateurs ayant interagi avec les emails",
          requiredRole: ["RSSI", "TechnicalLead", "CrisisManager"],
          consequences: [
            {
              type: "direct",
              metrics: [
                { metricId: "securityPosture", change: 2 },
                { metricId: "businessContinuity", change: -1 },
                { metricId: "userSatisfaction", change: -1 },
                { metricId: "incidentContainment", change: 2 }
              ],
              narrative: "Les domaines malveillants sont bloqués et les comptes potentiellement compromis sont sécurisés. La perturbation est limitée aux utilisateurs directement concernés.",
              triggers: []
            }
          ],
          feedback: {
            immediate: "Vous avez choisi une approche équilibrée qui limite l'exposition tout en minimisant l'impact sur les opérations quotidiennes.",
            delayed: "Cette décision s'est avérée efficace, ciblant précisément les risques sans perturber l'ensemble de l'organisation."
          },
          expertise: [
            { domain: "security_operations", level: 8 },
            { domain: "business_impact", level: 7 }
          ]
        },
        {
          id: uuidv4(),
          text: "Observer la situation et collecter plus d'informations avant d'agir",
          requiredRole: ["RSSI", "CrisisManager", "TechnicalLead"],
          consequences: [
            {
              type: "direct",
              metrics: [
                { metricId: "securityPosture", change: -2 },
                { metricId: "businessContinuity", change: 0 },
                { metricId: "situationalAwareness", change: 2 },
                { metricId: "incidentContainment", change: -3 }
              ],
              narrative: "Vous obtenez une meilleure compréhension de l'attaque, mais pendant ce temps, d'autres utilisateurs cliquent sur les liens malveillants, aggravant la situation.",
              triggers: []
            }
          ],
          feedback: {
            immediate: "Vous préférez une approche prudente pour mieux comprendre la menace avant d'agir, au risque de laisser l'incident s'étendre.",
            delayed: "Cette décision a permis de mieux caractériser l'attaque mais a aussi laissé une fenêtre d'opportunité pour que l'incident s'aggrave."
          },
          expertise: [
            { domain: "security_operations", level: 3 },
            { domain: "threat_analysis", level: 8 }
          ]
        },
        {
          id: uuidv4(),
          text: "Envoyer immédiatement une alerte à tous les employés sur les emails malveillants",
          requiredRole: ["CommunicationManager", "RSSI", "HumanResourcesManager"],
          consequences: [
            {
              type: "direct",
              metrics: [
                { metricId: "employeeAwareness", change: 4 },
                { metricId: "securityPosture", change: 1 },
                { metricId: "incidentContainment", change: 1 },
                { metricId: "organizationalReputation", change: 1 }
              ],
              narrative: "Les employés sont rapidement informés, limitant le nombre de nouvelles victimes. Certains s'inquiètent mais apprécient la transparence.",
              triggers: []
            }
          ],
          feedback: {
            immediate: "Vous avez misé sur la sensibilisation immédiate pour réduire la surface d'attaque, une approche qui reconnaît le rôle crucial des employés dans la sécurité.",
            delayed: "Cette communication rapide a effectivement réduit le nombre de victimes potentielles et démontré l'engagement de l'entreprise envers la transparence."
          },
          expertise: [
            { domain: "security_awareness", level: 9 },
            { domain: "communication", level: 8 }
          ]
        }
      ],
      visibleToRoles: ["RSSI", "CrisisManager", "TechnicalLead", "CommunicationManager", "HumanResourcesManager"],
      triggerCondition: {
        type: "time",
        parameters: { delay: 10 },
        description: "Se déclenche 10 minutes après le début de la phase"
      }
    }
  ],
  nextPhases: [
    {
      phaseId: "phase2",
      transitionCondition: {
        type: "decision",
        parameters: { decisionMade: true },
        description: "Transition après la première décision"
      }
    }
  ]
};

// Définition des métriques du scénario
const metrics: ScenarioMetrics = {
  categories: [
    {
      id: "security",
      name: "Sécurité",
      description: "Mesures de l'efficacité des actions de sécurité",
      metrics: [
        {
          id: "securityPosture",
          name: "Posture de sécurité",
          description: "Niveau global de sécurité de l'organisation",
          initialValue: 5,
          min: 0,
          max: 10,
          visibleToRoles: ["RSSI", "TechnicalLead", "CrisisManager"],
          thresholds: [
            {
              value: 3,
              label: "Critique",
              consequence: "Vulnérabilité élevée aux attaques"
            },
            {
              value: 7,
              label: "Sécurisé",
              consequence: "Bonne résistance aux menaces courantes"
            }
          ]
        },
        {
          id: "incidentContainment",
          name: "Confinement de l'incident",
          description: "Capacité à limiter la propagation de l'incident",
          initialValue: 0,
          min: 0,
          max: 10,
          visibleToRoles: ["RSSI", "TechnicalLead", "CrisisManager"],
          thresholds: [
            {
              value: 5,
              label: "Partiellement contenu",
              consequence: "L'incident est sous contrôle mais non résolu"
            },
            {
              value: 8,
              label: "Bien contenu",
              consequence: "L'incident est efficacement isolé"
            }
          ]
        }
      ]
    },
    {
      id: "business",
      name: "Continuité d'activité",
      description: "Impact sur les opérations de l'entreprise",
      metrics: [
        {
          id: "businessContinuity",
          name: "Continuité des opérations",
          description: "Capacité de l'entreprise à maintenir ses activités",
          initialValue: 10,
          min: 0,
          max: 10,
          visibleToRoles: ["BusinessContinuityManager", "CrisisManager", "RSSI"],
          thresholds: [
            {
              value: 3,
              label: "Perturbation majeure",
              consequence: "Opérations significativement ralenties"
            },
            {
              value: 7,
              label: "Opérations normales",
              consequence: "Impact minimal sur les activités"
            }
          ]
        },
        {
          id: "userSatisfaction",
          name: "Satisfaction des utilisateurs",
          description: "Perception des mesures de sécurité par les utilisateurs",
          initialValue: 8,
          min: 0,
          max: 10,
          visibleToRoles: ["HumanResourcesManager", "CommunicationManager"],
          thresholds: [
            {
              value: 4,
              label: "Mécontentement",
              consequence: "Résistance aux mesures de sécurité"
            },
            {
              value: 8,
              label: "Coopération",
              consequence: "Support actif aux initiatives de sécurité"
            }
          ]
        }
      ]
    },
    {
      id: "crisis",
      name: "Gestion de crise",
      description: "Efficacité de la réponse à l'incident",
      metrics: [
        {
          id: "responseTime",
          name: "Temps de réponse",
          description: "Rapidité d'action face à l'incident",
          initialValue: 5,
          min: 0,
          max: 10,
          visibleToRoles: ["RSSI", "CrisisManager"],
          thresholds: [
            {
              value: 3,
              label: "Lent",
              consequence: "Opportunité pour l'attaquant d'aggraver la situation"
            },
            {
              value: 8,
              label: "Rapide",
              consequence: "Limitation efficace des dégâts potentiels"
            }
          ]
        },
        {
          id: "teamCoordination",
          name: "Coordination d'équipe",
          description: "Efficacité de la collaboration entre les équipes",
          initialValue: 5,
          min: 0,
          max: 10,
          visibleToRoles: ["CrisisManager", "RSSI", "HumanResourcesManager"],
          thresholds: [
            {
              value: 4,
              label: "Désorganisée",
              consequence: "Actions contradictoires et inefficacité"
            },
            {
              value: 8,
              label: "Bien coordonnée",
              consequence: "Synergie et efficacité des actions"
            }
          ]
        }
      ]
    },
    {
      id: "perception",
      name: "Perception et communication",
      description: "Gestion de l'image et de la communication",
      metrics: [
        {
          id: "organizationalReputation",
          name: "Réputation de l'organisation",
          description: "Perception externe de la gestion de l'incident",
          initialValue: 7,
          min: 0,
          max: 10,
          visibleToRoles: ["CommunicationManager", "LegalAdvisor"],
          thresholds: [
            {
              value: 4,
              label: "Réputation ternie",
              consequence: "Perte de confiance des parties prenantes"
            },
            {
              value: 8,
              label: "Bonne image",
              consequence: "Renforcement de la confiance externe"
            }
          ]
        },
        {
          id: "employeeAwareness",
          name: "Sensibilisation des employés",
          description: "Niveau de conscience des risques de sécurité",
          initialValue: 4,
          min: 0,
          max: 10,
          visibleToRoles: ["HumanResourcesManager", "CommunicationManager", "RSSI"],
          thresholds: [
            {
              value: 3,
              label: "Peu sensibilisés",
              consequence: "Vulnérabilité accrue aux attaques sociales"
            },
            {
              value: 7,
              label: "Bien conscientisés",
              consequence: "Première ligne de défense efficace"
            }
          ]
        }
      ]
    },
    {
      id: "insight",
      name: "Analyse et compréhension",
      description: "Capacité à comprendre et anticiper la menace",
      metrics: [
        {
          id: "situationalAwareness",
          name: "Conscience situationnelle",
          description: "Compréhension globale de la situation",
          initialValue: 2,
          min: 0,
          max: 10,
          visibleToRoles: ["RSSI", "TechnicalLead", "CrisisManager"],
          thresholds: [
            {
              value: 3,
              label: "Vision limitée",
              consequence: "Décisions basées sur des informations incomplètes"
            },
            {
              value: 7,
              label: "Bonne visibilité",
              consequence: "Décisions éclairées et anticipation des risques"
            }
          ]
        },
        {
          id: "managementSupport",
          name: "Soutien de la direction",
          description: "Niveau d'engagement de la direction dans la résolution de la crise",
          initialValue: 5,
          min: 0,
          max: 10,
          visibleToRoles: ["RSSI", "CrisisManager", "CommunicationManager"],
          thresholds: [
            {
              value: 4,
              label: "Soutien limité",
              consequence: "Manque de ressources et d'autorité"
            },
            {
              value: 8,
              label: "Fort soutien",
              consequence: "Ressources adéquates et priorité claire"
            }
          ]
        }
      ]
    }
  ]
};

// Construction de l'arc narratif principal
const mainArc: NarrativeArc = {
  id: uuidv4(),
  name: "Gestion d'une campagne de phishing sophistiquée",
  description: "Un arc narratif complet pour gérer une campagne de phishing depuis la détection initiale jusqu'à la résolution complète et les leçons apprises.",
  triggerConditions: [
    {
      type: "time",
      parameters: { delay: 0 },
      description: "Cet arc démarre automatiquement au début du scénario"
    }
  ],
  phases: [phase1], // Ajouter les autres phases ici au fur et à mesure
  possibleOutcomes: [
    {
      id: uuidv4(),
      name: "Gestion exemplaire",
      description: "L'incident a été géré de manière exemplaire, avec un impact minimal et des enseignements précieux.",
      conditions: [
        {
          type: "metric",
          parameters: { 
            securityPosture: { min: 8 },
            incidentContainment: { min: 8 },
            organizationalReputation: { min: 8 }
          },
          description: "Excellents résultats sur les métriques clés"
        }
      ],
      metrics: {
        securityPosture: 9,
        incidentContainment: 9,
        organizationalReputation: 9,
        employeeAwareness: 8
      },
      narrative: "Grâce à votre gestion exemplaire, l'attaque de phishing a été rapidement contenue avec un impact minimal. Les employés sont maintenant mieux sensibilisés et l'organisation a renforcé sa posture de sécurité. Cette expérience a même amélioré la réputation de l'entreprise auprès de ses partenaires.",
      debriefing: "Votre approche équilibrée entre actions techniques, communication transparente et implication des employés a créé une réponse synergique qui a non seulement résolu l'incident mais a transformé cette menace en opportunité d'amélioration.",
      learningPoints: [
        "Une réponse rapide et proportionnée est essentielle pour contenir un incident de phishing",
        "La communication transparente renforce la confiance des parties prenantes",
        "L'implication des employés transforme les utilisateurs en première ligne de défense"
      ]
    },
    {
      id: uuidv4(),
      name: "Gestion technique efficace mais impact business",
      description: "L'incident a été contenu techniquement mais au prix d'une perturbation significative des activités.",
      conditions: [
        {
          type: "metric",
          parameters: { 
            securityPosture: { min: 7 },
            incidentContainment: { min: 7 },
            businessContinuity: { max: 5 }
          },
          description: "Bon confinement mais impact business important"
        }
      ],
      metrics: {
        securityPosture: 8,
        incidentContainment: 8,
        businessContinuity: 4,
        userSatisfaction: 3
      },
      narrative: "Vous avez réussi à contenir l'attaque de phishing avec des mesures techniques efficaces, mais ces actions ont perturbé significativement les opérations de l'entreprise. Les utilisateurs sont mécontents des contraintes imposées, créant des tensions internes.",
      debriefing: "Votre priorité donnée à la sécurité a effectivement protégé les systèmes, mais l'équilibre avec les besoins opérationnels a été insuffisant. Pour les incidents futurs, une approche plus nuancée permettrait de maintenir la sécurité tout en préservant la continuité d'activité.",
      learningPoints: [
        "L'équilibre entre sécurité et continuité d'activité est crucial",
        "La communication sur les contraintes temporaires peut améliorer l'acceptation",
        "Des solutions graduelles peuvent offrir un meilleur compromis que des mesures radicales"
      ]
    }
  ],
  adaptivityRules: [
    {
      id: uuidv4(),
      condition: {
        type: "metric",
        parameters: { situationalAwareness: { max: 3 } },
        description: "Faible conscience situationnelle"
      },
      adjustments: {
        difficulty: -2,
        additionalResources: ["Rapport d'analyse simplifié", "Recommandations de l'équipe SOC"]
      },
      explanation: "Si le joueur a une faible compréhension de la situation, fournir plus d'informations et simplifier légèrement les décisions suivantes."
    },
    {
      id: uuidv4(),
      condition: {
        type: "metric",
        parameters: { situationalAwareness: { min: 8 } },
        description: "Excellente conscience situationnelle"
      },
      adjustments: {
        difficulty: 2,
        availableTime: -10
      },
      explanation: "Si le joueur démontre une excellente compréhension, augmenter la complexité et la pression temporelle pour maintenir le défi."
    }
  ]
};

// Définition du scénario complet
export const phishingCampaignAdvanced: ImmersiveScenario = {
  id: 'phishing-campaign-advanced-001',
  title: "Campagne de phishing sophistiquée",
  description: "Une campagne de phishing sophistiquée cible votre entreprise. En tant que responsable sécurité, vous devez orchestrer la réponse à cet incident, de la détection initiale à la résolution complète et aux leçons apprises.",
  difficulty: "Intermédiaire",
  sector: "RETAIL & LUXE",
  companyProfile: {
    name: "ELITE RETAIL SECURITY",
    sector: "RETAIL & LUXE",
    size: "ETI",
    revenue: "250 millions €",
    employeeCount: 1200,
    locations: ["Paris (siège)", "Lyon", "Bordeaux", "Milan", "Bruxelles"],
    infrastructure: {
      cloudServices: ["Microsoft 365", "Azure", "Salesforce"],
      onPremSystems: ["SAP Retail", "Systèmes de caisses", "Entrepôt logistique"],
      criticalApplications: ["ERP Retail", "CRM", "Système d'inventaire", "Plateforme e-commerce"],
      securityTools: ["EDR", "SIEM", "Email Gateway", "MFA"],
      networkTopology: "Réseau hybride avec VPN pour les magasins distants et SD-WAN pour le siège",
      dataClassification: [
        {
          category: "Données clients",
          sensitivity: "Confidentiel",
          storageLocations: ["CRM", "Base de données marketing"],
          regimes: ["RGPD", "Loi Informatique et Libertés"]
        },
        {
          category: "Données financières",
          sensitivity: "Secret",
          storageLocations: ["ERP", "Finance Database"],
          regimes: ["PCI-DSS", "Normes comptables"]
        }
      ]
    },
    businessCriticalSystems: ["Système de caisse", "Site e-commerce", "Gestion des stocks", "Supply chain"],
    regulatoryObligations: ["RGPD", "PCI-DSS", "Loi Informatique et Libertés", "Droit du travail"],
    stakeholders: [
      {
        name: "Arnaud Gauthier",
        role: "Président",
        influence: 10,
        interests: ["Croissance", "Image de marque", "Innovation"],
        attitude: "Supportive"
      },
      {
        name: "Comité exécutif",
        role: "Direction",
        influence: 8,
        interests: ["Performance", "Gestion des risques"],
        attitude: "Neutral"
      },
      {
        name: "Employés en magasin",
        role: "Vendeurs et responsables",
        influence: 5,
        interests: ["Facilité d'utilisation", "Efficacité"],
        attitude: "Neutral"
      }
    ]
  },
  availableRoles: ["RSSI", "CrisisManager", "CommunicationManager", "TechnicalLead", "HumanResourcesManager", "LegalAdvisor", "BusinessContinuityManager"],
  narrativeArcs: [mainArc],
  characters: [ciso, cto, commsManager, hrManager, securityAnalyst, legalAdvisor, ceo],
  initialSituation: `
OBJET: [URGENT] Alerte de sécurité - Incident d'ingénierie sociale en cours

${new Date().toLocaleDateString('fr-FR')} - 09:47

Bonjour,

Je vous contacte en urgence suite à la détection d'une campagne d'ingénierie sociale sophistiquée ciblant actuellement ELITE RETAIL SECURITY. Notre SOC a identifié plusieurs tentatives d'accès non autorisés aux systèmes critiques dans les dernières heures.

SITUATION ACTUELLE:
- 17 employés ont déjà interagi avec des emails malveillants
- 3 tentatives d'accès suspectes aux systèmes de gestion des stocks
- Potentielle compromission des identifiants VPN
- Les attaquants semblent avoir une connaissance approfondie de notre structure interne

Une pièce jointe cruciale contenant l'analyse préliminaire de l'incident et les recommandations initiales a été incluse. Vous devez impérativement l'examiner et identifier le mot de passe de sécurité qui y est dissimulé pour accéder aux systèmes de réponse à incident.

ACTIONS REQUISES IMMÉDIATEMENT:
1. Analyser la pièce jointe en priorité
2. Identifier et communiquer le mot de passe de sécurité
3. Préparer le plan de réponse initial

Nous comptons sur votre expertise pour gérer cette situation avec la plus grande attention.

Cordialement,
Sophie Lambert
Analyste SOC Senior
ELITE RETAIL SECURITY
`,
  timeframe: "Le scénario se déroule sur 3 heures simulées, avec des décisions critiques à prendre dans les premières 30 minutes.",
  assets: {
    documents: [
      {
        id: uuidv4(),
        name: "Procédure de réponse aux incidents",
        type: "procedure",
        content: "Document détaillant les étapes standard de réponse aux incidents de cybersécurité dans l'organisation.",
        visibleToRoles: ["RSSI", "CrisisManager", "TechnicalLead"]
      },
      {
        id: uuidv4(),
        name: "Plan de communication de crise",
        type: "plan",
        content: "Modèles et procédures pour la communication interne et externe en cas d'incident de sécurité.",
        visibleToRoles: ["CommunicationManager", "RSSI", "LegalAdvisor"]
      },
      {
        id: uuidv4(),
        name: "Exemple d'email de phishing",
        type: "email",
        content: "Copie d'un des emails malveillants utilisés dans cette campagne de phishing.",
        visibleToRoles: ["RSSI", "TechnicalLead", "CommunicationManager"]
      }
    ],
    tools: [
      {
        id: uuidv4(),
        name: "Dashboard SOC",
        description: "Interface du SIEM montrant les alertes et événements de sécurité en temps réel",
        capabilities: ["Visualisation des alertes", "Analyse des logs", "Timeline des événements"],
        requiredRole: ["RSSI", "TechnicalLead"],
        usage: "Utilisez le dashboard pour suivre les alertes et comprendre l'évolution de l'incident"
      },
      {
        id: uuidv4(),
        name: "Outil de communication interne",
        description: "Plateforme permettant d'envoyer des messages ciblés ou généraux aux employés",
        capabilities: ["Notifications", "Emails groupés", "Messages d'alerte"],
        requiredRole: ["CommunicationManager", "HumanResourcesManager"],
        usage: "Utilisez cet outil pour informer rapidement les employés des menaces ou des actions à entreprendre"
      }
    ],
    simulatedSystems: [
      {
        id: uuidv4(),
        name: "Console EDR",
        type: "logs",
        interface: "Interface de gestion des endpoints montrant les activités suspectes",
        capabilities: ["Isolation de machine", "Analyse de processus", "Détection d'anomalies"]
      },
      {
        id: uuidv4(),
        name: "Email Gateway",
        type: "email",
        interface: "Interface de gestion des règles de filtrage email",
        capabilities: ["Blocage d'expéditeurs", "Mise en quarantaine", "Règles de filtrage"]
      }
    ]
  },
  metrics,
  learningObjectives: [
    "Comprendre les étapes clés de la gestion d'un incident de phishing",
    "Maîtriser l'équilibre entre sécurité et continuité d'activité",
    "Développer des compétences en communication de crise",
    "Apprendre à coordonner efficacement les différentes parties prenantes",
    "Mettre en place des mesures préventives pour éviter les incidents futurs"
  ]
};