import React, { useState } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Shield, Trophy } from 'lucide-react';
import HomeLayout from '@/components/layout/HomeLayout';
import PageTitle from '@/components/utils/PageTitle';
import { FirewallDefenseGame } from '@/components/cyber/arcade/firewall-defense';
import { Button } from '@/components/ui/button';

export default function FirewallDefensePage() {
  // Difficulté gardée pour compatibilité mais n'est plus utilisée pour choisir les niveaux
  const [difficulty] = useState<'Facile' | 'Moyen' | 'Difficile'>('Facile');
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
          
          {/* En-tête du jeu avec description de la progression */}
          <div className="mb-6 bg-gray-800/50 rounded-lg p-4 backdrop-blur-sm border border-gray-700">
            <div className="flex items-center mb-2">
              <Shield className="w-5 h-5 text-blue-400 mr-2" />
              <h2 className="text-xl text-white font-bold">Défense en profondeur</h2>
            </div>
            <p className="text-gray-300 text-sm">
              Progressez à travers 10 niveaux de complexité croissante pour maîtriser l'art de la défense en profondeur. 
              Placez vos défenses dans le bon ordre pour créer une protection optimale contre les menaces.
              Chaque niveau réussi débloque le suivant !
            </p>
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