import React, { useState } from 'react';
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import PageTitle from "@/components/utils/PageTitle";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  ArrowLeft, CheckCircle, BookOpen, Shield, AlertTriangle, Lock, 
  Share2, Database, Server, Cpu, Trophy, BrainCircuit, 
  ArrowRight, ExternalLink, GraduationCap, Award, LightbulbIcon, 
  FileCheck
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";

export default function IntroductionCybersecurite() {
  // États pour suivre la progression et les interactions
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState("principes");
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({
    q1: "",
    q2: "",
    q3: ""
  });
  const [quizScored, setQuizScored] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [caseStudyExpanded, setCaseStudyExpanded] = useState(false);
  const [badgeEarned, setBadgeEarned] = useState(false);
  const [, setLocation] = useLocation();
  
  // Cas d'étude concret
  const caseStudy = {
    title: "Cas réel : La fuite de données Equifax (2017)",
    intro: "En 2017, Equifax, l'une des plus grandes agences de crédit au monde, a été victime d'une violation de données qui a exposé les informations personnelles de 147 millions de personnes.",
    details: [
      "Les pirates ont exploité une vulnérabilité connue dans Apache Struts pour laquelle un correctif était disponible mais n'avait pas été appliqué.",
      "Les données volées comprenaient des noms, dates de naissance, numéros de sécurité sociale, adresses et plus encore.",
      "L'attaque est restée non détectée pendant plus de 2 mois.",
      "Equifax a finalement accepté de payer 575 millions de dollars en amendes et compensations."
    ],
    lessons: [
      "L'importance critique des mises à jour de sécurité",
      "La nécessité d'une surveillance continue des systèmes",
      "L'impact catastrophique des violations de données sur les entreprises et les consommateurs",
      "L'obligation légale et éthique de protéger les données personnelles (RGPD en Europe)"
    ]
  };
  
  // Questions du quiz
  const quizQuestions = [
    {
      id: "q1",
      question: "Lequel de ces éléments ne fait PAS partie des trois piliers fondamentaux de la cybersécurité ?",
      options: [
        { value: "a", label: "Confidentialité" },
        { value: "b", label: "Intégrité" },
        { value: "c", label: "Disponibilité" },
        { value: "d", label: "Complexité" }
      ],
      correctAnswer: "d",
      explanation: "Les trois piliers fondamentaux sont la Confidentialité, l'Intégrité et la Disponibilité (souvent appelés la triade CIA en anglais)."
    },
    {
      id: "q2",
      question: "Quelle technique implique l'envoi de messages frauduleux qui semblent provenir d'une source fiable ?",
      options: [
        { value: "a", label: "Ransomware" },
        { value: "b", label: "Phishing" },
        { value: "c", label: "DDoS" },
        { value: "d", label: "Zero-day" }
      ],
      correctAnswer: "b",
      explanation: "Le phishing est une technique d'ingénierie sociale où les attaquants se font passer pour des entités de confiance dans le but d'obtenir des informations sensibles."
    },
    {
      id: "q3",
      question: "En quoi la RGPD est-elle liée à la cybersécurité ?",
      options: [
        { value: "a", label: "C'est un type d'attaque informatique" },
        { value: "b", label: "C'est un protocole de chiffrement" },
        { value: "c", label: "C'est un règlement sur la protection des données personnelles" },
        { value: "d", label: "C'est un logiciel antivirus" }
      ],
      correctAnswer: "c",
      explanation: "Le Règlement Général sur la Protection des Données (RGPD) est une réglementation européenne qui impose des obligations aux organisations pour protéger les données personnelles, renforçant ainsi la nécessité d'une bonne cybersécurité."
    }
  ];
  
  // Fonction pour soumettre le quiz
  const submitQuiz = () => {
    // Vérifier que toutes les questions ont été répondues
    if (!quizAnswers.q1 || !quizAnswers.q2 || !quizAnswers.q3) {
      toast({
        title: "Quiz incomplet",
        description: "Veuillez répondre à toutes les questions avant de soumettre le quiz.",
        variant: "destructive"
      });
      return;
    }
    
    // Calculer le score
    let score = 0;
    if (quizAnswers.q1 === "d") score++;
    if (quizAnswers.q2 === "b") score++;
    if (quizAnswers.q3 === "c") score++;
    
    setQuizScore(score);
    setQuizScored(true);
    setShowQuizResult(true);
    
    // Mettre à jour la progression
    const newProgress = Math.min(progress + 25, 100);
    setProgress(newProgress);
    
    // Attribuer un badge si le score est bon
    if (score >= 2) {
      setBadgeEarned(true);
      toast({
        title: "Badge débloqué !",
        description: "Vous avez obtenu le badge 'Fondamentaux de la Cybersécurité'",
        variant: "default",
      });
    }
  };
  
  // Effet pour simuler une progression initiale
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(15);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1429] to-[#0a1f3d]">
      <PageTitle title="Introduction à la Cybersécurité | Centre de formation" />
      
      {/* En-tête avec navigation et titre */}
      <div className="border-b border-blue-800/60 bg-blue-900/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/cyber/learning-center">
            <Button variant="ghost" className="text-blue-300 hover:bg-blue-900/30 hover:text-blue-200">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </Link>
          <h1 className="text-xl text-white font-medium">Introduction à la Cybersécurité</h1>
          
          <div className="ml-auto flex items-center">
            <div className="w-48 mr-4">
              <Progress value={progress} className="h-2" />
            </div>
            <span className="text-sm text-blue-300">{progress}% complété</span>
          </div>
        </div>
      </div>
      
      {/* Navigation entre les différentes parties du module */}
      <div className="bg-blue-900/20 border-b border-blue-800/40">
        <div className="container mx-auto px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-transparent h-14 justify-start border-b border-blue-800/40">
              <TabsTrigger 
                value="principes" 
                className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none h-14"
              >
                Principes Fondamentaux
              </TabsTrigger>
              <TabsTrigger 
                value="menaces" 
                className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none h-14"
              >
                Menaces Actuelles
              </TabsTrigger>
              <TabsTrigger 
                value="casreel" 
                className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none h-14"
              >
                Cas Concret
              </TabsTrigger>
              <TabsTrigger 
                value="quiz" 
                className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none h-14"
              >
                Quiz & Évaluation
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      {/* Contenu principal du module */}
      <div className="container mx-auto px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-4 gap-8"
        >
          {/* Section principale de contenu */}
          <div className="lg:col-span-3 space-y-8">
            <TabsContent value="principes" className="m-0">
              <Card className="bg-blue-950/50 border-blue-800/30 shadow-xl">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                    <Shield className="mr-3 h-6 w-6 text-blue-400" />
                    Principes fondamentaux de la cybersécurité
                  </h2>
                  
                  <div className="prose prose-invert max-w-none">
                    <p className="text-blue-200">
                      La cybersécurité est l'ensemble des mesures, technologies et pratiques visant à protéger les systèmes informatiques, 
                      les réseaux, et les données contre les accès non autorisés, les attaques et les dommages. Dans notre monde numérique 
                      connecté, elle est devenue indispensable pour les entreprises, les gouvernements et les individus.
                    </p>
                    
                    <h3 className="text-xl font-semibold text-white mt-6 mb-3">Les trois piliers de la cybersécurité</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-blue-900/40 p-4 rounded-lg border border-blue-700/50 hover:bg-blue-800/40 transition-colors">
                        <div className="flex items-center mb-2">
                          <Lock className="h-5 w-5 text-blue-300 mr-2" />
                          <h4 className="font-medium text-white">Confidentialité</h4>
                        </div>
                        <p className="text-sm text-blue-200">Garantir que les informations ne sont accessibles qu'aux personnes autorisées.</p>
                        <div className="mt-3 pt-3 border-t border-blue-700/50">
                          <p className="text-xs text-blue-300"><strong>Exemple concret :</strong> Le chiffrement des communications sensibles entre un client et sa banque, empêchant les tiers de lire les données échangées.</p>
                        </div>
                      </div>
                      
                      <div className="bg-blue-900/40 p-4 rounded-lg border border-blue-700/50 hover:bg-blue-800/40 transition-colors">
                        <div className="flex items-center mb-2">
                          <Shield className="h-5 w-5 text-blue-300 mr-2" />
                          <h4 className="font-medium text-white">Intégrité</h4>
                        </div>
                        <p className="text-sm text-blue-200">Assurer que les données ne sont pas altérées de manière non autorisée ou accidentelle.</p>
                        <div className="mt-3 pt-3 border-t border-blue-700/50">
                          <p className="text-xs text-blue-300"><strong>Exemple concret :</strong> La vérification par hash d'un logiciel téléchargé pour s'assurer qu'il n'a pas été modifié depuis sa mise en ligne par le développeur.</p>
                        </div>
                      </div>
                      
                      <div className="bg-blue-900/40 p-4 rounded-lg border border-blue-700/50 hover:bg-blue-800/40 transition-colors">
                        <div className="flex items-center mb-2">
                          <Share2 className="h-5 w-5 text-blue-300 mr-2" />
                          <h4 className="font-medium text-white">Disponibilité</h4>
                        </div>
                        <p className="text-sm text-blue-200">Garantir que les systèmes et données sont disponibles quand les utilisateurs en ont besoin.</p>
                        <div className="mt-3 pt-3 border-t border-blue-700/50">
                          <p className="text-xs text-blue-300"><strong>Exemple concret :</strong> Les systèmes redondants d'un hôpital qui assurent que les dossiers médicaux des patients restent accessibles même en cas de panne d'un serveur.</p>
                        </div>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-semibold text-white mt-6 mb-3">Principaux domaines de la cybersécurité</h3>
                    
                    <div className="space-y-4 mb-6">
                      <div className="flex items-start bg-blue-900/30 p-4 rounded-lg hover:bg-blue-800/30 transition-colors">
                        <div className="mt-1 mr-3 p-1 rounded-full bg-blue-900/60">
                          <Server className="h-4 w-4 text-blue-300" />
                        </div>
                        <div>
                          <h4 className="font-medium text-white">Sécurité des réseaux</h4>
                          <p className="text-sm text-blue-200">Protection de l'infrastructure réseau et des communications contre les intrusions et le vol de données.</p>
                          <div className="mt-2">
                            <Badge className="bg-blue-700/50 text-blue-100">Pare-feu</Badge>
                            <Badge className="ml-1 bg-blue-700/50 text-blue-100">VPN</Badge>
                            <Badge className="ml-1 bg-blue-700/50 text-blue-100">Segmentation</Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-start bg-blue-900/30 p-4 rounded-lg hover:bg-blue-800/30 transition-colors">
                        <div className="mt-1 mr-3 p-1 rounded-full bg-blue-900/60">
                          <Database className="h-4 w-4 text-blue-300" />
                        </div>
                        <div>
                          <h4 className="font-medium text-white">Sécurité des données</h4>
                          <p className="text-sm text-blue-200">Méthodes et outils pour protéger les données sensibles, incluant le chiffrement et la classification.</p>
                          <div className="mt-2">
                            <Badge className="bg-blue-700/50 text-blue-100">Chiffrement</Badge>
                            <Badge className="ml-1 bg-blue-700/50 text-blue-100">DLP</Badge>
                            <Badge className="ml-1 bg-blue-700/50 text-blue-100">RGPD</Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-start bg-blue-900/30 p-4 rounded-lg hover:bg-blue-800/30 transition-colors">
                        <div className="mt-1 mr-3 p-1 rounded-full bg-blue-900/60">
                          <Cpu className="h-4 w-4 text-blue-300" />
                        </div>
                        <div>
                          <h4 className="font-medium text-white">Sécurité des applications</h4>
                          <p className="text-sm text-blue-200">Pratiques pour développer et maintenir des logiciels sécurisés, réduisant les vulnérabilités exploitables.</p>
                          <div className="mt-2">
                            <Badge className="bg-blue-700/50 text-blue-100">DevSecOps</Badge>
                            <Badge className="ml-1 bg-blue-700/50 text-blue-100">SAST/DAST</Badge>
                            <Badge className="ml-1 bg-blue-700/50 text-blue-100">OWASP</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 p-5 rounded-lg border border-blue-700/40 mt-8">
                      <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
                        <FileCheck className="h-5 w-5 mr-2 text-green-400" />
                        Réglementation et conformité
                      </h3>
                      <p className="text-blue-200 mb-4">
                        La cybersécurité est aujourd'hui indissociable des aspects réglementaires comme le RGPD en Europe. Cette réglementation impose :
                      </p>
                      <ul className="list-disc pl-5 space-y-1 text-blue-200">
                        <li>La protection des données personnelles par conception et par défaut</li>
                        <li>La notification des violations de données dans les 72 heures</li>
                        <li>Des analyses d'impact relatives à la protection des données (AIPD)</li>
                        <li>Des sanctions pouvant atteindre 4% du chiffre d'affaires mondial</li>
                      </ul>
                    </div>
                    
                    <Alert className="bg-amber-950/50 border-amber-700/60 mt-8">
                      <AlertTriangle className="h-4 w-4 text-amber-400" />
                      <AlertTitle className="text-amber-400">À savoir</AlertTitle>
                      <AlertDescription className="text-amber-200">
                        La cybersécurité est un domaine en constante évolution. Les menaces et les méthodes de protection évoluent continuellement, nécessitant une veille technologique permanente et une approche proactive.
                      </AlertDescription>
                    </Alert>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="menaces" className="m-0">
              <Card className="bg-blue-950/50 border-blue-800/30 shadow-xl">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                    <AlertTriangle className="mr-3 h-6 w-6 text-red-400" />
                    Les menaces cybernétiques actuelles (2025)
                  </h2>
                  
                  <p className="text-blue-200 mb-6">
                    Le paysage des menaces évolue rapidement. Voici un aperçu des principales menaces auxquelles les organisations et les individus font face aujourd'hui, avec des exemples concrets de leur impact.
                  </p>
                  
                  <Tabs defaultValue="malware" className="w-full">
                    <TabsList className="grid grid-cols-3 mb-6">
                      <TabsTrigger value="malware" className="data-[state=active]:bg-blue-700">Malwares</TabsTrigger>
                      <TabsTrigger value="socialeng" className="data-[state=active]:bg-blue-700">Ingénierie sociale</TabsTrigger>
                      <TabsTrigger value="advanced" className="data-[state=active]:bg-blue-700">Attaques avancées</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="malware">
                      <div className="space-y-4">
                        <div className="bg-blue-900/30 p-4 rounded-lg">
                          <h3 className="text-lg font-medium text-white mb-2">Ransomware</h3>
                          <p className="text-blue-200 mb-3">Logiciel qui chiffre les données de la victime et exige une rançon pour les déchiffrer.</p>
                          <div className="bg-blue-950/50 p-3 rounded border border-blue-800">
                            <h4 className="text-sm font-medium text-blue-300">Exemple concret : Colonial Pipeline (2021)</h4>
                            <p className="text-xs text-blue-200 mt-1">
                              Le pipeline d'oléoduc Colonial Pipeline, qui transporte 45% du carburant de la côte Est des États-Unis, a été forcé de suspendre ses opérations après une attaque de ransomware du groupe DarkSide. L'entreprise a payé une rançon de 4,4 millions de dollars.
                            </p>
                          </div>
                        </div>
                        
                        <div className="bg-blue-900/30 p-4 rounded-lg">
                          <h3 className="text-lg font-medium text-white mb-2">Logiciels malveillants basés sur l'IA (2025)</h3>
                          <p className="text-blue-200 mb-3">Nouvelle génération de malwares utilisant l'intelligence artificielle pour évoluer, contourner les défenses et cibler précisément leurs victimes.</p>
                          <div className="bg-blue-950/50 p-3 rounded border border-blue-800">
                            <h4 className="text-sm font-medium text-blue-300">Tendance émergente</h4>
                            <p className="text-xs text-blue-200 mt-1">
                              Les chercheurs ont observé des malwares capables d'analyser leur environnement, d'adapter leurs techniques d'attaque et même de générer des variantes de code pour éviter la détection par les systèmes de sécurité traditionnels.
                            </p>
                          </div>
                        </div>
                        
                        <div className="bg-blue-900/30 p-4 rounded-lg">
                          <h3 className="text-lg font-medium text-white mb-2">Malwares mobiles</h3>
                          <p className="text-blue-200 mb-3">Logiciels malveillants ciblant spécifiquement les appareils mobiles pour voler des données, espionner ou extorquer de l'argent.</p>
                          <div className="bg-blue-950/50 p-3 rounded border border-blue-800">
                            <h4 className="text-sm font-medium text-blue-300">Exemple concret : FluBot</h4>
                            <p className="text-xs text-blue-200 mt-1">
                              Ce logiciel malveillant se propage par SMS prétendant provenir de services de livraison comme DHL. Une fois installé, il peut voler des informations bancaires, des contacts et envoyer des SMS à partir de l'appareil infecté pour se propager.
                            </p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="socialeng">
                      <div className="space-y-4">
                        <div className="bg-blue-900/30 p-4 rounded-lg">
                          <h3 className="text-lg font-medium text-white mb-2">Phishing hyper-personnalisé</h3>
                          <p className="text-blue-200 mb-3">Attaques ciblées utilisant des informations spécifiques sur la victime, souvent collectées via les réseaux sociaux et les fuites de données précédentes.</p>
                          <div className="bg-blue-950/50 p-3 rounded border border-blue-800">
                            <h4 className="text-sm font-medium text-blue-300">Impact sur les entreprises</h4>
                            <p className="text-xs text-blue-200 mt-1">
                              Une étude de 2024 a révélé que 74% des entreprises avaient subi une attaque de phishing réussie, avec un coût moyen de 4,2 millions d'euros pour les grandes organisations.
                            </p>
                          </div>
                        </div>
                        
                        <div className="bg-blue-900/30 p-4 rounded-lg">
                          <h3 className="text-lg font-medium text-white mb-2">Deepfakes et usurpation d'identité vocale</h3>
                          <p className="text-blue-200 mb-3">Utilisation de l'IA pour créer de faux contenus audio et vidéo convaincants, souvent utilisés pour des escroqueries sophistiquées.</p>
                          <div className="bg-blue-950/50 p-3 rounded border border-blue-800">
                            <h4 className="text-sm font-medium text-blue-300">Exemple concret : Fraude au PDG par deepfake</h4>
                            <p className="text-xs text-blue-200 mt-1">
                              En 2023, un directeur financier d'une multinationale a transféré 25 millions d'euros après avoir reçu ce qu'il croyait être un appel vidéo de son PDG, mais qui était en réalité une vidéo générée par IA.
                            </p>
                          </div>
                        </div>
                        
                        <div className="bg-blue-900/30 p-4 rounded-lg">
                          <h3 className="text-lg font-medium text-white mb-2">Manipulation sociale ciblée</h3>
                          <p className="text-blue-200 mb-3">Exploitation psychologique sophistiquée pour manipuler les individus à divulguer des informations ou réaliser des actions préjudiciables.</p>
                          <div className="bg-blue-950/50 p-3 rounded border border-blue-800">
                            <h4 className="text-sm font-medium text-blue-300">Protection numérique responsable</h4>
                            <p className="text-xs text-blue-200 mt-1">
                              La formation continue des employés est devenue essentielle. Les organisations adoptant une approche de sensibilisation régulière ont réduit de 60% les incidents liés à l'ingénierie sociale.
                            </p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="advanced">
                      <div className="space-y-4">
                        <div className="bg-blue-900/30 p-4 rounded-lg">
                          <h3 className="text-lg font-medium text-white mb-2">Attaques sur la chaîne d'approvisionnement</h3>
                          <p className="text-blue-200 mb-3">Compromission d'un fournisseur ou d'un logiciel tiers pour atteindre la cible principale.</p>
                          <div className="bg-blue-950/50 p-3 rounded border border-blue-800">
                            <h4 className="text-sm font-medium text-blue-300">Exemple concret : SolarWinds</h4>
                            <p className="text-xs text-blue-200 mt-1">
                              L'attaque SolarWinds a touché plus de 18 000 organisations, dont des agences gouvernementales américaines, après qu'un code malveillant a été inséré dans les mises à jour d'un logiciel de gestion de réseau légitime.
                            </p>
                          </div>
                        </div>
                        
                        <div className="bg-blue-900/30 p-4 rounded-lg">
                          <h3 className="text-lg font-medium text-white mb-2">Attaques contre les infrastructures critiques</h3>
                          <p className="text-blue-200 mb-3">Ciblage des systèmes essentiels comme l'énergie, la santé, les transports ou les télécommunications.</p>
                          <div className="bg-blue-950/50 p-3 rounded border border-blue-800">
                            <h4 className="text-sm font-medium text-blue-300">Enjeu sociétal majeur</h4>
                            <p className="text-xs text-blue-200 mt-1">
                              Les attaques contre les infrastructures critiques ont augmenté de 125% entre 2022 et 2024, représentant un risque majeur pour la société et nécessitant une coopération public-privé renforcée.
                            </p>
                          </div>
                        </div>
                        
                        <div className="bg-blue-900/30 p-4 rounded-lg">
                          <h3 className="text-lg font-medium text-white mb-2">Menaces persistantes avancées (APT)</h3>
                          <p className="text-blue-200 mb-3">Attaques sophistiquées sur le long terme, souvent menées par des groupes étatiques ou parrainés par des États.</p>
                          <div className="bg-blue-950/50 p-3 rounded border border-blue-800">
                            <h4 className="text-sm font-medium text-blue-300">Impact sur la géopolitique</h4>
                            <p className="text-xs text-blue-200 mt-1">
                              Les APT sont devenues un outil de la guerre hybride moderne, avec plus de 30 groupes actifs identifiés, ciblant les infrastructures stratégiques, la recherche et le développement, et les institutions démocratiques.
                            </p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="casreel" className="m-0">
              <Card className="bg-blue-950/50 border-blue-800/30 shadow-xl">
                <CardContent className="p-6">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="flex items-start mb-4">
                      <div className="bg-red-900/30 p-2 rounded-full mr-4">
                        <AlertTriangle className="h-6 w-6 text-red-400" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">{caseStudy.title}</h2>
                        <p className="text-blue-200 mt-1">{caseStudy.intro}</p>
                      </div>
                    </div>
                    
                    <div className="border-l-4 border-blue-700 pl-6 py-2 mb-6">
                      <blockquote className="italic text-blue-300">
                        "La plus grande violation de données de l'histoire des États-Unis a exposé les données sensibles de près de la moitié de la population américaine."
                        <footer className="text-sm text-blue-400 mt-2">— Federal Trade Commission</footer>
                      </blockquote>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                          <Shield className="mr-2 h-5 w-5 text-red-400" />
                          Chronologie et faits
                        </h3>
                        
                        <div className="space-y-4">
                          <div className="bg-blue-900/20 p-4 rounded-lg border-l-4 border-blue-600">
                            <div className="text-sm text-blue-400 font-semibold">Mars 2017</div>
                            <p className="text-blue-200">La vulnérabilité Apache Struts est découverte et un correctif est publié</p>
                          </div>
                          
                          <div className="bg-blue-900/20 p-4 rounded-lg border-l-4 border-blue-600">
                            <div className="text-sm text-blue-400 font-semibold">Mai 2017</div>
                            <p className="text-blue-200">Les pirates exploitent la vulnérabilité non corrigée chez Equifax</p>
                          </div>
                          
                          <div className="bg-blue-900/20 p-4 rounded-lg border-l-4 border-blue-600">
                            <div className="text-sm text-blue-400 font-semibold">Juillet 2017</div>
                            <p className="text-blue-200">L'équipe de sécurité d'Equifax découvre la violation</p>
                          </div>
                          
                          <div className="bg-blue-900/20 p-4 rounded-lg border-l-4 border-blue-600">
                            <div className="text-sm text-blue-400 font-semibold">Septembre 2017</div>
                            <p className="text-blue-200">Annonce publique de la violation</p>
                          </div>
                          
                          {caseStudyExpanded && (
                            <>
                              <div className="bg-blue-900/20 p-4 rounded-lg border-l-4 border-blue-600">
                                <div className="text-sm text-blue-400 font-semibold">Juillet 2019</div>
                                <p className="text-blue-200">Accord de règlement de 575 millions de dollars</p>
                              </div>
                              
                              <div className="bg-blue-900/20 p-4 rounded-lg border-l-4 border-blue-600">
                                <div className="text-sm text-blue-400 font-semibold">Janvier 2020</div>
                                <p className="text-blue-200">Lancement des réclamations pour les consommateurs affectés</p>
                              </div>
                            </>
                          )}
                        </div>
                        
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="mt-4 text-blue-400"
                          onClick={() => setCaseStudyExpanded(!caseStudyExpanded)}
                        >
                          {caseStudyExpanded ? "Voir moins" : "Voir plus"}
                        </Button>
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                          <LightbulbIcon className="mr-2 h-5 w-5 text-amber-400" />
                          Leçons et applications RGPD
                        </h3>
                        
                        <ul className="space-y-3">
                          {caseStudy.lessons.map((lesson, index) => (
                            <li key={index} className="flex items-start">
                              <div className="bg-amber-900/30 p-1 rounded-full mr-2 mt-0.5">
                                <CheckCircle className="h-4 w-4 text-amber-400" />
                              </div>
                              <p className="text-blue-200">{lesson}</p>
                            </li>
                          ))}
                        </ul>
                        
                        <div className="bg-blue-900/30 p-4 rounded-lg mt-6 border border-blue-700">
                          <h4 className="font-medium text-white mb-2">Implications RGPD</h4>
                          <p className="text-sm text-blue-200">
                            Si cette violation s'était produite après l'entrée en vigueur du RGPD en 2018, Equifax aurait pu faire face à :
                          </p>
                          <ul className="list-disc pl-5 text-sm text-blue-200 mt-2">
                            <li>Une obligation de notification des personnes concernées sous 72 heures</li>
                            <li>Des amendes potentielles allant jusqu'à 4% du chiffre d'affaires mondial</li>
                            <li>Des actions collectives en justice plus importantes en Europe</li>
                          </ul>
                        </div>
                        
                        <div className="bg-gradient-to-r from-green-900/30 to-green-900/10 p-4 rounded-lg mt-6 border border-green-700/50">
                          <h4 className="font-medium text-white mb-2 flex items-center">
                            <FileCheck className="h-4 w-4 mr-2 text-green-400" />
                            Numérique responsable
                          </h4>
                          <p className="text-sm text-blue-200">
                            Cette violation souligne l'importance du numérique responsable : la protection des données n'est pas seulement une obligation légale, mais aussi une responsabilité éthique envers les individus dont les informations sont confiées à l'organisation.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="quiz" className="m-0">
              <Card className="bg-blue-950/50 border-blue-800/30 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center mb-6">
                    <GraduationCap className="h-6 w-6 text-blue-400 mr-3" />
                    <h2 className="text-2xl font-bold text-white">Évaluez vos connaissances</h2>
                  </div>
                  
                  {showQuizResult ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                      className="space-y-8"
                    >
                      <div className={`p-6 rounded-lg border ${
                        quizScore === 3 ? "bg-green-900/20 border-green-600" :
                        quizScore === 2 ? "bg-blue-900/20 border-blue-600" :
                        "bg-amber-900/20 border-amber-600"
                      }`}>
                        <div className="flex items-center mb-4">
                          {quizScore === 3 ? (
                            <Trophy className="h-12 w-12 text-yellow-400 mr-4" />
                          ) : quizScore === 2 ? (
                            <Award className="h-12 w-12 text-blue-400 mr-4" />
                          ) : (
                            <BookOpen className="h-12 w-12 text-amber-400 mr-4" />
                          )}
                          
                          <div>
                            <h3 className="text-xl font-semibold text-white">
                              {quizScore === 3 ? "Excellent travail !" :
                               quizScore === 2 ? "Bon travail !" :
                               "Continuez d'apprendre !"}
                            </h3>
                            <p className={`${
                              quizScore === 3 ? "text-green-300" :
                              quizScore === 2 ? "text-blue-300" :
                              "text-amber-300"
                            }`}>
                              Vous avez obtenu {quizScore}/3 points
                            </p>
                          </div>
                        </div>
                        
                        {badgeEarned && (
                          <div className="bg-blue-950/40 p-4 rounded-lg border border-blue-700/50 mt-4">
                            <div className="flex items-center">
                              <div className="bg-blue-900/60 p-2 rounded-full mr-3">
                                <Shield className="h-5 w-5 text-blue-300" />
                              </div>
                              <div>
                                <h4 className="font-medium text-white">Badge débloqué !</h4>
                                <p className="text-sm text-blue-300">Fondamentaux de la Cybersécurité</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-white">Vos réponses</h3>
                        
                        {quizQuestions.map(question => (
                          <div 
                            key={question.id} 
                            className={`p-4 rounded-lg border ${
                              quizAnswers[question.id] === question.correctAnswer
                                ? "border-green-600 bg-green-900/10"
                                : "border-red-600 bg-red-900/10"
                            }`}
                          >
                            <h4 className="font-medium text-white">{question.question}</h4>
                            
                            <div className="mt-3 mb-2">
                              <span className="text-sm font-medium text-white">Votre réponse : </span>
                              <span className={quizAnswers[question.id] === question.correctAnswer ? "text-green-400" : "text-red-400"}>
                                {question.options.find(o => o.value === quizAnswers[question.id])?.label || "Non répondu"}
                              </span>
                            </div>
                            
                            {quizAnswers[question.id] !== question.correctAnswer && (
                              <div className="mt-2">
                                <span className="text-sm font-medium text-white">Réponse correcte : </span>
                                <span className="text-green-400">
                                  {question.options.find(o => o.value === question.correctAnswer)?.label}
                                </span>
                              </div>
                            )}
                            
                            <div className="bg-blue-950/50 p-3 rounded mt-3 text-blue-200 text-sm">
                              <p><strong>Explication :</strong> {question.explanation}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex gap-3">
                        <Button 
                          onClick={() => {
                            setShowQuizResult(false);
                            setQuizAnswers({ q1: "", q2: "", q3: "" });
                            setQuizScored(false);
                          }}
                          variant="outline"
                          className="border-blue-700 text-blue-300"
                        >
                          Réessayer le quiz
                        </Button>
                        
                        <Button
                          onClick={() => setActiveTab("principes")}
                          className="bg-blue-700 hover:bg-blue-600"
                        >
                          Revoir le cours
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="space-y-8">
                      <p className="text-blue-200">
                        Testez vos connaissances sur les principes fondamentaux de la cybersécurité avec ce quiz de 3 questions.
                      </p>
                      
                      {quizQuestions.map((question) => (
                        <div key={question.id} className="space-y-3">
                          <h3 className="text-lg font-medium text-white">{question.question}</h3>
                          
                          <RadioGroup 
                            value={quizAnswers[question.id]}
                            onValueChange={(value) => setQuizAnswers({...quizAnswers, [question.id]: value})}
                          >
                            <div className="space-y-2">
                              {question.options.map((option) => (
                                <div key={option.value} className="flex items-center">
                                  <RadioGroupItem 
                                    value={option.value} 
                                    id={`${question.id}-${option.value}`}
                                    className="text-blue-500"
                                  />
                                  <Label 
                                    htmlFor={`${question.id}-${option.value}`}
                                    className="ml-2 text-blue-200"
                                  >
                                    {option.label}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </RadioGroup>
                          
                          <Separator className="my-4 bg-blue-800/40" />
                        </div>
                      ))}
                      
                      <Button 
                        className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900"
                        onClick={submitQuiz}
                      >
                        Soumettre mes réponses
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </div>
          
          {/* Sidebar avec ressources et progression */}
          <div className="space-y-6">
            <Card className="bg-blue-950/50 border-blue-800/30 shadow-xl">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Trophy className="h-5 w-5 text-amber-400 mr-2" />
                  Votre progression
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-blue-300">Module en cours</span>
                      <span className="text-blue-300">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-blue-300">Programme total</span>
                      <span className="text-blue-300">8%</span>
                    </div>
                    <Progress value={8} className="h-2" />
                  </div>
                </div>
                
                {badgeEarned && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-blue-300 mb-2">Badges obtenus</h3>
                    <div className="bg-blue-900/30 p-3 rounded-lg border border-blue-700/50">
                      <div className="flex items-center">
                        <div className="bg-blue-900/60 p-2 rounded-full mr-3">
                          <Shield className="h-5 w-5 text-blue-300" />
                        </div>
                        <div>
                          <p className="font-medium text-white text-sm">Fondamentaux de la Cybersécurité</p>
                          <p className="text-xs text-blue-300">Obtenu aujourd'hui</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <Button 
                  className="w-full mt-6 bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500"
                  onClick={() => {
                    if (progress >= 75) {
                      setLocation('/cyber/learning-center/modules/zero-trust');
                    } else if (activeTab !== "quiz") {
                      setActiveTab("quiz");
                    } else {
                      submitQuiz();
                    }
                  }}
                >
                  {progress >= 75 ? "Module suivant" : "Continuer l'apprentissage"}
                </Button>
              </CardContent>
            </Card>
            
            <Card className="bg-blue-950/50 border-blue-800/30 shadow-xl">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <BrainCircuit className="h-5 w-5 text-indigo-400 mr-2" />
                  Ressources pratiques
                </h3>
                
                <div className="space-y-3">
                  <a href="https://www.cnil.fr/fr/rgpd-par-ou-commencer" target="_blank" rel="noopener noreferrer" className="block p-3 bg-blue-900/30 rounded-lg hover:bg-blue-900/50 transition-colors">
                    <div className="flex items-center">
                      <FileCheck className="h-4 w-4 text-blue-300 mr-2" />
                      <span className="text-blue-200">Guide RGPD pour les entreprises</span>
                      <ExternalLink className="h-3 w-3 text-blue-400 ml-auto" />
                    </div>
                  </a>
                  
                  <a href="https://www.ssi.gouv.fr/guide/guide-dhygiene-informatique/" target="_blank" rel="noopener noreferrer" className="block p-3 bg-blue-900/30 rounded-lg hover:bg-blue-900/50 transition-colors">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-blue-300 mr-2" />
                      <span className="text-blue-200">Guide d'hygiène informatique (ANSSI)</span>
                      <ExternalLink className="h-3 w-3 text-blue-400 ml-auto" />
                    </div>
                  </a>
                  
                  <a href="https://nvd.nist.gov/vuln-metrics/cvss" target="_blank" rel="noopener noreferrer" className="block p-3 bg-blue-900/30 rounded-lg hover:bg-blue-900/50 transition-colors">
                    <div className="flex items-center">
                      <AlertTriangle className="h-4 w-4 text-blue-300 mr-2" />
                      <span className="text-blue-200">Système d'évaluation des vulnérabilités</span>
                      <ExternalLink className="h-3 w-3 text-blue-400 ml-auto" />
                    </div>
                  </a>
                </div>
                
                <Separator className="my-4 bg-blue-800/40" />
                
                <h3 className="text-lg font-semibold text-white mb-4">Modules connexes</h3>
                
                <div className="space-y-3">
                  <Link href="/cyber/learning-center/modules/zero-trust" className="block p-3 bg-blue-900/30 rounded-lg hover:bg-blue-900/50 transition-colors">
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 text-blue-300 mr-2" />
                      <span className="text-blue-200">Zero Trust</span>
                      <ArrowRight className="h-3 w-3 text-blue-400 ml-auto" />
                    </div>
                  </Link>
                  
                  <Link href="/cyber/learning-center/modules/rgpd" className="block p-3 bg-blue-900/30 rounded-lg hover:bg-blue-900/50 transition-colors">
                    <div className="flex items-center">
                      <Lock className="h-4 w-4 text-blue-300 mr-2" />
                      <span className="text-blue-200">RGPD et protection des données</span>
                      <ArrowRight className="h-3 w-3 text-blue-400 ml-auto" />
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}