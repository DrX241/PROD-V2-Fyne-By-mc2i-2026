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
  
  // Logs pour vérifier les paramètres
  console.log("Route match:", match); 
  console.log("Theme ID:", params?.themeId);
  console.log("Level ID:", params?.levelId);
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
  const [userTextResponse, setUserTextResponse] = useState('');
  const [submittingText, setSubmittingText] = useState(false);
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
    retry: 3, // Retry 3 times in case of failure
    retryDelay: 1000, // Wait 1 second between retries
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
                  Mission
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
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center">
                          <FileText className="h-5 w-5 mr-2 text-blue-400" />
                          Briefing de mission
                        </CardTitle>
                        <CardDescription>
                          Lisez attentivement les informations suivantes avant de commencer
                        </CardDescription>
                      </div>
                      <Badge className="bg-blue-600 text-white hover:bg-blue-700">Niveau {level.id}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {challenge.content.introduction && (
                      <div className="prose prose-invert max-w-none">
                        <p>{challenge.content.introduction}</p>
                      </div>
                    )}
                    
                    {/* Nouveau: Contexte */}
                    {challenge.content.context && (
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-3 flex items-center">
                          <span className="text-blue-400 mr-2">🎬</span> CONTEXTE
                        </h3>
                        <div className="bg-blue-950/50 border border-blue-900 rounded-md p-4 prose prose-invert max-w-none">
                          <p>{challenge.content.context}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Compatibilité avec l'ancien format */}
                    {challenge.content.scenario && !challenge.content.context && (
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-3 flex items-center">
                          <span className="text-blue-400 mr-2">🎬</span> CONTEXTE
                        </h3>
                        <div className="bg-blue-950/50 border border-blue-900 rounded-md p-4 prose prose-invert max-w-none">
                          <p>{challenge.content.scenario}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Nouveau: Matériaux */}
                    {challenge.content.materials && challenge.content.materials.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-3 flex items-center">
                          <span className="text-amber-400 mr-2">📂</span> MATÉRIEL FOURNI
                        </h3>
                        <div className="space-y-4">
                          {challenge.content.materials.map((material, index) => (
                            <div 
                              key={index} 
                              className="bg-gray-800/70 border border-gray-700 rounded-md overflow-hidden"
                            >
                              <div className="bg-gray-700/70 px-4 py-2 flex justify-between items-center">
                                <div className="flex items-center">
                                  {material.type === 'email' && <span className="text-blue-400 mr-2">📧</span>}
                                  {material.type === 'log' && <span className="text-green-400 mr-2">📊</span>}
                                  {material.type === 'code' && <span className="text-purple-400 mr-2">💻</span>}
                                  {material.type === 'screenshot' && <span className="text-amber-400 mr-2">🖼️</span>}
                                  {material.type === 'document' && <span className="text-red-400 mr-2">📄</span>}
                                  {material.type === 'conversation' && <span className="text-teal-400 mr-2">💬</span>}
                                  {material.type === 'message' && <span className="text-indigo-400 mr-2">✉️</span>}
                                  <span className="font-medium">{material.title}</span>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {material.type}
                                </Badge>
                              </div>
                              <div className="p-4 max-h-[300px] overflow-y-auto">
                                {material.type === 'log' ? (
                                  <pre className="text-sm font-mono whitespace-pre-wrap text-green-300 bg-gray-900/50 p-3 rounded">{material.content}</pre>
                                ) : material.type === 'code' ? (
                                  <pre className="text-sm font-mono whitespace-pre-wrap text-purple-300 bg-gray-900/50 p-3 rounded">{material.content}</pre>
                                ) : material.type === 'email' ? (
                                  <div className="bg-gray-900/30 p-3 rounded">
                                    {material.metadata && (
                                      <div className="mb-3 text-sm border-b border-gray-700 pb-2">
                                        {material.metadata.from && <div><strong>De:</strong> {material.metadata.from}</div>}
                                        {material.metadata.to && <div><strong>À:</strong> {material.metadata.to}</div>}
                                        {material.metadata.date && <div><strong>Date:</strong> {material.metadata.date}</div>}
                                      </div>
                                    )}
                                    <div className="whitespace-pre-line">{material.content}</div>
                                  </div>
                                ) : (
                                  <div className="whitespace-pre-line">{material.content}</div>
                                )}
                              </div>
                              {material.metadata && material.metadata.source && (
                                <div className="bg-gray-700/30 px-4 py-1.5 text-xs text-gray-300">
                                  Source: {material.metadata.source}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Nouveau: Objectif et Contrainte */}
                    {challenge.content.objective && (
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-3 flex items-center">
                          <span className="text-green-400 mr-2">🎯</span> OBJECTIF
                        </h3>
                        <div className="bg-green-950/40 border border-green-900/70 rounded-md p-4 prose prose-invert max-w-none">
                          <p>{challenge.content.objective}</p>
                        </div>
                      </div>
                    )}
                    
                    {challenge.content.constraint && (
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-3 flex items-center">
                          <span className="text-red-400 mr-2">⌛</span> CONTRAINTE
                        </h3>
                        <div className="bg-red-950/40 border border-red-900/70 rounded-md p-4 prose prose-invert max-w-none">
                          <p>{challenge.content.constraint}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Nouveau: Mode Scénario - pour réponse en texte libre */}
                    {challenge.type === 'scenario' && !showResults && (
                      <div className="mt-8 border border-gray-700 rounded-md p-5 bg-gray-800/50">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold">Votre réponse</h3>
                          <Badge variant="outline" className="bg-purple-900/70 text-purple-200 border-purple-700">
                            Scénario Interactif
                          </Badge>
                        </div>
                        
                        <div className="space-y-4">
                          <label className="block text-sm font-medium mb-1">
                            Comment allez-vous réagir à cette situation ? Détaillez votre analyse et votre plan d'action.
                          </label>
                          <textarea 
                            className="w-full min-h-[200px] p-3 rounded-md bg-gray-900/70 border border-gray-700 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            placeholder="Saisissez votre réponse en détaillant votre analyse, vos recommandations et vos actions..."
                            value={userTextResponse}
                            onChange={(e) => setUserTextResponse(e.target.value)}
                          />
                          
                          <div className="flex justify-between items-center">
                            <Button 
                              variant="outline" 
                              onClick={() => setShowHint(!showHint)}
                            >
                              <Lightbulb className="h-4 w-4 mr-2" />
                              {showHint ? "Cacher les conseils" : "Afficher des conseils"}
                            </Button>
                            
                            <Button 
                              onClick={() => {
                                setSubmittingText(true);
                                // Simulation d'un délai de traitement
                                setTimeout(() => {
                                  setSubmittingText(false);
                                  setShowResults(true);
                                }, 1500);
                              }}
                              disabled={submittingText || userTextResponse.length < 50}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              {submittingText ? (
                                <>Traitement en cours...</>
                              ) : (
                                <>Soumettre ma réponse</>
                              )}
                            </Button>
                          </div>
                          
                          {showHint && (
                            <Alert className="mt-4 bg-amber-950/30 border-amber-900/50">
                              <HelpCircle className="h-4 w-4 text-amber-500" />
                              <AlertTitle>Conseils pour une bonne réponse</AlertTitle>
                              <AlertDescription className="text-amber-200">
                                <ul className="list-disc pl-5 space-y-1 mt-2">
                                  <li>Analysez d'abord la situation et identifiez les enjeux de sécurité</li>
                                  <li>Référez-vous aux matériaux fournis pour appuyer votre analyse</li>
                                  <li>Proposez des actions concrètes et justifiez vos choix</li>
                                  <li>Pensez aux impacts potentiels de vos décisions</li>
                                  <li>Respectez les contraintes mentionnées dans l'énoncé</li>
                                </ul>
                              </AlertDescription>
                            </Alert>
                          )}
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
                        
                        {challenge.type === 'scenario' && (
                          <div className="mb-6">
                            <h4 className="font-medium mb-3">Feedback de l'IA sur votre réponse</h4>
                            <div className="border border-blue-600/40 rounded-md p-4 bg-blue-950/20">
                              <div className="flex items-start space-x-3 mb-4">
                                <div className="bg-blue-600 text-white p-2 rounded-full">
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M12 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </div>
                                <div className="flex-1">
                                  <h5 className="font-medium text-blue-300 mb-1">I AM CYBER - Analyse</h5>
                                  <div className="prose prose-invert max-w-none prose-sm">
                                    <p>Votre analyse est pertinente et montre une bonne compréhension des enjeux de sécurité. Vous avez identifié les failles potentielles et proposé des mesures adaptées pour y remédier.</p>
                                    
                                    <h6 className="text-blue-300 mt-3">Points forts</h6>
                                    <ul>
                                      <li>Analyse complète des risques</li>
                                      <li>Utilisation appropriée des concepts de cybersécurité</li>
                                      <li>Solutions techniques bien détaillées</li>
                                    </ul>
                                    
                                    <h6 className="text-blue-300 mt-3">Axes d'amélioration</h6>
                                    <ul>
                                      <li>Pensez à intégrer une analyse des impacts sur l'organisation</li>
                                      <li>Précisez davantage les délais de mise en œuvre des mesures</li>
                                    </ul>
                                    
                                    <div className="bg-gray-800/50 rounded p-3 mt-4 border-l-4 border-blue-500">
                                      <p className="italic text-gray-300">
                                        "Envisagez toujours les implications légales et réglementaires dans vos analyses de sécurité. Le RGPD et les normes ISO peuvent servir de cadre de référence pour vos recommandations."
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="mt-4 pt-4 border-t border-blue-600/20">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2 text-sm">
                                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                    <span className="font-medium text-yellow-300">
                                      Score: <span className="text-yellow-200">85/100</span>
                                    </span>
                                  </div>
                                  <Badge className="bg-green-700 text-white hover:bg-green-800">
                                    Niveau validé
                                  </Badge>
                                </div>
                              </div>
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
                
                {challenge.type === 'scenario' && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Type de réponse</span>
                    <Badge className="bg-purple-900/70 text-purple-200 border-purple-700">
                      Texte libre
                    </Badge>
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
                
                {challenge.type === 'scenario' && (
                  <>
                    <div className="mb-1 flex justify-between text-sm">
                      <span>Progression</span>
                      <span>{showResults ? '1/1' : '0/1'}</span>
                    </div>
                    <Progress 
                      value={showResults ? 100 : userTextResponse.length > 0 ? 50 : 0} 
                      className="h-2" 
                    />
                    {!showResults && (
                      <div className="text-xs text-gray-400 mt-1 text-right">
                        {userTextResponse.length} caractères (min. 50)
                      </div>
                    )}
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