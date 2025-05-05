import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Choice } from '../context/GameContext';

interface ConversationChoicesProps {
  choices: Choice[];
  conversationId: string;
  onChoiceMade: () => void;
}

const ConversationChoices: React.FC<ConversationChoicesProps> = ({ 
  choices, 
  conversationId,
  onChoiceMade
}) => {
  const { addSecurityPoints, deductPoints, addCompletedChoice } = useGame();
  const [currentChoiceIndex, setCurrentChoiceIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number>(-1);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState({ impact: 0, reason: '' });
  
  const currentChoice = choices[currentChoiceIndex];
  
  const handleSubmit = () => {
    if (selectedOption === -1) return;
    
    const selectedChoiceOption = currentChoice.options[selectedOption];
    const { impact, reason } = selectedChoiceOption;
    
    setFeedback({ impact, reason });
    setShowFeedback(true);
    
    // Enregistrer le choix comme complété
    addCompletedChoice(`${conversationId}-${currentChoice.id}`);
    
    // Appliquer l'impact sur les points de sécurité
    if (impact > 0) {
      addSecurityPoints(impact, `Choix judicieux : ${currentChoice.question}`);
    } else if (impact < 0) {
      deductPoints(Math.abs(impact), `Mauvais choix : ${currentChoice.question}`);
    }
  };
  
  const handleNext = () => {
    // Si c'est le dernier choix, informer le parent que tous les choix ont été faits
    if (currentChoiceIndex >= choices.length - 1) {
      onChoiceMade();
      return;
    }
    
    // Sinon, passer au choix suivant
    setCurrentChoiceIndex(currentChoiceIndex + 1);
    setSelectedOption(-1);
    setShowFeedback(false);
  };
  
  if (!currentChoice) return null;
  
  return (
    <div className="bg-blue-800/40 rounded-lg p-4 border border-blue-700 space-y-4 my-4">
      <h3 className="font-semibold mb-2">Décision de cybersécurité</h3>
      
      <p className="text-sm mb-4">{currentChoice.question}</p>
      
      {!showFeedback ? (
        <>
          <RadioGroup 
            value={selectedOption.toString()} 
            onValueChange={(value) => setSelectedOption(parseInt(value))}
            className="space-y-3"
          >
            {currentChoice.options.map((option, idx) => (
              <div className="flex items-start space-x-2" key={idx}>
                <RadioGroupItem value={idx.toString()} id={`option-${idx}`} className="mt-1" />
                <Label htmlFor={`option-${idx}`} className="text-sm cursor-pointer">
                  {option.text}
                </Label>
              </div>
            ))}
          </RadioGroup>
          
          <div className="flex justify-end mt-4">
            <Button 
              onClick={handleSubmit}
              disabled={selectedOption === -1}
            >
              Confirmer votre décision
            </Button>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div className={`p-3 rounded ${
            feedback.impact > 0 
              ? 'bg-green-800/40 border border-green-700' 
              : feedback.impact < 0 
                ? 'bg-red-800/40 border border-red-700' 
                : 'bg-gray-800/40 border border-gray-700'
          }`}>
            <h4 className="font-medium mb-1">
              {feedback.impact > 0 
                ? `Bonne décision (+${feedback.impact} points)` 
                : feedback.impact < 0 
                  ? `Mauvaise décision (${feedback.impact} points)` 
                  : 'Décision neutre'}
            </h4>
            <p className="text-sm">{feedback.reason}</p>
          </div>
          
          <div className="flex justify-end">
            <Button onClick={handleNext}>
              {currentChoiceIndex >= choices.length - 1 ? 'Terminer' : 'Choix suivant'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationChoices;