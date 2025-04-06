import { 
  Mission, 
  Contact, 
  Objective, 
  Decision, 
  availableContacts, 
  getContactByName,
  getExecutiveContacts,
  getEvaluators,
  getEvaluatorsByDomain,
  getDirectContacts
} from '../../../shared/types/cyber';
import { v4 as uuidv4 } from 'uuid';

// Récupérer les contacts spécifiques par leur nom
const yousraSaidani = getContactByName('Yousra Saidani')!;
const arnaudGauthier = getContactByName('Arnaud Gauthier')!;
const olivierHervo = getContactByName('Olivier Hervo')!;
const lorenzoBertola = getContactByName('Lorenzo Bertola')!;
const anthonyFrescal = getContactByName('Anthony Frescal')!;
const julienGrimault = getContactByName('Julien Grimault')!;
const nosingDoeuk = getContactByName('Nosing Doeuk')!;
const thomasMercier = getContactByName('Thomas Mercier')!;
const sarahDumont = getContactByName('Sarah Dumont')!;

// Récupérer les groupes de contacts par rôle
const executives = getExecutiveContacts();
const evaluators = getEvaluators();

// Exemple de mission complexe avec évaluation des décisions
export const exampleMission: Mission = {
  id: uuidv4(),
  title: "Réponse à une attaque ransomware",
  description: "Une attaque par ransomware a été détectée dans le système informatique de l'entreprise. En tant que RSSI, vous devez coordonner la réponse à l'incident et limiter les dégâts.",
  difficulty: "Intermédiaire",
  duration: "45-60 min",
  tags: ["Ransomware", "Gestion de crise", "Incident Response"],
  scenario: "Une activité suspecte a été détectée sur plusieurs serveurs critiques. Certains fichiers semblent être chiffrés et un message de rançon est apparu sur plusieurs postes de travail. En tant que RSSI, vous devez coordonner la réponse à cet incident, identifier l'étendue de la compromission et prendre des décisions cruciales pour protéger les actifs de l'entreprise.",
  companyName: "ELITE RETAIL SECURITY",
  secteurActivite: "RETAIL & LUXE",
  userRole: "RSSI (Responsable de la Sécurité des Systèmes d'Information)",
  currentScore: 0,
  
  // Compétences requises et suivies durant cette mission
  requiredSkills: ["gestion_crise", "analyse_risque", "communication", "decision_rapide", "forensique"],
  skillsProgress: [
    {
      id: "gestion_crise",
      name: "Gestion de crise",
      description: "Capacité à gérer une situation d'urgence et à coordonner les actions",
      category: "leadership",
      level: 0,
      icon: "Shield"
    },
    {
      id: "analyse_risque",
      name: "Analyse de risque",
      description: "Capacité à identifier et évaluer les menaces potentielles",
      category: "analyse",
      level: 0,
      icon: "AlertTriangle"
    },
    {
      id: "communication",
      name: "Communication de crise",
      description: "Capacité à communiquer efficacement avec les parties prenantes",
      category: "communication",
      level: 0,
      icon: "MessageCircle"
    },
    {
      id: "decision_rapide",
      name: "Prise de décision sous pression",
      description: "Capacité à prendre des décisions éclairées en situation d'urgence",
      category: "leadership",
      level: 0,
      icon: "Timer"
    },
    {
      id: "forensique",
      name: "Analyse forensique",
      description: "Capacité à analyser les preuves numériques d'une attaque",
      category: "technique",
      level: 0,
      icon: "Microscope"
    }
  ],
  
  // Événements d'apprentissage survenus durant la mission
  learningEvents: [],
  
  // Contacts disponibles pour cette mission
  contacts: [
    yousraSaidani,
    thomasMercier,
    sarahDumont,
    {
      name: "Michel Dupont",
      role: "Administrateur Systèmes",
      expertise: "Gestion des infrastructures IT, sauvegarde et restauration"
    },
    {
      name: "Sophie Lambert",
      role: "Analyste SOC",
      expertise: "Détection et analyse des incidents de sécurité"
    }
  ],
  
  // Superviseurs qui évalueront les décisions
  supervisors: [
    arnaudGauthier,
    olivierHervo,
    julienGrimault
  ],
  
  // Objectifs structurés de la mission
  objectives: [
    {
      id: uuidv4(),
      description: "Évaluer l'étendue de la compromission et isoler les systèmes affectés",
      completed: false,
      evaluationCriteria: [
        "Identification rapide des systèmes affectés",
        "Isolation appropriée pour limiter la propagation",
        "Préservation des preuves pour analyse ultérieure"
      ],
      decisions: [
        {
          id: uuidv4(),
          description: "Quelle approche initiale adopter face à la détection du ransomware?",
          options: [
            {
              id: uuidv4(),
              text: "Déconnecter immédiatement tous les systèmes du réseau pour arrêter la propagation",
              consequences: {
                positive: ["Arrêt immédiat de la propagation", "Limitation des dégâts potentiels"],
                negative: ["Perturbation majeure des activités", "Perte des traces en mémoire vive"]
              },
              score: 5
            },
            {
              id: uuidv4(),
              text: "Isoler uniquement les systèmes identifiés comme infectés tout en surveillant le reste",
              consequences: {
                positive: ["Continuité partielle des activités", "Meilleure préservation des preuves"],
                negative: ["Risque de propagation non détectée", "Temps d'analyse plus long"]
              },
              score: 8
            },
            {
              id: uuidv4(),
              text: "Surveiller la situation sans prendre d'action immédiate pour mieux comprendre l'attaque",
              consequences: {
                positive: ["Collecte maximale d'informations sur l'attaque", "Pas d'interruption immédiate"],
                negative: ["Propagation continue du ransomware", "Augmentation significative des dégâts"]
              },
              score: -5
            }
          ]
        },
        {
          id: uuidv4(),
          description: "Comment procéder à l'analyse des systèmes compromis?",
          options: [
            {
              id: uuidv4(),
              text: "Créer des copies forensiques des systèmes avant toute intervention",
              consequences: {
                positive: ["Préservation complète des preuves", "Possibilité d'analyses approfondies"],
                negative: ["Processus chronophage", "Nécessite des ressources importantes"]
              },
              score: 10
            },
            {
              id: uuidv4(),
              text: "Analyser directement les systèmes en démarrant les outils de détection",
              consequences: {
                positive: ["Réponse plus rapide", "Identification immédiate des IOCs"],
                negative: ["Risque d'altération des preuves", "Analyses forensiques compromises"]
              },
              score: 3
            },
            {
              id: uuidv4(),
              text: "Redémarrer les systèmes avec une solution de récupération standard",
              consequences: {
                positive: ["Restauration rapide des services", "Élimination du ransomware"],
                negative: ["Perte totale des preuves", "Impossibilité d'identifier le vecteur d'attaque"]
              },
              score: -3
            }
          ]
        }
      ]
    },
    {
      id: uuidv4(),
      description: "Développer et mettre en œuvre une stratégie de remédiation",
      completed: false,
      evaluationCriteria: [
        "Efficacité de la stratégie pour éliminer la menace",
        "Minimisation de l'impact sur les opérations commerciales",
        "Prévention d'une nouvelle infection"
      ],
      decisions: [
        {
          id: uuidv4(),
          description: "Quelle stratégie de remédiation adopter pour les systèmes compromis?",
          options: [
            {
              id: uuidv4(),
              text: "Restaurer à partir des sauvegardes les plus récentes après nettoyage complet",
              consequences: {
                positive: ["Élimination complète du malware", "Retour à un état sain connu"],
                negative: ["Temps de restauration important", "Risque de restaurer depuis des sauvegardes déjà infectées"]
              },
              score: 7
            },
            {
              id: uuidv4(),
              text: "Payer la rançon pour obtenir les clés de déchiffrement",
              consequences: {
                positive: ["Récupération potentielle des données", "Reprise plus rapide des activités"],
                negative: ["Financement des cybercriminels", "Aucune garantie de récupération complète", "Risque réputationnel"]
              },
              score: -10
            },
            {
              id: uuidv4(),
              text: "Réinstaller complètement les systèmes et reconstruire l'infrastructure",
              consequences: {
                positive: ["Sécurité maximale des nouveaux systèmes", "Opportunité d'améliorer l'architecture"],
                negative: ["Temps d'indisponibilité très élevé", "Coûts importants", "Perte des données non sauvegardées"]
              },
              score: 5
            }
          ]
        },
        {
          id: uuidv4(),
          description: "Comment gérer les vulnérabilités qui ont permis l'attaque?",
          options: [
            {
              id: uuidv4(),
              text: "Effectuer un audit complet de sécurité et corriger toutes les vulnérabilités identifiées",
              consequences: {
                positive: ["Correction des failles de sécurité", "Amélioration globale de la posture de sécurité"],
                negative: ["Processus long et coûteux", "Risque de perturbation pendant les corrections"]
              },
              score: 9
            },
            {
              id: uuidv4(),
              text: "Corriger uniquement la vulnérabilité exploitée dans cette attaque",
              consequences: {
                positive: ["Correction rapide du problème immédiat", "Perturbation minimale"],
                negative: ["D'autres vulnérabilités restent non corrigées", "Risque d'autres attaques"]
              },
              score: 2
            },
            {
              id: uuidv4(),
              text: "Implémenter des solutions de contournement temporaires sans correction des vulnérabilités",
              consequences: {
                positive: ["Mise en œuvre rapide", "Pas de modification des systèmes"],
                negative: ["Vulnérabilités toujours présentes", "Protection incomplète", "Faux sentiment de sécurité"]
              },
              score: -4
            }
          ]
        }
      ]
    },
    {
      id: uuidv4(),
      description: "Communiquer avec les parties prenantes et gérer les aspects légaux",
      completed: false,
      evaluationCriteria: [
        "Transparence et précision des communications",
        "Respect des obligations légales et réglementaires",
        "Gestion appropriée des relations avec les clients et partenaires"
      ],
      decisions: [
        {
          id: uuidv4(),
          description: "Comment communiquer sur l'incident en interne et en externe?",
          options: [
            {
              id: uuidv4(),
              text: "Communication transparente et immédiate avec toutes les parties prenantes",
              consequences: {
                positive: ["Transparence et confiance renforcée", "Conformité aux obligations légales"],
                negative: ["Risque d'impact réputationnel à court terme", "Divulgation d'informations sensibles"]
              },
              score: 8
            },
            {
              id: uuidv4(),
              text: "Communication limitée sur la base du 'besoin d'en connaître'",
              consequences: {
                positive: ["Contrôle de l'information", "Limitation de la panique"],
                negative: ["Risque de fuites non contrôlées", "Manque de préparation des équipes"]
              },
              score: 4
            },
            {
              id: uuidv4(),
              text: "Reporter toute communication jusqu'à la résolution complète de l'incident",
              consequences: {
                positive: ["Évite la diffusion d'informations incomplètes", "Focus total sur la résolution"],
                negative: ["Non-conformité potentielle aux obligations légales", "Perte de confiance si découvert"]
              },
              score: -7
            }
          ]
        },
        {
          id: uuidv4(),
          description: "Comment gérer les obligations légales liées à la violation de données?",
          options: [
            {
              id: uuidv4(),
              text: "Notifier immédiatement les autorités compétentes (CNIL) et les personnes concernées",
              consequences: {
                positive: ["Conformité légale complète", "Possibilité pour les victimes de prendre des mesures"],
                negative: ["Complexité administrative", "Impact réputationnel immédiat"]
              },
              score: 10
            },
            {
              id: uuidv4(),
              text: "Consulter d'abord les conseils juridiques avant toute notification",
              consequences: {
                positive: ["Approche juridiquement éclairée", "Meilleure préparation des notifications"],
                negative: ["Retard potentiel dans les notifications obligatoires", "Risque de non-conformité"]
              },
              score: 3
            },
            {
              id: uuidv4(),
              text: "Minimiser l'incident dans les rapports et ne notifier que si absolument nécessaire",
              consequences: {
                positive: ["Limitation de l'exposition publique à court terme"],
                negative: ["Violations légales graves", "Sanctions potentielles", "Crise de confiance majeure si découvert"]
              },
              score: -10
            }
          ]
        }
      ]
    }
  ],
  
  // Système d'évaluation
  evaluationSystem: {
    maxPoints: 60,
    penaltyThreshold: 20,
    rewards: [
      "Reconnaissance professionnelle",
      "Augmentation du budget cybersécurité",
      "Formation spécialisée en gestion de crise"
    ],
    penalties: [
      "Perte de confiance de la direction",
      "Réduction du périmètre de responsabilité",
      "Impact sur l'évaluation annuelle"
    ]
  }
};

// Mission: Classification des données sensibles (RGPD)
export const dataClassificationMission: Mission = {
  id: uuidv4(),
  title: "Classification des données sensibles",
  description: "Mettez en place un système de classification des données pour protéger les informations sensibles conformément au RGPD.",
  difficulty: "Débutant",
  duration: "30-45 min",
  tags: ["RGPD", "Protection des données", "Classification", "Gouvernance"],
  scenario: "Une société spécialisée dans les solutions de santé connectée fait face à une transformation numérique majeure et accumule de plus en plus de données sensibles. Suite à une demande de la direction générale, vous êtes chargé(e) d'établir un système de classification des données qui permettra de respecter les exigences du RGPD et de limiter les risques de fuites d'informations sensibles. Votre mission est d'élaborer et de présenter cette stratégie de classification.",
  companyName: "HEALTH & INDUSTRY SHIELD",
  secteurActivite: "INDUSTRIEL/SANTÉ/PUBLIC (IMPULSE)",
  userRole: "DPO (Délégué à la Protection des Données)",
  currentScore: 0,
  
  // Compétences requises et suivies durant cette mission
  requiredSkills: ["rgpd_compliance", "data_governance", "risk_assessment", "communication"],
  skillsProgress: [
    {
      id: "rgpd_compliance",
      name: "Conformité RGPD",
      description: "Connaissance et application des principes du Règlement Général sur la Protection des Données",
      category: "juridique",
      level: 0,
      icon: "ScrollText"
    },
    {
      id: "data_governance",
      name: "Gouvernance des données",
      description: "Capacité à établir et mettre en œuvre des politiques de gestion des données",
      category: "stratégie",
      level: 0,
      icon: "Database"
    },
    {
      id: "risk_assessment",
      name: "Évaluation des risques",
      description: "Capacité à identifier et évaluer les risques liés à la protection des données",
      category: "analyse",
      level: 0,
      icon: "AlertOctagon"
    },
    {
      id: "communication",
      name: "Communication",
      description: "Capacité à expliquer clairement des concepts complexes aux parties prenantes",
      category: "communication",
      level: 0,
      icon: "MessageSquare"
    }
  ],
  
  // Événements d'apprentissage survenus durant la mission
  learningEvents: [],
  
  // Contacts disponibles pour cette mission
  contacts: [
    yousraSaidani,
    {
      name: "Vincent Pascal",
      role: "Directeur Général Adjoint et Directeur du Développement",
      expertise: "Conformité réglementaire en matière de cybersécurité"
    },
    {
      name: "Clara Dubois",
      role: "Directrice Juridique",
      expertise: "Droit des nouvelles technologies et protection des données personnelles"
    },
    {
      name: "Paul Mercier",
      role: "Administrateur Bases de Données",
      expertise: "Gestion et organisation des bases de données de l'entreprise"
    }
  ],
  
  // Superviseurs qui évalueront les décisions
  supervisors: [
    arnaudGauthier,
    olivierHervo,
    julienGrimault
  ],
  
  // Objectifs structurés de la mission
  objectives: [
    {
      id: uuidv4(),
      description: "Définir les catégories de classification des données en conformité avec le RGPD",
      completed: false,
      evaluationCriteria: [
        "Pertinence des catégories par rapport aux exigences du RGPD",
        "Simplicité et clarté du système de classification",
        "Applicabilité dans l'environnement métier de l'entreprise"
      ],
      decisions: [
        {
          id: uuidv4(),
          description: "Quelles catégories de classification des données adopter?",
          options: [
            {
              id: uuidv4(),
              text: "Système simple à 3 niveaux: Public, Interne, Confidentiel (incluant les données personnelles sensibles)",
              consequences: {
                positive: ["Simplicité d'adoption et de compréhension", "Facilité de mise en œuvre"],
                negative: ["Manque de granularité pour les données particulièrement sensibles", "Risque de sur-protection ou sous-protection"]
              },
              score: 6
            },
            {
              id: uuidv4(),
              text: "Système RGPD spécifique: Non-Personnel, Personnel, Personnel Sensible, Personnel Critique",
              consequences: {
                positive: ["Alignement parfait avec les catégories du RGPD", "Clarté pour les audits de conformité"],
                negative: ["Moins adaptable aux données non-personnelles", "Complexité supplémentaire"]
              },
              score: 9
            },
            {
              id: uuidv4(),
              text: "Système complexe à 5 niveaux d'accès inspiré des classifications militaires",
              consequences: {
                positive: ["Granularité maximale", "Protection très fine des actifs"],
                negative: ["Trop complexe pour une adoption rapide", "Surcharge administrative", "Inadaptation au contexte RGPD"]
              },
              score: 2
            }
          ]
        },
        {
          id: uuidv4(),
          description: "Comment déterminer la classification d'une donnée?",
          options: [
            {
              id: uuidv4(),
              text: "Responsabiliser chaque créateur/propriétaire de données pour classifier ses propres informations",
              consequences: {
                positive: ["Responsabilisation des employés", "Classification au plus proche de la création"],
                negative: ["Risque d'incohérences", "Nécessite une forte formation préalable"]
              },
              score: 4
            },
            {
              id: uuidv4(),
              text: "Créer un comité central de classification avec des représentants de chaque département",
              consequences: {
                positive: ["Cohérence des classifications", "Expertise métier diversifiée"],
                negative: ["Processus plus lent", "Risque de devenir un goulot d'étranglement"]
              },
              score: 7
            },
            {
              id: uuidv4(),
              text: "Utiliser un système automatisé basé sur des mots-clés et l'analyse de contenu",
              consequences: {
                positive: ["Rapidité de traitement", "Cohérence systématique"],
                negative: ["Risque de faux positifs/négatifs", "Incapacité à saisir le contexte"]
              },
              score: 5
            }
          ]
        }
      ]
    },
    {
      id: uuidv4(),
      description: "Développer les mesures de protection correspondant à chaque niveau de classification",
      completed: false,
      evaluationCriteria: [
        "Proportionnalité des mesures par rapport aux risques",
        "Faisabilité technique et organisationnelle",
        "Conformité avec les exigences légales du RGPD"
      ],
      decisions: [
        {
          id: uuidv4(),
          description: "Quelles mesures de protection technique implémenter?",
          options: [
            {
              id: uuidv4(),
              text: "Mesures graduelles: chiffrement, contrôle d'accès et journalisation adaptés au niveau de sensibilité",
              consequences: {
                positive: ["Proportionnalité des mesures", "Utilisation efficace des ressources"],
                negative: ["Complexité de gestion des différents niveaux", "Risque de confusion"]
              },
              score: 9
            },
            {
              id: uuidv4(),
              text: "Appliquer le niveau maximal de protection à toutes les données pour plus de sécurité",
              consequences: {
                positive: ["Simplicité d'implémentation", "Sécurité maximale"],
                negative: ["Coûts prohibitifs", "Impact sur les performances", "Non-conformité au principe de proportionnalité du RGPD"]
              },
              score: -2
            },
            {
              id: uuidv4(),
              text: "Déléguer aux départements IT et Sécurité le choix des mesures pour chaque catégorie",
              consequences: {
                positive: ["Expertise technique dans la décision", "Adaptation aux contraintes techniques"],
                negative: ["Risque de déconnexion avec les besoins métier", "Manque de vision globale RGPD"]
              },
              score: 3
            }
          ]
        },
        {
          id: uuidv4(),
          description: "Comment gérer les droits d'accès aux données classifiées?",
          options: [
            {
              id: uuidv4(),
              text: "Implémenter un système basé sur les rôles avec revue périodique des accès",
              consequences: {
                positive: ["Bonne pratique de sécurité", "Conformité aux principes de minimisation et besoin d'en connaître"],
                negative: ["Surcharge administrative pour les revues", "Complexité de gestion"]
              },
              score: 10
            },
            {
              id: uuidv4(),
              text: "Accès par défaut à la majorité des données avec restrictions uniquement pour les plus sensibles",
              consequences: {
                positive: ["Simplicité de gestion", "Moins de friction pour les utilisateurs"],
                negative: ["Non-conformité au principe de minimisation des accès", "Risque élevé d'accès non autorisés"]
              },
              score: -5
            },
            {
              id: uuidv4(),
              text: "Système décentralisé où chaque propriétaire de données gère ses propres accès",
              consequences: {
                positive: ["Contrôle granulaire", "Responsabilisation des propriétaires"],
                negative: ["Incohérence potentielle", "Difficulté d'audit centralisé", "Risque de silos"]
              },
              score: 2
            }
          ]
        }
      ]
    },
    {
      id: uuidv4(),
      description: "Élaborer un plan de sensibilisation et de formation pour les employés",
      completed: false,
      evaluationCriteria: [
        "Clarté et accessibilité du contenu de formation",
        "Couverture de tous les aspects pratiques de la classification",
        "Stratégie d'engagement des employés"
      ],
      decisions: [
        {
          id: uuidv4(),
          description: "Quelle approche de formation privilégier?",
          options: [
            {
              id: uuidv4(),
              text: "Formation obligatoire pour tous les employés avec certification et rappels réguliers",
              consequences: {
                positive: ["Couverture complète de l'organisation", "Suivi formalisé", "Message d'importance claire"],
                negative: ["Perception potentiellement négative", "Temps requis important", "Coût élevé"]
              },
              score: 8
            },
            {
              id: uuidv4(),
              text: "Approche par champions: former des ambassadeurs dans chaque département qui formeront leurs collègues",
              consequences: {
                positive: ["Adaptation au contexte de chaque équipe", "Meilleure adoption", "Coût plus faible"],
                negative: ["Risque d'incohérence", "Dépendance envers les champions", "Couverture potentiellement incomplète"]
              },
              score: 6
            },
            {
              id: uuidv4(),
              text: "Uniquement des ressources en ligne (guides, vidéos) disponibles en self-service",
              consequences: {
                positive: ["Faible coût", "Flexibilité pour les employés", "Mise à jour facile"],
                negative: ["Faible taux d'adoption", "Absence de vérification de compréhension", "Manque d'engagement"]
              },
              score: 0
            }
          ]
        },
        {
          id: uuidv4(),
          description: "Comment mesurer l'efficacité du programme de sensibilisation?",
          options: [
            {
              id: uuidv4(),
              text: "Tests pratiques réguliers (simulations, exercices) pour vérifier la bonne application",
              consequences: {
                positive: ["Mesure réelle des comportements", "Renforcement pratique", "Identification des lacunes"],
                negative: ["Complexité d'organisation", "Temps requis", "Peut être perçu comme du contrôle"]
              },
              score: 10
            },
            {
              id: uuidv4(),
              text: "Sondages et questionnaires d'auto-évaluation sur la compréhension des règles",
              consequences: {
                positive: ["Facilité de mise en œuvre", "Retour d'information rapide", "Faible coût"],
                negative: ["Fiabilité limitée", "Écart potentiel entre connaissance théorique et application"]
              },
              score: 5
            },
            {
              id: uuidv4(),
              text: "Audits aléatoires des classifications réalisées pour vérifier leur justesse",
              consequences: {
                positive: ["Évaluation objective", "Identification des besoins de formation"],
                negative: ["Sentiment de surveillance", "Couverture limitée", "Réaction après coup"]
              },
              score: 7
            }
          ]
        }
      ]
    }
  ],
  
  // Système d'évaluation
  evaluationSystem: {
    maxPoints: 60,
    penaltyThreshold: 20,
    rewards: [
      "Reconnaissance comme expert RGPD au sein de l'organisation",
      "Participation au comité de gouvernance des données",
      "Formation avancée en protection des données"
    ],
    penalties: [
      "Remise en question de votre rôle de DPO",
      "Supervision renforcée par le département juridique",
      "Perte d'autonomie sur les projets futurs"
    ]
  }
};

// Mission: Réponse à une violation de données personnelles (RGPD)
export const dataBreachResponseMission: Mission = {
  id: uuidv4(),
  title: "Réponse à une violation de données personnelles",
  description: "Une violation de données personnelles a été détectée. Gérez la situation conformément au RGPD.",
  difficulty: "Intermédiaire",
  duration: "40-60 min",
  tags: ["RGPD", "Gestion d'incident", "Notification", "Données personnelles"],
  scenario: "Un établissement financier de taille moyenne vient de détecter une intrusion dans sa base de données clients. Une analyse préliminaire indique que des données personnelles et financières de près de 5000 clients ont potentiellement été compromises. En tant que DPO, vous devez coordonner la réponse à cet incident conformément aux exigences du RGPD et limiter l'impact sur la réputation de l'entreprise et ses clients.",
  companyName: "SECURE FINANCE SOLUTIONS",
  secteurActivite: "BANCAIRE/FINANCIER (BFA)",
  userRole: "DPO (Délégué à la Protection des Données)",
  currentScore: 0,
  
  // Compétences requises et suivies durant cette mission
  requiredSkills: ["incident_response", "rgpd_compliance", "crisis_communication", "risk_assessment"],
  skillsProgress: [
    {
      id: "incident_response",
      name: "Réponse aux incidents",
      description: "Capacité à coordonner la réponse à un incident de sécurité impliquant des données personnelles",
      category: "gestion_crise",
      level: 0,
      icon: "AlarmClock"
    },
    {
      id: "rgpd_compliance",
      name: "Conformité RGPD",
      description: "Connaissance et application des principes du Règlement Général sur la Protection des Données",
      category: "juridique",
      level: 0,
      icon: "ScrollText"
    },
    {
      id: "crisis_communication",
      name: "Communication de crise",
      description: "Capacité à communiquer efficacement avec les parties prenantes en situation de crise",
      category: "communication",
      level: 0,
      icon: "MessageCircle"
    },
    {
      id: "risk_assessment",
      name: "Évaluation des risques",
      description: "Capacité à évaluer les risques pour les droits et libertés des personnes concernées",
      category: "analyse",
      level: 0,
      icon: "AlertOctagon"
    }
  ],
  
  // Événements d'apprentissage survenus durant la mission
  learningEvents: [],
  
  // Contacts disponibles pour cette mission
  contacts: [
    {
      name: "Vincent Terrier",
      role: "Senior Partner, Directeur Financier",
      expertise: "Gestion des risques financiers liés aux cyber-attaques"
    },
    {
      name: "Clara Dubois",
      role: "Directrice Juridique",
      expertise: "Droit des nouvelles technologies et protection des données personnelles"
    },
    {
      name: "Thomas Laurent",
      role: "RSSI",
      expertise: "Sécurité des systèmes d'information et réponse aux incidents"
    },
    {
      name: "Sophie Moreau",
      role: "Directrice Communication",
      expertise: "Communication de crise et relations publiques"
    }
  ],
  
  // Superviseurs qui évalueront les décisions
  supervisors: [
    arnaudGauthier,
    olivierHervo,
    lorenzoBertola
  ],
  
  // Objectifs structurés de la mission
  objectives: [
    {
      id: uuidv4(),
      description: "Évaluer la gravité de la violation et son impact sur les personnes concernées",
      completed: false,
      evaluationCriteria: [
        "Exhaustivité de l'évaluation des données compromises",
        "Pertinence de l'analyse des risques pour les droits et libertés des personnes",
        "Réactivité dans l'évaluation initiale"
      ],
      decisions: [
        {
          id: uuidv4(),
          description: "Comment procéder à l'évaluation initiale de la violation?",
          options: [
            {
              id: uuidv4(),
              text: "Constituer immédiatement une cellule de crise multidisciplinaire (IT, juridique, métier, DPO)",
              consequences: {
                positive: ["Évaluation complète et multidimensionnelle", "Meilleure compréhension des implications"],
                negative: ["Temps de mobilisation plus long", "Risque de discussions sans fin"]
              },
              score: 9
            },
            {
              id: uuidv4(),
              text: "Déléguer l'évaluation au département IT sécurité uniquement pour gagner du temps",
              consequences: {
                positive: ["Rapidité d'action", "Expertise technique immédiate"],
                negative: ["Vision uniquement technique, sans prise en compte des aspects juridiques et métier", "Risque de sous-évaluation des impacts RGPD"]
              },
              score: 2
            },
            {
              id: uuidv4(),
              text: "Sous-traiter l'évaluation à un cabinet externe spécialisé en forensique",
              consequences: {
                positive: ["Expertise pointue", "Garantie d'indépendance"],
                negative: ["Délai supplémentaire", "Coût élevé", "Risque de mauvaise connaissance du contexte métier"]
              },
              score: 5
            }
          ]
        },
        {
          id: uuidv4(),
          description: "Quels critères privilégier pour déterminer la gravité de la violation?",
          options: [
            {
              id: uuidv4(),
              text: "Se concentrer sur la nature des données compromises et les risques pour les personnes",
              consequences: {
                positive: ["Alignement parfait avec l'esprit du RGPD", "Focus sur l'impact réel pour les individus"],
                negative: ["Peut sous-estimer l'impact business", "Évaluation parfois subjective"]
              },
              score: 10
            },
            {
              id: uuidv4(),
              text: "Prioriser le volume de données et l'impact médiatique potentiel",
              consequences: {
                positive: ["Facilité de quantification", "Anticipation des répercussions médiatiques"],
                negative: ["Non-alignement avec les critères RGPD", "Risque de mauvaise priorisation"]
              },
              score: 0
            },
            {
              id: uuidv4(),
              text: "Évaluer principalement les implications financières et juridiques pour l'entreprise",
              consequences: {
                positive: ["Protection des intérêts de l'entreprise", "Préparation des aspects juridiques"],
                negative: ["Approche contraire à l'esprit du RGPD centré sur les individus", "Risque réputationnel accru"]
              },
              score: -5
            }
          ]
        }
      ]
    },
    {
      id: uuidv4(),
      description: "Mettre en œuvre les notifications obligatoires et la communication de crise",
      completed: false,
      evaluationCriteria: [
        "Respect des délais légaux de notification",
        "Qualité et exhaustivité des informations fournies",
        "Adaptation de la communication aux différentes parties prenantes"
      ],
      decisions: [
        {
          id: uuidv4(),
          description: "Quand et comment notifier l'autorité de contrôle (CNIL)?",
          options: [
            {
              id: uuidv4(),
              text: "Notifier immédiatement avec les informations disponibles, même incomplètes, et compléter ultérieurement",
              consequences: {
                positive: ["Respect strict du délai de 72h", "Preuve de bonne foi et de réactivité"],
                negative: ["Informations potentiellement erronées", "Risque de corrections multiples créant de la confusion"]
              },
              score: 8
            },
            {
              id: uuidv4(),
              text: "Attendre d'avoir une vision complète avant de notifier, même si cela dépasse légèrement les 72h",
              consequences: {
                positive: ["Notification plus précise et complète", "Meilleure compréhension de l'incident"],
                negative: ["Non-respect du délai légal", "Risque de sanction administrative", "Impression de dissimulation"]
              },
              score: -3
            },
            {
              id: uuidv4(),
              text: "Évaluer si la violation présente réellement un risque avant de notifier, potentiellement en ne notifiant pas",
              consequences: {
                positive: ["Évite une notification inutile si pas de risque réel", "Économie de ressources"],
                negative: ["Risque majeur de non-conformité si l'évaluation est incorrecte", "Sanctions potentiellement aggravées"]
              },
              score: 4
            }
          ]
        },
        {
          id: uuidv4(),
          description: "Comment communiquer avec les personnes concernées par la violation?",
          options: [
            {
              id: uuidv4(),
              text: "Communication directe et immédiate à toutes les personnes potentiellement affectées avec des conseils pratiques",
              consequences: {
                positive: ["Transparence totale", "Possibilité pour les personnes de prendre des mesures rapides de protection"],
                negative: ["Risque de panique", "Charge importante de gestion des appels/questions"]
              },
              score: 10
            },
            {
              id: uuidv4(),
              text: "Communication par phases, en informant d'abord les plus exposés puis les autres graduellement",
              consequences: {
                positive: ["Approche proportionnée au risque", "Meilleure gestion des ressources de support"],
                negative: ["Risque de fuites d'information entre groupes", "Perception d'inégalité de traitement"]
              },
              score: 6
            },
            {
              id: uuidv4(),
              text: "Communication minimaliste via un communiqué général ou le site web uniquement",
              consequences: {
                positive: ["Contrôle du message", "Limitation de l'exposition médiatique"],
                negative: ["Non-conformité probable au RGPD", "Détérioration majeure de la confiance", "Risque de réclamations"]
              },
              score: -7
            }
          ]
        }
      ]
    },
    {
      id: uuidv4(),
      description: "Mettre en place des mesures correctives et préventives",
      completed: false,
      evaluationCriteria: [
        "Efficacité des mesures pour limiter l'impact de la violation",
        "Pertinence des actions préventives pour éviter de futurs incidents",
        "Documentation complète du processus de gestion de l'incident"
      ],
      decisions: [
        {
          id: uuidv4(),
          description: "Quelles mesures immédiates mettre en place pour les personnes concernées?",
          options: [
            {
              id: uuidv4(),
              text: "Offrir un service de surveillance d'identité et d'assistance en cas d'usurpation",
              consequences: {
                positive: ["Protection concrète des personnes", "Démonstration d'engagement et de responsabilité"],
                negative: ["Coût significatif", "Logistique complexe à mettre en place rapidement"]
              },
              score: 9
            },
            {
              id: uuidv4(),
              text: "Fournir uniquement des conseils génériques de sécurité (changement de mot de passe, surveillance des comptes)",
              consequences: {
                positive: ["Facilité et rapidité de mise en œuvre", "Coût minimal"],
                negative: ["Protection limitée", "Perception de désengagement", "Possible insuffisance selon la gravité"]
              },
              score: 4
            },
            {
              id: uuidv4(),
              text: "Proposer une compensation financière forfaitaire à toutes les personnes concernées",
              consequences: {
                positive: ["Geste commercial apprécié", "Simplicité de mise en œuvre"],
                negative: ["Ne résout pas les problèmes de sécurité", "Peut être perçu comme tentative d'achat du silence"]
              },
              score: 2
            }
          ]
        },
        {
          id: uuidv4(),
          description: "Comment améliorer les processus pour éviter de futures violations?",
          options: [
            {
              id: uuidv4(),
              text: "Conduire un audit complet de sécurité et de conformité RGPD avec plan d'action détaillé",
              consequences: {
                positive: ["Approche systémique et approfondie", "Identification des vulnérabilités structurelles"],
                negative: ["Temps et ressources importantes nécessaires", "Résultats non immédiats"]
              },
              score: 10
            },
            {
              id: uuidv4(),
              text: "Renforcer uniquement les contrôles de sécurité technique liés à la faille exploitée",
              consequences: {
                positive: ["Action ciblée et rapide", "Résolution du problème immédiat"],
                negative: ["Approche en silo", "Ne traite pas les vulnérabilités organisationnelles ou autres failles"]
              },
              score: 3
            },
            {
              id: uuidv4(),
              text: "Mettre l'accent principal sur la formation et la sensibilisation du personnel",
              consequences: {
                positive: ["Renforcement du facteur humain", "Amélioration de la culture de sécurité"],
                negative: ["Inefficace si la faille est purement technique", "Résultats visibles uniquement à moyen terme"]
              },
              score: 5
            }
          ]
        }
      ]
    }
  ],
  
  // Système d'évaluation
  evaluationSystem: {
    maxPoints: 60,
    penaltyThreshold: 20,
    rewards: [
      "Reconnaissance comme expert en gestion d'incidents RGPD",
      "Budget supplémentaire pour les initiatives de conformité",
      "Participation à la refonte de la stratégie de sécurité des données"
    ],
    penalties: [
      "Mise sous tutelle par le département juridique",
      "Révision à la baisse des responsabilités",
      "Formation corrective obligatoire"
    ]
  }
};

// Mission: Programme de conformité RGPD avancé
export const rgpdComplianceProgramMission: Mission = {
  id: uuidv4(),
  title: "Programme de conformité RGPD avancé",
  description: "Élaborez un programme complet de conformité RGPD pour votre organisation internationale.",
  difficulty: "Expert",
  duration: "60-90 min",
  tags: ["RGPD", "Conformité", "Gouvernance", "International"],
  scenario: "Une entreprise internationale de services numériques souhaite renforcer sa conformité RGPD face à son expansion en Europe. Avec des filiales dans 12 pays européens et des transferts de données fréquents, l'entreprise fait face à des défis complexes en matière de protection des données. En tant que Chief Privacy Officer nouvellement nommé, vous devez concevoir et déployer un programme de conformité RGPD harmonisé à l'échelle du groupe, tout en respectant les spécificités locales.",
  companyName: "CYBER SECURE SOLUTIONS",
  secteurActivite: "ÉNERGIE & UTILITIES",
  userRole: "Chief Privacy Officer (CPO)",
  currentScore: 0,
  
  // Compétences requises et suivies durant cette mission
  requiredSkills: ["rgpd_expertise", "governance", "change_management", "international_compliance"],
  skillsProgress: [
    {
      id: "rgpd_expertise",
      name: "Expertise RGPD avancée",
      description: "Maîtrise approfondie du RGPD et de ses implications pratiques dans un contexte complexe",
      category: "juridique",
      level: 0,
      icon: "GraduationCap"
    },
    {
      id: "governance",
      name: "Gouvernance des données",
      description: "Capacité à établir des structures de gouvernance efficaces à grande échelle",
      category: "stratégie",
      level: 0,
      icon: "Network"
    },
    {
      id: "change_management",
      name: "Gestion du changement",
      description: "Compétence à accompagner la transformation des pratiques dans une organisation",
      category: "leadership",
      level: 0,
      icon: "Workflow"
    },
    {
      id: "international_compliance",
      name: "Conformité internationale",
      description: "Capacité à naviguer entre différentes juridictions et exigences locales",
      category: "juridique",
      level: 0,
      icon: "Globe"
    }
  ],
  
  // Événements d'apprentissage survenus durant la mission
  learningEvents: [],
  
  // Contacts disponibles pour cette mission
  contacts: [
    {
      name: "Vincent Pascal",
      role: "Directeur Général Adjoint et Directeur du Développement",
      expertise: "Conformité réglementaire en matière de cybersécurité"
    },
    {
      name: "Helena Schmidt",
      role: "DPO Allemagne",
      expertise: "Expert en loi allemande sur la protection des données (BDSG)"
    },
    {
      name: "Marco Rossi",
      role: "Responsable IT Governance",
      expertise: "Architecture des systèmes d'information et cartographie des données"
    },
    {
      name: "Laure Dubois",
      role: "Directrice des Ressources Humaines",
      expertise: "Gestion du changement et formation du personnel"
    }
  ],
  
  // Superviseurs qui évalueront les décisions
  supervisors: [
    arnaudGauthier,
    olivierHervo,
    anthonyFrescal
  ],
  
  // Objectifs structurés de la mission
  objectives: [
    {
      id: uuidv4(),
      description: "Concevoir une structure de gouvernance de la protection des données adaptée au contexte international",
      completed: false,
      evaluationCriteria: [
        "Efficacité de la structure pour couvrir l'ensemble du groupe",
        "Clarté des rôles et responsabilités à tous les niveaux",
        "Intégration dans la gouvernance générale de l'entreprise"
      ],
      decisions: [
        {
          id: uuidv4(),
          description: "Quel modèle de gouvernance RGPD adopter pour une entreprise internationale?",
          options: [
            {
              id: uuidv4(),
              text: "Modèle centralisé avec un CPO global et une équipe centrale définissant toutes les politiques",
              consequences: {
                positive: ["Cohérence maximale des pratiques", "Économies d'échelle", "Contrôle renforcé"],
                negative: ["Manque de flexibilité locale", "Risque de déconnexion des réalités terrain", "Résistance potentielle des filiales"]
              },
              score: 5
            },
            {
              id: uuidv4(),
              text: "Modèle fédéré avec un CPO global définissant le cadre et des DPO locaux ayant une autonomie encadrée",
              consequences: {
                positive: ["Équilibre entre cohérence globale et adaptation locale", "Meilleure adhésion", "Expertise locale valorisée"],
                negative: ["Coordination plus complexe", "Coûts plus élevés", "Risque de divergences dans l'application"]
              },
              score: 10
            },
            {
              id: uuidv4(),
              text: "Modèle décentralisé où chaque filiale gère indépendamment sa conformité selon des principes communs",
              consequences: {
                positive: ["Adaptation maximale aux contextes locaux", "Autonomie des entités", "Réactivité locale"],
                negative: ["Incohérences majeures entre pays", "Duplication des efforts", "Difficultés de reporting consolidé"]
              },
              score: 2
            }
          ]
        },
        {
          id: uuidv4(),
          description: "Comment positionner la fonction Protection des Données dans l'organisation?",
          options: [
            {
              id: uuidv4(),
              text: "Rattachement direct au Comité Exécutif avec un reporting régulier au Conseil d'Administration",
              consequences: {
                positive: ["Indépendance maximale", "Visibilité au plus haut niveau", "Signal fort sur l'importance du sujet"],
                negative: ["Peut être perçu comme disproportionné", "Risque de saturation de la direction", "Attentes très élevées"]
              },
              score: 8
            },
            {
              id: uuidv4(),
              text: "Intégration au département Juridique/Compliance avec une ligne de reporting fonctionnelle à la Direction Générale",
              consequences: {
                positive: ["Synergie avec les autres fonctions de conformité", "Accès aux compétences juridiques", "Structure établie"],
                negative: ["Risque de vision uniquement juridique", "Indépendance potentiellement compromise", "Focus sur la conformité plutôt que la valeur business"]
              },
              score: 6
            },
            {
              id: uuidv4(),
              text: "Positionnement au sein de la DSI avec un sponsor au niveau du Comité Exécutif",
              consequences: {
                positive: ["Proximité avec les équipes techniques", "Intégration facilitée dans les projets IT", "Compréhension technique"],
                negative: ["Manque d'indépendance critique", "Vision potentiellement trop techno-centrée", "Non-conformité potentielle aux exigences d'indépendance du RGPD"]
              },
              score: 0
            }
          ]
        }
      ]
    },
    {
      id: uuidv4(),
      description: "Harmoniser les pratiques de conformité entre les différentes filiales européennes",
      completed: false,
      evaluationCriteria: [
        "Niveau d'harmonisation atteint tout en respectant les spécificités locales",
        "Efficacité des mécanismes de collaboration entre pays",
        "Gestion des transferts de données intra-groupe"
      ],
      decisions: [
        {
          id: uuidv4(),
          description: "Comment gérer les transferts de données personnelles au sein du groupe?",
          options: [
            {
              id: uuidv4(),
              text: "Mettre en place des Règles d'Entreprise Contraignantes (BCR) approuvées par les autorités",
              consequences: {
                positive: ["Solution la plus solide juridiquement", "Image d'excellence en matière de conformité", "Cadre global cohérent"],
                negative: ["Processus d'approbation très long (18-24 mois)", "Coût et ressources considérables", "Niveau d'exigence très élevé"]
              },
              score: 9
            },
            {
              id: uuidv4(),
              text: "Utiliser les Clauses Contractuelles Types entre toutes les entités du groupe",
              consequences: {
                positive: ["Mise en œuvre plus rapide", "Solution juridiquement reconnue", "Flexibilité"],
                negative: ["Multiplicité des contrats à gérer", "Moins intégré dans les processus opérationnels", "Évaluations supplémentaires post-Schrems II"]
              },
              score: 7
            },
            {
              id: uuidv4(),
              text: "S'appuyer sur le consentement des personnes concernées pour les transferts intra-groupe",
              consequences: {
                positive: ["Simplicité apparente", "Pas de documents complexes à établir"],
                negative: ["Base légale très fragile", "Quasi-impossibilité d'obtenir un consentement libre dans le contexte employeur-employé", "Non-conformité probable"]
              },
              score: -5
            }
          ]
        },
        {
          id: uuidv4(),
          description: "Comment concilier politique globale et exigences légales locales?",
          options: [
            {
              id: uuidv4(),
              text: "Politique globale exigeante avec annexes spécifiques par pays pour les particularités locales",
              consequences: {
                positive: ["Équilibre optimal entre cohérence et adaptation", "Respect des spécificités nationales", "Solidité juridique"],
                negative: ["Maintenance documentaire plus complexe", "Nécessité d'expertise juridique locale", "Communication plus difficile"]
              },
              score: 10
            },
            {
              id: uuidv4(),
              text: "Politique minimaliste commune complétée par des politiques locales indépendantes",
              consequences: {
                positive: ["Flexibilité maximale pour les entités locales", "Adaptation fine aux contextes nationaux"],
                negative: ["Risque élevé d'incohérences", "Difficultés de pilotage global", "Image fragmentée"]
              },
              score: 3
            },
            {
              id: uuidv4(),
              text: "Politique unique et strictement uniforme pour toutes les entités basée sur les exigences les plus strictes",
              consequences: {
                positive: ["Simplicité de gestion", "Message clair et cohérent", "Niveau élevé de protection partout"],
                negative: ["Sur-conformité coûteuse dans certains pays", "Rigidité excessive", "Risque de non-respect par inappropriation locale"]
              },
              score: 4
            }
          ]
        }
      ]
    },
    {
      id: uuidv4(),
      description: "Déployer une culture de protection des données dans l'ensemble de l'organisation",
      completed: false,
      evaluationCriteria: [
        "Efficacité des programmes de sensibilisation et formation",
        "Intégration de la protection des données dans les processus métier",
        "Mesurabilité et suivi de la progression de la culture privacy"
      ],
      decisions: [
        {
          id: uuidv4(),
          description: "Comment intégrer la protection des données dans le cycle de développement des produits et services?",
          options: [
            {
              id: uuidv4(),
              text: "Mettre en place une méthodologie complète de Privacy by Design avec des gates de validation formels",
              consequences: {
                positive: ["Conformité maximale", "Prévention des problèmes en amont", "Économies à long terme"],
                negative: ["Perception possible de bureaucratie", "Rallongement des cycles de développement", "Résistance des équipes produit"]
              },
              score: 8
            },
            {
              id: uuidv4(),
              text: "Créer des Privacy Champions dans chaque équipe produit formés aux principes essentiels",
              consequences: {
                positive: ["Appropriation par les équipes", "Intégration naturelle dans les processus", "Agilité préservée"],
                negative: ["Niveau d'expertise variable", "Risque de dilution des responsabilités", "Dépendance envers des individus"]
              },
              score: 10
            },
            {
              id: uuidv4(),
              text: "Imposer une revue privacy uniquement avant le lancement commercial des produits",
              consequences: {
                positive: ["Processus de développement non ralenti", "Focus sur les projets à fort impact"],
                negative: ["Interventions tardives coûteuses", "Correctifs potentiellement difficiles", "Mentalité de validation a posteriori"]
              },
              score: 0
            }
          ]
        },
        {
          id: uuidv4(),
          description: "Comment mesurer l'efficacité du programme de conformité RGPD?",
          options: [
            {
              id: uuidv4(),
              text: "Tableau de bord équilibré combinant indicateurs de conformité, incidents, satisfaction et maturité",
              consequences: {
                positive: ["Vision holistique", "Mesure de la performance réelle", "Alignement sur les objectifs multiples de la protection des données"],
                negative: ["Complexité de mise en œuvre", "Nécessité de sources de données diverses", "Interprétation parfois subjective"]
              },
              score: 10
            },
            {
              id: uuidv4(),
              text: "Focus principal sur les indicateurs de conformité documentaire et le taux de complétion des actions",
              consequences: {
                positive: ["Facilité de mesure", "Clarté des objectifs", "Alignement avec les exigences d'accountability"],
                negative: ["Vision souvent déconnectée de la réalité opérationnelle", "Focalisation sur les moyens plutôt que les résultats"]
              },
              score: 5
            },
            {
              id: uuidv4(),
              text: "Mesure basée principalement sur les incidents et les plaintes",
              consequences: {
                positive: ["Mesure directe de l'efficacité", "Lien clair avec la performance réelle", "Simplicité"],
                negative: ["Indicateurs retardés", "Culture punitive", "Peu d'indication sur les actions préventives"]
              },
              score: 3
            }
          ]
        }
      ]
    }
  ],
  
  // Système d'évaluation
  evaluationSystem: {
    maxPoints: 60,
    penaltyThreshold: 20,
    rewards: [
      "Reconnaissance comme référence internationale en matière de privacy",
      "Budget dédié à l'innovation en matière de protection des données",
      "Participation aux instances stratégiques de l'entreprise"
    ],
    penalties: [
      "Perte de crédibilité auprès de la direction",
      "Réduction du périmètre de responsabilité au profit de la fonction juridique",
      "Remise en question de la stratégie privacy globale"
    ]
  }
};

// Liste des missions disponibles
export const cyberDefenseMissions: Mission[] = [
  exampleMission,
  dataClassificationMission,
  dataBreachResponseMission,
  rgpdComplianceProgramMission
  // Autres missions peuvent être ajoutées ici
];

// Fonction utilitaire pour trouver une mission par son ID
export function getMissionById(id: string): Mission | undefined {
  return cyberDefenseMissions.find(mission => mission.id === id);
}