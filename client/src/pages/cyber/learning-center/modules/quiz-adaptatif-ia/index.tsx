import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronRight,
  Trophy,
  RotateCcw,
  Brain,
  Sparkles,
  Timer,
  Info,
  FileText,
  BrainCircuit
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import PageTitle from '@/components/utils/PageTitle';
import { useToast } from '@/hooks/use-toast';

export default function QuizAdaptatifIA() {
  // États du quiz
  const [isStarted, setIsStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [difficulty, setDifficulty] = useState('moyen'); // facile, moyen, difficile
  const [timeRemaining, setTimeRemaining] = useState(45);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();
  
  // Questions de base selon le niveau de difficulté
  const questions = {
    facile: [
      {
        id: 'f1',
        question: "Qu'est-ce qu'un mot de passe fort ?",
        options: [
          { id: 'a', text: "Un mot de passe contenant uniquement des lettres majuscules" },
          { id: 'b', text: "Un mot de passe de 8 caractères minimum combinant lettres, chiffres et caractères spéciaux" },
          { id: 'c', text: "Le nom de votre animal de compagnie suivi de votre date de naissance" },
          { id: 'd', text: "Un mot de passe facile à mémoriser comme '123456' ou 'password'" }
        ],
        correctAnswer: 'b',
        explanation: "Un mot de passe fort doit contenir au minimum 8 caractères avec un mélange de lettres majuscules et minuscules, chiffres et caractères spéciaux. Il doit être difficile à deviner mais facile à retenir pour vous."
      },
      {
        id: 'f2',
        question: "Qu'est-ce que le phishing ?",
        options: [
          { id: 'a', text: "Une technique de pêche utilisée par les hackers" },
          { id: 'b', text: "Une méthode pour augmenter la vitesse de connexion Internet" },
          { id: 'c', text: "Une technique frauduleuse pour obtenir des informations personnelles en se faisant passer pour une entité de confiance" },
          { id: 'd', text: "Un type de virus informatique qui affecte uniquement les smartphones" }
        ],
        correctAnswer: 'c',
        explanation: "Le phishing (ou hameçonnage) est une technique frauduleuse destinée à leurrer l'internaute pour l'inciter à communiquer des données personnelles en se faisant passer pour un tiers de confiance."
      },
      {
        id: 'f3',
        question: "Quelle mesure permet de renforcer la sécurité d'un compte en ligne ?",
        options: [
          { id: 'a', text: "Utiliser le même mot de passe pour tous vos comptes" },
          { id: 'b', text: "Activer l'authentification à deux facteurs (2FA)" },
          { id: 'c', text: "Partager vos informations d'identification avec des collègues de confiance" },
          { id: 'd', text: "Désactiver les mises à jour de sécurité" }
        ],
        correctAnswer: 'b',
        explanation: "L'authentification à deux facteurs (2FA) ajoute une couche de sécurité supplémentaire en demandant une seconde forme de vérification en plus du mot de passe, comme un code envoyé par SMS ou généré par une application."
      }
    ],
    moyen: [
      {
        id: 'm1',
        question: "Quelle est la différence entre un virus et un cheval de Troie ?",
        options: [
          { id: 'a', text: "Il n'y a pas de différence, ce sont deux termes pour la même chose" },
          { id: 'b', text: "Un virus se réplique automatiquement, tandis qu'un cheval de Troie se présente comme un logiciel légitime mais cache des fonctions malveillantes" },
          { id: 'c', text: "Un virus affecte uniquement les ordinateurs Windows, un cheval de Troie cible uniquement les Mac" },
          { id: 'd', text: "Un virus endommage les fichiers, un cheval de Troie améliore les performances du système" }
        ],
        correctAnswer: 'b',
        explanation: "Un virus est un programme malveillant qui se réplique en s'insérant dans d'autres programmes. Un cheval de Troie se présente comme un logiciel utile ou inoffensif mais contient en réalité du code malveillant qui s'exécute à l'insu de l'utilisateur."
      },
      {
        id: 'm2',
        question: "Qu'est-ce qu'une attaque par déni de service distribué (DDoS) ?",
        options: [
          { id: 'a', text: "Une tentative de se connecter à un service en utilisant différents mots de passe" },
          { id: 'b', text: "Une méthode pour distribuer équitablement les ressources serveur" },
          { id: 'c', text: "Une attaque qui implique plusieurs systèmes compromis pour submerger un système cible de requêtes" },
          { id: 'd', text: "Une technique pour récupérer des données après une panne système" }
        ],
        correctAnswer: 'c',
        explanation: "Une attaque DDoS utilise de nombreux systèmes compromis (souvent des milliers) pour envoyer simultanément des requêtes vers une cible, surchargeant ses ressources et rendant le service indisponible pour les utilisateurs légitimes."
      },
      {
        id: 'm3',
        question: "Quel protocole assure la sécurité des communications sur le Web ?",
        options: [
          { id: 'a', text: "HTTP" },
          { id: 'b', text: "FTP" },
          { id: 'c', text: "HTTPS" },
          { id: 'd', text: "SMTP" }
        ],
        correctAnswer: 'c',
        explanation: "HTTPS (HTTP Secure) est une version sécurisée du protocole HTTP qui utilise TLS/SSL pour chiffrer les communications entre le navigateur et le serveur web, protégeant ainsi les données transmises contre l'interception et la manipulation."
      }
    ],
    difficile: [
      {
        id: 'd1',
        question: "Qu'est-ce que le principe du Zero Trust en cybersécurité ?",
        options: [
          { id: 'a', text: "Faire confiance mais vérifier" },
          { id: 'b', text: "Ne faire confiance à personne, toujours vérifier" },
          { id: 'c', text: "Faire confiance uniquement aux utilisateurs internes" },
          { id: 'd', text: "Ne pas utiliser de systèmes d'authentification" }
        ],
        correctAnswer: 'b',
        explanation: "Le principe du Zero Trust est une approche de sécurité basée sur la prémisse qu'aucune entité, qu'elle soit à l'intérieur ou à l'extérieur du périmètre organisationnel, ne doit être considérée comme fiable par défaut. Chaque requête d'accès doit être vérifiée, quel que soit son origine."
      },
      {
        id: 'd2',
        question: "Quelle méthode d'attaque exploite les entrées utilisateur non validées pour exécuter du code SQL malveillant ?",
        options: [
          { id: 'a', text: "Cross-Site Scripting (XSS)" },
          { id: 'b', text: "Injection SQL" },
          { id: 'c', text: "Cross-Site Request Forgery (CSRF)" },
          { id: 'd', text: "Man-in-the-Middle (MITM)" }
        ],
        correctAnswer: 'b',
        explanation: "L'injection SQL est une technique d'attaque qui exploite les vulnérabilités dans la validation des entrées utilisateur, permettant à l'attaquant d'insérer du code SQL malveillant dans les requêtes exécutées par l'application, potentiellement donnant accès à la base de données entière."
      },
      {
        id: 'd3',
        question: "Qu'est-ce que l'analyse sandboxing dans le contexte de la sécurité informatique ?",
        options: [
          { id: 'a', text: "Une technique pour protéger les plages de données dans une base de données" },
          { id: 'b', text: "Un environnement isolé pour exécuter et analyser du code potentiellement malveillant" },
          { id: 'c', text: "Une méthode pour sécuriser les communications sans fil" },
          { id: 'd', text: "Un système de classification des vulnérabilités" }
        ],
        correctAnswer: 'b',
        explanation: "Le sandboxing est une technique de sécurité qui consiste à exécuter des programmes ou ouvrir des fichiers dans un environnement isolé et contrôlé, sans accès au reste du système. Cela permet d'observer le comportement d'un logiciel potentiellement malveillant sans risquer de compromettre le système principal."
      }
    ]
  };
  
  // Sélectionner les questions en fonction du niveau de difficulté
  const getQuestionSet = () => {
    return questions[difficulty as keyof typeof questions];
  };
  
  // Générer une explication IA pour la réponse (simulée)
  const generateAIExplanation = () => {
    setIsLoading(true);
    
    // Simuler un appel API à OpenAI (à remplacer par un appel réel)
    setTimeout(() => {
      setFeedbackVisible(true);
      setIsLoading(false);
    }, 1500);
  };
  
  // Vérifier la réponse
  const checkAnswer = () => {
    if (!selectedAnswer) return;
    
    const currentSet = getQuestionSet();
    const isCorrect = selectedAnswer === currentSet[currentQuestion].correctAnswer;
    
    if (isCorrect) {
      setScore(score + 1);
      toast({
        title: "Bonne réponse !",
        description: "Félicitations, vous avez choisi la bonne réponse.",
        variant: "default",
      });
    } else {
      toast({
        title: "Mauvaise réponse",
        description: "Ce n'est pas la bonne réponse.",
        variant: "destructive",
      });
    }
    
    setIsAnswerSubmitted(true);
  };
  
  // Passer à la question suivante
  const nextQuestion = () => {
    const currentSet = getQuestionSet();
    
    if (currentQuestion < currentSet.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setIsAnswerSubmitted(false);
      setFeedbackVisible(false);
      setTimeRemaining(45);
      
      // Ajuster la difficulté selon les performances
      if (score / (currentQuestion + 1) > 0.7 && difficulty !== 'difficile') {
        // L'utilisateur réussit bien, augmenter la difficulté
        setDifficulty(difficulty === 'facile' ? 'moyen' : 'difficile');
        toast({
          title: "Niveau augmenté !",
          description: "Vos bonnes performances ont débloqué des questions plus difficiles.",
          variant: "default",
        });
      } else if (score / (currentQuestion + 1) < 0.3 && difficulty !== 'facile') {
        // L'utilisateur a des difficultés, réduire la difficulté
        setDifficulty(difficulty === 'difficile' ? 'moyen' : 'facile');
        toast({
          title: "Niveau ajusté",
          description: "Le niveau de difficulté a été ajusté pour mieux correspondre à vos connaissances.",
          variant: "default",
        });
      }
    } else {
      // Fin du quiz
      setIsQuizCompleted(true);
    }
  };
  
  // Gérer le timer
  useEffect(() => {
    if (!isStarted || isAnswerSubmitted || isQuizCompleted) return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          setIsAnswerSubmitted(true);
          toast({
            title: "Temps écoulé !",
            description: "Vous n'avez pas répondu à temps.",
            variant: "destructive",
          });
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isStarted, isAnswerSubmitted, currentQuestion, isQuizCompleted, toast]);
  
  // Calculer le pourcentage de progression
  const calculateProgress = () => {
    const currentSet = getQuestionSet();
    return ((currentQuestion + 1) / currentSet.length) * 100;
  };
  
  // Obtenir le niveau de performance
  const getPerformanceLevel = () => {
    const percentage = (score / getQuestionSet().length) * 100;
    
    if (percentage >= 80) return { text: "Expert", color: "text-green-500" };
    if (percentage >= 60) return { text: "Avancé", color: "text-blue-500" };
    if (percentage >= 40) return { text: "Intermédiaire", color: "text-yellow-500" };
    return { text: "Débutant", color: "text-red-500" };
  };
  
  // Recommandations personnalisées basées sur les performances
  const getRecommendations = () => {
    const percentage = (score / getQuestionSet().length) * 100;
    
    if (percentage >= 80) {
      return [
        "Explorer des sujets avancés comme l'analyse forensique",
        "Considérer une certification professionnelle en cybersécurité",
        "Contribuer à des projets open-source de sécurité"
      ];
    }
    
    if (percentage >= 60) {
      return [
        "Approfondir les connaissances sur les techniques d'attaque modernes",
        "S'exercer à des CTF (Capture The Flag) de niveau intermédiaire",
        "Étudier les principes du Zero Trust et de la sécurité cloud"
      ];
    }
    
    if (percentage >= 40) {
      return [
        "Renforcer la compréhension des concepts fondamentaux",
        "Pratiquer avec des laboratoires virtuels de sécurité",
        "Suivre un cours structuré sur les bases de la cybersécurité"
      ];
    }
    
    return [
      "Commencer par des ressources d'introduction à la cybersécurité",
      "Se familiariser avec les termes et concepts de base",
      "Pratiquer les bonnes pratiques de sécurité au quotidien"
    ];
  };
  
  // Composants de l'interface
  
  // Écran d'accueil
  const renderStartScreen = () => (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="mb-8 flex flex-col items-center text-center">
        <BrainCircuit className="h-16 w-16 text-blue-500 mb-4" />
        <h1 className="text-3xl font-bold text-white mb-2">Quiz Adaptatif IA</h1>
        <p className="text-blue-300 max-w-2xl">
          Testez vos connaissances en cybersécurité avec notre quiz intelligent qui s'adapte à votre niveau ! Notre système basé sur l'IA ajuste la difficulté des questions en fonction de vos performances et fournit des explications détaillées pour faciliter l'apprentissage.
        </p>
      </div>
      
      <Card className="w-full max-w-3xl bg-blue-950/60 border-blue-800/60">
        <CardHeader>
          <CardTitle className="text-xl">Comment ça fonctionne ?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="bg-blue-900/60 p-2 rounded-md">
              <BrainCircuit className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="font-medium text-white">Adaptation intelligente</p>
              <p className="text-sm text-blue-300">Le quiz ajuste automatiquement la difficulté des questions en fonction de vos réponses.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="bg-blue-900/60 p-2 rounded-md">
              <Sparkles className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="font-medium text-white">Explications générées par IA</p>
              <p className="text-sm text-blue-300">Recevez des explications détaillées pour chaque question, personnalisées selon vos besoins d'apprentissage.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="bg-blue-900/60 p-2 rounded-md">
              <FileText className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="font-medium text-white">Analyse de performance</p>
              <p className="text-sm text-blue-300">À la fin du quiz, obtenez une analyse de vos points forts et des recommandations personnalisées.</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button
            size="lg"
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setIsStarted(true)}
          >
            Commencer le quiz
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
  
  // Écran de quiz
  const renderQuiz = () => {
    const currentSet = getQuestionSet();
    const currentQ = currentSet[currentQuestion];
    
    return (
      <div className="w-full max-w-3xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Badge className="bg-blue-700 text-sm font-normal">
                Question {currentQuestion + 1}/{currentSet.length}
              </Badge>
              <Badge className="ml-2 bg-indigo-700 text-sm font-normal">
                Niveau: {difficulty === 'facile' ? 'Facile' : difficulty === 'moyen' ? 'Intermédiaire' : 'Avancé'}
              </Badge>
            </div>
            <div className="flex items-center">
              <Timer className="h-4 w-4 text-blue-400 mr-1" />
              <span className={`text-sm ${timeRemaining < 10 ? 'text-red-400' : 'text-blue-300'}`}>
                {timeRemaining}s
              </span>
            </div>
          </div>
          <Progress value={calculateProgress()} className="h-2 bg-blue-900/40" indicatorClassName="bg-blue-500" />
        </div>
        
        <Card className="bg-blue-950/60 border-blue-800/60 mb-6">
          <CardHeader>
            <CardTitle className="text-xl">{currentQ.question}</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={selectedAnswer || ""}
              onValueChange={setSelectedAnswer}
              disabled={isAnswerSubmitted}
              className="space-y-3"
            >
              {currentQ.options.map(option => (
                <div
                  key={option.id}
                  className={`flex items-center space-x-2 border border-blue-800/60 rounded-md p-3 hover:bg-blue-900/30 transition-colors ${
                    isAnswerSubmitted && option.id === currentQ.correctAnswer
                      ? 'bg-green-900/20 border-green-700/50'
                      : isAnswerSubmitted && option.id === selectedAnswer
                        ? 'bg-red-900/20 border-red-700/50'
                        : ''
                  }`}
                >
                  <RadioGroupItem
                    value={option.id}
                    id={`option-${option.id}`}
                    className="border-blue-500"
                  />
                  <Label
                    htmlFor={`option-${option.id}`}
                    className="flex-grow cursor-pointer text-sm"
                  >
                    {option.text}
                  </Label>
                  {isAnswerSubmitted && option.id === currentQ.correctAnswer && (
                    <CheckCircle2 className="h-5 w-5 text-green-500 ml-2" />
                  )}
                  {isAnswerSubmitted && option.id === selectedAnswer && option.id !== currentQ.correctAnswer && (
                    <XCircle className="h-5 w-5 text-red-500 ml-2" />
                  )}
                </div>
              ))}
            </RadioGroup>
          </CardContent>
          <CardFooter className="flex flex-col items-stretch">
            {!isAnswerSubmitted ? (
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={checkAnswer}
                disabled={!selectedAnswer}
              >
                Valider ma réponse
              </Button>
            ) : (
              <div className="w-full space-y-4">
                {!feedbackVisible ? (
                  <Button
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                    onClick={generateAIExplanation}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="h-4 w-4 border-2 border-current border-t-transparent animate-spin rounded-full mr-2" />
                        Génération de l'explication...
                      </>
                    ) : (
                      <>
                        <BrainCircuit className="mr-2 h-4 w-4" />
                        Afficher l'explication IA
                      </>
                    )}
                  </Button>
                ) : (
                  <Alert className="bg-indigo-950/50 border-indigo-700/50">
                    <BrainCircuit className="h-4 w-4 text-indigo-400" />
                    <AlertTitle>Explication</AlertTitle>
                    <AlertDescription className="text-indigo-200">
                      {currentQ.explanation}
                    </AlertDescription>
                  </Alert>
                )}
                
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={nextQuestion}
                >
                  {currentQuestion < currentSet.length - 1 ? (
                    <>
                      Question suivante
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Terminer le quiz
                      <Trophy className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardFooter>
        </Card>
        
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-blue-300">
              Score actuel: <span className="font-bold text-white">{score}/{currentQuestion + (isAnswerSubmitted ? 1 : 0)}</span>
            </p>
          </div>
          {isAnswerSubmitted && (
            <div className="text-sm text-blue-300 flex items-center">
              <Info className="h-4 w-4 mr-1 text-blue-400" />
              {selectedAnswer === currentQ.correctAnswer 
                ? "Bonne réponse !" 
                : `Réponse correcte : ${currentQ.options.find(o => o.id === currentQ.correctAnswer)?.text}`}
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // Écran de résultats
  const renderResults = () => {
    const currentSet = getQuestionSet();
    const percentage = (score / currentSet.length) * 100;
    const performance = getPerformanceLevel();
    const recommendations = getRecommendations();
    
    return (
      <div className="w-full max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-blue-950/60 border-blue-800/60 mb-6 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-700 p-6 text-center">
              <Trophy className="h-16 w-16 text-yellow-300 mx-auto mb-3" />
              <h2 className="text-2xl font-bold text-white mb-2">Quiz terminé !</h2>
              <p className="text-blue-100">Félicitations pour avoir complété le quiz adaptatif IA</p>
            </div>
            
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center p-4 bg-blue-900/40 rounded-full mb-2">
                    <div className="text-3xl font-bold">
                      {Math.round(percentage)}%
                    </div>
                  </div>
                  <h3 className="text-xl font-medium text-white mb-1">Votre score final</h3>
                  <p className="text-blue-300">
                    Vous avez obtenu <span className="font-bold text-white">{score}</span> bonnes réponses sur <span className="font-bold text-white">{currentSet.length}</span> questions
                  </p>
                </div>
                
                <Separator className="bg-blue-800/60" />
                
                <div>
                  <h3 className="text-lg font-medium text-white mb-3">Analyse de votre performance</h3>
                  <div className="bg-blue-900/30 rounded-lg p-4 mb-4">
                    <p className="text-blue-200 mb-2">
                      Niveau de connaissance: <span className={`font-bold ${performance.color}`}>{performance.text}</span>
                    </p>
                    <p className="text-blue-200">
                      {percentage >= 80
                        ? "Vous maîtrisez très bien les concepts de cybersécurité testés dans ce quiz. Continuez à approfondir vos connaissances sur des sujets avancés."
                        : percentage >= 60
                        ? "Vous avez une bonne compréhension des principes de cybersécurité. Quelques révisions sur certains concepts vous permettront de progresser encore."
                        : percentage >= 40
                        ? "Vous avez des connaissances de base en cybersécurité. Continuez à apprendre et à pratiquer régulièrement."
                        : "Vous débutez en cybersécurité. C'est un excellent point de départ pour développer vos connaissances."}
                    </p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-white mb-3">
                    <Sparkles className="h-4 w-4 text-blue-400 inline mr-2" />
                    Recommandations personnalisées
                  </h3>
                  <ul className="space-y-2">
                    {recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start">
                        <div className="mr-2 mt-1 text-blue-500">•</div>
                        <span className="text-blue-200">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="outline"
                className="border-blue-500 text-blue-400 hover:bg-blue-900/30"
                onClick={() => {
                  setIsQuizCompleted(false);
                  setCurrentQuestion(0);
                  setScore(0);
                  setSelectedAnswer(null);
                  setIsAnswerSubmitted(false);
                  setFeedbackVisible(false);
                  setTimeRemaining(45);
                  setDifficulty('moyen');
                }}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Recommencer le quiz
              </Button>
              
              <Link href="/cyber/learning-center">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour au centre de formation
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-[#0a1429]">
      <PageTitle title="Quiz Adaptatif IA | Centre de formation" />
      
      {/* En-tête */}
      <header className="border-b border-blue-800/60">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/cyber/learning-center">
            <Button variant="ghost" className="text-blue-300 hover:bg-blue-900/30 hover:text-blue-200">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au centre de formation
            </Button>
          </Link>
          <h1 className="text-xl text-white font-medium">Quiz Adaptatif IA</h1>
        </div>
      </header>
      
      {/* Contenu principal */}
      <div className="container mx-auto px-4 py-8">
        {!isStarted ? renderStartScreen() : isQuizCompleted ? renderResults() : renderQuiz()}
      </div>
    </div>
  );
}