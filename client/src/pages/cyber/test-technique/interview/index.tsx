import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, Clock, AlertTriangle, Award, ChevronRight, ChevronLeft, Home } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import HomeLayout from '@/components/layout/HomeLayout';
import PageTitle from '@/components/utils/PageTitle';
import { apiRequest } from '@/lib/queryClient';

// Types
interface Question {
  id: string;
  text: string;
  type: 'open';
  context?: string;
}

interface InterviewState {
  sessionId: string;
  questions: Question[];
  currentQuestionIndex: number;
  answers: Record<string, string>;
  timeRemaining: number;
  isComplete: boolean;
  profile?: {
    general: string;
    strengths: string[];
    weaknesses: string[];
    badge: {
      name: string;
      justification: string;
    };
  };
}

// Main component
export default function CyberInterviewPage() {
  // State
  const [interviewState, setInterviewState] = useState<InterviewState | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [, navigate] = useLocation();
  
  // Start interview mutation
  const startInterviewMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/cyber/test-technique/interview/start', {
        method: 'POST',
        body: JSON.stringify({})
      });
    },
    onSuccess: (data) => {
      if (data.success) {
        setInterviewState({
          sessionId: data.sessionId,
          questions: data.questions,
          currentQuestionIndex: 0,
          answers: {},
          timeRemaining: data.totalTime,
          isComplete: false
        });
        
        toast({
          title: "Entretien démarré",
          description: "Vous avez 15 minutes pour répondre à toutes les questions. Bonne chance!",
        });
      } else {
        toast({
          title: "Erreur",
          description: data.error || "Impossible de démarrer l'entretien.",
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du démarrage de l'entretien.",
        variant: "destructive",
      });
    }
  });
  
  // Submit answer mutation
  const submitAnswerMutation = useMutation({
    mutationFn: async () => {
      if (!interviewState) return null;
      
      const currentQuestion = interviewState.questions[interviewState.currentQuestionIndex];
      
      return apiRequest('/api/cyber/test-technique/interview/answer', {
        method: 'POST',
        body: JSON.stringify({
          sessionId: interviewState.sessionId,
          questionId: currentQuestion.id,
          answer: currentAnswer
        })
      });
    },
    onSuccess: (data) => {
      if (!interviewState) return;
      
      if (data && data.success) {
        const currentQuestion = interviewState.questions[interviewState.currentQuestionIndex];
        
        // Update answers
        const updatedAnswers = {
          ...interviewState.answers,
          [currentQuestion.id]: currentAnswer
        };
        
        // Determine next question or complete
        const isLastQuestion = interviewState.currentQuestionIndex === interviewState.questions.length - 1;
        
        if (isLastQuestion) {
          completeInterviewMutation.mutate();
        } else {
          setInterviewState({
            ...interviewState,
            answers: updatedAnswers,
            currentQuestionIndex: interviewState.currentQuestionIndex + 1
          });
          setCurrentAnswer('');
        }
      } else {
        toast({
          title: "Erreur",
          description: data?.error || "Impossible de soumettre la réponse.",
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la soumission de la réponse.",
        variant: "destructive",
      });
    }
  });
  
  // Complete interview mutation
  const completeInterviewMutation = useMutation({
    mutationFn: async () => {
      if (!interviewState) return null;
      
      return apiRequest('/api/cyber/test-technique/interview/complete', {
        method: 'POST',
        body: JSON.stringify({
          sessionId: interviewState.sessionId
        })
      });
    },
    onSuccess: (data) => {
      if (!interviewState) return;
      
      if (data && data.success) {
        // Stop timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        
        // Update state with profile
        setInterviewState({
          ...interviewState,
          isComplete: true,
          profile: data.profile
        });
        
        toast({
          title: "Entretien terminé",
          description: "Votre profil a été généré avec succès.",
        });
      } else {
        toast({
          title: "Erreur",
          description: data?.error || "Impossible de terminer l'entretien.",
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la génération du profil.",
        variant: "destructive",
      });
    }
  });
  
  // Timer effect
  useEffect(() => {
    if (interviewState && interviewState.timeRemaining > 0 && !interviewState.isComplete) {
      timerRef.current = setInterval(() => {
        setInterviewState((prev) => {
          if (!prev) return prev;
          
          const newTimeRemaining = prev.timeRemaining - 1;
          
          // Auto-submit when time runs out
          if (newTimeRemaining <= 0) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
            }
            
            const currentQuestion = prev.questions[prev.currentQuestionIndex];
            const updatedAnswers = {
              ...prev.answers,
              [currentQuestion.id]: currentAnswer
            };
            
            completeInterviewMutation.mutate();
            
            return {
              ...prev,
              answers: updatedAnswers,
              timeRemaining: 0
            };
          }
          
          return {
            ...prev,
            timeRemaining: newTimeRemaining
          };
        });
      }, 1000);
      
      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [interviewState?.isComplete, interviewState?.timeRemaining]);
  
  // Helper functions
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const progressPercentage = (): number => {
    if (!interviewState) return 0;
    const { currentQuestionIndex, questions } = interviewState;
    return Math.round((currentQuestionIndex / questions.length) * 100);
  };
  
  const handleStart = () => {
    startInterviewMutation.mutate();
  };
  
  const handleSubmitAnswer = () => {
    if (currentAnswer.trim() === '') {
      toast({
        title: "Réponse requise",
        description: "Veuillez fournir une réponse avant de continuer.",
        variant: "destructive",
      });
      return;
    }
    
    submitAnswerMutation.mutate();
  };
  
  const handlePreviousQuestion = () => {
    if (!interviewState || interviewState.currentQuestionIndex === 0) return;
    
    const prevIndex = interviewState.currentQuestionIndex - 1;
    const prevQuestionId = interviewState.questions[prevIndex].id;
    
    setCurrentAnswer(interviewState.answers[prevQuestionId] || '');
    
    setInterviewState({
      ...interviewState,
      currentQuestionIndex: prevIndex
    });
  };
  
  const handleRestart = () => {
    // Reset state
    setInterviewState(null);
    setCurrentAnswer('');
    
    // Stop timer if running
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Start new interview
    startInterviewMutation.mutate();
  };
  
  const handleGoHome = () => {
    navigate('/cyber/test-technique');
  };
  
  // Render functions
  const renderStartScreen = () => (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="text-2xl">Mode Entretien Cyber</CardTitle>
        <CardDescription>
          Simule un entretien de 15 minutes pour évaluer vos compétences en cybersécurité.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium text-blue-800">À propos de ce module</h3>
          <p className="text-sm text-blue-700 mt-2">
            Ce simulateur d'entretien en cybersécurité vous met en situation d'un entretien réel pendant 15 minutes. 
            Vous répondrez à des questions ouvertes pour évaluer votre capacité à réagir à des situations concrètes, 
            exprimer clairement votre raisonnement et adopter une posture professionnelle adaptée.
          </p>
          <p className="text-sm text-blue-700 mt-2">
            À la fin du test, l'IA générera un profil personnalisé avec vos forces, faiblesses et un badge symbolique.
          </p>
        </div>
        
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-amber-500" />
            <h3 className="font-medium">Durée totale: 15 minutes</h3>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <p className="text-sm text-gray-600">
              Préparez-vous à répondre à 6-7 questions ouvertes sans interruption.
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleGoHome}>
          <Home className="mr-2 h-4 w-4" />
          Retour
        </Button>
        <Button 
          onClick={handleStart}
          disabled={startInterviewMutation.isPending}
        >
          {startInterviewMutation.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Commencer l'entretien
        </Button>
      </CardFooter>
    </Card>
  );
  
  const renderQuestion = () => {
    if (!interviewState) return null;
    
    const { questions, currentQuestionIndex } = interviewState;
    const currentQuestion = questions[currentQuestionIndex];
    
    return (
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl">Question {currentQuestionIndex + 1} sur {questions.length}</CardTitle>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              <span className={`font-mono font-medium ${interviewState.timeRemaining < 60 ? 'text-red-500' : ''}`}>
                {formatTime(interviewState.timeRemaining)}
              </span>
            </div>
          </div>
          <Progress value={progressPercentage()} className="h-2 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="font-medium text-lg">{currentQuestion.text}</div>
          
          {currentQuestion.context && (
            <div className="bg-gray-50 p-4 rounded-lg border text-sm font-mono whitespace-pre-wrap">
              {currentQuestion.context}
            </div>
          )}
          
          <Textarea
            placeholder="Tapez votre réponse ici..."
            className="min-h-[150px]"
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
          />
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0 || submitAnswerMutation.isPending}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Question précédente
          </Button>
          <Button
            onClick={handleSubmitAnswer}
            disabled={submitAnswerMutation.isPending}
          >
            {submitAnswerMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <>
                {currentQuestionIndex < questions.length - 1 ? (
                  <>
                    Question suivante
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Terminer l'entretien
                    <CheckCircle className="ml-2 h-4 w-4" />
                  </>
                )}
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    );
  };
  
  const renderResults = () => {
    if (!interviewState || !interviewState.profile) return null;
    
    const { profile } = interviewState;
    
    return (
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-2xl">Évaluation de l'entretien</CardTitle>
          <CardDescription>
            Voici votre profil d'évaluation généré à partir de vos réponses.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-800 text-lg">🧑‍💼 Profil général</h3>
            <p className="text-blue-700 mt-2 whitespace-pre-line">
              {profile.general}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-lg border p-4">
              <h3 className="font-medium text-green-700 text-lg flex items-center">
                <CheckCircle className="mr-2 h-5 w-5" />
                Forces
              </h3>
              <ul className="mt-2 space-y-2">
                {profile.strengths.map((strength, index) => (
                  <li key={index} className="flex">
                    <div className="min-w-[24px] text-green-500">✓</div>
                    <div>{strength}</div>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="rounded-lg border p-4">
              <h3 className="font-medium text-amber-700 text-lg flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5" />
                Axes de progression
              </h3>
              <ul className="mt-2 space-y-2">
                {profile.weaknesses.map((weakness, index) => (
                  <li key={index} className="flex">
                    <div className="min-w-[24px] text-amber-500">⚠️</div>
                    <div>{weakness}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="rounded-lg border p-4">
            <h3 className="font-medium text-lg flex items-center">
              <Award className="mr-2 h-5 w-5 text-blue-500" />
              Badge attribué
            </h3>
            <div className="mt-2">
              <Badge variant="default" className="text-base py-1 px-3">
                🎖️ {profile.badge.name}
              </Badge>
              <p className="mt-2 text-gray-700">
                {profile.badge.justification}
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleGoHome}>
            <Home className="mr-2 h-4 w-4" />
            Retour à l'accueil
          </Button>
          <Button onClick={handleRestart}>
            Recommencer l'entretien
          </Button>
        </CardFooter>
      </Card>
    );
  };
  
  // Main render
  return (
    <HomeLayout>
      <div className="container mx-auto py-6 space-y-8">
        <PageTitle
          title="Mode Entretien Cyber"
          subtitle="Simulateur d'évaluation en situation d'entretien"
          icon="🎭"
        />
        
        <div className="flex justify-center">
          {!interviewState && renderStartScreen()}
          {interviewState && !interviewState.isComplete && renderQuestion()}
          {interviewState && interviewState.isComplete && renderResults()}
        </div>
      </div>
    </HomeLayout>
  );
}