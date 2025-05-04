import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, BookOpen, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface Resource {
  titre: string;
  description: string;
  lien: string;
  type?: 'article' | 'guide' | 'norme' | 'outil';
}

interface ResourceLibraryProps {
  resources: Resource[];
  onComplete: () => void;
}

export function ResourceLibrary({ resources, onComplete }: ResourceLibraryProps) {
  if (!resources || resources.length === 0) {
    return (
      <Card className="p-6 text-center">
        <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Ressources non disponibles</h3>
        <p className="mb-4 text-gray-600">Ce module ne contient pas de ressources additionnelles.</p>
        <Button 
          className="bg-indigo-600 hover:bg-indigo-700" 
          onClick={onComplete}
        >
          Terminer le module <CheckCircle className="ml-2 h-4 w-4" />
        </Button>
      </Card>
    );
  }
  
  // Déterminer le type de ressource et assigner une couleur et une icône appropriées
  const getResourceTypeInfo = (resource: Resource) => {
    const type = resource.type || 'article';
    
    switch (type) {
      case 'guide':
        return { 
          color: 'bg-blue-100 text-blue-800 border-blue-200', 
          icon: <BookOpen className="h-4 w-4" /> 
        };
      case 'norme':
        return { 
          color: 'bg-purple-100 text-purple-800 border-purple-200', 
          icon: <FileText className="h-4 w-4" /> 
        };
      case 'outil':
        return { 
          color: 'bg-green-100 text-green-800 border-green-200', 
          icon: <FileText className="h-4 w-4" /> 
        };
      default:
        return { 
          color: 'bg-indigo-100 text-indigo-800 border-indigo-200', 
          icon: <FileText className="h-4 w-4" /> 
        };
    }
  };
  
  // Déterminer si un lien est de l'ANSSI, CNIL ou ENISA
  const getSourceBadge = (link: string) => {
    if (link.includes('ssi.gouv.fr')) {
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100">ANSSI</Badge>;
    } else if (link.includes('cnil.fr')) {
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-100">CNIL</Badge>;
    } else if (link.includes('enisa.europa.eu')) {
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-100">ENISA</Badge>;
    } else if (link.includes('iso.org')) {
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-100">ISO</Badge>;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xl font-semibold text-indigo-900">Ressources additionnelles</h3>
        <p className="text-sm text-gray-600">{resources.length} ressources disponibles</p>
      </div>
      
      <p className="text-gray-600 mb-4">
        Consultez ces ressources pour approfondir votre compréhension des concepts abordés dans ce module.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {resources.map((resource, index) => {
          const { color, icon } = getResourceTypeInfo(resource);
          const sourceBadge = getSourceBadge(resource.lien);
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="p-4 h-full flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-indigo-900">{resource.titre}</h4>
                  <Badge variant="outline" className={color}>
                    <span className="flex items-center gap-1">
                      {icon}
                      {resource.type || 'Article'}
                    </span>
                  </Badge>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 flex-grow">{resource.description}</p>
                
                <div className="flex justify-between items-center mt-auto">
                  {sourceBadge}
                  
                  <a 
                    href={resource.lien} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center gap-1 transition-colors"
                  >
                    Consulter <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
      
      <div className="flex justify-end">
        <Button 
          className="bg-indigo-600 hover:bg-indigo-700" 
          onClick={onComplete}
        >
          Terminer le module <CheckCircle className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}