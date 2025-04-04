import React from 'react';
import { Award, Star, TrendingUp, BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSkills } from '@/contexts/SkillsContext';

interface SkillsOverviewProps {
  className?: string;
}

type SkillCategory = 'technical' | 'operational' | 'governance' | 'strategic';

const SkillsOverview: React.FC<SkillsOverviewProps> = ({ className = '' }) => {
  const { skills, badges } = useSkills();
  
  // Exemple de données de compétences
  const sampleSkills = [
    { id: 'skill1', name: 'Réponse aux incidents', level: 72, category: 'technical' as SkillCategory, history: [60, 65, 72] },
    { id: 'skill2', name: 'Analyse forensique', level: 45, category: 'technical' as SkillCategory, history: [25, 35, 45] },
    { id: 'skill3', name: 'Gestion de crise', level: 63, category: 'operational' as SkillCategory, history: [50, 58, 63] },
    { id: 'skill4', name: 'Évaluation des risques', level: 58, category: 'governance' as SkillCategory, history: [40, 52, 58] },
    { id: 'skill5', name: 'Communication', level: 81, category: 'operational' as SkillCategory, history: [70, 75, 81] },
    { id: 'skill6', name: 'Planification stratégique', level: 36, category: 'strategic' as SkillCategory, history: [20, 30, 36] }
  ];
  
  // Exemple de badges
  const sampleBadges = [
    { id: 'badge1', name: 'Gestion d\'incident', icon: 'Shield', unlocked: true, date: '2025-03-15' },
    { id: 'badge2', name: 'Analyse de menaces', icon: 'Search', unlocked: true, date: '2025-03-10' },
    { id: 'badge3', name: 'Expert en conformité', icon: 'CheckSquare', unlocked: false, progress: 70 },
    { id: 'badge4', name: 'Leadership en crise', icon: 'Users', unlocked: false, progress: 45 }
  ];
  
  const getCategoryIcon = (category: SkillCategory) => {
    switch(category) {
      case 'technical': 
        return <Star className="w-4 h-4 text-blue-400" />;
      case 'operational': 
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'strategic': 
        return <Award className="w-4 h-4 text-purple-400" />;
      case 'governance': 
        return <BadgeCheck className="w-4 h-4 text-amber-400" />;
      default: 
        return <Star className="w-4 h-4 text-blue-400" />;
    }
  };
  
  const getCategoryColor = (category: SkillCategory) => {
    switch(category) {
      case 'technical': return 'bg-gradient-to-r from-blue-600/20 to-blue-800/20 border-blue-500/30';
      case 'operational': return 'bg-gradient-to-r from-green-600/20 to-green-800/20 border-green-500/30';
      case 'strategic': return 'bg-gradient-to-r from-purple-600/20 to-purple-800/20 border-purple-500/30';
      case 'governance': return 'bg-gradient-to-r from-amber-600/20 to-amber-800/20 border-amber-500/30';
      default: return 'bg-gradient-to-r from-gray-600/20 to-gray-800/20 border-gray-500/30';
    }
  };
  
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Graphique radar des compétences - Simulé */}
      <div className="bg-gray-900/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-blue-900/30">
        <h3 className="text-xl font-semibold text-blue-100 mb-4">Vue d'ensemble des compétences</h3>
        
        <div className="flex flex-col space-y-6">
          {sampleSkills.map(skill => (
            <div 
              key={skill.id} 
              className={`p-4 rounded-lg border ${getCategoryColor(skill.category)}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  {getCategoryIcon(skill.category)}
                  <span className="ml-2 text-white font-medium">{skill.name}</span>
                </div>
                <span className="text-lg font-bold text-white">{skill.level}%</span>
              </div>
              
              <div className="w-full bg-gray-700/50 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full ${
                    skill.category === 'technical' ? 'bg-blue-500' :
                    skill.category === 'operational' ? 'bg-green-500' :
                    skill.category === 'strategic' ? 'bg-purple-500' :
                    'bg-amber-500'
                  }`}
                  style={{ width: `${skill.level}%` }}
                ></div>
              </div>
              
              <div className="mt-2 flex items-center text-xs">
                <span className="text-blue-300">Évolution:</span>
                <div className="ml-2 flex items-end space-x-1">
                  {skill.history.map((point, idx) => (
                    <div 
                      key={idx} 
                      className={`w-1.5 ${
                        skill.category === 'technical' ? 'bg-blue-500' :
                        skill.category === 'operational' ? 'bg-green-500' :
                        skill.category === 'strategic' ? 'bg-purple-500' :
                        'bg-amber-500'
                      }`}
                      style={{ height: `${Math.max(4, point / 5)}px` }}
                    ></div>
                  ))}
                </div>
                <span className="ml-auto text-gray-400">
                  {skill.history[skill.history.length - 1] > skill.history[skill.history.length - 2] 
                    ? <span className="text-green-400">↑ +{skill.history[skill.history.length - 1] - skill.history[skill.history.length - 2]}%</span>
                    : <span>—</span>
                  }
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Badges et réalisations */}
      <div className="bg-gray-900/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-blue-900/30">
        <h3 className="text-xl font-semibold text-blue-100 mb-4">Badges et réalisations</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sampleBadges.map(badge => (
            <div 
              key={badge.id}
              className={`p-4 rounded-lg border ${badge.unlocked ? 'bg-gray-800/50 border-purple-500/30' : 'bg-gray-900/50 border-gray-700/30'}`}
            >
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${badge.unlocked ? 'bg-purple-700' : 'bg-gray-700'}`}>
                  <Award className={`w-5 h-5 ${badge.unlocked ? 'text-purple-300' : 'text-gray-400'}`} />
                </div>
                <div className="ml-3">
                  <h4 className={`font-medium ${badge.unlocked ? 'text-white' : 'text-gray-400'}`}>{badge.name}</h4>
                  {badge.unlocked ? (
                    <p className="text-xs text-gray-400">Obtenu le {badge.date}</p>
                  ) : (
                    <div className="mt-1">
                      <div className="w-full bg-gray-700 rounded-full h-1.5">
                        <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${badge.progress}%` }}></div>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{badge.progress}% complété</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SkillsOverview;