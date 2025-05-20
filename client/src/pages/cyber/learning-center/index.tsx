import React, { useState } from 'react';
import { Link } from 'wouter';
import {
  ArrowLeft,
  BookOpen,
  Cpu,
  Eye,
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
  CloudRain,
  ScrollText,
  BarChart3,
  Calendar,
  Bot,
  BrainCircuit,
  Layers,
  Zap,
  Star,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from '@/hooks/use-toast';
import { useTutorial } from '@/contexts/TutorialContext';
import PageTitle from '@/components/utils/PageTitle';

// Types pour l'organisation du contenu
interface Module {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  duration: string;
  level: 'débutant' | 'intermédiaire' | 'avancé' | 'tous niveaux';
  category: string;
  tags: string[];
  progress?: number;
  isNew?: boolean;
  isFeatured?: boolean;
  comingSoon?: boolean;
  destination?: string;
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  modules: string[];
  duration: string;
  level: 'débutant' | 'intermédiaire' | 'avancé' | 'tous niveaux';
  category: 'technique' | 'gouvernance' | 'mixte';
  objectives: string[];
  tags: string[];
  progress?: number;
  certification?: string;
  isNew?: boolean;
  gradient: string;
}

interface ResourceCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  modules: Module[];
  gradient: string;
}

export default function LearningCenter() {
  // États
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedDuration, setSelectedDuration] = useState<string>('');
  const [activeTab, setActiveTab] = useState('modules');
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  
  const { toast } = useToast();
  const { startTutorial, setCurrentTour } = useTutorial();

  // Modules de base (fondamentaux de la cybersécurité)
  const basicModules: Module[] = [
    {
      id: 'intro-cybersecurite',
      title: 'Introduction à la cybersécurité',
      description: 'Les concepts fondamentaux, terminologie et principes de base de la cybersécurité',
      icon: <Shield />,
      duration: '2-3h',
      level: 'débutant',
      category: 'fondamentaux',
      tags: ['concepts', 'principes', 'introduction', 'sensibilisation', 'culture sécurité'],
      progress: 0,
      destination: '/cyber/learning-center/modules/intro-cybersecurite'
    },
    {
      id: 'modele-menaces',
      title: 'Modélisation des menaces',
      description: 'Comprendre et modéliser les menaces pour mieux protéger vos systèmes d\'information',
      icon: <FileText />,
      duration: '3-4h',
      level: 'intermédiaire',
      category: 'fondamentaux',
      tags: ['analyse', 'risques', 'menaces'],
      progress: 0,
      destination: '/cyber/learning-center/modules/modele-menaces'
    },
    {
      id: 'analyse-risques',
      title: 'Analyse et gestion des risques',
      description: 'Méthodologies d\'analyse et de gestion des risques en cybersécurité',
      icon: <BarChart3 />,
      duration: '4-5h',
      level: 'intermédiaire',
      category: 'fondamentaux',
      tags: ['risques', 'analyse', 'méthodologie', 'gouvernance', 'conformité', 'EBIOS'],
      progress: 0,
      destination: '/cyber/learning-center/modules/analyse-risques'
    },
    {
      id: 'normes-standards',
      title: 'Normes et standards de sécurité',
      description: 'Panorama des normes et standards internationaux en cybersécurité (ISO 27001, NIST, etc.)',
      icon: <Layers />,
      duration: '3-4h',
      level: 'intermédiaire',
      category: 'fondamentaux',
      tags: ['normes', 'standards', 'conformité'],
      progress: 0,
      destination: '/cyber/learning-center/modules/normes-standards'
    }
  ];

  // Modules spécialisés (sécurité technique, gouvernance, etc.)
  const specializedModules: Module[] = [
    {
      id: 'securite-reseaux',
      title: 'Sécurité des réseaux',
      description: 'Protection des infrastructures réseau et détection des intrusions',
      icon: <Network />,
      duration: '6-8h',
      level: 'intermédiaire',
      category: 'technique',
      tags: ['réseau', 'firewall', 'IDS/IPS', 'VPN', 'segmentation', 'endpoints'],
      progress: 0,
      destination: '/cyber/learning-center/modules/securite-reseaux'
    },
    {
      id: 'securite-cloud',
      title: 'Sécurité du cloud',
      description: 'Sécurisation des environnements cloud (AWS, Azure, GCP)',
      icon: <CloudRain />,
      duration: '5-7h',
      level: 'avancé',
      category: 'technique',
      tags: ['cloud', 'AWS', 'Azure', 'GCP'],
      progress: 0,
      destination: '/cyber/learning-center/modules/securite-cloud',
      isNew: true
    },
    {
      id: 'devsecops',
      title: 'DevSecOps',
      description: 'Intégration de la sécurité dans le cycle de développement logiciel',
      icon: <Code />,
      duration: '8-10h',
      level: 'avancé',
      category: 'technique',
      tags: ['développement', 'DevOps', 'CI/CD'],
      progress: 0,
      destination: '/cyber/learning-center/modules/devsecops'
    },
    {
      id: 'securite-donnees',
      title: 'Sécurité des données',
      description: 'Protection des données sensibles et confidentielles',
      icon: <Database />,
      duration: '4-6h',
      level: 'intermédiaire',
      category: 'technique',
      tags: ['données', 'chiffrement', 'DLP'],
      progress: 0,
      destination: '/cyber/learning-center/modules/securite-donnees'
    },
    {
      id: 'gestion-identites',
      title: 'Gestion des identités et des accès',
      description: 'Stratégies et solutions pour la gestion des identités et des accès',
      icon: <Lock />,
      duration: '5-6h',
      level: 'intermédiaire',
      category: 'technique',
      tags: ['IAM', 'authentification', 'autorisation'],
      progress: 0,
      destination: '/cyber/learning-center/modules/gestion-identites'
    },
    {
      id: 'gouvernance-cyber',
      title: 'Gouvernance de la cybersécurité',
      description: 'Organisation, pilotage et stratégie de la cybersécurité en entreprise',
      icon: <Users />,
      duration: '6-8h',
      level: 'intermédiaire',
      category: 'gouvernance',
      tags: ['gouvernance', 'stratégie', 'organisation'],
      progress: 0,
      destination: '/cyber/learning-center/modules/gouvernance-cyber'
    },
    {
      id: 'securite-ot',
      title: 'Cybersécurité des systèmes industriels (OT)',
      description: 'Protection des environnements industriels et systèmes SCADA',
      icon: <Cpu />,
      duration: '7-9h',
      level: 'avancé',
      category: 'technique',
      tags: ['OT', 'SCADA', 'industriel'],
      progress: 0,
      destination: '/cyber/learning-center/modules/securite-ot',
      isNew: true
    },
    {
      id: 'intelligence-artificielle-securite',
      title: 'IA et cybersécurité',
      description: 'Applications et enjeux de l\'IA dans la cybersécurité',
      icon: <BrainCircuit />,
      duration: '4-5h',
      level: 'avancé',
      category: 'technique',
      tags: ['IA', 'machine learning', 'automatisation'],
      progress: 0,
      destination: '/cyber/learning-center/modules/ia-securite',
      isNew: true,
      isFeatured: true
    }
  ];

  // Modules micro-learning (courts, focalisés)
  const microModules: Module[] = [
    {
      id: 'phishing-detection',
      title: 'Détecter le phishing',
      description: 'Reconnaître et se protéger contre les attaques de phishing',
      icon: <Zap />,
      duration: '30-45min',
      level: 'débutant',
      category: 'micro-learning',
      tags: ['phishing', 'social engineering', 'sensibilisation'],
      progress: 0,
      destination: '/cyber/learning-center/modules/phishing-detection'
    },
    {
      id: 'mot-de-passe',
      title: 'Gestion des mots de passe',
      description: 'Bonnes pratiques pour des mots de passe sécurisés',
      icon: <Lock />,
      duration: '20-30min',
      level: 'débutant',
      category: 'micro-learning',
      tags: ['mots de passe', 'authentification', 'sensibilisation'],
      progress: 0,
      destination: '/cyber/learning-center/modules/mot-de-passe'
    },
    {
      id: 'ransomware',
      title: 'Comprendre les ransomwares',
      description: 'Mécanismes des ransomwares et mesures préventives',
      icon: <Shield />,
      duration: '45-60min',
      level: 'débutant',
      category: 'micro-learning',
      tags: ['ransomware', 'malware', 'prévention', 'incidents', 'gestion de crise', 'forensique'],
      progress: 0,
      destination: '/cyber/learning-center/modules/ransomware'
    },
    {
      id: 'byod-securite',
      title: 'Sécurité des appareils personnels (BYOD)',
      description: 'Sécuriser l\'utilisation des appareils personnels en entreprise',
      icon: <Wifi />,
      duration: '30-45min',
      level: 'débutant',
      category: 'micro-learning',
      tags: ['BYOD', 'mobile', 'appareils personnels'],
      progress: 0,
      destination: '/cyber/learning-center/modules/byod-securite'
    },
    {
      id: 'zero-trust',
      title: 'Principe du Zero Trust',
      description: 'Introduction au modèle de sécurité Zero Trust',
      icon: <Shield />,
      duration: '45-60min',
      level: 'intermédiaire',
      category: 'micro-learning',
      tags: ['zero trust', 'architecture', 'confiance'],
      progress: 0,
      destination: '/cyber/learning-center/modules/zero-trust',
      isNew: true
    }
  ];

  // Modules du parcours rapide
  const quickLearningModules: Module[] = [
    {
      id: 'fiches-cyber-express',
      title: 'Fiches Cyber Express',
      description: 'Synthèses rapides sur les concepts clés de cybersécurité',
      icon: <FileText />,
      duration: '5-10min',
      level: 'tous niveaux',
      category: 'parcours-rapide',
      tags: ['fiches', 'synthèse', 'express', 'concepts'],
      progress: 0,
      destination: '/cyber/learning-center/modules/fiches-cyber-express',
      isNew: true
    },
    {
      id: 'quiz-adaptatif-ia',
      title: 'Quiz adaptatif IA',
      description: 'Évaluez vos connaissances avec des quiz personnalisés par l\'IA',
      icon: <BrainCircuit />,
      duration: '10-15min',
      level: 'tous niveaux',
      category: 'parcours-rapide',
      tags: ['quiz', 'évaluation', 'adaptatif', 'IA'],
      progress: 0,
      destination: '/cyber/learning-center/modules/quiz-adaptatif-ia',
      isNew: true
    },
    {
      id: 'glossaire-visuel',
      title: 'Glossaire visuel',
      description: 'Lexique illustré des termes techniques de cybersécurité',
      icon: <BookOpen />,
      duration: '5-15min',
      level: 'débutant',
      category: 'parcours-rapide',
      tags: ['glossaire', 'terminologie', 'visuel', 'lexique'],
      progress: 0,
      destination: '/cyber/learning-center/modules/glossaire-visuel',
      isNew: true
    },
    {
      id: 'memo-ia-personnalise',
      title: 'Mémo IA personnalisé',
      description: 'Créez des aide-mémoires sur mesure grâce à l\'intelligence artificielle',
      icon: <Bot />,
      duration: '5-10min',
      level: 'tous niveaux',
      category: 'parcours-rapide',
      tags: ['mémo', 'personnalisé', 'IA', 'aide-mémoire'],
      progress: 0,
      destination: '/cyber/learning-center/modules/memo-ia-personnalise',
      isNew: true
    },
  ];
  
  // Tous les modules combinés pour la recherche
  const allModules = [...basicModules, ...specializedModules, ...microModules, ...quickLearningModules];
  
  // Parcours thématiques
  const learningPaths: LearningPath[] = [
    {
      id: 'rssi',
      title: 'Parcours RSSI',
      description: 'Formation complète pour les Responsables de la Sécurité des Systèmes d\'Information',
      icon: <Shield />,
      modules: ['intro-cybersecurite', 'modele-menaces', 'analyse-risques', 'normes-standards', 'gouvernance-cyber', 'securite-cloud'],
      duration: '40-50h',
      level: 'avancé',
      category: 'mixte',
      objectives: [
        'Maîtriser les fondamentaux de la gouvernance de la cybersécurité',
        'Comprendre les aspects juridiques et réglementaires',
        'Élaborer et mettre en œuvre une stratégie de sécurité',
        'Gérer les risques et les incidents de sécurité'
      ],
      tags: ['RSSI', 'gouvernance', 'stratégie', 'conformité', 'management'],
      progress: 0,
      certification: 'Certification interne RSSI',
      isNew: true,
      gradient: 'from-blue-800 to-indigo-600'
    },
    {
      id: 'architecte-securite',
      title: 'Parcours Architecte Sécurité',
      description: 'Conception d\'architectures de sécurité robustes et conformes',
      icon: <Layers />,
      modules: ['securite-reseaux', 'securite-cloud', 'zero-trust', 'devsecops', 'securite-donnees', 'gestion-identites'],
      duration: '35-45h',
      level: 'avancé',
      category: 'technique',
      objectives: [
        'Concevoir des architectures de sécurité résilientes',
        'Maîtriser les technologies de sécurité avancées',
        'Sécuriser les environnements cloud et hybrides',
        'Implémenter des modèles Zero Trust'
      ],
      tags: ['architecture', 'conception', 'infrastructure', 'cloud', 'réseaux'],
      progress: 0,
      gradient: 'from-indigo-700 to-purple-700'
    },
    {
      id: 'analyste-soc',
      title: 'Parcours Analyste SOC',
      description: 'Surveillance, détection et réponse aux menaces cybernétiques',
      icon: <Eye />,
      modules: ['securite-reseaux', 'phishing-detection', 'ransomware', 'intelligence-artificielle-securite'],
      duration: '30-40h',
      level: 'intermédiaire',
      category: 'technique',
      objectives: [
        'Surveiller et analyser les événements de sécurité',
        'Détecter et qualifier les incidents',
        'Mener les premières actions de réponse',
        'Utiliser les outils de détection et d\'analyse'
      ],
      tags: ['SOC', 'détection', 'surveillance', 'incidents', 'SIEM', 'XDR'],
      progress: 0,
      gradient: 'from-green-700 to-emerald-700'
    },
    {
      id: 'devsecops-engineer',
      title: 'Parcours DevSecOps',
      description: 'Intégration de la sécurité dans le DevOps et le cycle de développement',
      icon: <Code />,
      modules: ['devsecops', 'securite-cloud', 'intelligence-artificielle-securite', 'zero-trust'],
      duration: '25-35h',
      level: 'avancé',
      category: 'technique',
      objectives: [
        'Intégrer la sécurité dans le pipeline CI/CD',
        'Automatiser les tests de sécurité',
        'Sécuriser les environnements conteneurisés',
        'Mettre en œuvre des pratiques IaC sécurisées'
      ],
      tags: ['DevSecOps', 'CI/CD', 'automatisation', 'containers', 'développement sécurisé'],
      progress: 0,
      isNew: true,
      gradient: 'from-rose-700 to-red-700'
    }
  ];
  
  // Catégories de ressources pour l'interface
  const resourceCategories: ResourceCategory[] = [
    {
      id: 'parcours-rapide',
      title: 'Parcours rapide',
      description: 'Apprentissage accéléré et outils d\'auto-formation',
      icon: <Zap />,
      modules: quickLearningModules,
      gradient: 'from-orange-800 to-transparent'
    },
    {
      id: 'fondamentaux',
      title: 'Fondamentaux de la cybersécurité',
      description: 'Concepts essentiels pour tous les niveaux',
      icon: <Shield />,
      modules: basicModules,
      gradient: 'from-blue-800 to-transparent'
    },
    {
      id: 'modules-technique',
      title: 'Modules techniques avancés',
      description: 'Pour approfondir vos connaissances techniques',
      icon: <Code />,
      modules: specializedModules,
      gradient: 'from-violet-800 to-transparent'
    },
    {
      id: 'micro-learning',
      title: 'Modules micro-learning',
      description: 'Formations courtes et ciblées sur des sujets spécifiques',
      icon: <Clock />,
      modules: microModules,
      gradient: 'from-emerald-800 to-transparent'
    }
  ];
  
  // Filtrer les modules en fonction des critères de recherche
  const filterModules = (modules: Module[]) => {
    return modules.filter(module => {
      const matchesSearch = searchTerm === '' || 
        module.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        module.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesLevel = selectedLevel === 'all' || selectedLevel === '' || module.level === selectedLevel;
      
      const matchesCategory = selectedCategory === 'all' || selectedCategory === '' || module.category === selectedCategory;
      
      let matchesDuration = true;
      if (selectedDuration === 'court') {
        matchesDuration = module.duration.includes('min') || module.duration.includes('1h');
      } else if (selectedDuration === 'moyen') {
        matchesDuration = module.duration.includes('2-3h') || module.duration.includes('3-4h') || module.duration.includes('4-5h');
      } else if (selectedDuration === 'long') {
        matchesDuration = !module.duration.includes('min') && 
          (module.duration.includes('5') || module.duration.includes('6') || 
           module.duration.includes('7') || module.duration.includes('8') || 
           module.duration.includes('9') || module.duration.includes('10'));
      }
      
      return matchesSearch && matchesLevel && matchesCategory && matchesDuration;
    });
  };
  
  // Filtrer les parcours en fonction des critères de recherche
  const filterPaths = (paths: LearningPath[]) => {
    return paths.filter(path => {
      const matchesSearch = searchTerm === '' || 
        path.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        path.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        path.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesLevel = selectedLevel === 'all' || selectedLevel === '' || path.level === selectedLevel;
      
      const matchesCategory = selectedCategory === 'all' || selectedCategory === '' || path.category === selectedCategory;
      
      let matchesDuration = true;
      if (selectedDuration === 'court') {
        matchesDuration = path.duration.includes('10') || path.duration.includes('15') || path.duration.includes('20');
      } else if (selectedDuration === 'moyen') {
        matchesDuration = path.duration.includes('25') || path.duration.includes('30') || path.duration.includes('35');
      } else if (selectedDuration === 'long') {
        matchesDuration = path.duration.includes('40') || path.duration.includes('45') || 
                         path.duration.includes('50') || path.duration.includes('55') || 
                         path.duration.includes('60');
      }
      
      return matchesSearch && matchesLevel && matchesCategory && matchesDuration;
    });
  };

  // Génération de contenu avec IA
  const generateContent = () => {
    if (aiPrompt.trim() === '') {
      toast({
        title: "Prompt requis",
        description: "Veuillez entrer une demande pour l'assistant IA.",
        variant: "destructive"
      });
      return;
    }
    
    setIsGenerating(true);
    
    // Simuler une génération
    setTimeout(() => {
      setIsGenerating(false);
      toast({
        title: "Contenu généré",
        description: "Votre contenu personnalisé a été créé avec succès.",
      });
      setAiPrompt('');
    }, 3000);
  };
  
  // Fonction pour lancer le tutoriel
  const handleStartTutorial = () => {
    setCurrentTour('learning-center');
    startTutorial();
  };
  
  // Rendu du module avec lien direct vers la page du module
  const renderModuleCard = (module: Module, index: number) => (
    <motion.div
      key={module.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link href={module.destination || '#'} className="block h-full">
        <Card className="h-full bg-blue-950/70 border-blue-700/30 hover:bg-blue-900/60 transition-all duration-200 cursor-pointer overflow-hidden group">
          <div className="p-5">
            <div className="flex items-start mb-4">
              <div className="h-8 w-8 mr-2 flex items-center justify-center bg-blue-800 text-white rounded">
                {module.icon}
              </div>
              <div>
                {module.isNew && (
                  <Badge className="bg-blue-600 hover:bg-blue-700 text-[10px] font-normal py-0 h-4">Nouveau</Badge>
                )}
                {module.isFeatured && (
                  <Badge className="bg-amber-600 hover:bg-amber-700 text-[10px] font-normal py-0 h-4 ml-1">Populaire</Badge>
                )}
                <h3 className="font-medium text-white mt-1">{module.title}</h3>
              </div>
            </div>
            <div className="text-xs text-blue-300 flex items-center mb-2">
              <span className="bg-blue-800/50 px-2 py-0.5 rounded text-[10px]">{module.level}</span>
              <span className="ml-2 text-blue-400">{module.duration}</span>
            </div>
            <p className="text-sm text-blue-100 mb-4">{module.description}</p>
            <div className="flex flex-wrap gap-1">
              {module.tags.slice(0, 3).map(tag => (
                <Badge key={tag} className="bg-blue-900/60 hover:bg-blue-800 text-[10px] border border-blue-600 text-blue-300">{tag}</Badge>
              ))}
            </div>
          </div>
          {(module.progress !== undefined && module.progress > 0) && (
            <div className="px-5 pb-3">
              <div className="flex items-center text-xs text-blue-400 mb-1">
                <span>Progression: {module.progress}%</span>
              </div>
              <Progress value={module.progress} className="h-1.5 bg-blue-900/40" indicatorClassName="bg-blue-500" />
            </div>
          )}
          <div className="absolute inset-0 flex items-end justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button className="mb-4 bg-blue-600 hover:bg-blue-700">
              {module.progress && module.progress > 0 ? 'Continuer' : 'Commencer'}
            </Button>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
  
  // Rendu d'un parcours d'apprentissage
  const renderLearningPathCard = (path: LearningPath, index: number) => (
    <motion.div
      key={path.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="col-span-1 md:col-span-2"
    >
      <Card className="bg-blue-950/70 border-blue-700/30 hover:bg-blue-900/60 transition-all duration-200 overflow-hidden h-full">
        <div className="bg-gradient-to-r border-b border-blue-700/30 p-4 flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-gradient-to-r ${path.gradient}`}>
            {path.icon}
          </div>
          <div>
            <h3 className="font-semibold text-white">{path.title}</h3>
            <p className="text-sm text-blue-300">{path.duration} • {path.level}</p>
          </div>
          {path.isNew && (
            <Badge className="bg-blue-600 hover:bg-blue-700 ml-auto">Nouveau</Badge>
          )}
        </div>
        <div className="p-4">
          <p className="text-blue-100 mb-4">{path.description}</p>
          
          <div className="mb-4">
            <h4 className="text-sm font-medium text-white mb-2">Objectifs d'apprentissage</h4>
            <ul className="text-sm text-blue-200 list-disc pl-5 space-y-1">
              {path.objectives.slice(0, 3).map((objective, i) => (
                <li key={i}>{objective}</li>
              ))}
            </ul>
          </div>
          
          <div className="mb-4">
            <h4 className="text-sm font-medium text-white mb-2">Modules inclus ({path.modules.length})</h4>
            <div className="flex flex-wrap gap-1.5">
              {path.modules.slice(0, 5).map(moduleId => {
                const module = allModules.find(m => m.id === moduleId);
                return module ? (
                  <Badge key={moduleId} className="bg-blue-900/80 text-[10px]">
                    {module.title}
                  </Badge>
                ) : null;
              })}
              {path.modules.length > 5 && (
                <Badge className="bg-blue-900/80 text-[10px]">
                  +{path.modules.length - 5} modules
                </Badge>
              )}
            </div>
          </div>
          
          {path.certification && (
            <div className="mb-4 flex items-center">
              <GraduationCap className="h-4 w-4 text-amber-400 mr-1.5" />
              <span className="text-xs text-blue-200">{path.certification}</span>
            </div>
          )}
          
          <div className="flex justify-end mt-2">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Voir le parcours
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
  
  // Fonction pour mettre à jour la liste des modules
  const updateModules = () => {
    // Chercher le module IA et cybersécurité avec l'un ou l'autre des IDs possibles
    const iaModule = allModules.find(m => 
      m.id === 'intelligence-artificielle-securite' || m.id === 'ia-securite'
    );
    
    // Si on le trouve, on change sa catégorie pour l'intégrer aux fondamentaux
    if (iaModule) {
      iaModule.category = 'fondamentaux';
    }
    
    // Vérifier et corriger les liens de destination pour tous les modules
    allModules.forEach(module => {
      // S'assurer que chaque module a une destination valide
      if (!module.destination && module.id) {
        module.destination = `/cyber/learning-center/modules/${module.id}`;
      }
      
      // Retirer l'affichage de durée si besoin
      module.duration = '';
    });
    
    // Filtrer pour exclure le module 'modele-menaces' et garder seulement les modules non "à venir"
    return allModules.filter(module => 
      !module.comingSoon && module.id !== 'modele-menaces'
    );
  };
  
  // Appliquer les modifications à la liste des modules
  const filteredModules = updateModules();
  
  return (
    <div className="min-h-screen bg-[#0a1429]">
      <PageTitle title="Cyber Académie | Centre de formation" />
      
      {/* En-tête avec navigation et titre */}
      <div className="border-b border-blue-800/60">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/cyber/roleplay">
            <Button variant="ghost" className="text-blue-300 hover:bg-blue-900/30 hover:text-blue-200">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </Link>
          <h1 className="text-xl text-white font-medium">Cyber Académie</h1>
          
          <div className="ml-auto flex items-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-9 h-9 p-0 text-blue-400 hover:text-blue-300 hover:bg-blue-900/30 rounded-full"
                    onClick={handleStartTutorial}
                  >
                    <Eye className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Visite guidée</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-9 h-9 p-0 text-blue-400 hover:text-blue-300 hover:bg-blue-900/30 rounded-full"
                    onClick={() => setAiPanelOpen(!aiPanelOpen)}
                  >
                    <BrainCircuit className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Assistant pédagogique IA</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
      
      {/* Contenu principal */}
      <div className="container mx-auto px-4 py-8">
        {/* Titre et description */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Centre de formation en cybersécurité</h1>
          <p className="text-blue-300 max-w-3xl">Développez vos compétences en cybersécurité avec nos modules de formation interactifs adaptés à tous les niveaux, des débutants aux experts.</p>
        </div>
        
        {/* Espace entre le titre et le contenu */}
        <div className="mb-10"></div>
        
        {/* Affichage des fondamentaux de la cybersécurité uniquement */}
        <div className="space-y-8">
          {/* Fondamentaux de la cybersécurité */}
          <div className="bg-gradient-to-r from-blue-900/40 to-blue-950/60 border border-blue-700 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold flex items-center">
                <Shield className="mr-3 h-6 w-6 text-blue-400" />
                Fondamentaux de la cybersécurité
              </h2>
              <Badge variant="outline" className="bg-blue-800/30 border-blue-600 text-blue-200 px-3 py-1 text-sm">
                {filteredModules.filter(m => m.category === 'fondamentaux').length} modules
              </Badge>
            </div>
            <p className="text-blue-200 mb-6">
              Une formation complète et structurée pour maîtriser les fondamentaux de la cybersécurité,
              depuis la sensibilisation jusqu'aux techniques de protection avancées.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredModules
                .filter(module => module.category === 'fondamentaux')
                .map((module, index) => (
                  <Link key={module.id} href={module.destination || '#'} className="block h-full">
                    <Card className="h-full bg-blue-900/20 border border-blue-700 flex flex-col hover:shadow-md hover:border-blue-500 transition-all">
                      <div className="flex p-4">
                        <div className="p-2 rounded-full bg-blue-800/50 mr-3 h-10 w-10 flex items-center justify-center">
                          {module.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium text-white">{module.title}</h3>
                          </div>
                          <p className="text-sm text-blue-300 mt-1 truncate">{module.description}</p>
                        </div>
                      </div>
                      <div className="mt-auto p-2 pl-4">
                        <Button variant="link" className="text-blue-300 hover:text-blue-100 p-0 h-auto">
                          {module.progress && module.progress > 0 ? 'Continuer' : 'Commencer'} →
                        </Button>
                      </div>
                    </Card>
                  </Link>
              ))}
            </div>
          </div>
        </div>
        
        {/* Panel Assistant IA */}
        {aiPanelOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-0 left-0 right-0 bg-blue-950 border-t border-blue-700 p-4 z-50"
          >
            <div className="container mx-auto">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-white font-semibold flex items-center">
                  <BrainCircuit className="h-5 w-5 mr-2 text-blue-400" />
                  Assistant pédagogique IA
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-300 hover:bg-blue-900/30"
                  onClick={() => setAiPanelOpen(false)}
                >
                  Fermer
                </Button>
              </div>
              <div className="flex gap-3">
                <Input
                  className="bg-blue-900/50 border-blue-700 text-white"
                  placeholder="Demandez à l'IA de vous créer un contenu personnalisé..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  disabled={isGenerating}
                />
                <Button
                  className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap"
                  onClick={generateContent}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                      Génération...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Générer
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}