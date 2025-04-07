import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, LightbulbIcon } from 'lucide-react';

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
  const step = steps[currentStep];

  return (
    <Card className="w-full max-w-lg bg-gray-900 border-cyan-600 border-2 shadow-lg shadow-cyan-500/20">
      <CardHeader className="bg-gray-800 p-6 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-cyan-500/20">
            <LightbulbIcon className="w-6 h-6 text-cyan-400" />
          </div>
          <CardTitle className="text-xl text-white">
            {step.title}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <p className="text-gray-300 leading-relaxed">
          {step.content}
        </p>
        
        <div className="mt-4 flex justify-center">
          <div className="flex space-x-2">
            {steps.map((_, index) => (
              <div 
                key={index}
                className={`h-2 w-10 rounded-full ${
                  index === currentStep 
                    ? 'bg-cyan-500' 
                    : index < currentStep 
                      ? 'bg-cyan-800' 
                      : 'bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-800 p-4 border-t border-gray-700 flex justify-end">
        <Button 
          className="bg-cyan-600 hover:bg-cyan-700 text-white"
          onClick={isLastStep ? onComplete : onNext}
        >
          {isLastStep ? 'Commencer' : 'Suivant'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TutorialPanel;