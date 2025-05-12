import React, { useState } from 'react';
import { Link } from 'wouter';
import {
  ArrowLeft,
  Shield,
  FileText,
  Users,
  LineChart,
  Calendar,
  ListChecks,
  BrainCircuit,
  Sparkles,
  MessageCircle,
  GraduationCap,
  Trophy,
  CheckCircle,
  BookOpen,
  Briefcase,
  Map,
  Zap,
  Star,
  BarChart3,
  MoveRight,
  Layers,
  Settings
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from '@/hooks/use-toast';
import PageTitle from '@/components/utils/PageTitle';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Types pour les parcours
interface CompetenceLevel {
  id: number;
  title: string;
  description: string;
  skills: SkillItem[];
  isUnlocked: boolean;
  progress: number;
  icon: React.ReactNode;
}

interface SkillItem {
  id: string;
  name: string;
  description: string;
  exercises: string[];
  isCompleted: boolean;
  progress: number;
}

interface ParcoursPath {
  id: string;
  title: string;
  description: string;
  levels: number[];
  icon: React.ReactNode;
  gradient: string;
  progress: number;
}

export default function ParcoursAmoa() {
  // États
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('competences');
  
  const { toast } = useToast();

  // Niveaux de compétences
  const competenceLevels: CompetenceLevel[] = [
    {
      id: 1,
      title: "Fondamental",
      description: "Les compétences essentielles pour tout consultant AMOA",
      skills: [
        {
          id: "recueil-besoins",
          name: "Recueil des besoins",
          description: "Techniques d'entretien et de collecte d'exigences",
          exercises: ["Entretien guidé", "Questionnaire", "Atelier de brainstorming"],
          isCompleted: false,
          progress: 30
        },
        {
          id: "documentation",
          name: "Documentation fonctionnelle",
          description: "Rédaction de spécifications claires et structurées",
          exercises: ["Modèle de spécifications", "Cas d'utilisation", "Exigences"],
          isCompleted: false,
          progress: 20
        },
        {
          id: "communication",
          name: "Communication professionnelle",
          description: "Techniques de communication efficace avec les parties prenantes",
          exercises: ["Présentation", "Synthèse", "Argumentation"],
          isCompleted: false,
          progress: 15
        },
        {
          id: "bases-projet",
          name: "Bases de la gestion de projet",
          description: "Comprendre les fondamentaux de la gestion de projet",
          exercises: ["Planning", "Budget", "Périmètre"],
          isCompleted: false,
          progress: 10
        }
      ],
      isUnlocked: true,
      progress: 20,
      icon: <Shield className="h-6 w-6" />
    },
    {
      id: 2,
      title: "Intermédiaire",
      description: "Compétences pour consultants AMOA confirmés",
      skills: [
        {
          id: "analyse-processus",
          name: "Analyse des processus",
          description: "Modélisation et optimisation des processus métier",
          exercises: ["BPMN", "Cartographie", "Analyse de la valeur"],
          isCompleted: false,
          progress: 0
        },
        {
          id: "animation-atelier",
          name: "Animation d'ateliers",
          description: "Techniques pour animer des sessions de travail productives",
          exercises: ["Facilitation", "Gestion de groupe", "Résolution de conflits"],
          isCompleted: false,
          progress: 0
        },
        {
          id: "test-recette",
          name: "Tests et recette",
          description: "Stratégie de test et validation des livrables",
          exercises: ["Plan de test", "Jeux d'essai", "Rapport de recette"],
          isCompleted: false,
          progress: 0
        },
        {
          id: "conduite-changement",
          name: "Conduite du changement",
          description: "Accompagnement des utilisateurs dans la transformation",
          exercises: ["Communication", "Formation", "Accompagnement"],
          isCompleted: false,
          progress: 0
        }
      ],
      isUnlocked: false,
      progress: 0,
      icon: <Briefcase className="h-6 w-6" />
    },
    {
      id: 3,
      title: "Avancé",
      description: "Compétences pour consultants AMOA experts",
      skills: [
        {
          id: "pilotage",
          name: "Pilotage de projet",
          description: "Suivi, reporting et pilotage d'équipe",
          exercises: ["Tableau de bord", "KPI", "Gestion d'équipe"],
          isCompleted: false,
          progress: 0
        },
        {
          id: "gestion-risques",
          name: "Gestion des risques",
          description: "Identification et mitigation des risques projet",
          exercises: ["Analyse de risques", "Plan de mitigation", "Suivi"],
          isCompleted: false,
          progress: 0
        },
        {
          id: "negociation",
          name: "Négociation",
          description: "Techniques de négociation et résolution de conflits",
          exercises: ["Négociation contractuelle", "Gestion de conflit", "Influence"],
          isCompleted: false,
          progress: 0
        },
        {
          id: "architecture-fonctionnelle",
          name: "Architecture fonctionnelle",
          description: "Conception et modélisation d'architectures",
          exercises: ["Cartographie applicative", "Urbanisation SI", "Modélisation"],
          isCompleted: false,
          progress: 0
        }
      ],
      isUnlocked: false,
      progress: 0,
      icon: <LineChart className="h-6 w-6" />
    },
    {
      id: 4,
      title: "Expert",
      description: "Compétences pour consultants AMOA de haut niveau",
      skills: [
        {
          id: "conseil-strategique",
          name: "Conseil stratégique",
          description: "Accompagnement stratégique des décideurs",
          exercises: ["Transformation digitale", "Roadmap", "Business plan"],
          isCompleted: false,
          progress: 0
        },
        {
          id: "innovation",
          name: "Innovation & Disruption",
          description: "Intégrer l'innovation dans les projets métier",
          exercises: ["Design thinking", "POC", "Veille technologique"],
          isCompleted: false,
          progress: 0
        },
        {
          id: "methodologie-complexe",
          name: "Méthodologies complexes",
          description: "Adaptation et optimisation des méthodologies",
          exercises: ["Scaled Agile", "Hybride", "Sur-mesure"],
          isCompleted: false,
          progress: 0
        },
        {
          id: "gouvernance",
          name: "Gouvernance projet",
          description: "Mise en place et pilotage de la gouvernance",
          exercises: ["Comités", "Prise de décision", "Priorisation"],
          isCompleted: false,
          progress: 0
        }
      ],
      isUnlocked: false,
      progress: 0,
      icon: <Trophy className="h-6 w-6" />
    }
  ];

  // Parcours spécialisés
  const parcoursPaths: ParcoursPath[] = [
    {
      id: "conseil",
      title: "Parcours Conseil",
      description: "Devenez un expert en relation client, techniques d'entretien et communication",
      levels: [1, 2, 3],
      icon: <MessageCircle />,
      gradient: "from-blue-600 to-blue-800",
      progress: 15
    },
    {
      id: "specification",
      title: "Parcours Spécification",
      description: "Maîtrisez l'art de la documentation, modélisation et exigences",
      levels: [1, 2, 3, 4],
      icon: <FileText />,
      gradient: "from-indigo-600 to-indigo-800",
      progress: 10
    },
    {
      id: "test-qualite",
      title: "Parcours Test et Qualité",
      description: "Développez vos compétences en stratégies de test et assurance qualité",
      levels: [1, 2, 3],
      icon: <ListChecks />,
      gradient: "from-purple-600 to-purple-800",
      progress: 5
    },
    {
      id: "pilotage",
      title: "Parcours Pilotage",
      description: "Perfectionnez-vous en gestion de projet, planification et suivi",
      levels: [1, 2, 3, 4],
      icon: <BarChart3 />,
      gradient: "from-teal-600 to-teal-800",
      progress: 8
    }
  ];

  // Animations
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

  // Génération de recommandations IA
  const generateRecommendations = () => {
    toast({
      title: "Recommandations personnalisées",
      description: "Analyse de votre profil et génération de recommandations en cours...",
      duration: 3000
    });
    
    // Ici, vous appelleriez Azure OpenAI pour générer des recommandations personnalisées
    setTimeout(() => {
      toast({
        title: "Recommandations prêtes !",
        description: "Fonctionnalité à venir prochainement",
        variant: "default",
        duration: 5000
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 to-slate-950 text-white pb-20">
      {/* En-tête */}
      <div className="p-6 container mx-auto">
        <div className="flex items-center mb-2">
          <Link href="/amoa">
            <Button variant="ghost" className="text-white mr-4">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Retour
            </Button>
          </Link>
          <PageTitle title="PARCOURS AMOA" />
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Parcours AMOA</h1>
            <p className="text-indigo-200 mt-1">Développez méthodiquement vos compétences AMOA</p>
          </div>
          
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button 
              variant="outline" 
              size="sm"
              className="border-indigo-500 text-indigo-200 hover:bg-indigo-800/30"
              onClick={generateRecommendations}
            >
              <BrainCircuit className="mr-2 h-4 w-4" />
              Recommandations IA
            </Button>
          </div>
        </div>
        
        {/* Progression globale */}
        <Card className="bg-indigo-900/20 border-indigo-700 mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center">
              <Trophy className="h-5 w-5 mr-2 text-indigo-400" />
              Votre progression
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Niveau global</span>
                  <span>20%</span>
                </div>
                <Progress value={20} className="h-2.5 bg-indigo-950" />
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {competenceLevels.map((level) => (
                  <div key={level.id} className="text-center">
                    <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-2 ${level.isUnlocked ? 'bg-indigo-600' : 'bg-indigo-900/50'}`}>
                      {level.icon}
                    </div>
                    <h3 className="font-medium">{level.title}</h3>
                    <div className="text-xs text-indigo-300 mb-1">{level.progress}% complété</div>
                    <Progress value={level.progress} className="h-1 w-16 mx-auto bg-indigo-950" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Onglets */}
        <Tabs defaultValue="competences" value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="bg-indigo-900/30 border border-indigo-700">
            <TabsTrigger value="competences" className="data-[state=active]:bg-indigo-700">Niveaux de compétence</TabsTrigger>
            <TabsTrigger value="parcours" className="data-[state=active]:bg-indigo-700">Parcours spécialisés</TabsTrigger>
          </TabsList>
          
          {/* Contenu des niveaux de compétence */}
          <TabsContent value="competences" className="mt-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Navigation des niveaux */}
              <Card className="bg-indigo-900/20 border-indigo-700 md:w-1/4">
                <CardHeader>
                  <CardTitle>Niveaux</CardTitle>
                  <CardDescription className="text-indigo-300">
                    Progression par niveau de compétence
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {competenceLevels.map((level) => (
                      <button
                        key={level.id}
                        onClick={() => level.isUnlocked && setSelectedLevel(level.id)}
                        className={`w-full p-3 rounded-md flex items-center justify-between ${
                          selectedLevel === level.id ? 'bg-indigo-700' : 
                          level.isUnlocked ? 'bg-indigo-900/50 hover:bg-indigo-800/50' : 'bg-indigo-950/50 cursor-not-allowed'
                        } transition-colors`}
                        disabled={!level.isUnlocked}
                      >
                        <div className="flex items-center">
                          <div className="mr-3">
                            {level.icon}
                          </div>
                          <div className="text-left">
                            <h3 className={`font-medium ${level.isUnlocked ? 'text-white' : 'text-indigo-400'}`}>{level.title}</h3>
                            <div className="text-xs text-indigo-300">{level.progress}% complété</div>
                          </div>
                        </div>
                        
                        {!level.isUnlocked && (
                          <div className="p-1 rounded-full bg-indigo-900/80">
                            <Settings className="h-4 w-4 text-indigo-400" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              {/* Compétences du niveau sélectionné */}
              <div className="md:w-3/4">
                <Card className="bg-indigo-900/20 border-indigo-700 mb-4">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{competenceLevels[selectedLevel-1].title}</CardTitle>
                        <CardDescription className="text-indigo-300">
                          {competenceLevels[selectedLevel-1].description}
                        </CardDescription>
                      </div>
                      <Badge className="bg-indigo-700">{competenceLevels[selectedLevel-1].progress}% complété</Badge>
                    </div>
                  </CardHeader>
                </Card>
                
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-4"
                >
                  {competenceLevels[selectedLevel-1].skills.map((skill) => (
                    <motion.div key={skill.id} variants={itemVariants}>
                      <Card className="bg-indigo-900/20 border-indigo-700">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle>{skill.name}</CardTitle>
                            <Badge variant="outline" className={`${
                              skill.progress === 100 ? 'bg-green-900/20 border-green-500 text-green-400' : 'bg-indigo-900/20 border-indigo-500 text-indigo-300'
                            }`}>
                              {skill.progress}%
                            </Badge>
                          </div>
                          <CardDescription className="text-indigo-300">
                            {skill.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <h4 className="text-sm font-medium mb-2">Exercices et pratiques:</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {skill.exercises.map((exercise, index) => (
                              <div key={index} className="p-2 rounded-md bg-indigo-900/50 flex items-center">
                                <div className={`w-4 h-4 rounded-full mr-2 ${
                                  index < (skill.progress / 33) ? 'bg-indigo-500' : 'bg-indigo-950'
                                }`} />
                                <span className="text-sm">{exercise}</span>
                              </div>
                            ))}
                          </div>
                          
                          <div className="mt-4">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Progression</span>
                              <span>{skill.progress}%</span>
                            </div>
                            <Progress value={skill.progress} className="h-2 bg-indigo-950" />
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button className="bg-indigo-600 hover:bg-indigo-700 w-full">
                            {skill.progress > 0 ? 'Continuer l\'apprentissage' : 'Commencer l\'apprentissage'}
                          </Button>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>
          </TabsContent>
          
          {/* Contenu des parcours spécialisés */}
          <TabsContent value="parcours" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {parcoursPaths.map((path, i) => (
                <motion.div
                  key={path.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                >
                  <div className={`rounded-xl p-6 h-full bg-gradient-to-br ${path.gradient}`}>
                    <div className="flex flex-col h-full">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-full bg-white/10">
                          {path.icon}
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-white">
                            {path.title}
                          </h2>
                          <div className="text-sm text-indigo-200 flex items-center mt-1">
                            <span>{path.progress}% complété</span>
                          </div>
                        </div>
                      </div>
                      
                      <p className="mb-4 text-indigo-100">
                        {path.description}
                      </p>
                      
                      <div className="mb-4">
                        <h4 className="font-medium text-white text-sm mb-2">Niveaux inclus:</h4>
                        <div className="flex gap-2 mb-3">
                          {path.levels.map((level) => (
                            <Badge key={level} variant="outline" className="bg-white/10 text-white border-white/30">
                              {competenceLevels[level-1].title}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="mt-2 mb-4">
                        <Progress value={path.progress} className="h-2 bg-white/20" />
                      </div>
                      
                      <div className="mt-auto pt-2">
                        <Button className="w-full bg-white/10 hover:bg-white/20 text-white">
                          Suivre ce parcours
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}