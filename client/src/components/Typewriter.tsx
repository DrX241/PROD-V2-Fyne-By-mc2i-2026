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

  const formattedText = () => {
    if (currentTextIndex % 12 === 0) {
      // Pour "FYNE by mc2i"
      return currentText.replace(
        /FYNE (by mc2i)/,
        'FYNE <span class="text-xl font-normal opacity-90">$1</span>'
      );
    } else {
      // Pour tous les autres textes avec mise en évidence de F, Y, N, E
      let formattedText = currentText;
      
      if (highlightFYNE) {
        // Pour les slogans qui débutent par For Your Next Experience
        if (formattedText.startsWith('For Your Next')) {
          formattedText = formattedText
            .replace(/^F/, '<span class="text-cyan-300">F</span>')
            .replace(/Y/, '<span class="text-cyan-300">Y</span>')
            .replace(/N/, '<span class="text-cyan-300">N</span>')
            .replace(/E/, '<span class="text-cyan-300">E</span>');
        }
        
        // Pour les autres mots qui contiennent F, Y, N, E (en première lettre ou ailleurs)
        else {
          formattedText = formattedText
            .replace(/\bF/, '<span class="text-cyan-300">F</span>')
            .replace(/\bY/, '<span class="text-cyan-300">Y</span>')
            .replace(/\bN/, '<span class="text-cyan-300">N</span>')
            .replace(/\bE/, '<span class="text-cyan-300">E</span>');
        }
      }
      
      return formattedText;
    }
  };

  return (
    <span
      dangerouslySetInnerHTML={{ __html: currentTextIndex % 12 === 0 ? 
        `<span class="text-4xl">${formattedText()}</span>` : 
        `<span class="text-2xl">${formattedText()}</span>` 
      }}
      className="inline-block"
    />
  );
};

export default Typewriter;