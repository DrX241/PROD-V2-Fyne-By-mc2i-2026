import React, { useEffect } from 'react';
import FyneAnimation from './FyneAnimation';
import { useIntroContext } from '../../contexts/IntroContext';

interface IntroOverlayProps {
  onComplete?: () => void;
}

const IntroOverlay: React.FC<IntroOverlayProps> = ({ onComplete }) => {
  const { showIntro, setShowIntro, setIntroCompleted } = useIntroContext();

  // Quand l'animation est terminée ou quand on clique sur Skip
  const handleAnimationComplete = () => {
    console.log("Animation terminée, passage à l'application principale");
    setShowIntro(false);
    setIntroCompleted(true);
    if (onComplete) {
      onComplete();
    }
  };

  // Pour les tests et le développement - permet de sauter l'intro avec Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleAnimationComplete();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (!showIntro) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <FyneAnimation />
      {/* Bouton skip pour les tests (peut être retiré en production) */}
      <button 
        onClick={handleAnimationComplete}
        className="absolute bottom-4 right-4 text-white/50 text-sm hover:text-white"
      >
        Skip Intro
      </button>
    </div>
  );
};

export default IntroOverlay;