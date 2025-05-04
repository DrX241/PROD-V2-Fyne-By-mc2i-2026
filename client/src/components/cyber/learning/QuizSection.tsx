import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface Question {
  id: string;
  question: string;
  key_concepts: string[];
}

interface Evaluation {
  score: number;
  feedback: string;
  strengths: string[];
  areas_to_improve: string[];
  explanation: string;
}

interface QuizSectionProps {
  questions: Question[];
  userResponses: Record<string, string>;
  evaluations: Record<string, Evaluation>;
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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  if (!questions || questions.length === 0) {
    return (
      <Card className="p-6 text-center">
        <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Quiz non disponible</h3>
        <p className="mb-4 text-gray-600">Ce module ne contient pas de questions.</p>
        <Button 
          className="bg-indigo-600 hover:bg-indigo-700" 
          onClick={onComplete}
        >
          Continuer <CheckCircle className="ml-2 h-4 w-4" />
        </Button>
      </Card>
    );
  }
  
  const currentQuestion = questions[currentQuestionIndex];
  const hasResponse = !!userResponses[currentQuestion.id];
  const hasEvaluation = !!evaluations[currentQuestion.id];
  const evaluation = evaluations[currentQuestion.id];
  
  const handleChangeResponse = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentResponse(e.target.value);
  };
  
  const handleSubmitResponse = () => {
    if (!currentResponse.trim()) return;
    onSubmitResponse(currentQuestion.id, currentResponse);
    setCurrentResponse('');
  };
  
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      onComplete();
    }
  };
  
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };
  
  // Calculer le nombre de questions complétées
  const completedCount = Object.keys(evaluations).length;
  const completionPercentage = questions.length > 0 
    ? Math.round((completedCount / questions.length) * 100) 
    : 0;
  
  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-indigo-900">Quiz d'évaluation</h3>
        <div className="text-sm text-gray-600">
          Question {currentQuestionIndex + 1} sur {questions.length} | {completionPercentage}% complété
        </div>
      </div>
      
      <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100 mb-6">
        <p className="text-indigo-800 font-medium mb-1">Question {currentQuestionIndex + 1}:</p>
        <p className="text-indigo-900">{currentQuestion.question}</p>
      </div>
      
      {hasEvaluation ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mb-4">
            <p className="text-gray-700 font-medium mb-2">Votre réponse:</p>
            <p className="text-gray-800">{userResponses[currentQuestion.id]}</p>
          </div>
          
          <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
            <div className="flex justify-between items-center mb-2">
              <p className="text-indigo-900 font-medium">Évaluation:</p>
              <span className="text-indigo-700">
                Score: {Math.round(evaluation.score * 100)}%
              </span>
            </div>
            
            <p className="text-indigo-800 mb-3">{evaluation.feedback}</p>
            
            {evaluation.strengths.length > 0 && (
              <div className="mb-3">
                <p className="text-green-700 font-medium">Points forts:</p>
                <ul className="list-disc pl-5 text-green-800">
                  {evaluation.strengths.map((strength, idx) => (
                    <li key={idx}>{strength}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {evaluation.areas_to_improve.length > 0 && (
              <div>
                <p className="text-orange-700 font-medium">Points à améliorer:</p>
                <ul className="list-disc pl-5 text-orange-800">
                  {evaluation.areas_to_improve.map((area, idx) => (
                    <li key={idx}>{area}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </motion.div>
      ) : (
        <div className="mb-6">
          <Textarea
            placeholder="Rédigez votre réponse ici..."
            className="min-h-[150px] mb-2"
            value={hasResponse ? userResponses[currentQuestion.id] : currentResponse}
            onChange={handleChangeResponse}
            disabled={hasResponse || isSubmitting}
          />
          <p className="text-xs text-gray-500 mb-4">
            Essayez d'aborder les aspects essentiels de la question pour une évaluation optimale.
          </p>
          
          {isSubmitting && (
            <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
              <Loader2 className="animate-spin h-5 w-5 mr-2 text-indigo-600" />
              <p>Évaluation en cours...</p>
            </div>
          )}
        </div>
      )}
      
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0}
        >
          Question précédente
        </Button>
        
        <div className="flex gap-2">
          {!hasResponse && (
            <Button 
              className="bg-indigo-600 hover:bg-indigo-700" 
              onClick={handleSubmitResponse}
              disabled={!currentResponse.trim() || isSubmitting}
            >
              Soumettre
            </Button>
          )}
          
          <Button 
            variant={hasEvaluation ? "default" : "outline"}
            className={hasEvaluation ? "bg-indigo-600 hover:bg-indigo-700" : ""}
            onClick={handleNextQuestion}
            disabled={!hasEvaluation && (!hasResponse || isSubmitting)}
          >
            {currentQuestionIndex === questions.length - 1 ? 'Terminer' : 'Question suivante'}
          </Button>
        </div>
      </div>
    </Card>
  );
}