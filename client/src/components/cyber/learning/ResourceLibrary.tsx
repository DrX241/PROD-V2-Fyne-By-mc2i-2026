import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, BookOpen, Download, Award } from 'lucide-react';

interface Resource {
  titre: string;
  description: string;
  lien: string;
}

interface ResourceLibraryProps {
  resources: Resource[];
  onComplete: () => void;
}

export function ResourceLibrary({ resources, onComplete }: ResourceLibraryProps) {
  return (
    <Card className="p-6">
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <BookOpen className="h-6 w-6 text-indigo-600 mr-2" />
          <h2 className="text-xl font-bold text-indigo-900">Ressources complémentaires</h2>
        </div>
        
        <p className="text-gray-700 mb-6">
          Pour approfondir vos connaissances sur ce sujet, consultez ces ressources de référence sélectionnées par nos experts.
        </p>
        
        {resources.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">Aucune ressource disponible pour ce module.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {resources.map((resource, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="p-4 h-full border-l-4 border-l-indigo-500 hover:shadow-md transition-all duration-200">
                  <h3 className="font-medium text-indigo-900 mb-1">{resource.titre}</h3>
                  <p className="text-sm text-gray-600 mb-3">{resource.description}</p>
                  
                  <div className="mt-auto">
                    <a 
                      href={resource.lien} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Consulter la ressource
                    </a>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
        
        <div className="border-t border-gray-200 pt-6 mt-6">
          <div className="bg-indigo-50 p-4 rounded-lg flex items-start gap-4 mb-6">
            <div className="bg-indigo-100 p-2 rounded-full">
              <Download className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-medium text-indigo-900 mb-1">Téléchargements disponibles</h3>
              <p className="text-sm text-gray-600 mb-2">Vous pouvez télécharger un récapitulatif de ce module pour consultation hors ligne.</p>
              <button className="text-sm text-indigo-600 hover:text-indigo-800 inline-flex items-center">
                <Download className="h-4 w-4 mr-1" />
                Télécharger le PDF récapitulatif
              </button>
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg flex items-start gap-4">
            <div className="bg-green-100 p-2 rounded-full">
              <Award className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-green-900 mb-1">Module complété !</h3>
              <p className="text-sm text-gray-600">Félicitations pour avoir terminé ce module. Vous pouvez maintenant retourner à la liste des modules ou continuer votre apprentissage.</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button 
          onClick={onComplete}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          Terminer et enregistrer ma progression
        </Button>
      </div>
    </Card>
  );
}