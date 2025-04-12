import React from 'react';
import { CaseData } from './types';

interface OsintGameProps {
  currentCase: CaseData | null;
}

export const OsintGame: React.FC<OsintGameProps> = ({ currentCase }) => {
  // Ce composant sert principalement de container pour le jeu
  // L'implémentation principale est dans le fichier index.tsx
  return (
    <div className="osint-game-container">
      {currentCase ? (
        <div>
          <h3>Enquête: {currentCase.title}</h3>
          <p>{currentCase.description}</p>
        </div>
      ) : (
        <div>Aucune enquête sélectionnée</div>
      )}
    </div>
  );
};