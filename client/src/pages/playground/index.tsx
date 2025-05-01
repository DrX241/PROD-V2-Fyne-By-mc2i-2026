import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowLeft, Settings, CheckCircle, Trophy, Play, ArrowRight, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/contexts/ThemeContext';
import axios from 'axios';

// Types pour les modules d'apprentissage
interface LearningStep {
  id: string;
  title: string;
  type: 'theory' | 'practice' | 'challenge' | 'quiz';
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
  steps: LearningStep[];
  unlocked: boolean;
  completed: boolean;
  progress: number;
  icon: string;
  color: string;
}

// Données des parcours d'apprentissage
const learningPaths = [
  {
    id: 'fundamentals',
    title: 'Fondamentaux de la Cybersécurité',
    description: 'Les concepts essentiels pour comprendre la cybersécurité moderne',
    modules: ['cybersecurity-intro', 'threat-landscape', 'security-principles'],
    progress: 0,
    color: 'from-blue-500 to-blue-700',
  },
  {
    id: 'pentest',
    title: 'Test d\'Intrusion Éthique',
    description: 'Apprenez à identifier et exploiter des vulnérabilités comme un hacker éthique',
    modules: ['recon-techniques', 'vulnerability-scanning', 'exploit-basics'],
    progress: 0,
    color: 'from-red-500 to-red-700',
  },
  {
    id: 'defense',
    title: 'Défense en Profondeur',
    description: 'Stratégies et techniques pour protéger efficacement vos systèmes',
    modules: ['network-defense', 'endpoint-protection', 'incident-response'],
    progress: 0,
    color: 'from-green-500 to-green-700',
  },
  {
    id: 'coding-security',
    title: 'Sécurité du Code',
    description: 'Bonnes pratiques pour développer des applications sécurisées',
    modules: ['secure-coding', 'webapp-security', 'api-security'],
    progress: 0,
    color: 'from-purple-500 to-purple-700',
  },
];

// Modules d'apprentissage factices (à remplacer par un appel API)
const mockLearningModules: LearningModule[] = [
  {
    id: 'cybersecurity-intro',
    title: 'Introduction à la Cybersécurité',
    description: 'Comprendre les fondamentaux de la cybersécurité',
    difficulty: 'beginner',
    steps: [
      {
        id: 'what-is-cybersecurity',
        title: 'Qu\'est-ce que la cybersécurité?',
        type: 'theory',
        content: 'La cybersécurité est l\'ensemble des technologies et processus conçus pour protéger les systèmes, réseaux et programmes des attaques numériques.'
      },
      {
        id: 'threat-actors',
        title: 'Acteurs malveillants',
        type: 'theory',
        content: 'Les menaces peuvent provenir de différents types d\'acteurs: cybercriminels, hacktivistes, acteurs étatiques, et initiés malveillants.'
      },
      {
        id: 'security-triad',
        title: 'La triade CIA',
        type: 'practice',
        content: 'La triade CIA est un modèle de sécurité qui se concentre sur trois aspects clés. Pouvez-vous les identifier?',
        codeExample: '// Complétez les trois piliers de la sécurité\nconst securityPillars = [\n  "Confidentialité",\n  "???",\n  "???"\n];',
        solution: 'const securityPillars = [\n  "Confidentialité",\n  "Intégrité",\n  "Disponibilité"\n];'
      },
      {
        id: 'security-quiz',
        title: 'Quiz de base',
        type: 'quiz',
        content: 'Lequel des éléments suivants n\'est PAS un type courant de cyberattaque?',
        options: ['Attaque par déni de service', 'Phishing', 'Injection SQL', 'Compression quantique'],
        correctAnswer: 'Compression quantique'
      }
    ],
    unlocked: true,
    completed: false,
    progress: 25,
    icon: '🔐',
    color: 'blue',
  },
  {
    id: 'threat-landscape',
    title: 'Paysage des Menaces',
    description: 'Comprendre les différentes menaces cybernétiques actuelles',
    difficulty: 'beginner',
    steps: [
      {
        id: 'common-threats',
        title: 'Menaces courantes',
        type: 'theory',
        content: 'Les menaces cybernétiques les plus répandues incluent les malwares, le phishing, les attaques par force brute, et les rançongiciels.'
      }
    ],
    unlocked: true,
    completed: false,
    progress: 0,
    icon: '🌐',
    color: 'red',
  },
  {
    id: 'security-principles',
    title: 'Principes de Sécurité',
    description: 'Les principes fondamentaux qui régissent la sécurité des systèmes',
    difficulty: 'beginner',
    steps: [],
    unlocked: false,
    completed: false,
    progress: 0,
    icon: '📋',
    color: 'green',
  },
  {
    id: 'recon-techniques',
    title: 'Techniques de Reconnaissance',
    description: 'Méthodes pour collecter des informations sur une cible',
    difficulty: 'intermediate',
    steps: [],
    unlocked: false,
    completed: false,
    progress: 0,
    icon: '🔍',
    color: 'orange',
  },
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
  
  return (
    <div onClick={handleModuleClick}>
      <motion.div 
        className={`${isFuturistic ? 
          'bg-gradient-to-br from-gray-900 to-blue-950 border border-blue-500/30' :
          'bg-white border border-gray-200'} 
          rounded-xl p-5 h-full cursor-pointer relative overflow-hidden flex flex-col`}
        whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)' }}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
      >
        {/* Badge de difficulté */}
        <div className={`absolute top-3 right-3 text-xs px-2 py-1 rounded-full ${
          module.difficulty === 'beginner' 
            ? isFuturistic ? 'bg-green-800/70 text-green-100' : 'bg-green-100 text-green-800'
            : module.difficulty === 'intermediate'
              ? isFuturistic ? 'bg-yellow-800/70 text-yellow-100' : 'bg-yellow-100 text-yellow-800'
              : isFuturistic ? 'bg-red-800/70 text-red-100' : 'bg-red-100 text-red-800'
        }`}>
          {module.difficulty === 'beginner' ? 'Débutant' : 
           module.difficulty === 'intermediate' ? 'Intermédiaire' : 'Avancé'}
        </div>
        
        {/* Status et progression */}
        <div className="flex items-center mb-4">
          <div className={`text-2xl mr-3`}>{module.icon}</div>
          {module.completed ? (
            <CheckCircle className={`${isFuturistic ? 'text-green-400' : 'text-green-500'}`} />
          ) : !module.unlocked ? (
            <Lock className={`${isFuturistic ? 'text-gray-500' : 'text-gray-400'}`} />
          ) : (
            <div className="flex-1">
              <div className="flex justify-between text-xs mb-1">
                <span className={`${isFuturistic ? 'text-gray-400' : 'text-gray-500'}`}>Progression</span>
                <span className={`${isFuturistic ? 'text-blue-400' : 'text-blue-600'}`}>{module.progress}%</span>
              </div>
              <Progress value={module.progress} className={`h-1.5 ${isFuturistic ? 'bg-gray-800' : 'bg-gray-200'}`} />
            </div>
          )}
        </div>
        
        {/* Titre et description */}
        <h3 className={`text-lg font-semibold mb-2 ${isFuturistic ? 'text-white' : 'text-gray-800'}`}>
          {module.title}
        </h3>
        <p className={`text-sm mb-4 ${isFuturistic ? 'text-gray-300' : 'text-gray-600'}`}>
          {module.description}
        </p>
        
        {/* Bouton pour continuer ou commencer */}
        <div className="mt-auto">
          <Button 
            className={`w-full ${module.unlocked ? 
              `bg-gradient-to-r ${module.color === 'blue' ? 'from-blue-600 to-blue-700' : 
                                module.color === 'red' ? 'from-red-600 to-red-700' : 
                                module.color === 'green' ? 'from-green-600 to-green-700' : 
                                'from-purple-600 to-purple-700'} text-white` : 
              isFuturistic ? 'bg-gray-800 text-gray-400' : 'bg-gray-200 text-gray-500'} 
              h-9 text-sm relative overflow-hidden`}
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
        </div>
      </motion.div>
    </div>
  );
};

// Composant pour la carte chemin d'apprentissage
const LearningPathCard = ({ path }: { path: any }) => {
  const { themeMode } = useTheme();
  const isFuturistic = themeMode === 'futuristic';
  
  return (
    <motion.div 
      className={`${isFuturistic ? 
        'bg-gradient-to-br from-gray-900 to-blue-950 border border-blue-500/20' :
        'bg-white border border-gray-200'} 
        rounded-xl overflow-hidden`}
      whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)' }}
    >
      {/* Bannière colorée */}
      <div className={`h-3 bg-gradient-to-r ${path.color}`}></div>
      
      {/* Contenu */}
      <div className="p-5">
        <h3 className={`text-xl font-semibold mb-2 ${isFuturistic ? 'text-white' : 'text-gray-800'}`}>
          {path.title}
        </h3>
        <p className={`text-sm mb-4 ${isFuturistic ? 'text-gray-300' : 'text-gray-600'}`}>
          {path.description}
        </p>
        
        {/* Progression */}
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1">
            <span className={`${isFuturistic ? 'text-gray-400' : 'text-gray-500'}`}>Progression</span>
            <span className={`${isFuturistic ? 'text-blue-400' : 'text-blue-600'}`}>{path.progress}%</span>
          </div>
          <Progress value={path.progress} className={`h-2 ${isFuturistic ? 'bg-gray-800' : 'bg-gray-200'}`} />
        </div>
        
        {/* Bouton Explorer */}
        <Link href={`/playground/path/${path.id}`}>
          <Button 
            className={`w-full ${isFuturistic ? 
              `bg-gradient-to-r ${path.color} text-white` : 
              `bg-gradient-to-r ${path.color} text-white`}`}
          >
            Explorer ce parcours
          </Button>
        </Link>
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
      <header className={`${isFuturistic ? 'bg-gray-900/70 backdrop-blur-md border-b border-blue-900/50' : 'bg-white shadow-sm'} sticky top-0 z-30`}>
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
              <h2 className={`text-2xl font-bold mb-4 ${isFuturistic ? 'text-blue-300' : 'text-blue-700'}`}>
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
              <h2 className={`text-2xl font-bold mb-4 ${isFuturistic ? 'text-blue-300' : 'text-blue-700'}`}>
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
              <h2 className={`text-2xl font-bold mb-4 ${isFuturistic ? 'text-blue-300' : 'text-blue-700'}`}>
                Simulations assistées par IA
              </h2>
              <p className={`mb-6 ${isFuturistic ? 'text-gray-300' : 'text-gray-600'}`}>
                Mettez vos compétences à l'épreuve avec ces simulations interactives basées sur des scénarios réels.
              </p>
              
              <div className={`p-12 rounded-xl mb-6 text-center ${isFuturistic ? 'bg-blue-950/40 border border-blue-500/30' : 'bg-blue-50 border border-blue-100'}`}>
                <h3 className={`text-xl font-bold mb-4 ${isFuturistic ? 'text-blue-300' : 'text-blue-700'}`}>
                  Fonctionnalité à venir
                </h3>
                <p className={`mb-6 ${isFuturistic ? 'text-gray-300' : 'text-gray-600'}`}>
                  Les simulations assistées par IA sont en cours de développement et seront bientôt disponibles.
                </p>
                <Button
                  className={`${isFuturistic ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                  onClick={() => {
                    toast({
                      title: "Bientôt disponible!",
                      description: "Les simulations avancées assistées par IA seront disponibles dans la prochaine mise à jour.",
                    })
                  }}
                >
                  Être notifié à la sortie
                </Button>
              </div>
            </>
          )}
        </motion.div>
      </main>
    </div>
  );
}