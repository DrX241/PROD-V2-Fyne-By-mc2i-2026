import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DndContext, 
  DragEndEvent,
  DragStartEvent,
  closestCenter
} from '@dnd-kit/core';
import { 
  Shield, 
  Clock, 
  Play, 
  RotateCcw, 
  ArrowRight, 
  CheckCircle,
  XCircle,
  Trophy,
  LightbulbIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

import { FirewallDefenseGameProps, Defense, Level, GameState, PlacedDefense, Difficulty } from './types';
import DraggableDefense from './DraggableDefense';
import DefenseSlot from './DefenseSlot';
import TutorialPanel from './TutorialPanel';
import ResultsPanel from './ResultsPanel';
import { getLevelsByDifficulty, tutorialSteps } from './data';

const FirewallDefenseGame: React.FC<FirewallDefenseGameProps> = ({ 
  difficulty, 
  onGameEnd 
}) => {
  const { toast } = useToast();
  
  // État du jeu
  const [gameState, setGameState] = useState<GameState>({
    currentLevel: 1,
    maxLevels: 0,
    currentScore: 0,
    totalScore: 0,
    timer: 0,
    isComplete: false,
    placedDefenses: [],
    showTutorial: true,
    tutorialStep: 0,
    gamePhase: 'preparation'
  });
  
  // Données des niveaux
  const [levels, setLevels] = useState<Level[]>([]);
  const [currentLevel, setCurrentLevel] = useState<Level | null>(null);
  
  // État du drag and drop
  const [draggedDefenseId, setDraggedDefenseId] = useState<string | null>(null);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  
  // Minuteur
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  
  // Gestionnaires d'événements
  const handleNextTutorialStep = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      tutorialStep: prev.tutorialStep < tutorialSteps.length - 1 
        ? prev.tutorialStep + 1 
        : prev.tutorialStep
    }));
  }, []);
  
  const handleCompleteTutorial = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      showTutorial: false
    }));
  }, []);
  
  const handlePlaceDefense = useCallback((position: number) => {
    if (!draggedDefenseId || !currentLevel) return;
    
    // Vérifier si le slot est déjà occupé
    const isSlotOccupied = gameState.placedDefenses.some(
      pd => pd.position === position
    );
    
    if (isSlotOccupied) {
      toast({
        title: "Emplacement occupé",
        description: "Cet emplacement contient déjà une défense",
        variant: "destructive",
      });
      return;
    }
    
    // Ajouter la défense au slot
    setGameState(prev => ({
      ...prev,
      placedDefenses: [
        ...prev.placedDefenses,
        { defenseId: draggedDefenseId, position }
      ]
    }));
    
    setDraggedDefenseId(null);
  }, [draggedDefenseId, currentLevel, gameState.placedDefenses, toast]);
  
  const handleRemoveDefense = useCallback((position: number) => {
    setGameState(prev => ({
      ...prev,
      placedDefenses: prev.placedDefenses.filter(
        pd => pd.position !== position
      )
    }));
  }, []);
  
  const startGame = useCallback(() => {
    if (!currentLevel) return;
    
    // Vérifier que tous les slots sont remplis
    const requiredSlots = currentLevel.defenses.length;
    if (gameState.placedDefenses.length < requiredSlots) {
      toast({
        title: "Configuration incomplète",
        description: `Vous devez placer toutes les ${requiredSlots} défenses avant de commencer`,
        variant: "destructive",
      });
      return;
    }
    
    // Démarrer le chronomètre
    setGameState(prev => ({
      ...prev,
      gamePhase: 'playing',
      timer: 0
    }));
    
    const interval = setInterval(() => {
      setGameState(prev => ({
        ...prev,
        timer: prev.timer + 1
      }));
    }, 1000);
    
    setTimerInterval(interval);
  }, [currentLevel, gameState.placedDefenses, toast]);
  
  const checkSolution = useCallback(() => {
    if (!currentLevel) return;
    
    // Arrêter le chronomètre
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    
    // Vérifier chaque défense
    const updatedPlacedDefenses = gameState.placedDefenses.map(pd => {
      const defense = currentLevel.defenses.find(d => d.id === pd.defenseId);
      if (!defense) return pd;
      
      return {
        ...pd,
        isCorrect: defense.correctPosition === pd.position
      };
    });
    
    // Calculer le score
    const correctDefenses = updatedPlacedDefenses.filter(pd => pd.isCorrect).length;
    const totalDefenses = currentLevel.defenses.length;
    const baseScore = Math.round((correctDefenses / totalDefenses) * currentLevel.maxScore);
    
    // Bonus de temps si terminé avant le temps cible
    const timeBonus = gameState.timer < currentLevel.targetTime 
      ? Math.round((currentLevel.targetTime - gameState.timer) * 5) 
      : 0;
    
    const finalScore = baseScore + timeBonus;
    const isLevelComplete = correctDefenses === totalDefenses;
    
    // Mettre à jour l'état
    setGameState(prev => ({
      ...prev,
      placedDefenses: updatedPlacedDefenses,
      currentScore: finalScore,
      totalScore: prev.totalScore + finalScore,
      isComplete: isLevelComplete,
      gamePhase: 'results'
    }));
    
    // Feedback
    toast({
      title: isLevelComplete ? "Niveau réussi !" : "Configuration incomplète",
      description: isLevelComplete 
        ? `Vous avez correctement configuré toutes les défenses et obtenu ${finalScore} points !` 
        : `${correctDefenses}/${totalDefenses} défenses sont correctement placées. Score: ${finalScore} points`,
      variant: isLevelComplete ? "default" : "destructive",
    });
  }, [currentLevel, gameState.placedDefenses, gameState.timer, timerInterval, toast]);
  
  const restartLevel = useCallback(() => {
    // Arrêter le chronomètre
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    
    // Réinitialiser l'état du niveau
    setGameState(prev => ({
      ...prev,
      placedDefenses: [],
      currentScore: 0,
      timer: 0,
      isComplete: false,
      gamePhase: 'preparation'
    }));
  }, [timerInterval]);
  
  const goToNextLevel = useCallback(() => {
    const nextLevelIndex = gameState.currentLevel;
    
    // Si c'est le dernier niveau, terminer le jeu
    if (nextLevelIndex >= levels.length) {
      if (onGameEnd) {
        onGameEnd(gameState.totalScore);
      }
      return;
    }
    
    // Charger le niveau suivant
    const nextLevel = levels[nextLevelIndex];
    setCurrentLevel(nextLevel);
    
    // Réinitialiser l'état du niveau
    setGameState(prev => ({
      ...prev,
      currentLevel: prev.currentLevel + 1,
      placedDefenses: [],
      currentScore: 0,
      timer: 0,
      isComplete: false,
      gamePhase: 'preparation'
    }));
  }, [gameState.currentLevel, gameState.totalScore, levels, onGameEnd]);
  
  // Handlers DnD
  const handleDndStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    setDraggedDefenseId(String(active.id));
  }, []);
  
  const handleDndEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    // Si on est au-dessus d'un slot
    if (over && over.id.toString().startsWith('slot-')) {
      const position = Number(over.id.toString().replace('slot-', ''));
      handlePlaceDefense(position);
    }
    
    setDraggedDefenseId(null);
    setActiveSlot(null);
  }, [handlePlaceDefense]);
  
  // Initialisation du jeu
  useEffect(() => {
    const gameLevels = getLevelsByDifficulty(difficulty);
    setLevels(gameLevels);
    setCurrentLevel(gameLevels[0]);
    
    setGameState({
      currentLevel: 1,
      maxLevels: gameLevels.length,
      currentScore: 0,
      totalScore: 0,
      timer: 0,
      isComplete: false,
      placedDefenses: [],
      showTutorial: true,
      tutorialStep: 0,
      gamePhase: 'preparation'
    });
    
    // Nettoyage du minuteur
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [difficulty, timerInterval]);
  
  // Effet pour surveiller les changements dans les défenses placées
  useEffect(() => {
    if (!currentLevel) return;
    
    // Logique supplémentaire si nécessaire pour le suivi des défenses placées
  }, [currentLevel, gameState.placedDefenses]);
  
  // Effet pour gérer le timer et l'état du jeu
  useEffect(() => {
    // Logique additionnelle pour les mises à jour d'état de jeu
  }, [currentLevel, gameState.gamePhase]);
  
  // Si le niveau n'est pas chargé, afficher un loader
  if (!currentLevel) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-pulse flex flex-col items-center">
          <Shield className="w-12 h-12 text-blue-400 mb-4" />
          <p className="text-gray-400">Chargement du niveau...</p>
        </div>
      </div>
    );
  }
  
  // Liste des défenses disponibles (non placées)
  const availableDefenses = currentLevel.defenses.filter(
    defense => !gameState.placedDefenses.some(pd => pd.defenseId === defense.id)
  );

  return (
    <DndContext
      onDragStart={handleDndStart}
      onDragEnd={handleDndEnd}
      collisionDetection={closestCenter}
    >
      <div className="p-4">
        {/* Tutoriel */}
        <AnimatePresence>
          {gameState.showTutorial && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4"
            >
              <TutorialPanel
                steps={tutorialSteps}
                currentStep={gameState.tutorialStep}
                onNext={handleNextTutorialStep}
                onComplete={handleCompleteTutorial}
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* En-tête avec informations du niveau */}
        <div className="bg-gray-800 rounded-xl p-4 mb-6 shadow-lg">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center">
              <Shield className="w-6 h-6 mr-2 text-blue-400" />
              <div>
                <h2 className="text-xl font-bold text-white">{currentLevel.name}</h2>
                <p className="text-sm text-gray-300">
                  Niveau {gameState.currentLevel}/{gameState.maxLevels} • {difficulty}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 flex-wrap">
              <Badge className="bg-gray-700 gap-1.5 px-3 py-1">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <span className="text-white font-semibold">{gameState.totalScore} pts</span>
              </Badge>
              
              {gameState.gamePhase === 'playing' && (
                <Badge className="bg-gray-700 gap-1.5 px-3 py-1">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span className="text-white font-semibold">{gameState.timer}s</span>
                </Badge>
              )}
              
              <Button 
                size="sm" 
                variant="outline"
                className="border-gray-600 text-gray-300"
                onClick={() => {
                  setGameState(prev => ({ ...prev, showTutorial: true, tutorialStep: 0 }));
                }}
              >
                <LightbulbIcon className="w-4 h-4 mr-1 text-yellow-400" />
                Aide
              </Button>
            </div>
          </div>
        </div>
        
        {/* Description du niveau */}
        <div className="bg-gray-800 rounded-xl p-4 mb-6 shadow-lg">
          <h3 className="font-semibold text-white mb-2">Description</h3>
          <p className="text-gray-300">{currentLevel.description}</p>
          
          {gameState.gamePhase === 'preparation' && (
            <div className="mt-4 bg-gray-700/50 rounded p-3 text-sm text-gray-300">
              <p>
                <span className="text-blue-400 font-semibold">Mission:</span> Placez les défenses dans le bon ordre pour créer une protection en profondeur optimale. Chaque défense doit être positionnée stratégiquement pour maximiser son efficacité.
              </p>
            </div>
          )}
        </div>
        
        {/* Zone principale de jeu */}
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 mb-6">
          {/* Zone de placement des défenses (gauche) */}
          <div className="lg:col-span-4">
            <Card className="bg-gray-800 border-gray-700 shadow-lg p-4">
              <h3 className="font-semibold text-white mb-4">Configuration du réseau</h3>
              
              <div className="relative py-6 px-3 bg-gray-900 rounded-lg mb-4 min-h-[400px]">
                {/* Ligne de connexion */}
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transform -translate-y-1/2" />
                
                {/* Slots pour les défenses */}
                <div className="grid grid-cols-1 md:grid-cols-8 gap-4 relative z-10">
                  {Array.from({ length: 8 }).map((_, index) => {
                    const position = index + 1;
                    const placedDefense = gameState.placedDefenses.find(
                      pd => pd.position === position
                    );
                    
                    return (
                      <DefenseSlot
                        key={position}
                        position={position}
                        placedDefense={placedDefense}
                        defenses={currentLevel.defenses}
                        isActive={activeSlot === position}
                        isCorrect={placedDefense?.isCorrect}
                        onDrop={() => handlePlaceDefense(position)}
                      />
                    );
                  })}
                </div>
                
                {/* Légende */}
                <div className="absolute top-4 right-4 flex items-center space-x-3">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-1" />
                    <span className="text-xs text-gray-300">Correct</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-red-500 mr-1" />
                    <span className="text-xs text-gray-300">Incorrect</span>
                  </div>
                </div>
              </div>
              
              {/* Barre de progression */}
              {gameState.gamePhase === 'playing' && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>0s</span>
                    <span>Temps cible: {currentLevel.targetTime}s</span>
                  </div>
                  <Progress 
                    value={Math.min((gameState.timer / currentLevel.targetTime) * 100, 100)} 
                    className="h-2"
                  />
                </div>
              )}
              
              {/* Actions */}
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  className="border-gray-600 text-gray-300"
                  onClick={restartLevel}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Réinitialiser
                </Button>
                
                {gameState.gamePhase === 'preparation' && (
                  <Button
                    onClick={startGame}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Commencer
                  </Button>
                )}
                
                {gameState.gamePhase === 'playing' && (
                  <Button
                    onClick={checkSolution}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Vérifier
                  </Button>
                )}
                
                {gameState.gamePhase === 'results' && (
                  <Button
                    onClick={goToNextLevel}
                    className="bg-purple-600 hover:bg-purple-700"
                    disabled={!gameState.isComplete}
                  >
                    <ArrowRight className="mr-2 h-4 w-4" />
                    {gameState.isComplete ? 'Niveau suivant' : 'Réessayer'}
                  </Button>
                )}
              </div>
            </Card>
          </div>
          
          {/* Zone d'informations et défenses disponibles (droite) */}
          <div className="lg:col-span-2">
            {gameState.gamePhase === 'results' ? (
              <ResultsPanel
                score={gameState.currentScore}
                totalScore={gameState.totalScore}
                level={gameState.currentLevel}
                maxLevels={gameState.maxLevels}
                placedDefenses={gameState.placedDefenses}
                defenses={currentLevel.defenses}
                isComplete={gameState.isComplete}
                elapsedTime={gameState.timer}
                targetTime={currentLevel.targetTime}
                onNextLevel={goToNextLevel}
                onRestart={restartLevel}
              />
            ) : (
              <Card className="bg-gray-800 border-gray-700 shadow-lg p-4">
                <h3 className="font-semibold text-white mb-3">Défenses disponibles</h3>
                <p className="text-sm text-gray-400 mb-4">Glissez-déposez les défenses pour les placer sur le réseau</p>
                
                <div className="space-y-3">
                  {availableDefenses.map(defense => (
                    <DraggableDefense
                      key={defense.id}
                      defense={defense}
                      disabled={gameState.gamePhase === 'playing'}
                      onDragStart={() => {}}
                      onDragEnd={() => {}}
                    />
                  ))}
                  
                  {availableDefenses.length === 0 && (
                    <div className="bg-gray-700/50 rounded p-3 text-center text-sm text-gray-300">
                      <p>Toutes les défenses ont été placées sur le réseau.</p>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <h4 className="text-sm font-semibold text-white mb-2">Statistiques</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                      <span className="text-gray-300">Défenses: {currentLevel.defenses.length}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-amber-500 mr-2"></div>
                      <span className="text-gray-300">Objectif: {currentLevel.targetTime}s</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-purple-500 mr-2"></div>
                      <span className="text-gray-300">Score max: {currentLevel.maxScore}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></div>
                      <span className="text-gray-300">Difficulté: {difficulty}</span>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DndContext>
  );
};

export default FirewallDefenseGame;