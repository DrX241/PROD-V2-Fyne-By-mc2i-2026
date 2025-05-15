import { useState, useEffect } from 'react';

export default function useHighContrastMode() {
  const [highContrastMode, setHighContrastMode] = useState(() => {
    // Récupérer la valeur depuis le localStorage si disponible
    const savedMode = localStorage.getItem('highContrastMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });

  // Sauvegarder dans le localStorage quand la valeur change
  useEffect(() => {
    localStorage.setItem('highContrastMode', JSON.stringify(highContrastMode));
  }, [highContrastMode]);

  // Fonction pour basculer le mode contraste
  const toggleHighContrastMode = () => {
    setHighContrastMode(prevMode => !prevMode);
  };

  return { highContrastMode, toggleHighContrastMode };
}