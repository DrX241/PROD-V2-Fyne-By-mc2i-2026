import { QuizQuestion } from '@shared/types/quiz';
import { v4 as uuidv4 } from "uuid";

// Base de données des questions du quiz
export const quizQuestions: QuizQuestion[] = [
  // Questions faciles
  {
    id: uuidv4(),
    question: "Qu'est-ce qu'un mot de passe fort ?",
    options: [
      { id: uuidv4(), text: "Un mot du dictionnaire", isCorrect: false },
      { id: uuidv4(), text: "Votre date de naissance", isCorrect: false },
      { id: uuidv4(), text: "Une combinaison de lettres, chiffres et caractères spéciaux d'au moins 12 caractères", isCorrect: true },
      { id: uuidv4(), text: "Le nom de votre animal de compagnie", isCorrect: false }
    ],
    explanation: "Un mot de passe fort doit être long (au moins 12 caractères), complexe (combinaison de majuscules, minuscules, chiffres et caractères spéciaux) et ne pas contenir d'informations personnelles faciles à deviner.",
    difficulty: "easy",
    category: "Fondamentaux"
  },
  {
    id: uuidv4(),
    question: "Qu'est-ce que le phishing ?",
    options: [
      { id: uuidv4(), text: "Une technique d'attaque où des e-mails frauduleux sont envoyés pour voler des informations", isCorrect: true },
      { id: uuidv4(), text: "Un logiciel qui protège contre les virus", isCorrect: false },
      { id: uuidv4(), text: "Une méthode pour sécuriser les réseaux Wi-Fi", isCorrect: false },
      { id: uuidv4(), text: "Un type de pare-feu", isCorrect: false }
    ],
    explanation: "Le phishing est une technique d'ingénierie sociale où des attaquants se font passer pour des entités de confiance afin de tromper les victimes pour qu'elles révèlent des informations sensibles comme des mots de passe ou des données bancaires.",
    difficulty: "easy",
    category: "Menaces"
  },
  {
    id: uuidv4(),
    question: "Pourquoi est-il important de mettre à jour régulièrement vos logiciels ?",
    options: [
      { id: uuidv4(), text: "Pour avoir les dernières fonctionnalités", isCorrect: false },
      { id: uuidv4(), text: "Pour corriger les failles de sécurité connues", isCorrect: true },
      { id: uuidv4(), text: "Pour économiser de l'espace de stockage", isCorrect: false },
      { id: uuidv4(), text: "Pour accélérer votre ordinateur", isCorrect: false }
    ],
    explanation: "Les mises à jour de logiciels contiennent souvent des correctifs de sécurité qui réparent des vulnérabilités connues. Sans ces mises à jour, votre système reste exposé à des attaques exploitant ces failles.",
    difficulty: "easy",
    category: "Bonnes pratiques"
  },
  
  // Questions de niveau intermédiaire
  {
    id: uuidv4(),
    question: "Qu'est-ce qu'une attaque par déni de service distribué (DDoS) ?",
    options: [
      { id: uuidv4(), text: "Un virus qui efface les données de l'utilisateur", isCorrect: false },
      { id: uuidv4(), text: "Une attaque où plusieurs systèmes compromis bombardent un système cible de trafic", isCorrect: true },
      { id: uuidv4(), text: "Une faille dans un système d'exploitation", isCorrect: false },
      { id: uuidv4(), text: "Un type de chiffrement faible", isCorrect: false }
    ],
    explanation: "Une attaque DDoS utilise de nombreux appareils infectés (un botnet) pour inonder un système cible de requêtes, épuisant ses ressources et le rendant inaccessible aux utilisateurs légitimes.",
    difficulty: "medium",
    category: "Menaces"
  },
  {
    id: uuidv4(),
    question: "Quelle est la différence entre l'authentification et l'autorisation ?",
    options: [
      { id: uuidv4(), text: "Ce sont deux termes désignant la même chose", isCorrect: false },
      { id: uuidv4(), text: "L'authentification vérifie l'identité, l'autorisation définit les droits d'accès", isCorrect: true },
      { id: uuidv4(), text: "L'authentification crée des comptes, l'autorisation les supprime", isCorrect: false },
      { id: uuidv4(), text: "L'authentification est pour les administrateurs, l'autorisation pour les utilisateurs", isCorrect: false }
    ],
    explanation: "L'authentification est le processus de vérification de l'identité d'un utilisateur (qui êtes-vous ?), tandis que l'autorisation détermine ce qu'un utilisateur authentifié est autorisé à faire (quels sont vos droits ?).",
    difficulty: "medium",
    category: "Identité"
  },
  {
    id: uuidv4(),
    question: "Qu'est-ce que le principe du moindre privilège ?",
    options: [
      { id: uuidv4(), text: "Donner à tous les utilisateurs les mêmes privilèges", isCorrect: false },
      { id: uuidv4(), text: "Donner à chaque utilisateur accès à toutes les ressources", isCorrect: false },
      { id: uuidv4(), text: "Accorder uniquement les privilèges minimaux nécessaires pour effectuer une tâche", isCorrect: true },
      { id: uuidv4(), text: "Restreindre l'accès à tous les utilisateurs", isCorrect: false }
    ],
    explanation: "Le principe du moindre privilège consiste à accorder aux utilisateurs uniquement les permissions minimales nécessaires pour accomplir leurs tâches, limitant ainsi les dommages potentiels en cas de compromission d'un compte.",
    difficulty: "medium",
    category: "Contrôle d'accès"
  },
  
  // Questions difficiles
  {
    id: uuidv4(),
    question: "Qu'est-ce qu'une attaque de type 'zero-day' ?",
    options: [
      { id: uuidv4(), text: "Une attaque exploitant une vulnérabilité inconnue du fabricant du logiciel", isCorrect: true },
      { id: uuidv4(), text: "Une attaque qui se produit le premier jour du mois", isCorrect: false },
      { id: uuidv4(), text: "Une attaque qui prend exactement zéro jour à exécuter", isCorrect: false },
      { id: uuidv4(), text: "Une attaque qui cible uniquement les nouveaux systèmes", isCorrect: false }
    ],
    explanation: "Une vulnérabilité 'zero-day' est une faille de sécurité inconnue du fabricant et pour laquelle aucun correctif n'est disponible. Les attaquants exploitant ces vulnérabilités ont donc un avantage significatif car les défenses traditionnelles sont inefficaces.",
    difficulty: "hard",
    category: "Vulnérabilités"
  },
  {
    id: uuidv4(),
    question: "Quelle est la différence entre le chiffrement symétrique et asymétrique ?",
    options: [
      { id: uuidv4(), text: "Le chiffrement symétrique utilise une seule clé, l'asymétrique utilise une paire de clés", isCorrect: true },
      { id: uuidv4(), text: "Le chiffrement symétrique est pour les fichiers, l'asymétrique pour les emails", isCorrect: false },
      { id: uuidv4(), text: "Le chiffrement symétrique est plus récent que l'asymétrique", isCorrect: false },
      { id: uuidv4(), text: "Le chiffrement symétrique est toujours plus sécurisé", isCorrect: false }
    ],
    explanation: "Le chiffrement symétrique utilise la même clé pour chiffrer et déchiffrer, ce qui est rapide mais pose des problèmes d'échange sécurisé de clés. Le chiffrement asymétrique utilise une paire de clés (publique/privée), résolvant le problème d'échange de clés mais étant plus lent.",
    difficulty: "hard",
    category: "Cryptographie"
  },
  {
    id: uuidv4(),
    question: "Qu'est-ce que l'OWASP Top 10 ?",
    options: [
      { id: uuidv4(), text: "Une liste des 10 meilleurs outils de piratage", isCorrect: false },
      { id: uuidv4(), text: "Une liste des 10 vulnérabilités web les plus critiques", isCorrect: true },
      { id: uuidv4(), text: "Les 10 entreprises les plus sécurisées", isCorrect: false },
      { id: uuidv4(), text: "Les 10 meilleurs antivirus", isCorrect: false }
    ],
    explanation: "L'OWASP Top 10 est un document de sensibilisation standard qui identifie les vulnérabilités de sécurité web les plus critiques. Il est régulièrement mis à jour et utilisé comme référence par les développeurs et les professionnels de la sécurité pour améliorer la sécurité des applications web.",
    difficulty: "hard",
    category: "Sécurité applicative"
  },
  
  // Questions supplémentaires par catégories
  {
    id: uuidv4(),
    question: "Qu'est-ce que le RGPD ?",
    options: [
      { id: uuidv4(), text: "Un logiciel antivirus européen", isCorrect: false },
      { id: uuidv4(), text: "Un règlement européen sur la protection des données personnelles", isCorrect: true },
      { id: uuidv4(), text: "Un protocole de sécurité réseau", isCorrect: false },
      { id: uuidv4(), text: "Un organisme de certification en cybersécurité", isCorrect: false }
    ],
    explanation: "Le Règlement Général sur la Protection des Données (RGPD) est une réglementation européenne entrée en vigueur en mai 2018 qui renforce la protection des données personnelles des individus et harmonise les lois sur la protection des données dans l'UE.",
    difficulty: "medium",
    category: "Réglementation"
  },
  {
    id: uuidv4(),
    question: "Qu'est-ce qu'un réseau privé virtuel (VPN) ?",
    options: [
      { id: uuidv4(), text: "Un réseau physique isolé d'internet", isCorrect: false },
      { id: uuidv4(), text: "Un logiciel qui détecte les virus", isCorrect: false },
      { id: uuidv4(), text: "Une technologie qui crée une connexion sécurisée et chiffrée sur un réseau moins sécurisé", isCorrect: true },
      { id: uuidv4(), text: "Un type de firewall avancé", isCorrect: false }
    ],
    explanation: "Un VPN crée un tunnel chiffré pour vos données à travers un réseau public (comme Internet), protégeant ainsi vos activités en ligne des regards indiscrets et permettant un accès sécurisé à des réseaux distants.",
    difficulty: "easy",
    category: "Réseaux"
  },
  {
    id: uuidv4(),
    question: "Qu'est-ce que le 'hachage' (hashing) en cryptographie ?",
    options: [
      { id: uuidv4(), text: "Une méthode pour compresser des fichiers", isCorrect: false },
      { id: uuidv4(), text: "Une fonction qui transforme des données en une empreinte de taille fixe", isCorrect: true },
      { id: uuidv4(), text: "Un algorithme pour chiffrer les mots de passe avec une clé", isCorrect: false },
      { id: uuidv4(), text: "Une technique pour cacher des informations dans des images", isCorrect: false }
    ],
    explanation: "Le hachage est un processus à sens unique qui convertit des données de taille variable en une chaîne de caractères de taille fixe. Contrairement au chiffrement, le hachage n'est pas réversible, ce qui le rend idéal pour stocker des mots de passe de manière sécurisée.",
    difficulty: "hard",
    category: "Cryptographie"
  },
  {
    id: uuidv4(),
    question: "Qu'est-ce que l'authentification multifacteur (MFA) ?",
    options: [
      { id: uuidv4(), text: "L'utilisation de plusieurs mots de passe pour un même compte", isCorrect: false },
      { id: uuidv4(), text: "Une méthode d'authentification exigeant au moins deux types de preuves d'identité", isCorrect: true },
      { id: uuidv4(), text: "Un système qui permet à plusieurs utilisateurs d'accéder au même compte", isCorrect: false },
      { id: uuidv4(), text: "Une technique pour gérer plusieurs comptes avec un seul identifiant", isCorrect: false }
    ],
    explanation: "L'authentification multifacteur exige que l'utilisateur fournisse au moins deux types de preuves d'identité différentes parmi : quelque chose qu'il sait (mot de passe), quelque chose qu'il possède (téléphone) et quelque chose qu'il est (biométrie), augmentant considérablement la sécurité.",
    difficulty: "easy",
    category: "Identité"
  }
];

// Fonction pour obtenir un ensemble de questions aléatoires
export function getRandomQuestions(count: number = 4): QuizQuestion[] {
  // Mélanger les questions avec l'algorithme de Fisher-Yates
  const shuffled = [...quizQuestions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  // Sélectionner un nombre spécifié de questions
  return shuffled.slice(0, count);
}

// Fonction pour obtenir un ensemble équilibré de questions par difficulté
export function getBalancedQuestions(count: number = 4): QuizQuestion[] {
  // Déterminer combien de questions de chaque niveau nous voulons
  const easyCount = Math.ceil(count * 0.25);  // 25% faciles
  const mediumCount = Math.ceil(count * 0.5); // 50% moyennes
  const hardCount = count - easyCount - mediumCount; // 25% difficiles
  
  // Filtrer et mélanger les questions par difficulté
  const easyQuestions = quizQuestions.filter(q => q.difficulty === "easy");
  const mediumQuestions = quizQuestions.filter(q => q.difficulty === "medium");
  const hardQuestions = quizQuestions.filter(q => q.difficulty === "hard");
  
  // Fonction pour mélanger un tableau
  const shuffle = (array: any[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };
  
  // Sélectionner le nombre requis de questions de chaque niveau
  const selectedEasy = shuffle(easyQuestions).slice(0, easyCount);
  const selectedMedium = shuffle(mediumQuestions).slice(0, mediumCount);
  const selectedHard = shuffle(hardQuestions).slice(0, hardCount);
  
  // Combiner et mélanger à nouveau pour un ordre aléatoire
  return shuffle([...selectedEasy, ...selectedMedium, ...selectedHard]);
}