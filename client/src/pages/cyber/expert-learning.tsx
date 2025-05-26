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
  
  // Détecter et mettre en évidence les styles d'apprentissage
  formattedText = formattedText.replace(/\((ACADÉMIQUE|ACADEMIC|SIMULATION|DÉFI|CHALLENGE|VISUEL|VISUAL)\)/gi, 
    '<span class="inline-block bg-[#00b4d8]/20 text-[#00b4d8] text-xs px-2 py-0.5 rounded mr-1 uppercase font-mono">$1</span>');
  
  // Remplacer les listes numérotées (1., 2., etc.)
  formattedText = formattedText.replace(/^(\d+\.\s+)(.+)$/gm, '<div class="flex mb-2"><div class="w-6 flex-shrink-0 font-bold">$1</div><div>$2</div></div>');
  
  // Remplacer les listes à puces (-, *, •)
  formattedText = formattedText.replace(/^([-*•]\s+)(.+)$/gm, '<div class="flex mb-2"><div class="w-6 flex-shrink-0">$1</div><div>$2</div></div>');
  
  // Mettre en surbrillance les sections importantes (entre ** ou entourées de MAJUSCULES)
  formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<span class="font-bold text-blue-300">$1</span>');
  
  // Ajouter une classe pour les sections en majuscules
  formattedText = formattedText.replace(/([A-Z]{3,}[\s-][A-Z\s-]+)(\s*-\s*)/g, '<div class="font-bold text-blue-300 mt-3 mb-1">$1</div>');
  
  // Gérer les titres de sections
  formattedText = formattedText.replace(/(?<!span class="[^"]*">)(.*?):/g, '<span class="font-semibold">$1:</span>');

  return formattedText;
};

// Interfaces
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

function ExpertLearningPageContent() {
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userId] = useState(() => uuidv4());
  const [sessionStatus, setSessionStatus] = useState<SessionStatus | null>(null);
  const [sessionSummary, setSessionSummary] = useState<string | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [contextualSuggestions, setContextualSuggestions] = useState<Array<{text: string, prompt: string}>>([
    { text: "Comment me protéger contre le phishing ?", prompt: "Comment me protéger contre le phishing ?" },
    { text: "Explique-moi les ransomwares", prompt: "Explique-moi les ransomwares" },
    { text: "Comment sécuriser mon Wi-Fi ?", prompt: "Comment sécuriser mon Wi-Fi ?" },
  ]);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const [_, setLocation] = useLocation();

  // Fonction pour générer des suggestions contextuelles basées sur le contenu de la conversation
  const getContextualSuggestions = () => {
    // Si la conversation est vide, retourner les suggestions par défaut
    if (messages.length === 0) {
      return [
        { text: "Comment me protéger contre le phishing ?", prompt: "Comment me protéger contre le phishing ?" },
        { text: "Explique-moi les ransomwares", prompt: "Explique-moi les ransomwares" },
        { text: "Comment sécuriser mon Wi-Fi ?", prompt: "Comment sécuriser mon Wi-Fi ?" },
      ];
    }
    
    // Analyser les derniers messages pour détecter les sujets principaux
    const recentMessages = messages.slice(-6); // Analyser les 6 derniers messages
    const conversationText = recentMessages
      .filter(msg => msg.type === "user")
      .map(msg => msg.content.toLowerCase())
      .join(" ");
    
    // Mots-clés par sujet
    type TopicKeywords = Record<string, string[]>;
    
    const topicKeywords: TopicKeywords = {
      phishing: ["phishing", "hameçonnage", "email", "frauduleux", "piège", "lien", "suspect", "arnaque"],
      ransomware: ["ransomware", "rançongiciel", "chiffrement", "otage", "rançon", "cryptolocker", "wannacry"],
      passwords: ["mot de passe", "password", "authentification", "2fa", "double facteur", "mfa"],
      network: ["wifi", "réseau", "vpn", "routeur", "sécurité réseau", "firewall", "pare-feu"],
      malware: ["malware", "virus", "trojan", "antivirus", "infection", "logiciel malveillant"],
      dataProtection: ["données", "sauvegarde", "chiffrement", "rgpd", "confidentialité", "protection"],
      zeroTrust: ["zero trust", "confiance zéro", "principe", "moindre privilège", "vérification"],
      iot: ["iot", "objets connectés", "domotique", "maison connectée", "appareil connecté"],
      mobile: ["mobile", "smartphone", "byod", "application", "app store"],
      cloud: ["cloud", "nuage", "saas", "aws", "azure", "responsabilité partagée"]
    };
    
    // Compter les occurrences de mots-clés pour chaque sujet
    type TopicScore = {
      topic: string;
      count: number;
    };
    
    const topicCounts: TopicScore[] = Object.entries(topicKeywords).map(([topic, keywords]) => {
      const count = keywords.reduce((acc, keyword) => {
        const matches = (conversationText.match(new RegExp(keyword, 'g')) || []).length;
        return acc + matches;
      }, 0);
      return { topic, count };
    });
    
    // Trier par score décroissant
    topicCounts.sort((a, b) => b.count - a.count);
    
    // Sélectionner le sujet principal (ou par défaut si aucun sujet n'est détecté)
    const mainTopic = topicCounts[0].count > 0 ? topicCounts[0].topic : 'general';
    
    // Suggestions spécifiques au sujet principal
    type Suggestion = {
      text: string;
      prompt: string;
    };
    
    type TopicSuggestionMap = Record<string, Suggestion[]>;
    
    const topicSuggestions: TopicSuggestionMap = {
      phishing: [
        { text: "Détecter un email de phishing", prompt: "Comment détecter un email de phishing ?" },
        { text: "Nouvelles techniques de phishing", prompt: "Quelles sont les dernières techniques de phishing ?" },
        { text: "Exercice détection de phishing", prompt: "Crée un exercice pratique sur la détection de phishing" }
      ],
      ransomware: [
        { text: "Protection contre ransomwares", prompt: "Comment se protéger contre les ransomwares ?" },
        { text: "Réponse à incident ransomware", prompt: "Quelles sont les étapes de réponse à un incident ransomware ?" },
        { text: "Exercice prévention ransomware", prompt: "Crée un exercice pratique sur la prévention des ransomwares" }
      ],
      passwords: [
        { text: "Créer des mots de passe robustes", prompt: "Comment créer des mots de passe robustes ?" },
        { text: "Importance de la MFA", prompt: "Quelle est l'importance de l'authentification à double facteur ?" },
        { text: "Quiz authentification", prompt: "Crée un quiz sur les bonnes pratiques d'authentification" }
      ],
      network: [
        { text: "Sécuriser mon Wi-Fi", prompt: "Comment sécuriser mon réseau Wi-Fi ?" },
        { text: "Avantages d'un VPN", prompt: "Quels sont les avantages d'utiliser un VPN ?" },
        { text: "Configuration routeur sécurisée", prompt: "Donne-moi une checklist pour configurer un routeur de façon sécurisée" }
      ],
      malware: [
        { text: "Fonctionnement d'un antivirus", prompt: "Comment fonctionne un antivirus ?" },
        { text: "Signes d'infection malware", prompt: "Quels sont les signes qu'un appareil est infecté par un malware ?" },
        { text: "Exercice détection de malware", prompt: "Crée un exercice pratique sur la détection et l'élimination de malwares" }
      ],
      dataProtection: [
        { text: "Chiffrer mes données sensibles", prompt: "Comment chiffrer mes données sensibles ?" },
        { text: "Stratégie de sauvegarde 3-2-1", prompt: "Explique la stratégie de sauvegarde 3-2-1" },
        { text: "Checklist RGPD", prompt: "Donne-moi une checklist RGPD pour une petite entreprise" }
      ],
      zeroTrust: [
        { text: "Principes Zero Trust", prompt: "Quels sont les principes fondamentaux du modèle Zero Trust ?" },
        { text: "Implémenter Zero Trust", prompt: "Comment implémenter une approche Zero Trust dans mon organisation ?" },
        { text: "Principe du moindre privilège", prompt: "Quels sont les avantages du principe du moindre privilège ?" }
      ],
      iot: [
        { text: "Risques des objets connectés", prompt: "Quels sont les risques de sécurité liés aux objets connectés ?" },
        { text: "Sécuriser ma maison connectée", prompt: "Comment sécuriser ma maison connectée ?" },
        { text: "Checklist sécurité IoT", prompt: "Donne-moi une checklist de sécurité pour mes appareils IoT" }
      ],
      mobile: [
        { text: "Sécuriser mon smartphone", prompt: "Comment sécuriser mon smartphone ?" },
        { text: "Politique BYOD sécurisée", prompt: "Comment mettre en place une politique BYOD sécurisée ?" },
        { text: "Dangers des applications tierces", prompt: "Quels sont les dangers des applications tierces sur mobile ?" }
      ],
      cloud: [
        { text: "Modèle de responsabilité partagée", prompt: "Explique le modèle de responsabilité partagée dans le cloud" },
        { text: "Sécuriser mes services cloud", prompt: "Comment sécuriser mes services cloud ?" },
        { text: "Risques spécifiques au cloud", prompt: "Quels sont les risques spécifiques aux environnements cloud ?" }
      ]
    };
    
    // Sélectionner les suggestions spécifiques au sujet ou utiliser les suggestions par défaut
    const specificSuggestions = mainTopic in topicSuggestions 
      ? topicSuggestions[mainTopic as keyof typeof topicSuggestions]
      : [
          { text: "Renforcer ma cybersécurité", prompt: "Comment renforcer ma cybersécurité ?" },
          { text: "Meilleures pratiques 2025", prompt: "Quelles sont les meilleures pratiques de cybersécurité en 2025 ?" },
          { text: "Exercice pratique", prompt: "Crée un exercice pratique sur la cybersécurité" }
        ];
    
    // Ajouter des suggestions génériques
    const generalSuggestions = [
      { text: "Quiz d'auto-évaluation", prompt: "Crée un quiz d'auto-évaluation sur ce sujet" },
      { text: "Exercice interactif", prompt: "Crée un exercice interactif sur ce sujet" }
    ];
    
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
      await apiRequest('/api/cyber-expert/terminate', {
        method: 'POST',
        body: JSON.stringify({ userId })
      });
      
      // Initialiser une nouvelle session
      const response = await apiRequest<{success: boolean, message: string}>('/api/cyber-expert/init', {
        method: 'POST',
        body: JSON.stringify({ userId })
      });

      if (response.success) {
        // Ajouter le message de bienvenue
        const welcomeMessage: Message = {
          id: uuidv4(),
          type: "bot",
          content: response.message,
          timestamp: Date.now()
        };
        
        setMessages([welcomeMessage]);
        
        toast({
          title: "Nouvelle session démarrée",
          description: "Votre expert cybersécurité est prêt à vous accompagner.",
          variant: "default"
        });
      }
    } catch (error) {
      console.error("Erreur lors du démarrage d'une nouvelle session:", error);
      toast({
        title: "Erreur",
        description: "Impossible de démarrer une nouvelle session. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour envoyer un message
  const sendMessage = async (messageContent?: string) => {
    const content = messageContent || inputMessage.trim();
    if (!content || isLoading) return;

    // Ajouter le message de l'utilisateur
    const userMessage: Message = {
      id: uuidv4(),
      type: "user",
      content: content,
      timestamp: Date.now()
    };
    
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
    
    const container = chatContainerRef.current;
    container.addEventListener('scroll', handleScroll);
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [messages]);

  // Auto-défilement vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    if (chatContainerRef.current && !showScrollButton) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Mettre à jour les suggestions contextuelles après chaque message
  useEffect(() => {
    if (messages.length > 0) {
      const newSuggestions = getContextualSuggestions();
      setContextualSuggestions(newSuggestions);
    }
  }, [messages]);

  // Défilement automatique vers le bas
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  return (
    <HomeLayout>
      <div className="min-h-screen bg-gradient-to-br from-[#0c1e2e] via-[#091525] to-[#0a1a28] text-white">
        <div className="container mx-auto px-4 py-6 max-w-5xl">
          <PageTitle 
            title="Apprendre en échangeant" 
            subtitle="Explorez un sujet cyber de manière personnalisée avec un expert IA"
          />
          
          {/* Navigation */}
          <div className="flex items-center gap-2 mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation('/cyber')}
              className="border-[#00b4d8]/30 text-[#00b4d8] hover:bg-[#00b4d8]/10"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour au menu cyber
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation('/')}
              className="border-[#00b4d8]/30 text-[#00b4d8] hover:bg-[#00b4d8]/10"
            >
              <Home className="mr-2 h-4 w-4" />
              Accueil
            </Button>
          </div>

          {/* Interface de chat principal */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Zone de chat */}
            <div className="lg:col-span-2">
              <Card className="bg-gradient-to-br from-[#0c1e2e] to-[#091525] border border-[#00b4d8]/30 rounded-lg shadow-lg backdrop-blur-sm h-[600px] flex flex-col">
                <CardHeader className="pb-3 border-b border-[#00b4d8]/30">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Bot className="h-6 w-6 text-[#00b4d8]" />
                      <CardTitle className="text-lg text-white">Expert Cybersécurité IA</CardTitle>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={startSession}
                        disabled={isLoading}
                        className="bg-[#00b4d8]/80 text-[#091525] px-6 py-2 h-auto text-base"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Nouvelle session
                      </Button>
                    </div>
                  </div>
                  <CardDescription className="text-[#8abee0]">
                    Posez vos questions ou demandez des conseils personnalisés en cybersécurité
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="flex-1 p-4 overflow-hidden relative">
                  {/* Zone des messages */}
                  <div 
                    ref={chatContainerRef}
                    className="h-full overflow-y-auto pr-2 space-y-4"
                    style={{ scrollbarWidth: 'thin', scrollbarColor: '#00b4d8 transparent' }}
                  >
                    {messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <Bot className="h-16 w-16 text-[#00b4d8] mb-4 opacity-50" />
                        <h3 className="text-xl font-semibold text-white mb-2">Démarrez une conversation</h3>
                        <p className="text-[#8abee0] mb-6">
                          Posez une question ou cliquez sur "Nouvelle session" pour commencer
                        </p>
                        <div className="grid grid-cols-1 gap-2 w-full max-w-md">
                          {contextualSuggestions.slice(0, 3).map((suggestion, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              className="border-[#00b4d8]/30 text-[#00b4d8] hover:bg-[#00b4d8]/10 justify-start"
                              onClick={() => sendMessage(suggestion.prompt)}
                            >
                              <LightbulbIcon className="mr-2 h-4 w-4" />
                              {suggestion.text}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${
                              message.type === "user"
                                ? "bg-[#00b4d8] text-[#091525]"
                                : "bg-[#0c1e2e] border border-[#00b4d8]/20 text-[#c3d9ee]"
                            }`}
                          >
                            {message.type === "bot" ? (
                              <div 
                                className="prose prose-invert max-w-none text-[#c3d9ee]" 
                                dangerouslySetInnerHTML={{ 
                                  __html: DOMPurify.sanitize(formatTextWithStructure(message.content)) 
                                }}
                              />
                            ) : (
                              <p className="whitespace-pre-wrap">{message.content}</p>
                            )}
                            <div className={`text-xs mt-2 opacity-70 ${
                              message.type === "user" ? "text-[#091525]" : "text-[#8abee0]"
                            }`}>
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    
                    {/* Message de chargement */}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-[#0c1e2e] border border-[#00b4d8]/20 text-[#c3d9ee] rounded-lg p-3 max-w-[80%]">
                          <div className="flex items-center space-x-2">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-[#00b4d8] rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-[#00b4d8] rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                              <div className="w-2 h-2 bg-[#00b4d8] rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                            </div>
                            <span className="text-sm text-[#8abee0]">L'expert réfléchit...</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Bouton de défilement vers le bas */}
                  {showScrollButton && (
                    <button
                      onClick={scrollToBottom}
                      className="absolute bottom-4 right-4 bg-[#00b4d8] hover:bg-[#00a0c2] text-[#091525] rounded-full p-2 shadow-lg transition-all"
                    >
                      <ChevronDown className="h-5 w-5" />
                    </button>
                  )}
                </CardContent>
                
                <CardFooter className="p-4 border-t border-[#00b4d8]/30">
                  <form onSubmit={handleSubmit} className="flex w-full gap-2">
                    <textarea
                      ref={textareaRef}
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Posez votre question sur la cybersécurité..."
                      className="flex-1 min-h-[60px] max-h-[120px] resize-none rounded-md border border-[#00b4d8]/30 bg-[#0c1e2e] px-3 py-2 text-white placeholder:text-[#8abee0] focus:outline-none focus:ring-2 focus:ring-[#00b4d8] focus:border-transparent"
                      disabled={isLoading}
                      rows={2}
                    />
                    <Button
                      type="submit"
                      disabled={!inputMessage.trim() || isLoading}
                      className="bg-[#00b4d8] hover:bg-[#00a0c2] text-[#091525] min-w-[60px] h-[60px] p-0"
                    >
                      {isLoading ? (
                        <RefreshCw className="h-5 w-5 animate-spin" />
                      ) : (
                        <Send className="h-5 w-5" />
                      )}
                    </Button>
                  </form>
                  <div className="text-xs text-[#8abee0] mt-2 w-full text-center">
                    Appuyez sur Entrée pour envoyer, Shift+Entrée pour une nouvelle ligne
                  </div>
                </CardFooter>
              </Card>
            </div>

            {/* Panneau latéral - Suggestions et conseils */}
            <div className="space-y-6">
              {/* Suggestions contextuelles */}
              <Card className="bg-gradient-to-br from-[#0c1e2e] to-[#091525] border border-[#00b4d8]/30 rounded-lg shadow-lg backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-white flex items-center gap-2">
                    <LightbulbIcon className="h-5 w-5 text-[#00b4d8]" />
                    Suggestions
                  </CardTitle>
                  <CardDescription className="text-[#8abee0]">
                    Questions rapides basées sur votre conversation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {contextualSuggestions.slice(0, 5).map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full justify-start text-left border-[#00b4d8]/30 text-[#00b4d8] hover:bg-[#00b4d8]/10 h-auto py-3 px-4"
                      onClick={() => {
                        // Si pas de messages encore, démarrer une session puis envoyer
                        if (messages.length === 0) {
                          // Envoyer le message directement qui déclenchera l'initialisation
                          sendMessage(suggestion.prompt);
                        } else {
                          sendMessage(suggestion.prompt);
                        }
                      }}
                      disabled={isLoading}
                    >
                      <div className="text-sm">{suggestion.text}</div>
                    </Button>
                  ))}
                </CardContent>
              </Card>

              {/* Conseil du jour */}
              <Card className="bg-gradient-to-br from-[#0c1e2e] to-[#091525] border border-[#00b4d8]/30 rounded-lg shadow-lg backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-white flex items-center gap-2">
                    <FileText className="h-5 w-5 text-[#00b4d8]" />
                    Conseil du jour
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-[#0c1e2e] border border-[#00b4d8]/20 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">
                      À propos de {getTopicFromIndex(Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % 8)}
                    </h4>
                    <p className="text-[#8abee0] text-sm">
                      {getMessage(Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % 8)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}

export default function ExpertLearningPage() {
  return <ExpertLearningPageContent />;
}