import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  Clock, Hourglass, Info, Settings, ShieldCheck, Star, 
  ArrowLeft, Menu, MessageSquare, Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import { GameStatus } from './types/game-enums';
import { GameProvider, useGameState } from './state/game-state-v2';
import RoomView from './components/RoomView';
import CyberTerminal from './components/CyberTerminal';
import InventoryPanel from './components/InventoryPanel';
import QuickActions from './components/QuickActions';
import PhishingChallenge from './components/PhishingChallenge';
import StageProgress from './components/StageProgress';
import CountdownTimer from './components/CountdownTimer';

/**
 * Page de l'interface du jeu CYBER ESCAPE v2.0
 */
const CyberEscapeV2 = () => {
  return (
    <GameProvider>
      <GameInterface />
    </GameProvider>
  );
};

/**
 * Interface principale du jeu CYBER ESCAPE v2.0
 */
const GameInterface = () => {
  const { state, dispatch, currentRoom, handleInteract, handleChallengeComplete } = useGameState();
  const [activeTab, setActiveTab] = useState('vue');
  const [isPaused, setIsPaused] = useState(false);
  const [location, setLocation] = useLocation();
  
  // Gestion des interactions avec les éléments
  const handleObjectClick = (objectId: string) => {
    const object = currentRoom.objects.find(obj => obj.id === objectId);
    if (!object) return;
    
    if (object.collectible) {
      // Créer un item d'inventaire à partir de l'objet
      const inventoryItem = {
        id: object.id,
        name: object.name,
        description: object.description,
        type: typeof object.type === 'string' ? object.type : object.type.toString(),
        imagePath: object.imagePath,
        usable: true
      };
      
      dispatch({ 
        type: 'COLLECT_ITEM', 
        payload: inventoryItem 
      });
    } else {
      // Gérer l'interaction avec l'objet
      if (object.id === 'terminal_phishing') {
        // Démarrer le défi de détection de phishing
        dispatch({ 
          type: 'START_CHALLENGE', 
          payload: 'phishing_detection_lvl1' 
        });
      } else {
        // Message d'interaction standard
        dispatch({ 
          type: 'INTERACT', 
          payload: { message: `Vous examinez ${object.name}: ${object.description}` } 
        });
      }
    }
  };
  
  // Gérer les interactions avec les PNJ
  const handleNpcClick = (npcId: string) => {
    const npc = currentRoom.npcs.find(n => n.id === npcId);
    if (!npc) return;
    
    // Afficher un dialogue aléatoire du PNJ
    const dialogueIndex = Math.floor(Math.random() * npc.dialogues.length);
    dispatch({ 
      type: 'INTERACT', 
      payload: { message: `${npc.name} (${npc.role}): "${npc.dialogues[dialogueIndex]}"` } 
    });
  };
  
  // Gérer les sorties de la salle
  const handleExitClick = (exitKey: string) => {
    const exit = currentRoom.exits[exitKey];
    if (!exit) return;
    
    if (exit.status === 'locked') {
      if (exit.requiresItem && state.inventory[exit.requiresItem]) {
        // Utiliser l'objet pour déverrouiller la sortie
        dispatch({ type: 'UNLOCK_EXIT', payload: { message: `Vous utilisez ${state.inventory[exit.requiresItem].name} pour déverrouiller l'accès à ${exit.name}.` } });
        
        // Déplacer vers la nouvelle salle
        dispatch({ type: 'MOVE', payload: exit.roomId });
      } else {
        // Message d'échec
        dispatch({ 
          type: 'INTERACT', 
          payload: { message: `Cette porte est verrouillée. ${exit.requiresItem ? 'Vous avez besoin d\'un objet spécifique pour l\'ouvrir.' : ''}` } 
        });
      }
    } else if (exit.status === 'open') {
      // Déplacer vers la nouvelle salle
      dispatch({ type: 'MOVE', payload: exit.roomId });
    }
  };
  
  // Gérer l'utilisation d'un objet de l'inventaire
  const handleUseItem = (itemId: string) => {
    const item = state.inventory[itemId];
    if (!item) return;
    
    dispatch({ 
      type: 'INTERACT', 
      payload: { message: `Vous utilisez ${item.name}. ${item.description}` } 
    });
  };
  
  // Mettre en pause le jeu
  const togglePause = () => {
    if (isPaused) {
      dispatch({ type: 'RESUME_GAME' });
      setIsPaused(false);
    } else {
      dispatch({ type: 'PAUSE_GAME' });
      setIsPaused(true);
    }
  };
  
  // Retourner à l'accueil
  const handleExit = () => {
    setLocation('/cyber/arcade');
  };
  
  // Afficher le défi en cours
  const renderChallengeView = () => {
    if (state.status !== GameStatus.CHALLENGE_ACTIVE || !state.activeChallengeId) {
      return null;
    }
    
    const challenge = currentRoom.challenge;
    if (!challenge) return null;
    
    switch (challenge.type) {
      case 'phishing':
        return (
          <PhishingChallenge 
            onComplete={handleChallengeComplete}
            difficultyLevel="beginner"
          />
        );
      default:
        return (
          <div className="p-4 bg-black/50 rounded-lg border border-red-500">
            <p className="text-red-400">Type de défi non implémenté: {challenge.type}</p>
          </div>
        );
    }
  };
  
  // Si le jeu est en cours d'initialisation
  if (state.status === GameStatus.INITIALIZING) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="text-center">
          <ShieldCheck className="h-16 w-16 mx-auto mb-4 text-green-500" />
          <h1 className="text-2xl font-bold text-green-400 mb-2">CYBER ESCAPE v2.0</h1>
          <p className="text-gray-400">Initialisation du système...</p>
          <div className="w-48 h-2 bg-gray-800 rounded-full mt-4 mx-auto overflow-hidden">
            <div 
              className="h-full bg-green-500 transition-all duration-1000"
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </div>
    );
  }
  
  // Si le jeu est terminé (victoire ou défaite)
  if (state.status === GameStatus.GAME_OVER || state.status === GameStatus.VICTORY) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div
          className="text-center bg-black/60 backdrop-blur-sm p-8 rounded-lg border-2 max-w-md mx-4"
          style={{ borderColor: state.status === GameStatus.VICTORY ? '#10b981' : '#ef4444' }}
        >
          {state.status === GameStatus.VICTORY ? (
            <>
              <Star className="h-16 w-16 mx-auto mb-4 text-green-500" />
              <h1 className="text-2xl font-bold text-green-400 mb-2">Mission Accomplie!</h1>
              <p className="text-gray-300 mb-4">
                Félicitations! Vous avez rétabli la sécurité du système et complété l'escape game.
              </p>
            </>
          ) : (
            <>
              <Hourglass className="h-16 w-16 mx-auto mb-4 text-red-500" />
              <h1 className="text-2xl font-bold text-red-400 mb-2">Mission Échouée</h1>
              <p className="text-gray-300 mb-4">
                Le temps est écoulé. Vous n'avez pas réussi à rétablir la sécurité du système à temps.
              </p>
            </>
          )}
          
          <div className="flex justify-center gap-4 mt-6">
            <Button
              variant="outline"
              onClick={() => dispatch({ type: 'RESTART_GAME' })}
              className="border-blue-700 text-blue-400"
            >
              Réessayer
            </Button>
            
            <Button 
              onClick={handleExit}
            >
              Quitter
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // Si un défi est actif
  if (state.status === GameStatus.CHALLENGE_ACTIVE) {
    return (
      <div className="min-h-screen bg-gray-950 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <Button variant="outline" size="sm" onClick={togglePause}>
              <Settings className="h-4 w-4 mr-2" />
              {isPaused ? 'Reprendre' : 'Pause'}
            </Button>
            
            <div className="text-center">
              <p className="text-gray-400">Niveau {state.currentStage}: {currentRoom.name}</p>
              <StageProgress currentStage={state.currentStage} totalStages={10} unlockedStages={state.unlockedStages} />
            </div>
            
            <CountdownTimer seconds={state.timeRemaining} isActive={state.isTimerActive && !isPaused} />
          </div>
          
          <div className="bg-black/70 rounded-lg p-4 mb-4 border border-gray-800">
            <h2 className="text-xl font-bold text-green-400 mb-2">Défi en cours</h2>
            {renderChallengeView()}
          </div>
        </div>
      </div>
    );
  }
  
  // Interface de jeu normale
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Barre supérieure */}
      <div className="bg-gray-900 p-2 border-b border-gray-800">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" onClick={handleExit} className="text-gray-400">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quitter
            </Button>
          </div>
          
          <div className="text-center">
            <p className="text-gray-400">Niveau {state.currentStage}: {currentRoom.name}</p>
            <StageProgress currentStage={state.currentStage} totalStages={10} unlockedStages={state.unlockedStages} />
          </div>
          
          <div className="flex items-center">
            <CountdownTimer seconds={state.timeRemaining} isActive={state.isTimerActive && !isPaused} />
            <Button variant="ghost" size="sm" onClick={togglePause} className="ml-2 text-gray-400">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Contenu du jeu */}
      <div className="flex-grow flex flex-col md:flex-row p-2 lg:p-4 gap-4 max-w-7xl mx-auto w-full">
        {/* Vue principale */}
        <div className="md:w-2/3 h-[50vh] md:h-auto">
          <div className="h-full relative overflow-hidden border border-gray-800 rounded-lg">
            {/* Afficher la vue de la salle */}
            <RoomView 
              room={currentRoom} 
              onObjectClick={handleObjectClick}
              onNpcClick={handleNpcClick}
              onExitClick={handleExitClick}
            />
            
            {/* Actions rapides */}
            <div className="absolute bottom-4 right-4">
              <QuickActions 
                onAction={(action: string, target?: string) => {
                  switch(action) {
                    case 'examine':
                      dispatch({ 
                        type: 'INTERACT', 
                        payload: { message: `Vous examinez la salle: ${currentRoom.description}` } 
                      });
                      break;
                    case 'npc':
                      // Cette action sera gérée par une modal de sélection
                      if (currentRoom.npcs.length > 0) {
                        const randomNpc = currentRoom.npcs[Math.floor(Math.random() * currentRoom.npcs.length)];
                        handleNpcClick(randomNpc.id);
                      } else {
                        dispatch({ 
                          type: 'INTERACT', 
                          payload: { message: "Il n'y a personne d'autre dans cette salle." } 
                        });
                      }
                      break;
                  }
                }}
              />
            </div>
          </div>
        </div>
        
        {/* Panels latéraux */}
        <div className="md:w-1/3 flex flex-col gap-4">
          <Tabs defaultValue="console" className="h-full">
            <TabsList className="w-full">
              <TabsTrigger value="console" className="flex-1"><MessageSquare className="h-4 w-4 mr-2" /> Terminal</TabsTrigger>
              <TabsTrigger value="inventory" className="flex-1"><Package className="h-4 w-4 mr-2" /> Inventaire</TabsTrigger>
              <TabsTrigger value="help" className="flex-1"><Info className="h-4 w-4 mr-2" /> Aide</TabsTrigger>
            </TabsList>
            
            <TabsContent value="console" className="h-full">
              <CyberTerminal messages={state.messages} />
            </TabsContent>
            
            <TabsContent value="inventory" className="h-full">
              <InventoryPanel 
                inventory={Object.values(state.inventory)} 
                onUseItem={handleUseItem}
              />
            </TabsContent>
            
            <TabsContent value="help" className="h-full">
              <div className="bg-gray-900 p-4 rounded-lg border border-gray-800 h-full overflow-y-auto">
                <h3 className="text-lg font-bold text-blue-400 mb-2">Aide du jeu</h3>
                
                <Separator className="my-2" />
                
                <div className="space-y-4 text-gray-300">
                  <div>
                    <h4 className="text-sm font-bold flex items-center text-yellow-400 mb-1">
                      <Info className="h-4 w-4 mr-1" /> Objectif
                    </h4>
                    <p className="text-sm">Votre mission est de restaurer les défenses de l'entreprise après une cyberattaque en résolvant 10 défis techniques.</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-bold flex items-center text-yellow-400 mb-1">
                      <Info className="h-4 w-4 mr-1" /> Commandes
                    </h4>
                    <p className="text-sm">Cliquez sur les objets, personnages et sorties pour interagir. Utilisez les actions rapides en bas à droite pour des interactions générales.</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-bold flex items-center text-yellow-400 mb-1">
                      <Info className="h-4 w-4 mr-1" /> Inventaire
                    </h4>
                    <p className="text-sm">Collectez des objets qui pourront vous aider à résoudre des défis ou à débloquer des passages.</p>
                  </div>
                  
                  <Separator className="my-2" />
                  
                  <div>
                    <p className="text-xs text-gray-500">Version 2.0 - Niveau 1</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Modal de pause */}
      <Dialog open={isPaused} onOpenChange={setIsPaused}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Jeu en pause</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-center text-gray-400 mb-4">Temps restant: {Math.floor(state.timeRemaining / 60)}:{(state.timeRemaining % 60).toString().padStart(2, '0')}</p>
            
            <div className="flex flex-col gap-2">
              <Button onClick={() => {
                dispatch({ type: 'RESUME_GAME' });
                setIsPaused(false);
              }}>
                Reprendre
              </Button>
              
              <Button variant="outline" onClick={() => dispatch({ type: 'RESTART_GAME' })}>
                Recommencer
              </Button>
              
              <Button variant="destructive" onClick={handleExit}>
                Quitter
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CyberEscapeV2;