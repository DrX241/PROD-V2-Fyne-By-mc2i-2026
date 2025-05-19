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
                        Approche qui élimine la confiance implicite et vérifie chaque accès, quelle que soit sa provenance, en s'appuyant sur une vérification continue de l'identité, du contexte et des comportements.
                      </p>
                      <div className="mt-3">
                        <p className="text-xs font-medium">Caractéristiques :</p>
                        <ul className="list-disc list-inside mt-1 space-y-1 text-xs text-blue-300">
                          <li>Aucune confiance par défaut, même pour les utilisateurs internes</li>
                          <li>Vérification de chaque tentative d'accès aux ressources</li>
                          <li>Authentification forte et multi-facteurs obligatoire</li>
                          <li>Contrôles basés sur l'identité, le contexte et le comportement</li>
                          <li>Micro-segmentation et principe du moindre privilège</li>
                        </ul>
                      </div>
                      <div className="mt-3">
                        <p className="text-xs font-medium">Avantages :</p>
                        <ul className="list-disc list-inside mt-1 space-y-1 text-xs text-green-300">
                          <li>Adapté aux environnements hybrides et multi-cloud</li>
                          <li>Protection contre les menaces internes et externes</li>
                          <li>Limitation du mouvement latéral des attaquants</li>
                          <li>Compatibilité avec le travail à distance et les appareils mobiles</li>
                        </ul>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="flex justify-between mt-8">
            <div></div>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                setActiveLesson('principes');
                window.scrollTo(0, 0);
              }}
            >
              Continuer
              <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
            </Button>
          </div>
        </motion.div>
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
          
          <p className="mt-3">
            Le modèle Zero Trust repose sur plusieurs principes fondamentaux qui constituent le socle de cette approche de sécurité. Ces principes directeurs définissent comment la sécurité doit être conçue et implémentée dans une architecture Zero Trust.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <Card className="bg-blue-900/30 border-blue-800">
              <CardHeader className="pb-2">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-800 rounded-full mr-3">
                    <Eye className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">Vérification explicite</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-blue-200">
                  Authentifier et autoriser systématiquement toutes les demandes d'accès, en fonction de tous les points de données disponibles, y compris l'identité de l'utilisateur, l'appareil, la localisation et d'autres attributs.
                </p>
                <p className="text-xs text-blue-300 mt-2">
                  <strong>Application :</strong> Utilisation de l'authentification multifacteur (MFA), vérification de l'état de santé des appareils, et analyse des schémas comportementaux.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-blue-900/30 border-blue-800">
              <CardHeader className="pb-2">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-800 rounded-full mr-3">
                    <Lock className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">Moindre privilège</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-blue-200">
                  Limiter l'accès des utilisateurs au strict nécessaire pour accomplir leurs tâches, en réduisant ainsi la surface d'attaque et les risques de mouvement latéral.
                </p>
                <p className="text-xs text-blue-300 mt-2">
                  <strong>Application :</strong> Contrôle d'accès basé sur les rôles (RBAC), accès juste-à-temps (JIT), élévation de privilèges à la demande.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-blue-900/30 border-blue-800">
              <CardHeader className="pb-2">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-800 rounded-full mr-3">
                    <RefreshCw className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">Vérification continue</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-blue-200">
                  Réévaluer constamment la confiance tout au long de la session d'un utilisateur, plutôt que de l'accorder une seule fois au moment de la connexion.
                </p>
                <p className="text-xs text-blue-300 mt-2">
                  <strong>Application :</strong> Surveillance et analyse en temps réel du comportement des utilisateurs, réévaluation périodique des accès, révocation immédiate en cas d'anomalie.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-blue-900/30 border-blue-800">
              <CardHeader className="pb-2">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-800 rounded-full mr-3">
                    <Layers className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">Micro-segmentation</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-blue-200">
                  Diviser le réseau en zones sécurisées isolées pour limiter la propagation des attaques et protéger les ressources sensibles.
                </p>
                <p className="text-xs text-blue-300 mt-2">
                  <strong>Application :</strong> Segmentation fine du réseau, isolation des charges de travail critiques, application de contrôles au niveau des applications.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-blue-900/30 border-blue-800">
              <CardHeader className="pb-2">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-800 rounded-full mr-3">
                    <Shield className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">Protection de la surface</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-blue-200">
                  Identifier, cartographier et protéger les données sensibles, les actifs, les applications et les services (DAAS) qui constituent la surface d'attaque de l'organisation.
                </p>
                <p className="text-xs text-blue-300 mt-2">
                  <strong>Application :</strong> Inventaire des actifs, classification des données, chiffrement systématique, contrôles d'accès granulaires.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-blue-900/30 border-blue-800">
              <CardHeader className="pb-2">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-800 rounded-full mr-3">
                    <Network className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">Accès basé sur l'identité</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-blue-200">
                  Concentrer les contrôles sur l'identité de l'utilisateur plutôt que sur l'emplacement réseau, permettant une sécurité cohérente quel que soit l'endroit d'où l'utilisateur se connecte.
                </p>
                <p className="text-xs text-blue-300 mt-2">
                  <strong>Application :</strong> Solutions d'identité centralisées, fédération d'identité, gestion des identités privilégiées (PAM).
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-8">
            <h3 className="text-xl font-bold">Comparaison avec d'autres approches de sécurité</h3>
            
            <div className="overflow-x-auto mt-4">
              <Table className="w-full">
                <TableHeader className="bg-blue-900/40">
                  <TableRow>
                    <TableHead className="text-blue-100">Caractéristique</TableHead>
                    <TableHead className="text-blue-100">Sécurité traditionnelle</TableHead>
                    <TableHead className="text-blue-100">Defense in Depth</TableHead>
                    <TableHead className="text-blue-100">Zero Trust</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="border-b border-blue-800">
                    <TableCell className="font-medium">Périmètre de confiance</TableCell>
                    <TableCell className="text-sm">
                      Confiance au réseau interne
                    </TableCell>
                    <TableCell className="text-sm">
                      Multiples périmètres de défense
                    </TableCell>
                    <TableCell className="text-sm">
                      Pas de confiance implicite
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-b border-blue-800">
                    <TableCell className="font-medium">Authentification</TableCell>
                    <TableCell className="text-sm">
                      Souvent unique et simple
                    </TableCell>
                    <TableCell className="text-sm">
                      À plusieurs niveaux
                    </TableCell>
                    <TableCell className="text-sm">
                      Forte, multi-facteurs et continue
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-b border-blue-800">
                    <TableCell className="font-medium">Accès aux ressources</TableCell>
                    <TableCell className="text-sm">
                      Basé sur l'appartenance au réseau
                    </TableCell>
                    <TableCell className="text-sm">
                      Basé sur zones et périmètres
                    </TableCell>
                    <TableCell className="text-sm">
                      Basé sur l'identité et le contexte
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-b border-blue-800">
                    <TableCell className="font-medium">Segmentation</TableCell>
                    <TableCell className="text-sm">
                      Limitée (souvent VLAN)
                    </TableCell>
                    <TableCell className="text-sm">
                      Par zones de sécurité
                    </TableCell>
                    <TableCell className="text-sm">
                      Micro-segmentation fine
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Adéquation au cloud</TableCell>
                    <TableCell className="text-sm">
                      Faible
                    </TableCell>
                    <TableCell className="text-sm">
                      Moyenne
                    </TableCell>
                    <TableCell className="text-sm">
                      Élevée
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
          
          <div className="flex justify-between mt-8">
            <Button 
              variant="outline" 
              className="border-blue-500 text-blue-400"
              onClick={() => {
                setActiveLesson('introduction');
                window.scrollTo(0, 0);
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                setActiveLesson('implementation');
                window.scrollTo(0, 0);
              }}
            >
              Continuer
              <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
            </Button>
          </div>
        </motion.div>
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
          
          <p className="mt-3">
            La transition vers un modèle Zero Trust est un processus progressif qui nécessite une planification rigoureuse et une mise en œuvre par étapes. Voici comment les organisations peuvent aborder cette transformation :
          </p>
          
          <div className="mt-6">
            <h3 className="text-xl font-bold">Étapes de mise en œuvre</h3>
            
            <div className="mt-4 space-y-4">
              <Card className="bg-blue-900/30 border-blue-800">
                <CardHeader>
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center mr-3">
                      <span className="font-bold">1</span>
                    </div>
                    <CardTitle>Évaluation et préparation</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-blue-200">
                    <li className="flex items-start">
                      <span className="mr-2 text-blue-400">•</span>
                      <span><strong>Inventaire des actifs :</strong> Identifier et cartographier toutes les données, applications, services et flux de travail critiques.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-blue-400">•</span>
                      <span><strong>Classification des données :</strong> Catégoriser les données selon leur sensibilité et leur criticité pour l'organisation.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-blue-400">•</span>
                      <span><strong>Analyse des flux :</strong> Documenter les flux de données légitimes entre les différents systèmes et utilisateurs.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-blue-400">•</span>
                      <span><strong>Évaluation de maturité :</strong> Déterminer le niveau actuel de préparation au Zero Trust et identifier les lacunes.</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card className="bg-blue-900/30 border-blue-800">
                <CardHeader>
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center mr-3">
                      <span className="font-bold">2</span>
                    </div>
                    <CardTitle>Définition de l'architecture cible</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-blue-200">
                    <li className="flex items-start">
                      <span className="mr-2 text-blue-400">•</span>
                      <span><strong>Modèle de référence :</strong> Sélectionner un cadre Zero Trust comme le NIST SP 800-207 ou le ZTX de Forrester.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-blue-400">•</span>
                      <span><strong>Architecture technique :</strong> Concevoir l'architecture cible avec les composants adaptés aux besoins de l'organisation.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-blue-400">•</span>
                      <span><strong>Politique de sécurité :</strong> Élaborer les politiques qui définiront les règles d'accès et de vérification.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-blue-400">•</span>
                      <span><strong>Feuille de route :</strong> Établir un plan de mise en œuvre progressif avec des jalons clairs.</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card className="bg-blue-900/30 border-blue-800">
                <CardHeader>
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center mr-3">
                      <span className="font-bold">3</span>
                    </div>
                    <CardTitle>Implémentation progressive</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-blue-200">
                    <li className="flex items-start">
                      <span className="mr-2 text-blue-400">•</span>
                      <span><strong>Définition des pilotes :</strong> Commencer par des segments ou applications spécifiques pour valider l'approche.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-blue-400">•</span>
                      <span><strong>Renforcement de l'identité :</strong> Déployer l'authentification multifacteur et améliorer la gestion des identités.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-blue-400">•</span>
                      <span><strong>Segmentation du réseau :</strong> Mettre en place une micro-segmentation et des contrôles d'accès réseau.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-blue-400">•</span>
                      <span><strong>Sécurisation des données :</strong> Implémenter le chiffrement, les contrôles d'accès aux données et la prévention des pertes de données.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-blue-400">•</span>
                      <span><strong>Surveillance et analyse :</strong> Déployer des outils de détection et de réponse avancés.</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card className="bg-blue-900/30 border-blue-800">
                <CardHeader>
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center mr-3">
                      <span className="font-bold">4</span>
                    </div>
                    <CardTitle>Optimisation et expansion</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-blue-200">
                    <li className="flex items-start">
                      <span className="mr-2 text-blue-400">•</span>
                      <span><strong>Évaluation des pilotes :</strong> Mesurer l'efficacité des premières implémentations et ajuster si nécessaire.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-blue-400">•</span>
                      <span><strong>Extension :</strong> Déployer progressivement le modèle Zero Trust à l'ensemble de l'organisation.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-blue-400">•</span>
                      <span><strong>Automatisation :</strong> Intégrer l'automatisation et l'intelligence artificielle pour améliorer la réponse et la prise de décision.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-blue-400">•</span>
                      <span><strong>Amélioration continue :</strong> Réviser régulièrement la stratégie Zero Trust en fonction des nouvelles menaces et technologies.</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="mt-8">
            <h3 className="text-xl font-bold">Cadres de référence Zero Trust</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Card className="bg-blue-900/30 border-blue-800">
                <CardHeader>
                  <div className="flex items-center">
                    <CardTitle className="text-lg">NIST SP 800-207</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-blue-200">
                  <p>
                    Cadre développé par le National Institute of Standards and Technology (NIST) américain, qui définit une architecture de référence Zero Trust et des directives de mise en œuvre pour les organisations gouvernementales et privées.
                  </p>
                  <div className="mt-3">
                    <p className="text-xs text-blue-300">
                      <strong>Composants clés :</strong>
                    </p>
                    <ul className="list-disc list-inside text-xs text-blue-300 mt-1">
                      <li>Plan de contrôle de politique (PEP)</li>
                      <li>Moteur de politique (PE)</li>
                      <li>Administrateur de politique (PA)</li>
                      <li>Sources de données continues pour les décisions d'accès</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-blue-900/30 border-blue-800">
                <CardHeader>
                  <div className="flex items-center">
                    <CardTitle className="text-lg">Forrester ZTX</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-blue-200">
                  <p>
                    Zero Trust eXtended (ZTX) est un cadre proposé par Forrester Research, qui étend le concept initial du Zero Trust à l'ensemble de l'écosystème d'entreprise.
                  </p>
                  <div className="mt-3">
                    <p className="text-xs text-blue-300">
                      <strong>Les 7 piliers :</strong>
                    </p>
                    <ul className="list-disc list-inside text-xs text-blue-300 mt-1">
                      <li>Données</li>
                      <li>Réseau</li>
                      <li>Charge de travail</li>
                      <li>Personnes</li>
                      <li>Appareils</li>
                      <li>Visibilité et analytique</li>
                      <li>Automatisation et orchestration</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-blue-900/30 border-blue-800">
                <CardHeader>
                  <div className="flex items-center">
                    <CardTitle className="text-lg">Microsoft Zero Trust</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-blue-200">
                  <p>
                    Cadre développé par Microsoft qui s'articule autour de six piliers fondamentaux, avec un focus particulier sur l'intégration des services cloud et des solutions Microsoft.
                  </p>
                  <div className="mt-3">
                    <p className="text-xs text-blue-300">
                      <strong>Les 6 piliers :</strong>
                    </p>
                    <ul className="list-disc list-inside text-xs text-blue-300 mt-1">
                      <li>Identités</li>
                      <li>Appareils</li>
                      <li>Applications</li>
                      <li>Données</li>
                      <li>Infrastructure</li>
                      <li>Réseaux</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-blue-900/30 border-blue-800">
                <CardHeader>
                  <div className="flex items-center">
                    <CardTitle className="text-lg">Gartner CARTA</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-blue-200">
                  <p>
                    Continuous Adaptive Risk and Trust Assessment (CARTA) est l'approche de Gartner qui met l'accent sur l'évaluation continue et adaptive des risques et de la confiance.
                  </p>
                  <div className="mt-3">
                    <p className="text-xs text-blue-300">
                      <strong>Principes clés :</strong>
                    </p>
                    <ul className="list-disc list-inside text-xs text-blue-300 mt-1">
                      <li>Évaluation continue</li>
                      <li>Adaptabilité aux menaces émergentes</li>
                      <li>Contextualisation des décisions de sécurité</li>
                      <li>Automatisation des réponses</li>
                      <li>Intégration de l'intelligence artificielle</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="flex justify-between mt-8">
            <Button 
              variant="outline" 
              className="border-blue-500 text-blue-400"
              onClick={() => {
                setActiveLesson('principes');
                window.scrollTo(0, 0);
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                setActiveLesson('technologies');
                window.scrollTo(0, 0);
              }}
            >
              Continuer
              <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
            </Button>
          </div>
        </motion.div>
      </div>
    ),
    
    technologies: (
      <div className="space-y-6">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={contentVariants}
        >
          <h2 className="text-2xl font-bold">Technologies clés pour le Zero Trust</h2>
          
          <p className="mt-3">
            La mise en œuvre d'une architecture Zero Trust repose sur un ensemble de technologies complémentaires qui permettent d'appliquer les principes fondamentaux. Voici les principales technologies qui constituent l'écosystème Zero Trust :
          </p>
          
          <div className="mt-6 space-y-6">
            <div>
              <h3 className="text-xl font-bold flex items-center">
                <User className="mr-2 h-5 w-5 text-blue-400" />
                Gestion des identités et des accès
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <Card className="bg-blue-900/30 border-blue-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Authentification multifacteur (MFA)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-blue-200">
                      Technologie qui renforce la vérification d'identité en exigeant plusieurs formes d'authentification :
                    </p>
                    <ul className="list-disc list-inside mt-2 text-xs text-blue-300">
                      <li>Quelque chose que l'utilisateur sait (mot de passe)</li>
                      <li>Quelque chose que l'utilisateur possède (smartphone, token)</li>
                      <li>Quelque chose que l'utilisateur est (biométrie)</li>
                    </ul>
                    <p className="text-xs text-blue-300 mt-2">
                      <strong>Exemples :</strong> Microsoft Authenticator, Duo Security, Okta Verify, YubiKey
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="bg-blue-900/30 border-blue-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Gestion des identités (IAM)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-blue-200">
                      Solutions qui centralisent la gestion des utilisateurs, de leurs identités et de leurs droits d'accès à travers l'ensemble des systèmes.
                    </p>
                    <ul className="list-disc list-inside mt-2 text-xs text-blue-300">
                      <li>Single Sign-On (SSO)</li>
                      <li>Fédération d'identité</li>
                      <li>Gestion du cycle de vie des identités</li>
                    </ul>
                    <p className="text-xs text-blue-300 mt-2">
                      <strong>Exemples :</strong> Azure AD, Okta, Ping Identity, ForgeRock
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="bg-blue-900/30 border-blue-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Contrôle d'accès basé sur les rôles (RBAC)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-blue-200">
                      Méthode de régulation des accès aux ressources en fonction du rôle de l'utilisateur au sein de l'organisation.
                    </p>
                    <p className="text-xs text-blue-300 mt-2">
                      <strong>Caractéristiques :</strong> Attribution des privilèges par rôle, gestion centralisée des droits, principe du moindre privilège
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="bg-blue-900/30 border-blue-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Contrôle d'accès basé sur les attributs (ABAC)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-blue-200">
                      Méthode avancée qui évalue plusieurs attributs (utilisateur, ressource, environnement) pour déterminer l'autorisation d'accès.
                    </p>
                    <p className="text-xs text-blue-300 mt-2">
                      <strong>Avantages :</strong> Granularité fine, prise en compte du contexte, adaptabilité aux environnements complexes
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold flex items-center">
                <Network className="mr-2 h-5 w-5 text-blue-400" />
                Sécurité réseau et accès
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <Card className="bg-blue-900/30 border-blue-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Accès réseau Zero Trust (ZTNA)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-blue-200">
                      Technologie qui fournit un accès sécurisé aux applications en fonction de l'identité et du contexte, sans exposer les applications sur Internet.
                    </p>
                    <p className="text-xs text-blue-300 mt-2">
                      <strong>Avantages :</strong> Applications invisibles pour les utilisateurs non autorisés, accès précis aux applications (non au réseau), connexions contextuelles
                    </p>
                    <p className="text-xs text-blue-300 mt-2">
                      <strong>Exemples :</strong> Zscaler Private Access, Palo Alto Prisma Access, Akamai Enterprise Application Access
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="bg-blue-900/30 border-blue-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Micro-segmentation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-blue-200">
                      Approche qui divise le réseau en segments isolés sécurisés jusqu'au niveau de la charge de travail individuelle.
                    </p>
                    <p className="text-xs text-blue-300 mt-2">
                      <strong>Caractéristiques :</strong> Segmentation fine, politiques par charge de travail, isolation des applications critiques
                    </p>
                    <p className="text-xs text-blue-300 mt-2">
                      <strong>Exemples :</strong> VMware NSX, Cisco Tetration, Illumio Core, Guardicore Centra
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="bg-blue-900/30 border-blue-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Secure Access Service Edge (SASE)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-blue-200">
                      Architecture qui combine les fonctions de réseau et de sécurité en un service cloud intégré, adapté aux organisations distribuées.
                    </p>
                    <p className="text-xs text-blue-300 mt-2">
                      <strong>Composants :</strong> SD-WAN, Secure Web Gateway (SWG), CASB, ZTNA, FWaaS
                    </p>
                    <p className="text-xs text-blue-300 mt-2">
                      <strong>Exemples :</strong> Cato Networks, Cisco SASE, Palo Alto Prisma SASE, Fortinet Secure SASE
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="bg-blue-900/30 border-blue-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Software-Defined Perimeter (SDP)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-blue-200">
                      Approche qui crée une limite réseau définie par logiciel autour de services spécifiques, rendant ces services "noirs" (invisibles) pour les utilisateurs non autorisés.
                    </p>
                    <p className="text-xs text-blue-300 mt-2">
                      <strong>Avantages :</strong> Infrastructure cachée, authentification mutuelle, autorisation préalable à la connexion
                    </p>
                    <p className="text-xs text-blue-300 mt-2">
                      <strong>Exemples :</strong> Perimeter 81, AppGate SDP, Pulse Secure SDP
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold flex items-center">
                <Smartphone className="mr-2 h-5 w-5 text-blue-400" />
                Gestion et sécurité des terminaux
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <Card className="bg-blue-900/30 border-blue-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Gestion unifiée des terminaux (UEM)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-blue-200">
                      Solutions qui permettent la gestion centralisée de tous les types d'appareils (ordinateurs, smartphones, tablettes, IoT) utilisés dans l'entreprise.
                    </p>
                    <p className="text-xs text-blue-300 mt-2">
                      <strong>Fonctionnalités :</strong> Inventaire des appareils, application des politiques de sécurité, déploiement d'applications, contrôle à distance
                    </p>
                    <p className="text-xs text-blue-300 mt-2">
                      <strong>Exemples :</strong> Microsoft Intune, VMware Workspace ONE, MobileIron, IBM MaaS360
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="bg-blue-900/30 border-blue-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Évaluation de posture de sécurité des terminaux</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-blue-200">
                      Technologie qui vérifie l'état de sécurité d'un appareil avant de lui accorder l'accès aux ressources de l'entreprise.
                    </p>
                    <p className="text-xs text-blue-300 mt-2">
                      <strong>Vérifications :</strong> Système d'exploitation à jour, antivirus actif, chiffrement activé, conformité aux politiques, absence de jailbreak/root
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold flex items-center">
                <Database className="mr-2 h-5 w-5 text-blue-400" />
                Protection des données
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <Card className="bg-blue-900/30 border-blue-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Chiffrement des données</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-blue-200">
                      Technologies qui protègent les données en les rendant illisibles sans clé de déchiffrement appropriée.
                    </p>
                    <p className="text-xs text-blue-300 mt-2">
                      <strong>Types :</strong>
                    </p>
                    <ul className="list-disc list-inside text-xs text-blue-300 mt-1">
                      <li>Chiffrement au repos (stockage)</li>
                      <li>Chiffrement en transit (communication)</li>
                      <li>Chiffrement au niveau application</li>
                      <li>Gestion des clés de chiffrement</li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card className="bg-blue-900/30 border-blue-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Prévention des pertes de données (DLP)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-blue-200">
                      Solutions qui détectent et préviennent la fuite de données sensibles en dehors de l'organisation.
                    </p>
                    <p className="text-xs text-blue-300 mt-2">
                      <strong>Fonctionnalités :</strong> Classification de données, analyse de contenu, application de politiques, journalisation des incidents
                    </p>
                    <p className="text-xs text-blue-300 mt-2">
                      <strong>Exemples :</strong> Forcepoint DLP, Symantec DLP, Digital Guardian, Microsoft Purview
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="bg-blue-900/30 border-blue-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Cloud Access Security Broker (CASB)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-blue-200">
                      Solutions qui agissent comme intermédiaires entre les utilisateurs et les applications cloud pour appliquer les politiques de sécurité.
                    </p>
                    <p className="text-xs text-blue-300 mt-2">
                      <strong>Fonctionnalités :</strong> Visibilité des applications cloud, protection contre les menaces, conformité, protection des données
                    </p>
                    <p className="text-xs text-blue-300 mt-2">
                      <strong>Exemples :</strong> Microsoft Defender for Cloud Apps, Netskope, McAfee MVISION, Zscaler CASB
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold flex items-center">
                <Eye className="mr-2 h-5 w-5 text-blue-400" />
                Visibilité et analytique
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <Card className="bg-blue-900/30 border-blue-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Security Information and Event Management (SIEM)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-blue-200">
                      Plateformes qui collectent, agrègent et analysent les données de sécurité pour détecter les menaces et faciliter la réponse aux incidents.
                    </p>
                    <p className="text-xs text-blue-300 mt-2">
                      <strong>Capacités :</strong> Collecte de logs, corrélation d'événements, détection d'anomalies, tableau de bord de sécurité
                    </p>
                    <p className="text-xs text-blue-300 mt-2">
                      <strong>Exemples :</strong> Splunk, IBM QRadar, Microsoft Sentinel, Elastic Security
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="bg-blue-900/30 border-blue-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Détection et réponse des terminaux (EDR)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-blue-200">
                      Solutions qui surveillent en continu les activités des terminaux pour détecter et répondre aux menaces avancées.
                    </p>
                    <p className="text-xs text-blue-300 mt-2">
                      <strong>Fonctionnalités :</strong> Surveillance comportementale, analyse de la chaîne d'attaque, isolation des terminaux, investigation et remédiation
                    </p>
                    <p className="text-xs text-blue-300 mt-2">
                      <strong>Exemples :</strong> CrowdStrike Falcon, SentinelOne, Microsoft Defender for Endpoint, Palo Alto Cortex XDR
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="bg-blue-900/30 border-blue-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Détection et réponse étendues (XDR)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-blue-200">
                      Extension de l'EDR qui intègre des données provenant de multiples vecteurs (terminaux, réseau, cloud, email) pour une détection plus complète.
                    </p>
                    <p className="text-xs text-blue-300 mt-2">
                      <strong>Avantages :</strong> Vision unifiée des menaces, corrélation avancée, réduction des faux positifs, réponse coordonnée
                    </p>
                    <p className="text-xs text-blue-300 mt-2">
                      <strong>Exemples :</strong> Trend Micro XDR, Palo Alto Cortex XDR, Microsoft 365 Defender
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="bg-blue-900/30 border-blue-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Analyse comportementale (UEBA)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-blue-200">
                      Technologies qui utilisent l'intelligence artificielle pour détecter les comportements anormaux des utilisateurs et des entités qui pourraient indiquer une menace.
                    </p>
                    <p className="text-xs text-blue-300 mt-2">
                      <strong>Applications :</strong> Détection d'utilisations abusives de privilèges, mouvements latéraux, exfiltration de données, comptes compromis
                    </p>
                    <p className="text-xs text-blue-300 mt-2">
                      <strong>Exemples :</strong> Exabeam, Securonix, Gurucul, Microsoft Defender for Identity
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between mt-8">
            <Button 
              variant="outline" 
              className="border-blue-500 text-blue-400"
              onClick={() => {
                setActiveLesson('implementation');
                window.scrollTo(0, 0);
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                setActiveLesson('avantages');
                window.scrollTo(0, 0);
              }}
            >
              Continuer
              <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
            </Button>
          </div>
        </motion.div>
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
          
          <p className="mt-3">
            L'adoption d'un modèle Zero Trust offre de nombreux avantages pour la sécurité des organisations, mais présente également des défis importants à surmonter. Cette section examine les bénéfices et les obstacles liés à cette approche.
          </p>
          
          <div className="mt-6">
            <h3 className="text-xl font-bold">Avantages du Zero Trust</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <Card className="bg-blue-900/30 border-blue-800">
                <CardHeader className="pb-2">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-800/50 rounded-full mr-3">
                      <Shield className="h-5 w-5 text-green-400" />
                    </div>
                    <CardTitle>Sécurité renforcée</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-blue-200">
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                      <span>Réduction de la surface d'attaque</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                      <span>Limitation du mouvement latéral des attaquants</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                      <span>Protection contre les menaces internes et externes</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                      <span>Détection plus rapide des compromissions</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card className="bg-blue-900/30 border-blue-800">
                <CardHeader className="pb-2">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-800/50 rounded-full mr-3">
                      <Globe className="h-5 w-5 text-blue-400" />
                    </div>
                    <CardTitle>Flexibilité et agilité</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-blue-200">
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                      <span>Support du travail à distance et hybride</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                      <span>Compatibilité avec les environnements multi-cloud</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                      <span>Adaptation aux modèles BYOD (Bring Your Own Device)</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                      <span>Indépendance de l'emplacement réseau</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card className="bg-blue-900/30 border-blue-800">
                <CardHeader className="pb-2">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-800/50 rounded-full mr-3">
                      <Server className="h-5 w-5 text-purple-400" />
                    </div>
                    <CardTitle>Efficacité opérationnelle</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-blue-200">
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                      <span>Visibilité accrue sur l'environnement IT</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                      <span>Simplification des architectures réseau</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                      <span>Automatisation des processus de sécurité</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                      <span>Réduction des coûts d'infrastructure à long terme</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card className="bg-blue-900/30 border-blue-800">
                <CardHeader className="pb-2">
                  <div className="flex items-center">
                    <div className="p-2 bg-amber-800/50 rounded-full mr-3">
                      <FileWarning className="h-5 w-5 text-amber-400" />
                    </div>
                    <CardTitle>Conformité réglementaire</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-blue-200">
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                      <span>Alignement avec les exigences de GDPR, HIPAA, PCI DSS</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                      <span>Meilleure protection des données sensibles</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                      <span>Journalisation étendue pour les audits</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                      <span>Gestion granulaire des accès aux données</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card className="bg-blue-900/30 border-blue-800">
                <CardHeader className="pb-2">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-800/50 rounded-full mr-3">
                      <Key className="h-5 w-5 text-blue-400" />
                    </div>
                    <CardTitle>Réduction des risques</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-blue-200">
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                      <span>Minimisation de l'impact des violations</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                      <span>Détection précoce des comportements suspects</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                      <span>Protection contre les attaques de la chaîne d'approvisionnement</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                      <span>Réponse plus rapide aux incidents</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card className="bg-blue-900/30 border-blue-800">
                <CardHeader className="pb-2">
                  <div className="flex items-center">
                    <div className="p-2 bg-emerald-800/50 rounded-full mr-3">
                      <Users className="h-5 w-5 text-emerald-400" />
                    </div>
                    <CardTitle>Expérience utilisateur</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-blue-200">
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                      <span>Accès cohérent aux ressources, quel que soit l'emplacement</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                      <span>Réduction de la dépendance aux VPN traditionnels</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                      <span>Processus d'authentification rationalisés via SSO</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                      <span>Fluidité des accès entre applications et services</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="mt-10">
            <h3 className="text-xl font-bold">Défis et considérations</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <Card className="bg-blue-900/30 border-blue-800">
                <CardHeader>
                  <div className="flex items-center">
                    <div className="p-2 bg-red-900/30 rounded-full mr-3">
                      <AlertTriangle className="h-5 w-5 text-red-400" />
                    </div>
                    <CardTitle>Défis d'implémentation</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm text-blue-200">
                    <li className="flex items-start">
                      <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 text-amber-500" />
                      <div>
                        <span className="font-medium">Complexité technique</span>
                        <p className="text-xs mt-0.5 text-blue-300">L'intégration de multiples technologies et contrôles peut créer une architecture complexe qui nécessite une expertise spécialisée.</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 text-amber-500" />
                      <div>
                        <span className="font-medium">Coût initial élevé</span>
                        <p className="text-xs mt-0.5 text-blue-300">Les investissements initiaux en technologies, formation et ressources peuvent être significatifs avant de réaliser des économies à long terme.</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 text-amber-500" />
                      <div>
                        <span className="font-medium">Systèmes hérités</span>
                        <p className="text-xs mt-0.5 text-blue-300">Les applications et systèmes legacy peuvent ne pas être compatibles avec les principes Zero Trust sans modifications importantes.</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 text-amber-500" />
                      <div>
                        <span className="font-medium">Interopérabilité</span>
                        <p className="text-xs mt-0.5 text-blue-300">Assurer l'intégration et la communication harmonieuse entre les différentes solutions de sécurité peut être un défi technique.</p>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card className="bg-blue-900/30 border-blue-800">
                <CardHeader>
                  <div className="flex items-center">
                    <div className="p-2 bg-red-900/30 rounded-full mr-3">
                      <Users className="h-5 w-5 text-red-400" />
                    </div>
                    <CardTitle>Défis organisationnels</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm text-blue-200">
                    <li className="flex items-start">
                      <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 text-amber-500" />
                      <div>
                        <span className="font-medium">Résistance au changement</span>
                        <p className="text-xs mt-0.5 text-blue-300">Les utilisateurs et le personnel IT peuvent résister aux nouvelles procédures de sécurité plus strictes et aux contrôles continus.</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 text-amber-500" />
                      <div>
                        <span className="font-medium">Compétences et formation</span>
                        <p className="text-xs mt-0.5 text-blue-300">Le manque de personnel qualifié en Zero Trust et la nécessité de formation continue peuvent ralentir l'adoption.</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 text-amber-500" />
                      <div>
                        <span className="font-medium">Soutien de la direction</span>
                        <p className="text-xs mt-0.5 text-blue-300">Obtenir et maintenir l'engagement des dirigeants est crucial pour le succès à long terme d'une initiative Zero Trust.</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 text-amber-500" />
                      <div>
                        <span className="font-medium">Équilibre sécurité-productivité</span>
                        <p className="text-xs mt-0.5 text-blue-300">Trouver le juste équilibre entre sécurité renforcée et facilité d'utilisation pour les employés est un défi permanent.</p>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card className="bg-blue-900/30 border-blue-800">
                <CardHeader>
                  <div className="flex items-center">
                    <div className="p-2 bg-red-900/30 rounded-full mr-3">
                      <Globe className="h-5 w-5 text-red-400" />
                    </div>
                    <CardTitle>Considérations stratégiques</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm text-blue-200">
                    <li className="flex items-start">
                      <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 text-amber-500" />
                      <div>
                        <span className="font-medium">Approche progressive</span>
                        <p className="text-xs mt-0.5 text-blue-300">Une transformation complète vers Zero Trust doit être planifiée par étapes pour minimiser les perturbations et gérer les risques.</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 text-amber-500" />
                      <div>
                        <span className="font-medium">Mesure du ROI</span>
                        <p className="text-xs mt-0.5 text-blue-300">Quantifier et démontrer le retour sur investissement de la sécurité Zero Trust peut être difficile mais est nécessaire pour justifier les dépenses.</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 text-amber-500" />
                      <div>
                        <span className="font-medium">Évolution continue</span>
                        <p className="text-xs mt-0.5 text-blue-300">Zero Trust n'est pas une destination mais un parcours qui nécessite une adaptation constante aux nouvelles menaces et technologies.</p>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card className="bg-blue-900/30 border-blue-800">
                <CardHeader>
                  <div className="flex items-center">
                    <div className="p-2 bg-red-900/30 rounded-full mr-3">
                      <Clock className="h-5 w-5 text-red-400" />
                    </div>
                    <CardTitle>Considérations opérationnelles</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm text-blue-200">
                    <li className="flex items-start">
                      <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 text-amber-500" />
                      <div>
                        <span className="font-medium">Performance</span>
                        <p className="text-xs mt-0.5 text-blue-300">Les vérifications de sécurité multiples peuvent introduire une latence qui impacte l'expérience utilisateur si elles ne sont pas correctement optimisées.</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 text-amber-500" />
                      <div>
                        <span className="font-medium">Faux positifs</span>
                        <p className="text-xs mt-0.5 text-blue-300">Les systèmes de détection trop sensibles peuvent générer des alertes non pertinentes qui créent une "fatigue d'alerte" pour les équipes de sécurité.</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 text-amber-500" />
                      <div>
                        <span className="font-medium">Continuité des activités</span>
                        <p className="text-xs mt-0.5 text-blue-300">Assurer l'accès aux ressources critiques en cas de défaillance des systèmes de vérification est un aspect important à considérer.</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 text-amber-500" />
                      <div>
                        <span className="font-medium">Surcharge cognitive</span>
                        <p className="text-xs mt-0.5 text-blue-300">La multiplication des contrôles de sécurité peut créer une surcharge pour les utilisateurs et les administrateurs sans une conception soignée.</p>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="mt-10">
            <h3 className="text-xl font-bold">Recommandations pour réussir l'adoption</h3>
            
            <div className="space-y-4 mt-4">
              <Card className="bg-blue-900/30 border-blue-800">
                <CardContent className="pt-6">
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-green-700 flex items-center justify-center mr-4 mt-0.5">
                      <span className="font-bold">1</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-lg">Adopter une approche itérative</h4>
                      <p className="text-sm text-blue-200 mt-1">
                        Commencez par des projets pilotes sur des segments spécifiques de votre infrastructure. Validez les concepts, récoltez des retours d'expérience et ajustez votre approche avant d'étendre le déploiement.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-blue-900/30 border-blue-800">
                <CardContent className="pt-6">
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-green-700 flex items-center justify-center mr-4 mt-0.5">
                      <span className="font-bold">2</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-lg">Impliquer toutes les parties prenantes</h4>
                      <p className="text-sm text-blue-200 mt-1">
                        Engagez les utilisateurs, les équipes IT, la direction et les responsables métier dès le début. La compréhension et l'adhésion de toutes les parties est cruciale pour le succès de la transformation.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-blue-900/30 border-blue-800">
                <CardContent className="pt-6">
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-green-700 flex items-center justify-center mr-4 mt-0.5">
                      <span className="font-bold">3</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-lg">Investir dans la formation</h4>
                      <p className="text-sm text-blue-200 mt-1">
                        Formez vos équipes techniques aux principes et technologies Zero Trust, et sensibilisez tous les employés aux nouvelles pratiques de sécurité et à leur importance.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-blue-900/30 border-blue-800">
                <CardContent className="pt-6">
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-green-700 flex items-center justify-center mr-4 mt-0.5">
                      <span className="font-bold">4</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-lg">Mesurer et communiquer les résultats</h4>
                      <p className="text-sm text-blue-200 mt-1">
                        Définissez des métriques claires pour évaluer l'efficacité de votre approche Zero Trust et partagez régulièrement les succès et les leçons apprises avec l'organisation.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-blue-900/30 border-blue-800">
                <CardContent className="pt-6">
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-green-700 flex items-center justify-center mr-4 mt-0.5">
                      <span className="font-bold">5</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-lg">Prioriser l'expérience utilisateur</h4>
                      <p className="text-sm text-blue-200 mt-1">
                        Concevez vos contrôles de sécurité en pensant à l'expérience utilisateur. Une sécurité transparente et non intrusive favorisera l'adoption et réduira les contournements.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="flex justify-between mt-8">
            <Button 
              variant="outline" 
              className="border-blue-500 text-blue-400"
              onClick={() => {
                setActiveLesson('technologies');
                window.scrollTo(0, 0);
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                setActiveLesson('quiz');
                setQuizStarted(false);
                window.scrollTo(0, 0);
              }}
            >
              Quiz d'évaluation
              <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
            </Button>
          </div>
        </motion.div>
      </div>
    ),

    quiz: (
      <div className="space-y-6">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={contentVariants}
        >
          <h2 className="text-2xl font-bold">Quiz d'évaluation</h2>
          
          {!quizStarted && !quizCompleted ? (
            <div className="mt-6">
              <Card className="bg-blue-900/30 border-blue-800">
                <CardContent className="pt-6">
                  <div className="text-center p-6">
                    <div className="w-16 h-16 bg-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <PlayCircle className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Prêt à tester vos connaissances ?</h3>
                    <p className="text-blue-200 mb-6 max-w-lg mx-auto">
                      Ce quiz comporte 5 questions à choix multiples pour évaluer votre compréhension des principes du Zero Trust. 
                      Complétez-le avec succès pour valider ce module.
                    </p>
                    <Button 
                      size="lg" 
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => {
                        setQuizStarted(true);
                        setCurrentQuestion(0);
                        setScore(0);
                      }}
                    >
                      Commencer le quiz
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : quizCompleted ? (
            <div className="mt-6">
              <Card className="bg-blue-900/30 border-blue-800">
                <CardContent className="pt-6">
                  <div className="text-center p-6">
                    <div className={`w-20 h-20 ${score >= 4 ? 'bg-green-700' : 'bg-amber-600'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                      {score >= 4 ? (
                        <CheckCircle2 className="h-10 w-10 text-white" />
                      ) : (
                        <AlertTriangle className="h-10 w-10 text-white" />
                      )}
                    </div>
                    <h3 className="text-xl font-bold mb-2">
                      {score >= 4 ? 'Félicitations !' : 'Quiz terminé'}
                    </h3>
                    <p className="text-2xl font-bold mb-2 text-blue-100">
                      Votre score : {score}/{questions.length}
                    </p>
                    <p className="text-blue-200 mb-6 max-w-lg mx-auto">
                      {score >= 4 
                        ? 'Vous avez démontré une excellente compréhension des principes du Zero Trust. Vous pouvez continuer votre parcours de formation.'
                        : 'Vous pourriez bénéficier d\'une révision des concepts du Zero Trust. N\'hésitez pas à revoir le module avant de réessayer le quiz.'}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button 
                        variant="outline" 
                        className="border-blue-500 text-blue-400"
                        onClick={() => {
                          setQuizStarted(false);
                          setQuizCompleted(false);
                        }}
                      >
                        Refaire le quiz
                      </Button>
                      <Button 
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => {
                          setActiveLesson('introduction');
                          window.scrollTo(0, 0);
                        }}
                      >
                        Revenir au début du module
                      </Button>
                      <Link href="/cyber/learning-center">
                        <Button className="bg-green-600 hover:bg-green-700">
                          Retour au centre de formation
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="mt-6">
              <Card className="bg-blue-900/30 border-blue-800">
                <CardContent className="pt-6">
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <Badge className="bg-blue-700">Question {currentQuestion + 1}/{questions.length}</Badge>
                      <Progress value={(currentQuestion / questions.length) * 100} className="w-1/3 h-2 bg-blue-900/40" indicatorClassName="bg-blue-500" />
                    </div>
                    
                    <h3 className="text-xl font-medium mb-6">{questions[currentQuestion].question}</h3>
                    
                    <div className="space-y-3">
                      {questions[currentQuestion].options.map((option, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className="w-full justify-start text-left p-4 h-auto border-blue-700 hover:bg-blue-800/50 hover:border-blue-500"
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
                          <div className="w-6 h-6 rounded-full border border-blue-400 flex items-center justify-center mr-3">
                            {String.fromCharCode(65 + index)}
                          </div>
                          {option}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {!quizStarted && !quizCompleted && (
            <div className="flex justify-between mt-8">
              <Button 
                variant="outline" 
                className="border-blue-500 text-blue-400"
                onClick={() => {
                  setActiveLesson('avantages');
                  window.scrollTo(0, 0);
                }}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              <Link href="/cyber/learning-center">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Retour au centre de formation
                </Button>
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    )
  };
  
  // Mise à jour de la progression lorsqu'une leçon est complétée
  React.useEffect(() => {
    const lessonIndex = lessons.findIndex(lesson => lesson.id === activeLesson);
    if (lessonIndex > 0) {
      const newProgress = Math.round((lessonIndex / (lessons.length - 1)) * 100);
      setProgress(newProgress);
    }
  }, [activeLesson]);
  
  return (
    <div className="min-h-screen bg-[#0a1429]">
      <PageTitle title="Principe du Zero Trust | Module d'apprentissage" />
      
      {/* En-tête */}
      <header className="border-b border-blue-800/60">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/cyber/learning-center">
            <Button variant="ghost" className="text-blue-300 hover:bg-blue-900/30 hover:text-blue-200">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au centre de formation
            </Button>
          </Link>
          <h1 className="text-xl text-white font-medium">Module : Principe du Zero Trust</h1>
        </div>
      </header>
      
      {/* Contenu principal */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Barre latérale */}
          <div className="md:w-1/4">
            <div className="bg-blue-950/60 border border-blue-800/60 rounded-lg p-4 sticky top-4">
              <h2 className="text-white font-medium mb-4">Navigation du module</h2>
              
              <div className="space-y-2">
                {lessons.map((lesson) => (
                  <button
                    key={lesson.id}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors text-sm flex items-center ${
                      activeLesson === lesson.id
                        ? 'bg-blue-700 text-white'
                        : 'text-blue-300 hover:bg-blue-900/40 hover:text-blue-100'
                    }`}
                    onClick={() => {
                      setActiveLesson(lesson.id);
                      window.scrollTo(0, 0);
                    }}
                  >
                    {lesson.title}
                  </button>
                ))}
              </div>
              
              <div className="mt-6">
                <div className="flex justify-between text-xs text-blue-400 mb-1">
                  <span>Progression du module</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2 bg-blue-900/40" indicatorClassName="bg-blue-500" />
              </div>
              
              <div className="mt-6 pt-4 border-t border-blue-800/60">
                <div className="flex items-center text-sm text-blue-300">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>Durée estimée : 45-60 min</span>
                </div>
                <div className="flex items-center text-sm text-blue-300 mt-2">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  <span>Niveau : Intermédiaire</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Contenu de la leçon */}
          <div className="md:w-3/4">
            <div className="bg-blue-950/60 border border-blue-800/60 rounded-lg p-6">
              {lessonContent[activeLesson]}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}