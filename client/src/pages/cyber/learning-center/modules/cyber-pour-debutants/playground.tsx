import React, { useState } from 'react';
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import PageTitle from "@/components/utils/PageTitle";
import { motion } from "framer-motion";
import { 
  AlertTriangle, ArrowLeft, ArrowRight, CheckCircle, Shield, 
  XCircle, Mail, Lock, Eye, User, Info, MessageSquare, Smartphone, 
  Wifi, ExternalLink, FileText, ThumbsUp, ThumbsDown, RefreshCcw
} from "lucide-react";

// Type pour les scénarios
interface Scenario {
  id: string;
  title: string;
  description: string;
  type: 'phishing' | 'password' | 'device' | 'wifi';
  content: React.ReactNode;
  options: {
    id: string;
    text: string;
    correct: boolean;
    feedback: string;
  }[];
}

export default function CyberPlayground() {
  // États pour la progression et les interactions
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState<string[]>([]);
  const [userProgress, setUserProgress] = useState(0);
  const [showTip, setShowTip] = useState(false);
  
  // Personnalisation pour l'immersion
  const [userName, setUserName] = useState('');
  const [userStarted, setUserStarted] = useState(false);
  
  // Scénarios de mise en pratique
  const scenarios: Scenario[] = [
    {
      id: 'email-phishing',
      title: 'Un email suspect',
      description: 'Je suis un email que vous venez de recevoir. Comment réagissez-vous ?',
      type: 'phishing',
      content: (
        <div className="space-y-4">
          <div className="bg-white text-black p-5 rounded-lg shadow border border-gray-300">
            <div className="flex justify-between items-center border-b border-gray-200 pb-2 mb-3">
              <div>
                <div className="font-semibold">contact@amaz0n-security-verify.com</div>
                <div className="text-sm text-gray-600">À: vous@email.com</div>
              </div>
              <div className="text-sm text-gray-500">10:42</div>
            </div>
            <div className="font-semibold mb-2">Action urgente requise : Votre compte Amazon a été suspendu</div>
            <div className="text-sm space-y-3">
              <p>Cher(e) client(e),</p>
              <p>Nous avons detecté une activité inhabituel sur votre compte Amazon. Pour des raisons de sécurité, votre compte a été temporairement suspendu.</p>
              <p>Pour rétablir l'accès à votre compte, veuillez cliquer sur le lien ci-dessous et vérifier vos informations dans les prochaines 24 heures :</p>
              <p className="bg-blue-100 p-2 text-blue-600 text-center">
                https://amaz0n-account-verify.com/secure
              </p>
              <p>Si vous ne prenez pas de mesures rapidement, votre compte sera définitivement supprimé.</p>
              <p>Cordialement,<br />L'équipe de sécurité Amazon</p>
            </div>
          </div>
          <Alert className="bg-amber-950/50 border-amber-700/60">
            <Info className="h-4 w-4 text-amber-400" />
            <AlertTitle className="text-amber-400">Je suis un email dans votre boîte de réception</AlertTitle>
            <AlertDescription className="text-amber-200">
              Observez attentivement mon contenu, l'adresse de l'expéditeur et les indices qui pourraient révéler 
              ma véritable nature.
            </AlertDescription>
          </Alert>
        </div>
      ),
      options: [
        {
          id: 'email-option1',
          text: 'Cliquer sur le lien pour vérifier mon compte rapidement',
          correct: false,
          feedback: "Attention ! C'est une tentative de phishing. L'adresse d'expéditeur ('amaz0n-security-verify.com' au lieu de 'amazon.com'), les fautes d'orthographe, et le sentiment d'urgence sont des signes révélateurs. Ne cliquez jamais sur de tels liens."
        },
        {
          id: 'email-option2',
          text: "Ignorer l'email et supprimer immédiatement",
          correct: true,
          feedback: "Excellente décision ! Il s'agit d'une tentative de phishing. L'adresse d'expéditeur suspecte ('amaz0n-security-verify.com'), les fautes d'orthographe et le sentiment d'urgence sont des signes typiques d'une tentative d'hameçonnage."
        },
        {
          id: 'email-option3',
          text: "Répondre à l'email pour demander plus d'informations",
          correct: false,
          feedback: "Ce n'est pas recommandé. Répondre à un email de phishing confirme que votre adresse email est active, ce qui pourrait entraîner plus de tentatives. L'email présente plusieurs signes de phishing : adresse suspecte, fautes d'orthographe et sentiment d'urgence."
        },
        {
          id: 'email-option4',
          text: "Vérifier mon compte en me connectant directement sur le site officiel d'Amazon",
          correct: true,
          feedback: "Parfait ! C'est la meilleure approche. En allant directement sur le site officiel (en tapant l'URL vous-même), vous pouvez vérifier l'état de votre compte en toute sécurité. Les entreprises légitimes n'envoient jamais de liens pour vous demander vos identifiants."
        }
      ]
    },
    {
      id: 'password-check',
      title: 'La force du mot de passe',
      description: 'Je suis un système de sécurité évaluant la force de votre mot de passe. Lequel choisiriez-vous ?',
      type: 'password',
      content: (
        <div className="space-y-4">
          <div className="bg-slate-800 p-5 rounded-lg border border-slate-600">
            <div className="text-center mb-4">
              <Lock className="h-10 w-10 text-blue-400 mx-auto mb-2" />
              <h3 className="text-lg font-medium text-white">Création d'un nouveau mot de passe</h3>
              <p className="text-sm text-slate-400">Choisissez un mot de passe sécurisé pour votre compte principal</p>
            </div>
            <div className="space-y-3">
              <div className="p-3 border border-slate-600 rounded-md bg-slate-700/50">
                <div className="flex items-center">
                  <div className="w-full font-mono text-sm text-gray-300 bg-slate-900/70 p-2 rounded">Password123</div>
                  <div className="ml-2">
                    <Badge className="bg-red-900 text-red-200">Faible</Badge>
                  </div>
                </div>
              </div>
              <div className="p-3 border border-slate-600 rounded-md bg-slate-700/50">
                <div className="flex items-center">
                  <div className="w-full font-mono text-sm text-gray-300 bg-slate-900/70 p-2 rounded">Michel1995!</div>
                  <div className="ml-2">
                    <Badge className="bg-amber-900 text-amber-200">Moyen</Badge>
                  </div>
                </div>
              </div>
              <div className="p-3 border border-slate-600 rounded-md bg-slate-700/50">
                <div className="flex items-center">
                  <div className="w-full font-mono text-sm text-gray-300 bg-slate-900/70 p-2 rounded">fT5%kL9*pZ2@qR</div>
                  <div className="ml-2">
                    <Badge className="bg-green-900 text-green-200">Fort</Badge>
                  </div>
                </div>
              </div>
              <div className="p-3 border border-slate-600 rounded-md bg-slate-700/50">
                <div className="flex items-center">
                  <div className="w-full font-mono text-sm text-gray-300 bg-slate-900/70 p-2 rounded">ChatJardin42Soleil!</div>
                  <div className="ml-2">
                    <Badge className="bg-green-900 text-green-200">Fort</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Alert className="bg-blue-950/50 border-blue-700/60">
            <Info className="h-4 w-4 text-blue-400" />
            <AlertTitle className="text-blue-400">Je suis votre application de création de compte</AlertTitle>
            <AlertDescription className="text-blue-200">
              Examinez les différents mots de passe proposés et évaluez leur niveau de sécurité.
            </AlertDescription>
          </Alert>
        </div>
      ),
      options: [
        {
          id: 'password-option1',
          text: 'Password123',
          correct: false,
          feedback: "Ce mot de passe est très faible. Il utilise un mot courant ('Password') suivi de chiffres séquentiels. C'est l'un des premiers mots de passe que les pirates essaieraient lors d'une attaque par force brute."
        },
        {
          id: 'password-option2',
          text: 'Michel1995!',
          correct: false,
          feedback: "Ce mot de passe est risqué. Il contient probablement des informations personnelles (prénom et année de naissance) facilement devinables. Les pirates recherchent souvent ces informations sur les réseaux sociaux pour leurs attaques."
        },
        {
          id: 'password-option3',
          text: 'fT5%kL9*pZ2@qR',
          correct: true,
          feedback: "Excellent choix ! Ce mot de passe est fort car il est long et complexe, mélangeant majuscules, minuscules, chiffres et caractères spéciaux sans motif reconnaissable. Il serait extrêmement difficile à deviner."
        },
        {
          id: 'password-option4',
          text: 'ChatJardin42Soleil!',
          correct: true,
          feedback: "Très bon choix ! Cette phrase de passe est à la fois longue et mémorisable. Elle combine des mots sans lien logique, un chiffre et un caractère spécial. Les phrases de passe sont souvent plus faciles à retenir que les chaînes aléatoires tout en restant sécurisées."
        }
      ]
    },
    {
      id: 'device-security',
      title: 'Sécurité de votre smartphone',
      description: 'Je suis votre smartphone et je vous propose plusieurs options de sécurité. Que choisissez-vous ?',
      type: 'device',
      content: (
        <div className="space-y-4">
          <div className="bg-gray-900 p-5 rounded-lg border border-gray-700 max-w-sm mx-auto">
            <div className="text-center mb-5">
              <Smartphone className="h-16 w-16 text-blue-400 mx-auto mb-2" />
              <h3 className="text-lg font-medium text-white">Paramètres de sécurité</h3>
              <p className="text-sm text-gray-400">Configuration de votre nouvel appareil</p>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-800/60 p-3 rounded-md">
                <h4 className="text-sm font-medium text-gray-200 mb-1">Verrouillage de l'écran</h4>
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge variant="outline" className="border-gray-600 bg-gray-800">Aucun</Badge>
                  <Badge variant="outline" className="border-gray-600 bg-gray-800">Schéma simple</Badge>
                  <Badge variant="outline" className="border-gray-600 bg-gray-800">Code PIN 4 chiffres</Badge>
                  <Badge variant="outline" className="border-gray-600 bg-gray-800">Mot de passe complexe</Badge>
                  <Badge variant="outline" className="border-gray-600 bg-gray-800">Empreinte digitale</Badge>
                </div>
              </div>
              <div className="bg-gray-800/60 p-3 rounded-md">
                <h4 className="text-sm font-medium text-gray-200 mb-1">Mises à jour du système</h4>
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge variant="outline" className="border-gray-600 bg-gray-800">Manuelles</Badge>
                  <Badge variant="outline" className="border-gray-600 bg-gray-800">Automatiques</Badge>
                  <Badge variant="outline" className="border-gray-600 bg-gray-800">Différées</Badge>
                </div>
              </div>
              <div className="bg-gray-800/60 p-3 rounded-md">
                <h4 className="text-sm font-medium text-gray-200 mb-1">Applications</h4>
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge variant="outline" className="border-gray-600 bg-gray-800">Toutes sources</Badge>
                  <Badge variant="outline" className="border-gray-600 bg-gray-800">Store officiel uniquement</Badge>
                </div>
              </div>
              <div className="bg-gray-800/60 p-3 rounded-md">
                <h4 className="text-sm font-medium text-gray-200 mb-1">Sauvegarde des données</h4>
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge variant="outline" className="border-gray-600 bg-gray-800">Aucune</Badge>
                  <Badge variant="outline" className="border-gray-600 bg-gray-800">Cloud non chiffré</Badge>
                  <Badge variant="outline" className="border-gray-600 bg-gray-800">Cloud chiffré</Badge>
                  <Badge variant="outline" className="border-gray-600 bg-gray-800">Locale uniquement</Badge>
                </div>
              </div>
            </div>
          </div>
          <Alert className="bg-cyan-950/50 border-cyan-700/60">
            <Info className="h-4 w-4 text-cyan-400" />
            <AlertTitle className="text-cyan-400">Je suis votre assistant de configuration</AlertTitle>
            <AlertDescription className="text-cyan-200">
              Quelle combinaison de paramètres choisiriez-vous pour sécuriser votre smartphone tout en conservant une bonne expérience utilisateur ?
            </AlertDescription>
          </Alert>
        </div>
      ),
      options: [
        {
          id: 'device-option1',
          text: "Aucun verrouillage, mises à jour manuelles, toutes sources d'applications, aucune sauvegarde",
          correct: false,
          feedback: "Cette configuration est extrêmement risquée. Sans verrouillage d'écran, n'importe qui peut accéder à vos données. Les mises à jour manuelles sont souvent oubliées, laissant votre appareil vulnérable. Installer des applications de toutes sources expose votre appareil à des logiciels malveillants. Enfin, sans sauvegarde, vous risquez de perdre toutes vos données en cas de problème."
        },
        {
          id: 'device-option2',
          text: 'Schéma simple, mises à jour différées, store officiel uniquement, cloud non chiffré',
          correct: false,
          feedback: "Cette configuration présente des faiblesses. Un schéma simple peut être facilement observé et reproduit. Différer les mises à jour laisse votre appareil vulnérable aux menaces déjà corrigées. Le stockage dans un cloud non chiffré expose vos données à des accès non autorisés. Le seul bon choix est de limiter les applications au store officiel."
        },
        {
          id: 'device-option3',
          text: 'Mot de passe complexe ou empreinte digitale, mises à jour automatiques, store officiel uniquement, cloud chiffré',
          correct: true,
          feedback: "Excellente configuration ! Un mot de passe complexe ou l'authentification biométrique offre une bonne protection. Les mises à jour automatiques assurent que votre appareil est protégé contre les dernières vulnérabilités. Limiter les installations au store officiel réduit considérablement les risques de malware. Enfin, le chiffrement de vos sauvegardes protège vos données même en cas d'accès non autorisé au cloud."
        },
        {
          id: 'device-option4',
          text: 'Code PIN 4 chiffres, mises à jour automatiques, store officiel uniquement, sauvegarde locale uniquement',
          correct: false,
          feedback: "Cette configuration est moyenne. Un code PIN à 4 chiffres offre une protection limitée face aux techniques modernes. Les mises à jour automatiques et les restrictions du store officiel sont de bons choix. Cependant, une sauvegarde locale uniquement vous expose à la perte totale de vos données en cas de vol ou de dommage à l'appareil. Un cloud chiffré offrirait une meilleure protection globale."
        }
      ]
    },
    {
      id: 'wifi-scenario',
      title: 'Connexion Wi-Fi en déplacement',
      description: 'Je suis la liste des réseaux Wi-Fi disponibles dans un lieu public. Lequel choisiriez-vous ?',
      type: 'wifi',
      content: (
        <div className="space-y-4">
          <div className="bg-slate-900 p-5 rounded-lg border border-slate-700">
            <div className="text-center mb-4">
              <Wifi className="h-10 w-10 text-blue-400 mx-auto mb-2" />
              <h3 className="text-lg font-medium text-white">Réseaux Wi-Fi disponibles</h3>
              <p className="text-sm text-slate-400">Café du Centre - Paris</p>
            </div>
            <div className="space-y-3">
              <div className="p-3 border border-slate-600 rounded-md bg-slate-800/50 flex justify-between items-center">
                <div className="flex items-center">
                  <Wifi className="h-4 w-4 text-green-400 mr-2" />
                  <span className="text-white">Cafe_Centre_WiFi</span>
                </div>
                <Badge className="bg-red-900/70 text-red-200">Ouvert</Badge>
              </div>
              <div className="p-3 border border-slate-600 rounded-md bg-slate-800/50 flex justify-between items-center">
                <div className="flex items-center">
                  <Wifi className="h-4 w-4 text-green-400 mr-2" />
                  <span className="text-white">Cafe_Centre_WiFi_Secure</span>
                </div>
                <Badge className="bg-green-900/70 text-green-200">Sécurisé</Badge>
              </div>
              <div className="p-3 border border-slate-600 rounded-md bg-slate-800/50 flex justify-between items-center">
                <div className="flex items-center">
                  <Wifi className="h-4 w-4 text-green-400 mr-2" />
                  <span className="text-white">FREE_WIFI_CAFE</span>
                </div>
                <Badge className="bg-red-900/70 text-red-200">Ouvert</Badge>
              </div>
              <div className="p-3 border border-slate-600 rounded-md bg-slate-800/50 flex justify-between items-center">
                <div className="flex items-center">
                  <Wifi className="h-4 w-4 text-amber-400 mr-2" />
                  <span className="text-white">WiFi_Cafe_Gratuit</span>
                </div>
                <Badge className="bg-red-900/70 text-red-200">Ouvert</Badge>
              </div>
            </div>
          </div>
          <Alert className="bg-blue-950/50 border-blue-700/60">
            <Info className="h-4 w-4 text-blue-400" />
            <AlertTitle className="text-blue-400">Je suis votre smartphone en recherche de réseau</AlertTitle>
            <AlertDescription className="text-blue-200">
              Vous êtes dans un café et devez consulter vos emails. Quel réseau Wi-Fi choisiriez-vous et quelles précautions prendriez-vous ?
            </AlertDescription>
          </Alert>
        </div>
      ),
      options: [
        {
          id: 'wifi-option1',
          text: "Me connecter à n'importe quel réseau ouvert pour vérifier rapidement mes emails",
          correct: false,
          feedback: "C'est risqué. Les réseaux Wi-Fi ouverts n'offrent aucun chiffrement, exposant vos données (mots de passe, emails, informations bancaires) à quiconque surveille le réseau. De plus, certains réseaux peuvent être créés par des attaquants pour intercepter vos données."
        },
        {
          id: 'wifi-option2',
          text: "Me connecter uniquement au réseau sécurisé du café après avoir vérifié son authenticité auprès du personnel",
          correct: true,
          feedback: "Excellente décision ! Vérifier l'authenticité du réseau auprès du personnel et choisir un réseau sécurisé (chiffré) sont les bonnes pratiques à suivre. Cela réduit considérablement les risques d'interception de vos données."
        },
        {
          id: 'wifi-option3',
          text: "Utiliser les données mobiles de mon forfait plutôt qu'un Wi-Fi public pour des opérations sensibles",
          correct: true,
          feedback: "C'est l'option la plus sûre ! Les données mobiles offrent une connexion chiffrée et sécurisée. Pour des opérations sensibles (banque, emails professionnels), cette option est toujours préférable aux réseaux Wi-Fi publics, même ceux présentés comme sécurisés."
        },
        {
          id: 'wifi-option4',
          text: "Me connecter au réseau qui a le meilleur signal et utiliser des sites en HTTP",
          correct: false,
          feedback: "Cette approche est très dangereuse. La force du signal n'a aucun rapport avec la sécurité du réseau. De plus, utiliser des sites en HTTP (non chiffrés) sur un réseau public expose toutes vos communications. Toujours privilégier HTTPS et, idéalement, utiliser un VPN sur les réseaux publics."
        }
      ]
    }
  ];
  
  // Scénario actuel
  const currentScenario = scenarios[currentScenarioIndex];
  
  // Fonctions d'interaction
  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
    setShowFeedback(true);
    
    // Mettre à jour le score
    const option = currentScenario.options.find(opt => opt.id === optionId);
    if (option && option.correct) {
      setScore(score + 1);
    }
    
    // Marquer comme complété
    if (!completed.includes(currentScenario.id)) {
      setCompleted([...completed, currentScenario.id]);
      // Calculer la progression
      setUserProgress(Math.round(((completed.length + 1) / scenarios.length) * 100));
    }
  };
  
  const handleNextScenario = () => {
    if (currentScenarioIndex < scenarios.length - 1) {
      setCurrentScenarioIndex(currentScenarioIndex + 1);
    } else {
      setCurrentScenarioIndex(0); // Revenir au premier scénario
    }
    setShowFeedback(false);
    setSelectedOption(null);
    setShowTip(false);
  };
  
  const handleRestart = () => {
    setCurrentScenarioIndex(0);
    setShowFeedback(false);
    setSelectedOption(null);
    setScore(0);
    setCompleted([]);
    setUserProgress(0);
    setShowTip(false);
  };
  
  const handleToggleTip = () => {
    setShowTip(!showTip);
  };
  
  // Démarrage de l'expérience immersive
  const startExperience = () => {
    setUserStarted(true);
  };
  
  // Rendu conditionnnel avant le début de l'expérience
  if (!userStarted) {
    return (
      <div className="min-h-screen bg-[#0a1429] flex items-center justify-center">
        <PageTitle title="Cybersécurité pour débutants | Playground" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full p-6"
        >
          <Card className="bg-gradient-to-b from-blue-950 to-slate-900 border-blue-700/50 shadow-xl">
            <CardHeader className="pb-4">
              <div className="mx-auto bg-blue-600/20 p-4 rounded-full border border-blue-500/30 mb-4">
                <Shield className="h-12 w-12 text-blue-400" />
              </div>
              <CardTitle className="text-2xl text-white text-center">Playground Cybersécurité</CardTitle>
              <CardDescription className="text-blue-300 text-center">
                Vous allez entrer dans une expérience immersive pour apprendre à vous protéger des menaces numériques.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-blue-200">Comment souhaitez-vous être appelé(e) ?</p>
                <Input 
                  className="bg-blue-950/50 border-blue-700/50 text-white"
                  placeholder="Votre prénom ou pseudonyme"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
              </div>
              
              <Alert className="bg-amber-900/20 border-amber-700/30">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <AlertTitle className="text-amber-400">Objectif du playground</AlertTitle>
                <AlertDescription className="text-amber-200 text-sm">
                  Ce module interactif vous confrontera à des situations concrètes pour vous aider à 
                  identifier les menaces et à adopter les bons réflexes de cybersécurité.
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5" 
                onClick={startExperience}
                disabled={!userName.trim()}
              >
                <Shield className="mr-2 h-5 w-5" />
                Commencer l'expérience
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    );
  }
  
  // Rendu principal du playground
  return (
    <div className="min-h-screen bg-[#0a1429]">
      <PageTitle title="Cybersécurité pour débutants | Playground interactif" />
      
      {/* En-tête avec navigation et titre */}
      <div className="border-b border-blue-800/60">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/cyber/learning-center/modules/cyber-pour-debutants">
            <Button variant="ghost" className="text-blue-300 hover:bg-blue-900/30 hover:text-blue-200">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au module
            </Button>
          </Link>
          <h1 className="text-xl text-white font-medium">Playground Cybersécurité</h1>
          
          <div className="ml-auto flex items-center gap-3">
            <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1">
              {completed.length} / {scenarios.length} complétés
            </Badge>
            <Badge className="bg-gradient-to-r from-emerald-600 to-green-600 text-white px-3 py-1">
              Score: {score} points
            </Badge>
          </div>
        </div>
      </div>
      
      {/* Contenu principal */}
      <div className="container mx-auto px-4 py-8">
        {/* Progression */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-blue-300">Progression</span>
            <span className="text-sm text-blue-300">{userProgress}%</span>
          </div>
          <Progress value={userProgress} className="h-2" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Section principale avec le scénario */}
          <div className="lg:col-span-2">
            <motion.div
              key={currentScenario.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="bg-blue-950/40 border-blue-800/30 shadow-xl">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge className={`mb-2 ${
                        currentScenario.type === 'phishing' ? 'bg-red-600' : 
                        currentScenario.type === 'password' ? 'bg-amber-600' :
                        currentScenario.type === 'device' ? 'bg-blue-600' : 'bg-purple-600'
                      }`}>
                        {currentScenario.type === 'phishing' ? 'Phishing' : 
                         currentScenario.type === 'password' ? 'Mot de passe' :
                         currentScenario.type === 'device' ? 'Sécurité appareil' : 'Wi-Fi public'}
                      </Badge>
                      <CardTitle className="text-2xl text-white">{currentScenario.title}</CardTitle>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/30"
                      onClick={handleToggleTip}
                    >
                      <Info className="h-4 w-4 mr-1" />
                      Indice
                    </Button>
                  </div>
                  <CardDescription className="text-blue-300">
                    <span className="text-blue-400 font-medium italic">"{currentScenario.description}"</span>
                  </CardDescription>
                  
                  {showTip && (
                    <Alert className="mt-3 bg-blue-900/30 border-blue-700/40">
                      <Info className="h-4 w-4 text-blue-400" />
                      <AlertTitle className="text-blue-400">Conseil de sécurité</AlertTitle>
                      <AlertDescription className="text-blue-200 text-sm">
                        {currentScenario.type === 'phishing' ? 
                          "Examinez attentivement l'adresse de l'expéditeur, les fautes d'orthographe et méfiez-vous de tout sentiment d'urgence." : 
                        currentScenario.type === 'password' ? 
                          "Un bon mot de passe doit être long, complexe et unique. Une phrase de passe est souvent plus sécurisée et plus facile à retenir." :
                        currentScenario.type === 'device' ? 
                          "La sécurité d'un appareil repose sur plusieurs couches : verrouillage, mises à jour, sources d'applications et sauvegardes." :
                          "Sur les réseaux Wi-Fi publics, vos données peuvent être interceptées. Privilégiez les connexions sécurisées ou utilisez un VPN."}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="mb-6 mt-2">
                    {currentScenario.content}
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-white font-medium">Comment réagissez-vous, {userName} ?</h3>
                    {currentScenario.options.map((option) => (
                      <Button 
                        key={option.id}
                        className={`w-full justify-start text-left py-4 px-5 normal-case font-normal ${
                          selectedOption === option.id
                            ? option.correct 
                              ? 'bg-green-700 hover:bg-green-800 text-white'
                              : 'bg-red-700 hover:bg-red-800 text-white' 
                            : 'bg-slate-800 hover:bg-slate-700 text-white'
                        } ${showFeedback ? 'cursor-default' : ''}`}
                        onClick={() => !showFeedback && handleOptionSelect(option.id)}
                        disabled={showFeedback}
                      >
                        {selectedOption === option.id && (
                          option.correct ? 
                            <CheckCircle className="h-5 w-5 mr-2 text-green-200 flex-shrink-0" /> : 
                            <XCircle className="h-5 w-5 mr-2 text-red-200 flex-shrink-0" />
                        )}
                        <span>{option.text}</span>
                      </Button>
                    ))}
                  </div>
                  
                  {showFeedback && selectedOption && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Alert className={`mt-6 ${
                        currentScenario.options.find(o => o.id === selectedOption)?.correct
                          ? 'bg-green-900/30 border-green-700/50'
                          : 'bg-red-900/30 border-red-700/50'
                      }`}>
                        {currentScenario.options.find(o => o.id === selectedOption)?.correct ? (
                          <ThumbsUp className="h-4 w-4 text-green-400" />
                        ) : (
                          <ThumbsDown className="h-4 w-4 text-red-400" />
                        )}
                        <AlertTitle className={
                          currentScenario.options.find(o => o.id === selectedOption)?.correct
                            ? 'text-green-400'
                            : 'text-red-400'
                        }>
                          {currentScenario.options.find(o => o.id === selectedOption)?.correct
                            ? 'Bonne décision !'
                            : 'Attention !'}
                        </AlertTitle>
                        <AlertDescription className={
                          currentScenario.options.find(o => o.id === selectedOption)?.correct
                            ? 'text-green-200'
                            : 'text-red-200'
                        }>
                          {currentScenario.options.find(o => o.id === selectedOption)?.feedback}
                        </AlertDescription>
                      </Alert>
                      
                      <div className="mt-6 flex justify-end gap-3">
                        <Button
                          variant="outline"
                          className="border-blue-700 text-blue-400 hover:bg-blue-900/30 hover:text-blue-300"
                          onClick={handleNextScenario}
                        >
                          Scénario suivant
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
          
          {/* Sidebar avec infos et stats */}
          <div className="space-y-6">
            <Card className="bg-blue-950/40 border-blue-800/30 shadow-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-white">Votre score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-200">Score actuel</span>
                    <Badge className="bg-blue-600">{score} / {scenarios.length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-200">Scénarios complétés</span>
                    <Badge className="bg-purple-600">{completed.length} / {scenarios.length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-200">Niveau actuel</span>
                    <Badge className={
                      score === 0 ? "bg-red-600" : 
                      score <= 1 ? "bg-amber-600" : 
                      score <= 3 ? "bg-green-600" : 
                      "bg-blue-600"
                    }>
                      {score === 0 ? "Débutant" : 
                       score <= 1 ? "Novice" : 
                       score <= 3 ? "Intermédiaire" : 
                       "Avancé"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-blue-950/40 border-blue-800/30 shadow-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-white">Aide & Ressources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start text-blue-300 border-blue-700/50" onClick={handleRestart}>
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    Recommencer le playground
                  </Button>
                  <Link href="/cyber/learning-center" className="block">
                    <Button variant="outline" className="w-full justify-start text-blue-300 border-blue-700/50">
                      <FileText className="h-4 w-4 mr-2" />
                      Guide des bonnes pratiques
                    </Button>
                  </Link>
                  <a href="https://www.cybermalveillance.gouv.fr/" target="_blank" rel="noopener noreferrer" className="block">
                    <Button variant="outline" className="w-full justify-start text-blue-300 border-blue-700/50">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Cybermalveillance.gouv.fr
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-amber-950/40 border-amber-800/30 shadow-xl">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-amber-200 mb-3 flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-amber-400" />
                  Besoin d'aide ?
                </h3>
                <p className="text-amber-300 text-sm mb-4">
                  Si vous avez des questions ou souhaitez approfondir certains sujets, n'hésitez pas à 
                  utiliser notre assistant IA.
                </p>
                <Button className="w-full bg-amber-700 hover:bg-amber-600 text-white">
                  Consulter l'assistant IA
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}