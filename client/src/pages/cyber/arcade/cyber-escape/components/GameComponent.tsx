import React, { useEffect, useRef } from 'react';
import { CyberEscapeGame } from '../game';

interface GameComponentProps {
  level: number;
  onGameInit: (gameInstance: any) => void;
}

export const GameComponent: React.FC<GameComponentProps> = ({ level, onGameInit }) => {
  const gameInstanceRef = useRef<CyberEscapeGame | null>(null);

  useEffect(() => {
    // Nettoyer le jeu précédent si existant
    if (gameInstanceRef.current) {
      gameInstanceRef.current.destroy();
      gameInstanceRef.current = null;
    }

    // Créer une nouvelle instance du jeu
    const game = new CyberEscapeGame(level, (gameInstance) => {
      gameInstanceRef.current = gameInstance;
      onGameInit(gameInstance);
    });

    // Nettoyage à la destruction du composant
    return () => {
      if (gameInstanceRef.current) {
        gameInstanceRef.current.destroy();
        gameInstanceRef.current = null;
      }
    };
  }, [level, onGameInit]);

  return <div id="game-container" className="w-full h-[600px] bg-blue-900/50 rounded-lg overflow-hidden"></div>;
};

export default GameComponent;