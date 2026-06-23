import React, { useState, useEffect, useCallback, memo, lazy, Suspense } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Shield } from 'lucide-react';
import HomeLayout from '@/components/layout/HomeLayout';

// Chargement lazy du jeu pour améliorer les performances
const FirewallDefenseGameNew = lazy(() => import('@/components/cyber/arcade/FirewallDefenseGameNew'));

// Composant de navigation mémoïsé pour éviter les re-rendus
const GameNavBar = memo(({ difficulty, setDifficulty }: { 
  difficulty: 'Facile' | 'Moyen' | 'Difficile', 
  setDifficulty: (d: 'Facile' | 'Moyen' | 'Difficile') => void 
}) => (
  <div className="bg-gray-800 py-2 px-4 flex flex-wrap gap-4 items-center">
    <Link href="/cyber/arcade" className="inline-flex items-center text-white hover:text-gray-200 transition-colors">
      <ArrowLeft className="mr-2 h-4 w-4" />
      Retour à l'arcade
    </Link>
    <Link href="/cyber" className="inline-flex items-center text-amber-200 hover:text-white transition-colors">
      <Shield className="mr-2 h-4 w-4" />
      Retour à ESPACE CYBER
    </Link>
    
    {/* Sélecteur de difficulté compact */}
    <div className="ml-auto flex items-center">
      <span className="text-white mr-2 text-sm">Difficulté :</span>
      <div className="flex space-x-1">
        <button 
          className={`px-2 py-1 text-xs rounded ${difficulty === 'Facile' ? 'bg-[#006a9e] text-white' : 'bg-gray-700 text-gray-300'}`}
          onClick={() => setDifficulty('Facile')}
        >
          Facile
        </button>
        <button 
          className={`px-2 py-1 text-xs rounded ${difficulty === 'Moyen' ? 'bg-amber-600 text-white' : 'bg-gray-700 text-gray-300'}`}
          onClick={() => setDifficulty('Moyen')}
        >
          Moyen
        </button>
        <button 
          className={`px-2 py-1 text-xs rounded ${difficulty === 'Difficile' ? 'bg-red-700 text-white' : 'bg-gray-700 text-gray-300'}`}
          onClick={() => setDifficulty('Difficile')}
        >
          Difficile
        </button>
      </div>
    </div>
  </div>
));

// Optimisation du loader pendant le chargement
const GameLoader = () => (
  <div className="flex h-[calc(100vh-120px)] items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p className="mt-4 text-white">Chargement du jeu...</p>
    </div>
  </div>
);

const FirewallDefensePage: React.FC = () => {
  const [difficulty, setDifficulty] = useState<'Facile' | 'Moyen' | 'Difficile'>('Moyen');
  const [gameScore, setGameScore] = useState<number | null>(null);
  
  // Fonction mémoïsée pour éviter les re-rendus inutiles
  const handleGameEnd = useCallback((score: number) => {
    setGameScore(score);
  }, []);
  
  // Affichage direct du jeu avec lazy loading
  return (
    <HomeLayout>
      <div className="min-h-[calc(100vh-64px)] bg-gray-900">
        {/* Barre de navigation minimale */}
        <GameNavBar difficulty={difficulty} setDifficulty={setDifficulty} />
        
        {/* Jeu avec suspense pour le chargement */}
        <Suspense fallback={<GameLoader />}>
          <FirewallDefenseGameNew 
            difficulty={difficulty}
            onGameEnd={handleGameEnd}
          />
        </Suspense>
      </div>
    </HomeLayout>
  );
};

export default memo(FirewallDefensePage);