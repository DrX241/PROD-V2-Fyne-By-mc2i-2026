import { useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { ShieldCheck, Rocket, History, User, Gamepad, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GameProvider } from '@/contexts/cyber-challenge/GameContext';
import IntroductionPhase from '@/components/cyber-challenge/IntroductionPhase';
import RoleSelectionPhase from '@/components/cyber-challenge/RoleSelectionPhase';
import GameModePhase from '@/components/cyber-challenge/GameModePhase';
import ScenarioPhase from '@/components/cyber-challenge/ScenarioPhase';
import ResultsPhase from '@/components/cyber-challenge/ResultsPhase';

export type GamePhase = 'introduction' | 'role-selection' | 'game-mode' | 'scenario' | 'results';

export default function CyberChallengePage() {
  // Cette page est le conteneur principal qui utilise le contexte GameProvider
  // pour gérer l'état global de l'application CyberChallenge
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-indigo-900 to-purple-900 text-white">
      <header className="py-4 px-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-cyan-400" />
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
            CyberChallenge
          </h1>
        </div>
        <Link href="/modules">
          <Button variant="ghost" className="text-white hover:text-cyan-400">
            Retour aux modules
          </Button>
        </Link>
      </header>

      <main className="container mx-auto px-4 py-8">
        <GameProvider>
          <CyberChallengeContent />
        </GameProvider>
      </main>

      <footer className="py-4 px-6 text-center text-sm text-blue-300">
        <p>CyberChallenge © {new Date().getFullYear()} - L'expérience immersive de cybersécurité</p>
      </footer>
    </div>
  );
}

function CyberChallengeContent() {
  // Ce composant change en fonction de la phase active du jeu
  // Il est encapsulé dans le GameProvider pour accéder au contexte
  
  const [currentPhase, setCurrentPhase] = useState<GamePhase>('introduction');

  // Rendu conditionnel basé sur la phase de jeu active
  const renderPhaseContent = () => {
    switch (currentPhase) {
      case 'introduction':
        return <IntroductionPhase onComplete={() => setCurrentPhase('role-selection')} />;
      case 'role-selection':
        return <RoleSelectionPhase onComplete={() => setCurrentPhase('game-mode')} />;
      case 'game-mode':
        return <GameModePhase onComplete={() => setCurrentPhase('scenario')} />;
      case 'scenario':
        return <ScenarioPhase onComplete={() => setCurrentPhase('results')} />;
      case 'results':
        return <ResultsPhase onRestart={() => setCurrentPhase('introduction')} />;
      default:
        return <IntroductionPhase onComplete={() => setCurrentPhase('role-selection')} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-5xl mx-auto"
    >
      {renderPhaseContent()}
    </motion.div>
  );
}