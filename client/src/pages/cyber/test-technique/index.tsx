import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiRequest } from '@/lib/queryClient';
import { Loader2, Home, RefreshCcw, CheckCircle, AlertCircle, Award, ArrowRight, ChevronRight, FileText, Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import HomeLayout from '@/components/layout/HomeLayout';
import PageTitle from '@/components/utils/PageTitle';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Types
interface Category {
  id: string;
  name: string;
  icon: string;
}

interface Difficulty {
  id: string;
  name: string;
}

interface Question {
  id: string;
  type: 'mcq' | 'code' | 'scenario' | 'open';
  question: string;
  options?: string[];
  correctAnswer?: number;
  code?: string;
  codeLanguage?: string;
  solution?: string;
  expectedOutput?: string;
  context?: string;
  explanation: string;
  category: string;
  difficulty: string;
  points?: number;
  tags?: string[];
}

interface QuizResponse {
  questionId: string;
  answer: number | string;
}

interface AnalysisResult {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  resources: Array<{
    title: string;
    url?: string;
    description: string;
  }>;
  skillLevel: string;
  nextSteps: string;
  gaps: string;
}

interface EvaluationResult {
  score: number;
  correctCount: number;
  totalQuestions: number;
  detailedResults: Array<{
    questionId: string;
    type: 'mcq' | 'code' | 'scenario' | 'open';
    isCorrect: boolean;
    userAnswer: number | string;
    correctAnswer?: number;
    question: string;
    options?: string[];
    code?: string;
    solution?: string;
    context?: string;
    explanation: string;
  }>;
  analysis?: AnalysisResult;
}

// Main component
export default function CyberTestTechnique() {
  // State
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [selectedExerciseType, setSelectedExerciseType] = useState<string>('');
  const [step, setStep] = useState<'select' | 'quiz' | 'results'>('select');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<QuizResponse[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [evaluationResults, setEvaluationResults] = useState<EvaluationResult | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [certificateHtml, setCertificateHtml] = useState<string>('');
  const [showCertificate, setShowCertificate] = useState(false);

  // Define options interface
  interface ExerciseType {
    id: string;
    name: string;
    description: string;
  }
  
  interface Options {
    categories: Category[];
    difficulties: Difficulty[];
    exerciseTypes: ExerciseType[];
    success?: boolean;
  }

  // Fetch options
  const { data: options, isLoading: isLoadingOptions } = useQuery<Options>({
    queryKey: ['/api/cyber/test-technique/options'],
    retry: 1,
  });

  // Generate questions mutation
  const generateQuestionsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('/api/cyber/test-technique/generate', {
        method: 'POST',
        body: JSON.stringify({
          category: selectedCategory,
          difficulty: selectedDifficulty,
          exerciseType: selectedExerciseType,
          count: 10
        })
      });
      return response;
    },
    onSuccess: (data) => {
      if (data.success && data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        
        // Initialiser les réponses selon le type de question
        const initialResponses = data.questions.map((q: Question) => {
          // Pour les QCM, initialiser à -1 (aucune réponse)
          if (q.type === 'mcq') {
            return { questionId: q.id, answer: -1 };
          } 
          // Pour les autres types (code, scenario, open), initialiser avec une chaîne vide
          else {
            return { questionId: q.id, answer: '' };
          }
        });
        
        setResponses(initialResponses);
        setStep('quiz');
        
        // Ajuster le temps selon le niveau de difficulté et le nombre de questions
        const baseTimePerQuestion = 60; // 60 secondes par question
        const difficultyMultiplier = 
          data.questions[0].difficulty === 'beginner' ? 1 :
          data.questions[0].difficulty === 'intermediate' ? 1.5 :
          data.questions[0].difficulty === 'advanced' ? 2 : 
          data.questions[0].difficulty === 'expert' ? 2.5 : 1;
        
        const totalTime = Math.min(3600, Math.max(600, Math.round(data.questions.length * baseTimePerQuestion * difficultyMultiplier)));
        setTimeLeft(totalTime);
        
        toast({
          title: "Test généré",
          description: `Test de niveau ${getDifficultyName(selectedDifficulty)} généré avec succès. Vous disposez de ${Math.floor(totalTime/60)} minutes. Bonne chance!`,
        });
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de générer les questions. Veuillez réessayer.",
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la génération des questions.",
        variant: "destructive",
      });
    }
  });

  // Evaluate responses mutation
  const evaluateResponsesMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('/api/cyber/test-technique/evaluate', {
        method: 'POST',
        body: JSON.stringify({
          responses,
          category: selectedCategory,
          difficulty: selectedDifficulty,
          exerciseType: selectedExerciseType
        })
      });
      return response;
    },
    onSuccess: (data) => {
      if (data.success) {
        setEvaluationResults(data);
        setStep('results');
        
        // Après avoir reçu les résultats d'évaluation, lancer l'analyse critique approfondie
        setTimeout(() => {
          toast({
            title: "Analyse en cours",
            description: "Notre évaluateur technique senior analyse vos résultats de manière critique...",
          });
          analyzeResultsMutation.mutate();
        }, 1000);
      } else {
        toast({
          title: "Erreur",
          description: "Impossible d'évaluer les réponses. Veuillez réessayer.",
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'évaluation des réponses.",
        variant: "destructive",
      });
    }
  });

  // Analyze results mutation
  const analyzeResultsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('/api/cyber/test-technique/analyze-results', {
        method: 'POST',
        body: JSON.stringify({
          results: evaluationResults,
          category: selectedCategory,
          difficulty: selectedDifficulty
        })
      });
      return response;
    },
    onSuccess: (data) => {
      if (data.success) {
        // Mise à jour des résultats d'évaluation avec l'analyse critique
        setEvaluationResults((prevResults) => {
          if (!prevResults) return null;
          return {
            ...prevResults,
            analysis: data.analysis
          };
        });
        
        toast({
          title: "Analyse complétée",
          description: "Analyse critique de vos résultats générée avec succès.",
        });
      } else {
        toast({
          title: "Erreur d'analyse",
          description: "Impossible d'analyser les résultats en détail. Veuillez réessayer.",
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'analyse des résultats.",
        variant: "destructive",
      });
    }
  });

  // Generate certificate mutation
  const generateCertificateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('/api/cyber/test-technique/certificate', {
        method: 'POST',
        body: JSON.stringify({
          name: userName,
          category: selectedCategory,
          difficulty: selectedDifficulty,
          score: evaluationResults?.score
        })
      });
      return response;
    },
    onSuccess: (data) => {
      if (data.success) {
        setCertificateHtml(data.certificateHTML);
        setShowCertificate(true);
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de générer le certificat. Veuillez réessayer.",
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la génération du certificat.",
        variant: "destructive",
      });
    }
  });

  // Timer effect
  useEffect(() => {
    if (step !== 'quiz' || timeLeft <= 0) return;

    const timerId = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
      
      if (timeLeft <= 1) {
        // Auto-submit when time runs out
        submitQuiz();
      }
    }, 1000);
    
    return () => clearTimeout(timerId);
  }, [timeLeft, step]);

  // Helper functions
  const getCategoryName = (id: string): string => {
    return options?.categories?.find((c: Category) => c.id === id)?.name || id;
  };

  const getDifficultyName = (id: string): string => {
    return options?.difficulties?.find((d: Difficulty) => d.id === id)?.name || id;
  };
  
  const getExerciseTypeName = (id: string): string => {
    return options?.exerciseTypes?.find((t: ExerciseType) => t.id === id)?.name || id;
  };

  // La fonction goToPreviousQuestion est désactivée pour rendre le test plus rigoureux
  const goToPreviousQuestion = () => {
    // Désactivé pour empêcher le retour en arrière pendant le test, rendant l'évaluation plus stricte
    toast({
      title: "Action non autorisée",
      description: "Dans un contexte d'évaluation professionnelle, le retour en arrière n'est pas permis.",
      variant: "destructive",
    });
    return;
  };

  const goToNextQuestion = () => {
    if (questions && Array.isArray(questions) && currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const startQuiz = () => {
    if (!selectedCategory || !selectedDifficulty) {
      toast({
        title: "Sélection requise",
        description: "Veuillez sélectionner une catégorie et un niveau de difficulté.",
        variant: "destructive",
      });
      return;
    }
    
    if (!selectedExerciseType) {
      toast({
        title: "Type d'exercice requis",
        description: "Veuillez sélectionner un type d'exercice pour le test.",
        variant: "destructive",
      });
      return;
    }
    
    generateQuestionsMutation.mutate();
  };

  const submitQuiz = () => {
    // Check if responses is valid
    if (!responses || !Array.isArray(responses)) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue avec vos réponses. Veuillez réessayer.",
        variant: "destructive",
      });
      return;
    }
    
    // Vérifiez si toutes les questions ont été répondues
    const unansweredCount = responses.filter((r, index) => {
      if (!questions || index >= questions.length) return false;
      const questionType = questions[index].type;
      
      // Pour les QCM, vérifier si la réponse est -1 (non répondue)
      if (questionType === 'mcq' && r.answer === -1) {
        return true;
      }
      
      // Pour les autres types, vérifier si la réponse est une chaîne vide
      if (questionType !== 'mcq' && (r.answer === '' || r.answer === undefined)) {
        return true;
      }
      
      return false;
    }).length;
    
    if (unansweredCount > 0 && timeLeft > 10) {
      toast({
        title: "Réponses manquantes",
        description: `Vous n'avez pas répondu à ${unansweredCount} question(s). Êtes-vous sûr de vouloir soumettre?`,
        variant: "destructive",
      });
      return;
    }
    
    evaluateResponsesMutation.mutate();
  };

  const resetQuiz = () => {
    setStep('select');
    setQuestions([]);
    setResponses([]);
    setCurrentQuestion(0);
    setTimeLeft(0);
    setEvaluationResults(null);
    setCertificateHtml('');
    setShowCertificate(false);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Render functions - Style CYBER ACADÉMIE
  const renderSelectionStep = () => (
    <div className="w-full max-w-5xl bg-gradient-to-b from-blue-950 to-slate-950 rounded-lg overflow-hidden shadow-xl border border-blue-800">
      <div className="p-6 border-b border-blue-800">
        <h2 className="text-2xl md:text-3xl font-semibold text-white font-exo">Test Technique de Cybersécurité</h2>
        <p className="text-blue-200 mt-2 font-rajdhani">
          Sélectionnez une catégorie et un niveau de difficulté pour commencer le test.
        </p>
      </div>
      
      <div className="p-6 space-y-6">
        {isLoadingOptions ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-2 text-blue-200">Chargement des options...</span>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-100">Catégorie</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full bg-blue-900/50 border-blue-700 text-white">
                  <SelectValue placeholder="Sélectionnez une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {options?.categories?.map((category: Category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-100">Niveau de difficulté</label>
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger className="w-full bg-blue-900/50 border-blue-700 text-white">
                  <SelectValue placeholder="Sélectionnez un niveau de difficulté" />
                </SelectTrigger>
                <SelectContent>
                  {options?.difficulties?.map((difficulty: Difficulty) => (
                    <SelectItem key={difficulty.id} value={difficulty.id}>
                      {difficulty.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-100">Type d'exercice</label>
              <Select value={selectedExerciseType} onValueChange={setSelectedExerciseType}>
                <SelectTrigger className="w-full bg-blue-900/50 border-blue-700 text-white">
                  <SelectValue placeholder="Sélectionnez un type d'exercice" />
                </SelectTrigger>
                <SelectContent>
                  {options?.exerciseTypes?.map((type: ExerciseType) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedExerciseType && options?.exerciseTypes && (
                <p className="text-sm text-blue-300 mt-1">
                  {options.exerciseTypes.find(t => t.id === selectedExerciseType)?.description || ''}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-100">Votre nom (pour le certificat)</label>
              <input 
                type="text" 
                className="flex h-10 w-full rounded-md border border-blue-700 bg-blue-900/50 px-3 py-2 text-sm text-white ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Ex: Jean Dupont"
              />
            </div>
            
            <div className="bg-blue-900/50 border border-blue-700 p-4 rounded-lg">
              <h3 className="font-medium text-blue-100 font-rajdhani">À propos de ce test</h3>
              <p className="text-sm text-blue-300 mt-2">
                {selectedExerciseType && options?.exerciseTypes ? (
                  <>
                    Ce test comporte 10 questions de type "{getExerciseTypeName(selectedExerciseType)}" 
                    dans la catégorie "{getCategoryName(selectedCategory)}" avec un niveau de difficulté "{getDifficultyName(selectedDifficulty)}".
                    Le temps est limité et le retour en arrière n'est pas autorisé pour simuler des conditions d'évaluation réelles.
                  </>
                ) : 'Sélectionnez un type de test pour voir les détails'}
              </p>
            </div>
          </>
        )}
      </div>
      
      <div className="p-6 border-t border-blue-800 flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => window.location.href = '/cyber'}
          className="bg-blue-900/20 border-blue-700 text-white hover:bg-blue-800/30"
        >
          <Home className="mr-2 h-4 w-4" />
          Retour
        </Button>
        <Button 
          onClick={startQuiz} 
          disabled={isLoadingOptions || !selectedCategory || !selectedDifficulty || !selectedExerciseType || generateQuestionsMutation.isPending}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
        >
          {generateQuestionsMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Génération en cours...
            </>
          ) : (
            <>
              <ArrowRight className="mr-2 h-4 w-4" />
              Commencer le test
            </>
          )}
        </Button>
      </div>
    </div>
  );

  const renderQuizStep = () => (
    <div className="w-full max-w-5xl bg-gradient-to-b from-blue-950 to-slate-950 rounded-lg overflow-hidden shadow-xl border border-blue-800">
      <div className="p-6 border-b border-blue-800">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl md:text-2xl font-semibold text-white font-exo">
              Test Technique: {getCategoryName(selectedCategory)}
            </h2>
            <p className="text-sm text-blue-200 font-rajdhani">
              Difficulté: {getDifficultyName(selectedDifficulty)} | Type: {getExerciseTypeName(selectedExerciseType)}
            </p>
          </div>
          
          <div className="flex items-center">
            <Badge variant="outline" className="bg-blue-900/50 text-blue-200 border-blue-700">
              <Clock className="mr-1 h-3 w-3" /> {formatTime(timeLeft)}
            </Badge>
            <Badge variant="outline" className="ml-2 bg-blue-900/50 text-blue-200 border-blue-700">
              Question {currentQuestion + 1}/{questions.length}
            </Badge>
            <Badge variant="outline" className="ml-2 bg-blue-900/50 text-blue-200 border-blue-700">
              {responses ? responses.filter((r, index) => {
                if (!questions || index >= questions.length) return false;
                const type = questions[index].type;
                return (type === 'mcq' && r.answer !== -1) || 
                       (type !== 'mcq' && r.answer !== '' && r.answer !== undefined);
              }).length : 0} répondue(s)
            </Badge>
          </div>
        </div>
      </div>
      
      <div className="p-6 space-y-6">
        {questions && questions.length > 0 && currentQuestion < questions.length && questions[currentQuestion] && (
          <div className="space-y-6">
            <div className="p-4 bg-blue-900/50 rounded-lg border border-blue-700">
              <div className="flex items-center mb-3">
                <Badge className="bg-blue-700 hover:bg-blue-700 text-white">
                  {questions[currentQuestion].type === 'mcq' ? 'QCM' :
                   questions[currentQuestion].type === 'code' ? 'Code' :
                   questions[currentQuestion].type === 'scenario' ? 'Scénario' : 'Question ouverte'}
                </Badge>
                
                {questions[currentQuestion].points && (
                  <Badge className="ml-2 bg-indigo-700 hover:bg-indigo-700 text-white">
                    {questions[currentQuestion].points} point{questions[currentQuestion].points > 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
              
              <h3 className="text-lg font-medium text-white mb-2 font-rajdhani">{questions[currentQuestion].question}</h3>
              
              {/* Afficher le contexte si disponible */}
              {questions[currentQuestion].context && (
                <div className="p-3 bg-blue-950/70 rounded border border-blue-800 mb-4">
                  <p className="text-sm text-blue-200 whitespace-pre-wrap">{questions[currentQuestion].context}</p>
                </div>
              )}
              
              {/* Afficher le code si disponible */}
              {questions[currentQuestion].code && (
                <div className="p-3 bg-slate-900 rounded border border-slate-700 mb-4 font-mono text-sm text-gray-200 whitespace-pre-wrap overflow-x-auto">
                  {questions[currentQuestion].code}
                </div>
              )}
              
              {/* Options pour QCM */}
              {questions[currentQuestion].type === 'mcq' && questions[currentQuestion].options && (
                <div className="space-y-2 mt-4">
                  {questions[currentQuestion].options.map((option, optionIndex) => (
                    <div 
                      key={optionIndex}
                      onClick={() => handleResponseChange(currentQuestion, optionIndex)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        responses[currentQuestion].answer === optionIndex 
                          ? 'bg-blue-800/70 border-blue-500 text-white' 
                          : 'bg-blue-950/40 border-blue-800 text-blue-200 hover:bg-blue-900/50'
                      }`}
                    >
                      <div className="flex items-start">
                        <div className={`flex-shrink-0 w-5 h-5 mr-2 rounded-full border flex items-center justify-center mt-0.5 ${
                          responses[currentQuestion].answer === optionIndex 
                            ? 'border-blue-400 bg-blue-600' 
                            : 'border-blue-600'
                        }`}>
                          {responses[currentQuestion].answer === optionIndex && (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </div>
                        <span className="whitespace-pre-wrap">{option}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Champ de texte pour autres types de questions */}
              {questions[currentQuestion].type !== 'mcq' && (
                <div className="mt-4">
                  <textarea
                    className="w-full min-h-32 p-3 rounded-lg border border-blue-800 bg-blue-950/40 text-white placeholder:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={responses[currentQuestion].answer as string}
                    onChange={(e) => {
                      const updatedResponses = [...responses];
                      updatedResponses[currentQuestion] = {
                        ...updatedResponses[currentQuestion],
                        answer: e.target.value
                      };
                      setResponses(updatedResponses);
                    }}
                    placeholder={`Saisissez votre réponse ${
                      questions[currentQuestion].type === 'code' ? 'de code' :
                      questions[currentQuestion].type === 'scenario' ? 'au scénario' : ''
                    }...`}
                  />
                </div>
              )}
            </div>
            
            <div className="flex justify-between pt-4">
              <Button 
                variant="outline" 
                onClick={goToPreviousQuestion} 
                disabled={currentQuestion === 0}
                className="bg-blue-900/20 border-blue-700 text-white hover:bg-blue-800/30"
              >
                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Précédent
              </Button>
              
              {currentQuestion < questions.length - 1 ? (
                <Button 
                  onClick={goToNextQuestion}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                >
                  Suivant
                  <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Button>
              ) : (
                <Button 
                  onClick={submitQuiz}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
                  disabled={evaluateResponsesMutation.isPending}
                >
                  {evaluateResponsesMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Évaluation en cours...
                    </>
                  ) : (
                    <>
                      Terminer le test
                      <CheckCircle className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div className="px-6 py-4 border-t border-blue-800">
        <Progress 
          value={(currentQuestion + 1) / questions.length * 100} 
          className="h-2 bg-blue-950"
        />
        <div className="flex justify-between text-xs text-blue-300 mt-1">
          <span>Question {currentQuestion + 1}/{questions.length}</span>
          <span>{formatTime(timeLeft)} restant</span>
        </div>
      </div>
    </div>
  );

  const renderResultsStep = () => (
    <div className="w-full max-w-5xl bg-gradient-to-b from-blue-950 to-slate-950 rounded-lg overflow-hidden shadow-xl border border-blue-800">
      <div className="p-6 border-b border-blue-800">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white font-exo">Résultats du Test</h2>
          
          <div className="flex items-center">
            <Badge variant="outline" className="bg-blue-900/50 text-blue-200 border-blue-700">
              {getCategoryName(selectedCategory)}
            </Badge>
            <Badge variant="outline" className="ml-2 bg-blue-900/50 text-blue-200 border-blue-700">
              {getDifficultyName(selectedDifficulty)}
            </Badge>
          </div>
        </div>
      </div>
      
      <div className="p-6 space-y-6">
        {evaluationResults && (
          <>
            {/* Résultat global */}
            <div className="p-5 bg-blue-900/50 rounded-lg border border-blue-700">
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center bg-blue-800 border-4 border-blue-700">
                  <span className="text-xl font-bold text-white">{Math.round((evaluationResults.score / evaluationResults.totalQuestions) * 100)}%</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-white font-rajdhani">Score: {evaluationResults.score}/{evaluationResults.totalQuestions}</h3>
                  <p className="text-blue-200">Réponses correctes: {evaluationResults.correctCount} sur {evaluationResults.totalQuestions}</p>
                </div>
              </div>
            </div>
            
            {/* Analyse critique des résultats */}
            {evaluationResults.analysis && (
              <div className="p-5 bg-blue-900/50 rounded-lg border border-blue-700">
                <h3 className="text-lg font-medium text-white font-rajdhani mb-3">Analyse critique de votre performance</h3>
                
                <div className="mb-4">
                  <h4 className="text-blue-100 font-medium mb-1">Synthèse</h4>
                  <p className="text-blue-200">{evaluationResults.analysis.summary}</p>
                </div>
                
                <div className="mb-4">
                  <h4 className="text-blue-100 font-medium mb-1">Niveau de compétence évalué</h4>
                  <p className="text-blue-200">{evaluationResults.analysis.skillLevel}</p>
                </div>
                
                <div className="mb-4">
                  <h4 className="text-blue-100 font-medium mb-1">Écarts identifiés</h4>
                  <p className="text-blue-200">{evaluationResults.analysis.gaps}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="text-green-300 font-medium mb-1">Points forts</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {evaluationResults.analysis.strengths.map((strength, index) => (
                        <li key={index} className="text-blue-200">{strength}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-red-300 font-medium mb-1">Points à améliorer</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {evaluationResults.analysis.weaknesses.map((weakness, index) => (
                        <li key={index} className="text-blue-200">{weakness}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h4 className="text-blue-100 font-medium mb-1">Recommandations</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {evaluationResults.analysis.recommendations.map((recommendation, index) => (
                      <li key={index} className="text-blue-200">{recommendation}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="mb-4">
                  <h4 className="text-blue-100 font-medium mb-1">Ressources recommandées</h4>
                  <div className="space-y-2">
                    {evaluationResults.analysis.resources.map((resource, index) => (
                      <div key={index} className="p-2 bg-blue-950/70 rounded border border-blue-800">
                        <h5 className="text-blue-100 font-medium">{resource.title}</h5>
                        <p className="text-sm text-blue-300">{resource.description}</p>
                        {resource.url && (
                          <a 
                            href={resource.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-sm text-blue-400 hover:text-blue-300 inline-flex items-center mt-1"
                          >
                            <span>Accéder à la ressource</span>
                            <ChevronRight className="ml-1 h-3 w-3" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-blue-100 font-medium mb-1">Prochaines étapes</h4>
                  <p className="text-blue-200">{evaluationResults.analysis.nextSteps}</p>
                </div>
              </div>
            )}
            
            {/* Détails des réponses */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white font-rajdhani">Détails des réponses</h3>
              
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-blue-900/30">
                  <TabsTrigger value="all">Toutes</TabsTrigger>
                  <TabsTrigger value="correct">Correctes</TabsTrigger>
                  <TabsTrigger value="incorrect">Incorrectes</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="pt-4 space-y-4">
                  {evaluationResults.detailedResults.map((result, index) => (
                    <div key={index} className={`p-4 rounded-lg border ${
                      result.isCorrect 
                        ? 'bg-green-900/20 border-green-800' 
                        : 'bg-red-900/20 border-red-800'
                    }`}>
                      <div className="flex items-start mb-2">
                        {result.isCorrect ? (
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                        )}
                        <h4 className="text-white font-medium">Question {index + 1}: {result.question}</h4>
                      </div>
                      
                      {result.type === 'mcq' && result.options && (
                        <div className="ml-7 space-y-2 mt-3">
                          {result.options.map((option, optionIndex) => (
                            <div 
                              key={optionIndex}
                              className={`p-2 rounded-md ${
                                optionIndex === result.correctAnswer
                                  ? 'bg-green-900/30 border border-green-800 text-green-200'
                                  : optionIndex === result.userAnswer
                                    ? 'bg-red-900/30 border border-red-800 text-red-200'
                                    : 'bg-blue-900/20 text-blue-200'
                              }`}
                            >
                              <div className="flex items-start">
                                <div className={`flex-shrink-0 w-4 h-4 mr-2 rounded-full border flex items-center justify-center mt-0.5 ${
                                  optionIndex === result.correctAnswer
                                    ? 'border-green-500 bg-green-700' 
                                    : optionIndex === result.userAnswer
                                      ? 'border-red-500 bg-red-700'
                                      : 'border-blue-700'
                                }`}>
                                  {(optionIndex === result.correctAnswer || optionIndex === result.userAnswer) && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                  )}
                                </div>
                                <span className="text-sm">{option}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {result.type !== 'mcq' && (
                        <div className="ml-7 mt-3 space-y-3">
                          <div className="space-y-2">
                            <p className="text-white text-sm font-medium">Votre réponse:</p>
                            <div className="p-2 bg-blue-950/70 rounded border border-blue-800 text-blue-200 text-sm whitespace-pre-wrap">
                              {result.userAnswer as string || "(Pas de réponse)"}
                            </div>
                          </div>
                          
                          {result.solution && (
                            <div className="space-y-2">
                              <p className="text-white text-sm font-medium">Solution:</p>
                              <div className="p-2 bg-green-900/20 rounded border border-green-800 text-green-200 text-sm whitespace-pre-wrap">
                                {result.solution}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="mt-3 p-3 bg-blue-950/70 rounded border border-blue-800 ml-7">
                        <p className="text-sm text-blue-200">{result.explanation}</p>
                      </div>
                    </div>
                  ))}
                </TabsContent>
                
                <TabsContent value="correct" className="pt-4 space-y-4">
                  {evaluationResults.detailedResults
                    .filter(result => result.isCorrect)
                    .map((result, index) => (
                      <div key={index} className="p-4 rounded-lg border bg-green-900/20 border-green-800">
                        <div className="flex items-start mb-2">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <h4 className="text-white font-medium">Question {evaluationResults.detailedResults.findIndex(r => r.questionId === result.questionId) + 1}: {result.question}</h4>
                        </div>
                        
                        <div className="mt-3 p-3 bg-blue-950/70 rounded border border-blue-800 ml-7">
                          <p className="text-sm text-blue-200">{result.explanation}</p>
                        </div>
                      </div>
                    ))}
                </TabsContent>
                
                <TabsContent value="incorrect" className="pt-4 space-y-4">
                  {evaluationResults.detailedResults
                    .filter(result => !result.isCorrect)
                    .map((result, index) => (
                      <div key={index} className="p-4 rounded-lg border bg-red-900/20 border-red-800">
                        <div className="flex items-start mb-2">
                          <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                          <h4 className="text-white font-medium">Question {evaluationResults.detailedResults.findIndex(r => r.questionId === result.questionId) + 1}: {result.question}</h4>
                        </div>
                        
                        {result.type === 'mcq' && result.options && (
                          <div className="ml-7 space-y-2 mt-3">
                            {result.options.map((option, optionIndex) => (
                              <div 
                                key={optionIndex}
                                className={`p-2 rounded-md ${
                                  optionIndex === result.correctAnswer
                                    ? 'bg-green-900/30 border border-green-800 text-green-200'
                                    : optionIndex === result.userAnswer
                                      ? 'bg-red-900/30 border border-red-800 text-red-200'
                                      : 'bg-blue-900/20 text-blue-200'
                                }`}
                              >
                                <div className="flex items-start">
                                  <div className={`flex-shrink-0 w-4 h-4 mr-2 rounded-full border flex items-center justify-center mt-0.5 ${
                                    optionIndex === result.correctAnswer
                                      ? 'border-green-500 bg-green-700' 
                                      : optionIndex === result.userAnswer
                                        ? 'border-red-500 bg-red-700'
                                        : 'border-blue-700'
                                  }`}>
                                    {(optionIndex === result.correctAnswer || optionIndex === result.userAnswer) && (
                                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                    )}
                                  </div>
                                  <span className="text-sm">{option}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {result.type !== 'mcq' && (
                          <div className="ml-7 mt-3 space-y-3">
                            <div className="space-y-2">
                              <p className="text-white text-sm font-medium">Votre réponse:</p>
                              <div className="p-2 bg-blue-950/70 rounded border border-blue-800 text-blue-200 text-sm whitespace-pre-wrap">
                                {result.userAnswer as string || "(Pas de réponse)"}
                              </div>
                            </div>
                            
                            {result.solution && (
                              <div className="space-y-2">
                                <p className="text-white text-sm font-medium">Solution:</p>
                                <div className="p-2 bg-green-900/20 rounded border border-green-800 text-green-200 text-sm whitespace-pre-wrap">
                                  {result.solution}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        
                        <div className="mt-3 p-3 bg-blue-950/70 rounded border border-blue-800 ml-7">
                          <p className="text-sm text-blue-200">{result.explanation}</p>
                        </div>
                      </div>
                    ))}
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Certificat (si demandé) */}
            {showCertificate && certificateHtml && (
              <div className="border border-blue-700 rounded-lg overflow-hidden">
                <div className="p-4 bg-blue-900/40 border-b border-blue-700">
                  <h3 className="text-lg font-medium text-white font-rajdhani">Certificat de réalisation</h3>
                </div>
                <div 
                  className="p-4 bg-white"
                  dangerouslySetInnerHTML={{ __html: certificateHtml }}
                />
              </div>
            )}
          </>
        )}
      </div>
      
      <div className="p-6 border-t border-blue-800 flex justify-between">
        <Button 
          variant="outline" 
          onClick={resetQuiz}
          className="bg-blue-900/20 border-blue-700 text-white hover:bg-blue-800/30"
        >
          <RefreshCcw className="mr-2 h-4 w-4" />
          Recommencer
        </Button>
        
        {evaluationResults && !showCertificate && (
          <Button 
            onClick={() => generateCertificateMutation.mutate()}
            disabled={generateCertificateMutation.isPending || !userName}
            className="bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 text-white"
          >
            {generateCertificateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Génération en cours...
              </>
            ) : (
              <>
                <Award className="mr-2 h-4 w-4" />
                Générer un certificat
              </>
            )}
          </Button>
        )}
        
        {showCertificate && (
          <Button 
            onClick={() => window.print()}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
          >
            <FileText className="mr-2 h-4 w-4" />
            Imprimer le certificat
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <HomeLayout>
      <PageTitle title="Test Technique de Cybersécurité" />
      <div className="min-h-[calc(100vh-64px)] relative overflow-hidden bg-gradient-to-b from-blue-950 to-slate-950">
        <div className="absolute top-4 left-4 z-20">
          <Button 
            variant="outline" 
            className="bg-blue-900/20 border-blue-700 text-white hover:bg-blue-800/30 hover:text-white"
            onClick={() => window.location.href = '/cyber'}
          >
            <Home className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </div>
        <div className="container py-8 px-4 mx-auto flex flex-col items-center justify-center">
          {step === 'select' && renderSelectionStep()}
          {step === 'quiz' && renderQuizStep()}
          {step === 'results' && renderResultsStep()}
        </div>
      </div>
    </HomeLayout>
  );
}