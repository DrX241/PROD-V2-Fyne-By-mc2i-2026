import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Filter, Search, ExternalLink, ArrowRight, BookOpen, Video, FileText, Code } from 'lucide-react';

interface EducationalResourcesProps {
  userSkills?: string[];
  className?: string;
}

const EducationalResources: React.FC<EducationalResourcesProps> = ({ 
  userSkills = [],
  className = '' 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  
  // Exemple de ressources
  const resources = [
    {
      id: 'res-1',
      title: 'Fondamentaux de la réponse aux incidents',
      description: 'Un guide complet pour comprendre et mettre en œuvre un processus efficace de réponse aux incidents de cybersécurité',
      category: 'incidents',
      level: 'Intermédiaire',
      type: 'article',
      url: '#'
    },
    {
      id: 'res-2',
      title: 'Analyse des risques en environnement critique',
      description: 'Méthodologie d\'évaluation et de gestion des risques cybernétiques pour les infrastructures critiques',
      category: 'risques',
      level: 'Avancé',
      type: 'cours',
      url: '#'
    },
    {
      id: 'res-3',
      title: 'Introduction au framework NIST',
      description: 'Présentation du cadre de cybersécurité NIST et de son application dans les organisations',
      category: 'conformité',
      level: 'Débutant',
      type: 'vidéo',
      url: '#'
    },
    {
      id: 'res-4',
      title: 'Techniques avancées de détection d\'intrusion',
      description: 'Exploration des méthodes et outils de détection d\'intrusion réseau pour les équipes SOC',
      category: 'détection',
      level: 'Avancé',
      type: 'documentation',
      url: '#'
    },
    {
      id: 'res-5',
      title: 'Sécurisation des accès à privilèges',
      description: 'Stratégies et meilleures pratiques pour gérer les accès à privilèges dans un environnement d\'entreprise',
      category: 'accès',
      level: 'Intermédiaire',
      type: 'cours',
      url: '#'
    },
    {
      id: 'res-6',
      title: 'Communication de crise en cybersécurité',
      description: 'Guide pratique pour communiquer efficacement lors d\'une crise de cybersécurité',
      category: 'incidents',
      level: 'Intermédiaire',
      type: 'vidéo',
      url: '#'
    }
  ];
  
  // Filtrer les ressources en fonction des compétences de l'utilisateur et du terme de recherche
  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === '' || resource.category === filterCategory;
    
    const isRelevantToUserSkills = userSkills.length === 0 || userSkills.includes(resource.category);
    
    return matchesSearch && matchesCategory && isRelevantToUserSkills;
  });
  
  const getResourceIcon = (type: string) => {
    switch(type) {
      case 'vidéo':
        return <Video className="h-4 w-4 text-red-400" />;
      case 'article':
        return <FileText className="h-4 w-4 text-blue-400" />;
      case 'documentation':
        return <Code className="h-4 w-4 text-emerald-400" />;
      case 'cours':
      default:
        return <BookOpen className="h-4 w-4 text-amber-400" />;
    }
  };
  
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Barre de recherche et filtres */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher des ressources..."
            className="w-full pl-10 pr-4 py-2 bg-gray-900/50 border border-blue-900/30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-blue-100"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <select
            className="px-3 py-2 bg-gray-900/50 border border-blue-900/30 rounded-lg text-sm text-blue-100"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">Toutes catégories</option>
            <option value="incidents">Gestion d'incidents</option>
            <option value="risques">Analyse de risques</option>
            <option value="conformité">Conformité</option>
            <option value="détection">Détection</option>
            <option value="accès">Gestion des accès</option>
          </select>
          
          <Button variant="outline" size="icon" className="h-9 w-9 border-blue-900/30">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Liste des ressources */}
      <div className="space-y-4">
        {filteredResources.length === 0 ? (
          <div className="text-center py-10 text-blue-300">
            Aucune ressource trouvée pour ces critères
          </div>
        ) : (
          filteredResources.map(resource => (
            <div 
              key={resource.id}
              className="p-4 bg-gray-900/50 border border-blue-900/20 rounded-lg hover:bg-gray-900/70 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="mt-1 p-2 bg-gray-800 rounded-lg">
                  {getResourceIcon(resource.type)}
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-medium mb-1">{resource.title}</h3>
                  <p className="text-sm text-gray-300 mb-3">{resource.description}</p>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded-full">
                        {resource.level}
                      </span>
                      <span className="text-xs bg-purple-900/50 text-purple-300 px-2 py-0.5 rounded-full">
                        {resource.category}
                      </span>
                      <span className="text-xs bg-amber-900/50 text-amber-300 px-2 py-0.5 rounded-full">
                        {resource.type}
                      </span>
                    </div>
                    
                    <Button variant="ghost" size="sm" className="text-xs text-blue-300">
                      Accéder <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EducationalResources;