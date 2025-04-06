import React, { useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowLeft, Info, Shield, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HomeLayout from '@/components/layout/HomeLayout';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import FirewallDefenseGame from '@/components/cyber/arcade/FirewallDefenseGame';

const FirewallDefensePage: React.FC = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [difficulty, setDifficulty] = useState<'Facile' | 'Moyen' | 'Difficile'>('Moyen');
  const [gameScore, setGameScore] = useState<number | null>(null);
  
  // Fonction appelée lorsque le jeu se termine
  const handleGameEnd = (score: number) => {
    setGameScore(score);
    setGameStarted(false);
  };
  
  // Affichage du panneau d'information sur le jeu
  if (!gameStarted) {
    return (
      <HomeLayout>
        <div className="min-h-[calc(100vh-64px)] relative overflow-hidden bg-gradient-to-b from-amber-600 to-orange-700">
          <div className="absolute inset-0 w-full h-full">
            <div className="absolute inset-0 z-0 opacity-20">
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
                    <path d="M 80 0 L 0 0 0 80" fill="none" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>
          </div>
          
          <div className="relative z-10 max-w-6xl mx-auto px-4 py-12 sm:px-6 sm:py-16">
            <div className="flex flex-wrap gap-4 mb-8">
              <Link href="/cyber/arcade" className="inline-flex items-center text-white hover:text-gray-200 transition-colors">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à l'arcade
              </Link>
              <Link href="/cyber" className="inline-flex items-center text-amber-200 hover:text-white transition-colors">
                <Shield className="mr-2 h-4 w-4" />
                Retour à I AM CYBER
              </Link>
            </div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-sm rounded-xl p-6 sm:p-8 shadow-2xl"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-full bg-orange-600 flex items-center justify-center mr-4">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white">Firewall Defense</h1>
              </div>
              
              <p className="text-gray-300 mb-8">
                Un jeu de stratégie tower defense où vous protégez une infrastructure réseau contre diverses cyberattaques. 
                Placez judicieusement vos défenses pour bloquer les attaques avant qu'elles n'atteignent vos systèmes critiques.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-800 rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Objectif</h2>
                  <p className="text-gray-300">
                    Protéger une infrastructure réseau contre différents types d'attaques en déployant des solutions de sécurité adaptées.
                  </p>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Compétences développées</h2>
                  <ul className="list-disc list-inside text-gray-300 space-y-1">
                    <li>Architecture réseau</li>
                    <li>Priorisation des menaces</li>
                    <li>Stratégie de défense en profondeur</li>
                    <li>Gestion des ressources</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">Fonctionnement du jeu</h2>
                <div className="space-y-4">
                  <ol className="list-decimal list-inside text-gray-300 space-y-2">
                    <li className="pl-2">Positionnement stratégique des pare-feu et autres mécanismes de défense</li>
                    <li className="pl-2">Gestion des ressources limitées (budget, bande passante)</li>
                    <li className="pl-2">Réaction à différentes vagues d'attaques (DDoS, injection SQL, etc.)</li>
                    <li className="pl-2">Adaptation en temps réel aux évolutions des menaces</li>
                  </ol>
                </div>
              </div>
              
              {gameScore !== null && (
                <div className="bg-amber-900/30 border border-amber-600/50 rounded-lg p-6 mb-8 text-center">
                  <h2 className="text-xl font-semibold text-amber-400 mb-2">Votre dernière partie</h2>
                  <p className="text-4xl font-bold text-white mb-4">{gameScore} points</p>
                  <p className="text-gray-300">Pouvez-vous faire mieux?</p>
                </div>
              )}
              
              <div className="bg-gray-800 rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">Choisir la difficulté</h2>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <button 
                    className={`p-4 rounded-lg text-center transition-all ${
                      difficulty === 'Facile' 
                        ? 'bg-[#006a9e] text-white' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                    onClick={() => setDifficulty('Facile')}
                  >
                    <h3 className="font-medium">Facile</h3>
                    <p className="text-xs mt-1 opacity-80">Pour débuter</p>
                  </button>
                  
                  <button 
                    className={`p-4 rounded-lg text-center transition-all ${
                      difficulty === 'Moyen' 
                        ? 'bg-amber-600 text-white' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                    onClick={() => setDifficulty('Moyen')}
                  >
                    <h3 className="font-medium">Moyen</h3>
                    <p className="text-xs mt-1 opacity-80">Équilibré</p>
                  </button>
                  
                  <button 
                    className={`p-4 rounded-lg text-center transition-all ${
                      difficulty === 'Difficile' 
                        ? 'bg-red-700 text-white' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                    onClick={() => setDifficulty('Difficile')}
                  >
                    <h3 className="font-medium">Difficile</h3>
                    <p className="text-xs mt-1 opacity-80">Pour experts</p>
                  </button>
                </div>
                
                <div className="text-sm text-gray-400">
                  <p className="mb-2">Détails de la difficulté sélectionnée :</p>
                  {difficulty === 'Facile' && (
                    <ul className="list-disc list-inside pl-4 space-y-1">
                      <li>Réseau simple avec moins de nœuds à protéger</li>
                      <li>Plus de ressources initiales (1000)</li>
                      <li>Attaques moins fréquentes et moins puissantes</li>
                      <li>3 vagues d'attaques à repousser</li>
                    </ul>
                  )}
                  
                  {difficulty === 'Moyen' && (
                    <ul className="list-disc list-inside pl-4 space-y-1">
                      <li>Réseau plus complexe incluant un service cloud</li>
                      <li>Ressources initiales modérées (800)</li>
                      <li>Attaques plus variées et fréquentes</li>
                      <li>5 vagues d'attaques à repousser</li>
                    </ul>
                  )}
                  
                  {difficulty === 'Difficile' && (
                    <ul className="list-disc list-inside pl-4 space-y-1">
                      <li>Réseau complexe avec nombreux nœuds interdépendants</li>
                      <li>Ressources initiales limitées (600)</li>
                      <li>Attaques sophistiquées et très rapides</li>
                      <li>8 vagues d'attaques incluant des menaces persistantes avancées (APT)</li>
                    </ul>
                  )}
                </div>
              </div>
              
              <div className="flex justify-center">
                <Button 
                  size="lg"
                  onClick={() => setGameStarted(true)}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-6 text-lg shadow-lg"
                >
                  Démarrer le jeu
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </HomeLayout>
    );
  }
  
  // Affichage du jeu lui-même
  return (
    <HomeLayout>
      <div className="min-h-[calc(100vh-64px)] bg-gray-900">
        <FirewallDefenseGame 
          difficulty={difficulty}
          onGameEnd={handleGameEnd}
        />
      </div>
    </HomeLayout>
  );
};

export default FirewallDefensePage;