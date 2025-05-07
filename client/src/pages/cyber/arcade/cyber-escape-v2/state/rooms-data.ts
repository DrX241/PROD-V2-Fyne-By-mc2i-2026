import { Room } from '../types/game';

// Définition des salles du jeu
export const initialRooms: Record<string, Room> = {
  // Étape 1: Vestibule Phish-Alert
  "vestibule": {
    id: "vestibule",
    name: "Vestibule Phish-Alert",
    description: "Une salle lumineuse aux murs tapissés d'écrans affichant des flux d'emails. Un terminal central projette une interface de triage de messages.",
    stage: 1,
    npcs: [
      {
        id: "echo",
        name: "Echo",
        description: "Une IA de sécurité sous forme d'hologramme bleuté qui semble surveiller vos actions.",
        dialogue: {
          greeting: "Bienvenue à votre première épreuve. Vous devez trier 20 emails en identifiant ceux qui sont des tentatives de phishing. Utilisez la commande 'flag <id_email> spam' pour marquer un email comme malveillant ou 'flag <id_email> safe' pour le valider.",
          options: [
            {
              id: "help",
              text: "Comment reconnaître un phishing ?",
              response: "Examinez l'adresse d'expédition, les fautes d'orthographe, les demandes urgentes d'informations sensibles, et les liens suspects. Méfiez-vous des pièces jointes non sollicitées.",
              timeBonus: 0
            },
            {
              id: "refuse",
              text: "Je n'ai pas le temps pour ça.",
              response: "Le temps est votre ennemi, mais négliger les bases de la sécurité peut être fatal. À vous de choisir vos priorités.",
              timePenalty: 15
            }
          ]
        }
      }
    ],
    exits: [
      {
        direction: "est",
        targetRoomId: "mur_revelations",
        locked: true,
        keyId: "key_phish",
        description: "Cette porte nécessite une validation de votre capacité à détecter les menaces de phishing."
      }
    ],
    challenge: {
      type: "email",
      title: "Triage Anti-Phishing",
      description: "Identifiez les emails malveillants parmi les messages affichés.",
      completed: false,
      timeBonus: 10,
      timePenalty: 20,
      emails: [
        {
          id: "email1",
          sender: "securite@banque-nationale.fr",
          subject: "Action urgente requise sur votre compte",
          content: "Cher client, Nous avons détecté une activité suspecte sur votre compte. Cliquez sur ce lien pour vérifier vos informations: http://banque-nationale.secure-verification.co/login",
          isPhishing: true
        },
        {
          id: "email2",
          sender: "service-clients@transport-express.com",
          subject: "Confirmation de votre colis",
          content: "Votre colis #TR-78542 est en route. Suivez sa livraison avec le numéro fourni sur notre site officiel.",
          isPhishing: false
        }
        // Note: Dans une implémentation complète, il y aurait 20 emails avec un mélange de légitimes et de phishing
      ],
      reward: "key_phish"
    },
    visited: false
  },

  // Étape 2: Mur des Révélations
  "mur_revelations": {
    id: "mur_revelations",
    name: "Mur des Révélations",
    description: "Une vaste salle circulaire dont les parois sont couvertes d'écrans affichant des flux de réseaux sociaux, articles de presse et registres publics. Au centre, un poste de recherche OSINT avec plusieurs terminaux.",
    stage: 2,
    npcs: [
      {
        id: "analyste",
        name: "Analyste de Données",
        description: "Un spécialiste OSINT qui observe des patterns dans les flux d'information.",
        dialogue: {
          greeting: "L'information est partout, mais la vérité se cache. Vous devez trouver 3 informations critiques sur la cible 'CyberVault Inc.' en utilisant la commande 'rechercher <terme>'.",
          options: [
            {
              id: "hint",
              text: "Des conseils pour ma recherche ?",
              response: "Cherchez les acquisitions récentes, les dirigeants et les vulnérabilités signalées. La surface d'attaque OSINT est souvent plus vaste qu'on ne le pense.",
              timeBonus: 5
            },
            {
              id: "distrust",
              text: "Pourquoi devrais-je vous faire confiance ?",
              response: "La méfiance est une qualité en OSINT. Vérifiez toujours vos sources et recoupez l'information. Mais ne perdez pas trop de temps...",
              timePenalty: 5
            }
          ]
        }
      }
    ],
    exits: [
      {
        direction: "ouest",
        targetRoomId: "vestibule",
        locked: false
      },
      {
        direction: "nord",
        targetRoomId: "couloir_badges",
        locked: true,
        keyId: "intel_fragment",
        description: "Cette porte nécessite des fragments d'intelligence pour être déverrouillée."
      }
    ],
    challenge: {
      type: "osint",
      title: "Recherche OSINT",
      description: "Trouvez 3 informations critiques sur CyberVault Inc.",
      completed: false,
      timeBonus: 15,
      timePenalty: 30,
      options: [
        {
          id: "acquisition",
          text: "Acquisition de SecureNet",
          isCorrect: true,
          explanation: "CyberVault a récemment acquis SecureNet, élargissant sa surface d'attaque."
        },
        {
          id: "ceo",
          text: "CEO: Maria Dellacroix",
          isCorrect: true,
          explanation: "La dirigeante a précédemment travaillé dans une agence gouvernementale."
        },
        {
          id: "vulnerability",
          text: "CVE-2024-8734 non patchée",
          isCorrect: true,
          explanation: "Leur plateforme cloud présente une vulnérabilité d'injection SQL non corrigée."
        },
        {
          id: "fake_breach",
          text: "Fuite de données massive en 2024",
          isCorrect: false,
          explanation: "Information erronée propagée par des concurrents."
        }
      ],
      reward: "intel_fragment"
    },
    visited: false
  },

  // Étape 3: Couloir des Badges
  "couloir_badges": {
    id: "couloir_badges",
    name: "Couloir des Badges",
    description: "Un long corridor aux parois transparentes, derrière lesquelles des serveurs clignotent à l'infini. Des lecteurs de badges sont disposés à intervalle régulier le long du mur principal.",
    stage: 3,
    npcs: [
      {
        id: "iam_expert",
        name: "Expert IAM",
        description: "Un spécialiste en gestion des identités et des accès qui travaille sur un panneau de contrôle.",
        dialogue: {
          greeting: "Le contrôle d'accès est la pierre angulaire de la sécurité moderne. Utilisez votre lecteur RFID pour scanner les badges et les associer aux bons services cloud en utilisant 'scanner <id_badge>'.",
          options: [
            {
              id: "principle",
              text: "Quel principe dois-je suivre ?",
              response: "Le principe du moindre privilège. N'attribuez que les permissions strictement nécessaires pour chaque rôle, jamais plus.",
              timeBonus: 10
            },
            {
              id: "shortcut",
              text: "Existe-t-il un raccourci ?",
              response: "Les raccourcis en matière de conformité IAM conduisent aux violations de données. Prenez le temps de faire les choses correctement.",
              timePenalty: 10
            }
          ]
        }
      }
    ],
    exits: [
      {
        direction: "sud",
        targetRoomId: "mur_revelations",
        locked: false
      },
      {
        direction: "est",
        targetRoomId: "salle_stratex",
        locked: true,
        keyId: "badge_admin",
        description: "Cette porte nécessite un badge administrateur validé."
      }
    ],
    challenge: {
      type: "iam",
      title: "Gestion des Accès Cloud",
      description: "Associez correctement les badges aux services et rôles appropriés.",
      completed: false,
      timeBonus: 45,
      timePenalty: 60,
      badges: [
        {
          id: "badge1",
          role: "Développeur",
          service: "CodeRepository",
          permissions: ["read", "write", "commit"],
          isCorrect: true
        },
        {
          id: "badge2",
          role: "Administrateur",
          service: "AdminConsole",
          permissions: ["read", "write", "delete", "manage"],
          isCorrect: true
        },
        {
          id: "badge3",
          role: "Analyste",
          service: "DataLake",
          permissions: ["read", "query", "export"],
          isCorrect: true
        }
      ],
      reward: "badge_admin"
    },
    visited: false
  },

  // Étape 4: Salle Stratex
  "salle_stratex": {
    id: "salle_stratex",
    name: "Salle Stratex",
    description: "Une salle de conférence moderne avec une immense table en verre affichant des diagrammes holographiques de budget, d'architecture réseau et de feuilles de route de sécurité.",
    stage: 4,
    npcs: [
      {
        id: "ciso",
        name: "CISO",
        description: "Le Directeur de la Sécurité des Systèmes d'Information présente une stratégie à des investisseurs virtuels.",
        dialogue: {
          greeting: "La stratégie de cybersécurité n'est pas qu'une question technique, c'est une question de priorisation des ressources. Participez à cet exercice de budgétisation en classant les investissements par ordre de priorité.",
          options: [
            {
              id: "budget",
              text: "Comment équilibrer CAPEX et OPEX ?",
              response: "Un RSSI efficace maintient un équilibre entre les investissements d'infrastructure (CAPEX) et les dépenses opérationnelles (OPEX) comme la formation et la surveillance. Je vous donne un bonus pour cette question pertinente.",
              timeBonus: 15
            },
            {
              id: "tools",
              text: "Quels outils acheteriez-vous en premier ?",
              response: "Les outils sont secondaires à la stratégie. Définissez d'abord vos objectifs de sécurité, puis sélectionnez les outils qui s'y alignent. De nombreux RSSI commettent l'erreur inverse.",
              timeBonus: 0
            }
          ]
        }
      }
    ],
    exits: [
      {
        direction: "ouest",
        targetRoomId: "couloir_badges",
        locked: false
      },
      {
        direction: "nord",
        targetRoomId: "centre_alerte",
        locked: true,
        keyId: "plan_chip",
        description: "Cette porte nécessite une validation de votre compréhension stratégique."
      }
    ],
    challenge: {
      type: "strategy",
      title: "Priorisation Stratégique",
      description: "Classez les investissements cybersécurité par ordre de priorité.",
      completed: false,
      timeBonus: 30,
      timePenalty: 30,
      options: [
        {
          id: "awareness",
          text: "Formation et sensibilisation des employés",
          isCorrect: true,
          explanation: "Le facteur humain reste le maillon faible principal dans la chaîne de sécurité."
        },
        {
          id: "monitoring",
          text: "Systèmes de détection et réponse (EDR/XDR)",
          isCorrect: true,
          explanation: "Détecter rapidement les intrusions est crucial pour limiter leur impact."
        },
        {
          id: "patching",
          text: "Programme de gestion des vulnérabilités",
          isCorrect: true,
          explanation: "Maintenir les systèmes à jour est une défense fondamentale contre les exploits connus."
        },
        {
          id: "new_tools",
          text: "Acquisition des derniers outils de sécurité AI",
          isCorrect: false,
          explanation: "Les nouveaux outils ne remplacent pas les fondamentaux bien exécutés."
        }
      ],
      reward: "plan_chip"
    },
    visited: false
  },

  // Étape 5: Centre d'Alerte
  "centre_alerte": {
    id: "centre_alerte",
    name: "Centre d'Alerte",
    description: "Un centre opérationnel de sécurité (SOC) avec des écrans muraux affichant des alertes en temps réel, des graphiques de trafic réseau et des tableaux de bord de sécurité. L'ambiance est tendue.",
    stage: 5,
    npcs: [
      {
        id: "crisis_manager",
        name: "Gestionnaire de Crise",
        description: "Un professionnel calme mais alerte qui coordonne les réponses à un incident en cours.",
        dialogue: {
          greeting: "Nous avons une situation de crise active. Un ransomware vient d'être détecté dans notre infrastructure. En tant que responsable, vous devez prendre des décisions rapides sur la communication et la réponse à cet incident.",
          options: [
            {
              id: "isolate",
              text: "Isoler immédiatement les systèmes infectés",
              response: "Bonne décision initiale. L'isolation des systèmes compromis est cruciale pour contenir la propagation. Votre rapidité vous fait gagner du temps.",
              timeBonus: 20,
              nextDialogueId: "next_steps"
            },
            {
              id: "wait",
              text: "Attendre plus d'informations avant d'agir",
              response: "Chaque minute d'hésitation permet au ransomware de se propager davantage. Cette approche a coûté du temps précieux à votre équipe.",
              timePenalty: 30,
              nextDialogueId: "recovery"
            }
          ],
          followup: {
            "next_steps": [
              {
                id: "communicate",
                text: "Informer la direction et les parties prenantes",
                response: "Communication transparente et rapide - excellent choix. La direction apprécie d'être informée tôt, même avec des informations partielles.",
                timeBonus: 15,
                giveItem: "crisis_pass"
              },
              {
                id: "silence",
                text: "Résoudre d'abord le problème avant d'en parler",
                response: "Mauvaise stratégie. Sans communication, les rumeurs se propagent et la confiance s'érode. Vous perdez du temps à gérer les conséquences.",
                timePenalty: 15,
                giveItem: "crisis_pass"
              }
            ],
            "recovery": [
              {
                id: "restore",
                text: "Lancer la restauration depuis les sauvegardes",
                response: "Bonne décision de recovery, mais qui aurait été plus efficace après confinement du problème. Vous obtenez quand même l'accès à la salle suivante.",
                timeBonus: 10,
                giveItem: "crisis_pass"
              },
              {
                id: "negotiate",
                text: "Envisager de négocier avec les attaquants",
                response: "Négocier avec des cybercriminels comporte d'énormes risques réputationnels et légaux, sans garantie de récupération. Cette approche est généralement déconseillée.",
                timePenalty: 20,
                giveItem: "crisis_pass"
              }
            ]
          }
        }
      }
    ],
    exits: [
      {
        direction: "sud",
        targetRoomId: "salle_stratex",
        locked: false
      },
      {
        direction: "est",
        targetRoomId: "chaine_fantome",
        locked: true,
        keyId: "crisis_pass",
        description: "Cette porte nécessite une validation de vos compétences en gestion de crise."
      }
    ],
    challenge: {
      type: "crisis",
      title: "Gestion de Crise Ransomware",
      description: "Prenez les bonnes décisions face à un incident de sécurité majeur.",
      completed: false,
      timeBonus: 60,
      timePenalty: 45,
      reward: "crisis_pass"
    },
    visited: false
  },
  
  // Le reste des salles sera implémenté de manière similaire
  // Pour garder ce fichier à une taille raisonnable, je n'inclus que les 5 premières étapes
  // Dans une implémentation complète, les 10 étapes seraient définies

  // Placeholder pour les salles 6-10
  "chaine_fantome": {
    id: "chaine_fantome",
    name: "Chaîne Fantôme",
    description: "Une salle obscure représentant la chaîne d'approvisionnement logicielle avec des bibliothèques flottant comme des fantômes dans l'espace. Certaines brillent d'une lueur rouge inquiétante.",
    stage: 6,
    npcs: [],
    exits: [
      {
        direction: "ouest",
        targetRoomId: "centre_alerte",
        locked: false
      }
    ],
    challenge: {
      type: "supply",
      title: "Audit de Chaîne d'Approvisionnement",
      description: "Décryptez et identifiez les bibliothèques compromises.",
      completed: false,
      timeBonus: 40,
      timePenalty: 90,
      reward: "supply_stamp"
    },
    visited: false
  },
};

export default initialRooms;