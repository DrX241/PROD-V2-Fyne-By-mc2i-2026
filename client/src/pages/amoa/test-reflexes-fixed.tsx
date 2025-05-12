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
  AlertCircle,
  Award,
  Users,
  FileText,
  Zap,
  Lightbulb,
  Briefcase,
  Sparkles,
  MessageSquare,
  Check,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Trophy,
  Loader2
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
import testQuestions from "../../data/amoa/test-reflexes-questions";

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

interface CollectedAnswer {
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  category: string;
  difficulty: string;
  timeToAnswer: number;
}

interface AIEvaluation {
  score: number;
  feedback: string;
  strengths: string[];
  weaknesses: string[];
  badge: {
    name: string;
    description: string;
    icon: string;
  };
  ranking?: {
    position: number;
    totalParticipants: number;
    percentile: number;
  };
  improvementSuggestions: string[];
  professionalInsight: string;
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
  aiEvaluation?: AIEvaluation;  // Nouvelle propriété pour l'évaluation IA
}

type AnswerMap = {
  [questionId: string]: {
    answerId: string;
    isCorrect: boolean;
    responseTime: number;
  };
};

const TestDeReflexes: React.FC = () => {
  const { toast } = useToast();

  // États du test
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [results, setResults] = useState<TestResults | null>(null);
  const [activeTab, setActiveTab] = useState<string>("intro");
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  // États de gamification
  const [collectedAnswers, setCollectedAnswers] = useState<CollectedAnswer[]>([]);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState<number>(0);
  const [consecutiveWrong, setConsecutiveWrong] = useState<number>(0);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [difficulty, setDifficulty] = useState<"facile" | "moyen" | "difficile">("facile");
  const [usedQuestionIds, setUsedQuestionIds] = useState<Set<string>>(new Set());
  const [questionCount, setQuestionCount] = useState<number>(0);
  const [maxQuestions] = useState<number>(15); // Maximum de 15 questions
  const [loadingFeedback, setLoadingFeedback] = useState<boolean>(false);
  
  // Filtrer les questions qui n'ont pas encore été utilisées
  const availableQuestions = testQuestions.filter(q => !usedQuestionIds.has(q.id));
  const currentQuestion = isStarted && !isFinished ? 
    (availableQuestions.length > 0 ? 
      availableQuestions.find(q => q.difficulty === difficulty) || availableQuestions[0] 
      : testQuestions[Math.floor(Math.random() * testQuestions.length)]) 
    : null;

  // Démarrer le test
  const handleStartTest = () => {
    // Réinitialiser tous les états
    setIsStarted(true);
    setIsFinished(false);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setResults(null);
    setActiveTab("test");
    setShowExplanation(false);
    setSelectedOptionId(null);
    setUsedQuestionIds(new Set());
    setQuestionCount(0);
    
    // Réinitialiser les états de gamification
    setCollectedAnswers([]);
    setConsecutiveCorrect(0);
    setConsecutiveWrong(0);
    setFeedbackMessage(null);
    setDifficulty("facile");
    setLoading(false);
    
    // Sélectionner la première question aléatoirement parmi les questions de difficulté "facile"
    const easyQuestions = testQuestions.filter(q => q.difficulty === "facile");
    const firstQuestion = easyQuestions[Math.floor(Math.random() * easyQuestions.length)];
    
    // Marquer cette question comme utilisée
    setUsedQuestionIds(new Set([firstQuestion.id]));
    
    // Initialiser le compteur de questions
    setQuestionCount(1);
    
    // Initialiser le timer pour la première question
    setTimeLeft(firstQuestion.timeLimit);
    
    // Démarrer le timer de la question
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
    
    // Traitement des réponses et collecte d'information pour l'analyse IA
    if (isCorrect) {
      setConsecutiveCorrect(prev => prev + 1);
      setConsecutiveWrong(0);
      
      // Collecte d'information pour l'analyse IA
      if (currentQuestion) {
        const correctOption = currentQuestion.options.find(opt => opt.isCorrect);
        setCollectedAnswers(prev => [
          ...prev, 
          {
            question: currentQuestion.text,
            userAnswer: currentQuestion.options.find(opt => opt.id === optionId)?.text || "",
            correctAnswer: correctOption?.text || "",
            isCorrect: true,
            category: currentQuestion.category,
            difficulty: currentQuestion.difficulty,
            timeToAnswer: responseTime
          }
        ]);
      }
      
      // Message d'encouragement pour bonne réponse
      setFeedbackMessage("Excellent! Bonne réponse! 🎯");
      
      // Ajuster la difficulté si beaucoup de bonnes réponses consécutives
      if (consecutiveCorrect >= 2) {
        setDifficulty(prev => prev === "facile" ? "moyen" : prev === "moyen" ? "difficile" : prev);
      }
    } else {
      setConsecutiveWrong(prev => prev + 1);
      setConsecutiveCorrect(0);
      
      // Collecte d'information pour l'analyse IA
      if (currentQuestion) {
        const correctOption = currentQuestion.options.find(opt => opt.isCorrect);
        const selectedOption = currentQuestion.options.find(opt => opt.id === optionId);
        
        setCollectedAnswers(prev => [
          ...prev, 
          {
            question: currentQuestion.text,
            userAnswer: selectedOption?.text || "",
            correctAnswer: correctOption?.text || "",
            isCorrect: false,
            category: currentQuestion.category,
            difficulty: currentQuestion.difficulty,
            timeToAnswer: responseTime
          }
        ]);
      }
      
      // Message d'encouragement pour réponse incorrecte
      setFeedbackMessage("Ce n'est pas la bonne réponse. Lisez l'explication et continuez! 💡");
      
      // Ajuster la difficulté si trop de mauvaises réponses consécutives
      if (consecutiveWrong >= 2) {
        setDifficulty(prev => prev === "difficile" ? "moyen" : prev === "moyen" ? "facile" : prev);
      }
    }
    
    // Afficher l'explication
    setShowExplanation(true);
  };

  // Gestion du timeout
  const handleTimeout = () => {
    if (timer) {
      clearInterval(timer);
      setTimer(null);
    }
    
    // Ajouter une mauvaise réponse automatique
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion?.id || ""]: {
        answerId: "",
        isCorrect: false,
        responseTime: currentQuestion?.timeLimit || 0
      }
    }));
    
    // Incrémenter le compteur d'erreurs consécutives
    setConsecutiveWrong(prev => prev + 1);
    setConsecutiveCorrect(0);
    
    // Collecter la donnée pour l'analyse IA 
    if (currentQuestion) {
      const correctOption = currentQuestion.options.find(opt => opt.isCorrect);
      setCollectedAnswers(prev => [
        ...prev, 
        {
          question: currentQuestion.text,
          userAnswer: "Pas de réponse (temps écoulé)",
          correctAnswer: correctOption?.text || "",
          isCorrect: false,
          category: currentQuestion.category, 
          difficulty: currentQuestion.difficulty,
          timeToAnswer: currentQuestion.timeLimit
        }
      ]);
    }
    
    // Message d'encouragement pour timeout
    setFeedbackMessage("Le temps est écoulé. Restez concentré pour la prochaine question! ⏰");
    
    // Ajuster la difficulté si trop de timeouts consécutifs
    if (consecutiveWrong >= 2) {
      setDifficulty(prev => prev === "difficile" ? "moyen" : prev === "moyen" ? "facile" : prev);
    }
    
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
    // Vérifier si nous avons atteint le nombre maximal de questions
    if (questionCount >= maxQuestions) {
      finishTest();
      return;
    }
    
    // Arrêter le timer de la question précédente
    if (timer) {
      clearInterval(timer);
      setTimer(null);
    }
    
    setShowExplanation(false);
    setSelectedOptionId(null);
    setFeedbackMessage(null);
    
    // Incrémenter le compteur de questions
    setQuestionCount(prev => prev + 1);
    
    // Si toutes les questions ont été utilisées, réinitialiser l'ensemble des questions utilisées
    if (usedQuestionIds.size >= testQuestions.length - 3) {
      setUsedQuestionIds(new Set());
    }
    
    // Incrémenter l'index de question
    setCurrentQuestionIndex((prev) => prev + 1);
    
    // Filtrer les questions non utilisées et correspondant à la difficulté actuelle
    const filteredByDifficulty = testQuestions.filter(
      q => !usedQuestionIds.has(q.id) && q.difficulty === difficulty
    );
    
    // S'il n'y a plus de questions de cette difficulté, prendre n'importe quelle question non utilisée
    let nextQuestions = filteredByDifficulty.length > 0 
      ? filteredByDifficulty 
      : testQuestions.filter(q => !usedQuestionIds.has(q.id));
    
    // S'il n'y a plus de questions non utilisées, prendre n'importe quelle question
    if (nextQuestions.length === 0) {
      nextQuestions = testQuestions;
    }
    
    // Sélectionner une question aléatoire parmi les questions disponibles
    const nextQuestionIndex = Math.floor(Math.random() * nextQuestions.length);
    const nextQuestion = nextQuestions[nextQuestionIndex];
    
    // Marquer cette question comme utilisée
    setUsedQuestionIds(prev => {
      const newSet = new Set(prev);
      newSet.add(nextQuestion.id);
      return newSet;
    });
    
    // Initialiser le temps pour la prochaine question
    setTimeLeft(nextQuestion.timeLimit);
    
    // Redémarrer le timer pour la nouvelle question
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
  };

  // Calculer les résultats
  const calculateResults = (): TestResults => {
    // Obtenir les réponses données
    const answerEntries = Object.entries(answers);
    const totalQuestionsAnswered = answerEntries.length;
    const correctAnswers = answerEntries.filter(([_, answer]) => answer.isCorrect).length;
    const totalResponseTime = answerEntries.reduce((acc, [_, answer]) => acc + answer.responseTime, 0);
    const averageResponseTime = totalQuestionsAnswered > 0 
      ? totalResponseTime / totalQuestionsAnswered 
      : 0;
    
    // Calculer les scores par catégorie
    const categoryCounts: {[key: string]: {correct: number, total: number}} = {};
    
    collectedAnswers.forEach(answer => {
      if (!categoryCounts[answer.category]) {
        categoryCounts[answer.category] = { correct: 0, total: 0 };
      }
      
      categoryCounts[answer.category].total += 1;
      
      if (answer.isCorrect) {
        categoryCounts[answer.category].correct += 1;
      }
    });
    
    const categoryScores: {[key: string]: {score: number, total: number}} = {};
    
    Object.entries(categoryCounts).forEach(([category, counts]) => {
      categoryScores[category] = {
        score: counts.total > 0 ? (counts.correct / counts.total) * 100 : 0,
        total: counts.total
      };
    });
    
    // Déterminer la catégorie la plus forte et la plus faible
    let strongestCategory: string | undefined;
    let weakestCategory: string | undefined;
    
    if (Object.keys(categoryScores).length > 0) {
      const sortedCategories = Object.entries(categoryScores)
        .filter(([_, data]) => data.total >= 2) // Au moins 2 questions pour être significatif
        .sort((a, b) => b[1].score - a[1].score);
      
      strongestCategory = sortedCategories.length > 0 ? sortedCategories[0][0] : undefined;
      weakestCategory = sortedCategories.length > 1 ? sortedCategories[sortedCategories.length - 1][0] : undefined;
    }
    
    // Calculer le score final (pourcentage de bonnes réponses)
    const score = totalQuestionsAnswered > 0 
      ? (correctAnswers / totalQuestionsAnswered) * 100 
      : 0;
    
    return {
      score,
      totalQuestions: totalQuestionsAnswered,
      correctAnswers,
      averageResponseTime,
      categoryScores,
      strongestCategory,
      weakestCategory
    };
  };

  // Terminer le test
  const finishTest = async () => {
    // Arrêter tous les timers
    if (timer) {
      clearInterval(timer);
      setTimer(null);
    }
    
    setIsFinished(true);
    
    // Calculer les résultats de base
    const calculatedResults = calculateResults();
    
    // Indiquer le chargement pendant l'analyse IA
    setLoading(true);
    
    try {
      // Envoyer les données collectées pour l'analyse IA
      const response = await fetch('/api/amoa/reflex-test/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers: collectedAnswers,
          baseResults: calculatedResults
        }),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'analyse IA');
      }
      
      // Récupérer l'analyse IA
      const aiAnalysis = await response.json();
      
      // Mettre à jour les résultats avec l'analyse IA
      setResults({
        ...calculatedResults,
        aiEvaluation: aiAnalysis.analysis
      });
      
    } catch (error) {
      console.error('Erreur lors de l\'analyse IA:', error);
      
      // Afficher les résultats sans l'analyse IA
      setResults(calculatedResults);
      
      // Afficher un message d'erreur
      toast({
        title: "Analyse IA indisponible",
        description: "L'analyse détaillée n'a pas pu être générée. Les résultats basiques sont affichés.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
    
    // Afficher une notification pour le score
    setTimeout(() => {
      const scoreMessage = calculatedResults.score >= 70 
        ? "Excellent travail ! " 
        : calculatedResults.score >= 50 
          ? "Bon travail. " 
          : "Continuez vos efforts. ";
          
      toast({
        title: `Test terminé - Score: ${calculatedResults.score.toFixed(0)}%`,
        description: `${scoreMessage}Consultez vos résultats détaillés.`,
        variant: calculatedResults.score >= 70 
          ? "default" 
          : calculatedResults.score >= 50 
            ? "default" 
            : "default"
      });
    }, 500);
    
    // Passer à l'onglet des résultats
    setActiveTab("results");
  };

  // Nettoyer les timers au démontage du composant
  useEffect(() => {
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [timer]);

  // Rendu du composant
  return (
    <HomeLayout>
      <div className="container py-8 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <Card className="border-gray-800 bg-gray-900/70 shadow-xl">
            <CardHeader className="border-b border-gray-800 bg-gray-900/50 px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Brain className="h-6 w-6 text-blue-400" />
                  <CardTitle className="text-xl font-bold text-white">Test de Réflexes AMOA</CardTitle>
                </div>
                <Link href="/amoa-mode-selection">
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour
                  </Button>
                </Link>
              </div>
            </CardHeader>
            
            <Tabs 
              defaultValue="intro" 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3 bg-gray-900/90 border-b border-gray-800 rounded-none px-6 h-14">
                <TabsTrigger 
                  value="intro" 
                  disabled={isStarted && !isFinished}
                  className={cn(
                    "rounded-none data-[state=active]:border-b-2 border-blue-500 text-gray-400 data-[state=active]:text-blue-400 data-[state=active]:shadow-none"
                  )}
                >
                  <Info className="mr-2 h-4 w-4" />
                  Introduction
                </TabsTrigger>
                <TabsTrigger 
                  value="test" 
                  disabled={!isStarted || isFinished}
                  className={cn(
                    "rounded-none data-[state=active]:border-b-2 border-blue-500 text-gray-400 data-[state=active]:text-blue-400 data-[state=active]:shadow-none"
                  )}
                >
                  <Clock className="mr-2 h-4 w-4" />
                  Test en cours
                </TabsTrigger>
                <TabsTrigger 
                  value="results" 
                  disabled={!isFinished}
                  className={cn(
                    "rounded-none data-[state=active]:border-b-2 border-blue-500 text-gray-400 data-[state=active]:text-blue-400 data-[state=active]:shadow-none"
                  )}
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Résultats
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="intro" className="p-0">
                <CardContent className="p-6 space-y-6">
                  <div className="bg-gradient-to-r from-blue-900/20 to-indigo-900/20 rounded-lg p-6 border border-blue-900/30">
                    <h2 className="text-2xl font-bold text-white mb-3">Testez vos réflexes AMOA</h2>
                    <p className="text-gray-300 mb-4">
                      Ce test évalue votre capacité à réagir rapidement aux situations typiques rencontrées par un AMOA. 
                      Répondez aux questions dans le temps imparti et recevez une analyse détaillée de vos performances.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <h3 className="text-lg font-semibold text-blue-300 mb-2 flex items-center">
                          <TimerReset className="w-5 h-5 mr-2" />
                          Comment ça marche
                        </h3>
                        <ul className="space-y-1 text-gray-300 list-disc list-inside text-sm">
                          <li>Test composé de 15 questions à choix multiples</li>
                          <li>Chaque question a son propre chronomètre</li>
                          <li>La difficulté s'adapte selon vos performances</li>
                          <li>L'IA analyse vos résultats et vous donne un feedback détaillé</li>
                        </ul>
                      </div>

                      <div className="rounded-lg bg-black/20 p-4">
                        <div className="flex items-center mb-2">
                          <Trophy className="w-5 h-5 text-blue-400 mr-2" />
                          <h3 className="text-lg font-semibold text-white">Challenges</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <Badge className="flex justify-center bg-amber-900/40 text-amber-200 hover:bg-amber-900/60 py-2 border-none">
                            <Clock className="w-4 h-4 mr-1" /> Questions chronométrées
                          </Badge>
                          <Badge className="flex justify-center bg-green-900/40 text-green-200 hover:bg-green-900/60 py-2 border-none">
                            <Sparkles className="w-4 h-4 mr-1" /> Adaptation intelligente
                          </Badge>
                          <Badge className="flex justify-center bg-blue-900/40 text-blue-200 hover:bg-blue-900/60 py-2 border-none">
                            <Brain className="w-4 h-4 mr-1" /> Analyse IA de vos performances
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  <CardFooter className="pt-0 pb-4 px-6">
                    <Button 
                      onClick={handleStartTest}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white"
                    >
                      Commencer le test
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </CardContent>
              </TabsContent>
              
              <TabsContent value="test" className="p-0">
                {currentQuestion && (
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center">
                          <Badge className="bg-blue-600 text-white border-none">
                            Question {questionCount}/{maxQuestions}
                          </Badge>
                          <Badge className="ml-2 bg-gray-800 text-gray-200 border-none">
                            {currentQuestion.difficulty === "facile" ? "Facile" : 
                             currentQuestion.difficulty === "moyen" ? "Intermédiaire" : "Expert"}
                          </Badge>
                        </div>
                        <div className="flex items-center">
                          <Clock className={cn(
                            "w-4 h-4 mr-1",
                            timeLeft < 5 ? "text-red-500 animate-pulse" :
                            timeLeft < 10 ? "text-amber-500" :
                            "text-green-500"
                          )} />
                          <span className={cn(
                            "text-sm font-medium",
                            timeLeft < 5 ? "text-red-500" :
                            timeLeft < 10 ? "text-amber-500" :
                            "text-green-500"
                          )}>
                            {timeLeft}s
                          </span>
                        </div>
                      </div>
                      <Progress 
                        value={(timeLeft / currentQuestion.timeLimit) * 100} 
                        className={cn(
                          "h-2",
                          timeLeft < 5 ? "bg-red-900/30" :
                          timeLeft < 10 ? "bg-amber-900/30" :
                          "bg-green-900/30"
                        )}
                      />
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold text-white mb-3">{currentQuestion.text}</h3>
                      
                      <div className="grid gap-3 mt-3">
                        {currentQuestion.options.map((option) => (
                          <Button
                            key={option.id}
                            variant={selectedOptionId === option.id ? (option.isCorrect ? "secondary" : "destructive") : "outline"}
                            className={cn(
                              "justify-start h-auto py-3 px-4 text-left bg-gray-800/50 hover:bg-gray-800/80 border-gray-700/50",
                              selectedOptionId === option.id && option.isCorrect && "bg-green-900/30 hover:bg-green-900/40 border-green-500/30",
                              selectedOptionId === option.id && !option.isCorrect && "bg-red-900/30 hover:bg-red-900/40 border-red-500/30",
                              selectedOptionId && selectedOptionId !== option.id && option.isCorrect && "border-green-500/80"
                            )}
                            disabled={selectedOptionId !== null}
                            onClick={() => handleSelectAnswer(option.id, option.isCorrect)}
                          >
                            {selectedOptionId === option.id ? (
                              option.isCorrect ? (
                                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-500 mr-2 shrink-0" />
                              )
                            ) : (
                              <div className="h-5 w-5 border-2 border-gray-600 rounded-full mr-2 shrink-0" />
                            )}
                            <span>{option.text}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    {showExplanation && currentQuestion.options.find(o => o.id === selectedOptionId)?.explanation && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-800/60 border border-gray-700/50 rounded-lg p-4 mb-6"
                      >
                        <div className="flex items-start">
                          <div className={cn(
                            "rounded-full p-1 mr-3 mt-0.5",
                            selectedOptionId && currentQuestion.options.find(o => o.id === selectedOptionId)?.isCorrect
                              ? "bg-green-900/30 text-green-500"
                              : "bg-red-900/30 text-red-500"
                          )}>
                            {selectedOptionId && currentQuestion.options.find(o => o.id === selectedOptionId)?.isCorrect
                              ? <CheckCircle className="h-5 w-5" />
                              : <AlertCircle className="h-5 w-5" />
                            }
                          </div>
                          <div>
                            <h4 className={cn(
                              "font-medium mb-1",
                              selectedOptionId && currentQuestion.options.find(o => o.id === selectedOptionId)?.isCorrect
                                ? "text-green-400"
                                : "text-red-400"
                            )}>
                              {feedbackMessage}
                            </h4>
                            <p className="text-gray-300 text-sm">
                              {currentQuestion.options.find(o => o.id === selectedOptionId)?.explanation}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                    
                    {selectedOptionId && (
                      <Button 
                        onClick={goToNextQuestion}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white"
                      >
                        {questionCount >= maxQuestions 
                          ? "Terminer le test et voir les résultats" 
                          : "Question suivante"}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                  </CardContent>
                )}
              </TabsContent>

              <TabsContent value="results" className="p-0">
                <CardContent className="p-6 space-y-5">
                  {loading ? (
                    <div className="space-y-4 py-4">
                      <div className="text-center">
                        <h3 className="text-xl font-medium text-white mb-2">Analyse de vos performances en cours...</h3>
                        <p className="text-gray-400 mb-4">L'IA analyse vos réponses pour générer un rapport détaillé</p>
                        <div className="flex justify-center">
                          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <Skeleton className="h-12 w-full bg-gray-800/50" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <Skeleton className="h-24 w-full bg-gray-800/50" />
                          <Skeleton className="h-24 w-full bg-gray-800/50" />
                        </div>
                        <Skeleton className="h-32 w-full bg-gray-800/50" />
                      </div>
                    </div>
                  ) : results ? (
                    <div className="space-y-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-4 flex-1">
                          <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                            <CheckCircle className="w-5 h-5 text-blue-400 mr-2" />
                            Résumé
                          </h3>
                          
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm text-gray-400 mb-1">Score global</p>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-2xl font-bold text-white">{results.score.toFixed(0)}%</span>
                                <span className="text-sm text-gray-400">{results.correctAnswers} / {results.totalQuestions} correctes</span>
                              </div>
                              <Progress 
                                value={results.score} 
                                className={cn(
                                  "h-2",
                                  results.score < 33 ? "bg-red-600" : 
                                  results.score < 66 ? "bg-amber-600" : 
                                  "bg-green-600"
                                )}
                              />
                            </div>
                            
                            <div>
                              <p className="text-sm text-gray-400 mb-1">Temps de réponse moyen</p>
                              <div className="flex items-center">
                                <Clock className="h-5 w-5 mr-2 text-blue-400" />
                                <span className="text-lg font-semibold text-white">{results.averageResponseTime.toFixed(1)} secondes</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-4 flex-1">
                          <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                            <BarChart3 className="w-5 h-5 text-blue-400 mr-2" />
                            Performance par catégorie
                          </h3>
                          
                          <div className="space-y-3">
                            {Object.entries(results.categoryScores).map(([category, data]) => (
                              <div key={category}>
                                <div className="flex justify-between items-center mb-1">
                                  <p className="text-sm text-gray-300">{category}</p>
                                  <span className="text-sm font-medium text-gray-300">{data.score.toFixed(0)}%</span>
                                </div>
                                <Progress 
                                  value={data.score} 
                                  className={cn(
                                    "h-2",
                                    data.score < 33 ? "bg-red-900/30" : 
                                    data.score < 66 ? "bg-amber-900/30" : 
                                    "bg-green-900/30"
                                  )}
                                />
                                <p className="text-xs text-gray-400 mt-1">{data.total} question{data.total > 1 ? 's' : ''}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      {/* Analyse IA du test */}
                      {results.aiEvaluation && (
                        <div className="bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border border-blue-800/30 rounded-lg p-5">
                            <div className="flex items-center mb-3">
                              <Brain className="w-6 h-6 text-blue-400 mr-2" />
                              <h3 className="text-xl font-bold text-white">Analyse IA</h3>
                            </div>
                            <p className="text-gray-300 mb-4">{results.aiEvaluation?.feedback}</p>
                            
                            {/* Badge */}
                            {results.aiEvaluation?.badge && (
                              <div className="flex justify-center mb-6">
                                <div className="flex flex-col items-center p-3 rounded-lg bg-gradient-to-br from-blue-900/40 to-indigo-900/40 border border-blue-700/30 max-w-xs">
                                  {results.aiEvaluation?.badge?.icon === "trophy" && <Trophy className="w-12 h-12 text-amber-400 mb-2" />}
                                  {results.aiEvaluation?.badge?.icon === "zap" && <Zap className="w-12 h-12 text-amber-400 mb-2" />}
                                  {results.aiEvaluation?.badge?.icon === "star" && <Award className="w-12 h-12 text-amber-400 mb-2" />}
                                  {results.aiEvaluation?.badge?.icon === "lightbulb" && <Lightbulb className="w-12 h-12 text-amber-400 mb-2" />}
                                  {results.aiEvaluation?.badge?.icon === "brain" && <Brain className="w-12 h-12 text-amber-400 mb-2" />}
                                  {results.aiEvaluation?.badge?.icon === "medal" && <Award className="w-12 h-12 text-amber-400 mb-2" />}
                                  {!["trophy", "zap", "star", "lightbulb", "brain", "medal"].includes(results.aiEvaluation?.badge?.icon || "") && 
                                    <Award className="w-12 h-12 text-amber-400 mb-2" />}
                                  <h4 className="text-lg font-bold text-white">{results.aiEvaluation?.badge?.name}</h4>
                                  <p className="text-gray-300 text-center text-sm">{results.aiEvaluation?.badge?.description}</p>
                                </div>
                              </div>
                            )}
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div className="rounded-md bg-green-900/20 p-3 border border-green-700/30">
                                <h4 className="text-md font-semibold text-green-300 mb-2 flex items-center">
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Points forts
                                </h4>
                                <ul className="space-y-1">
                                  {results.aiEvaluation?.strengths.map((strength, index) => (
                                    <li key={index} className="text-gray-300 text-sm flex items-start">
                                      <CheckCircle2 className="w-3 h-3 text-green-500 mr-2 mt-1 shrink-0" />
                                      <span>{strength}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              
                              <div className="rounded-md bg-red-900/20 p-3 border border-red-700/30">
                                <h4 className="text-md font-semibold text-red-300 mb-2 flex items-center">
                                  <AlertTriangle className="w-4 h-4 mr-2" />
                                  Points à améliorer
                                </h4>
                                <ul className="space-y-1">
                                  {results.aiEvaluation?.weaknesses.map((weakness, index) => (
                                    <li key={index} className="text-gray-300 text-sm flex items-start">
                                      <XCircle className="w-3 h-3 text-red-500 mr-2 mt-1 shrink-0" />
                                      <span>{weakness}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                            
                            {/* Section des suggestions d'amélioration */}
                            {results.aiEvaluation?.improvementSuggestions && results.aiEvaluation.improvementSuggestions.length > 0 && (
                              <div className="mb-4">
                                <h4 className="text-md font-semibold text-blue-300 mb-2 flex items-center">
                                  <Lightbulb className="w-4 h-4 mr-2" />
                                  Suggestions d'amélioration
                                </h4>
                                <ul className="space-y-1">
                                  {results.aiEvaluation.improvementSuggestions.map((suggestion, index) => (
                                    <li key={index} className="text-gray-300 text-sm flex items-start">
                                      <Sparkles className="w-3 h-3 text-amber-500 mr-2 mt-1 shrink-0" />
                                      <span>{suggestion}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Analyse professionnelle */}
                            {results.aiEvaluation?.professionalInsight && (
                              <div className="rounded-md bg-gray-800/40 p-3 border border-gray-700/30">
                                <h4 className="text-md font-semibold text-gray-200 mb-2 flex items-center">
                                  <Users className="w-4 h-4 mr-2" />
                                  Analyse professionnelle
                                </h4>
                                <p className="text-gray-300 text-sm">{results.aiEvaluation.professionalInsight}</p>
                              </div>
                            )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <p className="text-gray-400">Aucun résultat disponible</p>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="pt-0 pb-6 px-6">
                  <Button 
                    variant="outline" 
                    className="w-full bg-blue-900/20 hover:bg-blue-900/40 text-white border-blue-900/50" 
                    onClick={handleStartTest}
                  >
                    Refaire le test
                  </Button>
                </CardFooter>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </HomeLayout>
  );
};

export default TestDeReflexes;