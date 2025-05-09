import React, { useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Book,
  BookOpen,
  Shield,
  ChevronRight,
  ChevronLeft,
  Clock,
  List,
  CheckCircle,
  Play,
  FileText,
  FileCheck,
  FileWarning,
  FileType,
  MessageSquare,
  User,
  Star,
  Download,
  BrainCircuit,
  Sparkles,
  ExternalLink,
  Globe,
  LinkIcon,
  Presentation,
  Video,
  Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from '@/hooks/use-toast';
import PageTitle from '@/components/utils/PageTitle';

type ModuleSection = {
  id: string;
  title: string;
  progress: number;
  isCompleted: boolean;
};

export default function IntroCybersecuriteModule() {
  // États
  const [currentSection, setCurrentSection] = useState<string | null>(null);
  const [contentTab, setContentTab] = useState('contenu');
  const [progress, setProgress] = useState(0);
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  
  const { toast } = useToast();

  // Sections du module
  const moduleSections: ModuleSection[] = [
    {
      id: 'introduction',
      title: 'Introduction à la cybersécurité',
      progress: 0,
      isCompleted: false
    },
    {
      id: 'concepts',
      title: 'Concepts fondamentaux et terminologie',
      progress: 0,
      isCompleted: false
    },
    {
      id: 'menaces',
      title: 'Paysage des menaces cyber',
      progress: 0,
      isCompleted: false
    },
    {
      id: 'protection',
      title: 'Principes de base de la sécurité',
      progress: 0,
      isCompleted: false
    },
    {
      id: 'conformite',
      title: 'Contrôles de sécurité essentiels',
      progress: 0,
      isCompleted: false
    },
    {
      id: 'evaluation',
      title: 'Évaluation des connaissances',
      progress: 0,
      isCompleted: false
    }
  ];

  // Objectifs d'apprentissage
  const learningObjectives = [
    'Comprendre les concepts de base et la terminologie de la cybersécurité',
    'Identifier les principales menaces et vulnérabilités',
    'Maîtriser les principes fondamentaux de la protection des données',
    'Connaître les différents contrôles de sécurité et leur application',
    'Développer une approche méthodique pour aborder les questions de sécurité'
  ];

  // Ressources supplémentaires
  const additionalResources = [
    {
      title: 'Guide ANSSI des bonnes pratiques',
      type: 'PDF',
      icon: <FileText className="h-5 w-5" />,
      downloadable: true
    },
    {
      title: 'Glossaire de la cybersécurité',
      type: 'Document',
      icon: <BookOpen className="h-5 w-5" />,
      downloadable: true
    },
    {
      title: 'Vidéo: Évolution des cybermenaces',
      type: 'Vidéo',
      icon: <Play className="h-5 w-5" />,
      downloadable: false
    }
  ];

  // Calcul du progrès global
  const totalProgress = moduleSections.reduce((sum, section) => sum + section.progress, 0) / moduleSections.length;

  const handleAssistantInteraction = () => {
    setShowAiAssistant(!showAiAssistant);
    if (!showAiAssistant) {
      toast({
        title: 'Assistant IA activé',
        description: 'L\'assistant pédagogique est prêt à répondre à vos questions',
        variant: 'default'
      });
    }
  };

  const handleMarkCompleted = (sectionId: string) => {
    setProgress(Math.min(100, progress + 100 / moduleSections.length));
    toast({
      title: 'Section terminée',
      description: 'Votre progression a été enregistrée',
      variant: 'default'
    });
  };

  // Animation
  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 to-slate-950 text-white pb-20">
      {/* En-tête */}
      <div className="p-6 container mx-auto">
        <div className="flex items-center mb-2">
          <Link href="/cyber/learning-center">
            <Button variant="ghost" className="text-white mr-4">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Retour
            </Button>
          </Link>
          <PageTitle title="CYBER ACADÉMIE" />
        </div>
        
        <div className="bg-blue-900/50 backdrop-blur-sm rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-2xl font-bold flex items-center">
                <Shield className="mr-3 h-6 w-6 text-blue-300" />
                Introduction à la cybersécurité
              </h1>
              <p className="text-blue-200 mt-1">Module fondamental : concepts et principes de base</p>
            </div>
            <div className="flex gap-3 mt-4 md:mt-0">
              <Button
                variant="default"
                className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                onClick={handleAssistantInteraction}
              >
                <BrainCircuit className="h-5 w-5" />
                Assistant IA
              </Button>
              <Badge variant="outline" className="border-blue-600 text-blue-200">
                Interactif
              </Badge>
              <Badge variant="outline" className="border-blue-600 text-blue-200">
                Débutant
              </Badge>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between text-xs text-blue-200 mb-1">
              <span>Progression</span>
              <span>{Math.round(totalProgress)}%</span>
            </div>
            <Progress value={totalProgress} className="h-2" indicatorClassName="bg-blue-600" />
          </div>
        </div>
      </div>
      
      {/* IA Assistant Popup */}
      {showAiAssistant && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="fixed bottom-4 right-4 w-80 bg-blue-900/90 backdrop-blur-md rounded-lg border border-blue-700 shadow-lg z-50"
        >
          <div className="p-3 border-b border-blue-800 flex justify-between items-center">
            <div className="flex items-center">
              <BrainCircuit className="h-5 w-5 text-blue-300 mr-2" />
              <h3 className="font-medium">Assistant IA</h3>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 rounded-full hover:bg-blue-800"
              onClick={() => setShowAiAssistant(false)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
          <div className="p-3 h-64 overflow-y-auto">
            <div className="flex items-start mb-3">
              <div className="bg-blue-700 rounded-full p-1.5 mr-2">
                <User className="h-3 w-3" />
              </div>
              <div className="bg-blue-800/50 rounded-lg p-2 text-sm max-w-[80%]">
                <p>Comment puis-je vous aider avec ce module ?</p>
              </div>
            </div>
            <div className="flex items-start justify-end mb-3">
              <div className="bg-blue-950 rounded-lg p-2 text-sm max-w-[80%]">
                <p>Expliquez-moi les principes fondamentaux de la cybersécurité</p>
              </div>
              <div className="bg-indigo-700 rounded-full p-1.5 ml-2">
                <User className="h-3 w-3" />
              </div>
            </div>
            <div className="flex items-start mb-3">
              <div className="bg-blue-700 rounded-full p-1.5 mr-2">
                <BrainCircuit className="h-3 w-3" />
              </div>
              <div className="bg-blue-800/50 rounded-lg p-2 text-sm max-w-[80%]">
                <p>Les principes fondamentaux de la cybersécurité reposent sur trois piliers principaux souvent abrégés en "CIA" : 
                <br /><br />
                <strong>1. Confidentialité</strong> - Protection contre l'accès non autorisé
                <br />
                <strong>2. Intégrité</strong> - Garantie que les données ne sont pas modifiées sans autorisation
                <br />
                <strong>3. Disponibilité</strong> - Assurance que les systèmes sont opérationnels quand nécessaire
                <br /><br />
                Ces principes sont complétés par l'authentification, l'autorisation, la non-répudiation, et la défense en profondeur.</p>
              </div>
            </div>
          </div>
          <div className="p-3 border-t border-blue-800">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Posez votre question..."
                className="w-full bg-blue-950/60 border border-blue-700 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-0 top-0 h-full rounded-full hover:bg-transparent"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Contenu principal */}
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Colonne de navigation (sommaire) */}
          <Card className="bg-blue-900/20 border-blue-800 lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <List className="mr-2 h-5 w-5" />
                Sommaire
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="space-y-1">
                {moduleSections.map((section, index) => (
                  <div key={section.id}>
                    <Button
                      variant={currentSection === section.id ? "secondary" : "ghost"}
                      className={`w-full justify-start text-left h-auto py-3 ${
                        currentSection === section.id 
                          ? "bg-blue-800" 
                          : "hover:bg-blue-900/50 text-blue-100"
                      }`}
                      onClick={() => setCurrentSection(section.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-900 rounded-full p-1 flex-shrink-0 mt-0.5">
                          {section.isCompleted ? (
                            <CheckCircle className="h-4 w-4 text-green-400" />
                          ) : (
                            <span className="text-xs font-medium px-1">{index + 1}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{section.title}</p>
                          <div className="flex justify-end items-center text-xs mt-1 text-blue-300">
                            <span>{section.progress}%</span>
                          </div>
                          <Progress 
                            value={section.progress} 
                            className="h-1 mt-1" 
                            indicatorClassName="bg-blue-600"
                          />
                        </div>
                      </div>
                    </Button>
                    {index < moduleSections.length - 1 && (
                      <Separator className="bg-blue-900/50 my-1" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button 
                className="w-full bg-blue-700 hover:bg-blue-800"
                onClick={() => {
                  setCurrentSection(moduleSections[0].id);
                  toast({
                    title: 'Module commencé',
                    description: 'Vous avez démarré le module. Bonne formation !',
                    variant: 'default'
                  });
                }}
              >
                <Play className="mr-2 h-4 w-4" />
                Commencer le module
              </Button>
              <Button 
                variant="outline" 
                className="w-full border-blue-700"
                onClick={() => {
                  const downloadAttestation = confirm('Télécharger l\'attestation de formation ?');
                  if (downloadAttestation) {
                    toast({
                      title: 'Attestation générée',
                      description: 'Votre attestation a été téléchargée',
                      variant: 'default'
                    });
                  }
                }}
              >
                <Download className="mr-2 h-4 w-4" />
                Télécharger attestation
              </Button>
            </CardFooter>
          </Card>
          
          {/* Contenu principal et informations */}
          <div className="lg:col-span-3 space-y-6">
            <Tabs value={contentTab} onValueChange={setContentTab} className="space-y-6">
              <TabsList className="bg-blue-900/20 border border-blue-800">
                <TabsTrigger value="contenu" className="data-[state=active]:bg-blue-700">
                  Contenu du module
                </TabsTrigger>
                <TabsTrigger value="objectifs" className="data-[state=active]:bg-blue-700">
                  Objectifs et prérequis
                </TabsTrigger>
                <TabsTrigger value="ressources" className="data-[state=active]:bg-blue-700">
                  Ressources
                </TabsTrigger>
              </TabsList>
              
              {/* Onglet Contenu */}
              <TabsContent value="contenu">
                <Card className="bg-blue-900/20 border-blue-800">
                  <CardHeader>
                    <CardTitle>Contenu du module</CardTitle>
                    <CardDescription className="text-blue-200">
                      Explorer les fondamentaux de la cybersécurité
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {currentSection ? (
                      <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={contentVariants}
                        key={currentSection}
                      >
                        <div className="flex items-center mb-4">
                          <h2 className="text-xl font-bold">{
                            moduleSections.find(section => section.id === currentSection)?.title
                          }</h2>
                        </div>
                        
                        <div className="prose prose-invert max-w-none prose-blue">
                          {currentSection === 'introduction' && (
                            <div>
                              <p>
                                La cybersécurité est devenue un enjeu majeur pour toutes les organisations, 
                                qu'elles soient publiques ou privées. Dans un monde de plus en plus connecté, 
                                la protection des systèmes d'information et des données est essentielle pour 
                                assurer la continuité des activités et préserver la confiance des utilisateurs.
                              </p>
                              
                              <h3>Qu'est-ce que la cybersécurité ?</h3>
                              <p>
                                La cybersécurité regroupe l'ensemble des moyens techniques, organisationnels, 
                                juridiques et humains nécessaires à la mise en place de mesures de protection 
                                visant à défendre les systèmes d'information contre les attaques dont ils peuvent 
                                faire l'objet.
                              </p>
                              
                              <h3>Pourquoi est-elle importante ?</h3>
                              <p>
                                Les cyberattaques peuvent avoir des conséquences graves pour les organisations :
                              </p>
                              <ul>
                                <li>Pertes financières directes (rançons, fraudes)</li>
                                <li>Interruption des services et des opérations</li>
                                <li>Vol ou fuite de données sensibles</li>
                                <li>Atteinte à la réputation</li>
                                <li>Sanctions réglementaires et juridiques</li>
                              </ul>
                              
                              <div className="bg-blue-800/30 border-l-4 border-blue-500 p-4 my-4">
                                <h4 className="font-bold text-blue-300">À retenir</h4>
                                <p className="mt-1">
                                  La cybersécurité n'est pas seulement une question technique, 
                                  mais une préoccupation stratégique qui implique l'ensemble de l'organisation.
                                </p>
                              </div>
                            </div>
                          )}
                          
                          {currentSection === 'concepts' && (
                            <div>
                              <p>
                                Pour comprendre la cybersécurité, il est essentiel de maîtriser les concepts
                                fondamentaux et la terminologie du domaine.
                              </p>
                              
                              <h3>Les principes fondamentaux</h3>
                              <p>
                                La sécurité de l'information repose sur trois piliers fondamentaux, 
                                souvent désignés par l'acronyme CIA :
                              </p>
                              <ul>
                                <li><strong>Confidentialité</strong> : garantir que l'information n'est accessible 
                                qu'aux personnes autorisées</li>
                                <li><strong>Intégrité</strong> : s'assurer que l'information reste exacte et complète,
                                sans altération non autorisée</li>
                                <li><strong>Disponibilité</strong> : veiller à ce que l'information soit accessible
                                lorsque les utilisateurs autorisés en ont besoin</li>
                              </ul>
                              
                              <h3>Terminologie essentielle</h3>
                              <ul>
                                <li><strong>Vulnérabilité</strong> : faiblesse d'un système pouvant être exploitée</li>
                                <li><strong>Menace</strong> : source potentielle d'un événement indésirable</li>
                                <li><strong>Risque</strong> : probabilité qu'une menace exploite une vulnérabilité</li>
                                <li><strong>Contrôle</strong> : mesure de protection pour réduire un risque</li>
                                <li><strong>Authentification</strong> : vérification de l'identité d'un utilisateur</li>
                                <li><strong>Autorisation</strong> : définition des droits d'accès</li>
                              </ul>
                              
                              <div className="bg-blue-800/30 border-l-4 border-blue-500 p-4 my-4">
                                <h4 className="font-bold text-blue-300">À retenir</h4>
                                <p className="mt-1">
                                  Les concepts de CIA (Confidentialité, Intégrité, Disponibilité) forment
                                  le socle de toute stratégie de cybersécurité.
                                </p>
                              </div>
                            </div>
                          )}
                          
                          {currentSection === 'menaces' && (
                            <div>
                              <p>
                                Le paysage des cybermenaces évolue rapidement, avec des attaquants qui développent 
                                constamment de nouvelles techniques et méthodes pour compromettre les systèmes d'information.
                              </p>
                              
                              <h3>Principales catégories de cybermenaces</h3>
                              <ul>
                                <li>
                                  <strong>Malwares</strong> : logiciels malveillants conçus pour s'infiltrer dans les systèmes
                                  (virus, vers, chevaux de Troie, ransomwares, spywares)
                                </li>
                                <li>
                                  <strong>Phishing</strong> : tentatives de vol d'informations sensibles (identifiants, données bancaires)
                                  en se faisant passer pour une entité légitime
                                </li>
                                <li>
                                  <strong>Attaques par déni de service (DoS/DDoS)</strong> : saturation des ressources d'un système
                                  pour le rendre indisponible
                                </li>
                                <li>
                                  <strong>Attaques par force brute</strong> : tentatives répétées pour deviner des mots de passe
                                  ou des clés de chiffrement
                                </li>
                                <li>
                                  <strong>Ingénierie sociale</strong> : manipulation psychologique pour amener les utilisateurs
                                  à divulguer des informations confidentielles
                                </li>
                                <li>
                                  <strong>Menaces internes</strong> : risques posés par les employés, contractuels ou partenaires
                                  ayant un accès légitime aux systèmes
                                </li>
                              </ul>
                              
                              <h3>Acteurs malveillants</h3>
                              <p>
                                Les cyberattaques peuvent être menées par différents types d'acteurs, avec des motivations variées :
                              </p>
                              <ul>
                                <li>
                                  <strong>Cybercriminels</strong> : individus ou groupes motivés par le gain financier
                                </li>
                                <li>
                                  <strong>Hacktivistes</strong> : attaquants motivés par des causes politiques ou idéologiques
                                </li>
                                <li>
                                  <strong>États-nations</strong> : entités gouvernementales engagées dans l'espionnage
                                  ou les opérations d'influence
                                </li>
                                <li>
                                  <strong>Initiés malveillants</strong> : employés mécontents ou corrompus cherchant à nuire
                                  à leur organisation
                                </li>
                                <li>
                                  <strong>Script kiddies</strong> : amateurs utilisant des outils préfabriqués sans comprendre
                                  leur fonctionnement
                                </li>
                              </ul>
                              
                              <div className="bg-blue-800/30 border-l-4 border-blue-500 p-4 my-4">
                                <h4 className="font-bold text-blue-300">À retenir</h4>
                                <p className="mt-1">
                                  La compréhension des différentes menaces et de leurs vecteurs d'attaque est essentielle
                                  pour mettre en place des mesures de protection adaptées.
                                </p>
                              </div>
                            </div>
                          )}
                          
                          {currentSection === 'protection' && (
                            <div>
                              <p>
                                Protéger efficacement les systèmes d'information requiert une approche globale
                                combinant mesures techniques, organisationnelles et humaines.
                              </p>
                              
                              <h3>Mesures techniques de protection</h3>
                              <ul>
                                <li>
                                  <strong>Authentification forte</strong> : mise en place de mécanismes d'authentification 
                                  multifacteur (MFA) pour sécuriser les accès
                                </li>
                                <li>
                                  <strong>Chiffrement des données</strong> : protection des données sensibles
                                  au repos et en transit
                                </li>
                                <li>
                                  <strong>Solutions de sécurité</strong> : déploiement de pare-feu, antivirus, 
                                  systèmes de détection et de prévention d'intrusion (IDS/IPS)
                                </li>
                                <li>
                                  <strong>Gestion des correctifs</strong> : application régulière des mises à jour
                                  de sécurité pour corriger les vulnérabilités
                                </li>
                                <li>
                                  <strong>Segmentation réseau</strong> : séparation du réseau en zones distinctes
                                  pour limiter la propagation des attaques
                                </li>
                                <li>
                                  <strong>Sauvegardes régulières</strong> : création et test de sauvegardes pour
                                  assurer la récupération des données en cas d'incident
                                </li>
                              </ul>
                              
                              <h3>Mesures organisationnelles</h3>
                              <ul>
                                <li>
                                  <strong>Politique de sécurité</strong> : définition d'un cadre formel pour la gestion
                                  de la sécurité de l'information
                                </li>
                                <li>
                                  <strong>Gestion des risques</strong> : identification, évaluation et traitement
                                  des risques de sécurité
                                </li>
                                <li>
                                  <strong>Gestion des incidents</strong> : mise en place de procédures pour détecter,
                                  signaler et traiter les incidents de sécurité
                                </li>
                                <li>
                                  <strong>Plan de continuité d'activité</strong> : préparation pour maintenir
                                  les activités critiques en cas d'incident majeur
                                </li>
                                <li>
                                  <strong>Sensibilisation et formation</strong> : programmes pour développer
                                  la culture de sécurité et les compétences des utilisateurs
                                </li>
                              </ul>
                              
                              <div className="bg-blue-800/30 border-l-4 border-blue-500 p-4 my-4">
                                <h4 className="font-bold text-blue-300">À retenir</h4>
                                <p className="mt-1">
                                  La défense en profondeur, consistant à superposer plusieurs couches de protection,
                                  est l'approche recommandée pour une sécurité efficace.
                                </p>
                              </div>
                            </div>
                          )}
                          
                          {currentSection === 'conformite' && (
                            <div>
                              <p>
                                La conformité aux exigences légales et réglementaires en matière de cybersécurité
                                est devenue incontournable pour les organisations de toutes tailles.
                              </p>
                              
                              <h3>Cadres réglementaires majeurs</h3>
                              <ul>
                                <li>
                                  <strong>Règlement Général sur la Protection des Données (RGPD)</strong> : 
                                  réglementation européenne sur la protection des données personnelles
                                </li>
                                <li>
                                  <strong>Directive NIS (Network and Information Security)</strong> : 
                                  directive européenne sur la sécurité des réseaux et des systèmes d'information
                                </li>
                                <li>
                                  <strong>NIS 2</strong> : 
                                  nouvelle directive européenne renforçant les obligations de cybersécurité
                                </li>
                                <li>
                                  <strong>PCI DSS</strong> : 
                                  norme de sécurité pour les organisations traitant des données de cartes de paiement
                                </li>
                                <li>
                                  <strong>ISO 27001</strong> : 
                                  norme internationale pour les systèmes de management de la sécurité de l'information
                                </li>
                              </ul>
                              
                              <h3>Enjeux de la conformité</h3>
                              <ul>
                                <li>
                                  <strong>Obligations légales</strong> : 
                                  respect des exigences applicables selon le secteur d'activité et la localisation
                                </li>
                                <li>
                                  <strong>Sanctions et amendes</strong> : 
                                  risques financiers en cas de non-conformité (ex: jusqu'à 4% du CA mondial pour le RGPD)
                                </li>
                                <li>
                                  <strong>Notification des violations</strong> : 
                                  obligation de signaler les incidents de sécurité aux autorités compétentes
                                </li>
                                <li>
                                  <strong>Démonstration de conformité</strong> : 
                                  nécessité de documenter les mesures mises en place (principe d'accountability)
                                </li>
                              </ul>
                              
                              <div className="bg-blue-800/30 border-l-4 border-blue-500 p-4 my-4">
                                <h4 className="font-bold text-blue-300">À retenir</h4>
                                <p className="mt-1">
                                  La conformité réglementaire n'est pas une fin en soi, mais un socle minimal
                                  à partir duquel construire une stratégie de cybersécurité efficace.
                                </p>
                              </div>
                            </div>
                          )}
                          
                          {(currentSection !== 'introduction' && currentSection !== 'concepts' && 
                            currentSection !== 'menaces' && currentSection !== 'protection' && 
                            currentSection !== 'conformite') && (
                            <div className="flex items-center justify-center h-64">
                              <div className="text-center">
                                <BookOpen className="h-16 w-16 mx-auto text-blue-400 mb-4" />
                                <h3 className="text-xl font-semibold">Contenu en préparation</h3>
                                <p className="text-blue-300 mt-2">
                                  Cette section sera bientôt disponible
                                </p>
                                <div className="mt-4">
                                  <Button variant="outline" className="border-blue-700">
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Demander un accès anticipé
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-8 flex justify-between">
                          <Button 
                            variant="outline" 
                            className="border-blue-700"
                            onClick={() => {
                              const currentIndex = moduleSections.findIndex(section => section.id === currentSection);
                              if (currentIndex > 0) {
                                setCurrentSection(moduleSections[currentIndex - 1].id);
                              }
                            }}
                            disabled={moduleSections.findIndex(section => section.id === currentSection) === 0}
                          >
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Section précédente
                          </Button>
                          
                          <Button
                            onClick={() => handleMarkCompleted(currentSection)}
                            className="bg-blue-700 hover:bg-blue-800"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Marquer comme terminé
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            className="border-blue-700"
                            onClick={() => {
                              const currentIndex = moduleSections.findIndex(section => section.id === currentSection);
                              if (currentIndex < moduleSections.length - 1) {
                                setCurrentSection(moduleSections[currentIndex + 1].id);
                              }
                            }}
                            disabled={moduleSections.findIndex(section => section.id === currentSection) === moduleSections.length - 1}
                          >
                            Section suivante
                            <ChevronRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="text-center py-8">
                        <BookOpen className="h-16 w-16 mx-auto text-blue-400 mb-4" />
                        <h3 className="text-xl font-semibold">Sélectionnez une section pour commencer</h3>
                        <p className="text-blue-300 mt-2">
                          Choisissez une section dans le sommaire à gauche pour accéder au contenu
                        </p>
                        <div className="mt-6">
                          <Button 
                            className="bg-blue-700 hover:bg-blue-800"
                            onClick={() => setCurrentSection(moduleSections[0].id)}
                          >
                            <Play className="mr-2 h-4 w-4" />
                            Commencer par le début
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Onglet Objectifs */}
              <TabsContent value="objectifs">
                <Card className="bg-blue-900/20 border-blue-800">
                  <CardHeader>
                    <CardTitle>Objectifs d'apprentissage</CardTitle>
                    <CardDescription className="text-blue-200">
                      Ce que vous allez apprendre dans cette section
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-3 flex items-center">
                          <Star className="text-yellow-500 mr-2 h-5 w-5" />
                          Objectifs {currentSection ? `pour "${moduleSections.find(s => s.id === currentSection)?.title}"` : 'du module'}
                        </h3>
                        <div className="space-y-2">
                          {currentSection === 'introduction' ? (
                            // Objectifs spécifiques à l'introduction
                            <>
                              <div className="flex items-start gap-2">
                                <Checkbox id="objective-intro-1" />
                                <label htmlFor="objective-intro-1" className="text-sm leading-tight cursor-pointer">
                                  Comprendre les enjeux de la cybersécurité dans le monde actuel
                                </label>
                              </div>
                              <div className="flex items-start gap-2">
                                <Checkbox id="objective-intro-2" />
                                <label htmlFor="objective-intro-2" className="text-sm leading-tight cursor-pointer">
                                  Identifier les principales conséquences des cyberattaques pour les organisations
                                </label>
                              </div>
                              <div className="flex items-start gap-2">
                                <Checkbox id="objective-intro-3" />
                                <label htmlFor="objective-intro-3" className="text-sm leading-tight cursor-pointer">
                                  Reconnaître l'importance stratégique de la cybersécurité au-delà des aspects techniques
                                </label>
                              </div>
                            </>
                          ) : currentSection === 'concepts' ? (
                            // Objectifs spécifiques aux concepts fondamentaux
                            <>
                              <div className="flex items-start gap-2">
                                <Checkbox id="objective-concepts-1" />
                                <label htmlFor="objective-concepts-1" className="text-sm leading-tight cursor-pointer">
                                  Maîtriser la triade CIA (Confidentialité, Intégrité, Disponibilité)
                                </label>
                              </div>
                              <div className="flex items-start gap-2">
                                <Checkbox id="objective-concepts-2" />
                                <label htmlFor="objective-concepts-2" className="text-sm leading-tight cursor-pointer">
                                  Différencier les concepts de vulnérabilité, menace et risque
                                </label>
                              </div>
                              <div className="flex items-start gap-2">
                                <Checkbox id="objective-concepts-3" />
                                <label htmlFor="objective-concepts-3" className="text-sm leading-tight cursor-pointer">
                                  Comprendre les notions d'authentification et d'autorisation en cybersécurité
                                </label>
                              </div>
                            </>
                          ) : currentSection === 'menaces' ? (
                            // Objectifs spécifiques aux types de menaces
                            <>
                              <div className="flex items-start gap-2">
                                <Checkbox id="objective-menaces-1" />
                                <label htmlFor="objective-menaces-1" className="text-sm leading-tight cursor-pointer">
                                  Identifier les différentes catégories de cybermenaces
                                </label>
                              </div>
                              <div className="flex items-start gap-2">
                                <Checkbox id="objective-menaces-2" />
                                <label htmlFor="objective-menaces-2" className="text-sm leading-tight cursor-pointer">
                                  Comprendre les motivations et modes opératoires des attaquants
                                </label>
                              </div>
                              <div className="flex items-start gap-2">
                                <Checkbox id="objective-menaces-3" />
                                <label htmlFor="objective-menaces-3" className="text-sm leading-tight cursor-pointer">
                                  Reconnaître les signes d'une attaque potentielle
                                </label>
                              </div>
                            </>
                          ) : currentSection === 'protection' ? (
                            // Objectifs spécifiques à la protection
                            <>
                              <div className="flex items-start gap-2">
                                <Checkbox id="objective-protection-1" />
                                <label htmlFor="objective-protection-1" className="text-sm leading-tight cursor-pointer">
                                  Comprendre l'approche de défense en profondeur en cybersécurité
                                </label>
                              </div>
                              <div className="flex items-start gap-2">
                                <Checkbox id="objective-protection-2" />
                                <label htmlFor="objective-protection-2" className="text-sm leading-tight cursor-pointer">
                                  Identifier les principales mesures techniques de protection
                                </label>
                              </div>
                              <div className="flex items-start gap-2">
                                <Checkbox id="objective-protection-3" />
                                <label htmlFor="objective-protection-3" className="text-sm leading-tight cursor-pointer">
                                  Comprendre l'importance des mesures organisationnelles
                                </label>
                              </div>
                            </>
                          ) : currentSection === 'conformite' ? (
                            // Objectifs spécifiques à la conformité
                            <>
                              <div className="flex items-start gap-2">
                                <Checkbox id="objective-conformite-1" />
                                <label htmlFor="objective-conformite-1" className="text-sm leading-tight cursor-pointer">
                                  Identifier les principales réglementations en matière de cybersécurité
                                </label>
                              </div>
                              <div className="flex items-start gap-2">
                                <Checkbox id="objective-conformite-2" />
                                <label htmlFor="objective-conformite-2" className="text-sm leading-tight cursor-pointer">
                                  Comprendre les enjeux de la conformité pour les organisations
                                </label>
                              </div>
                              <div className="flex items-start gap-2">
                                <Checkbox id="objective-conformite-3" />
                                <label htmlFor="objective-conformite-3" className="text-sm leading-tight cursor-pointer">
                                  Savoir intégrer les exigences réglementaires dans la stratégie de cybersécurité
                                </label>
                              </div>
                            </>
                          ) : (
                            // Objectifs généraux pour les autres sections
                            learningObjectives.map((objective, index) => (
                              <div key={index} className="flex items-start gap-2">
                                <Checkbox id={`objective-${index}`} />
                                <label
                                  htmlFor={`objective-${index}`}
                                  className="text-sm leading-tight cursor-pointer"
                                >
                                  {objective}
                                </label>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                      
                      <Separator className="bg-blue-800/50" />
                      
                      <div>
                        <h3 className="font-semibold text-lg mb-3">Prérequis</h3>
                        {currentSection === 'introduction' ? (
                          <p className="text-blue-200">
                            Cette introduction ne nécessite aucun prérequis technique particulier. 
                            Elle s'adresse aux débutants et pose les bases pour comprendre l'importance 
                            de la cybersécurité.
                          </p>
                        ) : currentSection === 'concepts' ? (
                          <p className="text-blue-200">
                            Une compréhension générale de l'informatique est recommandée, mais pas 
                            obligatoire. Avoir suivi la section "Introduction" de ce module est conseillé.
                          </p>
                        ) : currentSection === 'menaces' ? (
                          <p className="text-blue-200">
                            Pour bien comprendre cette section, il est recommandé d'avoir assimilé 
                            les concepts fondamentaux de la cybersécurité abordés dans la section précédente.
                          </p>
                        ) : currentSection === 'protection' ? (
                          <p className="text-blue-200">
                            Une connaissance préalable des principaux types de menaces cybernétiques est 
                            conseillée. Il est recommandé d'avoir suivi les sections "Introduction", 
                            "Concepts fondamentaux" et "Types de menaces" de ce module.
                          </p>
                        ) : currentSection === 'conformite' ? (
                          <p className="text-blue-200">
                            Pour tirer le meilleur parti de cette section, une compréhension de base des concepts de 
                            cybersécurité et des mesures de protection est recommandée. Idéalement, vous 
                            devriez avoir suivi les quatre premières sections du module.
                          </p>
                        ) : (
                          <p className="text-blue-200">
                            Ce module ne nécessite aucun prérequis technique particulier. 
                            Il s'adresse aux débutants et constitue une introduction générale 
                            à la cybersécurité.
                          </p>
                        )}
                      </div>
                      
                      <Separator className="bg-blue-800/50" />
                      
                      <div>
                        <h3 className="font-semibold text-lg mb-3">Public cible</h3>
                        <ul className="space-y-2 text-blue-200">
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>Nouveaux employés en phase d'intégration</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>Professionnels souhaitant acquérir des connaissances de base en cybersécurité</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>Managers et décideurs non techniques</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>Toute personne intéressée par les enjeux de la cybersécurité</span>
                          </li>
                        </ul>
                      </div>
                      
                      <Separator className="bg-blue-800/50" />
                      
                      <div>
                        <h3 className="font-semibold text-lg mb-3">Validation des acquis</h3>
                        <p className="text-blue-200 mb-4">
                          À la fin de ce module, vous serez évalué sur votre compréhension 
                          des concepts fondamentaux de la cybersécurité.
                        </p>
                        <div className="bg-blue-800/30 border border-blue-800 rounded-lg p-4">
                          <h4 className="font-medium mb-2 flex items-center">
                            <FileText className="h-5 w-5 mr-2 text-blue-300" />
                            Modalités d'évaluation
                          </h4>
                          <ul className="space-y-1 text-sm text-blue-200">
                            <li>• Quiz de validation des connaissances (20 questions)</li>
                            <li>• Étude de cas : identification des risques</li>
                            <li>• Score minimum requis : 70%</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Onglet Ressources */}
              <TabsContent value="ressources">
                <Card className="bg-blue-900/20 border-blue-800">
                  <CardHeader>
                    <CardTitle>Ressources complémentaires</CardTitle>
                    <CardDescription className="text-blue-200">
                      {currentSection 
                        ? `Ressources pour "${moduleSections.find(s => s.id === currentSection)?.title}"`
                        : "Documents et supports additionnels"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-3">Documents de référence</h3>
                        {currentSection === 'introduction' ? (
                          <div className="space-y-2">
                            <div className="flex justify-between items-center p-3 bg-blue-900/30 rounded-lg border border-blue-800">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-800 rounded-md">
                                  <FileText className="h-4 w-4 text-blue-200" />
                                </div>
                                <div>
                                  <h4 className="font-medium">Introduction à la cybersécurité en entreprise</h4>
                                  <p className="text-xs text-blue-300">PDF (1.2 MB)</p>
                                </div>
                              </div>
                              <Button variant="outline" className="h-8 border-blue-700">
                                <Download className="h-4 w-4 mr-2" />
                                Télécharger
                              </Button>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-blue-900/30 rounded-lg border border-blue-800">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-800 rounded-md">
                                  <FileText className="h-4 w-4 text-blue-200" />
                                </div>
                                <div>
                                  <h4 className="font-medium">Panorama des menaces cyber 2025</h4>
                                  <p className="text-xs text-blue-300">Présentation (5.4 MB)</p>
                                </div>
                              </div>
                              <Button variant="outline" className="h-8 border-blue-700">
                                <Download className="h-4 w-4 mr-2" />
                                Télécharger
                              </Button>
                            </div>
                          </div>
                        ) : currentSection === 'concepts' ? (
                          <div className="space-y-2">
                            <div className="flex justify-between items-center p-3 bg-blue-900/30 rounded-lg border border-blue-800">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-800 rounded-md">
                                  <BookOpen className="h-4 w-4 text-blue-200" />
                                </div>
                                <div>
                                  <h4 className="font-medium">Glossaire des concepts clés en cybersécurité</h4>
                                  <p className="text-xs text-blue-300">PDF (850 KB)</p>
                                </div>
                              </div>
                              <Button variant="outline" className="h-8 border-blue-700">
                                <Download className="h-4 w-4 mr-2" />
                                Télécharger
                              </Button>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-blue-900/30 rounded-lg border border-blue-800">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-800 rounded-md">
                                  <FileText className="h-4 w-4 text-blue-200" />
                                </div>
                                <div>
                                  <h4 className="font-medium">Guide de la triade CIA en pratique</h4>
                                  <p className="text-xs text-blue-300">Document technique (1.7 MB)</p>
                                </div>
                              </div>
                              <Button variant="outline" className="h-8 border-blue-700">
                                <Download className="h-4 w-4 mr-2" />
                                Télécharger
                              </Button>
                            </div>
                          </div>
                        ) : currentSection === 'menaces' ? (
                          <div className="space-y-2">
                            <div className="flex justify-between items-center p-3 bg-blue-900/30 rounded-lg border border-blue-800">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-800 rounded-md">
                                  <FileText className="h-4 w-4 text-blue-200" />
                                </div>
                                <div>
                                  <h4 className="font-medium">Taxonomie des cybermenaces modernes</h4>
                                  <p className="text-xs text-blue-300">PDF (2.3 MB)</p>
                                </div>
                              </div>
                              <Button variant="outline" className="h-8 border-blue-700">
                                <Download className="h-4 w-4 mr-2" />
                                Télécharger
                              </Button>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-blue-900/30 rounded-lg border border-blue-800">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-800 rounded-md">
                                  <FileText className="h-4 w-4 text-blue-200" />
                                </div>
                                <div>
                                  <h4 className="font-medium">Études de cas d'attaques récentes</h4>
                                  <p className="text-xs text-blue-300">PDF (3.1 MB)</p>
                                </div>
                              </div>
                              <Button variant="outline" className="h-8 border-blue-700">
                                <Download className="h-4 w-4 mr-2" />
                                Télécharger
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-6 bg-blue-900/10 rounded-lg border border-blue-900/50">
                            <FileText className="h-10 w-10 mx-auto text-blue-400 mb-3" />
                            <h3 className="text-xl font-semibold">Bientôt disponible</h3>
                            <p className="text-blue-300 mt-1">
                              Les ressources pour cette section sont en cours de préparation
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <Separator className="bg-blue-800/50" />
                      
                      <div>
                        <h3 className="font-semibold text-lg mb-3 flex items-center">
                          <MessageSquare className="mr-2 h-5 w-5 text-blue-300" />
                          Forum de discussion
                        </h3>
                        <div className="bg-blue-900/30 border border-blue-800 rounded-lg p-4">
                          <p className="text-blue-200 mb-4">
                            Rejoignez notre forum pour échanger avec les formateurs et les autres participants.
                          </p>
                          <Button className="bg-blue-700 hover:bg-blue-800">
                            Accéder au forum
                          </Button>
                        </div>
                      </div>
                      
                      <Separator className="bg-blue-800/50" />
                      
                      <div>
                        <h3 className="font-semibold text-lg mb-3">Modules complémentaires recommandés</h3>
                        <div className="text-center py-6 bg-blue-900/10 rounded-lg border border-blue-900/50">
                          <BookOpen className="h-10 w-10 mx-auto text-blue-400 mb-3" />
                          <h3 className="text-xl font-semibold">Bientôt disponible</h3>
                          <p className="text-blue-300 mt-1">
                            Des modules complémentaires seront ajoutés prochainement
                          </p>
                          <div className="mt-4">
                            <Button variant="outline" className="border-blue-700">
                              <Clock className="mr-2 h-4 w-4" />
                              M'alerter quand disponible
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}