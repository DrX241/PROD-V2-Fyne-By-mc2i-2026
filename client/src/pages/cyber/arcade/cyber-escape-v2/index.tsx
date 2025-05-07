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
    <div className="min-h-screen bg-gray-950 bg-[url('/assets/cyber-bg.jpg')] bg-cover bg-center bg-fixed text-gray-200 p-4">
      {/* Overlay pour lisibilité */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-0"></div>
      
      {/* Contenu principal */}
      <div className="relative z-10 max-w-7xl mx-auto pt-6">
        <div className="flex flex-col gap-6">
          {/* Bannière du jeu */}
          <div className="bg-black/60 border border-blue-800 rounded-lg p-6 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-blue-400 mb-4">
              CYBER ESCAPE: Le Pare-feu est tombé
            </h1>
            <p className="text-gray-300 max-w-3xl mx-auto">
              En tant que RSSI nouvellement nommé, votre mission est de restaurer les défenses de l'entreprise après une cyberattaque majeure. 
              Relevez 10 défis techniques à travers différentes salles pour sécuriser à nouveau le système.
            </p>
          </div>
          
          {/* Présentation des composants du jeu avec aperçu visuel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Aperçu RoomView */}
            <div className="bg-black/40 border border-gray-800 rounded-lg p-4">
              <h2 className="text-lg font-bold text-green-400 mb-3 flex items-center">
                <span className="bg-green-800/30 text-green-300 px-2 py-1 rounded mr-2 text-xs">1</span>
                RoomView
              </h2>
              <p className="text-gray-400 mb-4">Interface interactive permettant d'explorer les salles, d'interagir avec les objets et les personnages.</p>
              <div className="relative h-[200px] bg-gray-900/60 rounded border border-gray-700 overflow-hidden flex justify-center items-center">
                <div className="text-center p-4">
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-blue-900/30 border border-blue-700 h-16 rounded flex items-center justify-center">
                      <span className="text-blue-300 text-xs">PNJ</span>
                    </div>
                    <div className="bg-green-900/30 border border-green-700 h-16 rounded flex items-center justify-center">
                      <span className="text-green-300 text-xs">Terminal</span>
                    </div>
                    <div className="bg-yellow-900/30 border border-yellow-700 h-16 rounded flex items-center justify-center">
                      <span className="text-yellow-300 text-xs">Objet</span>
                    </div>
                  </div>
                  <span className="text-gray-500 text-sm">Interagissez avec les éléments de la salle</span>
                </div>
              </div>
            </div>
            
            {/* Aperçu PhishingChallenge */}
            <div className="bg-black/40 border border-gray-800 rounded-lg p-4">
              <h2 className="text-lg font-bold text-blue-400 mb-3 flex items-center">
                <span className="bg-blue-800/30 text-blue-300 px-2 py-1 rounded mr-2 text-xs">2</span>
                PhishingChallenge
              </h2>
              <p className="text-gray-400 mb-4">Mini-jeu de détection d'emails malveillants. Identifiez les tentatives de phishing pour progresser.</p>
              <div className="relative h-[200px] bg-gray-900/60 rounded border border-gray-700 overflow-hidden flex justify-center items-center">
                <div className="text-center p-4">
                  <div className="bg-white/90 text-gray-800 p-3 rounded-lg mb-3 text-left text-sm">
                    <div className="font-bold">De: security@companyx.net</div>
                    <div>Sujet: Vérification de compte urgente</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-red-900/30 border border-red-700 rounded p-2">
                      <span className="text-red-300 text-xs">Phishing</span>
                    </div>
                    <div className="bg-green-900/30 border border-green-700 rounded p-2">
                      <span className="text-green-300 text-xs">Légitime</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Aperçu CyberTerminal */}
            <div className="bg-black/40 border border-gray-800 rounded-lg p-4">
              <h2 className="text-lg font-bold text-green-400 mb-3 flex items-center">
                <span className="bg-green-800/30 text-green-300 px-2 py-1 rounded mr-2 text-xs">3</span>
                CyberTerminal
              </h2>
              <p className="text-gray-400 mb-4">Console affichant les messages et l'historique de vos actions dans le jeu.</p>
              <div className="relative h-[200px] bg-black/60 rounded border border-green-900 overflow-hidden">
                <div className="bg-green-900/20 p-2 border-b border-green-800">
                  <span className="text-green-400 text-xs font-mono">CYBER TERMINAL v2.1</span>
                </div>
                <div className="p-3 font-mono text-xs">
                  <div className="text-green-500">{'>'} Bienvenue dans Cyber Escape v2.0!</div>
                  <div className="text-green-500">{'>'} Vous êtes dans la Salle des Serveurs.</div>
                  <div className="text-green-500">{'>'} Examinez le terminal pour détecter les emails de phishing.</div>
                  <div className="text-green-500 flex">
                    <span className="animate-pulse mr-1">_</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Aperçu InventoryPanel */}
            <div className="bg-black/40 border border-gray-800 rounded-lg p-4">
              <h2 className="text-lg font-bold text-blue-400 mb-3 flex items-center">
                <span className="bg-blue-800/30 text-blue-300 px-2 py-1 rounded mr-2 text-xs">4</span>
                InventoryPanel
              </h2>
              <p className="text-gray-400 mb-4">Gestion des objets collectés lors de votre progression. Utilisez-les pour débloquer des passages.</p>
              <div className="relative h-[200px] bg-black/60 rounded border border-blue-900 overflow-hidden">
                <div className="bg-blue-900/20 p-2 border-b border-blue-800">
                  <span className="text-blue-400 text-xs font-mono">Inventaire</span>
                </div>
                <div className="p-3">
                  <div className="grid grid-cols-1 gap-2">
                    <div className="bg-blue-900/20 border border-blue-800 rounded p-2 flex items-center justify-between">
                      <span className="text-blue-300 text-xs">Badge de Sécurité</span>
                      <span className="bg-blue-800/60 px-2 py-0.5 rounded text-blue-200 text-xs">Utiliser</span>
                    </div>
                    <div className="bg-blue-900/20 border border-blue-800 rounded p-2 flex items-center justify-between">
                      <span className="text-blue-300 text-xs">Clé USB</span>
                      <span className="bg-blue-800/60 px-2 py-0.5 rounded text-blue-200 text-xs">Utiliser</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bouton pour lancer le jeu */}
          <div className="mt-4 text-center">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg border border-blue-500 transition-all hover:scale-105">
              🚀 Commencer l'aventure
            </button>
            <p className="text-gray-400 mt-4 text-sm">Version 2.0 - Niveau 1 en développement</p>
          </div>
        </div>
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