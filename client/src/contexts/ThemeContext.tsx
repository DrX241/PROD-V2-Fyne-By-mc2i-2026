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
  // Toujours utiliser le thème futuriste
  const [themeMode, setThemeMode] = useState<ThemeMode>('futuristic');

  // Sauvegarde le thème dans localStorage (toujours futuriste)
  useEffect(() => {
    localStorage.setItem('fyne-theme-mode', 'futuristic');
    console.log("Theme actuel:", themeMode);
  }, [themeMode]);

  // Fonction pour basculer entre les thèmes (désactivée)
  const toggleTheme = () => {
    // Ne fait rien, on garde toujours le thème futuriste
    console.log("Tentative de changement de thème ignorée, mode futuriste forcé");
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