import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Globe, Search, Shield, Database, Image, FileText, Users, Map, Calendar, Filter, ExternalLink, Upload } from 'lucide-react';

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

  // Déterminer le contenu spécifique en fonction du type de recherche
  const renderSearchContent = () => {
    if (searchType === 'general') {
      return (
        <div className="flex flex-col h-full">
          <div className="p-4 bg-gray-800 border-b border-gray-700">
            <div className="flex items-center justify-center mb-6">
              <Globe className="h-8 w-8 text-blue-500 mr-2" />
              <h1 className="text-2xl font-bold text-white">CyberSearch</h1>
            </div>
            
            <div className="relative">
              <Input
                className="pr-10 py-6 pl-4 bg-gray-900 border-gray-600 text-white text-lg rounded-md focus:border-blue-500 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher sur le web..."
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button 
                className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700"
                onClick={handleSearch}
              >
                <Search className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="flex justify-center mt-4 space-x-2 text-sm">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                <Globe className="h-4 w-4 mr-1" /> Web
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                <Image className="h-4 w-4 mr-1" /> Images
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                <FileText className="h-4 w-4 mr-1" /> Actualités
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                <Map className="h-4 w-4 mr-1" /> Maps
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                <Shield className="h-4 w-4 mr-1" /> Avancé
              </Button>
            </div>
          </div>
          
          <div className="p-4 bg-gray-900 flex-1">
            <div className="text-center py-12 text-gray-400">
              <Search className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <h2 className="text-xl mb-2 text-gray-300">Explorez le web en toute sécurité</h2>
              <p className="max-w-md mx-auto">Utilisez les opérateurs de recherche spécifiques comme "site:", "filetype:" ou "intext:" pour des résultats plus précis.</p>
              
              <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto mt-8 text-left">
                <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                  <h3 className="font-medium text-blue-400 text-sm">Recherche par type de fichier</h3>
                  <p className="text-sm text-gray-400 mt-1">filetype:pdf "rapport sécurité"</p>
                </div>
                <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                  <h3 className="font-medium text-blue-400 text-sm">Recherche sur un site spécifique</h3>
                  <p className="text-sm text-gray-400 mt-1">site:example.com "mot de passe"</p>
                </div>
                <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                  <h3 className="font-medium text-blue-400 text-sm">Recherche de texte exact</h3>
                  <p className="text-sm text-gray-400 mt-1">"John Smith" contact info</p>
                </div>
                <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                  <h3 className="font-medium text-blue-400 text-sm">Recherche par plage</h3>
                  <p className="text-sm text-gray-400 mt-1">événement 2022..2023</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    } else if (searchType === 'social') {
      return (
        <div className="flex flex-col h-full">
          <div className="p-4 bg-gray-800 border-b border-gray-700">
            <div className="flex items-center justify-center mb-6">
              <Users className="h-8 w-8 text-blue-500 mr-2" />
              <h1 className="text-2xl font-bold text-white">SocialFind</h1>
            </div>
            
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1">
                <Input
                  className="bg-gray-900 border-gray-600 text-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Nom, pseudo ou courriel..."
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <select className="bg-gray-900 border-gray-600 text-white rounded-md p-2">
                <option value="all">Toutes plateformes</option>
                <option value="twitter">X (Twitter)</option>
                <option value="instagram">Instagram</option>
                <option value="facebook">Facebook</option>
                <option value="linkedin">LinkedIn</option>
                <option value="github">GitHub</option>
                <option value="tiktok">TikTok</option>
              </select>
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleSearch}
              >
                <Search className="h-4 w-4 mr-2" />
                Rechercher
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-4">
              <div className="text-xs px-2 py-1 rounded bg-gray-700 text-white flex items-center">
                <Filter className="h-3 w-3 mr-1" />
                Comptes actifs seulement
              </div>
              <div className="text-xs px-2 py-1 rounded bg-gray-700 text-white flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                Créés après 2020
              </div>
              <div className="text-xs px-2 py-1 rounded bg-blue-900 text-white flex items-center">
                <Users className="h-3 w-3 mr-1" />
                Profils publics uniquement
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-gray-900 flex-1">
            <div className="text-center py-12 text-gray-400">
              <Users className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <h2 className="text-xl mb-2 text-gray-300">Découvrez des profils sur différentes plateformes</h2>
              <p className="max-w-md mx-auto">L'outil recherchera des correspondances pour le même utilisateur sur plusieurs réseaux sociaux et plateformes.</p>
              
              <div className="flex flex-wrap justify-center gap-3 mt-8">
                <div className="w-12 h-12 rounded-full bg-blue-900 flex items-center justify-center">
                  <span className="text-xl font-bold text-blue-100">f</span>
                </div>
                <div className="w-12 h-12 rounded-full bg-sky-600 flex items-center justify-center">
                  <span className="text-xl font-bold text-white">X</span>
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center">
                  <span className="text-xl font-bold text-white">I</span>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-700 flex items-center justify-center">
                  <span className="text-xl font-bold text-white">in</span>
                </div>
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center">
                  <span className="text-xl font-bold text-white">G</span>
                </div>
                <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center">
                  <span className="text-xl font-bold text-white">T</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    } else if (searchType === 'database') {
      return (
        <div className="flex flex-col h-full">
          <div className="p-4 bg-gray-800 border-b border-gray-700">
            <div className="flex items-center justify-center mb-6">
              <Database className="h-8 w-8 text-emerald-500 mr-2" />
              <h1 className="text-2xl font-bold text-white">DataAccess</h1>
            </div>
            
            <Tabs defaultValue="public">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="public">Bases publiques</TabsTrigger>
                <TabsTrigger value="gov">Registres officiels</TabsTrigger>
                <TabsTrigger value="company">Entreprises</TabsTrigger>
                <TabsTrigger value="archive">Archives Web</TabsTrigger>
              </TabsList>
              
              <TabsContent value="public" className="mt-0">
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <Input
                      className="flex-1 bg-gray-900 border-gray-600 text-white"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Rechercher des données publiques..."
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <Button 
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={handleSearch}
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Rechercher
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <Label htmlFor="dataCategory" className="text-white">Catégorie</Label>
                      <select id="dataCategory" className="w-full mt-1 bg-gray-900 border-gray-600 text-white rounded p-2">
                        <option value="all">Toutes</option>
                        <option value="personal">Données personnelles</option>
                        <option value="financial">Informations financières</option>
                        <option value="property">Propriétés et registres</option>
                        <option value="legal">Documents légaux</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="region" className="text-white">Région</Label>
                      <select id="region" className="w-full mt-1 bg-gray-900 border-gray-600 text-white rounded p-2">
                        <option value="all">Monde entier</option>
                        <option value="europe">Europe</option>
                        <option value="namerica">Amérique du Nord</option>
                        <option value="samerica">Amérique du Sud</option>
                        <option value="asia">Asie</option>
                        <option value="africa">Afrique</option>
                      </select>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="gov" className="mt-0">
                <div className="flex gap-3">
                  <Input
                    className="flex-1 bg-gray-900 border-gray-600 text-white"
                    placeholder="Rechercher dans les registres publics..."
                  />
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    <Search className="h-4 w-4 mr-2" />
                    Rechercher
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="company" className="mt-0">
                <div className="flex gap-3">
                  <Input
                    className="flex-1 bg-gray-900 border-gray-600 text-white"
                    placeholder="Nom d'entreprise ou numéro d'enregistrement..."
                  />
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    <Search className="h-4 w-4 mr-2" />
                    Rechercher
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="archive" className="mt-0">
                <div className="flex gap-3">
                  <Input
                    className="flex-1 bg-gray-900 border-gray-600 text-white"
                    placeholder="URL du site à consulter dans les archives..."
                  />
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    <Search className="h-4 w-4 mr-2" />
                    Rechercher
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="p-4 bg-gray-900 flex-1">
            <div className="text-center py-10 text-gray-400">
              <Database className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <h2 className="text-xl mb-2 text-gray-300">Accédez aux bases de données publiques</h2>
              <p className="max-w-md mx-auto">Recherchez dans les registres publics, bases de données gouvernementales et archives web pour collecter des informations légalement accessibles.</p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl mx-auto mt-8">
                <Button variant="outline" className="border-gray-700 text-gray-300 justify-start py-6">
                  <FileText className="h-5 w-5 mr-2" />
                  <div className="text-left">
                    <p className="font-medium">Registres d'entreprises</p>
                    <p className="text-xs text-gray-400">Informations légales sur les sociétés</p>
                  </div>
                </Button>
                <Button variant="outline" className="border-gray-700 text-gray-300 justify-start py-6">
                  <Map className="h-5 w-5 mr-2" />
                  <div className="text-left">
                    <p className="font-medium">Cadastre</p>
                    <p className="text-xs text-gray-400">Propriétés et terrains</p>
                  </div>
                </Button>
                <Button variant="outline" className="border-gray-700 text-gray-300 justify-start py-6">
                  <ExternalLink className="h-5 w-5 mr-2" />
                  <div className="text-left">
                    <p className="font-medium">Archives Web</p>
                    <p className="text-xs text-gray-400">Versions historiques de sites</p>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    } else if (searchType === 'advanced') {
      return (
        <div className="flex flex-col h-full">
          <div className="p-4 bg-gray-800 border-b border-gray-700">
            <div className="flex items-center justify-center mb-6">
              <Shield className="h-8 w-8 text-purple-500 mr-2" />
              <h1 className="text-2xl font-bold text-white">CyberTools Pro</h1>
            </div>
            
            <Tabs defaultValue="metadata">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="metadata">Métadonnées</TabsTrigger>
                <TabsTrigger value="reverse">Recherche inverse</TabsTrigger>
                <TabsTrigger value="network">Analyse réseau</TabsTrigger>
                <TabsTrigger value="breach">Fuites de données</TabsTrigger>
              </TabsList>
              
              <TabsContent value="metadata" className="mt-2">
                <div className="space-y-4">
                  <div className="bg-gray-700 p-3 rounded-md">
                    <p className="text-sm text-gray-300 mb-3">
                      Analysez les métadonnées d'images, documents ou fichiers pour révéler des informations cachées comme la date de création, l'appareil utilisé, la localisation GPS, etc.
                    </p>
                    <div className="border-2 border-dashed border-gray-600 rounded-md p-6 flex flex-col items-center justify-center">
                      <Upload className="h-10 w-10 text-gray-400 mb-3" />
                      <p className="text-sm text-gray-300">Glissez un fichier ou cliquez pour télécharger</p>
                      <p className="text-xs text-gray-400 mt-1">JPG, PNG, PDF, DOCX (max 10MB)</p>
                      <Button className="mt-4 bg-purple-600 hover:bg-purple-700" size="sm">
                        Parcourir les fichiers
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="reverse" className="mt-2">
                <div className="space-y-4">
                  <div className="bg-gray-700 p-3 rounded-md">
                    <p className="text-sm text-gray-300 mb-3">
                      Effectuez une recherche inversée d'image pour trouver des occurrences similaires sur le web, identifier la source originale ou vérifier si une photo a été manipulée.
                    </p>
                    <div className="flex flex-col md:flex-row gap-3">
                      <Input
                        className="flex-1 bg-gray-900 border-gray-600 text-white"
                        placeholder="URL de l'image à rechercher..."
                      />
                      <Button className="bg-purple-600 hover:bg-purple-700">
                        <Search className="h-4 w-4 mr-2" />
                        Rechercher
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="network" className="mt-2">
                <div className="space-y-4">
                  <div className="bg-gray-700 p-3 rounded-md">
                    <div className="flex gap-3">
                      <Input
                        className="flex-1 bg-gray-900 border-gray-600 text-white"
                        placeholder="Nom de domaine ou adresse IP..."
                      />
                      <Button className="bg-purple-600 hover:bg-purple-700">
                        <Search className="h-4 w-4 mr-2" />
                        Analyser
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="breach" className="mt-2">
                <div className="space-y-4">
                  <div className="bg-gray-700 p-3 rounded-md">
                    <div className="flex gap-3">
                      <Input
                        className="flex-1 bg-gray-900 border-gray-600 text-white"
                        placeholder="Adresse email ou nom d'utilisateur..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      />
                      <Button 
                        className="bg-purple-600 hover:bg-purple-700"
                        onClick={handleSearch}
                      >
                        <Search className="h-4 w-4 mr-2" />
                        Vérifier
                      </Button>
                    </div>
                    <p className="text-xs text-gray-400 mt-2 flex items-center">
                      <Shield className="h-3 w-3 mr-1 text-purple-400" />
                      Recherche dans les bases de données de fuites connues en respectant le cadre légal
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="p-4 bg-gray-900 flex-1">
            <div className="text-center py-8 text-gray-400">
              <Shield className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <h2 className="text-xl mb-2 text-gray-300">Outils avancés pour professionnels</h2>
              <p className="max-w-md mx-auto">Utilisez ces outils spécialisés pour approfondir votre investigation en toute responsabilité dans le respect du cadre légal.</p>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-auto p-0 bg-gray-900 border-gray-700">
        <DialogHeader className="sr-only">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Interface de recherche OSINT</DialogDescription>
        </DialogHeader>
        
        {renderSearchContent()}
        
        <DialogFooter className="p-4 border-t border-gray-700 bg-gray-800">
          <Button variant="outline" onClick={onClose} className="border-gray-600 text-gray-300">
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};