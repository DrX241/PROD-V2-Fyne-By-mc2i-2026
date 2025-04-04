import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type SkillCategory = 'technical' | 'operational' | 'governance' | 'strategic';

export interface Skill {
  id: string;
  name: string;
  level: number;
  category: SkillCategory;
  history: number[];
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  unlocked: boolean;
  date?: string;
  progress?: number;
}

export interface UserProfile {
  id: string;
  completedScenarios: number;
  skills: Skill[];
  badges: Badge[];
  level: number;
}

export interface SkillsContextType {
  skills: Skill[];
  badges: Badge[];
  loading: boolean;
  addSkill: (skill: Skill) => void;
  updateSkill: (id: string, level: number) => void;
  unlockBadge: (id: string) => void;
  getRecommendations: () => any[];
}

const SkillsContext = createContext<SkillsContextType | undefined>(undefined);

export const SkillsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [skills, setSkills] = useState<Skill[]>([
    { id: 'skill1', name: 'Réponse aux incidents', level: 72, category: 'technical', history: [60, 65, 72] },
    { id: 'skill2', name: 'Analyse forensique', level: 45, category: 'technical', history: [25, 35, 45] },
    { id: 'skill3', name: 'Gestion de crise', level: 63, category: 'operational', history: [50, 58, 63] },
    { id: 'skill4', name: 'Évaluation des risques', level: 58, category: 'governance', history: [40, 52, 58] },
    { id: 'skill5', name: 'Communication', level: 81, category: 'operational', history: [70, 75, 81] },
    { id: 'skill6', name: 'Planification stratégique', level: 36, category: 'strategic', history: [20, 30, 36] }
  ]);
  
  const [badges, setBadges] = useState<Badge[]>([
    { id: 'badge1', name: 'Gestion d\'incident', icon: 'Shield', unlocked: true, date: '2025-03-15' },
    { id: 'badge2', name: 'Analyse de menaces', icon: 'Search', unlocked: true, date: '2025-03-10' },
    { id: 'badge3', name: 'Expert en conformité', icon: 'CheckSquare', unlocked: false, progress: 70 },
    { id: 'badge4', name: 'Leadership en crise', icon: 'Users', unlocked: false, progress: 45 }
  ]);

  useEffect(() => {
    // Simuler le chargement des données
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);
  
  const addSkill = (skill: Skill) => {
    setSkills(prev => [...prev, skill]);
  };
  
  const updateSkill = (id: string, level: number) => {
    setSkills(prev => prev.map(skill => {
      if (skill.id === id) {
        const newHistory = [...skill.history, level];
        return { ...skill, level, history: newHistory };
      }
      return skill;
    }));
  };
  
  const unlockBadge = (id: string) => {
    setBadges(prev => prev.map(badge => {
      if (badge.id === id) {
        return { 
          ...badge, 
          unlocked: true, 
          date: new Date().toISOString().split('T')[0],
          progress: undefined 
        };
      }
      return badge;
    }));
  };
  
  // Fonction pour obtenir des recommandations en fonction du profil
  const getRecommendations = () => {
    // Trouver les compétences les plus faibles
    const sortedSkills = [...skills].sort((a, b) => a.level - b.level);
    const weakestSkills = sortedSkills.slice(0, 2);
    
    // Générer des recommandations
    return weakestSkills.map(skill => ({
      id: `rec-${skill.id}`,
      title: `Améliorer vos compétences en ${skill.name}`,
      description: `Formation recommandée pour renforcer vos capacités actuelles (${skill.level}%)`,
      difficulty: skill.level < 40 ? 'Débutant' : 'Intermédiaire',
      type: 'Cours',
      url: '#'
    }));
  };
  
  const value = {
    skills,
    badges,
    loading,
    addSkill,
    updateSkill,
    unlockBadge,
    getRecommendations
  };
  
  return (
    <SkillsContext.Provider value={value}>
      {children}
    </SkillsContext.Provider>
  );
};

export const useSkills = (): SkillsContextType => {
  const context = useContext(SkillsContext);
  
  if (context === undefined) {
    throw new Error('useSkills must be used within a SkillsProvider');
  }
  
  return context;
};