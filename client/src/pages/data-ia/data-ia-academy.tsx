import React, { useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  BookOpen, 
  Database, 
  Code, 
  Layers, 
  Terminal, 
  Brain, 
  Search,
  BrainCircuit,
  Sparkles,
  TrendingUp,
  FileText,
  Bot,
  Server,
  Users,
  BarChart2,
  Cpu,
  GitBranch,
  Clock
} from 'lucide-react';
import { BsGraphUp, BsTools, BsShieldLock, BsChat } from 'react-icons/bs';
import { RiRobot2Line } from 'react-icons/ri';
import { MdOutlineDataExploration } from 'react-icons/md';

import PageTitle from '@/components/utils/PageTitle';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from '@/hooks/use-toast';

// Types pour les modules et catégories
interface Module {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  level: string;
  duration: string;
  tags: string[];
  isNew?: boolean;
  isFeatured?: boolean;
  destination?: string;
  progress?: number;
}

interface Category {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  modules: Module[];
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  level: string;
  duration: string;
  category: string;
  objectives: string[];
  modules: string[];
  isNew?: boolean;
  certification?: boolean;
  progress?: number;
}

export default function DataIaAcademy() {
  // États
  const [activeTab, setActiveTab] = useState<string>('modules');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDuration, setSelectedDuration] = useState<string>('all');
  const [aiPanelOpen, setAiPanelOpen] = useState<boolean>(false);
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Animation pour les cartes
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: custom * 0.1,
        duration: 0.5,
        ease: "easeOut"
      }
    })
  };

  // Catégories de modules
  const resourceCategories: Category[] = [
    {
      id: 'languages',
      title: 'Langages & Fondamentaux',
      description: 'Maîtrisez les langages de programmation essentiels pour la data science',
      icon: <Code className="h-6 w-6 text-teal-400" />,
      gradient: 'from-teal-600 to-teal-800',
      modules: [
        {
          id: 'python-basics',
          title: 'Fondamentaux Python',
          description: 'Maîtrisez les bases de Python pour l\'analyse de données et le machine learning',
          icon: <Terminal className="h-6 w-6 text-white" />,
          category: 'Programmation',
          level: 'débutant',
          duration: '4h',
          tags: ['Python', 'Programmation', 'Variables', 'Fonctions', 'Structures'],
          isNew: true,
          destination: '/data-ia/courses/python-basics'
        },
        {
          id: 'data-manipulation',
          title: 'Manipulation de données avec Pandas',
          description: 'Transformez et analysez efficacement des jeux de données complexes',
          icon: <TrendingUp className="h-6 w-6 text-white" />,
          category: 'Data Science',
          level: 'intermédiaire',
          duration: '6h',
          tags: ['Python', 'Pandas', 'Data Cleaning', 'DataFrame'],
          destination: '/data-ia/courses/data-manipulation'
        },
        {
          id: 'sql-fundamentals',
          title: 'SQL Fondamentaux',
          description: 'Interrogez vos bases de données efficacement avec SQL',
          icon: <Database className="h-6 w-6 text-white" />,
          category: 'Base de données',
          level: 'débutant',
          duration: '3h',
          tags: ['SQL', 'Requêtes', 'Bases de données', 'Jointures'],
          destination: '/data-ia/courses/sql-fundamentals'
        },
        {
          id: 'visualisation-matplotlib',
          title: 'Visualisation avec Matplotlib & Seaborn',
          description: 'Créez des graphiques informatifs et professionnels à partir de vos données',
          icon: <BarChart2 className="h-6 w-6 text-white" />,
          category: 'Data Science',
          level: 'intermédiaire',
          duration: '5h',
          tags: ['Python', 'Visualisation', 'Graphiques', 'Dataviz'],
          destination: '/data-ia/courses/visualisation'
        }
      ]
    },
    {
      id: 'machine-learning',
      title: 'Machine Learning & IA',
      description: 'Développez des modèles prédictifs et explorez l\'intelligence artificielle',
      icon: <Brain className="h-6 w-6 text-indigo-400" />,
      gradient: 'from-indigo-600 to-indigo-800',
      modules: [
        {
          id: 'ml-fundamentals',
          title: 'Fondamentaux du Machine Learning',
          description: 'Concepts clés, workflows et premières implémentations de modèles prédictifs',
          icon: <Brain className="h-6 w-6 text-white" />,
          category: 'Machine Learning',
          level: 'intermédiaire',
          duration: '8h',
          tags: ['Scikit-learn', 'Modèles', 'Évaluation', 'Workflow ML'],
          isFeatured: true,
          destination: '/data-ia/courses/ml-fundamentals'
        },
        {
          id: 'supervised-learning',
          title: 'Apprentissage Supervisé',
          description: 'Apprenez à créer des modèles prédictifs à partir de données étiquetées',
          icon: <GitBranch className="h-6 w-6 text-white" />,
          category: 'Machine Learning',
          level: 'intermédiaire',
          duration: '7h',
          tags: ['Classification', 'Régression', 'Hyperparamètres', 'Cross-validation'],
          destination: '/data-ia/courses/supervised-learning'
        },
        {
          id: 'unsupervised-learning',
          title: 'Apprentissage Non-Supervisé',
          description: 'Découvrez des patterns et structures cachés dans vos données',
          icon: <Layers className="h-6 w-6 text-white" />,
          category: 'Machine Learning',
          level: 'intermédiaire',
          duration: '6h',
          tags: ['Clustering', 'Réduction dimensionnelle', 'PCA', 'K-means'],
          destination: '/data-ia/courses/unsupervised-learning'
        },
        {
          id: 'deep-learning',
          title: 'Deep Learning avec Keras',
          description: 'Créez des réseaux de neurones pour des tâches complexes',
          icon: <Layers className="h-6 w-6 text-white" />,
          category: 'IA',
          level: 'avancé',
          duration: '10h',
          tags: ['Neural Networks', 'TensorFlow', 'Keras', 'Computer Vision'],
          isNew: true,
          destination: '/data-ia/courses/deep-learning'
        }
      ]
    },
    {
      id: 'data-engineering',
      title: 'Data Engineering & Infrastructure',
      description: 'Concevez des architectures de données robustes et évolutives',
      icon: <Server className="h-6 w-6 text-blue-400" />,
      gradient: 'from-blue-600 to-blue-800',
      modules: [
        {
          id: 'data-pipelines',
          title: 'Pipelines de Données',
          description: 'Créez des flux de données automatisés et robustes',
          icon: <GitBranch className="h-6 w-6 text-white" />,
          category: 'Data Engineering',
          level: 'intermédiaire',
          duration: '6h',
          tags: ['ETL', 'Automatisation', 'Orchestration', 'Qualité des données'],
          destination: '/data-ia/courses/data-pipelines'
        },
        {
          id: 'big-data-intro',
          title: 'Introduction au Big Data',
          description: 'Principes et technologies pour le traitement de grands volumes de données',
          icon: <Server className="h-6 w-6 text-white" />,
          category: 'Data Engineering',
          level: 'intermédiaire',
          duration: '5h',
          tags: ['Hadoop', 'Spark', 'HDFS', 'MapReduce'],
          destination: '/data-ia/courses/big-data-intro'
        },
        {
          id: 'cloud-data',
          title: 'Solutions Data Cloud',
          description: 'Utilisez les services cloud pour vos projets data à grande échelle',
          icon: <Server className="h-6 w-6 text-white" />,
          category: 'Cloud',
          level: 'intermédiaire',
          duration: '7h',
          tags: ['AWS', 'GCP', 'Azure', 'Cloud Storage', 'Serverless'],
          destination: '/data-ia/courses/cloud-data'
        },
        {
          id: 'data-governance',
          title: 'Gouvernance des Données',
          description: 'Meilleures pratiques pour la qualité et la gestion des données',
          icon: <BsShieldLock className="h-6 w-6 text-white" />,
          category: 'Gouvernance',
          level: 'intermédiaire',
          duration: '4h',
          tags: ['RGPD', 'Qualité', 'Métadonnées', 'Sécurité'],
          destination: '/data-ia/courses/data-governance'
        }
      ]
    },
    {
      id: 'data-applications',
      title: 'Applications & Projets Data',
      description: 'Mettez en pratique vos compétences sur des projets réels',
      icon: <FileText className="h-6 w-6 text-amber-400" />,
      gradient: 'from-amber-600 to-amber-800',
      modules: [
        {
          id: 'customer-analytics',
          title: 'Analyse Client & Segmentation',
          description: 'Exploitez les données clients pour optimiser l\'expérience et le marketing',
          icon: <Users className="h-6 w-6 text-white" />,
          category: 'Business Intelligence',
          level: 'intermédiaire',
          duration: '6h',
          tags: ['CRM', 'Segmentation', 'Customer Journey', 'Rétention'],
          isFeatured: true,
          destination: '/data-ia/courses/customer-analytics'
        },
        {
          id: 'predictive-maintenance',
          title: 'Maintenance Prédictive',
          description: 'Créez des modèles pour anticiper les pannes et optimiser la maintenance',
          icon: <BsTools className="h-6 w-6 text-white" />,
          category: 'Industriel',
          level: 'avancé',
          duration: '8h',
          tags: ['IoT', 'Séries temporelles', 'Anomalies', 'Industrie 4.0'],
          destination: '/data-ia/courses/predictive-maintenance'
        },
        {
          id: 'nlp-applications',
          title: 'Applications NLP & Text Mining',
          description: 'Analysez et exploitez des données textuelles non structurées',
          icon: <BsChat className="h-6 w-6 text-white" />,
          category: 'IA',
          level: 'avancé',
          duration: '7h',
          tags: ['NLP', 'Sentiment Analysis', 'Chatbots', 'Text Classification'],
          destination: '/data-ia/courses/nlp-applications'
        },
        {
          id: 'data-storytelling',
          title: 'Data Storytelling & Dashboards',
          description: 'Communiquez efficacement vos analyses et insights',
          icon: <BarChart2 className="h-6 w-6 text-white" />,
          category: 'Business Intelligence',
          level: 'intermédiaire',
          duration: '5h',
          tags: ['Tableau', 'Power BI', 'Dashboards', 'Visualisation'],
          destination: '/data-ia/courses/data-storytelling'
        }
      ]
    }
  ];

  // Parcours d'apprentissage thématiques
  const learningPaths: LearningPath[] = [
    {
      id: 'data-scientist-path',
      title: 'Parcours Data Scientist',
      description: 'Formation complète pour devenir Data Scientist, couvrant la programmation, les statistiques, le machine learning et la communication des résultats.',
      icon: <Brain className="h-6 w-6 text-white" />,
      gradient: 'from-purple-600 to-indigo-800',
      level: 'tous niveaux',
      duration: '40h',
      category: 'Data Science',
      objectives: [
        'Maîtriser Python et ses bibliothèques data science',
        'Acquérir des compétences solides en statistiques et visualisation',
        'Développer des modèles de machine learning avancés',
        'Appliquer les bonnes pratiques de data science en entreprise'
      ],
      modules: [
        'python-basics',
        'data-manipulation',
        'visualisation-matplotlib',
        'ml-fundamentals',
        'supervised-learning',
        'unsupervised-learning',
        'data-storytelling'
      ],
      isNew: true,
      certification: true
    },
    {
      id: 'data-engineer-path',
      title: 'Parcours Data Engineer',
      description: 'Devenez expert en conception d\'infrastructures de données, pipelines ETL, bases de données et technologies big data.',
      icon: <Server className="h-6 w-6 text-white" />,
      gradient: 'from-blue-600 to-cyan-800',
      level: 'intermédiaire',
      duration: '35h',
      category: 'Data Engineering',
      objectives: [
        'Créer des pipelines de données robustes et évolutifs',
        'Maîtriser les technologies big data (Hadoop, Spark)',
        'Concevoir des architectures de données cloud-native',
        'Implémenter de bonnes pratiques de gouvernance des données'
      ],
      modules: [
        'python-basics',
        'sql-fundamentals',
        'data-pipelines',
        'big-data-intro',
        'cloud-data',
        'data-governance'
      ],
      certification: true
    },
    {
      id: 'ml-engineer-path',
      title: 'Parcours ML Engineer',
      description: 'Spécialisez-vous dans le développement et le déploiement de modèles de machine learning en production.',
      icon: <Cpu className="h-6 w-6 text-white" />,
      gradient: 'from-indigo-600 to-purple-800',
      level: 'avancé',
      duration: '45h',
      category: 'Machine Learning',
      objectives: [
        'Développer des modèles ML complexes et performants',
        'Maîtriser les frameworks de deep learning',
        'Déployer des modèles en production',
        'Gérer le cycle de vie complet des modèles ML'
      ],
      modules: [
        'python-basics',
        'data-manipulation',
        'ml-fundamentals',
        'supervised-learning',
        'unsupervised-learning',
        'deep-learning',
        'cloud-data'
      ]
    },
    {
      id: 'business-analytics-path',
      title: 'Parcours Business Analytics',
      description: 'Exploitez les données pour générer des insights business actionnables et améliorer la prise de décision.',
      icon: <TrendingUp className="h-6 w-6 text-white" />,
      gradient: 'from-amber-600 to-orange-800',
      level: 'intermédiaire',
      duration: '30h',
      category: 'Business Intelligence',
      objectives: [
        'Maîtriser l\'analyse de données pour le business',
        'Créer des tableaux de bord et des reportings efficaces',
        'Développer des stratégies basées sur les données',
        'Communiquer des insights de manière impactante'
      ],
      modules: [
        'sql-fundamentals',
        'data-manipulation',
        'visualisation-matplotlib',
        'customer-analytics',
        'data-storytelling'
      ]
    }
  ];

  // Fonction pour filtrer les modules
  const getFilteredModules = () => {
    let allModules: Module[] = [];
    resourceCategories.forEach(category => {
      allModules = [...allModules, ...category.modules];
    });
    
    return allModules.filter(module => {
      const matchesSearch = searchTerm === '' || 
        module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
        
      const matchesLevel = selectedLevel === 'all' || module.level === selectedLevel;
      
      const matchesCategory = selectedCategory === 'all' || 
        module.category.toLowerCase().includes(selectedCategory.toLowerCase());
        
      const matchesDuration = selectedDuration === 'all' || 
        (selectedDuration === 'court' && (module.duration.includes('2h') || module.duration.includes('1h') || module.duration.includes('3h'))) ||
        (selectedDuration === 'moyen' && (module.duration.includes('4h') || module.duration.includes('5h') || module.duration.includes('6h'))) ||
        (selectedDuration === 'long' && (module.duration.includes('7h') || module.duration.includes('8h') || module.duration.includes('9h') || module.duration.includes('10h')));
        
      return matchesSearch && matchesLevel && matchesCategory && matchesDuration;
    });
  };

  // Fonction pour générer un plan d'apprentissage personnalisé
  const generateLearningPlan = () => {
    if (!aiPrompt.trim()) {
      toast({
        title: "Veuillez préciser votre demande",
        description: "Décrivez vos objectifs d'apprentissage pour recevoir un plan personnalisé",
        variant: "destructive"
      });
      return;
    }
    
    setIsGenerating(true);
    
    // Simuler un délai d'attente
    setTimeout(() => {
      setIsGenerating(false);
      toast({
        title: "Plan d'apprentissage généré",
        description: "Votre plan personnalisé est disponible dans votre tableau de bord",
        variant: "default"
      });
      setActiveTab('dashboard');
    }, 2000);
  };

  // Fonction pour démarrer un tutoriel
  const startTutorial = () => {
    toast({
      title: "Fonctionnalité en développement",
      description: "La visite guidée sera disponible prochainement",
      variant: "default"
    });
  };

  // Tous les modules (pour les références des parcours)
  const allModules = resourceCategories.flatMap(category => category.modules);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-950 to-slate-950 text-white pb-20">
      {/* En-tête */}
      <div className="p-6 container mx-auto">
        <div className="flex items-center mb-2">
          <Link href="/data-ia">
            <Button variant="ghost" className="text-white mr-4">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Retour
            </Button>
          </Link>
          <PageTitle title="DATA & IA ACADEMY" />
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Data & IA Academy</h1>
            <p className="text-blue-200 mt-1">Centre de formation complet en science des données et IA</p>
          </div>
          
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button 
              variant="outline" 
              size="sm"
              className="border-blue-500 text-blue-200 hover:bg-blue-800/30"
              onClick={() => startTutorial()}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Visite guidée
            </Button>
            
            <Button 
              variant="default" 
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setAiPanelOpen(!aiPanelOpen)}
            >
              <BrainCircuit className="mr-2 h-4 w-4" />
              Assistant pédagogique IA
            </Button>
          </div>
        </div>
        
        {/* Panneau IA */}
        {aiPanelOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-blue-900/50 backdrop-blur-sm border border-blue-800 rounded-lg p-4 mb-6"
          >
            <h3 className="text-lg font-semibold flex items-center text-blue-200">
              <BrainCircuit className="mr-2 h-5 w-5" />
              Assistant pédagogique IA
            </h3>
            <p className="text-sm text-blue-200 mb-4">
              Décrivez vos objectifs, votre expérience et vos contraintes pour obtenir un plan d'apprentissage personnalisé.
            </p>
            
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Ex: Je souhaite me former au machine learning pour analyser des données financières..."
                className="bg-blue-950/50 border-blue-700 text-white placeholder:text-blue-400"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
              />
              <Button 
                onClick={generateLearningPlan} 
                disabled={isGenerating}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {isGenerating ? 'Génération...' : 'Générer'}
              </Button>
            </div>
            
            <div className="flex gap-2 text-xs">
              <Badge variant="outline" className="border-blue-500 text-blue-200 hover:bg-blue-900 cursor-pointer">
                Débutant complet
              </Badge>
              <Badge variant="outline" className="border-blue-500 text-blue-200 hover:bg-blue-900 cursor-pointer">
                Préparer une certification
              </Badge>
              <Badge variant="outline" className="border-blue-500 text-blue-200 hover:bg-blue-900 cursor-pointer">
                Reconversion professionnelle
              </Badge>
              <Badge variant="outline" className="border-blue-500 text-blue-200 hover:bg-blue-900 cursor-pointer">
                Formation courte
              </Badge>
            </div>
          </motion.div>
        )}
        
        {/* Filtres et recherche */}
        <div className="bg-blue-900/20 backdrop-blur-sm rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-3 h-4 w-4 text-blue-300" />
              <Input 
                placeholder="Rechercher par titre, description ou mot-clé..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-blue-950/40 border-blue-800 text-white placeholder:text-blue-400"
              />
            </div>
            
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-auto min-w-[150px] bg-blue-950/40 border-blue-800 text-white">
                <SelectValue placeholder="Niveau" />
              </SelectTrigger>
              <SelectContent className="bg-blue-900 border-blue-800 text-white">
                <SelectItem value="all">Tous les niveaux</SelectItem>
                <SelectItem value="débutant">Débutant</SelectItem>
                <SelectItem value="intermédiaire">Intermédiaire</SelectItem>
                <SelectItem value="avancé">Avancé</SelectItem>
                <SelectItem value="tous niveaux">Tous niveaux</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-auto min-w-[150px] bg-blue-950/40 border-blue-800 text-white">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent className="bg-blue-900 border-blue-800 text-white">
                <SelectItem value="all">Toutes les catégories</SelectItem>
                <SelectItem value="programmation">Programmation</SelectItem>
                <SelectItem value="data science">Data Science</SelectItem>
                <SelectItem value="machine learning">Machine Learning</SelectItem>
                <SelectItem value="ia">IA</SelectItem>
                <SelectItem value="base de données">Base de données</SelectItem>
                <SelectItem value="data engineering">Data Engineering</SelectItem>
                <SelectItem value="business intelligence">Business Intelligence</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedDuration} onValueChange={setSelectedDuration}>
              <SelectTrigger className="w-auto min-w-[150px] bg-blue-950/40 border-blue-800 text-white">
                <SelectValue placeholder="Durée" />
              </SelectTrigger>
              <SelectContent className="bg-blue-900 border-blue-800 text-white">
                <SelectItem value="all">Toutes les durées</SelectItem>
                <SelectItem value="court">Court (moins de 3h)</SelectItem>
                <SelectItem value="moyen">Moyen (4-6h)</SelectItem>
                <SelectItem value="long">Long (plus de 6h)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {/* Contenu principal */}
      <div className="container mx-auto px-6">
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
            {/* Si 'all' est sélectionné pour toutes les sélections, ou pas de recherche active, on affiche par catégorie */}
            {((!searchTerm && (selectedLevel === '' || selectedLevel === 'all') && (selectedCategory === '' || selectedCategory === 'all') && (selectedDuration === '' || selectedDuration === 'all'))) ? (
              // Affichage par catégories
              <>
                {resourceCategories.map((category) => (
                  <div key={category.id} data-category={category.id}>
                    <div className="flex items-center mb-4">
                      <div className={`p-2 rounded-md bg-gradient-to-r ${category.gradient} mr-3`}>
                        {category.icon}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">{category.title}</h2>
                        <p className="text-blue-200">{category.description}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                      {category.modules.map((module, index) => (
                        <motion.div
                          key={module.id}
                          custom={index}
                          initial="hidden"
                          animate="visible"
                          variants={cardVariants}
                        >
                          <Link href={module.destination || '#'}>
                            <Card className="bg-blue-900/20 border-blue-800 hover:bg-blue-800/30 transition-all cursor-pointer overflow-hidden">
                              <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                  <div className="p-2 bg-blue-800 rounded-md">
                                    {module.icon}
                                  </div>
                                  <div className="flex gap-1">
                                    {module.isNew && (
                                      <Badge className="bg-blue-600">Nouveau</Badge>
                                    )}
                                    {module.isFeatured && (
                                      <Badge className="bg-amber-600">Recommandé</Badge>
                                    )}
                                  </div>
                                </div>
                                <CardTitle className="text-lg mt-2">{module.title}</CardTitle>
                                <div className="flex gap-2 mt-1">
                                  <Badge variant="outline" className="bg-blue-950/50 border-blue-700 text-blue-200">
                                    {module.level}
                                  </Badge>
                                  <Badge variant="outline" className="bg-blue-950/50 border-blue-700 text-blue-200">
                                    {module.duration}
                                  </Badge>
                                </div>
                              </CardHeader>
                              <CardContent>
                                <p className="text-sm text-gray-300">{module.description}</p>
                                
                                <div className="flex flex-wrap gap-1 mt-3">
                                  {module.tags.slice(0, 3).map((tag) => (
                                    <Badge key={tag} variant="secondary" className="bg-blue-950/70 text-blue-200 border-blue-800">
                                      {tag}
                                    </Badge>
                                  ))}
                                  {module.tags.length > 3 && (
                                    <Badge variant="secondary" className="bg-blue-950/70 text-blue-200 border-blue-800">
                                      +{module.tags.length - 3}
                                    </Badge>
                                  )}
                                </div>
                                
                                {module.progress !== undefined && module.progress > 0 && (
                                  <div className="mt-3">
                                    <div className="flex justify-between text-xs mb-1">
                                      <span>Progression</span>
                                      <span>{module.progress}%</span>
                                    </div>
                                    <Progress value={module.progress} className="h-1.5" />
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            ) : (
              // Résultats de recherche
              <div>
                <h2 className="text-2xl font-bold mb-6">Résultats de recherche</h2>
                {getFilteredModules().length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {getFilteredModules().map((module, index) => (
                      <motion.div
                        key={module.id}
                        custom={index}
                        initial="hidden"
                        animate="visible"
                        variants={cardVariants}
                      >
                        <Link href={module.destination || '#'}>
                          <Card className="bg-blue-900/20 border-blue-800 hover:bg-blue-800/30 transition-all cursor-pointer overflow-hidden">
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-start">
                                <div className="p-2 bg-blue-800 rounded-md">
                                  {module.icon}
                                </div>
                                <div className="flex gap-1">
                                  {module.isNew && (
                                    <Badge className="bg-blue-600">Nouveau</Badge>
                                  )}
                                  {module.isFeatured && (
                                    <Badge className="bg-amber-600">Recommandé</Badge>
                                  )}
                                </div>
                              </div>
                              <CardTitle className="text-lg mt-2">{module.title}</CardTitle>
                              <div className="flex gap-2 mt-1">
                                <Badge variant="outline" className="bg-blue-950/50 border-blue-700 text-blue-200">
                                  {module.level}
                                </Badge>
                                <Badge variant="outline" className="bg-blue-950/50 border-blue-700 text-blue-200">
                                  {module.duration}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-gray-300">{module.description}</p>
                              
                              <div className="flex flex-wrap gap-1 mt-3">
                                {module.tags.slice(0, 3).map((tag) => (
                                  <Badge key={tag} variant="secondary" className="bg-blue-950/70 text-blue-200 border-blue-800">
                                    {tag}
                                  </Badge>
                                ))}
                                {module.tags.length > 3 && (
                                  <Badge variant="secondary" className="bg-blue-950/70 text-blue-200 border-blue-800">
                                    +{module.tags.length - 3}
                                  </Badge>
                                )}
                              </div>
                              
                              {module.progress !== undefined && module.progress > 0 && (
                                <div className="mt-3">
                                  <div className="flex justify-between text-xs mb-1">
                                    <span>Progression</span>
                                    <span>{module.progress}%</span>
                                  </div>
                                  <Progress value={module.progress} className="h-1.5" />
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-blue-900/10 rounded-lg border border-blue-900/50">
                    <Search className="h-10 w-10 mx-auto text-blue-400 mb-3" />
                    <h3 className="text-xl font-semibold">Aucun résultat trouvé</h3>
                    <p className="text-blue-300 mt-1">Essayez de modifier vos critères de recherche</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
          
          {/* Onglet Parcours thématiques */}
          <TabsContent value="paths" className="space-y-6">
            <div className="relative">
              {/* Notification "Bientôt disponible" */}
              <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-amber-600/50 to-orange-700/50 border border-amber-500/60">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-600/70 rounded-full">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Fonctionnalité bientôt disponible</h3>
                    <p className="text-amber-100">
                      Les parcours thématiques sont en cours de développement. Vous pouvez consulter les parcours à venir ci-dessous, mais l'inscription n'est pas encore active.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {learningPaths.map((path, index) => (
                  <motion.div
                    key={path.id}
                    custom={index}
                    initial="hidden"
                    animate="visible"
                    variants={cardVariants}
                    className="h-full"
                  >
                    <Card className={`border-0 overflow-hidden bg-gradient-to-br ${path.gradient} h-full flex flex-col`}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className="p-2 bg-white/20 backdrop-blur-sm rounded-md">
                            {path.icon}
                          </div>
                          <div className="flex gap-1">
                            {path.isNew && (
                              <Badge className="bg-white/30 text-white">Nouveau</Badge>
                            )}
                            {path.certification && (
                              <Badge className="bg-amber-500/70">Certification</Badge>
                            )}
                          </div>
                        </div>
                        <CardTitle className="text-xl mt-3">{path.title}</CardTitle>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline" className="border-white/40 text-white bg-white/10">
                            {path.level}
                          </Badge>
                          <Badge variant="outline" className="border-white/40 text-white bg-white/10">
                            {path.duration}
                          </Badge>
                          <Badge variant="outline" className="border-white/40 text-white bg-white/10">
                            {path.category}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-grow overflow-y-auto" style={{ maxHeight: '400px' }}>
                        <p className="text-white/90 mb-4">{path.description}</p>
                        
                        <h4 className="font-semibold text-white mb-2">Objectifs :</h4>
                        <ul className="list-disc list-inside text-sm text-white/90 space-y-1 mb-4">
                          {path.objectives.map((objective, i) => (
                            <li key={i}>{objective}</li>
                          ))}
                        </ul>
                        
                        <h4 className="font-semibold text-white mb-2">Modules inclus :</h4>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {path.modules.map((moduleId) => {
                            const module = allModules.find(m => m.id === moduleId);
                            return module ? (
                              <Badge key={moduleId} className="bg-white/20 hover:bg-white/30 text-white">
                                {module.title}
                              </Badge>
                            ) : null;
                          })}
                        </div>
                        
                        {path.progress !== undefined && (
                          <div className="mt-4">
                            <div className="flex justify-between text-xs mb-1 text-white/90">
                              <span>Progression</span>
                              <span>{path.progress}%</span>
                            </div>
                            <Progress value={path.progress} className="h-2 bg-white/20" />
                          </div>
                        )}
                      </CardContent>
                      <div className="p-4 pt-0 mt-auto">
                        <Button className="w-full bg-white/20 hover:bg-white/30 text-white" disabled>
                          <Clock className="mr-2 h-4 w-4" />
                          Bientôt disponible
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          {/* Onglet Mon apprentissage */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Notification "Bientôt disponible" */}
            <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-amber-600/50 to-orange-700/50 border border-amber-500/60">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-600/70 rounded-full">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Fonctionnalité bientôt disponible</h3>
                  <p className="text-amber-100">
                    Le suivi personnalisé de votre apprentissage est en cours de développement. Cette fonctionnalité vous permettra de suivre votre progression et d'organiser votre parcours d'apprentissage.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Colonne 1: Statistiques et Progression */}
              <Card className="bg-blue-900/20 border-blue-800">
                <CardHeader>
                  <CardTitle>Mon tableau de bord</CardTitle>
                  <p className="text-blue-200">Suivi personnalisé de votre progression</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-900/30 rounded-lg p-3 text-center">
                      <h4 className="text-sm font-medium text-blue-200">Modules</h4>
                      <p className="text-3xl font-bold">0/16</p>
                    </div>
                    <div className="bg-blue-900/30 rounded-lg p-3 text-center">
                      <h4 className="text-sm font-medium text-blue-200">Temps</h4>
                      <p className="text-3xl font-bold">0h</p>
                    </div>
                    <div className="bg-blue-900/30 rounded-lg p-3 text-center">
                      <h4 className="text-sm font-medium text-blue-200">Parcours</h4>
                      <p className="text-3xl font-bold">0/4</p>
                    </div>
                    <div className="bg-blue-900/30 rounded-lg p-3 text-center">
                      <h4 className="text-sm font-medium text-blue-200">Badges</h4>
                      <p className="text-3xl font-bold">0</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Progression globale</h3>
                    <Progress value={0} className="h-2" />
                    <p className="text-xs text-blue-300 mt-1 text-right">0%</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-3">Compétences acquises</h3>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-xs">
                          <span>Python</span>
                          <span>0%</span>
                        </div>
                        <Progress value={0} className="h-1.5" />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs">
                          <span>Data Analysis</span>
                          <span>0%</span>
                        </div>
                        <Progress value={0} className="h-1.5" />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs">
                          <span>Machine Learning</span>
                          <span>0%</span>
                        </div>
                        <Progress value={0} className="h-1.5" />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs">
                          <span>Data Engineering</span>
                          <span>0%</span>
                        </div>
                        <Progress value={0} className="h-1.5" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Colonne 2: Plan d'apprentissage et Recommandations */}
              <Card className="bg-blue-900/20 border-blue-800 lg:col-span-2">
                <CardHeader>
                  <CardTitle>Plan d'apprentissage personnalisé</CardTitle>
                  <p className="text-blue-200">Généré par l'IA en fonction de vos objectifs</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="mb-4 p-4 rounded-lg bg-blue-900/30 border border-blue-800/80">
                    <p className="text-blue-100 italic">
                      Utilisez l'assistant pédagogique IA pour générer un plan d'apprentissage personnalisé adapté à vos objectifs et votre niveau actuel.
                    </p>
                  </div>
                  
                  <h4 className="font-semibold">Modules recommandés</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Card className="bg-blue-900/40 border-blue-800">
                      <CardHeader className="py-3 px-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Terminal className="h-4 w-4 text-blue-300" />
                            <p className="font-medium">Fondamentaux Python</p>
                          </div>
                          <Badge>Débutant</Badge>
                        </div>
                      </CardHeader>
                    </Card>
                    
                    <Card className="bg-blue-900/40 border-blue-800">
                      <CardHeader className="py-3 px-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Database className="h-4 w-4 text-blue-300" />
                            <p className="font-medium">SQL Fondamentaux</p>
                          </div>
                          <Badge>Débutant</Badge>
                        </div>
                      </CardHeader>
                    </Card>
                  </div>
                  
                  <h4 className="font-semibold mt-4">Parcours suggéré</h4>
                  <Card className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 border-indigo-800">
                    <CardHeader className="py-3 px-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Brain className="h-5 w-5 text-indigo-300" />
                          <div>
                            <p className="font-medium">Parcours Data Scientist</p>
                            <p className="text-xs text-blue-200">40h • Tous niveaux • 7 modules</p>
                          </div>
                        </div>
                        <Badge className="bg-indigo-500">Recommandé</Badge>
                      </div>
                    </CardHeader>
                  </Card>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}