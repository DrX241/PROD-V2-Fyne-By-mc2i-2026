import React, { useState } from 'react';
import { Link } from 'wouter';
import {
  ArrowLeft,
  FileWarning,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  File,
  LightbulbIcon,
  Clock,
  Mail,
  Shield,
  FileText,
  Eye,
  XCircle,
  Lock,
  AlarmClock,
  Check,
  AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageTitle from '@/components/utils/PageTitle';

export default function PhishingMicroLearning() {
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
      id: 'techniques',
      title: 'Techniques avancées',
      completed: completedSections.includes('techniques')
    },
    {
      id: 'detection',
      title: 'Détection des attaques',
      completed: completedSections.includes('detection')
    },
    {
      id: 'prevention',
      title: 'Mesures préventives',
      completed: completedSections.includes('prevention')
    },
    {
      id: 'exercice',
      title: 'Exercice pratique',
      completed: completedSections.includes('exercice')
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
          title="Phishing avancé"
          subtitle="Techniques sophistiquées d'hameçonnage et contre-mesures efficaces"
          icon={<FileWarning className="h-8 w-8 text-orange-500" />}
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
                <span>Durée estimée: 15 minutes</span>
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
                <ExternalLink className="mr-2 h-4 w-4" />
                Ressources externes
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
                  <h2 className="text-2xl font-bold mb-4">Le phishing : une menace en constante évolution</h2>

                  <p className="mb-4">
                    Le phishing, ou hameçonnage, reste l'une des techniques d'attaque les plus répandues et efficaces.
                    Loin d'être une simple arnaque par e-mail, il a évolué vers des formes plus sophistiquées et ciblées
                    qui trompent même les utilisateurs avertis.
                  </p>

                  <div className="flex items-center p-3 bg-orange-900/30 rounded-lg border border-orange-800/50 mb-4">
                    <AlertTriangle className="h-5 w-5 mr-2 text-orange-400" />
                    <span className="text-orange-200">
                      <strong>Fait alarmant :</strong> Selon les études récentes, plus de 90% des cyberattaques commencent par une tentative de phishing.
                    </span>
                  </div>

                  <div className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 p-4 rounded-lg border border-blue-700 mb-4">
                    <h3 className="font-bold text-lg mb-2 text-blue-300">Objectifs d'apprentissage</h3>
                    <ul className="list-disc list-inside space-y-1 text-blue-200">
                      <li>Comprendre les techniques avancées de phishing utilisées aujourd'hui</li>
                      <li>Identifier les indicateurs d'une attaque sophistiquée</li>
                      <li>Maîtriser les meilleures pratiques pour se protéger</li>
                      <li>Apprendre à réagir face à une tentative de phishing</li>
                    </ul>
                  </div>

                  <div className="mb-6">
                    <h3 className="font-bold text-lg mb-3">Du phishing classique aux attaques ciblées</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-800">
                        <h4 className="font-semibold text-blue-300 mb-2">Phishing traditionnel</h4>
                        <p className="text-sm">
                          Campagnes massives envoyées à des millions de destinataires, avec des 
                          messages génériques et souvent des erreurs grammaticales évidentes.
                        </p>
                        <div className="mt-2 p-2 bg-blue-900/40 rounded text-xs">
                          <strong>Cible :</strong> Utilisateurs peu sensibilisés
                        </div>
                      </div>
                      <div className="bg-purple-900/30 p-4 rounded-lg border border-purple-800">
                        <h4 className="font-semibold text-purple-300 mb-2">Phishing avancé (aujourd'hui)</h4>
                        <p className="text-sm">
                          Attaques hautement personnalisées, basées sur des informations collectées
                          via l'intelligence sociale, imitant parfaitement les communications légitimes.
                        </p>
                        <div className="mt-2 p-2 bg-purple-900/40 rounded text-xs">
                          <strong>Cible :</strong> Même les utilisateurs expérimentés et vigilants
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center p-3 bg-blue-800/30 rounded-lg text-blue-200 text-sm">
                    <LightbulbIcon className="h-5 w-5 mr-2 text-yellow-400" />
                    <span>
                      <strong>Conseil :</strong> La meilleure défense contre le phishing est la vigilance constante. 
                      Même les experts peuvent être dupés par les techniques les plus avancées.
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Section Techniques avancées */}
              {currentSection === 'techniques' && (
                <motion.div variants={itemVariants}>
                  <h2 className="text-2xl font-bold mb-4">Techniques avancées de phishing</h2>

                  <p className="mb-4">
                    Les cybercriminels innovent constamment dans leurs méthodes de phishing, dépassant
                    les simples e-mails génériques pour créer des attaques sophistiquées et difficiles à détecter.
                  </p>

                  <div className="space-y-5 mb-6">
                    <div className="bg-gradient-to-r from-red-900/30 to-orange-900/30 p-4 rounded-lg border border-red-800">
                      <h3 className="flex items-center font-bold text-lg mb-2 text-orange-300">
                        <span className="bg-orange-800 rounded-full w-6 h-6 flex items-center justify-center mr-2 text-xs">1</span>
                        Spear Phishing
                      </h3>
                      <p className="mb-2">
                        Contrairement au phishing de masse, le spear phishing cible des individus ou des organisations spécifiques,
                        en utilisant des informations personnalisées pour paraître légitime.
                      </p>
                      <div className="bg-red-900/20 p-3 rounded-lg">
                        <h4 className="font-semibold text-red-300 mb-1">Exemple concret</h4>
                        <p className="text-sm">
                          Un attaquant envoie un e-mail à un employé en se faisant passer pour son supérieur
                          hiérarchique, mentionnant un projet réel en cours et demandant un transfert d'argent
                          urgent ou des identifiants spécifiques.
                        </p>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 p-4 rounded-lg border border-purple-800">
                      <h3 className="flex items-center font-bold text-lg mb-2 text-pink-300">
                        <span className="bg-pink-800 rounded-full w-6 h-6 flex items-center justify-center mr-2 text-xs">2</span>
                        Whaling
                      </h3>
                      <p className="mb-2">
                        Forme ultra-ciblée de phishing visant les "gros poissons" : PDG, directeurs financiers 
                        et autres hauts dirigeants ayant un accès privilégié à des données sensibles.
                      </p>
                      <div className="bg-purple-900/20 p-3 rounded-lg">
                        <h4 className="font-semibold text-purple-300 mb-1">Exemple concret</h4>
                        <p className="text-sm">
                          Un e-mail sophistiqué est envoyé au directeur financier, semblant provenir du PDG,
                          demandant un virement bancaire confidentiel pour une acquisition en cours de négociation.
                        </p>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 p-4 rounded-lg border border-blue-800">
                      <h3 className="flex items-center font-bold text-lg mb-2 text-blue-300">
                        <span className="bg-blue-800 rounded-full w-6 h-6 flex items-center justify-center mr-2 text-xs">3</span>
                        Clone Phishing
                      </h3>
                      <p className="mb-2">
                        Réplique presque parfaite d'un message légitime précédemment reçu, mais modifié
                        pour inclure des liens malveillants ou des pièces jointes infectées.
                      </p>
                      <div className="bg-blue-900/20 p-3 rounded-lg">
                        <h4 className="font-semibold text-blue-300 mb-1">Exemple concret</h4>
                        <p className="text-sm">
                          Un message identique à une notification légitime de partage de documents est envoyé,
                          avec le commentaire "version mise à jour" et un lien qui mène vers un site de
                          phishing copiant l'interface du service de partage réel.
                        </p>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 p-4 rounded-lg border border-green-800">
                      <h3 className="flex items-center font-bold text-lg mb-2 text-green-300">
                        <span className="bg-green-800 rounded-full w-6 h-6 flex items-center justify-center mr-2 text-xs">4</span>
                        Smishing et Vishing
                      </h3>
                      <p className="mb-2">
                        Extensions du phishing aux SMS (smishing) et aux appels vocaux (vishing),
                        exploitant la confiance accrue des utilisateurs dans ces canaux de communication.
                      </p>
                      <div className="bg-green-900/20 p-3 rounded-lg">
                        <h4 className="font-semibold text-green-300 mb-1">Exemple concret</h4>
                        <p className="text-sm">
                          Un SMS qui semble provenir de votre banque vous alerte d'une transaction suspecte,
                          vous demandant de rappeler un numéro spécifique où un "agent" vous demande vos
                          identifiants pour "vérifier votre identité".
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-yellow-900/40 to-amber-900/40 border-l-4 border-yellow-500 p-4 my-4 rounded-r-lg">
                    <h4 className="font-bold text-yellow-300">🎯 À retenir</h4>
                    <p className="mt-1">
                      Le phishing moderne est contextuel, personnalisé et multi-canal. Les attaquants combinent souvent 
                      plusieurs techniques et canaux (email, SMS, téléphone) pour augmenter leurs chances de succès.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Section Détection des attaques */}
              {currentSection === 'detection' && (
                <motion.div variants={itemVariants}>
                  <h2 className="text-2xl font-bold mb-4">Comment détecter les attaques de phishing avancées</h2>

                  <p className="mb-4">
                    Bien que de plus en plus sophistiquées, les attaques de phishing laissent généralement des indices
                    qui peuvent être identifiés avec une vigilance appropriée.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/10 p-4 rounded-lg border border-blue-800">
                      <div className="rounded-full bg-blue-800 w-10 h-10 flex items-center justify-center mb-3">
                        <Eye className="h-5 w-5 text-blue-200" />
                      </div>
                      <h3 className="font-bold text-lg mb-2 text-blue-300">Indices visuels</h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start">
                          <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span>Examiner attentivement l'adresse email d'expéditeur (pas seulement le nom affiché)</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span>Vérifier les URL en survolant les liens (sans cliquer)</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span>Repérer les logos légèrement déformés ou de qualité inférieure</span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/10 p-4 rounded-lg border border-purple-800">
                      <div className="rounded-full bg-purple-800 w-10 h-10 flex items-center justify-center mb-3">
                        <AlarmClock className="h-5 w-5 text-purple-200" />
                      </div>
                      <h3 className="font-bold text-lg mb-2 text-purple-300">Signes comportementaux</h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start">
                          <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span>Méfiance face aux demandes urgentes exigeant une action immédiate</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span>Attention aux messages jouant sur la peur, la curiosité ou l'appât du gain</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span>Prudence face aux communications inhabituelles même de contacts connus</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-red-900/20 to-orange-900/20 border border-red-800/50 rounded-lg mb-6">
                    <h3 className="font-bold text-lg mb-3 text-orange-300">Drapeaux rouges du phishing avancé</h3>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <AlertTriangle className="h-5 w-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-red-300">Communication inattendue demandant des informations sensibles</p>
                          <p className="text-xs text-red-200 mt-1">
                            Même si le message semble provenir d'une source légitime, méfiez-vous si vous ne vous attendiez pas à cette demande.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <AlertTriangle className="h-5 w-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-red-300">Discordance subtile dans le ton ou le style d'écriture</p>
                          <p className="text-xs text-red-200 mt-1">
                            Un message d'un collègue qui n'utilise pas son style habituel de communication peut indiquer une usurpation d'identité.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <AlertTriangle className="h-5 w-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-red-300">Demandes de contourner les procédures de sécurité</p>
                          <p className="text-xs text-red-200 mt-1">
                            Toute sollicitation pour ignorer les protocoles habituels en raison d'une "urgence" devrait immédiatement éveiller vos soupçons.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-900/40 to-teal-900/40 border-l-4 border-green-500 p-4 my-4 rounded-r-lg">
                    <h4 className="font-bold text-green-300">💡 À retenir</h4>
                    <p className="mt-1">
                      Face au doute, utilisez un canal de communication alternatif pour vérifier la légitimité du message.
                      Par exemple, si vous recevez un email suspect d'un collègue, appelez-le directement plutôt que de répondre à l'email.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Section Mesures préventives */}
              {currentSection === 'prevention' && (
                <motion.div variants={itemVariants}>
                  <h2 className="text-2xl font-bold mb-4">Meilleures pratiques contre le phishing avancé</h2>

                  <p className="mb-4">
                    La prévention du phishing repose sur une combinaison de mesures techniques,
                    organisationnelles et comportementales.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-800">
                      <div className="rounded-full bg-blue-800/60 w-10 h-10 flex items-center justify-center mb-3">
                        <Shield className="h-5 w-5 text-blue-200" />
                      </div>
                      <h3 className="font-bold text-lg mb-2 text-blue-300">Mesures techniques</h3>
                      <ul className="space-y-1.5 text-sm">
                        <li className="flex items-start">
                          <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span>Déployer des filtres anti-phishing avancés</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span>Activer l'authentification multifacteur (MFA)</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span>Utiliser un gestionnaire de mots de passe</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span>Maintenir tous les logiciels à jour</span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-purple-900/30 p-4 rounded-lg border border-purple-800">
                      <div className="rounded-full bg-purple-800/60 w-10 h-10 flex items-center justify-center mb-3">
                        <Mail className="h-5 w-5 text-purple-200" />
                      </div>
                      <h3 className="font-bold text-lg mb-2 text-purple-300">Pratiques quotidiennes</h3>
                      <ul className="space-y-1.5 text-sm">
                        <li className="flex items-start">
                          <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span>Vérifier l'URL avant de cliquer</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span>Ne jamais partager d'informations sensibles par email</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span>Se méfier des pièces jointes inattendues</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span>Confirmer par un autre canal en cas de doute</span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-green-900/30 p-4 rounded-lg border border-green-800">
                      <div className="rounded-full bg-green-800/60 w-10 h-10 flex items-center justify-center mb-3">
                        <Lock className="h-5 w-5 text-green-200" />
                      </div>
                      <h3 className="font-bold text-lg mb-2 text-green-300">Mesures organisationnelles</h3>
                      <ul className="space-y-1.5 text-sm">
                        <li className="flex items-start">
                          <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span>Former régulièrement le personnel</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span>Réaliser des simulations de phishing</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span>Établir des procédures de signalement</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span>Définir des protocoles pour les requêtes sensibles</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 p-5 rounded-lg border border-blue-700 mb-6">
                    <h3 className="font-bold text-lg mb-3 text-blue-300">Réponse à un incident de phishing</h3>
                    <ol className="space-y-3">
                      <li className="flex">
                        <div className="bg-blue-800 rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <span className="text-xs">1</span>
                        </div>
                        <div>
                          <p className="font-medium">Ne paniquez pas et n'interagissez pas davantage</p>
                          <p className="text-sm text-blue-200">Si vous avez cliqué sur un lien ou ouvert une pièce jointe, ne continuez pas l'interaction</p>
                        </div>
                      </li>
                      <li className="flex">
                        <div className="bg-blue-800 rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <span className="text-xs">2</span>
                        </div>
                        <div>
                          <p className="font-medium">Signalez immédiatement l'incident</p>
                          <p className="text-sm text-blue-200">Alertez votre équipe IT ou votre responsable sécurité sans délai</p>
                        </div>
                      </li>
                      <li className="flex">
                        <div className="bg-blue-800 rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <span className="text-xs">3</span>
                        </div>
                        <div>
                          <p className="font-medium">Changez vos mots de passe</p>
                          <p className="text-sm text-blue-200">Modifiez immédiatement les identifiants potentiellement compromis</p>
                        </div>
                      </li>
                      <li className="flex">
                        <div className="bg-blue-800 rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <span className="text-xs">4</span>
                        </div>
                        <div>
                          <p className="font-medium">Documentez l'incident</p>
                          <p className="text-sm text-blue-200">Conservez le message suspect comme preuve et notez vos actions</p>
                        </div>
                      </li>
                    </ol>
                  </div>

                  <div className="bg-gradient-to-r from-cyan-900/40 to-blue-900/40 border-l-4 border-cyan-500 p-4 my-4 rounded-r-lg">
                    <h4 className="font-bold text-cyan-300">✨ À retenir</h4>
                    <p className="mt-1">
                      La défense contre le phishing n'est jamais parfaite à 100%. Une approche en profondeur, combinant 
                      technologies, sensibilisation et procédures claires, est votre meilleure protection contre ces attaques sophistiquées.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Section Exercice pratique */}
              {currentSection === 'exercice' && (
                <motion.div variants={itemVariants}>
                  <h2 className="text-2xl font-bold mb-4">Exercice pratique : Détection de phishing</h2>

                  <p className="mb-4">
                    Testez vos nouvelles compétences en analysant ces exemples de messages pour 
                    déterminer s'il s'agit d'une tentative de phishing ou d'une communication légitime.
                  </p>

                  <div className="space-y-6 mb-6">
                    {/* Exemple 1 */}
                    <div className="p-4 bg-blue-900/30 rounded-lg border border-blue-800">
                      <h3 className="font-bold mb-3">Exemple 1 : Email professionnel</h3>
                      <div className="bg-blue-950/50 p-3 rounded-lg mb-3 text-sm">
                        <p className="mb-1"><strong>De :</strong> ressources-humaines@entreprise-legit.c0m</p>
                        <p className="mb-1"><strong>Objet :</strong> Urgent - Mise à jour de vos coordonnées bancaires</p>
                        <p className="mb-3"><strong>Message :</strong></p>
                        <div className="p-3 bg-blue-950 rounded">
                          <p className="mb-2">Cher(e) collègue,</p>
                          <p className="mb-2">Notre système a détecté que vos coordonnées bancaires doivent être mises à jour de toute urgence pour le versement de votre salaire ce mois-ci.</p>
                          <p className="mb-2">Veuillez cliquer sur ce lien pour accéder au portail de mise à jour : <span className="text-blue-400 underline">https://portail-rh-secure.entreprise-info.com/update</span></p>
                          <p className="mb-2">Cette opération doit être effectuée dans les 24h, sans quoi votre paiement pourrait être retardé.</p>
                          <p>Cordialement,<br />Le Service RH</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center">
                          <input type="radio" id="ex1-phishing" name="ex1" className="mr-2" />
                          <label htmlFor="ex1-phishing">Phishing</label>
                        </div>
                        <div className="flex items-center">
                          <input type="radio" id="ex1-legitime" name="ex1" className="mr-2" />
                          <label htmlFor="ex1-legitime">Légitime</label>
                        </div>
                      </div>

                      <button className="mt-3 text-sm text-blue-400 flex items-center" onClick={() => {}}>
                        Voir l'explication
                        <ChevronDown className="h-4 w-4 ml-1" />
                      </button>

                      {/* Solution cachée par défaut */}
                      <div className="mt-2 p-3 bg-blue-900/40 rounded-lg hidden">
                        <h4 className="font-bold text-red-400">Phishing</h4>
                        <ul className="mt-1 space-y-1 text-sm">
                          <li>• Adresse email avec domaine suspect (.c0m au lieu de .com)</li>
                          <li>• Création d'urgence artificielle</li>
                          <li>• URL ne correspondant pas au domaine officiel de l'entreprise</li>
                          <li>• Demande d'informations bancaires sensibles</li>
                        </ul>
                      </div>
                    </div>

                    {/* Exemple 2 */}
                    <div className="p-4 bg-blue-900/30 rounded-lg border border-blue-800">
                      <h3 className="font-bold mb-3">Exemple 2 : Message de service cloud</h3>
                      <div className="bg-blue-950/50 p-3 rounded-lg mb-3 text-sm">
                        <p className="mb-1"><strong>De :</strong> notification@cloudservice.com</p>
                        <p className="mb-1"><strong>Objet :</strong> Votre document a été partagé</p>
                        <p className="mb-3"><strong>Message :</strong></p>
                        <div className="p-3 bg-blue-950 rounded">
                          <p className="mb-2">Bonjour,</p>
                          <p className="mb-2">Martin Dupont (martin.dupont@entreprise.com) a partagé un document avec vous : "Plan stratégique 2024.pdf"</p>
                          <p className="mb-2">Vous pouvez y accéder en vous connectant à votre compte CloudService.</p>
                          <p className="mb-2">Si vous n'avez pas de compte, vous serez invité à en créer un gratuitement.</p>
                          <p>L'équipe CloudService</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center">
                          <input type="radio" id="ex2-phishing" name="ex2" className="mr-2" />
                          <label htmlFor="ex2-phishing">Phishing</label>
                        </div>
                        <div className="flex items-center">
                          <input type="radio" id="ex2-legitime" name="ex2" className="mr-2" />
                          <label htmlFor="ex2-legitime">Légitime</label>
                        </div>
                      </div>

                      <button className="mt-3 text-sm text-blue-400 flex items-center" onClick={() => {}}>
                        Voir l'explication
                        <ChevronDown className="h-4 w-4 ml-1" />
                      </button>

                      {/* Solution cachée par défaut */}
                      <div className="mt-2 p-3 bg-blue-900/40 rounded-lg hidden">
                        <h4 className="font-bold text-green-400">Probablement légitime</h4>
                        <ul className="mt-1 space-y-1 text-sm">
                          <li>• L'adresse email correspond au nom de domaine mentionné</li>
                          <li>• Pas de lien direct dans le message</li>
                          <li>• Pas de sentiment d'urgence</li>
                          <li>• Information contextuelle précise (nom, email, nom du document)</li>
                          <li>• Bonne pratique tout de même : vérifier auprès de Martin si l'envoi est légitime</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full bg-blue-700 hover:bg-blue-800" onClick={() => markSectionCompleted('exercice')}>
                    Terminer l'exercice
                  </Button>
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