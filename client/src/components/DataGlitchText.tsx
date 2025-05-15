import React, { useEffect, useState } from 'react';

interface DataGlitchTextProps {
  text: string;
  className?: string;
  repeatInterval?: number; // Intervalle de répétition de l'effet en ms
  glitchDuration?: number; // Durée de l'effet de glitch en ms
  intense?: boolean; // Glitch intense ou léger
  binary?: boolean; // Mélanger des caractères binaires
}

const DataGlitchText: React.FC<DataGlitchTextProps> = ({
  text,
  className = '',
  repeatInterval = 5000,
  glitchDuration = 1500,
  intense = false,
  binary = false
}) => {
  const [displayText, setDisplayText] = useState<string>(text);
  const [isGlitching, setIsGlitching] = useState<boolean>(false);

  // Générer un caractère aléatoire, avec possibilité de caractères binaires
  const getRandomChar = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#@$%&*+:;=<>?/|';
    const binaryChars = '01';
    
    if (binary && Math.random() > 0.5) {
      return binaryChars.charAt(Math.floor(Math.random() * binaryChars.length));
    }
    
    return chars.charAt(Math.floor(Math.random() * chars.length));
  };

  // Créer une version brouillée du texte
  const scrambleText = (original: string): string => {
    // Pourcentage de caractères à perturber (plus élevé si 'intense')
    const distortionRate = intense ? 0.4 : 0.2;
    
    return original.split('').map(char => {
      // Ne glitch pas les espaces
      if (char === ' ') return char;
      
      // Déterminer si ce caractère doit être perturbé
      return Math.random() < distortionRate ? getRandomChar() : char;
    }).join('');
  };

  // Effet pour gérer le glitch périodique
  useEffect(() => {
    if (!repeatInterval) return;
    
    // Fonction pour démarrer et gérer un cycle de glitch
    const startGlitchCycle = () => {
      setIsGlitching(true);
      
      // Nombre d'itérations de glitch - plus élevé si 'intense'
      const iterations = intense ? 8 : 4;
      const iterationDelay = glitchDuration / iterations;
      
      // Séquence de glitch
      let glitchCount = 0;
      
      const glitchInterval = setInterval(() => {
        glitchCount++;
        
        if (glitchCount >= iterations) {
          // Fin du cycle de glitch
          clearInterval(glitchInterval);
          setDisplayText(text);
          setIsGlitching(false);
        } else {
          // Pendant le glitch, alterner entre texte brouillé et original
          setDisplayText(glitchCount % 2 === 0 ? text : scrambleText(text));
        }
      }, iterationDelay);
    };
    
    // Démarrer le premier cycle
    const timeout = setTimeout(startGlitchCycle, 1000);
    
    // Configurer des cycles répétés
    const interval = setInterval(() => {
      startGlitchCycle();
    }, repeatInterval);
    
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [text, repeatInterval, glitchDuration, intense]);

  return (
    <span 
      className={`inline-block transition-all 
        ${isGlitching ? 'data-gradient-text' : ''} 
        ${className}`}
      style={{
        textShadow: isGlitching 
          ? '0 0 2px rgba(123, 47, 247, 0.8), 0 0 4px rgba(0, 198, 255, 0.5)' 
          : 'none'
      }}
    >
      {displayText}
    </span>
  );
};

export default DataGlitchText;