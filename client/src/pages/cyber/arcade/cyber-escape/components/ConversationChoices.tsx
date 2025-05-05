import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ThumbsUp, 
  ThumbsDown 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useGame, Choice } from '../context/GameContext';

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
  const { makeChoice } = useGame();
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<Choice | null>(null);

  const handleChoiceSelection = (choiceId: string) => {
    setSelectedChoiceId(choiceId);
    const choice = choices.find(c => c.id === choiceId) || null;
    setSelectedChoice(choice);
  };

  const handleSubmitChoice = () => {
    if (!selectedChoiceId || !selectedChoice) return;
    
    makeChoice(`${conversationId}-${selectedChoiceId}`, selectedChoice);
    setShowResult(true);
    
    // Notifier le parent que la sélection est terminée après un délai
    setTimeout(() => {
      onChoiceMade();
    }, 2500);
  };

  return (
    <Card className="bg-blue-900/30 border-blue-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-4 w-4 text-blue-300" />
          Prenez une décision
        </CardTitle>
        <CardDescription>
          Votre choix aura un impact sur la sécurité de l'entreprise
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!showResult ? (
          <RadioGroup
            value={selectedChoiceId || ""}
            onValueChange={handleChoiceSelection}
            className="space-y-3"
          >
            {choices.map((choice) => (
              <div
                key={choice.id}
                className={`flex items-start space-x-2 rounded-md border p-3 ${
                  selectedChoiceId === choice.id
                    ? 'bg-blue-800/50 border-blue-500'
                    : 'border-blue-800 hover:border-blue-700'
                }`}
              >
                <RadioGroupItem value={choice.id} id={`choice-${choice.id}`} className="mt-1" />
                <Label
                  htmlFor={`choice-${choice.id}`}
                  className="flex-1 cursor-pointer text-sm leading-snug"
                >
                  {choice.text}
                </Label>
              </div>
            ))}
          </RadioGroup>
        ) : selectedChoice ? (
          <Alert className={
            selectedChoice.impact > 0
              ? "bg-green-900/30 border-green-800"
              : "bg-red-900/30 border-red-800"
          }>
            <div className="flex gap-2">
              {selectedChoice.impact > 0 ? (
                <ThumbsUp className="h-4 w-4 text-green-400" />
              ) : (
                <ThumbsDown className="h-4 w-4 text-red-400" />
              )}
              <AlertTitle>
                {selectedChoice.impact > 0 ? "Bon choix" : "Choix risqué"}
              </AlertTitle>
            </div>
            <AlertDescription className="mt-2 text-sm">
              {selectedChoice.consequence}
            </AlertDescription>
          </Alert>
        ) : null}
      </CardContent>
      <CardFooter className="justify-between">
        {!showResult ? (
          <>
            <div>
              {selectedChoice && (
                <Badge
                  variant={selectedChoice.impact > 0 ? "default" : "destructive"}
                  className="gap-1"
                >
                  {selectedChoice.impact > 0 ? (
                    <>
                      <CheckCircle2 className="h-3 w-3" />
                      <span>+{selectedChoice.impact} pts</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-3 w-3" />
                      <span>{selectedChoice.impact} pts</span>
                    </>
                  )}
                </Badge>
              )}
            </div>
            <Button
              onClick={handleSubmitChoice}
              disabled={!selectedChoiceId}
              className="gap-2"
            >
              Confirmer ma décision
            </Button>
          </>
        ) : (
          <div className="w-full text-right text-sm text-blue-300 italic">
            La conversation va continuer...
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default ConversationChoices;