import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Lock, Circle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface StageProgressProps {
  currentStage: number;
  unlockedStages: number[];
  totalStages: number;
}

/**
 * Affiche la progression des étapes du jeu
 */
const StageProgress: React.FC<StageProgressProps> = ({ 
  currentStage, 
  unlockedStages, 
  totalStages 
}) => {
  // Générer tous les niveaux
  const stages = Array.from({ length: totalStages }, (_, i) => i + 1);
  
  // Déterminer l'état de chaque niveau
  const getStageState = (stage: number) => {
    if (stage === currentStage) return 'current';
    if (unlockedStages.includes(stage)) return 'unlocked';
    return 'locked';
  };
  
  // Déterminer le label de chaque niveau en fonction du jeu
  const getStageName = (stage: number) => {
    // Ces noms pourraient venir d'une configuration
    const stageNames = [
      'Salle des Serveurs',
      'Salle de Contrôle Réseau',
      'Centre de Données',
      'Bureau Exécutif',
      'Salle des Communications',
      'Laboratoire R&D',
      'Archives',
      'Salle de Sécurité',
      'Salle des Serveurs Cloud',
      'Centre de Crise'
    ];
    
    return stageNames[stage - 1] || `Niveau ${stage}`;
  };
  
  return (
    <Card className="bg-black/60 border-gray-800 p-3">
      <div className="flex items-center mb-2">
        <h3 className="text-gray-300 text-sm font-medium">Progression des niveaux</h3>
        <div className="ml-auto text-xs text-gray-500">
          {currentStage} / {totalStages}
        </div>
      </div>
      
      <div className="relative">
        {/* Ligne de progression */}
        <div className="absolute top-4 left-4 right-4 h-[2px] bg-gray-800 z-0" />
        
        {/* Points d'étapes */}
        <div className="relative z-10 flex justify-between px-2">
          {stages.map((stage) => {
            const state = getStageState(stage);
            
            return (
              <TooltipProvider key={stage}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: stage * 0.1 }}
                      className={`w-8 h-8 rounded-full flex items-center justify-center
                        ${state === 'current' 
                          ? 'bg-blue-600 border-2 border-blue-400 shadow-lg shadow-blue-500/20 ring-2 ring-blue-400/20' 
                          : state === 'unlocked' 
                            ? 'bg-green-600 border border-green-500' 
                            : 'bg-gray-800 border border-gray-700'
                        }`}
                    >
                      {state === 'current' ? (
                        <Circle className="h-4 w-4 text-white fill-blue-300" />
                      ) : state === 'unlocked' ? (
                        <CheckCircle className="h-4 w-4 text-green-200" />
                      ) : (
                        <Lock className="h-3 w-3 text-gray-500" />
                      )}
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>
                      <span className="font-semibold">Niveau {stage}:</span> {getStageName(stage)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {state === 'current' 
                        ? 'Niveau actuel' 
                        : state === 'unlocked' 
                          ? 'Niveau débloqué' 
                          : 'Niveau verrouillé'
                      }
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

export default StageProgress;