import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, AlertTriangle, Lock, Clock, Shield, ChevronRight, Info, 
  AlertOctagon, Users, Activity, Banknote, Scale, ShieldAlert, Send,
  Phone, FileText, PanelLeft, MessageSquare, Server, BellRing, BarChart,
  UserCircle2, Crown, Mail, X, Check, Radiation, Loader, Bot
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@/hooks/use-toast";
import HomeLayout from "@/components/layout/HomeLayout";
import PageTitle from "@/components/utils/PageTitle";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import axios from "axios";
import { getStakeholderResponse } from "@/utils/stakeholderResponse";

// Types
export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  isPrivate?: boolean;
  reactionType?: "positive" | "negative" | "neutral";
  isTyping?: boolean;
}

export interface Conversation {
  stakeholderId: string;
  messages: Message[];
  lastActivity: Date;
}

export interface Stakeholder {
  id: string;
  name: string;
  role: string;
  avatar: string;
  personality: "calm" | "anxious" | "authoritative" | "technical" | "diplomatic";
  department: "IT" | "Executive" | "Communication" | "Legal" | "Operations" | "External";
  expertise: number;
  stress: number;
  trust: number;
  isAvailable: boolean;
}

export interface CrisisSystem {
  id: string;
  name: string;
  status: "operational" | "affected" | "offline" | "unknown";
  criticality: number;
  description: string;
  recoveryProgress: number;
}

export interface CrisisScenario {
  id: string;
  title: string;
  description: string;
  currentTime: Date;
  startTime: Date;
  detectionTime: Date;
  crisisLevel: number;
  stakeholders: Stakeholder[];
  conversations: Conversation[];
  warRoom: Message[];
  systems: CrisisSystem[];
  impactScore: {
    financial: number;
    reputation: number;
    operational: number;
    regulatory: number;
  };
}

export default function CrisisManagement() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // États du composant
  const [scenario, setScenario] = useState<CrisisScenario | null>(null);
  const [activeTab, setActiveTab] = useState<'warroom' | 'stakeholders' | 'systems'>('stakeholders');
  const [focusedStakeholderId, setFocusedStakeholderId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState<string>("");
  const [showContactDialog, setShowContactDialog] = useState<boolean>(false);
  const [showInfoDialog, setShowInfoDialog] = useState<boolean>(false);
  const [selectedSystem, setSelectedSystem] = useState<CrisisSystem | null>(null);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  
  // Effets
  useEffect(() => {
    // Chargement du scénario initial
    const initialScenario: CrisisScenario = {
      id: "ransomware-crisis-2025",
      title: "Attaque Ransomware Critique",
      description: "Une attaque ransomware a touché les systèmes critiques de la société. Plusieurs systèmes sont inaccessibles et une demande de rançon a été reçue.",
      currentTime: new Date(),
      startTime: new Date(new Date().getTime() - 3 * 60 * 60 * 1000), // 3 heures avant
      detectionTime: new Date(new Date().getTime() - 1 * 60 * 60 * 1000), // 1 heure avant
      crisisLevel: 8.5, // Sur 10
      stakeholders: [
        {
          id: "stakeholder-1",
          name: "Vincent Terrier",
          role: "Senior Partner, Directeur Financier",
          avatar: "",
          personality: "authoritative",
          department: "Executive",
          expertise: 65,
          stress: 85,
          trust: 60,
          isAvailable: true
        },
        {
          id: "stakeholder-2",
          name: "Marion Lopez",
          role: "Senior Partner, Directrice Communication",
          avatar: "",
          personality: "diplomatic",
          department: "Communication",
          expertise: 70,
          stress: 75,
          trust: 65,
          isAvailable: true
        },
        {
          id: "stakeholder-3",
          name: "Arnaud Gauthier",
          role: "Président",
          avatar: "",
          personality: "calm",
          department: "Executive",
          expertise: 55,
          stress: 70,
          trust: 75,
          isAvailable: true
        },
        {
          id: "stakeholder-4",
          name: "Olivier Hervo",
          role: "Directeur Général",
          avatar: "",
          personality: "technical",
          department: "Executive",
          expertise: 75,
          stress: 80,
          trust: 70,
          isAvailable: true
        },
        {
          id: "stakeholder-5",
          name: "Thomas Dubois",
          role: "Directeur Technique",
          avatar: "",
          personality: "technical",
          department: "IT",
          expertise: 95,
          stress: 90,
          trust: 60,
          isAvailable: true
        },
        {
          id: "stakeholder-6",
          name: "Claire Martin",
          role: "Directrice Juridique",
          avatar: "",
          personality: "anxious",
          department: "Legal",
          expertise: 85,
          stress: 82,
          trust: 65,
          isAvailable: true
        }
      ],
      conversations: [
        {
          stakeholderId: "stakeholder-1",
          messages: [
            {
              id: uuidv4(),
              senderId: "stakeholder-1",
              content: "Bonjour. J'ai besoin d'une évaluation immédiate de l'impact financier de cette attaque. Nous avons des projets critiques qui ne peuvent pas attendre. Quelles sont vos solutions ?",
              timestamp: new Date(new Date().getTime() - 40 * 60 * 1000),
              reactionType: "negative"
            }
          ],
          lastActivity: new Date(new Date().getTime() - 40 * 60 * 1000)
        },
        {
          stakeholderId: "stakeholder-2",
          messages: [
            {
              id: uuidv4(),
              senderId: "stakeholder-2",
              content: "La presse commence à s'intéresser à notre situation. Nous devons préparer une communication officielle rapidement. Avez-vous des éléments concrets à me communiquer ?",
              timestamp: new Date(new Date().getTime() - 35 * 60 * 1000),
              reactionType: "neutral"
            }
          ],
          lastActivity: new Date(new Date().getTime() - 35 * 60 * 1000)
        },
        {
          stakeholderId: "stakeholder-3",
          messages: [
            {
              id: uuidv4(),
              senderId: "stakeholder-3",
              content: "Je viens d'être informé de la situation critique. J'ai besoin d'un rapport complet sur cette attaque ransomware et les mesures prises. Notre réputation est en jeu.",
              timestamp: new Date(new Date().getTime() - 30 * 60 * 1000),
              reactionType: "neutral"
            }
          ],
          lastActivity: new Date(new Date().getTime() - 30 * 60 * 1000)
        },
        {
          stakeholderId: "stakeholder-4",
          messages: [
            {
              id: uuidv4(),
              senderId: "stakeholder-4",
              content: "Je suis en réunion externe avec des clients importants. Quelle est l'ampleur exacte de cette attaque ? Dois-je écourter ma réunion ? Tenez-moi informé rapidement.",
              timestamp: new Date(new Date().getTime() - 25 * 60 * 1000),
              reactionType: "neutral"
            }
          ],
          lastActivity: new Date(new Date().getTime() - 25 * 60 * 1000)
        },
        {
          stakeholderId: "stakeholder-5",
          messages: [
            {
              id: uuidv4(),
              senderId: "stakeholder-5",
              content: "J'analyse actuellement les vecteurs d'attaque. Nos sauvegardes semblent intactes mais inaccessibles. J'ai besoin de votre autorisation pour isoler complètement le réseau. Urgent.",
              timestamp: new Date(new Date().getTime() - 20 * 60 * 1000),
              reactionType: "negative"
            }
          ],
          lastActivity: new Date(new Date().getTime() - 20 * 60 * 1000)
        },
        {
          stakeholderId: "stakeholder-6",
          messages: [
            {
              id: uuidv4(),
              senderId: "stakeholder-6",
              content: "Nous devons évaluer immédiatement nos obligations de notification RGPD et nos responsabilités légales. Avez-vous confirmation d'une fuite de données clients ?",
              timestamp: new Date(new Date().getTime() - 15 * 60 * 1000),
              reactionType: "negative"
            }
          ],
          lastActivity: new Date(new Date().getTime() - 15 * 60 * 1000)
        }
      ],
      warRoom: [
        {
          id: uuidv4(),
          senderId: "system",
          content: "🚨 Début de la cellule de crise - Attaque Ransomware détectée à 08:30.",
          timestamp: new Date(new Date().getTime() - 60 * 60 * 1000),
        },
        {
          id: uuidv4(),
          senderId: "stakeholder-5",
          content: "Premiers diagnostics : 80% des serveurs virtuels sont chiffrés. Les contrôleurs de domaine sont hors ligne. Je travaille sur l'isolation du réseau.",
          timestamp: new Date(new Date().getTime() - 55 * 60 * 1000),
        },
        {
          id: uuidv4(),
          senderId: "stakeholder-1",
          content: "Nous devons évaluer l'impact financier immédiatement. Combien de temps pour restaurer les opérations minimales ?",
          timestamp: new Date(new Date().getTime() - 50 * 60 * 1000),
        },
        {
          id: uuidv4(),
          senderId: "stakeholder-6",
          content: "Une analyse juridique préliminaire suggère que nous avons 72h pour notifier la CNIL si des données personnelles sont compromises.",
          timestamp: new Date(new Date().getTime() - 45 * 60 * 1000),
        }
      ],
      systems: [
        {
          id: "sys-1",
          name: "Infrastructure réseau",
          status: "affected",
          criticality: 95,
          description: "Routeurs, pare-feu et équipements réseau. Partiellement affectés mais certains points d'accès restent fonctionnels.",
          recoveryProgress: 15
        },
        {
          id: "sys-2",
          name: "Serveurs de fichiers",
          status: "offline",
          criticality: 90,
          description: "Stockage des documents et données partagées. Tous les fichiers sont actuellement inaccessibles.",
          recoveryProgress: 0
        },
        {
          id: "sys-3",
          name: "Base de données clients",
          status: "offline",
          criticality: 100,
          description: "Données clients et historique des prestations. Contient des données sensibles régies par le RGPD.",
          recoveryProgress: 0
        },
        {
          id: "sys-4",
          name: "Messagerie électronique",
          status: "affected",
          criticality: 85,
          description: "Service de messagerie électronique interne et externe. Fonctionne partiellement avec des interruptions.",
          recoveryProgress: 30
        },
        {
          id: "sys-5",
          name: "Site web public",
          status: "operational",
          criticality: 80,
          description: "Site institutionnel hébergé sur une infrastructure externe. Fonctionnel mais l'accès interne pour les mises à jour est compromis.",
          recoveryProgress: 100
        },
        {
          id: "sys-6",
          name: "Plateforme RH",
          status: "offline",
          criticality: 60,
          description: "Gestion des ressources humaines, paie et congés. Inaccessible suite à l'attaque.",
          recoveryProgress: 0
        },
        {
          id: "sys-7",
          name: "Sauvegardes",
          status: "unknown",
          criticality: 100,
          description: "Systèmes de sauvegarde primaires et secondaires. État incertain, analyse en cours.",
          recoveryProgress: 25
        }
      ],
      impactScore: {
        financial: 75,
        reputation: 60,
        operational: 85,
        regulatory: 70
      }
    };
    
    setScenario(initialScenario);
    
    // Par défaut, sélectionner le premier stakeholder disponible
    const firstAvailableStakeholder = initialScenario.stakeholders.find(s => s.isAvailable);
    if (firstAvailableStakeholder) {
      setFocusedStakeholderId(firstAvailableStakeholder.id);
    }
    
  }, []);
  
  // Défilement automatique lorsque de nouveaux messages sont ajoutés
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [scenario?.conversations, scenario?.warRoom, focusedStakeholderId]);
  
  // Formatage de la durée écoulée depuis le début de la crise
  const formatElapsedTime = (startTime: Date, currentTime: Date): string => {
    const elapsedMs = currentTime.getTime() - startTime.getTime();
    const hours = Math.floor(elapsedMs / (1000 * 60 * 60));
    const minutes = Math.floor((elapsedMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
  };
  
  // Permettre l'envoi du message avec la touche Entrée (sauf si Shift est pressé)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Génération de réponse IA pour un stakeholder
  const generateAIResponse = async (stakeholderId: string, userMessage: string) => {
    if (!scenario) return;
    
    // Trouver le stakeholder concerné
    const stakeholder = scenario.stakeholders.find(s => s.id === stakeholderId);
    if (!stakeholder) return;
    
    // Trouver la conversation correspondante
    const conversationIndex = scenario.conversations.findIndex(c => c.stakeholderId === stakeholderId);
    if (conversationIndex === -1) return;
    
    try {
      // Activer l'indicateur de frappe
      setIsTyping(true);
      
      // Ajouter un message temporaire "en train d'écrire"
      setScenario(prev => {
        if (!prev) return prev;
        
        const updatedConversations = [...prev.conversations];
        updatedConversations[conversationIndex] = {
          ...updatedConversations[conversationIndex],
          messages: [
            ...updatedConversations[conversationIndex].messages,
            {
              id: uuidv4(),
              senderId: stakeholderId,
              content: "...",
              timestamp: new Date(),
              isTyping: true
            }
          ]
        };
        
        return {
          ...prev,
          conversations: updatedConversations
        };
      });
      
      // Obtenir la réponse du stakeholder via l'utilitaire
      const { message, stressChange, trustChange } = await getStakeholderResponse(
        stakeholder,
        scenario.conversations[conversationIndex].messages,
        userMessage
      );
      
      // Mettre à jour le scénario avec la réponse de l'IA
      setScenario(prev => {
        if (!prev) return prev;
        
        const conversationIndex = prev.conversations.findIndex(c => c.stakeholderId === stakeholderId);
        if (conversationIndex === -1) return prev;
        
        // Filtrer pour retirer le message "typing"
        const filteredMessages = prev.conversations[conversationIndex].messages
          .filter(msg => !msg.isTyping);
        
        const updatedConversations = [...prev.conversations];
        updatedConversations[conversationIndex] = {
          ...updatedConversations[conversationIndex],
          messages: [...filteredMessages, message],
          lastActivity: new Date()
        };
        
        // Mise à jour des statistiques du stakeholder
        const updatedStakeholders = prev.stakeholders.map(s => {
          if (s.id === stakeholderId) {
            return {
              ...s,
              stress: Math.max(0, Math.min(100, s.stress + stressChange)),
              trust: Math.max(0, Math.min(100, s.trust + trustChange))
            };
          }
          return s;
        });
        
        return {
          ...prev,
          conversations: updatedConversations,
          stakeholders: updatedStakeholders
        };
      });
      
    } catch (error) {
      console.error("Erreur lors de la génération de la réponse:", error);
      toast({
        title: "Erreur de communication",
        description: "Impossible de générer une réponse pour ce contact.",
        variant: "destructive",
      });
    } finally {
      // Désactiver l'indicateur de frappe
      setIsTyping(false);
    }
  };
  
  // Gérer l'envoi de messages dans la conversation
  const handleSendMessage = () => {
    if (!messageInput.trim() || !scenario) return;
    
    const userMessageContent = messageInput; // Sauvegarder le contenu
    setIsSending(true);
    
    // Construire le nouveau message du joueur
    const newMessage: Message = {
      id: uuidv4(),
      senderId: "player",
      content: userMessageContent,
      timestamp: new Date()
    };
    
    // Effacer le message après l'envoi
    setMessageInput("");
    
    // Destination du message selon l'onglet actif
    if (activeTab === 'warroom') {
      // Message dans la war room (tous les participants)
      setScenario(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          warRoom: [...prev.warRoom, newMessage]
        };
      });
      
      // Terminer l'envoi du message
      setIsSending(false);
      
    } else if (activeTab === 'stakeholders' && focusedStakeholderId) {
      // Message privé à une partie prenante spécifique
      setScenario(prev => {
        if (!prev) return prev;
        
        const conversationIndex = prev.conversations.findIndex(
          c => c.stakeholderId === focusedStakeholderId
        );
        
        if (conversationIndex === -1) return prev;
        
        const updatedConversations = [...prev.conversations];
        updatedConversations[conversationIndex] = {
          ...updatedConversations[conversationIndex],
          messages: [...updatedConversations[conversationIndex].messages, newMessage],
          lastActivity: new Date()
        };
        
        return {
          ...prev,
          conversations: updatedConversations
        };
      });
      
      // Terminer l'envoi du message
      setIsSending(false);
      
      // Déclencher une réponse du PNJ après un court délai
      setTimeout(() => {
        // Appeler la fonction de génération de réponse IA
        generateAIResponse(focusedStakeholderId, userMessageContent);
      }, 1000);
    }
  };
  
  // Obtenir les messages de la conversation active
  const getActiveConversation = (): Message[] => {
    if (!scenario) return [];
    
    if (activeTab === 'warroom') {
      return scenario.warRoom;
    } else if (activeTab === 'stakeholders' && focusedStakeholderId) {
      const conversation = scenario.conversations.find(c => c.stakeholderId === focusedStakeholderId);
      return conversation ? conversation.messages : [];
    }
    
    return [];
  };
  
  // Trouver le stakeholder focalisé
  const getFocusedStakeholder = (): Stakeholder | undefined => {
    if (!scenario || !focusedStakeholderId) return undefined;
    return scenario.stakeholders.find(s => s.id === focusedStakeholderId);
  };
  
  // Obtenir la couleur de badge pour le statut d'un système
  const getSystemStatusBadge = (status: string) => {
    switch (status) {
      case 'operational':
        return <Badge className="bg-green-500 hover:bg-green-600">Opérationnel</Badge>;
      case 'affected':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Affecté</Badge>;
      case 'offline':
        return <Badge className="bg-red-500 hover:bg-red-600">Hors ligne</Badge>;
      default:
        return <Badge className="bg-gray-500 hover:bg-gray-600">Indéterminé</Badge>;
    }
  };
  
  // Couleur pour le niveau d'impact
  const getImpactColor = (value: number) => {
    if (value >= 80) return "bg-red-500";
    if (value >= 50) return "bg-yellow-500";
    return "bg-green-500";
  };

  // Retour à la page de briefing
  const handleBackToBriefing = () => {
    setLocation("/cyber/crisis-management/briefing");
  };

  if (!scenario) {
    return (
      <HomeLayout>
        <div className="flex h-[80vh] items-center justify-center">
          <div className="text-center">
            <Loader className="mx-auto mb-4 h-10 w-10 animate-spin text-primary" />
            <h2 className="text-xl font-semibold">Initialisation de la simulation...</h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Préparation de l'environnement de crise
            </p>
          </div>
        </div>
      </HomeLayout>
    );
  }

  return (
    <HomeLayout className="p-0">
      <div className="relative overflow-hidden">
        {/* Fond animé de la crise */}
        <div className="absolute inset-0 z-0 overflow-hidden opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-red-800 to-black"></div>
          <div className="absolute left-0 top-0 h-full w-full bg-[url('path/to/crisis-background.svg')] bg-cover bg-center"></div>
        </div>
        
        {/* En-tête - Informations sur la crise en cours */}
        <div className="relative z-10 flex w-full items-center justify-between border-b border-gray-200 bg-card/80 p-3 backdrop-blur-sm dark:border-gray-800">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="mr-2 h-8 w-8"
              onClick={handleBackToBriefing}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <h1 className="text-lg font-semibold">{scenario.title}</h1>
          </div>
          
          <div className="flex space-x-6">
            {/* Chronomètre de la crise */}
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium">
                {formatElapsedTime(scenario.startTime, scenario.currentTime)}
              </span>
            </div>
            
            {/* Niveau de crise */}
            <div className="flex items-center">
              <AlertOctagon className="mr-2 h-4 w-4 text-red-500" />
              <span className="text-sm font-medium">
                Niveau {scenario.crisisLevel.toFixed(1)}/10
              </span>
            </div>
            
            {/* Bouton d'information */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setShowInfoDialog(true)}
            >
              <Info className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Contenu principal */}
        <div className="relative z-10 grid h-[calc(100vh-11rem)] grid-cols-10 gap-0">
          {/* Barre latérale - Parties prenantes et systèmes */}
          <div className="col-span-3 border-r border-gray-200 bg-card/90 p-2 dark:border-gray-800">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
              <TabsList className="w-full">
                <TabsTrigger value="stakeholders" className="flex-1">
                  <Users className="mr-2 h-4 w-4" />
                  Parties prenantes
                </TabsTrigger>
                <TabsTrigger value="systems" className="flex-1">
                  <Server className="mr-2 h-4 w-4" />
                  Systèmes
                </TabsTrigger>
                <TabsTrigger value="warroom" className="flex-1">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  War Room
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="stakeholders" className="mt-2">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-medium">Contactez vos parties prenantes</h3>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowContactDialog(true)}
                  >
                    <Phone className="mr-2 h-3 w-3" />
                    Contacter
                  </Button>
                </div>
                
                <ScrollArea className="h-[calc(100vh-20rem)]">
                  {scenario.stakeholders
                    .filter(stakeholder => stakeholder.isAvailable)
                    .map(stakeholder => {
                      // Trouver la conversation pour ce stakeholder
                      const conversation = scenario.conversations.find(
                        c => c.stakeholderId === stakeholder.id
                      );
                      // Compter les messages non lus (depuis la dernière interaction du joueur)
                      const hasUnread = conversation && conversation.messages.length > 0 && 
                                      conversation.messages[conversation.messages.length - 1].senderId !== "player";
                      
                      return (
                        <Card 
                          key={stakeholder.id}
                          className={`mb-2 cursor-pointer transition-colors ${
                            focusedStakeholderId === stakeholder.id 
                              ? "border-primary bg-primary/10" 
                              : "hover:bg-secondary/10"
                          }`}
                          onClick={() => {
                            setFocusedStakeholderId(stakeholder.id);
                            setActiveTab("stakeholders");
                          }}
                          data-stakeholder-id={stakeholder.id}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-10 w-10 border-2 border-gray-200 dark:border-gray-700">
                                  {stakeholder.avatar ? (
                                    <AvatarImage src={stakeholder.avatar} alt={stakeholder.name} />
                                  ) : (
                                    <AvatarFallback className="bg-primary/20 text-sm">
                                      {stakeholder.name.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                  )}
                                </Avatar>
                                
                                <div>
                                  <div className="flex items-center space-x-2">
                                    <h3 className="text-sm font-medium">{stakeholder.name}</h3>
                                    {hasUnread && (
                                      <span className="flex h-2 w-2 rounded-full bg-primary"></span>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {stakeholder.role}
                                  </p>
                                </div>
                              </div>
                              
                              <ChevronRight className="h-4 w-4 text-gray-400" />
                            </div>
                            
                            <div className="mt-2 grid grid-cols-2 gap-2">
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Stress</p>
                                <Progress value={stakeholder.stress} className="h-2 w-full">
                                  <div 
                                    className={`h-full ${stakeholder.stress > 70 ? "bg-red-500" : stakeholder.stress > 40 ? "bg-yellow-500" : "bg-green-500"}`}
                                    style={{ width: `${stakeholder.stress}%` }}
                                  />
                                </Progress>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Confiance</p>
                                <Progress value={stakeholder.trust} className="h-2 w-full">
                                  <div 
                                    className={`h-full ${stakeholder.trust < 30 ? "bg-red-500" : stakeholder.trust < 60 ? "bg-yellow-500" : "bg-green-500"}`}
                                    style={{ width: `${stakeholder.trust}%` }}
                                  />
                                </Progress>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                </ScrollArea>
                
                {/* Indicateurs d'impact */}
                <div className="mt-4 space-y-3 rounded-md border border-gray-200 bg-card p-3 dark:border-gray-800">
                  <h3 className="mb-3 flex items-center text-sm font-medium">
                    <Activity className="mr-2 h-4 w-4 text-gray-400" />
                    Impact de la crise
                  </h3>
                  
                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs">Impact financier</span>
                      <span className="text-xs font-medium">{scenario.impactScore.financial}%</span>
                    </div>
                    <Progress value={scenario.impactScore.financial} className="h-1.5 w-full">
                      <div className={`h-full ${getImpactColor(scenario.impactScore.financial)}`} style={{ width: `${scenario.impactScore.financial}%` }} />
                    </Progress>
                  </div>
                  
                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs">Impact réputationnel</span>
                      <span className="text-xs font-medium">{scenario.impactScore.reputation}%</span>
                    </div>
                    <Progress value={scenario.impactScore.reputation} className="h-1.5 w-full">
                      <div className={`h-full ${getImpactColor(scenario.impactScore.reputation)}`} style={{ width: `${scenario.impactScore.reputation}%` }} />
                    </Progress>
                  </div>
                  
                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs">Impact opérationnel</span>
                      <span className="text-xs font-medium">{scenario.impactScore.operational}%</span>
                    </div>
                    <Progress value={scenario.impactScore.operational} className="h-1.5 w-full">
                      <div className={`h-full ${getImpactColor(scenario.impactScore.operational)}`} style={{ width: `${scenario.impactScore.operational}%` }} />
                    </Progress>
                  </div>
                  
                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs">Impact réglementaire</span>
                      <span className="text-xs font-medium">{scenario.impactScore.regulatory}%</span>
                    </div>
                    <Progress value={scenario.impactScore.regulatory} className="h-1.5 w-full">
                      <div className={`h-full ${getImpactColor(scenario.impactScore.regulatory)}`} style={{ width: `${scenario.impactScore.regulatory}%` }} />
                    </Progress>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="systems" className="mt-2">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-medium">État des systèmes</h3>
                  <div className="flex space-x-2">
                    <Badge className="bg-green-500 hover:bg-green-600">
                      <div className="mr-1 h-2 w-2 rounded-full bg-white"></div>
                      OK
                    </Badge>
                    <Badge className="bg-yellow-500 hover:bg-yellow-600">
                      <div className="mr-1 h-2 w-2 rounded-full bg-white"></div>
                      Affecté
                    </Badge>
                    <Badge className="bg-red-500 hover:bg-red-600">
                      <div className="mr-1 h-2 w-2 rounded-full bg-white"></div>
                      Hors ligne
                    </Badge>
                  </div>
                </div>
                
                <ScrollArea className="h-[calc(100vh-20rem)]">
                  {scenario.systems.map(system => (
                    <Card 
                      key={system.id}
                      className="mb-2 cursor-pointer hover:bg-secondary/10"
                      onClick={() => {
                        setSelectedSystem(system);
                        setActiveTab("systems");
                      }}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium">{system.name}</h3>
                          {getSystemStatusBadge(system.status)}
                        </div>
                        
                        <div className="mt-2">
                          <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                            Criticité: {system.criticality}/100
                          </p>
                          <Progress value={system.recoveryProgress} className="h-2 w-full">
                            <div 
                              className={`h-full ${system.status === 'operational' ? "bg-green-500" : system.status === 'affected' ? "bg-yellow-500" : "bg-red-500"}`}
                              style={{ width: `${system.recoveryProgress}%` }}
                            />
                          </Progress>
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Récupération: {system.recoveryProgress}%
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </ScrollArea>
                
                {selectedSystem && (
                  <div className="mt-4 space-y-3 rounded-md border border-gray-200 bg-card p-3 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium">{selectedSystem.name}</h3>
                      {getSystemStatusBadge(selectedSystem.status)}
                    </div>
                    
                    <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-300">
                      {selectedSystem.description}
                    </p>
                    
                    <div>
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-xs">Progression de la récupération</span>
                        <span className="text-xs font-medium">{selectedSystem.recoveryProgress}%</span>
                      </div>
                      <Progress value={selectedSystem.recoveryProgress} className="h-2 w-full">
                        <div 
                          className={`h-full ${selectedSystem.status === 'operational' ? "bg-green-500" : selectedSystem.status === 'affected' ? "bg-yellow-500" : "bg-red-500"}`}
                          style={{ width: `${selectedSystem.recoveryProgress}%` }}
                        />
                      </Progress>
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <Button size="sm" variant="outline" className="text-xs">
                        <FileText className="mr-1 h-3 w-3" />
                        Rapport détaillé
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs">
                        <Shield className="mr-1 h-3 w-3" />
                        Actions de sécurité
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="warroom" className="mt-2">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-medium">War Room - Communication d'équipe</h3>
                  <Badge className="bg-blue-500 hover:bg-blue-600">
                    {scenario.stakeholders.filter(s => s.isAvailable).length} membres
                  </Badge>
                </div>
                
                {/* Liste des participants */}
                <div className="mb-2 flex space-x-1">
                  {scenario.stakeholders
                    .filter(s => s.isAvailable)
                    .map(stakeholder => (
                      <Avatar key={stakeholder.id} className="h-6 w-6 border border-primary/20">
                        {stakeholder.avatar ? (
                          <AvatarImage src={stakeholder.avatar} alt={stakeholder.name} />
                        ) : (
                          <AvatarFallback className="bg-primary/10 text-[10px]">
                            {stakeholder.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        )}
                      </Avatar>
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Conversation et interactions */}
          <div className="col-span-7 flex h-full flex-col bg-card/50 p-0">
            {/* En-tête de la conversation */}
            <div className="border-b border-gray-200 bg-card/80 p-3 dark:border-gray-800">
              {activeTab === 'stakeholders' && focusedStakeholderId ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      {getFocusedStakeholder()?.avatar ? (
                        <AvatarImage src={getFocusedStakeholder()?.avatar || ""} alt={getFocusedStakeholder()?.name || ""} />
                      ) : (
                        <AvatarFallback className="bg-primary/20 text-sm">
                          {getFocusedStakeholder()?.name.split(' ').map(n => n[0]).join('') || ""}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <h3 className="text-sm font-medium">{getFocusedStakeholder()?.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {getFocusedStakeholder()?.role}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Badge className={`${getFocusedStakeholder()?.stress && getFocusedStakeholder()?.stress > 70 ? "bg-red-500" : getFocusedStakeholder()?.stress && getFocusedStakeholder()?.stress > 40 ? "bg-yellow-500" : "bg-green-500"} hover:opacity-90`}>
                      Stress: {getFocusedStakeholder()?.stress}%
                    </Badge>
                    <Badge className={`${getFocusedStakeholder()?.trust && getFocusedStakeholder()?.trust < 30 ? "bg-red-500" : getFocusedStakeholder()?.trust && getFocusedStakeholder()?.trust < 60 ? "bg-yellow-500" : "bg-green-500"} hover:opacity-90`}>
                      Confiance: {getFocusedStakeholder()?.trust}%
                    </Badge>
                  </div>
                </div>
              ) : activeTab === 'warroom' ? (
                <div className="flex items-center space-x-3">
                  <AlertOctagon className="h-5 w-5 text-red-500" />
                  <div>
                    <h3 className="text-sm font-medium">War Room - Attaque Ransomware Critique</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Communication d'équipe - Cellule de crise
                    </p>
                  </div>
                </div>
              ) : activeTab === 'systems' && selectedSystem ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Server className="h-5 w-5 text-gray-400" />
                    <div>
                      <h3 className="text-sm font-medium">{selectedSystem.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Criticité: {selectedSystem.criticality}/100
                      </p>
                    </div>
                  </div>
                  <div>
                    {getSystemStatusBadge(selectedSystem.status)}
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Info className="h-5 w-5 text-gray-400" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Sélectionnez une partie prenante ou un système pour voir les détails
                  </p>
                </div>
              )}
            </div>
            
            {/* Corps de la conversation */}
            <ScrollArea className="h-full py-4">
              <div className="px-4">
                {getActiveConversation().map((message, index) => (
                  <div
                    key={message.id}
                    className={`mb-4 flex ${
                      message.senderId === "player" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {message.senderId !== "player" && (
                      <div className="mr-2 mt-1">
                        <Avatar className="h-8 w-8">
                          {message.senderId === "system" ? (
                            <AvatarFallback className="bg-gray-700">
                              <ShieldAlert className="h-4 w-4 text-gray-200" />
                            </AvatarFallback>
                          ) : message.senderId.startsWith("stakeholder") ? (
                            <AvatarFallback className="bg-primary/20 text-xs">
                              {scenario.stakeholders.find(s => s.id === message.senderId)?.name.split(' ').map(n => n[0]).join('') || ""}
                            </AvatarFallback>
                          ) : (
                            <AvatarFallback className="bg-primary/20 text-xs">
                              ?
                            </AvatarFallback>
                          )}
                        </Avatar>
                      </div>
                    )}
                    
                    <div 
                      className={`max-w-[75%] rounded-lg px-4 py-2 ${
                        message.senderId === "player"
                          ? "bg-primary text-primary-foreground"
                          : message.senderId === "system"
                          ? "bg-gray-800 text-white dark:bg-gray-700"
                          : "bg-card dark:bg-gray-800"
                      } ${message.isTyping ? "animate-pulse" : ""}`}
                    >
                      {message.senderId !== "player" && message.senderId !== "system" && (
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-xs font-medium">
                            {scenario.stakeholders.find(s => s.id === message.senderId)?.name || "Contact"}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}
                          </span>
                        </div>
                      )}
                      
                      <p className="text-sm leading-relaxed">
                        {message.content}
                      </p>
                      
                      {message.senderId === "player" && (
                        <div className="mt-1 flex justify-end">
                          <span className="text-xs text-white/80">
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {message.senderId === "player" && (
                      <div className="ml-2 mt-1">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/20">
                            <UserCircle2 className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            
            {/* Zone de saisie du message */}
            {(activeTab === 'stakeholders' && focusedStakeholderId) || activeTab === 'warroom' ? (
              <div className="border-t border-gray-200 bg-card/90 p-3 dark:border-gray-800">
                <div className="flex items-end space-x-2">
                  <Textarea
                    ref={messageInputRef}
                    placeholder={`Rédigez votre message à ${
                      activeTab === 'stakeholders' && getFocusedStakeholder()
                        ? getFocusedStakeholder()?.name
                        : "la cellule de crise"
                    }...`}
                    className="min-h-[60px] resize-none"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isSending || isTyping}
                  />
                  <Button
                    size="icon"
                    className={`h-[60px] w-[60px] shrink-0 rounded-full ${isSending || isTyping ? "opacity-50" : ""}`}
                    onClick={handleSendMessage}
                    disabled={isSending || isTyping || !messageInput.trim()}
                  >
                    {isSending ? (
                      <Loader className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
      
      {/* Boîte de dialogue pour contacter de nouvelles parties prenantes */}
      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Contacter une partie prenante</DialogTitle>
            <DialogDescription>
              Sélectionnez une personne à contacter pour gérer cette crise.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 space-y-2">
            {scenario.stakeholders
              .filter(s => !s.isAvailable)
              .map(stakeholder => (
                <Card 
                  key={stakeholder.id}
                  className="cursor-pointer hover:bg-secondary/10"
                  onClick={() => {
                    // Logique pour contacter un nouveau stakeholder
                    setShowContactDialog(false);
                    toast({
                      title: "Contact établi",
                      description: `${stakeholder.name} a été ajouté à vos contacts.`,
                    });
                  }}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          {stakeholder.avatar ? (
                            <AvatarImage src={stakeholder.avatar} alt={stakeholder.name} />
                          ) : (
                            <AvatarFallback className="bg-primary/20 text-sm">
                              {stakeholder.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <h3 className="text-sm font-medium">{stakeholder.name}</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {stakeholder.role}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            
            {scenario.stakeholders.filter(s => !s.isAvailable).length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <UserCircle2 className="mb-2 h-8 w-8 text-gray-400" />
                <h3 className="text-sm font-medium">Tous les contacts sont disponibles</h3>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Vous avez déjà accès à toutes les parties prenantes
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline"
              onClick={() => setShowContactDialog(false)}
            >
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Boîte de dialogue d'information sur la crise */}
      <Dialog open={showInfoDialog} onOpenChange={setShowInfoDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
              {scenario.title}
            </DialogTitle>
            <DialogDescription>
              Informations détaillées sur la crise en cours
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 space-y-4">
            <div>
              <h3 className="mb-1 text-sm font-medium">Description</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {scenario.description}
              </p>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="mb-1 text-sm font-medium">Début de l'incident</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {scenario.startTime.toLocaleString()}
                </p>
              </div>
              <div>
                <h3 className="mb-1 text-sm font-medium">Détection</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {scenario.detectionTime.toLocaleString()}
                </p>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="mb-2 text-sm font-medium">Niveau d'impact</h3>
              <div className="space-y-2">
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs">Impact financier</span>
                    <span className="text-xs font-medium">{scenario.impactScore.financial}%</span>
                  </div>
                  <Progress value={scenario.impactScore.financial} className="h-1.5 w-full">
                    <div className={`h-full ${getImpactColor(scenario.impactScore.financial)}`} style={{ width: `${scenario.impactScore.financial}%` }} />
                  </Progress>
                </div>
                
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs">Impact réputationnel</span>
                    <span className="text-xs font-medium">{scenario.impactScore.reputation}%</span>
                  </div>
                  <Progress value={scenario.impactScore.reputation} className="h-1.5 w-full">
                    <div className={`h-full ${getImpactColor(scenario.impactScore.reputation)}`} style={{ width: `${scenario.impactScore.reputation}%` }} />
                  </Progress>
                </div>
                
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs">Impact opérationnel</span>
                    <span className="text-xs font-medium">{scenario.impactScore.operational}%</span>
                  </div>
                  <Progress value={scenario.impactScore.operational} className="h-1.5 w-full">
                    <div className={`h-full ${getImpactColor(scenario.impactScore.operational)}`} style={{ width: `${scenario.impactScore.operational}%` }} />
                  </Progress>
                </div>
                
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs">Impact réglementaire</span>
                    <span className="text-xs font-medium">{scenario.impactScore.regulatory}%</span>
                  </div>
                  <Progress value={scenario.impactScore.regulatory} className="h-1.5 w-full">
                    <div className={`h-full ${getImpactColor(scenario.impactScore.regulatory)}`} style={{ width: `${scenario.impactScore.regulatory}%` }} />
                  </Progress>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="mb-2 text-sm font-medium">Votre rôle</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                En tant que Responsable de la Sécurité des Systèmes d'Information (RSSI),
                vous devez gérer cette crise en collaborant avec les différentes parties prenantes,
                prendre des décisions stratégiques pour limiter les impacts et restaurer les systèmes.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline"
              onClick={() => setShowInfoDialog(false)}
            >
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </HomeLayout>
  );
}