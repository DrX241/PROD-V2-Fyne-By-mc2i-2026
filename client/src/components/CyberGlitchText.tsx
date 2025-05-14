import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface GlitchTextProps {
  text: string;
  className?: string;
  glitchIntensity?: 'low' | 'medium' | 'high';
  color?: string;
  highlightColor?: string;
  textSize?: string;
  delay?: number;
}

const CyberGlitchText: React.FC<GlitchTextProps> = ({
  text,
  className = '',
  glitchIntensity = 'medium',
  color = 'text-cyan-300',
  highlightColor = 'text-pink-500',
  textSize = 'text-4xl',
  delay = 0
}) => {
  const [glitching, setGlitching] = useState(false);
  
  // Déterminer la fréquence de glitch en fonction de l'intensité
  const getGlitchInterval = () => {
    switch (glitchIntensity) {
      case 'low': return Math.random() * 8000 + 5000; // 5-13s
      case 'high': return Math.random() * 2000 + 1000; // 1-3s
      case 'medium':
      default: return Math.random() * 5000 + 2000; // 2-7s
    }
  };
  
  // Déterminer la durée du glitch en fonction de l'intensité
  const getGlitchDuration = () => {
    switch (glitchIntensity) {
      case 'low': return 100;
      case 'high': return 300;
      case 'medium':
      default: return 200;
    }
  };

  useEffect(() => {
    // Démarrer après le délai initial
    const initialTimeout = setTimeout(() => {
      const startGlitching = () => {
        setGlitching(true);
        
        setTimeout(() => {
          setGlitching(false);
          
          // Planifier le prochain glitch
          setTimeout(startGlitching, getGlitchInterval());
        }, getGlitchDuration());
      };
      
      startGlitching();
    }, delay);
    
    return () => clearTimeout(initialTimeout);
  }, [delay, glitchIntensity]);

  const letterVariants = {
    initial: { opacity: 1, y: 0, x: 0 },
    glitch: () => ({
      opacity: [1, 0.8, 1, 0.9, 1],
      y: [0, -3, 2, -1, 0],
      x: [0, 2, -1, 1, 0],
      transition: { 
        duration: 0.3, 
        times: [0, 0.25, 0.5, 0.75, 1] 
      }
    })
  };

  const renderText = () => {
    return text.split('').map((letter, index) => (
      <motion.span
        key={index}
        variants={letterVariants}
        animate={glitching && Math.random() > 0.7 ? 'glitch' : 'initial'}
        className={`inline-block ${Math.random() > 0.9 && glitching ? highlightColor : color}`}
        style={{
          textShadow: glitching 
            ? `0 0 5px #0ff, 0 0 10px #0ff, 0 0 15px #0ff, 0 0 20px #0ff` 
            : 'none'
        }}
      >
        {glitching && Math.random() > 0.85 
          ? String.fromCharCode(Math.floor(Math.random() * 26) + 65) 
          : letter}
      </motion.span>
    ));
  };

  return (
    <div className={`font-cyber-accent ${textSize} tracking-wider ${className}`} style={{
      position: 'relative',
      overflow: 'hidden'
    }}>
      {renderText()}
      {glitching && (
        <>
          <div className="absolute top-0 left-0 w-full h-full bg-cyan-500 opacity-5 mix-blend-overlay" 
               style={{ clipPath: 'polygon(0 25%, 100% 25%, 100% 30%, 0 30%)' }} />
          <div className="absolute top-0 left-0 w-full h-full bg-pink-500 opacity-5 mix-blend-overlay" 
               style={{ clipPath: 'polygon(0 45%, 100% 45%, 100% 50%, 0 50%)' }} />
          <div className="absolute top-0 left-0 w-full h-full bg-blue-500 opacity-5 mix-blend-overlay" 
               style={{ clipPath: 'polygon(0 65%, 100% 65%, 100% 70%, 0 70%)' }} />
        </>
      )}
    </div>
  );
};

export default CyberGlitchText;