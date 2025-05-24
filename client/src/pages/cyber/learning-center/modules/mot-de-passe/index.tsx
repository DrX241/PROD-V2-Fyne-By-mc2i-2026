import React, { useState } from 'react';
import { Link } from 'wouter';
import {
  ArrowLeft,
  Lock,
  Shield,
  Key,
  CheckCircle2,
  AlertTriangle,
  Fingerprint,
  PlayCircle,
  Lightbulb,
  Zap,
  Terminal,
  Calculator,
  Puzzle,
  RefreshCw,
  Eye,
  EyeOff,
  FileWarning,
  Layout
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import PageTitle from '@/components/utils/PageTitle';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function MotDePasseSecurite() {
  const [activeLesson, setActiveLesson] = useState('introduction');
  const [progress, setProgress] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  
  // États pour le générateur de mot de passe
  const [passwordLength, setPasswordLength] = useState(12);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  // Animation variants
  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  // Structure du cours
  const lessons = [
    { id: 'introduction', title: 'Introduction aux mots de passe', progress: 0 },
    { id: 'risques', title: 'Risques et menaces courantes', progress: 0 },
    { id: 'bonnes-pratiques', title: 'Bonnes pratiques', progress: 0 },
    { id: 'gestionnaires', title: 'Gestionnaires de mots de passe', progress: 0 },
    { id: 'generateur', title: 'Générateur de mot de passe', progress: 0 },
    { id: 'quiz', title: 'Quiz de validation', progress: 0 },
  ];

  // Questions du quiz
  const questions = [
    {
      question: "Parmi ces mots de passe, lequel est le plus sécurisé ?",
      options: [
        "MotDePasse123",
        "P@55w0rd",
        "j'aime le chocolat",
        "K7%tL9#qR2*xZ"
      ],
      correctAnswer: 3
    },
    {
      question: "Quelle pratique est la plus risquée en matière de mots de passe ?",
      options: [
        "Utiliser l'authentification à deux facteurs",
        "Utiliser le même mot de passe pour plusieurs comptes",
        "Changer régulièrement ses mots de passe",
        "Utiliser un gestionnaire de mots de passe"
      ],
      correctAnswer: 1
    },
    {
      question: "Quelle est la longueur minimale recommandée pour un mot de passe sécurisé en 2025 ?",
      options: [
        "6 caractères",
        "8 caractères",
        "12 caractères",
        "16 caractères"
      ],
      correctAnswer: 2
    },
    {
      question: "Parmi ces méthodes, laquelle est la plus sécurisée pour stocker vos mots de passe ?",
      options: [
        "Dans un fichier texte chiffré sur votre ordinateur",
        "Dans un carnet physique gardé en lieu sûr",
        "Dans un gestionnaire de mots de passe avec chiffrement",
        "Dans votre mémoire uniquement"
      ],
      correctAnswer: 2
    },
    {
      question: "Quelle méthode d'authentification offre généralement la meilleure sécurité ?",
      options: [
        "Un mot de passe complexe",
        "L'authentification à deux facteurs (2FA)",
        "Un PIN de 4 chiffres",
        "Une question de sécurité personnalisée"
      ],
      correctAnswer: 1
    }
  ];

  // Fonction pour générer un mot de passe aléatoire
  const generatePassword = () => {
    const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
    const numberChars = "0123456789";
    const symbolChars = "!@#$%^&*()_+~`|}{[]:;?><,./-=";
    
    let chars = "";
    if (includeUppercase) chars += uppercaseChars;
    if (includeLowercase) chars += lowercaseChars;
    if (includeNumbers) chars += numberChars;
    if (includeSymbols) chars += symbolChars;
    
    if (chars === "") {
      chars = lowercaseChars + numberChars;
    }
    
    let password = "";
    for (let i = 0; i < passwordLength; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      password += chars[randomIndex];
    }
    
    setGeneratedPassword(password);
    calculatePasswordStrength(password);
  };
  
  // Fonction pour calculer la force du mot de passe
  const calculatePasswordStrength = (password: string) => {
    // Un calcul simple de force basé sur diverses caractéristiques
    let strength = 0;
    
    // Longueur (jusqu'à 40%)
    strength += Math.min(password.length * 3, 40);
    
    // Présence de types de caractères (jusqu'à 60%)
    if (/[A-Z]/.test(password)) strength += 15;
    if (/[a-z]/.test(password)) strength += 10;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^A-Za-z0-9]/.test(password)) strength += 20;
    
    // Variété des caractères
    const uniqueChars = new Set(password).size;
    const uniqueRatio = uniqueChars / password.length;
    strength += Math.round(uniqueRatio * 10);
    
    // Limiter à 100
    strength = Math.min(strength, 100);
    
    setPasswordStrength(strength);
  };

  // Contenu des leçons
  const lessonContent: Record<string, React.ReactNode> = {
    introduction: (
      <div className="space-y-6">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={contentVariants}
        >
          <Alert className="bg-blue-900/30 border-blue-500">
            <Lightbulb className="h-5 w-5 text-blue-500" />
            <AlertTitle className="text-blue-100">Objectifs d'apprentissage</AlertTitle>
            <AlertDescription className="text-blue-200">
              À la fin de ce module, vous serez capable de :
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Comprendre les risques liés aux mots de passe faibles</li>
                <li>Créer des mots de passe robustes et mémorables</li>
                <li>Connaître les meilleures pratiques de gestion des mots de passe</li>
                <li>Utiliser efficacement un gestionnaire de mots de passe</li>
              </ul>
            </AlertDescription>
          </Alert>
          
          <div className="mt-6 space-y-4">
            <h2 className="text-2xl font-bold">Les mots de passe : première ligne de défense</h2>
            
            <p>
              Les mots de passe représentent la méthode d'authentification la plus répandue et constituent souvent la première - parfois l'unique - ligne de défense protégeant vos informations personnelles et professionnelles.
            </p>
            
            <div className="bg-blue-900/20 border border-blue-800 rounded-md p-4 my-4">
              <h3 className="text-lg font-medium mb-2">Définition</h3>
              <p>
                Un <strong>mot de passe</strong> est une chaîne de caractères utilisée pour vérifier l'identité d'un utilisateur et lui accorder l'accès à un système ou à des données. C'est un secret partagé uniquement entre l'utilisateur et le système.
              </p>
            </div>
            
            <div className="mt-6">
              <h3 className="text-xl font-bold">L'importance cruciale des mots de passe</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <Card className="bg-blue-900/20 border-blue-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <Key className="mr-2 h-5 w-5 text-blue-400" />
                      Portée de la protection
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <p className="mb-2">Vos mots de passe protègent notamment :</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-200">
                      <li>Comptes bancaires et financiers</li>
                      <li>E-mails et communications privées</li>
                      <li>Réseaux sociaux et réputation en ligne</li>
                      <li>Données professionnelles sensibles</li>
                      <li>Informations personnelles et médicales</li>
                      <li>Accès à des services essentiels</li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card className="bg-blue-900/20 border-blue-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <Shield className="mr-2 h-5 w-5 text-blue-400" />
                      Le paradoxe des mots de passe
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <p className="mb-2">Les mots de passe présentent un défi fondamental :</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-200">
                      <li>Ils doivent être suffisamment <strong>complexes</strong> pour résister aux attaques</li>
                      <li>Ils doivent être suffisamment <strong>simples</strong> pour être mémorisés</li>
                      <li>Ils doivent être <strong>uniques</strong> pour chaque service</li>
                      <li>Un utilisateur moyen gère aujourd'hui <strong>70 à 100</strong> comptes différents</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <div className="mt-4">
              <h3 className="text-xl font-bold">État des lieux en 2025</h3>
              
              <div className="bg-blue-950 border border-blue-800 rounded-lg p-4 mt-3">
                <h4 className="text-lg font-medium mb-2 flex items-center">
                  <Zap className="mr-2 h-5 w-5 text-blue-400" />
                  Chiffres clés
                </h4>
                <ul className="space-y-2">
                  <li><strong>81%</strong> des violations de données sont dues à des mots de passe faibles ou compromis</li>
                  <li>Un mot de passe de 8 caractères peut être craqué en <strong>moins d'une heure</strong> avec du matériel moderne</li>
                  <li><strong>59%</strong> des utilisateurs utilisent le même mot de passe sur plusieurs sites</li>
                  <li>Les 5 mots de passe les plus courants en 2024 étaient toujours <strong>"123456"</strong>, <strong>"password"</strong>, <strong>"qwerty"</strong>, <strong>"admin"</strong> et <strong>"welcome"</strong></li>
                </ul>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <Card className="bg-red-900/20 border-red-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md flex items-center">
                      <AlertTriangle className="mr-2 h-5 w-5 text-red-400" />
                      Habitudes risquées
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <ul className="list-disc list-inside space-y-1 text-red-200">
                      <li>Réutilisation des mêmes mots de passe</li>
                      <li>Utilisation d'informations personnelles</li>
                      <li>Partage de mots de passe entre collègues</li>
                      <li>Stockage non sécurisé (post-it, fichiers texte)</li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card className="bg-green-900/20 border-green-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md flex items-center">
                      <CheckCircle2 className="mr-2 h-5 w-5 text-green-400" />
                      Évolutions positives
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <ul className="list-disc list-inside space-y-1 text-green-200">
                      <li>Adoption croissante de l'authentification à deux facteurs</li>
                      <li>Utilisation de gestionnaires de mots de passe</li>
                      <li>Solutions biométriques complémentaires</li>
                      <li>Sensibilisation accrue dans les entreprises</li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card className="bg-amber-900/20 border-amber-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md flex items-center">
                      <Fingerprint className="mr-2 h-5 w-5 text-amber-400" />
                      Tendances futures
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <ul className="list-disc list-inside space-y-1 text-amber-200">
                      <li>Authentication sans mot de passe (FIDO2)</li>
                      <li>Authentification continue et contextuelle</li>
                      <li>Identités décentralisées et vérifiables</li>
                      <li>Analyse comportementale de l'utilisateur</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </motion.div>
        
        <div className="flex justify-between mt-8">
          <div></div>
          <Button onClick={() => setActiveLesson('risques')} className="bg-blue-700 hover:bg-blue-800">
            Continuer
            <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
          </Button>
        </div>
      </div>
    ),
    
    risques: (
      <div className="space-y-6">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={contentVariants}
        >
          <h2 className="text-2xl font-bold">Risques et menaces courantes</h2>
          
          <p className="mt-4">
            Comprendre les méthodes utilisées par les attaquants pour compromettre vos mots de passe est essentiel pour s'en protéger efficacement.
          </p>
          
          <div className="mt-6 space-y-5">
            <Card className="bg-blue-900/20 border-blue-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Terminal className="mr-2 h-5 w-5 text-blue-400" />
                  Attaques par force brute
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-3">
                  L'attaquant essaie systématiquement toutes les combinaisons possibles de caractères jusqu'à trouver le mot de passe correct.
                </p>
                <div className="bg-blue-950 p-3 rounded-md text-sm">
                  <p className="font-medium text-white">Temps estimé pour craquer un mot de passe par force brute :</p>
                  <Table className="text-xs mt-2">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mot de passe</TableHead>
                        <TableHead>Temps de craquage (approx.)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>8 caractères (lettres min)</TableCell>
                        <TableCell>8 heures</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>8 carac. (min + maj + chiffres)</TableCell>
                        <TableCell>22 jours</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>12 carac. (min + maj + chiffres)</TableCell>
                        <TableCell>7 millions d'années</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-blue-900/20 border-blue-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Calculator className="mr-2 h-5 w-5 text-blue-400" />
                  Attaques par dictionnaire
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-3">
                  Au lieu d'essayer toutes les combinaisons possibles, l'attaquant utilise une liste de mots courants, puis leurs variations.
                </p>
                <div className="mt-2 space-y-2">
                  <div className="bg-blue-800/20 p-2 rounded-md flex">
                    <div className="bg-red-800/40 px-2 py-1 rounded mr-2 text-sm">Risque élevé</div>
                    <p className="text-sm text-blue-200">Mots du dictionnaire : "password", "welcome", "monkey"</p>
                  </div>
                  <div className="bg-blue-800/20 p-2 rounded-md flex">
                    <div className="bg-red-800/40 px-2 py-1 rounded mr-2 text-sm">Risque élevé</div>
                    <p className="text-sm text-blue-200">Substitutions simples : "p@ssw0rd", "w3lc0me", "m0nk3y"</p>
                  </div>
                  <div className="bg-blue-800/20 p-2 rounded-md flex">
                    <div className="bg-red-800/40 px-2 py-1 rounded mr-2 text-sm">Risque élevé</div>
                    <p className="text-sm text-blue-200">Informations personnelles : noms d'enfants, dates de naissance, etc.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-blue-900/20 border-blue-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Eye className="mr-2 h-5 w-5 text-blue-400" />
                  Attaques par observation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-3">
                  Méthodes non techniques pour obtenir vos mots de passe :
                </p>
                <ul className="list-disc list-inside space-y-1 text-blue-200">
                  <li><strong>Shoulder surfing</strong> : Observer par-dessus l'épaule lors de la saisie</li>
                  <li><strong>Ingénierie sociale</strong> : Manipuler psychologiquement pour obtenir le mot de passe</li>
                  <li><strong>Phishing</strong> : Créer de faux sites pour récupérer les identifiants</li>
                  <li><strong>Recherche physique</strong> : Trouver des mots de passe notés (post-it, carnet)</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="bg-orange-900/20 border-orange-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <FileWarning className="mr-2 h-5 w-5 text-orange-400" />
                  Fuites de données
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-3">
                  Les violations de données massives constituent un risque majeur pour vos mots de passe :
                </p>
                <ul className="list-disc list-inside space-y-1 text-orange-200">
                  <li>Des milliards d'identifiants ont été exposés ces dernières années</li>
                  <li>Les attaquants disposent d'énormes bases de mots de passe déjà piratés</li>
                  <li>La réutilisation de mots de passe démultiplie les risques en cas de fuite</li>
                </ul>
                <div className="mt-3 bg-orange-950 p-3 rounded-md text-sm">
                  <p className="font-medium text-white">Impact de la réutilisation :</p>
                  <p className="text-orange-200 mt-1">En 2023, 73% des comptes compromis suite à une fuite de données sur un site A ont également été compromis sur d'autres sites en raison de la réutilisation du même mot de passe.</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-red-900/20 border-red-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5 text-red-400" />
                  Malwares spécialisés
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-3">
                  Certains logiciels malveillants sont spécifiquement conçus pour voler vos mots de passe :
                </p>
                <div className="space-y-2">
                  <div className="bg-red-900/30 p-2 rounded-md">
                    <h4 className="font-medium text-red-200">Keyloggers</h4>
                    <p className="text-sm text-red-300">Enregistrent toutes les frappes au clavier et les transmettent à l'attaquant.</p>
                  </div>
                  <div className="bg-red-900/30 p-2 rounded-md">
                    <h4 className="font-medium text-red-200">Clipboard stealers</h4>
                    <p className="text-sm text-red-300">Capturent le contenu du presse-papiers, ciblant les mots de passe copiés-collés.</p>
                  </div>
                  <div className="bg-red-900/30 p-2 rounded-md">
                    <h4 className="font-medium text-red-200">Password stealers</h4>
                    <p className="text-sm text-red-300">Extraient les mots de passe stockés dans les navigateurs web.</p>
                  </div>
                  <div className="bg-red-900/30 p-2 rounded-md">
                    <h4 className="font-medium text-red-200">Form grabbers</h4>
                    <p className="text-sm text-red-300">Interceptent les données saisies dans des formulaires web avant leur chiffrement.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="bg-blue-950 border border-blue-800 rounded-lg p-4 mt-6">
            <h3 className="text-lg font-medium mb-2 flex items-center">
              <Layout className="mr-2 h-5 w-5 text-blue-400" />
              Conséquences d'une compromission
            </h3>
            <p className="text-blue-200 mb-4">La compromission d'un seul mot de passe peut entraîner :</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-blue-900/30 p-3 rounded-md">
                <ul className="list-disc list-inside space-y-1 text-blue-200">
                  <li>Vol d'identité et usurpation</li>
                  <li>Accès à des informations confidentielles</li>
                  <li>Pertes financières directes</li>
                  <li>Atteinte à la réputation</li>
                </ul>
              </div>
              <div className="bg-blue-900/30 p-3 rounded-md">
                <ul className="list-disc list-inside space-y-1 text-blue-200">
                  <li>Accès à d'autres comptes (effet domino)</li>
                  <li>Utilisation de vos ressources à des fins malveillantes</li>
                  <li>Exposition de données personnelles</li>
                  <li>Coûts et temps de récupération</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
        
        <div className="flex justify-between mt-8">
          <Button onClick={() => setActiveLesson('introduction')} variant="outline" className="border-blue-700 text-blue-300">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Précédent
          </Button>
          <Button onClick={() => setActiveLesson('bonnes-pratiques')} className="bg-blue-700 hover:bg-blue-800">
            Continuer
            <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
          </Button>
        </div>
      </div>
    ),
    
    'bonnes-pratiques': (
      <div className="space-y-6">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={contentVariants}
        >
          <h2 className="text-2xl font-bold">Bonnes pratiques</h2>
          
          <Alert className="bg-blue-900/30 border-blue-500 mt-4">
            <Lightbulb className="h-5 w-5 text-blue-500" />
            <AlertTitle className="text-blue-100">Approche équilibrée</AlertTitle>
            <AlertDescription className="text-blue-200">
              Les recommandations actuelles en matière de mots de passe visent à équilibrer sécurité et facilité d'utilisation.
            </AlertDescription>
          </Alert>
          
          <div className="mt-6 space-y-5">
            <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-5">
              <h3 className="text-xl font-semibold mb-4">Création de mots de passe robustes</h3>
              
              <div className="space-y-4">
                <div className="bg-blue-800/30 p-3 rounded-md">
                  <h4 className="font-medium flex items-center">
                    <span className="bg-blue-700 text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">1</span>
                    Privilégier la longueur à la complexité
                  </h4>
                  <p className="mt-1 text-blue-200 text-sm">
                    Un mot de passe long est plus difficile à craquer qu'un mot de passe court et complexe. Visez au moins 12 caractères, idéalement 16 ou plus pour les comptes sensibles.
                  </p>
                </div>
                
                <div className="bg-blue-800/30 p-3 rounded-md">
                  <h4 className="font-medium flex items-center">
                    <span className="bg-blue-700 text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">2</span>
                    Utiliser des phrases de passe
                  </h4>
                  <p className="mt-1 text-blue-200 text-sm">
                    Les phrases de passe sont plus faciles à mémoriser et souvent plus sécurisées que des mots de passe complexes. Exemple : "ChienBleuMangePomme42!" est plus facile à retenir que "cB@mP42!".
                  </p>
                </div>
                
                <div className="bg-blue-800/30 p-3 rounded-md">
                  <h4 className="font-medium flex items-center">
                    <span className="bg-blue-700 text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">3</span>
                    Intégrer différents types de caractères
                  </h4>
                  <p className="mt-1 text-blue-200 text-sm">
                    Combinez majuscules, minuscules, chiffres et caractères spéciaux. Une astuce : remplacez certaines lettres par des symboles ressemblants ou associés (S par $, A par @, etc.).
                  </p>
                </div>
                
                <div className="bg-blue-800/30 p-3 rounded-md">
                  <h4 className="font-medium flex items-center">
                    <span className="bg-blue-700 text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">4</span>
                    Éviter les informations personnelles
                  </h4>
                  <p className="mt-1 text-blue-200 text-sm">
                    N'utilisez pas d'informations faciles à deviner ou à trouver comme votre nom, date de naissance, noms d'enfants, adresse ou numéro de téléphone.
                  </p>
                </div>
                
                <div className="bg-blue-800/30 p-3 rounded-md">
                  <h4 className="font-medium flex items-center">
                    <span className="bg-blue-700 text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">5</span>
                    Technique mnémotechnique
                  </h4>
                  <p className="mt-1 text-blue-200 text-sm">
                    Créez un mot de passe à partir des premières lettres d'une phrase que vous pouvez facilement mémoriser. Par exemple, "J'ai acheté 8 pommes vertes au marché en 2023!" devient "Ja8pvam!e2023".
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-xl font-bold">Gestion efficace des mots de passe</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <Card className="bg-green-900/20 border-green-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <CheckCircle2 className="mr-2 h-5 w-5 text-green-400" />
                      Recommandations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-1 text-green-200">
                      <li><strong>Un mot de passe unique par service</strong> pour limiter l'impact d'une fuite de données</li>
                      <li><strong>Authentification à deux facteurs (2FA)</strong> sur tous les comptes importants</li>
                      <li><strong>Changement de mot de passe</strong> uniquement en cas de compromission suspectée</li>
                      <li><strong>Utilisation d'un gestionnaire de mots de passe</strong> pour stocker et générer des mots de passe complexes</li>
                      <li><strong>Vérification régulière</strong> de vos comptes sur des sites comme "Have I Been Pwned"</li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card className="bg-red-900/20 border-red-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <AlertTriangle className="mr-2 h-5 w-5 text-red-400" />
                      Pratiques à éviter
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-1 text-red-200">
                      <li><strong>Partager vos mots de passe</strong> avec d'autres personnes</li>
                      <li><strong>Stocker des mots de passe</strong> en texte clair sur votre appareil</li>
                      <li><strong>Sauvegarder automatiquement</strong> vos mots de passe dans le navigateur sans protection supplémentaire</li>
                      <li><strong>Utiliser la même "base"</strong> de mot de passe avec des variations mineures</li>
                      <li><strong>Transmettre des mots de passe</strong> par e-mail ou messagerie non chiffrée</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-5 mt-4">
              <h3 className="text-xl font-bold mb-3">Méthode de hiérarchisation des mots de passe</h3>
              <p className="mb-4">
                Une approche pragmatique consiste à hiérarchiser vos mots de passe selon la sensibilité des comptes :
              </p>
              
              <div className="space-y-3">
                <div className="flex">
                  <div className="mr-3 bg-red-700 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium">Niveau critique</h4>
                    <p className="text-sm text-blue-200 mb-1">
                      Comptes bancaires, e-mail principal, gestionnaire de mots de passe
                    </p>
                    <div className="bg-blue-950/50 p-2 rounded text-xs">
                      Mot de passe unique, très fort (20+ caractères) + 2FA obligatoire
                    </div>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="mr-3 bg-amber-700 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium">Niveau important</h4>
                    <p className="text-sm text-blue-200 mb-1">
                      Réseaux sociaux, comptes professionnels, services de cloud
                    </p>
                    <div className="bg-blue-950/50 p-2 rounded text-xs">
                      Mot de passe unique et fort (16+ caractères) + 2FA recommandé
                    </div>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="mr-3 bg-green-700 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium">Niveau standard</h4>
                    <p className="text-sm text-blue-200 mb-1">
                      Forums, services d'information, applications diverses
                    </p>
                    <div className="bg-blue-950/50 p-2 rounded text-xs">
                      Mot de passe unique et robuste (12+ caractères) généré par gestionnaire
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-950 border border-blue-800 rounded-lg p-4 mt-6">
            <h3 className="text-lg font-medium mb-2 flex items-center">
              <Puzzle className="mr-2 h-5 w-5 text-amber-400" />
              Exemples concrets
            </h3>
            <p className="text-blue-200 mb-3">
              Comparaison d'approches pour créer des mots de passe :
            </p>
            <div className="space-y-2">
              <div className="bg-red-900/20 p-2 rounded-md flex justify-between items-center">
                <span className="text-sm">Mot1234$</span>
                <Badge variant="outline" className="bg-red-950 border-red-700 text-red-200">Faible</Badge>
              </div>
              <div className="bg-amber-900/20 p-2 rounded-md flex justify-between items-center">
                <span className="text-sm">M0t-d3-P@ss3</span>
                <Badge variant="outline" className="bg-amber-950 border-amber-700 text-amber-200">Moyen</Badge>
              </div>
              <div className="bg-green-900/20 p-2 rounded-md flex justify-between items-center">
                <span className="text-sm">4 chats gris mangent 27 souris!</span>
                <Badge variant="outline" className="bg-green-950 border-green-700 text-green-200">Fort</Badge>
              </div>
              <div className="bg-green-900/20 p-2 rounded-md flex justify-between items-center">
                <span className="text-sm">poirier*BATEAU*escalier98</span>
                <Badge variant="outline" className="bg-green-950 border-green-700 text-green-200">Fort</Badge>
              </div>
              <div className="bg-green-900/20 p-2 rounded-md flex justify-between items-center">
                <span className="text-sm">Jma8pvm!18/06</span>
                <Badge variant="outline" className="bg-green-950 border-green-700 text-green-200">Fort</Badge>
              </div>
            </div>
          </div>
        </motion.div>
        
        <div className="flex justify-between mt-8">
          <Button onClick={() => setActiveLesson('risques')} variant="outline" className="border-blue-700 text-blue-300">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Précédent
          </Button>
          <Button onClick={() => setActiveLesson('gestionnaires')} className="bg-blue-700 hover:bg-blue-800">
            Continuer
            <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
          </Button>
        </div>
      </div>
    ),
    
    gestionnaires: (
      <div className="space-y-6">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={contentVariants}
        >
          <h2 className="text-2xl font-bold">Gestionnaires de mots de passe</h2>
          
          <p className="mt-4">
            Face à la multiplication des comptes en ligne, les gestionnaires de mots de passe sont devenus indispensables pour concilier sécurité et praticité.
          </p>
          
          <div className="mt-6 space-y-6">
            <Card className="bg-blue-900/20 border-blue-800">
              <CardHeader>
                <CardTitle>Qu'est-ce qu'un gestionnaire de mots de passe ?</CardTitle>
                <CardDescription className="text-blue-200">
                  Un outil sécurisé qui stocke, génère et remplit automatiquement vos identifiants
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-800/20 p-3 rounded-md">
                  <h3 className="font-medium">Principe de fonctionnement</h3>
                  <p className="text-sm text-blue-200 mt-1">
                    Les gestionnaires de mots de passe stockent vos identifiants dans un coffre-fort numérique hautement sécurisé. Vous n'avez besoin de mémoriser qu'un seul mot de passe maître pour y accéder. Les données sont chiffrées localement avec des algorithmes puissants (généralement AES-256).
                  </p>
                </div>
                
                <div className="bg-blue-800/20 p-3 rounded-md">
                  <h3 className="font-medium">Fonctionnalités principales</h3>
                  <ul className="list-disc list-inside text-sm space-y-1 text-blue-200 mt-1">
                    <li><strong>Génération automatique</strong> de mots de passe complexes et uniques</li>
                    <li><strong>Remplissage automatique</strong> des formulaires d'identification</li>
                    <li><strong>Synchronisation</strong> entre appareils (ordinateurs, smartphones, tablettes)</li>
                    <li><strong>Analyse de sécurité</strong> pour identifier les mots de passe faibles ou réutilisés</li>
                    <li><strong>Stockage sécurisé</strong> de notes, cartes bancaires et autres informations sensibles</li>
                  </ul>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-900/20 border border-green-800 p-3 rounded-md">
                    <h3 className="font-medium flex items-center">
                      <CheckCircle2 className="mr-2 h-5 w-5 text-green-400" />
                      Avantages
                    </h3>
                    <ul className="list-disc list-inside text-sm space-y-1 text-green-200 mt-2">
                      <li>Utilisation de mots de passe vraiment complexes sans avoir à les mémoriser</li>
                      <li>Réduction des risques liés à la réutilisation de mots de passe</li>
                      <li>Gain de temps significatif dans la gestion quotidienne</li>
                      <li>Protection contre le phishing (ne remplit pas les formulaires sur les faux sites)</li>
                      <li>Conservation d'un inventaire à jour de tous vos comptes</li>
                    </ul>
                  </div>
                  
                  <div className="bg-amber-900/20 border border-amber-800 p-3 rounded-md">
                    <h3 className="font-medium flex items-center">
                      <AlertTriangle className="mr-2 h-5 w-5 text-amber-400" />
                      Points d'attention
                    </h3>
                    <ul className="list-disc list-inside text-sm space-y-1 text-amber-200 mt-2">
                      <li>Le mot de passe maître devient un point unique de défaillance</li>
                      <li>Certaines solutions nécessitent un abonnement pour les fonctionnalités avancées</li>
                      <li>Une période d'adaptation est nécessaire au début</li>
                      <li>Importance de choisir une solution fiable et bien maintenue</li>
                      <li>Nécessité de prévoir une procédure de récupération</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-5">
              <h3 className="text-xl font-bold mb-3">Comment choisir un gestionnaire de mots de passe</h3>
              
              <div className="space-y-4">
                <div className="bg-blue-800/30 p-3 rounded-md">
                  <h4 className="font-medium">Critères de sélection essentiels</h4>
                  <ul className="list-disc list-inside text-sm space-y-1 text-blue-200 mt-2">
                    <li><strong>Sécurité</strong> : Chiffrement de bout en bout, audits de sécurité indépendants</li>
                    <li><strong>Compatibilité</strong> : Support de vos appareils et navigateurs</li>
                    <li><strong>Facilité d'utilisation</strong> : Interface intuitive, intégration fluide</li>
                    <li><strong>Fonctionnalités</strong> : Génération de mots de passe, analyses de sécurité, partage sécurisé</li>
                    <li><strong>Confidentialité</strong> : Politique claire sur les données collectées</li>
                    <li><strong>Options de récupération</strong> : Mécanismes en cas d'oubli du mot de passe maître</li>
                  </ul>
                </div>
                
                <div className="bg-blue-800/30 p-3 rounded-md">
                  <h4 className="font-medium">Types de gestionnaires</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                    <div className="bg-blue-900/30 p-2 rounded-md">
                      <h5 className="text-sm font-medium">Applications locales</h5>
                      <p className="text-xs text-blue-300 mt-1">Stockent les données uniquement sur votre appareil, offrant un contrôle total mais limitant la synchronisation.</p>
                    </div>
                    <div className="bg-blue-900/30 p-2 rounded-md">
                      <h5 className="text-sm font-medium">Services cloud</h5>
                      <p className="text-xs text-blue-300 mt-1">Stockent les données chiffrées sur des serveurs distants, permettant la synchronisation entre appareils.</p>
                    </div>
                    <div className="bg-blue-900/30 p-2 rounded-md">
                      <h5 className="text-sm font-medium">Extensions de navigateur</h5>
                      <p className="text-xs text-blue-300 mt-1">Intégration directe au navigateur pour une expérience plus fluide, souvent couplée à une application.</p>
                    </div>
                    <div className="bg-blue-900/30 p-2 rounded-md">
                      <h5 className="text-sm font-medium">Systèmes intégrés</h5>
                      <p className="text-xs text-blue-300 mt-1">Fonctionnalités natives des systèmes d'exploitation ou navigateurs (Apple Keychain, Google Password Manager).</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <Alert className="bg-green-900/30 border-green-600">
              <Lightbulb className="h-5 w-5 text-green-500" />
              <AlertTitle>Bonnes pratiques avec un gestionnaire</AlertTitle>
              <AlertDescription className="text-green-200">
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li>Créez un mot de passe maître très fort mais mémorisable (phrase de passe de 5+ mots)</li>
                  <li>Activez l'authentification à deux facteurs pour accéder à votre gestionnaire</li>
                  <li>Effectuez régulièrement des sauvegardes de votre coffre-fort</li>
                  <li>Mettez à jour votre gestionnaire dès qu'une nouvelle version est disponible</li>
                  <li>Utilisez l'audit de sécurité pour remplacer les mots de passe faibles ou compromis</li>
                </ul>
              </AlertDescription>
            </Alert>
            
            <div className="bg-blue-950 border border-blue-800 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-2 flex items-center">
                <RefreshCw className="mr-2 h-5 w-5 text-blue-400" />
                Migration vers un gestionnaire
              </h3>
              <p className="text-blue-200 mb-3">
                Transition en douceur vers un gestionnaire de mots de passe :
              </p>
              <ol className="space-y-2 list-decimal list-inside">
                <li className="text-blue-200">Choisissez votre gestionnaire et créez un compte</li>
                <li className="text-blue-200">Installez l'application sur tous vos appareils</li>
                <li className="text-blue-200">Commencez par vos comptes les plus importants</li>
                <li className="text-blue-200">Au fur et à mesure des connexions, laissez le gestionnaire capturer et mettre à jour vos identifiants</li>
                <li className="text-blue-200">Pour les comptes avec des mots de passe faibles, programmez des changements progressifs</li>
                <li className="text-blue-200">Prenez le temps d'explorer les fonctionnalités avancées (générateur, audit, etc.)</li>
              </ol>
            </div>
          </div>
        </motion.div>
        
        <div className="flex justify-between mt-8">
          <Button onClick={() => setActiveLesson('bonnes-pratiques')} variant="outline" className="border-blue-700 text-blue-300">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Précédent
          </Button>
          <Button onClick={() => setActiveLesson('generateur')} className="bg-blue-700 hover:bg-blue-800">
            Continuer
            <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
          </Button>
        </div>
      </div>
    ),
    
    generateur: (
      <div className="space-y-6">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={contentVariants}
        >
          <h2 className="text-2xl font-bold">Générateur de mot de passe</h2>
          
          <p className="mt-4">
            Utilisez cet outil pour créer des mots de passe forts et aléatoires pour vos différents comptes.
          </p>
          
          <div className="mt-6">
            <Card className="bg-blue-900/20 border-blue-800">
              <CardHeader>
                <CardTitle>Créer un mot de passe sécurisé</CardTitle>
                <CardDescription className="text-blue-200">
                  Personnalisez les paramètres selon vos besoins et générez un mot de passe unique
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium">Longueur du mot de passe: {passwordLength} caractères</label>
                    </div>
                    <Slider
                      value={[passwordLength]}
                      min={8}
                      max={30}
                      step={1}
                      onValueChange={(val) => setPasswordLength(val[0])}
                      className="mb-2"
                    />
                    <div className="flex justify-between text-xs text-blue-400">
                      <span>8</span>
                      <span>16</span>
                      <span>24</span>
                      <span>30</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="uppercase" 
                        checked={includeUppercase}
                        onChange={() => setIncludeUppercase(!includeUppercase)}
                        className="h-4 w-4 rounded border-blue-700 text-blue-600 focus:ring-blue-600"
                      />
                      <label htmlFor="uppercase" className="text-sm">Majuscules (A-Z)</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="lowercase" 
                        checked={includeLowercase}
                        onChange={() => setIncludeLowercase(!includeLowercase)}
                        className="h-4 w-4 rounded border-blue-700 text-blue-600 focus:ring-blue-600"
                      />
                      <label htmlFor="lowercase" className="text-sm">Minuscules (a-z)</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="numbers" 
                        checked={includeNumbers}
                        onChange={() => setIncludeNumbers(!includeNumbers)}
                        className="h-4 w-4 rounded border-blue-700 text-blue-600 focus:ring-blue-600"
                      />
                      <label htmlFor="numbers" className="text-sm">Chiffres (0-9)</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="symbols" 
                        checked={includeSymbols}
                        onChange={() => setIncludeSymbols(!includeSymbols)}
                        className="h-4 w-4 rounded border-blue-700 text-blue-600 focus:ring-blue-600"
                      />
                      <label htmlFor="symbols" className="text-sm">Symboles (!@#$...)</label>
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={generatePassword}
                  className="w-full bg-blue-700 hover:bg-blue-800"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Générer un mot de passe
                </Button>
                
                {generatedPassword && (
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Votre mot de passe :</label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          value={generatedPassword}
                          readOnly
                          className="pr-10 bg-blue-950/50 border-blue-700 text-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-300 hover:text-blue-100"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Force du mot de passe :</span>
                        <span className={
                          passwordStrength < 40 ? "text-red-400" :
                          passwordStrength < 70 ? "text-amber-400" : "text-green-400"
                        }>
                          {passwordStrength < 40 ? "Faible" : 
                          passwordStrength < 70 ? "Moyen" : "Fort"}
                        </span>
                      </div>
                      <Progress 
                        value={passwordStrength} 
                        className="h-2" 
                        indicatorClassName={
                          passwordStrength < 40 ? "bg-red-500" :
                          passwordStrength < 70 ? "bg-amber-500" : "bg-green-500"
                        }
                      />
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        onClick={() => {
                          navigator.clipboard.writeText(generatedPassword);
                          // Ici, on pourrait ajouter une notification de succès
                        }}
                        variant="outline"
                        className="flex-1 border-blue-700 text-blue-300"
                      >
                        Copier
                      </Button>
                      <Button onClick={generatePassword} className="flex-1 bg-blue-700 hover:bg-blue-800">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Regénérer
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-blue-900/20 border-blue-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md flex items-center">
                    <Zap className="mr-2 h-5 w-5 text-blue-400" />
                    Estimation du temps de craquage
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <p className="mb-2">Temps approximatif pour craquer par force brute :</p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>8 caractères :</span>
                      <span className="text-red-400">Quelques heures</span>
                    </div>
                    <div className="flex justify-between">
                      <span>12 caractères :</span>
                      <span className="text-amber-400">~2 ans</span>
                    </div>
                    <div className="flex justify-between">
                      <span>16 caractères :</span>
                      <span className="text-green-400">Des millions d'années</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-blue-900/20 border-blue-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md flex items-center">
                    <Lightbulb className="mr-2 h-5 w-5 text-blue-400" />
                    Conseils d'utilisation
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <ul className="list-disc list-inside space-y-1 text-blue-200">
                    <li>Générez un mot de passe différent pour chaque service</li>
                    <li>Utilisez un gestionnaire pour les stocker</li>
                    <li>Privilégiez les mots de passe les plus longs possibles</li>
                    <li>Activez la 2FA en complément</li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card className="bg-blue-900/20 border-blue-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md flex items-center">
                    <Eye className="mr-2 h-5 w-5 text-blue-400" />
                    Confidentialité
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <p className="text-blue-200">
                    Ce générateur fonctionne entièrement dans votre navigateur. Les mots de passe générés ne sont jamais transmis à un serveur ni stockés.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
        
        <div className="flex justify-between mt-8">
          <Button onClick={() => setActiveLesson('gestionnaires')} variant="outline" className="border-blue-700 text-blue-300">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Précédent
          </Button>
          <Button onClick={() => setActiveLesson('quiz')} className="bg-blue-700 hover:bg-blue-800">
            Quiz final
            <PlayCircle className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    ),
    
    quiz: (
      <div className="space-y-6">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={contentVariants}
        >
          <h2 className="text-2xl font-bold">Quiz : Gestion des mots de passe</h2>
          
          {!quizStarted && !quizCompleted ? (
            <div className="mt-6">
              <Card className="bg-blue-900/20 border-blue-800">
                <CardHeader>
                  <CardTitle>Évaluez vos connaissances</CardTitle>
                  <CardDescription className="text-blue-200">
                    Ce quiz comporte 5 questions pour tester votre compréhension des bonnes pratiques en matière de mots de passe.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-800/20 p-4 rounded-md">
                    <h3 className="font-medium">Instructions</h3>
                    <ul className="list-disc list-inside text-sm text-blue-200 mt-2 space-y-1">
                      <li>Sélectionnez la meilleure réponse pour chaque question</li>
                      <li>Vous obtiendrez votre score à la fin du quiz</li>
                      <li>Une explication sera fournie pour chaque réponse</li>
                    </ul>
                  </div>
                  
                  <Button 
                    className="w-full bg-blue-700 hover:bg-blue-800"
                    onClick={() => setQuizStarted(true)}
                  >
                    <PlayCircle className="mr-2 h-5 w-5" />
                    Commencer le quiz
                  </Button>
                </CardContent>
              </Card>
              
              <div className="mt-8">
                <Button onClick={() => setActiveLesson('generateur')} variant="outline" className="border-blue-700 text-blue-300">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Revenir au contenu
                </Button>
              </div>
            </div>
          ) : quizStarted && !quizCompleted ? (
            <div className="mt-6">
              <Card className="bg-blue-900/20 border-blue-800">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Question {currentQuestion + 1} sur {questions.length}</CardTitle>
                    <Badge className="bg-blue-700">{currentQuestion + 1}/{questions.length}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-blue-800/20 p-4 rounded-md">
                    <h3 className="font-medium text-lg">{questions[currentQuestion].question}</h3>
                  </div>
                  
                  <div className="space-y-3">
                    {questions[currentQuestion].options.map((option, index) => (
                      <Button 
                        key={index}
                        variant="outline" 
                        className="w-full justify-start border-blue-700 hover:bg-blue-800/50 p-4 h-auto"
                        onClick={() => {
                          if (index === questions[currentQuestion].correctAnswer) {
                            setScore(score + 1);
                          }
                          
                          if (currentQuestion < questions.length - 1) {
                            setCurrentQuestion(currentQuestion + 1);
                          } else {
                            setQuizCompleted(true);
                          }
                        }}
                      >
                        <div className="mr-3 bg-blue-700/80 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span className="text-left">{option}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="mt-6">
              <Card className={`${score >= 4 ? 'bg-green-900/20 border-green-800' : score >= 2 ? 'bg-amber-900/20 border-amber-800' : 'bg-red-900/20 border-red-800'}`}>
                <CardHeader>
                  <CardTitle>Résultats du quiz</CardTitle>
                  <CardDescription className={`${score >= 4 ? 'text-green-200' : score >= 2 ? 'text-amber-200' : 'text-red-200'}`}>
                    Vous avez obtenu {score}/{questions.length} bonnes réponses.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className={`p-4 rounded-md ${score >= 4 ? 'bg-green-800/20' : score >= 2 ? 'bg-amber-800/20' : 'bg-red-800/20'}`}>
                    <h3 className="font-medium">
                      {score >= 4 
                        ? 'Excellent ! Vous maîtrisez les bonnes pratiques en matière de mots de passe.' 
                        : score >= 2 
                          ? 'Pas mal ! Vous avez des connaissances de base mais quelques points à approfondir.' 
                          : 'Vous devriez revoir ce module pour mieux comprendre la sécurité des mots de passe.'}
                    </h3>
                    <p className={`mt-2 text-sm ${score >= 4 ? 'text-green-200' : score >= 2 ? 'text-amber-200' : 'text-red-200'}`}>
                      {score >= 4 
                        ? 'Appliquez ces connaissances au quotidien et partagez-les avec votre entourage pour améliorer la sécurité de tous.' 
                        : 'Concentrez-vous particulièrement sur la création de mots de passe forts et l\'utilisation de gestionnaires de mots de passe.'}
                    </p>
                  </div>
                  
                  <div className="flex flex-col gap-4">
                    <Button 
                      variant="outline" 
                      className="border-blue-700 text-blue-300"
                      onClick={() => {
                        setQuizStarted(false);
                        setQuizCompleted(false);
                        setCurrentQuestion(0);
                        setScore(0);
                        setActiveLesson('introduction');
                      }}
                    >
                      Revoir le module
                    </Button>
                    
                    <Button 
                      className="bg-blue-700 hover:bg-blue-800"
                      onClick={() => {
                        // Ici, on pourrait enregistrer la progression
                        // Pour l'instant, on simule juste un retour à l'accueil
                      }}
                    >
                      <CheckCircle2 className="mr-2 h-5 w-5" />
                      Terminer et retourner à l'accueil
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </motion.div>
      </div>
    )
  };

  // Navigation principale entre les leçons
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <Link href="/cyber/learning-center">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au Centre d'Apprentissage
          </Button>
        </Link>
        <PageTitle
          title="Gestion des mots de passe"
          subtitle="Bonnes pratiques pour des mots de passe sécurisés"
          icon={<Lock className="h-8 w-8 text-blue-500" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Panneau latéral */}
        <div className="space-y-6">
          <Card className="bg-blue-900/20 border-blue-800">
            <CardHeader>
              <CardTitle className="text-lg">Progression</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-4 border-b border-blue-800">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progression globale</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
              
              <div className="py-2">
                {lessons.map((lesson) => (
                  <button
                    key={lesson.id}
                    className={`w-full text-left py-2 px-4 flex items-center justify-between hover:bg-blue-800/30 transition-colors ${activeLesson === lesson.id ? 'bg-blue-800/30 font-medium' : ''}`}
                    onClick={() => setActiveLesson(lesson.id)}
                  >
                    <span>{lesson.title}</span>
                    {lesson.progress > 0 && (
                      <Badge variant="outline" className="bg-blue-800/50 border-blue-700">
                        {lesson.progress}%
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-blue-900/20 border-blue-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Informations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-blue-300">Durée</span>
                  <span>20-30 min</span>
                </div>
                <Separator className="bg-blue-800/50" />
                <div className="flex justify-between">
                  <span className="text-blue-300">Niveau</span>
                  <Badge>Débutant</Badge>
                </div>
                <Separator className="bg-blue-800/50" />
                <div className="flex justify-between">
                  <span className="text-blue-300">Catégorie</span>
                  <span>Sécurité</span>
                </div>
                <Separator className="bg-blue-800/50" />
                <div className="flex justify-between">
                  <span className="text-blue-300">Mise à jour</span>
                  <span>Avril 2025</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Contenu principal */}
        <div className="lg:col-span-3">
          <Card className="bg-blue-900/20 border-blue-800">
            <CardContent className="pt-6">
              {lessonContent[activeLesson]}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}