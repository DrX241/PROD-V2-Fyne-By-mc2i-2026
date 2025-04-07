import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, Network, BarChart, Users, 
  Play, RotateCcw, ArrowRight, AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

import { FirewallDefenseGameProps, Defense, Zone, GameState } from './types';
import { 
  generateDefenses, 
  generateZones, 
  generateAttacks, 
  generateInitialResources,
  tutorialSteps
} from './data';
import DraggableDefense from './DraggableDefense';
import ZoneComponent from './ZoneComponent';
import TutorialPanel from './TutorialPanel';

const FirewallDefenseGame: React.FC<FirewallDefenseGameProps> = ({ 
  difficulty, 
  onGameEnd 
}) => {
  const { toast } = useToast();
  const [gameState, setGameState] = useState<GameState>({
    phase: 'setup',
    level: 1,
    maxLevel: difficulty === 'Facile' ? 3 : (difficulty === 'Moyen' ? 5 : 7),
    showTutorial: true,
    tutorialStep: 0,
    defenseInventory: [],
    zones: [],
    resources: { budget: 0, manpower: 0 },
    attackTypes: [],
    simulationResults: null,
    score: 0,
    simulationTimeLeft: 10,
    activeAttacks: []
  });
  
  // État pour le glisser-déposer
  const [draggedDefenseId, setDraggedDefenseId] = useState<string | null>(null);
  const [zoneHoverId, setZoneHoverId] = useState<string | null>(null);
  
  // Références
  const gameAreaRef = useRef<HTMLDivElement>(null);
  
  // Initialisation du jeu
  useEffect(() => {
    initializeGame();
  }, [difficulty]);
  
  // Initialisation du jeu
  const initializeGame = () => {
    const defenses = generateDefenses();
    const zones = generateZones();
    const attacks = generateAttacks(difficulty);
    const resources = generateInitialResources(difficulty);
    
    setGameState({
      ...gameState,
      defenseInventory: defenses,
      zones: zones,
      attackTypes: attacks,
      resources: resources,
      phase: 'setup',
      showTutorial: true,
      tutorialStep: 0,
      level: 1,
      score: 0,
      simulationTimeLeft: 10,
      activeAttacks: [],
      simulationResults: null
    });
  };
  
  // Gestion du tutoriel
  const handleNextTutorialStep = () => {
    setGameState(prev => ({
      ...prev,
      tutorialStep: prev.tutorialStep + 1
    }));
  };
  
  const handleCompleteTutorial = () => {
    setGameState(prev => ({
      ...prev,
      showTutorial: false
    }));
  };
  
  // Gestion du drag and drop des défenses
  const handleDragStart = (defenseId: string) => {
    setDraggedDefenseId(defenseId);
  };
  
  const handleDragEnd = () => {
    setDraggedDefenseId(null);
    setZoneHoverId(null);
  };
  
  // Ajouter une défense à une zone
  const handleAddDefenseToZone = (zoneId: string) => {
    if (!draggedDefenseId) return;
    
    const defense = gameState.defenseInventory.find(d => d.id === draggedDefenseId);
    if (!defense) return;
    
    // Vérifier si assez de ressources
    if (gameState.resources.budget < defense.cost || gameState.resources.manpower < defense.manpower) {
      toast({
        title: "Ressources insuffisantes",
        description: `Il vous manque ${gameState.resources.budget < defense.cost ? `${defense.cost - gameState.resources.budget}€` : ''} ${gameState.resources.budget < defense.cost && gameState.resources.manpower < defense.manpower ? ' et ' : ''} ${gameState.resources.manpower < defense.manpower ? `${defense.manpower - gameState.resources.manpower} personnel` : ''}`,
        variant: "destructive",
      });
      return;
    }
    
    // Ajouter l'ID de la défense à la zone
    const updatedZones = gameState.zones.map(zone => {
      if (zone.id === zoneId) {
        return {
          ...zone,
          defenses: [...zone.defenses, draggedDefenseId]
        };
      }
      return zone;
    });
    
    // Retirer la défense de l'inventaire
    const updatedInventory = gameState.defenseInventory.filter(d => d.id !== draggedDefenseId);
    
    // Mettre à jour les ressources
    const updatedResources = {
      budget: gameState.resources.budget - defense.cost,
      manpower: gameState.resources.manpower - defense.manpower
    };
    
    setGameState(prev => ({
      ...prev,
      zones: updatedZones,
      defenseInventory: updatedInventory,
      resources: updatedResources
    }));
    
    toast({
      title: "Défense déployée",
      description: `${defense.name} a été installé dans la zone ${gameState.zones.find(z => z.id === zoneId)?.name}`,
    });
  };
  
  // Lancer la simulation
  const startSimulation = () => {
    // Vérifier qu'au moins une défense est placée
    if (gameState.zones.every(zone => zone.defenses.length === 0)) {
      toast({
        title: "Aucune défense déployée",
        description: "Vous devez déployer au moins une défense pour lancer la simulation.",
        variant: "destructive",
      });
      return;
    }
    
    setGameState(prev => ({
      ...prev,
      phase: 'simulation',
      simulationTimeLeft: 10
    }));
    
    // Simuler les résultats après 10 secondes
    setTimeout(() => {
      runSimulation();
    }, 10000);
  };
  
  // Simulation des attaques
  const runSimulation = () => {
    // TODO: Implémenter la logique de simulation complète
    
    // Exemple simple pour démonstration
    const successfulAttacks = Math.floor(Math.random() * 3);
    const blockedAttacks = Math.floor(Math.random() * 4) + 2;
    const compromisedZones: string[] = [];
    
    if (successfulAttacks > 0) {
      const vulnerableZones = gameState.zones.filter(zone => zone.defenses.length === 0);
      if (vulnerableZones.length > 0) {
        compromisedZones.push(vulnerableZones[0].id);
      }
    }
    
    const levelScore = blockedAttacks * 100 - successfulAttacks * 150;
    const totalScore = gameState.score + Math.max(0, levelScore);
    
    setGameState(prev => ({
      ...prev,
      phase: 'results',
      simulationResults: {
        wave: prev.level,
        attacks: [],
        results: {
          successfulAttacks,
          blockedAttacks,
          compromisedZones,
          score: levelScore
        },
        feedback: successfulAttacks === 0 
          ? "Excellent travail! Toutes les attaques ont été bloquées." 
          : "Certaines attaques ont réussi. Renforcez votre défense.",
        level: prev.level,
        maxLevel: prev.maxLevel
      },
      score: totalScore
    }));
  };
  
  // Passer au niveau suivant
  const goToNextLevel = () => {
    if (gameState.level >= gameState.maxLevel) {
      // Jeu terminé
      if (onGameEnd) {
        onGameEnd(gameState.score);
      }
      return;
    }
    
    // Réinitialiser pour le niveau suivant
    const defenses = generateDefenses();
    const zones = gameState.zones.map(zone => ({
      ...zone,
      defenses: []
    }));
    const resources = generateInitialResources(difficulty);
    
    setGameState(prev => ({
      ...prev,
      level: prev.level + 1,
      phase: 'setup',
      defenseInventory: defenses,
      zones: zones,
      resources: resources,
      simulationResults: null
    }));
  };
  
  // Recommencer le niveau
  const restartLevel = () => {
    // Réinitialiser le niveau actuel
    const defenses = generateDefenses();
    const zones = gameState.zones.map(zone => ({
      ...zone,
      defenses: []
    }));
    const resources = generateInitialResources(difficulty);
    
    setGameState(prev => ({
      ...prev,
      phase: 'setup',
      defenseInventory: defenses,
      zones: zones,
      resources: resources,
      simulationResults: null
    }));
  };
  
  // Rendu de l'interface selon la phase de jeu
  const renderTutorial = () => (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
      <TutorialPanel
        steps={tutorialSteps}
        currentStep={gameState.tutorialStep}
        onNext={handleNextTutorialStep}
        onComplete={handleCompleteTutorial}
      />
    </div>
  );
  
  const renderSetupPhase = () => (
    <div className="grid grid-cols-1 gap-4 p-4">
      <div className="flex flex-col">
        {/* Header avec informations du jeu */}
        <div className="bg-gray-800 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <ShieldCheck className="w-6 h-6 mr-2 text-blue-400" />
              <h2 className="text-xl font-bold text-white">Niveau {gameState.level}/{gameState.maxLevel} - {difficulty}</h2>
            </div>
            
            <div className="flex space-x-4">
              <div className="bg-gray-700 rounded-lg px-3 py-1 text-sm flex items-center">
                <BarChart className="w-4 h-4 mr-1 text-amber-400" />
                <span className="text-amber-400 font-bold">{gameState.resources.budget}€</span>
              </div>
              <div className="bg-gray-700 rounded-lg px-3 py-1 text-sm flex items-center">
                <Users className="w-4 h-4 mr-1 text-blue-400" />
                <span className="text-blue-400 font-bold">{gameState.resources.manpower}</span>
              </div>
              <div className="bg-gray-700 rounded-lg px-3 py-1 text-sm flex items-center">
                <Network className="w-4 h-4 mr-1 text-purple-400" />
                <span className="text-purple-400 font-bold">{gameState.score} pts</span>
              </div>
            </div>
          </div>
        </div>
      
        {/* Aire de jeu principale */}
        <div className="bg-gray-800 rounded-lg p-4 mb-4 relative">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <Network className="w-6 h-6 mr-2 text-purple-400" />
            Infrastructure réseau
          </h2>
          
          {/* Zone de jeu interactive */}
          <div 
            ref={gameAreaRef}
            className="relative bg-gray-900 rounded-lg p-4 min-h-[500px]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%233f4865' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
            }}
          >
            {/* Zones de l'infrastructure */}
            {gameState.zones.map(zone => (
              <ZoneComponent
                key={zone.id}
                zone={zone}
                defenses={gameState.defenseInventory}
                onDrop={handleAddDefenseToZone}
                isDraggingOver={draggedDefenseId !== null && zoneHoverId === zone.id}
              />
            ))}
            
            {/* Lignes de connexion entre les zones (à implémenter) */}
          </div>
        </div>
      
        {/* Liste des défenses disponibles */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <ShieldCheck className="w-6 h-6 mr-2 text-blue-400" />
            Défenses disponibles
          </h2>
          
          {gameState.defenseInventory.length === 0 ? (
            <div className="text-center py-6 text-gray-400">
              <AlertTriangle className="w-10 h-10 mx-auto mb-2 text-amber-500" />
              <p>Vous avez utilisé toutes vos défenses disponibles.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gameState.defenseInventory.map((defense) => (
                <DraggableDefense
                  key={defense.id}
                  defense={defense}
                  onDragStart={() => handleDragStart(defense.id)}
                  onDragEnd={handleDragEnd}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Boutons d'action */}
        <div className="flex justify-end mt-4 space-x-3">
          <Button
            variant="outline"
            className="border-gray-700 text-gray-300 hover:bg-gray-700"
            onClick={restartLevel}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Recommencer
          </Button>
          
          <Button
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={startSimulation}
          >
            <Play className="mr-2 h-4 w-4" />
            Lancer la simulation
          </Button>
        </div>
      </div>
    </div>
  );
  
  const renderSimulationPhase = () => (
    <div className="p-4">
      <Card>
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-center mb-4">Simulation en cours...</h2>
          <Progress value={(10 - gameState.simulationTimeLeft) * 10} className="h-2 mb-2" />
          <p className="text-center text-sm text-gray-500">
            Temps restant: {gameState.simulationTimeLeft} secondes
          </p>
          
          <div className="mt-8 flex justify-center">
            <div className="w-full max-w-3xl min-h-[300px] bg-gray-900 rounded-lg p-4 relative">
              {/* Ici, nous aurons des animations montrant les attaques en cours */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-pulse text-amber-500 text-center">
                  <AlertTriangle className="w-16 h-16 mx-auto mb-4" />
                  <p className="text-xl">Attaques en cours...</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
  
  const renderResultsPhase = () => {
    if (!gameState.simulationResults) return null;
    
    const { results, feedback, level, maxLevel } = gameState.simulationResults;
    
    return (
      <div className="p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-lg overflow-hidden shadow-lg"
        >
          <div className="bg-gray-700 p-6 text-center">
            <h2 className="text-2xl font-bold text-white mb-1">Résultats de la simulation</h2>
            <p className="text-gray-300">Niveau {level}/{maxLevel} - {difficulty}</p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-green-900 bg-opacity-30 rounded-lg p-4 text-center">
                <h3 className="text-xl font-bold text-green-400 mb-1">{results.blockedAttacks}</h3>
                <p className="text-gray-300">Attaques bloquées</p>
              </div>
              
              <div className="bg-red-900 bg-opacity-30 rounded-lg p-4 text-center">
                <h3 className="text-xl font-bold text-red-400 mb-1">{results.successfulAttacks}</h3>
                <p className="text-gray-300">Attaques réussies</p>
              </div>
              
              <div className="bg-blue-900 bg-opacity-30 rounded-lg p-4 text-center">
                <h3 className="text-xl font-bold text-blue-400 mb-1">{results.score}</h3>
                <p className="text-gray-300">Points gagnés</p>
              </div>
            </div>
            
            <Alert className={`mb-6 ${results.successfulAttacks === 0 ? 'bg-green-900 bg-opacity-20' : 'bg-amber-900 bg-opacity-20'}`}>
              <AlertTitle className={results.successfulAttacks === 0 ? 'text-green-400' : 'text-amber-400'}>
                Rapport de sécurité
              </AlertTitle>
              <AlertDescription className="text-gray-300">
                {feedback}
              </AlertDescription>
            </Alert>
            
            {results.compromisedZones.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-red-400 mb-2">Zones compromises:</h3>
                <ul className="list-disc list-inside text-gray-300">
                  {results.compromisedZones.map(zoneId => (
                    <li key={zoneId}>
                      {gameState.zones.find(z => z.id === zoneId)?.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
              <Button
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
                onClick={restartLevel}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Rejouer le niveau
              </Button>
              
              {level < maxLevel ? (
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={goToNextLevel}
                >
                  Niveau suivant
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                  onClick={() => { if (onGameEnd) onGameEnd(gameState.score); }}
                >
                  Terminer le jeu
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    );
  };
  
  return (
    <div className="bg-gray-900 text-white min-h-[calc(100vh-64px)]">
      <AnimatePresence>
        {gameState.showTutorial && renderTutorial()}
      </AnimatePresence>
      
      {gameState.phase === 'setup' && renderSetupPhase()}
      {gameState.phase === 'simulation' && renderSimulationPhase()}
      {gameState.phase === 'results' && renderResultsPhase()}
    </div>
  );
};

export default FirewallDefenseGame;