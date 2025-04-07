import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Clock, ArrowRight, RotateCcw } from 'lucide-react';
import { Level } from './types';

interface ResultsPanelProps {
  level: Level;
  score: number;
  time: number;
  isLevelComplete: boolean;
  hasNextLevel: boolean;
  onRestart: () => void;
  onNextLevel: () => void;
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({
  level,
  score,
  time,
  isLevelComplete,
  hasNextLevel,
  onRestart,
  onNextLevel
}) => {
  // Calculer pourcentage du score
  const scorePercentage = Math.round((score / level.maxScore) * 100);
  
  // Calculer statut
  const getStatus = () => {
    if (scorePercentage >= 90) return { text: "Excellent", color: "text-green-400" };
    if (scorePercentage >= 70) return { text: "Bon travail", color: "text-blue-400" };
    if (scorePercentage >= 50) return { text: "Passable", color: "text-yellow-400" };
    return { text: "À améliorer", color: "text-red-400" };
  };
  
  const status = getStatus();
  
  return (
    <Card className="w-full max-w-lg bg-gray-900 border-indigo-500 border-2 shadow-lg overflow-hidden">
      <CardHeader className="bg-gray-800 p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl text-white">
            {isLevelComplete ? "Niveau complété !" : "Résultats du niveau"}
          </CardTitle>
          {isLevelComplete && (
            <div className="p-2 rounded-full bg-yellow-500/20">
              <Trophy className="w-6 h-6 text-yellow-400" />
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between pb-3 border-b border-gray-700">
            <h3 className="text-gray-400">Niveau</h3>
            <p className="font-medium text-white">{level.name} (#{level.id})</p>
          </div>
          
          <div className="flex justify-between pb-3 border-b border-gray-700">
            <h3 className="text-gray-400">Score</h3>
            <p className="font-bold text-xl text-white">{score} / {level.maxScore} <span className={`text-sm ${status.color}`}>({scorePercentage}%)</span></p>
          </div>
          
          <div className="flex justify-between pb-3 border-b border-gray-700">
            <h3 className="text-gray-400">Temps</h3>
            <p className="flex items-center text-white">
              <Clock className="w-4 h-4 mr-1 text-blue-400" />
              {time} secondes
              {time < level.targetTime && (
                <span className="ml-2 text-green-400 text-xs">
                  (Bonus temps: +{Math.round((level.targetTime - time) * 5)} pts)
                </span>
              )}
            </p>
          </div>
          
          <div className="flex justify-between pb-3">
            <h3 className="text-gray-400">Statut</h3>
            <p className={`font-bold ${status.color}`}>{status.text}</p>
          </div>
          
          {isLevelComplete && (
            <div className="mt-6 p-4 bg-green-900/20 border border-green-700 rounded-lg">
              <p className="text-center text-green-300">
                {scorePercentage >= 90 
                  ? "Parfait ! Votre configuration est optimale."
                  : scorePercentage >= 70 
                    ? "Bonne stratégie ! Quelques optimisations sont encore possibles."
                    : "Votre solution fonctionne, mais pourrait être plus efficace."
                }
              </p>
            </div>
          )}
          
          {!isLevelComplete && (
            <div className="mt-6 p-4 bg-amber-900/20 border border-amber-700 rounded-lg">
              <p className="text-center text-amber-300">
                Vérifiez l'ordre de vos défenses. N'oubliez pas : certaines défenses sont plus efficaces lorsqu'elles sont placées dans un ordre stratégique.
              </p>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="bg-gray-800 p-4 border-t border-gray-700 flex justify-between">
        <Button 
          variant="outline"
          className="border-gray-600 text-gray-300 hover:bg-gray-700"
          onClick={onRestart}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Réessayer
        </Button>
        
        {isLevelComplete && hasNextLevel && (
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={onNextLevel}
          >
            Niveau suivant
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
        
        {isLevelComplete && !hasNextLevel && (
          <Button 
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={onNextLevel}
          >
            Terminer
            <Trophy className="ml-2 h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ResultsPanel;