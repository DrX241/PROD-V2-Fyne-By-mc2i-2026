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
  <div className="space-y-4">
    <section className="bg-blue-800/50 rounded-md p-4">
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
          
          <AccordionItem value="pitch">
            <AccordionTrigger className="text-white hover:text-blue-200">Préparez votre pitch personnel</AccordionTrigger>
            <AccordionContent className="text-blue-100">
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
                    if (navigator.clipboard) {
                      navigator.clipboard.writeText("Je suis [PRÉNOM NOM], consultant [NIVEAU] [SPÉCIALITÉ] chez mc2i Groupe, je suis [FORMATION] et j'évolue depuis [X] ans dans les problématiques [DOMAINES D'EXPERTISE] dans le secteur [SECTEUR]");
                      toast({
                        title: "Copié !",
                        description: "Le modèle de pitch a été copié dans le presse-papier.",
                        duration: 3000,
                      });
                    }
                  }}>
                    <Copy className="w-3 h-3 mr-1" /> Copier le modèle
                  </Button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="materials">
            <AccordionTrigger className="text-white hover:text-blue-200">Documents et matériel</AccordionTrigger>
            <AccordionContent className="text-blue-100">
              <ul className="list-disc ml-5 space-y-1">
                <li>Apportez plusieurs exemplaires de votre CV imprimé</li>
                <li>Préparez des notes sur le contexte mission et l'attendu (ce n'est pas un exercice de mémorisation)</li>
                <li>Ayez à portée de main le document de l'offre technique et ses annexes</li>
                <li>Pour les auditions à distance, préparez votre environnement (fond professionnel, bonne connexion, éclairage adéquat)</li>
                <li>Préparez une liste de questions pertinentes à poser au client</li>
                <li>Stylo et carnet pour prendre des notes pendant l'entretien</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
    
    <section className="bg-blue-800/50 rounded-md p-4">
      <h3 className="text-lg font-semibold mb-2 flex items-center">
        <Users className="w-5 h-5 mr-2 text-blue-300" />
        Pendant l'audition
      </h3>
      <div className="space-y-3 text-blue-100">
        <p>Adoptez les comportements adéquats pendant l'entretien pour transmettre votre professionnalisme et votre expertise.</p>
        
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
            <AccordionTrigger className="text-white hover:text-blue-200">Restitution du contexte</AccordionTrigger>
            <AccordionContent className="text-blue-100">
              <div className="space-y-2">
                <p>Démontrez votre compréhension du métier et des enjeux de la mission en suivant la <span className="font-medium text-white">technique de l'entonnoir</span> : partez du général pour aller vers le spécifique.</p>
                
                <div className="space-y-4 mt-3">
                  <div className="bg-blue-700/40 p-3 rounded-md">
                    <h4 className="font-medium text-white">LE DÉPARTEMENT/LA DIRECTION</h4>
                    <ul className="list-disc ml-5 space-y-1">
                      <li>Quelle fonction métier il assure dans l'entreprise</li>
                      <li>Combien de personnes interviennent</li>
                      <li>Comment définir ce 'métier' (en quoi il consiste)</li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-700/40 p-3 rounded-md">
                    <h4 className="font-medium text-white">LE PROJET</h4>
                    <ul className="list-disc ml-5 space-y-1">
                      <li>L'existant et les problèmes rencontrés (techniques, organisationnels, fonctionnels)</li>
                      <li>La cible envisagée, les délais, l'organisation mise en place</li>
                      <li>L'état actuel du projet (quelle phase)</li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-700/40 p-3 rounded-md">
                    <h4 className="font-medium text-white">LA MISSION</h4>
                    <ul className="list-disc ml-5 space-y-1">
                      <li>Objectif de la prestation et délais</li>
                      <li>Activités attendues et votre responsabilité</li>
                      <li>Votre rôle au sein de l'équipe</li>
                      <li>Livrables à réaliser</li>
                      <li>Facteurs de réussite et points d'attention</li>
                    </ul>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="behavior">
            <AccordionTrigger className="text-white hover:text-blue-200">Savoir-être en entretien</AccordionTrigger>
            <AccordionContent className="text-blue-100">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-white">Posture</h4>
                  <ul className="list-disc ml-5 space-y-1">
                    <li>Dos droit, mains sur la table pour assurer une bonne respiration</li>
                    <li>Regardez votre auditoire dans les yeux et balayez du regard s'ils sont plusieurs</li>
                    <li>Contrôlez votre gestuelle (évitez de jouer avec votre stylo)</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-white">Attitude</h4>
                  <ul className="list-disc ml-5 space-y-1">
                    <li>Poli, courtois, souriant et enthousiaste</li>
                    <li>Déterminé, serein et motivé</li>
                    <li>Instaurez un dialogue sincère et authentique</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-white">Communication</h4>
                  <ul className="list-disc ml-5 space-y-1">
                    <li>Bannissez les tics de langage ('donc', 'euh', 'en fait'…)</li>
                    <li>Contrôlez le débit de votre présentation avec des pauses pour respirer et ponctuer</li>
                    <li>Adaptez votre volume sonore à l'environnement</li>
                    <li>Ne coupez jamais la parole</li>
                  </ul>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="questions">
            <AccordionTrigger className="text-white hover:text-blue-200">Questions au client</AccordionTrigger>
            <AccordionContent className="text-blue-100">
              <div className="space-y-3">
                <p>Lorsque le client vous demande si vous avez des questions, la réponse est toujours <span className="font-medium text-white">OUI</span>. Préparez des questions qui montrent votre intérêt pour :</p>
                
                <ul className="list-disc ml-5 space-y-1">
                  <li>Créer un dialogue et instaurer la confiance</li>
                  <li>Cerner les vrais enjeux au-delà de ce qui est écrit dans l'appel d'offres</li>
                  <li>Démontrer votre professionnalisme et votre motivation</li>
                </ul>
                
                <div className="bg-blue-700/50 p-3 rounded-md mt-2">
                  <p className="text-white font-medium">Exemples de questions pertinentes :</p>
                  <ul className="list-disc ml-5 space-y-1">
                    <li>Quels sont selon vous les facteurs clés de réussite de cette mission ?</li>
                    <li>Quelles sont les principales difficultés que vous anticipez pour ce projet ?</li>
                    <li>Comment s'intègre ce projet dans la stratégie globale de l'entreprise ?</li>
                    <li>Quelles sont vos attentes concernant la communication durant le projet ?</li>
                    <li>Pouvez-vous me parler des équipes avec lesquelles je serais amené à travailler ?</li>
                  </ul>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="profile">
            <AccordionTrigger className="text-white hover:text-blue-200">Valoriser votre profil</AccordionTrigger>
            <AccordionContent className="text-blue-100">
              <div className="space-y-3">
                <p>Pour convaincre le client de votre adéquation avec le poste :</p>
                
                <ol className="list-decimal ml-5 space-y-1">
                  <li>Identifiez les compétences, savoir-être et expériences clés pour la mission</li>
                  <li>Faites la synthèse des attendus clés (ex: animation de réunions, connaissances AGILE, gestion de conflits)</li>
                  <li>Pour chaque attendu, identifiez une expérience pertinente de votre parcours</li>
                </ol>
                
                <div className="bg-blue-700/50 p-3 rounded-md mt-2">
                  <p className="text-white font-medium">Présentation efficace d'une expérience :</p>
                  <ul className="list-disc ml-5 space-y-1">
                    <li><span className="text-white">Contextualisez</span> : présentez l'entreprise, son métier et le contexte de votre mission</li>
                    <li><span className="text-white">Détaillez</span> : activités réalisées, méthodes et outils utilisés</li>
                    <li><span className="text-white">Valorisez</span> : contribution à la réussite, défis surmontés</li>
                    <li><span className="text-white">Reliez</span> : établissez un lien clair avec la mission proposée</li>
                  </ul>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
    
    <section className="bg-blue-800/50 rounded-md p-4">
      <h3 className="text-lg font-semibold mb-2 flex items-center">
        <FileCheck className="w-5 h-5 mr-2 text-blue-300" />
        Après l'audition
      </h3>
      <div className="space-y-3 text-blue-100">
        <p>Les actions post-entretien sont souvent négligées mais peuvent faire la différence :</p>
        
        <ul className="list-disc ml-5 space-y-2">
          <li>Remerciez sincèrement les interlocuteurs pour le temps accordé</li>
          <li>Exprimez clairement votre motivation à intégrer le projet</li>
          <li>Envoyez un email de remerciement dans les 24h suivant l'entretien</li>
          <li>Faites un débriefing avec votre manager mc2i pour partager vos impressions</li>
          <li>Notez les questions pour lesquelles vous n'étiez pas totalement préparé afin d'améliorer vos futures auditions</li>
        </ul>
        
        <div className="bg-blue-700/50 p-3 rounded-md mt-2">
          <p className="text-white font-medium">Savoir conclure :</p>
          <p className="italic">Ne pas oublier de remercier votre auditoire pour le temps qu'il vous a consacré et témoigner de votre motivation à pouvoir intervenir sur le projet.</p>
        </div>
      </div>
    </section>
    
    <section className="bg-blue-800/50 rounded-md p-4">
      <h3 className="text-lg font-semibold mb-2 flex items-center">
        <Lightbulb className="w-5 h-5 mr-2 text-yellow-300" />
        Questions fréquentes en audition
      </h3>
      <div className="space-y-3 text-blue-100">
        <p>Préparez-vous à répondre à ces questions typiques que les clients posent souvent :</p>
        
        <Accordion type="multiple" className="w-full">
          <AccordionItem value="methodology">
            <AccordionTrigger className="text-white hover:text-blue-200">Questions sur la méthodologie</AccordionTrigger>
            <AccordionContent className="text-blue-100">
              <ul className="list-disc ml-5 space-y-1">
                <li>Pour vous, une conduite du changement réussie se mesure comment ?</li>
                <li>Décrivez-moi le contenu d'une User Story utilisé dans la méthode SCRUM ?</li>
                <li>Comment animez-vous un atelier avec la méthode MOSCOW ?</li>
                <li>Comment définissez-vous un processus métier et comment le modélisez-vous ?</li>
                <li>Comment déroulez-vous un entretien ?</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="technical">
            <AccordionTrigger className="text-white hover:text-blue-200">Questions techniques</AccordionTrigger>
            <AccordionContent className="text-blue-100">
              <ul className="list-disc ml-5 space-y-1">
                <li>Quelles contraintes faut-il prendre en compte lorsque l'on conçoit une IHM avec les utilisateurs ?</li>
                <li>Quels sont les principes techniques d'une application Web ?</li>
                <li>Qu'est-ce qu'un Web Service ?</li>
                <li>Comment gérez-vous les exigences contradictoires entre différentes parties prenantes ?</li>
                <li>Quelle est votre approche pour documenter les spécifications fonctionnelles ?</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="soft-skills">
            <AccordionTrigger className="text-white hover:text-blue-200">Questions sur le savoir-être</AccordionTrigger>
            <AccordionContent className="text-blue-100">
              <ul className="list-disc ml-5 space-y-1">
                <li>Quelle est la dernière chose qui vous a passionné ?</li>
                <li>Qu'est-ce qui vous intéresse dans la mission ?</li>
                <li>Comment réagissez-vous dans un conflit ?</li>
                <li>Les utilisateurs récalcitrants, vous les abordez comment ?</li>
                <li>Qu'est-ce qui vous paraît le plus difficile dans votre activité de conseil ?</li>
                <li>Que pouvez-vous nous apporter de spécifique sur le projet ?</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>

    <section className="bg-gradient-to-r from-blue-800/70 to-blue-700/50 rounded-md p-4 border border-blue-600/30">
      <div className="flex items-center mb-3">
        <div className="p-2 rounded-full bg-blue-600/30 mr-3">
          <Star className="w-5 h-5 text-yellow-300" />
        </div>
        <h3 className="text-lg font-semibold text-white">Points clés pour réussir votre audition</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-100">
        <div className="bg-blue-800/40 p-3 rounded-md">
          <h4 className="font-medium text-white flex items-center">
            <span className="w-5 h-5 rounded-full bg-blue-700 flex items-center justify-center text-xs mr-2">1</span>
            Capter l'attention
          </h4>
          <p className="mt-1">Soignez votre présentation et votre introduction pour créer une première impression positive.</p>
        </div>
        
        <div className="bg-blue-800/40 p-3 rounded-md">
          <h4 className="font-medium text-white flex items-center">
            <span className="w-5 h-5 rounded-full bg-blue-700 flex items-center justify-center text-xs mr-2">2</span>
            Maîtriser son sujet
          </h4>
          <p className="mt-1">Démontrez votre expertise technique et votre compréhension des enjeux du projet.</p>
        </div>
        
        <div className="bg-blue-800/40 p-3 rounded-md">
          <h4 className="font-medium text-white flex items-center">
            <span className="w-5 h-5 rounded-full bg-blue-700 flex items-center justify-center text-xs mr-2">3</span>
            S'intéresser au sujet
          </h4>
          <p className="mt-1">Posez des questions pertinentes qui montrent votre intérêt et votre motivation.</p>
        </div>
        
        <div className="bg-blue-800/40 p-3 rounded-md">
          <h4 className="font-medium text-white flex items-center">
            <span className="w-5 h-5 rounded-full bg-blue-700 flex items-center justify-center text-xs mr-2">4</span>
            Rassurer sur ses compétences
          </h4>
          <p className="mt-1">Illustrez vos réponses par des exemples concrets de réalisations passées.</p>
        </div>
        
        <div className="bg-blue-800/40 p-3 rounded-md">
          <h4 className="font-medium text-white flex items-center">
            <span className="w-5 h-5 rounded-full bg-blue-700 flex items-center justify-center text-xs mr-2">5</span>
            Faire preuve d'assurance
          </h4>
          <p className="mt-1">Montrez votre confiance sans arrogance et votre capacité à gérer l'incertitude.</p>
        </div>
        
        <div className="bg-blue-800/40 p-3 rounded-md">
          <h4 className="font-medium text-white flex items-center">
            <span className="w-5 h-5 rounded-full bg-blue-700 flex items-center justify-center text-xs mr-2">6</span>
            Soigner sa présentation
          </h4>
          <p className="mt-1">Surveillez votre langage corporel, votre élocution et votre tenue professionnelle.</p>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-blue-700/40 rounded-md border-l-4 border-yellow-400">
        <p className="italic text-yellow-200 font-medium">Savoir conclure : ne pas oublier de remercier votre auditoire pour le temps qu'il vous a consacré et témoigner de votre motivation à pouvoir intervenir sur le projet.</p>
      </div>
    </section>
  </div>
);

const Mc2iInterviewPreparation: React.FC<{}> = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('best-practices');
  
  // États pour la simulation
  const [isSimulationActive, setIsSimulationActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes en secondes
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [simulationComplete, setSimulationComplete] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<any>(null);
  const [isSkippedInfo, setIsSkippedInfo] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  
  // États pour les notes et la synthèse
  const [notesText, setNotesText] = useState('');
  const [isAnalyzingNotes, setIsAnalyzingNotes] = useState(false);
  const [synthesisResult, setSynthesisResult] = useState<any>(null);
  
  // Référence pour le défilement
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Effet pour faire défiler vers le bas à chaque nouveau message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Formatage du temps restant
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  // Configuration du formulaire principal
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
  
  // Configuration du formulaire de contact
  const contactForm = useForm<z.infer<typeof contactFormSchema>>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      recruiterEmail: "",
      candidateName: "",
    },
  });
  
  // Démarrer la simulation
  const startSimulation = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/amoa/interview-simulation/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domain: 'mc2i',
          recruiterEmail: values.recruiterEmail,
          candidateName: values.candidateName,
          profileType: values.profileType,
          experienceLevel: values.experienceLevel,
          sectorFocus: values.sectorFocus
        })
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du démarrage de la simulation');
      }
      
      const data = await response.json();
      
      setMessages([
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: data.initialMessage,
          timestamp: new Date()
        }
      ]);
      
      setIsSimulationActive(true);
      setActiveTab('simulation');
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de démarrer la simulation. Veuillez réessayer.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Finaliser la simulation
  const finalizeSimulation = async (
    recruiterEmail: string,
    candidateName: string,
    profileType: string,
    experienceLevel: string,
    sectorFocus: string
  ) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/amoa/interview-simulation/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domain: 'mc2i',
          trainerEmail: recruiterEmail,
          candidateName,
          profileType,
          experienceLevel,
          sectorFocus,
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          duration: 600 - timeRemaining,
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erreur API (finalisation):", errorText);
        throw new Error('Erreur lors de la finalisation de la simulation');
      }
      
      // Récupérer le texte de la réponse d'abord
      const responseText = await response.text();
      
      let data;
      try {
        // Tenter de parser la réponse en JSON
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Erreur de parsing JSON (finalisation):", parseError);
        data = { 
          evaluation: {
            summary: "Impossible de générer une évaluation complète en raison d'une erreur technique.",
            strengths: ["Communication claire"],
            improvements: ["Préparation technique plus approfondie"],
            detailedNotes: "Une évaluation détaillée n'a pas pu être générée. Veuillez contacter le support technique.",
            recommendations: ["Revoir la documentation technique du projet"],
            sectorFitEvaluation: "Évaluation non disponible",
            conclusion: "L'évaluation a rencontré une erreur technique. Veuillez réessayer ultérieurement."
          } 
        };
      }
      
      setEvaluationResult(data.evaluation);
      setActiveTab('evaluation');
      setSimulationComplete(true);
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de compléter l'évaluation. Veuillez réessayer.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Compléter la simulation
  const completeSimulation = async () => {
    // Vérifier si les informations de contact sont disponibles
    const recruiterEmail = form.getValues('recruiterEmail');
    const candidateName = form.getValues('candidateName');
    
    if ((!recruiterEmail || !candidateName) && !isSkippedInfo) {
      setShowContactForm(true);
      return;
    }
    
    // Finaliser avec les informations disponibles
    await finalizeSimulation(
      recruiterEmail,
      candidateName,
      form.getValues('profileType'),
      form.getValues('experienceLevel'),
      form.getValues('sectorFocus')
    );
  };
  
  // Soumission du formulaire de contact
  const onContactFormSubmit = async (values: z.infer<typeof contactFormSchema>) => {
    setShowContactForm(false);
    
    // Mettre à jour le formulaire principal pour la consistance
    form.setValue('recruiterEmail', values.recruiterEmail);
    form.setValue('candidateName', values.candidateName);
    
    // Finaliser la simulation avec les informations complètes
    await finalizeSimulation(
      values.recruiterEmail,
      values.candidateName,
      form.getValues('profileType'),
      form.getValues('experienceLevel'),
      form.getValues('sectorFocus')
    );
  };
  
  // Ignorer les informations de contact et démarrer
  const skipInfoAndStart = () => {
    setIsSkippedInfo(true);
    form.handleSubmit(startSimulation)();
  };
  
  // Envoi d'un message
  const sendMessage = async () => {
    if (!userInput.trim() || isLoading) return;
    
    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: userInput,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/amoa/interview-simulation/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domain: 'mc2i',
          message: userInput,
          history: messages.map(m => ({ role: m.role, content: m.content })),
          profileType: form.getValues('profileType'),
          experienceLevel: form.getValues('experienceLevel'),
          sectorFocus: form.getValues('sectorFocus')
        })
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi du message');
      }
      
      const data = await response.json();
      
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: data.reply,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'envoyer le message. Veuillez réessayer.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Réinitialisation de la simulation
  const resetSimulation = () => {
    setIsSimulationActive(false);
    setSimulationComplete(false);
    setMessages([]);
    setTimeRemaining(600);
    setActiveTab('best-practices');
    setEvaluationResult(null);
    setIsSkippedInfo(false);
    form.reset();
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
          className="w-full max-w-4xl mx-auto"
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
                      <h3 className="text-lg font-semibold mb-2">Adéquation avec le secteur {form.getValues('sectorFocus')}</h3>
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
              <DialogFooter className="flex justify-end gap-2 mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowContactForm(false)}
                  className="border-blue-600 text-blue-100 hover:bg-blue-700"
                >
                  Annuler
                </Button>
                <Button 
                  type="submit"
                  className="bg-green-600 hover:bg-green-700"
                >
                  Valider et terminer
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