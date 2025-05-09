import React, { useState } from 'react';
import { Link } from 'wouter';
import {
  ArrowLeft,
  Smartphone,
  Tablet,
  Laptop,
  AlertTriangle,
  CheckCircle2,
  Shield,
  PlayCircle,
  Lightbulb,
  Zap,
  Lock,
  FileWarning,
  Wifi,
  Settings,
  Building
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import PageTitle from '@/components/utils/PageTitle';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function BYODSecurite() {
  const [activeLesson, setActiveLesson] = useState('introduction');
  const [progress, setProgress] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);

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
    { id: 'introduction', title: 'Introduction au BYOD', progress: 0 },
    { id: 'risques', title: 'Risques et menaces', progress: 0 },
    { id: 'politiques', title: 'Politiques BYOD', progress: 0 },
    { id: 'securisation', title: 'Sécurisation des appareils', progress: 0 },
    { id: 'mdm', title: 'Solutions MDM et alternatives', progress: 0 },
    { id: 'quiz', title: 'Quiz de validation', progress: 0 },
  ];

  // Questions du quiz
  const questions = [
    {
      question: "Que signifie l'acronyme BYOD ?",
      options: [
        "Breach Your Own Device",
        "Bring Your Own Device",
        "Business Yield On Devices",
        "Build Your Own Database"
      ],
      correctAnswer: 1
    },
    {
      question: "Quel est l'un des principaux risques de sécurité associés au BYOD ?",
      options: [
        "Consommation excessive de bande passante réseau",
        "Coûts élevés pour l'entreprise",
        "Mélange des données personnelles et professionnelles",
        "Incompatibilité avec les systèmes d'exploitation récents"
      ],
      correctAnswer: 2
    },
    {
      question: "Quelle est la meilleure approche pour sécuriser les appareils BYOD ?",
      options: [
        "Interdire complètement l'utilisation d'appareils personnels",
        "Installer uniquement un antivirus sur chaque appareil",
        "Mettre en place une solution MDM avec une politique BYOD claire",
        "Ne permettre l'accès qu'aux applications web via le navigateur"
      ],
      correctAnswer: 2
    },
    {
      question: "Qu'est-ce qu'une solution MDM ?",
      options: [
        "Un logiciel antivirus pour appareils mobiles",
        "Un système de gestion des appareils mobiles",
        "Un type de chiffrement des données mobiles",
        "Un protocole de sécurité pour les réseaux Wi-Fi"
      ],
      correctAnswer: 1
    },
    {
      question: "Quelle mesure n'est PAS adaptée à une stratégie BYOD efficace ?",
      options: [
        "Mettre en place une authentification à deux facteurs pour l'accès aux ressources de l'entreprise",
        "Chiffrer les données sensibles sur les appareils",
        "Installer automatiquement toutes les applications d'entreprise sur l'appareil personnel",
        "Former les utilisateurs aux bonnes pratiques de sécurité"
      ],
      correctAnswer: 2
    }
  ];

  // Contenu des leçons
  const lessonContent = {
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
                <li>Comprendre le concept BYOD et ses enjeux pour les organisations</li>
                <li>Identifier les risques de sécurité associés à l'utilisation d'appareils personnels</li>
                <li>Élaborer une politique BYOD équilibrée et efficace</li>
                <li>Connaître les meilleures pratiques pour sécuriser les appareils personnels en contexte professionnel</li>
                <li>Évaluer les solutions de gestion des appareils mobiles (MDM) et leurs alternatives</li>
              </ul>
            </AlertDescription>
          </Alert>
          
          <div className="mt-6 space-y-4">
            <h2 className="text-2xl font-bold">Qu'est-ce que le BYOD ?</h2>
            
            <p>
              BYOD (<strong>B</strong>ring <strong>Y</strong>our <strong>O</strong>wn <strong>D</strong>evice) ou "Apportez Votre Équipement Personnel de Communication" (AVEC) en français, désigne la pratique consistant à autoriser les employés à utiliser leurs appareils personnels (smartphones, tablettes, ordinateurs portables) pour accéder aux données et applications de l'entreprise.
            </p>
            
            <div className="bg-blue-900/20 border border-blue-800 rounded-md p-4 my-4">
              <h3 className="text-lg font-medium mb-2">Définition</h3>
              <p>
                Le <strong>BYOD</strong> est une politique d'entreprise qui permet aux employés d'utiliser leurs propres appareils pour effectuer des tâches professionnelles, que ce soit au bureau ou à distance. Cette approche estompe les frontières traditionnelles entre les équipements personnels et professionnels.
              </p>
            </div>
            
            <div className="mt-6">
              <h3 className="text-xl font-bold">Évolution du phénomène BYOD</h3>
              
              <div className="space-y-4 mt-3">
                <div className="relative pl-6 border-l-2 border-blue-700 pl-10">
                  <div className="absolute left-0 top-0 w-6 h-6 -ml-3 rounded-full bg-blue-700 flex items-center justify-center text-xs">09</div>
                  <h4 className="font-medium">Avant 2009</h4>
                  <p className="text-sm text-blue-200">Séparation stricte entre appareils professionnels et personnels. Les entreprises imposaient généralement des appareils standardisés (souvent BlackBerry pour les mobiles).</p>
                </div>
                
                <div className="relative pl-6 border-l-2 border-blue-700 pl-10">
                  <div className="absolute left-0 top-0 w-6 h-6 -ml-3 rounded-full bg-blue-700 flex items-center justify-center text-xs">11</div>
                  <h4 className="font-medium">2009-2011 : Émergence du BYOD</h4>
                  <p className="text-sm text-blue-200">Popularisation des smartphones (iPhone, Android) et augmentation de la demande des employés pour utiliser leurs appareils préférés au travail. Premiers programmes BYOD formalisés.</p>
                </div>
                
                <div className="relative pl-6 border-l-2 border-blue-700 pl-10">
                  <div className="absolute left-0 top-0 w-6 h-6 -ml-3 rounded-full bg-blue-700 flex items-center justify-center text-xs">15</div>
                  <h4 className="font-medium">2012-2015 : Développement des solutions</h4>
                  <p className="text-sm text-blue-200">Explosion du marché des solutions MDM (Mobile Device Management) et émergence des conteneurs de données. Formalisation des politiques BYOD dans les grandes organisations.</p>
                </div>
                
                <div className="relative pl-6 border-l-2 border-blue-700 pl-10">
                  <div className="absolute left-0 top-0 w-6 h-6 -ml-3 rounded-full bg-blue-700 flex items-center justify-center text-xs">20</div>
                  <h4 className="font-medium">2016-2020 : BYOD généralisé</h4>
                  <p className="text-sm text-blue-200">Adoption massive par les entreprises de toutes tailles. Perfectionnement des solutions de sécurité et de gestion. Le BYOD devient la norme plutôt que l'exception dans de nombreux secteurs.</p>
                </div>
                
                <div className="relative pl-6 pl-10">
                  <div className="absolute left-0 top-0 w-6 h-6 -ml-3 rounded-full bg-blue-700 flex items-center justify-center text-xs">25</div>
                  <h4 className="font-medium">2021-2025 : BYOD post-pandémie</h4>
                  <p className="text-sm text-blue-200">La pandémie de COVID-19 et le télétravail généralisé ont accéléré l'adoption du BYOD. Convergence avec d'autres tendances comme le Zero Trust et les technologies VDI (Virtual Desktop Infrastructure).</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-xl font-bold">Variantes et concepts associés</h3>
              
              <Card className="bg-blue-900/20 border-blue-800 mt-3">
                <CardContent className="pt-6">
                  <Tabs defaultValue="byod">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="byod">BYOD</TabsTrigger>
                      <TabsTrigger value="cope">COPE</TabsTrigger>
                      <TabsTrigger value="others">Autres modèles</TabsTrigger>
                    </TabsList>
                    <TabsContent value="byod" className="p-4 bg-blue-950/30 rounded-md mt-4">
                      <h4 className="font-medium flex items-center">
                        <Smartphone className="mr-2 h-5 w-5 text-blue-400" />
                        BYOD (Bring Your Own Device)
                      </h4>
                      <p className="mt-2 text-sm text-blue-200">
                        Modèle dans lequel l'employé achète et possède l'appareil, qu'il utilise pour ses besoins personnels et professionnels.
                      </p>
                      <div className="mt-3">
                        <p className="text-xs font-medium">Caractéristiques :</p>
                        <ul className="list-disc list-inside mt-1 space-y-1 text-xs text-blue-300">
                          <li>Propriété et choix de l'appareil par l'employé</li>
                          <li>Gestion partagée entre l'entreprise et l'employé</li>
                          <li>Responsabilité de l'employé pour la maintenance et les réparations</li>
                          <li>Généralement, une allocation ou un remboursement partiel peut être offert</li>
                        </ul>
                      </div>
                    </TabsContent>
                    <TabsContent value="cope" className="p-4 bg-blue-950/30 rounded-md mt-4">
                      <h4 className="font-medium flex items-center">
                        <Laptop className="mr-2 h-5 w-5 text-blue-400" />
                        COPE (Corporate-Owned, Personally-Enabled)
                      </h4>
                      <p className="mt-2 text-sm text-blue-200">
                        Modèle dans lequel l'entreprise achète et possède l'appareil, mais autorise son utilisation à des fins personnelles.
                      </p>
                      <div className="mt-3">
                        <p className="text-xs font-medium">Caractéristiques :</p>
                        <ul className="list-disc list-inside mt-1 space-y-1 text-xs text-blue-300">
                          <li>Propriété et choix limité de l'appareil par l'entreprise</li>
                          <li>Contrôle plus important pour l'organisation</li>
                          <li>Responsabilité de l'entreprise pour la maintenance</li>
                          <li>Meilleur équilibre sécurité/liberté d'utilisation</li>
                        </ul>
                      </div>
                    </TabsContent>
                    <TabsContent value="others" className="p-4 bg-blue-950/30 rounded-md mt-4">
                      <h4 className="font-medium flex items-center">
                        <Settings className="mr-2 h-5 w-5 text-blue-400" />
                        Autres variantes
                      </h4>
                      <div className="mt-2 space-y-3">
                        <div>
                          <h5 className="text-sm font-medium">CYOD (Choose Your Own Device)</h5>
                          <p className="text-xs text-blue-300 mt-1">L'employé choisit son appareil parmi une liste approuvée par l'entreprise, qui en reste propriétaire.</p>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium">COBO (Corporate-Owned, Business-Only)</h5>
                          <p className="text-xs text-blue-300 mt-1">L'entreprise fournit l'appareil strictement à usage professionnel, avec des contrôles très stricts.</p>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium">BYOA (Bring Your Own Application)</h5>
                          <p className="text-xs text-blue-300 mt-1">L'employé utilise ses propres applications cloud et services sur l'appareil de l'entreprise.</p>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
            
            <div className="mt-6">
              <h3 className="text-xl font-bold">Avantages et inconvénients du BYOD</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <Card className="bg-green-900/20 border-green-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <CheckCircle2 className="mr-2 h-5 w-5 text-green-400" />
                      Avantages
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <ul className="list-disc list-inside space-y-1">
                      <li><strong>Réduction des coûts</strong> pour l'entreprise (acquisition et maintenance)</li>
                      <li><strong>Productivité accrue</strong> des employés familiers avec leurs propres appareils</li>
                      <li><strong>Satisfaction et rétention</strong> des employés améliorées</li>
                      <li><strong>Innovation</strong> favorisée par la diversité des appareils et systèmes</li>
                      <li><strong>Flexibilité et mobilité</strong> accrues pour le travail à distance</li>
                      <li><strong>Cycle de renouvellement</strong> technologique plus rapide</li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card className="bg-red-900/20 border-red-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <AlertTriangle className="mr-2 h-5 w-5 text-red-400" />
                      Inconvénients
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <ul className="list-disc list-inside space-y-1 text-red-200">
                      <li><strong>Risques de sécurité</strong> accrus (mélange données personnelles/professionnelles)</li>
                      <li><strong>Complexité technique</strong> pour le support et la gestion</li>
                      <li><strong>Problèmes de compatibilité</strong> entre applications et systèmes</li>
                      <li><strong>Questions juridiques</strong> liées à la propriété des données</li>
                      <li><strong>Problèmes de conformité</strong> réglementaire potentiels</li>
                      <li><strong>Équilibre difficile</strong> entre contrôle et vie privée</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <div className="bg-blue-950 border border-blue-800 rounded-lg p-4 mt-6">
              <h3 className="text-lg font-medium mb-2 flex items-center">
                <Zap className="mr-2 h-5 w-5 text-blue-400" />
                Chiffres clés (2025)
              </h3>
              <ul className="space-y-2">
                <li><strong>82%</strong> des entreprises ont une politique BYOD formelle en place</li>
                <li>Les employés utilisent en moyenne <strong>2,4 appareils personnels</strong> pour le travail</li>
                <li>Économie moyenne de <strong>350€ par employé et par an</strong> pour les entreprises en modèle BYOD</li>
                <li>Augmentation de productivité estimée entre <strong>20% et 37%</strong> selon les secteurs</li>
                <li><strong>71%</strong> des incidents de sécurité liés aux mobiles concernent des appareils BYOD</li>
              </ul>
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
          <h2 className="text-2xl font-bold">Risques et menaces associés au BYOD</h2>
          
          <p className="mt-4">
            L'utilisation d'appareils personnels en contexte professionnel introduit des risques de sécurité spécifiques qu'il est essentiel d'identifier et de gérer.
          </p>
          
          <div className="mt-6 space-y-5">
            <Card className="bg-blue-900/20 border-blue-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Shield className="mr-2 h-5 w-5 text-blue-400" />
                  Principales catégories de risques
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="bg-blue-800/30 p-3 rounded-md">
                    <h4 className="font-medium flex items-center">
                      <span className="bg-blue-700 text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">1</span>
                      Risques liés aux données
                    </h4>
                    <p className="mt-1 text-blue-200 text-sm">
                      Les problèmes de sécurité et de confidentialité concernant les informations de l'entreprise :
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-blue-200 text-sm mt-1">
                      <li>Mélange des données personnelles et professionnelles</li>
                      <li>Fuite de données sensibles via des applications non sécurisées</li>
                      <li>Accès non autorisé en cas de perte ou de vol de l'appareil</li>
                      <li>Rétention des données après le départ d'un employé</li>
                      <li>Partage accidentel d'informations confidentielles</li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-800/30 p-3 rounded-md">
                    <h4 className="font-medium flex items-center">
                      <span className="bg-blue-700 text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">2</span>
                      Risques liés aux réseaux
                    </h4>
                    <p className="mt-1 text-blue-200 text-sm">
                      Les vulnérabilités introduites par les connexions réseau des appareils BYOD :
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-blue-200 text-sm mt-1">
                      <li>Connexion à des réseaux Wi-Fi non sécurisés</li>
                      <li>Attaques de type "Man-in-the-Middle" en dehors du réseau d'entreprise</li>
                      <li>Exposition du réseau d'entreprise via des appareils compromis</li>
                      <li>Utilisation de VPN non sécurisés ou absents</li>
                      <li>Accès aux ressources d'entreprise depuis des emplacements à risque</li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-800/30 p-3 rounded-md">
                    <h4 className="font-medium flex items-center">
                      <span className="bg-blue-700 text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">3</span>
                      Risques liés aux appareils
                    </h4>
                    <p className="mt-1 text-blue-200 text-sm">
                      Les problèmes concernant les appareils eux-mêmes :
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-blue-200 text-sm mt-1">
                      <li>Appareils non mis à jour avec des vulnérabilités connues</li>
                      <li>Appareils jailbreakés ou rootés compromettant les protections natives</li>
                      <li>Appareils perdus ou volés contenant des données d'entreprise</li>
                      <li>Absence ou désactivation du chiffrement et des verrouillages d'écran</li>
                      <li>Durée de vie des appareils plus anciens non supportés</li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-800/30 p-3 rounded-md">
                    <h4 className="font-medium flex items-center">
                      <span className="bg-blue-700 text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">4</span>
                      Risques liés aux applications
                    </h4>
                    <p className="mt-1 text-blue-200 text-sm">
                      Les menaces introduites par les logiciels installés sur les appareils BYOD :
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-blue-200 text-sm mt-1">
                      <li>Applications malveillantes ou compromises</li>
                      <li>Applications légitimes avec des permissions excessives</li>
                      <li>Stockage de données d'entreprise dans des services cloud personnels</li>
                      <li>Applications de productivité non approuvées (shadow IT)</li>
                      <li>Absence de séparation entre applications personnelles et professionnelles</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="mt-6">
              <h3 className="text-xl font-bold">Menaces spécifiques au contexte BYOD</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                <Card className="bg-blue-900/20 border-blue-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md flex items-center">
                      <FileWarning className="mr-2 h-5 w-5 text-blue-400" />
                      Malwares mobiles
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <p className="mb-2">
                      Les logiciels malveillants spécifiquement conçus pour cibler les appareils mobiles sont en augmentation constante.
                    </p>
                    <div className="bg-blue-950/50 p-2 rounded-md text-xs">
                      <p className="font-medium text-white">Types répandus :</p>
                      <ul className="list-disc list-inside space-y-1 text-blue-300 mt-1">
                        <li>Spyware pour surveillance et vol de données</li>
                        <li>Banking trojans ciblant les applications bancaires</li>
                        <li>Adware agressif</li>
                        <li>Ransomware mobile</li>
                        <li>Logiciels de stalkerware</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-blue-900/20 border-blue-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md flex items-center">
                      <Wifi className="mr-2 h-5 w-5 text-blue-400" />
                      Attaques réseau
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <p className="mb-2">
                      Les appareils BYOD se connectent souvent à des réseaux publics ou non sécurisés, les exposant à diverses attaques.
                    </p>
                    <div className="bg-blue-950/50 p-2 rounded-md text-xs">
                      <p className="font-medium text-white">Techniques courantes :</p>
                      <ul className="list-disc list-inside space-y-1 text-blue-300 mt-1">
                        <li>Evil Twin (faux points d'accès Wi-Fi)</li>
                        <li>Attaques MITM (Man in the Middle)</li>
                        <li>Packet sniffing</li>
                        <li>SSL stripping</li>
                        <li>Exploitation de protocoles non sécurisés</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-blue-900/20 border-blue-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md flex items-center">
                      <Building className="mr-2 h-5 w-5 text-blue-400" />
                      Exfiltration de données
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <p className="mb-2">
                      Le transfert non autorisé de données sensibles en dehors du périmètre de contrôle de l'entreprise.
                    </p>
                    <div className="bg-blue-950/50 p-2 rounded-md text-xs">
                      <p className="font-medium text-white">Vecteurs fréquents :</p>
                      <ul className="list-disc list-inside space-y-1 text-blue-300 mt-1">
                        <li>Services cloud personnels (Dropbox, Google Drive)</li>
                        <li>Applications de messagerie personnelles</li>
                        <li>Transfert par e-mail personnel</li>
                        <li>Captures d'écran sensibles dans la galerie photo</li>
                        <li>Connexion USB à des ordinateurs tiers</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <Card className="bg-amber-900/20 border-amber-800 mt-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5 text-amber-400" />
                  Risques juridiques et de conformité
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-amber-200">
                  Au-delà des aspects techniques, le BYOD introduit des défis juridiques et de conformité souvent sous-estimés :
                </p>
                
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-amber-950/30">
                      <TableHead className="text-amber-300">Domaine</TableHead>
                      <TableHead className="text-amber-300">Problématiques</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="hover:bg-amber-950/30">
                      <TableCell className="font-medium text-amber-200">Protection des données</TableCell>
                      <TableCell className="text-amber-300">
                        <ul className="list-disc list-inside text-sm">
                          <li>Conformité RGPD complexifiée</li>
                          <li>Difficultés pour garantir les droits à l'effacement</li>
                          <li>Problèmes de localisation des données</li>
                        </ul>
                      </TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-amber-950/30">
                      <TableCell className="font-medium text-amber-200">Propriété intellectuelle</TableCell>
                      <TableCell className="text-amber-300">
                        <ul className="list-disc list-inside text-sm">
                          <li>Protection des secrets commerciaux</li>
                          <li>Frontière floue entre création personnelle/professionnelle</li>
                          <li>Risques de fuite de propriété intellectuelle</li>
                        </ul>
                      </TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-amber-950/30">
                      <TableCell className="font-medium text-amber-200">Réglementations sectorielles</TableCell>
                      <TableCell className="text-amber-300">
                        <ul className="list-disc list-inside text-sm">
                          <li>Exigences particulières dans la santé, la finance</li>
                          <li>Obligations d'archivage et de traçabilité</li>
                          <li>Contrôles spécifiques pour certaines industries</li>
                        </ul>
                      </TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-amber-950/30">
                      <TableCell className="font-medium text-amber-200">Droit du travail</TableCell>
                      <TableCell className="text-amber-300">
                        <ul className="list-disc list-inside text-sm">
                          <li>Frontière travail/vie personnelle</li>
                          <li>Remboursement des frais liés à l'appareil</li>
                          <li>Heures supplémentaires non déclarées</li>
                        </ul>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            
            <div className="bg-blue-950 border border-blue-800 rounded-lg p-4 mt-4">
              <h3 className="text-lg font-medium mb-2 flex items-center">
                <Zap className="mr-2 h-5 w-5 text-blue-400" />
                Tendances émergentes
              </h3>
              <p className="text-blue-200 mb-3">
                Nouvelles menaces et risques associés au BYOD en 2025 :
              </p>
              <div className="space-y-2">
                <div className="bg-blue-900/30 p-2 rounded-md">
                  <p className="text-sm">
                    <strong>Risques liés aux appareils connectés</strong> : Montres connectées, écouteurs intelligents et autres wearables accédant aux données d'entreprise.
                  </p>
                </div>
                <div className="bg-blue-900/30 p-2 rounded-md">
                  <p className="text-sm">
                    <strong>Applications cross-platform</strong> : Synchronisation entre appareils personnels multiples amplifiant les risques d'exfiltration de données.
                  </p>
                </div>
                <div className="bg-blue-900/30 p-2 rounded-md">
                  <p className="text-sm">
                    <strong>Attaques ciblant les espaces de travail virtuels</strong> : Exploitation des vulnérabilités dans les solutions de virtualisation utilisées pour le BYOD.
                  </p>
                </div>
                <div className="bg-blue-900/30 p-2 rounded-md">
                  <p className="text-sm">
                    <strong>Surveillance excessive</strong> : Risques juridiques liés à la surveillance trop intrusive des appareils personnels des employés.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
        <div className="flex justify-between mt-8">
          <Button onClick={() => setActiveLesson('introduction')} variant="outline" className="border-blue-700 text-blue-300">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Précédent
          </Button>
          <Button onClick={() => setActiveLesson('politiques')} className="bg-blue-700 hover:bg-blue-800">
            Continuer
            <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
          </Button>
        </div>
      </div>
    ),
    
    politiques: (
      <div className="space-y-6">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={contentVariants}
        >
          <h2 className="text-2xl font-bold">Politiques BYOD efficaces</h2>
          
          <Alert className="bg-blue-900/30 border-blue-500 mt-4">
            <Lightbulb className="h-5 w-5 text-blue-500" />
            <AlertTitle className="text-blue-100">Équilibre essentiel</AlertTitle>
            <AlertDescription className="text-blue-200">
              Une politique BYOD efficace doit trouver le juste équilibre entre sécurité pour l'organisation et respect de la vie privée des utilisateurs.
            </AlertDescription>
          </Alert>
          
          <div className="mt-6 space-y-5">
            <Card className="bg-blue-900/20 border-blue-800">
              <CardHeader>
                <CardTitle>Éléments essentiels d'une politique BYOD</CardTitle>
                <CardDescription className="text-blue-200">
                  Une politique BYOD complète doit couvrir les aspects suivants
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="bg-blue-800/30 p-3 rounded-md">
                    <h3 className="font-medium flex items-center">
                      <span className="bg-blue-700 text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">1</span>
                      Conditions d'éligibilité
                    </h3>
                    <ul className="list-disc list-inside text-sm text-blue-200 mt-2 space-y-1">
                      <li>Types d'appareils autorisés (systèmes d'exploitation, versions minimales)</li>
                      <li>Profils d'utilisateurs autorisés à utiliser leurs appareils personnels</li>
                      <li>Niveau d'accès accordé en fonction du poste et des besoins</li>
                      <li>Processus d'approbation et d'onboarding</li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-800/30 p-3 rounded-md">
                    <h3 className="font-medium flex items-center">
                      <span className="bg-blue-700 text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">2</span>
                      Exigences de sécurité
                    </h3>
                    <ul className="list-disc list-inside text-sm text-blue-200 mt-2 space-y-1">
                      <li>Configuration minimale de sécurité (chiffrement, verrouillage d'écran, mises à jour)</li>
                      <li>Solutions de sécurité requises (antivirus, MDM, conteneurisation)</li>
                      <li>Politiques de mots de passe et d'authentification</li>
                      <li>Restrictions concernant le jailbreak/root et applications non autorisées</li>
                      <li>Protocoles réseau et exigences VPN</li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-800/30 p-3 rounded-md">
                    <h3 className="font-medium flex items-center">
                      <span className="bg-blue-700 text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">3</span>
                      Gestion des données
                    </h3>
                    <ul className="list-disc list-inside text-sm text-blue-200 mt-2 space-y-1">
                      <li>Classification des données autorisées sur les appareils personnels</li>
                      <li>Méthodes de séparation des données personnelles et professionnelles</li>
                      <li>Procédures de sauvegarde et de restauration</li>
                      <li>Politique de conservation et d'effacement des données</li>
                      <li>Restrictions concernant le partage et le transfert de données</li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-800/30 p-3 rounded-md">
                    <h3 className="font-medium flex items-center">
                      <span className="bg-blue-700 text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">4</span>
                      Responsabilités et support
                    </h3>
                    <ul className="list-disc list-inside text-sm text-blue-200 mt-2 space-y-1">
                      <li>Répartition claire des responsabilités (entreprise vs. employé)</li>
                      <li>Niveaux de support technique fourni par l'organisation</li>
                      <li>Procédures en cas de perte, vol ou compromission</li>
                      <li>Coûts pris en charge par l'entreprise (remboursements, allocations)</li>
                      <li>Exigences de formation des utilisateurs</li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-800/30 p-3 rounded-md">
                    <h3 className="font-medium flex items-center">
                      <span className="bg-blue-700 text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">5</span>
                      Conformité et vie privée
                    </h3>
                    <ul className="list-disc list-inside text-sm text-blue-200 mt-2 space-y-1">
                      <li>Droits d'accès et de surveillance de l'entreprise</li>
                      <li>Protection de la vie privée des employés</li>
                      <li>Procédures d'effacement à distance et conditions d'activation</li>
                      <li>Conséquences en cas de non-respect de la politique</li>
                      <li>Procédures de fin d'emploi et de désactivation</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <Card className="bg-green-900/20 border-green-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <CheckCircle2 className="mr-2 h-5 w-5 text-green-400" />
                    Bonnes pratiques
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="bg-green-900/30 p-3 rounded-md">
                    <h4 className="font-medium">Impliquer toutes les parties prenantes</h4>
                    <p className="text-sm text-green-200 mt-1">
                      Développez la politique en collaboration avec les représentants des différents départements (IT, juridique, RH, métiers) et les utilisateurs finaux pour assurer son acceptabilité et son efficacité.
                    </p>
                  </div>
                  
                  <div className="bg-green-900/30 p-3 rounded-md">
                    <h4 className="font-medium">Adopter une approche progressive</h4>
                    <p className="text-sm text-green-200 mt-1">
                      Commencez avec un programme pilote avant un déploiement complet. Identifiez un groupe d'utilisateurs représentatifs et ajustez la politique en fonction des retours d'expérience.
                    </p>
                  </div>
                  
                  <div className="bg-green-900/30 p-3 rounded-md">
                    <h4 className="font-medium">Former et sensibiliser</h4>
                    <p className="text-sm text-green-200 mt-1">
                      Assurez-vous que tous les utilisateurs comprennent la politique BYOD, les risques associés et leurs responsabilités. Une formation initiale et des rappels réguliers sont essentiels.
                    </p>
                  </div>
                  
                  <div className="bg-green-900/30 p-3 rounded-md">
                    <h4 className="font-medium">Maintenir la politique à jour</h4>
                    <p className="text-sm text-green-200 mt-1">
                      Révisez régulièrement la politique pour l'adapter aux nouvelles technologies, menaces et exigences réglementaires. Prévoyez un processus formel de revue et de mise à jour.
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-red-900/20 border-red-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <AlertTriangle className="mr-2 h-5 w-5 text-red-400" />
                    Erreurs à éviter
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="bg-red-900/30 p-3 rounded-md">
                    <h4 className="font-medium">Politique trop restrictive</h4>
                    <p className="text-sm text-red-200 mt-1">
                      Une politique excessivement contraignante pousse les utilisateurs à la contourner, créant des risques "shadow IT". Trouvez l'équilibre entre sécurité et utilisabilité.
                    </p>
                  </div>
                  
                  <div className="bg-red-900/30 p-3 rounded-md">
                    <h4 className="font-medium">Négliger les aspects juridiques</h4>
                    <p className="text-sm text-red-200 mt-1">
                      Ne pas consulter le service juridique peut exposer l'entreprise à des risques légaux importants, particulièrement en matière de vie privée et de droit du travail.
                    </p>
                  </div>
                  
                  <div className="bg-red-900/30 p-3 rounded-md">
                    <h4 className="font-medium">Surveillance excessive</h4>
                    <p className="text-sm text-red-200 mt-1">
                      Surveiller intégralement les appareils personnels viole la vie privée des employés et peut être illégal. Limitez la surveillance aux données et activités professionnelles.
                    </p>
                  </div>
                  
                  <div className="bg-red-900/30 p-3 rounded-md">
                    <h4 className="font-medium">Ignorer les coûts cachés</h4>
                    <p className="text-sm text-red-200 mt-1">
                      Le BYOD n'est pas toujours synonyme d'économies. Sous-estimer les coûts de support, des solutions MDM et de la formation peut mener à de mauvaises surprises budgétaires.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card className="bg-blue-900/20 border-blue-800 mt-4">
              <CardHeader>
                <CardTitle>Modèle de politique BYOD</CardTitle>
                <CardDescription className="text-blue-200">
                  Structure et sections clés d'une politique BYOD bien construite
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 mb-4">
                  <div className="bg-blue-800/20 p-3 rounded-md">
                    <h3 className="font-medium">1. Introduction et objectifs</h3>
                    <p className="text-sm text-blue-200 mt-1">
                      Présentation du contexte, des objectifs et du champ d'application de la politique. Définition des termes clés pour une compréhension commune.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-1 mb-4">
                  <div className="bg-blue-800/20 p-3 rounded-md">
                    <h3 className="font-medium">2. Conditions d'éligibilité et d'accès</h3>
                    <p className="text-sm text-blue-200 mt-1">
                      Critères pour les utilisateurs et les appareils, procédure d'enregistrement, et niveau d'accès accordé selon le profil.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-1 mb-4">
                  <div className="bg-blue-800/20 p-3 rounded-md">
                    <h3 className="font-medium">3. Configuration et sécurité des appareils</h3>
                    <p className="text-sm text-blue-200 mt-1">
                      Exigences techniques détaillées, configurations obligatoires, et mesures de sécurité à mettre en place.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-1 mb-4">
                  <div className="bg-blue-800/20 p-3 rounded-md">
                    <h3 className="font-medium">4. Utilisation acceptable</h3>
                    <p className="text-sm text-blue-200 mt-1">
                      Définition des utilisations autorisées et interdites des appareils personnels en contexte professionnel.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-1 mb-4">
                  <div className="bg-blue-800/20 p-3 rounded-md">
                    <h3 className="font-medium">5. Gestion et protection des données</h3>
                    <p className="text-sm text-blue-200 mt-1">
                      Classification des données, exigences de stockage, sauvegarde, et règles de partage et de synchronisation.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-1 mb-4">
                  <div className="bg-blue-800/20 p-3 rounded-md">
                    <h3 className="font-medium">6. Surveillance, vie privée et consentement</h3>
                    <p className="text-sm text-blue-200 mt-1">
                      Étendue et limites du contrôle de l'entreprise, respect de la vie privée des employés, et consentement explicite requis.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-1 mb-4">
                  <div className="bg-blue-800/20 p-3 rounded-md">
                    <h3 className="font-medium">7. Support et responsabilités</h3>
                    <p className="text-sm text-blue-200 mt-1">
                      Définition du niveau de support fourni, responsabilités des utilisateurs et de l'équipe IT, et processus de signalement des incidents.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-1 mb-4">
                  <div className="bg-blue-800/20 p-3 rounded-md">
                    <h3 className="font-medium">8. Conformité et conséquences</h3>
                    <p className="text-sm text-blue-200 mt-1">
                      Mesures de contrôle de conformité, conséquences en cas de non-respect, et procédures disciplinaires applicables.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="bg-blue-800/20 p-3 rounded-md">
                    <h3 className="font-medium">9. Procédures de fin d'emploi</h3>
                    <p className="text-sm text-blue-200 mt-1">
                      Protocoles pour le départ volontaire ou le licenciement, procédures d'effacement des données, et vérifications finales.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="bg-blue-950 border border-blue-800 rounded-lg p-4 mt-4">
              <h3 className="text-lg font-medium mb-2 flex items-center">
                <Zap className="mr-2 h-5 w-5 text-blue-400" />
                Conseils pour l'implémentation
              </h3>
              <p className="text-blue-200 mb-3">
                Au-delà de la rédaction de la politique, son implémentation est tout aussi cruciale :
              </p>
              <div className="space-y-2">
                <div className="bg-blue-900/30 p-2 rounded-md">
                  <p className="text-sm">
                    <strong>Obtenir l'adhésion de la direction</strong> : Assurez-vous que la politique BYOD est soutenue par la direction pour faciliter son adoption.
                  </p>
                </div>
                <div className="bg-blue-900/30 p-2 rounded-md">
                  <p className="text-sm">
                    <strong>Communiquer clairement</strong> : Expliquez les avantages et les responsabilités aux utilisateurs de manière transparente.
                  </p>
                </div>
                <div className="bg-blue-900/30 p-2 rounded-md">
                  <p className="text-sm">
                    <strong>Proposer un accord formel</strong> : Faites signer un document d'acceptation de la politique par chaque utilisateur BYOD.
                  </p>
                </div>
                <div className="bg-blue-900/30 p-2 rounded-md">
                  <p className="text-sm">
                    <strong>Mettre en place des indicateurs</strong> : Suivez l'efficacité de la politique par des métriques claires (incidents, satisfaction, coûts).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
        <div className="flex justify-between mt-8">
          <Button onClick={() => setActiveLesson('risques')} variant="outline" className="border-blue-700 text-blue-300">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Précédent
          </Button>
          <Button onClick={() => setActiveLesson('securisation')} className="bg-blue-700 hover:bg-blue-800">
            Continuer
            <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
          </Button>
        </div>
      </div>
    ),
    
    securisation: (
      <div className="space-y-6">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={contentVariants}
        >
          <h2 className="text-2xl font-bold">Sécurisation des appareils BYOD</h2>
          
          <p className="mt-4">
            La mise en œuvre de mesures de sécurité techniques sur les appareils BYOD constitue une couche essentielle de protection pour les données de l'entreprise.
          </p>
          
          <div className="mt-6 space-y-5">
            <Card className="bg-blue-900/20 border-blue-800">
              <CardHeader>
                <CardTitle>Mesures de sécurité fondamentales</CardTitle>
                <CardDescription className="text-blue-200">
                  Configuration de base pour tous les appareils BYOD
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-800/30 p-3 rounded-md">
                    <h3 className="font-medium flex items-center">
                      <Lock className="mr-2 h-5 w-5 text-blue-400" />
                      Verrouillage d'écran sécurisé
                    </h3>
                    <ul className="list-disc list-inside text-sm text-blue-200 mt-2 space-y-1">
                      <li>Exiger un code PIN d'au moins 6 chiffres ou mot de passe complexe</li>
                      <li>Privilégier si possible l'authentification biométrique (empreinte, reconnaissance faciale)</li>
                      <li>Configurer un délai de verrouillage automatique court (2-5 minutes maximum)</li>
                      <li>Activer l'effacement automatique après un nombre défini de tentatives infructueuses</li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-800/30 p-3 rounded-md">
                    <h3 className="font-medium flex items-center">
                      <Shield className="mr-2 h-5 w-5 text-blue-400" />
                      Chiffrement des données
                    </h3>
                    <ul className="list-disc list-inside text-sm text-blue-200 mt-2 space-y-1">
                      <li>Activer le chiffrement intégral de l'appareil (FileVault pour macOS, BitLocker pour Windows)</li>
                      <li>Utiliser le chiffrement natif sur iOS (activé par défaut avec code d'accès) et Android</li>
                      <li>Garantir le chiffrement des sauvegardes locales et cloud</li>
                      <li>Adopter des solutions de chiffrement supplémentaires pour les données sensibles</li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-800/30 p-3 rounded-md">
                    <h3 className="font-medium flex items-center">
                      <Wifi className="mr-2 h-5 w-5 text-blue-400" />
                      Connexions réseau sécurisées
                    </h3>
                    <ul className="list-disc list-inside text-sm text-blue-200 mt-2 space-y-1">
                      <li>Imposer l'utilisation d'un VPN pour l'accès aux ressources de l'entreprise</li>
                      <li>Configurer les paramètres Wi-Fi pour éviter la connexion automatique aux réseaux inconnus</li>
                      <li>Utiliser le DNS sécurisé (DoH/DoT) pour les connexions internet</li>
                      <li>Désactiver les protocoles non sécurisés (FTP, Telnet, etc.)</li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-800/30 p-3 rounded-md">
                    <h3 className="font-medium flex items-center">
                      <Settings className="mr-2 h-5 w-5 text-blue-400" />
                      Mises à jour système
                    </h3>
                    <ul className="list-disc list-inside text-sm text-blue-200 mt-2 space-y-1">
                      <li>Appliquer automatiquement les mises à jour de sécurité</li>
                      <li>Définir une version minimale requise des systèmes d'exploitation</li>
                      <li>Configurer les mises à jour en dehors des heures de travail</li>
                      <li>Envisager un système de contrôle de version pour l'accès aux ressources</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="mt-6">
              <h3 className="text-xl font-bold">Sécurisation par type d'appareil</h3>
              
              <Card className="bg-blue-900/20 border-blue-800 mt-3">
                <CardContent className="pt-6">
                  <Tabs defaultValue="ios">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="ios">iOS</TabsTrigger>
                      <TabsTrigger value="android">Android</TabsTrigger>
                      <TabsTrigger value="desktop">Ordinateurs</TabsTrigger>
                    </TabsList>
                    <TabsContent value="ios" className="p-4 bg-blue-950/30 rounded-md mt-4">
                      <h4 className="font-medium flex items-center">
                        <Smartphone className="mr-2 h-5 w-5 text-blue-400" />
                        Sécurisation des appareils iOS
                      </h4>
                      
                      <div className="mt-3 space-y-3">
                        <div className="bg-blue-900/30 p-2 rounded-md">
                          <h5 className="text-sm font-medium">Configuration spécifique iOS</h5>
                          <ul className="list-disc list-inside text-xs space-y-1 text-blue-300 mt-1">
                            <li>Activer "Localiser mon iPhone" pour le verrouillage/effacement à distance</li>
                            <li>Configurer des restrictions sur les applications avec une solution MDM</li>
                            <li>Limiter le partage de données entre applications via les paramètres de confidentialité</li>
                            <li>Désactiver le stockage automatique de mots de passe pour les applications professionnelles</li>
                          </ul>
                        </div>
                        
                        <div className="bg-blue-900/30 p-2 rounded-md">
                          <h5 className="text-sm font-medium">Avantages iOS pour le BYOD</h5>
                          <ul className="list-disc list-inside text-xs space-y-1 text-blue-300 mt-1">
                            <li>Écosystème fermé et contrôlé limitant les risques de malware</li>
                            <li>Mises à jour régulières et longue durée de support</li>
                            <li>Architecture de sécurité solide avec isolation des applications</li>
                            <li>Options avancées de gestion via les profils de configuration</li>
                          </ul>
                        </div>
                        
                        <div className="bg-blue-900/30 p-2 rounded-md">
                          <h5 className="text-sm font-medium">Paramètres recommandés</h5>
                          <ul className="list-disc list-inside text-xs space-y-1 text-blue-300 mt-1">
                            <li>Désactiver l'écran de verrouillage sur l'écran d'accueil et le centre de contrôle</li>
                            <li>Limiter le partage de position pour les applications professionnelles</li>
                            <li>Configurer le VPN à la demande pour certaines applications/domaines</li>
                            <li>Utiliser iCloud Keychain pour la gestion des mots de passe en entreprise</li>
                          </ul>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="android" className="p-4 bg-blue-950/30 rounded-md mt-4">
                      <h4 className="font-medium flex items-center">
                        <Smartphone className="mr-2 h-5 w-5 text-blue-400" />
                        Sécurisation des appareils Android
                      </h4>
                      
                      <div className="mt-3 space-y-3">
                        <div className="bg-blue-900/30 p-2 rounded-md">
                          <h5 className="text-sm font-medium">Configuration spécifique Android</h5>
                          <ul className="list-disc list-inside text-xs space-y-1 text-blue-300 mt-1">
                            <li>Utiliser Android Enterprise pour la gestion des profils de travail</li>
                            <li>Activer Google Play Protect pour la détection de malware</li>
                            <li>Configurer un profil professionnel séparé du profil personnel</li>
                            <li>Vérifier les permissions des applications professionnelles installées</li>
                            <li>Mettre en place le contrôle de bootloader et la vérification d'intégrité</li>
                          </ul>
                        </div>
                        
                        <div className="bg-blue-900/30 p-2 rounded-md">
                          <h5 className="text-sm font-medium">Défis spécifiques à Android</h5>
                          <ul className="list-disc list-inside text-xs space-y-1 text-blue-300 mt-1">
                            <li>Fragmentation des versions et mises à jour inégales selon fabricants</li>
                            <li>Diversité des surcouches fabricants (One UI, MIUI, etc.)</li>
                            <li>Appareils rootés plus difficiles à détecter</li>
                            <li>Contrôle des sources d'installation d'applications tierces</li>
                          </ul>
                        </div>
                        
                        <div className="bg-blue-900/30 p-2 rounded-md">
                          <h5 className="text-sm font-medium">Paramètres recommandés</h5>
                          <ul className="list-disc list-inside text-xs space-y-1 text-blue-300 mt-1">
                            <li>Désactiver "Sources inconnues" pour l'installation d'applications</li>
                            <li>Activer les fonctionnalités de localisation/effacement à distance</li>
                            <li>Configurer le stockage chiffré pour les données d'entreprise</li>
                            <li>Utiliser Samsung Knox ou solutions équivalentes si disponibles</li>
                          </ul>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="desktop" className="p-4 bg-blue-950/30 rounded-md mt-4">
                      <h4 className="font-medium flex items-center">
                        <Laptop className="mr-2 h-5 w-5 text-blue-400" />
                        Sécurisation des ordinateurs portables
                      </h4>
                      
                      <div className="mt-3 space-y-3">
                        <div className="bg-blue-900/30 p-2 rounded-md">
                          <h5 className="text-sm font-medium">Windows</h5>
                          <ul className="list-disc list-inside text-xs space-y-1 text-blue-300 mt-1">
                            <li>Activer BitLocker pour le chiffrement complet du disque</li>
                            <li>Utiliser Windows Hello pour l'authentification biométrique</li>
                            <li>Configurer Windows Defender avec analyses régulières</li>
                            <li>Mettre en place AppLocker ou des politiques équivalentes</li>
                            <li>Activer le pare-feu Windows avec configurations avancées</li>
                          </ul>
                        </div>
                        
                        <div className="bg-blue-900/30 p-2 rounded-md">
                          <h5 className="text-sm font-medium">macOS</h5>
                          <ul className="list-disc list-inside text-xs space-y-1 text-blue-300 mt-1">
                            <li>Activer FileVault pour le chiffrement du disque</li>
                            <li>Configurer Gatekeeper pour limiter les sources d'applications</li>
                            <li>Utiliser les fonctionnalités de contrôle de confidentialité</li>
                            <li>Activer le pare-feu intégré avec configurations strictes</li>
                            <li>Mettre en place des restrictions via les profils de configuration</li>
                          </ul>
                        </div>
                        
                        <div className="bg-blue-900/30 p-2 rounded-md">
                          <h5 className="text-sm font-medium">Approches alternatives</h5>
                          <ul className="list-disc list-inside text-xs space-y-1 text-blue-300 mt-1">
                            <li>Utiliser des solutions VDI (Virtual Desktop Infrastructure)</li>
                            <li>Configurer des environnements de virtualisation locaux</li>
                            <li>Déployer des solutions d'accès au bureau à distance</li>
                            <li>Utiliser des applications Web plutôt que des applications locales</li>
                          </ul>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
            
            <Card className="bg-blue-900/20 border-blue-800 mt-6">
              <CardHeader>
                <CardTitle>Séparation des données personnelles et professionnelles</CardTitle>
                <CardDescription className="text-blue-200">
                  Méthodes pour isoler les données de l'entreprise sur les appareils BYOD
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-800/30 p-3 rounded-md">
                    <h3 className="font-medium">Conteneurisation</h3>
                    <p className="text-sm text-blue-200 mt-1">
                      Création d'un espace isolé et sécurisé sur l'appareil pour les applications et données professionnelles.
                    </p>
                    <div className="bg-blue-950/50 p-2 rounded-md text-xs mt-2">
                      <p className="font-medium text-white">Avantages :</p>
                      <ul className="list-disc list-inside space-y-1 text-blue-300 mt-1">
                        <li>Séparation stricte des données</li>
                        <li>Possibilité d'effacement sélectif</li>
                        <li>Contrôle granulaire des politiques</li>
                        <li>Protection contre les applications personnelles malveillantes</li>
                      </ul>
                    </div>
                    <div className="mt-2">
                      <p className="text-xs text-blue-300">Exemples : Samsung Knox, Android Work Profile, solutions MDM avec conteneurisation</p>
                    </div>
                  </div>
                  
                  <div className="bg-blue-800/30 p-3 rounded-md">
                    <h3 className="font-medium">Virtualisation</h3>
                    <p className="text-sm text-blue-200 mt-1">
                      Exécution d'un environnement virtuel complet pour accéder aux ressources de l'entreprise sans stockage local.
                    </p>
                    <div className="bg-blue-950/50 p-2 rounded-md text-xs mt-2">
                      <p className="font-medium text-white">Avantages :</p>
                      <ul className="list-disc list-inside space-y-1 text-blue-300 mt-1">
                        <li>Aucune donnée d'entreprise stockée sur l'appareil</li>
                        <li>Environnement de travail standardisé</li>
                        <li>Indépendance vis-à-vis de l'appareil utilisé</li>
                        <li>Facilité de mise à jour et de contrôle centralisé</li>
                      </ul>
                    </div>
                    <div className="mt-2">
                      <p className="text-xs text-blue-300">Exemples : VMware Workspace ONE, Citrix Virtual Apps and Desktops, Microsoft Windows Virtual Desktop</p>
                    </div>
                  </div>
                  
                  <div className="bg-blue-800/30 p-3 rounded-md">
                    <h3 className="font-medium">Applications sécurisées</h3>
                    <p className="text-sm text-blue-200 mt-1">
                      Utilisation d'applications spécifiquement conçues pour le contexte BYOD avec des fonctionnalités de sécurité intégrées.
                    </p>
                    <div className="bg-blue-950/50 p-2 rounded-md text-xs mt-2">
                      <p className="font-medium text-white">Possibilités :</p>
                      <ul className="list-disc list-inside space-y-1 text-blue-300 mt-1">
                        <li>Suites de productivité avec chiffrement intégré</li>
                        <li>Applications de messagerie sécurisées</li>
                        <li>Navigateurs spécifiques pour l'accès aux applications web d'entreprise</li>
                        <li>Applications MDM pour la gestion de documents</li>
                      </ul>
                    </div>
                    <div className="mt-2">
                      <p className="text-xs text-blue-300">Exemples : Microsoft Intune App Protection, BlackBerry Dynamics, solutions MAM diverses</p>
                    </div>
                  </div>
                  
                  <div className="bg-blue-800/30 p-3 rounded-md">
                    <h3 className="font-medium">Infrastructure en tant que service</h3>
                    <p className="text-sm text-blue-200 mt-1">
                      Fourniture d'accès aux applications et données via des services cloud, sans stockage local durable.
                    </p>
                    <div className="bg-blue-950/50 p-2 rounded-md text-xs mt-2">
                      <p className="font-medium text-white">Applications :</p>
                      <ul className="list-disc list-inside space-y-1 text-blue-300 mt-1">
                        <li>Solutions SaaS avec accès sécurisé</li>
                        <li>Stockage cloud d'entreprise</li>
                        <li>Applications web progressives</li>
                        <li>Plateformes de collaboration en ligne</li>
                      </ul>
                    </div>
                    <div className="mt-2">
                      <p className="text-xs text-blue-300">Exemples : Microsoft 365, Google Workspace, Salesforce, solutions cloud d'entreprise</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="bg-blue-950 border border-blue-800 rounded-lg p-4 mt-4">
              <h3 className="text-lg font-medium mb-2 flex items-center">
                <Lightbulb className="mr-2 h-5 w-5 text-blue-400" />
                Bonnes pratiques complémentaires
              </h3>
              <div className="space-y-2">
                <div className="bg-blue-900/30 p-2 rounded-md">
                  <h4 className="text-sm font-medium">Formation et sensibilisation continues</h4>
                  <p className="text-xs text-blue-300 mt-1">
                    Formez régulièrement les utilisateurs BYOD aux menaces émergentes et aux bonnes pratiques de sécurité. La sensibilisation reste l'une des mesures les plus efficaces.
                  </p>
                </div>
                <div className="bg-blue-900/30 p-2 rounded-md">
                  <h4 className="text-sm font-medium">Authentification à plusieurs facteurs (MFA)</h4>
                  <p className="text-xs text-blue-300 mt-1">
                    Imposez l'authentification MFA pour tous les accès aux ressources de l'entreprise depuis les appareils BYOD, idéalement avec des méthodes modernes comme les clés de sécurité.
                  </p>
                </div>
                <div className="bg-blue-900/30 p-2 rounded-md">
                  <h4 className="text-sm font-medium">Gestion des correctifs</h4>
                  <p className="text-xs text-blue-300 mt-1">
                    Établissez un système de vérification des mises à jour pour les appareils BYOD et limitez l'accès aux ressources pour les appareils non conformes.
                  </p>
                </div>
                <div className="bg-blue-900/30 p-2 rounded-md">
                  <h4 className="text-sm font-medium">Protection contre la perte et le vol</h4>
                  <p className="text-xs text-blue-300 mt-1">
                    Assurez-vous que tous les appareils BYOD disposent de fonctionnalités de localisation, de verrouillage et d'effacement à distance en cas de perte ou de vol.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
        <div className="flex justify-between mt-8">
          <Button onClick={() => setActiveLesson('politiques')} variant="outline" className="border-blue-700 text-blue-300">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Précédent
          </Button>
          <Button onClick={() => setActiveLesson('mdm')} className="bg-blue-700 hover:bg-blue-800">
            Continuer
            <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
          </Button>
        </div>
      </div>
    ),
    
    mdm: (
      <div className="space-y-6">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={contentVariants}
        >
          <h2 className="text-2xl font-bold">Solutions MDM et alternatives</h2>
          
          <p className="mt-4">
            La gestion des appareils mobiles (MDM) et les technologies associées constituent l'épine dorsale technique d'une stratégie BYOD réussie.
          </p>
          
          <div className="mt-6 space-y-5">
            <Card className="bg-blue-900/20 border-blue-800">
              <CardHeader>
                <CardTitle>Comprendre le MDM et ses variantes</CardTitle>
                <CardDescription className="text-blue-200">
                  Différents modèles et approches pour la gestion des appareils
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="bg-blue-800/30 p-3 rounded-md">
                    <h3 className="font-medium flex items-center">
                      <Smartphone className="mr-2 h-5 w-5 text-blue-400" />
                      MDM (Mobile Device Management)
                    </h3>
                    <p className="text-sm text-blue-200 mt-1">
                      Les solutions MDM offrent un contrôle au niveau de l'appareil entier, permettant l'application de politiques de sécurité, la configuration à distance, et la gestion complète du cycle de vie de l'appareil.
                    </p>
                    <div className="mt-2">
                      <h4 className="text-xs font-medium">Fonctionnalités clés :</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
                        <ul className="list-disc list-inside text-xs text-blue-300">
                          <li>Configuration à distance des appareils</li>
                          <li>Application des politiques de sécurité</li>
                          <li>Gestion des mises à jour et correctifs</li>
                          <li>Suivi de l'inventaire des appareils</li>
                        </ul>
                        <ul className="list-disc list-inside text-xs text-blue-300">
                          <li>Verrouillage et effacement à distance</li>
                          <li>Déploiement d'applications d'entreprise</li>
                          <li>Surveillance de la conformité</li>
                          <li>Géofencing et contrôles basés sur l'emplacement</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-800/30 p-3 rounded-md">
                    <h3 className="font-medium flex items-center">
                      <Tablet className="mr-2 h-5 w-5 text-blue-400" />
                      MAM (Mobile Application Management)
                    </h3>
                    <p className="text-sm text-blue-200 mt-1">
                      Contrairement au MDM, le MAM se concentre sur la gestion au niveau des applications plutôt que de l'appareil entier, offrant une approche moins intrusive pour les appareils personnels.
                    </p>
                    <div className="mt-2">
                      <h4 className="text-xs font-medium">Avantages pour le BYOD :</h4>
                      <ul className="list-disc list-inside text-xs text-blue-300 mt-1">
                        <li>Impact minimal sur l'usage personnel de l'appareil</li>
                        <li>Application des politiques uniquement aux applications d'entreprise</li>
                        <li>Séparation claire entre données personnelles et professionnelles</li>
                        <li>Meilleure acceptation par les utilisateurs</li>
                        <li>Possibilité d'effacement sélectif des données d'entreprise</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-blue-800/30 p-3 rounded-md">
                    <h3 className="font-medium flex items-center">
                      <Laptop className="mr-2 h-5 w-5 text-blue-400" />
                      UEM (Unified Endpoint Management)
                    </h3>
                    <p className="text-sm text-blue-200 mt-1">
                      L'UEM étend les capacités du MDM/MAM pour inclure tous les types d'appareils (mobiles, ordinateurs, IoT) dans une plateforme unifiée de gestion.
                    </p>
                    <div className="mt-2">
                      <h4 className="text-xs font-medium">Caractéristiques principales :</h4>
                      <ul className="list-disc list-inside text-xs text-blue-300 mt-1">
                        <li>Gestion unifiée des appareils mobiles, ordinateurs et autres endpoints</li>
                        <li>Console d'administration centralisée</li>
                        <li>Politiques cohérentes sur tous les types d'appareils</li>
                        <li>Intégration avec les systèmes d'identité et d'accès</li>
                        <li>Support des scénarios BYOD et COPE dans une même solution</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-blue-800/30 p-3 rounded-md">
                    <h3 className="font-medium flex items-center">
                      <Shield className="mr-2 h-5 w-5 text-blue-400" />
                      MIM (Mobile Information Management)
                    </h3>
                    <p className="text-sm text-blue-200 mt-1">
                      Le MIM se concentre spécifiquement sur la protection des données de l'entreprise, indépendamment de l'appareil ou de l'application qui y accède.
                    </p>
                    <div className="mt-2">
                      <h4 className="text-xs font-medium">Fonctionnalités de sécurité :</h4>
                      <ul className="list-disc list-inside text-xs text-blue-300 mt-1">
                        <li>Chiffrement des documents et contenus sensibles</li>
                        <li>Contrôles d'accès basés sur le contexte (emplacement, heure, etc.)</li>
                        <li>DRM (Digital Rights Management) pour les fichiers d'entreprise</li>
                        <li>Prévention des fuites de données (DLP)</li>
                        <li>Journalisation et audit des accès aux informations</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="mt-6">
              <h3 className="text-xl font-bold">Principales solutions MDM/UEM du marché</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                <Card className="bg-blue-900/20 border-blue-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md">Solutions leaders</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <div className="space-y-3">
                      <div className="bg-blue-950/50 p-2 rounded-md">
                        <h4 className="text-sm font-medium">Microsoft Intune</h4>
                        <ul className="list-disc list-inside text-xs text-blue-300 mt-1">
                          <li>Intégration native avec Microsoft 365</li>
                          <li>Fonctionnalités MAM avancées</li>
                          <li>Approche conditionnelle pour l'accès</li>
                          <li>Idéal pour environnements Windows</li>
                        </ul>
                      </div>
                      
                      <div className="bg-blue-950/50 p-2 rounded-md">
                        <h4 className="text-sm font-medium">VMware Workspace ONE</h4>
                        <ul className="list-disc list-inside text-xs text-blue-300 mt-1">
                          <li>Solution UEM complète</li>
                          <li>Virtualisation d'applications</li>
                          <li>Intégration VDI avancée</li>
                          <li>Adapté aux environnements hétérogènes</li>
                        </ul>
                      </div>
                      
                      <div className="bg-blue-950/50 p-2 rounded-md">
                        <h4 className="text-sm font-medium">IBM Security MaaS360</h4>
                        <ul className="list-disc list-inside text-xs text-blue-300 mt-1">
                          <li>Analyses basées sur l'IA/ML</li>
                          <li>Contrôles de sécurité avancés</li>
                          <li>Fonctionnalités UEM complètes</li>
                          <li>Surveillance des menaces intégrée</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-blue-900/20 border-blue-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md">Solutions ciblées</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <div className="space-y-3">
                      <div className="bg-blue-950/50 p-2 rounded-md">
                        <h4 className="text-sm font-medium">Jamf Pro</h4>
                        <ul className="list-disc list-inside text-xs text-blue-300 mt-1">
                          <li>Spécialisé dans l'écosystème Apple</li>
                          <li>Intégration profonde avec macOS/iOS</li>
                          <li>Interface administrateur intuitive</li>
                          <li>Déploiement zero-touch</li>
                        </ul>
                      </div>
                      
                      <div className="bg-blue-950/50 p-2 rounded-md">
                        <h4 className="text-sm font-medium">ManageEngine Mobile Device Manager Plus</h4>
                        <ul className="list-disc list-inside text-xs text-blue-300 mt-1">
                          <li>Solution économique</li>
                          <li>Déploiement on-premise ou cloud</li>
                          <li>Offre gratuite pour petites entreprises</li>
                          <li>Fonctionnalités robustes pour Android</li>
                        </ul>
                      </div>
                      
                      <div className="bg-blue-950/50 p-2 rounded-md">
                        <h4 className="text-sm font-medium">Sophos Mobile</h4>
                        <ul className="list-disc list-inside text-xs text-blue-300 mt-1">
                          <li>Accent sur la sécurité</li>
                          <li>Intégration avec UTM Sophos</li>
                          <li>Protection contre les menaces intégrée</li>
                          <li>Interface simplifiée</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-blue-900/20 border-blue-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md">Solutions émergentes</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <div className="space-y-3">
                      <div className="bg-blue-950/50 p-2 rounded-md">
                        <h4 className="text-sm font-medium">Kandji</h4>
                        <ul className="list-disc list-inside text-xs text-blue-300 mt-1">
                          <li>MDM nouvelle génération pour Apple</li>
                          <li>Bibliothèque de paramètres automatisés</li>
                          <li>Expérience utilisateur optimisée</li>
                          <li>Interface moderne et intuitive</li>
                        </ul>
                      </div>
                      
                      <div className="bg-blue-950/50 p-2 rounded-md">
                        <h4 className="text-sm font-medium">Hexnode UEM</h4>
                        <ul className="list-disc list-inside text-xs text-blue-300 mt-1">
                          <li>Solution cloud-native</li>
                          <li>Tarification flexible</li>
                          <li>Fonctionnalités IoT émergentes</li>
                          <li>Support pour appareils ruggédisés</li>
                        </ul>
                      </div>
                      
                      <div className="bg-blue-950/50 p-2 rounded-md">
                        <h4 className="text-sm font-medium">Miradore</h4>
                        <ul className="list-disc list-inside text-xs text-blue-300 mt-1">
                          <li>Solution cloud abordable</li>
                          <li>Déploiement rapide</li>
                          <li>Offre gratuite limitée disponible</li>
                          <li>Interface utilisateur intuitive</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <Card className="bg-blue-900/20 border-blue-800 mt-6">
              <CardHeader>
                <CardTitle>Alternatives aux solutions MDM</CardTitle>
                <CardDescription className="text-blue-200">
                  Approches complémentaires ou alternatives pour les contextes où le MDM n'est pas approprié
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-800/30 p-3 rounded-md">
                    <h3 className="font-medium">Virtualisation des applications</h3>
                    <p className="text-sm text-blue-200 mt-1">
                      Fournir un accès aux applications sans installation locale sur l'appareil.
                    </p>
                    <div className="bg-blue-950/50 p-2 rounded-md text-xs mt-2">
                      <p className="font-medium text-white">Avantages :</p>
                      <ul className="list-disc list-inside space-y-1 text-blue-300 mt-1">
                        <li>Pas de données stockées localement</li>
                        <li>Compatibilité avec tous les appareils ayant un navigateur</li>
                        <li>Expérience applicative cohérente</li>
                        <li>Mise à jour centralisée des applications</li>
                      </ul>
                    </div>
                    <div className="mt-2">
                      <p className="text-xs text-blue-300">Exemples : Citrix Virtual Apps, VMware Horizon, Parallels Remote Application Server</p>
                    </div>
                  </div>
                  
                  <div className="bg-blue-800/30 p-3 rounded-md">
                    <h3 className="font-medium">Bureaux virtuels (VDI)</h3>
                    <p className="text-sm text-blue-200 mt-1">
                      Fournir un environnement de bureau complet accessible à distance.
                    </p>
                    <div className="bg-blue-950/50 p-2 rounded-md text-xs mt-2">
                      <p className="font-medium text-white">Avantages :</p>
                      <ul className="list-disc list-inside space-y-1 text-blue-300 mt-1">
                        <li>Séparation complète entre personnel et professionnel</li>
                        <li>Environnement contrôlé et sécurisé</li>
                        <li>Performances indépendantes de l'appareil client</li>
                        <li>Simplicité de gestion et de maintenance</li>
                      </ul>
                    </div>
                    <div className="mt-2">
                      <p className="text-xs text-blue-300">Exemples : Windows Virtual Desktop, Citrix Virtual Desktops, VMware Horizon, Amazon WorkSpaces</p>
                    </div>
                  </div>
                  
                  <div className="bg-blue-800/30 p-3 rounded-md">
                    <h3 className="font-medium">Applications Web et SaaS</h3>
                    <p className="text-sm text-blue-200 mt-1">
                      Utiliser exclusivement des applications basées sur le web pour les besoins professionnels.
                    </p>
                    <div className="bg-blue-950/50 p-2 rounded-md text-xs mt-2">
                      <p className="font-medium text-white">Avantages :</p>
                      <ul className="list-disc list-inside space-y-1 text-blue-300 mt-1">
                        <li>Aucune installation requise sur l'appareil</li>
                        <li>Accès depuis n'importe quel navigateur</li>
                        <li>Utilisation des contrôles d'accès cloud natifs</li>
                        <li>Mises à jour automatiques et transparentes</li>
                      </ul>
                    </div>
                    <div className="mt-2">
                      <p className="text-xs text-blue-300">Exemples : Microsoft 365, Google Workspace, Salesforce, WorkDay, applications web internes</p>
                    </div>
                  </div>
                  
                  <div className="bg-blue-800/30 p-3 rounded-md">
                    <h3 className="font-medium">Navigateurs sécurisés</h3>
                    <p className="text-sm text-blue-200 mt-1">
                      Utiliser des navigateurs ou modes de navigation dédiés aux activités professionnelles.
                    </p>
                    <div className="bg-blue-950/50 p-2 rounded-md text-xs mt-2">
                      <p className="font-medium text-white">Possibilités :</p>
                      <ul className="list-disc list-inside space-y-1 text-blue-300 mt-1">
                        <li>Navigateurs d'entreprise gérés</li>
                        <li>Extensions de sécurité pour navigateurs</li>
                        <li>VPN intégrés au navigateur</li>
                        <li>Contrôle d'accès contextuel</li>
                      </ul>
                    </div>
                    <div className="mt-2">
                      <p className="text-xs text-blue-300">Exemples : Microsoft Edge pour entreprises, Chrome Enterprise, navigateurs avec espaces de travail distincts</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="bg-blue-950 border border-blue-800 rounded-lg p-4 mt-4">
              <h3 className="text-lg font-medium mb-2 flex items-center">
                <Zap className="mr-2 h-5 w-5 text-blue-400" />
                Critères de sélection d'une solution
              </h3>
              <p className="text-blue-200 mb-3">
                Facteurs clés à considérer lors du choix d'une solution MDM ou alternative :
              </p>
              <div className="space-y-2">
                <div className="bg-blue-900/30 p-2 rounded-md">
                  <h4 className="text-sm font-medium">Compatibilité avec l'écosystème existant</h4>
                  <p className="text-xs text-blue-300 mt-1">
                    Évaluez l'intégration avec vos systèmes d'identité, applications et infrastructure actuels. Une compatibilité native avec votre environnement simplifie le déploiement et la gestion.
                  </p>
                </div>
                <div className="bg-blue-900/30 p-2 rounded-md">
                  <h4 className="text-sm font-medium">Équilibre entre sécurité et expérience utilisateur</h4>
                  <p className="text-xs text-blue-300 mt-1">
                    Recherchez des solutions offrant une sécurité robuste sans compromettre excessivement l'expérience utilisateur sur leurs appareils personnels.
                  </p>
                </div>
                <div className="bg-blue-900/30 p-2 rounded-md">
                  <h4 className="text-sm font-medium">Coût total de possession</h4>
                  <p className="text-xs text-blue-300 mt-1">
                    Considérez non seulement les licences, mais aussi les coûts d'infrastructure, de formation, d'administration et de support technique sur la durée.
                  </p>
                </div>
                <div className="bg-blue-900/30 p-2 rounded-md">
                  <h4 className="text-sm font-medium">Évolutivité et flexibilité</h4>
                  <p className="text-xs text-blue-300 mt-1">
                    Choisissez une solution capable d'évoluer avec vos besoins et de s'adapter aux changements dans les technologies, les appareils et les exigences de sécurité.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
        <div className="flex justify-between mt-8">
          <Button onClick={() => setActiveLesson('securisation')} variant="outline" className="border-blue-700 text-blue-300">
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
          <h2 className="text-2xl font-bold">Quiz : Sécurité BYOD</h2>
          
          {!quizStarted && !quizCompleted ? (
            <div className="mt-6">
              <Card className="bg-blue-900/20 border-blue-800">
                <CardHeader>
                  <CardTitle>Évaluez vos connaissances</CardTitle>
                  <CardDescription className="text-blue-200">
                    Ce quiz comporte 5 questions pour tester votre compréhension des concepts BYOD et des meilleures pratiques.
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
                <Button onClick={() => setActiveLesson('mdm')} variant="outline" className="border-blue-700 text-blue-300">
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
                        ? 'Excellent ! Vous avez une bonne compréhension des principes BYOD.' 
                        : score >= 2 
                          ? 'Pas mal ! Vous avez des connaissances de base mais quelques points à approfondir.' 
                          : 'Vous devriez revoir ce module pour mieux comprendre les concepts BYOD et les meilleures pratiques.'}
                    </h3>
                    <p className={`mt-2 text-sm ${score >= 4 ? 'text-green-200' : score >= 2 ? 'text-amber-200' : 'text-red-200'}`}>
                      {score >= 4 
                        ? 'Vous êtes bien préparé pour participer à l\'élaboration et à la mise en œuvre d\'une stratégie BYOD efficace.' 
                        : 'Concentrez-vous particulièrement sur les aspects de sécurité et la séparation des données personnelles/professionnelles.'}
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
                      <Link href="/cyber/learning-center/modules/micro-learning">
                        <div className="flex items-center">
                          <CheckCircle2 className="mr-2 h-5 w-5" />
                          Terminer et retourner à l'accueil
                        </div>
                      </Link>
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
        <Link href="/cyber/learning-center/modules/micro-learning">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au Micro-Learning
          </Button>
        </Link>
        <PageTitle
          title="Sécurité des appareils personnels (BYOD)"
          subtitle="Sécuriser l'utilisation des appareils personnels en entreprise"
          icon={<Wifi className="h-8 w-8 text-blue-500" />}
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
                  <span>30-45 min</span>
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