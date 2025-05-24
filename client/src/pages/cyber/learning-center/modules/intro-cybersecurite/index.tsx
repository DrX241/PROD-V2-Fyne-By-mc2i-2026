import React, { useState, useEffect } from 'react';
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft, Shield, Lock, Share2, Database, 
  Server, Cpu, Clock, Users, Code, FileCheck,
  ArrowRight, CheckCircle, AlertTriangle, 
  ExternalLink, Trophy, Award, Lightbulb as LightbulbIcon,
  BrainCircuit, GraduationCap, Target, List, Book, BookOpen, BookOpenCheck
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";

export default function IntroductionCybersecurite() {
  // États pour suivre la progression et les interactions
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState("principes");
  const [activeSubTab, setActiveSubTab] = useState("malware");
  const [activeProgramTab, setActiveProgramTab] = useState("section1");
  
  // États pour la gamification
  const [points, setPoints] = useState(0);
  const [badges, setBadges] = useState<string[]>([]);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [challengeCompleted, setChallengeCompleted] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiPromptInput, setAiPromptInput] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [practiceMode, setPracticeMode] = useState(false);
  const [activeScenario, setActiveScenario] = useState(0);
  const [userDecisions, setUserDecisions] = useState<Record<string, string>>({});
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
    company: "Equifax (agence de crédit américaine)",
    impact: "Exposition de données personnelles de 147 millions de personnes",
    date: "Mai à Juillet 2017",
    cause: "Vulnérabilité non corrigée dans Apache Struts (CVE-2017-5638)",
    details: "Les attaquants ont exploité une faille de sécurité connue dans le framework Apache Struts, pour laquelle un correctif était disponible depuis plus de 2 mois. Cela leur a permis d'accéder aux systèmes internes et d'extraire des données pendant plus de 76 jours sans être détectés.",
    data: "Noms, numéros de sécurité sociale, dates de naissance, adresses, et pour certains victimes, numéros de cartes de crédit et documents d'identité",
    consequences: [
      "Amende de 575 millions de dollars aux États-Unis",
      "Dédommagement des victimes pouvant atteindre 425 millions de dollars",
      "Coûts de remédiation techniques estimés à plus de 1,4 milliard de dollars",
      "Perte de confiance majeure des consommateurs",
      "Démission du PDG, du directeur de l'information et du responsable de la sécurité"
    ],
    lessons: [
      "Importance critique de la gestion des correctifs de sécurité",
      "Nécessité de la détection d'intrusion et de la surveillance continue",
      "Importance de la segmentation réseau pour limiter les mouvements latéraux",
      "Rôle crucial de l'inventaire des actifs et de la visibilité sur les systèmes"
    ]
  };
  
  // Réponses correctes au quiz
  const correctAnswers = {
    q1: "b",
    q2: "c",
    q3: "a"
  };
  
  // Fonction pour calculer le score du quiz
  const calculateQuizScore = () => {
    let score = 0;
    if (quizAnswers.q1 === correctAnswers.q1) score++;
    if (quizAnswers.q2 === correctAnswers.q2) score++;
    if (quizAnswers.q3 === correctAnswers.q3) score++;
    return score;
  };
  
  // Soumettre le quiz et afficher les résultats
  const submitQuiz = () => {
    if (!quizAnswers.q1 || !quizAnswers.q2 || !quizAnswers.q3) {
      toast({
        title: "Réponses manquantes",
        description: "Veuillez répondre à toutes les questions avant de soumettre.",
        variant: "destructive"
      });
      return;
    }
    
    const score = calculateQuizScore();
    setQuizScore(score);
    setQuizScored(true);
    setShowQuizResult(true);
    
    // Mettre à jour la progression
    if (score >= 2 && !badgeEarned) {
      setBadgeEarned(true);
      setProgress(100);
      toast({
        title: "Badge obtenu !",
        description: "Félicitations ! Vous avez obtenu le badge 'Fondamentaux de la Cybersécurité'.",
      });
    }
  };
  
  // Réinitialiser le quiz
  const resetQuiz = () => {
    setQuizAnswers({
      q1: "",
      q2: "",
      q3: ""
    });
    setQuizScored(false);
    setShowQuizResult(false);
  };
  
  // Mettre à jour les réponses du quiz
  const updateQuizAnswer = (question: string, value: string) => {
    setQuizAnswers(prev => ({
      ...prev,
      [question]: value
    }));
  };
  
  // Formater la classe de la réponse du quiz
  const getAnswerClass = (question: string, option: string) => {
    if (!showQuizResult) return "";
    
    const isSelected = quizAnswers[question as keyof typeof quizAnswers] === option;
    const isCorrect = correctAnswers[question as keyof typeof correctAnswers] === option;
    
    if (isSelected && isCorrect) return "bg-green-100 border-green-500 dark:bg-green-900/30";
    if (isSelected && !isCorrect) return "bg-red-100 border-red-500 dark:bg-red-900/30";
    if (!isSelected && isCorrect) return "bg-green-100 border-green-500 dark:bg-green-900/30";
    
    return "";
  };
  
  // Mise à jour automatique de la progression en fonction de l'onglet actif
  useEffect(() => {
    if (activeTab === "principes") setProgress(25);
    if (activeTab === "menaces") setProgress(50);
    if (activeTab === "casreel") setProgress(75);
    if (activeTab === "quiz") setProgress(quizScored ? 100 : 90);
  }, [activeTab, quizScored]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 to-blue-900 text-white">
      {/* En-tête du module */}
      <div className="bg-blue-900/50 shadow-md border-b border-blue-800/50">
        <div className="container mx-auto py-4 px-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setLocation("/cyber/learning-center")}
              className="rounded-full bg-blue-800/30 hover:bg-blue-800/50 text-blue-200"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <div>
              <h1 className="text-xl font-bold">Introduction à la Cybersécurité</h1>
              <p className="text-blue-200 text-sm">Module fondamental - Durée estimée : 30 minutes</p>
            </div>
            
            <div className="ml-auto flex items-center gap-2">
              <span className="text-sm text-blue-200">{progress}% complété</span>
              <Progress value={progress} className="w-24 bg-blue-950" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation entre les différentes parties du module */}
      <div className="bg-blue-900/20 border-b border-blue-800/40">
        <div className="container mx-auto px-4">
          <div className="w-full">
            <div className="bg-transparent h-14 justify-start border-b border-blue-800/40 flex">
              <button 
                onClick={() => setActiveTab("principes")}
                className={`px-4 h-14 ${activeTab === "principes" ? "text-white border-b-2 border-blue-500" : "text-blue-300"}`}
              >
                Principes Fondamentaux
              </button>
              <button 
                onClick={() => setActiveTab("menaces")}
                className={`px-4 h-14 ${activeTab === "menaces" ? "text-white border-b-2 border-blue-500" : "text-blue-300"}`}
              >
                Menaces Actuelles
              </button>
              <button 
                onClick={() => setActiveTab("programme")}
                className={`px-4 h-14 ${activeTab === "programme" ? "text-white border-b-2 border-blue-500" : "text-blue-300"}`}
              >
                Programme
              </button>
              <button 
                onClick={() => setActiveTab("casreel")}
                className={`px-4 h-14 ${activeTab === "casreel" ? "text-white border-b-2 border-blue-500" : "text-blue-300"}`}
              >
                Cas Concret
              </button>
              <button 
                onClick={() => setActiveTab("quiz")}
                className={`px-4 h-14 ${activeTab === "quiz" ? "text-white border-b-2 border-blue-500" : "text-blue-300"}`}
              >
                Quiz & Évaluation
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Contenu principal du module */}
      <div className="container mx-auto px-4 py-8">
        {/* Objectifs pédagogiques - Nouveau bloc */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-gradient-to-r from-blue-950/80 to-indigo-950/80 border-blue-800/50 shadow-xl mb-8">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <Target className="mr-3 h-6 w-6 text-blue-400" />
                Objectifs pédagogiques
              </h2>
              
              <p className="text-blue-200 mb-4">
                À l'issue de la formation, l'apprenant sera capable de mettre en œuvre de manière opérationnelle les principes fondamentaux, 
                les normes et les outils de la sécurité informatique.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-700/50">
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-blue-200">Détenir une vision globale de la cybersécurité et son environnement (enjeux, écosystème…)</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-blue-200">Connaître les différents référentiels, normes et outils de la cybersécurité</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-blue-200">Appréhender les métiers liés à la cybersécurité</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-700/50">
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-blue-200">Connaître les obligations juridiques liées à la cybersécurité</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-blue-200">Comprendre les principaux risques et menaces ainsi que les mesures de protection</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-blue-200">Identifier les bonnes pratiques en matière de sécurité informatique</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-4 gap-8"
        >
          {/* Section principale de contenu */}
          <div className="lg:col-span-3 space-y-8">
            {activeTab === "principes" && (
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
                          <CheckCircle className="h-5 w-5 text-blue-300 mr-2" />
                          <h4 className="font-medium text-white">Intégrité</h4>
                        </div>
                        <p className="text-sm text-blue-200">Assurer que les données restent exactes et complètes, sans modification non autorisée.</p>
                        <div className="mt-3 pt-3 border-t border-blue-700/50">
                          <p className="text-xs text-blue-300"><strong>Exemple concret :</strong> Les signatures numériques qui permettent de vérifier que des documents électroniques n'ont pas été altérés après leur signature.</p>
                        </div>
                      </div>
                      
                      <div className="bg-blue-900/40 p-4 rounded-lg border border-blue-700/50 hover:bg-blue-800/40 transition-colors">
                        <div className="flex items-center mb-2">
                          <Clock className="h-5 w-5 text-blue-300 mr-2" />
                          <h4 className="font-medium text-white">Disponibilité</h4>
                        </div>
                        <p className="text-sm text-blue-200">Garantir l'accès aux informations et ressources pour les utilisateurs autorisés quand ils en ont besoin.</p>
                        <div className="mt-3 pt-3 border-t border-blue-700/50">
                          <p className="text-xs text-blue-300"><strong>Exemple concret :</strong> Les architectures à haute disponibilité qui assurent que les services critiques restent accessibles même en cas de panne matérielle.</p>
                        </div>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-semibold text-white mt-8 mb-3">Les principes fondamentaux de défense</h3>
                    
                    <div className="space-y-4">
                      <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-700/50">
                        <h4 className="font-medium text-white mb-2 flex items-center">
                          <Users className="h-5 w-5 text-blue-300 mr-2" />
                          Défense en profondeur
                        </h4>
                        <p className="text-sm text-blue-200">
                          Consiste à mettre en place plusieurs couches de sécurité complémentaires, pour que si l'une est compromise, 
                          les autres continuent à protéger le système. C'est l'équivalent numérique d'un château avec douves, murailles, 
                          et gardes - chaque élément ajoute une couche de protection.
                        </p>
                      </div>
                      
                      <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-700/50">
                        <h4 className="font-medium text-white mb-2 flex items-center">
                          <Server className="h-5 w-5 text-blue-300 mr-2" />
                          Moindre privilège
                        </h4>
                        <p className="text-sm text-blue-200">
                          Principe selon lequel un utilisateur, un système ou une application ne doit disposer que des droits minimaux 
                          nécessaires pour accomplir ses tâches. Cela limite la surface d'attaque et réduit l'impact potentiel en cas de compromission.
                        </p>
                      </div>
                      
                      <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-700/50">
                        <h4 className="font-medium text-white mb-2 flex items-center">
                          <Cpu className="h-5 w-5 text-blue-300 mr-2" />
                          Sécurité par conception
                        </h4>
                        <p className="text-sm text-blue-200">
                          Approche qui intègre la sécurité dès la conception des systèmes et tout au long de leur cycle de vie, 
                          plutôt que de l'ajouter comme une couche supplémentaire après coup. Elle permet d'anticiper les menaces 
                          et de construire des systèmes intrinsèquement plus robustes.
                        </p>
                      </div>
                      
                      <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-700/50">
                        <h4 className="font-medium text-white mb-2 flex items-center">
                          <Share2 className="h-5 w-5 text-blue-300 mr-2" />
                          Séparation des privilèges
                        </h4>
                        <p className="text-sm text-blue-200">
                          Principe qui divise les opérations critiques en plusieurs parties, nécessitant l'intervention de 
                          différentes personnes ou systèmes pour être complétées. Cela réduit les risques d'abus de pouvoir 
                          et complique la tâche des attaquants.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {activeTab === "menaces" && (
              <Card className="bg-blue-950/50 border-blue-800/30 shadow-xl">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                    <AlertTriangle className="mr-3 h-6 w-6 text-amber-400" />
                    Panorama des menaces actuelles
                  </h2>
                  
                  <div className="prose prose-invert max-w-none">
                    <p className="text-blue-200">
                      Le paysage des menaces cybernétiques évolue constamment, avec des acteurs malveillants développant de nouvelles 
                      techniques d'attaque. Comprendre ces menaces est essentiel pour mettre en place des défenses efficaces.
                    </p>
                    
                    <div className="mt-6 mb-4">
                      <div className="flex justify-between space-x-2 border-b border-blue-800/40">
                        <button 
                          onClick={() => setActiveSubTab("malware")} 
                          className={`py-2 px-4 ${activeSubTab === "malware" ? "border-b-2 border-blue-500 text-white" : "text-blue-300"}`}
                        >
                          Malwares
                        </button>
                        <button 
                          onClick={() => setActiveSubTab("socialeng")} 
                          className={`py-2 px-4 ${activeSubTab === "socialeng" ? "border-b-2 border-blue-500 text-white" : "text-blue-300"}`}
                        >
                          Ingénierie sociale
                        </button>
                        <button 
                          onClick={() => setActiveSubTab("advanced")} 
                          className={`py-2 px-4 ${activeSubTab === "advanced" ? "border-b-2 border-blue-500 text-white" : "text-blue-300"}`}
                        >
                          Menaces avancées
                        </button>
                      </div>
                    </div>
                    
                    {activeSubTab === "malware" && (
                      <div className="space-y-4">
                        <div className="bg-amber-900/20 p-4 rounded-lg border border-amber-800/40">
                          <h4 className="font-medium text-white mb-2">Ransomware</h4>
                          <p className="text-sm text-blue-200">
                            Logiciel malveillant qui chiffre les données de la victime et exige une rançon pour les déchiffrer. 
                            Les ransomwares modernes pratiquent souvent la double extorsion : vol des données avant chiffrement, 
                            avec menace de publication si la rançon n'est pas payée.
                          </p>
                          <p className="text-xs text-amber-200 mt-2">
                            <strong>Exemples récents :</strong> REvil, DarkSide, Conti, LockBit
                          </p>
                        </div>
                        
                        <div className="bg-amber-900/20 p-4 rounded-lg border border-amber-800/40">
                          <h4 className="font-medium text-white mb-2">Malware as a Service (MaaS)</h4>
                          <p className="text-sm text-blue-200">
                            Modèle commercial où des développeurs de logiciels malveillants proposent leurs outils 
                            en location à d'autres criminels. Cela a démocratisé les cyberattaques en permettant à des 
                            acteurs peu techniques de lancer des attaques sophistiquées.
                          </p>
                        </div>
                        
                        <div className="bg-amber-900/20 p-4 rounded-lg border border-amber-800/40">
                          <h4 className="font-medium text-white mb-2">Logiciels espions (Spyware)</h4>
                          <p className="text-sm text-blue-200">
                            Programmes conçus pour collecter des informations sur un utilisateur sans son consentement. 
                            Ils peuvent enregistrer les frappes au clavier, capturer des captures d'écran, et voler des 
                            informations sensibles comme les identifiants bancaires.
                          </p>
                        </div>
                        
                        <div className="bg-amber-900/20 p-4 rounded-lg border border-amber-800/40">
                          <h4 className="font-medium text-white mb-2">Chevaux de Troie bancaires</h4>
                          <p className="text-sm text-blue-200">
                            Malwares spécifiquement conçus pour voler des informations bancaires et financières. 
                            Ils peuvent modifier l'affichage des sites web bancaires légitimes pour intercepter 
                            les identifiants ou rediriger des transactions.
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {activeSubTab === "socialeng" && (
                      <div className="space-y-4">
                        <div className="bg-amber-900/20 p-4 rounded-lg border border-amber-800/40">
                          <h4 className="font-medium text-white mb-2">Phishing sophistiqué</h4>
                          <p className="text-sm text-blue-200">
                            Les attaques de phishing sont devenues beaucoup plus ciblées et convaincantes. Le spear phishing 
                            cible des individus spécifiques avec des messages personnalisés, tandis que le whaling vise les 
                            cadres supérieurs et les PDG.
                          </p>
                          <p className="text-xs text-amber-200 mt-2">
                            <strong>Tendance actuelle :</strong> Utilisation de l'IA pour créer des messages plus convaincants et personnalisés
                          </p>
                        </div>
                        
                        <div className="bg-amber-900/20 p-4 rounded-lg border border-amber-800/40">
                          <h4 className="font-medium text-white mb-2">Compromission des emails professionnels (BEC)</h4>
                          <p className="text-sm text-blue-200">
                            Attaques où les criminels se font passer pour des cadres ou des partenaires commerciaux 
                            pour demander des transferts d'argent ou des informations sensibles. Ces attaques exploitent 
                            la confiance et les processus d'entreprise plutôt que des vulnérabilités techniques.
                          </p>
                        </div>
                        
                        <div className="bg-amber-900/20 p-4 rounded-lg border border-amber-800/40">
                          <h4 className="font-medium text-white mb-2">Deepfakes et manipulation médiatique</h4>
                          <p className="text-sm text-blue-200">
                            L'intelligence artificielle permet désormais de créer des vidéos et des enregistrements audio 
                            falsifiés très convaincants. Ces technologies sont de plus en plus utilisées dans des attaques 
                            d'ingénierie sociale, comme simuler des appels de dirigeants pour autoriser des transactions.
                          </p>
                        </div>
                        
                        <div className="bg-amber-900/20 p-4 rounded-lg border border-amber-800/40">
                          <h4 className="font-medium text-white mb-2">Attaques via les réseaux sociaux</h4>
                          <p className="text-sm text-blue-200">
                            Les attaquants exploitent les informations partagées sur les réseaux sociaux pour mener des 
                            attaques personnalisées. Ils peuvent également créer de faux profils pour établir des relations 
                            avec des employés ciblés et les manipuler.
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {activeSubTab === "advanced" && (
                      <div className="space-y-4">
                        <div className="bg-amber-900/20 p-4 rounded-lg border border-amber-800/40">
                          <h4 className="font-medium text-white mb-2">Attaques sur la chaîne d'approvisionnement</h4>
                          <p className="text-sm text-blue-200">
                            Les attaquants compromettent des fournisseurs ou des produits logiciels de confiance pour 
                            atteindre leurs cibles finales. L'attaque SolarWinds de 2020 est un exemple emblématique, 
                            où des acteurs malveillants ont inséré du code malveillant dans les mises à jour d'un logiciel 
                            utilisé par des milliers d'organisations.
                          </p>
                        </div>
                        
                        <div className="bg-amber-900/20 p-4 rounded-lg border border-amber-800/40">
                          <h4 className="font-medium text-white mb-2">Menaces persistantes avancées (APT)</h4>
                          <p className="text-sm text-blue-200">
                            Campagnes d'attaques sur le long terme, généralement menées par des groupes soutenus par des États. 
                            Ces attaques sont caractérisées par leur sophistication technique, leur discrétion et leur persistance. 
                            Elles visent généralement l'espionnage, le vol de propriété intellectuelle ou le sabotage.
                          </p>
                        </div>
                        
                        <div className="bg-amber-900/20 p-4 rounded-lg border border-amber-800/40">
                          <h4 className="font-medium text-white mb-2">Attaques contre les infrastructures critiques</h4>
                          <p className="text-sm text-blue-200">
                            Ciblage des systèmes industriels et des infrastructures essentielles comme l'énergie, l'eau, 
                            les transports ou la santé. Ces attaques peuvent avoir des conséquences graves dans le monde réel, 
                            comme l'a montré l'attaque contre Colonial Pipeline en 2021, qui a perturbé l'approvisionnement 
                            en carburant aux États-Unis.
                          </p>
                        </div>
                        
                        <div className="bg-amber-900/20 p-4 rounded-lg border border-amber-800/40">
                          <h4 className="font-medium text-white mb-2">Attaques par l'IA et automatisées</h4>
                          <p className="text-sm text-blue-200">
                            L'intelligence artificielle et l'automatisation sont de plus en plus utilisées pour identifier 
                            les vulnérabilités, personnaliser les attaques et contourner les défenses. Ces technologies 
                            permettent des attaques plus rapides, plus précises et à plus grande échelle.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {activeTab === "casreel" && (
              <Card className="bg-blue-950/50 border-blue-800/30 shadow-xl">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                    <Database className="mr-3 h-6 w-6 text-red-400" />
                    {caseStudy.title}
                  </h2>
                  
                  <div className="prose prose-invert max-w-none">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-700/50">
                        <h4 className="font-medium text-white mb-2">Organisation touchée</h4>
                        <p className="text-sm text-blue-200">{caseStudy.company}</p>
                      </div>
                      
                      <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-700/50">
                        <h4 className="font-medium text-white mb-2">Impact global</h4>
                        <p className="text-sm text-blue-200">{caseStudy.impact}</p>
                      </div>
                      
                      <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-700/50">
                        <h4 className="font-medium text-white mb-2">Période de l'incident</h4>
                        <p className="text-sm text-blue-200">{caseStudy.date}</p>
                      </div>
                      
                      <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-700/50">
                        <h4 className="font-medium text-white mb-2">Cause principale</h4>
                        <p className="text-sm text-blue-200">{caseStudy.cause}</p>
                      </div>
                    </div>
                    
                    <div className="bg-red-900/20 p-4 rounded-lg border border-red-800/40 mb-6">
                      <h4 className="font-medium text-white mb-2">Description détaillée</h4>
                      <p className="text-sm text-blue-200">{caseStudy.details}</p>
                      <p className="text-sm mt-2 text-blue-200"><strong>Données compromises :</strong> {caseStudy.data}</p>
                    </div>
                    
                    <div className={`overflow-hidden transition-all duration-500 ${caseStudyExpanded ? "max-h-[1000px]" : "max-h-0"}`}>
                      <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-700/50 mb-6">
                        <h4 className="font-medium text-white mb-2">Conséquences</h4>
                        <ul className="text-sm text-blue-200 space-y-1 list-disc pl-5">
                          {caseStudy.consequences.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="bg-green-900/20 p-4 rounded-lg border border-green-800/40">
                        <h4 className="font-medium text-white mb-2">Leçons à retenir</h4>
                        <ul className="text-sm text-blue-200 space-y-1 list-disc pl-5">
                          {caseStudy.lessons.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="text-center mt-4">
                      <Button
                        variant="outline"
                        onClick={() => setCaseStudyExpanded(!caseStudyExpanded)}
                        className="text-blue-300 border-blue-800/50 hover:bg-blue-800/30"
                      >
                        {caseStudyExpanded ? "Réduire les détails" : "Voir tous les détails"}
                        <ArrowRight className={`ml-2 h-4 w-4 transition-transform ${caseStudyExpanded ? "rotate-90" : ""}`} />
                      </Button>
                    </div>
                  </div>
                  
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-8 bg-blue-900/20 p-4 rounded-lg border border-blue-700/50"
                  >
                    <h3 className="text-lg font-semibold text-white">Points clés à retenir</h3>
                    <ul className="mt-2 space-y-2">
                      <li className="flex items-start">
                        <span className="bg-blue-500/20 p-1 rounded-full mr-2 mt-0.5">
                          <CheckCircle className="h-4 w-4 text-blue-400" />
                        </span>
                        <span className="text-sm text-blue-200">Les vulnérabilités non corrigées représentent un risque majeur, même pour les grandes entreprises.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-blue-500/20 p-1 rounded-full mr-2 mt-0.5">
                          <CheckCircle className="h-4 w-4 text-blue-400" />
                        </span>
                        <span className="text-sm text-blue-200">La détection des intrusions est aussi importante que la prévention, car les attaquants peuvent opérer pendant des mois sans être repérés.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-blue-500/20 p-1 rounded-full mr-2 mt-0.5">
                          <CheckCircle className="h-4 w-4 text-blue-400" />
                        </span>
                        <span className="text-sm text-blue-200">Les conséquences d'une brèche majeure vont bien au-delà des coûts techniques, affectant la réputation, la confiance des clients et même le leadership de l'entreprise.</span>
                      </li>
                    </ul>
                  </motion.div>
                </CardContent>
              </Card>
            )}
            
            {activeTab === "programme" && (
              <Card className="bg-blue-950/50 border-blue-800/30 shadow-xl">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                    <BookOpenCheck className="mr-3 h-6 w-6 text-green-400" />
                    Programme détaillé de la formation
                  </h2>
                  
                  <div className="prose prose-invert max-w-none">
                    <p className="text-blue-200 mb-6">
                      Ce programme complet vous permettra d'acquérir les compétences nécessaires pour comprendre et appliquer 
                      les principes fondamentaux de la cybersécurité dans un contexte professionnel.
                    </p>
                    
                    <div className="mt-6 mb-4">
                      <div className="flex flex-wrap border-b border-blue-800/40">
                        <button 
                          onClick={() => setActiveProgramTab("section1")} 
                          className={`py-2 px-4 ${activeProgramTab === "section1" ? "border-b-2 border-blue-500 text-white" : "text-blue-300"}`}
                        >
                          Menaces et risques
                        </button>
                        <button 
                          onClick={() => setActiveProgramTab("section2")} 
                          className={`py-2 px-4 ${activeProgramTab === "section2" ? "border-b-2 border-blue-500 text-white" : "text-blue-300"}`}
                        >
                          Sécurité poste de travail
                        </button>
                        <button 
                          onClick={() => setActiveProgramTab("section3")} 
                          className={`py-2 px-4 ${activeProgramTab === "section3" ? "border-b-2 border-blue-500 text-white" : "text-blue-300"}`}
                        >
                          Authentification
                        </button>
                        <button 
                          onClick={() => setActiveProgramTab("section4")} 
                          className={`py-2 px-4 ${activeProgramTab === "section4" ? "border-b-2 border-blue-500 text-white" : "text-blue-300"}`}
                        >
                          Audits de sécurité
                        </button>
                        <button 
                          onClick={() => setActiveProgramTab("section5")} 
                          className={`py-2 px-4 ${activeProgramTab === "section5" ? "border-b-2 border-blue-500 text-white" : "text-blue-300"}`}
                        >
                          PCA / PRA
                        </button>
                      </div>
                    </div>
                    
                    {activeProgramTab === "section1" && (
                      <div className="space-y-4">
                        <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-700/50">
                          <h3 className="text-xl font-semibold text-white mb-2">1. Les menaces et les risques</h3>
                          <ul className="space-y-2 text-blue-200">
                            <li className="flex items-start">
                              <div className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0 flex items-center justify-center">•</div>
                              <span>Qu'est-ce la sécurité informatique ?</span>
                            </li>
                            <li className="flex items-start">
                              <div className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0 flex items-center justify-center">•</div>
                              <span>Comment une négligence peut-elle créer une catastrophe ?</span>
                            </li>
                            <li className="flex items-start">
                              <div className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0 flex items-center justify-center">•</div>
                              <span>Les responsabilités de chacun</span>
                            </li>
                            <li className="flex items-start">
                              <div className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0 flex items-center justify-center">•</div>
                              <span>L'architecture d'un SI et ses vulnérabilités potentielles</span>
                            </li>
                            <li className="flex items-start">
                              <div className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0 flex items-center justify-center">•</div>
                              <span>Les réseaux d'entreprise (locaux, distantes, Internet)</span>
                            </li>
                            <li className="flex items-start">
                              <div className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0 flex items-center justify-center">•</div>
                              <span>Les réseaux sans fil et mobilité. Les applications à risques : Web, messagerie...</span>
                            </li>
                            <li className="flex items-start">
                              <div className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0 flex items-center justify-center">•</div>
                              <span>La base de données et système de fichiers. Menaces et risques.</span>
                            </li>
                            <li className="flex items-start">
                              <div className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0 flex items-center justify-center">•</div>
                              <span>La sociologie des pirates. Réseaux souterrains. Motivations.</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    )}
                    
                    {activeProgramTab === "section2" && (
                      <div className="space-y-4">
                        <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-700/50">
                          <h3 className="text-xl font-semibold text-white mb-2">2. La sécurité du poste de travail</h3>
                          <ul className="space-y-2 text-blue-200">
                            <li className="flex items-start">
                              <div className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0 flex items-center justify-center">•</div>
                              <span>La confidentialité, la signature et l'intégrité. Les contraintes liées au chiffrement.</span>
                            </li>
                            <li className="flex items-start">
                              <div className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0 flex items-center justify-center">•</div>
                              <span>Les différents éléments cryptographiques. Windows, Linux ou MAC OS : quel est le plus sûr ?</span>
                            </li>
                            <li className="flex items-start">
                              <div className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0 flex items-center justify-center">•</div>
                              <span>Gestion des données sensibles. La problématique des ordinateurs portables.</span>
                            </li>
                            <li className="flex items-start">
                              <div className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0 flex items-center justify-center">•</div>
                              <span>Les différentes menaces sur le poste client ? Comprendre ce qu'est un code malveillant.</span>
                            </li>
                            <li className="flex items-start">
                              <div className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0 flex items-center justify-center">•</div>
                              <span>Comment gérer les failles de sécurité ?</span>
                            </li>
                            <li className="flex items-start">
                              <div className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0 flex items-center justify-center">•</div>
                              <span>Les ports USB. Le rôle du firewall client.</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    )}
                    
                    {activeProgramTab === "section3" && (
                      <div className="space-y-4">
                        <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-700/50">
                          <h3 className="text-xl font-semibold text-white mb-2">3. Le processus d'authentification</h3>
                          <ul className="space-y-2 text-blue-200">
                            <li className="flex items-start">
                              <div className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0 flex items-center justify-center">•</div>
                              <span>Les contrôles d'accès : l'authentification et l'autorisation.</span>
                            </li>
                            <li className="flex items-start">
                              <div className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0 flex items-center justify-center">•</div>
                              <span>L'importance de l'authentification.</span>
                            </li>
                            <li className="flex items-start">
                              <div className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0 flex items-center justify-center">•</div>
                              <span>Le mot de passe traditionnel.</span>
                            </li>
                            <li className="flex items-start">
                              <div className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0 flex items-center justify-center">•</div>
                              <span>L'authentification par certificats et par token.</span>
                            </li>
                            <li className="flex items-start">
                              <div className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0 flex items-center justify-center">•</div>
                              <span>La connexion à distance via Internet.</span>
                            </li>
                            <li className="flex items-start">
                              <div className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0 flex items-center justify-center">•</div>
                              <span>Qu'est-ce qu'un VPN ?</span>
                            </li>
                            <li className="flex items-start">
                              <div className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0 flex items-center justify-center">•</div>
                              <span>Pourquoi utiliser une authentification renforcée.</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    )}
                    
                    {activeProgramTab === "section4" && (
                      <div className="space-y-4">
                        <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-700/50">
                          <h3 className="text-xl font-semibold text-white mb-2">4. Le processus d'un audit de sécurité</h3>
                          <ul className="space-y-2 text-blue-200">
                            <li className="flex items-start">
                              <div className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0 flex items-center justify-center">•</div>
                              <span>Processus continu et complet.</span>
                            </li>
                            <li className="flex items-start">
                              <div className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0 flex items-center justify-center">•</div>
                              <span>Les catégories d'audits, de l'audit organisationnel au test d'intrusion.</span>
                            </li>
                            <li className="flex items-start">
                              <div className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0 flex items-center justify-center">•</div>
                              <span>Les bonnes pratiques de la norme 19011 appliquées à la sécurité.</span>
                            </li>
                            <li className="flex items-start">
                              <div className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0 flex items-center justify-center">•</div>
                              <span>Comment créer son programme d'audit interne ? Comment qualifier ses auditeurs ?</span>
                            </li>
                            <li className="flex items-start">
                              <div className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0 flex items-center justify-center">•</div>
                              <span>Apports comparés, démarche récursive, les implications humaines.</span>
                            </li>
                            <li className="flex items-start">
                              <div className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0 flex items-center justify-center">•</div>
                              <span>Sensibilisation à la sécurité : qui ? Quoi ? Comment ?</span>
                            </li>
                            <li className="flex items-start">
                              <div className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0 flex items-center justify-center">•</div>
                              <span>Définitions de Morale/Déontologie/Ethique.</span>
                            </li>
                            <li className="flex items-start">
                              <div className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0 flex items-center justify-center">•</div>
                              <span>La charte de sécurité, son existence légale, son contenu, sa validation.</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    )}
                    
                    {activeProgramTab === "section5" && (
                      <div className="space-y-4">
                        <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-700/50">
                          <h3 className="text-xl font-semibold text-white mb-2">5. Le plan de secours et le coût de la sécurité</h3>
                          <ul className="space-y-2 text-blue-200">
                            <li className="flex items-start">
                              <div className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0 flex items-center justify-center">•</div>
                              <span>La couverture des risques et la stratégie de continuité.</span>
                            </li>
                            <li className="flex items-start">
                              <div className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0 flex items-center justify-center">•</div>
                              <span>L'importance des plans de secours, de continuité, de reprise et de gestion de crise, PCA/PRA, PSI, RTO/RPO.</span>
                            </li>
                            <li className="flex items-start">
                              <div className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0 flex items-center justify-center">•</div>
                              <span>Développer un plan de continuité, l'insérer dans une démarche qualité.</span>
                            </li>
                            <li className="flex items-start">
                              <div className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0 flex items-center justify-center">•</div>
                              <span>Comment définir les budgets sécurité.</span>
                            </li>
                            <li className="flex items-start">
                              <div className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0 flex items-center justify-center">•</div>
                              <span>La définition du Return On Security Investment (ROSI).</span>
                            </li>
                            <li className="flex items-start">
                              <div className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0 flex items-center justify-center">•</div>
                              <span>Quelles sont les techniques d'évaluation des coûts, les différentes méthodes de calcul, Total Cost of Ownership (TCO).</span>
                            </li>
                            <li className="flex items-start">
                              <div className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0 flex items-center justify-center">•</div>
                              <span>La notion anglo-saxonne du "Payback Period".</span>
                            </li>
                          </ul>
                        </div>
                        
                        <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-700/50 mt-6">
                          <div className="flex items-center gap-2 mb-2">
                            <Book className="h-5 w-5 text-green-400" />
                            <h4 className="text-lg font-semibold text-white">Modules avancés disponibles</h4>
                          </div>
                          <p className="text-blue-200 text-sm mb-3">
                            Des modules complémentaires sont disponibles pour approfondir vos connaissances sur des sujets plus avancés :
                          </p>
                          <ul className="space-y-1 text-blue-200 text-sm">
                            <li>• Le pare-feu, la virtualisation et le Cloud Computing</li>
                            <li>• La supervision de la sécurité</li>
                            <li>• Les attaques Web</li>
                            <li>• Détecter les intrusions</li>
                            <li>• La collecte des informations</li>
                          </ul>
                        </div>
                      </div>
                    )}
                    
                    <div className="bg-indigo-900/30 p-4 rounded-lg border border-indigo-700/50 mt-8">
                      <h3 className="font-medium text-white mb-2 flex items-center">
                        <GraduationCap className="h-5 w-5 text-indigo-400 mr-2" />
                        Informations pratiques
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="bg-indigo-950/50 p-3 rounded border border-indigo-700/30">
                          <p className="text-indigo-300 font-medium">Durée totale</p>
                          <p className="text-white">5 jours (35 heures)</p>
                        </div>
                        <div className="bg-indigo-950/50 p-3 rounded border border-indigo-700/30">
                          <p className="text-indigo-300 font-medium">Méthodes pédagogiques</p>
                          <p className="text-white">Interactives, cas pratiques</p>
                        </div>
                        <div className="bg-indigo-950/50 p-3 rounded border border-indigo-700/30">
                          <p className="text-indigo-300 font-medium">Évaluation</p>
                          <p className="text-white">Quiz et travaux pratiques</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {activeTab === "quiz" && (
              <Card className="bg-blue-950/50 border-blue-800/30 shadow-xl">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                    <Code className="mr-3 h-6 w-6 text-purple-400" />
                    Quiz : Testez vos connaissances
                  </h2>
                  
                  <div className="prose prose-invert max-w-none">
                    <p className="text-blue-200 mb-6">
                      Vérifiez votre compréhension des concepts fondamentaux de la cybersécurité. 
                      Répondez aux questions suivantes pour valider vos acquis.
                    </p>
                    
                    <div className="space-y-6">
                      <div className={`p-4 rounded-lg border ${showQuizResult && quizAnswers.q1 === correctAnswers.q1 ? "bg-green-900/20 border-green-800/50" : showQuizResult && quizAnswers.q1 !== correctAnswers.q1 ? "bg-red-900/20 border-red-800/50" : "bg-blue-900/20 border-blue-800/50"}`}>
                        <h4 className="font-medium text-white mb-2">Question 1</h4>
                        <p className="text-sm text-blue-200 mb-3">Quel principe de cybersécurité vise à assurer que les données sont exactes et n'ont pas été modifiées de façon non autorisée ?</p>
                        
                        <RadioGroup value={quizAnswers.q1} onValueChange={(value) => updateQuizAnswer("q1", value)} className="space-y-3">
                          <div className={`flex items-center space-x-2 p-2 rounded ${getAnswerClass("q1", "a")}`}>
                            <RadioGroupItem value="a" id="q1-a" disabled={showQuizResult} />
                            <Label htmlFor="q1-a" className="text-sm cursor-pointer">Confidentialité</Label>
                          </div>
                          <div className={`flex items-center space-x-2 p-2 rounded ${getAnswerClass("q1", "b")}`}>
                            <RadioGroupItem value="b" id="q1-b" disabled={showQuizResult} />
                            <Label htmlFor="q1-b" className="text-sm cursor-pointer">Intégrité</Label>
                          </div>
                          <div className={`flex items-center space-x-2 p-2 rounded ${getAnswerClass("q1", "c")}`}>
                            <RadioGroupItem value="c" id="q1-c" disabled={showQuizResult} />
                            <Label htmlFor="q1-c" className="text-sm cursor-pointer">Disponibilité</Label>
                          </div>
                        </RadioGroup>
                        
                        {showQuizResult && quizAnswers.q1 !== correctAnswers.q1 && (
                          <div className="mt-3 p-2 bg-blue-900/30 rounded text-xs text-blue-200">
                            <strong>Explication :</strong> L'intégrité est le principe qui assure que les données restent exactes et complètes, sans modification non autorisée.
                          </div>
                        )}
                      </div>
                      
                      <div className={`p-4 rounded-lg border ${showQuizResult && quizAnswers.q2 === correctAnswers.q2 ? "bg-green-900/20 border-green-800/50" : showQuizResult && quizAnswers.q2 !== correctAnswers.q2 ? "bg-red-900/20 border-red-800/50" : "bg-blue-900/20 border-blue-800/50"}`}>
                        <h4 className="font-medium text-white mb-2">Question 2</h4>
                        <p className="text-sm text-blue-200 mb-3">Quelle approche de sécurité consiste à mettre en place plusieurs couches de protection complémentaires ?</p>
                        
                        <RadioGroup value={quizAnswers.q2} onValueChange={(value) => updateQuizAnswer("q2", value)} className="space-y-3">
                          <div className={`flex items-center space-x-2 p-2 rounded ${getAnswerClass("q2", "a")}`}>
                            <RadioGroupItem value="a" id="q2-a" disabled={showQuizResult} />
                            <Label htmlFor="q2-a" className="text-sm cursor-pointer">Principe du moindre privilège</Label>
                          </div>
                          <div className={`flex items-center space-x-2 p-2 rounded ${getAnswerClass("q2", "b")}`}>
                            <RadioGroupItem value="b" id="q2-b" disabled={showQuizResult} />
                            <Label htmlFor="q2-b" className="text-sm cursor-pointer">Sécurité par l'obscurité</Label>
                          </div>
                          <div className={`flex items-center space-x-2 p-2 rounded ${getAnswerClass("q2", "c")}`}>
                            <RadioGroupItem value="c" id="q2-c" disabled={showQuizResult} />
                            <Label htmlFor="q2-c" className="text-sm cursor-pointer">Défense en profondeur</Label>
                          </div>
                        </RadioGroup>
                        
                        {showQuizResult && quizAnswers.q2 !== correctAnswers.q2 && (
                          <div className="mt-3 p-2 bg-blue-900/30 rounded text-xs text-blue-200">
                            <strong>Explication :</strong> La défense en profondeur consiste à mettre en place plusieurs couches de sécurité complémentaires, pour que si l'une est compromise, les autres continuent à protéger le système.
                          </div>
                        )}
                      </div>
                      
                      <div className={`p-4 rounded-lg border ${showQuizResult && quizAnswers.q3 === correctAnswers.q3 ? "bg-green-900/20 border-green-800/50" : showQuizResult && quizAnswers.q3 !== correctAnswers.q3 ? "bg-red-900/20 border-red-800/50" : "bg-blue-900/20 border-blue-800/50"}`}>
                        <h4 className="font-medium text-white mb-2">Question 3</h4>
                        <p className="text-sm text-blue-200 mb-3">Quel type de logiciel malveillant chiffre les données de la victime et exige une rançon pour les déchiffrer ?</p>
                        
                        <RadioGroup value={quizAnswers.q3} onValueChange={(value) => updateQuizAnswer("q3", value)} className="space-y-3">
                          <div className={`flex items-center space-x-2 p-2 rounded ${getAnswerClass("q3", "a")}`}>
                            <RadioGroupItem value="a" id="q3-a" disabled={showQuizResult} />
                            <Label htmlFor="q3-a" className="text-sm cursor-pointer">Ransomware</Label>
                          </div>
                          <div className={`flex items-center space-x-2 p-2 rounded ${getAnswerClass("q3", "b")}`}>
                            <RadioGroupItem value="b" id="q3-b" disabled={showQuizResult} />
                            <Label htmlFor="q3-b" className="text-sm cursor-pointer">Spyware</Label>
                          </div>
                          <div className={`flex items-center space-x-2 p-2 rounded ${getAnswerClass("q3", "c")}`}>
                            <RadioGroupItem value="c" id="q3-c" disabled={showQuizResult} />
                            <Label htmlFor="q3-c" className="text-sm cursor-pointer">Cheval de Troie</Label>
                          </div>
                        </RadioGroup>
                        
                        {showQuizResult && quizAnswers.q3 !== correctAnswers.q3 && (
                          <div className="mt-3 p-2 bg-blue-900/30 rounded text-xs text-blue-200">
                            <strong>Explication :</strong> Un ransomware est un logiciel malveillant qui chiffre les données de la victime et exige une rançon pour fournir la clé de déchiffrement.
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-8 flex justify-center">
                      {!showQuizResult ? (
                        <Button 
                          onClick={submitQuiz}
                          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                        >
                          Valider mes réponses
                        </Button>
                      ) : (
                        <div className="text-center">
                          <div className="mb-4">
                            <h3 className="text-xl font-bold text-white">
                              {quizScore === 3 ? "Excellent !" : quizScore === 2 ? "Bon travail !" : "Continuez vos efforts !"}
                            </h3>
                            <p className="text-blue-200 mt-1">
                              Vous avez obtenu {quizScore}/3 bonnes réponses.
                            </p>
                          </div>
                          
                          {badgeEarned && (
                            <div className="mb-4 bg-blue-800/30 p-4 rounded-lg border border-blue-700/50 flex items-center justify-center flex-col">
                              <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white mb-2 px-3 py-1">
                                <CheckCircle className="mr-1 h-3 w-3" /> Badge obtenu !
                              </Badge>
                              <p className="text-sm text-blue-200">
                                Félicitations ! Vous avez débloqué le badge "Fondamentaux de la Cybersécurité".
                              </p>
                            </div>
                          )}
                          
                          <Button 
                            onClick={resetQuiz} 
                            variant="outline"
                            className="text-blue-300 border-blue-800/50 hover:bg-blue-800/30"
                          >
                            Réessayer le quiz
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Sidebar avec ressources et progression */}
          <div className="lg:col-span-1">
            <div className="space-y-4 sticky top-4">
              <Card className="bg-blue-950/50 border-blue-800/30 shadow-xl">
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-3">Votre progression</h3>
                  <Progress value={progress} className="h-2 mb-2" />
                  <p className="text-sm text-blue-300">{progress}% complété</p>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${activeTab === "principes" || progress >= 25 ? "bg-blue-500" : "bg-blue-900/50 border border-blue-800"}`}>
                        {progress >= 25 && <CheckCircle className="w-3 h-3 text-white" />}
                      </div>
                      <div className="ml-2 text-sm text-blue-200">Principes fondamentaux</div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${activeTab === "menaces" || progress >= 50 ? "bg-blue-500" : "bg-blue-900/50 border border-blue-800"}`}>
                        {progress >= 50 && <CheckCircle className="w-3 h-3 text-white" />}
                      </div>
                      <div className="ml-2 text-sm text-blue-200">Menaces actuelles</div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${activeTab === "casreel" || progress >= 75 ? "bg-blue-500" : "bg-blue-900/50 border border-blue-800"}`}>
                        {progress >= 75 && <CheckCircle className="w-3 h-3 text-white" />}
                      </div>
                      <div className="ml-2 text-sm text-blue-200">Étude de cas</div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${activeTab === "quiz" || progress >= 90 ? "bg-blue-500" : "bg-blue-900/50 border border-blue-800"}`}>
                        {progress >= 100 && <CheckCircle className="w-3 h-3 text-white" />}
                      </div>
                      <div className="ml-2 text-sm text-blue-200">Quiz d'évaluation</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-blue-950/50 border-blue-800/30 shadow-xl">
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-3">Ressources complémentaires</h3>
                  
                  <div className="space-y-3">
                    <Button variant="ghost" className="w-full justify-start text-blue-300 hover:text-white hover:bg-blue-800/30">
                      <ArrowRight className="mr-2 h-4 w-4" />
                      <span className="text-sm">Guide des bonnes pratiques</span>
                    </Button>
                    
                    <Button variant="ghost" className="w-full justify-start text-blue-300 hover:text-white hover:bg-blue-800/30">
                      <ArrowRight className="mr-2 h-4 w-4" />
                      <span className="text-sm">Glossaire cybersécurité</span>
                    </Button>
                    
                    <Button variant="ghost" className="w-full justify-start text-blue-300 hover:text-white hover:bg-blue-800/30">
                      <ArrowRight className="mr-2 h-4 w-4" />
                      <span className="text-sm">Formation approfondie</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}