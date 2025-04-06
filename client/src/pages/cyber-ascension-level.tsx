import { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Trophy, 
  Clock, 
  CheckCircle, 
  XCircle,
  HelpCircle,
  ExternalLink,
  FileText,
  Star,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  AscensionLevel, 
  LevelChallenge, 
  QuizQuestion,
  SimulationStep
} from '../types/cyber-ascension';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function CyberAscensionLevel() {
  const [match, params] = useRoute<{ themeId: string, levelId: string }>('/cyber-ascension/theme/:themeId/level/:levelId');
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('challenge');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [completionDialog, setCompletionDialog] = useState(false);
  const [resultSummary, setResultSummary] = useState({
    correctAnswers: 0,
    totalQuestions: 0,
    score: 0,
    passed: false,
    earnedXp: 0
  });
  
  // Calcul des paramètres pour les requêtes
  const themeId = params?.themeId || '';
  const levelId = parseInt(params?.levelId || '1');
  
  // Récupération des détails du niveau
  const { data: levelData, isLoading: isLoadingLevel, error: levelError } = useQuery<{ 
    success: boolean, 
    level: AscensionLevel, 
    challenge: LevelChallenge 
  }>({
    queryKey: ['/api/cyber-ascension/themes', themeId, 'levels', levelId],
    enabled: !!themeId && !!levelId,
  });
  
  // Mutation pour soumettre une tentative
  const attemptMutation = useMutation({
    mutationFn: async () => {
      // Créer un objet de réponses formatées pour l'API
      const answers = levelData?.challenge.content.questions?.map((q, index) => ({
        questionId: q.id,
        selectedAnswer: selectedAnswers[q.id],
        correct: selectedAnswers[q.id] === q.correctAnswer
      })) || [];
      
      // Calculer le score initial (basé sur les quiz uniquement)
      const correctCount = answers.filter(a => a.correct).length;
      const totalQuestions = answers.length;
      
      return apiRequest<{
        success: boolean,
        attempt: any,
        updatedProgress: any
      }>('/api/cyber-ascension/attempts', {
        method: 'POST',
        body: JSON.stringify({
          themeId,
          levelId,
          userId: 'user123', // Normalement, cela devrait être l'ID de l'utilisateur connecté
          startTime: Date.now() - 60000, // Simuler un démarrage il y a 1 minute
          success: correctCount >= Math.ceil(totalQuestions * 0.7), // Réussite si au moins 70% de bonnes réponses
          answers
        })
      });
    },
    onSuccess: (data) => {
      if (data.success) {
        // Calculer les statistiques de résultat pour affichage
        const answers = levelData?.challenge.content.questions?.map((q, index) => ({
          questionId: q.id,
          selectedAnswer: selectedAnswers[q.id],
          correct: selectedAnswers[q.id] === q.correctAnswer
        })) || [];
        
        const correctCount = answers.filter(a => a.correct).length;
        const totalQuestions = answers.length;
        const score = Math.round((correctCount / totalQuestions) * 100);
        const passed = score >= 70;
        const earnedXp = passed ? levelData?.level.xpReward || 0 : Math.floor((levelData?.level.xpReward || 0) * 0.3);
        
        setResultSummary({
          correctAnswers: correctCount,
          totalQuestions,
          score,
          passed,
          earnedXp
        });
        
        setCompletionDialog(true);
        
        // Invalider les requêtes pour forcer un rafraîchissement des données
        queryClient.invalidateQueries({ queryKey: ['/api/cyber-ascension/themes', themeId] });
        queryClient.invalidateQueries({ queryKey: ['/api/cyber-ascension/progress'] });
      } else {
        toast({
          title: 'Erreur',
          description: 'Une erreur est survenue lors de la soumission de vos réponses.',
          variant: 'destructive'
        });
      }
    },
    onError: (error) => {
      console.error('Erreur lors de la soumission des réponses:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la soumission de vos réponses.',
        variant: 'destructive'
      });
    }
  });
  
  // Fonction pour gérer la sélection d'une réponse dans le quiz
  const handleSelectAnswer = (questionId: string, answerIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };
  
  // Fonction pour gérer la sélection d'une option dans une simulation
  const handleSelectOption = (stepId: string, optionId: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [stepId]: optionId
    }));
    
    // Pour la simulation, on passe automatiquement à l'étape suivante après une sélection
    const currentStep = levelData?.challenge.content.simulationSteps?.[currentStepIndex];
    if (currentStep) {
      // Attendre un peu pour montrer le feedback
      setTimeout(() => {
        if (currentStepIndex < (levelData?.challenge.content.simulationSteps?.length || 0) - 1) {
          setCurrentStepIndex(prev => prev + 1);
        } else {
          // Dernière étape, montrer les résultats
          setShowResults(true);
        }
      }, 1500);
    }
  };
  
  // Fonction pour passer à la question suivante dans le quiz
  const handleNextQuestion = () => {
    if (!levelData?.challenge.content.questions) return;
    
    if (currentQuestionIndex < levelData.challenge.content.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Dernière question, montrer les résultats
      setShowResults(true);
    }
  };
  
  // Fonction pour soumettre toutes les réponses
  const handleSubmitAnswers = () => {
    attemptMutation.mutate();
  };
  
  // Gérer les erreurs
  if (levelError) {
    toast({
      title: 'Erreur',
      description: 'Impossible de charger le niveau. Veuillez réessayer.',
      variant: 'destructive',
    });
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#111827] to-[#1f2937] text-white">
        <div className="container mx-auto p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Une erreur est survenue</h2>
          <p className="mb-6">Impossible de charger le niveau demandé.</p>
          <Button onClick={() => setLocation(`/cyber-ascension/theme/${themeId}`)}>
            Retour au thème
          </Button>
        </div>
      </div>
    );
  }
  
  if (isLoadingLevel || !levelData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#111827] to-[#1f2937] text-white">
        <div className="max-w-5xl mx-auto px-4 pt-6 pb-16 sm:px-6">
          <Skeleton className="h-8 w-40 bg-gray-700 mb-8" />
          
          <Skeleton className="h-10 w-full max-w-xl bg-gray-700 mb-6" />
          <Skeleton className="h-5 w-full max-w-md bg-gray-700 mb-8" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <Skeleton className="h-7 w-64 bg-gray-200 mb-2" />
                  <Skeleton className="h-4 w-full bg-gray-200" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-32 w-full bg-gray-200 mb-6" />
                  <Skeleton className="h-16 w-full bg-gray-200 mb-6" />
                  <Skeleton className="h-16 w-full bg-gray-200 mb-6" />
                  <Skeleton className="h-16 w-full bg-gray-200" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-32 bg-gray-200" />
                </CardFooter>
              </Card>
            </div>
            
            <div>
              <Card className="mb-6">
                <CardHeader>
                  <Skeleton className="h-6 w-32 bg-gray-200" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-6 w-full bg-gray-200 mb-3" />
                  <Skeleton className="h-6 w-full bg-gray-200 mb-3" />
                  <Skeleton className="h-6 w-full bg-gray-200" />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32 bg-gray-200" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-24 w-full bg-gray-200" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  const { level, challenge } = levelData;
  const currentQuestion = challenge.content.questions?.[currentQuestionIndex];
  const currentStep = challenge.content.simulationSteps?.[currentStepIndex];
  const selectedStepOption = currentStep ? selectedOptions[currentStep.id] : null;
  const stepOptionFeedback = currentStep?.options.find(o => o.id === selectedStepOption)?.feedback;
  const isStepOptionCorrect = currentStep?.options.find(o => o.id === selectedStepOption)?.isCorrect;
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#111827] to-[#1f2937] text-white">
      <div className="max-w-6xl mx-auto px-4 pt-6 pb-16 sm:px-6">
        <Button 
          variant="ghost" 
          className="text-white hover:text-blue-300 mb-8 pl-0" 
          onClick={() => setLocation(`/cyber-ascension/theme/${themeId}`)}
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Retour au thème
        </Button>
        
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{challenge.title}</h1>
          <p className="text-gray-300">{challenge.description}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2">
            <Tabs 
              defaultValue="challenge" 
              value={activeTab} 
              onValueChange={setActiveTab} 
              className="mb-6"
            >
              <TabsList className="bg-white/10 mb-4">
                <TabsTrigger value="challenge" className="data-[state=active]:bg-white/20">
                  Défi
                </TabsTrigger>
                <TabsTrigger value="resources" className="data-[state=active]:bg-white/20">
                  Ressources
                </TabsTrigger>
                <TabsTrigger value="objectives" className="data-[state=active]:bg-white/20">
                  Objectifs
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="challenge" className="p-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Introduction</CardTitle>
                    <CardDescription>
                      Lisez attentivement les informations suivantes avant de commencer
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {challenge.content.introduction && (
                      <div className="prose prose-invert max-w-none">
                        <p>{challenge.content.introduction}</p>
                      </div>
                    )}
                    
                    {challenge.content.scenario && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Scénario</h3>
                        <div className="bg-blue-950/50 border border-blue-900 rounded-md p-4 prose prose-invert max-w-none">
                          <p>{challenge.content.scenario}</p>
                        </div>
                      </div>
                    )}
                    
                    {!showResults && challenge.type === 'quiz' && currentQuestion && (
                      <div className="border border-gray-700 rounded-md p-5 bg-gray-800/50 mt-8">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold">Question {currentQuestionIndex + 1}/{challenge.content.questions?.length}</h3>
                          <Badge variant="outline">Quiz</Badge>
                        </div>
                        
                        <div className="mb-6">
                          <p className="text-lg mb-4">{currentQuestion.question}</p>
                          
                          <RadioGroup 
                            value={selectedAnswers[currentQuestion.id]?.toString()} 
                            onValueChange={(value) => handleSelectAnswer(currentQuestion.id, parseInt(value))}
                          >
                            {currentQuestion.options.map((option, index) => (
                              <div key={index} className="flex items-start space-x-2 mb-4">
                                <RadioGroupItem 
                                  value={index.toString()} 
                                  id={`option-${index}`}
                                  className="mt-1" 
                                />
                                <Label 
                                  htmlFor={`option-${index}`}
                                  className="font-normal cursor-pointer pt-0.5"
                                >
                                  {option}
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </div>
                        
                        <div className="flex justify-between">
                          <Button 
                            variant="outline" 
                            onClick={() => setShowHint(!showHint)}
                          >
                            <Lightbulb className="h-4 w-4 mr-2" />
                            {showHint ? "Cacher l'indice" : "Afficher un indice"}
                          </Button>
                          
                          <Button 
                            onClick={handleNextQuestion}
                            disabled={selectedAnswers[currentQuestion.id] === undefined}
                          >
                            {currentQuestionIndex < (challenge.content.questions?.length || 0) - 1 
                              ? "Question suivante" 
                              : "Terminer le quiz"
                            }
                          </Button>
                        </div>
                        
                        {showHint && (
                          <Alert className="mt-4 bg-amber-950/30 border-amber-900/50">
                            <HelpCircle className="h-4 w-4 text-amber-500" />
                            <AlertTitle>Indice</AlertTitle>
                            <AlertDescription className="text-amber-200">
                              Réfléchissez aux bonnes pratiques de sécurité dans ce contexte. La réponse est liée aux concepts présentés dans l'introduction.
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    )}
                    
                    {!showResults && challenge.type === 'simulation' && currentStep && (
                      <div className="border border-gray-700 rounded-md p-5 bg-gray-800/50 mt-8">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold">Étape {currentStepIndex + 1}/{challenge.content.simulationSteps?.length}</h3>
                          <Badge variant="outline">Simulation</Badge>
                        </div>
                        
                        <div className="mb-6">
                          <p className="text-lg mb-6">{currentStep.situation}</p>
                          
                          <div className="space-y-3">
                            {currentStep.options.map((option) => (
                              <div 
                                key={option.id}
                                className={`
                                  p-4 rounded-md cursor-pointer transition-colors
                                  ${selectedStepOption === option.id ? (
                                    isStepOptionCorrect 
                                      ? 'bg-green-900/30 border border-green-700' 
                                      : 'bg-red-900/30 border border-red-700'
                                  ) : 'bg-gray-700/40 border border-gray-600 hover:bg-gray-700/60'}
                                `}
                                onClick={() => !selectedStepOption && handleSelectOption(currentStep.id, option.id)}
                              >
                                <div className="flex justify-between">
                                  <span>{option.text}</span>
                                  {selectedStepOption === option.id && (
                                    isStepOptionCorrect 
                                      ? <CheckCircle className="h-5 w-5 text-green-500" /> 
                                      : <XCircle className="h-5 w-5 text-red-500" />
                                  )}
                                </div>
                                
                                {selectedStepOption === option.id && option.feedback && (
                                  <div className={`
                                    mt-3 pt-3 border-t 
                                    ${isStepOptionCorrect ? 'border-green-700 text-green-200' : 'border-red-700 text-red-200'}
                                  `}>
                                    {option.feedback}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {selectedStepOption && currentStep.guidance && (
                          <Alert className="mt-4 bg-blue-950/30 border-blue-900/50">
                            <Lightbulb className="h-4 w-4 text-blue-500" />
                            <AlertTitle>Conseil</AlertTitle>
                            <AlertDescription className="text-blue-200">
                              {currentStep.guidance}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    )}
                    
                    {showResults && (
                      <div className="border border-gray-700 rounded-md p-5 bg-gray-800/50 mt-8">
                        <div className="text-center mb-6">
                          <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
                          <h3 className="text-xl font-semibold mb-2">Défi complété !</h3>
                          <p className="text-gray-300">
                            Vous êtes prêt à soumettre vos réponses pour évaluation.
                          </p>
                        </div>
                        
                        {challenge.type === 'quiz' && challenge.content.questions && (
                          <div className="mb-6">
                            <h4 className="font-medium mb-3">Vos réponses :</h4>
                            <div className="space-y-2">
                              {challenge.content.questions.map((question, idx) => (
                                <div key={idx} className="flex items-center justify-between text-sm">
                                  <span className="truncate max-w-md">Q{idx + 1}: {question.question}</span>
                                  {selectedAnswers[question.id] !== undefined ? (
                                    <Badge variant="outline" className="ml-2">
                                      Option {selectedAnswers[question.id] + 1}
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="bg-red-900/50 border-red-700">
                                      Non répondu
                                    </Badge>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex justify-center mt-6">
                          <Button 
                            onClick={handleSubmitAnswers}
                            disabled={attemptMutation.isPending}
                            className="w-full md:w-auto"
                          >
                            {attemptMutation.isPending ? "Soumission en cours..." : "Soumettre les réponses"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="resources" className="p-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Ressources</CardTitle>
                    <CardDescription>
                      Documents et liens utiles pour vous aider à comprendre les concepts abordés
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {challenge.content.resources && challenge.content.resources.length > 0 ? (
                      <div className="space-y-4">
                        {challenge.content.resources.map((resource, index) => (
                          <div key={index} className="border border-gray-700 rounded-md p-4">
                            <div className="flex items-start gap-3">
                              <div className="bg-blue-900/30 p-1.5 rounded-md">
                                {resource.type === 'article' && <FileText className="h-5 w-5 text-blue-400" />}
                                {resource.type === 'video' && <FileText className="h-5 w-5 text-red-400" />}
                                {resource.type === 'tool' && <FileText className="h-5 w-5 text-green-400" />}
                                {resource.type === 'reference' && <FileText className="h-5 w-5 text-purple-400" />}
                              </div>
                              <div className="flex-1">
                                <h3 className="font-medium mb-2 flex items-center">
                                  {resource.title}
                                  <Badge variant="outline" className="ml-2 text-xs">
                                    {resource.type}
                                  </Badge>
                                </h3>
                                {resource.content && (
                                  <p className="text-sm text-gray-300">{resource.content}</p>
                                )}
                                {resource.url && (
                                  <a 
                                    href={resource.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-400 text-sm flex items-center hover:underline mt-2"
                                  >
                                    Consulter <ExternalLink className="h-3 w-3 ml-1" />
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="h-12 w-12 mx-auto opacity-30 mb-3" />
                        <p>Aucune ressource supplémentaire disponible pour ce niveau.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="objectives" className="p-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Objectifs d'apprentissage</CardTitle>
                    <CardDescription>
                      Compétences que vous développerez à travers ce niveau
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {level.objectives && level.objectives.length > 0 ? (
                      <ul className="space-y-3">
                        {level.objectives.map((objective, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{objective}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <AlertTriangle className="h-12 w-12 mx-auto opacity-30 mb-3" />
                        <p>Aucun objectif d'apprentissage défini pour ce niveau.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Détails du niveau</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Difficulté</span>
                  <div className="flex">
                    {Array(5).fill(null).map((_, idx) => (
                      <Star 
                        key={idx} 
                        className={`h-4 w-4 ${idx < level.difficulty ? 'text-yellow-500 fill-yellow-500' : 'text-gray-500'}`} 
                      />
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Récompense</span>
                  <Badge className="bg-blue-900/50 text-white border-blue-800">
                    <Trophy className="h-3 w-3 mr-1" /> {level.xpReward} XP
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Temps estimé</span>
                  <Badge className="bg-gray-700 text-white border-gray-600">
                    <Clock className="h-3 w-3 mr-1" /> {level.timeEstimate}
                  </Badge>
                </div>
                
                <Separator />
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Type de défi</span>
                  <Badge variant="outline">{challenge.type}</Badge>
                </div>
                
                {challenge.type === 'quiz' && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Questions</span>
                    <span>{challenge.content.questions?.length || 0}</span>
                  </div>
                )}
                
                {challenge.type === 'simulation' && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Étapes</span>
                    <span>{challenge.content.simulationSteps?.length || 0}</span>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Progression</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {challenge.type === 'quiz' && (
                  <>
                    <div className="mb-1 flex justify-between text-sm">
                      <span>Questions complétées</span>
                      <span>{
                        showResults 
                          ? `${challenge.content.questions?.length || 0}/${challenge.content.questions?.length || 0}` 
                          : `${currentQuestionIndex}/${challenge.content.questions?.length || 0}`
                      }</span>
                    </div>
                    <Progress 
                      value={showResults 
                        ? 100 
                        : (currentQuestionIndex / (challenge.content.questions?.length || 1)) * 100
                      } 
                      className="h-2" 
                    />
                  </>
                )}
                
                {challenge.type === 'simulation' && (
                  <>
                    <div className="mb-1 flex justify-between text-sm">
                      <span>Étapes complétées</span>
                      <span>{
                        showResults 
                          ? `${challenge.content.simulationSteps?.length || 0}/${challenge.content.simulationSteps?.length || 0}` 
                          : `${currentStepIndex}/${challenge.content.simulationSteps?.length || 0}`
                      }</span>
                    </div>
                    <Progress 
                      value={showResults 
                        ? 100 
                        : (currentStepIndex / (challenge.content.simulationSteps?.length || 1)) * 100
                      } 
                      className="h-2" 
                    />
                  </>
                )}
                
                <Alert className="bg-blue-900/30 border-blue-800 mt-4">
                  <AlertTriangle className="h-4 w-4 text-blue-500" />
                  <AlertTitle>Rappel</AlertTitle>
                  <AlertDescription className="text-sm">
                    Pour réussir ce niveau, vous devez obtenir au moins 70% de bonnes réponses.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Dialogue de complétion du niveau */}
      <Dialog open={completionDialog} onOpenChange={setCompletionDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">
              {resultSummary.passed 
                ? "Félicitations !" 
                : "Niveau terminé"
              }
            </DialogTitle>
            <DialogDescription className="text-center">
              {resultSummary.passed 
                ? "Vous avez réussi ce niveau avec succès !" 
                : "Vous n'avez pas atteint le score minimum requis."
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="flex justify-center mb-6">
              {resultSummary.passed ? (
                <div className="w-24 h-24 rounded-full bg-green-900/30 flex items-center justify-center">
                  <Trophy className="h-12 w-12 text-yellow-500" />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-amber-900/30 flex items-center justify-center">
                  <AlertTriangle className="h-12 w-12 text-amber-500" />
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Score</span>
                <Badge className={resultSummary.passed 
                  ? "bg-green-900/50 border-green-700" 
                  : "bg-amber-900/50 border-amber-700"
                }>
                  {resultSummary.score}%
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Réponses correctes</span>
                <span>{resultSummary.correctAnswers}/{resultSummary.totalQuestions}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-300">XP gagnés</span>
                <Badge className="bg-blue-900/50 border-blue-700">
                  +{resultSummary.earnedXp} XP
                </Badge>
              </div>
              
              {!resultSummary.passed && (
                <Alert className="mt-4 bg-amber-900/30 border-amber-800">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <AlertDescription className="text-sm">
                    Pour débloquer le niveau suivant, vous devez obtenir au moins 70% de bonnes réponses.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setCompletionDialog(false);
                // Réinitialiser l'état pour permettre de recommencer
                setShowResults(false);
                setCurrentQuestionIndex(0);
                setCurrentStepIndex(0);
                setSelectedAnswers({});
                setSelectedOptions({});
              }}
              className="w-full sm:w-auto"
            >
              Réessayer
            </Button>
            
            <Button 
              onClick={() => {
                setCompletionDialog(false);
                setLocation(`/cyber-ascension/theme/${themeId}`);
              }}
              className="w-full sm:w-auto"
            >
              Retour au thème
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}