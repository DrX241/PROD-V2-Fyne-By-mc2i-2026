import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface CyberButtonProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'glowing';
  size?: 'sm' | 'md' | 'lg';
  withGlitch?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  glowIntensity?: 'low' | 'medium' | 'high';
}

const CyberButton: React.FC<CyberButtonProps> = ({
  children,
  onClick,
  className = '',
  variant = 'primary',
  size = 'md',
  withGlitch = true,
  disabled = false,
  type = 'button',
  glowIntensity = 'medium'
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isGlitching, setIsGlitching] = useState(false);

  // Variantes de couleur
  const colorVariants = {
    primary: {
      bg: 'bg-transparent',
      text: 'text-cyan-400',
      border: 'border-cyan-500',
      glow: '0 0 5px rgba(0, 255, 255, 0.7), 0 0 10px rgba(0, 255, 255, 0.5)',
      hoverGlow: '0 0 10px rgba(0, 255, 255, 0.8), 0 0 20px rgba(0, 255, 255, 0.6), 0 0 30px rgba(0, 255, 255, 0.4)'
    },
    secondary: {
      bg: 'bg-transparent',
      text: 'text-purple-400',
      border: 'border-purple-500',
      glow: '0 0 5px rgba(168, 85, 247, 0.7), 0 0 10px rgba(168, 85, 247, 0.5)',
      hoverGlow: '0 0 10px rgba(168, 85, 247, 0.8), 0 0 20px rgba(168, 85, 247, 0.6), 0 0 30px rgba(168, 85, 247, 0.4)'
    },
    danger: {
      bg: 'bg-transparent',
      text: 'text-red-400',
      border: 'border-red-500',
      glow: '0 0 5px rgba(239, 68, 68, 0.7), 0 0 10px rgba(239, 68, 68, 0.5)',
      hoverGlow: '0 0 10px rgba(239, 68, 68, 0.8), 0 0 20px rgba(239, 68, 68, 0.6), 0 0 30px rgba(239, 68, 68, 0.4)'
    },
    glowing: {
      bg: 'bg-gradient-to-r from-blue-600 to-indigo-800',
      text: 'text-white',
      border: 'border-blue-400',
      glow: '0 0 10px rgba(37, 99, 235, 0.8), 0 0 20px rgba(37, 99, 235, 0.6)',
      hoverGlow: '0 0 15px rgba(37, 99, 235, 0.9), 0 0 30px rgba(37, 99, 235, 0.7), 0 0 45px rgba(37, 99, 235, 0.5)'
    }
  };

  // Variantes de taille
  const sizeVariants = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-5 py-2 text-base',
    lg: 'px-7 py-3 text-lg'
  };

  // Intensité du glow
  const glowStyles = {
    low: { filter: 'brightness(0.9)' },
    medium: { filter: 'brightness(1)' },
    high: { filter: 'brightness(1.1)' }
  };

  // Variantes pour l'animation du border
  const borderVariants = {
    default: {
      pathLength: 0,
      opacity: 1
    },
    hover: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { type: "spring", duration: 1.5, bounce: 0 },
        opacity: { duration: 0.5 }
      }
    }
  };

  // Animation de glitch aléatoire
  const triggerRandomGlitch = () => {
    if (withGlitch && Math.random() > 0.7) {
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 200);
    }
  };

  const colorVariant = colorVariants[variant];
  
  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => {
        setIsHovered(true);
        triggerRandomGlitch();
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        triggerRandomGlitch();
      }}
      className={`
        relative overflow-hidden font-cyber-accent
        ${colorVariant.bg} ${colorVariant.text} 
        ${sizeVariants[size]} border ${colorVariant.border}
        tracking-wider uppercase ${className}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      style={{
        boxShadow: isHovered ? colorVariant.hoverGlow : colorVariant.glow,
        ...glowStyles[glowIntensity],
        transition: 'all 0.3s ease'
      }}
      whileTap={{ scale: 0.98 }}
      animate={isGlitching ? {
        x: [0, -3, 3, -2, 0],
        y: [0, 2, -1, 1, 0],
        transition: { duration: 0.2 }
      } : {}}
    >
      {/* Effet de scan horizontal */}
      {isHovered && (
        <motion.div
          className={`absolute top-0 left-0 h-full opacity-20`}
          style={{ 
            width: '5px',
            backgroundColor: variant === 'primary' ? '#0ff' : 
                            variant === 'secondary' ? '#a855f7' : 
                            variant === 'glowing' ? '#3b82f6' : '#ef4444'
          }}
          animate={{
            x: ['-100%', '500%'],
            transition: {
              repeat: Infinity,
              duration: 1,
              ease: 'linear'
            }
          }}
        />
      )}
      
      {/* Bordure animée */}
      <div className="absolute inset-0">
        <svg
          className="absolute inset-0 w-full h-full"
          style={{ 
            filter: `drop-shadow(0 0 2px ${
              variant === 'primary' ? '#0ff' : 
              variant === 'secondary' ? '#a855f7' : 
              variant === 'glowing' ? '#3b82f6' : '#ef4444'
            })` 
          }}
        >
          <motion.rect
            width="100%"
            height="100%"
            fill="none"
            stroke={
              variant === 'primary' ? '#0ff' : 
              variant === 'secondary' ? '#a855f7' : 
              variant === 'glowing' ? '#3b82f6' : '#ef4444'
            }
            strokeWidth="2"
            strokeDasharray="0 1"
            initial="default"
            animate={isHovered ? "hover" : "default"}
            variants={borderVariants}
          />
        </svg>
      </div>

      {/* Ligne horizontale au centre pendant le hover */}
      {isHovered && (
        <div className="absolute left-0 w-full h-px" style={{ 
          top: '50%', 
          backgroundColor: variant === 'primary' ? '#0ff' : 
                          variant === 'secondary' ? '#a855f7' : 
                          variant === 'glowing' ? '#3b82f6' : '#ef4444',
          boxShadow: `0 0 5px ${
            variant === 'primary' ? '#0ff' : 
            variant === 'secondary' ? '#a855f7' : 
            variant === 'glowing' ? '#3b82f6' : '#ef4444'
          }`
        }} />
      )}

      {/* Contenu du bouton */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.button>
  );
};

export default CyberButton;