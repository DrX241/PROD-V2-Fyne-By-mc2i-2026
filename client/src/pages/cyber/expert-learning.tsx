

import React, { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { 
  Send, 
  ChevronDown, 
  ChevronRight, 
  RefreshCw, 
  Bot, 
  Lightbulb as LightbulbIcon 
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import HomeLayout from "@/components/layout/HomeLayout";
import { apiRequest } from "@/lib/queryClient";
import DOMPurify from 'dompurify';
import { useLocation } from 'wouter';
import { DecisionProvider, useDecision } from "@/contexts/DecisionContext";
import CyberDecisionFlow from "@/components/cyber/CyberDecisionFlow";

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
  
  return messages[index % messages.length];
};

// Fonction pour obtenir un sujet de cybersécurité basé sur l'index
const getTopicFromIndex = (index: number): string => {
  const topics = [
    "le phishing et l'ingénierie sociale",
    "la gestion des mots de passe",
    "l'authentification à deux facteurs",
    "les ransomwares",
    "les VPN et la sécurité de connexion",
    "l'importance des mises à jour",
    "la sécurité des réseaux Wi-Fi",
    "la sécurité physique des appareils"
  ];
  
  return topics[index % topics.length];
};

// Fonction pour formater le texte avec une structure visuelle
const formatTextWithStructure = (text: string): string => {
  if (!text) return '';
  
  // Convertir les sauts de ligne en balises <br>
  let formattedText = text.replace(/\n/g, '<br>');
  
  // Détecter et mettre en évidence les styles d'apprentissage entre parenthèses 
  formattedText = formattedText.replace(/\((ACADÉMIQUE|ACADEMIC|SIMULATION|DÉFI|CHALLENGE|VISUEL|VISUAL)\)/gi, 
    '<span class="inline-block bg-[#00b4d8]/20 text-[#00b4d8] text-xs px-2 py-0.5 rounded mr-1 uppercase font-mono">$1</span>');
  
  // Remplacer les listes numérotées (1., 2., etc.)
  formattedText = formattedText.replace(/^(\d+\.)\s(.+)$/gm, 
    '<div class="flex gap-2 mb-1"><span class="text-[#00b4d8] font-mono">$1</span><span>$2</span></div>');
  
  // Mettre en évidence les termes clés entre ** **
  formattedText = formattedText.replace(/\*\*([^*]+)\*\*/g, 
    '<span class="font-semibold text-[#00b4d8]">$1</span>');
  
  // Mettre en surbrillance les conseils de sécurité
  formattedText = formattedText.replace(/CONSEIL(\s)?:([^.]+)\./g, 
    '<div class="bg-[#00b4d8]/10 p-2 rounded-md border-l-2 border-[#00b4d8] my-2"><span class="font-semibold text-[#00b4d8]">CONSEIL : </span>$2.</div>');
  
  // Mettre en surbrillance les alertes
  formattedText = formattedText.replace(/ALERTE(\s)?:([^.]+)\./g, 
    '<div class="bg-[#e63946]/10 p-2 rounded-md border-l-2 border-[#e63946] my-2"><span class="font-semibold text-[#e63946]">ALERTE : </span>$2.</div>');
  
  return formattedText;
};

// Interface pour les messages
interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: number;
}

// Interface pour le statut de la session
interface SessionStatus {
  currentStage: "initial" | "questioning" | "confirmation" | "learning";
  needIdentified: boolean;
  needConfirmed: boolean;
  topic?: string;
  readyForDecisionMode?: boolean;
}

const CyberExpertLearning: React.FC = () => {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const decision = useDecision();
  
  // États
  const [userId] = useState<string>(uuidv4());
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus | null>(null);
  const [sessionSummary, setSessionSummary] = useState<string | null>(null);
  const [showScrollButton, setShowScrollButton] = useState<boolean>(false);
  
  // Refs
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Effet pour le défilement automatique et ajustement de la hauteur du textarea
  useEffect(() => {
    const adjustTextareaHeight = () => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
      }
    };
    
    adjustTextareaHeight();
    
    const handleScroll = () => {
      if (chatContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
        const isBottom = scrollHeight - scrollTop - clientHeight < 100;
        setShowScrollButton(!isBottom);
      }
    };
    
    const chatContainer = chatContainerRef.current;
    if (chatContainer) {
      chatContainer.addEventListener('scroll', handleScroll);
      
      // Défiler vers le bas après l'ajout de messages, avec plusieurs tentatives
      scrollToBottom();
      
      // Répéter le scrollToBottom plusieurs fois pour s'assurer que tout est chargé
      const scrollIntervals = [100, 300, 500];
      scrollIntervals.forEach(delay => {
        setTimeout(scrollToBottom, delay);
      });
      
      return () => chatContainer.removeEventListener('scroll', handleScroll);
    }
  }, [messages]);
  
  // Fonction pour faire défiler vers le bas avec un petit délai pour permettre le rendu complet
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      // Utiliser un délai pour s'assurer que tous les éléments sont bien rendus avant de défiler
      setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight + 1000; // Ajouter une marge supplémentaire
        }
      }, 100);
    }
  };
  
  // Fonction pour gérer les touches (Entrée pour envoyer, Maj+Entrée pour nouvelle ligne)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputMessage.trim() && !isLoading) {
        handleSubmit(e as unknown as React.FormEvent);
      }
    }
  };
  
  // Fonction pour revenir à la sélection de mode
  const handleReturnToPrevious = () => {
    navigate('/cyber-mode-selection');
  };
  
  // Fonction pour soumettre un message
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || isLoading) return;
    
    // Ajouter le message de l'utilisateur
    const userMessage: Message = {
      id: uuidv4(),
      type: "user",
      content: inputMessage,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);
    
    try {
      // Si le mode décision est activé, envoyer à l'API appropriée
      if (decision.isInDecisionMode) {
        decision.makeDecision(inputMessage);
        setIsLoading(false);
        return;
      }
      
      // Sinon, envoyer à l'API normale
      const response = await apiRequest<{success: boolean, message: string, sessionStatus: SessionStatus}>('/api/cyber-expert/message', {
        method: 'POST',
        data: {
          message: inputMessage,
          userId,
          messages: messages.map(m => ({ role: m.type === 'user' ? 'user' : 'assistant', content: m.content }))
        }
      });
      
      if (!response.ok) {
        throw new Error("Erreur lors de l'envoi du message");
      }
      
      const data = await response.json();
      
      // Mettre à jour le statut de la session
      if (data.sessionStatus) {
        setSessionStatus(data.sessionStatus);
      }
      
      // Ajouter la réponse du bot
      const botResponse: Message = {
        id: uuidv4(),
        type: "bot",
        content: data.message,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, botResponse]);
      
      // Si le bot suggère de passer en mode décision, l'activer
      if (data.sessionStatus?.readyForDecisionMode) {
        decision.startDecisionMode();
      }
      
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi de votre message. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setTimeout(scrollToBottom, 100);
    }
  };
  
  // Fonction pour démarrer une nouvelle session
  const startSession = () => {
    // Créer le message d'accueil du bot
    const welcomeMessage: Message = {
      id: uuidv4(),
      type: "bot",
      content: "Bienvenue dans l'environnement d'apprentissage cyber. Je suis votre assistant IA spécialisé en cybersécurité. Comment puis-je vous aider aujourd'hui ?",
      timestamp: Date.now()
    };
    
    setMessages([welcomeMessage]);
    setIsSessionActive(true);
    setSessionSummary(null);
  };

  return (
    <HomeLayout className="cyber-immersive">
      <div className="relative min-h-screen max-h-screen w-full overflow-hidden bg-gradient-to-b from-[#0c1525] via-[#091525] to-[#050d1a] text-white">
        {/* Fond décoratif avec effet cyberpunk */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-[10%] left-[5%] w-[50vh] h-[50vh] bg-blue-500 rounded-full filter blur-[100px]"></div>
            <div className="absolute top-[40%] right-[15%] w-[30vh] h-[30vh] bg-cyan-400 rounded-full filter blur-[100px]"></div>
            <div className="absolute bottom-[10%] left-[30%] w-[40vh] h-[40vh] bg-indigo-500 rounded-full filter blur-[100px]"></div>
          </div>
          
          {/* Grille cyberpunk */}
          <div className="absolute inset-0 opacity-5">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
                  <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(0, 180, 216, 0.7)" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
        </div>
        
        <div className="relative z-10 w-full h-full overflow-hidden">
          {/* Bouton de retour - style console cybersécurité placé au-dessus du contenu */}
          <div className="absolute top-4 left-4 z-50">
            <Button 
              variant="outline" 
              onClick={handleReturnToPrevious}
              className="bg-[#091525]/90 border-[#00b4d8]/30 text-[#00b4d8] hover:bg-[#112641] hover:border-[#00b4d8]/50 flex items-center gap-2 font-mono text-xs shadow-[0_0_15px_rgba(0,180,216,0.2)]"
            >
              <span className="text-[#e63946]">←</span>
              <span>RETOUR CONSOLE PRINCIPALE</span>
            </Button>
          </div>
          
          <div className="flex flex-col items-center justify-center h-full w-full overflow-hidden">
            {!isSessionActive && !sessionSummary ? (
              // Page d'accueil plein écran sans bordures, vraiment immersive
              <div className="w-full h-full flex flex-col">
                <div className="bg-gradient-to-b from-[#050a15] to-[#091525] text-white" style={{minHeight: '150vh', paddingBottom: '500px'}}>
                  {/* Barre de navigation fixe en haut sans bordures */}
                  <div className="bg-gradient-to-r from-[#091525]/90 to-[#112641]/90 p-4 lg:p-6 backdrop-blur-md fixed top-0 w-full z-40 shadow-lg shadow-[#00b4d8]/10">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                      <div>
                        <h1 className="font-mono text-xl md:text-2xl text-[#00b4d8] flex items-center gap-3">
                          <Bot className="h-6 w-6 md:h-7 md:w-7" />
                          CYBER COMMANDER <span className="hidden sm:inline">- CENTRE DE CONTRÔLE</span>
                        </h1>
                        <p className="text-[#c3d9ee]/90 font-mono text-xs md:text-sm">
                          <span className="inline-block w-2 h-2 md:w-3 md:h-3 bg-[#4cc9f0] animate-pulse mr-2 rounded-full"></span>
                          SYSTÈME ACTIF | <span className="text-[#4cc9f0]">NIVEAU ALPHA</span> | <span className="text-[#00b4d8]">IA TACTIQUE v3.0</span>
                        </p>
                      </div>
                      <div className="hidden md:flex items-center gap-4">
                        <div className="bg-[#091525]/80 py-1 px-4 rounded-full border border-[#00b4d8]/30 text-xs text-[#c3d9ee]/80">
                          <span className="text-[#4cc9f0]">STATUS:</span> En attente de mission
                        </div>
                        <div className="bg-[#091525]/80 py-1 px-4 rounded-full border border-[#00b4d8]/30 text-xs text-[#c3d9ee]/80">
                          <span className="text-[#4cc9f0]">NIVEAU:</span> Agent cybernétique
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contenu principal avec padding pour laisser de l'espace pour la navbar fixe */}
                  <div className="pt-28 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
                    {/* Message de bienvenue avec animation de frappe */}
                    <div className="relative py-10 mb-12 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#00b4d8]/5 to-transparent rounded-lg"></div>
                      <div className="relative z-10">
                        <h2 className="font-mono text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-white">
                          <span className="text-[#00b4d8]">BIENVENUE</span> DANS LE <span className="text-[#00b4d8]">CYBER</span>SPACE
                        </h2>
                        <p className="text-[#c3d9ee]/90 text-lg max-w-3xl typewriter-text">
                          Sélectionnez un environnement d'entraînement interactif pour développer vos compétences en cybersécurité.
                          <span className="inline-block w-2 h-5 bg-[#00b4d8] ml-1 animate-pulse"></span>
                        </p>
                      </div>
                      
                      {/* Éléments de décoration cyberpunk */}
                      <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#00b4d8]/10 rounded-full blur-3xl"></div>
                      <div className="absolute -left-5 -bottom-5 w-24 h-24 bg-[#4cc9f0]/10 rounded-full blur-2xl"></div>
                    </div>
                    
                    {/* Modes d'apprentissage - design futuriste sans bordures */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 xl:gap-12">
                    
                      {/* MODE 1: ENVIRONNEMENT DE JEU DE RÔLE - SOC VIRTUEL */}
                      <div 
                        className="relative group cursor-pointer min-h-[25rem] h-full overflow-hidden"
                        style={{minHeight: '27rem'}}
                        onClick={() => {
                          setInputMessage("Initialise un jeu de rôle où je suis un RSSI face à une tentative d'intrusion. Propose différents personnages que je peux incarner et guide-moi dans une simulation réaliste.");
                          startSession();
                        }}
                      >
                        {/* Image de fond avec effet parallaxe */}
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1574586798873-51420e12bdc8?q=80&w=1470&auto=format&fit=crop')] bg-cover bg-center transform group-hover:scale-110 transition-transform duration-700"></div>
                        
                        {/* Overlay pour améliorer la lisibilité */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-90"></div>
                        
                        {/* Contenu */}
                        <div className="relative h-full flex flex-col justify-end p-6 z-10">
                          <div className="absolute top-5 right-5 w-20 h-20 border-t-2 border-r-2 border-[#00b4d8]/70 rounded-tr-lg"></div>
                          
                          <div className="mb-5">
                            <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#e63946]/80 text-white text-xs font-bold mb-3">
                              <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
                              ENVIRONNEMENT IMMERSIF
                            </div>
                            
                            <h3 className="font-mono text-2xl sm:text-3xl font-bold text-white mb-4">
                              JEU DE RÔLE<br/>
                              <span className="text-[#00b4d8]">CYBER TACTIQUE</span>
                            </h3>
                            
                            <p className="text-[#c3d9ee] mb-5 max-w-md">
                              Plongez dans un centre d'opérations de sécurité virtuel. Interagissez avec des personnages non-joueurs, prenez des décisions critiques et résolvez des incidents en temps réel.
                            </p>
                            
                            <div className="flex flex-wrap gap-2 mb-6">
                              <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm text-[#00b4d8] px-3 py-1.5 rounded-full text-xs">
                                <div className="h-4 w-4 rounded-full bg-[#00b4d8]/20 flex items-center justify-center">
                                  <span className="h-2 w-2 rounded-full bg-[#00b4d8]"></span>
                                </div>
                                RSSI
                              </div>
                              <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm text-[#00b4d8] px-3 py-1.5 rounded-full text-xs">
                                <div className="h-4 w-4 rounded-full bg-[#00b4d8]/20 flex items-center justify-center">
                                  <span className="h-2 w-2 rounded-full bg-[#00b4d8]"></span>
                                </div>
                                Analyste SOC
                              </div>
                              <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm text-[#00b4d8] px-3 py-1.5 rounded-full text-xs">
                                <div className="h-4 w-4 rounded-full bg-[#00b4d8]/20 flex items-center justify-center">
                                  <span className="h-2 w-2 rounded-full bg-[#00b4d8]"></span>
                                </div>
                                Expert CERT
                              </div>
                            </div>
                          </div>
                          
                          <button className="group-hover:bg-[#00b4d8] bg-[#00b4d8]/80 text-black font-bold py-3 px-5 rounded-lg transition-all duration-300 flex items-center justify-between w-full">
                            LANCER LA SIMULATION
                            <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      </div>
                      
                      {/* MODE 2: ENVIRONNEMENT QCM ET EXERCICES */}
                      <div 
                        className="relative group cursor-pointer min-h-[25rem] h-full overflow-hidden"
                        style={{minHeight: '27rem'}}
                        onClick={() => {
                          setInputMessage("Créé un QCM interactif de 5 questions sur la sécurité des réseaux avec différents niveaux de difficulté et explications détaillées.");
                          startSession();
                        }}
                      >
                        {/* Image de fond avec effet parallaxe */}
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=1470&auto=format&fit=crop')] bg-cover bg-center transform group-hover:scale-110 transition-transform duration-700"></div>
                        
                        {/* Overlay pour améliorer la lisibilité */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent opacity-90"></div>
                        
                        {/* Contenu */}
                        <div className="relative h-full flex flex-col justify-end p-6 z-10">
                          <div className="absolute top-5 right-5 w-20 h-20 border-t-2 border-r-2 border-[#4cc9f0]/70 rounded-tr-lg"></div>
                          
                          <div className="mb-5">
                            <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#4cc9f0]/80 text-white text-xs font-bold mb-3">
                              <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
                              CHALLENGES INTERACTIFS
                            </div>
                            
                            <h3 className="font-mono text-2xl sm:text-3xl font-bold text-white mb-4">
                              EXERCICES &<br/>
                              <span className="text-[#4cc9f0]">ÉVALUATIONS</span>
                            </h3>
                            
                            <p className="text-[#c3d9ee] mb-5 max-w-md">
                              Testez vos connaissances avec des QCM interactifs, des labs pratiques et des défis techniques. Recevez des explications détaillées et suivez votre progression en temps réel.
                            </p>
                            
                            <div className="grid grid-cols-3 gap-2 mb-6">
                              <div className="flex flex-col items-center gap-1 bg-black/40 backdrop-blur-sm text-center p-2 rounded text-xs text-white">
                                <span className="text-[#4cc9f0] font-bold">QCM</span>
                                <span className="text-[#c3d9ee]/80 text-[10px]">Tests guidés</span>
                              </div>
                              <div className="flex flex-col items-center gap-1 bg-black/40 backdrop-blur-sm text-center p-2 rounded text-xs text-white">
                                <span className="text-[#4cc9f0] font-bold">LABS</span>
                                <span className="text-[#c3d9ee]/80 text-[10px]">Pratique</span>
                              </div>
                              <div className="flex flex-col items-center gap-1 bg-black/40 backdrop-blur-sm text-center p-2 rounded text-xs text-white">
                                <span className="text-[#4cc9f0] font-bold">DÉFIS</span>
                                <span className="text-[#c3d9ee]/80 text-[10px]">Avancés</span>
                              </div>
                            </div>
                          </div>
                          
                          <button className="group-hover:bg-[#4cc9f0] bg-[#4cc9f0]/80 text-black font-bold py-3 px-5 rounded-lg transition-all duration-300 flex items-center justify-between w-full">
                            COMMENCER L'ÉVALUATION
                            <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      </div>
                      
                      {/* MODE 3: ENVIRONNEMENT CONVERSATION LIBRE */}
                      <div 
                        className="relative group cursor-pointer min-h-[25rem] h-full overflow-hidden" 
                        style={{minHeight: '27rem'}}
                        onClick={() => {
                          setInputMessage("Je voudrais apprendre à détecter et me protéger contre le phishing");
                          startSession();
                        }}
                      >
                        {/* Image de fond avec effet parallaxe */}
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1470&auto=format&fit=crop')] bg-cover bg-center transform group-hover:scale-110 transition-transform duration-700"></div>
                        
                        {/* Overlay pour améliorer la lisibilité */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-90"></div>
                        
                        {/* Contenu */}
                        <div className="relative h-full flex flex-col justify-end p-6 z-10">
                          <div className="absolute top-5 right-5 w-20 h-20 border-t-2 border-r-2 border-[#00b4d8]/70 rounded-tr-lg"></div>
                          
                          <div className="mb-5">
                            <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#48cae4]/80 text-white text-xs font-bold mb-3">
                              <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
                              DIALOGUE ADAPTATIF
                            </div>
                            
                            <h3 className="font-mono text-xl sm:text-2xl font-bold text-white mb-2">
                              <span className="inline">EXPERT</span> <span className="text-[#48cae4] inline">CYBERSÉCURITÉ</span> <span className="text-[#48cae4] inline">& GESTION DE CRISE</span>
                            </h3>
                            
                            <p className="text-[#c3d9ee] mb-5 max-w-md">
                              Échangez librement avec notre IA experte en cybersécurité. Posez vos questions sur n'importe quel sujet cyber et recevez des explications personnalisées à votre niveau.
                            </p>
                            
                            <div className="flex flex-wrap gap-2 mb-6">
                              <div className="bg-black/40 backdrop-blur-sm text-[#48cae4] px-3 py-1.5 rounded-full text-xs">
                                Phishing
                              </div>
                              <div className="bg-black/40 backdrop-blur-sm text-[#48cae4] px-3 py-1.5 rounded-full text-xs">
                                Ransomware
                              </div>
                              <div className="bg-black/40 backdrop-blur-sm text-[#48cae4] px-3 py-1.5 rounded-full text-xs">
                                Sécurité Réseau
                              </div>
                              <div className="bg-black/40 backdrop-blur-sm text-[#48cae4] px-3 py-1.5 rounded-full text-xs">
                                Zero Trust
                              </div>
                              <div className="bg-black/40 backdrop-blur-sm text-[#48cae4] px-3 py-1.5 rounded-full text-xs">
                                RGPD
                              </div>
                            </div>
                          </div>
                          
                          <button className="group-hover:bg-[#48cae4] bg-[#48cae4]/80 text-black font-bold py-3 px-5 rounded-lg transition-all duration-300 flex items-center justify-between w-full">
                            DIALOGUER AVEC L'EXPERT
                            <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      </div>
                      
                      {/* MODE 4: SCÉNARIOS AVANCÉS */}
                      <div 
                        className="relative group cursor-pointer min-h-[25rem] h-full overflow-hidden"
                        style={{minHeight: '27rem'}}
                        onClick={() => {
                          setInputMessage("Lance un scénario de gestion de crise cybersécurité où je dois analyser une violation de données et proposer un plan d'action");
                          startSession();
                        }}
                      >
                        {/* Image de fond avec effet parallaxe */}
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544890225-2f3faec4cd60?q=80&w=1625&auto=format&fit=crop')] bg-cover bg-center transform group-hover:scale-110 transition-transform duration-700"></div>
                        
                        {/* Overlay pour améliorer la lisibilité */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent opacity-90"></div>
                        
                        {/* Contenu */}
                        <div className="relative h-full flex flex-col justify-end p-6 z-10">
                          <div className="absolute top-5 right-5 w-20 h-20 border-t-2 border-r-2 border-[#e63946]/70 rounded-tr-lg"></div>
                          
                          <div className="mb-5">
                            <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#e63946]/80 text-white text-xs font-bold mb-3">
                              <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
                              NIVEAU AVANCÉ
                            </div>
                            
                            <h3 className="font-mono text-2xl sm:text-3xl font-bold text-white mb-4">
                              GESTION DE<br/>
                              <span className="text-[#e63946]">CRISE CYBER</span>
                            </h3>
                            
                            <p className="text-[#c3d9ee] mb-5 max-w-md">
                              Gérez des scénarios complexes d'attaques sophistiquées. Analysez la situation, prenez des décisions stratégiques et développez votre plan de réponse à incident.
                            </p>
                            
                            <div className="grid grid-cols-2 gap-2 mb-6">
                              <div className="border border-[#e63946]/30 bg-black/40 backdrop-blur-sm py-2 px-3 rounded text-xs">
                                <div className="text-[#e63946] font-bold mb-1">Incident Response</div>
                                <div className="text-[#c3d9ee]/80 text-[10px]">Plan d'action immédiat</div>
                              </div>
                              <div className="border border-[#e63946]/30 bg-black/40 backdrop-blur-sm py-2 px-3 rounded text-xs">
                                <div className="text-[#e63946] font-bold mb-1">APT Detection</div>
                                <div className="text-[#c3d9ee]/80 text-[10px]">Menaces persistantes</div>
                              </div>
                            </div>
                          </div>
                          
                          <button className="group-hover:bg-[#e63946] bg-[#e63946]/80 text-white font-bold py-3 px-5 rounded-lg transition-all duration-300 flex items-center justify-between w-full">
                            ACTIVER SCÉNARIO CRITIQUE
                            <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Barre d'état système en bas - style console cyberpunk */}
                    <div className="mt-16 mb-36 p-4 border-t border-[#00b4d8]/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex items-center gap-3">
                        <div className="h-3 w-3 bg-[#00b4d8] rounded-full animate-pulse"></div>
                        <span className="text-[#00b4d8] text-xs uppercase font-mono">Système en ligne - Prêt pour déploiement</span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:flex gap-x-6 gap-y-2 text-[#c3d9ee]/60 text-xs">
                        <div className="flex items-center gap-2">
                          <svg className="h-3 w-3 text-[#00b4d8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          <span>Sécurité: Alpha</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="h-3 w-3 text-[#00b4d8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>Date: {new Date().toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="h-3 w-3 text-[#00b4d8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>CyberSystem v3.8.2</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="h-3 w-3 text-[#00b4d8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Classification: Confidentiel</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : sessionSummary ? (
              // Affichage du résumé de session
              <div className="bg-[#091525] border border-[#00b4d8]/30 text-white rounded-lg shadow-[0_0_30px_rgba(0,180,216,0.3)] max-w-3xl w-full p-6">
                <div className="flex justify-between items-center mb-6 border-b border-[#00b4d8]/20 pb-4">
                  <h2 className="text-2xl font-mono text-[#00b4d8]">SYNTHÈSE DE SESSION</h2>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setSessionSummary(null)}
                    className="h-8 w-8 rounded-full hover:bg-[#112641] text-[#00b4d8]"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="prose prose-invert max-w-none text-[#c3d9ee] mb-6" 
                  dangerouslySetInnerHTML={{ 
                    __html: DOMPurify.sanitize(formatTextWithStructure(sessionSummary)) 
                  }}
                />
                
                <div className="flex justify-between mt-8">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsSessionActive(false);
                      setSessionSummary(null);
                      setMessages([]);
                    }}
                    className="bg-[#091525] border-[#00b4d8]/30 text-[#00b4d8] hover:bg-[#112641] hover:border-[#00b4d8]/50"
                  >
                    Retour à l'accueil
                  </Button>
                  <Button 
                    onClick={() => startSession()}
                    className="bg-[#00b4d8] hover:bg-[#00b4d8]/90 text-[#091525]"
                  >
                    Nouvelle session
                  </Button>
                </div>
              </div>
            ) : (
              // Interface Ultra-immersive plein écran avec zones de chat fixes
              <div className="fixed inset-0 w-full h-full flex flex-col">
                {/* Mode actuel header - change en fonction du mode sélectionné */}
                <div className="bg-gradient-to-r from-[#091525]/95 to-[#112641]/95 backdrop-blur-md border-b border-[#00b4d8]/30 py-3 px-4 flex items-center justify-between shadow-lg z-40">
                  <div className="flex items-center gap-4">
                    <div className="h-9 w-9 rounded-full flex items-center justify-center bg-[#00b4d8]/20 border border-[#00b4d8]/40 shadow-inner shadow-[#00b4d8]/10">
                      <span className="text-[#00b4d8] text-sm font-bold">AI</span>
                    </div>
                    <div>
                      <h3 className="text-[#c3d9ee] font-bold text-sm">MODE: <span className="text-[#00b4d8]">EXPERT CYBERSÉCURITÉ</span></h3>
                      <div className="flex items-center gap-3 text-xs text-[#c3d9ee]/70">
                        <div className="flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-[#4cc9f0] animate-pulse"></span>
                          <span>Connecté</span>
                        </div>
                        <div>|</div>
                        <div>Session #ID-{userId?.substring(0, 8)}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setInputMessage("Aide: montre-moi toutes les commandes")}
                      className="border-[#00b4d8]/50 bg-[#091525]/60 text-[#00b4d8] hover:bg-[#112641] text-xs py-1"
                    >
                      <LightbulbIcon className="h-3.5 w-3.5 mr-1" />
                      Aide
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setInputMessage("Pouvons-nous passer au mode exercice pratique ?")}
                      className="border-[#00b4d8]/50 bg-[#091525]/60 text-[#00b4d8] hover:bg-[#112641] text-xs py-1"
                    >
                      <svg className="h-3.5 w-3.5 mr-1 text-[#00b4d8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                      Mode pratique
                    </Button>
                  </div>
                </div>
                
                {/* Corps principal divisé en deux sections: zone d'info à gauche et chat à droite */}
                <div className="flex flex-1 overflow-hidden h-[calc(100vh-56px)]">
                  {/* Panneau latéral gauche - informations contextuelles */}
                  <div className="w-1/4 bg-[#050a15]/95 border-r border-[#00b4d8]/20 text-white overflow-y-auto hide-scrollbar">
                    {/* Progression de l'apprentissage */}
                    <div className="px-4 py-6 border-b border-[#00b4d8]/20">
                      <h3 className="text-[#00b4d8] font-mono text-sm font-bold mb-3 flex items-center">
                        <svg className="h-4 w-4 mr-2 text-[#00b4d8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        PROGRESSION
                      </h3>
                      <div className="space-y-2">
                        <div className="w-full bg-[#091525] rounded-full h-2.5">
                          <div className="bg-gradient-to-r from-[#00b4d8] to-[#4cc9f0] h-2.5 rounded-full" style={{ width: '35%' }}></div>
                        </div>
                        <div className="flex justify-between text-xs text-[#c3d9ee]/70">
                          <span>Débutant</span>
                          <span>Intermédiaire</span>
                          <span>Avancé</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Données de la session courante */}
                    <div className="px-4 py-6 border-b border-[#00b4d8]/20">
                      <h3 className="text-[#00b4d8] font-mono text-sm font-bold mb-3 flex items-center">
                        <svg className="h-4 w-4 mr-2 text-[#00b4d8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        INFOS SESSION
                      </h3>
                      <div className="space-y-3 text-sm text-[#c3d9ee]/80">
                        <div className="flex justify-between">
                          <span>Topic:</span>
                          <span className="text-[#00b4d8]">{sessionStatus?.topic || "En découverte"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Niveau actuel:</span>
                          <span className="text-[#00b4d8]">Adaptatif</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Étape:</span>
                          <span className="text-[#00b4d8]">{sessionStatus?.currentStage || "exploration"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Messages:</span>
                          <span className="text-[#00b4d8]">{messages.length}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Commandes et aide rapide */}
                    <div className="px-4 py-6 border-b border-[#00b4d8]/20">
                      <h3 className="text-[#00b4d8] font-mono text-sm font-bold mb-3 flex items-center">
                        <svg className="h-4 w-4 mr-2 text-[#00b4d8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                        COMMANDES RAPIDES
                      </h3>
                      <div className="space-y-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full justify-start p-1.5 h-auto text-xs text-[#c3d9ee] hover:text-[#00b4d8] hover:bg-[#112641]"
                          onClick={() => setInputMessage("Crée un QCM sur ce sujet")}
                        >
                          <span className="w-2 h-2 bg-[#4cc9f0] rounded-full mr-2"></span>
                          Mode QCM rapide
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full justify-start p-1.5 h-auto text-xs text-[#c3d9ee] hover:text-[#00b4d8] hover:bg-[#112641]"
                          onClick={() => setInputMessage("Commencer un jeu de rôle avec des PNJ")}
                        >
                          <span className="w-2 h-2 bg-[#00b4d8] rounded-full mr-2"></span>
                          Activer mode jeu de rôle
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full justify-start p-1.5 h-auto text-xs text-[#c3d9ee] hover:text-[#00b4d8] hover:bg-[#112641]"
                          onClick={() => setInputMessage("Lance un scénario de gestion de crise")}
                        >
                          <span className="w-2 h-2 bg-[#e63946] rounded-full mr-2"></span>
                          Scénario de crise
                        </Button>
                      </div>
                    </div>
                    
                    {/* Section "Le saviez-vous?" */}
                    <div className="px-4 py-6">
                      <div className="bg-[#091525]/60 border border-[#00b4d8]/30 rounded-lg p-4 shadow-inner">
                        <h3 className="text-[#00b4d8] font-mono text-sm font-bold mb-3 flex items-center">
                          <LightbulbIcon className="h-4 w-4 mr-2" />
                          LE SAVIEZ-VOUS ?
                        </h3>
                        <p className="text-[#c3d9ee]/80 text-xs leading-relaxed">
                          {getMessage(Math.floor(Math.random() * 8))}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Zone principale de chat - toujours visible et fixe */}
                  <div className="w-3/4 flex flex-col bg-gradient-to-br from-[#050a15]/95 to-[#091525]/95">
                    {/* Zone de messages avec défilement */}
                    <div 
                      ref={chatContainerRef}
                      className="flex-1 overflow-y-auto p-6 pb-96 space-y-6 custom-scrollbar cyber-expert" style={{paddingBottom: '400px'}}
                    >
                      {messages.map((message, index) => (
                        <div key={message.id}>
                          <div
                            className={`flex ${
                              message.type === "user" ? "justify-end" : "justify-start"
                            }`}
                          >
                            {/* Avatar pour les messages du bot */}
                            {message.type === "bot" && (
                              <div className="h-8 w-8 rounded-full bg-[#00b4d8]/20 border border-[#00b4d8]/40 flex items-center justify-center mr-3 shadow-sm">
                                <Bot className="h-4 w-4 text-[#00b4d8]" />
                              </div>
                            )}
                            
                            <div
                              className={`max-w-[85%] p-4 rounded-lg ${
                                message.type === "user"
                                  ? "bg-gradient-to-br from-[#00b4d8]/40 to-[#00b4d8]/30 text-white ml-auto shadow-[0_2px_10px_rgba(0,180,216,0.15)]"
                                  : "bg-gradient-to-br from-[#121e2e] to-[#0f1b29] border border-[#00b4d8]/10 text-white shadow-[0_2px_10px_rgba(0,0,0,0.1)]"
                              }`}
                            >
                              {message.type === "bot" ? (
                                <div 
                                  className="prose prose-invert max-w-none text-[#c3d9ee] text-base" 
                                  dangerouslySetInnerHTML={{ 
                                    __html: DOMPurify.sanitize(formatTextWithStructure(message.content)) 
                                  }}
                                />
                              ) : (
                                <p className="text-[#c3d9ee] text-base">{message.content}</p>
                              )}
                              <div className="text-xs text-[#00b4d8]/60 mt-2 text-right">
                                {new Date(message.timestamp).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </div>
                            </div>
                            
                            {/* Avatar pour les messages de l'utilisateur */}
                            {message.type === "user" && (
                              <div className="h-8 w-8 rounded-full bg-[#091525] border border-[#00b4d8]/40 flex items-center justify-center ml-3 shadow-sm">
                                <svg className="h-4 w-4 text-[#00b4d8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          
                          {/* Interactions contextuelles entre les messages */}
                          {message.type === "bot" && index > 0 && index % 5 === 0 && (
                            <div className="my-4 px-10">
                              <div className="bg-[#091525]/70 backdrop-blur-sm border border-[#00b4d8]/20 rounded-lg p-3 shadow-lg">
                                <div className="flex items-start">
                                  <div className="bg-[#00b4d8]/20 p-2 rounded-full mr-3">
                                    <LightbulbIcon className="h-4 w-4 text-[#00b4d8]" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-[#00b4d8] text-sm font-semibold">APPROFONDISSEMENT</p>
                                    <p className="text-[#c3d9ee] text-xs mt-1 mb-2">
                                      Souhaitez-vous explorer un aspect particulier de ce sujet?
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        className="border-[#00b4d8]/30 bg-[#091525]/50 text-[#00b4d8] hover:bg-[#112641] text-xs py-1"
                                        onClick={() => setInputMessage(`Quels sont les cas réels récents sur ${getTopicFromIndex(index)}?`)}
                                      >
                                        Cas réels
                                      </Button>
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        className="border-[#00b4d8]/30 bg-[#091525]/50 text-[#00b4d8] hover:bg-[#112641] text-xs py-1"
                                        onClick={() => setInputMessage(`Crée un exercice pratique sur ${getTopicFromIndex(index)}`)}
                                      >
                                        Exercice pratique
                                      </Button>
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        className="border-[#00b4d8]/30 bg-[#091525]/50 text-[#00b4d8] hover:bg-[#112641] text-xs py-1"
                                        onClick={() => setInputMessage(`Comment se protéger contre ${getTopicFromIndex(index)}?`)}
                                      >
                                        Mesures protectives
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {/* Indicateur de chargement */}
                      {isLoading && (
                        <div className="flex items-start">
                          <div className="h-8 w-8 rounded-full bg-[#00b4d8]/20 border border-[#00b4d8]/40 flex items-center justify-center mr-3 shadow-sm">
                            <Bot className="h-4 w-4 text-[#00b4d8]" />
                          </div>
                          <div className="bg-gradient-to-br from-[#121e2e] to-[#0f1b29] border border-[#00b4d8]/10 p-4 rounded-lg max-w-[85%] shadow-[0_2px_10px_rgba(0,0,0,0.1)]">
                            <div className="flex items-center gap-3">
                              <div className="flex space-x-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-[#00b4d8]/50 animate-pulse"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-[#00b4d8]/50 animate-pulse delay-150"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-[#00b4d8]/50 animate-pulse delay-300"></div>
                              </div>
                              <div className="text-xs text-[#00b4d8]/70 flex items-center gap-1.5">
                                <svg className="h-3 w-3 text-[#00b4d8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                <span>Génération active...</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Bouton de défilement vers le bas */}
                    {showScrollButton && (
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute bottom-[88px] right-8 rounded-full bg-[#091525]/80 backdrop-blur-sm border-[#00b4d8]/30 text-[#00b4d8] hover:bg-[#112641] hover:border-[#00b4d8]/50 shadow-[0_0_15px_rgba(0,180,216,0.2)] z-20"
                        onClick={scrollToBottom}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {/* Zone de saisie fixe en bas - toujours visible */}
                    <div className="px-6 py-4 bg-[#091525]/90 backdrop-blur-md border-t border-[#00b4d8]/20 shadow-[0_-4px_20px_rgba(0,0,0,0.2)]">
                      {/* Quick commands and suggestions */}
                      <div className="mb-3">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setInputMessage("Comment me protéger contre le phishing ?")}
                            className="border-[#00b4d8]/30 bg-[#091525]/80 text-[#c3d9ee] hover:bg-[#112641] hover:text-[#00b4d8] text-xs py-1"
                          >
                            Protection phishing
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setInputMessage("Explique-moi les ransomwares")}
                            className="border-[#00b4d8]/30 bg-[#091525]/80 text-[#c3d9ee] hover:bg-[#112641] hover:text-[#00b4d8] text-xs py-1"
                          >
                            Ransomwares
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setInputMessage("Comment sécuriser mon Wi-Fi ?")}
                            className="border-[#00b4d8]/30 bg-[#091525]/80 text-[#c3d9ee] hover:bg-[#112641] hover:text-[#00b4d8] text-xs py-1"
                          >
                            Sécurité Wi-Fi
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setInputMessage("Crée un exercice pratique")}
                            className="border-[#00b4d8]/30 bg-[#091525]/80 text-[#c3d9ee] hover:bg-[#112641] hover:text-[#00b4d8] text-xs py-1"
                          >
                            Exercice pratique
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setInputMessage("Mode jeu de rôle")}
                            className="border-[#00b4d8]/30 bg-[#091525]/80 text-[#c3d9ee] hover:bg-[#112641] hover:text-[#00b4d8] text-xs py-1"
                          >
                            Jeu de rôle
                          </Button>
                        </div>
                      </div>
                      
                      {/* Input form with send button */}
                      <form onSubmit={handleSubmit} className="flex space-x-3">
                        <div className="flex-1 relative">
                          <textarea
                            ref={textareaRef}
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Tapez votre message ou commande ici..."
                            className="w-full p-3 bg-[#121e2e]/90 backdrop-blur-sm text-[#c3d9ee] border border-[#00b4d8]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00b4d8]/50 resize-none h-[60px] text-base shadow-inner"
                            disabled={isLoading}
                          />
                          <div className="absolute right-3 bottom-2 text-xs text-[#00b4d8]/70">
                            {inputMessage.length > 0 ? `${inputMessage.length} car.` : 'Entrée: envoyer · Maj+Entrée: nouvelle ligne'}
                          </div>
                        </div>
                        <Button 
                          type="submit" 
                          disabled={isLoading || !inputMessage.trim()} 
                          className="bg-gradient-to-r from-[#00b4d8] to-[#4cc9f0] hover:from-[#00b4d8]/90 hover:to-[#4cc9f0]/90 text-[#091525] self-end h-[60px] w-[60px] rounded-lg shadow-md"
                        >
                          {isLoading ? (
                            <RefreshCw className="h-5 w-5 animate-spin" />
                          ) : (
                            <Send className="h-5 w-5" />
                          )}
                        </Button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </HomeLayout>
  );
};

// Wrap the component with the DecisionProvider
const CyberExpertLearningWithContext: React.FC = () => (
  <DecisionProvider>
    <CyberExpertLearning />
  </DecisionProvider>
);

export default CyberExpertLearningWithContext;