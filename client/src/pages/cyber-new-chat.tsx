import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import {
  ArrowLeft,
  Settings,
  ShieldCheck,
  Bot,
  Send,
  User,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

// Type pour les messages
interface ChatMessage {
  id: string;
  type: 'user' | 'bot' | 'system';
  content: string;
  timestamp: number;
}

// Type pour la configuration du chatbot
interface AIConfig {
  difficultyLevel: string;
  responseStyle: string;
  temperature: number;
  maxTokens: number;
}

export default function CyberNewChat() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const messageEndRef = useRef<HTMLDivElement>(null);
  
  // États
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [chatConfig, setChatConfig] = useState<AIConfig>({
    difficultyLevel: 'Intermédiaire',
    responseStyle: 'Détaillé et pédagogique',
    temperature: 0.7,
    maxTokens: 800
  });
  
  // Effet pour charger la configuration
  useEffect(() => {
    // Récupérer la configuration du localStorage
    const savedConfig = localStorage.getItem('cyberChatConfig');
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        setChatConfig(parsedConfig);
      } catch (error) {
        console.error('Erreur lors du chargement de la configuration:', error);
      }
    }
    
    // Ajouter un message de bienvenue
    const welcomeMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'system',
      content: "Bienvenue dans le module I AM CYBER. Je suis votre assistant en cybersécurité et je suis là pour répondre à vos questions et vous aider à développer vos compétences. Comment puis-je vous aider aujourd'hui?",
      timestamp: Date.now()
    };
    
    setMessages([welcomeMessage]);
  }, []);
  
  // Effet pour faire défiler vers le bas lorsque de nouveaux messages sont ajoutés
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: messageInput,
      timestamp: Date.now()
    };
    
    // Ajouter temporairement le message à l'interface
    setMessages([...messages, userMessage]);
    setMessageInput('');
    setIsSending(true);
    
    try {
      // Simuler une réponse de l'IA (à remplacer par un vrai appel API)
      setTimeout(() => {
        const botResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: generateBotResponse(messageInput, chatConfig),
          timestamp: Date.now() + 1
        };
        
        setMessages(prevMessages => [...prevMessages, botResponse]);
        setIsSending(false);
      }, 1500); // Simuler un délai de réponse
      
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'envoi du message",
      });
      setIsSending(false);
    }
  };
  
  // Fonction simple pour générer une réponse basée sur la configuration
  // A remplacer par une vrai appel API
  const generateBotResponse = (userInput: string, config: AIConfig): string => {
    const responsePrefix = config.difficultyLevel === 'Expert' 
      ? "En tant qu'expert, je vous suggère de considérer que "
      : config.difficultyLevel === 'Débutant'
        ? "Pour vous aider à comprendre simplement, "
        : "Voici une analyse équilibrée: ";
        
    const responseStyle = config.responseStyle === 'Détaillé et pédagogique'
      ? " Laissez-moi vous expliquer en détail pourquoi c'est important et comment l'appliquer."
      : config.responseStyle === 'Concis et direct'
        ? " Voici les points essentiels à retenir."
        : " Voici une explication professionnelle de la situation.";
    
    // Thèmes de cybersécurité courants pour les réponses
    const cyberTopics = [
      "La sécurité des mots de passe est fondamentale. Utilisez des mots de passe uniques et complexes pour chaque compte.",
      "Les attaques de phishing restent l'une des méthodes les plus courantes pour compromettre des systèmes.",
      "La sécurité n'est pas seulement une question technique, mais aussi une question de comportement et de sensibilisation.",
      "Les mises à jour logicielles régulières sont essentielles pour se protéger contre les vulnérabilités connues.",
      "L'authentification à deux facteurs ajoute une couche de sécurité supplémentaire à vos comptes."
    ];
    
    // Choisir un thème aléatoire en fonction de l'entrée utilisateur
    const inputLower = userInput.toLowerCase();
    let responseContent = "";
    
    if (inputLower.includes("mot de passe") || inputLower.includes("password")) {
      responseContent = cyberTopics[0];
    } else if (inputLower.includes("phishing") || inputLower.includes("email") || inputLower.includes("arnaque")) {
      responseContent = cyberTopics[1];
    } else if (inputLower.includes("comportement") || inputLower.includes("sensibilisation")) {
      responseContent = cyberTopics[2];
    } else if (inputLower.includes("mise à jour") || inputLower.includes("update") || inputLower.includes("patch")) {
      responseContent = cyberTopics[3];
    } else if (inputLower.includes("authentification") || inputLower.includes("2fa") || inputLower.includes("deux facteurs")) {
      responseContent = cyberTopics[4];
    } else {
      // Réponse générique si aucun mot-clé n'est détecté
      responseContent = cyberTopics[Math.floor(Math.random() * cyberTopics.length)];
    }
    
    return responsePrefix + responseContent + responseStyle;
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const resetChat = () => {
    // Réinitialiser la conversation
    const welcomeMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'system',
      content: "Chat réinitialisé. Comment puis-je vous aider aujourd'hui?",
      timestamp: Date.now()
    };
    
    setMessages([welcomeMessage]);
    setMessageInput('');
    
    toast({
      title: "Chat réinitialisé",
      description: "La conversation a été réinitialisée avec succès",
    });
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                className="text-white hover:bg-white/20" 
                onClick={() => setLocation('/')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Accueil
              </Button>
              <h1 className="text-xl font-bold">I AM CYBER</h1>
            </div>
            
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                className="border-white/30 text-white hover:bg-white/20"
                onClick={() => setLocation('/cyber-chat-config')}
              >
                <Settings className="h-3.5 w-3.5 mr-1" />
                Paramètres
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="border-white/30 text-white hover:bg-white/20"
                onClick={resetChat}
                disabled={isLoading}
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1" />
                Réinitialiser
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-grow p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-md">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg flex items-center">
                  <ShieldCheck className="mr-2 h-5 w-5 text-blue-500" />
                  Votre Assistant IA Cybersécurité
                </CardTitle>
                <div className="flex items-center text-sm text-gray-500 space-x-2">
                  <span>Niveau: {chatConfig.difficultyLevel}</span>
                  <span>•</span>
                  <span>Style: {chatConfig.responseStyle}</span>
                </div>
              </div>
              <Separator />
            </CardHeader>
            
            <CardContent className="pt-4">
              <div className="space-y-4 h-[calc(65vh-100px)] overflow-y-auto px-1">
                {messages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.type === 'system' && (
                      <div className="bg-blue-50 text-blue-800 rounded-lg p-3 max-w-[85%] text-sm">
                        <p>{message.content}</p>
                      </div>
                    )}
                    
                    {message.type === 'bot' && (
                      <div className="flex space-x-2 max-w-[85%]">
                        <Avatar className="h-8 w-8 mt-1">
                          <AvatarFallback className="bg-blue-100">
                            <Bot className="h-4 w-4 text-blue-600" />
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                          <div className="text-xs text-blue-600 font-medium mb-1">
                            Assistant IA • Cybersécurité
                          </div>
                          <p className="text-gray-800 whitespace-pre-line">{message.content}</p>
                        </div>
                      </div>
                    )}
                    
                    {message.type === 'user' && (
                      <div className="flex space-x-2 max-w-[85%]">
                        <div className="bg-blue-600 text-white rounded-lg p-3 shadow-sm">
                          <p className="whitespace-pre-line">{message.content}</p>
                        </div>
                        
                        <Avatar className="h-8 w-8 mt-1">
                          <AvatarFallback className="bg-blue-600 text-white">
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    )}
                  </div>
                ))}
                
                {isSending && (
                  <div className="flex justify-start">
                    <div className="flex space-x-2 max-w-[85%]">
                      <Avatar className="h-8 w-8 mt-1">
                        <AvatarFallback className="bg-blue-100">
                          <Bot className="h-4 w-4 text-blue-600" />
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                        <div className="text-xs text-blue-600 font-medium mb-1">
                          Assistant IA écrit...
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messageEndRef} />
              </div>
            </CardContent>
            
            <CardFooter>
              <div className="relative w-full">
                <Textarea
                  placeholder="Posez une question sur la cybersécurité..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="pr-24 resize-none"
                  rows={3}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || isSending}
                  className="absolute bottom-2 right-2 bg-blue-600 hover:bg-blue-700"
                >
                  {isSending ? 
                    <Loader2 className="h-4 w-4 animate-spin" /> : 
                    <>
                      <Send className="h-4 w-4 mr-1" /> Envoyer
                    </>
                  }
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}