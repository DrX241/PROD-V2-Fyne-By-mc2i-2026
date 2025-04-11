import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { MenuScene } from './scenes/MenuScene';
import { GameScene } from './scenes/GameScene';
import { UIScene } from './scenes/UIScene';
import { GameOverScene } from './scenes/GameOverScene';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Database, Shield, Cpu, Radio, Lock, Radar, 
  ChevronLeft, Play, RefreshCw, BarChart3, Activity,
  AlertTriangle, Zap, Heart
} from 'lucide-react';

// Types pour les tours
interface Tower {
  id: string;
  name: string;
  description: string;
  cost: number;
  damage: number;
  range: number;
  fireRate: number;
  icon: React.ReactNode;
}

// Composant principal du jeu Tower Defense
const TowerDefenseGame: React.FC = () => {
  // Références DOM et jeu
  const gameRef = useRef<HTMLDivElement>(null);
  const gameInstanceRef = useRef<Phaser.Game | null>(null);
  
  // État du jeu
  const [started, setStarted] = useState<boolean>(false);
  const [money, setMoney] = useState<number>(500);
  const [wave, setWave] = useState<number>(0);
  const [health, setHealth] = useState<number>(100);
  const [score, setScore] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [selectedTower, setSelectedTower] = useState<Tower | null>(null);
  const [difficulty, setDifficulty] = useState<string>('medium');
  
  // Liste des tours disponibles
  const towers: Tower[] = [
    {
      id: 'firewall',
      name: 'Firewall',
      description: 'Bloque les attaques basiques. Efficace contre les virus.',
      cost: 100,
      damage: 20,
      range: 150,
      fireRate: 400,
      icon: <Shield className="h-6 w-6 text-orange-500" />
    },
    {
      id: 'antivirus',
      name: 'Antivirus',
      description: 'Élimine rapidement les logiciels malveillants. Tir rapide.',
      cost: 150,
      damage: 15,
      range: 180,
      fireRate: 250,
      icon: <Database className="h-6 w-6 text-green-500" />
    },
    {
      id: 'ids',
      name: 'IDS/IPS',
      description: 'Système de détection et prévention d\'intrusion. Grande portée.',
      cost: 200,
      damage: 25,
      range: 250,
      fireRate: 600,
      icon: <Radar className="h-6 w-6 text-blue-500" />
    },
    {
      id: 'encryption',
      name: 'Chiffrement',
      description: 'Protège vos données en les rendant illisibles pour les attaquants.',
      cost: 250,
      damage: 40,
      range: 140,
      fireRate: 800,
      icon: <Lock className="h-6 w-6 text-purple-500" />
    },
    {
      id: 'honeypot',
      name: 'Honeypot',
      description: 'Piège les attaquants en les attirant vers une fausse cible.',
      cost: 300,
      damage: 30,
      range: 200,
      fireRate: 700,
      icon: <Radio className="h-6 w-6 text-cyan-500" />
    },
    {
      id: 'backup',
      name: 'Sauvegarde',
      description: 'Restaure votre système après une attaque. Dégâts massifs.',
      cost: 400,
      damage: 80,
      range: 120,
      fireRate: 1200,
      icon: <Cpu className="h-6 w-6 text-yellow-500" />
    }
  ];

  // Initialisation du jeu Phaser
  useEffect(() => {
    if (!gameRef.current || gameInstanceRef.current) return;
    
    // Configurer la fenêtre globale pour communiquer avec Phaser
    window.towerDefense = {
      updateMoney: (value: number) => setMoney(value),
      updateWave: (value: number) => setWave(value),
      updateHealth: (value: number) => setHealth(value),
      getDifficulty: () => difficulty,
      getSelectedTower: () => selectedTower,
      gameOver: (finalScore: number) => {
        setScore(finalScore);
        setGameOver(true);
        setStarted(false);
      }
    };
    
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 960,
      height: 540,
      parent: gameRef.current,
      backgroundColor: '#000000',
      scene: [BootScene, PreloadScene, MenuScene, GameScene, UIScene, GameOverScene],
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 },
          debug: false
        }
      },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      }
    };
    
    // Créer l'instance du jeu
    gameInstanceRef.current = new Phaser.Game(config);
    
    // Nettoyer lors du démontage
    return () => {
      if (gameInstanceRef.current) {
        gameInstanceRef.current.destroy(true);
        gameInstanceRef.current = null;
      }
      
      if (window.towerDefense) {
        window.towerDefense = undefined;
      }
    };
  }, [difficulty, selectedTower]);
  
  // Démarrer le placement d'une tour
  const startTowerPlacement = (tower: Tower) => {
    if (!gameInstanceRef.current) return;
    
    // Vérifier si le joueur a assez d'argent
    if (money < tower.cost) {
      alert("Vous n'avez pas assez de crédits pour cette tour!");
      return;
    }
    
    setSelectedTower(tower);
    
    // Obtenir la scène de jeu et appeler la méthode de placement
    const gameScene = gameInstanceRef.current.scene.getScene('GameScene') as GameScene;
    if (gameScene && gameScene.startTowerPlacement) {
      gameScene.startTowerPlacement(tower.id, tower.cost, tower.range);
    }
  };
  
  return (
    <div className="container mx-auto p-4 max-w-screen-xl">
      <div className="flex flex-col gap-4">
        {/* En-tête du jeu */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <ChevronLeft className="h-6 w-6" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              CYBERSEC TOWER DEFENSE
            </h1>
          </div>
          <div className="flex gap-2">
            {!started && !gameOver && (
              <Button 
                onClick={() => setStarted(true)} 
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <Play className="h-4 w-4" />
                Jouer
              </Button>
            )}
            {gameOver && (
              <Button 
                onClick={() => {
                  setGameOver(false);
                  setStarted(true);
                  
                  // Redémarrer le jeu
                  if (gameInstanceRef.current) {
                    gameInstanceRef.current.scene.start('MenuScene');
                  }
                }} 
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Rejouer
              </Button>
            )}
          </div>
        </div>
        
        {/* Zone de jeu */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Zone principale du jeu */}
          <div className="lg:col-span-9">
            <Card className="border-2 border-cyan-800">
              <CardContent className="p-0 overflow-hidden">
                <div 
                  ref={gameRef} 
                  className="w-full aspect-[16/9] bg-black"
                  style={{ display: started ? 'block' : 'none' }}
                ></div>
                
                {!started && !gameOver && (
                  <div className="w-full aspect-[16/9] bg-black p-6 flex flex-col items-center justify-center text-center">
                    <h2 className="text-4xl font-bold mb-6 text-cyan-400">CYBERSEC TOWER DEFENSE</h2>
                    <p className="text-lg mb-8 max-w-2xl text-gray-300">
                      Protégez votre infrastructure contre les cyberattaques en déployant des mécanismes de défense stratégiques. Empêchez les virus, malwares et autres menaces d'atteindre votre serveur central.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      <Card className="bg-blue-900/30 border-blue-700">
                        <CardContent className="p-4 flex flex-col items-center">
                          <Shield className="h-12 w-12 text-blue-400 mb-2" />
                          <h3 className="text-xl font-semibold text-blue-300">Déployez des défenses</h3>
                          <p className="text-sm text-gray-300">Placez stratégiquement des firewalls, antivirus et autres systèmes de sécurité</p>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-red-900/30 border-red-700">
                        <CardContent className="p-4 flex flex-col items-center">
                          <AlertTriangle className="h-12 w-12 text-red-400 mb-2" />
                          <h3 className="text-xl font-semibold text-red-300">Repoussez les attaques</h3>
                          <p className="text-sm text-gray-300">Combattez des vagues d'attaques de plus en plus sophistiquées</p>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-green-900/30 border-green-700">
                        <CardContent className="p-4 flex flex-col items-center">
                          <BarChart3 className="h-12 w-12 text-green-400 mb-2" />
                          <h3 className="text-xl font-semibold text-green-300">Améliorez vos compétences</h3>
                          <p className="text-sm text-gray-300">Apprenez les concepts de cybersécurité tout en vous amusant</p>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="font-semibold mb-2 text-white">Sélectionnez la difficulté:</h3>
                      <div className="flex gap-4">
                        <Button 
                          variant={difficulty === 'easy' ? 'default' : 'outline'} 
                          onClick={() => setDifficulty('easy')}
                          className={difficulty === 'easy' ? 'bg-green-600 hover:bg-green-700' : ''}
                        >
                          Facile
                        </Button>
                        <Button 
                          variant={difficulty === 'medium' ? 'default' : 'outline'} 
                          onClick={() => setDifficulty('medium')}
                          className={difficulty === 'medium' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                        >
                          Moyen
                        </Button>
                        <Button 
                          variant={difficulty === 'hard' ? 'default' : 'outline'} 
                          onClick={() => setDifficulty('hard')}
                          className={difficulty === 'hard' ? 'bg-red-600 hover:bg-red-700' : ''}
                        >
                          Difficile
                        </Button>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => setStarted(true)} 
                      className="bg-cyan-600 hover:bg-cyan-700 px-8 py-6 text-xl"
                    >
                      Commencer la partie
                    </Button>
                  </div>
                )}
                
                {gameOver && (
                  <div className="w-full aspect-[16/9] bg-black p-6 flex flex-col items-center justify-center text-center">
                    <h2 className="text-4xl font-bold mb-4 text-cyan-400">PARTIE TERMINÉE</h2>
                    <p className="text-xl mb-6 text-gray-300">
                      Score final: <span className="text-2xl font-bold text-yellow-400">{score}</span>
                    </p>
                    
                    <div className="max-w-md mb-8">
                      <h3 className="text-xl font-semibold mb-4 text-blue-300">Ce que vous avez appris:</h3>
                      <ul className="text-left space-y-2">
                        <li className="flex items-start gap-2">
                          <Shield className="h-5 w-5 mt-1 text-green-400 flex-shrink-0" />
                          <span>L'importance d'une défense en profondeur avec plusieurs technologies</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Activity className="h-5 w-5 mt-1 text-green-400 flex-shrink-0" />
                          <span>Comment différents types de cyberdéfenses contrent différentes attaques</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Zap className="h-5 w-5 mt-1 text-green-400 flex-shrink-0" />
                          <span>L'allocation optimale des ressources pour une protection maximale</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="flex gap-4">
                      <Button 
                        onClick={() => {
                          setGameOver(false);
                          setStarted(true);
                          
                          // Redémarrer le jeu
                          if (gameInstanceRef.current) {
                            gameInstanceRef.current.scene.start('MenuScene');
                          }
                        }} 
                        className="bg-cyan-600 hover:bg-cyan-700"
                      >
                        Rejouer
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          window.location.href = '/cyber/arcade';
                        }}
                      >
                        Retour aux jeux
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Statistiques du jeu */}
            {started && !gameOver && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="border-orange-800 bg-gradient-to-br from-orange-950 to-orange-900">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-orange-400">Crédits disponibles</p>
                      <h3 className="text-3xl font-bold text-orange-300">${money}</h3>
                    </div>
                    <div className="bg-orange-800 rounded-full p-2">
                      <Database className="h-6 w-6 text-orange-300" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-blue-800 bg-gradient-to-br from-blue-950 to-blue-900">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-blue-400">Vague actuelle</p>
                      <h3 className="text-3xl font-bold text-blue-300">{wave}</h3>
                    </div>
                    <div className="bg-blue-800 rounded-full p-2">
                      <Activity className="h-6 w-6 text-blue-300" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className={`border-${health > 50 ? 'green' : health > 25 ? 'yellow' : 'red'}-800 bg-gradient-to-br from-${health > 50 ? 'green' : health > 25 ? 'yellow' : 'red'}-950 to-${health > 50 ? 'green' : health > 25 ? 'yellow' : 'red'}-900`}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className={`text-xs text-${health > 50 ? 'green' : health > 25 ? 'yellow' : 'red'}-400`}>Santé du réseau</p>
                      <h3 className={`text-3xl font-bold text-${health > 50 ? 'green' : health > 25 ? 'yellow' : 'red'}-300`}>{health}%</h3>
                    </div>
                    <div className={`bg-${health > 50 ? 'green' : health > 25 ? 'yellow' : 'red'}-800 rounded-full p-2`}>
                      <Heart className={`h-6 w-6 text-${health > 50 ? 'green' : health > 25 ? 'yellow' : 'red'}-300`} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
          
          {/* Panneau latéral */}
          {started && !gameOver && (
            <div className="lg:col-span-3">
              <Card className="h-full border-cyan-800">
                <CardHeader>
                  <CardTitle className="text-center text-cyan-400">Défenses Disponibles</CardTitle>
                </CardHeader>
                <CardContent className="px-2">
                  <div className="space-y-4">
                    {towers.map((tower) => (
                      <Card 
                        key={tower.id} 
                        className="cursor-pointer hover:bg-cyan-900/30 transition-colors border-cyan-800/50"
                        onClick={() => startTowerPlacement(tower)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900">
                              {tower.icon}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-white">{tower.name}</h3>
                              <p className="text-xs text-gray-400 line-clamp-2">{tower.description}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-xs text-gray-400">Coût</span>
                              <p className="font-bold text-yellow-400">${tower.cost}</p>
                            </div>
                          </div>
                          
                          <Separator className="my-2 bg-gray-700" />
                          
                          <div className="grid grid-cols-3 gap-1 text-xs text-center">
                            <div>
                              <p className="text-gray-400">Dégâts</p>
                              <span className="text-red-400">{tower.damage}</span>
                            </div>
                            <div>
                              <p className="text-gray-400">Portée</p>
                              <span className="text-blue-400">{tower.range}</span>
                            </div>
                            <div>
                              <p className="text-gray-400">Vitesse</p>
                              <span className="text-green-400">{Math.round(1000 / tower.fireRate * 10) / 10}/s</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  <Separator className="my-4 bg-gray-700" />
                  
                  <div className="text-sm text-gray-400 p-2">
                    <p className="mb-2 font-semibold text-cyan-400">Comment jouer:</p>
                    <ul className="space-y-1">
                      <li>• Cliquez sur une défense pour la sélectionner</li>
                      <li>• Placez-la sur la carte (zones vertes)</li>
                      <li>• Défendez votre réseau contre les vagues d'attaques</li>
                      <li>• Utilisez les crédits gagnés pour déployer plus de défenses</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Déclaration pour TypeScript
declare global {
  interface Window {
    towerDefense?: {
      updateMoney: (value: number) => void;
      updateWave: (value: number) => void;
      updateHealth: (value: number) => void;
      getDifficulty: () => string;
      getSelectedTower: () => Tower | null;
      gameOver: (finalScore: number) => void;
    };
  }
}

export default TowerDefenseGame;