import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Search, Database, Globe, FileText, Table, Filter, User, MapPin, Building, Calendar } from 'lucide-react';
import databaseInterfaceSvg from '@/assets/osint-investigator/database-interface.svg';

interface DatabaseViewerProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
  databaseType?: string;
}

export const DatabaseViewer: React.FC<DatabaseViewerProps> = ({
  isOpen,
  onClose,
  onSearch,
  databaseType = 'public'
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDatabase, setSelectedDatabase] = useState(databaseType);
  const [activeTab, setActiveTab] = useState('search');
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Réinitialiser la sélection si le type de base de données change
  useEffect(() => {
    setSelectedDatabase(databaseType);
    setSelectedRecord(null);
  }, [databaseType]);
  
  // Focus sur l'input au chargement
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    onSearch(searchQuery);
  };
  
  // Liste de bases de données disponibles
  const databases = {
    public: {
      name: 'Registres Publics',
      description: 'Accédez aux informations publiques sur les particuliers et les entreprises.',
      icon: <Database className="h-5 w-5 text-blue-400 mr-2" />
    },
    domain: {
      name: 'Registre de Domaines',
      description: 'Recherchez des informations sur les propriétaires de noms de domaine.',
      icon: <Globe className="h-5 w-5 text-blue-400 mr-2" />
    },
    company: {
      name: 'Données d\'Entreprises',
      description: 'Consultez les informations légales, financières et organisationnelles des entreprises.',
      icon: <Building className="h-5 w-5 text-blue-400 mr-2" />
    },
    location: {
      name: 'Données Géographiques',
      description: 'Recherchez des informations basées sur la localisation et les adresses.',
      icon: <MapPin className="h-5 w-5 text-blue-400 mr-2" />
    }
  };
  
  // Exemple de données simulées pour l'affichage
  const mockData = [
    {
      id: 'PR-1025',
      name: 'Dubois Industries SAS',
      type: 'Entreprise',
      date: '12/03/2025',
      details: {
        address: '123 Avenue de l\'Innovation, 75008 Paris',
        siret: '12345678901234',
        creation: '2008-05-17',
        activity: 'Conseil en sécurité informatique',
        director: 'Jean Dubois',
        employees: '76-100'
      }
    },
    {
      id: 'PR-1026',
      name: 'Martin Bernard',
      type: 'Personne',
      date: '28/02/2025',
      details: {
        birth: '1985-09-23',
        nationality: 'Française',
        address: '45 Rue des Lilas, 69003 Lyon',
        profession: 'Consultant cybersécurité',
        companies: ['CyberConsult SARL', 'SecureTech Solutions']
      }
    },
    {
      id: 'PR-1027',
      name: 'Cyber-Defence SARL',
      type: 'Entreprise',
      date: '15/01/2025',
      details: {
        address: '8 Boulevard Numérique, 33000 Bordeaux',
        siret: '98765432109876',
        creation: '2019-11-05',
        activity: 'Services de protection des systèmes informatiques',
        director: 'Sophie Moreau',
        employees: '11-50'
      }
    }
  ];
  
  // Sélection d'un enregistrement pour afficher les détails
  const selectRecord = (record: any) => {
    setSelectedRecord(record);
    setActiveTab('details');
  };
  
  // Rendu des détails en fonction du type d'enregistrement
  const renderRecordDetails = () => {
    if (!selectedRecord) return null;
    
    return (
      <div className="bg-slate-800 rounded-lg p-4">
        <div className="mb-4 pb-3 border-b border-slate-700">
          <h3 className="text-xl font-medium text-white flex items-center">
            {selectedRecord.type === 'Entreprise' ? (
              <Building className="h-5 w-5 text-blue-400 mr-2" />
            ) : (
              <User className="h-5 w-5 text-blue-400 mr-2" />
            )}
            {selectedRecord.name}
          </h3>
          <div className="flex items-center mt-1 text-sm text-slate-400">
            <span className="mr-3">ID: {selectedRecord.id}</span>
            <span>Mis à jour: {selectedRecord.date}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {selectedRecord.type === 'Entreprise' ? (
            <>
              <div>
                <Label className="text-slate-400">Adresse</Label>
                <p className="text-white text-sm">{selectedRecord.details.address}</p>
              </div>
              <div>
                <Label className="text-slate-400">SIRET</Label>
                <p className="text-white text-sm">{selectedRecord.details.siret}</p>
              </div>
              <div>
                <Label className="text-slate-400">Date de création</Label>
                <p className="text-white text-sm">{selectedRecord.details.creation}</p>
              </div>
              <div>
                <Label className="text-slate-400">Activité principale</Label>
                <p className="text-white text-sm">{selectedRecord.details.activity}</p>
              </div>
              <div>
                <Label className="text-slate-400">Dirigeant</Label>
                <p className="text-white text-sm">{selectedRecord.details.director}</p>
              </div>
              <div>
                <Label className="text-slate-400">Effectif</Label>
                <p className="text-white text-sm">{selectedRecord.details.employees} employés</p>
              </div>
            </>
          ) : (
            <>
              <div>
                <Label className="text-slate-400">Date de naissance</Label>
                <p className="text-white text-sm">{selectedRecord.details.birth}</p>
              </div>
              <div>
                <Label className="text-slate-400">Nationalité</Label>
                <p className="text-white text-sm">{selectedRecord.details.nationality}</p>
              </div>
              <div>
                <Label className="text-slate-400">Adresse</Label>
                <p className="text-white text-sm">{selectedRecord.details.address}</p>
              </div>
              <div>
                <Label className="text-slate-400">Profession</Label>
                <p className="text-white text-sm">{selectedRecord.details.profession}</p>
              </div>
              <div className="col-span-2">
                <Label className="text-slate-400">Entreprises associées</Label>
                <ul className="list-disc list-inside text-white text-sm">
                  {selectedRecord.details.companies.map((company: string, index: number) => (
                    <li key={index}>{company}</li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
        
        <div className="mt-6 flex justify-end">
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => {
              onSearch(selectedRecord.name);
              onClose();
            }}
          >
            Utiliser comme indice
          </Button>
        </div>
      </div>
    );
  };
  
  const currentDatabase = databases[selectedDatabase as keyof typeof databases] || databases.public;
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[800px] bg-slate-900 border-slate-700 max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center text-white">
            {currentDatabase.icon}
            {currentDatabase.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col overflow-auto">
          {/* Tabs de navigation */}
          <Tabs 
            defaultValue="search" 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="search">
                <Search className="h-4 w-4 mr-2" />
                Recherche
              </TabsTrigger>
              <TabsTrigger value="details" disabled={!selectedRecord}>
                <FileText className="h-4 w-4 mr-2" />
                Détails
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="search" className="space-y-4 mt-4">
              {/* Interface de base de données simulée (image SVG statique) */}
              <div className="relative h-[420px] overflow-hidden">
                <img 
                  src={databaseInterfaceSvg} 
                  alt="Database Interface" 
                  className="w-full h-full object-contain"
                />
                
                {/* Formulaire interactif superposé sur l'image SVG */}
                <div className="absolute top-[80px] left-[240px] right-[50px]">
                  <form onSubmit={handleSearch} className="flex items-center">
                    <input
                      ref={inputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-800 border-blue-600 border rounded px-4 py-2 text-white focus:outline-none"
                      placeholder={`Rechercher dans les ${currentDatabase.name.toLowerCase()}...`}
                    />
                    <button 
                      type="submit" 
                      className="absolute right-2 rounded-full bg-blue-600 p-2 text-white"
                    >
                      <Search className="h-4 w-4" />
                    </button>
                  </form>
                </div>
                
                {/* Zone cliquable pour les enregistrements simulés */}
                {mockData.map((record, index) => (
                  <div 
                    key={record.id}
                    className="absolute cursor-pointer hover:bg-blue-500/20 rounded transition-colors"
                    style={{
                      top: 220 + index * 40,
                      left: 240,
                      width: 520,
                      height: 40
                    }}
                    onClick={() => selectRecord(record)}
                  />
                ))}
              </div>
              
              {/* Sélection de base de données */}
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(databases).map(([key, db]) => (
                  <div 
                    key={key}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedDatabase === key 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                    onClick={() => setSelectedDatabase(key)}
                  >
                    <div className="flex items-center">
                      {db.icon}
                      <span>{db.name}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Description */}
              <div className="bg-slate-800/50 p-3 rounded text-slate-300 text-sm">
                <p>{currentDatabase.description}</p>
              </div>
            </TabsContent>
            
            <TabsContent value="details" className="mt-4">
              {renderRecordDetails()}
            </TabsContent>
          </Tabs>
        </div>
        
        <DialogFooter className="mt-4">
          <div className="flex justify-between w-full">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="border-slate-600 text-slate-300"
            >
              Fermer
            </Button>
            {activeTab === 'search' && (
              <Button 
                type="submit" 
                onClick={handleSearch}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={!searchQuery.trim()}
              >
                <Search className="h-4 w-4 mr-2" />
                Rechercher
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};