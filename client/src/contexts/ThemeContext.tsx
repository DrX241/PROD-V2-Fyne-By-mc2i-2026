import React, { createContext, useContext, useState, useEffect } from 'react';

// Type de thème possible
export type ThemeMode = 'classic' | 'futuristic';

// Interface du contexte
interface ThemeContextType {
  themeMode: ThemeMode;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

// Création du contexte avec des valeurs par défaut
export const ThemeContext = createContext<ThemeContextType>({
  themeMode: 'classic',
  toggleTheme: () => {},
  setThemeMode: () => {},
});

// Hook personnalisé pour utiliser le contexte - exporté comme fonction nommée pour éviter des problèmes avec Fast Refresh
export function useTheme() {
  return useContext(ThemeContext);
}

// Provider qui fournit le contexte aux composants enfants
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialisation avec le thème stocké dans localStorage ou 'classic' par défaut
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    // Récupère le thème depuis localStorage ou 'classic' par défaut
    const savedTheme = localStorage.getItem('fyne-theme-mode');
    return (savedTheme === 'futuristic' || savedTheme === 'classic') 
      ? savedTheme 
      : 'classic';
  });

  // Sauvegarde le thème dans localStorage quand il change
  useEffect(() => {
    localStorage.setItem('fyne-theme-mode', themeMode);
  }, [themeMode]);

  // Fonction pour basculer entre les thèmes
  const toggleTheme = () => {
    setThemeMode(prevMode => prevMode === 'classic' ? 'futuristic' : 'classic');
  };

  return (
    <ThemeContext.Provider value={{ themeMode, toggleTheme, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};