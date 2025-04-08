import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { ArrowLeft, Network, Shield, Check, Trophy } from 'lucide-react';
import HomeLayout from '@/components/layout/HomeLayout';
import PageTitle from '@/components/utils/PageTitle';
import { NetworkPuzzleGame } from '@/components/cyber/arcade/network-puzzle';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

export default function NetworkPuzzlePage() {
  const [, setLocation] = useLocation();
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  
  // Gérer la fin du jeu
  const handleGameEnd = (score: number) => {
    setGameCompleted(true);
    setFinalScore(score);
  };
  
  // Retourner à la sélection de niveau
  const handleReturnToSelection = () => {
    setGameStarted(false);
  };
  
  // Retourner au menu Cyber Arcade
  const handleReturnToCyberArcade = () => {
    setLocation('/cyber/arcade');
  };

  return (
    <HomeLayout>
      <PageTitle title="Puzzle Réseau" />
      <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-indigo-900 via-gray-900 to-black relative overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
          <Link href="/cyber/arcade" className="inline-flex items-center text-indigo-200 hover:text-white mb-4 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à Cyber Arcade
          </Link>
          
          {!gameStarted ? (
            <div className="max-w-4xl mx-auto">
              {/* Écran de sélection de difficulté */}
              <div className="bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center">
                    <Network className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">Puzzle Réseau</h1>
                    <p className="text-indigo-200">Construisez une infrastructure réseau sécurisée</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-3">Objectif</h2>
                    <p className="text-gray-300">
                      Construisez une infrastructure réseau sécurisée en connectant correctement tous les composants. 
                      Assurez-vous que vos connexions respectent les exigences de sécurité et protègent efficacement 
                      les données sensibles contre les menaces potentielles.
                    </p>
                  </div>
                  
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-3">Règles du jeu</h2>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex">
                        <Check className="text-green-400 h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Cliquez sur un composant puis sur un autre pour créer une connexion</span>
                      </li>
                      <li className="flex">
                        <Check className="text-green-400 h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Toutes les connexions requises doivent être établies</span>
                      </li>
                      <li className="flex">
                        <Check className="text-green-400 h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Respectez les contraintes de sécurité indiquées dans la description</span>
                      </li>
                      <li className="flex">
                        <Check className="text-green-400 h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Certains pare-feu peuvent être configurés (cliquez sur l'icône de rotation)</span>
                      </li>
                      <li className="flex">
                        <Check className="text-green-400 h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Utilisez l'assistant IA pour obtenir des conseils et améliorer votre compréhension</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-3">Choisir la difficulté</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button
                        className={`relative p-4 rounded-lg text-left transition-all duration-200 ${
                          difficulty === 'easy' 
                            ? 'bg-green-900/50 border-2 border-green-500' 
                            : 'bg-gray-700/50 border border-gray-600 hover:bg-gray-700'
                        }`}
                        onClick={() => setDifficulty('easy')}
                      >
                        <h3 className="font-bold text-white flex items-center">
                          <Shield className="w-5 h-5 mr-2 text-green-400" />
                          Niveau 1 - Facile
                        </h3>
                        <p className="text-sm text-gray-300 mt-1">
                          Configuration réseau simple avec un pare-feu et quelques serveurs. Idéal pour les débutants.
                        </p>
                        {difficulty === 'easy' && (
                          <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </button>
                      
                      <button
                        className={`relative p-4 rounded-lg text-left transition-all duration-200 ${
                          difficulty === 'medium' 
                            ? 'bg-amber-900/50 border-2 border-amber-500' 
                            : 'bg-gray-700/50 border border-gray-600 hover:bg-gray-700'
                        }`}
                        onClick={() => setDifficulty('medium')}
                      >
                        <h3 className="font-bold text-white flex items-center">
                          <Shield className="w-5 h-5 mr-2 text-amber-400" />
                          Niveau 2 - Moyen
                        </h3>
                        <p className="text-sm text-gray-300 mt-1">
                          Réseau avec DMZ et protection multi-couches. Pour ceux ayant des bases en sécurité réseau.
                        </p>
                        {difficulty === 'medium' && (
                          <div className="absolute -top-2 -right-2 bg-amber-500 rounded-full p-1">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </button>
                      
                      <button
                        className={`relative p-4 rounded-lg text-left transition-all duration-200 ${
                          difficulty === 'hard' 
                            ? 'bg-red-900/50 border-2 border-red-500' 
                            : 'bg-gray-700/50 border border-gray-600 hover:bg-gray-700'
                        }`}
                        onClick={() => setDifficulty('hard')}
                      >
                        <h3 className="font-bold text-white flex items-center">
                          <Shield className="w-5 h-5 mr-2 text-red-400" />
                          Niveau 3 - Difficile
                        </h3>
                        <p className="text-sm text-gray-300 mt-1">
                          Infrastructure d'entreprise complexe avec haute disponibilité. Pour experts en cybersécurité.
                        </p>
                        {difficulty === 'hard' && (
                          <div className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex justify-center pt-4">
                    <Button 
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2 text-lg"
                      onClick={() => setGameStarted(true)}
                    >
                      Commencer
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              {/* Le jeu */}
              <NetworkPuzzleGame 
                difficulty={difficulty}
                onGameEnd={handleGameEnd}
              />
            </div>
          )}
        </div>
      </div>
      
      {/* Dialog de fin de jeu */}
      <Dialog open={gameCompleted} onOpenChange={setGameCompleted}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center">
              <Trophy className="w-6 h-6 text-yellow-400 mr-2" />
              Félicitations !
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              Vous avez terminé tous les niveaux du Puzzle Réseau.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="bg-gray-700/50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-indigo-400 mb-2">{finalScore} points</div>
              <p className="text-gray-300">Vous avez démontré d'excellentes compétences en conception d'infrastructures réseau sécurisées.</p>
            </div>
            
            <div className="mt-6 space-y-2 text-sm text-gray-300">
              <p><span className="font-medium text-indigo-300">Ce que vous avez appris :</span></p>
              <ul className="list-disc list-inside space-y-1 pl-4">
                <li>Configuration et placement stratégique des pare-feu</li>
                <li>Segmentation réseau pour limiter les impacts des attaques</li>
                <li>Protection des données sensibles contre les accès non autorisés</li>
                <li>Implémentation du principe de défense en profondeur</li>
                <li>Mise en œuvre des contrôles d'accès appropriés</li>
              </ul>
            </div>
          </div>
          
          <DialogFooter>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:justify-between">
              <Button variant="outline" onClick={handleReturnToSelection}>
                Rejouer
              </Button>
              <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={handleReturnToCyberArcade}>
                Retour à Cyber Arcade
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </HomeLayout>
  );
}