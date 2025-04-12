import React, { useState, useEffect } from 'react';
import { HomeLayout } from '@/components/layout/HomeLayout';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Info, Search, Database, Globe, User, FileText, AlertTriangle, Computer } from 'lucide-react';
import { OsintGame } from './game';
import { SearchInterface } from './SearchInterface';
import { SocialMediaViewer } from './SocialMediaViewer';
import { DatabaseViewer } from './DatabaseViewer';
import { CaseData, InvestigationResult } from './types';

export default function OsintInvestigatorPage() {
  // États pour le jeu
  const [currentCase, setCurrentCase] = useState<CaseData | null>(null);
  const [cases, setCases] = useState<CaseData[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentView, setCurrentView] = useState<'search' | 'social' | 'results'>('search');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [collectedEvidence, setCollectedEvidence] = useState<any[]>([]);
  const [showHelp, setShowHelp] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [searchDialogVisible, setSearchDialogVisible] = useState(false);
  const [currentSearchEngine, setCurrentSearchEngine] = useState<string>('general');
  
  // Interface de recherche actuellement ouverte
  const [currentSearch, setCurrentSearch] = useState<any | null>(null);
  
  // Difficulté du jeu
  const [difficulty, setDifficulty] = useState<'débutant' | 'intermédiaire' | 'expert'>('débutant');
  
  // Résultat final de l'enquête
  const [investigationResult, setInvestigationResult] = useState<InvestigationResult | null>(null);

  // Charger les données de cas
  useEffect(() => {
    // Simulation de données pour l'exemple
    const mockCases: CaseData[] = [
      {
        id: 'case-001',
        title: 'Disparition suspecte',
        description: "Une personne a disparu après avoir posté des messages étranges sur les réseaux sociaux. Votre mission est de retracer son activité numérique pour déterminer sa localisation potentielle.",
        difficulty: 'débutant',
        objectives: [
          "Identifier tous les comptes de réseaux sociaux de la personne",
          "Recueillir des indices sur sa possible destination",
          "Analyser ses dernières publications pour des signes d'alerte",
          "Reconstituer son emploi du temps des 48 dernières heures"
        ],
        hints: [
          "Commencez par rechercher son nom complet et son pseudonyme",
          "Vérifiez les métadonnées des photos pour les informations de localisation",
          "Les réseaux secondaires peuvent contenir des informations plus révélatrices"
        ]
      },
      {
        id: 'case-002',
        title: 'Analyse de menace cybernétique',
        description: "Une entreprise a reçu des menaces d'attaque informatique. Votre tâche est d'enquêter sur la source potentielle de ces menaces en utilisant uniquement des données en sources ouvertes.",
        difficulty: 'intermédiaire',
        objectives: [
          "Identifier le groupe ou individu à l'origine des menaces",
          "Trouver des preuves d'attaques similaires précédentes",
          "Déterminer les techniques d'attaque probables",
          "Évaluer le niveau de risque réel"
        ],
        hints: [
          "Recherchez des signatures numériques spécifiques dans les messages de menace",
          "Les forums spécialisés peuvent contenir des discussions sur des attaques similaires",
          "Analysez le style d'écriture pour des indices linguistiques"
        ]
      },
      {
        id: 'case-003',
        title: 'Vérification d'identité numérique',
        description: "Un candidat à un poste sensible présente un profil suspect. Votre mission est de vérifier l'authenticité de son identité en ligne et de révéler toute information douteuse.",
        difficulty: 'expert',
        objectives: [
          "Vérifier l'authenticité de tous les profils professionnels",
          "Identifier toute incohérence dans son parcours professionnel déclaré",
          "Découvrir des comptes secondaires ou cachés",
          "Évaluer sa réputation en ligne et ses associations"
        ],
        hints: [
          "Comparez les photos de profil avec des outils de recherche inverse d'images",
          "Utilisez l'historique web archivé pour vérifier les changements dans ses profils",
          "Les commentaires et interactions peuvent révéler des relations cachées"
        ]
      }
    ];
    
    setCases(mockCases);
  }, []);

  // Sélectionner un cas
  const selectCase = (caseId: string) => {
    const selectedCase = cases.find(c => c.id === caseId);
    if (selectedCase) {
      setCurrentCase(selectedCase);
      setGameStarted(true);
      setShowIntro(false);
      setCollectedEvidence([]);
      setSearchResults([]);
      setInvestigationResult(null);
    }
  };

  // Ouvrir l'interface de recherche
  const openSearchInterface = (searchType: string) => {
    setCurrentSearchEngine(searchType);
    setCurrentSearch({
      type: searchType,
      query: ''
    });
    setSearchDialogVisible(true);
  };

  // Effectuer une recherche
  const performSearch = (query: string) => {
    // Simulation de résultats de recherche
    const mockResults = [
      {
        id: `result-${Date.now()}-1`,
        title: `Résultat pour "${query}" - Source 1`,
        content: `Information liée à la recherche "${query}". Cette source semble contenir des données pertinentes pour votre enquête.`,
        type: 'web',
        relevance: 0.85,
        source: 'Site d\'actualités'
      },
      {
        id: `result-${Date.now()}-2`,
        title: `Données ${query} - Source 2`,
        content: `Autre information concernant "${query}" qui pourrait être utile pour votre investigation.`,
        type: 'document',
        relevance: 0.72,
        source: 'Base de données publique'
      },
      {
        id: `result-${Date.now()}-3`,
        title: `Profil associé à ${query}`,
        content: `Un profil en ligne qui semble lié à votre recherche sur "${query}". Il contient plusieurs informations personnelles.`,
        type: 'profile',
        relevance: 0.91,
        source: 'Réseau social'
      }
    ];
    
    setSearchResults(prev => [...prev, ...mockResults]);
    setSearchDialogVisible(false);
  };

  // Ajouter une preuve à la collection
  const addEvidence = (item: any) => {
    setCollectedEvidence(prev => {
      // Éviter les doublons en vérifiant si l'élément existe déjà
      if (prev.some(evidence => evidence.id === item.id)) {
        return prev;
      }
      return [...prev, item];
    });
  };

  // Soumettre le rapport final
  const submitReport = () => {
    // Évaluer la qualité de l'enquête basée sur les preuves collectées
    const evidenceScore = collectedEvidence.length * 20; // Simple score basé sur le nombre de preuves
    const successThreshold = 60; // Seuil pour considérer l'enquête comme réussie
    
    const successLevel = evidenceScore >= successThreshold ? 'success' : 'partial';
    
    // Générer un rapport d'enquête
    const result: InvestigationResult = {
      caseId: currentCase?.id || '',
      caseTitle: currentCase?.title || '',
      evidenceCollected: collectedEvidence,
      score: evidenceScore,
      maxScore: 100,
      status: successLevel,
      conclusion: successLevel === 'success'
        ? "Félicitations ! Votre enquête OSINT a permis de rassembler suffisamment de preuves pour résoudre l'affaire."
        : "Enquête incomplète. Vous n'avez pas rassemblé suffisamment de preuves pour tirer des conclusions définitives."
    };
    
    setInvestigationResult(result);
    setGameCompleted(true);
  };

  return (
    <HomeLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">OSINT Investigator</h1>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => setShowHelp(true)}>
              <Info className="h-4 w-4 mr-2" />
              Aide
            </Button>
            {gameStarted && (
              <Button variant="outline" onClick={() => {
                setGameStarted(false);
                setShowIntro(true);
                setCurrentCase(null);
              }}>
                Quitter l'enquête
              </Button>
            )}
          </div>
        </div>
        
        {!gameStarted ? (
          // Écran d'introduction et de sélection de cas
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Bienvenue dans OSINT Investigator
            </h2>
            <p className="text-gray-300 mb-6">
              Mettez vos compétences d'investigation en ligne à l'épreuve dans ce simulateur réaliste de recherche en sources ouvertes (OSINT).
              Choisissez une affaire à résoudre et utilisez différents outils numériques pour collecter des informations et résoudre l'énigme.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {cases.map(caseItem => (
                <div key={caseItem.id} className="bg-gray-700 rounded-lg p-4 border border-gray-600 hover:border-blue-500 transition-all">
                  <h3 className="text-lg font-medium text-white mb-2">{caseItem.title}</h3>
                  <div className="mb-2">
                    <span className={`px-2 py-1 text-xs rounded ${
                      caseItem.difficulty === 'débutant' ? 'bg-green-700 text-green-100' : 
                      caseItem.difficulty === 'intermédiaire' ? 'bg-yellow-700 text-yellow-100' : 
                      'bg-red-700 text-red-100'
                    }`}>
                      {caseItem.difficulty}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm mb-4">{caseItem.description}</p>
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700" 
                    onClick={() => selectCase(caseItem.id)}
                  >
                    Sélectionner
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="bg-gray-700/50 rounded-lg p-4">
              <h3 className="font-semibold text-white mb-2">Qu'est-ce que l'OSINT ?</h3>
              <p className="text-gray-300 text-sm">
                L'Open Source Intelligence (OSINT) désigne la collecte et l'analyse d'informations provenant de sources publiquement accessibles 
                comme les médias, internet, et les bases de données publiques. Ces techniques sont utilisées par les professionnels de la cybersécurité, 
                les journalistes d'investigation, et les chercheurs pour recueillir des renseignements sans avoir recours à des méthodes intrusives.
              </p>
            </div>
          </div>
        ) : (
          // Interface principale du jeu
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Panneau latéral gauche - Informations sur l'affaire */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-white mb-3 flex items-center">
                <FileText className="h-5 w-5 text-blue-400 mr-2" />
                Dossier d'enquête
              </h2>
              
              <div className="mb-4">
                <h3 className="font-medium text-white text-md">{currentCase?.title}</h3>
                <p className="text-gray-300 text-sm my-2">{currentCase?.description}</p>
                
                <div className="mt-4 space-y-2">
                  <h4 className="text-sm font-medium text-white">Objectifs:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
                    {currentCase?.objectives.map((objective, index) => (
                      <li key={index}>{objective}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="border-t border-gray-700 pt-4 mt-4">
                <h3 className="font-medium text-white text-md mb-2">Outils disponibles</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="text-sm justify-start" onClick={() => openSearchInterface('general')}>
                    <Globe className="h-4 w-4 mr-2" />
                    Recherche Web
                  </Button>
                  <Button variant="outline" className="text-sm justify-start" onClick={() => openSearchInterface('social')}>
                    <User className="h-4 w-4 mr-2" />
                    Réseaux Sociaux
                  </Button>
                  <Button variant="outline" className="text-sm justify-start" onClick={() => openSearchInterface('database')}>
                    <Database className="h-4 w-4 mr-2" />
                    Bases de Données
                  </Button>
                  <Button variant="outline" className="text-sm justify-start" onClick={() => openSearchInterface('advanced')}>
                    <Computer className="h-4 w-4 mr-2" />
                    Outils Avancés
                  </Button>
                </div>
              </div>
              
              {/* Section Indice */}
              <div className="bg-gray-700/50 rounded p-3 mt-6">
                <h4 className="text-sm font-medium text-white flex items-center">
                  <Info className="h-4 w-4 text-blue-400 mr-1" />
                  Indice
                </h4>
                <p className="text-gray-300 text-xs mt-1">
                  {currentCase?.hints[0]}
                </p>
              </div>
              
              {/* Bouton de soumission du rapport */}
              <Button 
                className="w-full mt-6 bg-green-600 hover:bg-green-700" 
                onClick={submitReport}
                disabled={collectedEvidence.length === 0}
              >
                Soumettre le rapport d'enquête
              </Button>
            </div>
            
            {/* Panneau central - Zone de recherche et résultats */}
            <div className="lg:col-span-2 space-y-6">
              {/* Tabs de navigation entre les différentes vues */}
              <Tabs defaultValue="search" className="w-full" onValueChange={(v) => setCurrentView(v as any)}>
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="search">Recherches</TabsTrigger>
                  <TabsTrigger value="social">Réseaux Sociaux</TabsTrigger>
                  <TabsTrigger value="results">Preuves Collectées</TabsTrigger>
                </TabsList>
                
                <TabsContent value="search" className="mt-0">
                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-white">Résultats de recherche</h3>
                      <Button onClick={() => openSearchInterface('general')}>
                        <Search className="h-4 w-4 mr-2" />
                        Nouvelle recherche
                      </Button>
                    </div>
                    
                    {searchResults.length === 0 ? (
                      <div className="text-center py-12 text-gray-400">
                        <Search className="h-10 w-10 mx-auto mb-3 opacity-20" />
                        <p>Aucune recherche effectuée</p>
                        <p className="text-sm mt-1">Utilisez les outils de recherche pour trouver des informations</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {searchResults.map(result => (
                          <div key={result.id} className="bg-gray-700 rounded p-3 border border-gray-600">
                            <div className="flex justify-between">
                              <h4 className="text-white font-medium">{result.title}</h4>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-6 px-2 text-xs"
                                onClick={() => addEvidence(result)}
                              >
                                Ajouter aux preuves
                              </Button>
                            </div>
                            <p className="text-gray-300 text-sm mt-1">{result.content}</p>
                            <div className="flex mt-2 text-xs text-gray-400">
                              <span className="mr-3">Source: {result.source}</span>
                              <span>Pertinence: {(result.relevance * 100).toFixed(0)}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="social" className="mt-0">
                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-white">Profils de réseaux sociaux</h3>
                      <Button onClick={() => openSearchInterface('social')}>
                        <User className="h-4 w-4 mr-2" />
                        Rechercher un profil
                      </Button>
                    </div>
                    
                    {/* Zone pour le rendu des profils sociaux */}
                    <SocialMediaViewer 
                      profiles={[]} 
                      addEvidence={addEvidence}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="results" className="mt-0">
                  <div className="bg-gray-800 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-4">Preuves collectées ({collectedEvidence.length})</h3>
                    
                    {collectedEvidence.length === 0 ? (
                      <div className="text-center py-12 text-gray-400">
                        <FileText className="h-10 w-10 mx-auto mb-3 opacity-20" />
                        <p>Aucune preuve collectée</p>
                        <p className="text-sm mt-1">Ajoutez des éléments à votre dossier depuis les résultats de recherche</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {collectedEvidence.map(evidence => (
                          <div key={evidence.id} className="bg-gray-700 rounded p-3 border border-gray-600">
                            <h4 className="text-white font-medium">{evidence.title}</h4>
                            <p className="text-gray-300 text-sm mt-1">{evidence.content}</p>
                            <div className="flex mt-2 text-xs text-gray-400">
                              <span className="mr-3">Source: {evidence.source}</span>
                              <span>Type: {evidence.type}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
      </div>
      
      {/* Dialogue d'aide */}
      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl">Comment jouer à OSINT Investigator</DialogTitle>
          </DialogHeader>
          
          <div className="py-4 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-white">Mener l'enquête</h3>
                <p className="text-sm">Utilisez les différents outils de recherche pour collecter des informations sur l'affaire. Chaque type de recherche révèle différents aspects.</p>
              </div>
              
              <div>
                <h3 className="font-medium text-white">Collecter des preuves</h3>
                <p className="text-sm">Ajoutez les informations pertinentes à votre dossier de preuves. Plus vous collectez de preuves pertinentes, plus votre rapport final sera complet.</p>
              </div>
              
              <div>
                <h3 className="font-medium text-white">Analyser les données</h3>
                <p className="text-sm">Examinez les profils sociaux, bases de données et autres sources pour établir des connexions entre les différentes informations.</p>
              </div>
              
              <div>
                <h3 className="font-medium text-white">Soumettre un rapport</h3>
                <p className="text-sm">Une fois que vous pensez avoir rassemblé suffisamment de preuves, soumettez votre rapport final pour résoudre l'affaire.</p>
              </div>
            </div>
            
            <div className="bg-gray-700/50 rounded-lg p-4">
              <h3 className="font-bold text-blue-400 mb-2">Techniques OSINT simulées</h3>
              <ul className="space-y-1 text-sm pl-4 list-disc">
                <li>Recherche par mots-clés sur différents moteurs de recherche</li>
                <li>Analyse de profils sur les réseaux sociaux</li>
                <li>Consultation de bases de données publiques</li>
                <li>Recherche d'images inversée</li>
                <li>Analyse de métadonnées de fichiers</li>
                <li>Cartographie de réseaux de connexions</li>
              </ul>
            </div>
          </div>
          
          <DialogFooter>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowHelp(false)}>
              J'ai compris
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialogue de fin de jeu */}
      <Dialog open={gameCompleted} onOpenChange={setGameCompleted}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center">
              {investigationResult?.status === 'success' ? (
                <Check className="w-6 h-6 text-emerald-400 mr-2" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-amber-400 mr-2" />
              )}
              Rapport d'enquête OSINT
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <div className="bg-gray-700/50 rounded-lg p-4">
              <h3 className="font-bold text-xl text-blue-400 mb-2">Affaire: {investigationResult?.caseTitle}</h3>
              
              <div className="space-y-4 text-gray-300">
                <p>{investigationResult?.conclusion}</p>
                
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span>Score d'investigation:</span>
                    <span className="font-bold text-lg">{investigationResult?.score}/{investigationResult?.maxScore}</span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${investigationResult?.status === 'success' ? 'bg-green-500' : 'bg-amber-500'}`}
                      style={{ width: `${(investigationResult?.score || 0) / (investigationResult?.maxScore || 100) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="font-medium text-white mb-2">Preuves collectées:</h4>
                  <ul className="space-y-1 text-sm">
                    {investigationResult?.evidenceCollected.map((evidence, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-blue-400 mr-2">•</span>
                        <span>{evidence.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="mt-6 space-y-2 text-sm text-gray-300">
              <p><span className="font-medium text-blue-300">Ce que vous avez appris :</span></p>
              <ul className="list-disc list-inside space-y-1 pl-4">
                <li>Comment formuler des requêtes de recherche efficaces</li>
                <li>Analyser les informations provenant de différentes sources</li>
                <li>Établir des connexions entre des données apparemment disparates</li>
                <li>Évaluer la crédibilité et la pertinence des informations trouvées</li>
              </ul>
            </div>
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row gap-3">
            <Button 
              variant="outline" 
              className="border-gray-600 text-gray-300"
              onClick={() => {
                setGameCompleted(false);
                setGameStarted(false);
                setShowIntro(true);
                setCurrentCase(null);
              }}
            >
              Retour à l'accueil
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                setGameCompleted(false);
                // Relancer la même mission
                setCollectedEvidence([]);
                setSearchResults([]);
              }}
            >
              Refaire cette enquête
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Interface de recherche */}
      {searchDialogVisible && currentSearch && (
        <SearchInterface
          isOpen={searchDialogVisible}
          onClose={() => setSearchDialogVisible(false)}
          searchType={currentSearchEngine}
          onSearch={performSearch}
        />
      )}
    </HomeLayout>
  );
}