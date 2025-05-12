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
  Lightbulb
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
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// Interface pour la structure des messages
interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

// Formulaires
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
  const [activeSection, setActiveSection] = useState<string>("before");
  
  return (
    <div className="px-8 py-6 bg-gradient-to-b from-gray-900 to-gray-950 rounded-lg">
      {/* Section title */}
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Guide complet pour réussir vos entretiens client</h2>
        <p className="text-blue-100 max-w-3xl mx-auto">
          Ce guide structuré vous aidera à naviguer avec assurance à travers les différentes phases d'un entretien client, 
          en fournissant des conseils pratiques et des exemples concrets à chaque étape.
        </p>
      </div>
      
      {/* Navigation tabs */}
      <div className="flex justify-center mb-8 border-b border-gray-700/50">
        <button 
          onClick={() => setActiveSection("before")}
          className={`px-4 py-3 font-medium text-lg transition-colors ${activeSection === "before" 
            ? "text-blue-400 border-b-2 border-blue-400" 
            : "text-gray-400 hover:text-blue-300"}`}
        >
          <div className="flex items-center">
            <ClipboardCheck className="w-5 h-5 mr-2" />
            Avant l'entretien
          </div>
        </button>
        <button 
          onClick={() => setActiveSection("during")}
          className={`px-4 py-3 font-medium text-lg transition-colors ${activeSection === "during" 
            ? "text-purple-400 border-b-2 border-purple-400" 
            : "text-gray-400 hover:text-purple-300"}`}
        >
          <div className="flex items-center">
            <MessageCircle className="w-5 h-5 mr-2" />
            Pendant l'entretien
          </div>
        </button>
        <button 
          onClick={() => setActiveSection("after")}
          className={`px-4 py-3 font-medium text-lg transition-colors ${activeSection === "after" 
            ? "text-green-400 border-b-2 border-green-400" 
            : "text-gray-400 hover:text-green-300"}`}
        >
          <div className="flex items-center">
            <ClipboardList className="w-5 h-5 mr-2" />
            Après l'entretien
          </div>
        </button>
      </div>
      
      {/* Before section */}
      <div className="mb-10">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">1</span>
          Avant l'entretien
        </h3>
        
        <div className="ml-12 space-y-6">
          <div className="bg-gray-800/50 p-5 rounded-lg border border-gray-700/50 relative">
            <h4 className="text-lg font-semibold text-blue-200 mb-2">Comprendre le contexte client</h4>
            <p className="text-gray-300 mb-4">Prenez le temps d'analyser le contexte de l'entreprise cliente, son secteur d'activité, et ses enjeux stratégiques. Une compréhension approfondie de son environnement vous permettra de mieux appréhender ses besoins et d'adapter votre discours.</p>
            <div className="flex flex-wrap gap-3 mt-4">
              <Badge variant="outline" className="bg-blue-900/30 text-blue-200 border-blue-500/50">Analyse préalable</Badge>
              <Badge variant="outline" className="bg-blue-900/30 text-blue-200 border-blue-500/50">Recherche sectorielle</Badge>
              <Badge variant="outline" className="bg-blue-900/30 text-blue-200 border-blue-500/50">Veille stratégique</Badge>
            </div>
            <button 
              className="absolute top-4 right-4 text-green-400 hover:text-green-500"
              onClick={() => incrementProgress('preparation')}
            >
              <CheckCircle className="w-6 h-6" />
            </button>
          </div>
          
          <div className="bg-gray-800/50 p-5 rounded-lg border border-gray-700/50 relative">
            <h4 className="text-lg font-semibold text-blue-200 mb-2">Préparer vos questions</h4>
            <p className="text-gray-300 mb-4">Avant l'entretien, préparez une liste de questions pertinentes qui vous permettront d'identifier précisément les besoins et contraintes du client. Ces questions doivent couvrir les aspects techniques, organisationnels, et stratégiques du projet.</p>
            <div className="flex flex-wrap gap-3 mt-4">
              <Badge variant="outline" className="bg-blue-900/30 text-blue-200 border-blue-500/50">Questions stratégiques</Badge>
              <Badge variant="outline" className="bg-blue-900/30 text-blue-200 border-blue-500/50">Questions opérationnelles</Badge>
              <Badge variant="outline" className="bg-blue-900/30 text-blue-200 border-blue-500/50">Questions techniques</Badge>
            </div>
            <button 
              className="absolute top-4 right-4 text-green-400 hover:text-green-500"
              onClick={() => incrementProgress('preparation')}
            >
              <CheckCircle className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
      
      {/* During section */}
      <div className="mb-10">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <span className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">2</span>
          Pendant l'entretien
        </h3>
        
        <div className="ml-12 space-y-6">
          <div className="bg-gray-800/50 p-5 rounded-lg border border-gray-700/50 relative">
            <h4 className="text-lg font-semibold text-purple-200 mb-2">Écoute active et reformulation</h4>
            <p className="text-gray-300 mb-4">Pratiquez l'écoute active en montrant votre intérêt pour les problématiques du client. Reformulez régulièrement ses propos pour confirmer votre compréhension et approfondir les points importants.</p>
            <div className="flex flex-wrap gap-3 mt-4">
              <Badge variant="outline" className="bg-purple-900/30 text-purple-200 border-purple-500/50">Validation de compréhension</Badge>
              <Badge variant="outline" className="bg-purple-900/30 text-purple-200 border-purple-500/50">Questions d'approfondissement</Badge>
            </div>
            <button 
              className="absolute top-4 right-4 text-green-400 hover:text-green-500"
              onClick={() => incrementProgress('during')}
            >
              <CheckCircle className="w-6 h-6" />
            </button>
          </div>
          
          <div className="bg-gray-800/50 p-5 rounded-lg border border-gray-700/50 relative">
            <h4 className="text-lg font-semibold text-purple-200 mb-2">Posture consultative</h4>
            <p className="text-gray-300 mb-4">Adoptez une posture de conseil plutôt que de simple prestataire. Montrez comment votre expertise peut apporter une réelle valeur ajoutée au projet, en étant force de proposition tout en restant à l'écoute.</p>
            <div className="flex flex-wrap gap-3 mt-4">
              <Badge variant="outline" className="bg-purple-900/30 text-purple-200 border-purple-500/50">Conseil stratégique</Badge>
              <Badge variant="outline" className="bg-purple-900/30 text-purple-200 border-purple-500/50">Apport d'expertise</Badge>
            </div>
            <button 
              className="absolute top-4 right-4 text-green-400 hover:text-green-500"
              onClick={() => incrementProgress('during')}
            >
              <CheckCircle className="w-6 h-6" />
            </button>
          </div>
          
          <div className="bg-gray-800/50 p-5 rounded-lg border border-gray-700/50 relative">
            <h4 className="text-lg font-semibold text-purple-200 mb-2">Structuration de votre discours</h4>
            <p className="text-gray-300 mb-4">Présentez vos idées de façon structurée et cohérente. Utilisez des exemples concrets de projets similaires pour illustrer vos propos, en veillant à ne pas divulguer d'informations confidentielles sur d'autres clients.</p>
            <div className="flex flex-wrap gap-3 mt-4">
              <Badge variant="outline" className="bg-purple-900/30 text-purple-200 border-purple-500/50">Clarté</Badge>
              <Badge variant="outline" className="bg-purple-900/30 text-purple-200 border-purple-500/50">Exemples concrets</Badge>
              <Badge variant="outline" className="bg-purple-900/30 text-purple-200 border-purple-500/50">Approche méthodique</Badge>
            </div>
            <button 
              className="absolute top-4 right-4 text-green-400 hover:text-green-500"
              onClick={() => incrementProgress('during')}
            >
              <CheckCircle className="w-6 h-6" />
            </button>
          </div>
          
          <div className="bg-gray-800/50 p-5 rounded-lg border border-gray-700/50 relative">
            <h4 className="text-lg font-semibold text-purple-200 mb-2">Démonstration de vos compétences</h4>
            <p className="text-gray-300 mb-4">Mettez en avant vos compétences techniques et méthodologiques en AMOA, en les reliant directement aux besoins exprimés par le client. Montrez comment votre expertise peut s'appliquer concrètement à son contexte spécifique.</p>
            <div className="flex flex-wrap gap-3 mt-4">
              <Badge variant="outline" className="bg-purple-900/30 text-purple-200 border-purple-500/50">Expertise AMOA</Badge>
              <Badge variant="outline" className="bg-purple-900/30 text-purple-200 border-purple-500/50">Méthodologies projet</Badge>
              <Badge variant="outline" className="bg-purple-900/30 text-purple-200 border-purple-500/50">Outils et techniques</Badge>
            </div>
            <button 
              className="absolute top-4 right-4 text-green-400 hover:text-green-500"
              onClick={() => incrementProgress('during')}
            >
              <CheckCircle className="w-6 h-6" />
            </button>
          </div>
          
          <div className="bg-gray-800/50 p-5 rounded-lg border border-gray-700/50 relative">
            <h4 className="text-lg font-semibold text-purple-200 mb-2">Gestion des objections</h4>
            <p className="text-gray-300 mb-4">Soyez préparé à répondre aux objections ou aux préoccupations du client. Abordez-les avec professionnalisme et apportez des réponses concrètes qui démontrent votre capacité à anticiper et surmonter les obstacles potentiels.</p>
            <div className="flex flex-wrap gap-3 mt-4">
              <Badge variant="outline" className="bg-purple-900/30 text-purple-200 border-purple-500/50">Anticipation des risques</Badge>
              <Badge variant="outline" className="bg-purple-900/30 text-purple-200 border-purple-500/50">Solutions alternatives</Badge>
            </div>
            <button 
              className="absolute top-4 right-4 text-green-400 hover:text-green-500"
              onClick={() => incrementProgress('during')}
            >
              <CheckCircle className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
      
      {/* After section */}
      <div>
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <span className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">3</span>
          Après l'entretien
        </h3>
        
        <div className="ml-12 space-y-6">
          <div className="bg-gray-800/50 p-5 rounded-lg border border-gray-700/50 relative">
            <h4 className="text-lg font-semibold text-green-200 mb-2">Analyse de votre performance</h4>
            <p className="text-gray-300 mb-4">Après l'entretien, prenez le temps d'analyser votre performance. Identifiez vos points forts et les aspects à améliorer pour continuer à progresser dans vos compétences d'entretien client.</p>
            <div className="flex flex-wrap gap-3 mt-4">
              <Badge variant="outline" className="bg-green-900/30 text-green-200 border-green-500/50">Auto-évaluation</Badge>
              <Badge variant="outline" className="bg-green-900/30 text-green-200 border-green-500/50">Points forts</Badge>
              <Badge variant="outline" className="bg-green-900/30 text-green-200 border-green-500/50">Axes d'amélioration</Badge>
            </div>
            <button 
              className="absolute top-4 right-4 text-green-400 hover:text-green-500"
              onClick={() => incrementProgress('after')}
            >
              <CheckCircle className="w-6 h-6" />
            </button>
          </div>
          
          <div className="bg-gray-800/50 p-5 rounded-lg border border-gray-700/50 relative">
            <h4 className="text-lg font-semibold text-green-200 mb-2">Suivi et documentation</h4>
            <p className="text-gray-300 mb-4">Documentez les points clés abordés pendant l'entretien et préparez une proposition ou un compte-rendu synthétique pour le client, démontrant votre compréhension de ses besoins et votre capacité à y répondre.</p>
            <div className="flex flex-wrap gap-3 mt-4">
              <Badge variant="outline" className="bg-green-900/30 text-green-200 border-green-500/50">Synthèse</Badge>
              <Badge variant="outline" className="bg-green-900/30 text-green-200 border-green-500/50">Proposition de valeur</Badge>
            </div>
            <button 
              className="absolute top-4 right-4 text-green-400 hover:text-green-500"
              onClick={() => incrementProgress('after')}
            >
              <CheckCircle className="w-6 h-6" />
            </button>
          </div>
          
          <div className="bg-gray-800/50 p-5 rounded-lg border border-gray-700/50 relative">
            <h4 className="text-lg font-semibold text-green-200 mb-2">Application concrète</h4>
            <p className="text-gray-300 mb-4">Testez vos compétences dans une simulation d'entretien client réaliste. Cette pratique vous permettra d'affiner votre approche et de renforcer votre confiance pour vos futurs entretiens professionnels.</p>
            <div className="flex flex-wrap gap-3 mt-4">
              <Badge variant="outline" className="bg-green-900/30 text-green-200 border-green-500/50">Simulation</Badge>
              <Badge variant="outline" className="bg-green-900/30 text-green-200 border-green-500/50">Feedback</Badge>
              <Badge variant="outline" className="bg-green-900/30 text-green-200 border-green-500/50">Apprentissage continu</Badge>
            </div>
            <button 
              className="absolute top-4 right-4 bg-blue-500 hover:bg-blue-600 rounded-full p-1"
              onClick={() => setActiveTab && setActiveTab('preparation')}
            >
              <Sparkles className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant principal
const Mc2iInterviewPreparation: React.FC = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // États
  const [activeTab, setActiveTab] = useState<string>('best-practices');
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSimulationActive, setIsSimulationActive] = useState<boolean>(false);
  const [simulationComplete, setSimulationComplete] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(600); // 10 minutes
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);
  const [showContactForm, setShowContactForm] = useState<boolean>(false);
  const [evaluationResult, setEvaluationResult] = useState<any>(null);
  
  // Formulaires
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      profileType: "Profil consultant",
      experienceLevel: "3-5 ans",
      sectorFocus: "Énergie & Environnement",
    },
  });
  
  const contactForm = useForm<z.infer<typeof contactFormSchema>>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      recruiterEmail: "",
      candidateName: "",
    },
  });
  
  // Scroll automatique vers le bas de la conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Vérifier si le temps est écoulé
  useEffect(() => {
    if (timeRemaining === 0 && isSimulationActive) {
      completeSimulation();
    }
  }, [timeRemaining]);
  
  // Formatter le temps
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Démarrage de la simulation avec génération IA du premier message
  const startSimulation = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    
    try {
      // Création du prompt système pour le premier message
      const systemPrompt = {
        role: "system",
        content: `Tu es Sophie Martin, Directrice des Systèmes d'Information de l'entreprise EnerGreen, spécialisée dans le secteur ${values.sectorFocus}.

Le consultant AMOA que tu vas rencontrer a le profil suivant:
- Type de profil: ${values.profileType}
- Niveau d'expérience: ${values.experienceLevel}

Ton entreprise fait face à des défis spécifiques liés au secteur ${values.sectorFocus}. Adapte complètement ton discours, ta problématique et tes attentes à ce secteur.

Dans ton message d'introduction, tu dois:
1. Te présenter (nom, poste, entreprise)
2. Expliquer le contexte de ton entreprise avec des détails propres au secteur ${values.sectorFocus}
3. Présenter une problématique principale spécifique à ton secteur (pas uniquement générique)
4. Mentionner des difficultés techniques ou organisationnelles précises liées à ton secteur
5. Demander au consultant de se présenter et d'expliquer comment son expérience pourrait aider dans ce contexte

Si le secteur est "Banque & Assurance", parle de conformité réglementaire, gestion des risques, et transformation digitale des services financiers.
Si le secteur est "Énergie & Environnement", évoque la transition énergétique, l'optimisation de la production, et les enjeux de durabilité.
Si le secteur est "Santé & Protection sociale", mentionne la gestion des données patients, la continuité des soins, et la coordination des acteurs de santé.
Si le secteur est "Secteur public", aborde la modernisation des services publics, la simplification administrative, et la relation citoyenne.
Si le secteur est "Télécoms & Médias", parle des infrastructures réseau, services numériques, et expérience utilisateur omnicanale.
Si le secteur est "Transport & Logistique", évoque l'optimisation des chaînes logistiques, la planification des transports, et le suivi en temps réel.
Si le secteur est "Industrie & Distribution", mentionne l'industrie 4.0, la supply chain, et l'optimisation des processus de production.

Si le consultant a peu d'expérience (0-2 ans), prépare une problématique plus accessible et guidée.
Si le consultant est très expérimenté (5+ ans), présente un cas complexe avec des enjeux stratégiques et organisationnels importants.

Ton message doit être professionnel, concis (maximum 10 lignes) mais très spécifique au secteur ${values.sectorFocus}.`
      };
      
      // Message utilisateur pour générer l'introduction
      const userPrompt = {
        role: "user",
        content: `Génère un message d'introduction pour un entretien client dans le secteur ${values.sectorFocus}.`
      };
      
      // Appel à l'API OpenAI existante pour générer le message d'introduction
      const response = await fetch('/api/openai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [systemPrompt, userPrompt],
          useSecondaryModel: true, // Utiliser gpt-4o-mini qui est plus rapide
          temperature: 0.7
        }),
      });
      
      if (!response.ok) {
        throw new Error("Erreur lors de la requête à l'API OpenAI");
      }
      
      const data = await response.json();
      
      if (data && data.choices && data.choices[0] && data.choices[0].message) {
        const systemMessage: Message = {
          id: 'system-1',
          role: 'system',
          content: 'Cette simulation vous permet de pratiquer un entretien avec un client réel. Vous êtes consultant AMOA et vous devez comprendre sa problématique, poser des questions pertinentes et démontrer votre expertise.',
          timestamp: new Date(),
        };
        
        const welcomeMessage: Message = {
          id: 'assistant-1',
          role: 'assistant',
          content: data.choices[0].message.content,
          timestamp: new Date(),
        };
        
        setMessages([systemMessage, welcomeMessage]);
        setIsSimulationActive(true);
        setActiveTab('simulation');
        
        const timer = setInterval(() => {
          setTimeRemaining(prevTime => {
            if (prevTime <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prevTime - 1;
          });
        }, 1000);
        
        setTimerId(timer);
      } else {
        throw new Error("Format de réponse inattendu");
      }
    } catch (error) {
      console.error('Erreur lors du démarrage de la simulation:', error);
      
      // Message d'erreur plus descriptif
      let errorMessage = "Impossible de démarrer la simulation. ";
      
      // Vérifier si c'est une erreur réseau
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage += "Problème de connexion au serveur. Vérifiez votre connexion Internet.";
      } 
      // Vérifier si l'erreur contient un message de réponse
      else if (error instanceof Error && error.message.includes('OpenAI')) {
        errorMessage += "Erreur lors de la communication avec l'API IA. Veuillez réessayer dans quelques instants.";
      }
      // Erreur par défaut
      else {
        errorMessage += "Une erreur inattendue s'est produite. Veuillez réessayer.";
      }
      
      toast({
        title: "Erreur de simulation",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Créer un message de simulation de repli pour permettre de continuer même si l'IA échoue
      const fallbackSystemMessage: Message = {
        id: 'system-1',
        role: 'system',
        content: 'Cette simulation vous permet de pratiquer un entretien avec un client. Vous êtes consultant AMOA et vous devez comprendre sa problématique et démontrer votre expertise.',
        timestamp: new Date(),
      };
      
      const fallbackWelcomeMessage: Message = {
        id: 'assistant-1',
        role: 'assistant',
        content: `Bonjour, je suis Sophie Martin, Directrice des Systèmes d'Information chez EnerGreen, entreprise spécialisée dans le secteur ${values.sectorFocus}. Notre société fait face à d'importants défis de transformation numérique, notamment pour optimiser nos processus métiers et moderniser notre système de gestion. Nos équipes manquent d'expertise en conduite du changement et nous recherchons un consultant AMOA pour nous accompagner. Pouvez-vous vous présenter et m'expliquer comment votre expertise pourrait nous aider ?`,
        timestamp: new Date(),
      };
      
      setMessages([fallbackSystemMessage, fallbackWelcomeMessage]);
      setIsSimulationActive(true);
      setActiveTab('simulation');
      
      const timer = setInterval(() => {
        setTimeRemaining(prevTime => {
          if (prevTime <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
      
      setTimerId(timer);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fonction pour démarrer avec les paramètres actuellement sélectionnés
  const skipInfoAndStart = () => {
    // Utiliser les valeurs actuelles du formulaire plutôt que des valeurs codées en dur
    const currentValues = form.getValues();
    const values = {
      recruiterEmail: "",
      candidateName: "",
      profileType: currentValues.profileType,
      experienceLevel: currentValues.experienceLevel,
      sectorFocus: currentValues.sectorFocus,
    };
    
    // Démarrer la simulation avec les valeurs actuelles
    startSimulation(values);
  };
  
  // Fonction pour envoyer un message et recevoir une réponse générée par IA
  const sendMessage = async () => {
    if (!userInput.trim() || isLoading) return;
    
    // Créer le message utilisateur
    const userMessage: Message = {
      id: `user-${messages.length + 1}`,
      role: 'user',
      content: userInput,
      timestamp: new Date(),
    };
    
    // Ajouter le message utilisateur à la conversation
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);
    
    try {
      // Préparation des données pour l'IA
      const conversationHistory = messages
        .filter(msg => msg.role !== 'system')
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));
      
      // Ajout du nouveau message de l'utilisateur
      conversationHistory.push({
        role: 'user',
        content: userInput
      });
      
      // Récupérer les paramètres du formulaire
      const formData = form.getValues();
      
      // Création du prompt système pour guider la réponse du client IA
      const systemPrompt = {
        role: "system",
        content: `Tu es Sophie Martin, Directrice des Systèmes d'Information de l'entreprise EnerGreen, spécialisée dans le secteur ${formData.sectorFocus}.

Tu es en entretien avec un consultant AMOA ayant les caractéristiques suivantes:
- Type de profil: ${formData.profileType}
- Niveau d'expérience: ${formData.experienceLevel}

Tu adaptes ton niveau d'exigence et ta façon de communiquer en fonction de son profil et de son expérience.

Voici le contexte spécifique à ton secteur ${formData.sectorFocus}:
${formData.sectorFocus === "Banque & Assurance" ? 
  "- Ton entreprise doit mettre en place un système de gestion des risques conforme aux nouvelles réglementations financières\n- Vous devez moderniser vos processus de conformité tout en améliorant l'expérience client\n- Le système actuel est fragmenté et peu sécurisé" : 
formData.sectorFocus === "Énergie & Environnement" ? 
  "- Ton entreprise développe des solutions pour la transition énergétique et l'optimisation des ressources\n- Vous devez intégrer vos différents systèmes de gestion de production et distribution\n- L'architecture informatique actuelle n'est pas adaptée aux enjeux de durabilité et d'innovation" :
formData.sectorFocus === "Santé & Protection sociale" ? 
  "- Ton entreprise doit mettre en place un système de gestion des données patients conforme au RGPD\n- Vous devez optimiser la coordination entre les différents acteurs de santé\n- Les systèmes actuels sont cloisonnés et ne permettent pas une vision intégrée du parcours patient" :
formData.sectorFocus === "Secteur public" ?
  "- Ton organisation doit moderniser ses services digitaux pour les citoyens\n- Vous devez simplifier les procédures administratives tout en renforçant la sécurité\n- Les systèmes existants sont obsolètes et peu interopérables" :
formData.sectorFocus === "Télécoms & Médias" ?
  "- Ton entreprise doit transformer son infrastructure réseau et ses plateformes de services\n- Vous devez améliorer l'expérience utilisateur omnicanale et personnalisée\n- Les systèmes actuels ne permettent pas l'agilité nécessaire face à la concurrence" :
formData.sectorFocus === "Transport & Logistique" ?
  "- Ton entreprise doit optimiser sa chaîne logistique et sa planification des transports\n- Vous devez mettre en place un suivi en temps réel des flux et des ressources\n- Les outils actuels sont disparates et manquent de précision" :
  "- Ton entreprise doit moderniser ses processus de production et sa supply chain\n- Vous devez mettre en place des solutions d'industrie 4.0 et d'automatisation\n- Les systèmes actuels ne permettent pas une vision intégrée de la chaîne de valeur"}

Dans cet entretien:
1. Tu dois évaluer rigoureusement les compétences AMOA du consultant
2. Pose des questions PRÉCISES et CHALLENGEANTES sur les concepts AMOA, adaptées au secteur ${formData.sectorFocus}
3. Réagis de manière réaliste aux réponses du consultant, en creusant les points flous ou incomplets
4. Si le consultant propose une méthode ou solution, demande des détails concrets sur sa mise en œuvre
5. Concentre-toi sur des problématiques spécifiques à ${formData.sectorFocus}
6. Adapte ton niveau d'exigence technique au niveau d'expérience du consultant: ${formData.experienceLevel}

${formData.experienceLevel === "0-2 ans" ? 
  "Comme le consultant est junior, sois pédagogique mais attentive à ses connaissances de base en AMOA" : 
formData.experienceLevel === "2-5 ans" ? 
  "Comme le consultant est confirmé, teste sa capacité à appliquer des méthodologies projet dans des cas concrets" :
  "Comme le consultant est expérimenté/senior, challenge sa vision stratégique et sa capacité à gérer des projets complexes"}

Ta réponse doit:
- Être concise (max 4-5 phrases)
- Réagir spécifiquement au dernier message du consultant
- Poser une nouvelle question pour approfondir un aspect AMOA ou challenger le consultant
- Rester dans le contexte spécifique du projet dans le secteur ${formData.sectorFocus}

Ne termine pas l'entretien avant que le consultant ne l'ait demandé ou que vous ayez échangé au moins 5 fois.`
      };
      
      // Appel à l'API OpenAI existante pour générer la réponse
      const response = await fetch('/api/openai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            systemPrompt,
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
        // Créer le message du client avec la réponse générée par IA
        const aiMessage: Message = {
          id: `assistant-${messages.length + 1}`,
          role: 'assistant',
          content: data.choices[0].message.content,
          timestamp: new Date(),
        };
        
        // Ajouter le message du client à la conversation
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error("Format de réponse inattendu");
      }
    } catch (error) {
      console.error('Erreur lors de la génération de la réponse:', error);
      
      // Message d'erreur plus descriptif
      let errorMessage = "Impossible de générer une réponse IA. ";
      
      // Vérifier si c'est une erreur réseau
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage += "Problème de connexion au serveur. Vérifiez votre connexion Internet.";
      } 
      // Vérifier si l'erreur contient un message de réponse
      else if (error instanceof Error && error.message.includes('OpenAI')) {
        errorMessage += "Erreur lors de la communication avec l'API IA. Veuillez réessayer dans quelques instants.";
      }
      // Erreur par défaut
      else {
        errorMessage += "Une erreur inattendue s'est produite. Veuillez réessayer.";
      }
      
      toast({
        title: "Erreur de génération",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Générer une réponse de secours pour permettre à l'utilisateur de continuer
      const formData = form.getValues();
      const fallbackContent = formData.sectorFocus === "Banque & Assurance" ?
        "Je comprends votre point de vue. Dans le secteur bancaire, la conformité réglementaire est effectivement primordiale. Pourriez-vous préciser comment vous envisagez la mise en place d'un cadre méthodologique pour notre projet de système de gestion des risques ?" :
        formData.sectorFocus === "Énergie & Environnement" ?
        "C'est intéressant. Dans notre contexte d'optimisation des ressources énergétiques, comment proposeriez-vous de structurer la phase d'analyse des besoins utilisateurs pour notre nouveau système de gestion intégré ?" :
        "Merci pour ces précisions. Comment aborderiez-vous concrètement la phase d'analyse des besoins dans notre contexte spécifique ? Quelles méthodes privilégieriez-vous ?";
      
      // Créer le message de secours
      const fallbackMessage: Message = {
        id: `assistant-${messages.length + 1}`,
        role: 'assistant',
        content: fallbackContent,
        timestamp: new Date(),
      };
      
      // Ajouter le message de secours à la conversation
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Compléter la simulation
  const completeSimulation = () => {
    if (timerId) clearInterval(timerId);
    
    if (form.getValues().recruiterEmail && form.getValues().candidateName) {
      performEvaluation();
    } else {
      setShowContactForm(true);
    }
  };
  
  // Réinitialiser la simulation
  const resetSimulation = () => {
    setMessages([]);
    setTimeRemaining(600);
    if (timerId) clearInterval(timerId);
    setIsSimulationActive(false);
    setSimulationComplete(false);
    setEvaluationResult(null);
    setActiveTab('best-practices');
  };
  
  // Formulaire de contact après simulation
  const onContactFormSubmit = (values: z.infer<typeof contactFormSchema>) => {
    const formData = form.getValues();
    form.setValue('recruiterEmail', values.recruiterEmail);
    form.setValue('candidateName', values.candidateName);
    
    setShowContactForm(false);
    performEvaluation();
  };
  
  // Évaluation de la performance par IA
  const performEvaluation = async () => {
    setIsLoading(true);
    
    try {
      // Préparation des données pour l'analyse IA
      const conversationHistory = messages
        .filter(msg => msg.role !== 'system')
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));
      
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
        content: `Voici l'historique complet d'un entretien entre un client et un consultant AMOA. Analyse la performance du consultant et fournis une évaluation structurée au format JSON comme demandé dans tes instructions. Assure-toi que ton analyse soit précise, équilibrée et constructive.`
      };
      
      // Appel à l'API OpenAI existante pour générer l'évaluation
      const response = await fetch('/api/openai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            systemPrompt,
            ...conversationHistory,
            userPrompt
          ],
          useSecondaryModel: true, // Utiliser gpt-4o-mini qui est plus rapide
          temperature: 0.7
          // Note: l'API chat ne supporte pas le format de réponse JSON,
          // nous allons parser la réponse texte en JSON manuellement
        }),
      });
      
      if (!response.ok) {
        throw new Error("Erreur lors de la requête à l'API OpenAI");
      }
      
      const data = await response.json();
      
      if (data && data.choices && data.choices[0] && data.choices[0].message) {
        try {
          // L'API renvoit du texte qu'il faut parser en JSON
          let contentText = data.choices[0].message.content;
          
          // Si la réponse commence par du texte explicatif avant le JSON
          if (!contentText.trim().startsWith('{') && contentText.includes('{')) {
            // Trouver l'index du premier { qui indique le début du JSON
            const jsonStartIndex = contentText.indexOf('{');
            contentText = contentText.substring(jsonStartIndex);
          }
          
          // Nettoyer la réponse des délimiteurs de code Markdown si présents
          if (contentText.includes('```json')) {
            contentText = contentText.replace(/```json\n/g, '');
            contentText = contentText.replace(/```/g, '');
          }
          
          // Vérifier que tous les champs sont présents, sinon ajouter des valeurs par défaut
          const defaultEvaluation = {
            summary: "Analyse de performance non disponible.",
            strengths: [],
            improvements: [],
            detailedNotes: "Détails non disponibles.",
            recommendations: [],
            sectorFitEvaluation: "Évaluation non disponible.",
            conclusion: "Conclusion non disponible."
          };
          
          let evaluationData;
          
          // Tenter de trouver un objet JSON valide dans la réponse
          try {
            // Essayer d'analyser le texte complet d'abord
            evaluationData = JSON.parse(contentText);
          } catch (e) {
            // Si échec, essayer d'extraire un objet JSON valide en trouvant les accolades correspondantes
            const regex = /\{(?:[^{}]|(\{(?:[^{}]|(\{(?:[^{}]|(\{[^{}]*\}))*\}))*\}))*\}/g;
            const match = contentText.match(regex);
            
            if (match && match.length > 0) {
              try {
                evaluationData = JSON.parse(match[0]);
              } catch (e) {
                // Si toujours pas de JSON valide, créer un objet manuellement à partir du texte
                evaluationData = {
                  summary: "L'analyse n'a pas pu être formatée en JSON",
                  strengths: ["Points forts non disponibles en format structuré"],
                  improvements: ["Améliorations non disponibles en format structuré"],
                  detailedNotes: contentText.substring(0, 500) + "...",
                  recommendations: ["Recommandations non disponibles en format structuré"],
                  sectorFitEvaluation: "Évaluation sectorielle non disponible en format structuré",
                  conclusion: "Conclusion non disponible en format structuré"
                };
              }
            } else {
              // Aucun JSON trouvé, utiliser le texte brut comme analyse
              evaluationData = {
                summary: "L'analyse n'a pas pu être formatée en JSON",
                strengths: ["Points forts non disponibles en format structuré"],
                improvements: ["Améliorations non disponibles en format structuré"],
                detailedNotes: contentText.substring(0, 500) + "...",
                recommendations: ["Recommandations non disponibles en format structuré"],
                sectorFitEvaluation: "Évaluation sectorielle non disponible en format structuré",
                conclusion: "Conclusion non disponible en format structuré"
              };
            }
          }
          
          // Fusionner avec les valeurs par défaut pour s'assurer que tous les champs sont présents
          evaluationData = { ...defaultEvaluation, ...evaluationData };
          
          setEvaluationResult(evaluationData);
          setActiveTab('evaluation');
          setSimulationComplete(true);
        } catch (parseError) {
          console.error('Erreur lors du parsing de la réponse JSON:', parseError);
          toast({
            title: "Erreur de format",
            description: "L'analyse n'a pas pu être correctement formatée. Veuillez réessayer.",
            variant: "destructive",
          });
        }
      } else {
        throw new Error("Format de réponse inattendu");
      }
    } catch (error) {
      console.error('Erreur lors de l\'évaluation:', error);
      
      // Message d'erreur plus descriptif
      let errorMessage = "Impossible d'obtenir l'évaluation IA. ";
      
      // Vérifier si c'est une erreur réseau
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage += "Problème de connexion au serveur. Vérifiez votre connexion Internet.";
      } 
      // Vérifier si l'erreur contient un message de réponse
      else if (error instanceof Error && error.message.includes('OpenAI')) {
        errorMessage += "Erreur lors de la communication avec l'API IA. Veuillez réessayer dans quelques instants.";
      }
      // Erreur par défaut
      else {
        errorMessage += "Une erreur inattendue s'est produite. Veuillez réessayer.";
      }
      
      toast({
        title: "Erreur d'évaluation",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Créer une évaluation de secours basique pour permettre à l'utilisateur de terminer
      const formData = form.getValues();
      const fallbackEvaluation = {
        summary: `L'entretien avec le client dans le secteur ${formData.sectorFocus} a permis d'aborder plusieurs aspects importants de la problématique. Des éléments de méthodologie AMOA et d'analyse des besoins ont été discutés, avec une attention aux spécificités du secteur.`,
        strengths: [
          "Participation active à l'échange",
          "Tentative d'adaptation au contexte spécifique du client",
          "Abord de concepts AMOA pertinents"
        ],
        improvements: [
          "Approfondir les spécificités du secteur d'activité",
          "Structurer davantage l'approche méthodologique",
          "Poser des questions plus précises pour cerner les besoins"
        ],
        detailedNotes: `L'entretien a permis d'explorer différents aspects de la problématique client dans le secteur ${formData.sectorFocus}. Les questions posées ont montré un intérêt pour comprendre le contexte et les besoins spécifiques. Des éléments de méthodologie AMOA ont été évoqués, avec une tentative d'adaptation au contexte particulier du client. Pour améliorer les futurs entretiens, il serait bénéfique d'approfondir la connaissance des spécificités du secteur, de structurer davantage l'approche méthodologique proposée et de poser des questions plus précises pour cerner les besoins exacts du client.`,
        recommendations: [
          "Approfondir la connaissance du secteur ${formData.sectorFocus}",
          "Préparer une structure d'entretien plus détaillée",
          "S'entraîner à reformuler les besoins du client"
        ],
        sectorFitEvaluation: `La compréhension des enjeux spécifiques au secteur ${formData.sectorFocus} était présente mais pourrait être approfondie. Une meilleure connaissance des défis et contraintes propres à ce domaine permettrait une analyse plus pertinente des besoins et des solutions plus adaptées.`,
        conclusion: `Avec de la pratique et un approfondissement des connaissances sectorielles, la qualité des entretiens clients continuera de s'améliorer. Continuer à s'exercer dans des simulations variées permettra de développer les compétences nécessaires pour exceller dans les missions AMOA.`
      };
      
      setEvaluationResult(fallbackEvaluation);
      setActiveTab('evaluation');
      setSimulationComplete(true);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <HomeLayout>
      <div className="flex flex-col w-full min-h-screen p-4 md:p-8 bg-gradient-to-b from-gray-800 to-gray-950 text-white">
        <div className="flex justify-between items-center mb-4">
          <Button 
            variant="ghost" 
            className="flex items-center text-gray-300 hover:text-white hover:bg-gray-700/50" 
            onClick={() => setLocation('/amoa-mode-selection-fixed')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux modules AMOA
          </Button>
          
          <div className="flex items-center">
            <Users className="w-5 h-5 mr-2 text-blue-400" />
            <span className="text-gray-300 text-sm">
              <span className="font-bold text-blue-400">4.9</span>
              <span className="mx-1">/</span>
              <span>5</span>
              <span className="ml-1">({Math.floor(Math.random() * 500) + 1500} utilisateurs)</span>
            </span>
          </div>
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            Simulation d'entretien client
          </h1>
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