import React, { useEffect, useRef, useState } from 'react';
import { Search, Database, Globe, Users, FileText, Image, Mail } from 'lucide-react';
import { CaseData } from './types';

// Types pour le jeu OSINT
interface OsintGameProps {
  case: CaseData;
  onAddEvidence: (evidence: any) => void;
  onComplete: () => void;
}

export const OsintGame: React.FC<OsintGameProps> = ({
  case: currentCase,
  onAddEvidence,
  onComplete
}) => {
  const gameRef = useRef<HTMLDivElement>(null);
  
  // État pour suivre la progression
  const [progress, setProgress] = useState<number>(0);
  const [discoveredItems, setDiscoveredItems] = useState<string[]>([]);
  
  // Cette fonction sera exposée pour être utilisée par le composant parent
  const addDiscoveredItem = (itemId: string) => {
    if (!discoveredItems.includes(itemId)) {
      setDiscoveredItems(prev => [...prev, itemId]);
      setProgress(prev => Math.min(prev + 10, 100));
    }
  };
  
  // Exposer la fonction via window pour qu'elle soit accessible
  useEffect(() => {
    (window as any).addOsintDiscovery = addDiscoveredItem;
    
    return () => {
      delete (window as any).addOsintDiscovery;
    };
  }, [discoveredItems]);
  
  // Détecter quand le jeu est complété
  useEffect(() => {
    if (progress >= 100) {
      onComplete();
    }
  }, [progress, onComplete]);
  
  return (
    <div className="bg-gray-800 rounded-lg p-4 h-full" ref={gameRef}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-white">{currentCase.title}</h3>
        <div className="flex items-center">
          <span className="mr-2 text-sm text-gray-300">Progression:</span>
          <div className="w-48 bg-gray-700 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <span className="ml-2 text-sm text-gray-300">{progress}%</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-700 rounded p-3">
          <h4 className="text-sm font-medium text-white flex items-center mb-2">
            <Search className="h-4 w-4 text-blue-400 mr-2" />
            Moteurs de recherche
          </h4>
          <ul className="text-xs text-gray-300 space-y-1">
            <li>• SearchEngine - Recherche générale</li>
            <li>• ImageSearch - Recherche d'images</li>
            <li>• ArchiveNet - Archives web</li>
          </ul>
        </div>
        
        <div className="bg-gray-700 rounded p-3">
          <h4 className="text-sm font-medium text-white flex items-center mb-2">
            <Users className="h-4 w-4 text-blue-400 mr-2" />
            Réseaux sociaux
          </h4>
          <ul className="text-xs text-gray-300 space-y-1">
            <li>• Connectr - Réseau professionnel</li>
            <li>• Chirp - Microblogging</li>
            <li>• FriendSphere - Réseau personnel</li>
          </ul>
        </div>
        
        <div className="bg-gray-700 rounded p-3">
          <h4 className="text-sm font-medium text-white flex items-center mb-2">
            <Database className="h-4 w-4 text-blue-400 mr-2" />
            Bases de données
          </h4>
          <ul className="text-xs text-gray-300 space-y-1">
            <li>• PublicRecords - Registres publics</li>
            <li>• DomainRegistry - Information des domaines</li>
            <li>• GeoLocator - Données géographiques</li>
          </ul>
        </div>
        
        <div className="bg-gray-700 rounded p-3">
          <h4 className="text-sm font-medium text-white flex items-center mb-2">
            <FileText className="h-4 w-4 text-blue-400 mr-2" />
            Outils d'analyse
          </h4>
          <ul className="text-xs text-gray-300 space-y-1">
            <li>• MetaExtract - Analyse de métadonnées</li>
            <li>• ConnectionMapper - Cartographie des relations</li>
            <li>• DataVisualizer - Visualisation des données</li>
          </ul>
        </div>
      </div>
      
      <div className="text-sm text-gray-300 mt-4">
        <p>
          Utilisez les outils ci-dessus pour mener votre investigation. Chaque outil révèle différents types 
          d'informations. Combinés intelligemment, ils vous permettront de résoudre l'affaire.
        </p>
      </div>
    </div>
  );
};