import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { 
  ArrowLeft, 
  ChevronRight, 
  CheckCircle, 
  XCircle, 
  BrainCircuit, 
  Lightbulb,
  RefreshCw,
  Shield,
  AlertTriangle,
  Database,
  Lock,
  Clock,
  FileText,
  Activity,
  BarChart,
  Layers,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import PageTitle from '@/components/utils/PageTitle';

// Types
interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: 'débutant' | 'intermédiaire' | 'avancé';
  category: string;
  explanation: string;
  resources?: string[];
  aiHint?: string;
}

interface QuizCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

interface QuizResult {
  date: string;
  score: number;
  questionsAnswered: number;
  categoryScores: Record<string, { correct: number, total: number }>;
  level: 'débutant' | 'intermédiaire' | 'avancé';
}

export default function QuizAdaptatifIA() {
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [difficulty, setDifficulty] = useState<'débutant' | 'intermédiaire' | 'avancé'>('débutant');
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');
  const [activeTab, setActiveTab] = useState('quiz');
  const [quizHistory, setQuizHistory] = useState<QuizResult[]>([]);
  const [categoryScores, setCategoryScores] = useState<Record<string, { correct: number, total: number }>>({});
  const [isGeneratingHint, setIsGeneratingHint] = useState(false);
  const [aiHint, setAiHint] = useState<string | null>(null);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [isQuizActive, setIsQuizActive] = useState(false);
  
  // Catégories de quiz
  const quizCategories: QuizCategory[] = [
    {
      id: 'all',
      name: 'Toutes les catégories',
      description: 'Questions variées couvrant tous les domaines de la cybersécurité',
      icon: <Shield />,
      color: 'blue'
    },
    {
      id: 'threats',
      name: 'Menaces et attaques',
      description: 'Malwares, attaques réseau, ingénierie sociale, etc.',
      icon: <AlertTriangle />,
      color: 'red'
    },
    {
      id: 'defense',
      name: 'Défense et protection',
      description: 'Firewalls, IDS/IPS, antivirus, contrôles de sécurité, etc.',
      icon: <Shield />,
      color: 'green'
    },
    {
      id: 'data',
      name: 'Sécurité des données',
      description: 'Cryptographie, protection des données, classification, etc.',
      icon: <Database />,
      color: 'purple'
    },
    {
      id: 'identity',
      name: 'Identité et accès',
      description: 'Authentification, autorisation, IAM, etc.',
      icon: <User />,
      color: 'orange'
    },
    {
      id: 'governance',
      name: 'Gouvernance et conformité',
      description: 'Normes, réglementations, frameworks, etc.',
      icon: <FileText />,
      color: 'teal'
    }
  ];
  
  // Questions de démo pour le quiz
  const quizQuestions: QuizQuestion[] = [
    {
      id: 'q1',
      question: 'Quelle est la principale différence entre un virus et un ver informatique ?',
      options: [
        'Un virus nécessite une interaction humaine pour se propager, un ver se propage automatiquement',
        'Les virus ciblent uniquement les fichiers système, les vers ciblent les données utilisateur',
        'Les virus sont toujours malveillants, les vers peuvent être bénins',
        'Les virus sont écrits en C++, les vers en Python'
      ],
      correctAnswer: 0,
      difficulty: 'débutant',
      category: 'threats',
      explanation: 'Un virus informatique nécessite généralement une action humaine pour se propager (comme exécuter un programme infecté ou ouvrir une pièce jointe), tandis qu\'un ver se propage automatiquement en exploitant des vulnérabilités réseau, sans nécessiter d\'intervention humaine. Les deux types de malware peuvent être écrits dans différents langages de programmation et peuvent être malveillants.'
    },
    {
      id: 'q2',
      question: 'Qu\'est-ce que l\'authentification multifacteur (MFA) ?',
      options: [
        'Une forme d\'authentification qui alterne entre différentes méthodes chaque jour',
        'Une méthode qui utilise au moins deux catégories différentes de preuves d\'identité',
        'Un système qui répartit l\'authentification entre plusieurs serveurs',
        'Une technique permettant de s\'authentifier à plusieurs services avec un seul identifiant'
      ],
      correctAnswer: 1,
      difficulty: 'débutant',
      category: 'identity',
      explanation: 'L\'authentification multifacteur (MFA) est une méthode de sécurité qui exige que l\'utilisateur fournisse au moins deux types différents de preuves d\'identité pour vérifier son identité. Ces preuves peuvent appartenir à trois catégories : quelque chose que vous connaissez (mot de passe), quelque chose que vous possédez (téléphone, token), ou quelque chose que vous êtes (biométrie).'
    },
    {
      id: 'q3',
      question: 'Quelle technique d\'attaque implique de manipuler l\'utilisateur pour qu\'il effectue des actions sur un site web à son insu ?',
      options: [
        'Man-in-the-Middle (MitM)',
        'Cross-Site Scripting (XSS)',
        'Cross-Site Request Forgery (CSRF)',
        'SQL Injection'
      ],
      correctAnswer: 2,
      difficulty: 'intermédiaire',
      category: 'threats',
      explanation: 'Le Cross-Site Request Forgery (CSRF) est une attaque qui force un utilisateur authentifié à exécuter des actions non désirées sur une application web dans laquelle il est actuellement authentifié. L\'attaque fonctionne en incluant un lien ou un script dans une page que l\'utilisateur visite, qui envoie ensuite une requête au site vulnérable, exploitant la session active de l\'utilisateur.'
    },
    {
      id: 'q4',
      question: 'Quelle est la différence principale entre le chiffrement symétrique et asymétrique ?',
      options: [
        'Le chiffrement symétrique est toujours plus rapide que l\'asymétrique',
        'Le chiffrement asymétrique utilise la biométrie, le symétrique utilise des mots de passe',
        'Le chiffrement symétrique utilise la même clé pour chiffrer et déchiffrer, l\'asymétrique utilise des clés différentes',
        'Le chiffrement symétrique est utilisé pour les fichiers, l\'asymétrique pour les communications'
      ],
      correctAnswer: 2,
      difficulty: 'intermédiaire',
      category: 'data',
      explanation: 'La principale différence entre le chiffrement symétrique et asymétrique est que le chiffrement symétrique utilise la même clé pour chiffrer et déchiffrer les données, tandis que le chiffrement asymétrique utilise une paire de clés : une clé publique pour chiffrer et une clé privée pour déchiffrer. Le chiffrement symétrique est généralement plus rapide mais présente des défis pour l\'échange sécurisé de clés.'
    },
    {
      id: 'q5',
      question: 'Qu\'est-ce que la norme ISO/IEC 27001 ?',
      options: [
        'Un standard technique pour les algorithmes de chiffrement',
        'Une méthodologie de développement sécurisé',
        'Un standard international pour les systèmes de gestion de la sécurité de l\'information (SMSI)',
        'Un framework d\'architecture de sécurité réseau'
      ],
      correctAnswer: 2,
      difficulty: 'intermédiaire',
      category: 'governance',
      explanation: 'ISO/IEC 27001 est une norme internationale qui définit les exigences pour établir, mettre en œuvre, maintenir et améliorer continuellement un système de gestion de la sécurité de l\'information (SMSI). Elle fournit un cadre systématique pour gérer les risques liés à la sécurité de l\'information et protéger la confidentialité, l\'intégrité et la disponibilité des données.'
    },
    {
      id: 'q6',
      question: 'Quelle vulnérabilité permet à un attaquant d\'exécuter du code JavaScript malveillant dans le navigateur d\'un utilisateur ?',
      options: [
        'SQL Injection',
        'Cross-Site Scripting (XSS)',
        'Path Traversal',
        'XML External Entity (XXE)'
      ],
      correctAnswer: 1,
      difficulty: 'intermédiaire',
      category: 'threats',
      explanation: 'Le Cross-Site Scripting (XSS) est une vulnérabilité qui permet à un attaquant d\'injecter du code client (généralement JavaScript) qui s\'exécute dans le navigateur des utilisateurs. Cela peut permettre à l\'attaquant de voler des cookies de session, rediriger vers des sites malveillants, ou effectuer des actions sur le site au nom de l\'utilisateur.'
    },
    {
      id: 'q7',
      question: 'En quoi consiste l\'attaque "Pass-the-Hash" ?',
      options: [
        'Contourner la fonction de hachage d\'un algorithme de chiffrement',
        'Soumettre un nombre élevé de valeurs de hachage pour trouver une collision',
        'Réutiliser un hash de mot de passe capturé pour s\'authentifier sans connaître le mot de passe en clair',
        'Manipuler la table de hachage d\'une base de données pour obtenir des accès non autorisés'
      ],
      correctAnswer: 2,
      difficulty: 'avancé',
      category: 'threats',
      explanation: 'Pass-the-Hash (PtH) est une technique d\'attaque où un attaquant capture un hash de mot de passe (par exemple, un hash NTLM dans un environnement Windows) et le réutilise pour s\'authentifier sur un service ou un système sans avoir besoin de connaître ou de déchiffrer le mot de passe en texte clair. Cette attaque exploite le fait que certains protocoles d\'authentification vérifient seulement le hash du mot de passe et non le mot de passe lui-même.'
    },
    {
      id: 'q8',
      question: 'Qu\'est-ce que le "Zero Trust" en cybersécurité ?',
      options: [
        'Un modèle où aucun logiciel tiers n\'est utilisé dans l\'infrastructure',
        'Un principe qui suppose qu\'aucune entité, interne ou externe, ne doit être automatiquement considérée comme fiable',
        'Une architecture réseau sans points de défaillance unique',
        'Une approche où toutes les communications sont chiffrées de bout en bout'
      ],
      correctAnswer: 1,
      difficulty: 'avancé',
      category: 'defense',
      explanation: 'Zero Trust est un modèle de sécurité qui part du principe qu\'aucune entité (utilisateur, appareil, application) ne doit être automatiquement considérée comme fiable, qu\'elle soit à l\'intérieur ou à l\'extérieur du réseau de l\'organisation. Ce modèle exige une vérification, une autorisation et une authentification continues pour tous les accès aux ressources, en suivant le principe "ne jamais faire confiance, toujours vérifier".'
    },
    {
      id: 'q9',
      question: 'Qu\'est-ce qu\'un "Security Information and Event Management" (SIEM) ?',
      options: [
        'Un framework de gestion des risques pour la conformité réglementaire',
        'Un système qui combine la collecte, l\'analyse et la corrélation des événements de sécurité',
        'Une méthodologie pour l\'évaluation de la sécurité des applications',
        'Un protocole pour l\'échange sécurisé d\'informations sur les menaces entre organisations'
      ],
      correctAnswer: 1,
      difficulty: 'avancé',
      category: 'defense',
      explanation: 'Un SIEM (Security Information and Event Management) est une solution qui combine la gestion des informations de sécurité (SIM) et la gestion des événements de sécurité (SEM). Ces systèmes collectent, agrègent et analysent les données de journaux provenant de diverses sources dans l\'infrastructure IT, puis les corrèlent pour identifier des modèles anormaux et des incidents de sécurité potentiels. Les SIEM fournissent des capacités de surveillance en temps réel, d\'alerte et de reporting.'
    },
    {
      id: 'q10',
      question: 'Quelle est la différence entre une attaque DoS et DDoS ?',
      options: [
        'DoS affecte uniquement les serveurs web, DDoS affecte tous les types de serveurs',
        'DoS exploite des vulnérabilités applicatives, DDoS exploite des vulnérabilités réseau',
        'DoS utilise un seul système pour attaquer, DDoS utilise plusieurs systèmes distribués',
        'DoS vise à voler des données, DDoS vise uniquement à interrompre le service'
      ],
      correctAnswer: 2,
      difficulty: 'débutant',
      category: 'threats',
      explanation: 'La principale différence entre une attaque par déni de service (DoS) et une attaque par déni de service distribué (DDoS) est que la DoS provient généralement d\'une seule source ou système, tandis que la DDoS utilise de multiples systèmes compromis (souvent un botnet) pour lancer l\'attaque. Les attaques DDoS sont généralement plus difficiles à atténuer en raison de leur nature distribuée et du volume de trafic qu\'elles peuvent générer.'
    },
    {
      id: 'q11',
      question: 'Quelle est la fonction principale d\'un IDS (Intrusion Detection System) ?',
      options: [
        'Empêcher toute tentative d\'intrusion en bloquant le trafic suspect',
        'Détecter et alerter sur les activités suspectes ou malveillantes',
        'Chiffrer le trafic réseau pour prévenir l\'espionnage',
        'Authentifier les utilisateurs avant l\'accès au réseau'
      ],
      correctAnswer: 1,
      difficulty: 'intermédiaire',
      category: 'defense',
      explanation: 'Un système de détection d\'intrusion (IDS) est conçu pour surveiller le trafic réseau ou les activités système afin de détecter et d\'alerter sur les tentatives d\'accès non autorisés, les attaques en cours ou les violations de politiques de sécurité. Contrairement à un système de prévention d\'intrusion (IPS), un IDS est principalement passif et ne bloque pas automatiquement le trafic, bien que certains produits combinent les fonctionnalités IDS et IPS.'
    },
    {
      id: 'q12',
      question: 'Qu\'est-ce qu\'une attaque de type "Side-Channel" ?',
      options: [
        'Une attaque utilisant des canaux de communication alternatifs pour contourner les pare-feu',
        'Une technique d\'exploitation qui cible les serveurs secondaires d\'une infrastructure',
        'Une méthode pour extraire des informations en observant les caractéristiques physiques d\'un système',
        'Un type d\'attaque manipulant les routes BGP pour détourner le trafic réseau'
      ],
      correctAnswer: 2,
      difficulty: 'avancé',
      category: 'threats',
      explanation: 'Les attaques par canal auxiliaire (Side-Channel) exploitent des informations obtenues à partir des caractéristiques physiques d\'un système, plutôt que des faiblesses dans l\'implémentation d\'un algorithme. Ces informations peuvent inclure la consommation d\'énergie, le timing d\'exécution, les émissions électromagnétiques, ou les sons produits par le système. Par exemple, en analysant précisément le temps nécessaire à certaines opérations cryptographiques, un attaquant peut potentiellement extraire des clés secrètes.'
    },
    {
      id: 'q13',
      question: 'Quel concept de sécurité établit qu\'un système doit rester sécurisé même si sa conception est connue des attaquants ?',
      options: [
        'Security by Design',
        'Defense in Depth',
        'Principe du moindre privilège',
        'Principe de Kerckhoffs'
      ],
      correctAnswer: 3,
      difficulty: 'avancé',
      category: 'defense',
      explanation: 'Le principe de Kerckhoffs, formulé par Auguste Kerckhoffs au 19e siècle, stipule qu\'un système cryptographique doit être sécurisé même si tout ce qui concerne le système, à l\'exception de la clé, est connu publiquement. Ce principe est souvent résumé par "la sécurité par l\'obscurité n\'est pas une sécurité". Dans la cybersécurité moderne, ce principe est étendu pour suggérer que les systèmes devraient rester sécurisés même si leur conception et implémentation sont connues des attaquants.'
    },
    {
      id: 'q14',
      question: 'Qu\'est-ce que le RGPD (Règlement Général sur la Protection des Données) ?',
      options: [
        'Un cadre technique pour la sécurisation des bases de données personnelles',
        'Une réglementation européenne sur la protection des données personnelles',
        'Un standard international de chiffrement pour les données sensibles',
        'Un protocole de gestion des incidents de violation de données'
      ],
      correctAnswer: 1,
      difficulty: 'débutant',
      category: 'governance',
      explanation: 'Le Règlement Général sur la Protection des Données (RGPD) est une réglementation de l\'Union européenne entrée en vigueur en mai 2018. Il définit les règles pour la collecte, le traitement et le stockage des données personnelles, et établit des droits pour les individus concernant leurs données. Le RGPD s\'applique aux organisations basées dans l\'UE ainsi qu\'à celles traitant les données des résidents de l\'UE, et impose des sanctions significatives en cas de non-conformité.'
    },
    {
      id: 'q15',
      question: 'Qu\'est-ce que le "Security by Design" ?',
      options: [
        'Une approche où la sécurité fait partie intégrante du processus de conception et de développement',
        'Un modèle de sécurité basé uniquement sur des solutions propriétaires',
        'Un standard esthétique pour l\'interface des outils de sécurité',
        'Une certification délivrée aux produits ayant passé des tests de pénétration'
      ],
      correctAnswer: 0,
      difficulty: 'intermédiaire',
      category: 'defense',
      explanation: 'Security by Design est une approche de la cybersécurité qui intègre les considérations de sécurité dès les premières étapes de la conception et tout au long du cycle de développement d\'un système, plutôt que de les ajouter après coup. Cette méthodologie vise à identifier et atténuer les risques de sécurité potentiels avant qu\'ils ne deviennent des problèmes coûteux à résoudre. Elle comprend des pratiques comme la modélisation des menaces, les revues de code sécurisé et les tests de sécurité continus.'
    }
  ];
  
  // Fonction pour obtenir une question aléatoire
  const getRandomQuestion = () => {
    // Filtrer les questions par catégorie et difficulté
    const filteredQuestions = quizQuestions.filter(q => 
      (selectedCategory === 'all' || q.category === selectedCategory) &&
      q.difficulty === difficulty
    );
    
    if (filteredQuestions.length === 0) {
      toast({
        title: "Aucune question disponible",
        description: "Aucune question ne correspond aux critères sélectionnés. Essayez de changer de catégorie ou de niveau.",
        variant: "destructive"
      });
      return null;
    }
    
    // Sélectionner une question aléatoire
    const randomIndex = Math.floor(Math.random() * filteredQuestions.length);
    return filteredQuestions[randomIndex];
  };
  
  // Charger une nouvelle question
  const loadNextQuestion = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    setShowExplanation(false);
    setAiHint(null);
    
    const nextQuestion = getRandomQuestion();
    setCurrentQuestion(nextQuestion);
  };
  
  // Initialisation du quiz
  useEffect(() => {
    // Charger l'historique du quiz depuis le localStorage
    const storedHistory = localStorage.getItem('quizHistory');
    if (storedHistory) {
      setQuizHistory(JSON.parse(storedHistory));
    }
    
    // Charger les scores par catégorie depuis le localStorage
    const storedCategoryScores = localStorage.getItem('quizCategoryScores');
    if (storedCategoryScores) {
      setCategoryScores(JSON.parse(storedCategoryScores));
    }
  }, []);
  
  // Démarrer ou redémarrer le quiz
  const startQuiz = () => {
    setScore(0);
    setQuestionsAnswered(0);
    setIsQuizActive(true);
    loadNextQuestion();
  };
  
  // Vérifier la réponse
  const checkAnswer = () => {
    if (selectedOption === null) return;
    
    const isCorrectAnswer = selectedOption === currentQuestion?.correctAnswer;
    setIsAnswered(true);
    setIsCorrect(isCorrectAnswer);
    
    if (isCorrectAnswer) {
      setScore(score + 1);
      toast({
        title: "Bonne réponse !",
        variant: "default",
      });
    } else {
      toast({
        title: "Réponse incorrecte",
        description: "N'hésitez pas à consulter l'explication",
        variant: "destructive",
      });
    }
    
    // Mettre à jour les statistiques
    setQuestionsAnswered(questionsAnswered + 1);
    
    // Mettre à jour les scores par catégorie
    if (currentQuestion) {
      const category = currentQuestion.category;
      const updatedCategoryScores = { ...categoryScores };
      
      if (!updatedCategoryScores[category]) {
        updatedCategoryScores[category] = { correct: 0, total: 0 };
      }
      
      updatedCategoryScores[category].total += 1;
      if (isCorrectAnswer) {
        updatedCategoryScores[category].correct += 1;
      }
      
      setCategoryScores(updatedCategoryScores);
      localStorage.setItem('quizCategoryScores', JSON.stringify(updatedCategoryScores));
    }
  };
  
  // Terminer le quiz
  const finishQuiz = () => {
    const currentDate = new Date().toISOString();
    const result: QuizResult = {
      date: currentDate,
      score,
      questionsAnswered,
      categoryScores,
      level: difficulty
    };
    
    // Ajouter le résultat à l'historique
    const updatedHistory = [result, ...quizHistory];
    setQuizHistory(updatedHistory);
    localStorage.setItem('quizHistory', JSON.stringify(updatedHistory));
    
    // Afficher les recommandations
    setShowRecommendations(true);
    setIsQuizActive(false);
    
    toast({
      title: "Quiz terminé !",
      description: `Votre score : ${score}/${questionsAnswered}`,
      variant: "default",
    });
  };
  
  // Générer un indice IA
  const generateAIHint = () => {
    if (!currentQuestion) return;
    
    setIsGeneratingHint(true);
    
    // Simuler une génération d'indice par IA
    setTimeout(() => {
      const hints = [
        "Pensez aux principes fondamentaux de la cybersécurité : confidentialité, intégrité et disponibilité.",
        "Cette question concerne une technique d'attaque courante. Réfléchissez au vecteur d'attaque principal.",
        "Pour cette question, pensez aux bonnes pratiques de protection des données sensibles.",
        "Cette question porte sur un concept architectural de sécurité. Considérez comment les différentes couches interagissent.",
        "Cette réponse fait référence à un standard ou une réglementation spécifique, pensez à son objectif principal."
      ];
      
      const randomHint = hints[Math.floor(Math.random() * hints.length)];
      setAiHint(`Indice IA : ${randomHint}`);
      setIsGeneratingHint(false);
    }, 1500);
  };
  
  // Calculer le niveau de compétence recommandé
  const getRecommendedLevel = () => {
    if (score / questionsAnswered >= 0.8) {
      return difficulty === 'débutant' ? 'intermédiaire' : 
             difficulty === 'intermédiaire' ? 'avancé' : 'avancé';
    } else if (score / questionsAnswered <= 0.4) {
      return difficulty === 'avancé' ? 'intermédiaire' : 
             difficulty === 'intermédiaire' ? 'débutant' : 'débutant';
    } else {
      return difficulty;
    }
  };
  
  // Calculer les catégories à améliorer
  const getCategoryToImprove = () => {
    let lowestScore = 1;
    let categoryToImprove = '';
    
    Object.entries(categoryScores).forEach(([category, scores]) => {
      if (scores.total > 0) {
        const ratio = scores.correct / scores.total;
        if (ratio < lowestScore) {
          lowestScore = ratio;
          categoryToImprove = category;
        }
      }
    });
    
    return categoryToImprove ? quizCategories.find(c => c.id === categoryToImprove)?.name || categoryToImprove : null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 to-slate-950 text-white pb-20">
      {/* En-tête */}
      <div className="p-6 container mx-auto">
        <div className="flex items-center mb-2">
          <Link href="/cyber/learning-center">
            <Button variant="ghost" className="text-white mr-4">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Retour
            </Button>
          </Link>
          <PageTitle title="CYBER ACADÉMIE" />
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <BrainCircuit className="mr-3 h-6 w-6 text-indigo-400" />
              Quiz adaptatif IA
            </h1>
            <p className="text-blue-200 mt-1">Évaluez vos connaissances avec un quiz personnalisé par l'IA</p>
          </div>
        </div>
        
        {/* Onglets */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-indigo-900/20 border border-indigo-800">
            <TabsTrigger value="quiz" className="data-[state=active]:bg-indigo-700">
              Quiz
            </TabsTrigger>
            <TabsTrigger value="stats" className="data-[state=active]:bg-indigo-700">
              Statistiques
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-indigo-700">
              Historique
            </TabsTrigger>
          </TabsList>
          
          {/* Onglet Quiz */}
          <TabsContent value="quiz" className="space-y-6">
            {!isQuizActive && !showRecommendations ? (
              <Card className="bg-indigo-900/20 border-indigo-800">
                <CardHeader>
                  <CardTitle>Paramètres du quiz</CardTitle>
                  <CardDescription className="text-indigo-200">
                    Personnalisez votre expérience d'apprentissage
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-3">Choisissez une catégorie</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {quizCategories.map((category) => (
                        <div
                          key={category.id}
                          className={`p-4 rounded-lg border cursor-pointer transition-all ${
                            selectedCategory === category.id 
                              ? `bg-${category.color}-900/30 border-${category.color}-700` 
                              : 'bg-slate-900/30 border-slate-800 hover:border-indigo-700'
                          }`}
                          onClick={() => setSelectedCategory(category.id)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-md bg-indigo-800/70">
                              {category.icon}
                            </div>
                            <div>
                              <h4 className="font-medium">{category.name}</h4>
                              <p className="text-xs text-indigo-200">{category.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-3">Niveau de difficulté</h3>
                    <div className="flex items-center gap-4">
                      <Button
                        variant={difficulty === 'débutant' ? 'default' : 'outline'}
                        className={difficulty === 'débutant' ? 'bg-green-700 hover:bg-green-800' : 'border-green-700 text-green-300'}
                        onClick={() => setDifficulty('débutant')}
                      >
                        Débutant
                      </Button>
                      <Button
                        variant={difficulty === 'intermédiaire' ? 'default' : 'outline'}
                        className={difficulty === 'intermédiaire' ? 'bg-blue-700 hover:bg-blue-800' : 'border-blue-700 text-blue-300'}
                        onClick={() => setDifficulty('intermédiaire')}
                      >
                        Intermédiaire
                      </Button>
                      <Button
                        variant={difficulty === 'avancé' ? 'default' : 'outline'}
                        className={difficulty === 'avancé' ? 'bg-purple-700 hover:bg-purple-800' : 'border-purple-700 text-purple-300'}
                        onClick={() => setDifficulty('avancé')}
                      >
                        Avancé
                      </Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button 
                    size="lg" 
                    className="bg-indigo-700 hover:bg-indigo-800"
                    onClick={startQuiz}
                  >
                    Commencer le quiz
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ) : showRecommendations ? (
              <Card className="bg-indigo-900/20 border-indigo-800">
                <CardHeader>
                  <CardTitle>Résultats et recommandations</CardTitle>
                  <CardDescription className="text-indigo-200">
                    Basé sur votre performance lors du quiz
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-indigo-950/50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold flex items-center">
                      <BarChart className="mr-2 h-5 w-5 text-indigo-400" />
                      Votre score
                    </h3>
                    <div className="flex items-center mt-2">
                      <div className="text-3xl font-bold">{score}/{questionsAnswered}</div>
                      <div className="ml-4 text-xl">
                        {Math.round((score / questionsAnswered) * 100)}%
                      </div>
                    </div>
                    <Progress 
                      value={(score / questionsAnswered) * 100} 
                      className="h-2 mt-2" 
                      indicatorClassName={`${
                        (score / questionsAnswered) >= 0.7 ? 'bg-green-600' : 
                        (score / questionsAnswered) >= 0.4 ? 'bg-amber-600' : 'bg-red-600'
                      }`}
                    />
                    
                    <div className="mt-4 text-sm">
                      {(score / questionsAnswered) >= 0.8 ? (
                        <Badge className="bg-green-700">Excellent</Badge>
                      ) : (score / questionsAnswered) >= 0.6 ? (
                        <Badge className="bg-blue-700">Bon</Badge>
                      ) : (score / questionsAnswered) >= 0.4 ? (
                        <Badge className="bg-amber-700">Moyen</Badge>
                      ) : (
                        <Badge className="bg-red-700">À améliorer</Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-blue-950/50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold flex items-center">
                      <BrainCircuit className="mr-2 h-5 w-5 text-blue-400" />
                      Recommandations IA
                    </h3>
                    
                    <div className="space-y-3 mt-3">
                      <div className="flex items-start gap-3">
                        <div className="p-1.5 bg-blue-800 rounded-full">
                          <Layers className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">Niveau recommandé</p>
                          <p className="text-sm text-blue-200">
                            {getRecommendedLevel() === 'débutant' ? 'Continuez avec le niveau débutant pour renforcer vos bases' : 
                             getRecommendedLevel() === 'intermédiaire' ? 'Passez au niveau intermédiaire pour approfondir vos connaissances' :
                             'Continuez avec le niveau avancé pour maîtriser des concepts complexes'}
                          </p>
                        </div>
                      </div>
                      
                      {getCategoryToImprove() && (
                        <div className="flex items-start gap-3">
                          <div className="p-1.5 bg-blue-800 rounded-full">
                            <Activity className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium">Domaine à améliorer</p>
                            <p className="text-sm text-blue-200">
                              Nous vous recommandons de vous concentrer sur la catégorie <strong>{getCategoryToImprove()}</strong>
                            </p>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-start gap-3">
                        <div className="p-1.5 bg-blue-800 rounded-full">
                          <Clock className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">Fréquence d'apprentissage</p>
                          <p className="text-sm text-blue-200">
                            Pour optimiser votre progression, pratiquez au moins 3 fois par semaine avec des sessions de 15-20 minutes
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowRecommendations(false);
                      setActiveTab('stats');
                    }}
                    className="border-indigo-600"
                  >
                    Voir mes statistiques
                  </Button>
                  <Button 
                    className="bg-indigo-700 hover:bg-indigo-800"
                    onClick={() => {
                      setShowRecommendations(false);
                      startQuiz();
                    }}
                  >
                    Nouveau quiz
                    <RefreshCw className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <Card className="bg-indigo-900/20 border-indigo-800">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Question {questionsAnswered + 1}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-indigo-700">
                        Score: {score}/{questionsAnswered}
                      </Badge>
                      <Badge variant="outline" className="border-indigo-600">
                        {difficulty}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {currentQuestion && (
                    <>
                      <div className="text-xl font-medium">{currentQuestion.question}</div>
                      
                      <RadioGroup 
                        value={selectedOption?.toString()} 
                        onValueChange={(value) => setSelectedOption(parseInt(value))}
                        className="space-y-3"
                        disabled={isAnswered}
                      >
                        {currentQuestion.options.map((option, index) => (
                          <div
                            key={index}
                            className={`flex items-center space-x-2 p-3 rounded-md border ${
                              isAnswered 
                                ? index === currentQuestion.correctAnswer
                                  ? 'bg-green-900/30 border-green-700'
                                  : index === selectedOption
                                    ? 'bg-red-900/30 border-red-700'
                                    : 'bg-slate-900/40 border-slate-800'
                                : 'border-indigo-800/50 hover:border-indigo-600 cursor-pointer'
                            }`}
                          >
                            <RadioGroupItem 
                              value={index.toString()} 
                              id={`option-${index}`}
                              className="border-indigo-600"
                            />
                            <Label 
                              htmlFor={`option-${index}`}
                              className={`flex-grow cursor-pointer ${
                                isAnswered && index === currentQuestion.correctAnswer
                                  ? 'text-green-200'
                                  : ''
                              }`}
                            >
                              {option}
                            </Label>
                            {isAnswered && index === currentQuestion.correctAnswer && (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            )}
                            {isAnswered && index === selectedOption && index !== currentQuestion.correctAnswer && (
                              <XCircle className="h-5 w-5 text-red-500" />
                            )}
                          </div>
                        ))}
                      </RadioGroup>
                      
                      {isAnswered && showExplanation && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="bg-blue-950/30 border border-blue-900 rounded-lg p-4 mt-4"
                        >
                          <h3 className="font-semibold text-blue-300 mb-2 flex items-center">
                            <Lightbulb className="mr-2 h-5 w-5" />
                            Explication
                          </h3>
                          <p className="text-blue-100">{currentQuestion.explanation}</p>
                        </motion.div>
                      )}
                      
                      {!isAnswered && (
                        <div className="flex justify-between">
                          <Button
                            variant="outline"
                            className="border-blue-600 text-blue-300"
                            onClick={generateAIHint}
                            disabled={isGeneratingHint || aiHint !== null}
                          >
                            {isGeneratingHint ? (
                              <>
                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                Génération...
                              </>
                            ) : aiHint ? (
                              <>
                                <BrainCircuit className="mr-2 h-4 w-4" />
                                Indice affiché
                              </>
                            ) : (
                              <>
                                <Lightbulb className="mr-2 h-4 w-4" />
                                Obtenir un indice IA
                              </>
                            )}
                          </Button>
                          <Button
                            className="bg-indigo-700 hover:bg-indigo-800"
                            onClick={checkAnswer}
                            disabled={selectedOption === null}
                          >
                            Vérifier
                          </Button>
                        </div>
                      )}
                      
                      {aiHint && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="bg-indigo-950/30 border border-indigo-900 rounded-lg p-4 mt-4"
                        >
                          <div className="flex items-center gap-2 text-indigo-300">
                            <BrainCircuit className="h-5 w-5" />
                            <span className="font-medium">Indice IA</span>
                          </div>
                          <p className="mt-2 text-indigo-100">{aiHint.replace("Indice IA : ", "")}</p>
                        </motion.div>
                      )}
                    </>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  {isAnswered ? (
                    <div className="flex gap-3 w-full">
                      <Button
                        variant="outline"
                        className="border-blue-600 text-blue-300"
                        onClick={() => setShowExplanation(!showExplanation)}
                      >
                        {showExplanation ? 'Masquer l\'explication' : 'Voir l\'explication'}
                      </Button>
                      <div className="flex-grow"></div>
                      <Button 
                        className="bg-indigo-700 hover:bg-indigo-800"
                        onClick={() => {
                          if (questionsAnswered >= 10) {
                            finishQuiz();
                          } else {
                            loadNextQuestion();
                          }
                        }}
                      >
                        {questionsAnswered >= 10 ? 'Terminer le quiz' : 'Question suivante'}
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="w-full text-center text-sm text-indigo-300">
                      Sélectionnez une réponse et cliquez sur "Vérifier"
                    </div>
                  )}
                </CardFooter>
              </Card>
            )}
          </TabsContent>
          
          {/* Onglet Statistiques */}
          <TabsContent value="stats" className="space-y-6">
            <Card className="bg-indigo-900/20 border-indigo-800">
              <CardHeader>
                <CardTitle>Vos statistiques</CardTitle>
                <CardDescription className="text-indigo-200">
                  Suivez votre progression et identifiez vos points forts et axes d'amélioration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-indigo-950/50 rounded-lg p-4">
                    <h3 className="text-sm text-indigo-300 uppercase font-medium">Quiz complétés</h3>
                    <div className="text-3xl font-bold mt-2">{quizHistory.length}</div>
                  </div>
                  
                  <div className="bg-indigo-950/50 rounded-lg p-4">
                    <h3 className="text-sm text-indigo-300 uppercase font-medium">Score moyen</h3>
                    <div className="text-3xl font-bold mt-2">
                      {quizHistory.length > 0 
                        ? Math.round(quizHistory.reduce((sum, result) => 
                            sum + (result.score / result.questionsAnswered) * 100, 0
                          ) / quizHistory.length)
                        : 0}%
                    </div>
                  </div>
                  
                  <div className="bg-indigo-950/50 rounded-lg p-4">
                    <h3 className="text-sm text-indigo-300 uppercase font-medium">Questions répondues</h3>
                    <div className="text-3xl font-bold mt-2">
                      {quizHistory.reduce((sum, result) => sum + result.questionsAnswered, 0)}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-3">Performance par catégorie</h3>
                  <div className="space-y-3">
                    {Object.entries(categoryScores).map(([categoryId, scores]) => {
                      const category = quizCategories.find(c => c.id === categoryId);
                      if (!category || scores.total === 0) return null;
                      
                      const percentage = Math.round((scores.correct / scores.total) * 100);
                      
                      return (
                        <div key={categoryId} className="bg-slate-900/30 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 bg-indigo-800 rounded-md">
                                {category.icon}
                              </div>
                              <span>{category.name}</span>
                            </div>
                            <div className="text-sm">
                              <span className={percentage >= 70 ? 'text-green-400' : percentage >= 40 ? 'text-amber-400' : 'text-red-400'}>
                                {percentage}%
                              </span>
                              <span className="text-indigo-300 ml-1">
                                ({scores.correct}/{scores.total})
                              </span>
                            </div>
                          </div>
                          <Progress 
                            value={percentage} 
                            className="h-1.5" 
                            indicatorClassName={
                              percentage >= 70 ? 'bg-green-600' : 
                              percentage >= 40 ? 'bg-amber-600' : 'bg-red-600'
                            } 
                          />
                        </div>
                      );
                    })}
                    
                    {Object.keys(categoryScores).length === 0 && (
                      <div className="text-center py-8 text-indigo-300">
                        Aucune statistique disponible. Commencez un quiz pour voir vos performances.
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="bg-indigo-700 hover:bg-indigo-800 w-full sm:w-auto"
                  onClick={() => {
                    setActiveTab('quiz');
                    setShowRecommendations(false);
                  }}
                >
                  Démarrer un nouveau quiz
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Onglet Historique */}
          <TabsContent value="history" className="space-y-6">
            <Card className="bg-indigo-900/20 border-indigo-800">
              <CardHeader>
                <CardTitle>Historique des quiz</CardTitle>
                <CardDescription className="text-indigo-200">
                  Suivez vos résultats précédents et votre progression
                </CardDescription>
              </CardHeader>
              <CardContent>
                {quizHistory.length > 0 ? (
                  <div className="space-y-4">
                    {quizHistory.map((result, index) => {
                      const date = new Date(result.date);
                      const formattedDate = `${date.toLocaleDateString()} à ${date.toLocaleTimeString()}`;
                      const percentage = Math.round((result.score / result.questionsAnswered) * 100);
                      
                      return (
                        <Card key={index} className="bg-slate-900/30 border-slate-800">
                          <CardContent className="p-4">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                              <div>
                                <h3 className="font-medium">Quiz {quizHistory.length - index}</h3>
                                <p className="text-xs text-indigo-300">{formattedDate}</p>
                              </div>
                              
                              <div className="flex items-center gap-3">
                                <Badge variant="outline" className="border-indigo-600">
                                  {result.level}
                                </Badge>
                                <div className="text-lg font-bold">
                                  {result.score}/{result.questionsAnswered}
                                </div>
                                <div className={
                                  percentage >= 70 ? 'text-green-400' : 
                                  percentage >= 40 ? 'text-amber-400' : 'text-red-400'
                                }>
                                  {percentage}%
                                </div>
                              </div>
                            </div>
                            
                            <Progress 
                              value={percentage} 
                              className="h-1.5 mt-3" 
                              indicatorClassName={
                                percentage >= 70 ? 'bg-green-600' : 
                                percentage >= 40 ? 'bg-amber-600' : 'bg-red-600'
                              } 
                            />
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <Clock className="h-10 w-10 mx-auto text-indigo-400 mb-3" />
                    <h3 className="text-xl font-semibold">Aucun quiz complété</h3>
                    <p className="text-indigo-300 mt-1">Complétez des quiz pour voir votre historique ici</p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  className="bg-indigo-700 hover:bg-indigo-800 w-full sm:w-auto"
                  onClick={() => {
                    setActiveTab('quiz');
                    setShowRecommendations(false);
                  }}
                >
                  Démarrer un nouveau quiz
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}