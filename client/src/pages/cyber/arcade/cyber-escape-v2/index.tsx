import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  Hourglass, 
  Info, 
  Settings, 
  ShieldCheck, 
  Star 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Importer les enums et types
import { GameStatus } from './types/game-enums';
import { GameProvider, useGameState } from './state/game-state-v2';

// Importer les composants du jeu
import RoomView from './components/RoomView';
import CyberTerminal from './components/CyberTerminal';
import InventoryPanel from './components/InventoryPanel';
import QuickActions from './components/QuickActions';
import PhishingChallenge from './components/PhishingChallenge';
import StageProgress from './components/StageProgress';

// Component principal de l'interface
const CyberEscapeGame = () => {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 p-4">
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-2xl font-bold text-green-400 mb-2">CYBER ESCAPE v2.0</h1>
        <p className="text-gray-400">Version en cours de développement.</p>
        <p className="text-gray-400 mt-4">Composants créés et prêts à l'intégration :</p>
        <ul className="mt-2 text-gray-300 space-y-1">
          <li>• RoomView - Affichage de la salle avec objets et PNJs</li>
          <li>• CyberTerminal - Terminal pour les messages du jeu</li>
          <li>• InventoryPanel - Affichage des objets collectés</li>
          <li>• QuickActions - Actions rapides contextuelles</li>
          <li>• PhishingChallenge - Mini-jeu de détection d'emails malveillants</li>
          <li>• StageProgress - Barre de progression des niveaux</li>
        </ul>
      </div>
    </div>
  );
};

// Interface du jeu
const CyberEscapeInterface = () => {
  const { state, currentRoom, dispatch, handleInteract, handleChallengeComplete, formatTime } = useGameState();
  const [activeTab, setActiveTab] = useState('vue');
  
  // Contrôle de la vue des défis
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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <ShieldCheck className="h-16 w-16 mx-auto mb-4 text-green-500" />
          <h1 className="text-2xl font-bold text-green-400 mb-2">CYBER ESCAPE v2.0</h1>
          <p className="text-gray-400">Initialisation du système...</p>
          <div className="w-48 h-2 bg-gray-800 rounded-full mt-4 mx-auto overflow-hidden">
            <motion.div 
              className="h-full bg-green-500"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1 }}
            />
          </div>
        </motion.div>
      </div>
    );
  }

  // Si le jeu est terminé (victoire ou défaite)
  if (state.status === GameStatus.GAME_OVER || state.status === GameStatus.VICTORY) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
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
          
          <div className="mb-6">
            <p className="text-sm text-gray-400 mb-1">Temps restant</p>
            <p className="text-xl font-mono">{formatTime(state.timeRemaining)}</p>
          </div>
          
          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              onClick={() => dispatch({ type: 'RESTART_GAME' })}
              className={`border-${state.status === GameStatus.VICTORY ? 'green' : 'red'}-500 text-${state.status === GameStatus.VICTORY ? 'green' : 'red'}-400`}
            >
              Recommencer
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 p-4">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <header className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-green-400">
              CYBER ESCAPE: Le Pare-feu est tombé
            </h1>
            <p className="text-gray-400">Niveau {state.currentStage}: {currentRoom.name}</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-black/30 px-3 py-2 rounded-md">
              <Clock className="h-5 w-5 text-yellow-500" />
              <span className="font-mono text-xl text-yellow-400">
                {formatTime(state.timeRemaining)}
              </span>
            </div>
            
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => dispatch({ type: state.status === GameStatus.PAUSED ? 'RESUME_GAME' : 'PAUSE_GAME' })}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </header>
        
        {/* Progression des niveaux */}
        <StageProgress 
          currentStage={state.currentStage} 
          unlockedStages={state.unlockedStages}
          totalStages={10}
        />
        
        {/* Interface principale */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
          {/* Panneau principal (vue de la salle ou défi actif) */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {state.status === GameStatus.CHALLENGE_ACTIVE ? (
                <motion.div
                  key="challenge"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  {renderChallengeView()}
                </motion.div>
              ) : (
                <motion.div
                  key="room"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <RoomView 
                    room={currentRoom} 
                    onInteract={handleInteract}
                  />
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Actions rapides */}
            <div className="mt-4">
              <QuickActions
                onAction={(action, target) => {
                  console.log(`Action: ${action}, Target: ${target}`);
                  
                  // Mapper les actions aux fonctions d'interaction
                  switch(action) {
                    case 'regarder':
                      dispatch({ 
                        type: 'ADD_MESSAGE', 
                        payload: `Vous examinez la salle: ${currentRoom.description}` 
                      });
                      break;
                    case 'aller':
                      // Cette action sera gérée par une modal de sélection
                      console.log("Afficher les sorties disponibles");
                      break;
                    case 'parler':
                      // Cette action sera gérée par une modal de sélection
                      console.log("Afficher les PNJ disponibles");
                      break;
                    case 'examiner':
                      // Cette action sera gérée par une modal de sélection
                      console.log("Afficher les objets à examiner");
                      break;
                    case 'aide':
                      dispatch({ 
                        type: 'ADD_MESSAGE', 
                        payload: "AIDE: Interagissez avec les éléments de la salle, collectez des objets et résolvez des défis pour progresser. Surveillez votre temps!" 
                      });
                      break;
                    default:
                      console.log(`Action non implémentée: ${action}`);
                  }
                }}
                currentRoom={currentRoom}
              />
            </div>
          </div>
          
          {/* Panneau d'informations et contrôles */}
          <div>
            <Tabs defaultValue="vue" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="vue">Terminal</TabsTrigger>
                <TabsTrigger value="inventaire">Inventaire</TabsTrigger>
                <TabsTrigger value="infos">Infos</TabsTrigger>
              </TabsList>
              
              <TabsContent value="vue" className="space-y-4">
                <CyberTerminal
                  messages={state.messages}
                />
              </TabsContent>
              
              <TabsContent value="inventaire">
                <InventoryPanel
                  items={Object.values(state.inventory)}
                  onUseItem={(itemId) => {
                    console.log(`Utilisation de l'item: ${itemId}`);
                  }}
                />
              </TabsContent>
              
              <TabsContent value="infos">
                <Card>
                  <CardContent className="p-4 space-y-4">
                    <div>
                      <h3 className="font-bold text-lg text-green-400 mb-2">Mission</h3>
                      <p className="text-sm text-gray-300">
                        En tant que nouveau RSSI, vous devez traverser 10 niveaux de défis 
                        cybersécurité pour rétablir les défenses du système.
                      </p>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="font-bold text-lg text-green-400 mb-2">Conseils</h3>
                      <ul className="text-sm text-gray-300 space-y-2">
                        <li className="flex items-start gap-2">
                          <Info className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                          <span>Analysez attentivement chaque salle et ses éléments.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Info className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                          <span>Complétez les défis pour débloquer les sorties verrouillées.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Info className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                          <span>Surveillez votre temps - chaque défi réussi vous donne un bonus de temps.</span>
                        </li>
                      </ul>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="font-bold text-lg text-green-400 mb-2">Progression</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <Badge variant="outline" className="border-green-600">
                          Niveau: {state.currentStage}/10
                        </Badge>
                        <Badge variant="outline" className="border-blue-600">
                          Pièce: {currentRoom.id}
                        </Badge>
                        <Badge variant="outline" className="border-yellow-600">
                          Temps: {formatTime(state.timeRemaining)}
                        </Badge>
                        <Badge variant="outline" className="border-purple-600">
                          Objets: {Object.keys(state.inventory).length}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CyberEscapeGame;