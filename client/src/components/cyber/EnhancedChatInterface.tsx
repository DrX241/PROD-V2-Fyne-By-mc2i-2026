import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send, Lightbulb, ChevronRight, User, Bot, Clock, Code, Shield, BarChart3, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Form, FormControl, FormField } from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { motion, AnimatePresence } from "framer-motion";

// Schéma de validation pour le message
const messageSchema = z.object({
  message: z.string().min(1, {
    message: "Le message ne peut pas être vide.",
  }),
});

// Type pour le message
type MessageValues = z.infer<typeof messageSchema>;

// Type pour une suggestion de réponse
type Suggestion = {
  text: string;
  approach: "technique" | "analytique" | "stratégique";
  skillImpact: {
    primary: "technical" | "analytical" | "strategic" | "communication";
    secondary: "technical" | "analytical" | "strategic" | "communication";
  };
};

// Props pour le composant ChatInterface
interface EnhancedChatInterfaceProps {
  messages?: any[];
  onMessagesUpdate?: (messages: any[]) => void;
  onSuggestionSelect?: (suggestion: Suggestion) => void;
  generateSuggestions?: (currentMessage: string) => Promise<Suggestion[]>;
  environment?: string;
  currentNPC?: string;
  timeRemaining?: string;
  skillAssessment?: {
    technical: number;
    analytical: number;
    strategic: number;
    communication: number;
  };
  showSuggestions?: boolean;
}

export default function EnhancedChatInterface({ 
  messages: externalMessages,
  onMessagesUpdate, 
  onSuggestionSelect,
  generateSuggestions,
  environment = "command-center",
  currentNPC = "Sarah Chen",
  timeRemaining = "10:00",
  skillAssessment,
  showSuggestions: displaySuggestions = true
}: EnhancedChatInterfaceProps) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<any[]>(externalMessages || []);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(displaySuggestions);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const [activeApproach, setActiveApproach] = useState<string>("all");

  // Configuration du formulaire
  const form = useForm<MessageValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      message: "",
    },
  });

  // Récupérer le premier message de l'IA au chargement
  useEffect(() => {
    getInitialMessage();
  }, []);

  // Effet pour mettre à jour les messages parents sans défilement automatique
  useEffect(() => {
    // Mettre à jour le parent si la fonction de rappel est fournie
    if (onMessagesUpdate) {
      onMessagesUpdate(messages);
    }
  }, [messages, onMessagesUpdate]);

  // Récupérer des suggestions lorsque le dernier message est de l'IA
  useEffect(() => {
    if (!generateSuggestions || messages.length === 0) return;
    
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.type === 'bot') {
      fetchSuggestions(lastMessage.content);
    } else {
      // Cacher les suggestions quand l'utilisateur a déjà répondu
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [messages, generateSuggestions]);

  // Récupérer le message initial de l'IA
  const getInitialMessage = async () => {
    setIsLoading(true);
    try {
      // Utiliser l'environnement pour adapter le message initial
      let initialContent = "";
      let contactName = "";
      
      switch(environment) {
        case "command-center":
          initialContent = "Bienvenue au Centre de Commandement. Je suis Sarah Chen, Responsable SOC. Ici, nous coordonnons toutes les opérations de cybersécurité de l'organisation. Nous surveillons constamment les menaces et dirigeons les équipes de réponse. Comment puis-je vous aider dans votre mission aujourd'hui ?";
          contactName = "Sarah Chen";
          break;
        case "analysis-lab":
          initialContent = "Bienvenue au Laboratoire d'Analyse. Je suis Alex Dupont, Expert Forensique. Notre laboratoire est équipé des outils les plus avancés pour l'analyse des incidents et la recherche de vulnérabilités. Nous avons plusieurs cas en cours d'investigation. Sur quel type d'analyse souhaitez-vous vous concentrer ?";
          contactName = "Alex Dupont";
          break;
        case "crisis-room":
          initialContent = "Bienvenue en Salle de Crise. Je suis Malik Johnson, Coordinateur des Incidents de Sécurité. Nous sommes actuellement en alerte suite à la détection d'activités suspectes sur notre réseau. Nous pensons qu'une attaque pourrait être en cours. Quelle serait votre première action dans cette situation ?";
          contactName = "Malik Johnson";
          break;
        default:
          initialContent = "Bienvenue dans notre centre de cybersécurité. Je suis votre guide pour cette session. Comment puis-je vous aider aujourd'hui ?";
          contactName = "Agent IA";
      }
      
      const initialMessage = {
        id: Date.now().toString(),
        type: 'bot',
        content: initialContent,
        timestamp: new Date().toISOString(),
        contactName: contactName
      };
      
      setMessages([initialMessage]);
      
      // Génération de suggestions pour ce message initial
      if (generateSuggestions) {
        fetchSuggestions(initialContent);
      }
      
    } catch (error) {
      console.error("Erreur lors de la récupération du message initial:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'initialiser la conversation. Veuillez réessayer.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Récupérer des suggestions pour un message donné
  const fetchSuggestions = async (currentMessage: string) => {
    if (!generateSuggestions) return;
    
    try {
      const suggestionsList = await generateSuggestions(currentMessage);
      console.log("Suggestions reçues:", suggestionsList);
      // S'assurer que les suggestions sont valides et non vides
      if (suggestionsList && Array.isArray(suggestionsList) && suggestionsList.length > 0) {
        setSuggestions(suggestionsList);
        setShowSuggestions(true);
      } else {
        // Utiliser des suggestions de secours si l'API ne retourne pas de suggestions valides
        const fallbackSuggestions: Suggestion[] = [
          {
            text: "Je vais d'abord analyser la structure du réseau pour identifier les vecteurs d'attaque potentiels et ensuite déterminer les mesures de protection adaptées.",
            approach: "analytique",
            skillImpact: { primary: "analytical", secondary: "technical" }
          },
          {
            text: "Nous devrions immédiatement isoler les systèmes critiques et lancer une analyse des logs pour identifier l'origine de la compromission.",
            approach: "technique",
            skillImpact: { primary: "technical", secondary: "strategic" }
          },
          {
            text: "Je propose de réunir l'équipe de gestion de crise et d'établir un plan de communication transparent tout en mobilisant nos ressources techniques.",
            approach: "stratégique",
            skillImpact: { primary: "strategic", secondary: "communication" }
          }
        ];
        setSuggestions(fallbackSuggestions);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error("Erreur lors de la génération des suggestions:", error);
      // Utiliser des suggestions de secours en cas d'erreur
      const fallbackSuggestions: Suggestion[] = [
        {
          text: "Je vais d'abord analyser la structure du réseau pour identifier les vecteurs d'attaque potentiels et ensuite déterminer les mesures de protection adaptées.",
          approach: "analytique",
          skillImpact: { primary: "analytical", secondary: "technical" }
        },
        {
          text: "Nous devrions immédiatement isoler les systèmes critiques et lancer une analyse des logs pour identifier l'origine de la compromission.",
          approach: "technique",
          skillImpact: { primary: "technical", secondary: "strategic" }
        },
        {
          text: "Je propose de réunir l'équipe de gestion de crise et d'établir un plan de communication transparent tout en mobilisant nos ressources techniques.",
          approach: "stratégique",
          skillImpact: { primary: "strategic", secondary: "communication" }
        }
      ];
      setSuggestions(fallbackSuggestions);
      setShowSuggestions(true);
    }
  };

  // Envoyer un message utilisateur et obtenir une réponse
  const sendMessage = async (values: MessageValues) => {
    if (isLoading) return;

    // Créer le message utilisateur
    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: values.message,
      timestamp: new Date().toISOString()
    };

    // Ajouter le message à la liste et réinitialiser le formulaire
    setMessages(prevMessages => [...prevMessages, userMessage]);
    form.reset();
    
    // Cacher les suggestions
    setShowSuggestions(false);

    // Simuler une réponse (à remplacer par un appel API réel)
    setIsLoading(true);
    
    try {
      // Simuler un délai d'API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Déterminer le type de réponse basé sur l'environnement et le message
      let botResponseContent = "";
      let contactName = "";
      
      switch(environment) {
        case "command-center":
          // Réponses orientées coordination et stratégie
          if (values.message.toLowerCase().includes("menace") || values.message.toLowerCase().includes("attaque")) {
            botResponseContent = "Vous avez raison de vous préoccuper des menaces actuelles. Nos analyses récentes montrent une augmentation de 37% des tentatives d'intrusion ciblant notre secteur. Notre priorité devrait être de renforcer notre système de détection et d'établir un protocole de réponse rapide. Quelles mesures suggérez-vous pour améliorer notre capacité de détection précoce ?";
            contactName = "Sarah Chen";
          } else if (values.message.toLowerCase().includes("équipe") || values.message.toLowerCase().includes("personnel")) {
            botResponseContent = "La gestion des équipes est cruciale en cybersécurité. Nous disposons actuellement de trois unités spécialisées : détection, réponse et forensique. Chaque équipe a ses compétences spécifiques, mais je pense que nous devrions améliorer la communication entre elles. Avez-vous de l'expérience dans la coordination d'équipes de sécurité multidisciplinaires ?";
            contactName = "Sarah Chen";
          } else {
            botResponseContent = "C'est une perspective intéressante. Dans notre centre de commandement, nous devons constamment équilibrer la réactivité et la planification stratégique. Actuellement, nous travaillons sur un cadre de réponse unifiée qui intègre différentes sources de renseignement sur les menaces. Comment aborderiez-vous l'intégration des données de renseignement sur les menaces dans un plan de défense cohérent ?";
            contactName = "Sarah Chen";
          }
          break;
          
        case "analysis-lab":
          // Réponses orientées technique et investigation
          if (values.message.toLowerCase().includes("malware") || values.message.toLowerCase().includes("virus")) {
            botResponseContent = "L'analyse de malware est une de nos spécialités ici. Nous venons justement de recevoir un échantillon suspect extrait d'une pièce jointe email. Nos analyses préliminaires suggèrent qu'il s'agit d'un nouveau variant de ransomware avec des capacités d'évasion avancées. Quelles techniques d'analyse utiliseriez-vous pour identifier son mécanisme de chiffrement ?";
            contactName = "Alex Dupont";
          } else if (values.message.toLowerCase().includes("log") || values.message.toLowerCase().includes("trace")) {
            botResponseContent = "L'analyse de logs est fondamentale dans notre travail. Actuellement, nous traitons un cas où des accès non autorisés ont été détectés sur plusieurs serveurs critiques. Les timestamps montrent des patterns inhabituels. J'aimerais avoir votre avis sur les meilleures approches pour corréler ces événements apparemment distincts. Quels outils ou méthodes recommanderiez-vous ?";
            contactName = "Alex Dupont";
          } else {
            botResponseContent = "Votre approche est intéressante. Dans notre laboratoire, nous utilisons une combinaison d'outils propriétaires et open-source pour nos analyses. Récemment, nous avons observé une tendance inquiétante : des attaques qui exploitent simultanément plusieurs vulnérabilités de faible priorité pour créer un chemin d'attaque critique. Comment procéderiez-vous pour détecter ce type de chaînes d'exploitation complexes ?";
            contactName = "Alex Dupont";
          }
          break;
          
        case "crisis-room":
          // Réponses orientées urgence et décision
          if (values.message.toLowerCase().includes("isoler") || values.message.toLowerCase().includes("contenir")) {
            botResponseContent = "Excellente première réaction. L'isolation est effectivement cruciale. Nous avons déjà commencé à isoler les systèmes critiques, mais nous devons prendre une décision difficile concernant notre infrastructure cloud. Une déconnexion complète empêcherait l'exfiltration de données mais perturberait gravement nos opérations. Comment évalueriez-vous ce compromis entre sécurité et continuité d'activité ?";
            contactName = "Malik Johnson";
          } else if (values.message.toLowerCase().includes("communication") || values.message.toLowerCase().includes("informer")) {
            botResponseContent = "La communication est effectivement un aspect critique de la gestion de crise. Nous devons informer plusieurs parties prenantes : direction, employés, partenaires, et potentiellement les autorités réglementaires. Notre équipe juridique conseille la prudence dans nos communications externes. Comment structureriez-vous le plan de communication pour garantir transparence tout en protégeant les intérêts de l'entreprise ?";
            contactName = "Malik Johnson";
          } else {
            botResponseContent = "Nous sommes en pleine gestion d'incident. Nos systèmes de détection ont identifié des indicateurs de compromission sur plusieurs serveurs critiques. L'attaquant semble encore actif dans notre réseau. Nous avons 30 minutes avant la réunion d'urgence avec la direction. Quelle information prioritaire recommandez-vous que nous préparions pour cette réunion ?";
            contactName = "Malik Johnson";
          }
          break;
          
        default:
          botResponseContent = "Merci pour votre message. Pouvez-vous développer davantage votre réflexion sur cette problématique de cybersécurité ?";
          contactName = "Agent IA";
      }
      
      // Créer le message bot
      const botMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: botResponseContent,
        timestamp: new Date().toISOString(),
        contactName: contactName
      };
      
      // Ajouter le message à la liste
      setMessages(prevMessages => [...prevMessages, botMessage]);
      
      // Générer de nouvelles suggestions pour ce message bot
      if (generateSuggestions) {
        fetchSuggestions(botResponseContent);
      }
      
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'envoyer le message. Veuillez réessayer.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Utiliser une suggestion comme réponse
  const useSuggestion = (suggestion: Suggestion) => {
    if (isLoading) return;
    
    form.setValue("message", suggestion.text);
    sendMessage({ message: suggestion.text });
  };

  // Filtrer les suggestions par approche
  const filteredSuggestions = activeApproach === "all" 
    ? suggestions 
    : suggestions.filter(s => s.approach === activeApproach);

  // Obtenir la couleur associée à une compétence
  const getSkillColor = (skill: string) => {
    switch(skill) {
      case "technical": return "text-cyan-500";
      case "analytical": return "text-indigo-500";
      case "strategic": return "text-violet-500";
      case "communication": return "text-emerald-500";
      default: return "text-gray-500";
    }
  };

  // Obtenir l'icône associée à une approche
  const getApproachIcon = (approach: string) => {
    switch(approach) {
      case "technique": return <Code className="h-4 w-4" />;
      case "analytique": return <BarChart3 className="h-4 w-4" />;
      case "stratégique": return <Shield className="h-4 w-4" />;
      default: return <MessageCircle className="h-4 w-4" />;
    }
  };

  // Formater l'heure du message
  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-950 to-blue-950/80 rounded-lg border border-blue-900/50 overflow-hidden shadow-xl">
      {/* En-tête du chat */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-indigo-800 p-4 border-b border-blue-800/70 relative overflow-hidden">
        {/* Élément graphique décoratif */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-indigo-500/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>
        
        <div className="relative z-10">
          <h2 className="text-lg font-semibold text-white flex items-center">
            <Bot className="h-5 w-5 mr-2 text-cyan-400" />
            Session Agent IA Immersif
          </h2>
          <p className="text-sm text-blue-200 mt-1 max-w-2xl">
            Interagissez avec des experts en cybersécurité dans un environnement d'apprentissage personnalisé
          </p>
        </div>
      </div>

      {/* Zone des messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-5 bg-gradient-to-b from-[#0a101f] to-[#0a1a2e]">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${
                message.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex max-w-[85%] ${
                  message.type === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div className={`${message.type === "user" ? "ml-3" : "mr-3"} flex-shrink-0 mt-1`}>
                  <Avatar className={`border-2 ${
                    message.type === "user" 
                      ? "border-blue-600/50 shadow-sm shadow-blue-500/20" 
                      : "border-indigo-700/50 shadow-sm shadow-indigo-500/20"
                  }`}>
                    {message.type === "user" ? (
                      <>
                        <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-800">
                          <User className="h-4 w-4 text-blue-100" />
                        </AvatarFallback>
                      </>
                    ) : (
                      <>
                        <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-violet-800">
                          <Bot className="h-4 w-4 text-indigo-100" />
                        </AvatarFallback>
                      </>
                    )}
                  </Avatar>
                </div>

                <div
                  className={`relative ${
                    message.type === "user"
                      ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white"
                      : "bg-gradient-to-br from-gray-800 to-gray-900 text-gray-100"
                  } p-3 rounded-lg shadow-md border ${
                    message.type === "user"
                      ? "border-blue-500/30"
                      : "border-indigo-500/20"
                  }`}
                >
                  {/* Petit indicateur de direction du message */}
                  <div className={`absolute top-3 ${
                    message.type === "user" ? "right-[-6px]" : "left-[-6px]"
                  } w-3 h-3 transform rotate-45 ${
                    message.type === "user" ? "bg-blue-600" : "bg-gray-800"
                  } border-t ${
                    message.type === "user" ? "border-r" : "border-l"
                  } ${
                    message.type === "user" ? "border-blue-500/30" : "border-indigo-500/20"
                  }`}></div>
                
                  {message.type !== "user" && message.contactName && (
                    <div className="text-xs font-medium text-blue-300 mb-1.5 flex items-center">
                      <div className="w-2 h-2 rounded-full bg-cyan-400 mr-1.5"></div>
                      {message.contactName}
                    </div>
                  )}
                  <div className="text-sm leading-relaxed">{message.content}</div>
                  <div className="text-xs mt-2 opacity-70 flex items-center justify-end text-right">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatMessageTime(message.timestamp)}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messageEndRef} />
      </div>

      {/* Zone des suggestions */}
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-blue-900/30 bg-gradient-to-r from-gray-900 to-blue-950/90"
          >
            <div className="p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center text-blue-300">
                <Lightbulb className="h-5 w-5 mr-2 text-amber-400" />
                <span className="text-sm font-medium">Approches suggérées</span>
                <span className="ml-2 text-xs bg-blue-900/50 px-2 py-0.5 rounded-full text-blue-300">
                  {filteredSuggestions.length} disponibles
                </span>
              </div>
              
              <Tabs 
                value={activeApproach} 
                onValueChange={setActiveApproach}
                className="h-8"
              >
                <TabsList className="bg-gray-800/80 border border-blue-900/20 h-8 p-0.5">
                  <TabsTrigger 
                    value="all" 
                    className="h-7 px-3 text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                  >
                    Toutes
                  </TabsTrigger>
                  <TabsTrigger 
                    value="technique" 
                    className="h-7 px-3 text-xs data-[state=active]:bg-cyan-600 data-[state=active]:text-white"
                  >
                    <Code className="h-3 w-3 mr-1" />
                    Technique
                  </TabsTrigger>
                  <TabsTrigger 
                    value="analytique" 
                    className="h-7 px-3 text-xs data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
                  >
                    <BarChart3 className="h-3 w-3 mr-1" />
                    Analytique
                  </TabsTrigger>
                  <TabsTrigger 
                    value="stratégique" 
                    className="h-7 px-3 text-xs data-[state=active]:bg-violet-600 data-[state=active]:text-white"
                  >
                    <Shield className="h-3 w-3 mr-1" />
                    Stratégique
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <div className="px-3 pb-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-800 scrollbar-track-gray-900">
              {filteredSuggestions.map((suggestion, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <Card 
                    className={`bg-gradient-to-br ${
                      suggestion.approach === 'technique' ? 'from-cyan-900/40 to-gray-900' :
                      suggestion.approach === 'analytique' ? 'from-indigo-900/40 to-gray-900' :
                      'from-violet-900/40 to-gray-900'
                    } border ${
                      suggestion.approach === 'technique' ? 'border-cyan-800/30' :
                      suggestion.approach === 'analytique' ? 'border-indigo-800/30' :
                      'border-violet-800/30'
                    } p-3 cursor-pointer hover:bg-opacity-80 transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200`}
                    onClick={() => useSuggestion(suggestion)}
                  >
                    <div className="text-xs mb-1.5 flex items-center">
                      <div className={`p-1 rounded-full ${
                        suggestion.approach === 'technique' ? 'bg-cyan-700/50' :
                        suggestion.approach === 'analytique' ? 'bg-indigo-700/50' :
                        'bg-violet-700/50'
                      }`}>
                        {getApproachIcon(suggestion.approach)}
                      </div>
                      <span className="ml-1.5 text-gray-300 capitalize font-medium">{suggestion.approach}</span>
                    </div>
                    <p className="text-sm text-white">{suggestion.text}</p>
                    <div className="flex mt-2.5 text-xs">
                      <span className={`${getSkillColor(suggestion.skillImpact.primary)} mr-2 px-1.5 py-0.5 rounded-sm bg-gray-800/80`}>
                        {suggestion.skillImpact.primary.charAt(0).toUpperCase() + suggestion.skillImpact.primary.slice(1)}
                      </span>
                      <span className={`${getSkillColor(suggestion.skillImpact.secondary)} opacity-80 px-1.5 py-0.5 rounded-sm bg-gray-800/80`}>
                        {suggestion.skillImpact.secondary.charAt(0).toUpperCase() + suggestion.skillImpact.secondary.slice(1)}
                      </span>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Zone de saisie du message */}
      <div className="p-4 border-t border-blue-900/30 bg-gradient-to-r from-gray-900 to-gray-900/95">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(sendMessage)}
            className="flex space-x-3"
          >
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormControl>
                  <div className="relative flex-1">
                    <Textarea
                      placeholder="Entrez votre message..."
                      className="min-h-[60px] resize-none bg-gray-800/90 border-blue-900/40 rounded-lg text-white pr-12 focus:border-blue-700 focus:ring-1 focus:ring-blue-700 shadow-inner"
                      {...field}
                    />
                    {!showSuggestions && suggestions.length > 0 && (
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="absolute right-3 top-3.5 text-amber-400 hover:text-amber-300 hover:bg-blue-900/30 rounded-full"
                        onClick={() => setShowSuggestions(true)}
                        title="Afficher les suggestions"
                      >
                        <Lightbulb className="h-5 w-5" />
                      </Button>
                    )}
                  </div>
                </FormControl>
              )}
            />
            <Button
              type="submit"
              className={`h-auto px-5 ${isLoading ? 'bg-gray-700' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'} text-white py-3 rounded-lg shadow-md`}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white/90 rounded-full animate-spin"></div>
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}