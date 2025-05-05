import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, HelpCircle, Info, Award, AlertCircle } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import HomeLayout from '@/components/layout/HomeLayout';
import { useToast } from '@/hooks/use-toast';
import Phaser from 'phaser';
import { CyberEscapeGame } from './game/CyberEscapeGame';

// Hauteur du jeu
const GAME_HEIGHT = 600;

// Interface pour les statistiques du joueur
interface GameStats {
  fixes: number;
  totalVulnerabilities: number;
  timeRemaining: number;
  level: number;
}

export default function CyberEscapePage() {
  const { themeMode } = useTheme();
  const isDark = themeMode === 'dark' || themeMode === 'futuristic';
  const [, setLocation] = useLocation();
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const gameInstanceRef = useRef<Phaser.Game | null>(null);
  const { toast } = useToast();
  const [showInstructions, setShowInstructions] = useState(false);
  const [gameStats, setGameStats] = useState<GameStats>({
    fixes: 0,
    totalVulnerabilities: 10,
    timeRemaining: 300,
    level: 1,
  });
  const [gameStatus, setGameStatus] = useState<'ready' | 'playing' | 'paused' | 'gameOver' | 'victory'>('ready');

  // Initialisation du jeu
  useEffect(() => {
    if (gameContainerRef.current && !gameInstanceRef.current) {
      // Configuration de Phaser
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: gameContainerRef.current.clientWidth,
        height: GAME_HEIGHT,
        parent: gameContainerRef.current,
        backgroundColor: '#1a1a2e',
        scene: [CyberEscapeGame],
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { y: 0 },
            debug: false
          }
        },
        scale: {
          mode: Phaser.Scale.RESIZE,
          autoCenter: Phaser.Scale.CENTER_BOTH
        }
      };

      // Création de l'instance du jeu
      gameInstanceRef.current = new Phaser.Game(config);

      // Communication avec le jeu
      const game = gameInstanceRef.current;
      
      // Exposer des méthodes pour la communication entre React et Phaser
      window.PhaserEvents = {
        updateStats: (stats: Partial<GameStats>) => {
          setGameStats(prevStats => ({
            ...prevStats,
            ...stats
          }));
        },
        setGameStatus: (status: 'ready' | 'playing' | 'paused' | 'gameOver' | 'victory') => {
          setGameStatus(status);
        },
        showToast: (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
          toast({
            title: type === 'success' ? 'Bravo !' : type === 'error' ? 'Erreur' : 'Information',
            description: message,
            variant: type === 'error' ? 'destructive' : 'default',
          });
        }
      };
    }

    // Nettoyage à la fermeture
    return () => {
      if (gameInstanceRef.current) {
        gameInstanceRef.current.destroy(true);
        gameInstanceRef.current = null;
      }
      
      // Suppression des méthodes globales
      if (window.PhaserEvents) {
        window.PhaserEvents = undefined;
      }
    };
  }, [toast]);

  // Ajuster la taille du jeu lors du redimensionnement de la fenêtre
  useEffect(() => {
    const handleResize = () => {
      if (gameInstanceRef.current && gameContainerRef.current) {
        gameInstanceRef.current.scale.resize(gameContainerRef.current.clientWidth, GAME_HEIGHT);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Gestion du démarrage du jeu
  const startGame = () => {
    if (gameInstanceRef.current) {
      // Communiquer avec la scène Phaser pour démarrer le jeu
      const scene = gameInstanceRef.current.scene.getScene('CyberEscapeGame') as any;
      if (scene && scene.startGame) {
        scene.startGame();
        setGameStatus('playing');
      }
    }
  };

  // Interface utilisateur
  return (
    <HomeLayout>
      <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        {/* En-tête */}
        <header className={`px-4 py-3 border-b ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                className="mr-3"
                onClick={() => setLocation('/cyber/arcade')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-bold">CyberEscape - L'infiltration inverse</h1>
            </div>
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setShowInstructions(!showInstructions)}
              >
                <HelpCircle className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Instructions */}
        {showInstructions && (
          <div className="container mx-auto px-4 py-4">
            <Card className={`p-4 mb-4 ${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-white border-gray-200'}`}>
              <h2 className="text-lg font-bold mb-2 flex items-center">
                <Info className="h-5 w-5 mr-2" />
                Comment jouer
              </h2>
              <div className="space-y-2 text-sm">
                <p>🎯 <strong>Objectif :</strong> Vous êtes un responsable cybersécurité qui doit repérer et corriger les failles de sécurité dans les bureaux avant qu'un attaquant ne les exploite.</p>
                
                <p>🕹️ <strong>Contrôles :</strong></p>
                <ul className="list-disc pl-6">
                  <li>Utilisez les flèches du clavier ou ZQSD pour vous déplacer</li>
                  <li>Appuyez sur E ou cliquez pour interagir avec les objets</li>
                  <li>Appuyez sur ESPACE pour utiliser votre scanner de vulnérabilités</li>
                </ul>
                
                <p>⚠️ <strong>Vulnérabilités à chercher :</strong></p>
                <ul className="list-disc pl-6">
                  <li>Mots de passe visibles (Post-it)</li>
                  <li>Ports USB non surveillés</li>
                  <li>Écrans déverrouillés</li>
                  <li>Documents confidentiels</li>
                  <li>Appareils non autorisés</li>
                </ul>
                
                <p>⏱️ <strong>Adversaire :</strong> Un pirate informatique progresse en parallèle. Si vous tardez trop, il exploitera les failles avant vous !</p>
              </div>
            </Card>
          </div>
        )}

        {/* Conteneur principal */}
        <div className="container mx-auto px-4 py-4">
          {/* Statistiques du jeu */}
          <div className={`grid grid-cols-4 gap-4 mb-4 ${gameStatus === 'ready' ? 'opacity-50' : 'opacity-100'}`}>
            <Card className={`p-3 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="flex flex-col items-center">
                <span className="text-sm opacity-80">Niveau</span>
                <span className="text-xl font-bold">{gameStats.level}</span>
              </div>
            </Card>
            <Card className={`p-3 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="flex flex-col items-center">
                <span className="text-sm opacity-80">Failles corrigées</span>
                <span className="text-xl font-bold">{gameStats.fixes} / {gameStats.totalVulnerabilities}</span>
              </div>
            </Card>
            <Card className={`p-3 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="flex flex-col items-center">
                <span className="text-sm opacity-80">Temps restant</span>
                <span className="text-xl font-bold">
                  {Math.floor(gameStats.timeRemaining / 60)}:{(gameStats.timeRemaining % 60).toString().padStart(2, '0')}
                </span>
              </div>
            </Card>
            <Card className={`p-3 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="flex flex-col items-center">
                <span className="text-sm opacity-80">Avance sur le pirate</span>
                <span className={`text-xl font-bold ${
                  gameStats.fixes > gameStats.totalVulnerabilities / 2 ? 'text-green-500' : 'text-orange-500'
                }`}>
                  {Math.round((gameStats.fixes / gameStats.totalVulnerabilities) * 100)}%
                </span>
              </div>
            </Card>
          </div>

          {/* Canvas du jeu */}
          <div 
            ref={gameContainerRef} 
            className={`w-full rounded-lg overflow-hidden shadow-lg border ${
              isDark ? 'border-gray-700' : 'border-gray-200'
            }`} 
            style={{ height: `${GAME_HEIGHT}px` }}
          />

          {/* Boutons de contrôle */}
          <div className="mt-4 flex justify-center">
            {gameStatus === 'ready' && (
              <Button 
                onClick={startGame}
                className="px-8 py-4 text-lg bg-blue-600 hover:bg-blue-700 text-white"
              >
                Commencer la mission
              </Button>
            )}
            
            {gameStatus === 'gameOver' && (
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <AlertCircle className="h-8 w-8 text-red-500 mr-2" />
                  <h2 className="text-2xl font-bold">Mission échouée</h2>
                </div>
                <p className="mb-4">Le pirate informatique a exploité trop de failles. La sécurité du système est compromise.</p>
                <Button 
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Réessayer
                </Button>
              </div>
            )}
            
            {gameStatus === 'victory' && (
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <Award className="h-8 w-8 text-yellow-500 mr-2" />
                  <h2 className="text-2xl font-bold">Mission accomplie !</h2>
                </div>
                <p className="mb-4">Vous avez corrigé toutes les failles de sécurité avant le pirate informatique.</p>
                <Button 
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white"
                >
                  Niveau suivant
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}

// Type global pour la communication entre React et Phaser
declare global {
  interface Window {
    PhaserEvents?: {
      updateStats: (stats: Partial<GameStats>) => void;
      setGameStatus: (status: 'ready' | 'playing' | 'paused' | 'gameOver' | 'victory') => void;
      showToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
    };
  }
}