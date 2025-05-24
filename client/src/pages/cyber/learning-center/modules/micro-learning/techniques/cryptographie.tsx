import React, { useState } from 'react';
import { Link } from 'wouter';
import {
  ArrowLeft,
  Lock,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  File,
  LightbulbIcon,
  Clock,
  FileText,
  Key,
  Shield,
  Code,
  FileCode,
  RefreshCw,
  Check,
  XCircle,
  Fingerprint,
  Database
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import PageTitle from '@/components/utils/PageTitle';

export default function CryptographieMicroLearning() {
  const [currentSection, setCurrentSection] = useState('introduction');
  const [completedSections, setCompletedSections] = useState<string[]>([]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  // Contenu des sections
  const sections = [
    {
      id: 'introduction',
      title: 'Introduction',
      completed: completedSections.includes('introduction')
    },
    {
      id: 'symmetric',
      title: 'Chiffrement symétrique',
      completed: completedSections.includes('symmetric')
    },
    {
      id: 'asymmetric',
      title: 'Chiffrement asymétrique',
      completed: completedSections.includes('asymmetric')
    },
    {
      id: 'hash',
      title: 'Fonctions de hachage',
      completed: completedSections.includes('hash')
    },
    {
      id: 'applications',
      title: 'Applications pratiques',
      completed: completedSections.includes('applications')
    }
  ];

  // Calculer l'index de la section actuelle
  const currentSectionIndex = sections.findIndex(section => section.id === currentSection);

  // Calculer la progression globale
  const progressPercentage = (completedSections.length / sections.length) * 100;

  // Marquer une section comme terminée
  const markSectionCompleted = (sectionId: string) => {
    if (!completedSections.includes(sectionId)) {
      setCompletedSections([...completedSections, sectionId]);
    }
  };

  // Navigation vers la section précédente
  const goToPreviousSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSection(sections[currentSectionIndex - 1].id);
    }
  };

  // Navigation vers la section suivante
  const goToNextSection = () => {
    if (currentSectionIndex < sections.length - 1) {
      // Marquer la section actuelle comme terminée automatiquement lors de la navigation
      markSectionCompleted(currentSection);
      setCurrentSection(sections[currentSectionIndex + 1].id);
    }
  };

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
          title="Cryptographie moderne"
          subtitle="Principes et applications des techniques de chiffrement contemporaines"
          icon={<Lock className="h-8 w-8 text-blue-500" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Panneau de progression */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-blue-900/20 border-blue-800">
            <CardHeader>
              <CardTitle className="text-lg">Progression</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progression globale</span>
                  <span>{Math.round(progressPercentage)}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>

              <div className="space-y-2">
                {sections.map((section) => (
                  <div
                    key={section.id}
                    className={`p-2 rounded-md cursor-pointer transition-colors ${
                      currentSection === section.id ? 'bg-blue-800/50' : 'hover:bg-blue-800/30'
                    }`}
                    onClick={() => setCurrentSection(section.id)}
                  >
                    <div className="flex items-center justify-between">
                      <span>{section.title}</span>
                      {section.completed && <CheckCircle className="h-4 w-4 text-green-500" />}
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4 bg-blue-800/50" />

              <div className="flex items-center text-sm text-blue-200">
                <Clock className="h-4 w-4 mr-2" />
                <span>Durée estimée: 25 minutes</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-900/20 border-blue-800">
            <CardHeader>
              <CardTitle className="text-lg">Ressources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start border-blue-700">
                <FileText className="mr-2 h-4 w-4" />
                Télécharger en PDF
              </Button>
              <Button variant="outline" className="w-full justify-start border-blue-700">
                <Code className="mr-2 h-4 w-4" />
                Exemples de code
              </Button>
              <Button variant="outline" className="w-full justify-start border-blue-700">
                <ExternalLink className="mr-2 h-4 w-4" />
                Standards NIST
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Contenu principal */}
        <Card className="lg:col-span-3 bg-blue-900/20 border-blue-800">
          <CardContent className="p-6">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Section Introduction */}
              {currentSection === 'introduction' && (
                <motion.div variants={itemVariants}>
                  <h2 className="text-2xl font-bold mb-4">Introduction à la cryptographie moderne</h2>

                  <p className="mb-4">
                    La cryptographie est l'art et la science de protéger l'information à travers des techniques
                    mathématiques qui transforment les données en formats apparemment inintelligibles. Elle constitue
                    l'un des piliers fondamentaux de la cybersécurité moderne.
                  </p>

                  <div className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 p-4 rounded-lg border border-blue-700 mb-6">
                    <h3 className="font-bold text-lg mb-2 text-blue-300">Objectifs d'apprentissage</h3>
                    <ul className="list-disc list-inside space-y-1 text-blue-200">
                      <li>Comprendre les principes fondamentaux du chiffrement moderne</li>
                      <li>Distinguer les algorithmes symétriques et asymétriques</li>
                      <li>Maîtriser les fonctions de hachage et leur utilité</li>
                      <li>Appliquer les concepts cryptographiques dans des contextes réels</li>
                    </ul>
                  </div>

                  <div className="mb-6">
                    <h3 className="font-bold text-lg mb-3">Les trois piliers de la cryptographie</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-800">
                        <div className="rounded-full bg-blue-800/50 w-12 h-12 flex items-center justify-center mb-3">
                          <Lock className="h-6 w-6 text-blue-300" />
                        </div>
                        <h4 className="font-bold text-blue-300 mb-2">Confidentialité</h4>
                        <p className="text-sm">
                          La protection des données contre l'accès par des entités non autorisées. Seuls les destinataires 
                          prévus peuvent comprendre l'information.
                        </p>
                      </div>

                      <div className="bg-green-900/30 p-4 rounded-lg border border-green-800">
                        <div className="rounded-full bg-green-800/50 w-12 h-12 flex items-center justify-center mb-3">
                          <FileCode className="h-6 w-6 text-green-300" />
                        </div>
                        <h4 className="font-bold text-green-300 mb-2">Intégrité</h4>
                        <p className="text-sm">
                          La garantie que les données n'ont pas été altérées pendant leur stockage ou leur transmission.
                          Toute modification non autorisée peut être détectée.
                        </p>
                      </div>

                      <div className="bg-purple-900/30 p-4 rounded-lg border border-purple-800">
                        <div className="rounded-full bg-purple-800/50 w-12 h-12 flex items-center justify-center mb-3">
                          <Fingerprint className="h-6 w-6 text-purple-300" />
                        </div>
                        <h4 className="font-bold text-purple-300 mb-2">Authenticité</h4>
                        <p className="text-sm">
                          La vérification de l'identité de l'expéditeur et de l'origine des données. Assurance que les 
                          informations proviennent bien de la source prétendue.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="font-bold text-lg mb-3">Évolution historique</h3>
                    <div className="p-4 bg-blue-900/20 rounded-lg">
                      <div className="space-y-6">
                        <div className="flex items-start">
                          <div className="bg-blue-800 rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                            <span className="text-xs">1</span>
                          </div>
                          <div>
                            <p className="font-medium text-blue-300">Cryptographie classique (avant 1970)</p>
                            <p className="text-sm text-blue-200">
                              Chiffrements par substitution et transposition comme le chiffre de César et Enigma.
                              Méthodes principalement manuelles ou mécaniques.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <div className="bg-blue-800 rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                            <span className="text-xs">2</span>
                          </div>
                          <div>
                            <p className="font-medium text-blue-300">Ère moderne (1970-2000)</p>
                            <p className="text-sm text-blue-200">
                              Introduction du DES (Data Encryption Standard), puis développement de la cryptographie 
                              à clé publique (RSA) et des premiers standards pour internet.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <div className="bg-blue-800 rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                            <span className="text-xs">3</span>
                          </div>
                          <div>
                            <p className="font-medium text-blue-300">Cryptographie contemporaine (2000-présent)</p>
                            <p className="text-sm text-blue-200">
                              Standardisation de l'AES, développement de la cryptographie sur les courbes elliptiques, 
                              et recherche sur la cryptographie post-quantique face aux menaces futures.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center p-3 bg-blue-800/30 rounded-lg text-blue-200 text-sm">
                    <LightbulbIcon className="h-5 w-5 mr-2 text-yellow-400" />
                    <span>
                      <strong>Conseil :</strong> Pour bien comprendre la cryptographie, il est essentiel de saisir comment 
                      les principes mathématiques sous-jacents permettent d'atteindre les objectifs de sécurité. Ne vous 
                      inquiétez pas, nous allons simplifier ces concepts sans compromettre leur précision.
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Section Chiffrement symétrique */}
              {currentSection === 'symmetric' && (
                <motion.div variants={itemVariants}>
                  <h2 className="text-2xl font-bold mb-4">Chiffrement symétrique : une clé pour tout</h2>

                  <p className="mb-4">
                    Le chiffrement symétrique, également appelé chiffrement à clé secrète, utilise la même clé pour
                    chiffrer et déchiffrer les données. C'est comme une serrure avec une unique clé partagée entre
                    tous les participants autorisés.
                  </p>

                  <div className="bg-gradient-to-r from-indigo-900/30 to-blue-900/30 p-4 rounded-lg border border-indigo-700 mb-6">
                    <div className="flex flex-col md:flex-row items-center">
                      <div className="w-full md:w-1/3 flex justify-center mb-4 md:mb-0">
                        <div className="relative">
                          <div className="bg-indigo-800/60 rounded-lg p-6 flex items-center justify-center">
                            <Key className="h-16 w-16 text-indigo-300" />
                          </div>
                          <div className="absolute -bottom-2 -right-2 bg-blue-800/80 rounded-full p-1">
                            <RefreshCw className="h-5 w-5 text-blue-300" />
                          </div>
                        </div>
                      </div>
                      <div className="w-full md:w-2/3 md:pl-6">
                        <h3 className="font-bold text-lg mb-2 text-indigo-300">Principe clé</h3>
                        <p className="text-sm mb-3">
                          Une seule clé secrète est utilisée à la fois pour transformer le texte clair en texte chiffré 
                          (chiffrement) et pour retrouver le texte clair à partir du texte chiffré (déchiffrement).
                        </p>
                        <div className="text-xs bg-indigo-900/40 p-2 rounded">
                          <strong className="text-indigo-200">Défi principal :</strong> La distribution sécurisée de la clé entre les parties.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="font-bold text-lg mb-3">Algorithmes symétriques majeurs</h3>
                    <Table className="border-collapse">
                      <TableHeader className="bg-blue-900/50">
                        <TableRow>
                          <TableHead className="w-1/4">Algorithme</TableHead>
                          <TableHead className="w-1/4">Tailles de clé</TableHead>
                          <TableHead className="w-2/4">Caractéristiques</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow className="border-b border-blue-800/70">
                          <TableCell className="font-medium text-blue-300">AES</TableCell>
                          <TableCell>128, 192, 256 bits</TableCell>
                          <TableCell>
                            <div>
                              <p>Standard actuel, résistant aux attaques connues</p>
                              <Badge className="mt-1 bg-green-700/70">Recommandé</Badge>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow className="border-b border-blue-800/70">
                          <TableCell className="font-medium text-blue-300">ChaCha20</TableCell>
                          <TableCell>256 bits</TableCell>
                          <TableCell>
                            <div>
                              <p>Haute performance sur appareils à ressources limitées</p>
                              <Badge className="mt-1 bg-green-700/70">Recommandé (mobile)</Badge>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow className="border-b border-blue-800/70">
                          <TableCell className="font-medium text-amber-300">3DES</TableCell>
                          <TableCell>112, 168 bits</TableCell>
                          <TableCell>
                            <div>
                              <p>Plus ancien, mais encore utilisé dans des systèmes legacy</p>
                              <Badge className="mt-1 bg-amber-700/70">En fin de vie</Badge>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium text-red-300">DES</TableCell>
                          <TableCell>56 bits</TableCell>
                          <TableCell>
                            <div>
                              <p>Obsolète et vulnérable aux attaques par force brute</p>
                              <Badge className="mt-1 bg-red-700/70">Déconseillé</Badge>
                            </div>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>

                  <div className="mb-6">
                    <h3 className="font-bold text-lg mb-3">Modes de fonctionnement</h3>
                    <p className="mb-3 text-sm">
                      Les algorithmes symétriques opèrent généralement sur des blocs de données fixes. Les modes de fonctionnement
                      déterminent comment ces blocs sont traités et enchaînés pour chiffrer des messages de longueur variable.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-blue-900/20 p-3 rounded-lg border border-blue-800">
                        <div className="flex items-center mb-2">
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                          <h4 className="font-semibold text-blue-300">Modes sécurisés</h4>
                        </div>
                        <ul className="space-y-1 text-sm">
                          <li className="flex items-start">
                            <span className="text-green-400 mr-2">•</span>
                            <div>
                              <span className="font-medium">GCM (Galois/Counter Mode)</span>
                              <p className="text-xs text-blue-200">Chiffrement authentifié, idéal pour TLS</p>
                            </div>
                          </li>
                          <li className="flex items-start">
                            <span className="text-green-400 mr-2">•</span>
                            <div>
                              <span className="font-medium">CBC avec HMAC</span>
                              <p className="text-xs text-blue-200">Combine chiffrement et authentification</p>
                            </div>
                          </li>
                        </ul>
                      </div>

                      <div className="bg-red-900/20 p-3 rounded-lg border border-red-800">
                        <div className="flex items-center mb-2">
                          <XCircle className="h-4 w-4 text-red-500 mr-2" />
                          <h4 className="font-semibold text-red-300">Modes vulnérables</h4>
                        </div>
                        <ul className="space-y-1 text-sm">
                          <li className="flex items-start">
                            <span className="text-red-400 mr-2">•</span>
                            <div>
                              <span className="font-medium">ECB (Electronic Codebook)</span>
                              <p className="text-xs text-red-200">Ne cache pas les motifs dans les données</p>
                            </div>
                          </li>
                          <li className="flex items-start">
                            <span className="text-red-400 mr-2">•</span>
                            <div>
                              <span className="font-medium">CBC sans authentification</span>
                              <p className="text-xs text-red-200">Vulnérable aux attaques par padding oracle</p>
                            </div>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border-l-4 border-blue-500 p-4 my-4 rounded-r-lg">
                    <h4 className="font-bold text-blue-300">🔑 À retenir</h4>
                    <p className="mt-1">
                      Le chiffrement symétrique est extrêmement rapide et efficace pour protéger de grandes quantités 
                      de données, mais la gestion sécurisée des clés reste son principal défi. C'est pourquoi il est 
                      souvent combiné avec des méthodes asymétriques dans des systèmes hybrides.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Section Chiffrement asymétrique */}
              {currentSection === 'asymmetric' && (
                <motion.div variants={itemVariants}>
                  <h2 className="text-2xl font-bold mb-4">Chiffrement asymétrique : la magie des clés publiques/privées</h2>

                  <p className="mb-4">
                    Le chiffrement asymétrique, également appelé cryptographie à clé publique, utilise une paire de clés
                    mathématiquement liées mais distinctes. Cette innovation a révolutionné la cryptographie moderne en
                    résolvant le problème de l'échange sécurisé des clés.
                  </p>

                  <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 p-5 rounded-lg border border-purple-700 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="md:w-1/2 flex flex-col items-center p-4 bg-purple-900/40 rounded-lg">
                        <div className="p-3 bg-purple-800 rounded-full mb-2">
                          <Lock className="h-8 w-8 text-purple-200" />
                        </div>
                        <h3 className="font-bold text-lg mb-2 text-center text-purple-300">Clé publique</h3>
                        <ul className="text-sm space-y-2 w-full">
                          <li className="flex items-center">
                            <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                            <span>Partagée librement avec tout le monde</span>
                          </li>
                          <li className="flex items-center">
                            <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                            <span>Utilisée pour chiffrer les messages</span>
                          </li>
                          <li className="flex items-center">
                            <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                            <span>Permet de vérifier les signatures numériques</span>
                          </li>
                        </ul>
                      </div>

                      <div className="md:w-1/2 flex flex-col items-center p-4 bg-indigo-900/40 rounded-lg">
                        <div className="p-3 bg-indigo-800 rounded-full mb-2">
                          <Key className="h-8 w-8 text-indigo-200" />
                        </div>
                        <h3 className="font-bold text-lg mb-2 text-center text-indigo-300">Clé privée</h3>
                        <ul className="text-sm space-y-2 w-full">
                          <li className="flex items-center">
                            <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                            <span>Gardée strictement secrète par son propriétaire</span>
                          </li>
                          <li className="flex items-center">
                            <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                            <span>Utilisée pour déchiffrer les messages</span>
                          </li>
                          <li className="flex items-center">
                            <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                            <span>Permet de créer des signatures numériques</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="font-bold text-lg mb-3">Principaux algorithmes asymétriques</h3>
                    <div className="space-y-4">
                      <div className="p-3 bg-blue-900/30 rounded-lg border-l-4 border-blue-600">
                        <h4 className="font-semibold text-blue-300 mb-1">RSA (Rivest-Shamir-Adleman)</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <p className="text-sm mb-2">
                              Basé sur la difficulté de factoriser le produit de deux grands nombres premiers.
                              Largement utilisé mais généralement plus lent que les alternatives modernes.
                            </p>
                            <div className="text-xs">
                              <span className="font-medium text-blue-300">Tailles de clé recommandées :</span>
                              <span className="ml-1">2048 ou 4096 bits</span>
                            </div>
                          </div>
                          <div>
                            <div className="text-xs mb-1 text-blue-300 font-medium">Applications courantes :</div>
                            <div className="flex flex-wrap gap-1">
                              <Badge className="bg-blue-800/60">TLS/SSL</Badge>
                              <Badge className="bg-blue-800/60">S/MIME</Badge>
                              <Badge className="bg-blue-800/60">Signatures numériques</Badge>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-green-900/30 rounded-lg border-l-4 border-green-600">
                        <h4 className="font-semibold text-green-300 mb-1">ECC (Cryptographie sur les Courbes Elliptiques)</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <p className="text-sm mb-2">
                              Offre une sécurité équivalente à RSA avec des clés beaucoup plus courtes.
                              Idéal pour les appareils mobiles et l'IoT grâce à sa légèreté.
                            </p>
                            <div className="text-xs">
                              <span className="font-medium text-green-300">Tailles de clé recommandées :</span>
                              <span className="ml-1">256 ou 384 bits</span>
                            </div>
                          </div>
                          <div>
                            <div className="text-xs mb-1 text-green-300 font-medium">Applications courantes :</div>
                            <div className="flex flex-wrap gap-1">
                              <Badge className="bg-green-800/60">ECDSA (signatures)</Badge>
                              <Badge className="bg-green-800/60">ECDH (échange de clés)</Badge>
                              <Badge className="bg-green-800/60">Crypto-monnaies</Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="font-bold text-lg mb-3">Applications pratiques</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-blue-900/20 to-blue-900/10 p-4 rounded-lg border border-blue-800">
                        <h4 className="font-semibold text-blue-300 mb-2">Échange sécurisé de clés</h4>
                        <p className="text-sm">
                          Protocoles comme Diffie-Hellman permettent à deux parties d'établir une clé 
                          symétrique partagée, même sur un canal non sécurisé, sans jamais exposer la clé.
                        </p>
                      </div>

                      <div className="bg-gradient-to-br from-green-900/20 to-green-900/10 p-4 rounded-lg border border-green-800">
                        <h4 className="font-semibold text-green-300 mb-2">Signatures numériques</h4>
                        <p className="text-sm">
                          Utilisation de la clé privée pour "signer" un document, prouvant l'authenticité 
                          et l'intégrité du document ainsi que l'identité du signataire.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border-l-4 border-purple-500 p-4 my-4 rounded-r-lg">
                    <h4 className="font-bold text-purple-300">🔐 À retenir</h4>
                    <p className="mt-1">
                      Le chiffrement asymétrique résout le problème de l'échange de clés mais est 
                      généralement beaucoup plus lent que le chiffrement symétrique. C'est pourquoi les 
                      systèmes de sécurité modernes utilisent typiquement une approche hybride : 
                      l'asymétrique pour échanger une clé symétrique, puis le symétrique pour les données.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Section Fonctions de hachage */}
              {currentSection === 'hash' && (
                <motion.div variants={itemVariants}>
                  <h2 className="text-2xl font-bold mb-4">Fonctions de hachage : l'empreinte digitale des données</h2>

                  <p className="mb-4">
                    Les fonctions de hachage cryptographiques transforment des données de taille arbitraire en une 
                    empreinte numérique de taille fixe. Ces fonctions jouent un rôle crucial dans la vérification de 
                    l'intégrité des données et dans de nombreux protocoles de sécurité.
                  </p>

                  <div className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 p-4 rounded-lg border border-cyan-800 mb-6">
                    <h3 className="font-bold text-lg mb-3 text-cyan-300">Propriétés essentielles</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-cyan-900/40 p-3 rounded-lg">
                        <div className="flex items-center mb-2">
                          <div className="rounded-full bg-cyan-800 w-6 h-6 flex items-center justify-center mr-2">
                            <span className="text-xs">1</span>
                          </div>
                          <h4 className="font-semibold">Déterminisme</h4>
                        </div>
                        <p className="text-sm">Les mêmes données produisent toujours le même hash</p>
                      </div>

                      <div className="bg-cyan-900/40 p-3 rounded-lg">
                        <div className="flex items-center mb-2">
                          <div className="rounded-full bg-cyan-800 w-6 h-6 flex items-center justify-center mr-2">
                            <span className="text-xs">2</span>
                          </div>
                          <h4 className="font-semibold">Effet avalanche</h4>
                        </div>
                        <p className="text-sm">Un changement minime dans les données produit un hash complètement différent</p>
                      </div>

                      <div className="bg-cyan-900/40 p-3 rounded-lg">
                        <div className="flex items-center mb-2">
                          <div className="rounded-full bg-cyan-800 w-6 h-6 flex items-center justify-center mr-2">
                            <span className="text-xs">3</span>
                          </div>
                          <h4 className="font-semibold">Résistance aux collisions</h4>
                        </div>
                        <p className="text-sm">Difficulté à trouver deux entrées différentes produisant le même hash</p>
                      </div>

                      <div className="bg-cyan-900/40 p-3 rounded-lg">
                        <div className="flex items-center mb-2">
                          <div className="rounded-full bg-cyan-800 w-6 h-6 flex items-center justify-center mr-2">
                            <span className="text-xs">4</span>
                          </div>
                          <h4 className="font-semibold">Non-réversibilité</h4>
                        </div>
                        <p className="text-sm">Impossible de retrouver les données originales à partir du hash</p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="font-bold text-lg mb-3">Algorithmes de hachage courants</h3>
                    <Table className="border-collapse">
                      <TableHeader className="bg-blue-900/50">
                        <TableRow>
                          <TableHead className="w-1/4">Algorithme</TableHead>
                          <TableHead className="w-1/4">Taille de sortie</TableHead>
                          <TableHead className="w-2/4">Statut de sécurité</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow className="border-b border-blue-800/70">
                          <TableCell className="font-medium text-red-300">MD5</TableCell>
                          <TableCell>128 bits</TableCell>
                          <TableCell>
                            <div>
                              <p>Complètement compromis, vulnérable aux collisions</p>
                              <Badge className="mt-1 bg-red-700/70">Déconseillé</Badge>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow className="border-b border-blue-800/70">
                          <TableCell className="font-medium text-red-300">SHA-1</TableCell>
                          <TableCell>160 bits</TableCell>
                          <TableCell>
                            <div>
                              <p>Vulnérable aux attaques par collision pratiques</p>
                              <Badge className="mt-1 bg-red-700/70">Déconseillé</Badge>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow className="border-b border-blue-800/70">
                          <TableCell className="font-medium text-green-300">SHA-256</TableCell>
                          <TableCell>256 bits</TableCell>
                          <TableCell>
                            <div>
                              <p>Partie de la famille SHA-2, considérée sécurisée</p>
                              <Badge className="mt-1 bg-green-700/70">Recommandé</Badge>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium text-green-300">SHA-3</TableCell>
                          <TableCell>224 à 512 bits</TableCell>
                          <TableCell>
                            <div>
                              <p>Standard le plus récent, conçu pour résister aux attaques quantiques</p>
                              <Badge className="mt-1 bg-green-700/70">Fortement recommandé</Badge>
                            </div>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>

                  <div className="mb-6">
                    <h3 className="font-bold text-lg mb-3">Applications des fonctions de hachage</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-blue-900/30 p-3 rounded-lg border border-blue-800">
                        <h4 className="font-semibold text-blue-300 mb-2">Vérification d'intégrité</h4>
                        <p className="text-sm">
                          Utilisation des hashs pour vérifier qu'un fichier n'a pas été modifié pendant le transfert 
                          ou le stockage (téléchargements, mises à jour, etc.).
                        </p>
                      </div>

                      <div className="bg-purple-900/30 p-3 rounded-lg border border-purple-800">
                        <h4 className="font-semibold text-purple-300 mb-2">Stockage des mots de passe</h4>
                        <p className="text-sm">
                          Les systèmes sécurisés ne stockent jamais les mots de passe en clair, mais uniquement 
                          leurs hashs (généralement salés pour plus de sécurité).
                        </p>
                      </div>

                      <div className="bg-green-900/30 p-3 rounded-lg border border-green-800">
                        <h4 className="font-semibold text-green-300 mb-2">Blockchain</h4>
                        <p className="text-sm">
                          Les technologies blockchain utilisent intensivement les fonctions de hachage pour lier 
                          les blocs et garantir l'immutabilité du registre.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-cyan-900/40 to-blue-900/40 border-l-4 border-cyan-500 p-4 my-4 rounded-r-lg">
                    <h4 className="font-bold text-cyan-300">🔍 À retenir</h4>
                    <p className="mt-1">
                      Les fonctions de hachage sont des outils fondamentaux en cryptographie moderne, jouant un 
                      rôle crucial dans presque tous les protocoles et systèmes de sécurité. Bien qu'elles ne 
                      chiffrent pas les données, elles sont essentielles pour garantir leur intégrité et authenticité.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Section Applications pratiques */}
              {currentSection === 'applications' && (
                <motion.div variants={itemVariants}>
                  <h2 className="text-2xl font-bold mb-4">Applications pratiques de la cryptographie</h2>

                  <p className="mb-4">
                    La cryptographie moderne est omniprésente dans notre vie numérique quotidienne.
                    Des communications sécurisées aux transactions financières, elle sous-tend la confiance
                    dans l'écosystème numérique.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-gradient-to-br from-blue-900/40 to-indigo-900/20 p-4 rounded-lg border border-blue-700">
                      <div className="rounded-full bg-blue-800/70 w-12 h-12 flex items-center justify-center mb-3">
                        <Lock className="h-6 w-6 text-blue-200" />
                      </div>
                      <h3 className="font-bold text-lg mb-2 text-blue-300">TLS/SSL</h3>
                      <p className="text-sm mb-3">
                        Les protocoles TLS (Transport Layer Security) sécurisent les communications sur Internet.
                        C'est ce qui se cache derrière le cadenas HTTPS dans votre navigateur.
                      </p>
                      <div className="bg-blue-900/30 p-2 rounded text-xs">
                        <p className="font-medium mb-1">Fonctionnement cryptographique:</p>
                        <ol className="list-decimal list-inside space-y-1 pl-1">
                          <li>Échange de clés asymétrique (RSA ou ECDHE)</li>
                          <li>Communication chiffrée avec algorithmes symétriques (AES)</li>
                          <li>Vérification d'intégrité via HMAC (SHA-256/384)</li>
                        </ol>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/20 p-4 rounded-lg border border-purple-700">
                      <div className="rounded-full bg-purple-800/70 w-12 h-12 flex items-center justify-center mb-3">
                        <Database className="h-6 w-6 text-purple-200" />
                      </div>
                      <h3 className="font-bold text-lg mb-2 text-purple-300">Blockchain</h3>
                      <p className="text-sm mb-3">
                        La technologie blockchain repose entièrement sur la cryptographie pour créer
                        des registres distribués infalsifiables et des actifs numériques sécurisés.
                      </p>
                      <div className="bg-purple-900/30 p-2 rounded text-xs">
                        <p className="font-medium mb-1">Éléments cryptographiques clés:</p>
                        <ol className="list-decimal list-inside space-y-1 pl-1">
                          <li>Hachage cryptographique (SHA-256) pour la chaîne de blocs</li>
                          <li>Signatures numériques (ECDSA) pour l'authentification</li>
                          <li>Preuves à divulgation nulle de connaissance pour la confidentialité</li>
                        </ol>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="font-bold text-lg mb-3">Systèmes cryptographiques hybrides</h3>
                    <div className="p-4 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg border border-blue-700">
                      <p className="mb-3">
                        La plupart des applications cryptographiques modernes combinent intelligemment plusieurs
                        types de cryptographie pour obtenir le meilleur équilibre entre sécurité et performance.
                      </p>

                      <div className="bg-blue-900/20 p-3 rounded-lg mb-3">
                        <h4 className="font-semibold text-blue-300 mb-2">Exemple : Messagerie chiffrée de bout en bout</h4>
                        <div className="space-y-3">
                          <div className="flex items-start">
                            <div className="bg-blue-800 rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                              <span className="text-xs">1</span>
                            </div>
                            <div>
                              <p className="font-medium text-blue-300">Mise en place du canal sécurisé</p>
                              <p className="text-sm text-blue-200">
                                Utilisation du protocole Double Ratchet avec échange de clés ECDH pour
                                établir un canal sécurisé et garantir la confidentialité persistante.
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start">
                            <div className="bg-blue-800 rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                              <span className="text-xs">2</span>
                            </div>
                            <div>
                              <p className="font-medium text-blue-300">Chiffrement des messages</p>
                              <p className="text-sm text-blue-200">
                                Les messages sont chiffrés avec AES-256 en utilisant des clés dérivées
                                uniques pour chaque message, générant des clés différentes à chaque échange.
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start">
                            <div className="bg-blue-800 rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                              <span className="text-xs">3</span>
                            </div>
                            <div>
                              <p className="font-medium text-blue-300">Vérification d'intégrité</p>
                              <p className="text-sm text-blue-200">
                                Utilisation de HMAC-SHA256 pour garantir que les messages n'ont pas été
                                modifiés en transit et qu'ils proviennent bien de l'expéditeur attendu.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="font-bold text-lg mb-3">Futur de la cryptographie</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-amber-900/30 to-orange-900/20 p-4 rounded-lg border border-amber-800">
                        <h4 className="font-semibold text-amber-300 mb-2">Cryptographie post-quantique</h4>
                        <p className="text-sm">
                          Développement d'algorithmes résistants aux attaques d'ordinateurs quantiques,
                          qui pourraient casser la plupart des systèmes asymétriques actuels (RSA, ECC).
                          Le NIST est en train de standardiser de nouveaux algorithmes.
                        </p>
                      </div>

                      <div className="bg-gradient-to-br from-teal-900/30 to-green-900/20 p-4 rounded-lg border border-teal-800">
                        <h4 className="font-semibold text-teal-300 mb-2">Calcul homomorphe</h4>
                        <p className="text-sm">
                          Techniques permettant d'effectuer des calculs sur des données chiffrées sans avoir
                          à les déchiffrer, ouvrant la voie à des services cloud sécurisés où le fournisseur
                          n'a jamais accès aux données en clair.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-900/40 to-teal-900/40 border-l-4 border-green-500 p-4 my-4 rounded-r-lg">
                    <h4 className="font-bold text-green-300">🌟 À retenir</h4>
                    <p className="mt-1">
                      La cryptographie n'est pas juste une discipline technique pour spécialistes, mais le fondement 
                      de la confiance numérique. Comprendre ses principes de base vous permet de mieux évaluer les 
                      risques et de faire des choix éclairés concernant vos outils et vos données.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Navigation */}
              <div className="flex justify-between mt-8">
                <Button 
                  variant="outline" 
                  className="border-blue-700"
                  onClick={goToPreviousSection}
                  disabled={currentSectionIndex === 0}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Section précédente
                </Button>

                <Button
                  className="bg-blue-700 hover:bg-blue-800"
                  onClick={() => markSectionCompleted(currentSection)}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Marquer cette section comme terminée
                </Button>

                <Button 
                  variant="outline" 
                  className="border-blue-700"
                  onClick={goToNextSection}
                  disabled={currentSectionIndex === sections.length - 1}
                >
                  Section suivante
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}