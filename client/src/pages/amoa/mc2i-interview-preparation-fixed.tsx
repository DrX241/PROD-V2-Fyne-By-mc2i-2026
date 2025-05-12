import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  UserCircle, 
  Send, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Users,
  FileCheck,
  Sparkles,
  BriefcaseBusiness,
  User,
  Copy,
  Star,
  TimerReset,
  Lightbulb,
  Search, 
  ListChecks,
  Ear,
  PanelTop, 
  LineChart, 
  ClipboardSignature, 
  BookOpen, 
  MessageCircle, 
  ClipboardList,
  BookMarked
} from 'lucide-react';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import HomeLayout from "@/components/layout/HomeLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

// Type definitions
interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

// Formulaire de configuration
const formSchema = z.object({
  recruiterEmail: z.string().email("Email invalide").optional(),
  candidateName: z.string().min(3, "Nom trop court").optional(),
  profileType: z.string().min(1, "Sélectionnez un type de profil"),
  experienceLevel: z.string().min(1, "Sélectionnez un niveau d'expérience"),
  sectorFocus: z.string().min(1, "Sélectionnez un secteur d'activité"),
});

// Formulaire de contact pour les informations manquantes
const contactFormSchema = z.object({
  recruiterEmail: z.string().email("Email invalide"),
  candidateName: z.string().min(3, "Nom trop court"),
});

// Types pour le suivi de progression
type ProgressSection = 'preparation' | 'during' | 'after';

interface BestPracticesContentProps {
  setActiveTab?: (tab: string) => void;
}

const BestPracticesContent: React.FC<BestPracticesContentProps> = ({ setActiveTab }) => {
  const [progressTracker, setProgressTracker] = useState({
    preparation: { completed: 0, total: 2 },
    during: { completed: 0, total: 5 },
    after: { completed: 0, total: 3 }
  });
  
  const incrementProgress = (section: ProgressSection, amount: number = 1) => {
    setProgressTracker(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        completed: Math.min(prev[section].completed + amount, prev[section].total)
      }
    }));
  };

  return (
    <div className="px-8 py-6 bg-gradient-to-b from-gray-900 to-gray-950 rounded-lg">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Guide pratique pour réussir vos entretiens client</h2>
        <p className="text-blue-100 text-lg mb-6">
          Conseils et exemples concrets pour préparer, conduire et suivre efficacement vos entretiens.
        </p>
      </div>

      {/* Avant l'entretien */}
      <div className="mb-10">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">1</span>
          Avant l'entretien
        </h3>
        
        <div className="ml-12 space-y-6">
          <div className="bg-gradient-to-r from-blue-900/20 to-blue-800/20 p-5 rounded-lg border border-blue-700/30">
            <div className="flex items-start">
              <div className="bg-blue-600/40 p-3 rounded-full mr-4 hidden md:flex">
                <Search className="w-6 h-6 text-blue-200" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-blue-300 mb-3">Comprendre le contexte client</h4>
                <p className="text-gray-300 mb-3">
                  Prenez le temps d'analyser le contexte de l'entreprise cliente, son secteur d'activité, et ses enjeux stratégiques.
                  Une compréhension approfondie de son environnement vous permettra de mieux appréhender ses besoins.
                </p>
                
                <div className="bg-gray-800/60 p-4 rounded-md mb-4 border-l-4 border-blue-500">
                  <h5 className="font-semibold text-blue-200 mb-2">Exemple concret</h5>
                  <p className="text-gray-300">
                    Pour une banque souhaitant moderniser son système d'information, recherchez au préalable les réglementations 
                    financières récentes (RGPD, DSP2, etc.) qui pourraient impacter le projet.
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-3 mt-4">
                  <Badge variant="outline" className="bg-blue-900/30 text-blue-200 border-blue-500/50">Analyse préalable</Badge>
                  <Badge variant="outline" className="bg-blue-900/30 text-blue-200 border-blue-500/50">Recherche sectorielle</Badge>
                  <Badge variant="outline" className="bg-blue-900/30 text-blue-200 border-blue-500/50">Veille stratégique</Badge>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-900/20 to-blue-800/20 p-5 rounded-lg border border-blue-700/30">
            <div className="flex items-start">
              <div className="bg-blue-600/40 p-3 rounded-full mr-4 hidden md:flex">
                <ListChecks className="w-6 h-6 text-blue-200" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-blue-300 mb-3">Préparer vos questions et réponses</h4>
                <p className="text-gray-300 mb-3">
                  Anticipez les questions que le client pourrait vous poser et préparez des réponses claires. 
                  Identifiez également les points que vous souhaitez aborder pour approfondir votre compréhension 
                  de ses besoins et de son contexte.
                </p>
                
                <div className="bg-gray-800/60 p-4 rounded-md mb-4 border-l-4 border-blue-500">
                  <h5 className="font-semibold text-blue-200 mb-2">Questions stratégiques à préparer</h5>
                  <ul className="list-disc pl-5 text-gray-300 space-y-2">
                    <li>Quels sont vos objectifs à court et long terme pour ce projet ?</li>
                    <li>Quelles sont les contraintes principales (budget, délais, techniques) ?</li>
                    <li>Quels indicateurs de performance utiliserez-vous pour évaluer le succès du projet ?</li>
                  </ul>
                </div>
                
                <div className="flex flex-wrap gap-3 mt-4">
                  <Badge variant="outline" className="bg-blue-900/30 text-blue-200 border-blue-500/50">Questions ouvertes</Badge>
                  <Badge variant="outline" className="bg-blue-900/30 text-blue-200 border-blue-500/50">Réponses structurées</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Pendant l'entretien */}
      <div className="mb-10">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <span className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">2</span>
          Pendant l'entretien
        </h3>
        
        <div className="ml-12 space-y-6">
          <div className="bg-gradient-to-r from-purple-900/20 to-purple-800/20 p-5 rounded-lg border border-purple-700/30">
            <div className="flex items-start">
              <div className="bg-purple-600/40 p-3 rounded-full mr-4 hidden md:flex">
                <Ear className="w-6 h-6 text-purple-200" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-purple-300 mb-3">Écoute active et reformulation</h4>
                <p className="text-gray-300 mb-3">
                  Pratiquez l'écoute active en montrant votre intérêt pour les problématiques du client. 
                  Reformulez régulièrement ses propos pour confirmer votre compréhension et approfondir les points importants.
                </p>
                
                <div className="bg-gray-800/60 p-4 rounded-md mb-4 border-l-4 border-purple-500">
                  <h5 className="font-semibold text-purple-200 mb-2">Technique de reformulation</h5>
                  <div className="space-y-3">
                    <div className="pl-3 border-l-2 border-purple-400/50">
                      <p className="font-semibold text-gray-200">Client :</p>
                      <p className="text-gray-300">"Nous avons des problèmes de performance avec notre application métier qui ralentit le travail des équipes terrain."</p>
                    </div>
                    <div className="pl-3 border-l-2 border-purple-400/50">
                      <p className="font-semibold text-gray-200">Vous (reformulation) :</p>
                      <p className="text-gray-300">"Si je comprends bien, votre équipe terrain rencontre des difficultés opérationnelles importantes liées aux performances de l'application. Pourriez-vous me préciser quels processus métier sont les plus impactés ?"</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3 mt-4">
                  <Badge variant="outline" className="bg-purple-900/30 text-purple-200 border-purple-500/50">Validation de compréhension</Badge>
                  <Badge variant="outline" className="bg-purple-900/30 text-purple-200 border-purple-500/50">Questions d'approfondissement</Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-900/20 to-purple-800/20 p-5 rounded-lg border border-purple-700/30">
            <div className="flex items-start">
              <div className="bg-purple-600/40 p-3 rounded-full mr-4 hidden md:flex">
                <Lightbulb className="w-6 h-6 text-purple-200" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-purple-300 mb-3">Posture consultative</h4>
                <p className="text-gray-300 mb-3">
                  Adoptez une posture de conseil plutôt que de simple prestataire. Montrez comment votre expertise 
                  peut apporter une réelle valeur ajoutée au projet, en étant force de proposition tout en restant à l'écoute.
                </p>
                
                <div className="bg-gray-800/60 p-4 rounded-md mb-4 border-l-4 border-purple-500">
                  <h5 className="font-semibold text-purple-200 mb-2">Différencier la posture</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-red-900/20 p-3 rounded-md">
                      <h6 className="font-medium text-red-300 mb-2">❌ Posture de prestataire</h6>
                      <p className="text-gray-300 text-sm">"Nous pouvons développer exactement ce que vous demandez dans le délai imparti."</p>
                    </div>
                    <div className="bg-green-900/20 p-3 rounded-md">
                      <h6 className="font-medium text-green-300 mb-2">✅ Posture de consultant</h6>
                      <p className="text-gray-300 text-sm">"D'après votre besoin, je recommanderais une approche itérative qui permettrait de livrer de la valeur plus rapidement tout en minimisant les risques."</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3 mt-4">
                  <Badge variant="outline" className="bg-purple-900/30 text-purple-200 border-purple-500/50">Conseil stratégique</Badge>
                  <Badge variant="outline" className="bg-purple-900/30 text-purple-200 border-purple-500/50">Apport d'expertise</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Après l'entretien */}
      <div>
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <span className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">3</span>
          Après l'entretien
        </h3>
        
        <div className="ml-12 space-y-6">
          <div className="bg-gradient-to-r from-green-900/20 to-green-800/20 p-5 rounded-lg border border-green-700/30">
            <div className="flex items-start">
              <div className="bg-green-600/40 p-3 rounded-full mr-4 hidden md:flex">
                <LineChart className="w-6 h-6 text-green-200" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-green-300 mb-3">Analyse de votre performance</h4>
                <p className="text-gray-300 mb-3">
                  Après l'entretien, prenez le temps d'analyser votre performance. Identifiez vos points forts 
                  et les aspects à améliorer pour continuer à progresser dans vos compétences d'entretien client.
                </p>
                
                <div className="bg-gray-800/60 p-4 rounded-md mb-4 border-l-4 border-green-500">
                  <h5 className="font-semibold text-green-200 mb-2">Grille d'auto-évaluation</h5>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Compréhension des besoins client</span>
                      <div className="flex space-x-1">
                        {Array(5).fill(0).map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < 4 ? "text-amber-400" : "text-gray-600"}`} />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Qualité des questions posées</span>
                      <div className="flex space-x-1">
                        {Array(5).fill(0).map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < 3 ? "text-amber-400" : "text-gray-600"}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3 mt-4">
                  <Badge variant="outline" className="bg-green-900/30 text-green-200 border-green-500/50">Auto-évaluation</Badge>
                  <Badge variant="outline" className="bg-green-900/30 text-green-200 border-green-500/50">Points forts</Badge>
                  <Badge variant="outline" className="bg-green-900/30 text-green-200 border-green-500/50">Axes d'amélioration</Badge>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-900/20 to-green-800/20 p-5 rounded-lg border border-green-700/30">
            <div className="flex items-start">
              <div className="bg-green-600/40 p-3 rounded-full mr-4 hidden md:flex">
                <ClipboardSignature className="w-6 h-6 text-green-200" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-green-300 mb-3">Suivi et documentation</h4>
                <p className="text-gray-300 mb-3">
                  Documentez les points clés abordés pendant l'entretien et préparez une proposition 
                  ou un compte-rendu synthétique pour le client, démontrant votre compréhension de ses besoins.
                </p>
                
                <div className="bg-gray-800/60 p-4 rounded-md mb-4 border-l-4 border-green-500">
                  <h5 className="font-semibold text-green-200 mb-2">Structure d'un compte-rendu efficace</h5>
                  <ol className="list-decimal pl-5 text-gray-300 space-y-2">
                    <li><span className="font-medium text-green-300">Contexte et objectifs</span> - Rappel du contexte client et des objectifs de l'entretien</li>
                    <li><span className="font-medium text-green-300">Points clés discutés</span> - Synthèse des principales thématiques abordées</li>
                    <li><span className="font-medium text-green-300">Problématiques identifiées</span> - Liste des challenges et besoins exprimés</li>
                  </ol>
                </div>
                
                <div className="flex flex-wrap gap-3 mt-4">
                  <Badge variant="outline" className="bg-green-900/30 text-green-200 border-green-500/50">Synthèse</Badge>
                  <Badge variant="outline" className="bg-green-900/30 text-green-200 border-green-500/50">Proposition de valeur</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main component
const Mc2iInterviewPreparation: React.FC = () => {
  // States
  const [activeTab, setActiveTab] = useState("best-practices");
  const [isLoading, setIsLoading] = useState(false);
  const [isSimulationActive, setIsSimulationActive] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes
  const [simulationComplete, setSimulationComplete] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<any>(null);
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [, navigate] = useLocation();

  // Form setup
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      profileType: "",
      experienceLevel: "",
      sectorFocus: "",
    },
  });

  const contactForm = useForm<z.infer<typeof contactFormSchema>>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      recruiterEmail: "",
      candidateName: "",
    },
  });

  // Effects
  useEffect(() => {
    // Scroll to bottom of message list
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    // Cleanup timer
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Functions
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const resetSimulation = () => {
    setMessages([]);
    setUserInput("");
    setTimeRemaining(600);
    setSimulationComplete(false);
    setIsSimulationActive(false);
    setConversationHistory([]);
    setEvaluationResult(null);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startSimulation = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      console.log("Envoi de la requête API...");
      console.log("Payload:", {
        domain: "amoa",
        profileType: data.profileType,
        experienceLevel: data.experienceLevel,
        sectorFocus: data.sectorFocus
      });
      
      const response = await fetch("/api/amoa/interview-simulation/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          domain: "amoa",
          profileType: data.profileType,
          experienceLevel: data.experienceLevel,
          sectorFocus: data.sectorFocus
        }),
      });
      
      console.log("Réponse API status:", response.status);
      const responseData = await response.text();
      console.log("Réponse brute:", responseData);
      
      const data = JSON.parse(responseData);
      console.log("Données de réponse:", data);
      
      if (data.success && data.initialMessage) {
        console.log("Message initial:", data.initialMessage);
        
        // Générer un ID unique pour le message système
        const systemMessage: Message = {
          id: crypto.randomUUID(),
          role: 'system',
          content: "Vous participez à une simulation d'entretien client. Vous êtes un consultant AMOA et votre objectif est d'écouter activement, de poser des questions pertinentes et de proposer des solutions adaptées.",
          timestamp: new Date()
        };
        
        // Générer un ID unique pour le message de bienvenue
        const welcomeMessage: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: data.initialMessage,
          timestamp: new Date()
        };
        
        setMessages([systemMessage, welcomeMessage]);
        setConversationHistory([
          { role: "assistant", content: data.initialMessage }
        ]);
        setIsSimulationActive(true);
        setActiveTab("simulation");
        startTimer();
      } else {
        // Message de secours en cas d'erreur API
        console.error("Erreur de format dans la réponse:", data);
        
        const fallbackSystemMessage: Message = {
          id: crypto.randomUUID(),
          role: 'system',
          content: "Vous participez à une simulation d'entretien client. Vous êtes un consultant AMOA et votre objectif est d'écouter activement, de poser des questions pertinentes et de proposer des solutions adaptées.",
          timestamp: new Date()
        };
        
        const fallbackWelcomeMessage: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: "Bonjour, je suis Sophie Martin, Directrice des Systèmes d'Information chez EnerGreen. Nous cherchons à moderniser notre infrastructure IT pour mieux répondre aux enjeux de la transition énergétique. Pouvez-vous me parler de votre approche pour nous accompagner dans ce projet ?",
          timestamp: new Date()
        };
        
        setMessages([fallbackSystemMessage, fallbackWelcomeMessage]);
        setConversationHistory([
          { role: "assistant", content: fallbackWelcomeMessage.content }
        ]);
        setIsSimulationActive(true);
        setActiveTab("simulation");
        startTimer();
      }
    } catch (error) {
      console.error("Erreur lors du démarrage de la simulation:", error);
      toast({
        title: "Erreur",
        description: "Impossible de démarrer la simulation. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const skipInfoAndStart = () => {
    console.log("Fonction skipInfoAndStart appelée");
    
    const formValues = form.getValues();
    console.log("Valeurs du formulaire:", formValues);
    
    // Vérifier si tous les champs requis sont remplis
    if (!formValues.profileType || !formValues.experienceLevel || !formValues.sectorFocus) {
      toast({
        title: "Informations incomplètes",
        description: "Veuillez sélectionner un profil, un niveau d'expérience et un secteur d'activité.",
        variant: "destructive",
      });
      return;
    }
    
    startSimulation(formValues);
  };

  const sendMessage = async () => {
    if (!userInput.trim() || isLoading) return;
    
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: userInput,
      timestamp: new Date()
    };
    
    // Ajouter le message utilisateur à la liste de messages
    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    // Ajouter le message à l'historique de conversation
    setConversationHistory(prev => [...prev, { role: "user", content: userInput }]);
    
    // Réinitialiser l'input utilisateur
    setUserInput("");
    
    try {
      setIsLoading(true);
      
      const response = await fetch("/api/openai/chat", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: `Tu es Sophie Martin, DSI chez EnerGreen, une entreprise du secteur énergétique en pleine transformation digitale. 
              Tu mènes un entretien avec un consultant AMOA qui a un profil ${form.getValues().profileType} avec ${form.getValues().experienceLevel} d'expérience.
              
              Ton objectif est d'évaluer ses compétences et sa capacité à comprendre tes besoins. 
              Tu dois rester dans ton rôle de client, poser des questions pertinentes sur ton projet et réagir de façon réaliste aux propositions du consultant.
              
              Garde tes réponses concises (maximum 3-4 phrases) et pertinentes. Ne termine pas l'entretien prématurément.
              Si le consultant pose une question, réponds-y directement. Ne pose pas plus d'une question à la fois.`
            },
            ...conversationHistory,
          ],
          useSecondaryModel: true, // Utiliser gpt-4o-mini qui est plus rapide
          temperature: 0.7
        }),
      });
      
      if (!response.ok) {
        throw new Error("Erreur lors de la requête à l'API OpenAI");
      }
      
      const data = await response.json();
      
      if (data && data.choices && data.choices[0] && data.choices[0].message) {
        const aiResponse = data.choices[0].message.content;
        
        const aiMessage: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: aiResponse,
          timestamp: new Date()
        };
        
        // Ajouter la réponse de l'IA à la liste de messages
        setMessages(prevMessages => [...prevMessages, aiMessage]);
        
        // Ajouter le message à l'historique de conversation
        setConversationHistory(prev => [...prev, { role: "assistant", content: aiResponse }]);
      } else {
        // Message de secours en cas d'erreur
        const fallbackMessage: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: "Je vous remercie pour ces informations. Avez-vous identifié d'autres contraintes ou objectifs spécifiques pour ce projet de modernisation ?",
          timestamp: new Date()
        };
        
        setMessages(prevMessages => [...prevMessages, fallbackMessage]);
        setConversationHistory(prev => [...prev, { role: "assistant", content: fallbackMessage.content }]);
        
        console.error("Format de réponse inattendu:", data);
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const completeSimulation = async () => {
    if (messages.length < 2 || simulationComplete || isLoading) return;
    
    try {
      setIsLoading(true);
      setSimulationComplete(true);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      // Récupérer les paramètres du formulaire
      const formData = form.getValues();
      
      // Création du prompt système pour l'analyse
      const systemPrompt = {
        role: "system",
        content: `Tu es un expert en évaluation d'entretiens clients dans le contexte AMOA (Assistance à Maîtrise d'Ouvrage), spécialisé dans le secteur ${formData.sectorFocus}.
        
Tu dois analyser méticuleusement cette conversation entre Sophie Martin (DSI d'EnerGreen) et un consultant AMOA ayant les caractéristiques suivantes:
- Type de profil: ${formData.profileType}
- Niveau d'expérience: ${formData.experienceLevel}
- Secteur d'activité: ${formData.sectorFocus}

Adapte tes critères d'évaluation en fonction de son profil et de son niveau d'expérience.

Ton rôle est d'évaluer la performance du consultant selon ces critères:
1. Qualité de l'écoute et compréhension des besoins spécifiques au secteur ${formData.sectorFocus}
2. Pertinence des questions posées et capacité à approfondir les problématiques du secteur
3. Maîtrise des concepts AMOA et méthodologies projet adaptées au contexte ${formData.sectorFocus}
4. Capacité à proposer des solutions adaptées au niveau de maturité de l'entreprise
5. Professionnalisme et posture consultative attendue pour un profil ${formData.profileType}

${formData.experienceLevel === "0-2 ans" ? 
  "Pour un consultant junior, évalue principalement les connaissances fondamentales et la capacité d'apprentissage." : 
formData.experienceLevel === "2-5 ans" ? 
  "Pour un consultant confirmé, évalue la capacité à appliquer des méthodologies et à gérer des situations complexes." :
  "Pour un consultant expérimenté, évalue la vision stratégique, l'expertise sectorielle et la capacité à apporter une réelle valeur ajoutée."}

IMPORTANT: Tu dois produire UNIQUEMENT un objet JSON valide sans aucun texte avant ou après. N'utilise pas les délimiteurs de bloc de code \`\`\`json ou \`\`\`. Ton JSON doit être directement parsable par JSON.parse().

L'objet JSON doit contenir obligatoirement ces champs:
{
  "summary": "résumé global de la performance (150-200 mots)",
  "strengths": ["force 1", "force 2", "force 3", ...],
  "improvements": ["amélioration 1", "amélioration 2", "amélioration 3", ...],
  "detailedNotes": "analyse détaillée de la performance (300-350 mots)",
  "recommendations": ["recommandation 1", "recommandation 2", "recommandation 3", ...],
  "sectorFitEvaluation": "évaluation approfondie de la compréhension du secteur et spécificités métier (100-150 mots)",
  "conclusion": "conclusion et perspective d'évolution professionnelle (100-150 mots)"
}

Ton analyse doit:
- Être rigoureuse et utile pour le développement professionnel
- Être basée uniquement sur les échanges réels de la conversation
- Tenir compte des spécificités du secteur ${formData.sectorFocus}
- Adapter le niveau d'exigence au profil ${formData.profileType} et à l'expérience ${formData.experienceLevel}
- Mettre en évidence les compétences particulièrement importantes pour réussir dans le secteur ${formData.sectorFocus}`
      };
      
      // Ajout d'un message utilisateur pour préciser la demande
      const userPrompt = {
        role: "user",
        content: "Voici la transcription de l'entretien client avec le consultant AMOA. Fournis une évaluation détaillée de sa performance selon les critères indiqués.\n\n" + 
          conversationHistory.map(msg => 
            `${msg.role === 'assistant' ? "Sophie Martin (Cliente)" : "Consultant AMOA"}: ${msg.content}`
          ).join("\n\n")
      };
      
      // Appel à l'API OpenAI pour l'évaluation
      const response = await fetch("/api/openai/chat", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            systemPrompt,
            userPrompt
          ],
          useSecondaryModel: false, // Utiliser le modèle principal pour l'analyse
          temperature: 0.7
        }),
      });
      
      if (!response.ok) {
        throw new Error("Erreur lors de la requête à l'API OpenAI pour l'évaluation");
      }
      
      const data = await response.json();
      
      if (data && data.choices && data.choices[0] && data.choices[0].message) {
        const evaluationText = data.choices[0].message.content;
        console.log("Évaluation brute:", evaluationText);
        
        try {
          // Tentative de parsing direct
          const evaluationData = JSON.parse(evaluationText);
          setEvaluationResult(evaluationData);
          setActiveTab("evaluation");
        } catch (parseError) {
          console.error("Erreur lors du parsing JSON:", parseError);
          
          // Tentative de nettoyage et parsing
          try {
            const cleanedText = evaluationText
              .replace(/```json/g, '')
              .replace(/```/g, '')
              .trim();
            
            const evaluationData = JSON.parse(cleanedText);
            setEvaluationResult(evaluationData);
            setActiveTab("evaluation");
          } catch (secondParseError) {
            console.error("Erreur lors du second parsing JSON:", secondParseError);
            
            // Fallback: utiliser le texte brut
            setEvaluationResult({
              summary: "Impossible de formater l'évaluation en JSON. Veuillez consulter le texte brut ci-dessous.",
              detailedNotes: evaluationText,
              strengths: [],
              improvements: [],
              recommendations: [],
              sectorFitEvaluation: "",
              conclusion: ""
            });
            setActiveTab("evaluation");
            
            toast({
              title: "Avertissement",
              description: "Le formatage de l'évaluation a rencontré un problème, mais nous affichons les résultats en format texte.",
              variant: "warning",
            });
          }
        }
      } else {
        throw new Error("Format de réponse inattendu pour l'évaluation");
      }
    } catch (error) {
      console.error("Erreur lors de la complétion de la simulation:", error);
      toast({
        title: "Erreur",
        description: "Impossible de compléter la simulation. Veuillez réessayer.",
        variant: "destructive",
      });
      setSimulationComplete(false);
    } finally {
      setIsLoading(false);
    }
  };

  const onContactFormSubmit = (data: z.infer<typeof contactFormSchema>) => {
    // Dans une implémentation complète, vous enverriez ces données à un backend
    console.log("Données du formulaire de contact:", data);
    
    // Compléter la simulation avec les informations utilisateur
    setShowContactForm(false);
    
    toast({
      title: "Merci !",
      description: "Votre évaluation a été envoyée à l'adresse email indiquée.",
    });
  };

  // Return component JSX
  return (
    <HomeLayout>
      <div className="max-w-6xl mx-auto p-4">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-white">Simulation d'entretien client AMOA</h1>
          <p className="text-gray-300 mt-2 max-w-3xl mx-auto">
            Perfectionnez vos compétences en entretien client avec cette simulation interactive qui vous permet de pratiquer dans un environnement réaliste. Recevez un feedback détaillé pour améliorer votre approche.
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid grid-cols-3 bg-gray-800/50 border border-gray-700/50">
            <TabsTrigger value="best-practices" className="data-[state=active]:bg-blue-600/50">
              <FileCheck className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Bonnes pratiques</span>
              <span className="sm:hidden">Pratiques</span>
            </TabsTrigger>
            <TabsTrigger value="preparation" className="data-[state=active]:bg-purple-600/50" disabled={true}>
              <BriefcaseBusiness className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Préparation</span>
              <span className="sm:hidden">Préparer</span>
              <Badge variant="outline" className="ml-2 text-xs border-amber-500 text-amber-400">Bientôt disponible</Badge>
            </TabsTrigger>
            <TabsTrigger value="simulation" className="data-[state=active]:bg-green-600/50" disabled={true}>
              <User className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Simulation</span>
              <span className="sm:hidden">Simuler</span>
              <Badge variant="outline" className="ml-2 text-xs border-amber-500 text-amber-400">Bientôt disponible</Badge>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="best-practices">
            <BestPracticesContent setActiveTab={setActiveTab} />
          </TabsContent>
          
          <TabsContent value="preparation">
            <Card className="bg-gray-800/30 border-gray-700/50 shadow-lg">
              <CardHeader className="border-b border-gray-700/50">
                <div className="flex items-center">
                  <BriefcaseBusiness className="w-6 h-6 mr-2 text-purple-500" />
                  <CardTitle className="text-xl">Préparation de l'entretien</CardTitle>
                </div>
                <CardDescription className="text-gray-300">
                  Définissez les paramètres de la simulation pour un entretien adapté à votre profil
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="mb-4 bg-blue-900/20 p-4 rounded-md border border-blue-700/30">
                  <div className="flex items-center mb-2">
                    <Lightbulb className="w-5 h-5 text-yellow-500 mr-2" />
                    <h3 className="text-md font-semibold text-blue-200">Conseil de simulation</h3>
                  </div>
                  <p className="text-gray-300 text-sm">
                    Pour une expérience plus immersive, configurez la simulation avec des paramètres proches de votre profil réel ou de celui que vous souhaitez développer. Cela vous permettra de pratiquer des réponses authentiques et pertinentes.
                  </p>
                </div>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(startSimulation)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="profileType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Type de profil</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-gray-700/60 border-gray-600 text-white">
                                  <SelectValue placeholder="Sélectionnez un type de profil" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                                <SelectItem value="Profil junior">Consultant junior</SelectItem>
                                <SelectItem value="Profil confirmé">Consultant confirmé</SelectItem>
                                <SelectItem value="Profil senior">Consultant senior</SelectItem>
                                <SelectItem value="Profil expert">Consultant expert/manager</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription className="text-gray-400">
                              Le type de profil influence la complexité des questions posées
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="experienceLevel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Niveau d'expérience</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-gray-700/60 border-gray-600 text-white">
                                  <SelectValue placeholder="Sélectionnez un niveau d'expérience" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                                <SelectItem value="0-2 ans">0-2 ans</SelectItem>
                                <SelectItem value="2-5 ans">2-5 ans</SelectItem>
                                <SelectItem value="5-10 ans">5-10 ans</SelectItem>
                                <SelectItem value="10+ ans">10+ ans</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription className="text-gray-400">
                              L'expérience influence les attentes du client sur vos réponses
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="sectorFocus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Secteur d'activité du client</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-gray-700/60 border-gray-600 text-white">
                                <SelectValue placeholder="Sélectionnez un secteur d'activité" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-gray-800 border-gray-700 text-white">
                              <SelectItem value="Banque & Assurance">Banque & Assurance</SelectItem>
                              <SelectItem value="Énergie & Environnement">Énergie & Environnement</SelectItem>
                              <SelectItem value="Santé & Protection sociale">Santé & Protection sociale</SelectItem>
                              <SelectItem value="Secteur public">Secteur public</SelectItem>
                              <SelectItem value="Télécoms & Médias">Télécoms & Médias</SelectItem>
                              <SelectItem value="Transport & Logistique">Transport & Logistique</SelectItem>
                              <SelectItem value="Industrie & Distribution">Industrie & Distribution</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription className="text-gray-400">
                            Le secteur détermine le contexte métier de l'entretien
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="pt-4 border-t border-gray-700/50 flex justify-between">
                      <Button 
                        type="button" 
                        variant="ghost" 
                        className="text-gray-300 hover:text-white hover:bg-gray-700"
                        onClick={skipInfoAndStart}
                        disabled={!form.getValues().profileType || !form.getValues().experienceLevel || !form.getValues().sectorFocus}
                        title="Utilisera le profil, le niveau d'expérience et le secteur sélectionnés"
                      >
                        <TimerReset className="w-4 h-4 mr-2" />
                        Démarrer rapidement
                      </Button>
                      
                      <Button 
                        type="submit" 
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        disabled={isLoading}
                      >
                        {isLoading ? "Chargement..." : "Lancer l'entretien simulé"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="simulation">
            <Card className="bg-gray-800/30 border-gray-700/50 shadow-lg">
              <CardHeader className="border-b border-gray-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <UserCircle className="w-6 h-6 mr-2 text-yellow-500" />
                    <CardTitle className="text-xl">Simulation d'entretien client</CardTitle>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`${timeRemaining > 300 ? 'border-green-500 text-green-500' : timeRemaining > 60 ? 'border-yellow-500 text-yellow-500' : 'border-red-500 text-red-500'}`}
                  >
                    <Clock className="w-4 h-4 mr-1" />
                    {formatTime(timeRemaining)}
                  </Badge>
                </div>
                <CardDescription className="text-gray-300">
                  Entretien avec un client - Durée : 10 minutes
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {/* Conversation */}
                <div className="bg-gray-900/60 rounded-md p-4 mb-4 h-[400px] overflow-y-auto border border-gray-700/50">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`mb-4 p-3 rounded-lg ${
                        message.role === 'assistant'
                          ? 'bg-gray-800/80 mr-12'
                          : message.role === 'user' 
                            ? 'bg-gradient-to-r from-blue-700/50 to-blue-800/50 ml-12'
                            : 'hidden'
                      }`}
                    >
                      <div className="flex items-center mb-1">
                        {message.role === 'assistant' ? (
                          <>
                            <UserCircle className="w-5 h-5 mr-2 text-gray-300" />
                            <span className="text-sm font-bold text-gray-300">
                              Client
                            </span>
                          </>
                        ) : (
                          <>
                            <UserCircle className="w-5 h-5 mr-2 text-blue-300" />
                            <span className="text-sm font-bold text-blue-300">
                              Consultant (Vous)
                            </span>
                          </>
                        )}
                        <span className="text-xs ml-auto text-gray-400 opacity-70">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-white whitespace-pre-wrap">{message.content}</p>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                
                {/* Input */}
                <div className="flex items-center">
                  <Input
                    type="text"
                    placeholder="Saisissez votre message..."
                    className="flex-1 bg-gray-900/60 border-gray-700 text-white"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    disabled={isLoading || simulationComplete}
                  />
                  <Button
                    className="ml-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                    onClick={sendMessage}
                    disabled={isLoading || simulationComplete || !userInput.trim()}
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t border-gray-700/50 pt-4">
                <Button
                  onClick={() => { 
                    resetSimulation();
                    setActiveTab('best-practices');
                  }}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Retour aux bonnes pratiques
                </Button>
                <Button
                  onClick={() => {
                    resetSimulation();
                    setActiveTab('preparation');
                  }}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 mx-2"
                >
                  Nouvelle simulation
                </Button>
                <Button
                  onClick={completeSimulation}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                  disabled={messages.length < 2 || simulationComplete || isLoading}
                >
                  {isLoading ? "Chargement..." : "Terminer la simulation"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="evaluation">
            <Card className="bg-gray-800/30 border-gray-700/50 shadow-lg">
              <CardHeader className="border-b border-gray-700/50">
                <div className="flex items-center">
                  <CheckCircle className="w-6 h-6 mr-2 text-green-500" />
                  <CardTitle className="text-xl">Évaluation de l'entretien client</CardTitle>
                </div>
                <CardDescription className="text-gray-300">
                  Analyse de votre performance en tant que consultant durant l'entretien client
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {evaluationResult ? (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-gray-800/60 to-gray-700/60 p-5 rounded-md border border-gray-600/50">
                      <h3 className="text-lg font-semibold mb-2">Résumé de l'entretien</h3>
                      <p className="text-gray-300 mb-4">
                        {evaluationResult.summary || "Aucun résumé disponible."}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gradient-to-r from-green-900/30 to-green-800/30 p-5 rounded-md border border-green-700/30">
                        <h3 className="text-lg font-semibold mb-3 text-green-300">Forces identifiées</h3>
                        <ul className="list-disc ml-5 space-y-2 text-gray-300">
                          {evaluationResult.strengths && evaluationResult.strengths.map((strength: string, index: number) => (
                            <li key={`strength-${index}`} className="flex items-start">
                              <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                              <span>{strength}</span>
                            </li>
                          ))}
                          {(!evaluationResult.strengths || evaluationResult.strengths.length === 0) && (
                            <li>Aucune force identifiée</li>
                          )}
                        </ul>
                      </div>
                      
                      <div className="bg-gradient-to-r from-amber-900/30 to-amber-800/30 p-5 rounded-md border border-amber-700/30">
                        <h3 className="text-lg font-semibold mb-3 text-amber-300">Axes d'amélioration</h3>
                        <ul className="list-disc ml-5 space-y-2 text-gray-300">
                          {evaluationResult.improvements && evaluationResult.improvements.map((improvement: string, index: number) => (
                            <li key={`improvement-${index}`} className="flex items-start">
                              <AlertCircle className="w-4 h-4 text-amber-500 mr-2 mt-1 flex-shrink-0" />
                              <span>{improvement}</span>
                            </li>
                          ))}
                          {(!evaluationResult.improvements || evaluationResult.improvements.length === 0) && (
                            <li>Aucun axe d'amélioration identifié</li>
                          )}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-gray-800/60 to-gray-700/60 p-5 rounded-md border border-gray-600/50">
                      <h3 className="text-lg font-semibold mb-2">Notes détaillées</h3>
                      <p className="text-gray-300 whitespace-pre-wrap">
                        {evaluationResult.detailedNotes || "Aucune note détaillée disponible."}
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-blue-900/30 to-blue-800/30 p-5 rounded-md border border-blue-700/30">
                      <h3 className="text-lg font-semibold mb-3 text-blue-300">Recommandations</h3>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-300">
                        {evaluationResult.recommendations && evaluationResult.recommendations.map((recommendation: string, index: number) => (
                          <li key={`recommendation-${index}`} className="flex items-start bg-blue-900/20 p-3 rounded-md">
                            <Sparkles className="w-4 h-4 text-blue-400 mr-2 mt-1 flex-shrink-0" />
                            <span>{recommendation}</span>
                          </li>
                        ))}
                        {(!evaluationResult.recommendations || evaluationResult.recommendations.length === 0) && (
                          <li>Aucune recommandation disponible</li>
                        )}
                      </ul>
                    </div>
                    
                    <div className="bg-gradient-to-r from-purple-900/30 to-purple-800/30 p-5 rounded-md border border-purple-700/30">
                      <h3 className="text-lg font-semibold mb-2 text-purple-300">Compréhension de la problématique client</h3>
                      <p className="text-gray-300 mb-2">
                        {evaluationResult.sectorFitEvaluation || "Aucune évaluation de la compréhension de la problématique client disponible."}
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-indigo-900/30 to-indigo-800/30 p-5 rounded-md border border-indigo-700/30">
                      <h3 className="text-lg font-semibold mb-2 text-indigo-300">Conclusion</h3>
                      <p className="text-gray-300 mb-2">
                        {evaluationResult.conclusion || "Aucune conclusion disponible."}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8">
                    <AlertCircle className="w-16 h-16 text-gray-400 mb-4" />
                    <h3 className="text-xl font-bold mb-2">Aucune évaluation disponible</h3>
                    <p className="text-gray-300 text-center mb-4">
                      Vous n'avez pas encore terminé la simulation ou une erreur s'est produite lors de l'évaluation.
                    </p>
                    <Button onClick={resetSimulation} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                      Démarrer une nouvelle simulation
                    </Button>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between border-t border-gray-700/50 pt-4">
                <Button
                  onClick={() => {
                    resetSimulation();
                    setActiveTab('best-practices');
                  }}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Retour aux bonnes pratiques
                </Button>
                <Button
                  onClick={() => {
                    resetSimulation();
                    setActiveTab('preparation');
                  }}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  Nouvelle simulation
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Formulaire de contact final */}
      <Dialog open={showContactForm} onOpenChange={setShowContactForm}>
        <DialogContent className="bg-gray-800 text-white border-gray-700">
          <DialogHeader>
            <DialogTitle>Informations nécessaires pour l'évaluation finale</DialogTitle>
            <DialogDescription className="text-gray-300">
              Pour recevoir l'évaluation de votre entretien client, veuillez compléter les informations suivantes.
            </DialogDescription>
          </DialogHeader>
          <Form {...contactForm}>
            <form onSubmit={contactForm.handleSubmit(onContactFormSubmit)} className="space-y-4">
              <FormField
                control={contactForm.control}
                name="recruiterEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Votre email professionnel</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="votre.email@entreprise.fr" 
                        className="bg-gray-700/60 border-gray-600 text-white"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={contactForm.control}
                name="candidateName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Votre nom complet</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Prénom Nom" 
                        className="bg-gray-700/60 border-gray-600 text-white"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button 
                  type="submit" 
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                  disabled={isLoading}
                >
                  {isLoading ? "Chargement..." : "Continuer"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </HomeLayout>
  );
};

export default Mc2iInterviewPreparation;