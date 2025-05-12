import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, PieChart, Users, Calendar, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import DOMPurify from 'dompurify';

// Type du scénario de décision
export interface DecisionScenario {
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

// Props pour le composant
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
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  
  // Si on a un résumé, on l'affiche
  if (summary) {
    return (
      <Card className="w-full bg-indigo-950 border-indigo-400/30 text-white shadow-[0_0_15px_rgba(167,139,250,0.1)]">
        <CardHeader className="border-b border-indigo-400/20">
          <CardTitle className="font-mono text-indigo-300 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Synthèse de votre session AMOA
          </CardTitle>
        </CardHeader>
        <CardContent className="py-6 prose prose-invert max-w-none text-indigo-100">
          <div
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(summary.replace(/\n/g, '<br />'))
            }}
          />
        </CardContent>
        <CardFooter className="border-t border-indigo-400/20 pt-4 flex justify-center">
          <Button 
            className="bg-indigo-600 hover:bg-indigo-500 text-white"
            onClick={() => window.location.reload()}
          >
            Nouvelle session
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Gérer la sélection d'une option
  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
  };

  // Soumettre la décision
  const handleSubmit = () => {
    if (selectedOption) {
      onDecisionMade(scenario.id, selectedOption);
      setSelectedOption(null);
    }
  };

  return (
    <Card className="w-full bg-indigo-950 border-indigo-400/30 text-white shadow-[0_0_15px_rgba(167,139,250,0.1)]">
      <CardHeader className="border-b border-indigo-400/20">
        <div className="flex justify-between items-center mb-2">
          <Badge variant="outline" className="bg-indigo-900 text-indigo-200 border-indigo-300">
            Scénario {currentNumber}/{totalScenarios}
          </Badge>
          <Progress 
            value={(currentNumber / totalScenarios) * 100} 
            className="h-2 w-32 bg-indigo-800" 
            indicatorClassName="bg-indigo-400"
          />
        </div>
        <CardTitle className="text-xl font-bold text-indigo-200">{scenario.title}</CardTitle>
      </CardHeader>
      
      <CardContent className="py-4 space-y-4">
        <div className="prose prose-invert max-w-none text-indigo-100">
          <p>{scenario.description}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="bg-indigo-900/40 p-3 rounded-md border border-indigo-700/50">
            <div className="flex items-center gap-2 text-indigo-300 font-medium mb-2">
              <PieChart className="h-4 w-4" />
              <span>Contexte du projet</span>
            </div>
            <p className="text-sm text-indigo-100">{scenario.context}</p>
          </div>
          
          <div className="bg-indigo-900/40 p-3 rounded-md border border-indigo-700/50">
            <div className="flex items-center gap-2 text-indigo-300 font-medium mb-2">
              <Users className="h-4 w-4" />
              <span>Parties prenantes</span>
            </div>
            <ul className="list-disc list-inside text-sm text-indigo-100">
              {scenario.stakeholders.map((stakeholder, index) => (
                <li key={index}>{stakeholder}</li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="bg-indigo-900/40 p-3 rounded-md border border-indigo-700/50">
          <div className="flex items-center gap-2 text-indigo-300 font-medium mb-2">
            <AlertTriangle className="h-4 w-4" />
            <span>Contraintes</span>
          </div>
          <ul className="list-disc list-inside text-sm text-indigo-100">
            {scenario.constraints.map((constraint, index) => (
              <li key={index}>{constraint}</li>
            ))}
          </ul>
        </div>
        
        <Separator className="bg-indigo-700/30 my-4" />
        
        <div>
          <h3 className="text-lg font-medium text-indigo-200 mb-4">Options disponibles</h3>
          <div className="space-y-4">
            {scenario.options.map((option) => (
              <div 
                key={option.id}
                className={`p-4 rounded-md cursor-pointer transition-all duration-200 ${
                  selectedOption === option.id
                    ? "bg-indigo-600/60 border-2 border-indigo-400"
                    : "bg-indigo-900/40 border border-indigo-700/50 hover:bg-indigo-800/50"
                }`}
                onClick={() => handleOptionSelect(option.id)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div 
                    className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      selectedOption === option.id 
                        ? "bg-indigo-300" 
                        : "border border-indigo-400"
                    }`}
                  >
                    {selectedOption === option.id && (
                      <div className="w-3 h-3 rounded-full bg-indigo-900" />
                    )}
                  </div>
                  <h4 className="font-medium text-indigo-200">{option.text}</h4>
                </div>
                <p className="text-sm text-indigo-100 ml-7">{option.description}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="border-t border-indigo-400/20 pt-4 flex justify-end">
        <Button 
          className="bg-indigo-600 hover:bg-indigo-500 text-white"
          disabled={!selectedOption || isLoading}
          onClick={handleSubmit}
        >
          {isLoading ? "Traitement en cours..." : "Valider la décision"}
        </Button>
      </CardFooter>
    </Card>
  );
}