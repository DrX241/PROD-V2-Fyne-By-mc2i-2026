import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { getBestPracticeById } from '../data/best-practices';
import { Choice } from '../context/GameContext';
import { CheckCircle, XCircle, ChevronRight, AlertCircle } from 'lucide-react';
import { 
  Card, 
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const ConversationChoices: React.FC<{ choices: Choice[], conversationId: string }> = ({ choices, conversationId }) => {
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const { makeChoice, addCompletedChoice, discoverBestPractice } = useGame();
  
  // Lorsqu'une option est sélectionnée
  const handleOptionSelect = (choiceId: string, choice: Choice, optionIndex: number) => {
    setSelectedChoice(choiceId);
    setSelectedOptionIndex(optionIndex);
    setShowFeedback(true);
    
    // Enregistrer le choix dans le contexte du jeu
    makeChoice(choiceId, choice, optionIndex);
    addCompletedChoice(choiceId);
    
    // Si ce choix est associé à une bonne pratique, la découvrir
    // Note: bestPracticeId est une propriété additionnelle qui peut être ajoutée 
    // aux choix depuis les données, mais n'est pas dans l'interface Choice
    if ((choice as any).bestPracticeId) {
      const practice = getBestPracticeById((choice as any).bestPracticeId);
      if (practice) {
        discoverBestPractice(practice);
      }
    }
  };
  
  // Afficher le retour sur le choix effectué
  const renderFeedback = () => {
    if (!selectedChoice || selectedOptionIndex === null) return null;
    
    const choice = choices.find(c => c.id === selectedChoice);
    if (!choice) return null;
    
    const selectedOption = choice.options[selectedOptionIndex];
    const isPositive = selectedOption.impact > 0;
    
    return (
      <Card className={`mt-4 ${isPositive ? 'bg-green-900/30 border-green-800' : 'bg-red-900/30 border-red-800'}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center">
            {isPositive ? (
              <CheckCircle className="h-5 w-5 mr-2 text-green-400" />
            ) : (
              <XCircle className="h-5 w-5 mr-2 text-red-400" />
            )}
            {isPositive ? 'Bonne décision' : 'Décision à risque'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{selectedOption.reason}</p>
        </CardContent>
        <CardFooter className="pt-0">
          <Badge variant={isPositive ? 'default' : 'destructive'}>
            {isPositive ? `+${selectedOption.impact}` : selectedOption.impact} points
          </Badge>
        </CardFooter>
      </Card>
    );
  };
  
  return (
    <div className="space-y-4 mt-6 mb-4">
      <div className="flex items-center">
        <AlertCircle className="h-5 w-5 mr-2 text-yellow-400" />
        <h3 className="text-lg font-semibold">Décision à prendre</h3>
      </div>
      
      {choices.map(choice => (
        <div key={choice.id} className="space-y-3">
          <p className="font-medium text-blue-100">{choice.question}</p>
          
          <div className="grid grid-cols-1 gap-2">
            {choice.options.map((option, idx) => (
              <Button
                key={idx}
                variant="outline"
                className={`justify-start text-left h-auto py-3 text-sm font-normal 
                  ${selectedChoice === choice.id && selectedOptionIndex === idx 
                    ? 'border-blue-500 bg-blue-950/50' 
                    : 'border-blue-800'}`}
                onClick={() => handleOptionSelect(choice.id, choice, idx)}
                disabled={selectedChoice !== null}
              >
                <span className="flex items-start">
                  <ChevronRight className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{option.text}</span>
                </span>
              </Button>
            ))}
          </div>
        </div>
      ))}
      
      {showFeedback && renderFeedback()}
    </div>
  );
};

export default ConversationChoices;