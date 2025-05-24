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
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, Shield, Lock, Share2, Database, 
  Server, Cpu, Clock, Users, Code, FileCheck,
  ArrowRight, CheckCircle, AlertTriangle, 
  ExternalLink, Trophy, Award, Lightbulb as LightbulbIcon,
  BrainCircuit, GraduationCap, Brain, Sparkles, 
  MessageCircle, Monitor, Zap, Target, Info,
  Flame, Star, Eye, BookOpen, Mail, LinkIcon,
  FileText
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";

export default function IntroductionCybersecurite() {
  // États pour suivre la progression et les interactions
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState("principes");
  const [activeSubTab, setActiveSubTab] = useState("malware");
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({
    q1: "",
    q2: "",
    q3: "",
    q4: "",
    q5: ""
  });
  const [quizScored, setQuizScored] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [caseStudyExpanded, setCaseStudyExpanded] = useState(false);
  const [badgeEarned, setBadgeEarned] = useState(false);
  const [, setLocation] = useLocation();
  
  // États pour les fonctionnalités interactives
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  const [completedInteractions, setCompletedInteractions] = useState<string[]>([]);
  const [showInteractiveExercise, setShowInteractiveExercise] = useState(false);
  const [exerciseData, setExerciseData] = useState({
    passwordStrength: "",
    passwordFeedback: "",
    phishingDetected: false
  });
  
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
    q3: "a",
    q4: "b",
    q5: "c"
  };
  
  // Fonction pour calculer le score du quiz
  const calculateQuizScore = () => {
    let score = 0;
    if (quizAnswers.q1 === correctAnswers.q1) score++;
    if (quizAnswers.q2 === correctAnswers.q2) score++;
    if (quizAnswers.q3 === correctAnswers.q3) score++;
    if (quizAnswers.q4 === correctAnswers.q4) score++;
    if (quizAnswers.q5 === correctAnswers.q5) score++;
    return score;
  };
  
  // Fonction pour évaluer la force d'un mot de passe
  const evaluatePasswordStrength = (password: string) => {
    if (!password) return { strength: "", feedback: "" };
    
    let strength = "";
    let feedback = "";
    
    // Vérifier les critères de sécurité
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[^a-zA-Z0-9]/.test(password);
    const isLongEnough = password.length >= 12;
    
    // Déterminer la force
    if (isLongEnough && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChars) {
      strength = "fort";
      feedback = "Excellent ! Ce mot de passe est difficile à deviner et à cracker.";
      
      // Ajouter des points si c'est la première fois
      if (!completedInteractions.includes('password-exercise')) {
        setUserPoints(prev => prev + 15);
        setCompletedInteractions(prev => [...prev, 'password-exercise']);
      }
    } else if (password.length >= 8 && 
              ((hasUpperCase && hasLowerCase && hasNumbers) || 
               (hasLowerCase && hasNumbers && hasSpecialChars) || 
               (hasUpperCase && hasLowerCase && hasSpecialChars))) {
      strength = "moyen";
      feedback = "Pas mal, mais pourrait être amélioré. Essayez d'ajouter plus de caractères et de la complexité.";
    } else {
      strength = "faible";
      feedback = "Ce mot de passe est trop faible. Utilisez au moins 12 caractères avec des majuscules, minuscules, chiffres et caractères spéciaux.";
    }
    
    return { strength, feedback };
  };
  
  // Fonction pour générer une réponse IA via Azure OpenAI
  const generateAIResponse = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsGeneratingAI(true);
    
    try {
      // Appel à l'API backend qui communique avec Azure OpenAI
      const response = await fetch('/api/openai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `Tu es un assistant expert en cybersécurité, fournissant des explications claires et précises sur des concepts de sécurité informatique.
              Tes réponses doivent être adaptées à des débutants tout en restant techniquement correctes.
              Organise tes réponses avec des puces ou des paragraphes courts pour faciliter la lecture.
              Limite ta réponse à 200 mots maximum.`
            },
            {
              role: 'user',
              content: aiPrompt
            }
          ],
          temperature: 0.7,
          max_tokens: 800
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Récupérer la réponse de l'API
      const aiContent = data.choices?.[0]?.message?.content || 
                        "Je ne peux pas répondre à cette question actuellement. Veuillez réessayer avec une autre question.";
      
      setAiResponse(aiContent);
      
      // Ajouter des points pour l'utilisation de l'assistant IA
      if (!completedInteractions.includes('ai-assistant')) {
        setUserPoints(prev => prev + 10);
        setCompletedInteractions(prev => [...prev, 'ai-assistant']);
      }
    } catch (error) {
      console.error("Erreur lors de l'appel à l'API OpenAI:", error);
      setAiResponse("Désolé, je n'ai pas pu générer une réponse. Cela peut être dû à un problème de connexion avec le service IA. Veuillez réessayer plus tard.");
      
      toast({
        title: "Erreur de connexion",
        description: "Impossible de contacter l'assistant IA. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingAI(false);
    }
  };
  
  // Soumettre le quiz et afficher les résultats
  const submitQuiz = () => {
    if (!quizAnswers.q1 || !quizAnswers.q2 || !quizAnswers.q3 || !quizAnswers.q4 || !quizAnswers.q5) {
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
    if (score >= 4 && !badgeEarned) {
      setBadgeEarned(true);
      setProgress(100);
      
      // Ajouter des points pour la réussite du quiz
      if (!completedInteractions.includes('quiz-completed')) {
        setUserPoints(prev => prev + 25);
        setCompletedInteractions(prev => [...prev, 'quiz-completed']);
      }
      
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
      q3: "",
      q4: "",
      q5: ""
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
                      
                      <div className={`p-4 rounded-lg border ${showQuizResult && quizAnswers.q4 === correctAnswers.q4 ? "bg-green-900/20 border-green-800/50" : showQuizResult && quizAnswers.q4 !== correctAnswers.q4 ? "bg-red-900/20 border-red-800/50" : "bg-blue-900/20 border-blue-800/50"}`}>
                        <h4 className="font-medium text-white mb-2">Question 4</h4>
                        <p className="text-sm text-blue-200 mb-3">Quelle technique d'attaque implique de se faire passer pour une entité légitime afin d'obtenir des informations sensibles ?</p>
                        
                        <RadioGroup value={quizAnswers.q4} onValueChange={(value) => updateQuizAnswer("q4", value)} className="space-y-3">
                          <div className={`flex items-center space-x-2 p-2 rounded ${getAnswerClass("q4", "a")}`}>
                            <RadioGroupItem value="a" id="q4-a" disabled={showQuizResult} />
                            <Label htmlFor="q4-a" className="text-sm cursor-pointer">Attaque par force brute</Label>
                          </div>
                          <div className={`flex items-center space-x-2 p-2 rounded ${getAnswerClass("q4", "b")}`}>
                            <RadioGroupItem value="b" id="q4-b" disabled={showQuizResult} />
                            <Label htmlFor="q4-b" className="text-sm cursor-pointer">Phishing</Label>
                          </div>
                          <div className={`flex items-center space-x-2 p-2 rounded ${getAnswerClass("q4", "c")}`}>
                            <RadioGroupItem value="c" id="q4-c" disabled={showQuizResult} />
                            <Label htmlFor="q4-c" className="text-sm cursor-pointer">Attaque par déni de service</Label>
                          </div>
                        </RadioGroup>
                        
                        {showQuizResult && quizAnswers.q4 !== correctAnswers.q4 && (
                          <div className="mt-3 p-2 bg-blue-900/30 rounded text-xs text-blue-200">
                            <strong>Explication :</strong> Le phishing est une technique d'ingénierie sociale où les attaquants se font passer pour des entités légitimes (banques, services en ligne, etc.) afin d'inciter les victimes à divulguer des informations sensibles.
                          </div>
                        )}
                      </div>
                      
                      <div className={`p-4 rounded-lg border ${showQuizResult && quizAnswers.q5 === correctAnswers.q5 ? "bg-green-900/20 border-green-800/50" : showQuizResult && quizAnswers.q5 !== correctAnswers.q5 ? "bg-red-900/20 border-red-800/50" : "bg-blue-900/20 border-blue-800/50"}`}>
                        <h4 className="font-medium text-white mb-2">Question 5</h4>
                        <p className="text-sm text-blue-200 mb-3">Quelles mesures devraient être prises après une violation de données ?</p>
                        
                        <RadioGroup value={quizAnswers.q5} onValueChange={(value) => updateQuizAnswer("q5", value)} className="space-y-3">
                          <div className={`flex items-center space-x-2 p-2 rounded ${getAnswerClass("q5", "a")}`}>
                            <RadioGroupItem value="a" id="q5-a" disabled={showQuizResult} />
                            <Label htmlFor="q5-a" className="text-sm cursor-pointer">Notifier uniquement les utilisateurs directement affectés</Label>
                          </div>
                          <div className={`flex items-center space-x-2 p-2 rounded ${getAnswerClass("q5", "b")}`}>
                            <RadioGroupItem value="b" id="q5-b" disabled={showQuizResult} />
                            <Label htmlFor="q5-b" className="text-sm cursor-pointer">Identifier la cause et corriger la vulnérabilité</Label>
                          </div>
                          <div className={`flex items-center space-x-2 p-2 rounded ${getAnswerClass("q5", "c")}`}>
                            <RadioGroupItem value="c" id="q5-c" disabled={showQuizResult} />
                            <Label htmlFor="q5-c" className="text-sm cursor-pointer">Toutes les mesures ci-dessus ainsi que signaler l'incident aux autorités compétentes</Label>
                          </div>
                        </RadioGroup>
                        
                        {showQuizResult && quizAnswers.q5 !== correctAnswers.q5 && (
                          <div className="mt-3 p-2 bg-blue-900/30 rounded text-xs text-blue-200">
                            <strong>Explication :</strong> Après une violation de données, il est essentiel de notifier les utilisateurs affectés, d'identifier et corriger la vulnérabilité, et dans de nombreux cas, de signaler l'incident aux autorités conformément aux lois sur la protection des données.
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
              
              {/* Assistant IA */}
              <Card className="bg-blue-950/50 border-blue-800/30 shadow-xl mb-4">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                      <Brain className="h-5 w-5 mr-2 text-blue-400" />
                      Assistant IA
                    </h3>
                    
                    <Badge className="bg-blue-600/70">
                      <Sparkles className="h-3 w-3 mr-1" />
                      INTERACTIF
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-blue-300 mb-3">
                    Posez une question sur la cybersécurité et obtenez une réponse instantanée.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Input 
                        placeholder="Ex: Qu'est-ce qu'un ransomware?" 
                        className="bg-blue-900/30 border-blue-700 text-white"
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                      />
                      <Button 
                        onClick={generateAIResponse}
                        disabled={isGeneratingAI || !aiPrompt.trim()}
                        className="whitespace-nowrap bg-blue-600 hover:bg-blue-700"
                      >
                        {isGeneratingAI ? (
                          <>
                            <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                            Génération...
                          </>
                        ) : (
                          <>
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Demander
                          </>
                        )}
                      </Button>
                    </div>
                    
                    {aiResponse && (
                      <div className="p-3 bg-blue-900/20 border border-blue-700/50 rounded-md">
                        <div className="flex items-start">
                          <BrainCircuit className="h-5 w-5 text-blue-400 mr-2 mt-0.5" />
                          <div className="text-sm text-blue-200 whitespace-pre-line">{aiResponse}</div>
                        </div>
                        {!completedInteractions.includes('ai-assistant') && (
                          <div className="mt-2 pt-2 border-t border-blue-700/30 flex items-center">
                            <Award className="h-4 w-4 text-amber-400 mr-1" />
                            <span className="text-xs text-amber-300">+10 points pour avoir utilisé l'assistant IA!</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {/* Exercice Interactif */}
              <Card className="bg-blue-950/50 border-blue-800/30 shadow-xl mb-4">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                      <Monitor className="h-5 w-5 mr-2 text-green-400" />
                      Exercice Pratique
                    </h3>
                    
                    <Badge className="bg-green-600/70">
                      <Target className="h-3 w-3 mr-1" />
                      PRATIQUE
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-blue-300 mb-3">
                    Testez vos connaissances avec cet exercice de sécurité des mots de passe.
                  </p>
                  
                  <div className="p-3 bg-blue-900/20 border border-blue-700/50 rounded-md mb-3">
                    <h4 className="text-sm font-medium text-white mb-2">Évaluateur de Force de Mot de Passe</h4>
                    <p className="text-xs text-blue-200 mb-3">
                      Entrez un mot de passe pour tester sa robustesse contre les attaques.
                    </p>
                    
                    <div className="space-y-3">
                      <Input 
                        type="password"
                        placeholder="Entrez un mot de passe" 
                        className="bg-blue-900/40 border-blue-700 text-white"
                        onChange={(e) => {
                          const result = evaluatePasswordStrength(e.target.value);
                          setExerciseData({
                            ...exerciseData,
                            passwordStrength: result.strength,
                            passwordFeedback: result.feedback
                          });
                          
                          // Ajouter des points si l'utilisateur crée un mot de passe fort
                          if (result.strength === "fort" && !completedInteractions.includes('password-exercise')) {
                            setUserPoints(prev => prev + 15);
                            setCompletedInteractions(prev => [...prev, 'password-exercise']);
                          }
                        }}
                      />
                      
                      {exerciseData.passwordStrength && (
                        <div className="flex items-center gap-2">
                          <div className="w-full h-2 bg-blue-900/50 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${
                                exerciseData.passwordStrength === "fort" ? "bg-green-500" : 
                                exerciseData.passwordStrength === "moyen" ? "bg-yellow-500" : 
                                "bg-red-500"
                              }`}
                              style={{ 
                                width: exerciseData.passwordStrength === "fort" ? "100%" : 
                                      exerciseData.passwordStrength === "moyen" ? "50%" : "25%" 
                              }}
                            ></div>
                          </div>
                          <span className="text-xs font-medium capitalize" 
                            style={{ 
                              color: exerciseData.passwordStrength === "fort" ? "#10b981" : 
                                    exerciseData.passwordStrength === "moyen" ? "#f59e0b" : "#ef4444"
                            }}>
                            {exerciseData.passwordStrength}
                          </span>
                        </div>
                      )}
                      
                      {exerciseData.passwordFeedback && (
                        <p className="text-xs p-2 rounded" style={{ 
                          backgroundColor: exerciseData.passwordStrength === "fort" ? "rgba(16, 185, 129, 0.1)" : 
                                        exerciseData.passwordStrength === "moyen" ? "rgba(245, 158, 11, 0.1)" : 
                                        "rgba(239, 68, 68, 0.1)",
                          color: exerciseData.passwordStrength === "fort" ? "#10b981" : 
                                exerciseData.passwordStrength === "moyen" ? "#f59e0b" : "#ef4444"
                        }}>
                          {exerciseData.passwordFeedback}
                        </p>
                      )}
                      
                      {exerciseData.passwordStrength === "fort" && !completedInteractions.includes('password-exercise') && (
                        <div className="mt-2 pt-2 border-t border-blue-700/30 flex items-center">
                          <Award className="h-4 w-4 text-amber-400 mr-1" />
                          <span className="text-xs text-amber-300">+15 points pour avoir créé un mot de passe fort!</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Ressources complémentaires */}
              <Card className="bg-blue-950/50 border-blue-800/30 shadow-xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                      <BookOpen className="h-5 w-5 mr-2 text-blue-400" />
                      Ressources
                    </h3>
                    
                    <div className="flex items-center text-xs text-amber-300">
                      <Trophy className="h-4 w-4 mr-1 text-amber-400" />
                      <span>{userPoints} points</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-blue-300 hover:text-white hover:bg-blue-800/30"
                      onClick={() => window.open("https://www.anssi.fr/publications/guide-dhygiene-informatique", "_blank")}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      <span className="text-sm">Guide des bonnes pratiques ANSSI</span>
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-blue-300 hover:text-white hover:bg-blue-800/30"
                      onClick={() => window.open("https://www.cybermalveillance.gouv.fr/tous-nos-contenus/fiches-reflexes", "_blank")}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      <span className="text-sm">Fiches réflexes cybermalveillance</span>
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-blue-300 hover:text-white hover:bg-blue-800/30"
                      onClick={() => {
                        if (!completedInteractions.includes('resource-click')) {
                          setUserPoints(prev => prev + 5);
                          setCompletedInteractions(prev => [...prev, 'resource-click']);
                        }
                        // Simulation de téléchargement d'un PDF
                        toast({
                          title: "Téléchargement démarré",
                          description: "Le document est en cours de téléchargement...",
                        });
                      }}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      <span className="text-sm">Cours avancé PDF (télécharger)</span>
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