import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TutorialStep {
  title: string;
  content: string;
}

interface TutorialPanelProps {
  steps: TutorialStep[];
  currentStep: number;
  onNext: () => void;
  onComplete: () => void;
}

const TutorialPanel: React.FC<TutorialPanelProps> = ({ 
  steps, 
  currentStep, 
  onNext, 
  onComplete 
}) => {
  const isLastStep = currentStep === steps.length - 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-gray-900 rounded-lg border border-gray-700 p-6 max-w-lg mx-auto shadow-xl"
    >
      <div className="flex items-center mb-2">
        <div className="bg-indigo-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mr-3">
          {currentStep + 1}
        </div>
        <h2 className="text-xl font-bold text-white">{steps[currentStep].title}</h2>
      </div>
      
      <div className="mt-3 text-gray-300">
        <p>{steps[currentStep].content}</p>
      </div>
      
      <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-800">
        <div className="flex space-x-1">
          {steps.map((_, index) => (
            <div 
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === currentStep 
                  ? 'bg-indigo-500' 
                  : index < currentStep 
                    ? 'bg-indigo-700' 
                    : 'bg-gray-700'
              }`}
            />
          ))}
        </div>
        
        <Button 
          onClick={isLastStep ? onComplete : onNext}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          {isLastStep ? "Commencer" : "Suivant"}
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
};

export default TutorialPanel;