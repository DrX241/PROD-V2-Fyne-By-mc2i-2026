import React, { useState } from 'react';
import { Link } from 'wouter';
import {
  ArrowLeft,
  Shield,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  LightbulbIcon,
  Clock,
  FileText,
  AlertTriangle,
  Eye,
  Unlock,
  Database,
  ActivitySquare,
  FileWarning,
  FileCheck,
  ChevronsUpDown,
  Check,
  XCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
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
      id: 'cia',
      title: 'Triade CIA',
      completed: completedSections.includes('cia')
    },
    {
      id: 'defense-profondeur',
      title: 'Défense en profondeur',
      completed: completedSections.includes('defense-profondeur')
    },
    {
      id: 'modele-menaces',
      title: 'Modèle de menaces',
      completed: completedSections.includes('modele-menaces')
    },
    {
      id: 'securite-conception',
      title: 'Sécurité par conception',
      completed: completedSections.includes('securite-conception')
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
          subtitle="Fondamentaux et piliers essentiels de la sécurité informatique"
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
                <FileWarning className="mr-2 h-4 w-4" />
                Exemples d'incidents
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
                  <h2 className="text-2xl font-bold mb-4">Introduction aux fondamentaux de la cybersécurité</h2>
                  
                  <p className="mb-4">
                    La cybersécurité est l'ensemble des pratiques, technologies et processus conçus pour protéger 
                    les systèmes informatiques, les réseaux, les programmes et les données contre les attaques, les 
                    dommages ou les accès non autorisés.
                  </p>
                  
                  <div className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 p-4 rounded-lg border border-blue-700 mb-6">
                    <h3 className="font-bold text-lg mb-2 text-blue-300">Objectifs d'apprentissage</h3>
                    <ul className="list-disc list-inside space-y-1 text-blue-200">
                      <li>Comprendre les principes fondamentaux de la cybersécurité</li>
                      <li>Maîtriser la triade CIA (Confidentialité, Intégrité, Disponibilité)</li>
                      <li>Assimiler le concept de défense en profondeur</li>
                      <li>Savoir établir un modèle de menaces basique</li>
                      <li>Intégrer la sécurité dès la conception des systèmes</li>
                    </ul>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="font-bold text-lg mb-3">L'importance croissante de la cybersécurité</h3>
                    <p className="mb-4">
                      Dans un monde de plus en plus connecté et dépendant des technologies numériques, la 
                      cybersécurité est devenue un enjeu majeur pour les individus, les entreprises et les 
                      gouvernements.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-red-900/30 p-4 rounded-lg border border-red-800">
                        <h4 className="font-semibold text-red-300 mb-2 flex items-center">
                          <AlertTriangle className="h-5 w-5 mr-2 text-red-300" />
                          Risques en hausse
                        </h4>
                        <ul className="space-y-1 text-sm">
                          <li>• Augmentation de 300% des cyberattaques depuis 2020</li>
                          <li>• Coût moyen d'une violation de données : 4,2 millions €</li>
                          <li>• 95% des incidents de sécurité impliquent une erreur humaine</li>
                        </ul>
                      </div>
                      
                      <div className="bg-green-900/30 p-4 rounded-lg border border-green-800">
                        <h4 className="font-semibold text-green-300 mb-2 flex items-center">
                          <FileCheck className="h-5 w-5 mr-2 text-green-300" />
                          Bénéfices d'une bonne sécurité
                        </h4>
                        <ul className="space-y-1 text-sm">
                          <li>• Protection des données sensibles</li>
                          <li>• Continuité des activités garantie</li>
                          <li>• Confiance accrue des clients et partenaires</li>
                          <li>• Conformité aux exigences légales</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="font-bold text-lg mb-3">Les cinq piliers fondamentaux</h3>
                    <p className="mb-3">
                      Pour maîtriser la cybersécurité, il est essentiel de comprendre ces cinq piliers qui 
                      forment la base de toute stratégie efficace:
                    </p>
                    
                    <div className="flex flex-col space-y-3 mb-4">
                      <div className="flex items-start">
                        <div className="bg-blue-700 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <span className="font-bold">1</span>
                        </div>
                        <div>
                          <p className="font-medium text-blue-300">La triade CIA</p>
                          <p className="text-sm">
                            Confidentialité, Intégrité et Disponibilité - les trois propriétés fondamentales 
                            de la sécurité de l'information.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="bg-blue-700 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <span className="font-bold">2</span>
                        </div>
                        <div>
                          <p className="font-medium text-blue-300">Défense en profondeur</p>
                          <p className="text-sm">
                            Approche multicouche qui utilise plusieurs mesures de sécurité pour protéger les 
                            ressources sensibles.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="bg-blue-700 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <span className="font-bold">3</span>
                        </div>
                        <div>
                          <p className="font-medium text-blue-300">Modélisation des menaces</p>
                          <p className="text-sm">
                            Processus d'identification, de compréhension et de priorisation des menaces potentielles.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="bg-blue-700 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <span className="font-bold">4</span>
                        </div>
                        <div>
                          <p className="font-medium text-blue-300">Principe du moindre privilège</p>
                          <p className="text-sm">
                            N'accorder que les accès minimums nécessaires pour accomplir une tâche donnée.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="bg-blue-700 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <span className="font-bold">5</span>
                        </div>
                        <div>
                          <p className="font-medium text-blue-300">Sécurité par conception</p>
                          <p className="text-sm">
                            Intégration des considérations de sécurité dès les premières étapes de développement.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 bg-blue-800/30 rounded-lg text-blue-200 text-sm">
                    <LightbulbIcon className="h-5 w-5 mr-2 text-yellow-400" />
                    <span>
                      <strong>Conseil :</strong> Les fondamentaux de la cybersécurité ne sont pas des concepts 
                      abstraits, mais des principes applicables dans votre vie numérique quotidienne. En comprenant 
                      ces bases, vous pourrez mieux protéger vos données personnelles et professionnelles.
                    </span>
                  </div>
                </motion.div>
              )}
              
              {/* Section Triade CIA */}
              {currentSection === 'cia' && (
                <motion.div variants={itemVariants}>
                  <h2 className="text-2xl font-bold mb-4">La triade CIA : le cœur de la sécurité de l'information</h2>
                  
                  <p className="mb-4">
                    La triade CIA (Confidentialité, Intégrité, Disponibilité) représente les trois objectifs 
                    fondamentaux de la sécurité de l'information. Ces principes permettent d'évaluer la sécurité 
                    d'un système et de définir les mesures à mettre en place.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-700">
                      <div className="rounded-full bg-blue-800/70 w-12 h-12 flex items-center justify-center mb-3">
                        <Eye className="h-6 w-6 text-blue-300" />
                      </div>
                      <h3 className="font-bold text-lg mb-2 text-blue-300">Confidentialité</h3>
                      <p className="text-sm mb-3">
                        La garantie que les informations sensibles ne sont pas divulguées à des personnes ou 
                        systèmes non autorisés. Seuls ceux qui ont des droits d'accès peuvent voir les données.
                      </p>
                      <div className="bg-blue-900/40 p-2 rounded">
                        <p className="text-xs font-medium text-blue-200 mb-1">Exemples de mesures:</p>
                        <ul className="text-xs space-y-1">
                          <li className="flex items-start">
                            <Check className="h-3 w-3 text-green-500 mr-1 mt-0.5" />
                            <span>Chiffrement des données</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-3 w-3 text-green-500 mr-1 mt-0.5" />
                            <span>Contrôle d'accès</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-3 w-3 text-green-500 mr-1 mt-0.5" />
                            <span>Authentification multifacteur</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="bg-green-900/30 p-4 rounded-lg border border-green-700">
                      <div className="rounded-full bg-green-800/70 w-12 h-12 flex items-center justify-center mb-3">
                        <FileCheck className="h-6 w-6 text-green-300" />
                      </div>
                      <h3 className="font-bold text-lg mb-2 text-green-300">Intégrité</h3>
                      <p className="text-sm mb-3">
                        L'assurance que les données n'ont pas été altérées de manière non autorisée. 
                        Les informations restent exactes, complètes et fiables pendant leur cycle de vie.
                      </p>
                      <div className="bg-green-900/40 p-2 rounded">
                        <p className="text-xs font-medium text-green-200 mb-1">Exemples de mesures:</p>
                        <ul className="text-xs space-y-1">
                          <li className="flex items-start">
                            <Check className="h-3 w-3 text-green-500 mr-1 mt-0.5" />
                            <span>Signatures électroniques</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-3 w-3 text-green-500 mr-1 mt-0.5" />
                            <span>Hachage cryptographique</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-3 w-3 text-green-500 mr-1 mt-0.5" />
                            <span>Registres d'audit</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="bg-amber-900/30 p-4 rounded-lg border border-amber-700">
                      <div className="rounded-full bg-amber-800/70 w-12 h-12 flex items-center justify-center mb-3">
                        <ActivitySquare className="h-6 w-6 text-amber-300" />
                      </div>
                      <h3 className="font-bold text-lg mb-2 text-amber-300">Disponibilité</h3>
                      <p className="text-sm mb-3">
                        La certitude que les systèmes et données sont accessibles par les utilisateurs 
                        autorisés quand ils en ont besoin. Les ressources doivent fonctionner de manière fiable.
                      </p>
                      <div className="bg-amber-900/40 p-2 rounded">
                        <p className="text-xs font-medium text-amber-200 mb-1">Exemples de mesures:</p>
                        <ul className="text-xs space-y-1">
                          <li className="flex items-start">
                            <Check className="h-3 w-3 text-green-500 mr-1 mt-0.5" />
                            <span>Systèmes redondants</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-3 w-3 text-green-500 mr-1 mt-0.5" />
                            <span>Sauvegardes régulières</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-3 w-3 text-green-500 mr-1 mt-0.5" />
                            <span>Plan de reprise d'activité</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="font-bold text-lg mb-3">L'équilibre des trois piliers</h3>
                    <p className="mb-3">
                      Trouver le bon équilibre entre ces trois principes est essentiel, car ils peuvent parfois 
                      sembler contradictoires. Par exemple:
                    </p>
                    
                    <div className="bg-blue-900/20 p-4 rounded-lg mb-4">
                      <div className="flex items-start mb-3">
                        <ChevronsUpDown className="h-5 w-5 text-blue-400 mr-2 mt-0.5" />
                        <div>
                          <p className="font-medium text-blue-300">Tension confidentialité vs disponibilité</p>
                          <p className="text-sm">
                            Un système ultra-sécurisé avec multiples niveaux d'authentification (renforçant la 
                            confidentialité) peut devenir difficile d'accès et réduire la disponibilité.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <ChevronsUpDown className="h-5 w-5 text-blue-400 mr-2 mt-0.5" />
                        <div>
                          <p className="font-medium text-blue-300">Tension intégrité vs disponibilité</p>
                          <p className="text-sm">
                            Les mécanismes de vérification d'intégrité peuvent ralentir les systèmes et 
                            affecter la disponibilité si les contrôles sont trop stricts ou mal optimisés.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="font-bold text-lg mb-3">Applications pratiques</h3>
                    <p className="mb-3">
                      La triade CIA est appliquée à tous les niveaux de la sécurité informatique:
                    </p>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-blue-800/50">
                            <th className="border border-blue-700 p-2 text-left">Domaine</th>
                            <th className="border border-blue-700 p-2 text-left">Confidentialité</th>
                            <th className="border border-blue-700 p-2 text-left">Intégrité</th>
                            <th className="border border-blue-700 p-2 text-left">Disponibilité</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="bg-blue-900/20">
                            <td className="border border-blue-700 p-2 font-medium">Données</td>
                            <td className="border border-blue-700 p-2 text-sm">Chiffrement des fichiers sensibles</td>
                            <td className="border border-blue-700 p-2 text-sm">Contrôle de version, signatures</td>
                            <td className="border border-blue-700 p-2 text-sm">Systèmes de stockage redondants</td>
                          </tr>
                          <tr className="bg-blue-900/30">
                            <td className="border border-blue-700 p-2 font-medium">Réseau</td>
                            <td className="border border-blue-700 p-2 text-sm">VPN, tunnels sécurisés</td>
                            <td className="border border-blue-700 p-2 text-sm">Détection d'intrusion</td>
                            <td className="border border-blue-700 p-2 text-sm">Routes alternatives, équilibrage de charge</td>
                          </tr>
                          <tr className="bg-blue-900/20">
                            <td className="border border-blue-700 p-2 font-medium">Applications</td>
                            <td className="border border-blue-700 p-2 text-sm">Contrôle d'accès RBAC</td>
                            <td className="border border-blue-700 p-2 text-sm">Validation des entrées</td>
                            <td className="border border-blue-700 p-2 text-sm">Haute disponibilité, scalabilité</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border-l-4 border-blue-500 p-4 my-4 rounded-r-lg">
                    <h4 className="font-bold text-blue-300">À retenir</h4>
                    <p className="mt-1">
                      La triade CIA n'est pas seulement un concept théorique, mais un cadre pratique qui 
                      guide toutes les décisions de sécurité. Chaque mesure de sécurité implémentée doit renforcer 
                      au moins l'un de ces trois piliers, tout en maintenant un équilibre qui correspond aux besoins 
                      de l'organisation.
                    </p>
                  </div>
                </motion.div>
              )}
              
              {/* Section Défense en profondeur */}
              {currentSection === 'defense-profondeur' && (
                <motion.div variants={itemVariants}>
                  <h2 className="text-2xl font-bold mb-4">Défense en profondeur : une approche stratégique</h2>
                  
                  <p className="mb-4">
                    La défense en profondeur est une stratégie de cybersécurité qui emploie plusieurs couches 
                    de protection pour sécuriser les systèmes d'information. Inspirée des tactiques militaires, 
                    elle repose sur le principe qu'une seule ligne de défense n'est jamais suffisante.
                  </p>
                  
                  <div className="bg-gradient-to-r from-indigo-900/30 to-blue-900/30 p-4 rounded-lg border border-indigo-700 mb-6">
                    <h3 className="font-bold text-lg mb-2 text-indigo-300">Principe fondamental</h3>
                    <p className="mb-3">
                      Si une mesure de sécurité échoue, une autre prend le relais, créant ainsi un système où 
                      un attaquant devrait surmonter de multiples obstacles pour atteindre son objectif.
                    </p>
                    <div className="flex flex-col md:flex-row items-center md:justify-center gap-3 mb-3">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-red-900/60 flex items-center justify-center">
                          <XCircle className="h-5 w-5 text-red-300" />
                        </div>
                        <div className="h-1 w-16 bg-red-700"></div>
                      </div>
                      <div className="text-center px-2 text-sm">
                        Protection<br />unique
                      </div>
                      <div className="h-1 w-16 bg-blue-700"></div>
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-green-900/60 flex items-center justify-center">
                          <Check className="h-5 w-5 text-green-300" />
                        </div>
                        <div className="h-1 w-16 bg-green-700"></div>
                      </div>
                      <div className="text-center px-2 text-sm">
                        Protection<br />multicouche
                      </div>
                    </div>
                    <p className="text-sm text-center italic">
                      "Ne mettez pas tous vos œufs dans le même panier de sécurité."
                    </p>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="font-bold text-lg mb-3">Les 7 couches de la défense en profondeur</h3>
                    
                    <div className="space-y-4">
                      <div className="bg-blue-900/30 p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                          <div className="bg-blue-700 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                            <span className="font-bold">1</span>
                          </div>
                          <h4 className="font-semibold text-blue-300">Politiques, procédures et sensibilisation</h4>
                        </div>
                        <p className="text-sm mb-2 pl-11">
                          La première ligne de défense est administrative: règles claires, formations et 
                          sensibilisation des utilisateurs.
                        </p>
                        <div className="pl-11 bg-blue-900/20 p-2 rounded">
                          <p className="text-xs font-medium">Exemples:</p>
                          <p className="text-xs">• Politique de mot de passe robuste</p>
                          <p className="text-xs">• Formation anti-phishing</p>
                          <p className="text-xs">• Procédures de réponse aux incidents</p>
                        </div>
                      </div>
                      
                      <div className="bg-indigo-900/30 p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                          <div className="bg-indigo-700 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                            <span className="font-bold">2</span>
                          </div>
                          <h4 className="font-semibold text-indigo-300">Sécurité physique</h4>
                        </div>
                        <p className="text-sm mb-2 pl-11">
                          Protection des infrastructures matérielles contre les accès non autorisés et 
                          les incidents environnementaux.
                        </p>
                        <div className="pl-11 bg-indigo-900/20 p-2 rounded">
                          <p className="text-xs font-medium">Exemples:</p>
                          <p className="text-xs">• Contrôle d'accès aux locaux</p>
                          <p className="text-xs">• Systèmes anti-incendie</p>
                          <p className="text-xs">• Vidéosurveillance</p>
                        </div>
                      </div>
                      
                      <div className="bg-purple-900/30 p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                          <div className="bg-purple-700 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                            <span className="font-bold">3</span>
                          </div>
                          <h4 className="font-semibold text-purple-300">Périmètre réseau</h4>
                        </div>
                        <p className="text-sm mb-2 pl-11">
                          Filtrage du trafic entrant et sortant de l'organisation pour identifier et 
                          bloquer les menaces.
                        </p>
                        <div className="pl-11 bg-purple-900/20 p-2 rounded">
                          <p className="text-xs font-medium">Exemples:</p>
                          <p className="text-xs">• Pare-feu</p>
                          <p className="text-xs">• Proxys</p>
                          <p className="text-xs">• Systèmes de détection d'intrusion (IDS/IPS)</p>
                        </div>
                      </div>
                      
                      <div className="bg-cyan-900/30 p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                          <div className="bg-cyan-700 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                            <span className="font-bold">4</span>
                          </div>
                          <h4 className="font-semibold text-cyan-300">Réseau interne</h4>
                        </div>
                        <p className="text-sm mb-2 pl-11">
                          Segmentation et surveillance du réseau interne pour limiter la propagation des menaces.
                        </p>
                        <div className="pl-11 bg-cyan-900/20 p-2 rounded">
                          <p className="text-xs font-medium">Exemples:</p>
                          <p className="text-xs">• VLANs</p>
                          <p className="text-xs">• Analyse de trafic</p>
                          <p className="text-xs">• Détection d'anomalies</p>
                        </div>
                      </div>
                      
                      <div className="bg-emerald-900/30 p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                          <div className="bg-emerald-700 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                            <span className="font-bold">5</span>
                          </div>
                          <h4 className="font-semibold text-emerald-300">Hôte (postes & serveurs)</h4>
                        </div>
                        <p className="text-sm mb-2 pl-11">
                          Protection au niveau des appareils individuels qui constituent le réseau.
                        </p>
                        <div className="pl-11 bg-emerald-900/20 p-2 rounded">
                          <p className="text-xs font-medium">Exemples:</p>
                          <p className="text-xs">• Antivirus/EDR</p>
                          <p className="text-xs">• Pare-feu hôte</p>
                          <p className="text-xs">• Durcissement des systèmes</p>
                        </div>
                      </div>
                      
                      <div className="bg-amber-900/30 p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                          <div className="bg-amber-700 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                            <span className="font-bold">6</span>
                          </div>
                          <h4 className="font-semibold text-amber-300">Application</h4>
                        </div>
                        <p className="text-sm mb-2 pl-11">
                          Sécurisation des logiciels et services utilisés dans l'organisation.
                        </p>
                        <div className="pl-11 bg-amber-900/20 p-2 rounded">
                          <p className="text-xs font-medium">Exemples:</p>
                          <p className="text-xs">• Validation des entrées</p>
                          <p className="text-xs">• Contrôle d'accès aux fonctionnalités</p>
                          <p className="text-xs">• Tests de sécurité réguliers</p>
                        </div>
                      </div>
                      
                      <div className="bg-red-900/30 p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                          <div className="bg-red-700 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                            <span className="font-bold">7</span>
                          </div>
                          <h4 className="font-semibold text-red-300">Données</h4>
                        </div>
                        <p className="text-sm mb-2 pl-11">
                          Protection des informations elles-mêmes, qui sont la cible ultime des attaquants.
                        </p>
                        <div className="pl-11 bg-red-900/20 p-2 rounded">
                          <p className="text-xs font-medium">Exemples:</p>
                          <p className="text-xs">• Chiffrement</p>
                          <p className="text-xs">• Classification des données</p>
                          <p className="text-xs">• Sauvegardes et récupération</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="font-bold text-lg mb-3">Avantages de la défense en profondeur</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-green-900/20 p-3 rounded-lg border border-green-900">
                        <h4 className="font-semibold text-green-300 mb-2">✓ Protection complète</h4>
                        <p className="text-sm">
                          Couvre un large éventail de menaces, de l'erreur utilisateur aux attaques sophistiquées.
                        </p>
                      </div>
                      
                      <div className="bg-green-900/20 p-3 rounded-lg border border-green-900">
                        <h4 className="font-semibold text-green-300 mb-2">✓ Flexibilité</h4>
                        <p className="text-sm">
                          Permet d'adapter le niveau de sécurité en fonction de la sensibilité des ressources.
                        </p>
                      </div>
                      
                      <div className="bg-green-900/20 p-3 rounded-lg border border-green-900">
                        <h4 className="font-semibold text-green-300 mb-2">✓ Temps de réaction</h4>
                        <p className="text-sm">
                          Les couches externes ralentissent les attaquants, donnant plus de temps pour détecter et répondre.
                        </p>
                      </div>
                      
                      <div className="bg-green-900/20 p-3 rounded-lg border border-green-900">
                        <h4 className="font-semibold text-green-300 mb-2">✓ Résilience</h4>
                        <p className="text-sm">
                          L'échec d'une mesure de sécurité n'expose pas immédiatement les actifs critiques.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border-l-4 border-blue-500 p-4 my-4 rounded-r-lg">
                    <h4 className="font-bold text-blue-300">À retenir</h4>
                    <p className="mt-1">
                      La défense en profondeur n'est pas seulement une accumulation de technologies, mais une 
                      approche stratégique qui combine mesures techniques, organisationnelles et humaines. 
                      Elle demande une planification soigneuse et une réévaluation constante pour s'adapter 
                      à l'évolution des menaces.
                    </p>
                  </div>
                </motion.div>
              )}
              
              {/* Section Modèle de menaces */}
              {currentSection === 'modele-menaces' && (
                <motion.div variants={itemVariants}>
                  <h2 className="text-2xl font-bold mb-4">Modélisation des menaces : anticiper pour mieux protéger</h2>
                  
                  <p className="mb-4">
                    La modélisation des menaces est un processus structuré qui permet d'identifier, de quantifier 
                    et de prioriser les risques de sécurité potentiels d'un système. Cette approche proactive 
                    est essentielle pour cibler efficacement les ressources de sécurité.
                  </p>
                  
                  <div className="mb-6">
                    <h3 className="font-bold text-lg mb-3">Le processus en 5 étapes</h3>
                    
                    <div className="relative border-l-2 border-blue-700 pl-6 mb-4 ml-4">
                      <div className="space-y-8">
                        <div>
                          <div className="absolute -left-4 w-8 h-8 rounded-full bg-blue-800 flex items-center justify-center">
                            <span className="font-bold">1</span>
                          </div>
                          <h4 className="font-semibold text-blue-300 mb-2">Identifier les actifs</h4>
                          <p className="text-sm">
                            Recenser tous les éléments à protéger: données, systèmes, processus, personnes.
                          </p>
                          <div className="p-2 bg-blue-900/20 rounded mt-2 text-sm">
                            <p className="font-medium text-blue-300 mb-1">Questions clés:</p>
                            <ul className="list-disc list-inside text-xs space-y-1">
                              <li>Quelles sont les données les plus sensibles?</li>
                              <li>Quels systèmes sont critiques pour notre activité?</li>
                              <li>Quels sont les impacts si ces actifs sont compromis?</li>
                            </ul>
                          </div>
                        </div>
                        
                        <div>
                          <div className="absolute -left-4 w-8 h-8 rounded-full bg-blue-800 flex items-center justify-center">
                            <span className="font-bold">2</span>
                          </div>
                          <h4 className="font-semibold text-blue-300 mb-2">Identifier les menaces</h4>
                          <p className="text-sm">
                            Déterminer qui pourrait vouloir compromettre vos actifs et pourquoi.
                          </p>
                          <div className="p-2 bg-blue-900/20 rounded mt-2 text-sm">
                            <p className="font-medium text-blue-300 mb-1">Exemples d'acteurs malveillants:</p>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>• Cybercriminels</div>
                              <div>• États-nations</div>
                              <div>• Initiés malveillants</div>
                              <div>• Hacktivistes</div>
                              <div>• Concurrents</div>
                              <div>• Script kiddies</div>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="absolute -left-4 w-8 h-8 rounded-full bg-blue-800 flex items-center justify-center">
                            <span className="font-bold">3</span>
                          </div>
                          <h4 className="font-semibold text-blue-300 mb-2">Identifier les vulnérabilités</h4>
                          <p className="text-sm">
                            Repérer les faiblesses qui pourraient être exploitées par les menaces identifiées.
                          </p>
                          <div className="p-2 bg-blue-900/20 rounded mt-2 text-xs">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              <div className="p-1 bg-blue-900/30 rounded">
                                <p className="font-medium text-blue-300">Techniques:</p>
                                <ul className="list-disc list-inside space-y-0.5">
                                  <li>Logiciels non mis à jour</li>
                                  <li>Configurations par défaut</li>
                                  <li>Absence de chiffrement</li>
                                </ul>
                              </div>
                              <div className="p-1 bg-blue-900/30 rounded">
                                <p className="font-medium text-blue-300">Organisationnelles:</p>
                                <ul className="list-disc list-inside space-y-0.5">
                                  <li>Absence de formation</li>
                                  <li>Processus de contrôle inadéquats</li>
                                  <li>Séparation des tâches insuffisante</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="absolute -left-4 w-8 h-8 rounded-full bg-blue-800 flex items-center justify-center">
                            <span className="font-bold">4</span>
                          </div>
                          <h4 className="font-semibold text-blue-300 mb-2">Évaluer les risques</h4>
                          <p className="text-sm">
                            Analyser la probabilité et l'impact potentiel de chaque menace pour prioriser les actions.
                          </p>
                          <div className="p-2 bg-blue-900/20 rounded mt-2 text-sm">
                            <p className="font-medium text-blue-300 mb-1">Formule du risque:</p>
                            <div className="bg-blue-900/40 p-2 rounded text-center">
                              <p className="text-xs font-mono">
                                Risque = Probabilité × Impact
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="absolute -left-4 w-8 h-8 rounded-full bg-blue-800 flex items-center justify-center">
                            <span className="font-bold">5</span>
                          </div>
                          <h4 className="font-semibold text-blue-300 mb-2">Définir les contre-mesures</h4>
                          <p className="text-sm">
                            Élaborer et mettre en œuvre des solutions pour réduire ou éliminer les risques identifiés.
                          </p>
                          <div className="p-2 bg-blue-900/20 rounded mt-2 text-sm">
                            <p className="font-medium text-blue-300 mb-1">Types de contre-mesures:</p>
                            <ul className="list-disc list-inside text-xs space-y-1">
                              <li>Atténuation: réduire le risque</li>
                              <li>Transfert: assurance cyber, externalisation</li>
                              <li>Évitement: modifier le processus pour éliminer le risque</li>
                              <li>Acceptation: pour les risques mineurs ou inévitables</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="font-bold text-lg mb-3">Méthodologies populaires</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-indigo-900/20 p-3 rounded-lg border border-indigo-800">
                        <h4 className="font-semibold text-indigo-300 mb-2">STRIDE</h4>
                        <p className="text-sm mb-2">
                          Développée par Microsoft, cette méthode classe les menaces en six catégories:
                        </p>
                        <ul className="text-xs space-y-1">
                          <li><span className="font-semibold">S</span>poofing (Usurpation d'identité)</li>
                          <li><span className="font-semibold">T</span>ampering (Altération de données)</li>
                          <li><span className="font-semibold">R</span>epudiation (Répudiation)</li>
                          <li><span className="font-semibold">I</span>nformation disclosure (Divulgation d'information)</li>
                          <li><span className="font-semibold">D</span>enial of service (Déni de service)</li>
                          <li><span className="font-semibold">E</span>levation of privilege (Élévation de privilèges)</li>
                        </ul>
                      </div>
                      
                      <div className="bg-purple-900/20 p-3 rounded-lg border border-purple-800">
                        <h4 className="font-semibold text-purple-300 mb-2">PASTA</h4>
                        <p className="text-sm mb-2">
                          Process for Attack Simulation and Threat Analysis, une approche orientée risque en 7 étapes:
                        </p>
                        <ol className="text-xs space-y-1 list-decimal list-inside">
                          <li>Définir les objectifs</li>
                          <li>Définir le périmètre technique</li>
                          <li>Décomposer l'application</li>
                          <li>Analyser les menaces</li>
                          <li>Analyser les vulnérabilités</li>
                          <li>Simuler les attaques</li>
                          <li>Déterminer les risques et contre-mesures</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="font-bold text-lg mb-3">Exemple concret: modèle de menaces simplifié</h3>
                    
                    <div className="bg-blue-900/20 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-300 mb-2">Cas: Application de messagerie d'entreprise</h4>
                      
                      <div className="space-y-4">
                        <div>
                          <p className="font-medium text-blue-300 text-sm">1. Actifs identifiés:</p>
                          <ul className="list-disc list-inside text-xs">
                            <li>Messages échangés</li>
                            <li>Données utilisateurs</li>
                            <li>Crédentiels d'accès</li>
                            <li>Infrastructure serveur</li>
                          </ul>
                        </div>
                        
                        <div>
                          <p className="font-medium text-blue-300 text-sm">2. Menaces potentielles:</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                            <div>• Interception des communications</div>
                            <div>• Vol de données utilisateurs</div>
                            <div>• Usurpation d'identité</div>
                            <div>• Déni de service</div>
                          </div>
                        </div>
                        
                        <div>
                          <p className="font-medium text-blue-300 text-sm">3. Vulnérabilités identifiées:</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                            <div>• Messages non chiffrés</div>
                            <div>• Authentification unique facteur</div>
                            <div>• Sessions non expirées</div>
                            <div>• Validation d'entrée insuffisante</div>
                          </div>
                        </div>
                        
                        <div>
                          <p className="font-medium text-blue-300 text-sm">4. Contre-mesures définies:</p>
                          <div className="text-xs">
                            <div className="flex items-start mb-1">
                              <Check className="h-3 w-3 text-green-500 mr-1 mt-0.5 flex-shrink-0" />
                              <p><span className="font-medium">Chiffrement de bout en bout</span> - Contre l'interception des communications</p>
                            </div>
                            <div className="flex items-start mb-1">
                              <Check className="h-3 w-3 text-green-500 mr-1 mt-0.5 flex-shrink-0" />
                              <p><span className="font-medium">Authentification multifacteur</span> - Contre l'usurpation d'identité</p>
                            </div>
                            <div className="flex items-start mb-1">
                              <Check className="h-3 w-3 text-green-500 mr-1 mt-0.5 flex-shrink-0" />
                              <p><span className="font-medium">Expiration des sessions</span> - Contre l'utilisation de sessions volées</p>
                            </div>
                            <div className="flex items-start">
                              <Check className="h-3 w-3 text-green-500 mr-1 mt-0.5 flex-shrink-0" />
                              <p><span className="font-medium">Validation côté serveur</span> - Contre les injections et XSS</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border-l-4 border-blue-500 p-4 my-4 rounded-r-lg">
                    <h4 className="font-bold text-blue-300">À retenir</h4>
                    <p className="mt-1">
                      La modélisation des menaces n'est pas un exercice ponctuel mais un processus continu qui doit 
                      évoluer avec votre système et son environnement. Elle permet de passer d'une sécurité réactive 
                      à une approche proactive, en anticipant les menaces avant qu'elles ne se manifestent.
                    </p>
                  </div>
                </motion.div>
              )}
              
              {/* Section Sécurité par conception */}
              {currentSection === 'securite-conception' && (
                <motion.div variants={itemVariants}>
                  <h2 className="text-2xl font-bold mb-4">Sécurité par conception : intégrer la sécurité dès le départ</h2>
                  
                  <p className="mb-4">
                    La sécurité par conception (Security by Design) est une approche qui intègre les considérations 
                    de sécurité tout au long du cycle de vie du développement d'un système, plutôt que de les 
                    ajouter après coup. Cette philosophie repose sur l'idée qu'il est plus efficace et moins 
                    coûteux de prévenir les problèmes de sécurité dès le début.
                  </p>
                  
                  <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 p-4 rounded-lg border border-green-800 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="md:w-1/2">
                        <h3 className="font-bold text-lg mb-2 text-green-300">Approche traditionnelle</h3>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-green-800 flex items-center justify-center mr-2">
                              <span className="text-sm">1</span>
                            </div>
                            <p className="text-sm">Conception</p>
                          </div>
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-green-800 flex items-center justify-center mr-2">
                              <span className="text-sm">2</span>
                            </div>
                            <p className="text-sm">Développement</p>
                          </div>
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-green-800 flex items-center justify-center mr-2">
                              <span className="text-sm">3</span>
                            </div>
                            <p className="text-sm">Tests</p>
                          </div>
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-red-800 flex items-center justify-center mr-2">
                              <span className="text-sm">4</span>
                            </div>
                            <p className="text-sm">Audits de sécurité</p>
                          </div>
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-amber-800 flex items-center justify-center mr-2">
                              <span className="text-sm">5</span>
                            </div>
                            <p className="text-sm">Correctifs de sécurité</p>
                          </div>
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-green-800 flex items-center justify-center mr-2">
                              <span className="text-sm">6</span>
                            </div>
                            <p className="text-sm">Déploiement</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="md:w-1/2">
                        <h3 className="font-bold text-lg mb-2 text-green-300">Security by Design</h3>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-green-800 flex items-center justify-center mr-2">
                              <span className="text-sm">1</span>
                            </div>
                            <p className="text-sm">Analyse des risques</p>
                          </div>
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-green-800 flex items-center justify-center mr-2">
                              <span className="text-sm">2</span>
                            </div>
                            <p className="text-sm">Conception sécurisée</p>
                          </div>
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-green-800 flex items-center justify-center mr-2">
                              <span className="text-sm">3</span>
                            </div>
                            <p className="text-sm">Implémentation avec pratiques sécurisées</p>
                          </div>
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-green-800 flex items-center justify-center mr-2">
                              <span className="text-sm">4</span>
                            </div>
                            <p className="text-sm">Tests de sécurité intégrés</p>
                          </div>
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-green-800 flex items-center justify-center mr-2">
                              <span className="text-sm">5</span>
                            </div>
                            <p className="text-sm">Audits de sécurité</p>
                          </div>
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-green-800 flex items-center justify-center mr-2">
                              <span className="text-sm">6</span>
                            </div>
                            <p className="text-sm">Déploiement avec surveillance continue</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="font-bold text-lg mb-3">Principes fondamentaux</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-blue-900/20 p-3 rounded-lg">
                        <h4 className="font-semibold text-blue-300 mb-2 flex items-center">
                          <Unlock className="h-5 w-5 mr-2 text-blue-400" />
                          Principe du moindre privilège
                        </h4>
                        <p className="text-sm">
                          Accordez uniquement les permissions nécessaires à l'accomplissement d'une tâche 
                          spécifique, pas plus. Cela limite la surface d'attaque en cas de compromission.
                        </p>
                      </div>
                      
                      <div className="bg-blue-900/20 p-3 rounded-lg">
                        <h4 className="font-semibold text-blue-300 mb-2 flex items-center">
                          <Database className="h-5 w-5 mr-2 text-blue-400" />
                          Défense en profondeur
                        </h4>
                        <p className="text-sm">
                          Implémentez plusieurs couches de protection pour qu'une défaillance à un niveau 
                          n'expose pas immédiatement les ressources critiques.
                        </p>
                      </div>
                      
                      <div className="bg-blue-900/20 p-3 rounded-lg">
                        <h4 className="font-semibold text-blue-300 mb-2 flex items-center">
                          <Shield className="h-5 w-5 mr-2 text-blue-400" />
                          Sécurité par défaut
                        </h4>
                        <p className="text-sm">
                          Les configurations par défaut doivent être les plus sécurisées possible, 
                          obligeant les utilisateurs à opter explicitement pour des options moins sécurisées.
                        </p>
                      </div>
                      
                      <div className="bg-blue-900/20 p-3 rounded-lg">
                        <h4 className="font-semibold text-blue-300 mb-2 flex items-center">
                          <FileWarning className="h-5 w-5 mr-2 text-blue-400" />
                          Gestion des erreurs sécurisée
                        </h4>
                        <p className="text-sm">
                          Ne révélez jamais d'informations sensibles dans les messages d'erreur, et 
                          assurez-vous que les exceptions sont traitées correctement.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="font-bold text-lg mb-3">Mise en pratique dans les différentes phases</h3>
                    
                    <div className="space-y-4">
                      <div className="bg-indigo-900/20 p-3 rounded-lg">
                        <h4 className="font-semibold text-indigo-300 mb-2">Phase de conception</h4>
                        <ul className="space-y-1 text-sm">
                          <li className="flex items-start">
                            <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span>Effectuez une modélisation des menaces</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span>Établissez une architecture de sécurité claire</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span>Définissez les exigences de sécurité fonctionnelles et non fonctionnelles</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div className="bg-purple-900/20 p-3 rounded-lg">
                        <h4 className="font-semibold text-purple-300 mb-2">Phase de développement</h4>
                        <ul className="space-y-1 text-sm">
                          <li className="flex items-start">
                            <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span>Suivez les bonnes pratiques de codage sécurisé</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span>Utilisez des bibliothèques et frameworks sécurisés</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span>Instaurez des revues de code régulières centrées sur la sécurité</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div className="bg-cyan-900/20 p-3 rounded-lg">
                        <h4 className="font-semibold text-cyan-300 mb-2">Phase de test</h4>
                        <ul className="space-y-1 text-sm">
                          <li className="flex items-start">
                            <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span>Intégrez des tests de sécurité automatisés (SAST/DAST/IAST)</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span>Effectuez des tests de pénétration réguliers</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span>Définissez des scénarios de test couvrant les risques identifiés</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div className="bg-emerald-900/20 p-3 rounded-lg">
                        <h4 className="font-semibold text-emerald-300 mb-2">Phase de déploiement et maintenance</h4>
                        <ul className="space-y-1 text-sm">
                          <li className="flex items-start">
                            <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span>Mettez en place une surveillance continue de la sécurité</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span>Établissez un processus de gestion des mises à jour et correctifs</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span>Documentez les procédures de réponse aux incidents</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="font-bold text-lg mb-3">Bénéfices de l'approche</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="bg-green-900/20 p-3 rounded-lg">
                        <h4 className="font-semibold text-green-300 mb-2">Économique</h4>
                        <p className="text-sm">
                          Corriger une faille de sécurité en phase de conception coûte 30 fois moins cher 
                          qu'en phase de production.
                        </p>
                      </div>
                      
                      <div className="bg-amber-900/20 p-3 rounded-lg">
                        <h4 className="font-semibold text-amber-300 mb-2">Efficacité</h4>
                        <p className="text-sm">
                          Réduction de 60% des vulnérabilités critiques par rapport aux approches traditionnelles.
                        </p>
                      </div>
                      
                      <div className="bg-blue-900/20 p-3 rounded-lg">
                        <h4 className="font-semibold text-blue-300 mb-2">Confiance</h4>
                        <p className="text-sm">
                          Renforce la confiance des clients et partenaires en démontrant une approche proactive.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border-l-4 border-blue-500 p-4 my-4 rounded-r-lg">
                    <h4 className="font-bold text-blue-300">À retenir</h4>
                    <p className="mt-1">
                      La sécurité par conception n'est pas seulement une approche technique, mais une 
                      philosophie qui doit être adoptée par l'ensemble de l'organisation. Elle représente 
                      un changement de paradigme où la sécurité n'est plus considérée comme un frein, 
                      mais comme un catalyseur d'innovation et de qualité.
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