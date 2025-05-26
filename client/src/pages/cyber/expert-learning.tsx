import React, { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, ChevronDown, RefreshCw, Bot, X, ArrowLeft, FileText, Plus, Home, Lightbulb as LightbulbIcon } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import HomeLayout from "@/components/layout/HomeLayout";
import PageTitle from "@/components/utils/PageTitle";
import { apiRequest } from "@/lib/queryClient";
import DOMPurify from 'dompurify';
import { useLocation } from 'wouter';

// Fonction pour obtenir un message informatif contextuel basé sur l'index
const getMessage = (index: number): string => {
  const messages = [
    "Dans une attaque par phishing, les cybercriminels utilisent souvent des urgences fictives pour vous pousser à agir sans réfléchir. Prenez toujours le temps d'analyser tout email urgent.",
    "80% des violations de données sont dues à des mots de passe faibles ou réutilisés. Utilisez un gestionnaire de mots de passe pour créer et stocker des mots de passe uniques.",
    "L'authentification à deux facteurs (2FA) réduit le risque de piratage de compte de plus de 99%, même si votre mot de passe est compromis.",
    "Les ransomwares sont distribués principalement par phishing (emails), exploitation de vulnérabilités, et connexions à distance non sécurisées.",
    "Les VPN (réseaux privés virtuels) chiffrent votre trafic internet, mais ne protègent pas contre toutes les menaces. Ils doivent faire partie d'une stratégie de sécurité plus large.",
    "Les mises à jour de sécurité sont cruciales - plus de 60% des violations de données exploitent des vulnérabilités pour lesquelles des correctifs étaient disponibles.",
    "Le Wi-Fi public est risqué! Utilisez toujours un VPN sur les réseaux Wi-Fi publics, ou préférez la connexion mobile de votre téléphone.",
    "La sécurité physique est souvent négligée. Verrouillez votre écran lorsque vous vous absentez et utilisez un filtre de confidentialité en public."
  ];
  
  // Utiliser modulo pour toujours renvoyer un message valide, même si l'index dépasse le tableau
  return messages[index % messages.length];
};

// Fonction pour obtenir la couleur de badge basée sur l'index du message
const getBadgeColor = (index: number): string => {
  const colors = [
    "bg-blue-500/20 text-blue-300 border-blue-500/30",
    "bg-green-500/20 text-green-300 border-green-500/30",
    "bg-purple-500/20 text-purple-300 border-purple-500/30",
    "bg-orange-500/20 text-orange-300 border-orange-500/30",
    "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    "bg-red-500/20 text-red-300 border-red-500/30",
    "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    "bg-pink-500/20 text-pink-300 border-pink-500/30"
  ];
  
  return colors[index % colors.length];
};

// Fonction pour obtenir l'icône basée sur l'index du message
const getMessageIcon = (index: number): React.ReactNode => {
  const icons = [
    <Bot className="h-4 w-4" />,
    <LightbulbIcon className="h-4 w-4" />,
    <FileText className="h-4 w-4" />,
    <RefreshCw className="h-4 w-4" />,
    <Send className="h-4 w-4" />,
    <ChevronDown className="h-4 w-4" />,
    <Plus className="h-4 w-4" />,
    <Home className="h-4 w-4" />
  ];
  
  return icons[index % icons.length];
};

// Interface pour les messages
interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: number;
}

interface SessionStatus {
  currentStage: "initial" | "questioning" | "confirmation" | "learning";
  needIdentified: boolean;
  needConfirmed: boolean;
  topic?: string;
  readyForDecisionMode?: boolean;
}

// Composant principal avec l'interface d'apprentissage
function ExpertLearningPageContent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus | null>(null);
  const [sessionSummary, setSessionSummary] = useState<string | null>(null);
  
  // État pour les suggestions contextuelles
  const [contextualSuggestions, setContextualSuggestions] = useState<{
    text: string;
    prompt: string;
  }[]>([
    { 
      text: "Comment me protéger contre le phishing ?",
      prompt: "Comment me protéger contre le phishing ?"
    },
    { 
      text: "Explique-moi les ransomwares",
      prompt: "Explique-moi les ransomwares"
    },
    { 
      text: "Comment sécuriser mon Wi-Fi ?",
      prompt: "Comment sécuriser mon Wi-Fi ?"
    },
    { 
      text: "Crée un exercice pratique",
      prompt: "Crée un exercice pratique sur le phishing"
    }
  ]);

  // Refs pour la gestion du scroll et de la zone de texte
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // Fonction pour générer des suggestions contextuelles basées sur le contenu de la conversation
  const getContextualSuggestions = () => {
    // Si la conversation est vide, retourner les suggestions par défaut
    if (messages.length === 0) {
      return [
        { text: "Comment me protéger contre le phishing ?", prompt: "Comment me protéger contre le phishing ?" },
        { text: "Explique-moi les ransomwares", prompt: "Explique-moi les ransomwares" },
        { text: "Comment sécuriser mon Wi-Fi ?", prompt: "Comment sécuriser mon Wi-Fi ?" },
        { text: "Crée un exercice pratique", prompt: "Crée un exercice pratique sur le phishing" }
      ];
    }
    
    // Récupérer les 3 derniers messages pour analyser le contexte
    const recentMessages = messages.slice(-3);
    const combinedContent = recentMessages.map(msg => msg.content).join(' ');
    
    // Liste de mots-clés pour différents sujets de cybersécurité
    const topics = {
      phishing: ["phishing", "email", "hameçonnage", "courriel", "malveillant", "social engineering"],
      ransomware: ["ransomware", "rançongiciel", "chiffrement", "rançon", "malware"],
      passwords: ["mot de passe", "password", "authentification", "mfa", "2fa", "double facteur"],
      network: ["réseau", "wifi", "vpn", "firewall", "pare-feu", "routeur", "dns"],
      malware: ["malware", "virus", "logiciel malveillant", "trojan", "cheval de troie", "spyware"],
      dataProtection: ["données", "sauvegarde", "backup", "chiffrement", "rgpd", "confidentialité"],
      zeroTrust: ["zero trust", "confiance zéro", "identité", "iam", "privilèges", "moindre privilège"],
      incident: ["incident", "crise", "urgence", "violation", "faille", "attaque", "réponse"],
      governance: ["gouvernance", "politique", "procédure", "conformité", "audit", "risque", "iso 27001"],
      awareness: ["sensibilisation", "formation", "humain", "erreur", "comportement", "culture"]
    };

    type TopicKeywords = Record<string, string[]>;
    
    const topicKeywords: TopicKeywords = {
      phishing: ["phishing", "email", "hameçonnage", "courriel", "malveillant", "social engineering"],
      ransomware: ["ransomware", "rançongiciel", "chiffrement", "rançon", "malware"],
      passwords: ["mot de passe", "password", "authentification", "mfa", "2fa", "double facteur"],
      network: ["réseau", "wifi", "vpn", "firewall", "pare-feu", "routeur", "dns"],
      malware: ["malware", "virus", "logiciel malveillant", "trojan", "cheval de troie", "spyware"],
      dataProtection: ["données", "sauvegarde", "backup", "chiffrement", "rgpd", "confidentialité"],
      zeroTrust: ["zero trust", "confiance zéro", "identité", "iam", "privilèges", "moindre privilège"],
      incident: ["incident", "crise", "urgence", "violation", "faille", "attaque", "réponse"],
      governance: ["gouvernance", "politique", "procédure", "conformité", "audit", "risque", "iso 27001"],
      awareness: ["sensibilisation", "formation", "humain", "erreur", "comportement", "culture"]
    };

    // Calculer les scores pour chaque sujet
    type TopicScore = {
      topic: string;
      count: number;
    };

    const topicScores: TopicScore[] = Object.entries(topicKeywords).map(([topic, keywords]) => {
      const count = keywords.reduce((acc, keyword) => {
        const regex = new RegExp(keyword, 'gi');
        const matches = combinedContent.match(regex);
        return acc + (matches ? matches.length : 0);
      }, 0);
      return { topic, count };
    });

    // Trier par score décroissant
    topicScores.sort((a, b) => b.count - a.count);

    // Prendre le sujet avec le score le plus élevé
    const primaryTopic = topicScores[0]?.topic;

    // Suggestions spécifiques par sujet
    type Suggestion = {
      text: string;
      prompt: string;
    };

    type TopicSuggestionMap = Record<string, Suggestion[]>;

    const topicSuggestions: TopicSuggestionMap = {
      phishing: [
        { text: "Comment analyser un email suspect ?", prompt: "Comment analyser un email suspect pour détecter le phishing ?" },
        { text: "Quels sont les indices de phishing ?", prompt: "Quels sont les indices visuels et techniques du phishing ?" },
        { text: "Comment reporter un phishing ?", prompt: "Comment reporter un phishing dans mon organisation ?" }
      ],
      ransomware: [
        { text: "Comment se protéger des ransomwares ?", prompt: "Comment se protéger des ransomwares ?" },
        { text: "Que faire en cas d'infection ?", prompt: "Que faire en cas d'infection par ransomware ?" },
        { text: "Comment récupérer ses données ?", prompt: "Comment récupérer ses données après un ransomware ?" }
      ],
      passwords: [
        { text: "Comment créer un mot de passe fort ?", prompt: "Comment créer un mot de passe fort et sécurisé ?" },
        { text: "Qu'est-ce que l'authentification MFA ?", prompt: "Qu'est-ce que l'authentification multi-facteurs ?" },
        { text: "Comment utiliser un gestionnaire ?", prompt: "Comment utiliser un gestionnaire de mots de passe ?" }
      ],
      network: [
        { text: "Comment sécuriser mon Wi-Fi ?", prompt: "Comment sécuriser mon réseau Wi-Fi ?" },
        { text: "Qu'est-ce qu'un VPN ?", prompt: "Qu'est-ce qu'un VPN et comment l'utiliser ?" },
        { text: "Comment configurer un firewall ?", prompt: "Comment configurer un firewall personnel ?" }
      ]
    };

    // Suggestions générales de fallback
    const generalSuggestions: Suggestion[] = [
      { text: "Explique-moi les bases de la cybersécurité", prompt: "Explique-moi les bases de la cybersécurité" },
      { text: "Comment sécuriser mon entreprise ?", prompt: "Comment sécuriser mon entreprise ?" },
      { text: "Crée un exercice pratique", prompt: "Crée un exercice pratique adapté à mon niveau" }
    ];

    // Retourner les suggestions appropriées
    const specificSuggestions = primaryTopic && topicSuggestions[primaryTopic] 
      ? topicSuggestions[primaryTopic] 
      : [];
    
    // Combiner les suggestions
    return [...specificSuggestions, ...generalSuggestions];
  };

  // Fonction pour démarrer une nouvelle session
  const startSession = async () => {
    setIsLoading(true);
    
    // Réinitialiser complètement tous les états
    setMessages([]);
    setSessionStatus(null);
    setSessionSummary(null);
    setContextualSuggestions([
      { text: "Comment me protéger contre le phishing ?", prompt: "Comment me protéger contre le phishing ?" },
      { text: "Explique-moi les ransomwares", prompt: "Explique-moi les ransomwares" },
      { text: "Comment sécuriser mon Wi-Fi ?", prompt: "Comment sécuriser mon Wi-Fi ?" },
    ]);
    
    try {
      // Terminer la session existante si nécessaire
      if (userId) {
        try {
          await apiRequest('/api/cyber-expert/terminate', {
            method: 'POST',
            body: JSON.stringify({ userId })
          });
        } catch (error) {
          console.log("Aucune session active à terminer");
        }
      }
      
      // Générer un nouvel ID utilisateur
      const newUserId = uuidv4();
      setUserId(newUserId);
      
      // Créer une nouvelle session
      const response = await apiRequest<{success: boolean, message: string, sessionStatus: SessionStatus}>('/api/cyber-expert/session', {
        method: 'POST',
        body: JSON.stringify({ userId: newUserId })
      });
      
      if (response.success) {
        // Activer la session
        setIsSessionActive(true);
        setSessionStatus(response.sessionStatus);
        
        // Ajouter le message de bienvenue
        const welcomeMessage: Message = {
          id: uuidv4(),
          type: "bot",
          content: response.message,
          timestamp: Date.now()
        };
        
        setMessages([welcomeMessage]);
        
        // Mettre à jour les suggestions contextuelles
        setContextualSuggestions(getContextualSuggestions());
        
        toast({
          title: "Session démarrée",
          description: "Votre session d'apprentissage cybersécurité est active!",
          variant: "default"
        });
        
        // Scroll vers le bas
        setTimeout(() => {
          if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
          }
        }, 100);
      } else {
        throw new Error("Échec du démarrage de la session");
      }
    } catch (error) {
      console.error("Erreur lors du démarrage de la session:", error);
      toast({
        title: "Erreur",
        description: "Impossible de démarrer la session. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour envoyer un message
  const sendMessage = async (messageText?: string) => {
    const finalMessage = messageText || inputMessage.trim();
    if (!finalMessage || !userId || isLoading) return;

    setIsLoading(true);
    setInputMessage("");

    // Ajouter le message utilisateur
    const userMessage: Message = {
      id: uuidv4(),
      type: "user",
      content: finalMessage,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMessage]);

    try {
      // Envoyer le message à l'API
      const response = await apiRequest<{success: boolean, message: string, sessionStatus: SessionStatus}>('/api/cyber-expert/message', {
        method: 'POST',
        body: JSON.stringify({ userId, message: finalMessage })
      });

      if (response.success) {
        // Ajouter la réponse du bot
        const botResponse: Message = {
          id: uuidv4(),
          type: "bot",
          content: response.message,
          timestamp: Date.now()
        };
        
        setMessages(prev => [...prev, botResponse]);
        setSessionStatus(response.sessionStatus);
        
        // Mettre à jour les suggestions contextuelles
        setTimeout(() => {
          setContextualSuggestions(getContextualSuggestions());
        }, 500);
        
        // Scroll automatique vers le bas
        setTimeout(() => {
          if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
          }
        }, 100);
      } else {
        throw new Error("Échec de l'envoi du message");
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer votre message. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour terminer la session
  const endSession = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    
    try {
      const response = await apiRequest<{success: boolean, summary: string}>('/api/cyber-expert/terminate', {
        method: 'POST',
        body: JSON.stringify({ userId })
      });
      
      if (response.success) {
        setSessionSummary(response.summary);
        setIsSessionActive(false);
        setUserId(null);
        setMessages([]);
        setSessionStatus(null);
        
        toast({
          title: "Session terminée",
          description: "Votre session d'apprentissage a été sauvegardée avec succès.",
          variant: "default"
        });
      }
    } catch (error) {
      console.error("Erreur lors de la fin de session:", error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la sauvegarde de votre session.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Gestion des touches clavier pour la zone de texte
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Auto-resize de la zone de texte
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value);
    
    // Auto-resize
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  };

  // Fonction pour gérer le clic sur une suggestion
  const handleSuggestionClick = (prompt: string) => {
    if (!isLoading && isSessionActive) {
      sendMessage(prompt);
    }
  };

  // Gestion du scroll pour afficher/masquer le bouton de scroll
  useEffect(() => {
    const handleScroll = () => {
      if (chatContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
        const isScrolledUp = scrollHeight - scrollTop - clientHeight > 100;
        setShowScrollButton(isScrolledUp);
      }
    };

    const container = chatContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Scroll vers le bas
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  // Auto-scroll après l'ajout de nouveaux messages
  useEffect(() => {
    if (messages.length > 0 && !showScrollButton) {
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [messages, showScrollButton]);

  return (
    <HomeLayout>
      <div className="min-h-screen bg-gradient-to-br from-[#0a0e1a] via-[#0d1425] to-[#091525] text-white">
        <PageTitle title="Apprentissage Expert - Cybersécurité" description="Assistant IA personnalisé pour l'apprentissage avancé en cybersécurité" />
        
        <div className="flex flex-col items-center justify-start min-h-screen p-6">
          
          {/* Message informatif contextuel en haut */}
          <div className="w-full max-w-6xl mb-6">
            <div className={`flex items-center gap-3 p-4 rounded-lg border ${getBadgeColor(messages.length)} backdrop-blur-sm`}>
              <div className="flex-shrink-0">
                {getMessageIcon(messages.length)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium leading-relaxed">
                  {getMessage(messages.length)}
                </p>
              </div>
            </div>
          </div>

          {/* Bouton de retour vers l'accueil */}
          <div className="w-full max-w-6xl mb-6">
            <Button
              onClick={() => setLocation('/')}
              variant="ghost"
              className="text-[#00b4d8] hover:bg-[#00b4d8]/10 hover:text-[#00b4d8] border border-[#00b4d8]/30 hover:border-[#00b4d8]"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à l'accueil
            </Button>
          </div>

          {/* Interface principale */}
          {!isSessionActive ? (
            <Card className="w-full max-w-2xl bg-[#091525]/90 backdrop-blur-sm border-[#00b4d8]/30 text-white">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-[#00b4d8] to-[#0077b6] bg-clip-text text-transparent">
                  Apprentissage Expert
                </CardTitle>
                <CardDescription className="text-gray-300 text-lg leading-relaxed">
                  Assistant IA personnalisé pour un apprentissage avancé en cybersécurité
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="bg-[#0a0e1a]/50 rounded-lg p-4 border border-[#00b4d8]/20">
                  <h3 className="font-semibold text-[#00b4d8] mb-3 flex items-center">
                    <Bot className="mr-2 h-5 w-5" />
                    Fonctionnalités
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-start">
                      <span className="text-[#00b4d8] mr-2">•</span>
                      Apprentissage adaptatif basé sur vos besoins spécifiques
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#00b4d8] mr-2">•</span>
                      Exercices pratiques personnalisés
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#00b4d8] mr-2">•</span>
                      Suggestions contextuelles intelligentes
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#00b4d8] mr-2">•</span>
                      Suivi de progression et recommandations
                    </li>
                  </ul>
                </div>
              </CardContent>
              
              <CardFooter>
                <Button
                  onClick={startSession}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-[#00b4d8] to-[#0077b6] hover:from-[#0077b6] hover:to-[#005577] text-[#091525] font-mono text-base px-8 py-6 h-auto"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                      INITIALISATION...
                    </>
                  ) : (
                    <>DÉMARRER UNE SESSION</>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <div className="flex flex-col w-full max-w-6xl mx-auto">
              {/* Chat standard */}
              <div className="flex flex-col w-full">
                {/* Barre de statut et de progression */}
                <div className="bg-[#091525] border border-[#00b4d8]/30 border-b-0 rounded-t-md p-3 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm font-medium text-green-400">Session Active</span>
                    </div>
                    
                    {sessionStatus?.topic && (
                      <div className="text-sm text-gray-300">
                        <span className="text-[#00b4d8]">Sujet:</span> {sessionStatus.topic}
                      </div>
                    )}
                    
                    <div className="text-sm text-gray-300">
                      <span className="text-[#00b4d8]">Messages:</span> {messages.length}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={endSession}
                      disabled={isLoading}
                      variant="outline"
                      size="sm"
                      className="text-red-400 border-red-400/30 hover:bg-red-400/10 hover:text-red-300 hover:border-red-400"
                    >
                      <X className="mr-1 h-4 w-4" />
                      Terminer
                    </Button>
                  </div>
                </div>

                {/* Zone de chat */}
                <div className="bg-[#0a0e1a]/80 backdrop-blur-sm border border-[#00b4d8]/30 border-t-0 border-b-0 flex-1 relative">
                  {/* Messages */}
                  <div 
                    ref={chatContainerRef}
                    className="h-[500px] overflow-y-auto p-4 space-y-4"
                  >
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex items-start space-x-3 ${
                          message.type === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        {message.type === "bot" && (
                          <div className="flex-shrink-0 w-8 h-8 bg-[#00b4d8]/20 rounded-full flex items-center justify-center border border-[#00b4d8]/30">
                            <Bot className="h-4 w-4 text-[#00b4d8]" />
                          </div>
                        )}
                        
                        <div
                          className={`max-w-[80%] p-3 rounded-lg border backdrop-blur-sm ${
                            message.type === "user"
                              ? "bg-[#00b4d8]/20 border-[#00b4d8]/30 text-white"
                              : "bg-[#091525]/80 border-gray-600/30 text-gray-100"
                          }`}
                        >
                          <div 
                            className="prose prose-sm max-w-none text-inherit prose-headings:text-inherit prose-p:text-inherit prose-strong:text-inherit prose-code:text-inherit prose-pre:bg-black/30 prose-pre:border prose-pre:border-gray-600/30"
                            dangerouslySetInnerHTML={{
                              __html: DOMPurify.sanitize(message.content.replace(/\n/g, '<br>'))
                            }}
                          />
                          <div className="text-xs text-gray-400 mt-2">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                        
                        {message.type === "user" && (
                          <div className="flex-shrink-0 w-8 h-8 bg-gray-600/20 rounded-full flex items-center justify-center border border-gray-600/30">
                            <span className="text-xs font-medium text-gray-300">Vous</span>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {/* Indicateur de saisie */}
                    {isLoading && (
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-[#00b4d8]/20 rounded-full flex items-center justify-center border border-[#00b4d8]/30">
                          <Bot className="h-4 w-4 text-[#00b4d8]" />
                        </div>
                        <div className="bg-[#091525]/80 border border-gray-600/30 rounded-lg p-3 backdrop-blur-sm">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-[#00b4d8] rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-[#00b4d8] rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-2 h-2 bg-[#00b4d8] rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Bouton de scroll vers le bas */}
                  {showScrollButton && (
                    <Button
                      onClick={scrollToBottom}
                      size="sm"
                      className="absolute bottom-4 right-4 bg-[#00b4d8]/80 hover:bg-[#00b4d8] text-white rounded-full p-2 shadow-lg"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Suggestions contextuelles */}
                {contextualSuggestions.length > 0 && (
                  <div className="bg-[#091525]/80 border border-[#00b4d8]/30 border-t-0 border-b-0 p-3">
                    <h4 className="text-sm font-medium text-[#00b4d8] mb-2">Suggestions:</h4>
                    <div className="flex flex-wrap gap-2">
                      {contextualSuggestions.slice(0, 4).map((suggestion, index) => (
                        <Button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion.prompt)}
                          disabled={isLoading}
                          variant="ghost"
                          size="sm"
                          className="text-xs bg-[#00b4d8]/10 hover:bg-[#00b4d8]/20 text-[#00b4d8] border border-[#00b4d8]/30 hover:border-[#00b4d8]/50 rounded-full"
                        >
                          {suggestion.text}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Zone de saisie */}
                <div className="bg-[#091525] border border-[#00b4d8]/30 border-t-0 rounded-b-md p-4">
                  <div className="flex items-end space-x-3">
                    <div className="flex-1">
                      <textarea
                        ref={textareaRef}
                        value={inputMessage}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                        placeholder="Posez votre question sur la cybersécurité..."
                        disabled={isLoading}
                        className="w-full bg-[#0a0e1a]/80 border border-gray-600/30 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#00b4d8] focus:ring-1 focus:ring-[#00b4d8] resize-none min-h-[40px] max-h-[120px]"
                        rows={1}
                      />
                    </div>
                    <Button
                      onClick={() => sendMessage()}
                      disabled={isLoading || !inputMessage.trim()}
                      className="bg-[#00b4d8] hover:bg-[#0077b6] text-[#091525] px-4 py-2 rounded-lg font-medium"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
                    <span>Appuyez sur Entrée pour envoyer, Shift+Entrée pour nouvelle ligne</span>
                    {sessionStatus && (
                      <div className="flex items-center space-x-4">
                        <span>État: {sessionStatus.currentStage}</span>
                        <Button
                          onClick={endSession}
                          disabled={isLoading}
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:bg-red-400/10 hover:text-red-300 text-xs px-2 py-1 h-auto"
                        >
                          Terminer la session
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Résumé de session (modal) */}
          {sessionSummary && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/75">
              <Card className="w-full max-w-2xl bg-[#091525] border-[#00b4d8]/30 text-white">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-[#00b4d8] flex items-center">
                    <FileText className="mr-2 h-5 w-5" />
                    Résumé de votre session
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div 
                    className="prose prose-sm max-w-none text-gray-100 prose-headings:text-white prose-p:text-gray-100 prose-strong:text-white"
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(sessionSummary.replace(/\n/g, '<br>'))
                    }}
                  />
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    onClick={() => setSessionSummary(null)}
                    variant="outline"
                    className="border-[#00b4d8]/30 text-[#00b4d8] hover:bg-[#00b4d8]/10"
                  >
                    Fermer
                  </Button>
                  <Button
                    onClick={startSession}
                    className="bg-[#00b4d8] hover:bg-[#0077b6] text-[#091525]"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Nouvelle session
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </div>
      </div>
    </HomeLayout>
  );
}

export default function ExpertLearningPage() {
  return <ExpertLearningPageContent />;
}