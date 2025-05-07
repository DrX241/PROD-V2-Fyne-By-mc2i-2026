import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, AlertTriangle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface CountdownTimerProps {
  seconds: number;
  totalSeconds?: number;
  onTimeUp?: () => void;
  className?: string;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({
  seconds,
  totalSeconds = 900, // 15 minutes par défaut
  onTimeUp,
  className = ""
}) => {
  // État pour les moments de transition d'animation
  const [isAnimating, setIsAnimating] = useState(false);
  const [lastSeconds, setLastSeconds] = useState(seconds);
  
  // Déterminer la couleur en fonction du temps restant
  const getColorClass = () => {
    const percentLeft = (seconds / totalSeconds) * 100;
    if (percentLeft > 50) return 'text-green-500';
    if (percentLeft > 25) return 'text-yellow-500';
    return 'text-red-500';
  };

  // Récupérer la classe de couleur pour la barre de progression
  const getProgressColor = () => {
    const percentLeft = (seconds / totalSeconds) * 100;
    if (percentLeft > 50) return 'bg-gradient-to-r from-green-600 to-green-400';
    if (percentLeft > 25) return 'bg-gradient-to-r from-yellow-600 to-yellow-400';
    return 'bg-gradient-to-r from-red-700 to-red-500';
  };

  // Formater le temps en minutes:secondes
  const formatTime = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const remainingSeconds = secs % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  // Effet pour animer lors du changement de temps
  useEffect(() => {
    // Si le temps a changé et que nous ne sommes pas déjà en animation
    if (seconds !== lastSeconds && !isAnimating) {
      setIsAnimating(true);
      
      // Reset l'animation après un délai
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setLastSeconds(seconds);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [seconds, lastSeconds, isAnimating]);

  // Effet pour appeler le callback onTimeUp quand le temps est écoulé
  useEffect(() => {
    if (seconds <= 0 && onTimeUp) {
      onTimeUp();
    }
  }, [seconds, onTimeUp]);

  // Calculer le pourcentage de temps restant
  const percentRemaining = (seconds / totalSeconds) * 100;
  
  // Variantes d'animation pour les transitions de temps
  const timeVariants = {
    initial: { scale: 1 },
    animate: { 
      scale: [1, 1.15, 1],
      transition: { duration: 0.3 }
    }
  };

  return (
    <div className={`${className}`}>
      <div className="flex flex-col space-y-2">
        {/* Affichage principal du temps */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center">
            <Clock className={`mr-2 h-5 w-5 ${getColorClass()}`} />
            <motion.div
              variants={timeVariants}
              initial="initial"
              animate={isAnimating ? "animate" : "initial"}
              className={`font-mono font-bold text-xl ${getColorClass()}`}
            >
              {formatTime(seconds)}
            </motion.div>
          </div>
          
          {/* Badge d'alerte si moins d'une minute */}
          <AnimatePresence>
            {seconds < 60 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center bg-red-900/30 text-red-400 text-xs px-2 py-0.5 rounded-full"
              >
                <AlertTriangle className="h-3 w-3 mr-1" />
                Urgence
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Barre de progression */}
        <div className="relative">
          <Progress
            value={percentRemaining}
            className="h-2 bg-gray-800"
            indicatorClassName={getProgressColor()}
          />
          
          {/* Pulsation pour les 10 dernières secondes */}
          {seconds <= 10 && (
            <motion.div
              className="absolute inset-0 bg-red-500 rounded-full"
              animate={{ 
                opacity: [0.1, 0.3, 0.1],
                scale: [1, 1.05, 1]
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                repeatType: "loop"
              }}
            />
          )}
        </div>
        
        {/* Texte d'info sur le temps restant */}
        <div className="text-xs text-center">
          {percentRemaining > 50 ? (
            <span className="text-green-400">Temps suffisant</span>
          ) : percentRemaining > 25 ? (
            <span className="text-yellow-400">Soyez efficace</span>
          ) : (
            <span className="text-red-400">Temps critique</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;