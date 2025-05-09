import React, { useState } from 'react';
import { Link } from 'wouter';
import {
  ArrowLeft,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Lock,
  PlayCircle,
  Lightbulb,
  Zap,
  Database,
  FileWarning,
  HardDrive,
  CircleSlash,
  Code,
  RefreshCw,
  User,
  Building,
  BarChart3,
  Mail
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function RansomwareModule() {
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
    { id: 'introduction', title: 'Introduction aux ransomwares', progress: 0 },
    { id: 'fonctionnement', title: 'Comment ils fonctionnent', progress: 0 },
    { id: 'impact', title: 'Impact et conséquences', progress: 0 },
    { id: 'prevention', title: 'Prévention et protection', progress: 0 },
    { id: 'reaction', title: 'Réaction en cas d\'attaque', progress: 0 },
    { id: 'quiz', title: 'Quiz de validation', progress: 0 },
  ];

  // Questions du quiz
  const questions = [
    {
      question: "Quelle est la principale caractéristique d'un ransomware ?",
      options: [
        "Il espionne les utilisateurs via leur webcam",
        "Il chiffre les données et demande une rançon pour les déchiffrer",
        "Il vole les identifiants bancaires",
        "Il ralentit les performances de l'ordinateur pour vendre des améliorations"
      ],
      correctAnswer: 1
    },
    {
      question: "Quel vecteur d'infection est le plus couramment utilisé pour propager les ransomwares ?",
      options: [
        "E-mails de phishing avec pièces jointes malveillantes",
        "Failles de sécurité dans les routeurs WiFi",
        "Sites web légitimes compromis",
        "Appareils USB trouvés dans des lieux publics"
      ],
      correctAnswer: 0
    },
    {
      question: "Quelle mesure de protection est la plus efficace contre les ransomwares ?",
      options: [
        "Utiliser uniquement un antivirus à jour",
        "Mettre en place une stratégie de sauvegarde complète (3-2-1)",
        "Changer régulièrement de mot de passe",
        "Utiliser exclusivement le mode de navigation privée"
      ],
      correctAnswer: 1
    },
    {
      question: "Que ne doit-on PAS faire en cas d'infection par ransomware ?",
      options: [
        "Isoler les systèmes infectés du réseau",
        "Documenter tous les symptômes et messages d'erreur",
        "Payer immédiatement la rançon pour limiter les dégâts",
        "Contacter des spécialistes en cybersécurité"
      ],
      correctAnswer: 2
    },
    {
      question: "En quoi consiste l'attaque appelée 'double extorsion' dans le contexte des ransomwares ?",
      options: [
        "Demander deux paiements séparés pour le même déchiffrement",
        "Attaquer en même temps les ordinateurs et les téléphones mobiles",
        "Chiffrer les données ET menacer de les publier si la rançon n'est pas payée",
        "Infecter à la fois les systèmes Windows et Linux d'une entreprise"
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
                <li>Comprendre ce qu'est un ransomware et identifier ses variantes</li>
                <li>Reconnaître les vecteurs d'infection et les mécanismes d'attaque</li>
                <li>Évaluer l'impact potentiel d'une attaque par ransomware</li>
                <li>Mettre en place des mesures de prévention efficaces</li>
                <li>Savoir comment réagir face à une infection</li>
              </ul>
            </AlertDescription>
          </Alert>
          
          <div className="mt-6 space-y-4">
            <h2 className="text-2xl font-bold">Qu'est-ce qu'un ransomware ?</h2>
            
            <p>
              Le terme <strong>ransomware</strong> (ou <strong>rançongiciel</strong> en français) combine les mots "ransom" (rançon) et "software" (logiciel). Il s'agit d'un type de logiciel malveillant qui <strong>chiffre</strong> les données d'un utilisateur ou d'une organisation, rendant les fichiers et systèmes inaccessibles, puis demande une <strong>rançon</strong> en échange de la clé de déchiffrement.
            </p>
            
            <div className="bg-blue-900/20 border border-blue-800 rounded-md p-4 my-4">
              <h3 className="text-lg font-medium mb-2">Définition</h3>
              <p>
                Un <strong>ransomware</strong> est un programme malveillant qui prend en otage des données personnelles en les chiffrant et exige un paiement (rançon) pour restituer l'accès à ces données via une clé de déchiffrement.
              </p>
            </div>
            
            <div className="mt-6">
              <h3 className="text-xl font-bold">Évolution historique</h3>
              
              <div className="space-y-4 mt-3">
                <div className="relative pl-6 border-l-2 border-blue-700 pl-10">
                  <div className="absolute left-0 top-0 w-6 h-6 -ml-3 rounded-full bg-blue-700 flex items-center justify-center text-xs">89</div>
                  <h4 className="font-medium">1989 : AIDS Trojan</h4>
                  <p className="text-sm text-blue-200">Premier ransomware connu, distribué par disquette. Il chiffrait les noms de fichiers après 90 redémarrages et demandait 189$ envoyés à une boîte postale au Panama.</p>
                </div>
                
                <div className="relative pl-6 border-l-2 border-blue-700 pl-10">
                  <div className="absolute left-0 top-0 w-6 h-6 -ml-3 rounded-full bg-blue-700 flex items-center justify-center text-xs">06</div>
                  <h4 className="font-medium">2006-2011 : Premiers ransomwares modernes</h4>
                  <p className="text-sm text-blue-200">Utilisation de chiffrement asymétrique plus sophistiqué. Apparition de GPCode, Archiveus et des "Police ransomwares" qui prétendaient provenir des forces de l'ordre.</p>
                </div>
                
                <div className="relative pl-6 border-l-2 border-blue-700 pl-10">
                  <div className="absolute left-0 top-0 w-6 h-6 -ml-3 rounded-full bg-blue-700 flex items-center justify-center text-xs">13</div>
                  <h4 className="font-medium">2013 : CryptoLocker</h4>
                  <p className="text-sm text-blue-200">Premier ransomware largement répandu utilisant Bitcoin comme moyen de paiement, rendant les transactions plus difficiles à tracer.</p>
                </div>
                
                <div className="relative pl-6 border-l-2 border-blue-700 pl-10">
                  <div className="absolute left-0 top-0 w-6 h-6 -ml-3 rounded-full bg-blue-700 flex items-center justify-center text-xs">17</div>
                  <h4 className="font-medium">2017 : WannaCry et NotPetya</h4>
                  <p className="text-sm text-blue-200">Attaques majeures à l'échelle mondiale exploitant la vulnérabilité EternalBlue. WannaCry a infecté plus de 230,000 ordinateurs dans 150 pays en quelques jours.</p>
                </div>
                
                <div className="relative pl-6 border-l-2 border-blue-700 pl-10">
                  <div className="absolute left-0 top-0 w-6 h-6 -ml-3 rounded-full bg-blue-700 flex items-center justify-center text-xs">19</div>
                  <h4 className="font-medium">2019-2021 : Double extorsion</h4>
                  <p className="text-sm text-blue-200">Nouvelle tactique : les attaquants volent d'abord les données avant de les chiffrer, menaçant de les publier si la rançon n'est pas payée. Émergence de groupes spécialisés comme REvil, Maze et DarkSide.</p>
                </div>
                
                <div className="relative pl-6 pl-10">
                  <div className="absolute left-0 top-0 w-6 h-6 -ml-3 rounded-full bg-blue-700 flex items-center justify-center text-xs">23</div>
                  <h4 className="font-medium">2023-2025 : Industrialisation du ransomware</h4>
                  <p className="text-sm text-blue-200">Développement du modèle RaaS (Ransomware-as-a-Service), ciblage précis des entreprises critiques et augmentation des montants des rançons. Émergence des attaques sur la supply chain et des ransomwares cross-plateforme.</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-xl font-bold">Principales variantes de ransomwares</h3>
              
              <Card className="bg-blue-900/20 border-blue-800 mt-3">
                <CardContent className="pt-6">
                  <Tabs defaultValue="crypto">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="crypto">Crypto-ransomware</TabsTrigger>
                      <TabsTrigger value="locker">Locker-ransomware</TabsTrigger>
                      <TabsTrigger value="doxing">Doxing-ransomware</TabsTrigger>
                    </TabsList>
                    <TabsContent value="crypto" className="p-4 bg-blue-950/30 rounded-md mt-4">
                      <h4 className="font-medium flex items-center">
                        <Lock className="mr-2 h-5 w-5 text-blue-400" />
                        Crypto-ransomware
                      </h4>
                      <p className="mt-2 text-sm text-blue-200">
                        Le type le plus courant. Chiffre les fichiers importants (documents, photos, bases de données) en utilisant des algorithmes de chiffrement avancés. Les fichiers restent sur le système mais deviennent inaccessibles.
                      </p>
                      <div className="mt-3 text-xs bg-blue-900/30 p-2 rounded-md">
                        <p className="font-medium">Exemples notoires :</p>
                        <ul className="list-disc list-inside mt-1 space-y-1 text-blue-300">
                          <li>WannaCry</li>
                          <li>Ryuk</li>
                          <li>REvil (Sodinokibi)</li>
                          <li>LockBit</li>
                        </ul>
                      </div>
                    </TabsContent>
                    <TabsContent value="locker" className="p-4 bg-blue-950/30 rounded-md mt-4">
                      <h4 className="font-medium flex items-center">
                        <CircleSlash className="mr-2 h-5 w-5 text-blue-400" />
                        Locker-ransomware
                      </h4>
                      <p className="mt-2 text-sm text-blue-200">
                        Verrouille l'accès au système d'exploitation entier plutôt que de cibler des fichiers spécifiques. L'utilisateur ne peut plus accéder à son appareil, qui affiche généralement un écran permanent de demande de rançon.
                      </p>
                      <div className="mt-3 text-xs bg-blue-900/30 p-2 rounded-md">
                        <p className="font-medium">Exemples notoires :</p>
                        <ul className="list-disc list-inside mt-1 space-y-1 text-blue-300">
                          <li>Reveton</li>
                          <li>Police Locker</li>
                          <li>Winlocker</li>
                        </ul>
                      </div>
                    </TabsContent>
                    <TabsContent value="doxing" className="p-4 bg-blue-950/30 rounded-md mt-4">
                      <h4 className="font-medium flex items-center">
                        <FileWarning className="mr-2 h-5 w-5 text-blue-400" />
                        Doxing-ransomware (Double extorsion)
                      </h4>
                      <p className="mt-2 text-sm text-blue-200">
                        Combine le chiffrement des données avec leur exfiltration préalable. Les attaquants menacent non seulement de conserver l'accès aux données, mais aussi de les divulguer publiquement si la rançon n'est pas payée.
                      </p>
                      <div className="mt-3 text-xs bg-blue-900/30 p-2 rounded-md">
                        <p className="font-medium">Exemples notoires :</p>
                        <ul className="list-disc list-inside mt-1 space-y-1 text-blue-300">
                          <li>Maze</li>
                          <li>Conti</li>
                          <li>DarkSide</li>
                          <li>ALPHV/BlackCat</li>
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
                Chiffres clés (2025)
              </h3>
              <ul className="space-y-2">
                <li>Une attaque par ransomware a lieu toutes les <strong>11 secondes</strong> dans le monde</li>
                <li>Le coût moyen d'une attaque pour une entreprise est estimé à <strong>4,6 millions d'euros</strong></li>
                <li><strong>64%</strong> des entreprises touchées par un ransomware ont payé la rançon</li>
                <li>Parmi celles qui paient, <strong>moins de 65%</strong> récupèrent l'intégralité de leurs données</li>
                <li>La rançon moyenne demandée atteint désormais <strong>950 000€</strong> pour les grandes entreprises</li>
              </ul>
            </div>
          </div>
        </motion.div>
        
        <div className="flex justify-between mt-8">
          <div></div>
          <Button onClick={() => setActiveLesson('fonctionnement')} className="bg-blue-700 hover:bg-blue-800">
            Continuer
            <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
          </Button>
        </div>
      </div>
    ),
    
    fonctionnement: (
      <div className="space-y-6">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={contentVariants}
        >
          <h2 className="text-2xl font-bold">Comment fonctionnent les ransomwares</h2>
          
          <p className="mt-4">
            Comprendre le cycle d'infection et les mécanismes techniques des ransomwares permet de mieux appréhender les vecteurs d'attaque et les moyens de s'en protéger.
          </p>
          
          <div className="mt-6 space-y-5">
            <Card className="bg-blue-900/20 border-blue-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <RefreshCw className="mr-2 h-5 w-5 text-blue-400" />
                  Cycle d'infection classique
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="bg-blue-800/30 p-3 rounded-md">
                    <h4 className="font-medium flex items-center">
                      <span className="bg-blue-700 text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">1</span>
                      Distribution et infection initiale
                    </h4>
                    <p className="mt-1 text-blue-200 text-sm">
                      Le ransomware pénètre dans le système via différents vecteurs : e-mails de phishing, téléchargements frauduleux, exploits de vulnérabilités, sites web compromis ou encore via des connexions RDP (Remote Desktop Protocol) mal sécurisées.
                    </p>
                  </div>
                  
                  <div className="bg-blue-800/30 p-3 rounded-md">
                    <h4 className="font-medium flex items-center">
                      <span className="bg-blue-700 text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">2</span>
                      Installation et persistance
                    </h4>
                    <p className="mt-1 text-blue-200 text-sm">
                      Une fois exécuté, le malware s'installe dans le système d'exploitation, souvent en contournant les mesures de sécurité. Il s'assure de persister après les redémarrages et peut rester dormant pour éviter la détection.
                    </p>
                  </div>
                  
                  <div className="bg-blue-800/30 p-3 rounded-md">
                    <h4 className="font-medium flex items-center">
                      <span className="bg-blue-700 text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">3</span>
                      Communication avec le serveur C&C
                    </h4>
                    <p className="mt-1 text-blue-200 text-sm">
                      Le ransomware établit une connexion avec un serveur de commande et contrôle (C&C) contrôlé par les attaquants pour recevoir des instructions et transmettre des informations sur le système infecté.
                    </p>
                  </div>
                  
                  <div className="bg-blue-800/30 p-3 rounded-md">
                    <h4 className="font-medium flex items-center">
                      <span className="bg-blue-700 text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">4</span>
                      Préparation et exfiltration
                    </h4>
                    <p className="mt-1 text-blue-200 text-sm">
                      Les ransomwares modernes explorent le réseau pour identifier les données sensibles et les sauvegardes. Dans le cas des attaques à double extorsion, les données sont d'abord volées (exfiltrées) avant d'être chiffrées.
                    </p>
                  </div>
                  
                  <div className="bg-blue-800/30 p-3 rounded-md">
                    <h4 className="font-medium flex items-center">
                      <span className="bg-blue-700 text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">5</span>
                      Chiffrement des données
                    </h4>
                    <p className="mt-1 text-blue-200 text-sm">
                      Le ransomware identifie et chiffre les fichiers ciblés en utilisant des algorithmes de chiffrement puissants. Les extensions de fichiers sont souvent modifiées pour indiquer qu'ils ont été chiffrés.
                    </p>
                  </div>
                  
                  <div className="bg-blue-800/30 p-3 rounded-md">
                    <h4 className="font-medium flex items-center">
                      <span className="bg-blue-700 text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">6</span>
                      Affichage de la demande de rançon
                    </h4>
                    <p className="mt-1 text-blue-200 text-sm">
                      Un message s'affiche à l'écran expliquant que les fichiers ont été chiffrés et indiquant les instructions de paiement, généralement en cryptomonnaie (Bitcoin, Monero). Les attaquants fournissent souvent des moyens de contact et une démonstration de déchiffrement.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="mt-6">
              <h3 className="text-xl font-bold">Vecteurs d'infection courants</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                <Card className="bg-blue-900/20 border-blue-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md flex items-center">
                      <Mail className="mr-2 h-5 w-5 text-blue-400" />
                      Phishing et spam
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <p className="mb-2">
                      E-mails trompeurs contenant des pièces jointes infectées ou des liens vers des sites malveillants.
                    </p>
                    <div className="bg-blue-950/50 p-2 rounded-md text-xs">
                      <p className="font-medium text-white">Techniques courantes :</p>
                      <ul className="list-disc list-inside space-y-1 text-blue-300 mt-1">
                        <li>Documents Office avec macros malveillantes</li>
                        <li>Archives ZIP contenant des scripts JavaScript infectés</li>
                        <li>Liens vers des pages de phishing imitant des services légitimes</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-blue-900/20 border-blue-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md flex items-center">
                      <Shield className="mr-2 h-5 w-5 text-blue-400" />
                      Exploits de vulnérabilités
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <p className="mb-2">
                      Exploitation de failles de sécurité dans les systèmes, logiciels ou applications qui n'ont pas été corrigées.
                    </p>
                    <div className="bg-blue-950/50 p-2 rounded-md text-xs">
                      <p className="font-medium text-white">Cibles fréquentes :</p>
                      <ul className="list-disc list-inside space-y-1 text-blue-300 mt-1">
                        <li>Systèmes d'exploitation obsolètes</li>
                        <li>Applications sans correctifs de sécurité</li>
                        <li>Services exposés sur Internet (RDP, VPN)</li>
                        <li>Vulnérabilités "zero-day" (inconnues des éditeurs)</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-blue-900/20 border-blue-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md flex items-center">
                      <HardDrive className="mr-2 h-5 w-5 text-blue-400" />
                      Supply chain
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <p className="mb-2">
                      Compromission de logiciels légitimes ou de leurs mises à jour pour distribuer le ransomware.
                    </p>
                    <div className="bg-blue-950/50 p-2 rounded-md text-xs">
                      <p className="font-medium text-white">Méthodes :</p>
                      <ul className="list-disc list-inside space-y-1 text-blue-300 mt-1">
                        <li>Infiltration des serveurs de mise à jour</li>
                        <li>Compromission des processus de développement</li>
                        <li>Malware pré-installé dans des logiciels piratés</li>
                        <li>Utilisation de packages logiciels modifiés</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <Card className="bg-blue-900/20 border-blue-800 mt-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Code className="mr-2 h-5 w-5 text-blue-400" />
                  Mécanismes de chiffrement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Les ransomwares modernes utilisent des techniques de chiffrement sophistiquées pour garantir que les victimes ne peuvent pas récupérer leurs fichiers sans la clé de déchiffrement.
                </p>
                
                <Accordion type="single" collapsible className="bg-blue-900/10">
                  <AccordionItem value="symmetric">
                    <AccordionTrigger className="px-4">Chiffrement symétrique</AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <p className="text-sm text-blue-200">
                        Utilise la même clé pour chiffrer et déchiffrer les données. Généralement plus rapide que le chiffrement asymétrique, ce qui est important pour chiffrer de grandes quantités de données. Les algorithmes couramment utilisés sont AES-256 ou ChaCha20.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="asymmetric">
                    <AccordionTrigger className="px-4">Chiffrement asymétrique</AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <p className="text-sm text-blue-200">
                        Utilise une paire de clés : une clé publique pour le chiffrement et une clé privée pour le déchiffrement. La clé privée reste sur les serveurs des attaquants, la rendant inaccessible aux victimes. Les algorithmes couramment utilisés sont RSA, ECC ou ECDH.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="hybrid">
                    <AccordionTrigger className="px-4">Chiffrement hybride</AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <p className="text-sm text-blue-200">
                        Combine les deux approches : le chiffrement asymétrique est utilisé pour protéger une clé symétrique, qui elle-même chiffre les fichiers. Cette méthode offre à la fois la sécurité du chiffrement asymétrique et la performance du chiffrement symétrique. C'est l'approche la plus utilisée dans les ransomwares sophistiqués.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                
                <div className="bg-blue-800/20 p-3 rounded-md mt-4">
                  <h4 className="font-medium">Exemple de processus hybride typique</h4>
                  <ol className="list-decimal list-inside space-y-1 text-blue-200 mt-2 text-sm">
                    <li>Le ransomware génère une clé symétrique aléatoire unique pour la victime</li>
                    <li>Cette clé est utilisée pour chiffrer rapidement tous les fichiers cibles</li>
                    <li>La clé symétrique est ensuite chiffrée avec la clé publique des attaquants</li>
                    <li>La version chiffrée de la clé est stockée dans la note de rançon ou envoyée au serveur C&C</li>
                    <li>Pour déchiffrer les fichiers, les attaquants utilisent leur clé privée pour récupérer la clé symétrique</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
            
            <div className="bg-blue-950 border border-blue-800 rounded-lg p-4 mt-4">
              <h3 className="text-lg font-medium mb-2 flex items-center">
                <User className="mr-2 h-5 w-5 text-blue-400" />
                Le modèle RaaS (Ransomware-as-a-Service)
              </h3>
              <p className="text-blue-200 mb-3">
                Le modèle économique du ransomware a évolué vers une véritable industrialisation du cybercrime :
              </p>
              <div className="space-y-2">
                <div className="bg-blue-900/30 p-2 rounded-md">
                  <p className="text-sm">
                    <strong>Fonctionnement</strong> : Des groupes spécialisés développent des ransomwares sophistiqués et les proposent à des "affiliés" qui se chargent de la propagation et des attaques, moyennant un partage des rançons (généralement 70/30 ou 80/20).
                  </p>
                </div>
                <div className="bg-blue-900/30 p-2 rounded-md">
                  <p className="text-sm">
                    <strong>Avantages pour les criminels</strong> : Les développeurs peuvent se concentrer sur l'amélioration technique tandis que les affiliés, même peu qualifiés techniquement, peuvent mener des attaques efficaces. Cette spécialisation a considérablement augmenté la qualité et l'efficacité des ransomwares.
                  </p>
                </div>
                <div className="bg-blue-900/30 p-2 rounded-md">
                  <p className="text-sm">
                    <strong>Exemples majeurs</strong> : REvil, LockBit, BlackCat (ALPHV), Conti, BlackMatter, AvosLocker et DarkSide opèrent ou ont opéré selon ce modèle, avec des portails d'affiliation sophistiqués et des supports clients pour leurs "partenaires".
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
          <Button onClick={() => setActiveLesson('impact')} className="bg-blue-700 hover:bg-blue-800">
            Continuer
            <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
          </Button>
        </div>
      </div>
    ),
    
    impact: (
      <div className="space-y-6">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={contentVariants}
        >
          <h2 className="text-2xl font-bold">Impact et conséquences</h2>
          
          <Alert className="bg-blue-900/30 border-blue-500 mt-4">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <AlertTitle className="text-blue-100">Au-delà de la rançon</AlertTitle>
            <AlertDescription className="text-blue-200">
              L'impact d'une attaque par ransomware va bien au-delà du simple montant de la rançon demandée. Les conséquences sont multiples et peuvent affecter durablement une organisation.
            </AlertDescription>
          </Alert>
          
          <div className="mt-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-red-900/20 border-red-800">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building className="mr-2 h-5 w-5 text-red-400" />
                    Impact sur les organisations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-red-950/40 p-3 rounded-md">
                    <h4 className="font-medium">Pertes financières directes</h4>
                    <ul className="list-disc list-inside text-sm text-red-200 mt-2 space-y-1">
                      <li><strong>Coût de la rançon</strong> (si payée) : entre 150 000€ et plusieurs millions</li>
                      <li><strong>Pertes opérationnelles</strong> : revenus non générés pendant la période d'interruption</li>
                      <li><strong>Coûts de récupération</strong> : investigations, nettoyage des systèmes, restauration</li>
                      <li><strong>Dépenses informatiques d'urgence</strong> : matériel, logiciels, consultants externes</li>
                    </ul>
                  </div>
                  
                  <div className="bg-red-950/40 p-3 rounded-md">
                    <h4 className="font-medium">Impact opérationnel</h4>
                    <ul className="list-disc list-inside text-sm text-red-200 mt-2 space-y-1">
                      <li><strong>Interruption d'activité</strong> : arrêt complet ou partiel des opérations</li>
                      <li><strong>Temps d'arrêt moyen</strong> : 23 jours (en 2024)</li>
                      <li><strong>Perte de données</strong> : même après paiement, 35% des données en moyenne ne sont jamais récupérées</li>
                      <li><strong>Perturbation de la chaîne d'approvisionnement</strong> et des partenaires commerciaux</li>
                    </ul>
                  </div>
                  
                  <div className="bg-red-950/40 p-3 rounded-md">
                    <h4 className="font-medium">Conséquences à long terme</h4>
                    <ul className="list-disc list-inside text-sm text-red-200 mt-2 space-y-1">
                      <li><strong>Atteinte à la réputation</strong> et perte de confiance des clients et partenaires</li>
                      <li><strong>Augmentation des primes d'assurance</strong> cyber ou difficultés à s'assurer</li>
                      <li><strong>Conséquences juridiques</strong> en cas de fuite de données sensibles</li>
                      <li><strong>Perte d'avantage concurrentiel</strong> si des données stratégiques sont compromises</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-amber-900/20 border-amber-800">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="mr-2 h-5 w-5 text-amber-400" />
                    Impact sur les individus
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-amber-950/40 p-3 rounded-md">
                    <h4 className="font-medium">Conséquences personnelles</h4>
                    <ul className="list-disc list-inside text-sm text-amber-200 mt-2 space-y-1">
                      <li><strong>Perte de données irremplaçables</strong> : photos, vidéos, documents personnels</li>
                      <li><strong>Détresse émotionnelle</strong> et sentiment de violation</li>
                      <li><strong>Interruption des activités</strong> personnelles et professionnelles</li>
                      <li><strong>Risque d'usurpation d'identité</strong> si des informations personnelles sont volées</li>
                    </ul>
                  </div>
                  
                  <div className="bg-amber-950/40 p-3 rounded-md">
                    <h4 className="font-medium">Dilemme du paiement</h4>
                    <ul className="list-disc list-inside text-sm text-amber-200 mt-2 space-y-1">
                      <li><strong>Montants demandés aux particuliers</strong> : généralement entre 300€ et 2000€</li>
                      <li><strong>Aucune garantie de récupération</strong> des fichiers après paiement</li>
                      <li><strong>Possibilité de devenir une cible récurrente</strong> après avoir payé une première fois</li>
                      <li><strong>Contribution indirecte</strong> au financement d'activités criminelles</li>
                    </ul>
                  </div>
                  
                  <div className="bg-amber-950/40 p-3 rounded-md">
                    <h4 className="font-medium">Impact social</h4>
                    <p className="text-sm text-amber-200 mt-2">
                      Les attaques contre des infrastructures critiques (hôpitaux, services publics, écoles) peuvent avoir des conséquences graves sur des populations entières :
                    </p>
                    <ul className="list-disc list-inside text-sm text-amber-200 mt-2 space-y-1">
                      <li>Perturbation des services essentiels</li>
                      <li>Risques pour la santé et la sécurité</li>
                      <li>Déséquilibre des systèmes économiques locaux</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card className="bg-blue-900/20 border-blue-800 mt-4">
              <CardHeader>
                <CardTitle>Études de cas marquantes</CardTitle>
                <CardDescription className="text-blue-200">
                  Exemples d'attaques par ransomware et leurs conséquences concrètes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Accordion type="single" collapsible className="bg-blue-900/10">
                  <AccordionItem value="colonial">
                    <AccordionTrigger className="px-4">Colonial Pipeline (2021)</AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="text-sm text-blue-200">
                        <p className="mb-2">
                          <strong>Contexte</strong> : Plus grand oléoduc des États-Unis, transportant 45% du carburant de la côte Est
                        </p>
                        <p className="mb-2">
                          <strong>Attaque</strong> : Ransomware DarkSide ayant compromis les systèmes informatiques
                        </p>
                        <p className="mb-2">
                          <strong>Conséquences</strong> :
                        </p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>Arrêt complet des opérations pendant 6 jours</li>
                          <li>Pénurie de carburant dans plusieurs états américains</li>
                          <li>Augmentation moyenne de 25% du prix du carburant</li>
                          <li>Paiement d'une rançon de 4,4 millions de dollars (partiellement récupérée par le FBI)</li>
                          <li>Coût total estimé à plus de 15 millions de dollars</li>
                        </ul>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="clop">
                    <AccordionTrigger className="px-4">CL0P et MOVEit (2023)</AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="text-sm text-blue-200">
                        <p className="mb-2">
                          <strong>Contexte</strong> : Exploitation d'une vulnérabilité dans le logiciel de transfert de fichiers MOVEit
                        </p>
                        <p className="mb-2">
                          <strong>Attaque</strong> : Campagne massive du groupe CL0P affectant plus de 2000 organisations
                        </p>
                        <p className="mb-2">
                          <strong>Conséquences</strong> :
                        </p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>Plus de 60 millions de personnes affectées par des fuites de données</li>
                          <li>Perturbation des systèmes d'organisations gouvernementales, d'universités et d'entreprises</li>
                          <li>Coût total estimé entre 10 et 20 milliards de dollars</li>
                          <li>Conséquences juridiques majeures et procès collectifs</li>
                        </ul>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="hospital">
                    <AccordionTrigger className="px-4">Hôpitaux européens (2024)</AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="text-sm text-blue-200">
                        <p className="mb-2">
                          <strong>Contexte</strong> : Série d'attaques ciblant les infrastructures de santé européennes
                        </p>
                        <p className="mb-2">
                          <strong>Attaque</strong> : Ransomware BlackCat ciblant les systèmes d'information hospitaliers
                        </p>
                        <p className="mb-2">
                          <strong>Conséquences</strong> :
                        </p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>Annulation de milliers d'opérations chirurgicales non urgentes</li>
                          <li>Report de traitements pour des patients atteints de cancer</li>
                          <li>Retour au papier et crayon pour la gestion des patients</li>
                          <li>Transferts de patients critiques vers d'autres établissements</li>
                          <li>Décès de patients attribués indirectement aux perturbations</li>
                        </ul>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
            
            <div className="mt-6 space-y-4">
              <h3 className="text-xl font-bold">Dilemme du paiement de la rançon</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-red-900/20 border border-red-800 rounded-md p-4">
                  <h4 className="font-medium flex items-center">
                    <CircleSlash className="mr-2 h-5 w-5 text-red-400" />
                    Arguments contre le paiement
                  </h4>
                  <ul className="list-disc list-inside text-sm text-red-200 mt-2 space-y-1">
                    <li>Encourage et finance les activités criminelles</li>
                    <li>Aucune garantie de récupération des données (35-40% des données ne sont pas récupérées)</li>
                    <li>Identifie la victime comme "payeur" pour de futures attaques</li>
                    <li>Peut exposer l'organisation à des sanctions légales (selon le groupe cybercriminel)</li>
                    <li>Contredit les recommandations des agences de cybersécurité</li>
                  </ul>
                </div>
                
                <div className="bg-amber-900/20 border border-amber-800 rounded-md p-4">
                  <h4 className="font-medium flex items-center">
                    <AlertTriangle className="mr-2 h-5 w-5 text-amber-400" />
                    Raisons qui poussent au paiement
                  </h4>
                  <ul className="list-disc list-inside text-sm text-amber-200 mt-2 space-y-1">
                    <li>Absence de sauvegardes exploitables ou fonctionnelles</li>
                    <li>Coût de l'interruption d'activité supérieur à la rançon</li>
                    <li>Risques pour la santé/sécurité de personnes (ex: hôpitaux)</li>
                    <li>Risque de fuite de données sensibles (double extorsion)</li>
                    <li>Pression temporelle et opérationnelle pour reprendre l'activité</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-blue-950 border border-blue-800 rounded-lg p-4">
                <h4 className="font-medium mb-2">Position des autorités</h4>
                <p className="text-sm text-blue-200">
                  Les agences gouvernementales (ANSSI, CISA, FBI) déconseillent fortement le paiement des rançons. Dans certains pays, des discussions sont en cours pour rendre ces paiements illégaux. Cependant, la décision finale revient souvent aux organisations, qui doivent peser tous les facteurs dans le contexte de leur situation spécifique.
                </p>
              </div>
            </div>
            
            <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-5 mt-4">
              <h3 className="text-xl font-bold mb-3">Visualisation de l'impact global</h3>
              
              <div className="mt-4">
                <h4 className="font-medium mb-3">Coût moyen d'une attaque par secteur (en millions €)</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span>Santé</span>
                      <span>7,2M€</span>
                    </div>
                    <div className="w-full bg-blue-950/50 rounded-full h-4">
                      <div className="bg-blue-600 h-4 rounded-full" style={{ width: '90%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span>Finance</span>
                      <span>6,4M€</span>
                    </div>
                    <div className="w-full bg-blue-950/50 rounded-full h-4">
                      <div className="bg-blue-600 h-4 rounded-full" style={{ width: '80%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span>Industrie</span>
                      <span>5,6M€</span>
                    </div>
                    <div className="w-full bg-blue-950/50 rounded-full h-4">
                      <div className="bg-blue-600 h-4 rounded-full" style={{ width: '70%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span>Éducation</span>
                      <span>4,0M€</span>
                    </div>
                    <div className="w-full bg-blue-950/50 rounded-full h-4">
                      <div className="bg-blue-600 h-4 rounded-full" style={{ width: '50%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span>Commerce</span>
                      <span>3,2M€</span>
                    </div>
                    <div className="w-full bg-blue-950/50 rounded-full h-4">
                      <div className="bg-blue-600 h-4 rounded-full" style={{ width: '40%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
        <div className="flex justify-between mt-8">
          <Button onClick={() => setActiveLesson('fonctionnement')} variant="outline" className="border-blue-700 text-blue-300">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Précédent
          </Button>
          <Button onClick={() => setActiveLesson('prevention')} className="bg-blue-700 hover:bg-blue-800">
            Continuer
            <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
          </Button>
        </div>
      </div>
    ),
    
    prevention: (
      <div className="space-y-6">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={contentVariants}
        >
          <h2 className="text-2xl font-bold">Prévention et protection</h2>
          
          <p className="mt-4">
            La prévention contre les ransomwares repose sur une approche défensive en profondeur, combinant mesures techniques, organisationnelles et humaines.
          </p>
          
          <div className="mt-6 space-y-5">
            <Card className="bg-blue-900/20 border-blue-800">
              <CardHeader>
                <CardTitle>Stratégie de protection multicouche</CardTitle>
                <CardDescription className="text-blue-200">
                  Une défense efficace contre les ransomwares nécessite plusieurs niveaux de protection
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-800/20 p-3 rounded-md">
                  <h3 className="font-medium flex items-center">
                    <HardDrive className="mr-2 h-5 w-5 text-blue-400" />
                    Stratégie de sauvegarde 3-2-1
                  </h3>
                  <p className="text-sm text-blue-200 mt-1">
                    La mesure de protection la plus importante contre les ransomwares est une stratégie de sauvegarde robuste :
                  </p>
                  <div className="mt-2 space-y-2">
                    <div className="bg-blue-900/30 p-2 rounded-md flex items-start">
                      <span className="bg-blue-700 text-white w-6 h-6 rounded-full flex items-center justify-center mr-2 flex-shrink-0">3</span>
                      <p className="text-sm">Conserver <strong>trois copies</strong> de vos données (la copie de production originale et deux copies de sauvegarde)</p>
                    </div>
                    <div className="bg-blue-900/30 p-2 rounded-md flex items-start">
                      <span className="bg-blue-700 text-white w-6 h-6 rounded-full flex items-center justify-center mr-2 flex-shrink-0">2</span>
                      <p className="text-sm">Stocker les copies sur <strong>deux</strong> types de supports de stockage différents (disque externe, NAS, cloud, bande, etc.)</p>
                    </div>
                    <div className="bg-blue-900/30 p-2 rounded-md flex items-start">
                      <span className="bg-blue-700 text-white w-6 h-6 rounded-full flex items-center justify-center mr-2 flex-shrink-0">1</span>
                      <p className="text-sm">Conserver <strong>une</strong> copie hors site (physiquement séparée ou dans le cloud)</p>
                    </div>
                  </div>
                  <div className="mt-3 bg-blue-950 p-2 rounded-md text-xs">
                    <p className="font-medium text-white">Points critiques :</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-300 mt-1">
                      <li>Sauvegardes régulières et automatisées</li>
                      <li>Sauvegardes non connectées en permanence au réseau (air gap)</li>
                      <li>Tests de restauration périodiques</li>
                      <li>Contrôle d'intégrité des sauvegardes</li>
                      <li>Chiffrement des sauvegardes elles-mêmes</li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-blue-800/20 p-3 rounded-md">
                  <h3 className="font-medium flex items-center">
                    <Shield className="mr-2 h-5 w-5 text-blue-400" />
                    Mesures techniques préventives
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    <div className="bg-blue-900/30 p-2 rounded-md">
                      <h4 className="text-sm font-medium">Protection des systèmes</h4>
                      <ul className="list-disc list-inside text-xs space-y-1 text-blue-300 mt-1">
                        <li>Mises à jour régulières (OS, applications)</li>
                        <li>Solutions anti-malware avancées</li>
                        <li>Filtrage des e-mails et du web</li>
                        <li>Pare-feu nouvelle génération</li>
                        <li>Segmentation réseau</li>
                      </ul>
                    </div>
                    <div className="bg-blue-900/30 p-2 rounded-md">
                      <h4 className="text-sm font-medium">Contrôle des accès</h4>
                      <ul className="list-disc list-inside text-xs space-y-1 text-blue-300 mt-1">
                        <li>Authentification multifacteur (MFA)</li>
                        <li>Principe du moindre privilège</li>
                        <li>Gestion des comptes administrateurs</li>
                        <li>VPN pour les accès distants</li>
                        <li>Blocage des macros Office non fiables</li>
                      </ul>
                    </div>
                    <div className="bg-blue-900/30 p-2 rounded-md">
                      <h4 className="text-sm font-medium">Détection et surveillance</h4>
                      <ul className="list-disc list-inside text-xs space-y-1 text-blue-300 mt-1">
                        <li>Surveillance comportementale</li>
                        <li>Détection des anomalies</li>
                        <li>Collecte et analyse des logs</li>
                        <li>Alertes sur événements suspects</li>
                        <li>Honeypots et leurres</li>
                      </ul>
                    </div>
                    <div className="bg-blue-900/30 p-2 rounded-md">
                      <h4 className="text-sm font-medium">Sécurisation des applications</h4>
                      <ul className="list-disc list-inside text-xs space-y-1 text-blue-300 mt-1">
                        <li>Whitelisting des applications</li>
                        <li>Blocage des extensions à risque</li>
                        <li>Restriction des scripts PowerShell</li>
                        <li>Utilisation de EDR (Endpoint Detection & Response)</li>
                        <li>Blocage des exécutions depuis dossiers temporaires</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-800/20 p-3 rounded-md">
                  <h3 className="font-medium flex items-center">
                    <User className="mr-2 h-5 w-5 text-blue-400" />
                    Facteur humain
                  </h3>
                  <p className="text-sm text-blue-200 mt-1">
                    L'élément humain reste un maillon essentiel dans la protection contre les ransomwares :
                  </p>
                  <div className="mt-2 space-y-2">
                    <div className="bg-blue-900/30 p-2 rounded-md">
                      <h4 className="text-sm font-medium">Sensibilisation et formation</h4>
                      <ul className="list-disc list-inside text-xs space-y-1 text-blue-300 mt-1">
                        <li>Formation régulière et obligatoire pour tous les employés</li>
                        <li>Exercices de phishing simulé</li>
                        <li>Communication sur les menaces émergentes</li>
                        <li>Promotion d'une culture de cybersécurité</li>
                      </ul>
                    </div>
                    <div className="bg-blue-900/30 p-2 rounded-md">
                      <h4 className="text-sm font-medium">Bonnes pratiques individuelles</h4>
                      <ul className="list-disc list-inside text-xs space-y-1 text-blue-300 mt-1">
                        <li>Vigilance concernant les e-mails et pièces jointes</li>
                        <li>Vérification des URL avant de cliquer</li>
                        <li>Signalement des comportements suspects</li>
                        <li>Respect des politiques de sécurité</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-800/20 p-3 rounded-md">
                  <h3 className="font-medium flex items-center">
                    <Building className="mr-2 h-5 w-5 text-blue-400" />
                    Mesures organisationnelles
                  </h3>
                  <div className="mt-2 space-y-2">
                    <div className="bg-blue-900/30 p-2 rounded-md">
                      <h4 className="text-sm font-medium">Gouvernance et planification</h4>
                      <ul className="list-disc list-inside text-xs space-y-1 text-blue-300 mt-1">
                        <li>Plan de réponse aux incidents spécifique aux ransomwares</li>
                        <li>Exercices de simulation d'attaque</li>
                        <li>Analyse de risques régulière</li>
                        <li>Politique formelle concernant le paiement de rançons</li>
                        <li>Assurance cyber (avec couverture ransomware)</li>
                      </ul>
                    </div>
                    <div className="bg-blue-900/30 p-2 rounded-md">
                      <h4 className="text-sm font-medium">Gestion des tiers</h4>
                      <ul className="list-disc list-inside text-xs space-y-1 text-blue-300 mt-1">
                        <li>Évaluation de la sécurité des fournisseurs</li>
                        <li>Clauses contractuelles sur la cybersécurité</li>
                        <li>Segmentation des accès accordés aux partenaires</li>
                        <li>Surveillance des connexions externes</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="mt-6">
              <h3 className="text-xl font-bold">Outils et technologies spécifiques</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                <Card className="bg-blue-900/20 border-blue-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md flex items-center">
                      <FileWarning className="mr-2 h-5 w-5 text-blue-400" />
                      Anti-ransomware spécialisés
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <p className="mb-2">
                      Solutions dédiées qui surveillent les comportements typiques des ransomwares, comme le chiffrement massif de fichiers.
                    </p>
                    <div className="bg-blue-950/50 p-2 rounded-md text-xs">
                      <p className="font-medium text-white">Fonctionnalités clés :</p>
                      <ul className="list-disc list-inside space-y-1 text-blue-300 mt-1">
                        <li>Détection comportementale</li>
                        <li>Protection des fichiers en temps réel</li>
                        <li>Rollback des modifications</li>
                        <li>Protection des sauvegardes</li>
                        <li>Détection des techniques d'évasion</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-blue-900/20 border-blue-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md flex items-center">
                      <Database className="mr-2 h-5 w-5 text-blue-400" />
                      Solutions EDR/XDR
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <p className="mb-2">
                      Les solutions Endpoint Detection and Response (EDR) et Extended Detection and Response (XDR) fournissent une visibilité et une protection avancées.
                    </p>
                    <div className="bg-blue-950/50 p-2 rounded-md text-xs">
                      <p className="font-medium text-white">Avantages :</p>
                      <ul className="list-disc list-inside space-y-1 text-blue-300 mt-1">
                        <li>Analyse comportementale avancée</li>
                        <li>Détection des étapes précoces (pré-chiffrement)</li>
                        <li>Réponse automatisée</li>
                        <li>Investigation des incidents</li>
                        <li>Threat hunting proactif</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-blue-900/20 border-blue-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md flex items-center">
                      <BarChart3 className="mr-2 h-5 w-5 text-blue-400" />
                      Leurres et canaris
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <p className="mb-2">
                      Fichiers et systèmes factices conçus pour détecter les activités de ransomware avant qu'elles n'atteignent les données critiques.
                    </p>
                    <div className="bg-blue-950/50 p-2 rounded-md text-xs">
                      <p className="font-medium text-white">Fonctionnement :</p>
                      <ul className="list-disc list-inside space-y-1 text-blue-300 mt-1">
                        <li>Déploiement de fichiers "appâts"</li>
                        <li>Surveillance constante des fichiers leurres</li>
                        <li>Alerte immédiate en cas de modification</li>
                        <li>Déclenchement automatique d'actions défensives</li>
                        <li>Identification précoce des attaques</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-5 mt-4">
              <h3 className="text-xl font-bold mb-3 flex items-center">
                <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
                Checklist de protection
              </h3>
              
              <div className="space-y-3 mt-4">
                <div className="bg-blue-900/30 p-3 rounded-md">
                  <h4 className="font-medium mb-2">Pour les particuliers</h4>
                  <div className="space-y-2">
                    <div className="flex items-start">
                      <div className="bg-blue-950 border border-blue-800 rounded w-5 h-5 flex-shrink-0 mr-2 mt-0.5"></div>
                      <p className="text-sm">Sauvegardez régulièrement vos données importantes sur un support externe et déconnecté</p>
                    </div>
                    <div className="flex items-start">
                      <div className="bg-blue-950 border border-blue-800 rounded w-5 h-5 flex-shrink-0 mr-2 mt-0.5"></div>
                      <p className="text-sm">Maintenez votre système d'exploitation et vos applications à jour</p>
                    </div>
                    <div className="flex items-start">
                      <div className="bg-blue-950 border border-blue-800 rounded w-5 h-5 flex-shrink-0 mr-2 mt-0.5"></div>
                      <p className="text-sm">Utilisez une solution antivirus/antimalware avec protection en temps réel</p>
                    </div>
                    <div className="flex items-start">
                      <div className="bg-blue-950 border border-blue-800 rounded w-5 h-5 flex-shrink-0 mr-2 mt-0.5"></div>
                      <p className="text-sm">Soyez vigilant avec les pièces jointes et les liens dans les e-mails</p>
                    </div>
                    <div className="flex items-start">
                      <div className="bg-blue-950 border border-blue-800 rounded w-5 h-5 flex-shrink-0 mr-2 mt-0.5"></div>
                      <p className="text-sm">Activez l'authentification à deux facteurs sur tous vos comptes importants</p>
                    </div>
                    <div className="flex items-start">
                      <div className="bg-blue-950 border border-blue-800 rounded w-5 h-5 flex-shrink-0 mr-2 mt-0.5"></div>
                      <p className="text-sm">Ne téléchargez des logiciels que depuis des sources officielles</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-900/30 p-3 rounded-md">
                  <h4 className="font-medium mb-2">Pour les organisations</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <div className="flex items-start">
                        <div className="bg-blue-950 border border-blue-800 rounded w-5 h-5 flex-shrink-0 mr-2 mt-0.5"></div>
                        <p className="text-sm">Mettez en place une stratégie de sauvegarde 3-2-1 avec tests de restauration</p>
                      </div>
                      <div className="flex items-start">
                        <div className="bg-blue-950 border border-blue-800 rounded w-5 h-5 flex-shrink-0 mr-2 mt-0.5"></div>
                        <p className="text-sm">Déployez une solution EDR sur tous les endpoints</p>
                      </div>
                      <div className="flex items-start">
                        <div className="bg-blue-950 border border-blue-800 rounded w-5 h-5 flex-shrink-0 mr-2 mt-0.5"></div>
                        <p className="text-sm">Formez régulièrement votre personnel aux menaces</p>
                      </div>
                      <div className="flex items-start">
                        <div className="bg-blue-950 border border-blue-800 rounded w-5 h-5 flex-shrink-0 mr-2 mt-0.5"></div>
                        <p className="text-sm">Segmentez votre réseau pour limiter la propagation</p>
                      </div>
                      <div className="flex items-start">
                        <div className="bg-blue-950 border border-blue-800 rounded w-5 h-5 flex-shrink-0 mr-2 mt-0.5"></div>
                        <p className="text-sm">Établissez un plan de réponse aux incidents ransomware</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-start">
                        <div className="bg-blue-950 border border-blue-800 rounded w-5 h-5 flex-shrink-0 mr-2 mt-0.5"></div>
                        <p className="text-sm">Mettez en œuvre une politique stricte de gestion des accès</p>
                      </div>
                      <div className="flex items-start">
                        <div className="bg-blue-950 border border-blue-800 rounded w-5 h-5 flex-shrink-0 mr-2 mt-0.5"></div>
                        <p className="text-sm">Configurez le filtrage des e-mails et la protection anti-spoofing</p>
                      </div>
                      <div className="flex items-start">
                        <div className="bg-blue-950 border border-blue-800 rounded w-5 h-5 flex-shrink-0 mr-2 mt-0.5"></div>
                        <p className="text-sm">Désactivez les macros par défaut dans les documents Office</p>
                      </div>
                      <div className="flex items-start">
                        <div className="bg-blue-950 border border-blue-800 rounded w-5 h-5 flex-shrink-0 mr-2 mt-0.5"></div>
                        <p className="text-sm">Maintenez à jour un inventaire de tous vos actifs numériques</p>
                      </div>
                      <div className="flex items-start">
                        <div className="bg-blue-950 border border-blue-800 rounded w-5 h-5 flex-shrink-0 mr-2 mt-0.5"></div>
                        <p className="text-sm">Sécurisez les accès à distance (VPN, MFA, monitoring)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
        <div className="flex justify-between mt-8">
          <Button onClick={() => setActiveLesson('impact')} variant="outline" className="border-blue-700 text-blue-300">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Précédent
          </Button>
          <Button onClick={() => setActiveLesson('reaction')} className="bg-blue-700 hover:bg-blue-800">
            Continuer
            <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
          </Button>
        </div>
      </div>
    ),
    
    reaction: (
      <div className="space-y-6">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={contentVariants}
        >
          <h2 className="text-2xl font-bold">Réaction en cas d'attaque</h2>
          
          <Alert className="bg-amber-900/30 border-amber-500 mt-4">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <AlertTitle className="text-amber-100">Agir avec méthode</AlertTitle>
            <AlertDescription className="text-amber-200">
              Face à une attaque par ransomware, chaque minute compte. Une réponse organisée et méthodique peut significativement limiter les dégâts.
            </AlertDescription>
          </Alert>
          
          <div className="mt-6 space-y-5">
            <Card className="bg-blue-900/20 border-blue-800">
              <CardHeader>
                <CardTitle>Plan d'action immédiat</CardTitle>
                <CardDescription className="text-blue-200">
                  Les premières heures sont cruciales pour contenir l'infection et préserver les preuves
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="bg-amber-900/30 border-l-4 border-amber-500 pl-4 py-2">
                    <h3 className="font-medium flex items-center">
                      <span className="bg-amber-700 text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">1</span>
                      Isolement et confinement
                    </h3>
                    <ul className="list-disc list-inside text-sm text-amber-200 mt-2 space-y-1">
                      <li><strong>Déconnectez immédiatement</strong> le système infecté du réseau (câble réseau, WiFi)</li>
                      <li>Si possible, <strong>éteignez les systèmes non infectés</strong> de manière ordonnée</li>
                      <li><strong>Isolez les segments critiques</strong> du réseau pour éviter la propagation</li>
                      <li>Désactivez temporairement les <strong>services de partage</strong> et les lecteurs réseau</li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-800/30 p-3 rounded-md">
                    <h3 className="font-medium flex items-center">
                      <span className="bg-blue-700 text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">2</span>
                      Identification et évaluation
                    </h3>
                    <ul className="list-disc list-inside text-sm text-blue-200 mt-2 space-y-1">
                      <li><strong>Identifiez le type de ransomware</strong> (note de rançon, extension des fichiers)</li>
                      <li>Déterminez <strong>l'étendue de l'infection</strong> (quels systèmes, quelles données)</li>
                      <li>Évaluez <strong>la source probable</strong> de l'infection initiale</li>
                      <li>Consultez des ressources comme <a href="#" className="text-blue-400 hover:underline">ID Ransomware</a> ou <a href="#" className="text-blue-400 hover:underline">No More Ransom</a> pour identifier la variante</li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-800/30 p-3 rounded-md">
                    <h3 className="font-medium flex items-center">
                      <span className="bg-blue-700 text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">3</span>
                      Documentation et notification
                    </h3>
                    <ul className="list-disc list-inside text-sm text-blue-200 mt-2 space-y-1">
                      <li><strong>Prenez des photos</strong> des écrans affichant les messages de rançon</li>
                      <li><strong>Documentez tous les symptômes</strong> et les actions entreprises</li>
                      <li><strong>Conservez des copies</strong> des notes de rançon et des fichiers de demande</li>
                      <li><strong>Prévenez les parties prenantes internes</strong> (direction, juridique, communication)</li>
                      <li>Si nécessaire, <strong>notifiez les autorités</strong> compétentes (ANSSI, police, CNIL)</li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-800/30 p-3 rounded-md">
                    <h3 className="font-medium flex items-center">
                      <span className="bg-blue-700 text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">4</span>
                      Activation du plan de réponse
                    </h3>
                    <ul className="list-disc list-inside text-sm text-blue-200 mt-2 space-y-1">
                      <li><strong>Constituez une cellule de crise</strong> pluridisciplinaire</li>
                      <li><strong>Attribuez clairement les rôles</strong> et les responsabilités</li>
                      <li><strong>Établissez un canal de communication sécurisé</strong> indépendant des systèmes potentiellement compromis</li>
                      <li>Si disponible, <strong>contactez votre assureur cyber</strong> qui peut fournir expertise et ressources</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <Card className="bg-blue-900/20 border-blue-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <HardDrive className="mr-2 h-5 w-5 text-blue-400" />
                    Restauration et remédiation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="bg-blue-900/30 p-3 rounded-md">
                    <h4 className="font-medium">Évaluation des options de récupération</h4>
                    <ul className="list-disc list-inside text-sm text-blue-200 mt-2 space-y-1">
                      <li>Restauration depuis des sauvegardes propres</li>
                      <li>Utilisation de déchiffreurs gratuits (si disponibles)</li>
                      <li>Reconstruction des systèmes</li>
                      <li>Décision concernant le paiement (en dernier recours)</li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-900/30 p-3 rounded-md">
                    <h4 className="font-medium">Processus de restauration sécurisé</h4>
                    <ul className="list-disc list-inside text-sm text-blue-200 mt-2 space-y-1">
                      <li>Formatage et réinstallation complète des systèmes infectés</li>
                      <li>Vérification de l'intégrité des sauvegardes avant restauration</li>
                      <li>Restauration progressive, en commençant par les systèmes critiques</li>
                      <li>Renforcement des sécurités avant reconnexion au réseau</li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-900/30 p-3 rounded-md">
                    <h4 className="font-medium">Priorités de rétablissement</h4>
                    <ol className="list-decimal list-inside text-sm text-blue-200 mt-2 space-y-1">
                      <li>Services critiques pour l'activité</li>
                      <li>Systèmes de communication interne</li>
                      <li>Systèmes orientés clients/utilisateurs</li>
                      <li>Services supports et administratifs</li>
                    </ol>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-blue-900/20 border-blue-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <Zap className="mr-2 h-5 w-5 text-blue-400" />
                    Analyses post-incident
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="bg-blue-900/30 p-3 rounded-md">
                    <h4 className="font-medium">Investigation approfondie</h4>
                    <ul className="list-disc list-inside text-sm text-blue-200 mt-2 space-y-1">
                      <li>Analyse forensique pour déterminer le vecteur d'infection initial</li>
                      <li>Identification des tactiques, techniques et procédures (TTPs) utilisées</li>
                      <li>Vérification de backdoors ou d'autres malwares persistants</li>
                      <li>Évaluation des données potentiellement exfiltrées</li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-900/30 p-3 rounded-md">
                    <h4 className="font-medium">Retour d'expérience</h4>
                    <ul className="list-disc list-inside text-sm text-blue-200 mt-2 space-y-1">
                      <li>Analyse des failles de sécurité exploitées</li>
                      <li>Évaluation de l'efficacité du plan de réponse</li>
                      <li>Identification des améliorations possibles</li>
                      <li>Mise à jour des processus et des technologies de sécurité</li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-900/30 p-3 rounded-md">
                    <h4 className="font-medium">Reporting et communication</h4>
                    <ul className="list-disc list-inside text-sm text-blue-200 mt-2 space-y-1">
                      <li>Rapport détaillé pour la direction</li>
                      <li>Notifications légales et réglementaires (si nécessaire)</li>
                      <li>Communication transparente avec les clients et partenaires affectés</li>
                      <li>Partage d'informations avec la communauté (IOCs, TTPs)</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card className="bg-amber-900/20 border-amber-800 mt-4">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5 text-amber-400" />
                  Dilemme du paiement : considérations critiques
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-amber-200 mb-4">
                  Si toutes les autres options ont échoué et que le paiement est envisagé (décision de dernier recours), considérez ces facteurs critiques :
                </p>
                
                <div className="space-y-3">
                  <div className="bg-amber-950/40 p-3 rounded-md">
                    <h4 className="font-medium">Évaluation préalable obligatoire</h4>
                    <ul className="list-disc list-inside text-sm text-amber-200 mt-2 space-y-1">
                      <li>Vérifiez la <strong>réputation du groupe</strong> d'attaquants (certains sont connus pour ne pas fournir de clé après paiement)</li>
                      <li>Évaluez les <strong>implications légales</strong> (paiement potentiellement illégal si le groupe est sous sanctions)</li>
                      <li>Confirmez l'<strong>absence totale d'alternatives</strong> (sauvegardes, déchiffreurs existants)</li>
                      <li>Estimez le <strong>coût financier global</strong> de la non-récupération vs paiement</li>
                      <li>Consultez des <strong>experts en négociation</strong> avec les cybercriminels</li>
                    </ul>
                  </div>
                  
                  <div className="bg-amber-950/40 p-3 rounded-md">
                    <h4 className="font-medium">Si le paiement est décidé</h4>
                    <ul className="list-disc list-inside text-sm text-amber-200 mt-2 space-y-1">
                      <li>Utilisez des <strong>intermédiaires spécialisés</strong> (disponibles via l'assurance cyber)</li>
                      <li><strong>Négociez</strong> le montant de la rançon si possible</li>
                      <li>Demandez une <strong>preuve de déchiffrement</strong> avant paiement (déchiffrement d'échantillons)</li>
                      <li>Documentez tout le processus pour les <strong>exigences de conformité</strong></li>
                      <li>Préparez-vous à une <strong>restauration potentiellement incomplète</strong> même après paiement</li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-red-900/30 border-l-4 border-red-600 pl-4 py-3 mt-4">
                  <h4 className="font-medium text-red-200">Important</h4>
                  <p className="text-sm text-red-300 mt-1">
                    Même si vous décidez de payer, vous devez tout de même effectuer un nettoyage complet et une réinstallation des systèmes. Le paiement de la rançon fournit uniquement les clés de déchiffrement, il ne nettoie pas l'infection ou ne corrige pas les vulnérabilités exploitées.
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <div className="bg-blue-950 border border-blue-800 rounded-lg p-4 mt-4">
              <h3 className="text-lg font-medium mb-2 flex items-center">
                <Lightbulb className="mr-2 h-5 w-5 text-blue-400" />
                Ressources utiles
              </h3>
              <div className="space-y-2 text-sm">
                <div className="bg-blue-900/30 p-2 rounded-md flex flex-col md:flex-row md:justify-between">
                  <span className="font-medium text-blue-200">No More Ransom</span>
                  <a href="https://www.nomoreransom.org" className="text-blue-400 hover:underline" target="_blank">www.nomoreransom.org</a>
                </div>
                <div className="bg-blue-900/30 p-2 rounded-md flex flex-col md:flex-row md:justify-between">
                  <span className="font-medium text-blue-200">ID Ransomware</span>
                  <a href="https://id-ransomware.malwarehunterteam.com" className="text-blue-400 hover:underline" target="_blank">id-ransomware.malwarehunterteam.com</a>
                </div>
                <div className="bg-blue-900/30 p-2 rounded-md flex flex-col md:flex-row md:justify-between">
                  <span className="font-medium text-blue-200">Ransomware Response Playbook (CISA)</span>
                  <a href="https://www.cisa.gov/stopransomware" className="text-blue-400 hover:underline" target="_blank">www.cisa.gov/stopransomware</a>
                </div>
                <div className="bg-blue-900/30 p-2 rounded-md flex flex-col md:flex-row md:justify-between">
                  <span className="font-medium text-blue-200">Guide ANSSI - Attaques par rançongiciels</span>
                  <a href="https://www.ssi.gouv.fr" className="text-blue-400 hover:underline" target="_blank">www.ssi.gouv.fr</a>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
        <div className="flex justify-between mt-8">
          <Button onClick={() => setActiveLesson('prevention')} variant="outline" className="border-blue-700 text-blue-300">
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
          <h2 className="text-2xl font-bold">Quiz : Comprendre les ransomwares</h2>
          
          {!quizStarted && !quizCompleted ? (
            <div className="mt-6">
              <Card className="bg-blue-900/20 border-blue-800">
                <CardHeader>
                  <CardTitle>Évaluez vos connaissances</CardTitle>
                  <CardDescription className="text-blue-200">
                    Ce quiz comporte 5 questions pour tester votre compréhension des ransomwares et des mesures de protection.
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
                <Button onClick={() => setActiveLesson('reaction')} variant="outline" className="border-blue-700 text-blue-300">
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
                        ? 'Excellent ! Vous maîtrisez bien le sujet des ransomwares.' 
                        : score >= 2 
                          ? 'Pas mal ! Vous avez des connaissances de base mais quelques points à approfondir.' 
                          : 'Vous devriez revoir ce module pour mieux comprendre les ransomwares et les moyens de s\'en protéger.'}
                    </h3>
                    <p className={`mt-2 text-sm ${score >= 4 ? 'text-green-200' : score >= 2 ? 'text-amber-200' : 'text-red-200'}`}>
                      {score >= 4 
                        ? 'Continuez à vous tenir informé des dernières menaces et à appliquer les bonnes pratiques de sécurité.' 
                        : 'Concentrez-vous particulièrement sur les mesures préventives et les stratégies de sauvegarde efficaces.'}
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
          title="Comprendre les ransomwares"
          subtitle="Mécanismes, impact et protection contre les rançongiciels"
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
                  <span>45-60 min</span>
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