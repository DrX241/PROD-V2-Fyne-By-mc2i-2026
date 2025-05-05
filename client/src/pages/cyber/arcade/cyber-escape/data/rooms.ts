// Types pour les salles et personnages virtuels
export interface Character {
  id: string;
  name: string;
  role: string;
  avatar: string;
  department: string;
  status: 'online' | 'away' | 'offline';
  securityLevel: number; // 1-5, représente le niveau de sécurité du personnage
  introduction: string;
  conversations: {
    [key: string]: {
      messages: Array<{
        sender: 'character' | 'player';
        content: string;
        timestamp?: string;
      }>;
      challenges?: Array<{
        id: string;
        question: string;
        options?: string[];
        correctAnswer?: string | number;
        explanation: string;
        points: number;
      }>;
    };
  };
}

export interface VirtualRoom {
  id: string;
  name: string;
  description: string;
  icon: string;
  backgroundColor: string;
  characters: Character[];
  isLocked?: boolean;
  requiredPoints?: number;
}

// Données des salles virtuelles
export const virtualRooms: VirtualRoom[] = [
  {
    id: 'lobby',
    name: 'Accueil',
    description: 'Point d\'entrée du réseau virtuel de l\'entreprise. Vous pouvez vous orienter vers différents départements.',
    icon: 'building',
    backgroundColor: '#1e40af',
    characters: [
      {
        id: 'reception-ai',
        name: 'IA Accueil',
        role: 'Assistant Virtuel',
        avatar: 'https://i.imgur.com/UVEBEBU.png',
        department: 'Accueil',
        status: 'online',
        securityLevel: 3,
        introduction: 'Bonjour et bienvenue dans le réseau virtuel de l\'entreprise. Je suis l\'assistant virtuel qui vous guidera dans les différentes salles. Comment puis-je vous aider aujourd\'hui ?',
        conversations: {
          'introduction': {
            messages: [
              {
                sender: 'character',
                content: 'Bonjour et bienvenue dans le réseau virtuel de l\'entreprise. Je suis l\'assistant virtuel qui vous guidera dans les différentes salles. Votre mission est d\'identifier et de corriger les vulnérabilités de sécurité avant qu\'elles ne soient exploitées.',
              },
              {
                sender: 'character',
                content: 'Un acteur malveillant a pénétré notre réseau et tente d\'exploiter des vulnérabilités dans différents départements. Vous devez intervenir avant lui !',
              }
            ],
            challenges: [
              {
                id: 'tutorial',
                question: 'Avant de commencer, pouvez-vous me dire quel est votre niveau d\'expertise en cybersécurité ?',
                options: ['Débutant', 'Intermédiaire', 'Expert'],
                correctAnswer: -1, // Toutes les réponses sont acceptées
                explanation: 'Parfait ! J\'adapterai les informations en fonction de votre niveau. N\'hésitez pas à visiter les différents départements pour identifier et corriger les vulnérabilités.',
                points: 0
              }
            ]
          },
          'help': {
            messages: [
              {
                sender: 'character',
                content: 'Voici comment fonctionne ce système : vous pouvez naviguer entre les différentes salles virtuelles en cliquant sur leurs icônes. Dans chaque salle, vous pourrez interagir avec les membres du personnel et découvrir des vulnérabilités de sécurité potentielles.',
              },
              {
                sender: 'character',
                content: 'Pour réussir votre mission, vous devez : 1) Identifier les vulnérabilités à travers les conversations, 2) Proposer des corrections appropriées, 3) Accumuler des points de sécurité pour débloquer des salles avec des niveaux de sécurité plus élevés.',
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
    description: 'Le département IT gère l\'infrastructure technologique et répond aux demandes des utilisateurs.',
    icon: 'server',
    backgroundColor: '#0f766e',
    characters: [
      {
        id: 'admin-thomas',
        name: 'Thomas Martin',
        role: 'Administrateur Système',
        avatar: 'https://i.imgur.com/vLyGj6X.png',
        department: 'IT',
        status: 'online',
        securityLevel: 4,
        introduction: 'Bonjour, je suis l\'administrateur système. Nous avons quelques problèmes avec nos serveurs aujourd\'hui. Pouvez-vous m\'aider ?',
        conversations: {
          'password-issue': {
            messages: [
              {
                sender: 'character',
                content: 'Salut ! Je suis en train de configurer l\'accès aux nouveaux serveurs. J\'ai créé un fichier texte sur le bureau avec tous les mots de passe par défaut pour faciliter le déploiement.',
              },
              {
                sender: 'player',
                content: 'Est-ce que c\'est vraiment sécurisé de garder tous les mots de passe dans un fichier texte sur le bureau ?',
              },
              {
                sender: 'character',
                content: 'Oh, c\'est juste temporaire, pour quelques jours. C\'est plus pratique pour l\'équipe quand on configure plusieurs serveurs à la fois. Tu penses que c\'est risqué ?',
              }
            ],
            challenges: [
              {
                id: 'password-storage',
                question: 'Quelle serait la meilleure solution pour gérer ces mots de passe ?',
                options: [
                  'Continuer à utiliser un fichier texte mais le protéger par mot de passe',
                  'Utiliser un gestionnaire de mots de passe d\'entreprise sécurisé',
                  'Envoyer les mots de passe par email à chaque administrateur',
                  'Imprimer les mots de passe et les conserver dans un tiroir verrouillé'
                ],
                correctAnswer: 1,
                explanation: 'Un gestionnaire de mots de passe d\'entreprise sécurisé est la meilleure solution. Il permet de stocker les informations d\'identification de manière chiffrée, avec des contrôles d\'accès stricts et une traçabilité des actions.',
                points: 10
              }
            ]
          },
          'server-access': {
            messages: [
              {
                sender: 'character',
                content: 'Nous avons un nouveau stagiaire qui a besoin d\'accéder aux serveurs de production pour apprendre. Je pensais lui donner un compte admin pour qu\'il puisse tout explorer librement. Qu\'en penses-tu ?',
              }
            ],
            challenges: [
              {
                id: 'privilege-management',
                question: 'Quelle approche recommanderiez-vous pour l\'accès du stagiaire ?',
                options: [
                  'Lui donner un accès administrateur complet pour faciliter son apprentissage',
                  'Créer un compte avec privilèges minimaux et supervision pour les tâches spécifiques',
                  'Lui donner le même compte que son superviseur pour gagner du temps',
                  'Lui donner accès uniquement à l\'environnement de production'
                ],
                correctAnswer: 1,
                explanation: 'Le principe du moindre privilège est fondamental en sécurité. Il faut fournir uniquement les accès nécessaires pour accomplir les tâches spécifiques, idéalement dans un environnement de test ou de développement et non de production.',
                points: 15
              }
            ]
          }
        }
      },
      {
        id: 'tech-support-julie',
        name: 'Julie Dubois',
        role: 'Support Technique',
        avatar: 'https://i.imgur.com/kY6YeSV.png',
        department: 'IT',
        status: 'away',
        securityLevel: 2,
        introduction: 'Bonjour ! Je gère le support technique pour les employés. Nous avons beaucoup de tickets aujourd\'hui !',
        conversations: {
          'remote-access': {
            messages: [
              {
                sender: 'character',
                content: 'Un utilisateur du service marketing m\'a demandé une aide urgente mais je suis débordée. Il m\'a proposé de me connecter avec TeamViewer sur son poste et m\'a envoyé l\'ID et le mot de passe par SMS.',
              },
              {
                sender: 'player',
                content: 'Est-ce une pratique habituelle dans l\'entreprise ?',
              },
              {
                sender: 'character',
                content: 'Pas officiellement, mais ça arrive quand on est pressé et que l\'utilisateur insiste. Il dit que c\'est très urgent pour une présentation client dans une heure.',
              }
            ],
            challenges: [
              {
                id: 'remote-support-policy',
                question: 'Quelle est la meilleure façon de gérer cette situation ?',
                options: [
                  'Utiliser TeamViewer puisque c\'est urgent pour le client',
                  'Demander à l\'utilisateur d\'installer AnyDesk à la place, c\'est plus sécurisé',
                  'Utiliser uniquement la solution d\'accès distant approuvée par l\'entreprise avec authentification forte',
                  'Dire à l\'utilisateur de demander à un collègue à proximité'
                ],
                correctAnswer: 2,
                explanation: 'Il est crucial d\'utiliser uniquement les outils d\'accès à distance approuvés par l\'entreprise, avec authentification forte et en suivant les procédures établies. Cela protège contre les risques d\'usurpation d\'identité et garantit la traçabilité des interventions.',
                points: 10
              }
            ]
          }
        }
      }
    ]
  },
  {
    id: 'finance-department',
    name: 'Département Finance',
    description: 'L\'équipe des finances gère les opérations financières et comptables de l\'entreprise.',
    icon: 'banknote',
    backgroundColor: '#065f46',
    characters: [
      {
        id: 'finance-director',
        name: 'Philippe Moreau',
        role: 'Directeur Financier',
        avatar: 'https://i.imgur.com/L5Inszh.png',
        department: 'Finance',
        status: 'online',
        securityLevel: 5,
        introduction: 'Bonjour, je suis le directeur financier. Nous avons des processus de sécurité stricts ici en raison de la sensibilité de nos données.',
        conversations: {
          'urgent-transfer': {
            messages: [
              {
                sender: 'character',
                content: 'Je viens de recevoir un email du PDG me demandant d\'effectuer un virement urgent à un nouveau fournisseur. Il a précisé que c\'est confidentiel et que je ne dois pas en parler à l\'équipe pour l\'instant.',
              },
              {
                sender: 'player',
                content: 'Pouvez-vous me montrer cet email ?',
              },
              {
                sender: 'character',
                content: 'Bien sûr. [Montre l\'email qui contient quelques erreurs grammaticales et provient de "p.durand@entreprise-groupe.com" au lieu de "p.durand@entreprise.com"]',
              }
            ],
            challenges: [
              {
                id: 'identify-phishing',
                question: 'Que devrait faire Philippe face à cette demande ?',
                options: [
                  'Effectuer le virement rapidement puisque ça vient du PDG',
                  'Vérifier l\'authenticité de la demande par un autre canal de communication avant d\'agir',
                  'Transférer la demande au service IT pour vérification',
                  'Répondre à l\'email pour demander plus de détails'
                ],
                correctAnswer: 1,
                explanation: 'Il s\'agit probablement d\'une tentative de fraude au président (CEO fraud). Il faut toujours vérifier ce type de demande inhabituelle par un autre canal de communication, comme un appel téléphonique au numéro connu du PDG.',
                points: 20
              }
            ]
          }
        }
      },
      {
        id: 'accountant',
        name: 'Sophie Bernard',
        role: 'Comptable',
        avatar: 'https://i.imgur.com/aS8JLsx.png',
        department: 'Finance',
        status: 'online',
        securityLevel: 3,
        introduction: 'Bonjour, je travaille sur les rapports financiers mensuels. Comment puis-je vous aider ?',
        conversations: {
          'shared-account': {
            messages: [
              {
                sender: 'character',
                content: 'Notre équipe comptable utilise un compte partagé pour accéder au logiciel de comptabilité. C\'est plus simple quand quelqu\'un est absent, on peut toujours accéder aux dossiers urgents.',
              }
            ],
            challenges: [
              {
                id: 'account-sharing',
                question: 'Quelle recommandation feriez-vous concernant cette pratique ?',
                options: [
                  'C\'est une bonne pratique pour assurer la continuité du service',
                  'Chaque utilisateur devrait avoir son propre compte avec des permissions appropriées',
                  'Créer seulement deux comptes: un pour les managers et un pour les employés',
                  'Changer le mot de passe du compte partagé chaque semaine'
                ],
                correctAnswer: 1,
                explanation: 'Le partage de comptes compromet la traçabilité des actions et la responsabilité individuelle. Chaque utilisateur doit avoir son propre compte avec des droits appropriés, et des procédures de délégation temporaire peuvent être mises en place pour les absences.',
                points: 15
              }
            ]
          }
        }
      }
    ]
  },
  {
    id: 'hr-department',
    name: 'Ressources Humaines',
    description: 'Le département RH gère le recrutement, la formation et les questions relatives au personnel.',
    icon: 'users',
    backgroundColor: '#7c3aed',
    characters: [
      {
        id: 'hr-manager',
        name: 'Claire Dupont',
        role: 'Responsable RH',
        avatar: 'https://i.imgur.com/YQmuNsu.png',
        department: 'RH',
        status: 'online',
        securityLevel: 4,
        introduction: 'Bonjour, je gère toutes les questions liées au personnel et au recrutement. Avez-vous besoin d\'informations ?',
        conversations: {
          'employee-data': {
            messages: [
              {
                sender: 'character',
                content: 'Je travaille sur un tableau avec toutes les données personnelles des employés pour l\'audit annuel. Je l\'ai enregistré sur mon Drive personnel pour pouvoir y travailler ce weekend depuis chez moi.',
              }
            ],
            challenges: [
              {
                id: 'personal-data-handling',
                question: 'Quelle est la meilleure pratique pour gérer ces données sensibles ?',
                options: [
                  'Utiliser son Drive personnel est acceptable si le fichier est protégé par mot de passe',
                  'Envoyer le fichier à son email personnel pour y travailler à domicile',
                  'Utiliser uniquement les systèmes approuvés par l\'entreprise avec chiffrement et accès VPN si nécessaire',
                  'Imprimer les données pour travailler sur papier à la maison'
                ],
                correctAnswer: 2,
                explanation: 'Les données personnelles des employés sont très sensibles et protégées par des réglementations comme le RGPD. Elles doivent rester dans les systèmes sécurisés de l\'entreprise et être accédées via les méthodes approuvées (comme un VPN) pour le travail à distance.',
                points: 15
              }
            ]
          }
        }
      }
    ]
  },
  {
    id: 'rd-department',
    name: 'Recherche & Développement',
    description: 'L\'équipe R&D développe de nouveaux produits et technologies pour l\'entreprise.',
    icon: 'flask',
    backgroundColor: '#be123c',
    isLocked: true,
    requiredPoints: 50,
    characters: [
      {
        id: 'lead-dev',
        name: 'Marc Lambert',
        role: 'Responsable Développement',
        avatar: 'https://i.imgur.com/jIpTQsl.png',
        department: 'R&D',
        status: 'online',
        securityLevel: 5,
        introduction: 'Salut ! Mon équipe travaille sur le développement de notre nouvelle application sécurisée. Tu as des questions sur nos pratiques ?',
        conversations: {
          'code-security': {
            messages: [
              {
                sender: 'character',
                content: 'Nous avons un délai serré pour livrer la nouvelle fonctionnalité. L\'équipe envisage de contourner les tests de sécurité automatisés pour cette version et de les faire plus tard.',
              }
            ],
            challenges: [
              {
                id: 'secure-sdlc',
                question: 'Quelle approche recommanderiez-vous dans cette situation ?',
                options: [
                  'Approuver le contournement des tests pour respecter les délais commerciaux',
                  'Maintenir tous les tests de sécurité mais demander plus de temps pour la livraison',
                  'Effectuer une analyse de risque et maintenir au minimum les tests critiques',
                  'Suggérer de livrer en interne d\'abord pour tester sans exposer aux utilisateurs externes'
                ],
                correctAnswer: 2,
                explanation: 'La sécurité ne devrait jamais être complètement compromise, même face aux pressions commerciales. Une analyse de risque permet d\'identifier et de maintenir au minimum les tests critiques tout en négociant éventuellement un compromis réaliste sur les délais.',
                points: 20
              }
            ]
          },
          'api-keys': {
            messages: [
              {
                sender: 'character',
                content: 'Pour faciliter nos tests, nous gardons les clés API de production dans notre code source. C\'est plus simple pour tous les développeurs et ça évite de configurer des variables d\'environnement.',
              }
            ],
            challenges: [
              {
                id: 'credentials-management',
                question: 'Quelle est la bonne pratique pour gérer les clés API et autres secrets ?',
                options: [
                  'Les garder dans le code source avec des commentaires clairs',
                  'Les stocker dans un fichier de configuration séparé non versionné',
                  'Utiliser un gestionnaire de secrets sécurisé et des variables d\'environnement',
                  'Les encoder en base64 dans le code pour les masquer'
                ],
                correctAnswer: 2,
                explanation: 'Les secrets comme les clés API ne devraient jamais être stockés dans le code source. Un gestionnaire de secrets comme HashiCorp Vault, AWS Secrets Manager ou Azure Key Vault, combiné avec des variables d\'environnement, est la solution recommandée.',
                points: 25
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
    description: 'Centre névralgique de l\'infrastructure informatique. Accès hautement restreint.',
    icon: 'database',
    backgroundColor: '#b91c1c',
    isLocked: true,
    requiredPoints: 100,
    characters: [
      {
        id: 'security-admin',
        name: 'Alexandre Petit',
        role: 'Administrateur Sécurité',
        avatar: 'https://i.imgur.com/NB32VSg.png',
        department: 'IT Sécurité',
        status: 'online',
        securityLevel: 5,
        introduction: 'Bonjour. Cette zone est à accès restreint. Je supervise la sécurité physique et numérique de nos serveurs critiques.',
        conversations: {
          'backdoor-detection': {
            messages: [
              {
                sender: 'character',
                content: 'Nous avons détecté un trafic réseau suspect provenant d\'un de nos serveurs. Je soupçonne qu\'un attaquant a réussi à installer une porte dérobée. Pouvez-vous m\'aider à l\'identifier et à la neutraliser ?',
              }
            ],
            challenges: [
              {
                id: 'incident-response',
                question: 'Quelle devrait être la première étape pour gérer cet incident ?',
                options: [
                  'Éteindre immédiatement le serveur pour stopper l\'attaque',
                  'Faire une sauvegarde complète du système pour analyse',
                  'Isoler le serveur du réseau tout en le maintenant allumé pour l\'analyse',
                  'Lancer immédiatement un antivirus sur le serveur'
                ],
                correctAnswer: 2,
                explanation: 'La première étape devrait être d\'isoler le serveur compromis du réseau tout en le laissant fonctionner. Cela permet de contenir la menace tout en préservant les preuves et en permettant l\'analyse des processus suspects en cours d\'exécution.',
                points: 30
              },
              {
                id: 'backdoor-response',
                question: 'Après avoir isolé et analysé le serveur, quelle action est la plus appropriée ?',
                options: [
                  'Supprimer uniquement les fichiers malveillants identifiés et remettre le serveur en production',
                  'Appliquer les derniers correctifs et réintégrer le serveur',
                  'Reconstruire complètement le serveur à partir d\'une image propre',
                  'Restaurer à partir de la dernière sauvegarde connue'
                ],
                correctAnswer: 2,
                explanation: 'Lorsqu\'un serveur a été compromis, la meilleure pratique est de le reconstruire complètement à partir d\'une image propre. Les attaquants peuvent avoir installé plusieurs backdoors ou modifié des fichiers système d\'une manière difficile à détecter. Une simple suppression des fichiers malveillants ou une restauration pourrait laisser des vulnérabilités.',
                points: 40
              }
            ]
          }
        }
      }
    ]
  }
];