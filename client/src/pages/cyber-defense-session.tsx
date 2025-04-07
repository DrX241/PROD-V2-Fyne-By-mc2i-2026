import React, { useEffect, useState, useRef } from 'react';
import { Link, useRoute, useLocation } from 'wouter';
import { v4 as uuidv4 } from 'uuid';
import { 
  Shield, ArrowLeft, Send, AlertCircle, 
  ChevronDown, Brain, Clock, User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import HomeLayout from '@/components/layout/HomeLayout';
import axios from 'axios';
import { useChatContext } from '@/contexts/ChatContext';

// Structure d'un message
interface Message {
  id: string;
  sender: string; // ID du contact ou 'user' pour l'utilisateur
  senderName?: string; // Nom du contact pour l'affichage
  senderRole?: string; // Rôle du contact pour l'affichage
  senderAvatar?: string; // Initiales pour l'avatar
  senderAvatarColor?: string; // Couleur de l'avatar
  content: string;
  timestamp: number;
  isDecision?: boolean; // Indique si c'est un message de décision
  isSystemMessage?: boolean; // Indique si c'est un message système
}

// Structure d'un contact
interface Contact {
  id: string;
  name: string;
  role: string;
  expertise: string;
  avatarInitials: string;
  avatarColor: string;
  unlockedAtLevel: number;
  isActive?: boolean; // Indique si le contact est actuellement actif/visible
}

// Structure d'un niveau
interface Level {
  id: string;
  levelNumber: number;
  title: string;
  description: string;
  scenario: string;
  objectives: string[];
  complexity: 'Basique' | 'Intermédiaire' | 'Avancé' | 'Expert';
  duration: string;
}

export default function CyberDefenseSession() {
  const [, params] = useRoute('/cyber-defense/session/:levelId');
  const levelId = params?.levelId;
  const [, navigate] = useLocation();
  
  // Références pour le conteneur de chat
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // États locaux
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [level, setLevel] = useState<Level | null>(null);
  const [progress, setProgress] = useState(0);
  const [confidenceLevel, setConfidenceLevel] = useState(80);
  const [currentObjective, setCurrentObjective] = useState(0);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activeContacts, setActiveContacts] = useState<Contact[]>([]);
  const { userName } = useChatContext();
  
  // Exemple de niveau et contacts (à remplacer par les données réelles)
  useEffect(() => {
    // Simuler le chargement d'un niveau
    const mockLevel: Level = {
      id: '1',
      levelNumber: 1,
      title: "Alerte Phishing",
      description: "Un email suspect a été signalé par un employé. Identifiez la menace et prenez les premières mesures.",
      scenario: "Un employé vient de signaler avoir reçu un email suspect lui demandant de changer son mot de passe via un lien externe. Plusieurs autres employés ont peut-être reçu le même message.",
      objectives: [
        "Identifier la nature de l'attaque",
        "Évaluer l'étendue potentielle de l'incident",
        "Prendre des mesures de protection immédiates"
      ],
      complexity: "Basique",
      duration: "10-15 min"
    };
    
    // Simuler les contacts disponibles pour ce niveau
    const mockContacts: Contact[] = [
      {
        id: uuidv4(),
        name: "Yousra Saidani",
        role: "Senior Manager et Experte Cybersécurité",
        expertise: "Cybersécurité et Gestion de Crise",
        avatarInitials: "YS",
        avatarColor: "bg-[#006a9e]",
        unlockedAtLevel: 1,
        isActive: true
      }
    ];
    
    setLevel(mockLevel);
    setContacts(mockContacts);
    setActiveContacts(mockContacts.filter(c => c.isActive));
    
  }, [levelId]);
  
  // Initialiser la session avec un message d'accueil
  useEffect(() => {
    if (level && messages.length === 0 && activeContacts.length > 0) {
      const initialContact = activeContacts[0];
      
      // Message de bienvenue par le contact principal
      const welcomeMessage: Message = {
        id: uuidv4(),
        sender: initialContact.id,
        senderName: initialContact.name,
        senderRole: initialContact.role,
        senderAvatar: initialContact.avatarInitials,
        senderAvatarColor: initialContact.avatarColor,
        content: `Bonjour ${userName || "Responsable"}, je suis ${initialContact.name}, ${initialContact.role}.
        
Nous avons un incident potentiel de sécurité et j'ai besoin de votre expertise immédiatement.

**SITUATION ACTUELLE:**
${level.scenario}

**OBJECTIFS IMMÉDIATS:**
- ${level.objectives.join('\n- ')}

J'attends vos instructions pour agir. Comment souhaitez-vous procéder?`,
        timestamp: Date.now(),
        isSystemMessage: false
      };
      
      // Message système pour donner le contexte
      const systemMessage: Message = {
        id: uuidv4(),
        sender: 'system',
        content: `**NIVEAU ${level.levelNumber}: ${level.title}**
        
Vous êtes dans une simulation de cybersécurité.

Complexité: ${level.complexity}
Durée estimée: ${level.duration}

**COMMENT JOUER:**
- Interagissez avec les experts disponibles
- Prenez des décisions pour résoudre l'incident
- Complétez tous les objectifs pour réussir le niveau
- De nouveaux experts seront débloqués à mesure que vous progressez dans les niveaux`,
        timestamp: Date.now(),
        isSystemMessage: true
      };
      
      setMessages([systemMessage, welcomeMessage]);
    }
  }, [level, messages.length, activeContacts, userName]);
  
  // Faire défiler automatiquement vers le bas lorsque de nouveaux messages sont ajoutés
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  // Gérer l'envoi de messages
  const handleSendMessage = async () => {
    if (!userInput.trim() || loading) return;
    
    // Créer le message de l'utilisateur
    const userMessage: Message = {
      id: uuidv4(),
      sender: 'user',
      content: userInput,
      timestamp: Date.now(),
      isSystemMessage: false
    };
    
    // Ajouter le message à la liste des messages
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setLoading(true);
    
    try {
      // Dans un environnement réel, appeler l'API pour obtenir une réponse
      // Simuler un délai pour l'effet de chargement
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Exemple de réponse pour la démonstration
      const respondingContact = activeContacts[0];
      const responseMessage: Message = {
        id: uuidv4(),
        sender: respondingContact.id,
        senderName: respondingContact.name,
        senderRole: respondingContact.role,
        senderAvatar: respondingContact.avatarInitials,
        senderAvatarColor: respondingContact.avatarColor,
        content: `Bonne question. Pour répondre à votre demande concernant cet email suspect:

- Il s'agit très probablement d'une tentative de phishing ciblant nos employés
- Le lien dans l'email pointe vers un domaine qui imite notre portail d'entreprise
- D'après nos logs, 3 autres employés ont signalé avoir reçu des emails similaires

Je vous recommande de demander immédiatement au service IT de bloquer ce domaine et d'envoyer une alerte à tous les employés.

Quelle action souhaitez-vous que nous prenions en priorité?`,
        timestamp: Date.now(),
        isSystemMessage: false
      };
      
      setMessages(prev => [...prev, responseMessage]);
      
      // Simuler la progression
      setProgress(prev => Math.min(prev + 10, 100));
      
      // Si nous atteignons un certain niveau de progression, déverrouiller un nouvel objectif
      if (progress + 10 >= 20 && currentObjective === 0) {
        setCurrentObjective(1);
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Message d'erreur en cas d'échec
      const errorMessage: Message = {
        id: uuidv4(),
        sender: 'system',
        content: "Une erreur est survenue lors de la communication. Veuillez réessayer.",
        timestamp: Date.now(),
        isSystemMessage: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };
  
  // Gérer la soumission du formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };
  
  // Formater le contenu d'un message avec du Markdown simple
  const formatContent = (content: string) => {
    let formattedContent = content
      // Titres
      .replace(/^# (.*$)/gm, '<h1 class="text-xl font-bold my-1">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-lg font-semibold my-1">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-md font-medium my-1">$1</h3>')
      // Mise en évidence
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#006a9e]">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Listes
      .replace(/^- (.*$)/gm, '<li class="flex items-start"><span class="inline-block mr-2 text-[#006a9e]">•</span><span>$1</span></li>');
    
    // Convertir les listes en HTML propre
    const lines = formattedContent.split('\n');
    let inList = false;
    const newLines: string[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.startsWith('<li')) {
        if (!inList) {
          newLines.push('<ul class="my-2 space-y-1">');
          inList = true;
        }
        newLines.push(line);
      } else {
        if (inList) {
          newLines.push('</ul>');
          inList = false;
        }
        newLines.push(line);
      }
    }
    
    if (inList) {
      newLines.push('</ul>');
    }
    
    formattedContent = newLines.join('\n');
    
    // Convertir les sauts de ligne restants en <br>
    formattedContent = formattedContent.replace(/\n/g, '<br>');
    
    return formattedContent;
  };
  
  // Rendu d'un message individuel
  const renderMessage = (message: Message) => {
    const isUser = message.sender === 'user';
    const isSystem = message.isSystemMessage;
    
    // Style du message selon l'expéditeur
    let bgColorClass = isUser 
      ? 'bg-[#006a9e] text-white' 
      : isSystem 
        ? 'bg-[#004a70] text-white' 
        : 'bg-white text-gray-800 border border-[#006a9e]/10';
    
    // Style des coins arrondis
    let roundedClass = isUser
      ? 'rounded-tl-xl rounded-tr-sm rounded-bl-xl rounded-br-xl'
      : 'rounded-tr-xl rounded-tl-sm rounded-bl-xl rounded-br-xl';
    
    return (
      <div key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 w-full`}>
        <div className={`flex ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start w-full max-w-4xl sm:max-w-5xl md:max-w-6xl`}>
          {!isUser && message.senderAvatar && (
            <Avatar className="mt-1 mr-2 flex-shrink-0 h-8 w-8">
              <AvatarFallback className={`text-xs text-white ${message.senderAvatarColor || 'bg-[#006a9e]'}`}>
                {message.senderAvatar}
              </AvatarFallback>
            </Avatar>
          )}
          
          <div className={`${bgColorClass} ${roundedClass} p-3 shadow-sm w-full sm:w-auto sm:min-w-[70%]`}>
            {!isUser && message.senderName && (
              <div className="flex items-center mb-1">
                <span className="font-semibold text-sm">{message.senderName}</span>
                {message.senderRole && (
                  <span className="text-xs bg-white text-[#006a9e] px-1.5 py-0.5 rounded-full ml-1.5 border border-[#006a9e]">
                    {message.senderRole}
                  </span>
                )}
              </div>
            )}
            <div 
              className="markdown-content text-sm" 
              dangerouslySetInnerHTML={{ __html: formatContent(message.content) }} 
            />
            <div className={`text-xs mt-1 ${isUser ? 'text-white opacity-80' : isSystem ? 'text-white opacity-80' : 'text-gray-500 opacity-70'}`}>
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <HomeLayout>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* En-tête avec informations du niveau */}
        <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/cyber-defense-new" className="mr-3">
                <Button variant="ghost" size="icon" className="text-[#006a9e]">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              
              <div>
                <div className="flex items-center">
                  <h1 className="text-lg font-bold text-gray-900">{level?.title || "Niveau de cybersécurité"}</h1>
                  <Badge className="ml-2 bg-[#006a9e]/20 text-[#006a9e]">
                    {level?.complexity || "Niveau 1"}
                  </Badge>
                </div>
                <div className="text-sm text-gray-500">Objectif {currentObjective + 1}/{level?.objectives.length || 3}</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">Progression</div>
                <Progress value={progress} className="w-32 h-2" />
              </div>
              
              <div>
                <div className="text-sm text-gray-600 mb-1">Confiance</div>
                <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all ${
                      confidenceLevel > 70 ? 'bg-[#006a9e]' : 
                      confidenceLevel > 40 ? 'bg-[#006a9e]/70' : 
                      'bg-[#006a9e]/50'
                    }`}
                    style={{ width: `${confidenceLevel}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Contenu principal */}
        <div className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full">
          {/* Chat */}
          <div className="flex-1 flex flex-col w-full md:border-r border-gray-200">
            {/* Messages */}
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4"
              style={{ height: 'calc(100vh - 140px)' }}
            >
              <AnimatePresence>
                {messages.map(message => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {renderMessage(message)}
                  </motion.div>
                ))}
                
                {loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start mb-4"
                  >
                    <div className="bg-gray-100 rounded-md p-3 flex items-center space-x-2">
                      <div className="w-2 h-2 bg-[#006a9e] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-[#006a9e] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-[#006a9e] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Zone de saisie */}
            <div className="border-t border-gray-200 bg-white p-4 sticky bottom-0">
              <form onSubmit={handleSubmit} className="flex space-x-2">
                <textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Tapez votre message..."
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006a9e] focus:border-transparent text-black resize-none h-10 min-h-[40px] max-h-[120px] overflow-auto"
                  disabled={loading}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (userInput.trim() && !loading) {
                        handleSubmit(e);
                      }
                    }
                  }}
                  rows={1}
                />
                
                <Button 
                  type="submit" 
                  disabled={loading || !userInput.trim()}
                  className="bg-[#006a9e] hover:bg-[#005a8e] text-white h-10"
                >
                  {loading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </form>
              
              {loading && (
                <div className="w-full flex justify-center mt-1">
                  <div className="text-xs text-[#006a9e] flex items-center">
                    <div className="mr-2 h-2 w-2 animate-pulse rounded-full bg-[#006a9e]"></div>
                    Le contact est en train de répondre...
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Sidebar avec détails du niveau et contacts - Masqué sur mobile */}
          <div className="hidden md:block w-80 bg-white overflow-y-auto" style={{ height: 'calc(100vh - 64px)' }}>
            <div className="p-4">
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-[#006a9e]">Objectifs</h3>
                <div className="space-y-3">
                  {level?.objectives.map((objective, idx) => (
                    <div key={idx} className="flex items-start">
                      <div className={`flex-shrink-0 w-5 h-5 rounded-full mr-3 flex items-center justify-center ${
                        currentObjective > idx 
                          ? 'bg-[#006a9e] text-white' 
                          : currentObjective === idx 
                            ? 'bg-[#006a9e]/80 text-white'
                            : 'bg-gray-200'
                      }`}>
                        {currentObjective > idx && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                      <p className={`${
                        currentObjective > idx 
                          ? 'text-gray-500 line-through' 
                          : currentObjective === idx 
                            ? 'text-gray-900 font-medium'
                            : 'text-gray-600'
                      }`}>
                        {objective}
                      </p>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-[#006a9e] mb-2">Progression</h4>
                  <Progress value={progress} className="h-2 mb-1" />
                  <p className="text-xs text-gray-500">{progress}% complété</p>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-[#006a9e]">Interlocuteurs</h3>
                <div className="space-y-3">
                  {activeContacts.map((contact, idx) => (
                    <div key={idx} className="bg-gray-50 p-3 rounded-md">
                      <div className="flex items-center mb-1">
                        <Avatar className="w-6 h-6 mr-2">
                          <AvatarFallback className={`text-xs text-white ${contact.avatarColor}`}>
                            {contact.avatarInitials}
                          </AvatarFallback>
                        </Avatar>
                        <p className="font-medium text-[#006a9e]">{contact.name}</p>
                      </div>
                      <p className="text-sm text-gray-600">{contact.role}</p>
                      <p className="text-xs text-gray-500 mt-1">{contact.expertise}</p>
                    </div>
                  ))}
                  
                  {/* Contacts verrouillés (grisés) */}
                  {contacts.filter(c => !c.isActive).length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs text-gray-500 mb-2">Débloquez d'autres niveaux pour accéder à plus d'experts :</p>
                      {contacts.filter(c => !c.isActive).map((contact, idx) => (
                        <div key={idx} className="bg-gray-100 p-3 rounded-md mb-2 opacity-50">
                          <div className="flex items-center">
                            <Avatar className="w-6 h-6 mr-2">
                              <AvatarFallback className="text-xs bg-gray-300 text-gray-500">
                                {contact.avatarInitials}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-gray-400">{contact.name}</p>
                              <p className="text-xs text-gray-400">Disponible au niveau {contact.unlockedAtLevel}</p>
                            </div>
                            <div className="ml-auto">
                              <Lock className="h-4 w-4 text-gray-400" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-[#006a9e]">Votre niveau</h3>
                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="flex items-center mb-3">
                    <Avatar className="w-8 h-8 mr-2">
                      <AvatarFallback className="bg-[#006a9e] text-white">
                        {userName ? userName.charAt(0) : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-900">{userName || "Utilisateur"}</p>
                      <p className="text-xs text-gray-500">Responsable Cybersécurité</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="bg-white p-2 rounded border border-gray-200">
                      <div className="flex items-center justify-center mb-1">
                        <Brain className="h-3 w-3 mr-1 text-[#006a9e]" />
                        <span className="text-[#006a9e] font-medium">Expertise</span>
                      </div>
                      <span className="text-gray-700">Niveau {Math.floor(progress / 20) + 1}</span>
                    </div>
                    
                    <div className="bg-white p-2 rounded border border-gray-200">
                      <div className="flex items-center justify-center mb-1">
                        <Clock className="h-3 w-3 mr-1 text-[#006a9e]" />
                        <span className="text-[#006a9e] font-medium">Temps</span>
                      </div>
                      <span className="text-gray-700">{level?.duration}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}