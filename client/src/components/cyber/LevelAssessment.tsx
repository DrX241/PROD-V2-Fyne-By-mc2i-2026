import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";
import { useChatContext } from "@/contexts/ChatContext";
import { Loader2 } from "lucide-react";

interface Option {
  id: string;
  text: string;
  level?: string;
}

interface Question {
  id: string;
  text: string;
  options: Option[];
}

interface LevelAssessmentProps {
  domain: string;
  onComplete: () => void;
}

export default function LevelAssessment({ domain, onComplete }: LevelAssessmentProps) {
  const { updateUserLevel } = useChatContext();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Charger les questions au montage du composant
  React.useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        // La réponse de l'API contient un objet avec une propriété "questions"
        const response = await apiRequest<{questions: Question[]}>(`/api/cyber/assessment/questions?domain=${encodeURIComponent(domain)}`, {
          method: 'GET'
        });
        
        // Vérifier si nous avons bien reçu des questions
        if (response && response.questions && Array.isArray(response.questions)) {
          console.log("Questions reçues:", response.questions);
          setQuestions(response.questions);
        } else {
          console.error('Format de réponse inattendu:', response);
          setError('Format de réponse inattendu. Veuillez réessayer.');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Erreur lors du chargement des questions:', err);
        setError('Impossible de charger les questions. Veuillez réessayer.');
        setLoading(false);
      }
    };
    
    fetchQuestions();
  }, [domain]);
  
  const handleAnswerChange = (questionId: string, optionId: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };
  
  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };
  
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };
  
  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      
      // Vérifier que toutes les questions ont une réponse
      const allQuestionsAnswered = questions.every(q => answers[q.id]);
      
      if (!allQuestionsAnswered) {
        setError('Veuillez répondre à toutes les questions avant de soumettre.');
        setSubmitting(false);
        return;
      }
      
      // Déterminer le niveau d'expertise basé sur les réponses
      const levelCounts: Record<string, number> = { 
        'débutant': 0, 
        'confirmé': 0, 
        'senior': 0, 
        'expert': 0 
      };
      
      // Calculer le niveau prédominant en fonction des options choisies
      questions.forEach(question => {
        const answerId = answers[question.id];
        if (answerId) {
          const option = question.options.find(opt => opt.id === answerId);
          if (option && option.level) {
            levelCounts[option.level] = (levelCounts[option.level] || 0) + 1;
          }
        }
      });
      
      // Déterminer le niveau prédominant
      let determinedLevel = 'débutant';
      let maxCount = 0;
      
      for (const [level, count] of Object.entries(levelCounts)) {
        if (count > maxCount) {
          maxCount = count;
          determinedLevel = level;
        }
      }
      
      // Envoyer les réponses et le niveau déterminé au serveur
      const response = await apiRequest<{ level: string, feedback: any }>('/api/cyber/assessment/submit', {
        method: 'POST',
        body: JSON.stringify({
          domain,
          answers,
          result: determinedLevel
        })
      });
      
      // Mettre à jour le niveau d'expertise dans le contexte
      updateUserLevel(response.level);
      
      // Indiquer que l'évaluation est terminée
      setSubmitting(false);
      onComplete();
      
    } catch (err) {
      console.error('Erreur lors de la soumission des réponses:', err);
      setError('Une erreur est survenue lors de l\'évaluation. Veuillez réessayer.');
      setSubmitting(false);
    }
  };
  
  // Afficher un état de chargement
  if (loading) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardContent className="pt-6 flex flex-col items-center justify-center min-h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-center text-muted-foreground">Chargement des questions d'évaluation...</p>
        </CardContent>
      </Card>
    );
  }
  
  // Afficher une erreur
  if (error) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Erreur</CardTitle>
          <CardDescription>Une erreur est survenue</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Réessayer</Button>
        </CardContent>
      </Card>
    );
  }
  
  // Si pas de questions, afficher un message
  if (questions.length === 0) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Aucune question disponible pour ce domaine.</p>
        </CardContent>
      </Card>
    );
  }
  
  const currentQuestion = questions[currentQuestionIndex];
  const progress = (currentQuestionIndex + 1) / questions.length * 100;
  
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Évaluation du niveau d'expertise</CardTitle>
        <CardDescription>
          Répondez aux questions suivantes pour que nous puissions adapter le contenu à votre niveau d'expertise.
        </CardDescription>
        <Progress value={progress} className="mt-2" />
        <p className="text-sm text-muted-foreground mt-1">
          Question {currentQuestionIndex + 1} sur {questions.length}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="font-medium text-lg mb-4">{currentQuestion.text}</h3>
            
            <RadioGroup 
              value={answers[currentQuestion.id] || ''}
              onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
              className="space-y-3"
            >
              {currentQuestion.options.map(option => (
                <div key={option.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.id} id={option.id} />
                  <Label htmlFor={option.id} className="flex-grow">
                    {option.text}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          <div className="flex justify-between pt-4">
            <Button 
              variant="outline" 
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
            >
              Précédent
            </Button>
            
            {currentQuestionIndex < questions.length - 1 ? (
              <Button 
                onClick={handleNext}
                disabled={!answers[currentQuestion.id]}
              >
                Suivant
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit}
                disabled={!answers[currentQuestion.id] || submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Traitement en cours...
                  </>
                ) : (
                  'Terminer l\'évaluation'
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}