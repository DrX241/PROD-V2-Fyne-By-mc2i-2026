import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Clock, Shield, Award, HelpCircle, AlertCircle, Send, Terminal, User } from 'lucide-react';
import { Link } from 'wouter';
import MainLayout from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useGameState } from './state/game-state';
import { GameStage } from './types/game';

// Définition du style pour obtenir un effet de terminal qui se veut plus réaliste
// Utilisation de CSS-in-JS pour des effets spécifiques en complément de Tailwind
const StyledTerminal = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`font-mono text-green-500 bg-gray-900 border border-green-500 p-4 rounded-md overflow-y-auto h-[40vh] relative ${className}`}
    style={{
      boxShadow: '0 0 10px rgba(0, 255, 0, 0.2), inset 0 0 20px rgba(0, 0, 0, 0.5)',
      backgroundImage: 'radial-gradient(rgba(0, 30, 0, 0.3) 10%, transparent 10%), radial-gradient(rgba(0, 30, 0, 0.3) 10%, transparent 10%)',
      backgroundSize: '4px 4px',
      backgroundPosition: '0 0, 2px 2px',
    }}
    {...props}
  />
));
StyledTerminal.displayName = 'StyledTerminal';

const CyberEscapeV2 = () => {
  // État du jeu géré par un custom hook
  const { 
    gameState,
    timeRemaining,
    currentStage,
    inventory,
    startGame,
    executeCommand,
    formatMessage
  } = useGameState();
  
  const [commandInput, setCommandInput] = useState('');
  const terminalRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Effet pour faire défiler le terminal vers le bas à chaque mise à jour
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [gameState.messages]);

  // Effet pour afficher une notification pour chaque nouvelle étape
  useEffect(() => {
    if (currentStage > 0) {
      toast({
        title: `Étape ${currentStage} déverrouillée !`,
        description: gameState.currentRoom?.name || "Nouvelle étape",
        variant: "default",
      });
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

  // Affichage du temps restant formaté
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Fonction pour initialiser une nouvelle partie
  const handleStartGame = () => {
    startGame();
  };

  // Rendu conditionnel basé sur l'état du jeu
  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-blue-900 text-white p-4">
        <div className="container mx-auto max-w-6xl">
          {/* En-tête avec navigation et titre du jeu */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/cyber/arcade">
                <Button variant="ghost" className="text-white hover:bg-blue-800/20 mr-4">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Retour
                </Button>
              </Link>
              <h1 className="text-2xl sm:text-3xl font-bold">CYBER ESCAPE v2.0</h1>
            </div>
            
            {/* Affichage du temps restant avec effet visuel */}
            <div className="flex items-center">
              <Clock className="mr-2 h-5 w-5 text-green-400" />
              <motion.div
                key={timeRemaining}
                initial={{ scale: 1 }}
                animate={{ 
                  scale: timeRemaining < 60 ? [1, 1.1, 1] : 1,
                  color: timeRemaining < 60 ? "#ef4444" : "#22c55e"
                }}
                transition={{ duration: 0.3 }}
                className="text-xl font-mono font-bold"
              >
                {formatTime(timeRemaining)}
              </motion.div>
            </div>
          </div>

          {/* Interface principale du jeu */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Panneau principal - occupe 3 colonnes sur desktop */}
            <div className="lg:col-span-3 space-y-4">
              {gameState.status === 'initial' ? (
                /* Écran d'introduction */
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="border-green-500 bg-black/50 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-2xl text-green-400">Mission: CYBER ESCAPE</CardTitle>
                      <CardDescription className="text-green-300">
                        Infiltrez le système en 15 minutes et déverrouillez la Porte Sigma
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-gray-300">
                        Vous êtes un expert en cybersécurité disposant de 15 minutes pour traverser 10 étapes
                        de défis liés aux grands piliers de la cybersécurité. Chaque étape vous attribuera un
                        <span className="text-green-400 font-bold"> Jeton-Clé</span> si vous réussissez.
                      </p>
                      
                      <div className="mt-4 bg-black/30 p-4 rounded-md border border-green-800">
                        <h3 className="text-lg font-semibold text-green-400 mb-2">Commandes disponibles:</h3>
                        <ul className="space-y-1 font-mono text-sm text-gray-300">
                          <li className="flex"><code className="text-green-400 min-w-24">aller &lt;direction&gt;</code> <span>- Se déplacer N/S/E/O</span></li>
                          <li className="flex"><code className="text-green-400 min-w-24">regarder</code> <span>- Observer la salle actuelle</span></li>
                          <li className="flex"><code className="text-green-400 min-w-24">parler &lt;pnj&gt;</code> <span>- Dialoguer avec un personnage</span></li>
                          <li className="flex"><code className="text-green-400 min-w-24">utiliser &lt;objet&gt;</code> <span>- Employer un item de l'inventaire</span></li>
                          <li className="flex"><code className="text-green-400 min-w-24">déverrouiller</code> <span>- Ouvrir une porte verrouillée</span></li>
                          <li className="flex"><code className="text-green-400 min-w-24">answer &lt;A/B/C/D&gt;</code> <span>- Répondre à un QCM</span></li>
                          <li className="flex"><code className="text-green-400 min-w-24">inventaire</code> <span>- Afficher vos items</span></li>
                        </ul>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                        onClick={handleStartGame}
                      >
                        Commencer la mission
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
                  <StyledTerminal ref={terminalRef}>
                    <div className="flex items-center justify-between mb-2 pb-2 border-b border-green-800">
                      <div className="flex items-center">
                        <Terminal className="h-4 w-4 mr-2" />
                        <span className="text-xs font-bold">Terminal sécurisé v2.0</span>
                      </div>
                      <div>
                        <Badge variant="outline" className="text-xs border-green-500 text-green-400">
                          {gameState.currentRoom?.name || "Initialisation..."}
                        </Badge>
                      </div>
                    </div>
                    <AnimatePresence>
                      {gameState.messages.map((msg, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          className="mb-2"
                          dangerouslySetInnerHTML={{ __html: formatMessage(msg) }}
                        />
                      ))}
                    </AnimatePresence>
                  </StyledTerminal>

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
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="bg-green-600 hover:bg-green-700"
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
                  <Card className="border-green-500 bg-black/50 backdrop-blur-sm overflow-hidden">
                    <div className="absolute inset-0 bg-green-500/10 z-0"></div>
                    <CardHeader className="relative z-10">
                      <CardTitle className="text-center text-3xl text-green-400 flex items-center justify-center">
                        <Award className="h-8 w-8 mr-3" />
                        Mission {gameState.success ? 'Réussie' : 'Échouée'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10 text-center">
                      {gameState.success ? (
                        <>
                          <div className="mb-4">
                            <div className="inline-block p-6 bg-green-900/40 rounded-full mb-4">
                              <Shield className="h-16 w-16 text-green-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Médaille obtenue: {gameState.medal}</h3>
                            <p className="text-gray-300 mt-2">
                              Temps restant: {formatTime(timeRemaining)} • Score QCM: {gameState.quizScore}/8
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="mb-4">
                            <div className="inline-block p-6 bg-red-900/40 rounded-full mb-4">
                              <AlertCircle className="h-16 w-16 text-red-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Mission échouée</h3>
                            <p className="text-gray-300 mt-2">
                              Raison: {gameState.failReason || "Temps écoulé"}
                            </p>
                          </div>
                        </>
                      )}
                      
                      <div className="mt-8 p-4 bg-black/30 rounded-md border border-green-800 text-left">
                        <h3 className="text-lg font-bold text-white mb-2">Résumé de la mission:</h3>
                        <ul className="space-y-1 text-gray-300">
                          <li>• Étapes complétées: {currentStage}/10</li>
                          <li>• Temps total: {formatTime(900 - timeRemaining)}</li>
                          <li>• Items collectés: {Object.keys(inventory).length - 2}</li>
                          {/* Ajoutez d'autres statistiques ici */}
                        </ul>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-center relative z-10">
                      <Button 
                        onClick={handleStartGame}
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
                      onClick={handleStartGame}
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
                  {/* Progression du jeu */}
                  <Card className="border-green-500 bg-black/50 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-green-400 flex items-center">
                        <Shield className="h-4 w-4 mr-2" /> Progression
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-2">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>Étape {currentStage}/10</span>
                          <span>{Math.round((currentStage / 10) * 100)}%</span>
                        </div>
                        <Progress
                          value={(currentStage / 10) * 100}
                          className="h-2 bg-gray-800"
                          indicatorClassName="bg-gradient-to-r from-green-500 to-blue-500"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Inventaire */}
                  <Card className="border-green-500 bg-black/50 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-green-400">Inventaire</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.keys(inventory).length > 0 ? (
                          Object.entries(inventory).map(([id, item]) => (
                            <TooltipProvider key={id}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div 
                                    className="p-2 bg-gray-800 rounded border border-green-800 text-center cursor-help"
                                  >
                                    <div className="text-green-400 text-xs font-semibold truncate">
                                      {item.name}
                                    </div>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent className="bg-black border-green-600 p-3 max-w-xs">
                                  <p className="font-bold text-green-400">{item.name}</p>
                                  <p className="text-xs text-gray-300 mt-1">{item.description}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ))
                        ) : (
                          <div className="col-span-2 text-center text-gray-400 text-sm">
                            Inventaire vide
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Aide rapide */}
                  <Card className="border-green-500 bg-black/50 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-green-400 flex items-center">
                        <HelpCircle className="h-4 w-4 mr-2" /> Aide
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="commands">
                        <TabsList className="bg-gray-800 text-green-300">
                          <TabsTrigger value="commands">Commandes</TabsTrigger>
                          <TabsTrigger value="tips">Astuces</TabsTrigger>
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
    </MainLayout>
  );
};

export default CyberEscapeV2;