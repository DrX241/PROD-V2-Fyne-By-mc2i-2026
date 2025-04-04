import React from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen, ExternalLink } from 'lucide-react';

interface LearningRecommendationsProps {
  recommendations?: any[];
  className?: string;
}

const LearningRecommendations: React.FC<LearningRecommendationsProps> = ({ 
  recommendations = [],
  className = '' 
}) => {
  // Recommandations par défaut si aucune n'est fournie
  const defaultRecommendations = [
    {
      id: 'rec-1',
      title: 'Comprendre les concepts de base de cybersécurité',
      description: 'Les fondamentaux pour tout professionnel de la sécurité',
      difficulty: 'Débutant',
      type: 'Cours',
      url: '#'
    },
    {
      id: 'rec-2',
      title: 'Gestion des incidents de sécurité',
      description: 'Méthodologie de réponse aux incidents',
      difficulty: 'Intermédiaire',
      type: 'Module pratique',
      url: '#'
    },
    {
      id: 'rec-3',
      title: 'Évaluation et gestion des risques',
      description: 'Identification et priorisation des risques cybernétiques',
      difficulty: 'Avancé',
      type: 'Cours',
      url: '#'
    }
  ];
  
  const displayRecommendations = recommendations.length > 0 ? recommendations : defaultRecommendations;
  
  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold text-blue-100 flex items-center">
        <BookOpen className="mr-2 h-5 w-5 text-amber-400" />
        Recommandations
      </h3>
      
      <div className="space-y-3">
        {displayRecommendations.map(rec => (
          <div 
            key={rec.id}
            className="p-3 bg-gray-900/30 rounded-lg border border-gray-800/50 hover:bg-gray-900/40 transition-all"
          >
            <h4 className="font-medium text-white text-sm">{rec.title}</h4>
            <p className="text-xs text-gray-300 mt-1 mb-2">{rec.description}</p>
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <span className="text-[10px] bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded-full">
                  {rec.difficulty}
                </span>
                <span className="text-[10px] bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full">
                  {rec.type}
                </span>
              </div>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-blue-300">
                <ExternalLink className="h-3 w-3 mr-1" />
                Voir
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LearningRecommendations;