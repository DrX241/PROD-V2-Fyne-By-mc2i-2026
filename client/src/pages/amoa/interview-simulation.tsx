import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserCircle, Send, Clock, CheckCircle, AlertCircle, FileCheck, ArrowLeft, Mail, User, Building, Briefcase, FileEdit } from 'lucide-react';

import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import HomeLayout from '@/components/layout/HomeLayout';

// Interface pour définir le contexte d'audition AMOA
interface AuditContext {
  id: string;
  title: string;
  description: string;
  organization: string;
  projectContext: string;
  expectations: string[];
  requirements: string[];
}

// Liste des contextes d'audition prédéfinis pour AMOA
const PREDEFINED_AUDIT_CONTEXTS: AuditContext[] = [
  {
    id: "digital-transformation",
    title: "Chef de projet transformation digitale",
    description: "Chef de projet pour accompagner une transformation digitale globale",
    organization: "RetailPlus, enseigne de distribution nationale (3000 employés)",
    projectContext: "Projet de transformation digitale visant à moderniser l'ensemble des processus commerciaux, du parcours client à la gestion des stocks. Budget de 5M€ sur 3 ans.",
    expectations: [
      "Cadrer le projet de transformation et accompagner les parties prenantes",
      "Identifier les processus à optimiser en priorité",
      "Piloter les équipes techniques et les prestataires",
      "Gérer le changement auprès des équipes métier",
      "Mesurer et communiquer sur les résultats du projet"
    ],
    requirements: [
      "5+ ans d'expérience en gestion de projet digital",
      "Compétence en conduite du changement",
      "Connaissance du secteur retail",
      "Certification PMP, Prince2 ou équivalent",
      "Expérience en méthodologies agiles"
    ]
  },
  {
    id: "banking-compliance",
    title: "Consultant AMOA conformité réglementaire",
    description: "Consultant spécialisé en conformité réglementaire bancaire",
    organization: "FinSecure, établissement bancaire de taille importante (8000 employés)",
    projectContext: "Mise en conformité avec les nouvelles directives européennes sur les paiements et la lutte anti-blanchiment. Projet critique avec échéance réglementaire de 12 mois.",
    expectations: [
      "Analyser les impacts des nouvelles réglementations sur les SI existants",
      "Rédiger les spécifications fonctionnelles détaillées",
      "Accompagner les équipes de développement",
      "Assurer la recette fonctionnelle des évolutions",
      "Produire la documentation réglementaire nécessaire"
    ],
    requirements: [
      "3+ ans d'expérience en AMOA secteur bancaire",
      "Connaissance approfondie des réglementations DSP2, RGPD et LCB-FT",
      "Expérience en analyse fonctionnelle",
      "Capacité à dialoguer avec les autorités de régulation",
      "Rigueur et sens du détail"
    ]
  },
  {
    id: "healthcare-system",
    title: "AMOA Systèmes d'information santé",
    description: "Assistant à maîtrise d'ouvrage pour le déploiement d'un nouveau SI hospitalier",
    organization: "Centre Hospitalier Régional, établissement public de santé (5000 personnels)",
    projectContext: "Déploiement d'un nouveau système d'information patient intégré pour remplacer plusieurs applications obsolètes. Enjeux de continuité de service et confidentialité des données.",
    expectations: [
      "Recueillir et formaliser les besoins des différents services hospitaliers",
      "Participer à la sélection des solutions et prestataires",
      "Coordonner les phases de paramétrage et de test",
      "Former les référents métiers et accompagner le déploiement",
      "Assurer le suivi post-déploiement et les ajustements nécessaires"
    ],
    requirements: [
      "4+ ans d'expérience en AMOA systèmes d'information",
      "Connaissance du secteur de la santé et de ses contraintes",
      "Maîtrise de la gestion de données sensibles (RGPD santé)",
      "Expérience en conduite du changement en milieu hospitalier",
      "Capacité à travailler avec des équipes pluridisciplinaires"
    ],

  },
  {
    id: "energy-erp",
    title: "AMOA ERP secteur énergie",
    description: "Assistant à maîtrise d'ouvrage spécialisé en ERP pour le secteur énergétique",
    organization: "EnerGreen, producteur et distributeur d'énergie renouvelable (1200 employés)",
    projectContext: "Implémentation d'un ERP pour unifier la gestion des opérations après plusieurs acquisitions. Enjeux d'intégration des systèmes existants et d'adaptation aux spécificités du secteur.",
    expectations: [
      "Cartographier les processus métier actuels et définir les processus cibles",
      "Définir les exigences fonctionnelles et non-fonctionnelles",
      "Superviser les phases de paramétrage et de développements spécifiques",
      "Organiser et suivre les tests d'acceptation",
      "Coordonner la migration des données et la mise en production"
    ],
    requirements: [
      "5+ ans d'expérience en implémentation d'ERP",
      "Connaissance du secteur énergétique",
      "Expertise en gestion des processus d'entreprise",
      "Compétences en gestion de projet et planification",
      "Capacité à comprendre les enjeux techniques et métier"
    ],

  }
];

// Schéma de formulaire pour la configuration de l'entretien
const formSchema = z.object({
  // Champs optionnels (peuvent être ignorés au début)
  recruiterEmail: z.string().email({
    message: "Veuillez entrer une adresse email valide.",
  }).optional().or(z.literal('')),
  candidateName: z.string().min(2, {
    message: "Le nom du consultant doit contenir au moins 2 caractères.",
  }).optional().or(z.literal('')),
  
  // Contexte d'audition personnalisé ou prédéfini
  auditContextType: z.enum(["predefined", "custom"]).optional(),
  selectedAuditContext: z.string().optional(),
  customAuditContext: z.string().optional(),
  
  // Champs obligatoires pour la simulation
  profileType: z.string().min(1, {
    message: "Veuillez sélectionner un type de profil.",
  }),
  experienceLevel: z.string().min(1, {
    message: "Veuillez sélectionner un niveau d'expérience.",
  }),
});

// Schéma pour le formulaire de contact à la fin de la simulation (tous les champs sont obligatoires)
const contactFormSchema = z.object({
  // Champs de contact qui étaient optionnels au début, maintenant obligatoires
  recruiterEmail: z.string().email({
    message: "Veuillez entrer une adresse email valide.",
  }),
  candidateName: z.string().min(2, {
    message: "Le nom du consultant doit contenir au moins 2 caractères.",
  }),
  
  // On inclut également les champs importants pour l'évaluation si jamais ils n'ont pas été correctement
  // définis précédemment (même si en théorie ils devraient déjà avoir été validés)
  profileType: z.string().min(1, {
    message: "Veuillez sélectionner un type de profil.",
  }),
  experienceLevel: z.string().min(1, {
    message: "Veuillez sélectionner un niveau d'expérience.",
  }),
});

// Types d'inférence pour les schémas de formulaire
type FormValues = z.infer<typeof formSchema>;
type ContactFormValues = z.infer<typeof contactFormSchema>;

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const AmoaInterviewSimulation: React.FC<{}> = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('configuration');
  
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
  
  // État pour le contexte d'audit
  const [auditContextData, setAuditContextData] = useState<any>({});
  
  // Référence pour le défilement
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Effet pour faire défiler vers le bas à chaque nouveau message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Effet pour le compte à rebours
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isSimulationActive && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            if (!simulationComplete) {
              completeSimulation();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isSimulationActive, timeRemaining, simulationComplete]);
  
  // Formatage du temps restant
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Configuration du compte à rebours
  const startTimer = () => {
    console.log("Démarrage du timer...");
    setTimeRemaining(600); // 10 minutes en secondes
  };
  
  // Configuration du formulaire
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      recruiterEmail: '',
      candidateName: '',
      auditContextType: 'predefined',
      selectedAuditContext: '',
      customAuditContext: '',
      profileType: '',
      experienceLevel: '',
    },
  });
  
  // Démarrage de la simulation
  const startSimulation = async (values: FormValues) => {
    setIsLoading(true);
    
    // Vérifier si les informations ont été ignorées
    if (!values.recruiterEmail || !values.candidateName) {
      setIsSkippedInfo(true);
    } else {
      setIsSkippedInfo(false);
    }
    
    try {
      // Préparation des données du contexte d'audition
      let contextData = {};
      
      if (values.auditContextType === 'predefined' && values.selectedAuditContext) {
        const selectedContext = PREDEFINED_AUDIT_CONTEXTS.find(ctx => ctx.id === values.selectedAuditContext);
        if (selectedContext) {
          contextData = {
            contextType: 'predefined',
            contextData: selectedContext
          };
        }
      } else if (values.auditContextType === 'custom' && values.customAuditContext) {
        contextData = {
          contextType: 'custom',
          contextData: {
            description: values.customAuditContext
          }
        };
      }
      
      // Mise à jour de l'état du contexte d'audit
      setAuditContextData(contextData);
      
      const response = await fetch('/api/amoa/interview-simulation/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domain: 'amoa',
          ...values,
          auditContext: contextData
        })
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du démarrage de la simulation');
      }
      
      const data = await response.json();
      
      // Ajouter le message initial de l'assistant
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: data.initialMessage || "Bonjour, je suis votre interlocuteur client aujourd'hui. Nous allons évaluer vos compétences en assistance à maîtrise d'ouvrage. Présentez-vous et dites-moi ce qui vous intéresse dans ce domaine.",
          timestamp: new Date(),
        },
      ]);
      
      setIsSimulationActive(true);
      setActiveTab('simulation');
      
      // Démarrer le timer
      startTimer();
      
      toast({
        title: "Simulation démarrée",
        description: "La simulation d'audition a commencé. Vous avez 10 minutes.",
      });
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
  
  // Fonction pour ignorer la saisie des informations de contact (uniquement email et nom)
  const skipInfoAndStart = async () => {
    console.log("Fonction skipInfoAndStart appelée");
    setIsSkippedInfo(true);
    
    // Récupérer les valeurs obligatoires (type de profil, niveau d'expérience)
    const profileType = form.getValues('profileType');
    const experienceLevel = form.getValues('experienceLevel');
    
    // Vérifier que tous les champs obligatoires sont remplis
    if (!profileType || !experienceLevel) {
      toast({
        variant: "destructive",
        title: "Champs obligatoires manquants",
        description: "Les champs Type de profil et Niveau d'expérience sont obligatoires."
      });
      return;
    }
    
    console.log("Valeurs du formulaire:", { profileType, experienceLevel });

    // Appel direct à l'API sans passer par la validation complète du formulaire
    setIsLoading(true);
    
    // Déclarer la variable en dehors du bloc try pour qu'elle soit accessible dans le catch
    let responseData: any = null;
    
    try {
      console.log("Envoi de la requête API...");
      
      // Récupérer les informations de contexte d'audition
      const auditContextType = form.getValues('auditContextType');
      const selectedAuditContext = form.getValues('selectedAuditContext');
      const customAuditContext = form.getValues('customAuditContext');
      
      // Préparation des données du contexte d'audition
      let auditContextData = {};
      
      if (auditContextType === 'predefined' && selectedAuditContext) {
        const selectedContext = PREDEFINED_AUDIT_CONTEXTS.find(ctx => ctx.id === selectedAuditContext);
        if (selectedContext) {
          auditContextData = {
            contextType: 'predefined',
            contextData: selectedContext
          };
        }
      } else if (auditContextType === 'custom' && customAuditContext) {
        auditContextData = {
          contextType: 'custom',
          contextData: {
            description: customAuditContext
          }
        };
      }
      
      // Mise à jour de l'état du contexte d'audit global
      setAuditContextData(auditContextData);
      
      // Préparer les données à envoyer (sans les informations de contact)
      const payload = {
        domain: 'amoa',
        profileType,
        experienceLevel,
        auditContext: auditContextData
      };
      
      console.log("Payload:", payload);
      
      const response = await fetch('/api/amoa/interview-simulation/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      console.log("Réponse API status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erreur API:", errorText);
        throw new Error(`Erreur lors du démarrage de la simulation: ${response.status}`);
      }
      
      // Récupérer le texte de la réponse d'abord
      const responseText = await response.text();
      console.log("Réponse brute:", responseText.substring(0, 100)); // Log une portion du texte pour le débogage
      
      // Variable déjà déclarée en amont
      try {
        // Tenter de parser la réponse en JSON
        responseData = JSON.parse(responseText);
        console.log("Données de réponse:", responseData);
      } catch (parseError) {
        console.error("Erreur de parsing JSON:", parseError);
        // En cas d'erreur de parsing, utiliser un objet par défaut
        responseData = { initialMessage: "Bonjour, je suis votre interlocuteur client aujourd'hui. Nous allons évaluer vos compétences en assistance à maîtrise d'ouvrage. Présentez-vous et dites-moi ce qui vous intéresse dans ce domaine." };
      }
    
      // Pas besoin de vérifier data.success, la réponse 200 suffit
      
      // Ajouter le message initial de l'assistant
      const initialMessage = responseData.initialMessage || "Bonjour, je suis votre interlocuteur client aujourd'hui. Nous allons évaluer vos compétences en assistance à maîtrise d'ouvrage. Présentez-vous et dites-moi ce qui vous intéresse dans ce domaine.";
      console.log("Message initial:", initialMessage);
      
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: initialMessage,
          timestamp: new Date(),
        },
      ]);
      
      // Activer la simulation
      setIsSimulationActive(true);
      setActiveTab('simulation');
      
      // Démarrer le timer
      startTimer();
      
      toast({
        title: "Simulation démarrée",
        description: "La simulation d'audition a commencé. Vous avez 10 minutes.",
      });
    } catch (error: any) {
      console.error('Erreur lors de l\'initialisation sans contact:', error);
      
      // Vérifier si la réponse est déjà arrivée avec succès malgré l'erreur de parsing
      if (responseData && responseData.initialMessage) {
        return; // Ne pas afficher d'erreur si nous avons déjà des données valides
      }
      
      toast({
        variant: "destructive",
        title: "Erreur",
        description: (error && error.message) ? error.message : "Impossible de démarrer la simulation. Veuillez réessayer.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Envoi d'un message
  const sendMessage = async () => {
    if (!userInput.trim()) return;
    
    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: userInput,
      timestamp: new Date(),
    };
    
    // Ajouter immédiatement le message de l'utilisateur
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);
    
    try {
      // Récupérer les informations de contexte d'audition
      const auditContextType = form.getValues('auditContextType');
      const selectedAuditContext = form.getValues('selectedAuditContext');
      const customAuditContext = form.getValues('customAuditContext');
      
      // Préparation des données du contexte d'audition
      let auditContextData = {};
      
      if (auditContextType === 'predefined' && selectedAuditContext) {
        const selectedContext = PREDEFINED_AUDIT_CONTEXTS.find(ctx => ctx.id === selectedAuditContext);
        if (selectedContext) {
          auditContextData = {
            contextType: 'predefined',
            contextData: selectedContext
          };
        }
      } else if (auditContextType === 'custom' && customAuditContext) {
        auditContextData = {
          contextType: 'custom',
          contextData: {
            description: customAuditContext
          }
        };
      }
      
      const response = await fetch('/api/amoa/interview-simulation/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domain: 'amoa',
          message: userMessage.content,
          profileType: form.getValues('profileType'),
          experienceLevel: form.getValues('experienceLevel'),
          auditContext: auditContextData,
          messages: messages.map(m => ({ role: m.role, content: m.content })),
        })
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi du message');
      }
      
      // Récupérer le texte de la réponse d'abord
      const responseText = await response.text();
      console.log("Réponse message brute:", responseText.substring(0, 100));
      
      let data;
      try {
        // Tenter de parser la réponse en JSON
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Erreur de parsing JSON (message):", parseError);
        // En cas d'erreur de parsing, utiliser un objet par défaut
        data = { response: "Je suis désolé, il semble y avoir un problème technique. Pouvez-vous reformuler votre question?" };
      }
      
      // Nous avons supprimé la limite de 5 échanges maximum
      // La simulation continue jusqu'à ce que le temps soit écoulé
      // ou que l'utilisateur décide de la terminer
      
      const assistantMessage = {
        id: Date.now().toString(),
        role: 'assistant' as const,
        content: data.response,
        timestamp: new Date(),
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
  
  // Finalisation de la simulation
  const completeSimulation = async () => {
    if (simulationComplete) return;
    
    // Vérifier si toutes les informations nécessaires sont disponibles
    const recruiterEmail = form.getValues('recruiterEmail');
    const candidateName = form.getValues('candidateName');
    const profileType = form.getValues('profileType');
    const experienceLevel = form.getValues('experienceLevel');
    
    // Si l'utilisateur a ignoré la saisie des informations de contact OU si email/nom manquent, demander les infos
    if (isSkippedInfo || !recruiterEmail || !candidateName) {
      // Pré-remplir le formulaire final avec les valeurs déjà entrées
      contactForm.setValue('profileType', profileType);
      contactForm.setValue('experienceLevel', experienceLevel);
      if (recruiterEmail) contactForm.setValue('recruiterEmail', recruiterEmail);
      if (candidateName) contactForm.setValue('candidateName', candidateName);
      
      setShowContactForm(true);
      return;
    }
    
    await finalizeSimulation(recruiterEmail, candidateName, profileType, experienceLevel);
  };
  
  // Traitement final effectif de la simulation avec toutes les données nécessaires
  const finalizeSimulation = async (
    recruiterEmail: string,
    candidateName: string,
    profileType: string,
    experienceLevel: string
  ) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/amoa/interview-simulation/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domain: 'amoa',
          trainerEmail: recruiterEmail,
          candidateName,
          profileType,
          experienceLevel,
          auditContext: auditContextData, // Utilisation de l'état du contexte d'audit
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          duration: 600 - timeRemaining,
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erreur API (finalisation):", errorText);
        
        // Analyser l'erreur pour afficher un message plus informatif
        try {
          const errorObj = JSON.parse(errorText);
          if (errorObj.error && errorObj.error.includes("trop courte pour être évaluée")) {
            toast({
              variant: "destructive",
              title: "Entretien trop court",
              description: "L'audition est trop courte pour être évaluée. Veuillez poursuivre l'échange avant de finaliser.",
            });
            setIsLoading(false);
            return;
          }
        } catch (e) {
          // Si le parsing échoue, utiliser le message d'erreur générique
        }
        
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
            improvements: ["Réessayez avec une connexion Internet stable"],
            detailedNotes: "Une erreur est survenue lors de la génération de l'évaluation détaillée.",
            recommendations: ["Contacter le support technique"],
            sectorFitEvaluation: "Évaluation non disponible",
            conclusion: "Simulation terminée avec des erreurs."
          } 
        };
      }
      
      setEvaluationResult(data.evaluation);
      setSimulationComplete(true);
      setActiveTab('evaluation');
      
      // Notification différente selon si un email a été envoyé
      if (data.emailSent) {
        toast({
          title: "Simulation terminée",
          description: "L'évaluation est disponible et a été envoyée par email.",
          variant: "default",
          className: "bg-green-100 border-green-400 text-green-900"
        });
      } else {
        toast({
          title: "Simulation terminée",
          description: "L'évaluation de l'audition est disponible.",
        });
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de finaliser la simulation. Veuillez réessayer.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Configuration du formulaire de contact final
  const contactForm = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      recruiterEmail: '',
      candidateName: '',
      profileType: form.getValues('profileType') || '',
      experienceLevel: form.getValues('experienceLevel') || '',
    },
  });
  
  // Soumission du formulaire de contact
  const onContactFormSubmit = async (values: ContactFormValues) => {
    setShowContactForm(false);
    
    // Mettre à jour les valeurs du formulaire principal pour la consistance
    form.setValue('recruiterEmail', values.recruiterEmail);
    form.setValue('candidateName', values.candidateName);
    
    // Finaliser la simulation avec les informations complètes
    await finalizeSimulation(
      values.recruiterEmail,
      values.candidateName,
      values.profileType,
      values.experienceLevel
    );
  };
  
  // Réinitialisation de la simulation
  const resetSimulation = () => {
    setIsSimulationActive(false);
    setSimulationComplete(false);
    setMessages([]);
    setTimeRemaining(600);
    setActiveTab('configuration');
    setEvaluationResult(null);
    setIsSkippedInfo(false);
    form.reset();
  };
  
  // Fonction pour analyser les notes prises pendant l'entretien
  const analyzeNotes = async () => {
    if (!notesText.trim()) {
      toast({
        variant: "destructive",
        title: "Notes vides",
        description: "Veuillez ajouter des notes avant de les analyser.",
      });
      return;
    }
    
    setIsAnalyzingNotes(true);
    
    try {
      const response = await fetch('/api/amoa/interview-simulation/analyze-notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domain: 'amoa',
          notes: notesText,
          candidateName: form.getValues('candidateName') || contactForm.getValues('candidateName') || 'Consultant',
          profileType: form.getValues('profileType') || contactForm.getValues('profileType'),
          experienceLevel: form.getValues('experienceLevel') || contactForm.getValues('experienceLevel'),
        })
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'analyse des notes');
      }
      
      const data = await response.json();
      setSynthesisResult(data.synthesis);
      
      toast({
        title: "Analyse terminée",
        description: "La synthèse des notes a été générée avec succès.",
      });
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'analyser les notes. Veuillez réessayer.",
      });
    } finally {
      setIsAnalyzingNotes(false);
    }
  };
  
  return (
    <HomeLayout>
      <div className="flex flex-col w-full min-h-screen p-4 md:p-8 bg-gradient-to-b from-blue-900 to-blue-950 text-white">
        <div className="flex justify-between items-center mb-4">
          <Button 
            variant="ghost" 
            className="text-white hover:text-white hover:bg-blue-800"
            onClick={() => navigate("/amoa/roleplay")}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Retour
          </Button>
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Préparation d'audition auprès d'un client</h1>
          <p className="text-blue-100 max-w-3xl mx-auto">
            Cette simulation vous permet de préparer vos consultants AMOA à des auditions auprès de clients ou partenaires commerciaux à travers une conversation sans limite de questions avec un client potentiel simulé par l'IA. L'entretien est chronométré sur 10 minutes et vous pouvez le terminer à tout moment.
          </p>
        </div>
        
        {/* L'indicateur de statut OpenAI est maintenant affiché dans le Header */}
        
        <Tabs 
          defaultValue="configuration" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full max-w-5xl mx-auto"
        >
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger 
              value="configuration"
              disabled={isSimulationActive && !simulationComplete}
            >
              Configuration
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
                                  placeholder="votre.email@example.com" 
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
                    
                    <div className="bg-blue-700 p-4 rounded-md mb-6">
                      <h3 className="text-lg font-semibold mb-4">Contexte d'audition</h3>
                      <div className="grid grid-cols-1 gap-4">
                        <FormField
                          control={form.control}
                          name="auditContextType"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel className="text-blue-100">Type de contexte</FormLabel>
                              <div className="flex flex-col space-y-2">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                  <input
                                    type="radio"
                                    value="predefined"
                                    checked={field.value === 'predefined'}
                                    onChange={() => field.onChange('predefined')}
                                    className="w-4 h-4 text-blue-600"
                                  />
                                  <span className="text-blue-100">Utiliser un contexte prédéfini</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                  <input
                                    type="radio"
                                    value="custom"
                                    checked={field.value === 'custom'}
                                    onChange={() => field.onChange('custom')}
                                    className="w-4 h-4 text-blue-600"
                                  />
                                  <span className="text-blue-100">Définir un contexte personnalisé</span>
                                </label>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {form.watch('auditContextType') === 'predefined' && (
                          <>
                            <FormField
                              control={form.control}
                              name="selectedAuditContext"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-blue-100">Sélectionner un contexte</FormLabel>
                                  <Select 
                                    onValueChange={(value) => {
                                      field.onChange(value);
                                      // Le contexte d'audit prédéfini a été sélectionné
                                      const selectedContext = PREDEFINED_AUDIT_CONTEXTS.find(ctx => ctx.id === value);
                                    }}
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="bg-blue-900 border-blue-600 text-white">
                                        <SelectValue placeholder="Sélectionnez un contexte d'audition" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-blue-800 border-blue-700 text-white">
                                      {PREDEFINED_AUDIT_CONTEXTS.map((context) => (
                                        <SelectItem key={context.id} value={context.id}>
                                          {context.title}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {form.watch('selectedAuditContext') && (
                              <div className="bg-blue-800 p-3 rounded-md border border-blue-700">
                                {(() => {
                                  const contextId = form.watch('selectedAuditContext');
                                  const selectedContext = PREDEFINED_AUDIT_CONTEXTS.find(ctx => ctx.id === contextId);
                                  
                                  if (!selectedContext) return null;
                                  
                                  return (
                                    <div className="space-y-2 text-sm">
                                      <p className="font-semibold text-white">{selectedContext.title}</p>
                                      <p className="text-blue-100">{selectedContext.description}</p>
                                      <p><span className="text-blue-300">Organisation:</span> {selectedContext.organization}</p>
                                      <p><span className="text-blue-300">Contexte du projet:</span> {selectedContext.projectContext}</p>
                                      
                                      <div>
                                        <p className="text-blue-300">Responsabilités attendues:</p>
                                        <ul className="list-disc list-inside text-blue-100 ml-2">
                                          {selectedContext.expectations.map((item, i) => (
                                            <li key={i}>{item}</li>
                                          ))}
                                        </ul>
                                      </div>
                                      
                                      <div>
                                        <p className="text-blue-300">Prérequis du poste:</p>
                                        <ul className="list-disc list-inside text-blue-100 ml-2">
                                          {selectedContext.requirements.map((item, i) => (
                                            <li key={i}>{item}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    </div>
                                  );
                                })()}
                              </div>
                            )}
                          </>
                        )}

                        {form.watch('auditContextType') === 'custom' && (
                          <FormField
                            control={form.control}
                            name="customAuditContext"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-blue-100">Décrivez le contexte d'audition</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Décrivez le contexte d'audition, l'entreprise, le poste, les responsabilités et les prérequis..."
                                    className="min-h-[120px] bg-blue-900 border-blue-600 text-white"
                                    {...field}
                                  />
                                </FormControl>
                                <p className="text-blue-300 text-xs mt-1">
                                  Soyez précis pour que la simulation soit pertinente. Plus vous donnez de détails, plus les questions seront adaptées au contexte.
                                </p>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
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
                        
                        {/* Champ sectorFocus supprimé car déjà inclus dans le contexte d'audition */}
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
                    <CardTitle>Simulation d'audition AMOA</CardTitle>
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
                
                <div className="flex gap-3">
                  <Button
                    onClick={completeSimulation}
                    variant="outline"
                    className="border-amber-600 text-amber-400 hover:bg-amber-950"
                    disabled={simulationComplete || isLoading}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Terminer l'entretien 
                  </Button>
                  
                  <Button
                    onClick={sendMessage}
                    className="bg-green-600 hover:bg-green-700"
                    disabled={!userInput.trim() || isLoading || simulationComplete}
                  >
                    <Send className="w-5 h-5" />
                    Envoyer
                  </Button>
                </div>
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
                      <h3 className="text-lg font-semibold mb-2">Adéquation avec le contexte d'audition</h3>
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
                        placeholder="votre.email@example.com" 
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

export default AmoaInterviewSimulation;