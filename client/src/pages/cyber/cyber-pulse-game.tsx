import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import DOMPurify from "dompurify";
import { 
  Bot, 
  RefreshCw, 
  Send, 
  ChevronDown, 
  Zap, 
  Shield, 
  LightbulbIcon, 
  Award, 
  Clock, 
  ChevronRight,
  Settings,
  X,
  Zap as Lightning,
  Target,
  Gamepad2,
  Star,
  Brain,
  Flame
} from "lucide-react";
import { 
  Button, 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  RadioGroup,
  RadioGroupItem,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/index";
import { useToast } from "@/hooks/use-toast";

// Types
interface Message {
  id: string;
  type: 'user' | 'bot' | 'system';
  content: string;
  timestamp: number;
}

interface GameState {
  active: boolean;
  currentGameType?: string;
  score: number;
  streak: number;
  nextAction?: string;
  playerLevel: string;
  gameAnalysis?: any;
}

// Fonction utilitaire pour formater le texte avec structure
const formatTextWithStructure = (text: string): string => {
  let formattedText = text
    // Remplacer les titres
    .replace(/#{3} (.+)/g, '<h3 class="text-lg font-semibold mt-4 mb-2 text-cyan-300">$1</h3>')
    .replace(/#{2} (.+)/g, '<h2 class="text-xl font-bold mt-5 mb-3 text-cyan-400">$1</h2>')
    .replace(/# (.+)/g, '<h1 class="text-2xl font-bold mt-6 mb-3 text-cyan-300">$1</h1>')
    
    // Remplacer les listes
    .replace(/^\s*[\-\*]\s+(.+)$/gm, '<li class="flex items-start mb-2"><span class="text-cyan-400 mr-2">•</span><span>$1</span></li>')
    .replace(/^\s*(\d+)\.\s+(.+)$/gm, '<li class="flex items-start mb-2"><span class="text-cyan-400 mr-2">$1.</span><span>$2</span></li>')
    
    // Remplacer les sections de code
    .replace(/```(.+?)```/gs, '<pre class="bg-blue-950/50 p-3 rounded-md my-3 overflow-x-auto text-sm border border-blue-800/50"><code>$1</code></pre>')
    .replace(/`([^`]+)`/g, '<code class="bg-blue-900/30 px-1 py-0.5 rounded text-cyan-300 text-sm">$1</code>')
    
    // Remplacer les séparateurs
    .replace(/^\s*---\s*$/gm, '<hr class="my-4 border-blue-800/50">')
    
    // Mettre en évidence les blocs d'alertes ou d'info
    .replace(/^\s*>\s*(.+)$/gm, '<blockquote class="border-l-4 border-cyan-500 pl-4 py-2 my-4 bg-blue-900/20 rounded-r-md">$1</blockquote>')
    
    // Remplacer les liens
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-cyan-400 hover:underline" target="_blank">$1</a>')
    
    // Créer des blocs de fond pour les sections importantes
    .replace(/\[DÉFI\](.*?)\[\/DÉFI\]/gs, '<div class="bg-gradient-to-r from-blue-900/50 to-purple-900/50 p-4 rounded-lg my-4 border border-blue-600/30 shadow-inner">$1</div>')
    .replace(/\[INFO\](.*?)\[\/INFO\]/gs, '<div class="bg-blue-950/50 p-4 rounded-lg my-4 border border-blue-800/30">$1</div>')
    .replace(/\[ALERTE\](.*?)\[\/ALERTE\]/gs, '<div class="bg-red-900/40 p-4 rounded-lg my-4 border border-red-500/30">$1</div>')
    
    // Mise en forme des tables pour un rendu cohérent
    .replace(/\|(.+)\|/g, (match) => {
      const cells = match.split('|').filter(cell => cell.trim() !== '');
      const row = cells.map(cell => `<td class="border border-blue-800/30 px-4 py-2">${cell.trim()}</td>`).join('');
      return `<tr>${row}</tr>`;
    })
    .replace(/<tr>(.+)<\/tr>\s*\n\s*\|[\-\|]+\|\s*\n/g, (match, headerRow) => {
      return `<thead><tr>${headerRow.replace(/<td/g, '<th').replace(/td>/g, 'th>')}</tr></thead><tbody>`;
    });

  // Assembler les listes
  formattedText = formattedText.replace(/<li(.+?)<\/li>(\s*<li)/g, '<li$1</li>$2');
  formattedText = formattedText.replace(/(^|[^>])\s*(<li.*<\/li>)\s*(?![^<]*<\/ul>)/gs, '$1<ul class="list-none space-y-1 my-3">$2</ul>');
  
  // Assembler les tableaux
  formattedText = formattedText.replace(/(^|[^>])\s*(<tr>.+<\/tr>)\s*(?![^<]*<\/tbody>)/gs, '$1<table class="w-full my-4 border-collapse">$2</tbody></table>');
  
  // Convertir les sauts de ligne restants en paragraphes
  formattedText = formattedText.replace(/^(?!<[uo]l|<[hpt]|<div|<block|<pre)(.+)$/gm, (match, p1) => {
    if (p1.trim() === '') return '';
    return `<p class="mb-3">${p1}</p>`;
  });
  
  return formattedText;
};

// Composant principal
export default function CyberPulseGame() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [visualStyle, setVisualStyle] = useState<string>('futuristic');
  const [gameState, setGameState] = useState<GameState>({
    active: false,
    score: 0,
    streak: 0,
    playerLevel: 'débutant'
  });
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [focusArea, setFocusArea] = useState('');
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Effet pour initialiser la session
  useEffect(() => {
    initializeSession();
    
    // Cleanup
    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, []);
  
  // Effet pour défilement automatique et détection du besoin de bouton de défilement
  useEffect(() => {
    scrollToBottom();
    checkScrollPosition();
    
    // Remettre en place le timer d'inactivité après chaque message
    resetInactivityTimer();
  }, [messages]);
  
  // Effet pour surveiller la position de défilement
  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (!chatContainer) return;
    
    const handleScroll = () => {
      checkScrollPosition();
    };
    
    chatContainer.addEventListener('scroll', handleScroll);
    return () => {
      chatContainer.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // Initialisation de la session CyberPULSE
  const initializeSession = async () => {
    try {
      setIsInitializing(true);
      
      const response = await fetch('/api/cyber-pulse/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          visualStyle,
          playerName,
          focusArea
        }),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'initialisation de la session');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setSessionId(data.sessionId);
        setUserId(data.userId);
        setVisualStyle(data.visualStyle || 'futuristic');
        setGameState({
          ...gameState,
          active: data.gameActive
        });
        
        // Ajouter le message de bienvenue
        setMessages([
          {
            id: Math.random().toString(36).substring(2, 11),
            type: 'bot',
            content: data.message,
            timestamp: Date.now()
          }
        ]);
        
        // Démarrer la vérification d'inactivité
        resetInactivityTimer();
      } else {
        throw new Error(data.error || 'Échec de l\'initialisation');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: 'Erreur',
        description: `Impossible d'initialiser CyberPULSE: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        variant: 'destructive',
      });
    } finally {
      setIsInitializing(false);
    }
  };
  
  // Gestion de la soumission du message
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || !sessionId || isLoading) return;
    
    const userMessage = inputMessage.trim();
    setInputMessage('');
    
    // Ajouter le message de l'utilisateur
    setMessages(prev => [...prev, {
      id: Math.random().toString(36).substring(2, 11),
      type: 'user',
      content: userMessage,
      timestamp: Date.now()
    }]);
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/cyber-pulse/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          message: userMessage
        }),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi du message');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Ajouter la réponse du bot
        setMessages(prev => [...prev, {
          id: Math.random().toString(36).substring(2, 11),
          type: 'bot',
          content: data.message,
          timestamp: Date.now()
        }]);
        
        // Mettre à jour l'état du jeu
        setGameState(data.gameState);
        
        // Mettre à jour le style visuel si changé
        if (data.visualStyle && data.visualStyle !== visualStyle) {
          setVisualStyle(data.visualStyle);
        }
      } else {
        throw new Error(data.error || 'Échec de l\'envoi du message');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: 'Erreur',
        description: `Impossible d'envoyer votre message: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Génération d'un nouveau défi cyber
  const handleGenerateChallenge = async (type?: string) => {
    if (!sessionId || isLoading) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/cyber-pulse/challenge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          challengeType: type
        }),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la génération du défi');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Ajouter le défi comme message du bot
        setMessages(prev => [...prev, {
          id: Math.random().toString(36).substring(2, 11),
          type: 'bot',
          content: data.challenge,
          timestamp: Date.now()
        }]);
        
        // Mettre à jour l'état du jeu
        setGameState({
          ...gameState,
          active: true,
          currentGameType: data.challengeType
        });
      } else {
        throw new Error(data.error || 'Échec de la génération du défi');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: 'Erreur',
        description: `Impossible de générer un défi: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Mise à jour des préférences de l'utilisateur
  const handleUpdatePreferences = async () => {
    if (!sessionId) return;
    
    try {
      const response = await fetch('/api/cyber-pulse/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          preferences: {
            visualStyle,
            focusArea: focusArea ? [focusArea] : undefined
          }
        }),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour des préférences');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setIsSettingsOpen(false);
        toast({
          title: 'Préférences mises à jour',
          description: 'Vos préférences ont été enregistrées avec succès.',
        });
      } else {
        throw new Error(data.error || 'Échec de la mise à jour des préférences');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: 'Erreur',
        description: `Impossible de mettre à jour les préférences: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        variant: 'destructive',
      });
    }
  };
  
  // Gestion de l'inactivité - vérifie si l'utilisateur est inactif et génère une relance
  const checkInactivity = async () => {
    if (!sessionId) return;
    
    try {
      const response = await fetch('/api/cyber-pulse/check-inactivity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId
        }),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la vérification d\'inactivité');
      }
      
      const data = await response.json();
      
      if (data.success && data.inactivity) {
        // Ajouter le message de relance du bot
        setMessages(prev => [...prev, {
          id: Math.random().toString(36).substring(2, 11),
          type: 'bot',
          content: data.message,
          timestamp: Date.now()
        }]);
        
        // Mettre à jour l'état du jeu
        if (data.gameState) {
          setGameState(data.gameState);
        }
      }
    } catch (error) {
      console.error('Erreur de vérification d\'inactivité:', error);
      // Ne pas afficher de toast pour ne pas perturber l'utilisateur
    }
  };
  
  // Réinitialise le timer d'inactivité
  const resetInactivityTimer = () => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    
    // Vérifier l'inactivité après 30 secondes
    inactivityTimerRef.current = setTimeout(() => {
      checkInactivity();
    }, 30000);
  };
  
  // Gestion du défilement vers le bas de la conversation
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };
  
  // Vérification de la position de défilement pour afficher/masquer le bouton
  const checkScrollPosition = () => {
    const chatContainer = chatContainerRef.current;
    if (!chatContainer) return;
    
    const { scrollTop, scrollHeight, clientHeight } = chatContainer;
    const isScrolledUp = scrollHeight - scrollTop - clientHeight > 100;
    
    setShowScrollButton(isScrolledUp);
  };
  
  // Gestion des touches pour soumettre le message avec Entrée
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  
  // Retour à la page précédente
  const handleReturnToPrevious = () => {
    navigate('/cyber');
  };
  
  // Effet visuel en fonction du style choisi
  const getBackgroundStyles = () => {
    switch(visualStyle) {
      case 'futuristic':
        return {
          className: "bg-gradient-to-b from-blue-950 to-gray-950",
          overlayJsx: (
            <>
              <div className="absolute inset-0 bg-blue-900/5 mix-blend-overlay"></div>
              <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
              <div className="absolute top-0 right-0 w-2/3 h-2/3 bg-purple-500/10 rounded-full filter blur-[120px] mix-blend-screen"></div>
              <div className="absolute bottom-0 left-0 w-2/3 h-2/3 bg-blue-500/10 rounded-full filter blur-[120px] mix-blend-screen"></div>
            </>
          )
        };
      case 'neon':
        return {
          className: "bg-gray-950",
          overlayJsx: (
            <>
              <div className="absolute inset-0 bg-purple-900/10 mix-blend-overlay"></div>
              <div className="absolute top-0 right-0 w-1/2 h-2/3 bg-pink-500/20 rounded-full filter blur-[100px] mix-blend-screen"></div>
              <div className="absolute bottom-0 left-0 w-1/2 h-2/3 bg-blue-500/20 rounded-full filter blur-[100px] mix-blend-screen"></div>
              <div className="absolute inset-0 bg-[url('/cyber-grid.svg')] bg-repeat opacity-20"></div>
            </>
          )
        };
      case 'minimal':
        return {
          className: "bg-slate-950",
          overlayJsx: (
            <>
              <div className="absolute inset-0 bg-slate-900/50"></div>
              <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
            </>
          )
        };
      case 'classic':
      default:
        return {
          className: "bg-gradient-to-b from-gray-900 to-gray-950",
          overlayJsx: (
            <>
              <div className="absolute inset-0 bg-blue-900/5"></div>
              <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
            </>
          )
        };
    }
  };
  
  const bgStyles = getBackgroundStyles();
  
  // Obtenir la couleur primaire en fonction du style visuel
  const getPrimaryColor = () => {
    switch(visualStyle) {
      case 'futuristic': return 'text-cyan-400';
      case 'neon': return 'text-pink-500';
      case 'minimal': return 'text-blue-400';
      case 'classic':
      default: return 'text-blue-500';
    }
  };
  
  // Obtenir la couleur de bordure en fonction du style visuel
  const getBorderColor = () => {
    switch(visualStyle) {
      case 'futuristic': return 'border-cyan-800/30';
      case 'neon': return 'border-purple-800/30';
      case 'minimal': return 'border-slate-700';
      case 'classic':
      default: return 'border-gray-700';
    }
  };
  
  // Obtenir la couleur de fond pour les messages de l'utilisateur
  const getUserMessageBg = () => {
    switch(visualStyle) {
      case 'futuristic': return 'bg-cyan-900/30';
      case 'neon': return 'bg-purple-900/30';
      case 'minimal': return 'bg-blue-900/20';
      case 'classic':
      default: return 'bg-blue-800/30';
    }
  };
  
  // Obtenir la couleur de fond pour les messages du bot
  const getBotMessageBg = () => {
    switch(visualStyle) {
      case 'futuristic': return 'bg-gray-900/70';
      case 'neon': return 'bg-gray-950/90';
      case 'minimal': return 'bg-gray-900/50';
      case 'classic':
      default: return 'bg-gray-800/50';
    }
  };
  
  // Obtenir la couleur de fond pour les boutons primaires
  const getPrimaryButtonBg = () => {
    switch(visualStyle) {
      case 'futuristic': return 'bg-cyan-600 hover:bg-cyan-700';
      case 'neon': return 'bg-pink-600 hover:bg-pink-700';
      case 'minimal': return 'bg-blue-600 hover:bg-blue-700';
      case 'classic':
      default: return 'bg-blue-600 hover:bg-blue-700';
    }
  };
  
  // Rendu de l'interface utilisateur
  return (
    <div className={`min-h-screen w-full relative ${bgStyles.className}`}>
      {/* Overlays visuels en fonction du style */}
      {bgStyles.overlayJsx}
      
      {/* Contenu principal */}
      <div className="relative z-10 w-full">
        {/* Header avec informations de jeu et navigation */}
        <div className="border-b border-gray-800/50 bg-black/30 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between">
            <div className="flex items-center">
              <Button 
                variant="outline" 
                onClick={handleReturnToPrevious}
                size="sm"
                className="mr-4 bg-gray-900/80 border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                <ChevronRight className="h-4 w-4 mr-1 rotate-180" />
                Retour
              </Button>
              
              <div className="flex items-center">
                <Shield className={`h-6 w-6 mr-2 ${getPrimaryColor()}`} />
                <h1 className={`text-lg font-bold text-white`}>CyberPULSE</h1>
              </div>
            </div>
            
            {/* Score et niveau du joueur */}
            <div className="flex items-center space-x-4">
              {gameState.active && (
                <>
                  <div className="flex items-center">
                    <Flame className={`h-4 w-4 mr-1 ${getPrimaryColor()}`} />
                    <span className="text-sm text-white">
                      Streak: <span className={`font-bold ${getPrimaryColor()}`}>{gameState.streak}</span>
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    <Award className={`h-4 w-4 mr-1 ${getPrimaryColor()}`} />
                    <span className="text-sm text-white">
                      Score: <span className={`font-bold ${getPrimaryColor()}`}>{gameState.score}</span>
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    <Brain className={`h-4 w-4 mr-1 ${getPrimaryColor()}`} />
                    <span className="text-sm text-white">
                      Niveau: <span className={`font-bold ${getPrimaryColor()}`}>{gameState.playerLevel}</span>
                    </span>
                  </div>
                </>
              )}
              
              {/* Bouton des paramètres */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => setIsSettingsOpen(true)}
                      className="bg-gray-900/80 border-gray-700 text-gray-300 hover:bg-gray-800"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Paramètres</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
        
        {/* Zone principale de chat */}
        <div className="max-w-7xl mx-auto pt-4 px-4 pb-20">
          {isInitializing ? (
            // Écran de chargement
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <div className={`w-24 h-24 rounded-full border-4 ${getPrimaryColor()} border-t-transparent animate-spin mb-6`}></div>
              <h2 className="text-xl font-bold text-white mb-2">Initialisation de CyberPULSE</h2>
              <p className="text-gray-400">Chargement de votre expérience personnalisée...</p>
            </div>
          ) : (
            // Zone de chat
            <div className="flex flex-col space-y-4">
              {/* Interface de chat */}
              <div 
                ref={chatContainerRef}
                className={`w-full rounded-lg ${getBorderColor()} border bg-black/20 backdrop-blur-sm shadow-xl overflow-y-auto custom-scrollbar h-[calc(100vh-220px)] min-h-[500px]`}
              >
                <div className="p-6 space-y-6">
                  {messages.map((message) => (
                    <div key={message.id}>
                      <div
                        className={`flex ${
                          message.type === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[85%] p-4 rounded-lg ${
                            message.type === "user"
                              ? `${getUserMessageBg()} text-white ml-auto shadow-lg`
                              : `${getBotMessageBg()} border ${getBorderColor()} text-white shadow-lg`
                          }`}
                        >
                          {message.type === "bot" ? (
                            <div 
                              className="prose prose-invert max-w-none text-gray-200 text-base prose-headings:text-cyan-300 prose-li:marker:text-cyan-400 prose-strong:text-white" 
                              dangerouslySetInnerHTML={{ 
                                __html: DOMPurify.sanitize(formatTextWithStructure(message.content)) 
                              }}
                            />
                          ) : (
                            <p className="text-gray-200 text-base">{message.content}</p>
                          )}
                          <div className="text-xs text-gray-400 mt-2 text-right">
                            {new Date(message.timestamp).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className={`max-w-[85%] p-4 rounded-lg ${getBotMessageBg()} border ${getBorderColor()} text-white shadow-lg`}>
                        <div className="flex items-center gap-3">
                          <div className="flex space-x-2">
                            <div className={`w-2.5 h-2.5 rounded-full ${getPrimaryColor()} animate-pulse`}></div>
                            <div className={`w-2.5 h-2.5 rounded-full ${getPrimaryColor()} animate-pulse delay-150`}></div>
                            <div className={`w-2.5 h-2.5 rounded-full ${getPrimaryColor()} animate-pulse delay-300`}></div>
                          </div>
                          <span className="text-xs text-gray-400">CyberPULSE en action...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Bouton de défilement vers le bas */}
              {showScrollButton && (
                <Button
                  variant="outline"
                  size="icon"
                  className={`absolute bottom-32 right-8 rounded-full bg-gray-900/80 border-gray-700 ${getPrimaryColor()} hover:bg-gray-800 shadow-lg z-20`}
                  onClick={scrollToBottom}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              )}
              
              {/* Zone d'interaction - saisie de message et actions rapides */}
              <div className={`w-full rounded-lg ${getBorderColor()} border bg-black/40 backdrop-blur-md shadow-xl p-4`}>
                {/* Actions rapides */}
                <div className="mb-4 flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleGenerateChallenge('quiz')}
                    className="border-gray-700 bg-gray-900/80 text-gray-300 hover:bg-gray-800"
                  >
                    <Lightning className={`h-4 w-4 mr-1 ${getPrimaryColor()}`} />
                    Quiz Rapide
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleGenerateChallenge('scenario')}
                    className="border-gray-700 bg-gray-900/80 text-gray-300 hover:bg-gray-800"
                  >
                    <Target className={`h-4 w-4 mr-1 ${getPrimaryColor()}`} />
                    Scénario Cyber
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleGenerateChallenge('game')}
                    className="border-gray-700 bg-gray-900/80 text-gray-300 hover:bg-gray-800"
                  >
                    <Gamepad2 className={`h-4 w-4 mr-1 ${getPrimaryColor()}`} />
                    Mini-jeu Cyber
                  </Button>
                </div>
                
                {/* Formulaire d'envoi de message */}
                <form onSubmit={handleSubmit} className="flex space-x-3">
                  <div className="flex-1 relative">
                    <textarea
                      ref={textareaRef}
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Envoyez un message ou posez une question..."
                      className={`w-full p-4 bg-gray-900/80 text-gray-200 border ${getBorderColor()} rounded-lg focus:outline-none focus:ring-2 focus:ring-${visualStyle === 'neon' ? 'pink' : 'cyan'}-500/50 resize-none min-h-[70px] max-h-[150px] overflow-y-auto text-base shadow-inner`}
                      disabled={isLoading}
                      rows={2}
                    />
                    <div className="absolute right-3 bottom-3 text-xs text-gray-500">
                      {inputMessage.length > 0 ? `${inputMessage.length} car.` : 'Entrée: envoyer · Maj+Entrée: nouvelle ligne'}
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    disabled={isLoading || !inputMessage.trim()} 
                    className={`${getPrimaryButtonBg()} text-white self-end h-[70px] w-[70px] shadow-md rounded-lg`}
                  >
                    {isLoading ? (
                      <RefreshCw className="h-6 w-6 animate-spin" />
                    ) : (
                      <Send className="h-6 w-6" />
                    )}
                  </Button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Dialogue de paramètres */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="bg-gray-900 text-white border-gray-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Settings className="h-5 w-5" />
              Paramètres CyberPULSE
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Personnalisez votre expérience interactive
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="appearance" className="w-full">
            <TabsList className="grid grid-cols-2 w-full bg-gray-800">
              <TabsTrigger value="appearance" className="data-[state=active]:bg-gray-700 text-gray-300 data-[state=active]:text-white">Apparence</TabsTrigger>
              <TabsTrigger value="preferences" className="data-[state=active]:bg-gray-700 text-gray-300 data-[state=active]:text-white">Préférences</TabsTrigger>
            </TabsList>
            
            <TabsContent value="appearance" className="p-4 border-gray-700 border rounded-lg mt-4">
              <h3 className="text-lg font-semibold mb-4">Style visuel</h3>
              <RadioGroup 
                value={visualStyle} 
                onValueChange={setVisualStyle}
                className="grid grid-cols-2 gap-4"
              >
                <div>
                  <RadioGroupItem 
                    value="futuristic" 
                    id="futuristic" 
                    className="peer sr-only" 
                  />
                  <Label
                    htmlFor="futuristic"
                    className="flex flex-col items-center justify-between rounded-lg border border-gray-700 bg-gray-800 p-4 hover:bg-gray-700 hover:border-gray-600 peer-data-[state=checked]:border-cyan-500 peer-data-[state=checked]:bg-cyan-900/30 cursor-pointer"
                  >
                    <Shield className="h-8 w-8 mb-2 text-cyan-500" />
                    <span>Futuriste</span>
                  </Label>
                </div>
                
                <div>
                  <RadioGroupItem 
                    value="neon" 
                    id="neon" 
                    className="peer sr-only" 
                  />
                  <Label
                    htmlFor="neon"
                    className="flex flex-col items-center justify-between rounded-lg border border-gray-700 bg-gray-800 p-4 hover:bg-gray-700 hover:border-gray-600 peer-data-[state=checked]:border-pink-500 peer-data-[state=checked]:bg-pink-900/30 cursor-pointer"
                  >
                    <Zap className="h-8 w-8 mb-2 text-pink-500" />
                    <span>Néon</span>
                  </Label>
                </div>
                
                <div>
                  <RadioGroupItem 
                    value="minimal" 
                    id="minimal" 
                    className="peer sr-only" 
                  />
                  <Label
                    htmlFor="minimal"
                    className="flex flex-col items-center justify-between rounded-lg border border-gray-700 bg-gray-800 p-4 hover:bg-gray-700 hover:border-gray-600 peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-900/30 cursor-pointer"
                  >
                    <LightbulbIcon className="h-8 w-8 mb-2 text-blue-500" />
                    <span>Minimaliste</span>
                  </Label>
                </div>
                
                <div>
                  <RadioGroupItem 
                    value="classic" 
                    id="classic" 
                    className="peer sr-only" 
                  />
                  <Label
                    htmlFor="classic"
                    className="flex flex-col items-center justify-between rounded-lg border border-gray-700 bg-gray-800 p-4 hover:bg-gray-700 hover:border-gray-600 peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-900/30 cursor-pointer"
                  >
                    <Bot className="h-8 w-8 mb-2 text-blue-500" />
                    <span>Classique</span>
                  </Label>
                </div>
              </RadioGroup>
            </TabsContent>
            
            <TabsContent value="preferences" className="p-4 border-gray-700 border rounded-lg mt-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="playerName" className="text-sm text-gray-300 mb-2 block">
                    Votre nom (optionnel)
                  </Label>
                  <input
                    id="playerName"
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Comment souhaitez-vous être appelé?"
                    className="w-full p-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  />
                </div>
                
                <div>
                  <Label htmlFor="focusArea" className="text-sm text-gray-300 mb-2 block">
                    Domaine d'intérêt
                  </Label>
                  <Select
                    value={focusArea}
                    onValueChange={(value) => setFocusArea(value)}
                  >
                    <SelectTrigger className="w-full bg-gray-800 text-white border-gray-700">
                      <SelectValue placeholder="Choisir un domaine..." />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 text-white border-gray-700">
                      <SelectItem value="">Cybersécurité générale</SelectItem>
                      <SelectItem value="phishing">Phishing</SelectItem>
                      <SelectItem value="ransomware">Ransomware</SelectItem>
                      <SelectItem value="network">Sécurité réseau</SelectItem>
                      <SelectItem value="passwords">Gestion des mots de passe</SelectItem>
                      <SelectItem value="mobile">Sécurité mobile</SelectItem>
                      <SelectItem value="privacy">Protection de la vie privée</SelectItem>
                      <SelectItem value="malware">Malware</SelectItem>
                      <SelectItem value="social-engineering">Ingénierie sociale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end space-x-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsSettingsOpen(false)}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Annuler
            </Button>
            <Button
              onClick={handleUpdatePreferences}
              className={getPrimaryButtonBg()}
            >
              Enregistrer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}