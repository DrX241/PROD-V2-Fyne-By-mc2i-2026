import React from 'react';
import { Skill, calculateLevel, getSkillLevelLabel } from '@shared/types/skills';

interface SkillCardProps {
  skill: Skill;
  showDetail?: boolean;
}

export default function SkillCard({ skill, showDetail = false }: SkillCardProps) {
  const displayLevel = calculateLevel(skill.level);
  const levelLabel = getSkillLevelLabel(displayLevel);

  // Calcul de la largeur de la barre de progression (0-100%)
  const progressWidth = `${skill.level}%`;

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-gray-900/70 to-blue-900/40 rounded-lg shadow-md border border-blue-700/30 backdrop-blur-sm p-4 transition-all duration-300 hover:shadow-lg hover:shadow-blue-900/20 group">
      {/* Icône de la compétence */}
      <div className="flex items-center mb-3">
        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${skill.color.replace('text-', 'bg-').replace('-600', '-100')} ${skill.color} mr-3`}>
          <i className={`${skill.icon} text-lg`}></i>
        </div>
        <div>
          <h3 className="font-medium text-blue-100">{skill.name}</h3>
          <div className="text-xs text-blue-300/70">{levelLabel}</div>
        </div>
      </div>

      {/* Barre de progression */}
      <div className="h-2 bg-gray-800/50 rounded-full mb-2 overflow-hidden">
        <div 
          className={`h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500 ease-out`}
          style={{ width: progressWidth }}
        ></div>
      </div>

      {/* Points d'expérience */}
      <div className="flex justify-between items-center text-xs text-blue-400/70">
        <span>Progression</span>
        <span>{skill.level}/100 XP</span>
      </div>

      {/* Description complète (conditionnelle) */}
      {showDetail && (
        <div className="mt-3 text-sm text-blue-200/80">
          <p>{skill.description}</p>
        </div>
      )}

      {/* Effet de lueur sur survol */}
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/0 to-indigo-500/0 opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
    </div>
  );
}