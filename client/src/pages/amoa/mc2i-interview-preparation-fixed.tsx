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

const BestPracticesContent: React.FC = () => {
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
      {/* Section title with progress bar */}
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Parcours du consultant mc2i</h2>
        <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden mb-2">
          <div 
            className="bg-gradient-to-r from-green-400 to-blue-500 h-full transition-all duration-500 ease-out"
            style={{ 
              width: `${Math.round(((progressTracker.preparation.completed + progressTracker.during.completed + progressTracker.after.completed) / 
              (progressTracker.preparation.total + progressTracker.during.total + progressTracker.after.total)) * 100)}%` 
            }}
          ></div>
        </div>
        <p className="text-blue-100 text-sm">
          Accomplissez les étapes pour maîtriser le processus d'audition
        </p>
      </div>
    
      {/* Main content using grid with different colored sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SECTION 1: AVANT L'AUDITION */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold flex items-center">
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center mr-3 text-white">1</div>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                Avant l'audition
              </span>
            </h3>
            <Badge variant="outline" className="bg-purple-900/40 text-purple-200 border-purple-500">
              {progressTracker.preparation.completed}/{progressTracker.preparation.total} étapes
            </Badge>
          </div>
          
          <Card className="bg-gradient-to-br from-purple-900/50 to-indigo-900/30 border-purple-500/50 shadow-lg overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-blue-400"></div>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <User className="w-5 h-5 mr-2 text-purple-300" />
                Préparation personnelle
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Accordion type="multiple" className="w-full">
                <AccordionItem value="appearance" className="border-purple-700/50">
                  <AccordionTrigger 
                    className="hover:bg-purple-800/30 px-2 rounded text-white hover:text-purple-200"
                    onClick={() => incrementProgress('preparation')}
                  >
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full border-2 border-purple-400 flex items-center justify-center mr-2 bg-purple-900/50">
                        <span className="text-xs text-purple-200">1</span>
                      </div>
                      Apparence professionnelle
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-blue-100 bg-purple-950/30 rounded-md p-2 mt-1">
                    <ul className="list-disc ml-5 space-y-1">
                      <li>Tenue professionnelle adaptée au client (costume pour environnements formels)</li>
                      <li>Évitez les tenues trop décontractées même en cas d'environnement startup</li>
                      <li>Assurez-vous que vos vêtements sont propres, repassés et en bon état</li>
                      <li>Pour les auditions à distance, portez une tenue professionnelle complète</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="research" className="border-purple-700/50">
                  <AccordionTrigger 
                    className="hover:bg-purple-800/30 px-2 rounded text-white hover:text-purple-200"
                    onClick={() => incrementProgress('preparation')}
                  >
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full border-2 border-purple-400 flex items-center justify-center mr-2 bg-purple-900/50">
                        <span className="text-xs text-purple-200">2</span>
                      </div>
                      Recherches préalables
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-blue-100 bg-purple-950/30 rounded-md p-2 mt-1">
                    <ul className="list-disc ml-5 space-y-1">
                      <li>Renseignez-vous sur l'entreprise cliente (secteur, activités récentes)</li>
                      <li>Comprenez les enjeux business spécifiques au secteur</li>
                      <li>Identifiez les concurrents principaux et les tendances du marché</li>
                      <li>Consultez le site web et les réseaux sociaux de l'entreprise</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
            
            {/* Pitch section */}
            <div className="p-5 border-t border-purple-700/30 bg-gradient-to-br from-indigo-900/40 to-purple-900/20">
              <div className="flex items-center mb-3">
                <Lightbulb className="w-5 h-5 mr-2 text-yellow-300" />
                <h4 className="text-lg font-semibold text-white">Votre pitch personnel</h4>
              </div>
              
              <div className="space-y-2 text-blue-100">
                <p className="font-semibold text-yellow-100 flex items-center">
                  <Sparkles className="w-4 h-4 mr-1 text-yellow-300" /> Formule gagnante
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-indigo-900/40 p-2 rounded-md border border-indigo-600/30">
                    <span className="text-xs font-medium text-indigo-300">Éléments essentiels</span>
                    <ul className="list-disc ml-4 text-sm mt-1 space-y-0.5">
                      <li>Votre nom</li>
                      <li>Fonction chez mc2i</li>
                      <li>Formation académique</li>
                      <li>Compétences clés</li>
                    </ul>
                  </div>
                  <div className="bg-purple-900/40 p-2 rounded-md border border-purple-600/30">
                    <span className="text-xs font-medium text-purple-300">À éviter</span>
                    <ul className="list-disc ml-4 text-sm mt-1 space-y-0.5">
                      <li>Détails non pertinents</li>
                      <li>Historique complet</li>
                      <li>Informations personnelles</li>
                      <li>Expériences négatives</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-3 bg-gradient-to-br from-indigo-900/60 to-purple-900/60 p-3 rounded-md border border-indigo-500/40">
                  <p className="text-white font-medium text-sm">Exemple de pitch :</p>
                  <p className="italic text-sm text-blue-100 mt-1">« Je suis Jean-Louis DUPONT, consultant confirmé AMOA SI chez mc2i Groupe, je suis ingénieur diplômé de l'INSA et j'évolue depuis 3 ans dans les problématiques métier RH et Décisionnelles dans le secteur Privé »</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2 text-xs border-blue-400 text-blue-300 hover:bg-indigo-700 hover:text-white"
                    onClick={() => {
                      try {
                        navigator.clipboard?.writeText("Je suis [PRÉNOM NOM], consultant [NIVEAU] [SPÉCIALITÉ] chez mc2i Groupe, je suis [FORMATION] et j'évolue depuis [X] ans dans les problématiques [DOMAINES D'EXPERTISE] dans le secteur [SECTEUR]");
                        alert("Modèle de pitch copié dans le presse-papier");
                      } catch (error) {
                        console.error("Erreur lors de la copie:", error);
                      }
                    }}
                  >
                    <Copy className="w-3 h-3 mr-1" /> Copier le modèle
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
        
        {/* SECTION 2: PENDANT L'AUDITION */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold flex items-center">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center mr-3 text-white">2</div>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
                Pendant l'audition
              </span>
            </h3>
            <Badge variant="outline" className="bg-blue-900/40 text-blue-200 border-blue-500">
              {progressTracker.during.completed}/{progressTracker.during.total} étapes
            </Badge>
          </div>
          
          <Card className="bg-gradient-to-br from-blue-900/50 to-cyan-900/30 border-blue-500/50 shadow-lg overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-400"></div>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <Users className="w-5 h-5 mr-2 text-blue-300" />
                Conduite de l'entretien
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Accordion type="multiple" className="w-full">
                <AccordionItem value="first-contact" className="border-blue-700/50">
                  <AccordionTrigger 
                    className="hover:bg-blue-800/30 px-2 rounded text-white hover:text-blue-200"
                    onClick={() => incrementProgress('during')}
                  >
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full border-2 border-blue-400 flex items-center justify-center mr-2 bg-blue-900/50">
                        <span className="text-xs text-blue-200">1</span>
                      </div>
                      Premier contact
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-blue-100 bg-blue-950/30 rounded-md p-2 mt-1">
                    <ul className="list-disc ml-5 space-y-1 text-sm">
                      <li>Soyez ponctuel (arrivez 10-15 minutes en avance)</li>
                      <li>En présentiel : poignée de main franche, contact visuel</li>
                      <li>À distance : vérifiez votre équipement technique avant</li>
                      <li>Laissez au manager le soin de "briser la glace"</li>
                      <li>Remerciez pour l'opportunité de cette audition</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="context" className="border-blue-700/50">
                  <AccordionTrigger 
                    className="hover:bg-blue-800/30 px-2 rounded text-white hover:text-blue-200"
                    onClick={() => incrementProgress('during')}
                  >
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full border-2 border-blue-400 flex items-center justify-center mr-2 bg-blue-900/50">
                        <span className="text-xs text-blue-200">2</span>
                      </div>
                      L'entonnoir d'information
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-blue-100 bg-blue-950/30 rounded-md p-2 mt-1">
                    <p className="mb-2 text-sm">Démontrez votre compréhension en partant du <span className="text-white font-semibold">général</span> vers le <span className="text-white font-semibold">spécifique</span>.</p>
                    
                    <div className="space-y-1">
                      <div className="flex items-center bg-blue-800/30 p-2 rounded-t-md border-l-4 border-blue-500">
                        <span className="text-sm font-medium text-white flex-1">LE DÉPARTEMENT</span>
                        <span className="text-xs px-2 py-0.5 bg-blue-700/50 rounded-full">Général</span>
                      </div>
                      <div className="flex items-center bg-blue-800/40 p-2 border-l-4 border-blue-500">
                        <span className="text-sm font-medium text-white flex-1">LE PROJET</span>
                        <span className="text-xs px-2 py-0.5 bg-blue-700/60 rounded-full">Intermédiaire</span>
                      </div>
                      <div className="flex items-center bg-blue-800/50 p-2 rounded-b-md border-l-4 border-blue-500">
                        <span className="text-sm font-medium text-white flex-1">LA MISSION</span>
                        <span className="text-xs px-2 py-0.5 bg-blue-700/70 rounded-full">Spécifique</span>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="questions" className="border-blue-700/50">
                  <AccordionTrigger 
                    className="hover:bg-blue-800/30 px-2 rounded text-white hover:text-blue-200"
                    onClick={() => incrementProgress('during')}
                  >
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full border-2 border-blue-400 flex items-center justify-center mr-2 bg-blue-900/50">
                        <span className="text-xs text-blue-200">3</span>
                      </div>
                      Questions intelligentes
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-blue-100 bg-blue-950/30 rounded-md p-2 mt-1">
                    <div className="space-y-2 text-sm">
                      <p>Quand on vous demande si vous avez des questions, répondez toujours <span className="font-bold text-white">OUI</span>.</p>
                      
                      <div className="bg-gradient-to-br from-blue-800/60 to-blue-900/60 p-2 rounded-md border border-blue-500/40">
                        <div className="flex items-center mb-1">
                          <Star className="w-4 h-4 mr-1 text-yellow-300" />
                          <p className="text-white font-medium text-sm">Questions stratégiques :</p>
                        </div>
                        <ul className="list-disc ml-5 space-y-0.5 text-xs">
                          <li>Quels sont les facteurs clés de réussite de cette mission ?</li>
                          <li>Quelles sont les principales difficultés anticipées ?</li>
                          <li>Comment s'intègre ce projet dans la stratégie globale ?</li>
                          <li>Quelles sont vos attentes concernant la communication ?</li>
                        </ul>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
            
            {/* Savoir-être section */}
            <div className="p-5 border-t border-blue-700/30 bg-gradient-to-br from-cyan-900/40 to-blue-900/20">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center">
                  <BriefcaseBusiness className="w-5 h-5 mr-2 text-cyan-300" />
                  <h4 className="text-lg font-semibold text-white">Savoir-être professionnel</h4>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="text-xs text-cyan-300 hover:bg-blue-800/50 hover:text-white"
                  onClick={() => incrementProgress('during', 2)}
                >
                  Marquer comme lu
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/20 rounded-md p-3 border border-cyan-700/30">
                  <h5 className="font-medium text-cyan-200 text-sm mb-1 flex items-center">
                    <div className="w-5 h-5 rounded-full bg-cyan-800 flex items-center justify-center mr-1.5 text-white text-xs">P</div>
                    Posture
                  </h5>
                  <ul className="list-disc ml-4 text-xs space-y-1 text-blue-100">
                    <li>Dos droit, mains sur la table</li>
                    <li>Contact visuel avec l'auditoire</li>
                    <li>Gestuelle maîtrisée</li>
                  </ul>
                </div>
                
                <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/20 rounded-md p-3 border border-cyan-700/30">
                  <h5 className="font-medium text-cyan-200 text-sm mb-1 flex items-center">
                    <div className="w-5 h-5 rounded-full bg-cyan-800 flex items-center justify-center mr-1.5 text-white text-xs">A</div>
                    Attitude
                  </h5>
                  <ul className="list-disc ml-4 text-xs space-y-1 text-blue-100">
                    <li>Poli, courtois et enthousiaste</li>
                    <li>Déterminé et serein</li>
                    <li>Dialogue authentique</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/20 rounded-md p-3 border border-cyan-700/30">
                <h5 className="font-medium text-cyan-200 text-sm mb-1 flex items-center">
                  <div className="w-5 h-5 rounded-full bg-cyan-800 flex items-center justify-center mr-1.5 text-white text-xs">C</div>
                  Communication
                </h5>
                <ul className="list-disc ml-4 text-xs space-y-1 text-blue-100">
                  <li>Évitez les tics de langage ('donc', 'euh', 'en fait')</li>
                  <li>Contrôlez votre débit avec des pauses pour respirer</li>
                  <li>Adaptez votre volume à l'environnement</li>
                  <li>Ne coupez jamais la parole à votre interlocuteur</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
        
        {/* SECTION 3: APRÈS L'AUDITION */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold flex items-center">
              <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center mr-3 text-white">3</div>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-400">
                Après l'audition
              </span>
            </h3>
            <Badge variant="outline" className="bg-green-900/40 text-green-200 border-green-500">
              {progressTracker.after.completed}/{progressTracker.after.total} étapes
            </Badge>
          </div>
          
          <Card className="bg-gradient-to-br from-green-900/50 to-teal-900/30 border-green-500/50 shadow-lg overflow-hidden h-full">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-teal-400"></div>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <FileCheck className="w-5 h-5 mr-2 text-green-300" />
                Suivi post-entretien
              </CardTitle>
              <CardDescription className="text-green-100">
                Les actions post-entretien sont souvent négligées mais peuvent faire la différence.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Accordion type="multiple" className="w-full">
                <AccordionItem value="immediate-actions" className="border-green-700/50">
                  <AccordionTrigger 
                    className="hover:bg-green-800/30 px-2 rounded text-white hover:text-green-200"
                    onClick={() => incrementProgress('after')}
                  >
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full border-2 border-green-400 flex items-center justify-center mr-2 bg-green-900/50">
                        <span className="text-xs text-green-200">1</span>
                      </div>
                      Actions immédiates
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-blue-100 bg-green-950/30 rounded-md p-2 mt-1">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center">
                        <div className="w-5 h-5 rounded-full bg-green-800/70 flex items-center justify-center mr-2">
                          <CheckCircle className="w-3 h-3 text-green-200" />
                        </div>
                        <span className="text-sm">Remerciez sincèrement les interlocuteurs</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-5 h-5 rounded-full bg-green-800/70 flex items-center justify-center mr-2">
                          <CheckCircle className="w-3 h-3 text-green-200" />
                        </div>
                        <span className="text-sm">Exprimez clairement votre motivation</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-5 h-5 rounded-full bg-green-800/70 flex items-center justify-center mr-2">
                          <CheckCircle className="w-3 h-3 text-green-200" />
                        </div>
                        <span className="text-sm">Échangez des cartes de visite si possible</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-5 h-5 rounded-full bg-green-800/70 flex items-center justify-center mr-2">
                          <CheckCircle className="w-3 h-3 text-green-200" />
                        </div>
                        <span className="text-sm">Demandez les prochaines étapes du processus</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-5 h-5 rounded-full bg-green-800/70 flex items-center justify-center mr-2">
                          <CheckCircle className="w-3 h-3 text-green-200" />
                        </div>
                        <span className="text-sm">Précisez votre disponibilité pour démarrer</span>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="follow-up" className="border-green-700/50">
                  <AccordionTrigger 
                    className="hover:bg-green-800/30 px-2 rounded text-white hover:text-green-200"
                    onClick={() => incrementProgress('after')}
                  >
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full border-2 border-green-400 flex items-center justify-center mr-2 bg-green-900/50">
                        <span className="text-xs text-green-200">2</span>
                      </div>
                      Email de remerciement
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-blue-100 bg-green-950/30 rounded-md p-2 mt-1">
                    <div className="space-y-2">
                      <div className="flex items-center bg-green-800/30 rounded p-1.5 text-xs text-green-200">
                        <Clock className="w-3 h-3 mr-1" />
                        Envoyez un email dans les 24h suivant l'entretien
                      </div>
                      
                      <div className="bg-gradient-to-br from-green-800/60 to-teal-900/60 p-3 rounded-md border border-green-500/40">
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-white font-medium text-sm">Modèle d'email :</p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-6 text-xs border-green-500 text-green-300 hover:bg-green-700 hover:text-white"
                            onClick={() => {
                              try {
                                navigator.clipboard?.writeText("Objet : Remerciement suite à notre entretien du [DATE]\n\nBonjour [PRÉNOM],\n\nJe tenais à vous remercier pour notre échange d'aujourd'hui concernant la mission [NOM DU PROJET].\n\nCet entretien a renforcé mon intérêt pour cette opportunité et je suis convaincu(e) que mon expérience en [COMPÉTENCE CLÉ] sera un atout pour la réussite de ce projet.\n\nJe reste à votre disposition pour toute information complémentaire dont vous pourriez avoir besoin.\n\nBien cordialement,\n[VOTRE NOM]\nConsultant(e) mc2i");
                                alert("Modèle d'email copié dans le presse-papier");
                              } catch (error) {
                                console.error("Erreur lors de la copie:", error);
                              }
                            }}
                          >
                            <Copy className="w-3 h-3 mr-1" /> Copier
                          </Button>
                        </div>
                        <div className="border-l-2 border-green-500 pl-2 mt-1 text-xs space-y-1 italic">
                          <p>Objet : Remerciement suite à notre entretien du [DATE]</p>
                          <p>Bonjour [PRÉNOM],</p>
                          <p>Je tenais à vous remercier pour notre échange concernant la mission [PROJET].</p>
                          <p>Cet entretien a renforcé mon intérêt pour cette opportunité et je suis convaincu(e) que mon expérience en [COMPÉTENCE] sera un atout.</p>
                          <p>Je reste à votre disposition pour toute information complémentaire.</p>
                          <p>Bien cordialement,</p>
                          <p>[VOTRE NOM]</p>
                          <p>Consultant(e) mc2i</p>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="internal-debrief" className="border-green-700/50">
                  <AccordionTrigger 
                    className="hover:bg-green-800/30 px-2 rounded text-white hover:text-green-200"
                    onClick={() => incrementProgress('after')}
                  >
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full border-2 border-green-400 flex items-center justify-center mr-2 bg-green-900/50">
                        <span className="text-xs text-green-200">3</span>
                      </div>
                      Débriefing interne
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-blue-100 bg-green-950/30 rounded-md p-2 mt-1">
                    <div className="space-y-2">
                      <p className="text-sm">Organisez rapidement un débriefing avec votre manager mc2i :</p>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-green-900/40 p-2 rounded-md border border-green-600/30">
                          <span className="text-xs font-medium text-green-300">À partager</span>
                          <ul className="list-disc ml-4 text-xs mt-1 space-y-0.5">
                            <li>Impressions générales</li>
                            <li>Questions techniques posées</li>
                            <li>Réception par le client</li>
                            <li>Prochaines étapes évoquées</li>
                          </ul>
                        </div>
                        <div className="bg-teal-900/40 p-2 rounded-md border border-teal-600/30">
                          <span className="text-xs font-medium text-teal-300">À analyser</span>
                          <ul className="list-disc ml-4 text-xs mt-1 space-y-0.5">
                            <li>Points forts de votre prestation</li>
                            <li>Points d'amélioration</li>
                            <li>Degré d'adéquation au poste</li>
                            <li>Probabilité de succès</li>
                          </ul>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-green-900/40 to-teal-900/40 rounded-md p-3 border border-green-600/30 mt-1 flex items-center">
                        <TimerReset className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                        <p className="text-xs">Créez un document personnel de "leçons apprises" pour progresser lors de vos futures auditions</p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
            
            {/* Final advice */}
            <div className="p-5 border-t border-green-700/30 bg-gradient-to-b from-teal-900/40 to-green-900/20 mt-auto">
              <div className="bg-gradient-to-br from-teal-800/30 to-green-900/30 rounded-md p-3 border border-teal-500/50">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-teal-300 font-medium flex items-center">
                    <FileCheck className="w-4 h-4 mr-1.5" />
                    Votre checklist finale
                  </h5>
                  <Badge className="bg-teal-700/50 text-teal-100">
                    Impact élevé
                  </Badge>
                </div>
                <ul className="space-y-1">
                  <li className="flex items-center text-sm text-teal-100">
                    <div className="w-4 h-4 rounded border border-teal-400 mr-2 flex items-center justify-center">
                      <CheckCircle className="w-3 h-3 text-teal-400" />
                    </div>
                    Remercier tous les participants
                  </li>
                  <li className="flex items-center text-sm text-teal-100">
                    <div className="w-4 h-4 rounded border border-teal-400 mr-2 flex items-center justify-center">
                      <CheckCircle className="w-3 h-3 text-teal-400" />
                    </div>
                    Envoyer un email personnalisé dans les 24h
                  </li>
                  <li className="flex items-center text-sm text-teal-100">
                    <div className="w-4 h-4 rounded border border-teal-400 mr-2 flex items-center justify-center">
                      <CheckCircle className="w-3 h-3 text-teal-400" />
                    </div>
                    Faire un débriefing avec votre manager
                  </li>
                  <li className="flex items-center text-sm text-teal-100">
                    <div className="w-4 h-4 rounded border border-teal-400 mr-2 flex items-center justify-center">
                      <CheckCircle className="w-3 h-3 text-teal-400" />
                    </div>
                    Noter vos points d'amélioration
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
      

    </div>
  );
};

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
      <div className="flex flex-col w-full min-h-screen p-4 md:p-8 bg-gradient-to-b from-gray-800 to-gray-950 text-white">
        <div className="flex justify-between items-center mb-4">
          <Button 
            variant="ghost" 
            className="text-white hover:text-white hover:bg-gray-700/80"
            onClick={() => navigate("/amoa-mode-selection-fixed")}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Retour
          </Button>
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-500">
            Préparation d'audition client - mc2i exclusif
          </h1>
          <p className="text-gray-300 max-w-3xl mx-auto">
            Cette simulation vous aide à préparer les consultants mc2i pour des auditions auprès de clients, avec des conseils sur la tenue, l'attitude professionnelle et les bonnes pratiques avant, pendant et après l'entretien.
          </p>
        </div>
        
        <Tabs 
          defaultValue="best-practices" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full max-w-6xl mx-auto"
        >
          <TabsList className="grid grid-cols-3 mb-8 bg-gray-800/60">
            <TabsTrigger 
              value="best-practices"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-700/80 data-[state=active]:to-blue-700/80"
            >
              Bonnes pratiques
            </TabsTrigger>
            <TabsTrigger 
              value="simulation"
              disabled={!isSimulationActive}
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-700/80 data-[state=active]:to-cyan-700/80"
            >
              Simulation
            </TabsTrigger>
            <TabsTrigger 
              value="evaluation"
              disabled={!simulationComplete}
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-700/80 data-[state=active]:to-teal-700/80"
            >
              Évaluation
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="best-practices">
            <Card className="bg-gray-800/30 border-gray-700/50 shadow-lg">
              <CardHeader className="border-b border-gray-700/50">
                <CardTitle className="text-xl text-center">Guide de préparation d'audition pour les consultants mc2i</CardTitle>
                <CardDescription className="text-gray-300 text-center">
                  Conseils pour optimiser votre présentation et votre comportement lors des auditions client
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <BestPracticesContent />
              </CardContent>
              <CardFooter className="flex justify-between border-t border-gray-700/50 pt-4">
                <Button
                  onClick={() => window.print()}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Imprimer ce guide
                </Button>
                <Button
                  onClick={() => setActiveTab('configuration')}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  Démarrer une simulation
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="configuration">
            <Card className="bg-gray-800/30 border-gray-700/50 shadow-lg">
              <CardHeader className="border-b border-gray-700/50">
                <CardTitle className="text-xl">Configuration de l'audition</CardTitle>
                <CardDescription className="text-gray-300">
                  Configurez les paramètres pour la simulation d'audition
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(startSimulation)} className="space-y-6">
                    <div className="bg-gray-800/60 p-5 rounded-md mb-6 border border-gray-700/50">
                      <h3 className="text-lg font-semibold mb-4">Informations optionnelles pour recevoir l'évaluation par email</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="recruiterEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-300">Votre email (envoi du rapport)</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="votre.email@mc2i.fr" 
                                  className="bg-gray-900/60 border-gray-700 text-white"
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
                              <FormLabel className="text-gray-300">Nom du consultant</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Prénom Nom" 
                                  className="bg-gray-900/60 border-gray-700 text-white"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <div className="bg-gray-800/60 p-5 rounded-md border border-gray-700/50">
                      <h3 className="text-lg font-semibold mb-4">Paramètres de simulation (requis)</h3>
                      <div className="grid grid-cols-1 gap-4">
                        <FormField
                          control={form.control}
                          name="profileType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-300">Type de profil</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="bg-gray-900/60 border-gray-700 text-white">
                                    <SelectValue placeholder="Sélectionnez un type de profil" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-gray-800 border-gray-700 text-white">
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
                              <FormLabel className="text-gray-300">Niveau d'expérience</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="bg-gray-900/60 border-gray-700 text-white">
                                    <SelectValue placeholder="Sélectionnez un niveau d'expérience" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-gray-800 border-gray-700 text-white">
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
                              <FormLabel className="text-gray-300">Secteur d'activité</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="bg-gray-900/60 border-gray-700 text-white">
                                    <SelectValue placeholder="Sélectionnez un secteur d'activité" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-gray-800 border-gray-700 text-white">
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
                        className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
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
                        className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800"
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
            <Card className="bg-gray-800/30 border-gray-700/50 shadow-lg">
              <CardHeader className="border-b border-gray-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <UserCircle className="w-6 h-6 mr-2 text-yellow-500" />
                    <CardTitle className="text-xl">Simulation d'audition client</CardTitle>
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
                  Conversation avec le client potentiel
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
                              Vous
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
                  onClick={resetSimulation}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
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
                  <CardTitle className="text-xl">Évaluation de l'audition</CardTitle>
                </div>
                <CardDescription className="text-gray-300">
                  Analyse de la performance du consultant pendant l'audition
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {evaluationResult ? (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-gray-800/60 to-gray-700/60 p-5 rounded-md border border-gray-600/50">
                      <h3 className="text-lg font-semibold mb-2">Résumé de l'audition</h3>
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
                      <h3 className="text-lg font-semibold mb-2 text-purple-300">Adéquation avec le secteur {form.getValues('sectorFocus') || ""}</h3>
                      <p className="text-gray-300 mb-2">
                        {evaluationResult.sectorFitEvaluation || "Aucune évaluation d'adéquation sectorielle disponible."}
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
                  onClick={resetSimulation}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
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
                    <FormLabel className="text-white">Nom du consultant</FormLabel>
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