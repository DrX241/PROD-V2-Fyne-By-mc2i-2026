import React from 'react';
import { BinaryDecision } from '@shared/types/cyber';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { useChatContext } from '@/contexts/ChatContext';
import { AlertTriangle, Check } from 'lucide-react';

interface BinaryDecisionMessageProps {
  decision: BinaryDecision;
}

const BinaryDecisionMessage: React.FC<BinaryDecisionMessageProps> = ({ decision }) => {
  const { makeDecision } = useChatContext();

  return (
    <Card className="bg-black/5 dark:bg-zinc-900/50 border-zinc-300 dark:border-zinc-700 shadow-lg mb-6 max-w-3xl mx-auto">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
          <AlertTriangle className="h-5 w-5" />
          Décision critique requise
          {decision.step > 0 && (
            <span className="ml-auto text-sm bg-blue-700 dark:bg-blue-600 text-white px-2 py-0.5 rounded-full">
              Étape {decision.step}/5
            </span>
          )}
        </CardTitle>
        <CardDescription className="text-zinc-700 dark:text-zinc-300 mt-2 text-base">
          {decision.context}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 pt-2">
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/30 border-blue-200 dark:border-blue-800/50 hover:shadow-md transition-all cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-blue-700 dark:text-blue-400">
                Option A
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium mb-2">{decision.optionA.text}</p>
              <p className="text-zinc-700 dark:text-zinc-400 text-sm">{decision.optionA.description}</p>
            </CardContent>
            <CardFooter className="pt-0">
              <Button 
                variant="outline" 
                className="w-full bg-blue-600/10 hover:bg-blue-600/20 border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:text-blue-800"
                onClick={() => makeDecision(decision.optionA.id)}
              >
                <Check className="mr-2 h-4 w-4" />
                Choisir cette option
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/40 dark:to-amber-900/30 border-amber-200 dark:border-amber-800/50 hover:shadow-md transition-all cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-amber-700 dark:text-amber-400">
                Option B
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium mb-2">{decision.optionB.text}</p>
              <p className="text-zinc-700 dark:text-zinc-400 text-sm">{decision.optionB.description}</p>
            </CardContent>
            <CardFooter className="pt-0">
              <Button 
                variant="outline" 
                className="w-full bg-amber-600/10 hover:bg-amber-600/20 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 hover:text-amber-800"
                onClick={() => makeDecision(decision.optionB.id)}
              >
                <Check className="mr-2 h-4 w-4" />
                Choisir cette option
              </Button>
            </CardFooter>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default BinaryDecisionMessage;