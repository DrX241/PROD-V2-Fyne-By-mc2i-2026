import React, { useState } from 'react';
import { GameProvider } from '@/contexts/GameContext';
// Ajout de la route pour CyberChallenge
import { Switch, Route } from "wouter";
import OnboardingPhase from '@/components/challenge/OnboardingPhase';
import ScenarioPhase from '@/components/challenge/ScenarioPhase';
import GameplayPhase from '@/components/challenge/GameplayPhase';
import ResultsPhase from '@/components/challenge/ResultsPhase';
import { Shield } from 'lucide-react';

// Les différentes phases du jeu
type GamePhase = 'onboarding' | 'scenario' | 'gameplay' | 'results';

export default function CyberChallengePage() {
  const [gamePhase, setGamePhase] = useState<GamePhase>('onboarding');
  
  // Fonction pour redémarrer le jeu
  const handleRestart = () => {
    // Recharger la page pour recommencer complètement
    window.location.reload();
  };
  
  return (
    <GameProvider>
      <div className="bg-gradient-to-br from-slate-900 to-blue-900 min-h-screen text-white">
        <header className="bg-slate-900/80 border-b border-blue-900/40 p-4 shadow-lg">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Shield className="h-6 w-6" />
              </div>
              <h1 className="text-2xl font-bold text-blue-300">CyberChallenge</h1>
            </div>
            
            <div className="text-sm">
              <span className="bg-blue-800/40 py-1.5 px-3 rounded-full text-blue-300 font-medium">
                Module: Gestion de Crise
              </span>
            </div>
          </div>
        </header>
        
        <main className="max-w-7xl mx-auto p-4">
          <div className="bg-slate-800/30 rounded-lg border border-blue-700/30 shadow-lg overflow-hidden">
            {gamePhase === 'onboarding' && (
              <OnboardingPhase onComplete={() => setGamePhase('scenario')} />
            )}
            
            {gamePhase === 'scenario' && (
              <ScenarioPhase onComplete={() => setGamePhase('gameplay')} />
            )}
            
            {gamePhase === 'gameplay' && (
              <GameplayPhase onComplete={() => setGamePhase('results')} />
            )}
            
            {gamePhase === 'results' && (
              <ResultsPhase onRestart={handleRestart} />
            )}
          </div>
        </main>
        
        <footer className="p-4 text-center text-sm text-slate-400 mt-8">
          <p>CyberChallenge © 2025 - Simulateur de gestion de crise cybersécurité</p>
        </footer>
      </div>
    </GameProvider>
  );
}