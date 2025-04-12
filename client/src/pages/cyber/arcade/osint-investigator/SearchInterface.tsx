import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Database, Globe, FileText, Image, User, Filter } from 'lucide-react';
import searchInterfaceSvg from '@/assets/osint-investigator/search-interface.svg';

interface SearchInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  searchType: string;
  onSearch: (query: string) => void;
}

export const SearchInterface: React.FC<SearchInterfaceProps> = ({
  isOpen,
  onClose,
  searchType = 'general',
  onSearch
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(searchType);
  const [searchFilters, setSearchFilters] = useState({
    timeRange: 'all',
    contentType: 'all',
    language: 'all',
    region: 'all'
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Focus l'input au chargement
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);
  
  // Mise à jour du type de recherche en fonction des props
  useEffect(() => {
    setActiveTab(searchType);
  }, [searchType]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    onSearch(searchQuery);
  };
  
  // Titres et icônes pour les différents types de recherche
  const searchTypes = {
    general: {
      title: 'Recherche Web',
      icon: <Globe className="h-5 w-5 text-blue-400 mr-2" />,
      placeholder: 'Rechercher sur le web...',
      description: 'Recherchez des informations générales sur le web.'
    },
    social: {
      title: 'Recherche de Profils Sociaux',
      icon: <User className="h-5 w-5 text-blue-400 mr-2" />,
      placeholder: 'Nom d\'utilisateur ou nom complet...',
      description: 'Recherchez des profils sur les réseaux sociaux.'
    },
    database: {
      title: 'Recherche en Base de Données',
      icon: <Database className="h-5 w-5 text-blue-400 mr-2" />,
      placeholder: 'Identifiant, nom, ou entité...',
      description: 'Consultez des informations dans les bases de données publiques.'
    },
    advanced: {
      title: 'Recherche Avancée',
      icon: <FileText className="h-5 w-5 text-blue-400 mr-2" />,
      placeholder: 'Requête spécialisée...',
      description: 'Utilisez des opérateurs avancés et filtres spécifiques pour une recherche précise.'
    }
  };
  
  // Obtenir les informations du type de recherche actif
  const currentSearchType = searchTypes[activeTab as keyof typeof searchTypes] || searchTypes.general;
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[800px] bg-slate-900 border-slate-700 max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center text-white">
            {currentSearchType.icon}
            {currentSearchType.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col space-y-4 overflow-auto">
          {/* Interface de recherche simulée (image SVG statique) */}
          <div className="relative h-[420px] overflow-hidden mb-3">
            <img 
              src={searchInterfaceSvg} 
              alt="Search Interface" 
              className="w-full h-full object-contain"
            />
            
            {/* Formulaire interactif superposé sur l'image SVG */}
            <div className="absolute top-[125px] left-[200px] right-[200px]">
              <form onSubmit={handleSearch} className="flex items-center">
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-800 border-blue-600 border-2 rounded-full px-4 py-2 text-white focus:outline-none"
                  placeholder={currentSearchType.placeholder}
                />
                <button 
                  type="submit" 
                  className="absolute right-1 rounded-full bg-blue-600 p-2 text-white"
                >
                  <Search className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
          
          {/* Sélecteur de type de recherche (onglets) */}
          <div className="px-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="general">
                  <Globe className="h-4 w-4 mr-2" />
                  Web
                </TabsTrigger>
                <TabsTrigger value="social">
                  <User className="h-4 w-4 mr-2" />
                  Social
                </TabsTrigger>
                <TabsTrigger value="database">
                  <Database className="h-4 w-4 mr-2" />
                  Bases
                </TabsTrigger>
                <TabsTrigger value="advanced">
                  <FileText className="h-4 w-4 mr-2" />
                  Avancé
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          {/* Options de recherche avancée (dépliables) */}
          <div className="px-2">
            <div className="flex items-center mb-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-slate-300 hover:text-white"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtres avancés
              </Button>
            </div>
            
            {showAdvanced && (
              <div className="grid grid-cols-2 gap-4 bg-slate-800 p-4 rounded-md">
                <div>
                  <Label htmlFor="timeRange" className="text-slate-300">Période</Label>
                  <select 
                    id="timeRange"
                    className="bg-slate-700 text-white rounded p-2 w-full mt-1"
                    value={searchFilters.timeRange}
                    onChange={(e) => setSearchFilters({...searchFilters, timeRange: e.target.value})}
                  >
                    <option value="all">Tout</option>
                    <option value="day">Dernières 24h</option>
                    <option value="week">Dernière semaine</option>
                    <option value="month">Dernier mois</option>
                    <option value="year">Dernière année</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="contentType" className="text-slate-300">Type de contenu</Label>
                  <select 
                    id="contentType"
                    className="bg-slate-700 text-white rounded p-2 w-full mt-1"
                    value={searchFilters.contentType}
                    onChange={(e) => setSearchFilters({...searchFilters, contentType: e.target.value})}
                  >
                    <option value="all">Tous les types</option>
                    <option value="articles">Articles</option>
                    <option value="blogs">Blogs</option>
                    <option value="news">Actualités</option>
                    <option value="forums">Forums</option>
                    <option value="research">Recherches</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="language" className="text-slate-300">Langue</Label>
                  <select 
                    id="language"
                    className="bg-slate-700 text-white rounded p-2 w-full mt-1"
                    value={searchFilters.language}
                    onChange={(e) => setSearchFilters({...searchFilters, language: e.target.value})}
                  >
                    <option value="all">Toutes les langues</option>
                    <option value="fr">Français</option>
                    <option value="en">Anglais</option>
                    <option value="de">Allemand</option>
                    <option value="es">Espagnol</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="region" className="text-slate-300">Région</Label>
                  <select 
                    id="region"
                    className="bg-slate-700 text-white rounded p-2 w-full mt-1"
                    value={searchFilters.region}
                    onChange={(e) => setSearchFilters({...searchFilters, region: e.target.value})}
                  >
                    <option value="all">Toutes les régions</option>
                    <option value="fr">France</option>
                    <option value="eu">Europe</option>
                    <option value="na">Amérique du Nord</option>
                    <option value="as">Asie</option>
                    <option value="global">Mondial</option>
                  </select>
                </div>
              </div>
            )}
          </div>
          
          {/* Conseils OSINT spécifiques au type de recherche */}
          <div className="bg-blue-900/20 border border-blue-700 rounded-md p-3 text-sm text-blue-200 mt-2">
            <h4 className="font-medium mb-1">Conseils OSINT pour {currentSearchType.title}</h4>
            {activeTab === 'general' && (
              <p>Utilisez des opérateurs comme "site:", "filetype:" ou des guillemets pour affiner votre recherche.</p>
            )}
            {activeTab === 'social' && (
              <p>Recherchez le même pseudonyme sur différentes plateformes pour établir des connexions entre profils.</p>
            )}
            {activeTab === 'database' && (
              <p>Les bases de données publiques peuvent contenir des informations précieuses sur les entreprises, domaines et personnes.</p>
            )}
            {activeTab === 'advanced' && (
              <p>Combinez différentes sources et techniques pour une vision plus complète de votre cible d'investigation.</p>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <div className="flex justify-between w-full">
            <Button variant="outline" onClick={onClose} className="border-slate-600 text-slate-300">
              Annuler
            </Button>
            <Button 
              type="submit" 
              onClick={handleSearch}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={!searchQuery.trim()}
            >
              <Search className="h-4 w-4 mr-2" />
              Rechercher
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};