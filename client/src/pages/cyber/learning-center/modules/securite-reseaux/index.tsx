import React, { useState } from 'react';
import { Link } from 'wouter';
import {
  ArrowLeft,
  Server,
  Shield,
  Network,
  Wifi,
  Lock,
  Globe,
  AlertTriangle,
  CheckCircle2,
  PlayCircle,
  Lightbulb,
  Zap,
  FileWarning,
  Layers,
  Users,
  Clock,
  Eye,
  Cpu,
  Radio,
  SearchCode,
  Fingerprint,
  ShieldAlert,
  Webhook,
  Router,
  FileText,
  GraduationCap,
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

export default function SecuriteReseauxModule() {
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
    { id: 'introduction', title: 'Introduction à la sécurité des réseaux', progress: 0 },
    { id: 'architecture', title: 'Architecture réseau sécurisée', progress: 0 },
    { id: 'detection', title: 'Détection des intrusions', progress: 0 },
    { id: 'securisation', title: 'Sécurisation des infrastructures', progress: 0 },
    { id: 'bonnes-pratiques', title: 'Bonnes pratiques et outils', progress: 0 },
    { id: 'quiz', title: 'Quiz de validation', progress: 0 },
  ];

  // Questions du quiz
  const questions = [
    {
      question: "Quelle technologie n'est PAS principalement associée à la sécurité périmétrique ?",
      options: [
        "Firewall de nouvelle génération (NGFW)",
        "Système de détection d'intrusion (IDS)",
        "Protocole HTTPS",
        "Passerelle VPN"
      ],
      correctAnswer: 2
    },
    {
      question: "Quelle est la principale différence entre un IDS et un IPS ?",
      options: [
        "Un IDS détecte les menaces tandis qu'un IPS les bloque activement",
        "Un IDS fonctionne au niveau application tandis qu'un IPS au niveau réseau",
        "Un IDS utilise des signatures tandis qu'un IPS utilise l'IA",
        "Un IDS est logiciel tandis qu'un IPS est matériel"
      ],
      correctAnswer: 0
    },
    {
      question: "Quelle technique permet de segmenter un réseau en zones de sécurité distinctes ?",
      options: [
        "Network Address Translation (NAT)",
        "Tunneling VPN",
        "Virtual Local Area Networks (VLANs)",
        "Dynamic Host Configuration Protocol (DHCP)"
      ],
      correctAnswer: 2
    },
    {
      question: "Qu'est-ce que le principe de défense en profondeur dans la sécurité réseau ?",
      options: [
        "Concentrer toutes les mesures de sécurité au niveau du firewall d'entrée",
        "Mettre en place plusieurs couches de sécurité complémentaires",
        "Utiliser uniquement des solutions open-source pour la sécurité",
        "Déléguer entièrement la sécurité à un fournisseur externe"
      ],
      correctAnswer: 1
    },
    {
      question: "Quelle technologie est utilisée pour sécuriser les communications sans fil d'entreprise ?",
      options: [
        "WEP (Wired Equivalent Privacy)",
        "SSH (Secure Shell)",
        "WPA2-Enterprise avec 802.1X",
        "SSL (Secure Sockets Layer)"
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
                <li>Comprendre les principes fondamentaux de la sécurité des réseaux</li>
                <li>Identifier les différents composants d'une architecture réseau sécurisée</li>
                <li>Connaître les principales menaces réseau et leurs mécanismes</li>
                <li>Maîtriser les techniques de détection et prévention des intrusions</li>
                <li>Appliquer les bonnes pratiques de sécurisation des infrastructures réseau</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="mt-6 space-y-4">
            <h2 className="text-2xl font-bold">Comprendre la sécurité des réseaux</h2>

            <p>
              La <strong>sécurité des réseaux</strong> englobe l'ensemble des politiques, pratiques et technologies visant à protéger l'intégrité, la confidentialité et la disponibilité des infrastructures de communication et des données qu'elles transportent.
            </p>

            <div className="bg-blue-900/20 border border-blue-800 rounded-md p-4 my-4">
              <h3 className="text-lg font-medium mb-2">Définition</h3>
              <p>
                La <strong>sécurité des réseaux</strong> comprend l'ensemble des mesures destinées à protéger l'infrastructure réseau contre les accès non autorisés, les modifications, les détournements ou les perturbations de service, en assurant la confidentialité, l'intégrité et la disponibilité des communications et des données.
              </p>
            </div>

            <div className="mt-6">
              <h3 className="text-xl font-bold">Pourquoi la sécurité réseau est-elle critique ?</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <Card className="bg-blue-900/20 border-blue-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md flex items-center">
                      <Globe className="mr-2 h-5 w-5 text-blue-400" />
                      Connectivité omniprésente
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-blue-200">
                      Avec l'interconnexion croissante des systèmes et l'adoption massive du cloud, les réseaux sont devenus le tissu conjonctif de toute l'infrastructure numérique.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-blue-900/20 border-blue-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md flex items-center">
                      <ShieldAlert className="mr-2 h-5 w-5 text-blue-400" />
                      Surface d'attaque étendue
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-blue-200">
                      L'expansion des réseaux (cloud, IoT, télétravail) multiplie les points d'entrée potentiels pour les attaquants.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-blue-900/20 border-blue-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md flex items-center">
                      <Zap className="mr-2 h-5 w-5 text-blue-400" />
                      Sophistication des attaques
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-blue-200">
                      Les cyberattaques évoluent en complexité, utilisant des techniques avancées pour contourner les défenses traditionnelles.
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
                      Les exigences légales (RGPD, NIS2, etc.) imposent des obligations strictes en matière de protection des infrastructures et des données.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-bold">Les principaux composants de la sécurité réseau</h3>

              <div className="mt-4 space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-md bg-blue-900/20 border border-blue-800">
                  <div className="bg-blue-700 p-2 rounded-md shrink-0">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium">Sécurité périmétrique</h4>
                    <p className="text-sm text-blue-200 mt-1">Protection des frontières du réseau contre les menaces externes. Inclut les firewalls, proxys, passerelles VPN, etc.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-md bg-blue-900/20 border border-blue-800">
                  <div className="bg-blue-700 p-2 rounded-md shrink-0">
                    <Eye className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium">Détection et prévention</h4>
                    <p className="text-sm text-blue-200 mt-1">Systèmes visant à identifier et bloquer les comportements malveillants. Comprend les IDS/IPS, sondes réseau, etc.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-md bg-blue-900/20 border border-blue-800">
                  <div className="bg-blue-700 p-2 rounded-md shrink-0">
                    <Lock className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium">Sécurisation des communications</h4>
                    <p className="text-sm text-blue-200 mt-1">Protection des données en transit via chiffrement et tunneling. Inclut les protocoles SSL/TLS, IPSec, HTTPS, etc.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-md bg-blue-900/20 border border-blue-800">
                  <div className="bg-blue-700 p-2 rounded-md shrink-0">
                    <Layers className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium">Segmentation et isolation</h4>
                    <p className="text-sm text-blue-200 mt-1">Compartimentage du réseau pour limiter la propagation des menaces. Utilise les VLANs, zones de sécurité, microsegmentation, etc.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-md bg-blue-900/20 border border-blue-800">
                  <div className="bg-blue-700 p-2 rounded-md shrink-0">
                    <Fingerprint className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium">Contrôle d'accès réseau</h4>
                    <p className="text-sm text-blue-200 mt-1">Gestion des autorisations de connexion au réseau. Inclut l'authentification 802.1X, NAC, etc.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-bold">Panorama des menaces réseau</h3>

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
                    <TableCell className="font-medium">Reconnaissance et scanning</TableCell>
                    <TableCell className="text-sm text-blue-200">Exploration des réseaux pour identifier les points d'entrée potentiels</TableCell>
                    <TableCell className="text-sm text-blue-200">Exposition des vulnérabilités et services</TableCell>
                  </TableRow>
                  <TableRow className="border-blue-800">
                    <TableCell className="font-medium">Attaques par déni de service (DoS/DDoS)</TableCell>
                    <TableCell className="text-sm text-blue-200">Submersion des ressources réseau pour rendre les services indisponibles</TableCell>
                    <TableCell className="text-sm text-blue-200">Interruption des services, pertes financières</TableCell>
                  </TableRow>
                  <TableRow className="border-blue-800">
                    <TableCell className="font-medium">Man-in-the-Middle</TableCell>
                    <TableCell className="text-sm text-blue-200">Interception des communications réseau</TableCell>
                    <TableCell className="text-sm text-blue-200">Vol de données, manipulation de trafic</TableCell>
                  </TableRow>
                  <TableRow className="border-blue-800">
                    <TableCell className="font-medium">Mouvement latéral</TableCell>
                    <TableCell className="text-sm text-blue-200">Propagation d'une infection à travers le réseau interne</TableCell>
                    <TableCell className="text-sm text-blue-200">Compromission étendue des systèmes</TableCell>
                  </TableRow>
                  <TableRow className="border-blue-800">
                    <TableCell className="font-medium">Exfiltration de données</TableCell>
                    <TableCell className="text-sm text-blue-200">Extraction non autorisée de données via le réseau</TableCell>
                    <TableCell className="text-sm text-blue-200">Fuites de données sensibles</TableCell>
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
              <li>La sécurité réseau est une composante fondamentale d'une stratégie de cybersécurité globale</li>
              <li>Une approche multicouche est essentielle pour créer une défense efficace</li>
              <li>Les menaces réseau évoluent constamment, nécessitant une veille et une adaptation continues</li>
              <li>Les mesures de sécurité doivent couvrir à la fois les communications internes et externes</li>
              <li>La combinaison de technologies, processus et sensibilisation est nécessaire pour une protection optimale</li>
            </ul>
          </div>
        </motion.div>
      </div>
    ),

    architecture: (
      <div className="space-y-6">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={contentVariants}
        >
          <h2 className="text-2xl font-bold">Architecture réseau sécurisée</h2>

          <p className="mt-4">
            Une architecture réseau sécurisée est fondamentale pour protéger les actifs informatiques d'une organisation. Elle doit être conçue selon plusieurs principes directeurs et intégrer divers niveaux de protection.
          </p>

          <div className="mt-6">
            <h3 className="text-xl font-bold">Principes de conception sécurisée</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Card className="bg-blue-900/20 border-blue-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md flex items-center">
                    <Layers className="mr-2 h-5 w-5 text-blue-400" />
                    Défense en profondeur
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-blue-200">
                    Implémentation de multiples couches de sécurité complémentaires. Si une couche échoue, les autres continuent d'assurer la protection.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-blue-900/20 border-blue-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md flex items-center">
                    <Lock className="mr-2 h-5 w-5 text-blue-400" />
                    Moindre privilège
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-blue-200">
                    Limitation des accès réseau au strict nécessaire pour chaque système et utilisateur.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-blue-900/20 border-blue-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md flex items-center">
                    <Webhook className="mr-2 h-5 w-5 text-blue-400" />
                    Segmentation
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-blue-200">
                    Division du réseau en zones distinctes pour isoler les systèmes selon leur niveau de sensibilité et leur fonction.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-blue-900/20 border-blue-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md flex items-center">
                    <Eye className="mr-2 h-5 w-5 text-blue-400" />
                    Visibilité
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-blue-200">
                    Capacité à surveiller et auditer l'ensemble du trafic réseau pour détecter les anomalies.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-bold">Modèles d'architecture réseau sécurisée</h3>

            <Card className="bg-blue-900/20 border-blue-800 mt-4">
              <CardContent className="pt-6">
                <Tabs defaultValue="traditional">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="traditional">Architecture traditionnelle</TabsTrigger>
                    <TabsTrigger value="modern">Architecture moderne</TabsTrigger>
                    <TabsTrigger value="sdn">Réseaux définis par logiciel</TabsTrigger>
                  </TabsList>
                  <TabsContent value="traditional" className="p-4 bg-blue-950/30 rounded-md mt-4">
                    <h4 className="font-medium flex items-center">
                      <Router className="mr-2 h-5 w-5 text-blue-400" />
                      Architecture à zones démilitarisées (DMZ)
                    </h4>
                    <p className="mt-2 text-sm text-blue-200">
                      Modèle classique avec séparation claire entre Internet, DMZ et réseau interne à l'aide de pare-feux.
                    </p>
                    <div className="mt-3">
                      <p className="text-xs font-medium">Caractéristiques :</p>
                      <ul className="list-disc list-inside mt-1 space-y-1 text-xs text-blue-300">
                        <li>Pare-feu périmétriques en cascade</li>
                        <li>DMZ pour les services exposés (web, mail, DNS)</li>
                        <li>Segmentation basique par VLANs</li>
                        <li>Systèmes de détection d'intrusion centralisés</li>
                      </ul>
                    </div>
                  </TabsContent>
                  <TabsContent value="modern" className="p-4 bg-blue-950/30 rounded-md mt-4">
                    <h4 className="font-medium flex items-center">
                      <Shield className="mr-2 h-5 w-5 text-blue-400" />
                      Architecture Zero Trust
                    </h4>
                    <p className="mt-2 text-sm text-blue-200">
                      Modèle sans confiance implicite, basé sur une vérification continue de chaque connexion, indépendamment de sa provenance.
                    </p>
                    <div className="mt-3">
                      <p className="text-xs font-medium">Caractéristiques :</p>
                      <ul className="list-disc list-inside mt-1 space-y-1 text-xs text-blue-300">
                        <li>Micro-segmentation avancée</li>
                        <li>Authentification et autorisation continues</li>
                        <li>Contrôle d'accès basé sur l'identité</li>
                        <li>Chiffrement omniprésent</li>
                        <li>Visibilité et analytique avancées</li>
                      </ul>
                    </div>
                  </TabsContent>
                  <TabsContent value="sdn" className="p-4 bg-blue-950/30 rounded-md mt-4">
                    <h4 className="font-medium flex items-center">
                      <Cpu className="mr-2 h-5 w-5 text-blue-400" />
                      Software-Defined Networking (SDN)
                    </h4>
                    <p className="mt-2 text-sm text-blue-200">
                      Architecture où la logique de contrôle réseau est séparée du matériel sous-jacent et programmable via logiciel.
                    </p>
                    <div className="mt-3">
                      <p className="text-xs font-medium">Caractéristiques :</p>
                      <ul className="list-disc list-inside mt-1 space-y-1 text-xs text-blue-300">
                        <li>Séparation du plan de contrôle et du plan de données</li>
                        <li>Orchestration centralisée des politiques de sécurité</li>
                        <li>Adaptation dynamique aux menaces</li>
                        <li>Micro-segmentation programmable</li>
                        <li>Intégration avec l'infrastructure cloud</li>
                      </ul>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-bold">Composants essentiels d'une architecture sécurisée</h3>

            <div className="mt-4 space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-md bg-blue-900/20 border border-blue-800">
                <div className="bg-blue-700 p-2 rounded-md shrink-0">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium">Pare-feu nouvelle génération (NGFW)</h4>
                  <p className="text-sm text-blue-200 mt-1">Dispositifs combinant filtrage traditionnel avec inspection applicative, prévention d'intrusion et analyse de contenu.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-md bg-blue-900/20 border border-blue-800">
                <div className="bg-blue-700 p-2 rounded-md shrink-0">
                  <Eye className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium">Systèmes de prévention d'intrusion (IPS)</h4>
                  <p className="text-sm text-blue-200 mt-1">Solutions qui analysent activement le trafic réseau pour détecter et bloquer les attaques en temps réel.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-md bg-blue-900/20 border border-blue-800">
                <div className="bg-blue-700 p-2 rounded-md shrink-0">
                  <Webhook className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium">Solutions de micro-segmentation</h4>
                  <p className="text-sm text-blue-200 mt-1">Technologies permettant une segmentation fine du réseau, limitant le mouvement latéral des attaquants.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-md bg-blue-900/20 border border-blue-800">
                <div className="bg-blue-700 p-2 rounded-md shrink-0">
                  <Lock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium">VPN et tunnels sécurisés</h4>
                  <p className="text-sm text-blue-200 mt-1">Solutions de chiffrement pour protéger les communications à travers des réseaux non sécurisés.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-md bg-blue-900/20 border border-blue-800">
                <div className="bg-blue-700 p-2 rounded-md shrink-0">
                  <Fingerprint className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium">Contrôle d'accès réseau (NAC)</h4>
                  <p className="text-sm text-blue-200 mt-1">Systèmes vérifiant la conformité des appareils avant de leur permettre d'accéder au réseau.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-md bg-blue-900/20 border border-blue-800">
                <div className="bg-blue-700 p-2 rounded-md shrink-0">
                  <SearchCode className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium">Systèmes d'analyse comportementale (NBA/UEBA)</h4>
                  <p className="text-sm text-blue-200 mt-1">Solutions avancées détectant les anomalies de comportement sur le réseau.</p>
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
              <li>Une architecture réseau sécurisée doit mettre en œuvre le principe de défense en profondeur</li>
              <li>La segmentation est cruciale pour contenir les menaces et limiter leur propagation</li>
              <li>L'évolution vers le modèle Zero Trust répond aux défis des environnements hybrides modernes</li>
              <li>La visibilité complète du trafic est essentielle pour une détection efficace des menaces</li>
              <li>La sécurité doit être intégrée dès la conception de l'architecture réseau</li>
            </ul>
          </div>
        </motion.div>
      </div>
    ),

    detection: (
      <div className="space-y-6">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={contentVariants}
        >
          <h2 className="text-2xl font-bold">Détection des intrusions</h2>
          <p className="mt-4">
            La détection des intrusions est un élément essentiel d'une stratégie de cybersécurité efficace, permettant d'identifier les activités malveillantes sur le réseau et d'y répondre rapidement.
          </p>

          <div className="mt-6">
            <h3 className="text-xl font-bold">Systèmes de détection et prévention</h3>

            <Card className="bg-blue-900/20 border-blue-800 mt-4">
              <CardContent className="pt-6">
                <Tabs defaultValue="ids">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="ids">IDS</TabsTrigger>
                    <TabsTrigger value="ips">IPS</TabsTrigger>
                    <TabsTrigger value="ndr">NDR</TabsTrigger>
                  </TabsList>
                  <TabsContent value="ids" className="p-4 bg-blue-950/30 rounded-md mt-4">
                    <h4 className="font-medium flex items-center">
                      <Eye className="mr-2 h-5 w-5 text-blue-400" />
                      Système de détection d'intrusion (IDS)
                    </h4>
                    <p className="mt-2 text-sm text-blue-200">
                      Système passif qui surveille le trafic réseau pour identifier les activités suspectes ou les violations de politique.
                    </p>
                    <div className="mt-3">
                      <p className="text-xs font-medium">Types d'IDS :</p>
                      <ul className="list-disc list-inside mt-1 space-y-1 text-xs text-blue-300">
                        <li><strong>NIDS</strong> (Network-based IDS) : Analyse le trafic à des points stratégiques du réseau</li>
                        <li><strong>HIDS</strong> (Host-based IDS) : Surveille l'activité et l'intégrité du système sur un hôte spécifique</li>
                      </ul>
                    </div>
                    <div className="mt-3">
                      <p className="text-xs font-medium">Méthodes de détection :</p>
                      <ul className="list-disc list-inside mt-1 space-y-1 text-xs text-blue-300">
                        <li><strong>Basée sur les signatures</strong> : Compare le trafic à des motifs d'attaques connues</li>
                        <li><strong>Basée sur les anomalies</strong> : Détecte les écarts par rapport au comportement normal</li>
                        <li><strong>Basée sur les heuristiques</strong> : Utilise des règles et algorithmes pour identifier les comportements suspects</li>
                      </ul>
                    </div>
                  </TabsContent>
                  <TabsContent value="ips" className="p-4 bg-blue-950/30 rounded-md mt-4">
                    <h4 className="font-medium flex items-center">
                      <Shield className="mr-2 h-5 w-5 text-blue-400" />
                      Système de prévention d'intrusion (IPS)
                    </h4>
                    <p className="mt-2 text-sm text-blue-200">
                      Système actif qui non seulement détecte les activités malveillantes, mais prend également des mesures pour les bloquer en temps réel.
                    </p>
                    <div className="mt-3">
                      <p className="text-xs font-medium">Capacités :</p>
                      <ul className="list-disc list-inside mt-1 space-y-1 text-xs text-blue-300">
                        <li>Blocage automatique des attaques identifiées</li>
                        <li>Terminaison des sessions suspectes</li>
                        <li>Reconfiguration des équipements réseau (pare-feux, routeurs)</li>
                        <li>Décontamination de contenu malveillant</li>
                      </ul>
                    </div>
                    <div className="mt-3">
                      <p className="text-xs font-medium">Déploiements :</p>
                      <ul className="list-disc list-inside mt-1 space-y-1 text-xs text-blue-300">
                        <li><strong>IPS en ligne</strong> : Placé directement sur le chemin du trafic pour inspection et blocage</li>
                        <li><strong>IPS en parallèle</strong> : Reçoit une copie du trafic et peut injecter des paquets de terminaison</li>
                        <li><strong>IPS virtuel</strong> : Déployé dans des environnements virtualisés ou cloud</li>
                      </ul>
                    </div>
                  </TabsContent>
                  <TabsContent value="ndr" className="p-4 bg-blue-950/30 rounded-md mt-4">
                    <h4 className="font-medium flex items-center">
                      <SearchCode className="mr-2 h-5 w-5 text-blue-400" />
                      Network Detection and Response (NDR)
                    </h4>
                    <p className="mt-2 text-sm text-blue-200">
                      Solution avancée combinant détection, analyse comportementale et réponse automatisée pour identifier et neutraliser les menaces complexes.
                    </p>
                    <div className="mt-3">
                      <p className="text-xs font-medium">Caractéristiques :</p>
                      <ul className="list-disc list-inside mt-1 space-y-1 text-xs text-blue-300">
                        <li>Analyse comportementale basée sur l'IA et le machine learning</li>
                        <li>Détection des menaces avancées et persistantes (APT)</li>
                        <li>Corrélation entre multiples sources de données</li>
                        <li>Capacités forensiques approfondies</li>
                        <li>Orchestration et automatisation des réponses</li>
                      </ul>
                    </div>
                    <div className="mt-3">
                      <p className="text-xs font-medium">Avantages par rapport aux IDS/IPS traditionnels :</p>
                      <ul className="list-disc list-inside mt-1 space-y-1 text-xs text-green-300">
                        <li>Détection des menaces sans signature (zero-day)</li>
                        <li>Réduction des faux positifs grâce à l'IA</li>
                        <li>Visibilité sur le trafic chiffré</li>
                        <li>Intégration native avec les plateformes SOAR et SIEM</li>
                      </ul>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-bold">Approches et techniques de détection</h3>

            <div className="mt-4 space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-md bg-blue-900/20 border border-blue-800">
                <div className="bg-blue-700 p-2 rounded-md shrink-0">
                  <SearchCode className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium">Détection basée sur les signatures</h4>
                  <p className="text-sm text-blue-200 mt-1">Utilise des motifs précis d'attaques connues pour identifier les menaces.</p>
                  <div className="flex items-center mt-2">
                    <div className="text-xs text-green-300 flex-1">
                      <span className="font-medium">Forces :</span> Précision élevée, faible taux de faux positifs, facile à implémenter
                    </div>
                    <div className="text-xs text-red-300 flex-1">
                      <span className="font-medium">Faiblesses :</span> Inefficace contre les attaques inconnues, nécessite des mises à jour fréquentes
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-md bg-blue-900/20 border border-blue-800">
                <div className="bg-blue-700 p-2 rounded-md shrink-0">
                  <Network className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium">Détection basée sur les anomalies</h4>
                  <p className="text-sm text-blue-200 mt-1">Établit un profil de comportement normal et détecte les écarts significatifs.</p>
                  <div className="flex items-center mt-2">
                    <div className="text-xs text-green-300 flex-1">
                      <span className="font-medium">Forces :</span> Détection d'attaques inconnues, adaptation aux spécificités du réseau
                    </div>
                    <div className="text-xs text-red-300 flex-1">
                      <span className="font-medium">Faiblesses :</span> Faux positifs plus fréquents, période d'apprentissage nécessaire
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-md bg-blue-900/20 border border-blue-800">
                <div className="bg-blue-700 p-2 rounded-md shrink-0">
                  <Cpu className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium">Analyse comportementale (UEBA)</h4>
                  <p className="text-sm text-blue-200 mt-1">Utilise l'IA et le machine learning pour modéliser et analyser le comportement des utilisateurs et entités.</p>
                  <div className="flex items-center mt-2">
                    <div className="text-xs text-green-300 flex-1">
                      <span className="font-medium">Forces :</span> Détection de menaces sophistiquées, réduction des faux positifs, analyse contextuelle
                    </div>
                    <div className="text-xs text-red-300 flex-1">
                      <span className="font-medium">Faiblesses :</span> Complexité d'implémentation, investissement initial important
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-md bg-blue-900/20 border border-blue-800">
                <div className="bg-blue-700 p-2 rounded-md shrink-0">
                  <Radio className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium">Honeypots et leurres</h4>
                  <p className="text-sm text-blue-200 mt-1">Systèmes délibérément vulnérables conçus pour attirer les attaquants et étudier leurs techniques.</p>
                  <div className="flex items-center mt-2">
                    <div className="text-xs text-green-300 flex-1">
                      <span className="font-medium">Forces :</span> Détection précoce, faux positifs quasi inexistants, intelligence sur les attaquants
                    </div>
                    <div className="text-xs text-red-300 flex-1">
                      <span className="font-medium">Faiblesses :</span> Couverture limitée, nécessite une expertise pour l'analyse
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-bold">Indicateurs de compromission (IOC)</h3>

            <p className="mt-2">
              Les IOC sont des artefacts ou observations qui indiquent avec une forte probabilité qu'un système a été compromis ou est ciblé par une attaque.
            </p>

            <Table className="mt-4 border-blue-800">
              <TableHeader className="bg-blue-900/50">
                <TableRow className="border-blue-800">
                  <TableHead className="text-blue-100">Type d'IOC</TableHead>
                  <TableHead className="text-blue-100">Exemples</TableHead>
                  <TableHead className="text-blue-100">Méthode de détection</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="border-blue-800">
                  <TableCell className="font-medium">Réseau</TableCell>
                  <TableCell className="text-sm text-blue-200">
                    <ul className="list-disc list-inside">
                      <li>IP/domaines malveillants</li>
                      <li>Communications C2 suspectes</li>
                      <li>Modèles de trafic anormaux</li>
                      <li>Requêtes DNS inhabituelles</li>
                    </ul>
                  </TableCell>
                  <TableCell className="text-sm text-blue-200">
                    <ul className="list-disc list-inside">
                      <li>Analyse de flux réseau</li>
                      <li>Surveillance DNS</li>
                      <li>Inspection du trafic TLS</li>
                      <li>Détection d'anomalies</li>
                    </ul>
                  </TableCell>
                </TableRow>
                <TableRow className="border-blue-800">
                  <TableCell className="font-medium">Système</TableCell>
                  <TableCell className="text-sm text-blue-200">
                    <ul className="list-disc list-inside">
                      <li>Fichiers malveillants</li>
                      <li>Modifications du registre</li>
                      <li>Processus suspects</li>
                      <li>Modifications de configuration</li>
                    </ul>
                  </TableCell>
                  <TableCell className="text-sm text-blue-200">
                    <ul className="list-disc list-inside">
                      <li>Surveillance de l'intégrité</li>
                      <li>Analyse comportementale</li>
                      <li>Anti-malware</li>
                      <li>EDR (Endpoint Detection & Response)</li>
                    </ul>
                  </TableCell>
                </TableRow>
                <TableRow className="border-blue-800">
                  <TableCell className="font-medium">Application</TableCell>
                  <TableCell className="text-sm text-blue-200">
                    <ul className="list-disc list-inside">
                      <li>Signatures d'exploitation</li>
                      <li>Activité anormale de l'API</li>
                      <li>Injections de code</li>
                      <li>Modifications non autorisées</li>
                    </ul>
                  </TableCell>
                  <TableCell className="text-sm text-blue-200">
                    <ul className="list-disc list-inside">
                      <li>WAF (Web Application Firewall)</li>
                      <li>RASP (Runtime Application Self-Protection)</li>
                      <li>Journalisation d'applications</li>
                      <li>Analyse statique et dynamique</li>
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
              <li>Combiner plusieurs méthodes de détection offre une protection plus complète</li>
              <li>Les solutions modernes (NDR) intègrent l'IA pour détecter les menaces avancées</li>
              <li>La visibilité du trafic chiffré devient essentielle avec l'adoption massive du HTTPS</li>
              <li>La détection doit être accompagnée de capacités de réponse pour être efficace</li>
              <li>Réduire les faux positifs est aussi important que détecter les vraies menaces</li>
            </ul>
          </div>
        </motion.div>
      </div>
    ),

    securisation: (
      <div className="space-y-6">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={contentVariants}
        >
          <h2 className="text-2xl font-bold">Sécurisation des infrastructures</h2>

          <p className="mt-4">
            La sécurisation des infrastructures réseau nécessite une approche méthodique, couvrant tous les niveaux du réseau et intégrant diverses mesures de protection.
          </p>

          <div className="mt-6">
            <h3 className="text-xl font-bold">Sécurisation par couche réseau</h3>

            <Card className="bg-blue-900/20 border-blue-800 mt-4">
              <CardContent className="pt-6">
                <Tabs defaultValue="physical">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="physical">Couche Physique</TabsTrigger>
                    <TabsTrigger value="network">Couche Réseau</TabsTrigger>
                    <TabsTrigger value="transport">Couche Transport</TabsTrigger>
                    <TabsTrigger value="application">Couche Application</TabsTrigger>
                  </TabsList>

                  <TabsContent value="physical" className="p-4 bg-blue-950/30 rounded-md mt-4">
                    <h4 className="font-medium flex items-center">
                      <Server className="mr-2 h-5 w-5 text-blue-400" />
                      Couche Physique et Liaison de données
                    </h4>
                    <p className="mt-2 text-sm text-blue-200">
                      Protection des équipements matériels et des communications de base.
                    </p>
                    <div className="mt-3">
                      <p className="text-xs font-medium">Mesures de sécurité :</p>
                      <ul className="list-disc list-inside mt-1 space-y-1 text-xs text-blue-300">
                        <li>Sécurité physique des locaux et équipements (accès contrôlé)</li>
                        <li>Protection contre les écoutes électromagnétiques</li>
                        <li>Sécurisation des ports réseau non utilisés</li>
                        <li>Mise en œuvre de 802.1X pour l'authentification au niveau port</li>
                        <li>MAC filtering et Dynamic ARP Inspection</li>
                        <li>Sécurisation des protocoles de découverte (LLDP, CDP)</li>
                      </ul>
                    </div>
                  </TabsContent>

                  <TabsContent value="network" className="p-4 bg-blue-950/30 rounded-md mt-4">
                    <h4 className="font-medium flex items-center">
                      <Network className="mr-2 h-5 w-5 text-blue-400" />
                      Couche Réseau
                    </h4>
                    <p className="mt-2 text-sm text-blue-200">
                      Protection du routage et de l'adressage IP.
                    </p>
                    <div className="mt-3">
                      <p className="text-xs font-medium">Mesures de sécurité :</p>
                      <ul className="list-disc list-inside mt-1 space-y-1 text-xs text-blue-300">
                        <li>Filtrage IP avec ACLs et pare-feux</li>
                        <li>Sécurisation des protocoles de routage (BGP, OSPF, EIGRP)</li>
                        <li>Protection contre le spoofing et les attaques MITM</li>
                        <li>Mise en œuvre d'IPsec pour le chiffrement du trafic IP</li>
                        <li>Segmentation réseau via VLANs et zones de sécurité</li>
                        <li>Protection contre les attaques de fragmentation IP</li>
                      </ul>
                    </div>
                  </TabsContent>

                  <TabsContent value="transport" className="p-4 bg-blue-950/30 rounded-md mt-4">
                    <h4 className="font-medium flex items-center">
                      <Lock className="mr-2 h-5 w-5 text-blue-400" />
                      Couche Transport
                    </h4>
                    <p className="mt-2 text-sm text-blue-200">
                      Protection des communications de bout en bout.
                    </p>
                    <div className="mt-3">
                      <p className="text-xs font-medium">Mesures de sécurité :</p>
                      <ul className="list-disc list-inside mt-1 space-y-1 text-xs text-blue-300">
                        <li>Filtrage par état (stateful inspection) des connexions TCP/UDP</li>
                        <li>Protection contre les attaques SYN Flood et DDoS</li>
                        <li>Mise en œuvre de TLS pour le chiffrement des sessions</li>
                        <li>Vérification des certificats et de la chaîne de confiance</li>
                        <li>Gestion des timeouts et de la terminaison des sessions</li>
                        <li>Limitation du débit (rate limiting) pour prévenir les abus</li>
                      </ul>
                    </div>
                  </TabsContent>

                  <TabsContent value="application" className="p-4 bg-blue-950/30 rounded-md mt-4">
                    <h4 className="font-medium flex items-center">
                      <Globe className="mr-2 h-5 w-5 text-blue-400" />
                      Couche Application
                    </h4>
                    <p className="mt-2 text-sm text-blue-200">
                      Protection des services et applications réseau.
                    </p>
                    <div className="mt-3">
                      <p className="text-xs font-medium">Mesures de sécurité :</p>
                      <ul className="list-disc list-inside mt-1 space-y-1 text-xs text-blue-300">
                        <li>Pare-feux applicatifs (WAF) pour les applications web</li>
                        <li>Filtrage des contenus et protection DLP</li>
                        <li>Protection contre les injections et attaques XSS</li>
                        <li>Authentification et autorisation applicatives</li>
                        <li>Filtrage DNS et protection contre le DNS hijacking</li>
                        <li>Sécurisation des API et des services web</li>
                      </ul>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-bold">Sécurisation des équipements réseau</h3>

            <div className="mt-4 space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-md bg-blue-900/20 border border-blue-800">
                <div className="bg-blue-700 p-2 rounded-md shrink-0">
                  <Router className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium">Routeurs et commutateurs</h4>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-blue-200">
                    <li>Désactivation des services et protocoles inutilisés</li>
                    <li>Mise à jour régulière du firmware</li>
                    <li>Gestion sécurisée (SSH, HTTPS) et suppression des accès par défaut</li>
                    <li>Configuration des fonctionnalités de sécurité (port security, DHCP snooping)</li>
                    <li>Mise en œuvre de l'authentification pour les protocoles de routage</li>
                    <li>Séparation des plans de contrôle et de données</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-md bg-blue-900/20 border border-blue-800">
                <div className="bg-blue-700 p-2 rounded-md shrink-0">
                  <Wifi className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium">Infrastructures sans fil</h4>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-blue-200">
                    <li>Configuration du chiffrement WPA3 ou WPA2-Enterprise avec 802.1X</li>
                    <li>Séparation du trafic invité et corporate</li>
                    <li>Protection contre le rogue access points et les attaques d'Evil Twin</li>
                    <li>Utilisation de l'isolation client (client isolation)</li>
                    <li>Configuration de la gestion des clés et rotation automatique</li>
                    <li>Déploiement de solutions WIPS (Wireless Intrusion Prevention System)</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-md bg-blue-900/20 border border-blue-800">
                <div className="bg-blue-700 p-2 rounded-md shrink-0">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium">Pare-feux et dispositifs de sécurité</h4>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-blue-200">
                    <li>Configuration des règles selon le principe du moindre privilège</li>
                    <li>Mise en œuvre de l'inspection approfondie des paquets (DPI)</li>
                    <li>Activation des fonctionnalités avancées (anti-malware, anti-bot, etc.)</li>
                    <li>Configuration de la haute disponibilité</li>
                    <li>Monitoring et archivage des journaux d'activité</li>
                    <li>Maintenance régulière et gestion des règles obsolètes</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-bold">Durcissement des protocoles réseau</h3>

            <Table className="mt-4 border-blue-800">
              <TableHeader className="bg-blue-900/50">
                <TableRow className="border-blue-800">
                  <TableHead className="text-blue-100">Protocole</TableHead>
                  <TableHead className="text-blue-100">Vulnérabilités courantes</TableHead>
                  <TableHead className="text-blue-100">Mesures de durcissement</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="border-blue-800">
                  <TableCell className="font-medium">DNS</TableCell>
                  <TableCell className="text-sm text-blue-200">
                    <ul className="list-disc list-inside">
                      <li>Cache poisoning</li>
                      <li>Zone transfers non autorisés</li>
                      <li>DNS tunneling</li>
                      <li>Amplification DDoS</li>
                    </ul>
                  </TableCell>
                  <TableCell className="text-sm text-blue-200">
                    <ul className="list-disc list-inside">
                      <li>Implémentation de DNSSEC</li>
                      <li>Restriction des zone transfers</li>
                      <li>Filtrage DNS et rate limiting</li>
                      <li>Surveillance des requêtes anormales</li>
                    </ul>
                  </TableCell>
                </TableRow>
                <TableRow className="border-blue-800">
                  <TableCell className="font-medium">HTTP/HTTPS</TableCell>
                  <TableCell className="text-sm text-blue-200">
                    <ul className="list-disc list-inside">
                      <li>Attaques XSS et CSRF</li>
                      <li>Injections diverses</li>
                      <li>Cookie hijacking</li>
                      <li>TLS downgrade</li>
                    </ul>
                  </TableCell>
                  <TableCell className="text-sm text-blue-200">
                    <ul className="list-disc list-inside">
                      <li>Configuration TLS sécurisée</li>
                      <li>En-têtes HTTP de sécurité</li>
                      <li>HTTP Strict Transport Security</li>
                      <li>Filtrage applicatif avec WAF</li>
                    </ul>
                  </TableCell>
                </TableRow>
                <TableRow className="border-blue-800">
                  <TableCell className="font-medium">SNMP</TableCell>
                  <TableCell className="text-sm text-blue-200">
                    <ul className="list-disc list-inside">
                      <li>Communautés par défaut</li>
                      <li>Accès non autorisé</li>
                      <li>Information disclosure</li>
                      <li>Brute force des credentials</li>
                    </ul>
                  </TableCell>
                  <TableCell className="text-sm text-blue-200">
                    <ul className="list-disc list-inside">
                      <li>Utilisation de SNMPv3 avec authentification</li>
                      <li>Restriction des accès par ACL</li>
                      <li>Modification des communautés par défaut</li>
                      <li>Limitation des informations accessibles</li>
                    </ul>
                  </TableCell>
                </TableRow>
                <TableRow className="border-blue-800">
                  <TableCell className="font-medium">SMB/CIFS</TableCell>
                  <TableCell className="text-sm text-blue-200">
                    <ul className="list-disc list-inside">
                      <li>Versions obsolètes et vulnérables</li>
                      <li>Partages exposés</li>
                      <li>Relaying d'authentification</li>
                      <li>Propagation de malware</li>
                    </ul>
                  </TableCell>
                  <TableCell className="text-sm text-blue-200">
                    <ul className="list-disc list-inside">
                      <li>Désactivation de SMBv1</li>
                      <li>Activation du chiffrement SMB</li>
                      <li>Restriction des partages et permissions</li>
                      <li>Blocage du trafic SMB aux frontières du réseau</li>
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
              <li>La sécurisation doit être appliquée à toutes les couches du modèle OSI</li>
              <li>Le durcissement des équipements réseau est aussi important que la sécurisation du trafic</li>
              <li>Les configurations par défaut sont généralement insuffisantes en termes de sécurité</li>
              <li>La maintenance continue (mises à jour, revue des configurations) est essentielle</li>
              <li>La documentation des configurations de sécurité facilite l'audit et la conformité</li>
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
          <h2 className="text-2xl font-bold">Bonnes pratiques et outils</h2>

          <p className="mt-4">
            L'implémentation efficace de la sécurité réseau repose sur l'adoption de bonnes pratiques et l'utilisation d'outils adaptés.
          </p>

          <div className="mt-6">
            <h3 className="text-xl font-bold">Bonnes pratiques de sécurité réseau</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Card className="bg-blue-900/20 border-blue-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md flex items-center">
                    <Layers className="mr-2 h-5 w-5 text-blue-400" />
                    Défense en profondeur
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-blue-200 mb-2">
                    Déploiement de multiples couches de protection complémentaires.
                  </p>
                  <ul className="list-disc list-inside text-xs text-blue-300 space-y-1">
                    <li>Combiner sécurité périmétrique, segmentation et protection des points terminaux</li>
                    <li>Employer des technologies complémentaires (signatures, heuristiques, comportemental)</li>
                    <li>Mettre en place des contrôles préventifs, détectifs et correctifs</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-blue-900/20 border-blue-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md flex items-center">
                    <Lock className="mr-2 h-5 w-5 text-blue-400" />
                    Moindre privilège
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-blue-200 mb-2">
                    Limitation des accès au minimum nécessaire.
                  </p>
                  <ul className="list-disc list-inside text-xs text-blue-300 space-y-1">
                    <li>Appliquer des règles de pare-feu restrictives par défaut</li>
                    <li>Limiter l'accès administratif aux équipements réseau</li>
                    <li>Restreindre les communications entre zones selon les besoins</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-blue-900/20 border-blue-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md flex items-center">
                    <Webhook className="mr-2 h-5 w-5 text-blue-400" />
                    Segmentation et isolation
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-blue-200 mb-2">
                    Division du réseau en zones distinctes avec contrôle des flux.
                  </p>
                  <ul className="list-disc list-inside text-xs text-blue-300 space-y-1">
                    <li>Créer des segments selon la sensibilité et la fonction</li>
                    <li>Implémenter des pare-feux entre segments</li>
                    <li>Appliquer une micro-segmentation pour les ressources sensibles</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-blue-900/20 border-blue-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md flex items-center">
                    <Eye className="mr-2 h-5 w-5 text-blue-400" />
                    Visibilité et surveillance
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-blue-200 mb-2">
                    Maintien d'une vision claire des activités réseau.
                  </p>
                  <ul className="list-disc list-inside text-xs text-blue-300 space-y-1">
                    <li>Centraliser la collecte et l'analyse des journaux (SIEM)</li>
                    <li>Mettre en place des sondes et capteurs à des points stratégiques</li>
                    <li>Établir des lignes de base pour détecter les anomalies</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-blue-900/20 border-blue-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md flex items-center">
                    <Shield className="mr-2 h-5 w-5 text-blue-400" />
                    Durcissement des configurations
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-blue-200 mb-2">
                    Renforcement de la sécurité des équipements et protocoles.
                  </p>
                  <ul className="list-disc list-inside text-xs text-blue-300 space-y-1">
                    <li>Appliquer des configurations sécurisées (benchmarks CIS, NIST)</li>
                    <li>Désactiver les services, ports et protocoles non essentiels</li>
                    <li>Remplacer les paramètres par défaut (identifiants, communautés)</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-blue-900/20 border-blue-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md flex items-center">
                    <RefreshCw className="mr-2 h-5 w-5 text-blue-400" />
                    Maintenance continue
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-blue-200 mb-2">
                    Processus continu d'amélioration et de mise à jour.
                  </p>
                  <ul className="list-disc list-inside text-xs text-blue-300 space-y-1">
                    <li>Mettre à jour régulièrement les firmwares et logiciels</li>
                    <li>Effectuer des audits et tests de pénétration périodiques</li>
                    <li>Réviser et optimiser les règles et configurations</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-bold">Outils essentiels de sécurité réseau</h3>

            <div className="mt-4 space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-md bg-blue-900/20 border border-blue-800">
                <div className="bg-blue-700 p-2 rounded-md shrink-0">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium">Protection</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                    <div>
                      <p className="text-xs font-medium text-blue-300">Solutions</p>
                      <ul className="list-disc list-inside mt-1 text-xs text-blue-200 space-y-1">
                        <li>NGFW (Next Generation Firewalls)</li>
                        <li>WAF (Web Application Firewalls)</li>
                        <li>Secure Web Gateways</li>
                        <li>NAC (Network Access Control)</li>
                        <li>VPN (Virtual Private Networks)</li>
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-blue-300">Exemples d'outils</p>
                      <ul className="list-disc list-inside mt-1 text-xs text-blue-200 space-y-1">
                        <li>Palo Alto Networks, Fortinet, Cisco</li>
                        <li>F5 BIG-IP, Cloudflare WAF</li>
                        <li>Zscaler, Cisco Umbrella</li>
                        <li>Cisco ISE, Forescout</li>
                        <li>WireGuard, OpenVPN, Cisco AnyConnect</li>
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
                  <h4 className="font-medium">Détection et surveillance</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                    <div>
                      <p className="text-xs font-medium text-blue-300">Solutions</p>
                      <ul className="list-disc list-inside mt-1 text-xs text-blue-200 space-y-1">
                        <li>NDR (Network Detection & Response)</li>
                        <li>NTA (Network Traffic Analysis)</li>
                        <li>SIEM (Security Information & Event Management)</li>
                        <li>Flow Monitoring (NetFlow, sFlow)</li>
                        <li>IDS/IPS (Intrusion Detection/Prevention)</li>
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-blue-300">Exemples d'outils</p>
                      <ul className="list-disc list-inside mt-1 text-xs text-blue-200 space-y-1">
                        <li>Darktrace, ExtraHop, Vectra AI</li>
                        <li>Cisco Stealthwatch, Flowmon</li>
                        <li>Splunk, Elastic, IBM QRadar</li>
                        <li>ntopng, Scrutinizer</li>
                        <li>Suricata, Snort, Zeek (Bro)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-md bg-blue-900/20 border border-blue-800">
                <div className="bg-blue-700 p-2 rounded-md shrink-0">
                  <SearchCode className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium">Audit et test</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                    <div>
                      <p className="text-xs font-medium text-blue-300">Solutions</p>
                      <ul className="list-disc list-inside mt-1 text-xs text-blue-200 space-y-1">
                        <li>Scanners de vulnérabilités</li>
                        <li>Outils d'analyse de configuration</li>
                        <li>Plateformes de test de pénétration</li>
                        <li>Outils d'audit de conformité</li>
                        <li>Analyseurs de protocole (packet sniffers)</li>
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-blue-300">Exemples d'outils</p>
                      <ul className="list-disc list-inside mt-1 text-xs text-blue-200 space-y-1">
                        <li>Nessus, Qualys, OpenVAS</li>
                        <li>rConfig, Nipper, Oxidized</li>
                        <li>Metasploit, Kali Linux, Burp Suite</li>
                        <li>Nmap, Angry IP Scanner</li>
                        <li>Wireshark, tcpdump</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-md bg-blue-900/20 border border-blue-800">
                <div className="bg-blue-700 p-2 rounded-md shrink-0">
                  <Layers className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium">Gestion et orchestration</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                    <div>
                      <p className="text-xs font-medium text-blue-300">Solutions</p>
                      <ul className="list-disc list-inside mt-1 text-xs text-blue-200 space-y-1">
                        <li>SOAR (Security Orchestration & Response)</li>
                        <li>Gestion des politiques de sécurité</li>
                        <li>Gestion du cycle de vie des configurations</li>
                        <li>Automatisation de réseau (SDN, IBN)</li>
                        <li>Gestion des vulnérabilités</li>
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-blue-300">Exemples d'outils</p>
                      <ul className="list-disc list-inside mt-1 text-xs text-blue-200 space-y-1">
                        <li>Palo Alto Cortex XSOAR, Swimlane</li>
                        <li>AlgoSec, Tufin, FireMon</li>
                        <li>Ansible, Puppet, Chef</li>
                        <li>Cisco DNA Center, VMware NSX</li>
                        <li>Rapid7 InsightVM, Tenable.io</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-bold">Cadres de référence et standards</h3>

            <p className="mt-2">
              L'adoption de standards reconnus permet de structurer votre approche de sécurité réseau.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Card className="bg-blue-900/20 border-blue-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md">NIST Cybersecurity Framework</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-blue-200 mb-2">
                    Cadre volontaire de bonnes pratiques pour gérer et réduire les risques de cybersécurité.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-blue-700">Identifier</Badge>
                    <Badge className="bg-blue-700">Protéger</Badge>
                    <Badge className="bg-blue-700">Détecter</Badge>
                    <Badge className="bg-blue-700">Répondre</Badge>
                    <Badge className="bg-blue-700">Récupérer</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-blue-900/20 border-blue-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md">ISO/IEC 27001</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-blue-200 mb-2">
                    Norme internationale pour les systèmes de gestion de la sécurité de l'information.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-blue-700">Politique SMSI</Badge>
                    <Badge className="bg-blue-700">Évaluation des risques</Badge>
                    <Badge className="bg-blue-700">Contrôles</Badge>
                    <Badge className="bg-blue-700">Surveillance</Badge>
                    <Badge className="bg-blue-700">Amélioration continue</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-blue-900/20 border-blue-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md">CIS Controls</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-blue-200 mb-2">
                    Ensemble priorisé de meilleures pratiques pour se défendre contre les cyberattaques.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-blue-700">Inventaire et contrôle</Badge>
                    <Badge className="bg-blue-700">Protections logicielles</Badge>
                    <Badge className="bg-blue-700">Gestion des données</Badge>
                    <Badge className="bg-blue-700">Accès contrôlé</Badge>
                    <Badge className="bg-blue-700">Défense avancée</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-blue-900/20 border-blue-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md">ANSSI - Recommandations</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-blue-200 mb-2">
                    Guides d'hygiène informatique et recommandations de sécurité de l'Agence Nationale de la Sécurité des Systèmes d'Information.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-blue-700">Guides d'architecture</Badge>
                    <Badge className="bg-blue-700">Guides de configuration</Badge>
                    <Badge className="bg-blue-700">Recommandations sectorielles</Badge>
                    <Badge className="bg-blue-700">Homologation</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mt-8 bg-blue-950 border border-blue-800 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-2 flex items-center">
              <Zap className="mr-2 h-5 w-5 text-blue-400" />
              Points clés à retenir
            </h3>
            <ul className="list-disc list-inside space-y-1 text-blue-200">
              <li>Adopter une approche structurée basée sur des standards reconnus</li>
              <li>Mettre en œuvre une combinaison d'outils complémentaires pour couvrir tous les aspects de la sécurité</li>
              <li>Privilégier les solutions intégrées pour une meilleure visibilité et cohérence</li>
              <li>La sécurité est un processus continu, pas un état final</li>
              <li>L'automatisation est essentielle pour maintenir une posture de sécurité cohérente à grande échelle</li>
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
                Testez vos connaissances sur la sécurité des réseaux avec ce quiz de 5 questions. Vous devez obtenir un score d'au moins 80% pour valider le module.
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
                      <p className="font-bold text-xl mb-3">Sécurité des réseaux</p>
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
          title="Sécurité des réseaux"
          subtitle="Protection des infrastructures réseau et détection des intrusions"
          icon={<Network className="h-8 w-8 text-blue-500" />}
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
                    <p className="text-sm font-medium">Guide ANSSI sécurité réseau</p>
                    <p className="text-xs text-blue-300">PDF, 2.4 MB</p>
                  </div>
                </a>
                <a href="#" className="flex items-center gap-2 p-2 rounded-md hover:bg-blue-900/50 transition-colors">
                  <PlayCircle className="h-4 w-4 text-blue-400" />
                  <div>
                    <p className="text-sm font-medium">Vidéo: Architecture Zero Trust</p>
                    <p className="text-xs text-blue-300">18 min</p>
                  </div>
                </a>
                <a href="#" className="flex items-center gap-2 p-2 rounded-md hover:bg-blue-900/50 transition-colors">
                  <Globe className="h-4 w-4 text-blue-400" />
                  <div>
                    <p className="text-sm font-medium">NIST SP 800-53 Controls</p>
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