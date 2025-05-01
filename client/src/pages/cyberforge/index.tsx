import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  ArrowLeft, BookOpen, Shield, Terminal, Lightbulb, Settings, MessageCircle, 
  ChevronRight, Star, LockIcon, CheckCircle, ExternalLink, User, AlertTriangle,
  Server, Database, Globe, Wifi, Lock, UserX, Zap, FileCode, Fingerprint, BrainCircuit,
  Eye, Monitor, Cpu, Cable, FileWarning, ShieldAlert, Key, PlayCircle, Clock8,
  Circle, InfoIcon, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/contexts/ThemeContext';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import axios from 'axios';

// Types pour les modules et leur contenu
interface ModuleProgress {
  completed: boolean;
  progress: number;
  lastAccessed?: Date;
}

interface UserData {
  name: string;
  totalProgress: number;
  moduleProgress: Record<string, ModuleProgress>;
  isAdmin: boolean;
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

// Données factices pour les modules
const modules = [
  {
    id: 'fundamentals',
    title: 'Fondamentaux',
    icon: <Shield className="h-5 w-5" />,
    iconEmoji: '🔐',
    color: 'bg-blue-500',
    description: 'Les principes de base de la cybersécurité et les concepts essentiels',
    level: 1,
    unlocked: true,
    requiredModules: [],
    hasLiveSimulation: false
  },
  {
    id: 'network-security',
    title: 'Sécurité Réseau',
    icon: <Globe className="h-5 w-5" />,
    iconEmoji: '🌐',
    color: 'bg-purple-500',
    description: 'Protection des infrastructures réseau et détection des intrusions',
    level: 2,
    unlocked: false,
    requiredModules: ['fundamentals'],
    hasLiveSimulation: true
  },
  {
    id: 'web-security',
    title: 'Sécurité Web',
    icon: <FileCode className="h-5 w-5" />,
    iconEmoji: '🕸️',
    color: 'bg-orange-500',
    description: 'Sécurisation des applications web et API',
    level: 3,
    unlocked: false,
    requiredModules: ['fundamentals', 'network-security'],
    hasLiveSimulation: true
  },
  {
    id: 'cryptography',
    title: 'Cryptographie',
    icon: <Key className="h-5 w-5" />,
    iconEmoji: '🔒',
    color: 'bg-green-500',
    description: 'Chiffrement, hachage et gestion des clés',
    level: 3,
    unlocked: false,
    requiredModules: ['fundamentals'],
    hasLiveSimulation: true
  },
  {
    id: 'social-engineering',
    title: 'Ingénierie Sociale',
    icon: <UserX className="h-5 w-5" />,
    iconEmoji: '🎭',
    color: 'bg-red-500',
    description: 'Techniques de manipulation et défenses psychologiques',
    level: 2,
    unlocked: false,
    requiredModules: ['fundamentals'],
    hasLiveSimulation: true
  },
  {
    id: 'attack-scenarios',
    title: 'Scénarios d\'Attaque',
    icon: <AlertTriangle className="h-5 w-5" />,
    iconEmoji: '⚔️',
    color: 'bg-amber-500',
    description: 'Simulations d\'attaques réelles et analyses de cas',
    level: 4,
    unlocked: false,
    requiredModules: ['fundamentals', 'network-security', 'web-security'],
    hasLiveSimulation: true
  },
  {
    id: 'malware-analysis',
    title: 'Analyse de Malware',
    icon: <FileWarning className="h-5 w-5" />,
    iconEmoji: '🔍',
    color: 'bg-violet-500',
    description: 'Techniques avancées d\'analyse de logiciels malveillants et de rétro-ingénierie',
    level: 4,
    unlocked: false,
    requiredModules: ['fundamentals', 'network-security'],
    hasLiveSimulation: true
  },
  {
    id: 'incident-response',
    title: 'Réponse aux Incidents',
    icon: <ShieldAlert className="h-5 w-5" />,
    iconEmoji: '🚨',
    color: 'bg-emerald-500',
    description: 'Stratégies et procédures pour réagir efficacement aux incidents de sécurité',
    level: 3,
    unlocked: false,
    requiredModules: ['fundamentals', 'network-security'],
    hasLiveSimulation: true
  },
  {
    id: 'adversary-emulation',
    title: 'Émulation d\'Adversaires',
    icon: <Zap className="h-5 w-5" />,
    iconEmoji: '⚡',
    color: 'bg-rose-500',
    description: 'Simulation avancée des tactiques, techniques et procédures (TTP) d\'attaquants réels',
    level: 5,
    unlocked: false, 
    requiredModules: ['fundamentals', 'network-security', 'web-security', 'attack-scenarios'],
    hasLiveSimulation: true
  }
];

// Scénarios de simulation pour les différents modules
const networkSecuritySimulations: SimulationScenario[] = [
  {
    id: 'network-1',
    title: 'Détection d\'intrusion réseau',
    description: 'Analysez le trafic réseau pour identifier une tentative d\'intrusion en cours',
    difficulty: 'intermédiaire',
    duration: '45-60 min',
    objectives: [
      'Configurer un système de détection d\'intrusion',
      'Identifier les signatures d\'attaques dans le trafic réseau',
      'Mettre en place des règles de blocage efficaces'
    ],
    completionReward: 150,
    icon: <Wifi />
  },
  {
    id: 'network-2',
    title: 'Attaque MITM',
    description: 'Simulation d\'une attaque Man-in-the-Middle dans un environnement contrôlé',
    difficulty: 'avancé',
    duration: '60-90 min',
    objectives: [
      'Comprendre les mécanismes de l\'attaque MITM',
      'Identifier les vulnérabilités exploitables',
      'Mettre en place des contre-mesures efficaces'
    ],
    completionReward: 200,
    icon: <Cable />
  }
];

const webSecuritySimulations: SimulationScenario[] = [
  {
    id: 'web-1',
    title: 'Audit d\'application web',
    description: 'Identifiez et corrigez les vulnérabilités OWASP Top 10 dans une application web',
    difficulty: 'intermédiaire',
    duration: '60-90 min',
    objectives: [
      'Scanner l\'application avec des outils automatisés',
      'Vérifier manuellement les vulnérabilités découvertes',
      'Proposer des correctifs pour chaque problème identifié'
    ],
    completionReward: 180,
    icon: <Globe />
  },
  {
    id: 'web-2',
    title: 'Test d\'intrusion web',
    description: 'Conduisez un test d\'intrusion complet sur une application web vulnérable',
    difficulty: 'expert',
    duration: '90-120 min',
    objectives: [
      'Établir un périmètre de test clair',
      'Exécuter un test d\'intrusion méthodique',
      'Documenter les vulnérabilités et leurs impacts'
    ],
    completionReward: 250,
    icon: <FileCode />
  }
];

// Données des sections pour le module Fondamentaux
const fundamentalsSections = [
  {
    id: 'intro',
    title: 'Introduction',
    content: `
# Introduction à la cybersécurité

La cybersécurité désigne l'ensemble des pratiques, technologies et processus visant à protéger les systèmes informatiques, les réseaux et les données contre les attaques, les dommages ou les accès non autorisés.

## Pourquoi la cybersécurité est-elle importante?

📈 **L'augmentation des cyberattaques** - Le nombre et la sophistication des attaques augmentent chaque année.

🌐 **La transformation digitale** - De plus en plus d'organisations dépendent entièrement de leurs systèmes informatiques.

💰 **L'impact financier** - Une seule brèche peut coûter des millions en pertes directes et indirectes.

👥 **La protection des données personnelles** - Les informations personnelles des utilisateurs doivent être protégées.

## Les principes fondamentaux

Tout programme de cybersécurité efficace repose sur trois piliers principaux, connus sous le nom de "triade CIA":

- **Confidentialité** - Seules les personnes autorisées peuvent accéder aux informations.
- **Intégrité** - Les informations ne peuvent pas être modifiées de manière non autorisée.
- **Disponibilité** - Les informations et les systèmes sont disponibles lorsque nécessaire.
    `
  },
  {
    id: 'threats',
    title: 'Types de Menaces',
    content: `
# Types de menaces cybernétiques

Les menaces cybernétiques évoluent constamment. Voici les principales catégories:

## Malwares

Les logiciels malveillants incluent plusieurs sous-catégories:

- **Virus** - Se propagent en s'attachant à des fichiers légitimes.
- **Ransomware** - Chiffrent les données et demandent une rançon pour les déchiffrer.
- **Spyware** - Surveillent secrètement les activités des utilisateurs.
- **Trojans** - Se présentent comme des logiciels légitimes pour tromper les utilisateurs.

## Attaques réseau

- **DDoS (Déni de service distribué)** - Submergent un service en trafic pour le rendre indisponible.
- **Man-in-the-Middle** - Interceptent les communications entre deux parties.
- **Sniffing** - Capturent et analysent le trafic réseau.

## Ingénierie sociale

- **Phishing** - Emails frauduleux imitant des sources légitimes.
- **Pretexting** - Création de scénarios fictifs pour obtenir des informations.
- **Baiting** - Offre de quelque chose d'attrayant pour inciter à compromettre la sécurité.

## Autres menaces

- **Menaces internes** - Provenant d'employés ou de partenaires ayant un accès légitime.
- **Attaques de la chaîne d'approvisionnement** - Ciblant les fournisseurs pour atteindre leur cible finale.
- **Exploitation de vulnérabilités** - Exploitant des faiblesses dans les applications ou systèmes.
    `
  },
  {
    id: 'principles',
    title: 'Principes de Sécurité',
    content: `
# Principes fondamentaux de sécurité

La sécurité efficace repose sur plusieurs principes clés:

## Défense en profondeur

🛡️ Utiliser plusieurs couches de sécurité pour qu'une seule défaillance ne compromette pas tout le système.

*Exemple: Utilisation combinée de pare-feu, antivirus, chiffrement, et contrôles d'accès.*

## Principe du moindre privilège

👤 Accorder uniquement les droits et accès minimums nécessaires pour effectuer une tâche.

*Exemple: Un comptable n'a pas besoin d'accéder aux bases de données des clients du service marketing.*

## Ségrégation des tâches

👥 Diviser les responsabilités critiques entre différentes personnes.

*Exemple: La personne qui crée un compte utilisateur ne devrait pas être celle qui approuve sa création.*

## Sécurité par conception

🏗️ Intégrer la sécurité dès le début du développement d'un système.

*Exemple: Réaliser des analyses de risques et des tests de sécurité dès les premières phases de conception.*

## Résilience

🔄 Capacité à maintenir les opérations ou à se rétablir rapidement après un incident.

*Exemple: Mise en place de plans de continuité d'activité et de reprise après sinistre.*
    `
  },
  {
    id: 'quiz',
    title: 'Quiz',
    content: '# Quiz sur les fondamentaux'
  }
];

// Questions du quiz
const fundamentalsQuiz = [
  {
    question: "Que signifie l'acronyme CIA en cybersécurité?",
    options: [
      "Central Intelligence Agency",
      "Confidentialité, Intégrité, Authentification",
      "Confidentialité, Intégrité, Disponibilité (Availability)",
      "Cybersécurité, Internet, Authentification"
    ],
    correctAnswer: 2,
    explanation: "La triade CIA représente les trois piliers de la sécurité : Confidentialité, Intégrité et Disponibilité (Availability en anglais)."
  },
  {
    question: "Quelle pratique consiste à donner à un utilisateur uniquement les accès dont il a besoin?",
    options: [
      "Défense en profondeur",
      "Principe du moindre privilège",
      "Ségrégation des tâches",
      "Sécurité par obscurité"
    ],
    correctAnswer: 1,
    explanation: "Le principe du moindre privilège stipule qu'un utilisateur ne doit avoir que les droits minimaux nécessaires à l'accomplissement de sa tâche."
  },
  {
    question: "Quel type d'attaque chiffre les données et demande une rançon pour les déchiffrer?",
    options: [
      "Phishing",
      "DDoS",
      "Ransomware",
      "Man-in-the-Middle"
    ],
    correctAnswer: 2,
    explanation: "Le ransomware est un type de malware qui chiffre les données de la victime et exige un paiement pour fournir la clé de déchiffrement."
  }
];

// Composant principal CyberForge
// Calculer la progression totale
function calculateTotalProgress(moduleProgress: Record<string, ModuleProgress>): number {
  const modules = Object.values(moduleProgress);
  if (modules.length === 0) return 0;
  
  const totalProgress = modules.reduce((sum, module) => sum + module.progress, 0);
  return Math.round(totalProgress / modules.length);
}

export default function CyberForge() {
  const { themeMode } = useTheme();
  // Corrigé pour utiliser le type comme une string
  const isDark = themeMode === 'dark' || themeMode === 'futuristic' || false;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // États
  const [activeTab, setActiveTab] = useState('intro');
  const [userName, setUserName] = useState('');
  const [isNameSet, setIsNameSet] = useState(false);
  const [showEntrySAS, setShowEntrySAS] = useState(true);
  const [authenticationStep, setAuthenticationStep] = useState(0);
  const [avatarSelection, setAvatarSelection] = useState(0);
  const [securityClearance, setSecurityClearance] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [sasAnimationComplete, setSasAnimationComplete] = useState(false);
  const [currentModuleId, setCurrentModuleId] = useState('fundamentals');
  const [moduleSections, setModuleSections] = useState(fundamentalsSections);
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'assistant', content: string}[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    name: '',
    totalProgress: 0,
    moduleProgress: {
      'fundamentals': { completed: false, progress: 0 },
      'network-security': { completed: false, progress: 0 },
      'web-security': { completed: false, progress: 0 },
      'cryptography': { completed: false, progress: 0 },
      'social-engineering': { completed: false, progress: 0 },
      'attack-scenarios': { completed: false, progress: 0 }
    },
    isAdmin: false
  });
  
  // Effet pour charger les données utilisateur (simulé)
  useEffect(() => {
    // Simuler le chargement des données utilisateur depuis le stockage local
    const savedUser = localStorage.getItem('cyberforge_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUserData(parsedUser);
      setUserName(parsedUser.name);
      setIsNameSet(!!parsedUser.name);
      setIsAdmin(parsedUser.isAdmin);
      
      // Générer des recommandations AI basées sur les données utilisateur
      generateAIRecommendations(parsedUser);
    }
  }, []);
  
  // Sauvegarder les données utilisateur
  useEffect(() => {
    if (isNameSet && userName) {
      const updatedUserData = {
        ...userData,
        name: userName
      };
      setUserData(updatedUserData);
      localStorage.setItem('cyberforge_user', JSON.stringify(updatedUserData));
    }
  }, [isNameSet, userName]);
  
  // Générer des recommandations IA (simulation)
  const generateAIRecommendations = (userData: UserData) => {
    // Dans une implémentation réelle, cela serait fait avec une requête API à GPT-4o
    const recommendations: AIRecommendation[] = [];
    
    // Recommandation pour continuer un module commencé
    const inProgressModules = Object.entries(userData.moduleProgress)
      .filter(([_, progress]) => progress.progress > 0 && progress.progress < 100);
    
    if (inProgressModules.length > 0) {
      const [moduleId, progress] = inProgressModules[0];
      const module = modules.find(m => m.id === moduleId);
      if (module) {
        recommendations.push({
          title: `Continuez ${module.title}`,
          message: `Vous avez progressé à ${progress.progress}% dans ce module. Continuez pour renforcer vos connaissances!`,
          moduleId,
          type: 'continue'
        });
      }
    }
    
    // Recommandation pour revisiter un module
    const completedModules = Object.entries(userData.moduleProgress)
      .filter(([_, progress]) => progress.completed);
    
    if (completedModules.length > 0) {
      const [moduleId] = completedModules[0];
      const module = modules.find(m => m.id === moduleId);
      if (module) {
        recommendations.push({
          title: `Revisitez ${module.title}`,
          message: `Un rappel des concepts de ce module vous aidera à renforcer vos connaissances.`,
          moduleId,
          type: 'revisit'
        });
      }
    }
    
    // Recommandation pour un nouveau module
    const unlockedModules = modules.filter(m => {
      if (m.id === 'fundamentals') return true;
      return m.requiredModules.every(reqId => 
        userData.moduleProgress[reqId]?.completed
      );
    }).filter(m => !userData.moduleProgress[m.id]?.completed);
    
    if (unlockedModules.length > 0 && unlockedModules[0].id !== currentModuleId) {
      recommendations.push({
        title: `Découvrez ${unlockedModules[0].title}`,
        message: `Ce module est maintenant disponible et vous aidera à progresser dans votre parcours.`,
        moduleId: unlockedModules[0].id,
        type: 'new'
      });
    }
    
    setAiRecommendations(recommendations);
  };
  
  // Soumettre le quiz
  const submitQuiz = () => {
    if (quizAnswers.length < fundamentalsQuiz.length) {
      toast({
        title: "Quiz incomplet",
        description: "Veuillez répondre à toutes les questions avant de soumettre.",
        variant: "destructive"
      });
      return;
    }
    
    // Calculer le score
    const correctCount = quizAnswers.reduce((count, answer, index) => {
      return count + (answer === fundamentalsQuiz[index].correctAnswer ? 1 : 0);
    }, 0);
    
    const score = Math.round((correctCount / fundamentalsQuiz.length) * 100);
    
    // Mettre à jour la progression du module
    const updatedUserData = {...userData};
    updatedUserData.moduleProgress.fundamentals = {
      ...updatedUserData.moduleProgress.fundamentals,
      progress: Math.max(score, updatedUserData.moduleProgress.fundamentals.progress || 0)
    };
    
    // Vérifier si le score est suffisant pour compléter le module (80% requis)
    if (score >= 80) {
      updatedUserData.moduleProgress.fundamentals.completed = true;
      
      // Les modules avec les fondamentaux comme prérequis seront maintenant accessibles
      // Pas besoin de marquer explicitement les modules comme débloqués car
      // ils sont automatiquement débloqués lorsque leurs prérequis sont complétés
      
      toast({
        title: "Félicitations!",
        description: `Vous avez obtenu ${score}% et complété le module Fondamentaux!`,
      });
    } else {
      toast({
        title: "Quiz terminé",
        description: `Vous avez obtenu ${score}%. Continuez à apprendre pour atteindre 80% et compléter le module.`,
      });
    }
    
    // Calculer la progression totale
    const totalProgress = calculateTotalProgress(updatedUserData.moduleProgress);
    updatedUserData.totalProgress = totalProgress;
    
    setUserData(updatedUserData);
    localStorage.setItem('cyberforge_user', JSON.stringify(updatedUserData));
    setQuizSubmitted(true);
  };
  
  // Calculer la progression totale
  const calculateTotalProgress = (moduleProgress: Record<string, ModuleProgress>) => {
    const moduleCount = modules.length;
    let totalProgress = 0;
    
    for (const module of modules) {
      totalProgress += (moduleProgress[module.id]?.progress || 0);
    }
    
    return Math.round(totalProgress / moduleCount);
  };
  
  // Sélectionner un module
  const selectModule = (moduleId: string) => {
    const isUnlocked = isModuleUnlocked(moduleId);
    
    if (!isUnlocked) {
      toast({
        title: "Module verrouillé",
        description: "Complétez les modules prérequis pour débloquer ce contenu.",
        variant: "destructive"
      });
      return;
    }
    
    setCurrentModuleId(moduleId);
    
    // Dans une implémentation réelle, charger le contenu du module depuis l'API
    if (moduleId === 'fundamentals') {
      setModuleSections(fundamentalsSections);
      setActiveTab('intro');
    } else {
      // Simulation d'un chargement de contenu pour d'autres modules
      // Ce serait récupéré d'une API dans une implémentation réelle
      setModuleSections([
        {
          id: 'intro',
          title: 'Introduction',
          content: `# Introduction à ${modules.find(m => m.id === moduleId)?.title}\n\nCe contenu serait généré dynamiquement par GPT-4o en fonction du module sélectionné.`
        }
      ]);
      setActiveTab('intro');
    }
    
    // Mettre à jour la date d'accès
    const updatedUserData = {...userData};
    updatedUserData.moduleProgress[moduleId] = {
      ...updatedUserData.moduleProgress[moduleId],
      lastAccessed: new Date()
    };
    
    setUserData(updatedUserData);
    localStorage.setItem('cyberforge_user', JSON.stringify(updatedUserData));
  };
  
  // Activer le mode admin
  const toggleAdminMode = () => {
    const newAdminState = !isAdmin;
    setIsAdmin(newAdminState);
    
    const updatedUserData = {...userData, isAdmin: newAdminState};
    setUserData(updatedUserData);
    localStorage.setItem('cyberforge_user', JSON.stringify(updatedUserData));
    
    toast({
      title: newAdminState ? "Mode administrateur activé" : "Mode administrateur désactivé",
      description: newAdminState ? 
        "Vous avez maintenant accès à tous les modules." : 
        "Accès restreint aux modules débloqués uniquement.",
    });
  };
  
  // Envoyer un message au chatbot
  const sendMessage = async () => {
    if (!chatMessage.trim()) return;
    
    const userMessage = { role: 'user' as const, content: chatMessage };
    setChatHistory([...chatHistory, userMessage]);
    setChatMessage('');
    
    // Dans une implémentation réelle, nous enverrions cette requête à GPT-4o
    try {
      // Simulation de réponse (à remplacer par une vraie requête à Azure OpenAI)
      setTimeout(() => {
        // Réponse simulée
        let responseContent = "";
        
        if (chatMessage.toLowerCase().includes("triade")) {
          responseContent = "La triade CIA (Confidentialité, Intégrité, Disponibilité) constitue les trois piliers fondamentaux de la cybersécurité. Chaque mesure de sécurité vise à protéger au moins l'un de ces aspects.";
        } else if (chatMessage.toLowerCase().includes("ransomware")) {
          responseContent = "Le ransomware est un type de malware qui chiffre vos données et exige une rançon pour les déchiffrer. La meilleure protection est d'avoir des sauvegardes régulières et sécurisées, et de former les utilisateurs à reconnaître les menaces.";
        } else {
          responseContent = "Je suis votre assistant CyberForge. Je peux vous aider à comprendre les concepts de cybersécurité, à préparer vos quiz, ou à explorer davantage un sujet particulier. N'hésitez pas à poser des questions spécifiques!";
        }
        
        setChatHistory(prev => [...prev, {
          role: 'assistant',
          content: responseContent
        }]);
      }, 1000);
      
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la communication avec l'assistant AI.",
        variant: "destructive"
      });
    }
  };
  
  // Définir un nom d'utilisateur
  const setName = () => {
    if (!userName.trim()) return;
    
    setIsNameSet(true);
    toast({
      title: "Bienvenue!",
      description: `Bonjour ${userName}, bienvenue dans CyberForge Academy!`,
    });
  };
  
  // Fonctions pour le SAS d'entrée
  const advanceAuthStep = () => {
    if (authenticationStep < 3) {
      setAuthenticationStep(prev => prev + 1);
    } else {
      // Animation finale avant d'accéder à la plateforme
      setSasAnimationComplete(true);
      
      // Délai pour l'animation de transition
      setTimeout(() => {
        setShowEntrySAS(false);
      }, 2000);
    }
  };
  
  const validateAccessCode = () => {
    // Simulation de vérification - dans une vraie implémentation, cela serait validé côté serveur
    if (accessCode === '1337' || accessCode === 'CYBER' || isAdmin) {
      toast({
        title: "Authentification réussie",
        description: "Code d'accès validé. Accès au niveau suivant autorisé.",
      });
      advanceAuthStep();
    } else {
      toast({
        title: "Authentification échouée",
        description: "Code d'accès invalide. Veuillez réessayer.",
        variant: "destructive"
      });
    }
  };
  
  const selectAvatar = (index: number) => {
    setAvatarSelection(index);
    toast({
      title: "Avatar sélectionné",
      description: "Votre profil visuel a été mis à jour.",
    });
  };
  
  const selectClearanceLevel = (level: string) => {
    setSecurityClearance(level);
    toast({
      title: "Niveau d'habilitation défini",
      description: `Votre niveau d'habilitation a été défini à: ${level}`,
    });
    advanceAuthStep();
  };
  
  // Le module actuellement sélectionné
  const currentModule = modules.find(m => m.id === currentModuleId);
  
  // États pour les simulations immersives
  const [showSimulation, setShowSimulation] = useState(false);
  const [activeSimulation, setActiveSimulation] = useState<SimulationScenario | null>(null);
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [simulationStep, setSimulationStep] = useState(0);
  const [simulationLog, setSimulationLog] = useState<string[]>([]);
  const [currentScenarios, setCurrentScenarios] = useState<SimulationScenario[]>([]);
  const [terminalOutput, setTerminalOutput] = useState<string>('');
  const [userInput, setUserInput] = useState<string>('');
  const [showAiExplainer, setShowAiExplainer] = useState(false);
  const [aiExplanation, setAiExplanation] = useState('');
  const [isAiResponding, setIsAiResponding] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  
  // Effet de matrice pour le fond
  useEffect(() => {
    if (!isDark) return;
    
    const canvas = document.getElementById('matrix-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Ajustement du canvas à la taille de la fenêtre
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Symboles pour l'effet matrice (caractères 0 et 1, et caractères spéciaux)
    const symbols = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン><+-*/|[]{}=:;,.?!@#$%^&*()_';
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    
    // Position Y de chaque colonne
    const drops: number[] = [];
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100;
    }
    
    // Fonction pour dessiner l'effet
    const drawMatrix = () => {
      // Fond semi-transparent pour créer l'effet de traînée
      ctx.fillStyle = 'rgba(0, 10, 20, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Définition de la police et couleur pour les symboles
      ctx.font = `${fontSize}px monospace`;
      
      // Dessin des symboles pour chaque colonne
      for (let i = 0; i < drops.length; i++) {
        // Récupération d'un symbole aléatoire
        const text = symbols[Math.floor(Math.random() * symbols.length)];
        
        // Variation aléatoire de couleur pour un effet plus cyberpunk
        if (Math.random() > 0.98) {
          ctx.fillStyle = 'rgba(0, 255, 255, 0.8)'; // Cyan brillant (rare)
        } else if (Math.random() > 0.95) {
          ctx.fillStyle = 'rgba(0, 255, 170, 0.6)'; // Vert-cyan (occasionnel)
        } else {
          // Dégradé de vert à bleu pour la majorité des caractères
          ctx.fillStyle = `rgba(0, ${Math.floor(150 + Math.random() * 105)}, ${Math.floor(100 + Math.random() * 50)}, 0.6)`;
        }
        
        // Dessin du symbole à sa position
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        
        // Réinitialisation de la position si elle atteint le bas ou aléatoirement
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.98) {
          drops[i] = 0;
        }
        
        // Déplacement vers le bas
        drops[i]++;
      }
    };
    
    // Animation avec requestAnimationFrame
    let animationId: number;
    const animate = () => {
      drawMatrix();
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    // Nettoyage
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [isDark]);

  // Effet pour défiler automatiquement le terminal vers le bas
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalOutput]);
  
  // Vérifier si un module est débloqué
  const isModuleUnlocked = (moduleId: string) => {
    if (isAdmin || moduleId === 'fundamentals') return true;
    
    const module = modules.find(m => m.id === moduleId);
    if (!module) return false;
    
    return module.requiredModules.every(reqId => userData.moduleProgress[reqId]?.completed);
  };
  
  // Démarrer une simulation pour un module
  const startSimulation = (moduleId: string) => {
    // Obtenir les scénarios correspondants au module
    let scenarios: SimulationScenario[] = [];
    
    switch(moduleId) {
      case 'network-security':
        scenarios = networkSecuritySimulations;
        break;
      case 'web-security':
        scenarios = webSecuritySimulations;
        break;
      default:
        toast({
          title: "Simulation non disponible",
          description: "Les simulations pour ce module ne sont pas encore disponibles.",
          variant: "destructive"
        });
        return;
    }
    
    setCurrentScenarios(scenarios);
    setShowSimulation(true);
    setActiveSimulation(null);
    setSimulationStep(0);
    setSimulationLog([]);
    setTerminalOutput('');
  };
  
  // Lancer une simulation spécifique
  const launchSimulation = (scenario: SimulationScenario) => {
    setActiveSimulation(scenario);
    setSimulationStep(1);
    setSimulationProgress(0);
    setSimulationLog([
      "Initialisation de l'environnement de simulation...",
      "Préparation des assets...",
      "Chargement des outils virtuels...",
      "Environnement prêt pour la simulation."
    ]);
    
    // Simulation d'un terminal avec output
    setTerminalOutput(`
$ cyberforge-sim --init --scenario="${scenario.id}" --difficulty=${scenario.difficulty}
[+] Initializing CyberForge simulation environment...
[+] Loading scenario: ${scenario.title}
[+] Setting up virtual network and systems...
[+] Installing required tools and dependencies...
[+] Environment ready. Type 'help' for available commands.

cyberforge@simulation:~$ _
    `);
  };
  
  // Simuler une entrée dans le terminal
  const processTerminalInput = () => {
    if (!userInput.trim()) return;
    
    const input = userInput;
    setUserInput('');
    
    const newTerminalOutput = terminalOutput + `\ncyberforge@simulation:~$ ${input}\n`;
    
    // Simuler différentes commandes
    let response = '';
    
    if (input === 'help') {
      response = `
Available commands:
  scan <target>     - Scan a target for vulnerabilities
  exploit <id>      - Attempt to exploit a vulnerability
  analyze <file>    - Analyze a suspicious file
  monitor           - Monitor network traffic
  status            - Check mission objectives status
  explain <topic>   - Get AI explanation on a cybersecurity topic
  help              - Show this help message
`;
    } else if (input.startsWith('scan')) {
      response = `
[*] Starting scan on target system...
[*] Scanning ports...
[+] Open ports found: 22 (SSH), 80 (HTTP), 443 (HTTPS), 3306 (MySQL)
[*] Enumerating services...
[+] SSH service: OpenSSH 7.6p1
[+] Web server: nginx 1.18.0
[+] Found potential vulnerabilities:
    - CVE-2021-3156 (Sudo vulnerability)
    - CVE-2021-44228 (Log4j vulnerability)
[*] Scan complete. Use 'exploit' command to attempt exploitation.
`;
      // Avancer la simulation
      setSimulationProgress(25);
      setSimulationLog(prev => [...prev, "Scan réseau effectué avec succès."]);
    } else if (input.startsWith('exploit')) {
      response = `
[*] Attempting to exploit vulnerability...
[*] Preparing payload...
[*] Executing exploit...
[+] Exploitation successful!
[+] Gained access to target system with limited privileges.
[*] Enumerating system...
[+] Found sensitive files in /var/www/html/backup/
[*] Next steps: Try to escalate privileges or extract sensitive data.
`;
      // Avancer la simulation
      setSimulationProgress(50);
      setSimulationLog(prev => [...prev, "Exploitation réussie avec privilèges limités."]);
    } else if (input.startsWith('analyze')) {
      response = `
[*] Analyzing file...
[*] Running static analysis...
[*] Checking signatures...
[+] File identified as potential ransomware
[+] MD5: 8f7dd78e9bc2529eb9ad6aa43cbe60c1
[+] SHA1: 4b34c93a8c30a9a3b9ac7f3fb3c3d745f23c9c67
[+] Identified as part of "BlackCat" ransomware family
[*] Analysis complete. Take appropriate countermeasures.
`;
      // Avancer la simulation
      setSimulationProgress(75);
      setSimulationLog(prev => [...prev, "Analyse de fichier complétée. Ransomware identifié."]);
    } else if (input === 'monitor') {
      response = `
[*] Starting network traffic monitoring...
[*] Capturing packets...
[+] Unusual traffic detected:
    - Large data transfer to external IP: 187.45.23.67
    - Encrypted communication on non-standard port 8443
    - Multiple failed authentication attempts from 203.87.123.5
[*] Potential data exfiltration in progress!
[*] Recommended action: Block suspicious IPs and investigate affected systems.
`;
      // Avancer la simulation
      setSimulationProgress(90);
      setSimulationLog(prev => [...prev, "Trafic suspect détecté. Exfiltration de données probable."]);
    } else if (input === 'status') {
      response = `
[*] Mission objectives status:
    - Identify vulnerabilities: COMPLETED
    - Gain initial access: COMPLETED
    - Analyze malware sample: ${simulationProgress >= 75 ? 'COMPLETED' : 'PENDING'}
    - Detect data exfiltration: ${simulationProgress >= 90 ? 'COMPLETED' : 'PENDING'}
    - Secure compromised system: PENDING
    
[*] Overall progress: ${simulationProgress}%
`;
    } else if (input.startsWith('explain')) {
      setShowAiExplainer(true);
      setIsAiResponding(true);
      const topic = input.replace('explain', '').trim();
      
      // Simuler une réponse GPT-4o (dans une implémentation réelle, ça serait une requête API)
      setTimeout(() => {
        setIsAiResponding(false);
        
        if (topic === 'ransomware') {
          setAiExplanation(`
# Ransomware Expliqué

Les ransomwares sont des logiciels malveillants qui chiffrent les fichiers des victimes, rendant leurs systèmes ou données inaccessibles, puis exigent une rançon pour les déchiffrer.

## Comment fonctionnent les ransomwares

1. **Infection** - Se propage souvent via des pièces jointes de phishing, des téléchargements malveillants ou des vulnérabilités logicielles.

2. **Chiffrement** - Une fois à l'intérieur du système, le ransomware identifie et chiffre les fichiers précieux avec un algorithme de chiffrement puissant.

3. **Extorsion** - Après le chiffrement, une note de rançon s'affiche exigeant un paiement (généralement en cryptomonnaie) en échange de la clé de déchiffrement.

## Mesures de protection

- Sauvegardes régulières et hors ligne
- Filtrage des emails et formation à la sensibilisation
- Application des correctifs et mises à jour
- Principe du moindre privilège
- Solutions de sécurité avancées

## Tendances récentes

Les attaques modernes de "double extorsion" volent d'abord les données, puis les chiffrent - menaçant de publier les informations sensibles si la rançon n'est pas payée.
          `);
        } else if (topic === 'mitm') {
          setAiExplanation(`
# Attaques Man-in-the-Middle (MITM)

Une attaque Man-in-the-Middle se produit lorsqu'un attaquant s'insère secrètement dans une communication entre deux parties.

## Fonctionnement

1. **Interception** - L'attaquant intercepte le trafic réseau entre la victime et sa destination.

2. **Déchiffrement** - Si la communication est chiffrée, l'attaquant tente de la déchiffrer.

3. **Modification/Surveillance** - L'attaquant peut lire ou modifier les données en transit.

4. **Retransmission** - Les données sont retransmises (potentiellement modifiées) à la destination originale.

## Techniques courantes

- **ARP Spoofing** - Associe l'adresse MAC de l'attaquant à l'adresse IP d'un hôte légitime
- **DNS Spoofing** - Redirige le trafic en falsifiant les réponses DNS
- **SSL Stripping** - Dégrade les connexions HTTPS en HTTP non sécurisé
- **Wi-Fi Frauduleux** - Création de points d'accès malveillants

## Mesures de protection

- Utilisation de HTTPS avec HSTS
- Vérification des certificats
- VPN sécurisés
- Authentification à deux facteurs
          `);
        } else {
          setAiExplanation(`
# ${topic.charAt(0).toUpperCase() + topic.slice(1)}

Je n'ai pas d'information spécifique sur ce sujet dans ma base de connaissances actuelle. Voici quelques ressources générales sur la cybersécurité que vous pourriez consulter:

- OWASP (Open Web Application Security Project)
- NIST Cybersecurity Framework
- MITRE ATT&CK Framework
- SANS Institute Resources

Pour des informations précises sur ce sujet, je vous recommande de consulter ces sources ou de reformuler votre demande avec plus de détails.
          `);
        }
      }, 1500);
      
      response = `[*] Demande d'explication IA envoyée. Génération de contenu en cours...`;
    } else {
      response = `Command not found: ${input}. Type 'help' for available commands.`;
    }
    
    // Ajoute la réponse au terminal avec un délai pour simuler le traitement
    setTimeout(() => {
      setTerminalOutput(newTerminalOutput + response + '\ncyberforge@simulation:~$ _');
    }, 300);
  };
  
  // Compléter une simulation
  const completeSimulation = () => {
    if (!activeSimulation) return;
    
    // Mise à jour du score et progression
    const updatedUserData = {...userData};
    const currentModuleProgress = updatedUserData.moduleProgress[currentModuleId] || { 
      completed: false, progress: 0 
    };
    
    // Ajouter des points pour compléter la simulation
    const newProgress = Math.min(100, currentModuleProgress.progress + 20);
    updatedUserData.moduleProgress[currentModuleId] = {
      ...currentModuleProgress,
      progress: newProgress,
      completed: newProgress >= 100
    };
    
    // Calculer la progression totale
    const totalProgress = calculateTotalProgress(updatedUserData.moduleProgress);
    updatedUserData.totalProgress = totalProgress;
    
    setUserData(updatedUserData);
    localStorage.setItem('cyberforge_user', JSON.stringify(updatedUserData));
    
    toast({
      title: "Simulation terminée",
      description: `Vous avez gagné ${activeSimulation.completionReward} points de compétence!`,
    });
    
    // Retour à la liste des simulations
    setShowSimulation(true);
    setActiveSimulation(null);
    setSimulationStep(0);
    
    // Marquer le module comme complété si 100% atteint
    if (newProgress >= 100) {
      updatedUserData.moduleProgress[currentModuleId].completed = true;
      // Les autres modules seront automatiquement accessibles
      // car nous vérifions les prérequis complétés via isModuleUnlocked
      
      setUserData(updatedUserData);
      localStorage.setItem('cyberforge_user', JSON.stringify(updatedUserData));
    }
  };
  
  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} relative`}>
      {/* Canvas pour effet matrice cybernétique */}
      {isDark && <canvas id="matrix-canvas" className="fixed inset-0 z-0 opacity-25 pointer-events-none" />}
      {/* Sidebar navigation - Version améliorée avec effets futuristes */}
      <div className={`w-72 flex-shrink-0 relative ${isDark ? 'bg-gray-800' : 'bg-white'} border-r ${isDark ? 'border-blue-900/50' : 'border-gray-200'}`}>
        {/* Background effect for dark theme */}
        {isDark && (
          <div className="absolute inset-0 overflow-hidden opacity-20">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/20 rounded-full filter blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/20 rounded-full filter blur-3xl"></div>
            {/* Grid pattern */}
            <div className="absolute inset-0 opacity-30">
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="smallGrid" width="8" height="8" patternUnits="userSpaceOnUse">
                    <path d="M 8 0 L 0 0 0 8" fill="none" stroke="rgba(59, 130, 246, 0.2)" strokeWidth="0.5" />
                  </pattern>
                  <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
                    <rect width="80" height="80" fill="url(#smallGrid)" />
                    <path d="M 80 0 L 0 0 0 80" fill="none" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>
          </div>
        )}
        
        <div className="p-5 relative z-10">
          <div className="flex justify-between items-center mb-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className={isDark ? 'hover:bg-blue-900/20' : ''}>
                <ArrowLeft className={`h-5 w-5 ${isDark ? 'text-blue-400' : ''}`} />
              </Button>
            </Link>
            <h1 className={isDark 
              ? "text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 tracking-wide" 
              : "text-xl font-bold text-blue-600"
            }>
              CyberForge Academy
            </h1>
          </div>
          
          {isNameSet ? (
            <div className={`p-4 mb-4 rounded-lg ${isDark ? 'bg-gray-900/80 border border-blue-900/50' : 'bg-blue-50 border border-blue-100'}`}>
              <div className="flex items-center mb-2">
                <User className={`h-5 w-5 mr-2 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
                <span className="font-medium">{userName}</span>
              </div>
              <div className="flex flex-col space-y-1">
                <div className="flex justify-between text-xs">
                  <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Progression totale</span>
                  <span className={isDark ? 'text-blue-300' : 'text-blue-600'}>{userData.totalProgress}%</span>
                </div>
                <div className="relative">
                  <Progress 
                    value={userData.totalProgress} 
                    className={`h-2 ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`} 
                  />
                  {isDark && (
                    <div className="absolute inset-0 overflow-hidden">
                      <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-indigo-500" style={{ width: `${userData.totalProgress}%` }}></div>
                      <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-400/30 to-indigo-400/30 animate-pulse" style={{ width: `${userData.totalProgress}%` }}></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className={`p-4 mb-4 rounded-lg ${isDark ? 'bg-gray-900/80 border border-blue-900/50' : 'bg-blue-50 border border-blue-100'}`}>
              <label className={`text-sm font-medium mb-1 block ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Votre nom d'agent cyber</label>
              <div className="flex space-x-2">
                <Input 
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Entrez votre nom"
                  className={isDark ? 'bg-gray-800 border-gray-700 placeholder:text-gray-500' : ''}
                />
                <Button size="sm" className={isDark ? 'bg-blue-600 hover:bg-blue-700' : ''} onClick={setName}>OK</Button>
              </div>
            </div>
          )}
          
          {/* Module list with enhanced visuals */}
          <div className="space-y-2">
            {modules.map((module) => {
              const isUnlocked = isModuleUnlocked(module.id);
              const progress = userData.moduleProgress[module.id]?.progress || 0;
              const isCompleted = userData.moduleProgress[module.id]?.completed || false;
              
              return (
                <div
                  key={module.id}
                  className={`relative overflow-hidden ${
                    !isUnlocked && !isAdmin ? 'opacity-70 grayscale' : ''
                  }`}
                >
                  <button
                    className={`w-full flex items-center p-3 rounded-lg ${
                      currentModuleId === module.id 
                        ? isDark 
                          ? 'bg-blue-900/40 text-blue-100 border border-blue-800/80 holo-element holo-card' 
                          : 'bg-blue-100 text-blue-900 border border-blue-200'
                        : isUnlocked || isAdmin
                          ? isDark 
                            ? 'bg-gray-900/60 hover:bg-gray-800/60 text-gray-100 border border-gray-700/50 hover:holo-element transition-all duration-300' 
                            : 'bg-white hover:bg-gray-50 text-gray-800 border border-gray-200'
                          : isDark 
                            ? 'bg-gray-900/40 text-gray-400 border border-gray-800/30' 
                            : 'bg-gray-50 text-gray-400 border border-gray-200'
                    }`}
                    onClick={() => selectModule(module.id)}
                    disabled={!isUnlocked && !isAdmin}
                  >
                    {/* Module icon with glow effect on dark theme */}
                    <div className={`relative flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-md ${module.color} ${isDark ? 'bg-opacity-20' : 'bg-opacity-10'} mr-3 ${isDark && currentModuleId === module.id ? 'shadow-glow' : ''}`}>
                      {isDark && (
                        <div className="absolute inset-0 rounded-md bg-opacity-40 bg-gradient-to-br from-white/5 to-white/0"></div>
                      )}
                      {isDark ? module.icon : <span className="text-lg">{module.iconEmoji}</span>}
                    </div>
                    
                    <div className="flex-1 text-left overflow-hidden">
                      <div className="flex items-center justify-between">
                        <span className={`font-medium truncate ${isDark && currentModuleId === module.id ? 'text-blue-300' : ''}`}>
                          {module.title}
                        </span>
                        <div className="flex items-center ml-1">
                          {!isUnlocked && !isAdmin && (
                            <LockIcon className="h-3.5 w-3.5 ml-1 text-gray-400" />
                          )}
                          {isCompleted && (
                            <CheckCircle className="h-3.5 w-3.5 ml-1 text-green-500" />
                          )}
                          {module.hasLiveSimulation && isUnlocked && (
                            <span className={`ml-1 flex items-center rounded-full px-1.5 text-[10px] font-medium ${
                              isDark ? 'bg-indigo-950 text-white border border-indigo-800/50' : 'bg-indigo-50 text-indigo-900 border border-indigo-200'
                            }`}>
                              SIM
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center mt-1">
                        <div className="flex-1 mr-2">
                          <div className={`relative w-full h-1.5 ${isDark ? 'bg-gray-800' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                            <div 
                              className={`absolute top-0 left-0 h-full rounded-full ${isDark ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-blue-600'}`} 
                              style={{ width: `${progress}%` }} 
                            />
                            {isDark && isUnlocked && (
                              <div 
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-400/30 to-indigo-400/30 rounded-full animate-pulse" 
                                style={{ width: `${progress}%` }} 
                              />
                            )}
                          </div>
                        </div>
                        <span className={`text-xs flex-shrink-0 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {progress}%
                        </span>
                      </div>
                    </div>
                  </button>
                  
                  {module.hasLiveSimulation && isUnlocked && (
                    <button
                      className={`absolute right-3 bottom-3 p-1 rounded-full ${
                        isDark 
                          ? 'bg-indigo-900/50 text-white hover:bg-indigo-800/50' 
                          : 'bg-indigo-100 text-indigo-900 hover:bg-indigo-200'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        startSimulation(module.id);
                      }}
                      title="Lancer une simulation"
                    >
                      <PlayCircle className="h-4 w-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="mt-8 pt-4 border-t border-gray-700/50">
            <button
              className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                isAdmin 
                  ? isDark ? 'bg-green-900/20 text-green-300 border border-green-800/50' : 'bg-green-100 text-green-800 border border-green-200'
                  : isDark ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
              }`}
              onClick={toggleAdminMode}
            >
              <Settings className="inline-block h-4 w-4 mr-2" />
              {isAdmin ? 'Désactiver' : 'Activer'} le mode admin
            </button>
          </div>
        </div>
      </div>
      
      {/* Main content area */}
      {showSimulation ? (
        // Mode Simulation
        <div className="flex-1 flex flex-col">
          {/* Simulation header */}
          <header className={`py-4 px-6 ${isDark ? 'bg-gray-800/80 backdrop-blur-sm border-b border-gray-700' : 'bg-white border-b border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setShowSimulation(false)}
                  className={isDark ? 'hover:bg-gray-700' : ''}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="ml-3">
                  <h1 className="text-xl font-bold">Simulations {currentModule?.title}</h1>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Mettez vos compétences à l'épreuve dans des environnements réalistes
                  </p>
                </div>
              </div>
            </div>
          </header>
          
          {/* Simulation content */}
          <div className="flex-1 p-6 overflow-auto">
            {!activeSimulation ? (
              // Liste des simulations disponibles
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {currentScenarios.map((scenario) => (
                  <div 
                    key={scenario.id}
                    className={`rounded-lg overflow-hidden ${
                      isDark 
                        ? 'bg-gray-800/80 border border-gray-700 hover:border-blue-700/50' 
                        : 'bg-white border border-gray-200 hover:border-blue-300'
                    } transition-all duration-300 hover:shadow-lg cursor-pointer group`}
                    onClick={() => launchSimulation(scenario)}
                  >
                    <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div className="flex justify-between items-start mb-3">
                        <h3 className={`text-lg font-semibold ${isDark ? 'text-blue-400 group-hover:text-blue-300' : 'text-blue-600'}`}>
                          {scenario.title}
                        </h3>
                        <Badge className={`${
                          scenario.difficulty === 'débutant' 
                            ? isDark ? 'bg-green-900/50 text-white border-green-800' : 'bg-green-100 text-green-900 border-green-200'
                            : scenario.difficulty === 'intermédiaire'
                              ? isDark ? 'bg-blue-900/50 text-white border-blue-800' : 'bg-blue-100 text-blue-900 border-blue-200'
                              : scenario.difficulty === 'avancé'
                                ? isDark ? 'bg-amber-900/50 text-white border-amber-800' : 'bg-amber-100 text-amber-900 border-amber-200'
                                : isDark ? 'bg-red-900/50 text-white border-red-800' : 'bg-red-100 text-red-900 border-red-200'
                        }`}>
                          {scenario.difficulty}
                        </Badge>
                      </div>
                      
                      <p className={`text-sm mb-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {scenario.description}
                      </p>
                      
                      <div className="flex items-center text-xs">
                        <Clock8 className="h-3.5 w-3.5 mr-1.5" />
                        <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                          {scenario.duration}
                        </span>
                      </div>
                    </div>
                    
                    <div className={`p-4 ${isDark ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                      <h4 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Objectifs:
                      </h4>
                      <ul className="space-y-1.5">
                        {scenario.objectives.map((objective, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle className={`h-4 w-4 mt-0.5 mr-2 flex-shrink-0 ${isDark ? 'text-blue-500' : 'text-blue-600'}`} />
                            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {objective}
                            </span>
                          </li>
                        ))}
                      </ul>
                      
                      <div className={`mt-4 p-3 rounded-md ${isDark ? 'bg-blue-900/20 border border-blue-900/50' : 'bg-blue-50 border border-blue-100'}`}>
                        <div className="flex items-center">
                          <Star className={`h-4 w-4 mr-2 ${isDark ? 'text-white' : 'text-blue-800'}`} />
                          <span className={`text-xs font-medium ${isDark ? 'text-white' : 'text-blue-900'}`}>
                            Récompense: {scenario.completionReward} points de compétence
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Simulation active
              <div className="flex flex-col h-full">
                {/* Progress bar and info */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h2 className={`text-xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                      {activeSimulation.title}
                    </h2>
                    <Badge className={`${
                      activeSimulation.difficulty === 'débutant' 
                        ? isDark ? 'bg-green-900/50 text-white border-green-800' : 'bg-green-100 text-green-900 border-green-200'
                        : activeSimulation.difficulty === 'intermédiaire'
                          ? isDark ? 'bg-blue-900/50 text-white border-blue-800' : 'bg-blue-100 text-blue-900 border-blue-200'
                          : activeSimulation.difficulty === 'avancé'
                            ? isDark ? 'bg-amber-900/50 text-white border-amber-800' : 'bg-amber-100 text-amber-900 border-amber-200'
                            : isDark ? 'bg-red-900/50 text-white border-red-800' : 'bg-red-100 text-red-900 border-red-200'
                    }`}>
                      {activeSimulation.difficulty}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs mb-2">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                      Progression: {simulationProgress}%
                    </span>
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                      {activeSimulation.objectives.length} objectifs
                    </span>
                  </div>
                  
                  <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`absolute top-0 left-0 h-full ${
                        isDark 
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600' 
                          : 'bg-blue-600'
                      }`}
                      style={{ width: `${simulationProgress}%` }}
                    ></div>
                    {isDark && (
                      <div 
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-400/30 to-indigo-400/30 animate-pulse" 
                        style={{ width: `${simulationProgress}%` }}
                      ></div>
                    )}
                  </div>
                </div>
                
                {/* Simulation interface */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                  {/* Simulation terminal - 2/3 width on larger screens */}
                  <div className={`md:col-span-2 rounded-lg overflow-hidden border ${
                    isDark ? 'bg-gray-950 border-gray-800' : 'bg-black border-gray-300'
                  }`}>
                    <div className={`px-4 py-2 ${isDark ? 'bg-gray-900' : 'bg-gray-800'} flex items-center justify-between`}>
                      <div className="flex items-center">
                        <div className="flex space-x-2 mr-3">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        </div>
                        <span className="text-xs text-gray-300">Terminal - CyberForge Simulation</span>
                      </div>
                    </div>
                    
                    <div className="cyber-terminal p-4 h-[400px] overflow-auto font-mono text-sm relative" ref={terminalRef}>
                      <div className="absolute top-0 left-0 right-0 flex justify-between px-3 py-1 bg-black/80 text-xs text-cyan-400 border-b border-cyan-800 backdrop-blur-sm z-10">
                        <div className="flex items-center">
                          <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-2 hover:animate-pulse"></span>
                          <span className="inline-block w-3 h-3 rounded-full bg-yellow-500 mr-2 hover:animate-pulse"></span>
                          <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2 hover:animate-pulse"></span>
                          <span className="ml-2 tracking-wide text-glitch" data-text="CyberForge v3.7 :: Simulation Terminal">CyberForge v3.7 :: Simulation Terminal</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-xs tracking-wider mr-3 holo-element px-2 py-0.5 rounded text-green-300">[SECURE CONNECTION]</span>
                          <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        </div>
                      </div>
                      
                      {/* Scanner line effect */}
                      <div className="absolute top-7 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-75 z-20" style={{
                        animation: 'terminal-scan 3s linear infinite',
                      }}></div>
                      
                      {/* Scattered glitch elements that appear randomly */}
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div 
                          key={i}
                          className="terminal-glitch absolute z-10"
                          style={{
                            width: `${Math.random() * 100 + 50}px`,
                            height: `${Math.random() * 5 + 2}px`,
                            top: `${Math.random() * 380}px`,
                            left: `${Math.random() * 100}%`,
                            opacity: Math.random() * 0.5 + 0.2,
                            animationDelay: `${i * 2 + Math.random() * 5}s`,
                            animationDuration: '0.2s',
                          }}
                        ></div>
                      ))}
                      
                      <div className="mt-6">
                        <pre className="whitespace-pre-wrap terminal-text">{terminalOutput}</pre>
                      </div>
                    </div>
                    
                    <div className={`p-3 border-t ${isDark ? 'border-gray-800' : 'border-gray-700'}`}>
                      <div className="flex items-center">
                        <span className="text-green-400 mr-2">$</span>
                        <input
                          type="text"
                          value={userInput}
                          onChange={(e) => setUserInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && processTerminalInput()}
                          className="flex-1 bg-transparent outline-none text-green-400 font-mono"
                          placeholder="Entrez une commande..."
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Simulation info panel - 1/3 width on larger screens */}
                  <div className="flex flex-col space-y-4">
                    {/* Mission objectives */}
                    <div className={`rounded-lg ${
                      isDark 
                        ? 'bg-gray-800/80 border border-gray-700' 
                        : 'bg-white border border-gray-200'
                    }`}>
                      <div className={`p-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                        <h3 className="font-medium">Objectifs de la mission</h3>
                      </div>
                      <div className="p-3">
                        <ul className="space-y-2">
                          {activeSimulation.objectives.map((objective, index) => (
                            <li key={index} className="flex items-start">
                              {simulationProgress >= (index + 1) * (100 / activeSimulation.objectives.length) ? (
                                <CheckCircle className={`h-4 w-4 mt-0.5 mr-2 ${isDark ? 'text-green-500' : 'text-green-600'}`} />
                              ) : (
                                <Circle className={`h-4 w-4 mt-0.5 mr-2 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                              )}
                              <span className={`text-sm ${
                                simulationProgress >= (index + 1) * (100 / activeSimulation.objectives.length)
                                  ? isDark ? 'text-gray-300' : 'text-gray-700'
                                  : isDark ? 'text-gray-500' : 'text-gray-500'
                              }`}>
                                {objective}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    {/* Simulation activity log */}
                    <div className={`rounded-lg flex-1 ${
                      isDark 
                        ? 'bg-gray-800/80 border border-gray-700' 
                        : 'bg-white border border-gray-200'
                    }`}>
                      <div className={`p-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                        <h3 className="font-medium">Journal d'activité</h3>
                      </div>
                      <div className="p-3 overflow-auto max-h-[200px]">
                        {simulationLog.length > 0 ? (
                          <ul className="space-y-2">
                            {simulationLog.map((log, index) => (
                              <li key={index} className="flex items-start text-sm">
                                <span className={`font-mono mr-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                                  [{index + 1}]
                                </span>
                                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                                  {log}
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                            Aucune activité enregistrée
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Complete simulation button */}
                    <Button 
                      className={isDark ? 'bg-blue-600 hover:bg-blue-700' : ''}
                      disabled={simulationProgress < 90}
                      onClick={completeSimulation}
                    >
                      Terminer la simulation
                    </Button>
                    
                    <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                      <InfoIcon className="h-3.5 w-3.5 inline-block mr-1" />
                      Complétez au moins 90% des objectifs pour terminer la simulation
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Mode normal - affichage du contenu du module
        <div className="flex-1 flex flex-col">
          {/* Module header with enhanced visuals */}
          <header className={`py-4 px-6 relative ${isDark ? 'bg-gray-800/80 backdrop-blur-sm border-b border-gray-700' : 'bg-white border-b border-gray-200'}`}>
            {/* Header background effect - only in dark mode */}
            {isDark && (
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
                <div className="absolute -top-40 -right-20 w-60 h-60 bg-blue-500/5 rounded-full filter blur-3xl"></div>
              </div>
            )}
            
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-md ${currentModule?.color} ${isDark ? 'bg-opacity-20' : 'bg-opacity-10'} mr-3 ${isDark ? 'shadow-glow' : ''}`}>
                  {isDark ? currentModule?.icon : <span className="text-2xl">{currentModule?.iconEmoji}</span>}
                </div>
                <div>
                  <h1 className={`text-xl font-bold ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                    {currentModule?.title}
                  </h1>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {currentModule?.description}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {currentModule?.hasLiveSimulation && (
                  <Button 
                    variant={isDark ? "outline" : "secondary"}
                    size="sm"
                    className={isDark ? 'border-blue-800 bg-blue-900/20 text-white hover:bg-blue-900/40 hover:text-white' : ''}
                    onClick={() => startSimulation(currentModuleId)}
                  >
                    <PlayCircle className="h-4 w-4 mr-1.5" />
                    Simulation
                  </Button>
                )}
                
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setIsChatOpen(!isChatOpen)}
                  className={isChatOpen ? (isDark ? 'bg-blue-900/30 text-white' : 'bg-blue-100 text-blue-900') : ''}
                >
                  <MessageCircle className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </header>
          
          {/* Main content area with enhanced styling */}
          <div className="flex-1 p-6 overflow-auto flex">
            <div className="flex-1">
              {currentModuleId === 'fundamentals' ? (
                <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className={`mb-4 ${isDark ? 'bg-gray-800/70' : ''}`}>
                    {moduleSections.map((section) => (
                      <TabsTrigger key={section.id} value={section.id} className={isDark ? 'data-[state=active]:bg-gray-700' : ''}>
                        {section.title}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      {moduleSections.map((section) => (
                        <TabsContent key={section.id} value={section.id} className="outline-none">
                          {section.id === 'quiz' ? (
                            <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800/70 border border-gray-700' : 'bg-white border border-gray-200'}`}>
                              <h2 className="text-xl font-bold mb-4">Quiz sur les fondamentaux</h2>
                              <p className="mb-6 text-sm">Testez vos connaissances sur les concepts fondamentaux de la cybersécurité.</p>
                              
                              <div className="space-y-6">
                                {fundamentalsQuiz.map((question, qIndex) => (
                                  <div 
                                    key={qIndex} 
                                    className={`p-4 rounded-lg border ${
                                      quizSubmitted 
                                        ? quizAnswers[qIndex] === question.correctAnswer
                                          ? isDark ? 'border-green-600 bg-green-900/20' : 'border-green-500 bg-green-50'
                                          : isDark ? 'border-red-600 bg-red-900/20' : 'border-red-500 bg-red-50'
                                        : isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200'
                                    }`}
                                  >
                                    <h3 className="font-medium mb-3">Question {qIndex + 1}: {question.question}</h3>
                                    <div className="space-y-2">
                                      {question.options.map((option, oIndex) => (
                                        <label 
                                          key={oIndex}
                                          className={`flex items-center p-3 rounded-md cursor-pointer ${
                                            quizAnswers[qIndex] === oIndex
                                              ? isDark ? 'bg-blue-900/40 border border-blue-700' : 'bg-blue-100 border border-blue-300'
                                              : isDark ? 'bg-gray-900/80 hover:bg-gray-700/80 border border-gray-700' : 'bg-gray-100 hover:bg-gray-200 border border-gray-200'
                                          } ${
                                            quizSubmitted && oIndex === question.correctAnswer
                                              ? isDark ? 'border border-green-600 !bg-green-900/30' : 'border border-green-500 !bg-green-50'
                                              : ''
                                          }`}
                                        >
                                          <input
                                            type="radio"
                                            name={`question-${qIndex}`}
                                            value={oIndex}
                                            checked={quizAnswers[qIndex] === oIndex}
                                            onChange={() => {
                                              const newAnswers = [...quizAnswers];
                                              newAnswers[qIndex] = oIndex;
                                              setQuizAnswers(newAnswers);
                                            }}
                                            className="mr-3"
                                            disabled={quizSubmitted}
                                          />
                                          {option}
                                        </label>
                                      ))}
                                    </div>
                                    
                                    {quizSubmitted && (
                                      <div className={`mt-3 p-3 rounded-md ${
                                        isDark ? 'bg-gray-700' : 'bg-gray-100'
                                      }`}>
                                        <p className="text-sm">
                                          <span className="font-medium">Explication: </span>
                                          {question.explanation}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                              
                              {!quizSubmitted ? (
                                <Button 
                                  className={`mt-6 ${isDark ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                                  onClick={submitQuiz}
                                  disabled={quizAnswers.length < fundamentalsQuiz.length}
                                >
                                  Soumettre mes réponses
                                </Button>
                              ) : (
                                <div className="mt-6 text-center">
                                  <h3 className="font-bold text-lg mb-2">
                                    {
                                      quizAnswers.filter((answer, i) => answer === fundamentalsQuiz[i].correctAnswer).length === fundamentalsQuiz.length
                                        ? "Félicitations! Score parfait!"
                                        : "Quiz terminé!"
                                    }
                                  </h3>
                                  <p className="mb-4">
                                    Vous avez obtenu {quizAnswers.filter((answer, i) => answer === fundamentalsQuiz[i].correctAnswer).length} réponses correctes sur {fundamentalsQuiz.length}.
                                  </p>
                                  <Button onClick={() => setQuizSubmitted(false)}>
                                    Recommencer le quiz
                                  </Button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className={`prose max-w-none ${isDark ? 'prose-invert' : ''} bg-transparent`}>
                              <div
                                dangerouslySetInnerHTML={{ 
                                  __html: section.content
                                    .replace(/^# (.+)$/gm, (_, title) => `<h2 class="text-xl font-bold mb-4 ${isDark ? 'text-blue-300' : 'text-blue-700'}">${title}</h2>`)
                                    .replace(/^## (.+)$/gm, (_, title) => `<h3 class="text-lg font-semibold mb-3 ${isDark ? 'text-gray-200' : 'text-gray-700'}">${title}</h3>`)
                                    .replace(/\*\*([^*]+)\*\*/g, `<strong class="${isDark ? 'text-blue-300' : 'text-blue-700'}">$1</strong>`)
                                    .replace(/\n\n/g, '<br/><br/>')
                                }}
                              />
                            </div>
                          )}
                        </TabsContent>
                      ))}
                    </motion.div>
                  </AnimatePresence>
                </Tabs>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex-1 h-full"
                >
                  {currentModule?.hasLiveSimulation ? (
                    <div className="h-full flex flex-col items-center justify-center">
                      <div className={`w-full max-w-2xl p-6 rounded-xl ${
                        isDark ? 'bg-gray-800/70 border border-gray-700' : 'bg-white border border-gray-200'
                      }`}>
                        <div className="text-center mb-6">
                          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-xl ${
                            currentModule.color
                          } ${isDark ? 'bg-opacity-20' : 'bg-opacity-10'} mb-4`}>
                            {isDark ? currentModule.icon : <span className="text-4xl">{currentModule.iconEmoji}</span>}
                          </div>
                          <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                            {currentModule.title}
                          </h2>
                          <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {currentModule.description}
                          </p>
                        </div>
                        
                        <Alert className={`mb-6 ${
                          isDark ? 'bg-blue-900/30 border-blue-800 text-white' : 'bg-blue-50 border-blue-200 text-blue-900'
                        }`}>
                          <Terminal className="h-4 w-4" />
                          <AlertTitle className="ml-2">Environnement d'apprentissage immersif</AlertTitle>
                          <AlertDescription className={isDark ? 'text-white' : 'text-gray-900'}>
                            Ce module propose des simulations interactives générées par IA. Lancez une simulation pour tester vos compétences dans un environnement réaliste.
                          </AlertDescription>
                        </Alert>
                        
                        <Button 
                          size="lg" 
                          className={`w-full ${isDark ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                          onClick={() => startSimulation(currentModuleId)}
                        >
                          <PlayCircle className="h-5 w-5 mr-2" />
                          Lancer une simulation
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center max-w-lg">
                        <h2 className={`text-xl font-bold mb-3 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                          Contenu en développement
                        </h2>
                        <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          Le contenu de ce module sera généré par IA à la demande dans la version complète de CyberForge Academy.
                        </p>
                        <div className={`p-4 rounded-lg ${isDark ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'}`}>
                          <p className="text-sm text-center">
                            <ExternalLink className="h-4 w-4 inline-block mr-1.5" />
                            La version complète utilisera Azure OpenAI pour générer du contenu personnalisé basé sur votre niveau et vos intérêts.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
            
            {/* AI Recommender and Chat Panel with enhanced styling */}
            <div className={`transition-all duration-300 ${
              isChatOpen ? 'w-80 opacity-100 ml-6' : 'w-0 opacity-0 overflow-hidden'
            }`}>
              {isChatOpen && (
                <div className={`h-full rounded-lg border overflow-hidden flex flex-col ${
                  isDark ? 'bg-gray-800/90 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                  <div className={`p-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <h3 className={`font-medium ${isDark ? 'text-blue-300' : ''}`}>Assistant CyberForge</h3>
                  </div>
                  
                  <div className="flex-1 p-3 overflow-y-auto">
                    {aiRecommendations.length > 0 && (
                      <div className="mb-4">
                        <h4 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          <Lightbulb className="h-3.5 w-3.5 inline-block mr-1" />
                          Recommandations
                        </h4>
                        <div className="space-y-2">
                          {aiRecommendations.map((rec, index) => (
                            <button
                              key={index}
                              className={`w-full p-3 text-left text-sm rounded-md ${
                                isDark ? 'bg-gray-900/80 hover:bg-gray-700/80 border border-gray-700/50' : 'bg-gray-100 hover:bg-gray-200'
                              }`}
                              onClick={() => selectModule(rec.moduleId)}
                            >
                              <div className="font-medium">{rec.title}</div>
                              <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {rec.message}
                              </p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className={`${chatHistory.length > 0 ? 'mb-4' : ''}`}>
                      {chatHistory.map((msg, index) => (
                        <div
                          key={index}
                          className={`mb-3 ${
                            msg.role === 'user' ? 'text-right' : 'text-left'
                          }`}
                        >
                          <div
                            className={`inline-block max-w-[80%] rounded-lg p-3 ${
                              msg.role === 'user'
                                ? isDark ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white'
                                : isDark ? 'bg-gray-900/80 border border-gray-700' : 'bg-gray-100'
                            }`}
                          >
                            <p className="text-sm">{msg.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {chatHistory.length === 0 && (
                      <div className="text-center py-8">
                        <MessageCircle className={`h-12 w-12 mx-auto mb-3 ${isDark ? 'text-gray-700' : 'text-gray-300'}`} />
                        <h3 className="font-medium mb-1">Assistant IA</h3>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Posez des questions sur la cybersécurité ou demandez de l'aide avec le contenu du cours.
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className={`p-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex space-x-2">
                      <Input
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        placeholder="Posez votre question..."
                        className={isDark ? 'bg-gray-900/80 border-gray-700 placeholder:text-gray-500' : ''}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      />
                      <Button 
                        size="icon" 
                        className={isDark ? 'bg-blue-600 hover:bg-blue-700' : ''}
                        onClick={sendMessage}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* AI Explainer modal */}
      {showAiExplainer && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className={`w-full max-w-3xl max-h-[80vh] overflow-auto rounded-lg ${
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'
          }`}>
            <div className={`flex justify-between items-center p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className="text-lg font-medium flex items-center">
                <BrainCircuit className="h-5 w-5 mr-2 text-blue-500" />
                <span className={isDark ? 'text-blue-300' : ''}>Explication IA</span>
                {isAiResponding && (
                  <div className="ml-3 flex space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-150"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-300"></div>
                  </div>
                )}
              </h3>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => {
                  setShowAiExplainer(false);
                  setAiExplanation('');
                  setIsAiResponding(false);
                }}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-6">
              {isAiResponding ? (
                <div className="flex items-center justify-center h-40">
                  <div className="text-center">
                    <div className="mb-4">
                      <div className="inline-block w-12 h-12 border-2 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
                    </div>
                    <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>Génération de l'explication en cours...</p>
                  </div>
                </div>
              ) : (
                <div className={`prose max-w-none ${isDark ? 'prose-invert' : ''}`}>
                  <div
                    dangerouslySetInnerHTML={{ 
                      __html: aiExplanation
                        .replace(/^# (.+)$/gm, (_, title) => `<h2 class="text-xl font-bold mb-4 ${isDark ? 'text-blue-300' : 'text-blue-700'}">${title}</h2>`)
                        .replace(/^## (.+)$/gm, (_, title) => `<h3 class="text-lg font-semibold mb-3 ${isDark ? 'text-gray-200' : 'text-gray-700'}">${title}</h3>`)
                        .replace(/\*\*([^*]+)\*\*/g, `<strong class="${isDark ? 'text-blue-300' : 'text-blue-700'}">$1</strong>`)
                        .replace(/\n\n/g, '<br/><br/>')
                    }}
                  />
                </div>
              )}
            </div>
            <div className={`p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} flex justify-end`}>
              <Button 
                variant="outline" 
                className={isDark ? 'border-gray-700 text-gray-300 hover:bg-gray-700' : ''}
                onClick={() => {
                  setShowAiExplainer(false);
                  setAiExplanation('');
                  setIsAiResponding(false);
                }}
              >
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}