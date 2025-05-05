import React from 'react';
import { useGame } from '../context/GameContext';
import { Shield, ShieldAlert, Trophy, Lock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

const GameHeader: React.FC = () => {
  const { securityPoints, completedChallenges, resetGame } = useGame();
  
  // Calcul du niveau de sécurité actuel
  const securityLevel = Math.min(5, Math.floor(securityPoints / 25) + 1);
  
  // Pourcentage de progression vers le niveau suivant
  const progressToNextLevel = securityPoints % 25 / 25 * 100;
  
  return (
    <div className="bg-blue-900/40 rounded-lg p-4 mb-6 border border-blue-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3">
        <div className="flex items-center mb-3 sm:mb-0">
          <Shield className="h-6 w-6 text-blue-400 mr-2" />
          <div>
            <h2 className="text-lg font-semibold">Niveau de sécurité: {securityLevel}</h2>
            <p className="text-sm text-blue-300">{securityPoints} points de sécurité accumulés</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="flex items-center space-x-1">
                  <Trophy className="h-3.5 w-3.5 text-yellow-400" />
                  <span>{completedChallenges.length} défis complétés</span>
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Vous avez résolu {completedChallenges.length} problèmes de sécurité</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Button 
            variant="outline" 
            size="sm"
            className="text-xs"
            onClick={resetGame}
          >
            Recommencer
          </Button>
        </div>
      </div>
      
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span>Progression vers le niveau {securityLevel < 5 ? securityLevel + 1 : 'max'}</span>
          <span>{securityPoints % 25}/25</span>
        </div>
        <Progress value={progressToNextLevel} className="h-2" />
      </div>
      
      <div className="flex justify-between mt-4 text-sm">
        <div className="flex items-center text-blue-300">
          <ShieldAlert className="h-4 w-4 mr-1" />
          <span>Points requis pour la R&D: 50</span>
        </div>
        
        <div className="flex items-center text-blue-300">
          <Lock className="h-4 w-4 mr-1" />
          <span>Points requis pour la Salle Serveurs: 100</span>
        </div>
      </div>
    </div>
  );
};

export default GameHeader;