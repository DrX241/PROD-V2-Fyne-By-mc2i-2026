import React from 'react';
import { motion } from 'framer-motion';
import { Skill, calculateLevel, getSkillLevelLabel } from '@shared/types/skills';

interface SkillProgressIndicatorProps {
  skill: Skill;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animate?: boolean;
}

export default function SkillProgressIndicator({ 
  skill, 
  size = 'md', 
  showLabel = true,
  animate = true 
}: SkillProgressIndicatorProps) {
  const level = calculateLevel(skill.level);
  const levelLabel = getSkillLevelLabel(level);
  
  // Déterminer la taille en fonction du paramètre
  const dimensions = {
    sm: { size: 60, thickness: 4, fontSize: 'text-sm', iconSize: 'text-base' },
    md: { size: 80, thickness: 6, fontSize: 'text-base', iconSize: 'text-xl' },
    lg: { size: 120, thickness: 8, fontSize: 'text-lg', iconSize: 'text-2xl' }
  };
  
  const { size: circleSize, thickness, fontSize, iconSize } = dimensions[size];
  
  // Calculs pour l'affichage du cercle de progression
  const radius = (circleSize - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (skill.level / 100) * circumference;
  
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: circleSize, height: circleSize }}>
        {/* Cercle de fond */}
        <svg className="w-full h-full" viewBox={`0 0 ${circleSize} ${circleSize}`}>
          <circle 
            cx={circleSize / 2} 
            cy={circleSize / 2} 
            r={radius}
            strokeWidth={thickness}
            className="fill-none stroke-gray-700/40"
          />
        </svg>
        
        {/* Cercle de progression */}
        <svg 
          className="absolute top-0 left-0 -rotate-90 w-full h-full" 
          viewBox={`0 0 ${circleSize} ${circleSize}`}
        >
          <motion.circle 
            cx={circleSize / 2} 
            cy={circleSize / 2} 
            r={radius}
            strokeWidth={thickness}
            strokeLinecap="round"
            className={`fill-none ${skill.color.replace('text-', 'stroke-')}`}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: animate ? offset : circumference }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            strokeDasharray={circumference}
          />
        </svg>
        
        {/* Icône centrale */}
        <div className="absolute inset-0 flex items-center justify-center">
          <i className={`${skill.icon} ${iconSize} ${skill.color}`}></i>
        </div>
      </div>
      
      {/* Label de compétence */}
      {showLabel && (
        <div className="mt-2 text-center">
          <div className={`${fontSize} font-medium text-blue-100`}>{skill.name}</div>
          <div className="text-xs text-blue-300/70">{levelLabel}</div>
        </div>
      )}
    </div>
  );
}