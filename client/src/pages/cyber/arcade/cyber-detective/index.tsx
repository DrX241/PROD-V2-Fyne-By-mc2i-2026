import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, Shield, Lightbulb, HelpCircle, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import HomeLayout from '@/components/layout/HomeLayout';
import PageTitle from '@/components/utils/PageTitle';
import { CyberDetectiveGame } from './game';

export default function CyberDetectivePage() {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentScene, setCurrentScene] = useState<string>('office');
  const [inventory, setInventory] = useState<Array<{id: string, name: string, description: string, icon: React.ReactNode}>>([]);
  const [progress, setProgress] = useState<number>(0);
  const [cluesFound, setCluesFound] = useState<number>(0);
  const [totalClues, setTotalClues] = useState<number>(10); // Nombre total d'indices à trouver
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [gameCompleted, setGameCompleted] = useState<boolean>(false);
  const [dialogVisible, setDialogVisible] = useState<boolean>(false);
  const [currentDialog, setCurrentDialog] = useState<{
    title: string;
    content: string;
    image?: string;
  }>({ title: '', content: '' });

  // Fonction pour ajouter un élément à l'inventaire
  const addToInventory = (item: {id: string, name: string, description: string, icon: React.ReactNode}) => {
    if (!inventory.some(i => i.id === item.id)) {
      setInventory(prev => [...prev, item]);
      
      // Mise à jour du progrès
      const newCluesFound = cluesFound + 1;
      setCluesFound(newCluesFound);
      setProgress((newCluesFound / totalClues) * 100);
      
      // Afficher un dialogue pour l'élément trouvé
      setCurrentDialog({
        title: `Vous avez trouvé : ${item.name}`,
        content: item.description
      });
      setDialogVisible(true);
      
      // Vérifier si le jeu est terminé
      if (newCluesFound >= totalClues) {
        setTimeout(() => {
          setGameCompleted(true);
        }, 1000);
      }
    }
  };

  // Fonction pour changer de scène
  const changeScene = (sceneName: string) => {
    setCurrentScene(sceneName);
  };

  // Gestionnaire pour démarrer le jeu
  const handleStartGame = () => {
    setGameStarted(true);
  };

  // Gestionnaire pour recommencer le jeu
  const handleRestartGame = () => {
    setGameStarted(false);
    setInventory([]);
    setCluesFound(0);
    setProgress(0);
    setCurrentScene('office');
    setGameCompleted(false);
  };

  return (
    <HomeLayout>
      <PageTitle title="Cyber Detective" />
      <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-emerald-900 via-gray-900 to-black relative overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
          <Link href="/cyber/arcade" className="inline-flex items-center text-emerald-200 hover:text-white mb-4 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à Cyber Arcade
          </Link>
          
          {!gameStarted ? (
            <div className="max-w-4xl mx-auto">
              {/* Écran d'introduction du jeu */}
              <div className="bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center">
                    <Search className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">Cyber Detective</h1>
                    <p className="text-emerald-200">Enquêtez sur une violation de données en mode point & click</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-3">Mission</h2>
                    <p className="text-gray-300">
                      En tant que Cyber Detective, vous êtes appelé(e) à enquêter sur une violation de données qui a eu lieu chez 
                      TechSecure, une entreprise spécialisée en solutions informatiques. L'incident a été détecté ce matin et il y 
                      a des indices d'une intrusion sophistiquée. Explorez l'environnement, collectez des indices et résolvez cette affaire !
                    </p>
                  </div>
                  
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-3">Comment jouer</h2>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex">
                        <div className="text-emerald-400 mr-2">•</div>
                        <span>Explorez les différentes scènes en cliquant sur les zones de navigation</span>
                      </li>
                      <li className="flex">
                        <div className="text-emerald-400 mr-2">•</div>
                        <span>Interagissez avec les objets en cliquant dessus pour obtenir des indices</span>
                      </li>
                      <li className="flex">
                        <div className="text-emerald-400 mr-2">•</div>
                        <span>Collectez des preuves et des artefacts numériques dans votre inventaire</span>
                      </li>
                      <li className="flex">
                        <div className="text-emerald-400 mr-2">•</div>
                        <span>Utilisez les éléments collectés pour débloquer de nouvelles zones</span>
                      </li>
                      <li className="flex">
                        <div className="text-emerald-400 mr-2">•</div>
                        <span>Résolvez des énigmes basées sur des concepts réels de cybersécurité</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-3">Objectif</h2>
                    <p className="text-gray-300">
                      Trouvez tous les indices (10 au total) disséminés dans l'environnement pour découvrir comment la violation 
                      s'est produite, qui en est responsable, et quelles données ont été compromises.
                    </p>
                  </div>
                  
                  <div className="flex justify-center pt-4">
                    <Button 
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-2 text-lg"
                      onClick={handleStartGame}
                    >
                      Commencer l'enquête
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-[calc(100vh-140px)]">
              {/* Interface de jeu */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-2">
                  <Badge variant="outline" className="bg-emerald-900/50 text-emerald-100 border-emerald-500">
                    Scène : {currentScene.charAt(0).toUpperCase() + currentScene.slice(1)}
                  </Badge>
                  <Badge variant="outline" className="bg-emerald-900/50 text-emerald-100 border-emerald-500">
                    Indices : {cluesFound}/{totalClues}
                  </Badge>
                </div>
                
                <div className="flex gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-full border-emerald-500 text-emerald-100"
                          onClick={() => setShowHelp(true)}
                        >
                          <HelpCircle className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Aide</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4">
                {/* Zone de jeu principale (Phaser) */}
                <div className="lg:col-span-3 bg-black rounded-xl overflow-hidden relative min-h-[400px]">
                  <CyberDetectiveGame 
                    currentScene={currentScene}
                    addToInventory={addToInventory}
                    changeScene={changeScene}
                    inventory={inventory}
                  />
                </div>
                
                {/* Panneau latéral avec inventaire */}
                <div className="lg:col-span-1 bg-gray-800/70 backdrop-blur-sm rounded-xl p-4 flex flex-col">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                    <Briefcase className="mr-2 h-5 w-5 text-emerald-400" />
                    Inventaire
                  </h3>
                  
                  <div className="flex-1 overflow-auto">
                    {inventory.length > 0 ? (
                      <div className="space-y-2">
                        {inventory.map(item => (
                          <div 
                            key={item.id}
                            className="bg-gray-700 p-2 rounded-lg flex items-center border border-gray-600 hover:border-emerald-500 cursor-pointer transition-colors"
                            onClick={() => {
                              setCurrentDialog({
                                title: item.name,
                                content: item.description
                              });
                              setDialogVisible(true);
                            }}
                          >
                            <div className="mr-3 h-8 w-8 flex items-center justify-center bg-emerald-900/50 rounded-md text-emerald-400">
                              {item.icon}
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-white">{item.name}</h4>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-gray-400 h-full flex flex-col items-center justify-center">
                        <Search className="h-6 w-6 mb-2 text-gray-500" />
                        <p>Aucun indice collecté</p>
                        <p className="text-xs">Explorez l'environnement pour trouver des indices</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-white mb-1 flex items-center">
                      <Lightbulb className="mr-1 h-4 w-4 text-emerald-400" />
                      Progression
                    </h3>
                    <Progress value={progress} className="h-2" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Dialogue pour afficher les informations sur les indices trouvés */}
      <Dialog open={dialogVisible} onOpenChange={setDialogVisible}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl">{currentDialog.title}</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-gray-300">{currentDialog.content}</p>
            {currentDialog.image && (
              <div className="mt-4 flex justify-center">
                <img 
                  src={currentDialog.image} 
                  alt="Indice" 
                  className="max-h-60 rounded-md border border-gray-600"
                />
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setDialogVisible(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialogue d'aide */}
      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center">
              <HelpCircle className="w-5 h-5 text-emerald-400 mr-2" />
              Aide de jeu
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              Comment jouer à Cyber Detective
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="font-medium text-white">Navigation</h3>
                <p className="text-sm">Cliquez sur les zones de transition (portes, flèches) pour vous déplacer entre les différentes scènes.</p>
              </div>
              
              <div>
                <h3 className="font-medium text-white">Interaction</h3>
                <p className="text-sm">Cliquez sur les objets interactifs pour les examiner et éventuellement les ajouter à votre inventaire.</p>
              </div>
              
              <div>
                <h3 className="font-medium text-white">Inventaire</h3>
                <p className="text-sm">Les objets collectés apparaissent dans votre inventaire. Cliquez sur un objet de l'inventaire pour revoir ses détails.</p>
              </div>
              
              <div>
                <h3 className="font-medium text-white">Objectif</h3>
                <p className="text-sm">Trouvez les 10 indices disséminés dans l'environnement pour résoudre l'enquête sur la violation de données.</p>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setShowHelp(false)}>
              J'ai compris
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialogue de fin de jeu */}
      <Dialog open={gameCompleted} onOpenChange={setGameCompleted}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center">
              <Shield className="w-6 h-6 text-emerald-400 mr-2" />
              Félicitations, enquête résolue !
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              Vous avez résolu l'enquête sur la violation de données chez TechSecure.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="bg-gray-700/50 rounded-lg p-4">
              <h3 className="font-bold text-xl text-emerald-400 mb-2">Rapport d'enquête</h3>
              
              <div className="space-y-4 text-gray-300">
                <p>
                  Grâce à votre perspicacité, vous avez découvert que la violation de données chez TechSecure était une 
                  attaque sophistiquée impliquant plusieurs vecteurs :
                </p>
                
                <ul className="list-disc list-inside space-y-1 pl-2">
                  <li>Une attaque initiale par phishing ciblant un responsable technique</li>
                  <li>L'exploitation d'une vulnérabilité zero-day dans le système de gestion des accès</li>
                  <li>L'utilisation de techniques d'élévation de privilèges pour accéder aux données sensibles</li>
                  <li>L'exfiltration des données clients et des propriétés intellectuelles</li>
                </ul>
                
                <p>
                  Vos recommandations pour prévenir de futures violations incluent le renforcement de l'authentification 
                  multifacteur, la formation du personnel sur les risques de phishing, et la mise à jour urgente des 
                  systèmes critiques.
                </p>
              </div>
            </div>
            
            <div className="mt-6 space-y-2 text-sm text-gray-300">
              <p><span className="font-medium text-emerald-300">Ce que vous avez appris :</span></p>
              <ul className="list-disc list-inside space-y-1 pl-4">
                <li>Comment les attaquants exploitent les vulnérabilités humaines et techniques</li>
                <li>L'importance d'une analyse forensique méthodique lors d'un incident</li>
                <li>Les méthodes d'exfiltration de données et comment les identifier</li>
                <li>Les mesures préventives essentielles pour protéger les données sensibles</li>
              </ul>
            </div>
          </div>
          
          <DialogFooter>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:justify-between">
              <Button variant="outline" onClick={handleRestartGame}>
                Rejouer l'enquête
              </Button>
              <Link href="/cyber/arcade">
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  Retour à Cyber Arcade
                </Button>
              </Link>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </HomeLayout>
  );
}