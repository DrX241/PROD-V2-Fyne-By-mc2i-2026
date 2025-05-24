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
      
      {/* Navigation et contenu principal du module */}
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
            
            <div className="container mx-auto px-4 py-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 lg:grid-cols-4 gap-8"
              >
                {/* Section principale de contenu */}
                <div className="lg:col-span-3 space-y-8">
                  {/* Contenu Principes Fondamentaux */}
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
                                <p className="text-sm text-blue-200">Développement de logiciels sécurisés et protection contre les vulnérabilités d'exploitation.</p>
                                <div className="mt-2">
                                  <Badge className="bg-blue-700/50 text-blue-100">DevSecOps</Badge>
                                  <Badge className="ml-1 bg-blue-700/50 text-blue-100">SAST/DAST</Badge>
                                  <Badge className="ml-1 bg-blue-700/50 text-blue-100">OWASP</Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <h3 className="text-xl font-semibold text-white mt-6 mb-3">Approches de la cybersécurité</h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-700/50">
                              <h4 className="font-medium text-white mb-2">Défense en profondeur</h4>
                              <p className="text-sm text-blue-200">
                                Approche qui utilise plusieurs couches de sécurité pour protéger les actifs critiques. Si une couche est compromise, 
                                d'autres mécanismes de protection restent en place.
                              </p>
                            </div>
                            
                            <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-700/50">
                              <h4 className="font-medium text-white mb-2">Principe du moindre privilège</h4>
                              <p className="text-sm text-blue-200">
                                Donner aux utilisateurs uniquement les accès nécessaires à l'accomplissement de leurs tâches, 
                                limitant ainsi les risques en cas de compromission d'un compte.
                              </p>
                            </div>
                          </div>
                          
                          <div className="bg-blue-800/20 p-4 rounded-lg border border-blue-700/50 mt-6">
                            <div className="flex items-start">
                              <LightbulbIcon className="h-6 w-6 text-amber-400 mr-3 mt-1 shrink-0" />
                              <div>
                                <h4 className="font-medium text-white mb-1">À retenir</h4>
                                <p className="text-sm text-blue-200">
                                  La cybersécurité est un domaine en constante évolution qui nécessite une veille technologique permanente 
                                  et une approche holistique. La protection complète combine des mesures techniques, organisationnelles et humaines.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Contenu Menaces Actuelles */}
                  <TabsContent value="menaces" className="m-0">
                    <Card className="bg-blue-950/50 border-blue-800/30 shadow-xl">
                      <CardContent className="p-6">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                          <AlertTriangle className="mr-3 h-6 w-6 text-amber-400" />
                          Panorama des menaces cyber actuelles
                        </h2>
                        
                        <p className="text-blue-200 mb-6">
                          Le paysage des menaces évolue rapidement, avec des acteurs malveillants qui développent constamment de nouvelles techniques pour 
                          contourner les défenses. Voici les principales catégories de menaces auxquelles les organisations font face aujourd'hui.
                        </p>
                        
                        <Tabs defaultValue="malware" className="w-full">
                          <TabsList className="grid grid-cols-3 mb-6">
                            <TabsTrigger value="malware" className="data-[state=active]:bg-blue-700">Malwares</TabsTrigger>
                            <TabsTrigger value="socialeng" className="data-[state=active]:bg-blue-700">Ingénierie sociale</TabsTrigger>
                            <TabsTrigger value="advanced" className="data-[state=active]:bg-blue-700">Attaques avancées</TabsTrigger>
                          </TabsList>

                          <TabsContent value="malware">
                            <div className="space-y-4">
                              <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-700/50">
                                <h3 className="font-semibold text-white">Ransomware</h3>
                                <p className="text-sm text-blue-200 mt-1">
                                  Logiciel malveillant qui chiffre les données de la victime et exige une rançon pour les déchiffrer. 
                                  Les ransomwares ciblent aussi bien les particuliers que les grandes entreprises et organisations gouvernementales.
                                </p>
                                <div className="mt-2 text-xs text-amber-300">
                                  <strong>Cas célèbre :</strong> WannaCry (2017) a infecté plus de 200,000 ordinateurs dans 150 pays.
                                </div>
                              </div>
                              
                              <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-700/50">
                                <h3 className="font-semibold text-white">Spyware</h3>
                                <p className="text-sm text-blue-200 mt-1">
                                  Logiciel qui collecte secrètement des informations sur l'activité d'un utilisateur. Il peut voler des 
                                  identifiants, surveiller la frappe au clavier, et accéder à la webcam ou au microphone.
                                </p>
                              </div>
                              
                              <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-700/50">
                                <h3 className="font-semibold text-white">Virus et vers</h3>
                                <p className="text-sm text-blue-200 mt-1">
                                  Les virus se propagent via des fichiers infectés et nécessitent une action humaine, tandis que 
                                  les vers se propagent automatiquement à travers les réseaux sans intervention humaine.
                                </p>
                              </div>
                              
                              <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-700/50">
                                <h3 className="font-semibold text-white">Malware sans fichier</h3>
                                <p className="text-sm text-blue-200 mt-1">
                                  Attaques qui n'écrivent pas de fichiers sur le disque et s'exécutent uniquement en mémoire, 
                                  les rendant difficiles à détecter par les antivirus traditionnels.
                                </p>
                              </div>
                            </div>
                          </TabsContent>

                          <TabsContent value="socialeng">
                            <div className="space-y-4">
                              <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-700/50">
                                <h3 className="font-semibold text-white">Phishing</h3>
                                <p className="text-sm text-blue-200 mt-1">
                                  Tentatives de tromper les utilisateurs pour qu'ils révèlent des informations sensibles en se faisant passer 
                                  pour des entités légitimes. Le phishing peut cibler des groupes larges (phishing de masse) ou 
                                  des individus spécifiques (spear phishing).
                                </p>
                                <div className="mt-2 text-xs text-amber-300">
                                  <strong>Fait important :</strong> Plus de 90% des attaques réussies commencent par un email de phishing.
                                </div>
                              </div>
                              
                              <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-700/50">
                                <h3 className="font-semibold text-white">Pretexting</h3>
                                <p className="text-sm text-blue-200 mt-1">
                                  Création d'un scénario fabriqué pour obtenir des informations de la victime. Par exemple, se faire passer 
                                  pour un support technique ou un responsable RH pour obtenir des identifiants ou des informations personnelles.
                                </p>
                              </div>
                              
                              <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-700/50">
                                <h3 className="font-semibold text-white">Baiting</h3>
                                <p className="text-sm text-blue-200 mt-1">
                                  Offre de quelque chose d'attrayant pour piéger la victime, comme une clé USB "trouvée" contenant 
                                  des malwares ou un téléchargement gratuit infecté.
                                </p>
                              </div>
                              
                              <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-700/50">
                                <h3 className="font-semibold text-white">Manipulation psychologique</h3>
                                <p className="text-sm text-blue-200 mt-1">
                                  Exploitation de biais cognitifs comme l'urgence, la peur ou la curiosité pour amener les victimes 
                                  à contourner les bonnes pratiques de sécurité.
                                </p>
                              </div>
                            </div>
                          </TabsContent>

                          <TabsContent value="advanced">
                            <div className="space-y-4">
                              <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-700/50">
                                <h3 className="font-semibold text-white">Attaques par déni de service (DDoS)</h3>
                                <p className="text-sm text-blue-200 mt-1">
                                  Saturation d'un service ou d'un réseau avec un trafic massif provenant de multiples sources, 
                                  rendant le service indisponible pour les utilisateurs légitimes.
                                </p>
                                <div className="mt-2 text-xs text-amber-300">
                                  <strong>Tendance :</strong> La taille moyenne des attaques DDoS a augmenté de 500% au cours des 5 dernières années.
                                </div>
                              </div>
                              
                              <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-700/50">
                                <h3 className="font-semibold text-white">Attaques de la chaîne d'approvisionnement</h3>
                                <p className="text-sm text-blue-200 mt-1">
                                  Compromission d'un fournisseur ou d'un prestataire pour accéder aux systèmes de l'organisation cible. 
                                  Ces attaques exploitent la confiance entre partenaires commerciaux.
                                </p>
                                <div className="mt-2 text-xs text-amber-300">
                                  <strong>Cas célèbre :</strong> L'attaque SolarWinds en 2020 a affecté des milliers d'organisations, dont des agences gouvernementales américaines.
                                </div>
                              </div>
                              
                              <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-700/50">
                                <h3 className="font-semibold text-white">Zero-day exploits</h3>
                                <p className="text-sm text-blue-200 mt-1">
                                  Exploitation de vulnérabilités inconnues des développeurs et pour lesquelles aucun correctif n'est disponible, 
                                  donnant "zéro jour" aux organisations pour se défendre.
                                </p>
                              </div>
                              
                              <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-700/50">
                                <h3 className="font-semibold text-white">APT (Advanced Persistent Threats)</h3>
                                <p className="text-sm text-blue-200 mt-1">
                                  Attaques ciblées et sophistiquées où l'attaquant maintient une présence prolongée dans l'environnement 
                                  compromis pour extraire des données sur le long terme.
                                </p>
                              </div>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Contenu Cas Concret */}
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
                          
                          <div className="mb-6">
                            <Button 
                              variant="outline" 
                              className={`w-full border-blue-700 justify-between ${caseStudyExpanded ? 'bg-blue-900/40' : ''}`}
                              onClick={() => setCaseStudyExpanded(!caseStudyExpanded)}
                            >
                              <span>Voir les détails de l'incident {caseStudyExpanded ? 'moins' : 'plus'}</span>
                              <ArrowRight className={`h-4 w-4 transition-transform ${caseStudyExpanded ? 'rotate-90' : ''}`} />
                            </Button>
                          </div>
                          
                          {caseStudyExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              transition={{ duration: 0.3 }}
                              className="mb-6"
                            >
                              <div className="bg-blue-900/20 rounded-lg p-4 mb-6">
                                <h3 className="text-lg font-semibold text-white mb-3">Chronologie de l'incident</h3>
                                
                                <div className="space-y-3">
                                  <div className="flex">
                                    <div className="w-24 shrink-0 font-medium text-blue-300">Mars 2017</div>
                                    <div className="text-blue-200">Une vulnérabilité critique est découverte dans Apache Struts, un framework utilisé par Equifax. Un correctif est publié.</div>
                                  </div>
                                  <div className="flex">
                                    <div className="w-24 shrink-0 font-medium text-blue-300">Mai 2017</div>
                                    <div className="text-blue-200">Les attaquants exploitent la vulnérabilité non corrigée et pénètrent dans les systèmes d'Equifax.</div>
                                  </div>
                                  <div className="flex">
                                    <div className="w-24 shrink-0 font-medium text-blue-300">Mai-Juillet</div>
                                    <div className="text-blue-200">Les attaquants exfiltrent des données pendant plus de 76 jours sans être détectés.</div>
                                  </div>
                                  <div className="flex">
                                    <div className="w-24 shrink-0 font-medium text-blue-300">29 juillet</div>
                                    <div className="text-blue-200">Equifax découvre finalement la brèche.</div>
                                  </div>
                                  <div className="flex">
                                    <div className="w-24 shrink-0 font-medium text-blue-300">Sept. 2017</div>
                                    <div className="text-blue-200">Equifax annonce publiquement la violation de données.</div>
                                  </div>
                                  <div className="flex">
                                    <div className="w-24 shrink-0 font-medium text-blue-300">Juillet 2019</div>
                                    <div className="text-blue-200">Equifax accepte de payer jusqu'à 575 millions de dollars en amendes et compensations.</div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="bg-blue-900/20 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-white mb-3">Détails techniques</h3>
                                
                                <ul className="list-disc list-inside space-y-2 text-blue-200 mb-4">
                                  {caseStudy.details.map((detail, index) => (
                                    <li key={index}>{detail}</li>
                                  ))}
                                </ul>
                                
                                <div className="bg-red-900/20 p-3 rounded border border-red-800/50">
                                  <h4 className="font-medium text-white mb-1">Facteurs aggravants</h4>
                                  <ul className="list-disc list-inside space-y-1 text-blue-200 text-sm">
                                    <li>Le correctif était disponible 2 mois avant l'attaque mais n'avait pas été appliqué</li>
                                    <li>Les systèmes de détection d'intrusion ont échoué à identifier l'attaque en cours</li>
                                    <li>Des certificats de sécurité expirés ont empêché l'inspection du trafic chiffré</li>
                                    <li>Des informations sensibles n'étaient pas correctement chiffrées</li>
                                  </ul>
                                </div>
                              </div>
                            </motion.div>
                          )}
                          
                          <div className="bg-blue-800/20 rounded-lg p-5 border border-blue-700/50">
                            <h3 className="text-lg font-semibold text-white mb-3">Leçons à retenir</h3>
                            
                            <div className="space-y-3">
                              {caseStudy.lessons.map((lesson, index) => (
                                <div key={index} className="flex items-start">
                                  <CheckCircle className="h-5 w-5 text-blue-400 mr-2 shrink-0 mt-0.5" />
                                  <p className="text-blue-200">{lesson}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="mt-6 pt-6 border-t border-blue-800/50">
                            <h3 className="text-lg font-semibold text-white mb-3">Bonnes pratiques à mettre en œuvre</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-blue-900/30 p-3 rounded-lg hover:bg-blue-800/30 transition-colors">
                                <div className="flex items-center">
                                  <FileCheck className="h-5 w-5 text-blue-400 mr-2" />
                                  <h4 className="font-medium text-white">Gestion des correctifs</h4>
                                </div>
                                <p className="text-sm text-blue-200 mt-1">Mettre en place un processus rigoureux pour l'application des correctifs de sécurité critiques</p>
                              </div>
                              
                              <div className="bg-blue-900/30 p-3 rounded-lg hover:bg-blue-800/30 transition-colors">
                                <div className="flex items-center">
                                  <FileCheck className="h-5 w-5 text-blue-400 mr-2" />
                                  <h4 className="font-medium text-white">Détection et réponse</h4>
                                </div>
                                <p className="text-sm text-blue-200 mt-1">Implémenter des systèmes de détection d'intrusion efficaces et un plan de réponse aux incidents</p>
                              </div>
                              
                              <div className="bg-blue-900/30 p-3 rounded-lg hover:bg-blue-800/30 transition-colors">
                                <div className="flex items-center">
                                  <FileCheck className="h-5 w-5 text-blue-400 mr-2" />
                                  <h4 className="font-medium text-white">Chiffrement des données</h4>
                                </div>
                                <p className="text-sm text-blue-200 mt-1">Chiffrer systématiquement les données sensibles, tant au repos qu'en transit</p>
                              </div>
                              
                              <div className="bg-blue-900/30 p-3 rounded-lg hover:bg-blue-800/30 transition-colors">
                                <div className="flex items-center">
                                  <FileCheck className="h-5 w-5 text-blue-400 mr-2" />
                                  <h4 className="font-medium text-white">Tests de sécurité</h4>
                                </div>
                                <p className="text-sm text-blue-200 mt-1">Réaliser régulièrement des tests d'intrusion et des audits de sécurité</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-6">
                            <a href="https://www.ftc.gov/enforcement/cases-proceedings/172-3203/equifax-inc" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center">
                              <div className="flex items-center">
                                <span>En savoir plus sur le règlement de l'affaire Equifax</span>
                                <ExternalLink className="h-3 w-3 text-blue-400 ml-1" />
                              </div>
                            </a>
                          </div>
                        </motion.div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Contenu Quiz */}
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
                                  <h3 className="text-xl font-bold text-white">
                                    {quizScore === 3 ? "Excellent !" : 
                                    quizScore === 2 ? "Bon travail !" : 
                                    "Continuez à apprendre !"}
                                  </h3>
                                  <p className="text-blue-200">
                                    Vous avez obtenu {quizScore}/3 points
                                  </p>
                                </div>
                              </div>
                              
                              <p className="text-blue-200">
                                {quizScore === 3 ? 
                                  "Vous maîtrisez parfaitement les concepts fondamentaux de la cybersécurité. Vous êtes prêt à aborder des sujets plus avancés !" : 
                                quizScore === 2 ? 
                                  "Vous avez une bonne compréhension des bases de la cybersécurité. Revoyez les points qui vous ont posé problème avant de passer aux modules avancés." : 
                                  "Vous avez encore quelques concepts à approfondir. Prenez le temps de revoir le contenu du module avant de retenter le quiz."}
                              </p>
                            </div>
                            
                            <div>
                              <h3 className="text-lg font-semibold text-white mb-3">Vos réponses</h3>
                              
                              {quizQuestions.map((question, index) => {
                                const userAnswer = quizAnswers[question.id as keyof typeof quizAnswers];
                                const isCorrect = userAnswer === question.correctAnswer;
                                
                                return (
                                  <div key={index} className={`mb-4 p-4 rounded-lg border ${
                                    isCorrect ? "bg-green-900/10 border-green-700/50" : "bg-red-900/10 border-red-700/50"
                                  }`}>
                                    <p className="font-medium text-white mb-2">{question.question}</p>
                                    
                                    <div className="flex items-center">
                                      <span className="text-sm text-blue-200 mr-2">Votre réponse :</span>
                                      <Badge className={isCorrect ? "bg-green-700" : "bg-red-700"}>
                                        {question.options.find(opt => opt.value === userAnswer)?.label || "Aucune réponse"}
                                      </Badge>
                                    </div>
                                    
                                    {!isCorrect && (
                                      <div className="flex items-center mt-1">
                                        <span className="text-sm text-blue-200 mr-2">Réponse correcte :</span>
                                        <Badge className="bg-green-700">
                                          {question.options.find(opt => opt.value === question.correctAnswer)?.label}
                                        </Badge>
                                      </div>
                                    )}
                                    
                                    <p className="text-sm text-blue-300 mt-2">{question.explanation}</p>
                                  </div>
                                );
                              })}
                            </div>
                            
                            <div className="pt-4 flex flex-wrap gap-4">
                              <Button onClick={() => setLocation("/cyber/learning-center")}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Retour au centre d'apprentissage
                              </Button>
                              
                              <Button variant="outline" onClick={() => {
                                setShowQuizResult(false);
                                setQuizAnswers({ q1: "", q2: "", q3: "" });
                                setQuizScored(false);
                              }}>
                                Retenter le quiz
                              </Button>
                            </div>
                          </motion.div>
                        ) : (
                          <div className="space-y-8">
                            <p className="text-blue-200">
                              Ce quiz vous permettra d'évaluer votre compréhension des concepts fondamentaux de la cybersécurité. 
                              Répondez aux questions suivantes pour obtenir votre score.
                            </p>
                            
                            {quizQuestions.map((question, index) => (
                              <div key={index} className="bg-blue-900/20 p-4 rounded-lg border border-blue-800/50">
                                <h3 className="font-medium text-white mb-3">Question {index + 1}: {question.question}</h3>
                                
                                <RadioGroup 
                                  value={quizAnswers[question.id as keyof typeof quizAnswers]} 
                                  onValueChange={(value) => setQuizAnswers({...quizAnswers, [question.id]: value})}
                                >
                                  <div className="space-y-2">
                                    {question.options.map((option) => (
                                      <div key={option.value} className="flex items-center">
                                        <RadioGroupItem 
                                          value={option.value} 
                                          id={`${question.id}-${option.value}`} 
                                          className="border-blue-700"
                                        />
                                        <Label 
                                          htmlFor={`${question.id}-${option.value}`} 
                                          className="ml-2 text-blue-200 cursor-pointer"
                                        >
                                          {option.label}
                                        </Label>
                                      </div>
                                    ))}
                                  </div>
                                </RadioGroup>
                              </div>
                            ))}
                            
                            <Button onClick={submitQuiz} className="w-full md:w-auto">
                              Soumettre mes réponses
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </div>

                {/* Barre latérale d'informations complémentaires */}
                <div className="lg:col-span-1 space-y-6">
                  {/* Carte des prérequis */}
                  <Card className="bg-blue-950/60 border-blue-800/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center">
                        <BookOpen className="h-5 w-5 mr-2 text-blue-400" />
                        Prérequis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-blue-200">
                      <p>Aucun prérequis technique n'est nécessaire pour ce module d'introduction.</p>
                    </CardContent>
                  </Card>

                  {/* Carte des objectifs d'apprentissage */}
                  <Card className="bg-blue-950/60 border-blue-800/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center">
                        <BrainCircuit className="h-5 w-5 mr-2 text-blue-400" />
                        Objectifs d'apprentissage
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                      <div className="flex items-start">
                        <CheckCircle className="h-4 w-4 mr-2 text-blue-400 shrink-0 mt-0.5" />
                        <p className="text-blue-200">Comprendre les principes fondamentaux de la cybersécurité</p>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="h-4 w-4 mr-2 text-blue-400 shrink-0 mt-0.5" />
                        <p className="text-blue-200">Identifier les principales menaces et vulnérabilités actuelles</p>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="h-4 w-4 mr-2 text-blue-400 shrink-0 mt-0.5" />
                        <p className="text-blue-200">Appliquer des bonnes pratiques de base en matière de sécurité</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Carte des badges et récompenses */}
                  <Card className="bg-blue-950/60 border-blue-800/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center">
                        <Award className="h-5 w-5 mr-2 text-blue-400" />
                        Badge à débloquer
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center p-4">
                      <div className={`p-4 rounded-full bg-gradient-to-br from-blue-900 to-blue-700 inline-block mb-3 transition-all duration-500 ${badgeEarned ? 'from-blue-600 to-blue-400 shadow-lg shadow-blue-900/50' : 'opacity-50'}`}>
                        <Shield className={`h-10 w-10 ${badgeEarned ? 'text-white' : 'text-blue-300'}`} />
                      </div>
                      <h3 className="font-semibold text-white">Fondamentaux de la Cybersécurité</h3>
                      <p className="text-xs text-blue-300 mt-1">Complétez le quiz avec au moins 2 bonnes réponses</p>
                      
                      {badgeEarned && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                        >
                          <Badge className="mt-3 bg-blue-600">Obtenu !</Badge>
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Carte de ressources supplémentaires */}
                  <Card className="bg-blue-950/60 border-blue-800/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center">
                        <BookOpen className="h-5 w-5 mr-2 text-blue-400" />
                        Ressources complémentaires
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <a href="https://www.cisa.gov/cybersecurity" target="_blank" rel="noopener noreferrer" className="block p-3 bg-blue-900/30 rounded-lg hover:bg-blue-900/50 transition-colors">
                        <div className="flex items-center">
                          <span className="text-blue-200">Guide CISA sur la cybersécurité</span>
                          <ExternalLink className="h-3 w-3 text-blue-400 ml-auto" />
                        </div>
                      </a>
                      
                      <a href="https://www.enisa.europa.eu/topics" target="_blank" rel="noopener noreferrer" className="block p-3 bg-blue-900/30 rounded-lg hover:bg-blue-900/50 transition-colors">
                        <div className="flex items-center">
                          <span className="text-blue-200">Ressources ENISA (Europe)</span>
                          <ExternalLink className="h-3 w-3 text-blue-400 ml-auto" />
                        </div>
                      </a>
                      
                      <a href="https://www.anssi.fr/publications/bonnes-pratiques" target="_blank" rel="noopener noreferrer" className="block p-3 bg-blue-900/30 rounded-lg hover:bg-blue-900/50 transition-colors">
                        <div className="flex items-center">
                          <span className="text-blue-200">Bonnes pratiques ANSSI</span>
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
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}