import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  IoArrowBack, IoBookOutline, IoDesktopOutline, IoStatsChartOutline, 
  IoCodeSlashOutline, IoServer as IoServerOutline, IoBarChart as IoBarChartOutline,
  IoLaptop as IoLaptopOutline, IoLayers as IoLayersOutline, IoCloud as IoCloudOutline,
  IoCheckmarkCircle, IoArrowForward, IoClose, IoTrophy, IoWarning, 
  IoHelpCircle, IoPlayOutline
} from 'react-icons/io5';
import { FaBrain as IoBrainOutline } from 'react-icons/fa';

// Types
type ModuleDifficulty = 'débutant' | 'intermédiaire' | 'avancé';
type ModuleCategory = 'fondamentaux' | 'intelligence_artificielle' | 'sql' | 'python' | 'data_engineering';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface LessonSection {
  title: string;
  content: string;
  code?: string;
  image?: string;
}

interface ModuleContent {
  id: string;
  title: string;
  introduction: string;
  sections: LessonSection[];
  quiz: QuizQuestion[];
  codeExercises?: {
    instructions: string;
    startingCode: string;
    solutionCode: string;
  }[];
}

interface Module {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: ModuleDifficulty;
  icon: React.ReactNode;
  color: string;
  category: ModuleCategory;
  content: ModuleContent;
}

// SQL basics content example 
const sqlBasicsContent: ModuleContent = {
  id: 'sql-basics',
  title: 'Fondamentaux SQL',
  introduction: 'Ce module couvre les bases du langage SQL.',
  sections: [
    {
      title: 'Introduction aux bases de données relationnelles',
      content: 'Une base de données relationnelle organise les données en tables.'
    },
    {
      title: 'SELECT : Récupérer des données',
      content: 'La commande SELECT est utilisée pour extraire des données.',
      code: 'SELECT * FROM table;'
    }
  ],
  quiz: [
    {
      id: 'q1',
      question: 'Quelle commande SQL permet de récupérer des données?',
      options: ['GET', 'SELECT', 'FETCH', 'RETRIEVE'],
      correctAnswer: 1,
      explanation: 'La commande SELECT est utilisée pour récupérer des données.'
    }
  ],
  codeExercises: [
    {
      instructions: 'Écrivez une requête SELECT',
      startingCode: '-- Écrivez votre requête ici',
      solutionCode: 'SELECT * FROM users;'
    }
  ]
};

// Python basics content example
const pythonBasicsContent: ModuleContent = {
  id: 'python-basics',
  title: 'Python pour Data Science',
  introduction: 'Introduction à Python pour l\'analyse de données.',
  sections: [
    {
      title: 'Variables et types de données',
      content: 'Python utilise plusieurs types de données essentiels.',
      code: 'x = 10\ny = "Hello"\nz = [1, 2, 3]'
    }
  ],
  quiz: [
    {
      id: 'q1',
      question: 'Comment déclarer une liste en Python?',
      options: ['list = (1, 2, 3)', 'list = [1, 2, 3]', 'list = {1, 2, 3}', 'list = <1, 2, 3>'],
      correctAnswer: 1,
      explanation: 'En Python, les listes sont déclarées avec des crochets [].'
    }
  ]
};

// Liste des modules disponibles
const modules: Module[] = [
  {
    id: 'intro-data-science',
    title: 'Introduction à la Data Science',
    description: 'Comprendre les bases de la Data Science',
    duration: '20 min',
    difficulty: 'débutant',
    icon: <IoStatsChartOutline className="h-5 w-5" />,
    color: 'blue',
    category: 'fondamentaux',
    content: {
      id: 'intro-data-science',
      title: 'Introduction à la Data Science',
      introduction: 'Découvrez les concepts fondamentaux.',
      sections: [
        {
          title: 'Qu\'est-ce que la Data Science?',
          content: 'La Data Science est un domaine interdisciplinaire.'
        }
      ],
      quiz: [
        {
          id: 'q1',
          question: 'Quel est le principal objectif de la Data Science?',
          options: [
            'Créer des sites web',
            'Extraire des connaissances à partir des données',
            'Programmer des jeux vidéo',
            'Vendre des ordinateurs'
          ],
          correctAnswer: 1,
          explanation: 'La Data Science vise à extraire des connaissances et insights à partir des données.'
        }
      ]
    }
  },
  {
    id: 'statistical-fundamentals',
    title: 'Statistiques Fondamentales',
    description: 'Maîtriser les concepts statistiques essentiels',
    duration: '30 min',
    difficulty: 'débutant',
    icon: <IoBarChartOutline className="h-5 w-5" />,
    color: 'blue',
    category: 'fondamentaux',
    content: {
      id: 'statistical-fundamentals',
      title: 'Statistiques Fondamentales',
      introduction: 'Les statistiques sont à la base de la data science.',
      sections: [
        {
          title: 'Mesures de tendance centrale',
          content: 'Moyenne, médiane, mode...'
        }
      ],
      quiz: [
        {
          id: 'q1',
          question: 'Qu\'est-ce que la médiane?',
          options: [
            'La somme de toutes les valeurs divisée par le nombre d\'observations',
            'La valeur qui sépare les données en deux parties égales',
            'La valeur qui apparaît le plus fréquemment',
            'La différence entre la valeur maximale et minimale'
          ],
          correctAnswer: 1,
          explanation: 'La médiane est la valeur qui sépare les données en deux parties égales.'
        }
      ]
    }
  },
  {
    id: 'sql-basics',
    title: 'Fondamentaux SQL',
    description: 'Les bases du langage SQL et requêtes simples',
    duration: '30 min',
    difficulty: 'débutant',
    icon: <IoCodeSlashOutline className="h-5 w-5" />,
    color: 'cyan',
    category: 'sql',
    content: sqlBasicsContent
  },
  {
    id: 'python-data-science',
    title: 'Python pour Data Science',
    description: 'Les bases de Python orientées analyse de données',
    duration: '30 min',
    difficulty: 'débutant',
    icon: <IoCodeSlashOutline className="h-5 w-5" />,
    color: 'blue',
    category: 'python',
    content: pythonBasicsContent
  },
  {
    id: 'ml-fundamentals',
    title: 'Fondamentaux du Machine Learning',
    description: 'Les différents types d\'apprentissage automatique',
    duration: '45 min',
    difficulty: 'débutant',
    icon: <IoBrainOutline className="h-5 w-5" />,
    color: 'purple',
    category: 'intelligence_artificielle',
    content: {
      id: 'ml-fundamentals',
      title: 'Fondamentaux du Machine Learning',
      introduction: 'Introduction aux concepts de base du machine learning.',
      sections: [
        {
          title: 'Types d\'apprentissage',
          content: 'Supervisé, non supervisé, par renforcement...'
        }
      ],
      quiz: [
        {
          id: 'q1',
          question: 'Qu\'est-ce que l\'apprentissage supervisé?',
          options: [
            'Apprentissage sans exemples étiquetés',
            'Apprentissage avec des exemples étiquetés',
            'Apprentissage par essai et erreur',
            'Apprentissage sans ordinateur'
          ],
          correctAnswer: 1,
          explanation: 'L\'apprentissage supervisé utilise des exemples étiquetés pour entraîner des modèles.'
        }
      ]
    }
  }
];

// Composant pour les modules
interface ModuleCardProps {
  module: Module;
  onClick: () => void;
}

const ModuleCard: React.FC<ModuleCardProps> = ({ module, onClick }) => {
  const difficultyColorMap = {
    'débutant': 'border-green-500/50 text-green-400',
    'intermédiaire': 'border-yellow-500/50 text-yellow-400',
    'avancé': 'border-red-500/50 text-red-400'
  };
  
  // Définir les classes en fonction de la couleur
  const getBgClass = (color: string) => {
    if (color === 'blue') return 'bg-blue-500/20 text-blue-400';
    if (color === 'purple') return 'bg-purple-500/20 text-purple-400';
    if (color === 'cyan') return 'bg-cyan-500/20 text-cyan-400';
    if (color === 'emerald') return 'bg-emerald-500/20 text-emerald-400';
    return 'bg-blue-500/20 text-blue-400';
  };
  
  const getBorderClass = (color: string) => {
    if (color === 'blue') return 'border-blue-400/20 hover:border-blue-400/40';
    if (color === 'purple') return 'border-purple-400/20 hover:border-purple-400/40';
    if (color === 'cyan') return 'border-cyan-400/20 hover:border-cyan-400/40';
    if (color === 'emerald') return 'border-emerald-400/20 hover:border-emerald-400/40';
    return 'border-blue-400/20 hover:border-blue-400/40';
  };

  return (
    <Card 
      className={`bg-gradient-to-br from-[#1a3a60]/90 to-[#152a40]/90 border ${getBorderClass(module.color)} hover:shadow-lg transition-all cursor-pointer`}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-lg ${getBgClass(module.color)}`}>
              {module.icon}
            </div>
            <CardTitle className="text-xl">{module.title}</CardTitle>
          </div>
          <Badge variant="outline" className={difficultyColorMap[module.difficulty]}>
            {module.difficulty}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-gray-400 mb-4">
          {module.description}
        </CardDescription>
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center space-x-1">
            <IoBookOutline className="h-4 w-4 text-gray-500" />
            <span className="text-gray-400">{module.duration}</span>
          </div>
          <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 p-0">
            <IoPlayOutline className="h-5 w-5 mr-1" /> Démarrer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Composant pour afficher un module spécifique
const ModuleView: React.FC<{ 
  module: Module; 
  onClose: () => void; 
}> = ({ module, onClose }) => {
  const [activeSection, setActiveSection] = useState(0);
  const [viewMode, setViewMode] = useState<'learn' | 'quiz' | 'exercise'>('learn');
  const [quizProgress, setQuizProgress] = useState(0);
  const [quizResults, setQuizResults] = useState<boolean[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [exerciseProgress, setExerciseProgress] = useState(0);
  const [userCode, setUserCode] = useState('');
  const [showSolution, setShowSolution] = useState(false);
  const [moduleCompleted, setModuleCompleted] = useState(false);
  
  const content = module.content;
  const sections = content.sections;
  const quiz = content.quiz;
  const exercises = content.codeExercises || [];
  
  const handleNextSection = () => {
    if (activeSection < sections.length - 1) {
      setActiveSection(activeSection + 1);
      window.scrollTo(0, 0);
    } else {
      setViewMode('quiz');
      window.scrollTo(0, 0);
    }
  };
  
  const handlePrevSection = () => {
    if (activeSection > 0) {
      setActiveSection(activeSection - 1);
      window.scrollTo(0, 0);
    }
  };
  
  const handleAnswerSubmit = () => {
    if (selectedAnswer === null) return;
    
    const currentQuestion = quiz[quizProgress];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    
    setQuizResults([...quizResults, isCorrect]);
    setShowExplanation(true);
  };
  
  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setShowExplanation(false);
    
    if (quizProgress < quiz.length - 1) {
      setQuizProgress(quizProgress + 1);
    } else if (exercises.length > 0) {
      setViewMode('exercise');
      setUserCode(exercises[0].startingCode);
    } else {
      setModuleCompleted(true);
    }
  };
  
  const handleExerciseSubmit = () => {
    // Dans un environnement réel, on évaluerait le code ici
    if (exerciseProgress < exercises.length - 1) {
      setExerciseProgress(exerciseProgress + 1);
      setUserCode(exercises[exerciseProgress + 1].startingCode);
      setShowSolution(false);
    } else {
      setModuleCompleted(true);
    }
  };
  
  const getProgressPercentage = () => {
    if (viewMode === 'learn') {
      return ((activeSection + 1) / sections.length) * 100;
    } else if (viewMode === 'quiz') {
      return ((quizProgress + 1) / quiz.length) * 100;
    } else if (viewMode === 'exercise') {
      return ((exerciseProgress + 1) / (exercises.length || 1)) * 100;
    }
    return 0;
  };
  
  const renderLearnMode = () => {
    const section = sections[activeSection];
    
    return (
      <>
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">{section.title}</h3>
          <div className="text-gray-200 mb-6 whitespace-pre-line">
            {section.content}
          </div>
          {section.code && (
            <div className="bg-slate-800/50 p-3 rounded-md overflow-x-auto border border-blue-500/30 my-4">
              <pre className="text-xs md:text-sm font-mono text-gray-300">
                {section.code}
              </pre>
            </div>
          )}
          {section.image && (
            <div className="my-4 flex justify-center">
              <img src={section.image} alt={section.title} className="rounded-md max-w-full" />
            </div>
          )}
        </div>
        
        <div className="flex justify-between mt-6">
          <Button 
            variant="outline" 
            onClick={handlePrevSection}
            disabled={activeSection === 0}
            className="flex items-center"
          >
            <IoArrowBack className="mr-2 h-4 w-4" /> Précédent
          </Button>
          <Button 
            variant="default" 
            onClick={handleNextSection}
            className="flex items-center bg-blue-600 hover:bg-blue-700"
          >
            {activeSection < sections.length - 1 ? 'Suivant' : 'Passer au quiz'} <IoArrowForward className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </>
    );
  };
  
  const renderQuizMode = () => {
    if (quiz.length === 0) {
      return (
        <div className="p-6 text-center">
          <p className="text-lg text-gray-300">Pas de quiz disponible pour ce module.</p>
          <Button 
            variant="default" 
            onClick={() => setModuleCompleted(true)}
            className="mt-4 bg-blue-600 hover:bg-blue-700"
          >
            Terminer le module
          </Button>
        </div>
      );
    }
    
    const currentQuestion = quiz[quizProgress];
    
    return (
      <div className="mt-4">
        <h3 className="text-xl font-semibold mb-6">Question {quizProgress + 1} sur {quiz.length}</h3>
        
        <div className="bg-slate-800/50 p-5 rounded-lg border border-blue-500/20 mb-6">
          <p className="text-lg text-gray-100 mb-6">{currentQuestion.question}</p>
          
          <RadioGroup 
            value={selectedAnswer?.toString()} 
            onValueChange={(value) => setSelectedAnswer(parseInt(value))}
            disabled={showExplanation}
            className="space-y-3"
          >
            {currentQuestion.options.map((option, index) => (
              <div 
                key={index} 
                className={`flex items-center space-x-2 p-3 rounded-md ${
                  showExplanation && index === currentQuestion.correctAnswer 
                    ? 'bg-green-500/20 border border-green-500/40' 
                    : showExplanation && index === selectedAnswer
                      ? 'bg-red-500/20 border border-red-500/40'
                      : 'hover:bg-slate-700/50'
                }`}
              >
                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                <Label 
                  htmlFor={`option-${index}`} 
                  className="flex-1 cursor-pointer text-gray-200"
                >
                  {option}
                </Label>
                {showExplanation && index === currentQuestion.correctAnswer && (
                  <IoCheckmarkCircle className="h-5 w-5 text-green-500" />
                )}
              </div>
            ))}
          </RadioGroup>
          
          {showExplanation && (
            <div className="mt-6 p-4 bg-blue-900/30 border border-blue-500/40 rounded-md">
              <h4 className="text-lg font-medium mb-2 text-blue-300">Explication</h4>
              <p className="text-gray-200">{currentQuestion.explanation}</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-end mt-6">
          {!showExplanation ? (
            <Button 
              variant="default" 
              onClick={handleAnswerSubmit}
              disabled={selectedAnswer === null}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Vérifier la réponse
            </Button>
          ) : (
            <Button 
              variant="default" 
              onClick={handleNextQuestion}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {quizProgress < quiz.length - 1 ? 'Question suivante' : 
                exercises.length > 0 ? 'Passer aux exercices' : 'Terminer le module'}
            </Button>
          )}
        </div>
      </div>
    );
  };
  
  const renderExerciseMode = () => {
    if (exercises.length === 0) {
      return (
        <div className="p-6 text-center">
          <p className="text-lg text-gray-300">Pas d'exercices disponibles pour ce module.</p>
          <Button 
            variant="default" 
            onClick={() => setModuleCompleted(true)}
            className="mt-4 bg-blue-600 hover:bg-blue-700"
          >
            Terminer le module
          </Button>
        </div>
      );
    }
    
    const currentExercise = exercises[exerciseProgress];
    
    return (
      <div className="mt-4">
        <h3 className="text-xl font-semibold mb-4">Exercice {exerciseProgress + 1} sur {exercises.length}</h3>
        
        <div className="bg-slate-800/50 p-5 rounded-lg border border-blue-500/20 mb-6">
          <div className="mb-4 text-gray-100">
            <h4 className="text-lg font-medium mb-2">Instructions</h4>
            <p className="whitespace-pre-line">{currentExercise.instructions}</p>
          </div>
          
          <div className="mb-4">
            <h4 className="text-lg font-medium mb-2 text-gray-100">Votre code</h4>
            <div className="bg-slate-900/80 p-3 rounded-md overflow-x-auto border border-slate-700">
              <textarea
                value={userCode}
                onChange={(e) => setUserCode(e.target.value)}
                className="w-full min-h-[200px] bg-transparent text-sm font-mono text-gray-200 outline-none resize-y"
              />
            </div>
          </div>
          
          {showSolution && (
            <div className="mt-6">
              <h4 className="text-lg font-medium mb-2 text-blue-300">Solution</h4>
              <div className="bg-slate-900/80 p-3 rounded-md overflow-x-auto border border-blue-500/30">
                <pre className="text-xs md:text-sm font-mono text-gray-300">
                  {currentExercise.solutionCode}
                </pre>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-between mt-6">
          <Button 
            variant="outline" 
            onClick={() => setShowSolution(!showSolution)}
            className="flex items-center"
          >
            {showSolution ? 'Masquer la solution' : 'Voir la solution'}
          </Button>
          <Button 
            variant="default" 
            onClick={handleExerciseSubmit}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {exerciseProgress < exercises.length - 1 ? 'Exercice suivant' : 'Terminer le module'}
          </Button>
        </div>
      </div>
    );
  };
  
  return (
    <div className="bg-gradient-to-b from-[#0c1625] to-[#0a1525] min-h-screen">
      <div className="container mx-auto px-4 py-6 max-w-screen-xl">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="mr-2 hover:bg-red-500/10"
              onClick={onClose}
            >
              <IoClose className="mr-1 h-4 w-4" /> Fermer
            </Button>
            <h2 className="text-2xl font-bold text-gradient bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {content.title}
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'learn' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('learn')}
              className={viewMode === 'learn' ? 'bg-blue-600 hover:bg-blue-700' : ''}
            >
              <IoBookOutline className="mr-1 h-4 w-4" /> Apprendre
            </Button>
            <Button
              variant={viewMode === 'quiz' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('quiz')}
              disabled={sections.length === 0}
              className={viewMode === 'quiz' ? 'bg-blue-600 hover:bg-blue-700' : ''}
            >
              <IoHelpCircle className="mr-1 h-4 w-4" /> Quiz
            </Button>
            {exercises.length > 0 && (
              <Button
                variant={viewMode === 'exercise' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('exercise')}
                className={viewMode === 'exercise' ? 'bg-blue-600 hover:bg-blue-700' : ''}
              >
                <IoCodeSlashOutline className="mr-1 h-4 w-4" /> Exercices
              </Button>
            )}
          </div>
        </div>
        
        <div className="mb-6">
          <Progress value={getProgressPercentage()} className="h-2" />
        </div>
        
        <div className="bg-[#0c1625]/90 border border-blue-500/20 rounded-lg p-6 mb-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">{content.title}</h2>
            <p className="text-gray-300">{content.introduction}</p>
          </div>
          
          <Separator className="my-6" />
          
          {viewMode === 'learn' && renderLearnMode()}
          {viewMode === 'quiz' && renderQuizMode()}
          {viewMode === 'exercise' && renderExerciseMode()}
        </div>
      </div>
      
      {/* Modal de fin de module */}
      <Dialog open={moduleCompleted} onOpenChange={setModuleCompleted}>
        <DialogContent className="bg-[#0c1625] border border-blue-500/30 text-gray-100">
          <DialogHeader>
            <DialogTitle className="text-2xl">🎉 Module terminé !</DialogTitle>
            <DialogDescription className="text-gray-400 text-base">
              Félicitations ! Vous avez complété le module {content.title}.
            </DialogDescription>
          </DialogHeader>
          
          {quizResults.length > 0 && (
            <div className="my-4">
              <h4 className="font-semibold text-lg mb-2">Résultats du quiz</h4>
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="text-4xl font-bold text-blue-400">
                  {quizResults.filter(Boolean).length}
                </div>
                <div className="text-xl text-gray-400">/ {quizResults.length}</div>
              </div>
              
              <Progress 
                value={(quizResults.filter(Boolean).length / quizResults.length) * 100} 
                className="h-3 mb-2"
              />
              
              <p className="text-center text-gray-300 mt-2">
                {quizResults.filter(Boolean).length === quizResults.length 
                  ? "Excellent ! Vous avez répondu correctement à toutes les questions." 
                  : `Vous avez répondu correctement à ${quizResults.filter(Boolean).length} question${quizResults.filter(Boolean).length > 1 ? 's' : ''} sur ${quizResults.length}.`}
              </p>
            </div>
          )}
          
          <DialogFooter className="flex sm:justify-between mt-6">
            <Button variant="outline" onClick={onClose}>
              <IoArrowBack className="mr-2 h-4 w-4" /> Retour aux modules
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={onClose}>
              <IoTrophy className="mr-2 h-4 w-4" /> Continuer votre parcours
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default function DataAcademie() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<ModuleCategory>('fondamentaux');
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  
  // Filtrer les modules par catégorie active
  const filteredModules = modules.filter(module => module.category === activeTab);
  
  const handleModuleSelect = (module: Module) => {
    setSelectedModule(module);
  };
  
  const handleCloseModule = () => {
    setSelectedModule(null);
  };
  
  if (selectedModule) {
    return <ModuleView module={selectedModule} onClose={handleCloseModule} />;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050c15] to-[#0a1525]">
      <div className="container mx-auto px-4 py-6 max-w-screen-xl">
        <div className="flex items-center mb-6 mt-10">
          <Button
            variant="ghost"
            size="sm"
            className="mr-2 hover:bg-blue-500/10"
            onClick={() => setLocation('/data-ia')}
          >
            <IoArrowBack className="mr-1 h-4 w-4" /> Retour
          </Button>
          <h1 className="text-3xl font-bold text-gradient bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            DATA ACADÉMIE
          </h1>
        </div>
        
        <div className="rounded-lg border bg-[#0c1625]/80 backdrop-blur-sm border-blue-500/20">
          <div className="p-4 border-b border-gray-700">
            <Tabs 
              defaultValue={activeTab} 
              onValueChange={(value) => setActiveTab(value as ModuleCategory)} 
              className="w-full"
            >
              <TabsList className="grid grid-cols-5 w-full bg-gray-900/50">
                <TabsTrigger value="fondamentaux" className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-400">
                  Fondamentaux
                </TabsTrigger>
                <TabsTrigger value="intelligence_artificielle" className="data-[state=active]:bg-purple-600/20 data-[state=active]:text-purple-400">
                  IA & ML
                </TabsTrigger>
                <TabsTrigger value="sql" className="data-[state=active]:bg-cyan-600/20 data-[state=active]:text-cyan-400">
                  SQL
                </TabsTrigger>
                <TabsTrigger value="python" className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-400">
                  Python
                </TabsTrigger>
                <TabsTrigger value="data_engineering" className="data-[state=active]:bg-emerald-600/20 data-[state=active]:text-emerald-400">
                  Data Engineering
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="p-4">
            {filteredModules.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredModules.map((module) => (
                  <ModuleCard 
                    key={module.id}
                    module={module}
                    onClick={() => handleModuleSelect(module)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <IoWarning className="h-12 w-12 text-amber-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Aucun module disponible</h3>
                <p className="text-gray-400 text-center max-w-md">
                  Il n'y a pas encore de modules disponibles dans cette catégorie. Veuillez revenir plus tard ou explorer d'autres catégories.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}