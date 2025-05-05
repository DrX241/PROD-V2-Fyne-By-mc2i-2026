import { Choice } from '../context/GameContext';

export interface Conversation {
  messages: Array<{
    sender: 'character' | 'player';
    content: string;
    timestamp?: string;
  }>;
  challenges: Array<{
    id: string;
    question: string;
    options?: string[];
    correctAnswer?: number;
    explanation: string;
    points: number;
  }>;
  choices?: Choice[];
  bestPracticeIds?: string[]; // IDs des bonnes pratiques à découvrir dans cette conversation
}

export interface Character {
  id: string;
  name: string;
  avatar: string;
  role: string;
  department: string;
  status: 'online' | 'away' | 'offline';
  securityLevel: number; // 1-5
  vulnerabilities?: string[]; // Les vulnérabilités liées à ce personnage (optionnel)
  conversations: Record<string, Conversation>;
}

export interface VirtualRoom {
  id: string;
  name: string;
  description: string;
  icon: string;
  backgroundColor?: string;
  characters: Character[];
  isLocked: boolean;
  requiredPoints?: number;
}

// Données des salles virtuelles
export const virtualRooms: VirtualRoom[] = [
  {
    id: 'lobby',
    name: 'Accueil',
    description: 'Point d\'entrée principal de l\'entreprise. Rencontrez les premiers interlocuteurs.',
    icon: 'building',
    backgroundColor: '#1e3a8a',
    isLocked: false,
    characters: [
      {
        id: 'receptionist',
        name: 'Marie Dupont',
        avatar: '/assets/avatars/receptionist.svg',
        role: 'Réceptionniste',
        department: 'Administration',
        status: 'online',
        securityLevel: 2,
        vulnerabilities: ['mots de passe visibles', 'divulgation d\'informations', 'absence de procédure pour les visiteurs'],
        conversations: {
          'introduction': {
            messages: [
              {
                sender: 'character',
                content: 'Bonjour et bienvenue ! Je suis Marie, la réceptionniste. Je peux vous aider à vous orienter dans notre entreprise.',
                timestamp: '09:15'
              },
              {
                sender: 'player',
                content: 'Bonjour Marie. Je suis le nouveau responsable cybersécurité. Je fais un audit de sécurité aujourd\'hui.',
                timestamp: '09:16'
              },
              {
                sender: 'character',
                content: 'Oh, parfait ! Nous avons justement eu quelques problèmes informatiques dernièrement. N\'hésitez pas à visiter les différents départements et à discuter avec les employés.',
                timestamp: '09:16'
              }
            ],
            challenges: [
              {
                id: 'lobby-intro-challenge',
                question: 'Vous remarquez que Marie a des post-it avec des mots de passe sur son moniteur. Quelle est la meilleure façon d\'aborder ce problème ?',
                options: [
                  'Lui dire que c\'est interdit et exiger qu\'elle les enlève immédiatement',
                  'L\'informer du risque de sécurité et lui proposer une alternative sécurisée comme un gestionnaire de mots de passe',
                  'Ignorer le problème, ce n\'est pas important',
                  'Prendre les post-it sans rien dire pour lui faire comprendre le risque'
                ],
                correctAnswer: 1,
                explanation: 'La sensibilisation est plus efficace que l\'autorité. Proposer une solution alternative concrète (gestionnaire de mots de passe) permet de résoudre le problème tout en éduquant l\'employé.',
                points: 10
              }
            ]
          },
          'visiteurs': {
            messages: [
              {
                sender: 'character',
                content: 'Ah, à propos des visiteurs, je voulais vous demander : je ne sais jamais quels sont les protocoles à suivre. J\'enregistre leurs noms mais parfois, ils vont directement dans les bureaux...',
                timestamp: '09:30'
              }
            ],
            challenges: [
              {
                id: 'visitor-policy-challenge',
                question: 'Quelle procédure recommanderiez-vous pour les visiteurs ?',
                options: [
                  'Aucune procédure n\'est nécessaire, l\'entreprise doit rester ouverte et accueillante',
                  'Enregistrer nom et heure d\'arrivée est suffisant',
                  'Enregistrement complet, badge visiteur, accompagnement par un employé et registre des entrées/sorties',
                  'Interdire tous les visiteurs pour maximiser la sécurité'
                ],
                correctAnswer: 2,
                explanation: 'Une bonne politique de gestion des visiteurs comprend leur identification, un badge visible, un accompagnement et un suivi. Cela limite les accès non autorisés tout en maintenant l\'ouverture de l\'entreprise.',
                points: 15
              }
            ]
          },
          'appels-telephoniques': {
            messages: [
              {
                sender: 'character',
                content: 'Je reçois parfois des appels de personnes qui demandent des informations sur les employés ou l\'entreprise. Je ne suis pas sûre de ce que je peux dire...',
                timestamp: '09:45'
              }
            ],
            challenges: [
              {
                id: 'phone-security-challenge',
                question: 'Comment Marie devrait-elle gérer les demandes d\'informations par téléphone ?',
                options: [
                  'Fournir les informations demandées si la personne semble légitime',
                  'Ne jamais donner d\'informations par téléphone, quelle que soit la situation',
                  'Demander l\'identité du demandeur, vérifier auprès de l\'employé concerné avant de transmettre des informations limitées',
                  'Transférer tous les appels au service informatique'
                ],
                correctAnswer: 2,
                explanation: 'La vérification de l\'identité des appelants et la confirmation avec les employés concernés permet d\'éviter l\'ingénierie sociale par téléphone tout en maintenant les communications nécessaires.',
                points: 15
              }
            ],
            choices: [
              {
                id: 'phone-policy-choice',
                question: 'Quelqu\'un vient d\'appeler en se présentant comme consultant IT et demande l\'adresse email du directeur financier pour lui envoyer un rapport urgent. Que conseillez-vous à Marie de faire ?',
                options: [
                  {
                    text: 'Donner l\'information car c\'est seulement une adresse email professionnelle qui est publique',
                    impact: -15,
                    reason: 'Vous avez facilité une possible attaque de phishing ciblé (spear phishing) contre le directeur financier'
                  },
                  {
                    text: 'Refuser poliment et proposer de prendre le message et le numéro du consultant pour que le directeur le rappelle',
                    impact: 10,
                    reason: 'Vous avez évité une fuite d\'information potentiellement exploitable tout en maintenant la communication professionnelle'
                  },
                  {
                    text: 'Demander des informations détaillées sur ce consultant et son entreprise avant de décider',
                    impact: 5,
                    reason: 'Votre démarche est prudente mais la vérification reste difficile par téléphone et des professionnels de l\'ingénierie sociale peuvent fabriquer des histoires crédibles'
                  }
                ]
              }
            ],
            bestPracticeIds: ['bp-phishing-awareness', 'bp-security-awareness']
          }
        }
      },
      {
        id: 'security-guard',
        name: 'Thomas Legrand',
        avatar: '/assets/avatars/security-guard.svg',
        role: 'Agent de sécurité',
        department: 'Sécurité physique',
        status: 'online',
        securityLevel: 3,
        vulnerabilities: ['prêt de badges', 'caméras non sécurisées', 'accès salle serveurs'],
        conversations: {
          'introduction': {
            messages: [
              {
                sender: 'character',
                content: 'Bonjour, je suis Thomas, responsable de la sécurité physique. Vous êtes le nouveau responsable cyber ? On va pouvoir travailler ensemble pour une sécurité complète !',
                timestamp: '09:20'
              },
              {
                sender: 'player',
                content: 'Bonjour Thomas. Effectivement, la sécurité informatique et physique sont complémentaires. Comment se passe le contrôle des accès ?',
                timestamp: '09:21'
              },
              {
                sender: 'character',
                content: 'On a un système de badges magnétiques pour les portes principales. Mais entre nous, certains employés prêtent leur badge ou laissent entrer d\'autres personnes par politesse...',
                timestamp: '09:22'
              }
            ],
            challenges: [
              {
                id: 'physical-access-challenge',
                question: 'Quel est le principal risque de sécurité lié au prêt de badges d\'accès ?',
                options: [
                  'Usure prématurée des badges électroniques',
                  'Impossibilité de suivre qui est réellement présent dans les locaux',
                  'Perturbation du système de comptage des employés',
                  'Aucun risque significatif'
                ],
                correctAnswer: 1,
                explanation: 'Le prêt de badges compromet la traçabilité des accès et peut permettre à des personnes non autorisées d\'accéder à des zones sensibles. En cas d\'incident, l\'identification des responsables devient impossible.',
                points: 10
              }
            ]
          },
          'cameras-surveillance': {
            messages: [
              {
                sender: 'character',
                content: 'On a récemment installé de nouvelles caméras de surveillance dans l\'entreprise. Elles sont connectées au réseau pour faciliter l\'accès aux enregistrements. C\'est pratique !',
                timestamp: '10:05'
              }
            ],
            challenges: [
              {
                id: 'camera-network-challenge',
                question: 'Quel risque de cybersécurité les caméras connectées présentent-elles ?',
                options: [
                  'Aucun risque, les caméras sont des dispositifs passifs',
                  'Elles peuvent servir de point d\'entrée pour un pirate informatique si elles ne sont pas correctement sécurisées',
                  'Elles consomment trop de bande passante réseau',
                  'Elles peuvent créer des interférences avec le Wi-Fi'
                ],
                correctAnswer: 1,
                explanation: 'Les caméras IP et autres objets connectés peuvent servir de porte d\'entrée à un attaquant si les mots de passe par défaut n\'ont pas été changés ou si leur firmware n\'est pas à jour. Une fois compromises, elles peuvent servir de point de pivot vers le réseau interne.',
                points: 15
              }
            ]
          },
          'salle-serveurs': {
            messages: [
              {
                sender: 'character',
                content: 'J\'ai remarqué que la porte de la salle serveurs reste parfois ouverte quand les techniciens y travaillent. Ils disent que c\'est pour la ventilation, mais je ne suis pas sûr que ce soit une bonne idée...',
                timestamp: '10:15'
              }
            ],
            challenges: [
              {
                id: 'server-room-challenge',
                question: 'Quelle mesure recommanderiez-vous pour la salle serveurs ?',
                options: [
                  'Laisser les techniciens gérer cela comme ils l\'entendent',
                  'Installer un système de ventilation amélioré et maintenir la porte fermée en permanence',
                  'Autoriser l\'ouverture de la porte uniquement pendant les heures de bureau',
                  'Déplacer les serveurs dans un espace ouvert pour faciliter la maintenance'
                ],
                correctAnswer: 1,
                explanation: 'La salle serveurs doit rester fermée et sécurisée en permanence. Si la ventilation est un problème, il faut améliorer le système de refroidissement plutôt que de compromettre la sécurité physique.',
                points: 15
              }
            ]
          }
        }
      }
    ]
  },
  {
    id: 'office',
    name: 'Bureaux Administratifs',
    description: 'Services administratifs, RH et comptabilité. Centre de gestion des informations sensibles de l\'entreprise.',
    icon: 'users',
    backgroundColor: '#0f766e',
    isLocked: false,
    characters: [
      {
        id: 'hr-manager',
        name: 'Claire Martin',
        avatar: '/assets/avatars/hr-manager.svg',
        role: 'Responsable RH',
        department: 'Ressources Humaines',
        status: 'away',
        securityLevel: 3,
        vulnerabilities: ['partage d\'informations sensibles', 'emails non sécurisés', 'gestion des documents'],
        conversations: {
          'introduction': {
            messages: [
              {
                sender: 'character',
                content: 'Bonjour, je suis Claire des RH. On m\'a dit que vous faisiez un audit de sécurité. Nous gérons beaucoup de données confidentielles ici.',
                timestamp: '10:30'
              },
              {
                sender: 'player',
                content: 'Bonjour Claire. Effectivement, les RH traitent des données personnelles sensibles. Comment gérez-vous leur protection ?',
                timestamp: '10:31'
              },
              {
                sender: 'character',
                content: 'Nous avons des dossiers papier dans des armoires fermées à clé et des fichiers numériques sur nos ordinateurs. Nous partageons parfois des informations par email entre collègues.',
                timestamp: '10:32'
              }
            ],
            challenges: [
              {
                id: 'hr-data-challenge',
                question: 'Quel est le principal problème de sécurité dans la gestion des données RH décrite par Claire ?',
                options: [
                  'L\'utilisation d\'armoires fermées à clé est obsolète',
                  'Le partage d\'informations sensibles par email standard sans chiffrement',
                  'L\'absence de copies papier de sauvegarde',
                  'Le stockage des données sur les ordinateurs locaux'
                ],
                correctAnswer: 1,
                explanation: 'Les emails standard ne sont pas chiffrés et peuvent être interceptés. Pour les données sensibles, il faut utiliser des méthodes de partage sécurisées comme des plateformes dédiées avec chiffrement ou des emails chiffrés.',
                points: 15
              }
            ]
          },
          'recrutement': {
            messages: [
              {
                sender: 'character',
                content: 'Pour le recrutement, nous recevons beaucoup de CV par email. Certains contiennent des liens vers des portfolios en ligne ou des fichiers joints. Comment devrions-nous les gérer ?',
                timestamp: '10:45'
              }
            ],
            challenges: [
              {
                id: 'cv-security-challenge',
                question: 'Quelle est la meilleure pratique pour gérer les CV et pièces jointes reçus ?',
                options: [
                  'Ouvrir tous les fichiers pour évaluer rapidement les candidats',
                  'Utiliser une plateforme dédiée au recrutement avec analyse de sécurité intégrée',
                  'Demander uniquement des CV au format papier',
                  'Ne jamais ouvrir les pièces jointes, demander des versions texte simple'
                ],
                correctAnswer: 1,
                explanation: 'Les pièces jointes et liens dans les emails peuvent contenir des malwares. Une plateforme dédiée au recrutement offre une analyse de sécurité des fichiers et un environnement isolé pour les traiter.',
                points: 15
              }
            ]
          },
          'rgpd': {
            messages: [
              {
                sender: 'character',
                content: 'J\'ai entendu parler du RGPD, mais je ne suis pas sûre de tout ce que nous devons faire pour être en conformité. Pouvez-vous m\'éclairer ?',
                timestamp: '11:00'
              }
            ],
            challenges: [
              {
                id: 'gdpr-challenge',
                question: 'Parmi ces actions, laquelle n\'est PAS une exigence du RGPD ?',
                options: [
                  'Informer les personnes de l\'utilisation de leurs données',
                  'Obtenir le consentement pour le traitement des données',
                  'Permettre l\'accès et la suppression des données personnelles',
                  'Stocker toutes les données pendant au moins 5 ans pour des raisons légales'
                ],
                correctAnswer: 3,
                explanation: 'Le RGPD exige de ne pas conserver les données plus longtemps que nécessaire. Stocker systématiquement toutes les données pendant 5 ans irait à l\'encontre du principe de minimisation des données.',
                points: 20
              }
            ]
          }
        }
      },
      {
        id: 'finance-director',
        name: 'Marc Leroy',
        avatar: '/assets/avatars/finance-director.svg',
        role: 'Directeur Financier',
        department: 'Finance',
        status: 'online',
        securityLevel: 4,
        vulnerabilities: ['fraude au président', 'vérification des paiements', 'gestion budgétaire'],
        conversations: {
          'introduction': {
            messages: [
              {
                sender: 'character',
                content: 'Bonjour, je suis Marc, le directeur financier. La sécurité est cruciale pour notre département qui gère des informations très sensibles.',
                timestamp: '11:15'
              },
              {
                sender: 'player',
                content: 'Bonjour Marc. Effectivement, les données financières sont particulièrement sensibles aux cyberattaques. Comment procédez-vous pour les paiements externes ?',
                timestamp: '11:16'
              },
              {
                sender: 'character',
                content: 'Nous utilisons notre logiciel de comptabilité pour la plupart des opérations. Parfois, pour les paiements urgents, nous recevons des instructions par email ou téléphone directement des managers.',
                timestamp: '11:17'
              }
            ],
            challenges: [
              {
                id: 'finance-security-challenge',
                question: 'Quel est le principal risque dans le processus de paiement décrit par Marc ?',
                options: [
                  'L\'utilisation d\'un logiciel de comptabilité',
                  'Le traitement des paiements urgents sur instruction par email ou téléphone sans vérification',
                  'L\'absence de validation par la direction générale',
                  'Les délais de traitement trop longs'
                ],
                correctAnswer: 1,
                explanation: 'Les fraudeurs utilisent souvent l\'usurpation d\'identité par email ou téléphone pour demander des paiements urgents. Sans processus de vérification (comme un contre-appel à un numéro connu), ces attaques peuvent réussir facilement.',
                points: 20
              }
            ]
          },
          'factures': {
            messages: [
              {
                sender: 'character',
                content: 'Nous recevons souvent des factures par email. Certains fournisseurs nous demandent parfois de mettre à jour nos informations de paiement. Comment savoir si ces demandes sont légitimes ?',
                timestamp: '11:30'
              }
            ],
            challenges: [
              {
                id: 'invoice-fraud-challenge',
                question: 'Quelle est la meilleure méthode pour vérifier une demande de changement des coordonnées bancaires d\'un fournisseur ?',
                options: [
                  'Vérifier que l\'email provient bien de l\'adresse habituelle du contact',
                  'Demander l\'approbation du manager',
                  'Contacter le fournisseur par téléphone à un numéro vérifié indépendamment pour confirmer',
                  'Effectuer un petit paiement test avant de changer définitivement les coordonnées'
                ],
                correctAnswer: 2,
                explanation: 'Les emails peuvent être falsifiés. La meilleure pratique est de contacter le fournisseur via un canal indépendant (comme un numéro de téléphone officiel que vous avez dans vos dossiers) pour confirmer tout changement de coordonnées bancaires.',
                points: 20
              }
            ]
          },
          'budget-securite': {
            messages: [
              {
                sender: 'character',
                content: 'Nous discutons du budget cybersécurité pour l\'année prochaine. Comment puis-je déterminer le montant approprié à allouer ? Quelles sont les priorités ?',
                timestamp: '11:45'
              }
            ],
            challenges: [
              {
                id: 'security-budget-challenge',
                question: 'Sur quoi devrait se baser la détermination du budget de cybersécurité ?',
                options: [
                  'Un pourcentage fixe du chiffre d\'affaires total',
                  'Le montant dépensé par les concurrents',
                  'Une analyse des risques spécifiques à l\'entreprise et le coût potentiel d\'une violation de données',
                  'Les recommandations des vendeurs de solutions de sécurité'
                ],
                correctAnswer: 2,
                explanation: 'Le budget devrait être basé sur une analyse des risques spécifiques à l\'entreprise, en considérant les actifs à protéger et l\'impact potentiel d\'une violation. Cette approche permet d\'allouer les ressources là où elles sont le plus nécessaires.',
                points: 15
              }
            ]
          }
        }
      }
    ]
  },
  {
    id: 'it-department',
    name: 'Service Informatique',
    description: 'Cœur technique de l\'entreprise où sont gérés les systèmes informatiques et le support aux utilisateurs.',
    icon: 'server',
    backgroundColor: '#0e7490',
    isLocked: false,
    characters: [
      {
        id: 'it-manager',
        name: 'Lucas Ricard',
        avatar: '/assets/avatars/it-manager.svg',
        role: 'Responsable IT',
        department: 'Informatique',
        status: 'online',
        securityLevel: 5,
        conversations: {
          'introduction': {
            messages: [
              {
                sender: 'character',
                content: 'Ah, vous voilà ! Je suis Lucas, responsable informatique. Je suis content qu\'on ait enfin quelqu\'un dédié à la cybersécurité. Nous avons beaucoup à faire !',
                timestamp: '13:00'
              },
              {
                sender: 'player',
                content: 'Bonjour Lucas. Je voudrais comprendre votre infrastructure et les mesures de sécurité déjà en place.',
                timestamp: '13:01'
              },
              {
                sender: 'character',
                content: 'Bien sûr ! Nous avons un réseau mixte avec des serveurs sur site et quelques services cloud. Notre principal défi est de maintenir tout à jour avec nos ressources limitées.',
                timestamp: '13:02'
              }
            ],
            challenges: [
              {
                id: 'patch-management-challenge',
                question: 'Quelle approche recommanderiez-vous pour la gestion des mises à jour avec des ressources limitées ?',
                options: [
                  'Mettre à jour tous les systèmes manuellement dès qu\'une mise à jour est disponible',
                  'Implémenter un système de gestion des correctifs automatisé avec hiérarchisation basée sur les risques',
                  'Mettre à jour uniquement lorsqu\'un problème survient',
                  'Déléguer les mises à jour aux utilisateurs'
                ],
                correctAnswer: 1,
                explanation: 'Un système automatisé de gestion des correctifs qui priorise les mises à jour en fonction de leur criticité permet d\'optimiser les ressources limitées tout en maintenant un bon niveau de sécurité.',
                points: 15
              }
            ]
          },
          'mots-de-passe': {
            messages: [
              {
                sender: 'character',
                content: 'Notre politique de mots de passe actuelle exige un changement tous les 30 jours. Les employés se plaignent et beaucoup écrivent leurs mots de passe ou utilisent des variations simples. Est-ce vraiment nécessaire ?',
                timestamp: '13:15'
              }
            ],
            challenges: [
              {
                id: 'password-policy-challenge',
                question: 'Quelle est la meilleure approche moderne concernant la politique de mots de passe ?',
                options: [
                  'Maintenir le changement obligatoire tous les 30 jours, la sécurité prime sur le confort',
                  'Augmenter à 90 jours pour réduire les plaintes',
                  'Utiliser des phrases de passe longues et uniques avec changement uniquement en cas de suspicion de compromission',
                  'Éliminer complètement les mots de passe au profit de la biométrie'
                ],
                correctAnswer: 2,
                explanation: 'Les recommandations modernes (NIST, ANSSI) préconisent des phrases de passe longues et complexes avec une rotation uniquement en cas de suspicion de compromission. Les changements fréquents encouragent des pratiques risquées comme l\'écriture des mots de passe ou des variations simples.',
                points: 15
              }
            ]
          },
          'sauvegarde': {
            messages: [
              {
                sender: 'character',
                content: 'Pour nos sauvegardes, nous avons un système automatisé qui sauvegarde toutes les données critiques sur un NAS dans notre local technique. Est-ce suffisant ?',
                timestamp: '13:30'
              }
            ],
            challenges: [
              {
                id: 'backup-strategy-challenge',
                question: 'Quel est le problème principal avec la stratégie de sauvegarde décrite ?',
                options: [
                  'Les sauvegardes automatisées ne sont pas fiables',
                  'Le NAS n\'est pas un support adapté aux sauvegardes',
                  'Toutes les données sont stockées au même endroit physique que les systèmes d\'origine',
                  'Les sauvegardes devraient être manuelles pour assurer leur qualité'
                ],
                correctAnswer: 2,
                explanation: 'La règle 3-2-1 des sauvegardes recommande: 3 copies des données, sur 2 types de supports différents, dont 1 hors site. Les sauvegardes stockées uniquement sur site sont vulnérables aux mêmes risques que les données originales (incendie, inondation, vol, ransomware).',
                points: 15
              }
            ]
          },
          'byod': {
            messages: [
              {
                sender: 'character',
                content: 'De plus en plus d\'employés veulent utiliser leurs appareils personnels pour le travail. Certains accèdent déjà à leurs emails professionnels sur leurs smartphones. Comment devrions-nous gérer cela ?',
                timestamp: '13:45'
              }
            ],
            challenges: [
              {
                id: 'byod-challenge',
                question: 'Quelle approche est recommandée pour la gestion des appareils personnels (BYOD) ?',
                options: [
                  'Interdire complètement l\'utilisation d\'appareils personnels pour des tâches professionnelles',
                  'Permettre l\'utilisation sans restriction pour améliorer la productivité',
                  'Mettre en place une politique BYOD avec des exigences de sécurité et une solution MDM',
                  'Exiger que les employés installent les mêmes logiciels que sur les postes de travail'
                ],
                correctAnswer: 2,
                explanation: 'Une politique BYOD bien définie avec une solution de gestion des appareils mobiles (MDM) permet de sécuriser les données de l\'entreprise tout en respectant la vie privée des employés et en autorisant l\'utilisation des appareils personnels.',
                points: 15
              }
            ]
          }
        }
      },
      {
        id: 'helpdesk-tech',
        name: 'Sophie Blanc',
        avatar: '/assets/avatars/helpdesk-tech.svg',
        role: 'Technicienne Helpdesk',
        department: 'Support IT',
        status: 'online',
        securityLevel: 3,
        conversations: {
          'introduction': {
            messages: [
              {
                sender: 'character',
                content: 'Bonjour ! Je suis Sophie du support technique. Je suis en première ligne quand les employés ont des problèmes informatiques.',
                timestamp: '14:00'
              },
              {
                sender: 'player',
                content: 'Bonjour Sophie. Le helpdesk est souvent une cible pour l\'ingénierie sociale. Comment vérifiez-vous l\'identité des utilisateurs qui vous contactent ?',
                timestamp: '14:01'
              },
              {
                sender: 'character',
                content: 'Hmm, c\'est une bonne question. Généralement, je demande leur nom et leur département. Pour les réinitialisations de mot de passe, je leur demande aussi leur date de naissance.',
                timestamp: '14:02'
              }
            ],
            challenges: [
              {
                id: 'helpdesk-authentication-challenge',
                question: 'Quel est le problème avec la méthode d\'authentification utilisée par Sophie ?',
                options: [
                  'Les réinitialisations de mot de passe devraient être entièrement automatisées',
                  'Les informations demandées sont facilement découvrables sur les réseaux sociaux ou par ingénierie sociale',
                  'Elle devrait demander plus d\'informations personnelles',
                  'Elle ne vérifie pas si l\'utilisateur a des demandes en attente'
                ],
                correctAnswer: 1,
                explanation: 'Les informations comme le nom, le département et la date de naissance sont faciles à obtenir sur les réseaux sociaux ou par ingénierie sociale. L\'authentification devrait utiliser des méthodes plus sécurisées comme un système de tickets, des questions secrètes spécifiques ou une vérification par un manager.',
                points: 15
              }
            ]
          },
          'requetes-urgentes': {
            messages: [
              {
                sender: 'character',
                content: 'Parfois, nous recevons des demandes urgentes d\'accès ou de droits administrateur de la part des managers. Comment devrions-nous les traiter ?',
                timestamp: '14:15'
              }
            ],
            challenges: [
              {
                id: 'privilege-escalation-challenge',
                question: 'Quelle est la meilleure approche pour gérer les demandes urgentes de privilèges élevés ?',
                options: [
                  'Accorder immédiatement la demande si elle vient d\'un manager',
                  'Refuser systématiquement toutes les demandes urgentes',
                  'Suivre une procédure d\'exception documentée avec vérifications supplémentaires et approbations',
                  'Accorder des droits temporaires sans vérification mais les révoquer après une heure'
                ],
                correctAnswer: 2,
                explanation: 'Les situations d\'urgence légitimes existent, mais elles doivent suivre une procédure d\'exception documentée qui inclut des vérifications d\'identité renforcées et des approbations multiples. Les droits accordés doivent être temporaires et limités au minimum nécessaire.',
                points: 15
              }
            ]
          },
          'phishing': {
            messages: [
              {
                sender: 'character',
                content: 'Nous recevons beaucoup d\'alertes d\'employés concernant des emails suspects. Comment devrions-nous les traiter et comment aider les employés à mieux les identifier ?',
                timestamp: '14:30'
              }
            ],
            challenges: [
              {
                id: 'phishing-response-challenge',
                question: 'Quelle est la meilleure réponse à donner à un employé qui signale un possible email de phishing ?',
                options: [
                  'Lui dire de supprimer l\'email et de ne pas s\'inquiéter',
                  'Demander à l\'employé de transférer l\'email à l\'équipe sécurité pour analyse et lui donner des instructions précises sur la marche à suivre',
                  'Blâmer l\'employé de ne pas avoir reconnu l\'email malveillant',
                  'Lui conseiller d\'ouvrir l\'email dans un environnement sécurisé'
                ],
                correctAnswer: 1,
                explanation: 'Il faut encourager le signalement des emails suspects en félicitant l\'employé pour sa vigilance. L\'email doit être analysé par l\'équipe sécurité (sans être ouvert par l\'employé), et des instructions claires doivent être données pour éviter toute action risquée.',
                points: 15
              }
            ]
          }
        }
      }
    ]
  },
  {
    id: 'development',
    name: 'Département R&D',
    description: 'Centre d\'innovation où sont développés les produits et services futurs de l\'entreprise.',
    icon: 'flask',
    backgroundColor: '#4f46e5',
    isLocked: true,
    requiredPoints: 50,
    characters: [
      {
        id: 'developer',
        name: 'Alex Dubois',
        avatar: '/assets/avatars/developer.svg',
        role: 'Développeur Senior',
        department: 'Développement',
        status: 'online',
        securityLevel: 4,
        conversations: {
          'introduction': {
            messages: [
              {
                sender: 'character',
                content: 'Salut ! Je suis Alex, développeur senior. Je travaille sur notre nouvelle application qui sera bientôt déployée. Vous avez besoin d\'informations sur nos pratiques de développement ?',
                timestamp: '15:00'
              },
              {
                sender: 'player',
                content: 'Bonjour Alex. J\'aimerais comprendre comment la sécurité est intégrée dans votre cycle de développement.',
                timestamp: '15:01'
              },
              {
                sender: 'character',
                content: 'On essaie de faire attention, mais avec les délais serrés, c\'est parfois difficile. On fait des revues de code entre nous et quelques tests avant la mise en production.',
                timestamp: '15:02'
              }
            ],
            challenges: [
              {
                id: 'secure-sdlc-challenge',
                question: 'Quelle amélioration serait la plus efficace pour renforcer la sécurité dans leur cycle de développement ?',
                options: [
                  'Allonger les délais de développement pour permettre plus de tests',
                  'Intégrer des tests de sécurité automatisés dans le pipeline CI/CD',
                  'Ajouter plus de développeurs à l\'équipe',
                  'Réduire la fréquence des déploiements'
                ],
                correctAnswer: 1,
                explanation: 'L\'intégration de tests de sécurité automatisés (SAST, DAST, SCA) dans le pipeline CI/CD permet de détecter les vulnérabilités tôt dans le cycle de développement sans ralentir significativement le processus. C\'est un bon équilibre entre sécurité et productivité.',
                points: 20
              }
            ]
          },
          'gestion-secrets': {
            messages: [
              {
                sender: 'character',
                content: 'Pour nos clés API et mots de passe, on les stocke généralement dans les fichiers de configuration. Certains sont même dans notre dépôt Git pour que tout le monde y ait accès facilement.',
                timestamp: '15:15'
              }
            ],
            challenges: [
              {
                id: 'secrets-management-challenge',
                question: 'Quelle est la meilleure pratique pour la gestion des secrets dans le code ?',
                options: [
                  'Les stocker dans des fichiers de configuration avec accès restreint',
                  'Les stocker dans le code source mais en les obfusquant',
                  'Utiliser un gestionnaire de secrets dédié et injecter les secrets lors du déploiement',
                  'Les stocker dans un fichier partagé accessible à toute l\'équipe'
                ],
                correctAnswer: 2,
                explanation: 'Les secrets ne doivent jamais être stockés dans le code source ou les dépôts Git. Un gestionnaire de secrets (comme HashiCorp Vault, AWS Secrets Manager) permet de stocker les secrets de manière sécurisée et de les injecter dans l\'application uniquement lors du déploiement.',
                points: 20
              }
            ]
          },
          'api-securite': {
            messages: [
              {
                sender: 'character',
                content: 'Notre API est principalement utilisée par notre application web, mais nous prévoyons de l\'ouvrir à des partenaires. Comment devrions-nous gérer la sécurité ?',
                timestamp: '15:30'
              }
            ],
            challenges: [
              {
                id: 'api-security-challenge',
                question: 'Quelle mesure de sécurité est essentielle pour une API accessible par des tiers ?',
                options: [
                  'Documenter toutes les fonctionnalités de l\'API publiquement',
                  'Mettre en place un système d\'authentification robuste, une limitation de débit et des contrôles d\'accès granulaires',
                  'Rendre l\'API aussi simple que possible',
                  'Permettre l\'accès anonyme pour faciliter l\'utilisation'
                ],
                correctAnswer: 1,
                explanation: 'Une API exposée à des tiers doit avoir une authentification forte (comme OAuth 2.0), une limitation de débit pour prévenir les abus, des contrôles d\'accès granulaires, et une journalisation complète des accès. La sécurité doit être multicouche.',
                points: 20
              }
            ]
          }
        }
      },
      {
        id: 'product-manager',
        name: 'Julie Lambert',
        avatar: '/assets/avatars/product-manager.svg',
        role: 'Chef de Produit',
        department: 'Produit',
        status: 'away',
        securityLevel: 3,
        conversations: {
          'introduction': {
            messages: [
              {
                sender: 'character',
                content: 'Bonjour, je suis Julie, chef de produit. Je fais le lien entre les besoins business et l\'équipe technique. La cybersécurité est importante, mais elle ne doit pas freiner l\'innovation.',
                timestamp: '16:00'
              },
              {
                sender: 'player',
                content: 'Bonjour Julie. Je comprends votre préoccupation. Comment intégrez-vous les exigences de sécurité dans vos spécifications produit ?',
                timestamp: '16:01'
              },
              {
                sender: 'character',
                content: 'Pour être honnête, nous nous concentrons d\'abord sur les fonctionnalités. La sécurité est souvent considérée comme une contrainte technique que l\'équipe de développement doit gérer à la fin.',
                timestamp: '16:02'
              }
            ],
            challenges: [
              {
                id: 'security-requirements-challenge',
                question: 'Comment intégrer efficacement la sécurité dans le développement produit sans freiner l\'innovation ?',
                options: [
                  'Ajouter une phase dédiée à la sécurité après le développement des fonctionnalités',
                  'Déléguer toute la responsabilité à l\'équipe de cybersécurité',
                  'Intégrer les exigences de sécurité dès les premières phases de conception avec des "user stories" de sécurité',
                  'Réduire les exigences de sécurité pour accélérer l\'innovation'
                ],
                correctAnswer: 2,
                explanation: 'Le concept de "security by design" consiste à intégrer la sécurité dès la conception du produit. Les exigences de sécurité doivent être traitées comme des user stories à part entière, avec la même priorité que les fonctionnalités. Cette approche réduit les coûts et les retards liés à la correction des problèmes découverts tardivement.',
                points: 15
              }
            ]
          },
          'confidentialite': {
            messages: [
              {
                sender: 'character',
                content: 'Notre nouvelle application collecte des données utilisateurs pour améliorer l\'expérience. Quelles sont les meilleures pratiques pour la confidentialité des données ?',
                timestamp: '16:15'
              }
            ],
            challenges: [
              {
                id: 'privacy-by-design-challenge',
                question: 'Quel principe NE fait PAS partie de l\'approche "Privacy by Design" ?',
                options: [
                  'Confidentialité par défaut',
                  'Minimisation des données',
                  'Collecte maximale pour analyse future',
                  'Transparence et information des utilisateurs'
                ],
                correctAnswer: 2,
                explanation: 'La "Privacy by Design" repose sur la minimisation des données (ne collecter que ce qui est nécessaire), la confidentialité par défaut (paramètres les plus restrictifs activés par défaut), et la transparence. La collecte maximale pour usage futur contredit ces principes.',
                points: 20
              }
            ]
          },
          'fournisseurs': {
            messages: [
              {
                sender: 'character',
                content: 'Nous utilisons plusieurs services SaaS et bibliothèques open source pour accélérer notre développement. Comment évaluer leur sécurité ?',
                timestamp: '16:30'
              }
            ],
            challenges: [
              {
                id: 'vendor-security-challenge',
                question: 'Quelle approche est la plus efficace pour évaluer la sécurité des fournisseurs et des composants tiers ?',
                options: [
                  'Se fier uniquement à la réputation de l\'entreprise',
                  'Examiner les certifications de sécurité, réaliser des évaluations de risques et mettre en place une surveillance continue',
                  'N\'utiliser que des solutions développées en interne',
                  'Demander uniquement l\'avis des autres utilisateurs'
                ],
                correctAnswer: 1,
                explanation: 'La gestion des risques liés aux tiers nécessite une approche complète : évaluation des certifications (ISO 27001, SOC 2), questionnaires de sécurité, analyse des dépendances, surveillance continue des vulnérabilités, et clauses contractuelles appropriées.',
                points: 15
              }
            ]
          }
        }
      }
    ]
  },
  {
    id: 'server-room',
    name: 'Salle Serveurs',
    description: 'Centre névralgique contenant l\'infrastructure physique et les systèmes critiques de l\'entreprise.',
    icon: 'server',
    backgroundColor: '#be123c',
    isLocked: true,
    requiredPoints: 100,
    characters: [
      {
        id: 'system-admin',
        name: 'Nicolas Fournier',
        avatar: '/assets/avatars/system-admin.svg',
        role: 'Administrateur Système',
        department: 'Infrastructure',
        status: 'online',
        securityLevel: 5,
        conversations: {
          'introduction': {
            messages: [
              {
                sender: 'character',
                content: 'Bonjour, je suis Nicolas, admin système. Je gère nos serveurs et notre infrastructure. C\'est bien que vous ayez accès à cette zone sécurisée, il y a beaucoup à voir ici.',
                timestamp: '17:00'
              },
              {
                sender: 'player',
                content: 'Bonjour Nicolas. J\'aimerais comprendre votre architecture réseau et les mesures de sécurité en place.',
                timestamp: '17:01'
              },
              {
                sender: 'character',
                content: 'Nous avons un réseau assez standard avec une DMZ pour nos serveurs exposés et un réseau interne pour les systèmes critiques. Notre principal défi est la gestion des accès privilégiés.',
                timestamp: '17:02'
              }
            ],
            challenges: [
              {
                id: 'pam-challenge',
                question: 'Quelle approche est la plus efficace pour gérer les accès privilégiés ?',
                options: [
                  'Partager un compte administrateur entre les membres de l\'équipe IT',
                  'Donner des droits administrateur à chaque technicien pour faciliter le support',
                  'Utiliser une solution PAM avec authentification multi-facteurs et principe du moindre privilège',
                  'Changer le mot de passe administrateur chaque mois'
                ],
                correctAnswer: 2,
                explanation: 'Une solution de Privileged Access Management (PAM) permet de gérer finement les accès privilégiés, d\'appliquer l\'authentification multi-facteurs, et d\'enregistrer les sessions pour l\'audit. Le principe du moindre privilège limite l\'exposition en cas de compromission d\'un compte.',
                points: 25
              }
            ]
          },
          'segmentation': {
            messages: [
              {
                sender: 'character',
                content: 'Notre réseau a grandi organiquement au fil des années. Nous avons plusieurs VLANs mais parfois les règles de filtrage entre zones ne sont pas très strictes pour faciliter les communications.',
                timestamp: '17:15'
              }
            ],
            challenges: [
              {
                id: 'network-segmentation-challenge',
                question: 'Quel principe devrait guider la segmentation réseau ?',
                options: [
                  'Créer autant de segments que possible pour maximiser la complexité',
                  'Segmenter par fonction et niveau de sensibilité avec des contrôles d\'accès stricts entre zones',
                  'Éviter la segmentation pour garantir une communication fluide',
                  'Segmenter uniquement en fonction des équipes'
                ],
                correctAnswer: 1,
                explanation: 'La segmentation doit regrouper les systèmes selon leur fonction et leur niveau de sensibilité, avec des contrôles d\'accès stricts entre zones. Cette approche limite la propagation latérale en cas de compromission et protège les actifs les plus sensibles.',
                points: 25
              }
            ]
          },
          'detection-intrusion': {
            messages: [
              {
                sender: 'character',
                content: 'Nous avons des logs sur nos serveurs et équipements réseau, mais nous manquons de visibilité sur les intrusions potentielles. Comment améliorer notre capacité de détection ?',
                timestamp: '17:30'
              }
            ],
            challenges: [
              {
                id: 'intrusion-detection-challenge',
                question: 'Quelle solution est la plus adaptée pour améliorer la détection des intrusions ?',
                options: [
                  'Augmenter la fréquence des scans antivirus',
                  'Déployer un SIEM avec corrélation d\'événements et détection des comportements anormaux',
                  'Installer plus de pare-feux',
                  'Embaucher plus d\'analystes sécurité pour examiner les logs manuellement'
                ],
                correctAnswer: 1,
                explanation: 'Un système SIEM (Security Information and Event Management) centralise les logs, corrèle les événements pour détecter les menaces complexes et peut utiliser l\'intelligence artificielle pour identifier les comportements anormaux. Cette approche est plus efficace qu\'une analyse manuelle ou des contrôles isolés.',
                points: 25
              }
            ]
          }
        }
      },
      {
        id: 'network-engineer',
        name: 'Émilie Roux',
        avatar: '/assets/avatars/network-engineer.svg',
        role: 'Ingénieure Réseau',
        department: 'Infrastructure',
        status: 'away',
        securityLevel: 4,
        conversations: {
          'introduction': {
            messages: [
              {
                sender: 'character',
                content: 'Bonjour, je suis Émilie, responsable de l\'infrastructure réseau. Je m\'occupe des pare-feux, routeurs et de la connectivité générale.',
                timestamp: '18:00'
              },
              {
                sender: 'player',
                content: 'Bonjour Émilie. Comment gérez-vous la sécurité au niveau de votre infrastructure réseau ?',
                timestamp: '18:01'
              },
              {
                sender: 'character',
                content: 'Nous avons des pare-feux en périphérie, mais avec le télétravail et l\'utilisation croissante du cloud, les frontières du réseau deviennent de plus en plus floues.',
                timestamp: '18:02'
              }
            ],
            challenges: [
              {
                id: 'perimeter-security-challenge',
                question: 'Quelle approche est la plus adaptée pour sécuriser un réseau dont les frontières sont de plus en plus floues ?',
                options: [
                  'Renforcer les pare-feux de périmètre pour bloquer toutes les connexions externes',
                  'Abandonner les contrôles de sécurité réseau et migrer tout vers le cloud',
                  'Adopter une approche Zero Trust avec vérification continue de l\'identité et du contexte',
                  'Revenir à un modèle où tous les employés travaillent sur site'
                ],
                correctAnswer: 2,
                explanation: 'Le modèle Zero Trust abandonne la notion de périmètre de confiance au profit d\'une vérification continue de l\'identité, du contexte et des comportements, résumée par la devise "never trust, always verify". Cette approche est adaptée aux environnements hybrides et au télétravail.',
                points: 20
              }
            ]
          },
          'vpn': {
            messages: [
              {
                sender: 'character',
                content: 'Nos employés en télétravail se connectent via VPN, mais certains se plaignent des performances et contournent parfois cette protection. Comment améliorer cette situation ?',
                timestamp: '18:15'
              }
            ],
            challenges: [
              {
                id: 'remote-access-challenge',
                question: 'Quelle solution recommanderiez-vous pour sécuriser l\'accès à distance tout en améliorant l\'expérience utilisateur ?',
                options: [
                  'Renforcer les obligations d\'utilisation du VPN avec des sanctions',
                  'Ne pas exiger de VPN pour faciliter le travail des employés',
                  'Implémenter une solution d\'accès sécurisé basée sur le cloud avec des connecteurs locaux (SASE/ZTNA)',
                  'Limiter le télétravail pour réduire les risques'
                ],
                correctAnswer: 2,
                explanation: 'Les solutions modernes d\'accès sécurisé comme SASE (Secure Access Service Edge) ou ZTNA (Zero Trust Network Access) offrent un meilleur équilibre entre sécurité et expérience utilisateur. Elles vérifient l\'identité, la posture de sécurité et n\'accordent que l\'accès aux applications spécifiques nécessaires.',
                points: 20
              }
            ]
          },
          'iot': {
            messages: [
              {
                sender: 'character',
                content: 'Nous avons de plus en plus d\'appareils IoT sur notre réseau : systèmes de contrôle d\'accès, imprimantes intelligentes, capteurs... Comment les sécuriser efficacement ?',
                timestamp: '18:30'
              }
            ],
            challenges: [
              {
                id: 'iot-security-challenge',
                question: 'Quelle est la meilleure pratique pour sécuriser les dispositifs IoT en entreprise ?',
                options: [
                  'Accepter qu\'ils sont intrinsèquement non sécurisés et les utiliser malgré tout',
                  'Isoler les dispositifs IoT dans un réseau séparé avec des contrôles d\'accès stricts',
                  'Installer des antivirus sur tous les dispositifs IoT',
                  'Interdire complètement les dispositifs IoT'
                ],
                correctAnswer: 1,
                explanation: 'Les dispositifs IoT présentent souvent des vulnérabilités et un manque de mises à jour de sécurité. La meilleure approche consiste à les isoler dans un réseau dédié (VLAN), à restreindre strictement leurs communications, et à surveiller leur trafic pour détecter les activités anormales.',
                points: 20
              }
            ]
          }
        }
      }
    ]
  },
  {
    id: 'executive',
    name: 'Direction Générale',
    description: 'Bureau de la haute direction où sont prises les décisions stratégiques de l\'entreprise.',
    icon: 'banknote',
    backgroundColor: '#3730a3',
    isLocked: true,
    requiredPoints: 150,
    characters: [
      {
        id: 'ceo',
        name: 'Philippe Moreau',
        avatar: '/assets/avatars/ceo.svg',
        role: 'PDG',
        department: 'Direction',
        status: 'away',
        securityLevel: 5,
        conversations: {
          'introduction': {
            messages: [
              {
                sender: 'character',
                content: 'Bonjour, je suis Philippe Moreau, PDG. Je suis ravi de voir que vous avez fait un bon travail pour renforcer notre sécurité. Parlons des priorités stratégiques.',
                timestamp: '19:00'
              },
              {
                sender: 'player',
                content: 'Bonjour M. Moreau. Merci de me recevoir. J\'aimerais comprendre vos préoccupations principales concernant la cybersécurité au niveau stratégique.',
                timestamp: '19:01'
              },
              {
                sender: 'character',
                content: 'Ma principale préoccupation est de trouver le bon équilibre entre sécurité et agilité business. La sécurité est importante, mais elle ne peut pas nous empêcher d\'innover rapidement.',
                timestamp: '19:02'
              }
            ],
            challenges: [
              {
                id: 'business-alignment-challenge',
                question: 'Comment aligner au mieux la stratégie de cybersécurité avec les objectifs business ?',
                options: [
                  'Prioriser systématiquement la sécurité au détriment des objectifs business',
                  'Laisser les unités business décider de leurs propres mesures de sécurité',
                  'Aligner les investissements en sécurité sur les risques business et intégrer la sécurité dans les processus d\'innovation',
                  'Limiter les investissements en sécurité au minimum légal exigé'
                ],
                correctAnswer: 2,
                explanation: 'L\'alignement de la sécurité avec le business passe par une analyse des risques basée sur les impacts business, l\'intégration de la sécurité dès la conception des nouveaux projets, et la démonstration de la valeur ajoutée de la sécurité (réduction des incidents, conformité, confiance client).',
                points: 30
              }
            ]
          },
          'conseil-administration': {
            messages: [
              {
                sender: 'character',
                content: 'Je dois faire un point cybersécurité lors du prochain conseil d\'administration. Quels sont les sujets clés que je devrais aborder avec notre conseil ?',
                timestamp: '19:15'
              }
            ],
            challenges: [
              {
                id: 'board-reporting-challenge',
                question: 'Quels éléments devraient figurer dans un rapport de cybersécurité destiné au conseil d\'administration ?',
                options: [
                  'Détails techniques des vulnérabilités et configurations des systèmes',
                  'KPIs techniques comme le nombre de patchs appliqués',
                  'Posture de risque globale, incidents significatifs, investissements requis et comparaison avec les standards du secteur',
                  'Uniquement les bonnes nouvelles pour ne pas inquiéter le conseil'
                ],
                correctAnswer: 2,
                explanation: 'Le reporting au niveau du conseil doit se concentrer sur les risques cyber en termes d\'impacts business, la posture de sécurité globale, les incidents majeurs et leur impact, les investissements nécessaires, et la comparaison avec les pairs du secteur. Il doit être non-technique et orienté décision.',
                points: 30
              }
            ]
          },
          'resilience': {
            messages: [
              {
                sender: 'character',
                content: 'Avec l\'augmentation des ransomwares, je m\'inquiète de notre capacité à maintenir l\'activité en cas d\'attaque majeure. Comment renforcer notre résilience ?',
                timestamp: '19:30'
              }
            ],
            challenges: [
              {
                id: 'cyber-resilience-challenge',
                question: 'Quelle approche est la plus efficace pour renforcer la cyber-résilience de l\'entreprise ?',
                options: [
                  'Se concentrer uniquement sur la prévention des attaques',
                  'Souscrire une cyber-assurance pour couvrir tous les risques',
                  'Développer une stratégie holistique combinant prévention, détection, réponse et plans de continuité d\'activité',
                  'Accepter que les attaques sont inévitables et se préparer uniquement à la reprise post-incident'
                ],
                correctAnswer: 2,
                explanation: 'La cyber-résilience nécessite une approche équilibrée : prévention (réduire la surface d\'attaque), détection rapide, capacité de réponse efficace, et plans de continuité/reprise d\'activité testés régulièrement. L\'objectif est de maintenir les fonctions critiques même pendant une attaque.',
                points: 30
              }
            ]
          }
        }
      },
      {
        id: 'ciso',
        name: 'Isabelle Laurent',
        avatar: '/assets/avatars/ciso.svg',
        role: 'RSSI',
        department: 'Sécurité',
        status: 'online',
        securityLevel: 5,
        conversations: {
          'introduction': {
            messages: [
              {
                sender: 'character',
                content: 'Bonjour, je suis Isabelle Laurent, RSSI de l\'entreprise. Je supervise la stratégie de cybersécurité globale. Vos évaluations ont été très utiles pour identifier nos vulnérabilités.',
                timestamp: '20:00'
              },
              {
                sender: 'player',
                content: 'Bonjour Isabelle. Merci pour votre accueil. J\'aimerais comprendre votre vision stratégique de la sécurité et les défis principaux que vous rencontrez.',
                timestamp: '20:01'
              },
              {
                sender: 'character',
                content: 'Notre principal défi est de faire évoluer notre programme de sécurité au même rythme que la transformation numérique de l\'entreprise. Nous migrons vers le cloud et adoptons de nouvelles technologies rapidement.',
                timestamp: '20:02'
              }
            ],
            challenges: [
              {
                id: 'security-transformation-challenge',
                question: 'Quelle approche est la plus efficace pour adapter la sécurité à la transformation numérique ?',
                options: [
                  'Ralentir la transformation numérique pour permettre à la sécurité de suivre',
                  'Intégrer la sécurité dans les équipes produit et DevOps avec des processus automatisés',
                  'Attendre que les technologies soient matures avant de mettre en place des contrôles de sécurité',
                  'Augmenter massivement les effectifs de l\'équipe sécurité'
                ],
                correctAnswer: 1,
                explanation: 'Le modèle DevSecOps intègre la sécurité directement dans les équipes de développement et d\'opérations, avec des outils automatisés dans le pipeline CI/CD. Cette approche permet à la sécurité d\'évoluer à la même vitesse que le développement plutôt que d\'être un goulot d\'étranglement.',
                points: 30
              }
            ]
          },
          'culture-securite': {
            messages: [
              {
                sender: 'character',
                content: 'Nous essayons de développer une culture de sécurité à tous les niveaux de l\'entreprise, mais c\'est parfois difficile de faire passer le message efficacement.',
                timestamp: '20:15'
              }
            ],
            challenges: [
              {
                id: 'security-culture-challenge',
                question: 'Quelle est la meilleure approche pour développer une culture de sécurité efficace ?',
                options: [
                  'Multiplier les formations obligatoires et les rappels des règles',
                  'Sanctionner sévèrement les erreurs pour dissuader les comportements risqués',
                  'Développer un programme positif et engageant avec des champions de sécurité dans chaque équipe',
                  'Laisser la responsabilité entièrement à l\'équipe de sécurité'
                ],
                correctAnswer: 2,
                explanation: 'Une culture de sécurité positive se concentre sur l\'engagement plutôt que la contrainte. Elle implique des champions de sécurité dans chaque équipe, une communication adaptée au contexte métier, la reconnaissance des bons comportements, et une approche bienveillante face aux erreurs pour encourager leur signalement.',
                points: 25
              }
            ]
          },
          'recrutement': {
            messages: [
              {
                sender: 'character',
                content: 'Je cherche à étoffer notre équipe de sécurité, mais le recrutement est difficile dans ce domaine. Quels profils et compétences recommanderiez-vous de prioriser ?',
                timestamp: '20:30'
              }
            ],
            challenges: [
              {
                id: 'security-team-challenge',
                question: 'Comment constituer une équipe de sécurité efficace dans un contexte de pénurie de talents ?',
                options: [
                  'Recruter uniquement des experts techniques très spécialisés',
                  'Privilégier des profils diversifiés combinant compétences techniques et business, et développer les talents en interne',
                  'Externaliser complètement la fonction sécurité',
                  'Recruter uniquement des profils certifiés'
                ],
                correctAnswer: 1,
                explanation: 'Une équipe de sécurité efficace combine des profils variés : expertise technique, compréhension business, communication, et gestion du risque. Le développement interne (via mentorat, formation, promotion) et la création de passerelles depuis d\'autres fonctions IT sont essentiels face à la pénurie de talents.',
                points: 25
              }
            ]
          }
        }
      }
    ]
  }
];