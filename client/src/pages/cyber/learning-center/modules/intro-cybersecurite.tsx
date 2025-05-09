import React, { useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  BookOpen,
  Shield,
  ChevronRight,
  ChevronLeft,
  Clock,
  List,
  CheckCircle,
  Play,
  FileText,
  MessageSquare,
  User,
  Star,
  Download,
  BrainCircuit,
  Sparkles
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
  duration: string;
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
      duration: '20 min',
      progress: 0,
      isCompleted: false
    },
    {
      id: 'concepts',
      title: 'Concepts fondamentaux et terminologie',
      duration: '30 min',
      progress: 0,
      isCompleted: false
    },
    {
      id: 'menaces',
      title: 'Paysage des menaces cyber',
      duration: '25 min',
      progress: 0,
      isCompleted: false
    },
    {
      id: 'principes',
      title: 'Principes de base de la sécurité',
      duration: '35 min',
      progress: 0,
      isCompleted: false
    },
    {
      id: 'controles',
      title: 'Contrôles de sécurité essentiels',
      duration: '40 min',
      progress: 0,
      isCompleted: false
    },
    {
      id: 'evaluation',
      title: 'Évaluation des connaissances',
      duration: '20 min',
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
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1 text-blue-300" />
                <span className="text-sm text-blue-200">2-3h</span>
              </div>
              <Badge variant="outline" className="border-blue-600 text-blue-200">
                Débutant
              </Badge>
              <Button
                variant="outline"
                size="icon"
                className="bg-blue-900/50 border-blue-700 text-white hover:bg-blue-800"
                onClick={handleAssistantInteraction}
              >
                <BrainCircuit className="h-5 w-5" />
              </Button>
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
                          <div className="flex justify-between items-center text-xs mt-1 text-blue-300">
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {section.duration}
                            </div>
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
                          
                          {(currentSection !== 'introduction' && currentSection !== 'concepts') && (
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
                      Ce que vous allez apprendre dans ce module
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-3 flex items-center">
                          <Star className="text-yellow-500 mr-2 h-5 w-5" />
                          Objectifs
                        </h3>
                        <div className="space-y-2">
                          {learningObjectives.map((objective, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <Checkbox id={`objective-${index}`} />
                              <label
                                htmlFor={`objective-${index}`}
                                className="text-sm leading-tight cursor-pointer"
                              >
                                {objective}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <Separator className="bg-blue-800/50" />
                      
                      <div>
                        <h3 className="font-semibold text-lg mb-3">Prérequis</h3>
                        <p className="text-blue-200">
                          Ce module ne nécessite aucun prérequis technique particulier. 
                          Il s'adresse aux débutants et constitue une introduction générale 
                          à la cybersécurité.
                        </p>
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
                      Documents et supports additionnels
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-3">Documents de référence</h3>
                        <div className="space-y-2">
                          {additionalResources.map((resource, index) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-blue-900/30 rounded-lg border border-blue-800">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-800 rounded-md">
                                  {resource.icon}
                                </div>
                                <div>
                                  <h4 className="font-medium">{resource.title}</h4>
                                  <p className="text-xs text-blue-300">{resource.type}</p>
                                </div>
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="border-blue-700"
                                disabled={!resource.downloadable}
                              >
                                {resource.downloadable ? (
                                  <>
                                    <Download className="mr-1 h-4 w-4" />
                                    Télécharger
                                  </>
                                ) : (
                                  <>
                                    <Play className="mr-1 h-4 w-4" />
                                    Voir
                                  </>
                                )}
                              </Button>
                            </div>
                          ))}
                        </div>
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="bg-blue-900/30 border border-blue-800 rounded-lg p-3">
                            <h4 className="font-medium flex items-center">
                              <FileText className="h-4 w-4 mr-2 text-blue-300" />
                              Modélisation des menaces
                            </h4>
                            <p className="text-xs text-blue-300 mt-1">
                              Apprendre à identifier et modéliser les menaces potentielles
                            </p>
                          </div>
                          <div className="bg-blue-900/30 border border-blue-800 rounded-lg p-3">
                            <h4 className="font-medium flex items-center">
                              <Shield className="h-4 w-4 mr-2 text-blue-300" />
                              Principes de défense en profondeur
                            </h4>
                            <p className="text-xs text-blue-300 mt-1">
                              Stratégies pour créer plusieurs couches de défense
                            </p>
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