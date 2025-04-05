import React, { createContext, useContext, useState, useEffect } from 'react';

interface IntroContextType {
  showIntro: boolean;
  setShowIntro: React.Dispatch<React.SetStateAction<boolean>>;
  introCompleted: boolean;
  setIntroCompleted: React.Dispatch<React.SetStateAction<boolean>>;
}

const defaultContext: IntroContextType = {
  showIntro: true,
  setShowIntro: () => {},
  introCompleted: false,
  setIntroCompleted: () => {},
};

const IntroContext = createContext<IntroContextType>(defaultContext);

export const useIntroContext = () => useContext(IntroContext);

export const IntroProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Vérifier si l'animation a déjà été vue en utilisant localStorage
  const [showIntro, setShowIntro] = useState(() => {
    // Par défaut, on affiche l'intro sauf si elle a déjà été vue
    const hasSeenIntro = localStorage.getItem('fyneIntroCompleted') === 'true';
    return !hasSeenIntro;
  });
  
  const [introCompleted, setIntroCompleted] = useState(() => {
    return localStorage.getItem('fyneIntroCompleted') === 'true';
  });

  // Mettre à jour localStorage quand l'intro est complétée
  useEffect(() => {
    if (introCompleted) {
      localStorage.setItem('fyneIntroCompleted', 'true');
    }
  }, [introCompleted]);

  return (
    <IntroContext.Provider value={{ showIntro, setShowIntro, introCompleted, setIntroCompleted }}>
      {children}
    </IntroContext.Provider>
  );
};

export default IntroContext;