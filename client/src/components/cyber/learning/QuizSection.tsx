import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, ThumbsUp, ChevronRight } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface QuizQuestion {
  id: string;
  question: string;
  key_concepts: string[];
}

interface QuizSectionProps {
  questions: QuizQuestion[];
  userResponses: Record<string, string>;
  evaluations: Record<string, any>;
  isSubmitting: boolean;
  onSubmitResponse: (questionId: string, response: string) => void;
  onComplete: () => void;
}

export function QuizSection({ 
  questions,
  userResponses,
  evaluations,
  isSubmitting,
  onSubmitResponse,
  onComplete
}: QuizSectionProps) {
  const [currentResponse, setCurrentResponse] = useState<string>('');
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);
  
  const currentQuestion = questions[activeQuestionIndex];
  const hasResponse = !!userResponses[currentQuestion?.id];
  const evaluation = currentQuestion ? evaluations[currentQuestion.id] : null;
  
  const handleSubmitResponse = () => {
    if (currentQuestion && currentResponse.trim()) {
      onSubmitResponse(currentQuestion.id, currentResponse.trim());
    }
  };
  
  const handleNext = () => {
    if (activeQuestionIndex < questions.length - 1) {
      setActiveQuestionIndex(prevIndex => prevIndex + 1);
      setCurrentResponse(userResponses[questions[activeQuestionIndex + 1]?.id] || '');
    } else {
      onComplete();
    }
  };
  
  const handlePrevious = () => {
    if (activeQuestionIndex > 0) {
      setActiveQuestionIndex(prevIndex => prevIndex - 1);
      setCurrentResponse(userResponses[questions[activeQuestionIndex - 1]?.id] || '');
    }
  };
  
  if (!currentQuestion) {
    return (
      <Card className="p-6">
        <div className="text-center p-8">
          <p className="text-gray-500">Aucune question disponible pour ce module.</p>
          <Button onClick={onComplete} className="mt-4">
            Continuer
          </Button>
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-indigo-900">Quiz d'évaluation</h2>
          <div className="text-sm text-gray-500">
            Question {activeQuestionIndex + 1} sur {questions.length}
          </div>
        </div>
        
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <p className="text-gray-800 text-lg mb-4">{currentQuestion.question}</p>
          
          <Textarea
            placeholder="Entrez votre réponse ici..."
            value={hasResponse ? userResponses[currentQuestion.id] : currentResponse}
            onChange={(e) => setCurrentResponse(e.target.value)}
            className="min-h-32 mb-4"
            disabled={hasResponse}
          />
          
          {!hasResponse && (
            <div className="flex justify-end">
              <Button 
                onClick={handleSubmitResponse}
                disabled={isSubmitting || !currentResponse.trim()}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Évaluation en cours...
                  </>
                ) : (
                  <>
                    Soumettre
                    <Send className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          )}
          
          {evaluation && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
              className="mt-6"
            >
              <Alert variant={evaluation.score >= 0.7 ? "default" : "destructive"}>
                <AlertTitle className="flex items-center gap-2">
                  <ThumbsUp className={`h-5 w-5 ${evaluation.score >= 0.7 ? 'text-green-500' : 'text-orange-500'}`} />
                  Évaluation ({Math.round(evaluation.score * 100)}%)
                </AlertTitle>
                <AlertDescription className="mt-2">
                  <p className="mb-2">{evaluation.feedback}</p>
                  
                  {evaluation.strengths?.length > 0 && (
                    <div className="mb-2">
                      <h4 className="text-sm font-medium text-green-700">Points forts:</h4>
                      <ul className="text-sm space-y-1 mt-1">
                        {evaluation.strengths.map((strength: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <span className="text-green-500 mr-1.5">✓</span>
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {evaluation.areas_to_improve?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-orange-700">Axes d'amélioration:</h4>
                      <ul className="text-sm space-y-1 mt-1">
                        {evaluation.areas_to_improve.map((area: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <span className="text-orange-500 mr-1.5">→</span>
                            {area}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </motion.div>
      </div>
      
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handlePrevious}
          disabled={activeQuestionIndex === 0}
        >
          Question précédente
        </Button>
        
        <Button 
          onClick={handleNext}
          disabled={!hasResponse}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          {activeQuestionIndex === questions.length - 1 ? "Terminer" : "Question suivante"}
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}