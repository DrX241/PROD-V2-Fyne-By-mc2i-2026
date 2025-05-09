import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { 
  AlertCircle, CheckCircle, ChevronLeft, ChevronRight, 
  Target, Sparkles, Shield, FileCheck, Book,
  CheckCheck, Lock, Globe, Building, FileText,
  User, CreditCard, Lightbulb, Server, CheckSquare, 
  LucideIcon, ListChecks, Scale
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Types pour le module
interface Standard {
  id: string;
  name: string;
  fullName: string;
  description: string;
  category: 'gouvernance' | 'technique' | 'sectoriel' | 'protection-donnees';
  icon: React.ReactNode;
  country?: string;
  certifiable?: boolean;
  organization: string;
  domains: string[];
  keyRequirements: string[];
}

interface Regulation {
  id: string;
  name: string;
  fullName: string;
  description: string;
  region: string;
  icon: React.ReactNode;
  enforcedDate: string;
  scope: string;
  penalties: string;
  keyRequirements: string[];
}

interface ComplianceResource {
  name: string;
  type: 'book' | 'website' | 'tool' | 'training';
  description: string;
  url?: string;
  icon: React.ReactNode;
}

// Composant principal
export default function NormesStandards() {
  const { toast } = useToast();
  const [currentSection, setCurrentSection] = useState<string>("introduction");
  const [selectedStandard, setSelectedStandard] = useState<string | null>(null);
  const [selectedRegulation, setSelectedRegulation] = useState<string | null>(null);
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [filterRegion, setFilterRegion] = useState<string | null>(null);
  const [userScore, setUserScore] = useState<number>(0);
  const [userRank, setUserRank] = useState<string>("Apprenti en conformité");
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [quizAnswers, setQuizAnswers] = useState<{[id: string]: number | null}>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  // Sections du module
  const moduleSections = [
    { id: "introduction", title: "Introduction", icon: <FileText className="h-4 w-4" /> },
    { id: "standards", title: "Standards", icon: <CheckCheck className="h-4 w-4" /> },
    { id: "regulations", title: "Réglementations", icon: <Scale className="h-4 w-4" /> },
    { id: "implementation", title: "Mise en œuvre", icon: <CheckSquare className="h-4 w-4" /> },
    { id: "certification", title: "Quiz et ressources", icon: <FileCheck className="h-4 w-4" /> },
  ];

  // Standards de sécurité
  const standards: Standard[] = [
    {
      id: "iso27001",
      name: "ISO/IEC 27001",
      fullName: "ISO/IEC 27001:2022",
      description: "Standard international pour les systèmes de management de la sécurité de l'information (SMSI).",
      category: 'gouvernance',
      icon: <Shield className="h-6 w-6 text-blue-400" />,
      certifiable: true,
      organization: "Organisation internationale de normalisation (ISO)",
      domains: ["Politique de sécurité", "Organisation de la sécurité", "Gestion des actifs", "Sécurité des RH", "Sécurité physique", "Gestion des opérations", "Contrôle d'accès"],
      keyRequirements: [
        "Établir un système de management de la sécurité de l'information (SMSI)",
        "Réaliser une analyse de risques et établir un plan de traitement",
        "Implémenter des contrôles de sécurité appropriés",
        "Surveiller et améliorer continuellement le SMSI",
        "Obtenir la certification par un organisme accrédité (optionnel)"
      ]
    },
    {
      id: "iso27002",
      name: "ISO/IEC 27002",
      fullName: "ISO/IEC 27002:2022",
      description: "Recueil de bonnes pratiques pour gérer la sécurité de l'information, complémentaire à l'ISO 27001.",
      category: 'technique',
      icon: <ListChecks className="h-6 w-6 text-green-400" />,
      certifiable: false,
      organization: "Organisation internationale de normalisation (ISO)",
      domains: ["Politiques de sécurité", "Organisation", "Ressources humaines", "Gestion des actifs", "Contrôle d'accès", "Cryptographie", "Sécurité physique"],
      keyRequirements: [
        "93 contrôles répartis en 11 sections",
        "Guide d'implémentation pour chaque contrôle",
        "Conseils pratiques pour sécuriser les systèmes d'information",
        "Réorganisation majeure dans la version 2022",
        "Approche basée sur les attributs de sécurité"
      ]
    },
    {
      id: "nist-csf",
      name: "NIST CSF",
      fullName: "NIST Cybersecurity Framework",
      description: "Cadre volontaire de bonnes pratiques de cybersécurité basé sur les normes et les pratiques existantes.",
      category: 'gouvernance',
      icon: <Building className="h-6 w-6 text-amber-400" />,
      certifiable: false,
      country: "États-Unis",
      organization: "National Institute of Standards and Technology",
      domains: ["Identifier", "Protéger", "Détecter", "Répondre", "Récupérer"],
      keyRequirements: [
        "Identifier les actifs critiques et les risques",
        "Mettre en place des contrôles de protection",
        "Déployer des outils de détection d'incidents",
        "Établir un plan de réponse aux incidents",
        "Planifier la reprise d'activité"
      ]
    },
    {
      id: "pci-dss",
      name: "PCI DSS",
      fullName: "Payment Card Industry Data Security Standard v4.0",
      description: "Norme de sécurité des données pour les organisations qui manipulent les cartes de paiement.",
      category: 'sectoriel',
      icon: <CreditCard className="h-6 w-6 text-red-400" />,
      certifiable: true,
      organization: "PCI Security Standards Council",
      domains: ["Sécurité réseau", "Protection des données", "Gestion des vulnérabilités", "Contrôle d'accès", "Tests de sécurité", "Politique de sécurité"],
      keyRequirements: [
        "Installer et maintenir une configuration de pare-feu",
        "Protéger les données des titulaires de cartes",
        "Maintenir un programme de gestion des vulnérabilités",
        "Mettre en œuvre des mesures de contrôle d'accès",
        "Surveiller et tester régulièrement les réseaux",
        "Maintenir une politique de sécurité de l'information"
      ]
    },
    {
      id: "soc2",
      name: "SOC 2",
      fullName: "Service Organization Control 2",
      description: "Cadre d'audit qui spécifie comment les organisations doivent gérer les données client.",
      category: 'gouvernance',
      icon: <Server className="h-6 w-6 text-indigo-400" />,
      certifiable: true,
      country: "États-Unis",
      organization: "American Institute of CPAs (AICPA)",
      domains: ["Sécurité", "Disponibilité", "Intégrité du traitement", "Confidentialité", "Protection de la vie privée"],
      keyRequirements: [
        "Contrôles de sécurité : protection contre les accès non autorisés",
        "Disponibilité du système pour l'exploitation et l'utilisation",
        "Intégrité du traitement pour des transactions précises et autorisées",
        "Confidentialité des informations sensibles",
        "Protection des données personnelles selon la politique de confidentialité"
      ]
    },
    {
      id: "hds",
      name: "HDS",
      fullName: "Hébergement de Données de Santé",
      description: "Certification obligatoire pour l'hébergement de données de santé à caractère personnel en France.",
      category: 'sectoriel',
      icon: <User className="h-6 w-6 text-teal-400" />,
      certifiable: true,
      country: "France",
      organization: "Agence Nationale de la Sécurité des Systèmes d'Information (ANSSI)",
      domains: ["Gouvernance et gestion des risques", "Organisation et gestion des RH", "Sécurité physique", "Sécurité des systèmes", "Éléments contractuels"],
      keyRequirements: [
        "Politique de sécurité documentée",
        "Analyse des risques formalisée",
        "Procédures d'exploitation documentées",
        "Gestion des incidents de sécurité",
        "Contrôles d'accès physiques et logiques",
        "Plan de continuité d'activité"
      ]
    },
    {
      id: "ebios",
      name: "EBIOS Risk Manager",
      fullName: "Expression des Besoins et Identification des Objectifs de Sécurité",
      description: "Méthode d'analyse de risques liés à la sécurité des systèmes d'information.",
      category: 'technique',
      icon: <Target className="h-6 w-6 text-purple-400" />,
      certifiable: false,
      country: "France",
      organization: "Agence Nationale de la Sécurité des Systèmes d'Information (ANSSI)",
      domains: ["Analyse du socle de sécurité", "Sources de risques", "Scénarios stratégiques", "Scénarios opérationnels", "Traitement du risque"],
      keyRequirements: [
        "Atelier 1 : Cadrage et socle de sécurité",
        "Atelier 2 : Sources de risques",
        "Atelier 3 : Scénarios stratégiques",
        "Atelier 4 : Scénarios opérationnels",
        "Atelier 5 : Traitement du risque"
      ]
    },
    {
      id: "tisax",
      name: "TISAX",
      fullName: "Trusted Information Security Assessment Exchange",
      description: "Standard d'évaluation de la sécurité de l'information dans l'industrie automobile.",
      category: 'sectoriel',
      icon: <Shield className="h-6 w-6 text-blue-400" />,
      certifiable: true,
      organization: "German Association of the Automotive Industry (VDA)",
      domains: ["Sécurité de l'information", "Protection des prototypes", "Protection des données"],
      keyRequirements: [
        "Information Security Management System (ISMS)",
        "Sécurité des connexions avec les tiers",
        "Protection de l'information dans les projets",
        "Protection des données personnelles",
        "Protection des prototypes physiques et virtuels"
      ]
    }
  ];

  // Réglementations
  const regulations: Regulation[] = [
    {
      id: "rgpd",
      name: "RGPD",
      fullName: "Règlement Général sur la Protection des Données",
      description: "Règlement européen qui harmonise les lois sur la protection des données dans toute l'UE.",
      region: "Europe",
      icon: <User className="h-6 w-6 text-blue-400" />,
      enforcedDate: "25 mai 2018",
      scope: "Toute organisation traitant des données à caractère personnel de résidents européens",
      penalties: "Jusqu'à 20 millions d'euros ou 4% du chiffre d'affaires annuel mondial",
      keyRequirements: [
        "Consentement explicite pour la collecte de données",
        "Droit à l'accès, à la rectification et à l'oubli",
        "Notification des violations de données dans les 72 heures",
        "Privacy by Design et Privacy by Default",
        "Désignation d'un Délégué à la Protection des Données (DPO) dans certains cas"
      ]
    },
    {
      id: "nis2",
      name: "NIS 2",
      fullName: "Network and Information Security Directive 2",
      description: "Directive européenne visant à renforcer la cybersécurité dans l'UE pour les secteurs essentiels.",
      region: "Europe",
      icon: <Globe className="h-6 w-6 text-green-400" />,
      enforcedDate: "17 janvier 2023 (transposition par les États membres jusqu'au 17 octobre 2024)",
      scope: "Entités essentielles et importantes dans des secteurs critiques",
      penalties: "Jusqu'à 10 millions d'euros ou 2% du chiffre d'affaires annuel mondial",
      keyRequirements: [
        "Mesures de gestion des risques de cybersécurité",
        "Notification des incidents significatifs",
        "Gouvernance de la cybersécurité au niveau de la direction",
        "Évaluations régulières des risques",
        "Formation et sensibilisation du personnel"
      ]
    },
    {
      id: "ccpa",
      name: "CCPA",
      fullName: "California Consumer Privacy Act",
      description: "Loi californienne donnant aux consommateurs plus de contrôle sur les données personnelles collectées par les entreprises.",
      region: "États-Unis (Californie)",
      icon: <User className="h-6 w-6 text-red-400" />,
      enforcedDate: "1er janvier 2020",
      scope: "Entreprises faisant affaire en Californie et répondant à certains critères",
      penalties: "2 500 $ par violation, 7 500 $ par violation intentionnelle",
      keyRequirements: [
        "Droit de savoir quelles informations sont collectées",
        "Droit de supprimer ces informations",
        "Droit de refuser la vente de données personnelles",
        "Droit à la non-discrimination pour l'exercice de ces droits",
        "Mise en place d'un mécanisme pour exercer ces droits"
      ]
    },
    {
      id: "hipaa",
      name: "HIPAA",
      fullName: "Health Insurance Portability and Accountability Act",
      description: "Loi américaine établissant des normes pour la protection des données de santé sensibles.",
      region: "États-Unis",
      icon: <User className="h-6 w-6 text-teal-400" />,
      enforcedDate: "Depuis 1996, avec différentes règles mises en œuvre progressivement",
      scope: "Entités couvertes (prestataires de soins de santé, plans de santé) et leurs partenaires commerciaux",
      penalties: "De 100 $ à 50 000 $ par violation, avec un maximum annuel de 1,5 million $",
      keyRequirements: [
        "Règle de confidentialité pour la protection des informations de santé",
        "Règle de sécurité pour les protections administratives, physiques et techniques",
        "Règle de notification des violations",
        "Accords avec les partenaires commerciaux",
        "Droits des patients sur leurs informations de santé"
      ]
    },
    {
      id: "lpm",
      name: "LPM",
      fullName: "Loi de Programmation Militaire",
      description: "Loi française imposant des mesures de cybersécurité aux opérateurs d'importance vitale (OIV).",
      region: "France",
      icon: <Shield className="h-6 w-6 text-indigo-400" />,
      enforcedDate: "1er juillet 2016",
      scope: "Opérateurs d'Importance Vitale (OIV) dans des secteurs stratégiques",
      penalties: "Jusqu'à 150 000 € d'amende",
      keyRequirements: [
        "Déclaration des incidents de sécurité à l'ANSSI",
        "Mise en place de systèmes de détection d'événements",
        "Audits de sécurité obligatoires",
        "Application des correctifs de sécurité critiques",
        "Respect des règles de sécurité définies par l'ANSSI"
      ]
    },
    {
      id: "dora",
      name: "DORA",
      fullName: "Digital Operational Resilience Act",
      description: "Règlement européen visant à renforcer la résilience opérationnelle numérique du secteur financier.",
      region: "Europe",
      icon: <Building className="h-6 w-6 text-amber-400" />,
      enforcedDate: "17 janvier 2025 (entrée en application)",
      scope: "Entités financières opérant dans l'UE et leurs fournisseurs tiers de services TIC",
      penalties: "Jusqu'à 2% du chiffre d'affaires annuel mondial",
      keyRequirements: [
        "Cadre de gouvernance des risques liés aux TIC",
        "Tests de résilience opérationnelle numérique",
        "Gestion, classification et signalement des incidents liés aux TIC",
        "Tests avancés (pentests, RED teaming) pour les entités significatives",
        "Supervision des fournisseurs tiers critiques de services TIC"
      ]
    }
  ];

  // Ressources pour la mise en conformité
  const complianceResources: ComplianceResource[] = [
    {
      name: "NIST Special Publication 800-53",
      type: "book",
      description: "Guide complet sur les contrôles de sécurité et de confidentialité pour les systèmes d'information",
      url: "https://csrc.nist.gov/publications/detail/sp/800-53/rev-5/final",
      icon: <Book className="h-5 w-5 text-blue-400" />
    },
    {
      name: "CIS Controls",
      type: "website",
      description: "Ensemble de 18 contrôles de sécurité prioritaires pour une défense efficace contre les cyberattaques",
      url: "https://www.cisecurity.org/controls/",
      icon: <Globe className="h-5 w-5 text-green-400" />
    },
    {
      name: "Compliance Forge",
      type: "tool",
      description: "Bibliothèque de modèles de documentation pour la cybersécurité et la conformité",
      url: "https://www.complianceforge.com/",
      icon: <FileText className="h-5 w-5 text-amber-400" />
    },
    {
      name: "eramba",
      type: "tool",
      description: "Logiciel open source de gouvernance, risque et conformité (GRC)",
      url: "https://www.eramba.org/",
      icon: <CheckSquare className="h-5 w-5 text-purple-400" />
    },
    {
      name: "SANS Institute - Formation SEC566",
      type: "training",
      description: "Implémentation et audit des contrôles essentiels de cybersécurité",
      url: "https://www.sans.org/cyber-security-courses/implementing-auditing-critical-security-controls/",
      icon: <FileCheck className="h-5 w-5 text-red-400" />
    }
  ];

  // Questions du quiz
  const quizQuestions = [
    {
      id: "q1",
      question: "Quelle norme fournit un cadre complet pour le système de management de la sécurité de l'information ?",
      options: [
        "PCI DSS",
        "ISO/IEC 27001",
        "NIST CSF",
        "HIPAA"
      ],
      correctAnswer: 1
    },
    {
      id: "q2",
      question: "Quelles sont les 5 fonctions principales du cadre de cybersécurité du NIST ?",
      options: [
        "Planifier, Faire, Vérifier, Agir, Améliorer",
        "Identifier, Protéger, Détecter, Répondre, Récupérer",
        "Gouverner, Concevoir, Implémenter, Opérer, Surveiller",
        "Évaluer, Autoriser, Implémenter, Surveiller, Optimiser"
      ],
      correctAnswer: 1
    },
    {
      id: "q3",
      question: "Quelle réglementation européenne impose des exigences strictes concernant la protection des données personnelles ?",
      options: [
        "HIPAA",
        "SOX",
        "RGPD",
        "CCPA"
      ],
      correctAnswer: 2
    },
    {
      id: "q4",
      question: "Que signifie l'acronyme PCI DSS ?",
      options: [
        "Personal Computer Information Data Security Standard",
        "Payment Card Industry Data Security Standard",
        "Private Company Information Data Security System",
        "Protected Critical Infrastructure Data Security Standard"
      ],
      correctAnswer: 1
    },
    {
      id: "q5",
      question: "Quelle approche est recommandée par le RGPD dès la conception d'un système traitant des données personnelles ?",
      options: [
        "Security by Default",
        "Privacy by Design",
        "Compliance by Construction",
        "Default Open Design"
      ],
      correctAnswer: 1
    }
  ];

  // On va simuler un petit délai de chargement
  const { data: moduleData, isLoading } = useQuery({
    queryKey: ["/api/cyber/modules/normes-standards"],
    queryFn: () => new Promise(resolve => setTimeout(() => resolve({}), 600)),
  });

  // Simule la progression
  const handleMarkCompleted = (section: string) => {
    if (!completedSections.includes(section)) {
      const updatedSections = [...completedSections, section];
      setCompletedSections(updatedSections);
      
      toast({
        title: "Section complétée !",
        description: `Vous avez terminé la section "${moduleSections.find(s => s.id === section)?.title}"`,
      });
      
      // Mise à jour du rang en fonction de la progression
      if (updatedSections.length >= 2) setUserRank("Analyste en conformité");
      if (updatedSections.length >= 4) setUserRank("Expert en conformité");
      
      setUserScore(userScore + 25);
    }
  };

  const handleAnswerSelected = (questionId: string, answerIndex: number) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const handleQuizSubmit = () => {
    const totalQuestions = quizQuestions.length;
    let correctAnswers = 0;
    
    quizQuestions.forEach(q => {
      if (quizAnswers[q.id] === q.correctAnswer) {
        correctAnswers++;
      }
    });
    
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    setUserScore(userScore + score);
    
    toast({
      title: `Quiz terminé !`,
      description: `Votre score : ${correctAnswers}/${totalQuestions} (${score}%)`,
    });
    
    setQuizSubmitted(true);
  };

  const filteredStandards = standards.filter(standard => 
    filterCategory ? standard.category === filterCategory : true
  );

  const filteredRegulations = regulations.filter(regulation => 
    filterRegion ? regulation.region === filterRegion : true
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-blue-300">Chargement du module...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 to-slate-950 text-white">
      <div className="container mx-auto p-6 pt-4">
        <Card className="border-blue-800 bg-gradient-to-br from-blue-950 to-slate-950 shadow-xl">
          <CardHeader className="border-b border-blue-800 pb-4">
            <div className="flex items-center mb-2">
              <Link href="/cyber/learning-center">
                <Button variant="ghost" className="text-white">
                  <ChevronLeft className="mr-2 h-5 w-5" />
                  Retour
                </Button>
              </Link>
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              Normes et standards de cybersécurité
            </CardTitle>
            <CardDescription className="text-blue-300">
              Naviguer dans le paysage complexe des normes, standards et réglementations en cybersécurité
            </CardDescription>
            
            {/* Progression globale */}
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-blue-300">Progression du module</span>
                <span className="text-sm font-medium text-blue-300">
                  {Math.round((completedSections.length / moduleSections.length) * 100)}%
                </span>
              </div>
              <Progress 
                value={(completedSections.length / moduleSections.length) * 100} 
                className="h-2 bg-blue-950"
              />
              
              {userScore > 0 && (
                <div className="mt-3 flex items-center gap-2">
                  <Badge 
                    variant="outline" 
                    className="bg-blue-900/30 text-blue-200 border-blue-700"
                  >
                    <Target className="h-3.5 w-3.5 mr-1 text-blue-400" />
                    {userScore} points
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className="bg-purple-900/30 text-purple-200 border-purple-700"
                  >
                    <Sparkles className="h-3.5 w-3.5 mr-1 text-purple-400" />
                    {userRank}
                  </Badge>
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            {/* Menu de navigation du module */}
            <div className="flex overflow-x-auto gap-2 mb-8 pb-2">
              {moduleSections.map((section, index) => (
                <Button
                  key={section.id}
                  size="sm"
                  variant={currentSection === section.id ? "default" : "outline"} 
                  className={`rounded-full ${currentSection === section.id ? 'bg-blue-700' : 'border-blue-700'}`}
                  onClick={() => setCurrentSection(section.id)}
                >
                  <div className="flex items-center">
                    {section.icon}
                    {index > 0 && completedSections.includes(moduleSections[index - 1].id) && 
                      <CheckCircle className="h-3 w-3 ml-1 text-green-400" />}
                  </div>
                  <span className="ml-2">{section.title}</span>
                </Button>
              ))}
            </div>
            
            {/* Section Introduction */}
            {currentSection === "introduction" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-4">📋 Introduction aux normes et standards</h2>
                
                <div className="p-5 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg border border-blue-800 shadow-inner">
                  <p className="mb-4">
                    Dans un paysage numérique de plus en plus complexe et réglementé, les organisations doivent 
                    naviguer à travers un dédale de normes, standards et réglementations en constante évolution.
                  </p>
                  <p>
                    Ce module vous guidera à travers les principaux référentiels de sécurité, leur contexte, leur application
                    et les stratégies pour assurer la conformité tout en renforçant la posture de sécurité globale de votre organisation.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  <Card className="bg-gradient-to-br from-blue-900/30 to-indigo-900/20 border-blue-800">
                    <CardHeader>
                      <CheckCheck className="h-8 w-8 text-blue-400 mb-2" />
                      <CardTitle className="text-lg">Standards internationaux</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-blue-200">
                        Découvrez les principales normes et standards de sécurité de l'information
                        reconnus internationalement et leur application.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 border-purple-800">
                    <CardHeader>
                      <Scale className="h-8 w-8 text-purple-400 mb-2" />
                      <CardTitle className="text-lg">Cadre réglementaire</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-blue-200">
                        Explorez les principales réglementations régionales et sectorielles
                        qui impactent votre stratégie de sécurité.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-amber-900/30 to-amber-800/20 border-amber-800">
                    <CardHeader>
                      <CheckSquare className="h-8 w-8 text-amber-400 mb-2" />
                      <CardTitle className="text-lg">Mise en conformité</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-blue-200">
                        Apprenez les stratégies et méthodologies pour implémenter efficacement
                        ces normes dans votre environnement.
                      </p>
                    </CardContent>
                  </Card>
                </div>
                
                <Alert className="bg-blue-900/30 border-blue-700 mt-8">
                  <AlertCircle className="h-4 w-4 text-blue-400" />
                  <AlertTitle>Pourquoi les normes et standards sont-ils importants ?</AlertTitle>
                  <AlertDescription>
                    <div className="mt-2 space-y-2">
                      <p className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-400 mt-1 shrink-0" />
                        <span>Ils fournissent un cadre éprouvé pour renforcer la sécurité</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-400 mt-1 shrink-0" />
                        <span>Ils aident à démontrer la conformité aux exigences légales et réglementaires</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-400 mt-1 shrink-0" />
                        <span>Ils renforcent la confiance des clients, partenaires et parties prenantes</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-400 mt-1 shrink-0" />
                        <span>Ils permettent d'harmoniser les pratiques au sein des équipes et de l'organisation</span>
                      </p>
                    </div>
                  </AlertDescription>
                </Alert>
                
                <div className="mt-8 text-center">
                  <Button 
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                    onClick={() => {
                      handleMarkCompleted("introduction");
                      setCurrentSection("standards");
                    }}
                  >
                    <CheckCheck className="mr-2 h-4 w-4" />
                    Explorer les standards
                  </Button>
                </div>
              </div>
            )}

            {/* Section Standards */}
            {currentSection === "standards" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-4">🏆 Standards et normes de sécurité</h2>
                
                <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-5 rounded-lg border border-blue-800">
                  <p>
                    Les standards et normes de sécurité sont des cadres de référence développés par des organisations
                    et des experts pour établir des bonnes pratiques en matière de cybersécurité.
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-4">
                  <Button 
                    size="sm" 
                    variant={filterCategory === null ? "default" : "outline"}
                    className={filterCategory === null ? "bg-blue-700" : "border-blue-700"}
                    onClick={() => setFilterCategory(null)}
                  >
                    Tous
                  </Button>
                  <Button 
                    size="sm" 
                    variant={filterCategory === "gouvernance" ? "default" : "outline"}
                    className={filterCategory === "gouvernance" ? "bg-blue-700" : "border-blue-700"}
                    onClick={() => setFilterCategory("gouvernance")}
                  >
                    Gouvernance
                  </Button>
                  <Button 
                    size="sm" 
                    variant={filterCategory === "technique" ? "default" : "outline"}
                    className={filterCategory === "technique" ? "bg-blue-700" : "border-blue-700"}
                    onClick={() => setFilterCategory("technique")}
                  >
                    Technique
                  </Button>
                  <Button 
                    size="sm" 
                    variant={filterCategory === "sectoriel" ? "default" : "outline"}
                    className={filterCategory === "sectoriel" ? "bg-blue-700" : "border-blue-700"}
                    onClick={() => setFilterCategory("sectoriel")}
                  >
                    Sectoriel
                  </Button>
                  <Button 
                    size="sm" 
                    variant={filterCategory === "protection-donnees" ? "default" : "outline"}
                    className={filterCategory === "protection-donnees" ? "bg-blue-700" : "border-blue-700"}
                    onClick={() => setFilterCategory("protection-donnees")}
                  >
                    Protection des données
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  {filteredStandards.map(standard => (
                    <Card 
                      key={standard.id}
                      className={`bg-blue-900/10 border-blue-800 hover:bg-blue-900/20 cursor-pointer transition-colors ${
                        selectedStandard === standard.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => setSelectedStandard(standard.id)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          {standard.icon}
                          {standard.certifiable && (
                            <Badge variant="outline" className="bg-green-900/30 text-green-300 border-green-700">
                              Certifiable
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="mt-2">{standard.name}</CardTitle>
                        <CardDescription className="text-blue-300">
                          {standard.organization}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-blue-200 mb-3">
                          {standard.description}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {standard.domains.slice(0, 3).map((domain, index) => (
                            <Badge key={index} variant="outline" className="bg-blue-900/20 text-blue-200 border-blue-700">
                              {domain}
                            </Badge>
                          ))}
                          {standard.domains.length > 3 && (
                            <Badge variant="outline" className="bg-blue-900/20 text-blue-200 border-blue-700">
                              +{standard.domains.length - 3}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {selectedStandard && (
                  <Card className="mt-6 bg-gradient-to-br from-blue-900/30 to-indigo-900/20 border-blue-800">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        {standards.find(s => s.id === selectedStandard)?.icon}
                        <div>
                          <CardTitle>{standards.find(s => s.id === selectedStandard)?.fullName}</CardTitle>
                          <CardDescription className="text-blue-300">
                            {standards.find(s => s.id === selectedStandard)?.organization}
                            {standards.find(s => s.id === selectedStandard)?.country && ` • ${standards.find(s => s.id === selectedStandard)?.country}`}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-4">
                        {standards.find(s => s.id === selectedStandard)?.description}
                      </p>
                      
                      <h3 className="text-lg font-bold mb-3">Domaines couverts</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                        {standards.find(s => s.id === selectedStandard)?.domains.map((domain, index) => (
                          <div 
                            key={index}
                            className="flex items-center gap-2 bg-blue-900/20 border border-blue-800 rounded-md p-2"
                          >
                            <CheckCircle className="h-4 w-4 text-blue-400" />
                            <span className="text-sm">{domain}</span>
                          </div>
                        ))}
                      </div>
                      
                      <h3 className="text-lg font-bold mb-3">Exigences clés</h3>
                      <div className="space-y-2">
                        {standards.find(s => s.id === selectedStandard)?.keyRequirements.map((requirement, index) => (
                          <div 
                            key={index}
                            className="flex items-start gap-2 bg-blue-900/20 border border-blue-800 rounded-md p-2"
                          >
                            <CheckCircle className="h-4 w-4 mt-1 text-green-400" />
                            <span className="text-sm">{requirement}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                <div className="flex justify-between mt-8">
                  <Button 
                    variant="outline" 
                    className="border-blue-700 text-blue-300"
                    onClick={() => setCurrentSection("introduction")}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Introduction
                  </Button>
                  
                  <Button 
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    onClick={() => {
                      handleMarkCompleted("standards");
                      setCurrentSection("regulations");
                    }}
                  >
                    Réglementations
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            
            {/* Section Réglementations */}
            {currentSection === "regulations" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-4">⚖️ Réglementations en cybersécurité</h2>
                
                <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-5 rounded-lg border border-blue-800">
                  <p>
                    Contrairement aux normes et standards qui sont généralement d'application volontaire,
                    les réglementations sont des obligations légales imposées par les autorités gouvernementales
                    ou sectorielles avec des sanctions potentielles en cas de non-conformité.
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-4">
                  <Button 
                    size="sm" 
                    variant={filterRegion === null ? "default" : "outline"}
                    className={filterRegion === null ? "bg-blue-700" : "border-blue-700"}
                    onClick={() => setFilterRegion(null)}
                  >
                    Toutes régions
                  </Button>
                  <Button 
                    size="sm" 
                    variant={filterRegion === "Europe" ? "default" : "outline"}
                    className={filterRegion === "Europe" ? "bg-blue-700" : "border-blue-700"}
                    onClick={() => setFilterRegion("Europe")}
                  >
                    Europe
                  </Button>
                  <Button 
                    size="sm" 
                    variant={filterRegion === "États-Unis" ? "default" : "outline"}
                    className={filterRegion === "États-Unis" ? "bg-blue-700" : "border-blue-700"}
                    onClick={() => setFilterRegion("États-Unis")}
                  >
                    États-Unis
                  </Button>
                  <Button 
                    size="sm" 
                    variant={filterRegion === "France" ? "default" : "outline"}
                    className={filterRegion === "France" ? "bg-blue-700" : "border-blue-700"}
                    onClick={() => setFilterRegion("France")}
                  >
                    France
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {filteredRegulations.map(regulation => (
                    <Card 
                      key={regulation.id}
                      className={`bg-blue-900/10 border-blue-800 hover:bg-blue-900/20 cursor-pointer transition-colors ${
                        selectedRegulation === regulation.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => setSelectedRegulation(regulation.id)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          {regulation.icon}
                          <Badge 
                            variant="outline" 
                            className="bg-amber-900/30 text-amber-300 border-amber-700"
                          >
                            {regulation.region}
                          </Badge>
                        </div>
                        <CardTitle className="mt-2">{regulation.name}</CardTitle>
                        <CardDescription className="text-blue-300">
                          {regulation.fullName}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-blue-200 mb-3">
                          {regulation.description}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-blue-300">
                          <FileCheck className="h-3.5 w-3.5 text-blue-400" />
                          <span>En vigueur depuis : {regulation.enforcedDate}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {selectedRegulation && (
                  <Card className="mt-6 bg-gradient-to-br from-blue-900/30 to-indigo-900/20 border-blue-800">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        {regulations.find(r => r.id === selectedRegulation)?.icon}
                        <div>
                          <CardTitle>{regulations.find(r => r.id === selectedRegulation)?.fullName}</CardTitle>
                          <CardDescription className="text-blue-300">
                            {regulations.find(r => r.id === selectedRegulation)?.region}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-4">
                        {regulations.find(r => r.id === selectedRegulation)?.description}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-blue-900/20 border border-blue-800 rounded-md p-3">
                          <h4 className="font-medium mb-1 flex items-center gap-2">
                            <Building className="h-4 w-4 text-blue-400" />
                            Champ d'application
                          </h4>
                          <p className="text-sm text-blue-200">
                            {regulations.find(r => r.id === selectedRegulation)?.scope}
                          </p>
                        </div>
                        
                        <div className="bg-blue-900/20 border border-blue-800 rounded-md p-3">
                          <h4 className="font-medium mb-1 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-red-400" />
                            Sanctions potentielles
                          </h4>
                          <p className="text-sm text-blue-200">
                            {regulations.find(r => r.id === selectedRegulation)?.penalties}
                          </p>
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-bold mb-3">Exigences principales</h3>
                      <div className="space-y-2">
                        {regulations.find(r => r.id === selectedRegulation)?.keyRequirements.map((requirement, index) => (
                          <div 
                            key={index}
                            className="flex items-start gap-2 bg-blue-900/20 border border-blue-800 rounded-md p-2"
                          >
                            <CheckCircle className="h-4 w-4 mt-1 text-green-400" />
                            <span className="text-sm">{requirement}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                <div className="flex justify-between mt-8">
                  <Button 
                    variant="outline" 
                    className="border-blue-700 text-blue-300"
                    onClick={() => setCurrentSection("standards")}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Standards
                  </Button>
                  
                  <Button 
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    onClick={() => {
                      handleMarkCompleted("regulations");
                      setCurrentSection("implementation");
                    }}
                  >
                    Mise en œuvre
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            
            {/* Section Mise en œuvre */}
            {currentSection === "implementation" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-4">🔧 Mise en œuvre des normes et réglementations</h2>
                
                <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-5 rounded-lg border border-blue-800">
                  <p>
                    La mise en conformité avec les normes et réglementations nécessite une approche méthodique
                    et une compréhension approfondie des exigences ainsi que de leur application pratique à votre
                    environnement spécifique.
                  </p>
                </div>
                
                <h3 className="text-xl font-bold mt-6 mb-4">Méthodologie de mise en œuvre</h3>
                
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="step1" className="border-blue-800">
                    <AccordionTrigger className="hover:text-blue-300">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-900 text-blue-200">1</div>
                        <span>Analyse de l'existant et gap analysis</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-blue-200">
                      <div className="space-y-2 mt-2">
                        <p>La première étape consiste à évaluer votre environnement actuel par rapport aux exigences des normes ou réglementations visées :</p>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                          <li>Identifiez les contrôles déjà en place</li>
                          <li>Documentez les écarts (gaps) entre l'existant et les exigences</li>
                          <li>Évaluez la maturité des processus de sécurité existants</li>
                          <li>Déterminez le périmètre d'application</li>
                        </ul>
                        <div className="bg-blue-900/20 p-3 rounded-md mt-2">
                          <p className="text-sm font-medium flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-amber-400" />
                            Conseil pratique
                          </p>
                          <p className="text-sm">
                            Utilisez des matrices de conformité (compliance matrices) pour cartographier 
                            méthodiquement les exigences par rapport à vos contrôles existants.
                          </p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="step2" className="border-blue-800">
                    <AccordionTrigger className="hover:text-blue-300">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-900 text-blue-200">2</div>
                        <span>Élaboration d'un plan d'action</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-blue-200">
                      <div className="space-y-2 mt-2">
                        <p>Sur la base de l'analyse des écarts, développez un plan d'action détaillé :</p>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                          <li>Priorisez les actions en fonction des risques et des exigences</li>
                          <li>Définissez des jalons clairs et des indicateurs de performance</li>
                          <li>Identifiez les ressources nécessaires (humaines, techniques, financières)</li>
                          <li>Établissez un calendrier réaliste</li>
                        </ul>
                        <div className="bg-blue-900/20 p-3 rounded-md mt-2">
                          <p className="text-sm font-medium flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-amber-400" />
                            Conseil pratique
                          </p>
                          <p className="text-sm">
                            Adoptez une approche par phases pour les normes complexes comme l'ISO 27001. 
                            Commencez par les contrôles fondamentaux avant de passer aux aspects plus avancés.
                          </p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="step3" className="border-blue-800">
                    <AccordionTrigger className="hover:text-blue-300">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-900 text-blue-200">3</div>
                        <span>Implémentation des contrôles</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-blue-200">
                      <div className="space-y-2 mt-2">
                        <p>Mettez en œuvre les contrôles et mesures identifiés dans votre plan d'action :</p>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                          <li>Développez ou mettez à jour les politiques et procédures</li>
                          <li>Implémentez les mesures techniques requises</li>
                          <li>Formez le personnel aux nouvelles procédures</li>
                          <li>Documentez toutes les actions entreprises</li>
                        </ul>
                        <div className="bg-blue-900/20 p-3 rounded-md mt-2">
                          <p className="text-sm font-medium flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-amber-400" />
                            Conseil pratique
                          </p>
                          <p className="text-sm">
                            Intégrez les exigences de conformité dans les processus existants plutôt que de créer 
                            des processus parallèles, pour une meilleure adoption et durabilité.
                          </p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="step4" className="border-blue-800">
                    <AccordionTrigger className="hover:text-blue-300">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-900 text-blue-200">4</div>
                        <span>Évaluation et audits</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-blue-200">
                      <div className="space-y-2 mt-2">
                        <p>Vérifiez l'efficacité et la conformité des contrôles mis en place :</p>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                          <li>Réalisez des audits internes réguliers</li>
                          <li>Effectuez des tests d'efficacité des contrôles</li>
                          <li>Identifiez les non-conformités et les points d'amélioration</li>
                          <li>Documentez les résultats des évaluations</li>
                        </ul>
                        <div className="bg-blue-900/20 p-3 rounded-md mt-2">
                          <p className="text-sm font-medium flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-amber-400" />
                            Conseil pratique
                          </p>
                          <p className="text-sm">
                            Réalisez un audit à blanc (pré-audit) avant un audit de certification officiel 
                            pour identifier et corriger les problèmes potentiels.
                          </p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="step5" className="border-blue-800">
                    <AccordionTrigger className="hover:text-blue-300">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-900 text-blue-200">5</div>
                        <span>Amélioration continue</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-blue-200">
                      <div className="space-y-2 mt-2">
                        <p>Maintenez et améliorez continuellement votre système de gestion de la conformité :</p>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                          <li>Mettez en œuvre des actions correctives pour les non-conformités</li>
                          <li>Surveillez les changements dans les normes et réglementations</li>
                          <li>Adaptez vos contrôles en fonction des menaces émergentes</li>
                          <li>Révisez régulièrement vos politiques et procédures</li>
                        </ul>
                        <div className="bg-blue-900/20 p-3 rounded-md mt-2">
                          <p className="text-sm font-medium flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-amber-400" />
                            Conseil pratique
                          </p>
                          <p className="text-sm">
                            Utilisez le cycle PDCA (Plan-Do-Check-Act) pour structurer votre approche 
                            d'amélioration continue et maintenir la conformité dans le temps.
                          </p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                
                <h3 className="text-xl font-bold mt-8 mb-4">Défis courants et stratégies</h3>
                
                <Table className="border-blue-800">
                  <TableHeader>
                    <TableRow className="border-blue-800 hover:bg-transparent">
                      <TableHead className="text-blue-200">Défi</TableHead>
                      <TableHead className="text-blue-200">Stratégie</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="border-blue-800 hover:bg-blue-900/10">
                      <TableCell className="font-medium">Ressources limitées</TableCell>
                      <TableCell>
                        <ul className="list-disc list-inside text-sm">
                          <li>Prioriser les exigences critiques</li>
                          <li>Adopter une approche progressive</li>
                          <li>Automatiser les tâches répétitives</li>
                        </ul>
                      </TableCell>
                    </TableRow>
                    <TableRow className="border-blue-800 hover:bg-blue-900/10">
                      <TableCell className="font-medium">Complexité des exigences</TableCell>
                      <TableCell>
                        <ul className="list-disc list-inside text-sm">
                          <li>Faire appel à des experts pour les domaines complexes</li>
                          <li>Utiliser des outils et frameworks existants</li>
                          <li>Cartographier les recoupements entre différentes normes</li>
                        </ul>
                      </TableCell>
                    </TableRow>
                    <TableRow className="border-blue-800 hover:bg-blue-900/10">
                      <TableCell className="font-medium">Résistance au changement</TableCell>
                      <TableCell>
                        <ul className="list-disc list-inside text-sm">
                          <li>Impliquer les parties prenantes dès le début</li>
                          <li>Communiquer clairement les bénéfices</li>
                          <li>Former et sensibiliser le personnel</li>
                        </ul>
                      </TableCell>
                    </TableRow>
                    <TableRow className="border-blue-800 hover:bg-blue-900/10">
                      <TableCell className="font-medium">Évolution rapide des normes</TableCell>
                      <TableCell>
                        <ul className="list-disc list-inside text-sm">
                          <li>Mettre en place une veille réglementaire</li>
                          <li>Adopter une architecture modulaire et flexible</li>
                          <li>Participer aux communautés de pratique</li>
                        </ul>
                      </TableCell>
                    </TableRow>
                    <TableRow className="border-blue-800 hover:bg-blue-900/10">
                      <TableCell className="font-medium">Contrôles redondants</TableCell>
                      <TableCell>
                        <ul className="list-disc list-inside text-sm">
                          <li>Créer un framework de contrôles unifié</li>
                          <li>Cartographier les contrôles communs entre normes</li>
                          <li>Adopter une approche basée sur les risques</li>
                        </ul>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                
                <h3 className="text-xl font-bold mt-8 mb-4">Ressources et outils</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {complianceResources.map((resource, index) => (
                    <Card key={index} className="bg-blue-900/10 border-blue-800">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          {resource.icon}
                          <CardTitle className="text-lg">{resource.name}</CardTitle>
                        </div>
                        <CardDescription className="text-blue-300">
                          Type: {resource.type === 'book' ? 'Publication' : 
                                resource.type === 'website' ? 'Site web' : 
                                resource.type === 'tool' ? 'Outil' : 'Formation'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-blue-200 mb-3">
                          {resource.description}
                        </p>
                        {resource.url && (
                          <Button variant="outline" size="sm" className="border-blue-700 text-blue-300 w-full">
                            <Globe className="h-3.5 w-3.5 mr-2" />
                            En savoir plus
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="flex justify-between mt-8">
                  <Button 
                    variant="outline" 
                    className="border-blue-700 text-blue-300"
                    onClick={() => setCurrentSection("regulations")}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Réglementations
                  </Button>
                  
                  <Button 
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    onClick={() => {
                      handleMarkCompleted("implementation");
                      setCurrentSection("certification");
                    }}
                  >
                    Quiz et ressources
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            
            {/* Section Quiz et ressources */}
            {currentSection === "certification" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-4">🧠 Évaluez vos connaissances</h2>
                
                <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-5 rounded-lg border border-blue-800">
                  <p>
                    Testez vos connaissances sur les normes, standards et réglementations 
                    en matière de cybersécurité avec ce quiz !
                  </p>
                </div>
                
                <div className="mt-6">
                  {quizQuestions.map((question, qIndex) => (
                    <Card key={question.id} className="mb-4 bg-blue-900/10 border-blue-800">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-start gap-2">
                          <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-900 text-blue-200 shrink-0 mt-0.5">
                            {qIndex + 1}
                          </div>
                          <span>{question.question}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {question.options.map((option, oIndex) => (
                            <div 
                              key={oIndex}
                              className={`
                                p-3 rounded-md border cursor-pointer transition-all
                                ${quizAnswers[question.id] === oIndex 
                                  ? 'bg-blue-800/30 border-blue-600' 
                                  : 'bg-blue-950/30 border-blue-800 hover:bg-blue-900/20'}
                                ${quizSubmitted && oIndex === question.correctAnswer 
                                  ? 'bg-green-900/30 border-green-600' 
                                  : quizSubmitted && quizAnswers[question.id] === oIndex && oIndex !== question.correctAnswer 
                                  ? 'bg-red-900/30 border-red-600' 
                                  : ''}
                              `}
                              onClick={() => !quizSubmitted && handleAnswerSelected(question.id, oIndex)}
                            >
                              <div className="flex items-start gap-2">
                                <div className={`
                                  flex items-center justify-center h-5 w-5 rounded-full shrink-0 mt-0.5
                                  ${quizAnswers[question.id] === oIndex 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-blue-900 text-blue-200'}
                                  ${quizSubmitted && oIndex === question.correctAnswer 
                                    ? 'bg-green-600 text-white' 
                                    : quizSubmitted && quizAnswers[question.id] === oIndex && oIndex !== question.correctAnswer 
                                    ? 'bg-red-600 text-white' 
                                    : ''}
                                `}>
                                  {String.fromCharCode(65 + oIndex)}
                                </div>
                                <span>{option}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {quizSubmitted && (
                          <div className={`
                            mt-4 p-3 rounded-md 
                            ${quizAnswers[question.id] === question.correctAnswer 
                              ? 'bg-green-900/20 border border-green-700' 
                              : 'bg-amber-900/20 border border-amber-700'}
                          `}>
                            <p className="flex items-center gap-2 font-medium">
                              {quizAnswers[question.id] === question.correctAnswer 
                                ? <CheckCircle className="h-4 w-4 text-green-400" />
                                : <Lightbulb className="h-4 w-4 text-amber-400" />}
                              {quizAnswers[question.id] === question.correctAnswer 
                                ? "Bonne réponse !" 
                                : "Explication :"}
                            </p>
                            <p className="text-sm mt-1">
                              {quizAnswers[question.id] === question.correctAnswer 
                                ? `La réponse correcte est bien "${question.options[question.correctAnswer]}".`
                                : `La réponse correcte est "${question.options[question.correctAnswer]}".`}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                  
                  {!quizSubmitted ? (
                    <div className="mt-6 text-center">
                      <Button 
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        onClick={handleQuizSubmit}
                        disabled={Object.keys(quizAnswers).length < quizQuestions.length}
                      >
                        <FileCheck className="mr-2 h-4 w-4" />
                        Valider mes réponses
                      </Button>
                      {Object.keys(quizAnswers).length < quizQuestions.length && (
                        <p className="text-sm text-amber-400 mt-2">
                          Veuillez répondre à toutes les questions avant de valider.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border-l-4 border-green-500 p-4 my-8 rounded-r-lg">
                      <h3 className="font-bold mb-2 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-green-400" />
                        Félicitations !
                      </h3>
                      <p className="text-sm">
                        Vous avez terminé le module sur les normes et standards de cybersécurité.
                        Vous avez acquis une compréhension approfondie des principaux référentiels,
                        des réglementations et des méthodologies pour les mettre en œuvre efficacement.
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between mt-8">
                  <Button 
                    variant="outline" 
                    className="border-blue-700 text-blue-300"
                    onClick={() => setCurrentSection("implementation")}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Mise en œuvre
                  </Button>
                  
                  {quizSubmitted && (
                    <Button 
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      onClick={() => {
                        handleMarkCompleted("certification");
                        setShowConfetti(true);
                        toast({
                          title: "Module terminé !",
                          description: "Félicitations, vous avez complété le module sur les normes et standards de cybersécurité.",
                        });
                        setTimeout(() => setShowConfetti(false), 3000);
                      }}
                    >
                      Terminer le module
                      <CheckCircle className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}