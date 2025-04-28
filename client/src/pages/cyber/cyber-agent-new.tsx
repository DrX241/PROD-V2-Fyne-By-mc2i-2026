import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useRoute } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, CheckCircle2, ChevronRight, Send, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  const [currentMessage, setCurrentMessage] = useState<string>('');
  
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
  
  // Les niveaux d'expertise disponibles
  const expertiseLevels: ExpertiseLevel[] = ['Débutant', 'Intermédiaire', 'Expert'];

  // Chargement des rôles disponibles depuis l'API
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/cyber/cyber-agent/roles');
        
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
  
  // Gestionnaire pour la sélection du rôle
  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
    setGameState('expertise-selection');
  };
  
  // Gestionnaire pour la sélection du niveau d'expertise
  const handleExpertiseSelect = (level: ExpertiseLevel) => {
    setExpertiseLevel(level);
    setGameState('presentation');
  };
  
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
      
      const response = await fetch('/api/cyber/cyber-agent/start-session', {
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
  const submitUserPresentation = async () => {
    if (!sessionId || !userPresentation.trim()) {
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
        content: userPresentation,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, newUserMessage]);
      
      const response = await fetch('/api/cyber/cyber-agent/presentation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          presentation: userPresentation
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

  // Envoyer un message dans l'interaction avec l'expert
  const sendMessage = async () => {
    if (!sessionId || !currentMessage.trim()) return;
    
    try {
      setIsLoading(true);
      
      // Ajouter le message utilisateur à l'historique
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: currentMessage,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, userMessage]);
      setCurrentMessage(''); // Effacer le champ de saisie
      
      // Appel API
      const response = await fetch('/api/cyber/cyber-agent/interaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          message: currentMessage
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Erreur lors de l'envoi du message: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Vérifier si nous avons une pause pédagogique
      if (data.isPause && data.pauseMessage) {
        // Message de pause de I AM CYBER
        const pauseMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.pauseMessage.content,
          contact: data.pauseMessage.contact,
          timestamp: new Date()
        };
        
        setChatMessages(prev => [...prev, pauseMessage]);
        setGameState('pause');
      } else {
        // Réponse normale de l'expert
        const expertMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
          contact: data.contact,
          timestamp: new Date()
        };
        
        setChatMessages(prev => [...prev, expertMessage]);
      }
      
    } catch (err) {
      console.error('Erreur lors de l\'envoi du message:', err);
      
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi de votre message. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Continuer après une pause pédagogique
  const continueAfterPause = async () => {
    if (!sessionId) return;
    
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/cyber/cyber-agent/resume-after-pause', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });
      
      if (!response.ok) {
        throw new Error(`Erreur lors de la reprise: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Message de reprise de l'expert
      const expertMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.response,
        contact: data.contact,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, expertMessage]);
      setGameState('interaction');
      
    } catch (err) {
      console.error('Erreur lors de la reprise après pause:', err);
      
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la reprise. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Terminer la session et obtenir l'évaluation
  const completeSession = async () => {
    if (!sessionId) return;
    
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/cyber/cyber-agent/complete-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });
      
      if (!response.ok) {
        throw new Error(`Erreur lors de la finalisation: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Message final de l'évaluation
      const evaluationMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.message,
        contact: data.contact,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, evaluationMessage]);
      setEvaluation(data.evaluation);
      setGameState('evaluation');
      
    } catch (err) {
      console.error('Erreur lors de la finalisation de la session:', err);
      
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la finalisation de la session. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fonction pour démarrer une nouvelle simulation
  const startNewSimulation = () => {
    // Réinitialiser tous les états
    setSessionId(null);
    setUserName('');
    setSelectedRole(null);
    setExpertiseLevel(null);
    setChatMessages([]);
    setCurrentContact(null);
    setUserPresentation('');
    setEmailMessage(null);
    setEvaluation(null);
    setError(null);
    
    // Retour à l'écran d'intro
    setGameState('intro');
  };
  
  // Fonction pour retourner à l'accueil
  const goToHome = () => {
    navigate('/');
  };

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
                  <span>Interagir avec des experts du domaine et recevoir des conseils personnalisés</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Bénéficier de pauses pédagogiques avec I AM CYBER pour consolider vos connaissances</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Recevoir une évaluation détaillée de vos compétences à la fin de la simulation</span>
                </li>
              </ul>
              
              <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg mb-6">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Note:</strong> Ce module permet de tester vos connaissances en cybersécurité à travers des discussions 
                  interactives avec des experts virtuels. Avant de commencer, veuillez saisir votre nom et sélectionner le rôle que 
                  vous souhaitez endosser.
                </p>
              </div>
              
              <div className="mb-6">
                <Label htmlFor="userName" className="mb-2 block">Votre nom</Label>
                <Input 
                  id="userName" 
                  placeholder="Entrez votre nom" 
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="mb-4"
                />
              </div>
              
              <Button 
                onClick={() => setGameState('role-selection')}
                disabled={!userName.trim()}
                className="w-full"
              >
                Commencer
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
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
              <h2 className="text-2xl font-bold text-center mb-6">Choisissez votre rôle</h2>
              <p className="text-gray-800 dark:text-gray-200 mb-6 font-medium">
                Sélectionnez le rôle professionnel que vous souhaitez incarner dans cette simulation. 
                Chaque rôle offre des défis et perspectives différents sur la cybersécurité.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {availableRoles.filter(role => role.isActive).map((role) => (
                  <Card 
                    key={role.id}
                    className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                      selectedRole === role.id ? 'border-2 border-primary' : ''
                    }`}
                    onClick={() => setSelectedRole(role.id)}
                  >
                    <h3 className="font-bold text-lg mb-2">{role.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{role.description}</p>
                  </Card>
                ))}
              </div>
              
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setGameState('intro')}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour
                </Button>
                
                <Button 
                  onClick={() => handleRoleSelect(selectedRole!)}
                  disabled={!selectedRole}
                >
                  Suivant
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          </div>
        );
        
      case 'expertise-selection':
        return (
          <div className="max-w-4xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 md:p-8"
            >
              <h2 className="text-2xl font-bold text-center mb-6">Niveau d'expertise</h2>
              <p className="text-gray-800 dark:text-gray-200 mb-6 font-medium">
                Indiquez votre niveau d'expertise en cybersécurité pour adapter les interactions 
                et le niveau technique des discussions avec les experts.
              </p>
              
              <RadioGroup className="mb-6">
                {expertiseLevels.map((level) => (
                  <div key={level} className="flex items-start space-x-2 mb-3">
                    <RadioGroupItem 
                      value={level} 
                      id={`level-${level}`}
                      checked={expertiseLevel === level}
                      onClick={() => setExpertiseLevel(level)}
                    />
                    <div className="grid gap-1">
                      <Label htmlFor={`level-${level}`} className="font-medium">
                        {level}
                      </Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {level === 'Débutant' && 'Connaissances de base en cybersécurité, peu d\'expérience pratique.'}
                        {level === 'Intermédiaire' && 'Bonnes connaissances théoriques et quelques années d\'expérience.'}
                        {level === 'Expert' && 'Maîtrise avancée des concepts et techniques, expérience significative dans le domaine.'}
                      </p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
              
              <div className="flex justify-between">
                <Button 
                  variant="outline"
                  onClick={() => setGameState('role-selection')}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour
                </Button>
                
                <Button 
                  onClick={() => startCyberAgentSession()}
                  disabled={!expertiseLevel}
                >
                  Lancer la simulation
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          </div>
        );
        
      case 'presentation':
        return (
          <div className="max-w-4xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 md:p-8"
            >
              <h2 className="text-2xl font-bold mb-4">Email de bienvenue</h2>
              
              {emailMessage && (
                <div className="border rounded-lg p-4 mb-6 bg-gray-50 dark:bg-gray-900">
                  <div className="flex justify-between mb-3">
                    <div>
                      <p className="font-medium">De: {emailMessage.from.name}</p>
                      <p className="text-sm text-gray-500">{emailMessage.from.role}</p>
                    </div>
                    <p className="text-sm text-gray-500">{emailMessage.date}</p>
                  </div>
                  <p className="font-medium mb-2">Objet: {emailMessage.subject}</p>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: emailMessage.body.replace(/\n/g, '<br />') }} />
                  </div>
                </div>
              )}
              
              <h3 className="text-lg font-semibold mb-3">Votre présentation</h3>
              <p className="text-gray-800 dark:text-gray-200 mb-4 font-medium">
                Présentez-vous brièvement en précisant votre parcours, vos compétences et votre expérience
                en cybersécurité. Cette présentation sera utilisée pour personnaliser les interactions.
              </p>
              
              <Textarea
                placeholder="Rédigez votre présentation ici..."
                className="min-h-[150px] mb-4"
                value={userPresentation}
                onChange={(e) => setUserPresentation(e.target.value)}
              />
              
              <Button 
                onClick={submitUserPresentation}
                disabled={isLoading || !userPresentation.trim()}
                className="w-full"
              >
                {isLoading ? 'Envoi en cours...' : 'Envoyer ma présentation'}
                <Send className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        );
        
      case 'interaction':
      case 'pause':
        return (
          <div className="max-w-4xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 md:p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Discussion avec {currentContact?.name || 'l\'expert'}</h2>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={completeSession}
                >
                  Terminer la session
                </Button>
              </div>
              
              <div className="border rounded-lg mb-6 overflow-hidden">
                <div className="bg-gray-100 dark:bg-gray-900 p-3 border-b">
                  <div className="flex items-center">
                    {currentContact && (
                      <>
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
                          {currentContact.name.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <p className="font-medium">{currentContact.name}</p>
                          <p className="text-xs text-gray-500">{currentContact.role}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="p-4 max-h-[500px] overflow-y-auto bg-white dark:bg-gray-800">
                  {chatMessages.map((message) => (
                    <div key={message.id} className={`mb-4 ${message.role === 'user' ? 'text-right' : ''}`}>
                      <div className={`inline-block max-w-[80%] p-3 rounded-lg ${
                        message.role === 'user' 
                          ? 'bg-primary text-white' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                      }`}>
                        {message.role !== 'user' && message.contact && (
                          <p className="font-bold text-xs mb-1">{message.contact.name}</p>
                        )}
                        <p>{message.content}</p>
                        <p className="text-xs opacity-70 mt-1 text-right">
                          {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {gameState === 'pause' ? (
                  <div className="p-4 border-t bg-blue-50 dark:bg-blue-900/30">
                    <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                      <strong>Note pédagogique:</strong> I AM CYBER est intervenu pour vous fournir des explications 
                      supplémentaires. Vous pouvez maintenant continuer la discussion avec l'expert.
                    </p>
                    <Button onClick={continueAfterPause} className="w-full">
                      Continuer la discussion
                    </Button>
                  </div>
                ) : (
                  <div className="p-4 border-t flex gap-2">
                    <Input
                      placeholder="Tapez votre message..."
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      disabled={isLoading}
                    />
                    <Button 
                      onClick={sendMessage}
                      disabled={isLoading || !currentMessage.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        );
        
      case 'evaluation':
        return (
          <div className="max-w-4xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 md:p-8"
            >
              <h2 className="text-2xl font-bold text-center mb-6">Évaluation de votre performance</h2>
              
              {evaluation && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mb-3">
                      <span className="text-3xl font-bold text-primary">{evaluation.overallScore}/10</span>
                    </div>
                    <h3 className="text-xl font-semibold">Score global</h3>
                  </div>
                  
                  <Tabs defaultValue="strengths">
                    <TabsList className="w-full grid grid-cols-3">
                      <TabsTrigger value="strengths">Points forts</TabsTrigger>
                      <TabsTrigger value="improvements">Axes d'amélioration</TabsTrigger>
                      <TabsTrigger value="learnings">Apprentissages</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="strengths" className="mt-4">
                      <Card className="p-4">
                        <h4 className="font-semibold text-lg mb-3">Vos points forts</h4>
                        <ul className="list-disc pl-5 space-y-2">
                          {evaluation.strengths.map((strength, index) => (
                            <li key={index}>{strength}</li>
                          ))}
                        </ul>
                      </Card>
                    </TabsContent>
                    
                    <TabsContent value="improvements" className="mt-4">
                      <Card className="p-4">
                        <h4 className="font-semibold text-lg mb-3">Axes d'amélioration</h4>
                        <ul className="list-disc pl-5 space-y-2">
                          {evaluation.areasToImprove.map((area, index) => (
                            <li key={index}>{area}</li>
                          ))}
                        </ul>
                      </Card>
                    </TabsContent>
                    
                    <TabsContent value="learnings" className="mt-4">
                      <Card className="p-4">
                        <h4 className="font-semibold text-lg mb-3">Connaissances acquises</h4>
                        <ul className="list-disc pl-5 space-y-2">
                          {evaluation.keyLearnings.map((learning, index) => (
                            <li key={index}>{learning}</li>
                          ))}
                        </ul>
                        
                        <h4 className="font-semibold text-lg mt-6 mb-3">Compétences développées</h4>
                        <ul className="list-disc pl-5 space-y-2">
                          {evaluation.acquiredSkills.map((skill, index) => (
                            <li key={index}>{skill}</li>
                          ))}
                        </ul>
                      </Card>
                    </TabsContent>
                  </Tabs>
                  
                  <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg mb-6">
                    <h4 className="font-semibold mb-2">Recommandations</h4>
                    <ul className="list-disc pl-5 space-y-2">
                      {evaluation.recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 justify-between">
                    <Button 
                      variant="outline" 
                      onClick={goToHome}
                      className="sm:flex-1"
                    >
                      Retour à l'accueil
                    </Button>
                    
                    <Button 
                      onClick={startNewSimulation}
                      className="sm:flex-1"
                    >
                      Démarrer une nouvelle simulation
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <HomeLayout>
      {/* Mise à jour du titre de la page */}
      <PageTitle title="Cyber Agent" />
      
      <div className="max-w-4xl mx-auto mb-6 px-4">
        <div className="border-b pb-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Cyber Agent</h1>
          <p className="text-gray-800 dark:text-gray-200 mt-1 font-medium">
            Mise en situation d'audition avec interaction avancée
          </p>
        </div>
      </div>
      
      {error && (
        <div className="max-w-4xl mx-auto px-4 mb-6">
          <div className="bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 p-4 rounded-lg flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        </div>
      )}
      
      {renderContent()}
    </HomeLayout>
  );
}