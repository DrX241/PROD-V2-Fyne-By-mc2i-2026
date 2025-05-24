import React, { useState } from 'react';
import { Link } from 'wouter';
import {
  ArrowLeft,
  Cloud,
  ShieldCheck,
  Lock,
  Database,
  Server,
  Users,
  Network,
  AlertTriangle,
  CheckCircle2,
  PlayCircle,
  Lightbulb,
  Zap,
  Eye,
  Cpu,
  FileText,
  GraduationCap,
  Key,
  ShieldAlert,
  FileWarning,
  LayoutGrid,
  HardDrive,
  RefreshCw,
  Shield,
  Clock,
  Globe,
  Share2 as NetworkChart,
  CloudRain,
  CloudCog,
  CloudOff,
  Layers
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

export default function SecuriteCloudModule() {
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
    { id: 'introduction', title: 'Introduction à la sécurité cloud', progress: 0 },
    { id: 'modeles', title: 'Modèles cloud et responsabilités', progress: 0 },
    { id: 'risques', title: 'Risques et menaces spécifiques', progress: 0 },
    { id: 'protection', title: 'Protection des données et applications', progress: 0 },
    { id: 'bonnes-pratiques', title: 'Bonnes pratiques et conformité', progress: 0 },
    { id: 'quiz', title: 'Quiz de validation', progress: 0 },
  ];

  // Questions du quiz
  const questions = [
    {
      question: "Dans le modèle de responsabilité partagée du cloud, quelle affirmation est correcte ?",
      options: [
        "Le fournisseur cloud est responsable de toute la sécurité",
        "Le client est responsable de toute la sécurité",
        "La responsabilité varie selon le modèle de service (IaaS, PaaS, SaaS)",
        "La responsabilité est définie par l'emplacement géographique des données"
      ],
      correctAnswer: 2
    },
    {
      question: "Quelle mesure n'est PAS typiquement utilisée pour sécuriser les données au repos dans le cloud ?",
      options: [
        "Chiffrement côté serveur",
        "Gestion des clés par le client (BYOK)",
        "TLS/SSL",
        "Tokenisation des données sensibles"
      ],
      correctAnswer: 2
    },
    {
      question: "Quel concept de sécurité cloud implique de limiter l'accès des utilisateurs aux seules ressources dont ils ont besoin ?",
      options: [
        "Defense-in-Depth",
        "Principe du moindre privilège",
        "Zero Trust Architecture",
        "Isolation des locataires"
      ],
      correctAnswer: 1
    },
    {
      question: "Quelle pratique est recommandée pour sécuriser les environnements multi-cloud ?",
      options: [
        "Utiliser uniquement des outils natifs propres à chaque cloud",
        "Centraliser la gestion des identités et des accès",
        "Dupliquer toutes les données sur chaque cloud",
        "Désactiver le chiffrement pour faciliter l'interopérabilité"
      ],
      correctAnswer: 1
    },
    {
      question: "Quel standard/framework est particulièrement pertinent pour la conformité en matière de sécurité cloud ?",
      options: [
        "ISO/IEC 27017",
        "PCI DSS",
        "COBIT",
        "ISO 9001"
      ],
      correctAnswer: 0
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
                <li>Comprendre les spécificités de la sécurité dans le cloud</li>
                <li>Identifier les responsabilités partagées entre client et fournisseur</li>
                <li>Reconnaître les principales menaces visant les environnements cloud</li>
                <li>Appliquer les bonnes pratiques de sécurisation des déploiements cloud</li>
                <li>Évaluer la conformité des services cloud aux normes et réglementations</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="mt-6 space-y-4">
            <h2 className="text-2xl font-bold">Comprendre la sécurité cloud</h2>

            <p>
              La <strong>sécurité cloud</strong> désigne l'ensemble des politiques, contrôles, procédures et technologies qui protègent les données, les applications et l'infrastructure dans les environnements cloud.
            </p>

            <div className="bg-blue-900/20 border border-blue-800 rounded-md p-4 my-4">
              <h3 className="text-lg font-medium mb-2">Définition</h3>
              <p>
                La <strong>sécurité cloud</strong> comprend les mesures de protection appliquées aux données, applications, services et infrastructure hébergés dans le cloud pour les prémunir contre les accès non autorisés, les fuites de données, les attaques malveillantes et assurer leur disponibilité.
              </p>
            </div>

            <div className="mt-6">
              <h3 className="text-xl font-bold">Pourquoi la sécurité cloud est-elle cruciale ?</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <Card className="bg-blue-900/20 border-blue-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md flex items-center">
                      <CloudCog className="mr-2 h-5 w-5 text-blue-400" />
                      Transformation digitale
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-blue-200">
                      La migration vers le cloud est au cœur des stratégies de transformation numérique des organisations.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-blue-900/20 border-blue-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md flex items-center">
                      <ShieldAlert className="mr-2 h-5 w-5 text-blue-400" />
                      Surface d'attaque élargie
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-blue-200">
                      Les environnements cloud introduisent de nouveaux vecteurs d'attaque et points d'exposition.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-blue-900/20 border-blue-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md flex items-center">
                      <Users className="mr-2 h-5 w-5 text-blue-400" />
                      Responsabilité partagée
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-blue-200">
                      La sécurité dans le cloud repose sur une répartition des responsabilités entre client et fournisseur.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-blue-900/20 border-blue-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md flex items-center">
                      <FileWarning className="mr-2 h-5 w-5 text-blue-400" />
                      Conformité réglementaire
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-blue-200">
                      Les exigences légales (RGPD, NIS2, etc.) s'appliquent également aux données hébergées dans le cloud.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-bold">L'évolution du cloud computing</h3>

              <div className="mt-4 space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-md bg-blue-900/20 border border-blue-800">
                  <div className="bg-blue-700 p-2 rounded-md shrink-0">
                    <CloudRain className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium">Du cloud traditionnel au multi-cloud</h4>
                    <p className="text-sm text-blue-200 mt-1">L'évolution des architectures cloud a conduit à l'adoption de stratégies multi-cloud et hybrides, multipliant les défis de sécurité.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-md bg-blue-900/20 border border-blue-800">
                  <div className="bg-blue-700 p-2 rounded-md shrink-0">
                    <Layers className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium">Modèles de services (IaaS, PaaS, SaaS)</h4>
                    <p className="text-sm text-blue-200 mt-1">Chaque modèle de service implique un niveau différent de responsabilité en matière de sécurité.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-md bg-blue-900/20 border border-blue-800">
                  <div className="bg-blue-700 p-2 rounded-md shrink-0">
                    <CloudOff className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium">Les défis spécifiques au cloud</h4>
                    <p className="text-sm text-blue-200 mt-1">Visibilité réduite, contrôle partagé, complexité des configurations et problématiques de souveraineté des données.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-bold">Panorama des menaces cloud</h3>

              <Table className="mt-4 border-blue-800">
                <TableHeader className="bg-blue-900/50">
                  <TableRow className="border-blue-800">
                    <TableHead className="text-blue-100">Type de menace</TableHead>
                    <TableHead className="text-blue-100">Description</TableHead>
                    <TableHead className="text-blue-100">Impact potentiel</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="border-blue-800">
                    <TableCell className="font-medium">Erreurs de configuration</TableCell>
                    <TableCell className="text-sm text-blue-200">Mauvaises configurations des services cloud, permissions excessives, exposition publique accidentelle</TableCell>
                    <TableCell className="text-sm text-blue-200">Fuite de données, accès non autorisé, compromission</TableCell>
                  </TableRow>
                  <TableRow className="border-blue-800">
                    <TableCell className="font-medium">Vol d'identifiants cloud</TableCell>
                    <TableCell className="text-sm text-blue-200">Compromission des comptes administrateurs ou des API keys utilisées pour gérer les ressources cloud</TableCell>
                    <TableCell className="text-sm text-blue-200">Accès illégitime, prise de contrôle de l'infrastructure</TableCell>
                  </TableRow>
                  <TableRow className="border-blue-800">
                    <TableCell className="font-medium">Menaces persistantes avancées</TableCell>
                    <TableCell className="text-sm text-blue-200">Attaques sophistiquées visant spécifiquement les environnements cloud</TableCell>
                    <TableCell className="text-sm text-blue-200">Vol de propriété intellectuelle, espionnage</TableCell>
                  </TableRow>
                  <TableRow className="border-blue-800">
                    <TableCell className="font-medium">Attaques sur les API</TableCell>
                    <TableCell className="text-sm text-blue-200">Exploitation des vulnérabilités dans les interfaces de programmation</TableCell>
                    <TableCell className="text-sm text-blue-200">Manipulation de données, accès non autorisé</TableCell>
                  </TableRow>
                  <TableRow className="border-blue-800">
                    <TableCell className="font-medium">Attaques entre locataires</TableCell>
                    <TableCell className="text-sm text-blue-200">Exploitation des failles d'isolation entre clients partageant le même environnement cloud</TableCell>
                    <TableCell className="text-sm text-blue-200">Fuite d'information, accès illégitime aux ressources</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="mt-8 bg-blue-950 border border-blue-800 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-2 flex items-center">
              <Zap className="mr-2 h-5 w-5 text-blue-400" />
              Points clés à retenir
            </h3>
            <ul className="list-disc list-inside space-y-1 text-blue-200">
              <li>La sécurité dans le cloud nécessite une approche spécifique et adaptée</li>
              <li>Le modèle de responsabilité partagée est fondamental pour comprendre son rôle</li>
              <li>Les erreurs de configuration sont la principale cause d'incidents de sécurité cloud</li>
              <li>La visibilité et le contrôle sont des défis majeurs dans les environnements cloud</li>
              <li>L'évolution vers le multi-cloud complexifie la gouvernance de sécurité</li>
            </ul>
          </div>
        </motion.div>
      </div>
    ),

    modeles: (
      <div className="space-y-6">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={contentVariants}
        >
          <h2 className="text-2xl font-bold">Modèles cloud et responsabilités</h2>

          <p className="mt-4">
            Comprendre les différents modèles de service cloud et la répartition des responsabilités de sécurité est essentiel pour déployer une stratégie efficace.
          </p>

          <div className="mt-6">
            <h3 className="text-xl font-bold">Le modèle de responsabilité partagée</h3>

            <p className="mt-2">
              Le <strong>modèle de responsabilité partagée</strong> définit clairement les obligations de sécurité qui incombent au fournisseur cloud et celles qui restent à la charge du client. Cette répartition varie selon le modèle de service.
            </p>

            <Card className="bg-blue-900/20 border-blue-800 mt-4">
              <CardContent className="pt-6">
                <Tabs defaultValue="iaas">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="iaas">IaaS</TabsTrigger>
                    <TabsTrigger value="paas">PaaS</TabsTrigger>
                    <TabsTrigger value="saas">SaaS</TabsTrigger>
                  </TabsList>
                  <TabsContent value="iaas" className="p-4 bg-blue-950/30 rounded-md mt-4">
                    <h4 className="font-medium flex items-center">
                      <Server className="mr-2 h-5 w-5 text-blue-400" />
                      Infrastructure as a Service
                    </h4>
                    <p className="mt-2 text-sm text-blue-200">
                      Le client dispose d'un contrôle maximal mais assume également davantage de responsabilités en matière de sécurité.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                      <div>
                        <p className="text-xs font-medium text-blue-300">Responsabilités du fournisseur :</p>
                        <ul className="list-disc list-inside mt-1 space-y-1 text-xs text-blue-300">
                          <li>Sécurité physique des datacenters</li>
                          <li>Maintenance du matériel</li>
                          <li>Réseau sous-jacent</li>
                          <li>Hyperviseurs de virtualisation</li>
                          <li>Stockage physique</li>
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-orange-300">Responsabilités du client :</p>
                        <ul className="list-disc list-inside mt-1 space-y-1 text-xs text-orange-300">
                          <li>Système d'exploitation</li>
                          <li>Applications et données</li>
                          <li>Configuration réseau</li>
                          <li>Identités et accès</li>
                          <li>Chiffrement des données</li>
                          <li>Pare-feu et sécurité périmétrique</li>
                        </ul>
                      </div>
                    </div>
                    <p className="text-xs text-blue-300 mt-3">
                      <strong>Exemples :</strong> Amazon EC2, Azure Virtual Machines, Google Compute Engine
                    </p>
                  </TabsContent>
                  <TabsContent value="paas" className="p-4 bg-blue-950/30 rounded-md mt-4">
                    <h4 className="font-medium flex items-center">
                      <LayoutGrid className="mr-2 h-5 w-5 text-blue-400" />
                      Platform as a Service
                    </h4>
                    <p className="mt-2 text-sm text-blue-200">
                      La responsabilité du client se concentre sur les applications et les données, tandis que le fournisseur gère l'infrastructure sous-jacente.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                      <div>
                        <p className="text-xs font-medium text-blue-300">Responsabilités du fournisseur :</p>
                        <ul className="list-disc list-inside mt-1 space-y-1 text-xs text-blue-300">
                          <li>Sécurité physique et matérielle</li>
                          <li>Système d'exploitation</li>
                          <li>Runtime applicatif</li>
                          <li>Middleware et bases de données</li>
                          <li>Réseau et stockage</li>
                          <li>Correctifs et mises à jour</li>
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-orange-300">Responsabilités du client :</p>
                        <ul className="list-disc list-inside mt-1 space-y-1 text-xs text-orange-300">
                          <li>Applications et code</li>
                          <li>Données et classification</li>
                          <li>Identités clients</li>
                          <li>Configurations de sécurité spécifiques</li>
                          <li>Logique métier</li>
                        </ul>
                      </div>
                    </div>
                    <p className="text-xs text-blue-300 mt-3">
                      <strong>Exemples :</strong> AWS Elastic Beanstalk, Azure App Service, Google App Engine
                    </p>
                  </TabsContent>
                  <TabsContent value="saas" className="p-4 bg-blue-950/30 rounded-md mt-4">
                    <h4 className="font-medium flex items-center">
                      <Database className="mr-2 h-5 w-5 text-blue-400" />
                      Software as a Service
                    </h4>
                    <p className="mt-2 text-sm text-blue-200">
                      Le fournisseur assume la majeure partie des responsabilités de sécurité, mais le client reste responsable de ses données et de leur utilisation.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                      <div>
                        <p className="text-xs font-medium text-blue-300">Responsabilités du fournisseur :</p>
                        <ul className="list-disc list-inside mt-1 space-y-1 text-xs text-blue-300">
                          <li>Infrastructure complète</li>
                          <li>Applications et fonctionnalités</li>
                          <li>Mises à jour et correctifs</li>
                          <li>Sécurité de la plateforme</li>
                          <li>Disponibilité et continuité</li>
                          <li>Sécurité du réseau</li>
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-orange-300">Responsabilités du client :</p>
                        <ul className="list-disc list-inside mt-1 space-y-1 text-xs text-orange-300">
                          <li>Protection des identifiants</li>
                          <li>Gestion des utilisateurs et accès</li>
                          <li>Classification des données</li>
                          <li>Contrôle des terminaux clients</li>
                          <li>Surveillance des activités suspectes</li>
                        </ul>
                      </div>
                    </div>
                    <p className="text-xs text-blue-300 mt-3">
                      <strong>Exemples :</strong> Microsoft 365, Salesforce, Google Workspace
                    </p>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-bold">Modèles de déploiement cloud et implications</h3>

            <div className="mt-4 space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-md bg-blue-900/20 border border-blue-800">
                <div className="bg-blue-700 p-2 rounded-md shrink-0">
                  <Cloud className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium">Cloud public</h4>
                  <p className="text-sm text-blue-200 mt-1">Infrastructure partagée exploitée par un fournisseur tiers et accessible via Internet.</p>
                  <div className="mt-2">
                    <p className="text-xs text-green-300"><strong>Avantages :</strong> Scalabilité, coût optimisé, maintenance simplifiée</p>
                    <p className="text-xs text-red-300"><strong>Défis de sécurité :</strong> Multi-locataires, contrôle limité, compliance dans certains secteurs</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-md bg-blue-900/20 border border-blue-800">
                <div className="bg-blue-700 p-2 rounded-md shrink-0">
                  <Lock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium">Cloud privé</h4>
                  <p className="text-sm text-blue-200 mt-1">Infrastructure exclusivement dédiée à une organisation, hébergée en interne ou chez un tiers.</p>
                  <div className="mt-2">
                    <p className="text-xs text-green-300"><strong>Avantages :</strong> Contrôle élevé, personnalisation, sécurité renforcée</p>
                    <p className="text-xs text-red-300"><strong>Défis de sécurité :</strong> Complexité de gestion, compétences internes requises</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-md bg-blue-900/20 border border-blue-800">
                <div className="bg-blue-700 p-2 rounded-md shrink-0">
                  <NetworkChart className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium">Cloud hybride</h4>
                  <p className="text-sm text-blue-200 mt-1">Combinaison d'infrastructures cloud publiques et privées, interconnectées mais restant des entités distinctes.</p>
                  <div className="mt-2">
                    <p className="text-xs text-green-300"><strong>Avantages :</strong> Flexibilité, équilibre entre contrôle et évolutivité</p>
                    <p className="text-xs text-red-300"><strong>Défis de sécurité :</strong> Complexité, cohérence des politiques, sécurisation des interconnexions</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-md bg-blue-900/20 border border-blue-800">
                <div className="bg-blue-700 p-2 rounded-md shrink-0">
                  <Layers className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium">Multi-cloud</h4>
                  <p className="text-sm text-blue-200 mt-1">Utilisation de plusieurs fournisseurs cloud, soit pour différentes fonctions, soit pour la redondance.</p>
                  <div className="mt-2">
                    <p className="text-xs text-green-300"><strong>Avantages :</strong> Réduction des dépendances, meilleure disponibilité, optimisation des coûts</p>
                    <p className="text-xs text-red-300"><strong>Défis de sécurité :</strong> Gestion complexe, hétérogénéité des contrôles, gouvernance centralisée difficile</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-bold">Défis spécifiques aux différents modèles</h3>

            <Table className="mt-4 border-blue-800">
              <TableHeader className="bg-blue-900/50">
                <TableRow className="border-blue-800">
                  <TableHead className="text-blue-100">Modèle</TableHead>
                  <TableHead className="text-blue-100">Principaux défis de sécurité</TableHead>
                  <TableHead className="text-blue-100">Approches recommandées</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="border-blue-800">
                  <TableCell className="font-medium">IaaS</TableCell>
                  <TableCell className="text-sm text-blue-200">
                    <ul className="list-disc list-inside">
                      <li>Configurations sécurisées des VM</li>
                      <li>Gestion des correctifs et mises à jour</li>
                      <li>Segmentation réseau</li>
                      <li>Contrôle des accès administratifs</li>
                    </ul>
                  </TableCell>
                  <TableCell className="text-sm text-blue-200">
                    <ul className="list-disc list-inside">
                      <li>Sécurité as code (IaC)</li>
                      <li>Durcissement des OS</li>
                      <li>Automatisation des contrôles</li>
                      <li>Cloud Security Posture Management</li>
                    </ul>
                  </TableCell>
                </TableRow>
                <TableRow className="border-blue-800">
                  <TableCell className="font-medium">PaaS</TableCell>
                  <TableCell className="text-sm text-blue-200">
                    <ul className="list-disc list-inside">
                      <li>Sécurité des API</li>
                      <li>Contrôle des dépendances</li>
                      <li>Intégration de la sécurité dans le CI/CD</li>
                      <li>Configuration des services managés</li>
                    </ul>
                  </TableCell>
                  <TableCell className="text-sm text-blue-200">
                    <ul className="list-disc list-inside">
                      <li>Tests de sécurité automatisés</li>
                      <li>SAST et DAST</li>
                      <li>Configuration sécurisée par défaut</li>
                      <li>Analyse des dépendances</li>
                    </ul>
                  </TableCell>
                </TableRow>
                <TableRow className="border-blue-800">
                  <TableCell className="font-medium">SaaS</TableCell>
                  <TableCell className="text-sm text-blue-200">
                    <ul className="list-disc list-inside">
                      <li>Protection des identités</li>
                      <li>Fuite de données</li>
                      <li>Visibilité limitée</li>
                      <li>Shadow IT</li>
                    </ul>
                  </TableCell>
                  <TableCell className="text-sm text-blue-200">
                    <ul className="list-disc list-inside">
                      <li>SSO et MFA</li>
                      <li>CASB (Cloud Access Security Broker)</li>
                      <li>DLP (Data Loss Prevention)</li>
                      <li>Surveillance des activités utilisateurs</li>
                    </ul>
                  </TableCell>
                </TableRow>
                <TableRow className="border-blue-800">
                  <TableCell className="font-medium">Multi-cloud</TableCell>
                  <TableCell className="text-sm text-blue-200">
                    <ul className="list-disc list-inside">
                      <li>Gouvernance unifiée</li>
                      <li>Cohérence des contrôles</li>
                      <li>Complexité de gestion</li>
                      <li>Visibilité globale</li>
                    </ul>
                  </TableCell>
                  <TableCell className="text-sm text-blue-200">
                    <ul className="list-disc list-inside">
                      <li>Plateformes CSPM multi-cloud</li>
                      <li>IAM centralisé</li>
                      <li>Frameworks de sécurité agnostiques</li>
                      <li>Abstraction des contrôles</li>
                    </ul>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <div className="mt-8 bg-blue-950 border border-blue-800 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-2 flex items-center">
              <Zap className="mr-2 h-5 w-5 text-blue-400" />
              Points clés à retenir
            </h3>
            <ul className="list-disc list-inside space-y-1 text-blue-200">
              <li>Le modèle de responsabilité partagée varie selon le type de service (IaaS, PaaS, SaaS)</li>
              <li>Plus vous montez dans la pile (IaaS → SaaS), plus le fournisseur prend en charge de responsabilités</li>
              <li>Chaque modèle de déploiement (public, privé, hybride, multi-cloud) présente des défis spécifiques</li>
              <li>Comprendre clairement ce qui relève de votre responsabilité est essentiel</li>
              <li>Les compromissions dans le cloud résultent souvent d'une mauvaise compréhension des responsabilités</li>
            </ul>
          </div>
        </motion.div>
      </div>
    ),

    risques: (
      <div className="space-y-6">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={contentVariants}
        >
          <h2 className="text-2xl font-bold">Risques et menaces spécifiques</h2>

          <p className="mt-4">
            Les environnements cloud sont exposés à des risques et menaces spécifiques qu'il est essentiel d'identifier et de comprendre pour mettre en place des protections adaptées.
          </p>

          <div className="mt-6">
            <h3 className="text-xl font-bold">Top des menaces cloud</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Card className="bg-blue-900/20 border-blue-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md flex items-center">
                    <AlertTriangle className="mr-2 h-5 w-5 text-yellow-500" />
                    Erreurs de configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-blue-200 mb-2">
                    Les erreurs de configuration sont la principale cause d'incidents de sécurité dans le cloud, souvent dues à une compréhension insuffisante des paramètres ou à des erreurs humaines.
                  </p>
                  <div className="text-xs text-blue-300">
                    <strong>Exemples courants :</strong>
                    <ul className="list-disc list-inside mt-1">
                      <li>Stockages cloud accessibles publiquement</li>
                      <li>Permissions excessives ou mal configurées</li>
                      <li>Exposition non intentionnelle d'API</li>
                      <li>Sécurité par défaut désactivée</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-blue-900/20 border-blue-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md flex items-center">
                    <Key className="mr-2 h-5 w-5 text-yellow-500" />
                    Vol d'identifiants et défauts d'authentification
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-blue-200 mb-2">
                    Les attaques ciblant les identifiants d'accès au cloud peuvent offrir un accès complet à l'infrastructure et aux données.
                  </p>
                  <div className="text-xs text-blue-300">
                    <strong>Vecteurs d'attaque :</strong>
                    <ul className="list-disc list-inside mt-1">
                      <li>Hameçonnage ciblant les administrateurs cloud</li>
                      <li>Attaques par force brute</li>
                      <li>Exposition accidentelle de clés API</li>
                      <li>Absence d'authentification forte</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-blue-900/20 border-blue-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md flex items-center">
                    <Users className="mr-2 h-5 w-5 text-yellow-500" />
                    Problèmes d'isolation entre locataires
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-blue-200 mb-2">
                    Les failles dans l'isolation multi-locataires peuvent permettre à un attaquant d'accéder aux ressources d'autres clients sur la même infrastructure.
                  </p>
                  <div className="text-xs text-blue-300">
                    <strong>Risques associés :</strong>
                    <ul className="list-disc list-inside mt-1">
                      <li>Attaques par canal auxiliaire</li>
                      <li>Exploitation de vulnérabilités d'hyperviseur</li>
                      <li>Fuites de mémoire entre instances</li>
                      <li>Attaques de type "container escape"</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-blue-900/20 border-blue-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md flex items-center">
                    <NetworkChart className="mr-2 h-5 w-5 text-yellow-500" />
                    Vulnérabilités des API
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-blue-200 mb-2">
                    Les API sont essentielles au fonctionnement du cloud mais peuvent présenter des vulnérabilités exploitables.
                  </p>
                  <div className="text-xs text-blue-300">
                    <strong>Faiblesses courantes :</strong>
                    <ul className="list-disc list-inside mt-1">
                      <li>Authentification insuffisante</li>
                      <li>Autorisations mal implémentées</li>
                      <li>Absence de throttling (limitation de débit)</li>
                      <li>Validation d'entrée insuffisante</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-blue-900/20 border-blue-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md flex items-center">
                    <HardDrive className="mr-2 h-5 w-5 text-yellow-500" />
                    Perte ou fuite de données
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-blue-200 mb-2">
                    Le risque de perte ou de fuite de données est amplifié dans le cloud en raison de la complexité des environnements et du volume de données.
                  </p>
                  <div className="text-xs text-blue-300">
                    <strong>Causes fréquentes :</strong>
                    <ul className="list-disc list-inside mt-1">
                      <li>Absence de chiffrement</li>
                      <li>Gestion inappropriée des clés</li>
                      <li>Suppression accidentelle</li>
                      <li>Transferts non sécurisés</li>
                      <li>Shadow IT et applications non supervisées</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-blue-900/20 border-blue-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md flex items-center">
                    <ShieldAlert className="mr-2 h-5 w-5 text-yellow-500" />
                    Menaces persistantes avancées (APT)
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-blue-200 mb-2">
                    Les acteurs de menaces sophistiqués ciblent spécifiquement les environnements cloud pour leur valeur stratégique.
                  </p>
                  <div className="text-xs text-blue-300">
                    <strong>Caractéristiques :</strong>
                    <ul className="list-disc list-inside mt-1">
                      <li>Attaques prolongées et discrètes</li>
                      <li>Techniques d'évasion avancées</li>
                      <li>Mouvements latéraux</li>
                      <li>Exploitation de plusieurs vecteurs</li>
                      <li>Objectifs de vol de données ou d'espionnage</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-bold">Vulnérabilités courantes dans le cloud</h3>

            <div className="mt-4 space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-md bg-blue-900/20 border border-blue-800">
                <div className="bg-blue-700 p-2 rounded-md shrink-0">
                  <Eye className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium">Manque de visibilité et de contrôle</h4>
                  <p className="text-sm text-blue-200 mt-1">
                    La nature abstraite du cloud limite la visibilité sur l'infrastructure sous-jacente et sur certaines opérations.
                  </p>
                  <div className="mt-2">
                    <p className="text-xs text-orange-300"><strong>Impact :</strong> Capacité réduite à détecter les menaces, difficulté à maintenir une connaissance précise des actifs</p>
                    <p className="text-xs text-green-300"><strong>Mesures d'atténuation :</strong> Outils CSPM, CWPP, logging approfondi, surveillance centralisée</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-md bg-blue-900/20 border border-blue-800">
                <div className="bg-blue-700 p-2 rounded-md shrink-0">
                  <Network className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium">Réseau et segmentation inadéquats</h4>
                  <p className="text-sm text-blue-200 mt-1">
                    Les architectures cloud mal segmentées facilitent le mouvement latéral des attaquants.
                  </p>
                  <div className="mt-2">
                    <p className="text-xs text-orange-300"><strong>Impact :</strong> Propagation rapide des compromissions, difficulté à contenir les incidents</p>
                    <p className="text-xs text-green-300"><strong>Mesures d'atténuation :</strong> Micro-segmentation, VPC bien structurés, Zero Trust Architecture</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-md bg-blue-900/20 border border-blue-800">
                <div className="bg-blue-700 p-2 rounded-md shrink-0">
                  <Key className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium">Gestion déficiente des secrets</h4>
                  <p className="text-sm text-blue-200 mt-1">
                    Les identifiants, clés API et autres secrets sont souvent mal protégés dans les environnements cloud.
                  </p>
                  <div className="mt-2">
                    <p className="text-xs text-orange-300"><strong>Impact :</strong> Compromission d'identifiants, accès non autorisé, persistance des attaquants</p>
                    <p className="text-xs text-green-300"><strong>Mesures d'atténuation :</strong> Coffres-forts de secrets, rotation des clés, détection de fuites de secrets</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-md bg-blue-900/20 border border-blue-800">
                <div className="bg-blue-700 p-2 rounded-md shrink-0">
                  <ShieldAlert className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium">Surface d'attaque étendue</h4>
                  <p className="text-sm text-blue-200 mt-1">
                    L'interconnexion de multiples services cloud et l'accessibilité par Internet étendent considérablement la surface d'attaque.
                  </p>
                  <div className="mt-2">
                    <p className="text-xs text-orange-300"><strong>Impact :</strong> Multiplication des vecteurs d'attaque, difficulté à tout sécuriser</p>
                    <p className="text-xs text-green-300"><strong>Mesures d'atténuation :</strong> Inventaire automatisé des actifs, sécurité par défaut, réduction de l'exposition publique</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-bold">Défis spécifiques aux architectures cloud modernes</h3>

            <Table className="mt-4 border-blue-800">
              <TableHeader className="bg-blue-900/50">
                <TableRow className="border-blue-800">
                  <TableHead className="text-blue-100">Architecture</TableHead>
                  <TableHead className="text-blue-100">Risques spécifiques</TableHead>
                  <TableHead className="text-blue-100">Considérations de sécurité</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="border-blue-800">
                  <TableCell className="font-medium">Conteneurs et orchestration</TableCell>
                  <TableCell className="text-sm text-blue-200">
                    <ul className="list-disc list-inside">
                      <li>Évasion de conteneur</li>
                      <li>Images compromises</li>
                      <li>Configurations d'orchestrateur non sécurisées</li>
                      <li>Secrets injectés dans les conteneurs</li>
                    </ul>
                  </TableCell>
                  <TableCell className="text-sm text-blue-200">
                    <ul className="list-disc list-inside">
                      <li>Scan d'images et signature</li>
                      <li>Politiques de sécurité pour Kubernetes</li>
                      <li>Isolation renforcée</li>
                      <li>Runtime security (falco, aqua, etc.)</li>
                    </ul>
                  </TableCell>
                </TableRow>
                <TableRow className="border-blue-800">
                  <TableCell className="font-medium">Serverless</TableCell>
                  <TableCell className="text-sm text-blue-200">
                    <ul className="list-disc list-inside">
                      <li>Dépendances vulnérables</li>
                      <li>Persistance limitée pour l'analyse forensique</li>
                      <li>Confusion de député</li>
                      <li>Configurations d'événements exposées</li>
                    </ul>
                  </TableCell>
                  <TableCell className="text-sm text-blue-200">
                    <ul className="list-disc list-inside">
                      <li>Gestion rigoureuse des dépendances</li>
                      <li>Journalisation étendue</li>
                      <li>Principe du moindre privilège</li>
                      <li>Tests de sécurité spécifiques</li>
                    </ul>
                  </TableCell>
                </TableRow>
                <TableRow className="border-blue-800">
                  <TableCell className="font-medium">Architectures distribuées</TableCell>
                  <TableCell className="text-sm text-blue-200">
                    <ul className="list-disc list-inside">
                      <li>Communications inter-services non sécurisées</li>
                      <li>Difficulté à maintenir une vision globale</li>
                      <li>Inconsistances dans les contrôles</li>
                      <li>Complexité de l'IAM</li>
                    </ul>
                  </TableCell>
                  <TableCell className="text-sm text-blue-200">
                    <ul className="list-disc list-inside">
                      <li>Service mesh sécurisé</li>
                      <li>Authentification mutuelle TLS</li>
                      <li>Observabilité centralisée</li>
                      <li>Automatisation des politiques</li>
                    </ul>
                  </TableCell>
                </TableRow>
                <TableRow className="border-blue-800">
                  <TableCell className="font-medium">Multi-cloud</TableCell>
                  <TableCell className="text-sm text-blue-200">
                    <ul className="list-disc list-inside">
                      <li>Hétérogénéité des contrôles</li>
                      <li>Multiplication des IAM à gérer</li>
                      <li>Visibilité fragmentée</li>
                      <li>Complexité des transferts de données</li>
                    </ul>
                  </TableCell>
                  <TableCell className="text-sm text-blue-200">
                    <ul className="list-disc list-inside">
                      <li>Abstraction de la couche sécurité</li>
                      <li>Solutions de gouvernance multi-cloud</li>
                      <li>Standardisation des contrôles</li>
                      <li>Fédération d'identités</li>
                    </ul>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <div className="mt-8 bg-blue-950 border border-blue-800 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-2 flex items-center">
              <Zap className="mr-2 h-5 w-5 text-blue-400" />
              Points clés à retenir
            </h3>
            <ul className="list-disc list-inside space-y-1 text-blue-200">
              <li>Les erreurs de configuration représentent la cause principale des incidents de sécurité cloud</li>
              <li>La surface d'attaque du cloud est différente et souvent plus large que celle des infrastructures on-premise</li>
              <li>Chaque modèle d'architecture (conteneurs, serverless, etc.) présente des risques spécifiques</li>
              <li>La visibilité et le contrôle sont des défis fondamentaux dans le cloud</li>
              <li>Les architectures modernes nécessitent de nouvelles approches de sécurité adaptées</li>
            </ul>
          </div>
        </motion.div>
      </div>
    ),

    protection: (
      <div className="space-y-6">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={contentVariants}
        >
          <h2 className="text-2xl font-bold">Protection des données et applications</h2>

          <p className="mt-4">
            Sécuriser les données et les applications dans le cloud nécessite une approche spécifique tenant compte des caractéristiques uniques de ces environnements.
          </p>

          <div className="mt-6">
            <h3 className="text-xl font-bold">Sécurisation des données cloud</h3>

            <p className="mt-2">
              Les données constituent l'un des actifs les plus précieux dans le cloud et nécessitent une stratégie de protection complète à travers leur cycle de vie.
            </p>

            <Card className="bg-blue-900/20 border-blue-800 mt-4">
              <CardContent className="pt-6">
                <Tabs defaultValue="transit">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="transit">Données en transit</TabsTrigger>
                    <TabsTrigger value="rest">Données au repos</TabsTrigger>
                    <TabsTrigger value="use">Données en utilisation</TabsTrigger>
                  </TabsList>
                  <TabsContent value="transit" className="p-4 bg-blue-950/30 rounded-md mt-4">
                    <h4 className="font-medium flex items-center">
                      <Network className="mr-2 h-5 w-5 text-blue-400" />
                      Sécurisation des données en transit
                    </h4>
                    <p className="mt-2 text-sm text-blue-200">
                      Protection des données pendant leur transmission entre différents composants cloud ou entre le cloud et les systèmes externes.
                    </p>
                    <div className="mt-3">
                      <p className="text-xs font-medium text-blue-300">Approches et technologies :</p>
                      <ul className="list-disc list-inside mt-1 space-y-1 text-xs text-blue-300">
                        <li><strong>TLS/SSL</strong> : Utilisation de protocoles de chiffrement à jour (TLS 1.3 recommandé)</li>
                        <li><strong>Certificats managés</strong> : Automatisation de la gestion des certificats avec rotation</li>
                        <li><strong>VPN</strong> : Pour les connexions entre environnements on-premise et cloud</li>
                        <li><strong>IPsec</strong> : Chiffrement au niveau réseau pour les communications entre réseaux virtuels</li>
                        <li><strong>mTLS</strong> : Authentification mutuelle pour les services internes</li>
                      </ul>
                    </div>
                    <div className="mt-3">
                      <p className="text-xs font-medium text-green-300">Bonnes pratiques :</p>
                      <ul className="list-disc list-inside mt-1 space-y-1 text-xs text-green-300">
                        <li>Mise en application stricte du HTTPS (HSTS)</li>
                        <li>Désactivation des versions et ciphers faibles</li>
                        <li>Perfect Forward Secrecy pour les communications importantes</li>
                        <li>Validation des certificats côté client</li>
                      </ul>
                    </div>
                  </TabsContent>
                  <TabsContent value="rest" className="p-4 bg-blue-950/30 rounded-md mt-4">
                    <h4 className="font-medium flex items-center">
                      <Database className="mr-2 h-5 w-5 text-blue-400" />
                      Sécurisation des données au repos
                    </h4>
                    <p className="mt-2 text-sm text-blue-200">
                      Protection des données lorsqu'elles sont stockées dans le cloud (stockage objet, bases de données, disques, etc.).
                    </p>
                    <div className="mt-3">
                      <p className="text-xs font-medium text-blue-300">Approches et technologies :</p>
                      <ul className="list-disc list-inside mt-1 space-y-1 text-xs text-blue-300">
                        <li><strong>Chiffrement côté serveur</strong> : Chiffrement géré par le fournisseur cloud</li>
                        <li><strong>Chiffrement côté client</strong> : Données chiffrées avant leur envoi vers le cloud</li>
                        <li><strong>BYOK/HYOK</strong> : Bring/Hold Your Own Key pour maîtriser les clés</li>
                        <li><strong>KMS</strong> : Services de gestion des clés avec rotation automatique</li>
                        <li><strong>HSM</strong> : Modules matériels de sécurité pour les clés critiques</li>
                      </ul>
                    </div>
                    <div className="mt-3">
                      <p className="text-xs font-medium text-green-300">Bonnes pratiques :</p>
                      <ul className="list-disc list-inside mt-1 space-y-1 text-xs text-green-300">
                        <li>Chiffrement par défaut pour tous les stockages</li>
                        <li>Séparation des rôles entre administrateurs de données et de clés</li>
                        <li>Classification des données pour adapter le niveau de protection</li>
                        <li>Rotation régulière des clés de chiffrement</li>
                      </ul>
                    </div>
                  </TabsContent>
                  <TabsContent value="use" className="p-4 bg-blue-950/30 rounded-md mt-4">
                    <h4 className="font-medium flex items-center">
                      <Cpu className="mr-2 h-5 w-5 text-blue-400" />
                      Sécurisation des données en utilisation
                    </h4>
                    <p className="mt-2 text-sm text-blue-200">
                      Protection des données pendant qu'elles sont traitées par les applications et services cloud.
                    </p>
                    <div className="mt-3">
                      <p className="text-xs font-medium text-blue-300">Approches et technologies :</p>
                      <ul className="list-disc list-inside mt-1 space-y-1 text-xs text-blue-300">
                        <li><strong>Confidential Computing</strong> : Traitement dans des enclaves sécurisées (TEE)</li>
                        <li><strong>Chiffrement homomorphe</strong> : Traitement des données sans déchiffrement</li>
                        <li><strong>Tokenisation</strong> : Remplacement des données sensibles par des jetons</li>
                        <li><strong>Data masking</strong> : Masquage des données pour certains utilisateurs</li>
                        <li><strong>DLP</strong> : Prévention des fuites de données</li>
                      </ul>
                    </div>
                    <div className="mt-3">
                      <p className="text-xs font-medium text-green-300">Bonnes pratiques :</p>
                      <ul className="list-disc list-inside mt-1 space-y-1 text-xs text-green-300">
                        <li>Minimisation des données traitées en clair</li>
                        <li>Isolation des processus manipulant des données sensibles</li>
                        <li>Validation des entrées et nettoyage en mémoire</li>
                        <li>Surveillance des accès aux données sensibles</li>
                      </ul>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-bold">Protection des applications cloud</h3>

            <div className="mt-4 space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-md bg-blue-900/20 border border-blue-800">
                <div className="bg-blue-700 p-2 rounded-md shrink-0">
                  <ShieldCheck className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium">Développement sécurisé (DevSecOps)</h4>
                  <p className="text-sm text-blue-200 mt-1">
                    Intégration de la sécurité tout au long du cycle de développement des applications cloud.
                  </p>
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs font-medium text-blue-300">Composants clés :</p>
                      <ul className="list-disc list-inside mt-1 space-y-1 text-xs text-blue-300">
                        <li>Analyse de code statique (SAST)</li>
                        <li>Analyse de composition logicielle (SCA)</li>
                        <li>Tests de sécurité dynamiques (DAST)</li>
                        <li>Infrastructure as Code (IaC) sécurisée</li>
                        <li>Intégration continue/déploiement sécurisés</li>
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-green-300">Meilleures pratiques :</p>
                      <ul className="list-disc list-inside mt-1 space-y-1 text-xs text-green-300">
                        <li>Automatisation des contrôles de sécurité</li>
                        <li>Gates de qualité bloquants</li>
                        <li>Fail-fast pour les vulnérabilités critiques</li>
                        <li>Validation des configurations avant déploiement</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-md bg-blue-900/20 border border-blue-800">
                <div className="bg-blue-700 p-2 rounded-md shrink-0">
                  <Network className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium">Sécurité des API</h4>
                  <p className="text-sm text-blue-200 mt-1">
                    Protection des interfaces de programmation qui sont essentielles aux architectures cloud modernes.
                  </p>
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs font-medium text-blue-300">Méthodes de protection :</p>
                      <ul className="list-disc list-inside mt-1 space-y-1 text-xs text-blue-300">
                        <li>Passerelles API (API Gateways)</li>
                        <li>Authentification OAuth2/OIDC</li>
                        <li>Gestion des tokens JWT</li>
                        <li>Rate limiting et throttling</li>
                        <li>Validation des entrées et schémas</li>
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-green-300">Meilleures pratiques :</p>
                      <ul className="list-disc list-inside mt-1 space-y-1 text-xs text-green-300">
                        <li>Principe du moindre privilège pour les scopes</li>
                        <li>HTTPS obligatoire sur toutes les API</li>
                        <li>Protection contre les attaques OWASP API Top 10</li>
                        <li>Monitoring continu des schémas d'utilisation</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-md bg-blue-900/20 border border-blue-800">
                <div className="bg-blue-700 p-2 rounded-md shrink-0">
                  <Key className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium">IAM et contrôle d'accès</h4>
                  <p className="text-sm text-blue-200 mt-1">
                    Gestion des identités et des accès adaptée aux environnements cloud.
                  </p>
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs font-medium text-blue-300">Composants essentiels :</p>
                      <ul className="list-disc list-inside mt-1 space-y-1 text-xs text-blue-300">
                        <li>Multi-factor Authentication (MFA)</li>
                        <li>Single Sign-On (SSO)</li>
                        <li>Contrôle d'accès basé sur les rôles (RBAC)</li>
                        <li>Contrôle d'accès basé sur les attributs (ABAC)</li>
                        <li>Gestion des identités privilégiées (PIM/PAM)</li>
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-green-300">Meilleures pratiques :</p>
                      <ul className="list-disc list-inside mt-1 space-y-1 text-xs text-green-300">
                        <li>Principe du moindre privilège strict</li>
                        <li>Rotation automatique des identifiants</li>
                        <li>Identification des comptes dormants</li>
                        <li>Surveillance des privilèges anormaux</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-md bg-blue-900/20 border border-blue-800">
                <div className="bg-blue-700 p-2 rounded-md shrink-0">
                  <Eye className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium">Détection et réponse</h4>
                  <p className="text-sm text-blue-200 mt-1">
                    Détection des menaces et réponse aux incidents adaptées au cloud.
                  </p>
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs font-medium text-blue-300">Technologies clés :</p>
                      <ul className="list-disc list-inside mt-1 space-y-1 text-xs text-blue-300">
                        <li>Cloud Security Posture Management (CSPM)</li>
                        <li>Cloud Workload Protection Platforms (CWPP)</li>
                        <li>Cloud Detection and Response (CDR)</li>
                        <li>Cloud-native SIEM/SOAR</li>
                        <li>Journalisation centralisée et monitoring</li>
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-green-300">Meilleures pratiques :</p>
                      <ul className="list-disc list-inside mt-1 space-y-1 text-xs text-green-300">
                        <li>Analyse comportementale (UEBA)</li>
                        <li>Automatisation des réponses aux incidents</li>
                        <li>Détection des changements non autorisés</li>
                        <li>Rétention des journaux adaptée</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-bold">Stratégies de protection adaptées aux services cloud</h3>

            <Table className="mt-4 border-blue-800">
              <TableHeader className="bg-blue-900/50">
                <TableRow className="border-blue-800">
                  <TableHead className="text-blue-100">Type de service</TableHead>
                  <TableHead className="text-blue-100">Risques spécifiques</TableHead>
                  <TableHead className="text-blue-100">Contrôles adaptés</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="border-blue-800">
                  <TableCell className="font-medium">Services de stockage<br/>(S3, Blob Storage)</TableCell>
                  <TableCell className="text-sm text-blue-200">
                    <ul className="list-disc list-inside">
                      <li>Accessibilité publique accidentelle</li>
                      <li>Versions supprimées ou altérées</li>
                      <li>Exfiltration de grandes quantités de données</li>
                    </ul>
                  </TableCell>
                  <TableCell className="text-sm text-blue-200">
                    <ul className="list-disc list-inside">
                      <li>Blocage de l'accès public par défaut</li>
                      <li>Versioning et verrouillage d'objets</li>
                      <li>Chiffrement côté serveur avec KMS</li>
                      <li>Politiques de cycle de vie et archivage</li>
                    </ul>
                  </TableCell>
                </TableRow>
                <TableRow className="border-blue-800">
                  <TableCell className="font-medium">Bases de données managées<br/>(RDS, Cosmos DB)</TableCell>
                  <TableCell className="text-sm text-blue-200">
                    <ul className="list-disc list-inside">
                      <li>Exposition de points de terminaison</li>
                      <li>Identifiants dans le code</li>
                      <li>Requêtes non sécurisées (injection)</li>
                    </ul>
                  </TableCell>
                  <TableCell className="text-sm text-blue-200">
                    <ul className="list-disc list-inside">
                      <li>Déploiement dans des VPC privés</li>
                      <li>TLS pour toutes les connexions</li>
                      <li>Authentification IAM/Azure AD</li>
                      <li>Requêtes paramétrées obligatoires</li>
                    </ul>
                  </TableCell>
                </TableRow>
                <TableRow className="border-blue-800">
                  <TableCell className="font-medium">Services d'applications<br/>(App Service, Lambda)</TableCell>
                  <TableCell className="text-sm text-blue-200">
                    <ul className="list-disc list-inside">
                      <li>Dépendances vulnérables</li>
                      <li>Surpermissions des rôles</li>
                      <li>Secrets en clair dans la configuration</li>
                    </ul>
                  </TableCell>
                  <TableCell className="text-sm text-blue-200">
                    <ul className="list-disc list-inside">
                      <li>Analyse continue des dépendances</li>
                      <li>Rôles IAM avec permissions minimales</li>
                      <li>Intégration avec les coffres de secrets</li>
                      <li>Surveillance des exécutions anormales</li>
                    </ul>
                  </TableCell>
                </TableRow>
                <TableRow className="border-blue-800">
                  <TableCell className="font-medium">Services conteneurisés<br/>(EKS, AKS, GKE)</TableCell>
                  <TableCell className="text-sm text-blue-200">
                    <ul className="list-disc list-inside">
                      <li>Configurations Kubernetes non sécurisées</li>
                      <li>Isolation insuffisante entre pods</li>
                      <li>Vulnérabilités dans les images</li>
                    </ul>
                  </TableCell>
                  <TableCell className="text-sm text-blue-200">
                    <ul className="list-disc list-inside">
                      <li>Network Policies restrictives</li>
                      <li>Pod Security Policies/Standards</li>
                      <li>Scan des images dans le CI/CD</li>
                      <li>Déploiement de maillage de service</li>
                    </ul>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <div className="mt-8 bg-blue-950 border border-blue-800 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-2 flex items-center">
              <Zap className="mr-2 h-5 w-5 text-blue-400" />
              Points clés à retenir
            </h3>
            <ul className="list-disc list-inside space-y-1 text-blue-200">
              <li>La protection des données dans le cloud doit couvrir les trois états : transit, repos et utilisation</li>
              <li>L'approche DevSecOps est essentielle pour intégrer la sécurité dès la conception</li>
              <li>L'IAM est la pierre angulaire de la sécurité cloud, mais doit être soigneusement configuré</li>
              <li>Chaque service cloud nécessite des contrôles de sécurité spécifiques et adaptés</li>
              <li>La détection et la réponse sont aussi importantes que la prévention dans le cloud</li>
            </ul>
          </div>
        </motion.div>
      </div>
    ),

    'bonnes-pratiques': (
      <div className="space-y-6">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={contentVariants}
        >
          <h2 className="text-2xl font-bold">Bonnes pratiques et conformité</h2>

          <p className="mt-4">
            Mettre en œuvre des bonnes pratiques de sécurité dans le cloud et assurer la conformité aux réglementations est essentiel pour une stratégie de sécurité efficace.
          </p>

          <div className="mt-6">
            <h3 className="text-xl font-bold">Cadres et standards de sécurité cloud</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Card className="bg-blue-900/20 border-blue-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md flex items-center">
                    <CheckCircle2 className="mr-2 h-5 w-5 text-blue-400" />
                    Cloud Security Alliance (CSA) - Cloud Controls Matrix
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-blue-200 mb-2">
                    Framework complet de contrôles de sécurité spécifiquement conçu pour les environnements cloud.
                  </p>
                  <div className="text-xs text-blue-300">
                    <strong>Caractéristiques :</strong>
                    <ul className="list-disc list-inside mt-1">
                      <li>Plus de 130 contrôles répartis en 16 domaines</li>
                      <li>Alignement avec les principales normes (ISO, NIST, etc.)</li>
                      <li>Guidance détaillée par modèle de service</li>
                      <li>Évaluations CAIQ (Consensus Assessment Initiative Questionnaire)</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-blue-900/20 border-blue-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md flex items-center">
                    <ShieldCheck className="mr-2 h-5 w-5 text-blue-400" />
                    NIST 800-53 / NIST Cybersecurity Framework
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-blue-200 mb-2">
                    Cadre de référence du National Institute of Standards and Technology, largement adopté pour la sécurité des systèmes d'information.
                  </p>
                  <div className="text-xs text-blue-300">
                    <strong>Caractéristiques :</strong>
                    <ul className="list-disc list-inside mt-1">
                      <li>Approche basée sur le risque</li>
                      <li>5 fonctions principales : Identifier, Protéger, Détecter, Répondre, Récupérer</li>
                      <li>Guides spécifiques pour le cloud (SP 800-144, 800-145)</li>
                      <li>Adaptable à toutes les tailles d'organisation</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-blue-900/20 border-blue-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md flex items-center">
                    <Lock className="mr-2 h-5 w-5 text-blue-400" />
                    ISO/IEC 27017 et 27018
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-blue-200 mb-2">
                    Extensions des normes ISO/IEC 27001/27002 spécifiquement pour les services cloud.
                  </p>
                  <div className="text-xs text-blue-300">
                    <strong>Caractéristiques :</strong>
                    <ul className="list-disc list-inside mt-1">
                      <li>ISO 27017 : Contrôles de sécurité pour les services cloud</li>
                      <li>ISO 27018 : Protection des données personnelles dans le cloud</li>
                      <li>Approche par le système de management</li>
                      <li>Reconnaissance internationale</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-blue-900/20 border-blue-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md flex items-center">
                    <Server className="mr-2 h-5 w-5 text-blue-400" />
                    CIS Benchmarks for Cloud
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-blue-200 mb-2">
                    Guides de configuration sécurisée spécifiques aux principaux fournisseurs cloud (AWS, Azure, GCP).
                  </p>
                  <div className="text-xs text-blue-300">
                    <strong>Caractéristiques :</strong>
                    <ul className="list-disc list-inside mt-1">
                      <li>Recommandations techniques détaillées</li>
                      <li>Niveaux de sécurité progressifs (1 et 2)</li>
                      <li>Mises à jour régulières</li>
                      <li>Outils d'automatisation disponibles</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-bold">Stratégies de conformité pour le cloud</h3>

            <div className="mt-4 space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-md bg-blue-900/20 border border-blue-800">
                <div className="bg-blue-700 p-2 rounded-md shrink-0">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium">Comprendre les exigences réglementaires</h4>
                  <p className="text-sm text-blue-200 mt-1">
                    Identification et analyse des réglementations applicables à vos données et services cloud.
                  </p>
                  <div className="mt-2">
                    <p className="text-xs text-blue-300"><strong>Réglementations clés :</strong></p>
                    <ul className="list-disc list-inside mt-1 space-y-1 text-xs text-blue-300">
                      <li><strong>RGPD/GDPR</strong> : Protection des données personnelles des résidents européens</li>
                      <li><strong>NIS2</strong> : Directive européenne sur la sécurité des réseaux et systèmes d'information</li>
                      <li><strong>HIPAA</strong> : Protection des données de santé (États-Unis)</li>
                      <li><strong>PCI DSS</strong> : Sécurité des données de cartes de paiement</li>
                      <li><strong>Sectorielles</strong> : Réglementations financières (ACPR, LCB-FT), défense (II/DR), etc.</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-md bg-blue-900/20 border border-blue-800">
                <div className="bg-blue-700 p-2 rounded-md shrink-0">
                  <RefreshCw className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium">Gérer la souveraineté des données</h4>
                  <p className="text-sm text-blue-200 mt-1">
                    Mise en place de contrôles pour respecter les exigences de localisation et de souveraineté des données.
                  </p>
                  <div className="mt-2">
                    <p className="text-xs text-blue-300"><strong>Approches et considérations :</strong></p>
                    <ul className="list-disc list-inside mt-1 space-y-1 text-xs text-blue-300">
                      <li>Sélection des régions cloud conformes aux exigences légales</li>
                      <li>Utilisation de clouds souverains (ex: Cloud de Confiance)</li>
                      <li>Gestion des clés de chiffrement par le client (BYOK/HYOK)</li>
                      <li>Contrôles de résidence des données via les politiques</li>
                      <li>Surveillance des transferts transfrontaliers</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-md bg-blue-900/20 border border-blue-800">
                <div className="bg-blue-700 p-2 rounded-md shrink-0">
                  <Eye className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium">Mettre en œuvre la traçabilité et l'audit</h4>
                  <p className="text-sm text-blue-200 mt-1">
                    Mise en place des mécanismes nécessaires pour tracer les activités et faciliter les audits.
                  </p>
                  <div className="mt-2">
                    <p className="text-xs text-blue-300"><strong>Éléments essentiels :</strong></p>
                    <ul className="list-disc list-inside mt-1 space-y-1 text-xs text-blue-300">
                      <li>Activation des journaux d'audit sur tous les services</li>
                      <li>Centralisation et protection des journaux</li>
                      <li>Traçabilité des accès aux données sensibles</li>
                      <li>Détection des modifications non autorisées</li>
                      <li>Conservation des journaux adaptée aux exigences réglementaires</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-md bg-blue-900/20 border border-blue-800">
                <div className="bg-blue-700 p-2 rounded-md shrink-0">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium">Exploiter les certifications des fournisseurs</h4>
                  <p className="text-sm text-blue-200 mt-1">
                    Utilisation des certifications et attestations des fournisseurs cloud pour faciliter la conformité.
                  </p>
                  <div className="mt-2">
                    <p className="text-xs text-blue-300"><strong>Certifications principales :</strong></p>
                    <ul className="list-disc list-inside mt-1 space-y-1 text-xs text-blue-300">
                      <li>ISO/IEC 27001, 27017, 27018</li>
                      <li>SOC 1, SOC 2, SOC 3</li>
                      <li>CSA STAR</li>
                      <li>Certifications spécifiques (HDS, SecNumCloud, FedRAMP)</li>
                      <li>Rapports de conformité et matrices de responsabilité</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-bold">Meilleures pratiques opérationnelles</h3>

            <Table className="mt-4 border-blue-800">
              <TableHeader className="bg-blue-900/50">
                <TableRow className="border-blue-800">
                  <TableHead className="text-blue-100">Domaine</TableHead>
                  <TableHead className="text-blue-100">Bonnes pratiques</TableHead>
                  <TableHead className="text-blue-100">Outils et approches</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="border-blue-800">
                  <TableCell className="font-medium">Architecture de sécurité</TableCell>
                  <TableCell className="text-sm text-blue-200">
                    <ul className="list-disc list-inside">
                      <li>Adoption de Zero Trust Architecture</li>
                      <li>Défense en profondeur multi-niveaux</li>
                      <li>Micro-segmentation des réseaux</li>
                      <li>Principe du moindre privilège strict</li>
                    </ul>
                  </TableCell>
                  <TableCell className="text-sm text-blue-200">
                    <ul className="list-disc list-inside">
                      <li>Well-Architected Frameworks</li>
                      <li>Diagrammes de flux de données</li>
                      <li>Modélisation des menaces</li>
                      <li>Revues d'architecture sécurisée</li>
                    </ul>
                  </TableCell>
                </TableRow>
                <TableRow className="border-blue-800">
                  <TableCell className="font-medium">Automatisation et IaC</TableCell>
                  <TableCell className="text-sm text-blue-200">
                    <ul className="list-disc list-inside">
                      <li>Infrastructure as Code sécurisée</li>
                      <li>Scanning des templates IaC</li>
                      <li>Pipelines CI/CD sécurisés</li>
                      <li>Configuration as Code</li>
                    </ul>
                  </TableCell>
                  <TableCell className="text-sm text-blue-200">
                    <ul className="list-disc list-inside">
                      <li>Terraform, CloudFormation, ARM</li>
                      <li>Checkov, tfsec, cfn_nag</li>
                      <li>AWS CDK, Pulumi</li>
                      <li>GitOps pour la configuration</li>
                    </ul>
                  </TableCell>
                </TableRow>
                <TableRow className="border-blue-800">
                  <TableCell className="font-medium">Surveillance et visibilité</TableCell>
                  <TableCell className="text-sm text-blue-200">
                    <ul className="list-disc list-inside">
                      <li>Visibilité multi-cloud centralisée</li>
                      <li>Alertes sur anomalies et comportements</li>
                      <li>Détection des mauvaises configurations</li>
                      <li>Inventaire automatisé des actifs cloud</li>
                    </ul>
                  </TableCell>
                  <TableCell className="text-sm text-blue-200">
                    <ul className="list-disc list-inside">
                      <li>CSPM (Cloud Security Posture Management)</li>
                      <li>CWPP (Cloud Workload Protection)</li>
                      <li>CASB (Cloud Access Security Broker)</li>
                      <li>XDR avec intégration cloud</li>
                    </ul>
                  </TableCell>
                </TableRow>
                <TableRow className="border-blue-800">
                  <TableCell className="font-medium">Gestion des compétences</TableCell>
                  <TableCell className="text-sm text-blue-200">
                    <ul className="list-disc list-inside">
                      <li>Formation continue des équipes</li>
                      <li>Certification des membres clés</li>
                      <li>Sensibilisation aux risques spécifiques</li>
                      <li>Collaboration entre équipes cloud et sécurité</li>
                    </ul>
                  </TableCell>
                  <TableCell className="text-sm text-blue-200">
                    <ul className="list-disc list-inside">
                      <li>CCSK (Certificate of Cloud Security Knowledge)</li>
                      <li>Certifications des fournisseurs cloud</li>
                      <li>Labs pratiques et CTFs cloud</li>
                      <li>Modèle Cloud Center of Excellence</li>
                    </ul>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-bold">Plan d'action pour une sécurité cloud efficace</h3>

            <div className="mt-4 space-y-3">
              <ol className="space-y-4">
                <li className="p-3 rounded-md bg-blue-900/20 border border-blue-800">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-700 p-2 rounded-full shrink-0 w-8 h-8 flex items-center justify-center">
                      <span className="text-white font-medium">1</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Évaluation et inventaire</h4>
                      <p className="text-sm text-blue-200 mt-1">
                        Commencez par un inventaire complet de vos actifs cloud et une évaluation de votre posture de sécurité actuelle.
                      </p>
                      <div className="mt-2 text-xs text-green-300">
                        <strong>Actions clés :</strong>
                        <ul className="list-disc list-inside mt-1">
                          <li>Découverte automatisée des ressources cloud</li>
                          <li>Cartographie des données sensibles</li>
                          <li>Analyse des écarts avec les frameworks</li>
                          <li>Évaluation des risques spécifiques</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </li>

                <li className="p-3 rounded-md bg-blue-900/20 border border-blue-800">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-700 p-2 rounded-full shrink-0 w-8 h-8 flex items-center justify-center">
                      <span className="text-white font-medium">2</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Fondations de sécurité</h4>
                      <p className="text-sm text-blue-200 mt-1">
                        Établissez les bases solides pour votre sécurité cloud.
                      </p>
                      <div className="mt-2 text-xs text-green-300">
                        <strong>Actions clés :</strong>
                        <ul className="list-disc list-inside mt-1">
                          <li>Mise en place de IAM robuste avec MFA</li>
                          <li>Sécurisation de tous les comptes racine/administrateur</li>
                          <li>Configuration du chiffrement par défaut</li>
                          <li>Déploiement de la journalisation centralisée</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </li>

                <li className="p-3 rounded-md bg-blue-900/20 border border-blue-800">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-700 p-2 rounded-full shrink-0 w-8 h-8 flex items-center justify-center">
                      <span className="text-white font-medium">3</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Automatisation et standardisation</h4>
                      <p className="text-sm text-blue-200 mt-1">
                        Automatisez vos contrôles de sécurité et standardisez vos configurations.
                      </p>
                      <div className="mt-2 text-xs text-green-300">
                        <strong>Actions clés :</strong>
                        <ul className="list-disc list-inside mt-1">
                          <li>Développement de templates IaC sécurisés</li>
                          <li>Création de politiques cloud enforcer</li>
                          <li>Intégration de la sécurité dans le CI/CD</li>
                          <li>Automatisation des réponses aux incidents</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </li>

                <li className="p-3 rounded-md bg-blue-900/20 border border-blue-800">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-700 p-2 rounded-full shrink-0 w-8 h-8 flex items-center justify-center">
                      <span className="text-white font-medium">4</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Surveillance et amélioration continue</h4>
                      <p className="text-sm text-blue-200 mt-1">
                        Mettez en place une surveillance proactive et un processus d'amélioration continue.
                      </p>
                      <div className="mt-2 text-xs text-green-300">
                        <strong>Actions clés :</strong>
                        <ul className="list-disc list-inside mt-1">
                          <li>Déploiement de solutions CSPM/CWPP</li>
                          <li>Établissement de KPIs et métriques de sécurité</li>
                          <li>Tests réguliers (pentests, tests d'intrusion)</li>
                          <li>Revues périodiques et améliorations</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </li>
              </ol>
            </div>
          </div>

          <div className="mt-8 bg-blue-950 border border-blue-800 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-2 flex items-center">
              <Zap className="mr-2 h-5 w-5 text-blue-400" />
              Points clés à retenir
            </h3>
            <ul className="list-disc list-inside space-y-1 text-blue-200">
              <li>Les cadres et standards spécifiques au cloud fournissent des guides précieux pour structurer votre approche</li>
              <li>La conformité réglementaire dans le cloud nécessite une compréhension fine des responsabilités partagées</li>
              <li>L'automatisation et les approches "as code" sont essentielles pour maintenir la sécurité à l'échelle</li>
              <li>La visibilité et la surveillance continues sont fondamentales face à l'évolution rapide des environnements cloud</li>
              <li>Une approche progressive, en commençant par les fondations, est la clé d'une stratégie de sécurité cloud réussie</li>
            </ul>
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
          {!quizStarted && !quizCompleted ? (
            <div className="text-center py-8">
              <Cloud className="h-16 w-16 mx-auto text-blue-500 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Quiz de validation des connaissances</h2>
              <p className="text-blue-200 mb-6 max-w-lg mx-auto">
                Testez vos connaissances sur la sécurité du cloud avec ce quiz de 5 questions. Vous devez obtenir un score d'au moins 80% pour valider le module.
              </p>
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => setQuizStarted(true)}
              >
                Commencer le quiz
              </Button>
            </div>
          ) : quizStarted && !quizCompleted ? (
            <div className="max-w-2xl mx-auto">
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-blue-300">Question {currentQuestion + 1} sur {questions.length}</span>
                  <span className="text-sm text-blue-300">Score: {score}/{currentQuestion}</span>
                </div>
                <Progress value={(currentQuestion / questions.length) * 100} className="h-2" />
              </div>

              <Card className="bg-blue-900/20 border-blue-800">
                <CardHeader>
                  <CardTitle className="text-xl">{questions[currentQuestion].question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {questions[currentQuestion].options.map((option, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="w-full justify-start text-left py-4 mb-2 border-blue-800 hover:bg-blue-800/30 hover:text-white"
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
                        <div className="flex items-center">
                          <div className="w-6 h-6 rounded-full border border-blue-500 flex items-center justify-center mr-3">
                            {String.fromCharCode(65 + index)}
                          </div>
                          {option}
                        </div>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="mb-6">
                {score >= (questions.length * 0.8) ? (
                  <CheckCircle2 className="h-16 w-16 mx-auto text-green-500 mb-4" />
                ) : (
                  <AlertTriangle className="h-16 w-16 mx-auto text-yellow-500 mb-4" />
                )}

                <h2 className="text-2xl font-bold mb-2">
                  {score >= (questions.length * 0.8) ? "Félicitations!" : "Peut mieux faire..."}
                </h2>

                <p className="text-blue-200 mb-4 max-w-lg mx-auto">
                  {score >= (questions.length * 0.8) 
                    ? `Vous avez obtenu un score de ${score}/${questions.length}. Vous avez validé le module avec succès!` 
                    : `Vous avez obtenu un score de ${score}/${questions.length}. Un score de ${Math.ceil(questions.length * 0.8)}/${questions.length} est nécessaire pour valider le module.`}
                </p>

                {score < (questions.length * 0.8) && (
                  <p className="text-blue-300 mb-6 max-w-lg mx-auto">
                    Nous vous recommandons de revoir le contenu du module avant de retenter le quiz.
                  </p>
                )}

                <div className="flex justify-center gap-4">
                  <Button 
                    variant="outline"
                    className="border-blue-600 text-blue-200"
                    onClick={() => {
                      setQuizStarted(false);
                      setQuizCompleted(false);
                      setCurrentQuestion(0);
                      setScore(0);
                    }}
                  >
                    Recommencer le quiz
                  </Button>

                  <Button 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => setActiveLesson('introduction')}
                  >
                    Retour au contenu
                  </Button>
                </div>
              </div>

              {score >= (questions.length * 0.8) && (
                <Card className="max-w-lg mx-auto mt-8 bg-blue-900/20 border-blue-800">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <GraduationCap className="mr-2 h-5 w-5 text-blue-400" />
                      Votre certificat de réussite
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-4 border border-dashed border-blue-700 rounded-md">
                      <p className="text-sm text-blue-200 mb-1">Ce certificat atteste que</p>
                      <p className="font-bold text-lg mb-1">Participant</p>
                      <p className="text-sm text-blue-200 mb-3">a complété avec succès le module</p>
                      <p className="font-bold text-xl mb-3">Sécurité du cloud</p>
                      <p className="text-sm text-blue-200">avec un score de {score}/{questions.length}</p>
                      <p className="text-xs text-blue-300 mt-3">Date: {new Date().toLocaleDateString()}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </motion.div>
      </div>
    )
  };

  // Calcul de la progression
  const lessonKeys = Object.keys(lessonContent);
  const progressPercentage = (lessonKeys.indexOf(activeLesson) + 1) / lessonKeys.length * 100;

  // Mettre à jour la progression globale
  React.useEffect(() => {
    setProgress(progressPercentage);
  }, [activeLesson, progressPercentage]);

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
          title="Sécurité du cloud"
          subtitle="Protection des environnements et données dans le cloud"
          icon={<Cloud className="h-8 w-8 text-blue-500" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Panneau latéral */}
        <div className="space-y-6">
          <Card className="bg-blue-900/20 border-blue-800">
            <CardHeader>
              <CardTitle>Progression du module</CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Progression</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              <div className="mt-6 space-y-1">
                {lessons.map((lesson) => (
                  <button
                    key={lesson.id}
                    className={`w-full flex items-center p-2 rounded-md transition-colors ${
                      activeLesson === lesson.id 
                        ? 'bg-blue-800/80 text-white' 
                        : 'hover:bg-blue-900/50 text-blue-100'
                    }`}
                    onClick={() => setActiveLesson(lesson.id)}
                  >
                    {lessonKeys.indexOf(lesson.id) < lessonKeys.indexOf(activeLesson) ? (
                      <CheckCircle2 className="h-4 w-4 mr-2 text-blue-400" />
                    ) : activeLesson === lesson.id ? (
                      <PlayCircle className="h-4 w-4 mr-2 text-blue-400" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-blue-500 mr-2"></div>
                    )}
                    <span className="text-sm">{lesson.title}</span>
                  </button>
                ))}
              </div>

              <Separator className="my-6 bg-blue-800/50" />

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-400" />
                  <span className="text-sm text-blue-200">Durée estimée: 5-7h</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-400" />
                  <span className="text-sm text-blue-200">Niveau: Intermédiaire</span>
                </div>
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-blue-400" />
                  <span className="text-sm text-blue-200">Certification disponible</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-900/20 border-blue-800">
            <CardHeader>
              <CardTitle>Ressources complémentaires</CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="space-y-3">
                <a href="#" className="flex items-center gap-2 p-2 rounded-md hover:bg-blue-900/50 transition-colors">
                  <FileText className="h-4 w-4 text-blue-400" />
                  <div>
                    <p className="text-sm font-medium">CCM de la Cloud Security Alliance</p>
                    <p className="text-xs text-blue-300">PDF, 3.1 MB</p>
                  </div>
                </a>
                <a href="#" className="flex items-center gap-2 p-2 rounded-md hover:bg-blue-900/50 transition-colors">
                  <PlayCircle className="h-4 w-4 text-blue-400" />
                  <div>
                    <p className="text-sm font-medium">Vidéo: Zero Trust dans le cloud</p>
                    <p className="text-xs text-blue-300">22 min</p>
                  </div>
                </a>
                <a href="#" className="flex items-center gap-2 p-2 rounded-md hover:bg-blue-900/50 transition-colors">
                  <Globe className="h-4 w-4 text-blue-400" />
                  <div>
                    <p className="text-sm font-medium">CIS Benchmarks pour AWS/Azure/GCP</p>
                    <p className="text-xs text-blue-300">Site web</p>
                  </div>
                </a>
              </div>

              <Button variant="outline" className="w-full mt-4 border-blue-700 text-blue-200">
                Voir toutes les ressources
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Contenu principal */}
        <div className="lg:col-span-3">
          <Card className="bg-blue-900/20 border-blue-800">
            <CardContent className="pt-6 pb-6">
              {lessonContent[activeLesson]}
            </CardContent>
            <CardFooter className="flex justify-between border-t border-blue-800 pt-4">
              <Button 
                variant="outline" 
                disabled={lessonKeys.indexOf(activeLesson) === 0}
                onClick={() => {
                  const currentIndex = lessonKeys.indexOf(activeLesson);
                  if (currentIndex > 0) {
                    setActiveLesson(lessonKeys[currentIndex - 1]);
                  }
                }}
                className="border-blue-700"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Précédent
              </Button>

              <Button 
                disabled={lessonKeys.indexOf(activeLesson) === lessonKeys.length - 1}
                onClick={() => {
                  const currentIndex = lessonKeys.indexOf(activeLesson);
                  if (currentIndex < lessonKeys.length - 1) {
                    setActiveLesson(lessonKeys[currentIndex + 1]);
                  }
                }}
                className="bg-blue-700 hover:bg-blue-800"
              >
                Suivant
                <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}