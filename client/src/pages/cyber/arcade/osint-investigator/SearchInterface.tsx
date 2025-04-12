import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Globe, Search, Shield, Database } from 'lucide-react';

interface SearchInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  searchType: string;
  onSearch: (query: string) => void;
}

export const SearchInterface: React.FC<SearchInterfaceProps> = ({
  isOpen,
  onClose,
  searchType,
  onSearch
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOptions, setSearchOptions] = useState({
    filterType: 'all',
    dateRange: 'any',
    includeMedia: true
  });

  // Déterminer le titre et l'icône en fonction du type de recherche
  const getSearchTitle = () => {
    switch (searchType) {
      case 'general':
        return { title: 'Recherche Web', icon: <Globe className="h-5 w-5 text-blue-400" /> };
      case 'social':
        return { title: 'Recherche de Profils Sociaux', icon: <Search className="h-5 w-5 text-blue-400" /> };
      case 'database':
        return { title: 'Consultation de Base de Données', icon: <Database className="h-5 w-5 text-blue-400" /> };
      case 'advanced':
        return { title: 'Outils de Recherche Avancés', icon: <Shield className="h-5 w-5 text-blue-400" /> };
      default:
        return { title: 'Recherche', icon: <Search className="h-5 w-5 text-blue-400" /> };
    }
  };

  const { title, icon } = getSearchTitle();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearch(searchQuery);
      setSearchQuery('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="flex items-center text-white">
            {icon}
            <span className="ml-2">{title}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="searchQuery" className="text-white">Termes de recherche</Label>
              <Input
                id="searchQuery"
                className="bg-gray-800 border-gray-700 text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Rechercher ${searchType === 'social' ? 'un profil' : 'des informations'}...`}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>

          {searchType === 'advanced' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="filterType" className="text-white">Type de contenu</Label>
                <select
                  id="filterType"
                  className="w-full mt-1 bg-gray-800 border-gray-700 text-white rounded p-2"
                  value={searchOptions.filterType}
                  onChange={(e) => setSearchOptions({...searchOptions, filterType: e.target.value})}
                >
                  <option value="all">Tous</option>
                  <option value="documents">Documents</option>
                  <option value="images">Images</option>
                  <option value="videos">Vidéos</option>
                  <option value="news">Actualités</option>
                </select>
              </div>
              <div>
                <Label htmlFor="dateRange" className="text-white">Période</Label>
                <select
                  id="dateRange"
                  className="w-full mt-1 bg-gray-800 border-gray-700 text-white rounded p-2"
                  value={searchOptions.dateRange}
                  onChange={(e) => setSearchOptions({...searchOptions, dateRange: e.target.value})}
                >
                  <option value="any">Toutes dates</option>
                  <option value="day">Dernières 24h</option>
                  <option value="week">7 derniers jours</option>
                  <option value="month">30 derniers jours</option>
                  <option value="year">12 derniers mois</option>
                </select>
              </div>
            </div>
          )}

          {searchType === 'social' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="platform" className="text-white">Plateforme</Label>
                <select
                  id="platform"
                  className="w-full mt-1 bg-gray-800 border-gray-700 text-white rounded p-2"
                >
                  <option value="all">Toutes</option>
                  <option value="twitter">Twitter</option>
                  <option value="instagram">Instagram</option>
                  <option value="facebook">Facebook</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="tiktok">TikTok</option>
                </select>
              </div>
              <div>
                <Label htmlFor="activityStatus" className="text-white">Statut d'activité</Label>
                <select
                  id="activityStatus"
                  className="w-full mt-1 bg-gray-800 border-gray-700 text-white rounded p-2"
                >
                  <option value="all">Tous</option>
                  <option value="active">Actifs récemment</option>
                  <option value="inactive">Inactifs</option>
                  <option value="verified">Vérifiés uniquement</option>
                </select>
              </div>
            </div>
          )}

          {searchType === 'database' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="databaseType" className="text-white">Type de base</Label>
                <select
                  id="databaseType"
                  className="w-full mt-1 bg-gray-800 border-gray-700 text-white rounded p-2"
                >
                  <option value="public">Bases publiques</option>
                  <option value="government">Registres officiels</option>
                  <option value="company">Registres d'entreprises</option>
                  <option value="archived">Archives Web</option>
                </select>
              </div>
              <div>
                <Label htmlFor="dataType" className="text-white">Type de données</Label>
                <select
                  id="dataType"
                  className="w-full mt-1 bg-gray-800 border-gray-700 text-white rounded p-2"
                >
                  <option value="all">Toutes données</option>
                  <option value="personal">Informations personnelles</option>
                  <option value="financial">Données financières</option>
                  <option value="legal">Documents légaux</option>
                  <option value="media">Médias</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSearch}>
            <Search className="h-4 w-4 mr-2" />
            Rechercher
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};