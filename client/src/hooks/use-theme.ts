import { useState, useEffect } from 'react';

type Theme = 'futuristic' | 'high-contrast';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('futuristic');

  useEffect(() => {
    // Récupérer le thème du localStorage s'il existe
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme && (savedTheme === 'futuristic' || savedTheme === 'high-contrast')) {
      setThemeState(savedTheme);
      console.log("Theme actuel:", savedTheme);
    }
  }, []);

  // Fonction pour changer le thème
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    console.log("Thème appliqué:", newTheme);
  };

  return { theme, setTheme };
}