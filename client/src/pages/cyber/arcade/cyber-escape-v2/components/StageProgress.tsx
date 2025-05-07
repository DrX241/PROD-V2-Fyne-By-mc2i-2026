import React from 'react';
import { motion } from 'framer-motion';
import { Check, ChevronRight, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StageProgressProps {
  currentStage: number;
  unlockedStages: number[];
  totalStages: number;
}

/**
 * Composant qui affiche la progression à travers les niveaux du jeu
 */
const StageProgress: React.FC<StageProgressProps> = ({ 
  currentStage, 
  unlockedStages, 
  totalStages 
}) => {
  // Créer un tableau de tous les niveaux pour l'affichage
  const stages = Array.from({ length: totalStages }, (_, i) => i + 1);
  
  return (
    <div className="bg-black/40 backdrop-blur-sm border border-gray-800 rounded-lg p-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium text-gray-400">Progression des niveaux</h3>
        <div className="text-xs text-gray-500">
          Niveau {currentStage} / {totalStages}
        </div>
      </div>
      
      <div className="mt-3 relative">
        {/* Barre de progression */}
        <div className="absolute h-[2px] bg-gray-800 top-[14px] left-0 right-0 z-0" />
        <div 
          className="absolute h-[2px] bg-green-500 top-[14px] left-0 z-10" 
          style={{ width: `${(Math.max(1, currentStage - 1) / totalStages) * 100}%` }}
        />
        
        {/* Points de progression */}
        <div className="relative z-20 flex justify-between">
          {stages.map((stage) => {
            const isComplete = stage < currentStage;
            const isCurrent = stage === currentStage;
            const isUnlocked = unlockedStages.includes(stage);
            const isLocked = !isUnlocked;
            
            return (
              <div 
                key={stage}
                className="flex flex-col items-center"
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: stage * 0.1 }}
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center border-2",
                    isComplete && "border-green-500 bg-green-500/20 text-green-400",
                    isCurrent && "border-blue-500 bg-blue-500/20 text-blue-400 animate-pulse",
                    isLocked && "border-gray-700 bg-gray-800/50 text-gray-600"
                  )}
                >
                  {isComplete ? (
                    <Check className="h-3 w-3" />
                  ) : isCurrent ? (
                    <ChevronRight className="h-3 w-3" />
                  ) : (
                    <Lock className="h-3 w-3" />
                  )}
                </motion.div>
                <span 
                  className={cn(
                    "text-xs mt-1",
                    isComplete && "text-green-400",
                    isCurrent && "text-blue-400 font-medium",
                    isLocked && "text-gray-600"
                  )}
                >
                  {stage}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StageProgress;