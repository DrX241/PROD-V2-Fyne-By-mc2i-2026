import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Shield, MailQuestion, KeyRound, Database, Smartphone, Share2, 
  AlertTriangle, Zap, Award, CheckCircle, XCircle, ChevronRight, Gift, Trophy,
  Star, Lock, FileQuestion, BellRing, Info, Target, Flag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useTheme } from '@/contexts/ThemeContext';
import HomeLayout from '@/components/layout/HomeLayout';
import PageTitle from '@/components/utils/PageTitle';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

// Types pour le système de gamification
interface GameStat {
  id: string;
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  unlocked: boolean;
  points: number;
}

// Définition des types pour nos contenus d'apprentissage
interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  points: number;
}

interface ScenarioStep {
  description: string;
  options: string[];
  correctOption: number;
  feedback: {
    correct: string;
    incorrect: string;
  };
  points: number;
}

interface LearningLevel {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  learningObjectives: string[];
  difficulty: 'Débutant' | 'Intermédiaire' | 'Avancé';
  color: string;
  scenario: {
    title: string;
    context: string;
    steps: ScenarioStep[];
  };
  quiz: QuizQuestion[];
  resources: {
    title: string;
    source: string;
    url: string;
  }[];
  reward: {
    xp: number;
    badge: string;
  };
  unlockThreshold?: number; // Points requis pour débloquer ce niveau
}

// Composant pour afficher les étoiles de difficulté
const DifficultyStars: React.FC<{ level: 'Débutant' | 'Intermédiaire' | 'Avancé', isDark: boolean }> = ({ level, isDark }) => {
  const filledClass = isDark ? 'text-amber-400' : 'text-amber-500';
  const emptyClass = isDark ? 'text-slate-600' : 'text-slate-300';
  
  const getStars = () => {
    switch (level) {
      case 'Débutant': return [true, false, false];
      case 'Intermédiaire': return [true, true, false];
      case 'Avancé': return [true, true, true];
      default: return [false, false, false];
    }
  };
  
  const stars = getStars();
  
  return (
    <div className="flex">
      {stars.map((filled, i) => (
        <Star key={i} className={`h-4 w-4 ${filled ? filledClass : emptyClass}`} fill={filled ? 'currentColor' : 'none'} />
      ))}
    </div>
  );
};

// Composant pour un niveau d'apprentissage interactif
const InteractiveLearningLevel: React.FC<{
  level: LearningLevel;
  isDark: boolean;
  onComplete: (levelId: string, earnedXP: number) => void;
  gameState: GameState;
}> = ({ level, isDark, onComplete, gameState }) => {
  const [activeTab, setActiveTab] = useState("introduction");
  const [currentScenarioStep, setCurrentScenarioStep] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [scenarioComplete, setScenarioComplete] = useState(false);
  const [scenarioFeedback, setScenarioFeedback] = useState<string | null>(null);
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(Array(level.quiz.length).fill(null));
  const [quizComplete, setQuizComplete] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const { toast } = useToast();
  
  const totalScenarioPoints = level.scenario.steps.reduce((sum, step) => sum + step.points, 0);
  const totalQuizPoints = level.quiz.reduce((sum, question) => sum + question.points, 0);
  
  const handleScenarioOptionSelect = (optionIndex: number) => {
    setSelectedOption(optionIndex);
    
    const isCorrect = optionIndex === level.scenario.steps[currentScenarioStep].correctOption;
    setScenarioFeedback(
      isCorrect 
        ? level.scenario.steps[currentScenarioStep].feedback.correct
        : level.scenario.steps[currentScenarioStep].feedback.incorrect
    );
    
    if (isCorrect) {
      // Ajouter les points pour cette étape
      setEarnedPoints(prev => prev + level.scenario.steps[currentScenarioStep].points);
      
      if (currentScenarioStep < level.scenario.steps.length - 1) {
        setTimeout(() => {
          setCurrentScenarioStep(prev => prev + 1);
          setSelectedOption(null);
          setScenarioFeedback(null);
        }, 1500);
      } else {
        setTimeout(() => {
          setScenarioComplete(true);
          toast({
            title: "Scénario terminé !",
            description: `Vous avez gagné ${earnedPoints} points d'expérience !`,
            variant: "default",
          });
        }, 1500);
      }
    }
  };
  
  const handleQuizAnswerSelect = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...quizAnswers];
    newAnswers[questionIndex] = answerIndex;
    setQuizAnswers(newAnswers);
    
    // Ajouter des points si la réponse est correcte
    if (answerIndex === level.quiz[questionIndex].correctAnswer) {
      setEarnedPoints(prev => prev + level.quiz[questionIndex].points);
    }
  };
  
  const goToNextQuestion = () => {
    if (currentQuizQuestion < level.quiz.length - 1) {
      setCurrentQuizQuestion(prev => prev + 1);
    } else {
      // Calculer le score final
      let score = 0;
      quizAnswers.forEach((answer, index) => {
        if (answer === level.quiz[index].correctAnswer) {
          score++;
        }
      });
      setQuizScore(Math.round((score / level.quiz.length) * 100));
      setQuizComplete(true);
      
      // Notifier l'utilisateur des points gagnés
      toast({
        title: "Quiz terminé !",
        description: `Vous avez obtenu ${quizScore}% et gagné ${earnedPoints} points d'expérience !`,
        variant: "default",
      });
      
      // Niveau terminé - informer le parent
      onComplete(level.id, earnedPoints);
    }
  };
  
  const isQuizQuestionAnswered = quizAnswers[currentQuizQuestion] !== null;
  
  // Animation pour les points gagnés
  const pointsAnimation = {
    hidden: { opacity: 0, y: -20, scale: 0.8 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, scale: 1.2, transition: { duration: 0.3 } }
  };
  
  return (
    <Card className={`${isDark ? 'bg-slate-800 text-white' : 'bg-white'} mb-8 overflow-hidden border-t-4`} 
      style={{ borderTopColor: level.color }}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ backgroundColor: level.color }}>
            {level.icon}
          </div>
          <div className="flex-1">
            <CardTitle className={`text-xl ${isDark ? 'text-white' : 'text-blue-800'}`}>{level.title}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={isDark ? "outline" : "secondary"} className="font-normal">
                {level.difficulty}
              </Badge>
              <DifficultyStars level={level.difficulty} isDark={isDark} />
            </div>
          </div>
        </div>
        <CardDescription className={isDark ? 'text-slate-300' : 'text-slate-600'}>
          {level.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="introduction">Introduction</TabsTrigger>
            <TabsTrigger value="scenario">Scénario</TabsTrigger>
            <TabsTrigger value="quiz">Quiz</TabsTrigger>
          </TabsList>
          
          <TabsContent value="introduction">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-700/50' : 'bg-blue-50/50'} mb-6`}>
              <h3 className={`font-medium text-lg mb-2 ${isDark ? 'text-white' : 'text-blue-800'}`}>Objectifs d'apprentissage</h3>
              <ul className="list-disc pl-5 space-y-1">
                {level.learningObjectives.map((objective, index) => (
                  <li key={index} className={isDark ? 'text-slate-200' : 'text-slate-700'}>{objective}</li>
                ))}
              </ul>
            </div>
            
            <div className={`p-4 rounded-lg ${isDark ? 'bg-amber-900/20' : 'bg-amber-50'} border ${isDark ? 'border-amber-800/30' : 'border-amber-200'} mb-6`}>
              <div className="flex items-start gap-3">
                <Gift className={`h-5 w-5 mt-0.5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                <div>
                  <h3 className={`font-medium text-lg mb-1 ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>Récompenses à gagner</h3>
                  <p className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                    Terminez ce niveau pour gagner jusqu'à {level.reward.xp} XP et débloquer le badge "{gameState.badges.find(b => b.id === level.reward.badge)?.name}".
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className={`font-medium text-lg mb-2 ${isDark ? 'text-white' : 'text-blue-800'}`}>Ressources officielles</h3>
              <div className="space-y-3">
                {level.resources.map((resource, index) => (
                  <div key={index} className={`p-3 rounded border ${isDark ? 'border-slate-600 bg-slate-700/30' : 'border-slate-200 bg-slate-50'}`}>
                    <h4 className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{resource.title}</h4>
                    <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Source: {resource.source}</p>
                    <a 
                      href={resource.url} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-sm ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
                    >
                      Consulter la ressource →
                    </a>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <Button
                onClick={() => setActiveTab("scenario")}
                className={`${isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
              >
                Commencer le scénario interactif
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="scenario">
            {!scenarioComplete ? (
              <div className={`p-5 rounded-lg ${isDark ? 'bg-slate-700/50' : 'bg-blue-50/50'} mb-6`}>
                <h3 className={`font-bold text-lg mb-2 ${isDark ? 'text-white' : 'text-blue-800'}`}>{level.scenario.title}</h3>
                
                <p className={`mb-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{level.scenario.context}</p>
                
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      Progression du scénario
                    </span>
                    <span className={`text-sm font-medium ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                      Étape {currentScenarioStep + 1}/{level.scenario.steps.length}
                    </span>
                  </div>
                  <Progress value={((currentScenarioStep) / level.scenario.steps.length) * 100} className="h-2" />
                </div>
                
                <div className={`p-4 rounded-lg mb-4 ${isDark ? 'bg-slate-600/70' : 'bg-white border border-slate-200'}`}>
                  <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Étape {currentScenarioStep + 1}: {level.scenario.steps[currentScenarioStep].points} points à gagner
                  </h4>
                  <p className={isDark ? 'text-slate-200' : 'text-slate-700'}>
                    {level.scenario.steps[currentScenarioStep].description}
                  </p>
                </div>
                
                <div className="space-y-3 mb-4">
                  {level.scenario.steps[currentScenarioStep].options.map((option, index) => (
                    <div 
                      key={index}
                      onClick={() => selectedOption === null && handleScenarioOptionSelect(index)}
                      className={`p-3 rounded-lg cursor-pointer border transition-colors
                        ${selectedOption === index 
                          ? selectedOption === level.scenario.steps[currentScenarioStep].correctOption
                            ? isDark ? 'bg-green-900/50 border-green-700' : 'bg-green-100 border-green-400'
                            : isDark ? 'bg-red-900/50 border-red-700' : 'bg-red-100 border-red-400'
                          : isDark ? 'border-slate-600 hover:border-blue-500 bg-slate-700/30' : 'border-slate-200 hover:border-blue-500 bg-slate-50'
                        }
                      `}
                    >
                      <p className={isDark ? 'text-slate-200' : 'text-slate-700'}>
                        {option}
                      </p>
                    </div>
                  ))}
                </div>
                
                {scenarioFeedback && (
                  <div className={`p-3 rounded-lg mb-4 ${
                    selectedOption === level.scenario.steps[currentScenarioStep].correctOption
                      ? isDark ? 'bg-green-900/30 border border-green-700' : 'bg-green-50 border border-green-200'
                      : isDark ? 'bg-red-900/30 border border-red-700' : 'bg-red-50 border border-red-200'
                  }`}>
                    <p className={`
                      ${selectedOption === level.scenario.steps[currentScenarioStep].correctOption
                        ? isDark ? 'text-green-300' : 'text-green-700'
                        : isDark ? 'text-red-300' : 'text-red-700'
                      }
                    `}>
                      {scenarioFeedback}
                    </p>
                    
                    {selectedOption === level.scenario.steps[currentScenarioStep].correctOption && (
                      <AnimatePresence>
                        <motion.div
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          variants={pointsAnimation}
                          className="mt-2 flex items-center gap-2"
                        >
                          <Zap className={isDark ? "text-amber-400 h-4 w-4" : "text-amber-600 h-4 w-4"} />
                          <span className={isDark ? "text-amber-400 font-medium" : "text-amber-600 font-medium"}>
                            +{level.scenario.steps[currentScenarioStep].points} XP
                          </span>
                        </motion.div>
                      </AnimatePresence>
                    )}
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Points accumulés: {earnedPoints} / {totalScenarioPoints + totalQuizPoints}
                  </div>
                </div>
              </div>
            ) : (
              <div className={`p-5 rounded-lg ${isDark ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'} border mb-6`}>
                <div className="flex justify-center mb-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDark ? 'bg-green-800' : 'bg-green-100'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? 'bg-green-700' : 'bg-green-500'}`}>
                      <span className={`text-xl font-bold ${isDark ? 'text-green-300' : 'text-white'}`}>✓</span>
                    </div>
                  </div>
                </div>
                <h3 className={`text-center font-bold text-lg mb-2 ${isDark ? 'text-green-300' : 'text-green-700'}`}>
                  Scénario terminé avec succès !
                </h3>
                <p className={`text-center mb-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Vous avez terminé ce scénario interactif avec brio ! Vous avez gagné {earnedPoints} XP dans ce niveau jusqu'à présent.
                </p>
                <div className="flex justify-center">
                  <Button
                    onClick={() => setActiveTab("quiz")}
                    className={`${isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                  >
                    Passer au quiz
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="quiz">
            {!quizComplete ? (
              <div className={`p-5 rounded-lg ${isDark ? 'bg-slate-700/50' : 'bg-blue-50/50'} mb-6`}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className={`font-medium ${isDark ? 'text-white' : 'text-blue-800'}`}>
                    Quiz d'évaluation ({level.quiz[currentQuizQuestion].points} XP)
                  </h3>
                  <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    Question {currentQuizQuestion + 1} sur {level.quiz.length}
                  </span>
                </div>
                
                <Progress value={(currentQuizQuestion / level.quiz.length) * 100} className="mb-6" />
                
                <div className={`p-4 rounded-lg mb-4 ${isDark ? 'bg-slate-600/70' : 'bg-white border border-slate-200'}`}>
                  <h4 className={`font-medium mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {level.quiz[currentQuizQuestion].question}
                  </h4>
                  
                  <RadioGroup 
                    value={quizAnswers[currentQuizQuestion]?.toString() || ""}
                    className="space-y-3"
                  >
                    {level.quiz[currentQuizQuestion].options.map((option, index) => (
                      <div 
                        key={index}
                        className={`flex items-center space-x-2 p-3 rounded-lg border
                          ${isDark ? 'border-slate-600 bg-slate-700/30' : 'border-slate-200 bg-slate-50'}
                          ${quizAnswers[currentQuizQuestion] === index ? (
                            quizAnswers[currentQuizQuestion] === level.quiz[currentQuizQuestion].correctAnswer
                              ? isDark ? 'border-green-600 bg-green-900/20' : 'border-green-400 bg-green-50'
                              : isDark ? 'border-red-600 bg-red-900/20' : 'border-red-400 bg-red-50'
                          ) : ''}
                        `}
                      >
                        <RadioGroupItem 
                          value={index.toString()} 
                          id={`option-${index}`} 
                          onClick={() => handleQuizAnswerSelect(currentQuizQuestion, index)}
                        />
                        <Label 
                          htmlFor={`option-${index}`}
                          className={`flex-grow cursor-pointer ${isDark ? 'text-slate-200' : 'text-slate-700'}`}
                        >
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                
                {isQuizQuestionAnswered && (
                  <div className="mt-4">
                    <div className={`p-3 rounded-lg mb-4 ${
                      quizAnswers[currentQuizQuestion] === level.quiz[currentQuizQuestion].correctAnswer
                        ? isDark ? 'bg-green-900/30 border border-green-700' : 'bg-green-50 border border-green-200'
                        : isDark ? 'bg-red-900/30 border border-red-700' : 'bg-red-50 border border-red-200'
                    }`}>
                      <p className={`font-medium mb-1 ${
                        quizAnswers[currentQuizQuestion] === level.quiz[currentQuizQuestion].correctAnswer
                          ? isDark ? 'text-green-300' : 'text-green-700'
                          : isDark ? 'text-red-300' : 'text-red-700'
                      }`}>
                        {quizAnswers[currentQuizQuestion] === level.quiz[currentQuizQuestion].correctAnswer 
                          ? "Bonne réponse !" 
                          : "Réponse incorrecte"}
                      </p>
                      <p className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                        {level.quiz[currentQuizQuestion].explanation}
                      </p>
                      
                      {quizAnswers[currentQuizQuestion] === level.quiz[currentQuizQuestion].correctAnswer && (
                        <AnimatePresence>
                          <motion.div
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            variants={pointsAnimation}
                            className="mt-2 flex items-center gap-2"
                          >
                            <Zap className={isDark ? "text-amber-400 h-4 w-4" : "text-amber-600 h-4 w-4"} />
                            <span className={isDark ? "text-amber-400 font-medium" : "text-amber-600 font-medium"}>
                              +{level.quiz[currentQuizQuestion].points} XP
                            </span>
                          </motion.div>
                        </AnimatePresence>
                      )}
                    </div>
                    
                    <Button 
                      onClick={goToNextQuestion}
                      className={`w-full ${isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                    >
                      {currentQuizQuestion < level.quiz.length - 1 ? "Question suivante" : "Terminer le quiz"}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className={`p-5 rounded-lg ${isDark ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'} border mb-6`}>
                <div className="flex justify-center mb-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isDark ? 'bg-green-800' : 'bg-green-100'}`}>
                    <Trophy className={`h-8 w-8 ${isDark ? 'text-green-300' : 'text-green-600'}`} />
                  </div>
                </div>
                <h3 className={`text-center font-bold text-lg mb-2 ${isDark ? 'text-green-300' : 'text-green-700'}`}>
                  Félicitations ! Vous avez terminé le niveau !
                </h3>
                <p className={`text-center mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Score au quiz : {quizScore}%
                </p>
                <p className={`text-center mb-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Vous avez terminé ce niveau et gagné un total de {earnedPoints} XP.
                </p>
                
                <div className={`p-4 rounded-lg ${isDark ? 'bg-amber-900/30 border-amber-700/50' : 'bg-amber-50 border-amber-200'} border mb-4 flex items-center gap-3`}>
                  <Award className={isDark ? "text-amber-400 h-5 w-5" : "text-amber-600 h-5 w-5"} />
                  <div>
                    <p className={`font-medium ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                      Badge débloqué : {gameState.badges.find(b => b.id === level.reward.badge)?.name}
                    </p>
                    <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      {gameState.badges.find(b => b.id === level.reward.badge)?.description}
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-center gap-3">
                  <Link href="/cyber/learning/cyber-mastery">
                    <Button
                      variant="outline"
                      className={isDark ? 'border-slate-600 text-white' : ''}
                    >
                      Retour aux niveaux
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

// Composant pour afficher un niveau verrouillé
const LockedLevelCard: React.FC<{
  level: LearningLevel;
  isDark: boolean;
  currentPoints: number;
}> = ({ level, isDark, currentPoints }) => {
  return (
    <Card className={`${isDark ? 'bg-slate-800/60 text-white border-slate-700' : 'bg-slate-100 border-slate-200'} mb-8`}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-slate-700 text-slate-400`}>
            <Lock className="h-8 w-8" />
          </div>
          <div className="flex-1">
            <CardTitle className={`text-xl ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{level.title}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className={`font-normal ${isDark ? 'text-slate-500 border-slate-600' : 'text-slate-500 border-slate-300'}`}>
                {level.difficulty}
              </Badge>
              <DifficultyStars level={level.difficulty} isDark={isDark} />
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-700/30' : 'bg-slate-200/50'} mb-4`}>
          <div className="flex items-center gap-3 mb-3">
            <Lock className={`h-5 w-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
            <p className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Niveau verrouillé
            </p>
          </div>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Vous avez besoin de {level.unlockThreshold} XP pour débloquer ce niveau. (Il vous manque {level.unlockThreshold! - currentPoints} XP)
          </p>
        </div>
        
        <Progress 
          value={(currentPoints / level.unlockThreshold!) * 100} 
          className={`h-2 ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`} 
        />
      </CardContent>
    </Card>
  );
};

// Interface pour la feuille de personnage/progression
interface GameState {
  xp: number;
  level: number;
  completedLevels: string[];
  badges: Badge[];
  stats: GameStat[];
  rank: string;
}

// Niveaux de la gamification
const phishingLevel: LearningLevel = {
  id: "phishing",
  title: "Reconnaître et éviter le phishing",
  icon: <MailQuestion className="h-8 w-8 text-white" />,
  description: "Apprenez à identifier et à vous protéger contre les attaques de phishing et d'ingénierie sociale.",
  difficulty: "Débutant",
  color: "#3b82f6", // blue-500
  learningObjectives: [
    "Reconnaître les signes d'une tentative de phishing",
    "Vérifier l'authenticité des emails et messages",
    "Comprendre les techniques d'ingénierie sociale",
    "Protéger vos informations personnelles"
  ],
  scenario: {
    title: "Une journée au bureau",
    context: "Vous êtes employé(e) chez mc2i. Au cours d'une journée de travail normale, vous recevez plusieurs emails. Votre mission est d'identifier les tentatives de phishing et d'y répondre correctement.",
    steps: [
      {
        description: "Vous recevez un email de votre banque vous demandant de mettre à jour vos informations de compte en cliquant sur un lien. L'email contient le logo de la banque mais l'adresse d'expédition est 'securite-banque@mail-secure-service.com'. Que faites-vous ?",
        options: [
          "Je clique sur le lien et mets à jour mes informations comme demandé.",
          "Je vérifie l'adresse email de l'expéditeur, remarque qu'elle n'est pas officielle, et je supprime l'email.",
          "Je transfère l'email à un collègue pour avoir son avis.",
          "Je réponds à l'email pour demander plus d'informations."
        ],
        correctOption: 1,
        feedback: {
          correct: "Excellente décision ! L'adresse email de l'expéditeur n'appartient pas au domaine officiel de votre banque, c'est un signe classique de phishing.",
          incorrect: "Attention ! Cet email est une tentative de phishing. L'adresse de l'expéditeur n'est pas le domaine officiel de votre banque."
        },
        points: 10
      },
      {
        description: "Vous recevez un message Microsoft Teams d'un collègue que vous connaissez, mais avec qui vous n'interagissez pas souvent. Il vous écrit : \"Salut ! J'ai besoin de ton aide rapidement. Peux-tu m'envoyer les accès VPN de l'entreprise ? J'ai oublié les miens et j'ai une réunion client urgente. Merci !\" Que faites-vous ?",
        options: [
          "J'envoie immédiatement les informations d'accès pour aider mon collègue.",
          "Je lui suggère de contacter le support informatique qui pourra réinitialiser ses accès.",
          "J'appelle mon collègue sur son téléphone professionnel pour vérifier que c'est bien lui qui a fait la demande.",
          "Je lui envoie uniquement mon nom d'utilisateur, pas mon mot de passe."
        ],
        correctOption: 2,
        feedback: {
          correct: "Parfait ! Vérifier l'identité de la personne par un autre canal est la meilleure approche. Les attaquants peuvent usurper l'identité de vos collègues.",
          incorrect: "Ce message est suspect. Dans le doute, toujours vérifier l'identité de la personne via un autre canal (téléphone, en personne) avant de partager des informations sensibles."
        },
        points: 15
      },
      {
        description: "Vous recevez un appel téléphonique d'une personne se présentant comme un technicien du support informatique de mc2i. Elle dit qu'il y a eu une alerte de sécurité sur votre ordinateur et qu'elle a besoin de votre mot de passe Windows pour résoudre le problème à distance. Que faites-vous ?",
        options: [
          "Je lui donne mon mot de passe pour qu'il puisse résoudre rapidement le problème.",
          "Je lui demande son nom et je raccroche pour appeler le support informatique au numéro officiel.",
          "Je refuse de donner mon mot de passe mais propose de l'aider d'une autre manière.",
          "Je lui donne un mot de passe temporaire que je changerai plus tard."
        ],
        correctOption: 1,
        feedback: {
          correct: "Excellente décision ! Le support informatique ne vous demandera jamais votre mot de passe. Raccrocher et contacter directement le support au numéro officiel est la bonne pratique.",
          incorrect: "Attention ! Le support informatique légitime ne vous demandera jamais votre mot de passe, c'est une tentative d'hameçonnage vocal (vishing)."
        },
        points: 20
      }
    ]
  },
  quiz: [
    {
      question: "Lequel de ces éléments n'est PAS un signe d'email de phishing ?",
      options: [
        "Des fautes d'orthographe et de grammaire",
        "Un sentiment d'urgence ou des menaces",
        "L'utilisation du logo officiel de l'entreprise",
        "Une adresse d'expéditeur qui ressemble au domaine légitime mais avec des différences subtiles"
      ],
      correctAnswer: 2,
      explanation: "L'utilisation du logo officiel de l'entreprise n'est pas en soi un signe de phishing, car les emails légitimes l'utilisent aussi. Les attaquants peuvent facilement copier les logos. Les autres options sont des signes typiques de phishing.",
      points: 10
    },
    {
      question: "Quelle technique l'ingénierie sociale n'utilise-t-elle généralement PAS ?",
      options: [
        "Exploiter la peur ou l'urgence",
        "Se faire passer pour une figure d'autorité",
        "Offrir quelque chose de trop beau pour être vrai",
        "Utiliser des attaques par force brute sur les mots de passe"
      ],
      correctAnswer: 3,
      explanation: "L'ingénierie sociale exploite les faiblesses humaines, pas techniques. Les attaques par force brute sont des méthodes techniques pour deviner les mots de passe et ne relèvent pas de l'ingénierie sociale.",
      points: 10
    },
    {
      question: "Que devriez-vous faire si vous pensez avoir cliqué sur un lien de phishing ?",
      options: [
        "Ne rien faire et espérer qu'il n'y aura pas de conséquences",
        "Contacter immédiatement votre service informatique et changer vos mots de passe",
        "Éteindre votre ordinateur pour arrêter l'attaque",
        "Supprimer l'email pour effacer toute trace"
      ],
      correctAnswer: 1,
      explanation: "Il est crucial d'agir rapidement. Informer votre service informatique et changer vos mots de passe peut limiter les dégâts. Éteindre l'ordinateur ou supprimer l'email ne résout pas le problème si vous avez déjà cliqué sur le lien malveillant.",
      points: 15
    }
  ],
  resources: [
    {
      title: "Infographie sur le phishing",
      source: "ANSSI",
      url: "https://cyber.gouv.fr/sites/default/files/document/phishing_hameconnage_infographie_anssi.pdf"
    },
    {
      title: "Comment détecter un message malveillant",
      source: "CNIL",
      url: "https://www.cnil.fr/fr/phishing-detecter-un-message-malveillant"
    }
  ],
  reward: {
    xp: 100,
    badge: "phishing_expert"
  }
};

const passwordLevel: LearningLevel = {
  id: "passwords",
  title: "Gestion sécurisée des mots de passe",
  icon: <KeyRound className="h-8 w-8 text-white" />,
  description: "Apprenez à créer et gérer des mots de passe forts pour protéger vos comptes professionnels et personnels.",
  difficulty: "Débutant",
  color: "#10b981", // emerald-500
  learningObjectives: [
    "Créer des mots de passe forts et mémorables",
    "Comprendre l'importance de mots de passe uniques",
    "Utiliser un gestionnaire de mots de passe",
    "Sécuriser l'authentification avec la 2FA"
  ],
  scenario: {
    title: "Renforcer la sécurité des accès",
    context: "Vous êtes responsable de l'amélioration des pratiques de sécurité dans votre équipe. Vous devez prendre des décisions concernant la gestion des mots de passe et l'authentification.",
    steps: [
      {
        description: "Un nouveau stagiaire vous demande des conseils pour créer un bon mot de passe pour son compte professionnel. Quelle recommandation lui donnez-vous ?",
        options: [
          "Utiliser une combinaison de son nom et de sa date de naissance pour s'en souvenir facilement.",
          "Créer une phrase de passe longue et unique comme 'mc2i-CybersecuriteFormation2023!'",
          "Utiliser le même mot de passe que pour ses comptes personnels pour éviter les oublis.",
          "Choisir un mot simple mais le changer tous les jours."
        ],
        correctOption: 1,
        feedback: {
          correct: "Excellent conseil ! Une phrase de passe longue et unique est plus sécurisée et plus facile à mémoriser qu'un mot de passe court et complexe.",
          incorrect: "Cette approche n'est pas recommandée. Les mots de passe doivent être uniques, longs et difficiles à deviner, mais mémorisables."
        },
        points: 10
      },
      {
        description: "Votre équipe stocke actuellement ses mots de passe professionnels dans un document Excel partagé et protégé par mot de passe. Quelle alternative proposez-vous ?",
        options: [
          "Continuer avec le fichier Excel mais avec un mot de passe plus complexe.",
          "Noter les mots de passe sur papier et les garder dans un tiroir verrouillé.",
          "Déployer un gestionnaire de mots de passe professionnel pour toute l'équipe.",
          "Demander à chacun de mémoriser tous ses mots de passe sans les noter."
        ],
        correctOption: 2,
        feedback: {
          correct: "Parfait ! Un gestionnaire de mots de passe professionnel est la solution la plus sécurisée. Il chiffre les données et permet de générer et stocker des mots de passe uniques pour chaque service.",
          incorrect: "Le stockage des mots de passe dans un document Excel partagé est risqué. Un gestionnaire de mots de passe dédié offre un niveau de sécurité bien supérieur."
        },
        points: 15
      },
      {
        description: "Vous configurez un nouveau système d'authentification pour accéder aux applications critiques de l'entreprise. Quelle option privilégiez-vous ?",
        options: [
          "Authentification simple par mot de passe avec rotation obligatoire tous les 30 jours.",
          "Authentification à deux facteurs (2FA) avec application d'authentification.",
          "Authentification par mot de passe uniquement, mais avec 12 caractères minimum.",
          "Authentification unique (SSO) sans protection supplémentaire."
        ],
        correctOption: 1,
        feedback: {
          correct: "Excellente décision ! L'authentification à deux facteurs (2FA) avec une application d'authentification offre une protection nettement supérieure à un simple mot de passe.",
          incorrect: "L'authentification à deux facteurs (2FA) est fortement recommandée pour les applications critiques, car elle ajoute une couche de sécurité supplémentaire."
        },
        points: 20
      }
    ]
  },
  quiz: [
    {
      question: "Pourquoi est-il risqué d'utiliser le même mot de passe pour plusieurs comptes ?",
      options: [
        "Cela complique l'utilisation d'un gestionnaire de mots de passe.",
        "Les mots de passe réutilisés sont plus faciles à oublier.",
        "Si un compte est compromis, tous les autres le sont potentiellement aussi.",
        "Les sites web détectent et bloquent les mots de passe réutilisés."
      ],
      correctAnswer: 2,
      explanation: "La réutilisation des mots de passe crée un effet domino : si un service subit une fuite de données et que votre mot de passe est compromis, les attaquants essaieront d'utiliser ces mêmes identifiants sur d'autres sites.",
      points: 10
    },
    {
      question: "Parmi ces options, laquelle constitue le mot de passe le plus sécurisé ?",
      options: [
        "Mc2i2023",
        "P@ssw0rd!",
        "LeChienBleuMange5GateauxRouges!",
        "azerty12345"
      ],
      correctAnswer: 2,
      explanation: "Une phrase de passe longue est plus sécurisée que des mots de passe courts, même avec des caractères spéciaux. 'LeChienBleuMange5GateauxRouges!' combine longueur, complexité et mémorisation facile.",
      points: 10
    },
    {
      question: "Quel est l'avantage principal d'utiliser un gestionnaire de mots de passe ?",
      options: [
        "Il permet de partager facilement ses mots de passe avec ses collègues.",
        "Il permet d'utiliser le même mot de passe partout en toute sécurité.",
        "Il génère et stocke des mots de passe uniques et complexes pour chaque service.",
        "Il évite d'avoir à utiliser l'authentification à deux facteurs (2FA)."
      ],
      correctAnswer: 2,
      explanation: "Un gestionnaire de mots de passe vous permet de générer et stocker des mots de passe uniques et complexes pour chaque service, vous évitant de devoir les mémoriser tout en renforçant considérablement votre sécurité.",
      points: 15
    }
  ],
  resources: [
    {
      title: "Recommandations pour des mots de passe sécurisés",
      source: "ANSSI",
      url: "https://www.ssi.gouv.fr/guide/mot-de-passe/"
    },
    {
      title: "Sécuriser ses mots de passe",
      source: "CNIL",
      url: "https://www.cnil.fr/fr/securiser-ses-mots-de-passe"
    }
  ],
  reward: {
    xp: 100,
    badge: "password_master"
  },
  unlockThreshold: 0
};

const dataProtectionLevel: LearningLevel = {
  id: "data-protection",
  title: "Protection des données sensibles",
  icon: <Database className="h-8 w-8 text-white" />,
  description: "Apprenez à protéger les données sensibles de l'entreprise et à respecter les exigences du RGPD.",
  difficulty: "Intermédiaire",
  color: "#8b5cf6", // violet-500
  learningObjectives: [
    "Identifier les données sensibles et confidentielles",
    "Appliquer les bonnes pratiques de chiffrement",
    "Comprendre les obligations du RGPD",
    "Gérer les incidents de violation de données"
  ],
  scenario: {
    title: "Gestion d'un incident de sécurité",
    context: "Vous travaillez sur un projet client contenant des données personnelles. Un incident de sécurité se produit et vous devez réagir de manière appropriée.",
    steps: [
      {
        description: "Vous devez envoyer un document contenant des données clients à un partenaire externe. Comment procédez-vous ?",
        options: [
          "J'envoie le document par email en pièce jointe standard.",
          "Je partage le document via un service cloud public sans protection.",
          "Je chiffre le document avec un mot de passe fort et j'envoie le mot de passe par un canal différent.",
          "Je laisse cette tâche à un collègue car je ne suis pas autorisé à partager ces données."
        ],
        correctOption: 2,
        feedback: {
          correct: "Excellente approche ! Chiffrer le document et envoyer le mot de passe par un autre canal (SMS, appel téléphonique) est une bonne pratique de sécurité pour le partage de données sensibles.",
          incorrect: "Les données clients sont sensibles et doivent être protégées lors de leur transmission. Le chiffrement est une mesure de protection indispensable."
        },
        points: 15
      },
      {
        description: "Vous découvrez qu'une base de données client que vous gérez a été potentiellement exposée suite à une erreur de configuration. Quelle devrait être votre première action ?",
        options: [
          "Résoudre discrètement le problème technique sans en parler à personne.",
          "Informer immédiatement votre responsable et le DPO (Délégué à la Protection des Données) de l'entreprise.",
          "Contacter directement tous les clients potentiellement affectés.",
          "Attendre de voir si quelqu'un remarque le problème avant d'agir."
        ],
        correctOption: 1,
        feedback: {
          correct: "C'est la bonne démarche ! Informer rapidement votre responsable et le DPO permet d'évaluer la gravité de l'incident et de déclencher les procédures appropriées, notamment la notification à la CNIL si nécessaire.",
          incorrect: "Une violation potentielle de données doit être signalée en interne immédiatement. Les incidents doivent être traités selon les procédures RGPD, qui incluent potentiellement des notifications obligatoires."
        },
        points: 20
      },
      {
        description: "Un collègue vous demande d'extraire des données de clients pour une analyse marketing. Comment procédez-vous ?",
        options: [
          "J'extrais toutes les données clients disponibles pour une analyse complète.",
          "Je lui donne un accès direct à la base de données pour qu'il puisse extraire ce dont il a besoin.",
          "J'extrais uniquement les données anonymisées nécessaires à l'analyse spécifique.",
          "Je refuse car l'utilisation des données pour le marketing n'est pas autorisée."
        ],
        correctOption: 2,
        feedback: {
          correct: "Parfait ! Le principe de minimisation des données du RGPD exige que seules les données nécessaires soient utilisées. L'anonymisation est une bonne pratique pour les analyses qui ne nécessitent pas d'identifier les individus.",
          incorrect: "Selon le RGPD, il faut appliquer le principe de minimisation des données et n'utiliser que les données strictement nécessaires, de préférence anonymisées pour ce type d'analyse."
        },
        points: 15
      }
    ]
  },
  quiz: [
    {
      question: "Selon le RGPD, que doit faire une entreprise en cas de violation de données susceptible de présenter un risque pour les droits des personnes ?",
      options: [
        "Informer uniquement les personnes concernées",
        "Notifier la CNIL dans les 72 heures",
        "Publier un communiqué de presse",
        "Rien si moins de 1000 personnes sont concernées"
      ],
      correctAnswer: 1,
      explanation: "Le RGPD exige que les violations de données susceptibles d'engendrer un risque pour les droits et libertés des personnes soient notifiées à l'autorité de contrôle (la CNIL en France) dans les 72 heures après en avoir pris connaissance.",
      points: 15
    },
    {
      question: "Quelle méthode ne constitue PAS une technique d'anonymisation appropriée selon le RGPD ?",
      options: [
        "Suppression des identifiants directs (nom, email, téléphone)",
        "Agrégation des données au niveau d'un groupe",
        "Pseudonymisation des identifiants",
        "Randomisation des valeurs"
      ],
      correctAnswer: 2,
      explanation: "La pseudonymisation n'est pas considérée comme une méthode d'anonymisation suffisante selon le RGPD, car elle permet toujours de réidentifier les personnes si on possède la clé de correspondance. C'est une mesure de sécurité utile mais les données pseudonymisées restent des données personnelles.",
      points: 15
    },
    {
      question: "Quelle est la meilleure pratique pour protéger des données sensibles stockées sur un ordinateur portable professionnel ?",
      options: [
        "Utiliser un mot de passe fort pour l'accès à l'ordinateur",
        "Chiffrer le disque dur complet de l'ordinateur",
        "Sauvegarder régulièrement les données",
        "Installer un antivirus"
      ],
      correctAnswer: 1,
      explanation: "Le chiffrement du disque dur complet est la meilleure protection en cas de vol ou de perte de l'appareil. Même si quelqu'un accède physiquement à l'ordinateur, il ne pourra pas lire les données sans la clé de déchiffrement.",
      points: 20
    }
  ],
  resources: [
    {
      title: "Guide RGPD du responsable de traitement",
      source: "CNIL",
      url: "https://www.cnil.fr/fr/rgpd-le-guide-complet-pour-les-professionnels"
    },
    {
      title: "Recommandations pour la sécurisation des données personnelles",
      source: "ANSSI/CNIL",
      url: "https://www.cnil.fr/fr/securite-chiffrer-garantir-lintegrite-ou-signer"
    }
  ],
  reward: {
    xp: 150,
    badge: "data_guardian"
  },
  unlockThreshold: 100
};

const mobileSecurityLevel: LearningLevel = {
  id: "mobile-security",
  title: "Sécurité des appareils mobiles",
  icon: <Smartphone className="h-8 w-8 text-white" />,
  description: "Apprenez à protéger vos appareils mobiles professionnels et les données qu'ils contiennent.",
  difficulty: "Intermédiaire",
  color: "#f59e0b", // amber-500
  learningObjectives: [
    "Sécuriser les smartphones et tablettes professionnels",
    "Gérer les applications et leurs permissions",
    "Protéger les données en cas de perte ou de vol",
    "Sécuriser les connexions sur réseaux publics"
  ],
  scenario: {
    title: "Mobilité et sécurité",
    context: "Vous utilisez régulièrement des appareils mobiles pour votre travail chez mc2i. Vous devez prendre des décisions pour assurer la sécurité des données de l'entreprise.",
    steps: [
      {
        description: "Vous êtes en déplacement client et avez besoin d'une connexion internet pour accéder à des documents confidentiels. Quelle solution privilégiez-vous ?",
        options: [
          "Je me connecte au Wi-Fi gratuit du café où je me trouve.",
          "J'utilise le Wi-Fi de l'hôtel, qui est protégé par mot de passe.",
          "J'utilise mon partage de connexion 4G/5G personnel.",
          "Je demande au client de me donner accès à son réseau Wi-Fi."
        ],
        correctOption: 2,
        feedback: {
          correct: "Excellente décision ! Le partage de connexion via votre réseau mobile personnel (4G/5G) est généralement plus sécurisé que les réseaux Wi-Fi publics ou partagés.",
          incorrect: "Les réseaux Wi-Fi publics ou partagés présentent des risques d'interception de données. Le partage de connexion mobile est une option plus sécurisée pour accéder à des données confidentielles."
        },
        points: 15
      },
      {
        description: "Vous installez une nouvelle application sur votre smartphone professionnel. L'application demande de nombreuses permissions. Comment réagissez-vous ?",
        options: [
          "J'accepte toutes les permissions pour que l'application fonctionne correctement.",
          "J'évalue si chaque permission demandée est nécessaire et je refuse celles qui semblent injustifiées.",
          "Je n'installe pas l'application par principe de précaution.",
          "Je demande d'abord à la DSI si cette application est autorisée dans l'entreprise."
        ],
        correctOption: 3,
        feedback: {
          correct: "C'est la démarche la plus prudente ! Vérifier si l'application est autorisée par la DSI est essentiel dans un contexte professionnel. Les politiques de sécurité de l'entreprise priment.",
          incorrect: "Sur un appareil professionnel, il est préférable de vérifier d'abord auprès de la DSI si l'application est autorisée, avant même d'évaluer les permissions."
        },
        points: 15
      },
      {
        description: "Vous vous apprêtez à prendre l'avion pour un déplacement professionnel et emportez votre ordinateur portable et votre smartphone. Quelle est la meilleure pratique à adopter ?",
        options: [
          "Je désactive simplement le Wi-Fi et le Bluetooth pendant le vol, comme demandé par la compagnie aérienne.",
          "J'utilise la fonctionnalité 'Mode avion' sur mes appareils pendant tout le voyage.",
          "Je garde mes appareils allumés mais je ne les utilise pas pendant le vol.",
          "J'active le 'Mode avion' et j'utilise des solutions de chiffrement pour les données sensibles."
        ],
        correctOption: 3,
        feedback: {
          correct: "Parfait ! En plus d'activer le mode avion, le chiffrement des données sensibles est une mesure de sécurité essentielle pour protéger les informations en cas de perte ou de vol pendant le voyage.",
          incorrect: "Le mode avion est nécessaire pendant le vol, mais il ne protège pas vos données en cas de perte ou de vol de l'appareil. Le chiffrement est une mesure de sécurité complémentaire importante."
        },
        points: 20
      }
    ]
  },
  quiz: [
    {
      question: "Quelle fonctionnalité devrait absolument être activée sur tous les appareils mobiles professionnels ?",
      options: [
        "Localisation GPS permanente",
        "Verrouillage automatique avec authentification forte",
        "Connexion automatique aux réseaux Wi-Fi connus",
        "Synchronisation des données avec des services cloud personnels"
      ],
      correctAnswer: 1,
      explanation: "Le verrouillage automatique avec authentification forte (code PIN, schéma complexe, biométrie) est essentiel pour protéger l'accès à l'appareil en cas de perte ou de vol, ce qui constitue l'un des principaux risques pour les appareils mobiles.",
      points: 15
    },
    {
      question: "Quelle est la meilleure façon de se connecter à Internet dans un lieu public avec un appareil professionnel ?",
      options: [
        "Utiliser un réseau Wi-Fi public gratuit",
        "Utiliser un réseau Wi-Fi payant",
        "Utiliser un partage de connexion 4G/5G",
        "Demander à un collègue de partager sa connexion Wi-Fi"
      ],
      correctAnswer: 2,
      explanation: "L'utilisation d'un réseau mobile personnel (4G/5G) est généralement plus sécurisée que les réseaux Wi-Fi publics qui peuvent être compromis ou surveillés. Si vous devez utiliser un Wi-Fi public, l'utilisation d'un VPN d'entreprise est fortement recommandée.",
      points: 15
    },
    {
      question: "Quelle mesure n'est PAS efficace pour protéger les données d'un smartphone professionnel en cas de vol ?",
      options: [
        "Activer le chiffrement complet de l'appareil",
        "Configurer une solution de verrouillage à distance",
        "Installer une coque de protection anti-choc",
        "Activer la fonction d'effacement à distance"
      ],
      correctAnswer: 2,
      explanation: "Une coque de protection anti-choc protège l'appareil contre les dommages physiques, mais n'a aucun effet sur la sécurité des données en cas de vol. Les autres options permettent de protéger les données même si l'appareil tombe entre de mauvaises mains.",
      points: 15
    }
  ],
  resources: [
    {
      title: "Guide de sécurité des appareils mobiles",
      source: "ANSSI",
      url: "https://www.ssi.gouv.fr/guide/recommandations-de-securite-relatives-aux-ordiphones/"
    },
    {
      title: "Protection des données sur appareils mobiles",
      source: "CNIL",
      url: "https://www.cnil.fr/fr/mots-de-passe-une-nouvelle-recommandation-pour-maitriser-sa-securite"
    }
  ],
  reward: {
    xp: 150,
    badge: "mobile_defender"
  },
  unlockThreshold: 200
};

const securityIncidentLevel: LearningLevel = {
  id: "security-incident",
  title: "Gestion des incidents de sécurité",
  icon: <AlertTriangle className="h-8 w-8 text-white" />,
  description: "Apprenez à identifier, signaler et réagir face à un incident de cybersécurité.",
  difficulty: "Avancé",
  color: "#ef4444", // red-500
  learningObjectives: [
    "Reconnaître les signes d'un incident de sécurité",
    "Suivre les procédures de signalement internes",
    "Comprendre les premières actions à prendre",
    "Contribuer à l'analyse post-incident"
  ],
  scenario: {
    title: "Incident de sécurité en temps réel",
    context: "Vous êtes confronté(e) à une situation d'urgence liée à la cybersécurité chez un client. Vous devez prendre des décisions rapides pour limiter l'impact de l'incident.",
    steps: [
      {
        description: "Vous remarquez que votre ordinateur se comporte étrangement : ralentissements, fichiers modifiés sans votre action, activité réseau inhabituelle. Que faites-vous en premier ?",
        options: [
          "Je redémarre l'ordinateur pour voir si le problème persiste.",
          "Je déconnecte immédiatement l'ordinateur du réseau et j'informe le responsable sécurité.",
          "Je lance une analyse antivirus complète tout en continuant à travailler.",
          "Je sauvegarde mes fichiers importants sur une clé USB avant d'investiguer."
        ],
        correctOption: 1,
        feedback: {
          correct: "Excellente réaction ! Déconnecter l'ordinateur du réseau limite la propagation potentielle et le contact rapide avec le responsable sécurité permet une prise en charge professionnelle de l'incident.",
          incorrect: "Face à un comportement suspect, il est crucial d'isoler la machine du réseau immédiatement pour éviter une propagation et d'alerter les experts en sécurité sans délai."
        },
        points: 20
      },
      {
        description: "Lors d'une réunion client, vous recevez un appel de votre collègue qui vous informe qu'une attaque par ransomware est en cours dans l'entreprise. Le client vous demande ce qu'il devrait faire. Quelle est votre recommandation immédiate ?",
        options: [
          "Payer la rançon rapidement pour minimiser les perturbations.",
          "Déconnecter tous les systèmes du réseau et activer le plan de gestion de crise.",
          "Contacter les forces de l'ordre avant toute autre action.",
          "Restaurer immédiatement à partir des sauvegardes pour reprendre l'activité."
        ],
        correctOption: 1,
        feedback: {
          correct: "C'est la meilleure action immédiate ! Isoler les systèmes limite la propagation du ransomware. Activer le plan de crise permet une réponse coordonnée impliquant toutes les parties prenantes nécessaires.",
          incorrect: "Face à un ransomware, l'isolation réseau immédiate est cruciale pour limiter la propagation. Les autres actions peuvent suivre dans le cadre d'un plan de réponse coordonné."
        },
        points: 25
      },
      {
        description: "Après un incident de sécurité résolu, quelle devrait être votre priorité en tant que consultant impliqué ?",
        options: [
          "Reprendre le travail normal le plus rapidement possible pour rattraper le temps perdu.",
          "Documenter précisément ce qui s'est passé et les mesures prises pendant l'incident.",
          "Communiquer publiquement sur l'incident pour rassurer les clients.",
          "Rechercher les responsables de l'erreur qui a mené à l'incident."
        ],
        correctOption: 1,
        feedback: {
          correct: "Parfait ! La documentation détaillée de l'incident est essentielle pour l'analyse post-incident, l'apprentissage organisationnel et les obligations légales potentielles. C'est une étape fondamentale de la gestion des incidents.",
          incorrect: "Après la résolution d'un incident, la documentation précise est cruciale pour l'analyse des causes, l'amélioration des processus et les éventuelles obligations de reporting (RGPD, etc.)."
        },
        points: 20
      }
    ]
  },
  quiz: [
    {
      question: "Quel est le premier objectif d'une procédure de gestion d'incidents de sécurité ?",
      options: [
        "Identifier et punir les responsables",
        "Limiter l'impact et restaurer les opérations normales",
        "Communiquer l'incident aux médias",
        "Mettre à jour tous les systèmes de sécurité"
      ],
      correctAnswer: 1,
      explanation: "Le premier objectif d'une procédure de gestion d'incidents est de contenir l'incident, d'en limiter l'impact et de restaurer les opérations normales aussi rapidement que possible. L'analyse des causes et les améliorations sont importantes mais viennent généralement après.",
      points: 20
    },
    {
      question: "Quelle action ne fait PAS partie des premières étapes de réponse à un incident de sécurité ?",
      options: [
        "Identifier la nature et l'étendue de l'incident",
        "Installer immédiatement toutes les mises à jour de sécurité disponibles",
        "Isoler les systèmes affectés",
        "Documenter les actions entreprises"
      ],
      correctAnswer: 1,
      explanation: "Installer des mises à jour pendant un incident actif peut interférer avec l'investigation, causer des problèmes supplémentaires ou effacer des preuves. Les mises à jour font partie de la phase de récupération après l'analyse de l'incident, pas des premières étapes de réponse.",
      points: 20
    },
    {
      question: "Dans le cadre du RGPD, quel délai maximum est accordé pour notifier une violation de données personnelles à l'autorité de protection ?",
      options: [
        "24 heures",
        "72 heures",
        "7 jours",
        "30 jours"
      ],
      correctAnswer: 1,
      explanation: "Le RGPD exige que les violations de données personnelles susceptibles d'engendrer un risque pour les droits et libertés des personnes soient notifiées à l'autorité de contrôle (la CNIL en France) dans les 72 heures après en avoir pris connaissance.",
      points: 20
    }
  ],
  resources: [
    {
      title: "Guide de réponse aux incidents de sécurité",
      source: "ANSSI",
      url: "https://www.ssi.gouv.fr/guide/guide-gestion-incidents-securite/"
    },
    {
      title: "Notifier une violation de données personnelles",
      source: "CNIL",
      url: "https://www.cnil.fr/fr/notifier-une-violation-de-donnees-personnelles"
    }
  ],
  reward: {
    xp: 200,
    badge: "incident_handler"
  },
  unlockThreshold: 350
};

// Définition des badges du système
const gameBadges: Badge[] = [
  {
    id: "phishing_expert",
    name: "Expert Anti-Phishing",
    description: "Vous savez identifier et contrer les tentatives de phishing.",
    icon: <MailQuestion className="h-5 w-5" />,
    color: "#3b82f6", // blue-500
    unlocked: false,
    points: 100
  },
  {
    id: "password_master",
    name: "Maître des Mots de Passe",
    description: "Vous maîtrisez l'art des mots de passe sécurisés.",
    icon: <KeyRound className="h-5 w-5" />,
    color: "#10b981", // emerald-500
    unlocked: false,
    points: 100
  },
  {
    id: "data_guardian",
    name: "Gardien des Données",
    description: "Vous protégez efficacement les données sensibles.",
    icon: <Database className="h-5 w-5" />,
    color: "#8b5cf6", // violet-500
    unlocked: false,
    points: 150
  },
  {
    id: "mobile_defender",
    name: "Défenseur Mobile",
    description: "Vous sécurisez les appareils mobiles contre les menaces.",
    icon: <Smartphone className="h-5 w-5" />,
    color: "#f59e0b", // amber-500
    unlocked: false,
    points: 150
  },
  {
    id: "incident_handler",
    name: "Gestionnaire d'Incidents",
    description: "Vous savez gérer efficacement les incidents de sécurité.",
    icon: <AlertTriangle className="h-5 w-5" />,
    color: "#ef4444", // red-500
    unlocked: false,
    points: 200
  },
  {
    id: "cyber_champion",
    name: "Champion Cybersécurité",
    description: "Vous avez complété tous les niveaux du module Sensibilisation.",
    icon: <Award className="h-5 w-5" />,
    color: "#6366f1", // indigo-500
    unlocked: false,
    points: 500
  }
];

// Statistiques du joueur
const initialGameStats: GameStat[] = [
  {
    id: "completed_levels",
    label: "Niveaux terminés",
    value: 0,
    icon: <CheckCircle className="h-5 w-5" />,
    color: "#10b981" // emerald-500
  },
  {
    id: "success_rate",
    label: "Taux de réussite",
    value: 0,
    icon: <Target className="h-5 w-5" />,
    color: "#3b82f6" // blue-500
  },
  {
    id: "badges_earned",
    label: "Badges gagnés",
    value: 0,
    icon: <Award className="h-5 w-5" />,
    color: "#f59e0b" // amber-500
  },
  {
    id: "total_xp",
    label: "XP totale",
    value: 0,
    icon: <Zap className="h-5 w-5" />,
    color: "#8b5cf6" // violet-500
  }
];

// Composant pour afficher les détails d'un badge
const BadgeCard: React.FC<{
  badge: Badge;
  isDark: boolean;
}> = ({ badge, isDark }) => {
  return (
    <div 
      className={`relative p-4 rounded-lg border ${
        badge.unlocked 
          ? isDark ? 'bg-opacity-20 border-opacity-50' : 'bg-opacity-10 border-opacity-30' 
          : isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-100 border-slate-200'
      }`}
      style={{ 
        backgroundColor: badge.unlocked ? badge.color : undefined,
        borderColor: badge.unlocked ? badge.color : undefined
      }}
    >
      {!badge.unlocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg">
          <Lock className="h-6 w-6 text-white" />
        </div>
      )}
      
      <div className="flex items-start gap-3">
        <div 
          className={`p-2.5 rounded-full ${
            badge.unlocked 
              ? 'bg-white/20' 
              : isDark ? 'bg-slate-700' : 'bg-slate-200'
          }`}
        >
          {React.cloneElement(badge.icon as React.ReactElement, { 
            className: `h-5 w-5 ${badge.unlocked ? 'text-white' : isDark ? 'text-slate-400' : 'text-slate-500'}` 
          })}
        </div>
        
        <div className="flex-1">
          <h3 className={`font-medium ${
            badge.unlocked 
              ? 'text-white' 
              : isDark ? 'text-slate-300' : 'text-slate-600'
          }`}>
            {badge.name}
          </h3>
          <p className={`text-xs mt-1 ${
            badge.unlocked 
              ? 'text-white/80' 
              : isDark ? 'text-slate-400' : 'text-slate-500'
          }`}>
            {badge.description}
          </p>
          
          {badge.unlocked && (
            <span className={`inline-flex items-center mt-2 text-xs font-medium px-2 py-0.5 rounded-full bg-white/20 text-white`}>
              <CheckCircle className="h-3 w-3 mr-1" /> Débloqué
            </span>
          )}
          
          {!badge.unlocked && (
            <span className={`inline-flex items-center mt-2 text-xs font-medium px-2 py-0.5 rounded-full ${
              isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600'
            }`}>
              <Zap className="h-3 w-3 mr-1" /> {badge.points} XP requis
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// Composant pour afficher le tableau de progression
const ProgressDashboard: React.FC<{
  gameState: GameState;
  isDark: boolean;
}> = ({ gameState, isDark }) => {
  const { xp, level, badges, stats, rank } = gameState;
  
  const getRankColor = () => {
    switch (rank) {
      case 'Novice': return '#94a3b8'; // slate-400
      case 'Apprenti': return '#60a5fa'; // blue-400
      case 'Adepte': return '#22c55e'; // green-500
      case 'Expert': return '#a855f7'; // purple-500
      case 'Maître': return '#f59e0b'; // amber-500
      default: return '#94a3b8'; // slate-400
    }
  };
  
  const getNextLevelXP = () => {
    return (level + 1) * 300;
  };
  
  const getProgressToNextLevel = () => {
    return Math.min(100, Math.floor((xp / getNextLevelXP()) * 100));
  };
  
  return (
    <Card className={`${isDark ? 'bg-slate-800 text-white' : 'bg-white'} mb-8`}>
      <CardHeader>
        <CardTitle className={isDark ? 'text-white' : 'text-slate-800'}>Votre progression</CardTitle>
        <CardDescription className={isDark ? 'text-slate-300' : 'text-slate-600'}>
          Suivez votre évolution et débloquez de nouvelles compétences
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Niveau et XP */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <h3 className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>Niveau {level}</h3>
              <div className="flex items-center mt-1">
                <span 
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" 
                  style={{ 
                    backgroundColor: `${getRankColor()}20`, 
                    color: getRankColor() 
                  }}
                >
                  {rank}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className={`text-lg font-semibold ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                {xp} XP
              </span>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {getNextLevelXP() - xp} XP jusqu'au niveau {level + 1}
              </p>
            </div>
          </div>
          
          <div className="space-y-1">
            <Progress value={getProgressToNextLevel()} className="h-2" />
            <div className="flex justify-between text-xs">
              <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                Niveau {level}
              </span>
              <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                Niveau {level + 1}
              </span>
            </div>
          </div>
        </div>
        
        {/* Statistiques */}
        <div>
          <h3 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>Statistiques</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.map(stat => (
              <div 
                key={stat.id} 
                className={`p-3 rounded-lg border ${isDark ? 'bg-slate-700/30 border-slate-600' : 'bg-slate-50 border-slate-200'}`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="p-1 rounded-full" style={{ backgroundColor: `${stat.color}20` }}>
                    {React.cloneElement(stat.icon as React.ReactElement, { 
                      style: { color: stat.color } 
                    })}
                  </div>
                  <span className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {stat.label}
                  </span>
                </div>
                <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  {stat.id === "success_rate" ? `${stat.value}%` : stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Badges */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>Badges</h3>
            <Badge variant={isDark ? "outline" : "secondary"} className="font-normal">
              {badges.filter(b => b.unlocked).length}/{badges.length} débloqués
            </Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {badges.slice(0, 3).map(badge => (
              <BadgeCard key={badge.id} badge={badge} isDark={isDark} />
            ))}
          </div>
          {badges.length > 3 && (
            <div className="mt-2 text-center">
              <Button variant="link" className={isDark ? 'text-blue-400' : 'text-blue-600'}>
                Voir tous les badges
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Page principale du module de sensibilisation cybersécurité
 */
export default function SensibilisationCyberGame() {
  const { isDark } = useTheme();
  const [currentLevel, setCurrentLevel] = useState<string | null>("phishing");
  const [gameState, setGameState] = useState<GameState>({
    xp: 0,
    level: 1,
    completedLevels: [],
    badges: gameBadges,
    stats: initialGameStats,
    rank: "Novice"
  });
  const { toast } = useToast();
  
  // Niveaux disponibles dans ce module
  const levels = [
    passwordLevel,
    phishingLevel,
    dataProtectionLevel,
    mobileSecurityLevel,
    securityIncidentLevel
  ];
  
  // Gestion des rangs
  useEffect(() => {
    let newRank = "Novice";
    if (gameState.xp >= 700) newRank = "Maître";
    else if (gameState.xp >= 500) newRank = "Expert";
    else if (gameState.xp >= 300) newRank = "Adepte";
    else if (gameState.xp >= 100) newRank = "Apprenti";
    
    if (newRank !== gameState.rank) {
      setGameState({...gameState, rank: newRank});
      
      if (newRank !== "Novice") {
        toast({
          title: `Nouveau rang : ${newRank}`,
          description: `Félicitations ! Vous avez atteint le rang de ${newRank} en cybersécurité !`,
          variant: "default",
        });
      }
    }
  }, [gameState.xp]);
  
  // Calculer le niveau en fonction des XP
  useEffect(() => {
    const newLevel = Math.floor(gameState.xp / 300) + 1;
    if (newLevel !== gameState.level) {
      setGameState({...gameState, level: newLevel});
      
      toast({
        title: `Niveau ${newLevel} atteint !`,
        description: `Félicitations ! Vous progressez dans votre maîtrise de la cybersécurité !`,
        variant: "default",
      });
    }
  }, [gameState.xp]);
  
  // Mise à jour des badges en fonction des niveaux complétés
  useEffect(() => {
    const newBadges = [...gameState.badges];
    let badgesUpdated = false;
    
    for (const badge of newBadges) {
      // Débloquer les badges liés aux niveaux complétés
      if (!badge.unlocked) {
        if (badge.id === "phishing_expert" && gameState.completedLevels.includes("phishing")) {
          badge.unlocked = true;
          badgesUpdated = true;
        } else if (badge.id === "password_master" && gameState.completedLevels.includes("passwords")) {
          badge.unlocked = true;
          badgesUpdated = true;
        } else if (badge.id === "data_guardian" && gameState.completedLevels.includes("data-protection")) {
          badge.unlocked = true;
          badgesUpdated = true;
        } else if (badge.id === "mobile_defender" && gameState.completedLevels.includes("mobile-security")) {
          badge.unlocked = true;
          badgesUpdated = true;
        } else if (badge.id === "incident_handler" && gameState.completedLevels.includes("security-incident")) {
          badge.unlocked = true;
          badgesUpdated = true;
        } else if (badge.id === "cyber_champion" && gameState.completedLevels.length >= 5) {
          badge.unlocked = true;
          badgesUpdated = true;
        }
      }
    }
    
    if (badgesUpdated) {
      // Mise à jour des statistiques
      const newStats = [...gameState.stats];
      const badgesEarnedStat = newStats.find(s => s.id === "badges_earned");
      if (badgesEarnedStat) {
        badgesEarnedStat.value = newBadges.filter(b => b.unlocked).length;
      }
      
      setGameState({
        ...gameState, 
        badges: newBadges,
        stats: newStats
      });
    }
  }, [gameState.completedLevels]);
  
  // Fonction pour mettre à jour les statistiques
  const updateStats = () => {
    const newStats = [...gameState.stats];
    
    // Niveaux terminés
    const completedLevelsStat = newStats.find(s => s.id === "completed_levels");
    if (completedLevelsStat) {
      completedLevelsStat.value = gameState.completedLevels.length;
    }
    
    // Taux de réussite (placeholder - à adapter selon vos besoins)
    const successRateStat = newStats.find(s => s.id === "success_rate");
    if (successRateStat) {
      successRateStat.value = Math.min(100, Math.round((gameState.completedLevels.length / 5) * 100));
    }
    
    // XP totale
    const totalXpStat = newStats.find(s => s.id === "total_xp");
    if (totalXpStat) {
      totalXpStat.value = gameState.xp;
    }
    
    setGameState({
      ...gameState,
      stats: newStats
    });
  };
  
  // Gestion de la complétion d'un niveau
  const handleLevelComplete = (levelId: string, earnedXP: number) => {
    if (!gameState.completedLevels.includes(levelId)) {
      const newCompletedLevels = [...gameState.completedLevels, levelId];
      const newXP = gameState.xp + earnedXP;
      
      setGameState({
        ...gameState,
        completedLevels: newCompletedLevels,
        xp: newXP
      });
      
      // Mettre à jour les statistiques
      setTimeout(() => {
        updateStats();
      }, 500);
      
      toast({
        title: "Niveau terminé !",
        description: `Vous avez complété le niveau "${levels.find(l => l.id === levelId)?.title}" et gagné ${earnedXP} XP !`,
        variant: "default",
      });
    }
    
    setCurrentLevel(null);
  };
  
  // Fonction pour vérifier si un niveau est débloqué
  const isLevelUnlocked = (level: LearningLevel) => {
    if (!level.unlockThreshold) return true;
    return gameState.xp >= level.unlockThreshold;
  };
  
  return (
    <HomeLayout>
      <PageTitle title="Sensibilisation à la Cybersécurité" />
      
      <div className={`min-h-screen p-4 ${isDark ? 'bg-slate-900 text-white' : 'bg-slate-50'}`}>
        <div className="container mx-auto max-w-6xl">
          <div className="mb-4">
            <Link href="/cyber/learning/cyber-mastery">
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Retour aux parcours
              </Button>
            </Link>
          </div>
          
          {/* Header */}
          <div className={`${isDark ? 'bg-gradient-to-r from-blue-900/40 to-indigo-900/40' : 'bg-gradient-to-r from-blue-50 to-indigo-50'} rounded-lg p-6 mb-8`}>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className={`p-4 rounded-full ${isDark ? 'bg-blue-800/50' : 'bg-blue-100'}`}>
                <Shield className={`h-12 w-12 ${isDark ? 'text-blue-300' : 'text-blue-600'}`} />
              </div>
              
              <div className="flex-1">
                <h1 className={`text-2xl sm:text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  Module de Sensibilisation Cybersécurité
                </h1>
                <p className={`${isDark ? 'text-blue-200' : 'text-blue-800'} text-sm sm:text-base mb-3`}>
                  Développez vos compétences en cybersécurité et devenez un acteur clé de la protection de votre organisation.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-blue-600">
                    <Target className="h-3.5 w-3.5 mr-1" />
                    Interactif
                  </Badge>
                  <Badge className="bg-purple-600">
                    <BellRing className="h-3.5 w-3.5 mr-1" />
                    Scénarios réels
                  </Badge>
                  <Badge className="bg-amber-600">
                    <Trophy className="h-3.5 w-3.5 mr-1" />
                    Badges à gagner
                  </Badge>
                  <Badge className="bg-emerald-600">
                    <Info className="h-3.5 w-3.5 mr-1" />
                    Attestation
                  </Badge>
                </div>
              </div>
              
              <div className={`self-stretch flex flex-col justify-center p-4 rounded-lg ${isDark ? 'bg-blue-900/30 border border-blue-800/50' : 'bg-blue-50 border border-blue-100'}`}>
                <div className="text-center">
                  <p className={`text-xs mb-1 ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>Votre niveau</p>
                  <div className="flex items-center justify-center gap-1">
                    <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{gameState.level}</h2>
                    <span className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>/ 5</span>
                  </div>
                  <div className={`text-sm mt-1 font-medium ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                    {gameState.xp} XP
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Tableau de progression */}
          <ProgressDashboard gameState={gameState} isDark={isDark} />
          
          {/* Contenu du niveau actif ou liste des niveaux */}
          {currentLevel ? (
            <div>
              <InteractiveLearningLevel 
                level={levels.find(l => l.id === currentLevel)!} 
                isDark={isDark} 
                onComplete={handleLevelComplete}
                gameState={gameState}
              />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  Niveaux de formation
                </h2>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-1">
                        <Info className="h-4 w-4" />
                        <span>Aide</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm">
                      <p>Complétez les niveaux dans l'ordre pour gagner de l'XP et débloquer de nouveaux niveaux. Certains niveaux requièrent un minimum d'XP pour être accessibles.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              {/* Parcours d'apprentissage */}
              <div className="space-y-4">
                {/* Niveaux */}
                {levels.map((level) => (
                  <div key={level.id} className="relative">
                    {isLevelUnlocked(level) ? (
                      <Card 
                        className={`${isDark ? 'bg-slate-800 text-white hover:bg-slate-800/90' : 'bg-white hover:bg-slate-50'} transition-colors border-l-4 cursor-pointer`}
                        style={{ borderLeftColor: level.color }}
                        onClick={() => setCurrentLevel(level.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="p-2 rounded-lg" style={{ backgroundColor: level.color }}>
                              {level.icon}
                            </div>
                            
                            <div className="flex-1">
                              <h3 className={`font-medium text-lg ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                {level.title}
                              </h3>
                              
                              <div className="flex items-center gap-3 mt-1">
                                <Badge variant={isDark ? "outline" : "secondary"} className="font-normal">
                                  {level.difficulty}
                                </Badge>
                                
                                <DifficultyStars level={level.difficulty} isDark={isDark} />
                                
                                {gameState.completedLevels.includes(level.id) && (
                                  <span className={`inline-flex items-center text-xs font-medium ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                                    <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                    Complété
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className={`p-2 rounded-full ${isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200'}`}>
                              <ChevronRight className={`h-5 w-5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`} />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <LockedLevelCard 
                        level={level} 
                        isDark={isDark}
                        currentPoints={gameState.xp}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </HomeLayout>
  );
}