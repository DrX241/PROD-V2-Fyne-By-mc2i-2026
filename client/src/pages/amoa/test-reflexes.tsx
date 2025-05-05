import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Brain, 
  BarChart3, 
  TimerReset, 
  Info,
  AlertCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import HomeLayout from "@/components/layout/HomeLayout";
import { motion } from "framer-motion";

// Types pour le test de réflexes
interface Question {
  id: string;
  text: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    explanation?: string;
  }[];
  timeLimit: number; // en secondes
  category: string;
  difficulty: "facile" | "moyen" | "difficile";
}

interface TestResults {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  averageResponseTime: number; // en secondes
  categoryScores: {
    [key: string]: {
      score: number;
      total: number;
    };
  };
  strongestCategory?: string;
  weakestCategory?: string;
}

// Questions de test sur le métier d'AMOA
const testQuestions: Question[] = [
  {
    id: "q1",
    text: "Quelle est la principale mission d'un AMOA dans un projet de transformation digitale ?",
    options: [
      { 
        id: "a1", 
        text: "Coder les nouvelles fonctionnalités", 
        isCorrect: false, 
        explanation: "Le développement est généralement confié à l'équipe technique ou à la MOE."
      },
      { 
        id: "a2", 
        text: "Faire l'interface entre les utilisateurs métier et l'équipe technique", 
        isCorrect: true, 
        explanation: "L'AMOA joue un rôle d'interface crucial pour traduire les besoins métiers en spécifications techniques."
      },
      { 
        id: "a3", 
        text: "Définir la stratégie marketing du projet", 
        isCorrect: false,
        explanation: "La stratégie marketing n'est pas du ressort de l'AMOA mais plutôt des équipes marketing." 
      },
      { 
        id: "a4", 
        text: "Gérer le budget global de l'entreprise", 
        isCorrect: false,
        explanation: "L'AMOA contribue à la gestion du budget projet mais pas au budget global de l'entreprise." 
      }
    ],
    timeLimit: 20,
    category: "Fondamentaux AMOA",
    difficulty: "facile"
  },
  {
    id: "q2",
    text: "Lors d'un recueil de besoins, vous constatez des contradictions entre deux responsables métier. Quelle est la meilleure approche ?",
    options: [
      { 
        id: "a1", 
        text: "Privilégier l'avis du responsable ayant le plus d'ancienneté", 
        isCorrect: false,
        explanation: "L'ancienneté n'est pas un critère pertinent pour arbitrer des besoins contradictoires."
      },
      { 
        id: "a2", 
        text: "Implémenter les deux besoins même s'ils sont contradictoires", 
        isCorrect: false,
        explanation: "Implémenter des besoins contradictoires conduirait à un système incohérent."
      },
      { 
        id: "a3", 
        text: "Organiser un atelier de conciliation pour trouver un consensus", 
        isCorrect: true,
        explanation: "La conciliation permet d'aligner les parties prenantes et de résoudre les contradictions."
      },
      { 
        id: "a4", 
        text: "Demander au DSI de trancher", 
        isCorrect: false,
        explanation: "Le DSI n'est pas toujours le mieux placé pour arbitrer des besoins métiers spécifiques."
      }
    ],
    timeLimit: 25,
    category: "Recueil des besoins",
    difficulty: "moyen"
  },
  {
    id: "q3",
    text: "Quelle technique est la plus adaptée pour prioriser un grand nombre d'exigences avec de multiples parties prenantes ?",
    options: [
      { 
        id: "a1", 
        text: "Méthode MoSCoW", 
        isCorrect: true,
        explanation: "La méthode MoSCoW (Must have, Should have, Could have, Won't have) est particulièrement efficace pour prioriser collectivement."
      },
      { 
        id: "a2", 
        text: "Liste chronologique", 
        isCorrect: false,
        explanation: "L'ordre chronologique n'est pas pertinent pour prioriser des exigences selon leur valeur."
      },
      { 
        id: "a3", 
        text: "Décision unilatérale du chef de projet", 
        isCorrect: false,
        explanation: "La priorisation doit être collaborative pour obtenir l'adhésion des parties prenantes."
      },
      { 
        id: "a4", 
        text: "Tirage au sort", 
        isCorrect: false,
        explanation: "Le tirage au sort ne tient pas compte de la valeur métier des exigences."
      }
    ],
    timeLimit: 20,
    category: "Gestion des exigences",
    difficulty: "moyen"
  },
  {
    id: "q4",
    text: "Face à une demande urgente de modification importante en cours de recette, quelle est la démarche la plus adaptée ?",
    options: [
      { 
        id: "a1", 
        text: "L'implémenter immédiatement pour satisfaire le client", 
        isCorrect: false,
        explanation: "Implémenter sans analyse d'impact ni processus de validation formel est risqué."
      },
      { 
        id: "a2", 
        text: "La refuser catégoriquement car on est en phase de recette", 
        isCorrect: false,
        explanation: "Un refus catégorique n'est pas constructif et peut nuire à la relation client."
      },
      { 
        id: "a3", 
        text: "Analyser l'impact, proposer de la planifier pour la prochaine version", 
        isCorrect: true,
        explanation: "Cette approche permet d'évaluer l'impact tout en proposant une solution constructive."
      },
      { 
        id: "a4", 
        text: "Demander au développeur de l'implémenter en parallèle sans validation", 
        isCorrect: false,
        explanation: "Contourner le processus de validation expose le projet à des risques majeurs."
      }
    ],
    timeLimit: 25,
    category: "Gestion du changement",
    difficulty: "difficile"
  },
  {
    id: "q5",
    text: "Quelle affirmation est correcte concernant les User Stories dans une méthode agile ?",
    options: [
      { 
        id: "a1", 
        text: "Elles doivent être rédigées par le Scrum Master uniquement", 
        isCorrect: false,
        explanation: "Les User Stories sont généralement rédigées par le Product Owner avec les parties prenantes."
      },
      { 
        id: "a2", 
        text: "Elles remplacent complètement les spécifications détaillées", 
        isCorrect: false,
        explanation: "Des spécifications détaillées restent nécessaires pour certaines fonctionnalités complexes."
      },
      { 
        id: "a3", 
        text: "Elles suivent le format 'En tant que..., je veux..., afin de...'", 
        isCorrect: true,
        explanation: "Ce format standard permet de capturer le rôle, l'action et la valeur métier."
      },
      { 
        id: "a4", 
        text: "Elles doivent contenir tous les détails techniques d'implémentation", 
        isCorrect: false,
        explanation: "Les User Stories se concentrent sur le besoin et la valeur, pas sur l'implémentation technique."
      }
    ],
    timeLimit: 20,
    category: "Méthodes agiles",
    difficulty: "facile"
  },
  {
    id: "q6",
    text: "Lors d'une réunion de lancement de projet, quel élément n'est généralement PAS abordé ?",
    options: [
      { 
        id: "a1", 
        text: "Les objectifs du projet", 
        isCorrect: false,
        explanation: "Les objectifs sont essentiels et toujours abordés lors du lancement."
      },
      { 
        id: "a2", 
        text: "La répartition détaillée des tâches de développement", 
        isCorrect: true,
        explanation: "Ce niveau de détail est abordé plus tard, une fois le cadrage établi."
      },
      { 
        id: "a3", 
        text: "Le planning macro et les grandes étapes", 
        isCorrect: false,
        explanation: "Le planning macro est un élément clé du lancement de projet."
      },
      { 
        id: "a4", 
        text: "Les parties prenantes principales", 
        isCorrect: false,
        explanation: "L'identification des parties prenantes est fondamentale lors du lancement."
      }
    ],
    timeLimit: 20,
    category: "Gestion de projet",
    difficulty: "moyen"
  },
  {
    id: "q7",
    text: "Laquelle de ces techniques est la plus appropriée pour analyser les impacts d'une modification majeure sur un système existant ?",
    options: [
      { 
        id: "a1", 
        text: "Matrice RACI", 
        isCorrect: false,
        explanation: "La matrice RACI est utilisée pour clarifier les rôles et responsabilités, pas pour l'analyse d'impact."
      },
      { 
        id: "a2", 
        text: "Diagramme de Gantt", 
        isCorrect: false,
        explanation: "Le diagramme de Gantt est un outil de planification, pas d'analyse d'impact."
      },
      { 
        id: "a3", 
        text: "Matrice d'impact et de dépendances", 
        isCorrect: true,
        explanation: "Cette technique permet d'identifier systématiquement les composants affectés et leurs dépendances."
      },
      { 
        id: "a4", 
        text: "Analyse SWOT", 
        isCorrect: false,
        explanation: "L'analyse SWOT est utilisée pour l'analyse stratégique, pas pour l'analyse d'impact technique."
      }
    ],
    timeLimit: 20,
    category: "Analyse d'impact",
    difficulty: "difficile"
  },
  {
    id: "q8",
    text: "Quelle est la meilleure pratique pour maintenir un référentiel d'exigences à jour ?",
    options: [
      { 
        id: "a1", 
        text: "Le figer dès le début du projet pour éviter les dérives", 
        isCorrect: false,
        explanation: "Un référentiel figé ne permet pas de s'adapter aux évolutions inévitables."
      },
      { 
        id: "a2", 
        text: "Autoriser tout changement sans processus de validation", 
        isCorrect: false,
        explanation: "Une modification sans contrôle conduirait au chaos et à la dérive du projet."
      },
      { 
        id: "a3", 
        text: "Établir un processus de gestion des changements avec traçabilité", 
        isCorrect: true,
        explanation: "Un processus structuré permet d'évaluer, de valider et de tracer les modifications de manière contrôlée."
      },
      { 
        id: "a4", 
        text: "Déléguer entièrement la gestion à l'équipe technique", 
        isCorrect: false,
        explanation: "L'équipe technique n'a pas nécessairement toute la vision métier requise."
      }
    ],
    timeLimit: 20,
    category: "Gestion des exigences",
    difficulty: "moyen"
  },
  {
    id: "q9",
    text: "Dans un projet en cascade (cycle en V), à quel moment l'AMOA rédige-t-il généralement les cas de tests ?",
    options: [
      { 
        id: "a1", 
        text: "Après le développement", 
        isCorrect: false,
        explanation: "Attendre la fin du développement est trop tardif et ne permet pas d'aligner les développements avec les tests."
      },
      { 
        id: "a2", 
        text: "En parallèle des spécifications fonctionnelles", 
        isCorrect: true,
        explanation: "Cette approche permet d'assurer la cohérence entre les spécifications et les tests, et de préparer les tests à l'avance."
      },
      { 
        id: "a3", 
        text: "Juste avant la recette", 
        isCorrect: false,
        explanation: "C'est trop tardif et ne permet pas d'influencer le développement."
      },
      { 
        id: "a4", 
        text: "Pendant la phase de cadrage", 
        isCorrect: false,
        explanation: "C'est trop tôt car les fonctionnalités ne sont pas encore suffisamment détaillées."
      }
    ],
    timeLimit: 25,
    category: "Tests et recette",
    difficulty: "moyen"
  },
  {
    id: "q10",
    text: "Quelle pratique est généralement considérée comme la plus efficace pour un AMOA qui souhaite comprendre les processus métier existants ?",
    options: [
      { 
        id: "a1", 
        text: "Se baser uniquement sur la documentation existante", 
        isCorrect: false,
        explanation: "La documentation peut être obsolète ou ne pas refléter les pratiques réelles."
      },
      { 
        id: "a2", 
        text: "Observer directement les utilisateurs dans leur environnement de travail", 
        isCorrect: true,
        explanation: "L'observation directe permet de saisir les pratiques réelles et les contraintes non documentées."
      },
      { 
        id: "a3", 
        text: "Interroger uniquement les responsables hiérarchiques", 
        isCorrect: false,
        explanation: "Les responsables n'ont pas toujours une vision précise des processus opérationnels."
      },
      { 
        id: "a4", 
        text: "Analyser uniquement les données du système", 
        isCorrect: false,
        explanation: "Les données seules ne révèlent pas les pratiques, les contraintes et le contexte métier."
      }
    ],
    timeLimit: 20,
    category: "Analyse métier",
    difficulty: "facile"
  }
];

const TestDeReflexes: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("briefing");
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [answers, setAnswers] = useState<{
    [questionId: string]: {
      answerId: string;
      isCorrect: boolean;
      responseTime: number;
    };
  }>({});
  const [results, setResults] = useState<TestResults | null>(null);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  const currentQuestion = isStarted && !isFinished ? testQuestions[currentQuestionIndex] : null;

  // Démarrer le test
  const handleStartTest = () => {
    setIsStarted(true);
    setIsFinished(false);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setResults(null);
    setActiveTab("test");
    setTimeLeft(testQuestions[0].timeLimit);
    setShowExplanation(false);
    setSelectedOptionId(null);

    // Démarrer le timer
    const newTimer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          // Temps écoulé, passer à la question suivante
          handleTimeout();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    setTimer(newTimer);
  };

  // Gérer la sélection d'une réponse
  const handleSelectAnswer = (optionId: string, isCorrect: boolean) => {
    if (selectedOptionId) return; // Déjà répondu
    
    setSelectedOptionId(optionId);
    const responseTime = currentQuestion ? currentQuestion.timeLimit - timeLeft : 0;
    
    // Enregistrer la réponse
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion?.id || ""]: {
        answerId: optionId,
        isCorrect,
        responseTime
      }
    }));
    
    // Arrêter le timer
    if (timer) {
      clearInterval(timer);
      setTimer(null);
    }
    
    // Afficher l'explication
    setShowExplanation(true);
    
    // Attendre 3 secondes puis passer à la question suivante
    setTimeout(() => {
      goToNextQuestion();
    }, 3000);
  };

  // Gérer le timeout
  const handleTimeout = () => {
    if (timer) {
      clearInterval(timer);
      setTimer(null);
    }
    
    // Enregistrer une non-réponse
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion?.id || ""]: {
        answerId: "timeout",
        isCorrect: false,
        responseTime: currentQuestion?.timeLimit || 0
      }
    }));
    
    // Afficher un message
    toast({
      title: "Temps écoulé !",
      description: "Vous n'avez pas répondu à temps.",
      variant: "destructive"
    });
    
    // Passer à la question suivante
    goToNextQuestion();
  };

  // Passer à la question suivante
  const goToNextQuestion = () => {
    setShowExplanation(false);
    setSelectedOptionId(null);
    
    if (currentQuestionIndex < testQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setTimeLeft(testQuestions[currentQuestionIndex + 1].timeLimit);
      
      // Redémarrer le timer
      const newTimer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            handleTimeout();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
      
      setTimer(newTimer);
    } else {
      // Fin du test
      finishTest();
    }
  };

  // Calculer les résultats
  const calculateResults = (): TestResults => {
    const totalQuestions = testQuestions.length;
    const answeredQuestions = Object.keys(answers).length;
    const correctAnswers = Object.values(answers).filter(a => a.isCorrect).length;
    const totalResponseTime = Object.values(answers).reduce((total, a) => total + a.responseTime, 0);
    const averageResponseTime = answeredQuestions > 0 ? totalResponseTime / answeredQuestions : 0;
    
    // Scores par catégorie
    const categoryScores: {
      [key: string]: {
        score: number;
        total: number;
      };
    } = {};
    
    testQuestions.forEach((q) => {
      if (!categoryScores[q.category]) {
        categoryScores[q.category] = { score: 0, total: 0 };
      }
      
      categoryScores[q.category].total += 1;
      
      if (answers[q.id]?.isCorrect) {
        categoryScores[q.category].score += 1;
      }
    });
    
    // Trouver les points forts et faibles
    let strongestCategory = "";
    let weakestCategory = "";
    let highestScore = -1;
    let lowestScore = 101;
    
    Object.entries(categoryScores).forEach(([category, { score, total }]) => {
      const percentage = (score / total) * 100;
      
      if (percentage > highestScore) {
        highestScore = percentage;
        strongestCategory = category;
      }
      
      if (percentage < lowestScore) {
        lowestScore = percentage;
        weakestCategory = category;
      }
    });
    
    return {
      score: Math.round((correctAnswers / totalQuestions) * 100),
      totalQuestions,
      correctAnswers,
      averageResponseTime,
      categoryScores,
      strongestCategory,
      weakestCategory
    };
  };

  // Terminer le test
  const finishTest = () => {
    if (timer) {
      clearInterval(timer);
      setTimer(null);
    }
    
    const calculatedResults = calculateResults();
    setResults(calculatedResults);
    setIsFinished(true);
    setActiveTab("results");
    
    toast({
      title: "Test terminé !",
      description: `Votre score : ${calculatedResults.score}% (${calculatedResults.correctAnswers}/${calculatedResults.totalQuestions})`,
      variant: "default"
    });
  };

  // Nettoyer le timer à la fermeture
  useEffect(() => {
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [timer]);

  return (
    <HomeLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-green-900 to-gray-900 pt-16 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* En-tête */}
          <div className="flex justify-between items-center mb-8">
            <Link href="/amoa-mode-selection">
              <Button variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/20">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-white text-center">Test de Réflexes AMOA</h1>
            <div className="w-[100px]"></div> {/* Spacer pour centrer le titre */}
          </div>

          {/* Tabs */}
          <Tabs 
            defaultValue="briefing" 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-3 mb-8 bg-white/10 p-1">
              <TabsTrigger 
                value="briefing" 
                className={activeTab === "briefing" ? "text-white bg-green-700" : "text-gray-200"}
                disabled={isStarted && !isFinished}
              >
                Briefing
              </TabsTrigger>
              <TabsTrigger 
                value="test" 
                className={activeTab === "test" ? "text-white bg-green-700" : "text-gray-200"}
                disabled={!isStarted || isFinished}
              >
                Questions
              </TabsTrigger>
              <TabsTrigger 
                value="results" 
                className={activeTab === "results" ? "text-white bg-green-700" : "text-gray-200"}
                disabled={!isFinished}
              >
                Résultats
              </TabsTrigger>
            </TabsList>

            {/* Contenu du briefing */}
            <TabsContent value="briefing" className="mt-0">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="border-green-700/30 bg-white/5 text-white shadow-lg">
                  <CardHeader className="border-b border-white/10 bg-white/5">
                    <CardTitle className="text-2xl flex items-center">
                      <Brain className="w-6 h-6 mr-2 text-green-400" />
                      Évaluez vos réflexes d'AMOA
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 pb-4">
                    <div className="space-y-4">
                      <p className="text-gray-200">
                        Ce test évalue vos réflexes et connaissances dans différents aspects de l'assistance à maîtrise d'ouvrage.
                        Vous serez confronté à 10 questions avec un temps limité pour répondre à chacune.
                      </p>
                      
                      <div className="bg-white/10 p-4 rounded-lg space-y-2">
                        <h3 className="text-lg font-semibold text-green-400">Instructions :</h3>
                        <ul className="list-disc list-inside space-y-2 text-gray-200">
                          <li>Chaque question dispose d'un temps limité indiqué par un compte à rebours</li>
                          <li>Sélectionnez la réponse qui vous semble la plus appropriée</li>
                          <li>Répondez rapidement mais réfléchissez bien - les réponses incorrectes diminuent votre score</li>
                          <li>Vous ne pouvez pas revenir en arrière après avoir répondu</li>
                          <li>À la fin du test, un rapport détaillé analysera vos points forts et axes d'amélioration</li>
                        </ul>
                      </div>
                      
                      <div className="bg-green-900/30 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-green-400 mb-2">Catégories évaluées :</h3>
                        <div className="grid grid-cols-2 gap-2">
                          <Badge variant="outline" className="bg-white/10 text-white border-green-500/30 justify-start">Fondamentaux AMOA</Badge>
                          <Badge variant="outline" className="bg-white/10 text-white border-green-500/30 justify-start">Recueil des besoins</Badge>
                          <Badge variant="outline" className="bg-white/10 text-white border-green-500/30 justify-start">Gestion des exigences</Badge>
                          <Badge variant="outline" className="bg-white/10 text-white border-green-500/30 justify-start">Analyse métier</Badge>
                          <Badge variant="outline" className="bg-white/10 text-white border-green-500/30 justify-start">Gestion de projet</Badge>
                          <Badge variant="outline" className="bg-white/10 text-white border-green-500/30 justify-start">Tests et recette</Badge>
                          <Badge variant="outline" className="bg-white/10 text-white border-green-500/30 justify-start">Méthodes agiles</Badge>
                          <Badge variant="outline" className="bg-white/10 text-white border-green-500/30 justify-start">Analyse d'impact</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-white/10 bg-white/5 flex justify-center pt-4">
                    <Button 
                      className="bg-green-700 hover:bg-green-600 text-white w-full sm:w-64"
                      size="lg"
                      onClick={handleStartTest}
                    >
                      Commencer le test
                      <Clock className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Contenu du test */}
            <TabsContent value="test" className="mt-0">
              {isStarted && !isFinished && currentQuestion && (
                <motion.div 
                  key={currentQuestion.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="border-green-700/30 bg-white/5 text-white shadow-lg">
                    <CardHeader className="border-b border-white/10 bg-white/5">
                      <div className="flex justify-between items-center">
                        <Badge 
                          variant="outline" 
                          className="bg-white/10 text-white border-green-500/30"
                        >
                          Question {currentQuestionIndex + 1}/{testQuestions.length}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "bg-white/10 text-white border-green-500/30",
                            timeLeft < 5 && "animate-pulse bg-red-900/30 border-red-500/30"
                          )}
                        >
                          <Clock className="mr-1 h-3 w-3" />
                          {timeLeft} secondes
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "bg-white/10 text-white",
                            currentQuestion.difficulty === "facile" ? "border-green-500/30" :
                            currentQuestion.difficulty === "moyen" ? "border-yellow-500/30" :
                            "border-red-500/30"
                          )}
                        >
                          {currentQuestion.category}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl mt-2">{currentQuestion.text}</CardTitle>
                      <Progress 
                        value={(timeLeft / currentQuestion.timeLimit) * 100} 
                        className="h-1 bg-white/20"
                        indicatorClassName={cn(
                          "bg-gradient-to-r",
                          timeLeft > currentQuestion.timeLimit * 0.6 ? "from-green-500 to-green-400" :
                          timeLeft > currentQuestion.timeLimit * 0.3 ? "from-yellow-500 to-yellow-400" :
                          "from-red-500 to-red-400"
                        )}
                      />
                    </CardHeader>
                    <CardContent className="pt-6 pb-4">
                      <div className="space-y-3">
                        {currentQuestion.options.map((option) => (
                          <Button
                            key={option.id}
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left h-auto py-4 px-4 text-white border-white/20 bg-white/5 hover:bg-white/10",
                              selectedOptionId === option.id && option.isCorrect && "bg-green-800/50 border-green-500",
                              selectedOptionId === option.id && !option.isCorrect && "bg-red-800/50 border-red-500",
                              selectedOptionId && option.id !== selectedOptionId && option.isCorrect && "border-green-500"
                            )}
                            onClick={() => handleSelectAnswer(option.id, option.isCorrect)}
                            disabled={!!selectedOptionId}
                          >
                            <div className="flex items-center">
                              <div className={cn(
                                "w-6 h-6 rounded-full mr-3 flex items-center justify-center border",
                                selectedOptionId === option.id && option.isCorrect ? "bg-green-600 border-green-400" :
                                selectedOptionId === option.id && !option.isCorrect ? "bg-red-600 border-red-400" :
                                selectedOptionId && option.id !== selectedOptionId && option.isCorrect ? "bg-green-600/50 border-green-400" :
                                "bg-white/10 border-white/20"
                              )}>
                                {selectedOptionId === option.id && option.isCorrect && <CheckCircle2 className="h-4 w-4 text-white" />}
                                {selectedOptionId === option.id && !option.isCorrect && <XCircle className="h-4 w-4 text-white" />}
                                {selectedOptionId && option.id !== selectedOptionId && option.isCorrect && <CheckCircle2 className="h-4 w-4 text-white" />}
                              </div>
                              <span>{option.text}</span>
                            </div>
                          </Button>
                        ))}
                      </div>

                      {/* Explication */}
                      {showExplanation && selectedOptionId && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-6 p-4 bg-white/10 rounded-lg border border-white/20"
                        >
                          <h4 className="font-semibold text-green-400 flex items-center mb-1">
                            <Info className="h-4 w-4 mr-1" />
                            Explication
                          </h4>
                          <p className="text-gray-200 text-sm">
                            {currentQuestion.options.find(o => o.id === selectedOptionId)?.explanation || 
                             currentQuestion.options.find(o => o.isCorrect)?.explanation}
                          </p>
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </TabsContent>

            {/* Contenu des résultats */}
            <TabsContent value="results" className="mt-0">
              {isFinished && results && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="border-green-700/30 bg-white/5 text-white shadow-lg overflow-hidden">
                    <CardHeader className="border-b border-white/10 bg-white/5">
                      <CardTitle className="text-2xl flex items-center">
                        <BarChart3 className="w-6 h-6 mr-2 text-green-400" />
                        Résultats du test
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 pb-4">
                      <div className="space-y-6">
                        {/* Score global */}
                        <div className="bg-white/10 rounded-lg p-4 relative overflow-hidden">
                          <div 
                            className={cn(
                              "absolute top-0 left-0 h-full transition-all duration-1000",
                              results.score >= 80 ? "bg-green-600/20" :
                              results.score >= 60 ? "bg-yellow-600/20" :
                              "bg-red-600/20"
                            )}
                            style={{ width: `${results.score}%` }}
                          ></div>

                          <div className="relative z-10">
                            <h3 className="text-xl font-bold mb-2">Score global</h3>
                            <div className="flex items-center">
                              <span className={cn(
                                "text-4xl font-bold",
                                results.score >= 80 ? "text-green-400" :
                                results.score >= 60 ? "text-yellow-400" :
                                "text-red-400"
                              )}>
                                {results.score}%
                              </span>
                              <div className="ml-4">
                                <p className="text-gray-200">
                                  <span className="font-medium">{results.correctAnswers}</span> réponses correctes sur <span className="font-medium">{results.totalQuestions}</span> questions
                                </p>
                                <p className="text-gray-300 text-sm">
                                  Temps de réponse moyen : <span className="font-medium">{results.averageResponseTime.toFixed(1)}</span> secondes
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Points forts et à améliorer */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Points forts */}
                          <div className="bg-green-900/30 rounded-lg p-4 border border-green-600/20">
                            <h3 className="text-lg font-semibold text-green-400 mb-2 flex items-center">
                              <CheckCircle2 className="w-5 h-5 mr-1" />
                              Points forts
                            </h3>
                            {results.strongestCategory ? (
                              <div>
                                <Badge className="bg-green-700/50 text-white mb-2">
                                  {results.strongestCategory}
                                </Badge>
                                <p className="text-gray-200 text-sm">
                                  Score de {results.categoryScores[results.strongestCategory].score}/{results.categoryScores[results.strongestCategory].total} dans cette catégorie
                                </p>
                              </div>
                            ) : (
                              <p className="text-gray-300 italic">Pas assez de données pour déterminer vos points forts.</p>
                            )}
                          </div>

                          {/* Points à améliorer */}
                          <div className="bg-red-900/20 rounded-lg p-4 border border-red-600/20">
                            <h3 className="text-lg font-semibold text-red-300 mb-2 flex items-center">
                              <AlertCircle className="w-5 h-5 mr-1" />
                              Axes d'amélioration
                            </h3>
                            {results.weakestCategory ? (
                              <div>
                                <Badge className="bg-red-700/50 text-white mb-2">
                                  {results.weakestCategory}
                                </Badge>
                                <p className="text-gray-200 text-sm">
                                  Score de {results.categoryScores[results.weakestCategory].score}/{results.categoryScores[results.weakestCategory].total} dans cette catégorie
                                </p>
                              </div>
                            ) : (
                              <p className="text-gray-300 italic">Pas assez de données pour déterminer vos axes d'amélioration.</p>
                            )}
                          </div>
                        </div>

                        {/* Scores par catégorie */}
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-3">Détails par catégorie</h3>
                          <div className="space-y-3">
                            {Object.entries(results.categoryScores).map(([category, { score, total }]) => (
                              <div key={category} className="bg-white/5 p-3 rounded-lg">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-sm font-medium text-gray-200">{category}</span>
                                  <span className="text-sm font-medium text-gray-300">{score}/{total}</span>
                                </div>
                                <Progress 
                                  value={(score / total) * 100} 
                                  className="h-2 bg-white/10"
                                  indicatorClassName={cn(
                                    (score / total) >= 0.8 ? "bg-green-500" :
                                    (score / total) >= 0.6 ? "bg-yellow-500" :
                                    "bg-red-500"
                                  )}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="border-t border-white/10 bg-white/5 flex justify-center space-x-4 pt-4">
                      <Button 
                        className="bg-white/10 hover:bg-white/20 text-white"
                        size="lg"
                        onClick={() => setActiveTab("briefing")}
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Retour au briefing
                      </Button>
                      <Button 
                        className="bg-green-700 hover:bg-green-600 text-white"
                        size="lg"
                        onClick={handleStartTest}
                      >
                        <TimerReset className="mr-2 h-4 w-4" />
                        Retenter le test
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </HomeLayout>
  );
};

export default TestDeReflexes;