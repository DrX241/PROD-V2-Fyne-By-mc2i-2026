import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type ThemeType = 'classic' | 'space';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  // Récupérer le thème depuis le localStorage ou utiliser 'classic' par défaut
  const [theme, setTheme] = useState<ThemeType>(() => {
    const savedTheme = localStorage.getItem('theme') as ThemeType;
    return savedTheme && ['classic', 'space'].includes(savedTheme) 
      ? savedTheme 
      : 'classic';
  });

  // Appliquer les classes CSS en fonction du thème
  useEffect(() => {
    // Enregistrer le thème dans localStorage pour persister
    localStorage.setItem('theme', theme);
    
    // Afficher le thème dans la console pour le débogage
    console.log('Theme actuel:', theme);
    
    // Appliquer les classes CSS en fonction du thème
    const bodyElement = document.body;
    
    if (theme === 'classic') {
      bodyElement.classList.remove('theme-space');
      bodyElement.classList.add('theme-classic');
    } else {
      bodyElement.classList.remove('theme-classic');
      bodyElement.classList.add('theme-space');
    }
    
    console.log('Thème appliqué:', theme);
  }, [theme]);

  // Fonction pour basculer entre les thèmes
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'classic' ? 'space' : 'classic');
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook personnalisé pour utiliser le contexte de thème
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme doit être utilisé à l'intérieur d'un ThemeProvider");
  }
  return context;
}

// Composant de bouton pour changer de thème
export function ThemeSwitch() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button
      onClick={toggleTheme}
      className="px-3 py-1 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors text-white text-sm"
      aria-label="Changer de thème"
    >
      {theme === 'classic' ? 'Thème Futuriste' : 'Thème Classique'}
    </button>
  );
}