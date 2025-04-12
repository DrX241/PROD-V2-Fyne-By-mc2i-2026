import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Database, Search, FileText, Filter, Download, Clock, AlertTriangle } from 'lucide-react';
import { DatabaseRecord } from './types';

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
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortField, setSortField] = useState('relevance');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchResults, setSearchResults] = useState<DatabaseRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Générer le titre en fonction du type de base de données
  const getDatabaseTitle = () => {
    switch (databaseType) {
      case 'public':
        return 'Base de données publique';
      case 'government':
        return 'Registres gouvernementaux';
      case 'company':
        return 'Registres d\'entreprises';
      case 'archived':
        return 'Archives Web';
      default:
        return 'Base de données';
    }
  };
  
  // Simuler une recherche dans la base de données
  const handleDatabaseSearch = () => {
    if (searchQuery.trim() === '') return;
    
    setIsLoading(true);
    
    // Simuler un délai de recherche
    setTimeout(() => {
      // Générer des résultats fictifs
      const mockResults: DatabaseRecord[] = [
        {
          id: `record-${Date.now()}-1`,
          type: 'person',
          title: `Résultat pour "${searchQuery}" - Individu`,
          content: `Information concernant une personne liée à la recherche "${searchQuery}". Données personnelles accessibles au public.`,
          metadata: {
            name: 'Jean Dupont',
            age: 42,
            occupation: 'Développeur',
            city: 'Paris'
          },
          source: 'Annuaire en ligne',
          date: '2025-01-15',
          relevance: 0.78,
          evidenceValue: 'medium'
        },
        {
          id: `record-${Date.now()}-2`,
          type: 'organization',
          title: `Entreprise liée à "${searchQuery}"`,
          content: `Information concernant une organisation associée à la recherche "${searchQuery}". Données d'entreprise disponibles publiquement.`,
          metadata: {
            companyName: 'TechSolutions SA',
            industry: 'Technologie',
            founded: 2010,
            employees: 156
          },
          source: 'Registre du commerce',
          date: '2024-11-20',
          relevance: 0.92,
          evidenceValue: 'high'
        },
        {
          id: `record-${Date.now()}-3`,
          type: 'event',
          title: `Événement associé à "${searchQuery}"`,
          content: `Information concernant un événement lié à la recherche "${searchQuery}". Détails publiés dans des sources accessibles.`,
          metadata: {
            eventName: 'Conférence Cybersécurité 2025',
            date: '2025-06-12',
            location: 'Lyon, France',
            attendees: 500
          },
          source: 'Calendrier d\'événements professionnels',
          date: '2025-02-28',
          relevance: 0.65,
          evidenceValue: 'low'
        }
      ];
      
      setSearchResults(mockResults);
      setIsLoading(false);
      
      // Notifier le composant parent
      onSearch(searchQuery);
    }, 1200);
  };
  
  // Fonction pour filtrer les résultats
  const filterResults = (results: DatabaseRecord[]) => {
    if (activeFilter === 'all') return results;
    return results.filter(record => record.type === activeFilter);
  };
  
  // Trier les résultats
  const sortResults = (results: DatabaseRecord[]) => {
    return [...results].sort((a, b) => {
      let comparison = 0;
      
      if (sortField === 'relevance') {
        comparison = a.relevance < b.relevance ? 1 : -1;
      } else if (sortField === 'date') {
        comparison = new Date(a.date) < new Date(b.date) ? 1 : -1;
      }
      
      return sortDirection === 'desc' ? comparison : -comparison;
    });
  };
  
  // Résultats filtrés et triés
  const displayResults = sortResults(filterResults(searchResults));
  
  // Toggle de direction de tri
  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  // Afficher les détails d'un enregistrement
  const renderRecordDetails = (record: DatabaseRecord) => {
    return (
      <div className="mt-2 p-3 bg-gray-800 rounded border border-gray-700 text-sm">
        <h4 className="text-white font-medium mb-2">{record.title}</h4>
        <p className="text-gray-300 mb-3">{record.content}</p>
        
        <h5 className="text-gray-400 text-xs font-medium mb-1">Métadonnées</h5>
        <div className="grid grid-cols-2 gap-2 mb-3">
          {Object.entries(record.metadata).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span className="text-gray-400">{key}:</span>
              <span className="text-white">{value.toString()}</span>
            </div>
          ))}
        </div>
        
        <div className="flex justify-between text-xs text-gray-400">
          <span>Source: {record.source}</span>
          <span>Date: {new Date(record.date).toLocaleDateString()}</span>
        </div>
        
        <div className="mt-3 flex justify-end">
          <Button size="sm" className="h-7 text-xs">
            <FileText className="h-3 w-3 mr-1" />
            Sauvegarder comme preuve
          </Button>
        </div>
      </div>
    );
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] bg-gray-900 border-gray-700 max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center text-white">
            <Database className="h-5 w-5 text-blue-400 mr-2" />
            {getDatabaseTitle()}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          {/* Barre de recherche */}
          <div className="flex space-x-2">
            <Input
              className="flex-1 bg-gray-800 border-gray-700 text-white"
              placeholder="Rechercher dans la base de données..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleDatabaseSearch()}
            />
            <Button onClick={handleDatabaseSearch} disabled={isLoading}>
              {isLoading ? (
                <Clock className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Rechercher
            </Button>
          </div>
          
          {/* Filtres rapides */}
          <div className="flex flex-wrap space-x-2">
            <Button 
              variant={activeFilter === 'all' ? 'default' : 'outline'} 
              size="sm"
              className="text-xs"
              onClick={() => setActiveFilter('all')}
            >
              Tous
            </Button>
            <Button 
              variant={activeFilter === 'person' ? 'default' : 'outline'} 
              size="sm"
              className="text-xs"
              onClick={() => setActiveFilter('person')}
            >
              Personnes
            </Button>
            <Button 
              variant={activeFilter === 'organization' ? 'default' : 'outline'} 
              size="sm"
              className="text-xs"
              onClick={() => setActiveFilter('organization')}
            >
              Organisations
            </Button>
            <Button 
              variant={activeFilter === 'event' ? 'default' : 'outline'} 
              size="sm"
              className="text-xs"
              onClick={() => setActiveFilter('event')}
            >
              Événements
            </Button>
            <Button 
              variant={activeFilter === 'location' ? 'default' : 'outline'} 
              size="sm"
              className="text-xs"
              onClick={() => setActiveFilter('location')}
            >
              Lieux
            </Button>
            <Button 
              variant={activeFilter === 'article' ? 'default' : 'outline'} 
              size="sm"
              className="text-xs"
              onClick={() => setActiveFilter('article')}
            >
              Articles
            </Button>
          </div>
          
          {/* Résultats */}
          <ScrollArea className="h-[350px] rounded-md border border-gray-700">
            {searchResults.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                {isLoading ? (
                  <>
                    <Clock className="h-10 w-10 animate-spin mb-3 opacity-70" />
                    <p>Recherche en cours...</p>
                  </>
                ) : (
                  <>
                    <Database className="h-10 w-10 mb-3 opacity-20" />
                    <p>Aucun résultat à afficher</p>
                    <p className="text-sm mt-1">Utilisez la barre de recherche pour interroger la base de données</p>
                  </>
                )}
              </div>
            ) : (
              <div className="p-4">
                <div className="mb-2 flex justify-between items-center">
                  <span className="text-white text-sm font-medium">{displayResults.length} résultats trouvés</span>
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs h-7"
                      onClick={() => toggleSort('relevance')}
                    >
                      Pertinence {sortField === 'relevance' && (sortDirection === 'desc' ? '↓' : '↑')}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs h-7"
                      onClick={() => toggleSort('date')}
                    >
                      Date {sortField === 'date' && (sortDirection === 'desc' ? '↓' : '↑')}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {displayResults.map(record => renderRecordDetails(record))}
                </div>
              </div>
            )}
          </ScrollArea>
          
          {/* Note légale */}
          <div className="text-xs text-gray-400 flex items-start">
            <AlertTriangle className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
            <span>
              Ces données sont fournies à des fins d'enquête uniquement. Leur utilisation est soumise aux 
              réglementations en vigueur concernant la protection des données personnelles.
            </span>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
          <Button variant="outline" disabled={searchResults.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Exporter les résultats
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};