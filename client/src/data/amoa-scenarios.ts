import { AmoaScenario } from '../../shared/types/amoa';
import { v4 as uuidv4 } from 'uuid';

// Jeu de données de scénarios AMOA pour le module
export const amoaScenarios: AmoaScenario[] = [
  {
    id: '1',
    title: 'Modernisation du SI de Gestion Clientèle',
    description: 'L\'entreprise XYZ souhaite refondre son système d\'information client pour améliorer l\'expérience utilisateur et optimiser les processus métier.',
    businessDomain: 'Assurance',
    difficulty: 'Débutant',
    duration: '30-45 min',
    userRole: 'Assistant à Maîtrise d\'Ouvrage Junior',
    context: 'L\'entreprise XYZ, une compagnie d\'assurance de taille moyenne, utilise un système vieillissant pour la gestion de sa relation client. Face à l\'évolution des attentes des clients et à la concurrence accrue du secteur, la direction a décidé de lancer un projet de refonte complète de son SI client. Vous êtes responsable de l\'accompagnement de ce projet en tant qu\'AMOA.',
    objectives: [
      {
        id: uuidv4(),
        description: 'Identifier les parties prenantes clés du projet',
        completed: false
      },
      {
        id: uuidv4(),
        description: 'Recueillir et formaliser les besoins métiers',
        completed: false
      },
      {
        id: uuidv4(),
        description: 'Définir les critères de qualité et de réussite du projet',
        completed: false
      },
      {
        id: uuidv4(),
        description: 'Établir une stratégie de tests efficace',
        completed: false
      },
      {
        id: uuidv4(),
        description: 'Proposer un plan de conduite du changement',
        completed: false
      }
    ],
    stakeholders: [
      {
        id: uuidv4(),
        name: 'Sophie Martin',
        role: 'Directrice des Systèmes d\'Information',
        department: 'DSI',
        personality: 'directif',
        priorities: ['Respect des délais', 'Maîtrise des coûts', 'Innovation technologique'],
        expertise: ['Architecture SI', 'Stratégie digitale'],
        availabilityLevel: 'moyenne'
      },
      {
        id: uuidv4(),
        name: 'Thomas Dupont',
        role: 'Responsable Service Client',
        department: 'Service Client',
        personality: 'expressif',
        priorities: ['Expérience utilisateur', 'Satisfaction client', 'Rapidité du service'],
        expertise: ['Gestion de la relation client', 'Processus de service'],
        availabilityLevel: 'haute'
      },
      {
        id: uuidv4(),
        name: 'Claire Leroy',
        role: 'Chef de Projet SI',
        department: 'DSI',
        personality: 'analytique',
        priorities: ['Qualité technique', 'Documentation', 'Évolutivité du système'],
        expertise: ['Méthodologie projet', 'Systèmes d\'information'],
        availabilityLevel: 'haute'
      },
      {
        id: uuidv4(),
        name: 'Marc Petit',
        role: 'Responsable Commercial',
        department: 'Ventes',
        personality: 'aimable',
        priorities: ['Outils de vente performants', 'Vision client à 360°', 'Intégration CRM'],
        expertise: ['Stratégie commerciale', 'Négociation'],
        availabilityLevel: 'basse'
      },
      {
        id: uuidv4(),
        name: 'Julie Moreau',
        role: 'Représentante des Utilisateurs',
        department: 'Service Client',
        personality: 'aimable',
        priorities: ['Utilisabilité', 'Formation', 'Support'],
        expertise: ['Utilisation quotidienne du SI actuel'],
        availabilityLevel: 'moyenne'
      }
    ],
    documents: [
      {
        id: uuidv4(),
        title: 'Note de cadrage initiale',
        content: `# Projet de Modernisation du SI Client
## Contexte
Le système d'information client actuel, datant de 2010, ne répond plus aux besoins modernes de l'entreprise et de ses clients.

## Objectifs principaux
- Améliorer l'expérience utilisateur des conseillers client
- Réduire le temps de traitement des demandes de 30%
- Intégrer les canaux digitaux (web, mobile, réseaux sociaux)
- Mettre en place une vision client à 360°

## Contraintes
- Budget maximal : 1,2M€
- Calendrier : Mise en production en 18 mois maximum
- Maintien de la continuité de service pendant la transition

## Risques identifiés
- Résistance au changement des utilisateurs
- Complexité de la migration des données
- Intégration avec les systèmes existants`,
        author: 'Direction Générale',
        version: '1.0',
        dateCreated: '2025-01-10',
        status: 'approved',
        comments: []
      },
      {
        id: uuidv4(),
        title: 'Diagnostic système actuel',
        content: `# État des lieux du SI Client actuel

## Points forts
- Stabilité globale du système
- Bonne connaissance de l'outil par les équipes
- Données historiques importantes et complètes

## Points faibles
- Interface utilisateur obsolète et peu intuitive
- Temps de réponse lents (15-20 secondes pour certaines requêtes)
- Maintenance coûteuse (450K€/an)
- Rapports et statistiques limités
- Absence d'API pour intégrations
- Système monolithique difficile à faire évoluer

## Impacts métier
- Temps de traitement des demandes client élevé (12min en moyenne)
- Formation des nouveaux collaborateurs longue et complexe
- Impossibilité d'implémenter de nouveaux parcours client
- Difficultés à extraire des données pour le marketing

## Conclusion
Le système actuel représente un frein à l'innovation et à la productivité. Sa modernisation est devenue critique pour maintenir la compétitivité de l'entreprise.`,
        author: 'Claire Leroy',
        version: '1.2',
        dateCreated: '2025-01-25',
        status: 'approved',
        comments: [
          {
            id: uuidv4(),
            author: 'Thomas Dupont',
            date: '2025-01-27',
            text: 'Le temps de traitement moyen est en réalité plus proche de 15min pour les dossiers complexes, ce qui amplifie encore le besoin de modernisation.'
          }
        ]
      },
      {
        id: uuidv4(),
        title: 'Expression de besoin - Service Client',
        content: `# Besoins fonctionnels du Service Client

## Besoins critiques
1. Vue unifiée du client avec historique complet
2. Interface utilisateur intuitive et responsive
3. Gestion intelligente des files d'attente des demandes
4. Modèles de réponses automatisés pour les demandes fréquentes
5. Tableaux de bord en temps réel des indicateurs de performance

## Besoins importants
1. Système de notification des actions à effectuer
2. Intégration avec les outils de communication (email, chat, téléphone)
3. Base de connaissances accessible pendant les interactions client
4. Personnalisation de l'interface par utilisateur
5. Accès mobile pour les conseillers en déplacement

## Besoins souhaitables
1. Suggestions d'actions basées sur l'IA
2. Prédiction des motifs de contact des clients
3. Analyse du sentiment client en temps réel
4. Reconnaissance vocale pour la prise de notes

## Contraintes spécifiques
- Temps de formation au nouvel outil : maximum 3 jours
- Disponibilité du système : 7j/7, 6h-22h
- Temps de réponse maximum : 3 secondes`,
        author: 'Thomas Dupont',
        version: '1.0',
        dateCreated: '2025-02-10',
        status: 'review',
        comments: [
          {
            id: uuidv4(),
            author: 'Sophie Martin',
            date: '2025-02-12',
            text: 'Les besoins IA semblent ambitieux par rapport au budget. Pouvons-nous les prioriser/phaser ?'
          },
          {
            id: uuidv4(),
            author: 'Julie Moreau',
            date: '2025-02-13',
            text: 'J\'ajouterais un besoin critique : la possibilité de travailler sur plusieurs dossiers clients en parallèle, ce qui est impossible actuellement.'
          }
        ]
      }
    ],
    requiredSkills: ['Analyse des besoins', 'Gestion des parties prenantes', 'Conduite du changement'],
    skillsProgress: [
      {
        id: uuidv4(),
        name: 'Analyse des besoins',
        description: 'Capacité à identifier, recueillir et formaliser les besoins métier',
        level: 20
      },
      {
        id: uuidv4(),
        name: 'Gestion des parties prenantes',
        description: 'Capacité à gérer les relations avec l\'ensemble des acteurs du projet',
        level: 15
      },
      {
        id: uuidv4(),
        name: 'Conduite du changement',
        description: 'Capacité à accompagner la transformation organisationnelle et technique',
        level: 10
      },
      {
        id: uuidv4(),
        name: 'Rédaction de spécifications',
        description: 'Capacité à formaliser les besoins en spécifications claires et précises',
        level: 5
      },
      {
        id: uuidv4(),
        name: 'Planification de projet',
        description: 'Capacité à établir et suivre un planning de projet réaliste',
        level: 8
      }
    ],
    learningEvents: [],
    decisions: [
      {
        id: uuidv4(),
        description: 'Quelle méthode de recueil des besoins privilégier pour ce projet ?',
        context: 'Vous devez organiser le recueil des besoins auprès des différentes parties prenantes. Plusieurs approches sont possibles, chacune avec ses avantages et inconvénients.',
        options: [
          {
            id: '1',
            text: 'Organiser des ateliers de groupe avec toutes les parties prenantes simultanément'
          },
          {
            id: '2',
            text: 'Conduire des entretiens individuels avec chaque partie prenante clé'
          },
          {
            id: '3',
            text: 'Distribuer des questionnaires détaillés à remplir par les différents services'
          },
          {
            id: '4',
            text: 'Mettre en place une approche mixte : entretiens individuels avec les décideurs puis ateliers par service'
          }
        ]
      },
      {
        id: uuidv4(),
        description: 'Comment gérer la résistance au changement exprimée par certains utilisateurs ?',
        context: 'Lors des premières réunions, vous avez identifié une forte résistance au changement de la part de certains utilisateurs expérimentés qui maîtrisent parfaitement le système actuel et craignent de perdre en efficacité.',
        options: [
          {
            id: '1',
            text: 'Imposer le changement en insistant sur la décision de la direction et l\'obsolescence du système actuel'
          },
          {
            id: '2',
            text: 'Impliquer ces utilisateurs résistants comme ambassadeurs du projet en leur donnant un rôle actif'
          },
          {
            id: '3',
            text: 'Concevoir un plan de formation approfondi qui rassure sur la maîtrise du futur outil'
          },
          {
            id: '4',
            text: 'Proposer une période de transition où les deux systèmes fonctionneront en parallèle'
          }
        ]
      }
    ],
    currentPhase: 'initialisation',
    progress: 0
  },
  {
    id: '2',
    title: 'Implémentation d\'une Solution ERP',
    description: 'Une entreprise industrielle souhaite remplacer ses multiples systèmes d\'information par une solution ERP intégrée pour améliorer sa performance globale.',
    businessDomain: 'Industrie',
    difficulty: 'Intermédiaire',
    duration: '45-60 min',
    userRole: 'AMOA Confirmé',
    context: 'METALIS, une entreprise industrielle spécialisée dans la fabrication de composants métalliques pour l\'industrie automobile, utilise actuellement une dizaine d\'applications différentes pour gérer ses opérations. Cette fragmentation des systèmes entraîne des problèmes de cohérence des données, des processus inefficaces et des difficultés de reporting. La direction a décidé d\'implémenter une solution ERP complète pour unifier les processus et la gestion des données.',
    objectives: [
      {
        id: uuidv4(),
        description: 'Définir la stratégie d\'intégration des systèmes existants',
        completed: false
      },
      {
        id: uuidv4(),
        description: 'Établir une matrice des exigences fonctionnelles prioritaires',
        completed: false
      },
      {
        id: uuidv4(),
        description: 'Élaborer un plan de gestion de la qualité',
        completed: false
      },
      {
        id: uuidv4(),
        description: 'Concevoir une stratégie de migration des données',
        completed: false
      },
      {
        id: uuidv4(),
        description: 'Mettre en place une gouvernance projet efficace',
        completed: false
      },
      {
        id: uuidv4(),
        description: 'Établir un programme de conduite du changement',
        completed: false
      }
    ],
    stakeholders: [
      {
        id: uuidv4(),
        name: 'Jean-Philippe Mercier',
        role: 'Directeur Général',
        department: 'Direction',
        personality: 'directif',
        priorities: ['ROI rapide', 'Continuité des opérations', 'Avantage concurrentiel'],
        expertise: ['Stratégie d\'entreprise', 'Finance'],
        availabilityLevel: 'basse'
      },
      {
        id: uuidv4(),
        name: 'Hélène Dubois',
        role: 'Directrice des Opérations',
        department: 'Production',
        personality: 'analytique',
        priorities: ['Optimisation des processus', 'Traçabilité', 'Planification'],
        expertise: ['Lean manufacturing', 'Gestion de production'],
        availabilityLevel: 'moyenne'
      },
      {
        id: uuidv4(),
        name: 'Richard Lemaire',
        role: 'DSI',
        department: 'Informatique',
        personality: 'analytique',
        priorities: ['Architecture technique', 'Sécurité', 'Scalabilité'],
        expertise: ['Architecture SI', 'Intégration de systèmes'],
        availabilityLevel: 'haute'
      },
      {
        id: uuidv4(),
        name: 'Carole Blanc',
        role: 'Responsable Financier',
        department: 'Finance',
        personality: 'directif',
        priorities: ['Comptabilité analytique', 'Reporting financier', 'Contrôle de gestion'],
        expertise: ['Comptabilité', 'ERP financiers'],
        availabilityLevel: 'moyenne'
      },
      {
        id: uuidv4(),
        name: 'Antoine Garnier',
        role: 'Représentant des Utilisateurs',
        department: 'Divers services',
        personality: 'expressif',
        priorities: ['Utilisabilité', 'Accessibilité', 'Support utilisateur'],
        expertise: ['Expérience utilisateur', 'Formation'],
        availabilityLevel: 'haute'
      },
      {
        id: uuidv4(),
        name: 'Patricia Renaud',
        role: 'Responsable Qualité',
        department: 'Qualité',
        personality: 'aimable',
        priorities: ['Conformité réglementaire', 'Certifications', 'Amélioration continue'],
        expertise: ['Normes ISO', 'Audit qualité'],
        availabilityLevel: 'moyenne'
      }
    ],
    documents: [
      {
        id: uuidv4(),
        title: 'Business Case ERP',
        content: `# Business Case - Projet ERP METALIS

## Résumé exécutif
L'implantation d'une solution ERP intégrée permettra de remplacer les 12 applications actuelles par une plateforme unique, générant une économie annuelle estimée à 375K€ et un ROI de 22% sur 5 ans.

## Situation actuelle
- Multiples systèmes non intégrés : Production, Achats, Stocks, Finance, RH, CRM, etc.
- Temps important consacré à la réconciliation de données (environ 320 jours/homme/an)
- 15% d'erreurs dues à la ressaisie d'informations
- Coûts de maintenance élevés (850K€/an)
- Délai de reporting consolidé : 15 jours après fin de mois

## Bénéfices attendus
### Quantitatifs
- Réduction des coûts de maintenance informatique : -40% (340K€/an)
- Diminution des stocks : -15% (240K€)
- Amélioration de la productivité administrative : +20% (250K€/an)
- Accélération du time-to-market : -25% (estimation : 180K€/an)

### Qualitatifs
- Vision unifiée de l'entreprise
- Meilleure traçabilité et conformité réglementaire
- Prise de décision facilitée par des données fiables
- Évolutivité face à la croissance prévue

## Investissement
- Licences et infrastructure : 1,2M€
- Services de mise en œuvre : 1,4M€
- Formation et conduite du changement : 400K€
- Maintenance sur 5 ans : 850K€

## Analyse financière
- Investissement total : 3,85M€
- Économies cumulées sur 5 ans : 4,7M€
- Retour sur investissement : 22%
- Point mort : 3,2 ans

## Risques principaux
- Résistance au changement
- Complexité de migration des données
- Perturbation potentielle des opérations
- Dépassement budgétaire

## Conclusion
L'investissement dans une solution ERP représente un choix stratégique permettant non seulement d'optimiser les coûts opérationnels, mais également de préparer METALIS aux défis futurs de croissance et d'innovation.`,
        author: 'Direction Générale',
        version: '2.1',
        dateCreated: '2025-01-05',
        status: 'approved',
        comments: [
          {
            id: uuidv4(),
            author: 'Carole Blanc',
            date: '2025-01-08',
            text: 'Les économies sur les stocks me semblent optimistes. Nous devrions peut-être revoir ce chiffre à la baisse pour être plus conservateurs.'
          }
        ]
      },
      {
        id: uuidv4(),
        title: 'Cartographie des processus',
        content: `# Cartographie des processus METALIS

## Processus de gestion de la demande
1. Réception des demandes clients
2. Analyse de faisabilité
3. Chiffrage et devis
4. Validation client
5. Planification de production

## Processus d'approvisionnement
1. Identification des besoins matières
2. Sélection des fournisseurs
3. Émission des commandes
4. Réception et contrôle
5. Stockage des matières premières

## Processus de production
1. Planification de la production
2. Préparation des ordres de fabrication
3. Production
4. Contrôle qualité
5. Conditionnement

## Processus logistiques
1. Gestion des stocks produits finis
2. Préparation des expéditions
3. Transport
4. Suivi des livraisons
5. Gestion des retours

## Processus support
### Finance et comptabilité
1. Comptabilité fournisseurs
2. Comptabilité clients
3. Comptabilité générale
4. Reporting financier
5. Contrôle de gestion

### Ressources Humaines
1. Gestion administrative
2. Paie
3. Formation
4. Recrutement

### Qualité
1. Contrôle qualité
2. Gestion documentaire
3. Audits
4. Actions correctives

## Points de friction identifiés
- Transfert manuel des données entre production et logistique
- Double saisie entre commandes clients et production
- Réconciliation manuelle entre réceptions et comptabilité
- Absence de visibilité temps réel sur les stocks
- Reporting consolidé manuel et chronophage`,
        author: 'Équipe projet',
        version: '1.0',
        dateCreated: '2025-01-20',
        status: 'review',
        comments: [
          {
            id: uuidv4(),
            author: 'Hélène Dubois',
            date: '2025-01-23',
            text: 'Il manque le processus de maintenance préventive des équipements qui est critique pour notre continuité de production.'
          },
          {
            id: uuidv4(),
            author: 'Patricia Renaud',
            date: '2025-01-25',
            text: 'Le processus de gestion des non-conformités devrait être détaillé dans la partie Qualité, c\'est un élément central de notre certification ISO.'
          }
        ]
      },
      {
        id: uuidv4(),
        title: 'Cahier des charges ERP - v0.8',
        content: `# Cahier des charges - Projet ERP METALIS

## 1. Introduction
Ce document définit les exigences fonctionnelles et techniques pour la sélection et l'implémentation d'une solution ERP chez METALIS.

## 2. Périmètre fonctionnel
### Module Production
- Gestion des ordres de fabrication
- Planification de la production
- Suivi des ressources et capacités
- Maintenance des équipements
- Traçabilité de la production

### Module Achats
- Gestion des fournisseurs
- Demandes de prix
- Commandes d'achat
- Suivi des livraisons
- Évaluation des fournisseurs

### Module Stocks
- Gestion des références
- Inventaires
- Réservations
- Multi-emplacements
- Traçabilité des lots

### Module Ventes
- Gestion des clients
- Devis et commandes
- Facturation
- Suivi des livraisons
- Analyse des ventes

### Module Finance
- Comptabilité générale
- Comptabilité analytique
- Immobilisations
- Trésorerie
- Reporting financier

### Module RH
- Gestion du personnel
- Paie
- Compétences et formations
- Temps et activités

### Module Qualité
- Suivi des non-conformités
- Actions correctives/préventives
- Gestion documentaire
- Audits et inspections

## 3. Exigences techniques
- Architecture web responsive
- Disponibilité 24/7 (99,9%)
- Temps de réponse < 2 secondes
- Capacité : 150 utilisateurs simultanés
- Intégration API avec systèmes tiers
- Sauvegardes automatisées
- Traçabilité complète des actions

## 4. Exigences de sécurité
- Authentification forte (SSO)
- Gestion fine des droits d'accès
- Chiffrement des données sensibles
- Journalisation des événements
- Conformité RGPD

## 5. Intégrations requises
- Machines de production (protocole OPC-UA)
- Outils de CAO (Solidworks)
- Scanners code-barres
- Solution e-commerce B2B
- EDI clients automobile

## 6. Contraintes de migration
- Reprise des données sur 3 ans
- Période de fonctionnement en parallèle
- Bascule progressive par module

## 7. Formation et support
- Formation administrateurs : 10 personnes
- Formation utilisateurs clés : 30 personnes
- Formation utilisateurs finaux : 150 personnes
- Support hotline 24h après mise en production

## 8. Livrables attendus
- Solution ERP configurée
- Documentation technique et utilisateur
- Manuels de procédures
- Environnements (dev, test, production)
- Support post-déploiement`,
        author: 'Richard Lemaire',
        version: '0.8',
        dateCreated: '2025-02-15',
        status: 'draft',
        comments: [
          {
            id: uuidv4(),
            author: 'Jean-Philippe Mercier',
            date: '2025-02-18',
            text: 'Ajouter une section sur les KPIs attendus et le tableau de bord de direction.'
          },
          {
            id: uuidv4(),
            author: 'Antoine Garnier',
            date: '2025-02-20',
            text: 'La partie formation me semble sous-dimensionnée compte tenu de la résistance au changement déjà identifiée dans certains services.'
          }
        ]
      }
    ],
    requiredSkills: ['Gestion de projet', 'Architecture SI', 'Optimisation des processus', 'Gestion des risques'],
    skillsProgress: [
      {
        id: uuidv4(),
        name: 'Gestion de projet',
        description: 'Capacité à piloter efficacement toutes les phases d\'un projet complexe',
        level: 30
      },
      {
        id: uuidv4(),
        name: 'Architecture SI',
        description: 'Capacité à comprendre et concevoir des architectures de systèmes d\'information',
        level: 25
      },
      {
        id: uuidv4(),
        name: 'Optimisation des processus',
        description: 'Capacité à analyser et améliorer les processus métier',
        level: 35
      },
      {
        id: uuidv4(),
        name: 'Gestion des risques',
        description: 'Capacité à identifier, évaluer et mitiger les risques projet',
        level: 20
      },
      {
        id: uuidv4(),
        name: 'Négociation',
        description: 'Capacité à négocier efficacement avec les parties prenantes et fournisseurs',
        level: 15
      }
    ],
    learningEvents: [],
    decisions: [
      {
        id: uuidv4(),
        description: 'Quelle stratégie de déploiement recommandez-vous pour l\'implémentation de l\'ERP ?',
        context: 'Vous devez proposer une stratégie de déploiement pour l\'ERP. Il existe plusieurs approches possibles, chacune présentant des avantages et des risques différents.',
        options: [
          {
            id: '1',
            text: 'Big bang - déploiement simultané de tous les modules sur l\'ensemble de l\'entreprise'
          },
          {
            id: '2',
            text: 'Approche progressive par module - déploiement séquentiel des différents modules'
          },
          {
            id: '3',
            text: 'Approche progressive par site - déploiement complet sur un site pilote puis extension'
          },
          {
            id: '4',
            text: 'Approche hybride - déploiement des modules critiques en big bang, puis les autres progressivement'
          }
        ]
      },
      {
        id: uuidv4(),
        description: 'Comment aborder la personnalisation de l\'ERP face aux demandes spécifiques des services ?',
        context: 'Plusieurs services demandent des personnalisations importantes de l\'ERP pour maintenir leurs processus actuels. L\'éditeur indique que certaines demandes nécessiteraient des développements spécifiques coûteux et potentiellement problématiques pour les futures mises à jour.',
        options: [
          {
            id: '1',
            text: 'Accepter toutes les demandes de personnalisation pour garantir l\'adhésion des utilisateurs'
          },
          {
            id: '2',
            text: 'Refuser toute personnalisation et imposer l\'adaptation aux processus standards de l\'ERP'
          },
          {
            id: '3',
            text: 'Établir un comité de gouvernance pour évaluer chaque demande selon des critères stricts (valeur business, coût, risques)'
          },
          {
            id: '4',
            text: 'Privilégier les personnalisations via la configuration standard, et n\'accepter les développements spécifiques qu\'en dernier recours'
          }
        ]
      }
    ],
    currentPhase: 'initialisation',
    progress: 0
  }
];