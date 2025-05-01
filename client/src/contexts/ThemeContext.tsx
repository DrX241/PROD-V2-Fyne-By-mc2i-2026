import React, { createContext, useContext, useState, useEffect } from 'react';

// Type de thème possible
export type ThemeMode = 'classic' | 'futuristic' | 'dark';

// Interface du contexte
interface ThemeContextType {
  themeMode: ThemeMode;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
}

// Création du contexte avec des valeurs par défaut
const defaultContext: ThemeContextType = {
  themeMode: 'classic',
  toggleTheme: () => {},
  setThemeMode: () => {},
  isDark: false,
};

export const ThemeContext = createContext<ThemeContextType>(defaultContext);

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
    return (savedTheme === 'futuristic' || savedTheme === 'classic' || savedTheme === 'dark') 
      ? savedTheme as ThemeMode
      : 'classic';
  });

  // Sauvegarde le thème dans localStorage quand il change
  useEffect(() => {
    localStorage.setItem('fyne-theme-mode', themeMode);
    console.log("Theme actuel:", themeMode);
  }, [themeMode]);

  // Fonction pour basculer entre les thèmes
  const toggleTheme = () => {
    setThemeMode(prevMode => prevMode === 'classic' ? 'futuristic' : 'classic');
  };

  // Déterminer si le thème est sombre
  const isDark = themeMode === 'futuristic' || themeMode === 'dark';

  console.log("Thème appliqué:", themeMode);

  return (
    <ThemeContext.Provider value={{ themeMode, toggleTheme, setThemeMode, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};