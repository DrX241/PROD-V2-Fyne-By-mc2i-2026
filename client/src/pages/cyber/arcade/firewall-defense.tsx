import React, { useState } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Trophy, BarChart } from 'lucide-react';
import HomeLayout from '@/components/layout/HomeLayout';
import PageTitle from '@/components/utils/PageTitle';
import FirewallDefenseGame from '@/components/cyber/arcade/firewall-defense';
import { Button } from '@/components/ui/button';

export default function FirewallDefensePage() {
  const [difficulty, setDifficulty] = useState<'Facile' | 'Moyen' | 'Difficile'>('Facile');
  const [gameEnded, setGameEnded] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  // Gérer la fin du jeu
  const handleGameEnd = (score: number) => {
    setGameEnded(true);
    setFinalScore(score);
  };

  return (
    <HomeLayout>
      <PageTitle title="Firewall Defense" />
      <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-amber-900 via-gray-900 to-black relative overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
          <Link href="/cyber/arcade" className="inline-flex items-center text-amber-200 hover:text-white mb-4 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à Cyber Arcade
          </Link>
          
          {/* Interface simplifiée pour le choix de la difficulté */}
          <div className="flex space-x-4 items-center mb-6">
            <span className="text-white">Difficulté:</span>
            <div className="flex space-x-2">
              {['Facile', 'Moyen', 'Difficile'].map((level) => (
                <button
                  key={level}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    difficulty === level
                      ? level === 'Facile' 
                        ? 'bg-blue-600 text-white' 
                        : level === 'Moyen'
                          ? 'bg-amber-600 text-white'
                          : 'bg-red-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                  onClick={() => setDifficulty(level as 'Facile' | 'Moyen' | 'Difficile')}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
          
          {/* Jeu principal */}
          <FirewallDefenseGame 
            difficulty={difficulty}
            onGameEnd={handleGameEnd}
          />
        </div>
      </div>
    </HomeLayout>
  );
}