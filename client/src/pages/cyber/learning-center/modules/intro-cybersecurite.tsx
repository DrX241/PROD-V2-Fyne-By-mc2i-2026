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
                                Le paysage des cybermenaces est comme un jeu d'échecs en constante évolution, 
                                où les attaquants inventent sans cesse de nouveaux mouvements pour mettre en échec 
                                vos défenses. Embarquons dans un safari des menaces cybernétiques !
                              </p>

                              <h3>🦠 Le Zoo des Malwares</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                                <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-800">
                                  <h4 className="font-bold text-yellow-300 mb-2">Ransomware</h4>
                                  <p>Le bandit qui prend vos données en otage et demande une rançon pour les libérer.</p>
                                  <div className="mt-2 text-xs text-blue-300">Exemple célèbre: WannaCry</div>
                                </div>
                                <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-800">
                                  <h4 className="font-bold text-yellow-300 mb-2">Cheval de Troie</h4>
                                  <p>Se déguise en cadeau mais cache une armée d'infiltrés prêts à prendre le contrôle.</p>
                                  <div className="mt-2 text-xs text-blue-300">Exemple célèbre: Zeus</div>
                                </div>
                                <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-800">
                                  <h4 className="font-bold text-yellow-300 mb-2">Spyware</h4>
                                  <p>L'espion indiscret qui observe chacun de vos mouvements et rapporte tout.</p>
                                  <div className="mt-2 text-xs text-blue-300">Exemple célèbre: Pegasus</div>
                                </div>
                                <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-800">
                                  <h4 className="font-bold text-yellow-300 mb-2">Ver informatique</h4>
                                  <p>Voyageur autonome qui se propage de système en système sans invitation.</p>
                                  <div className="mt-2 text-xs text-blue-300">Exemple célèbre: Stuxnet</div>
                                </div>
                              </div>

                              <h3>🎭 Les Masques de l'Ingénierie Sociale</h3>
                              <div className="my-4 p-4 bg-gradient-to-r from-blue-900/50 to-indigo-900/50 rounded-lg border border-blue-700">
                                <div className="flex flex-col md:flex-row gap-4">
                                  <div className="flex-1">
                                    <h4 className="font-bold text-green-300 mb-2">Phishing</h4>
                                    <p>L'art du pêcheur numérique qui lance des appâts irrésistibles (emails, messages) en espérant que vous mordiez à l'hameçon.</p>
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-bold text-green-300 mb-2">Usurpation d'identité</h4>
                                    <p>Le caméléon digital qui prend l'apparence d'une personne de confiance pour vous manipuler.</p>
                                  </div>
                                </div>
                              </div>

                              <h3>👥 La Galerie des Cybercriminels</h3>
                              <div className="my-4 overflow-x-auto">
                                <table className="w-full border-collapse">
                                  <thead>
                                    <tr className="bg-blue-800">
                                      <th className="p-2 text-left">Type d'acteur</th>
                                      <th className="p-2 text-left">Motivation</th>
                                      <th className="p-2 text-left">Complexité</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="border-t border-blue-700 bg-blue-900/20">
                                      <td className="p-2 font-medium">Script Kiddies</td>
                                      <td className="p-2">Curiosité, vanité</td>
                                      <td className="p-2">⭐</td>
                                    </tr>
                                    <tr className="border-t border-blue-700 bg-blue-900/30">
                                      <td className="p-2 font-medium">Hacktivistes</td>
                                      <td className="p-2">Idéologie, activisme</td>
                                      <td className="p-2">⭐⭐</td>
                                    </tr>
                                    <tr className="border-t border-blue-700 bg-blue-900/20">
                                      <td className="p-2 font-medium">Cybercriminels</td>
                                      <td className="p-2">Profit financier</td>
                                      <td className="p-2">⭐⭐⭐</td>
                                    </tr>
                                    <tr className="border-t border-blue-700 bg-blue-900/30">
                                      <td className="p-2 font-medium">États-nations</td>
                                      <td className="p-2">Espionnage, sabotage</td>
                                      <td className="p-2">⭐⭐⭐⭐⭐</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>

                              <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border-l-4 border-yellow-500 p-4 my-4 rounded-r-lg">
                                <h4 className="font-bold text-yellow-300">🛡️ À retenir</h4>
                                <p className="mt-1">
                                  Dans le monde cyber, la meilleure défense est la connaissance ! Comme dans un jeu vidéo, 
                                  connaître vos ennemis et leurs tactiques vous donne l'avantage stratégique.
                                </p>
                              </div>
                            </div>
                          )}

                          {currentSection === 'protection' && (
                            <div>
                              <p>
                                Imaginez votre système informatique comme un château médiéval face à une horde d'envahisseurs. 
                                Pour le protéger efficacement, vous aurez besoin de bien plus qu'un simple mur ! 
                                Découvrons ensemble comment bâtir votre forteresse numérique imprenable.
                              </p>

                              <h3>🏰 L'Arsenal du Cyber-Chevalier</h3>
                              <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 p-5 rounded-xl border border-blue-700 my-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div className="bg-blue-900/40 p-4 rounded-lg text-center">
                                    <div className="text-3xl mb-2">🔒</div>
                                    <h4 className="font-bold text-cyan-300 mb-1">Authentification Magique</h4>
                                    <p>Comme les sorts à plusieurs composantes dans les jeux de rôle, l'authentification multi-facteurs exige plusieurs "ingrédients" pour accéder au trésor.</p>
                                  </div>
                                  <div className="bg-blue-900/40 p-4 rounded-lg text-center">
                                    <div className="text-3xl mb-2">🛡️</div>
                                    <h4 className="font-bold text-cyan-300 mb-1">Bouclier-Pare-feu</h4>
                                    <p>Votre gardien vigilant qui analyse chaque visiteur à l'entrée de votre royaume numérique et repousse les intrus.</p>
                                  </div>
                                  <div className="bg-blue-900/40 p-4 rounded-lg text-center">
                                    <div className="text-3xl mb-2">🧪</div>
                                    <h4 className="font-bold text-cyan-300 mb-1">Potions Anti-Malware</h4>
                                    <p>Détectent et neutralisent les créatures maléfiques qui tentent de corrompre votre système.</p>
                                  </div>
                                </div>
                              </div>

                              <h3>🧩 La Défense en Profondeur : Comme un Jeu de Stratégie</h3>
                              <div className="my-5 relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-lg"></div>
                                <div className="relative z-10">
                                  <div className="border-b border-blue-700 pb-3 mb-3">
                                    <h4 className="text-orange-300 font-bold">Niveau 1 : Périmètre Extérieur</h4>
                                    <p>Pare-feu, détection d'intrusion, filtrage réseau - Votre première ligne de défense contre les hordes d'attaquants.</p>
                                  </div>
                                  <div className="border-b border-blue-700 pb-3 mb-3">
                                    <h4 className="text-orange-300 font-bold">Niveau 2 : Protection Intérieure</h4>
                                    <p>Segmentation réseau, contrôles d'accès, chiffrement - Comme les différentes salles d'un donjon, chacune avec sa propre serrure.</p>
                                  </div>
                                  <div>
                                    <h4 className="text-orange-300 font-bold">Niveau 3 : Sécurisation des Données</h4>
                                    <p>Chiffrement, sauvegardes, authentification forte - Le coffre-fort au centre du château pour protéger vos trésors les plus précieux.</p>
                                  </div>
                                </div>
                              </div>

                              <h3>🧠 La Guilde des Cyber-Gardiens</h3>
                              <div className="my-4 bg-blue-900/20 p-4 rounded-lg border border-blue-800">
                                <p className="mb-3">La meilleure technologie du monde reste inefficace sans une équipe bien formée. Votre personnel représente à la fois votre plus grande force et votre maillon le plus vulnérable !</p>

                                <div className="flex flex-col md:flex-row gap-3 mt-4">
                                  <div className="flex-1 bg-gradient-to-b from-blue-900/40 to-blue-900/10 p-3 rounded-lg">
                                    <h4 className="font-bold text-green-300 mb-1 flex items-center">
                                      <span className="bg-green-900/50 p-1 rounded-full mr-2 text-xs">01</span>
                                      Formation
                                    </h4>
                                    <p className="text-sm">Entraînez vos cyber-guerriers aux techniques de défense modernes !</p>
                                  </div>
                                  <div className="flex-1 bg-gradient-to-b from-blue-900/40 to-blue-900/10 p-3 rounded-lg">
                                    <h4 className="font-bold text-green-300 mb-1 flex items-center">
                                      <span className="bg-green-900/50 p-1 rounded-full mr-2 text-xs">02</span>
                                      Procédures
                                    </h4>
                                    <p className="text-sm">Équipez-les de manuels tactiques pour réagir efficacement aux attaques.</p>
                                  </div>
                                  <div className="flex-1 bg-gradient-to-b from-blue-900/40 to-blue-900/10 p-3 rounded-lg">
                                    <h4 className="font-bold text-green-300 mb-1 flex items-center">
                                      <span className="bg-green-900/50 p-1 rounded-full mr-2 text-xs">03</span>
                                      Culture
                                    </h4>
                                    <p className="text-sm">Développez un esprit de vigilance partagé par tous les membres de votre royaume.</p>
                                  </div>
                                </div>
                              </div>

                              <div className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border-l-4 border-pink-500 p-4 my-4 rounded-r-lg">
                                <h4 className="font-bold text-pink-300">✨ À retenir</h4>
                                <p className="mt-1">
                                  La cybersécurité est comme un jeu de rôle coopératif : vous avez besoin d'une équipe aux compétences diverses,
                                  d'un bon équipement, et d'une stratégie adaptée à chaque type d'adversaire !
                                </p>
                              </div>
                            </div>
                          )}

                          {currentSection === 'conformite' && (
                            <div>
                              <p>
                                Entrez dans le monde fascinant des règles de cybersécurité, où même les super-héros
                                numériques doivent respecter les lois ! Découvrez comment transformer cette jungle réglementaire
                                en un atout pour votre organisation.
                              </p>

                              <h3>🏆 Le Tournoi des Champions de la Conformité</h3>
                              <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-900/30 to-indigo-900/30 p-1 my-4">
                                <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-blue-600/20 blur-xl"></div>
                                <div className="relative rounded-lg p-5">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/30 p-4 rounded-lg border border-blue-700/50 backdrop-blur-sm">
                                      <div className="flex items-center mb-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center mr-3 shadow-lg">
                                          <span className="text-xl">🏅</span>
                                        </div>
                                        <h4 className="font-bold text-yellow-300">RGPD</h4>
                                      </div>
                                      <p>Le champion européen de la protection des données personnelles. Son super-pouvoir : faire pleuvoir des amendes allant jusqu'à 4% du chiffre d'affaires mondial !</p>
                                      <div className="mt-2 text-xs bg-yellow-900/30 p-2 rounded">
                                        <span className="text-yellow-200 font-medium">Conseil de héros :</span> Documenter tout ce que vous faites avec les données personnelles, comme si vous écriviez le journal de bord d'un super-héros !
                                      </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/30 p-4 rounded-lg border border-blue-700/50 backdrop-blur-sm">
                                      <div className="flex items-center mb-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center mr-3 shadow-lg">
                                          <span className="text-xl">🥈</span>
                                        </div>
                                        <h4 className="font-bold text-blue-300">NIS & NIS 2</h4>
                                      </div>
                                      <p>Les jumeaux défenseurs des infrastructures critiques. Leur mission : s'assurer que les services essentiels restent opérationnels face aux cyber-menaces.</p>
                                      <div className="mt-2 text-xs bg-blue-900/30 p-2 rounded">
                                        <span className="text-blue-200 font-medium">Conseil de héros :</span> Identifiez vos dépendances critiques et testez régulièrement votre résistance aux attaques !
                                      </div>
                                    </div>
                                  </div>

                                  <div className="mt-4 p-4 bg-gradient-to-br from-purple-900/40 to-indigo-900/30 rounded-lg border border-purple-700/50">
                                    <h4 className="font-bold text-purple-300 mb-2 flex items-center">
                                      <span className="text-lg mr-2">🌟</span>
                                      Autres combattants de l'arène réglementaire
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                      <div className="bg-purple-900/20 p-2 rounded">
                                        <p className="font-medium text-center text-purple-200">ISO 27001</p>
                                        <p className="text-xs text-center">Le sage qui enseigne l'art du management de la sécurité</p>
                                      </div>
                                      <div className="bg-purple-900/20 p-2 rounded">
                                        <p className="font-medium text-center text-purple-200">PCI DSS</p>
                                        <p className="text-xs text-center">Le gardien du trésor des cartes de paiement</p>
                                      </div>
                                      <div className="bg-purple-900/20 p-2 rounded">
                                        <p className="font-medium text-center text-purple-200">LPM</p>
                                        <p className="text-xs text-center">Le bouclier militaire français contre les cyberattaques</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <h3>🎮 Jouer le jeu de la conformité</h3>
                              <div className="my-4 bg-gradient-to-r from-indigo-900/20 to-blue-900/20 rounded-lg p-5 border border-indigo-800/50">
                                <p className="mb-4">La conformité n'est pas un ennemi à combattre, mais un allié à apprivoiser ! Voici comment transformer cette "contrainte" en avantage stratégique :</p>

                                <div className="space-y-3">
                                  <div className="flex items-start gap-3">
                                    <div className="bg-indigo-900/40 rounded-full p-2 flex-shrink-0">
                                      <span className="text-xs">1</span>
                                    </div>
                                    <div>
                                      <h4 className="font-bold text-indigo-300">Cartographiez votre territoire</h4>
                                      <p className="text-sm">Identifiez les réglementations qui s'appliquent à votre organisation, comme un explorateur établissant une carte du monde.</p>
                                    </div>
                                  </div>

                                  <div className="flex items-start gap-3">
                                    <div className="bg-indigo-900/40 rounded-full p-2 flex-shrink-0">
                                      <span className="text-xs">2</span>
                                    </div>
                                    <div>
                                      <h4 className="font-bold text-indigo-300">Collectez les badges d'honneur</h4>
                                      <p className="text-sm">Obtenez les certifications qui rassureront vos clients et partenaires sur votre niveau de protection.</p>
                                    </div>
                                  </div>

                                  <div className="flex items-start gap-3">
                                    <div className="bg-indigo-900/40 rounded-full p-2 flex-shrink-0">
                                      <span className="text-xs">3</span>
                                    </div>
                                    <div>
                                      <h4 className="font-bold text-indigo-300">Transformez les obligations en super-pouvoirs</h4>
                                      <p className="text-sm">Utilisez les exigences réglementaires pour renforcer votre sécurité globale et créer un avantage concurrentiel.</p>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border-l-4 border-green-500 p-4 my-4 rounded-r-lg">
                                <h4 className="font-bold text-green-300">🎯 À retenir</h4>
                                <p className="mt-1">
                                  La conformité n'est pas un labyrinthe bureaucratique, mais votre boussole dans le monde cyber !
                                  Elle vous aide à naviguer dans les eaux troubles des menaces numériques avec une carte et un cap clairs.
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