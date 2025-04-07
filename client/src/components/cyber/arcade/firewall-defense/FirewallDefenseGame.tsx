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
  ShieldCheck,
  Clock, 
  Play, 
  RotateCcw, 
  ArrowRight, 
  CheckCircle,
  XCircle,
  Trophy,
  LightbulbIcon,
  Star,
  BarChart,
  Brain,
  CircuitBoard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

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
  
  // États pour le feedback pédagogique IA
  const [showAiAdviceDialog, setShowAiAdviceDialog] = useState<boolean>(false);
  const [aiAdviceDialogContent, setAiAdviceDialogContent] = useState<string>("");
  
  // États pour le chronomètre - remplacés par des valeurs constantes
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  
  // Gestionnaires d'événements
  const handleNextTutorialStep = useCallback(() => {
    setGameState(prev => {
      // Si c'est l'avant-dernière étape, passer à la dernière
      if (prev.tutorialStep < tutorialSteps.length - 1) {
        return {
          ...prev,
          tutorialStep: prev.tutorialStep + 1
        };
      }
      // Si c'est la dernière étape, il faut terminer le tutoriel lors du prochain "Suivant"
      return prev;
    });
  }, []);
  
  const handleCompleteTutorial = useCallback(() => {
    // Simplifier la fonction pour éviter les conflits avec le chronomètre
    // On désactive complètement le chronomètre automatique pour l'instant
    
    // Réinitialiser le tutorialStep et fermer le tutoriel
    setGameState(prev => ({
      ...prev, 
      tutorialStep: 0, // Réinitialiser l'étape pour une future ouverture du tutoriel
      showTutorial: false, // Important : fermer le tutoriel immédiatement
      gamePhase: 'playing',
      placedDefenses: [], // Réinitialiser les défenses placées pour le jeu
      timer: 0
    }));
    
    // Afficher un toast pour commencer le jeu
    toast({
      title: "Mode jeu activé",
      description: "Placez les défenses dans le bon ordre pour créer une protection optimale !",
    });
  }, [toast]);
  
  // Fonction pour démarrer le chronomètre
  const startTimer = useCallback(() => {
    if (timerInterval) return; // Déjà démarré
    
    const interval = setInterval(() => {
      setGameState(prev => ({
        ...prev,
        timer: prev.timer + 1
      }));
    }, 1000);
    
    setTimerInterval(interval);
    
    toast({
      title: "Chronomètre démarré",
      description: "Le chronomètre démarre automatiquement lorsque vous placez la première défense",
    });
  }, [timerInterval, toast]);
    
  const handlePlaceDefense = useCallback((position: number, defenseId?: string) => {
    // Utiliser soit l'ID passé en paramètre, soit l'ID glissé actuel
    const idToUse = defenseId || draggedDefenseId;
    
    if (!idToUse || !currentLevel) return;
    
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
        { defenseId: idToUse, position }
      ]
    }));
    
    // Pas de chronomètre, mais affichage d'un message pour la première défense
    if (gameState.gamePhase === 'playing' && gameState.placedDefenses.length === 0) {
      toast({
        title: "Défense ajoutée",
        description: "Continuez à placer les autres défenses dans l'ordre optimal !",
      });
    }
    
    setDraggedDefenseId(null);
  }, [draggedDefenseId, currentLevel, gameState.placedDefenses, gameState.gamePhase, timerInterval, toast]);
  
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
    
    // Commencer le jeu en mode placement de défenses
    // Pas de chronomètre pour se concentrer sur la logique de défense
    setGameState(prev => ({
      ...prev,
      gamePhase: 'playing',
      placedDefenses: [], // Réinitialiser les défenses placées pour permettre un nouveau placement
      timer: 0
    }));
    
    toast({
      title: "Mode jeu activé",
      description: "Placez les défenses dans le bon ordre pour une protection optimale !",
    });
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
    
    // Suppression du bonus de temps pour simplifier le jeu
    const timeBonus = 0;
    const finalScore = baseScore;
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
    
    // Feedback de base
    toast({
      title: isLevelComplete ? "Niveau réussi !" : "Configuration incomplète",
      description: isLevelComplete 
        ? `Vous avez correctement configuré toutes les défenses et obtenu ${finalScore} points !` 
        : `${correctDefenses}/${totalDefenses} défenses sont correctement placées. Score: ${finalScore} points`,
      variant: isLevelComplete ? "default" : "destructive",
    });
    
    // Feedback pédagogique détaillé
    setTimeout(() => {
      // Dialog avec explications pédagogiques
      const incorrectDefenses = updatedPlacedDefenses.filter(pd => !pd.isCorrect);
      
      let feedbackContent = "";
      
      if (isLevelComplete) {
        feedbackContent = `
          <div class="mb-4">
            <h3 class="text-lg font-semibold text-green-500 mb-2">Excellent travail !</h3>
            <p>Votre configuration de sécurité est optimale. Vous avez correctement mis en place une défense en profondeur efficace.</p>
          </div>
          <div class="mb-4">
            <h3 class="text-lg font-semibold text-blue-400 mb-2">Points clés à retenir :</h3>
            <ul class="list-disc pl-5 space-y-1 text-sm">
              ${currentLevel.defenses.map((defense, index) => `
                <li><span class="font-medium">${defense.name}</span> - ${defense.explanation}</li>
              `).join('')}
            </ul>
          </div>
          <div>
            <p class="text-sm text-gray-300">Rappelez-vous que la défense en profondeur est un principe fondamental de la cybersécurité qui consiste à superposer plusieurs couches de protection.</p>
          </div>
        `;
      } else {
        // Générer des conseils pour les défenses mal placées
        const incorrectFeedback = incorrectDefenses.map(pd => {
          const defense = currentLevel.defenses.find(d => d.id === pd.defenseId);
          if (!defense) return "";
          
          return `
            <div class="mb-3 pb-3 border-b border-gray-700">
              <p class="font-medium text-red-400">${defense.name}</p>
              <p class="text-sm text-gray-300">Position actuelle: ${pd.position}</p>
              <p class="text-sm">${defense.hint}</p>
            </div>
          `;
        }).join('');
        
        feedbackContent = `
          <div class="mb-4">
            <h3 class="text-lg font-semibold text-amber-500 mb-2">Configuration à améliorer</h3>
            <p>Certaines défenses ne sont pas dans leur position optimale. Voici quelques conseils pour vous aider :</p>
          </div>
          <div class="mb-4 max-h-60 overflow-y-auto pr-2">
            ${incorrectFeedback}
          </div>
          <div>
            <p class="text-sm text-gray-300">N'oubliez pas que l'ordre des défenses est crucial pour une protection optimale. Réfléchissez au chemin que prend une attaque.</p>
          </div>
        `;
      }
      
      // Afficher le feedback dans une fenêtre de dialogue
      setAiAdviceDialogContent(feedbackContent);
      setShowAiAdviceDialog(true);
      
    }, 1000); // Délai pour ne pas trop surcharger l'utilisateur
    
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
    
    // Si c'est la première défense placée, afficher un toast d'encouragement
    if (gameState.gamePhase === 'playing' && gameState.placedDefenses.length === 0) {
      toast({
        title: "Première défense placée",
        description: "Continuez à placer les défenses dans l'ordre optimal !",
      });
    }
  }, [gameState.gamePhase, gameState.placedDefenses.length, timerInterval, toast]);
  
  const handleDndEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    // Si on dépose sur la zone de configuration réseau
    if (over) {
      if (over.id === 'network-dropzone' || over.id.toString().startsWith('dropzone-')) {
        // Trouver la prochaine position disponible
        const nextPosition = gameState.placedDefenses.length + 1;
        const defenseId = String(active.id);
        handlePlaceDefense(nextPosition, defenseId);
      }
    }
    
    setDraggedDefenseId(null);
    setActiveSlot(null);
  }, [gameState.placedDefenses, handlePlaceDefense]);
  
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
  
  // Effet pour surveiller les changements dans les défenses placées (timer code désactivé)
  useEffect(() => {
    if (!currentLevel) return;
    
    // Démarrer automatiquement le chronomètre lors du premier placement en phase de jeu
    if (gameState.gamePhase === 'playing' && 
        gameState.placedDefenses.length === 1 && 
        !timerInterval) {
      
      // Démarrer le chronomètre
      const interval = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          timer: prev.timer + 1
        }));
      }, 1000);
      
      setTimerInterval(interval);
      
      return () => {
        clearInterval(interval);
      };
    }
  }, [currentLevel, gameState.placedDefenses, gameState.gamePhase, timerInterval]);
  
  // Effet pour gérer l'état du jeu en fonction des changements de phase
  useEffect(() => {
    // Si on passe en phase de jeu, réinitialiser les compteurs (timer désactivé)
    if (gameState.gamePhase === 'playing' && gameState.timer === 0) {
      // Initialisation du jeu en mode placement de défenses
      setGameState(prev => ({
        ...prev,
        timer: 0
      }));
    }
    
    // Assurer le nettoyage de toute référence au timer (code de sécurité)
    if (gameState.gamePhase === 'results' && timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
  }, [currentLevel, gameState.gamePhase, timerInterval, gameState.timer]);
  
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
          {/* Zone de placement des défenses (gauche) - Playground amélioré */}
          <div className="lg:col-span-4">
            <Card className="bg-gray-800 border-gray-700 shadow-lg p-4">
              <h3 className="font-semibold text-white mb-4">Configuration du réseau</h3>
              
              <div 
                className="relative bg-gray-900 rounded-lg mb-4 p-6" 
                style={{ minHeight: '500px', backgroundImage: 'radial-gradient(circle, rgba(66, 71, 91, 0.5) 1px, transparent 1px)', backgroundSize: '30px 30px' }}
              >
                {/* Réseau schématique */}
                <div className="absolute inset-10 flex flex-col items-center justify-between">
                  <div className="w-32 px-3 py-2 bg-blue-500 text-white text-center rounded font-medium mb-2">
                    Internet
                  </div>
                  <div className="h-16 w-1 bg-blue-500"></div>
                  
                  {/* Zone de placement libre pour les défenses */}
                  <div className="flex-1 w-full relative">
                    {/* Zone droppable pour le placement des défenses */}
                    <div 
                      className={`absolute inset-0 rounded-lg ${gameState.placedDefenses.length === 0 ? 'border-2 border-dashed border-blue-400/30' : ''}`}
                      style={{ zIndex: 5 }}
                      id="network-dropzone"
                      onDragOver={(e) => {
                        // Nécessaire pour permettre le drop
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const defenseId = e.dataTransfer.getData('text/plain');
                        if (defenseId) {
                          // Trouver la prochaine position disponible
                          const nextPosition = gameState.placedDefenses.length + 1;
                          handlePlaceDefense(nextPosition, defenseId);
                        }
                      }}
                    >
                      {/* Positions des défenses placées */}
                      {Array.from({ length: 6 }).map((_, idx) => {
                        const position = idx + 1;
                        const isPlaced = gameState.placedDefenses.some(pd => pd.position === position);
                        
                        return (
                          <div 
                            key={`dropzone-${position}`}
                            className={`absolute rounded-lg transition-all ${isPlaced ? '' : 'border border-dashed border-blue-400/20'}`}
                            style={{ 
                              top: `${(idx * 70) + 40}px`,
                              left: '50%',
                              width: '120px',
                              height: '60px',
                              transform: 'translateX(-50%)',
                              zIndex: 10
                            }}
                          >
                            {!isPlaced && (
                              <div className="flex items-center justify-center h-full">
                                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-700/50 text-white/50 text-xs">
                                  {position}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Les défenses placées */}
                    {gameState.placedDefenses.map((placedDefense, index) => {
                      // Calculer les positions basées sur l'ordre
                      const defense = currentLevel.defenses.find(d => d.id === placedDefense.defenseId);
                      
                      return (
                        <div 
                          key={`${placedDefense.defenseId}-${index}`}
                          className="absolute flex flex-col items-center"
                          style={{ 
                            top: `${((placedDefense.position - 1) * 70) + 40}px`, 
                            left: '50%',
                            transform: 'translateX(-50%)',
                            zIndex: 20,
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <div 
                            className={`px-4 py-2 rounded-lg shadow-lg border-2 ${
                              placedDefense.isCorrect === true ? 'border-green-500 bg-green-900/40' : 
                              placedDefense.isCorrect === false ? 'border-red-500 bg-red-900/40' : 
                              defense ? `border-${defense.color || 'blue-500'} bg-gray-800` : 'border-blue-500 bg-gray-800'
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-700 text-white text-xs">
                                {placedDefense.position}
                              </span>
                              <span className="text-white text-sm font-medium">
                                {defense?.name || 'Défense'}
                              </span>
                            </div>
                          </div>
                          
                          {/* Ligne de connexion vers la défense suivante */}
                          {index < gameState.placedDefenses.length - 1 && 
                           placedDefense.position < gameState.placedDefenses.length && (
                            <div className="h-10 w-0.5 bg-blue-400 mt-1"></div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Zones de dépôt pour les éléments à protéger */}
                  <div className="h-16 w-1 bg-blue-500"></div>
                  <div className="grid grid-cols-3 gap-4 mt-2 w-full">
                    <div className="px-3 py-2 bg-green-500/20 border border-green-500 text-white text-center rounded text-sm">
                      Serveurs
                    </div>
                    <div className="px-3 py-2 bg-purple-500/20 border border-purple-500 text-white text-center rounded text-sm">
                      Applications
                    </div>
                    <div className="px-3 py-2 bg-amber-500/20 border border-amber-500 text-white text-center rounded text-sm">
                      Données
                    </div>
                  </div>
                </div>
                
                {/* Légende et informations */}
                <div className="absolute top-4 right-4 bg-gray-800/80 p-2 rounded-lg">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                      <span className="text-xs text-gray-300">Position correcte</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
                      <span className="text-xs text-gray-300">Position incorrecte</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
                      <span className="text-xs text-gray-300">À évaluer</span>
                    </div>
                  </div>
                </div>
                
                {/* Indicateur de zone de dépôt lorsqu'aucune défense n'est placée */}
                {gameState.placedDefenses.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-gray-500 text-center p-6 rounded-lg bg-gray-800/30 border border-dashed border-gray-700 max-w-xs">
                      <Shield className="w-12 h-12 mx-auto mb-2 text-blue-400/50" />
                      <p>Glissez-déposez les défenses depuis la liste de droite pour les placer sur votre réseau</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Suppression de barre de progression basée sur le temps 
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
              )} */}
              
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
                
                <div className="max-h-[360px] overflow-y-auto pr-1 space-y-3 custom-scrollbar">
                  {availableDefenses.map((defense, index) => (
                    <div 
                      key={defense.id}
                      data-dnd-id={defense.id}
                      draggable="true"
                      className="bg-gray-700 rounded-md overflow-hidden transition-all duration-200 hover:bg-gray-600 cursor-move"
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', defense.id);
                        setDraggedDefenseId(defense.id);
                      }}
                    >
                      <div className="p-3">
                        <div className="flex items-center">
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs mr-2">
                            {index + 1}
                          </div>
                          <h4 className="font-medium text-white">{defense.name}</h4>
                        </div>
                        
                        <div className="mt-2 flex justify-between items-center">
                          <div className="flex space-x-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-900/50 text-blue-200">
                              {defense.type}
                            </span>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-900/50 text-amber-200">
                              Lvl {defense.level}
                            </span>
                          </div>
                          <Shield className="h-5 w-5 text-blue-400" />
                        </div>
                      </div>
                      
                      <div className="p-2 bg-gray-800 text-xs text-gray-300 leading-relaxed">
                        {defense.description}
                      </div>
                    </div>
                  ))}
                  
                  {availableDefenses.length === 0 && (
                    <div className="bg-gray-700/50 rounded p-4 text-center">
                      <ShieldCheck className="h-10 w-10 mx-auto mb-2 text-blue-400/50" />
                      <p className="text-sm text-gray-300">Toutes les défenses ont été placées sur le réseau.</p>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <h4 className="text-sm font-semibold text-white mb-2">Informations du niveau</h4>
                  
                  <div className="mb-3 p-3 bg-gray-700/50 rounded-md">
                    <h5 className="text-sm font-medium text-white mb-1">Objectif</h5>
                    <p className="text-xs text-gray-300">{currentLevel.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-gray-700/30 p-2 rounded-md flex flex-col items-center">
                      <div className="flex items-center mb-1">
                        <Shield className="h-3 w-3 text-blue-400 mr-1" />
                        <span className="text-xs text-gray-300">Défenses</span>
                      </div>
                      <span className="text-white font-medium">{currentLevel.defenses.length}</span>
                    </div>
                    
                    <div className="bg-gray-700/30 p-2 rounded-md flex flex-col items-center">
                      <div className="flex items-center mb-1">
                        <CircuitBoard className="h-3 w-3 text-amber-400 mr-1" />
                        <span className="text-xs text-gray-300">Logique</span>
                      </div>
                      <span className="text-white font-medium">Défense en profondeur</span>
                    </div>
                    
                    <div className="bg-gray-700/30 p-2 rounded-md flex flex-col items-center">
                      <div className="flex items-center mb-1">
                        <Star className="h-3 w-3 text-purple-400 mr-1" />
                        <span className="text-xs text-gray-300">Score max</span>
                      </div>
                      <span className="text-white font-medium">{currentLevel.maxScore}</span>
                    </div>
                    
                    <div className="bg-gray-700/30 p-2 rounded-md flex flex-col items-center">
                      <div className="flex items-center mb-1">
                        <BarChart className="h-3 w-3 text-emerald-400 mr-1" />
                        <span className="text-xs text-gray-300">Difficulté</span>
                      </div>
                      <span className="text-white font-medium">{difficulty}</span>
                    </div>
                  </div>
                </div>
                
                {/* Styles pour les scrollbars personnalisées */}
                <style dangerouslySetInnerHTML={{ 
                  __html: `
                    .custom-scrollbar::-webkit-scrollbar {
                      width: 8px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                      background: rgba(31, 41, 55, 0.5);
                      border-radius: 10px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                      background: rgba(59, 130, 246, 0.5);
                      border-radius: 10px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                      background: rgba(59, 130, 246, 0.7);
                    }
                  `
                }} />
              </Card>
            )}
          </div>
        </div>
      </div>
      
      {/* Dialogue de feedback pédagogique IA */}
      <Dialog open={showAiAdviceDialog} onOpenChange={setShowAiAdviceDialog}>
        <DialogContent className="sm:max-w-[600px] bg-gray-900 border-blue-600">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-blue-400">
              <Brain className="h-5 w-5" />
              Analyse IA - Retour pédagogique
            </DialogTitle>
            <DialogDescription>
              Analyse et conseils pour améliorer votre stratégie de cybersécurité
            </DialogDescription>
          </DialogHeader>
          
          <div className="custom-scrollbar max-h-[60vh] overflow-y-auto pr-2" 
               dangerouslySetInnerHTML={{ __html: aiAdviceDialogContent }} />
          
          <DialogFooter>
            <Button onClick={() => setShowAiAdviceDialog(false)}>
              J'ai compris
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DndContext>
  );
};

export default FirewallDefenseGame;