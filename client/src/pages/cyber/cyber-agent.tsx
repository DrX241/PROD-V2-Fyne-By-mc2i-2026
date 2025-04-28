import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useRoute } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import HomeLayout from '@/components/layout/HomeLayout';
import CyberChatMessage from '@/components/cyber/CyberChatMessage';
import { Separator } from '@/components/ui/separator';
import PageTitle from '@/components/utils/PageTitle';

// Types pour les rôles
interface Role {
  id: string;
  title: string;
  description: string;
  isActive: boolean;
}

// Niveaux d'expertise
type ExpertiseLevel = 'Débutant' | 'Intermédiaire' | 'Expert';

// Types pour un interlocuteur
interface Contact {
  name: string;
  role: string;
  description?: string;
  imageUrl?: string;
}

// Types pour un email
interface EmailMessage {
  id: string;
  from: Contact;
  to: string;
  subject: string;
  date: string;
  body: string;
}

// Types de message pour le chat
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  contact?: Contact; // Pour les messages assistant avec un interlocuteur
  timestamp: Date;
}

// Structure pour l'évaluation finale
interface CyberAgentEvaluation {
  overallScore: number;
  strengths: string[];
  areasToImprove: string[];
  keyLearnings: string[];
  acquiredSkills: string[];
  recommendations: string[];
}

// États de progression du jeu
type GameState = 
  'intro' | 
  'role-selection' | 
  'expertise-selection' | 
  'presentation' | 
  'interaction' | 
  'pause' | 
  'evaluation' | 
  'complete';

export default function CyberAgentPage() {
  // État principal de la progression du jeu
  const [gameState, setGameState] = useState<GameState>('intro');
  
  // État pour la session utilisateur
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  
  // État pour le rôle sélectionné
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  
  // État pour le niveau d'expertise
  const [expertiseLevel, setExpertiseLevel] = useState<ExpertiseLevel | null>(null);
  
  // État pour la conversation
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentContact, setCurrentContact] = useState<Contact | null>(null);
  const [userPresentation, setUserPresentation] = useState<string>('');
  
  // État pour l'email
  const [emailMessage, setEmailMessage] = useState<EmailMessage | null>(null);
  
  // État pour l'évaluation finale
  const [evaluation, setEvaluation] = useState<CyberAgentEvaluation | null>(null);
  
  // États pour le chargement et les erreurs
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Autres états utiles
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  // Chargement des rôles disponibles depuis l'API
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/cyber-agent/roles');
        
        if (!response.ok) {
          throw new Error(`Erreur lors du chargement des rôles: ${response.status}`);
        }
        
        const data = await response.json();
        setAvailableRoles(data.roles || []);
      } catch (err) {
        console.error('Erreur lors du chargement des rôles:', err);
        setError('Impossible de charger les rôles disponibles');
        
        // Fallback roles en cas d'erreur
        setAvailableRoles([
          {
            id: 'rssi',
            title: 'RSSI',
            description: 'Responsable de la Sécurité des Systèmes d\'Information',
            isActive: true
          },
          {
            id: 'hacker',
            title: 'Hacker éthique',
            description: 'Expert en tests d\'intrusion et sécurité',
            isActive: true
          },
          {
            id: 'developer',
            title: 'Développeur',
            description: 'Développeur sensibilisé aux vulnérabilités logicielles',
            isActive: true
          },
          {
            id: 'sysadmin',
            title: 'Administrateur Système',
            description: 'Gestionnaire de l\'infrastructure sécurisée',
            isActive: true
          },
          {
            id: 'consultant',
            title: 'Consultant en cybersécurité',
            description: 'Spécialiste des audits de sécurité',
            isActive: true
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (gameState === 'intro' || gameState === 'role-selection') {
      fetchRoles();
    }
  }, [gameState]);
  
  // Démarrer une nouvelle session CYBER AGENT
  const startCyberAgentSession = async () => {
    if (!selectedRole || !expertiseLevel || !userName.trim()) {
      toast({
        title: "Information incomplète",
        description: "Veuillez remplir toutes les informations requises",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/cyber-agent/start-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userName: userName.trim(),
          userRole: selectedRole,
          expertiseLevel
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Erreur lors du démarrage de la session: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Sauvegarder l'ID de session et le message d'accueil
      setSessionId(data.sessionId);
      
      // Configurer l'email de bienvenue
      if (data.initialEmail) {
        setEmailMessage(data.initialEmail);
      }
      
      // Passer à l'étape de présentation
      setGameState('presentation');
      
    } catch (err) {
      console.error('Erreur lors du démarrage de la session:', err);
      setError('Impossible de démarrer la session');
      
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du démarrage de la session. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Envoyer la présentation utilisateur
  const submitUserPresentation = async (presentationText: string) => {
    if (!sessionId || !presentationText.trim()) {
      toast({
        title: "Information incomplète",
        description: "Veuillez saisir votre présentation",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Ajouter le message utilisateur
      const newUserMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: presentationText,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, newUserMessage]);
      
      const response = await fetch('/api/cyber-agent/presentation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          presentation: presentationText
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Erreur lors de l'envoi de la présentation: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Ajouter la réponse à l'historique de chat
      if (data.response) {
        const responseMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
          contact: data.contact,
          timestamp: new Date()
        };
        
        setChatMessages(prev => [...prev, responseMessage]);
      }
      
      // Si la présentation est complète, passons à l'étape d'interaction
      if (data.isComplete && data.expertMessage) {
        // Message d'introduction de l'expert
        const expertMessage: ChatMessage = {
          id: (Date.now() + 2).toString(),
          role: 'assistant',
          content: data.expertMessage.content,
          contact: data.expertMessage.contact,
          timestamp: new Date()
        };
        
        setChatMessages(prev => [...prev, expertMessage]);
        setCurrentContact(data.expertMessage.contact);
        setGameState('interaction');
      }
      
    } catch (err) {
      console.error('Erreur lors de l\'envoi de la présentation:', err);
      setError('Impossible d\'envoyer votre présentation');
      
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi de votre présentation. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Génération des scénarios disponibles en fonction du rôle, du niveau et du mode
  const generateAvailableScenarios = () => {
    if (!selectedRole || !skillLevel || !selectedMode) return;
    
    // Dans une implémentation réelle, ces scénarios seraient récupérés depuis l'API en fonction des paramètres
    const scenarios: Scenario[] = [];
    
    // Exemples de scénarios pour le mode classique (à adapter selon le rôle et le niveau)
    if (selectedMode === 'classic') {
      if (selectedRole === 'rssi') {
        scenarios.push(
          {
            id: 'rssi-1',
            title: 'Gestion d\'une fuite de données',
            description: 'Gérez une situation critique suite à une fuite de données confidentielles',
            difficulty: skillLevel,
            category: 'Gestion de crise'
          },
          {
            id: 'rssi-2',
            title: 'Élaboration d\'une politique de sécurité',
            description: 'Développez une politique de sécurité adaptée à votre entreprise',
            difficulty: skillLevel,
            category: 'Stratégie'
          }
        );
      } else if (selectedRole === 'hacker') {
        scenarios.push(
          {
            id: 'hacker-1',
            title: 'Test d\'intrusion web',
            description: 'Réalisez un test d\'intrusion sur une application web vulnérable',
            difficulty: skillLevel,
            category: 'Pentest'
          },
          {
            id: 'hacker-2',
            title: 'Analyse de vulnérabilités réseau',
            description: 'Identifiez et exploitez des vulnérabilités dans une infrastructure réseau',
            difficulty: skillLevel,
            category: 'Vulnérabilités'
          }
        );
      }
      // Ajouter d'autres scénarios selon les rôles...
    } else if (selectedMode === 'tunnel') {
      // Scénarios pour le mode tunnel (avec des liens entre eux)
      if (selectedRole === 'rssi') {
        scenarios.push(
          {
            id: 'tunnel-rssi-1',
            title: 'Alerte de sécurité majeure',
            description: 'Une série d\'événements suspects a été détectée sur le réseau de l\'entreprise',
            difficulty: skillLevel,
            category: 'Tunnel'
          }
        );
      } else if (selectedRole === 'hacker') {
        scenarios.push(
          {
            id: 'tunnel-hacker-1',
            title: 'Mission d\'infiltration éthique',
            description: 'Votre mission est d\'infiltrer un système pour révéler ses vulnérabilités',
            difficulty: skillLevel,
            category: 'Tunnel'
          }
        );
      }
      // Ajouter d'autres scénarios selon les rôles...
    }
    
    setAvailableScenarios(scenarios);
  };
  
  // Gestionnaire pour la sélection du rôle
  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
    setGameState('mode-selection');
  };
  
  // Gestionnaire pour la sélection du mode de jeu
  const handleModeSelect = (modeId: string) => {
    setSelectedMode(modeId);
    initializeQCM();
    setGameState('qcm');
  };
  
  // Gestionnaire pour la réponse au QCM
  const handleAnswerSelect = (questionId: number, answerId: string) => {
    setSelectedAnswers({...selectedAnswers, [questionId]: answerId});
  };
  
  // Gestionnaire pour passer à la question suivante du QCM
  const handleNextQuestion = () => {
    if (currentQuestionIndex < qcmQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Fin du QCM - Évaluation du niveau
      evaluateSkillLevel();
    }
  };
  
  // Évaluation du niveau de compétence à partir des réponses au QCM
  const evaluateSkillLevel = () => {
    const correctAnswers = qcmQuestions.filter(q => {
      const selectedOption = q.options.find(opt => opt.id === selectedAnswers[q.id]);
      return selectedOption?.correct;
    }).length;
    
    const percentage = (correctAnswers / qcmQuestions.length) * 100;
    
    let level: 'Débutant' | 'Intermédiaire' | 'Expert';
    if (percentage < 40) {
      level = 'Débutant';
    } else if (percentage < 75) {
      level = 'Intermédiaire';
    } else {
      level = 'Expert';
    }
    
    setSkillLevel(level);
    
    // Notification du niveau évalué
    toast({
      title: "Niveau évalué",
      description: `Votre niveau de compétence a été évalué à: ${level}`,
      variant: "default",
    });
    
    // Génération des scénarios adaptés
    setTimeout(() => {
      generateAvailableScenarios();
      setGameState('scenario-selection');
    }, 1000);
  };
  
  // Gestionnaire pour la sélection d'un scénario
  const handleScenarioSelect = (scenarioId: string) => {
    setSelectedScenario(scenarioId);
    
    // Initialisation du jeu avec un message d'introduction
    const scenario = availableScenarios.find(s => s.id === scenarioId);
    if (scenario) {
      setMessages([
        {
          id: '1',
          role: 'system',
          content: `Bienvenue dans le scénario "${scenario.title}". ${scenario.description}`,
          timestamp: new Date(),
        }
      ]);
      setGameState('game');
    }
  };
  
  // Gestionnaire pour l'envoi d'un message
  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;
    
    // Ajout du message utilisateur
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      // Simulation d'une réponse (à remplacer par un appel API)
      setTimeout(() => {
        const responseMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Réponse simulée au message: "${content}"`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, responseMessage]);
        setIsLoading(false);
      }, 1500);
      
      // Dans une implémentation réelle, appel à l'API ici
      // const response = await fetch('/api/cyber/cyber-agent/message', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     role: selectedRole,
      //     mode: selectedMode,
      //     scenario: selectedScenario,
      //     message: content,
      //     history: messages,
      //   }),
      // });
      // 
      // if (response.ok) {
      //   const data = await response.json();
      //   const responseMessage: Message = {
      //     id: Date.now().toString(),
      //     role: 'assistant',
      //     content: data.message,
      //     timestamp: new Date(),
      //   };
      //   setMessages(prev => [...prev, responseMessage]);
      // } else {
      //   throw new Error('Erreur lors de l\'envoi du message');
      // }
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du traitement de votre message.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Note: Cette version du composant est remplacée par cyber-agent-new.tsx
  // Les anciennes fonctionnalités ont été désactivées pour éviter les erreurs
  
  // Effet pour générer les scénarios 
  useEffect(() => {
    if (selectedRole && gameState === 'scenario-selection') {
      // Les nouvelles fonctionnalités sont disponibles dans cyber-agent-new.tsx
      console.log("Cette version est remplacée par cyber-agent-new.tsx");
    }
  }, [selectedRole, gameState]);
  
  // Rendu conditionnel en fonction de l'état du jeu
  const renderContent = () => {
    switch (gameState) {
      case 'intro':
        return (
          <div className="max-w-4xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 md:p-8"
            >
              <h2 className="text-2xl font-bold text-center mb-6">Bienvenue dans Cyber Agent</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Cyber Agent est une évolution avancée de notre Agent Conversationnel, offrant des scénarios immersifs et interactifs 
                pour tester vos compétences en cybersécurité. Dans ce module, vous aurez l'opportunité de:
              </p>
              
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Choisir parmi différents rôles professionnels en cybersécurité</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Passer un QCM pour évaluer votre niveau et adapter les scénarios à vos compétences</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Choisir entre deux modes de jeu: Classique avec des missions indépendantes, ou Effet Tunnel avec un impact progressif de vos décisions</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Résoudre des défis techniques comme l'analyse de code, la correction de vulnérabilités, et la recherche d'indices</span>
                </li>
              </ul>
              
              <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2 flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  Objectifs pédagogiques
                </h3>
                <p className="text-blue-700 dark:text-blue-200 text-sm">
                  Ce module a été conçu pour mettre en pratique vos connaissances théoriques et développer vos compétences 
                  en résolution de problèmes, analyse de risques, et prise de décision dans des situations de cybersécurité réalistes.
                </p>
              </div>
              
              <div className="flex justify-center">
                <Button 
                  onClick={() => setGameState('role-selection')} 
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Commencer l'expérience
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          </div>
        );
        
      case 'role-selection':
        return (
          <div className="max-w-4xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 md:p-8"
            >
              <h2 className="text-2xl font-bold text-center mb-6">Sélectionnez votre rôle</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
                Choisissez le rôle professionnel que vous souhaitez incarner dans ce scénario.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {availableRoles.map((role) => (
                  <Card 
                    key={role.id}
                    className={`p-4 cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all ${
                      selectedRole === role.id ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/30' : ''
                    }`}
                    onClick={() => setSelectedRole(role.id)}
                  >
                    <h3 className="font-bold mb-1">{role.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{role.description}</p>
                  </Card>
                ))}
              </div>
              
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => setGameState('intro')}
                >
                  Retour
                </Button>
                <Button 
                  disabled={!selectedRole}
                  onClick={() => selectedRole && handleRoleSelect(selectedRole)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Continuer
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          </div>
        );
        
      case 'mode-selection':
        return (
          <div className="max-w-4xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 md:p-8"
            >
              <h2 className="text-2xl font-bold text-center mb-6">Sélectionnez un mode de jeu</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
                Choisissez entre deux expériences de jeu différentes.
              </p>
              
              <div className="grid grid-cols-1 gap-4 mb-8">
                {gameModes.map((mode) => (
                  <Card 
                    key={mode.id}
                    className={`p-4 cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all ${
                      selectedMode === mode.id ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/30' : ''
                    }`}
                    onClick={() => setSelectedMode(mode.id)}
                  >
                    <h3 className="font-bold mb-1">{mode.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{mode.description}</p>
                  </Card>
                ))}
              </div>
              
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => setGameState('role-selection')}
                >
                  Retour
                </Button>
                <Button 
                  disabled={!selectedMode}
                  onClick={() => selectedMode && handleModeSelect(selectedMode)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Continuer
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          </div>
        );
        
      case 'qcm':
        return (
          <div className="max-w-4xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 md:p-8"
            >
              <div className="mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Question {currentQuestionIndex + 1} sur {qcmQuestions.length}
                  </span>
                  <span className="text-sm font-medium">
                    Évaluation de niveau
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 mt-2 rounded-full">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${((currentQuestionIndex + 1) / qcmQuestions.length) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              {qcmQuestions.length > 0 && (
                <>
                  <h2 className="text-xl font-bold mb-4">{qcmQuestions[currentQuestionIndex].text}</h2>
                  
                  <RadioGroup 
                    value={selectedAnswers[qcmQuestions[currentQuestionIndex].id] || ''}
                    onValueChange={(value) => handleAnswerSelect(qcmQuestions[currentQuestionIndex].id, value)}
                    className="space-y-3 mb-6"
                  >
                    {qcmQuestions[currentQuestionIndex].options.map((option) => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.id} id={`option-${option.id}`} />
                        <Label htmlFor={`option-${option.id}`} className="cursor-pointer">{option.text}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                  
                  <div className="flex justify-between">
                    <Button 
                      variant="outline" 
                      onClick={() => setGameState('mode-selection')}
                    >
                      Retour
                    </Button>
                    <Button 
                      disabled={!selectedAnswers[qcmQuestions[currentQuestionIndex].id]}
                      onClick={handleNextQuestion}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {currentQuestionIndex < qcmQuestions.length - 1 ? 'Question suivante' : 'Terminer le QCM'}
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        );
        
      case 'scenario-selection':
        return (
          <div className="max-w-4xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 md:p-8"
            >
              <h2 className="text-2xl font-bold text-center mb-6">Sélectionnez un scénario</h2>
              
              {skillLevel && (
                <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg mb-6">
                  <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">Niveau évalué: {skillLevel}</h3>
                  <p className="text-blue-700 dark:text-blue-200 text-sm">
                    Les scénarios suivants ont été adaptés à votre niveau de compétence évalué.
                  </p>
                </div>
              )}
              
              {availableScenarios.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 mb-8">
                  {availableScenarios.map((scenario) => (
                    <Card 
                      key={scenario.id}
                      className={`p-4 cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all ${
                        selectedScenario === scenario.id ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/30' : ''
                      }`}
                      onClick={() => setSelectedScenario(scenario.id)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold">{scenario.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded ${
                          scenario.difficulty === 'Débutant' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' :
                          scenario.difficulty === 'Intermédiaire' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' :
                          'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                        }`}>
                          {scenario.difficulty}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{scenario.description}</p>
                      <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{scenario.category}</span>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">Aucun scénario n'est disponible pour le moment.</p>
                </div>
              )}
              
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => setGameState('qcm')}
                >
                  Retour
                </Button>
                <Button 
                  disabled={!selectedScenario}
                  onClick={() => selectedScenario && handleScenarioSelect(selectedScenario)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Commencer le scénario
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          </div>
        );
        
      case 'game':
        return (
          <div className="max-w-4xl mx-auto px-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
              <div className="p-4 bg-blue-600 text-white">
                <div className="flex justify-between items-center">
                  <h2 className="font-bold">
                    {selectedRole && availableRoles.find(r => r.id === selectedRole)?.title} - 
                    {selectedScenario && availableScenarios.find(s => s.id === selectedScenario)?.title}
                  </h2>
                  <span className="text-sm">
                    Mode: {selectedMode === 'classic' ? 'Classique' : 'Effet Tunnel'}
                  </span>
                </div>
              </div>
              
              <div className="h-[calc(100vh-300px)] overflow-y-auto p-4">
                {messages.map((message) => (
                  <CyberChatMessage key={message.id} message={message} />
                ))}
                
                {isLoading && (
                  <div className="flex justify-center py-4">
                    <div className="loader">Chargement...</div>
                  </div>
                )}
              </div>
              
              <Separator />
              
              <div className="p-4">
                <div className="flex">
                  <input 
                    type="text" 
                    placeholder="Saisissez votre message..." 
                    className="flex-grow px-4 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(e.currentTarget.value)}
                  />
                  <Button 
                    className="rounded-l-none"
                    disabled={isLoading}
                  >
                    Envoyer
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };
  
  return (
    <HomeLayout>
      <PageTitle title="Cyber Agent" />
      <div className="min-h-[calc(100vh-64px)] py-6 bg-gray-50 dark:bg-gray-900">
        {renderContent()}
      </div>
    </HomeLayout>
  );
}