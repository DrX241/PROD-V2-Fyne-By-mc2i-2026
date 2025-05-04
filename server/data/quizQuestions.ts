import { QuizQuestion } from '../../shared/types/quiz';
import { v4 as uuidv4 } from 'uuid';

/**
 * Base de données de questions pour le quiz de cybersécurité
 */
export const quizQuestions: QuizQuestion[] = [
  // Questions faciles
  {
    id: uuidv4(),
    question: "Quelle pratique représente la méthode la plus efficace pour protéger vos comptes en ligne ?",
    options: [
      { id: "a", text: "Changer votre mot de passe une fois par an" },
      { id: "b", text: "Utiliser l'authentification à deux facteurs (2FA)" },
      { id: "c", text: "Utiliser le même mot de passe pour tous vos comptes" },
      { id: "d", text: "Partager votre mot de passe uniquement avec des amis proches" }
    ],
    category: "Sécurité des mots de passe",
    difficulty: "easy",
    correctOptionId: "b",
    explanation: "L'authentification à deux facteurs (2FA) ajoute une couche de sécurité supplémentaire en exigeant une deuxième forme de vérification au-delà du simple mot de passe. Même si votre mot de passe est compromis, un attaquant ne pourra pas accéder à votre compte sans avoir accès à votre deuxième facteur d'authentification (comme votre téléphone portable)."
  },
  {
    id: uuidv4(),
    question: "Qu'est-ce qu'une attaque de phishing ?",
    options: [
      { id: "a", text: "Une tentative de surcharger un serveur avec des requêtes" },
      { id: "b", text: "Un logiciel qui bloque l'accès à vos données jusqu'à paiement d'une rançon" },
      { id: "c", text: "Une tentative de tromper les utilisateurs pour qu'ils révèlent leurs informations personnelles" },
      { id: "d", text: "Un virus qui se propage via les réseaux Wi-Fi" }
    ],
    category: "Ingénierie sociale",
    difficulty: "easy",
    correctOptionId: "c",
    explanation: "Le phishing est une forme d'ingénierie sociale où les attaquants se font passer pour des entités légitimes (comme des banques, des réseaux sociaux, ou des collègues) pour inciter les utilisateurs à révéler des informations sensibles telles que leurs identifiants, mots de passe ou données bancaires."
  },
  {
    id: uuidv4(),
    question: "Quelle est la meilleure pratique à suivre lors de la réception d'un e-mail non sollicité contenant des pièces jointes ?",
    options: [
      { id: "a", text: "Ouvrir la pièce jointe pour vérifier son contenu" },
      { id: "b", text: "Transférer l'e-mail à vos collègues pour avoir leur avis" },
      { id: "c", text: "Cliquer sur les liens dans l'e-mail pour vérifier leur légitimité" },
      { id: "d", text: "Ne pas ouvrir les pièces jointes et supprimer l'e-mail si vous avez des doutes" }
    ],
    category: "Sécurité des e-mails",
    difficulty: "easy",
    correctOptionId: "d",
    explanation: "Les pièces jointes non sollicitées peuvent contenir des logiciels malveillants. Il est préférable de ne pas ouvrir ces pièces jointes et de supprimer les e-mails suspects. Si vous pensez que l'e-mail pourrait être légitime, contactez directement l'expéditeur par un autre moyen de communication pour vérifier avant d'ouvrir quoi que ce soit."
  },
  {
    id: uuidv4(),
    question: "Pourquoi est-il important de maintenir vos logiciels et systèmes d'exploitation à jour ?",
    options: [
      { id: "a", text: "Pour accéder aux nouvelles fonctionnalités uniquement" },
      { id: "b", text: "Pour corriger les failles de sécurité connues" },
      { id: "c", text: "Pour augmenter la vitesse de votre appareil" },
      { id: "d", text: "Pour réduire l'espace de stockage utilisé" }
    ],
    category: "Maintenance des systèmes",
    difficulty: "easy",
    correctOptionId: "b",
    explanation: "Les mises à jour de sécurité sont essentielles car elles corrigent les vulnérabilités découvertes qui pourraient être exploitées par des attaquants. Les cybercriminels ciblent souvent les systèmes non mis à jour en exploitant des failles connues pour lesquelles des correctifs existent déjà."
  },
  
  // Questions de difficulté moyenne
  {
    id: uuidv4(),
    question: "Qu'est-ce qu'une attaque par déni de service distribué (DDoS) ?",
    options: [
      { id: "a", text: "Une attaque où l'on divise les ressources d'un serveur entre plusieurs utilisateurs" },
      { id: "b", text: "Une technique pour distribuer des données à travers plusieurs serveurs" },
      { id: "c", text: "Une attaque qui inonde un système avec du trafic provenant de multiples sources" },
      { id: "d", text: "Un système qui distribue automatiquement les correctifs de sécurité" }
    ],
    category: "Sécurité réseau",
    difficulty: "medium",
    correctOptionId: "c",
    explanation: "Une attaque DDoS (Distributed Denial of Service) est une tentative malveillante de perturber le trafic normal d'un serveur, service ou réseau en le submergeant avec un flux massif de trafic internet provenant de multiples sources. Contrairement à une attaque DoS simple qui utilise une seule source, les attaques DDoS utilisent de nombreux appareils compromis (souvent des objets connectés), ce qui les rend plus difficiles à atténuer."
  },
  {
    id: uuidv4(),
    question: "Quelle méthode un attaquant pourrait-il utiliser pour contourner une authentification à deux facteurs basée sur SMS ?",
    options: [
      { id: "a", text: "Forcer la réinitialisation du mot de passe" },
      { id: "b", text: "Effectuer une attaque par dictionnaire" },
      { id: "c", text: "Réaliser une attaque SIM swapping" },
      { id: "d", text: "Installer un antivirus sur l'appareil cible" }
    ],
    category: "Authentification",
    difficulty: "medium",
    correctOptionId: "c",
    explanation: "Le SIM swapping (échange de carte SIM) est une technique où l'attaquant contacte l'opérateur téléphonique de la victime et, en utilisant des informations personnelles obtenues par ingénierie sociale ou vol de données, convainc l'opérateur de transférer le numéro de téléphone sur une nouvelle carte SIM. Une fois le numéro de téléphone sous contrôle, l'attaquant peut recevoir les codes d'authentification par SMS, contournant ainsi la protection 2FA."
  },
  {
    id: uuidv4(),
    question: "Qu'est-ce qu'une politique de gestion des accès basée sur le principe du moindre privilège ?",
    options: [
      { id: "a", text: "Donner à tous les utilisateurs les mêmes droits d'accès pour simplifier la gestion" },
      { id: "b", text: "Accorder uniquement les accès minimums nécessaires pour effectuer les tâches requises" },
      { id: "c", text: "Réserver les accès aux systèmes uniquement aux administrateurs" },
      { id: "d", text: "Changer les droits d'accès chaque semaine pour améliorer la sécurité" }
    ],
    category: "Contrôle d'accès",
    difficulty: "medium",
    correctOptionId: "b",
    explanation: "Le principe du moindre privilège est une stratégie de sécurité informatique fondamentale qui consiste à limiter les droits d'accès des utilisateurs au strict minimum requis pour accomplir leurs tâches. Cela réduit la surface d'attaque et limite les dommages potentiels en cas de compromission d'un compte. Par exemple, un employé du service comptabilité n'a pas besoin d'accéder aux données RH, et un développeur n'a pas nécessairement besoin d'accès à l'environnement de production."
  },
  {
    id: uuidv4(),
    question: "Quelle est la principale différence entre un pare-feu de nouvelle génération (NGFW) et un pare-feu traditionnel ?",
    options: [
      { id: "a", text: "Les NGFW sont physiques tandis que les pare-feu traditionnels sont virtuels" },
      { id: "b", text: "Les pare-feu traditionnels sont plus chers que les NGFW" },
      { id: "c", text: "Les NGFW intègrent des fonctionnalités avancées comme l'inspection approfondie des paquets et la prévention d'intrusion" },
      { id: "d", text: "Les pare-feu traditionnels sont plus récents que les NGFW" }
    ],
    category: "Protection du réseau",
    difficulty: "medium",
    correctOptionId: "c",
    explanation: "Les pare-feu de nouvelle génération (NGFW) vont au-delà des pare-feu traditionnels qui filtrent le trafic principalement sur la base des ports et des adresses IP. Les NGFW offrent des fonctionnalités avancées comme l'inspection approfondie des paquets, la prévention d'intrusion intégrée, l'analyse des applications, et parfois des capacités de protection contre les logiciels malveillants. Ils peuvent prendre des décisions basées sur le comportement des applications plutôt que simplement sur les ports et protocoles."
  },
  
  // Questions difficiles
  {
    id: uuidv4(),
    question: "Dans le contexte d'une attaque d'injection SQL, que signifie le terme 'SQLi blind' ?",
    options: [
      { id: "a", text: "Une injection qui cible uniquement les bases de données invisibles" },
      { id: "b", text: "Une variante où l'attaquant ne peut pas voir directement les résultats de l'injection" },
      { id: "c", text: "Une attaque qui désactive temporairement l'interface utilisateur de la base de données" },
      { id: "d", text: "Une injection qui fonctionne seulement quand l'administrateur n'est pas connecté" }
    ],
    category: "Sécurité des applications",
    difficulty: "hard",
    correctOptionId: "b",
    explanation: "Dans une injection SQL aveugle (Blind SQLi), l'attaquant ne peut pas voir directement les résultats de son injection dans la réponse du serveur. Au lieu de cela, il doit inférer les résultats en observant le comportement de l'application (par exemple, si une condition est vraie ou fausse) ou le temps de réponse (attaques temporelles). Cela rend l'attaque plus difficile mais pas impossible, ce qui souligne l'importance de la validation des entrées et de l'utilisation de requêtes paramétrées."
  },
  {
    id: uuidv4(),
    question: "Quelle est la méthode la plus efficace pour se protéger contre les attaques de canal latéral visant les implémentations cryptographiques ?",
    options: [
      { id: "a", text: "Augmenter la taille des clés de chiffrement" },
      { id: "b", text: "Utiliser exclusivement des algorithmes de chiffrement symétriques" },
      { id: "c", text: "Implémenter des contre-mesures comme le masquage et la randomisation du timing" },
      { id: "d", text: "Désactiver l'hyperthreading sur les serveurs" }
    ],
    category: "Cryptographie",
    difficulty: "hard",
    correctOptionId: "c",
    explanation: "Les attaques de canal latéral exploitent les informations obtenues de l'implémentation physique d'un système cryptographique (comme le temps d'exécution, la consommation d'énergie, ou les émissions électromagnétiques) plutôt que les faiblesses de l'algorithme lui-même. Les contre-mesures efficaces incluent le masquage (qui dissocie les données traitées des données réelles), la randomisation du timing (pour éviter les fuites temporelles), et d'autres techniques visant à éliminer les corrélations entre les données sensibles et les caractéristiques observables du système."
  },
  {
    id: uuidv4(),
    question: "Dans un contexte Zero Trust, quelle affirmation est correcte ?",
    options: [
      { id: "a", text: "Une fois qu'un utilisateur est authentifié, il peut accéder à l'ensemble du réseau" },
      { id: "b", text: "Les appareils internes au réseau sont automatiquement considérés comme fiables" },
      { id: "c", text: "La confiance n'est jamais présumée et doit être continuellement vérifiée" },
      { id: "d", text: "L'utilisation d'un VPN garantit la conformité avec le modèle Zero Trust" }
    ],
    category: "Architectures de sécurité",
    difficulty: "hard",
    correctOptionId: "c",
    explanation: "L'approche Zero Trust est basée sur le principe 'ne jamais faire confiance, toujours vérifier'. Contrairement aux modèles de sécurité traditionnels qui considèrent comme fiable tout ce qui se trouve à l'intérieur du périmètre réseau, Zero Trust n'accorde de confiance à aucun utilisateur ou appareil par défaut, qu'il soit à l'intérieur ou à l'extérieur du réseau. Chaque tentative d'accès est vérifiée, l'accès est limité au minimum nécessaire, et des contrôles continus sont effectués pour détecter et répondre aux anomalies."
  },
  {
    id: uuidv4(),
    question: "Quelle technique est la plus efficace pour se défendre contre les attaques de type 'heap spray' ?",
    options: [
      { id: "a", text: "Utilisation d'ASLR (Address Space Layout Randomization)" },
      { id: "b", text: "Implémentation de pare-feu applicatifs" },
      { id: "c", text: "Limitation de la taille des requêtes HTTP" },
      { id: "d", text: "Augmentation de la mémoire RAM disponible" }
    ],
    category: "Exploitation et défense",
    difficulty: "hard",
    correctOptionId: "a",
    explanation: "L'ASLR (Address Space Layout Randomization) est une technique de sécurité qui randomise les emplacements mémoire utilisés par les composants d'un programme, ce qui complique considérablement les attaques de type 'heap spray'. Ces attaques consistent à remplir de grandes portions de la mémoire heap avec du code malveillant et des instructions NOP pour augmenter les chances d'exécution. En randomisant les adresses mémoire à chaque exécution, l'ASLR rend beaucoup plus difficile pour l'attaquant de prédire où son code malveillant sera chargé."
  }
];

/**
 * Retourne un sous-ensemble équilibré de questions pour le quiz
 * @param count Nombre de questions à retourner
 * @param balanced Si vrai, retourne un mélange équilibré de questions par difficulté
 */
export function getQuizQuestions(count: number = 4, balanced: boolean = true): QuizQuestion[] {
  if (balanced) {
    // Diviser les questions par difficulté
    const easyQuestions = quizQuestions.filter(q => q.difficulty === 'easy');
    const mediumQuestions = quizQuestions.filter(q => q.difficulty === 'medium');
    const hardQuestions = quizQuestions.filter(q => q.difficulty === 'hard');
    
    // Répartir le nombre de questions par niveau (1-2-1 pour un quiz de 4 questions)
    const easyCount = Math.max(1, Math.floor(count * 0.25));
    const hardCount = Math.max(1, Math.floor(count * 0.25));
    const mediumCount = count - easyCount - hardCount;
    
    // Sélectionner aléatoirement des questions de chaque niveau
    const selectedEasy = getRandomItems(easyQuestions, easyCount);
    const selectedMedium = getRandomItems(mediumQuestions, mediumCount);
    const selectedHard = getRandomItems(hardQuestions, hardCount);
    
    // Combiner et mélanger les questions
    return shuffleArray([...selectedEasy, ...selectedMedium, ...selectedHard]);
  } else {
    // Retourner simplement un nombre aléatoire de questions
    return getRandomItems(quizQuestions, count);
  }
}

/**
 * Sélectionne aléatoirement des éléments d'un tableau
 */
function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = shuffleArray([...array]);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * Mélange un tableau avec l'algorithme Fisher-Yates
 */
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}