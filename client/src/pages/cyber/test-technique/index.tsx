import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiRequest } from '@/lib/queryClient';
import { Loader2, Home, RefreshCcw, CheckCircle, AlertCircle, Award, ArrowRight, ChevronRight, FileText } from 'lucide-react';
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
  analysis: AnalysisResult;
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
          difficulty: selectedDifficulty
        })
      });
      return response;
    },
    onSuccess: (data) => {
      if (data.success) {
        setEvaluationResults(data);
        setStep('results');
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

  const handleResponseChange = (questionIndex: number, optionIndex: number) => {
    if (!responses || !Array.isArray(responses) || questionIndex < 0 || questionIndex >= responses.length) {
      return;
    }
    
    const updatedResponses = [...responses];
    updatedResponses[questionIndex] = {
      ...updatedResponses[questionIndex],
      answer: optionIndex
    };
    setResponses(updatedResponses);
  };

  const goToNextQuestion = () => {
    if (questions && Array.isArray(questions) && currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
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

  // Render functions
  const renderSelectionStep = () => (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="text-2xl">Test Technique de Cybersécurité</CardTitle>
        <CardDescription>
          Sélectionnez une catégorie et un niveau de difficulté pour commencer le test.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoadingOptions ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-2">Chargement des options...</span>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">Catégorie</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full">
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
              <label className="text-sm font-medium">Niveau de difficulté</label>
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger className="w-full">
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
              <label className="text-sm font-medium">Type d'exercice</label>
              <Select value={selectedExerciseType} onValueChange={setSelectedExerciseType}>
                <SelectTrigger className="w-full">
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
                <p className="text-sm text-gray-500 mt-1">
                  {options.exerciseTypes.find(t => t.id === selectedExerciseType)?.description || ''}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Votre nom (pour le certificat)</label>
              <input 
                type="text" 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Ex: Jean Dupont"
              />
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-800">À propos de ce test</h3>
              <p className="text-sm text-blue-700 mt-2">
                Ce test comporte 10 questions à choix multiples et dure 10 minutes. Vous pouvez naviguer librement entre les questions avant de soumettre vos réponses.
              </p>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => window.location.href = '/cyber'}>
          <Home className="mr-2 h-4 w-4" />
          Retour
        </Button>
        <Button 
          onClick={startQuiz} 
          disabled={isLoadingOptions || !selectedCategory || !selectedDifficulty || !selectedExerciseType || generateQuestionsMutation.isPending}
        >
          {generateQuestionsMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Préparation du test...
            </>
          ) : (
            <>
              Commencer le test
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );

  const renderQuizStep = () => (
    <Card className="w-full max-w-4xl">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl">
              Test: {getCategoryName(selectedCategory)}
            </CardTitle>
            <CardDescription>
              Niveau: {getDifficultyName(selectedDifficulty)} | Type: {getExerciseTypeName(selectedExerciseType)}
            </CardDescription>
          </div>
          <div className={`text-lg font-mono ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-gray-700'}`}>
            {formatTime(timeLeft)}
          </div>
        </div>
        <div className="mt-2">
          <Progress value={questions && questions.length > 0 ? ((currentQuestion + 1) / questions.length * 100) : 0} className="h-2" />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Question {currentQuestion + 1} sur {questions ? questions.length : 0}</span>
            <span>{responses && questions ? responses.filter((r, index) => {
              if (!questions || index >= questions.length) return false;
              const type = questions[index].type;
              return (type === 'mcq' && r.answer !== -1) || 
                     (type !== 'mcq' && r.answer !== '' && r.answer !== undefined);
            }).length : 0} répondue(s)</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {questions && questions.length > 0 && currentQuestion < questions.length && questions[currentQuestion] && (
          <div className="space-y-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center mb-3">
                <div className={`text-xs font-semibold px-2 py-1 rounded mr-2 ${
                  questions[currentQuestion].type === 'mcq' ? 'bg-blue-100 text-blue-700' :
                  questions[currentQuestion].type === 'code' ? 'bg-green-100 text-green-700' :
                  questions[currentQuestion].type === 'scenario' ? 'bg-amber-100 text-amber-700' :
                  'bg-purple-100 text-purple-700'
                }`}>
                  {questions[currentQuestion].type === 'mcq' ? 'QCM' :
                   questions[currentQuestion].type === 'code' ? 'Code' :
                   questions[currentQuestion].type === 'scenario' ? 'Scénario' :
                   'Question ouverte'}
                </div>
                <h3 className="text-lg font-medium text-blue-600">
                  {questions[currentQuestion].question}
                </h3>
              </div>
              
              {/* QCM */}
              {questions[currentQuestion].type === 'mcq' && questions[currentQuestion].options && (
                <div className="space-y-3">
                  {questions[currentQuestion].options.map((option, index) => (
                    <div 
                      key={index}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        responses && responses[currentQuestion] && responses[currentQuestion].answer === index 
                          ? 'bg-blue-100 border-blue-500' 
                          : 'hover:bg-gray-100 border-gray-200'
                      }`}
                      onClick={() => handleResponseChange(currentQuestion, index)}
                    >
                      <div className="flex items-start">
                        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mr-2 ${
                          responses && responses[currentQuestion] && responses[currentQuestion].answer === index 
                            ? 'bg-white text-blue-600 border border-blue-500' 
                            : 'bg-white text-gray-700 border border-gray-300'
                        }`}>
                          {String.fromCharCode(65 + index)}
                        </div>
                        <div className="flex-grow text-black">
                          {option}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Exercice de code */}
              {questions[currentQuestion].type === 'code' && (
                <div className="space-y-4">
                  {questions[currentQuestion].codeLanguage && (
                    <div className="bg-black text-white px-3 py-1 rounded text-xs inline-block">
                      {questions[currentQuestion].codeLanguage}
                    </div>
                  )}
                  
                  {questions[currentQuestion].code && (
                    <div className="bg-gray-900 text-white p-4 rounded-md overflow-x-auto font-mono text-sm whitespace-pre">
                      {questions[currentQuestion].code}
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Votre solution :</label>
                    <textarea 
                      className="w-full min-h-[150px] p-3 border border-gray-300 rounded-md font-mono text-sm"
                      value={responses && responses[currentQuestion] ? String(responses[currentQuestion].answer || '') : ''}
                      onChange={(e) => {
                        const updatedResponses = [...responses];
                        updatedResponses[currentQuestion] = {
                          ...updatedResponses[currentQuestion],
                          answer: e.target.value
                        };
                        setResponses(updatedResponses);
                      }}
                      placeholder="Écrivez votre code ici..."
                    />
                  </div>
                  
                  {questions[currentQuestion].expectedOutput && (
                    <div className="p-3 bg-gray-100 rounded-md">
                      <p className="text-sm font-medium mb-1">Résultat attendu :</p>
                      <p className="text-xs font-mono">{questions[currentQuestion].expectedOutput}</p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Scénario */}
              {questions[currentQuestion].type === 'scenario' && (
                <div className="space-y-4">
                  {questions[currentQuestion].context && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-md text-sm">
                      <p className="font-medium mb-2">Contexte :</p>
                      <p>{questions[currentQuestion].context}</p>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Votre solution :</label>
                    <textarea 
                      className="w-full min-h-[150px] p-3 border border-gray-300 rounded-md text-sm"
                      value={responses && responses[currentQuestion] ? String(responses[currentQuestion].answer || '') : ''}
                      onChange={(e) => {
                        const updatedResponses = [...responses];
                        updatedResponses[currentQuestion] = {
                          ...updatedResponses[currentQuestion],
                          answer: e.target.value
                        };
                        setResponses(updatedResponses);
                      }}
                      placeholder="Décrivez votre approche et solution..."
                    />
                  </div>
                </div>
              )}
              
              {/* Question ouverte */}
              {questions[currentQuestion].type === 'open' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Votre réponse :</label>
                    <textarea 
                      className="w-full min-h-[150px] p-3 border border-gray-300 rounded-md text-sm"
                      value={responses && responses[currentQuestion] ? String(responses[currentQuestion].answer || '') : ''}
                      onChange={(e) => {
                        const updatedResponses = [...responses];
                        updatedResponses[currentQuestion] = {
                          ...updatedResponses[currentQuestion],
                          answer: e.target.value
                        };
                        setResponses(updatedResponses);
                      }}
                      placeholder="Écrivez votre réponse détaillée..."
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex gap-2">
          <Button variant="outline" onClick={goToPreviousQuestion} disabled={currentQuestion === 0}>
            Précédent
          </Button>
          <Button variant="outline" onClick={goToNextQuestion} disabled={!questions || currentQuestion >= (questions.length - 1)}>
            Suivant
          </Button>
        </div>
        <Button 
          onClick={submitQuiz}
          disabled={evaluateResponsesMutation.isPending}
        >
          {evaluateResponsesMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Évaluation...
            </>
          ) : (
            "Soumettre"
          )}
        </Button>
      </CardFooter>
    </Card>
  );

  const renderResultsStep = () => (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Résultats du Test</CardTitle>
            <CardDescription>
              {getCategoryName(selectedCategory)} - Niveau {getDifficultyName(selectedDifficulty)}
            </CardDescription>
          </div>
          {evaluationResults && (
            <div className="text-center">
              <div className={`text-4xl font-bold ${
                evaluationResults.score >= 80 ? 'text-green-600' :
                evaluationResults.score >= 60 ? 'text-amber-600' : 'text-red-600'
              }`}>
                {Math.round(evaluationResults.score)}%
              </div>
              <div className="text-sm text-gray-500">
                {evaluationResults.correctCount}/{evaluationResults.totalQuestions} correctes
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {!evaluationResults ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-2">Analyse des résultats...</span>
          </div>
        ) : (
          <>
            {showCertificate ? (
              <div className="border rounded-lg overflow-hidden">
                <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                  <h3 className="font-medium">Certificat de compétence</h3>
                  <Button variant="outline" size="sm" onClick={() => {
                    const win = window.open('', '_blank');
                    if (win) {
                      win.document.write(certificateHtml);
                      win.document.close();
                      win.focus();
                    }
                  }}>
                    <FileText className="h-4 w-4 mr-1" />
                    Imprimer
                  </Button>
                </div>
                <div className="p-4 max-h-[500px] overflow-auto">
                  <div dangerouslySetInnerHTML={{ __html: certificateHtml }} />
                </div>
              </div>
            ) : (
              <Tabs defaultValue="summary">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="summary">Synthèse</TabsTrigger>
                  <TabsTrigger value="details">Détails</TabsTrigger>
                  <TabsTrigger value="recommendations">Recommandations</TabsTrigger>
                </TabsList>
                
                <TabsContent value="summary" className="space-y-4 pt-4">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-2 text-blue-600">Analyse globale</h3>
                    <p className="text-black">{evaluationResults.analysis?.summary}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4 bg-green-50">
                      <h3 className="font-semibold text-green-700 mb-2 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Points forts
                      </h3>
                      <ul className="space-y-2">
                        {evaluationResults.analysis?.strengths.map((strength, index) => (
                          <li key={index} className="flex items-start">
                            <ChevronRight className="h-4 w-4 text-green-500 mt-1 mr-1 flex-shrink-0" />
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="border rounded-lg p-4 bg-amber-50">
                      <h3 className="font-semibold text-amber-700 mb-2 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Points à améliorer
                      </h3>
                      <ul className="space-y-2">
                        {evaluationResults.analysis?.weaknesses.map((weakness, index) => (
                          <li key={index} className="flex items-start">
                            <ChevronRight className="h-4 w-4 text-amber-500 mt-1 mr-1 flex-shrink-0" />
                            <span>{weakness}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Niveau de compétence actuel</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1">
                        {evaluationResults.analysis?.skillLevel}
                      </Badge>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="details" className="space-y-4 pt-4">
                  <div className="space-y-4">
                    {evaluationResults.detailedResults.map((result, index) => (
                      <div 
                        key={index}
                        className={`border rounded-lg overflow-hidden ${
                          result.isCorrect ? 'border-green-200' : 'border-red-200'
                        }`}
                      >
                        <div className={`p-3 flex items-start gap-2 ${
                          result.isCorrect ? 'bg-green-50' : 'bg-red-50'
                        }`}>
                          {result.isCorrect ? (
                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                          )}
                          <div className="flex-grow">
                            <div className="flex items-center gap-2">
                              {/* Badge de type */}
                              <div className={`text-xs font-semibold px-2 py-1 rounded ${
                                result.type === 'mcq' ? 'bg-blue-100 text-blue-700' :
                                result.type === 'code' ? 'bg-green-100 text-green-700' :
                                result.type === 'scenario' ? 'bg-amber-100 text-amber-700' :
                                'bg-purple-100 text-purple-700'
                              }`}>
                                {result.type === 'mcq' ? 'QCM' :
                                 result.type === 'code' ? 'Code' :
                                 result.type === 'scenario' ? 'Scénario' :
                                 'Question ouverte'}
                              </div>
                              <div className="font-medium text-black">
                                Question {index + 1}: {result.question}
                              </div>
                            </div>
                            <div className="text-sm mt-1">
                              {result.isCorrect ? (
                                <span className="text-green-600">
                                  {result.type === 'mcq' ? 'Réponse correcte!' : 'Solution acceptée!'}
                                </span>
                              ) : (
                                <span className="text-red-600">
                                  {result.type === 'mcq' ? (
                                    <>
                                      Votre réponse: {typeof result.userAnswer === 'number' ? 
                                        `${String.fromCharCode(65 + result.userAnswer)} (${result.options?.[result.userAnswer as number] || 'N/A'})` : 
                                        'Non répondu'} 
                                      | Réponse correcte: {result.correctAnswer !== undefined ? 
                                        `${String.fromCharCode(65 + result.correctAnswer)} (${result.options?.[result.correctAnswer] || 'N/A'})` : 
                                        'N/A'}
                                    </>
                                  ) : (
                                    'Solution incorrecte ou incomplète'
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Affichage du code pour les exercices de code */}
                        {result.type === 'code' && (
                          <div className="border-t border-gray-200 p-3 bg-gray-50">
                            <div className="text-sm font-medium mb-2">Votre solution:</div>
                            <div className="bg-gray-900 text-white p-3 rounded-md overflow-x-auto font-mono text-xs mb-3 whitespace-pre">
                              {typeof result.userAnswer === 'string' ? result.userAnswer : '// Aucune solution fournie'}
                            </div>
                            
                            {result.solution && (
                              <>
                                <div className="text-sm font-medium mb-2">Solution attendue:</div>
                                <div className="bg-gray-900 text-white p-3 rounded-md overflow-x-auto font-mono text-xs whitespace-pre">
                                  {result.solution}
                                </div>
                              </>
                            )}
                          </div>
                        )}
                        
                        {/* Affichage pour les scénarios */}
                        {result.type === 'scenario' && result.context && (
                          <div className="border-t border-gray-200 p-3 bg-amber-50">
                            <div className="text-sm font-medium mb-2">Contexte:</div>
                            <p className="text-sm">{result.context}</p>
                            
                            <div className="mt-3 text-sm font-medium mb-2">Votre solution:</div>
                            <div className="bg-white p-2 rounded border border-gray-200">
                              <p className="text-sm">{typeof result.userAnswer === 'string' ? result.userAnswer : 'Aucune solution fournie'}</p>
                            </div>
                          </div>
                        )}

                        {/* Affichage pour les questions ouvertes */}
                        {result.type === 'open' && (
                          <div className="border-t border-gray-200 p-3 bg-purple-50">
                            <div className="text-sm font-medium mb-2">Votre réponse:</div>
                            <div className="bg-white p-2 rounded border border-gray-200">
                              <p className="text-sm">{typeof result.userAnswer === 'string' ? result.userAnswer : 'Aucune réponse fournie'}</p>
                            </div>
                          </div>
                        )}
                        
                        <div className="p-3 bg-white border-t border-gray-200">
                          <div className="text-sm font-medium mb-2 text-blue-600">Explication:</div>
                          <p className="text-sm text-black">{result.explanation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="recommendations" className="space-y-4 pt-4">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-2 text-blue-600">Recommandations</h3>
                    <ul className="space-y-2">
                      {evaluationResults.analysis?.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start">
                          <ChevronRight className="h-4 w-4 text-blue-500 mt-1 mr-1 flex-shrink-0" />
                          <span className="text-black">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-2 text-blue-600">Ressources recommandées</h3>
                    <div className="space-y-3">
                      {evaluationResults.analysis?.resources.map((resource, index) => (
                        <div key={index} className="border-b pb-3 last:border-0 last:pb-0">
                          <h4 className="font-medium text-black">{resource.title}</h4>
                          <p className="text-sm text-black mt-1">{resource.description}</p>
                          {resource.url && (
                            <a 
                              href={resource.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline mt-1 inline-block"
                            >
                              Accéder à la ressource
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4 bg-blue-50">
                    <h3 className="font-semibold text-blue-700 mb-2">Prochaines étapes</h3>
                    <p className="text-black">{evaluationResults.analysis?.nextSteps}</p>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={resetQuiz}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Nouveau test
        </Button>
        {!showCertificate && evaluationResults && evaluationResults.score >= 60 && (
          <Button 
            onClick={() => generateCertificateMutation.mutate()}
            disabled={generateCertificateMutation.isPending || !userName}
          >
            {generateCertificateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Génération...
              </>
            ) : (
              <>
                <Award className="mr-2 h-4 w-4" />
                Générer un certificat
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );

  return (
    <HomeLayout>
      <PageTitle title="Test Technique" />
      <div className="min-h-[calc(100vh-64px)] relative overflow-hidden bg-gradient-to-b from-gray-900 via-gray-900 to-purple-900">
        <div className="absolute top-4 left-4 z-20">
          <Button 
            variant="outline" 
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
            onClick={() => window.location.href = '/cyber'}
          >
            <Home className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </div>
        
        <div className="absolute inset-0 w-full h-full opacity-20">
          <div className="absolute inset-0 bg-[#1a0033] overflow-hidden">
            <div className="absolute top-0 left-0 right-0 bottom-0 grid grid-cols-12 gap-3 opacity-30">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="border-r border-purple-500/20 h-full"></div>
              ))}
            </div>
            <div className="absolute top-0 left-0 right-0 bottom-0 grid grid-rows-12 gap-3 opacity-30">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="border-b border-purple-500/20 w-full"></div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="relative z-10 pt-16 pb-10 px-4 flex flex-col items-center">
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              Test Technique Cybersécurité
            </h1>
            <p className="text-purple-200 mt-2 max-w-2xl mx-auto">
              Évaluez vos connaissances en cybersécurité et recevez un feedback détaillé avec des recommandations personnalisées.
            </p>
          </div>
          
          {step === 'select' && renderSelectionStep()}
          {step === 'quiz' && renderQuizStep()}
          {step === 'results' && renderResultsStep()}
        </div>
      </div>
    </HomeLayout>
  );
}