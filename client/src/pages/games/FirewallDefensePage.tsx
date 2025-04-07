import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Shield } from 'lucide-react';
import HomeLayout from '@/components/layout/HomeLayout';
import FirewallDefenseGameNew from '@/components/cyber/arcade/FirewallDefenseGameNew';

const FirewallDefensePage: React.FC = () => {
  const [difficulty, setDifficulty] = useState<'Facile' | 'Moyen' | 'Difficile'>('Moyen');
  const [gameScore, setGameScore] = useState<number | null>(null);
  
  // Fonction appelée lorsque le jeu se termine
  const handleGameEnd = (score: number) => {
    setGameScore(score);
  };
  
  // Affichage direct du jeu
  return (
    <HomeLayout>
      <div className="min-h-[calc(100vh-64px)] bg-gray-900">
        {/* Barre de navigation minimale */}
        <div className="bg-gray-800 py-2 px-4 flex flex-wrap gap-4 items-center">
          <Link href="/cyber/arcade" className="inline-flex items-center text-white hover:text-gray-200 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à l'arcade
          </Link>
          <Link href="/cyber" className="inline-flex items-center text-amber-200 hover:text-white transition-colors">
            <Shield className="mr-2 h-4 w-4" />
            Retour à I AM CYBER
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
        
        {/* Jeu */}
        <FirewallDefenseGameNew 
          difficulty={difficulty}
          onGameEnd={handleGameEnd}
        />
      </div>
    </HomeLayout>
  );
};

export default FirewallDefensePage;