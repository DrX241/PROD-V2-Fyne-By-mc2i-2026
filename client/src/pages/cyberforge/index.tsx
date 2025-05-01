import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  ArrowLeft, BookOpen, Shield, Terminal, Lightbulb, Settings, MessageCircle, 
  ChevronRight, Star, LockIcon, CheckCircle, ExternalLink, User, AlertTriangle,
  Server, Database, Globe, Wifi, Lock, UserX, Zap, FileCode, Fingerprint, BrainCircuit,
  Eye, Monitor, Cpu, Cable, FileWarning, ShieldAlert, Key, PlayCircle, Clock8,
  Circle, Info, X, Layers, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { useToast } from '../../hooks/use-toast';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Separator } from '../../components/ui/separator';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogHeader } from '../../components/ui/dialog';
import { Avatar as UIAvatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Label } from '../../components/ui/label';

// Interfaces nécessaires pour le SAS d'entrée
interface ModuleProgress {
  completed: boolean;
  progress: number;
  lastAccessed?: Date;
}

interface Avatar {
  id: string;
  name: string;
  imagePath: string;
  type: 'hacker' | 'analyst' | 'security_manager' | 'network_specialist';
  abilities: string[];
  description: string;
  strengthsAndWeaknesses: string[];
  primarySkills: string[];
}

interface UserData {
  name: string;
  totalProgress: number;
  moduleProgress: Record<string, ModuleProgress>;
  isAdmin: boolean;
  rank?: string;
  level?: number;
  points?: number;
  avatar?: Avatar;
}

interface AIRecommendation {
  title: string;
  message: string;
  moduleId: string;
  type: 'continue' | 'revisit' | 'new';
}

interface SimulationScenario {
  id: string;
  title: string;
  description: string;
  difficulty: 'débutant' | 'intermédiaire' | 'avancé' | 'expert';
  duration: string;
  objectives: string[];
  completionReward: number; // Points de compétence
  icon: React.ReactNode;
}

// Données des avatars
const avatars: Avatar[] = [
  {
    id: 'shadow',
    name: 'Shadow',
    imagePath: '/assets/avatars/shadow.png',
    type: 'hacker',
    abilities: ['Infiltration', 'Exploitation', 'Anonymat'],
    description: 'Expert en tests d\'intrusion et hacking éthique. Spécialisé dans la découverte de vulnérabilités et l\'exploitation de failles de sécurité pour améliorer les défenses.',
    strengthsAndWeaknesses: [
      'Excellent en découverte de vulnérabilités', 
      'Maîtrise des techniques d\'anonymisation',
      'Connaissances avancées en exploitation de systèmes',
      'Points faibles : analyse forensique, documentation'
    ],
    primarySkills: ['Exploitation', 'Rétro-ingénierie', 'Reconnaissance']
  },
  {
    id: 'sentinel',
    name: 'Sentinel',
    imagePath: '/assets/avatars/sentinel.png',
    type: 'security_manager',
    abilities: ['Supervision', 'Organisation', 'Stratégie'],
    description: 'Responsable de la stratégie de cybersécurité. Excellentes compétences en gestion d\'équipe, communication et planification des opérations de sécurité.',
    strengthsAndWeaknesses: [
      'Vision stratégique globale', 
      'Excellente communication',
      'Gestion efficace des crises',
      'Points faibles : aspects techniques avancés, programmation'
    ],
    primarySkills: ['Gestion des risques', 'Conformité', 'Communication']
  },
  {
    id: 'guardian',
    name: 'Guardian',
    imagePath: '/assets/avatars/guardian.png',
    type: 'analyst',
    abilities: ['Analyse', 'Protection', 'Détection'],
    description: 'Analyste de sécurité spécialisé dans la détection et la réponse aux incidents. Expert en investigation, analyse des malwares et protection des systèmes.',
    strengthsAndWeaknesses: [
      'Détection avancée des menaces', 
      'Analyse approfondie des incidents',
      'Excellentes compétences forensiques',
      'Points faibles : développement, tests d\'intrusions'
    ],
    primarySkills: ['Analyse d\'incidents', 'Forensique', 'Monitoring']
  },
  {
    id: 'nexus',
    name: 'Nexus',
    imagePath: '/assets/avatars/nexus.png',
    type: 'network_specialist',
    abilities: ['Connectivité', 'Topologie', 'Défense périmétrique'],
    description: 'Spécialiste en sécurité des réseaux et infrastructures. Expert en architecture sécurisée, segmentation et défense des communications.',
    strengthsAndWeaknesses: [
      'Maîtrise de la sécurité réseau', 
      'Expertise en conception d\'architecture',
      'Connaissance approfondie des protocoles',
      'Points faibles : applications web, social engineering'
    ],
    primarySkills: ['Architecture réseau', 'Défense périmétrique', 'Surveillance']
  }
];

// Modules disponibles dans CyberForge Academy
const modules = [
  {
    id: 'fundamentals',
    title: 'Fondamentaux de la Cybersécurité',
    description: 'Concepts de base, terminologie et principes essentiels.',
    progress: 0,
    level: 1,
    requiredModules: [],
    icon: <Shield className="h-5 w-5" />
  },
  {
    id: 'network-security',
    title: 'Sécurité des Réseaux',
    description: 'Protection des infrastructures réseau et détection d\'intrusion.',
    progress: 0,
    level: 2,
    requiredModules: ['fundamentals'],
    icon: <Wifi className="h-5 w-5" />
  },
  {
    id: 'web-security',
    title: 'Sécurité des Applications Web',
    description: 'Vulnérabilités web et méthodes de protection.',
    progress: 0,
    level: 2,
    requiredModules: ['fundamentals'],
    icon: <Globe className="h-5 w-5" />
  },
  {
    id: 'cryptography',
    title: 'Cryptographie & Authentification',
    description: 'Chiffrement, hachage et mécanismes d\'authentification.',
    progress: 0,
    level: 3,
    requiredModules: ['fundamentals', 'network-security'],
    icon: <Lock className="h-5 w-5" />
  },
  {
    id: 'social-engineering',
    title: 'Social Engineering',
    description: 'Techniques de manipulation et mesures préventives.',
    progress: 0,
    level: 2,
    requiredModules: ['fundamentals'],
    icon: <UserX className="h-5 w-5" />
  },
  {
    id: 'malware-analysis',
    title: 'Analyse de Malwares',
    description: 'Identification et analyse des logiciels malveillants.',
    progress: 0,
    level: 4,
    requiredModules: ['fundamentals', 'cryptography'],
    icon: <FileWarning className="h-5 w-5" />
  },
  {
    id: 'incident-response',
    title: 'Réponse aux Incidents',
    description: 'Processus de gestion et résolution des incidents de sécurité.',
    progress: 0,
    level: 3,
    requiredModules: ['fundamentals', 'network-security'],
    icon: <AlertTriangle className="h-5 w-5" />
  },
  {
    id: 'secure-coding',
    title: 'Développement Sécurisé',
    description: 'Pratiques de codage sécurisé et tests de pénétration.',
    progress: 0,
    level: 4,
    requiredModules: ['fundamentals', 'web-security'],
    icon: <FileCode className="h-5 w-5" />
  },
  {
    id: 'threat-intelligence',
    title: 'Cyber Threat Intelligence',
    description: 'Collecte et analyse des informations sur les menaces.',
    progress: 0,
    level: 3,
    requiredModules: ['fundamentals', 'incident-response'],
    icon: <BrainCircuit className="h-5 w-5" />
  }
];

function calculateTotalProgress(moduleProgress: Record<string, ModuleProgress>): number {
  const moduleCount = modules.length;
  let totalProgress = 0;
  
  for (const module of modules) {
    totalProgress += (moduleProgress[module.id]?.progress || 0);
  }
  
  return Math.round(totalProgress / moduleCount);
}

function CyberForge() {
  const { isDark } = useTheme();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // États du SAS d'entrée
  const [showEntryPortal, setShowEntryPortal] = useState(true);
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null);
  const [avatarCardOpen, setAvatarCardOpen] = useState<string | null>(null);
  const [entryStep, setEntryStep] = useState<'welcome' | 'avatar' | 'mission' | 'ready'>('welcome');
  
  // États pour le reste de l'interface
  const [userName, setUserName] = useState('');
  const [userData, setUserData] = useState<UserData>({
    name: '',
    totalProgress: 0,
    moduleProgress: {},
    isAdmin: false
  });

  // Effet pour simuler le chargement des données utilisateur
  useEffect(() => {
    const savedUser = localStorage.getItem('cyberforge_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUserData(parsedUser);
      setUserName(parsedUser.name);
    }
  }, []);

  // Sélectionner un avatar
  const selectAvatarProfile = (avatar: Avatar) => {
    setSelectedAvatar(avatar);
    // Simuler la progression
    if (entryStep === 'avatar') {
      setTimeout(() => {
        setEntryStep('mission');
      }, 500);
    }
  };

  // Passer à l'étape suivante dans le SAS d'entrée
  const proceedToNextStep = () => {
    if (entryStep === 'welcome') {
      setEntryStep('avatar');
    } else if (entryStep === 'mission') {
      setEntryStep('ready');
    } else if (entryStep === 'ready') {
      // Sauvegarder l'avatar sélectionné dans les données utilisateur
      if (selectedAvatar) {
        const updatedUserData = { 
          ...userData,
          avatar: selectedAvatar 
        };
        setUserData(updatedUserData);
        localStorage.setItem('cyberforge_user', JSON.stringify(updatedUserData));
      }
      // Passer à l'interface principale
      setShowEntryPortal(false);
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {showEntryPortal ? (
        // SAS d'entrée immersif
        <div className={`min-h-screen relative ${isDark ? 'bg-gray-950' : 'bg-gray-100'} overflow-hidden`}>
          {/* Effet de grille cyber */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/30 z-0"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA4MCAwIEwgMCAwIDAgODAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSg2MCwgOTAsIDIzMCwgMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIiAvPjwvc3ZnPg==')]  bg-center z-0 opacity-20"></div>
          
          {/* Conteneur principal centré */}
          <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col items-center justify-center relative z-10">
            {/* Logo CyberForge Academy */}
            <div className={`mb-10 text-center ${entryStep !== 'welcome' ? 'absolute top-4 left-1/2 transform -translate-x-1/2' : ''}`}>
              <h1 className={`text-4xl sm:text-5xl font-bold mb-2 font-mono tracking-tight transition-all duration-500 ${
  isDark 
    ? 'bg-gradient-to-r from-blue-400 to-indigo-400 text-transparent bg-clip-text' 
    : 'bg-gradient-to-r from-blue-700 to-indigo-800 text-transparent bg-clip-text'
} ${entryStep !== 'welcome' ? 'text-2xl' : ''}`}>
                CyberForge<span className={isDark ? 'text-blue-100' : 'text-blue-900'}>_</span>Academy
              </h1>
              {entryStep === 'welcome' && (
              <p className={`text-lg md:text-xl max-w-2xl mx-auto ${
                isDark ? 'text-blue-100' : 'text-blue-900'
              }`}>
                Centre d'entraînement virtuel pour l'élite des défenseurs cyber
              </p>
              )}
            </div>
            
            {/* Contenu par étape */}
            <AnimatePresence mode="wait">
              {entryStep === 'welcome' && (
                <motion.div 
                  key="welcome"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="w-full max-w-3xl"
                >
                  <Card className={`p-6 ${isDark ? 'bg-gray-800 border-blue-700' : 'bg-white border-blue-300'} backdrop-blur-sm border-2 rounded-lg shadow-xl`}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-2xl">
                        <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-600' : 'bg-blue-100'}`}>
                          <Shield className={`h-7 w-7 ${isDark ? 'text-white' : 'text-blue-800'}`} />
                        </div>
                        <span className={isDark ? 'text-white' : 'text-blue-950'}>
                          Bienvenue à CyberForge Academy
                        </span>
                      </CardTitle>
                      <CardDescription className={`text-base ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                        Votre parcours dans l'élite de la cybersécurité commence ici
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <p className={isDark ? 'text-white' : 'text-gray-800'}>
                        L'Académie CyberForge est un centre d'entraînement de haute technologie conçu pour former 
                        les experts en cybersécurité de demain. Ici, vous développerez vos compétences à travers 
                        des modules interactifs, des simulations tactiques et des défis de hacking éthique.
                      </p>
                      
                      <div className={`p-4 rounded-md ${isDark ? 'bg-blue-900 text-white' : 'bg-blue-100 text-blue-950'} flex items-start gap-3`}>
                        <Info className={`h-5 w-5 mt-0.5 flex-shrink-0 ${isDark ? 'text-blue-200' : 'text-blue-700'}`} />
                        <div>
                          <p className="font-medium">Votre progression est enregistrée</p>
                          <p className="text-sm opacity-90">Tous vos accomplissements, badges et niveaux sont sauvegardés automatiquement.</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                        <div className={`p-4 rounded-md ${isDark ? 'bg-gray-900' : 'bg-gray-100'} text-center`}>
                          <div className={`mx-auto mb-2 w-12 h-12 rounded-full ${isDark ? 'bg-yellow-600' : 'bg-yellow-500'} flex items-center justify-center`}>
                            <Lightbulb className={`h-6 w-6 ${isDark ? 'text-white' : 'text-white'}`} />
                          </div>
                          <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>9 Modules d'apprentissage</h3>
                          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Des fondamentaux à l'expertise avancée</p>
                        </div>
                        
                        <div className={`p-4 rounded-md ${isDark ? 'bg-gray-900' : 'bg-gray-100'} text-center`}>
                          <div className={`mx-auto mb-2 w-12 h-12 rounded-full ${isDark ? 'bg-green-600' : 'bg-green-600'} flex items-center justify-center`}>
                            <Terminal className="h-6 w-6 text-white" />
                          </div>
                          <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Laboratoires pratiques</h3>
                          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Environnements sécurisés pour pratiquer</p>
                        </div>
                        
                        <div className={`p-4 rounded-md ${isDark ? 'bg-gray-900' : 'bg-gray-100'} text-center`}>
                          <div className={`mx-auto mb-2 w-12 h-12 rounded-full ${isDark ? 'bg-red-600' : 'bg-red-600'} flex items-center justify-center`}>
                            <ShieldAlert className="h-6 w-6 text-white" />
                          </div>
                          <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Simulations d'attaques</h3>
                          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Scénarios réalistes et adaptatifs</p>
                        </div>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="flex justify-between pt-2">
                      <Button 
  variant="outline" 
  onClick={() => setLocation('/')}
  className={isDark ? 'border-gray-600 bg-transparent text-white hover:bg-gray-700' : 'border-gray-300 text-gray-800 hover:bg-gray-100'}
>
  <ArrowLeft className="h-4 w-4 mr-2" />
  Retour
</Button>

<Button 
  onClick={proceedToNextStep} 
  className={isDark 
    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
    : 'bg-blue-700 hover:bg-blue-800 text-white'
  }
>
  Commencer l'expérience
  <ChevronRight className="h-4 w-4 ml-2" />
</Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              )}

              {entryStep === 'avatar' && (
                <motion.div 
                  key="avatar"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="w-full max-w-4xl"
                >
                  <Card className={`p-6 ${isDark ? 'bg-gray-800 border-blue-700' : 'bg-white border-blue-300'} backdrop-blur-sm border-2 rounded-lg shadow-xl`}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-2xl">
                        <div className={`p-2 rounded-lg ${isDark ? 'bg-purple-600' : 'bg-purple-100'}`}>
                          <User className={`h-7 w-7 ${isDark ? 'text-white' : 'text-purple-800'}`} />
                        </div>
                        <span className={isDark ? 'text-white' : 'text-blue-950'}>
                          Sélectionnez votre personnage
                        </span>
                      </CardTitle>
                      <CardDescription className={`text-base ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                        Chaque profil possède des compétences et spécialités uniques
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {avatars.map((avatar) => (
                          <div key={avatar.id} className="relative">
                            <div 
                              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                selectedAvatar?.id === avatar.id 
                                  ? isDark 
                                    ? 'border-blue-500 bg-blue-900/30' 
                                    : 'border-blue-600 bg-blue-50' 
                                  : isDark 
                                    ? 'border-gray-600 hover:border-blue-500 bg-gray-900' 
                                    : 'border-gray-300 hover:border-blue-400 bg-gray-50'
                              }`}
                              onClick={() => selectAvatarProfile(avatar)}
                            >
                              <div className="flex items-center gap-4">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                                  selectedAvatar?.id === avatar.id
                                    ? isDark ? 'bg-blue-600' : 'bg-blue-500'
                                    : isDark ? 'bg-gray-700' : 'bg-gray-200'
                                }`}>
                                  <span className="text-2xl">{
                                    avatar.id === 'shadow' ? '👤' : 
                                    avatar.id === 'sentinel' ? '🔍' :
                                    avatar.id === 'guardian' ? '🛡️' : 
                                    '📡'
                                  }</span>
                                </div>
                                
                                <div className="flex-1">
                                  <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{avatar.name}</h3>
                                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                    {avatar.type === 'hacker' ? 'Hacker Éthique' : 
                                     avatar.type === 'analyst' ? 'Analyste Sécurité' :
                                     avatar.type === 'security_manager' ? 'Gestionnaire Sécurité' :
                                     'Spécialiste Réseau'}
                                  </p>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {avatar.abilities.map((ability, index) => (
                                      <Badge key={index} className={`text-xs ${
                                        isDark ? 'bg-gray-700 text-white border-0' : 'bg-gray-200 text-gray-800 border-0'
                                      }`}>
                                        {ability}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                                
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className={`p-0 h-8 w-8 rounded-full ${isDark ? 'text-white hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setAvatarCardOpen(avatar.id === avatarCardOpen ? null : avatar.id);
                                  }}
                                >
                                  <Info className="h-4 w-4" />
                                </Button>
                              </div>
                              
                              {/* Info détaillée */}
                              <AnimatePresence>
                                {avatarCardOpen === avatar.id && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="mt-3 overflow-hidden"
                                  >
                                    <Separator className={`my-2 ${isDark ? 'bg-gray-600' : 'bg-gray-300'}`} />
                                    <p className={`text-sm mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>{avatar.description}</p>
                                    
                                    <h4 className={`text-sm font-medium mb-1 ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                                      Forces et faiblesses
                                    </h4>
                                    <ul className={`text-sm space-y-1 list-disc pl-5 mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                                      {avatar.strengthsAndWeaknesses.map((item, index) => (
                                        <li key={index}>{item}</li>
                                      ))}
                                    </ul>
                                    
                                    <h4 className={`text-sm font-medium mb-1 ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                                      Compétences principales
                                    </h4>
                                    <div className="flex flex-wrap gap-1">
                                      {avatar.primarySkills.map((skill, index) => (
                                        <Badge key={index} className={`${
                                          isDark ? 'bg-blue-700 text-white border-0' : 'bg-blue-600 text-white border-0'
                                        }`}>
                                          {skill}
                                        </Badge>
                                      ))}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                    
                    <CardFooter className="flex justify-between pt-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setEntryStep('welcome')}
                        className={isDark ? 'border-gray-600 bg-transparent text-white hover:bg-gray-700' : 'border-gray-300 text-gray-800 hover:bg-gray-100'}
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Retour
                      </Button>
                      
                      <Button 
                        onClick={proceedToNextStep} 
                        className={isDark 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'bg-blue-700 hover:bg-blue-800 text-white'
                        }
                        disabled={!selectedAvatar}
                      >
                        Continuer
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              )}
              
              {entryStep === 'mission' && (
                <motion.div 
                  key="mission"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="w-full max-w-4xl"
                >
                  <Card className={`p-6 ${isDark ? 'bg-gray-800 border-blue-700' : 'bg-white border-blue-300'} backdrop-blur-sm border-2 rounded-lg shadow-xl`}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-2xl">
                        <div className={`p-2 rounded-lg ${isDark ? 'bg-cyan-600' : 'bg-cyan-100'}`}>
                          <FileCode className={`h-7 w-7 ${isDark ? 'text-white' : 'text-cyan-800'}`} />
                        </div>
                        <span className={isDark ? 'text-white' : 'text-blue-950'}>
                          Briefing de mission
                        </span>
                      </CardTitle>
                      <CardDescription className={`text-base ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                        Votre objectif au sein de CyberForge Academy
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {selectedAvatar && (
                        <div className={`flex items-center gap-4 p-4 rounded-lg mb-4 ${
                          isDark ? 'bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-700' 
                               : 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200'
                        }`}>
                          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                            isDark ? 'bg-blue-600' : 'bg-blue-500'
                          }`}>
                            <span className="text-2xl">{
                              selectedAvatar.id === 'shadow' ? '👤' : 
                              selectedAvatar.id === 'sentinel' ? '🔍' :
                              selectedAvatar.id === 'guardian' ? '🛡️' : 
                              '📡'
                            }</span>
                          </div>
                          
                          <div>
                            <h3 className={`font-bold text-lg flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {selectedAvatar.name}
                              <Badge className={`ml-2 ${isDark ? 'bg-green-600 text-white' : 'bg-green-600 text-white'} border-0`}>
                                Niveau 1
                              </Badge>
                            </h3>
                            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                              {selectedAvatar.type === 'hacker' ? 'Hacker Éthique' : 
                               selectedAvatar.type === 'analyst' ? 'Analyste Sécurité' :
                               selectedAvatar.type === 'security_manager' ? 'Gestionnaire Sécurité' :
                               'Spécialiste Réseau'}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      <div className={`p-5 rounded-md ${isDark ? 'bg-gray-900 border border-gray-700' : 'bg-gray-50 border border-gray-200'}`}>
                        <h3 className={`font-bold text-lg mb-3 ${isDark ? 'text-blue-300' : 'text-blue-700'} flex items-center gap-2`}>
                          <Shield className="h-5 w-5" /> Mission principale
                        </h3>
                        <p className={`mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                          En tant que {selectedAvatar?.name || 'recrue'} au sein de CyberForge Academy, votre mission est de développer vos compétences en cybersécurité en complétant des modules d'apprentissage, des laboratoires pratiques et des simulations de crise.
                        </p>
                        
                        <h4 className={`font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'} flex items-center gap-2`}>
                          <CheckCircle className={`h-4 w-4 ${isDark ? 'text-green-400' : 'text-green-600'}`} /> 
                          Objectifs :
                        </h4>
                        <ul className={`list-none space-y-2 mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                          <li className="flex items-start gap-2">
                            <div className="mt-1 text-xs">
                              <Circle className={`h-2 w-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                            </div>
                            Compléter les 9 modules d'apprentissage pour maîtriser les différents aspects de la cybersécurité
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="mt-1 text-xs">
                              <Circle className={`h-2 w-2 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                            </div>
                            Participer à des exercices pratiques dans l'environnement de laboratoire virtuel
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="mt-1 text-xs">
                              <Circle className={`h-2 w-2 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                            </div>
                            Relever les défis de cyber-défense en conditions réalistes
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="mt-1 text-xs">
                              <Circle className={`h-2 w-2 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                            </div>
                            Constituer une équipe virtuelle d'agents pour les missions avancées
                          </li>
                        </ul>
                        
                        <div className={`p-4 rounded ${
                          isDark ? 'bg-gradient-to-r from-blue-900/50 to-indigo-900/50 text-white border border-blue-800' 
                                : 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-900 border border-blue-200'
                        }`}>
                          <p className={`font-medium mb-1 ${isDark ? 'text-blue-200' : 'text-blue-800'} flex items-center gap-2`}>
                            <Lightbulb className="h-4 w-4" /> Recommandation pour votre profil ({selectedAvatar?.name || 'recrue'}) :
                          </p>
                          <p className={isDark ? 'text-gray-200' : 'text-gray-700'}>
                            {selectedAvatar?.id === 'shadow' && "Commencez par les modules de fondamentaux et de sécurité web pour exploiter vos compétences en hacking éthique."}
                            {selectedAvatar?.id === 'sentinel' && "Concentrez-vous d'abord sur les fondamentaux et la gestion des incidents pour renforcer vos capacités stratégiques."}
                            {selectedAvatar?.id === 'guardian' && "Explorez les modules d'analyse de malware et de réponse aux incidents pour améliorer vos compétences d'analyste."}
                            {selectedAvatar?.id === 'nexus' && "Approfondissez les modules de sécurité réseau et d'architecture pour optimiser vos compétences de spécialiste."}
                            {!selectedAvatar?.id && "Commencez par les fondamentaux pour établir une base solide de connaissances."}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className={`p-4 rounded-md text-center ${isDark ? 'bg-blue-900/30 border border-blue-800' : 'bg-blue-50 border border-blue-200'}`}>
                          <h3 className={`font-medium mb-1 ${isDark ? 'text-blue-200' : 'text-blue-700'}`}>Modules à compléter</h3>
                          <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-blue-700'}`}>9</div>
                        </div>
                        
                        <div className={`p-4 rounded-md text-center ${isDark ? 'bg-green-900/30 border border-green-800' : 'bg-green-50 border border-green-200'}`}>
                          <h3 className={`font-medium mb-1 ${isDark ? 'text-green-200' : 'text-green-700'}`}>Niveau actuel</h3>
                          <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-green-700'}`}>1</div>
                        </div>
                        
                        <div className={`p-4 rounded-md text-center ${isDark ? 'bg-purple-900/30 border border-purple-800' : 'bg-purple-50 border border-purple-200'}`}>
                          <h3 className={`font-medium mb-1 ${isDark ? 'text-purple-200' : 'text-purple-700'}`}>Points disponibles</h3>
                          <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-purple-700'}`}>50</div>
                        </div>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="flex justify-between pt-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setEntryStep('avatar')}
                        className={isDark ? 'border-gray-600 bg-transparent text-white hover:bg-gray-700' : 'border-gray-300 text-gray-800 hover:bg-gray-100'}
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Retour
                      </Button>
                      
                      <Button 
                        onClick={proceedToNextStep} 
                        className={isDark 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'bg-blue-700 hover:bg-blue-800 text-white'
                        }
                      >
                        Accepter la mission
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              )}
              
              {entryStep === 'ready' && (
                <motion.div 
                  key="ready"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="w-full max-w-3xl text-center"
                >
                  <Card className={`p-6 ${isDark ? 'bg-gray-800 border-blue-700' : 'bg-white border-blue-300'} backdrop-blur-sm border-2 rounded-lg shadow-xl`}>
                    <CardContent className="pt-6 flex flex-col items-center">
                      <div className={`w-24 h-24 rounded-full mb-5 flex items-center justify-center bg-gradient-to-br ${
                        isDark ? 'from-green-600 to-blue-700' : 'from-green-500 to-blue-600'
                      }`}>
                        <CheckCircle className="h-12 w-12 text-white" />
                      </div>
                      
                      <h2 className={`text-2xl md:text-3xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Vous êtes prêt !</h2>
                      
                      <div className={`p-4 mb-5 rounded-md max-w-lg text-center ${
                        isDark ? 'bg-blue-900/30 border border-blue-800' : 'bg-blue-50 border border-blue-200'
                      }`}>
                        <p className={`${isDark ? 'text-white' : 'text-gray-800'}`}>
                          Votre profil <span className="font-bold">{selectedAvatar?.name || 'agent'}</span> est configuré. L'académie CyberForge vous attend pour commencer votre parcours dans l'élite de la cybersécurité.
                        </p>
                      </div>
                      
                      <div className="flex gap-2 items-center mb-6">
                        {['Modules', 'Laboratoires', 'Défis', 'Simulations'].map((item, index) => (
                          <Badge 
                            key={index}
                            className={`px-3 py-1 ${
                              isDark 
                                ? 'bg-gray-700 text-white border-0' 
                                : 'bg-gray-200 text-gray-800 border-0'
                            }`}
                          >
                            {item}
                          </Badge>
                        ))}
                      </div>
                      
                      <Button 
                        onClick={proceedToNextStep} 
                        size="lg"
                        className={`px-8 ${
                          isDark 
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white border-0' 
                            : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white border-0'
                        }`}
                      >
                        Entrer dans l'Académie
                        <ChevronRight className="h-5 w-5 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      ) : (
        // Interface principale (mode normal)
        <div className={`container mx-auto px-4 py-8 ${isDark ? 'text-white' : 'text-gray-800'}`}>
          <div className="flex justify-between items-center mb-4">
            <h1 className={`text-4xl font-bold font-mono tracking-tight ${
              isDark 
                ? 'bg-gradient-to-r from-blue-400 to-indigo-400 text-transparent bg-clip-text' 
                : 'bg-gradient-to-r from-blue-700 to-indigo-800 text-transparent bg-clip-text'
            }`}>
              CyberForge<span className={isDark ? 'text-blue-300' : 'text-blue-700'}>_</span>Academy
            </h1>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setLocation('/')}
                className={`flex items-center gap-1 ${
                  isDark 
                    ? 'border-gray-600 bg-transparent text-white hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-800 hover:bg-gray-100'
                }`}
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Accueil</span>
              </Button>
            </div>
          </div>
          
          <div className={`p-6 mb-8 rounded-xl ${isDark ? 'bg-gray-800 border border-blue-900' : 'bg-white border border-blue-200'} shadow-lg`}>
            <h2 className={`text-xl font-bold mb-3 flex items-center gap-2 ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
              <Shield className="h-5 w-5" /> Bienvenue dans votre espace d'entraînement
            </h2>
            <p className="mb-4">
              L'interface principale de CyberForge Academy est en cours de construction. Bientôt, vous pourrez accéder aux modules d'apprentissage, laboratoires pratiques et simulations d'attaques.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-md ${isDark ? 'bg-gray-900 border border-gray-700' : 'bg-gray-50 border border-gray-200'}`}>
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <BookOpen className={`h-4 w-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} /> Modules d'apprentissage
                </h3>
                <p className="text-sm opacity-90">9 modules progressifs pour maîtriser les compétences essentielles en cybersécurité.</p>
              </div>
              
              <div className={`p-4 rounded-md ${isDark ? 'bg-gray-900 border border-gray-700' : 'bg-gray-50 border border-gray-200'}`}>
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <Terminal className={`h-4 w-4 ${isDark ? 'text-green-400' : 'text-green-600'}`} /> Laboratoire virtuel
                </h3>
                <p className="text-sm opacity-90">Environnement sécurisé pour pratiquer les techniques de hacking éthique.</p>
              </div>
              
              <div className={`p-4 rounded-md ${isDark ? 'bg-gray-900 border border-gray-700' : 'bg-gray-50 border border-gray-200'}`}>
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <AlertTriangle className={`h-4 w-4 ${isDark ? 'text-red-400' : 'text-red-600'}`} /> Simulations d'attaques
                </h3>
                <p className="text-sm opacity-90">Scénarios réalistes pour améliorer vos compétences en défense cyber.</p>
              </div>
            </div>
          </div>
          
          {selectedAvatar && (
            <div className={`p-5 rounded-xl ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} flex flex-col md:flex-row items-center gap-4 shadow-lg`}>
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  isDark ? 'bg-blue-600' : 'bg-blue-500'
                }`}>
                  <span className="text-2xl">{
                    selectedAvatar.id === 'shadow' ? '👤' : 
                    selectedAvatar.id === 'sentinel' ? '🔍' :
                    selectedAvatar.id === 'guardian' ? '🛡️' : 
                    '📡'
                  }</span>
                </div>
                
                <div>
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    {selectedAvatar.name}
                    <Badge className={isDark ? 'bg-green-700 text-white border-0' : 'bg-green-100 text-green-800 border-0'}>
                      Niveau 1
                    </Badge>
                  </h3>
                  <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                    {selectedAvatar.type === 'hacker' ? 'Hacker Éthique' : 
                     selectedAvatar.type === 'analyst' ? 'Analyste Sécurité' :
                     selectedAvatar.type === 'security_manager' ? 'Gestionnaire Sécurité' :
                     'Spécialiste Réseau'}
                  </p>
                  <p className="text-sm mt-1 flex items-center gap-1">
                    <Star className={`h-4 w-4 ${isDark ? 'text-yellow-400' : 'text-yellow-500'}`} />
                    <span>Points: <span className="font-medium">50</span></span>
                  </p>
                </div>
              </div>
              
              <div className="flex-1 flex justify-end mt-4 md:mt-0">
                <div className="flex flex-col gap-2">
                  <Button 
                    className={`${isDark ? 'bg-blue-700 hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                    onClick={() => setLocation('/cyberforge/modules')}
                  >
                    <Layers className="mr-2 h-4 w-4" />
                    Accéder aux modules
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className={`${
                      isDark 
                        ? 'border-blue-800 bg-transparent text-blue-300 hover:bg-blue-900/50' 
                        : 'border-blue-300 text-blue-700 hover:bg-blue-50'
                    }`}
                    onClick={() => setEntryStep('welcome')}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Changer de profil
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CyberForge;