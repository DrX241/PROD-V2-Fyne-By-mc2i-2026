// Liste de 10 questions de test de réflexes AMOA distinctes
const testQuestions = [
  {
    id: "q1",
    text: "Lors d'une réunion de cadrage de projet, le client demande d'ajouter plusieurs fonctionnalités non prévues initialement. Quelle est la meilleure approche ?",
    options: [
      {
        id: "q1_a",
        text: "Accepter toutes les demandes pour satisfaire le client",
        isCorrect: false,
        explanation: "Accepter toutes les demandes sans analyse peut compromettre les délais, le budget et la qualité du projet."
      },
      {
        id: "q1_b",
        text: "Refuser catégoriquement car le périmètre est déjà défini",
        isCorrect: false,
        explanation: "Un refus catégorique peut nuire à la relation client et ignorer des opportunités d'amélioration du projet."
      },
      {
        id: "q1_c",
        text: "Noter les demandes et proposer une analyse d'impact sur les délais, coûts et ressources",
        isCorrect: true,
        explanation: "C'est l'approche la plus professionnelle : elle permet d'évaluer objectivement la faisabilité et l'impact des changements tout en maintenant une bonne relation client."
      },
      {
        id: "q1_d",
        text: "Suggérer de reporter ces fonctionnalités à une phase ultérieure sans analyse",
        isCorrect: false,
        explanation: "Reporter sans analyse peut être perçu comme un évitement et ne permet pas de prendre une décision éclairée."
      }
    ],
    timeLimit: 30,
    category: "Gestion de périmètre",
    difficulty: "facile"
  },
  {
    id: "q2",
    text: "Un développeur vous informe que la solution technique initialement prévue ne fonctionnera pas. Que faites-vous en priorité ?",
    options: [
      {
        id: "q2_a",
        text: "Immédiatement demander au développeur de trouver une solution alternative",
        isCorrect: false,
        explanation: "Cette approche ne prend pas en compte l'analyse des impacts et des alternatives de manière structurée."
      },
      {
        id: "q2_b",
        text: "Organiser une réunion d'urgence avec toute l'équipe projet",
        isCorrect: false,
        explanation: "Mobiliser toute l'équipe n'est pas nécessairement la première action à entreprendre et peut être une perte de temps."
      },
      {
        id: "q2_c",
        text: "Comprendre la nature exacte du problème et évaluer son impact sur le projet",
        isCorrect: true,
        explanation: "Avant toute décision, il est crucial de bien comprendre le problème et son impact pour pouvoir agir de manière appropriée."
      },
      {
        id: "q2_d",
        text: "Informer immédiatement le client que le projet va prendre du retard",
        isCorrect: false,
        explanation: "Alerter le client avant d'avoir analysé le problème et identifié des solutions peut créer un stress inutile."
      }
    ],
    timeLimit: 25,
    category: "Résolution de problèmes",
    difficulty: "moyen"
  },
  {
    id: "q3",
    text: "Lors du recueil des besoins, vous constatez des exigences contradictoires entre différentes parties prenantes. Comment gérez-vous cette situation ?",
    options: [
      {
        id: "q3_a",
        text: "Privilégier les exigences de la partie prenante ayant le statut hiérarchique le plus élevé",
        isCorrect: false,
        explanation: "Cette approche peut créer des tensions et ignorer des besoins légitimes d'autres parties prenantes importantes."
      },
      {
        id: "q3_b",
        text: "Organiser un atelier de conciliation pour trouver un consensus ou des compromis",
        isCorrect: true,
        explanation: "L'organisation d'un atelier permet de confronter les points de vue, d'expliquer les contradictions et de trouver collectivement une solution acceptable."
      },
      {
        id: "q3_c",
        text: "Inclure toutes les exigences dans le cahier des charges pour satisfaire tout le monde",
        isCorrect: false,
        explanation: "Intégrer des exigences contradictoires rend le cahier des charges incohérent et inexploitable."
      },
      {
        id: "q3_d",
        text: "Choisir arbitrairement les exigences qui vous semblent les plus pertinentes",
        isCorrect: false,
        explanation: "Un choix arbitraire risque d'être biaisé et ne tient pas compte des besoins réels de l'organisation."
      }
    ],
    timeLimit: 30,
    category: "Gestion des parties prenantes",
    difficulty: "difficile"
  },
  {
    id: "q4",
    text: "Un test utilisateur révèle des problèmes d'ergonomie majeurs à deux semaines de la livraison. Quelle est la meilleure réaction ?",
    options: [
      {
        id: "q4_a",
        text: "Ignorer ces retours car il est trop tard pour effectuer des modifications",
        isCorrect: false,
        explanation: "Ignorer des problèmes d'ergonomie majeurs peut compromettre l'adoption de la solution par les utilisateurs."
      },
      {
        id: "q4_b",
        text: "Prioriser les problèmes et corriger uniquement les plus critiques",
        isCorrect: true,
        explanation: "Cette approche permet de réduire les risques les plus importants tout en respectant au mieux les contraintes de délai."
      },
      {
        id: "q4_c",
        text: "Reporter la livraison pour corriger tous les problèmes identifiés",
        isCorrect: false,
        explanation: "Reporter la livraison pour tous les problèmes sans évaluation de criticité peut être disproportionné et créer d'autres difficultés."
      },
      {
        id: "q4_d",
        text: "Demander à l'équipe de développement de travailler jour et nuit pour tout corriger",
        isCorrect: false,
        explanation: "Cette solution n'est pas durable, risque de créer de nouveaux problèmes dus à la fatigue et dégrade les conditions de travail."
      }
    ],
    timeLimit: 25,
    category: "Gestion de la qualité",
    difficulty: "moyen"
  },
  {
    id: "q5",
    text: "Dans le cadre d'un projet agile, vous constatez que l'équipe n'atteint jamais les objectifs de sprint. Quelle action est la plus appropriée ?",
    options: [
      {
        id: "q5_a",
        text: "Augmenter la durée des sprints pour donner plus de temps à l'équipe",
        isCorrect: false,
        explanation: "Allonger les sprints ne résout pas le problème de fond et va à l'encontre des principes agiles de feedback rapide."
      },
      {
        id: "q5_b",
        text: "Analyser les métriques de vélocité et ajuster la planification des sprints en conséquence",
        isCorrect: true,
        explanation: "Cette approche permet d'adapter la charge de travail aux capacités réelles de l'équipe en se basant sur des données concrètes."
      },
      {
        id: "q5_c",
        text: "Exiger que l'équipe travaille plus intensément pour atteindre les objectifs",
        isCorrect: false,
        explanation: "Augmenter la pression ne résout pas les problèmes structurels et peut dégrader la qualité et la motivation."
      },
      {
        id: "q5_d",
        text: "Réduire le nombre de tests et de revues qualité pour gagner du temps",
        isCorrect: false,
        explanation: "Sacrifier la qualité pour la vitesse est une fausse économie qui générera des problèmes plus importants ultérieurement."
      }
    ],
    timeLimit: 30,
    category: "Méthodologie Agile",
    difficulty: "moyen"
  },
  {
    id: "q6",
    text: "Le client demande une modification majeure du périmètre à mi-parcours du projet. Quelle est la première étape à suivre ?",
    options: [
      {
        id: "q6_a",
        text: "Demander immédiatement une rallonge budgétaire",
        isCorrect: false,
        explanation: "Demander un budget supplémentaire avant d'analyser les impacts précis n'est pas une démarche professionnelle."
      },
      {
        id: "q6_b",
        text: "Refuser la demande en expliquant qu'elle ne respecte pas le contrat initial",
        isCorrect: false,
        explanation: "Un refus direct peut détériorer la relation client et ne permet pas d'explorer des solutions gagnant-gagnant."
      },
      {
        id: "q6_c",
        text: "Réaliser une analyse d'impact détaillée (délais, coûts, risques) avant toute décision",
        isCorrect: true,
        explanation: "Une analyse d'impact permet de prendre des décisions éclairées et de présenter des options au client avec leurs conséquences."
      },
      {
        id: "q6_d",
        text: "Accepter la modification pour satisfaire le client sans analyse préalable",
        isCorrect: false,
        explanation: "Accepter sans analyse préalable peut mettre en péril la réussite du projet et créer des attentes irréalistes."
      }
    ],
    timeLimit: 25,
    category: "Gestion de changement",
    difficulty: "difficile"
  },
  {
    id: "q7",
    text: "Votre équipe projet est confrontée à des tensions entre les développeurs et les testeurs. Comment intervenez-vous ?",
    options: [
      {
        id: "q7_a",
        text: "Laisser les deux équipes résoudre leurs différends sans intervenir",
        isCorrect: false,
        explanation: "Ne pas intervenir risque de laisser la situation se dégrader et impacter négativement le projet."
      },
      {
        id: "q7_b",
        text: "Organiser une session de médiation pour identifier les causes profondes et trouver des solutions communes",
        isCorrect: true,
        explanation: "La médiation permet d'adresser les véritables problèmes tout en préservant la cohésion d'équipe."
      },
      {
        id: "q7_c",
        text: "Imposer de nouvelles procédures strictes pour encadrer les interactions entre les équipes",
        isCorrect: false,
        explanation: "Imposer des procédures sans dialogue risque d'alourdir les processus sans résoudre les tensions sous-jacentes."
      },
      {
        id: "q7_d",
        text: "Réorganiser les équipes pour séparer complètement les développeurs et les testeurs",
        isCorrect: false,
        explanation: "Séparer les équipes peut réduire la collaboration et créer des silos, aggravant potentiellement les problèmes à long terme."
      }
    ],
    timeLimit: 30,
    category: "Management d'équipe",
    difficulty: "facile"
  },
  {
    id: "q8",
    text: "Vous découvrez que l'architecture technique choisie ne permettra pas de répondre aux exigences de performance du client. Que faites-vous ?",
    options: [
      {
        id: "q8_a",
        text: "Informer immédiatement le client que les objectifs de performance ne seront pas atteints",
        isCorrect: false,
        explanation: "Alerter le client sans avoir exploré des solutions alternatives est prématuré et peut nuire à la confiance."
      },
      {
        id: "q8_b",
        text: "Réduire discrètement les exigences de performance dans les spécifications",
        isCorrect: false,
        explanation: "Modifier les exigences sans concertation est contraire à l'éthique professionnelle et risque d'être découvert ultérieurement."
      },
      {
        id: "q8_c",
        text: "Consulter les experts techniques pour identifier des alternatives viables et leurs impacts",
        isCorrect: true,
        explanation: "Cette approche permet d'explorer des solutions techniques avant de communiquer avec le client, garantissant une discussion constructive."
      },
      {
        id: "q8_d",
        text: "Continuer avec l'architecture actuelle en espérant que les problèmes de performance n'apparaîtront pas",
        isCorrect: false,
        explanation: "Ignorer un problème identifié est risqué et peut conduire à des échecs majeurs plus tard dans le projet."
      }
    ],
    timeLimit: 30,
    category: "Architecture technique",
    difficulty: "difficile"
  },
  {
    id: "q9",
    text: "Lors d'une démo client, une fonctionnalité majeure ne fonctionne pas comme prévu. Comment réagissez-vous ?",
    options: [
      {
        id: "q9_a",
        text: "Tenter de dissimuler le problème et continuer la démonstration",
        isCorrect: false,
        explanation: "Dissimuler un problème nuit à la transparence et à la confiance, valeurs essentielles dans la relation client."
      },
      {
        id: "q9_b",
        text: "Reconnaître le problème, l'expliquer brièvement et indiquer le plan d'action pour le résoudre",
        isCorrect: true,
        explanation: "Cette approche démontre du professionnalisme, de la transparence et un focus sur la résolution de problème."
      },
      {
        id: "q9_c",
        text: "Annuler immédiatement la démo et la reporter à une date ultérieure",
        isCorrect: false,
        explanation: "Annuler une démo entière pour un problème sur une fonctionnalité est généralement disproportionné et peut frustrer le client."
      },
      {
        id: "q9_d",
        text: "Blâmer l'équipe technique pour le dysfonctionnement devant le client",
        isCorrect: false,
        explanation: "Rejeter la faute sur l'équipe est non professionnel, mine la cohésion d'équipe et ne résout pas le problème."
      }
    ],
    timeLimit: 20,
    category: "Communication client",
    difficulty: "facile"
  },
  {
    id: "q10",
    text: "Vous constatez que le projet n'utilise pas de gestion des risques formalisée. Quelle action est prioritaire ?",
    options: [
      {
        id: "q10_a",
        text: "Documenter les risques déjà rencontrés pour éviter qu'ils ne se reproduisent",
        isCorrect: false,
        explanation: "Se concentrer uniquement sur les risques passés ne permet pas d'anticiper de nouveaux risques potentiels."
      },
      {
        id: "q10_b",
        text: "Mettre en place un atelier d'identification et d'analyse des risques avec les parties prenantes clés",
        isCorrect: true,
        explanation: "Cette approche permet d'identifier proactivement les risques potentiels et d'établir une stratégie de gestion appropriée."
      },
      {
        id: "q10_c",
        text: "Ajouter une marge de sécurité importante aux délais et au budget sans analyse spécifique",
        isCorrect: false,
        explanation: "Ajouter des marges arbitraires sans analyse des risques spécifiques n'est pas une approche efficace de gestion de projet."
      },
      {
        id: "q10_d",
        text: "Continuer sans gestion des risques formalisée puisque le projet a fonctionné jusqu'à présent",
        isCorrect: false,
        explanation: "Ignorer la gestion des risques expose le projet à des problèmes potentiellement évitables qui pourraient avoir un impact majeur."
      }
    ],
    timeLimit: 25,
    category: "Gestion des risques",
    difficulty: "moyen"
  }
];

export default testQuestions;