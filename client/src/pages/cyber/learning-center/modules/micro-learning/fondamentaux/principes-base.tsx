import React, { useState } from 'react';
import { Link } from 'wouter';
import {
  ArrowLeft,
  BookOpen,
  Shield,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  DownloadCloud,
  ExternalLink,
  File,
  LightbulbIcon,
  Clock,
  Lock,
  Database,
  FileText,
  XCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageTitle from '@/components/utils/PageTitle';

export default function PrincipesBaseMicroLearning() {
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
      id: 'cia-triad',
      title: 'La triade CIA',
      completed: completedSections.includes('cia-triad')
    },
    {
      id: 'defense-in-depth',
      title: 'Défense en profondeur',
      completed: completedSections.includes('defense-in-depth')
    },
    {
      id: 'least-privilege',
      title: 'Moindre privilège',
      completed: completedSections.includes('least-privilege')
    },
    {
      id: 'quiz',
      title: 'Quiz rapide',
      completed: completedSections.includes('quiz')
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
          title="Principes de base en cybersécurité"
          subtitle="Les piliers fondamentaux d'une approche de cybersécurité efficace"
          icon={<Shield className="h-8 w-8 text-blue-500" />}
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
                Référentiels externes
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
                  <h2 className="text-2xl font-bold mb-4">Introduction aux principes fondamentaux</h2>
                  
                  <p className="mb-4">
                    La cybersécurité s'appuie sur plusieurs principes fondamentaux qui forment la base de toute
                    stratégie de protection efficace. Ces principes, lorsqu'ils sont correctement appliqués,
                    permettent aux organisations de faire face aux menaces toujours plus sophistiquées
                    du monde numérique.
                  </p>
                  
                  <div className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 p-4 rounded-lg border border-blue-700 mb-4">
                    <h3 className="font-bold text-lg mb-2 text-blue-300">Objectifs d'apprentissage</h3>
                    <ul className="list-disc list-inside space-y-1 text-blue-200">
                      <li>Comprendre les trois piliers de la triade CIA</li>
                      <li>Maîtriser le concept de défense en profondeur</li>
                      <li>Appréhender le principe du moindre privilège</li>
                      <li>Appliquer ces principes dans des situations concrètes</li>
                    </ul>
                  </div>
                  
                  <p className="mb-4">
                    Dans cette session de micro-learning, nous aborderons les principes les plus fondamentaux
                    que tout professionnel de la cybersécurité doit connaître, illustrés par des exemples
                    concrets tirés de situations réelles.
                  </p>
                  
                  <div className="flex items-center p-3 bg-blue-800/30 rounded-lg text-blue-200 text-sm">
                    <LightbulbIcon className="h-5 w-5 mr-2 text-yellow-400" />
                    <span>
                      <strong>Conseil :</strong> Prenez des notes pendant votre progression dans ce module. 
                      Ces principes fondamentaux reviendront systématiquement dans tous les aspects de la cybersécurité.
                    </span>
                  </div>
                </motion.div>
              )}
              
              {/* Section Triade CIA */}
              {currentSection === 'cia-triad' && (
                <motion.div variants={itemVariants}>
                  <h2 className="text-2xl font-bold mb-4">La triade CIA : Confidentialité, Intégrité, Disponibilité</h2>
                  
                  <p className="mb-4">
                    La triade CIA est l'un des modèles les plus fondamentaux de la cybersécurité,
                    représentant les trois objectifs principaux que tout système de sécurité doit viser.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gradient-to-b from-blue-900/30 to-blue-900/10 p-4 rounded-lg border border-blue-800">
                      <div className="rounded-full bg-blue-800/50 w-12 h-12 flex items-center justify-center mb-3">
                        <Lock className="h-6 w-6 text-blue-300" />
                      </div>
                      <h3 className="font-bold text-lg mb-2 text-blue-300">Confidentialité</h3>
                      <p className="text-sm">
                        Protection des données contre l'accès non autorisé. Seules les personnes
                        ou systèmes autorisés peuvent accéder à l'information.
                      </p>
                      <div className="mt-3 p-2 bg-blue-900/40 rounded text-xs">
                        <strong>Exemple :</strong> Le chiffrement des données sensibles en transit et au repos.
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-b from-green-900/30 to-green-900/10 p-4 rounded-lg border border-green-800">
                      <div className="rounded-full bg-green-800/50 w-12 h-12 flex items-center justify-center mb-3">
                        <Shield className="h-6 w-6 text-green-300" />
                      </div>
                      <h3 className="font-bold text-lg mb-2 text-green-300">Intégrité</h3>
                      <p className="text-sm">
                        Garantie que les données n'ont pas été modifiées, altérées ou détruites
                        de manière non autorisée ou accidentelle.
                      </p>
                      <div className="mt-3 p-2 bg-green-900/40 rounded text-xs">
                        <strong>Exemple :</strong> Utilisation de sommes de contrôle et de signatures numériques.
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-b from-purple-900/30 to-purple-900/10 p-4 rounded-lg border border-purple-800">
                      <div className="rounded-full bg-purple-800/50 w-12 h-12 flex items-center justify-center mb-3">
                        <Database className="h-6 w-6 text-purple-300" />
                      </div>
                      <h3 className="font-bold text-lg mb-2 text-purple-300">Disponibilité</h3>
                      <p className="text-sm">
                        Assurance que les systèmes et données sont accessibles aux utilisateurs
                        autorisés quand ils en ont besoin.
                      </p>
                      <div className="mt-3 p-2 bg-purple-900/40 rounded text-xs">
                        <strong>Exemple :</strong> Redondance des systèmes, sauvegardes régulières, plans de continuité.
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="font-bold text-lg mb-2">Équilibre entre les trois piliers</h3>
                    <p className="mb-3">
                      Une stratégie de cybersécurité efficace cherche à atteindre un équilibre entre ces trois principes.
                      Renforcer un aspect peut parfois affecter les autres :
                    </p>
                    <ul className="list-disc list-inside space-y-1 pl-4">
                      <li>
                        Augmenter la <span className="text-blue-300">confidentialité</span> (ex: chiffrement plus complexe)
                        peut réduire la <span className="text-purple-300">disponibilité</span> (délais de traitement plus longs)
                      </li>
                      <li>
                        Améliorer la <span className="text-purple-300">disponibilité</span> (ex: réplication des données)
                        peut compliquer la gestion de l'<span className="text-green-300">intégrité</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-900/30 border-l-4 border-blue-500 p-4 my-4">
                    <h4 className="font-bold text-blue-300">🛡️ À retenir</h4>
                    <p className="mt-1">
                      La triade CIA est comme un tabouret à trois pieds : si l'un des pieds est défaillant ou disproportionné, 
                      l'ensemble de la structure devient instable. Une bonne sécurité exige un équilibre entre ces trois principes 
                      fondamentaux.
                    </p>
                  </div>
                </motion.div>
              )}
              
              {/* Section Défense en profondeur */}
              {currentSection === 'defense-in-depth' && (
                <motion.div variants={itemVariants}>
                  <h2 className="text-2xl font-bold mb-4">Défense en profondeur : Des couches de protection</h2>
                  
                  <p className="mb-4">
                    La défense en profondeur est une approche de cybersécurité qui emploie plusieurs mesures de protection
                    en couches pour protéger les systèmes et les données. Si une défense échoue, d'autres sont en place
                    pour stopper l'attaque.
                  </p>
                  
                  <div className="relative my-8">
                    <div className="flex flex-col items-center">
                      <div className="w-full max-w-2xl">
                        {/* Couche 1 */}
                        <div className="bg-gradient-to-r from-red-900/40 to-orange-900/40 p-4 rounded-lg border border-red-800 mb-4">
                          <h3 className="font-bold text-lg mb-1 text-orange-300">Couche 1 : Périmètre extérieur</h3>
                          <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                              <p className="text-sm">
                                Protection des frontières de votre environnement informatique contre les intrusions provenant d'internet.
                              </p>
                            </div>
                            <div className="md:w-1/3">
                              <ul className="text-xs space-y-1 bg-red-900/20 p-2 rounded">
                                <li><span className="font-bold">Mécanismes :</span> Pare-feu périmétrique, WAF, filtrage réseau</li>
                                <li><span className="font-bold">Objectif :</span> Bloquer les menaces externes avant qu'elles n'atteignent vos systèmes</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                        
                        {/* Flèche */}
                        <div className="flex justify-center -my-2">
                          <ChevronDown className="h-6 w-6 text-blue-500" />
                        </div>
                        
                        {/* Couche 2 */}
                        <div className="bg-gradient-to-r from-yellow-900/40 to-amber-900/40 p-4 rounded-lg border border-yellow-800 mb-4">
                          <h3 className="font-bold text-lg mb-1 text-yellow-300">Couche 2 : Réseau interne</h3>
                          <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                              <p className="text-sm">
                                Segmentation et surveillance du réseau interne pour limiter les mouvements latéraux des attaquants.
                              </p>
                            </div>
                            <div className="md:w-1/3">
                              <ul className="text-xs space-y-1 bg-yellow-900/20 p-2 rounded">
                                <li><span className="font-bold">Mécanismes :</span> Segmentation réseau, IDS/IPS, pare-feu internes</li>
                                <li><span className="font-bold">Objectif :</span> Confiner les intrusions et détecter les activités suspectes</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                        
                        {/* Flèche */}
                        <div className="flex justify-center -my-2">
                          <ChevronDown className="h-6 w-6 text-blue-500" />
                        </div>
                        
                        {/* Couche 3 */}
                        <div className="bg-gradient-to-r from-green-900/40 to-emerald-900/40 p-4 rounded-lg border border-green-800 mb-4">
                          <h3 className="font-bold text-lg mb-1 text-green-300">Couche 3 : Point final</h3>
                          <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                              <p className="text-sm">
                                Protection des appareils individuels qui accèdent aux données et services de l'entreprise.
                              </p>
                            </div>
                            <div className="md:w-1/3">
                              <ul className="text-xs space-y-1 bg-green-900/20 p-2 rounded">
                                <li><span className="font-bold">Mécanismes :</span> Antivirus, EDR, durcissement des systèmes</li>
                                <li><span className="font-bold">Objectif :</span> Protéger chaque appareil contre les logiciels malveillants</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                        
                        {/* Flèche */}
                        <div className="flex justify-center -my-2">
                          <ChevronDown className="h-6 w-6 text-blue-500" />
                        </div>
                        
                        {/* Couche 4 */}
                        <div className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 p-4 rounded-lg border border-blue-800">
                          <h3 className="font-bold text-lg mb-1 text-blue-300">Couche 4 : Données</h3>
                          <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                              <p className="text-sm">
                                Sécurisation des données elles-mêmes, indépendamment de l'infrastructure.
                              </p>
                            </div>
                            <div className="md:w-1/3">
                              <ul className="text-xs space-y-1 bg-blue-900/20 p-2 rounded">
                                <li><span className="font-bold">Mécanismes :</span> Chiffrement, contrôle d'accès, DLP</li>
                                <li><span className="font-bold">Objectif :</span> Protéger les données même si toutes les autres défenses échouent</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="font-bold text-lg mb-2">Bénéfices de la défense en profondeur</h3>
                    <ul className="list-disc list-inside space-y-1 pl-4">
                      <li>
                        <span className="text-green-400 font-medium">Résilience accrue</span> - Une seule faille ne compromet pas tout le système
                      </li>
                      <li>
                        <span className="text-green-400 font-medium">Temps de détection amélioré</span> - Plusieurs points d'observation des menaces
                      </li>
                      <li>
                        <span className="text-green-400 font-medium">Ralentissement des attaquants</span> - Augmente le coût et le temps nécessaires pour les intrus
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border-l-4 border-purple-500 p-4 my-4 rounded-r-lg">
                    <h4 className="font-bold text-purple-300">✨ À retenir</h4>
                    <p className="mt-1">
                      La défense en profondeur peut être comparée à un château médiéval : douves, murailles, tours de guet, 
                      gardes et coffres verrouillés pour le trésor - chaque couche offre une protection supplémentaire 
                      en cas d'échec des défenses précédentes.
                    </p>
                  </div>
                </motion.div>
              )}
              
              {/* Section Moindre privilège */}
              {currentSection === 'least-privilege' && (
                <motion.div variants={itemVariants}>
                  <h2 className="text-2xl font-bold mb-4">Principe du moindre privilège</h2>
                  
                  <p className="mb-4">
                    Le principe du moindre privilège stipule que chaque utilisateur, système ou processus ne devrait avoir
                    que les droits d'accès minimums nécessaires pour accomplir ses tâches légitimes.
                  </p>
                  
                  <div className="p-5 bg-gradient-to-r from-blue-900/30 to-blue-800/30 rounded-lg border border-blue-700 mb-6">
                    <h3 className="font-bold text-lg mb-3 text-blue-300">Mise en application</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-green-900/20 p-3 rounded-lg border border-green-800/50">
                        <h4 className="font-bold text-green-400 mb-2">Ce qu'il faut faire ✓</h4>
                        <ul className="space-y-2">
                          <li className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                            <span>Attribuer uniquement les permissions minimales requises</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                            <span>Réévaluer régulièrement les droits d'accès</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                            <span>Utiliser des élévations temporaires de privilèges au besoin</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div className="bg-red-900/20 p-3 rounded-lg border border-red-800/50">
                        <h4 className="font-bold text-red-400 mb-2">Ce qu'il faut éviter ✗</h4>
                        <ul className="space-y-2">
                          <li className="flex items-start">
                            <XCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                            <span>Accorder des privilèges d'administrateur par défaut</span>
                          </li>
                          <li className="flex items-start">
                            <XCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                            <span>Utiliser des comptes partagés avec privilèges élevés</span>
                          </li>
                          <li className="flex items-start">
                            <XCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                            <span>Conserver des accès obsolètes ou inutilisés</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="font-bold text-lg mb-3">Étude de cas : Violation de privilèges</h3>
                    <div className="p-4 bg-blue-900/30 rounded-lg">
                      <p className="text-sm text-blue-200 mb-3">
                        En 2020, une grande plateforme de médias sociaux a subi une compromission
                        majeure lorsque plusieurs comptes de personnalités ont été piratés pour
                        diffuser une arnaque aux cryptomonnaies. L'origine ? Des employés du support
                        technique disposant de privilèges excessifs sur les comptes utilisateurs.
                      </p>
                      <p className="text-sm text-blue-300 font-medium">
                        Leçon apprise : Si les outils administratifs avaient suivi le principe du moindre privilège,
                        l'impact de cette attaque aurait été considérablement réduit.
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-cyan-900/40 to-blue-900/40 border-l-4 border-cyan-500 p-4 my-4 rounded-r-lg">
                    <h4 className="font-bold text-cyan-300">💡 À retenir</h4>
                    <p className="mt-1">
                      Le principe du moindre privilège est comme la distribution des clés dans un hôtel :
                      le personnel d'entretien n'a pas besoin d'accéder au coffre-fort, le réceptionniste n'a pas besoin
                      d'accéder aux locaux techniques, et chaque client n'a accès qu'à sa propre chambre.
                    </p>
                  </div>
                </motion.div>
              )}
              
              {/* Quiz */}
              {currentSection === 'quiz' && (
                <motion.div variants={itemVariants}>
                  <h2 className="text-2xl font-bold mb-4">Quiz rapide</h2>
                  
                  <p className="mb-6">
                    Testez vos connaissances sur les principes fondamentaux de la cybersécurité.
                  </p>
                  
                  <div className="space-y-6">
                    {/* Question 1 */}
                    <div className="p-4 bg-blue-900/30 rounded-lg border border-blue-800">
                      <h3 className="font-bold mb-3">Question 1 : Triade CIA</h3>
                      <p className="mb-3">Parmi les éléments suivants, lequel n'appartient PAS à la triade CIA ?</p>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <input type="radio" id="q1-a" name="q1" className="mr-2" />
                          <label htmlFor="q1-a">Confidentialité</label>
                        </div>
                        <div className="flex items-center">
                          <input type="radio" id="q1-b" name="q1" className="mr-2" />
                          <label htmlFor="q1-b">Intégrité</label>
                        </div>
                        <div className="flex items-center">
                          <input type="radio" id="q1-c" name="q1" className="mr-2" />
                          <label htmlFor="q1-c">Authentification</label>
                        </div>
                        <div className="flex items-center">
                          <input type="radio" id="q1-d" name="q1" className="mr-2" />
                          <label htmlFor="q1-d">Disponibilité</label>
                        </div>
                      </div>
                    </div>
                    
                    {/* Question 2 */}
                    <div className="p-4 bg-blue-900/30 rounded-lg border border-blue-800">
                      <h3 className="font-bold mb-3">Question 2 : Défense en profondeur</h3>
                      <p className="mb-3">Quel est l'avantage principal de la défense en profondeur ?</p>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <input type="radio" id="q2-a" name="q2" className="mr-2" />
                          <label htmlFor="q2-a">Elle réduit les coûts de cybersécurité</label>
                        </div>
                        <div className="flex items-center">
                          <input type="radio" id="q2-b" name="q2" className="mr-2" />
                          <label htmlFor="q2-b">Elle simplifie la gestion des systèmes</label>
                        </div>
                        <div className="flex items-center">
                          <input type="radio" id="q2-c" name="q2" className="mr-2" />
                          <label htmlFor="q2-c">Elle offre une protection même si une couche est compromise</label>
                        </div>
                        <div className="flex items-center">
                          <input type="radio" id="q2-d" name="q2" className="mr-2" />
                          <label htmlFor="q2-d">Elle accélère les performances du réseau</label>
                        </div>
                      </div>
                    </div>
                    
                    {/* Question 3 */}
                    <div className="p-4 bg-blue-900/30 rounded-lg border border-blue-800">
                      <h3 className="font-bold mb-3">Question 3 : Moindre privilège</h3>
                      <p className="mb-3">Laquelle des pratiques suivantes est conforme au principe du moindre privilège ?</p>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <input type="radio" id="q3-a" name="q3" className="mr-2" />
                          <label htmlFor="q3-a">Donner à tous les développeurs des droits administrateur sur les serveurs de production</label>
                        </div>
                        <div className="flex items-center">
                          <input type="radio" id="q3-b" name="q3" className="mr-2" />
                          <label htmlFor="q3-b">Utiliser un compte partagé pour les opérations de maintenance</label>
                        </div>
                        <div className="flex items-center">
                          <input type="radio" id="q3-c" name="q3" className="mr-2" />
                          <label htmlFor="q3-c">Accorder temporairement des privilèges élevés pour des tâches spécifiques</label>
                        </div>
                        <div className="flex items-center">
                          <input type="radio" id="q3-d" name="q3" className="mr-2" />
                          <label htmlFor="q3-d">Maintenir les mêmes niveaux d'accès pour tous les employés</label>
                        </div>
                      </div>
                    </div>
                    
                    <Button className="w-full bg-blue-700 hover:bg-blue-800" onClick={() => markSectionCompleted('quiz')}>
                      Soumettre les réponses
                    </Button>
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