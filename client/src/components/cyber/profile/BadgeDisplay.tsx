import React from 'react';
import { BadgeAchievement } from '@shared/types/skills';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface BadgeDisplayProps {
  badge: BadgeAchievement;
  size?: 'sm' | 'md' | 'lg';
}

export default function BadgeDisplay({ badge, size = 'md' }: BadgeDisplayProps) {
  // Formatage de la date d'acquisition
  const formattedDate = format(new Date(badge.acquiredAt), 'dd MMMM yyyy', { locale: fr });
  
  // Tailles basées sur la prop size
  const sizeClasses = {
    sm: {
      container: 'w-16 h-16',
      icon: 'text-xl',
      name: 'text-xs',
      date: 'text-[10px]'
    },
    md: {
      container: 'w-24 h-24',
      icon: 'text-3xl',
      name: 'text-sm',
      date: 'text-xs'
    },
    lg: {
      container: 'w-32 h-32',
      icon: 'text-4xl',
      name: 'text-base',
      date: 'text-sm'
    }
  };
  
  return (
    <div className="group relative">
      {/* Badge visuel */}
      <div 
        className={`${sizeClasses[size].container} ${badge.backgroundColor} rounded-full flex flex-col items-center justify-center p-2 shadow-md border border-white/20 transition-all duration-300 group-hover:shadow-lg group-hover:scale-105`}
      >
        <i className={`${badge.icon} ${badge.iconColor} ${sizeClasses[size].icon} mb-1`}></i>
        <div className={`${sizeClasses[size].name} font-medium text-center line-clamp-1 ${badge.iconColor.replace('text-', 'text-')}`}>
          {badge.name}
        </div>
      </div>
      
      {/* Info-bulle détaillée au survol */}
      <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-gray-900 text-white rounded-lg p-3 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <h4 className="font-bold text-sm mb-1">{badge.name}</h4>
        <p className="text-xs text-gray-300 mb-2">{badge.description}</p>
        <div className="text-[10px] text-gray-400">Obtenu le {formattedDate}</div>
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
      </div>
    </div>
  );
}