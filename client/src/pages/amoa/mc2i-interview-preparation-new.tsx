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

const BestPracticesContent = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
    {/* Colonne 1 */}
    <div className="flex flex-col gap-4">
      <section className="bg-blue-800/50 rounded-md p-4 h-full">
        <h3 className="text-lg font-semibold mb-2 flex items-center">
          <User className="w-5 h-5 mr-2 text-blue-300" />
          Préparation avant l'audition
        </h3>
        <div className="space-y-3 text-blue-100">
          <p>Préparez-vous soigneusement pour donner la meilleure impression possible lors de votre audition chez un client.</p>
          
          <Accordion type="multiple" className="w-full">
            <AccordionItem value="appearance">
              <AccordionTrigger className="text-white hover:text-blue-200">Apparence professionnelle</AccordionTrigger>
              <AccordionContent className="text-blue-100">
                <ul className="list-disc ml-5 space-y-1">
                  <li>Tenue professionnelle adaptée au client (costume pour les environnements formels, tenue business casual pour les environnements plus détendus)</li>
                  <li>Évitez les tenues trop décontractées même en cas d'environnement startup</li>
                  <li>Assurez-vous que vos vêtements sont propres, repassés et en bon état</li>
                  <li>Pour les auditions à distance, portez une tenue professionnelle complète (pas seulement visible à l'écran)</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="research">
              <AccordionTrigger className="text-white hover:text-blue-200">Recherches préalables</AccordionTrigger>
              <AccordionContent className="text-blue-100">
                <ul className="list-disc ml-5 space-y-1">
                  <li>Renseignez-vous sur l'entreprise cliente (secteur, activités, actualités récentes)</li>
                  <li>Comprenez les enjeux business spécifiques au secteur</li>
                  <li>Identifiez les concurrents principaux et les tendances du marché</li>
                  <li>Consultez le site web et les réseaux sociaux de l'entreprise</li>
                  <li>Préparez des notes sur les spécificités du métier et du projet</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      <section className="bg-blue-800/50 rounded-md p-4 h-full">
        <h3 className="text-lg font-semibold mb-2 flex items-center">
          <Lightbulb className="w-5 h-5 mr-2 text-blue-300" />
          Votre pitch personnel
        </h3>
        <div className="space-y-3 text-blue-100">
          <div className="space-y-2">
            <p className="font-semibold text-white">Votre pitch doit inclure :</p>
            <ul className="list-disc ml-5 space-y-1">
              <li>Votre nom</li>
              <li>Votre fonction chez mc2i</li>
              <li>Votre formation académique</li>
              <li>Vos compétences clés et votre expérience</li>
            </ul>
            <div className="bg-blue-700/50 p-3 rounded-md mt-2">
              <p className="text-white font-medium">Exemple :</p>
              <p className="italic">« Je suis Jean-Louis DUPONT, consultant confirmé AMOA SI chez mc2i Groupe, je suis ingénieur diplômé de l'INSA et j'évolue depuis 3 ans dans les problématiques métier RH et Décisionnelles dans le secteur Privé »</p>
              <Button variant="outline" size="sm" className="mt-2 text-xs border-blue-400 text-blue-300 hover:bg-blue-700 hover:text-white" onClick={() => {
                try {
                  navigator.clipboard?.writeText("Je suis [PRÉNOM NOM], consultant [NIVEAU] [SPÉCIALITÉ] chez mc2i Groupe, je suis [FORMATION] et j'évolue depuis [X] ans dans les problématiques [DOMAINES D'EXPERTISE] dans le secteur [SECTEUR]");
                  alert("Modèle de pitch copié dans le presse-papier");
                } catch (error) {
                  console.error("Erreur lors de la copie:", error);
                }
              }}>
                <Copy className="w-3 h-3 mr-1" /> Copier le modèle
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
    
    {/* Colonne 2 */}
    <div className="flex flex-col gap-4">
      <section className="bg-blue-800/50 rounded-md p-4 h-full">
        <h3 className="text-lg font-semibold mb-2 flex items-center">
          <Users className="w-5 h-5 mr-2 text-blue-300" />
          Pendant l'audition
        </h3>
        <div className="space-y-3 text-blue-100">
          <p>Adoptez les comportements adéquats pendant l'entretien pour transmettre votre professionnalisme.</p>
          
          <Accordion type="multiple" className="w-full">
            <AccordionItem value="first-contact">
              <AccordionTrigger className="text-white hover:text-blue-200">Premier contact</AccordionTrigger>
              <AccordionContent className="text-blue-100">
                <ul className="list-disc ml-5 space-y-1">
                  <li>La première impression est déterminante - soyez ponctuel (arrivez 10-15 minutes en avance)</li>
                  <li>En présentiel : poignée de main franche et assurée, contact visuel</li>
                  <li>À distance : assurez-vous que votre équipement fonctionne correctement avant le début de l'entretien</li>
                  <li>Laissez au manager le soin de "briser la glace" (souvent avec un sujet annexe)</li>
                  <li>Remerciez pour l'opportunité de cette audition</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="context">
              <AccordionTrigger className="text-white hover:text-blue-200">Technique de l'entonnoir</AccordionTrigger>
              <AccordionContent className="text-blue-100">
                <div className="space-y-2">
                  <p>Démontrez votre compréhension du métier et des enjeux de la mission en suivant la <span className="font-medium text-white">technique de l'entonnoir</span> : partez du général pour aller vers le spécifique.</p>
                  
                  <div className="space-y-2 mt-2">
                    <div className="bg-blue-700/40 p-2 rounded-md">
                      <h4 className="font-medium text-white text-sm">LE DÉPARTEMENT</h4>
                      <ul className="list-disc ml-5 text-sm">
                        <li>Quelle fonction métier il assure dans l'entreprise</li>
                        <li>Combien de personnes interviennent</li>
                      </ul>
                    </div>
                    
                    <div className="bg-blue-700/40 p-2 rounded-md">
                      <h4 className="font-medium text-white text-sm">LE PROJET</h4>
                      <ul className="list-disc ml-5 text-sm">
                        <li>L'existant et les problèmes rencontrés</li>
                        <li>La cible envisagée, les délais</li>
                      </ul>
                    </div>
                    
                    <div className="bg-blue-700/40 p-2 rounded-md">
                      <h4 className="font-medium text-white text-sm">LA MISSION</h4>
                      <ul className="list-disc ml-5 text-sm">
                        <li>Objectif de la prestation et délais</li>
                        <li>Activités attendues et responsabilités</li>
                        <li>Votre rôle au sein de l'équipe</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      <section className="bg-blue-800/50 rounded-md p-4 h-full">
        <h3 className="text-lg font-semibold mb-2 flex items-center">
          <BriefcaseBusiness className="w-5 h-5 mr-2 text-blue-300" />
          Savoir-être en entretien
        </h3>
        <div className="space-y-3 text-blue-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-blue-700/40 p-2 rounded-md">
              <h4 className="font-medium text-white">Posture</h4>
              <ul className="list-disc ml-5 space-y-1 text-sm">
                <li>Dos droit, mains sur la table pour assurer une bonne respiration</li>
                <li>Regardez votre auditoire dans les yeux</li>
                <li>Contrôlez votre gestuelle</li>
              </ul>
            </div>
            
            <div className="bg-blue-700/40 p-2 rounded-md">
              <h4 className="font-medium text-white">Attitude</h4>
              <ul className="list-disc ml-5 space-y-1 text-sm">
                <li>Poli, courtois, souriant</li>
                <li>Déterminé, serein et motivé</li>
                <li>Dialogue sincère et authentique</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-blue-700/40 p-2 rounded-md">
            <h4 className="font-medium text-white">Communication</h4>
            <ul className="list-disc ml-5 space-y-1 text-sm">
              <li>Bannissez les tics de langage ('donc', 'euh', 'en fait'…)</li>
              <li>Contrôlez le débit avec des pauses pour respirer</li>
              <li>Adaptez votre volume sonore à l'environnement</li>
              <li>Ne coupez jamais la parole</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
    
    {/* Colonne 3 */}
    <div className="flex flex-col gap-4">
      <section className="bg-blue-800/50 rounded-md p-4 h-full">
        <h3 className="text-lg font-semibold mb-2 flex items-center">
          <Star className="w-5 h-5 mr-2 text-blue-300" />
          Questions et valorisation
        </h3>
        <div className="space-y-3 text-blue-100">
          <Accordion type="multiple" className="w-full">
            <AccordionItem value="questions">
              <AccordionTrigger className="text-white hover:text-blue-200">Questions au client</AccordionTrigger>
              <AccordionContent className="text-blue-100">
                <div className="space-y-2">
                  <p>Lorsque le client vous demande si vous avez des questions, la réponse est toujours <span className="font-medium text-white">OUI</span>.</p>
                  
                  <div className="bg-blue-700/50 p-2 rounded-md mt-2">
                    <p className="text-white font-medium text-sm">Exemples de questions pertinentes :</p>
                    <ul className="list-disc ml-5 space-y-1 text-sm">
                      <li>Quels sont selon vous les facteurs clés de réussite de cette mission ?</li>
                      <li>Quelles sont les principales difficultés anticipées ?</li>
                      <li>Comment s'intègre ce projet dans la stratégie globale ?</li>
                      <li>Quelles sont vos attentes concernant la communication ?</li>
                    </ul>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="profile">
              <AccordionTrigger className="text-white hover:text-blue-200">Valoriser votre profil</AccordionTrigger>
              <AccordionContent className="text-blue-100">
                <div className="space-y-2">
                  <p>Pour convaincre le client de votre adéquation avec le poste :</p>
                  
                  <ol className="list-decimal ml-5 space-y-1 text-sm">
                    <li>Identifiez les compétences et expériences clés pour la mission</li>
                    <li>Faites la synthèse des attendus clés</li>
                    <li>Pour chaque attendu, identifiez une expérience pertinente</li>
                  </ol>
                  
                  <div className="bg-blue-700/50 p-2 rounded-md mt-2">
                    <p className="text-white font-medium text-sm">Présentation efficace :</p>
                    <ul className="list-disc ml-5 space-y-1 text-sm">
                      <li><span className="text-white">Contextualisez</span> : entreprise, métier et contexte</li>
                      <li><span className="text-white">Détaillez</span> : activités, méthodes et outils</li>
                      <li><span className="text-white">Valorisez</span> : contribution, défis surmontés</li>
                      <li><span className="text-white">Reliez</span> : lien avec la mission actuelle</li>
                    </ul>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>
  
      <section className="bg-blue-800/50 rounded-md p-4 h-full">
        <h3 className="text-lg font-semibold mb-2 flex items-center">
          <FileCheck className="w-5 h-5 mr-2 text-blue-300" />
          Après l'audition
        </h3>
        <div className="space-y-3 text-blue-100">
          <p>Les actions post-entretien sont souvent négligées mais peuvent faire la différence :</p>
          
          <Accordion type="multiple" className="w-full">
            <AccordionItem value="immediate-actions">
              <AccordionTrigger className="text-white hover:text-blue-200">Actions immédiates</AccordionTrigger>
              <AccordionContent className="text-blue-100">
                <ul className="list-disc ml-5 space-y-1 text-sm">
                  <li>Remerciez sincèrement les interlocuteurs</li>
                  <li>Exprimez clairement votre motivation</li>
                  <li>Échangez des cartes de visite</li>
                  <li>Demandez les prochaines étapes</li>
                  <li>Précisez votre disponibilité</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="follow-up">
              <AccordionTrigger className="text-white hover:text-blue-200">Email de remerciement</AccordionTrigger>
              <AccordionContent className="text-blue-100">
                <div className="space-y-2">
                  <p className="text-sm">Envoyez un email de remerciement dans les 24h suivant l'entretien :</p>
                  
                  <div className="bg-blue-700/50 p-2 rounded-md mt-2">
                    <p className="text-white font-medium text-sm">Exemple de mail :</p>
                    <div className="italic border-l-2 border-blue-500 pl-3 mt-1 text-xs">
                      <p>Objet : Remerciement suite à notre entretien du [DATE]</p>
                      <p className="mt-1">Bonjour [PRÉNOM],</p>
                      <p className="mt-1">Je tenais à vous remercier pour notre échange concernant la mission [PROJET].</p>
                      <p className="mt-1">Cet entretien a renforcé mon intérêt pour cette opportunité et je suis convaincu(e) que mon expérience en [COMPÉTENCE] sera un atout.</p>
                      <p className="mt-1">Je reste à votre disposition pour toute information complémentaire.</p>
                      <p className="mt-1">Bien cordialement,</p>
                      <p>[VOTRE NOM]</p>
                      <p>Consultant(e) mc2i</p>
                    </div>
                    <Button variant="outline" size="sm" className="mt-2 text-xs border-blue-400 text-blue-300 hover:bg-blue-700 hover:text-white" onClick={() => {
                      try {
                        navigator.clipboard?.writeText("Objet : Remerciement suite à notre entretien du [DATE]\n\nBonjour [PRÉNOM],\n\nJe tenais à vous remercier pour notre échange d'aujourd'hui concernant la mission [NOM DU PROJET].\n\nCet entretien a renforcé mon intérêt pour cette opportunité et je suis convaincu(e) que mon expérience en [COMPÉTENCE CLÉ] sera un atout pour la réussite de ce projet.\n\nJe reste à votre disposition pour toute information complémentaire dont vous pourriez avoir besoin.\n\nBien cordialement,\n[VOTRE NOM]\nConsultant(e) mc2i");
                        alert("Modèle d'email copié dans le presse-papier");
                      } catch (error) {
                        console.error("Erreur lors de la copie:", error);
                      }
                    }}>
                      <Copy className="w-3 h-3 mr-1" /> Copier le modèle
                    </Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="internal-debrief">
              <AccordionTrigger className="text-white hover:text-blue-200">Débriefing interne</AccordionTrigger>
              <AccordionContent className="text-blue-100">
                <ul className="list-disc ml-5 space-y-1 text-sm">
                  <li>Débriefez avec votre manager mc2i</li>
                  <li>Préparez une analyse structurée de l'entretien</li>
                  <li>Discutez des prochaines étapes</li>
                  <li>Déterminez si des actions complémentaires sont nécessaires</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>
    </div>
  </div>
);

const Mc2iInterviewPreparation: React.FC = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('best-practices');
  
  // État des simulations et configurations
  const [isSimulationActive, setIsSimulationActive] = useState(false);
  const [simulationComplete, setSimulationComplete] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Chat
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Formulaires
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      recruiterEmail: "",
      candidateName: "",
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
  
  // Timer
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);
  
  // Résultats
  const [evaluationResult, setEvaluationResult] = useState<any>(null);
  
  // Défilement auto pour la conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Mise à jour du timer
  useEffect(() => {
    if (timeRemaining === 0 && !simulationComplete) {
      completeSimulation();
    }
  }, [timeRemaining]);
  
  // Formatage du temps
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Démarrage de la simulation
  const startSimulation = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    
    try {
      setTimeout(() => {
        const systemMessage: Message = {
          id: 'system-1',
          role: 'system',
          content: 'Cette simulation vous permet de pratiquer un entretien avec un client potentiel. Soyez authentique et apportez des réponses précises et concises.',
          timestamp: new Date(),
        };
        
        const welcomeMessage: Message = {
          id: 'assistant-1',
          role: 'assistant',
          content: `Bonjour, je suis Thierry Dubois, responsable des projets digitaux chez ${values.sectorFocus === 'Banque & Assurance' ? 'Crédit Mutuel' : 
                   values.sectorFocus === 'Secteur Public' ? 'le Ministère de la Transformation Numérique' :
                   values.sectorFocus === 'Énergie' ? 'EDF' : 'notre entreprise'}. Nous recherchons un consultant ${values.profileType.toLowerCase()} pour nous accompagner sur un projet de ${
                   values.sectorFocus === 'Banque & Assurance' ? 'refonte de notre application mobile bancaire' : 
                   values.sectorFocus === 'Secteur Public' ? 'dématérialisation des procédures administratives' :
                   values.sectorFocus === 'Énergie' ? 'pilotage de la consommation énergétique' : 'transformation digitale'
                   }. Pouvez-vous vous présenter et me parler de votre expérience pertinente pour ce poste ?`,
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
        
      }, 1500);
    } catch (error) {
      console.error('Erreur lors du démarrage de la simulation:', error);
      toast({
        title: "Erreur",
        description: "Impossible de démarrer la simulation. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fonction pour contourner l'étape d'information
  const skipInfoAndStart = () => {
    const values = {
      recruiterEmail: "",
      candidateName: "",
      profileType: "Profil confirmé",
      experienceLevel: "2-5 ans",
      sectorFocus: "Banque & Assurance",
    };
    
    form.reset(values);
    startSimulation(values);
  };
  
  // Fonction pour envoyer un message
  const sendMessage = async () => {
    if (!userInput.trim() || isLoading) return;
    
    const userMessage: Message = {
      id: `user-${messages.length + 1}`,
      role: 'user',
      content: userInput,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);
    
    try {
      // Simuler une réponse de l'IA (à remplacer par l'appel API réel)
      setTimeout(() => {
        const aiResponses = [
          "Pourriez-vous me parler d'une expérience où vous avez dû gérer des parties prenantes ayant des intérêts divergents ?",
          "Quelles méthodologies de gestion de projet avez-vous l'habitude d'utiliser ? Quelle est votre approche préférée et pourquoi ?",
          "Comment abordez-vous la gestion des risques dans vos projets ?",
          "Quelles sont vos compétences techniques qui seraient pertinentes pour ce projet ?",
          "Comment vous adaptez-vous aux changements de priorités en cours de projet ?",
          "Merci pour votre candidature, nous allons examiner votre profil et vous recontacterons très prochainement. Avez-vous des questions avant que nous ne terminions cet entretien ?"
        ];
        
        const aiMessage: Message = {
          id: `assistant-${messages.length + 2}`,
          role: 'assistant',
          content: messages.length >= 10 ? aiResponses[5] : aiResponses[Math.floor((messages.length - 1) / 2) % 5],
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, aiMessage]);
        setIsLoading(false);
        
        if (messages.length >= 10) {
          setTimeout(() => {
            setSimulationComplete(true);
          }, 3000);
        }
      }, 1500);
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message. Veuillez réessayer.",
        variant: "destructive",
      });
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
  
  // Évaluation de la performance
  const performEvaluation = async () => {
    setIsLoading(true);
    
    try {
      // Simuler un appel API d'évaluation (à remplacer par l'appel réel)
      setTimeout(() => {
        const mockEvaluation = {
          summary: "Votre performance pendant cette audition a démontré une bonne préparation technique mais pourrait être améliorée au niveau des compétences de communication et de la concision des réponses.",
          strengths: [
            "Bonnes connaissances techniques dans le domaine demandé",
            "Structure claire dans la présentation de vos expériences",
            "Posture professionnelle tout au long de l'entretien",
            "Questions pertinentes posées au client"
          ],
          improvements: [
            "Réponses parfois trop longues et détaillées",
            "Tendance à utiliser un vocabulaire trop technique",
            "Communication non verbale à améliorer (contact visuel, gestuelle)",
            "Manque d'exemples concrets pour illustrer certaines compétences"
          ],
          detailedNotes: "Vous avez bien réussi à présenter vos compétences techniques et expériences pertinentes. Le discours était structuré mais parfois trop détaillé, ce qui peut perdre l'attention de l'interlocuteur. Travaillez sur la concision de vos réponses tout en conservant les éléments essentiels. Votre posture était professionnelle, mais la communication non verbale mérite d'être améliorée pour projeter plus de confiance.",
          recommendations: [
            "Pratiquez des présentations de 30 secondes à 2 minutes pour vos expériences",
            "Enregistrez-vous pour analyser votre communication non verbale",
            "Adaptez votre vocabulaire à votre interlocuteur",
            "Préparez des exemples concrets pour chaque compétence clé"
          ],
          sectorFitEvaluation: "Votre compréhension des enjeux spécifiques du secteur est bonne, mais pourrait être approfondie en ce qui concerne les tendances actuelles et les défis réglementaires.",
          conclusion: "Votre profil correspond globalement aux attentes pour ce type de mission. Avec quelques ajustements dans votre communication et une préparation plus ciblée sur le secteur, vous augmenterez significativement vos chances de succès lors des prochaines auditions."
        };
        
        setEvaluationResult(mockEvaluation);
        setActiveTab('evaluation');
        setSimulationComplete(true);
        setIsLoading(false);
      }, 2000);
    } catch (error) {
      console.error('Erreur lors de l\'évaluation:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'obtenir l'évaluation. Veuillez réessayer.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };
  
  return (
    <HomeLayout>
      <div className="flex flex-col w-full min-h-screen p-4 md:p-8 bg-gradient-to-b from-blue-900 to-blue-950 text-white">
        <div className="flex justify-between items-center mb-4">
          <Button 
            variant="ghost" 
            className="text-white hover:text-white hover:bg-blue-800"
            onClick={() => navigate("/amoa-mode-selection-fixed")}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Retour
          </Button>
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Préparation d'audition client - mc2i exclusif</h1>
          <p className="text-blue-100 max-w-3xl mx-auto">
            Cette simulation vous aide à préparer les consultants mc2i pour des auditions auprès de clients, avec des conseils sur la tenue, l'attitude professionnelle et les bonnes pratiques avant, pendant et après l'entretien.
          </p>
        </div>
        
        <Tabs 
          defaultValue="best-practices" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full max-w-5xl mx-auto"
        >
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="best-practices">
              Bonnes pratiques
            </TabsTrigger>
            <TabsTrigger 
              value="simulation"
              disabled={!isSimulationActive}
            >
              Simulation
            </TabsTrigger>
            <TabsTrigger 
              value="evaluation"
              disabled={!simulationComplete}
            >
              Évaluation
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="best-practices">
            <Card className="bg-blue-800 border-blue-700">
              <CardHeader>
                <CardTitle>Guide de préparation d'audition pour les consultants mc2i</CardTitle>
                <CardDescription className="text-blue-200">
                  Conseils pour optimiser votre présentation et votre comportement lors des auditions client
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BestPracticesContent />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  onClick={() => window.print()}
                  variant="outline"
                  className="border-blue-600 text-blue-100 hover:bg-blue-700"
                >
                  Imprimer ce guide
                </Button>
                <Button
                  onClick={() => setActiveTab('configuration')}
                  className="bg-[#006a9e] hover:bg-blue-600"
                >
                  Démarrer une simulation
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="configuration">
            <Card className="bg-blue-800 border-blue-700">
              <CardHeader>
                <CardTitle>Configuration de l'audition</CardTitle>
                <CardDescription className="text-blue-200">
                  Configurez les paramètres pour la simulation d'audition
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(startSimulation)} className="space-y-6">
                    <div className="bg-blue-700 p-4 rounded-md mb-6">
                      <h3 className="text-lg font-semibold mb-4">Informations optionnelles pour recevoir l'évaluation par email</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="recruiterEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-blue-100">Votre email (envoi du rapport)</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="votre.email@mc2i.fr" 
                                  className="bg-blue-900 border-blue-600 text-white"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="candidateName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-blue-100">Nom du consultant</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Prénom Nom" 
                                  className="bg-blue-900 border-blue-600 text-white"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <div className="bg-blue-700 p-4 rounded-md">
                      <h3 className="text-lg font-semibold mb-4">Paramètres de simulation (requis)</h3>
                      <div className="grid grid-cols-1 gap-4">
                        <FormField
                          control={form.control}
                          name="profileType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-blue-100">Type de profil</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="bg-blue-900 border-blue-600 text-white">
                                    <SelectValue placeholder="Sélectionnez un type de profil" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-blue-800 border-blue-700 text-white">
                                  <SelectItem value="Profil junior">Profil junior</SelectItem>
                                  <SelectItem value="Profil confirmé">Profil confirmé</SelectItem>
                                  <SelectItem value="Profil senior">Profil senior</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="experienceLevel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-blue-100">Niveau d'expérience</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="bg-blue-900 border-blue-600 text-white">
                                    <SelectValue placeholder="Sélectionnez un niveau d'expérience" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-blue-800 border-blue-700 text-white">
                                  <SelectItem value="Stage/Alternance">Stage ou Alternance</SelectItem>
                                  <SelectItem value="0-2 ans">0-2 ans</SelectItem>
                                  <SelectItem value="2-5 ans">2-5 ans</SelectItem>
                                  <SelectItem value="5-8 ans">5-8 ans</SelectItem>
                                  <SelectItem value="8-12 ans">8-12 ans</SelectItem>
                                  <SelectItem value="12+ ans">12+ ans</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="sectorFocus"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-blue-100">Secteur d'activité</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="bg-blue-900 border-blue-600 text-white">
                                    <SelectValue placeholder="Sélectionnez un secteur d'activité" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-blue-800 border-blue-700 text-white">
                                  <SelectItem value="Banque & Assurance">Banque & Assurance</SelectItem>
                                  <SelectItem value="Industrie">Industrie</SelectItem>
                                  <SelectItem value="Énergie">Énergie</SelectItem>
                                  <SelectItem value="Secteur Public">Secteur Public</SelectItem>
                                  <SelectItem value="Retail">Retail</SelectItem>
                                  <SelectItem value="Santé">Santé</SelectItem>
                                  <SelectItem value="Luxe">Luxe</SelectItem>
                                  <SelectItem value="Transport & Logistique">Transport & Logistique</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <Button
                        type="submit"
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>Chargement...</>
                        ) : (
                          <>Démarrer la simulation</>
                        )}
                      </Button>
                      
                      <Button
                        type="button"
                        className="flex-1 bg-blue-700 hover:bg-blue-800"
                        onClick={skipInfoAndStart}
                        disabled={isLoading}
                      >
                        Ignorer les informations de contact
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="simulation">
            <Card className="bg-blue-800 border-blue-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <UserCircle className="w-6 h-6 mr-2 text-yellow-500" />
                    <CardTitle>Simulation d'audition client</CardTitle>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`${timeRemaining > 300 ? 'border-green-500 text-green-500' : timeRemaining > 60 ? 'border-yellow-500 text-yellow-500' : 'border-red-500 text-red-500'}`}
                  >
                    <Clock className="w-4 h-4 mr-1" />
                    {formatTime(timeRemaining)}
                  </Badge>
                </div>
                <CardDescription className="text-blue-200">
                  Conversation avec le client potentiel
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Conversation */}
                <div className="bg-blue-900 rounded-md p-4 mb-4 h-[400px] overflow-y-auto">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`mb-4 p-3 rounded-lg ${
                        message.role === 'assistant'
                          ? 'bg-blue-700 mr-12'
                          : 'bg-green-700 ml-12'
                      }`}
                    >
                      <div className="flex items-center mb-1">
                        {message.role === 'assistant' ? (
                          <>
                            <UserCircle className="w-5 h-5 mr-2 text-blue-300" />
                            <span className="text-sm font-bold text-blue-300">
                              Client
                            </span>
                          </>
                        ) : (
                          <>
                            <UserCircle className="w-5 h-5 mr-2 text-green-300" />
                            <span className="text-sm font-bold text-green-300">
                              Vous
                            </span>
                          </>
                        )}
                        <span className="text-xs ml-auto text-blue-300 opacity-70">
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
                    className="flex-1 bg-blue-900 border-blue-600 text-white"
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
                    className="ml-2 bg-green-600 hover:bg-green-700"
                    onClick={sendMessage}
                    disabled={isLoading || simulationComplete || !userInput.trim()}
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  onClick={resetSimulation}
                  variant="outline"
                  className="border-blue-600 text-blue-100 hover:bg-blue-700"
                >
                  Nouvelle simulation
                </Button>
                <Button
                  onClick={completeSimulation}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={messages.length < 2 || simulationComplete || isLoading}
                >
                  {isLoading ? "Chargement..." : "Terminer la simulation"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="evaluation">
            <Card className="bg-blue-800 border-blue-700">
              <CardHeader>
                <div className="flex items-center">
                  <CheckCircle className="w-6 h-6 mr-2 text-green-500" />
                  <CardTitle>Évaluation de l'audition</CardTitle>
                </div>
                <CardDescription className="text-blue-200">
                  Analyse de la performance du consultant pendant l'audition
                </CardDescription>
              </CardHeader>
              <CardContent>
                {evaluationResult ? (
                  <div className="space-y-6">
                    <div className="bg-blue-700 p-4 rounded-md">
                      <h3 className="text-lg font-semibold mb-2">Résumé de l'audition</h3>
                      <p className="text-blue-100 mb-4">
                        {evaluationResult.summary || "Aucun résumé disponible."}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-blue-700 p-4 rounded-md">
                        <h3 className="text-lg font-semibold mb-2">Forces identifiées</h3>
                        <ul className="list-disc ml-5 space-y-1 text-blue-100">
                          {evaluationResult.strengths && evaluationResult.strengths.map((strength: string, index: number) => (
                            <li key={`strength-${index}`}>{strength}</li>
                          ))}
                          {(!evaluationResult.strengths || evaluationResult.strengths.length === 0) && (
                            <li>Aucune force identifiée</li>
                          )}
                        </ul>
                      </div>
                      
                      <div className="bg-blue-700 p-4 rounded-md">
                        <h3 className="text-lg font-semibold mb-2">Axes d'amélioration</h3>
                        <ul className="list-disc ml-5 space-y-1 text-blue-100">
                          {evaluationResult.improvements && evaluationResult.improvements.map((improvement: string, index: number) => (
                            <li key={`improvement-${index}`}>{improvement}</li>
                          ))}
                          {(!evaluationResult.improvements || evaluationResult.improvements.length === 0) && (
                            <li>Aucun axe d'amélioration identifié</li>
                          )}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="bg-blue-700 p-4 rounded-md">
                      <h3 className="text-lg font-semibold mb-2">Notes détaillées</h3>
                      <p className="text-blue-100 whitespace-pre-wrap">
                        {evaluationResult.detailedNotes || "Aucune note détaillée disponible."}
                      </p>
                    </div>
                    
                    <div className="bg-blue-700 p-4 rounded-md">
                      <h3 className="text-lg font-semibold mb-2">Recommandations</h3>
                      <ul className="list-disc ml-5 space-y-1 text-blue-100">
                        {evaluationResult.recommendations && evaluationResult.recommendations.map((recommendation: string, index: number) => (
                          <li key={`recommendation-${index}`}>{recommendation}</li>
                        ))}
                        {(!evaluationResult.recommendations || evaluationResult.recommendations.length === 0) && (
                          <li>Aucune recommandation disponible</li>
                        )}
                      </ul>
                    </div>
                    
                    <div className="bg-blue-700 p-4 rounded-md">
                      <h3 className="text-lg font-semibold mb-2">Adéquation avec le secteur {form.getValues('sectorFocus') || ""}</h3>
                      <p className="text-blue-100 mb-2">
                        {evaluationResult.sectorFitEvaluation || "Aucune évaluation d'adéquation sectorielle disponible."}
                      </p>
                    </div>
                    
                    <div className="bg-blue-700 p-4 rounded-md">
                      <h3 className="text-lg font-semibold mb-2">Conclusion</h3>
                      <p className="text-blue-100 mb-2">
                        {evaluationResult.conclusion || "Aucune conclusion disponible."}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8">
                    <AlertCircle className="w-16 h-16 text-blue-400 mb-4" />
                    <h3 className="text-xl font-bold mb-2">Aucune évaluation disponible</h3>
                    <p className="text-blue-100 text-center mb-4">
                      Vous n'avez pas encore terminé la simulation ou une erreur s'est produite lors de l'évaluation.
                    </p>
                    <Button onClick={resetSimulation} className="bg-[#006a9e] hover:bg-blue-700">
                      Démarrer une nouvelle simulation
                    </Button>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  onClick={resetSimulation}
                  className="w-full bg-[#006a9e] hover:bg-blue-600"
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
        <DialogContent className="bg-blue-800 text-white border-blue-700">
          <DialogHeader>
            <DialogTitle>Informations nécessaires pour l'évaluation finale</DialogTitle>
            <DialogDescription className="text-blue-200">
              Pour recevoir l'évaluation et terminer la simulation, veuillez compléter les informations suivantes.
            </DialogDescription>
          </DialogHeader>
          <Form {...contactForm}>
            <form onSubmit={contactForm.handleSubmit(onContactFormSubmit)} className="space-y-4">
              <FormField
                control={contactForm.control}
                name="recruiterEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Votre email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="votre.email@mc2i.fr" 
                        className="bg-blue-900 border-blue-600 text-white"
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
                    <FormLabel className="text-white">Nom du consultant</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Prénom Nom" 
                        className="bg-blue-900 border-blue-600 text-white"
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
                  className="bg-green-600 hover:bg-green-700"
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