import React, { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, ChevronDown, ChevronRight, RefreshCw, Bot, X, ArrowLeft, FileText, Plus, Home, Lightbulb as LightbulbIcon } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import HomeLayout from "@/components/layout/HomeLayout";
import PageTitle from "@/components/utils/PageTitle";
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
  
  // Utiliser modulo pour toujours renvoyer un message valide, même si l'index dépasse le tableau
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
  // comme (ACADÉMIQUE), (SIMULATION), (DÉFI), etc.
  formattedText = formattedText.replace(/\((ACADÉMIQUE|ACADEMIC|SIMULATION|DÉFI|CHALLENGE|VISUEL|VISUAL)\)/gi, 
    '<span class="inline-block bg-[#00b4d8]/20 text-[#00b4d8] text-xs px-2 py-0.5 rounded mr-1 uppercase font-mono">$1</span>');
  
  // Remplacer les listes numérotées (1., 2., etc.)
  formattedText = formattedText.replace(/^(\d+\.\s+)(.+)$/gm, '<div class="flex mb-2"><div class="w-6 flex-shrink-0 font-bold">$1</div><div>$2</div></div>');
  
  // Remplacer les listes à puces (-, *, •)
  formattedText = formattedText.replace(/^([-*•]\s+)(.+)$/gm, '<div class="flex mb-2"><div class="w-6 flex-shrink-0">$1</div><div>$2</div></div>');
  
  // Mettre en surbrillance les sections importantes (entre ** ou entourées de MAJUSCULES)
  formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<span class="font-bold text-blue-300">$1</span>');
  
  // Ajouter une classe pour les sections en majuscules (comme "PHASE INITIALE")
  formattedText = formattedText.replace(/([A-Z]{3,}[\s-][A-Z\s-]+)(\s*-\s*)/g, '<div class="font-bold text-blue-300 mt-3 mb-1">$1</div>');
  
  // Gérer les titres de sections (mais pas ceux déjà traités comme styles d'apprentissage)
  formattedText = formattedText.replace(/(?<!span class="[^"]*">)(.*?):/g, '<span class="font-semibold">$1:</span>');

  return formattedText;
};

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

// Composant principal avec l'interface d'apprentissage et la prise de décision
function ExpertLearningPageContent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus | null>(null);
  const [sessionSummary, setSessionSummary] = useState<string | null>(null);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // Accès au contexte de décision
  const decision = useDecision();
  
  // Effet pour vérifier le statut de décision à l'initialisation et après l'envoi de messages
  useEffect(() => {
    if (userId) {
      decision.checkDecisionStatus(userId);
    }
  }, [userId]);
  
  // Fonction pour gérer une décision
  const handleDecisionMade = async (optionId: string) => {
    if (userId && decision.currentScenario) {
      await decision.submitDecision(userId, optionId);
    }
  };

  // Fonction pour démarrer une nouvelle session
  const startSession = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest<{success: boolean, userId: string, message: string}>('/api/cyber-expert/init', {
        method: 'POST'
      });

      if (response.success && response.userId) {
        setUserId(response.userId);
        setIsSessionActive(true);
        
        // Ajouter le message de bienvenue
        const welcomeMessage: Message = {
          id: uuidv4(),
          type: "bot",
          content: response.message,
          timestamp: Date.now()
        };
        setMessages([welcomeMessage]);
      } else {
        throw new Error("Échec de l'initialisation de la session");
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

  // Fonction pour terminer la session actuelle
  const endSession = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const response = await apiRequest<{success: boolean, summary?: string}>('/api/cyber-expert/terminate', {
        method: 'POST',
        body: JSON.stringify({ userId })
      });

      if (response.success) {
        // Afficher le résumé si disponible
        if (response.summary) {
          setSessionSummary(response.summary);
        }
        
        // Réinitialiser l'état
        setIsSessionActive(false);
        setUserId(null);
        
        toast({
          title: "Session terminée",
          description: "Votre session d'apprentissage a été terminée avec succès.",
          variant: "default"
        });
      }
    } catch (error) {
      console.error("Erreur lors de la fin de la session:", error);
      toast({
        title: "Erreur",
        description: "Impossible de terminer la session. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour envoyer un message
  const sendMessage = async () => {
    if (!inputMessage.trim() || !userId) return;
    
    // Créer un message utilisateur
    const userMessage: Message = {
      id: uuidv4(),
      type: "user",
      content: inputMessage,
      timestamp: Date.now()
    };
    
    // Ajouter à la liste des messages
    setMessages(prev => [...prev, userMessage]);
    
    // Vider le champ de saisie
    setInputMessage("");
    
    // Focus sur le champ de saisie après envoi
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
    
    setIsLoading(true);
    try {
      const response = await apiRequest<{success: boolean, message: string, sessionStatus: SessionStatus}>('/api/cyber-expert/message', {
        method: 'POST',
        body: JSON.stringify({
          userId,
          message: userMessage.content
        })
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
        
        // Mettre à jour le statut de la session
        if (response.sessionStatus) {
          setSessionStatus(response.sessionStatus);
          
          // Si le serveur indique que le mode décision est prêt
          if (response.sessionStatus.readyForDecisionMode && userId && response.sessionStatus.topic) {
            // Lancer automatiquement le mode décision après le débriefing
            decision.startDecisionFlow(userId, response.sessionStatus.topic);
            
            // Afficher un toast pour informer l'utilisateur du changement de mode
            toast({
              title: "Mode décision activé",
              description: "Vous allez maintenant être confronté à une série de décisions difficiles. Choisissez avec soin!",
              variant: "default"
            });
          }
        }
        
        // Vérifier si l'utilisateur est en mode décision après chaque message
        if (userId) {
          decision.checkDecisionStatus(userId);
        }
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

  // Gestion de l'envoi du formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  // Gestion des touches (Entrée pour envoyer, Shift+Entrée pour nouvelle ligne)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Shift+Enter - ajouter une nouvelle ligne
        return; // Comportement par défaut (insertion d'un saut de ligne)
      } else {
        // Enter simple - envoyer le message
        e.preventDefault(); // Empêcher le saut de ligne
        if (inputMessage.trim()) {
          handleSubmit(e);
        }
      }
    }
  };

  // Détecter le défilement pour afficher/masquer le bouton de défilement vers le bas
  useEffect(() => {
    if (!chatContainerRef.current) return;
    
    const handleScroll = () => {
      if (!chatContainerRef.current) return;
      
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const isScrolledUp = scrollHeight - scrollTop - clientHeight > 100;
      setShowScrollButton(isScrolledUp);
    };
    
    // Vérifier la position initiale
    handleScroll();
    
    // Ajouter un écouteur de défilement
    chatContainerRef.current.addEventListener('scroll', handleScroll);
    
    return () => {
      chatContainerRef.current?.removeEventListener('scroll', handleScroll);
    };
  }, [messages]);

  // Fonction pour faire défiler vers le bas
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  // Focus sur le champ de saisie au chargement
  useEffect(() => {
    if (textareaRef.current && isSessionActive) {
      textareaRef.current.focus();
    }
  }, [isSessionActive]);

  // Faire défiler vers le bas lors de l'ajout de nouveaux messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fermer le résumé et réinitialiser les états pour une nouvelle session
  const closeSessionSummary = () => {
    setSessionSummary(null);
    setMessages([]);
    setSessionStatus(null);
  };
  
  // Fonction pour retourner à la page précédente
  const handleReturnToPrevious = () => {
    // Si une session est active, demander confirmation avant de quitter
    if (isSessionActive) {
      if (window.confirm("Êtes-vous sûr de vouloir quitter la session ? Votre conversation sera perdue.")) {
        // Terminer la session côté serveur et naviguer à la page précédente
        if (userId) {
          // Faire une requête pour terminer la session sans attendre la réponse
          apiRequest('/api/cyber-expert/terminate', {
            method: 'POST',
            body: JSON.stringify({ userId })
          }).catch(err => console.error("Erreur lors de la fin de la session:", err));
        }
        setLocation('/cyber');
      }
    } else {
      // Si aucune session n'est active, naviguer directement
      setLocation('/cyber');
    }
  };

  return (
    <HomeLayout>
      <PageTitle title="Apprendre en échangeant" />
      
      <div className="min-h-[calc(100vh-64px)] relative overflow-hidden bg-[#0a1420]">
        {/* Overlay cybersecurity visualizations */}
        <div className="absolute inset-0 w-full h-full z-0">
          {/* Digital code streams effect */}
          <div className="absolute inset-0 opacity-20">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0, 180, 216, 0.2)" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
          
          {/* Simulated monitors with security data */}
          <div className="absolute top-0 left-0 w-1/4 h-full opacity-15">
            <div className="h-1/3 border border-[#00b4d8]/20 m-2 rounded-md p-4">
              <div className="w-full h-2 bg-[#00b4d8]/30 mb-2 rounded"></div>
              <div className="w-3/4 h-2 bg-[#00b4d8]/20 mb-2 rounded"></div>
              <div className="w-full h-2 bg-[#00b4d8]/10 mb-2 rounded"></div>
              <div className="w-1/2 h-2 bg-[#00b4d8]/20 mb-2 rounded"></div>
            </div>
          </div>
          
          <div className="absolute bottom-0 right-0 w-1/4 h-full opacity-15">
            <div className="h-1/3 border border-[#00b4d8]/20 m-2 rounded-md p-4">
              <div className="w-full h-2 bg-[#00b4d8]/20 mb-2 rounded"></div>
              <div className="w-3/4 h-2 bg-[#00b4d8]/30 mb-2 rounded"></div>
              <div className="w-full h-2 bg-[#00b4d8]/10 mb-2 rounded"></div>
              <div className="w-1/2 h-2 bg-[#00b4d8]/20 mb-2 rounded"></div>
            </div>
          </div>
          
          {/* Network diagram visualization */}
          <div className="absolute bottom-20 left-20 opacity-20">
            <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <circle cx="100" cy="100" r="80" fill="none" stroke="#e63946" strokeWidth="1" />
              <circle cx="100" cy="100" r="50" fill="none" stroke="#00b4d8" strokeWidth="1" />
              <line x1="30" y1="30" x2="170" y2="170" stroke="#00b4d8" strokeWidth="1" />
              <line x1="30" y1="170" x2="170" y2="30" stroke="#00b4d8" strokeWidth="1" />
              <circle cx="100" cy="100" r="5" fill="#e63946" />
              <circle cx="30" cy="30" r="3" fill="#00b4d8" />
              <circle cx="170" cy="170" r="3" fill="#00b4d8" />
              <circle cx="30" cy="170" r="3" fill="#00b4d8" />
              <circle cx="170" cy="30" r="3" fill="#00b4d8" />
            </svg>
          </div>
          
          {/* Shield icon */}
          <div className="absolute top-20 right-20 opacity-15">
            <svg width="100" height="120" viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
              <path d="M50,10 L90,30 L90,60 C90,80 70,100 50,110 C30,100 10,80 10,60 L10,30 L50,10 Z" 
                fill="none" stroke="#e63946" strokeWidth="2" />
              <path d="M40,60 L45,70 L65,50" fill="none" stroke="#00b4d8" strokeWidth="2" />
            </svg>
          </div>
        </div>
        
        <div className="relative z-10 max-w-6xl w-full mx-auto px-4 py-8 sm:px-6 sm:py-12">
          {/* Bouton de retour - style console cybersécurité */}
          <div className="absolute top-0 left-4 mt-4">
            <Button 
              variant="outline" 
              onClick={handleReturnToPrevious}
              className="bg-[#091525] border-[#00b4d8]/30 text-[#00b4d8] hover:bg-[#112641] hover:border-[#00b4d8]/50 flex items-center gap-2 font-mono text-xs shadow-[0_0_10px_rgba(0,180,216,0.1)]"
            >
              <span className="text-[#e63946]">←</span>
              <span>RETOUR CONSOLE PRINCIPALE</span>
            </Button>
          </div>
          
          <div className="flex flex-col items-center justify-center h-screen w-full overflow-hidden">
            {!isSessionActive && !sessionSummary ? (
              // Page d'accueil - style immersif et gamifié
              <div className="w-full max-w-7xl mx-auto">
                <div className="bg-[#091525] border border-[#00b4d8]/30 text-white shadow-[0_0_30px_rgba(0,180,216,0.3)] rounded-lg overflow-hidden">
                  <div className="border-b border-[#00b4d8]/20 bg-gradient-to-r from-[#091525] to-[#112641] p-6">
                    <h1 className="font-mono text-2xl text-[#00b4d8] flex items-center gap-3 mb-2">
                      <Bot className="h-7 w-7" />
                      CYBER COMMANDER - CENTRE DE CONTRÔLE
                    </h1>
                    <p className="text-[#c3d9ee]/90 font-mono">
                      <span className="inline-block w-3 h-3 bg-[#4cc9f0] animate-pulse mr-2 rounded-full"></span>
                      SYSTÈME ACTIF | SÉCURITÉ: <span className="text-[#4cc9f0]">NIVEAU ALPHA</span> | <span className="text-[#00b4d8]">IA TACTIQUE v3.0</span>
                    </p>
                  </div>

                  <div className="p-8">
                    <div className="font-mono text-base border-l-2 border-[#00b4d8]/50 pl-6 py-2 mb-8">
                      <p className="text-[#00b4d8] font-semibold text-lg">BIENVENUE, AGENT.</p>
                      <p className="mt-2 text-[#c3d9ee]">Choisissez votre mode d'interaction avec le système cyber avancé. Interface adaptative selon vos besoins et préférences de formation.</p>
                    </div>
                    
                    {/* Sélection de mode immersive et gamifiée */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      {/* Mode 1: Jeu de Rôles */}
                      <div 
                        className="bg-gradient-to-br from-[#121e2e] to-[#0d1520] rounded-lg border border-[#00b4d8]/30 hover:border-[#00b4d8]/70 hover:shadow-[0_0_20px_rgba(0,180,216,0.3)] transition-all cursor-pointer overflow-hidden group"
                        onClick={() => {
                          setInputMessage("Initialise un jeu de rôle où je suis un RSSI face à une tentative d'intrusion. Propose différents personnages que je peux incarner et guide-moi dans une simulation réaliste.");
                          startSession();
                        }}
                      >
                        <div className="p-6">
                          <div className="flex items-center mb-3">
                            <div className="w-12 h-12 bg-[#091525] rounded-full flex items-center justify-center border border-[#00b4d8]/40 mr-4 group-hover:bg-[#00b4d8]/20 transition-all shadow-md">
                              <svg className="h-6 w-6 text-[#00b4d8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                            </div>
                            <h3 className="font-mono font-semibold text-xl text-[#00b4d8]">JEU DE RÔLE IMMERSIF</h3>
                          </div>
                          <p className="text-[#c3d9ee] mb-4">Incarnez différents professionnels de la cybersécurité dans des situations de crise réalistes. Interagissez avec des PNJ et prenez des décisions stratégiques face à des incidents.</p>
                          <div className="flex items-center text-sm text-[#c3d9ee]/70 mt-2">
                            <div className="flex -space-x-2 mr-3">
                              <div className="w-6 h-6 rounded-full bg-[#091525] border border-[#00b4d8]/60 flex items-center justify-center text-xs">RSSI</div>
                              <div className="w-6 h-6 rounded-full bg-[#091525] border border-[#00b4d8]/60 flex items-center justify-center text-xs">SOC</div>
                              <div className="w-6 h-6 rounded-full bg-[#091525] border border-[#00b4d8]/60 flex items-center justify-center text-xs">CERT</div>
                            </div>
                            <span>Multiples personnages disponibles</span>
                          </div>
                        </div>
                        <div className="bg-[#091525] px-6 py-3 flex justify-between items-center border-t border-[#00b4d8]/30">
                          <span className="text-[#c3d9ee]/80 text-sm">Difficulté ajustable</span>
                          <span className="text-[#00b4d8] font-semibold flex items-center">COMMENCER <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" /></span>
                        </div>
                      </div>
                      
                      {/* Mode 2: Mode QCM et Exercices */}
                      <div 
                        className="bg-gradient-to-br from-[#121e2e] to-[#0d1520] rounded-lg border border-[#00b4d8]/30 hover:border-[#00b4d8]/70 hover:shadow-[0_0_20px_rgba(0,180,216,0.3)] transition-all cursor-pointer overflow-hidden group"
                        onClick={() => {
                          setInputMessage("Créé un QCM interactif de 5 questions sur la sécurité des réseaux avec différents niveaux de difficulté et explications détaillées.");
                          startSession();
                        }}
                      >
                        <div className="p-6">
                          <div className="flex items-center mb-3">
                            <div className="w-12 h-12 bg-[#091525] rounded-full flex items-center justify-center border border-[#00b4d8]/40 mr-4 group-hover:bg-[#00b4d8]/20 transition-all shadow-md">
                              <svg className="h-6 w-6 text-[#00b4d8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                              </svg>
                            </div>
                            <h3 className="font-mono font-semibold text-xl text-[#00b4d8]">QCM & EXERCICES</h3>
                          </div>
                          <p className="text-[#c3d9ee] mb-4">Testez vos connaissances avec des QCM interactifs et des exercices pratiques adaptés à votre niveau. Recevez des explications détaillées et suivez votre progression.</p>
                          <div className="grid grid-cols-3 gap-2 mt-2">
                            <div className="bg-[#091525] rounded border border-[#00b4d8]/30 py-1 px-2 text-xs text-center text-[#c3d9ee]/80">
                              <span className="text-[#4cc9f0] block font-semibold">QCM</span>
                              Évaluation rapide
                            </div>
                            <div className="bg-[#091525] rounded border border-[#00b4d8]/30 py-1 px-2 text-xs text-center text-[#c3d9ee]/80">
                              <span className="text-[#4cc9f0] block font-semibold">Défis</span>
                              Cas pratiques
                            </div>
                            <div className="bg-[#091525] rounded border border-[#00b4d8]/30 py-1 px-2 text-xs text-center text-[#c3d9ee]/80">
                              <span className="text-[#4cc9f0] block font-semibold">Labs</span>
                              Exercices guidés
                            </div>
                          </div>
                        </div>
                        <div className="bg-[#091525] px-6 py-3 flex justify-between items-center border-t border-[#00b4d8]/30">
                          <span className="text-[#c3d9ee]/80 text-sm">Tous niveaux</span>
                          <span className="text-[#00b4d8] font-semibold flex items-center">COMMENCER <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" /></span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {/* Mode 3: Mode Classique */}
                      <div 
                        className="bg-gradient-to-br from-[#121e2e] to-[#0d1520] rounded-lg border border-[#00b4d8]/30 hover:border-[#00b4d8]/70 hover:shadow-[0_0_20px_rgba(0,180,216,0.3)] transition-all cursor-pointer overflow-hidden group"
                        onClick={() => {
                          setInputMessage("Je voudrais apprendre à détecter et me protéger contre le phishing");
                          startSession();
                        }}
                      >
                        <div className="p-6">
                          <div className="flex items-center mb-3">
                            <div className="w-12 h-12 bg-[#091525] rounded-full flex items-center justify-center border border-[#00b4d8]/40 mr-4 group-hover:bg-[#00b4d8]/20 transition-all shadow-md">
                              <svg className="h-6 w-6 text-[#00b4d8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              </svg>
                            </div>
                            <h3 className="font-mono font-semibold text-xl text-[#00b4d8]">CONVERSATION LIBRE</h3>
                          </div>
                          <p className="text-[#c3d9ee] mb-4">Échangez librement avec notre expert IA sur n'importe quel sujet de cybersécurité. Posez vos questions et recevez des réponses personnalisées et adaptatives.</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <div className="bg-[#091525] rounded-full border border-[#00b4d8]/30 py-1 px-3 text-xs text-[#c3d9ee]/80">
                              Phishing
                            </div>
                            <div className="bg-[#091525] rounded-full border border-[#00b4d8]/30 py-1 px-3 text-xs text-[#c3d9ee]/80">
                              Ransomware
                            </div>
                            <div className="bg-[#091525] rounded-full border border-[#00b4d8]/30 py-1 px-3 text-xs text-[#c3d9ee]/80">
                              Sécurité Wi-Fi
                            </div>
                            <div className="bg-[#091525] rounded-full border border-[#00b4d8]/30 py-1 px-3 text-xs text-[#c3d9ee]/80">
                              RGPD
                            </div>
                          </div>
                        </div>
                        <div className="bg-[#091525] px-6 py-3 flex justify-between items-center border-t border-[#00b4d8]/30">
                          <span className="text-[#c3d9ee]/80 text-sm">Accès à tous les sujets</span>
                          <span className="text-[#00b4d8] font-semibold flex items-center">COMMENCER <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" /></span>
                        </div>
                      </div>
                      
                      {/* Mode 4: Mode Scénario Avancé */}
                      <div 
                        className="bg-gradient-to-br from-[#121e2e] to-[#0d1520] rounded-lg border border-[#00b4d8]/30 hover:border-[#00b4d8]/70 hover:shadow-[0_0_20px_rgba(0,180,216,0.3)] transition-all cursor-pointer overflow-hidden group"
                        onClick={() => {
                          setInputMessage("Lance un scénario de gestion de crise cybersécurité où je dois analyser une violation de données et proposer un plan d'action");
                          startSession();
                        }}
                      >
                        <div className="p-6">
                          <div className="flex items-center mb-3">
                            <div className="w-12 h-12 bg-[#091525] rounded-full flex items-center justify-center border border-[#00b4d8]/40 mr-4 group-hover:bg-[#00b4d8]/20 transition-all shadow-md">
                              <svg className="h-6 w-6 text-[#00b4d8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                            </div>
                            <h3 className="font-mono font-semibold text-xl text-[#00b4d8]">SCÉNARIOS AVANCÉS</h3>
                          </div>
                          <p className="text-[#c3d9ee] mb-4">Relevez des défis complexes avec des scénarios avancés de cyberattaques. Analysez la situation, prenez des décisions stratégiques et gérez les conséquences.</p>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <div className="bg-[#091525] rounded border border-[#00b4d8]/30 py-1 px-2 text-xs text-center text-[#c3d9ee]/80">
                              <span className="text-[#4cc9f0] block font-semibold">Gestion de crise</span>
                              Réponse à incident
                            </div>
                            <div className="bg-[#091525] rounded border border-[#00b4d8]/30 py-1 px-2 text-xs text-center text-[#c3d9ee]/80">
                              <span className="text-[#4cc9f0] block font-semibold">Cyberattaques</span>
                              Tactiques défensives
                            </div>
                          </div>
                        </div>
                        <div className="bg-[#091525] px-6 py-3 flex justify-between items-center border-t border-[#00b4d8]/30">
                          <span className="text-[#c3d9ee]/80 text-sm">Pour experts</span>
                          <span className="text-[#00b4d8] font-semibold flex items-center">COMMENCER <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" /></span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-[#091525] rounded-lg p-6 border border-[#00b4d8]/30 font-mono">
                      <div className="flex items-center mb-3">
                        <svg className="h-5 w-5 text-[#e63946] mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-[#e63946] font-semibold">SYSTÈME CYBER ULTRA-IMMERSIF</p>
                      </div>
                      <p className="text-[#c3d9ee]/80 text-sm mb-3">
                        Cette plateforme d'apprentissage adaptive utilise des technologies avancées pour créer une expérience réaliste et immersive. 
                        Tous les contenus sont générés en temps réel selon vos interactions et votre progression.
                      </p>
                      <div className="flex items-center justify-between text-xs text-[#c3d9ee]/60">
                        <span>Niveau de sécurité: Confidentiel</span>
                        <span>CyberSystem v3.7.2</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col w-full max-w-6xl mx-auto">
                {/* Mode décision ou chat standard */}
                {decision.isInDecisionMode && decision.currentScenario ? (
                  <CyberDecisionFlow 
                    scenario={decision.currentScenario}
                    onDecisionMade={handleDecisionMade}
                    isLoading={decision.isLoading}
                    currentNumber={decision.currentScenarioNumber}
                    totalScenarios={decision.totalScenarios}
                    summary={decision.summary}
                  />
                ) : (
                  <div className="flex flex-col w-full">
                    {/* Barre de statut et de progression */}
                    <div className="bg-[#091525] border border-[#00b4d8]/30 border-b-0 rounded-t-md p-3 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <span className="h-2.5 w-2.5 rounded-full bg-[#4cc9f0] animate-pulse mr-2"></span>
                          <span className="text-[#c3d9ee] text-xs font-mono">STATUT: CONNECTÉ</span>
                        </div>
                        <div className="text-[#c3d9ee]/70 text-xs font-mono">
                          Niveau d'apprentissage: <span className="text-[#00b4d8]">Adaptatif</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-[#c3d9ee]/70 text-xs font-mono hidden sm:block">
                          <span className="text-[#00b4d8]">Aide:</span> Tapez "aide" pour voir les commandes disponibles
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setInputMessage("Pouvons-nous passer au mode exercice pratique ?")}
                          className="border-[#00b4d8]/50 bg-[#091525] text-[#00b4d8] hover:bg-[#112641] text-xs py-1"
                        >
                          Mode pratique
                        </Button>
                      </div>
                    </div>
                
                    {/* Zone de chat avec messages et guides contextuels - optimisée pour plein écran */}
                    <div 
                      ref={chatContainerRef}
                      className="flex-1 overflow-y-auto custom-scrollbar cyber-expert bg-[#091525]/80 border border-[#00b4d8]/30 rounded-none shadow-[0_0_20px_rgba(0,180,216,0.15)] h-[calc(100vh-230px)] min-h-[500px]"
                    >
                      <div className="p-6 space-y-6">
                        {/* Barre de progression de l'apprentissage - toujours visible */}
                        <div className="bg-[#121e2e] p-3 rounded-md border border-[#00b4d8]/30 mb-6">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-[#00b4d8] text-sm font-semibold flex items-center">
                              <span className="inline-block w-3 h-3 bg-[#00b4d8] rounded-full mr-2"></span>
                              PROGRESSION DE L'APPRENTISSAGE
                            </div>
                            <div className="text-[#c3d9ee]/70 text-xs">
                              Session interactive en cours
                            </div>
                          </div>
                          <div className="w-full bg-[#091525] rounded-full h-2 mb-1">
                            <div className="bg-gradient-to-r from-[#00b4d8] to-[#4cc9f0] h-2 rounded-full animate-pulse" style={{ width: '35%' }}></div>
                          </div>
                          <div className="flex justify-between text-xs text-[#c3d9ee]/70">
                            <span>Débutant</span>
                            <span>Intermédiaire</span>
                            <span>Avancé</span>
                          </div>
                        </div>
                        
                        {messages.map((message, index) => (
                          <div key={message.id}>
                            <div
                              className={`flex ${
                                message.type === "user" ? "justify-end" : "justify-start"
                              }`}
                            >
                              <div
                                className={`max-w-[85%] p-4 rounded-md ${
                                  message.type === "user"
                                    ? "bg-[#00b4d8]/30 text-white ml-auto shadow-[0_2px_10px_rgba(0,180,216,0.15)]"
                                    : "bg-[#121e2e] border border-[#00b4d8]/20 text-white shadow-[0_2px_10px_rgba(0,0,0,0.1)]"
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
                            </div>
                            
                            {/* Afficher des infobulles contextuelles après certains messages du bot */}
                            {message.type === "bot" && index > 0 && index % 3 === 0 && (
                              <div className="flex justify-center my-4">
                                <div className="bg-[#091525] border border-[#00b4d8]/40 rounded-md p-3 max-w-[80%] shadow-[0_0_15px_rgba(0,180,216,0.2)]">
                                  <div className="flex items-start">
                                    <div className="bg-[#00b4d8]/20 p-2 rounded-full mr-3">
                                      <LightbulbIcon className="h-4 w-4 text-[#00b4d8]" />
                                    </div>
                                    <div>
                                      <p className="text-[#00b4d8] text-sm font-semibold">LE SAVIEZ-VOUS ?</p>
                                      <p className="text-[#c3d9ee] text-sm mt-1">
                                        {getMessage(index)}
                                      </p>
                                      <div className="flex gap-2 mt-2">
                                        <Button 
                                          variant="outline" 
                                          size="sm"
                                          className="border-[#00b4d8]/30 text-[#00b4d8] hover:bg-[#112641] text-xs py-1"
                                          onClick={() => setInputMessage(`Dis m'en plus sur ${getTopicFromIndex(index)}`)}
                                        >
                                          En savoir plus
                                        </Button>
                                        <Button 
                                          variant="outline" 
                                          size="sm"
                                          className="border-[#00b4d8]/30 text-[#00b4d8] hover:bg-[#112641] text-xs py-1"
                                          onClick={() => setInputMessage(`Donne-moi un exemple concret sur ${getTopicFromIndex(index)}`)}
                                        >
                                          Exemple concret
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {/* Afficher des suggestions d'approfondissement après certains messages de l'utilisateur */}
                            {message.type === "user" && index > 1 && index % 4 === 0 && (
                              <div className="flex justify-center my-4">
                                <div className="bg-[#091525] border border-[#00b4d8]/40 rounded-md p-3 max-w-[80%] text-center">
                                  <p className="text-[#00b4d8] text-sm font-semibold">POUR APPROFONDIR :</p>
                                  <div className="flex flex-wrap justify-center gap-2 mt-2">
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      className="border-[#00b4d8]/30 bg-[#091525]/80 text-[#c3d9ee] hover:bg-[#112641] text-xs py-1"
                                      onClick={() => setInputMessage("Comment appliquer ça dans mon entreprise ?")}
                                    >
                                      Application professionnelle
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      className="border-[#00b4d8]/30 bg-[#091525]/80 text-[#c3d9ee] hover:bg-[#112641] text-xs py-1"
                                      onClick={() => setInputMessage("Propose-moi un exercice pratique sur ce sujet")}
                                    >
                                      Exercice pratique
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      className="border-[#00b4d8]/30 bg-[#091525]/80 text-[#c3d9ee] hover:bg-[#112641] text-xs py-1"
                                      onClick={() => setInputMessage("Quelles sont les dernières tendances sur ce sujet ?")}
                                    >
                                      Tendances actuelles
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                        
                        {isLoading && (
                          <div className="flex justify-start">
                            <div className="max-w-[85%] p-4 rounded-md bg-[#121e2e] border border-[#00b4d8]/20 text-white shadow-[0_2px_10px_rgba(0,0,0,0.1)]">
                              <div className="flex items-center gap-3">
                                <div className="flex space-x-2">
                                  <div className="w-2.5 h-2.5 rounded-full bg-[#00b4d8]/50 animate-pulse"></div>
                                  <div className="w-2.5 h-2.5 rounded-full bg-[#00b4d8]/50 animate-pulse delay-150"></div>
                                  <div className="w-2.5 h-2.5 rounded-full bg-[#00b4d8]/50 animate-pulse delay-300"></div>
                                </div>
                                <span className="text-xs text-[#00b4d8]/70">Génération d'une réponse personnalisée...</span>
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
                        className="absolute bottom-32 right-8 rounded-full bg-[#091525] border-[#00b4d8]/30 text-[#00b4d8] hover:bg-[#112641] hover:border-[#00b4d8]/50 shadow-[0_0_10px_rgba(0,180,216,0.2)]"
                        onClick={scrollToBottom}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    )}
              
                    {/* Zone de saisie de message - masquée en mode décision */}
                    {!decision.isInDecisionMode && (
                      <div className="bg-[#121e2e] p-6 rounded-b-md border-x border-b border-[#00b4d8]/30 shadow-[0_0_20px_rgba(0,180,216,0.15)]">
                        {/* Suggestions de questions pour guider l'utilisateur */}
                        <div className="mb-4 px-1">
                          <p className="text-[#00b4d8] text-sm font-mono mb-2 flex items-center">
                            <span className="inline-block w-4 h-4 bg-[#00b4d8] rounded-full animate-pulse mr-2"></span>
                            SUGGESTIONS DE QUESTIONS:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setInputMessage("Comment me protéger contre le phishing ?")}
                              className="border-[#00b4d8]/30 bg-[#091525]/80 text-[#c3d9ee] hover:bg-[#112641] hover:text-[#00b4d8] text-xs py-1"
                            >
                              Comment me protéger contre le phishing ?
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setInputMessage("Explique-moi les ransomwares")}
                              className="border-[#00b4d8]/30 bg-[#091525]/80 text-[#c3d9ee] hover:bg-[#112641] hover:text-[#00b4d8] text-xs py-1"
                            >
                              Explique-moi les ransomwares
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setInputMessage("Comment sécuriser mon Wi-Fi ?")}
                              className="border-[#00b4d8]/30 bg-[#091525]/80 text-[#c3d9ee] hover:bg-[#112641] hover:text-[#00b4d8] text-xs py-1"
                            >
                              Comment sécuriser mon Wi-Fi ?
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setInputMessage("Crée un exercice pratique sur le phishing")}
                              className="border-[#00b4d8]/30 bg-[#091525]/80 text-[#c3d9ee] hover:bg-[#112641] hover:text-[#00b4d8] text-xs py-1"
                            >
                              Crée un exercice pratique
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setInputMessage("Propose-moi un scénario de décision")}
                              className="border-[#00b4d8]/30 bg-[#091525]/80 text-[#c3d9ee] hover:bg-[#112641] hover:text-[#00b4d8] text-xs py-1"
                            >
                              Propose-moi un scénario de décision
                            </Button>
                          </div>
                        </div>

                        <form onSubmit={handleSubmit} className="flex space-x-3">
                          <div className="flex-1 relative">
                            <textarea
                              ref={textareaRef}
                              value={inputMessage}
                              onChange={(e) => setInputMessage(e.target.value)}
                              onKeyDown={handleKeyDown}
                              placeholder="Posez votre question sur la cybersécurité..."
                              className="w-full p-4 bg-[#091525] text-[#c3d9ee] border border-[#00b4d8]/30 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00b4d8]/50 resize-none min-h-[70px] max-h-[150px] overflow-y-auto text-base shadow-inner"
                              disabled={isLoading}
                              rows={2}
                            />
                            <div className="absolute right-3 bottom-3 text-xs text-[#00b4d8]/70">
                              {inputMessage.length > 0 ? `${inputMessage.length} car.` : 'Entrée: envoyer · Maj+Entrée: nouvelle ligne'}
                            </div>
                          </div>
                          <Button 
                            type="submit" 
                            disabled={isLoading || !inputMessage.trim()} 
                            className="bg-[#00b4d8] hover:bg-[#00b4d8]/80 text-[#091525] self-end h-[70px] w-[70px] shadow-md"
                          >
                            {isLoading ? (
                              <RefreshCw className="h-6 w-6 animate-spin" />
                            ) : (
                              <Send className="h-6 w-6" />
                            )}
                          </Button>
                        </form>

                        {/* Guide d'utilisation */}
                        {/* Panel d'aide interactive avancé */}
                        <div className="mt-4 bg-[#121e2e] border border-[#00b4d8]/20 rounded-md p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-[#00b4d8] text-sm font-semibold flex items-center">
                              <LightbulbIcon className="h-4 w-4 mr-2" />
                              CONSEILS POUR UNE MEILLEURE EXPÉRIENCE
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 text-xs text-[#00b4d8]/70 hover:text-[#00b4d8] hover:bg-[#091525]"
                              onClick={() => setInputMessage("aide")}
                            >
                              Voir toutes les commandes
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                            <div className="bg-[#091525] p-3 rounded-md border border-[#00b4d8]/20">
                              <h4 className="text-[#00b4d8] text-xs font-medium mb-1.5">FORMATS D'APPRENTISSAGE</h4>
                              <div className="space-y-1.5">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="w-full justify-start p-1.5 h-auto text-xs text-[#c3d9ee] hover:text-[#00b4d8] hover:bg-[#112641]"
                                  onClick={() => setInputMessage("Je veux un format académique sur ce sujet")}
                                >
                                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                  Format académique
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="w-full justify-start p-1.5 h-auto text-xs text-[#c3d9ee] hover:text-[#00b4d8] hover:bg-[#112641]"
                                  onClick={() => setInputMessage("Explique-moi ça avec des exemples concrets")}
                                >
                                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                  Exemples concrets
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="w-full justify-start p-1.5 h-auto text-xs text-[#c3d9ee] hover:text-[#00b4d8] hover:bg-[#112641]"
                                  onClick={() => setInputMessage("Propose-moi un défi sur ce sujet")}
                                >
                                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                                  Mode défi
                                </Button>
                              </div>
                            </div>
                            
                            <div className="bg-[#091525] p-3 rounded-md border border-[#00b4d8]/20">
                              <h4 className="text-[#00b4d8] text-xs font-medium mb-1.5">MODES INTERACTIFS</h4>
                              <div className="space-y-1.5">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="w-full justify-start p-1.5 h-auto text-xs text-[#c3d9ee] hover:text-[#00b4d8] hover:bg-[#112641]"
                                  onClick={() => setInputMessage("Crée un exercice pratique sur ce sujet")}
                                >
                                  <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                                  Exercice pratique
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="w-full justify-start p-1.5 h-auto text-xs text-[#c3d9ee] hover:text-[#00b4d8] hover:bg-[#112641]"
                                  onClick={() => setInputMessage("Propose-moi un scénario de décision")}
                                >
                                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                                  Scénario de décision
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="w-full justify-start p-1.5 h-auto text-xs text-[#c3d9ee] hover:text-[#00b4d8] hover:bg-[#112641]"
                                  onClick={() => setInputMessage("Évalue mes connaissances sur ce sujet")}
                                >
                                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                                  Auto-évaluation
                                </Button>
                              </div>
                            </div>
                            
                            <div className="bg-[#091525] p-3 rounded-md border border-[#00b4d8]/20">
                              <h4 className="text-[#00b4d8] text-xs font-medium mb-1.5">ASTUCES PRATIQUES</h4>
                              <div className="space-y-1.5">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="w-full justify-start p-1.5 h-auto text-xs text-[#c3d9ee] hover:text-[#00b4d8] hover:bg-[#112641]"
                                  onClick={() => setInputMessage("Comment puis-je appliquer ces concepts au quotidien ?")}
                                >
                                  <span className="w-2 h-2 bg-cyan-500 rounded-full mr-2"></span>
                                  Application quotidienne
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="w-full justify-start p-1.5 h-auto text-xs text-[#c3d9ee] hover:text-[#00b4d8] hover:bg-[#112641]"
                                  onClick={() => setInputMessage("Donne-moi une checklist de sécurité sur ce sujet")}
                                >
                                  <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                                  Checklist de sécurité
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="w-full justify-start p-1.5 h-auto text-xs text-[#c3d9ee] hover:text-[#00b4d8] hover:bg-[#112641]"
                                  onClick={() => setInputMessage("résumé")}
                                >
                                  <span className="w-2 h-2 bg-pink-500 rounded-full mr-2"></span>
                                  Résumé des points clés
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Bouton de fin de session */}
                        <div className="mt-4 flex justify-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={endSession}
                            disabled={isLoading}
                            className="bg-[#091525] border-[#e63946]/30 text-[#e63946] hover:bg-[#112641] hover:border-[#e63946]/50 text-sm py-2 px-4"
                          >
                            Terminer la session
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {/* Résumé de session (modal) */}
            {sessionSummary && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/75">
                <Card className="w-full max-w-4xl bg-[#091525] border border-[#00b4d8]/40 text-white shadow-[0_0_30px_rgba(0,180,216,0.25)]">
                  <CardHeader className="flex flex-row items-center justify-between border-b border-[#00b4d8]/20 pb-4">
                    <CardTitle className="text-[#00b4d8] text-xl font-mono flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Résumé de votre session
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={closeSessionSummary}
                      className="text-[#00b4d8] hover:text-[#00b4d8]/80 hover:bg-[#121e2e]"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </CardHeader>
                  <CardContent className="py-6 max-h-[60vh] overflow-y-auto custom-scrollbar cyber-expert">
                    <div 
                      className="prose prose-invert max-w-none text-[#c3d9ee] text-base" 
                      dangerouslySetInnerHTML={{ 
                        __html: DOMPurify.sanitize(formatTextWithStructure(sessionSummary)) 
                      }}
                    />
                  </CardContent>
                  <CardFooter className="flex justify-center gap-6 border-t border-[#00b4d8]/20 pt-5">
                    <Button
                      onClick={startSession}
                      className="bg-[#00b4d8] hover:bg-[#00b4d8]/80 text-[#091525] px-6 py-2 h-auto text-base"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Nouvelle session
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleReturnToPrevious}
                      className="border-[#00b4d8]/30 text-[#00b4d8] hover:bg-[#112641] hover:border-[#00b4d8]/50 px-6 py-2 h-auto text-base"
                    >
                      <Home className="mr-2 h-4 w-4" />
                      Retour à l'accueil
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}

// Wrapper avec le contexte de décision
export default function ExpertLearningPage() {
  return (
    <DecisionProvider>
      <ExpertLearningPageContent />
    </DecisionProvider>
  );
}