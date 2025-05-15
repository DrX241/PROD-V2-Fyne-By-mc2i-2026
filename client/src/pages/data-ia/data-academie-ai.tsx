import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  IoArrowBack, IoBookOutline, IoDesktopOutline, IoStatsChartOutline, 
  IoCodeSlashOutline, IoServer as IoServerOutline, IoBarChart as IoBarChartOutline,
  IoLaptop as IoLaptopOutline, IoLayers as IoLayersOutline, IoCloud as IoCloudOutline,
  IoCheckmarkCircle, IoArrowForward, IoClose, IoTrophy, IoWarning, 
  IoHelpCircle, IoPlayOutline, IoAdd, IoRefresh, IoTrash
} from 'react-icons/io5';
import { FaBrain as IoBrainOutline } from 'react-icons/fa';

// Service API pour DATA ACADÉMIE
import dataAcademieApi, { Module, ModuleContent, NewModuleRequest } from '@/services/data-academie-api';

// Types
type ModuleCategory = 'fondamentaux' | 'intelligence_artificielle' | 'sql' | 'python' | 'data_engineering';
type ModuleDifficulty = 'débutant' | 'intermédiaire' | 'avancé';

// Mapping des catégories vers des noms plus lisibles
const categoryLabels: Record<ModuleCategory, string> = {
  'fondamentaux': 'Fondamentaux',
  'intelligence_artificielle': 'IA & ML',
  'sql': 'SQL',
  'python': 'Python',
  'data_engineering': 'Data Engineering'
};

// Mapping des catégories vers des icônes
const categoryIcons: Record<ModuleCategory, React.ReactNode> = {
  'fondamentaux': <IoStatsChartOutline className="h-5 w-5" />,
  'intelligence_artificielle': <IoBrainOutline className="h-5 w-5" />,
  'sql': <IoCodeSlashOutline className="h-5 w-5" />,
  'python': <IoLaptopOutline className="h-5 w-5" />,
  'data_engineering': <IoServerOutline className="h-5 w-5" />
};

// Mapping des catégories vers des couleurs
const categoryColors: Record<ModuleCategory, string> = {
  'fondamentaux': 'blue',
  'intelligence_artificielle': 'purple',
  'sql': 'cyan',
  'python': 'blue',
  'data_engineering': 'emerald'
};

// Composant pour les modules
interface ModuleCardProps {
  module: Module;
  onClick: () => void;
  onDelete?: () => void;
  isCustom?: boolean;
}

const ModuleCard: React.FC<ModuleCardProps> = ({ module, onClick, onDelete, isCustom = false }) => {
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

  const color = categoryColors[module.category] || 'blue';
  const icon = categoryIcons[module.category] || <IoBookOutline className="h-5 w-5" />;

  return (
    <Card 
      className={`bg-gradient-to-br from-[#1a3a60]/90 to-[#152a40]/90 border ${getBorderClass(color)} hover:shadow-lg transition-all`}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-lg ${getBgClass(color)}`}>
              {icon}
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
          <div className="flex space-x-2">
            {isCustom && onDelete && (
              <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 p-0" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
                <IoTrash className="h-5 w-5" />
              </Button>
            )}
            <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 p-0" onClick={onClick}>
              <IoPlayOutline className="h-5 w-5 mr-1" /> Démarrer
            </Button>
          </div>
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
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState(0);
  const [viewMode, setViewMode] = useState<'learn' | 'quiz' | 'exercise'>('learn');
  const [quizProgress, setQuizProgress] = useState(0);
  const [quizResults, setQuizResults] = useState<boolean[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [customFeedback, setCustomFeedback] = useState<string | null>(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [exerciseProgress, setExerciseProgress] = useState(0);
  const [userCode, setUserCode] = useState('');
  const [showSolution, setShowSolution] = useState(false);
  const [moduleCompleted, setModuleCompleted] = useState(false);
  const [codeEvaluation, setCodeEvaluation] = useState<{
    isCorrect: boolean;
    score: number;
    feedback: string;
    suggestions?: string;
  } | null>(null);
  const [isEvaluatingCode, setIsEvaluatingCode] = useState(false);
  
  // Utiliser le contenu fourni par le module
  const content = module.content || {
    title: module.title,
    introduction: module.description,
    sections: [],
    quiz: []
  };
  
  const sections = content.sections || [];
  const quiz = content.quiz || [];
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
  
  const handleAnswerSubmit = async () => {
    if (selectedAnswer === null) return;
    
    const currentQuestion = quiz[quizProgress];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    const selectedOption = currentQuestion.options[selectedAnswer];
    const correctOption = currentQuestion.options[currentQuestion.correctAnswer];
    
    // Mettre à jour les résultats locaux
    setQuizResults([...quizResults, isCorrect]);
    setShowExplanation(true);
    
    // Si l'IA est disponible, demander un feedback personnalisé
    try {
      setLoadingFeedback(true);
      const feedback = await dataAcademieApi.generateQuizFeedback({
        question: currentQuestion.question,
        correctAnswer: correctOption,
        userAnswer: selectedOption,
        isCorrect
      });
      
      setCustomFeedback(feedback);
    } catch (error) {
      console.error('Erreur lors de la génération du feedback:', error);
      setCustomFeedback(null);
    } finally {
      setLoadingFeedback(false);
    }
  };
  
  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setShowExplanation(false);
    setCustomFeedback(null);
    
    if (quizProgress < quiz.length - 1) {
      setQuizProgress(quizProgress + 1);
    } else if (exercises.length > 0) {
      setViewMode('exercise');
      setUserCode(exercises[0].startingCode);
    } else {
      setModuleCompleted(true);
    }
  };
  
  const handleEvaluateCode = async () => {
    if (!exercises[exerciseProgress]) return;
    
    setIsEvaluatingCode(true);
    try {
      const evaluation = await dataAcademieApi.evaluateCode({
        instructions: exercises[exerciseProgress].instructions,
        expectedSolution: exercises[exerciseProgress].solutionCode,
        userCode
      });
      
      setCodeEvaluation(evaluation);
      
      if (evaluation.isCorrect) {
        toast({
          title: "Bravo!",
          description: "Votre solution est correcte.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'évaluation du code:', error);
      toast({
        title: "Erreur d'évaluation",
        description: "Impossible d'évaluer votre code. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsEvaluatingCode(false);
    }
  };
  
  const handleNextExercise = () => {
    if (exerciseProgress < exercises.length - 1) {
      setExerciseProgress(exerciseProgress + 1);
      setUserCode(exercises[exerciseProgress + 1].startingCode);
      setShowSolution(false);
      setCodeEvaluation(null);
    } else {
      setModuleCompleted(true);
    }
  };
  
  const getProgressPercentage = () => {
    if (viewMode === 'learn') {
      return sections.length === 0 ? 100 : ((activeSection + 1) / sections.length) * 100;
    } else if (viewMode === 'quiz') {
      return quiz.length === 0 ? 100 : ((quizProgress + 1) / quiz.length) * 100;
    } else if (viewMode === 'exercise') {
      return exercises.length === 0 ? 100 : ((exerciseProgress + 1) / exercises.length) * 100;
    }
    return 0;
  };
  
  const renderLearnMode = () => {
    if (sections.length === 0) {
      return (
        <div className="p-6 text-center">
          <IoWarning className="h-10 w-10 text-amber-500 mx-auto mb-4" />
          <p className="text-lg text-gray-300 mb-4">Aucun contenu disponible pour ce module.</p>
          <Button 
            variant="default" 
            onClick={() => setViewMode('quiz')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Passer au quiz
          </Button>
        </div>
      );
    }
    
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
          <IoWarning className="h-10 w-10 text-amber-500 mx-auto mb-4" />
          <p className="text-lg text-gray-300 mb-4">Pas de quiz disponible pour ce module.</p>
          {exercises.length > 0 ? (
            <Button 
              variant="default" 
              onClick={() => setViewMode('exercise')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Passer aux exercices
            </Button>
          ) : (
            <Button 
              variant="default" 
              onClick={() => setModuleCompleted(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Terminer le module
            </Button>
          )}
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
              
              {loadingFeedback ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
                </div>
              ) : customFeedback ? (
                <div className="text-gray-200 whitespace-pre-line">{customFeedback}</div>
              ) : (
                <p className="text-gray-200">{currentQuestion.explanation}</p>
              )}
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
          <IoWarning className="h-10 w-10 text-amber-500 mx-auto mb-4" />
          <p className="text-lg text-gray-300 mb-4">Pas d'exercices disponibles pour ce module.</p>
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
          
          {codeEvaluation && (
            <div className="mt-4 p-4 rounded-md border bg-blue-900/30 border-blue-500/30">
              <h4 className="text-lg font-medium mb-2 text-blue-300">Évaluation</h4>
              <div className="flex items-center mb-2">
                <div className="text-xl font-bold mr-2">
                  Score: <span className={codeEvaluation.score >= 80 ? "text-green-400" : codeEvaluation.score >= 50 ? "text-yellow-400" : "text-red-400"}>
                    {codeEvaluation.score}/100
                  </span>
                </div>
                {codeEvaluation.isCorrect && <IoCheckmarkCircle className="h-5 w-5 text-green-500 ml-2" />}
              </div>
              <p className="text-gray-200 mb-4">{codeEvaluation.feedback}</p>
              
              {codeEvaluation.suggestions && (
                <div className="mt-2">
                  <h5 className="font-medium text-blue-300 mb-1">Suggestions d'amélioration</h5>
                  <p className="text-gray-300">{codeEvaluation.suggestions}</p>
                </div>
              )}
            </div>
          )}
          
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
          <div className="space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setShowSolution(!showSolution)}
              className="flex items-center"
            >
              {showSolution ? 'Masquer la solution' : 'Voir la solution'}
            </Button>

            <Button 
              variant="outline" 
              onClick={handleEvaluateCode}
              disabled={isEvaluatingCode}
              className="flex items-center"
            >
              {isEvaluatingCode ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Évaluation en cours...
                </>
              ) : (
                <>
                  <IoRefresh className="mr-2 h-4 w-4" /> Évaluer mon code
                </>
              )}
            </Button>
          </div>
          
          <Button 
            variant="default" 
            onClick={handleNextExercise}
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

// Composant pour créer un nouveau module
const CreateModuleDialog: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onModuleCreated: (module: Module) => void;
}> = ({ open, onOpenChange, onModuleCreated }) => {
  const { toast } = useToast();
  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState<ModuleCategory>('fondamentaux');
  const [difficulty, setDifficulty] = useState<ModuleDifficulty>('débutant');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!topic) {
      toast({
        title: "Sujet requis",
        description: "Veuillez saisir un sujet pour le module.",
        variant: "destructive",
      });
      return;
    }
    
    setIsGenerating(true);
    try {
      const module = await dataAcademieApi.generateModule({
        topic,
        category,
        difficulty
      });
      
      if (module) {
        toast({
          title: "Module créé",
          description: `Le module "${module.title}" a été créé avec succès.`,
        });
        onModuleCreated(module);
        onOpenChange(false);
        setTopic('');
      } else {
        throw new Error("La création du module a échoué.");
      }
    } catch (error) {
      console.error('Erreur lors de la création du module:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le module. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0c1625] border border-blue-500/30 text-gray-100">
        <DialogHeader>
          <DialogTitle className="text-2xl">Créer un nouveau module</DialogTitle>
          <DialogDescription className="text-gray-400 text-base">
            Définissez le sujet et les caractéristiques du module que l'IA va générer pour vous.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="topic">Sujet du module</Label>
            <Input
              id="topic"
              placeholder="Ex: Analyse en composantes principales, Pandas pour débutants..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="bg-slate-900/60 border-slate-700 focus:border-blue-500"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Catégorie</Label>
              <Select 
                value={category} 
                onValueChange={(value) => setCategory(value as ModuleCategory)}
              >
                <SelectTrigger id="category" className="bg-slate-900/60 border-slate-700 focus:border-blue-500">
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="difficulty">Niveau de difficulté</Label>
              <Select 
                value={difficulty} 
                onValueChange={(value) => setDifficulty(value as ModuleDifficulty)}
              >
                <SelectTrigger id="difficulty" className="bg-slate-900/60 border-slate-700 focus:border-blue-500">
                  <SelectValue placeholder="Sélectionner un niveau" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  <SelectItem value="débutant">Débutant</SelectItem>
                  <SelectItem value="intermédiaire">Intermédiaire</SelectItem>
                  <SelectItem value="avancé">Avancé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter className="mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isGenerating}
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Génération en cours...
                </>
              ) : (
                <>
                  <IoAdd className="mr-2 h-4 w-4" /> Créer le module
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default function DataAcademie() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<ModuleCategory>('fondamentaux');
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [loadingModuleId, setLoadingModuleId] = useState<string | null>(null);
  
  // Charger les modules
  useEffect(() => {
    const fetchModules = async () => {
      setIsLoading(true);
      try {
        const fetchedModules = await dataAcademieApi.getModules();
        setModules(fetchedModules);
      } catch (error) {
        console.error('Erreur lors du chargement des modules:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les modules. Veuillez réessayer.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchModules();
  }, [toast]);
  
  // Filtrer les modules par catégorie active
  const filteredModules = modules.filter(module => module.category === activeTab);
  
  const handleModuleSelect = async (module: Module) => {
    // Si le module a déjà du contenu, l'afficher directement
    if (module.content) {
      setSelectedModule(module);
      return;
    }
    
    // Sinon, charger le contenu
    setLoadingModuleId(module.id);
    try {
      const fullModule = await dataAcademieApi.getModule(module.id);
      if (fullModule) {
        // Mettre à jour le module dans la liste locale
        setModules(prevModules => 
          prevModules.map(m => m.id === fullModule.id ? fullModule : m)
        );
        setSelectedModule(fullModule);
      } else {
        throw new Error("Impossible de charger le contenu du module.");
      }
    } catch (error) {
      console.error(`Erreur lors du chargement du module ${module.id}:`, error);
      toast({
        title: "Erreur",
        description: "Impossible de charger le contenu du module. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setLoadingModuleId(null);
    }
  };
  
  const handleModuleCreated = (newModule: Module) => {
    setModules(prevModules => [...prevModules, newModule]);
  };
  
  const handleDeleteModule = (moduleId: string) => {
    // En production, il faudrait appeler une API pour supprimer le module
    setModules(prevModules => prevModules.filter(m => m.id !== moduleId));
    toast({
      title: "Module supprimé",
      description: "Le module a été supprimé avec succès.",
    });
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
        <div className="flex items-center justify-between mb-6 mt-10">
          <div className="flex items-center">
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
          
          <Button
            variant="outline"
            className="border-blue-500/30 hover:bg-blue-500/10 text-blue-400"
            onClick={() => setCreateDialogOpen(true)}
          >
            <IoAdd className="mr-2 h-4 w-4" /> Créer un module
          </Button>
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
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-10 w-10 animate-spin text-blue-500 mb-4" />
                <p className="text-gray-400">Chargement des modules...</p>
              </div>
            ) : filteredModules.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredModules.map((module) => (
                  <div 
                    key={module.id}
                    onClick={() => handleModuleSelect(module)}
                    className="cursor-pointer"
                  >
                    <ModuleCard 
                      module={module}
                      onClick={() => handleModuleSelect(module)}
                      onDelete={() => handleDeleteModule(module.id)}
                      isCustom={module.id.startsWith('module-')}
                    />
                    
                    {loadingModuleId === module.id && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                        <div className="bg-slate-900 p-4 rounded-lg shadow-xl flex items-center">
                          <Loader2 className="h-5 w-5 animate-spin text-blue-500 mr-2" />
                          <span className="text-white">Chargement du contenu...</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <IoWarning className="h-12 w-12 text-amber-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Aucun module disponible</h3>
                <p className="text-gray-400 text-center max-w-md mb-4">
                  Il n'y a pas encore de modules disponibles dans cette catégorie. Créez votre premier module ou explorez d'autres catégories.
                </p>
                <Button 
                  variant="outline" 
                  className="border-blue-500/30 hover:bg-blue-500/10 text-blue-400"
                  onClick={() => setCreateDialogOpen(true)}
                >
                  <IoAdd className="mr-2 h-4 w-4" /> Créer un module
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <CreateModuleDialog 
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onModuleCreated={handleModuleCreated}
      />
    </div>
  );
}