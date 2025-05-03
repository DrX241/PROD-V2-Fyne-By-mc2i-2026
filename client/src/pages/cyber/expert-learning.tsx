import React, { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, ChevronDown, RefreshCw, Bot, X, ArrowLeft } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import HomeLayout from "@/components/layout/HomeLayout";
import PageTitle from "@/components/utils/PageTitle";
import { apiRequest } from "@/lib/queryClient";
import DOMPurify from 'dompurify';
import { useLocation } from 'wouter';

// Fonction pour formater le texte avec une structure visuelle attractive (sans markdown)
const formatTextWithStructure = (text: string): string => {
  if (!text) return '';
  
  // Nettoyer le markdown avant formatage
  let cleanText = text
    .replace(/#+\s/g, '') // Supprimer les marqueurs de titre (#, ##, ###)
    .replace(/\*\*/g, '') // Supprimer les astérisques doubles (gras)
    .replace(/\*/g, '')   // Supprimer les astérisques simples (italique)
    .replace(/`/g, '')    // Supprimer les caractères de code
    .replace(/>/g, '')    // Supprimer les marqueurs de citation
    .replace(/^---+$/gm, '') // Supprimer les séparateurs horizontaux
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'); // Convertir les liens [texte](url) en texte
  
  // Convertir les sauts de ligne en balises <br> ou nouvelle div selon le contexte
  let formattedText = cleanText.replace(/\n\n+/g, '</div><div class="mb-3">'); // Double saut = nouveau paragraphe
  formattedText = formattedText.replace(/\n/g, '<br>'); // Simple saut = retour à la ligne
  formattedText = '<div class="mb-3">' + formattedText + '</div>'; // Envelopper dans un div
  
  // Formater les listes numérotées (1., 2., etc.) avec design moderne
  formattedText = formattedText.replace(
    /^(\d+\.\s+)(.+)$/gm, 
    '<div class="flex items-start mb-3 sm:mb-3.5 group">' +
    '<div class="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#112641] border border-[#00b4d8]/40 flex items-center justify-center mr-3 flex-shrink-0 text-[#00b4d8] font-bold group-hover:bg-[#153254] transition-colors">$1</div>' +
    '<div class="flex-1 pt-1 min-w-0 text-[#e5f0fc]">$2</div>' +
    '</div>'
  );
  
  // Formater les listes à puces (-, *, •) avec design moderne
  formattedText = formattedText.replace(
    /^([-*•]\s+)(.+)$/gm, 
    '<div class="flex items-start mb-2.5 sm:mb-3 group">' +
    '<div class="w-2 h-2 rounded-full bg-[#00b4d8] mt-2 mr-3 flex-shrink-0 group-hover:bg-[#00a0c2] transition-colors"></div>' +
    '<div class="flex-1 min-w-0 text-[#e5f0fc]">$2</div>' +
    '</div>'
  );
  
  // Améliorer la mise en forme des TITRES EN CAPITALES (garantir qu'ils restent sur une ligne)
  formattedText = formattedText.replace(
    /([A-Z]{3,}[\s-][A-Z\s-]+)(\s*:?\s*)/g, 
    '<div class="font-bold text-[#00b4d8] mt-5 mb-4 pb-2 border-b border-[#00b4d8]/30 whitespace-normal text-lg overflow-visible">$1$2</div>'
  );
  
  // Traitement spécifique pour les titres thématiques avec design spécial
  formattedText = formattedText.replace(
    /SÉCURITÉ DES RÉSEAUX SOCIAUX/g,
    '<div class="font-bold text-center my-4 py-2 px-4 bg-gradient-to-r from-[#0c1e2e] to-[#112641] border border-[#00b4d8]/40 rounded-md shadow-[0_0_15px_rgba(0,180,216,0.1)]">' +
    '<span class="text-[#e5f0fc]">SÉCURITÉ DES </span><span class="text-[#00b4d8]">RÉSEAUX SOCIAUX</span>' +
    '</div>'
  );
  
  // Correction des titres découpés par des sauts de ligne
  formattedText = formattedText.replace(
    /SÉCURITÉ[\s\n]+DES[\s\n]+RÉSEAUX[\s\n]+SOCIAUX/g,
    '<div class="font-bold text-center my-4 py-2 px-4 bg-gradient-to-r from-[#0c1e2e] to-[#112641] border border-[#00b4d8]/40 rounded-md shadow-[0_0_15px_rgba(0,180,216,0.1)]">' +
    '<span class="text-[#e5f0fc]">SÉCURITÉ DES </span><span class="text-[#00b4d8]">RÉSEAUX SOCIAUX</span>' +
    '</div>'
  );
  
  // Mise en évidence des questions
  formattedText = formattedText.replace(
    /([^>]+\?\s*)/g,
    '<div class="font-semibold text-[#00b4d8] my-2.5">$1</div>'
  );
  
  // Mise en forme des éléments de type "Titre: contenu"
  formattedText = formattedText.replace(
    /^([^<][^:]+):\s/gm, 
    '<span class="font-semibold text-[#8abee0]">$1: </span>'
  );
  
  // Ajouter des marges entre paragraphes pour améliorer la lisibilité
  formattedText = formattedText.replace(/<\/div><div/g, '</div><div class="py-1"');
  
  // Ajouter des styles pour rendre le tout plus attractif
  formattedText = '<div class="text-pretty leading-relaxed space-y-2">' + formattedText + '</div>';

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
}

export default function ExpertLearningPage() {
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
        
        <div className="relative z-10 max-w-6xl w-full mx-auto px-2 sm:px-4 py-4 sm:py-8 md:px-6 md:py-12">
          {/* Bouton de retour - style console cybersécurité - Optimisé pour mobile */}
          <div className="absolute top-0 left-2 sm:left-4 mt-2 sm:mt-4">
            <Button 
              variant="outline" 
              onClick={handleReturnToPrevious}
              className="bg-[#091525] border-[#00b4d8]/30 text-[#00b4d8] hover:bg-[#112641] hover:border-[#00b4d8]/50 flex items-center gap-1 sm:gap-2 p-1 sm:p-2 h-auto font-mono text-[9px] sm:text-xs shadow-[0_0_10px_rgba(0,180,216,0.1)]"
            >
              <span className="text-[#e63946]">←</span>
              <span className="hidden sm:inline">RETOUR CONSOLE PRINCIPALE</span>
              <span className="inline sm:hidden">RETOUR</span>
            </Button>
          </div>
          
          <div className="flex flex-col items-center mb-6 sm:mb-10 mt-8 sm:mt-10">
            <div className="flex flex-col sm:flex-row items-center bg-[#091525]/80 px-3 sm:px-4 py-2 sm:py-3 rounded-md border border-[#00b4d8]/30 shadow-[0_0_15px_rgba(0,180,216,0.15)] mb-2 sm:mb-3">
              <div className="mb-2 sm:mb-0 sm:mr-4 p-1.5 sm:p-2 rounded-full bg-[#00b4d8]/10 border border-[#00b4d8]/20">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="sm:w-[30px] sm:h-[30px]">
                  <path d="M12,3 L21,7 L21,13 C21,17.5 17,21.5 12,23 C7,21.5 3,17.5 3,13 L3,7 L12,3 Z" stroke="#00b4d8" strokeWidth="1.5" fill="none"/>
                  <circle cx="12" cy="9" r="3" stroke="#00b4d8" strokeWidth="1.5" fill="none"/>
                  <path d="M8,17 C8,14.7909 9.79086,13 12,13 C14.2091,13 16,14.7909 16,17" stroke="#00b4d8" strokeWidth="1.5" fill="none"/>
                </svg>
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-mono font-bold text-[#e5f0fc]">
                  CYBER<span className="text-[#00b4d8]">TRAINING</span><span className="text-[#e63946]">_</span>
                </h1>
                <h2 className="text-[#8abee0] text-[10px] sm:text-xs md:text-sm font-mono">MODE: ÉCHANGE INTERACTIF | NIVEAU: ADAPTATIF</h2>
              </div>
            </div>
            <div className="bg-[#091525]/60 px-3 sm:px-5 py-2 sm:py-3 rounded-md border border-[#00b4d8]/20 max-w-2xl">
              <p className="text-[#c3d9ee] text-center text-xs sm:text-sm">
                Dialoguez avec un expert en cybersécurité pour approfondir vos connaissances, résoudre des problèmes techniques ou explorer des concepts avancés dans un environnement interactif et personnalisé.
              </p>
            </div>
          </div>
          
          {/* Affichage du résumé de session */}
          {sessionSummary && !isSessionActive && (
            <div className="max-w-4xl mx-auto bg-[#091525] rounded-lg p-3 sm:p-6 border border-[#00b4d8]/30 shadow-[0_0_20px_rgba(0,180,216,0.2)]">
              <div className="flex justify-between items-center mb-3 sm:mb-4 border-b border-[#00b4d8]/20 pb-2 sm:pb-3">
                <div className="flex items-center">
                  <div className="h-4 sm:h-6 w-1 sm:w-2 bg-[#e63946] mr-2 sm:mr-3"></div>
                  <h2 className="text-base sm:text-xl font-mono font-bold text-[#00b4d8]">RAPPORT D'ANALYSE</h2>
                </div>
                <Button 
                  variant="outline" 
                  onClick={closeSessionSummary}
                  className="p-1.5 sm:p-2 rounded-md h-auto bg-transparent border-[#00b4d8]/30 hover:bg-[#112641] text-[#00b4d8]"
                >
                  <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
              </div>
              
              <div className="mb-2 flex flex-col sm:flex-row sm:justify-between text-[10px] sm:text-xs text-[#8abee0] font-mono">
                <div>DATE: {new Date().toLocaleDateString()}</div>
                <div className="mt-1 sm:mt-0">HEURE: {new Date().toLocaleTimeString()}</div>
              </div>
              
              <div className="bg-[#0c1e2e] p-2.5 sm:p-4 rounded border border-[#00b4d8]/20 mb-4 sm:mb-6">
                <div 
                  dangerouslySetInnerHTML={{ 
                    __html: DOMPurify.sanitize(formatTextWithStructure(sessionSummary))
                  }} 
                />
              </div>
              
              <div className="flex justify-center">
                <Button 
                  onClick={startSession} 
                  className="bg-[#00b4d8] hover:bg-[#00a0c2] text-white px-4 sm:px-6 py-2 sm:py-3 font-mono text-xs sm:text-sm h-auto"
                >
                  NOUVELLE SESSION <span className="text-[#091525] ml-1">_</span>
                </Button>
              </div>
            </div>
          )}
          
          {!isSessionActive && !sessionSummary ? (
            <div className="w-full mx-auto px-4">
              {/* En-tête du module de formation - Optimisé pour mobile */}
              <div className="text-center mb-4 sm:mb-6">
                <div className="inline-flex flex-col sm:flex-row items-center justify-center mb-2 bg-[#091525]/70 px-3 sm:px-4 py-1.5 sm:py-2 rounded-md border border-[#00b4d8]/30">
                  <span className="font-mono text-[#00b4d8] text-xs sm:text-sm sm:mr-2">[CYBER-TRAINING]</span>
                  <span className="text-[#e5f0fc] font-mono text-[10px] sm:text-xs mt-0.5 sm:mt-0">SÉLECTIONNEZ UNE MÉTHODE D'APPRENTISSAGE</span>
                </div>
              </div>
              
              {/* Cartes alignées horizontalement - Optimisé pour mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 max-w-5xl mx-auto px-2 sm:px-4">
                {/* Carte 1 - Optimisée pour mobile */}
                <div className="bg-gradient-to-br from-[#0c1e2e] to-[#112641] rounded-lg border border-[#00b4d8]/30 shadow-[0_0_15px_rgba(0,180,216,0.15)] overflow-hidden group hover:shadow-[0_0_20px_rgba(0,180,216,0.3)] transition-all duration-300 transform hover:-translate-y-1">
                  <div className="h-0.5 sm:h-1 bg-[#e63946]"></div>
                  <div className="p-3 sm:p-5">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-[#091525]/80 border border-[#00b4d8]/20 flex items-center justify-center text-white mb-2 sm:mb-3 mx-auto">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="sm:w-[28px] sm:h-[28px]">
                        <path d="M12,1 L21,5 L21,11 C21,16.5 17,21 12,23 C7,21 3,16.5 3,11 L3,5 L12,1 Z" stroke="#00b4d8" strokeWidth="2" fill="none"/>
                        <path d="M9,12 L11,15 L15,9" stroke="#e63946" strokeWidth="2" fill="none"/>
                      </svg>
                    </div>
                    <h3 className="font-mono text-center text-base sm:text-lg font-medium text-[#00b4d8] mb-1.5 sm:mb-2">ANALYSE DES BESOINS</h3>
                    <div className="bg-[#091525]/50 p-2 sm:p-3 rounded border border-[#00b4d8]/10 mb-2 sm:mb-3">
                      <p className="text-[#8abee0] text-xs sm:text-sm text-center">L'expert identifie vos objectifs d'apprentissage et adapte son approche à votre niveau</p>
                    </div>
                    <div className="text-center">
                      <span className="inline-block px-2 sm:px-3 py-0.5 sm:py-1 bg-[#e63946]/20 text-[#e63946] rounded-full text-[10px] sm:text-xs font-mono">NIVEAU 01</span>
                    </div>
                  </div>
                </div>
                
                {/* Carte 2 - Optimisée pour mobile */}
                <div className="bg-gradient-to-br from-[#0c1e2e] to-[#112641] rounded-lg border border-[#00b4d8]/30 shadow-[0_0_15px_rgba(0,180,216,0.15)] overflow-hidden group hover:shadow-[0_0_20px_rgba(0,180,216,0.3)] transition-all duration-300 transform hover:-translate-y-1">
                  <div className="h-0.5 sm:h-1 bg-[#00b4d8]"></div>
                  <div className="p-3 sm:p-5">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-[#091525]/80 border border-[#00b4d8]/20 flex items-center justify-center text-white mb-2 sm:mb-3 mx-auto">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="sm:w-[28px] sm:h-[28px]">
                        <path d="M21,7 L3,7" stroke="#00b4d8" strokeWidth="2"/>
                        <path d="M21,12 L3,12" stroke="#00b4d8" strokeWidth="2"/>
                        <path d="M21,17 L3,17" stroke="#00b4d8" strokeWidth="2"/>
                      </svg>
                    </div>
                    <h3 className="font-mono text-center text-base sm:text-lg font-medium text-[#00b4d8] mb-1.5 sm:mb-2">ÉCHANGE PERSONNALISÉ</h3>
                    <div className="bg-[#091525]/50 p-2 sm:p-3 rounded border border-[#00b4d8]/10 mb-2 sm:mb-3">
                      <p className="text-[#8abee0] text-xs sm:text-sm text-center">Recevez des explications sur mesure avec des exemples concrets et des références fiables</p>
                    </div>
                    <div className="text-center">
                      <span className="inline-block px-2 sm:px-3 py-0.5 sm:py-1 bg-[#00b4d8]/20 text-[#00b4d8] rounded-full text-[10px] sm:text-xs font-mono">NIVEAU 02</span>
                    </div>
                  </div>
                </div>
                
                {/* Carte 3 - Optimisée pour mobile */}
                <div className="bg-gradient-to-br from-[#0c1e2e] to-[#112641] rounded-lg border border-[#00b4d8]/30 shadow-[0_0_15px_rgba(0,180,216,0.15)] overflow-hidden group hover:shadow-[0_0_20px_rgba(0,180,216,0.3)] transition-all duration-300 transform hover:-translate-y-1">
                  <div className="h-0.5 sm:h-1 bg-[#00b4d8]"></div>
                  <div className="p-3 sm:p-5">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-[#091525]/80 border border-[#00b4d8]/20 flex items-center justify-center text-white mb-2 sm:mb-3 mx-auto">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="sm:w-[28px] sm:h-[28px]">
                        <path d="M9,3 L5,7 L9,11" stroke="#00b4d8" strokeWidth="2" fill="none"/>
                        <path d="M5,7 H15 C18,7 21,10 21,13 C21,16 18,19 15,19 H5" stroke="#00b4d8" strokeWidth="2" fill="none"/>
                      </svg>
                    </div>
                    <h3 className="font-mono text-center text-base sm:text-lg font-medium text-[#00b4d8] mb-1.5 sm:mb-2">APPLICATION PRATIQUE</h3>
                    <div className="bg-[#091525]/50 p-2 sm:p-3 rounded border border-[#00b4d8]/10 mb-2 sm:mb-3">
                      <p className="text-[#8abee0] text-xs sm:text-sm text-center">Validez votre compréhension avec des mises en situation et des défis adaptés à votre progression</p>
                    </div>
                    <div className="text-center">
                      <span className="inline-block px-2 sm:px-3 py-0.5 sm:py-1 bg-[#00b4d8]/20 text-[#00b4d8] rounded-full text-[10px] sm:text-xs font-mono">NIVEAU 03</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Bouton de démarrage - Optimisé pour mobile */}
              <div className="max-w-md mx-auto mt-8 text-center">
                <Button 
                  onClick={startSession} 
                  className="bg-[#00b4d8] hover:bg-[#00a0c2] text-white px-4 sm:px-8 py-3 sm:py-4 text-sm sm:text-lg font-mono rounded-md shadow-[0_0_15px_rgba(0,180,216,0.3)] hover:shadow-[0_0_20px_rgba(0,180,216,0.5)] transition-all duration-300 transform hover:-translate-y-1 h-auto"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <RefreshCw className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                      <span className="text-xs sm:text-base">INITIALISATION...</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <span className="mr-1.5 sm:mr-2 font-mono">{'>'}</span>
                      <span className="text-xs sm:text-base">DÉMARRER LA SESSION</span>
                    </span>
                  )}
                </Button>
                <div className="mt-2 sm:mt-3 text-[#8abee0] text-[10px] sm:text-xs">
                  Connexion sécurisée <span className="text-green-400">●</span> Niveau d'accès: <span className="text-[#00b4d8]">AUTORISÉ</span>
                </div>
              </div>
            </div>
          ) : isSessionActive && (
            <div className="bg-[#0c1e2e] border border-[#00b4d8]/30 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(0,180,216,0.15)] max-w-5xl mx-auto">
              {/* En-tête de la conversation - Style console de sécurité - Optimisé pour mobile */}
              <div className="p-2.5 sm:p-4 bg-[#091525] border-b border-[#00b4d8]/20 flex justify-between items-center">
                <div className="flex items-center">
                  <div className="mr-2 sm:mr-3 p-0.5 sm:p-1 rounded-full bg-[#00b4d8]/20 border border-[#00b4d8]/40">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="sm:w-[22px] sm:h-[22px]">
                      <circle cx="12" cy="12" r="11" stroke="#00b4d8" strokeWidth="1.5" fill="none"/>
                      <circle cx="12" cy="8" r="2" fill="#00b4d8"/>
                      <rect x="10" y="11" width="4" height="7" rx="1" fill="#00b4d8"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-base sm:text-xl font-mono font-bold text-[#00b4d8]">SOC ANALYST <span className="text-[#e63946]">:</span><span className="text-[10px] sm:text-xs text-[#8abee0] ml-1 sm:ml-2">[SESSION ACTIVE]</span></h2>
                    <div className="text-[10px] sm:text-xs text-[#8abee0] opacity-60">Terminal ID: CYBER-{Math.floor(Math.random() * 9000) + 1000}-SEC</div>
                  </div>
                </div>
                <div className="flex">
                  <Button 
                    variant="outline" 
                    onClick={endSession} 
                    className="border-[#00b4d8]/30 bg-[#0c1e2e] hover:bg-[#112641] text-[#00b4d8] hover:text-[#e63946] p-1.5 sm:p-2 h-auto"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                    ) : (
                      <span className="flex items-center">
                        <X className="h-4 w-4 sm:h-5 sm:w-5 mr-0.5 sm:mr-1" />
                        <span className="font-mono text-xs sm:text-sm">TERMINER</span>
                      </span>
                    )}
                  </Button>
                </div>
              </div>
              
              {/* Status Bar - Pour reproduire l'esprit de l'image - Optimisé pour mobile */}
              <div className="bg-[#112641] py-0.5 sm:py-1 px-2 sm:px-4 flex flex-col sm:flex-row sm:justify-between text-[10px] sm:text-xs text-[#8abee0] border-b border-[#00b4d8]/20">
                <div className="flex flex-wrap items-center">
                  <span className="mr-2 sm:mr-3">STATUS: <span className="text-green-400">SÉCURISÉ</span></span>
                  <span>CHIFFR.: <span className="text-green-400">ACTIF</span></span>
                </div>
                <div className="text-[9px] sm:text-xs">
                  ID: {userId?.substring(0, 8) || 'INIT...'}
                </div>
              </div>
              
              {/* Conteneur des messages - Style console - Optimisé pour mobile */}
              <div 
                ref={chatContainerRef}
                className="h-[calc(100vh-280px)] sm:h-[calc(100vh-320px)] overflow-y-auto p-2.5 sm:p-4 space-y-3 sm:space-y-5 bg-[#0c1e2e]"
                style={{backgroundImage: 'radial-gradient(circle at 50% 80%, rgba(0,180,216,0.03) 0%, transparent 60%)'}}
              >
                {messages.map((message, index) => (
                  <div 
                    key={message.id} 
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.type === 'user' ? (
                      <div className="max-w-[90%] sm:max-w-[80%] p-2.5 sm:p-3 rounded-md bg-[#112641] text-[#e5f0fc] border border-[#00b4d8]/30 shadow-[0_0_10px_rgba(0,180,216,0.05)]">
                        <div className="mb-1 text-[10px] sm:text-xs font-mono text-[#8abee0] flex flex-wrap items-center justify-between">
                          <span className="font-bold">VOUS</span>
                          <span className="text-[#8abee0]/50 ml-1.5 sm:ml-2 text-[9px] sm:text-xs">{new Date(message.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <div className="whitespace-pre-wrap text-xs sm:text-sm text-pretty">{message.content}</div>
                      </div>
                    ) : (
                      <div className="max-w-[90%] sm:max-w-[80%] py-3 px-4 sm:p-4 rounded-md bg-gradient-to-b from-[#0c1e2e] to-[#0a1525] text-[#e5f0fc] border border-[#00b4d8]/40 shadow-[0_0_20px_rgba(0,150,216,0.1)]">
                        {/* Entête du message amélioré */}
                        <div className="mb-2 sm:mb-3 flex justify-between items-center border-b border-[#00b4d8]/20 pb-2">
                          <div className="flex items-center">
                            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#00b4d8] mr-2 sm:mr-3 animate-pulse"></div>
                            <span className="font-bold tracking-wide text-xs sm:text-sm text-[#00b4d8]">CYBER<span className="text-[#e5f0fc]">SENSEI</span></span>
                          </div>
                          <span className="text-[#8abee0]/60 text-[9px] sm:text-xs font-mono">{new Date(message.timestamp).toLocaleTimeString()}</span>
                        </div>
                        
                        {/* Contenu du message avec styles améliorés */}
                        {message.content.includes("Que souhaitez-vous explorer") || message.content.includes("résoudre un problème") || message.content.includes("apprendre un concept") || message.content.includes("comprendre un concept") || message.content.includes("découvrir") ? (
                          <div className="max-w-none">
                            {/* Question initiale - stylisée et mise en valeur */}
                            <div className="text-[#e5f0fc] text-sm sm:text-base font-semibold mb-4 leading-relaxed">
                              {message.content.split("?")[0]}?
                            </div>
                            
                            {/* Boutons d'option avec design amélioré */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-4">
                              <button 
                                onClick={() => {
                                  // Envoyer directement la valeur "1" au backend
                                  const userMsg: Message = {
                                    id: uuidv4(),
                                    type: "user",
                                    content: "1",
                                    timestamp: Date.now()
                                  };
                                  setMessages(prev => [...prev, userMsg]);
                                  
                                  // Envoyer au backend sans délai
                                  if (userId) {
                                    setIsLoading(true);
                                    apiRequest<{success: boolean, message: string, sessionStatus: SessionStatus}>('/api/cyber-expert/message', {
                                      method: 'POST',
                                      body: JSON.stringify({
                                        userId,
                                        message: "1"
                                      })
                                    }).then(response => {
                                      if (response.success) {
                                        const botResponse: Message = {
                                          id: uuidv4(),
                                          type: "bot",
                                          content: response.message,
                                          timestamp: Date.now()
                                        };
                                        setMessages(prev => [...prev, botResponse]);
                                        if (response.sessionStatus) {
                                          setSessionStatus(response.sessionStatus);
                                        }
                                      }
                                      setIsLoading(false);
                                    }).catch(error => {
                                      console.error("Erreur lors de l'envoi du message:", error);
                                      setIsLoading(false);
                                    });
                                  }
                                }}
                                className="relative bg-gradient-to-br from-[#0c2540] to-[#0a1420] hover:from-[#0d2d4f] hover:to-[#0c1930] border-2 border-[#00b4d8]/40 p-3 sm:p-4 rounded-md text-center text-sm transition-all transform hover:scale-[1.02] duration-200 flex flex-col items-center justify-center"
                                disabled={isLoading}
                              >
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00b4d8]/0 via-[#00b4d8]/60 to-[#00b4d8]/0"></div>
                                <span className="block mb-2 text-[#e5f0fc] font-bold text-base">1. Résoudre un problème</span>
                                <span className="text-[11px] sm:text-xs text-[#8abee0] leading-relaxed">Un défi technique précis à surmonter</span>
                              </button>
                              
                              <button 
                                onClick={() => {
                                  // Envoyer directement la valeur "2" au backend
                                  const userMsg: Message = {
                                    id: uuidv4(),
                                    type: "user",
                                    content: "2",
                                    timestamp: Date.now()
                                  };
                                  setMessages(prev => [...prev, userMsg]);
                                  
                                  // Envoyer au backend sans délai
                                  if (userId) {
                                    setIsLoading(true);
                                    apiRequest<{success: boolean, message: string, sessionStatus: SessionStatus}>('/api/cyber-expert/message', {
                                      method: 'POST',
                                      body: JSON.stringify({
                                        userId,
                                        message: "2"
                                      })
                                    }).then(response => {
                                      if (response.success) {
                                        const botResponse: Message = {
                                          id: uuidv4(),
                                          type: "bot",
                                          content: response.message,
                                          timestamp: Date.now()
                                        };
                                        setMessages(prev => [...prev, botResponse]);
                                        if (response.sessionStatus) {
                                          setSessionStatus(response.sessionStatus);
                                        }
                                      }
                                      setIsLoading(false);
                                    }).catch(error => {
                                      console.error("Erreur lors de l'envoi du message:", error);
                                      setIsLoading(false);
                                    });
                                  }
                                }}
                                className="relative bg-gradient-to-br from-[#0c2540] to-[#0a1420] hover:from-[#0d2d4f] hover:to-[#0c1930] border-2 border-[#00b4d8]/40 p-3 sm:p-4 rounded-md text-center text-sm transition-all transform hover:scale-[1.02] duration-200 flex flex-col items-center justify-center"
                                disabled={isLoading}
                              >
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00b4d8]/0 via-[#00b4d8]/60 to-[#00b4d8]/0"></div>
                                <span className="block mb-2 text-[#e5f0fc] font-bold text-base">2. Comprendre un concept</span>
                                <span className="text-[11px] sm:text-xs text-[#8abee0] leading-relaxed">Une notion cyber à maîtriser</span>
                              </button>
                              
                              <button 
                                onClick={() => {
                                  // Envoyer directement la valeur "3" au backend
                                  const userMsg: Message = {
                                    id: uuidv4(),
                                    type: "user",
                                    content: "3",
                                    timestamp: Date.now()
                                  };
                                  setMessages(prev => [...prev, userMsg]);
                                  
                                  // Envoyer au backend sans délai
                                  if (userId) {
                                    setIsLoading(true);
                                    apiRequest<{success: boolean, message: string, sessionStatus: SessionStatus}>('/api/cyber-expert/message', {
                                      method: 'POST',
                                      body: JSON.stringify({
                                        userId,
                                        message: "3"
                                      })
                                    }).then(response => {
                                      if (response.success) {
                                        const botResponse: Message = {
                                          id: uuidv4(),
                                          type: "bot",
                                          content: response.message,
                                          timestamp: Date.now()
                                        };
                                        setMessages(prev => [...prev, botResponse]);
                                        if (response.sessionStatus) {
                                          setSessionStatus(response.sessionStatus);
                                        }
                                      }
                                      setIsLoading(false);
                                    }).catch(error => {
                                      console.error("Erreur lors de l'envoi du message:", error);
                                      setIsLoading(false);
                                    });
                                  }
                                }}
                                className="relative bg-gradient-to-br from-[#0c2540] to-[#0a1420] hover:from-[#0d2d4f] hover:to-[#0c1930] border-2 border-[#00b4d8]/40 p-3 sm:p-4 rounded-md text-center text-sm transition-all transform hover:scale-[1.02] duration-200 flex flex-col items-center justify-center"
                                disabled={isLoading}
                              >
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00b4d8]/0 via-[#00b4d8]/60 to-[#00b4d8]/0"></div>
                                <span className="block mb-2 text-[#e5f0fc] font-bold text-base">3. Découvrir la cyber</span>
                                <span className="text-[11px] sm:text-xs text-[#8abee0] leading-relaxed">Un sujet intéressant pour débutant</span>
                              </button>
                            </div>
                            
                            <div className="text-[10px] sm:text-xs text-[#8abee0]/60 mt-3 text-center italic font-light">
                              Vous pouvez aussi répondre directement dans la zone de texte
                            </div>
                          </div>
                        ) : (
                          <div 
                            className="prose prose-invert max-w-none text-[#e5f0fc] leading-relaxed text-pretty" 
                            dangerouslySetInnerHTML={{ 
                              __html: DOMPurify.sanitize(formatTextWithStructure(message.content))
                            }}
                          />
                        )}
                      </div>
                    )}
                  </div>
                ))}
                
                {isLoading && messages.length > 0 && (
                  <div className="flex justify-start">
                    <div className="bg-[#0c1e2e] text-[#8abee0] p-2 sm:p-3 rounded-md flex items-center space-x-1 sm:space-x-2 border border-[#00b4d8]/30">
                      <div className="flex items-center">
                        <div className="font-mono text-[10px] sm:text-xs mr-1.5 sm:mr-2">ANALYSE EN COURS</div>
                        <div className="flex space-x-1">
                          <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-[#00b4d8] rounded-full animate-pulse"></div>
                          <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-[#00b4d8] rounded-full animate-pulse" style={{animationDelay: '300ms'}}></div>
                          <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-[#00b4d8] rounded-full animate-pulse" style={{animationDelay: '600ms'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Bouton de défilement vers le bas - optimisé pour mobile */}
              {showScrollButton && (
                <button 
                  onClick={scrollToBottom}
                  className="fixed right-3 sm:right-6 bottom-20 sm:bottom-24 bg-[#00b4d8] p-2 sm:p-3 rounded-full shadow-[0_0_15px_rgba(0,180,216,0.5)] z-20 text-[#0c1e2e] hover:bg-[#00a0c2]"
                  title="Défiler vers le bas"
                  aria-label="Défiler vers le bas de la conversation"
                >
                  <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              )}
              
              {/* Zone de saisie - optimisée pour mobile */}
              <div className="p-2 sm:p-4 border-t border-[#00b4d8]/20 bg-[#091525]">
                <form onSubmit={handleSubmit} className="flex space-x-1.5 sm:space-x-2">
                  <div className="relative flex-1">
                    <div className="absolute left-0 top-0 pl-2 sm:pl-3 h-full flex items-center text-[#00b4d8] opacity-70 pointer-events-none">
                      <span className="font-mono text-xs sm:text-sm">{'>'}</span>
                    </div>
                    <textarea 
                      ref={textareaRef}
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Entrez votre requête..."
                      className="w-full pl-6 sm:pl-8 pr-2 sm:pr-4 py-2 sm:py-3 bg-[#0c1e2e] border border-[#00b4d8]/30 rounded-md text-[#e5f0fc] placeholder-[#8abee0]/50 resize-none focus:ring-1 focus:ring-[#00b4d8] focus:border-[#00b4d8]/50 font-mono text-xs sm:text-sm"
                      rows={1}
                      disabled={isLoading}
                      style={{ minHeight: "2.5rem", maxHeight: "6rem" }}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="bg-[#00b4d8] hover:bg-[#00a0c2] text-[#0c1e2e] px-2 sm:px-4 py-1.5 sm:py-2 font-mono text-xs sm:text-sm rounded-md flex-shrink-0 h-auto min-w-10 sm:min-w-0"
                    disabled={!inputMessage.trim() || isLoading}
                  >
                    {isLoading ? (
                      <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                    ) : (
                      <span className="flex items-center">
                        <span className="hidden sm:inline">ENVOYER</span>
                        <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:ml-2" />
                      </span>
                    )}
                  </Button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </HomeLayout>
  );
}