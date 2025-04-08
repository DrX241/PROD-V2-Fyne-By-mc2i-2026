import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronRight, Brain, Award, RefreshCw, Lightbulb, Check, X, PenSquare, School, BrainCircuit, Shield, FileCheck, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from '@/lib/queryClient';

// Types pour les données du quiz
interface QuizQuestion {
  id: string;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: string;
  explanation: string;
  additionalInfo: string;
  difficulty: number;
  category: string;
  model?: string;
}

interface QuizEvaluation {
  isCorrect: boolean;
  feedbackTitle: string;
  feedback: string;
  learningPoints: string[];
  suggestionTitle: string;
  nextSteps: string[];
  recommendedLevel: number;
  recommendedCategory: string;
  model?: string;
}

interface QuizStats {
  totalQuestions: number;
  correctAnswers: number;
  streak: number;
  level: number;
  experience: number;
  questionsPerCategory: Record<string, number>;
  correctPerCategory: Record<string, number>;
}

// Données pour les catégories de quiz
const quizCategories = [
  { id: 'general', name: 'Général', icon: <Brain className="h-5 w-5" />, color: 'from-blue-600 to-blue-800' },
  { id: 'threats', name: 'Menaces', icon: <BrainCircuit className="h-5 w-5" />, color: 'from-red-600 to-red-800' },
  { id: 'defense', name: 'Défense', icon: <Shield className="h-5 w-5" />, color: 'from-green-600 to-green-800' },
  { id: 'compliance', name: 'Conformité', icon: <FileCheck className="h-5 w-5" />, color: 'from-amber-600 to-amber-800' },
  { id: 'security_culture', name: 'Culture Sécurité', icon: <Users className="h-5 w-5" />, color: 'from-purple-600 to-purple-800' },
];

// Niveaux de difficulté
const difficultyLevels = [
  { level: 1, name: 'Débutant', description: 'Notions de base accessibles à tous' },
  { level: 2, name: 'Intermédiaire', description: 'Connaissance générale en informatique' },
  { level: 3, name: 'Confirmé', description: 'Bases solides en cybersécurité' },
  { level: 4, name: 'Avancé', description: 'Connaissances techniques approfondies' },
  { level: 5, name: 'Expert', description: 'Maîtrise des concepts complexes' },
];

export default function CyberQuizChallengePage() {
  const { toast } = useToast();
  
  // États du jeu
  const [activeTab, setActiveTab] = useState('quiz');
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<QuizEvaluation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  
  // Options de quiz
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [selectedDifficulty, setSelectedDifficulty] = useState(1);
  const [useLearningPath, setUseLearningPath] = useState(true);
  
  // Statistiques du quiz
  const [stats, setStats] = useState<QuizStats>({
    totalQuestions: 0,
    correctAnswers: 0,
    streak: 0,
    level: 1,
    experience: 0,
    questionsPerCategory: { general: 0, threats: 0, defense: 0, compliance: 0, security_culture: 0 },
    correctPerCategory: { general: 0, threats: 0, defense: 0, compliance: 0, security_culture: 0 }
  });

  // Charger les statistiques du localStorage au démarrage
  useEffect(() => {
    const savedStats = localStorage.getItem('cyberQuizStats');
    const tutorialShown = localStorage.getItem('cyberQuizTutorialShown');
    
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
    
    if (tutorialShown) {
      setShowTutorial(false);
    }
  }, []);

  // Sauvegarder les statistiques dans le localStorage
  useEffect(() => {
    if (stats.totalQuestions > 0) {
      localStorage.setItem('cyberQuizStats', JSON.stringify(stats));
    }
  }, [stats]);

  // Fermer le tutoriel et enregistrer la préférence
  const closeTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem('cyberQuizTutorialShown', 'true');
  };

  // Générer une nouvelle question
  const generateQuestion = async () => {
    setIsLoading(true);
    setSelectedAnswer(null);
    setEvaluation(null);
    
    try {
      // Utilisez soit les valeurs recommandées, soit les valeurs sélectionnées
      const targetLevel = useLearningPath && evaluation ? evaluation.recommendedLevel : selectedDifficulty;
      const targetCategory = useLearningPath && evaluation ? evaluation.recommendedCategory : selectedCategory;
      
      const response = await apiRequest('/api/cyber/quiz/generate-question', {
        method: 'POST',
        body: JSON.stringify({
          level: targetLevel,
          category: targetCategory
        })
      });
      
      setCurrentQuestion(response);
      
      // Mettre à jour les statistiques de catégorie
      setStats(prev => {
        const questionsPerCategory = { ...prev.questionsPerCategory };
        questionsPerCategory[targetCategory] = (questionsPerCategory[targetCategory] || 0) + 1;
        
        return {
          ...prev,
          questionsPerCategory
        };
      });
      
    } catch (error) {
      console.error("Erreur lors de la génération de la question:", error);
      toast({
        title: "Erreur",
        description: "Impossible de générer une question. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Soumettre une réponse pour évaluation
  const submitAnswer = async () => {
    if (!currentQuestion || !selectedAnswer) return;
    
    setIsLoading(true);
    
    try {
      const response = await apiRequest('/api/cyber/quiz/evaluate-answer', {
        method: 'POST',
        body: JSON.stringify({
          question: currentQuestion,
          userAnswer: selectedAnswer,
          userLevel: stats.level
        })
      });
      
      setEvaluation(response);
      
      // Mettre à jour les statistiques
      setStats(prev => {
        const newStats = { ...prev };
        newStats.totalQuestions++;
        
        if (response.isCorrect) {
          newStats.correctAnswers++;
          newStats.streak++;
          newStats.experience += 10 * selectedDifficulty;
          
          // Mettre à jour les statistiques par catégorie
          const correctPerCategory = { ...prev.correctPerCategory };
          correctPerCategory[currentQuestion.category] = (correctPerCategory[currentQuestion.category] || 0) + 1;
          newStats.correctPerCategory = correctPerCategory;
          
          // Niveau progressif basé sur l'expérience
          if (newStats.experience >= newStats.level * 50) {
            newStats.level++;
            toast({
              title: "Niveau supérieur!",
              description: `Vous avez atteint le niveau ${newStats.level}!`,
              variant: "default"
            });
          }
        } else {
          newStats.streak = 0;
        }
        
        return newStats;
      });
      
    } catch (error) {
      console.error("Erreur lors de l'évaluation de la réponse:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'évaluer votre réponse. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Réinitialiser les statistiques
  const resetStats = () => {
    setStats({
      totalQuestions: 0,
      correctAnswers: 0,
      streak: 0,
      level: 1,
      experience: 0,
      questionsPerCategory: { general: 0, threats: 0, defense: 0, compliance: 0, security_culture: 0 },
      correctPerCategory: { general: 0, threats: 0, defense: 0, compliance: 0, security_culture: 0 }
    });
    
    toast({
      title: "Statistiques réinitialisées",
      description: "Toutes vos statistiques ont été remises à zéro.",
      variant: "default"
    });
  };

  return (
    <div className="h-screen bg-gradient-to-b from-blue-900 via-slate-900 to-black overflow-y-auto">
      {/* Tutoriel / Introduction */}
      <Dialog open={showTutorial} onOpenChange={setShowTutorial}>
        <DialogContent className="bg-slate-900 text-white border-blue-500 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl text-blue-400 flex items-center">
              <School className="mr-2 h-6 w-6" /> Bienvenue au Cyber Quiz Challenge
            </DialogTitle>
            <DialogDescription className="text-slate-300">
              Testez et améliorez vos connaissances en cybersécurité avec notre quiz interactif alimenté par l'IA.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 my-4 text-slate-300">
            <div className="bg-blue-950/30 p-4 rounded-lg">
              <h3 className="text-blue-400 font-medium mb-2 flex items-center">
                <BrainCircuit className="mr-2 h-5 w-5" /> Quiz adaptatif
              </h3>
              <p>L'IA adapte les questions à votre niveau et analyse vos réponses pour vous offrir un parcours d'apprentissage personnalisé.</p>
            </div>
            
            <div className="bg-blue-950/30 p-4 rounded-lg">
              <h3 className="text-blue-400 font-medium mb-2 flex items-center">
                <Shield className="mr-2 h-5 w-5" /> Catégories variées
              </h3>
              <p>Explorez différents domaines de la cybersécurité: concepts généraux, menaces, défense, conformité et culture de sécurité.</p>
            </div>
            
            <div className="bg-blue-950/30 p-4 rounded-lg">
              <h3 className="text-blue-400 font-medium mb-2 flex items-center">
                <Award className="mr-2 h-5 w-5" /> Progression et statistiques
              </h3>
              <p>Suivez votre évolution avec des statistiques détaillées et gagnez des niveaux en réussissant les questions.</p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="default" onClick={closeTutorial}>
              Commencer le quiz
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Barre de navigation */}
      <header className="py-4 px-6 flex justify-between items-center bg-slate-900/40 backdrop-blur-sm">
        <Link href="/cyber/arcade" className="text-blue-400 hover:text-blue-300 transition flex items-center">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Retour à Cyber Arcade
        </Link>
        
        <h1 className="text-xl font-bold text-white">Cyber Quiz Challenge</h1>
        
        <div className="flex items-center gap-2">
          {stats.streak > 0 && (
            <div className="bg-amber-600 text-white px-2 py-1 rounded text-xs font-medium flex items-center">
              <Award className="mr-1 h-3 w-3" />
              Série: {stats.streak}
            </div>
          )}
          
          <div className="bg-blue-800 text-white px-2 py-1 rounded text-xs font-medium flex items-center">
            <School className="mr-1 h-3 w-3" />
            Niveau {stats.level}
          </div>
        </div>
      </header>
      
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-slate-800 border border-slate-700 w-full mb-6">
            <TabsTrigger value="quiz" className="data-[state=active]:bg-blue-800">
              <PenSquare className="mr-2 h-4 w-4" />
              Quiz
            </TabsTrigger>
            <TabsTrigger value="stats" className="data-[state=active]:bg-blue-800">
              <Award className="mr-2 h-4 w-4" />
              Statistiques
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="quiz">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Panneau de configuration */}
              <Card className="md:col-span-1 bg-slate-800 border-slate-700 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Lightbulb className="mr-2 h-5 w-5 text-yellow-400" />
                    Options du Quiz
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Catégorie</label>
                    <Select 
                      value={selectedCategory} 
                      onValueChange={setSelectedCategory}
                      disabled={useLearningPath && evaluation !== null}
                    >
                      <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                        <SelectValue placeholder="Sélectionnez une catégorie" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-700 text-white">
                        {quizCategories.map(category => (
                          <SelectItem key={category.id} value={category.id} className="flex items-center">
                            {category.icon}
                            <span className="ml-2">{category.name}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Niveau de difficulté</label>
                    <Select 
                      value={selectedDifficulty.toString()} 
                      onValueChange={(value) => setSelectedDifficulty(parseInt(value))}
                      disabled={useLearningPath && evaluation !== null}
                    >
                      <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                        <SelectValue placeholder="Sélectionnez un niveau" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-700 text-white">
                        {difficultyLevels.map(level => (
                          <SelectItem key={level.level} value={level.level.toString()}>
                            Niveau {level.level}: {level.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="pt-2 flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="learningPath"
                      className="rounded border-slate-700 text-blue-600 focus:ring-blue-600"
                      checked={useLearningPath}
                      onChange={(e) => setUseLearningPath(e.target.checked)}
                    />
                    <label htmlFor="learningPath" className="text-sm text-slate-300">
                      Suivre le parcours d'apprentissage recommandé
                    </label>
                  </div>
                  
                  <Button
                    onClick={generateQuestion}
                    disabled={isLoading}
                    className="w-full mt-4 bg-blue-700 hover:bg-blue-600"
                  >
                    {currentQuestion ? (
                      <>
                        <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Nouvelle question
                      </>
                    ) : (
                      <>
                        <PenSquare className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Commencer le quiz
                      </>
                    )}
                  </Button>
                  
                  {evaluation && (
                    <div className="mt-4 p-3 rounded-lg bg-blue-900/30 border border-blue-800 text-sm text-slate-300">
                      <h4 className="text-blue-400 font-medium mb-1">Progression recommandée</h4>
                      <p>
                        <span className="text-blue-300">Niveau: </span>
                        {evaluation.recommendedLevel}/5
                      </p>
                      <p>
                        <span className="text-blue-300">Catégorie: </span>
                        {quizCategories.find(c => c.id === evaluation.recommendedCategory)?.name || evaluation.recommendedCategory}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Zone de question */}
              <Card className="md:col-span-2 bg-slate-800 border-slate-700 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <School className="mr-2 h-5 w-5 text-blue-400" />
                    {currentQuestion ? 'Question' : 'Cyber Quiz Challenge'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!currentQuestion ? (
                    <div className="text-center py-12 text-slate-300">
                      <BrainCircuit className="mx-auto h-16 w-16 text-blue-500 mb-4" />
                      <h3 className="text-xl font-medium text-white mb-2">Prêt à tester vos connaissances?</h3>
                      <p className="mb-6">Choisissez vos options et cliquez sur "Commencer le quiz" pour démarrer.</p>
                      <Button
                        onClick={generateQuestion}
                        disabled={isLoading}
                        className="bg-blue-700 hover:bg-blue-600"
                      >
                        <PenSquare className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Commencer le quiz
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Affichage des métadonnées de la question */}
                      <div className="flex justify-between text-xs text-slate-400 mb-2">
                        <div className="flex items-center">
                          <span className="bg-blue-900/50 px-2 py-1 rounded">
                            {quizCategories.find(c => c.id === currentQuestion.category)?.name || currentQuestion.category}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="bg-blue-900/50 px-2 py-1 rounded">
                            Niveau {currentQuestion.difficulty}
                          </span>
                        </div>
                      </div>
                      
                      {/* Question */}
                      <div className="bg-slate-900 p-5 rounded-lg">
                        <h3 className="text-lg font-medium text-white mb-4">{currentQuestion.question}</h3>
                        
                        {/* Options de réponse */}
                        <div className="space-y-3 mt-4">
                          {Object.entries(currentQuestion.options).map(([key, value]) => {
                            const isSelected = selectedAnswer === key;
                            const isCorrect = evaluation && key === currentQuestion.correctAnswer;
                            const isIncorrect = evaluation && isSelected && !isCorrect;
                            
                            return (
                              <button
                                key={key}
                                onClick={() => !evaluation && setSelectedAnswer(key)}
                                disabled={!!evaluation}
                                className={`w-full text-left p-3 rounded-lg transition-all ${
                                  isSelected
                                    ? isCorrect
                                      ? 'bg-green-700 text-white border-2 border-green-500'
                                      : isIncorrect
                                      ? 'bg-red-700 text-white border-2 border-red-500'
                                      : 'bg-blue-700 text-white border-2 border-blue-500'
                                    : 'bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700'
                                } ${evaluation && key === currentQuestion.correctAnswer ? 'ring-2 ring-green-500' : ''}`}
                              >
                                <div className="flex items-center">
                                  <span className="font-medium mr-2">{key}.</span>
                                  <span>{value}</span>
                                  
                                  {evaluation && (
                                    <>
                                      {key === currentQuestion.correctAnswer && (
                                        <Check className="ml-auto h-5 w-5 text-green-400" />
                                      )}
                                      
                                      {isIncorrect && (
                                        <X className="ml-auto h-5 w-5 text-red-400" />
                                      )}
                                    </>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      
                      {/* Bouton de soumission */}
                      {!evaluation && (
                        <Button
                          onClick={submitAnswer}
                          disabled={!selectedAnswer || isLoading}
                          className="w-full mt-4 bg-blue-700 hover:bg-blue-600"
                        >
                          Valider ma réponse
                        </Button>
                      )}
                      
                      {/* Feedback d'évaluation */}
                      <AnimatePresence>
                        {evaluation && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className={`mt-6 p-5 rounded-lg ${
                              evaluation.isCorrect ? 'bg-green-900/30 border border-green-800' : 'bg-red-900/30 border border-red-800'
                            }`}
                          >
                            <h3 className={`text-lg font-medium mb-3 ${evaluation.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                              {evaluation.feedbackTitle}
                            </h3>
                            
                            <p className="text-slate-300 mb-4">{evaluation.feedback}</p>
                            
                            <div className="bg-slate-900/50 p-3 rounded-lg mb-4">
                              <h4 className="text-blue-400 font-medium mb-2">Points clés à retenir</h4>
                              <ul className="space-y-1 text-sm text-slate-300">
                                {evaluation.learningPoints.map((point, index) => (
                                  <li key={index} className="flex items-start">
                                    <span className="text-blue-400 mr-2">•</span>
                                    {point}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            {/* Explication détaillée */}
                            <div className="bg-slate-900/50 p-3 rounded-lg mb-4">
                              <h4 className="text-blue-400 font-medium mb-2">Explication détaillée</h4>
                              <p className="text-sm text-slate-300">{currentQuestion.explanation}</p>
                              
                              {currentQuestion.additionalInfo && (
                                <div className="mt-3 pt-3 border-t border-slate-700">
                                  <p className="text-sm text-slate-400 italic">{currentQuestion.additionalInfo}</p>
                                </div>
                              )}
                            </div>
                            
                            <div className="bg-slate-900/50 p-3 rounded-lg">
                              <h4 className="text-blue-400 font-medium mb-2">{evaluation.suggestionTitle}</h4>
                              <ul className="space-y-1 text-sm text-slate-300">
                                {evaluation.nextSteps.map((step, index) => (
                                  <li key={index} className="flex items-start">
                                    <ChevronRight className="h-4 w-4 text-blue-400 mr-1 shrink-0 mt-0.5" />
                                    {step}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            <div className="mt-6 flex flex-col sm:flex-row gap-3">
                              <Button
                                onClick={generateQuestion}
                                className="flex-1 bg-blue-700 hover:bg-blue-600"
                              >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Question suivante
                              </Button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="stats">
            <Card className="bg-slate-800 border-slate-700 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Award className="mr-2 h-5 w-5 text-yellow-400" />
                  Mes Statistiques
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-slate-900 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-slate-400 mb-1">Niveau actuel</h3>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-white">{stats.level}</span>
                      <School className="h-8 w-8 text-blue-500" />
                    </div>
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>{stats.experience} XP</span>
                        <span>{stats.level * 50} XP</span>
                      </div>
                      <Progress value={(stats.experience / (stats.level * 50)) * 100} className="h-2 bg-slate-700" indicatorClassName="bg-blue-600" />
                    </div>
                  </div>
                  
                  <div className="bg-slate-900 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-slate-400 mb-1">Questions répondues</h3>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-white">{stats.totalQuestions}</span>
                      <PenSquare className="h-8 w-8 text-blue-500" />
                    </div>
                    {stats.totalQuestions > 0 && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                          <span>Taux de réussite</span>
                          <span>{Math.round((stats.correctAnswers / stats.totalQuestions) * 100)}%</span>
                        </div>
                        <Progress 
                          value={(stats.correctAnswers / stats.totalQuestions) * 100} 
                          className="h-2 bg-slate-700" 
                          indicatorClassName="bg-green-600" 
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-slate-900 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-slate-400 mb-1">Série actuelle</h3>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-white">{stats.streak}</span>
                      <Award className="h-8 w-8 text-amber-500" />
                    </div>
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Réponses correctes consécutives</span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-600" 
                          style={{ width: `${Math.min(stats.streak * 10, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <h3 className="text-lg font-medium text-white mb-3">Performance par catégorie</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quizCategories.map(category => {
                    const totalInCategory = stats.questionsPerCategory[category.id] || 0;
                    const correctInCategory = stats.correctPerCategory[category.id] || 0;
                    const successRate = totalInCategory > 0 ? (correctInCategory / totalInCategory) * 100 : 0;
                    
                    return (
                      <div key={category.id} className="bg-slate-900 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <div className={`p-2 rounded-full bg-gradient-to-r ${category.color} mr-3`}>
                              {category.icon}
                            </div>
                            <span className="font-medium text-white">{category.name}</span>
                          </div>
                          <span className="text-slate-400 text-sm">{totalInCategory} questions</span>
                        </div>
                        
                        {totalInCategory > 0 ? (
                          <>
                            <div className="flex justify-between text-xs text-slate-400 mb-1">
                              <span>{correctInCategory} correctes</span>
                              <span>{Math.round(successRate)}%</span>
                            </div>
                            <Progress 
                              value={successRate} 
                              className="h-2 bg-slate-700" 
                              indicatorClassName={`bg-gradient-to-r ${category.color}`} 
                            />
                          </>
                        ) : (
                          <div className="text-xs text-slate-400">Aucune question répondue</div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-6 flex justify-end">
                  <Button variant="outline" onClick={resetStats} className="text-red-500 border-red-500 hover:bg-red-950">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Réinitialiser les statistiques
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}