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
      tags: ['concepts', 'principes', 'introduction'],
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
      tags: ['risques', 'analyse', 'méthodologie'],
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
      tags: ['réseau', 'firewall', 'IDS/IPS'],
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
      tags: ['ransomware', 'malware', 'prévention'],
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
      description: 'Formation complète pour les responsables de la sécurité des systèmes d\'information',
      icon: <Users />,
      modules: ['gouvernance-cyber', 'analyse-risques', 'normes-standards', 'securite-donnees'],
      duration: '30-40h',
      level: 'avancé',
      category: 'gouvernance',
      objectives: [
        'Développer une stratégie de sécurité globale',
        'Maîtriser les aspects juridiques et réglementaires',
        'Gérer une équipe de sécurité',
        'Communiquer avec la direction et les parties prenantes'
      ],
      tags: ['RSSI', 'gouvernance', 'management', 'stratégie'],
      progress: 0,
      certification: 'Attestation de compétences',
      gradient: 'from-blue-800 to-indigo-900'
    },
    {
      id: 'securite-applicative',
      title: 'Sécurité applicative',
      description: 'Maîtriser la sécurité dans le développement d\'applications',
      icon: <Code />,
      modules: ['devsecops', 'securite-donnees', 'gestion-identites', 'modele-menaces'],
      duration: '25-30h',
      level: 'avancé',
      category: 'technique',
      objectives: [
        'Intégrer la sécurité dans le cycle de développement',
        'Identifier et corriger les vulnérabilités courantes',
        'Mettre en œuvre des tests de sécurité automatisés',
        'Sécuriser les API et les interfaces'
      ],
      tags: ['développement', 'AppSec', 'SAST/DAST', 'vulnérabilités'],
      progress: 0,
      certification: 'Certification interne',
      gradient: 'from-amber-700 to-red-900',
      isNew: true
    },
    {
      id: 'securite-cloud-native',
      title: 'Sécurité cloud native',
      description: 'Sécuriser les environnements cloud modernes et les architectures conteneurisées',
      icon: <CloudRain />,
      modules: ['securite-cloud', 'devsecops', 'zero-trust', 'securite-donnees'],
      duration: '20-25h',
      level: 'avancé',
      category: 'technique',
      objectives: [
        'Concevoir des architectures cloud sécurisées',
        'Sécuriser les environnements Kubernetes',
        'Implémenter la sécurité as code',
        'Gérer les identités et les accès dans le cloud'
      ],
      tags: ['cloud', 'conteneurs', 'Kubernetes', 'infrastructure as code'],
      progress: 0,
      certification: 'Badge de compétences cloud',
      gradient: 'from-cyan-800 to-blue-900',
      isNew: true
    },
    {
      id: 'reponse-incidents',
      title: 'Gestion et réponse aux incidents',
      description: 'Préparer et gérer efficacement les incidents de sécurité',
      icon: <Zap />,
      modules: ['securite-reseaux', 'analyse-risques', 'ransomware', 'gouvernance-cyber'],
      duration: '15-20h',
      level: 'intermédiaire',
      category: 'mixte',
      objectives: [
        'Élaborer un plan de réponse aux incidents',
        'Identifier et contenir les incidents',
        'Mettre en place un processus d\'investigation',
        'Gérer la communication de crise'
      ],
      tags: ['incidents', 'CERT/CSIRT', 'forensique', 'gestion de crise'],
      progress: 0,
      gradient: 'from-red-800 to-orange-900'
    },
    {
      id: 'conformite-rgpd',
      title: 'Conformité RGPD',
      description: 'Mettre en œuvre les exigences du Règlement Général sur la Protection des Données',
      icon: <FileText />,
      modules: ['securite-donnees', 'gouvernance-cyber', 'normes-standards', 'analyse-risques'],
      duration: '10-15h',
      level: 'intermédiaire',
      category: 'gouvernance',
      objectives: [
        'Comprendre les obligations légales du RGPD',
        'Implémenter les mesures techniques et organisationnelles',
        'Gérer les droits des personnes concernées',
        'Documenter la conformité'
      ],
      tags: ['RGPD', 'vie privée', 'données personnelles', 'conformité'],
      progress: 0,
      gradient: 'from-green-800 to-teal-900'
    },
    {
      id: 'sensibilisation-collaborateurs',
      title: 'Programme de sensibilisation',
      description: 'Développer et déployer un programme de sensibilisation efficace',
      icon: <Users />,
      modules: ['phishing-detection', 'mot-de-passe', 'ransomware', 'byod-securite'],
      duration: '8-12h',
      level: 'tous niveaux',
      category: 'mixte',
      objectives: [
        'Construire un programme adapté aux différents publics',
        'Mesurer l\'efficacité des actions de sensibilisation',
        'Créer des contenus engageants',
        'Favoriser l\'adoption des bonnes pratiques'
      ],
      tags: ['sensibilisation', 'formation', 'facteur humain', 'culture sécurité'],
      progress: 0,
      gradient: 'from-purple-800 to-indigo-900'
    }
  ];

  // Définir les modules par pilier cybersécurité
  const protectionDefenseModules = allModules.filter(module => 
    module.tags.some(tag => ['réseau', 'firewall', 'IDS/IPS', 'chiffrement', 'authentification', 
      'zero trust', 'cloud', 'BYOD', 'mobile', 'endpoints', 'VPN', 'segmentation'].includes(tag))
  );
  
  const conformiteGouvernanceModules = allModules.filter(module => 
    module.tags.some(tag => ['normes', 'standards', 'conformité', 'gouvernance', 'stratégie', 
      'organisation', 'risques', 'analyse', 'RGPD', 'ISO 27001'].includes(tag))
  );
  
  const analyseReponseModules = allModules.filter(module => 
    module.tags.some(tag => ['ransomware', 'malware', 'incidents', 'forensique', 
      'gestion de crise', 'threat hunting'].includes(tag))
  );
  
  const cultureSensibilisationModules = allModules.filter(module => 
    module.tags.some(tag => ['phishing', 'social engineering', 'sensibilisation', 'mots de passe', 
      'formation', 'facteur humain', 'culture sécurité', 'bonnes pratiques'].includes(tag))
  );
  
  // Catégories de ressources
  const resourceCategories: ResourceCategory[] = [
    {
      id: 'protection-defense',
      title: '🛡️ Protection et Défense des Systèmes',
      description: 'Empêcher, détecter et répondre aux attaques',
      icon: <Shield className="h-6 w-6 text-blue-100" />,
      modules: protectionDefenseModules,
      gradient: 'from-blue-700 to-blue-900'
    },
    {
      id: 'conformite-gouvernance',
      title: '📋 Conformité, Gouvernance et Risques',
      description: 'Respecter les règles et structurer la sécurité',
      icon: <FileText className="h-6 w-6 text-green-100" />,
      modules: conformiteGouvernanceModules,
      gradient: 'from-green-700 to-green-900'
    },
    {
      id: 'analyse-reponse',
      title: '🔍 Analyse et Réponse aux Incidents',
      description: 'Savoir enquêter et agir en cas d\'attaque',
      icon: <Zap className="h-6 w-6 text-orange-100" />,
      modules: analyseReponseModules,
      gradient: 'from-orange-700 to-red-900'
    },
    {
      id: 'culture-sensibilisation',
      title: '🧠 Culture et Sensibilisation',
      description: 'Faire de l\'humain le premier rempart',
      icon: <Users className="h-6 w-6 text-purple-100" />,
      modules: cultureSensibilisationModules,
      gradient: 'from-purple-700 to-purple-900'
    },
    {
      id: 'parcours-rapide',
      title: '⚡ Parcours rapide',
      description: 'Apprentissage accéléré et outils d\'auto-formation',
      icon: <Clock className="h-6 w-6 text-yellow-100" />,
      modules: quickLearningModules,
      gradient: 'from-amber-600 to-orange-800'
    }
  ];

  // Fonction de filtrage des modules
  const getFilteredModules = () => {
    return allModules.filter(module => {
      const matchesSearch = searchTerm === '' || 
        module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesLevel = selectedLevel === '' || selectedLevel === 'all' || module.level === selectedLevel;
      const matchesCategory = selectedCategory === '' || selectedCategory === 'all' || module.category === selectedCategory;
      const matchesDuration = selectedDuration === '' || selectedDuration === 'all' ||
        (selectedDuration === 'court' && getDurationMinutes(module.duration) < 60) ||
        (selectedDuration === 'moyen' && getDurationMinutes(module.duration) >= 60 && getDurationMinutes(module.duration) < 240) ||
        (selectedDuration === 'long' && getDurationMinutes(module.duration) >= 240);
      
      return matchesSearch && matchesLevel && matchesCategory && matchesDuration;
    });
  };

  // Fonction pour obtenir la durée en minutes (approximative)
  const getDurationMinutes = (duration: string): number => {
    if (duration.includes('min')) {
      const range = duration.split('-');
      const minutes = parseInt(range[1]);
      return minutes;
    } else if (duration.includes('h')) {
      const range = duration.split('-');
      const hours = parseInt(range[1]);
      return hours * 60;
    }
    return 0;
  };

  // Fonction pour simuler la génération de plan d'apprentissage IA
  const generateLearningPlan = async () => {
    if (aiPrompt.trim() === '') {
      toast({
        title: 'Veuillez spécifier vos objectifs',
        description: 'Pour générer un plan personnalisé, nous avons besoin de connaître vos objectifs d\'apprentissage.',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);
    
    // Simuler un délai de traitement
    setTimeout(() => {
      setIsGenerating(false);
      
      toast({
        title: 'Plan d\'apprentissage généré',
        description: 'Votre plan d\'apprentissage personnalisé a été créé avec succès.',
        variant: 'default'
      });
      
      // Ici, on pourrait afficher un plan personnalisé basé sur l'input de l'utilisateur
      // Pour cette démo, on reste sur l'interface existante
    }, 2500);
  };

  // Animation des cartes
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5
      }
    })
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 to-slate-950 text-white pb-20">
      {/* En-tête */}
      <div className="p-6 container mx-auto">
        <div className="flex items-center mb-2">
          <Link href="/cyber">
            <Button variant="ghost" className="text-white mr-4">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Retour
            </Button>
          </Link>
          <PageTitle title="CYBER ACADÉMIE" />
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Cyber Académie</h1>
            <p className="text-blue-200 mt-1">Centre de formation complet en cybersécurité</p>
          </div>
          
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button 
              variant="outline" 
              size="sm"
              className="border-blue-500 text-blue-200 hover:bg-blue-800/30"
              onClick={() => {
                setCurrentTour('cyber-academie');
                startTutorial();
              }}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Visite guidée
            </Button>
            
            <Button 
              variant="default" 
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setAiPanelOpen(!aiPanelOpen)}
              data-id="ai-assistant-button"
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
                placeholder="Ex: Je souhaite me former à la sécurité cloud pour préparer une certification dans 3 mois..."
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
                <SelectItem value="fondamentaux">Fondamentaux</SelectItem>
                <SelectItem value="technique">Technique</SelectItem>
                <SelectItem value="gouvernance">Gouvernance</SelectItem>
                <SelectItem value="micro-learning">Micro-learning</SelectItem>
                <SelectItem value="parcours-rapide">Parcours rapide</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedDuration} onValueChange={setSelectedDuration}>
              <SelectTrigger className="w-auto min-w-[150px] bg-blue-950/40 border-blue-800 text-white">
                <SelectValue placeholder="Durée" />
              </SelectTrigger>
              <SelectContent className="bg-blue-900 border-blue-800 text-white">
                <SelectItem value="all">Toutes les durées</SelectItem>
                <SelectItem value="court">Court (moins de 1h)</SelectItem>
                <SelectItem value="moyen">Moyen (1-4h)</SelectItem>
                <SelectItem value="long">Long (plus de 4h)</SelectItem>
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
                            <Progress value={path.progress} className="h-2 bg-white/20" 
                              indicatorClassName="bg-white" />
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="pt-0 mt-auto">
                        <Button className="w-full bg-white/20 hover:bg-white/30 text-white" disabled>
                          <Clock className="mr-2 h-4 w-4" />
                          Bientôt disponible
                        </Button>
                      </CardFooter>
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
                    <h3 className="font-semibold mb-2">Progression globale</h3>
                    <Progress value={0} className="h-2" />
                    <p className="text-xs text-blue-300 mt-1 text-right">0%</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-3">Compétences acquises</h3>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-xs">
                          <span>Fondamentaux</span>
                          <span>0%</span>
                        </div>
                        <Progress value={0} className="h-1.5" />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs">
                          <span>Technique</span>
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
                  <Button variant="outline" className="w-full border-blue-700" disabled>
                    <Clock className="mr-2 h-4 w-4" />
                    Bientôt disponible
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Colonne 2: Modules en cours */}
              <Card className="bg-blue-900/20 border-blue-800">
                <CardHeader>
                  <CardTitle>Modules en cours</CardTitle>
                  <CardDescription className="text-blue-200">Reprenez votre apprentissage où vous l'avez laissé</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center h-32 border border-dashed border-blue-800 rounded-md">
                    <div className="text-center px-4">
                      <Folder className="h-8 w-8 mx-auto text-blue-400 mb-2" />
                      <p className="text-sm text-blue-300">Aucun module en cours</p>
                      <p className="text-xs text-blue-400 mt-1">Cette fonctionnalité sera bientôt disponible</p>
                    </div>
                  </div>
                  
                  <Separator className="my-4 bg-blue-800/50" />
                  
                  <h3 className="font-semibold mb-3">Modules recommandés</h3>
                  <div className="space-y-3">
                    {allModules.filter(m => m.isNew || m.isFeatured).slice(0, 3).map((module) => (
                      <Link href={module.destination || '#'} key={module.id}>
                        <div className="flex items-center gap-3 p-2 rounded-md hover:bg-blue-800/20 transition-colors cursor-pointer">
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
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-white/20 hover:bg-white/30 text-white" disabled>
                    <Clock className="mr-2 h-4 w-4" />
                    Bientôt disponible
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Colonne 3: Parcours et certification */}
              <Card className="bg-blue-900/20 border-blue-800">
                <CardHeader>
                  <CardTitle>Parcours et certifications</CardTitle>
                  <CardDescription className="text-blue-200">Suivez votre progression vers vos objectifs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center h-32 border border-dashed border-blue-800 rounded-md">
                    <div className="text-center px-4">
                      <GraduationCap className="h-8 w-8 mx-auto text-blue-400 mb-2" />
                      <p className="text-sm text-blue-300">Aucun parcours sélectionné</p>
                      <p className="text-xs text-blue-400 mt-1">Cette fonctionnalité sera bientôt disponible</p>
                    </div>
                  </div>
                  
                  <Separator className="my-4 bg-blue-800/50" />
                  
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
                  <Button variant="outline" className="w-full border-blue-700" disabled>
                    <Clock className="mr-2 h-4 w-4" />
                    Bientôt disponible
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
                    <p className="text-xs text-blue-400 mt-2">Cette fonctionnalité sera bientôt disponible</p>
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