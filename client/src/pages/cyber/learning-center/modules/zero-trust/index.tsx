import React, { useState } from 'react';
import { Link } from 'wouter';
import {
  ArrowLeft,
  Smartphone,
  Server,
  Globe,
  AlertTriangle,
  CheckCircle2,
  Shield,
  PlayCircle,
  Lightbulb,
  Zap,
  Lock,
  FileWarning,
  Layers,
  Users,
  Network,
  Clock,
  Key,
  Eye,
  User,
  Database,
  RefreshCw
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

export default function ZeroTrustModule() {
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
    { id: 'introduction', title: 'Introduction au Zero Trust', progress: 0 },
    { id: 'principes', title: 'Principes fondamentaux', progress: 0 },
    { id: 'implementation', title: 'Mise en œuvre', progress: 0 },
    { id: 'technologies', title: 'Technologies clés', progress: 0 },
    { id: 'avantages', title: 'Avantages et défis', progress: 0 },
    { id: 'quiz', title: 'Quiz de validation', progress: 0 },
  ];

  // Questions du quiz
  const questions = [
    {
      question: "Qu'est-ce qui définit le mieux l'approche Zero Trust ?",
      options: [
        "Faire confiance mais vérifier",
        "Ne jamais faire confiance, toujours vérifier",
        "Faire confiance au réseau interne uniquement",
        "Faire confiance aux utilisateurs authentifiés"
      ],
      correctAnswer: 1
    },
    {
      question: "Quel principe n'est PAS associé au modèle Zero Trust ?",
      options: [
        "Vérifier explicitement toutes les tentatives d'accès",
        "Utiliser l'authentification multifacteur",
        "Supposer que le réseau interne est sécurisé",
        "Appliquer le principe du moindre privilège"
      ],
      correctAnswer: 2
    },
    {
      question: "Quelle technologie est essentielle dans une architecture Zero Trust ?",
      options: [
        "Firewall de périmètre traditionnel",
        "Accès au réseau basé sur l'identité",
        "VPN toujours activé",
        "Réseau maillé Wi-Fi"
      ],
      correctAnswer: 1
    },
    {
      question: "Comment le Zero Trust gère-t-il l'authentification des utilisateurs ?",
      options: [
        "Une seule authentification lors de la connexion au réseau",
        "Vérification continue et évaluation dynamique de la confiance",
        "Authentification trimestrielle obligatoire",
        "Confiance accordée en fonction de l'adresse IP de l'utilisateur"
      ],
      correctAnswer: 1
    },
    {
      question: "Quel est l'avantage principal de l'approche Zero Trust dans un environnement de travail hybride ?",
      options: [
        "Elle simplifie la configuration du réseau",
        "Elle réduit le besoin d'authentification forte",
        "Elle sécurise l'accès indépendamment de la localisation de l'utilisateur",
        "Elle consolide toutes les données en un seul emplacement sécurisé"
      ],
      correctAnswer: 2
    }
  ];

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
                <li>Comprendre les fondements du modèle de sécurité Zero Trust</li>
                <li>Identifier les différences entre l'approche traditionnelle et l'approche Zero Trust</li>
                <li>Reconnaître les principes directeurs et les composants d'une architecture Zero Trust</li>
                <li>Appréhender les étapes de mise en œuvre d'une stratégie Zero Trust</li>
                <li>Évaluer les avantages, les défis et les technologies clés associés au Zero Trust</li>
              </ul>
            </AlertDescription>
          </Alert>
          
          <div className="mt-6 space-y-4">
            <h2 className="text-2xl font-bold">Qu'est-ce que le Zero Trust ?</h2>
            
            <p>
              Le <strong>Zero Trust</strong> est un modèle de sécurité qui part du principe que les menaces sont présentes à la fois à l'intérieur et à l'extérieur du réseau traditionnel. Il repose sur la philosophie "ne jamais faire confiance, toujours vérifier", quelle que soit la provenance de la demande d'accès.
            </p>
            
            <div className="bg-blue-900/20 border border-blue-800 rounded-md p-4 my-4">
              <h3 className="text-lg font-medium mb-2">Définition</h3>
              <p>
                Le <strong>Zero Trust</strong> est une approche stratégique de cybersécurité qui élimine le concept de confiance implicite au sein ou à l'extérieur du réseau, remplaçant cette confiance par des vérifications continues de l'identité, de l'appareil et du contexte pour chaque accès à une ressource.
              </p>
            </div>
            
            <div className="mt-6">
              <h3 className="text-xl font-bold">Évolution des modèles de sécurité</h3>
              
              <div className="space-y-4 mt-3">
                <div className="relative pl-6 border-l-2 border-blue-700 pl-10">
                  <div className="absolute left-0 top-0 w-6 h-6 -ml-3 rounded-full bg-blue-700 flex items-center justify-center text-xs">90</div>
                  <h4 className="font-medium">1990s - Modèle du Château et du Fossé</h4>
                  <p className="text-sm text-blue-200">Protection périmétrique avec firewalls. Distinction claire entre "intérieur sécurisé" (réseau d'entreprise) et "extérieur dangereux" (Internet). Confiance implicite accordée aux utilisateurs internes.</p>
                </div>
                
                <div className="relative pl-6 border-l-2 border-blue-700 pl-10">
                  <div className="absolute left-0 top-0 w-6 h-6 -ml-3 rounded-full bg-blue-700 flex items-center justify-center text-xs">00</div>
                  <h4 className="font-medium">2000s - Défense en profondeur</h4>
                  <p className="text-sm text-blue-200">Ajout de couches de sécurité (IDS/IPS, proxy, antivirus) tout en maintenant le concept de périmètre. Introduction de VPNs pour étendre le "réseau de confiance" aux utilisateurs distants.</p>
                </div>
                
                <div className="relative pl-6 border-l-2 border-blue-700 pl-10">
                  <div className="absolute left-0 top-0 w-6 h-6 -ml-3 rounded-full bg-blue-700 flex items-center justify-center text-xs">10</div>
                  <h4 className="font-medium">2010 - Naissance du Zero Trust</h4>
                  <p className="text-sm text-blue-200">Concept formalisé par l'analyste John Kindervag de Forrester Research. Introduction du principe "Ne jamais faire confiance, toujours vérifier" face à l'évolution des menaces et des modèles de travail.</p>
                </div>
                
                <div className="relative pl-6 border-l-2 border-blue-700 pl-10">
                  <div className="absolute left-0 top-0 w-6 h-6 -ml-3 rounded-full bg-blue-700 flex items-center justify-center text-xs">20</div>
                  <h4 className="font-medium">2020 - Adoption accélérée</h4>
                  <p className="text-sm text-blue-200">La pandémie de COVID-19 et l'expansion du télétravail ont catalysé l'adoption du Zero Trust. Les modèles hybrides de travail ont rendu obsolète le concept de périmètre réseau. Standardisation des cadres Zero Trust par le NIST et autres organismes.</p>
                </div>
                
                <div className="relative pl-6 pl-10">
                  <div className="absolute left-0 top-0 w-6 h-6 -ml-3 rounded-full bg-blue-700 flex items-center justify-center text-xs">25</div>
                  <h4 className="font-medium">2025 - Zero Trust omniprésent</h4>
                  <p className="text-sm text-blue-200">Le Zero Trust devient le modèle dominant. Intégration native dans les plateformes cloud et les systèmes d'exploitation. Automatisation et IA dans l'évaluation continue de la confiance. Extension au-delà de l'accès réseau vers les données, les applications et les infrastructures.</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-xl font-bold">Comparaison des approches de sécurité</h3>
              
              <Card className="bg-blue-900/20 border-blue-800 mt-3">
                <CardContent className="pt-6">
                  <Tabs defaultValue="traditional">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="traditional">Approche traditionnelle</TabsTrigger>
                      <TabsTrigger value="zerotrust">Approche Zero Trust</TabsTrigger>
                    </TabsList>
                    <TabsContent value="traditional" className="p-4 bg-blue-950/30 rounded-md mt-4">
                      <h4 className="font-medium flex items-center">
                        <Shield className="mr-2 h-5 w-5 text-blue-400" />
                        Sécurité périmétrique traditionnelle
                      </h4>
                      <p className="mt-2 text-sm text-blue-200">
                        Modèle basé sur la défense de la frontière entre le réseau interne et externe, avec une confiance implicite accordée aux utilisateurs internes.
                      </p>
                      <div className="mt-3">
                        <p className="text-xs font-medium">Caractéristiques :</p>
                        <ul className="list-disc list-inside mt-1 space-y-1 text-xs text-blue-300">
                          <li>Distinction claire entre "intérieur" (sécurisé) et "extérieur" (dangereux)</li>
                          <li>Confiance accordée par défaut aux ressources internes</li>
                          <li>Protection centrée sur le périmètre du réseau</li>
                          <li>Contrôles d'accès basés sur l'adresse IP et l'emplacement</li>
                          <li>VPNs utilisés pour étendre le périmètre de confiance</li>
                        </ul>
                      </div>
                      <div className="mt-3">
                        <p className="text-xs font-medium">Limitations :</p>
                        <ul className="list-disc list-inside mt-1 space-y-1 text-xs text-red-300">
                          <li>Une fois à l'intérieur, mouvement latéral facilité pour les attaquants</li>
                          <li>Inadapté aux environnements cloud et mobiles modernes</li>
                          <li>Non conçu pour le travail à distance généralisé</li>
                          <li>Vulnérable aux menaces internes et aux attaques avancées</li>
                        </ul>
                      </div>
                    </TabsContent>
                    <TabsContent value="zerotrust" className="p-4 bg-blue-950/30 rounded-md mt-4">
                      <h4 className="font-medium flex items-center">
                        <Lock className="mr-2 h-5 w-5 text-blue-400" />
                        Modèle Zero Trust
                      </h4>
                      <p className="mt-2 text-sm text-blue-200">
                        Approche de sécurité qui élimine la confiance implicite et applique des vérifications rigoureuses pour toutes les demandes d'accès, quelle que soit leur provenance.
                      </p>
                      <div className="mt-3">
                        <p className="text-xs font-medium">Caractéristiques :</p>
                        <ul className="list-disc list-inside mt-1 space-y-1 text-xs text-blue-300">
                          <li>Aucune confiance accordée par défaut, que ce soit à l'intérieur ou à l'extérieur</li>
                          <li>Vérification continuelle de l'identité, du contexte et de la santé des appareils</li>
                          <li>Accès limité au strict nécessaire (principe du moindre privilège)</li>
                          <li>Sécurité centrée sur l'identité et les données plutôt que sur le réseau</li>
                          <li>Authentification et autorisation pour chaque accès à une ressource</li>
                        </ul>
                      </div>
                      <div className="mt-3">
                        <p className="text-xs font-medium">Avantages :</p>
                        <ul className="list-disc list-inside mt-1 space-y-1 text-xs text-green-300">
                          <li>Protection adaptée aux environnements de travail hybrides et distants</li>
                          <li>Réduction de la surface d'attaque et du risque de mouvement latéral</li>
                          <li>Meilleure visibilité sur les accès aux ressources</li>
                          <li>Adaptabilité aux infrastructures cloud et multicloud</li>
                        </ul>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
            
            <div className="bg-blue-950 border border-blue-800 rounded-lg p-4 mt-6">
              <h3 className="text-lg font-medium mb-2 flex items-center">
                <Zap className="mr-2 h-5 w-5 text-blue-400" />
                Pourquoi le Zero Trust est-il si important aujourd'hui ?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <div className="bg-blue-900/30 p-3 rounded-md">
                  <h4 className="text-sm font-medium flex items-center">
                    <Globe className="mr-2 h-4 w-4 text-blue-400" />
                    Transformation du lieu de travail
                  </h4>
                  <ul className="list-disc list-inside mt-1 text-xs text-blue-200 space-y-1">
                    <li>Travail hybride et à distance généralisé</li>
                    <li>Utilisation des appareils personnels (BYOD)</li>
                    <li>Dissolution des frontières traditionnelles du réseau</li>
                  </ul>
                </div>
                <div className="bg-blue-900/30 p-3 rounded-md">
                  <h4 className="text-sm font-medium flex items-center">
                    <Server className="mr-2 h-4 w-4 text-blue-400" />
                    Évolution des infrastructures
                  </h4>
                  <ul className="list-disc list-inside mt-1 text-xs text-blue-200 space-y-1">
                    <li>Adoption massive du cloud et des architectures multicloud</li>
                    <li>Microservices et conteneurisation</li>
                    <li>Ressources et données réparties géographiquement</li>
                  </ul>
                </div>
                <div className="bg-blue-900/30 p-3 rounded-md">
                  <h4 className="text-sm font-medium flex items-center">
                    <AlertTriangle className="mr-2 h-4 w-4 text-blue-400" />
                    Sophistication des menaces
                  </h4>
                  <ul className="list-disc list-inside mt-1 text-xs text-blue-200 space-y-1">
                    <li>Attaques de plus en plus ciblées et persistantes</li>
                    <li>Augmentation des menaces internes</li>
                    <li>Échec des défenses périmètriques traditionnelles</li>
                  </ul>
                </div>
                <div className="bg-blue-900/30 p-3 rounded-md">
                  <h4 className="text-sm font-medium flex items-center">
                    <FileWarning className="mr-2 h-4 w-4 text-blue-400" />
                    Exigences réglementaires
                  </h4>
                  <ul className="list-disc list-inside mt-1 text-xs text-blue-200 space-y-1">
                    <li>Renforcement des cadres de conformité</li>
                    <li>Directives de cybersécurité gouvernementales</li>
                    <li>Obligation de protection des données personnelles</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
        <div className="flex justify-between mt-8">
          <div></div>
          <Button onClick={() => setActiveLesson('principes')} className="bg-blue-700 hover:bg-blue-800">
            Continuer
            <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
          </Button>
        </div>
      </div>
    ),
    
    principes: (
      <div className="space-y-6">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={contentVariants}
        >
          <h2 className="text-2xl font-bold">Principes fondamentaux du Zero Trust</h2>
          
          <p className="mt-4">
            Le modèle Zero Trust s'articule autour de principes directeurs clairs qui définissent son approche de la sécurité. Ces principes constituent la base conceptuelle sur laquelle repose toute architecture Zero Trust.
          </p>
          
          <div className="mt-6 space-y-5">
            <Card className="bg-blue-900/20 border-blue-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Shield className="mr-2 h-5 w-5 text-blue-400" />
                  Principes directeurs du Zero Trust
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="bg-blue-800/30 p-3 rounded-md">
                    <h4 className="font-medium flex items-center">
                      <span className="bg-blue-700 text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">1</span>
                      Vérifier explicitement
                    </h4>
                    <p className="mt-1 text-blue-200 text-sm">
                      Authentifier et autoriser chaque accès en fonction de toutes les données disponibles, y compris l'identité de l'utilisateur, l'appareil, la localisation et d'autres attributs.
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-blue-200 text-sm mt-2">
                      <li>Authentification forte, souvent multifacteur</li>
                      <li>Validation de l'état de sécurité des appareils</li>
                      <li>Évaluation des signaux contextuels (heure, lieu, comportement)</li>
                      <li>Vérification indépendante du réseau d'origine</li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-800/30 p-3 rounded-md">
                    <h4 className="font-medium flex items-center">
                      <span className="bg-blue-700 text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">2</span>
                      Appliquer le principe du moindre privilège
                    </h4>
                    <p className="mt-1 text-blue-200 text-sm">
                      Limiter l'accès des utilisateurs au strict nécessaire pour accomplir leurs tâches, réduisant ainsi l'exposition en cas de compromission d'un compte.
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-blue-200 text-sm mt-2">
                      <li>Accès basé sur le rôle et la fonction (RBAC)</li>
                      <li>Privilèges temporaires et à durée limitée (Just-in-Time Access)</li>
                      <li>Segmentation fine des ressources et des données</li>
                      <li>Révision régulière des autorisations</li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-800/30 p-3 rounded-md">
                    <h4 className="font-medium flex items-center">
                      <span className="bg-blue-700 text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">3</span>
                      Supposer la compromission
                    </h4>
                    <p className="mt-1 text-blue-200 text-sm">
                      Opérer en partant du principe que des menaces existent à la fois dans le réseau et en dehors, et qu'une violation peut se produire à tout moment.
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-blue-200 text-sm mt-2">
                      <li>Limitation du mouvement latéral au sein du réseau</li>
                      <li>Micro-segmentation des environnements</li>
                      <li>Chiffrement des communications entre ressources</li>
                      <li>Détection et réponse continues aux anomalies</li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-800/30 p-3 rounded-md">
                    <h4 className="font-medium flex items-center">
                      <span className="bg-blue-700 text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">4</span>
                      Vérifier continuellement
                    </h4>
                    <p className="mt-1 text-blue-200 text-sm">
                      Réévaluer constamment la confiance accordée plutôt que de se fier à une authentification unique ou périodique.
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-blue-200 text-sm mt-2">
                      <li>Surveillance des sessions actives</li>
                      <li>Réévaluation dynamique du niveau de risque</li>
                      <li>Révocation immédiate des accès en cas d'anomalie</li>
                      <li>Validation continue de l'état des appareils</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="mt-6">
              <h3 className="text-xl font-bold">Les piliers d'une architecture Zero Trust</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                <Card className="bg-blue-900/20 border-blue-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md flex items-center">
                      <User className="mr-2 h-5 w-5 text-blue-400" />
                      Identité
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <p className="mb-2">
                      L'identité devient le nouveau périmètre de sécurité, remplaçant le réseau comme frontière principale.
                    </p>
                    <div className="bg-blue-950/50 p-2 rounded-md text-xs">
                      <p className="font-medium text-white">Éléments clés :</p>
                      <ul className="list-disc list-inside space-y-1 text-blue-300 mt-1">
                        <li>Gestion forte des identités (utilisateurs, services, appareils)</li>
                        <li>Authentification multifacteur (MFA)</li>
                        <li>IAM (Identity and Access Management) centralisé</li>
                        <li>Fédération d'identités sécurisée</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-blue-900/20 border-blue-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md flex items-center">
                      <Smartphone className="mr-2 h-5 w-5 text-blue-400" />
                      Appareils
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <p className="mb-2">
                      La posture de sécurité des appareils devient un facteur critique dans les décisions d'autorisation.
                    </p>
                    <div className="bg-blue-950/50 p-2 rounded-md text-xs">
                      <p className="font-medium text-white">Technologies associées :</p>
                      <ul className="list-disc list-inside space-y-1 text-blue-300 mt-1">
                        <li>Inventaire et gestion des appareils</li>
                        <li>Évaluation de l'état de santé et de conformité</li>
                        <li>Solutions EDR/XDR pour la surveillance</li>
                        <li>Gestion des correctifs et des configurations</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-blue-900/20 border-blue-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md flex items-center">
                      <Network className="mr-2 h-5 w-5 text-blue-400" />
                      Réseau
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <p className="mb-2">
                      Sécurisation des flux réseau avec une granularité beaucoup plus fine, indépendamment de l'emplacement.
                    </p>
                    <div className="bg-blue-950/50 p-2 rounded-md text-xs">
                      <p className="font-medium text-white">Approches :</p>
                      <ul className="list-disc list-inside space-y-1 text-blue-300 mt-1">
                        <li>Micro-segmentation et segmentation par identité</li>
                        <li>Inspection approfondie du trafic (chiffré inclus)</li>
                        <li>SDN (Software-Defined Networking)</li>
                        <li>ZTNA (Zero Trust Network Access)</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-blue-900/20 border-blue-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md flex items-center">
                      <Layers className="mr-2 h-5 w-5 text-blue-400" />
                      Applications
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <p className="mb-2">
                      Protection des applications et des API, tant sur site que dans le cloud.
                    </p>
                    <div className="bg-blue-950/50 p-2 rounded-md text-xs">
                      <p className="font-medium text-white">Mécanismes :</p>
                      <ul className="list-disc list-inside space-y-1 text-blue-300 mt-1">
                        <li>Autorisation au niveau des applications</li>
                        <li>Protection des API et gestion des accès</li>
                        <li>Détection des comportements anormaux</li>
                        <li>DevSecOps et sécurité intégrée</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-blue-900/20 border-blue-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md flex items-center">
                      <Database className="mr-2 h-5 w-5 text-blue-400" />
                      Données
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <p className="mb-2">
                      Protection des données elles-mêmes, indépendamment de leur localisation ou du canal d'accès.
                    </p>
                    <div className="bg-blue-950/50 p-2 rounded-md text-xs">
                      <p className="font-medium text-white">Stratégies :</p>
                      <ul className="list-disc list-inside space-y-1 text-blue-300 mt-1">
                        <li>Classification et étiquetage des données</li>
                        <li>Chiffrement et contrôle des accès granulaires</li>
                        <li>DLP (Data Loss Prevention)</li>
                        <li>CASB (Cloud Access Security Broker)</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-blue-900/20 border-blue-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md flex items-center">
                      <Eye className="mr-2 h-5 w-5 text-blue-400" />
                      Visibilité et analyse
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <p className="mb-2">
                      Surveillance, journalisation et analyse continues pour détecter les anomalies et les menaces.
                    </p>
                    <div className="bg-blue-950/50 p-2 rounded-md text-xs">
                      <p className="font-medium text-white">Technologies :</p>
                      <ul className="list-disc list-inside space-y-1 text-blue-300 mt-1">
                        <li>SIEM (Security Information and Event Management)</li>
                        <li>Analytics et détection des anomalies</li>
                        <li>Journalisation centralisée et enrichie</li>
                        <li>Systèmes de détection de menaces avancés</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <Card className="bg-blue-900/20 border-blue-800 mt-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Users className="mr-2 h-5 w-5 text-blue-400" />
                  Cadres et modèles Zero Trust
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Plusieurs organisations ont développé des cadres formels pour guider l'implémentation du Zero Trust :
                </p>
                
                <div className="space-y-4">
                  <div className="bg-blue-800/30 p-3 rounded-md">
                    <h4 className="font-medium">NIST SP 800-207</h4>
                    <p className="text-sm text-blue-200 mt-1">
                      Cadre de référence du National Institute of Standards and Technology (USA) qui définit les principes fondamentaux et les composants logiques d'une architecture Zero Trust.
                    </p>
                    <div className="mt-2 text-xs bg-blue-900/30 p-2 rounded-md">
                      <p className="font-medium">Points clés :</p>
                      <ul className="list-disc list-inside mt-1 space-y-1 text-blue-300">
                        <li>Modèle en 7 piliers (identité, appareils, réseaux, applications, données, infrastructure, analytics)</li>
                        <li>Approche par étapes pour l'adoption progressive</li>
                        <li>Focus sur l'autorisation continue et dynamique</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-blue-800/30 p-3 rounded-md">
                    <h4 className="font-medium">Forrester Zero Trust eXtended (ZTX)</h4>
                    <p className="text-sm text-blue-200 mt-1">
                      Développé par l'entreprise qui a formalisé le concept de Zero Trust, ce cadre étend les principes originaux à un ensemble plus large de domaines.
                    </p>
                    <div className="mt-2 text-xs bg-blue-900/30 p-2 rounded-md">
                      <p className="font-medium">Domaines couverts :</p>
                      <ul className="list-disc list-inside mt-1 space-y-1 text-blue-300">
                        <li>Données, réseau, charge de travail, personnes, appareils, visibilité et analytique, automatisation et orchestration</li>
                        <li>Approche centrée sur la maturité et l'évaluation</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-blue-800/30 p-3 rounded-md">
                    <h4 className="font-medium">Modèle Zero Trust de Gartner (CARTA)</h4>
                    <p className="text-sm text-blue-200 mt-1">
                      Continuous Adaptive Risk and Trust Assessment met l'accent sur l'évaluation continue et adaptative des risques et de la confiance.
                    </p>
                    <div className="mt-2 text-xs bg-blue-900/30 p-2 rounded-md">
                      <p className="font-medium">Principes :</p>
                      <ul className="list-disc list-inside mt-1 space-y-1 text-blue-300">
                        <li>Évaluation continue et adaptative des risques</li>
                        <li>Approche centrée sur l'utilisateur et le contexte</li>
                        <li>Intégration étroite avec les processus métier</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="bg-blue-950 border border-blue-800 rounded-lg p-4 mt-4">
              <h3 className="text-lg font-medium mb-2 flex items-center">
                <Key className="mr-2 h-5 w-5 text-blue-400" />
                Le contexte : élément central du Zero Trust
              </h3>
              <p className="text-blue-200 mb-3">
                Dans une architecture Zero Trust, le contexte joue un rôle décisif dans l'évaluation des demandes d'accès :
              </p>
              <div className="space-y-2">
                <div className="bg-blue-900/30 p-2 rounded-md">
                  <p className="text-sm">
                    <strong>Qui</strong> - L'identité de l'utilisateur, du service ou de l'appareil demandant l'accès, avec une validation rigoureuse.
                  </p>
                </div>
                <div className="bg-blue-900/30 p-2 rounded-md">
                  <p className="text-sm">
                    <strong>Quoi</strong> - La ressource à laquelle l'accès est demandé et les opérations que l'utilisateur souhaite effectuer.
                  </p>
                </div>
                <div className="bg-blue-900/30 p-2 rounded-md">
                  <p className="text-sm">
                    <strong>Où</strong> - L'emplacement géographique de l'utilisateur et la caractérisation du réseau utilisé (professionnel, public, domestique).
                  </p>
                </div>
                <div className="bg-blue-900/30 p-2 rounded-md">
                  <p className="text-sm">
                    <strong>Quand</strong> - L'heure et le jour de la demande d'accès, évalués en fonction des habitudes normales d'accès.
                  </p>
                </div>
                <div className="bg-blue-900/30 p-2 rounded-md">
                  <p className="text-sm">
                    <strong>Comment</strong> - L'appareil utilisé, son état de sécurité, les correctifs installés et sa conformité aux politiques.
                  </p>
                </div>
                <div className="bg-blue-900/30 p-2 rounded-md">
                  <p className="text-sm">
                    <strong>Pourquoi</strong> - La justification commerciale de l'accès et sa cohérence avec le rôle de l'utilisateur.
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
          <Button onClick={() => setActiveLesson('implementation')} className="bg-blue-700 hover:bg-blue-800">
            Continuer
            <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
          </Button>
        </div>
      </div>
    ),
    
    implementation: (
      <div className="space-y-6">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={contentVariants}
        >
          <h2 className="text-2xl font-bold">Mise en œuvre du Zero Trust</h2>
          
          <Alert className="bg-blue-900/30 border-blue-500 mt-4">
            <Lightbulb className="h-5 w-5 text-blue-500" />
            <AlertTitle className="text-blue-100">Approche progressive</AlertTitle>
            <AlertDescription className="text-blue-200">
              L'implémentation du Zero Trust est un parcours, pas une destination. Une approche par étapes, ciblant d'abord les ressources les plus critiques, permet une transition maîtrisée.
            </AlertDescription>
          </Alert>
          
          <div className="mt-6 space-y-5">
            <Card className="bg-blue-900/20 border-blue-800">
              <CardHeader>
                <CardTitle>Méthodologie d'implémentation</CardTitle>
                <CardDescription className="text-blue-200">
                  Les étapes essentielles pour mettre en place une stratégie Zero Trust
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="bg-blue-800/30 p-3 rounded-md">
                    <h3 className="font-medium flex items-center">
                      <span className="bg-blue-700 text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">1</span>
                      Définir la stratégie et les objectifs
                    </h3>
                    <ul className="list-disc list-inside text-sm text-blue-200 mt-2 space-y-1">
                      <li>Identifier les besoins et les défis spécifiques de l'organisation</li>
                      <li>Obtenir l'adhésion de la direction et des parties prenantes</li>
                      <li>Définir les résultats attendus et les indicateurs de succès</li>
                      <li>Choisir un cadre de référence adapté (NIST, Forrester, etc.)</li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-800/30 p-3 rounded-md">
                    <h3 className="font-medium flex items-center">
                      <span className="bg-blue-700 text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">2</span>
                      Inventorier et cartographier
                    </h3>
                    <ul className="list-disc list-inside text-sm text-blue-200 mt-2 space-y-1">
                      <li>Établir un inventaire complet des ressources (données, applications, utilisateurs, appareils)</li>
                      <li>Identifier et classer les données selon leur sensibilité</li>
                      <li>Cartographier les flux de données et les accès</li>
                      <li>Comprendre les dépendances entre les systèmes</li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-800/30 p-3 rounded-md">
                    <h3 className="font-medium flex items-center">
                      <span className="bg-blue-700 text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">3</span>
                      Définir l'architecture Zero Trust
                    </h3>
                    <ul className="list-disc list-inside text-sm text-blue-200 mt-2 space-y-1">
                      <li>Concevoir le modèle de sécurité cible</li>
                      <li>Définir les politiques d'accès basées sur l'identité</li>
                      <li>Établir les mécanismes de vérification et de validation</li>
                      <li>Planifier la segmentation et l'isolation des ressources</li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-800/30 p-3 rounded-md">
                    <h3 className="font-medium flex items-center">
                      <span className="bg-blue-700 text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">4</span>
                      Implémenter par phases
                    </h3>
                    <ul className="list-disc list-inside text-sm text-blue-200 mt-2 space-y-1">
                      <li>Commencer par un projet pilote sur un périmètre limité</li>
                      <li>Prioriser les ressources critiques ou à haut risque</li>
                      <li>Déployer les technologies et solutions de base</li>
                      <li>Étendre progressivement à d'autres ressources et utilisateurs</li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-800/30 p-3 rounded-md">
                    <h3 className="font-medium flex items-center">
                      <span className="bg-blue-700 text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">5</span>
                      Surveiller, mesurer et ajuster
                    </h3>
                    <ul className="list-disc list-inside text-sm text-blue-200 mt-2 space-y-1">
                      <li>Mettre en place une surveillance continue des accès et des comportements</li>
                      <li>Mesurer l'efficacité par rapport aux objectifs définis</li>
                      <li>Collecter les retours d'expérience des utilisateurs</li>
                      <li>Ajuster les politiques et configurations en fonction des résultats</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="mt-6">
              <h3 className="text-xl font-bold">Approches d'implémentation</h3>
              
              <Card className="bg-blue-900/20 border-blue-800 mt-3">
                <CardContent className="pt-6">
                  <Tabs defaultValue="greenfield">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="greenfield">Projets "greenfield"</TabsTrigger>
                      <TabsTrigger value="migration">Migration d'existant</TabsTrigger>
                    </TabsList>
                    <TabsContent value="greenfield" className="p-4 bg-blue-950/30 rounded-md mt-4">
                      <h4 className="font-medium flex items-center">
                        <CheckCircle2 className="mr-2 h-5 w-5 text-blue-400" />
                        Conception Zero Trust native
                      </h4>
                      <p className="mt-2 text-sm text-blue-200">
                        Pour les nouvelles initiatives, applications ou infrastructures, l'intégration des principes Zero Trust dès la conception est la voie privilégiée.
                      </p>
                      <div className="mt-3">
                        <p className="text-xs font-medium">Avantages :</p>
                        <ul className="list-disc list-inside mt-1 space-y-1 text-xs text-blue-300">
                          <li>Pas de dette technique ou de systèmes hérités à gérer</li>
                          <li>Conception optimisée pour Zero Trust dès le départ</li>
                          <li>Réduction des risques et des coûts à long terme</li>
                          <li>Uniformité de l'approche et des contrôles</li>
                        </ul>
                      </div>
                      <div className="mt-3">
                        <p className="text-xs font-medium">Facteurs clés de succès :</p>
                        <ul className="list-disc list-inside mt-1 space-y-1 text-xs text-green-300">
                          <li>Intégrer les principes Zero Trust dans les critères de conception</li>
                          <li>Privilégier les solutions nativement compatibles Zero Trust</li>
                          <li>Former l'équipe de développement aux principes et pratiques Zero Trust</li>
                          <li>Adopter une approche DevSecOps intégrant la sécurité au cycle de développement</li>
                        </ul>
                      </div>
                    </TabsContent>
                    <TabsContent value="migration" className="p-4 bg-blue-950/30 rounded-md mt-4">
                      <h4 className="font-medium flex items-center">
                        <RefreshCw className="mr-2 h-5 w-5 text-blue-400" />
                        Transformation des systèmes existants
                      </h4>
                      <p className="mt-2 text-sm text-blue-200">
                        Pour les environnements existants, une approche progressive et stratégique est nécessaire pour transformer les systèmes hérités vers le modèle Zero Trust.
                      </p>
                      <div className="mt-3">
                        <p className="text-xs font-medium">Défis spécifiques :</p>
                        <ul className="list-disc list-inside mt-1 space-y-1 text-xs text-red-300">
                          <li>Systèmes hérités potentiellement incompatibles avec certains principes Zero Trust</li>
                          <li>Risque d'interruption des opérations et des services</li>
                          <li>Résistance au changement des utilisateurs et équipes IT</li>
                          <li>Complexité de l'intégration avec l'infrastructure existante</li>
                        </ul>
                      </div>
                      <div className="mt-3">
                        <p className="text-xs font-medium">Stratégie recommandée :</p>
                        <ul className="list-disc list-inside mt-1 space-y-1 text-xs text-blue-300">
                          <li>Déployer des solutions de superposition ("overlay") qui s'intègrent avec l'existant</li>
                          <li>Implémenter par couches (identité, appareils, puis réseau, etc.)</li>
                          <li>Créer des îlots Zero Trust progressivement élargis</li>
                          <li>Mettre en place une politique de modernisation à long terme</li>
                        </ul>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
            
            <Card className="bg-blue-900/20 border-blue-800 mt-6">
              <CardHeader>
                <CardTitle>Étapes pratiques de mise en œuvre</CardTitle>
                <CardDescription className="text-blue-200">
                  Approche chronologique pour implémenter le Zero Trust
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-blue-800/30 p-3 rounded-md">
                    <h3 className="font-medium">Phase 1 : Fondations et infrastructures</h3>
                    <div className="mt-2 space-y-2">
                      <div className="bg-blue-900/30 p-2 rounded-md flex items-start">
                        <span className="bg-blue-700 text-white w-6 h-6 rounded-full flex items-center justify-center mr-2 flex-shrink-0">1</span>
                        <div>
                          <h4 className="text-sm font-medium">Renforcer la gestion des identités</h4>
                          <ul className="list-disc list-inside text-xs text-blue-300 mt-1">
                            <li>Centraliser la gestion des identités (IAM)</li>
                            <li>Déployer l'authentification multifacteur (MFA)</li>
                            <li>Mettre en place le contrôle d'accès basé sur les rôles (RBAC)</li>
                          </ul>
                        </div>
                      </div>
                      <div className="bg-blue-900/30 p-2 rounded-md flex items-start">
                        <span className="bg-blue-700 text-white w-6 h-6 rounded-full flex items-center justify-center mr-2 flex-shrink-0">2</span>
                        <div>
                          <h4 className="text-sm font-medium">Établir la visibilité sur les appareils</h4>
                          <ul className="list-disc list-inside text-xs text-blue-300 mt-1">
                            <li>Inventorier tous les appareils accédant aux ressources</li>
                            <li>Déployer des solutions de gestion des terminaux (MDM/UEM)</li>
                            <li>Implémenter des systèmes d'évaluation de l'état des appareils</li>
                          </ul>
                        </div>
                      </div>
                      <div className="bg-blue-900/30 p-2 rounded-md flex items-start">
                        <span className="bg-blue-700 text-white w-6 h-6 rounded-full flex items-center justify-center mr-2 flex-shrink-0">3</span>
                        <div>
                          <h4 className="text-sm font-medium">Améliorer la visibilité réseau</h4>
                          <ul className="list-disc list-inside text-xs text-blue-300 mt-1">
                            <li>Cartographier le trafic et les connexions existantes</li>
                            <li>Déployer des outils de surveillance et d'analyse du trafic</li>
                            <li>Mettre en place un SIEM et collecter les journaux pertinents</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-800/30 p-3 rounded-md">
                    <h3 className="font-medium">Phase 2 : Contrôles et politiques</h3>
                    <div className="mt-2 space-y-2">
                      <div className="bg-blue-900/30 p-2 rounded-md flex items-start">
                        <span className="bg-blue-700 text-white w-6 h-6 rounded-full flex items-center justify-center mr-2 flex-shrink-0">4</span>
                        <div>
                          <h4 className="text-sm font-medium">Définir les politiques d'accès</h4>
                          <ul className="list-disc list-inside text-xs text-blue-300 mt-1">
                            <li>Créer des politiques basées sur l'identité et le contexte</li>
                            <li>Implémenter le principe du moindre privilège</li>
                            <li>Définir les règles d'accès conditionnel</li>
                          </ul>
                        </div>
                      </div>
                      <div className="bg-blue-900/30 p-2 rounded-md flex items-start">
                        <span className="bg-blue-700 text-white w-6 h-6 rounded-full flex items-center justify-center mr-2 flex-shrink-0">5</span>
                        <div>
                          <h4 className="text-sm font-medium">Sécuriser les ressources critiques</h4>
                          <ul className="list-disc list-inside text-xs text-blue-300 mt-1">
                            <li>Appliquer les contrôles Zero Trust aux applications et données les plus sensibles</li>
                            <li>Segmenter et isoler les environnements critiques</li>
                            <li>Mettre en place le chiffrement des données au repos et en transit</li>
                          </ul>
                        </div>
                      </div>
                      <div className="bg-blue-900/30 p-2 rounded-md flex items-start">
                        <span className="bg-blue-700 text-white w-6 h-6 rounded-full flex items-center justify-center mr-2 flex-shrink-0">6</span>
                        <div>
                          <h4 className="text-sm font-medium">Déployer des solutions d'accès sécurisé</h4>
                          <ul className="list-disc list-inside text-xs text-blue-300 mt-1">
                            <li>Implémenter des solutions ZTNA (Zero Trust Network Access)</li>
                            <li>Mettre en place des proxy d'accès sécurisés</li>
                            <li>Déployer des solutions de micro-segmentation</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-800/30 p-3 rounded-md">
                    <h3 className="font-medium">Phase 3 : Extension et optimisation</h3>
                    <div className="mt-2 space-y-2">
                      <div className="bg-blue-900/30 p-2 rounded-md flex items-start">
                        <span className="bg-blue-700 text-white w-6 h-6 rounded-full flex items-center justify-center mr-2 flex-shrink-0">7</span>
                        <div>
                          <h4 className="text-sm font-medium">Étendre à l'ensemble de l'organisation</h4>
                          <ul className="list-disc list-inside text-xs text-blue-300 mt-1">
                            <li>Élargir progressivement à toutes les applications et données</li>
                            <li>Inclure tous les utilisateurs et types d'appareils</li>
                            <li>Intégrer les partenaires et fournisseurs dans le modèle Zero Trust</li>
                          </ul>
                        </div>
                      </div>
                      <div className="bg-blue-900/30 p-2 rounded-md flex items-start">
                        <span className="bg-blue-700 text-white w-6 h-6 rounded-full flex items-center justify-center mr-2 flex-shrink-0">8</span>
                        <div>
                          <h4 className="text-sm font-medium">Améliorer la détection et la réponse</h4>
                          <ul className="list-disc list-inside text-xs text-blue-300 mt-1">
                            <li>Mettre en place des mécanismes avancés de détection d'anomalies</li>
                            <li>Automatiser les réponses aux incidents</li>
                            <li>Intégrer l'IA pour l'analyse comportementale</li>
                          </ul>
                        </div>
                      </div>
                      <div className="bg-blue-900/30 p-2 rounded-md flex items-start">
                        <span className="bg-blue-700 text-white w-6 h-6 rounded-full flex items-center justify-center mr-2 flex-shrink-0">9</span>
                        <div>
                          <h4 className="text-sm font-medium">Optimiser et faire évoluer</h4>
                          <ul className="list-disc list-inside text-xs text-blue-300 mt-1">
                            <li>Mesurer et ajuster les politiques en fonction des résultats</li>
                            <li>Former continuellement les utilisateurs et les équipes IT</li>
                            <li>Rester à jour avec les évolutions technologiques et les menaces</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="bg-blue-950 border border-blue-800 rounded-lg p-4 mt-4">
              <h3 className="text-lg font-medium mb-2 flex items-center">
                <Clock className="mr-2 h-5 w-5 text-blue-400" />
                Facteurs de succès critiques
              </h3>
              <p className="text-blue-200 mb-3">
                Éléments essentiels pour une mise en œuvre réussie du Zero Trust :
              </p>
              <div className="space-y-2">
                <div className="bg-blue-900/30 p-2 rounded-md">
                  <p className="text-sm">
                    <strong>Soutien de la direction</strong> : L'engagement des dirigeants est crucial pour surmonter la résistance au changement et assurer les ressources nécessaires.
                  </p>
                </div>
                <div className="bg-blue-900/30 p-2 rounded-md">
                  <p className="text-sm">
                    <strong>Communication claire</strong> : Expliquer les bénéfices et les changements à tous les niveaux de l'organisation pour faciliter l'adoption.
                  </p>
                </div>
                <div className="bg-blue-900/30 p-2 rounded-md">
                  <p className="text-sm">
                    <strong>Formation et accompagnement</strong> : Préparer les équipes IT et les utilisateurs aux nouvelles pratiques et technologies.
                  </p>
                </div>
                <div className="bg-blue-900/30 p-2 rounded-md">
                  <p className="text-sm">
                    <strong>Approche équilibrée sécurité/expérience</strong> : Veiller à ce que les mesures de sécurité n'affectent pas excessivement la productivité des utilisateurs.
                  </p>
                </div>
                <div className="bg-blue-900/30 p-2 rounded-md">
                  <p className="text-sm">
                    <strong>Collaboration interdépartementale</strong> : Impliquer toutes les parties prenantes (IT, sécurité, métiers) dans la conception et le déploiement.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
        <div className="flex justify-between mt-8">
          <Button onClick={() => setActiveLesson('principes')} variant="outline" className="border-blue-700 text-blue-300">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Précédent
          </Button>
          <Button onClick={() => setActiveLesson('technologies')} className="bg-blue-700 hover:bg-blue-800">
            Continuer
            <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
          </Button>
        </div>
      </div>
    ),
    
    technologies: (
      <div className="space-y-6">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={contentVariants}
        >
          <h2 className="text-2xl font-bold">Technologies clés du Zero Trust</h2>
          
          <p className="mt-4">
            La mise en œuvre d'une architecture Zero Trust repose sur un ensemble de technologies complémentaires qui, ensemble, permettent d'appliquer ses principes fondamentaux.
          </p>
          
          <div className="mt-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-blue-900/20 border-blue-800">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="mr-2 h-5 w-5 text-blue-400" />
                    Gestion des identités et des accès (IAM)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-950/40 p-3 rounded-md">
                    <h4 className="font-medium">Fonctions essentielles</h4>
                    <ul className="list-disc list-inside text-sm text-blue-200 mt-2 space-y-1">
                      <li>Authentification forte des utilisateurs et services</li>
                      <li>Gestion centralisée des identités</li>
                      <li>Attribution et gestion des droits d'accès</li>
                      <li>Fédération d'identités entre systèmes</li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-950/40 p-3 rounded-md">
                    <h4 className="font-medium">Technologies spécifiques</h4>
                    <ul className="list-disc list-inside text-sm text-blue-200 mt-2 space-y-1">
                      <li><strong>SSO (Single Sign-On)</strong> : Authentification unique pour accéder à plusieurs applications</li>
                      <li><strong>MFA (Multi-Factor Authentication)</strong> : Ajout de facteurs supplémentaires à l'authentification par mot de passe</li>
                      <li><strong>Gestion des identités privilégiées (PAM)</strong> : Contrôle renforcé des comptes à haut privilège</li>
                      <li><strong>Identity Governance</strong> : Gestion des droits d'accès sur le cycle de vie complet</li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-950/40 p-3 rounded-md">
                    <h4 className="font-medium">Innovations récentes</h4>
                    <ul className="list-disc list-inside text-sm text-blue-200 mt-2 space-y-1">
                      <li><strong>Authentification sans mot de passe</strong> : Basée sur les clés de sécurité, la biométrie ou les codes temporaires</li>
                      <li><strong>Adaptive Authentication</strong> : Ajustement dynamique des exigences d'authentification selon le risque</li>
                      <li><strong>Continuous Authentication</strong> : Vérification constante de l'identité pendant les sessions</li>
                      <li><strong>Risk-based Authentication</strong> : Évaluation du niveau de risque de chaque tentative d'authentification</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-blue-900/20 border-blue-800">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Network className="mr-2 h-5 w-5 text-blue-400" />
                    Technologies réseau Zero Trust
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-950/40 p-3 rounded-md">
                    <h4 className="font-medium">ZTNA (Zero Trust Network Access)</h4>
                    <p className="text-sm text-blue-200 mt-1">
                      Alternative moderne aux VPN traditionnels, permettant un accès précis aux applications plutôt qu'au réseau entier, basé sur l'identité et le contexte.
                    </p>
                    <div className="mt-2">
                      <p className="text-xs font-medium">Caractéristiques :</p>
                      <ul className="list-disc list-inside text-xs text-blue-300 mt-1">
                        <li>Accès applicatif sans exposition du réseau</li>
                        <li>Invisibilité des ressources pour les utilisateurs non autorisés</li>
                        <li>Connexions établies uniquement après vérification complète</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-blue-950/40 p-3 rounded-md">
                    <h4 className="font-medium">Micro-segmentation</h4>
                    <p className="text-sm text-blue-200 mt-1">
                      Division du réseau en zones de sécurité isolées, permettant un contrôle d'accès granulaire au niveau des applications ou même des charges de travail individuelles.
                    </p>
                    <div className="mt-2">
                      <p className="text-xs font-medium">Types d'implémentation :</p>
                      <ul className="list-disc list-inside text-xs text-blue-300 mt-1">
                        <li>Micro-segmentation basée sur le réseau (VLAN, ACL, Firewalls)</li>
                        <li>Micro-segmentation basée sur l'hyperviseur (SDN)</li>
                        <li>Micro-segmentation centrée sur les charges de travail (agents)</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-blue-950/40 p-3 rounded-md">
                    <h4 className="font-medium">Technologies complémentaires</h4>
                    <ul className="list-disc list-inside text-sm text-blue-200 mt-2 space-y-1">
                      <li><strong>SDP (Software-Defined Perimeter)</strong> : Infrastructure réseau invisible par défaut</li>
                      <li><strong>SASE (Secure Access Service Edge)</strong> : Convergence de la sécurité réseau et cloud</li>
                      <li><strong>mTLS (mutual TLS)</strong> : Authentification réciproque des deux extrémités d'une communication</li>
                      <li><strong>NTA (Network Traffic Analysis)</strong> : Analyse comportementale du trafic réseau</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-blue-900/20 border-blue-800">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Smartphone className="mr-2 h-5 w-5 text-blue-400" />
                    Gestion et sécurité des appareils
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-950/40 p-3 rounded-md">
                    <h4 className="font-medium">Solutions de gestion unifiée des points terminaux (UEM)</h4>
                    <p className="text-sm text-blue-200 mt-1">
                      Plateformes permettant la gestion, la configuration et la sécurisation de tous les types d'appareils (mobiles, ordinateurs, IoT) depuis une console centralisée.
                    </p>
                    <div className="mt-2">
                      <p className="text-xs font-medium">Fonctionnalités :</p>
                      <ul className="list-disc list-inside text-xs text-blue-300 mt-1">
                        <li>Inventaire et gestion du cycle de vie des appareils</li>
                        <li>Application des politiques de sécurité</li>
                        <li>Évaluation de la conformité des appareils</li>
                        <li>Provisionnement et déprovisionnement automatisés</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-blue-950/40 p-3 rounded-md">
                    <h4 className="font-medium">Évaluation de l'état de santé des appareils</h4>
                    <p className="text-sm text-blue-200 mt-1">
                      Technologies permettant d'évaluer en temps réel la posture de sécurité d'un appareil avant d'autoriser l'accès aux ressources.
                    </p>
                    <div className="mt-2">
                      <p className="text-xs font-medium">Éléments vérifiés :</p>
                      <ul className="list-disc list-inside text-xs text-blue-300 mt-1">
                        <li>État des correctifs de sécurité et des mises à jour</li>
                        <li>Présence et fonctionnement des solutions de sécurité</li>
                        <li>État du chiffrement et des protections du système</li>
                        <li>Absence de jailbreak/root ou de logiciels non autorisés</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-blue-950/40 p-3 rounded-md">
                    <h4 className="font-medium">Solutions EDR/XDR</h4>
                    <p className="text-sm text-blue-200 mt-1">
                      Technologies de détection et réponse avancées qui surveillent les activités sur les appareils pour identifier et bloquer les menaces.
                    </p>
                    <ul className="list-disc list-inside text-xs text-blue-300 mt-2">
                      <li><strong>EDR (Endpoint Detection and Response)</strong> : Surveillance et protection des terminaux</li>
                      <li><strong>XDR (Extended Detection and Response)</strong> : Vision unifiée incluant réseau, cloud et applications</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-blue-900/20 border-blue-800">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Database className="mr-2 h-5 w-5 text-blue-400" />
                    Protection des données et des applications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-950/40 p-3 rounded-md">
                    <h4 className="font-medium">Classification et gouvernance des données</h4>
                    <p className="text-sm text-blue-200 mt-1">
                      Solutions permettant d'identifier, classer et gérer les données selon leur sensibilité pour appliquer les contrôles appropriés.
                    </p>
                    <ul className="list-disc list-inside text-xs text-blue-300 mt-2">
                      <li>Découverte et catalogage automatisés des données</li>
                      <li>Étiquetage et classification selon les politiques</li>
                      <li>Contrôles de confidentialité intégrés aux données</li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-950/40 p-3 rounded-md">
                    <h4 className="font-medium">CASB (Cloud Access Security Broker)</h4>
                    <p className="text-sm text-blue-200 mt-1">
                      Solutions intermédiaires qui appliquent les politiques de sécurité lors de l'accès aux services cloud, assurant la visibilité et le contrôle des données dans le cloud.
                    </p>
                    <ul className="list-disc list-inside text-xs text-blue-300 mt-2">
                      <li>Découverte des applications cloud utilisées (Shadow IT)</li>
                      <li>Application des politiques de sécurité dans le cloud</li>
                      <li>Prévention des fuites de données (DLP)</li>
                      <li>Détection des menaces cloud-natives</li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-950/40 p-3 rounded-md">
                    <h4 className="font-medium">Sécurité des API et des applications</h4>
                    <p className="text-sm text-blue-200 mt-1">
                      Technologies protégeant les applications et leurs interfaces de programmation, éléments souvent critiques dans une architecture moderne.
                    </p>
                    <ul className="list-disc list-inside text-xs text-blue-300 mt-2">
                      <li>Passerelles API avec authentification et autorisation</li>
                      <li>WAF (Web Application Firewall) nouvelle génération</li>
                      <li>RASP (Runtime Application Self-Protection)</li>
                      <li>Pare-feu pour applications (NGFW, WAAP)</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card className="bg-blue-900/20 border-blue-800 mt-4">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="mr-2 h-5 w-5 text-blue-400" />
                  Visibilité, analyse et automatisation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-950/40 p-3 rounded-md">
                    <h4 className="font-medium">Solutions SIEM/SOAR</h4>
                    <p className="text-sm text-blue-200 mt-1">
                      Plateformes centralisant la collecte, l'analyse et la réponse aux événements de sécurité à travers l'infrastructure.
                    </p>
                    <ul className="list-disc list-inside text-xs text-blue-300 mt-2">
                      <li><strong>SIEM</strong> (Security Information and Event Management) : Collecte et analyse des journaux</li>
                      <li><strong>SOAR</strong> (Security Orchestration, Automation and Response) : Automatisation des réponses aux incidents</li>
                      <li>Corrélation des événements multi-sources</li>
                      <li>Détection des comportements anormaux</li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-950/40 p-3 rounded-md">
                    <h4 className="font-medium">Analytics et intelligence artificielle</h4>
                    <p className="text-sm text-blue-200 mt-1">
                      Technologies d'analyse avancée utilisant l'IA et le ML pour détecter les anomalies et évaluer les risques en temps réel.
                    </p>
                    <ul className="list-disc list-inside text-xs text-blue-300 mt-2">
                      <li>Détection d'anomalies comportementales (UEBA)</li>
                      <li>Analyses prédictives des risques</li>
                      <li>Modélisation des comportements normaux</li>
                      <li>Évaluation dynamique de la confiance</li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-950/40 p-3 rounded-md">
                    <h4 className="font-medium">Orchestration et automatisation</h4>
                    <p className="text-sm text-blue-200 mt-1">
                      Solutions permettant d'automatiser les processus de sécurité et de coordonner les différentes technologies Zero Trust.
                    </p>
                    <ul className="list-disc list-inside text-xs text-blue-300 mt-2">
                      <li>Orchestration des politiques entre systèmes</li>
                      <li>Automatisation des réponses aux incidents</li>
                      <li>Workflows de remédiation</li>
                      <li>Intégration entre les différentes solutions</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="bg-blue-950 border border-blue-800 rounded-lg p-4 mt-4">
              <h3 className="text-lg font-medium mb-2 flex items-center">
                <Zap className="mr-2 h-5 w-5 text-blue-400" />
                Écosystème technologique Zero Trust
              </h3>
              <p className="text-blue-200 mb-3">
                L'intégration et l'interopérabilité des différentes technologies sont essentielles pour une architecture Zero Trust efficace :
              </p>
              <div className="space-y-2">
                <div className="bg-blue-900/30 p-2 rounded-md">
                  <h4 className="text-sm font-medium">Plateformes intégrées Zero Trust</h4>
                  <p className="text-xs text-blue-300 mt-1">
                    Solutions complètes combinant plusieurs composants Zero Trust dans une plateforme unifiée, comme les offres SASE (Secure Access Service Edge) qui intègrent ZTNA, SWG, CASB et FWaaS.
                  </p>
                </div>
                <div className="bg-blue-900/30 p-2 rounded-md">
                  <h4 className="text-sm font-medium">API et intégrations ouvertes</h4>
                  <p className="text-xs text-blue-300 mt-1">
                    Importance des interfaces programmatiques permettant l'intégration entre solutions de différents fournisseurs pour créer un écosystème cohérent.
                  </p>
                </div>
                <div className="bg-blue-900/30 p-2 rounded-md">
                  <h4 className="text-sm font-medium">Standards émergents</h4>
                  <p className="text-xs text-blue-300 mt-1">
                    Initiatives comme SPIFFE/SPIRE pour l'identité des services, FIDO2 pour l'authentification sans mot de passe, ou OpenID Connect pour les flux d'identité.
                  </p>
                </div>
                <div className="bg-blue-900/30 p-2 rounded-md">
                  <h4 className="text-sm font-medium">Considérations pour le choix des technologies</h4>
                  <p className="text-xs text-blue-300 mt-1">
                    Privilégier les solutions conçues dans une optique Zero Trust plutôt que d'adapter des outils traditionnels. Rechercher l'interopérabilité, l'évolutivité et la cohérence avec vos besoins spécifiques.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
        <div className="flex justify-between mt-8">
          <Button onClick={() => setActiveLesson('implementation')} variant="outline" className="border-blue-700 text-blue-300">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Précédent
          </Button>
          <Button onClick={() => setActiveLesson('avantages')} className="bg-blue-700 hover:bg-blue-800">
            Continuer
            <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
          </Button>
        </div>
      </div>
    ),
    
    avantages: (
      <div className="space-y-6">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={contentVariants}
        >
          <h2 className="text-2xl font-bold">Avantages et défis du Zero Trust</h2>
          
          <p className="mt-4">
            L'adoption du Zero Trust présente de nombreux bénéfices, mais également des défis significatifs. Comprendre cet équilibre est essentiel pour une mise en œuvre réussie.
          </p>
          
          <div className="mt-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-green-900/20 border-green-800">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle2 className="mr-2 h-5 w-5 text-green-400" />
                    Avantages du modèle Zero Trust
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-green-900/30 p-3 rounded-md">
                    <h4 className="font-medium">Renforcement de la sécurité</h4>
                    <ul className="list-disc list-inside text-sm text-green-200 mt-2 space-y-1">
                      <li><strong>Réduction de la surface d'attaque</strong> : Limitation de l'exposition des ressources</li>
                      <li><strong>Prévention des mouvements latéraux</strong> : Restriction de la propagation des attaques</li>
                      <li><strong>Détection précoce des menaces</strong> : Identification plus rapide des comportements anormaux</li>
                      <li><strong>Protection contre les menaces internes</strong> : Vérification de tous les accès, y compris ceux des utilisateurs internes</li>
                    </ul>
                  </div>
                  
                  <div className="bg-green-900/30 p-3 rounded-md">
                    <h4 className="font-medium">Amélioration de la visibilité</h4>
                    <ul className="list-disc list-inside text-sm text-green-200 mt-2 space-y-1">
                      <li><strong>Inventaire complet</strong> des utilisateurs, appareils et ressources</li>
                      <li><strong>Traçabilité détaillée</strong> de tous les accès et activités</li>
                      <li><strong>Cartographie précise</strong> des flux de données</li>
                      <li><strong>Meilleure compréhension</strong> des risques et des vulnérabilités</li>
                    </ul>
                  </div>
                  
                  <div className="bg-green-900/30 p-3 rounded-md">
                    <h4 className="font-medium">Flexibilité et agilité accrues</h4>
                    <ul className="list-disc list-inside text-sm text-green-200 mt-2 space-y-1">
                      <li><strong>Support des environnements hybrides</strong> : Cohérence entre on-premise et cloud</li>
                      <li><strong>Adaptabilité aux modes de travail modernes</strong> : Télétravail, BYOD, mobilité</li>
                      <li><strong>Indépendance du lieu</strong> : Sécurité non liée à l'emplacement physique</li>
                      <li><strong>Évolutivité</strong> : Capacité à s'adapter à la croissance de l'organisation</li>
                    </ul>
                  </div>
                  
                  <div className="bg-green-900/30 p-3 rounded-md">
                    <h4 className="font-medium">Bénéfices opérationnels et financiers</h4>
                    <ul className="list-disc list-inside text-sm text-green-200 mt-2 space-y-1">
                      <li><strong>Réduction des coûts d'infrastructure</strong> : Simplification du réseau</li>
                      <li><strong>Diminution de l'impact des violations</strong> : Limitation des dommages potentiels</li>
                      <li><strong>Facilitation de la conformité réglementaire</strong> : Contrôles plus précis et auditables</li>
                      <li><strong>Meilleure expérience utilisateur</strong> avec des accès cohérents et adaptés au contexte</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-red-900/20 border-red-800">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="mr-2 h-5 w-5 text-red-400" />
                    Défis et obstacles potentiels
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-red-900/30 p-3 rounded-md">
                    <h4 className="font-medium">Complexité technique</h4>
                    <ul className="list-disc list-inside text-sm text-red-200 mt-2 space-y-1">
                      <li><strong>Intégration de technologies diverses</strong> et parfois disparates</li>
                      <li><strong>Gestion d'une architecture plus sophistiquée</strong> que les modèles traditionnels</li>
                      <li><strong>Exigences en compétences spécialisées</strong> pour la conception et la maintenance</li>
                      <li><strong>Interopérabilité</strong> entre les solutions de différents fournisseurs</li>
                    </ul>
                  </div>
                  
                  <div className="bg-red-900/30 p-3 rounded-md">
                    <h4 className="font-medium">Résistance au changement</h4>
                    <ul className="list-disc list-inside text-sm text-red-200 mt-2 space-y-1">
                      <li><strong>Perturbation des habitudes</strong> des utilisateurs et du personnel IT</li>
                      <li><strong>Perception d'entraves</strong> à la productivité avec les contrôles supplémentaires</li>
                      <li><strong>Nécessité de modifier</strong> des processus établis et familiers</li>
                      <li><strong>Besoin de formation</strong> et d'accompagnement des équipes</li>
                    </ul>
                  </div>
                  
                  <div className="bg-red-900/30 p-3 rounded-md">
                    <h4 className="font-medium">Défis de mise en œuvre</h4>
                    <ul className="list-disc list-inside text-sm text-red-200 mt-2 space-y-1">
                      <li><strong>Compatibilité avec les systèmes hérités</strong> souvent problématique</li>
                      <li><strong>Transition progressive</strong> nécessitant une coexistence avec l'existant</li>
                      <li><strong>Risque d'interruption</strong> des services durant la migration</li>
                      <li><strong>Gestion des exceptions</strong> pour les cas particuliers</li>
                    </ul>
                  </div>
                  
                  <div className="bg-red-900/30 p-3 rounded-md">
                    <h4 className="font-medium">Considérations économiques</h4>
                    <ul className="list-disc list-inside text-sm text-red-200 mt-2 space-y-1">
                      <li><strong>Investissements initiaux significatifs</strong> en technologies et compétences</li>
                      <li><strong>Difficulté à quantifier précisément</strong> le retour sur investissement</li>
                      <li><strong>Coûts potentiels de support</strong> et de gestion des incidents accrus</li>
                      <li><strong>Risque de surinvestissement</strong> dans certaines composantes non prioritaires</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card className="bg-blue-900/20 border-blue-800 mt-6">
              <CardHeader>
                <CardTitle>Stratégies pour surmonter les défis</CardTitle>
                <CardDescription className="text-blue-200">
                  Approches pratiques pour faciliter l'adoption du Zero Trust
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-blue-800/30 p-3 rounded-md">
                    <h3 className="font-medium">Planification stratégique</h3>
                    <ul className="list-disc list-inside text-sm text-blue-200 mt-2 space-y-1">
                      <li><strong>Établir une feuille de route réaliste</strong> avec des objectifs intermédiaires clairs</li>
                      <li><strong>Prioriser les ressources critiques</strong> et les risques les plus importants</li>
                      <li><strong>Aligner les initiatives Zero Trust</strong> avec les objectifs métier</li>
                      <li><strong>Prévoir des évaluations régulières</strong> de la progression et des ajustements</li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-800/30 p-3 rounded-md">
                    <h3 className="font-medium">Adoption progressive</h3>
                    <ul className="list-disc list-inside text-sm text-blue-200 mt-2 space-y-1">
                      <li><strong>Commencer par des projets pilotes</strong> sur des périmètres limités</li>
                      <li><strong>Adopter une approche incrémentale</strong> plutôt qu'une transformation totale</li>
                      <li><strong>Mettre en place des mesures de transition</strong> pour les systèmes hérités</li>
                      <li><strong>Documenter et partager les succès</strong> pour favoriser l'adhésion</li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-800/30 p-3 rounded-md">
                    <h3 className="font-medium">Gestion du changement</h3>
                    <ul className="list-disc list-inside text-sm text-blue-200 mt-2 space-y-1">
                      <li><strong>Communiquer clairement</strong> les objectifs et bénéfices attendus</li>
                      <li><strong>Former les équipes IT et les utilisateurs</strong> aux nouvelles pratiques</li>
                      <li><strong>Impliquer les parties prenantes</strong> dès la phase de conception</li>
                      <li><strong>Équilibrer sécurité et expérience utilisateur</strong> pour minimiser les frictions</li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-800/30 p-3 rounded-md">
                    <h3 className="font-medium">Optimisation technique</h3>
                    <ul className="list-disc list-inside text-sm text-blue-200 mt-2 space-y-1">
                      <li><strong>Privilégier l'automatisation</strong> pour réduire la complexité opérationnelle</li>
                      <li><strong>Standardiser les configurations</strong> et les procédures</li>
                      <li><strong>Utiliser des solutions intégrées</strong> quand c'est possible</li>
                      <li><strong>Établir des métriques claires</strong> pour évaluer les performances et la sécurité</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <Card className="bg-blue-900/20 border-blue-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md flex items-center">
                    <CheckCircle2 className="mr-2 h-5 w-5 text-blue-400" />
                    Indicateurs de réussite
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <p className="mb-2">
                    Métriques permettant d'évaluer l'efficacité d'une implémentation Zero Trust :
                  </p>
                  <div className="bg-blue-950/50 p-2 rounded-md text-xs">
                    <ul className="list-disc list-inside space-y-1 text-blue-300 mt-1">
                      <li>Réduction des incidents de sécurité et de leur impact</li>
                      <li>Amélioration de la visibilité sur les accès et les activités</li>
                      <li>Diminution du temps de détection et de réponse aux menaces</li>
                      <li>Taux d'adoption des nouvelles pratiques par les utilisateurs</li>
                      <li>Capacité à gérer l'accès sécurisé indépendamment de la localisation</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-blue-900/20 border-blue-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md flex items-center">
                    <Zap className="mr-2 h-5 w-5 text-blue-400" />
                    Retour sur investissement
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <p className="mb-2">
                    Facteurs à considérer pour évaluer la valeur économique du Zero Trust :
                  </p>
                  <div className="bg-blue-950/50 p-2 rounded-md text-xs">
                    <ul className="list-disc list-inside space-y-1 text-blue-300 mt-1">
                      <li>Coûts évités liés aux violations de données</li>
                      <li>Gains de productivité grâce à des accès plus fluides</li>
                      <li>Réduction des coûts d'infrastructure réseau</li>
                      <li>Économies sur les opérations de sécurité avec l'automatisation</li>
                      <li>Capacité à respecter les exigences réglementaires</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-blue-900/20 border-blue-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md flex items-center">
                    <User className="mr-2 h-5 w-5 text-blue-400" />
                    Impact sur les utilisateurs
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <p className="mb-2">
                    Considérations concernant l'expérience utilisateur dans un environnement Zero Trust :
                  </p>
                  <div className="bg-blue-950/50 p-2 rounded-md text-xs">
                    <ul className="list-disc list-inside space-y-1 text-blue-300 mt-1">
                      <li>Équilibre entre sécurité renforcée et facilité d'utilisation</li>
                      <li>Adaptation des contrôles au contexte pour minimiser les frictions</li>
                      <li>Éducation des utilisateurs sur les raisons des changements</li>
                      <li>Mise en place d'un support efficace pour résoudre les problèmes</li>
                      <li>Recueil régulier des retours pour ajuster l'approche</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="bg-blue-950 border border-blue-800 rounded-lg p-4 mt-4">
              <h3 className="text-lg font-medium mb-2 flex items-center">
                <Globe className="mr-2 h-5 w-5 text-blue-400" />
                Tendances et évolutions futures
              </h3>
              <p className="text-blue-200 mb-3">
                L'approche Zero Trust continue d'évoluer à mesure que les technologies et les menaces progressent :
              </p>
              <div className="space-y-2">
                <div className="bg-blue-900/30 p-2 rounded-md">
                  <h4 className="text-sm font-medium">Intégration de l'IA et du Machine Learning</h4>
                  <p className="text-xs text-blue-300 mt-1">
                    L'intelligence artificielle jouera un rôle croissant dans l'analyse comportementale, l'évaluation des risques en temps réel et l'automatisation des décisions d'accès basées sur des modèles prédictifs.
                  </p>
                </div>
                <div className="bg-blue-900/30 p-2 rounded-md">
                  <h4 className="text-sm font-medium">Authentification sans mot de passe</h4>
                  <p className="text-xs text-blue-300 mt-1">
                    Les technologies d'authentification basées sur la biométrie, les tokens physiques et les méthodes contextuelles remplaceront progressivement les mots de passe traditionnels.
                  </p>
                </div>
                <div className="bg-blue-900/30 p-2 rounded-md">
                  <h4 className="text-sm font-medium">Zero Trust pour les environnements IoT et OT</h4>
                  <p className="text-xs text-blue-300 mt-1">
                    Extension des principes Zero Trust aux objets connectés et aux technologies opérationnelles, avec des adaptations spécifiques pour ces environnements contraints.
                  </p>
                </div>
                <div className="bg-blue-900/30 p-2 rounded-md">
                  <h4 className="text-sm font-medium">Standardisation et interopérabilité</h4>
                  <p className="text-xs text-blue-300 mt-1">
                    Développement de standards ouverts et d'interfaces communes pour faciliter l'intégration entre solutions Zero Trust de différents fournisseurs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
        <div className="flex justify-between mt-8">
          <Button onClick={() => setActiveLesson('technologies')} variant="outline" className="border-blue-700 text-blue-300">
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
          <h2 className="text-2xl font-bold">Quiz : Principes du Zero Trust</h2>
          
          {!quizStarted && !quizCompleted ? (
            <div className="mt-6">
              <Card className="bg-blue-900/20 border-blue-800">
                <CardHeader>
                  <CardTitle>Évaluez vos connaissances</CardTitle>
                  <CardDescription className="text-blue-200">
                    Ce quiz comporte 5 questions pour tester votre compréhension du modèle Zero Trust et de ses implications.
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
                <Button onClick={() => setActiveLesson('avantages')} variant="outline" className="border-blue-700 text-blue-300">
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
                        ? 'Excellent ! Vous avez une bonne compréhension du modèle Zero Trust.' 
                        : score >= 2 
                          ? 'Pas mal ! Vous avez des connaissances de base mais quelques points à approfondir.' 
                          : 'Vous devriez revoir ce module pour mieux comprendre les principes du Zero Trust.'}
                    </h3>
                    <p className={`mt-2 text-sm ${score >= 4 ? 'text-green-200' : score >= 2 ? 'text-amber-200' : 'text-red-200'}`}>
                      {score >= 4 
                        ? 'Vous êtes bien préparé pour participer à l\'élaboration et à la mise en œuvre d\'une stratégie Zero Trust.' 
                        : 'Concentrez-vous particulièrement sur les principes fondamentaux et les différences avec l\'approche traditionnelle.'}
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
          title="Principe du Zero Trust"
          subtitle="Une approche moderne de la sécurité sans confiance implicite"
          icon={<Shield className="h-8 w-8 text-blue-500" />}
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