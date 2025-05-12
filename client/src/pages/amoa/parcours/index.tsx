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

  // Niveaux de compétences - inspirés par l'approche CYBERASCENSION
  const competenceLevels: CompetenceLevel[] = [
    {
      id: 1,
      title: "Niveau 1 - Initiation AMOA",
      description: "Découvrez les fondamentaux de l'assistance à maîtrise d'ouvrage et le rôle de l'AMOA avec l'IA",
      skills: [
        {
          id: "comprendre-amoa",
          name: "Comprendre le rôle AMOA",
          description: "Découvrir les responsabilités et la place de l'AMOA dans l'organisation",
          exercises: ["Quiz interactif", "Étude de cas", "Simulation de réunion"],
          isCompleted: false,
          progress: 30
        },
        {
          id: "vocabulaire-projet",
          name: "Vocabulaire essentiel",
          description: "Maîtriser le langage professionnel de la gestion de projet",
          exercises: ["Glossaire interactif", "Mise en situation", "Challenge vocabulaire"],
          isCompleted: false,
          progress: 25
        },
        {
          id: "cycle-de-vie",
          name: "Cycle de vie projet",
          description: "Comprendre les différentes phases d'un projet et le rôle de l'AMOA",
          exercises: ["Visualisation interactive", "Étude comparative", "Mini-projet"],
          isCompleted: false,
          progress: 20
        },
        {
          id: "initiation-ia",
          name: "Introduction à l'IA en AMOA",
          description: "Comprendre comment l'IA peut transformer le travail de l'AMOA",
          exercises: ["Démonstration IA", "Cas pratiques", "Quiz prospectif"],
          isCompleted: false,
          progress: 15
        }
      ],
      isUnlocked: true,
      progress: 25,
      icon: <BookOpen className="h-6 w-6" />
    },
    {
      id: 2,
      title: "Niveau 2 - Analyse IA des besoins",
      description: "Utilisez l'IA pour recueillir et formaliser les besoins métier de façon structurée",
      skills: [
        {
          id: "entretiens-ia",
          name: "Entretiens augmentés par l'IA",
          description: "Techniques d'entretien optimisées par intelligence artificielle",
          exercises: ["Simulation d'entretien", "Analyse IA", "Feedback automatisé"],
          isCompleted: false,
          progress: 0
        },
        {
          id: "structuration-exigences",
          name: "Structuration des exigences",
          description: "Organiser et hiérarchiser les besoins avec assistance IA",
          exercises: ["Classement automatique", "Détection d'incohérences", "Visualisation"],
          isCompleted: false,
          progress: 0
        },
        {
          id: "analyse-textuelle",
          name: "Analyse textuelle intelligente",
          description: "Extraire des insights clés à partir de documents projet",
          exercises: ["Extraction sémantique", "Synthèse automatique", "Validation croisée"],
          isCompleted: false,
          progress: 0
        },
        {
          id: "personas-ia",
          name: "Génération de personas",
          description: "Créer des profils utilisateurs pertinents avec l'IA",
          exercises: ["Création assistée", "Validation", "Scénarios d'usage"],
          isCompleted: false,
          progress: 0
        }
      ],
      isUnlocked: false,
      progress: 0,
      icon: <BrainCircuit className="h-6 w-6" />
    },
    {
      id: 3,
      title: "Niveau 3 - Pilotage augmenté",
      description: "Développez vos compétences en pilotage de projet assisté par l'intelligence artificielle",
      skills: [
        {
          id: "suivi-ia",
          name: "Suivi de projet intelligent",
          description: "Mettre en place des outils IA pour le monitoring de projet",
          exercises: ["Configuration dashboard", "Alertes prédictives", "Reporting automatisé"],
          isCompleted: false,
          progress: 0
        },
        {
          id: "risques-ia",
          name: "Gestion prédictive des risques",
          description: "Anticiper et gérer les risques avec des modèles prédictifs",
          exercises: ["Modélisation", "Simulation", "Plans d'action"],
          isCompleted: false,
          progress: 0
        },
        {
          id: "communication-augmentee",
          name: "Communication augmentée",
          description: "Optimiser la communication projet avec l'intelligence artificielle",
          exercises: ["Assistants virtuels", "Synthèse automatique", "Multilinguisme"],
          isCompleted: false,
          progress: 0
        },
        {
          id: "decision-assistee",
          name: "Prise de décision assistée",
          description: "Utiliser l'IA comme support à la décision en contexte projet",
          exercises: ["Analyse multicritères", "Recommandation", "Évaluation d'impact"],
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
      title: "Niveau 4 - Documentation intelligente",
      description: "Maîtrisez la rédaction augmentée de documents fonctionnels avec l'IA",
      skills: [
        {
          id: "specifications-ia",
          name: "Spécifications assistées par IA",
          description: "Rédiger des spécifications fonctionnelles avec assistance IA",
          exercises: ["Co-rédaction", "Validation automatique", "Revue intelligente"],
          isCompleted: false,
          progress: 0
        },
        {
          id: "coherence-exigences",
          name: "Vérification de cohérence",
          description: "Garantir l'intégrité des exigences avec des modèles prédictifs",
          exercises: ["Détection d'anomalies", "Analyse d'impact", "Traçabilité"],
          isCompleted: false,
          progress: 0
        },
        {
          id: "generation-doc",
          name: "Génération documentaire",
          description: "Automatiser la production de documentation projet de qualité",
          exercises: ["Templates intelligents", "Mise à jour dynamique", "Multiformat"],
          isCompleted: false,
          progress: 0
        },
        {
          id: "prototypage-rapide",
          name: "Prototypage rapide",
          description: "Créer des maquettes et wireframes avec assistance IA",
          exercises: ["Design from text", "Test utilisateur", "Itération assistée"],
          isCompleted: false,
          progress: 0
        }
      ],
      isUnlocked: false,
      progress: 0,
      icon: <FileText className="h-6 w-6" />
    },
    {
      id: 5,
      title: "Niveau 5 - Certification AMOA",
      description: "Préparez et obtenez votre certification AMOA avec assistance IA personnalisée",
      skills: [
        {
          id: "strategie-projet-ia",
          name: "Stratégie globale augmentée",
          description: "Intégrer l'IA dans la vision stratégique des projets",
          exercises: ["Roadmap intelligente", "Allocation ressources", "Optimisation"],
          isCompleted: false,
          progress: 0
        },
        {
          id: "techniques-avancees",
          name: "Techniques avancées AMOA",
          description: "Maîtriser les approches de pointe en assistance MOA",
          exercises: ["Scénarios complexes", "Cas multi-projets", "Gouvernance"],
          isCompleted: false,
          progress: 0
        },
        {
          id: "preparation-certification",
          name: "Préparation personnalisée",
          description: "Programme adaptatif de préparation à la certification",
          exercises: ["Simulation d'examen", "Revue personnalisée", "Coaching IA"],
          isCompleted: false,
          progress: 0
        },
        {
          id: "evaluation-finale",
          name: "Évaluation finale",
          description: "Évaluation complète des compétences pour la certification",
          exercises: ["Examen blanc", "Projet de synthèse", "Soutenance"],
          isCompleted: false,
          progress: 0
        }
      ],
      isUnlocked: false,
      progress: 0,
      icon: <Trophy className="h-6 w-6" />
    }
  ];

  // Parcours spécialisés orientés IA et certification
  const parcoursPaths: ParcoursPath[] = [
    {
      id: "conseil-ia",
      title: "AMOA Consultant Augmenté",
      description: "Devenez un expert en relation client et analyse de besoins assistées par IA",
      levels: [1, 2, 3],
      icon: <BrainCircuit />,
      gradient: "from-blue-500 to-indigo-700",
      progress: 15
    },
    {
      id: "specification-ia",
      title: "AMOA Documentation Intelligente",
      description: "Maîtrisez la génération et validation automatique des livrables de projet",
      levels: [1, 2, 4, 5],
      icon: <Sparkles />,
      gradient: "from-violet-600 to-purple-800",
      progress: 10
    },
    {
      id: "pilotage-ia",
      title: "AMOA Pilotage Prédictif",
      description: "Utilisez l'IA pour anticiper les risques et optimiser le suivi de projet",
      levels: [1, 3, 4, 5],
      icon: <LineChart />,
      gradient: "from-cyan-500 to-blue-700",
      progress: 5
    },
    {
      id: "certification",
      title: "Certification AMOA",
      description: "Préparez-vous à l'examen de certification avec un programme personnalisé par IA",
      levels: [1, 2, 3, 4, 5],
      icon: <Trophy />,
      gradient: "from-amber-500 to-orange-700",
      progress: 0
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

  // Génération de recommandations IA avec Azure OpenAI
  const generateRecommendations = async () => {
    toast({
      title: "Recommandations personnalisées",
      description: "Analyse de votre profil et génération de recommandations en cours...",
      duration: 3000
    });
    
    try {
      // Appel à l'API OpenAI via Azure
      const response = await fetch('/api/openai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `En tant que conseiller IA spécialisé en AMOA, analyse le profil de l'utilisateur qui est actuellement au niveau ${competenceLevels[selectedLevel-1].title} avec ${competenceLevels[selectedLevel-1].progress}% de progression. 
          Génère 3 recommandations personnalisées pour progresser efficacement dans le parcours AMOA ASCENSION.
          Pour chaque recommandation, inclus: un titre court, une description de 1-2 phrases, et une action concrète à réaliser.`,
          max_tokens: 400,
          temperature: 0.7
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Recommandations IA prêtes !",
          description: "Voici vos prochaines étapes recommandées par l'IA pour progresser.",
          variant: "default",
          duration: 5000
        });
        
        // Afficher un dialogue avec les recommandations
        // Cette partie pourrait être implémentée avec un composant de dialogue modal
        alert(`Recommandations IA pour votre progression:
        
${data.text}`);
        
      } else {
        throw new Error('Erreur lors de la génération des recommandations');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer des recommandations pour le moment. Veuillez réessayer plus tard.",
        variant: "destructive",
        duration: 5000
      });
    }
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
          <PageTitle title="AMOA ASCENSION" />
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">AMOA ASCENSION</h1>
            <p className="text-indigo-200 mt-1">Suivez un parcours complet de gestion de projet AMOA avec l'IA comme guide</p>
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