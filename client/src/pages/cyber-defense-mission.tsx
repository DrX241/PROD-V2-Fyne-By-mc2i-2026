import React, { useState, useEffect, useRef } from 'react';
import { useRoute, Link } from 'wouter';
import { 
  Shield, AlertTriangle, Database, FileWarning, Users, User, 
  AlertCircle, Clock, Zap, Send, CheckCircle, ArrowLeft,
  ListTodo, FileCheck, Menu, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { motion, AnimatePresence } from 'framer-motion';
import HomeLayout from '@/components/layout/HomeLayout';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { useChatContext } from '@/contexts/ChatContext';

// Types
interface Message {
  id: string;
  role: "system" | "user" | "assistant";
  content: string;
  sender?: string;
  senderRole?: string;
  timestamp: number;
}

interface Mission {
  id: string;
  title: string;
  description: string;
  difficulty: "Débutant" | "Intermédiaire" | "Expert";
  duration: string;
  tags: string[];
  scenario: string;
  objectives: string[];
  contacts: Array<{
    name: string;
    role: string;
    expertise: string;
  }>;
}

// Mapping des couleurs de fond en fonction du niveau de difficulté
const difficultyColor = {
  "Débutant": "bg-green-100 text-green-800",
  "Intermédiaire": "bg-amber-100 text-amber-800",
  "Expert": "bg-red-100 text-red-800"
};

// Composant pour un message dans le chat
const ChatMessage = ({ message }: { message: Message }) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start max-w-3xl`}>
        {!isUser && message.sender && (
          <Avatar className="mt-1 mr-3">
            <AvatarFallback className="bg-blue-100 text-blue-700">
              {message.sender.split(' ').map(word => word[0]).join('')}
            </AvatarFallback>
          </Avatar>
        )}
        
        <div className={`${isUser 
          ? 'bg-green-600 text-white rounded-tl-xl rounded-tr-none'
          : 'bg-gray-100 text-gray-800 rounded-tr-xl rounded-tl-none'
        } rounded-bl-xl rounded-br-xl p-4 shadow-sm`}
        >
          {!isUser && message.sender && (
            <div className="flex items-center mb-2">
              <span className="font-semibold">{message.sender}</span>
              {message.senderRole && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full ml-2">
                  {message.senderRole}
                </span>
              )}
            </div>
          )}
          <div className="whitespace-pre-wrap">{message.content}</div>
          <div className={`text-xs mt-2 ${isUser ? 'text-green-200' : 'text-gray-500'}`}>
            {new Date(message.timestamp).toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant principal de la page de mission
export default function CyberDefenseMission() {
  const [, params] = useRoute('/cyber-defense/mission/:id');
  const missionId = params?.id;
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [progress, setProgress] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentObjective, setCurrentObjective] = useState(0);
  const { userName } = useChatContext();
  
  // Données de la mission (à terme, ces données devraient être chargées dynamiquement en fonction de l'ID de mission)
  const mission: Mission = {
    id: missionId || '',
    title: "Contrer une campagne de phishing massive",
    description: "Une campagne de phishing sophistiquée cible les employés de votre entreprise. En tant que responsable de la sécurité, vous devez prendre rapidement les bonnes décisions pour limiter l'impact et protéger l'organisation.",
    difficulty: "Débutant",
    duration: "15-20 min",
    tags: ["Phishing", "Sensibilisation", "Communication de crise"],
    scenario: "Une vague de messages frauduleux contenant des liens malveillants est envoyée aux employés de CyberTech Solutions sous couvert d'une urgence concernant leurs avantages sociaux. Plusieurs collaborateurs ont déjà cliqué sur les liens et fourni leurs identifiants professionnels. L'équipe cybersécurité commence à détecter des connexions suspectes provenant de localisations inhabituelles.",
    objectives: [
      "Évaluer l'ampleur de la compromission",
      "Contenir la menace et bloquer l'attaque",
      "Mettre en place une communication efficace",
      "Récupérer les systèmes affectés",
      "Proposer des mesures préventives"
    ],
    contacts: [
      {
        name: "Sophie Dupont",
        role: "Analyste SOC",
        expertise: "Détection d'intrusion et analyse de logs"
      },
      {
        name: "Marc Lefort",
        role: "Administrateur Système",
        expertise: "Infrastructure et gestion des accès"
      },
      {
        name: "Jeanne Martin",
        role: "Responsable Communication",
        expertise: "Communication interne et gestion de crise"
      }
    ]
  };
  
  // Initialisation de la mission
  useEffect(() => {
    if (messages.length === 0) {
      // Message d'introduction de présentation du scénario
      const introMessage: Message = {
        id: uuidv4(),
        role: "assistant",
        content: `# Alerte de Cybersécurité
        
Bonjour ${userName || "Responsable Cybersécurité"},

Nous sommes le ${new Date().toLocaleDateString()} et une campagne de phishing sophistiquée vient d'être détectée ciblant les employés de CyberTech Solutions. Plusieurs collaborateurs ont déjà cliqué sur les liens malveillants et fourni leurs identifiants.

En tant que responsable cybersécurité, vous êtes chargé(e) de gérer cette crise.

**Contexte:**
${mission.scenario}

**Vos objectifs:**
${mission.objectives.map((obj, i) => `${i+1}. ${obj}`).join('\n')}

Votre équipe est mobilisée et attend vos instructions. Comment souhaitez-vous procéder ?`,
        timestamp: Date.now()
      };
      
      // Message de présentation des contacts disponibles
      const contactMessage: Message = {
        id: uuidv4(),
        role: "assistant",
        content: `**Interlocuteurs disponibles:**
        
Vous pouvez échanger avec les experts suivants pour les aider à prendre les bonnes décisions :

${mission.contacts.map(contact => 
  `- **${contact.name}** (${contact.role}) - ${contact.expertise}`
).join('\n')}

Pour commencer, vous pourriez demander un rapport de situation à Sophie Dupont (Analyste SOC) ou discuter de mesures immédiates avec Marc Lefort (Administrateur Système).`,
        timestamp: Date.now()
      };
      
      setMessages([introMessage, contactMessage]);
    }
  }, [mission, userName, messages.length]);
  
  // Faire défiler automatiquement vers le bas lorsque de nouveaux messages sont ajoutés
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  // Gérer l'envoi de messages
  const handleSendMessage = async () => {
    if (!userInput.trim()) return;
    
    // Ajouter le message de l'utilisateur
    const userMessage: Message = {
      id: uuidv4(),
      role: "user",
      content: userInput,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setLoading(true);
    
    try {
      // Plutôt que d'appeler Azure OpenAI directement (ce qui sera implémenté plus tard),
      // nous simulons la réponse pour illustrer le fonctionnement
      
      // Exemple de réponse simulée (à remplacer par l'appel API réel)
      setTimeout(() => {
        let responseContent = '';
        let sender = '';
        let senderRole = '';
        
        // Simulating different responses based on user input and previous messages
        if (userInput.toLowerCase().includes('sophie') || userInput.toLowerCase().includes('analyse') || userInput.toLowerCase().includes('logs')) {
          sender = 'Sophie Dupont';
          senderRole = 'Analyste SOC';
          responseContent = `D'après mon analyse préliminaire des logs, nous avons détecté 27 clics sur le lien malveillant au cours des deux dernières heures. 12 utilisateurs ont entré leurs identifiants sur la page frauduleuse, dont 3 administrateurs systèmes.

Nous observons des tentatives de connexion suspectes sur notre VPN et notre serveur de messagerie avec ces identifiants compromis. J'ai temporairement bloqué ces comptes pour limiter les dégâts.

Le mail de phishing semble provenir d'une adresse imitant notre service RH, avec un ton d'urgence concernant une "modification immédiate des avantages sociaux". Nous avons récupéré un échantillon du mail et analysé le domaine frauduleux : benefits-cybertech-solutions.com, enregistré il y a seulement 48 heures.

Que souhaitez-vous que nous fassions en priorité ?`;
          
          // Progression à jour
          if (currentObjective === 0) {
            setCurrentObjective(1);
            setProgress(20);
          }
        } 
        else if (userInput.toLowerCase().includes('marc') || userInput.toLowerCase().includes('admin') || userInput.toLowerCase().includes('système') || userInput.toLowerCase().includes('systeme')) {
          sender = 'Marc Lefort';
          senderRole = 'Administrateur Système';
          responseContent = `À la demande de Sophie, j'ai déjà bloqué l'accès aux comptes compromis identifiés. Si vous l'autorisez, je peux également :

1. Forcer une réinitialisation des mots de passe pour l'ensemble des utilisateurs (mesure drastique mais efficace)
2. Bloquer l'accès au domaine frauduleux au niveau de notre pare-feu
3. Activer temporairement l'authentification à double facteur pour tous les accès distants
4. Surveiller en temps réel les activités suspectes sur le réseau

Certaines de ces mesures pourraient perturber les opérations normales de l'entreprise, mais limiteraient considérablement la portée de l'attaque. Quelles actions souhaitez-vous que je mette en œuvre immédiatement ?`;
          
          if (currentObjective === 1) {
            setCurrentObjective(2);
            setProgress(40);
          }
        } 
        else if (userInput.toLowerCase().includes('jeanne') || userInput.toLowerCase().includes('communication') || userInput.toLowerCase().includes('informer')) {
          sender = 'Jeanne Martin';
          senderRole = 'Responsable Communication';
          responseContent = `Je peux préparer plusieurs types de communications :

1. Une alerte immédiate à tous les employés concernant cette tentative de phishing, avec des captures d'écran du mail frauduleux pour qu'ils puissent l'identifier
2. Des instructions claires sur la façon de signaler tout comportement suspect
3. Un modèle de communication pour les employés dont les comptes ont été compromis
4. Une communication pour la direction générale sur la situation et nos actions

Comment souhaitez-vous procéder ? Avez-vous des consignes particulières concernant le ton ou le contenu de ces communications ?`;
          
          if (currentObjective === 2) {
            setCurrentObjective(3);
            setProgress(60);
          }
        }
        else if (userInput.toLowerCase().includes('récupération') || userInput.toLowerCase().includes('récupérer') || userInput.toLowerCase().includes('restauration') || userInput.toLowerCase().includes('restaurer')) {
          sender = 'Marc Lefort';
          senderRole = 'Administrateur Système';
          responseContent = `Pour la récupération des systèmes affectés, voici ce que nous pouvons mettre en place :

1. J'ai préparé une procédure de restauration sécurisée pour les comptes compromis
2. Nous avons isolé les postes de travail qui présentent un comportement suspect
3. Les sauvegardes sont disponibles et prêtes à être utilisées si nécessaire
4. Nous pouvons déployer un outil de détection supplémentaire pour identifier d'éventuels malwares

Avec votre autorisation, nous allons commencer la procédure de récupération.`;
          
          if (currentObjective === 3) {
            setCurrentObjective(4);
            setProgress(80);
          }
        }
        else if (userInput.toLowerCase().includes('prévention') || userInput.toLowerCase().includes('prévenir') || userInput.toLowerCase().includes('mesures') || userInput.toLowerCase().includes('avenir')) {
          sender = 'Sophie Dupont';
          senderRole = 'Analyste SOC';
          responseContent = `Basé sur cet incident, je recommande les mesures préventives suivantes :

1. Renforcer la formation de sensibilisation au phishing pour tous les employés, avec des simulations régulières
2. Déployer un système d'analyse des e-mails plus performant avec filtrage avancé
3. Mettre en place l'authentification multi-facteurs pour tous les utilisateurs
4. Revoir nos procédures d'escalade et notre plan de réponse aux incidents
5. Effectuer un audit de sécurité complet pour identifier d'autres vulnérabilités potentielles

Ces mesures nous aideront à mieux nous préparer face à de futures tentatives similaires.`;
          
          if (currentObjective === 4) {
            setProgress(100);
            
            // Ajouter un message de conclusion après 2 secondes
            setTimeout(() => {
              const conclusionMessage: Message = {
                id: uuidv4(),
                role: "assistant",
                content: `# Mission terminée !

Félicitations ${userName || "Responsable"} ! Vous avez géré avec succès l'incident de phishing qui ciblait CyberTech Solutions.

**Vos réalisations :**
✅ Évaluation rapide de l'ampleur de la compromission
✅ Mise en place de mesures de containment efficaces
✅ Établissement d'une communication claire avec les parties prenantes
✅ Récupération des systèmes affectés
✅ Proposition de mesures préventives pertinentes

Cette expérience démontre l'importance d'une réponse coordonnée face aux menaces de phishing, qui restent l'un des vecteurs d'attaque les plus courants. Votre leadership a permis de limiter l'impact de cet incident et de renforcer la posture de sécurité de l'organisation.

Souhaitez-vous :
1. Revoir cette mission
2. Essayer une autre mission
3. Revenir à l'accueil`,
                timestamp: Date.now()
              };
              
              setMessages(prev => [...prev, conclusionMessage]);
            }, 2000);
          }
        }
        else {
          // Réponse générique
          const randomContact = mission.contacts[Math.floor(Math.random() * mission.contacts.length)];
          sender = randomContact.name;
          senderRole = randomContact.role;
          responseContent = `Je comprends votre demande. Notre équipe est mobilisée pour contrer cette attaque de phishing. 

Pourriez-vous préciser quelles informations vous recherchez ou quelles actions vous souhaitez que nous mettions en place ? Nous avons plusieurs options disponibles selon l'aspect de la crise que vous souhaitez traiter en priorité.`;
        }
        
        const botMessage: Message = {
          id: uuidv4(),
          role: "assistant",
          content: responseContent,
          sender,
          senderRole,
          timestamp: Date.now()
        };
        
        setMessages(prev => [...prev, botMessage]);
        setLoading(false);
      }, 1500);
      
    } catch (error) {
      console.error('Error sending message:', error);
      setLoading(false);
    }
  };
  
  // Gérer la soumission du formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };
  
  return (
    <HomeLayout>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header avec informations de la mission */}
        <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Link href="/cyber-defense">
                  <Button variant="ghost" size="icon" className="mr-3">
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 hidden md:block">{mission.title}</h1>
                  <h1 className="text-lg font-bold text-gray-900 md:hidden">Mission en cours</h1>
                  <div className="flex items-center mt-1 space-x-2">
                    <Badge className={difficultyColor[mission.difficulty]}>
                      {mission.difficulty}
                    </Badge>
                    <Badge variant="outline">
                      <Clock className="w-3.5 h-3.5 mr-1" /> {mission.duration}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="md:hidden">
                <Button variant="outline" size="icon" onClick={() => setMobileMenuOpen(true)}>
                  <Menu className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="hidden md:block">
                <div className="flex items-center">
                  <div className="mr-4">
                    <div className="text-sm text-gray-600 mb-1">Progression</div>
                    <Progress value={progress} className="w-40 h-2" />
                  </div>
                  <div>
                    <Badge variant="outline" className="ml-2">
                      {progress === 100 ? (
                        <span className="flex items-center text-green-600">
                          <CheckCircle className="w-3.5 h-3.5 mr-1" /> Complété
                        </span>
                      ) : (
                        <span>Objectif {currentObjective + 1}/{mission.objectives.length}</span>
                      )}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Contenu principal */}
        <div className="flex-1 flex flex-col md:flex-row">
          {/* Chat */}
          <div className="flex-1 flex flex-col max-w-full">
            {/* Messages */}
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 md:p-6"
              style={{ maxHeight: 'calc(100vh - 64px - 80px)' }}
            >
              {messages.map(message => (
                <ChatMessage key={message.id} message={message} />
              ))}
              
              {loading && (
                <div className="flex justify-start mb-4">
                  <div className="bg-gray-100 rounded-xl p-4 max-w-md animate-pulse">
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Input */}
            <div className="border-t border-gray-200 bg-white p-4">
              <form onSubmit={handleSubmit} className="flex space-x-2">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Tapez votre message..."
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={loading}
                />
                <Button 
                  type="submit" 
                  disabled={loading || !userInput.trim()}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </form>
            </div>
          </div>
          
          {/* Sidebar with mission details - Hidden on mobile */}
          <div className="hidden md:block w-80 bg-white border-l border-gray-200 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 64px)' }}>
            <div className="p-6">
              <Tabs defaultValue="objectives">
                <TabsList className="w-full">
                  <TabsTrigger value="objectives" className="flex-1">
                    <ListTodo className="h-4 w-4 mr-2" /> Objectifs
                  </TabsTrigger>
                  <TabsTrigger value="brief" className="flex-1">
                    <FileCheck className="h-4 w-4 mr-2" /> Briefing
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="objectives" className="pt-4">
                  <h3 className="text-lg font-semibold mb-3">Objectifs de la mission</h3>
                  <div className="space-y-3">
                    {mission.objectives.map((objective, idx) => (
                      <div key={idx} className="flex items-start">
                        <div className={`flex-shrink-0 w-5 h-5 rounded-full mr-3 flex items-center justify-center ${
                          currentObjective > idx 
                            ? 'bg-green-500 text-white' 
                            : currentObjective === idx 
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200'
                        }`}>
                          {currentObjective > idx && <CheckCircle className="w-4 h-4" />}
                        </div>
                        <div>
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
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Progression</h4>
                    <Progress value={progress} className="h-2 mb-1" />
                    <p className="text-xs text-gray-500">{progress}% complété</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="brief" className="pt-4">
                  <h3 className="text-lg font-semibold mb-3">Briefing</h3>
                  <div className="prose prose-sm">
                    <p className="text-gray-700 mb-4">{mission.scenario}</p>
                    
                    <h4 className="text-md font-medium mb-2">Contacts disponibles</h4>
                    <div className="space-y-3">
                      {mission.contacts.map((contact, idx) => (
                        <div key={idx} className="bg-gray-50 p-3 rounded-md">
                          <div className="flex items-center mb-1">
                            <Avatar className="w-6 h-6 mr-2">
                              <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                                {contact.name.split(' ').map(word => word[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <p className="font-medium">{contact.name}</p>
                          </div>
                          <p className="text-sm text-gray-600">{contact.role}</p>
                          <p className="text-xs text-gray-500 mt-1">{contact.expertise}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="right" className="w-[300px] sm:w-[400px]">
          <div className="h-full flex flex-col">
            <div className="flex justify-between items-center py-4">
              <h2 className="text-xl font-bold">Détails de la mission</h2>
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <Tabs defaultValue="objectives" className="flex-1">
              <TabsList className="w-full">
                <TabsTrigger value="objectives" className="flex-1">
                  <ListTodo className="h-4 w-4 mr-2" /> Objectifs
                </TabsTrigger>
                <TabsTrigger value="brief" className="flex-1">
                  <FileCheck className="h-4 w-4 mr-2" /> Briefing
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="objectives" className="pt-4 flex-1">
                <div className="mb-4">
                  <Progress value={progress} className="h-2 mb-1" />
                  <p className="text-xs text-gray-500">{progress}% complété</p>
                </div>
                
                <h3 className="text-lg font-semibold mb-3">Objectifs de la mission</h3>
                <div className="space-y-3">
                  {mission.objectives.map((objective, idx) => (
                    <div key={idx} className="flex items-start">
                      <div className={`flex-shrink-0 w-5 h-5 rounded-full mr-3 flex items-center justify-center ${
                        currentObjective > idx 
                          ? 'bg-green-500 text-white' 
                          : currentObjective === idx 
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200'
                      }`}>
                        {currentObjective > idx && <CheckCircle className="w-4 h-4" />}
                      </div>
                      <div>
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
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="brief" className="pt-4">
                <h3 className="text-lg font-semibold mb-3">Briefing</h3>
                <div className="prose prose-sm">
                  <p className="text-gray-700 mb-4">{mission.scenario}</p>
                  
                  <h4 className="text-md font-medium mb-2">Contacts disponibles</h4>
                  <div className="space-y-3">
                    {mission.contacts.map((contact, idx) => (
                      <div key={idx} className="bg-gray-50 p-3 rounded-md">
                        <div className="flex items-center mb-1">
                          <Avatar className="w-6 h-6 mr-2">
                            <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                              {contact.name.split(' ').map(word => word[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <p className="font-medium">{contact.name}</p>
                        </div>
                        <p className="text-sm text-gray-600">{contact.role}</p>
                        <p className="text-xs text-gray-500 mt-1">{contact.expertise}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="py-4">
              <Button variant="outline" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                Retour au chat
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </HomeLayout>
  );
}