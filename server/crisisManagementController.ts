import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { openAIService } from "./services/openai";
import { ChatCompletionRequestMessage } from "@shared/schema";

// Interface pour les sessions de gestion de crise
interface StakeholderMessage {
  stakeholderId: string;
  timestamp: number;
  content: string;
  sentiment: 'positive' | 'neutral' | 'negative' | 'urgent';
  read: boolean;
}

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
  stakeholderMessages: StakeholderMessage[]; // Messages envoyés par les parties prenantes
  activeStakeholder?: string; // ID du stakeholder avec qui l'utilisateur communique actuellement
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
  personality?: string; // Description de la personnalité pour le prompt IA
  systemPrompt?: string; // Prompt système spécifique à ce stakeholder
  avatar?: string; // URL de l'avatar/image du stakeholder
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
  financialImpact: number; // Impact financier en milliers d'euros
  operationalImpact: number; // % des opérations affectées (0-100)
  customerImpact: number; // % des clients affectés (0-100)
  executivePressure: number; // Niveau de pression de la direction (0-10)
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

// Catégories d'événements aléatoires pour dynamiser la simulation
const randomEventCategories = {
  technical: [
    {
      title: "Nouvelle variante de ransomware détectée",
      description: "Une analyse plus approfondie révèle que l'attaque utilise une variante avancée du ransomware, capable d'échapper à certaines de nos mesures de détection.",
      severity: "high",
      impact: "Les systèmes précédemment considérés comme sécurisés pourraient être compromis."
    },
    {
      title: "Propagation accélérée",
      description: "Le ransomware se propage plus rapidement que prévu et atteint maintenant des systèmes dans un autre réseau isolé.",
      severity: "critical",
      impact: "La portée de l'infection s'étend, compromettant davantage de données et de systèmes."
    },
    {
      title: "Défaillance des sauvegardes",
      description: "Certaines sauvegardes considérées comme sûres semblent avoir été corrompues ou sont inaccessibles.",
      severity: "critical",
      impact: "La stratégie de restauration doit être révisée d'urgence."
    },
    {
      title: "Vulnérabilité zero-day exploitée",
      description: "L'analyse des logs révèle que les attaquants ont exploité une vulnérabilité zero-day dans notre infrastructure.",
      severity: "high",
      impact: "Nos défenses standard n'ont pas pu bloquer cette attaque sophistiquée."
    },
    {
      title: "Suppression des journaux d'événements",
      description: "Les attaquants ont tenté d'effacer leurs traces en supprimant les journaux d'événements sur plusieurs serveurs.",
      severity: "medium",
      impact: "L'investigation forensique devient plus complexe et limitée."
    }
  ],
  business: [
    {
      title: "Arrêt de la production",
      description: "La ligne de production principale est maintenant complètement à l'arrêt en raison de l'indisponibilité des systèmes de contrôle.",
      severity: "critical",
      impact: "Chaque heure d'arrêt représente une perte estimée à 50 000€."
    },
    {
      title: "Impossible de traiter les commandes clients",
      description: "Le système de gestion des commandes est hors service, empêchant le traitement des nouvelles commandes et l'expédition des commandes en cours.",
      severity: "high",
      impact: "Les clients sont informés de retards indéterminés."
    },
    {
      title: "Services clients affectés",
      description: "Les équipes du service client n'ont plus accès aux dossiers et à l'historique des clients.",
      severity: "medium",
      impact: "Augmentation du temps de résolution des problèmes et du mécontentement client."
    },
    {
      title: "Contrats en suspens",
      description: "Des négociations contractuelles importantes sont en suspens car les documents nécessaires sont inaccessibles.",
      severity: "high",
      impact: "Risque de perdre des opportunités commerciales significatives."
    },
    {
      title: "Systèmes de facturation hors service",
      description: "Le système de facturation automatisé est inopérant, empêchant l'émission de nouvelles factures et le suivi des paiements.",
      severity: "medium",
      impact: "Retards dans le cycle de revenus et problèmes de trésorerie potentiels."
    }
  ],
  communication: [
    {
      title: "Fuite dans la presse",
      description: "Un média national a publié un article sur notre incident de cybersécurité avec des détails précis.",
      severity: "high",
      impact: "L'information est maintenant publique, créant une pression médiatique supplémentaire."
    },
    {
      title: "Inquiétudes des actionnaires",
      description: "Plusieurs actionnaires majeurs ont contacté la direction pour exprimer leurs inquiétudes sur l'impact financier de l'incident.",
      severity: "medium",
      impact: "Le cours de l'action pourrait être affecté dans les prochaines heures."
    },
    {
      title: "Questions des autorités de régulation",
      description: "L'autorité de régulation du secteur demande des clarifications officielles sur la nature et l'étendue de l'incident.",
      severity: "high",
      impact: "Une réponse officielle documentée est requise sous 24 heures."
    },
    {
      title: "Inquiétudes des employés",
      description: "Des rumeurs circulent parmi les employés, certains craignant pour la sécurité de leurs données personnelles.",
      severity: "medium",
      impact: "Baisse de la productivité et risque de fuites d'informations supplémentaires."
    },
    {
      title: "Message des attaquants",
      description: "Un nouveau message des attaquants indique qu'ils ont commencé à exfiltrer des données sensibles.",
      severity: "critical",
      impact: "La menace évolue d'un ransomware pur vers une double extorsion."
    }
  ],
  executive: [
    {
      title: "Intervention du PDG",
      description: "Le PDG exige une résolution rapide et un briefing toutes les 2 heures sur l'avancement de la situation.",
      severity: "high",
      impact: "Pression accrue sur les équipes de gestion de crise."
    },
    {
      title: "Conseil d'administration extraordinaire",
      description: "Un conseil d'administration extraordinaire est convoqué pour discuter de la crise et de ses implications.",
      severity: "high",
      impact: "La direction doit préparer un rapport détaillé sur la situation et les actions entreprises."
    },
    {
      title: "Pressions du conseil d'administration",
      description: "Le conseil d'administration exprime son mécontentement quant à la préparation de l'entreprise face aux cybermenaces.",
      severity: "medium",
      impact: "La position du RSSI et du DSI pourrait être remise en question."
    },
    {
      title: "Demande d'explication du comité d'audit",
      description: "Le comité d'audit demande une explication détaillée sur les contrôles de sécurité en place avant l'incident.",
      severity: "medium",
      impact: "Un audit complet des mesures de cybersécurité sera probablement mandaté."
    },
    {
      title: "Ultimatum de la direction",
      description: "La direction générale donne 12 heures pour rétablir les systèmes critiques avant d'envisager des mesures plus drastiques.",
      severity: "critical",
      impact: "L'équipe de gestion de crise est sous pression maximale."
    }
  ],
  legal: [
    {
      title: "Notification obligatoire CNIL",
      description: "L'analyse juridique confirme l'obligation de notifier la CNIL de la violation dans les 72 heures.",
      severity: "high",
      impact: "Une documentation précise de l'incident et des mesures prises est requise d'urgence."
    },
    {
      title: "Risques contractuels",
      description: "Les clauses SLA de plusieurs contrats majeurs pourraient être violées en raison de l'indisponibilité prolongée des services.",
      severity: "high",
      impact: "Exposition à des pénalités potentiellement significatives."
    },
    {
      title: "Action collective potentielle",
      description: "Un cabinet d'avocats a contacté l'entreprise concernant une possible action collective au nom des clients affectés.",
      severity: "medium",
      impact: "Risque de litige à long terme et de réputation."
    },
    {
      title: "Analyse des implications RGPD",
      description: "L'équipe juridique a identifié que des données personnelles sensibles ont probablement été compromises.",
      severity: "high",
      impact: "Les amendes RGPD peuvent atteindre 4% du chiffre d'affaires mondial annuel."
    },
    {
      title: "Assurance cyber questionnable",
      description: "L'assureur demande des preuves que toutes les mesures de sécurité déclarées étaient effectivement en place.",
      severity: "high",
      impact: "La couverture d'assurance pourrait être refusée en cas de négligence prouvée."
    }
  ]
};

// Scénarios pré-configurés
const predefinedScenarios: CrisisScenario[] = [
  {
    id: "ransomware-industrie",
    title: "Ransomware chez TechnoManufacture",
    category: "ransomware",
    difficulty: "avancé",
    description: "Une entreprise industrielle majeure est victime d'une attaque ransomware sophistiquée qui paralyse sa production et menace d'exposer des données sensibles.",
    initialSituation: "En tant que RSSI de TechnoManufacture, entreprise industrielle de 2000 employés et leader dans la fabrication de composants critiques, vous êtes alerté à 5h30 du matin par le SOC. Un ransomware sophistiqué a chiffré une grande partie des systèmes informatiques et industriels. La production est complètement arrêtée sur trois sites. Les attaquants demandent 2 millions d'euros en cryptomonnaie et menacent de publier 15 Go de données confidentielles (plans techniques, informations clients et fournisseurs) si le paiement n'est pas effectué sous 48 heures. Les premiers éléments d'investigation suggèrent que l'infection initiale a eu lieu il y a plusieurs semaines, via un phishing ciblé contre un cadre dirigeant.",
    objectives: [
      "Évaluer l'étendue et la gravité de la compromission",
      "Établir une stratégie de réponse face à la demande de rançon",
      "Maintenir la continuité des activités critiques",
      "Gérer les communications internes et externes",
      "Coordonner les aspects juridiques et réglementaires",
      "Planifier et exécuter la restauration des systèmes"
    ],
    totalStages: 8,
    timeLimit: 120,
    stakeholders: [
      {
        id: "coo",
        role: "Directeur des Opérations",
        name: "Paul Deschamps",
        department: "Opérations",
        expertise: ["production industrielle", "gestion de crise"],
        attitude: "resistant",
        availability: 8,
        personality: "Pragmatique et orienté résultats, Paul est souvent impatient. Il s'inquiète avant tout de l'impact sur la production et les délais de livraison. Il a tendance à vouloir reprendre rapidement les opérations, parfois au détriment de la sécurité.",
        systemPrompt: "Tu es Paul Deschamps, Directeur des Opérations. Ta priorité absolue est de maintenir les opérations en cours et de minimiser l'impact sur la production. Tu es pragmatique, direct et parfois impatient. Tu utilises un langage orienté business, avec des termes comme 'retour sur investissement', 'impact opérationnel', 'pertes financières'. Tu t'exprimes de façon concise, avec des phrases courtes et directes. Tu es souvent frustré par les mesures de sécurité qui ralentissent la production. Tu poses fréquemment des questions comme 'Quand pourrons-nous reprendre les opérations?' ou 'Quel est l'impact financier?'. Tu dois approuver toute décision qui pourrait affecter significativement les opérations."
      },
      {
        id: "sec-officer",
        role: "Responsable Sécurité",
        name: "Amélie Leclerc",
        department: "Cybersécurité",
        expertise: ["sécurité réseau", "gestion des incidents", "analyse forensique"],
        attitude: "helpful",
        availability: 10,
        personality: "Méthodique et analytique, Amélie est la voix de la raison technique. Elle insiste sur l'importance de suivre les procédures de sécurité et d'analyser l'incident avant d'agir. Elle parle avec précision et utilise des termes techniques appropriés.",
        systemPrompt: "Tu es Amélie Leclerc, Responsable Sécurité. Tu es méthodique, analytique et précise dans tes communications. Tu utilises un vocabulaire technique approprié (IOC, TTPs, forensique, vecteur d'attaque, etc.) sans être trop jargonnante. Tu insistes sur l'importance de comprendre l'étendue de la compromission avant d'agir. Ta priorité est de contenir l'incident et de préserver les preuves pour l'analyse forensique. Tu recommandes toujours des mesures de précaution et préfères isoler les systèmes plutôt que de risquer une propagation. Tu poses souvent des questions comme 'Avons-nous isolé tous les systèmes potentiellement compromis?' ou 'Pouvons-nous identifier le vecteur initial d'infection?'."
      },
      {
        id: "comm-dir",
        role: "Directrice Communication",
        name: "Sophie Martin",
        department: "Communication",
        expertise: ["relations presse", "communication de crise", "réseaux sociaux"],
        attitude: "neutral",
        availability: 7,
        personality: "Sophie est diplomate et soucieuse de l'image de l'entreprise. Elle pense constamment à la façon dont l'incident pourrait être perçu par les clients, les médias et le public. Elle préfère une communication transparente mais maîtrisée.",
        systemPrompt: "Tu es Sophie Martin, Directrice Communication. Tu es diplomate, posée et stratégique dans tes interventions. Ta principale préoccupation est de gérer la perception externe de l'incident et de protéger la réputation de l'entreprise. Tu utilises un langage clair et précis, en évitant le jargon technique quand tu parles aux autres. Tu insistes souvent sur l'importance de communiquer de façon transparente mais contrôlée. Tu poses des questions comme 'Que devons-nous dire à nos clients?' ou 'Devrions-nous faire une déclaration publique?'. Tu proposes souvent des messages clés et des stratégies de communication adaptées à différents publics (clients, employés, médias, autorités)."
      },
      {
        id: "legal",
        role: "Directeur Juridique",
        name: "Thomas Rousseau",
        department: "Juridique",
        expertise: ["conformité RGPD", "contrats clients", "litiges"],
        attitude: "neutral",
        availability: 6,
        personality: "Thomas est prudent et méticuleux. Il s'inquiète des implications légales et réglementaires de l'incident. Il parle de manière formelle et structurée, et insiste sur les obligations légales de l'entreprise, notamment en termes de notification et de protection des données.",
        systemPrompt: "Tu es Thomas Rousseau, Directeur Juridique. Tu es prudent, méticuleux et formel dans tes communications. Tu utilises un langage juridique précis mais accessible. Ta principale préoccupation est la conformité aux obligations légales et réglementaires, particulièrement le RGPD et les obligations de notification des violations de données. Tu soulignes souvent les risques de sanctions et de litiges. Tu poses des questions comme 'Des données personnelles ont-elles été compromises?' ou 'Sommes-nous tenus de notifier la CNIL?'. Tu rappelles fréquemment les délais légaux (72 heures pour notifier une violation de données sous RGPD) et les risques juridiques potentiels."
      },
      {
        id: "cto",
        role: "Directeur Technique",
        name: "Nicolas Blanc",
        department: "IT",
        expertise: ["infrastructure", "DevOps", "cloud"],
        attitude: "helpful",
        availability: 9,
        personality: "Nicolas est innovant et orienté solutions. Il comprend les aspects techniques mais peut également les traduire en termes business. Il est collaboratif et cherche des solutions pragmatiques aux problèmes, en équilibrant sécurité et fonctionnalité.",
        systemPrompt: "Tu es Nicolas Blanc, Directeur Technique. Tu es pragmatique, orienté solutions et collaboratif. Tu comprends profondément les aspects techniques mais sais les expliquer en termes simples. Tu te préoccupes de l'infrastructure IT et des applications critiques. Tu cherches à trouver un équilibre entre la sécurité et la continuité des services. Tu poses des questions comme 'Pouvons-nous restaurer les systèmes à partir des sauvegardes?' ou 'Quelles alternatives techniques pouvons-nous mettre en place rapidement?'. Tu proposes souvent des solutions techniques innovantes et des plans de remédiation clairs."
      },
      {
        id: "ceo",
        role: "PDG",
        name: "Jean-François Moreau",
        department: "Direction Générale",
        expertise: ["stratégie d'entreprise", "relations investisseurs", "gestion de crise"],
        attitude: "neutral",
        availability: 5,
        personality: "Jean-François a une vision stratégique et s'intéresse à l'impact global de la crise sur l'entreprise. Il est charismatique mais peut être très direct sous pression. Il attend des informations claires et des recommandations concrètes.",
        systemPrompt: "Tu es Jean-François Moreau, PDG. Tu es stratégique, décisif et direct. Tu t'exprimes de manière claire et autoritaire. Tu t'intéresses principalement à l'impact global de la crise sur l'entreprise, sa réputation et ses finances. Tu attends des informations synthétiques et des recommandations concrètes de la part de ton équipe. Sous pression, tu peux devenir impatient et exigeant. Tu poses des questions comme 'Quel est le pire scénario possible?' ou 'Quelles sont nos options stratégiques?'. Tu t'inquiètes de la confiance des clients et des actionnaires. Tu veux être impliqué dans toutes les décisions majeures, notamment celles qui concernent la communication externe ou les décisions financières importantes."
      }
    ],
    potentialOutcomes: [
      {
        id: "best",
        title: "Gestion exemplaire de la crise",
        description: "Vous avez réussi à minimiser l'impact du ransomware, à restaurer les systèmes sans payer de rançon, et à maintenir la confiance des parties prenantes. L'incident a même servi à renforcer la sécurité de l'entreprise.",
        conditions: {
          technicalResponse: 85,
          communicationEffectiveness: 80,
          businessContinuity: 70,
          legalCompliance: 90
        }
      },
      {
        id: "good",
        title: "Crise bien gérée",
        description: "Vous avez réussi à gérer efficacement la situation, avec un impact limité sur les opérations. Quelques points auraient pu être améliorés, mais l'entreprise se remet rapidement.",
        conditions: {
          technicalResponse: 70,
          communicationEffectiveness: 65,
          businessContinuity: 60,
          legalCompliance: 75
        }
      },
      {
        id: "average",
        title: "Gestion passable",
        description: "Votre gestion a permis de limiter certains dégâts, mais l'entreprise a subi des pertes significatives. Plusieurs semaines seront nécessaires pour un retour à la normale.",
        conditions: {
          technicalResponse: 50,
          communicationEffectiveness: 50,
          businessContinuity: 40,
          legalCompliance: 60
        }
      },
      {
        id: "bad",
        title: "Crise mal gérée",
        description: "Votre gestion de crise a été déficiente, entraînant des pertes importantes et une atteinte durable à la réputation de l'entreprise. La confiance des clients et partenaires est fortement compromise.",
        conditions: {
          technicalResponse: 30,
          communicationEffectiveness: 30,
          businessContinuity: 20,
          legalCompliance: 40
        }
      }
    ]
  },
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
      reputationProtection: 50,
      financialImpact: 0,
      operationalImpact: 10,
      customerImpact: 5,
      executivePressure: 3
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
      stakeholderMessages: [], // Initialiser les messages des parties prenantes
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
    const response = await openAIService.getChatCompletion(session.messages, false, 0.7, 2000);
    
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
    
    // Potentiellement générer des messages de stakeholders
    await generateStakeholderMessages(session);
    
    // Obtenir les messages non lus des stakeholders
    const unreadMessages = session.stakeholderMessages
      .filter(msg => !msg.read)
      .map(msg => {
        // Trouver les infos du stakeholder
        const stakeholder = session.scenario.stakeholders.find(s => s.id === msg.stakeholderId);
        return {
          id: uuidv4(), // Générer un ID unique pour ce message côté client
          stakeholderId: msg.stakeholderId,
          stakeholderName: stakeholder?.name || "Inconnu",
          stakeholderRole: stakeholder?.role || "Inconnu",
          department: stakeholder?.department || "Inconnu",
          content: msg.content,
          timestamp: msg.timestamp,
          sentiment: msg.sentiment
        };
      });
    
    return res.status(200).json({
      success: true,
      message: response,
      timeline: session.timeline,
      metrics: session.metrics,
      resources: session.resources,
      currentStage: session.currentStage,
      elapsedTime: session.elapsedTime,
      status: session.status,
      isCompleted: false,
      stakeholderMessages: unreadMessages
    });
  } catch (error) {
    console.error("Erreur lors de l'envoi du message:", error);
    return res.status(500).json({ error: "Erreur lors du traitement du message" });
  }
}

/**
 * Génère un message d'un stakeholder en fonction de la situation actuelle
 */
async function generateStakeholderMessage(session: CrisisSession, stakeholderId: string): Promise<StakeholderMessage | null> {
  try {
    const stakeholder = session.scenario.stakeholders.find(s => s.id === stakeholderId);
    if (!stakeholder) return null;
    
    // Vérifier si le stakeholder est disponible (basé sur son niveau de disponibilité)
    const availabilityFactor = stakeholder.availability / 10; // Convertir en probabilité (0-1)
    if (Math.random() > availabilityFactor) return null;
    
    // Construire le prompt pour l'IA
    const systemPrompt = stakeholder.systemPrompt || 
      `Tu es ${stakeholder.name}, ${stakeholder.role} chez TechnoManufacture. Tu dois réagir à la situation de crise actuelle en fonction de ton expertise et de ta personnalité. Réponds de manière concise en quelques phrases seulement.`;
    
    // Construire un contexte basé sur les métriques actuelles
    let situationContext = `Situation actuelle:\n`;
    situationContext += `- Impact opérationnel: ${session.metrics.operationalImpact}%\n`;
    situationContext += `- Impact financier: ${session.metrics.financialImpact}k€\n`;
    situationContext += `- Impact client: ${session.metrics.customerImpact}%\n`;
    situationContext += `- Pression des dirigeants: ${session.metrics.executivePressure}/10\n`;
    situationContext += `- Efficacité technique: ${session.metrics.technicalResponse}/100\n`;
    situationContext += `- Efficacité de communication: ${session.metrics.communicationEffectiveness}/100\n`;
    situationContext += `- Continuité d'activité: ${session.metrics.businessContinuity}/100\n`;
    situationContext += `- Conformité légale: ${session.metrics.legalCompliance}/100\n\n`;
    
    // Ajouter le dernier événement de la timeline
    const latestEvents = session.timeline.slice(-3).reverse();
    if (latestEvents.length > 0) {
      situationContext += `Derniers événements:\n`;
      latestEvents.forEach(event => {
        situationContext += `- ${event.title}: ${event.description}\n`;
      });
    }
    
    // Liste des dernières décisions
    const latestDecisions = session.decisions.slice(-2).reverse();
    if (latestDecisions.length > 0) {
      situationContext += `\nDernières décisions prises:\n`;
      latestDecisions.forEach(decision => {
        situationContext += `- ${decision.decisionPoint}: Option choisie - ${decision.selectedOption}\n`;
      });
    }
    
    // Créer la requête pour l'IA
    const messages: ChatCompletionRequestMessage[] = [
      { 
        role: "system", 
        content: systemPrompt
      },
      { 
        role: "user", 
        content: `${situationContext}\n\nEn tant que ${stakeholder.role}, quelle est ta réaction à la situation actuelle? Réponds à la première personne en 1-3 phrases. Sois concis.`
      }
    ];
    
    // Obtenir la réponse de l'IA
    const content = await openAIService.getChatCompletion(messages, false, 0.7, 2000);
    
    if (!content) return null;
    
    // Déterminer le sentiment du message
    let sentiment: 'positive' | 'neutral' | 'negative' | 'urgent' = 'neutral';
    
    // Analyse simple basée sur des mots-clés
    const lowerContent = content.toLowerCase();
    const positiveKeywords = ['bien', 'excellent', 'progrès', 'confiant', 'amélioration', 'solution'];
    const negativeKeywords = ['inquiet', 'problème', 'critique', 'grave', 'échec', 'risque'];
    const urgentKeywords = ['immédiatement', 'urgent', 'critique', 'crucial', 'sans délai', 'alarme'];
    
    const positiveScore = positiveKeywords.filter(word => lowerContent.includes(word)).length;
    const negativeScore = negativeKeywords.filter(word => lowerContent.includes(word)).length;
    const urgentScore = urgentKeywords.filter(word => lowerContent.includes(word)).length;
    
    if (urgentScore > 0) {
      sentiment = 'urgent';
    } else if (negativeScore > positiveScore) {
      sentiment = 'negative';
    } else if (positiveScore > negativeScore) {
      sentiment = 'positive';
    }
    
    // Créer le message du stakeholder
    const stakeholderMessage: StakeholderMessage = {
      stakeholderId,
      timestamp: Date.now(),
      content,
      sentiment,
      read: false
    };
    
    return stakeholderMessage;
  } catch (error) {
    console.error("Erreur lors de la génération du message stakeholder:", error);
    return null;
  }
}

/**
 * Génère potentiellement des messages de stakeholders après une interaction
 */
async function generateStakeholderMessages(session: CrisisSession) {
  // Limiter le nombre de messages générés pour ne pas surcharger l'utilisateur
  const maxNewMessages = 2;
  let newMessagesCount = 0;
  
  // Mesurer le niveau de crise global
  const crisisLevel = (
    session.metrics.operationalImpact +
    session.metrics.customerImpact +
    session.metrics.executivePressure * 10 +
    (100 - session.metrics.technicalResponse) +
    (100 - session.metrics.communicationEffectiveness)
  ) / 5; // Moyenne pondérée
  
  // Probabilité de message augmente avec le niveau de crise
  const baseMessageProbability = 0.3 + (crisisLevel / 500); // Entre 0.3 et 0.5
  
  // Parcourir les stakeholders aléatoirement
  const stakeholders = [...session.scenario.stakeholders];
  
  // Mélanger les stakeholders pour ajouter de l'aléatoire
  for (let i = stakeholders.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [stakeholders[i], stakeholders[j]] = [stakeholders[j], stakeholders[i]];
  }
  
  // Essayer de générer des messages pour chaque stakeholder
  for (const stakeholder of stakeholders) {
    if (newMessagesCount >= maxNewMessages) break;
    
    // Probabilité ajustée en fonction du niveau de crise et des centres d'intérêt du stakeholder
    let adjustedProbability = baseMessageProbability;
    
    // Ajuster en fonction du department et de l'état actuel
    if (stakeholder.department === "IT" && session.metrics.technicalResponse < 50) {
      adjustedProbability += 0.2;
    } else if (stakeholder.department === "Communication" && session.metrics.communicationEffectiveness < 50) {
      adjustedProbability += 0.2;
    } else if (stakeholder.department === "Opérations" && session.metrics.operationalImpact > 50) {
      adjustedProbability += 0.2;
    } else if (stakeholder.department === "Juridique" && session.metrics.legalCompliance < 50) {
      adjustedProbability += 0.2;
    } else if (stakeholder.department === "Direction Générale" && session.metrics.executivePressure > 7) {
      adjustedProbability += 0.3;
    }
    
    if (Math.random() < adjustedProbability) {
      const message = await generateStakeholderMessage(session, stakeholder.id);
      if (message) {
        session.stakeholderMessages.push(message);
        newMessagesCount++;
      }
    }
  }
}

/**
 * Génère un événement aléatoire pour augmenter la tension et le réalisme de la simulation
 */
function generateRandomEvent(session: CrisisSession): TimelineEvent | null {
  // Vérifier si on doit générer un événement (probabilité calculée en fonction du temps et de la difficulté)
  const difficultyFactor = session.scenario.difficulty === 'expert' ? 0.3 : 
                          session.scenario.difficulty === 'avancé' ? 0.25 : 
                          session.scenario.difficulty === 'intermédiaire' ? 0.2 : 0.15;
  
  const timeElapsedMinutes = session.elapsedTime / 60000;
  const timeProgressFactor = Math.min(1, timeElapsedMinutes / (session.scenario.timeLimit * 0.5));
  const randomChance = Math.random();
  
  // Plus le temps avance et plus la difficulté est élevée, plus la chance d'avoir un événement augmente
  if (randomChance > (0.4 - (difficultyFactor * timeProgressFactor))) {
    return null; // Pas d'événement cette fois
  }
  
  // Sélectionner une catégorie d'événement
  const categoryKeys = ['technical', 'business', 'communication', 'executive', 'legal'];
  // Ajuster les poids en fonction de la situation actuelle
  const weights = [
    0.3 + (session.metrics.technicalResponse < 50 ? 0.1 : 0),   // Technique
    0.2 + (session.metrics.businessContinuity < 50 ? 0.1 : 0),  // Business
    0.2 + (session.metrics.communicationEffectiveness < 50 ? 0.1 : 0), // Communication
    0.15 + (session.metrics.executivePressure > 5 ? 0.1 : 0),    // Exécutif
    0.15 + (session.metrics.legalCompliance < 50 ? 0.1 : 0)      // Légal
  ];
  
  // Normaliser les poids
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const normalizedWeights = weights.map(w => w / totalWeight);
  
  // Sélectionner une catégorie basée sur les poids
  let cumulativeWeight = 0;
  const randomValue = Math.random();
  let selectedCategoryIndex = 0;
  
  for (let i = 0; i < normalizedWeights.length; i++) {
    cumulativeWeight += normalizedWeights[i];
    if (randomValue <= cumulativeWeight) {
      selectedCategoryIndex = i;
      break;
    }
  }
  
  const selectedCategory = categoryKeys[selectedCategoryIndex] as "technical" | "business" | "communication" | "executive" | "legal";
  
  // Utiliser une assertion de type pour indiquer à TypeScript que l'index est valide
  const events = randomEventCategories[selectedCategory];
  
  // Choisir un événement aléatoire dans la catégorie
  const selectedEvent = events[Math.floor(Math.random() * events.length)];
  
  // Créer l'événement timeline
  const timelineEvent: TimelineEvent = {
    id: uuidv4(),
    timestamp: Date.now(),
    type: 'incident',
    title: selectedEvent.title,
    description: selectedEvent.description,
    severity: selectedEvent.severity as 'low' | 'medium' | 'high' | 'critical',
    impact: selectedEvent.impact
  };
  
  // Mettre à jour les métriques en fonction de l'événement
  updateMetricsBasedOnEvent(session, selectedCategory, selectedEvent.severity as 'low' | 'medium' | 'high' | 'critical');
  
  return timelineEvent;
}

/**
 * Met à jour les métriques basées sur l'événement généré
 */
function updateMetricsBasedOnEvent(session: CrisisSession, eventCategory: "technical" | "business" | "communication" | "executive" | "legal", severity: 'low' | 'medium' | 'high' | 'critical') {
  // Facteur d'impact basé sur la sévérité
  const severityFactor = severity === 'critical' ? 0.15 : 
                         severity === 'high' ? 0.1 : 
                         severity === 'medium' ? 0.05 : 0.02;
  
  // Appliquer des impacts différents selon la catégorie
  switch (eventCategory) {
    case 'technical':
      // Les événements techniques affectent principalement la réponse technique et la continuité business
      session.metrics.technicalResponse = Math.max(0, session.metrics.technicalResponse - Math.round(severityFactor * 100));
      session.metrics.operationalImpact = Math.min(100, session.metrics.operationalImpact + Math.round(severityFactor * 100));
      // Augmenter l'impact financier de façon proportionnelle à la sévérité
      session.metrics.financialImpact += severity === 'critical' ? 150 : 
                                        severity === 'high' ? 100 : 
                                        severity === 'medium' ? 50 : 20;
      break;
      
    case 'business':
      // Les événements business affectent principalement la continuité et l'impact client
      session.metrics.businessContinuity = Math.max(0, session.metrics.businessContinuity - Math.round(severityFactor * 100));
      session.metrics.customerImpact = Math.min(100, session.metrics.customerImpact + Math.round(severityFactor * 150));
      session.metrics.financialImpact += severity === 'critical' ? 300 : 
                                        severity === 'high' ? 200 : 
                                        severity === 'medium' ? 100 : 50;
      break;
      
    case 'communication':
      // Les événements de communication affectent principalement la communication et la réputation
      session.metrics.communicationEffectiveness = Math.max(0, session.metrics.communicationEffectiveness - Math.round(severityFactor * 100));
      session.metrics.reputationProtection = Math.max(0, session.metrics.reputationProtection - Math.round(severityFactor * 100));
      // Une crise médiatique augmente la pression de la direction
      session.metrics.executivePressure = Math.min(10, session.metrics.executivePressure + Math.round(severityFactor * 20));
      break;
      
    case 'executive':
      // Les événements exécutifs augmentent fortement la pression et diminuent légèrement l'efficacité de la communication
      session.metrics.executivePressure = Math.min(10, session.metrics.executivePressure + Math.round(severityFactor * 30));
      session.metrics.communicationEffectiveness = Math.max(0, session.metrics.communicationEffectiveness - Math.round(severityFactor * 50));
      break;
      
    case 'legal':
      // Les événements légaux affectent principalement la conformité légale et la réputation
      session.metrics.legalCompliance = Math.max(0, session.metrics.legalCompliance - Math.round(severityFactor * 100));
      session.metrics.reputationProtection = Math.max(0, session.metrics.reputationProtection - Math.round(severityFactor * 70));
      // Une problématique légale peut avoir un gros impact financier
      session.metrics.financialImpact += severity === 'critical' ? 500 : 
                                        severity === 'high' ? 300 : 
                                        severity === 'medium' ? 150 : 50;
      break;
  }
  
  // Recalculer l'efficacité globale
  session.metrics.overallEffectiveness = Math.round(
    (session.metrics.technicalResponse * 0.3) +
    (session.metrics.communicationEffectiveness * 0.25) +
    (session.metrics.businessContinuity * 0.25) +
    (session.metrics.legalCompliance * 0.2)
  );
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
    // Diminuer l'impact opérationnel si des mesures techniques sont prises
    session.metrics.operationalImpact = Math.max(0, session.metrics.operationalImpact - 3);
  }
  
  // Simuler l'impact sur l'efficacité de la communication
  if (lowerUserMsg.includes('communiquer') || lowerUserMsg.includes('informer') || 
      lowerUserMsg.includes('notification') || lowerUserMsg.includes('transparence')) {
    session.metrics.communicationEffectiveness = Math.min(100, session.metrics.communicationEffectiveness + 5);
    // Améliorer la réputation et réduire la pression exécutive avec une bonne communication
    session.metrics.reputationProtection = Math.min(100, session.metrics.reputationProtection + 3);
    session.metrics.executivePressure = Math.max(0, session.metrics.executivePressure - 0.5);
  }
  
  // Simuler l'impact sur la continuité des activités
  if (lowerUserMsg.includes('continuité') || lowerUserMsg.includes('reprise') || 
      lowerUserMsg.includes('backup') || lowerUserMsg.includes('alternative')) {
    session.metrics.businessContinuity = Math.min(100, session.metrics.businessContinuity + 5);
    // Réduire l'impact client et financier
    session.metrics.customerImpact = Math.max(0, session.metrics.customerImpact - 3);
    session.metrics.financialImpact = Math.max(0, session.metrics.financialImpact - 20);
  }
  
  // Simuler l'impact sur la conformité légale
  if (lowerUserMsg.includes('rgpd') || lowerUserMsg.includes('légal') || 
      lowerUserMsg.includes('réglementaire') || lowerUserMsg.includes('notification')) {
    session.metrics.legalCompliance = Math.min(100, session.metrics.legalCompliance + 5);
    // Réduire les risques financiers liés aux sanctions
    session.metrics.financialImpact = Math.max(0, session.metrics.financialImpact - 30);
  }
  
  // Simuler des pénalités pour certains mots-clés
  if (lowerUserMsg.includes('attendre') || lowerUserMsg.includes('reporter') || 
      lowerUserMsg.includes('ignorer') || lowerUserMsg.includes('dissimuler')) {
    session.metrics.technicalResponse = Math.max(0, session.metrics.technicalResponse - 5);
    session.metrics.communicationEffectiveness = Math.max(0, session.metrics.communicationEffectiveness - 5);
    session.metrics.businessContinuity = Math.max(0, session.metrics.businessContinuity - 3);
    session.metrics.legalCompliance = Math.max(0, session.metrics.legalCompliance - 7);
    // Augmenter les impacts négatifs
    session.metrics.financialImpact += 50;
    session.metrics.operationalImpact = Math.min(100, session.metrics.operationalImpact + 5);
    session.metrics.customerImpact = Math.min(100, session.metrics.customerImpact + 5);
    session.metrics.executivePressure = Math.min(10, session.metrics.executivePressure + 1);
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
  
  // Potentiellement générer un événement aléatoire
  // Plus la simulation avance, plus la probabilité augmente
  if (Math.random() < 0.15 + (timePercentUsed * 0.2)) {
    const randomEvent = generateRandomEvent(session);
    if (randomEvent) {
      session.timeline.push(randomEvent);
    }
  }
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
    
    // Sauvegarder le statut précédent
    const previousStatus = session.status;
    
    // Mettre à jour le statut et calculer le temps total
    session.status = 'completed';
    
    if (previousStatus === 'active') {
      session.elapsedTime += Date.now() - session.startTime;
    } else if (previousStatus === 'paused' && session.pausedAt) {
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
    
    const reportContent = await openAIService.getChatCompletion(reportMessages, false, 0.7, 2000);
    
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
 * Marque les messages des stakeholders comme lus
 */
export async function markStakeholderMessagesAsRead(req: Request, res: Response) {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: "SessionID requis" });
    }
    
    const session = activeCrisisSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session non trouvée" });
    }
    
    // Mettre à jour le statut de lecture des messages
    let updatedCount = 0;
    
    // Marquer tous les messages comme lus
    session.stakeholderMessages.forEach(msg => {
      if (!msg.read) {
        msg.read = true;
        updatedCount++;
      }
    });
    
    return res.status(200).json({
      success: true,
      updatedCount
    });
  } catch (error) {
    console.error("Erreur lors du marquage des messages comme lus:", error);
    return res.status(500).json({ error: "Erreur interne du serveur" });
  }
}

/**
 * Répond à un message spécifique d'un stakeholder
 */
export async function respondToStakeholder(req: Request, res: Response) {
  try {
    const { sessionId, stakeholderId, message } = req.body;
    
    if (!sessionId || !stakeholderId || !message) {
      return res.status(400).json({ error: "SessionID, stakeholderId et message requis" });
    }
    
    const session = activeCrisisSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session non trouvée" });
    }
    
    // Trouver le stakeholder
    const stakeholder = session.scenario.stakeholders.find(s => s.id === stakeholderId);
    if (!stakeholder) {
      return res.status(404).json({ error: "Stakeholder non trouvé" });
    }
    
    // Mettre à jour le stakeholder actif
    session.activeStakeholder = stakeholderId;
    
    // Construire le système prompt pour le stakeholder
    const systemPrompt = stakeholder.systemPrompt || 
      `Tu es ${stakeholder.name}, ${stakeholder.role} chez TechnoManufacture. Tu dois répondre au RSSI dans le contexte d'une crise ransomware en fonction de ton expertise, tes préoccupations et ta personnalité. Ta priorité est ${stakeholder.department}.`;
    
    // Construire le contexte de la situation
    let situationContext = `Situation actuelle de la crise ransomware:\n`;
    situationContext += `- Impact opérationnel: ${session.metrics.operationalImpact}%\n`;
    situationContext += `- Impact financier: ${session.metrics.financialImpact}k€\n`;
    situationContext += `- Impact client: ${session.metrics.customerImpact}%\n`;
    situationContext += `- Efficacité technique: ${session.metrics.technicalResponse}/100\n`;
    situationContext += `- Efficacité de communication: ${session.metrics.communicationEffectiveness}/100\n`;
    situationContext += `- Continuité d'activité: ${session.metrics.businessContinuity}/100\n`;
    situationContext += `- Conformité légale: ${session.metrics.legalCompliance}/100\n\n`;
    
    // Créer des messages pour l'IA
    const chatMessages: ChatCompletionRequestMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: `${situationContext}\n\nLe RSSI me dit: "${message}"\n\nJe dois répondre en tant que ${stakeholder.role}, avec ma personnalité et mes préoccupations. Ma réponse doit être concise (1-3 phrases).` }
    ];
    
    // Obtenir la réponse de l'IA
    const response = await openAIService.getChatCompletion(chatMessages, false, 0.7, 2000);
    
    if (!response) {
      return res.status(500).json({ error: "Erreur lors de la génération de la réponse" });
    }
    
    // Impact sur les métriques en fonction du département du stakeholder
    if (stakeholder.department === "Opérations") {
      session.metrics.businessContinuity = Math.min(100, session.metrics.businessContinuity + 3);
      session.metrics.operationalImpact = Math.max(0, session.metrics.operationalImpact - 2);
    } else if (stakeholder.department === "Communication") {
      session.metrics.communicationEffectiveness = Math.min(100, session.metrics.communicationEffectiveness + 3);
      session.metrics.reputationProtection = Math.min(100, session.metrics.reputationProtection + 2);
    } else if (stakeholder.department === "IT") {
      session.metrics.technicalResponse = Math.min(100, session.metrics.technicalResponse + 3);
    } else if (stakeholder.department === "Juridique") {
      session.metrics.legalCompliance = Math.min(100, session.metrics.legalCompliance + 3);
    } else if (stakeholder.department === "Direction Générale") {
      session.metrics.executivePressure = Math.max(0, session.metrics.executivePressure - 1);
      // Amélioration globale plus petite
      session.metrics.overallEffectiveness = Math.min(100, session.metrics.overallEffectiveness + 1);
    }
    
    // Mettre à jour les métriques globales
    session.metrics.overallEffectiveness = Math.round(
      (session.metrics.technicalResponse * 0.3) +
      (session.metrics.communicationEffectiveness * 0.25) +
      (session.metrics.businessContinuity * 0.25) +
      (session.metrics.legalCompliance * 0.2)
    );
    
    // Créer un nouveau message du stakeholder
    const newMessage: StakeholderMessage = {
      stakeholderId,
      timestamp: Date.now(),
      content: response,
      sentiment: 'neutral', // Une analyse plus sophistiquée pourrait déterminer le sentiment
      read: true // Marquer comme lu immédiatement puisque c'est une réponse directe
    };
    
    // Ajouter à la liste des messages
    session.stakeholderMessages.push(newMessage);
    
    // Retourner la réponse
    return res.status(200).json({
      success: true,
      stakeholder: {
        id: stakeholder.id,
        name: stakeholder.name,
        role: stakeholder.role,
        department: stakeholder.department
      },
      response,
      metrics: session.metrics
    });
  } catch (error) {
    console.error("Erreur lors de la réponse au stakeholder:", error);
    return res.status(500).json({ error: "Erreur lors de la réponse au stakeholder" });
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