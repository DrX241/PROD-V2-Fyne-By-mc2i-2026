import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Check, X, AlertTriangle, ArrowRight, Award, BarChart } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { apiRequest } from '@/lib/queryClient';

// Types adaptés de shared/types/quiz.ts
interface QuizOption {
  id: string;
  text: string;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  category: string;
  difficulty: string;
}

interface QuestionWithUIState extends QuizQuestion {
  selectedOptionId?: string;
  isCorrect?: boolean;
  explanation?: string;
  isAnswered: boolean;
}

interface QuizFeedback {
  overallAssessment: string;
  strengths: string[];
  weaknesses: string[];
  recommendedTopics: string[];
  skillLevel: "débutant" | "intermédiaire" | "avancé";
}

interface QuizResult {
  score: number;
  totalQuestions: number;
  responses: any[];
  feedback: QuizFeedback;
}

const CyberQuizPage: React.FC = () => {
  const { toast } = useToast();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuestionWithUIState[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  
  // Initialiser le quiz
  useEffect(() => {
    const startQuiz = async () => {
      try {
        setIsLoading(true);
        const response = await apiRequest<{sessionId: string, questions: any[]}>('/api/quiz/start', {
          method: 'POST',
          body: JSON.stringify({
            userId: 'user-' + Math.random().toString(36).substring(2, 10),
            balanced: true
          })
        });
        
        setSessionId(response.sessionId);
        setQuestions(response.questions.map(q => ({
          ...q,
          isAnswered: false
        })));
        setIsLoading(false);
      } catch (error) {
        console.error('Erreur lors du démarrage du quiz:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger le quiz. Veuillez réessayer.',
          variant: 'destructive'
        });
        setIsLoading(false);
      }
    };
    
    startQuiz();
  }, [toast]);
  
  // Gérer la sélection d'une réponse
  const handleOptionSelect = async (questionId: string, optionId: string) => {
    if (!sessionId || isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      const response = await apiRequest<{isCorrect: boolean, explanation: string}>('/api/quiz/submit-answer', {
        method: 'POST',
        body: JSON.stringify({
          sessionId,
          questionId,
          optionId
        })
      });
      
      // Mettre à jour la question avec la réponse sélectionnée
      setQuestions(prevQuestions => 
        prevQuestions.map(q => 
          q.id === questionId 
            ? { 
                ...q, 
                selectedOptionId: optionId, 
                isCorrect: response.isCorrect, 
                explanation: response.explanation,
                isAnswered: true
              } 
            : q
        )
      );
      
      setIsSubmitting(false);
      
      // Fournir un feedback visuel
      toast({
        title: response.isCorrect ? 'Bonne réponse !' : 'Mauvaise réponse',
        description: response.isCorrect 
          ? 'Félicitations, votre réponse est correcte.' 
          : 'Ce n\'est pas la bonne réponse.',
        variant: response.isCorrect ? 'default' : 'destructive'
      });
      
    } catch (error) {
      console.error('Erreur lors de la soumission de la réponse:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de soumettre votre réponse. Veuillez réessayer.',
        variant: 'destructive'
      });
      setIsSubmitting(false);
    }
  };
  
  // Passer à la question suivante
  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    } else {
      // Si c'était la dernière question, terminer le quiz
      completeQuiz();
    }
  };
  
  // Terminer le quiz et obtenir les résultats
  const completeQuiz = async () => {
    if (!sessionId) return;
    
    try {
      setIsLoading(true);
      
      const response = await apiRequest<QuizResult>('/api/quiz/complete', {
        method: 'POST',
        body: JSON.stringify({
          sessionId
        })
      });
      
      setQuizResult(response);
      setQuizCompleted(true);
      setIsLoading(false);
      
    } catch (error) {
      console.error('Erreur lors de la finalisation du quiz:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de finaliser le quiz. Veuillez réessayer.',
        variant: 'destructive'
      });
      setIsLoading(false);
    }
  };
  
  // Redémarrer le quiz
  const restartQuiz = () => {
    setSessionId(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setQuizCompleted(false);
    setQuizResult(null);
    setIsLoading(true);
    
    const startQuiz = async () => {
      try {
        const response = await apiRequest<{sessionId: string, questions: any[]}>('/api/quiz/start', {
          method: 'POST',
          body: JSON.stringify({
            userId: 'user-' + Math.random().toString(36).substring(2, 10),
            balanced: true
          })
        });
        
        setSessionId(response.sessionId);
        setQuestions(response.questions.map(q => ({
          ...q,
          isAnswered: false
        })));
        setIsLoading(false);
      } catch (error) {
        console.error('Erreur lors du redémarrage du quiz:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de redémarrer le quiz. Veuillez réessayer.',
          variant: 'destructive'
        });
        setIsLoading(false);
      }
    };
    
    startQuiz();
  };
  
  // Calcul de l'état actuel du quiz
  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 
    ? Math.round(((currentQuestionIndex + 1) / questions.length) * 100) 
    : 0;
  const answeredQuestions = questions.filter(q => q.isAnswered).length;
  const allQuestionsAnswered = answeredQuestions === questions.length;
  
  // Déterminer la couleur en fonction de la difficulté
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };
  
  // Afficher l'écran de chargement
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-blue-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg mx-auto shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Test de Cybersécurité</CardTitle>
            <CardDescription>Chargement du quiz...</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-10">
            <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Afficher les résultats du quiz
  if (quizCompleted && quizResult) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-blue-900 p-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-4xl mx-auto"
        >
          <Card className="shadow-xl">
            <CardHeader className="text-center bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
              <div className="mb-4 flex justify-center">
                <Award className="h-16 w-16 text-yellow-300" />
              </div>
              <CardTitle className="text-3xl font-bold">Résultats du Quiz</CardTitle>
              <CardDescription className="text-blue-100 text-lg">
                Vous avez obtenu un score de {Math.round(quizResult.score)}%
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-6 space-y-6">
              <div className="flex flex-col space-y-4">
                <h3 className="text-xl font-semibold">Évaluation globale</h3>
                <p className="text-gray-700">{quizResult.feedback.overallAssessment}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="text-green-700 font-semibold flex items-center mb-2">
                      <Check className="mr-2 h-5 w-5" />
                      Points forts
                    </h4>
                    <ul className="list-disc list-inside space-y-1">
                      {quizResult.feedback.strengths.map((strength, i) => (
                        <li key={i} className="text-gray-700">{strength}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <h4 className="text-amber-700 font-semibold flex items-center mb-2">
                      <AlertTriangle className="mr-2 h-5 w-5" />
                      Points à améliorer
                    </h4>
                    <ul className="list-disc list-inside space-y-1">
                      {quizResult.feedback.weaknesses.map((weakness, i) => (
                        <li key={i} className="text-gray-700">{weakness}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h4 className="text-lg font-semibold mb-2 flex items-center">
                    <BarChart className="mr-2 h-5 w-5 text-blue-600" />
                    Niveau de compétence
                  </h4>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-blue-800 capitalize">{quizResult.feedback.skillLevel}</p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h4 className="text-lg font-semibold mb-2">Sujets recommandés</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {quizResult.feedback.recommendedTopics.map((topic, i) => (
                      <div 
                        key={i} 
                        className="p-3 bg-indigo-50 rounded-lg border border-indigo-200 flex items-center"
                      >
                        <ArrowRight className="h-4 w-4 text-indigo-600 mr-2 flex-shrink-0" />
                        <span className="text-gray-700">{topic}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="mt-4">
                  <h3 className="text-xl font-semibold mb-4">Détail des réponses</h3>
                  <div className="space-y-4">
                    {questions.map((q, i) => (
                      <div 
                        key={q.id} 
                        className="p-4 rounded-lg border border-gray-200 bg-gray-50"
                      >
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium text-gray-900">Question {i + 1}</h4>
                          {q.isCorrect ? (
                            <span className="text-green-600 flex items-center">
                              <Check className="h-4 w-4 mr-1" /> Correct
                            </span>
                          ) : (
                            <span className="text-red-600 flex items-center">
                              <X className="h-4 w-4 mr-1" /> Incorrect
                            </span>
                          )}
                        </div>
                        <p className="text-gray-700">{q.question}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-center p-6 bg-gray-50">
              <Button 
                onClick={restartQuiz}
                className="w-full sm:w-auto"
              >
                Recommencer le quiz
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    );
  }
  
  // Afficher la question actuelle
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-blue-900 p-4 py-10 flex flex-col">
      <div className="w-full max-w-3xl mx-auto flex-grow">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="text-white font-medium">
              Question {currentQuestionIndex + 1} sur {questions.length}
            </div>
            <div className="text-white">
              {answeredQuestions} / {questions.length} répondue(s)
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            {currentQuestion && (
              <Card className="shadow-xl">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div className={`text-xs font-medium rounded-full px-2.5 py-1 ${getDifficultyColor(currentQuestion.difficulty)}`}>
                      {currentQuestion.difficulty === 'easy' ? 'Facile' :
                       currentQuestion.difficulty === 'medium' ? 'Intermédiaire' : 'Difficile'}
                    </div>
                    <div className="text-xs font-medium bg-blue-100 text-blue-800 rounded-full px-2.5 py-1">
                      {currentQuestion.category}
                    </div>
                  </div>
                  <CardTitle className="text-xl sm:text-2xl font-bold mt-3">{currentQuestion.question}</CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {currentQuestion.options.map((option) => (
                    <div 
                      key={option.id}
                      onClick={() => {
                        if (!currentQuestion.isAnswered && !isSubmitting) {
                          handleOptionSelect(currentQuestion.id, option.id);
                        }
                      }}
                      className={`p-4 rounded-lg border cursor-pointer transition-all transform hover:scale-[1.01] ${
                        currentQuestion.isAnswered
                          ? currentQuestion.selectedOptionId === option.id
                            ? currentQuestion.isCorrect
                              ? 'border-green-500 bg-green-50' // Réponse sélectionnée et correcte
                              : 'border-red-500 bg-red-50' // Réponse sélectionnée mais incorrecte
                            : 'border-gray-200 bg-white opacity-70' // Réponse non sélectionnée
                          : 'border-gray-200 bg-white hover:border-blue-500 hover:shadow-md' // Question non répondue
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`w-5 h-5 rounded-full mr-3 flex items-center justify-center ${
                          currentQuestion.isAnswered && currentQuestion.selectedOptionId === option.id
                            ? currentQuestion.isCorrect
                              ? 'bg-green-500 text-white'
                              : 'bg-red-500 text-white'
                            : 'border border-gray-300'
                        }`}>
                          {currentQuestion.isAnswered && currentQuestion.selectedOptionId === option.id && (
                            currentQuestion.isCorrect 
                              ? <Check className="h-3 w-3" />
                              : <X className="h-3 w-3" />
                          )}
                        </div>
                        <span className="text-gray-800">{option.text}</span>
                      </div>
                    </div>
                  ))}
                  
                  {/* Explication de la réponse */}
                  {currentQuestion.isAnswered && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.3 }}
                      className={`mt-4 p-4 rounded-lg ${
                        currentQuestion.isCorrect 
                          ? 'bg-green-50 border border-green-200' 
                          : 'bg-amber-50 border border-amber-200'
                      }`}
                    >
                      <h3 className={`font-semibold mb-2 ${
                        currentQuestion.isCorrect 
                          ? 'text-green-700' 
                          : 'text-amber-700'
                      }`}>
                        {currentQuestion.isCorrect 
                          ? <span className="flex items-center"><Check className="h-4 w-4 mr-1" /> Bonne réponse</span>
                          : <span className="flex items-center"><X className="h-4 w-4 mr-1" /> Mauvaise réponse</span>
                        }
                      </h3>
                      <p className="text-gray-700">{currentQuestion.explanation}</p>
                    </motion.div>
                  )}
                </CardContent>
                
                <CardFooter className="flex justify-between">
                  <div></div> {/* Spacer pour justification */}
                  <Button
                    disabled={!currentQuestion.isAnswered || isSubmitting}
                    onClick={goToNextQuestion}
                    className="flex items-center"
                  >
                    {currentQuestionIndex < questions.length - 1 ? (
                      <>Question suivante <ArrowRight className="ml-2 h-4 w-4" /></>
                    ) : (
                      <>Terminer le quiz</>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CyberQuizPage;