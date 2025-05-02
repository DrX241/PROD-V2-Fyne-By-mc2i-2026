import { RoleTest } from '@shared/types/roles';

// Tests d'accès pour les différents rôles - exemples pour démonstration
export const roleTests: RoleTest[] = [
  {
    roleId: 'analyste_securite',
    title: 'Test d\'accès - Analyste de Sécurité',
    description: 'Démontrez vos connaissances en analyse de vulnérabilités et gestion des risques.',
    timeLimit: 15,
    passingScore: 70,
    questions: [
      {
        id: 'as_q1',
        question: 'Quelle approche est la plus efficace pour évaluer les vulnérabilités d\'un système d\'information ?',
        options: [
          'Faire un scan complet une fois par an',
          'Adopter une approche continue avec priorisation basée sur le risque',
          'Se concentrer uniquement sur les vulnérabilités critiques',
          'Attendre les rapports d\'incidents pour identifier les vulnérabilités'
        ],
        correctAnswer: 1,
        explanation: 'Une approche continue avec priorisation permet d\'identifier et corriger les vulnérabilités en fonction de leur risque réel pour l\'organisation, optimisant ainsi les ressources disponibles.'
      },
      {
        id: 'as_q2',
        question: 'Comment interprétez-vous un score CVSS de 7.8 ?',
        options: [
          'Vulnérabilité à faible risque',
          'Vulnérabilité à risque modéré',
          'Vulnérabilité à risque élevé',
          'Vulnérabilité à risque critique'
        ],
        correctAnswer: 2,
        explanation: 'Un score CVSS de 7.8 se situe dans la plage de 7.0 à 8.9, ce qui correspond à une vulnérabilité à risque élevé selon le standard CVSS v3.'
      },
      {
        id: 'as_q3',
        question: 'Quelle information n\'est PAS typiquement collectée lors d\'une analyse de vulnérabilités ?',
        options: [
          'Version des logiciels',
          'Correctifs appliqués',
          'Mots de passe en clair',
          'Services exposés'
        ],
        correctAnswer: 2,
        explanation: 'Les mots de passe en clair ne devraient jamais être collectés lors d\'une analyse de vulnérabilités standard. Cela constituerait une pratique contraire à l\'éthique et à la législation sur la protection des données.'
      }
    ]
  },
  
  {
    roleId: 'pentester',
    title: 'Test d\'accès - Pentester',
    description: 'Évaluez vos compétences en matière de tests d\'intrusion et exploitation de vulnérabilités.',
    timeLimit: 20,
    passingScore: 75,
    questions: [
      {
        id: 'pt_q1',
        question: 'Quelle est la première phase critique d\'un test d\'intrusion ?',
        options: [
          'Exploitation',
          'Reconnaissance',
          'Rapport final',
          'Élévation de privilèges'
        ],
        correctAnswer: 1,
        explanation: 'La reconnaissance est la première et souvent la plus longue phase d\'un test d\'intrusion. Elle consiste à collecter toutes les informations disponibles sur la cible avant de tenter une exploitation.'
      },
      {
        id: 'pt_q2',
        question: 'Lors d\'un test d\'intrusion sur une application web, vous découvrez un champ de recherche vulnérable à l\'injection SQL. Quelle approche est la plus professionnelle ?',
        options: [
          'Extraire immédiatement la base de données entière pour prouver l\'impact',
          'Effectuer une extraction limitée prouvant la vulnérabilité sans compromettre les données sensibles',
          'Exploiter la vulnérabilité pour installer une backdoor',
          'Modifier les données pour montrer l\'impact potentiel'
        ],
        correctAnswer: 1,
        explanation: 'L\'approche éthique consiste à démontrer la vulnérabilité avec une extraction minimale (preuve de concept), sans accéder inutilement à des données sensibles ou causer des dommages.'
      },
      {
        id: 'pt_q3',
        question: 'Après avoir obtenu un accès initial, quelle action n\'est généralement PAS pertinente lors d\'un test d\'intrusion ?',
        options: [
          'Maintien de l\'accès via une backdoor persistante sans accord explicite',
          'Élévation de privilèges',
          'Enumération du système',
          'Mouvement latéral dans le réseau'
        ],
        correctAnswer: 0,
        explanation: 'Installer une backdoor persistante sans accord explicite dépasse le cadre d\'un test d\'intrusion éthique et pourrait créer un risque de sécurité réel si elle n\'est pas correctement documentée et supprimée.'
      }
    ]
  },
  
  {
    roleId: 'responsable_securite',
    title: 'Test d\'accès - Responsable Sécurité',
    description: 'Démontrez votre capacité à gérer la stratégie globale de cybersécurité et les équipes de défense.',
    timeLimit: 15,
    passingScore: 70,
    questions: [
      {
        id: 'rs_q1',
        question: 'Quelle approche est la plus adaptée pour obtenir l\'adhésion de la direction aux investissements en cybersécurité ?',
        options: [
          'Utiliser un langage technique détaillé pour démontrer votre expertise',
          'Présenter des scénarios catastrophes pour créer un sentiment d\'urgence',
          'Aligner les investissements de sécurité avec les objectifs business et quantifier les risques',
          'Citer les obligations légales et réglementaires uniquement'
        ],
        correctAnswer: 2,
        explanation: 'Aligner la sécurité avec les objectifs business et quantifier les risques en termes financiers permet à la direction de comprendre la valeur des investissements en cybersécurité dans un contexte business.'
      },
      {
        id: 'rs_q2',
        question: 'Face à un incident majeur affectant les systèmes critiques, quelle devrait être votre première action en tant que responsable sécurité ?',
        options: [
          'Attribuer l\'attaque à un acteur malveillant spécifique',
          'Informer immédiatement tous les employés de la situation',
          'Activer le plan de réponse aux incidents et réunir l\'équipe de crise',
          'Restaurer les systèmes aussi vite que possible'
        ],
        correctAnswer: 2,
        explanation: 'La première action devrait être d\'activer formellement le plan de réponse aux incidents et de réunir l\'équipe de crise pour coordonner une réponse cohérente et structurée.'
      },
      {
        id: 'rs_q3',
        question: 'Dans le cadre d\'une transformation digitale, quel élément devrait être intégré le plus tôt possible dans les nouveaux projets ?',
        options: [
          'Des tests d\'intrusion complets',
          'La sécurité dès la conception (Security by Design)',
          'Des solutions de détection avancées',
          'Des politiques de sécurité strictes'
        ],
        correctAnswer: 1,
        explanation: 'Intégrer la sécurité dès la conception (Security by Design) dans les premiers stades du projet est plus efficace et moins coûteux que d\'ajouter des contrôles de sécurité après coup.'
      }
    ]
  },
  
  {
    roleId: 'expert_forensique',
    title: 'Test d\'accès - Expert Forensique',
    description: 'Évaluez vos connaissances en investigation numérique et analyse d\'incidents.',
    timeLimit: 20,
    passingScore: 75,
    questions: [
      {
        id: 'ef_q1',
        question: 'Quelle est la première priorité lors de la réponse à un incident impliquant un système potentiellement compromis ?',
        options: [
          'Éteindre immédiatement le système pour arrêter l\'attaque',
          'Faire une copie forensique de la mémoire volatile puis des supports de stockage',
          'Analyser les logs pour comprendre l\'origine de l\'attaque',
          'Restaurer le système depuis une sauvegarde propre'
        ],
        correctAnswer: 1,
        explanation: 'La collecte de la mémoire volatile est prioritaire car ces données seraient perdues en éteignant le système, suivie par l\'acquisition forensique des supports de stockage pour préserver les preuves.'
      },
      {
        id: 'ef_q2',
        question: 'Lors de l\'analyse d\'un malware, que permet l\'analyse dynamique par rapport à l\'analyse statique ?',
        options: [
          'Elle est plus rapide à mettre en œuvre',
          'Elle révèle le comportement réel du malware en exécution',
          'Elle est toujours plus précise que l\'analyse statique',
          'Elle nécessite moins de compétences techniques'
        ],
        correctAnswer: 1,
        explanation: 'L\'analyse dynamique permet d\'observer le comportement réel du malware pendant son exécution, révélant des fonctionnalités et communications qui pourraient rester cachées dans une analyse statique, particulièrement face à des techniques d\'obfuscation.'
      },
      {
        id: 'ef_q3',
        question: 'Dans le cadre d\'une investigation forensique formelle, pourquoi la chaîne de possession (chain of custody) est-elle cruciale ?',
        options: [
          'Pour réduire le temps d\'analyse',
          'Pour maintenir l\'intégrité et l\'admissibilité légale des preuves',
          'Pour faciliter le stockage des preuves',
          'Pour accélérer l\'identification des attaquants'
        ],
        correctAnswer: 1,
        explanation: 'La chaîne de possession documente chronologiquement qui a possédé, accédé ou manipulé les preuves, garantissant leur intégrité et leur admissibilité dans les procédures légales.'
      }
    ]
  },
  
  {
    roleId: 'ingenieur_reseau',
    title: 'Test d\'accès - Ingénieur Réseau Sécurité',
    description: 'Évaluez vos compétences en conception et sécurisation d\'infrastructures réseau.',
    timeLimit: 15,
    passingScore: 70,
    questions: [
      {
        id: 'ir_q1',
        question: 'Quelle approche de segmentation réseau offre la meilleure protection contre la propagation latérale des attaques ?',
        options: [
          'VLANs traditionnels basés sur des adresses MAC',
          'Segmentation par département ou fonction d\'entreprise',
          'Micro-segmentation basée sur l\'identité et le contexte',
          'Pare-feu périmétrique unique à haute performance'
        ],
        correctAnswer: 2,
        explanation: 'La micro-segmentation basée sur l\'identité et le contexte permet un contrôle granulaire des communications entre workloads spécifiques, limitant efficacement la capacité d\'un attaquant à se déplacer latéralement dans le réseau.'
      },
      {
        id: 'ir_q2',
        question: 'Lors de la détection d\'une attaque DDoS volumétrique contre votre infrastructure, quelle contre-mesure est généralement la plus efficace ?',
        options: [
          'Augmenter les capacités du pare-feu',
          'Utiliser un service de protection DDoS en amont capable d\'absorber le trafic',
          'Bloquer manuellement les adresses IP sources',
          'Redémarrer les équipements réseau'
        ],
        correctAnswer: 1,
        explanation: 'Les attaques DDoS volumétriques dépassent souvent les capacités des équipements sur site. Un service de protection DDoS en amont (cloud/scrubbing center) peut absorber et filtrer le trafic malveillant avant qu\'il n\'atteigne votre infrastructure.'
      },
      {
        id: 'ir_q3',
        question: 'Quelle technologie est essentielle pour sécuriser efficacement un environnement SD-WAN d\'entreprise ?',
        options: [
          'VPN IPsec pour tout le trafic',
          'Segmentation du trafic et chiffrement sélectif basé sur les politiques',
          'Centralisation de tout le trafic via un data center',
          'Utilisation exclusive de liens MPLS privés'
        ],
        correctAnswer: 1,
        explanation: 'La segmentation du trafic avec chiffrement sélectif basé sur des politiques permet de protéger les données sensibles tout en maintenant la flexibilité et la performance du SD-WAN, adaptant la sécurité selon la nature du trafic et sa criticité.'
      }
    ]
  },
  
  {
    roleId: 'analyste_soc',
    title: 'Test d\'accès - Analyste SOC',
    description: 'Évaluez vos compétences en détection et réponse aux incidents de sécurité.',
    timeLimit: 15,
    passingScore: 75,
    questions: [
      {
        id: 'soc_q1',
        question: 'Face à de multiples alertes simultanées, quel critère est le plus pertinent pour déterminer votre priorité d\'investigation ?',
        options: [
          'La source de l\'alerte (IDS, EDR, etc.)',
          'Le nombre d\'occurrences de l\'alerte',
          'La criticité de l\'actif concerné et la sévérité de la menace potentielle',
          'L\'heure à laquelle l\'alerte a été générée'
        ],
        correctAnswer: 2,
        explanation: 'La criticité de l\'actif impacté combinée à la sévérité de la menace permet d\'évaluer l\'impact business potentiel et donc de prioriser efficacement les alertes nécessitant une attention immédiate.'
      },
      {
        id: 'soc_q2',
        question: 'Vous observez un trafic HTTP inhabituel depuis un poste de travail vers un domaine récemment créé. Quelle action devriez-vous entreprendre en premier ?',
        options: [
          'Déconnecter immédiatement le poste du réseau',
          'Enrichir l\'alerte avec du contexte additionnel sur le domaine et l\'activité du poste',
          'Restaurer le poste depuis une sauvegarde',
          'Contacter directement l\'utilisateur du poste'
        ],
        correctAnswer: 1,
        explanation: 'Avant de prendre une action potentiellement perturbatrice, il est important d\'enrichir l\'alerte avec du contexte additionnel (réputation du domaine, autres indicateurs sur le poste, comportement normal de l\'utilisateur) pour déterminer s\'il s\'agit réellement d\'une menace.'
      },
      {
        id: 'soc_q3',
        question: 'Lors de l\'analyse d\'une alerte concernant un possible mouvement latéral, quel indicateur serait le plus pertinent ?',
        options: [
          'Utilisation inhabituelle d\'outils d\'administration sur un poste non administratif',
          'Trafic Internet important',
          'Téléchargement de fichiers depuis des services cloud légitimes',
          'Activation du partage d\'écran interne'
        ],
        correctAnswer: 0,
        explanation: 'L\'utilisation d\'outils d\'administration légitimes (comme PsExec, WMI, PowerShell) sur des postes non administratifs est un indicateur fort de mouvement latéral, correspondant à la technique "Living Off The Land" fréquemment utilisée par les attaquants.'
      }
    ]
  }
];