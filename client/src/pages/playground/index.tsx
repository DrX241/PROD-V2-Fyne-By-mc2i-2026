import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { ArrowLeft, ArrowRight, Settings, Trophy, CheckCircle, Lock, Shield, Terminal, Code, BookOpen, ArrowUpRight, Star, Clock, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/contexts/ThemeContext';

// Types pour les modules d'apprentissage
interface LearningStep {
  id: string;
  title: string;
  type: 'theory' | 'practice' | 'challenge' | 'quiz' | 'scenario' | 'terminal';
  content: string;
  codeExample?: string;
  solution?: string;
  options?: string[];
  correctAnswer?: string;
}

interface LearningModule {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'defense' | 'offense' | 'analysis' | 'fundamentals' | 'compliance';
  steps: LearningStep[];
  unlocked: boolean;
  completed: boolean;
  progress: number;
  xp: number;
  icon: string;
  color: string;
  tags: string[];
  estimatedTime: string;
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  modules: string[];
  progress: number;
  color: string;
  icon: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  xp: number;
  estimatedTime: string;
}

// Données factices pour les modules
const mockLearningModules: LearningModule[] = [
  {
    id: 'cybersecurity-intro',
    title: 'Introduction à la Cybersécurité',
    description: 'Maîtrisez les fondamentaux de la cybersécurité en pratiquant sur des cas réels',
    difficulty: 'beginner',
    category: 'fundamentals',
    tags: ['Débutant', 'Fondamentaux', 'CIA Triad'],
    estimatedTime: '25 min',
    steps: [
      {
        id: 'what-is-cybersecurity',
        title: 'La sécurité numérique',
        type: 'theory',
        content: 'Introduction aux concepts de base de la cybersécurité et à la triade CIA'
      },
      {
        id: 'password-challenge',
        title: 'Créer un mot de passe fort',
        type: 'practice',
        content: 'Exercice pratique de création de fonction pour vérifier la robustesse des mots de passe'
      },
      {
        id: 'security-scenario',
        title: 'Incident de phishing',
        type: 'scenario',
        content: 'Scénario interactif: gérer une tentative de phishing dans une entreprise'
      },
      {
        id: 'terminal-exercise',
        title: 'Commandes de sécurité Linux',
        type: 'terminal',
        content: 'Pratiquez les commandes Linux essentielles pour la sécurité'
      },
      {
        id: 'cia-quiz',
        title: 'Quiz: Triade CIA',
        type: 'quiz',
        content: 'Testez vos connaissances sur les principes fondamentaux de la sécurité',
        options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
        correctAnswer: 'Option 2'
      }
    ],
    unlocked: true,
    completed: false,
    progress: 0,
    xp: 100,
    icon: '🔐',
    color: 'blue',
  },
  {
    id: 'threat-landscape',
    title: 'Panorama des menaces actuelles',
    description: 'Découvrez les principales cybermenaces en analysant des cas d\'attaques réelles',
    difficulty: 'beginner',
    category: 'analysis',
    tags: ['Menaces', 'Veille', 'Attaques'],
    estimatedTime: '35 min',
    steps: [
      {
        id: 'common-threats',
        title: 'Principales menaces cybernétiques',
        type: 'theory',
        content: 'Vue d\'ensemble des types d\'attaques courantes'
      },
      {
        id: 'ransomware-scenario',
        title: 'Simulation: Attaque de ransomware',
        type: 'scenario',
        content: 'Scénario interactif: gérer une attaque de ransomware'
      }
    ],
    unlocked: true,
    completed: false,
    progress: 0,
    xp: 150,
    icon: '🔍',
    color: 'red',
  },
  {
    id: 'network-security',
    title: 'Sécurité des réseaux',
    description: 'Implémentez des défenses réseau efficaces contre les intrusions et les attaques',
    difficulty: 'intermediate',
    category: 'defense',
    steps: [],
    unlocked: false,
    completed: false,
    progress: 0,
    xp: 200,
    icon: '🌐',
    color: 'green',
    tags: ['Firewall', 'IDS/IPS', 'VPN'],
    estimatedTime: '45 min',
  },
  {
    id: 'web-application-security',
    title: 'Sécurité des applications Web',
    description: 'Protégez vos applications web contre les vulnérabilités courantes (OWASP Top 10)',
    difficulty: 'intermediate',
    category: 'defense',
    steps: [],
    unlocked: false,
    completed: false,
    progress: 0,
    xp: 250,
    icon: '🔒',
    color: 'purple',
    tags: ['OWASP', 'XSS', 'Injections'],
    estimatedTime: '50 min',
  },
  {
    id: 'incident-response',
    title: 'Réponse aux incidents',
    description: 'Apprenez à détecter, contenir et mitiger des incidents de sécurité en temps réel',
    difficulty: 'advanced',
    category: 'defense',
    steps: [],
    unlocked: false,
    completed: false,
    progress: 0,
    xp: 300,
    icon: '🚨',
    color: 'orange',
    tags: ['DFIR', 'Forensics', 'Playbooks'],
    estimatedTime: '60 min',
  },
  {
    id: 'ethical-hacking',
    title: 'Hacking éthique',
    description: 'Découvrez les techniques utilisées par les hackers pour mieux vous défendre',
    difficulty: 'advanced',
    category: 'offense',
    steps: [],
    unlocked: false,
    completed: false,
    progress: 0,
    xp: 350,
    icon: '🧪',
    color: 'yellow',
    tags: ['Pentest', 'Exploit', 'Recon'],
    estimatedTime: '70 min',
  }
];

// Données factices pour les parcours d'apprentissage
const learningPaths: LearningPath[] = [
  {
    id: 'cyber-defense-specialist',
    title: 'Spécialiste en Cyber-Défense',
    description: 'Maîtrisez les techniques et outils de protection des systèmes d\'information',
    modules: ['cybersecurity-intro', 'network-security', 'incident-response'],
    progress: 10,
    color: 'from-blue-600 to-green-600',
    icon: '🛡️',
    difficulty: 'intermediate',
    xp: 1000,
    estimatedTime: '4h 30min',
  },
  {
    id: 'threat-hunter',
    title: 'Chasseur de menaces',
    description: 'Apprenez à traquer les menaces persistantes avancées (APT) et les détections d\'anomalies',
    modules: ['threat-landscape', 'incident-response', 'ethical-hacking'],
    progress: 0,
    color: 'from-red-600 to-purple-600',
    icon: '🔎',
    difficulty: 'advanced',
    xp: 1500,
    estimatedTime: '6h 15min',
  },
  {
    id: 'appsec-developer',
    title: 'Développeur AppSec',
    description: 'Intégrez la sécurité au cœur de votre processus de développement d\'applications',
    modules: ['web-application-security', 'ethical-hacking'],
    progress: 0,
    color: 'from-purple-600 to-pink-600',
    icon: '👨‍💻',
    difficulty: 'intermediate',
    xp: 1200,
    estimatedTime: '5h 20min',
  },
  {
    id: 'security-analyst',
    title: 'Analyste SOC',
    description: 'Surveillez, détectez et répondez aux alertes de sécurité en temps réel',
    modules: ['cybersecurity-intro', 'threat-landscape', 'incident-response'],
    progress: 20,
    color: 'from-orange-600 to-yellow-600',
    icon: '📊',
    difficulty: 'advanced',
    xp: 1300,
    estimatedTime: '5h 45min',
  }
];

interface SimulationExercise {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  duration: string;
  xp: number;
  image: string;
  unlocked: boolean;
}

// Données factices pour les exercices de simulation
const simulationExercises: SimulationExercise[] = [
  {
    id: 'phishing-simulation',
    title: 'Simulation de phishing',
    description: 'Apprenez à reconnaître et à répondre aux tentatives de phishing sophistiquées',
    difficulty: 'beginner',
    category: 'Défense',
    duration: '30 min',
    xp: 120,
    image: 'https://picsum.photos/seed/phishing/300/200',
    unlocked: true
  },
  {
    id: 'ransomware-incident',
    title: 'Incident de ransomware',
    description: 'Gérez une attaque de ransomware en cours et restaurez les systèmes essentiels',
    difficulty: 'intermediate',
    category: 'Réponse',
    duration: '45 min',
    xp: 220,
    image: 'https://picsum.photos/seed/ransomware/300/200',
    unlocked: true
  },
  {
    id: 'data-breach-analysis',
    title: 'Analyse d\'une fuite de données',
    description: 'Analysez l\'ampleur d\'une fuite de données et établissez un plan de remédiation',
    difficulty: 'advanced',
    category: 'Forensics',
    duration: '60 min',
    xp: 300,
    image: 'https://picsum.photos/seed/databreach/300/200',
    unlocked: false
  }
];

// Composant pour la carte module
const ModuleCard = ({ module }: { module: LearningModule }) => {
  const { themeMode } = useTheme();
  const isFuturistic = themeMode === 'futuristic';
  const [isHover, setIsHover] = useState(false);
  const [, setLocation] = useLocation();
  
  const handleModuleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (module.unlocked) {
      // Naviguer vers la page du module
      setLocation(`/playground/module?id=${module.id}`);
      console.log(`Navigation vers /playground/module?id=${module.id}`);
    }
  };
  
  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'defense':
        return <Shield className="h-4 w-4" />;
      case 'offense':
        return <ArrowUpRight className="h-4 w-4" />;
      case 'analysis':
        return <Terminal className="h-4 w-4" />;
      case 'fundamentals':
        return <BookOpen className="h-4 w-4" />;
      default:
        return <Code className="h-4 w-4" />;
    }
  };
  
  return (
    <div onClick={handleModuleClick}>
      <motion.div 
        className={`relative ${isFuturistic ? 
          'bg-gradient-to-br from-gray-900 via-gray-800 to-blue-950 border border-blue-500/30' :
          'bg-white border border-gray-200'} 
          rounded-xl p-5 h-full cursor-pointer overflow-hidden flex flex-col`}
        whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)' }}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
      >
        {/* Toile de fond interactive */}
        {isFuturistic && (
          <div className="absolute inset-0 overflow-hidden">
            <div className="grid grid-cols-8 grid-rows-8 h-full opacity-10">
              {Array.from({ length: 64 }).map((_, i) => (
                <div 
                  key={i} 
                  className={`border border-blue-500/10 transition-colors duration-500 
                    ${isHover && Math.random() > 0.7 ? 'bg-blue-500/20' : ''}`}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Bandeau supérieur avec XP et temps estimé */}
        <div className="flex justify-between items-center mb-3 z-10">
          <div className={`px-2 py-1 rounded-full text-xs flex items-center ${
            isFuturistic ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-800'
          }`}>
            <Clock className="h-3 w-3 mr-1" />
            {module.estimatedTime}
          </div>
          <div className={`px-2 py-1 rounded-full text-xs flex items-center ${
            isFuturistic ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-800'
          }`}>
            <Sparkles className="h-3 w-3 mr-1" />
            {module.xp} XP
          </div>
        </div>
        
        {/* Badge de difficulté */}
        <div className={`absolute top-3 right-3 text-xs flex items-center px-1.5 py-0.5 gap-1 rounded-sm ${
          module.difficulty === 'beginner' 
            ? isFuturistic ? 'bg-green-900/60 text-green-300 border border-green-700/50' : 'bg-green-100 text-green-800'
            : module.difficulty === 'intermediate'
              ? isFuturistic ? 'bg-yellow-900/60 text-yellow-300 border border-yellow-700/50' : 'bg-yellow-100 text-yellow-800'
              : isFuturistic ? 'bg-red-900/60 text-red-300 border border-red-700/50' : 'bg-red-100 text-red-800'
        }`}>
          {module.difficulty === 'beginner' 
            ? <>
                <Star className="h-3 w-3" />
              </>
            : module.difficulty === 'intermediate' 
              ? <>
                  <Star className="h-3 w-3" />
                  <Star className="h-3 w-3" />
                </>
              : <>
                  <Star className="h-3 w-3" />
                  <Star className="h-3 w-3" />
                  <Star className="h-3 w-3" />
                </>
          }
        </div>
        
        {/* Icône et titre du module */}
        <div className="flex items-center mb-2 z-10">
          <div className={`text-2xl mr-3 ${isHover ? 'scale-110 transition-transform' : ''}`}>{module.icon}</div>
          <div className="flex-1">
            <h3 className={`text-lg font-bold ${isFuturistic ? 'text-white' : 'text-gray-800'}`}>
              {module.title}
            </h3>
            <div className="flex items-center">
              <Badge variant="outline" className={`mr-1.5 flex items-center gap-1 ${isFuturistic ? 'border-gray-700 text-gray-400' : 'text-gray-600'}`}>
                {getCategoryIcon(module.category)}
                {module.category.charAt(0).toUpperCase() + module.category.slice(1)}
              </Badge>
            </div>
          </div>
        </div>
        
        {/* Description du module */}
        <p className={`text-sm mb-4 line-clamp-2 z-10 ${isFuturistic ? 'text-gray-300' : 'text-gray-600'}`}>
          {module.description}
        </p>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3 z-10">
          {module.tags.slice(0, 3).map((tag, i) => (
            <Badge key={i} variant="secondary" className={isFuturistic ? 'bg-gray-800 text-gray-300' : ''}>
              {tag}
            </Badge>
          ))}
        </div>
        
        {/* Progression et statut */}
        <div className="mt-auto z-10">
          {module.completed ? (
            <div className={`flex items-center ${isFuturistic ? 'text-green-400' : 'text-green-600'}`}>
              <CheckCircle className="h-4 w-4 mr-1.5" />
              <span className="text-sm font-medium">Module terminé</span>
            </div>
          ) : !module.unlocked ? (
            <div className={`flex items-center ${isFuturistic ? 'text-gray-500' : 'text-gray-400'}`}>
              <Lock className="h-4 w-4 mr-1.5" />
              <span className="text-sm font-medium">Module verrouillé</span>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className={`${isFuturistic ? 'text-gray-400' : 'text-gray-500'}`}>Progression</span>
                <span className={`${isFuturistic ? 'text-blue-400' : 'text-blue-600'}`}>{module.progress}%</span>
              </div>
              <Progress value={module.progress} className={`h-1.5 mb-2 ${isFuturistic ? 'bg-gray-800' : 'bg-gray-200'}`} />
              <Button 
                className={`w-full ${module.unlocked ? 
                  `${isFuturistic ? 
                    'bg-gradient-to-r from-blue-600 to-blue-700 border border-blue-400/20 hover:from-blue-500 hover:to-blue-600' : 
                    'bg-gradient-to-r from-blue-600 to-blue-700'} text-white` : 
                  isFuturistic ? 'bg-gray-800 text-gray-400' : 'bg-gray-200 text-gray-500'} 
                  h-9 text-sm relative overflow-hidden z-10`}
                disabled={!module.unlocked}
              >
                <span className="relative z-10 flex items-center justify-center">
                  {module.progress > 0 ? 'Continuer' : 'Commencer'}
                  {module.unlocked && <ArrowRight className={`ml-1.5 w-4 h-4 transition-transform ${isHover ? 'translate-x-1' : ''}`} />}
                </span>
                
                {/* Effet de survol uniquement pour les modules débloqués */}
                {module.unlocked && isFuturistic && (
                  <span className="absolute inset-0 w-0 bg-white/10 group-hover:w-full transition-all duration-700 ease-out"></span>
                )}
              </Button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// Composant pour la carte chemin d'apprentissage
const LearningPathCard = ({ path }: { path: LearningPath }) => {
  const { themeMode } = useTheme();
  const isFuturistic = themeMode === 'futuristic';
  
  return (
    <motion.div 
      className={`${isFuturistic ? 
        'bg-gradient-to-br from-gray-900 via-gray-800 to-blue-950 border border-blue-500/20' :
        'bg-white border border-gray-200'} 
        rounded-xl overflow-hidden relative`}
      whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)' }}
    >
      {/* Bannière colorée */}
      <div className={`h-2.5 bg-gradient-to-r ${path.color}`}></div>
      
      {/* Contenu */}
      <div className="p-5">
        <div className="flex items-center mb-2">
          <div className="text-2xl mr-3">{path.icon}</div>
          <div>
            <h3 className={`text-xl font-semibold ${isFuturistic ? 'text-white' : 'text-gray-800'}`}>
              {path.title}
            </h3>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`${
                path.difficulty === 'beginner' 
                  ? isFuturistic ? 'border-green-700 text-green-300' : 'border-green-200 text-green-700'
                  : path.difficulty === 'intermediate' 
                    ? isFuturistic ? 'border-yellow-700 text-yellow-300' : 'border-yellow-200 text-yellow-700'
                    : isFuturistic ? 'border-red-700 text-red-300' : 'border-red-200 text-red-700'
              }`}>
                {path.difficulty === 'beginner' ? 'Débutant' : 
                 path.difficulty === 'intermediate' ? 'Intermédiaire' : 'Avancé'}
              </Badge>
              <div className={`px-2 py-0.5 rounded-full text-xs flex items-center ${
                isFuturistic ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-800'
              }`}>
                {path.xp} XP
              </div>
            </div>
          </div>
        </div>
        
        <p className={`text-sm mb-4 ${isFuturistic ? 'text-gray-300' : 'text-gray-600'}`}>
          {path.description}
        </p>
        
        <div className="flex items-center mb-4">
          <Clock className={`h-4 w-4 mr-1.5 ${isFuturistic ? 'text-gray-400' : 'text-gray-500'}`} />
          <span className={`text-sm ${isFuturistic ? 'text-gray-400' : 'text-gray-500'}`}>{path.estimatedTime}</span>
        </div>
        
        {/* Progression */}
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1">
            <span className={`${isFuturistic ? 'text-gray-400' : 'text-gray-500'}`}>Progression</span>
            <span className={`${isFuturistic ? 'text-blue-400' : 'text-blue-600'}`}>{path.progress}%</span>
          </div>
          <Progress value={path.progress} className={`h-2 ${isFuturistic ? 'bg-gray-800' : 'bg-gray-200'}`} />
        </div>
        
        {/* Modules inclus */}
        <div className="mb-4">
          <p className={`text-sm font-medium mb-2 ${isFuturistic ? 'text-gray-300' : 'text-gray-700'}`}>
            Modules inclus:
          </p>
          <div className="space-y-1.5">
            {path.modules.slice(0, 3).map((moduleId, index) => {
              const module = mockLearningModules.find(m => m.id === moduleId);
              return module ? (
                <div key={index} className="flex items-center text-sm">
                  <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-full mr-2 text-xs">
                    {module.icon}
                  </div>
                  <span className={isFuturistic ? 'text-gray-300' : 'text-gray-700'}>
                    {module.title}
                  </span>
                </div>
              ) : null;
            })}
            {path.modules.length > 3 && (
              <div className={`text-sm ${isFuturistic ? 'text-gray-400' : 'text-gray-500'}`}>
                + {path.modules.length - 3} autres modules
              </div>
            )}
          </div>
        </div>
        
        {/* Bouton Explorer */}
        <Button
          className={`w-full mt-2 ${isFuturistic ? 
            `bg-gradient-to-r ${path.color} border border-white/10` : 
            `bg-gradient-to-r ${path.color}`} text-white`}
          onClick={() => {}}
        >
          Explorer ce parcours
          <ArrowRight className="ml-1.5 w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
};

// Composant pour les cartes de simulation
const SimulationCard = ({ simulation }: { simulation: SimulationExercise }) => {
  const { themeMode } = useTheme();
  const isFuturistic = themeMode === 'futuristic';
  const { toast } = useToast();
  
  return (
    <motion.div 
      className={`rounded-xl overflow-hidden ${
        simulation.unlocked 
          ? '' 
          : 'opacity-70 grayscale'
      }`}
      whileHover={simulation.unlocked ? { y: -5, boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)' } : {}}
    >
      {/* Image de couverture */}
      <div className="relative h-40 overflow-hidden">
        <div className={`absolute inset-0 ${!simulation.unlocked && isFuturistic ? 'bg-black/60' : !simulation.unlocked ? 'bg-gray-200/60' : ''} z-10`} />
        
        {/* Superposition futuriste */}
        {isFuturistic && (
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 to-transparent z-0"></div>
        )}
        
        {!simulation.unlocked && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <Lock className={`h-8 w-8 ${isFuturistic ? 'text-white' : 'text-gray-700'}`} />
          </div>
        )}
        
        <img 
          src={simulation.image} 
          alt={simulation.title} 
          className="object-cover w-full h-full"
        />
        
        {/* Badge de difficulté */}
        <div className={`absolute top-2 right-2 text-xs px-2 py-1 rounded-full z-20 ${
          simulation.difficulty === 'beginner' 
            ? isFuturistic ? 'bg-green-900/80 text-green-100' : 'bg-green-100 text-green-800'
            : simulation.difficulty === 'intermediate'
              ? isFuturistic ? 'bg-yellow-900/80 text-yellow-100' : 'bg-yellow-100 text-yellow-800'
              : isFuturistic ? 'bg-red-900/80 text-red-100' : 'bg-red-100 text-red-800'
        }`}>
          {simulation.difficulty === 'beginner' ? 'Débutant' : 
           simulation.difficulty === 'intermediate' ? 'Intermédiaire' : 'Avancé'}
        </div>
        
        {/* Badge de catégorie */}
        <div className={`absolute bottom-2 left-2 text-xs px-2 py-1 rounded-full z-20 ${
          isFuturistic ? 'bg-blue-900/80 text-blue-100' : 'bg-blue-100 text-blue-800'
        }`}>
          {simulation.category}
        </div>
      </div>
      
      {/* Contenu */}
      <div className={`p-4 ${
        isFuturistic 
          ? 'bg-gradient-to-b from-gray-900 to-gray-950 border-x border-b border-blue-500/20' 
          : 'bg-white border-x border-b border-gray-200'
      }`}>
        <h3 className={`text-lg font-bold mb-2 ${isFuturistic ? 'text-white' : 'text-gray-800'}`}>
          {simulation.title}
        </h3>
        
        <p className={`text-sm mb-4 line-clamp-2 ${isFuturistic ? 'text-gray-300' : 'text-gray-600'}`}>
          {simulation.description}
        </p>
        
        <div className="flex justify-between items-center mb-4">
          <div className={`flex items-center ${isFuturistic ? 'text-gray-400' : 'text-gray-500'}`}>
            <Clock className="h-4 w-4 mr-1" />
            <span className="text-xs">{simulation.duration}</span>
          </div>
          <div className={`flex items-center ${isFuturistic ? 'text-purple-400' : 'text-purple-600'}`}>
            <Sparkles className="h-4 w-4 mr-1" />
            <span className="text-xs">{simulation.xp} XP</span>
          </div>
        </div>
        
        <Button 
          className={`w-full ${
            simulation.unlocked
              ? isFuturistic
                ? 'bg-blue-700 hover:bg-blue-600 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
              : isFuturistic
                ? 'bg-gray-800 text-gray-500'
                : 'bg-gray-200 text-gray-500'
          }`}
          disabled={!simulation.unlocked}
          onClick={() => {
            if (simulation.unlocked) {
              // Lancer la simulation
            } else {
              toast({
                title: "Simulation verrouillée",
                description: "Complétez d'abord les modules de base pour débloquer cette simulation.",
              });
            }
          }}
        >
          {simulation.unlocked ? 'Démarrer la simulation' : 'Verrouillé'}
        </Button>
      </div>
    </motion.div>
  );
};

// Composant principal pour le Playground
export default function Playground() {
  const { themeMode } = useTheme();
  const isFuturistic = themeMode === 'futuristic';
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('modules');

  // Dans une implémentation réelle, récupérer ces données depuis l'API
  const [modules, setModules] = useState<LearningModule[]>(mockLearningModules);
  const [paths, setPaths] = useState(learningPaths);
  const [simulations, setSimulations] = useState(simulationExercises);
  
  // Animation pour les éléments de la page
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1 
      } 
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className={`min-h-screen ${isFuturistic ? 'bg-gradient-to-b from-gray-950 to-blue-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header avec navigation */}
      <header className={`${isFuturistic ? 'bg-gray-900/80 backdrop-blur-md border-b border-blue-900/50' : 'bg-white shadow-sm'} sticky top-0 z-30`}>
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className={isFuturistic ? 'text-white' : 'text-gray-700'} />
              </Button>
            </Link>
            <h1 className={`text-xl font-bold ${isFuturistic ? 'text-white' : 'text-gray-800'}`}>
              Cyber Playground
            </h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <Trophy className={isFuturistic ? 'text-white' : 'text-gray-700'} />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className={isFuturistic ? 'text-white' : 'text-gray-700'} />
            </Button>
          </div>
        </div>
      </header>
      
      {/* Conteneur principal */}
      <main className="container mx-auto px-4 py-6">
        {/* Onglets de navigation */}
        <div className="flex mb-6 border-b border-gray-700/30">
          <button 
            className={`px-4 py-2 font-medium text-sm relative ${
              activeTab === 'modules' 
                ? isFuturistic ? 'text-blue-400' : 'text-blue-600' 
                : isFuturistic ? 'text-gray-400' : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('modules')}
          >
            Modules
            {activeTab === 'modules' && (
              <motion.div 
                className={`absolute bottom-0 left-0 w-full h-0.5 ${isFuturistic ? 'bg-blue-500' : 'bg-blue-600'}`}
                layoutId="activeTab"
              />
            )}
          </button>
          <button 
            className={`px-4 py-2 font-medium text-sm relative ${
              activeTab === 'paths' 
                ? isFuturistic ? 'text-blue-400' : 'text-blue-600' 
                : isFuturistic ? 'text-gray-400' : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('paths')}
          >
            Parcours d'apprentissage
            {activeTab === 'paths' && (
              <motion.div 
                className={`absolute bottom-0 left-0 w-full h-0.5 ${isFuturistic ? 'bg-blue-500' : 'bg-blue-600'}`}
                layoutId="activeTab"
              />
            )}
          </button>
          <button 
            className={`px-4 py-2 font-medium text-sm relative ${
              activeTab === 'simulations' 
                ? isFuturistic ? 'text-blue-400' : 'text-blue-600' 
                : isFuturistic ? 'text-gray-400' : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('simulations')}
          >
            Simulations IA
            {activeTab === 'simulations' && (
              <motion.div 
                className={`absolute bottom-0 left-0 w-full h-0.5 ${isFuturistic ? 'bg-blue-500' : 'bg-blue-600'}`}
                layoutId="activeTab"
              />
            )}
          </button>
        </div>
        
        {/* Contenu des onglets */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'modules' && (
            <>
              <h2 className={`text-2xl font-bold mb-2 ${isFuturistic ? 'text-blue-300' : 'text-blue-700'}`}>
                Modules d'apprentissage
              </h2>
              <p className={`mb-6 ${isFuturistic ? 'text-gray-300' : 'text-gray-600'}`}>
                Ces modules interactifs vous permettent d'apprendre les concepts de cybersécurité à votre rythme.
              </p>
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {modules.map((module) => (
                  <motion.div key={module.id} variants={itemVariants}>
                    <ModuleCard module={module} />
                  </motion.div>
                ))}
              </motion.div>
            </>
          )}
          
          {activeTab === 'paths' && (
            <>
              <h2 className={`text-2xl font-bold mb-2 ${isFuturistic ? 'text-blue-300' : 'text-blue-700'}`}>
                Parcours d'apprentissage
              </h2>
              <p className={`mb-6 ${isFuturistic ? 'text-gray-300' : 'text-gray-600'}`}>
                Suivez ces parcours structurés pour maîtriser différents domaines de la cybersécurité.
              </p>
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {paths.map((path) => (
                  <motion.div key={path.id} variants={itemVariants}>
                    <LearningPathCard path={path} />
                  </motion.div>
                ))}
              </motion.div>
            </>
          )}
          
          {activeTab === 'simulations' && (
            <>
              <h2 className={`text-2xl font-bold mb-2 ${isFuturistic ? 'text-blue-300' : 'text-blue-700'}`}>
                Simulations assistées par IA
              </h2>
              <p className={`mb-6 ${isFuturistic ? 'text-gray-300' : 'text-gray-600'}`}>
                Mettez vos compétences à l'épreuve avec ces simulations interactives basées sur des scénarios réels.
              </p>
              
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {simulations.map((simulation) => (
                  <motion.div key={simulation.id} variants={itemVariants}>
                    <SimulationCard simulation={simulation} />
                  </motion.div>
                ))}
              </motion.div>
            </>
          )}
        </motion.div>
      </main>
    </div>
  );
}