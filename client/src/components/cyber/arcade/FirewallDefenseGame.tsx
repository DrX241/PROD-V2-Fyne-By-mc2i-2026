import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface FirewallDefenseGameProps {
  difficulty: 'Facile' | 'Moyen' | 'Difficile';
  onGameEnd: (score: number) => void;
}

const FirewallDefenseGame: React.FC<FirewallDefenseGameProps> = ({ difficulty, onGameEnd }) => {
  const [message, setMessage] = useState<string>("Le jeu est en cours de développement et sera disponible prochainement.");
  
  // Simulate a game session that ends after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      // Simulate game end with a random score based on difficulty
      let baseScore = 0;
      switch (difficulty) {
        case 'Facile': baseScore = 500; break;
        case 'Moyen': baseScore = 800; break;
        case 'Difficile': baseScore = 1200; break;
      }
      
      // Add some randomness to the score
      const finalScore = baseScore + Math.floor(Math.random() * 300);
      onGameEnd(finalScore);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [difficulty, onGameEnd]);

  return (
    <div className="w-full h-[calc(100vh-64px)] bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg p-8 max-w-lg w-full text-center">
        <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-4">Module en développement</h2>
        <p className="text-gray-300 mb-8">{message}</p>
        <Button 
          onClick={() => onGameEnd(Math.floor(Math.random() * 1000))}
          className="bg-amber-600 hover:bg-amber-700 text-white"
        >
          Retour
        </Button>
      </div>
    </div>
  );
};

export default FirewallDefenseGame;