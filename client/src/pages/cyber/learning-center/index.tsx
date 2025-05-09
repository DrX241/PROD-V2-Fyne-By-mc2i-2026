import React, { useState } from 'react';
import { Link } from 'wouter';
import {
  ArrowLeft,
  BookOpen,
  Cpu,
  GraduationCap,
  Clock,
  Users,
  Shield,
  Lock,
  Database,
  Code,
  LineChart,
  Network,
  Wifi,
  FileText,
  Search,
  Folder,
  Monitor,
  Calendar,
  Star
} from 'lucide-react';

import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

// Définition des modules d'apprentissage
const learningModules = [
  {
    id: 'intro-cybersecurite',
    title: 'Introduction à la cybersécurité',
    description: 'Fondamentaux et principes essentiels',
    icon: <Shield className="h-4 w-4" />,
    category: 'fondamentaux',
    difficulty: 'débutant',
    duration: '45 min',
    progress: 0,
    topics: ['Menaces', 'Acteurs', 'Défense']
  },
  {
    id: 'modelisation-risques',
    title: 'Modélisation des menaces',
    description: 'Analyser et prioriser les risques',
    icon: <LineChart className="h-4 w-4" />,
    category: 'analyse',
    difficulty: 'intermédiaire',
    duration: '60 min',
    progress: 0,
    topics: ['STRIDE', 'DREAD', 'Cartographie']
  },
  {
    id: 'analyse-risques',
    title: 'Analyse et quantification des risques cyber',
    description: 'Évaluation, mesure et priorisation des risques',
    icon: <LineChart className="h-4 w-4" />,
    category: 'analyse',
    difficulty: 'intermédiaire',
    duration: '60 min',
    progress: 0,
    topics: ['EBIOS RM', 'Méthodes', 'Outils']
  },
  {
    id: 'normes-standards',
    title: 'Normes et standards de cybersécurité',
    description: 'Cadres règlementaires et meilleures pratiques',
    icon: <FileText className="h-4 w-4" />,
    category: 'gouvernance',
    difficulty: 'intermédiaire', 
    duration: '75 min',
    progress: 0,
    topics: ['ISO 27001', 'NIST', 'RGPD']
  },
  {
    id: 'glossaire-visuel',
    title: 'Glossaire visuel cybersécurité',
    description: 'Définitions illustrées des concepts clés',
    icon: <BookOpen className="h-4 w-4" />,
    category: 'fondamentaux',
    difficulty: 'tous niveaux',
    duration: 'référence',
    progress: 0,
    topics: ['Termes', 'Concepts', 'Technologies']
  },
  {
    id: 'fiches-cyber-express',
    title: 'Fiches Cyber Express',
    description: 'Mémos synthétiques et personnalisables',
    icon: <FileText className="h-4 w-4" />,
    category: 'outils',
    difficulty: 'tous niveaux',
    duration: 'variable',
    progress: 0,
    topics: ['Résumés', 'Références', 'Pratiques']
  },
  {
    id: 'quiz-adaptatif-ia',
    title: 'Quiz adaptatif IA',
    description: 'Évaluations personnalisées de vos connaissances',
    icon: <Cpu className="h-4 w-4" />,
    category: 'évaluation',
    difficulty: 'adaptatif',
    duration: '15-30 min',
    progress: 0,
    topics: ['Tests', 'Adaptabilité', 'Progression']
  },
  {
    id: 'memo-ia-personnalise',
    title: 'Mémo IA personnalisé',
    description: 'Notes et aides-mémoire générés par IA',
    icon: <Cpu className="h-4 w-4" />,
    category: 'outils',
    difficulty: 'tous niveaux',
    duration: 'variable',
    progress: 0,
    topics: ['Notes', 'Révisions', 'Personnalisation']
  },
];

// Définition des parcours d'apprentissage thématiques
const learningPaths = [
  {
    id: 'securite-reseau',
    title: 'Sécurité des réseaux',
    description: 'Protection, surveillance et architecture sécurisée des réseaux',
    icon: <Network className="h-4 w-4" />,
    duration: '6h total',
    gradient: 'from-blue-700 to-cyan-500',
    modules: ['intro-cybersecurite', 'securite-perimetre', 'securite-reseaux-avancee']
  },
  {
    id: 'gouvernance-cybersecurite',
    title: 'Gouvernance cybersécurité',
    description: 'Politiques, normes et gestion des risques',
    icon: <Users className="h-4 w-4" />,
    duration: '7h total',
    gradient: 'from-indigo-600 to-violet-500',
    modules: ['modelisation-risques', 'normes-standards', 'politiques-securite']
  },
  {
    id: 'securite-applicative',
    title: 'Sécurité applicative',
    description: 'Développement sécurisé et protection des applications',
    icon: <Code className="h-4 w-4" />,
    duration: '8h total',
    gradient: 'from-orange-500 to-pink-500',
    modules: ['intro-cybersecurite', 'securite-dev', 'tests-penetration']
  },
  {
    id: 'protection-donnees',
    title: 'Protection des données',
    description: 'Chiffrement, classification et conformité',
    icon: <Database className="h-4 w-4" />,
    duration: '5h total',
    gradient: 'from-green-500 to-emerald-700',
    modules: ['intro-cybersecurite', 'encryption-donnees', 'conformite-rgpd']
  },
  {
    id: 'securite-cloud',
    title: 'Sécurité Cloud',
    description: 'Protection des environnements cloud et multi-cloud',
    icon: <Wifi className="h-4 w-4" />,
    duration: '5h30 total',
    gradient: 'from-sky-500 to-blue-700',
    modules: ['securite-cloud-fondamentaux', 'securite-iaas-paas', 'securite-saas']
  },
  {
    id: 'gestion-incidents',
    title: 'Gestion des incidents',
    description: 'Préparation, détection et réponse aux incidents',
    icon: <Shield className="h-4 w-4" />,
    duration: '6h30 total',
    gradient: 'from-red-600 to-orange-500',
    modules: ['detection-menaces', 'reponse-incidents', 'analyse-forensique']
  },
];

// Filtrage des modules par catégorie
const getModulesByCategory = (category) => {
  return learningModules.filter(module => module.category === category);
};

// Composant principal
export default function CyberLearningCenter() {
  const [activeTab, setActiveTab] = useState('modules');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('tous');
  
  // Filtrer les modules en fonction de la recherche et de la catégorie
  const filteredModules = learningModules.filter(module => {
    const matchesSearch = module.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          module.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'tous' || module.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 to-slate-950 text-white">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Link href="/cyber">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">CYBER ACADÉMIE</h1>
          </div>
          <p className="text-lg text-blue-200 mb-6 max-w-3xl">
            Centre d'apprentissage complet avec parcours personnalisés, modules interactifs et suivi IA.
            Développez vos compétences en cybersécurité à votre rythme.
          </p>
        </div>
        
        {/* Onglets principaux */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-blue-900/20 border border-blue-800">
            <TabsTrigger value="modules" className="data-[state=active]:bg-blue-700">
              Modules
            </TabsTrigger>
            <TabsTrigger value="paths" className="data-[state=active]:bg-blue-700">
              Parcours thématiques
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-blue-700">
              Mon apprentissage
            </TabsTrigger>
          </TabsList>
          
          {/* Onglet Modules */}
          <TabsContent value="modules" className="space-y-8">
            {/* Filtres de recherche */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  placeholder="Rechercher un module..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-blue-900/20 border-blue-800 pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant={selectedCategory === 'tous' ? 'default' : 'outline'} 
                  className={selectedCategory === 'tous' ? 'bg-blue-700' : 'border-blue-700'}
                  onClick={() => setSelectedCategory('tous')}
                >
                  Tous
                </Button>
                <Button 
                  size="sm" 
                  variant={selectedCategory === 'fondamentaux' ? 'default' : 'outline'}
                  className={selectedCategory === 'fondamentaux' ? 'bg-blue-700' : 'border-blue-700'} 
                  onClick={() => setSelectedCategory('fondamentaux')}
                >
                  Fondamentaux
                </Button>
                <Button 
                  size="sm" 
                  variant={selectedCategory === 'analyse' ? 'default' : 'outline'} 
                  className={selectedCategory === 'analyse' ? 'bg-blue-700' : 'border-blue-700'}
                  onClick={() => setSelectedCategory('analyse')}
                >
                  Analyse
                </Button>
                <Button 
                  size="sm" 
                  variant={selectedCategory === 'outils' ? 'default' : 'outline'}
                  className={selectedCategory === 'outils' ? 'bg-blue-700' : 'border-blue-700'} 
                  onClick={() => setSelectedCategory('outils')}
                >
                  Outils
                </Button>
              </div>
            </div>
            
            {/* Grille de modules */}
            {filteredModules.length === 0 ? (
              <div className="text-center py-12">
                <Folder className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Aucun module trouvé</h3>
                <p className="text-blue-300 mb-4">Essayez d'autres termes de recherche ou catégories</p>
                <Button 
                  variant="outline" 
                  className="border-blue-700"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('tous');
                  }}
                >
                  Réinitialiser les filtres
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredModules.map(module => (
                  <Link key={module.id} href={`/cyber/learning-center/modules/${module.id}`}>
                    <Card className="bg-blue-900/20 border-blue-800 h-full hover:bg-blue-900/30 transition-colors cursor-pointer">
                      <CardHeader>
                        <div className="flex justify-between">
                          <div className="flex gap-3 items-center">
                            <div className="p-2 bg-blue-800 rounded">
                              {module.icon}
                            </div>
                            <CardTitle className="text-lg">{module.title}</CardTitle>
                          </div>
                          <Badge className={
                            module.difficulty === 'débutant' ? 'bg-green-700' :
                            module.difficulty === 'intermédiaire' ? 'bg-blue-600' :
                            module.difficulty === 'avancé' ? 'bg-purple-700' :
                            'bg-blue-900/60'
                          }>
                            {module.difficulty}
                          </Badge>
                        </div>
                        <CardDescription className="text-blue-200 mt-2">
                          {module.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {module.topics.map(topic => (
                            <Badge key={topic} variant="outline" className="border-blue-700 text-blue-200">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-blue-300">
                          <Clock className="h-4 w-4" />
                          <span>{module.duration}</span>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button className="w-full bg-blue-700 hover:bg-blue-800">
                          Accéder au module
                        </Button>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
          
          {/* Onglet Parcours thématiques */}
          <TabsContent value="paths" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {learningPaths.map(path => (
                <Card key={path.id} className="bg-blue-900/20 border-blue-800 hover:bg-blue-900/30 transition-colors cursor-pointer">
                  <CardHeader>
                    <div className="flex justify-between">
                      <div className="flex gap-3 items-center">
                        <div className={`p-2 rounded bg-gradient-to-br ${path.gradient}`}>
                          {path.icon}
                        </div>
                        <CardTitle>{path.title}</CardTitle>
                      </div>
                      <Badge variant="outline" className="border-blue-700 text-blue-200">
                        {path.duration}
                      </Badge>
                    </div>
                    <CardDescription className="text-blue-200 mt-2">
                      {path.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <h3 className="font-semibold mb-3">Modules inclus:</h3>
                    <div className="space-y-2">
                      {path.modules.map((moduleId, index) => {
                        const moduleInfo = learningModules.find(m => m.id === moduleId) || 
                          { title: 'Module à venir', description: 'Contenu en développement', icon: <Folder className="h-4 w-4" /> };
                        return (
                          <div 
                            key={moduleId} 
                            className="flex items-center gap-2 p-2 bg-blue-900/30 rounded-md"
                          >
                            <div className="bg-blue-800 p-1.5 rounded">
                              {moduleInfo.icon}
                            </div>
                            <div>
                              <h4 className="font-medium text-sm">{index + 1}. {moduleInfo.title}</h4>
                              <p className="text-xs text-blue-300">{moduleInfo.description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full bg-blue-700 hover:bg-blue-800">
                      Suivre ce parcours
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          {/* Onglet Mon apprentissage */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Colonne 1: Statistiques et Progression */}
              <Card className="bg-blue-900/20 border-blue-800">
                <CardHeader>
                  <CardTitle>Mon tableau de bord</CardTitle>
                  <CardDescription className="text-blue-200">Suivi personnalisé de votre progression</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-900/30 rounded-lg p-3 text-center">
                      <h4 className="text-sm font-medium text-blue-200">Modules</h4>
                      <p className="text-3xl font-bold">0/17</p>
                    </div>
                    <div className="bg-blue-900/30 rounded-lg p-3 text-center">
                      <h4 className="text-sm font-medium text-blue-200">Temps</h4>
                      <p className="text-3xl font-bold">0h</p>
                    </div>
                    <div className="bg-blue-900/30 rounded-lg p-3 text-center">
                      <h4 className="text-sm font-medium text-blue-200">Parcours</h4>
                      <p className="text-3xl font-bold">0/6</p>
                    </div>
                    <div className="bg-blue-900/30 rounded-lg p-3 text-center">
                      <h4 className="text-sm font-medium text-blue-200">Badges</h4>
                      <p className="text-3xl font-bold">0</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-3">Progression par domaine</h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs">
                          <span>Fondamentaux</span>
                          <span>0%</span>
                        </div>
                        <Progress value={0} className="h-1.5" />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs">
                          <span>Analyse</span>
                          <span>0%</span>
                        </div>
                        <Progress value={0} className="h-1.5" />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs">
                          <span>Gouvernance</span>
                          <span>0%</span>
                        </div>
                        <Progress value={0} className="h-1.5" />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full border-blue-700">
                    <Calendar className="mr-2 h-4 w-4" />
                    Voir mon planning
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Colonne 2: Modules récents et recommandés */}
              <Card className="bg-blue-900/20 border-blue-800">
                <CardHeader>
                  <CardTitle>Modules recommandés</CardTitle>
                  <CardDescription className="text-blue-200">Suggestions personnalisées pour votre parcours</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {learningModules.slice(0, 3).map(module => (
                      <Link 
                        key={module.id} 
                        href={`/cyber/learning-center/modules/${module.id}`}
                        className="flex items-center gap-3 p-2 rounded-md hover:bg-blue-800/20 transition-colors cursor-pointer"
                      >
                        <div className="p-1.5 bg-blue-800 rounded">
                          {module.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{module.title}</h4>
                          <p className="text-xs text-blue-300 truncate">{module.description}</p>
                        </div>
                        <Badge variant="outline" className="border-blue-700 text-blue-200 shrink-0">
                          {module.duration}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-blue-700 hover:bg-blue-800">
                    Découvrir tous les modules
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Colonne 3: Parcours et certification */}
              <Card className="bg-blue-900/20 border-blue-800">
                <CardHeader>
                  <CardTitle>Mon parcours</CardTitle>
                  <CardDescription className="text-blue-200">Suivi de vos parcours thématiques et certifications</CardDescription>
                </CardHeader>
                <CardContent>
                  
                  <h3 className="font-semibold mb-3">Parcours populaires</h3>
                  <div className="space-y-3">
                    {learningPaths.slice(0, 3).map((path) => (
                      <div key={path.id} className="p-3 rounded-md bg-gradient-to-r cursor-pointer hover:opacity-95 transition-opacity" style={{ backgroundImage: `linear-gradient(to right, ${path.gradient.replace('from-', '').replace('to-', ', ')})` }}>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="p-1 bg-white/20 rounded">
                            {path.icon}
                          </div>
                          <h4 className="font-medium">{path.title}</h4>
                        </div>
                        
                        <div className="flex justify-between items-center text-xs text-white/90">
                          <span>{path.duration}</span>
                          <Badge className="bg-white/30 text-white">{path.modules.length} modules</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full border-blue-700">
                    <Star className="mr-2 h-4 w-4" />
                    Voir mes certifications
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            <Card className="bg-blue-900/20 border-blue-800">
              <CardHeader>
                <CardTitle>Activité récente</CardTitle>
                <CardDescription className="text-blue-200">Historique de vos dernières sessions d'apprentissage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-40 border border-dashed border-blue-800 rounded-md">
                  <div className="text-center px-4">
                    <Monitor className="h-10 w-10 mx-auto text-blue-400 mb-3" />
                    <p className="text-blue-300">Aucune activité récente</p>
                    <p className="text-xs text-blue-400 mt-2">Votre historique d'apprentissage apparaîtra ici</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}