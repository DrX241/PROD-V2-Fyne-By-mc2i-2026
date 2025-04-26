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
  onMessagesUpdate?: (messages: any[]) => void;
  generateSuggestions?: (currentMessage: string) => Promise<Suggestion[]>;
  environmentContext?: string;
}

export default function EnhancedChatInterface({ 
  onMessagesUpdate, 
  generateSuggestions,
  environmentContext = "command-center"
}: EnhancedChatInterfaceProps) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
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

  // Effet pour le défilement automatique jusqu'au dernier message
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    
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
      // Utiliser le contexte d'environnement pour adapter le message initial
      let initialContent = "";
      let contactName = "";
      
      switch(environmentContext) {
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
      setSuggestions(suggestionsList);
      setShowSuggestions(suggestionsList.length > 0);
    } catch (error) {
      console.error("Erreur lors de la génération des suggestions:", error);
      // Silencieusement échouer - ne pas montrer d'erreur à l'utilisateur pour les suggestions
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
      
      switch(environmentContext) {
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
    <div className="flex flex-col h-full bg-gray-950 rounded-lg border border-gray-800 overflow-hidden">
      {/* En-tête du chat */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-4 border-b border-gray-800">
        <h2 className="text-lg font-semibold text-white">Session Agent IA Immersif</h2>
        <p className="text-sm text-blue-200">
          Interagissez avec des experts en cybersécurité dans un environnement d'apprentissage immersif
        </p>
      </div>

      {/* Zone des messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#0a101f]">
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
                className={`flex max-w-[80%] ${
                  message.type === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <Avatar className={`${message.type === "user" ? "ml-2" : "mr-2"} flex-shrink-0`}>
                  {message.type === "user" ? (
                    <>
                      <AvatarFallback className="bg-blue-700">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </>
                  ) : (
                    <>
                      <AvatarFallback className="bg-indigo-700">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </>
                  )}
                </Avatar>

                <div
                  className={`${
                    message.type === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-800 text-gray-100"
                  } p-3 rounded-lg shadow`}
                >
                  {message.type !== "user" && message.contactName && (
                    <div className="text-xs font-medium text-blue-300 mb-1">
                      {message.contactName}
                    </div>
                  )}
                  <div className="text-sm">{message.content}</div>
                  <div className="text-xs text-right mt-1 opacity-70 flex items-center justify-end">
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
            className="border-t border-gray-800 bg-gray-900"
          >
            <div className="p-3 flex justify-between items-center">
              <div className="flex items-center text-blue-300">
                <Lightbulb className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">Suggestions de réponse</span>
              </div>
              
              <Tabs 
                value={activeApproach} 
                onValueChange={setActiveApproach}
                className="h-8"
              >
                <TabsList className="bg-gray-800 h-8">
                  <TabsTrigger value="all" className="h-7 px-2 text-xs">
                    Toutes
                  </TabsTrigger>
                  <TabsTrigger value="technique" className="h-7 px-2 text-xs">
                    <Code className="h-3 w-3 mr-1" />
                    Technique
                  </TabsTrigger>
                  <TabsTrigger value="analytique" className="h-7 px-2 text-xs">
                    <BarChart3 className="h-3 w-3 mr-1" />
                    Analytique
                  </TabsTrigger>
                  <TabsTrigger value="stratégique" className="h-7 px-2 text-xs">
                    <Shield className="h-3 w-3 mr-1" />
                    Stratégique
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <div className="p-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
              {filteredSuggestions.map((suggestion, index) => (
                <Card 
                  key={index} 
                  className="bg-gray-800 border-gray-700 p-2 cursor-pointer hover:bg-gray-750 transition-colors"
                  onClick={() => useSuggestion(suggestion)}
                >
                  <div className="text-xs mb-1 flex items-center">
                    {getApproachIcon(suggestion.approach)}
                    <span className="ml-1 text-gray-300 capitalize">{suggestion.approach}</span>
                  </div>
                  <p className="text-sm text-white">{suggestion.text}</p>
                  <div className="flex mt-2 text-xs">
                    <span className={`${getSkillColor(suggestion.skillImpact.primary)} mr-2`}>
                      {suggestion.skillImpact.primary.charAt(0).toUpperCase() + suggestion.skillImpact.primary.slice(1)}
                    </span>
                    <span className={`${getSkillColor(suggestion.skillImpact.secondary)} opacity-70`}>
                      {suggestion.skillImpact.secondary.charAt(0).toUpperCase() + suggestion.skillImpact.secondary.slice(1)}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Zone de saisie du message */}
      <div className="p-3 border-t border-gray-800 bg-gray-900">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(sendMessage)}
            className="flex space-x-2"
          >
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormControl>
                  <div className="relative flex-1">
                    <Textarea
                      placeholder="Entrez votre message..."
                      className="min-h-12 resize-none bg-gray-800 border-gray-700 text-white pr-12"
                      {...field}
                    />
                    {!showSuggestions && suggestions.length > 0 && (
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="absolute right-2 top-3 text-blue-400 hover:text-blue-300 hover:bg-transparent"
                        onClick={() => setShowSuggestions(true)}
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
              className="h-full bg-blue-700 hover:bg-blue-600"
              disabled={isLoading}
            >
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}