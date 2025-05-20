import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, ChevronLeft, RefreshCw, User, Bot, ArrowLeft, Terminal, CheckCircle, XCircle } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@/hooks/use-toast";
import HomeLayout from "@/components/layout/HomeLayout";
import PageTitle from "@/components/utils/PageTitle";
import DOMPurify from 'dompurify';

interface Message {
  id: string;
  type: "user" | "bot" | "system";
  content: string;
  timestamp: number;
  isCorrect?: boolean;
}

export default function TestTechniquePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(5);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // Questions techniques de cybersécurité
  const questions = [
    {
      question: "Qu'est-ce qu'une attaque par déni de service distribué (DDoS) et comment peut-on s'en protéger ?",
      correctAnswerContains: ["trafic", "volumétrie", "distribué", "botnet", "mitigation", "pare-feu", "filtrage"]
    },
    {
      question: "Expliquez le concept de chiffrement asymétrique et donnez un exemple d'algorithme qui l'utilise.",
      correctAnswerContains: ["clé publique", "clé privée", "rsa", "ecc", "diffie-hellman"]
    },
    {
      question: "Qu'est-ce qu'une vulnérabilité de type injection SQL et comment peut-on la prévenir ?",
      correctAnswerContains: ["requête", "base de données", "paramètre", "sanitisation", "préparé", "orm", "validation"]
    },
    {
      question: "Expliquez ce qu'est le principe de défense en profondeur en cybersécurité.",
      correctAnswerContains: ["couches", "multiple", "barrière", "protection", "périmètre", "réseau", "application"]
    },
    {
      question: "Qu'est-ce qu'une attaque de type 'homme du milieu' (MITM) et comment s'en protéger ?",
      correctAnswerContains: ["interception", "trafic", "https", "certificat", "ssl", "tls", "authentification"]
    }
  ];
  
  // Effet pour initialiser la session lors du chargement de la page
  useEffect(() => {
    startSession();
  }, []);
  
  // Fonction pour démarrer une nouvelle session
  const startSession = async () => {
    setIsLoading(true);
    setMessages([]);
    setCurrentQuestion(0);
    setScore(0);
    
    try {
      // Simulation d'initialisation d'une session de test technique
      const newSessionId = uuidv4();
      setSessionId(newSessionId);
      
      // Message de bienvenue initial
      const welcomeMessage: Message = {
        id: uuidv4(),
        type: "system",
        content: `Bienvenue au Test Technique de Cybersécurité

Ce test évalue vos connaissances en cybersécurité à travers ${totalQuestions} questions techniques.
Répondez de manière claire et complète pour démontrer votre expertise.

Prêt à commencer ? Voici votre première question :`,
        timestamp: Date.now()
      };
      
      setMessages([welcomeMessage]);
      setTimeout(() => {
        // Afficher la première question
        const firstQuestion: Message = {
          id: uuidv4(),
          type: "bot",
          content: questions[0].question,
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, firstQuestion]);
        setIsSessionActive(true);
        setIsLoading(false);
      }, 1000);
      
      // Notifier l'utilisateur que la session a démarré
      toast({
        title: "Test technique démarré",
        description: "Vous allez maintenant répondre à des questions techniques de cybersécurité.",
        duration: 3000
      });
    } catch (error) {
      console.error("Erreur lors du démarrage de la session:", error);
      toast({
        title: "Erreur",
        description: "Impossible de démarrer le test technique. Veuillez réessayer.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };
  
  // Fonction pour terminer la session actuelle
  const endSession = () => {
    // Confirmation avant de terminer
    if (window.confirm("Êtes-vous sûr de vouloir terminer ce test ? Votre progression sera perdue.")) {
      // Message de conclusion
      const conclusionMessage: Message = {
        id: uuidv4(),
        type: "system",
        content: `Test technique terminé !

Score final : ${score}/${currentQuestion} questions.
${score === currentQuestion ? "Excellente performance !" : score > currentQuestion / 2 ? "Bonne performance !" : "Continuez à vous entraîner !"}

Vous pouvez redémarrer le test pour vous améliorer ou retourner à la page principale.`,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, conclusionMessage]);
      setIsSessionActive(false);
      
      toast({
        title: "Test terminé",
        description: `Votre score final est de ${score}/${currentQuestion}.`,
        duration: 5000
      });
    }
  };
  
  // Fonction pour évaluer la réponse
  const evaluateAnswer = (userAnswer: string, questionIndex: number) => {
    const currentQ = questions[questionIndex];
    const keywords = currentQ.correctAnswerContains;
    
    // Vérification simple basée sur les mots clés
    const lowerCaseAnswer = userAnswer.toLowerCase();
    const matchCount = keywords.filter(keyword => 
      lowerCaseAnswer.includes(keyword.toLowerCase())
    ).length;
    
    // Si l'utilisateur a mentionné au moins 3 mots clés, considérer la réponse comme correcte
    const isCorrect = matchCount >= 3;
    
    return {
      isCorrect,
      feedback: isCorrect 
        ? "Bonne réponse ! Votre explication couvre les principaux aspects de la question." 
        : `Réponse incomplète. Les éléments importants incluent : ${keywords.slice(0, 3).join(', ')}, etc.`
    };
  };
  
  // Fonction pour envoyer un message
  const handleSendMessage = () => {
    if (!inputMessage.trim() || !sessionId || !isSessionActive) return;
    
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
    
    // Évaluer la réponse
    setIsLoading(true);
    setTimeout(() => {
      const evaluation = evaluateAnswer(userMessage.content, currentQuestion);
      
      if (evaluation.isCorrect) {
        setScore(prev => prev + 1);
      }
      
      // Message de feedback
      const feedbackMessage: Message = {
        id: uuidv4(),
        type: "system",
        content: evaluation.feedback,
        isCorrect: evaluation.isCorrect,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, feedbackMessage]);
      
      // Passer à la question suivante ou terminer le test
      setTimeout(() => {
        const nextQuestionIndex = currentQuestion + 1;
        
        if (nextQuestionIndex < totalQuestions) {
          // Question suivante
          const nextQuestion: Message = {
            id: uuidv4(),
            type: "bot",
            content: questions[nextQuestionIndex].question,
            timestamp: Date.now()
          };
          
          setMessages(prev => [...prev, nextQuestion]);
          setCurrentQuestion(nextQuestionIndex);
        } else {
          // Test terminé
          const conclusionMessage: Message = {
            id: uuidv4(),
            type: "system",
            content: `Test technique terminé !

Score final : ${evaluation.isCorrect ? score + 1 : score}/${totalQuestions} questions.
${evaluation.isCorrect && score + 1 === totalQuestions ? "Score parfait ! Félicitations !" : 
  (evaluation.isCorrect ? score + 1 : score) > totalQuestions / 2 ? "Bonne performance !" : "Continuez à vous entraîner !"}

Vous pouvez redémarrer le test pour vous améliorer ou retourner à la page principale.`,
            timestamp: Date.now()
          };
          
          setMessages(prev => [...prev, conclusionMessage]);
          setIsSessionActive(false);
          
          toast({
            title: "Test terminé",
            description: `Votre score final est de ${evaluation.isCorrect ? score + 1 : score}/${totalQuestions}.`,
            duration: 5000
          });
        }
        
        setIsLoading(false);
      }, 1500);
    }, 2000);
  };
  
  // Gérer la soumission du formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };
  
  // Gérer les raccourcis clavier (Entrée pour envoyer, Shift+Entrée pour sauter une ligne)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Rendre le texte formaté avec sécurité
  const renderMessage = (content: string) => {
    // Formatter le texte (ajout de paragraphes, etc.)
    const formatted = content.replace(/\n/g, '<br>');
    return <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formatted) }} />;
  };
  
  // Faire défiler jusqu'en bas après l'ajout de nouveaux messages
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  // Fonction pour retourner à la page précédente
  const handleReturnToPrevious = () => {
    // Si une session est active, demander confirmation avant de quitter
    if (isSessionActive) {
      if (window.confirm("Êtes-vous sûr de vouloir quitter le test ? Votre progression sera perdue.")) {
        setLocation("/cyber/roleplay");
      }
    } else {
      // Si aucune session n'est active, naviguer directement
      setLocation("/cyber/roleplay");
    }
  };
  
  // Fonction pour redémarrer le test
  const restartTest = () => {
    if (window.confirm("Êtes-vous sûr de vouloir redémarrer le test ? Votre progression actuelle sera perdue.")) {
      startSession();
    }
  };
  
  return (
    <HomeLayout>
      <PageTitle title="Test Technique | Cybersécurité" />
      
      <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-violet-950 to-slate-900 text-white relative overflow-hidden">
        {/* Bouton de retour */}
        <div className="absolute top-4 left-4 z-20">
          <Button 
            variant="outline"
            size="sm"
            className="bg-black/50 border-violet-800 text-violet-400 hover:bg-black/70 hover:text-violet-300"
            onClick={handleReturnToPrevious}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour
          </Button>
        </div>
        
        {/* Interface principale */}
        <div className="container mx-auto pt-16 pb-8 px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            {/* En-tête avec progression */}
            <Card className="bg-violet-900/40 border-violet-700/50 mb-6">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-violet-200 flex items-center">
                    <Terminal className="h-5 w-5 mr-2" />
                    Test Technique de Cybersécurité
                  </CardTitle>
                  <div className="text-violet-300 text-sm font-mono">
                    Question {currentQuestion + 1}/{totalQuestions} • Score: {score}
                  </div>
                </div>
                <CardDescription className="text-violet-300/80">
                  Démontrez vos compétences techniques à travers une série de questions de cybersécurité
                </CardDescription>
                
                {/* Barre de progression */}
                <div className="w-full bg-violet-950/70 h-2 mt-3 rounded-full overflow-hidden">
                  <div 
                    className="bg-violet-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(currentQuestion / totalQuestions) * 100}%` }}
                  ></div>
                </div>
              </CardHeader>
            </Card>
            
            {/* Zone de chat */}
            <div className="bg-gradient-to-br from-violet-950 to-slate-900 border border-violet-800/50 rounded-t-md shadow-lg">
              <div 
                ref={chatContainerRef}
                className="h-[calc(100vh-300px)] overflow-y-auto p-4 space-y-4"
              >
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.type === "user" ? "justify-end" : 
                      message.type === "system" ? "justify-center" :
                      "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-3xl p-4 rounded-lg ${
                        message.type === "user"
                          ? "bg-violet-700/40 ml-10 border border-violet-600/30"
                          : message.type === "system"
                          ? `bg-slate-800/80 border ${message.isCorrect === true ? "border-green-600/50" : message.isCorrect === false ? "border-red-600/50" : "border-gray-600/30"}`
                          : "bg-gray-800/70 mr-10 border border-violet-900/30"
                      }`}
                    >
                      {message.type === "user" ? (
                        <div className="flex items-center mb-2">
                          <span className="font-medium text-violet-300 mr-auto">Votre réponse</span>
                          <User className="h-4 w-4 text-violet-300 ml-2" />
                        </div>
                      ) : message.type === "bot" ? (
                        <div className="flex items-center mb-2">
                          <Terminal className="h-4 w-4 text-violet-300 mr-2" />
                          <span className="font-medium text-violet-300">Question</span>
                        </div>
                      ) : (
                        <div className="flex items-center mb-2">
                          {message.isCorrect === true && (
                            <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                          )}
                          {message.isCorrect === false && (
                            <XCircle className="h-4 w-4 text-red-400 mr-2" />
                          )}
                          <span className={`font-medium ${
                            message.isCorrect === true ? "text-green-400" : 
                            message.isCorrect === false ? "text-red-400" : 
                            "text-gray-300"
                          }`}>
                            Système
                          </span>
                        </div>
                      )}
                      <div className={`${
                        message.type === "user" ? "text-violet-100" : 
                        message.type === "system" ? `${
                          message.isCorrect === true ? "text-green-100" : 
                          message.isCorrect === false ? "text-red-100" : 
                          "text-gray-200"
                        }` : 
                        "text-violet-100"
                      }`}>
                        {renderMessage(message.content)}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-center">
                    <div className="bg-gray-800/70 p-4 rounded-lg border border-violet-900/30">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                        <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Zone de saisie */}
              <div className="border-t border-violet-800/50 p-4 bg-violet-950/80">
                <form onSubmit={handleSubmit} className="flex items-end gap-2">
                  <div className="flex-1 bg-slate-900/80 rounded-md border border-violet-900/50 overflow-hidden">
                    <textarea
                      ref={textareaRef}
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      rows={2}
                      placeholder="Tapez votre réponse technique..."
                      className="w-full bg-transparent text-violet-100 p-3 focus:outline-none resize-none"
                      disabled={!isSessionActive || isLoading}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      type="submit"
                      disabled={!isSessionActive || isLoading || !inputMessage.trim()}
                      className="bg-violet-700 hover:bg-violet-600 text-white"
                    >
                      {isLoading ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    </Button>
                    {isSessionActive ? (
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={endSession}
                        className="bg-red-700 hover:bg-red-600"
                      >
                        Terminer
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={restartTest}
                        className="border-violet-700 text-violet-300 hover:bg-violet-900/30"
                      >
                        Recommencer
                      </Button>
                    )}
                  </div>
                </form>
              </div>
            </div>
            
            {/* Conseils */}
            <div className="mt-6 text-sm text-violet-300/70 max-w-4xl mx-auto text-center">
              <p>Conseil : Soyez précis et complet dans vos réponses techniques.</p>
            </div>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}