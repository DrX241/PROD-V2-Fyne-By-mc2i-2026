import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, AlertTriangle, ChevronRight } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ScenarioOption {
  id: string;
  text: string;
}

interface ScenarioStep {
  id: string;
  description: string;
  options: ScenarioOption[];
  correct_option: string;
  explication: string;
}

interface ScenarioProps {
  scenario: {
    titre: string;
    contexte: string;
    etapes: ScenarioStep[];
  };
  onComplete: () => void;
}

export function ScenarioSimulation({ scenario, onComplete }: ScenarioProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  
  const currentStep = scenario.etapes[currentStepIndex];
  const isLastStep = currentStepIndex === scenario.etapes.length - 1;
  const totalSteps = scenario.etapes.length;
  
  const handleSelectOption = (optionId: string) => {
    setSelectedOption(optionId);
    setShowExplanation(true);
    
    // Mise à jour du score
    if (optionId === currentStep.correct_option) {
      setScore(prevScore => prevScore + 1);
    }
    
    // Marquer cette étape comme complétée
    setCompletedSteps(prev => [...prev, currentStep.id]);
  };
  
  const handleNextStep = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStepIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    }
  };
  
  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-indigo-900 mb-2">{scenario.titre}</h2>
        <p className="text-gray-700 italic border-l-4 border-indigo-300 pl-3 py-2 bg-indigo-50/50">
          {scenario.contexte}
        </p>
        
        <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
          <div>Étape {currentStepIndex + 1} sur {totalSteps}</div>
          <div>Score: {score}/{completedSteps.length}</div>
        </div>
      </div>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep.id}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-6">
            <p className="text-gray-800 mb-4">{currentStep.description}</p>
            
            <div className="space-y-3">
              {currentStep.options.map((option) => (
                <div
                  key={option.id}
                  onClick={() => !selectedOption && handleSelectOption(option.id)}
                  className={`p-4 rounded-lg border transition-all cursor-pointer 
                    ${selectedOption ? (
                      option.id === currentStep.correct_option 
                        ? 'border-green-300 bg-green-50' 
                        : option.id === selectedOption 
                          ? 'border-red-300 bg-red-50' 
                          : 'border-gray-200 opacity-50'
                    ) : 'border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50'}
                  `}
                >
                  <div className="flex">
                    {selectedOption && (
                      <div className="mr-3 mt-0.5">
                        {option.id === currentStep.correct_option ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : option.id === selectedOption ? (
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        ) : null}
                      </div>
                    )}
                    <div>
                      {option.text}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {showExplanation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
                className="mt-4"
              >
                <Alert variant={selectedOption === currentStep.correct_option ? "default" : "destructive"}>
                  <div className="flex gap-3">
                    {selectedOption === currentStep.correct_option ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <AlertTriangle className="h-5 w-5" />
                    )}
                    <div>
                      <AlertTitle>
                        {selectedOption === currentStep.correct_option 
                          ? "Bonne réponse !" 
                          : "Ce n'est pas la meilleure approche"}
                      </AlertTitle>
                      <AlertDescription className="mt-2">
                        {currentStep.explication}
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>
              </motion.div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
      
      {selectedOption && (
        <div className="flex justify-end">
          <Button 
            onClick={handleNextStep}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {isLastStep ? "Terminer le scénario" : "Étape suivante"}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </Card>
  );
}