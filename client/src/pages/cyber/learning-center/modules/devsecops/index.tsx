import React, { useState } from 'react';
import { Link } from 'wouter';
import {
  ArrowLeft,
  Code,
  ShieldCheck,
  Lock,
  FileCode,
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
  Bug,
  GitBranch,
  LayoutGrid,
  RefreshCw,
  Shield,
  Clock,
  Globe,
  Database,
  Share2,
  Workflow,
  Repeat,
  GitPullRequest,
  Infinity,
  Cog,
  Webhook
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

export default function DevSecOpsModule() {
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
    { id: 'introduction', title: 'Introduction au DevSecOps', progress: 0 },
    { id: 'principes', title: 'Principes fondamentaux', progress: 0 },
    { id: 'implementation', title: 'Implémentation pratique', progress: 0 },
    { id: 'outils', title: 'Outils et technologies', progress: 0 },
    { id: 'bonnes-pratiques', title: 'Bonnes pratiques et culture', progress: 0 },
    { id: 'quiz', title: 'Quiz de validation', progress: 0 },
  ];

  // Questions du quiz
  const questions = [
    {
      question: "Quelle est la différence fondamentale entre DevOps et DevSecOps ?",
      options: [
        "DevSecOps utilise uniquement des outils open-source, contrairement à DevOps",
        "DevSecOps intègre la sécurité dès le début du cycle de développement",
        "DevSecOps concerne uniquement les applications cloud, DevOps est pour les applications on-premise",
        "DevSecOps est exclusivement utilisé dans les secteurs hautement réglementés"
      ],
      correctAnswer: 1
    },
    {
      question: "Quelle pratique n'est PAS typique d'une approche DevSecOps ?",
      options: [
        "Intégration des tests de sécurité statiques (SAST) dans les pipelines CI/CD",
        "Révision de sécurité manuelle à la fin du développement uniquement",
        "Analyse des dépendances pour détecter les vulnérabilités",
        "Infrastructure as Code (IaC) avec analyse de sécurité"
      ],
      correctAnswer: 1
    },
    {
      question: "Quel terme désigne la pratique consistant à surveiller les applications en production pour détecter des comportements anormaux ?",
      options: [
        "Runtime Application Self-Protection (RASP)",
        "Dynamic Application Security Testing (DAST)",
        "Fuzzing",
        "Interactive Application Security Testing (IAST)"
      ],
      correctAnswer: 0
    },
    {
      question: "Quel principe DevSecOps traite des vulnérabilités de manière proactive dès leur découverte ?",
      options: [
        "Continuous Integration",
        "Shift Right",
        "Shift Left",
        "Defense in Depth"
      ],
      correctAnswer: 2
    },
    {
      question: "Quelle méthode est utilisée pour vérifier la sécurité des images de conteneurs dans un pipeline DevSecOps ?",
      options: [
        "Unit testing",
        "Container scanning",
        "Behavioral analysis",
        "Penetration testing"
      ],
      correctAnswer: 1
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
                <li>Comprendre les principes fondamentaux du DevSecOps</li>
                <li>Identifier les différences entre DevOps et DevSecOps</li>
                <li>Intégrer la sécurité à chaque étape du cycle de développement</li>
                <li>Mettre en œuvre les outils appropriés dans un pipeline DevSecOps</li>
                <li>Favoriser une culture de responsabilité partagée en matière de sécurité</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="mt-6 space-y-4">
            <h2 className="text-2xl font-bold">Comprendre le DevSecOps</h2>

            <p>
              Le <strong>DevSecOps</strong> est une extension de l'approche DevOps qui intègre la sécurité comme une préoccupation fondamentale tout au long du cycle de développement logiciel, plutôt que comme une considération finale ou un obstacle.
            </p>

            <div className="bg-blue-900/20 border border-blue-800 rounded-md p-4 my-4">
              <h3 className="text-lg font-medium mb-2">Définition</h3>
              <p>
                <strong>DevSecOps</strong> (Development, Security, Operations) est une philosophie et un ensemble de pratiques qui intègrent la sécurité dès le début du cycle de développement logiciel, automatisent les contrôles de sécurité et favorisent une collaboration étroite entre les équipes de développement, de sécurité et d'exploitation.
              </p>
            </div>

            <div className="mt-6">
              <h3 className="text-xl font-bold">L'évolution : de DevOps à DevSecOps</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <Card className="bg-blue-900/20 border-blue-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md flex items-center">
                      <Infinity className="mr-2 h-5 w-5 text-blue-400" />
                      DevOps traditionnel
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-blue-200 mb-2">
                      Focalisation sur la vitesse et l'efficacité du développement.
                    </p>
                    <ul className="list-disc list-inside text-xs text-blue-300">
                      <li>Automatisation du déploiement</li>
                      <li>Intégration et livraison continues</li>
                      <li>Collaboration développement/opérations</li>
                      <li>Cycles de développement rapides</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-blue-900/20 border-blue-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md flex items-center">
                      <Shield className="mr-2 h-5 w-5 text-blue-400" />
                      DevSecOps
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-blue-200 mb-2">
                      Intégration de la sécurité sans sacrifier la vitesse.
                    </p>
                    <ul className="list-disc list-inside text-xs text-blue-300">
                      <li>Sécurité automatisée et intégrée</li>
                      <li>Tests de sécurité continus</li>
                      <li>Collaboration tripartite (dev/sec/ops)</li>
                      <li>Gestion proactive des risques</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-bold">Pourquoi DevSecOps est-il crucial aujourd'hui ?</h3>

              <div className="mt-4 space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-md bg-blue-900/20 border border-blue-800">
                  <div className="bg-blue-700 p-2 rounded-md shrink-0">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium">Évolution du paysage des menaces</h4>
                    <p className="text-sm text-blue-200 mt-1">Les cyberattaques sont de plus en plus sophistiquées et ciblées, nécessitant une approche proactive de la sécurité.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-md bg-blue-900/20 border border-blue-800">
                  <div className="bg-blue-700 p-2 rounded-md shrink-0">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium">Réduction du coût des correctifs</h4>
                    <p className="text-sm text-blue-200 mt-1">Corriger une vulnérabilité en production coûte jusqu'à 100 fois plus cher que si elle avait été détectée en phase de développement.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-md bg-blue-900/20 border border-blue-800">
                  <div className="bg-blue-700 p-2 rounded-md shrink-0">
                    <GitPullRequest className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium">Accélération du développement</h4>
                    <p className="text-sm text-blue-200 mt-1">L'automatisation des tests de sécurité permet de maintenir la vélocité tout en réduisant les risques.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-md bg-blue-900/20 border border-blue-800">
                  <div className="bg-blue-700 p-2 rounded-md shrink-0">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium">Exigences réglementaires</h4>
                    <p className="text-sm text-blue-200 mt-1">De nombreuses réglementations (RGPD, NIS2, etc.) imposent la sécurité dès la conception ("security by design").</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-bold">Le cycle DevSecOps</h3>

              <div className="mt-4 bg-blue-900/20 border border-blue-800 rounded-lg p-4">
                <div className="flex flex-wrap justify-center gap-2 md:gap-4">
                  <div className="text-center p-3 bg-blue-950/50 rounded-lg w-[140px]">
                    <div className="bg-blue-800 rounded-full p-2 mx-auto w-12 h-12 flex items-center justify-center mb-2">
                      <Code className="h-6 w-6 text-blue-200" />
                    </div>
                    <h4 className="text-sm font-medium">Plan & Code</h4>
                    <p className="text-xs text-blue-300 mt-1">Modélisation des menaces, formation sécurité</p>
                  </div>

                  <div className="text-center p-3 bg-blue-950/50 rounded-lg w-[140px]">
                    <div className="bg-blue-800 rounded-full p-2 mx-auto w-12 h-12 flex items-center justify-center mb-2">
                      <GitBranch className="h-6 w-6 text-blue-200" />
                    </div>
                    <h4 className="text-sm font-medium">Build & Test</h4>
                    <p className="text-xs text-blue-300 mt-1">SAST, SCA, tests de composition</p>
                  </div>

                  <div className="text-center p-3 bg-blue-950/50 rounded-lg w-[140px]">
                    <div className="bg-blue-800 rounded-full p-2 mx-auto w-12 h-12 flex items-center justify-center mb-2">
                      <Shield className="h-6 w-6 text-blue-200" />
                    </div>
                    <h4 className="text-sm font-medium">Sécurité</h4>
                    <p className="text-xs text-blue-300 mt-1">DAST, pentest, validation de sécurité</p>
                  </div>

                  <div className="text-center p-3 bg-blue-950/50 rounded-lg w-[140px]">
                    <div className="bg-blue-800 rounded-full p-2 mx-auto w-12 h-12 flex items-center justify-center mb-2">
                      <Server className="h-6 w-6 text-blue-200" />
                    </div>
                    <h4 className="text-sm font-medium">Deploy</h4>
                    <p className="text-xs text-blue-300 mt-1">Sécurité IaC, protection des secrets</p>
                  </div>

                  <div className="text-center p-3 bg-blue-950/50 rounded-lg w-[140px]">
                    <div className="bg-blue-800 rounded-full p-2 mx-auto w-12 h-12 flex items-center justify-center mb-2">
                      <Eye className="h-6 w-6 text-blue-200" />
                    </div>
                    <h4 className="text-sm font-medium">Operate & Monitor</h4>
                    <p className="text-xs text-blue-300 mt-1">RASP, surveillance continue</p>
                  </div>
                </div>

                <div className="flex justify-center mt-4">
                  <div className="bg-blue-800/50 rounded-full px-4 py-2 flex items-center">
                    <RefreshCw className="h-4 w-4 text-blue-300 mr-2" />
                    <span className="text-xs text-blue-300">Amélioration continue</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-blue-950 border border-blue-800 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-2 flex items-center">
              <Zap className="mr-2 h-5 w-5 text-blue-400" />
              Points clés à retenir
            </h3>
            <ul className="list-disc list-inside space-y-1 text-blue-200">
              <li>DevSecOps intègre la sécurité tout au long du cycle de développement, pas seulement à la fin</li>
              <li>Cette approche permet de détecter les vulnérabilités tôt, réduisant considérablement les coûts de correction</li>
              <li>L'automatisation des contrôles de sécurité est essentielle pour maintenir la vélocité</li>
              <li>DevSecOps nécessite une collaboration étroite entre les équipes de développement, sécurité et opérations</li>
              <li>Une culture de responsabilité partagée en matière de sécurité est fondamentale pour réussir</li>
            </ul>
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
          <h2 className="text-2xl font-bold">Principes fondamentaux du DevSecOps</h2>

          <p className="mt-4">
            La démarche DevSecOps repose sur plusieurs principes fondamentaux qui guident son implémentation et assurent son efficacité.
          </p>

          <div className="mt-6">
            <h3 className="text-xl font-bold">Les piliers du DevSecOps</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <Card className="bg-blue-900/20 border-blue-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md flex items-center">
                    <ArrowLeft className="mr-2 h-5 w-5 text-blue-400 rotate-180" />
                    Shift Left Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-blue-200 mb-2">
                    Déplacer les préoccupations de sécurité vers les premières phases du cycle de développement.
                  </p>
                  <div className="text-xs text-blue-300">
                    <strong>Avantages :</strong>
                    <ul className="list-disc list-inside mt-1">
                      <li>Détection précoce des vulnérabilités</li>
                      <li>Réduction du coût des correctifs</li>
                      <li>Sensibilisation des développeurs</li>
                      <li>Amélioration continue de la qualité du code</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-blue-900/20 border-blue-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md flex items-center">
                    <Repeat className="mr-2 h-5 w-5 text-blue-400" />
                    Automatisation continue
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-blue-200 mb-2">
                    Intégrer des tests de sécurité automatisés à chaque étape du pipeline.
                  </p>
                  <div className="text-xs text-blue-300">
                    <strong>Avantages :</strong>
                    <ul className="list-disc list-inside mt-1">
                      <li>Cohérence des contrôles</li>
                      <li>Évolutivité des processus</li>
                      <li>Réduction des erreurs humaines</li>
                      <li>Maintien de la vélocité</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-blue-900/20 border-blue-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md flex items-center">
                    <Users className="mr-2 h-5 w-5 text-blue-400" />
                    Collaboration entre équipes
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-blue-200 mb-2">
                    Favoriser la communication et la collaboration entre développeurs, équipes de sécurité et opérations.
                  </p>
                  <div className="text-xs text-blue-300">
                    <strong>Avantages :</strong>
                    <ul className="list-disc list-inside mt-1">
                      <li>Partage des connaissances</li>
                      <li>Résolution rapide des problèmes</li>
                      <li>Alignement des objectifs</li>
                      <li>Responsabilité partagée</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-bold">La sécurité tout au long du cycle de vie</h3>

            <Card className="bg-blue-900/20 border-blue-800 mt-4">
              <CardContent className="pt-6">
                <Tabs defaultValue="plan">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="plan">Plan</TabsTrigger>
                    <TabsTrigger value="code">Code</TabsTrigger>
                    <TabsTrigger value="build">Build</TabsTrigger>
                    <TabsTrigger value="deploy">Deploy</TabsTrigger>
                    <TabsTrigger value="operate">Operate</TabsTrigger>
                  </TabsList>

                  <TabsContent value="plan" className="p-4 bg-blue-950/30 rounded-md mt-4">
                    <h4 className="font-medium flex items-center">
                      <Lightbulb className="mr-2 h-5 w-5 text-blue-400" />
                      Phase de planification
                    </h4>
                    <p className="mt-2 text-sm text-blue-200">
                      Intégration des considérations de sécurité dès la conception du projet.
                    </p>
                    <div className="mt-3">
                      <p className="text-xs font-medium text-blue-300">Pratiques clés :</p>
                      <ul className="list-disc list-inside mt-1 space-y-1 text-xs text-blue-300">
                        <li><strong>Modélisation des menaces</strong> : Identifier les risques potentiels et les contre-mesures</li>
                        <li><strong>Security User Stories</strong> : Intégrer les exigences de sécurité dans les user stories</li>
                        <li><strong>Architecture sécurisée</strong> : Concevoir avec la sécurité comme principe fondamental</li>
                        <li><strong>Définition des standards</strong> : Établir des normes de sécurité pour le projet</li>
                      </ul>
                    </div>
                    <div className="mt-3">
                      <p className="text-xs font-medium text-green-300">Outils recommandés :</p>
                      <ul className="list-disc list-inside mt-1 space-y-1 text-xs text-green-300">
                        <li>Microsoft Threat Modeling Tool</li>
                        <li>OWASP Threat Dragon</li>
                        <li>STRIDE methodology</li>
                      </ul>
                    </div>
                  </TabsContent>

                  <TabsContent value="code" className="p-4 bg-blue-950/30 rounded-md mt-4">
                    <h4 className="font-medium flex items-center">
                      <Code className="mr-2 h-5 w-5 text-blue-400" />
                      Phase de développement
                    </h4>
                    <p className="mt-2 text-sm text-blue-200">
                      Rédaction de code sécurisé et détection précoce des vulnérabilités.
                    </p>
                    <div className="mt-3">
                      <p className="text-xs font-medium text-blue-300">Pratiques clés :</p>
                      <ul className="list-disc list-inside mt-1 space-y-1 text-xs text-blue-300">
                        <li><strong>Secure Coding Standards</strong> : Bonnes pratiques de développement sécurisé</li>
                        <li><strong>Peer Review</strong> : Revue de code axée sur la sécurité</li>
                        <li><strong>IDE Security Plugins</strong> : Outils d'analyse intégrés aux environnements de développement</li>
                        <li><strong>Pre-commit Hooks</strong> : Vérification automatique avant commit</li>
                      </ul>
                    </div>
                    <div className="mt-3">
                      <p className="text-xs font-medium text-green-300">Outils recommandés :</p>
                      <ul className="list-disc list-inside mt-1 space-y-1 text-xs text-green-300">
                        <li>SonarLint / CodeQL</li>
                        <li>Snyk Code</li>
                        <li>ESLint Security Plugins</li>
                        <li>OWASP CheatSheets</li>
                      </ul>
                    </div>
                  </TabsContent>

                  <TabsContent value="build" className="p-4 bg-blue-950/30 rounded-md mt-4">
                    <h4 className="font-medium flex items-center">
                      <GitBranch className="mr-2 h-5 w-5 text-blue-400" />
                      Phase de construction
                    </h4>
                    <p className="mt-2 text-sm text-blue-200">
                      Analyse approfondie du code et des dépendances lors de l'intégration continue.
                    </p>
                    <div className="mt-3">
                      <p className="text-xs font-medium text-blue-300">Pratiques clés :</p>
                      <ul className="list-disc list-inside mt-1 space-y-1 text-xs text-blue-300">
                        <li><strong>SAST</strong> (Static Application Security Testing) : Analyse statique du code source</li>
                        <li><strong>SCA</strong> (Software Composition Analysis) : Vérification des dépendances</li>
                        <li><strong>Container scanning</strong> : Analyse des vulnérabilités dans les images conteneurs</li>
                        <li><strong>Secret Detection</strong> : Détection des secrets (clés API, tokens, etc.) exposés</li>
                      </ul>
                    </div>
                    <div className="mt-3">
                      <p className="text-xs font-medium text-green-300">Outils recommandés :</p>
                      <ul className="list-disc list-inside mt-1 space-y-1 text-xs text-green-300">
                        <li>SonarQube, Checkmarx, Fortify</li>
                        <li>OWASP Dependency-Check, Snyk, Renovate</li>
                        <li>Trivy, Clair, Anchore</li>
                        <li>GitLeaks, TruffleHog</li>
                      </ul>
                    </div>
                  </TabsContent>

                  <TabsContent value="deploy" className="p-4 bg-blue-950/30 rounded-md mt-4">
                    <h4 className="font-medium flex items-center">
                      <Server className="mr-2 h-5 w-5 text-blue-400" />
                      Phase de déploiement
                    </h4>
                    <p className="mt-2 text-sm text-blue-200">
                      Sécurisation de l'infrastructure et des processus de déploiement.
                    </p>
                    <div className="mt-3">
                      <p className="text-xs font-medium text-blue-300">Pratiques clés :</p>
                      <ul className="list-disc list-inside mt-1 space-y-1 text-xs text-blue-300">
                        <li><strong>DAST</strong> (Dynamic Application Security Testing) : Tests dynamiques sur l'application déployée</li>
                        <li><strong>IaC Security</strong> : Analyse de sécurité de l'infrastructure as code</li>
                        <li><strong>Secure Configuration</strong> : Durcissement des configurations</li>
                        <li><strong>Immutable Infrastructure</strong> : Infrastructure non modifiable après déploiement</li>
                      </ul>
                    </div>
                    <div className="mt-3">
                      <p className="text-xs font-medium text-green-300">Outils recommandés :</p>
                      <ul className="list-disc list-inside mt-1 space-y-1 text-xs text-green-300">
                        <li>OWASP ZAP, Burp Suite</li>
                        <li>Terraform Checkov, tfsec, CloudSploit</li>
                        <li>CIS Benchmarks, OpenSCAP</li>
                        <li>HashiCorp Vault, AWS Secrets Manager</li>
                      </ul>
                    </div>
                  </TabsContent>

                  <TabsContent value="operate" className="p-4 bg-blue-950/30 rounded-md mt-4">
                    <h4 className="font-medium flex items-center">
                      <Eye className="mr-2 h-5 w-5 text-blue-400" />
                      Phase d'exploitation
                    </h4>
                    <p className="mt-2 text-sm text-blue-200">
                      Surveillance continue et réponse aux incidents de sécurité.
                    </p>
                    <div className="mt-3">
                      <p className="text-xs font-medium text-blue-300">Pratiques clés :</p>
                      <ul className="list-disc list-inside mt-1 space-y-1 text-xs text-blue-300">
                        <li><strong>RASP</strong> (Runtime Application Self-Protection) : Protection en temps réel</li>
                        <li><strong>Security Monitoring</strong> : Surveillance continue des applications</li>
                        <li><strong>Vulnerability Management</strong> : Gestion des vulnérabilités en production</li>
                        <li><strong>Incident Response</strong> : Réponse aux incidents de sécurité</li>
                      </ul>
                    </div>
                    <div className="mt-3">
                      <p className="text-xs font-medium text-green-300">Outils recommandés :</p>
                      <ul className="list-disc list-inside mt-1 space-y-1 text-xs text-green-300">
                        <li>Sqreen, Contrast Security</li>
                        <li>Falco, OSSEC, Sysdig</li>
                        <li>Tenable, Qualys, Rapid7</li>
                        <li>PagerDuty, Splunk, ELK Stack</li>
                      </ul>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-bold">Les métriques DevSecOps</h3>

            <p className="mt-2">
              Mesurer l'efficacité de votre démarche DevSecOps est essentiel pour une amélioration continue.
            </p>

            <div className="mt-4 space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-md bg-blue-900/20 border border-blue-800">
                <div className="bg-blue-700 p-2 rounded-md shrink-0">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium">Métriques de vélocité et d'efficacité</h4>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-blue-200">
                    <li>Mean time to remediate (MTTR) les vulnérabilités</li>
                    <li>Pourcentage de problèmes de sécurité détectés "à gauche" vs en production</li>
                    <li>Temps entre la détection et la correction d'une vulnérabilité</li>
                    <li>Impact des contrôles de sécurité sur les temps de déploiement</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-md bg-blue-900/20 border border-blue-800">
                <div className="bg-blue-700 p-2 rounded-md shrink-0">
                  <Bug className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium">Métriques de qualité et risque</h4>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-blue-200">
                    <li>Nombre et sévérité des vulnérabilités détectées par ligne de code</li>
                    <li>Taux de vulnérabilités récurrentes (problèmes systémiques)</li>
                    <li>Pourcentage de conformité aux standards de sécurité</li>
                    <li>Nombre d'incidents de sécurité en production</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-md bg-blue-900/20 border border-blue-800">
                <div className="bg-blue-700 p-2 rounded-md shrink-0">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium">Métriques culturelles et organisationnelles</h4>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-blue-200">
                    <li>Pourcentage de développeurs formés à la sécurité</li>
                    <li>Fréquence des collaborations entre équipes dev et sécurité</li>
                    <li>Participation à des programmes de bug bounty ou CTF</li>
                    <li>Implication des équipes sécurité dans les phases initiales des projets</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-blue-950 border border-blue-800 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-2 flex items-center">
              <Zap className="mr-2 h-5 w-5 text-blue-400" />
              Points clés à retenir
            </h3>
            <ul className="list-disc list-inside space-y-1 text-blue-200">
              <li>Le "Shift Left" est un principe fondamental qui déplace les considérations de sécurité en amont</li>
              <li>L'automatisation des tests de sécurité est essentielle pour maintenir la vélocité DevOps</li>
              <li>Chaque phase du cycle de développement nécessite des pratiques et outils de sécurité spécifiques</li>
              <li>La collaboration entre les équipes dev, sec et ops est un facteur clé de succès</li>
              <li>Les métriques sont indispensables pour mesurer et améliorer continuellement la démarche</li>
            </ul>
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
          <h2 className="text-2xl font-bold">Implémentation pratique du DevSecOps</h2>

          <p className="mt-4">
            Mettre en place une approche DevSecOps efficace nécessite une transformation progressive et méthodique. Voici comment implémenter concrètement ces principes dans votre organisation.
          </p>

          <div className="mt-6">
            <h3 className="text-xl font-bold">Feuille de route d'implémentation</h3>

            <div className="mt-4 relative">
              <div className="absolute top-0 bottom-0 left-[39px] w-1 bg-blue-700"></div>

              <div className="space-y-6">
                <div className="flex gap-6">
                  <div className="relative z-10">
                    <div className="w-20 h-20 rounded-full bg-blue-800 flex items-center justify-center">
                      <span className="text-2xl font-bold">1</span>
                    </div>
                  </div>
                  <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4 flex-1">
                    <h4 className="text-lg font-medium">Évaluation et état des lieux</h4>
                    <div className="mt-2 text-sm text-blue-200 space-y-2">
                      <p>Commencez par évaluer votre maturité actuelle en matière de sécurité et de DevOps.</p>
                      <div className="pl-4 border-l-2 border-blue-700">
                        <p className="font-medium text-blue-300">Actions clés :</p>
                        <ul className="list-disc list-inside mt-1 space-y-1 text-blue-200">
                          <li>Cartographier les processus et outils existants</li>
                          <li>Identifier les lacunes de sécurité dans le cycle de développement</li>
                          <li>Évaluer les compétences des équipes</li>
                          <li>Définir des objectifs mesurables pour la transition</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="relative z-10">
                    <div className="w-20 h-20 rounded-full bg-blue-800 flex items-center justify-center">
                      <span className="text-2xl font-bold">2</span>
                    </div>
                  </div>
                  <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4 flex-1">
                    <h4 className="text-lg font-medium">Préparation et fondations</h4>
                    <div className="mt-2 text-sm text-blue-200 space-y-2">
                      <p>Établissez les bases nécessaires à une implémentation réussie.</p>
                      <div className="pl-4 border-l-2 border-blue-700">
                        <p className="font-medium text-blue-300">Actions clés :</p>
                        <ul className="list-disc list-inside mt-1 space-y-1 text-blue-200">
                          <li>Former les équipes aux principes et pratiques DevSecOps</li>
                          <li>Définir des standards de sécurité et de codage</li>
                          <li>Mettre en place une gouvernance collaborative</li>
                          <li>Sélectionner les outils appropriés à votre contexte</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="relative z-10">
                    <div className="w-20 h-20 rounded-full bg-blue-800 flex items-center justify-center">
                      <span className="text-2xl font-bold">3</span>
                    </div>
                  </div>
                  <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4 flex-1">
                    <h4 className="text-lg font-medium">Implémentation progressive</h4>
                    <div className="mt-2 text-sm text-blue-200 space-y-2">
                      <p>Déployez les pratiques DevSecOps de manière incrémentale.</p>
                      <div className="pl-4 border-l-2 border-blue-700">
                        <p className="font-medium text-blue-300">Actions clés :</p>
                        <ul className="list-disc list-inside mt-1 space-y-1 text-blue-200">
                          <li>Commencer par un projet pilote avec une équipe volontaire</li>
                          <li>Intégrer progressivement des contrôles de sécurité automatisés</li>
                          <li>Documenter les processus et créer des templates réutilisables</li>
                          <li>Valider les résultats avant de généraliser</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="relative z-10">
                    <div className="w-20 h-20 rounded-full bg-blue-800 flex items-center justify-center">
                      <span className="text-2xl font-bold">4</span>
                    </div>
                  </div>
                  <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4 flex-1">
                    <h4 className="text-lg font-medium">Expansion et optimisation</h4>
                    <div className="mt-2 text-sm text-blue-200 space-y-2">
                      <p>Étendez les pratiques et optimisez constamment votre approche.</p>
                      <div className="pl-4 border-l-2 border-blue-700">
                        <p className="font-medium text-blue-300">Actions clés :</p>
                        <ul className="list-disc list-inside mt-1 space-y-1 text-blue-200">
                          <li>Déployer à l'échelle sur d'autres projets et équipes</li>
                          <li>Affiner les processus en fonction des retours d'expérience</li>
                          <li>Mettre en place un centre d'excellence DevSecOps</li>
                          <li>Mesurer et communiquer les bénéfices obtenus</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10">
            <h3 className="text-xl font-bold">Construction d'un pipeline DevSecOps</h3>

            <p className="mt-2">
              Un pipeline CI/CD intégrant la sécurité est au cœur de la démarche DevSecOps. Voici comment le structurer efficacement.
            </p>

            <div className="mt-4 overflow-x-auto">
              <div className="min-w-[800px]">
                <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
                  <div className="flex justify-between">
                    <div className="text-center bg-blue-950/50 p-3 rounded-lg w-[150px]">
                      <GitBranch className="h-6 w-6 mx-auto mb-2 text-blue-400" />
                      <h4 className="text-sm font-medium">Code Commit</h4>
                      <div className="mt-2 space-y-1 text-xs text-blue-300">
                        <div className="bg-blue-900/40 p-1 rounded">Secrets Detection</div>
                        <div className="bg-blue-900/40 p-1 rounded">Pre-commit Hooks</div>
                      </div>
                    </div>

                    <div className="text-center bg-blue-950/50 p-3 rounded-lg w-[150px]">
                      <Code className="h-6 w-6 mx-auto mb-2 text-blue-400" />
                      <h4 className="text-sm font-medium">Build</h4>
                      <div className="mt-2 space-y-1 text-xs text-blue-300">
                        <div className="bg-blue-900/40 p-1 rounded">SAST</div>
                        <div className="bg-blue-900/40 p-1 rounded">SCA</div>
                        <div className="bg-blue-900/40 p-1 rounded">Container Scan</div>
                      </div>
                    </div>

                    <div className="text-center bg-blue-950/50 p-3 rounded-lg w-[150px]">
                      <Cog className="h-6 w-6 mx-auto mb-2 text-blue-400" />
                      <h4 className="text-sm font-medium">Test</h4>
                      <div className="mt-2 space-y-1 text-xs text-blue-300">
                        <div className="bg-blue-900/40 p-1 rounded">DAST</div>
                        <div className="bg-blue-900/40 p-1 rounded">IAST</div>
                        <div className="bg-blue-900/40 p-1 rounded">Fuzzing</div>
                      </div>
                    </div>

                    <div className="text-center bg-blue-950/50 p-3 rounded-lg w-[150px]">
                      <Server className="h-6 w-6 mx-auto mb-2 text-blue-400" />
                      <h4 className="text-sm font-medium">Deploy</h4>
                      <div className="mt-2 space-y-1 text-xs text-blue-300">
                        <div className="bg-blue-900/40 p-1 rounded">IaC Scanning</div>
                        <div className="bg-blue-900/40 p-1 rounded">Compliance Check</div>
                        <div className="bg-blue-900/40 p-1 rounded">Secure Config</div>
                      </div>
                    </div>

                    <div className="text-center bg-blue-950/50 p-3 rounded-lg w-[150px]">
                      <Eye className="h-6 w-6 mx-auto mb-2 text-blue-400" />
                      <h4 className="text-sm font-medium">Monitor</h4>
                      <div className="mt-2 space-y-1 text-xs text-blue-300">
                        <div className="bg-blue-900/40 p-1 rounded">RASP</div>
                        <div className="bg-blue-900/40 p-1 rounded">Threat Detection</div>
                        <div className="bg-blue-900/40 p-1 rounded">Vulnerability Scanning</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-center">
                    <div className="relative px-4 bg-blue-900/30 rounded-lg py-2 flex items-center w-fit">
                      <div className="absolute top-0 bottom-0 left-0 right-0 border-2 border-dashed border-blue-600 rounded-lg"></div>
                      <span className="text-sm text-blue-200 relative z-10">Gates de sécurité automatisés à chaque étape</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm text-blue-300">
                <span className="font-medium">Note importante :</span> Les outils et contrôles spécifiques peuvent varier selon votre contexte technique et vos exigences de sécurité. L'essentiel est de couvrir toutes les phases du cycle avec des contrôles appropriés.
              </p>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-bold">Étude de cas : Transformation DevSecOps</h3>

            <div className="mt-4 bg-blue-900/20 border border-blue-800 rounded-lg p-4">
              <h4 className="text-lg font-medium flex items-center">
                <Zap className="mr-2 h-5 w-5 text-blue-400" />
                Entreprise Financière XYZ
              </h4>

              <div className="mt-3 space-y-4">
                <div>
                  <p className="font-medium text-blue-300">Contexte initial :</p>
                  <ul className="list-disc list-inside mt-1 text-sm text-blue-200">
                    <li>Cycles de développement longs (3-4 mois entre les releases)</li>
                    <li>Tests de sécurité manuels réalisés uniquement en fin de cycle</li>
                    <li>Nombreuses vulnérabilités détectées tardivement</li>
                    <li>Friction entre équipes de développement et de sécurité</li>
                  </ul>
                </div>

                <div>
                  <p className="font-medium text-blue-300">Approche de transformation :</p>
                  <ul className="list-disc list-inside mt-1 text-sm text-blue-200">
                    <li>Formation croisée des équipes (développeurs formés à la sécurité, équipe sécurité initiée au DevOps)</li>
                    <li>Intégration progressive de tests automatisés dans le pipeline CI/CD</li>
                    <li>Création d'une équipe DevSecOps dédiée pour soutenir la transition</li>
                    <li>Mise en place de métriques de sécurité dans les objectifs des équipes</li>
                  </ul>
                </div>

                <div>
                  <p className="font-medium text-blue-300">Résultats obtenus :</p>
                  <ul className="list-disc list-inside mt-1 text-sm text-blue-200">
                    <li>Réduction de 70% du temps de détection des vulnérabilités</li>
                    <li>Diminution de 60% du coût de correction des problèmes de sécurité</li>
                    <li>Cycles de développement réduits à 2-3 semaines</li>
                    <li>Amélioration significative de la collaboration entre équipes</li>
                    <li>Conformité réglementaire plus facile à démontrer</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-blue-950 border border-blue-800 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-2 flex items-center">
              <Zap className="mr-2 h-5 w-5 text-blue-400" />
              Points clés à retenir
            </h3>
            <ul className="list-disc list-inside space-y-1 text-blue-200">
              <li>L'implémentation du DevSecOps est un processus progressif qui nécessite planification et adaptation</li>
              <li>Commencez par un projet pilote avant de généraliser les pratiques</li>
              <li>L'automatisation du pipeline de sécurité est essentielle pour maintenir la vélocité</li>
              <li>Les changements culturels et organisationnels sont aussi importants que les aspects techniques</li>
              <li>Mesurez et communiquez régulièrement les résultats pour maintenir l'engagement</li>
            </ul>
          </div>
        </motion.div>
      </div>
    ),

    outils: (
      <div className="space-y-6">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={contentVariants}
        >
          <h2 className="text-2xl font-bold">Outils et technologies DevSecOps</h2>

          <p className="mt-4">
            Un écosystème d'outils adaptés est essentiel pour mettre en œuvre efficacement les pratiques DevSecOps. Cette section présente les principales catégories d'outils et leur intégration.
          </p>

          <div className="mt-6">
            <h3 className="text-xl font-bold">Panorama des outils DevSecOps</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Card className="bg-blue-900/20 border-blue-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md flex items-center">
                    <Code className="mr-2 h-5 w-5 text-blue-400" />
                    Analyse de code statique (SAST)
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-blue-200 mb-2">
                    Outils qui analysent le code source sans l'exécuter pour détecter les vulnérabilités potentielles.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    <Badge className="bg-blue-700/50">SonarQube</Badge>
                    <Badge className="bg-blue-700/50">Checkmarx</Badge>
                    <Badge className="bg-blue-700/50">Fortify</Badge>
                    <Badge className="bg-blue-700/50">CodeQL</Badge>
                    <Badge className="bg-blue-700/50">Snyk Code</Badge>
                    <Badge className="bg-blue-700/50">Semgrep</Badge>
                  </div>
                  <div className="mt-2 text-xs text-blue-300">
                    <strong>Cas d'usage idéal :</strong> Intégration précoce dans les IDE et les pipelines CI pour détecter les problèmes de code avant leur fusion.
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-blue-900/20 border-blue-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md flex items-center">
                    <Webhook className="mr-2 h-5 w-5 text-blue-400" />
                    Analyse de composition (SCA)
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-blue-200 mb-2">
                    Outils qui analysent les dépendances tierces pour identifier les vulnérabilités connues.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    <Badge className="bg-blue-700/50">OWASP Dependency-Check</Badge>
                    <Badge className="bg-blue-700/50">Snyk</Badge>
                    <Badge className="bg-blue-700/50">WhiteSource</Badge>
                    <Badge className="bg-blue-700/50">Black Duck</Badge>
                    <Badge className="bg-blue-700/50">Renovate</Badge>
                    <Badge className="bg-blue-700/50">Dependabot</Badge>
                  </div>
                  <div className="mt-2 text-xs text-blue-300">
                    <strong>Cas d'usage idéal :</strong> Analyse continue des dépendances dans les projets avec nombreuses bibliothèques externes.
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-blue-900/20 border-blue-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md flex items-center">
                    <Server className="mr-2 h-5 w-5 text-blue-400" />
                    Tests dynamiques (DAST/IAST)
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-blue-200 mb-2">
                    Outils qui testent les applications en cours d'exécution pour découvrir les vulnérabilités.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    <Badge className="bg-blue-700/50">OWASP ZAP</Badge>
                    <Badge className="bg-blue-700/50">Burp Suite</Badge>
                    <Badge className="bg-blue-700/50">Netsparker</Badge>
                    <Badge className="bg-blue-700/50">AppScan</Badge>
                    <Badge className="bg-blue-700/50">Acunetix</Badge>
                    <Badge className="bg-blue-700/50">Contrast Security</Badge>
                  </div>
                  <div className="mt-2 text-xs text-blue-300">
                    <strong>Cas d'usage idéal :</strong> Tests sur les environnements de préproduction pour détecter les vulnérabilités d'exécution.
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-blue-900/20 border-blue-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md flex items-center">
                    <Database className="mr-2 h-5 w-5 text-blue-400" />
                    Analyse d'infrastructure (CSPM/CWPP)
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-blue-200 mb-2">
                    Outils qui analysent et sécurisent l'infrastructure cloud et conteneurisée.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    <Badge className="bg-blue-700/50">Terraform Checkov</Badge>
                    <Badge className="bg-blue-700/50">Prisma Cloud</Badge>
                    <Badge className="bg-blue-700/50">CloudSploit</Badge>
                    <Badge className="bg-blue-700/50">Trivy</Badge>
                    <Badge className="bg-blue-700/50">Clair</Badge>
                    <Badge className="bg-blue-700/50">Aqua Security</Badge>
                  </div>
                  <div className="mt-2 text-xs text-blue-300">
                    <strong>Cas d'usage idéal :</strong> Analyse des configurations IaC et des images conteneurs avant déploiement.
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-blue-900/20 border-blue-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md flex items-center">
                    <Key className="mr-2 h-5 w-5 text-blue-400" />
                    Gestion des secrets
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-blue-200 mb-2">
                    Outils pour sécuriser, gérer et détecter les secrets dans le code et l'infrastructure.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    <Badge className="bg-blue-700/50">HashiCorp Vault</Badge>
                    <Badge className="bg-blue-700/50">AWS Secrets Manager</Badge>
                    <Badge className="bg-blue-700/50">Azure Key Vault</Badge>
                    <Badge className="bg-blue-700/50">GitLeaks</Badge>
                    <Badge className="bg-blue-700/50">TruffleHog</Badge>
                    <Badge className="bg-blue-700/50">git-secrets</Badge>
                  </div>
                  <div className="mt-2 text-xs text-blue-300">
                    <strong>Cas d'usage idéal :</strong> Gestion centralisée des secrets et prévention des fuites dans le code source.
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-blue-900/20 border-blue-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md flex items-center">
                    <Eye className="mr-2 h-5 w-5 text-blue-400" />
                    Surveillance et protection runtime
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-blue-200 mb-2">
                    Outils qui surveillent et protègent les applications en production.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    <Badge className="bg-blue-700/50">Sqreen</Badge>
                    <Badge className="bg-blue-700/50">Contrast Security</Badge>
                    <Badge className="bg-blue-700/50">Sysdig</Badge>
                    <Badge className="bg-blue-700/50">Falco</Badge>
                    <Badge className="bg-blue-700/50">Snyk Monitor</Badge>
                    <Badge className="bg-blue-700/50">Datadog Security</Badge>
                  </div>
                  <div className="mt-2 text-xs text-blue-300">
                    <strong>Cas d'usage idéal :</strong> Protection contre les attaques en temps réel et détection des comportements anormaux.
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-bold">Critères de sélection des outils</h3>

            <p className="mt-2">
              Sélectionner les bons outils pour votre contexte est crucial. Voici les critères principaux à considérer.
            </p>

            <div className="mt-4 space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-md bg-blue-900/20 border border-blue-800">
                <div className="bg-blue-700 p-2 rounded-md shrink-0">
                  <Workflow className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium">Intégration dans le workflow</h4>
                  <p className="text-sm text-blue-200 mt-1">
                    Les outils doivent s'intégrer facilement dans vos pipelines CI/CD existants et ne pas perturber le flux de travail des développeurs.
                  </p>
                  <p className="text-xs text-green-300 mt-2">
                    <strong>Questions à se poser :</strong> L'outil propose-t-il des plugins pour vos systèmes CI/CD ? Peut-il être automatisé via API ? Est-il compatible avec vos environnements de développement ?
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-md bg-blue-900/20 border border-blue-800">
                <div className="bg-blue-700 p-2 rounded-md shrink-0">
                  <AlertTriangle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium">Précision et pertinence</h4>
                  <p className="text-sm text-blue-200 mt-1">
                    L'outil doit minimiser les faux positifs tout en détectant efficacement les vulnérabilités pertinentes pour votre contexte.
                  </p>
                  <p className="text-xs text-green-300 mt-2">
                    <strong>Questions à se poser :</strong> Quel est le taux de faux positifs ? L'outil est-il adapté à vos langages et frameworks ? Permet-il de prioriser les vulnérabilités selon leur criticité ?
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-md bg-blue-900/20 border border-blue-800">
                <div className="bg-blue-700 p-2 rounded-md shrink-0">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium">Utilisabilité et adoption</h4>
                  <p className="text-sm text-blue-200 mt-1">
                    Les outils doivent être accessibles aux développeurs et faciliter leur adoption de bonnes pratiques de sécurité.
                  </p>
                  <p className="text-xs text-green-300 mt-2">
                    <strong>Questions à se poser :</strong> L'interface est-elle intuitive ? Fournit-il des conseils de remédiation clairs ? Permet-il une intégration dans les IDE des développeurs ?
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-md bg-blue-900/20 border border-blue-800">
                <div className="bg-blue-700 p-2 rounded-md shrink-0">
                  <GitPullRequest className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium">Performance et scalabilité</h4>
                  <p className="text-sm text-blue-200 mt-1">
                    Les outils ne doivent pas devenir un goulot d'étranglement dans le pipeline ou ralentir significativement les déploiements.
                  </p>
                  <p className="text-xs text-green-300 mt-2">
                    <strong>Questions à se poser :</strong> Quel est l'impact sur les temps de build ? L'outil peut-il effectuer des analyses incrémentielles ? Comment se comporte-t-il avec de grands volumes de code ?
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-bold">Intégration des outils dans le pipeline</h3>

            <p className="mt-2">
              Voici un exemple concret d'intégration d'outils DevSecOps dans un pipeline CI/CD typique.
            </p>

            <div className="mt-4 bg-blue-900/20 border border-blue-800 rounded-lg p-4">
              <h4 className="text-lg font-medium">Exemple de configuration GitLab CI avec sécurité intégrée</h4>

              <div className="mt-3 bg-blue-950/50 p-3 rounded-lg">
                <pre className="text-xs text-blue-200 whitespace-pre-wrap overflow-x-auto">
{`stages:
  - validate
  - build
  - test
  - security
  - deploy
  - monitor

# Étape de validation
secrets-detection:
  stage: validate
  script:
    - gitleaks detect --source=.
  allow_failure: false

# Étape de build
build:
  stage: build
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - dist/

# Étape de test
unit-tests:
  stage: test
  script:
    - npm test

# Étapes de sécurité
sast:
  stage: security
  script:
    - sonarqube-scanner
  allow_failure: true
  artifacts:
    reports:
      sast: sonar-report.json

dependency-scan:
  stage: security
  script:
    - npm audit
    - snyk test
  allow_failure: true
  artifacts:
    reports:
      dependency: snyk-report.json

container-scan:
  stage: security
  script:
    - trivy image myapp:latest
  allow_failure: true
  artifacts:
    reports:
      container: trivy-report.json

dast:
  stage: security
  script:
    - zap-cli quick-scan --self-contained --start-options "-config api.disablekey=true" http://staging-app
  allow_failure: true
  artifacts:
    reports:
      dast: zap-report.json

# Étape de déploiement avec vérifications de sécurité
deploy:
  stage: deploy
  script:
    - terraform init
    - terraform validate
    - checkov -d terraform/
    - terraform apply -auto-approve
  environment:
    name: production
  only:
    - master
  dependencies:
    - build
    - sast
    - dependency-scan

# Surveillance continue
security-monitoring:
  stage: monitor
  script:
    - deploy-security-monitoring
  environment:
    name: production
  only:
    - master
`}
                </pre>
              </div>

              <div className="mt-3 text-sm text-blue-300">
                <p><strong>Points clés de cette configuration :</strong></p>
                <ul className="list-disc list-inside mt-1">
                  <li>La détection des secrets est un point de contrôle bloquant (allow_failure: false)</li>
                  <li>Les rapports de sécurité sont conservés comme artefacts pour traçabilité</li>
                  <li>Le déploiement dépend explicitement des étapes de sécurité précédentes</li>
                  <li>L'infrastructure est validée avant déploiement (terraform validate, checkov)</li>
                  <li>La surveillance de sécurité est déployée automatiquement après le déploiement</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-blue-950 border border-blue-800 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-2 flex items-center">
              <Zap className="mr-2 h-5 w-5 text-blue-400" />
              Points clés à retenir
            </h3>
            <ul className="list-disc list-inside space-y-1 text-blue-200">
              <li>Sélectionnez des outils qui s'intègrent bien dans votre écosystème technique existant</li>
              <li>Privilégiez l'automatisation complète et l'intégration dans les pipelines CI/CD</li>
              <li>Combinez plusieurs types d'outils pour une couverture complète des risques</li>
              <li>Évaluez l'impact sur la performance et l'expérience développeur</li>
              <li>Commencez avec quelques outils essentiels et étendez progressivement</li>
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
          <h2 className="text-2xl font-bold">Bonnes pratiques et culture DevSecOps</h2>

          <p className="mt-4">
            Au-delà des outils et des processus, le succès d'une approche DevSecOps repose largement sur la culture organisationnelle et l'adoption de bonnes pratiques.
          </p>

          <div className="mt-6">
            <h3 className="text-xl font-bold">Transformer la culture organisationnelle</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Card className="bg-blue-900/20 border-blue-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md flex items-center">
                    <Users className="mr-2 h-5 w-5 text-blue-400" />
                    Responsabilité partagée
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-blue-200 mb-2">
                    La sécurité n'est plus la responsabilité exclusive de l'équipe de sécurité, mais une préoccupation pour tous.
                  </p>
                  <div className="text-xs text-blue-300">
                    <strong>Stratégies d'implémentation :</strong>
                    <ul className="list-disc list-inside mt-1">
                      <li>Inclure des objectifs de sécurité dans les KPIs de toutes les équipes</li>
                      <li>Célébrer les initiatives proactives en matière de sécurité</li>
                      <li>Clarifier les rôles et responsabilités dans la matrice RACI</li>
                      <li>Promouvoir les retours d'expérience cross-fonctionnels</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-blue-900/20 border-blue-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md flex items-center">
                    <Lightbulb className="mr-2 h-5 w-5 text-blue-400" />
                    Formation continue
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-blue-200 mb-2">
                    Investir dans le développement des compétences de sécurité pour toutes les équipes impliquées.
                  </p>
                  <div className="text-xs text-blue-300">
                    <strong>Stratégies d'implémentation :</strong>
                    <ul className="list-disc list-inside mt-1">
                      <li>Former les développeurs aux principes de secure coding</li>
                      <li>Initier les équipes de sécurité au DevOps et à l'automatisation</li>
                      <li>Organiser des ateliers pratiques et des CTFs internes</li>
                      <li>Créer une bibliothèque de ressources et de bonnes pratiques</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-blue-900/20 border-blue-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md flex items-center">
                    <Share2 className="mr-2 h-5 w-5 text-blue-400" />
                    Collaboration et transparence
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-blue-200 mb-2">
                    Briser les silos entre équipes et encourager le partage d'information et la collaboration.
                  </p>
                  <div className="text-xs text-blue-300">
                    <strong>Stratégies d'implémentation :</strong>
                    <ul className="list-disc list-inside mt-1">
                      <li>Organiser des stand-ups multi-équipes réguliers</li>
                      <li>Partager ouvertement les incidents et leurs enseignements</li>
                      <li>Utiliser des outils et plateformes collaboratifs</li>
                      <li>Mettre en place des "security champions" dans chaque équipe</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-blue-900/20 border-blue-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md flex items-center">
                    <RefreshCw className="mr-2 h-5 w-5 text-blue-400" />
                    Amélioration continue
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-blue-200 mb-2">
                    Apprendre constamment et adapter les pratiques en fonction des retours d'expérience.
                  </p>
                  <div className="text-xs text-blue-300">
                    <strong>Stratégies d'implémentation :</strong>
                    <ul className="list-disc list-inside mt-1">
                      <li>Réaliser des post-mortems constructifs (blameless)</li>
                      <li>Mesurer et analyser les métriques de sécurité</li>
                      <li>Revoir périodiquement les processus et les outils</li>
                      <li>Encourager l'expérimentation et l'innovation</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-bold">Bonnes pratiques techniques</h3>

            <div className="mt-4 space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-md bg-blue-900/20 border border-blue-800">
                <div className="bg-blue-700 p-2 rounded-md shrink-0">
                  <Code className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium">Secure Coding Standards</h4>
                  <p className="text-sm text-blue-200 mt-1">
                    Établissez et respectez des normes de codage sécurisé adaptées à vos technologies.
                  </p>
                  <div className="mt-2">
                    <div className="text-xs text-green-300">
                      <strong>Recommandations :</strong>
                      <ul className="list-disc list-inside mt-1">
                        <li>Créez un guide de codage sécurisé spécifique à votre contexte</li>
                        <li>Utilisez les ressources OWASP (cheat sheets, guides) comme référence</li>
                        <li>Automatisez la vérification des standards via des linters</li>
                        <li>Intégrez les standards dans les revues de code</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-md bg-blue-900/20 border border-blue-800">
                <div className="bg-blue-700 p-2 rounded-md shrink-0">
                  <Lock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium">Gestion des secrets et configurations</h4>
                  <p className="text-sm text-blue-200 mt-1">
                    Protégez efficacement les informations sensibles dans le code et l'infrastructure.
                  </p>
                  <div className="mt-2">
                    <div className="text-xs text-green-300">
                      <strong>Recommandations :</strong>
                      <ul className="list-disc list-inside mt-1">
                        <li>Utilisez un coffre-fort de secrets centralisé (HashiCorp Vault, AWS Secrets Manager)</li>
                        <li>Ne stockez jamais de secrets en clair dans le code ou les configurations</li>
                        <li>Mettez en place la rotation automatique des secrets</li>
                        <li>Utilisez des hooks pre-commit pour éviter les fuites de secrets</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-md bg-blue-900/20 border border-blue-800">
                <div className="bg-blue-700 p-2 rounded-md shrink-0">
                  <Server className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium">Infrastructure as Code sécurisée</h4>
                  <p className="text-sm text-blue-200 mt-1">
                    Appliquez les principes de sécurité à votre infrastructure définie par code.
                  </p>
                  <div className="mt-2">
                    <div className="text-xs text-green-300">
                      <strong>Recommandations :</strong>
                      <ul className="list-disc list-inside mt-1">
                        <li>Utilisez des modules et templates durcis pré-validés</li>
                        <li>Intégrez des analyses de sécurité IaC dans les pipelines CI/CD</li>
                        <li>Versionnez et revuez les modifications d'infrastructure comme du code</li>
                        <li>Maintenez une documentation sur les choix d'architecture sécurisée</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-md bg-blue-900/20 border border-blue-800">
                <div className="bg-blue-700 p-2 rounded-md shrink-0">
                  <Bug className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium">Gestion des vulnérabilités</h4>
                  <p className="text-sm text-blue-200 mt-1">
                    Établissez un processus efficace pour traiter les vulnérabilités tout au long du cycle de vie.
                  </p>
                  <div className="mt-2">
                    <div className="text-xs text-green-300">
                      <strong>Recommandations :</strong>
                      <ul className="list-disc list-inside mt-1">
                        <li>Définissez une politique claire de priorisation des vulnérabilités</li>
                        <li>Établissez des SLAs pour la correction selon la criticité</li>
                        <li>Centralisez le suivi des vulnérabilités dans un outil dédié</li>
                        <li>Automatisez la génération de tickets pour les vulnérabilités détectées</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-bold">Patterns de maturité DevSecOps</h3>

            <p className="mt-2">
              La maturité DevSecOps se développe généralement selon un modèle progressif. Identifiez à quel niveau se situe votre organisation.
            </p>

            <div className="mt-4 bg-blue-900/20 border border-blue-800 rounded-lg p-4 overflow-x-auto">
              <div className="min-w-[800px]">
                <Table>
                  <TableHeader className="bg-blue-900/50">
                    <TableRow className="border-blue-800">
                      <TableHead className="text-blue-100">Niveau</TableHead>
                      <TableHead className="text-blue-100">Caractéristiques</TableHead>
                      <TableHead className="text-blue-100">Prochaines étapes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="border-blue-800">
                      <TableCell className="font-medium">
                        <Badge className="bg-red-700/50">Niveau 1: Initial</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-blue-200">
                        <ul className="list-disc list-inside">
                          <li>Sécurité essentiellement manuelle et réactive</li>
                          <li>Tests de sécurité réalisés en fin de cycle</li>
                          <li>Silos marqués entre équipes</li>
                          <li>Peu d'automatisation</li>
                        </ul>
                      </TableCell>
                      <TableCell className="text-sm text-blue-200">
                        <ul className="list-disc list-inside">
                          <li>Sensibiliser sur l'approche DevSecOps</li>
                          <li>Initier la formation des développeurs</li>
                          <li>Identifier les possibilités d'automatisation</li>
                          <li>Impliquer l'équipe sécurité plus tôt</li>
                        </ul>
                      </TableCell>
                    </TableRow>
                    <TableRow className="border-blue-800">
                      <TableCell className="font-medium">
                        <Badge className="bg-orange-600/50">Niveau 2: Répétable</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-blue-200">
                        <ul className="list-disc list-inside">
                          <li>Quelques tests de sécurité automatisés</li>
                          <li>Début d'intégration dans le CI/CD</li>
                          <li>Standards de sécurité documentés</li>
                          <li>Collaboration émergente entre équipes</li>
                        </ul>
                      </TableCell>
                      <TableCell className="text-sm text-blue-200">
                        <ul className="list-disc list-inside">
                          <li>Étendre l'automatisation à plus d'étapes</li>
                          <li>Standardiser les processus</li>
                          <li>Mettre en place des security champions</li>
                          <li>Définir des métriques de sécurité</li>
                        </ul>
                      </TableCell>
                    </TableRow>
                    <TableRow className="border-blue-800">
                      <TableCell className="font-medium">
                        <Badge className="bg-yellow-600/50">Niveau 3: Défini</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-blue-200">
                        <ul className="list-disc list-inside">
                          <li>Intégration de la sécurité dans le pipeline CI/CD</li>
                          <li>Couverture complète des tests de sécurité</li>
                          <li>Processus formalisés et suivis</li>
                          <li>Collaboration régulière entre équipes</li>
                        </ul>
                      </TableCell>
                      <TableCell className="text-sm text-blue-200">
                        <ul className="list-disc list-inside">
                          <li>Automatiser la remédiation quand possible</li>
                          <li>Renforcer la culture DevSecOps</li>
                          <li>Mettre en place de l'analyse continue</li>
                          <li>Optimiser les performances des pipelines</li>
                        </ul>
                      </TableCell>
                    </TableRow>
                    <TableRow className="border-blue-800">
                      <TableCell className="font-medium">
                        <Badge className="bg-green-600/50">Niveau 4: Géré</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-blue-200">
                        <ul className="list-disc list-inside">
                          <li>Sécurité pleinement automatisée et intégrée</li>
                          <li>Métriques utilisées pour l'amélioration</li>
                          <li>Équipes collaboratives et transversales</li>
                          <li>Remédiation proactive et optimisée</li>
                        </ul>
                      </TableCell>
                      <TableCell className="text-sm text-blue-200">
                        <ul className="list-disc list-inside">
                          <li>Affiner en continu les processus</li>
                          <li>Exploiter l'intelligence artificielle/ML</li>
                          <li>Partager les connaissances en externe</li>
                          <li>Innover dans les approches de sécurité</li>
                        </ul>
                      </TableCell>
                    </TableRow>
                    <TableRow className="border-blue-800">
                      <TableCell className="font-medium">
                        <Badge className="bg-blue-600/50">Niveau 5: Optimisé</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-blue-200">
                        <ul className="list-disc list-inside">
                          <li>Sécurité intégrée par conception (security by design)</li>
                          <li>Amélioration continue basée sur les données</li>
                          <li>Culture DevSecOps mature et innovante</li>
                          <li>Adaptation rapide aux nouvelles menaces</li>
                        </ul>
                      </TableCell>
                      <TableCell className="text-sm text-blue-200">
                        <ul className="list-disc list-inside">
                          <li>Contribuer aux communautés DevSecOps</li>
                          <li>Explorer des approches de pointe</li>
                          <li>Anticiper les tendances émergentes</li>
                          <li>Servir de modèle dans l'industrie</li>
                        </ul>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-bold">Défis courants et solutions</h3>

            <div className="mt-4 space-y-3">
              <div className="p-3 rounded-md bg-blue-900/20 border border-blue-800">
                <h4 className="font-medium flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5 text-yellow-500" />
                  Résistance au changement
                </h4>
                <p className="text-sm text-blue-200 mt-1">
                  Les équipes peuvent être réticentes à modifier leurs habitudes de travail et à assumer de nouvelles responsabilités.
                </p>
                <div className="mt-2">
                  <p className="text-xs font-medium text-green-300">Solutions :</p>
                  <ul className="list-disc list-inside mt-1 space-y-1 text-xs text-green-300">
                    <li>Impliquer les équipes dès le début dans la définition de l'approche</li>
                    <li>Démontrer les bénéfices concrets avec des projets pilotes</li>
                    <li>Fournir des ressources et du temps pour la montée en compétence</li>
                    <li>Reconnaître et valoriser les efforts d'adaptation</li>
                  </ul>
                </div>
              </div>

              <div className="p-3 rounded-md bg-blue-900/20 border border-blue-800">
                <h4 className="font-medium flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5 text-yellow-500" />
                  Faux positifs et fatigue des alertes
                </h4>
                <p className="text-sm text-blue-200 mt-1">
                  Un trop grand nombre d'alertes, en particulier des faux positifs, peut démotiver les équipes et réduire l'efficacité des contrôles.
                </p>
                <div className="mt-2">
                  <p className="text-xs font-medium text-green-300">Solutions :</p>
                  <ul className="list-disc list-inside mt-1 space-y-1 text-xs text-green-300">
                    <li>Affiner les règles et seuils de détection pour réduire les faux positifs</li>
                    <li>Implémenter un système de priorisation des alertes basé sur le risque</li>
                    <li>Automatiser le filtrage et la corrélation des alertes</li>
                    <li>Permettre aux développeurs de marquer les faux positifs avec justification</li>
                  </ul>
                </div>
              </div>

              <div className="p-3 rounded-md bg-blue-900/20 border border-blue-800">
                <h4 className="font-medium flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5 text-yellow-500" />
                  Pression sur les délais de livraison
                </h4>
                <p className="text-sm text-blue-200 mt-1">
                  La pression pour livrer rapidement peut conduire à négliger ou contourner les contrôles de sécurité.
                </p>
                <div className="mt-2">
                  <p className="text-xs font-medium text-green-300">Solutions :</p>
                  <ul className="list-disc list-inside mt-1 space-y-1 text-xs text-green-300">
                    <li>Intégrer la sécurité dans la définition de "fini" (DoD)</li>
                    <li>Optimiser les pipelines pour minimiser l'impact sur les délais</li>
                    <li>Mettre en place des "fast paths" pour les correctifs critiques avec contrôles adaptés</li>
                    <li>Éduquer les parties prenantes sur les risques du contournement des contrôles</li>
                  </ul>
                </div>
              </div>

              <div className="p-3 rounded-md bg-blue-900/20 border border-blue-800">
                <h4 className="font-medium flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5 text-yellow-500" />
                  Manque de compétences spécialisées
                </h4>
                <p className="text-sm text-blue-200 mt-1">
                  Les compétences en sécurité peuvent être rares, limitant la capacité à mettre en œuvre efficacement le DevSecOps.
                </p>
                <div className="mt-2">
                  <p className="text-xs font-medium text-green-300">Solutions :</p>
                  <ul className="list-disc list-inside mt-1 space-y-1 text-xs text-green-300">
                    <li>Investir dans la formation interne et la montée en compétences</li>
                    <li>Créer des parcours de développement pour les security champions</li>
                    <li>Utiliser des ressources externes (consulting, formation) pour combler les lacunes</li>
                    <li>Exploiter des plateformes "security as a service" pour certaines fonctions</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-blue-950 border border-blue-800 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-2 flex items-center">
              <Zap className="mr-2 h-5 w-5 text-blue-400" />
              Points clés à retenir
            </h3>
            <ul className="list-disc list-inside space-y-1 text-blue-200">
              <li>La culture DevSecOps repose sur la responsabilité partagée, la collaboration et l'amélioration continue</li>
              <li>L'adoption des bonnes pratiques doit être encouragée et facilitée, pas imposée</li>
              <li>La maturité DevSecOps se développe progressivement, pas du jour au lendemain</li>
              <li>La gestion du changement est aussi importante que les aspects techniques</li>
              <li>La mesure et l'évaluation permettent d'identifier les opportunités d'amélioration</li>
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
              <Shield className="h-16 w-16 mx-auto text-blue-500 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Quiz de validation des connaissances</h2>
              <p className="text-blue-200 mb-6 max-w-lg mx-auto">
                Testez vos connaissances sur le DevSecOps avec ce quiz de 5 questions. Vous devez obtenir un score d'au moins 80% pour valider le module.
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
                      <p className="font-bold text-xl mb-3">DevSecOps</p>
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
          title="DevSecOps"
          subtitle="Intégration de la sécurité dans le cycle de développement"
          icon={<Code className="h-8 w-8 text-blue-500" />}
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
                  <span className="text-sm text-blue-200">Durée estimée: 6-8h</span>
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
                    <p className="text-sm font-medium">Guide OWASP DevSecOps</p>
                    <p className="text-xs text-blue-300">PDF, 3.2 MB</p>
                  </div>
                </a>
                <a href="#" className="flex items-center gap-2 p-2 rounded-md hover:bg-blue-900/50 transition-colors">
                  <PlayCircle className="h-4 w-4 text-blue-400" />
                  <div>
                    <p className="text-sm font-medium">Vidéo: Construction d'un pipeline</p>
                    <p className="text-xs text-blue-300">25 min</p>
                  </div>
                </a>
                <a href="#" className="flex items-center gap-2 p-2 rounded-md hover:bg-blue-900/50 transition-colors">
                  <Globe className="h-4 w-4 text-blue-400" />
                  <div>
                    <p className="text-sm font-medium">DevSecOps Maturity Model</p>
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