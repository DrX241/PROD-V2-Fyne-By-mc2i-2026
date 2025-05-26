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
import { DecisionProvider, useDecision } from "@/contexts/DecisionContext";

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
    },
    { 
      text: "Propose-moi un scénario de décision",
      prompt: "Propose-moi un scénario de décision"
    }
  ]);
  
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
  
  // Fonction pour générer des suggestions contextuelles basées sur le contenu de la conversation
  const getContextualSuggestions = () => {
    // Si la conversation est vide, retourner les suggestions par défaut
    if (messages.length === 0) {
      return [
        { text: "Comment me protéger contre le phishing ?", prompt: "Comment me protéger contre le phishing ?" },
        { text: "Explique-moi les ransomwares", prompt: "Explique-moi les ransomwares" },
        { text: "Comment sécuriser mon Wi-Fi ?", prompt: "Comment sécuriser mon Wi-Fi ?" },
        { text: "Crée un exercice pratique", prompt: "Crée un exercice pratique sur le phishing" },
        { text: "Propose-moi un scénario de décision", prompt: "Propose-moi un scénario de décision" }
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
      iot: ["iot", "objets connectés", "domotique", "smart home", "internet des objets"],
      mobile: ["mobile", "smartphone", "android", "ios", "byod", "tablette", "application"],
      cloud: ["cloud", "saas", "iaas", "paas", "aws", "azure", "gcp", "nuage"]
    };
    
    // Compter les occurrences de chaque sujet
    const topicCounts = Object.entries(topics).map(([topic, keywords]) => {
      const count = keywords.reduce((acc, keyword) => {
        const regex = new RegExp(keyword, 'gi');
        const matches = combinedContent.match(regex);
        return acc + (matches ? matches.length : 0);
      }, 0);
      
      return { topic, count };
    }).sort((a, b) => b.count - a.count);
    
    // Si aucun sujet n'est détecté, retourner les suggestions par défaut
    if (topicCounts[0].count === 0) {
      return [
        { text: "Comment me protéger contre le phishing ?", prompt: "Comment me protéger contre le phishing ?" },
        { text: "Explique-moi les ransomwares", prompt: "Explique-moi les ransomwares" },
        { text: "Comment sécuriser mon Wi-Fi ?", prompt: "Comment sécuriser mon Wi-Fi ?" },
        { text: "Crée un exercice pratique", prompt: "Crée un exercice pratique sur le phishing" },
        { text: "Propose-moi un scénario de décision", prompt: "Propose-moi un scénario de décision" }
      ];
    }
    
    // Le sujet principal détecté
    const mainTopic = topicCounts[0].topic;
    
    // Suggestions spécifiques au sujet principal
    const suggestionsMap: Record<string, Array<{text: string, prompt: string}>> = {
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
    const specificSuggestions = mainTopic in suggestionsMap 
      ? suggestionsMap[mainTopic as keyof typeof suggestionsMap]
      : [
          { text: "Renforcer ma cybersécurité", prompt: "Comment renforcer ma cybersécurité ?" },
          { text: "Meilleures pratiques 2025", prompt: "Quelles sont les meilleures pratiques de cybersécurité en 2025 ?" },
          { text: "Exercice pratique", prompt: "Crée un exercice pratique sur la cybersécurité" }
        ];
    
    // Ajouter des suggestions génériques
    const generalSuggestions = [
      { text: "Scénario de décision", prompt: "Propose-moi un scénario de décision" },
      { text: "Quiz d'auto-évaluation", prompt: "Crée un quiz d'auto-évaluation sur ce sujet" }
    ];
    
    // Combiner les suggestions
    return [...specificSuggestions, ...generalSuggestions];
  };
  
  // Fonction pour gérer une décision
  const handleDecisionMade = async (optionId: string) => {
    if (userId && decision.currentScenario) {
      await decision.submitDecision(userId, optionId);
    }
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
    
    // Réinitialiser l'état des décisions
    decision.resetDecisionState();
    
    try {
      // Terminer la session existante si nécessaire
      if (userId) {
        try {
          await apiRequest('/api/cyber-expert/terminate', {
            method: 'POST',
            body: JSON.stringify({ userId })
          });
        } catch (error) {
          console.error("Erreur lors de la terminaison de la session précédente:", error);
          // Continuer même en cas d'erreur
        }
      }
      
      // Démarrer une nouvelle session
      const response = await apiRequest<{success: boolean, userId: string, message: string}>('/api/cyber-expert/init', {
        method: 'POST'
      });

      if (response.success && response.userId) {
        // Définir le nouvel ID utilisateur
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
  
  // Composant pour les suggestions contextuelles
  const ContextualSuggestions = ({ messages, onSuggestionClick }: { 
    messages: Message[], 
    onSuggestionClick: (text: string) => void
  }) => {
    // Si la conversation est vide, afficher les suggestions par défaut
    if (messages.length === 0) {
      return (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSuggestionClick("Comment me protéger contre le phishing ?")}
            className="border-[#00b4d8]/30 bg-[#091525]/80 text-[#c3d9ee] hover:bg-[#112641] hover:text-[#00b4d8] text-xs py-1"
          >
            Comment me protéger contre le phishing ?
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSuggestionClick("Explique-moi les ransomwares")}
            className="border-[#00b4d8]/30 bg-[#091525]/80 text-[#c3d9ee] hover:bg-[#112641] hover:text-[#00b4d8] text-xs py-1"
          >
            Explique-moi les ransomwares
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSuggestionClick("Comment sécuriser mon Wi-Fi ?")}
            className="border-[#00b4d8]/30 bg-[#091525]/80 text-[#c3d9ee] hover:bg-[#112641] hover:text-[#00b4d8] text-xs py-1"
          >
            Comment sécuriser mon Wi-Fi ?
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSuggestionClick("Crée un exercice pratique sur le phishing")}
            className="border-[#00b4d8]/30 bg-[#091525]/80 text-[#c3d9ee] hover:bg-[#112641] hover:text-[#00b4d8] text-xs py-1"
          >
            Crée un exercice pratique
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSuggestionClick("Propose-moi un scénario de décision")}
            className="border-[#00b4d8]/30 bg-[#091525]/80 text-[#c3d9ee] hover:bg-[#112641] hover:text-[#00b4d8] text-xs py-1"
          >
            Propose-moi un scénario de décision
          </Button>
        </>
      );
    }
    
    // Récupérer les 3 derniers messages pour analyser le contexte
    const recentMessages = messages.slice(-3);
    const combinedContent = recentMessages.map(msg => msg.content).join(' ');
    
    // Structure pour les mots-clés par sujet
    type TopicKeywords = Record<string, string[]>;
    
    // Mots-clés pour différents sujets
    const topicKeywords: TopicKeywords = {
      phishing: ["phishing", "email", "hameçonnage", "courriel", "malveillant", "social engineering"],
      ransomware: ["ransomware", "rançongiciel", "chiffrement", "rançon", "malware"],
      passwords: ["mot de passe", "password", "authentification", "mfa", "2fa", "double facteur"],
      network: ["réseau", "wifi", "vpn", "firewall", "pare-feu", "routeur", "dns"],
      malware: ["malware", "virus", "logiciel malveillant", "trojan", "cheval de troie", "spyware"],
      dataProtection: ["données", "sauvegarde", "backup", "chiffrement", "rgpd", "confidentialité"],
      zeroTrust: ["zero trust", "confiance zéro", "identité", "iam", "privilèges", "moindre privilège"],
      iot: ["iot", "objets connectés", "domotique", "smart home", "internet des objets"],
      mobile: ["mobile", "smartphone", "android", "ios", "byod", "tablette", "application"],
      cloud: ["cloud", "saas", "iaas", "paas", "aws", "azure", "gcp", "nuage"]
    };
    
    // Type pour les scores de sujet
    type TopicScore = {
      topic: string;
      count: number;
    };
    
    // Détecter les sujets dans la conversation
    const topicScores: TopicScore[] = Object.entries(topicKeywords).map(([topic, keywords]) => {
      const count = keywords.reduce((acc, keyword) => {
        const regex = new RegExp(keyword, 'gi');
        const matches = combinedContent.match(regex);
        return acc + (matches ? matches.length : 0);
      }, 0);
      return { topic, count };
    }).sort((a, b) => b.count - a.count);
    
    // Si aucun sujet n'est détecté clairement, utiliser les suggestions génériques
    if (topicScores[0].count === 0) {
      return (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSuggestionClick("Comment renforcer ma cybersécurité ?")}
            className="border-[#00b4d8]/30 bg-[#091525]/80 text-[#c3d9ee] hover:bg-[#112641] hover:text-[#00b4d8] text-xs py-1"
          >
            Comment renforcer ma cybersécurité ?
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSuggestionClick("Quelles sont les meilleures pratiques de cybersécurité en 2025 ?")}
            className="border-[#00b4d8]/30 bg-[#091525]/80 text-[#c3d9ee] hover:bg-[#112641] hover:text-[#00b4d8] text-xs py-1"
          >
            Meilleures pratiques 2025
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSuggestionClick("Crée un exercice pratique sur la cybersécurité")}
            className="border-[#00b4d8]/30 bg-[#091525]/80 text-[#c3d9ee] hover:bg-[#112641] hover:text-[#00b4d8] text-xs py-1"
          >
            Exercice pratique
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSuggestionClick("Propose-moi un scénario de décision")}
            className="border-[#00b4d8]/30 bg-[#091525]/80 text-[#c3d9ee] hover:bg-[#112641] hover:text-[#00b4d8] text-xs py-1"
          >
            Scénario de décision
          </Button>

        </>
      );
    }
    
    // Obtenir le sujet principal
    const mainTopic = topicScores[0].topic;
    
    // Type pour les suggestions
    type Suggestion = {
      text: string;
      prompt: string;
    };
    
    // Type pour la map des suggestions par sujet
    type TopicSuggestionMap = Record<string, Suggestion[]>;
    
    // Suggestions spécifiques pour chaque sujet
    const topicSuggestions: TopicSuggestionMap = {
      phishing: [
        { text: "Détecter un email de phishing", prompt: "Comment détecter un email de phishing ?" },
        { text: "Techniques de phishing récentes", prompt: "Quelles sont les dernières techniques de phishing ?" },
        { text: "Exercice détection de phishing", prompt: "Crée un exercice pratique sur la détection de phishing" }
      ],
      ransomware: [
        { text: "Protection contre ransomwares", prompt: "Comment se protéger contre les ransomwares ?" },
        { text: "Réponse à incident ransomware", prompt: "Quelles sont les étapes de réponse à un incident ransomware ?" },
        { text: "Cas récents de ransomware", prompt: "Quels sont les cas récents de ransomware en 2025 ?" }
      ],
      passwords: [
        { text: "Mots de passe robustes", prompt: "Comment créer des mots de passe robustes ?" },
        { text: "Importance de la MFA", prompt: "Quelle est l'importance de l'authentification à double facteur ?" },
        { text: "Gestionnaires de mots de passe", prompt: "Quels sont les meilleurs gestionnaires de mots de passe ?" }
      ],
      network: [
        { text: "Sécuriser mon Wi-Fi", prompt: "Comment sécuriser mon réseau Wi-Fi ?" },
        { text: "Avantages d'un VPN", prompt: "Quels sont les avantages d'utiliser un VPN ?" },
        { text: "Configuration routeur sécurisée", prompt: "Comment configurer un routeur de façon sécurisée ?" }
      ],
      malware: [
        { text: "Fonctionnement antivirus", prompt: "Comment fonctionne un antivirus ?" },
        { text: "Signes d'infection malware", prompt: "Quels sont les signes d'infection par un malware ?" },
        { text: "Se protéger des malwares", prompt: "Comment se protéger efficacement contre les malwares ?" }
      ],
      dataProtection: [
        { text: "Chiffrer mes données", prompt: "Comment chiffrer mes données sensibles ?" },
        { text: "Stratégie de sauvegarde 3-2-1", prompt: "Explique la stratégie de sauvegarde 3-2-1" },
        { text: "Conformité RGPD", prompt: "Comment assurer la conformité RGPD dans mon organisation ?" }
      ],
      zeroTrust: [
        { text: "Principes Zero Trust", prompt: "Quels sont les principes du modèle Zero Trust ?" },
        { text: "Implémenter Zero Trust", prompt: "Comment implémenter une approche Zero Trust ?" },
        { text: "Moindre privilège", prompt: "Explique le principe du moindre privilège" }
      ],
      iot: [
        { text: "Risques des objets connectés", prompt: "Quels sont les risques liés aux objets connectés ?" },
        { text: "Sécuriser maison connectée", prompt: "Comment sécuriser ma maison connectée ?" },
        { text: "Standards sécurité IoT", prompt: "Quels sont les standards de sécurité pour l'IoT ?" }
      ],
      mobile: [
        { text: "Sécuriser mon smartphone", prompt: "Comment sécuriser mon smartphone ?" },
        { text: "Politique BYOD", prompt: "Comment mettre en place une politique BYOD sécurisée ?" },
        { text: "Risques applications mobiles", prompt: "Quels sont les risques liés aux applications mobiles ?" }
      ],
      cloud: [
        { text: "Responsabilité partagée cloud", prompt: "Explique le modèle de responsabilité partagée dans le cloud" },
        { text: "Sécuriser services cloud", prompt: "Comment sécuriser mes services cloud ?" },
        { text: "Cloud vs On-premise", prompt: "Quelles sont les différences de sécurité entre cloud et on-premise ?" }
      ]
    };
    
    // Suggestions par défaut si le sujet n'est pas dans notre map
    const defaultSuggestions: Suggestion[] = [
      { text: "Approfondir ce sujet", prompt: "Je voudrais approfondir ce sujet" },
      { text: "Cas concrets", prompt: "Donne-moi des exemples concrets sur ce sujet" },
      { text: "Exercice pratique", prompt: "Crée un exercice pratique sur ce sujet" }
    ];
    
    // Suggestions communes à tous les sujets
    const commonSuggestions: Suggestion[] = [
      { text: "Scénario de décision", prompt: `Propose-moi un scénario de décision sur ${mainTopic}` }
    ];
    
    // Sélectionner les suggestions spécifiques au sujet
    const specificSuggestions = topicSuggestions[mainTopic] || defaultSuggestions;
    
    // Combiner les suggestions spécifiques et communes
    const allSuggestions = [...specificSuggestions, ...commonSuggestions];
    
    // Afficher les suggestions
    return (
      <>
        {allSuggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => onSuggestionClick(suggestion.prompt)}
            className="border-[#00b4d8]/30 bg-[#091525]/80 text-[#c3d9ee] hover:bg-[#112641] hover:text-[#00b4d8] text-xs py-1"
          >
            {suggestion.text}
          </Button>
        ))}
      </>
    );
  };

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
        setLocation('/cyber/sas-academie');
      }
    } else {
      // Si aucune session n'est active, naviguer directement
      setLocation('/cyber/sas-academie');
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
          
          <div className="flex flex-col items-center justify-center h-full pt-12 w-full px-6">
            {!isSessionActive && !sessionSummary ? (
              // Page d'accueil - style terminal de cybersécurité
              <Card className="w-full max-w-5xl bg-[#091525] border border-[#00b4d8]/30 text-white shadow-[0_0_20px_rgba(0,180,216,0.15)]">
                <CardHeader className="border-b border-[#00b4d8]/20">
                  <CardTitle className="font-mono text-xl text-[#00b4d8] flex items-center gap-2">
                    <Bot className="h-6 w-6" />
                    EXPERT CYBERSÉCURITÉ - INTERFACE DE DIALOGUE
                  </CardTitle>
                  <CardDescription className="text-[#c3d9ee]/70 font-mono text-base">
                    VERSION 2.5.3 | ÉTAT: <span className="text-[#4cc9f0]">PRÊT</span> | <span className="text-[#00b4d8]">IA adaptative</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="py-8 space-y-6 text-[#c3d9ee]">
                  <div className="font-mono text-base border-l-2 border-[#00b4d8]/50 pl-6 py-2">
                    <p>Bienvenue sur le module <span className="text-[#00b4d8] font-semibold">Apprentissage conversationnel de FYNE</span>.</p>
                    <p className="mt-2">Cette interface vous permet d'interagir avec un expert en cybersécurité pour explorer des concepts adaptés à votre niveau et à vos besoins spécifiques.</p>
                  </div>
                  
                  {/* Topics suggérés */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div 
                      className="bg-[#121e2e] p-4 rounded-md border border-[#00b4d8]/30 hover:border-[#00b4d8]/70 hover:shadow-[0_0_15px_rgba(0,180,216,0.2)] transition-all cursor-pointer group"
                      onClick={() => {
                        setInputMessage("Je voudrais apprendre à détecter et me protéger contre le phishing");
                        startSession();
                      }}
                    >
                      <div className="flex items-center mb-2">
                        <div className="w-8 h-8 bg-[#091525] rounded-full flex items-center justify-center border border-[#00b4d8]/40 mr-3 group-hover:bg-[#00b4d8]/20 transition-all">
                          <svg className="h-4 w-4 text-[#00b4d8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <h3 className="font-mono font-medium text-[#00b4d8]">Sécurité Email</h3>
                      </div>
                      <p className="text-sm text-[#c3d9ee]/80 pl-11">Apprenez à repérer et éviter les tentatives de phishing et les arnaques par email</p>
                    </div>
                    
                    <div 
                      className="bg-[#121e2e] p-4 rounded-md border border-[#00b4d8]/30 hover:border-[#00b4d8]/70 hover:shadow-[0_0_15px_rgba(0,180,216,0.2)] transition-all cursor-pointer group"
                      onClick={() => {
                        setInputMessage("Explique-moi ce qu'est un ransomware et comment m'en protéger");
                        startSession();
                      }}
                    >
                      <div className="flex items-center mb-2">
                        <div className="w-8 h-8 bg-[#091525] rounded-full flex items-center justify-center border border-[#00b4d8]/40 mr-3 group-hover:bg-[#00b4d8]/20 transition-all">
                          <svg className="h-4 w-4 text-[#00b4d8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                          </svg>
                        </div>
                        <h3 className="font-mono font-medium text-[#00b4d8]">Ransomwares</h3>
                      </div>
                      <p className="text-sm text-[#c3d9ee]/80 pl-11">Comprendre les ransomwares et les stratégies de protection des données</p>
                    </div>
                    
                    <div 
                      className="bg-[#121e2e] p-4 rounded-md border border-[#00b4d8]/30 hover:border-[#00b4d8]/70 hover:shadow-[0_0_15px_rgba(0,180,216,0.2)] transition-all cursor-pointer group"
                      onClick={() => {
                        setInputMessage("Je souhaite découvrir les bonnes pratiques de sécurité pour mes appareils personnels");
                        startSession();
                      }}
                    >
                      <div className="flex items-center mb-2">
                        <div className="w-8 h-8 bg-[#091525] rounded-full flex items-center justify-center border border-[#00b4d8]/40 mr-3 group-hover:bg-[#00b4d8]/20 transition-all">
                          <svg className="h-4 w-4 text-[#00b4d8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                        <h3 className="font-mono font-medium text-[#00b4d8]">Protection personnelle</h3>
                      </div>
                      <p className="text-sm text-[#c3d9ee]/80 pl-11">Sécurisez vos appareils et données personnelles au quotidien</p>
                    </div>
                  </div>
                  
                  <div className="bg-[#121e2e] p-6 rounded-md border border-[#00b4d8]/30 font-mono text-base space-y-4">
                    <p className="text-[#e63946] font-semibold">► FONCTIONNALITÉS:</p>
                    <ul className="space-y-3 pl-6 list-disc text-[#c3d9ee]">
                      <li>Dialogue avec un expert en cybersécurité pour identifier vos besoins d'apprentissage</li>
                      <li>Contenu personnalisé adapté à votre niveau et votre domaine professionnel</li>
                      <li>Formats d'apprentissage flexibles (académiques, simulations, défis)</li>
                      <li>Références actualisées aux standards et bonnes pratiques de l'ANSSI et autres organismes</li>
                      <li>Mode décision avec scénarios complexes et choix stratégiques</li>
                    </ul>
                  </div>
                  
                  <div className="text-center text-sm text-[#c3d9ee]/70 italic">
                    <p>Les suggestions ci-dessus sont des points de départ, mais n'hésitez pas à poser vos propres questions!</p>
                  </div>
                </CardContent>
                <CardFooter className="border-t border-[#00b4d8]/20 pt-6 pb-4 flex justify-center">
                  <Button 
                    onClick={startSession}
                    disabled={isLoading}
                    className="bg-[#00b4d8] hover:bg-[#00b4d8]/80 text-[#091525] font-mono text-base px-8 py-6 h-auto"
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
                {(
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
                
                    {/* Zone de chat avec messages et guides contextuels */}
                    <div 
                      ref={chatContainerRef}
                      className="flex-1 overflow-y-auto custom-scrollbar cyber-expert bg-[#091525]/80 border border-[#00b4d8]/30 rounded-none shadow-[0_0_20px_rgba(0,180,216,0.15)] h-[calc(100vh-350px)] min-h-[450px]"
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
                            SUGGESTIONS CONTEXTUELLES:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {/* Analyse du contexte pour générer des suggestions pertinentes */}
                            {(() => {
                              // Si la conversation est vide, afficher les suggestions par défaut
                              if (messages.length === 0) {
                                return (
                                  <>
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
                                  </>
                                );
                              }
                              
                              // Récupérer les 5 derniers messages pour analyser le contexte (au lieu de 3)
                              const recentMessages = messages.slice(-5);
                              
                              // Pondérer les messages en fonction de leur récence (les plus récents ont plus de poids)
                              let combinedContent = '';
                              recentMessages.forEach((msg, index) => {
                                // Plus l'index est élevé, plus le message est récent
                                const weight = index + 1;
                                // Répéter le contenu en fonction du poids pour augmenter son importance
                                for (let i = 0; i < weight; i++) {
                                  combinedContent += ' ' + msg.content;
                                }
                              });
                              
                              // Mots-clés enrichis pour différents sujets
                              const topicKeywords = {
                                phishing: ["phishing", "email", "hameçonnage", "courriel", "malveillant", "social engineering", "ingénierie sociale", "usurpation", "spoofing", "fraude", "arnaque", "spear phishing", "whaling", "smishing", "vishing", "spam"],
                                ransomware: ["ransomware", "rançongiciel", "chiffrement", "rançon", "malware", "cryptovirus", "cryptolocker", "décryptage", "otage", "extorsion", "wannacry", "petya", "notpetya", "ryuk", "lockbit", "conti"],
                                passwords: ["mot de passe", "password", "authentification", "mfa", "2fa", "double facteur", "biométrie", "phrase secrète", "gestionnaire", "authentificateur", "hash", "passphrase", "token", "sécurité des comptes", "complexité"],
                                network: ["réseau", "wifi", "vpn", "firewall", "pare-feu", "routeur", "dns", "wan", "lan", "nat", "dmz", "proxy", "réseau privé", "filtrage", "segmentation", "vlan", "dhcp", "wpa", "wpa2", "wpa3", "wep", "man in the middle", "mitm"],
                                malware: ["malware", "virus", "logiciel malveillant", "trojan", "cheval de troie", "spyware", "adware", "rootkit", "worm", "ver informatique", "backdoor", "porte dérobée", "keylogger", "botnet", "cryptominer", "miner", "infection"],
                                dataProtection: ["données", "sauvegarde", "backup", "chiffrement", "rgpd", "confidentialité", "fuite de données", "data breach", "data leak", "exfiltration", "anonymisation", "pseudonymisation", "cryptage", "pii", "données personnelles", "privacy", "dcp", "droit à l'oubli"],
                                zeroTrust: ["zero trust", "confiance zéro", "identité", "iam", "privilèges", "moindre privilège", "least privilege", "pam", "contrôle d'accès", "rbac", "abac", "mfa", "microsegmentation", "vérification continue", "contexte", "sase"],
                                iot: ["iot", "objets connectés", "domotique", "smart home", "internet des objets", "appareil intelligent", "smart device", "smart tv", "connected", "connectés", "maison connectée", "capteurs", "caméra", "alexa", "siri", "assistant vocal"],
                                mobile: ["mobile", "smartphone", "android", "ios", "byod", "tablette", "application", "apps", "app store", "play store", "mdm", "gestion des appareils", "mobile device management", "emm", "uem", "app permissions", "app permissions", "applications mobiles", "paiement mobile"],
                                cloud: ["cloud", "saas", "iaas", "paas", "aws", "azure", "gcp", "nuage", "fournisseur cloud", "cloud provider", "multicloud", "hybride", "serverless", "conteneur", "docker", "kubernetes", "k8s", "microservices", "virtualisation", "vm", "instance"],
                                threat: ["menaces", "apt", "threat", "menace avancée", "persistante", "attaque", "cible", "ciblé", "targeted", "0-day", "zero day", "jour zéro", "exploit", "vulnérabilité", "cve", "surface d'attaque", "vecteur d'attaque", "kill chain", "pentest", "test d'intrusion"],
                                governance: ["gouvernance", "conformité", "compliance", "audit", "norme", "standard", "iso27001", "iso 27001", "iso", "nist", "anssi", "framework", "cadre", "politique", "policy", "procédure", "directive", "règlement", "règle", "gestion des risques"],
                                incidentResponse: ["incident", "crise", "gestion de crise", "forensics", "analyse forensique", "investigation", "détection", "soc", "sirp", "siem", "soar", "csirt", "cert", "cirt", "réponse", "plan de continuité", "pca", "pra", "disaster recovery"]
                              };
                              
                              // Détecter les sujets dans la conversation
                              const topicScores = Object.entries(topicKeywords).map(([topic, keywords]) => {
                                const count = keywords.reduce((acc, keyword) => {
                                  const regex = new RegExp(keyword, 'gi');
                                  const matches = combinedContent.match(regex);
                                  return acc + (matches ? matches.length : 0);
                                }, 0);
                                return { topic, count };
                              }).sort((a, b) => b.count - a.count);
                              
                              // Si aucun sujet n'est détecté clairement, utiliser les suggestions par défaut
                              if (topicScores[0].count === 0) {
                                return (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setInputMessage("Comment renforcer ma cybersécurité ?")}
                                      className="border-[#00b4d8]/30 bg-[#091525]/80 text-[#c3d9ee] hover:bg-[#112641] hover:text-[#00b4d8] text-xs py-1"
                                    >
                                      Comment renforcer ma cybersécurité ?
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setInputMessage("Quelles sont les meilleures pratiques de cybersécurité en 2025 ?")}
                                      className="border-[#00b4d8]/30 bg-[#091525]/80 text-[#c3d9ee] hover:bg-[#112641] hover:text-[#00b4d8] text-xs py-1"
                                    >
                                      Meilleures pratiques 2025
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setInputMessage("Crée un exercice pratique sur la cybersécurité")}
                                      className="border-[#00b4d8]/30 bg-[#091525]/80 text-[#c3d9ee] hover:bg-[#112641] hover:text-[#00b4d8] text-xs py-1"
                                    >
                                      Exercice pratique
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setInputMessage("Propose-moi un scénario de décision")}
                                      className="border-[#00b4d8]/30 bg-[#091525]/80 text-[#c3d9ee] hover:bg-[#112641] hover:text-[#00b4d8] text-xs py-1"
                                    >
                                      Scénario de décision
                                    </Button>
                                  </>
                                );
                              }
                              
                              // Obtenir le sujet principal
                              const mainTopic = topicScores[0].topic;
                              
                              // Suggestions spécifiques pour chaque sujet
                              const topicSuggestions: Record<string, Array<{text: string, prompt: string}>> = {
                                phishing: [
                                  { text: "Détecter un email de phishing", prompt: "Comment détecter un email de phishing ?" },
                                  { text: "Techniques de phishing récentes", prompt: "Quelles sont les dernières techniques de phishing ?" },
                                  { text: "Exercice détection de phishing", prompt: "Crée un exercice pratique sur la détection de phishing" }
                                ],
                                ransomware: [
                                  { text: "Protection contre ransomwares", prompt: "Comment se protéger contre les ransomwares ?" },
                                  { text: "Réponse à incident ransomware", prompt: "Quelles sont les étapes de réponse à un incident ransomware ?" },
                                  { text: "Cas récents de ransomware", prompt: "Quels sont les cas récents de ransomware en 2025 ?" }
                                ],
                                passwords: [
                                  { text: "Mots de passe robustes", prompt: "Comment créer des mots de passe robustes ?" },
                                  { text: "Importance de la MFA", prompt: "Quelle est l'importance de l'authentification à double facteur ?" },
                                  { text: "Gestionnaires de mots de passe", prompt: "Quels sont les meilleurs gestionnaires de mots de passe ?" }
                                ],
                                network: [
                                  { text: "Sécuriser mon Wi-Fi", prompt: "Comment sécuriser mon réseau Wi-Fi ?" },
                                  { text: "Avantages d'un VPN", prompt: "Quels sont les avantages d'utiliser un VPN ?" },
                                  { text: "Configuration routeur sécurisée", prompt: "Comment configurer un routeur de façon sécurisée ?" }
                                ],
                                malware: [
                                  { text: "Fonctionnement antivirus", prompt: "Comment fonctionne un antivirus ?" },
                                  { text: "Signes d'infection malware", prompt: "Quels sont les signes d'infection par un malware ?" },
                                  { text: "Se protéger des malwares", prompt: "Comment se protéger efficacement contre les malwares ?" }
                                ],
                                dataProtection: [
                                  { text: "Chiffrer mes données", prompt: "Comment chiffrer mes données sensibles ?" },
                                  { text: "Stratégie de sauvegarde 3-2-1", prompt: "Explique la stratégie de sauvegarde 3-2-1" },
                                  { text: "Conformité RGPD", prompt: "Comment assurer la conformité RGPD dans mon organisation ?" }
                                ],
                                zeroTrust: [
                                  { text: "Principes Zero Trust", prompt: "Quels sont les principes du modèle Zero Trust ?" },
                                  { text: "Implémenter Zero Trust", prompt: "Comment implémenter une approche Zero Trust ?" },
                                  { text: "Moindre privilège", prompt: "Explique le principe du moindre privilège" }
                                ],
                                iot: [
                                  { text: "Risques des objets connectés", prompt: "Quels sont les risques liés aux objets connectés ?" },
                                  { text: "Sécuriser maison connectée", prompt: "Comment sécuriser ma maison connectée ?" },
                                  { text: "Standards sécurité IoT", prompt: "Quels sont les standards de sécurité pour l'IoT ?" }
                                ],
                                mobile: [
                                  { text: "Sécuriser mon smartphone", prompt: "Comment sécuriser mon smartphone ?" },
                                  { text: "Politique BYOD", prompt: "Comment mettre en place une politique BYOD sécurisée ?" },
                                  { text: "Risques applications mobiles", prompt: "Quels sont les risques liés aux applications mobiles ?" }
                                ],
                                cloud: [
                                  { text: "Responsabilité partagée cloud", prompt: "Explique le modèle de responsabilité partagée dans le cloud" },
                                  { text: "Sécuriser services cloud", prompt: "Comment sécuriser mes services cloud ?" },
                                  { text: "Cloud vs On-premise", prompt: "Quelles sont les différences de sécurité entre cloud et on-premise ?" }
                                ],
                                // Nouvelles catégories ajoutées
                                threat: [
                                  { text: "APT et menaces avancées", prompt: "Explique ce qu'est une menace persistante avancée (APT)" },
                                  { text: "Vulnérabilités zero-day", prompt: "Comment se protéger contre les vulnérabilités zero-day ?" },
                                  { text: "Tests de pénétration", prompt: "Pourquoi réaliser des tests de pénétration réguliers ?" }
                                ],
                                governance: [
                                  { text: "Normes ISO 27001", prompt: "Que couvre la norme ISO 27001 ?" },
                                  { text: "Cadre NIST", prompt: "Explique le cadre de cybersécurité NIST" },
                                  { text: "Politiques de sécurité", prompt: "Comment élaborer une politique de sécurité efficace ?" }
                                ],
                                incidentResponse: [
                                  { text: "Plan de réponse aux incidents", prompt: "Comment élaborer un plan de réponse aux incidents ?" },
                                  { text: "Analyse forensique", prompt: "Quelles sont les bases de l'analyse forensique ?" },
                                  { text: "Plan de continuité d'activité", prompt: "Comment créer un plan de continuité d'activité (PCA) ?" }
                                ]
                              };
                              
                              // Suggestions communes à tous les sujets
                              const commonSuggestions = [
                                { text: "Scénario de décision", prompt: "Propose-moi un scénario de décision sur le sujet qu'on traite actuellement" },
                                { text: "Quiz sur ce sujet", prompt: "Crée un quiz d'auto-évaluation sur le sujet qu'on traite actuellement" }
                              ];
                              
                              // Sélectionner les suggestions spécifiques au sujet
                              const specificSuggestions = mainTopic in topicSuggestions 
                                ? topicSuggestions[mainTopic as keyof typeof topicSuggestions] 
                                : [
                                    { text: "Approfondir ce sujet", prompt: "Je voudrais approfondir ce sujet" },
                                    { text: "Cas concrets", prompt: "Donne-moi des exemples concrets sur ce sujet" },
                                    { text: "Exercice pratique", prompt: "Crée un exercice pratique sur ce sujet" }
                                  ];
                              
                              // Combiner les suggestions spécifiques et communes
                              const allSuggestions = [...specificSuggestions, ...commonSuggestions];
                              
                              // Afficher les suggestions
                              return (
                                <>
                                  {allSuggestions.map((suggestion, index) => (
                                    <Button
                                      key={index}
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setInputMessage(suggestion.prompt)}
                                      className="border-[#00b4d8]/30 bg-[#091525]/80 text-[#c3d9ee] hover:bg-[#112641] hover:text-[#00b4d8] text-xs py-1"
                                    >
                                      {suggestion.text}
                                    </Button>
                                  ))}
                                </>
                              );
                            })()}
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
                                  onClick={() => {
                                    setInputMessage("Crée un exercice pratique interactif sur la cybersécurité");
                                    // Utiliser un léger délai pour s'assurer que l'état est mis à jour
                                    setTimeout(() => {
                                      const tmpMessage = "Crée un exercice pratique interactif sur la cybersécurité";
                                      
                                      // Créer un message utilisateur
                                      const userMessage: Message = {
                                        id: uuidv4(),
                                        type: "user",
                                        content: tmpMessage,
                                        timestamp: Date.now()
                                      };
                                      
                                      // Ajouter à la liste des messages
                                      setMessages(prev => [...prev, userMessage]);
                                      
                                      // Vider le champ de saisie
                                      setInputMessage("");
                                      
                                      setIsLoading(true);
                                      
                                      // Envoyer la requête API
                                      apiRequest<{success: boolean, message: string, sessionStatus: SessionStatus}>('/api/cyber-expert/message', {
                                        method: 'POST',
                                        body: JSON.stringify({
                                          userId,
                                          message: tmpMessage
                                        })
                                      })
                                      .then(response => {
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
                                        }
                                      })
                                      .catch(error => {
                                        console.error("Erreur lors de l'envoi du message:", error);
                                        toast({
                                          title: "Erreur",
                                          description: "Impossible de lancer l'exercice pratique. Veuillez réessayer.",
                                          variant: "destructive"
                                        });
                                      })
                                      .finally(() => {
                                        setIsLoading(false);
                                      });
                                    }, 50);
                                  }}
                                >
                                  <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                                  Exercice pratique
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