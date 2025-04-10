import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TypewriterProps {
  texts: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  delayAfterTyping?: number;
  delayBeforeDeleting?: number;
  delayBetweenTexts?: number;
  highlightFYNE?: boolean;
}

const Typewriter: React.FC<TypewriterProps> = ({
  texts,
  typingSpeed = 100,
  deletingSpeed = 50,
  delayAfterTyping = 2000,
  delayBeforeDeleting = 500,
  delayBetweenTexts = 1000,
  highlightFYNE = false,
}) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (!isPaused) {
      if (isDeleting) {
        // Supprimer un caractère
        if (currentText.length > 0) {
          timeout = setTimeout(() => {
            setCurrentText((prev) => prev.slice(0, -1));
          }, deletingSpeed);
        } else {
          // Texte complètement supprimé, passer au texte suivant
          setIsDeleting(false);
          setCurrentTextIndex((prevIndex) => (prevIndex + 1) % texts.length);
          timeout = setTimeout(() => {
            setIsPaused(false);
          }, delayBetweenTexts);
          setIsPaused(true);
        }
      } else {
        // Ajouter un caractère
        const targetText = texts[currentTextIndex];
        if (currentText.length < targetText.length) {
          timeout = setTimeout(() => {
            setCurrentText((prev) => targetText.slice(0, prev.length + 1));
          }, typingSpeed);
        } else {
          // Texte complètement écrit, attendre avant de commencer à supprimer
          timeout = setTimeout(() => {
            setIsDeleting(true);
            setIsPaused(false);
          }, delayAfterTyping);
          setIsPaused(true);
        }
      }
    }

    return () => clearTimeout(timeout);
  }, [
    currentText,
    currentTextIndex,
    isDeleting,
    isPaused,
    texts,
    typingSpeed,
    deletingSpeed,
    delayAfterTyping,
    delayBeforeDeleting,
    delayBetweenTexts,
  ]);

  const renderText = () => {
    if (!highlightFYNE || currentTextIndex === 0) {
      return currentText;
    }

    // Cas spécial pour "For Your Next Experience" 
    // Mettre en évidence F Y N E en cyan
    return currentText
      .replace(/^F/, '<span class="text-cyan-300">F</span>')
      .replace(/Your/, '<span class="text-cyan-300">Y</span>our')
      .replace(/Next/, '<span class="text-cyan-300">N</span>ext')
      .replace(/Experience/, '<span class="text-cyan-300">E</span>xperience');
  };

  const formattedText = () => {
    if (currentTextIndex === 0) {
      // Pour "FYNE by mc2i"
      return (
        <span className="text-4xl">
          {currentText.replace(
            /FYNE (by mc2i)/,
            'FYNE <span class="text-xl font-normal opacity-90">$1</span>'
          )}
        </span>
      );
    } else {
      // Pour "For Your Next Experience"
      return (
        <span className="text-2xl">
          {currentText
            .replace(/^F/, '<span class="text-cyan-300">F</span>')
            .replace(/Y/, '<span class="text-cyan-300">Y</span>')
            .replace(/N/, '<span class="text-cyan-300">N</span>')
            .replace(/E/, '<span class="text-cyan-300">E</span>')}
        </span>
      );
    }
  };

  return (
    <div className="relative inline-block whitespace-nowrap">
      <span
        className="inline-block"
        dangerouslySetInnerHTML={{ __html: formattedText() }}
      />
      <motion.span
        className="inline-block w-[3px] h-8 bg-white align-text-top ml-0.5"
        animate={{ opacity: [1, 0] }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      />
    </div>
  );
};

export default Typewriter;