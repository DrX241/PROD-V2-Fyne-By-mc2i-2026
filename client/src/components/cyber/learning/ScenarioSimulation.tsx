import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, User, Award } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { motion } from 'framer-motion';

interface ScenarioStep {
  id: string;
  description: string;
  options: {
    id: string;
    text: string;
  }[];
  correct_option: string;
  explication: string;
}

interface ScenarioProps {
  scenario: {
    titre?: string;
    contexte?: string;
    etapes?: ScenarioStep[];
  };
  onComplete: () => void;
}

export function ScenarioSimulation({ scenario, onComplete }: ScenarioProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  
  const steps = scenario.etapes || [];
  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;
  
  // Vérifier si l'option sélectionnée est correcte
  const isCorrect = currentStep && selectedOptions[currentStep.id] === currentStep.correct_option;
  
  // Gérer la sélection d'une option
  const handleOptionSelect = (optionId: string) => {
    if (showFeedback) return; // Empêcher la modification pendant le feedback
    
    setSelectedOptions({
      ...selectedOptions,
      [currentStep.id]: optionId
    });
  };
  
  // Vérifier la réponse et afficher le feedback
  const handleCheckAnswer = () => {
    if (!currentStep || !selectedOptions[currentStep.id]) return;
    
    setShowFeedback(true);
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
  };
  
  // Passer à l'étape suivante ou terminer
  const handleNextStep = () => {
    setShowFeedback(false);
    
    if (isLastStep) {
      setCompleted(true);
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };
  
  if (!scenario.titre || !scenario.contexte || steps.length === 0) {
    return (
      <Card className="p-6 text-center">
        <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Scénario non disponible</h3>
        <p className="mb-4 text-gray-600">Ce module ne contient pas de scénario interactif.</p>
        <Button 
          className="bg-indigo-600 hover:bg-indigo-700" 
          onClick={onComplete}
        >
          Continuer <CheckCircle className="ml-2 h-4 w-4" />
        </Button>
      </Card>
    );
  }
  
  if (completed) {
    const percentage = Math.round((score / steps.length) * 100);
    return (
      <Card className="p-6 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Award className="h-16 w-16 text-indigo-600 mx-auto mb-4" />
          <h3 className="text-2xl font-semibold mb-2">Scénario complété!</h3>
          <p className="mb-4 text-gray-600">
            Vous avez obtenu <span className="font-semibold text-indigo-600">{score} sur {steps.length}</span> ({percentage}%)
          </p>
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700" 
            onClick={onComplete}
          >
            Continuer <CheckCircle className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      </Card>
    );
  }
  
  return (
    <Card className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-indigo-900">{scenario.titre}</h3>
          <Badge variant="outline" className="bg-indigo-50 text-indigo-700">
            Étape {currentStepIndex + 1}/{steps.length}
          </Badge>
        </div>
        
        <p className="mb-4 text-gray-700">{scenario.contexte}</p>
        
        <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100 mb-6">
          <p className="text-indigo-800">{currentStep?.description}</p>
        </div>
      </div>
      
      <RadioGroup 
        value={selectedOptions[currentStep?.id || '']} 
        onValueChange={handleOptionSelect}
        className="space-y-3 mb-6"
      >
        {currentStep?.options.map(option => (
          <div
            key={option.id}
            className={`flex items-start space-x-2 p-3 border rounded-lg cursor-pointer transition-colors ${
              showFeedback && option.id === currentStep.correct_option
                ? 'bg-green-50 border-green-200'
                : showFeedback && option.id === selectedOptions[currentStep.id] && !isCorrect
                ? 'bg-red-50 border-red-200'
                : 'bg-white border-gray-200 hover:border-indigo-200'
            }`}
          >
            <RadioGroupItem 
              value={option.id} 
              id={option.id} 
              className="mt-1"
              disabled={showFeedback}
            />
            <Label 
              htmlFor={option.id} 
              className="flex-grow cursor-pointer font-normal"
            >
              {option.text}
            </Label>
            {showFeedback && option.id === currentStep.correct_option && (
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
            )}
          </div>
        ))}
      </RadioGroup>
      
      {showFeedback && (
        <div className={`p-4 mb-6 rounded-lg ${
          isCorrect ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'
        }`}>
          <h4 className={`font-medium mb-2 ${
            isCorrect ? 'text-green-700' : 'text-orange-700'
          }`}>
            {isCorrect ? 'Bonne réponse!' : 'Pas tout à fait...'}
          </h4>
          <p className="text-gray-700">{currentStep?.explication}</p>
        </div>
      )}
      
      <div className="flex justify-end">
        {!showFeedback ? (
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700" 
            onClick={handleCheckAnswer}
            disabled={!selectedOptions[currentStep?.id || '']}
          >
            Vérifier
          </Button>
        ) : (
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700" 
            onClick={handleNextStep}
          >
            {isLastStep ? 'Terminer' : 'Continuer'}
          </Button>
        )}
      </div>
    </Card>
  );
}