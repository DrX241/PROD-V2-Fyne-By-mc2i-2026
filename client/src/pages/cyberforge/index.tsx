import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  ArrowLeft, BookOpen, Shield, Terminal, Lightbulb, Settings, MessageCircle, 
  ChevronRight, Star, LockIcon, CheckCircle, ExternalLink, User, AlertTriangle,
  Server, Database, Globe, Wifi, Lock, UserX, Zap, FileCode, Fingerprint, BrainCircuit,
  Eye, Monitor, Cpu, Cable, FileWarning, ShieldAlert, Key, PlayCircle, Clock8,
  Circle, Info, X
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
  const { themeMode } = useTheme();
  const isDark = themeMode === 'dark' || themeMode === 'futuristic' || false;
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
              <h1 className={`text-4xl sm:text-5xl font-bold mb-2 ${isDark ? 'text-blue-400' : 'text-blue-600'} font-mono tracking-tight transition-all duration-500 ${entryStep !== 'welcome' ? 'text-2xl' : ''}`}>
                CyberForge<span className="text-white">_</span>Academy
              </h1>
              {entryStep === 'welcome' && (
              <p className="text-lg md:text-xl opacity-80 max-w-2xl mx-auto">
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
                  <Card className={`p-6 ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'} backdrop-blur-sm border rounded-lg shadow-lg`}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-2xl">
                        <Shield className={`h-6 w-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                        Bienvenue à CyberForge Academy
                      </CardTitle>
                      <CardDescription className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                        Votre parcours dans l'élite de la cybersécurité commence ici
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <p>
                        L'Académie CyberForge est un centre d'entraînement de haute technologie conçu pour former 
                        les experts en cybersécurité de demain. Ici, vous développerez vos compétences à travers 
                        des modules interactifs, des simulations tactiques et des défis de hacking éthique.
                      </p>
                      
                      <div className={`p-4 rounded-md ${isDark ? 'bg-gray-700/50 text-blue-300' : 'bg-blue-50 text-blue-700'} flex items-start gap-3`}>
                        <Info className="h-5 w-5 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Votre progression est enregistrée</p>
                          <p className="text-sm opacity-90">Tous vos accomplissements, badges et niveaux sont sauvegardés automatiquement.</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                        <div className={`p-4 rounded-md ${isDark ? 'bg-gray-700/40' : 'bg-gray-100'} text-center`}>
                          <Lightbulb className={`h-8 w-8 mx-auto mb-2 ${isDark ? 'text-yellow-400' : 'text-yellow-500'}`} />
                          <h3 className="font-medium">9 Modules d'apprentissage</h3>
                          <p className="text-sm opacity-80">Des fondamentaux à l'expertise avancée</p>
                        </div>
                        
                        <div className={`p-4 rounded-md ${isDark ? 'bg-gray-700/40' : 'bg-gray-100'} text-center`}>
                          <Terminal className={`h-8 w-8 mx-auto mb-2 ${isDark ? 'text-green-400' : 'text-green-500'}`} />
                          <h3 className="font-medium">Laboratoires pratiques</h3>
                          <p className="text-sm opacity-80">Environnements sécurisés pour pratiquer</p>
                        </div>
                        
                        <div className={`p-4 rounded-md ${isDark ? 'bg-gray-700/40' : 'bg-gray-100'} text-center`}>
                          <ShieldAlert className={`h-8 w-8 mx-auto mb-2 ${isDark ? 'text-red-400' : 'text-red-500'}`} />
                          <h3 className="font-medium">Simulations d'attaques</h3>
                          <p className="text-sm opacity-80">Scénarios réalistes et adaptatifs</p>
                        </div>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="flex justify-between pt-2">
                      <Button variant="outline" onClick={() => setLocation('/')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Retour
                      </Button>
                      
                      <Button onClick={proceedToNextStep} className={isDark ? 'bg-blue-600 hover:bg-blue-700' : ''}>
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
                  <Card className={`p-6 ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'} backdrop-blur-sm border rounded-lg shadow-lg`}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-2xl">
                        <User className={`h-6 w-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                        Sélectionnez votre personnage
                      </CardTitle>
                      <CardDescription className={isDark ? 'text-gray-400' : 'text-gray-600'}>
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
                                    ? 'border-blue-500 bg-blue-900/20' 
                                    : 'border-blue-500 bg-blue-50' 
                                  : isDark 
                                    ? 'border-gray-700 hover:border-gray-600 bg-gray-800/50' 
                                    : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                              }`}
                              onClick={() => selectAvatarProfile(avatar)}
                            >
                              <div className="flex items-center gap-4">
                                <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${
                                  isDark ? 'bg-gray-700' : 'bg-gray-200'
                                }`}>
                                  <span className="text-2xl">{
                                    avatar.id === 'shadow' ? '👤' : 
                                    avatar.id === 'sentinel' ? '🔍' :
                                    avatar.id === 'guardian' ? '🛡️' : 
                                    '📡'
                                  }</span>
                                </div>
                                
                                <div className="flex-1">
                                  <h3 className="font-bold text-lg">{avatar.name}</h3>
                                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {avatar.type === 'hacker' ? 'Hacker Éthique' : 
                                     avatar.type === 'analyst' ? 'Analyste Sécurité' :
                                     avatar.type === 'security_manager' ? 'Gestionnaire Sécurité' :
                                     'Spécialiste Réseau'}
                                  </p>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {avatar.abilities.map((ability, index) => (
                                      <Badge key={index} variant="outline" className="text-xs">
                                        {ability}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                                
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="p-0 h-8 w-8 rounded-full"
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
                                    <Separator className="my-2" />
                                    <p className="text-sm mb-2">{avatar.description}</p>
                                    
                                    <h4 className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                      Forces et faiblesses
                                    </h4>
                                    <ul className="text-sm space-y-1 list-disc pl-5 mb-2">
                                      {avatar.strengthsAndWeaknesses.map((item, index) => (
                                        <li key={index}>{item}</li>
                                      ))}
                                    </ul>
                                    
                                    <h4 className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                      Compétences principales
                                    </h4>
                                    <div className="flex flex-wrap gap-1">
                                      {avatar.primarySkills.map((skill, index) => (
                                        <Badge key={index} className={`${
                                          isDark ? 'bg-blue-900 text-blue-100' : 'bg-blue-100 text-blue-800'
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
                      <Button variant="outline" onClick={() => setEntryStep('welcome')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Retour
                      </Button>
                      
                      <Button 
                        onClick={proceedToNextStep} 
                        className={isDark ? 'bg-blue-600 hover:bg-blue-700' : ''}
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
                  <Card className={`p-6 ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'} backdrop-blur-sm border rounded-lg shadow-lg`}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-2xl">
                        <FileCode className={`h-6 w-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                        Briefing de mission
                      </CardTitle>
                      <CardDescription className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                        Votre objectif au sein de CyberForge Academy
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {selectedAvatar && (
                        <div className="flex items-center gap-4 p-4 rounded-lg mb-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-800/30">
                          <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${
                            isDark ? 'bg-gray-700' : 'bg-gray-200'
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
                              <Badge className={`ml-2 ${isDark ? 'bg-blue-800 text-blue-100' : 'bg-blue-100 text-blue-800'}`}>
                                Niveau 1
                              </Badge>
                            </h3>
                            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {selectedAvatar.type === 'hacker' ? 'Hacker Éthique' : 
                               selectedAvatar.type === 'analyst' ? 'Analyste Sécurité' :
                               selectedAvatar.type === 'security_manager' ? 'Gestionnaire Sécurité' :
                               'Spécialiste Réseau'}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      <div className={`p-4 rounded-md ${isDark ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                        <h3 className={`font-bold text-lg mb-2 ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                          Mission principale
                        </h3>
                        <p className="mb-3">
                          En tant que {selectedAvatar?.name || 'recrue'} au sein de CyberForge Academy, votre mission est de développer vos compétences en cybersécurité en complétant des modules d'apprentissage, des laboratoires pratiques et des simulations de crise.
                        </p>
                        
                        <h4 className="font-medium mb-1">Objectifs :</h4>
                        <ul className="list-disc pl-5 space-y-1 mb-3">
                          <li>Compléter les 9 modules d'apprentissage pour maîtriser les différents aspects de la cybersécurité</li>
                          <li>Participer à des exercices pratiques dans l'environnement de laboratoire virtuel</li>
                          <li>Relever les défis de cyber-défense en conditions réalistes</li>
                          <li>Constituer une équipe virtuelle d'agents pour les missions avancées</li>
                        </ul>
                        
                        <div className={`p-3 rounded ${isDark ? 'bg-blue-900/30 text-blue-200' : 'bg-blue-50 text-blue-800'} text-sm`}>
                          <p className="font-medium">Recommandation pour votre profil ({selectedAvatar?.name || 'recrue'}) :</p>
                          <p>
                            {selectedAvatar?.id === 'shadow' && "Commencez par les modules de fondamentaux et de sécurité web pour exploiter vos compétences en hacking éthique."}
                            {selectedAvatar?.id === 'sentinel' && "Concentrez-vous d'abord sur les fondamentaux et la gestion des incidents pour renforcer vos capacités stratégiques."}
                            {selectedAvatar?.id === 'guardian' && "Explorez les modules d'analyse de malware et de réponse aux incidents pour améliorer vos compétences d'analyste."}
                            {selectedAvatar?.id === 'nexus' && "Approfondissez les modules de sécurité réseau et d'architecture pour optimiser vos compétences de spécialiste."}
                            {!selectedAvatar?.id && "Commencez par les fondamentaux pour établir une base solide de connaissances."}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className={`p-3 rounded-md text-center ${isDark ? 'bg-gray-700/40' : 'bg-gray-100'}`}>
                          <h3 className="font-medium mb-1">Modules à compléter</h3>
                          <div className="text-2xl font-bold text-blue-500">9</div>
                        </div>
                        
                        <div className={`p-3 rounded-md text-center ${isDark ? 'bg-gray-700/40' : 'bg-gray-100'}`}>
                          <h3 className="font-medium mb-1">Niveau actuel</h3>
                          <div className="text-2xl font-bold text-green-500">1</div>
                        </div>
                        
                        <div className={`p-3 rounded-md text-center ${isDark ? 'bg-gray-700/40' : 'bg-gray-100'}`}>
                          <h3 className="font-medium mb-1">Points disponibles</h3>
                          <div className="text-2xl font-bold text-purple-500">50</div>
                        </div>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="flex justify-between pt-2">
                      <Button variant="outline" onClick={() => setEntryStep('avatar')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Retour
                      </Button>
                      
                      <Button 
                        onClick={proceedToNextStep} 
                        className={isDark ? 'bg-blue-600 hover:bg-blue-700' : ''}
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
                  <Card className={`p-6 ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'} backdrop-blur-sm border rounded-lg shadow-lg`}>
                    <CardContent className="pt-6 flex flex-col items-center">
                      <div className={`w-20 h-20 rounded-lg mb-4 flex items-center justify-center ${
                        isDark ? 'bg-blue-900/30' : 'bg-blue-100'
                      }`}>
                        <CheckCircle className={`h-10 w-10 ${isDark ? 'text-blue-300' : 'text-blue-600'}`} />
                      </div>
                      
                      <h2 className="text-2xl font-bold mb-2">Vous êtes prêt !</h2>
                      <p className="mb-6 max-w-lg">
                        Votre profil {selectedAvatar?.name || 'agent'} est configuré. L'académie CyberForge vous attend pour commencer votre parcours dans l'élite de la cybersécurité.
                      </p>
                      
                      <Button 
                        onClick={proceedToNextStep} 
                        size="lg"
                        className={`px-8 ${isDark ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                      >
                        Entrer dans l'Académie
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
        <div className="container mx-auto px-4 py-8">
          <h1 className={`text-4xl font-bold mb-2 ${isDark ? 'text-blue-400' : 'text-blue-600'} font-mono tracking-tight`}>
            CyberForge<span className="text-white">_</span>Academy
          </h1>
          <p>Interface principale de CyberForge Academy. Contenu en cours de développement...</p>
        </div>
      )}
    </div>
  );
}

export default CyberForge;