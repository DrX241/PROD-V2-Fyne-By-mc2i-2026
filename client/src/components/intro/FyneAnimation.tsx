import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIntroContext } from '../../contexts/IntroContext';

const FyneAnimation = () => {
  const { setShowIntro, setIntroCompleted } = useIntroContext();
  const [stage, setStage] = useState(0);
  const [complete, setComplete] = useState(false);
  const [typedSlogan, setTypedSlogan] = useState('');
  const [showFinalMessage, setShowFinalMessage] = useState(false);
  const [finalMessage, setFinalMessage] = useState('');
  
  const fullSlogan = "Feel Your Next Experience";
  
  const fyneColors = {
    F: "#006a9e", // Pantone 7469C - Notre bleu principal
    Y: "#006a9e", // Variante du bleu (on pourrait utiliser une teinte légèrement différente)
    N: "#006a9e", // Variante du bleu (on pourrait utiliser une teinte légèrement différente)
    E: "#006a9e", // Variante du bleu (on pourrait utiliser une teinte légèrement différente)
  };
  
  // Fonction pour colorer les lettres F, Y, N, E dans le slogan
  const colorizeSlogan = (text: string) => {
    return text.split('').map((char, index) => {
      const upperChar = char.toUpperCase();
      // Si c'est une des lettres FYNE, on lui applique sa couleur spécifique
      if (upperChar === 'F' && index === 0) {
        return <span key={index} style={{ color: fyneColors.F }}>{char}</span>;
      } else if (upperChar === 'Y' && index === 5) {
        return <span key={index} style={{ color: fyneColors.Y }}>{char}</span>;
      } else if (upperChar === 'N' && index === 10) {
        return <span key={index} style={{ color: fyneColors.N }}>{char}</span>;
      } else if (upperChar === 'E' && index === 15) {
        return <span key={index} style={{ color: fyneColors.E }}>{char}</span>;
      }
      // Sinon, on l'affiche normalement
      return <span key={index}>{char}</span>;
    });
  };

  // Effet pour gérer la séquence des animations
  useEffect(() => {
    if (stage === 0) {
      // Démarre l'animation après un court délai
      const timer = setTimeout(() => setStage(1), 500);
      return () => clearTimeout(timer);
    } 
    else if (stage === 1) {
      // Animation des lettres FYNE terminée, commencer à taper le slogan
      const timer = setTimeout(() => setStage(2), 2000);
      return () => clearTimeout(timer);
    }
    else if (stage === 2) {
      // Animation du slogan qui s'écrit lettre par lettre
      if (typedSlogan.length < fullSlogan.length) {
        const timer = setTimeout(() => {
          setTypedSlogan(fullSlogan.substring(0, typedSlogan.length + 1));
        }, 100);
        return () => clearTimeout(timer);
      } else {
        // Slogan complètement écrit, attendre un peu avant la prochaine étape
        const timer = setTimeout(() => setStage(3), 1000);
        return () => clearTimeout(timer);
      }
    }
    else if (stage === 3) {
      // Faire disparaître le slogan
      const timer = setTimeout(() => {
        setStage(4);
      }, 1000);
      return () => clearTimeout(timer);
    }
    else if (stage === 4) {
      // Afficher la phrase finale
      setShowFinalMessage(true);
      // Simuler l'écriture de la phrase finale
      const finalMessages = [
        "Choose your path.",
        "Simulation starts now."
      ];
      let currentMessage = 0;
      let charIndex = 0;
      
      const typeMessage = () => {
        if (currentMessage < finalMessages.length) {
          if (charIndex === 0) {
            setFinalMessage('');
          }
          
          if (charIndex < finalMessages[currentMessage].length) {
            setFinalMessage(prev => prev + finalMessages[currentMessage][charIndex]);
            charIndex++;
            setTimeout(typeMessage, 100);
          } else {
            // Message complètement écrit, passer au suivant après une pause
            setTimeout(() => {
              currentMessage++;
              charIndex = 0;
              if (currentMessage < finalMessages.length) {
                typeMessage();
              } else {
                // Tous les messages ont été affichés, terminer la séquence
                setTimeout(() => {
                  setComplete(true);
                  // Terminer l'animation et permettre l'affichage de l'application
                  setShowIntro(false);
                  setIntroCompleted(true);
                }, 1500);
              }
            }, 1000);
          }
        }
      };
      
      typeMessage();
      
      // Définir un timeout pour passer à l'état complet après un certain temps (avec une durée plus courte pour les tests)
      const timer = setTimeout(() => {
        setComplete(true);
        // Terminer l'animation et permettre l'affichage de l'application
        setShowIntro(false);
        setIntroCompleted(true);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [stage, typedSlogan, setShowIntro, setIntroCompleted]);

  // Variants pour les animations Framer Motion
  const letterVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: custom * 0.4,
        duration: 0.8,
        ease: "easeOut"
      }
    })
  };

  const sloganVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.3 
      }
    },
    exit: { 
      opacity: 0,
      transition: { 
        duration: 0.5 
      }
    }
  };

  if (complete) {
    return null; // Ne rien afficher quand l'animation est terminée
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-90">
      <div className="text-center">
        {/* Animation du nom FYNE */}
        <div className="mb-6">
          <div className="flex justify-center items-center space-x-2 md:space-x-4 text-4xl md:text-6xl font-bold">
            {['F', 'Y', 'N', 'E'].map((letter, index) => (
              <motion.div
                key={letter}
                custom={index}
                initial="hidden"
                animate={stage >= 1 ? "visible" : "hidden"}
                variants={letterVariants}
                style={{ color: fyneColors[letter as keyof typeof fyneColors] }}
                className="inline-block relative"
              >
                {letter}
                <div
                  className="absolute inset-0 bg-white rounded-full filter blur-lg opacity-20 animate-pulse"
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Animation du slogan */}
        <AnimatePresence>
          {stage >= 2 && stage < 4 && (
            <motion.div
              className="text-xl md:text-2xl text-white font-light tracking-wider"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={sloganVariants}
            >
              {colorizeSlogan(typedSlogan)}
              <span className="animate-pulse">|</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Phrase finale */}
        <AnimatePresence>
          {showFinalMessage && (
            <motion.div
              className="text-xl md:text-3xl text-white font-medium mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {finalMessage}
              <span className="animate-pulse">|</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FyneAnimation;