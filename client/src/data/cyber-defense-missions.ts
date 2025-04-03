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
const marionLopez = getContactByName('Marion Lopez')!;
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
  scenario: "ELITE RETAIL SECURITY, entreprise leader dans le secteur du luxe, vient de détecter une activité suspecte sur plusieurs serveurs critiques. Certains fichiers semblent être chiffrés et un message de rançon est apparu sur plusieurs postes de travail. En tant que RSSI, vous devez coordonner la réponse à cet incident, identifier l'étendue de la compromission et prendre des décisions cruciales pour protéger les actifs de l'entreprise.",
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
    marionLopez,
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

// Liste des missions disponibles
export const cyberDefenseMissions: Mission[] = [
  exampleMission,
  // Autres missions peuvent être ajoutées ici
];

// Fonction utilitaire pour trouver une mission par son ID
export function getMissionById(id: string): Mission | undefined {
  return cyberDefenseMissions.find(mission => mission.id === id);
}