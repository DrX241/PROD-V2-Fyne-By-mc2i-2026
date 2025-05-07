import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Award, HelpCircle, AlertCircle, Send, Terminal, User, Shield, Zap } from 'lucide-react';
import { Link } from 'wouter';
import HomeLayout from '@/components/layout/HomeLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useGameStateV2 } from './state/game-state-v2';
import { GameStage } from './types/game-enums';

// Import des composants personnalisés
import CyberTerminal from './components/CyberTerminal';
import InventoryPanel from './components/InventoryPanel';
import CountdownTimer from './components/CountdownTimer';
import StageProgress from './components/StageProgress';
import RoomView from './components/RoomView';
import QuickActions from './components/QuickActions';
import PhishingChallenge from './components/PhishingChallenge';

// Animation de particules pour l'arrière-plan
const ParticleBackground = () => (
  <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
    {Array.from({ length: 30 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 rounded-full bg-green-500/20"
        initial={{
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          opacity: Math.random() * 0.5 + 0.1,
          scale: Math.random() * 0.5 + 0.5,
        }}
        animate={{
          top: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
          left: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
          opacity: [Math.random() * 0.5 + 0.1, Math.random() * 0.5 + 0.1],
        }}
        transition={{
          duration: Math.random() * 20 + 30,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />
    ))}
  </div>
);

const CyberEscapeV2 = () => {
  // État du jeu géré par un custom hook
  const { 
    gameState,
    startGame,
    executeCommand,
    formatMessage,
    modifyTime,
    completeChallenge
  } = useGameStateV2();
  
  // Référence pour stocker les étapes déjà notifiées
  const notifiedStagesRef = useRef<number[]>([]);
  
  const [commandInput, setCommandInput] = useState('');
  const { toast } = useToast();
  
  // Effet pour afficher une notification pour chaque nouvelle étape
  useEffect(() => {
    if (currentStage > 0 && gameState.currentRoom && !notifiedStagesRef.current.includes(currentStage)) {
      const roomName = gameState.currentRoom.name;
      toast({
        title: `Étape ${currentStage} déverrouillée !`,
        description: roomName,
        variant: "default",
      });
      // Marquer cette étape comme notifiée
      notifiedStagesRef.current.push(currentStage);
    }
  }, [currentStage, toast, gameState.currentRoom]);

  // Gestion de l'entrée de commande
  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commandInput.trim()) {
      executeCommand(commandInput);
      setCommandInput('');
    }
  };

  // Formater le temps pour l'affichage
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Fonction pour gérer l'utilisation d'un objet depuis le panneau d'inventaire
  const handleUseItem = (itemId: string) => {
    executeCommand(`utiliser ${itemId}`);
  };

  // Fonction pour effacer le terminal
  const handleClearTerminal = () => {
    // Note: Fonctionnalité à implémenter dans useGameState si nécessaire
    toast({
      title: "Terminal effacé",
      description: "L'historique du terminal a été effacé",
      variant: "default",
    });
  };

  // Aide sémantique pour décider quand afficher un effet cyberpunk
  const showCyberpunkEffect = gameState.status === 'running' && currentStage >= 5;

  // Rendu conditionnel basé sur l'état du jeu
  return (
    <HomeLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-blue-900 text-white relative overflow-hidden">
        {/* Arrière-plan avec effet de particules */}
        <ParticleBackground />
        
        {/* Effet de grille cyber (sur étapes avancées) */}
        {showCyberpunkEffect && (
          <div 
            className="absolute inset-0 z-0 pointer-events-none"
            style={{
              backgroundImage: "linear-gradient(rgba(0, 255, 0, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 0, 0.03) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
              backgroundPosition: "center center",
            }}
          />
        )}
        
        <div className="relative z-10 container mx-auto max-w-6xl p-4 sm:p-6">
          {/* En-tête avec navigation et titre du jeu */}
          <header className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center">
              <Link href="/cyber/arcade">
                <Button variant="ghost" className="text-white hover:bg-blue-800/20 mr-4">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Retour
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold flex items-center">
                  <Shield className="h-6 w-6 mr-2 text-green-400" />
                  CYBER ESCAPE
                  <span className="text-green-400 ml-2 font-mono">v2.0</span>
                </h1>
                {gameState.status === 'running' && (
                  <p className="text-sm text-gray-400 mt-1">
                    Mission: Infiltrer et sécuriser tous les niveaux du système
                  </p>
                )}
              </div>
            </div>
            
            {/* Affichage du temps restant avec composant dédié */}
            {gameState.status === 'running' && (
              <div className="min-w-[180px]">
                <CountdownTimer
                  seconds={timeRemaining}
                  totalSeconds={900}
                />
              </div>
            )}
          </header>

          {/* Interface principale du jeu */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
            {/* Panneau principal - occupe 3 colonnes sur desktop */}
            <div className="lg:col-span-3 space-y-4">
              {gameState.status === 'initial' ? (
                /* Écran d'introduction */
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="border-green-500 bg-black/60 backdrop-blur-sm overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 to-blue-900/20 z-0"></div>
                    
                    <CardHeader className="relative z-10">
                      <div className="flex items-center mb-2">
                        <div className="bg-green-800/50 p-2 rounded-full mr-3">
                          <Shield className="h-6 w-6 text-green-400" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl text-green-400">
                            Mission: CYBER ESCAPE
                          </CardTitle>
                          <CardDescription className="text-green-300">
                            Infiltrez le système en 15 minutes et déverrouillez la Porte Sigma
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-6 relative z-10">
                      {/* Description animée avec effet de frappe */}
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className="text-gray-300 leading-relaxed"
                      >
                        En tant qu'expert en cybersécurité, vous disposez de <strong className="text-green-400">15 minutes (900 secondes)</strong> pour 
                        traverser 10 étapes liées aux grands piliers de la cybersécurité moderne. 
                        À chaque étape réussie, vous obtiendrez un <strong className="text-green-400">Jeton-Clé</strong> qui vous permettra 
                        de progresser vers la prochaine salle.
                      </motion.p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Instructions */}
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5, duration: 0.5 }}
                          className="bg-black/30 p-4 rounded-md border border-green-800 h-full"
                        >
                          <h3 className="text-lg font-semibold text-green-400 flex items-center mb-3">
                            <Terminal className="h-5 w-5 mr-2" />
                            Commandes disponibles
                          </h3>
                          <ul className="space-y-1.5 font-mono text-sm text-gray-300">
                            <li className="flex"><code className="text-green-400 min-w-24">aller &lt;direction&gt;</code> <span>- Se déplacer N/S/E/O</span></li>
                            <li className="flex"><code className="text-green-400 min-w-24">regarder</code> <span>- Observer la salle actuelle</span></li>
                            <li className="flex"><code className="text-green-400 min-w-24">parler &lt;pnj&gt;</code> <span>- Dialoguer avec un personnage</span></li>
                            <li className="flex"><code className="text-green-400 min-w-24">utiliser &lt;objet&gt;</code> <span>- Employer un item de l'inventaire</span></li>
                            <li className="flex"><code className="text-green-400 min-w-24">déverrouiller</code> <span>- Ouvrir une porte verrouillée</span></li>
                            <li className="flex"><code className="text-green-400 min-w-24">answer &lt;A/B/C/D&gt;</code> <span>- Répondre à un QCM</span></li>
                            <li className="flex"><code className="text-green-400 min-w-24">inventaire</code> <span>- Afficher vos items</span></li>
                          </ul>
                        </motion.div>
                        
                        {/* Challenge details */}
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.7, duration: 0.5 }}
                          className="bg-black/30 p-4 rounded-md border border-green-800 h-full"
                        >
                          <h3 className="text-lg font-semibold text-green-400 flex items-center mb-3">
                            <Zap className="h-5 w-5 mr-2" />
                            Déroulement du jeu
                          </h3>
                          <ul className="space-y-2 text-sm text-gray-300">
                            <li className="flex items-start">
                              <div className="bg-green-900/40 rounded-full p-1 mr-2 mt-0.5">
                                <span className="block h-1.5 w-1.5 rounded-full bg-green-400"></span>
                              </div>
                              <span>Chaque étape propose un défi lié à un aspect de la cybersécurité</span>
                            </li>
                            <li className="flex items-start">
                              <div className="bg-green-900/40 rounded-full p-1 mr-2 mt-0.5">
                                <span className="block h-1.5 w-1.5 rounded-full bg-green-400"></span>
                              </div>
                              <span>Réussir vous fait gagner du temps, échouer vous en fait perdre</span>
                            </li>
                            <li className="flex items-start">
                              <div className="bg-green-900/40 rounded-full p-1 mr-2 mt-0.5">
                                <span className="block h-1.5 w-1.5 rounded-full bg-green-400"></span>
                              </div>
                              <span>Collectez les 10 Jetons-Clés et atteignez la Porte Sigma avant la fin du temps</span>
                            </li>
                            <li className="flex items-start">
                              <div className="bg-green-900/40 rounded-full p-1 mr-2 mt-0.5">
                                <span className="block h-1.5 w-1.5 rounded-full bg-green-400"></span>
                              </div>
                              <span>Gagnez une médaille (or/argent/bronze) selon votre performance</span>
                            </li>
                          </ul>
                        </motion.div>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="relative z-10">
                      <Button 
                        className="w-full bg-green-600 hover:bg-green-700 text-white group relative overflow-hidden"
                        onClick={startGame}
                      >
                        <span className="relative z-10 flex items-center">
                          <Shield className="mr-2 h-5 w-5 group-hover:animate-pulse" />
                          Commencer la mission
                        </span>
                        <motion.div 
                          className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-600"
                          initial={{ x: '-100%' }}
                          whileHover={{ x: '100%' }}
                          transition={{ duration: 1 }}
                        />
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ) : gameState.status === 'running' ? (
                /* Interface de jeu principale */
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  {/* Terminal interactif */}
                  <CyberTerminal
                    messages={gameState.messages}
                    formatMessage={formatMessage}
                    roomName={gameState.currentRoom?.name}
                    onClear={handleClearTerminal}
                    className="h-[40vh] md:h-[50vh]"
                  />

                  {/* Formulaire de saisie de commande */}
                  <form onSubmit={handleCommandSubmit} className="flex space-x-2">
                    <div className="relative flex-grow">
                      <span className="absolute left-3 top-2.5 text-green-500 font-mono">$</span>
                      <Input
                        type="text"
                        value={commandInput}
                        onChange={(e) => setCommandInput(e.target.value)}
                        className="pl-8 bg-gray-800 border-green-500 text-green-400 font-mono focus:ring-green-500"
                        placeholder="Entrez une commande..."
                        autoFocus
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="bg-green-600 hover:bg-green-700 min-w-[120px]"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Exécuter
                    </Button>
                  </form>
                </motion.div>
              ) : gameState.status === 'completed' ? (
                /* Écran de fin de jeu */
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="border-green-500 bg-black/60 backdrop-blur-sm overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-900/50 via-black/50 to-blue-900/30 z-0"></div>
                    
                    <CardHeader className="relative z-10">
                      <CardTitle className="text-center text-3xl flex items-center justify-center">
                        <Award className={`h-8 w-8 mr-3 ${gameState.success ? 'text-green-400' : 'text-red-400'}`} />
                        <span className={gameState.success ? 'text-green-400' : 'text-red-400'}>
                          Mission {gameState.success ? 'Réussie' : 'Échouée'}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent className="relative z-10">
                      {gameState.success ? (
                        <div className="flex flex-col items-center mb-6">
                          {/* Animation de médaille */}
                          <motion.div
                            initial={{ y: -50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ 
                              type: "spring", 
                              stiffness: 300, 
                              damping: 20,
                              delay: 0.3 
                            }}
                            className="relative mb-6"
                          >
                            <div className={`
                              p-8 rounded-full 
                              ${gameState.medal === 'or' ? 'bg-yellow-900/40 border-yellow-500' : 
                                gameState.medal === 'argent' ? 'bg-gray-700/40 border-gray-400' : 
                                'bg-amber-800/40 border-amber-600'}
                              border-2 shadow-lg relative
                            `}>
                              <Shield className={`h-20 w-20 
                                ${gameState.medal === 'or' ? 'text-yellow-400' : 
                                  gameState.medal === 'argent' ? 'text-gray-300' : 
                                  'text-amber-500'}
                              `} />
                              
                              {/* Effet de rayonnement autour de la médaille */}
                              <motion.div 
                                className="absolute inset-0 rounded-full"
                                initial={{ opacity: 0.3 }}
                                animate={{ 
                                  opacity: [0.4, 0.6, 0.4],
                                  scale: [1, 1.05, 1],
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  repeatType: "reverse"
                                }}
                                style={{
                                  background: gameState.medal === 'or' 
                                    ? 'radial-gradient(circle, rgba(234,179,8,0.3) 0%, transparent 70%)' 
                                    : gameState.medal === 'argent'
                                    ? 'radial-gradient(circle, rgba(209,213,219,0.3) 0%, transparent 70%)'
                                    : 'radial-gradient(circle, rgba(217,119,6,0.3) 0%, transparent 70%)'
                                }}
                              />
                            </div>
                            
                            <h3 className="text-2xl font-bold text-center mt-3">
                              Médaille 
                              <span className={`
                                ${gameState.medal === 'or' ? 'text-yellow-400' : 
                                  gameState.medal === 'argent' ? 'text-gray-300' : 
                                  'text-amber-500'} ml-2
                              `}>
                                {gameState.medal.toUpperCase()}
                              </span>
                            </h3>
                            
                            <p className="text-gray-300 mt-2 text-center">
                              Temps restant: {formatTime(timeRemaining)} • Score QCM: {gameState.quizScore}/8
                            </p>
                          </motion.div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center mb-6">
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="p-8 bg-red-900/20 border border-red-800 rounded-full mb-4"
                          >
                            <AlertCircle className="h-20 w-20 text-red-400" />
                          </motion.div>
                          <h3 className="text-2xl font-bold text-red-400 text-center">Mission échouée</h3>
                          <p className="text-gray-300 mt-2 text-center">
                            Raison: {gameState.failReason || "Temps écoulé"}
                          </p>
                        </div>
                      )}
                      
                      {/* Résumé de mission */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        className="mt-4 p-6 bg-black/30 rounded-md border border-green-800"
                      >
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                          <Terminal className="h-5 w-5 mr-2 text-green-400" />
                          Rapport de mission
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <h4 className="text-sm font-medium text-green-400">Statistiques</h4>
                            <ul className="space-y-2 text-gray-300">
                              <li className="flex justify-between">
                                <span>Étapes complétées:</span> 
                                <span className="font-mono">{currentStage}/10</span>
                              </li>
                              <li className="flex justify-between">
                                <span>Temps total:</span> 
                                <span className="font-mono">{formatTime(900 - timeRemaining)}</span>
                              </li>
                              <li className="flex justify-between">
                                <span>Items collectés:</span>
                                <span className="font-mono">{Object.keys(inventory).length - 2}</span>
                              </li>
                            </ul>
                          </div>
                          
                          <div className="space-y-3">
                            <h4 className="text-sm font-medium text-green-400">Évaluation</h4>
                            <div className="space-y-2 text-gray-300">
                              <div className="flex justify-between">
                                <span>Gestion du temps:</span>
                                <span className={timeRemaining > 300 ? 'text-green-400' : timeRemaining > 100 ? 'text-yellow-400' : 'text-red-400'}>
                                  {timeRemaining > 300 ? 'Excellente' : timeRemaining > 100 ? 'Bonne' : 'À améliorer'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Connaissances:</span>
                                <span className={gameState.quizScore >= 7 ? 'text-green-400' : gameState.quizScore >= 5 ? 'text-yellow-400' : 'text-red-400'}>
                                  {gameState.quizScore >= 7 ? 'Excellentes' : gameState.quizScore >= 5 ? 'Bonnes' : 'À approfondir'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </CardContent>
                    
                    <CardFooter className="flex justify-center relative z-10 pt-6">
                      <Button 
                        onClick={startGame}
                        className="mr-2 bg-green-600 hover:bg-green-700"
                      >
                        Rejouer
                      </Button>
                      <Link href="/cyber/arcade">
                        <Button variant="outline" className="border-green-500 text-green-400 hover:bg-green-900/20">
                          Retour à l'arcade
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                </motion.div>
              ) : (
                /* Écran d'erreur au cas où */
                <Card className="border-red-500 bg-black/50">
                  <CardHeader>
                    <CardTitle className="text-red-500">Erreur système</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Une erreur est survenue dans le système. Veuillez réessayer.</p>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      onClick={startGame}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Redémarrer
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </div>

            {/* Panneau latéral - occupe 1 colonne sur desktop */}
            <div className="space-y-4">
              {gameState.status === 'running' && (
                <>
                  {/* Progression du jeu avec composant dédié */}
                  <StageProgress currentStage={currentStage} />

                  {/* Inventaire avec composant dédié */}
                  <InventoryPanel 
                    items={inventory} 
                    onUseItem={handleUseItem}
                  />

                  {/* Aide rapide */}
                  <Card className="border-green-500 bg-black/50 backdrop-blur-sm">
                    <CardHeader className="p-3 pb-2 border-b border-green-800">
                      <CardTitle className="text-sm text-green-400 flex items-center">
                        <HelpCircle className="h-4 w-4 mr-2" /> Aide
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3">
                      <Tabs defaultValue="commands">
                        <TabsList className="bg-gray-800 text-green-300 w-full">
                          <TabsTrigger value="commands" className="flex-1">Commandes</TabsTrigger>
                          <TabsTrigger value="tips" className="flex-1">Astuces</TabsTrigger>
                        </TabsList>
                        <TabsContent value="commands" className="p-2 text-xs text-gray-300">
                          <ul className="space-y-1">
                            <li><span className="text-green-400">aller</span> - Pour se déplacer</li>
                            <li><span className="text-green-400">regarder</span> - Observer</li>
                            <li><span className="text-green-400">parler</span> - Dialoguer</li>
                            <li><span className="text-green-400">utiliser</span> - Employer item</li>
                            <li><span className="text-green-400">déverrouiller</span> - Ouvrir</li>
                            <li><span className="text-green-400">answer</span> - Répondre QCM</li>
                            <li><span className="text-green-400">inventaire</span> - Voir items</li>
                          </ul>
                        </TabsContent>
                        <TabsContent value="tips" className="p-2 text-xs text-gray-300">
                          <ul className="space-y-1">
                            <li>• Examinez bien chaque salle</li>
                            <li>• Utilisez les objets au bon moment</li>
                            <li>• Parlez aux PNJ pour obtenir des indices</li>
                            <li>• Attention au temps: certaines actions en ajoutent, d'autres en retirent</li>
                          </ul>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
};

export default CyberEscapeV2;