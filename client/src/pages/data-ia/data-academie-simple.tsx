import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  IoArrowBack, IoBookOutline, IoDesktopOutline, IoStatsChartOutline, 
  IoCodeSlashOutline, IoServer as IoServerOutline, IoBarChart as IoBarChartOutline,
  IoFlask as IoFlaskOutline, IoLaptop as IoLaptopOutline, IoLayers as IoLayersOutline, IoCloud as IoCloudOutline
} from 'react-icons/io5';
import { FaBrain as IoBrainOutline } from 'react-icons/fa';

// Composant pour les modules
interface ModuleCardProps {
  title: string;
  description: string;
  duration: string;
  difficulty: 'débutant' | 'intermédiaire' | 'avancé';
  icon: React.ReactNode;
  color: string;
}

const ModuleCard: React.FC<ModuleCardProps> = ({ title, description, duration, difficulty, icon, color }) => {
  const difficultyColorMap = {
    'débutant': 'border-green-500/50 text-green-400',
    'intermédiaire': 'border-yellow-500/50 text-yellow-400',
    'avancé': 'border-red-500/50 text-red-400'
  };
  
  // Définir les classes en fonction de la couleur
  const getBgClass = (color: string) => {
    if (color === 'blue') return 'bg-blue-500/20 text-blue-400';
    if (color === 'purple') return 'bg-purple-500/20 text-purple-400';
    if (color === 'cyan') return 'bg-cyan-500/20 text-cyan-400';
    if (color === 'emerald') return 'bg-emerald-500/20 text-emerald-400';
    return 'bg-blue-500/20 text-blue-400';
  };
  
  const getBorderClass = (color: string) => {
    if (color === 'blue') return 'border-blue-400/20 hover:border-blue-400/40';
    if (color === 'purple') return 'border-purple-400/20 hover:border-purple-400/40';
    if (color === 'cyan') return 'border-cyan-400/20 hover:border-cyan-400/40';
    if (color === 'emerald') return 'border-emerald-400/20 hover:border-emerald-400/40';
    return 'border-blue-400/20 hover:border-blue-400/40';
  };

  return (
    <Card className={`bg-gradient-to-br from-[#1a3a60]/90 to-[#152a40]/90 border ${getBorderClass(color)} hover:shadow-lg transition-all cursor-pointer`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-lg ${getBgClass(color)}`}>
              {icon}
            </div>
            <CardTitle className="text-xl">{title}</CardTitle>
          </div>
          <Badge variant="outline" className={difficultyColorMap[difficulty]}>
            {difficulty}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-gray-400 mb-4">
          {description}
        </CardDescription>
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center space-x-1">
            <IoBookOutline className="h-4 w-4 text-gray-500" />
            <span className="text-gray-400">{duration}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function DataAcademie() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('fondamentaux');
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050c15] to-[#0a1525]">
      <div className="container mx-auto px-4 py-6 max-w-screen-xl">
        <div className="flex items-center mb-6 mt-10">
          <Button
            variant="ghost"
            size="sm"
            className="mr-2 hover:bg-blue-500/10"
            onClick={() => setLocation('/data-ia')}
          >
            <IoArrowBack className="mr-1 h-4 w-4" /> Retour
          </Button>
          <h1 className="text-3xl font-bold text-gradient bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            DATA ACADÉMIE
          </h1>
        </div>
        
        <div className="rounded-lg border bg-[#0c1625]/80 backdrop-blur-sm border-blue-500/20">
          <div className="p-4 border-b border-gray-700">
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-5 w-full bg-gray-900/50">
                <TabsTrigger value="fondamentaux" className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-400">
                  Fondamentaux
                </TabsTrigger>
                <TabsTrigger value="intelligence_artificielle" className="data-[state=active]:bg-purple-600/20 data-[state=active]:text-purple-400">
                  IA & ML
                </TabsTrigger>
                <TabsTrigger value="sql" className="data-[state=active]:bg-cyan-600/20 data-[state=active]:text-cyan-400">
                  SQL
                </TabsTrigger>
                <TabsTrigger value="python" className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-400">
                  Python
                </TabsTrigger>
                <TabsTrigger value="data_engineering" className="data-[state=active]:bg-emerald-600/20 data-[state=active]:text-emerald-400">
                  Data Engineering
                </TabsTrigger>
              </TabsList>
              
              {/* Contenu des onglets */}
              <TabsContent value="fondamentaux" className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ModuleCard
                    title="Introduction à la Data Science"
                    description="Comprendre les bases de la Data Science et les types d'analyses"
                    duration="20 min"
                    difficulty="débutant"
                    icon={<IoStatsChartOutline className="h-5 w-5" />}
                    color="blue"
                  />
                  
                  <ModuleCard
                    title="Statistiques Fondamentales"
                    description="Maîtriser les concepts statistiques essentiels pour l'analyse de données"
                    duration="30 min"
                    difficulty="débutant"
                    icon={<IoBarChartOutline className="h-5 w-5" />}
                    color="blue"
                  />
                  
                  <ModuleCard
                    title="Visualisation de Données"
                    description="Techniques et outils pour créer des visualisations efficaces"
                    duration="25 min"
                    difficulty="intermédiaire"
                    icon={<IoDesktopOutline className="h-5 w-5" />}
                    color="blue"
                  />
                  
                  <ModuleCard
                    title="Collecte et Préparation des Données"
                    description="Méthodologies pour acquérir et nettoyer vos données"
                    duration="35 min"
                    difficulty="intermédiaire"
                    icon={<IoLayersOutline className="h-5 w-5" />}
                    color="blue"
                  />
                  
                  <ModuleCard
                    title="Éthique et Protection des Données"
                    description="Conformité RGPD et enjeux éthiques du traitement des données"
                    duration="40 min"
                    difficulty="avancé"
                    icon={<IoServerOutline className="h-5 w-5" />}
                    color="blue"
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="intelligence_artificielle" className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ModuleCard
                    title="Fondamentaux du Machine Learning"
                    description="Les différents types d'apprentissage automatique et leurs applications"
                    duration="45 min"
                    difficulty="débutant"
                    icon={<IoBrainOutline className="h-5 w-5" />}
                    color="purple"
                  />
                  
                  <ModuleCard
                    title="Deep Learning : Réseaux de Neurones"
                    description="Architecture et principes des réseaux neuronaux profonds"
                    duration="50 min"
                    difficulty="intermédiaire"
                    icon={<IoLaptopOutline className="h-5 w-5" />}
                    color="purple"
                  />
                  
                  <ModuleCard
                    title="NLP : Traitement du Langage Naturel"
                    description="Techniques d'analyse et de génération de texte"
                    duration="40 min"
                    difficulty="intermédiaire"
                    icon={<IoCodeSlashOutline className="h-5 w-5" />}
                    color="purple"
                  />
                  
                  <ModuleCard
                    title="Vision par Ordinateur"
                    description="Reconnaissance d'images et traitement vidéo"
                    duration="45 min"
                    difficulty="avancé"
                    icon={<IoDesktopOutline className="h-5 w-5" />}
                    color="purple"
                  />
                  
                  <ModuleCard
                    title="Déploiement de Modèles IA"
                    description="De l'expérimentation à la production : MLOps et bonnes pratiques"
                    duration="55 min"
                    difficulty="avancé"
                    icon={<IoCloudOutline className="h-5 w-5" />}
                    color="purple"
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="sql" className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ModuleCard
                    title="Fondamentaux SQL"
                    description="Les bases du langage SQL et requêtes simples (SELECT, INSERT, UPDATE, DELETE)"
                    duration="30 min"
                    difficulty="débutant"
                    icon={<IoCodeSlashOutline className="h-5 w-5" />}
                    color="cyan"
                  />
                  
                  <ModuleCard
                    title="Jointures et Relations"
                    description="Maîtriser les différents types de jointures et comprendre les relations entre tables"
                    duration="35 min"
                    difficulty="intermédiaire"
                    icon={<IoLayersOutline className="h-5 w-5" />}
                    color="cyan"
                  />
                  
                  <ModuleCard
                    title="Requêtes Avancées"
                    description="Sous-requêtes, CTE, fonctions d'agrégation et fenêtrage"
                    duration="45 min"
                    difficulty="intermédiaire"
                    icon={<IoStatsChartOutline className="h-5 w-5" />}
                    color="cyan"
                  />
                  
                  <ModuleCard
                    title="Optimisation des Performances"
                    description="Indexation, plans d'exécution et optimisation des requêtes"
                    duration="40 min"
                    difficulty="avancé"
                    icon={<IoBarChartOutline className="h-5 w-5" />}
                    color="cyan"
                  />
                  
                  <ModuleCard
                    title="SQL pour Data Science"
                    description="Applications avancées de SQL dans les projets de Data Science"
                    duration="50 min"
                    difficulty="avancé"
                    icon={<IoServerOutline className="h-5 w-5" />}
                    color="cyan"
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="python" className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ModuleCard
                    title="Python pour Data Science"
                    description="Les bases de Python orientées analyse de données"
                    duration="30 min"
                    difficulty="débutant"
                    icon={<IoCodeSlashOutline className="h-5 w-5" />}
                    color="blue"
                  />
                  
                  <ModuleCard
                    title="NumPy et Pandas"
                    description="Manipulation de tableaux multidimensionnels et traitement de données tabulaires"
                    duration="40 min"
                    difficulty="intermédiaire"
                    icon={<IoLayersOutline className="h-5 w-5" />}
                    color="blue"
                  />
                  
                  <ModuleCard
                    title="Visualisation avec Matplotlib et Seaborn"
                    description="Création de graphiques et visualisations statistiques"
                    duration="35 min"
                    difficulty="intermédiaire"
                    icon={<IoBarChartOutline className="h-5 w-5" />}
                    color="blue"
                  />
                  
                  <ModuleCard
                    title="Scikit-Learn pour Machine Learning"
                    description="Implémentation d'algorithmes de ML avec Scikit-Learn"
                    duration="45 min"
                    difficulty="avancé"
                    icon={<IoBrainOutline className="h-5 w-5" />}
                    color="blue"
                  />
                  
                  <ModuleCard
                    title="Python pour le Deep Learning"
                    description="TensorFlow, PyTorch et implémentation de réseaux de neurones"
                    duration="50 min"
                    difficulty="avancé"
                    icon={<IoLaptopOutline className="h-5 w-5" />}
                    color="blue"
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="data_engineering" className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ModuleCard
                    title="Introduction au Data Engineering"
                    description="Rôle et responsabilités d'un Data Engineer"
                    duration="25 min"
                    difficulty="débutant"
                    icon={<IoServerOutline className="h-5 w-5" />}
                    color="emerald"
                  />
                  
                  <ModuleCard
                    title="Architectures Data"
                    description="Conception d'architectures de traitement de données scalables"
                    duration="40 min"
                    difficulty="intermédiaire"
                    icon={<IoLayersOutline className="h-5 w-5" />}
                    color="emerald"
                  />
                  
                  <ModuleCard
                    title="ETL et Pipelines de Données"
                    description="Extraction, transformation et chargement de données"
                    duration="45 min"
                    difficulty="intermédiaire"
                    icon={<IoCodeSlashOutline className="h-5 w-5" />}
                    color="emerald"
                  />
                  
                  <ModuleCard
                    title="Systèmes de Stockage et Bases de Données"
                    description="Types de bases de données et leurs cas d'usage (SQL, NoSQL, data lakes)"
                    duration="50 min"
                    difficulty="avancé"
                    icon={<IoCloudOutline className="h-5 w-5" />}
                    color="emerald"
                  />
                  
                  <ModuleCard
                    title="Big Data Technologies"
                    description="Hadoop, Spark et outils de traitement distribué"
                    duration="55 min"
                    difficulty="avancé"
                    icon={<IoDesktopOutline className="h-5 w-5" />}
                    color="emerald"
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}