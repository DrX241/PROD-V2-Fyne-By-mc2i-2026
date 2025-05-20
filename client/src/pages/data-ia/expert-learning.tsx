import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  Send,
  Zap,
  ZapOff,
  Bot,
  Loader2,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { IoHome } from 'react-icons/io5';
// Utilisation du hook useOpenAI réel
import { useOpenAI } from '@/hooks/useOpenAI';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { DataButton } from '@/components/DataButton';
import HomeLayout from '@/components/layout/HomeLayout';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
// Composant simple pour remplacer MarkdownRenderer qui n'existe pas encore
const MarkdownRenderer = ({ content }: { content: string }) => {
  // Convertit les sauts de ligne en balises <br>
  const formattedContent = content.split('\n').map((line, i) => (
    <React.Fragment key={i}>
      {line}
      {i < content.split('\n').length - 1 && <br />}
    </React.Fragment>
  ));
  
  return <div>{formattedContent}</div>;
};
// Utilise le composant OpenAIStatusIndicator importé

// Type pour un message dans la conversation
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

export default function DataIaExpertLearning() {
  const [, setLocation] = useLocation();
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'system', 
      content: 'Tu es un expert en Data Science et Intelligence Artificielle. Ton objectif est d\'aider l\'utilisateur à apprendre et à comprendre les concepts liés à ces domaines, à résoudre des problèmes pratiques et à progresser dans ses compétences. Tu peux expliquer des concepts, répondre à des questions techniques, guider sur des projets et suggérer des ressources pertinentes.'
    },
    { 
      role: 'assistant', 
      content: 'Bonjour et bienvenue dans l\'espace d\'apprentissage Data & IA ! Je suis votre expert dédié, prêt à vous accompagner dans votre parcours d\'apprentissage. \n\nComment puis-je vous aider aujourd\'hui ?\n\n- Vous souhaitez comprendre un concept spécifique de Data Science ?\n- Vous avez besoin d\'aide sur du code Python, SQL ou R ?\n- Vous cherchez à approfondir vos connaissances sur les modèles de Machine Learning ou Deep Learning ?\n- Vous voulez des conseils pour démarrer un projet d\'analyse de données ?\n\nN\'hésitez pas à me poser vos questions, même les plus complexes !',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { connectionStatus, currentModel, toggleModel } = useOpenAI();
  const [showPrompt, setShowPrompt] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('');
  // const [isFullScreen, setIsFullScreen] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    // Ajouter le message de l'utilisateur
    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    
    try {
      // Créer le contexte pour l'appel API avec un prompt qui encourage l'expert à:
      // - vulgariser les concepts
      // - donner des exemples concrets
      // - créer des petits jeux ou challenges
      // - mettre l'utilisateur en situation
      // - expliquer les outils/stacks de manière accessible
      // - maintenir l'engagement avec des questions de suivi
      const messagesForAPI = [
        {
          role: 'system',
          content: `Tu es un expert pédagogue en Data Science et Intelligence Artificielle. 
Ta mission est d'aider l'utilisateur à apprendre et comprendre les concepts de Data & IA de manière engageante:

1. VULGARISATION: Simplifie les concepts complexes avec des analogies et explications accessibles.
2. EXEMPLES CONCRETS: Illustre chaque concept avec des exemples du monde réel et cas d'usage.
3. INTERACTIVITÉ: Propose de petits défis, quiz ou jeux pour tester la compréhension.
4. MISES EN SITUATION: Place l'utilisateur dans des scénarios pratiques de data scientist.
5. EXPLORATION GUIDÉE: Explique les outils, bibliothèques et stacks techniques avec des exemples de code simples.
6. ENGAGEMENT CONSTANT: Termine toujours par une question ouverte pour encourager la poursuite de la discussion.

Sois synthétique mais complet. Adresse-toi à l'utilisateur directement ("tu"). Évite le jargon trop technique sauf si l'utilisateur semble à l'aise avec ces termes. Sois enthousiaste et encourage l'utilisateur à découvrir davantage.`
        },
        ...messages.filter(m => m.role !== 'system').map(m => ({
          role: m.role,
          content: m.content
        }))
      ];
      
      // Appel à l'API Azure OpenAI via le hook useOpenAI
      const result = await sendChatMessage(messagesForAPI, 0.7, 1000);
      
      if (result && result.response) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: result.response,
          timestamp: new Date()
        };
        
        setMessages(prevMessages => [...prevMessages, assistantMessage]);
      } else {
        throw new Error('Réponse invalide de l\'API');
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      
      // Message d'erreur
      const errorMessage: Message = {
        role: 'assistant',
        content: "Désolé, une erreur s'est produite lors de la communication avec l'expert IA. Veuillez réessayer dans quelques instants.",
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const applySelectedTopic = () => {
    if (!selectedTopic) return;
    
    let promptContent = "";
    
    switch(selectedTopic) {
      case 'python-basics':
        promptContent = "J'aimerais apprendre les bases de Python pour la data science. Par où devrais-je commencer?";
        break;
      case 'ml-intro':
        promptContent = "Pouvez-vous m'expliquer simplement ce qu'est le machine learning et quels sont les algorithmes les plus utilisés?";
        break;
      case 'data-visualization':
        promptContent = "Quelles sont les meilleures bibliothèques Python pour la visualisation de données et comment les utiliser efficacement?";
        break;
      case 'sql-data-analysis':
        promptContent = "Comment puis-je utiliser SQL efficacement pour l'analyse de données? Quelles sont les requêtes les plus utiles à connaître?";
        break;
      case 'deep-learning':
        promptContent = "J'aimerais comprendre les réseaux de neurones profonds. Pouvez-vous m'expliquer leur fonctionnement et leurs applications?";
        break;
      case 'data-cleaning':
        promptContent = "Quelles sont les meilleures pratiques pour le nettoyage et la préparation des données avant l'analyse?";
        break;
      case 'big-data':
        promptContent = "Comment aborder l'analyse de grands volumes de données? Quels outils et techniques sont recommandés?";
        break;
      case 'nlp':
        promptContent = "Pouvez-vous m'expliquer le traitement du langage naturel (NLP) et ses applications pratiques?";
        break;
      default:
        promptContent = "";
    }
    
    setInputMessage(promptContent);
    setShowPrompt(false);
  };

  return (
    <HomeLayout>
      <Helmet>
        <title>Expert Data & IA | Apprentissage conversationnel</title>
      </Helmet>
      
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#041b36] to-[#0c142e]">
        {/* Navigation et contrôles */}
        <div className="px-6 py-4 border-b border-blue-900/40 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/data-ia/sas-academie">
              <DataButton 
                variant="outline"
                size="sm"
                className="text-blue-300 border-blue-300/30 hover:bg-blue-900/20 mr-4"
                startIcon={<ArrowLeft className="h-4 w-4 mr-2" />}
              >
                Retour
              </DataButton>
            </Link>
            <h1 className="text-xl font-semibold text-white">Expert Data & IA</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span>FYNE Connecté</span>
              {currentModel === 'gpt-4o' ? (
                <Zap className="ml-1 h-3 w-3 text-yellow-400" />
              ) : (
                <ZapOff className="ml-1 h-3 w-3 text-blue-400" />
              )}
            </div>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DataButton 
                    variant="outline"
                    size="sm"
                    className={`text-blue-300 border-blue-300/30 hover:bg-blue-900/20`}
                    onClick={toggleModel}
                  >
                    {currentModel === 'gpt-4o' ? (
                      <>
                        <Zap className="h-4 w-4 mr-2 text-yellow-400" />
                        Mode Précis
                      </>
                    ) : (
                      <>
                        <ZapOff className="h-4 w-4 mr-2 text-blue-400" />
                        Mode ÉCO
                      </>
                    )}
                  </DataButton>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{currentModel === 'gpt-4o' ? 'Utilise GPT-4o pour des réponses plus précises et détaillées' : 'Utilise GPT-4o-mini pour économiser les ressources'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <Button 
              variant="ghost" 
              size="icon"
              className="text-blue-300 hover:text-blue-200 hover:bg-blue-900/20"
            >
              <ChevronUp className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* Zone de conversation */}
        <ScrollArea className="flex-grow p-4 overflow-y-auto">
          <div className="max-w-3xl mx-auto space-y-4 pb-4">
            {messages.filter(m => m.role !== 'system').map((message, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`rounded-lg px-4 py-3 max-w-[85%] ${
                    message.role === 'user' 
                      ? 'bg-blue-700/40 text-white' 
                      : 'bg-gray-800/60 border border-blue-900/40 text-blue-100'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex items-center mb-2">
                      <Bot className="h-5 w-5 mr-2 text-blue-400" />
                      <span className="text-sm font-semibold text-blue-400">Expert Data & IA</span>
                    </div>
                  )}
                  
                  <div className="prose prose-invert prose-sm max-w-none">
                    <MarkdownRenderer content={message.content} />
                  </div>
                  
                  {message.timestamp && (
                    <div className="text-right mt-2">
                      <span className="text-xs text-blue-400/70">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="rounded-lg px-4 py-3 bg-gray-800/60 border border-blue-900/40">
                  <div className="flex items-center">
                    <Loader2 className="h-5 w-5 mr-2 text-blue-400 animate-spin" />
                    <span className="text-sm text-blue-300">L'expert réfléchit...</span>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        {/* Zone de saisie */}
        <div className="border-t border-blue-900/40 p-4 bg-gray-900/30">
          {showPrompt && (
            <div className="max-w-3xl mx-auto mb-4 p-4 bg-gray-800/60 rounded-lg border border-blue-900/40 relative">
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-2 right-2 text-gray-400 hover:text-white"
                onClick={() => setShowPrompt(false)}
              >
                <X className="h-4 w-4" />
              </Button>
              
              <h3 className="text-blue-300 font-medium mb-3">Choisissez un sujet pour démarrer la conversation</h3>
              
              <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                <SelectTrigger className="w-full bg-gray-900/50 border-blue-900/40 mb-3">
                  <SelectValue placeholder="Sélectionnez un sujet" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="python-basics">Les bases de Python pour la Data Science</SelectItem>
                  <SelectItem value="ml-intro">Introduction au Machine Learning</SelectItem>
                  <SelectItem value="data-visualization">Visualisation de données</SelectItem>
                  <SelectItem value="sql-data-analysis">SQL pour l'analyse de données</SelectItem>
                  <SelectItem value="deep-learning">Deep Learning et réseaux de neurones</SelectItem>
                  <SelectItem value="data-cleaning">Nettoyage et préparation des données</SelectItem>
                  <SelectItem value="big-data">Techniques de Big Data</SelectItem>
                  <SelectItem value="nlp">Traitement du langage naturel (NLP)</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                className="w-full bg-blue-700 hover:bg-blue-600 text-white"
                onClick={applySelectedTopic}
                disabled={!selectedTopic}
              >
                Appliquer ce sujet
              </Button>
            </div>
          )}
          
          <div className="max-w-3xl mx-auto flex gap-2">
            <Button 
              variant="outline" 
              size="icon"
              className="bg-gray-800/40 border-blue-900/40 text-blue-300 hover:text-blue-200 hover:bg-blue-900/30"
              onClick={() => setShowPrompt(!showPrompt)}
            >
              <Bot className="h-5 w-5" />
            </Button>
            
            <div className="flex-grow relative">
              <Textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Posez votre question sur la Data Science ou l'IA..."
                className="min-h-[60px] max-h-[200px] bg-gray-800/40 border-blue-900/40 text-white resize-none pl-4 pr-12 py-3 rounded-lg"
              />
              <Button 
                size="icon" 
                className="absolute right-2 bottom-2 text-blue-400 hover:text-blue-300 bg-transparent hover:bg-blue-900/20"
                onClick={handleSendMessage}
                disabled={isLoading || !inputMessage.trim()}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          <div className="max-w-3xl mx-auto mt-3">
            <p className="text-xs text-center text-blue-400/70">
              {connectionStatus === 'connected' 
                ? `Connecté à ${currentModel === 'gpt-4o' ? 'GPT-4o (haute précision)' : 'GPT-4o-mini (mode ÉCO)'}`
                : "Non connecté - Mode démonstration"}
            </p>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}