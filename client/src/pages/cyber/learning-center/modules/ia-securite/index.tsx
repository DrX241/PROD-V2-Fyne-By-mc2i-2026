import React, { useState } from 'react';
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import PageTitle from "@/components/utils/PageTitle";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, CheckCircle, BookOpen, Shield, AlertTriangle, Cpu, Brain, Zap, Bot, LineChart, Server, Database } from "lucide-react";
import { motion } from "framer-motion";

export default function IASecurite() {
  // État pour suivre la progression du module et du quiz
  const [progress, setProgress] = React.useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  
  // Simuler la progression lorsque la page est chargée
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(5);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Liste des questions du quiz
  const questions = [
    {
      question: "Quelle technologie utilise l'IA pour détecter les anomalies dans le trafic réseau ?",
      options: [
        "Firewall classique",
        "Système de détection d'intrusion basé sur l'IA",
        "VPN",
        "Filtrage DNS"
      ],
      answer: 1,
      explanation: "Les systèmes de détection d'intrusion basés sur l'IA utilisent le machine learning pour identifier des comportements anormaux dans le trafic réseau, même lorsqu'ils ne correspondent pas à des signatures d'attaques connues."
    },
    {
      question: "Qu'est-ce que le 'adversarial machine learning' dans le contexte de la cybersécurité ?",
      options: [
        "Une forme de collaboration entre experts en IA",
        "Une technique de protection des modèles d'IA",
        "Une méthode pour former deux IA à collaborer",
        "Des techniques pour manipuler les modèles d'IA en leur fournissant des données trompeuses"
      ],
      answer: 3,
      explanation: "L'adversarial machine learning consiste à manipuler les modèles d'IA en leur fournissant des données spécialement conçues pour provoquer des erreurs ou contourner la détection."
    },
    {
      question: "Comment l'IA peut-elle contribuer à l'automatisation de la réponse aux incidents de sécurité ?",
      options: [
        "En prédisant les futures cyberattaques avec 100% de précision",
        "En remplaçant complètement les équipes de sécurité humaines",
        "En coordonnant des réponses automatisées basées sur l'analyse des incidents en temps réel",
        "En supprimant automatiquement tous les fichiers suspects"
      ],
      answer: 2,
      explanation: "L'IA peut analyser les incidents en temps réel et orchestrer des réponses automatisées selon des playbooks prédéfinis, accélérant ainsi le temps de réponse tout en réduisant la charge de travail manuel."
    },
    {
      question: "Quel est l'un des risques principaux liés à l'utilisation de modèles de grands langages (LLM) dans les entreprises ?",
      options: [
        "Ils consomment trop d'électricité",
        "Les fuites de données via les prompts",
        "Ils sont trop lents pour être utiles",
        "Ils ne peuvent traiter que du texte"
      ],
      answer: 1,
      explanation: "Les LLM peuvent involontairement exposer des données sensibles si les utilisateurs incluent des informations confidentielles dans leurs prompts, créant ainsi un risque de fuite de données."
    },
    {
      question: "Quelle technique d'IA est particulièrement utile pour détecter les comportements anormaux des utilisateurs ?",
      options: [
        "Vision par ordinateur",
        "Traitement du langage naturel",
        "Détection d'anomalies par apprentissage non supervisé",
        "Reconnaissance faciale"
      ],
      answer: 2,
      explanation: "La détection d'anomalies par apprentissage non supervisé permet d'établir une base de référence des comportements normaux et d'identifier les écarts significatifs qui pourraient indiquer une compromission."
    },
    {
      question: "Quelle affirmation décrit correctement le concept de 'model poisoning' ?",
      options: [
        "Un modèle d'IA qui génère des résultats toxiques",
        "La contamination d'un modèle d'IA pendant sa phase d'entraînement",
        "Un virus qui cible spécifiquement les systèmes d'IA",
        "La dégradation naturelle des performances d'un modèle avec le temps"
      ],
      answer: 1,
      explanation: "Le model poisoning est une attaque qui consiste à injecter des données malveillantes pendant la phase d'entraînement d'un modèle d'IA pour influencer ses futures prédictions ou classifications."
    },
    {
      question: "Quel domaine de la cybersécurité bénéficie de l'IA pour analyser le comportement du code malveillant ?",
      options: [
        "Authentification biométrique",
        "Sécurité physique",
        "Analyse des malwares",
        "Gestion des mots de passe"
      ],
      answer: 2,
      explanation: "L'analyse des malwares utilise l'IA pour étudier le comportement des logiciels malveillants, permettant de détecter des variantes inconnues ou des techniques d'évasion sophistiquées par leur comportement plutôt que par leur signature."
    },
    {
      question: "Quelle est une limitation significative de l'IA dans la détection des cybermenaces ?",
      options: [
        "Elle ne peut pas analyser de grandes quantités de données",
        "Elle génère souvent des faux positifs nécessitant une vérification humaine",
        "Elle est inefficace pour les analyses en temps réel",
        "Elle ne peut pas être déployée dans les environnements cloud"
      ],
      answer: 1,
      explanation: "Les systèmes de détection basés sur l'IA peuvent générer un nombre significatif de faux positifs, nécessitant une vérification et un tri par des analystes humains pour éviter la fatigue d'alerte."
    },
    {
      question: "Comment les attaquants pourraient-ils exploiter les modèles d'IA génératives comme ChatGPT ?",
      options: [
        "Pour créer uniquement des applications légitimes",
        "Pour générer du code malveillant et des e-mails de phishing plus convaincants",
        "Pour ralentir les infrastructures cloud",
        "Pour miner des cryptomonnaies"
      ],
      answer: 1,
      explanation: "Les attaquants peuvent utiliser les modèles d'IA génératives pour créer du code malveillant sophistiqué et des contenus de phishing hautement crédibles, personnalisés et grammaticalement corrects."
    },
    {
      question: "Quelle mesure de sécurité est essentielle pour protéger les modèles d'IA contre les attaques d'injection de prompt ?",
      options: [
        "Utiliser uniquement des modèles d'IA open-source",
        "Désactiver l'accès à Internet pour les modèles",
        "Implémenter un filtrage et une validation robustes des entrées",
        "Réentraîner le modèle chaque semaine"
      ],
      answer: 2,
      explanation: "Le filtrage et la validation robustes des entrées sont essentiels pour détecter et bloquer les tentatives d'injection de prompt qui pourraient manipuler le modèle pour contourner ses garde-fous ou divulguer des informations sensibles."
    }
  ];

  // Gérer le début du quiz
  const startQuiz = () => {
    setQuizStarted(true);
    setCurrentQuestion(0);
    setScore(0);
    setShowResults(false);
  };

  // Gérer la sélection d'une réponse
  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    setShowExplanation(true);
    
    if (answerIndex === questions[currentQuestion].answer) {
      setScore(score + 1);
    }
  };

  // Passer à la question suivante
  const nextQuestion = () => {
    setSelectedAnswer(null);
    setShowExplanation(false);
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  // Recommencer le quiz
  const restartQuiz = () => {
    setQuizStarted(true);
    setCurrentQuestion(0);
    setScore(0);
    setShowResults(false);
    setSelectedAnswer(null);
    setShowExplanation(false);
  };

  return (
    <div className="min-h-screen bg-[#0a1429]">
      <PageTitle title="IA & Cybersécurité | Centre de formation" />
      
      {/* En-tête avec navigation et titre */}
      <div className="border-b border-blue-800/60">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/cyber/learning-center">
            <Button variant="ghost" className="text-blue-300 hover:bg-blue-900/30 hover:text-blue-200">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </Link>
          <h1 className="text-xl text-white font-medium">IA & Cybersécurité</h1>
          
          <div className="ml-auto flex items-center">
            <div className="w-48 mr-4">
              <Progress value={progress} className="h-2" />
            </div>
            <span className="text-sm text-blue-300">{progress}% complété</span>
          </div>
        </div>
      </div>
      
      {/* Contenu principal du module */}
      <div className="container mx-auto px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Section principale de contenu */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="bg-blue-950/50 border-blue-800/30 shadow-xl">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-white mb-4">Intelligence Artificielle en Cybersécurité</h2>
                
                <div className="prose prose-invert max-w-none">
                  <p className="text-blue-200">
                    L'intelligence artificielle (IA) révolutionne la cybersécurité, offrant à la fois de nouvelles opportunités de protection et de nouveaux défis face à des menaces évolutives.
                  </p>
                  
                  <h3 className="text-xl font-semibold text-white mt-6 mb-3">Définition et évolution</h3>
                  
                  <p className="text-blue-200">
                    L'IA en cybersécurité désigne l'application des techniques d'intelligence artificielle, principalement le machine learning et le deep learning, pour détecter, analyser et répondre aux menaces informatiques. Son évolution a suivi plusieurs phases :
                  </p>
                  
                  <div className="space-y-3 mt-4">
                    <div className="bg-blue-900/40 p-4 rounded-lg border border-blue-700/50">
                      <h4 className="font-medium text-white">Phase 1: Systèmes basés sur les règles (1990-2010)</h4>
                      <p className="text-sm text-blue-200">Premiers systèmes de détection d'intrusion utilisant des règles prédéfinies et des signatures d'attaques.</p>
                    </div>
                    
                    <div className="bg-blue-900/40 p-4 rounded-lg border border-blue-700/50">
                      <h4 className="font-medium text-white">Phase 2: Apprentissage supervisé (2010-2018)</h4>
                      <p className="text-sm text-blue-200">Introduction du machine learning dans la détection des malwares et des anomalies réseau, basé sur des données étiquetées.</p>
                    </div>
                    
                    <div className="bg-blue-900/40 p-4 rounded-lg border border-blue-700/50">
                      <h4 className="font-medium text-white">Phase 3: Apprentissage non-supervisé et deep learning (2018-2022)</h4>
                      <p className="text-sm text-blue-200">Émergence de systèmes capables de détecter des anomalies sans exemples préalables et d'analyser des comportements complexes.</p>
                    </div>
                    
                    <div className="bg-blue-900/40 p-4 rounded-lg border border-blue-700/50">
                      <h4 className="font-medium text-white">Phase 4: IA générative et LLM (2022-présent)</h4>
                      <p className="text-sm text-blue-200">Utilisation des grands modèles de langage (LLM) pour l'analyse de menaces, la génération de code sécurisé et l'automatisation des réponses aux incidents.</p>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-white mt-6 mb-3">Applications de l'IA en cybersécurité</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-blue-900/40 p-4 rounded-lg border border-blue-700/50">
                      <div className="flex items-center mb-2">
                        <Shield className="h-5 w-5 text-blue-300 mr-2" />
                        <h4 className="font-medium text-white">Détection des menaces</h4>
                      </div>
                      <p className="text-sm text-blue-200">Identification des comportements suspects et des anomalies dans les réseaux, endpoints et applications.</p>
                    </div>
                    
                    <div className="bg-blue-900/40 p-4 rounded-lg border border-blue-700/50">
                      <div className="flex items-center mb-2">
                        <Bot className="h-5 w-5 text-blue-300 mr-2" />
                        <h4 className="font-medium text-white">Analyse comportementale</h4>
                      </div>
                      <p className="text-sm text-blue-200">Profilage des comportements normaux des utilisateurs et détection des actions inhabituelles.</p>
                    </div>
                    
                    <div className="bg-blue-900/40 p-4 rounded-lg border border-blue-700/50">
                      <div className="flex items-center mb-2">
                        <Zap className="h-5 w-5 text-blue-300 mr-2" />
                        <h4 className="font-medium text-white">Automatisation des réponses</h4>
                      </div>
                      <p className="text-sm text-blue-200">Réactions automatisées aux incidents de sécurité, réduisant le temps de réponse et la charge des équipes.</p>
                    </div>
                    
                    <div className="bg-blue-900/40 p-4 rounded-lg border border-blue-700/50">
                      <div className="flex items-center mb-2">
                        <Brain className="h-5 w-5 text-blue-300 mr-2" />
                        <h4 className="font-medium text-white">Prédiction des vulnérabilités</h4>
                      </div>
                      <p className="text-sm text-blue-200">Identification proactive des faiblesses potentielles dans les systèmes avant qu'elles ne soient exploitées.</p>
                    </div>
                  </div>
                  
                  <Alert className="bg-amber-950/50 border-amber-700/60 mt-8">
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                    <AlertTitle className="text-amber-400">Considération importante</AlertTitle>
                    <AlertDescription className="text-amber-200">
                      Bien que l'IA offre des avantages significatifs en cybersécurité, elle ne remplace pas l'expertise humaine. Les meilleures approches combinent l'IA pour l'analyse de grandes quantités de données avec le jugement des analystes humains pour les décisions critiques.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-blue-950/50 border-blue-800/30 shadow-xl">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-white mb-4">Double tranchant : l'IA comme vecteur de menace</h2>
                
                <Tabs defaultValue="offensive" className="w-full">
                  <TabsList className="grid grid-cols-2 mb-6">
                    <TabsTrigger value="offensive" className="data-[state=active]:bg-blue-700">IA offensive</TabsTrigger>
                    <TabsTrigger value="defensive" className="data-[state=active]:bg-blue-700">IA défensive</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="offensive">
                    <div className="space-y-4">
                      <p className="text-blue-200">
                        Les mêmes technologies d'IA qui renforcent la cybersécurité peuvent être détournées par des acteurs malveillants pour mener des attaques plus sophistiquées :
                      </p>
                      
                      <div className="bg-blue-900/30 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-white mb-2">Phishing avancé</h3>
                        <p className="text-blue-200">Les modèles de génération de texte comme GPT-4 permettent de créer des emails de phishing grammaticalement parfaits et hautement personnalisés, augmentant considérablement leur efficacité.</p>
                      </div>
                      
                      <div className="bg-blue-900/30 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-white mb-2">Deepfakes</h3>
                        <p className="text-blue-200">Création de contenus audio et vidéo falsifiés mais crédibles pour des attaques d'ingénierie sociale, permettant de simuler la voix ou l'image de personnes de confiance.</p>
                      </div>
                      
                      <div className="bg-blue-900/30 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-white mb-2">Attaques par adversarial learning</h3>
                        <p className="text-blue-200">Manipulation des entrées pour tromper les modèles d'IA de sécurité, par exemple en modifiant subtilement le code malveillant pour échapper à la détection.</p>
                      </div>
                      
                      <div className="bg-blue-900/30 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-white mb-2">Génération de malwares polymorphiques</h3>
                        <p className="text-blue-200">Utilisation de l'IA pour créer des variantes inédites de logiciels malveillants qui évoluent constamment pour échapper aux systèmes de détection.</p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="defensive">
                    <div className="space-y-4">
                      <p className="text-blue-200">
                        Face à ces menaces, les technologies d'IA défensives s'adaptent constamment :
                      </p>
                      
                      <div className="bg-blue-900/30 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-white mb-2">Détection des deepfakes</h3>
                        <p className="text-blue-200">Systèmes d'IA spécialisés capables d'identifier les incohérences subtiles dans les contenus audio et vidéo générés artificiellement.</p>
                      </div>
                      
                      <div className="bg-blue-900/30 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-white mb-2">XDR augmenté par l'IA</h3>
                        <p className="text-blue-200">Extended Detection and Response intégrant des capacités d'IA pour corréler les menaces à travers différentes couches (réseau, endpoints, cloud) et détecter les campagnes sophistiquées.</p>
                      </div>
                      
                      <div className="bg-blue-900/30 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-white mb-2">Robustesse adversariale</h3>
                        <p className="text-blue-200">Entraînement des modèles défensifs contre des exemples adversariaux pour les rendre résistants aux techniques de contournement.</p>
                      </div>
                      
                      <div className="bg-blue-900/30 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-white mb-2">Analyse prédictive des menaces</h3>
                        <p className="text-blue-200">Anticipation des futures attaques en analysant les tendances émergentes et en modélisant les comportements des attaquants.</p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            
            <Card className="bg-blue-950/50 border-blue-800/30 shadow-xl">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-white mb-4">Mise en œuvre de l'IA en cybersécurité</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">Domaines d'application prioritaires</h3>
                    
                    <Table>
                      <TableHeader>
                        <TableRow className="border-blue-700">
                          <TableHead className="text-blue-300">Domaine</TableHead>
                          <TableHead className="text-blue-300">Applications IA</TableHead>
                          <TableHead className="text-blue-300">Bénéfices</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow className="border-blue-800/30">
                          <TableCell className="font-medium text-white">SOC (Security Operation Center)</TableCell>
                          <TableCell className="text-blue-200">Triage automatisé des alertes, détection des faux positifs</TableCell>
                          <TableCell className="text-blue-200">Réduction de la fatigue d'alerte, focus sur les menaces réelles</TableCell>
                        </TableRow>
                        <TableRow className="border-blue-800/30">
                          <TableCell className="font-medium text-white">Sécurité Cloud</TableCell>
                          <TableCell className="text-blue-200">Détection des mauvaises configurations, surveillance des identités</TableCell>
                          <TableCell className="text-blue-200">Protection des environnements complexes et dynamiques</TableCell>
                        </TableRow>
                        <TableRow className="border-blue-800/30">
                          <TableCell className="font-medium text-white">Protection des endpoints</TableCell>
                          <TableCell className="text-blue-200">Détection comportementale, analyse prédictive</TableCell>
                          <TableCell className="text-blue-200">Blocage des malwares inconnus et des attaques zero-day</TableCell>
                        </TableRow>
                        <TableRow className="border-blue-800/30">
                          <TableCell className="font-medium text-white">Gestion des identités</TableCell>
                          <TableCell className="text-blue-200">Authentication adaptative, détection d'accès anormaux</TableCell>
                          <TableCell className="text-blue-200">Prévention des compromissions de comptes</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">Étapes pour intégrer l'IA dans une stratégie de cybersécurité</h3>
                    
                    <ol className="space-y-3 list-decimal list-inside text-blue-200">
                      <li className="pl-2">
                        <span className="font-medium text-white">Évaluation des besoins et cas d'usage</span> - Identifier les domaines où l'IA apporte une valeur ajoutée significative.
                      </li>
                      <li className="pl-2">
                        <span className="font-medium text-white">Sélection des solutions adaptées</span> - Choisir des technologies alignées avec l'infrastructure existante et les objectifs de sécurité.
                      </li>
                      <li className="pl-2">
                        <span className="font-medium text-white">Préparation des données</span> - Assurer la qualité et la représentativité des données d'entraînement.
                      </li>
                      <li className="pl-2">
                        <span className="font-medium text-white">Déploiement progressif</span> - Commencer par des projets pilotes avant une généralisation.
                      </li>
                      <li className="pl-2">
                        <span className="font-medium text-white">Formation des équipes</span> - Développer les compétences nécessaires pour exploiter efficacement les outils d'IA.
                      </li>
                      <li className="pl-2">
                        <span className="font-medium text-white">Surveillance et optimisation</span> - Évaluer continuellement les performances et ajuster les modèles.
                      </li>
                    </ol>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">Considérations éthiques et légales</h3>
                    
                    <ul className="space-y-2 list-disc list-inside text-blue-200">
                      <li>Respect de la vie privée et conformité au RGPD lors de l'analyse des comportements</li>
                      <li>Transparence des décisions prises par les systèmes d'IA</li>
                      <li>Biais potentiels dans les modèles d'IA qui pourraient générer des faux positifs</li>
                      <li>Responsabilité en cas d'incident malgré l'utilisation de systèmes automatisés</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {!quizStarted ? (
              <Card className="bg-blue-950/50 border-blue-800/30 shadow-xl">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold text-white mb-4">Évaluez vos connaissances</h2>
                  <p className="text-blue-200 mb-6">
                    Testez votre compréhension des concepts liés à l'IA en cybersécurité avec ce quiz interactif.
                  </p>
                  <Button onClick={startQuiz} className="bg-blue-600 hover:bg-blue-700">
                    Commencer le quiz
                  </Button>
                </CardContent>
              </Card>
            ) : showResults ? (
              <Card className="bg-blue-950/50 border-blue-800/30 shadow-xl">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold text-white mb-4">Résultats du quiz</h2>
                  <p className="text-blue-200 mb-6">
                    Vous avez obtenu <span className="font-bold text-white">{score}</span> sur <span className="font-bold text-white">{questions.length}</span> points.
                  </p>
                  {score >= questions.length * 0.7 ? (
                    <Alert className="bg-green-950/50 border-green-700/60 mb-6">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <AlertTitle className="text-green-400">Félicitations !</AlertTitle>
                      <AlertDescription className="text-green-200">
                        Vous avez une bonne compréhension des concepts liés à l'IA en cybersécurité.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert className="bg-amber-950/50 border-amber-700/60 mb-6">
                      <AlertTriangle className="h-4 w-4 text-amber-400" />
                      <AlertTitle className="text-amber-400">Continuez à apprendre</AlertTitle>
                      <AlertDescription className="text-amber-200">
                        Nous vous suggérons de revoir certains concepts du module pour améliorer votre compréhension.
                      </AlertDescription>
                    </Alert>
                  )}
                  <Button onClick={restartQuiz} className="bg-blue-600 hover:bg-blue-700">
                    Recommencer le quiz
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-blue-950/50 border-blue-800/30 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">Question {currentQuestion + 1} sur {questions.length}</h2>
                    <span className="text-blue-300">Score: {score}</span>
                  </div>
                  
                  <p className="text-white text-lg mb-6">{questions[currentQuestion].question}</p>
                  
                  <div className="space-y-3 mb-6">
                    {questions[currentQuestion].options.map((option, index) => (
                      <div 
                        key={index}
                        onClick={() => !showExplanation && handleAnswerSelect(index)}
                        className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                          selectedAnswer === index 
                            ? index === questions[currentQuestion].answer
                              ? 'bg-green-900/30 border-green-500/50 text-green-200'
                              : 'bg-red-900/30 border-red-500/50 text-red-200'
                            : showExplanation && index === questions[currentQuestion].answer
                              ? 'bg-green-900/30 border-green-500/50 text-green-200'
                              : 'bg-blue-900/30 border-blue-700/50 text-blue-200 hover:bg-blue-800/30'
                        }`}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                  
                  {showExplanation && (
                    <div className="mb-6">
                      <Alert className="bg-blue-900/30 border-blue-700/50">
                        <BookOpen className="h-4 w-4 text-blue-300" />
                        <AlertTitle className="text-blue-300">Explication</AlertTitle>
                        <AlertDescription className="text-blue-200">
                          {questions[currentQuestion].explanation}
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}
                  
                  {showExplanation && (
                    <Button onClick={nextQuestion} className="bg-blue-600 hover:bg-blue-700">
                      {currentQuestion < questions.length - 1 ? 'Question suivante' : 'Voir les résultats'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Sidebar avec ressources et progression */}
          <div className="space-y-6">
            <Card className="bg-blue-950/50 border-blue-800/30 shadow-xl">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Ressources complémentaires</h3>
                
                <div className="space-y-3">
                  <div className="block p-3 bg-blue-900/30 rounded-lg">
                    <div className="flex items-center">
                      <BookOpen className="h-4 w-4 text-blue-300 mr-2" />
                      <span className="text-blue-200">Guide ANSSI sur l'IA en cybersécurité</span>
                    </div>
                  </div>
                  
                  <div className="block p-3 bg-blue-900/30 rounded-lg">
                    <div className="flex items-center">
                      <Cpu className="h-4 w-4 text-blue-300 mr-2" />
                      <span className="text-blue-200">Livre blanc : IA et sécurité des données</span>
                    </div>
                  </div>
                </div>
                
                <Separator className="my-4 bg-blue-800/40" />
                
                <h3 className="text-lg font-semibold text-white mb-4">Modules complémentaires</h3>
                
                <div className="space-y-3">
                  <Link href="/cyber/learning-center/modules/intro-cybersecurite">
                    <div className="block p-3 bg-blue-900/30 rounded-lg hover:bg-blue-900/50 transition-colors">
                      <div className="flex items-center">
                        <Shield className="h-4 w-4 text-blue-300 mr-2" />
                        <span className="text-blue-200">Introduction à la cybersécurité</span>
                      </div>
                    </div>
                  </Link>
                  
                  <Link href="/cyber/learning-center/modules/securite-donnees">
                    <div className="block p-3 bg-blue-900/30 rounded-lg hover:bg-blue-900/50 transition-colors">
                      <div className="flex items-center">
                        <Database className="h-4 w-4 text-blue-300 mr-2" />
                        <span className="text-blue-200">Protection des données</span>
                      </div>
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-blue-950/50 border-blue-800/30 shadow-xl">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Progression</h3>
                
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
                      <span className="text-blue-300">Quiz complété</span>
                      <span className="text-blue-300">{quizStarted && showResults ? '100%' : '0%'}</span>
                    </div>
                    <Progress value={quizStarted && showResults ? 100 : 0} className="h-2" />
                  </div>
                  
                  <Button 
                    className="w-full mt-4 bg-blue-700 hover:bg-blue-600"
                    onClick={() => setProgress(Math.min(100, progress + 10))}
                  >
                    Continuer l'apprentissage
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}