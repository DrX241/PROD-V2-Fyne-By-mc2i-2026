import React from 'react';
import { useLocation } from 'wouter';
import { Shield, Award, Book, CheckCircle, ChevronRight, ArrowLeft } from 'lucide-react';
import HomeLayout from '@/components/layout/HomeLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import PageTitle from '@/components/utils/PageTitle';
import { useTheme } from '@/contexts/ThemeContext';

// Utilisation d'une image de fond avec import
import cyberBgPath from '@assets/image_1746214614952.png';

// Interface pour le type de module
interface LearningModule {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: 'Débutant' | 'Intermédiaire' | 'Avancé' | 'Expert' | 'Maître';
  category: string;
  tags: string[];
  chapters: Chapter[];
  progress: number;
  isUnlocked: boolean;
}

// Interface pour le chapitre
interface Chapter {
  id: string;
  title: string;
  lessons: Lesson[];
  isCompleted: boolean;
}

// Interface pour la leçon
interface Lesson {
  id: string;
  title: string;
  type: 'théorie' | 'pratique' | 'quiz' | 'challenge';
  duration: string;
  isCompleted: boolean;
}

// Interface pour le parcours d'apprentissage
interface LearningPath {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  modules: LearningModule[];
  progress: number;
  color: string;
}

// Composant de carte de parcours d'apprentissage
const LearningPathCard: React.FC<{ path: LearningPath }> = ({ path }) => {
  const [, setLocation] = useLocation();
  
  return (
    <Card className={`border-t-4 ${path.color} shadow-lg hover:shadow-xl transition-all`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="p-2 rounded-full bg-slate-100 mr-4">
            {path.icon}
          </div>
          <div className="flex-1">
            <CardTitle>{path.title}</CardTitle>
          </div>
        </div>
        <CardDescription className="mt-2">{path.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Progression</span>
            <span>{path.progress}%</span>
          </div>
          <Progress value={path.progress} className="h-2" />
        </div>
        <div className="grid grid-cols-1 gap-2">
          {path.modules.slice(0, 3).map(module => (
            <div key={module.id} className="flex items-center p-2 rounded-md border border-slate-200 text-sm">
              {module.isUnlocked ? (
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
              ) : (
                <div className="h-4 w-4 mr-2 rounded-full border border-slate-300" />
              )}
              <span className="flex-1 truncate">{module.title}</span>
              <Badge variant={module.isUnlocked ? "default" : "outline"} className="ml-2">
                {module.level}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full flex items-center justify-between"
          onClick={() => setLocation(`/cyber/learning/module/${path.id}`)}
        >
          Explorer ce parcours
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </CardFooter>
    </Card>
  );
};

// Définition des parcours d'apprentissage
const learningPaths: LearningPath[] = [
  {
    id: "sensibilisation",
    title: "Sensibilisation Cybersécurité",
    description: "Fondamentaux de la sécurité pour tous les collaborateurs",
    icon: <Shield className="h-6 w-6 text-indigo-600" />,
    modules: [
      {
        id: "phishing",
        title: "Reconnaître et éviter le phishing",
        description: "Apprenez à identifier et à vous protéger contre les attaques de phishing",
        duration: "45 min",
        level: "Débutant",
        category: "Sensibilisation",
        tags: ["phishing", "social engineering", "email security"],
        chapters: [
          {
            id: "phishing-intro",
            title: "Introduction au phishing",
            lessons: [
              { id: "phishing-what", title: "Qu'est-ce que le phishing?", type: "théorie", duration: "10 min", isCompleted: false },
              { id: "phishing-types", title: "Types d'attaques de phishing", type: "théorie", duration: "15 min", isCompleted: false },
            ],
            isCompleted: false
          }
        ],
        progress: 0,
        isUnlocked: true
      },
      {
        id: "passwords",
        title: "Gestion des mots de passe",
        description: "Bonnes pratiques pour créer et gérer des mots de passe sécurisés",
        duration: "30 min",
        level: "Débutant",
        category: "Sensibilisation",
        tags: ["passwords", "authentication", "security"],
        chapters: [],
        progress: 0,
        isUnlocked: true
      },
      {
        id: "social-engineering",
        title: "Ingénierie sociale",
        description: "Comprendre et se défendre contre l'ingénierie sociale",
        duration: "60 min",
        level: "Intermédiaire",
        category: "Sensibilisation",
        tags: ["social engineering", "manipulation", "security awareness"],
        chapters: [],
        progress: 0,
        isUnlocked: false
      }
    ],
    progress: 15,
    color: "border-indigo-600"
  },
  {
    id: "rgpd",
    title: "RGPD & Protection des Données",
    description: "Conformité réglementaire et protection des données personnelles",
    icon: <Book className="h-6 w-6 text-purple-600" />,
    modules: [
      {
        id: "rgpd-basics",
        title: "Fondamentaux du RGPD",
        description: "Comprendre les principes clés du Règlement Général sur la Protection des Données",
        duration: "60 min",
        level: "Débutant",
        category: "Conformité",
        tags: ["RGPD", "données personnelles", "conformité"],
        chapters: [],
        progress: 0,
        isUnlocked: true
      }
    ],
    progress: 0,
    color: "border-purple-600"
  },
  {
    id: "risques",
    title: "Analyse des Risques",
    description: "Méthodologies d'identification et évaluation des menaces",
    icon: <Shield className="h-6 w-6 text-blue-600" />,
    modules: [
      {
        id: "threat-modeling",
        title: "Modélisation des menaces",
        description: "Apprendre à identifier et analyser les menaces potentielles",
        duration: "90 min",
        level: "Intermédiaire",
        category: "Analyse",
        tags: ["threat modeling", "risk analysis", "security"],
        chapters: [],
        progress: 0,
        isUnlocked: false
      }
    ],
    progress: 0,
    color: "border-blue-600"
  },
  {
    id: "audit",
    title: "Audit Cyber",
    description: "Techniques et procédures d'audit de sécurité",
    icon: <CheckCircle className="h-6 w-6 text-green-600" />,
    modules: [
      {
        id: "audit-methodology",
        title: "Méthodologie d'audit",
        description: "Comprendre les étapes et processus d'un audit de cybersécurité",
        duration: "120 min",
        level: "Avancé",
        category: "Audit",
        tags: ["audit", "compliance", "assessment"],
        chapters: [],
        progress: 0,
        isUnlocked: false
      }
    ],
    progress: 0,
    color: "border-green-600"
  },
  {
    id: "strategie",
    title: "Stratégie & Gouvernance",
    description: "Pilotage et organisation de la cybersécurité",
    icon: <Award className="h-6 w-6 text-amber-600" />,
    modules: [
      {
        id: "security-strategy",
        title: "Stratégie de cybersécurité",
        description: "Élaboration d'une stratégie de cybersécurité efficace",
        duration: "150 min",
        level: "Expert",
        category: "Stratégie",
        tags: ["strategy", "governance", "leadership"],
        chapters: [],
        progress: 0,
        isUnlocked: false
      }
    ],
    progress: 0,
    color: "border-amber-600"
  }
];

// Composant principal
export default function CyberForgeAcademyPage() {
  const [, setLocation] = useLocation();
  const { isDark } = useTheme();
  
  return (
    <HomeLayout>
      <PageTitle title="CyberForge Academy" />
      
      <div className={`min-h-screen ${isDark ? 'bg-slate-900' : 'bg-gray-100'} relative`}>
        {/* Image de fond avec overlay */}
        <div className="absolute inset-0 bg-cover bg-center opacity-10" 
          style={{ backgroundImage: `url(${cyberBgPath})` }} />
        
        <div className="relative z-10">
          <header className={`py-4 px-6 ${isDark ? 'bg-slate-800/80' : 'bg-white/80'} shadow-md backdrop-blur-sm`}>
            <div className="container mx-auto flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => setLocation('/cyber-mode-selection')}
                className={`flex items-center ${isDark ? 'text-slate-300 hover:text-white hover:bg-slate-700' : 'text-slate-700 hover:text-black hover:bg-slate-100'}`}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour
              </Button>
              
              <h1 className={`text-2xl font-bold text-center ${isDark ? 'text-white' : 'text-slate-800'}`}>
                CyberForge Academy
              </h1>
              
              <div className="w-24"></div> {/* Spacer pour l'équilibre */}
            </div>
          </header>
          
          <main className="container mx-auto py-8 px-4">
            <div className={`mb-8 p-6 rounded-lg ${isDark ? 'bg-slate-800/90' : 'bg-white/90'} shadow-lg backdrop-blur-sm`}>
              <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                Bienvenue sur CyberForge Academy
              </h2>
              <p className={`mb-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Forgez vos compétences cyber grâce à notre plateforme d'apprentissage interactive. Explorez nos 5 parcours thématiques, relevez des défis pratiques et obtenez des certifications reconnues dans votre domaine.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                <div className={`p-4 rounded-md ${isDark ? 'bg-slate-700' : 'bg-slate-100'} flex items-center`}>
                  <Shield className={`h-8 w-8 mr-3 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                  <div>
                    <div className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>5 Parcours</div>
                    <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Spécialisés</div>
                  </div>
                </div>
                
                <div className={`p-4 rounded-md ${isDark ? 'bg-slate-700' : 'bg-slate-100'} flex items-center`}>
                  <Book className={`h-8 w-8 mr-3 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                  <div>
                    <div className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>25 Modules</div>
                    <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Interactifs</div>
                  </div>
                </div>
                
                <div className={`p-4 rounded-md ${isDark ? 'bg-slate-700' : 'bg-slate-100'} flex items-center`}>
                  <Award className={`h-8 w-8 mr-3 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                  <div>
                    <div className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>Certification</div>
                    <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Personnalisée</div>
                  </div>
                </div>
                
                <div className={`p-4 rounded-md ${isDark ? 'bg-slate-700' : 'bg-slate-100'} flex items-center`}>
                  <CheckCircle className={`h-8 w-8 mr-3 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                  <div>
                    <div className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>GPT-4o</div>
                    <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Intelligence IA</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <h3 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                Parcours d'apprentissage
              </h3>
              
              <Tabs defaultValue="grid" className="w-full">
                <div className="flex justify-between items-center mb-6">
                  <TabsList>
                    <TabsTrigger value="grid">Grille</TabsTrigger>
                    <TabsTrigger value="list">Liste</TabsTrigger>
                  </TabsList>
                  
                  <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Votre niveau global: <Badge variant="outline" className="ml-1">Débutant</Badge>
                  </div>
                </div>
                
                <TabsContent value="grid" className="m-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {learningPaths.map(path => (
                      <LearningPathCard key={path.id} path={path} />
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="list" className="m-0">
                  <div className={`rounded-lg overflow-hidden border ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                    {learningPaths.map((path, index) => (
                      <div 
                        key={path.id} 
                        className={`flex items-center p-4 ${index !== learningPaths.length - 1 ? isDark ? 'border-b border-slate-700' : 'border-b border-slate-200' : ''} ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-50'} transition-colors`}
                      >
                        <div className={`p-2 rounded-full mr-4 ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                          {path.icon}
                        </div>
                        
                        <div className="flex-1">
                          <h4 className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{path.title}</h4>
                          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{path.description}</p>
                          <div className="mt-2 flex items-center">
                            <Progress value={path.progress} className="h-1.5 flex-1 mr-2" />
                            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{path.progress}%</span>
                          </div>
                        </div>
                        
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setLocation(`/cyber/learning/module/${path.id}`)}
                          className={`ml-4 ${isDark ? 'text-slate-300 hover:text-white hover:bg-slate-700' : 'text-slate-700 hover:text-black hover:bg-slate-100'}`}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            
            <div className={`p-6 rounded-lg ${isDark ? 'bg-slate-800/90' : 'bg-white/90'} shadow-lg backdrop-blur-sm`}>
              <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                Statistiques de progression
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className={`p-4 rounded-md ${isDark ? 'bg-slate-700' : 'bg-slate-50'}`}>
                  <div className={`text-sm mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Modules terminés</div>
                  <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>0 / 25</div>
                </div>
                
                <div className={`p-4 rounded-md ${isDark ? 'bg-slate-700' : 'bg-slate-50'}`}>
                  <div className={`text-sm mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Temps d'apprentissage</div>
                  <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>0h</div>
                </div>
                
                <div className={`p-4 rounded-md ${isDark ? 'bg-slate-700' : 'bg-slate-50'}`}>
                  <div className={`text-sm mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Score moyen</div>
                  <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>0%</div>
                </div>
                
                <div className={`p-4 rounded-md ${isDark ? 'bg-slate-700' : 'bg-slate-50'}`}>
                  <div className={`text-sm mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Badges obtenus</div>
                  <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>0 / 15</div>
                </div>
              </div>
              
              <Button variant="outline" className="w-full">
                Voir votre rapport détaillé
              </Button>
            </div>
          </main>
          
          <footer className={`py-6 px-4 ${isDark ? 'bg-slate-800/80' : 'bg-white/80'} mt-12 backdrop-blur-sm`}>
            <div className="container mx-auto text-center">
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                CyberForge Academy © {new Date().getFullYear()} - Propulsé par GPT-4o | mc2i Groupe
              </p>
            </div>
          </footer>
        </div>
      </div>
    </HomeLayout>
  );
}