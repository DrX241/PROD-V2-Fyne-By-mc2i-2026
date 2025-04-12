import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Database, Search, FileText, Filter, Download, Clock, AlertTriangle, 
  Copy, ExternalLink, Eye, Lock, Shield, CheckCircle, Calendar, 
  User, Building, MapPin, GraduationCap, BriefcaseBusiness, Hash, 
  HistoryIcon, Terminal, TableProperties, Settings, DatabaseIcon
} from 'lucide-react';
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
  
  // Cette fonction sera remplacée par la version améliorée plus bas
  
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
  
  const [activeTab, setActiveTab] = useState('search');
  const [queryMode, setQueryMode] = useState<'simple' | 'advanced' | 'sql'>('simple');
  const [selectedRecord, setSelectedRecord] = useState<DatabaseRecord | null>(null);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [queryHistory, setQueryHistory] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  
  // Génération de fausses statistiques de base de données
  const dbStats = {
    tables: 24,
    records: 1842563,
    size: '512 MB',
    lastUpdated: '2025-04-01',
    connections: 12,
    queryLimit: 1000
  };
  
  // Simulation d'une requête SQL
  const sqlQuery = `SELECT 
  p.id, p.name, p.birth_date, p.occupation, 
  o.name as org_name, o.industry
FROM 
  persons p
LEFT JOIN 
  organizations o ON p.organization_id = o.id
WHERE 
  p.name LIKE '%${searchQuery}%'
  OR p.email LIKE '%${searchQuery}%'
LIMIT 10;`;

  // Ajoute l'effet d'animation pour le loading
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(interval);
            return 95;
          }
          return prev + Math.floor(Math.random() * 10);
        });
      }, 200);
      
      return () => {
        clearInterval(interval);
        setProgress(0);
      };
    }
  }, [isLoading]);
  
  // Remplacer la recherche initiale
  const handleDatabaseSearch = () => {
    if (searchQuery.trim() === '') return;
    
    // Ajouter la requête à l'historique
    setQueryHistory(prev => [searchQuery, ...prev.slice(0, 9)]);
    
    setIsLoading(true);
    setProgress(5);
    
    // Simuler un délai de recherche
    const startTime = Date.now();
    
    // Simuler un délai de recherche
    setTimeout(() => {
      // Générer des résultats fictifs plus riches basés sur le type de base de données
      let mockResults: DatabaseRecord[] = [];
      
      if (databaseType === 'public') {
        mockResults = [
          {
            id: `record-${Date.now()}-1`,
            type: 'person',
            title: `Résultat pour "${searchQuery}" - Individu`,
            content: `Information concernant une personne liée à la recherche "${searchQuery}". Données personnelles accessibles au public.`,
            metadata: {
              name: 'Jean Dupont',
              age: 42,
              occupation: 'Développeur sécurité',
              city: 'Paris',
              education: 'Master en Cybersécurité',
              email: 'j.dupont@example.com',
              phone: '+33 6 XX XX XX XX'
            },
            source: 'Annuaire en ligne',
            date: '2025-01-15',
            relevance: 0.92,
            evidenceValue: 'high'
          },
          {
            id: `record-${Date.now()}-2`,
            type: 'organization',
            title: `Entreprise liée à "${searchQuery}"`,
            content: `Information concernant une organisation associée à la recherche "${searchQuery}". Données d'entreprise disponibles publiquement.`,
            metadata: {
              companyName: 'TechSecure Solutions',
              industry: 'Cybersécurité',
              founded: 2018,
              employees: 76,
              location: 'Paris, France',
              website: 'techsecure-solutions.fr',
              registration: 'RCS Paris B 789 XXX XXX'
            },
            source: 'Registre du commerce',
            date: '2024-11-20',
            relevance: 0.89,
            evidenceValue: 'high'
          },
          {
            id: `record-${Date.now()}-3`,
            type: 'event',
            title: `Événement associé à "${searchQuery}"`,
            content: `Information concernant un événement lié à la recherche "${searchQuery}". Détails publiés dans des sources accessibles.`,
            metadata: {
              eventName: 'Forum Cybersécurité 2025',
              date: '2025-06-12',
              location: 'Lyon, France',
              attendees: 500,
              speakers: ['Jean Dupont', 'Sarah Lefort', 'Marc Bernard'],
              topics: ['Zero Trust', 'Threat Intelligence', 'Security Operations']
            },
            source: 'Calendrier d\'événements professionnels',
            date: '2025-02-28',
            relevance: 0.75,
            evidenceValue: 'medium'
          },
          {
            id: `record-${Date.now()}-4`,
            type: 'article',
            title: `Publication liée à "${searchQuery}"`,
            content: `Article ou publication mentionnant des éléments liés à "${searchQuery}". Information publiée et indexée.`,
            metadata: {
              title: 'Nouvelles menaces cyber: analyse et prévention',
              author: 'Jean Dupont',
              publication: 'Journal de la Cybersécurité',
              publishDate: '2025-03-10',
              keywords: ['sécurité', 'menaces', 'analyse', 'prévention'],
              url: 'https://example.com/article-cyber-2025'
            },
            source: 'Agrégateur d\'articles scientifiques',
            date: '2025-03-10',
            relevance: 0.81,
            evidenceValue: 'medium'
          }
        ];
      } else if (databaseType === 'government') {
        mockResults = [
          {
            id: `record-${Date.now()}-g1`,
            type: 'person',
            title: `Registre d'identité - ${searchQuery}`,
            content: `Information officielle concernant un individu. Extrait du registre national d'identité.`,
            metadata: {
              name: 'Jean Michel Dupont',
              dateOfBirth: '15/03/1980',
              placeOfBirth: 'Paris, France',
              nationality: 'Française',
              idNumber: '800315XXXXX',
              address: 'XXX rue XXXXX, 75000 Paris',
              status: 'Actif'
            },
            source: 'Registre National d\'Identité',
            date: '2025-02-10',
            relevance: 0.95,
            evidenceValue: 'very_high'
          },
          {
            id: `record-${Date.now()}-g2`,
            type: 'property',
            title: `Propriété enregistrée - ${searchQuery}`,
            content: `Information concernant un bien immobilier enregistré au nom associé à la recherche.`,
            metadata: {
              owner: 'Jean Michel Dupont',
              propertyType: 'Appartement',
              address: 'XXX rue XXXXX, 75000 Paris',
              surface: '85m²',
              registrationDate: '2019-05-22',
              cadastralReference: '75XXXX-XXX-XX'
            },
            source: 'Cadastre National',
            date: '2023-06-15',
            relevance: 0.88,
            evidenceValue: 'high'
          }
        ];
      } else if (databaseType === 'company') {
        mockResults = [
          {
            id: `record-${Date.now()}-c1`,
            type: 'organization',
            title: `Entreprise - ${searchQuery} Technologies`,
            content: `Informations officielles sur l'entreprise ${searchQuery} Technologies et ses activités.`,
            metadata: {
              companyName: `${searchQuery} Technologies`,
              legalForm: 'SAS',
              registrationNumber: 'RCS Paris B 821 XXX XXX',
              dateCreated: '2018-07-12',
              capital: '150 000 €',
              mainActivity: 'Édition de logiciels (5829C)',
              headquarters: 'Paris, France',
              directors: ['Marc Leroy (Président)', 'Sophie Martin (Directrice Générale)']
            },
            source: 'Registre National du Commerce et des Sociétés',
            date: '2025-01-05',
            relevance: 0.97,
            evidenceValue: 'very_high'
          },
          {
            id: `record-${Date.now()}-c2`,
            type: 'financial',
            title: `Données financières - ${searchQuery} Technologies`,
            content: `Informations financières publiées par ${searchQuery} Technologies.`,
            metadata: {
              company: `${searchQuery} Technologies`,
              fiscalYear: '2024',
              revenue: '2 450 000 €',
              growth: '+18%',
              employees: '24',
              profitability: '15.2%',
              debtRatio: '0.34'
            },
            source: 'Greffe du Tribunal de Commerce',
            date: '2025-03-15',
            relevance: 0.85,
            evidenceValue: 'high'
          }
        ];
      }
      
      setSearchResults(mockResults);
      setIsLoading(false);
      setProgress(100);
      
      // Calculer le temps d'exécution
      setExecutionTime((Date.now() - startTime) / 1000);
      
      // Notifier le composant parent
      onSearch(searchQuery);
    }, 1200);
  };
  
  // Afficher les détails d'un enregistrement dans un format plus professionnel
  const renderDetailedView = (record: DatabaseRecord) => {
    let icon;
    let colorClass;
    
    switch (record.type) {
      case 'person':
        icon = <User className="h-5 w-5" />;
        colorClass = 'text-blue-400';
        break;
      case 'organization':
        icon = <Building className="h-5 w-5" />;
        colorClass = 'text-emerald-400';
        break;
      case 'event':
        icon = <Calendar className="h-5 w-5" />;
        colorClass = 'text-amber-400';
        break;
      case 'article':
        icon = <FileText className="h-5 w-5" />;
        colorClass = 'text-purple-400';
        break;
      case 'property':
        icon = <MapPin className="h-5 w-5" />;
        colorClass = 'text-red-400';
        break;
      case 'financial':
        icon = <BriefcaseBusiness className="h-5 w-5" />;
        colorClass = 'text-green-400';
        break;
      default:
        icon = <Database className="h-5 w-5" />;
        colorClass = 'text-gray-400';
    }
    
    return (
      <div className="p-4 bg-slate-800 rounded-lg">
        <div className="flex items-center gap-3 mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={() => setSelectedRecord(null)}
          >
            ←
          </Button>
          <div className={`${colorClass} p-2 rounded-full bg-slate-700`}>
            {icon}
          </div>
          <div>
            <h3 className="text-white font-medium">{record.title}</h3>
            <div className="flex gap-3 text-xs text-slate-400">
              <span className="flex items-center">
                <Shield className="h-3 w-3 mr-1" />
                ID: {record.id.substring(0, 10)}...
              </span>
              <span className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {new Date(record.date).toLocaleDateString()}
              </span>
              <span className="flex items-center">
                <Database className="h-3 w-3 mr-1" />
                {record.source}
              </span>
            </div>
          </div>
          <div className="ml-auto flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs h-8 border-slate-600"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Voir source
            </Button>
            <Button 
              size="sm" 
              className="text-xs h-8 bg-blue-600 hover:bg-blue-700"
            >
              <FileText className="h-3 w-3 mr-1" />
              Ajouter aux preuves
            </Button>
          </div>
        </div>
        
        <Separator className="bg-slate-700 my-3" />
        
        <div className="p-3 bg-slate-900 rounded-md mb-4">
          <h4 className="text-slate-300 text-sm font-medium mb-2">Description</h4>
          <p className="text-slate-200 text-sm">{record.content}</p>
        </div>
        
        <div className="p-3 bg-slate-900 rounded-md mb-4">
          <h4 className="text-slate-300 text-sm font-medium mb-2 flex justify-between">
            <span>Métadonnées</span>
            <span className="text-xs text-slate-400 flex items-center">
              <Lock className="h-3 w-3 mr-1" />
              Niveau d'accès: Autorisé
            </span>
          </h4>
          
          <div className="grid grid-cols-2 gap-x-8 gap-y-3">
            {Object.entries(record.metadata).map(([key, value]) => (
              <div key={key} className="flex justify-between border-b border-slate-800 pb-1">
                <span className="text-slate-400 text-sm capitalize">{key}:</span>
                <span className="text-white text-sm font-medium">{value.toString()}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-3 bg-slate-900 rounded-md mb-4">
          <h4 className="text-slate-300 text-sm font-medium mb-2">Métadonnées techniques</h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-800 p-2 rounded">
              <div className="text-xs text-slate-400 mb-1">Pertinence</div>
              <div className="flex items-center">
                <Progress value={record.relevance * 100} className="h-1.5 mr-2" />
                <span className="text-slate-200 text-xs">{Math.round(record.relevance * 100)}%</span>
              </div>
            </div>
            <div className="bg-slate-800 p-2 rounded">
              <div className="text-xs text-slate-400 mb-1">Valeur en tant que preuve</div>
              <div className="flex items-center gap-1">
                {record.evidenceValue === 'very_high' && (
                  <Badge className="bg-red-600 text-white text-xs">Très élevée</Badge>
                )}
                {record.evidenceValue === 'high' && (
                  <Badge className="bg-amber-600 text-white text-xs">Élevée</Badge>
                )}
                {record.evidenceValue === 'medium' && (
                  <Badge className="bg-blue-600 text-white text-xs">Moyenne</Badge>
                )}
                {record.evidenceValue === 'low' && (
                  <Badge className="bg-slate-600 text-white text-xs">Faible</Badge>
                )}
              </div>
            </div>
            <div className="bg-slate-800 p-2 rounded">
              <div className="text-xs text-slate-400 mb-1">Dernière mise à jour</div>
              <div className="text-slate-200 text-xs">{new Date(record.date).toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Afficher un enregistrement dans un format compact
  const renderCompactRecord = (record: DatabaseRecord) => {
    let icon;
    let colorClass;
    
    switch (record.type) {
      case 'person':
        icon = <User className="h-4 w-4" />;
        colorClass = 'text-blue-400';
        break;
      case 'organization':
        icon = <Building className="h-4 w-4" />;
        colorClass = 'text-emerald-400';
        break;
      case 'event':
        icon = <Calendar className="h-4 w-4" />;
        colorClass = 'text-amber-400';
        break;
      case 'article':
        icon = <FileText className="h-4 w-4" />;
        colorClass = 'text-purple-400';
        break;
      case 'property':
        icon = <MapPin className="h-4 w-4" />;
        colorClass = 'text-red-400';
        break;
      case 'financial':
        icon = <BriefcaseBusiness className="h-4 w-4" />;
        colorClass = 'text-green-400';
        break;
      default:
        icon = <Database className="h-4 w-4" />;
        colorClass = 'text-gray-400';
    }
    
    let primaryField = '';
    if (record.type === 'person' && record.metadata.name) {
      primaryField = record.metadata.name.toString();
    } else if (record.type === 'organization' && record.metadata.companyName) {
      primaryField = record.metadata.companyName.toString();
    } else if (record.type === 'event' && record.metadata.eventName) {
      primaryField = record.metadata.eventName.toString();
    } else if (record.type === 'property' && record.metadata.address) {
      primaryField = record.metadata.address.toString();
    } else {
      primaryField = record.title;
    }
    
    return (
      <div 
        className="p-3 bg-slate-800 rounded-lg border border-slate-700 hover:bg-slate-750 transition cursor-pointer"
        onClick={() => setSelectedRecord(record)}
      >
        <div className="flex items-start">
          <div className={`${colorClass} p-1 rounded bg-slate-700 mr-3 mt-0.5`}>
            {icon}
          </div>
          <div className="flex-1">
            <div className="flex justify-between">
              <h4 className="text-white text-sm font-medium mb-1">{primaryField}</h4>
              <Badge 
                className={`
                  ${record.evidenceValue === 'very_high' ? 'bg-red-600' : ''}
                  ${record.evidenceValue === 'high' ? 'bg-amber-600' : ''}
                  ${record.evidenceValue === 'medium' ? 'bg-blue-600' : ''}
                  ${record.evidenceValue === 'low' ? 'bg-slate-600' : ''}
                  text-white text-xs
                `}
              >
                {record.evidenceValue === 'very_high' ? 'Critique' : ''}
                {record.evidenceValue === 'high' ? 'Important' : ''}
                {record.evidenceValue === 'medium' ? 'Pertinent' : ''}
                {record.evidenceValue === 'low' ? 'Mineur' : ''}
              </Badge>
            </div>
            <p className="text-slate-300 text-xs mb-2 line-clamp-2">{record.content}</p>
            <div className="flex justify-between text-xs">
              <div className="text-slate-400 flex items-center">
                <Database className="h-3 w-3 mr-1" />
                {record.source}
              </div>
              <div className="text-slate-400 flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {new Date(record.date).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-hidden p-0 bg-slate-900 border-slate-700">
        <div className="flex h-full max-h-[90vh]">
          {/* Barre latérale de navigation */}
          <div className="w-[60px] bg-slate-950 border-r border-slate-800 p-2 flex flex-col items-center py-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`w-10 h-10 rounded-full p-0 mb-3 ${activeTab === 'search' ? 'bg-blue-900/30 text-blue-400' : 'text-slate-400'}`}
              onClick={() => setActiveTab('search')}
            >
              <Search className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`w-10 h-10 rounded-full p-0 mb-3 ${activeTab === 'tables' ? 'bg-green-900/30 text-green-400' : 'text-slate-400'}`}
              onClick={() => setActiveTab('tables')}
            >
              <TableProperties className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`w-10 h-10 rounded-full p-0 mb-3 ${activeTab === 'history' ? 'bg-amber-900/30 text-amber-400' : 'text-slate-400'}`}
              onClick={() => setActiveTab('history')}
            >
              <HistoryIcon className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`w-10 h-10 rounded-full p-0 mb-3 ${activeTab === 'info' ? 'bg-purple-900/30 text-purple-400' : 'text-slate-400'}`}
              onClick={() => setActiveTab('info')}
            >
              <DatabaseIcon className="h-5 w-5" />
            </Button>
            
            <div className="mt-auto">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-10 h-10 rounded-full p-0 text-slate-400"
                onClick={onClose}
              >
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          {/* Contenu principal */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* En-tête */}
            <div className="p-3 border-b border-slate-800 bg-slate-900 flex items-center">
              <Database className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0" />
              <div>
                <h2 className="text-white font-medium">{getDatabaseTitle()}</h2>
                <p className="text-slate-400 text-xs">
                  {dbStats.records.toLocaleString()} enregistrements • Dernière mise à jour: {dbStats.lastUpdated}
                </p>
              </div>
              
              <div className="ml-auto flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs h-8 border-slate-700"
                  onClick={onClose}
                >
                  Fermer
                </Button>
                <Button 
                  size="sm" 
                  className="text-xs h-8 bg-blue-600 hover:bg-blue-700"
                  disabled={searchResults.length === 0}
                >
                  <Download className="h-3 w-3 mr-1" />
                  Exporter
                </Button>
              </div>
            </div>
            
            {/* Zone de contenu principal */}
            <div className="flex-1 overflow-auto">
              {/* Onglet Recherche */}
              {activeTab === 'search' && (
                <div className="p-4">
                  {/* Modes de recherche */}
                  <div className="mb-4">
                    <div className="flex mb-2">
                      <Button 
                        variant={queryMode === 'simple' ? 'default' : 'outline'} 
                        size="sm"
                        className="rounded-r-none"
                        onClick={() => setQueryMode('simple')}
                      >
                        Recherche simple
                      </Button>
                      <Button 
                        variant={queryMode === 'advanced' ? 'default' : 'outline'} 
                        size="sm"
                        className="rounded-none"
                        onClick={() => setQueryMode('advanced')}
                      >
                        Recherche avancée
                      </Button>
                      <Button 
                        variant={queryMode === 'sql' ? 'default' : 'outline'} 
                        size="sm"
                        className="rounded-l-none"
                        onClick={() => setQueryMode('sql')}
                      >
                        SQL
                      </Button>
                    </div>
                    
                    {/* Interface de recherche simple */}
                    {queryMode === 'simple' && (
                      <div className="mb-4">
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <Input
                              className="bg-slate-800 border-slate-700 text-white"
                              placeholder="Nom, identifiant, mot-clé..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleDatabaseSearch()}
                            />
                          </div>
                          <Button 
                            onClick={handleDatabaseSearch} 
                            disabled={isLoading}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            {isLoading ? (
                              <Clock className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <Search className="h-4 w-4 mr-2" />
                            )}
                            Rechercher
                          </Button>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mt-3">
                          {activeFilter !== 'all' && (
                            <Badge 
                              className="bg-blue-600 flex gap-1 pr-1 cursor-pointer"
                              onClick={() => setActiveFilter('all')}
                            >
                              <span>Filtre: {activeFilter}</span>
                              <span className="bg-blue-700 hover:bg-blue-800 p-0.5 rounded-sm">×</span>
                            </Badge>
                          )}
                          <Badge className="bg-slate-700 hover:bg-slate-600 cursor-pointer" onClick={() => setActiveFilter('person')}>
                            <User className="h-3 w-3 mr-1" />
                            Personnes
                          </Badge>
                          <Badge className="bg-slate-700 hover:bg-slate-600 cursor-pointer" onClick={() => setActiveFilter('organization')}>
                            <Building className="h-3 w-3 mr-1" />
                            Organisations
                          </Badge>
                          <Badge className="bg-slate-700 hover:bg-slate-600 cursor-pointer" onClick={() => setActiveFilter('event')}>
                            <Calendar className="h-3 w-3 mr-1" />
                            Événements
                          </Badge>
                          <Badge className="bg-slate-700 hover:bg-slate-600 cursor-pointer" onClick={() => setActiveFilter('article')}>
                            <FileText className="h-3 w-3 mr-1" />
                            Articles
                          </Badge>
                        </div>
                      </div>
                    )}
                    
                    {/* Interface de recherche avancée */}
                    {queryMode === 'advanced' && (
                      <div className="mb-4 bg-slate-850 border border-slate-700 rounded-md p-3">
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div>
                            <Label htmlFor="searchTerm" className="text-white text-sm mb-1 block">Termes de recherche</Label>
                            <Input
                              id="searchTerm"
                              className="bg-slate-800 border-slate-700 text-white"
                              placeholder="Nom, identifiant, mot-clé..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="recordType" className="text-white text-sm mb-1 block">Type d'enregistrement</Label>
                            <Select
                              onValueChange={(value) => setActiveFilter(value)}
                              defaultValue={activeFilter}
                            >
                              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                                <SelectValue placeholder="Tous types" />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                                <SelectItem value="all">Tous types</SelectItem>
                                <SelectItem value="person">Personnes</SelectItem>
                                <SelectItem value="organization">Organisations</SelectItem>
                                <SelectItem value="event">Événements</SelectItem>
                                <SelectItem value="article">Publications</SelectItem>
                                <SelectItem value="property">Propriétés</SelectItem>
                                <SelectItem value="financial">Données financières</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-3 mb-3">
                          <div>
                            <Label htmlFor="fromDate" className="text-white text-sm mb-1 block">Date début</Label>
                            <Input
                              id="fromDate"
                              type="date"
                              className="bg-slate-800 border-slate-700 text-white"
                            />
                          </div>
                          <div>
                            <Label htmlFor="toDate" className="text-white text-sm mb-1 block">Date fin</Label>
                            <Input
                              id="toDate"
                              type="date"
                              className="bg-slate-800 border-slate-700 text-white"
                            />
                          </div>
                          <div>
                            <Label htmlFor="source" className="text-white text-sm mb-1 block">Source de données</Label>
                            <Select defaultValue="all">
                              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                                <SelectValue placeholder="Toutes sources" />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                                <SelectItem value="all">Toutes sources</SelectItem>
                                <SelectItem value="registry">Registres nationaux</SelectItem>
                                <SelectItem value="commercial">Registres commerciaux</SelectItem>
                                <SelectItem value="public">Publications publiques</SelectItem>
                                <SelectItem value="legal">Documents légaux</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 mb-3">
                          <Checkbox id="exactMatch" />
                          <Label htmlFor="exactMatch" className="text-white text-sm">Correspondance exacte</Label>
                        </div>
                        
                        <Button 
                          onClick={handleDatabaseSearch} 
                          disabled={isLoading}
                          className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                          {isLoading ? (
                            <Clock className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Search className="h-4 w-4 mr-2" />
                          )}
                          Rechercher
                        </Button>
                      </div>
                    )}
                    
                    {/* Interface SQL */}
                    {queryMode === 'sql' && (
                      <div className="mb-4">
                        <div className="bg-slate-950 border border-slate-800 rounded-md p-3 mb-3 font-mono text-sm text-slate-300 whitespace-pre overflow-x-auto">
                          {sqlQuery}
                        </div>
                        <div className="flex justify-between">
                          <div className="text-xs text-slate-400 flex items-center">
                            <Terminal className="h-3 w-3 mr-1" />
                            Éditeur SQL
                          </div>
                          <Button 
                            onClick={handleDatabaseSearch} 
                            disabled={isLoading}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            {isLoading ? (
                              <Clock className="h-3 w-3 animate-spin mr-1" />
                            ) : (
                              <Terminal className="h-3 w-3 mr-1" />
                            )}
                            Exécuter
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Indicateur de chargement */}
                  {isLoading && (
                    <div className="mb-4">
                      <div className="text-xs text-slate-400 flex justify-between mb-1">
                        <span>Exécution de la requête...</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-1" />
                    </div>
                  )}
                  
                  {/* Résultats de recherche */}
                  {!isLoading && searchResults.length > 0 && !selectedRecord && (
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <div className="text-white">
                          <span className="font-medium">{displayResults.length}</span>
                          <span className="text-slate-400 ml-1 text-sm">résultats trouvés</span>
                          {executionTime && (
                            <span className="text-slate-400 ml-2 text-xs">
                              ({executionTime.toFixed(2)} secondes)
                            </span>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <Select 
                            defaultValue={sortField}
                            onValueChange={setSortField}
                          >
                            <SelectTrigger className="w-[140px] h-8 text-xs bg-slate-800 border-slate-700">
                              <SelectValue placeholder="Tri par" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700 text-white">
                              <SelectItem value="relevance">Pertinence</SelectItem>
                              <SelectItem value="date">Date</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 text-xs border-slate-700"
                            onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                          >
                            {sortDirection === 'desc' ? '↓ Desc' : '↑ Asc'}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        {displayResults.map(record => renderCompactRecord(record))}
                      </div>
                    </div>
                  )}
                  
                  {/* Affichage détaillé d'un enregistrement */}
                  {selectedRecord && renderDetailedView(selectedRecord)}
                  
                  {/* Etat initial ou aucun résultat */}
                  {!isLoading && searchResults.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                      <Database className="h-16 w-16 mb-3 opacity-20" />
                      <h3 className="text-lg font-medium text-slate-300 mb-1">Base de données prête</h3>
                      <p className="text-sm max-w-md text-center mb-4">
                        Utilisez la barre de recherche pour interroger la base de données 
                        et trouver des informations pertinentes pour votre enquête.
                      </p>
                      <div className="text-xs border border-slate-700 rounded p-2 bg-slate-800 max-w-sm">
                        <div className="flex items-center mb-1">
                          <Terminal className="h-3 w-3 mr-1 text-green-400" />
                          <span className="text-green-400 font-medium">Astuce de recherche</span>
                        </div>
                        <p>
                          Utilisez des opérateurs comme "AND", "OR" et des guillemets pour des 
                          recherches précises. Par exemple: "Jean Dupont" AND "Paris".
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Note légale */}
                  {(searchResults.length > 0 || isLoading) && (
                    <div className="mt-4 pt-2 border-t border-slate-800 text-xs text-slate-400 flex items-start">
                      <AlertTriangle className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0 text-amber-500" />
                      <span>
                        Ces données sont fournies à des fins d'enquête uniquement. Leur utilisation est soumise aux 
                        réglementations en vigueur concernant la protection des données personnelles.
                      </span>
                    </div>
                  )}
                </div>
              )}
              
              {/* Onglet Tables */}
              {activeTab === 'tables' && (
                <div className="p-4">
                  <h3 className="text-white font-medium mb-3">Structure de la base de données</h3>
                  <div className="mb-4">
                    <Input
                      className="bg-slate-800 border-slate-700 text-white mb-3"
                      placeholder="Filtrer les tables..."
                    />
                    
                    <div className="bg-slate-850 border border-slate-700 rounded">
                      <Table>
                        <TableHeader className="bg-slate-900">
                          <TableRow className="hover:bg-slate-800 border-slate-700">
                            <TableHead className="text-slate-300">Nom de la table</TableHead>
                            <TableHead className="text-slate-300">Enregistrements</TableHead>
                            <TableHead className="text-slate-300">Dernière mise à jour</TableHead>
                            <TableHead className="text-right text-slate-300">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow className="hover:bg-slate-800 border-slate-700">
                            <TableCell className="font-medium text-white">persons</TableCell>
                            <TableCell>546,218</TableCell>
                            <TableCell>2025-04-01</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" className="h-7 text-xs">
                                Voir le schéma
                              </Button>
                            </TableCell>
                          </TableRow>
                          <TableRow className="hover:bg-slate-800 border-slate-700">
                            <TableCell className="font-medium text-white">organizations</TableCell>
                            <TableCell>187,453</TableCell>
                            <TableCell>2025-04-01</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" className="h-7 text-xs">
                                Voir le schéma
                              </Button>
                            </TableCell>
                          </TableRow>
                          <TableRow className="hover:bg-slate-800 border-slate-700">
                            <TableCell className="font-medium text-white">properties</TableCell>
                            <TableCell>349,782</TableCell>
                            <TableCell>2025-03-28</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" className="h-7 text-xs">
                                Voir le schéma
                              </Button>
                            </TableCell>
                          </TableRow>
                          <TableRow className="hover:bg-slate-800 border-slate-700">
                            <TableCell className="font-medium text-white">events</TableCell>
                            <TableCell>84,569</TableCell>
                            <TableCell>2025-03-15</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" className="h-7 text-xs">
                                Voir le schéma
                              </Button>
                            </TableCell>
                          </TableRow>
                          <TableRow className="hover:bg-slate-800 border-slate-700">
                            <TableCell className="font-medium text-white">documents</TableCell>
                            <TableCell>674,541</TableCell>
                            <TableCell>2025-04-02</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" className="h-7 text-xs">
                                Voir le schéma
                              </Button>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Onglet Historique */}
              {activeTab === 'history' && (
                <div className="p-4">
                  <h3 className="text-white font-medium mb-3">Historique des recherches</h3>
                  <div className="bg-slate-850 border border-slate-700 rounded-md overflow-hidden">
                    <Table>
                      <TableHeader className="bg-slate-900">
                        <TableRow className="hover:bg-slate-800 border-slate-700">
                          <TableHead className="text-slate-300">Requête</TableHead>
                          <TableHead className="text-slate-300">Type</TableHead>
                          <TableHead className="text-slate-300">Heure</TableHead>
                          <TableHead className="text-right text-slate-300">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {queryHistory.map((query, index) => (
                          <TableRow key={index} className="hover:bg-slate-800 border-slate-700">
                            <TableCell className="font-medium text-white">{query}</TableCell>
                            <TableCell>
                              <Badge className="bg-blue-600 text-white">Simple</Badge>
                            </TableCell>
                            <TableCell>Il y a quelques minutes</TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 text-xs mr-1"
                                onClick={() => setSearchQuery(query)}
                              >
                                <Copy className="h-3 w-3 mr-1" />
                                Copier
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 text-xs"
                                onClick={() => {
                                  setSearchQuery(query);
                                  handleDatabaseSearch();
                                }}
                              >
                                <Search className="h-3 w-3 mr-1" />
                                Relancer
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {queryHistory.length === 0 && (
                          <TableRow className="hover:bg-slate-800 border-slate-700">
                            <TableCell colSpan={4} className="text-center text-slate-400 py-6">
                              <Clock className="h-8 w-8 mx-auto mb-2 opacity-20" />
                              Aucun historique de recherche
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
              
              {/* Onglet Informations */}
              {activeTab === 'info' && (
                <div className="p-4">
                  <h3 className="text-white font-medium mb-3">Informations sur la base de données</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-slate-850 border border-slate-700 rounded-md p-3">
                      <h4 className="text-slate-300 text-sm font-medium mb-2">Statistiques</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-slate-400 text-sm">Nombre de tables:</span>
                          <span className="text-white text-sm font-medium">{dbStats.tables}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 text-sm">Total d'enregistrements:</span>
                          <span className="text-white text-sm font-medium">{dbStats.records.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 text-sm">Taille de la base:</span>
                          <span className="text-white text-sm font-medium">{dbStats.size}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 text-sm">Dernière mise à jour:</span>
                          <span className="text-white text-sm font-medium">{dbStats.lastUpdated}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-slate-850 border border-slate-700 rounded-md p-3">
                      <h4 className="text-slate-300 text-sm font-medium mb-2">Accès et utilisation</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-slate-400 text-sm">Niveau d'accès:</span>
                          <Badge className="bg-green-600 text-white">Autorisé</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 text-sm">Limite de requêtes:</span>
                          <span className="text-white text-sm font-medium">{dbStats.queryLimit} / jour</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 text-sm">Connexions actives:</span>
                          <span className="text-white text-sm font-medium">{dbStats.connections}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 text-sm">Type de base:</span>
                          <span className="text-white text-sm font-medium">PostgreSQL 15.3</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-amber-950/20 border border-amber-800/30 rounded-md p-3 mb-4">
                    <div className="flex items-start">
                      <AlertTriangle className="h-4 w-4 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <h4 className="text-amber-400 font-medium mb-1">Avertissement légal</h4>
                        <p className="text-amber-300/80">
                          Cette base de données contient des informations à caractère personnel et sensible.
                          Son utilisation est strictement réservée aux professionnels autorisés dans le cadre
                          d'enquêtes légitimes. Toute utilisation abusive est susceptible de poursuites judiciaires.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-850 border border-slate-700 rounded-md p-3">
                    <h4 className="text-slate-300 text-sm font-medium mb-2">Règles d'utilisation</h4>
                    <ul className="space-y-2 text-sm text-slate-400">
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Utilisez des requêtes spécifiques pour optimiser les résultats et les performances.</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Les sessions sont automatiquement fermées après 30 minutes d'inactivité.</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Toutes les recherches sont journalisées et peuvent faire l'objet d'un audit.</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>L'exportation des données est limitée à 1000 enregistrements par opération.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};