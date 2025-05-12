import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RefreshCw, AlertTriangle, FileText } from "lucide-react";
import DOMPurify from 'dompurify';

interface DecisionScenario {
  id: string;
  title: string;
  description: string;
  context: string;
  stakeholders: string[];
  constraints: string[];
  options: {
    id: string;
    text: string;
    description: string;
  }[];
}

interface AmoaDecisionFlowProps {
  scenario: DecisionScenario;
  onDecisionMade: (scenarioId: string, optionId: string) => void;
  isLoading: boolean;
  currentNumber: number;
  totalScenarios: number;
  summary?: string | null;
}

export function AmoaDecisionFlow({
  scenario,
  onDecisionMade,
  isLoading,
  currentNumber,
  totalScenarios,
  summary
}: AmoaDecisionFlowProps) {
  if (summary) {
    return (
      <Card className="w-full bg-violet-950 border-violet-400/30 text-white shadow-[0_0_15px_rgba(167,139,250,0.1)]">
        <CardHeader className="border-b border-violet-400/20">
          <CardTitle className="font-mono text-violet-300 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Résumé des décisions
          </CardTitle>
        </CardHeader>
        <CardContent className="py-6 prose prose-invert max-w-none text-violet-100">
          <div
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(summary.replace(/\n/g, '<br />'))
            }}
          />
        </CardContent>
        <CardFooter className="border-t border-violet-400/20 pt-4 flex justify-center">
          <Button className="bg-violet-600 hover:bg-violet-500 text-white">
            Revenir à la discussion
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-violet-950 border-violet-400/30 text-white shadow-[0_0_15px_rgba(167,139,250,0.1)]">
      <CardHeader className="border-b border-violet-400/20">
        <div className="flex justify-between items-center">
          <CardTitle className="font-mono text-violet-300 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            Scénario de décision AMOA
          </CardTitle>
          <div className="text-xs text-violet-300 font-mono">
            {currentNumber}/{totalScenarios}
          </div>
        </div>
        <Progress value={(currentNumber / totalScenarios) * 100} className="h-1 bg-violet-800/50 mt-2">
          <div className="bg-violet-400"></div>
        </Progress>
      </CardHeader>

      <CardContent className="py-6 space-y-4">
        <div className="font-mono text-lg text-violet-300 font-bold">{scenario.title}</div>
        
        <div className="prose prose-invert max-w-none text-violet-100 mb-6">
          <div
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(scenario.description.replace(/\n/g, '<br />'))
            }}
          />
        </div>
        
        <div className="bg-violet-900/50 p-4 rounded-md border border-violet-400/20 space-y-3">
          <div className="font-mono text-sm text-violet-300">Contexte du projet:</div>
          <div className="text-sm text-violet-100">{scenario.context}</div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-violet-900/50 p-4 rounded-md border border-violet-400/20">
            <div className="font-mono text-sm text-violet-300 mb-2">Parties prenantes:</div>
            <ul className="text-sm text-violet-100 space-y-1 list-disc pl-4">
              {scenario.stakeholders.map((stakeholder, idx) => (
                <li key={idx}>{stakeholder}</li>
              ))}
            </ul>
          </div>
          
          <div className="bg-violet-900/50 p-4 rounded-md border border-violet-400/20">
            <div className="font-mono text-sm text-violet-300 mb-2">Contraintes:</div>
            <ul className="text-sm text-violet-100 space-y-1 list-disc pl-4">
              {scenario.constraints.map((constraint, idx) => (
                <li key={idx}>{constraint}</li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="font-mono text-lg text-violet-300 font-bold mt-8">Options:</div>
        
        <div className="space-y-4">
          {scenario.options.map((option) => (
            <div key={option.id} className="bg-violet-900/50 p-4 rounded-md border border-violet-400/20">
              <div className="font-mono text-sm text-violet-300 font-bold mb-2">
                Option {option.id}:
              </div>
              <div className="text-violet-100 mb-3">{option.text}</div>
              <div className="text-xs text-violet-200/70">{option.description}</div>
              <div className="mt-4">
                <Button
                  onClick={() => onDecisionMade(scenario.id, option.id)}
                  disabled={isLoading}
                  variant="outline"
                  className="border-violet-400/30 text-violet-300 hover:bg-violet-800 hover:text-violet-200 w-full"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Traitement...
                    </>
                  ) : (
                    <>Choisir cette option</>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="bg-amber-900/30 p-4 rounded-md border border-amber-400/20 mt-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5" />
            <div>
              <div className="font-mono text-sm text-amber-300 font-bold">Attention</div>
              <div className="text-xs text-amber-200/80 mt-1">
                Cette décision aura un impact sur votre parcours d'apprentissage. Choisissez l'option qui reflète le mieux votre approche en tant que professionnel AMOA.
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}