// Ce fichier sert de pont entre les anciens et nouveaux composants
// Il exporte simplement le contexte de thème depuis ThemeContext.tsx

import { useTheme as useThemeContext, ThemeProvider as ThemeContextProvider } from '../contexts/ThemeContext';

// Exporte le hook useTheme
export const useTheme = useThemeContext;

// Exporte le ThemeProvider (pour compatibilité)
export const ThemeProvider = ThemeContextProvider;

// Exporte par défaut le ThemeProvider
export default ThemeContextProvider;