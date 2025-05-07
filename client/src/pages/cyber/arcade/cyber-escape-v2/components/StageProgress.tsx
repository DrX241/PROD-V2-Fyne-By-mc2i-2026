import React from 'react';
import { motion } from 'framer-motion';
import { Award, Check, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
// Définir directement l'enum ici car l'import pose des problèmes
export enum GameStage {
  INITIAL = 0,
  VESTIBULE = 1,
  MUR_REVELATIONS = 2,
  COULOIR_BADGES = 3,
  LABO_ANALYSE = 4,
  SALLE_MONITORING = 5,
  CRYPTEX = 6,
  QUARTIER_RESEAU = 7,
  FORENSIC_LAB = 8,
  CENTRE_DEFENSE = 9,
  PORTE_SIGMA = 10
}

interface StageProgressProps {
  currentStage: GameStage;
  className?: string;
}

// Mapping des noms d'étapes pour les tooltips
const stageNames: Record<number, string> = {
  0: 'Début du jeu',
  1: 'Vestibule Phish-Alert',
  2: 'Mur des Révélations',
  3: 'Couloir des Badges',
  4: 'Laboratoire d\'Analyse',
  5: 'Salle de Monitoring',
  6: 'Cryptex',
  7: 'Quartier Réseau',
  8: 'Laboratoire Forensic',
  9: 'Centre de Défense',
  10: 'Porte Sigma'
};

// Mapping des tooltips avec description détaillée
const stageDescriptions: Record<number, string> = {
  1: 'Identification des emails de phishing',
  2: 'Recherche en sources ouvertes (OSINT)',
  3: 'Gestion des contrôles d\'accès',
  4: 'Analyse des vulnérabilités',
  5: 'Détection d\'intrusion en temps réel',
  6: 'Déchiffrement de codes cryptographiques',
  7: 'Sécurisation d\'un réseau compromis',
  8: 'Analyse forensique de preuves numériques',
  9: 'Gestion de crise et réponse à incident',
  10: 'Objectif final - Sécurisation du système'
};

// Composant pour chaque badge/niveau d'étape
const StageBadge: React.FC<{ 
  stage: number, 
  currentStage: number,
  onClick?: () => void 
}> = ({ stage, currentStage, onClick }) => {
  // Déterminer l'état du badge
  const isCompleted = stage < currentStage;
  const isCurrent = stage === currentStage;
  const isLocked = stage > currentStage;
  
  // Classes conditionnelles
  let bgClass = 'bg-gray-800 text-gray-500 border-gray-700';
  if (isCompleted) bgClass = 'bg-green-900/30 text-green-300 border-green-600';
  if (isCurrent) bgClass = 'bg-blue-900/30 text-blue-300 border-blue-600 animate-pulse';
  
  // Icône à afficher
  const Icon = isCompleted ? Check : isLocked ? Lock : null;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            className={`
              relative w-8 h-8 rounded-full border flex items-center justify-center
              ${bgClass} cursor-pointer transition-colors
              ${isLocked ? 'opacity-60' : 'opacity-100 hover:brightness-125'}
            `}
            whileHover={{ scale: isLocked ? 1 : 1.1 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: stage * 0.05 }}
            onClick={isLocked ? undefined : onClick}
          >
            {Icon ? <Icon className="h-3.5 w-3.5" /> : <span className="text-xs font-bold">{stage}</span>}
            
            {isCurrent && (
              <motion.div
                className="absolute -inset-1 rounded-full border border-blue-400/50"
                animate={{ scale: [1, 1.1, 1], opacity: [0.7, 0.5, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="bg-gray-900 border-gray-700">
          <div className="space-y-1">
            <p className="font-medium">
              {isLocked ? (
                <span className="text-gray-400">Niveau {stage} - Verrouillé</span>
              ) : (
                <span className={isCurrent ? 'text-blue-400' : 'text-green-400'}>
                  Niveau {stage} - {stageNames[stage]}
                </span>
              )}
            </p>
            {!isLocked && (
              <p className="text-xs text-gray-400">{stageDescriptions[stage]}</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const StageProgress: React.FC<StageProgressProps> = ({ currentStage, className = '' }) => {
  // Calculer le pourcentage d'avancement (10 étapes au total)
  const progressPercentage = Math.min(Math.round((currentStage / 10) * 100), 100);
  
  return (
    <Card className={`border-green-500 bg-black/50 ${className}`}>
      <CardHeader className="py-2 px-3 border-b border-green-800">
        <CardTitle className="text-sm text-green-400 flex items-center justify-between">
          <div className="flex items-center">
            <Award className="h-4 w-4 mr-2" />
            <span>Progression</span>
          </div>
          <span className="text-xs bg-green-900/30 px-2 py-0.5 rounded border border-green-800">
            {progressPercentage}%
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-3">
        {/* Barre de progression */}
        <div className="w-full h-1.5 bg-gray-800 rounded-full mb-4 overflow-hidden">
          <motion.div
            className="h-full bg-green-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          />
        </div>
        
        {/* Badges d'étapes */}
        <div className="flex justify-between pt-1">
          {Array.from({ length: 10 }, (_, i) => i + 1).map(stage => (
            <StageBadge
              key={stage}
              stage={stage}
              currentStage={currentStage}
              onClick={() => console.log(`Clic sur l'étape ${stage}`)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default StageProgress;