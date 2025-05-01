import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { ArrowLeft, BookOpen, Shield, Terminal, Lightbulb, Settings, MessageCircle, ChevronRight, Star, LockIcon, CheckCircle, ExternalLink, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/contexts/ThemeContext';
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

// Données factices pour les modules
const modules = [
  {
    id: 'fundamentals',
    title: 'Fondamentaux',
    icon: '🔐',
    color: 'bg-blue-500',
    description: 'Les principes de base de la cybersécurité et les concepts essentiels',
    level: 1,
    unlocked: true,
    requiredModules: []
  },
  {
    id: 'network-security',
    title: 'Sécurité Réseau',
    icon: '🌐',
    color: 'bg-purple-500',
    description: 'Protection des infrastructures réseau et détection des intrusions',
    level: 2,
    unlocked: false,
    requiredModules: ['fundamentals']
  },
  {
    id: 'web-security',
    title: 'Sécurité Web',
    icon: '🕸️',
    color: 'bg-orange-500',
    description: 'Sécurisation des applications web et API',
    level: 3,
    unlocked: false,
    requiredModules: ['fundamentals', 'network-security']
  },
  {
    id: 'cryptography',
    title: 'Cryptographie',
    icon: '🔒',
    color: 'bg-green-500',
    description: 'Chiffrement, hachage et gestion des clés',
    level: 3,
    unlocked: false,
    requiredModules: ['fundamentals']
  },
  {
    id: 'social-engineering',
    title: 'Ingénierie Sociale',
    icon: '🎭',
    color: 'bg-red-500',
    description: 'Techniques de manipulation et défenses psychologiques',
    level: 2,
    unlocked: false,
    requiredModules: ['fundamentals']
  },
  {
    id: 'attack-scenarios',
    title: 'Scénarios d\'Attaque',
    icon: '⚔️',
    color: 'bg-amber-500',
    description: 'Simulations d\'attaques réelles et analyses de cas',
    level: 4,
    unlocked: false,
    requiredModules: ['fundamentals', 'network-security', 'web-security']
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
export default function CyberForge() {
  const { themeMode } = useTheme();
  const isDark = themeMode === 'dark' || themeMode === 'futuristic';
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // États
  const [activeTab, setActiveTab] = useState('intro');
  const [userName, setUserName] = useState('');
  const [isNameSet, setIsNameSet] = useState(false);
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
      if (m.unlocked) return true;
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
      
      // Débloquer les modules qui dépendent de celui-ci
      modules.forEach(module => {
        if (module.requiredModules.includes('fundamentals')) {
          updatedUserData.moduleProgress[module.id] = {
            ...updatedUserData.moduleProgress[module.id],
            unlocked: true
          };
        }
      });
      
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
    const isUnlocked = isAdmin || moduleId === 'fundamentals' || 
      modules.find(m => m.id === moduleId)?.unlocked ||
      modules.find(m => m.id === moduleId)?.requiredModules.every(
        reqId => userData.moduleProgress[reqId]?.completed
      );
    
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
  
  // Le module actuellement sélectionné
  const currentModule = modules.find(m => m.id === currentModuleId);
  
  // Vérifier si un module est débloqué
  const isModuleUnlocked = (moduleId: string) => {
    if (isAdmin || moduleId === 'fundamentals') return true;
    
    const module = modules.find(m => m.id === moduleId);
    if (!module) return false;
    
    return module.requiredModules.every(reqId => userData.moduleProgress[reqId]?.completed);
  };
  
  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Sidebar navigation */}
      <div className={`w-64 flex-shrink-0 ${isDark ? 'bg-gray-800' : 'bg-white'} border-r ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
              CyberForge
            </h1>
          </div>
          
          {isNameSet ? (
            <div className={`p-3 mb-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="flex items-center mb-2">
                <User className="h-5 w-5 mr-2" />
                <span className="font-medium">{userName}</span>
              </div>
              <div className="flex flex-col space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Progression totale</span>
                  <span>{userData.totalProgress}%</span>
                </div>
                <Progress value={userData.totalProgress} className={`h-1.5 ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`} />
              </div>
            </div>
          ) : (
            <div className={`p-3 mb-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <label className="text-sm font-medium mb-1 block">Votre nom</label>
              <div className="flex space-x-2">
                <Input 
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Entrez votre nom"
                  className={isDark ? 'bg-gray-800 border-gray-600' : ''}
                />
                <Button size="sm" onClick={setName}>OK</Button>
              </div>
            </div>
          )}
          
          <div className="space-y-1.5">
            {modules.map((module) => {
              const isUnlocked = isModuleUnlocked(module.id);
              const progress = userData.moduleProgress[module.id]?.progress || 0;
              const isCompleted = userData.moduleProgress[module.id]?.completed || false;
              
              return (
                <button
                  key={module.id}
                  className={`w-full flex items-center p-2.5 rounded-md ${
                    currentModuleId === module.id 
                      ? isDark ? 'bg-blue-900/50 text-blue-100' : 'bg-blue-100 text-blue-900'
                      : isUnlocked
                        ? isDark ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-100 text-gray-800'
                        : isDark ? 'text-gray-500' : 'text-gray-400'
                  }`}
                  onClick={() => selectModule(module.id)}
                  disabled={!isUnlocked && !isAdmin}
                >
                  <div className={`mr-2.5 flex items-center justify-center w-8 h-8 rounded-md ${module.color} bg-opacity-15`}>
                    <span className="text-lg">{module.icon}</span>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{module.title}</span>
                      {!isUnlocked && !isAdmin && (
                        <LockIcon className="h-3.5 w-3.5 ml-1" />
                      )}
                      {isCompleted && (
                        <CheckCircle className="h-3.5 w-3.5 ml-1 text-green-500" />
                      )}
                    </div>
                    {isUnlocked && !isCompleted && (
                      <div className="w-full mt-1">
                        <Progress value={progress} className={`h-1 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          
          <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                isAdmin 
                  ? isDark ? 'bg-green-900/20 text-green-300' : 'bg-green-100 text-green-800'
                  : isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
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
      <div className="flex-1 flex flex-col">
        {/* Module header */}
        <header className={`py-4 px-6 ${isDark ? 'bg-gray-800' : 'bg-white'} border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-md ${currentModule?.color} bg-opacity-15 mr-3`}>
                <span className="text-2xl">{currentModule?.icon}</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">{currentModule?.title}</h1>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {currentModule?.description}
                </p>
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={isChatOpen ? (isDark ? 'bg-blue-900/20' : 'bg-blue-100') : ''}
            >
              <MessageCircle className={isChatOpen ? 'text-blue-500' : ''} />
            </Button>
          </div>
        </header>
        
        {/* Main content with tabs */}
        <div className="flex-1 p-6 overflow-auto flex">
          <div className="flex-1">
            {currentModuleId === 'fundamentals' ? (
              <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-4">
                  {moduleSections.map((section) => (
                    <TabsTrigger key={section.id} value={section.id}>
                      {section.title}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {moduleSections.map((section) => (
                  <TabsContent key={section.id} value={section.id} className="outline-none">
                    {section.id === 'quiz' ? (
                      <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                        <h2 className="text-xl font-bold mb-4">Quiz sur les fondamentaux</h2>
                        <p className="mb-6 text-sm">Testez vos connaissances sur les concepts fondamentaux de la cybersécurité.</p>
                        
                        <div className="space-y-6">
                          {fundamentalsQuiz.map((question, qIndex) => (
                            <div 
                              key={qIndex} 
                              className={`p-4 rounded-lg border ${
                                quizSubmitted 
                                  ? quizAnswers[qIndex] === question.correctAnswer
                                    ? isDark ? 'border-green-500 bg-green-900/20' : 'border-green-500 bg-green-50'
                                    : isDark ? 'border-red-500 bg-red-900/20' : 'border-red-500 bg-red-50'
                                  : isDark ? 'border-gray-700' : 'border-gray-200'
                              }`}
                            >
                              <h3 className="font-medium mb-3">Question {qIndex + 1}: {question.question}</h3>
                              <div className="space-y-2">
                                {question.options.map((option, oIndex) => (
                                  <label 
                                    key={oIndex}
                                    className={`flex items-center p-3 rounded-md cursor-pointer ${
                                      quizAnswers[qIndex] === oIndex
                                        ? isDark ? 'bg-blue-900/30 border border-blue-500' : 'bg-blue-100 border border-blue-300'
                                        : isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                                    } ${
                                      quizSubmitted && oIndex === question.correctAnswer
                                        ? isDark ? 'border border-green-500 !bg-green-900/30' : 'border border-green-500 !bg-green-50'
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
                            className="mt-6"
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
                              .replace(/^# (.+)$/gm, (_, title) => `<h2 class="text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}">${title}</h2>`)
                              .replace(/^## (.+)$/gm, (_, title) => `<h3 class="text-lg font-semibold mb-3 ${isDark ? 'text-gray-200' : 'text-gray-700'}">${title}</h3>`)
                              .replace(/\*\*([^*]+)\*\*/g, `<strong class="${isDark ? 'text-blue-300' : 'text-blue-700'}">$1</strong>`)
                              .replace(/\n\n/g, '<br/><br/>')
                          }}
                        />
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
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
          </div>
          
          {/* AI Recommendations and Chat Panel */}
          <div className={`transition-all duration-300 ${
            isChatOpen ? 'w-80 opacity-100 ml-6' : 'w-0 opacity-0 overflow-hidden'
          }`}>
            {isChatOpen && (
              <div className={`h-full rounded-lg border overflow-hidden flex flex-col ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <div className={`p-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h3 className="font-medium">Assistant CyberForge</h3>
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
                              isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
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
                              ? isDark ? 'bg-blue-700 text-white' : 'bg-blue-600 text-white'
                              : isDark ? 'bg-gray-700' : 'bg-gray-100'
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {chatHistory.length === 0 && (
                    <div className="text-center py-8">
                      <MessageCircle className={`h-12 w-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
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
                      className={isDark ? 'bg-gray-700 border-gray-600' : ''}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    />
                    <Button size="icon" onClick={sendMessage}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}